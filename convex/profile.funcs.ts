import type { MutationCtx, QueryCtx } from './_generated/server'
import { v } from 'convex/values'

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
  _creationTime: number
  userId: string
  encryptedPayload: string
  iv?: string
  version?: number
  createdAt: number
  updatedAt: number
}

export async function getByUserIdHandler(ctx: QueryCtx, userId: string) {
  const db = (ctx as any).db
  const profile = (await db
    .query('profiles')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique()) as StoredProfileDoc | null
  return profile ?? null
}

export async function saveHandler(
  ctx: MutationCtx,
  args: {
    userId: string
    encryptedPayload: string
    iv: string
    version?: number
  }
) {
  const { userId, encryptedPayload, iv, version } = args
  await requireOwnership(ctx, userId)
  const db = (ctx as any).db
  const now = Date.now()

  const existing = (await db
    .query('profiles')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique()) as StoredProfileDoc | null

  if (!existing) {
    const _id = await db.insert('profiles', {
      userId,
      encryptedPayload,
      iv,
      version: version ?? DEFAULT_VERSION,
      createdAt: now,
      updatedAt: now,
    })
    return { _id, created: true }
  }

  await db.patch(existing._id, {
    encryptedPayload,
    iv,
    version: version ?? existing.version ?? DEFAULT_VERSION,
    updatedAt: now,
  })

  return { _id: existing._id, created: false }
}
