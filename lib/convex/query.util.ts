// lib/convex/query.util.ts
// Thin wrappers around Convex public query/mutation functions. Keeps usage
// centralized so higher-level features can call Convex from server modules.

import { getConvexClient } from './get.util';

// Allow string-based names so helpers still work before codegen regenerates.
export async function convexQuery<Result>(
  name: string,
  args: Record<string, unknown>
): Promise<Result> {
  const client = getConvexClient();
  return client.query(name as any, args);
}

export async function convexMutation<Result>(
  name: string,
  args: Record<string, unknown>
): Promise<Result> {
  const client = getConvexClient();
  return client.mutation(name as any, args);
}
