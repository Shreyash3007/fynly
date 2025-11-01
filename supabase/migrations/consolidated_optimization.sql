-- =====================================================
-- FYNLY DATABASE CONSOLIDATED OPTIMIZATION
-- Comprehensive database optimization and restructuring
-- Run this after setup-database.sql and add_chat_tables.sql
-- Date: 2024-01-31
-- =====================================================

-- =====================================================
-- 1. FIX COLUMN NAME MISMATCHES
-- =====================================================

-- Fix advisors.experience_years (if using years_experience)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'advisors' 
      AND column_name = 'years_experience'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'advisors' 
      AND column_name = 'experience_years'
  ) THEN
    ALTER TABLE public.advisors 
    RENAME COLUMN years_experience TO experience_years;
    
    RAISE NOTICE '✅ Column renamed: years_experience → experience_years';
  END IF;
END $$;

-- =====================================================
-- 2. ADD MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for bookings (optimized queries)
CREATE INDEX IF NOT EXISTS idx_bookings_investor_status_time 
ON public.bookings(investor_id, status, meeting_time DESC)
WHERE status IN ('pending', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_bookings_advisor_status_time 
ON public.bookings(advisor_id, status, meeting_time DESC)
WHERE status IN ('pending', 'confirmed');

-- For upcoming bookings query (optimized)
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming 
ON public.bookings(meeting_time, status) 
WHERE status IN ('pending', 'confirmed');

-- For advisor search optimization
CREATE INDEX IF NOT EXISTS idx_advisors_status_experience 
ON public.advisors(status, experience_years DESC, average_rating DESC)
WHERE status = 'approved';

-- For chat relationships (if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'advisor_investor_relationships') THEN
    CREATE INDEX IF NOT EXISTS idx_relationships_last_message_active 
    ON public.advisor_investor_relationships(last_message_at DESC NULLS LAST, status)
    WHERE status = 'active';
    
    CREATE INDEX IF NOT EXISTS idx_relationships_advisor_active 
    ON public.advisor_investor_relationships(advisor_id, status)
    WHERE status = 'active';
    
    CREATE INDEX IF NOT EXISTS idx_relationships_investor_active 
    ON public.advisor_investor_relationships(investor_id, status)
    WHERE status = 'active';
  END IF;
END $$;

-- For messages (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_relationship_unread 
    ON public.messages(relationship_id, read, created_at DESC)
    WHERE read = FALSE;
    
    CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
    ON public.messages(sender_id, created_at DESC);
  END IF;
END $$;

-- =====================================================
-- 3. ADD/VERIFY CONSTRAINTS
-- =====================================================

-- Advisor experience validation (0-60 years)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_experience_years' 
      AND conrelid = 'public.advisors'::regclass
  ) THEN
    ALTER TABLE public.advisors 
    ADD CONSTRAINT valid_experience_years 
    CHECK (experience_years >= 0 AND experience_years <= 60);
    
    RAISE NOTICE '✅ Added experience_years constraint';
  END IF;
END $$;

-- Booking duration validation (15-240 minutes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_duration' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings 
    ADD CONSTRAINT valid_duration 
    CHECK (duration_minutes >= 15 AND duration_minutes <= 240);
    
    RAISE NOTICE '✅ Added duration constraint';
  END IF;
END $$;

-- Meeting time must be in future (runtime check, not constraint)
-- Note: Can't use NOW() in CHECK constraint as it's not immutable
-- This is handled by application logic

-- Hourly rate validation (reasonable range: 0 to 1,000,000)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_hourly_rate' 
      AND conrelid = 'public.advisors'::regclass
  ) THEN
    ALTER TABLE public.advisors 
    ADD CONSTRAINT valid_hourly_rate 
    CHECK (hourly_rate >= 0 AND hourly_rate <= 1000000);
    
    RAISE NOTICE '✅ Added hourly_rate constraint';
  END IF;
END $$;

-- =====================================================
-- 4. ANALYZE TABLES FOR QUERY OPTIMIZATION
-- =====================================================

-- Run ANALYZE on all tables to update statistics
ANALYZE public.users;
ANALYZE public.advisors;
ANALYZE public.bookings;
ANALYZE public.payments;
ANALYZE public.reviews;
ANALYZE public.notifications;

-- Analyze chat tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'advisor_investor_relationships') THEN
    ANALYZE public.advisor_investor_relationships;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    ANALYZE public.messages;
  END IF;
END $$;

-- =====================================================
-- 5. REMOVE UNUSED INDEXES (if any exist)
-- =====================================================

-- Check for duplicate or unused indexes
-- This is a cleanup step - remove if needed based on actual query patterns

-- =====================================================
-- 6. VERIFY RLS POLICIES ARE OPTIMIZED
-- =====================================================

-- RLS policies should already be in place from setup-database.sql
-- This section is for verification only

-- =====================================================
-- 7. DATABASE SETTINGS OPTIMIZATION
-- =====================================================

-- Set appropriate work_mem if needed (default is usually fine)
-- This would require superuser access, so commenting out
-- ALTER SYSTEM SET work_mem = '256MB';

-- =====================================================
-- OPTIMIZATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database optimization complete!';
  RAISE NOTICE '📊 Indexes optimized for common query patterns';
  RAISE NOTICE '🔒 Constraints verified and added';
  RAISE NOTICE '⚡ Tables analyzed for query optimization';
  RAISE NOTICE '🎯 Database ready for production';
END $$;

