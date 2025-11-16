-- Fynly MVP v1.0 - Payments Table
-- Add this to your Supabase schema after running create_tables.sql
-- Run this script in Supabase SQL Editor

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL, -- Amount in paise (smallest currency unit)
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  user_id UUID, -- User who initiated the payment
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_payments_submission_id ON payments(submission_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Payments can be viewed by service role or the user who created them
CREATE POLICY "Payments viewable by service role or owner"
  ON payments FOR SELECT
  USING (true); -- Note: In production, restrict via service role or user_id check

-- Only service role can insert payments
CREATE POLICY "Payments can be inserted by service role"
  ON payments FOR INSERT
  WITH CHECK (true); -- Note: In production, restrict via service role key

-- Only service role can update payments
CREATE POLICY "Payments can be updated by service role"
  ON payments FOR UPDATE
  USING (true); -- Note: In production, restrict via service role key

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

