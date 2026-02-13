/**
 * Admin partner management — view all referral partners with performance stats.
 * Shows partner name, deal count, commission total, and last active date.
 * Admin can click through to see a partner's deals.
 */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPartnersPage() {
  const router = useRouter();
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

  // Enrich partner data with deal counts and commission totals
  const enrichedPartners = partners.map((partner) => {
    const partnerDeals = allDeals.filter(
      (d) => d.partner_id === partner._id
    );
    const partnerCommissions = allCommissions.filter(
      (c) => c.partner_id === partner._id
    );
    const totalCommissions = partnerCommissions.reduce(
      (sum, c) => sum + (c.status !== "voided" ? c.amount : 0),
      0
    );
    // Most recent deal submission as "last active"
    const lastActive = partnerDeals.length > 0
      ? Math.max(...partnerDeals.map((d) => d.created_at))
      : partner.created_at;

    return {
      ...partner,
      dealCount: partnerDeals.length,
      totalCommissions,
      lastActive,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
        <p className="text-gray-500 mt-1">
          {partners.length} referral partner{partners.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Partner invite link — admin shares this URL with new referral partners */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Partner Registration Link</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Share this link with referral partners to invite them to the platform
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              const url = `${window.location.origin}/sign-up/partner`;
              navigator.clipboard.writeText(url);
              toast.success("Partner invite link copied to clipboard");
            }}
          >
            Copy Link
          </Button>
        </CardContent>
      </Card>

      {enrichedPartners.length === 0 ? (
        <EmptyState
          title="No partners yet"
          description="Partners will appear here once they create accounts."
        />
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead>Commissions</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedPartners.map((partner) => (
                <TableRow
                  key={partner._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/admin/partners/${partner._id}`)}
                >
                  <TableCell className="font-medium text-blue-600">
                    {partner.name}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {partner.email}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {partner.company || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {partner.dealCount}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(partner.totalCommissions)}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(partner.lastActive)}
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
