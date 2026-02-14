-- ============================================================
-- ExpertPM — DEBUG & FIX (Supabase RLS)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Fix user login 400 error (update only writable columns)
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Clean slate for troublesome tables
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;

-- 3. Simple, robust policies (avoid recursion completely)

-- Profiles: Allow anyone authenticated to read profiles (needed for admin check)
CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles: Users allow update own
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects: Users allow select own
CREATE POLICY "projects_select_own" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Projects: Allow authenticated users to insert (with user_id check)
CREATE POLICY "projects_insert_authenticated" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects: Users allow update/delete own
CREATE POLICY "projects_update_own" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Ensure RLS is enabled but not blocking
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
