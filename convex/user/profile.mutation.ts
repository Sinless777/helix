'use strict'

import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const DEFAULT_VERSION = 1

function requireOwnership(ctx: MutationCtx, userId: string) {
  return ctx.auth.getUserIdentity().then((identity) => {
    if (!identity) throw new Error('Authentication required')
    if (identity.subject !== userId) {
      throw new Error('You do not have permission to modify this profile')
    }
  })
}

type StoredProfileDoc = {
  _id: string
  // MOVED: use ../profile.mutation.ts
