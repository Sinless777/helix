'use strict'

import type { MutationCtx, QueryCtx } from '../_generated/server'
import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { getByUserIdHandler, saveHandler } from '../functions/profile.funcs'

export const save = mutation({
  args: {
    userId: v.string(),
    encryptedPayload: v.string(),
    iv: v.string(),
    version: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await saveHandler(ctx as MutationCtx, args)
  },
})
