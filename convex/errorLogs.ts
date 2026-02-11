/**
 * Error log telemetry mutations and queries.
 * Captures client-side errors from ErrorBoundary and displays them
 * on the admin System Health page for monitoring.
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers/auth";

/**
 * Log a client-side error — no auth required (errors can happen before auth).
 * Called by the ErrorBoundary component and the error telemetry provider.
 */
export const logError = mutation({
  args: {
    error_message: v.string(),
    error_stack: v.optional(v.string()),
    component_stack: v.optional(v.string()),
    user_id: v.optional(v.id("users")),
    user_role: v.optional(v.string()),
    page: v.string(),
    action: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("error_logs", args);
  },
});

/**
 * Get recent error logs — admin only.
 * Used on the System Health page.
 */
export const getRecentErrors = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("error_logs")
      .order("desc")
      .take(100);
  },
});
