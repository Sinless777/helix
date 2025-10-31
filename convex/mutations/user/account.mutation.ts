// convex/mutations/user/account.mutation.ts
// Exposes account linking/unlinking helpers as Convex mutations.

import { v } from 'convex/values';

import { mutation } from '../../_generated/server';
import { unlinkAccount, upsertAccount } from '../../functions/user/account.funcs';

export const link = mutation({
  args: {
    userId: v.string(),
    provider: v.string(),
    accountId: v.string(),
    displayName: v.string(),
    managementUrl: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertAccount(ctx, args);
  },
});

export const unlink = mutation({
  args: {
    userId: v.string(),
    provider: v.string(),
    accountId: v.string(),
  },
  handler: async (ctx, args) => {
    return await unlinkAccount(ctx, args);
  },
});
