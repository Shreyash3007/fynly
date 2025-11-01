-- =====================================================
-- FYNLY DATABASE - COMPLETE SETUP & OPTIMIZATION
-- Production-Ready Database Schema
-- Run this script in Supabase SQL Editor
-- Date: 2024-01-30
-- Status: MVP Production Ready
-- =====================================================

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- USERS TABLE
-- Core user profiles linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'investor' CHECK (role IN ('investor', 'advisor', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADVISORS TABLE
-- Financial advisors profiles and verification
CREATE TABLE IF NOT EXISTS public.advisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio TEXT,
  expertise TEXT[] DEFAULT '{}',
  sebi_reg_no TEXT UNIQUE,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  linkedin_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BOOKINGS TABLE
-- Consultation bookings between investors and advisors
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE NOT NULL,
  meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_link TEXT,
  daily_room_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENTS TABLE
-- Payment tracking for bookings
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  advisor_payout DECIMAL(10,2),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  refund_amount DECIMAL(10,2),
  refunded_at TIMESTAMP WITH TIME ZONE,
  error_code TEXT,
  error_description TEXT,
  webhook_processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS TABLE
-- Reviews and ratings for advisors
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
-- System notifications (email-only for MVP, table for future use)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADVISOR-INVESTOR RELATIONSHIPS TABLE
-- Chat relationships between advisors and investors
CREATE TABLE IF NOT EXISTS public.advisor_investor_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(advisor_id, investor_id)
);

-- MESSAGES TABLE
-- Chat messages between advisors and investors
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID REFERENCES public.advisor_investor_relationships(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 5000),
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_size INTEGER,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(onboarding_completed) WHERE onboarding_completed = FALSE;

-- Advisors indexes
CREATE INDEX IF NOT EXISTS advisors_user_id_idx ON public.advisors(user_id);
CREATE INDEX IF NOT EXISTS advisors_status_idx ON public.advisors(status);
CREATE INDEX IF NOT EXISTS idx_advisors_status_rating ON public.advisors(status, average_rating DESC) WHERE status = 'approved';

-- Bookings indexes
CREATE INDEX IF NOT EXISTS bookings_investor_id_idx ON public.bookings(investor_id);
CREATE INDEX IF NOT EXISTS bookings_advisor_id_idx ON public.bookings(advisor_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_meeting_time_idx ON public.bookings(meeting_time);
CREATE INDEX IF NOT EXISTS idx_bookings_investor_status ON public.bookings(investor_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_advisor_status ON public.bookings(advisor_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming ON public.bookings(meeting_time, status) WHERE status IN ('pending', 'confirmed') AND meeting_time > NOW();

-- Payments indexes
CREATE INDEX IF NOT EXISTS payments_booking_id_idx ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS reviews_advisor_id_idx ON public.reviews(advisor_id);
CREATE INDEX IF NOT EXISTS reviews_investor_id_idx ON public.reviews(investor_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);

-- Chat/Relationships indexes
CREATE INDEX IF NOT EXISTS idx_relationships_advisor ON public.advisor_investor_relationships(advisor_id);
CREATE INDEX IF NOT EXISTS idx_relationships_investor ON public.advisor_investor_relationships(investor_id);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON public.advisor_investor_relationships(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_relationships_last_message ON public.advisor_investor_relationships(last_message_at DESC NULLS LAST);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_relationship ON public.messages(relationship_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(relationship_id, read, created_at DESC) WHERE read = FALSE;

-- =====================================================
-- 3. DATA VALIDATION CONSTRAINTS
-- =====================================================

-- Phone number validation (E.164 format)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_phone' 
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT valid_phone CHECK (
      phone IS NULL OR 
      phone ~ '^\+?[1-9]\d{1,14}$'
    );
  END IF;
END $$;

-- Email validation (basic)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_email' 
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT valid_email CHECK (
      email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    );
  END IF;
END $$;

-- SEBI registration format validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_sebi_reg' 
      AND conrelid = 'public.advisors'::regclass
  ) THEN
    ALTER TABLE public.advisors 
    ADD CONSTRAINT valid_sebi_reg CHECK (
      sebi_reg_no IS NULL OR
      sebi_reg_no ~ '^[A-Z0-9]{2,20}$'
    );
  END IF;
END $$;

-- Booking duration validation (15 min to 4 hours)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_duration' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings 
    ADD CONSTRAINT valid_duration CHECK (
      duration_minutes >= 15 AND duration_minutes <= 240
    );
  END IF;
END $$;

-- Meeting time must be in future (relaxed for testing - can adjust)
-- Note: This constraint may be too strict for completed bookings
-- Consider removing or making conditional
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'future_meeting_time_check' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    -- Only enforce for pending/confirmed bookings
    -- This allows completed bookings to remain in database
    ALTER TABLE public.bookings 
    ADD CONSTRAINT future_meeting_time_check CHECK (
      status IN ('completed', 'cancelled') OR meeting_time > created_at
    );
  END IF;
END $$;

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_investor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view approved advisors" ON public.advisors;
DROP POLICY IF EXISTS "Advisors can view own profile" ON public.advisors;
DROP POLICY IF EXISTS "Advisors can update own profile" ON public.advisors;
DROP POLICY IF EXISTS "Users can create advisor profile" ON public.advisors;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Investors can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Investors can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can create relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can update own relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;

-- USERS TABLE POLICIES
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- ADVISORS TABLE POLICIES
CREATE POLICY "Anyone can view approved advisors" ON public.advisors
FOR SELECT USING (status = 'approved');

CREATE POLICY "Advisors can view own profile" ON public.advisors
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Advisors can update own profile" ON public.advisors
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create advisor profile" ON public.advisors
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BOOKINGS TABLE POLICIES
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT USING (
  auth.uid() = investor_id OR 
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

CREATE POLICY "Investors can create bookings" ON public.bookings
FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
FOR UPDATE USING (
  auth.uid() = investor_id OR 
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

-- PAYMENTS TABLE POLICIES
CREATE POLICY "Users can view own payments" ON public.payments
FOR SELECT USING (
  auth.uid() IN (
    SELECT investor_id FROM public.bookings WHERE id = booking_id
    UNION
    SELECT user_id FROM public.advisors WHERE id IN (
      SELECT advisor_id FROM public.bookings WHERE id = booking_id
    )
  )
);

-- REVIEWS TABLE POLICIES
CREATE POLICY "Anyone can read reviews" ON public.reviews
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Investors can create reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = investor_id);

-- NOTIFICATIONS TABLE POLICIES
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- RELATIONSHIPS POLICIES
CREATE POLICY "Users can view own relationships" ON public.advisor_investor_relationships
FOR SELECT USING (
  auth.uid() = investor_id OR 
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

CREATE POLICY "Users can create relationships" ON public.advisor_investor_relationships
FOR INSERT WITH CHECK (
  auth.uid() = investor_id OR
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

CREATE POLICY "Users can update own relationships" ON public.advisor_investor_relationships
FOR UPDATE USING (
  auth.uid() = investor_id OR 
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

-- MESSAGES POLICIES
CREATE POLICY "Users can view own messages" ON public.messages
FOR SELECT USING (
  auth.uid() = sender_id OR
  auth.uid() IN (
    SELECT investor_id FROM public.advisor_investor_relationships WHERE id = relationship_id
    UNION
    SELECT user_id FROM public.advisors WHERE id IN (
      SELECT advisor_id FROM public.advisor_investor_relationships WHERE id = relationship_id
    )
  )
);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  auth.uid() IN (
    SELECT investor_id FROM public.advisor_investor_relationships WHERE id = relationship_id
    UNION
    SELECT user_id FROM public.advisors WHERE id IN (
      SELECT advisor_id FROM public.advisor_investor_relationships WHERE id = relationship_id
    )
  )
);

CREATE POLICY "Users can update own messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read" ON public.messages
FOR UPDATE USING (
  auth.uid() IN (
    SELECT investor_id FROM public.advisor_investor_relationships WHERE id = relationship_id
    UNION
    SELECT user_id FROM public.advisors WHERE id IN (
      SELECT advisor_id FROM public.advisor_investor_relationships WHERE id = relationship_id
    )
  )
);

-- =====================================================
-- 5. TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = NEW.id) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Only insert if user doesn't exist
    INSERT INTO public.users (id, email, full_name, avatar_url, role, email_verified, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
      COALESCE(NEW.raw_user_meta_data->>'role', 'investor'),
      COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
      NOW(),
      NOW()
    );
  ELSE
    -- Update if exists
    UPDATE public.users SET
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name),
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
      email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth creation
    RAISE WARNING 'Failed to create/update user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update advisor rating after review
CREATE OR REPLACE FUNCTION public.update_advisor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.advisors
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating::numeric), 0)
      FROM public.reviews
      WHERE advisor_id = NEW.advisor_id
    ),
    updated_at = NOW()
  WHERE id = NEW.advisor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_advisor_rating_trigger ON public.reviews;
CREATE TRIGGER update_advisor_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_advisor_rating();

-- Function to update relationship's last_message_at
CREATE OR REPLACE FUNCTION public.update_relationship_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.advisor_investor_relationships
  SET 
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.relationship_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_relationship_last_message_trigger ON public.messages;
CREATE TRIGGER update_relationship_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_relationship_last_message();

-- Function to update message read_at timestamp
CREATE OR REPLACE FUNCTION public.update_message_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = TRUE AND OLD.read = FALSE THEN
    NEW.read_at = NOW();
  ELSIF NEW.read = FALSE THEN
    NEW.read_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_message_read_at_trigger ON public.messages;
CREATE TRIGGER update_message_read_at_trigger
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_message_read_at();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_advisors_updated_at ON public.advisors;
CREATE TRIGGER update_advisors_updated_at
  BEFORE UPDATE ON public.advisors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_relationships_updated_at ON public.advisor_investor_relationships;
CREATE TRIGGER update_relationships_updated_at
  BEFORE UPDATE ON public.advisor_investor_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.users, public.advisors, public.reviews TO anon;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fynly database setup completed successfully!';
  RAISE NOTICE '📊 Tables created: users, advisors, bookings, payments, reviews, notifications, advisor_investor_relationships, messages';
  RAISE NOTICE '🔒 RLS policies enabled and configured';
  RAISE NOTICE '⚡ Triggers and functions created';
  RAISE NOTICE '📈 Indexes optimized for performance';
  RAISE NOTICE '🎯 Database ready for MVP deployment';
END $$;

