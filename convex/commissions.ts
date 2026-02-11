/**
 * Commission CRUD operations.
 * Commissions are created automatically when deals close.
 * Admin can update status (mark as paid), partners can only view their own.
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireRole, requireAdmin } from "./helpers/auth";

/**
 * Get all commissions for the current partner.
 * Used on the partner commission center page.
 */
export const getPartnerCommissions = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, "partner");

    return await ctx.db
      .query("commissions")
      .withIndex("by_partner_id", (q) => q.eq("partner_id", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Get all commissions across all partners — admin only.
 * Used on the admin commission management page.
 */
export const getAllCommissions = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("commissions").order("desc").collect();
  },
});

/**
 * Get commissions for a specific deal — admin only.
 */
export const getDealCommissions = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("commissions")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .collect();
  },
});

/**
 * Mark a commission as paid — admin only.
 * Records the paid date and notifies the partner.
 */
export const markAsPaid = mutation({
  args: { commissionId: v.id("commissions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const commission = await ctx.db.get(args.commissionId);
    if (!commission) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Commission not found",
      });
    }

    if (commission.status !== "pending") {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Only pending commissions can be marked as paid",
      });
    }

    await ctx.db.patch(args.commissionId, {
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
    });

    // Notify the partner about the payment
    const deal = await ctx.db.get(commission.deal_id);
    await ctx.db.insert("notifications", {
      user_id: commission.partner_id,
      deal_id: commission.deal_id,
      type: "commission_updated",
      title: "Commission Paid",
      message: `Your commission of $${commission.amount.toLocaleString()} for ${deal?.property_address || "a deal"} has been paid`,
      read: false,
      created_at: Date.now(),
    });
  },
});

/**
 * Update commission rate — admin only.
 * Recalculates the amount based on the deal's loan amount.
 */
export const updateCommissionRate = mutation({
  args: {
    commissionId: v.id("commissions"),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const commission = await ctx.db.get(args.commissionId);
    if (!commission) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Commission not found",
      });
    }

    if (commission.status !== "pending") {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Only pending commissions can have their rate updated",
      });
    }

    const deal = await ctx.db.get(commission.deal_id);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }

    await ctx.db.patch(args.commissionId, {
      rate: args.rate,
      amount: deal.loan_amount * args.rate,
    });
  },
});
