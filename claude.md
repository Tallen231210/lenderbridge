# CLAUDE.md — LenderBridge

## Project Overview
LenderBridge is a commercial loan referral platform with three role-based portals: Partner Portal, Borrower Portal, and Admin Dashboard. It replaces a manual process where a commercial loan broker is the single bottleneck in his business.

**Core principle:** The broker's competitive advantage is his lender relationships and institutional knowledge — not technology. This platform amplifies that advantage by removing administrative friction, not by trying to automate his expertise.

**Target users:** Non-technical salespeople (realtors, loan officers). Money-motivated, impatient, will abandon anything complicated.

---

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Backend + DB:** Convex
- **Auth:** Clerk (@clerk/nextjs)
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend (React Email templates)
- **Hosting:** Vercel
- **Address Input:** Google Places API (deal submission autocomplete)

---

## Handoff-Readiness Principles
This codebase is evaluated on whether another engineer could pick it up and keep building. Every decision below serves that goal.

1. **Consistent file structure** — Every feature follows the same pattern: page in app router, components in /components, Convex functions in /convex, shared helpers in /lib.
2. **Self-documenting code** — File-level, function-level, and inline comments explain WHY, not just WHAT. See "Code Commenting Standards" below.
3. **Clean git history** — Conventional commit messages. Small, logical commits. See "Git Commit Conventions" below.
4. **Separation of concerns** — Auth logic in helpers, validation in helpers, UI in components, business logic in Convex mutations. No god files.
5. **Consistent patterns** — Every mutation follows the same pattern: auth check → validate → execute → side effects. A new developer learns the pattern once and can read any mutation.
6. **No magic** — No clever abstractions that require tribal knowledge. Explicit over implicit. Readable over clever.
7. **README as onboarding doc** — A new developer should be able to clone, read the README, and run the project locally in under 10 minutes.

---

## GitHub Repository Standards — CRITICAL

The evaluators will inspect the GitHub repo directly. It must look like a professional, production codebase.

### .gitignore (create this FIRST, before any other files)
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables — NEVER commit secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js build
.next/
out/

# Convex generated
convex/_generated/

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Vercel
.vercel
```

### What must NEVER be in the repo:
- ❌ `.env.local` or any file with API keys, secrets, or passwords
- ❌ `node_modules/` folder
- ❌ Console.log statements left in production code (use proper error logging instead)
- ❌ Commented-out code blocks (delete unused code, git history preserves it)
- ❌ TODO comments without context (if you must leave a TODO, explain what and why)
- ❌ Large generated files or build artifacts

### What MUST be in the repo:
- ✅ `.gitignore` (first file committed)
- ✅ `README.md` (comprehensive, well-formatted — this is the repo's landing page)
- ✅ `claude.md` (shows the architectural spec — demonstrates planning)
- ✅ Clean, organized folder structure matching the project structure spec
- ✅ `package.json` with all dependencies properly listed
- ✅ TypeScript config files

### Commit Hygiene:
- Commit after each logical unit of work is complete and working
- Never commit broken code to main branch
- Each commit message follows Conventional Commits format (see below)
- Aim for 20-40 total commits across the build — this shows steady, incremental progress
- The git log should read like a story: scaffolding → foundation → features → testing → polish → deploy

---

## Project Structure
```
lenderbridge/
├── claude.md
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                    # Never commit — in .gitignore
├── convex/
│   ├── _generated/
│   ├── schema.ts                 # All 6 table definitions + 1 error_logs table
│   ├── auth.config.ts            # Clerk integration config
│   ├── http.ts                   # Clerk webhook endpoint with signature verification
│   ├── helpers/
│   │   ├── auth.ts               # requireRole(), requireAdmin(), requirePartnerOwnership()
│   │   ├── validation.ts         # Input sanitization and validation helpers
│   │   └── errors.ts             # Typed error classes (AuthError, ValidationError, NotFoundError)
│   ├── users.ts                  # User queries and mutations
│   ├── deals.ts                  # Deal CRUD + status transitions
│   ├── lenders.ts                # Lender queries (search, filter, paginate)
│   ├── commissions.ts            # Commission CRUD
│   ├── activities.ts             # Deal activity log queries
│   ├── notifications.ts          # Notification CRUD + mark-read
│   └── errorLogs.ts              # Automated error telemetry mutations
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with ClerkProvider + ConvexProvider
│   │   ├── page.tsx              # Landing/redirect based on role
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/
│   │   │   ├── [[...sign-up]]/page.tsx
│   │   │   └── partner/page.tsx  # Partner-specific signup
│   │   ├── (partner)/            # Route group — partner portal
│   │   │   ├── layout.tsx        # Partner layout with sidebar nav
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx      # Deal list/tracker
│   │   │   │   ├── new/page.tsx  # Deal submission wizard
│   │   │   │   └── [id]/page.tsx # Deal detail view
│   │   │   ├── commissions/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── resources/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── (borrower)/           # Route group — borrower portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx  # Deal status view
│   │   │   └── profile/page.tsx
│   │   ├── (admin)/              # Route group — admin dashboard
│   │   │   ├── layout.tsx        # Admin layout with sidebar nav
│   │   │   ├── dashboard/page.tsx  # Kanban pipeline board
│   │   │   ├── deals/[id]/page.tsx # Deal detail + actions
│   │   │   ├── lenders/page.tsx    # Lender database search/filter
│   │   │   ├── partners/page.tsx   # Partner management
│   │   │   ├── commissions/page.tsx
│   │   │   ├── activity/page.tsx   # Global activity log
│   │   │   └── system-health/page.tsx  # Error telemetry dashboard
│   │   └── api/
│   │       └── webhooks/
│   │           └── clerk/route.ts  # Clerk webhook handler
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layouts/
│   │   │   ├── PartnerSidebar.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── BorrowerNav.tsx
│   │   ├── deals/
│   │   │   ├── DealSubmissionWizard.tsx
│   │   │   ├── DealCard.tsx      # Kanban card
│   │   │   ├── DealDetailView.tsx
│   │   │   ├── DealStatusBadge.tsx
│   │   │   └── DealStageTimeline.tsx
│   │   ├── pipeline/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── KanbanDragProvider.tsx
│   │   ├── lenders/
│   │   │   ├── LenderSearchTable.tsx
│   │   │   ├── LenderFilters.tsx
│   │   │   └── LenderAssignModal.tsx
│   │   ├── commissions/
│   │   │   ├── CommissionTable.tsx
│   │   │   └── CommissionStats.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationList.tsx
│   │   ├── shared/
│   │   │   ├── ErrorBoundary.tsx  # Reusable error boundary with telemetry
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── Toast.tsx
│   │   └── providers/
│   │       ├── ConvexClientProvider.tsx
│   │       └── ErrorTelemetryProvider.tsx
│   ├── lib/
│   │   ├── constants.ts          # Deal stages, property types, loan types enums
│   │   ├── utils.ts              # Formatting helpers (currency, dates, etc.)
│   │   └── validators.ts         # Client-side validation schemas (zod)
│   ├── hooks/
│   │   ├── useCurrentUser.ts     # Get current user with role
│   │   ├── useRequireRole.ts     # Redirect if wrong role
│   │   └── useErrorHandler.ts    # Standardized error handling hook
│   └── middleware.ts             # Clerk auth middleware + role-based redirects
├── scripts/
│   └── seed-lenders.ts           # Lender data import script
└── public/
    └── ...
