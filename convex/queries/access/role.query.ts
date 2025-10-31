// convex/queries/access/role.query.ts
// Public queries for reading role assignments.

import { v } from 'convex/values';

import { query } from '../../_generated/server';
import { getRoleForUser, listRoles } from '../../functions/access/role.funcs';

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await getRoleForUser(ctx, userId);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await listRoles(ctx);
  },
});
