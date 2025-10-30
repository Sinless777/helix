// app/api/V1/[user-id]/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api' // If you don't use "@/*" alias, change to a relative path.
import { encryptJson } from '@/lib/security/encrypt.util'

// IMPORTANT: Convex URL must be set (e.g., NEXT_PUBLIC_CONVEX_URL=https://*.convex.cloud)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  // Fail fast at module load if the env var is missing.
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
}

const client = new ConvexHttpClient(convexUrl)
const profileApi = (api as any).profile

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ 'user-id': string }> }
) {
  try {
    const params = await ctx.params
    const userId = params['user-id']
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required route param: user-id' },
        { status: 400 }
      )
    }

    const profile = await client.query(profileApi.getByUserId, { userId })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    return NextResponse.json(profile, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err: any) {
    // Avoid leaking internals; log server-side if needed.
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
