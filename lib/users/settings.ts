// lib/users/settings.ts
// Settings helper utilities to fetch and decrypt a member's preferences from
// Convex. Settings are encrypted client-side using the same AES-GCM helpers as
// profiles to keep sensitive data opaque at rest.

import { convexQuery } from '@/lib/convex'
import { decryptJson } from '@/lib/security/encrypt.util'

const SETTINGS_ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_SETTINGS_ENCRYPTION_KEY ??
  process.env.NEXT_PUBLIC_PROFILE_ENCRYPTION_KEY

if (!SETTINGS_ENCRYPTION_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SETTINGS_ENCRYPTION_KEY (or profile fallback)')
}

const ACTIVE_SETTINGS_KEY: string = SETTINGS_ENCRYPTION_KEY

export type UserSettingsContent = {
  theme: 'system' | 'light' | 'dark'
  timezone: string
  notificationsEnabled: boolean
  accountManagementUrl: string | null
}

export type UserSettings = {
  userId: string
  version: number
  settings: UserSettingsContent
  createdAt: number
  updatedAt: number
  hasRealSettingsDoc: boolean
}

type StoredSettingsDoc = {
  _id: string
  _creationTime: number
  userId: string
  encryptedSettings: string
  iv?: string
  version?: number
  createdAt: number
  updatedAt: number
}

const DEFAULT_SETTINGS: UserSettingsContent = {
  theme: 'system',
  timezone: 'UTC',
  notificationsEnabled: true,
  accountManagementUrl: null,
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const stored = await convexQuery<StoredSettingsDoc | null>('settings:getByUserId', {
    userId,
  }).catch(() => null)

  if (!stored) {
    const now = Date.now()
    return {
      userId,
      version: 1,
      settings: { ...DEFAULT_SETTINGS },
      createdAt: now,
      updatedAt: now,
      hasRealSettingsDoc: false,
    }
  }

  try {
    const iv = stored.iv ?? ''
    const payload = await decryptJson<UserSettingsContent>(
      stored.encryptedSettings,
      iv,
      ACTIVE_SETTINGS_KEY,
    )
    return {
      userId: stored.userId,
      version: stored.version ?? 1,
      settings: {
        ...DEFAULT_SETTINGS,
        ...payload,
        accountManagementUrl:
          payload.accountManagementUrl === undefined ? DEFAULT_SETTINGS.accountManagementUrl : payload.accountManagementUrl,
      },
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
      hasRealSettingsDoc: true,
    }
  } catch (error) {
    console.error('[settings] failed to decrypt settings payload', error)
    const now = Date.now()
    return {
      userId,
      version: 1,
      settings: { ...DEFAULT_SETTINGS },
      createdAt: now,
      updatedAt: now,
      hasRealSettingsDoc: false,
    }
  }
}
