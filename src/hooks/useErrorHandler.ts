/**
 * Standardized error handling hook for Convex mutations.
 * Parses ConvexError codes and shows appropriate user-facing toast messages.
 * Use this in every component that calls a Convex mutation.
 */
"use client";

import { toast } from "sonner";

export function useErrorHandler() {
  return (error: unknown) => {
    // Parse ConvexError — Convex errors have a `data` property with our typed codes
    if (error && typeof error === "object" && "data" in error) {
      const data = (error as { data: { code?: string; message?: string } })
        .data;

      switch (data.code) {
        case "UNAUTHORIZED":
          toast.error("Please sign in to continue");
          break;
        case "FORBIDDEN":
          toast.error(
            data.message || "You don't have permission to do that"
          );
          break;
        case "VALIDATION":
          toast.error(data.message || "Please check your input");
          break;
        case "NOT_FOUND":
          toast.error(data.message || "Resource not found");
          break;
        case "CONFLICT":
          toast.warning(
            data.message || "This action conflicts with existing data"
          );
          break;
        case "RATE_LIMITED":
          toast.error("Too many requests. Please wait a moment.");
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
