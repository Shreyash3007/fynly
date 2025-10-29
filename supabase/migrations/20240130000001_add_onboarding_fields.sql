-- Add onboarding tracking fields to users table
-- Migration: Add onboarding_completed and onboarding_data fields

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed 
ON public.users(onboarding_completed);

-- Comment for documentation
COMMENT ON COLUMN public.users.onboarding_completed IS 'Tracks whether user has completed onboarding flow';
COMMENT ON COLUMN public.users.onboarding_data IS 'Stores onboarding questionnaire responses';

