/**
 * Admin pipeline dashboard — Kanban board for managing the deal pipeline.
 * Columns represent active stages; drag-and-drop moves deals between stages.
 * Includes pipeline stats, search, and filters by partner/property type.
 */
"use client";

import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Deal Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Drag deals between columns to update their status
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
