"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProgressJourney, StarCollection, ProgressCard, WeeklyGoal } from "@/components/progress";
import { StreakDisplay, StreakReminder, StreakCalendar } from "@/components/streaks";
import { subDays, format } from "date-fns";
import type { PECSPhase } from "@/types";
import type { StreakInfo } from "@/lib/gamification/streaks";

// Mock data - in real app, fetch from Supabase
const mockPhaseProgress = [
  { phase: 1 as PECSPhase, status: "completed" as const, progress: 100, sessionsCompleted: 15, successRate: 92 },
  { phase: 2 as PECSPhase, status: "completed" as const, progress: 100, sessionsCompleted: 12, successRate: 88 },
  { phase: 3 as PECSPhase, status: "in_progress" as const, progress: 65, sessionsCompleted: 8, successRate: 78 },
  { phase: 4 as PECSPhase, status: "locked" as const, progress: 0, sessionsCompleted: 0, successRate: 0 },
  { phase: 5 as PECSPhase, status: "locked" as const, progress: 0, sessionsCompleted: 0, successRate: 0 },
  { phase: 6 as PECSPhase, status: "locked" as const, progress: 0, sessionsCompleted: 0, successRate: 0 },
];

const mockStreak: StreakInfo = {
  currentStreak: 7,
  longestStreak: 12,
  lastActivityDate: format(new Date(), "yyyy-MM-dd"),
  daysUntilStreakLoss: 1,
  statusMessage: "One week strong!",
};

// Generate mock active dates for calendar
const generateMockActiveDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();

  // Add dates for current streak
  for (let i = 0; i < mockStreak.currentStreak; i++) {
    dates.push(subDays(today, i));
  }

  // Add some random dates from earlier
  dates.push(subDays(today, 15));
  dates.push(subDays(today, 16));
  dates.push(subDays(today, 17));
  dates.push(subDays(today, 20));
  dates.push(subDays(today, 25));

  return dates;
};

export default function ProgressPage() {
  const activeDates = React.useMemo(() => generateMockActiveDates(), []);

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Streak reminder banner */}
        <StreakReminder
          streak={mockStreak}
          onPractice={() => window.location.href = "/practice"}
        />

        {/* Quick stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProgressCard
            title="Current Streak"
            value={mockStreak.currentStreak}
            subtitle="days"
            icon="🔥"
            trend={{ value: 15, label: "vs last week", direction: "up" }}
            color="primary"
          />
          <ProgressCard
            title="Total Sessions"
            value="35"
            icon="📚"
            progress={{ current: 35, max: 50, label: "Goal: 50 sessions" }}
            color="info"
          />
          <ProgressCard
            title="Success Rate"
            value="86%"
            icon="🎯"
            trend={{ value: 4, label: "this month", direction: "up" }}
            color="success"
          />
          <ProgressCard
            title="Stars Earned"
            value="142"
            icon="⭐"
            trend={{ value: 23, label: "this week", direction: "up" }}
            color="warning"
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Progress journey */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phase journey */}
            <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-6 border border-[var(--border)]">
              <h2 className="text-xl font-semibold mb-4">PECS Journey</h2>
              <ProgressJourney phases={mockPhaseProgress} />
            </div>

            {/* Weekly goal */}
            <WeeklyGoal
              sessionsThisWeek={5}
              goalSessions={7}
              daysRemaining={3}
            />
          </div>

          {/* Right column - Streak and stars */}
          <div className="space-y-6">
            {/* Streak display */}
            <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-4 border border-[var(--border)]">
              <h3 className="font-semibold mb-3">Practice Streak</h3>
              <StreakDisplay streak={mockStreak} size="large" showDetails />
            </div>

            {/* Star collection */}
            <StarCollection
              totalStars={142}
              todayStars={12}
              size="medium"
            />

            {/* Activity calendar */}
            <StreakCalendar activeDates={activeDates} />
          </div>
        </div>

        {/* Recent activity section */}
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-6 border border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { date: "Today", activity: "Phase 3 Practice", stars: 8, success: "85%" },
              { date: "Yesterday", activity: "Phase 3 Practice", stars: 6, success: "75%" },
              { date: "2 days ago", activity: "Phase 2 Review", stars: 10, success: "100%" },
              { date: "3 days ago", activity: "Phase 3 Practice", stars: 7, success: "80%" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-medium">{item.activity}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-[var(--primary)]">{item.success}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">success</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <span className="text-sm font-medium">+{item.stars}</span>
                    <span>⭐</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
