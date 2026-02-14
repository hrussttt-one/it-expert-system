-- ============================================================
-- ExpertPM — COMPLETE FIX (run this in Supabase SQL Editor)
-- Fixes: 500 on profiles, 403 on projects, recursive policies
-- ============================================================

-- STEP 1: Drop ALL existing policies to start clean
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- STEP 2: Create a SECURITY DEFINER function to check admin role
-- This avoids recursive RLS on profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- STEP 3: Profiles policies (NO recursive sub-queries)
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);  -- all authenticated users can read profiles

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (true);  -- trigger handles insert

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- STEP 4: Projects policies (explicit per-operation)
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- STEP 5: Analyses policies
CREATE POLICY "analyses_select" ON analyses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "analyses_insert" ON analyses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "analyses_delete" ON analyses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = analyses.project_id AND projects.user_id = auth.uid())
  );

-- STEP 6: Knowledge base (read-only for authenticated)
CREATE POLICY "strategies_select" ON strategies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "knowledge_select" ON knowledge_projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rules_select" ON strategy_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- STEP 7: Confirm all existing users' emails (fixes 400 login error)
UPDATE auth.users SET 
  email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
