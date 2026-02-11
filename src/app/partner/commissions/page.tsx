/**
 * Partner commission center — earnings dashboard with commission history.
 * Stats: pending total, paid total, YTD earnings.
 * Table of all commissions with deal info, amount, rate, status, and date.
 * Partners can filter by status (pending/paid) but cannot modify commissions.
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatsCard } from "@/components/shared/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "paid" | "voided";

export default function PartnerCommissionsPage() {
  const commissions = useQuery(api.commissions.getPartnerCommissions);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  if (commissions === undefined) {
    return <PageSkeleton />;
  }

  // Calculate stats
  const pending = commissions.filter((c) => c.status === "pending");
  const paid = commissions.filter((c) => c.status === "paid");
  const pendingTotal = pending.reduce((sum, c) => sum + c.amount, 0);
  const paidTotal = paid.reduce((sum, c) => sum + c.amount, 0);

  // Apply status filter
  const filtered =
    statusFilter === "all"
      ? commissions
      : commissions.filter((c) => c.status === statusFilter);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>

      {/* Stats cards — money amounts prominent in green */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Pending Commissions"
          value={formatCurrency(pendingTotal)}
          isCurrency
          description={`${pending.length} pending`}
        />
        <StatsCard
          label="Paid Commissions"
          value={formatCurrency(paidTotal)}
          isCurrency
          description={`${paid.length} paid`}
        />
        <StatsCard
          label="Total Earnings"
          value={formatCurrency(pendingTotal + paidTotal)}
          isCurrency
          description={`${commissions.length} total`}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "paid", "voided"] as StatusFilter[]).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="capitalize"
          >
            {s === "all" ? "All" : s}
          </Button>
        ))}
      </div>

      {/* Commission table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No commissions yet"
          description="Commissions are created when your deals close."
        />
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="text-gray-600">
                    {c.deal_id}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatPercent(c.rate)}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(c.amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        c.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : c.status === "voided"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {c.paid_date || formatDate(c.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
