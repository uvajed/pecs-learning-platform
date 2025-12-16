import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Lazy-loaded Supabase client
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance && isSupabaseConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance!;
}

// For backwards compatibility with database operations
export const supabase = {
  from: (table: string) => getSupabase().from(table),
};

// Auth helper functions
export async function signUp(email: string, password: string, metadata?: { full_name?: string; role?: string }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Authentication requires Supabase configuration');
  }
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Authentication requires Supabase configuration');
  }
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await getSupabase().auth.getSession();
  return session;
}

export async function getUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await getSupabase().auth.getUser();
  return user;
}
