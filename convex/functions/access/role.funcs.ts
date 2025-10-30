// convex/functions/access/role.funcs.ts
// Role helpers ensure consistent hierarchy checks when assigning or reading
// permissions inside Convex functions.

import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { Id } from '../../_generated/dataModel'
import { roleRank, type Role, canActOn } from '../../../content/constants/roles'

type RoleDoc = {
  _id: Id<'roles'>
  _creationTime: number
  userId: string
  role: Role
  assignedBy: string
  createdAt: number
  updatedAt: number
}

const DEFAULT_ROLE: Role = 'user'

async function fetchRoleDoc(ctx: QueryCtx | MutationCtx, userId: string): Promise<RoleDoc | null> {
  const db = (ctx as any).db
  const doc = await db
    .query('roles')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique()
  return (doc as RoleDoc | null) ?? null
}

export async function getRoleForUser(ctx: QueryCtx, userId: string): Promise<Role> {
  const roleDoc = await fetchRoleDoc(ctx, userId)
  return roleDoc?.role ?? DEFAULT_ROLE
}

export async function listRoles(ctx: QueryCtx) {
  const db = (ctx as any).db
  return (await db.query('roles').collect()) as RoleDoc[]
}

export async function setRole(
  ctx: MutationCtx,
  args: { targetUserId: string; role: Role },
): Promise<RoleDoc> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Authentication required')

  const actorUserId = identity.subject
  const targetUserId = args.targetUserId
  const nextRole = args.role

  const db = (ctx as any).db

  const actorRoleDoc = await fetchRoleDoc(ctx, actorUserId)
  const actorRole = actorRoleDoc?.role ?? DEFAULT_ROLE
  if (roleRank[actorRole] < roleRank['moderator']) {
    throw new Error('Insufficient permissions to assign roles')
  }

  const targetRoleDoc = await fetchRoleDoc(ctx, targetUserId)
  const targetCurrentRole = targetRoleDoc?.role ?? DEFAULT_ROLE

  if (!canActOn(actorRole, nextRole) || !canActOn(actorRole, targetCurrentRole)) {
    throw new Error('You cannot assign a role at or above your own')
  }

  const now = Date.now()

  if (!targetRoleDoc) {
    const inserted = await db.insert('roles', {
      userId: targetUserId,
      role: nextRole,
      assignedBy: actorUserId,
      createdAt: now,
      updatedAt: now,
    })
    const created = (await db.get(inserted)) as RoleDoc
    return created
  }

  await db.patch(targetRoleDoc._id, {
    role: nextRole,
    assignedBy: actorUserId,
    updatedAt: now,
  })

  const updated = (await db.get(targetRoleDoc._id)) as RoleDoc
  return updated
}
