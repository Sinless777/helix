// app/api/V1/[user-id]/notification/route.ts
import { getAuth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { api } from '@/convex/_generated/api';

// Import your auth utilities from Clerk

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL');
}
const convexClient = new ConvexHttpClient(convexUrl);

/**
 * Helper: ensure the current user is signed in and matches the userId param.
 * Throws a 401 or 403 Response if check fails.
 */
async function requireOwner(request: NextRequest, userIdParam: string) {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (userIdParam !== userId) {
    return NextResponse.json({ error: 'Unauthorized for this userId' }, { status: 403 });
  }
  return null;
}

/**
 * GET: List notifications (all, or filtered by read/unread via query param)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'user-id': string }> }
) {
  const { 'user-id': userIdParam } = await params;
  const check = await requireOwner(request, userIdParam);
  if (check) return check;

  const url = new URL(request.url);
  const filter = url.searchParams.get('filter'); // e.g., 'unread' or 'read'

  let result;
  if (filter === 'unread') {
    result = await convexClient.query(api.notifications.listUnreadNotifications, {
      userId: userIdParam,
    });
  } else if (filter === 'read') {
    result = await convexClient.query(api.notifications.listReadNotifications, {
      userId: userIdParam,
    });
  } else {
    result = await convexClient.query(api.notifications.listAllNotifications, {
      userId: userIdParam,
    });
  }

  return NextResponse.json({ data: result }, { status: 200 });
}

/**
 * POST: Create/send a notification for the user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ 'user-id': string }> }
) {
  const { 'user-id': userIdParam } = await params;
  const check = await requireOwner(request, userIdParam);
  if (check) return check;

  const body = await request.json();
  const { title, message, metadata } = body;

  if (!title || !message) {
    return NextResponse.json({ error: 'title and message are required' }, { status: 400 });
  }

  await convexClient.mutation(api.notifications.createNotification, {
    userId: userIdParam,
    title,
    message,
    metadata: metadata ?? {},
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

/**
 * PATCH: Update a notification (e.g., mark as read/unread).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ 'user-id': string }> }
) {
  const { 'user-id': userIdParam } = await params;
  const check = await requireOwner(request, userIdParam);
  if (check) return check;

  const body = await request.json();
  const { notificationId, read } = body;

  if (!notificationId || typeof read !== 'boolean') {
    return NextResponse.json(
      { error: 'notificationId and read(boolean) are required' },
      { status: 400 }
    );
  }

  await convexClient.mutation(api.notifications.markAsRead, { notificationId });

  return NextResponse.json({ success: true }, { status: 200 });
}

/**
 * DELETE: Remove a notification.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ 'user-id': string }> }
) {
  const { 'user-id': userIdParam } = await params;
  const check = await requireOwner(request, userIdParam);
  if (check) return check;

  const body = await request.json();
  const { notificationId } = body;

  if (!notificationId) {
    return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
  }

  await convexClient.mutation(api.notifications.deleteNotification, { notificationId });

  return NextResponse.json({ success: true }, { status: 200 });
}
