/**
 * Partner portal layout — sidebar navigation + role enforcement.
 * Redirects non-partner users to their correct portal.
 * Wraps all partner pages in ErrorBoundary for error telemetry.
 */
"use client";

import { ReactNode } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { PartnerSidebar } from "@/components/layouts/PartnerSidebar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function PartnerLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthorized } = useRequireRole("partner");

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="w-60 bg-white border-r border-gray-200" />
        <main className="flex-1">
          <PageSkeleton />
        </main>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // useRequireRole handles redirect
  }

  return (
    <div className="flex min-h-screen bg-white">
      <PartnerSidebar />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
