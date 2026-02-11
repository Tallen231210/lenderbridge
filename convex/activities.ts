/**
 * Deal activity log queries.
 * Activities track every action on a deal — status changes, lender assignments, notes.
 * Used in deal detail views and the admin global activity log.
 */
import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireAdmin } from "./helpers/auth";
import { ConvexError } from "convex/values";

/**
 * Get all activities for a specific deal.
 * Admin can see any deal's activities. Partners/borrowers only their own.
 */
export const getDealActivities = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Verify the user has access to this deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }

    // SECURITY: Partners only see their own deals' activities
    if (user.role === "partner" && deal.partner_id !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have access to this deal",
      });
    }
    // SECURITY: Borrowers only see their own deal's activities
    if (user.role === "borrower" && deal.borrower_id !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have access to this deal",
      });
    }

    return await ctx.db
      .query("deal_activities")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .order("desc")
      .collect();
  },
});

/**
 * Get all activities across all deals — admin only.
 * Used on the admin activity log page.
 */
export const getAllActivities = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("deal_activities")
      .order("desc")
      .take(200);
  },
});
