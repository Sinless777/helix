import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineTable({
  email: v.string(),                 // normalized lower-case email
  date: v.string(),                  // YYYY-MM-DD (UTC slice)
  time: v.string(),                  // HH:mm:ss (UTC slice)
  userId: v.union(v.string(), v.null()),
  createdAt: v.number(),             // ms since epoch (Date.now())
})
  .index('by_email', ['email'])
  .index('by_createdAt', ['createdAt'])
