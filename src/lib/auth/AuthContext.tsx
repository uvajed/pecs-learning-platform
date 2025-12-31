"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from "@/lib/supabase/client";
import { UserProfile } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; role?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Check if user is in guest mode (no auth, using localStorage)
  const isGuest = !isConfigured || !user;

  const fetchProfile = async (userId: string) => {
    if (!isConfigured) return null;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as UserProfile;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    const supabase = getSupabase();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await supabaseSignIn(email, password);
      setUser(user);
      if (user) {
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; role?: string }) => {
    setLoading(true);
    try {
      const { user } = await supabaseSignUp(email, password, metadata);
      setUser(user);
      // Profile is auto-created by database trigger, wait a moment then fetch
      if (user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabaseSignOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isConfigured, isGuest, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
