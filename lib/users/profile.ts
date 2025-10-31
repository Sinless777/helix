// lib/users/profile.ts
// Utilities to fetch and manipulate encrypted profile records via Convex.

import { convexQuery } from '@/lib/convex'
import { decryptJson, encryptJson } from '@/lib/security/encrypt.util'
import { Gender, GenderValues } from '@/content/constants/profile/gender.enum'
import { Sex, SexValues } from '@/content/constants/profile/sex.enum'
import { Sexuality, SexualityValues } from '@/content/constants/profile/sexuality.enum'
import { GradeLevel, GradeLevelValues } from '@/content/constants/profile/grade-level.enum'
import { Country, CountryValues } from '@/content/constants/profile/country.enum'
import type { Role } from '@/content/constants/roles'

const profileKeyEnv = process.env.NEXT_PUBLIC_PROFILE_ENCRYPTION_KEY
if (!profileKeyEnv) {
  throw new Error('Missing NEXT_PUBLIC_PROFILE_ENCRYPTION_KEY for profile encryption')
}
const PROFILE_KEY: string = profileKeyEnv

export type MailingAddress = {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type ProfileContent = {
  firstName: string
  middleName?: string
  lastName: string
  gender: (typeof GenderValues)[number]
  sex: (typeof SexValues)[number]
  sexuality: (typeof SexualityValues)[number]
  genderCustom?: string
  sexCustom?: string
  sexualityCustom?: string
  bio?: string
  profession?: string
  gradeLevel: (typeof GradeLevelValues)[number]
  country: (typeof CountryValues)[number]
  mailingAddress: MailingAddress | null
}

export type Profile = ProfileContent & {
  _id: string
  _creationTime: number
  userId: string
  createdAt: number
  updatedAt: number
  hasRealProfileDoc: boolean
  features: string[]
  isPaid: boolean
  subscriptionPlan: string | null
  settingsId?: string | null
  version: number
  role: Role
}

type StoredProfileDoc = {
  _id: string
  _creationTime: number
  userId: string
  encryptedPayload: string
  iv: string
  version?: number
  features?: string[]
  isPaid?: boolean
  subscriptionPlan?: string | null
  settingsId?: string | null
  role?: string | null
  createdAt: number
  updatedAt: number
}

const BIO_MAX_LENGTH = 10_000

const trim = (s: string | undefined | null) => (s ?? '').trim()

function normalizeMailingAddress(value?: MailingAddress | null): MailingAddress | null {
  if (!value) return null
  const addr: MailingAddress = {
    street: trim(value.street),
    city: trim(value.city),
    state: trim(value.state),
    postalCode: trim(value.postalCode),
    country: trim(value.country),
  }
  return Object.values(addr).some((part) => part.length > 0) ? addr : null
}

function clampBio(bio?: string) {
  if (!bio) return ''
  if (bio.length <= BIO_MAX_LENGTH) return bio
  return bio.slice(0, BIO_MAX_LENGTH)
}

function defaultProfile(userId: string, now = Date.now()): Profile {
  return {
    _id: `virtual-${userId}`,
    _creationTime: now,
    userId,
    createdAt: now,
    updatedAt: now,
    firstName: 'Unknown',
    middleName: '',
    lastName: 'User',
    gender: Gender.PreferNotToSay,
    sex: Sex.PreferNotToSay,
    sexuality: Sexuality.PreferNotToSay,
    genderCustom: '',
    sexCustom: '',
    sexualityCustom: '',
    bio: '',
    profession: '',
    gradeLevel: GradeLevel.PreferNotToSay,
    country: Country.Other,
    mailingAddress: null,
    hasRealProfileDoc: false,
    features: [],
    isPaid: false,
    subscriptionPlan: null,
    settingsId: null,
    version: 1,
    role: 'user',
  }
}

async function decryptProfile(doc: StoredProfileDoc): Promise<Profile> {
  const payload = await decryptJson<ProfileContent>(doc.encryptedPayload, doc.iv, PROFILE_KEY)
  return {
    _id: doc._id,
    _creationTime: doc._creationTime,
    userId: doc.userId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    hasRealProfileDoc: true,
    features: doc.features ?? [],
    isPaid: doc.isPaid ?? false,
    subscriptionPlan: doc.subscriptionPlan ?? null,
    settingsId: doc.settingsId ?? null,
    version: doc.version ?? 1,
    role: (doc.role as Role | undefined) ?? 'user',
    ...payload,
  }
}

export async function getProfile(userId: string): Promise<Profile> {
  const doc = await convexQuery<StoredProfileDoc | null>('profile:getByUserId', { userId }).catch(() => null)
  if (!doc) return defaultProfile(userId)
  try {
    return await decryptProfile(doc)
  } catch (error) {
    console.error('[profile] failed to decrypt profile payload', error)
    return defaultProfile(userId)
  }
}

export function normalizeProfileForSave(payload: ProfileContent): ProfileContent {
  return {
    firstName: trim(payload.firstName) || 'Unknown',
    middleName: trim(payload.middleName),
    lastName: trim(payload.lastName) || 'User',
    gender: payload.gender ?? Gender.PreferNotToSay,
    sex: payload.sex ?? Sex.PreferNotToSay,
    sexuality: payload.sexuality ?? Sexuality.PreferNotToSay,
    genderCustom: trim(payload.genderCustom),
    sexCustom: trim(payload.sexCustom),
    sexualityCustom: trim(payload.sexualityCustom),
    bio: clampBio(payload.bio),
    profession: trim(payload.profession),
    gradeLevel: payload.gradeLevel ?? GradeLevel.PreferNotToSay,
    country: payload.country ?? Country.Other,
    mailingAddress: normalizeMailingAddress(payload.mailingAddress),
  }
}

export async function encryptProfileForSave(content: ProfileContent) {
  return encryptJson(content, PROFILE_KEY)
}
