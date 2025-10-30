import { query, QueryCtx } from '../_generated/server'
import { v } from 'convex/values'
import { getByUserIdHandler } from '../functions/profile.funcs'

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await getByUserIdHandler(ctx as QueryCtx, userId)
  },
})