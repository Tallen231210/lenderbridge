/**
 * Admin pipeline dashboard — Kanban board for managing the deal pipeline.
 * Columns represent active stages; drag-and-drop moves deals between stages.
 * Below the Kanban, a "Closed Deals" table shows all terminal deals
 * (closed, declined, dead) so they remain accessible after leaving the pipeline.
 */
"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { TERMINAL_STAGES } from "@/lib/constants";

export default function AdminDashboardPage() {
  const allDeals = useQuery(api.deals.getAllDealsWithNames);

  // Filter to only terminal deals (closed, declined, dead)
  const terminalDeals = allDeals?.filter((d) =>
    TERMINAL_STAGES.includes(d.status as (typeof TERMINAL_STAGES)[number])
  );

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Deal Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Drag deals between columns to update their status
        </p>
      </div>
      <KanbanBoard />

      {/* Terminal deals table — closed, declined, dead */}
      {terminalDeals && terminalDeals.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Closed Deals
            </CardTitle>
            <p className="text-sm text-gray-500">
              Deals that have been closed, declined, or marked as dead
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terminalDeals.map((deal) => (
                    <TableRow key={deal._id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>
                        <Link
                          href={`/admin/deals/${deal._id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {deal.property_address}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {deal.partner_name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatCurrency(deal.loan_amount)}
                      </TableCell>
                      <TableCell>
                        <DealStatusBadge status={deal.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatRelativeTime(deal.stage_entered_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
