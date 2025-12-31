"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PECS_PHASES, type PECSPhase } from "@/types";

interface PhaseProgress {
  phase: PECSPhase;
  status: "locked" | "in_progress" | "completed";
  progress: number; // 0-100
  sessionsCompleted: number;
  successRate: number;
}

interface ProgressJourneyProps {
  phases: PhaseProgress[];
  className?: string;
}

const PHASE_ICONS: Record<PECSPhase, string> = {
  1: "🖐️",
  2: "📏",
  3: "🔍",
  4: "📝",
  5: "❓",
  6: "💬",
};

export function ProgressJourney({ phases, className }: ProgressJourneyProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Background path */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 800 200"
          className="w-full h-auto max-h-48"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M50,100 Q150,30 250,100 T450,100 T650,100 T750,100"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Phase nodes */}
      <div className="relative grid grid-cols-6 gap-4 py-8">
        {phases.map((phase, index) => {
          const phaseInfo = PECS_PHASES.find(p => p.id === phase.phase);
          const isLocked = phase.status === "locked";
          const isCompleted = phase.status === "completed";
          const isActive = phase.status === "in_progress";

          return (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              {/* Node circle */}
              <motion.div
                className={cn(
                  "relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 transition-all",
                  isCompleted && "bg-[var(--primary)] border-[var(--primary)] text-white",
                  isActive && "bg-white border-[var(--primary)] ring-4 ring-[var(--primary)]/30",
                  isLocked && "bg-[var(--muted)] border-[var(--border)] opacity-50"
                )}
                whileHover={!isLocked ? { scale: 1.1 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
              >
                {/* Icon */}
                <span className="text-2xl md:text-3xl">
                  {isCompleted ? "✓" : PHASE_ICONS[phase.phase]}
                </span>

                {/* Progress ring for active phase */}
                {isActive && (
                  <svg
                    className="absolute inset-0 -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="8"
                      strokeDasharray={`${phase.progress * 2.89} 289`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Star for completed */}
                {isCompleted && (
                  <motion.span
                    className="absolute -top-2 -right-2 text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: index * 0.1 + 0.3 }}
                  >
                    ⭐
                  </motion.span>
                )}
              </motion.div>

              {/* Phase label */}
              <div className="text-center">
                <p
                  className={cn(
                    "font-semibold text-sm",
                    isLocked && "text-[var(--muted-foreground)]"
                  )}
                >
                  Phase {phase.phase}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] hidden md:block">
                  {phaseInfo?.name}
                </p>
              </div>

              {/* Progress stats for non-locked phases */}
              {!isLocked && (
                <div className="text-center text-xs text-[var(--muted-foreground)]">
                  <p>{phase.sessionsCompleted} sessions</p>
                  <p>{Math.round(phase.successRate)}% success</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Achievement summary */}
      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[var(--border)]">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--primary)]">
            {phases.filter((p) => p.status === "completed").length}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">Phases Complete</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--primary)]">
            {phases.reduce((sum, p) => sum + p.sessionsCompleted, 0)}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">Total Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--primary)]">
            {Math.round(
              phases.filter((p) => p.sessionsCompleted > 0).reduce((sum, p) => sum + p.successRate, 0) /
                Math.max(phases.filter((p) => p.sessionsCompleted > 0).length, 1)
            )}%
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">Avg Success</p>
        </div>
      </div>
    </div>
  );
}
