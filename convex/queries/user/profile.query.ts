// convex/queries/user/profile.query.ts
// Thin wrapper exposing the profile lookup handler to Convex client callers.

import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { getByUserIdHandler } from '../../functions/user/profile.funcs'

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await getByUserIdHandler(ctx, userId)
  },
})
