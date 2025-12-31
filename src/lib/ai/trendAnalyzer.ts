/**
 * Performance Trend Analyzer
 *
 * Analyzes historical data to identify trends, predict future performance,
 * and provide insights for parents and therapists.
 */

export interface PerformanceDataPoint {
  date: Date;
  successRate: number;
  avgResponseTimeMs: number;
  phase: number;
  promptLevel: string;
  activitiesCompleted: number;
}

export interface TrendAnalysis {
  direction: "improving" | "stable" | "declining";
  strength: "strong" | "moderate" | "weak";
  confidence: number;
  rateOfChange: number; // percentage change per week
  insights: string[];
}

export interface PhasePrediction {
  currentPhase: number;
  predictedNextPhaseDate: Date | null;
  daysToNextPhase: number | null;
  confidence: number;
  factors: string[];
}

export interface SkillBreakdown {
  category: string;
  level: "mastered" | "developing" | "emerging" | "not_started";
  progress: number; // 0-100
  recentTrend: "up" | "stable" | "down";
  recommendations: string[];
}

export interface ComprehensiveAnalysis {
  overallTrend: TrendAnalysis;
  phasePrediction: PhasePrediction;
  skillBreakdown: SkillBreakdown[];
  weeklyComparison: {
    thisWeek: { sessions: number; successRate: number; minutes: number };
    lastWeek: { sessions: number; successRate: number; minutes: number };
    change: { sessions: number; successRate: number; minutes: number };
  };
  recommendations: string[];
}

export class TrendAnalyzer {
  private dataPoints: PerformanceDataPoint[] = [];

  constructor(data: PerformanceDataPoint[] = []) {
    this.dataPoints = data.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  addDataPoint(point: PerformanceDataPoint): void {
    this.dataPoints.push(point);
    this.dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Analyze overall performance trend
   */
  analyzeTrend(metric: "successRate" | "responseTime" | "activities" = "successRate"): TrendAnalysis {
    if (this.dataPoints.length < 5) {
      return {
        direction: "stable",
        strength: "weak",
        confidence: 0.2,
        rateOfChange: 0,
        insights: ["Not enough data yet to determine trends. Keep practicing!"],
      };
    }

    // Get values based on metric
    const values = this.dataPoints.map(d => {
      switch (metric) {
        case "successRate": return d.successRate;
        case "responseTime": return d.avgResponseTimeMs;
        case "activities": return d.activitiesCompleted;
      }
    });

    // Calculate linear regression
    const { slope, rSquared } = this.linearRegression(values);

    // Normalize slope to weekly change
    const daysSpan = (this.dataPoints[this.dataPoints.length - 1].date.getTime() -
      this.dataPoints[0].date.getTime()) / (24 * 60 * 60 * 1000);
    const weeklyChange = (slope * 7 / daysSpan) * 100; // as percentage

    // Determine direction and strength
    let direction: TrendAnalysis["direction"];
    let strength: TrendAnalysis["strength"];

    // For response time, lower is better
    const effectiveChange = metric === "responseTime" ? -weeklyChange : weeklyChange;

    if (effectiveChange > 2) {
      direction = "improving";
      strength = effectiveChange > 5 ? "strong" : effectiveChange > 3 ? "moderate" : "weak";
    } else if (effectiveChange < -2) {
      direction = "declining";
      strength = effectiveChange < -5 ? "strong" : effectiveChange < -3 ? "moderate" : "weak";
    } else {
      direction = "stable";
      strength = "moderate";
    }

    const insights = this.generateTrendInsights(direction, strength, metric, weeklyChange);

    return {
      direction,
      strength,
      confidence: Math.min(0.95, rSquared * 0.8 + 0.2),
      rateOfChange: weeklyChange,
      insights,
    };
  }

  private linearRegression(values: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    let ssTotal = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
      ssTotal += (values[i] - yMean) ** 2;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Calculate R-squared
    let ssResidual = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * i + intercept;
      ssResidual += (values[i] - predicted) ** 2;
    }

    const rSquared = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0;

    return { slope, intercept, rSquared: Math.max(0, rSquared) };
  }

  private generateTrendInsights(
    direction: TrendAnalysis["direction"],
    strength: TrendAnalysis["strength"],
    metric: string,
    change: number
  ): string[] {
    const insights: string[] = [];

    switch (direction) {
      case "improving":
        insights.push(`Great progress! ${metric === "successRate" ? "Success rate" : metric === "responseTime" ? "Response speed" : "Activity completion"} is improving.`);
        if (strength === "strong") {
          insights.push("The current practice approach is working very well!");
        }
        break;

      case "declining":
        insights.push(`${metric === "successRate" ? "Success rate" : metric === "responseTime" ? "Response speed" : "Activity completion"} has decreased recently.`);
        if (strength === "strong") {
          insights.push("Consider simplifying activities or taking more breaks.");
        } else {
          insights.push("This may be temporary - a slight dip is normal during learning.");
        }
        break;

      case "stable":
        insights.push("Performance is consistent - a good foundation to build on!");
        break;
    }

    return insights;
  }

  /**
   * Predict when the child might advance to the next phase
   */
  predictPhaseAdvancement(currentPhase: number, masteryThreshold: number = 0.85): PhasePrediction {
    const phaseData = this.dataPoints.filter(d => d.phase === currentPhase);

    if (phaseData.length < 3) {
      return {
        currentPhase,
        predictedNextPhaseDate: null,
        daysToNextPhase: null,
        confidence: 0.2,
        factors: ["Need more practice data to make predictions"],
      };
    }

    const successRates = phaseData.map(d => d.successRate);
    const latestRate = successRates[successRates.length - 1];
    const { slope } = this.linearRegression(successRates);

    const factors: string[] = [];

    // If already at mastery
    if (latestRate >= masteryThreshold) {
      factors.push(`Already performing at ${Math.round(latestRate * 100)}% success rate`);
      factors.push("Ready to try the next phase!");

      return {
        currentPhase,
        predictedNextPhaseDate: new Date(),
        daysToNextPhase: 0,
        confidence: 0.8,
        factors,
      };
    }

    // If not improving or declining
    if (slope <= 0) {
      factors.push("Current progress is flat or declining");
      factors.push("Focus on building consistency before advancing");

      return {
        currentPhase,
        predictedNextPhaseDate: null,
        daysToNextPhase: null,
        confidence: 0.4,
        factors,
      };
    }

    // Calculate days to reach mastery
    const rateNeeded = masteryThreshold - latestRate;
    const daysPerDataPoint = phaseData.length > 1
      ? (phaseData[phaseData.length - 1].date.getTime() - phaseData[0].date.getTime()) /
        (24 * 60 * 60 * 1000 * (phaseData.length - 1))
      : 1;

    const dataPointsNeeded = rateNeeded / slope;
    const daysToMastery = Math.ceil(dataPointsNeeded * daysPerDataPoint);

    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysToMastery);

    factors.push(`Current success rate: ${Math.round(latestRate * 100)}%`);
    factors.push(`Improving at ${(slope * 100).toFixed(1)}% per session`);
    factors.push(`Target: ${Math.round(masteryThreshold * 100)}% mastery`);

    return {
      currentPhase,
      predictedNextPhaseDate: predictedDate,
      daysToNextPhase: daysToMastery,
      confidence: Math.min(0.7, 0.3 + phaseData.length * 0.05),
      factors,
    };
  }

