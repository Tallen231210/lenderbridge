/**
 * Stats card component — displays a key metric with label and optional trend.
 * Used on dashboards to show deal counts, commission totals, etc.
 * Money amounts use green text for emphasis — salespeople love seeing green.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Highlight the value in green — used for money amounts */
  isCurrency?: boolean;
  description?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  isCurrency,
  description,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <p
          className={cn(
            "text-2xl font-bold mt-2",
            isCurrency ? "text-green-600" : "text-gray-900"
          )}
        >
          {value}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
