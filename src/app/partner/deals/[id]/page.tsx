/**
 * Partner deal detail view — read-only deal info with stage timeline.
 * Shows deal details, stage progression timeline, activity feed, and commission info.
 * Partners can see but not edit their submitted deals.
 */
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { DealStageTimeline } from "@/components/deals/DealStageTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export default function PartnerDealDetailPage() {
  const params = useParams();
  const dealId = params.id as Id<"deals">;

  const deal = useQuery(api.deals.getDeal, { dealId });
  const activities = useQuery(api.activities.getDealActivities, { dealId });

  if (deal === undefined || activities === undefined) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/partner/deals"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to My Deals
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {deal.property_address}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <DealStatusBadge status={deal.status} />
            <span className="text-gray-500 text-sm">
              Submitted {formatDate(deal.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stage timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <DealStageTimeline currentStatus={deal.status} />
        </CardContent>
      </Card>

      {/* Deal details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Loan Amount" value={formatCurrency(deal.loan_amount)} highlight />
            <DetailRow label="Loan Type" value={deal.loan_type.replace(/_/g, " ")} />
            <DetailRow label="Transaction Type" value={deal.transaction_type.replace(/_/g, " ")} />
            {deal.loan_position && (
              <DetailRow label="Loan Position" value={deal.loan_position.replace(/_/g, " ")} />
            )}
            {deal.estimated_close && (
              <DetailRow label="Est. Close" value={deal.estimated_close} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property & Borrower</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Property Address" value={deal.property_address} />
            <DetailRow label="Property Type" value={deal.property_type.replace(/_/g, " ")} />
            <DetailRow label="Borrower" value={deal.borrower_name} />
            {deal.borrower_email && (
              <DetailRow label="Borrower Email" value={deal.borrower_email} />
            )}
            {deal.borrower_phone && (
              <DetailRow label="Borrower Phone" value={deal.borrower_phone} />
            )}
            {deal.borrower_company && (
              <DetailRow label="Borrower Company" value={deal.borrower_company} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 text-sm border-l-2 border-gray-200 pl-4 py-1"
                >
                  <div className="flex-1">
                    <p className="text-gray-700">{activity.details}</p>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Helper component for labeled detail rows */
function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 text-sm">{label}</span>
      <span
        className={`text-sm font-medium capitalize ${highlight ? "text-green-600 text-base" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
