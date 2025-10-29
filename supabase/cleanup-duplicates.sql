-- =====================================================
-- CLEANUP DUPLICATE USERS
-- Run this if you have duplicate user profiles
-- =====================================================

-- First, let's see if there are any duplicates
SELECT id, email, COUNT(*) as count
FROM public.users
GROUP BY id, email
HAVING COUNT(*) > 1;

-- Delete duplicate profiles, keeping only the first one
DELETE FROM public.users a
USING public.users b
WHERE a.id = b.id
  AND a.created_at > b.created_at;

-- Verify no duplicates remain
SELECT COUNT(*) as total_users FROM public.users;

-- Check if any auth users don't have profiles
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Cleanup completed!';
  RAISE NOTICE '📊 Check the results above to verify everything is clean';
END $$;
