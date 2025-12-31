"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { SessionPlan } from "@/lib/ai/recommendations";

interface SessionPlanCardProps {
  plan: SessionPlan;
  onStart?: () => void;
  className?: string;
}

const activityIcons: Record<string, string> = {
  warm_up: "🌅",
  main_practice: "📚",
  challenge: "🚀",
  reinforcement: "💪",
  break: "☕",
};

export function SessionPlanCard({ plan, onStart, className }: SessionPlanCardProps) {
  const totalDuration = plan.mainActivities.reduce((sum, a) => sum + a.duration, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 rounded-[var(--radius-lg)] border border-[var(--primary)]/20 p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold">Today's Session Plan</h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            AI-optimized for your child's current progress
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--primary)]">
            {plan.recommendedDuration} min
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            recommended
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/60 rounded-[var(--radius)] p-3 text-center">
          <div className="text-lg font-bold text-[var(--primary)]">
            Phase {plan.recommendedPhase}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">Focus Area</div>
        </div>
        <div className="bg-white/60 rounded-[var(--radius)] p-3 text-center">
          <div className="text-lg font-bold text-[var(--primary)]">
            Level {plan.difficultyLevel}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">Difficulty</div>
        </div>
        <div className="bg-white/60 rounded-[var(--radius)] p-3 text-center">
          <div className="text-lg font-bold text-[var(--primary)]">
            {plan.mainActivities.length}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">Activities</div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3 mb-6">
        <h3 className="font-semibold text-sm text-[var(--muted-foreground)]">
          SESSION OUTLINE
        </h3>

        {plan.mainActivities.map((activity, index) => {
          const progressWidth = (activity.duration / totalDuration) * 100;

          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">
                {activityIcons[activity.type] || "📝"}
              </span>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">{activity.description}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {activity.duration} min
                  </span>
                </div>
                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressWidth}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full bg-[var(--primary)]/60 rounded-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Cards */}
      {plan.suggestedCards.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-sm text-[var(--muted-foreground)] mb-2">
            SUGGESTED CARDS
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.suggestedCards.map((cardId) => (
              <span
                key={cardId}
                className="px-3 py-1 bg-white/60 rounded-full text-sm font-medium"
              >
                {cardId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Break Reminder */}
      {plan.breakInterval && (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-4">
          <span>☕</span>
          <span>Take a break every {plan.breakInterval} minutes</span>
        </div>
      )}

      {/* Start Button */}
      {onStart && (
        <Button onClick={onStart} className="w-full" size="lg">
          Start Recommended Session
        </Button>
      )}
    </motion.div>
  );
}