```

---

## SECURITY — CRITICAL REQUIREMENTS

Security is a first-class architectural concern, not an afterthought. Every layer must enforce security independently.

### 1. Authentication (Clerk)
- All pages except landing and sign-in/sign-up require authentication via Clerk middleware
- `middleware.ts` uses `clerkMiddleware()` to protect all routes
- Public routes whitelist: `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks/(.*)`

### 2. Authorization (Role-Based Access Control)
Every Convex query and mutation MUST begin with role verification. No exceptions.

```typescript
// convex/helpers/auth.ts — USE THESE IN EVERY QUERY/MUTATION

// Get authenticated user or throw
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();
  if (!user) {
    throw new ConvexError({ code: "USER_NOT_FOUND", message: "User record not found" });
  }
  return user;
}

// Require specific role
export async function requireRole(ctx: QueryCtx | MutationCtx, role: "admin" | "partner" | "borrower") {
  const user = await requireAuth(ctx);
  if (user.role !== role) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Insufficient permissions" });
  }
  return user;
}

// Require admin
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  return requireRole(ctx, "admin");
}

// Require partner AND verify they own the resource
export async function requirePartnerOwnership(ctx: QueryCtx | MutationCtx, dealPartnerId: Id<"users">) {
  const user = await requireRole(ctx, "partner");
  if (user._id !== dealPartnerId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "You do not have access to this resource" });
  }
  return user;
}
```

### 3. Row-Level Security Rules
| Table | Admin | Partner | Borrower |
|-------|-------|---------|----------|
| users | Read all | Read own only | Read own only |
| deals | Read/write all | Read own (by partner_id). Create new. No edit after submit. | Read own (by borrower_id). Read-only. |
| lenders | Read/write all | NO ACCESS | NO ACCESS |
| commissions | Read/write all | Read own (by partner_id). No write. | NO ACCESS |
| deal_activities | Read all | Read own deals' activities | Read own deal's activities |
| notifications | Read all | Read own (by user_id). Mark own as read. | Read own (by user_id) |

### 4. Clerk Webhook Security
```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';

