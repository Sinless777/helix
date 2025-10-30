// convex/functions/user/account.funcs.ts
// Shared account helpers used by both queries and mutations. Keeps ownership
// validation and database access logic in one spot so the Convex handlers stay
// thin.

import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { Id } from '../../_generated/dataModel'

type StoredAccountDoc = {
  _id: Id<'accounts'>
  _creationTime: number
  userId: string
  provider: string
  accountId: string
  displayName: string
  managementUrl?: string
  status?: string
  connectedAt: number
  updatedAt: number
}

type AccountUpsertArgs = {
  userId: string
  provider: string
  accountId: string
  displayName: string
  managementUrl?: string
  status?: string
}

async function requireOwnership(ctx: MutationCtx, userId: string) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Authentication required to link accounts')
  if (identity.subject !== userId) {
    throw new Error('You can only manage accounts that belong to you')
  }
}

export async function listAccountsByUser(ctx: QueryCtx, userId: string) {
  const db = (ctx as any).db
  const results = await db
    .query('accounts')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .collect()
  return results as StoredAccountDoc[]
}

export async function upsertAccount(ctx: MutationCtx, args: AccountUpsertArgs) {
  await requireOwnership(ctx, args.userId)
  const db = (ctx as any).db
  const now = Date.now()

  const existing = (await db
    .query('accounts')
    .withIndex('by_user_provider', (q: any) =>
      q.eq('userId', args.userId).eq('provider', args.provider).eq('accountId', args.accountId)
    )
    .unique()) as StoredAccountDoc | null

  if (!existing) {
    const docId = await db.insert('accounts', {
      ...args,
      connectedAt: now,
      updatedAt: now,
    })
    return { _id: docId, created: true }
  }

  await db.patch(existing._id, {
    displayName: args.displayName,
    managementUrl: args.managementUrl,
    status: args.status,
    updatedAt: now,
  })
  return { _id: existing._id, created: false }
}

export async function unlinkAccount(
  ctx: MutationCtx,
  args: { userId: string; provider: string; accountId: string }
) {
  await requireOwnership(ctx, args.userId)
  const db = (ctx as any).db

  const existing = (await db
    .query('accounts')
    .withIndex('by_user_provider', (q: any) =>
      q
        .eq('userId', args.userId)
        .eq('provider', args.provider)
        .eq('accountId', args.accountId)
    )
    .unique()) as StoredAccountDoc | null

  if (!existing) {
    return { removed: false }
  }

  await db.delete(existing._id)
  return { removed: true }
}
