/**
 * Demo data seed script — creates realistic sample data for evaluation.
 * Seeds users, deals across all pipeline stages, commissions, activities,
 * and notifications. Run after Clerk demo users are created.
 *
 * Run with: npx convex run seedDemoData:seedAll
 *
 * Pre-requisite: 5 Clerk users must exist (synced via webhook):
 *   - 1 admin (broker)
 *   - 3 partners (referral agents)
 *   - 1 borrower
 */
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ── Timestamp helpers ────────────────────────────────────────

const NOW = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

function daysAgo(days: number): number {
  return NOW - days * DAY;
}

function hoursAgo(hours: number): number {
  return NOW - hours * HOUR;
}

// ── Demo deal templates ──────────────────────────────────────

interface DealTemplate {
  borrower_name: string;
  borrower_email: string;
  borrower_phone: string;
  borrower_company: string;
  property_address: string;
  property_type: string;
  transaction_type: string;
  loan_type: string;
  loan_amount: number;
  status: string;
  daysOld: number;
  stageAge: number;
  notes?: string;
  estimated_close?: string;
}

/** 12 deals spanning all pipeline stages for realistic demo */
const DEAL_TEMPLATES: DealTemplate[] = [
  // ── Active deals across pipeline stages ──
  {
    borrower_name: "Marcus Chen",
    borrower_email: "marcus.chen@example.com",
    borrower_phone: "(415) 555-0101",
    borrower_company: "Chen Investments LLC",
    property_address: "1250 Market St, San Francisco, CA 94102",
    property_type: "office",
    transaction_type: "purchase",
    loan_type: "permanent",
    loan_amount: 4500000,
    status: "submitted",
    daysOld: 2,
    stageAge: 2,
  },
  {
    borrower_name: "Sarah Williams",
    borrower_email: "sarah.w@example.com",
    borrower_phone: "(310) 555-0202",
    borrower_company: "Williams Properties",
    property_address: "8900 Sunset Blvd, Los Angeles, CA 90069",
    property_type: "retail",
    transaction_type: "refinance",
    loan_type: "permanent",
    loan_amount: 2800000,
    status: "under_review",
    daysOld: 7,
    stageAge: 5,
    notes: "[2/9] Reviewing financials — borrower has strong DSCR.\n",
  },
  {
    borrower_name: "David Park",
    borrower_email: "dpark@example.com",
    borrower_phone: "(702) 555-0303",
    borrower_company: "Park Capital Group",
    property_address: "4500 Paradise Rd, Las Vegas, NV 89169",
    property_type: "multifamily",
    transaction_type: "purchase",
    loan_type: "bridge",
    loan_amount: 8200000,
    status: "lender_assigned",
    daysOld: 14,
    stageAge: 7,
    estimated_close: "2026-04-15",
    notes: "[2/4] Assigned to Pacific Bridge Capital — strong fit for multifamily bridge.\n",
  },
  {
    borrower_name: "Jennifer Martinez",
    borrower_email: "jmartinez@example.com",
    borrower_phone: "(512) 555-0404",
    borrower_company: "Martinez Development",
    property_address: "2100 S Lamar Blvd, Austin, TX 78704",
    property_type: "mixed_use",
    transaction_type: "construction",
    loan_type: "construction",
    loan_amount: 12500000,
    status: "term_sheet",
    daysOld: 21,
    stageAge: 5,
    estimated_close: "2026-05-01",
    notes: "[2/6] Term sheet received at 6.25% — borrower reviewing.\n[1/28] Construction timeline looks solid — 18 months to completion.\n",
  },
  {
    borrower_name: "Robert Kim",
    borrower_email: "rkim@example.com",
    borrower_phone: "(206) 555-0505",
    borrower_company: "Kim Holdings",
    property_address: "1800 Westlake Ave N, Seattle, WA 98109",
    property_type: "industrial",
    transaction_type: "purchase",
    loan_type: "permanent",
    loan_amount: 6700000,
    status: "processing",
    daysOld: 30,
    stageAge: 8,
    estimated_close: "2026-03-20",
    notes: "[2/3] Appraisal ordered — expecting results by 2/10.\n[1/25] Borrower provided all docs. Clean file.\n",
  },
  {
    borrower_name: "Amanda Foster",
    borrower_email: "afoster@example.com",
    borrower_phone: "(602) 555-0606",
    borrower_company: "Foster Real Estate Group",
    property_address: "3200 N Central Ave, Phoenix, AZ 85012",
    property_type: "multifamily",
    transaction_type: "refinance",
    loan_type: "permanent",
    loan_amount: 15000000,
    status: "underwriting",
    daysOld: 45,
    stageAge: 12,
    estimated_close: "2026-03-01",
    notes: "[1/30] Underwriting in progress — minor tax return questions.\n[1/15] Strong deal — 72-unit Class B multifamily, 95% occupied.\n",
  },
  {
    borrower_name: "Thomas Wright",
    borrower_email: "twright@example.com",
    borrower_phone: "(305) 555-0707",
    borrower_company: "Wright Capital LLC",
    property_address: "500 Brickell Key Dr, Miami, FL 33131",
    property_type: "office",
    transaction_type: "purchase",
    loan_type: "permanent",
    loan_amount: 22000000,
    status: "clear_to_close",
    daysOld: 60,
    stageAge: 3,
    estimated_close: "2026-02-15",
    notes: "[2/8] Clear to close — scheduling for 2/15.\n[1/20] All conditions satisfied.\n",
  },
  // ── Terminal deals ──
  {
    borrower_name: "Lisa Chang",
    borrower_email: "lchang@example.com",
    borrower_phone: "(212) 555-0808",
    borrower_company: "Chang & Associates",
    property_address: "350 5th Ave, New York, NY 10118",
    property_type: "retail",
    transaction_type: "purchase",
    loan_type: "permanent",
    loan_amount: 9500000,
    status: "closed",
    daysOld: 90,
    stageAge: 10,
    notes: "[11/13] Deal closed successfully — $47,500 commission to partner.\n",
  },
  {
    borrower_name: "Brian O'Connor",
    borrower_email: "boconnor@example.com",
    borrower_phone: "(720) 555-0909",
    borrower_company: "",
    property_address: "1600 Wynkoop St, Denver, CO 80202",
    property_type: "land",
    transaction_type: "purchase",
    loan_type: "land",
    loan_amount: 1200000,
    status: "declined",
    daysOld: 35,
    stageAge: 10,
    notes: "[1/7] Declined — lender unwilling to finance raw land in this submarket.\n",
  },
  {
    borrower_name: "Nicole Peters",
    borrower_email: "npeters@example.com",
    borrower_phone: "(404) 555-1010",
    borrower_company: "Peters Dental Group",
    property_address: "2800 Peachtree Rd NW, Atlanta, GA 30305",
    property_type: "other",
    transaction_type: "purchase",
    loan_type: "sba",
    loan_amount: 1800000,
    status: "dead",
    daysOld: 40,
    stageAge: 15,
    notes: "[1/2] Borrower withdrew — found alternative financing through personal bank.\n",
  },
  // ── Additional active deals for volume ──
  {
    borrower_name: "Daniel Brooks",
    borrower_email: "dbrooks@example.com",
    borrower_phone: "(773) 555-1111",
    borrower_company: "Brooks Property Management",
    property_address: "4700 N Sheridan Rd, Chicago, IL 60640",
    property_type: "multifamily",
    transaction_type: "refinance",
    loan_type: "bridge",
    loan_amount: 3400000,
    status: "submitted",
    daysOld: 1,
    stageAge: 1,
  },
  {
    borrower_name: "Rachel Green",
    borrower_email: "rgreen@example.com",
    borrower_phone: "(619) 555-1212",
    borrower_company: "Coastal Self Storage",
    property_address: "9100 Mira Mesa Blvd, San Diego, CA 92126",
    property_type: "industrial",
    transaction_type: "cash_out",
    loan_type: "permanent",
    loan_amount: 5100000,
    status: "under_review",
    daysOld: 5,
    stageAge: 3,
    notes: "[2/8] Self-storage facility — reviewing occupancy reports.\n",
  },
];

