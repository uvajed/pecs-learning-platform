"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WeeklyGoalProps {
  sessionsThisWeek: number;
  goalSessions: number;
  daysRemaining: number;
  className?: string;
}

export function WeeklyGoal({
  sessionsThisWeek,
  goalSessions,
  daysRemaining,
  className,
}: WeeklyGoalProps) {
  const progress = Math.min((sessionsThisWeek / goalSessions) * 100, 100);
  const isGoalMet = sessionsThisWeek >= goalSessions;
  const sessionsRemaining = Math.max(goalSessions - sessionsThisWeek, 0);

  // Calculate checkpoints (evenly distributed)
  const checkpoints = Array.from({ length: goalSessions }, (_, i) => ({
    position: ((i + 1) / goalSessions) * 100,
    reached: sessionsThisWeek > i,
  }));

  return (
    <div
      className={cn(
        "bg-[var(--card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-3xl select-none"
            animate={isGoalMet ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isGoalMet ? Infinity : 0, repeatDelay: 3 }}
          >
            {isGoalMet ? "🎯" : "🏃"}
          </motion.span>
          <div>
            <h3 className="font-semibold text-lg">Weekly Goal</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {daysRemaining} days remaining
            </p>
          </div>
        </div>

        {isGoalMet && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full"
          >
            <span>✓</span>
            <span className="font-medium text-sm">Goal Met!</span>
          </motion.div>
        )}
      </div>

      {/* Progress bar with checkpoints */}
      <div className="relative mb-4">
        <div className="h-4 bg-[var(--muted)] rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isGoalMet
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light,hsl(142_45%_70%))]"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Checkpoint markers */}
        {checkpoints.map((checkpoint, index) => (
          <div
            key={index}
            className="absolute top-0 h-4 flex items-center"
            style={{ left: `${checkpoint.position}%`, transform: "translateX(-50%)" }}
          >
            <motion.div
              className={cn(
                "w-3 h-3 rounded-full border-2 border-white",
                checkpoint.reached
                  ? isGoalMet
                    ? "bg-emerald-500"
                    : "bg-[var(--primary)]"
                  : "bg-[var(--muted)]"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold text-[var(--primary)]">
            {sessionsThisWeek}
          </span>
          <span className="text-lg text-[var(--muted-foreground)]">
            {" "}/ {goalSessions}
          </span>
          <p className="text-sm text-[var(--muted-foreground)]">sessions completed</p>
        </div>

        {!isGoalMet && sessionsRemaining > 0 && (
          <div className="text-right">
            <p className="text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">
                {sessionsRemaining}
              </span>{" "}
              more to go
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              ~{Math.ceil(sessionsRemaining / Math.max(daysRemaining, 1))} per day
            </p>
          </div>
        )}

        {isGoalMet && (
          <div className="text-right">
            <p className="text-sm text-emerald-600 font-medium">
              +{sessionsThisWeek - goalSessions} bonus sessions
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">Keep it up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
