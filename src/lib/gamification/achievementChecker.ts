import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ACHIEVEMENTS, type AchievementDefinition, type ActivityType, type PECSPhase } from '@/types';
import { awardAchievement, hasAchievement } from './achievements';

interface CheckContext {
  childId: string;
  activityType?: ActivityType;
  wasSuccessful?: boolean;
  currentPhase?: PECSPhase;
  sessionSuccessRate?: number;
}

interface AchievementCheckResult {
  achievementType: string;
  definition: AchievementDefinition;
  awarded: boolean;
}

// Check and award achievements based on an activity
export async function checkAchievementsForActivity(
  context: CheckContext
): Promise<AchievementCheckResult[]> {
  if (!isSupabaseConfigured()) return [];

  const results: AchievementCheckResult[] = [];
  const { childId, activityType, wasSuccessful } = context;

  // Check first-time achievements
  if (wasSuccessful && activityType) {
    const firstTimeAchievements = getFirstTimeAchievements(activityType);
    for (const achievement of firstTimeAchievements) {
      const alreadyHas = await hasAchievement(childId, achievement.id);
      if (!alreadyHas) {
        const awarded = await awardAchievement(childId, achievement.id, {
          activityType,
          awardedAt: new Date().toISOString(),
        });
        results.push({
          achievementType: achievement.id,
          definition: achievement,
          awarded: awarded !== null,
        });
      }
    }
  }

  // Check count-based achievements
  if (wasSuccessful) {
    const countResults = await checkCountAchievements(childId, activityType);
    results.push(...countResults);
  }

  // Check streak achievements
  const streakResults = await checkStreakAchievements(childId);
  results.push(...streakResults);

  // Check session achievements (perfect session)
  if (context.sessionSuccessRate !== undefined) {
    const sessionResults = await checkSessionAchievements(childId, context.sessionSuccessRate);
    results.push(...sessionResults);
  }

  return results.filter(r => r.awarded);
}

// Check achievements at the end of a session
export async function checkAchievementsAfterSession(
  childId: string,
  sessionData: {
    successRate: number;
    phase: PECSPhase;
    totalActivities: number;
    successfulActivities: number;
  }
): Promise<AchievementCheckResult[]> {
  if (!isSupabaseConfigured()) return [];

  const results: AchievementCheckResult[] = [];

  // Check perfect session
  if (sessionData.successRate === 100 && sessionData.totalActivities >= 5) {
    const alreadyHas = await hasAchievement(childId, 'PERFECT_SESSION');
    if (!alreadyHas) {
      const awarded = await awardAchievement(childId, 'PERFECT_SESSION', {
        phase: sessionData.phase,
        activitiesCount: sessionData.totalActivities,
      });
      if (awarded) {
        results.push({
          achievementType: 'PERFECT_SESSION',
          definition: ACHIEVEMENTS.PERFECT_SESSION,
          awarded: true,
        });
      }
    }
  }

  // Check session count achievements
  const sessionCountResults = await checkSessionCountAchievements(childId);
  results.push(...sessionCountResults);

  // Check streak achievements (updated by database trigger, but verify)
  const streakResults = await checkStreakAchievements(childId);
  results.push(...streakResults);

  return results.filter(r => r.awarded);
}

// Check phase completion achievement
export async function checkPhaseCompletionAchievement(
  childId: string,
  completedPhase: PECSPhase
): Promise<AchievementCheckResult | null> {
  if (!isSupabaseConfigured()) return null;

  const achievementId = `PHASE_${completedPhase}_COMPLETE`;
  const achievement = ACHIEVEMENTS[achievementId];

  if (!achievement) return null;

  const alreadyHas = await hasAchievement(childId, achievementId);
  if (alreadyHas) return null;

  const awarded = await awardAchievement(childId, achievementId, {
    completedAt: new Date().toISOString(),
  });

  return awarded
    ? { achievementType: achievementId, definition: achievement, awarded: true }
    : null;
}

// Helper functions

function getFirstTimeAchievements(activityType: ActivityType): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS).filter(
    a => a.criteria.type === 'first' && a.criteria.activityType === activityType
  );
}