// ALWAYS verify webhook signature before processing
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Process verified event...
}
```

### 5. Input Validation (Dual Layer)
**Client-side:** Zod schemas validate form input before submission. Provides instant user feedback.
**Server-side:** Convex mutations re-validate ALL inputs. NEVER trust client data.

```typescript
// convex/helpers/validation.ts
export function validateDealInput(args: any) {
  // Sanitize strings — trim whitespace, remove script tags
  const sanitize = (s: string) => s.trim().replace(/<[^>]*>/g, '');

  if (!args.borrower_name || sanitize(args.borrower_name).length === 0) {
    throw new ConvexError({ code: "VALIDATION", message: "Borrower name is required", field: "borrower_name" });
  }
  if (!args.property_address || sanitize(args.property_address).length === 0) {
    throw new ConvexError({ code: "VALIDATION", message: "Property address is required", field: "property_address" });
  }
  if (!args.loan_amount || args.loan_amount < 50000) {
    throw new ConvexError({ code: "VALIDATION", message: "Loan amount must be at least $50,000", field: "loan_amount" });
  }
  if (args.loan_amount > 500000000) {
    throw new ConvexError({ code: "VALIDATION", message: "Loan amount exceeds maximum", field: "loan_amount" });
  }

  const validPropertyTypes = ["multifamily", "retail", "office", "industrial", "mixed_use", "land", "other"];
  if (!validPropertyTypes.includes(args.property_type)) {
    throw new ConvexError({ code: "VALIDATION", message: "Invalid property type", field: "property_type" });
  }

  // ... validate all enum fields against allowed values

  return {
    ...args,
    borrower_name: sanitize(args.borrower_name),
    property_address: sanitize(args.property_address),
    borrower_email: args.borrower_email ? sanitize(args.borrower_email).toLowerCase() : undefined,
    notes: args.notes ? sanitize(args.notes) : undefined,
  };
}
```

### 6. Environment Variables
```bash
# .env.local — NEVER commit this file
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOY_KEY=...
RESEND_API_KEY=re_...
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...
```

**Rules:**
- Only `NEXT_PUBLIC_*` variables are exposed to the browser
- CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, RESEND_API_KEY, CONVEX_DEPLOY_KEY are server-only
- `.env.local` is in `.gitignore` — verified before first commit
- README documents required env vars without values

---

## ERROR HANDLING — CRITICAL REQUIREMENTS

### 1. Typed Error System
```typescript
// convex/helpers/errors.ts
// All Convex errors use ConvexError with typed codes

export type ErrorCode =
  | "UNAUTHORIZED"      // Not logged in
  | "FORBIDDEN"         // Logged in but wrong role / no access
  | "NOT_FOUND"         // Resource doesn't exist
  | "VALIDATION"        // Invalid input
  | "CONFLICT"          // Duplicate or state conflict
  | "INTERNAL"          // Unexpected server error
  | "RATE_LIMITED";     // Too many requests

// Every error includes a code and user-friendly message
// Example: throw new ConvexError({ code: "FORBIDDEN", message: "You do not have access to this deal" });
```

### 2. React Error Boundaries
Every route group layout wraps its children in an ErrorBoundary component.

```typescript
// src/components/shared/ErrorBoundary.tsx
"use client";
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error telemetry
    this.logError(error, errorInfo);
  }

  async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Send to Convex error_logs table via API
      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
          page: window.location.pathname,
          user_agent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
          <p className="text-gray-600">We've been notified and are looking into it.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 3. Mutation Error Handling Pattern
EVERY Convex mutation follows this pattern:

```typescript
export const createDeal = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // 1. Auth check
    const user = await requireRole(ctx, "partner");

    // 2. Input validation (server-side, even if client already validated)
    const validatedArgs = validateDealInput(args);

    // 3. Business logic in try/catch
    try {
      const dealId = await ctx.db.insert("deals", {
        ...validatedArgs,
        partner_id: user._id,
        status: "submitted",
        stage_entered_at: Date.now(),
        created_at: Date.now(),
      });

      // 4. Side effects (notifications, activity log)
      await ctx.db.insert("deal_activities", {
        deal_id: dealId,
        actor_id: user._id,
        action: "deal_submitted",
        to_status: "submitted",
        details: `Deal submitted for ${validatedArgs.property_address}`,
        created_at: Date.now(),
      });

      await ctx.db.insert("notifications", {
        user_id: /* admin user id */,
        deal_id: dealId,
        type: "deal_submitted",
        title: "New Deal Submitted",
        message: `${user.name} submitted a deal for ${validatedArgs.property_address}`,
        read: false,
        created_at: Date.now(),
      });

      return dealId;
    } catch (error) {
      // 5. If it's already a ConvexError, rethrow
      if (error instanceof ConvexError) throw error;
      // 6. Otherwise wrap in generic error
      throw new ConvexError({ code: "INTERNAL", message: "Failed to create deal. Please try again." });
    }
  },
});
```

