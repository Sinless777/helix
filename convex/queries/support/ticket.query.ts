// convex/queries/support/ticket.query.ts
// Public ticket queries for dashboards and user history.

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { list as listTickets } from '../../functions/support/ticket.funcs';

// Allowed elevated roles for "all" access or cross-user access:
const ELEVATED_ROLES = ['owner', 'developer', 'admin', 'moderator'] as const;
type ElevatedRole = (typeof ELEVATED_ROLES)[number];

async function getRequesterRole(ctx: any, userId: string): Promise<string | null> {
  const profile = await ctx.db
    .query('profiles')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique();

  return (profile?.role as string | null) ?? null;
}

export const list = query({
  args: {
    requesterId: v.string(),                             // the user making the request
    scope: v.union(v.literal('mine'), v.literal('all')), // 'mine' or 'all'
    targetUserId: v.optional(v.string()),                // only for scope='all'
    status: v.optional(
      v.union(
        v.literal('OPEN'),
        v.literal('IN_PROGRESS'),
        v.literal('RESOLVED'),
        v.literal('CLOSED'),
        v.literal('ESCALATED'),
      ),
    ),
    category: v.optional(
      v.union(
        v.literal('BUG'),
        v.literal('FEATURE_REQUEST'),
        v.literal('OTHER'),
      ),
    ),
    limit: v.optional(v.number()), // pagination size (handled in funcs)
    // NOTE: removed 'after' because current listTickets implementation does not use a cursor
  },
  handler: async (ctx, args) => {
    if (args.scope === 'all') {
      const role = await getRequesterRole(ctx, args.requesterId);
      if (!role || !ELEVATED_ROLES.includes(role as ElevatedRole)) {
        throw new Error('Insufficient permissions to list all tickets');
      }
    }

    const payload: Parameters<typeof listTickets>[1] = {
      requesterId: args.requesterId,
      scope: args.scope,
    };

    if (args.targetUserId !== undefined) payload.targetUserId = args.targetUserId;
    if (args.status !== undefined) payload.status = args.status;
    if (args.category !== undefined) payload.category = args.category;
    if (args.limit !== undefined) payload.limit = args.limit;

    return await listTickets(ctx, payload);
  },
});

export const getById = query({
  args: {
    ticketId: v.string(),     // external ticket id stored in tickets.id
    requesterId: v.string(),  // requester for access control
  },
  handler: async (ctx, { ticketId, requesterId }) => {
    // Fetch the ticket by external id via your unique index 'by_ticketId'
    const ticket = await ctx.db
      .query('tickets')
      .withIndex('by_ticketId', (q: any) => q.eq('id', ticketId))
      .unique();

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // If requester is not the ticket owner, ensure elevated role
    if (ticket.userId !== requesterId) {
      const role = await getRequesterRole(ctx, requesterId);
      if (!role || !ELEVATED_ROLES.includes(role as ElevatedRole)) {
        throw new Error('Insufficient permissions to view this ticket');
      }
    }

    return ticket;
  },
});
