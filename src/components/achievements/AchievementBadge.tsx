"use client";

import { cn } from "@/lib/utils";
import type { AchievementDefinition } from "@/types";

interface AchievementBadgeProps {
  achievement: AchievementDefinition;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export function AchievementBadge({
  achievement,
  earned = false,
  earnedAt,
  size = "md",
  showDescription = false,
  className,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  const categoryColors: Record<string, string> = {
    milestone: "from-yellow-400 to-amber-500",
    streak: "from-orange-400 to-red-500",
    effort: "from-blue-400 to-indigo-500",
    mastery: "from-purple-400 to-pink-500",
    special: "from-emerald-400 to-teal-500",
    category: "from-sky-400 to-cyan-500",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all",
          sizeClasses[size],
          earned
            ? `bg-gradient-to-br ${categoryColors[achievement.category]} shadow-lg`
            : "bg-gray-200 grayscale opacity-50"
        )}
      >
        <span className={cn(earned ? "" : "opacity-50")}>{achievement.icon}</span>
        {earned && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <p
          className={cn(
            "font-semibold text-sm",
            earned ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
          )}
        >
          {achievement.name}
        </p>
        {showDescription && (
          <p className="text-xs text-[var(--muted-foreground)] max-w-[120px]">
            {achievement.description}
          </p>
        )}
        {earnedAt && (
          <p className="text-xs text-[var(--muted-foreground)]">
            {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