### 4. Client-Side Error Handling Hook
```typescript
// src/hooks/useErrorHandler.ts
import { toast } from "sonner"; // or your toast library

export function useErrorHandler() {
  return (error: unknown) => {
    // Parse ConvexError
    if (error && typeof error === 'object' && 'data' in error) {
      const data = (error as any).data;
      switch (data.code) {
        case "UNAUTHORIZED":
          toast.error("Please sign in to continue");
          // redirect to sign-in
          break;
        case "FORBIDDEN":
          toast.error(data.message || "You don't have permission to do that");
          break;
        case "VALIDATION":
          toast.error(data.message || "Please check your input");
          break;
        case "NOT_FOUND":
          toast.error(data.message || "Resource not found");
          break;
        case "CONFLICT":
          toast.warning(data.message || "This action conflicts with existing data");
          break;
        default:
          toast.error("Something went wrong. Please try again.");
      }
    } else {
      toast.error("Something went wrong. Please try again.");
    }

    // Always log to console in development
    console.error("[LenderBridge Error]", error);
  };
}
```

### 5. Automated Error Telemetry
Add an `error_logs` table to the schema:

```typescript
// In convex/schema.ts — add this as the 7th table
error_logs: defineTable({
  error_message: v.string(),
  error_stack: v.optional(v.string()),
  component_stack: v.optional(v.string()),
  user_id: v.optional(v.id("users")),
  user_role: v.optional(v.string()),
  page: v.string(),
  action: v.optional(v.string()),
  user_agent: v.optional(v.string()),
  timestamp: v.number(),
}),
```

The admin "System Health" page (`/admin/system-health`) shows recent errors, grouped by page and frequency.

### 6. Loading & Empty States
- EVERY page that loads data must show a skeleton loader while loading
- EVERY list that can be empty must show a designed empty state with a CTA
- Use `LoadingSkeleton` component that matches the layout of expected content
- Use `EmptyState` component with icon, message, and action button

---

## DATABASE SCHEMA

### Table: users
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| email | string | Yes | Unique. Synced from Clerk. Indexed. |
| name | string | Yes | Display name |
| role | "admin" \| "partner" \| "borrower" | Yes | Determines access. Indexed. |
| phone | string | No | Contact number |
| company | string | No | Firm name |
| license_number | string | No | RE license or NMLS ID |
| commission_rate | number | No | Default rate (e.g., 0.005 = 0.5%) |
| clerk_id | string | Yes | Clerk user ID for webhook sync. Indexed. |
| created_at | number | Yes | Timestamp |

**Indexes:** `by_email`, `by_clerk_id`, `by_role`

### Table: deals
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| partner_id | Id<"users"> | Yes | Referring partner. Indexed. |
| borrower_name | string | Yes | |
| borrower_email | string | No | For portal invite |
| borrower_phone | string | No | |
| borrower_company | string | No | |
| borrower_id | Id<"users"> | No | Set when borrower creates account. Indexed. |
| property_address | string | Yes | |
| property_type | string | Yes | Enum: multifamily, retail, office, industrial, mixed_use, land, other |
| transaction_type | string | Yes | Enum: purchase, refinance, bridge, construction, cash_out |
| loan_type | string | Yes | Enum: permanent, bridge, construction, land, sba |
| loan_amount | number | Yes | In USD |
| loan_position | string | No | first, subordinate |
| status | string | Yes | See Deal Lifecycle. Indexed. |
| assigned_lender_id | Id<"lenders"> | No | Set by admin |
| stage_entered_at | number | Yes | Timestamp of last status change |
| estimated_close | string | No | Target close date |
| notes | string | No | Admin internal notes |
| created_at | number | Yes | |

**Indexes:** `by_partner_id`, `by_borrower_id`, `by_status`, `by_created_at`

### Table: lenders
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Institution name |
| contact_name | string | No | |
| email | string | No | |
| phone | string | No | |
| specialties | string[] | Yes | e.g., ["multifamily", "retail"] |
| property_types | string[] | Yes | |
| states_covered | string[] | Yes | |
| min_loan | number | No | |
| max_loan | number | No | |
| loan_types | string[] | Yes | |
| notes | string | No | Broker's private notes |

**Indexes:** `by_name` (for text search)

### Table: commissions
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| deal_id | Id<"deals"> | Yes | Indexed. |
| partner_id | Id<"users"> | Yes | Indexed. |
| amount | number | Yes | USD |
| rate | number | Yes | e.g., 0.005 |
| status | "pending" \| "paid" \| "voided" | Yes | Indexed. |
| paid_date | string | No | |
| created_at | number | Yes | |

**Indexes:** `by_deal_id`, `by_partner_id`, `by_status`

### Table: deal_activities
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| deal_id | Id<"deals"> | Yes | Indexed. |
| actor_id | Id<"users"> | No | null = system action |
| action | string | Yes | e.g., "status_change", "lender_assigned" |
| from_status | string | No | |
| to_status | string | No | |
| details | string | No | Human-readable |
| created_at | number | Yes | |

**Indexes:** `by_deal_id`

### Table: notifications
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user_id | Id<"users"> | Yes | Indexed. |
| deal_id | Id<"deals"> | No | |
| type | string | Yes | deal_submitted, status_changed, lender_assigned, commission_updated |
| title | string | Yes | |
| message | string | Yes | |
| read | boolean | Yes | Default false |
| created_at | number | Yes | |

