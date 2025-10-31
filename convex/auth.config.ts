import type { AuthConfig } from 'convex/server';

const domain =
  process.env.CLERK_ISSUER_URL ||
  process.env.CLERK_FRONTEND_API_URL ||
  process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!domain) {
  throw new Error(
    '❌ Missing Clerk domain. Set CLERK_ISSUER_URL or CLERK_FRONTEND_API_URL in your environment.'
  );
}

const authConfig: AuthConfig = {
  providers: [
    {
      domain,
      applicationID: 'convex',
    },
  ],
};

export default authConfig;
