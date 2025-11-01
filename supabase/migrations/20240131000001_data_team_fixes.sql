-- =====================================================
-- DATA TEAM COMPREHENSIVE FIXES
-- Run this migration to apply all data team fixes
-- Date: 2024-01-31
-- Team: DataGPT (Principal Data Architect)
-- =====================================================

-- =====================================================
-- 1. FIX MEETING_TIME COLUMN (if needed)
-- =====================================================

-- Rename column to match code usage (idempotent)
DO $$
BEGIN
  -- Check if meeting_date exists and meeting_time doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'meeting_date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'meeting_time'
  ) THEN
    -- Rename the column
    ALTER TABLE public.bookings 
    RENAME COLUMN meeting_date TO meeting_time;
    
    RAISE NOTICE '✅ Column renamed: meeting_date → meeting_time';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'meeting_time'
  ) THEN
    RAISE NOTICE '✅ Column already named meeting_time';
  END IF;
END $$;

-- Update index name if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'bookings' 
      AND indexname = 'bookings_meeting_date_idx'
  ) THEN
    ALTER INDEX public.bookings_meeting_date_idx 
    RENAME TO bookings_meeting_time_idx;
    
    RAISE NOTICE '✅ Index renamed: bookings_meeting_date_idx → bookings_meeting_time_idx';
  END IF;
END $$;

-- =====================================================
-- 2. ENSURE CHAT TABLES EXIST (if not already created)
-- =====================================================

-- Advisor-Investor Relationships Table
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

-- Messages Table
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
-- 3. ADD OPTIMIZED INDEXES FOR CHAT
-- =====================================================

-- Relationships indexes
CREATE INDEX IF NOT EXISTS idx_relationships_advisor 
ON public.advisor_investor_relationships(advisor_id);

CREATE INDEX IF NOT EXISTS idx_relationships_investor 
ON public.advisor_investor_relationships(investor_id);

CREATE INDEX IF NOT EXISTS idx_relationships_status 
ON public.advisor_investor_relationships(status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_relationships_last_message 
ON public.advisor_investor_relationships(last_message_at DESC NULLS LAST);

-- Messages indexes (optimized)
CREATE INDEX IF NOT EXISTS idx_messages_relationship_created 
ON public.messages(relationship_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_unread_count
ON public.messages(relationship_id, read) 
WHERE read = FALSE;

-- =====================================================
-- 4. ADD OPTIMIZED INDEXES FOR BOOKINGS
-- =====================================================

-- For upcoming bookings query (high performance)
-- Note: Cannot use NOW() in index predicate (not IMMUTABLE)
-- Query will filter by meeting_time > NOW() at runtime
-- This index optimizes queries for pending/confirmed bookings by meeting_time
CREATE INDEX IF NOT EXISTS idx_bookings_meeting_time_status 
ON public.bookings(meeting_time, status) 
WHERE status IN ('pending', 'confirmed');

-- =====================================================
-- 5. ADD DATABASE CONSTRAINTS
-- =====================================================

-- Booking duration validation (15-240 minutes)
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
    RAISE NOTICE '✅ Added duration constraint (15-240 minutes)';
  END IF;
END $$;

-- Meeting time must be in future
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'future_meeting_time' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings 
    ADD CONSTRAINT future_meeting_time CHECK (
      meeting_time > NOW()
    );
    RAISE NOTICE '✅ Added future meeting_time constraint';
  END IF;
END $$;

-- =====================================================
-- 6. ENABLE RLS ON CHAT TABLES (if not enabled)
-- =====================================================

ALTER TABLE public.advisor_investor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CHAT TABLE RLS POLICIES (if not exist)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can create relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can update own relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;

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
-- 8. CHAT TABLE TRIGGERS (if not exist)
-- =====================================================

-- Update relationship's last_message_at when message is sent
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

-- Update message read_at timestamp
CREATE OR REPLACE FUNCTION public.update_message_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = TRUE AND (OLD.read IS NULL OR OLD.read = FALSE) THEN
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

-- Update timestamps
DROP TRIGGER IF EXISTS update_relationships_updated_at ON public.advisor_investor_relationships;
CREATE TRIGGER update_relationships_updated_at
  BEFORE UPDATE ON public.advisor_investor_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON public.advisor_investor_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- =====================================================
-- 10. VERIFICATION AND COMPLETION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Data Team fixes applied successfully!';
  RAISE NOTICE '📊 Changes applied:';
  RAISE NOTICE '   - Fixed meeting_time column name consistency';
  RAISE NOTICE '   - Created/verified chat tables (relationships, messages)';
  RAISE NOTICE '   - Added optimized indexes for chat queries';
  RAISE NOTICE '   - Added optimized indexes for booking queries';
  RAISE NOTICE '   - Added database constraints (duration, future meeting time)';
  RAISE NOTICE '   - Enabled RLS and created policies for chat tables';
  RAISE NOTICE '   - Created triggers for chat functionality';
  RAISE NOTICE '🎯 Database is now ready for Backend Team chat API implementation!';
END $$;

