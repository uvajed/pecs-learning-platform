import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ACHIEVEMENTS, type EarnedAchievement, type AchievementDefinition } from '@/types';

// Database operations for achievements

export async function getChildAchievements(childId: string): Promise<EarnedAchievement[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('child_id', childId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return (data || []).map(a => ({
    id: a.id,
    childId: a.child_id,
    achievementType: a.achievement_type,
    earnedAt: a.earned_at,
    metadata: a.metadata as Record<string, unknown>,
  }));
}

export async function awardAchievement(
  childId: string,
  achievementType: string,
  metadata?: Record<string, unknown>
): Promise<EarnedAchievement | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();

  // Check if already earned (prevent duplicates)
  const { data: existing } = await supabase
    .from('achievements')
    .select('id')
    .eq('child_id', childId)
    .eq('achievement_type', achievementType)
    .single();

  if (existing) {
    return null; // Already earned
  }

  const { data, error } = await supabase
    .from('achievements')
    .insert({
      child_id: childId,
      achievement_type: achievementType,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation means already earned
    if (error.code === '23505') return null;
    console.error('Error awarding achievement:', error);
    return null;
  }

  return {
    id: data.id,
    childId: data.child_id,
    achievementType: data.achievement_type,
    earnedAt: data.earned_at,
    metadata: data.metadata as Record<string, unknown>,
  };
}

export async function hasAchievement(childId: string, achievementType: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('achievements')
    .select('id')
    .eq('child_id', childId)
    .eq('achievement_type', achievementType)
    .single();

  if (error) return false;
  return !!data;
}

// Get achievement definition
export function getAchievementDefinition(achievementType: string): AchievementDefinition | null {
  return ACHIEVEMENTS[achievementType] || null;
}

// Get all achievement definitions
export function getAllAchievementDefinitions(): AchievementDefinition[] {
  return Object.values(ACHIEVEMENTS);
}

// Get earned achievements with their definitions
export async function getChildAchievementsWithDefinitions(
  childId: string
): Promise<Array<EarnedAchievement & { definition: AchievementDefinition }>> {
  const earned = await getChildAchievements(childId);

  return earned
    .map(achievement => {
      const definition = getAchievementDefinition(achievement.achievementType);
      if (!definition) return null;
      return { ...achievement, definition };
    })
    .filter((a): a is EarnedAchievement & { definition: AchievementDefinition } => a !== null);
}

// Get unearned achievements
export async function getUnearnedAchievements(
  childId: string
): Promise<AchievementDefinition[]> {
  const earned = await getChildAchievements(childId);
  const earnedTypes = new Set(earned.map(a => a.achievementType));

  return getAllAchievementDefinitions().filter(def => !earnedTypes.has(def.id));
}

// Get achievement progress (for progress bars)
export async function getAchievementProgress(
  childId: string
): Promise<{
  earned: number;
  total: number;
  percentage: number;
  byCategory: Record<string, { earned: number; total: number }>;
}> {
  const allDefinitions = getAllAchievementDefinitions();
  const earned = await getChildAchievements(childId);
  const earnedTypes = new Set(earned.map(a => a.achievementType));

  const byCategory: Record<string, { earned: number; total: number }> = {};

  allDefinitions.forEach(def => {
    if (!byCategory[def.category]) {
      byCategory[def.category] = { earned: 0, total: 0 };
    }
    byCategory[def.category].total++;
    if (earnedTypes.has(def.id)) {
      byCategory[def.category].earned++;
    }
  });

  return {
    earned: earned.length,
    total: allDefinitions.length,
    percentage: allDefinitions.length > 0
      ? Math.round((earned.length / allDefinitions.length) * 100)
      : 0,
    byCategory,
  };
}
