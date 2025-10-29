// lib/users/profile.ts
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

// Load Convex URL from environment
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
}

// Shared Convex client instance
const client = new ConvexHttpClient(convexUrl)

/**
 * Fetch or create a user's profile in Convex.
 * If the profile does not exist, one is created with minimal defaults.
 */
export async function getProfile(userId: string) {
  if (!userId) throw new Error('Missing userId')

  // Try fetching existing profile
  const existing = await client.query(api.profile.getByUserId, { userId })

  if (existing) {
    return existing
  }

  // If not found, create a minimal profile entry
  const now = Date.now()
  const defaults = {
    userId,
    firstName: 'Unknown',
    lastName: 'User',
    gender: 'prefer_not_to_say',
    sex: 'prefer_not_to_say',
    sexuality: 'prefer_not_to_say',
    bio: '',
    profession: '',
    gradeLevel: 'prefer_not_to_say',
    country: 'OTHER',
    createdAt: now,
    updatedAt: now,
  }

  const result = await client.mutation(api.profile.upsert, defaults)

  // Fetch the created profile to return full data
  const createdProfile = await client.query(api.profile.getByUserId, { userId })
  return createdProfile ?? { ...defaults, _id: result._id }
}
