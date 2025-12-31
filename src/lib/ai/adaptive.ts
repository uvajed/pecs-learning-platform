/**
 * Adaptive Difficulty System
 *
 * Automatically adjusts difficulty based on child's performance to maintain
 * optimal challenge level - not too easy, not too frustrating.
 *
 * Key concepts:
 * - Target success rate: 75-85% (zone of proximal development)
 * - Increase difficulty when success rate > 85% over N trials
 * - Decrease difficulty when success rate < 65% over N trials
 * - Consider response time as secondary factor
 */

export interface AdaptiveSettings {
  // Phase 3 specific
  minArraySize: 2;
  maxArraySize: 5;
  currentArraySize: 2 | 3 | 4 | 5;

  // General settings
  targetSuccessRate: number; // 0.75 - 0.85
  windowSize: number; // Number of trials to consider
  increaseThreshold: number; // Success rate above this = increase difficulty
  decreaseThreshold: number; // Success rate below this = decrease difficulty
  minTrialsBeforeAdjust: number;
}

export interface TrialResult {
  success: boolean;
  responseTimeMs: number;
  difficulty: number; // Current difficulty level (e.g., array size)
  timestamp: number;
}

export interface AdaptiveState {
  trialHistory: TrialResult[];
  currentDifficulty: number;
  lastAdjustment: number | null;
  totalTrials: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
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

/**
 * Calculate success rate over the last N trials
 */
export function calculateSuccessRate(
  trials: TrialResult[],
  windowSize: number = 10
): number {
  if (trials.length === 0) return 0;

  const recentTrials = trials.slice(-windowSize);
  const successCount = recentTrials.filter((t) => t.success).length;

  return successCount / recentTrials.length;
}

/**
 * Calculate average response time over recent trials
 */
export function calculateAvgResponseTime(
  trials: TrialResult[],
  windowSize: number = 10
): number {
  if (trials.length === 0) return 0;

  const recentTrials = trials.slice(-windowSize);
  const totalTime = recentTrials.reduce((sum, t) => sum + t.responseTimeMs, 0);

  return totalTime / recentTrials.length;
}

/**
 * Determine if difficulty should be adjusted
 */
export function shouldAdjustDifficulty(
  state: AdaptiveState,
  settings: AdaptiveSettings = DEFAULT_SETTINGS
): { adjust: boolean; direction: 'increase' | 'decrease' | 'none'; reason: string } {
  const { trialHistory, currentDifficulty, lastAdjustment, totalTrials } = state;
  const { windowSize, increaseThreshold, decreaseThreshold, minTrialsBeforeAdjust, minArraySize, maxArraySize } = settings;

  // Need minimum trials before adjusting
  if (totalTrials < minTrialsBeforeAdjust) {
    return { adjust: false, direction: 'none', reason: 'Not enough trials yet' };
  }

  // Don't adjust too frequently
  const trialsSinceLastAdjust = lastAdjustment ? totalTrials - lastAdjustment : totalTrials;
  if (trialsSinceLastAdjust < minTrialsBeforeAdjust) {
    return { adjust: false, direction: 'none', reason: 'Too soon since last adjustment' };
  }

  const successRate = calculateSuccessRate(trialHistory, windowSize);

  // Check for increase (doing very well)
  if (successRate >= increaseThreshold && currentDifficulty < maxArraySize) {
    // Also check consecutive correct for confidence
    if (state.consecutiveCorrect >= 3) {
      return {
        adjust: true,
        direction: 'increase',
        reason: `Great job! Success rate is ${Math.round(successRate * 100)}%`,
      };
    }
  }

  // Check for decrease (struggling)
  if (successRate <= decreaseThreshold && currentDifficulty > minArraySize) {
    // Also check consecutive incorrect for immediate feedback
    if (state.consecutiveIncorrect >= 3 || successRate <= 0.5) {
      return {
        adjust: true,
        direction: 'decrease',
        reason: `Let's make it a bit easier`,
      };
    }
  }

  return { adjust: false, direction: 'none', reason: 'Difficulty is appropriate' };
}

/**
 * Get the new difficulty level
 */
export function getNewDifficulty(
  currentDifficulty: number,
  direction: 'increase' | 'decrease',
  settings: AdaptiveSettings = DEFAULT_SETTINGS
): number {
  const { minArraySize, maxArraySize } = settings;

  if (direction === 'increase') {
    return Math.min(currentDifficulty + 1, maxArraySize);
  } else {
    return Math.max(currentDifficulty - 1, minArraySize);
  }
}

/**
 * Create initial adaptive state
 */
export function createAdaptiveState(initialDifficulty: number = 2): AdaptiveState {
  return {
    trialHistory: [],
    currentDifficulty: initialDifficulty,
    lastAdjustment: null,
    totalTrials: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
  };
}

/**
 * Update state after a trial
 */
export function updateAdaptiveState(
  state: AdaptiveState,
  result: Omit<TrialResult, 'timestamp'>,
  settings: AdaptiveSettings = DEFAULT_SETTINGS
): { newState: AdaptiveState; difficultyChange: { changed: boolean; newDifficulty: number; message: string } } {
  const trial: TrialResult = {
    ...result,
    timestamp: Date.now(),
  };

  // Update trial history
  const newTrialHistory = [...state.trialHistory, trial];

  // Keep only recent history to prevent memory bloat
  const maxHistorySize = settings.windowSize * 3;
  const trimmedHistory = newTrialHistory.slice(-maxHistorySize);

  // Update consecutive counts
  const consecutiveCorrect = result.success
    ? state.consecutiveCorrect + 1
    : 0;
  const consecutiveIncorrect = result.success
    ? 0
    : state.consecutiveIncorrect + 1;

  let newState: AdaptiveState = {
    ...state,
    trialHistory: trimmedHistory,
    totalTrials: state.totalTrials + 1,
    consecutiveCorrect,
    consecutiveIncorrect,
  };

  // Check if we should adjust difficulty
  const adjustment = shouldAdjustDifficulty(newState, settings);

  if (adjustment.adjust && adjustment.direction !== 'none') {
    const newDifficulty = getNewDifficulty(
      state.currentDifficulty,
      adjustment.direction,
      settings
    );

    newState = {
      ...newState,
      currentDifficulty: newDifficulty,
      lastAdjustment: newState.totalTrials,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
    };

    return {
      newState,
      difficultyChange: {
        changed: true,
        newDifficulty,
        message: adjustment.reason,
      },
    };
  }

  return {
    newState,
    difficultyChange: {
      changed: false,
      newDifficulty: state.currentDifficulty,
      message: '',
    },
  };
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(state: AdaptiveState, windowSize: number = 10): {
  successRate: number;
  avgResponseTime: number;
  currentDifficulty: number;
  totalTrials: number;
  trend: 'improving' | 'declining' | 'stable';
} {
  const successRate = calculateSuccessRate(state.trialHistory, windowSize);
  const avgResponseTime = calculateAvgResponseTime(state.trialHistory, windowSize);

  // Calculate trend by comparing recent to older trials
  const recentRate = calculateSuccessRate(state.trialHistory, Math.ceil(windowSize / 2));
  const olderTrials = state.trialHistory.slice(-windowSize, -Math.ceil(windowSize / 2));
  const olderRate = olderTrials.length > 0
    ? olderTrials.filter(t => t.success).length / olderTrials.length
    : successRate;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentRate - olderRate > 0.1) trend = 'improving';
  if (olderRate - recentRate > 0.1) trend = 'declining';

  return {
    successRate,
    avgResponseTime,
    currentDifficulty: state.currentDifficulty,
    totalTrials: state.totalTrials,
    trend,
  };
}
