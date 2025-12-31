-- PECS Platform Enhanced Schema Migration
-- Adds: user_profiles, activities, achievements, streaks
-- Run after initial schema.sql

-- ============================================
-- 1. User Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('parent', 'therapist', 'admin')) DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. Enhanced Children Table (add columns if missing)
-- ============================================
DO $$
BEGIN
  -- Add avatar_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'avatar_url') THEN
    ALTER TABLE children ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add updated_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'updated_at') THEN
    ALTER TABLE children ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- 3. Enhanced Sessions Table (add columns if missing)
-- ============================================
DO $$
BEGIN
  -- Add started_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'started_at') THEN
    ALTER TABLE sessions ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add ended_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'ended_at') THEN
    ALTER TABLE sessions ADD COLUMN ended_at TIMESTAMPTZ;
  END IF;

  -- Add metrics JSONB if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'metrics') THEN
    ALTER TABLE sessions ADD COLUMN metrics JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add facilitator_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'facilitator_id') THEN
    ALTER TABLE sessions ADD COLUMN facilitator_id UUID REFERENCES user_profiles(id);
  END IF;

  -- Add environment if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'environment') THEN
    ALTER TABLE sessions ADD COLUMN environment TEXT DEFAULT 'home';
  END IF;
END $$;

-- ============================================
-- 4. Activities Table (Individual Activity Records)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  prompt_level TEXT CHECK (prompt_level IN ('independent', 'gestural', 'verbal', 'physical', 'full_physical')),
  response_time_ms INTEGER,
  card_id TEXT,
  cards_in_array TEXT[],
  reinforcement_given TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_session_id ON activities(session_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);

-- ============================================
-- 5. Achievements Table
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Prevent duplicate achievements
  UNIQUE(child_id, achievement_type)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_achievements_child_id ON achievements(child_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- ============================================
-- 6. Streaks Table
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_protected BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_streaks_child_id ON streaks(child_id);

-- ============================================
-- 7. Progress Snapshots Table (for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  phase INTEGER NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  independent_rate NUMERIC(5,2) DEFAULT 0,
  avg_response_time_ms INTEGER,
  cards_mastered INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One snapshot per child per day
  UNIQUE(child_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_progress_snapshots_child_date ON progress_snapshots(child_id, snapshot_date);

-- ============================================
-- 8. Row Level Security Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

-- User Profiles: users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Children: users can manage their own children
-- Drop existing public policies first (for migration from demo mode)
DROP POLICY IF EXISTS "Allow public read access to children" ON children;
DROP POLICY IF EXISTS "Allow public insert access to children" ON children;
DROP POLICY IF EXISTS "Allow public update access to children" ON children;
DROP POLICY IF EXISTS "Allow public delete access to children" ON children;

CREATE POLICY "Users can view own children" ON children
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert own children" ON children
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own children" ON children
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own children" ON children
  FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Sessions: users can manage sessions for their children
DROP POLICY IF EXISTS "Allow public read access to sessions" ON sessions;
DROP POLICY IF EXISTS "Allow public insert access to sessions" ON sessions;

CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

-- Activities: follow session permissions
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN children c ON s.child_id = c.id
      WHERE c.user_id = auth.uid() OR c.user_id IS NULL
    )
  );

CREATE POLICY "Users can insert own activities" ON activities
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN children c ON s.child_id = c.id
      WHERE c.user_id = auth.uid() OR c.user_id IS NULL
    )
  );

-- Achievements: users can view/manage achievements for their children
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

-- Streaks: users can view/manage streaks for their children
CREATE POLICY "Users can view own streaks" ON streaks
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can manage own streaks" ON streaks
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

-- Progress Snapshots: users can view snapshots for their children
CREATE POLICY "Users can view own progress snapshots" ON progress_snapshots
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can insert own progress snapshots" ON progress_snapshots
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE user_id = auth.uid() OR user_id IS NULL)
  );

-- ============================================
-- 9. Helper Functions
-- ============================================

-- Function to update streak on activity
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_child_id UUID;
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get child_id from session
  SELECT child_id INTO v_child_id FROM sessions WHERE id = NEW.session_id;

  -- Get or create streak record
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM streaks WHERE child_id = v_child_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO streaks (child_id, current_streak, longest_streak, last_activity_date)
    VALUES (v_child_id, 1, 1, v_today);
  ELSE
    -- Update existing streak
    IF v_last_date IS NULL OR v_last_date < v_today - INTERVAL '1 day' THEN
      -- Streak broken, reset to 1
      v_current_streak := 1;
    ELSIF v_last_date < v_today THEN
      -- Continue streak
      v_current_streak := v_current_streak + 1;
    END IF;
    -- Streak already counted today, no change

    -- Update longest if needed
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;

    UPDATE streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = NOW()
    WHERE child_id = v_child_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak when activity is created
DROP TRIGGER IF EXISTS on_activity_created ON activities;
CREATE TRIGGER on_activity_created
  AFTER INSERT ON activities
  FOR EACH ROW
  WHEN (NEW.success = TRUE)
  EXECUTE FUNCTION update_streak();

-- Function to get child stats summary
CREATE OR REPLACE FUNCTION get_child_stats(p_child_id UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  total_activities BIGINT,
  successful_activities BIGINT,
  success_rate NUMERIC,
  current_streak INTEGER,
  longest_streak INTEGER,
  total_achievements BIGINT,
  current_phase INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM sessions WHERE child_id = p_child_id),
    (SELECT COUNT(*) FROM activities a JOIN sessions s ON a.session_id = s.id WHERE s.child_id = p_child_id),
    (SELECT COUNT(*) FROM activities a JOIN sessions s ON a.session_id = s.id WHERE s.child_id = p_child_id AND a.success = TRUE),
    COALESCE(
      (SELECT ROUND(
        (COUNT(*) FILTER (WHERE a.success = TRUE)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 2
      )
      FROM activities a JOIN sessions s ON a.session_id = s.id WHERE s.child_id = p_child_id),
      0
    ),
    COALESCE((SELECT st.current_streak FROM streaks st WHERE st.child_id = p_child_id), 0),
    COALESCE((SELECT st.longest_streak FROM streaks st WHERE st.child_id = p_child_id), 0),
    (SELECT COUNT(*) FROM achievements WHERE achievements.child_id = p_child_id),
    (SELECT c.current_phase FROM children c WHERE c.id = p_child_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