**Indexes:** `by_user_id`, `by_user_id_and_read`

### Table: error_logs
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| error_message | string | Yes | |
| error_stack | string | No | |
| component_stack | string | No | |
| user_id | Id<"users"> | No | |
| user_role | string | No | |
| page | string | Yes | URL path |
| action | string | No | What the user was doing |
| user_agent | string | No | |
| timestamp | number | Yes | |

---

## DEAL LIFECYCLE — STATE MACHINE

### Valid Stages (in order)
```typescript
export const DEAL_STAGES = [
  "submitted",
  "under_review",
  "lender_assigned",
  "term_sheet",
  "processing",
  "underwriting",
  "clear_to_close",
  "closed",      // Terminal
  "declined",    // Terminal
  "dead",        // Terminal
] as const;

export const TERMINAL_STAGES = ["closed", "declined", "dead"] as const;
```

### Stage Transition Rules
- **Forward movement:** Admin can advance to the next logical stage
- **Backward movement:** Admin only. Requires a note. Logged in activity trail. Triggers partner notification.
- **Terminal stages:** "closed", "declined", "dead" — no further movement
- **Dead/Declined from any stage:** Admin can mark dead or declined from any non-terminal stage. Requires a reason note.
- **Dead deal commissions:** When deal goes to dead/declined, auto-void any pending commission

### Stage Transition Mutation — Security Pattern
```typescript
export const updateDealStatus = mutation({
  args: {
    dealId: v.id("deals"),
    newStatus: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Admin only
    const admin = await requireAdmin(ctx);

    // 2. Validate deal exists
    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });

    // 3. Validate status is a valid deal stage
    if (!DEAL_STAGES.includes(args.newStatus as any)) {
      throw new ConvexError({ code: "VALIDATION", message: "Invalid deal stage" });
    }

    // 4. Cannot move from terminal stages
    if (TERMINAL_STAGES.includes(deal.status as any)) {
      throw new ConvexError({ code: "CONFLICT", message: "Cannot update a closed, declined, or dead deal" });
    }

    // 5. Backward movement requires a note
    const currentIndex = DEAL_STAGES.indexOf(deal.status as any);
    const newIndex = DEAL_STAGES.indexOf(args.newStatus as any);
    if (newIndex < currentIndex && !args.note) {
      throw new ConvexError({ code: "VALIDATION", message: "A note is required when moving a deal backward" });
    }

    // 6. Update deal
    await ctx.db.patch(args.dealId, {
      status: args.newStatus,
      stage_entered_at: Date.now(),
      notes: args.note ? `${deal.notes || ''}\n[${new Date().toISOString()}] ${args.note}`.trim() : deal.notes,
    });

    // 7. Log activity
    await ctx.db.insert("deal_activities", {
      deal_id: args.dealId,
      actor_id: admin._id,
      action: "status_change",
      from_status: deal.status,
      to_status: args.newStatus,
      details: args.note || `Status changed from ${deal.status} to ${args.newStatus}`,
      created_at: Date.now(),
    });

    // 8. Auto-void commission if going to dead/declined
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

    // 9. Create commission record when deal closes
    if (args.newStatus === "closed") {
      const partner = await ctx.db.get(deal.partner_id);
      const rate = partner?.commission_rate || 0.005; // default 0.5%
      await ctx.db.insert("commissions", {
        deal_id: args.dealId,
        partner_id: deal.partner_id,
        amount: deal.loan_amount * rate,
        rate: rate,
        status: "pending",
        created_at: Date.now(),
      });
    }

    // 10. Notify partner
    await ctx.db.insert("notifications", {
      user_id: deal.partner_id,
      deal_id: args.dealId,
      type: "status_changed",
      title: "Deal Status Updated",
      message: `Your deal at ${deal.property_address} has been moved to ${args.newStatus.replace(/_/g, ' ')}`,
      read: false,
      created_at: Date.now(),
    });
  },
});
```

---

## FEATURE SPECIFICATIONS

### Partner Portal

**Dashboard (`/partner/dashboard`):**
- Stats cards: Active deal count, pending commission total, YTD earnings
- Recent deals table (5 most recent) with status badges
- Quick "Submit New Deal" CTA button
- All data via Convex reactive queries (real-time)

**Deal Submission Wizard (`/partner/deals/new`):**
- Multi-step form: Step 1 (Loan Info) → Step 2 (Property Info) → Step 3 (Borrower Info) → Step 4 (Review & Submit)
- Progress bar showing current step
- Client-side validation with zod on each step
- Server-side re-validation on submit
- Smart defaults where possible (e.g., loan position defaults to "first")
- Target: under 90 seconds to complete
- On submit: creates deal, creates activity log entry, notifies admin

**Deal Tracker (`/partner/deals`):**
- Table of all partner's deals with: property address, loan amount, status badge, assigned lender name, days since submission
- Click through to deal detail
- Sort by date, status, amount

