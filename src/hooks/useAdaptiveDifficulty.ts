"use client";

import { useState, useCallback, useMemo } from 'react';
import {
  AdaptiveState,
  AdaptiveSettings,
  createAdaptiveState,
  updateAdaptiveState,
  getPerformanceSummary,
} from '@/lib/ai/adaptive';

interface UseAdaptiveDifficultyOptions {
  initialDifficulty?: number;
  settings?: Partial<AdaptiveSettings>;
  onDifficultyChange?: (newDifficulty: number, message: string) => void;
}

interface UseAdaptiveDifficultyReturn {
  // Current state
  currentDifficulty: number;
  successRate: number;
  totalTrials: number;
  trend: 'improving' | 'declining' | 'stable';

  // Actions
  recordTrial: (success: boolean, responseTimeMs: number) => {
    difficultyChanged: boolean;
    newDifficulty: number;
    message: string;
  };
  reset: (initialDifficulty?: number) => void;
  setDifficulty: (difficulty: number) => void;

  // Performance
  getPerformance: () => ReturnType<typeof getPerformanceSummary>;
}

const DEFAULT_SETTINGS: AdaptiveSettings = {
  minArraySize: 2,
  maxArraySize: 5,
  currentArraySize: 2,
  targetSuccessRate: 0.80,
  windowSize: 10,
  increaseThreshold: 0.85,
  decreaseThreshold: 0.65,
  minTrialsBeforeAdjust: 5,
};

export function useAdaptiveDifficulty(
  options: UseAdaptiveDifficultyOptions = {}
): UseAdaptiveDifficultyReturn {
  const {
    initialDifficulty = 2,
    settings: userSettings,
    onDifficultyChange,
  } = options;

  const settings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...userSettings }),
    [userSettings]
  );

  const [state, setState] = useState<AdaptiveState>(() =>
    createAdaptiveState(initialDifficulty)
  );

  const recordTrial = useCallback(
    (success: boolean, responseTimeMs: number) => {
      const { newState, difficultyChange } = updateAdaptiveState(
        state,
        {
          success,
          responseTimeMs,
          difficulty: state.currentDifficulty,
        },
        settings
      );

      setState(newState);

      if (difficultyChange.changed && onDifficultyChange) {
        onDifficultyChange(difficultyChange.newDifficulty, difficultyChange.message);
      }

      return {
        difficultyChanged: difficultyChange.changed,
        newDifficulty: difficultyChange.newDifficulty,
        message: difficultyChange.message,
      };
    },
    [state, settings, onDifficultyChange]
  );

  const reset = useCallback(
    (newInitialDifficulty?: number) => {
      setState(createAdaptiveState(newInitialDifficulty ?? initialDifficulty));
    },
    [initialDifficulty]
  );

  const setDifficulty = useCallback((difficulty: number) => {
    setState((prev) => ({
      ...prev,
      currentDifficulty: Math.max(
        settings.minArraySize,
        Math.min(settings.maxArraySize, difficulty)
      ),
    }));
  }, [settings.minArraySize, settings.maxArraySize]);

  const getPerformance = useCallback(
    () => getPerformanceSummary(state, settings.windowSize),
    [state, settings.windowSize]
  );

  const performance = useMemo(() => getPerformance(), [getPerformance]);

  return {
    currentDifficulty: state.currentDifficulty,
    successRate: performance.successRate,
    totalTrials: state.totalTrials,
    trend: performance.trend,
    recordTrial,
    reset,
    setDifficulty,
    getPerformance,
  };
}
