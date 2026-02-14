-- SUPABASE ROLLBACK SCRIPT (v2.0 -> v1.0)
-- This script disables Row Level Security and removes policies added in v2.0.

-- 1. Disable RLS on Knowledge Base tables
ALTER TABLE strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_rules DISABLE ROW LEVEL SECURITY;

-- 2. Clean up Policies (Optional, but good practice)
DROP POLICY IF EXISTS "strategies_read_all" ON strategies;
DROP POLICY IF EXISTS "strategies_insert_admin" ON strategies;
DROP POLICY IF EXISTS "strategies_update_admin" ON strategies;
DROP POLICY IF EXISTS "strategies_delete_admin" ON strategies;

DROP POLICY IF EXISTS "knowledge_projects_read_all" ON knowledge_projects;
DROP POLICY IF EXISTS "knowledge_projects_insert_admin" ON knowledge_projects;
DROP POLICY IF EXISTS "knowledge_projects_update_admin" ON knowledge_projects;
DROP POLICY IF EXISTS "knowledge_projects_delete_admin" ON knowledge_projects;

DROP POLICY IF EXISTS "strategy_rules_read_all" ON strategy_rules;
DROP POLICY IF EXISTS "strategy_rules_insert_admin" ON strategy_rules;
DROP POLICY IF EXISTS "strategy_rules_update_admin" ON strategy_rules;
DROP POLICY IF EXISTS "strategy_rules_delete_admin" ON strategy_rules;

-- 3. Cleanup is_admin function (Optional)
-- DROP FUNCTION IF EXISTS public.is_admin();

-- Note: This returns the database to a state where anyone authenticated can likely modify 
-- the tables depending on your previous settings (v1.0 had RLS mostly disabled).
