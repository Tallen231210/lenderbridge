/**
 * Typed error system for LenderBridge.
 * All Convex errors use ConvexError with typed codes so the client
 * can parse them and show appropriate user-friendly messages.
 */

/**
 * Standard error codes used across all Convex mutations and queries.
 * The client-side useErrorHandler hook maps these to user-facing toast messages.
 */
export type ErrorCode =
  | "UNAUTHORIZED" // Not logged in
  | "FORBIDDEN" // Logged in but wrong role / no access
  | "NOT_FOUND" // Resource doesn't exist
  | "VALIDATION" // Invalid input
  | "CONFLICT" // Duplicate or state conflict (e.g., terminal deal stage)
  | "INTERNAL" // Unexpected server error
  | "RATE_LIMITED"; // Too many requests
