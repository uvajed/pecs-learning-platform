import type { PECSPhase } from "@/types";

export interface ReportChild {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface PhaseMetrics {
  phase: PECSPhase;
  sessionsCompleted: number;
  totalActivities: number;
  successfulActivities: number;
  successRate: number;
  avgResponseTime: number; // in seconds
  status: "not_started" | "in_progress" | "mastered";
}

export interface WeeklyMetrics {
  weekStart: string;
  weekEnd: string;
  totalSessions: number;
  totalActivities: number;
  successRate: number;
  avgSessionDuration: number; // in minutes
  daysActive: number;
  streakDays: number;
  phaseProgress: PhaseMetrics[];
}

export interface SessionDetail {
  id: string;
  date: string;
  phase: PECSPhase;
  duration: number; // in minutes
  activitiesCompleted: number;
  successRate: number;
  notes?: string;
}

export interface ProgressReportData {
  child: ReportChild;
  generatedAt: string;
  reportPeriod: {
    start: string;
    end: string;
  };
  weeklyMetrics: WeeklyMetrics;
  sessions: SessionDetail[];
  achievements: {
    id: string;
    name: string;
    earnedAt: string;
  }[];
  recommendations: string[];
}

export interface PhaseMasteryReportData {
  child: ReportChild;
  generatedAt: string;
  phase: PECSPhase;
  phaseName: string;
  startDate: string;
  masteryDate?: string;
  totalSessions: number;
  totalActivities: number;
  finalSuccessRate: number;
  progressOverTime: {
    date: string;
    successRate: number;
  }[];
  skillsAcquired: string[];
  notes: string;
}

export type ReportType = "weekly_progress" | "phase_mastery" | "therapist_summary";
