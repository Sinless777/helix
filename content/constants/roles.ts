// content/constants/roles.ts
// Shared role hierarchy for Helix. Higher numeric weight means more authority.

export type Role = 'owner' | 'developer' | 'admin' | 'moderator' | 'user'

export const roleOrder: Role[] = ['user', 'moderator', 'admin', 'developer', 'owner']

export const roleRank: Record<Role, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  developer: 3,
  owner: 4,
}

export function compareRoles(a: Role, b: Role): number {
  return roleRank[a] - roleRank[b]
}

export function canActOn(actor: Role, target: Role): boolean {
  return roleRank[actor] > roleRank[target]
}
