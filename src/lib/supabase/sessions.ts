import { getSupabase, isSupabaseConfigured } from './client';
import type { Json, DBSession, DBSessionInsert, DBSessionUpdate, DBActivity, DBActivityInsert } from '@/types/database';
import type { PECSPhase, SessionActivity } from '@/types';

// Session CRUD operations

export async function createSession(data: {
  childId: string;
  phase: PECSPhase;
  facilitatorId?: string;
  environment?: string;
}): Promise<DBSession | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      child_id: data.childId,
      phase_id: data.phase,
      facilitator_id: data.facilitatorId,
      environment: data.environment || 'home',
      started_at: new Date().toISOString(),
    } satisfies DBSessionInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  return session;
}

export async function updateSession(
  sessionId: string,
  data: {
    endedAt?: string;
    durationSeconds?: number;
    successfulExchanges?: number;
    totalExchanges?: number;
    notes?: string;
    metrics?: Record<string, unknown>;
  }
): Promise<DBSession | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const updateData: DBSessionUpdate = {
    ended_at: data.endedAt,
    duration_seconds: data.durationSeconds,
    successful_exchanges: data.successfulExchanges,
    total_exchanges: data.totalExchanges,
    notes: data.notes,
  };

  if (data.metrics) {
    updateData.metrics = data.metrics as Json;
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    return null;
  }

  return session;
}

export async function endSession(
  sessionId: string,
  summary: {
    durationSeconds: number;
    successfulExchanges: number;
    totalExchanges: number;
    metrics?: Record<string, unknown>;
  }
): Promise<DBSession | null> {
  return updateSession(sessionId, {
    endedAt: new Date().toISOString(),
    durationSeconds: summary.durationSeconds,
    successfulExchanges: summary.successfulExchanges,
    totalExchanges: summary.totalExchanges,
    metrics: summary.metrics,
  });
}

export async function getSession(sessionId: string): Promise<DBSession | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return data;
}

export async function getChildSessions(
  childId: string,
  options?: { limit?: number; offset?: number }
): Promise<DBSession[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  let query = supabase
    .from('sessions')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching child sessions:', error);
    return [];
  }

  return data || [];
}

// Activity operations

export async function recordActivity(
  sessionId: string,
  activity: Omit<SessionActivity, 'id' | 'sessionId' | 'recordedAt'>
): Promise<DBActivity | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('activities')
    .insert({
      session_id: sessionId,
      activity_type: activity.activityType,
      success: activity.wasSuccessful,
      prompt_level: activity.promptLevel,
      response_time_ms: activity.responseTimeMs,
      card_id: activity.cardId,
      cards_in_array: activity.cardsInArray,
      reinforcement_given: activity.reinforcementGiven,
    } satisfies DBActivityInsert)
    .select()
    .single();

  if (error) {
    console.error('Error recording activity:', error);
    return null;
  }

  return data;
}

export async function recordActivities(
  sessionId: string,
  activities: Array<Omit<SessionActivity, 'id' | 'sessionId' | 'recordedAt'>>
): Promise<DBActivity[]> {
  if (!isSupabaseConfigured() || activities.length === 0) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('activities')
    .insert(
      activities.map((activity) => ({
        session_id: sessionId,
        activity_type: activity.activityType,
        success: activity.wasSuccessful,
        prompt_level: activity.promptLevel,
        response_time_ms: activity.responseTimeMs,
        card_id: activity.cardId,
        cards_in_array: activity.cardsInArray,
        reinforcement_given: activity.reinforcementGiven,
      } satisfies DBActivityInsert))
    )
    .select();

  if (error) {
    console.error('Error recording activities:', error);
    return [];
  }

  return data || [];
}

export async function getSessionActivities(sessionId: string): Promise<DBActivity[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching session activities:', error);
    return [];
  }

  return data || [];
}

// Statistics

export async function getChildStats(childId: string): Promise<{
  totalSessions: number;
  totalActivities: number;
  successfulActivities: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  totalAchievements: number;
  currentPhase: number;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .rpc('get_child_stats', { p_child_id: childId });

  if (error) {
    console.error('Error fetching child stats:', error);
    return null;
  }

  if (data && data.length > 0) {
    const stats = data[0];
    return {
      totalSessions: stats.total_sessions,
      totalActivities: stats.total_activities,
      successfulActivities: stats.successful_activities,
      successRate: stats.success_rate,
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak,
      totalAchievements: stats.total_achievements,
      currentPhase: stats.current_phase,
    };
  }

  return null;
}

// Recent activity for dashboard
export async function getRecentActivity(
  childId: string,
  limit: number = 5
): Promise<Array<{
  date: string;
  phase: number;
  successRate: number;
  duration: number;
}>> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sessions')
    .select('created_at, phase_id, successful_exchanges, total_exchanges, duration_seconds')
    .eq('child_id', childId)
    .not('ended_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return (data || []).map((session) => ({
    date: session.created_at,
    phase: session.phase_id,
    successRate: session.total_exchanges > 0
      ? Math.round((session.successful_exchanges / session.total_exchanges) * 100)
      : 0,
    duration: session.duration_seconds,
  }));
}
