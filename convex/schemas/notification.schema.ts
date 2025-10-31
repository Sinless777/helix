import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineTable({
  userId: v.string(),
  title: v.string(),
  message: v.string(),
  createdAt: v.number(),
  read: v.boolean(),
  metadata: v.optional(v.record(v.string(), v.any())),
}).index('by_userId_unread', ['userId', 'read']);
