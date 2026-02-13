/**
 * Stats card component — displays a key metric with label and optional trend.
 * Used on dashboards to show deal counts, commission totals, etc.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Kept for API compatibility but no longer changes color */
  isCurrency?: boolean;
  description?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  description,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <p className="text-2xl font-bold mt-2 text-black">
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
