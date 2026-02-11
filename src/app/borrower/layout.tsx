/**
 * Borrower portal layout — top navigation + borrower role enforcement.
 * Redirects non-borrower users to their correct portal.
 * Borrower portal is read-only with minimal navigation.
 */
"use client";

import { ReactNode } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { BorrowerNav } from "@/components/layouts/BorrowerNav";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function BorrowerLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthorized } = useRequireRole("borrower");

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-16 bg-white border-b border-gray-200" />
        <PageSkeleton />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // useRequireRole handles redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BorrowerNav />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
