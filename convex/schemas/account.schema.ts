// convex/schemas/account.schema.ts
// Table storing external accounts a user links to Helix. Each entry represents
// a single provider connection and keeps metadata needed to render management
// links as well as audit timestamps.

import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  userId: v.string(),
  provider: v.string(),
  accountId: v.string(),
  displayName: v.string(),
  managementUrl: v.optional(v.string()),
  status: v.optional(v.string()),
  connectedAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_userId', ['userId'])
  .index('by_user_provider', ['userId', 'provider', 'accountId']);
