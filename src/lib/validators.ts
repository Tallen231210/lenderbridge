/**
 * Client-side Zod validation schemas for LenderBridge forms.
 * These provide instant user feedback on form input.
 * Server-side Convex mutations ALWAYS re-validate — never trust client data.
 *
 * Uses Zod v4 API — error messages use `message` instead of `required_error`.
 */
import { z } from "zod";

/**
 * Deal submission form schema — validates all fields across wizard steps.
 * Step 1: Loan info (loan_type, loan_amount, transaction_type, loan_position)
 * Step 2: Property info (property_address, property_type)
 * Step 3: Borrower info (borrower_name, borrower_email, borrower_phone, borrower_company)
 */
export const dealFormSchema = z.object({
  // Step 1: Loan Info
  loan_type: z.enum(["permanent", "bridge", "construction", "land", "sba"], {
    message: "Please select a loan type",
  }),
  loan_amount: z
    .number({ message: "Loan amount is required" })
    .min(50000, "Loan amount must be at least $50,000")
    .max(500000000, "Loan amount exceeds maximum"),
  transaction_type: z.enum(
    ["purchase", "refinance", "bridge", "construction", "cash_out"],
    { message: "Please select a transaction type" }
  ),
  loan_position: z.enum(["first", "subordinate"]).optional().default("first"),

  // Step 2: Property Info
  property_address: z
    .string()
    .min(1, "Property address is required")
    .max(500, "Address is too long"),
  property_type: z.enum(
    ["multifamily", "retail", "office", "industrial", "mixed_use", "land", "other"],
    { message: "Please select a property type" }
  ),

  // Step 3: Borrower Info
  borrower_name: z
    .string()
    .min(1, "Borrower name is required")
    .max(200, "Name is too long"),
  borrower_email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  borrower_phone: z
    .string()
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  borrower_company: z
    .string()
    .max(200, "Company name is too long")
    .optional()
    .or(z.literal("")),

  // Step 4: Review — no new fields, just confirmation
  notes: z
    .string()
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

/** Type derived from the deal form schema */
export type DealFormValues = z.infer<typeof dealFormSchema>;

/** Step-level validation — only validates fields for the current wizard step */
export const dealStep1Schema = dealFormSchema.pick({
  loan_type: true,
  loan_amount: true,
  transaction_type: true,
  loan_position: true,
});

export const dealStep2Schema = dealFormSchema.pick({
  property_address: true,
  property_type: true,
});

export const dealStep3Schema = dealFormSchema.pick({
  borrower_name: true,
  borrower_email: true,
  borrower_phone: true,
  borrower_company: true,
});
