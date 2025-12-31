"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AchievementBadge } from "./AchievementBadge";
import { Progress } from "@/components/ui/Progress";
import type { AchievementDefinition, EarnedAchievement, AchievementCategory } from "@/types";

interface TrophyCaseProps {
  allAchievements: AchievementDefinition[];
  earnedAchievements: EarnedAchievement[];
  className?: string;
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  milestone: "Milestones",
  streak: "Streaks",
  effort: "Effort",
  mastery: "Mastery",
  special: "Special",
  category: "Categories",
};

const CATEGORY_ORDER: AchievementCategory[] = ["milestone", "streak", "effort", "mastery", "special", "category"];

export function TrophyCase({
  allAchievements,
  earnedAchievements,
  className,
}: TrophyCaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");

  // Create a map of earned achievements for quick lookup
  const earnedMap = new Map(
    earnedAchievements.map((ea) => [ea.achievementType, ea])
  );

  // Group achievements by category
  const achievementsByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = allAchievements.filter((a) => a.category === category);
    return acc;
  }, {} as Record<AchievementCategory, AchievementDefinition[]>);

  // Calculate progress
  const totalEarned = earnedAchievements.length;
  const totalAvailable = allAchievements.length;
  const progressPercent = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;

  // Filter achievements based on selected category
  const displayedAchievements =
    selectedCategory === "all"
      ? allAchievements
      : achievementsByCategory[selectedCategory] || [];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Achievement Progress</h3>
          <span className="text-[var(--primary)] font-bold">
            {totalEarned}/{totalAvailable}
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {progressPercent}% complete
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            selectedCategory === "all"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80"
          )}
        >
          All ({totalAvailable})
        </button>
        {CATEGORY_ORDER.map((category) => {
          const categoryAchievements = achievementsByCategory[category] || [];
          const earnedInCategory = categoryAchievements.filter((a) =>
            earnedMap.has(a.id)
          ).length;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === category
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80"
              )}
            >
              {CATEGORY_LABELS[category]} ({earnedInCategory}/{categoryAchievements.length})
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      {selectedCategory === "all" ? (
        // Show grouped by category
        <div className="space-y-8">
          {CATEGORY_ORDER.map((category) => {
            const categoryAchievements = achievementsByCategory[category] || [];
            if (categoryAchievements.length === 0) return null;

            return (
              <div key={category}>
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  {CATEGORY_LABELS[category]}
                  <span className="text-sm font-normal text-[var(--muted-foreground)]">
                    ({categoryAchievements.filter((a) => earnedMap.has(a.id)).length}/
                    {categoryAchievements.length})
                  </span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {categoryAchievements.map((achievement) => {
                    const earned = earnedMap.get(achievement.id);
                    return (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        earned={!!earned}
                        earnedAt={earned?.earnedAt}
                        showDescription
                        size="sm"
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Show flat list for selected category
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {displayedAchievements.map((achievement) => {
            const earned = earnedMap.get(achievement.id);
            return (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                earned={!!earned}
                earnedAt={earned?.earnedAt}
                showDescription
                size="md"
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {displayedAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted-foreground)]">No achievements in this category</p>
        </div>
      )}
    </div>
  );
}
