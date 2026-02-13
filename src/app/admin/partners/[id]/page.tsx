/**
 * Admin partner detail page — shows a specific partner's profile, deal history,
 * and commission summary. Accessed by clicking a partner row on the Partners list.
 */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/StatsCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as Id<"users">;

  const partners = useQuery(api.users.getPartners);
  const allDeals = useQuery(api.deals.getAllDeals);
  const allCommissions = useQuery(api.commissions.getAllCommissions);

  if (
    partners === undefined ||
    allDeals === undefined ||
    allCommissions === undefined
  ) {
    return <PageSkeleton />;
  }

  const partner = partners.find((p) => p._id === partnerId);

  if (!partner) {
    return (
      <div className="p-6">
        <EmptyState
          title="Partner not found"
          description="This partner may have been removed."
        />
      </div>
    );
  }

  const partnerDeals = allDeals.filter((d) => d.partner_id === partnerId);
  const partnerCommissions = allCommissions.filter(
    (c) => c.partner_id === partnerId
  );
  const totalEarned = partnerCommissions.reduce(
    (sum, c) => sum + (c.status === "paid" ? c.amount : 0),
    0
  );
  const totalPending = partnerCommissions.reduce(
    (sum, c) => sum + (c.status === "pending" ? c.amount : 0),
    0
  );
  const closedDeals = partnerDeals.filter((d) => d.status === "closed").length;
  const activeDeals = partnerDeals.filter(
    (d) => !["closed", "declined", "dead"].includes(d.status)
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/partners")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
          <p className="text-gray-500">
            {partner.email}
            {partner.company && ` \u00B7 ${partner.company}`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Deals" value={String(partnerDeals.length)} />
        <StatsCard label="Active Deals" value={String(activeDeals)} />
        <StatsCard label="Closed Deals" value={String(closedDeals)} />
        <StatsCard
          label="Earned"
          value={formatCurrency(totalEarned)}
          isCurrency
        />
      </div>

      {/* Pending commissions callout */}
      {totalPending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{formatCurrency(totalPending)}</span>{" "}
            in pending commissions awaiting payment.
          </p>
        </div>
      )}

      {/* Deals table */}
      <Card>
        <CardHeader>
          <CardTitle>Deal History</CardTitle>
        </CardHeader>
        <CardContent>
          {partnerDeals.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              No deals submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {partnerDeals.map((deal) => (
                <Link
                  key={deal._id}
                  href={`/admin/deals/${deal._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {deal.borrower_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {deal.property_address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(deal.loan_amount)}
                    </span>
                    <DealStatusBadge status={deal.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner info */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{partner.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{partner.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Company</dt>
              <dd className="font-medium">
                {partner.company || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">License #</dt>
              <dd className="font-medium">
                {partner.license_number || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Commission Rate</dt>
              <dd className="font-medium">
                {partner.commission_rate
                  ? `${(partner.commission_rate * 100).toFixed(1)}%`
                  : "Default"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Member Since</dt>
              <dd className="font-medium">{formatDate(partner.created_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
