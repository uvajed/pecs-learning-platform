"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import {
  generateWeeklyProgressReport,
  generatePhaseMasteryReport,
  downloadPdf,
  type ProgressReportData,
  type PhaseMasteryReportData,
} from "@/lib/reports";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import type { PECSPhase } from "@/types";

// Mock data generators
function generateMockWeeklyData(): ProgressReportData {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  return {
    child: {
      id: "1",
      name: "Alex Johnson",
    },
    generatedAt: today.toISOString(),
    reportPeriod: {
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    },
    weeklyMetrics: {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalSessions: 12,
      totalActivities: 156,
      successRate: 84,
      avgSessionDuration: 15,
      daysActive: 5,
      streakDays: 7,
      phaseProgress: [
        {
          phase: 1 as PECSPhase,
          sessionsCompleted: 15,
          totalActivities: 180,
          successfulActivities: 168,
          successRate: 93,
          avgResponseTime: 2.1,
          status: "mastered",
        },
        {
          phase: 2 as PECSPhase,
          sessionsCompleted: 12,
          totalActivities: 144,
          successfulActivities: 126,
          successRate: 88,
          avgResponseTime: 2.8,
          status: "mastered",
        },
        {
          phase: 3 as PECSPhase,
          sessionsCompleted: 8,
          totalActivities: 96,
          successfulActivities: 77,
          successRate: 80,
          avgResponseTime: 3.5,
          status: "in_progress",
        },
        {
          phase: 4 as PECSPhase,
          sessionsCompleted: 0,
          totalActivities: 0,
          successfulActivities: 0,
          successRate: 0,
          avgResponseTime: 0,
          status: "not_started",
        },
        {
          phase: 5 as PECSPhase,
          sessionsCompleted: 0,
          totalActivities: 0,
          successfulActivities: 0,
          successRate: 0,
          avgResponseTime: 0,
          status: "not_started",
        },
        {
          phase: 6 as PECSPhase,
          sessionsCompleted: 0,
          totalActivities: 0,
          successfulActivities: 0,
          successRate: 0,
          avgResponseTime: 0,
          status: "not_started",
        },
      ],
    },
    sessions: [
      { id: "1", date: subDays(today, 0).toISOString(), phase: 3 as PECSPhase, duration: 18, activitiesCompleted: 15, successRate: 87 },
      { id: "2", date: subDays(today, 1).toISOString(), phase: 3 as PECSPhase, duration: 12, activitiesCompleted: 10, successRate: 80 },
      { id: "3", date: subDays(today, 2).toISOString(), phase: 3 as PECSPhase, duration: 15, activitiesCompleted: 12, successRate: 75 },
      { id: "4", date: subDays(today, 3).toISOString(), phase: 2 as PECSPhase, duration: 10, activitiesCompleted: 8, successRate: 100 },
      { id: "5", date: subDays(today, 4).toISOString(), phase: 3 as PECSPhase, duration: 20, activitiesCompleted: 18, successRate: 83 },
      { id: "6", date: subDays(today, 5).toISOString(), phase: 3 as PECSPhase, duration: 14, activitiesCompleted: 11, successRate: 82 },
      { id: "7", date: subDays(today, 6).toISOString(), phase: 2 as PECSPhase, duration: 8, activitiesCompleted: 6, successRate: 100 },
    ],
    achievements: [
      { id: "1", name: "7-Day Streak", earnedAt: subDays(today, 0).toISOString() },
      { id: "2", name: "Phase 2 Master", earnedAt: subDays(today, 3).toISOString() },
      { id: "3", name: "50 Exchanges", earnedAt: subDays(today, 5).toISOString() },
    ],
    recommendations: [
      "Continue practicing Phase 3 with 3-card arrays to build discrimination skills.",
      "Consider increasing session frequency to maintain momentum.",
      "Alex responds well to food-related cards - use these as high-value reinforcers.",
      "Try introducing Phase 4 concepts with simple 2-word sentences once Phase 3 success rate reaches 85%.",
    ],
  };
}

function generateMockPhaseMasteryData(phase: PECSPhase): PhaseMasteryReportData {
  const today = new Date();
  const phaseNames: Record<PECSPhase, string> = {
    1: "How to Communicate",
    2: "Distance and Persistence",
    3: "Picture Discrimination",
    4: "Sentence Structure",
    5: "Responsive Requesting",
    6: "Commenting",
  };

  const phaseSkills: Record<PECSPhase, string[]> = {
    1: ["Picks up picture independently", "Reaches toward communication partner", "Releases picture in partner's hand", "Makes eye contact during exchange"],
    2: ["Travels to communication book", "Travels to partner across room", "Persists when partner is not attending", "Exchanges with multiple partners"],
    3: ["Discriminates between 2 pictures", "Discriminates between 3+ pictures", "Selects correct picture from array", "Identifies preferred vs non-preferred items"],
    4: ["Uses sentence strip", "Places 'I want' starter", "Constructs 2-word sentences", "Points while speaking sentence"],
    5: ["Responds to 'What do you want?'", "Initiates without prompting", "Answers spontaneously", "Uses varied vocabulary"],
    6: ["Comments on environment", "Uses 'I see' appropriately", "Uses 'I hear' appropriately", "Makes spontaneous comments"],
  };

  return {
    child: {
      id: "1",
      name: "Alex Johnson",
    },
    generatedAt: today.toISOString(),
    phase,
    phaseName: phaseNames[phase],
    startDate: subDays(today, 45).toISOString(),
    masteryDate: phase <= 2 ? subDays(today, 5).toISOString() : undefined,
    totalSessions: phase <= 2 ? 15 : 8,
    totalActivities: phase <= 2 ? 180 : 96,
    finalSuccessRate: phase <= 2 ? 92 : 78,
    progressOverTime: Array.from({ length: 8 }, (_, i) => ({
      date: subDays(today, (7 - i) * 5).toISOString(),
      successRate: Math.min(95, 50 + i * 6 + Math.random() * 10),
    })),
    skillsAcquired: phaseSkills[phase].slice(0, phase <= 2 ? 4 : 2),
    notes: phase <= 2
      ? "Alex has demonstrated consistent mastery of all Phase objectives. Ready to progress to next phase with continued reinforcement of current skills."
      : "Alex is making steady progress. Continue with current approach, focusing on discrimination accuracy before increasing array size.",
  };
}

interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

function ReportCard({ title, description, icon, onGenerate, isGenerating }: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
        </div>
      </div>
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full mt-4"
      >
        {isGenerating ? "Generating..." : "Download PDF"}
      </Button>
    </motion.div>
  );
}

export default function ReportsPage() {
  const [generatingReport, setGeneratingReport] = React.useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = React.useState<PECSPhase>(1);

  const handleGenerateWeeklyReport = async () => {
    setGeneratingReport("weekly");
    try {
      // Simulate async data fetch
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = generateMockWeeklyData();
      const doc = generateWeeklyProgressReport(data);
      downloadPdf(doc, `weekly-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGeneratePhaseMasteryReport = async (phase: PECSPhase) => {
    setGeneratingReport(`phase-${phase}`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = generateMockPhaseMasteryData(phase);
      const doc = generatePhaseMasteryReport(data);
      downloadPdf(doc, `phase-${phase}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Generate and download progress reports for IEP meetings, therapist reviews, and personal records
          </p>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportCard
            title="Weekly Progress Report"
            description="Comprehensive overview of the past week including sessions, success rates, and recommendations."
            icon="📊"
            onGenerate={handleGenerateWeeklyReport}
            isGenerating={generatingReport === "weekly"}
          />

          <ReportCard
            title="Monthly Summary"
            description="Month-over-month progress analysis with trend graphs and milestone tracking."
            icon="📈"
            onGenerate={() => alert("Coming soon!")}
            isGenerating={false}
          />

          <ReportCard
            title="IEP Progress Report"
            description="Formal documentation suitable for IEP meetings with goal tracking and data."
            icon="📋"
            onGenerate={() => alert("Coming soon!")}
            isGenerating={false}
          />
        </div>

        {/* Phase Mastery Reports */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Phase Mastery Reports</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Detailed reports for each PECS phase showing progress, skills acquired, and readiness for advancement.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {([1, 2, 3, 4, 5, 6] as PECSPhase[]).map((phase) => {
              const isCompleted = phase <= 2;
              const isInProgress = phase === 3;

              return (
                <motion.button
                  key={phase}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: phase * 0.05 }}
                  onClick={() => handleGeneratePhaseMasteryReport(phase)}
                  disabled={generatingReport === `phase-${phase}`}
                  className={`
                    relative p-4 rounded-[var(--radius-lg)] border-2 text-center transition-all
                    ${isCompleted ? "bg-emerald-50 border-emerald-300 hover:border-emerald-400" : ""}
                    ${isInProgress ? "bg-[var(--primary)]/10 border-[var(--primary)] hover:border-[var(--primary)]" : ""}
                    ${!isCompleted && !isInProgress ? "bg-[var(--muted)] border-[var(--border)] opacity-60" : ""}
                    hover:shadow-md
                  `}
                >
                  <div className="text-2xl mb-2">
                    {isCompleted ? "✅" : isInProgress ? "📝" : "🔒"}
                  </div>
                  <div className="font-semibold">Phase {phase}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    {isCompleted ? "Mastered" : isInProgress ? "In Progress" : "Locked"}
                  </div>

                  {generatingReport === `phase-${phase}` && (
                    <div className="absolute inset-0 bg-white/80 rounded-[var(--radius-lg)] flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
          <h2 className="text-xl font-semibold mb-4">Recently Generated</h2>
          <div className="space-y-3">
            {[
              { name: "Weekly Progress Report", date: "Dec 28, 2025", size: "245 KB" },
              { name: "Phase 2 Mastery Report", date: "Dec 25, 2025", size: "189 KB" },
              { name: "Monthly Summary - November", date: "Dec 1, 2025", size: "412 KB" },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--muted-foreground)]">{report.size}</span>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-sky-50 border border-sky-200 rounded-[var(--radius-lg)] p-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-sky-900">Tips for IEP Meetings</h3>
              <p className="text-sm text-sky-700 mt-1">
                Generate a Weekly Progress Report before each IEP meeting to show concrete data on your child's communication development.
                The Phase Mastery Reports provide detailed breakdowns that align with PECS training objectives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
