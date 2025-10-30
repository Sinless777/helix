import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { Id } from '../../_generated/dataModel'

const DEFAULT_VERSION = 1

function requireOwnership(ctx: MutationCtx, userId: string) {
  return ctx.auth.getUserIdentity().then((identity) => {
    if (!identity) throw new Error('Authentication required')
    if (identity.subject !== userId) {
      throw new Error('You do not have permission to modify these settings')
    }
  })
}

type StoredSettingsDoc = {
  _id: Id<'settings'>
  _creationTime: number
  userId: string
  encryptedSettings: string
  iv?: string
  version?: number
  createdAt: number
  updatedAt: number
}

export async function getSettingsByUser(ctx: QueryCtx, userId: string) {
  const db = (ctx as any).db
  const settings = (await db
    .query('settings')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique()) as StoredSettingsDoc | null
  return settings ?? null
}

export async function saveSettings(
  ctx: MutationCtx,
  args: { userId: string; encryptedSettings: string; iv: string; version?: number }
) {
  const { userId, encryptedSettings, iv, version } = args
  await requireOwnership(ctx, userId)
  const db = (ctx as any).db
  const now = Date.now()

  const existing = (await db
    .query('settings')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique()) as StoredSettingsDoc | null

  const linkProfile = async (settingsId: Id<'settings'>) => {
    const profile = (await db
      .query('profiles')
      .withIndex('by_userId', (q: any) => q.eq('userId', userId))
      .unique()) as any
    if (profile && profile.settingsId !== settingsId) {
      await db.patch(profile._id, { settingsId })
    }
  }

  if (!existing) {
    const _id = await db.insert('settings', {
      userId,
      encryptedSettings,
      iv,
      version: version ?? DEFAULT_VERSION,
      createdAt: now,
      updatedAt: now,
    })
    await linkProfile(_id)
    return { _id, created: true }
  }

  await db.patch(existing._id, {
    encryptedSettings,
    iv,
    version: version ?? existing.version ?? DEFAULT_VERSION,
    updatedAt: now,
  })
  await linkProfile(existing._id)

  return { _id: existing._id, created: false }
}
