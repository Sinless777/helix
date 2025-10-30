// app/api/oauth/[provider]/start/route.ts
// Initiates the custom OAuth flow by creating a Convex state entry and
// redirecting the browser to the provider authorization endpoint.

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { buildAuthorizationUrl, getProviderConfig } from '@/lib/oauth/url'
import type { OAuthProviderKey } from '@/content/constants/oauth'
import { convexMutation } from '@/lib/convex'

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  const typedProvider = provider as OAuthProviderKey
  const config = getProviderConfig(typedProvider)

  const redirectUri = new URL(config.redirectPath, request.nextUrl.origin).toString()
  const redirectTo = request.nextUrl.searchParams.get('redirectTo') ?? undefined

  const stateResponse = await convexMutation<{ state: string }>('oauth/state:create', {
    provider: typedProvider,
    redirectTo,
  })

  const authorizationUrl = buildAuthorizationUrl({
    provider: typedProvider,
    redirectUri,
    state: stateResponse.state,
  })

  return NextResponse.redirect(authorizationUrl, { status: 302 })
}
