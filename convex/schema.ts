/**
 * Convex database schema — defines all 7 tables for LenderBridge.
 *
 * Tables: users, deals, lenders, commissions, deal_activities, notifications, error_logs.
 * Each table includes indexes for efficient querying and filtering.
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * Users table — synced from Clerk via webhook.
   * Roles: admin (broker), partner (referral partners), borrower.
   */
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("partner"), v.literal("borrower")),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    license_number: v.optional(v.string()),
    // Default commission rate for partners (e.g., 0.005 = 0.5%)
    commission_rate: v.optional(v.number()),
    // Clerk user ID for webhook sync
    clerk_id: v.string(),
    created_at: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerk_id"])
    .index("by_role", ["role"]),

  /**
   * Deals table — the core pipeline entity.
   * Created by partners, managed by admin through lifecycle stages.
   * Borrower info stored directly so partners can submit without borrower having an account.
   */
  deals: defineTable({
    partner_id: v.id("users"),
    borrower_name: v.string(),
    borrower_email: v.optional(v.string()),
    borrower_phone: v.optional(v.string()),
    borrower_company: v.optional(v.string()),
    // Set when borrower creates account and is linked to this deal
    borrower_id: v.optional(v.id("users")),
    property_address: v.string(),
    property_type: v.string(), // multifamily, retail, office, industrial, mixed_use, land, other
    transaction_type: v.string(), // purchase, refinance, bridge, construction, cash_out
    loan_type: v.string(), // permanent, bridge, construction, land, sba
    loan_amount: v.number(), // USD
    loan_position: v.optional(v.string()), // first, subordinate
    // See DEAL_STAGES in lib/constants.ts for valid values
    status: v.string(),
    assigned_lender_id: v.optional(v.id("lenders")),
    // Timestamp of last status change — used for dormant deal detection
    stage_entered_at: v.number(),
    estimated_close: v.optional(v.string()),
    // Admin internal notes — appended with timestamps on each update
    notes: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_partner_id", ["partner_id"])
    .index("by_borrower_id", ["borrower_id"])
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),

  /**
   * Lenders table — broker's private lender database (~7,000 records).
   * Only accessible by admin. Used for matching deals to lenders.
   */
  lenders: defineTable({
    name: v.string(),
    contact_name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialties: v.array(v.string()), // e.g., ["multifamily", "retail"]
    property_types: v.array(v.string()),
    states_covered: v.array(v.string()), // US state abbreviations
    min_loan: v.optional(v.number()),
    max_loan: v.optional(v.number()),
    loan_types: v.array(v.string()), // permanent, bridge, construction, land, sba, mezzanine
    // Broker's private notes (e.g., "Fast closer", "Strict on credit score")
    notes: v.optional(v.string()),
  }).index("by_name", ["name"]),

  /**
   * Commissions table — tracks referral fees for partners.
   * Created automatically when a deal reaches "closed" stage.
   * Auto-voided when a deal goes to "dead" or "declined".
   */
  commissions: defineTable({
    deal_id: v.id("deals"),
    partner_id: v.id("users"),
    amount: v.number(), // USD
    rate: v.number(), // e.g., 0.005 for 0.5%
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("voided")),
    paid_date: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_deal_id", ["deal_id"])
    .index("by_partner_id", ["partner_id"])
    .index("by_status", ["status"]),

  /**
   * Deal activities table — audit trail for every action on a deal.
   * Records status changes, lender assignments, notes, and system events.
   */
  deal_activities: defineTable({
    deal_id: v.id("deals"),
    // null actor_id = system action (e.g., automatic commission voiding)
    actor_id: v.optional(v.id("users")),
    action: v.string(), // e.g., "status_change", "lender_assigned", "deal_submitted"
    from_status: v.optional(v.string()),
    to_status: v.optional(v.string()),
    details: v.optional(v.string()), // Human-readable description
    created_at: v.number(),
  }).index("by_deal_id", ["deal_id"]),

  /**
   * Notifications table — in-app notifications for users.
   * Partners get notified on status changes, lender assignments, commission updates.
   * Admin gets notified on new deal submissions.
   */
  notifications: defineTable({
    user_id: v.id("users"),
    deal_id: v.optional(v.id("deals")),
    type: v.string(), // deal_submitted, status_changed, lender_assigned, commission_updated
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    created_at: v.number(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_id_and_read", ["user_id", "read"]),

  /**
   * Error logs table — automated error telemetry.
   * Captures client-side errors via ErrorBoundary and server-side errors.
   * Displayed on the admin System Health page grouped by page and frequency.
   */
  error_logs: defineTable({
    error_message: v.string(),
    error_stack: v.optional(v.string()),
    component_stack: v.optional(v.string()),
    user_id: v.optional(v.id("users")),
    user_role: v.optional(v.string()),
    page: v.string(), // URL path where the error occurred
    action: v.optional(v.string()), // What the user was doing when the error occurred
    user_agent: v.optional(v.string()),
    timestamp: v.number(),
  }),
});
