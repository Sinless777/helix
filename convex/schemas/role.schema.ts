// convex/schemas/role.schema.ts
// Stores the effective role assigned to a given Clerk user. Each user should
// have at most one entry; indexes enforce quick lookups.

import { defineTable } from 'convex/server';
import { v } from 'convex/values';

const roleLiteral = v.union(
  v.literal('owner'),
  v.literal('developer'),
  v.literal('admin'),
  v.literal('moderator'),
  v.literal('user')
);

export default defineTable({
  userId: v.string(),
  role: roleLiteral,
  assignedBy: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_userId', ['userId'])
  .index('by_role', ['role', 'userId']);
