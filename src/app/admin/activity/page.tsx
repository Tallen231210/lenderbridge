/**
 * Admin activity log — chronological feed of all deal actions across the platform.
 * Shows submissions, stage changes, lender assignments, notes, and more.
 * Provides a global audit trail for the broker to monitor all pipeline activity.
 */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminActivityPage() {
  const activities = useQuery(api.activities.getAllActivities);

  if (activities === undefined) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-500 mt-1">
          All deal activity across the platform
        </p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Activity will appear here as deals are submitted and managed."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {activities.map((activity) => (
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
