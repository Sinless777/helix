// convex/schemas/oauthState.schema.ts
// Temporary OAuth state storage to validate callback integrity.

import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  state: v.string(),
  provider: v.string(),
  userId: v.string(),
  redirectTo: v.optional(v.string()),
  createdAt: v.number(),
}).index('by_state', ['state']);
