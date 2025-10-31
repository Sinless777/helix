// convex/functions/oauth/state.funcs.ts
// Lightweight helpers to create and consume OAuth login/link state entries.

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

type StateDoc = {
  _id: Id<'oauthStates'>;
  _creationTime: number;
  state: string;
  provider: string;
  userId: string;
  redirectTo?: string;
  createdAt: number;
};

const STATE_TTL_MS = 1000 * 60 * 10;

function now() {
  return Date.now();
}

export async function createOAuthState(
  ctx: MutationCtx,
  args: { provider: string; userId: string; redirectTo?: string }
) {
  const db = (ctx as any).db;
  const state = String(await db.generateId('oauthStates'));
  const insertedId = await db.insert('oauthStates', {
    state,
    provider: args.provider,
    userId: args.userId,
    redirectTo: args.redirectTo ?? `/${args.userId}/settings/accounts`,
    createdAt: now(),
  });
  return { state, docId: insertedId };
}

export async function consumeOAuthState(
  ctx: MutationCtx | QueryCtx,
  args: { state: string; provider: string }
) {
  const db = (ctx as any).db;
  const doc = (await db
    .query('oauthStates')
    .withIndex('by_state', (q: any) => q.eq('state', args.state))
    .unique()) as StateDoc | null;

  if (!doc || doc.provider !== args.provider) {
    throw new Error('Invalid or expired OAuth state');
  }

  if (now() - doc.createdAt > STATE_TTL_MS) {
    await db.delete(doc._id);
    throw new Error('OAuth state expired');
  }

  await db.delete(doc._id);
  return doc;
}
