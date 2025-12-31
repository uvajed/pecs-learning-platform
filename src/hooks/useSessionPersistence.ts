"use client";

import { useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  createSession,
  endSession as endDBSession,
  recordActivity,
  recordActivities,
} from '@/lib/supabase/sessions';
import type { Child, PECSPhase, SessionActivity } from '@/types';

interface UseSessionPersistenceReturn {
  startPersistentSession: (child: Child, phase: PECSPhase) => Promise<string | null>;
  endPersistentSession: (
    sessionId: string,
    summary: {
      durationSeconds: number;
      successfulExchanges: number;
      totalExchanges: number;
      activities: SessionActivity[];
    }
  ) => Promise<boolean>;
  recordPersistentActivity: (
    sessionId: string,
    activity: Omit<SessionActivity, 'id' | 'sessionId' | 'recordedAt'>
  ) => Promise<boolean>;
  isConfigured: boolean;
}

export function useSessionPersistence(): UseSessionPersistenceReturn {
  const { user, isGuest } = useAuth();
  const isConfigured = isSupabaseConfigured() && !isGuest;

  // Track pending activities for batch saving
  const pendingActivities = useRef<Map<string, Array<Omit<SessionActivity, 'id' | 'sessionId' | 'recordedAt'>>>>(new Map());

  const startPersistentSession = useCallback(async (
    child: Child,
    phase: PECSPhase
  ): Promise<string | null> => {
    if (!isConfigured) return null;

    const session = await createSession({
      childId: child.id,
      phase,
      facilitatorId: user?.id,
    });

    if (session) {
      pendingActivities.current.set(session.id, []);
    }

    return session?.id ?? null;
  }, [isConfigured, user?.id]);

  const recordPersistentActivity = useCallback(async (
    sessionId: string,
    activity: Omit<SessionActivity, 'id' | 'sessionId' | 'recordedAt'>
  ): Promise<boolean> => {
    if (!isConfigured || !sessionId) return false;

    // Add to pending activities for this session
    const pending = pendingActivities.current.get(sessionId) || [];
    pending.push(activity);
    pendingActivities.current.set(sessionId, pending);

    // Record immediately for real-time tracking
    const result = await recordActivity(sessionId, activity);
    return result !== null;
  }, [isConfigured]);

  const endPersistentSession = useCallback(async (
    sessionId: string,
    summary: {
      durationSeconds: number;
      successfulExchanges: number;
      totalExchanges: number;
      activities: SessionActivity[];
    }
  ): Promise<boolean> => {
    if (!isConfigured || !sessionId) return false;

    // Get any pending activities that weren't saved yet
    const pending = pendingActivities.current.get(sessionId) || [];

    // If we have unsaved activities, batch save them
    if (pending.length > 0 && summary.activities.length > pending.length) {
      const unsavedActivities = summary.activities.slice(-pending.length);
      await recordActivities(
        sessionId,
        unsavedActivities.map(a => ({
          activityType: a.activityType,
          cardId: a.cardId,
          cardsInArray: a.cardsInArray,
          promptLevel: a.promptLevel,
          responseTimeMs: a.responseTimeMs,
          wasSuccessful: a.wasSuccessful,
          reinforcementGiven: a.reinforcementGiven,
        }))
      );
    }

    // Clear pending activities
    pendingActivities.current.delete(sessionId);

    // End the session
    const result = await endDBSession(sessionId, {
      durationSeconds: summary.durationSeconds,
      successfulExchanges: summary.successfulExchanges,
      totalExchanges: summary.totalExchanges,
      metrics: {
        successRate: summary.totalExchanges > 0
          ? Math.round((summary.successfulExchanges / summary.totalExchanges) * 100)
          : 0,
      },
    });

    return result !== null;
  }, [isConfigured]);

  return {
    startPersistentSession,
    endPersistentSession,
    recordPersistentActivity,
    isConfigured,
  };
}
