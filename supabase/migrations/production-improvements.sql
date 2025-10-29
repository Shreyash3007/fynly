-- =====================================================
-- FYNLY PRODUCTION IMPROVEMENTS
-- Run this after the initial setup-database.sql
-- =====================================================

-- =====================================================
-- 1. ADD MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_investor_status 
ON public.bookings(investor_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_advisor_status 
ON public.bookings(advisor_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_meeting_date_status 
ON public.bookings(meeting_date, status) 
WHERE status IN ('pending', 'confirmed');

-- Index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding 
ON public.users(onboarding_completed) 
WHERE onboarding_completed = FALSE;

-- Index for advisor search
CREATE INDEX IF NOT EXISTS idx_advisors_status_rating 
ON public.advisors(status, average_rating DESC) 
WHERE status = 'approved';

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications(user_id, read, created_at DESC);

-- =====================================================
-- 2. ADD DATA VALIDATION CONSTRAINTS
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
      sebi_reg_no ~ '^IN[A-Z]{1}[0-9]{9}$'
    );
  END IF;
END $$;

-- Hourly rate validation (reasonable range)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_hourly_rate' 
      AND conrelid = 'public.advisors'::regclass
  ) THEN
    ALTER TABLE public.advisors 
    ADD CONSTRAINT valid_hourly_rate CHECK (
      hourly_rate >= 500 AND hourly_rate <= 50000
    );
  END IF;
END $$;

-- Years of experience validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_years_experience' 
      AND conrelid = 'public.advisors'::regclass
  ) THEN
    ALTER TABLE public.advisors 
    ADD CONSTRAINT valid_years_experience CHECK (
      years_experience >= 0 AND years_experience <= 60
    );
  END IF;
END $$;

-- Rating validation
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_rating_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_rating' 
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews 
    ADD CONSTRAINT valid_rating CHECK (
      rating >= 1 AND rating <= 5
    );
  END IF;
END $$;

-- Booking duration validation
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

-- Meeting date must be in future
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'future_meeting_date' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings 
    ADD CONSTRAINT future_meeting_date CHECK (
      meeting_date > NOW()
    );
  END IF;
END $$;

-- =====================================================
-- 3. CREATE ADVISOR AVAILABILITY SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.advisor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(advisor_id, day_of_week, start_time),
  CHECK (end_time > start_time)
);

-- Indexes for availability
CREATE INDEX IF NOT EXISTS idx_advisor_availability_advisor 
ON public.advisor_availability(advisor_id) 
WHERE is_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_advisor_availability_day 
ON public.advisor_availability(day_of_week);

-- RLS for availability
ALTER TABLE public.advisor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability" ON public.advisor_availability
FOR SELECT USING (true);

CREATE POLICY "Advisors can manage own availability" ON public.advisor_availability
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_advisor_availability_updated_at
  BEFORE UPDATE ON public.advisor_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 4. CREATE AUDIT LOG SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
ON public.audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created 
ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON public.audit_logs(action);

