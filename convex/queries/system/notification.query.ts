import { query } from "../../_generated/server"
import { v } from "convex/values"

/** List unread notifications for a user. */
export const listUnreadNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_userId_unread', (q) => q.eq('userId', userId).eq('read', false))
      .order('desc')
      .take(50)
  },
})

/** List read notifications for a user. */
export const listReadNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_userId_unread', (q) => q.eq('userId', userId).eq('read', true))
      .order('desc')
      .take(50)
  },
})

/** List all notifications (read + unread) for a user. */
export const listAllNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('notifications')
      .filter((q) => q.eq(q.field('userId'), userId))
      .order('desc')
      .take(100)
  },
})