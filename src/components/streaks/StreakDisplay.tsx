"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StreakInfo } from "@/lib/gamification/streaks";

interface StreakDisplayProps {
  streak: StreakInfo;
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
  className?: string;
}

export function StreakDisplay({
  streak,
  size = "medium",
  showDetails = true,
  className,
}: StreakDisplayProps) {
  const sizeStyles = {
    small: {
      container: "px-3 py-2",
      icon: "text-xl",
      count: "text-lg",
      label: "text-xs",
    },
    medium: {
      container: "px-4 py-3",
      icon: "text-2xl",
      count: "text-2xl",
      label: "text-sm",
    },
    large: {
      container: "px-6 py-4",
      icon: "text-4xl",
      count: "text-4xl",
      label: "text-base",
    },
  };

  const styles = sizeStyles[size];
  const isActive = streak.currentStreak > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]",
        styles.container,
        className
      )}
    >
      {/* Fire icon with animation */}
      <motion.span
        className={cn(styles.icon, "select-none")}
        animate={
          isActive
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: isActive ? Infinity : 0,
          repeatDelay: 2,
        }}
      >
        {isActive ? "🔥" : "💤"}
      </motion.span>

      {/* Streak count */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold leading-none",
            styles.count,
            isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
          )}
        >
          {streak.currentStreak}
        </span>
        <span className={cn("text-[var(--muted-foreground)]", styles.label)}>
          day streak
        </span>
      </div>

      {/* Details section */}
      {showDetails && (
        <div className="ml-3 pl-3 border-l border-[var(--border)] flex flex-col">
          <span className={cn("text-[var(--muted-foreground)]", styles.label)}>
            Best: {streak.longestStreak} days
          </span>
          {streak.statusMessage ? (
            <span
              className={cn(
                "text-[var(--primary)] font-medium",
                styles.label
              )}
            >
              {streak.statusMessage}
            </span>
          ) : streak.currentStreak >= 7 ? (
            <span className={cn("text-[var(--primary)] font-medium", styles.label)}>
              One week strong!
            </span>
          ) : streak.currentStreak >= 3 ? (
            <span className={cn("text-[var(--primary)] font-medium", styles.label)}>
              Keep it up!
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
