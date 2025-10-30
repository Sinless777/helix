// convex/queries/user/account.query.ts
// Public query wrapper returning all linked accounts for a specific user.

import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { listAccountsByUser } from '../../functions/user/account.funcs'

export const listByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await listAccountsByUser(ctx, userId)
  },
})
