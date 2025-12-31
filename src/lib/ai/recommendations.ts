import type { PECSPhase } from "@/types";

export interface ChildPerformance {
  currentPhase: PECSPhase;
  recentSuccessRate: number; // 0-100
  avgResponseTime: number; // in seconds
  streakDays: number;
  totalSessions: number;
  lastSessionDate: string | null;
  phaseProgress: {
    phase: PECSPhase;
    successRate: number;
    sessionsCompleted: number;
  }[];
  recentCards: {
    cardId: string;
    successRate: number;
    timesUsed: number;
  }[];
  preferredCategories: string[];
  challengingCards: string[];
}

export interface SessionRecommendation {
  id: string;
  type: "phase" | "cards" | "duration" | "difficulty" | "break" | "reinforcement";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionText?: string;
  data?: Record<string, unknown>;
}

export interface SessionPlan {
  recommendedPhase: PECSPhase;
  recommendedDuration: number; // in minutes
  warmUpActivity?: string;
  mainActivities: {
    type: string;
    description: string;
    duration: number;
  }[];
  suggestedCards: string[];
  difficultyLevel: number;
  breakInterval?: number; // minutes between breaks
}

// Generate session recommendations based on performance
export function generateRecommendations(
  performance: ChildPerformance
): SessionRecommendation[] {
  const recommendations: SessionRecommendation[] = [];

  // Check if it's been a while since last session
  if (performance.lastSessionDate) {
    const daysSince = Math.floor(
      (Date.now() - new Date(performance.lastSessionDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSince >= 3) {
      recommendations.push({
        id: "return-practice",
        type: "phase",
        priority: "high",
        title: "Welcome Back!",
        description: `It's been ${daysSince} days since the last session. Start with a warm-up review of mastered skills before continuing.`,
        actionText: "Start Warm-Up",
      });
    }
  }

  // Check streak status
  if (performance.streakDays === 0) {
    recommendations.push({
      id: "start-streak",
      type: "reinforcement",
      priority: "medium",
      title: "Start a New Streak",
      description:
        "Complete a session today to begin building a practice streak!",
      actionText: "Practice Now",
    });
  } else if (performance.streakDays >= 7) {
    recommendations.push({
      id: "streak-milestone",
      type: "reinforcement",
      priority: "low",
      title: `${performance.streakDays}-Day Streak!`,
      description:
        "Amazing consistency! Keep up the daily practice for best results.",
    });
  }

  // Check success rate
  if (performance.recentSuccessRate < 70) {
    recommendations.push({
      id: "lower-difficulty",
      type: "difficulty",
      priority: "high",
      title: "Adjust Difficulty",
      description:
        "Recent success rate is below target. Consider reducing array size or practicing with high-success cards.",
      actionText: "Adjust Settings",
      data: { suggestedArraySize: 2 },
    });
  } else if (performance.recentSuccessRate >= 90) {
    recommendations.push({
      id: "increase-difficulty",
      type: "difficulty",
      priority: "medium",
      title: "Ready for a Challenge",
      description:
        "Excellent performance! Consider increasing difficulty or introducing new cards.",
      actionText: "Level Up",
      data: { suggestedArraySize: 4 },
    });
  }

  // Check response time
  if (performance.avgResponseTime > 8) {
    recommendations.push({
      id: "response-time",
      type: "duration",
      priority: "medium",
      title: "Response Time Practice",
      description:
        "Average response time is longer than optimal. Focus on familiar cards to build fluency.",
    });
  }

  // Check for challenging cards
  if (performance.challengingCards.length > 0) {
    recommendations.push({
      id: "challenging-cards",
      type: "cards",
      priority: "medium",
      title: "Focus on Challenging Cards",
      description: `Some cards need extra practice: ${performance.challengingCards.slice(0, 3).join(", ")}`,
      actionText: "Practice These",
      data: { cards: performance.challengingCards },
    });
  }

  // Check phase progress
  const currentPhaseData = performance.phaseProgress.find(
    (p) => p.phase === performance.currentPhase
  );
  if (currentPhaseData) {
    if (
      currentPhaseData.successRate >= 80 &&
      currentPhaseData.sessionsCompleted >= 5 &&
      performance.currentPhase < 6
    ) {
      recommendations.push({
        id: "phase-advancement",
        type: "phase",
        priority: "high",
        title: "Ready to Advance!",
        description: `Phase ${performance.currentPhase} mastery criteria met. Consider introducing Phase ${performance.currentPhase + 1} concepts.`,
        actionText: `Start Phase ${performance.currentPhase + 1}`,
        data: { nextPhase: performance.currentPhase + 1 },
      });
    }
  }

  // Session duration recommendation
  if (performance.totalSessions < 10) {
    recommendations.push({
      id: "short-sessions",
      type: "duration",
      priority: "low",
      title: "Short Sessions Work Best",
      description:
        "For beginners, 10-15 minute sessions with frequent breaks maintain engagement.",
      data: { recommendedDuration: 10 },
    });
  }

  // Break reminders for long practice
  if (performance.totalSessions >= 20) {
    recommendations.push({
      id: "break-reminder",
      type: "break",
      priority: "low",
      title: "Remember Breaks",
      description:
        "Take a 2-3 minute break every 10 minutes to maintain focus and prevent fatigue.",
      data: { breakInterval: 10 },
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

// Generate a complete session plan
export function generateSessionPlan(
  performance: ChildPerformance
): SessionPlan {
  const isBeginning = performance.totalSessions < 10;
  const isStruggling = performance.recentSuccessRate < 70;
  const isExcelling = performance.recentSuccessRate >= 90;

  // Determine recommended duration
  let recommendedDuration = 15;
  if (isBeginning) recommendedDuration = 10;
  if (performance.totalSessions > 30) recommendedDuration = 20;

  // Determine difficulty level (1-5)
  let difficultyLevel = 2;
  if (isStruggling) difficultyLevel = 1;
  if (isExcelling && performance.totalSessions > 10) difficultyLevel = 3;
  if (isExcelling && performance.totalSessions > 30) difficultyLevel = 4;

  // Build activity plan
  const mainActivities: SessionPlan["mainActivities"] = [];

  // Always start with warm-up using high-success cards
  mainActivities.push({
    type: "warm_up",
    description: "Quick review with familiar, high-success cards",
    duration: 3,
  });

  // Main practice based on current phase
  const mainPracticeDuration = Math.floor(recommendedDuration * 0.6);
  mainActivities.push({
    type: "main_practice",
    description: `Phase ${performance.currentPhase} practice with ${difficultyLevel + 1}-card arrays`,
    duration: mainPracticeDuration,
  });

  // If doing well, add challenge activity
  if (isExcelling && recommendedDuration >= 15) {
    mainActivities.push({
      type: "challenge",
      description:
        performance.currentPhase < 6
          ? `Introduction to Phase ${performance.currentPhase + 1} concepts`
          : "Advanced discrimination with 5-card arrays",
      duration: 3,
    });
  }

  // If struggling, add reinforcement activity
  if (isStruggling) {
    mainActivities.push({
      type: "reinforcement",
      description: "Extra practice with preferred category cards",
      duration: 4,
    });
  }

  // Suggest cards based on performance
  const suggestedCards: string[] = [];

  // Add high-success cards for confidence
  performance.recentCards
    .filter((c) => c.successRate >= 80)
    .slice(0, 3)
    .forEach((c) => suggestedCards.push(c.cardId));

  // Add some challenging cards if not struggling
  if (!isStruggling) {
    performance.recentCards
      .filter((c) => c.successRate < 70 && c.successRate >= 40)
      .slice(0, 2)
      .forEach((c) => suggestedCards.push(c.cardId));
  }

  return {
    recommendedPhase: performance.currentPhase,
    recommendedDuration,
    warmUpActivity: "Review with 3 favorite cards",
    mainActivities,
    suggestedCards,
    difficultyLevel,
    breakInterval: recommendedDuration >= 15 ? 10 : undefined,
  };
}

// Get card recommendations for variety
export function getCardRecommendations(
  performance: ChildPerformance,
  availableCards: { id: string; category: string; label: string }[]
): {
  highSuccess: typeof availableCards;
  needsPractice: typeof availableCards;
  newToTry: typeof availableCards;
} {
  const usedCardIds = new Set(performance.recentCards.map((c) => c.cardId));
  const highSuccessIds = new Set(
    performance.recentCards
      .filter((c) => c.successRate >= 80)
      .map((c) => c.cardId)
  );
  const lowSuccessIds = new Set(
    performance.recentCards
      .filter((c) => c.successRate < 70)
      .map((c) => c.cardId)
  );

  return {
    highSuccess: availableCards.filter((c) => highSuccessIds.has(c.id)),
    needsPractice: availableCards.filter((c) => lowSuccessIds.has(c.id)),
    newToTry: availableCards
      .filter((c) => !usedCardIds.has(c.id))
      .filter((c) => performance.preferredCategories.includes(c.category))
      .slice(0, 5),
  };
}
