/**
 * Kanban column — a single stage column in the pipeline board.
 * Shows stage label, deal count, and a droppable area for deal cards.
 * Uses dnd-kit's useDroppable for drag-and-drop target detection.
 */
"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DealCard, DealCardData } from "@/components/deals/DealCard";
import { STAGE_LABELS } from "@/lib/constants";
import { formatCurrencyCompact } from "@/lib/utils";

interface KanbanColumnProps {
  stageId: string;
  deals: DealCardData[];
}

export function KanbanColumn({ stageId, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });

  // Calculate total pipeline value for this column
  const columnTotal = deals.reduce((sum, d) => sum + d.loan_amount, 0);

  return (
    <div
      className={`flex flex-col min-w-[250px] max-w-[280px] rounded-lg border transition-colors duration-100 ${
        isOver ? "border-black bg-gray-50" : "border-gray-200 bg-gray-50/50"
      }`}
    >
      {/* Column header with stage name and count */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-black">
            {STAGE_LABELS[stageId] || stageId}
          </h3>
          <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 font-medium">
            {deals.length}
          </span>
        </div>
        {columnTotal > 0 && (
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {formatCurrencyCompact(columnTotal)}
          </p>
        )}
      </div>

      {/* Droppable card area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px] max-h-[calc(100vh-280px)]"
      >
        <SortableContext
          items={deals.map((d) => d._id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal._id} deal={deal} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-4">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}
