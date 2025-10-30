// convex/waitlist.ts (moved from convex/user/waitlist.mutation.ts)
import { mutation } from './_generated/server'
import { v } from 'convex/values'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export const add = mutation({
  args: {
    email: v.string(),
    // Optional to keep compatibility with existing callers;
    // server will fill these if not provided.
    date: v.optional(v.string()), // YYYY-MM-DD (UTC)
    time: v.optional(v.string()), // HH:mm:ss (UTC)
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) {
      throw new Error('Invalid email')
    }

    // Idempotency: if already on the waitlist, return the existing id
    const existing = await ctx.db
      .query('waitlist')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()
    if (existing) {
      return { id: existing._id, created: false }
    }

    // Server-side timestamp (UTC)
    const now = new Date()
    const date = args.date ?? now.toISOString().slice(0, 10) // YYYY-MM-DD
    const time = args.time ?? now.toISOString().slice(11, 19) // HH:mm:ss

    const docId = await ctx.db.insert('waitlist', {
      email,
      date,
      time,
      userId: args.userId ?? null,
      createdAt: Date.now(),
    })

    return { id: docId, created: true }
  },
})
