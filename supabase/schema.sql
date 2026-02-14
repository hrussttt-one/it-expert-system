-- ============================================================
-- ExpertPM — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  lang_pref TEXT DEFAULT 'uk',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Strategies catalog
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description JSONB DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Knowledge base projects (reference cases)
CREATE TABLE IF NOT EXISTS knowledge_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_size INT NOT NULL,
  budget NUMERIC NOT NULL,
  duration_months INT NOT NULL,
  complexity TEXT NOT NULL CHECK (complexity IN ('low', 'medium', 'high', 'critical')),
  project_type TEXT NOT NULL CHECK (project_type IN ('development', 'support', 'migration', 'integration', 'research')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  team_experience TEXT NOT NULL CHECK (team_experience IN ('junior', 'mixed', 'senior', 'expert')),
  client_involvement TEXT NOT NULL CHECK (client_involvement IN ('minimal', 'moderate', 'active', 'embedded')),
  requirements_stability TEXT NOT NULL CHECK (requirements_stability IN ('stable', 'evolving', 'volatile')),
  tech_stack_novelty TEXT NOT NULL CHECK (tech_stack_novelty IN ('established', 'moderate', 'cutting_edge')),
  strategy_id UUID REFERENCES strategies(id),
  outcome TEXT CHECK (outcome IN ('success', 'partial', 'failure')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Strategy rules (for rule-based inference)
CREATE TABLE IF NOT EXISTS strategy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  conditions JSONB NOT NULL,
  weight NUMERIC DEFAULT 1,
  description JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. User projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  team_size INT NOT NULL,
  budget NUMERIC NOT NULL,
  duration_months INT NOT NULL,
  complexity TEXT NOT NULL CHECK (complexity IN ('low', 'medium', 'high', 'critical')),
  project_type TEXT NOT NULL CHECK (project_type IN ('development', 'support', 'migration', 'integration', 'research')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  team_experience TEXT NOT NULL CHECK (team_experience IN ('junior', 'mixed', 'senior', 'expert')),
  client_involvement TEXT NOT NULL CHECK (client_involvement IN ('minimal', 'moderate', 'active', 'embedded')),
  requirements_stability TEXT NOT NULL CHECK (requirements_stability IN ('stable', 'evolving', 'volatile')),
  tech_stack_novelty TEXT NOT NULL CHECK (tech_stack_novelty IN ('established', 'moderate', 'cutting_edge')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Saved analyses
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_rules ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own, admins read all
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow profile insert" ON profiles
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins upsert profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Projects: users CRUD own
CREATE POLICY "Users CRUD own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Analyses: users CRUD own via project
CREATE POLICY "Users CRUD own analyses" ON analyses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid())
  );
-- Also allow insert if user owns the project
CREATE POLICY "Users insert analyses" ON analyses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid())
  );

-- Knowledge base: read-only for all authenticated
CREATE POLICY "Authenticated read strategies" ON strategies
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read knowledge" ON knowledge_projects
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read rules" ON strategy_rules
  FOR SELECT USING (auth.role() = 'authenticated');
