// convex/mutations/user/profile.mutation.ts
// Connects the shared profile save handler to Convex's mutation registry.

import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { saveHandler, setFeaturesForUser } from '../../functions/user/profile.funcs'

export { getByUserId } from '../../queries/user/profile.query'

export const save = mutation({
  args: {
    userId: v.string(),
    encryptedPayload: v.string(),
    iv: v.string(),
    version: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    isPaid: v.optional(v.boolean()),
    subscriptionPlan: v.optional(v.string()),
    settingsId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await saveHandler(ctx, args)
  },
})

export const setFeatures = mutation({
  args: {
    userId: v.string(),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await setFeaturesForUser(ctx, args)
  },
})
