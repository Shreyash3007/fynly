-- Fynly Database Schema Migration
-- Description: Initial schema with users, advisors, bookings, payments, reviews, admin_actions, and events
-- Author: DeveloperGPT
-- Date: 2024-01-01

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('investor', 'advisor', 'admin');

-- Advisor status enum
CREATE TYPE advisor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Expertise areas enum
CREATE TYPE expertise_area AS ENUM (
  'mutual_funds',
  'stocks',
  'tax_planning',
  'retirement_planning',
  'insurance',
  'real_estate',
  'portfolio_management',
  'debt_management',
  'wealth_management'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'investor',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advisors table
CREATE TABLE public.advisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  experience_years INTEGER,
  sebi_reg_no TEXT,
  linkedin_url TEXT,
  expertise expertise_area[] NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate >= 0),
  photo_url TEXT,
  status advisor_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  average_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  meeting_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_link TEXT,
  daily_room_name TEXT,
  notes TEXT,
  status booking_status DEFAULT 'pending',
  investor_joined_at TIMESTAMPTZ,
  advisor_joined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (meeting_time > created_at)
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'INR',
  status payment_status DEFAULT 'pending',
  advisor_payout DECIMAL(10,2),
  platform_commission DECIMAL(10,2),
  commission_percentage DECIMAL(5,2) DEFAULT 10.0,
  refund_amount DECIMAL(10,2),
  refunded_at TIMESTAMPTZ,
  payment_method TEXT,
  error_code TEXT,
  error_description TEXT,
  webhook_processed_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin actions table (audit log)
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (analytics tracking)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Consent logs (GDPR compliance)
CREATE TABLE public.consent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'data_processing', 'call_recording', 'marketing'
  consent_given BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Advisors indexes
CREATE INDEX idx_advisors_user_id ON public.advisors(user_id);
CREATE INDEX idx_advisors_status ON public.advisors(status);
CREATE INDEX idx_advisors_rating ON public.advisors(average_rating DESC);
CREATE INDEX idx_advisors_expertise ON public.advisors USING GIN(expertise);
CREATE INDEX idx_advisors_hourly_rate ON public.advisors(hourly_rate);

-- Bookings indexes
CREATE INDEX idx_bookings_investor_id ON public.bookings(investor_id);
CREATE INDEX idx_bookings_advisor_id ON public.bookings(advisor_id);
CREATE INDEX idx_bookings_meeting_time ON public.bookings(meeting_time);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_advisor_id ON public.reviews(advisor_id);
CREATE INDEX idx_reviews_investor_id ON public.reviews(investor_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Events indexes
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_event_name ON public.events(event_name);
CREATE INDEX idx_events_timestamp ON public.events(timestamp DESC);
CREATE INDEX idx_events_properties ON public.events USING GIN(properties);

-- Admin actions indexes
CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX idx_admin_actions_target ON public.admin_actions(target_id, target_type);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON public.advisors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update advisor rating trigger
CREATE OR REPLACE FUNCTION update_advisor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.advisors
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.0)
      FROM public.reviews
      WHERE advisor_id = NEW.advisor_id AND is_visible = TRUE
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE advisor_id = NEW.advisor_id AND is_visible = TRUE
    )
  WHERE id = NEW.advisor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_advisor_rating_on_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_advisor_rating();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate Bayesian weighted average for advisor ratings
CREATE OR REPLACE FUNCTION calculate_bayesian_rating(
  advisor_id_param UUID,
  global_avg DECIMAL DEFAULT 3.5,
  min_reviews INTEGER DEFAULT 5
) RETURNS DECIMAL AS $$
DECLARE
  advisor_avg DECIMAL;
  advisor_count INTEGER;
  bayesian_avg DECIMAL;
BEGIN
  SELECT average_rating, total_reviews
  INTO advisor_avg, advisor_count
  FROM public.advisors
  WHERE id = advisor_id_param;
  
  -- Bayesian average formula: (C * m + R * v) / (C + v)
  -- C = minimum reviews threshold, m = global average, R = advisor average, v = advisor review count
  bayesian_avg := (min_reviews * global_avg + advisor_count * advisor_avg) / (min_reviews + advisor_count);
  
  RETURN bayesian_avg;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can book advisor
CREATE OR REPLACE FUNCTION can_book_advisor(
  investor_id_param UUID,
  advisor_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
  advisor_user_id UUID;
  advisor_active BOOLEAN;
  has_pending_booking BOOLEAN;
BEGIN
  -- Get advisor user_id and check if approved
  SELECT user_id, (status = 'approved')
  INTO advisor_user_id, advisor_active
  FROM public.advisors
  WHERE id = advisor_id_param;
  
  -- Investors cannot book themselves
  IF investor_id_param = advisor_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Advisor must be approved
  IF NOT advisor_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check for pending bookings
  SELECT EXISTS(
    SELECT 1 FROM public.bookings
    WHERE investor_id = investor_id_param
    AND advisor_id = advisor_id_param
    AND status IN ('pending', 'confirmed')
    AND meeting_time > NOW()
  ) INTO has_pending_booking;
  
  RETURN NOT has_pending_booking;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'Extended user profile table linked to Supabase Auth';
COMMENT ON TABLE public.advisors IS 'Financial advisor profiles with verification status';
COMMENT ON TABLE public.bookings IS 'Meeting bookings between investors and advisors';
COMMENT ON TABLE public.payments IS 'Payment transactions via Razorpay';
COMMENT ON TABLE public.reviews IS 'Investor reviews for completed consultations';
COMMENT ON TABLE public.admin_actions IS 'Audit log for admin activities';
COMMENT ON TABLE public.events IS 'Analytics event tracking for user behavior';
COMMENT ON TABLE public.consent_logs IS 'GDPR compliance consent tracking';

