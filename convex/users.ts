/**
 * User queries and mutations.
 * Users are synced from Clerk via webhooks. Role determines portal access.
 * Admin can update roles; users can update their own profile fields.
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireAuth, requireAdmin } from "./helpers/auth";

/**
 * Create a new user — called by the Clerk webhook on user.created.
 * Defaults to "borrower" role; admin manually promotes to partner/admin.
 */
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    clerk_id: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("partner"),
      v.literal("borrower")
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already exists (prevent duplicates from webhook retries)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_id))
      .unique();

    if (existing) {
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      clerk_id: args.clerk_id,
      role: args.role,
      created_at: Date.now(),
    });

    return userId;
  },
});

/**
 * Update a user's name and email by Clerk ID — called by webhook on user.updated.
 */
export const updateUserByClerkId = mutation({
  args: {
    clerk_id: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_id))
      .unique();

    if (!user) {
      // User not in our system yet — ignore the update
      return null;
    }

    await ctx.db.patch(user._id, {
      email: args.email.toLowerCase(),
      name: args.name,
    });

    return user._id;
  },
});

/**
 * Get the currently authenticated user's record.
 * Used by the useCurrentUser hook to determine which portal to show.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    return user;
  },
});

/**
 * Get all partner users — admin only.
 * Used on the admin Partners management page.
 */
export const getPartners = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "partner"))
      .collect();
  },
});

/**
 * Update a user's role — admin only.
 * Used to promote users to partner or admin.
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("partner"),
      v.literal("borrower")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return args.userId;
  },
});

/**
 * Update the current user's profile fields (phone, company, license_number).
 * Users can only update their own profile.
 */
export const updateProfile = mutation({
  args: {
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    license_number: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    await ctx.db.patch(user._id, {
      ...(args.phone !== undefined && { phone: args.phone }),
      ...(args.company !== undefined && { company: args.company }),
      ...(args.license_number !== undefined && {
        license_number: args.license_number,
      }),
    });

    return user._id;
  },
});
