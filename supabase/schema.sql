-- PECS Learning Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  current_phase INTEGER DEFAULT 1 CHECK (current_phase >= 1 AND current_phase <= 6),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sessions INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  notes TEXT,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Sessions table (for tracking practice sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  phase_id INTEGER NOT NULL CHECK (phase_id >= 1 AND phase_id <= 6),
  duration_seconds INTEGER DEFAULT 0,
  successful_exchanges INTEGER DEFAULT 0,
  total_exchanges INTEGER DEFAULT 0,
  notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policies for children table
-- Allow anyone to read (for demo purposes - tighten this for production)
CREATE POLICY "Allow public read access to children" ON children
  FOR SELECT USING (true);

-- Allow anyone to insert (for demo purposes)
CREATE POLICY "Allow public insert access to children" ON children
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update (for demo purposes)
CREATE POLICY "Allow public update access to children" ON children
  FOR UPDATE USING (true);

-- Allow anyone to delete (for demo purposes)
CREATE POLICY "Allow public delete access to children" ON children
  FOR DELETE USING (true);

-- Policies for sessions table
CREATE POLICY "Allow public read access to sessions" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to sessions" ON sessions
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_child_id ON sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- No demo data - users create their own profiles
