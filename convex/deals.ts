/**
 * Deal CRUD operations and status transitions.
 * Deals are the core pipeline entity — created by partners, managed by admin.
 * Every mutation enforces role-based access and server-side validation.
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import {
  requireAuth,
  requireRole,
  requireAdmin,
  requirePartnerOwnership,
} from "./helpers/auth";
import { validateDealInput } from "./helpers/validation";

/** Valid deal stages — must match DEAL_STAGES in src/lib/constants.ts */
const DEAL_STAGES = [
  "submitted",
  "under_review",
  "lender_assigned",
  "term_sheet",
  "processing",
  "underwriting",
  "clear_to_close",
  "closed",
  "declined",
  "dead",
] as const;

const TERMINAL_STAGES = ["closed", "declined", "dead"] as const;

/**
 * Creates a new deal in the pipeline.
 * - Requires authenticated partner role
 * - Validates all input server-side (never trust client data)
 * - Creates activity log entry and admin notification as side effects
 * - Returns the new deal ID
 */
export const createDeal = mutation({
  args: {
    borrower_name: v.string(),
    borrower_email: v.optional(v.string()),
    borrower_phone: v.optional(v.string()),
    borrower_company: v.optional(v.string()),
    property_address: v.string(),
    property_type: v.string(),
    transaction_type: v.string(),
    loan_type: v.string(),
    loan_amount: v.number(),
    loan_position: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only partners can submit deals
    const user = await requireRole(ctx, "partner");

    // SECURITY: Re-validate all input server-side.
    // Client-side validation is for UX only — never trust it for security.
    const validatedArgs = validateDealInput(args);

    try {
      const dealId = await ctx.db.insert("deals", {
        ...validatedArgs,
        partner_id: user._id,
        status: "submitted",
        stage_entered_at: Date.now(),
        created_at: Date.now(),
      });

      // Side effect: Log the submission in the activity trail
      await ctx.db.insert("deal_activities", {
        deal_id: dealId,
        actor_id: user._id,
        action: "deal_submitted",
        to_status: "submitted",
        details: `Deal submitted for ${validatedArgs.property_address}`,
        created_at: Date.now(),
      });

      // Side effect: Notify admin of new deal submission
      // Find admin user(s) to notify
      const admins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .collect();

      for (const admin of admins) {
        await ctx.db.insert("notifications", {
          user_id: admin._id,
          deal_id: dealId,
          type: "deal_submitted",
          title: "New Deal Submitted",
          message: `${user.name} submitted a deal for ${validatedArgs.property_address}`,
          read: false,
          created_at: Date.now(),
        });
      }

      return dealId;
    } catch (error) {
      // If it's already a ConvexError (from validation etc.), rethrow as-is
      if (error instanceof ConvexError) throw error;
      // Otherwise wrap in generic error to avoid leaking server details
      throw new ConvexError({
        code: "INTERNAL",
        message: "Failed to create deal. Please try again.",
      });
    }
  },
});

/**
 * Get a single deal by ID.
 * Admin can see any deal. Partners can only see their own deals.
 * Borrowers can only see deals where they're the borrower.
 */
export const getDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const deal = await ctx.db.get(args.dealId);

    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }

    // SECURITY: Enforce row-level access
    if (user.role === "partner" && deal.partner_id !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have access to this deal",
      });
    }
    if (user.role === "borrower" && deal.borrower_id !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have access to this deal",
      });
    }

    return deal;
  },
});

/**
 * Get all deals for the current partner.
 * Returns deals sorted by creation date (newest first).
 */
export const getPartnerDeals = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, "partner");

    return await ctx.db
      .query("deals")
      .withIndex("by_partner_id", (q) => q.eq("partner_id", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Get all deals for the current borrower.
 */
export const getBorrowerDeals = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, "borrower");

    return await ctx.db
      .query("deals")
      .withIndex("by_borrower_id", (q) => q.eq("borrower_id", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Get all deals — admin only.
 * Used for the Kanban pipeline board and deal management.
 */
export const getAllDeals = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("deals").order("desc").collect();
  },
});

/**
 * Get deals grouped by status — admin only.
 * Returns a map of status → deals for the Kanban board.
 */
export const getDealsByStatus = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const deals = await ctx.db.query("deals").collect();

    // Group deals by status for the Kanban columns
    const grouped: Record<string, typeof deals> = {};
    for (const stage of DEAL_STAGES) {
      grouped[stage] = [];
    }
    for (const deal of deals) {
      if (grouped[deal.status]) {
        grouped[deal.status].push(deal);
      }
    }

    return grouped;
  },
});

/**
 * Update deal status — admin only.
 * Enforces the state machine transition rules:
 * - Cannot move from terminal stages (closed, declined, dead)
 * - Backward movement requires a note
 * - Dead/declined auto-voids pending commissions
 * - Closed auto-creates a commission record
 */
