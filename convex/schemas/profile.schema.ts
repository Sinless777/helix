import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineTable({
  // Required foreign key to your auth system user id (e.g., Clerk userId)
  userId: v.string(),

  // Encrypted payload (Base64-encoded AES-GCM ciphertext) plus IV and tag
  encryptedPayload: v.string(),
  iv: v.optional(v.string()),
  version: v.optional(v.number()),

  // Timestamps (kept in plaintext for efficient queries)
  createdAt: v.number(), // Date.now()
  updatedAt: v.number(),
}).index('by_userId', ['userId'])
