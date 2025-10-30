// lib/oauth/exchange.ts
// Generic helpers for exchanging authorization codes for access tokens and
// fetching profile data from third-party providers. Each provider can extend
// the base logic via the switch statements below.

import type { OAuthProviderKey } from '@/content/constants/oauth'
import { getProviderConfig, getEnv } from './url'

export interface OAuthTokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  scope?: string
  tokenType?: string
  raw: unknown
}

export interface OAuthUserProfile {
  id: string
  username?: string | null
  email?: string | null
  avatarUrl?: string | null
  raw: unknown
}

export async function exchangeCodeForToken(args: {
  provider: OAuthProviderKey
  code: string
  redirectUri: string
}): Promise<OAuthTokenResponse> {
  const config = getProviderConfig(args.provider)
  const clientId = getEnv(config.clientIdEnv)
  const clientSecret = getEnv(config.clientSecretEnv)

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: args.code,
    redirect_uri: args.redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  }

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers,
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to exchange code for token (${response.status}): ${text}`)
  }

  const json = (await response.json()) as Record<string, any>

  return {
    accessToken: json.access_token ?? json.accessToken,
    refreshToken: json.refresh_token ?? json.refreshToken,
    expiresIn: json.expires_in ?? json.expiresIn,
    scope: json.scope,
    tokenType: json.token_type ?? json.tokenType,
    raw: json,
  }
}

export async function fetchUserProfile(args: {
  provider: OAuthProviderKey
  token: OAuthTokenResponse
}): Promise<OAuthUserProfile> {
  const config = getProviderConfig(args.provider)

  switch (args.provider) {
    case 'google': {
      const response = await fetch(config.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${args.token.accessToken}` },
      })
      const data = (await response.json()) as any
      return {
        id: data.sub,
        username: data.name,
        email: data.email,
        avatarUrl: data.picture ?? null,
        raw: data,
      }
    }
    case 'discord': {
      const response = await fetch(config.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${args.token.accessToken}` },
      })
      const data = (await response.json()) as any
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        avatarUrl: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null,
        raw: data,
      }
    }
    case 'github': {
      const response = await fetch(config.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${args.token.accessToken}`,
          Accept: 'application/json',
        },
      })
      const data = (await response.json()) as any
      return {
        id: String(data.id),
        username: data.login,
        email: data.email,
        avatarUrl: data.avatar_url ?? null,
        raw: data,
      }
    }
    default:
      throw new Error(`fetchUserProfile not yet implemented for provider: ${args.provider}`)
  }
}
