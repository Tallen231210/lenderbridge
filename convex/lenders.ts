/**
 * Lender database queries — admin only.
 * Supports text search, compound filtering, and pagination.
 * The lender database contains ~7,000 records seeded from scripts/seed-lenders.ts.
 */
import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers/auth";

/**
 * Search and filter lenders with pagination.
 * Supports compound filtering on multiple fields simultaneously.
 * Results update in real-time as filters change (via Convex reactive queries).
 */
export const searchLenders = query({
  args: {
    searchText: v.optional(v.string()),
    specialty: v.optional(v.string()),
    state: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    loanType: v.optional(v.string()),
    minLoanAmount: v.optional(v.number()),
    maxLoanAmount: v.optional(v.number()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const pageSize = args.pageSize || 50;
    const page = args.page || 0;

    // Start with all lenders
    let lenders = await ctx.db.query("lenders").collect();

    // Apply text search filter (name and contact_name)
    if (args.searchText && args.searchText.length > 0) {
      const search = args.searchText.toLowerCase();
      lenders = lenders.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          (l.contact_name && l.contact_name.toLowerCase().includes(search))
      );
    }

    // Apply compound filters — each filter narrows the results
    if (args.specialty) {
      lenders = lenders.filter((l) =>
        l.specialties.includes(args.specialty!)
      );
    }
    if (args.state) {
      lenders = lenders.filter((l) =>
        l.states_covered.includes(args.state!)
      );
    }
    if (args.propertyType) {
      lenders = lenders.filter((l) =>
        l.property_types.includes(args.propertyType!)
      );
    }
    if (args.loanType) {
      lenders = lenders.filter((l) =>
        l.loan_types.includes(args.loanType!)
      );
    }
    if (args.minLoanAmount !== undefined) {
      lenders = lenders.filter(
        (l) => !l.max_loan || l.max_loan >= args.minLoanAmount!
      );
    }
    if (args.maxLoanAmount !== undefined) {
      lenders = lenders.filter(
        (l) => !l.min_loan || l.min_loan <= args.maxLoanAmount!
      );
    }

    const total = lenders.length;

    // Cursor-based pagination — slice the results for the current page
    const start = page * pageSize;
    const paginatedLenders = lenders.slice(start, start + pageSize);
    const hasMore = start + pageSize < total;

    return {
      lenders: paginatedLenders,
      total,
      page,
      pageSize,
      hasMore,
    };
  },
});

/**
 * Get a single lender by ID — admin only.
 */
export const getLender = query({
  args: { lenderId: v.id("lenders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.lenderId);
  },
});
