"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ACHIEVEMENTS, type AchievementDefinition } from "@/types";

interface AchievementProgressData {
  achievementId: string;
  currentValue: number;
  targetValue: number;
}

interface AchievementProgressProps {
  earnedAchievements: string[];
  progressData: AchievementProgressData[];
  className?: string;
}

export function AchievementProgress({
  earnedAchievements,
  progressData,
  className,
}: AchievementProgressProps) {
  // Find achievements that are in progress (not earned, have progress)
  const inProgressAchievements = progressData
    .filter((p) => !earnedAchievements.includes(p.achievementId))
    .filter((p) => p.currentValue > 0)
    .map((p) => ({
      ...p,
      definition: ACHIEVEMENTS[p.achievementId],
      percentage: Math.min((p.currentValue / p.targetValue) * 100, 100),
    }))
    .filter((p) => p.definition)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  if (inProgressAchievements.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-lg">In Progress</h3>
      <div className="space-y-3">
        {inProgressAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.achievementId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{achievement.definition.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium truncate">
                    {achievement.definition.name}
                  </h4>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {achievement.currentValue} / {achievement.targetValue}
                  </span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {achievement.definition.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Category progress display
interface CategoryProgressProps {
  categories: {
    name: string;
    icon: string;
    earned: number;
    total: number;
  }[];
  className?: string;
}

export function CategoryProgress({ categories, className }: CategoryProgressProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
      {categories.map((category, index) => {
        const percentage = (category.earned / category.total) * 100;
        const isComplete = category.earned === category.total;

        return (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-4 rounded-[var(--radius-lg)] border-2 text-center",
              isComplete
                ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                : "bg-[var(--card)] border-[var(--border)]"
            )}
          >
            <span className="text-3xl block mb-2">{category.icon}</span>
            <h4 className="font-semibold">{category.name}</h4>
            <p className="text-sm text-[var(--muted-foreground)]">
              {category.earned} / {category.total}
            </p>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden mt-2">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isComplete ? "bg-[var(--primary)]" : "bg-[var(--primary)]/60"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Stats summary for achievements
interface AchievementStatsProps {
  totalEarned: number;
  totalAvailable: number;
  recentUnlocks: {
    id: string;
    name: string;
    icon: string;
    earnedAt: string;
  }[];
  className?: string;
}

export function AchievementStats({
  totalEarned,
  totalAvailable,
  recentUnlocks,
  className,
}: AchievementStatsProps) {
  const percentage = Math.round((totalEarned / totalAvailable) * 100);

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-amber-50 to-yellow-50 rounded-[var(--radius-lg)] border border-yellow-200 p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-800">
            {totalEarned} / {totalAvailable}
          </h2>
          <p className="text-sm text-yellow-700">Achievements Earned</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-yellow-600">{percentage}%</div>
          <p className="text-xs text-yellow-700">Complete</p>
        </div>
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: percentage / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-yellow-700">
            {totalEarned}
          </span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 mb-1">
            Keep going! {totalAvailable - totalEarned} more to unlock!
          </p>
          <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Recent unlocks */}
      {recentUnlocks.length > 0 && (
        <div>
          <p className="text-xs font-medium text-yellow-700 mb-2">
            RECENTLY UNLOCKED
          </p>
          <div className="flex gap-2">
            {recentUnlocks.slice(0, 5).map((unlock) => (
              <div
                key={unlock.id}
                className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full"
                title={unlock.name}
              >
                <span className="text-lg">{unlock.icon}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
