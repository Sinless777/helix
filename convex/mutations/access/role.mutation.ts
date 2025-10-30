// convex/mutations/access/role.mutation.ts
// Mutations for assigning roles while respecting hierarchy.

import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { setRole } from '../../functions/access/role.funcs'

export const assign = mutation({
  args: {
    targetUserId: v.string(),
    role: v.union(
      v.literal('owner'),
      v.literal('developer'),
      v.literal('admin'),
      v.literal('moderator'),
      v.literal('user'),
    ),
  },
  handler: async (ctx, args) => {
    return await setRole(ctx, args)
  },
})
