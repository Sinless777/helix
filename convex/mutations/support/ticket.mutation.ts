// convex/mutations/support/ticket.mutation.ts
// Ticket mutations exposed to clients.

import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { createTicket, updateTicket } from '../../functions/support/ticket.funcs'

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await createTicket(ctx, args)
  },
})

export const update = mutation({
  args: {
    ticketId: v.string(),
    status: v.optional(
      v.union(
        v.literal('OPEN'),
        v.literal('IN_PROGRESS'),
        v.literal('RESOLVED'),
        v.literal('CLOSED'),
        v.literal('ESCALATED'),
      ),
    ),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const payload: {
      ticketId: string
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED'
      title?: string
      description?: string
      assigneeId?: string | null
    } = { ticketId: args.ticketId }

    if (args.status !== undefined) payload.status = args.status
    if (args.title !== undefined) payload.title = args.title
    if (args.description !== undefined) payload.description = args.description
    if (args.assigneeId !== undefined) payload.assigneeId = args.assigneeId

    return await updateTicket(ctx, payload)
  },
})
