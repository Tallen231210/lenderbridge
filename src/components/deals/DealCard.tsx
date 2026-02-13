/**
 * Kanban deal card — compact card shown in pipeline columns.
 * Displays property address, partner name, loan amount, and days in stage.
 * Shows amber warning badge for dormant deals (14+ days in stage).
 * Used exclusively on the admin Kanban pipeline board.
 *
 * Split into three parts to avoid a dnd-kit anti-pattern:
 * - CardInner: presentational UI (private, no hooks)
 * - DealCard: sortable wrapper used inside KanbanColumn
 * - DealCardOverlay: static wrapper used inside DragOverlay
 *   (useSortable must never run inside DragOverlay — it produces
 *   stale transforms that offset the overlay from the cursor)
 */
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatCurrencyCompact, daysSince } from "@/lib/utils";
import { DORMANT_THRESHOLD_DAYS } from "@/lib/constants";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";

export interface DealCardData {
  _id: Id<"deals">;
  property_address: string;
  property_type: string;
  loan_amount: number;
  status: string;
  partner_name: string;
  lender_name?: string;
  stage_entered_at: number;
  created_at: number;
}

interface DealCardProps {
  deal: DealCardData;
}

/** Private presentational component — all visual content, no drag logic. */
function CardInner({ deal }: DealCardProps) {
  const daysInStage = daysSince(deal.stage_entered_at);
  const isDormant = daysInStage >= DORMANT_THRESHOLD_DAYS;

  return (
    <div className="space-y-1.5">
      {/* Property address — clickable link to deal detail */}
      <Link
        href={`/admin/deals/${deal._id}`}
        className="text-sm font-medium text-black hover:underline block truncate"
        onClick={(e) => e.stopPropagation()}
      >
        {deal.property_address}
      </Link>

      {/* Partner name and property type */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{deal.partner_name}</span>
        <span className="capitalize">
          {deal.property_type.replace(/_/g, " ")}
        </span>
      </div>

      {/* Loan amount */}
      <div className="text-sm font-semibold text-black">
        {formatCurrencyCompact(deal.loan_amount)}
      </div>

      {/* Footer: days in stage + dormant warning */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${isDormant ? "text-red-600 font-semibold" : "text-gray-400"}`}
        >
          {daysInStage}d in stage
          {isDormant && " !"}
        </span>
        {deal.lender_name && (
          <span className="text-xs text-gray-500 truncate max-w-[100px]">
            {deal.lender_name}
          </span>
        )}
      </div>
    </div>
  );
}

/** Sortable deal card — used inside KanbanColumn (within SortableContext). */
export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-md border border-gray-200 p-3 cursor-grab active:cursor-grabbing ${
        isDragging ? "" : "hover:border-gray-300 transition-colors"
      }`}
    >
      <CardInner deal={deal} />
    </div>
  );
}

/**
 * Static overlay card — used inside DragOverlay.
 * No useSortable hook, so no phantom transforms that offset the card
 * from the cursor.
 */
export function DealCardOverlay({ deal }: DealCardProps) {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-3 shadow-lg cursor-grabbing opacity-90">
      <CardInner deal={deal} />
    </div>
  );
}
