/**
 * Engagement Prediction System
 *
 * Analyzes patterns to predict when a child might lose focus
 * and suggests optimal breaks and activity changes.
 */

export interface EngagementMetrics {
  responseTimeMs: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  timeInSessionMs: number;
  activitiesCompleted: number;
  promptLevelChanges: number;
}

export interface EngagementPrediction {
  level: "high" | "medium" | "low" | "critical";
  score: number; // 0-100
  confidence: number; // 0-1
  suggestedAction: EngagementAction;
  reasoning: string;
}

export interface EngagementAction {
  type: "continue" | "change_activity" | "take_break" | "end_session" | "simplify";
  message: string;
  priority: "low" | "medium" | "high";
  breakDurationMs?: number;
}

interface EngagementHistory {
  timestamp: number;
  score: number;
  action: string;
}

// Baseline metrics (can be personalized per child)
const DEFAULT_BASELINE = {
  avgResponseTimeMs: 3000,
  optimalSessionDurationMs: 15 * 60 * 1000, // 15 minutes
  maxActivitiesPerSession: 20,
  responseTimeThresholdSlow: 2.0, // 2x slower than average
  responseTimeThresholdFast: 0.5, // 2x faster than average
};

export class EngagementPredictor {
  private baseline: typeof DEFAULT_BASELINE;
  private history: EngagementHistory[] = [];
  private recentMetrics: EngagementMetrics[] = [];

  constructor(customBaseline?: Partial<typeof DEFAULT_BASELINE>) {
    this.baseline = { ...DEFAULT_BASELINE, ...customBaseline };
  }

  /**
   * Predict current engagement level based on metrics
   */
  predict(metrics: EngagementMetrics): EngagementPrediction {
    const scores = this.calculateScores(metrics);
    const overallScore = this.calculateOverallScore(scores);
    const level = this.scoreToLevel(overallScore);
    const action = this.determineAction(level, scores, metrics);
    const confidence = this.calculateConfidence(metrics);

    // Store in history
    this.history.push({
      timestamp: Date.now(),
      score: overallScore,
      action: action.type,
    });

    // Keep recent metrics for trend analysis
    this.recentMetrics.push(metrics);
    if (this.recentMetrics.length > 10) {
      this.recentMetrics.shift();
    }

    return {
      level,
      score: overallScore,
      confidence,
      suggestedAction: action,
      reasoning: this.generateReasoning(scores, level),
    };
  }

  private calculateScores(metrics: EngagementMetrics): Record<string, number> {
    const {
      responseTimeMs,
      consecutiveSuccesses,
      consecutiveFailures,
      timeInSessionMs,
      activitiesCompleted,
    } = metrics;

    // Response time score (faster = more engaged)
    const responseRatio = responseTimeMs / this.baseline.avgResponseTimeMs;
    const responseScore = Math.max(0, Math.min(100, 100 - (responseRatio - 1) * 30));

    // Success/failure pattern score
    const successScore = Math.min(100, 50 + consecutiveSuccesses * 10 - consecutiveFailures * 15);

    // Fatigue score (based on session duration)
    const sessionProgress = timeInSessionMs / this.baseline.optimalSessionDurationMs;
    const fatigueScore = sessionProgress < 0.7
      ? 100
      : sessionProgress < 1.0
        ? 100 - (sessionProgress - 0.7) * 100
        : Math.max(20, 70 - (sessionProgress - 1.0) * 50);

    // Activity volume score
    const activityRatio = activitiesCompleted / this.baseline.maxActivitiesPerSession;
    const volumeScore = activityRatio < 0.8
      ? 100
      : Math.max(30, 100 - (activityRatio - 0.8) * 200);

    // Trend score (are things getting better or worse?)
    const trendScore = this.calculateTrendScore();

    return {
      responseScore,
      successScore,
      fatigueScore,
      volumeScore,
      trendScore,
    };
  }

