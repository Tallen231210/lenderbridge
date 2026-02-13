/**
 * One-time utility to set commission rates on partner users.
 * Run with: npx convex run seedUsers:setCommissionRates
 */
import { mutation } from "./_generated/server";

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
