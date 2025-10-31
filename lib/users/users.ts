// lib/users.ts
import { clerkClient } from '@clerk/nextjs/server'
import { getProfile } from '@/lib/users/profile'

export interface UserData {
  id: string
  username?: string
  name: string
  avatarUrl?: string
  bio?: string
  about?: string
  createdAt?: string
  profileId?: string
  profile?: Awaited<ReturnType<typeof getProfile>>
  features?: string[]
}

/**
 * Fetch user data by Clerk user ID or username (slug).
 * - Tries exact ID via users.getUser(id)
 * - If not found, tries username via users.getUserList({ username: [...] })
 */
export async function getUserData(userIdOrSlug: string): Promise<UserData | null> {
  const client = await clerkClient()

  // 1) Try by ID
  try {
    const u = await client.users.getUser(userIdOrSlug)
    if (u) return await attachProfile(mapUser(u))
  } catch (e: any) {
    // If it's a 404 from Clerk, we'll fall through to username lookup
    if (Number(e?.status) !== 404) {
      console.error('getUserData (ID) error:', e)
    }
  }

  // 2) Try by username
  try {
    const list = await client.users.getUserList({ username: [userIdOrSlug], limit: 1 })
    const u = list?.data?.[0]
    if (u) return await attachProfile(mapUser(u))
  } catch (e) {
    console.error('getUserData (username) error:', e)
  }

  return null
}

async function attachProfile(user: UserData): Promise<UserData> {
  try {
    const profileRecord = await getProfile(user.id)
    if (profileRecord && typeof profileRecord === 'object' && '_id' in profileRecord) {
      return {
        ...user,
        profileId: (profileRecord as any)._id,
        profile: profileRecord,
      }
    }
  } catch (error) {
    console.error('getUserData (profile) error:', error)
  }
  return user
}

function mapUser(u: any): UserData {
  let createdAtIso: string | undefined
  if (u?.createdAt) {
    // Clerk may return Date | number | string depending on SDK; normalize to ISO
    createdAtIso = new Date(u.createdAt as string | number | Date).toISOString()
  }

  const fullName =
    (u?.firstName || u?.lastName)
      ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
      : (u?.username ?? u?.id ?? 'User')

  const out: UserData = {
    id: u.id,
    name: fullName,
  }

  if (u?.username !== undefined) out.username = u.username
  if (u?.imageUrl !== undefined) out.avatarUrl = u.imageUrl

  // Adjust these to where you actually store the data in Clerk
  const bio = (u.privateMetadata?.bio as string | undefined)
  if (bio !== undefined) out.bio = bio

  const about = (u.publicMetadata?.about as string | undefined)
  if (about !== undefined) out.about = about

  if (createdAtIso !== undefined) out.createdAt = createdAtIso

  const rawFeatures = (u.publicMetadata?.features ?? u.privateMetadata?.features) as
    | string
    | string[]
    | undefined

  if (Array.isArray(rawFeatures)) {
    out.features = rawFeatures.map((feature) => String(feature)).filter(Boolean)
  } else if (typeof rawFeatures === 'string' && rawFeatures.trim().length > 0) {
    out.features = [rawFeatures.trim()]
  }

  return out
}
