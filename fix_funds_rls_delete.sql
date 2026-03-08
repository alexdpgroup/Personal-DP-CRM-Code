-- Migration: Add DELETE policy to funds table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This fixes the issue where funds cannot be deleted due to missing RLS policy

-- Add a policy that allows authenticated users to delete funds
CREATE POLICY "Allow delete for authenticated users" ON funds
  FOR DELETE USING (true);

-- Also ensure the lps table allows deletes (for cleaning up related records)
CREATE POLICY "Allow delete for authenticated users" ON lps
  FOR DELETE USING (true);
