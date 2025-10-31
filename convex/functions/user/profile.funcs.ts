import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

const DEFAULT_VERSION = 1;

function requireOwnership(ctx: MutationCtx, userId: string) {
  return ctx.auth.getUserIdentity().then((identity) => {
    if (!identity) throw new Error('Authentication required');
    if (identity.subject !== userId) {
      throw new Error('You do not have permission to modify this profile');
    }
  });
}

type StoredProfileDoc = {
  _id: string;
  _creationTime: number;
  userId: string;
  encryptedPayload: string;
  iv: string;
  version?: number;
  features?: string[];
  isPaid?: boolean;
  subscriptionPlan?: string | null;
  settingsId?: Id<'settings'> | null;
  role?: string | null;
  createdAt: number;
  updatedAt: number;
};

export async function getByUserIdHandler(ctx: QueryCtx, userId: string) {
  const db = (ctx as any).db;
  const profile = (await db
    .query('profiles')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique()) as StoredProfileDoc | null;
  return profile ?? null;
}

export async function saveHandler(
  ctx: MutationCtx,
  args: {
    userId: string;
    encryptedPayload: string;
    iv: string;
    version?: number;
    features?: string[];
    isPaid?: boolean;
    subscriptionPlan?: string | null;
    settingsId?: string | null;
    role?: string | null;
  }
) {
  const {
    userId,
    encryptedPayload,
    iv,
    version,
    features,
    isPaid,
    subscriptionPlan,
    settingsId,
    role,
  } = args;
  await requireOwnership(ctx, userId);
  const db = (ctx as any).db;
  const now = Date.now();

  const normalizedSettingsId = settingsId
    ? (db.normalizeId('settings', settingsId) ?? undefined)
    : undefined;

  const existing = (await db
    .query('profiles')
    .withIndex('by_userId', (q: any) => q.eq('userId', userId))
    .unique()) as StoredProfileDoc | null;

  const nextFeatures = features ?? existing?.features ?? [];
  const nextIsPaid = typeof isPaid === 'boolean' ? isPaid : (existing?.isPaid ?? false);
  const nextSubscription =
    subscriptionPlan !== undefined ? subscriptionPlan : (existing?.subscriptionPlan ?? null);
  const nextSettingsId =
    normalizedSettingsId !== undefined ? normalizedSettingsId : (existing?.settingsId ?? undefined);
  const nextRole = role !== undefined && role !== null ? role : (existing?.role ?? null);

  if (!existing) {
    const _id = await db.insert('profiles', {
      userId,
      encryptedPayload,
      iv,
      version: version ?? DEFAULT_VERSION,
      features: nextFeatures,
      isPaid: nextIsPaid,
      subscriptionPlan: nextSubscription,
      settingsId: nextSettingsId,
      role: nextRole,
      createdAt: now,
      updatedAt: now,
    });
    return { _id, created: true };
  }

  await db.patch(existing._id, {
    encryptedPayload,
    iv,
    version: version ?? existing.version ?? DEFAULT_VERSION,
    features: nextFeatures,
    isPaid: nextIsPaid,
    subscriptionPlan: nextSubscription,
    settingsId: nextSettingsId,
    role: nextRole,
    updatedAt: now,
  });

  return { _id: existing._id, created: false };
}

export async function setFeaturesForUser(
  ctx: MutationCtx,
  args: { userId: string; features: string[] }
) {
  await requireOwnership(ctx, args.userId);
  const db = (ctx as any).db;
  const now = Date.now();

  const normalized = Array.isArray(args.features)
    ? args.features
        .map((feature) => feature?.toString().trim())
        .filter((feature) => feature && feature.length > 0)
    : [];

  const existing = (await db
    .query('profiles')
    .withIndex('by_userId', (q: any) => q.eq('userId', args.userId))
    .unique()) as StoredProfileDoc | null;

  if (!existing) {
    // Create a minimal profile with features if none exists
    const _id = await db.insert('profiles', {
      userId: args.userId,
      encryptedPayload: '', // or sensible default
      iv: '', // or sensible default
      version: DEFAULT_VERSION,
      features: normalized,
      isPaid: false,
      subscriptionPlan: null,
      settingsId: null,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    });
    return { updated: true, created: true, _id };
  }

  await db.patch(existing._id, {
    features: normalized,
    updatedAt: now,
  });

  return { updated: true, created: false, _id: existing._id };
}
