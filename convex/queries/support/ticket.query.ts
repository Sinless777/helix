// convex/queries/support/ticket.query.ts
// Public ticket queries for dashboards and user history.

import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { getTicketById, listTickets } from '../../functions/support/ticket.funcs'

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('OPEN'),
        v.literal('IN_PROGRESS'),
        v.literal('RESOLVED'),
        v.literal('CLOSED'),
        v.literal('ESCALATED'),
      ),
    ),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const filters: { status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED'; userId?: string } = {}
    if (args.status !== undefined) filters.status = args.status
    if (args.userId !== undefined) filters.userId = args.userId
    return await listTickets(ctx, filters)
  },
})

export const getById = query({
  args: { ticketId: v.string() },
  handler: async (ctx, { ticketId }) => {
    return await getTicketById(ctx, ticketId)
  },
})
