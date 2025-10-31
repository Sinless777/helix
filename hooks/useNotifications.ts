// hooks/useNotifications.ts
import { useQuery, useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel'; // adjust path to match your project

export type Notification = {
  _id: Id<'notifications'>;
  userId: string;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  metadata?: Record<string, any>;
};

export function useNotifications(userId: string) {
  // Fetch all notifications (read + unread). The UI will decide how to render
  // read vs unread items; unread count is computed by filtering below.
  const notifications = useQuery(api.notifications.listAllNotifications, { userId }) ?? [];
  const markReadMutation = useMutation(api.notifications.markAsRead);

  const markRead = (notificationId: Id<'notifications'>) => markReadMutation({ notificationId });

  return { notifications, markRead };
}
