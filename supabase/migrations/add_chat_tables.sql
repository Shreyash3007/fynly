-- =====================================================
-- CHAT SYSTEM TABLES FOR MVP
-- Required for essential chat functionality
-- =====================================================

-- 1. ADVISOR-INVESTOR RELATIONSHIPS TABLE
-- Tracks chat relationships between advisors and investors
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

-- 2. MESSAGES TABLE
-- Stores chat messages between advisors and investors
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID REFERENCES public.advisor_investor_relationships(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 5000),
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_size INTEGER, -- in bytes
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
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

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_relationship 
ON public.messages(relationship_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON public.messages(sender_id);

-- For unread message counts (optimized)
CREATE INDEX IF NOT EXISTS idx_messages_unread_count
ON public.messages(relationship_id, read) 
WHERE read = FALSE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.advisor_investor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can create relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can update own relationships" ON public.advisor_investor_relationships;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;

-- RELATIONSHIPS POLICIES
-- Users can view relationships they're part of
CREATE POLICY "Users can view own relationships" ON public.advisor_investor_relationships
FOR SELECT USING (
  auth.uid() = investor_id OR 
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

-- Users can create relationships (investors initiate with advisors)
CREATE POLICY "Users can create relationships" ON public.advisor_investor_relationships
FOR INSERT WITH CHECK (
  auth.uid() = investor_id OR
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

-- Users can update their own relationships
CREATE POLICY "Users can update own relationships" ON public.advisor_investor_relationships
FOR UPDATE USING (
  auth.uid() = investor_id OR 
  auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id)
);

-- MESSAGES POLICIES
-- Users can view messages in their relationships
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

-- Users can send messages in their relationships
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

-- Users can update their own messages (edit/delete)
CREATE POLICY "Users can update own messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- Users can mark messages as read (recipient)
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
-- TRIGGERS
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
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON public.advisor_investor_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Chat system tables created successfully!';
  RAISE NOTICE '📊 Tables: advisor_investor_relationships, messages';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Triggers and indexes created';
END $$;

