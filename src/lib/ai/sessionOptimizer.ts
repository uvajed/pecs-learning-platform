/**
 * Session Optimizer
 *
 * Analyzes historical session data to recommend optimal practice times,
 * session durations, and activity sequences.
 */

export interface SessionHistory {
  id: string;
  date: Date;
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  durationMs: number;
  activitiesCompleted: number;
  successRate: number;
  avgResponseTimeMs: number;
  phase: number;
  completedSuccessfully: boolean;
}

export interface OptimalTimeSlot {
  dayOfWeek: number;
  hourOfDay: number;
  confidence: number;
  averageSuccessRate: number;
  sampleSize: number;
}

export interface SessionDurationRecommendation {
  optimalDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  reasoning: string;
}

export interface SessionSequenceRecommendation {
  phases: number[];
  reasoning: string;
  estimatedDurationMs: number;
}

export interface DailyScheduleRecommendation {
  suggestedTimes: OptimalTimeSlot[];
  sessionsPerDay: number;
  restDaysSuggested: number[];
  weeklyGoal: {
    sessionsTarget: number;
    minutesTarget: number;
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOUR_LABELS: Record<number, string> = {
  6: "Early Morning (6-8am)",
  8: "Morning (8-10am)",
  10: "Late Morning (10am-12pm)",
  12: "Midday (12-2pm)",
  14: "Early Afternoon (2-4pm)",
  16: "Late Afternoon (4-6pm)",
  18: "Evening (6-8pm)",
  20: "Night (8-10pm)",
};

export class SessionOptimizer {
  private sessionHistory: SessionHistory[] = [];

  constructor(history: SessionHistory[] = []) {
    this.sessionHistory = history;
  }

  addSession(session: SessionHistory): void {
    this.sessionHistory.push(session);
  }

  /**
   * Find optimal time slots for practice based on historical success rates
   */
  getOptimalTimeSlots(topN: number = 5): OptimalTimeSlot[] {
    if (this.sessionHistory.length < 5) {
      // Not enough data, return general recommendations
      return this.getDefaultTimeSlots();
    }

    // Group sessions by day/hour
    const timeSlotStats: Record<string, {
      total: number;
      successSum: number;
      sessions: SessionHistory[];
    }> = {};

    for (const session of this.sessionHistory) {
      // Round hour to 2-hour blocks
      const hourBlock = Math.floor(session.hourOfDay / 2) * 2;
      const key = `${session.dayOfWeek}-${hourBlock}`;

      if (!timeSlotStats[key]) {
        timeSlotStats[key] = { total: 0, successSum: 0, sessions: [] };
      }

      timeSlotStats[key].total++;
      timeSlotStats[key].successSum += session.successRate;
      timeSlotStats[key].sessions.push(session);
    }

    // Calculate average success rate for each slot
    const slots: OptimalTimeSlot[] = [];

    for (const [key, stats] of Object.entries(timeSlotStats)) {
      const [dayStr, hourStr] = key.split("-");
      const dayOfWeek = parseInt(dayStr);
      const hourOfDay = parseInt(hourStr);

      // Need at least 2 sessions for meaningful data
      if (stats.total < 2) continue;

      const avgSuccessRate = stats.successSum / stats.total;
      const confidence = Math.min(0.95, 0.3 + stats.total * 0.1);

      slots.push({
        dayOfWeek,
        hourOfDay,
        confidence,
        averageSuccessRate: avgSuccessRate,
        sampleSize: stats.total,
      });
    }

    // Sort by success rate and return top N
    return slots
      .sort((a, b) => b.averageSuccessRate - a.averageSuccessRate)
      .slice(0, topN);
  }

  private getDefaultTimeSlots(): OptimalTimeSlot[] {
    // Default recommendations based on general child development research
    return [
      { dayOfWeek: 1, hourOfDay: 10, confidence: 0.3, averageSuccessRate: 0, sampleSize: 0 }, // Monday 10am
      { dayOfWeek: 3, hourOfDay: 10, confidence: 0.3, averageSuccessRate: 0, sampleSize: 0 }, // Wednesday 10am
      { dayOfWeek: 5, hourOfDay: 10, confidence: 0.3, averageSuccessRate: 0, sampleSize: 0 }, // Friday 10am
      { dayOfWeek: 6, hourOfDay: 9, confidence: 0.3, averageSuccessRate: 0, sampleSize: 0 },  // Saturday 9am
    ];
  }

  /**
   * Recommend optimal session duration based on past performance
   */
  getOptimalDuration(): SessionDurationRecommendation {
    if (this.sessionHistory.length < 3) {
      return {
        optimalDurationMs: 10 * 60 * 1000, // 10 minutes
        minDurationMs: 5 * 60 * 1000,      // 5 minutes
        maxDurationMs: 15 * 60 * 1000,     // 15 minutes
        reasoning: "Starting with short sessions to build consistency. Duration will be personalized as we learn more.",
      };
    }

    // Find sessions with best success rates
    const successfulSessions = this.sessionHistory
      .filter(s => s.completedSuccessfully && s.successRate > 0.7)
      .sort((a, b) => b.successRate - a.successRate);

    if (successfulSessions.length < 3) {
      return {
        optimalDurationMs: 10 * 60 * 1000,
        minDurationMs: 5 * 60 * 1000,
        maxDurationMs: 15 * 60 * 1000,
        reasoning: "Building up session data. Shorter sessions recommended for now.",
      };
    }

    // Calculate optimal duration from best sessions
    const topSessions = successfulSessions.slice(0, Math.max(3, Math.floor(successfulSessions.length / 3)));
    const avgDuration = topSessions.reduce((sum, s) => sum + s.durationMs, 0) / topSessions.length;

    // Add some buffer
    const optimal = Math.round(avgDuration);
    const min = Math.max(5 * 60 * 1000, optimal * 0.6);
    const max = Math.min(30 * 60 * 1000, optimal * 1.4);

    return {
      optimalDurationMs: optimal,
      minDurationMs: min,
      maxDurationMs: max,
      reasoning: `Based on ${topSessions.length} high-performance sessions, ${Math.round(optimal / 60000)} minutes works best.`,
    };
  }

  /**
   * Recommend which phases to practice and in what order
   */
  getPhaseSequence(currentPhase: number, availablePhases: number[]): SessionSequenceRecommendation {
    const recommendations: SessionSequenceRecommendation[] = [];

    // Analyze phase performance
    const phaseStats: Record<number, { attempts: number; successRate: number }> = {};

    for (const session of this.sessionHistory) {
      if (!phaseStats[session.phase]) {
        phaseStats[session.phase] = { attempts: 0, successRate: 0 };
      }
      phaseStats[session.phase].attempts++;
      phaseStats[session.phase].successRate =
        (phaseStats[session.phase].successRate * (phaseStats[session.phase].attempts - 1) +
          session.successRate) / phaseStats[session.phase].attempts;
    }

    const phases: number[] = [];
    const reasoning: string[] = [];

    // Always start with current phase or a warmup phase
    if (currentPhase > 1 && availablePhases.includes(currentPhase - 1)) {
      const prevPhase = currentPhase - 1;
      const prevStats = phaseStats[prevPhase];
      if (prevStats && prevStats.successRate > 0.8) {
        phases.push(prevPhase);
        reasoning.push(`Start with Phase ${prevPhase} as a warm-up`);
      }
    }

    // Add current phase
    phases.push(currentPhase);
    reasoning.push(`Focus on Phase ${currentPhase}`);

    // If doing well, add challenge phase
    const currentStats = phaseStats[currentPhase];
    if (currentStats && currentStats.successRate > 0.85 && currentPhase < 6) {
      const nextPhase = currentPhase + 1;
      if (availablePhases.includes(nextPhase)) {
        phases.push(nextPhase);
        reasoning.push(`Challenge with Phase ${nextPhase} preview`);
      }
    }

    // Estimate duration
    const durationPerPhase = 5 * 60 * 1000; // 5 minutes per phase
    const estimatedDuration = phases.length * durationPerPhase;

    return {
      phases,
      reasoning: reasoning.join(". ") + ".",
      estimatedDurationMs: estimatedDuration,
    };
  }

  /**
   * Get comprehensive weekly schedule recommendation
   */
  getWeeklySchedule(): DailyScheduleRecommendation {
    const optimalSlots = this.getOptimalTimeSlots(7);
    const duration = this.getOptimalDuration();

    // Calculate weekly targets based on history
    let sessionsPerDay = 1;
    let weeklySessionTarget = 5;

    if (this.sessionHistory.length >= 7) {
      // Look at past week patterns
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentSessions = this.sessionHistory.filter(
        s => s.date.getTime() > oneWeekAgo
      );

      const sessionsPerDayMap: Record<number, number> = {};
      for (const session of recentSessions) {
        const dayKey = session.dayOfWeek;
        sessionsPerDayMap[dayKey] = (sessionsPerDayMap[dayKey] || 0) + 1;
      }

      const activeDays = Object.keys(sessionsPerDayMap).length;
      weeklySessionTarget = Math.max(5, recentSessions.length);

      // Suggest similar pattern but slightly more ambitious
      sessionsPerDay = activeDays > 0
        ? Math.ceil(recentSessions.length / activeDays)
        : 1;
    }

    // Suggest rest days (typically weekend for therapy-focused schedules)
    const restDays = [0]; // Sunday

    // If history shows low performance on certain days, suggest rest
    const dayPerformance: Record<number, number[]> = {};
    for (const session of this.sessionHistory) {
      if (!dayPerformance[session.dayOfWeek]) {
        dayPerformance[session.dayOfWeek] = [];
      }
      dayPerformance[session.dayOfWeek].push(session.successRate);
    }

    for (const [day, rates] of Object.entries(dayPerformance)) {
      const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
      if (avgRate < 0.5 && rates.length >= 3) {
        const dayNum = parseInt(day);
        if (!restDays.includes(dayNum)) {
          restDays.push(dayNum);
        }
      }
    }

    return {
      suggestedTimes: optimalSlots,
      sessionsPerDay,
      restDaysSuggested: restDays.sort(),
      weeklyGoal: {
        sessionsTarget: weeklySessionTarget,
        minutesTarget: weeklySessionTarget * Math.round(duration.optimalDurationMs / 60000),
      },
    };
  }

  /**
   * Format time slot for display
   */
  formatTimeSlot(slot: OptimalTimeSlot): string {
    const dayName = DAY_NAMES[slot.dayOfWeek];
    const hourLabel = HOUR_LABELS[slot.hourOfDay] || `${slot.hourOfDay}:00`;
    return `${dayName} ${hourLabel}`;
  }

  /**
   * Get recommendation for next session
   */
  getNextSessionRecommendation(): {
    suggestedTime: string;
    suggestedDuration: string;
    suggestedPhases: number[];
    confidence: number;
  } {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    const schedule = this.getWeeklySchedule();
    const duration = this.getOptimalDuration();

    // Find next available optimal slot
    let nextSlot = schedule.suggestedTimes.find(slot => {
      if (slot.dayOfWeek > currentDay) return true;
      if (slot.dayOfWeek === currentDay && slot.hourOfDay > currentHour) return true;
      return false;
    });

    // If no slot found this week, use first slot next week
    if (!nextSlot && schedule.suggestedTimes.length > 0) {
      nextSlot = schedule.suggestedTimes[0];
    }

    const suggestedTime = nextSlot
      ? this.formatTimeSlot(nextSlot)
      : "Any time that works for you";

    return {
      suggestedTime,
      suggestedDuration: `${Math.round(duration.optimalDurationMs / 60000)} minutes`,
      suggestedPhases: this.getPhaseSequence(1, [1, 2, 3, 4, 5, 6]).phases,
      confidence: nextSlot?.confidence ?? 0.3,
    };
  }
}

// Factory function
export function createSessionOptimizer(history?: SessionHistory[]): SessionOptimizer {
  return new SessionOptimizer(history);
}
