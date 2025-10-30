// convex/mutations/user/settings.mutation.ts
// Registers the shared settings save logic as a Convex mutation.

import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { saveSettings } from '../../functions/user/settings.funcs'

export const save = mutation({
  args: {
    userId: v.string(),
    encryptedSettings: v.string(),
    iv: v.string(),
    version: v.optional(v.number()),
  },
  handler: async (ctx, args) => saveSettings(ctx, args),
})
