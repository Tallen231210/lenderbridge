/**
 * Admin activity log — chronological feed of all deal actions across the platform.
 * Shows submissions, stage changes, lender assignments, notes, and more.
 * Filterable by action type for quick access to specific activity categories.
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

const ACTION_FILTERS = [
  { value: "all", label: "All Activity" },
  { value: "deal_submitted", label: "Submissions" },
  { value: "status_change", label: "Stage Changes" },
  { value: "lender_assigned", label: "Lender Assignments" },
  { value: "note_added", label: "Notes" },
  { value: "commission_created", label: "Commissions" },
  { value: "commission_paid", label: "Payments" },
] as const;

export default function AdminActivityPage() {
  const activities = useQuery(api.activities.getAllActivities);
  const [filter, setFilter] = useState("all");

  if (activities === undefined) {
    return <PageSkeleton />;
  }

  const filtered =
    filter === "all"
      ? activities
      : activities.filter((a) => a.action === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 mt-1">
            {filtered.length} activit{filtered.length === 1 ? "y" : "ies"}
            {filter !== "all" && " (filtered)"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No activity found"
          description={
            filter !== "all"
              ? "No activity matches the selected filter. Try a different filter."
              : "Activity will appear here as deals are submitted and managed."
          }
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filtered.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  {/* Action type indicator */}
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.action === "deal_submitted"
                        ? "bg-blue-500"
                        : activity.action === "status_change"
                          ? "bg-purple-500"
                          : activity.action === "lender_assigned"
                            ? "bg-indigo-500"
                            : activity.action === "note_added"
                              ? "bg-gray-400"
                              : activity.action === "commission_paid"
                                ? "bg-green-500"
                                : "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{activity.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(activity.created_at)}
                      </span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-gray-400 capitalize">
                        {activity.action.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  {/* Status badges for status change activities */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.from_status && (
                      <DealStatusBadge status={activity.from_status} />
                    )}
                    {activity.from_status && activity.to_status && (
                      <span className="text-gray-300 text-xs">&rarr;</span>
                    )}
                    {activity.to_status && (
                      <DealStatusBadge status={activity.to_status} />
                    )}
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
