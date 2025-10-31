import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  userId: v.string(),
  encryptedSettings: v.string(),
  iv: v.optional(v.string()),
  version: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index('by_userId', ['userId']);