**Deal Detail (`/partner/deals/[id]`):**
- Read-only view of deal info
- Stage timeline showing progression
- Activity feed for this deal
- Commission info if applicable

**Commission Center (`/partner/commissions`):**
- Stats: Pending total, paid total, YTD earnings
- Table of all commissions: deal, amount, rate, status, date
- Filter by status (pending/paid)

**Notifications (`/partner/notifications`):**
- List of notifications, newest first
- Unread count on bell icon in nav
- Mark individual as read, mark all as read

**Resources (`/partner/resources`):**
- Static content: FAQ, loan type guide, "how to spot a commercial deal"
- No dynamic data — just helpful content

### Borrower Portal

**Dashboard (`/borrower/dashboard`):**
- Single deal status view (or list if borrower has multiple deals)
- Visual progress indicator showing current stage
- Activity feed for their deal(s)
- Read-only — no actions

### Admin Dashboard

**Kanban Pipeline (`/admin/dashboard`):**
- Columns for each active stage: Submitted, Under Review, Lender Assigned, Term Sheet, Processing, Underwriting, Clear to Close
- Deal cards show: property address, partner name, loan amount, days in stage
- Drag-and-drop between columns to advance/move deals
- Deals in stage 14+ days show amber warning badge (dormant)
- Stage counts and total pipeline value at top
- Search bar to find deals by property, partner, or borrower
- Filter by partner, property type

**Deal Detail (`/admin/deals/[id]`):**
- Full deal information
- Actions: advance stage, move backward (with note), assign lender, add notes, mark dead/declined
- Activity log for this deal
- Commission info
- "Assign Lender" button opens LenderAssignModal

**Lender Database (`/admin/lenders`):**
- Searchable table of all lenders
- Filters: specialty, state, loan range, property type
- Compound filtering (multiple filters at once)
- Results update in real-time as filters change
- Pagination at 50 per page
- Text search on lender name and contact name

**Lender Assignment Modal:**
- Opens from deal detail
- Pre-filtered to match deal's property type and state
- Search/filter to narrow down
- One-click assign
- Triggers: updates deal, creates activity log, notifies partner

**Partner Management (`/admin/partners`):**
- All partners: name, deal count, commission total, last active
- Click through to see partner's deals

**Commission Management (`/admin/commissions`):**
- All commissions across all partners
- Actions: set rate, mark as paid
- Filter by status, partner

**Activity Log (`/admin/activity`):**
- Global feed of all actions: submissions, stage changes, assignments, notes
- Filter by deal, partner, action type

**System Health (`/admin/system-health`):**
- Recent error logs from error_logs table
- Group by page, frequency
- Basic dashboard for monitoring

---

## UI/DESIGN GUIDELINES

- **Design for salespeople, not developers.** Clean, simple, professional.
- Use shadcn/ui components consistently — don't mix component libraries
- Color scheme: Professional blue/navy primary. Green for success/money. Amber for warnings. Red for errors/declined.
- Commission and money amounts should be prominent — larger font, bold, green
- Status badges should be color-coded and instantly recognizable
- Mobile responsive — all views must work on phone screens
- The evaluators will check: "Could you put this in front of a real estate broker without embarrassment?"
- Consistent spacing, typography, border radius throughout
- No developer-facing jargon in the UI — everything in plain business English

---

## DEMO DATA & CREDENTIALS

### Lender Database — 7,000 Records (CRITICAL)
The brief specifically says "approximately 7,000 lenders." The evaluators WILL test search and filtering at scale. You must seed 7,000 realistic lender records.

The seed script (`scripts/seed-lenders.ts`) must generate 7,000 lenders with:
- **Realistic institution names** — Combine patterns like: "[City] [Type] [Entity]" (e.g., "Austin Capital Lending", "Pacific Northwest Credit Union", "Southeastern Bridge Fund", "Manhattan Commercial Mortgage Corp")
- **Contact names** — Random first + last name combinations
- **Email and phone** — Fake but realistic format
- **Specialties** — Random subset of: multifamily, retail, office, industrial, mixed_use, land, SBA, healthcare, hospitality, self_storage, mobile_home_park
- **Property types** — Random subset matching specialties
- **States covered** — Random 1-8 US state abbreviations (some lenders are national with 20+ states)
- **Loan ranges** — Realistic min/max pairs: ($100K-$1M), ($500K-$5M), ($1M-$10M), ($5M-$50M), ($10M-$100M+)
- **Loan types** — Random subset of: permanent, bridge, construction, land, sba, mezzanine
- **Notes** — Some lenders have broker notes (e.g., "Fast closer", "Strict on credit score", "Good for first-time investors"), most are empty

The script should:
1. Generate all 7,000 records programmatically (do NOT hardcode 7,000 entries)
2. Ensure variety — different states, specialties, loan ranges throughout
3. Batch insert (Convex has batch limits — insert in chunks of 100-200)
4. Log progress: "Inserted 200/7000 lenders..." 
5. Run as a standalone script: `npx ts-node scripts/seed-lenders.ts` or as a Convex function

