import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { addHandler } from '../../functions/user/waitlist.funcs'

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
    return await addHandler(ctx as any, args)
  },
})
