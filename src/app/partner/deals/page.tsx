/**
 * Partner deal tracker — table of all partner's deals with status badges.
 * Sortable by date, status, and amount. Click through to deal detail.
 * Shows property address, loan amount, status, lender (if assigned), and days since submission.
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Button } from "@/components/ui/button";
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
import { DEAL_STAGES } from "@/lib/constants";

type SortField = "created_at" | "status" | "loan_amount";
type SortDir = "asc" | "desc";

export default function PartnerDealsPage() {
  const deals = useQuery(api.deals.getPartnerDeals);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  if (deals === undefined) {
    return <PageSkeleton />;
  }

  // Sort deals
  const sortedDeals = [...deals].sort((a, b) => {
    let cmp = 0;
    if (sortField === "created_at") {
      cmp = a.created_at - b.created_at;
    } else if (sortField === "loan_amount") {
      cmp = a.loan_amount - b.loan_amount;
    } else if (sortField === "status") {
      cmp =
        DEAL_STAGES.indexOf(a.status as (typeof DEAL_STAGES)[number]) -
        DEAL_STAGES.indexOf(b.status as (typeof DEAL_STAGES)[number]);
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
          <p className="text-gray-500 mt-1">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <Link href="/partner/deals/new">
          <Button>+ Submit New Deal</Button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          title="No deals yet"
          description="Submit your first deal to start building your pipeline."
          actionLabel="Submit Deal"
          onAction={() => {
            window.location.href = "/partner/deals/new";
          }}
        />
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("loan_amount")}
                >
                  Loan Amount{sortIndicator("loan_amount")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("status")}
                >
                  Status{sortIndicator("status")}
                </TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("created_at")}
                >
                  Submitted{sortIndicator("created_at")}
                </TableHead>
                <TableHead>Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDeals.map((deal) => (
                <TableRow key={deal._id}>
                  <TableCell>
                    <Link
                      href={`/partner/deals/${deal._id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {deal.property_address}
                    </Link>
                    <p className="text-xs text-gray-400 capitalize">
                      {deal.property_type.replace(/_/g, " ")}
                    </p>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(deal.loan_amount)}
                  </TableCell>
                  <TableCell>
                    <DealStatusBadge status={deal.status} />
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {deal.borrower_name}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatRelativeTime(deal.created_at)}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {daysSince(deal.created_at)}d
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
