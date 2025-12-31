import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { StreakInfo } from '@/types';

// Re-export StreakInfo for convenience
export type { StreakInfo } from '@/types';

// Get streak info for a child
export async function getStreakInfo(childId: string): Promise<StreakInfo | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('child_id', childId)
    .single();

  if (error) {
    // No streak record yet
    if (error.code === 'PGRST116') {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakProtected: false,
      };
    }
    console.error('Error fetching streak:', error);
    return null;
  }

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastActivityDate: data.last_activity_date,
    streakProtected: data.streak_protected,
  };
}

// Update streak manually (normally handled by database trigger)
export async function updateStreak(
  childId: string,
  streakData: Partial<StreakInfo>
): Promise<StreakInfo | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();

  // Try to update existing record
  const { data: existing } = await supabase
    .from('streaks')
    .select('id')
    .eq('child_id', childId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_streak: streakData.currentStreak,
        longest_streak: streakData.longestStreak,
        last_activity_date: streakData.lastActivityDate,
        streak_protected: streakData.streakProtected,
        updated_at: new Date().toISOString(),
      })
      .eq('child_id', childId)
      .select()
      .single();

    if (error) {
      console.error('Error updating streak:', error);
      return null;
    }

    return {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActivityDate: data.last_activity_date,
      streakProtected: data.streak_protected,
    };
  }

  // Create new record
  const { data, error } = await supabase
    .from('streaks')
    .insert({
      child_id: childId,
      current_streak: streakData.currentStreak || 0,
      longest_streak: streakData.longestStreak || 0,
      last_activity_date: streakData.lastActivityDate,
      streak_protected: streakData.streakProtected || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating streak:', error);
    return null;
  }

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastActivityDate: data.last_activity_date,
    streakProtected: data.streak_protected,
  };
}

// Check if streak is at risk (no activity today, but had activity yesterday)
export function isStreakAtRisk(streakInfo: StreakInfo): boolean {
  if (!streakInfo.lastActivityDate || streakInfo.currentStreak === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = new Date(streakInfo.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  // Streak is at risk if last activity was yesterday
  return diffDays === 1;
}

// Check if streak is broken (no activity for more than 1 day)
export function isStreakBroken(streakInfo: StreakInfo): boolean {
  if (!streakInfo.lastActivityDate || streakInfo.currentStreak === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = new Date(streakInfo.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  // Streak is broken if more than 1 day has passed
  return diffDays > 1;
}

// Get streak status message
export function getStreakStatusMessage(streakInfo: StreakInfo): {
  message: string;
  type: 'success' | 'warning' | 'danger' | 'neutral';
} {
  if (streakInfo.currentStreak === 0) {
    return {
      message: 'Start your streak today!',
      type: 'neutral',
    };
  }

  if (isStreakBroken(streakInfo)) {
    return {
      message: `Your ${streakInfo.currentStreak}-day streak ended. Start a new one!`,
      type: 'danger',
    };
  }

  if (isStreakAtRisk(streakInfo)) {
    return {
      message: `Practice today to keep your ${streakInfo.currentStreak}-day streak!`,
      type: 'warning',
    };
  }

  // Check if practiced today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = streakInfo.lastActivityDate
    ? new Date(streakInfo.lastActivityDate)
    : null;
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }

  const practicedToday = lastActivity?.getTime() === today.getTime();

  if (practicedToday) {
    if (streakInfo.currentStreak >= 30) {
      return {
        message: `Amazing! ${streakInfo.currentStreak}-day streak!`,
        type: 'success',
      };
    }
    if (streakInfo.currentStreak >= 7) {
      return {
        message: `Great job! ${streakInfo.currentStreak}-day streak!`,
        type: 'success',
      };
    }
    return {
      message: `${streakInfo.currentStreak}-day streak! Keep it up!`,
      type: 'success',
    };
  }

  return {
    message: `${streakInfo.currentStreak}-day streak`,
    type: 'neutral',
  };
}
