"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StreakInfo } from "@/lib/gamification/streaks";

interface StreakReminderProps {
  streak: StreakInfo;
  onDismiss?: () => void;
  onPractice?: () => void;
  className?: string;
}

const MOTIVATION_MESSAGES = [
  { threshold: 0, message: "Start your journey today!", icon: "🌱" },
  { threshold: 3, message: "You're building momentum!", icon: "🚀" },
  { threshold: 7, message: "One week strong! Keep it up!", icon: "⭐" },
  { threshold: 14, message: "Two weeks! You're unstoppable!", icon: "💪" },
  { threshold: 30, message: "A whole month! Incredible!", icon: "🏆" },
  { threshold: 60, message: "Two months of dedication!", icon: "👑" },
  { threshold: 100, message: "100 days! You're a champion!", icon: "🎖️" },
];

function getMotivationMessage(streak: number): { message: string; icon: string } {
  // Find the highest threshold that's <= current streak
  const applicable = MOTIVATION_MESSAGES.filter((m) => m.threshold <= streak);
  return applicable[applicable.length - 1] || MOTIVATION_MESSAGES[0];
}

// Compute days until streak loss based on lastActivityDate
function computeDaysUntilStreakLoss(streak: StreakInfo): number {
  if (streak.daysUntilStreakLoss !== undefined) {
    return streak.daysUntilStreakLoss;
  }
  if (!streak.lastActivityDate || streak.currentStreak === 0) {
    return 0;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActivity = new Date(streak.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 2; // Practiced today, 2 days until loss
  if (diffDays === 1) return 1; // Yesterday, 1 day until loss
  return 0; // Already lost
}

export function StreakReminder({
  streak,
  onDismiss,
  onPractice,
  className,
}: StreakReminderProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const motivation = getMotivationMessage(streak.currentStreak);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Compute if not provided
  const daysUntilLoss = computeDaysUntilStreakLoss(streak);

  // Different UI states
  const needsPractice = daysUntilLoss === 0 && streak.currentStreak > 0;
  const atRisk = daysUntilLoss === 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={cn(
            "relative rounded-[var(--radius-lg)] p-4 border",
            needsPractice
              ? "bg-orange-50 border-orange-200"
              : atRisk
              ? "bg-yellow-50 border-yellow-200"
              : "bg-[var(--primary)]/5 border-[var(--primary)]/20",
            className
          )}
        >
          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}

          <div className="flex items-center gap-4">
            {/* Icon */}
            <motion.span
              className="text-4xl select-none"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              {needsPractice ? "⏰" : motivation.icon}
            </motion.span>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {needsPractice
                  ? "Don't lose your streak!"
                  : streak.currentStreak === 0
                  ? "Start a new streak!"
                  : motivation.message}
              </h3>

              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {needsPractice ? (
                  <>
                    Practice today to keep your{" "}
                    <span className="font-semibold text-[var(--primary)]">
                      {streak.currentStreak}-day streak
                    </span>{" "}
                    going!
                  </>
                ) : atRisk ? (
                  <>
                    Practice tomorrow to maintain your streak. You've got this!
                  </>
                ) : streak.currentStreak === 0 ? (
                  <>
                    Complete a practice session to begin building your streak.
                  </>
                ) : (
                  <>
                    Current streak:{" "}
                    <span className="font-semibold">{streak.currentStreak} days</span>
                    {streak.longestStreak > streak.currentStreak && (
                      <>
                        {" "}• Best:{" "}
                        <span className="font-semibold">{streak.longestStreak} days</span>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Action button */}
            {onPractice && (
              <button
                onClick={onPractice}
                className={cn(
                  "px-4 py-2 rounded-[var(--radius)] font-semibold text-white transition-all hover:scale-105",
                  needsPractice
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-[var(--primary)] hover:opacity-90"
                )}
              >
                Practice Now
              </button>
            )}
          </div>

          {/* Progress to next milestone */}
          {streak.currentStreak > 0 && !needsPractice && (
            <NextMilestoneProgress currentStreak={streak.currentStreak} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NextMilestoneProgress({ currentStreak }: { currentStreak: number }) {
  // Find next milestone
  const milestones = [3, 7, 14, 30, 60, 100, 365];
  const nextMilestone = milestones.find((m) => m > currentStreak);

  if (!nextMilestone) return null;

  const prevMilestone = milestones[milestones.indexOf(nextMilestone) - 1] || 0;
  const progress =
    ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  const daysLeft = nextMilestone - currentStreak;

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
        <span>Next milestone: {nextMilestone} days</span>
        <span>{daysLeft} days to go</span>
      </div>
      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
