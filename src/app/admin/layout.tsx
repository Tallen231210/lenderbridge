/**
 * Admin dashboard layout — sidebar navigation + admin role enforcement.
 * Redirects non-admin users to their correct portal.
 * Wraps all admin pages in ErrorBoundary for error telemetry.
 */
"use client";

import { ReactNode } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthorized } = useRequireRole("admin");

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
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
