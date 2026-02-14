-- ============================================================
-- ExpertPM — AGGRESSIVE RLS FIX (temporarily disable RLS on projects)
-- Run this in Supabase SQL Editor to confirm auth works
-- ============================================================

-- 1. Disable RLS on projects entirely to test if INSERT works
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- 2. Grant explicit permissions to authenticated role just in case
GRANT ALL ON projects TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON analyses TO authenticated;

-- 3. If you want to keep RLS enabled but very permissive, use this instead:
-- (Uncomment below and comment out step 1 if you prefer)
/*
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "projects_all" ON projects;
CREATE POLICY "projects_all" ON projects FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
*/

-- 4. Fix profiles RLS (simplest possible)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
