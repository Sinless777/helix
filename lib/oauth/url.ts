// lib/oauth/url.ts
// Utilities for building OAuth URLs and reading provider configs.

import { oauthProviders, type OAuthProviderKey } from '@/content/constants/oauth';

export function getProviderConfig(provider: OAuthProviderKey) {
  const config = oauthProviders[provider];
  if (!config) throw new Error(`Unsupported OAuth provider: ${provider}`);
  return config;
}

export function buildAuthorizationUrl(params: {
  provider: OAuthProviderKey;
  redirectUri: string;
  state: string;
  scopeOverride?: string[];
  extraParams?: Record<string, string>;
}) {
  const config = getProviderConfig(params.provider);
  const url = new URL(config.authorizationEndpoint);
  url.searchParams.set('client_id', getEnv(config.clientIdEnv));
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', 'code');
  const scope = (params.scopeOverride ?? config.scopes).join(' ');
  if (scope.length > 0) {
    url.searchParams.set('scope', scope);
  }
  url.searchParams.set('state', params.state);
  if (params.extraParams) {
    for (const [key, value] of Object.entries(params.extraParams)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}
