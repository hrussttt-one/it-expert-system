-- ============================================================
-- ExpertPM — OPEN EVERYTHING (Fix all 403 errors)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Knowledge Base (Read Access)
ALTER TABLE strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_rules DISABLE ROW LEVEL SECURITY;

GRANT SELECT ON strategies TO anon, authenticated;
GRANT SELECT ON knowledge_projects TO anon, authenticated;
GRANT SELECT ON strategy_rules TO anon, authenticated;

-- 2. User Data (Write Access)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

GRANT ALL ON projects TO authenticated;
GRANT ALL ON analyses TO authenticated;
GRANT ALL ON profiles TO authenticated;
