import { mutation } from "../_generated/server"
import { v } from "convex/values"
// --- moved notification handlers ---
/** Create a new notification for the given user. */
export const createNotification = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, { userId, title, message, metadata }) => {
    await ctx.db.insert('notifications', {
      userId,
      title,
      message,
      metadata: metadata ?? {},
      createdAt: Date.now(),
      read: false,
    })
  },
})

/** Mark a notification as read. */
export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true })
  },
})

/** Delete a notification. */
export const deleteNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.delete(notificationId)
  },
})
