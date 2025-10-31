// convex/schemas/ticket.schema.ts
// Support ticket storage backing Helix’s help-desk flows.

import { defineTable } from 'convex/server';
import { v } from 'convex/values';

const statusLiteral = v.union(
  v.literal('OPEN'),
  v.literal('IN_PROGRESS'),
  v.literal('RESOLVED'),
  v.literal('CLOSED'),
  v.literal('ESCALATED')
);

const categoryLiteral = v.union(
  v.literal('BUG'),
  v.literal('FEATURE_REQUEST'),
  v.literal('OTHER')
  // add more categories here as needed: e.g. 'ACCOUNT', 'BILLING', 'INTEGRATION'
);

export default defineTable({
  id: v.string(),
  userId: v.string(),
  title: v.string(),
  description: v.string(),
  category: categoryLiteral,
  status: statusLiteral,
  assigneeId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_ticketId', ['id'])
  .index('by_userId', ['userId', 'createdAt'])
  .index('by_status', ['status', 'createdAt'])
  .index('by_category', ['category', 'createdAt'])
  .index('by_assigneeId', ['assigneeId', 'updatedAt']);