  /**
   * Break down skills by category
   */
  analyzeSkillBreakdown(): SkillBreakdown[] {
    const skills: SkillBreakdown[] = [
      {
        category: "Initiation",
        level: this.determineSkillLevel(1),
        progress: this.calculateSkillProgress(1),
        recentTrend: this.getSkillTrend(1),
        recommendations: this.getSkillRecommendations(1),
      },
      {
        category: "Distance & Persistence",
        level: this.determineSkillLevel(2),
        progress: this.calculateSkillProgress(2),
        recentTrend: this.getSkillTrend(2),
        recommendations: this.getSkillRecommendations(2),
      },
      {
        category: "Discrimination",
        level: this.determineSkillLevel(3),
        progress: this.calculateSkillProgress(3),
        recentTrend: this.getSkillTrend(3),
        recommendations: this.getSkillRecommendations(3),
      },
      {
        category: "Sentence Building",
        level: this.determineSkillLevel(4),
        progress: this.calculateSkillProgress(4),
        recentTrend: this.getSkillTrend(4),
        recommendations: this.getSkillRecommendations(4),
      },
      {
        category: "Responsive Communication",
        level: this.determineSkillLevel(5),
        progress: this.calculateSkillProgress(5),
        recentTrend: this.getSkillTrend(5),
        recommendations: this.getSkillRecommendations(5),
      },
      {
        category: "Commenting",
        level: this.determineSkillLevel(6),
        progress: this.calculateSkillProgress(6),
        recentTrend: this.getSkillTrend(6),
        recommendations: this.getSkillRecommendations(6),
      },
    ];

    return skills;
  }

