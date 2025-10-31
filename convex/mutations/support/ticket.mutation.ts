// convex/mutations/support/ticket.mutation.ts
// Ticket mutations exposed to clients.

import { v } from 'convex/values';

import { mutation } from '../../_generated/server';
import { createTicket, updateTicket } from '../../functions/support/ticket.funcs';

// Allowed statuses: make sure this matches your constants
const statusEnum = v.union(
  v.literal('OPEN'),
  v.literal('IN_PROGRESS'),
  v.literal('RESOLVED'),
  v.literal('CLOSED'),
  v.literal('ESCALATED')
);

// Allowed categories: ensure they match schema/category union
const categoryEnum = v.union(
  v.literal('BUG'),
  v.literal('FEATURE_REQUEST'),
  v.literal('OTHER')
  // add further categories here
);

export const create = mutation({
  args: {
    requesterId: v.string(),
    title: v.string(),
    description: v.string(),
    category: categoryEnum,
  },
  handler: async (ctx, args) => {
    return await createTicket(ctx, {
      requesterId: args.requesterId,
      title: args.title,
      description: args.description,
      category: args.category,
    });
  },
});

export const update = mutation({
  args: {
    requesterId: v.string(),
    ticketId: v.string(),
    status: v.optional(statusEnum),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.union(v.string(), v.null())),
    category: v.optional(categoryEnum),
  },
  handler: async (ctx, args) => {
    const payload: Parameters<typeof updateTicket>[1] = {
      requesterId: args.requesterId,
      ticketId: args.ticketId,
    };

    if (args.status !== undefined) payload.status = args.status;
    if (args.title !== undefined) payload.title = args.title;
    if (args.description !== undefined) payload.description = args.description;
    if (args.assigneeId !== undefined) payload.assigneeId = args.assigneeId;
    if (args.category !== undefined) payload.category = args.category;

    return await updateTicket(ctx, payload);
  },
});
