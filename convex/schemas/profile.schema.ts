import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  userId: v.string(),
  encryptedPayload: v.string(),
  iv: v.string(),
  version: v.optional(v.number()),
  features: v.optional(v.array(v.string())),
  isPaid: v.optional(v.boolean()),
  subscriptionPlan: v.optional(v.string()),
  settingsId: v.optional(v.id('settings')),
  role: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index('by_userId', ['userId']);
