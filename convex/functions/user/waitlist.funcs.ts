import type { MutationCtx } from '../../_generated/server';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function addHandler(
  ctx: MutationCtx,
  args: {
    email: string;
    date?: string;
    time?: string;
    userId?: string;
  }
) {
  const email = args.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new Error('Invalid email');
  }

  // Idempotency: if already on the waitlist, return the existing id
  const existing = await ctx.db
    .query('waitlist')
    .withIndex('by_email', (q) => q.eq('email', email))
    .first();
  if (existing) {
    return { id: existing._id, created: false };
  }

  // Server-side timestamp (UTC)
  const now = new Date();
  const date = args.date ?? now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = args.time ?? now.toISOString().slice(11, 19); // HH:mm:ss

  const docId = await ctx.db.insert('waitlist', {
    email,
    date,
    time,
    userId: args.userId ?? null,
    createdAt: Date.now(),
  });

  return { id: docId, created: true };
}