### Other Demo Data
For submission, also seed:
- 1 admin user (the broker): admin@lenderbridge.com
- 3-4 partner users with deals in various stages
  - Sarah Martinez (sarah@example.com) — 4 deals, active partner
  - Mike Chen (mike@example.com) — 3 deals, including a closed deal with paid commission
  - Lisa Kim (lisa@example.com) — 2 deals, newer partner
- 1-2 borrower users linked to deals
  - Jorge Rodriguez (borrower@example.com) — has 1 active deal
- Deals spread across ALL pipeline stages (at least one deal in each stage so evaluators can see the full lifecycle)
- At least one deal marked "dead" with a voided commission
- At least one deal marked "closed" with a pending commission and one with a paid commission
- Activity history on multiple deals (status changes, lender assignments, notes)
- Some notifications (read and unread) for partner users

Create demo credentials and document them in the README:
```
Admin:     admin@lenderbridge.com / LenderBridge2024!
Partner 1: sarah@example.com / LenderBridge2024!
Partner 2: mike@example.com / LenderBridge2024!
Partner 3: lisa@example.com / LenderBridge2024!
Borrower:  borrower@example.com / LenderBridge2024!
```

IMPORTANT: These accounts must be pre-created in Clerk AND synced to Convex users table so the evaluators can log in immediately without signing up. The brief explicitly says "demo credentials so we can test all user flows without signing up."

---

## README REQUIREMENTS (Phase 2 Deliverable)
The README must include:
1. **Setup instructions** — How to clone, install dependencies, set env vars, and run locally. A new developer should be running the app in under 10 minutes.
2. **Required environment variables** — Listed with descriptions but WITHOUT actual values. Explain where to get each key (Clerk dashboard, Convex dashboard, etc.)
3. **Demo credentials** — All user roles with login info so evaluators can test immediately without signing up.
4. **Live deployed URL** — Production Vercel link.
5. **Architecture overview** — Brief description of tech stack, folder structure, and how the three portals work.
6. **Deviations from Phase 1 plan** — CRITICAL. The evaluators will compare Phase 2 output to Phase 1 SOW. If ANYTHING differs from the plan — features cut, features added, schema changes, timeline adjustments — document it here with a brief explanation of WHY. If there are no deviations, state that explicitly: "No deviations from the Phase 1 plan."
7. **How long you spent** — Honest accounting of total hours spent on the build.

### Deviation Tracking
As you build, keep a running list of any deviations from the Phase 1 SOW:
- Features that were cut and why
- Features that were added and why
- Schema changes from the original plan
- Any architectural decisions that changed during implementation
Add these to the README at the end. This directly impacts the "Plan vs. Execution" evaluation score.

---

## BUILD ORDER — Follow Sprint Plan

### Git Commit Conventions — CRITICAL FOR HANDOFF
Every commit must follow the Conventional Commits standard. The evaluators will read your git history.

**Format:** `type: short description`

**Types:**
- `feat:` — New feature (e.g., `feat: add deal submission wizard with multi-step validation`)
- `fix:` — Bug fix (e.g., `fix: prevent partners from accessing admin mutations`)
- `refactor:` — Code restructuring without behavior change (e.g., `refactor: extract auth helpers into shared module`)
- `security:` — Security improvement (e.g., `security: add Clerk webhook signature verification`)
- `style:` — UI/styling changes (e.g., `style: add responsive breakpoints to Kanban board`)
- `test:` — Adding tests or test data (e.g., `test: seed demo data with deals across all stages`)
- `docs:` — Documentation (e.g., `docs: add README with setup instructions and demo credentials`)
- `chore:` — Setup/config (e.g., `chore: configure Convex schema with all 7 tables and indexes`)

**Rules:**
- Commit frequently — small, logical chunks. NOT one giant commit at the end.
- Each commit should represent one logical change that could be understood and reviewed independently.
- Never commit secrets, .env files, or API keys.
- First commit should be project scaffolding. Last commit should be README.

**Example git history (what the evaluators should see):**
```
docs: add README with setup instructions, demo credentials, and architecture notes
test: final smoke test — seed production demo data
style: responsive design pass on all views
feat: add admin system health page for error telemetry
fix: handle edge case where borrower has deals from multiple partners
security: add rate limiting note to error telemetry endpoint
feat: add notification bell with unread count and mark-as-read
feat: add borrower portal with deal status and activity feed
feat: add commission center with partner and admin views
feat: add lender assignment modal with pre-filtered search
feat: add lender database search with compound filtering and pagination
feat: add deal detail page with admin actions and stage transitions
feat: add admin Kanban pipeline with drag-and-drop stage management
feat: add partner dashboard with stats cards and deal tracker
feat: add deal submission wizard with client and server validation
feat: add partner layout with sidebar navigation
security: add row-level security helpers for partner data isolation
security: add Clerk webhook handler with svix signature verification
feat: add role-based middleware and auth redirect logic
chore: set up Clerk authentication with Next.js provider
chore: define Convex schema with 7 tables, indexes, and validation
chore: initialize Next.js 14 with Tailwind, shadcn/ui, and Convex
```

