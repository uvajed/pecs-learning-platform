"use client";

import { cn } from "@/lib/utils";
import { PECS_PHASES } from "@/types";
import { Check, Lock, Play } from "lucide-react";

interface PhaseProgress {
  phase: number;
  status: "completed" | "in_progress" | "locked";
  progress: number; // 0-100
  sessionsCompleted: number;
  successRate: number;
}

interface PhaseProgressChartProps {
  data: PhaseProgress[];
  className?: string;
}

export function PhaseProgressChart({ data, className }: PhaseProgressChartProps) {
  const getPhaseInfo = (phase: number) => {
    return PECS_PHASES.find((p) => p.id === phase);
  };

  const getStatusIcon = (status: PhaseProgress["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-white" />;
      case "in_progress":
        return <Play className="w-4 h-4 text-white fill-white" />;
      case "locked":
        return <Lock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: PhaseProgress["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-[var(--primary)]";
      case "locked":
        return "bg-gray-200";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {data.map((phase, index) => {
        const phaseInfo = getPhaseInfo(phase.phase);
        const isLast = index === data.length - 1;

        return (
          <div key={phase.phase} className="relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-5 top-12 w-0.5 h-8",
                  phase.status === "completed" ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}

            <div className="flex gap-4">
              {/* Phase indicator */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  getStatusColor(phase.status)
                )}
              >
                {getStatusIcon(phase.status)}
              </div>

              {/* Phase details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className={cn(
                      "font-semibold",
                      phase.status === "locked"
                        ? "text-gray-400"
                        : "text-[var(--foreground)]"
                    )}
                  >
                    Phase {phase.phase}: {phaseInfo?.name}
                  </h4>
                  {phase.status !== "locked" && (
                    <span className="text-sm font-medium text-[var(--primary)]">
                      {phase.progress}%
                    </span>
                  )}
                </div>

                {phase.status !== "locked" && (
                  <>
                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          phase.status === "completed"
                            ? "bg-green-500"
                            : "bg-[var(--primary)]"
                        )}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
                      <span>{phase.sessionsCompleted} sessions</span>
                      <span>{phase.successRate}% success rate</span>
                    </div>
                  </>
                )}

                {phase.status === "locked" && (
                  <p className="text-sm text-gray-400">
                    Complete Phase {phase.phase - 1} to unlock
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
