/**
 * Notification CRUD + mark-read operations.
 * Users can only see their own notifications.
 * Used for the notification bell badge and notifications list page.
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./helpers/auth";
import { ConvexError } from "convex/values";

/**
 * Get all notifications for the current user, newest first.
 */
export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Get unread notification count for the current user.
 * Used for the notification bell badge number.
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_id_and_read", (q) =>
        q.eq("user_id", user._id).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});

/**
 * Mark a single notification as read.
 * Users can only mark their own notifications.
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Notification not found",
      });
    }

    // SECURITY: Users can only mark their own notifications as read
    if (notification.user_id !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You cannot modify this notification",
      });
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

/**
 * Mark all notifications as read for the current user.
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_id_and_read", (q) =>
        q.eq("user_id", user._id).eq("read", false)
      )
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});
