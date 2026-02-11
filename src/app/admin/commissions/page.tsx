/**
 * Admin commission management — view and manage all partner commissions.
 * Admin can mark commissions as paid and update rates.
 * Filter by status and partner. Shows aggregate stats at top.
 */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Id } from "../../../../convex/_generated/dataModel";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "paid" | "voided";

export default function AdminCommissionsPage() {
  const commissions = useQuery(api.commissions.getAllCommissions);
  const markAsPaid = useMutation(api.commissions.markAsPaid);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  if (commissions === undefined) {
    return <PageSkeleton />;
  }

  const pending = commissions.filter((c) => c.status === "pending");
  const paid = commissions.filter((c) => c.status === "paid");
  const pendingTotal = pending.reduce((sum, c) => sum + c.amount, 0);
  const paidTotal = paid.reduce((sum, c) => sum + c.amount, 0);

  const filtered =
    statusFilter === "all"
      ? commissions
      : commissions.filter((c) => c.status === statusFilter);

  async function handleMarkPaid(commissionId: Id<"commissions">) {
    try {
      await markAsPaid({ commissionId });
      toast.success("Commission marked as paid");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update commission"
      );
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Pending Payouts"
          value={formatCurrency(pendingTotal)}
          isCurrency
          description={`${pending.length} pending`}
        />
        <StatsCard
          label="Total Paid"
          value={formatCurrency(paidTotal)}
          isCurrency
          description={`${paid.length} paid`}
        />
        <StatsCard
          label="All Commissions"
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

      {filtered.length === 0 ? (
        <EmptyState
          title="No commissions found"
          description="Commissions are created automatically when deals close."
        />
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="text-gray-600 text-sm">
                    {c.deal_id}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {c.partner_id}
                  </TableCell>
                  <TableCell>{formatPercent(c.rate)}</TableCell>
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
                  <TableCell className="text-gray-500 text-sm">
                    {c.paid_date || formatDate(c.created_at)}
                  </TableCell>
                  <TableCell>
                    {c.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkPaid(c._id)}
                      >
                        Mark Paid
                      </Button>
                    )}
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
