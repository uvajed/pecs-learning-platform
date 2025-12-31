import { create } from "zustand";
import type { Child, PECSPhase, SessionActivity } from "@/types";

interface SessionState {
  // Current session data
  isSessionActive: boolean;
  currentChild: Child | null;
  currentPhase: PECSPhase | null;
  sessionStartTime: Date | null;
  activities: SessionActivity[];

  // Database session ID (if persisted)
  dbSessionId: string | null;

  // Session actions
  startSession: (child: Child, phase: PECSPhase, dbSessionId?: string | null) => void;
  endSession: () => SessionSummary | null;
  recordActivity: (activity: Omit<SessionActivity, "id" | "sessionId" | "recordedAt">) => void;

  // Getters
  getSessionData: () => {
    childId: string | null;
    phase: PECSPhase | null;
    dbSessionId: string | null;
    activities: SessionActivity[];
    durationSeconds: number;
  };

  // UI state
  isPaused: boolean;
  togglePause: () => void;
}

export interface SessionSummary {
  duration: number;
  totalActivities: number;
  successRate: number;
  independentRate: number;
  successfulCount: number;
  activities: SessionActivity[];
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  isSessionActive: false,
  currentChild: null,
  currentPhase: null,
  sessionStartTime: null,
  activities: [],
  dbSessionId: null,
  isPaused: false,

  // Actions
  startSession: (child, phase, dbSessionId = null) => {
    set({
      isSessionActive: true,
      currentChild: child,
      currentPhase: phase,
      sessionStartTime: new Date(),
      activities: [],
      dbSessionId,
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
      successfulCount: successfulActivities.length,
      activities: [...state.activities],
    };

    set({
      isSessionActive: false,
      currentChild: null,
      currentPhase: null,
      sessionStartTime: null,
      activities: [],
      dbSessionId: null,
      isPaused: false,
    });

    return summary;
  },

  recordActivity: (activity) => {
    const state = get();
    const newActivity: SessionActivity = {
      ...activity,
      id: crypto.randomUUID(),
      sessionId: state.dbSessionId || "",
      recordedAt: new Date().toISOString(),
    };

    set((prevState) => ({
      activities: [...prevState.activities, newActivity],
    }));
  },

  getSessionData: () => {
    const state = get();
    const durationSeconds = state.sessionStartTime
      ? Math.floor((new Date().getTime() - state.sessionStartTime.getTime()) / 1000)
      : 0;

    return {
      childId: state.currentChild?.id || null,
      phase: state.currentPhase,
      dbSessionId: state.dbSessionId,
      activities: state.activities,
      durationSeconds,
    };
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },
}));
