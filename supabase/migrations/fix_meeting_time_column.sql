-- =====================================================
-- FIX BOOKING COLUMN NAME MISMATCH
-- Database uses 'meeting_date', code uses 'meeting_time'
-- =====================================================

-- Rename column to match code usage
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
  ELSE
    RAISE WARNING '⚠️ Column meeting_date not found';
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

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'meeting_time'
  ) THEN
    RAISE NOTICE '✅ Verification: meeting_time column exists';
  ELSE
    RAISE EXCEPTION '❌ ERROR: meeting_time column not found after migration';
  END IF;
END $$;

