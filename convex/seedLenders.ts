/**
 * Lender seed script — generates 7,000 realistic lender records.
 * Run via Convex dashboard or `npx convex run seedLenders:seedAll`.
 * Uses batch inserts (100 per batch) to avoid timeout limits.
 * Data includes varied institution names, contact info, specialties,
 * geographic coverage, loan ranges, and broker notes.
 */
import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Name generation data ────────────────────────────────────────

const PREFIXES = [
  "First", "Pacific", "American", "National", "Western", "Capital",
  "Heritage", "Liberty", "United", "Continental", "Meridian", "Pinnacle",
  "Summit", "Golden", "Silver", "Coastal", "Mountain", "Valley", "Harbor",
  "Keystone", "Cornerstone", "Republic", "Eagle", "Falcon", "Sterling",
  "Patriot", "Pioneer", "Frontier", "Century", "Metropolitan", "Atlantic",
  "Southern", "Northern", "Eastern", "Midwest", "Central", "Tri-State",
  "Crossroads", "Gateway", "Landmark", "Beacon", "Crown", "Vanguard",
  "Cascade", "Ironwood", "Redwood", "Evergreen", "Oakmont", "Maplewood",
  "Cedarpoint", "Granite", "Marble", "Sapphire", "Emerald", "Diamond",
  "Platinum", "Titanium", "Apex", "Zenith", "Horizon", "Elevation",
];

const SUFFIXES = [
  "Bank", "Capital", "Lending", "Financial", "Mortgage", "Funding",
  "Credit Union", "Savings", "Trust", "Partners", "Group", "Finance",
  "Bancorp", "Investments", "Holdings", "Commercial", "Corp", "LLC",
  "Associates", "Advisors", "Securities", "Bancshares",
];

const FIRST_NAMES = [
  "James", "Robert", "John", "Michael", "David", "William", "Richard",
  "Joseph", "Thomas", "Christopher", "Charles", "Daniel", "Matthew",
  "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth",
  "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty",
  "Margaret", "Sandra", "Ashley", "Dorothy", "Kimberly", "Emily",
  "Donna", "Michelle", "Carol", "Amanda", "Melissa", "Deborah",
  "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Maria",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts",
];

/** All 50 US state abbreviations */
const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const PROPERTY_TYPES = [
  "multifamily", "retail", "office", "industrial", "mixed_use", "land", "other",
];

const LOAN_TYPES = [
  "permanent", "bridge", "construction", "land", "sba", "mezzanine",
];

const SPECIALTIES = [
  "multifamily", "retail", "office", "industrial", "mixed_use",
  "hospitality", "healthcare", "self_storage", "mobile_home_parks",
  "senior_housing", "student_housing", "affordable_housing",
];

const NOTES = [
  "Fast closer, reliable on timelines",
  "Strict on credit score requirements",
  "Preferred for multifamily deals over $5M",
  "Good rates but slow underwriting",
  "Great for first-time borrowers",
  "Requires 12+ months operating history",
  "Flexible on property condition",
  "Strong in secondary markets",
  "Best rates in portfolio",
  "Excellent communication throughout process",
  "Requires phase 1 environmental on all deals",
  "Will do deals with existing litigation",
  "Non-recourse options available",
  "Interest-only period available",
  "Strong government-backed lending program",
  "Quick to term sheet, thorough in underwriting",
  "Prefers stabilized assets only",
  "Good bridge-to-perm programs",
  "Competitive on construction loans",
  "Portfolio lender — no secondary market constraints",
  "",
  "",
  "",
];

// ── Deterministic random (seeded) for reproducibility ────────

