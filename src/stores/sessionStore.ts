import { create } from "zustand";
import type { Child, PECSPhase, SessionActivity, PromptLevel } from "@/types";

interface SessionState {
  // Current session data
  isSessionActive: boolean;
  currentChild: Child | null;
  currentPhase: PECSPhase | null;
  sessionStartTime: Date | null;
  activities: SessionActivity[];

  // Session actions
  startSession: (child: Child, phase: PECSPhase) => void;
  endSession: () => SessionSummary | null;
  recordActivity: (activity: Omit<SessionActivity, "id" | "sessionId" | "recordedAt">) => void;

  // UI state
  isPaused: boolean;
  togglePause: () => void;
}

interface SessionSummary {
  duration: number;
  totalActivities: number;
  successRate: number;
  independentRate: number;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  isSessionActive: false,
  currentChild: null,
  currentPhase: null,
  sessionStartTime: null,
  activities: [],
  isPaused: false,

  // Actions
  startSession: (child, phase) => {
    set({
      isSessionActive: true,
      currentChild: child,
      currentPhase: phase,
      sessionStartTime: new Date(),
      activities: [],
      isPaused: false,
    });
  },

  endSession: () => {
    const state = get();
    if (!state.sessionStartTime) return null;

    const duration = Math.floor(
      (new Date().getTime() - state.sessionStartTime.getTime()) / 1000
    );

    const successfulActivities = state.activities.filter((a) => a.wasSuccessful);
    const independentActivities = state.activities.filter(
      (a) => a.promptLevel === "independent"
    );

    const summary: SessionSummary = {
      duration,
      totalActivities: state.activities.length,
      successRate:
        state.activities.length > 0
          ? Math.round((successfulActivities.length / state.activities.length) * 100)
          : 0,
      independentRate:
        state.activities.length > 0
          ? Math.round((independentActivities.length / state.activities.length) * 100)
          : 0,
    };

    set({
      isSessionActive: false,
      currentChild: null,
      currentPhase: null,
      sessionStartTime: null,
      activities: [],
      isPaused: false,
    });

    return summary;
  },

  recordActivity: (activity) => {
    const newActivity: SessionActivity = {
      ...activity,
      id: crypto.randomUUID(),
      sessionId: "", // Will be set when saving to database
      recordedAt: new Date().toISOString(),
    };

    set((state) => ({
      activities: [...state.activities, newActivity],
    }));
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },
}));
