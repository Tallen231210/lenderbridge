/**
 * Borrower dashboard — read-only view of the borrower's active loan deals.
 * Shows deal status with visual progress indicator and activity feed.
 * Borrowers typically have 0-2 deals linked via borrower_id.
 * If no deals are linked, shows a helpful empty state explaining the process.
 */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { DealStageTimeline } from "@/components/deals/DealStageTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export default function BorrowerDashboardPage() {
  const deals = useQuery(api.deals.getBorrowerDeals);

  if (deals === undefined) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Deals</h1>
        <p className="text-gray-500 mt-1">
          Track the progress of your loan applications
        </p>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          title="No deals linked to your account"
          description="Your referral partner will link your deal by email. If you believe this is an error, contact your partner."
        />
      ) : (
        <div className="space-y-6">
          {deals.map((deal) => (
            <Card key={deal._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {deal.property_address}
                  </CardTitle>
                  <DealStatusBadge status={deal.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Deal progress timeline */}
                <DealStageTimeline currentStatus={deal.status} />

                {/* Deal info grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Loan Amount</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(deal.loan_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Loan Type</p>
                    <p className="text-sm font-medium capitalize">
                      {deal.loan_type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Property Type</p>
                    <p className="text-sm font-medium capitalize">
                      {deal.property_type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="text-sm font-medium">
                      {formatDate(deal.created_at)}
                    </p>
                  </div>
                </div>

                {/* Activity feed for this deal */}
                <DealActivityFeed dealId={deal._id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Activity feed for a single deal — shows recent status changes.
 * Displayed inline within each deal card on the borrower dashboard.
 */
function DealActivityFeed({ dealId }: { dealId: Id<"deals"> }) {
  const activities = useQuery(api.activities.getDealActivities, {
    dealId,
  });

  if (!activities || activities.length === 0) return null;

  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Recent Activity
      </h4>
      <div className="space-y-2">
        {activities.slice(0, 5).map((activity) => (
          <div
            key={activity._id}
            className="flex items-start gap-3 text-sm border-l-2 border-gray-200 pl-3 py-1"
          >
            <div className="flex-1">
              <p className="text-gray-600">{activity.details}</p>
              <p className="text-xs text-gray-400">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
            {activity.to_status && (
              <DealStatusBadge status={activity.to_status} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