### Code Commenting Standards — CRITICAL FOR HANDOFF
The evaluators will ask: "Could another engineer pick this up and keep building?" Your code must be self-documenting.

**File-level comments:** Every file starts with a brief comment explaining its purpose.
```typescript
/**
 * Deal submission wizard — multi-step form for partners to submit new deals.
 * Steps: Loan Info → Property Info → Borrower Info → Review & Submit
 * Client-side validation via zod, server-side re-validation in Convex mutation.
 */
```

**Function-level comments:** Every exported function, mutation, and query has a JSDoc comment.
```typescript
/**
 * Creates a new deal in the pipeline.
 * - Requires authenticated partner role
 * - Validates all input server-side (never trust client data)
 * - Creates activity log entry and admin notification as side effects
 * - Returns the new deal ID
 */
export const createDeal = mutation({ ... });
```

**Security comments:** Every auth check and validation has a comment explaining WHY.
```typescript
// SECURITY: Verify the authenticated user owns this deal.
// Partners should only ever see/modify their own deals.
const user = await requirePartnerOwnership(ctx, deal.partner_id);

// SECURITY: Re-validate all input server-side.
// Client-side validation is for UX only — never trust it for security.
const validatedArgs = validateDealInput(args);

// SECURITY: Verify webhook signature before processing.
// Without this, anyone could send fake user creation events.
const wh = new Webhook(WEBHOOK_SECRET);
```

**Business logic comments:** Explain the WHY behind non-obvious decisions.
```typescript
// When a deal moves to "dead" or "declined", auto-void any pending commissions.
// The voided commission remains visible in the partner's history for transparency,
// but is excluded from their pending total.

// Borrower info is stored directly on the deal record (not as a user reference)
// so partners can submit deals quickly without the borrower having an account.
// The optional borrower_id gets linked later if/when the borrower registers.

// Dormant deal detection: deals with no activity for 14+ days get a warning badge.
// This threshold is an assumption — would confirm with client what "stale" means.
```

**Inline comments for complex logic:**
```typescript
// Calculate commission: use partner's default rate if set, otherwise fall back to 0.5%
const rate = partner?.commission_rate || 0.005;

// Cursor-based pagination — fetch one extra record to determine if there's a next page
const results = await ctx.db.query("lenders").take(pageSize + 1);
const hasMore = results.length > pageSize;
const page = hasMore ? results.slice(0, pageSize) : results;
```

**What NOT to comment:**
```typescript
// BAD — states the obvious
const user = await requireAuth(ctx); // require authentication

// GOOD — explains the why
// Only admin can reassign lenders — partners see the result but can't change it
const admin = await requireAdmin(ctx);
```

### Sprint 1 (Hours 0-12): Foundation + Core Build
1. `npx create-next-app@latest lenderbridge --typescript --tailwind --app --src-dir`
2. Install dependencies: `convex`, `@clerk/nextjs`, `shadcn/ui init`, `resend`, `svix`, `zod`, `sonner` (toasts)
3. Set up Convex: `npx convex dev` — define schema with all 7 tables + indexes
4. Set up Clerk: middleware, providers, sign-in/sign-up pages, webhook endpoint with signature verification
5. Create auth helpers (`requireAuth`, `requireRole`, `requireAdmin`, `requirePartnerOwnership`)
6. Create validation helpers and error types
7. Create ErrorBoundary, LoadingSkeleton, EmptyState components
8. Create layout shells for all three portals with navigation
9. Create role-based middleware redirect logic
10. Build lender seed script — generate 7,000 realistic lender records with varied specialties, states, loan ranges. Batch insert into Convex.
11. Build deal submission wizard with full client + server validation
12. Build partner dashboard + deal tracker

### Sprint 2 (Hours 12-24): Full Feature Implementation
1. Build admin Kanban pipeline with drag-and-drop
2. Build deal detail page with all admin actions
3. Build lender database search/filter UI
4. Build lender assignment modal
5. Build commission center (partner + admin views)
6. Build borrower portal
7. Build notification system (in-app bell + list)
8. Build activity log
9. Seed demo data (users in Clerk + Convex, deals across all stages, commissions, activities, notifications)

### Sprint 3 (Hours 24-38): Testing & QA
1. Test complete deal lifecycle end-to-end
2. Test authorization boundaries (partner can't access admin, etc.)
3. Test form validation edge cases
4. Test empty states and error states
5. Test real-time sync across multiple tabs
6. Test lender search with full dataset
7. Fix all bugs found
8. Add error telemetry system health page

### Sprint 4 (Hours 38-48): Polish & Deploy
1. Responsive design pass on all views
2. Visual polish and consistency
3. Resources page content
4. Deploy to Vercel production
5. Final smoke test on production
6. Write README
