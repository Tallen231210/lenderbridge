/**
 * Visual timeline showing a deal's progression through pipeline stages.
 * Current stage is highlighted, completed stages show checkmarks.
 * Used in both partner and admin deal detail views.
 */
"use client";

import { ACTIVE_STAGES, STAGE_LABELS, TERMINAL_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DealStageTimelineProps {
  currentStatus: string;
}

export function DealStageTimeline({ currentStatus }: DealStageTimelineProps) {
  const isTerminal = TERMINAL_STAGES.includes(
    currentStatus as (typeof TERMINAL_STAGES)[number]
  );
  const currentIndex = ACTIVE_STAGES.indexOf(
    currentStatus as (typeof ACTIVE_STAGES)[number]
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {ACTIVE_STAGES.map((stage, index) => {
          const isCompleted = !isTerminal && index < currentIndex;
          const isCurrent = stage === currentStatus;
          const isPast = isTerminal || index <= currentIndex;

          return (
            <div key={stage} className="flex flex-col items-center flex-1">
              {/* Connector line */}
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isPast ? "bg-blue-500" : "bg-gray-200"
                    )}
                  />
                )}
                {/* Stage dot */}
                <div
                  className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0",
                    isCurrent
                      ? "bg-blue-600 ring-4 ring-blue-100"
                      : isCompleted
                        ? "bg-blue-500"
                        : "bg-gray-200"
                  )}
                />
                {index < ACTIVE_STAGES.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isPast && index < currentIndex
                        ? "bg-blue-500"
                        : "bg-gray-200"
                    )}
                  />
                )}
              </div>
              {/* Stage label */}
              <span
                className={cn(
                  "text-[10px] mt-1 text-center leading-tight",
                  isCurrent
                    ? "text-blue-700 font-semibold"
                    : isCompleted
                      ? "text-blue-500"
                      : "text-gray-400"
                )}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal status indicator */}
      {isTerminal && (
        <div
          className={cn(
            "mt-4 text-center text-sm font-semibold py-2 rounded-lg",
            currentStatus === "closed"
              ? "bg-green-50 text-green-700"
              : currentStatus === "declined"
                ? "bg-red-50 text-red-700"
                : "bg-gray-50 text-gray-700"
          )}
        >
          Deal {STAGE_LABELS[currentStatus]}
        </div>
      )}
    </div>
  );
}
