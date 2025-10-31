// app/api/oauth/[provider]/callback/route.ts
// Handles OAuth callbacks, validates state, exchanges codes, and persists the
// linked account via Convex.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { OAuthProviderKey } from '@/content/constants/oauth';
import { convexMutation } from '@/lib/convex';
import { exchangeCodeForToken, fetchUserProfile } from '@/lib/oauth/exchange';
import { getProviderConfig } from '@/lib/oauth/url';

function buildRedirectUrl(baseOrigin: string, path: string, params: Record<string, string>) {
  const url = new URL(path, baseOrigin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const typedProvider = provider as OAuthProviderKey;
  const config = getProviderConfig(typedProvider);

  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      buildRedirectUrl(url.origin, '/', {
        provider: typedProvider,
        error,
      })
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      buildRedirectUrl(url.origin, '/', {
        provider: typedProvider,
        error: 'missing_code',
      })
    );
  }

  let stateDoc: { userId: string; redirectTo?: string };
  try {
    stateDoc = await convexMutation<{ userId: string; redirectTo?: string }>('oauth/state:verify', {
      provider: typedProvider,
      state,
    });
  } catch (err) {
    return NextResponse.redirect(
      buildRedirectUrl(url.origin, '/', {
        provider: typedProvider,
        error: 'invalid_state',
      })
    );
  }

  const redirectUri = new URL(config.redirectPath, url.origin).toString();
  const fallbackPath = stateDoc.redirectTo ?? `/${stateDoc.userId}/settings/accounts`;

  try {
    const token = await exchangeCodeForToken({ provider: typedProvider, code, redirectUri });
    const profile = await fetchUserProfile({ provider: typedProvider, token });

    await convexMutation('accounts:link', {
      userId: stateDoc.userId,
      provider: typedProvider,
      accountId: profile.id,
      displayName: profile.username ?? profile.email ?? config.name,
      status: 'linked',
      managementUrl: undefined,
    });

    const destination = buildRedirectUrl(url.origin, fallbackPath, {
      provider: typedProvider,
      linked: 'true',
    });

    return NextResponse.redirect(destination);
  } catch (err) {
    console.error('[oauth] callback error', err);
    return NextResponse.redirect(
      buildRedirectUrl(url.origin, fallbackPath, {
        provider: typedProvider,
        error: 'oauth_failure',
      })
    );
  }
}