  private determineSkillLevel(phase: number): SkillBreakdown["level"] {
    const phaseData = this.dataPoints.filter(d => d.phase === phase);
    if (phaseData.length === 0) return "not_started";

    const avgSuccess = phaseData.reduce((sum, d) => sum + d.successRate, 0) / phaseData.length;

    if (avgSuccess >= 0.85) return "mastered";
    if (avgSuccess >= 0.60) return "developing";
    return "emerging";
  }

  private calculateSkillProgress(phase: number): number {
    const phaseData = this.dataPoints.filter(d => d.phase === phase);
    if (phaseData.length === 0) return 0;

    const avgSuccess = phaseData.reduce((sum, d) => sum + d.successRate, 0) / phaseData.length;
    return Math.round(avgSuccess * 100);
  }

  private getSkillTrend(phase: number): SkillBreakdown["recentTrend"] {
    const phaseData = this.dataPoints.filter(d => d.phase === phase);
    if (phaseData.length < 3) return "stable";

    const recent = phaseData.slice(-5);
    const { slope } = this.linearRegression(recent.map(d => d.successRate));

    if (slope > 0.02) return "up";
    if (slope < -0.02) return "down";
    return "stable";
  }

  private getSkillRecommendations(phase: number): string[] {
    const level = this.determineSkillLevel(phase);
    const trend = this.getSkillTrend(phase);

    const recommendations: string[] = [];

    switch (level) {
      case "not_started":
        recommendations.push(`Ready to begin Phase ${phase} activities`);
        break;
      case "emerging":
        recommendations.push("Continue regular practice with support");
        if (trend === "down") {
          recommendations.push("Consider more frequent shorter sessions");
        }
        break;
      case "developing":
        recommendations.push("Great progress! Keep practicing");
        if (trend === "up") {
          recommendations.push("May be ready for new challenges soon");
        }
        break;
      case "mastered":
        recommendations.push("Excellent mastery achieved!");
        recommendations.push("Maintain skills while advancing to next phase");
        break;
    }

    return recommendations;
  }

  /**
   * Get weekly comparison
   */
  getWeeklyComparison(): ComprehensiveAnalysis["weeklyComparison"] {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekData = this.dataPoints.filter(d =>
      d.date >= oneWeekAgo && d.date <= now
    );
    const lastWeekData = this.dataPoints.filter(d =>
      d.date >= twoWeeksAgo && d.date < oneWeekAgo
    );

    const thisWeek = {
      sessions: thisWeekData.length,
      successRate: thisWeekData.length > 0
        ? thisWeekData.reduce((sum, d) => sum + d.successRate, 0) / thisWeekData.length
        : 0,
      minutes: thisWeekData.reduce((sum, d) => sum + d.activitiesCompleted * 2, 0), // estimate
    };

    const lastWeek = {
      sessions: lastWeekData.length,
      successRate: lastWeekData.length > 0
        ? lastWeekData.reduce((sum, d) => sum + d.successRate, 0) / lastWeekData.length
        : 0,
      minutes: lastWeekData.reduce((sum, d) => sum + d.activitiesCompleted * 2, 0),
    };

    return {
      thisWeek,
      lastWeek,
      change: {
        sessions: thisWeek.sessions - lastWeek.sessions,
        successRate: thisWeek.successRate - lastWeek.successRate,
        minutes: thisWeek.minutes - lastWeek.minutes,
      },
    };
  }

  /**
   * Get comprehensive analysis
   */
  getComprehensiveAnalysis(currentPhase: number): ComprehensiveAnalysis {
    const overallTrend = this.analyzeTrend("successRate");
    const phasePrediction = this.predictPhaseAdvancement(currentPhase);
    const skillBreakdown = this.analyzeSkillBreakdown();
    const weeklyComparison = this.getWeeklyComparison();

    const recommendations: string[] = [];

    // Add recommendations based on analysis
    if (overallTrend.direction === "declining") {
      recommendations.push("Consider shorter, more frequent practice sessions");
    }

    if (phasePrediction.daysToNextPhase && phasePrediction.daysToNextPhase <= 7) {
      recommendations.push(`Close to advancing to Phase ${currentPhase + 1}!`);
    }

    const developingSkills = skillBreakdown.filter(s => s.level === "developing");
    if (developingSkills.length > 0) {
      recommendations.push(`Focus on: ${developingSkills.map(s => s.category).join(", ")}`);
    }

    if (weeklyComparison.change.sessions < 0) {
      recommendations.push("Try to maintain consistent practice frequency");
    }

    return {
      overallTrend,
      phasePrediction,
      skillBreakdown,
      weeklyComparison,
      recommendations,
    };
  }
}

// Factory function
export function createTrendAnalyzer(data?: PerformanceDataPoint[]): TrendAnalyzer {
  return new TrendAnalyzer(data);
}
