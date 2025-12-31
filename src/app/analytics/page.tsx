"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import {
  SuccessRateChart,
  SessionActivityChart,
  ResponseTimeChart,
  PhaseProgressChart,
  ActivityCalendar,
} from "@/components/analytics";
import { TrendingUp, Clock, Target, Award, Flame, Calendar } from "lucide-react";

// Generate mock data for the last 30 days
const generateMockData = () => {
  const today = new Date();
  const successRateData = [];
  const sessionData = [];
  const responseTimeData = [];
  const calendarData = [];

  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    const sessions = Math.floor(Math.random() * 4);
    const successRate = sessions > 0 ? 65 + Math.floor(Math.random() * 30) : 0;
    const responseTime = sessions > 0 ? 3 + Math.random() * 4 : 0;

    successRateData.push({ date, successRate, sessions });
    sessionData.push({ date, sessions, duration: sessions * 8 });
    responseTimeData.push({
      date,
      avgResponseTime: responseTime,
      fastResponses: Math.floor(sessions * 0.7),
      totalResponses: sessions * 5,
    });
    calendarData.push({ date, sessions, successRate });
  }

  return { successRateData, sessionData, responseTimeData, calendarData };
};

const mockData = generateMockData();

const phaseProgressData = [
  { phase: 1, status: "completed" as const, progress: 100, sessionsCompleted: 15, successRate: 92 },
  { phase: 2, status: "completed" as const, progress: 100, sessionsCompleted: 12, successRate: 88 },
  { phase: 3, status: "in_progress" as const, progress: 65, sessionsCompleted: 8, successRate: 78 },
  { phase: 4, status: "locked" as const, progress: 0, sessionsCompleted: 0, successRate: 0 },
  { phase: 5, status: "locked" as const, progress: 0, sessionsCompleted: 0, successRate: 0 },
  { phase: 6, status: "locked" as const, progress: 0, sessionsCompleted: 0, successRate: 0 },
];

const stats = [
  { label: "Total Sessions", value: "42", icon: Clock, change: "+8 this week", color: "bg-blue-100 text-blue-600" },
  { label: "Success Rate", value: "78%", icon: Target, change: "+5% from last week", color: "bg-green-100 text-green-600" },
  { label: "Current Streak", value: "5 days", icon: Flame, change: "Best: 12 days", color: "bg-orange-100 text-orange-600" },
  { label: "Cards Mastered", value: "24", icon: Award, change: "+3 this week", color: "bg-purple-100 text-purple-600" },
];

const childProgress = [
  { name: "Alex", phase: 3, progress: 65, recentSessions: 12, accuracy: 82 },
  { name: "Emma", phase: 2, progress: 80, recentSessions: 8, accuracy: 75 },
];

export default function AnalyticsPage() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  return (
    <DashboardShell>
      <PageHeader
        title="Progress & Analytics"
        description="Track learning progress and view detailed statistics"
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Success Rate Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              Success Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SuccessRateChart data={mockData.successRateData} targetRate={80} />
          </CardContent>
        </Card>

        {/* Session Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--primary)]" />
              Daily Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionActivityChart data={mockData.sessionData.slice(-7)} />
          </CardContent>
        </Card>
      </div>

      {/* Activity Calendar and Phase Progress */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Activity Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
              Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityCalendar data={mockData.calendarData} weeks={12} />
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <ResponseTimeChart data={mockData.responseTimeData.slice(-14)} targetTime={5} />
            </div>
          </CardContent>
        </Card>

        {/* Phase Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <PhaseProgressChart data={phaseProgressData} />
          </CardContent>
        </Card>
      </div>

      {/* Child Progress Details */}
      <h2 className="text-xl font-semibold mb-4">Individual Progress</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        {childProgress.map((child) => (
          <Card key={child.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{child.name}&apos;s Progress</span>
                <span className="text-sm font-normal bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded">
                  Phase {child.phase}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Phase {child.phase} Progress</span>
                  <span className="text-sm font-medium">{child.progress}%</span>
                </div>
                <Progress value={child.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-[var(--radius)] bg-[var(--muted)]/50">
                  <p className="text-2xl font-bold">{child.recentSessions}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Sessions this week</p>
                </div>
                <div className="p-4 rounded-[var(--radius)] bg-[var(--muted)]/50">
                  <p className="text-2xl font-bold">{child.accuracy}%</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Accuracy rate</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[var(--muted)]/30"
                    >
                      <div>
                        <p className="font-medium text-sm">Phase {child.phase} Practice</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {i} day{i > 1 ? "s" : ""} ago
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[var(--primary)]">
                        {80 + i * 3}% accuracy
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
