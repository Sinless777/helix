// convex/functions/support/ticket.funcs.ts
// Shared ticket logic for Helix: create, update, list tickets, plus GitHub escalation.

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import { ticketStatuses, type TicketStatus } from '../../../content/constants/tickets';
import { roleRank, type Role } from '../../../content/constants/roles';

type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'OTHER';

type TicketDoc = Doc<'tickets'> & {
  /** Custom external ID required by your schema & indexes */
  id: string;
  userId: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  assigneeId?: string;
  createdAt: number;
  updatedAt: number;
};

type ProfileDoc = Doc<'profiles'> & {
  userId: string;
  features?: string[];
  role?: Role | string | null;
};

const STATUS_SET = new Set<TicketStatus>(ticketStatuses);
const GITHUB_REPO = 'Sinless777/helix'; // owner/repo
const DEFAULT_ROLE: Role = 'user';

function assertStatus(status: string): asserts status is TicketStatus {
  if (!STATUS_SET.has(status as TicketStatus)) {
    throw new Error(`Invalid ticket status: ${status}`);
  }
}

async function fetchProfileDoc(ctx: QueryCtx | MutationCtx, userId: string): Promise<ProfileDoc | null> {
  const doc = await ctx.db
    .query('profiles')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .unique();
  return doc as ProfileDoc | null;
}

function normalizeRole(value?: string | null): Role {
  if (!value) return DEFAULT_ROLE;
  if (value in roleRank) return value as Role;
  return DEFAULT_ROLE;
}

function isModeratorOrAbove(role: Role): boolean {
  return roleRank[role] >= roleRank['moderator'];
}

