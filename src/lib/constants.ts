/**
 * Shared constants for LenderBridge.
 * Deal stages, property types, loan types, and other enum values
 * used across components, forms, and validation.
 */

/** All deal pipeline stages in order. Terminal stages are at the end. */
export const DEAL_STAGES = [
  "submitted",
  "under_review",
  "lender_assigned",
  "term_sheet",
  "processing",
  "underwriting",
  "clear_to_close",
  "closed",
  "declined",
  "dead",
] as const;

/** Terminal stages — no further movement allowed */
export const TERMINAL_STAGES = ["closed", "declined", "dead"] as const;

/** Active (non-terminal) stages shown as Kanban columns */
export const ACTIVE_STAGES = [
  "submitted",
  "under_review",
  "lender_assigned",
  "term_sheet",
  "processing",
  "underwriting",
  "clear_to_close",
] as const;

/** Human-readable labels for deal stages */
export const STAGE_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  lender_assigned: "Lender Assigned",
  term_sheet: "Term Sheet",
  processing: "Processing",
  underwriting: "Underwriting",
  clear_to_close: "Clear to Close",
  closed: "Closed",
  declined: "Declined",
  dead: "Dead",
};

/** Color classes for status badges */
export const STAGE_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-purple-100 text-purple-800",
  lender_assigned: "bg-indigo-100 text-indigo-800",
  term_sheet: "bg-cyan-100 text-cyan-800",
  processing: "bg-yellow-100 text-yellow-800",
  underwriting: "bg-orange-100 text-orange-800",
  clear_to_close: "bg-emerald-100 text-emerald-800",
  closed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  dead: "bg-gray-100 text-gray-800",
};

/** Property type options for forms and filters */
export const PROPERTY_TYPES = [
  { value: "multifamily", label: "Multifamily" },
  { value: "retail", label: "Retail" },
  { value: "office", label: "Office" },
  { value: "industrial", label: "Industrial" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
] as const;

/** Transaction type options */
export const TRANSACTION_TYPES = [
  { value: "purchase", label: "Purchase" },
  { value: "refinance", label: "Refinance" },
  { value: "bridge", label: "Bridge" },
  { value: "construction", label: "Construction" },
  { value: "cash_out", label: "Cash Out" },
] as const;

/** Loan type options */
export const LOAN_TYPES = [
  { value: "permanent", label: "Permanent" },
  { value: "bridge", label: "Bridge" },
  { value: "construction", label: "Construction" },
  { value: "land", label: "Land" },
  { value: "sba", label: "SBA" },
] as const;

/** Loan position options */
export const LOAN_POSITIONS = [
  { value: "first", label: "First Position" },
  { value: "subordinate", label: "Subordinate" },
] as const;

/** Number of days in a stage before a deal is considered dormant */
export const DORMANT_THRESHOLD_DAYS = 14;
