// app/api/V1/[user-id]/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')

const convex = new ConvexHttpClient(convexUrl)

/* ----------------------------- helpers ---------------------------------- */
function normArr(x: unknown): string[] {
  if (Array.isArray(x)) return x.filter((v): v is string => typeof v === 'string').map(s => s.trim()).filter(Boolean)
  if (typeof x === 'string') return x.split(/[,\s]+/g).map(s => s.trim()).filter(Boolean)
  return []
}

function extractFeaturesFromClerkUser(user: any): string[] {
  const pm = user?.publicMetadata ?? {}
  const um = user?.unsafeMetadata ?? {}
  const pr = user?.privateMetadata ?? {}

  // common keys devs use in Clerk
  const candidates: unknown[] = [
    pm.features,
    pm.featureFlags,
    pm.allowedFeatures,
    pm.entitlements,
    pm.flags,
    um.features,
    um.featureFlags,
    um.entitlements,
    pr.features,
  ]

  // org roles as pseudo-features (optional but useful)
  const orgRoles: string[] = Array.isArray(user?.organizationMemberships)
    ? user.organizationMemberships
        .map((m: any) => m?.role)
        .filter((r: any) => typeof r === 'string')
    : []

  const raw = candidates.flatMap(normArr).concat(orgRoles.map(r => `org:${r}`))
  const lowered = raw.map(f => f.toLowerCase())
  return Array.from(new Set(lowered))
}

/* -------------------------------- route --------------------------------- */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ 'user-id': string }> }
) {
  try {
    const params = await ctx.params
    const targetUserId = params['user-id']

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing required route param: user-id' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
    }

    const { userId: viewerId } = await auth().catch(() => ({ userId: null as string | null }))
    if (!viewerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
    }

    // self-sync only (adjust if you want admins to sync others)
    if (viewerId !== targetUserId) {
      return NextResponse.json({ error: 'Forbidden: can only sync your own profile' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
    }

    const cc = await clerkClient()
    const user = await cc.users.getUser(targetUserId)

    const features = extractFeaturesFromClerkUser(user)
    // Helpful logs while you wire things up:
    console.log('[profile-sync] clerk features for', targetUserId, features)

    // ✅ IMPORTANT: use the generated path that matches your file layout:
    //   convex/mutations/user/profile.mutation.ts  -> api.mutations.user.profile.updateFeatures
    const updated = await convex.mutation(api.profile.setFeatures, {
      userId: targetUserId,
      features,
    })

    return NextResponse.json(updated, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[profile-sync] error', err)
    return NextResponse.json({ error: 'Failed to sync and fetch profile' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
