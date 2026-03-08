-- Add exited column to portfolio_companies table
-- Exited companies display DPI instead of MOIC
ALTER TABLE portfolio_companies ADD COLUMN IF NOT EXISTS exited BOOLEAN DEFAULT false;
