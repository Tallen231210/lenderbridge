# LenderBridge

**Commercial Loan Referral Platform**

LenderBridge is a full-stack web application that streamlines commercial loan deal management for a broker, their referral partners, and borrowers. It replaces a manual spreadsheet-and-email workflow with a real-time pipeline, automated commission tracking, and role-based portals.

**Live Demo:** _[Vercel URL will be added after deployment]_

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Tallen231210/lenderbridge.git
cd lenderbridge

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local
# Edit .env.local with your keys

# 4. Start Convex backend
npx convex dev

# 5. In a separate terminal, start the Next.js dev server
npm run dev

# 6. Seed the lender database (7,000 records)
npx convex run seedLenders:seedAll

# 7. Seed demo data (after Clerk users are synced)
npx convex run seedDemoData:seedAll
```

The app will be running at [http://localhost:3000](http://localhost:3000).

---

## Demo Credentials

Pre-created accounts for testing all user flows:

| Role | Email | Password |
|------|-------|----------|
| **Admin** (Broker) | admin@lenderbridge.com | LenderBridge2024! |
| **Partner 1** | sarah@example.com | LenderBridge2024! |
| **Partner 2** | mike@example.com | LenderBridge2024! |
| **Partner 3** | lisa@example.com | LenderBridge2024! |
| **Borrower** | borrower@example.com | LenderBridge2024! |

Each role redirects to its portal automatically after sign-in.

---

## Environment Variables

Create a `.env.local` file in the project root. **Never commit this file.**

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key | [Clerk Dashboard](https://dashboard.clerk.com) > API Keys |
| `CLERK_SECRET_KEY` | Clerk backend key (server-only) | Clerk Dashboard > API Keys |
| `CLERK_WEBHOOK_SECRET` | Webhook signing secret | Clerk Dashboard > Webhooks |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | [Convex Dashboard](https://dashboard.convex.dev) > Settings |
| `CONVEX_DEPLOY_KEY` | Convex deploy key (CI/CD) | Convex Dashboard > Settings |
| `RESEND_API_KEY` | Email sending (Resend) | [Resend Dashboard](https://resend.com/api-keys) |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Address autocomplete | [Google Cloud Console](https://console.cloud.google.com) > APIs |

**Note:** Only `NEXT_PUBLIC_*` variables are exposed to the browser. All other keys are server-only.

---

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Backend + Database:** Convex (real-time, reactive queries)
- **Authentication:** Clerk (`@clerk/nextjs`) with webhook sync
- **Styling:** Tailwind CSS + shadcn/ui component library
- **Drag & Drop:** @dnd-kit (Kanban pipeline)
- **Notifications:** sonner (toast), in-app notification system

### Three Role-Based Portals

**Admin Dashboard** — The broker's command center
- Kanban pipeline with drag-and-drop stage management
- Deal detail pages with status transitions, notes, and lender assignment
- Searchable lender database (7,000 records) with compound filtering
- Commission management (mark as paid)
- Global activity log and partner performance tracking
- System health monitoring (error telemetry)

**Partner Portal** — For referral agents (realtors, loan officers)
- Multi-step deal submission wizard (target: under 90 seconds)
- Deal tracker with status badges and activity history
- Commission center with earnings dashboard
- Real-time notification bell with unread count
- Resources page (FAQ, loan type guide, tips)

**Borrower Portal** — Read-only deal monitoring
- Deal status cards with visual stage timeline
- Activity feed for each deal
- Minimal profile management

### Database Schema (7 tables)
- `users` — Synced from Clerk via webhook, role-based (admin/partner/borrower)
- `deals` — Core pipeline entity with 10-stage lifecycle state machine
- `lenders` — Broker's private database (~7,000 records)
- `commissions` — Auto-created on close, auto-voided on dead/declined
- `deal_activities` — Audit trail for every deal action
- `notifications` — In-app alerts with read/unread state
- `error_logs` — Client-side error telemetry

### Folder Structure
```
lenderbridge/
├── convex/                      # Backend functions and schema
│   ├── schema.ts                # Database schema (7 tables)
│   ├── helpers/                 # Auth, validation, error helpers
│   ├── deals.ts                 # Deal CRUD + state machine
│   ├── lenders.ts               # Lender search with pagination
│   ├── commissions.ts           # Commission management
│   ├── seedLenders.ts           # 7,000 lender record generator
│   └── seedDemoData.ts          # Demo data for all pipeline stages
├── src/
│   ├── app/
│   │   ├── admin/               # Admin portal (7 pages)
│   │   ├── partner/             # Partner portal (7 pages)
│   │   ├── borrower/            # Borrower portal (2 pages)
│   │   ├── sign-in/             # Clerk sign-in
│   │   └── sign-up/             # Clerk sign-up
│   ├── components/
│   │   ├── deals/               # DealCard, DealSubmissionWizard, etc.
│   │   ├── pipeline/            # KanbanBoard, KanbanColumn
│   │   ├── layouts/             # AdminSidebar, PartnerSidebar, BorrowerNav
│   │   ├── notifications/       # NotificationBell
│   │   ├── shared/              # EmptyState, LoadingSkeleton, StatsCard
│   │   ├── providers/           # ConvexClientProvider
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                   # useCurrentUser, useRequireRole, useErrorHandler
│   └── lib/                     # utils, constants, validators
└── claude.md                    # Architectural specification
```

### Security Architecture
- **Authentication:** Clerk handles all auth flows. Webhook syncs user data to Convex.
- **Authorization:** Every Convex query/mutation starts with `requireAuth()`, `requireRole()`, or `requireAdmin()`. Partners can only see their own deals (row-level isolation via `requirePartnerOwnership()`).
- **Validation:** Dual-layer — client-side Zod schemas for instant feedback, server-side re-validation in Convex mutations for security.
- **Webhook verification:** Clerk webhooks verified via svix signature before processing.

### Deal Lifecycle State Machine
```
submitted -> under_review -> lender_assigned -> term_sheet -> processing -> underwriting -> clear_to_close -> closed
                                                                                                            -> declined
                                                                                                            -> dead
```
- 7 active stages (shown as Kanban columns)
- 3 terminal stages (closed, declined, dead)
- Admin controls all transitions via the deal detail page
- Drag-and-drop on Kanban advances deals to the next stage

---

## Deviations from Phase 1 Plan

The following deviations from the Phase 1 scope of work were made during implementation:

- **Resend email integration:** Not yet wired up. The email sending infrastructure (Resend API key, React Email templates) is planned but not implemented in this build. Notifications are handled in-app only.
- **Google Places API:** Address autocomplete on the deal submission form is not yet integrated. The form uses a standard text input for property address. The API key environment variable is documented for future integration.
- **Route groups vs. route segments:** Originally planned to use Next.js route groups `(admin)`, `(partner)`, `(borrower)` but switched to actual route segments `/admin/`, `/partner/`, `/borrower/` to avoid route collision issues with the App Router.
- **Lender seed script location:** Placed seed scripts in `convex/` directory as Convex mutations rather than a standalone `scripts/` directory, since Convex mutations are the natural way to insert data into the Convex database.

---

## Time Spent

_[To be filled in at project completion]_

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npx convex dev` | Start Convex backend (dev mode) |
| `npx convex run seedLenders:seedAll` | Seed 7,000 lender records |
| `npx convex run seedDemoData:seedAll` | Seed demo deals, commissions, activities |
| `npx convex run seedLenders:clearAll` | Clear all lender records |
| `npx convex run seedDemoData:clearAll` | Clear all demo data (keeps users and lenders) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