/**
 * Seed all demo data: deals, activities, commissions, and notifications.
 * Requires users to already exist in the database (synced from Clerk).
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // ── Find existing users by role ──
    const allUsers = await ctx.db.query("users").collect();
    const admin = allUsers.find((u) => u.role === "admin");
    const partners = allUsers.filter((u) => u.role === "partner");
    const borrower = allUsers.find((u) => u.role === "borrower");

    if (!admin) {
      return { status: "error", message: "No admin user found. Create Clerk users first." };
    }
    if (partners.length === 0) {
      return { status: "error", message: "No partner users found. Create Clerk users first." };
    }

    // Check if deals already exist
    const existingDeals = await ctx.db.query("deals").take(1);
    if (existingDeals.length > 0) {
      return { status: "already_seeded", message: "Deals already exist. Clear data first to re-seed." };
    }

    // Get some lenders for assignment
    const lenders = await ctx.db.query("lenders").take(10);

    const dealIds: Id<"deals">[] = [];
    const partnerDealMap: Map<Id<"users">, Id<"deals">[]> = new Map();

    // ── Create deals ──
    for (let i = 0; i < DEAL_TEMPLATES.length; i++) {
      const template = DEAL_TEMPLATES[i];
      // Distribute deals across partners (round-robin)
      const partner = partners[i % partners.length];
      const assignedLender = (template.status !== "submitted" && template.status !== "under_review" && lenders.length > 0)
        ? lenders[i % lenders.length]._id
        : undefined;

      const dealId = await ctx.db.insert("deals", {
        partner_id: partner._id,
        borrower_name: template.borrower_name,
        borrower_email: template.borrower_email,
        borrower_phone: template.borrower_phone,
        borrower_company: template.borrower_company || undefined,
        borrower_id: (borrower && i === 0) ? borrower._id : undefined,
        property_address: template.property_address,
        property_type: template.property_type,
        transaction_type: template.transaction_type,
        loan_type: template.loan_type,
        loan_amount: template.loan_amount,
        status: template.status,
        assigned_lender_id: assignedLender,
        stage_entered_at: daysAgo(template.stageAge),
        estimated_close: template.estimated_close,
        notes: template.notes,
        created_at: daysAgo(template.daysOld),
      });

      dealIds.push(dealId);

      // Track deals per partner for commission creation
      const existing = partnerDealMap.get(partner._id) || [];
      existing.push(dealId);
      partnerDealMap.set(partner._id, existing);

      // ── Create activity trail for this deal ──

      // Always log the submission
      await ctx.db.insert("deal_activities", {
        deal_id: dealId,
        actor_id: partner._id,
        action: "deal_submitted",
        to_status: "submitted",
        details: `Deal submitted by ${partner.name}`,
        created_at: daysAgo(template.daysOld),
      });

      // Log stage progressions for deals past submitted
      const stages = ["submitted", "under_review", "lender_assigned", "term_sheet", "processing", "underwriting", "clear_to_close", "closed"];
      const currentIndex = stages.indexOf(template.status);
      const terminalIndex = ["declined", "dead"].indexOf(template.status);

      if (currentIndex > 0) {
        for (let s = 0; s < currentIndex; s++) {
          await ctx.db.insert("deal_activities", {
            deal_id: dealId,
            actor_id: admin._id,
            action: "status_change",
            from_status: stages[s],
            to_status: stages[s + 1],
            details: `Status changed from ${stages[s]} to ${stages[s + 1]}`,
            created_at: daysAgo(template.daysOld - (s + 1) * 3),
          });
        }
      }

      // Log terminal status changes
      if (terminalIndex >= 0) {
        await ctx.db.insert("deal_activities", {
          deal_id: dealId,
          actor_id: admin._id,
          action: "status_change",
          from_status: "under_review",
          to_status: template.status,
          details: `Deal marked as ${template.status}`,
          created_at: daysAgo(template.stageAge),
        });
      }

      // Log lender assignment if applicable
      if (assignedLender) {
        await ctx.db.insert("deal_activities", {
          deal_id: dealId,
          actor_id: admin._id,
          action: "lender_assigned",
          details: "Lender assigned to deal",
          created_at: daysAgo(template.daysOld - 5),
        });
      }
    }

    // ── Create commissions for closed deals ──
    const partnerEntries = Array.from(partnerDealMap.entries());
    for (const [partnerId, deals] of partnerEntries) {
      const partner = allUsers.find((u) => u._id === partnerId);
      const rate = partner?.commission_rate || 0.005;

      for (const dealId of deals) {
        // Look up deal from our templates (index matches dealIds array)
        const dealIndex = dealIds.indexOf(dealId);
        if (dealIndex < 0) continue;
        const template = DEAL_TEMPLATES[dealIndex];

        if (template.status === "closed") {
          await ctx.db.insert("commissions", {
            deal_id: dealId,
            partner_id: partnerId,
            amount: template.loan_amount * rate,
            rate,
            status: "paid",
            paid_date: "2025-12-15",
            created_at: daysAgo(85),
          });
        } else if (template.status === "clear_to_close" || template.status === "underwriting") {
          await ctx.db.insert("commissions", {
            deal_id: dealId,
            partner_id: partnerId,
            amount: template.loan_amount * rate,
            rate,
            status: "pending",
            created_at: daysAgo(20),
          });
        } else if (template.status === "dead" || template.status === "declined") {
          await ctx.db.insert("commissions", {
            deal_id: dealId,
            partner_id: partnerId,
            amount: template.loan_amount * rate,
            rate,
            status: "voided",
            created_at: daysAgo(30),
          });
        }
      }
    }

    // ── Create notifications for partners ──
    for (const partner of partners) {
      // Recent deal status update notification
      await ctx.db.insert("notifications", {
        user_id: partner._id,
        deal_id: dealIds[0],
        type: "status_changed",
        title: "Deal Status Updated",
        message: "Your deal at 1250 Market St has been moved to Under Review.",
        read: false,
        created_at: hoursAgo(2),
      });

      await ctx.db.insert("notifications", {
        user_id: partner._id,
        deal_id: dealIds[2],
        type: "lender_assigned",
        title: "Lender Assigned",
        message: "A lender has been assigned to the deal at 4500 Paradise Rd.",
        read: false,
        created_at: daysAgo(7),
      });

      await ctx.db.insert("notifications", {
        user_id: partner._id,
        type: "commission_updated",
        title: "Commission Payment Processed",
        message: "Your commission of $47,500 for the deal at 350 5th Ave has been marked as paid.",
        read: true,
        created_at: daysAgo(10),
      });

      await ctx.db.insert("notifications", {
        user_id: partner._id,
        type: "status_changed",
        title: "Deal Approaching Close",
        message: "Your deal at 500 Brickell Key Dr is now Clear to Close. Estimated close date: 2/15.",
        read: true,
        created_at: daysAgo(3),
      });
    }

    // Notification for admin on new submissions
    await ctx.db.insert("notifications", {
      user_id: admin._id,
      deal_id: dealIds[0],
      type: "deal_submitted",
      title: "New Deal Submitted",
      message: `${partners[0].name} submitted a new deal at 1250 Market St, San Francisco.`,
      read: false,
      created_at: hoursAgo(2),
    });

    await ctx.db.insert("notifications", {
      user_id: admin._id,
      deal_id: dealIds[10],
      type: "deal_submitted",
      title: "New Deal Submitted",
      message: `${partners[1 % partners.length].name} submitted a new deal at 4700 N Sheridan Rd, Chicago.`,
      read: false,
      created_at: hoursAgo(12),
    });

    return {
      status: "success",
      message: `Seeded ${DEAL_TEMPLATES.length} deals, activities, commissions, and notifications.`,
    };
  },
});

/**
 * Utility: clear all demo data (deals, activities, commissions, notifications).
 * Does NOT clear users or lenders.
 * Run with: npx convex run seedDemoData:clearAll
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["deals", "deal_activities", "commissions", "notifications"] as const;
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      counts[table] = records.length;
    }

    return { status: "success", deleted: counts };
  },
});
