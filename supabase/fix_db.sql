-- ==========================================
-- Fix 406 Errors & Remaining RLS Issues
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Disable RLS on tables where it might block prototyping queries
ALTER TABLE IF EXISTS analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS strategy_rules DISABLE ROW LEVEL SECURITY;

-- Note: This ensures that even if auth.uid() doesn't match 
-- (which can happen during data migration or rollbacks),
-- the application can still read/write project and analysis data.

-- Confirm tables exist and columns are correct for v1.0
-- (schema.sql should have been applied already)
