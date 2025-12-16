"use client";

import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { TrendingUp, Clock, Target, Award } from "lucide-react";


const stats = [
  { label: "Total Sessions", value: "42", icon: Clock, change: "+8 this week" },
  { label: "Success Rate", value: "78%", icon: Target, change: "+5% from last week" },
  { label: "Cards Mastered", value: "24", icon: Award, change: "+3 this week" },
  { label: "Practice Time", value: "12h", icon: TrendingUp, change: "2h this week" },
];

const childProgress = [
  { name: "Alex", phase: 2, progress: 65, recentSessions: 12, accuracy: 82 },
  { name: "Emma", phase: 3, progress: 40, recentSessions: 8, accuracy: 75 },
];

export default function AnalyticsPage() {
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
                  <p className="text-xs text-[var(--primary)] mt-1">{stat.change}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Child Progress Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {childProgress.map((child) => (
          <Card key={child.name}>
            <CardHeader>
              <CardTitle>{child.name}'s Progress</CardTitle>
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
