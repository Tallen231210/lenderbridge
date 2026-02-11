/**
 * Partner dashboard — stats cards, recent deals, and quick submit CTA.
 * All data via Convex reactive queries — updates in real-time.
 * Stats: active deal count, pending commission total, YTD earnings.
 */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { formatCurrency, formatRelativeTime, daysSince } from "@/lib/utils";
import { TERMINAL_STAGES } from "@/lib/constants";

export default function PartnerDashboardPage() {
  const { user } = useCurrentUser();
  const deals = useQuery(api.deals.getPartnerDeals);
  const commissions = useQuery(api.commissions.getPartnerCommissions);

  if (deals === undefined || commissions === undefined) {
    return <PageSkeleton />;
  }

  // Calculate stats
  const activeDeals = deals.filter(
    (d) => !TERMINAL_STAGES.includes(d.status as "closed" | "declined" | "dead")
  );
  const pendingCommissions = commissions.filter((c) => c.status === "pending");
  const paidCommissions = commissions.filter((c) => c.status === "paid");
  const pendingTotal = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
  const paidTotal = paidCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Recent deals (5 most recent)
  const recentDeals = deals.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header with CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </p>
        </div>
        <Link href="/partner/deals/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Submit New Deal
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Active Deals"
          value={String(activeDeals.length)}
          description={`${deals.length} total deals`}
        />
        <StatsCard
          label="Pending Commissions"
          value={formatCurrency(pendingTotal)}
          isCurrency
          description={`${pendingCommissions.length} pending`}
        />
        <StatsCard
          label="YTD Earnings"
          value={formatCurrency(paidTotal)}
          isCurrency
          description={`${paidCommissions.length} paid`}
        />
      </div>

      {/* Recent deals table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Deals</CardTitle>
          <Link href="/partner/deals">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentDeals.length === 0 ? (
            <EmptyState
              title="No deals yet"
              description="Submit your first deal to get started."
              actionLabel="Submit Deal"
              onAction={() => {
                window.location.href = "/partner/deals/new";
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeals.map((deal) => (
                  <TableRow key={deal._id}>
                    <TableCell>
                      <Link
                        href={`/partner/deals/${deal._id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {deal.property_address}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(deal.loan_amount)}
                    </TableCell>
                    <TableCell>
                      <DealStatusBadge status={deal.status} />
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatRelativeTime(deal.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
