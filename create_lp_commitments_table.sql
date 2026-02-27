-- Migration: Create lp_commitments table for persisting LP fund commitments
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS lp_commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lp_id UUID NOT NULL REFERENCES lps(id) ON DELETE CASCADE,
  fund TEXT NOT NULL DEFAULT '',
  commitment NUMERIC NOT NULL DEFAULT 0,
  funded NUMERIC NOT NULL DEFAULT 0,
  nav NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE lp_commitments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (matches existing RLS pattern)
CREATE POLICY "Allow all for authenticated users" ON lp_commitments
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookups by LP
CREATE INDEX IF NOT EXISTS idx_lp_commitments_lp_id ON lp_commitments(lp_id);