-- RLS for audit logs (admin only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 5. CREATE RATE LIMITING SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  action TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON public.rate_limits(user_id, action, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action 
ON public.rate_limits(ip_address, action, window_start);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_attempts INTEGER;
BEGIN
  -- Count attempts in current window
  SELECT COALESCE(SUM(attempts), 0) INTO v_attempts
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND action = p_action
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- If under limit, increment counter
  IF v_attempts < p_max_attempts THEN
    -- Record attempt (no upsert to avoid unique index requirement)
    INSERT INTO public.rate_limits (user_id, action, attempts, window_start)
    VALUES (p_user_id, p_action, 1, NOW());
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old rate limit records (run daily)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. ADD SOFT DELETE FUNCTIONALITY
-- =====================================================

-- Add deleted_at column to key tables
ALTER TABLE public.advisors 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Indexes for soft deleted records
CREATE INDEX IF NOT EXISTS idx_advisors_not_deleted 
ON public.advisors(id) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_not_deleted 
ON public.bookings(id) 
WHERE deleted_at IS NULL;

-- Update RLS policies to exclude soft-deleted records
DROP POLICY IF EXISTS "Anyone can view approved advisors" ON public.advisors;
CREATE POLICY "Anyone can view approved advisors" ON public.advisors
FOR SELECT USING (status = 'approved' AND deleted_at IS NULL);

-- =====================================================
-- 7. ADD BOOKING CONFLICT PREVENTION
-- =====================================================

-- Function to check for booking conflicts
CREATE OR REPLACE FUNCTION public.check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE advisor_id = NEW.advisor_id
      AND status IN ('pending', 'confirmed')
      AND deleted_at IS NULL
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND (
        -- Check for time overlap
        (meeting_date <= NEW.meeting_date AND 
         meeting_date + (duration_minutes || ' minutes')::INTERVAL > NEW.meeting_date)
        OR
        (NEW.meeting_date <= meeting_date AND 
         NEW.meeting_date + (NEW.duration_minutes || ' minutes')::INTERVAL > meeting_date)
      )
  ) THEN
    RAISE EXCEPTION 'Booking conflict: Advisor is not available at this time';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent booking conflicts
DROP TRIGGER IF EXISTS check_booking_conflict_trigger ON public.bookings;
CREATE TRIGGER check_booking_conflict_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_booking_conflict();

-- =====================================================
-- 8. ADD ANALYTICS VIEWS
-- =====================================================

-- View for advisor statistics
CREATE OR REPLACE VIEW public.advisor_stats AS
SELECT 
  a.id,
  a.user_id,
  u.full_name,
  u.email,
  a.status,
  a.total_bookings,
  a.total_revenue,
  a.average_rating,
  COUNT(DISTINCT b.id) as actual_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled_bookings,
  COUNT(DISTINCT r.id) as total_reviews,
  COALESCE(AVG(r.rating), 0) as calculated_rating
FROM public.advisors a
LEFT JOIN public.users u ON a.user_id = u.id
LEFT JOIN public.bookings b ON a.id = b.advisor_id AND b.deleted_at IS NULL
LEFT JOIN public.reviews r ON a.id = r.advisor_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.user_id, u.full_name, u.email, a.status, 
         a.total_bookings, a.total_revenue, a.average_rating;

-- View for platform statistics
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT 
  COUNT(DISTINCT CASE WHEN role = 'investor' THEN id END) as total_investors,
  COUNT(DISTINCT CASE WHEN role = 'advisor' THEN id END) as total_advisors,
  COUNT(DISTINCT CASE WHEN role = 'investor' AND email_verified = TRUE THEN id END) as verified_investors,
  COUNT(DISTINCT CASE WHEN role = 'advisor' AND email_verified = TRUE THEN id END) as verified_advisors,
  COUNT(DISTINCT CASE WHEN onboarding_completed = TRUE THEN id END) as onboarded_users,
  COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN id END) as new_users_week,
  COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN id END) as new_users_month
FROM public.users;

-- =====================================================
-- 9. ADD NOTIFICATION TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO public.notification_templates (name, type, title_template, message_template) VALUES
('booking_confirmed', 'booking', 'Booking Confirmed', 'Your consultation with {advisor_name} is confirmed for {meeting_date}'),
('booking_cancelled', 'booking', 'Booking Cancelled', 'Your consultation with {advisor_name} has been cancelled'),
('booking_reminder', 'booking', 'Upcoming Consultation', 'Reminder: Your consultation with {advisor_name} is in 24 hours'),
('review_request', 'review', 'How was your consultation?', 'Please rate your experience with {advisor_name}'),
('advisor_approved', 'advisor', 'Welcome to Fynly!', 'Your advisor profile has been approved. You can now start accepting bookings'),
('advisor_rejected', 'advisor', 'Profile Update Required', 'Your advisor application needs additional information'),
('payment_success', 'payment', 'Payment Successful', 'Your payment of ₹{amount} was processed successfully'),
('payment_failed', 'payment', 'Payment Failed', 'Your payment of ₹{amount} could not be processed')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.advisor_availability TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.rate_limits TO authenticated;
GRANT SELECT ON public.advisor_stats TO authenticated;
GRANT SELECT ON public.platform_stats TO authenticated;
GRANT SELECT ON public.notification_templates TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Production improvements applied successfully!';
  RAISE NOTICE '📊 New features:';
  RAISE NOTICE '   - Performance indexes added';
  RAISE NOTICE '   - Data validation constraints';
  RAISE NOTICE '   - Advisor availability system';
  RAISE NOTICE '   - Audit logging';
  RAISE NOTICE '   - Rate limiting';
  RAISE NOTICE '   - Soft delete support';
  RAISE NOTICE '   - Booking conflict prevention';
  RAISE NOTICE '   - Analytics views';
  RAISE NOTICE '   - Notification templates';
  RAISE NOTICE '🎯 Your database is now production-ready!';
END $$;

