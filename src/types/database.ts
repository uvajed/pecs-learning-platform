// Database types for Supabase tables
// These types match the schema in supabase/migrations/001_enhanced_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'parent' | 'therapist' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'parent' | 'therapist' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'parent' | 'therapist' | 'admin';
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string;
          current_phase: number;
          progress: number;
          sessions: number;
          user_id: string | null;
          date_of_birth: string | null;
          notes: string | null;
          preferences: Json;
          avatar_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name: string;
          current_phase?: number;
          progress?: number;
          sessions?: number;
          user_id?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          preferences?: Json;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          current_phase?: number;
          progress?: number;
          sessions?: number;
          user_id?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          preferences?: Json;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          created_at: string;
          child_id: string;
          phase_id: number;
          duration_seconds: number;
          successful_exchanges: number;
          total_exchanges: number;
          notes: string | null;
          started_at: string | null;
          ended_at: string | null;
          metrics: Json;
          facilitator_id: string | null;
          environment: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          child_id: string;
          phase_id: number;
          duration_seconds?: number;
          successful_exchanges?: number;
          total_exchanges?: number;
          notes?: string | null;
          started_at?: string;
          ended_at?: string | null;
          metrics?: Json;
          facilitator_id?: string | null;
          environment?: string | null;
        };
        Update: {
          phase_id?: number;
          duration_seconds?: number;
          successful_exchanges?: number;
          total_exchanges?: number;
          notes?: string | null;
          ended_at?: string | null;
          metrics?: Json;
          facilitator_id?: string | null;
          environment?: string | null;
        };
      };
      activities: {
        Row: {
          id: string;
          session_id: string;
          activity_type: string;
          success: boolean;
          prompt_level: 'independent' | 'gestural' | 'verbal' | 'physical' | 'full_physical' | null;
          response_time_ms: number | null;
          card_id: string | null;
          cards_in_array: string[] | null;
          reinforcement_given: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          activity_type: string;
          success?: boolean;
          prompt_level?: 'independent' | 'gestural' | 'verbal' | 'physical' | 'full_physical' | null;
          response_time_ms?: number | null;
          card_id?: string | null;
          cards_in_array?: string[] | null;
          reinforcement_given?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          activity_type?: string;
          success?: boolean;
          prompt_level?: 'independent' | 'gestural' | 'verbal' | 'physical' | 'full_physical' | null;
          response_time_ms?: number | null;
          card_id?: string | null;
          cards_in_array?: string[] | null;
          reinforcement_given?: string | null;
          metadata?: Json;
        };
      };
      achievements: {
        Row: {
          id: string;
          child_id: string;
          achievement_type: string;
          earned_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          child_id: string;
          achievement_type: string;
          earned_at?: string;
          metadata?: Json;
        };
        Update: {
          achievement_type?: string;
          metadata?: Json;
        };
      };
      streaks: {
        Row: {
          id: string;
          child_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          streak_protected: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_protected?: boolean;
          updated_at?: string;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_protected?: boolean;
          updated_at?: string;
        };
      };
      progress_snapshots: {
        Row: {
          id: string;
          child_id: string;
          snapshot_date: string;
          phase: number;
          total_sessions: number;
          success_rate: number;
          independent_rate: number;
          avg_response_time_ms: number | null;
          cards_mastered: number;
          metrics: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          snapshot_date?: string;
          phase: number;
          total_sessions?: number;
          success_rate?: number;
          independent_rate?: number;
          avg_response_time_ms?: number | null;
          cards_mastered?: number;
          metrics?: Json;
          created_at?: string;
        };
        Update: {
          phase?: number;
          total_sessions?: number;
          success_rate?: number;
          independent_rate?: number;
          avg_response_time_ms?: number | null;
          cards_mastered?: number;
          metrics?: Json;
        };
      };
    };
    Functions: {
      get_child_stats: {
        Args: { p_child_id: string };
        Returns: {
          total_sessions: number;
          total_activities: number;
          successful_activities: number;
          success_rate: number;
          current_streak: number;
          longest_streak: number;
          total_achievements: number;
          current_phase: number;
        }[];
      };
    };
  };
}

// Convenience type aliases
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type DBChild = Database['public']['Tables']['children']['Row'];
export type DBChildInsert = Database['public']['Tables']['children']['Insert'];
export type DBChildUpdate = Database['public']['Tables']['children']['Update'];

export type DBSession = Database['public']['Tables']['sessions']['Row'];
export type DBSessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type DBSessionUpdate = Database['public']['Tables']['sessions']['Update'];

export type DBActivity = Database['public']['Tables']['activities']['Row'];
export type DBActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type DBActivityUpdate = Database['public']['Tables']['activities']['Update'];

export type DBAchievement = Database['public']['Tables']['achievements']['Row'];
export type DBAchievementInsert = Database['public']['Tables']['achievements']['Insert'];

export type DBStreak = Database['public']['Tables']['streaks']['Row'];
export type DBStreakInsert = Database['public']['Tables']['streaks']['Insert'];
export type DBStreakUpdate = Database['public']['Tables']['streaks']['Update'];

export type DBProgressSnapshot = Database['public']['Tables']['progress_snapshots']['Row'];
export type DBProgressSnapshotInsert = Database['public']['Tables']['progress_snapshots']['Insert'];

// Child stats from the get_child_stats function
export interface ChildStats {
  totalSessions: number;
  totalActivities: number;
  successfulActivities: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  totalAchievements: number;
  currentPhase: number;
}
