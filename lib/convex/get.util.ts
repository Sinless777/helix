// lib/convex/get.util.ts
// Lazily instantiate and reuse a Convex HTTP client instance.

import { ConvexHttpClient } from 'convex/browser';

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error('Missing NEXT_PUBLIC_CONVEX_URL for Convex HTTP client');
    }
    convexClient = new ConvexHttpClient(url);
  }
  return convexClient;
}
