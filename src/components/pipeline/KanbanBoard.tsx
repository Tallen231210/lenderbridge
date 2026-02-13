/**
 * Admin Kanban pipeline board — drag-and-drop deal management.
 * Columns represent active deal stages (submitted through clear_to_close).
 * Dragging a card between columns triggers a status change mutation.
 * Includes pipeline stats, search bar, and partner/property type filters.
 */
"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { KanbanColumn } from "./KanbanColumn";
import { DealCard, DealCardData } from "@/components/deals/DealCard";
import { ACTIVE_STAGES, STAGE_LABELS, PROPERTY_TYPES } from "@/lib/constants";
import { formatCurrencyCompact } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";

export function KanbanBoard() {
  const deals = useQuery(api.deals.getAllDealsWithNames);
  const updateStatus = useMutation(api.deals.updateDealStatus);

  const [activeDeal, setActiveDeal] = useState<DealCardData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");

  // dnd-kit pointer sensor with a small activation distance to avoid
  // accidental drags when clicking links inside cards
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Filter and group deals into columns
  const { columns, uniquePartners, totalPipelineValue, totalActiveDeals } =
    useMemo(() => {
      if (!deals)
        return {
          columns: {} as Record<string, DealCardData[]>,
          uniquePartners: [] as string[],
          totalPipelineValue: 0,
          totalActiveDeals: 0,
        };

      // Apply search and filters
      const filtered = deals.filter((deal) => {
        // Search: match property address, partner name, or borrower name
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesSearch =
            deal.property_address.toLowerCase().includes(q) ||
            deal.partner_name.toLowerCase().includes(q) ||
            deal.borrower_name.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }

        // Partner filter
        if (partnerFilter !== "all" && deal.partner_name !== partnerFilter) {
          return false;
        }

        // Property type filter
        if (propertyFilter !== "all" && deal.property_type !== propertyFilter) {
          return false;
        }

        return true;
      });

      // Group deals by active stages only (terminal deals are excluded from Kanban)
      const cols: Record<string, DealCardData[]> = {};
      for (const stage of ACTIVE_STAGES) {
        cols[stage] = [];
      }

      let pipelineValue = 0;
      let activeCount = 0;

      for (const deal of filtered) {
        if (cols[deal.status]) {
          cols[deal.status].push(deal as DealCardData);
          pipelineValue += deal.loan_amount;
          activeCount++;
        }
      }

      // Extract unique partner names for the filter dropdown
      const partners = Array.from(new Set(deals.map((d) => d.partner_name))).sort();

      return {
        columns: cols,
        uniquePartners: partners,
        totalPipelineValue: pipelineValue,
        totalActiveDeals: activeCount,
      };
    }, [deals, searchQuery, partnerFilter, propertyFilter]);

  if (deals === undefined) {
    return <PageSkeleton />;
  }

  function handleDragStart(event: DragStartEvent) {
    const dealId = event.active.id as string;
    const deal = deals?.find((d) => d._id === dealId);
    if (deal) setActiveDeal(deal as DealCardData);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);

    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as Id<"deals">;
    const overColumnId = over.id as string;

    // Determine which column the deal was dropped on
    // over.id could be a column ID or another deal's ID
    let targetStage: string | null = null;

    if (ACTIVE_STAGES.includes(overColumnId as (typeof ACTIVE_STAGES)[number])) {
      targetStage = overColumnId;
    } else {
      // Dropped on another deal — find which column that deal is in
      const overDeal = deals?.find((d) => d._id === overColumnId);
      if (overDeal) {
        targetStage = overDeal.status;
      }
    }

    if (!targetStage) return;

    // Find the current deal's status
    const currentDeal = deals?.find((d) => d._id === dealId);
    if (!currentDeal || currentDeal.status === targetStage) return;

    // Execute the status change mutation
    updateStatus({
      dealId,
      newStatus: targetStage,
      note: `Moved via pipeline board from ${STAGE_LABELS[currentDeal.status]} to ${STAGE_LABELS[targetStage]}`,
    })
      .then(() => {
        toast.success(
          `Deal moved to ${STAGE_LABELS[targetStage!]}`
        );
      })
      .catch((err: Error) => {
        toast.error(err.message || "Failed to update deal status");
      });
  }

  return (
    <div className="space-y-4">
      {/* Pipeline stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-500">Active Deals:</span>{" "}
          <span className="font-semibold text-gray-900">
            {totalActiveDeals}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Pipeline Value:</span>{" "}
          <span className="font-semibold text-black">
            {formatCurrencyCompact(totalPipelineValue)}
          </span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Partners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partners</SelectItem>
            {uniquePartners.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Property Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Property Types</SelectItem>
            {PROPERTY_TYPES.map((pt) => (
              <SelectItem key={pt.value} value={pt.value}>
                {pt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban columns — horizontal scrollable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {ACTIVE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stageId={stage}
              deals={columns[stage] || []}
            />
          ))}
        </div>

        {/* Drag overlay — shows the card being dragged */}
        <DragOverlay>
          {activeDeal ? (
            <div className="rotate-2 opacity-90">
              <DealCard deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
