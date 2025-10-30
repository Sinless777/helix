// convex/accounts.ts
// Barrel file so clients can import queries/mutations using the usual pattern.

export { listByUserId } from './queries/user/account.query'
export { link, unlink } from './mutations/user/account.mutation'
