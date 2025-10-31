// app/api/V1/support/ticket/route.ts
// REST surface wrapping Convex ticket operations with Clerk authentication.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { convexMutation, convexQuery } from '@/lib/convex';
import { roleRank, type Role } from '@/content/constants/roles';
import { getProfile } from '@/lib/users/profile';
import type { SupportTicket } from '@/types/support';

// -----------------------------
// Type guards
// -----------------------------
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'OTHER';

const STATUS_SET = new Set<TicketStatus>([
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'ESCALATED',
]);

const CATEGORY_SET = new Set<TicketCategory>(['BUG', 'FEATURE_REQUEST', 'OTHER']);

function isTicketStatus(x: unknown): x is TicketStatus {
  return typeof x === 'string' && STATUS_SET.has(x as TicketStatus);
}
function isTicketCategory(x: unknown): x is TicketCategory {
  return typeof x === 'string' && CATEGORY_SET.has(x as TicketCategory);
}

// -----------------------------
// Helpers
// -----------------------------
function normalizeRole(value?: string | null): Role {
  if (!value) return 'user';
  return (value as Role) in roleRank ? (value as Role) : 'user';
}

function parseLimit(raw: string | null | undefined, fallback = 50): number {
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(Math.trunc(n), 200));
}

// -----------------------------
// GET /api/V1/support/ticket
// List tickets (own by default; moderators can list all or filter by userId)
// Query params:
//   status?: TicketStatus
//   category?: TicketCategory   (used server-side; not returned on SupportTicket)
//   userId?: string            (mods only)
//   limit?: number             (1..200, default 50)
// -----------------------------
export async function GET(request: NextRequest) {
  const authResult = await auth().catch(() => ({ userId: null }));
  const userId = authResult?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(userId);
  const role = normalizeRole(profile.role);
  const canModerate = roleRank[role] >= roleRank.moderator;

  const params = request.nextUrl.searchParams;

  const statusParam = params.get('status');
  const status = isTicketStatus(statusParam) ? statusParam : undefined;

  const categoryParam = params.get('category');
  const category = isTicketCategory(categoryParam) ? categoryParam : undefined;

  const targetUser =
    canModerate && params.has('userId') ? params.get('userId') ?? undefined : undefined;

  const limit = parseLimit(params.get('limit'));

  const rawTickets = await convexQuery<any[]>('ticket:list', {
    requesterId: userId,
    scope: canModerate ? 'all' : 'mine',
    targetUserId: targetUser,
    status,
    category,
    limit,
  });

  // Return shape must match your SupportTicket type (which does NOT include `category`)
  const tickets: SupportTicket[] = (rawTickets ?? []).map((t) => ({
    id: t.id,
    userId: t.userId,
    title: t.title,
    description: t.description,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    assigneeId: t.assigneeId ?? null,
  }));

  const res = NextResponse.json({ tickets, role, canModerate });
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('Vary', 'Authorization, Cookie');
  return res;
}

// -----------------------------
// POST /api/V1/support/ticket
// Create a new ticket (requires ticket_system feature or moderator role)
// Body: { title: string, description: string, category: TicketCategory }
// -----------------------------
export async function POST(request: NextRequest) {
  const authResult = await auth().catch(() => ({ userId: null }));
  const userId = authResult?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    category?: string;
  };

  const title = (body.title ?? '').trim();
  const description = (body.description ?? '').trim();
  const category = body.category && isTicketCategory(body.category) ? body.category : undefined;

  if (!title || !description) {
    return NextResponse.json(
      { error: 'Title and description are required.' },
      { status: 400 },
    );
  }
  if (!category) {
    return NextResponse.json(
      { error: 'Category must be one of BUG, FEATURE_REQUEST, OTHER.' },
      { status: 400 },
    );
  }

  const profile = await getProfile(userId);
  const role = normalizeRole(profile.role);
  const features = profile.features ?? [];
  const hasFeature = features.includes('ticket_system');
  const canModerate = roleRank[role] >= roleRank.moderator;

  if (!hasFeature && !canModerate) {
    return NextResponse.json(
      { error: 'Ticket system is not enabled for this account.' },
      { status: 403 },
    );
  }

  try {
    const ticketDoc = await convexMutation<any>('ticket:create', {
      requesterId: userId,
      title,
      description,
      category, // pass to Convex; not included in SupportTicket response type
    });

    // Return shape must match your SupportTicket type (no `category`)
    const ticket: SupportTicket = {
      id: ticketDoc.id,
      userId: ticketDoc.userId,
      title: ticketDoc.title,
      description: ticketDoc.description,
      status: ticketDoc.status,
      createdAt: ticketDoc.createdAt,
      updatedAt: ticketDoc.updatedAt,
      assigneeId: ticketDoc.assigneeId ?? null,
    };

    const res = NextResponse.json({ ticket });
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('Vary', 'Authorization, Cookie');
    return res;
  } catch (error) {
    console.error('[support] failed to create ticket', error);
    return NextResponse.json({ error: 'Unable to create ticket.' }, { status: 500 });
  }
}
