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
      children: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          current_phase: number;
          progress: number;
          sessions: number;
          user_id: string | null;
          date_of_birth: string | null;
          notes: string | null;
          preferences: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          current_phase?: number;
          progress?: number;
          sessions?: number;
          user_id?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          current_phase?: number;
          progress?: number;
          sessions?: number;
          user_id?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          preferences?: Json | null;
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
        };
        Update: {
          id?: string;
          created_at?: string;
          child_id?: string;
          phase_id?: number;
          duration_seconds?: number;
          successful_exchanges?: number;
          total_exchanges?: number;
          notes?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type Child = Database['public']['Tables']['children']['Row'];
export type ChildInsert = Database['public']['Tables']['children']['Insert'];
export type ChildUpdate = Database['public']['Tables']['children']['Update'];

export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