async function checkCountAchievements(
  childId: string,
  _activityType?: ActivityType
): Promise<AchievementCheckResult[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const results: AchievementCheckResult[] = [];

  // First get child's session IDs
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('child_id', childId);

  if (!sessions || sessions.length === 0) return results;

  const sessionIds = sessions.map(s => s.id);

  // Get activity counts for those sessions
  const { data: counts } = await supabase
    .from('activities')
    .select('activity_type, success')
    .eq('success', true)
    .in('session_id', sessionIds);

  if (!counts) return results;

  // Count by activity type
  const typeCounts: Record<string, number> = {};
  counts.forEach(c => {
    typeCounts[c.activity_type] = (typeCounts[c.activity_type] || 0) + 1;
  });

  const totalSuccessful = counts.length;

  // Check count-based achievements
  const countAchievements = Object.values(ACHIEVEMENTS).filter(
    a => a.criteria.type === 'count' && a.criteria.target
  );

  for (const achievement of countAchievements) {
    const alreadyHas = await hasAchievement(childId, achievement.id);
    if (alreadyHas) continue;

    let count = 0;
    if (achievement.criteria.activityType) {
      count = typeCounts[achievement.criteria.activityType] || 0;
    } else {
      count = totalSuccessful;
    }

    if (count >= (achievement.criteria.target || 0)) {
      const awarded = await awardAchievement(childId, achievement.id, {
        count,
        achievedAt: new Date().toISOString(),
      });
      if (awarded) {
        results.push({
          achievementType: achievement.id,
          definition: achievement,
          awarded: true,
        });
      }
    }
  }

  return results;
}

async function checkStreakAchievements(childId: string): Promise<AchievementCheckResult[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const results: AchievementCheckResult[] = [];

  // Get current streak from streaks table
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak')
    .eq('child_id', childId)
    .single();

  if (!streak) return results;

  const currentStreak = Math.max(streak.current_streak, streak.longest_streak);

  // Check streak achievements
  const streakAchievements = Object.values(ACHIEVEMENTS).filter(
    a => a.criteria.type === 'streak' && a.criteria.target
  );

  for (const achievement of streakAchievements) {
    const alreadyHas = await hasAchievement(childId, achievement.id);
    if (alreadyHas) continue;

    if (currentStreak >= (achievement.criteria.target || 0)) {
      const awarded = await awardAchievement(childId, achievement.id, {
        streakDays: currentStreak,
        achievedAt: new Date().toISOString(),
      });
      if (awarded) {
        results.push({
          achievementType: achievement.id,
          definition: achievement,
          awarded: true,
        });
      }
    }
  }

  return results;
}

async function checkSessionCountAchievements(childId: string): Promise<AchievementCheckResult[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const results: AchievementCheckResult[] = [];

  // Count completed sessions
  const { count } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('child_id', childId)
    .not('ended_at', 'is', null);

  const sessionCount = count || 0;

  // Session count achievements
  const sessionAchievements: Record<string, number> = {
    SESSIONS_5: 5,
    SESSIONS_25: 25,
    SESSIONS_100: 100,
  };

  for (const [achievementId, target] of Object.entries(sessionAchievements)) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) continue;

    const alreadyHas = await hasAchievement(childId, achievementId);
    if (alreadyHas) continue;

    if (sessionCount >= target) {
      const awarded = await awardAchievement(childId, achievementId, {
        sessionCount,
        achievedAt: new Date().toISOString(),
      });
      if (awarded) {
        results.push({
          achievementType: achievementId,
          definition: achievement,
          awarded: true,
        });
      }
    }
  }

  return results;
}

async function checkSessionAchievements(
  childId: string,
  successRate: number
): Promise<AchievementCheckResult[]> {
  const results: AchievementCheckResult[] = [];

  // Perfect session (100% accuracy)
  if (successRate === 100) {
    const alreadyHas = await hasAchievement(childId, 'PERFECT_SESSION');
    if (!alreadyHas) {
      const awarded = await awardAchievement(childId, 'PERFECT_SESSION');
      if (awarded) {
        results.push({
          achievementType: 'PERFECT_SESSION',
          definition: ACHIEVEMENTS.PERFECT_SESSION,
          awarded: true,
        });
      }
    }
  }

  return results;
}
