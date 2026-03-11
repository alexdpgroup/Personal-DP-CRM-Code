-- Migration: Create managers and manager_lps tables for Manager Mode
-- Run this in your Supabase SQL editor

-- Managers table: each manager is a money manager entity
CREATE TABLE IF NOT EXISTS managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  firm TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Manager-LP link table: maps LPs to their manager
CREATE TABLE IF NOT EXISTS manager_lps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  lp_id UUID NOT NULL REFERENCES lps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manager_id, lp_id)
);

-- Enable RLS
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_lps ENABLE ROW LEVEL SECURITY;

-- RLS policies for managers
CREATE POLICY "Allow all select on managers" ON managers FOR SELECT USING (true);
CREATE POLICY "Allow all insert on managers" ON managers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on managers" ON managers FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on managers" ON managers FOR DELETE USING (true);

-- RLS policies for manager_lps
CREATE POLICY "Allow all select on manager_lps" ON manager_lps FOR SELECT USING (true);
CREATE POLICY "Allow all insert on manager_lps" ON manager_lps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on manager_lps" ON manager_lps FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on manager_lps" ON manager_lps FOR DELETE USING (true);
