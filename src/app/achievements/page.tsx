"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  TrophyCase,
  AchievementStats,
  AchievementProgress,
  CategoryProgress,
} from "@/components/achievements";
import { Card, CardContent } from "@/components/ui/Card";
import { ACHIEVEMENTS, type EarnedAchievement, type AchievementDefinition } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Flame, Trophy, Target } from "lucide-react";

// Mock data for demo mode
const MOCK_EARNED: EarnedAchievement[] = [
  {
    id: "1",
    childId: "demo",
    achievementType: "FIRST_EXCHANGE",
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    childId: "demo",
    achievementType: "SESSIONS_5",
    earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    childId: "demo",
    achievementType: "STREAK_3",
    earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    childId: "demo",
    achievementType: "PHASE_1_COMPLETE",
    earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    childId: "demo",
    achievementType: "EXCHANGES_50",
    earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock progress data
const MOCK_PROGRESS = [
  { achievementId: "SESSIONS_25", currentValue: 18, targetValue: 25 },
  { achievementId: "STREAK_7", currentValue: 5, targetValue: 7 },
  { achievementId: "EXCHANGES_200", currentValue: 87, targetValue: 200 },
  { achievementId: "PHASE_2_COMPLETE", currentValue: 70, targetValue: 100 },
  { achievementId: "CARD_MASTER_10", currentValue: 7, targetValue: 10 },
];

// Category data
const CATEGORY_DATA = [
  { name: "Milestone", icon: "🏆", earned: 2, total: 8 },
  { name: "Streak", icon: "🔥", earned: 1, total: 4 },
  { name: "Effort", icon: "💪", earned: 2, total: 5 },
  { name: "Mastery", icon: "⭐", earned: 0, total: 5 },
  { name: "Special", icon: "🎉", earned: 0, total: 4 },
  { name: "Category", icon: "🏷️", earned: 0, total: 3 },
];

export default function AchievementsPage() {
  const [earnedAchievements, setEarnedAchievements] = useState<EarnedAchievement[]>([]);
  const [streakInfo, setStreakInfo] = useState<{
    current: number;
    longest: number;
    message: string;
    type: "success" | "warning" | "danger" | "neutral";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Get all achievement definitions
  const allAchievements = Object.values(ACHIEVEMENTS) as AchievementDefinition[];

  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured()) {
        // Use mock data in demo mode
        setEarnedAchievements(MOCK_EARNED);
        setStreakInfo({
          current: 3,
          longest: 5,
          message: "3-day streak! Keep it up!",
          type: "success",
        });
        setLoading(false);
        return;
      }

      // In a real app, you'd get the current child ID from context or URL
      // For now, we'll just show demo data
      try {
        // This would be: const childId = getCurrentChildId();
        // const earned = await getChildAchievements(childId);
        // const streak = await getStreakInfo(childId);
        setEarnedAchievements(MOCK_EARNED);
        setStreakInfo({
          current: 3,
          longest: 5,
          message: "3-day streak! Keep it up!",
          type: "success",
        });
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const streakColors = {
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    danger: "text-red-600 bg-red-50 border-red-200",
    neutral: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Achievements</h1>
          <p className="text-[var(--muted-foreground)]">
            Track your progress and celebrate your accomplishments!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Streak Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Current Streak</p>
                  <p className="text-2xl font-bold">{streakInfo?.current || 0} days</p>
                </div>
              </div>
              {streakInfo && (
                <p
                  className={`mt-3 text-sm px-3 py-1.5 rounded-lg border ${
                    streakColors[streakInfo.type]
                  }`}
                >
                  {streakInfo.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Achievements Earned */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Earned</p>
                  <p className="text-2xl font-bold">
                    {earnedAchievements.length}/{allAchievements.length}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                {Math.round((earnedAchievements.length / allAchievements.length) * 100)}% complete
              </p>
            </CardContent>
          </Card>

          {/* Longest Streak */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Best Streak</p>
                  <p className="text-2xl font-bold">{streakInfo?.longest || 0} days</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Personal best
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Stats Summary */}
        <AchievementStats
          totalEarned={earnedAchievements.length}
          totalAvailable={allAchievements.length}
          recentUnlocks={earnedAchievements.slice(0, 5).map((e) => ({
            id: e.id,
            name: ACHIEVEMENTS[e.achievementType]?.name || e.achievementType,
            icon: ACHIEVEMENTS[e.achievementType]?.icon || "🏆",
            earnedAt: e.earnedAt,
          }))}
        />

        {/* Two-column layout for progress and categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* In Progress Achievements */}
          <AchievementProgress
            earnedAchievements={earnedAchievements.map((e) => e.achievementType)}
            progressData={MOCK_PROGRESS}
          />

          {/* Category Progress */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <CategoryProgress categories={CATEGORY_DATA} />
          </div>
        </div>

        {/* Trophy Case */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : (
          <TrophyCase
            allAchievements={allAchievements}
            earnedAchievements={earnedAchievements}
          />
        )}
      </div>
    </DashboardShell>
  );
}
