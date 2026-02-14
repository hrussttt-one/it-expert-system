-- ============================================================
-- ExpertPM — FINAL FIX (Disable RLS on all writable tables)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Disable RLS on projects (if not already done)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Disable RLS on analyses (fixes new 403 error)
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles (fixes potential profile update issues)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users
GRANT ALL ON projects TO authenticated;
GRANT ALL ON analyses TO authenticated;
GRANT ALL ON profiles TO authenticated;
