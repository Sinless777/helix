// convex/mutations/oauth/state.mutation.ts
// Creates OAuth state documents to protect against CSRF.

import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { createOAuthState, consumeOAuthState } from '../../functions/oauth/state.funcs'

export const create = mutation({
  args: {
    provider: v.string(),
    redirectTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Authentication required')
    const payload: { provider: string; userId: string; redirectTo?: string } = {
      provider: args.provider,
      userId: identity.subject,
    }
    if (args.redirectTo) payload.redirectTo = args.redirectTo
    return await createOAuthState(ctx, payload)
  },
})

export const verify = mutation({
  args: {
    provider: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    return await consumeOAuthState(ctx, args)
  },
})
