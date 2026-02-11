/**
 * System health dashboard — recent error logs from the error_logs table.
 * Groups errors by page and frequency for quick issue detection.
 * Part of the admin's operational monitoring tools.
 */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/StatsCard";
import { formatRelativeTime } from "@/lib/utils";

export default function SystemHealthPage() {
  const errors = useQuery(api.errorLogs.getRecentErrors);

  if (errors === undefined) {
    return <PageSkeleton />;
  }

  // Group errors by page for summary view
  const errorsByPage: Record<string, number> = {};
  for (const err of errors) {
    errorsByPage[err.page] = (errorsByPage[err.page] || 0) + 1;
  }
  const topPages = Object.entries(errorsByPage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-500 mt-1">Error monitoring and telemetry</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Recent Errors"
          value={String(errors.length)}
          description="Last 100 errors"
        />
        <StatsCard
          label="Affected Pages"
          value={String(Object.keys(errorsByPage).length)}
          description="Unique pages with errors"
        />
        <StatsCard
          label="Most Errors"
          value={topPages[0]?.[0] || "None"}
          description={
            topPages[0] ? `${topPages[0][1]} errors` : "No errors recorded"
          }
        />
      </div>

      {/* Error frequency by page */}
      {topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Errors by Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPages.map(([page, count]) => (
                <div
                  key={page}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 font-mono">{page}</span>
                  <span className="text-red-600 font-medium">
                    {count} error{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent error log */}
      {errors.length === 0 ? (
        <EmptyState
          title="No errors recorded"
          description="Errors will appear here as they're captured by the error boundary."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errors.map((err) => (
                <div
                  key={err._id}
                  className="border-l-2 border-red-200 pl-4 py-2"
                >
                  <p className="text-sm font-medium text-red-700">
                    {err.error_message}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{err.page}</span>
                    <span>{formatRelativeTime(err.timestamp)}</span>
                    {err.user_role && <span>Role: {err.user_role}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