  private calculateTrendScore(): number {
    if (this.recentMetrics.length < 3) return 70; // Neutral default

    // Compare recent response times
    const recentTimes = this.recentMetrics.slice(-5).map(m => m.responseTimeMs);
    const firstHalf = recentTimes.slice(0, Math.floor(recentTimes.length / 2));
    const secondHalf = recentTimes.slice(Math.floor(recentTimes.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    // If response times are increasing, engagement is dropping
    const change = (secondAvg - firstAvg) / firstAvg;

    if (change < -0.1) return 90; // Getting faster = more engaged
    if (change < 0) return 80;
    if (change < 0.1) return 70;
    if (change < 0.2) return 50;
    return 30; // Slowing down significantly
  }

  private calculateOverallScore(scores: Record<string, number>): number {
    const weights = {
      responseScore: 0.25,
      successScore: 0.25,
      fatigueScore: 0.20,
      volumeScore: 0.15,
      trendScore: 0.15,
    };

    let total = 0;
    let weightSum = 0;

    for (const [key, weight] of Object.entries(weights)) {
      if (scores[key] !== undefined) {
        total += scores[key] * weight;
        weightSum += weight;
      }
    }

    return Math.round(total / weightSum);
  }

  private scoreToLevel(score: number): EngagementPrediction["level"] {
    if (score >= 70) return "high";
    if (score >= 50) return "medium";
    if (score >= 30) return "low";
    return "critical";
  }

  private determineAction(
    level: EngagementPrediction["level"],
    scores: Record<string, number>,
    metrics: EngagementMetrics
  ): EngagementAction {
    switch (level) {
      case "high":
        return {
          type: "continue",
          message: "Great engagement! Keep going.",
          priority: "low",
        };

      case "medium":
        if (scores.fatigueScore < 50) {
          return {
            type: "take_break",
            message: "Time for a short break to recharge!",
            priority: "medium",
            breakDurationMs: 2 * 60 * 1000, // 2 minute break
          };
        }
        if (scores.successScore < 50) {
          return {
            type: "simplify",
            message: "Let's try something easier to build confidence.",
            priority: "medium",
          };
        }
        return {
          type: "change_activity",
          message: "Let's try a different type of activity!",
          priority: "low",
        };

      case "low":
        if (metrics.consecutiveFailures >= 3) {
          return {
            type: "simplify",
            message: "Let's practice with familiar cards for a confidence boost.",
            priority: "high",
          };
        }
        if (metrics.timeInSessionMs > this.baseline.optimalSessionDurationMs * 0.8) {
          return {
            type: "take_break",
            message: "You've worked so hard! Let's take a break.",
            priority: "high",
            breakDurationMs: 5 * 60 * 1000, // 5 minute break
          };
        }
        return {
          type: "change_activity",
          message: "Time for something new and exciting!",
          priority: "high",
        };

      case "critical":
        if (metrics.activitiesCompleted >= 5) {
          return {
            type: "end_session",
            message: "Great job today! Let's finish on a high note.",
            priority: "high",
          };
        }
        return {
          type: "take_break",
          message: "Let's take a break. You're doing amazing!",
          priority: "high",
          breakDurationMs: 10 * 60 * 1000, // 10 minute break
        };
    }
  }

  private calculateConfidence(metrics: EngagementMetrics): number {
    // More data = more confidence
    const dataPoints = this.recentMetrics.length;
    const baseConfidence = Math.min(0.9, 0.4 + dataPoints * 0.05);

    // Adjust based on consistency
    if (this.recentMetrics.length >= 3) {
      const scores = this.recentMetrics.map(m =>
        this.calculateOverallScore(this.calculateScores(m))
      );
      const variance = this.calculateVariance(scores);
      const consistencyBonus = variance < 100 ? 0.1 : variance < 200 ? 0.05 : 0;
      return Math.min(0.95, baseConfidence + consistencyBonus);
    }

    return baseConfidence;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private generateReasoning(scores: Record<string, number>, level: string): string {
    const issues: string[] = [];

    if (scores.responseScore < 50) {
      issues.push("response times are increasing");
    }
    if (scores.successScore < 50) {
      issues.push("difficulty level may be too high");
    }
    if (scores.fatigueScore < 50) {
      issues.push("session duration is getting long");
    }
    if (scores.trendScore < 50) {
      issues.push("engagement is trending downward");
    }

    if (issues.length === 0) {
      return "All engagement indicators look good!";
    }

    return `Engagement is ${level} because: ${issues.join(", ")}.`;
  }

  /**
   * Get personalized baseline recommendations based on history
   */
  getPersonalizedBaseline(): typeof DEFAULT_BASELINE {
    if (this.recentMetrics.length < 5) {
      return this.baseline;
    }

    // Calculate average response time from recent successful interactions
    const avgResponseTime = this.recentMetrics
      .filter(m => m.consecutiveFailures === 0)
      .map(m => m.responseTimeMs)
      .reduce((a, b) => a + b, 0) / this.recentMetrics.length;

    return {
      ...this.baseline,
      avgResponseTimeMs: avgResponseTime || this.baseline.avgResponseTimeMs,
    };
  }

  /**
   * Reset for new session
   */
  reset(): void {
    this.recentMetrics = [];
  }
}

// Singleton instance
let predictorInstance: EngagementPredictor | null = null;

export function getEngagementPredictor(): EngagementPredictor {
  if (!predictorInstance) {
    predictorInstance = new EngagementPredictor();
  }
  return predictorInstance;
}

export function resetEngagementPredictor(): void {
  predictorInstance?.reset();
}
