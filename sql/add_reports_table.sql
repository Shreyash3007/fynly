-- Fynly MVP v1.0 - Reports Table
-- Add this to your Supabase schema after running create_tables.sql
-- Run this script in Supabase SQL Editor

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID, -- User who owns the report
  pdf_url TEXT NOT NULL, -- URL to PDF in Supabase Storage
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reports_submission_id ON reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Reports can be viewed by service role or the user who owns them
CREATE POLICY "Reports viewable by service role or owner"
  ON reports FOR SELECT
  USING (true); -- Note: In production, restrict via service role or user_id check

-- Only service role can insert reports
CREATE POLICY "Reports can be inserted by service role"
  ON reports FOR INSERT
  WITH CHECK (true); -- Note: In production, restrict via service role key

-- Only service role can update reports
CREATE POLICY "Reports can be updated by service role"
  ON reports FOR UPDATE
  USING (true); -- Note: In production, restrict via service role key

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