/** Create a short, unique external ticket id for your schema's `id` field */
function newExternalTicketId(): string {
  // Example: t_mbe0y3d2_z9x3k1
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createTicket(
  ctx: MutationCtx,
  args: { requesterId: string; title: string; description: string; category: TicketCategory }
): Promise<TicketDoc> {
  const profile = await fetchProfileDoc(ctx, args.requesterId);
  const role = normalizeRole(profile?.role);
  const features = profile?.features ?? [];
  const hasFeature = features.includes('ticket_system');
  const canModerate = isModeratorOrAbove(role);

  if (!hasFeature && !canModerate) {
    throw new Error('Ticket system feature is not enabled for this account');
  }

  const title = args.title.trim();
  const description = args.description.trim();
  const category = args.category; // already strongly typed
  if (!title) throw new Error('Title is required');
  if (!description) throw new Error('Description is required');

  const now = Date.now();
  const externalId = newExternalTicketId();

  // Insert document – your schema requires a string `id` field.
  const insertedId = await ctx.db.insert('tickets', {
    id: externalId,
    userId: args.requesterId,
    title,
    description,
    category,
    status: 'OPEN' as TicketStatus,
    createdAt: now,
    updatedAt: now,
  });

  const ticketDoc = await ctx.db.get(insertedId);
  if (!ticketDoc) {
    throw new Error('Failed to create ticket');
  }
  return ticketDoc as TicketDoc;
}

export async function updateTicket(
  ctx: MutationCtx,
  args: {
    requesterId: string;
    /** This is the external string id stored in `tickets.id` (NOT the Convex _id) */
    ticketId: string;
    status?: TicketStatus;
    title?: string;
    description?: string;
    assigneeId?: string | null;
    category?: TicketCategory;
  }
): Promise<TicketDoc> {
  const profile = await fetchProfileDoc(ctx, args.requesterId);
  const role = normalizeRole(profile?.role);
  const canModerate = isModeratorOrAbove(role);

  // Fetch by your unique index "by_ticketId" on field "id"
  const ticketDoc = await ctx.db
    .query('tickets')
    .withIndex('by_ticketId', (q) => q.eq('id', args.ticketId))
    .unique();

  if (!ticketDoc) {
    throw new Error('Ticket not found');
  }
  const ticket = ticketDoc as TicketDoc;

  // Owner or moderator+ can update
  if (ticket.userId !== args.requesterId && !canModerate) {
    throw new Error('Insufficient permissions to update ticket');
  }

  const patch: Partial<TicketDoc> = {};

  if (args.title !== undefined) {
    const trimmed = args.title.trim();
    if (!trimmed) throw new Error('Title cannot be blank');
    patch.title = trimmed;
  }
  if (args.description !== undefined) {
    const trimmed = args.description.trim();
    if (!trimmed) throw new Error('Description cannot be blank');
    patch.description = trimmed;
  }
  if (args.category !== undefined) {
    patch.category = args.category; // already typed as TicketCategory
  }
  if (args.status !== undefined) {
    if (!canModerate && args.status !== ticket.status) {
      throw new Error('You are not allowed to change ticket status');
    }
    assertStatus(args.status);
    patch.status = args.status;
  }
  if (args.assigneeId !== undefined) {
    if (!canModerate) {
      throw new Error('You are not allowed to modify the assignee');
    }
    if (args.assigneeId === null) {
      delete (patch as any).assigneeId;
    } else {
      patch.assigneeId = args.assigneeId;
    }
  }

  patch.updatedAt = Date.now();

  await ctx.db.patch(ticket._id, patch);

  const updatedDoc = await ctx.db.get(ticket._id);
  if (!updatedDoc) {
    throw new Error('Failed to fetch updated ticket');
  }
  const updated = updatedDoc as TicketDoc;

  if (patch.status === 'ESCALATED') {
    await maybeEscalateToGithub(updated);
  }

  return updated;
}

export async function list(
  ctx: QueryCtx,
  args: {
    requesterId: string;
    scope: 'mine' | 'all';
    targetUserId?: string;
    status?: TicketStatus;
    category?: TicketCategory;
    limit?: number;
  }
): Promise<TicketDoc[]> {
  const profile = await fetchProfileDoc(ctx, args.requesterId);
  const role = normalizeRole(profile?.role);
  const canModerate = isModeratorOrAbove(role);

  if (args.scope === 'all' && !canModerate) {
    throw new Error('Insufficient permissions to list all tickets');
  }

  const take = Math.max(1, Math.min(args.limit ?? 50, 200));

  // Always end up with a query that supports .collect()
  // Choose the most selective usable index first; fallback to fullTableScan when needed.
  const qi = ctx.db.query('tickets');

  let q:
    | ReturnType<typeof qi.withIndex>
    | ReturnType<typeof qi.fullTableScan>;

  if (args.scope === 'mine') {
    // Primary index: by_userId
    q = qi.withIndex('by_userId', (qb) => qb.eq('userId', args.requesterId));
  } else if (args.targetUserId) {
    q = qi.withIndex('by_userId', (qb) => qb.eq('userId', args.targetUserId as string));
  } else if (args.status !== undefined) {
    q = qi.withIndex('by_status', (qb) => qb.eq('status', args.status as TicketStatus));
  } else if (args.category !== undefined) {
    q = qi.withIndex('by_category', (qb) => qb.eq('category', args.category as TicketCategory));
  } else {
    // No selective filter available — fall back to full table scan.
    q = qi.fullTableScan();
  }

  const docs = (await q.collect()) as TicketDoc[];

  // Apply any remaining filters in-memory (safe & simple; pagination can be added later if needed)
  const filtered = docs
    .filter((t) => (args.status ? t.status === args.status : true))
    .filter((t) => (args.category ? t.category === args.category : true))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, take);

  return filtered;
}

async function maybeEscalateToGithub(ticket: TicketDoc): Promise<void> {
  if (ticket.status !== 'ESCALATED') return;
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) {
    console.warn('[tickets] GITHUB_ACCESS_TOKEN not configured; skipping GitHub escalation');
    return;
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/issues`;
  const issueTitle = `[Ticket Escalation] ${ticket.title}`;
  const issueBody = [
    `**Ticket ID:** ${ticket.id}`, // external id from your schema
    `**User ID:** ${ticket.userId}`,
    `**Status:** ${ticket.status}`,
    `**Category:** ${ticket.category}`,
    '',
    ticket.description,
  ].join('\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: issueTitle, body: issueBody }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(`[tickets] Failed to create GitHub issue: ${response.status} ${text}`);
    }
  } catch (error) {
    console.error('[tickets] Error creating GitHub issue', error);
  }
}
