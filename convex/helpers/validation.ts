/**
 * Server-side input validation helpers for Convex mutations.
 * NEVER trust client data — these run on every mutation regardless of
 * whether the client already validated with Zod.
 */
import { ConvexError } from "convex/values";

/**
 * Sanitize a string — trim whitespace and strip HTML tags to prevent XSS.
 */
export function sanitize(s: string): string {
  return s.trim().replace(/<[^>]*>/g, "");
}

/** Valid property type values for deals and lender matching */
export const VALID_PROPERTY_TYPES = [
  "multifamily",
  "retail",
  "office",
  "industrial",
  "mixed_use",
  "land",
  "other",
] as const;

/** Valid transaction types */
export const VALID_TRANSACTION_TYPES = [
  "purchase",
  "refinance",
  "bridge",
  "construction",
  "cash_out",
] as const;

/** Valid loan types */
export const VALID_LOAN_TYPES = [
  "permanent",
  "bridge",
  "construction",
  "land",
  "sba",
] as const;

/** Valid loan position values */
export const VALID_LOAN_POSITIONS = ["first", "subordinate"] as const;

/**
 * Validates and sanitizes all deal input fields.
 * Throws ConvexError with code "VALIDATION" and the offending field name
 * so the client can highlight the specific form field.
 */
export function validateDealInput(args: {
  borrower_name: string;
  borrower_email?: string;
  borrower_phone?: string;
  borrower_company?: string;
  property_address: string;
  property_type: string;
  transaction_type: string;
  loan_type: string;
  loan_amount: number;
  loan_position?: string;
  notes?: string;
}) {
  // Required string fields
  if (!args.borrower_name || sanitize(args.borrower_name).length === 0) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Borrower name is required",
      field: "borrower_name",
    });
  }

  if (!args.property_address || sanitize(args.property_address).length === 0) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Property address is required",
      field: "property_address",
    });
  }

  // Loan amount range: $50K minimum, $500M maximum
  if (!args.loan_amount || args.loan_amount < 50000) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Loan amount must be at least $50,000",
      field: "loan_amount",
    });
  }
  if (args.loan_amount > 500000000) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Loan amount exceeds maximum",
      field: "loan_amount",
    });
  }

  // Enum validations — reject values not in the allowed lists
  if (
    !VALID_PROPERTY_TYPES.includes(
      args.property_type as (typeof VALID_PROPERTY_TYPES)[number]
    )
  ) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Invalid property type",
      field: "property_type",
    });
  }

  if (
    !VALID_TRANSACTION_TYPES.includes(
      args.transaction_type as (typeof VALID_TRANSACTION_TYPES)[number]
    )
  ) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Invalid transaction type",
      field: "transaction_type",
    });
  }

  if (
    !VALID_LOAN_TYPES.includes(
      args.loan_type as (typeof VALID_LOAN_TYPES)[number]
    )
  ) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Invalid loan type",
      field: "loan_type",
    });
  }

  if (
    args.loan_position &&
    !VALID_LOAN_POSITIONS.includes(
      args.loan_position as (typeof VALID_LOAN_POSITIONS)[number]
    )
  ) {
    throw new ConvexError({
      code: "VALIDATION",
      message: "Invalid loan position",
      field: "loan_position",
    });
  }

  // Return sanitized values
  return {
    ...args,
    borrower_name: sanitize(args.borrower_name),
    property_address: sanitize(args.property_address),
    borrower_email: args.borrower_email
      ? sanitize(args.borrower_email).toLowerCase()
      : undefined,
    borrower_phone: args.borrower_phone
      ? sanitize(args.borrower_phone)
      : undefined,
    borrower_company: args.borrower_company
      ? sanitize(args.borrower_company)
      : undefined,
    notes: args.notes ? sanitize(args.notes) : undefined,
  };
}
