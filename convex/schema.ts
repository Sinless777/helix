// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),                 // normalized lower-case email
    date: v.string(),                  // YYYY-MM-DD (UTC slice)
    time: v.string(),                  // HH:mm:ss (UTC slice)
    userId: v.union(v.string(), v.null()),
    createdAt: v.number(),             // ms since epoch (Date.now())
  })
    .index('by_email', ['email'])
    .index('by_createdAt', ['createdAt']),

  // New Profiles Table
  profiles: defineTable({
    // Required foreign key to your auth system user id (e.g., Clerk userId)
    userId: v.string(),

    // Encrypted payload (Base64-encoded AES-GCM ciphertext) plus IV and tag
    encryptedPayload: v.string(),
    iv: v.string(),
    version: v.optional(v.number()),

    // Timestamps (kept in plaintext for efficient queries)
    createdAt: v.number(), // Date.now()
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),
})
