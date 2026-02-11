/**
 * Admin deal detail page — full deal information with admin actions.
 * Actions: advance stage, move backward (with note), assign lender,
 * add notes, mark dead/declined. Shows activity log and commission info.
 * This is where the broker manages individual deals in the pipeline.
 */
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { DealStageTimeline } from "@/components/deals/DealStageTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPercent,
  daysSince,
} from "@/lib/utils";
import {
  ACTIVE_STAGES,
  DEAL_STAGES,
  STAGE_LABELS,
  TERMINAL_STAGES,
} from "@/lib/constants";
import { toast } from "sonner";

export default function AdminDealDetailPage() {
  const params = useParams();
  const dealId = params.id as Id<"deals">;

  const deal = useQuery(api.deals.getDeal, { dealId });
  const activities = useQuery(api.activities.getDealActivities, { dealId });
  const commissions = useQuery(api.commissions.getDealCommissions, { dealId });

  const updateStatus = useMutation(api.deals.updateDealStatus);
  const addNote = useMutation(api.deals.addDealNote);

  const [noteText, setNoteText] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showLenderModal, setShowLenderModal] = useState(false);

  if (deal === undefined || activities === undefined) {
    return <PageSkeleton />;
  }

  const isTerminal = TERMINAL_STAGES.includes(
    deal.status as (typeof TERMINAL_STAGES)[number]
  );
  const currentIndex = DEAL_STAGES.indexOf(
    deal.status as (typeof DEAL_STAGES)[number]
  );

  // Next stage for the "Advance" button
  const nextStage =
    !isTerminal && currentIndex < ACTIVE_STAGES.length - 1
      ? ACTIVE_STAGES[currentIndex + 1]
      : null;

  async function handleAdvance() {
    if (!nextStage) return;
    try {
      await updateStatus({
        dealId,
        newStatus: nextStage,
      });
      toast.success(`Deal advanced to ${STAGE_LABELS[nextStage]}`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to advance deal"
      );
    }
  }

  async function handleStatusChange() {
    if (!selectedStatus) return;
    // Backward movement or terminal movement requires a note
    const newIndex = DEAL_STAGES.indexOf(
      selectedStatus as (typeof DEAL_STAGES)[number]
    );
    const needsNote =
      newIndex < currentIndex ||
      selectedStatus === "dead" ||
      selectedStatus === "declined";

    if (needsNote && !statusNote.trim()) {
      toast.error("A note is required for this status change");
      return;
    }

    try {
      await updateStatus({
        dealId,
        newStatus: selectedStatus,
        note: statusNote.trim() || undefined,
      });
      toast.success(`Deal moved to ${STAGE_LABELS[selectedStatus]}`);
      setSelectedStatus("");
      setStatusNote("");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    try {
      await addNote({ dealId, note: noteText.trim() });
      toast.success("Note added");
      setNoteText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            &larr; Back to Pipeline
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {deal.property_address}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <DealStatusBadge status={deal.status} />
            <span className="text-gray-500 text-sm">
              {daysSince(deal.stage_entered_at)}d in current stage
            </span>
          </div>
        </div>

        {/* Quick action buttons */}
        {!isTerminal && (
          <div className="flex items-center gap-2">
            {nextStage && (
              <Button onClick={handleAdvance} className="bg-blue-600 hover:bg-blue-700">
                Advance to {STAGE_LABELS[nextStage]}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowLenderModal(true)}
            >
              Assign Lender
            </Button>
          </div>
        )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: deal info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  label="Loan Amount"
                  value={formatCurrency(deal.loan_amount)}
                  highlight
                />
                <DetailRow
                  label="Loan Type"
                  value={deal.loan_type.replace(/_/g, " ")}
                />
                <DetailRow
                  label="Transaction Type"
                  value={deal.transaction_type.replace(/_/g, " ")}
                />
                {deal.loan_position && (
                  <DetailRow
                    label="Loan Position"
                    value={deal.loan_position.replace(/_/g, " ")}
                  />
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
                <DetailRow
                  label="Property Type"
                  value={deal.property_type.replace(/_/g, " ")}
                />
                <DetailRow label="Borrower" value={deal.borrower_name} />
                {deal.borrower_email && (
                  <DetailRow label="Borrower Email" value={deal.borrower_email} />
                )}
                {deal.borrower_phone && (
                  <DetailRow label="Borrower Phone" value={deal.borrower_phone} />
                )}
                <DetailRow
                  label="Submitted"
                  value={formatDate(deal.created_at)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Activity feed */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {activities && activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {activities?.map((activity) => (
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

          {/* Commission info */}
          {commissions && commissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {commissions.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        Rate: {formatPercent(c.rate)}
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(c.amount)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          c.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : c.status === "voided"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: admin actions */}
        <div className="space-y-6">
          {/* Status change panel */}
          {!isTerminal && (
            <Card>
              <CardHeader>
                <CardTitle>Change Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.filter((s) => s !== deal.status).map(
                      (stage) => (
                        <SelectItem key={stage} value={stage}>
                          {STAGE_LABELS[stage]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Add a note (required for backward moves and dead/declined)..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleStatusChange}
                  disabled={!selectedStatus}
                  className="w-full"
                >
                  Update Status
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add note panel */}
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Internal note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                variant="outline"
                className="w-full"
              >
                Save Note
              </Button>
            </CardContent>
          </Card>

          {/* Admin notes display */}
          {deal.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                  {deal.notes}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lender assignment modal */}
      {showLenderModal && (
        <LenderAssignDialog
          dealId={dealId}
          propertyType={deal.property_type}
          onClose={() => setShowLenderModal(false)}
        />
      )}
    </div>
  );
}

/** Reusable detail row for labeled values */
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

/**
 * Inline lender assignment dialog — searches and assigns a lender to the deal.
 * Pre-filtered to show lenders matching the deal's property type.
 * Full LenderAssignModal component will replace this in Sprint 2 lender DB work.
 */
function LenderAssignDialog({
  dealId,
  propertyType,
  onClose,
}: {
  dealId: Id<"deals">;
  propertyType: string;
  onClose: () => void;
}) {
  const lenders = useQuery(api.lenders.searchLenders, {
    searchText: "",
    propertyType,
    pageSize: 20,
  });
  const assignLender = useMutation(api.deals.assignLender);
  const [searchText, setSearchText] = useState("");

  const filteredLenders = lenders?.lenders?.filter((l) =>
    searchText
      ? l.name.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

  async function handleAssign(lenderId: Id<"lenders">) {
    try {
      await assignLender({ dealId, lenderId });
      toast.success("Lender assigned successfully");
      onClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign lender"
      );
    }
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Lender</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search lenders..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {filteredLenders === undefined ? (
              <p className="text-sm text-gray-500">Loading lenders...</p>
            ) : filteredLenders.length === 0 ? (
              <p className="text-sm text-gray-500">No matching lenders found.</p>
            ) : (
              filteredLenders.map((lender) => (
                <div
                  key={lender._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium">{lender.name}</p>
                    <p className="text-xs text-gray-500">
                      {lender.specialties?.join(", ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssign(lender._id)}
                  >
                    Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