export const updateDealStatus = mutation({
  args: {
    dealId: v.id("deals"),
    newStatus: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Only admin can change deal status
    const admin = await requireAdmin(ctx);

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }

    // Validate the new status is a valid deal stage
    if (!DEAL_STAGES.includes(args.newStatus as (typeof DEAL_STAGES)[number])) {
      throw new ConvexError({
        code: "VALIDATION",
        message: "Invalid deal stage",
      });
    }

    // Cannot move from terminal stages
    if (
      TERMINAL_STAGES.includes(
        deal.status as (typeof TERMINAL_STAGES)[number]
      )
    ) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Cannot update a closed, declined, or dead deal",
      });
    }

    // Backward movement requires a note for audit trail
    const currentIndex = DEAL_STAGES.indexOf(
      deal.status as (typeof DEAL_STAGES)[number]
    );
    const newIndex = DEAL_STAGES.indexOf(
      args.newStatus as (typeof DEAL_STAGES)[number]
    );
    if (newIndex < currentIndex && !args.note) {
      throw new ConvexError({
        code: "VALIDATION",
        message: "A note is required when moving a deal backward",
      });
    }

    // Update the deal status and timestamp
    await ctx.db.patch(args.dealId, {
      status: args.newStatus,
      stage_entered_at: Date.now(),
      notes: args.note
        ? `${deal.notes || ""}\n[${new Date().toISOString()}] ${args.note}`.trim()
        : deal.notes,
    });

    // Log the status change in the activity trail
    await ctx.db.insert("deal_activities", {
      deal_id: args.dealId,
      actor_id: admin._id,
      action: "status_change",
      from_status: deal.status,
      to_status: args.newStatus,
      details:
        args.note ||
        `Status changed from ${deal.status} to ${args.newStatus}`,
      created_at: Date.now(),
    });

    // When a deal moves to "dead" or "declined", auto-void any pending commissions.
    // The voided commission remains visible in the partner's history for transparency,
    // but is excluded from their pending total.
    if (args.newStatus === "dead" || args.newStatus === "declined") {
      const commissions = await ctx.db
        .query("commissions")
        .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
        .collect();
      for (const commission of commissions) {
        if (commission.status === "pending") {
          await ctx.db.patch(commission._id, { status: "voided" });
        }
      }
    }

    // Create commission record when deal closes
    if (args.newStatus === "closed") {
      const partner = await ctx.db.get(deal.partner_id);
      // Calculate commission: use partner's default rate if set, otherwise fall back to 0.5%
      const rate = partner?.commission_rate || 0.005;
      await ctx.db.insert("commissions", {
        deal_id: args.dealId,
        partner_id: deal.partner_id,
        amount: deal.loan_amount * rate,
        rate: rate,
        status: "pending",
        created_at: Date.now(),
      });
    }

    // Notify the partner about the status change
    await ctx.db.insert("notifications", {
      user_id: deal.partner_id,
      deal_id: args.dealId,
      type: "status_changed",
      title: "Deal Status Updated",
      message: `Your deal at ${deal.property_address} has been moved to ${args.newStatus.replace(/_/g, " ")}`,
      read: false,
      created_at: Date.now(),
    });
  },
});

/**
 * Assign a lender to a deal — admin only.
 * Updates the deal, logs activity, and notifies the partner.
 */
export const assignLender = mutation({
  args: {
    dealId: v.id("deals"),
    lenderId: v.id("lenders"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }

    const lender = await ctx.db.get(args.lenderId);
    if (!lender) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Lender not found",
      });
    }

    // Update the deal with the assigned lender
    await ctx.db.patch(args.dealId, {
      assigned_lender_id: args.lenderId,
      // Auto-advance to "lender_assigned" if still in earlier stages
      ...(["submitted", "under_review"].includes(deal.status) && {
        status: "lender_assigned",
        stage_entered_at: Date.now(),
      }),
    });

    // Log the lender assignment
    await ctx.db.insert("deal_activities", {
      deal_id: args.dealId,
      actor_id: admin._id,
      action: "lender_assigned",
      details: `Lender assigned: ${lender.name}`,
      created_at: Date.now(),
    });

    // Notify the partner
    await ctx.db.insert("notifications", {
      user_id: deal.partner_id,
      deal_id: args.dealId,
      type: "lender_assigned",
      title: "Lender Assigned to Your Deal",
      message: `A lender has been assigned to your deal at ${deal.property_address}`,
      read: false,
      created_at: Date.now(),
    });
  },
});

/**
 * Add admin notes to a deal — admin only.
 */
export const addDealNote = mutation({
  args: {
    dealId: v.id("deals"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }

    const timestamp = new Date().toISOString();
    await ctx.db.patch(args.dealId, {
      notes: `${deal.notes || ""}\n[${timestamp}] ${args.note}`.trim(),
    });

    await ctx.db.insert("deal_activities", {
      deal_id: args.dealId,
      actor_id: admin._id,
      action: "note_added",
      details: args.note,
      created_at: Date.now(),
    });
  },
});
