// convex/queries/user/settings.query.ts
// Expose the reusable settings query handler via Convex public API.

import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { getSettingsByUser } from '../../functions/user/settings.funcs'

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await getSettingsByUser(ctx, userId)
  },
})
