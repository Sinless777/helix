// lib/users/accounts.ts
// Helper functions for reading and mutating linked accounts via Convex.

import { convexMutation, convexQuery } from '@/lib/convex';

export type LinkedAccount = {
  _id: string;
  _creationTime: number;
  userId: string;
  provider: string;
  accountId: string;
  displayName: string;
  managementUrl?: string | null;
  status?: string | null;
  connectedAt: number;
  updatedAt: number;
};

export async function getLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
  const results = await convexQuery<LinkedAccount[]>('accounts:listByUserId', { userId }).catch(
    () => []
  );
  return Array.isArray(results) ? results : [];
}

export async function linkAccount(args: {
  userId: string;
  provider: string;
  accountId: string;
  displayName: string;
  managementUrl?: string;
  status?: string;
}) {
  return convexMutation<{ _id: string; created: boolean }>('accounts:link', args);
}

export async function unlinkAccount(args: { userId: string; provider: string; accountId: string }) {
  return convexMutation<{ removed: boolean }>('accounts:unlink', args);
}
