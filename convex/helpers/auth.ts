/**
 * Authentication and authorization helpers for Convex.
 * USE THESE IN EVERY QUERY AND MUTATION — no exceptions.
 *
 * Pattern: Every Convex function starts with one of these helpers to verify
 * the user is authenticated and has the correct role before any data access.
 */
import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Get the authenticated user or throw UNAUTHORIZED.
 * Looks up the Convex user record by email from the Clerk JWT identity.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();

  if (!user) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "User record not found",
    });
  }

  return user;
}

/**
 * Require a specific role (admin, partner, or borrower).
 * Calls requireAuth first, then checks the role field on the user record.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  role: "admin" | "partner" | "borrower"
) {
  const user = await requireAuth(ctx);
  if (user.role !== role) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Insufficient permissions",
    });
  }
  return user;
}

/**
 * Shorthand for requireRole(ctx, "admin").
 * Used in all admin-only mutations (deal stage transitions, lender management, etc.).
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  return requireRole(ctx, "admin");
}

/**
 * Require partner role AND verify they own the resource.
 * Used when a partner tries to access a specific deal — ensures they
 * can only see/modify their own deals, not other partners' deals.
 */
export async function requirePartnerOwnership(
  ctx: QueryCtx | MutationCtx,
  dealPartnerId: Id<"users">
) {
  const user = await requireRole(ctx, "partner");

  // SECURITY: Partners should only ever see/modify their own deals
  if (user._id !== dealPartnerId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "You do not have access to this resource",
    });
  }

  return user;
}
