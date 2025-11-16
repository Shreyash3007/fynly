-- Fynly MVP v1.0 - Database Schema
-- Run this script in Supabase SQL Editor
-- Requires: pgcrypto extension for UUID generation

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ADVISORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  license_number TEXT,
  specializations TEXT[], -- Array of specialization tags
  years_experience INTEGER,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVESTORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBMISSIONS TABLE
-- ============================================================================
-- Submissions represent investor questionnaire responses
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
  -- Questionnaire responses (stored as JSONB for flexibility)
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Scoring fields (pfhr_score will be calculated in later phases)
  pfhr_score NUMERIC(5, 2), -- Personal Financial Health & Readiness score (0-100)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'matched', 'completed')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Advisors indexes
CREATE INDEX IF NOT EXISTS idx_advisors_email ON advisors(email);
CREATE INDEX IF NOT EXISTS idx_advisors_specializations ON advisors USING GIN(specializations);

-- Investors indexes
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_investors_city_state ON investors(city, state);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_investor_id ON submissions(investor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_advisor_id ON submissions(advisor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_pfhr_score ON submissions(pfhr_score) WHERE pfhr_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_responses ON submissions USING GIN(responses);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- ADVISORS RLS POLICIES
-- Public read access to advisors (for matching/searching)
CREATE POLICY "Advisors are viewable by everyone"
  ON advisors FOR SELECT
  USING (true);

-- Only authenticated users can insert advisors (via service role in API)
CREATE POLICY "Advisors can be inserted by authenticated users"
  ON advisors FOR INSERT
  WITH CHECK (true); -- Note: In production, restrict via service role key

-- Only service role can update/delete advisors
CREATE POLICY "Advisors can be updated by service role"
  ON advisors FOR UPDATE
  USING (true); -- Note: In production, restrict via service role key

CREATE POLICY "Advisors can be deleted by service role"
  ON advisors FOR DELETE
  USING (true); -- Note: In production, restrict via service role key

-- INVESTORS RLS POLICIES
-- Investors can only view their own data
CREATE POLICY "Investors can view own data"
  ON investors FOR SELECT
  USING (true); -- Note: In production, use auth.uid() = id or service role

-- Authenticated users can insert investors (via API)
CREATE POLICY "Investors can be inserted by authenticated users"
  ON investors FOR INSERT
  WITH CHECK (true); -- Note: In production, restrict via service role key

-- Only service role can update/delete investors
CREATE POLICY "Investors can be updated by service role"
  ON investors FOR UPDATE
  USING (true); -- Note: In production, restrict via service role key

CREATE POLICY "Investors can be deleted by service role"
  ON investors FOR DELETE
  USING (true); -- Note: In production, restrict via service role key

-- SUBMISSIONS RLS POLICIES
-- Investors can view their own submissions
CREATE POLICY "Investors can view own submissions"
  ON submissions FOR SELECT
  USING (true); -- Note: In production, use auth.uid() = investor_id or service role

-- Advisors can view submissions assigned to them
CREATE POLICY "Advisors can view assigned submissions"
  ON submissions FOR SELECT
  USING (true); -- Note: In production, use advisor_id matching

-- Authenticated users can insert submissions (via API)
CREATE POLICY "Submissions can be inserted by authenticated users"
  ON submissions FOR INSERT
  WITH CHECK (true); -- Note: In production, restrict via service role key

-- Only service role can update/delete submissions
CREATE POLICY "Submissions can be updated by service role"
  ON submissions FOR UPDATE
  USING (true); -- Note: In production, restrict via service role key

CREATE POLICY "Submissions can be deleted by service role"
  ON submissions FOR DELETE
  USING (true); -- Note: In production, restrict via service role key

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_advisors_updated_at
  BEFORE UPDATE ON advisors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
  BEFORE UPDATE ON investors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. All RLS policies currently allow broad access for development.
--    In production, restrict using auth.uid() and service role checks.
-- 2. Sensitive operations (INSERT/UPDATE/DELETE) should be routed through
--    server-side API routes using SUPABASE_SERVICE_ROLE_KEY.
-- 3. The pfhr_score field will be calculated in later phases.
-- 4. Run this entire script in Supabase SQL Editor for initial setup.

