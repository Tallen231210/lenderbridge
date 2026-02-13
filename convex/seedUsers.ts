/**
 * Seed utilities for user management.
 * Run with: npx convex run seedUsers:<function>
 */
import { mutation } from "./_generated/server";

/** Set commission rates on all partner users. */
export const setCommissionRates = mutation({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "partner"))
      .collect();

    for (const partner of partners) {
      await ctx.db.patch(partner._id, { commission_rate: 0.005 });
    }

    return { updated: partners.length };
  },
});

/** Delete all users — used when Clerk accounts are recreated with new IDs. */
export const clearAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    return { deleted: users.length };
  },
});
