"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StarCollectionProps {
  totalStars: number;
  maxStars?: number;
  todayStars?: number;
  showAnimation?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function StarCollection({
  totalStars,
  maxStars,
  todayStars = 0,
  showAnimation = true,
  size = "medium",
  className,
}: StarCollectionProps) {
  const sizeStyles = {
    small: {
      container: "gap-2",
      star: "text-xl",
      count: "text-lg",
      label: "text-xs",
    },
    medium: {
      container: "gap-3",
      star: "text-3xl",
      count: "text-2xl",
      label: "text-sm",
    },
    large: {
      container: "gap-4",
      star: "text-5xl",
      count: "text-4xl",
      label: "text-base",
    },
  };

  const styles = sizeStyles[size];

  // Calculate level based on stars (every 50 stars = 1 level)
  const level = Math.floor(totalStars / 50) + 1;
  const starsToNextLevel = 50 - (totalStars % 50);
  const levelProgress = ((totalStars % 50) / 50) * 100;

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-amber-50 to-yellow-50 rounded-[var(--radius-lg)] p-4 border border-yellow-200",
        className
      )}
    >
      <div className={cn("flex items-center justify-between", styles.container)}>
        {/* Star display */}
        <div className="flex items-center gap-3">
          <motion.span
            className={cn(styles.star, "select-none")}
            animate={
              showAnimation
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 4,
            }}
          >
            ⭐
          </motion.span>

          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn("font-bold text-yellow-700", styles.count)}>
                {totalStars.toLocaleString()}
              </span>
              {maxStars && (
                <span className={cn("text-yellow-600/60", styles.label)}>
                  / {maxStars.toLocaleString()}
                </span>
              )}
            </div>
            <span className={cn("text-yellow-600/80", styles.label)}>Stars earned</span>
          </div>
        </div>

        {/* Today's stars */}
        {todayStars > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-yellow-200/50 px-3 py-1 rounded-full"
          >
            <span className="text-sm">+{todayStars}</span>
            <span className="text-lg">⭐</span>
            <span className={cn("text-yellow-700", styles.label)}>today</span>
          </motion.div>
        )}
      </div>

      {/* Level progress */}
      <div className="mt-4 pt-4 border-t border-yellow-200">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏅</span>
            <span className="font-semibold text-yellow-700">Level {level}</span>
          </div>
          <span className="text-sm text-yellow-600/80">
            {starsToNextLevel} stars to Level {level + 1}
          </span>
        </div>
        <div className="h-3 bg-yellow-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-yellow-200">
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-700">{level}</p>
          <p className="text-xs text-yellow-600/80">Level</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-700">
            {Math.floor(totalStars / 10)}
          </p>
          <p className="text-xs text-yellow-600/80">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-700">
            {Math.floor(totalStars / 5)}
          </p>
          <p className="text-xs text-yellow-600/80">Achievements</p>
        </div>
      </div>
    </div>
  );
}