/** Simple seeded pseudo-random number generator (mulberry32) */
function createRng(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickMultiple<T>(arr: readonly T[], min: number, max: number, rng: () => number): T[] {
  const count = min + Math.floor(rng() * (max - min + 1));
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/** Generate a single lender record deterministically by index */
function generateLender(index: number) {
  const rng = createRng(index * 7919 + 42);

  const name = `${pick(PREFIXES, rng)} ${pick(SUFFIXES, rng)}`;
  const contactFirst = pick(FIRST_NAMES, rng);
  const contactLast = pick(LAST_NAMES, rng);
  const contact_name = `${contactFirst} ${contactLast}`;

  const domain = name.toLowerCase().replace(/[^a-z]/g, "") + ".com";
  const email = `${contactFirst.toLowerCase()}.${contactLast.toLowerCase()}@${domain}`;
  const areaCode = 200 + Math.floor(rng() * 799);
  const phone = `(${areaCode}) ${100 + Math.floor(rng() * 900)}-${1000 + Math.floor(rng() * 9000)}`;

  const specialties = pickMultiple(SPECIALTIES, 1, 4, rng);
  const property_types = pickMultiple(PROPERTY_TYPES, 1, 5, rng);
  const loan_types = pickMultiple(LOAN_TYPES, 1, 4, rng);

  // Most lenders cover a regional footprint (3-15 states)
  const stateCount = rng() < 0.1 ? 50 : (rng() < 0.3 ? Math.floor(rng() * 30) + 15 : Math.floor(rng() * 12) + 3);
  const states_covered = pickMultiple(STATES, stateCount, stateCount, rng);

  // Loan ranges — varied by lender size
  const sizeRng = rng();
  let min_loan: number;
  let max_loan: number;
  if (sizeRng < 0.3) {
    // Small lender: $100K–$5M
    min_loan = 100000;
    max_loan = 5000000;
  } else if (sizeRng < 0.7) {
    // Mid-size lender: $500K–$25M
    min_loan = 500000;
    max_loan = 25000000;
  } else if (sizeRng < 0.9) {
    // Large lender: $1M–$100M
    min_loan = 1000000;
    max_loan = 100000000;
  } else {
    // Mega lender: $5M–$500M+
    min_loan = 5000000;
    max_loan = 500000000;
  }

  const notes = pick(NOTES, rng) || undefined;

  return {
    name,
    contact_name,
    email,
    phone,
    specialties,
    property_types,
    states_covered,
    min_loan,
    max_loan,
    loan_types,
    notes,
  };
}

// ── Seed mutation — inserts a batch of lenders ──────────────

/**
 * Insert a batch of lender records.
 * Called repeatedly by seedAll or the batch runner script.
 * Batch size of 100 stays well under Convex mutation limits.
 */
export const seedBatch = internalMutation({
  args: {
    startIndex: v.number(),
    count: v.number(),
  },
  handler: async (ctx, { startIndex, count }) => {
    const promises = [];
    for (let i = startIndex; i < startIndex + count; i++) {
      const lender = generateLender(i);
      promises.push(ctx.db.insert("lenders", lender));
    }
    await Promise.all(promises);
    return { inserted: count, from: startIndex, to: startIndex + count - 1 };
  },
});

/**
 * Public entry point: seed all 7,000 lender records in batches.
 * Run with: npx convex run seedLenders:seedAll
 * Checks existing count to avoid duplicate seeding.
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("lenders").take(1);
    if (existing.length > 0) {
      return { status: "already_seeded", message: "Lenders table already has data. Clear it first to re-seed." };
    }

    // Insert 7,000 records in batches of 100 within this mutation
    const TOTAL = 7000;
    const BATCH = 100;

    for (let start = 0; start < TOTAL; start += BATCH) {
      const batchSize = Math.min(BATCH, TOTAL - start);
      const promises = [];
      for (let i = start; i < start + batchSize; i++) {
        promises.push(ctx.db.insert("lenders", generateLender(i)));
      }
      await Promise.all(promises);
    }

    return { status: "success", message: `Seeded ${TOTAL} lender records.` };
  },
});

/**
 * Utility: clear all lender records for re-seeding.
 * Run with: npx convex run seedLenders:clearAll
 * WARNING: Destructive — removes all lender data.
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const lenders = await ctx.db.query("lenders").collect();
    for (const lender of lenders) {
      await ctx.db.delete(lender._id);
    }
    return { deleted: lenders.length };
  },
});
