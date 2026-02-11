/**
 * Color-coded status badge for deal stages.
 * Instantly recognizable — green for closed, red for declined, etc.
 * Used in deal tables, Kanban cards, and detail views.
 */
"use client";

import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DealStatusBadgeProps {
  status: string;
  className?: string;
}

export function DealStatusBadge({ status, className }: DealStatusBadgeProps) {
  const label = STAGE_LABELS[status] || status;
  const colorClass = STAGE_COLORS[status] || "bg-gray-100 text-gray-800";

  return (
    <Badge
      variant="secondary"
      className={cn(colorClass, "font-medium", className)}
    >
      {label}
    </Badge>
  );
}
