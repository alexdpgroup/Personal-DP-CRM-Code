-- Migration: Add stage column to lp_commitments table
-- This allows each individual commitment to have its own stage,
-- since an LP may be at different stages for different funds.
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Add stage column with default 'outreach'
ALTER TABLE lp_commitments ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'outreach';

-- Backfill: copy each LP's current stage to all their existing commitments
UPDATE lp_commitments c
SET stage = COALESCE(l.stage, 'outreach')
FROM lps l
WHERE c.lp_id = l.id
  AND c.stage = 'outreach'
  AND l.stage IS NOT NULL
  AND l.stage != 'outreach';
