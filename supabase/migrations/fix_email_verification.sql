-- Fix email verification update issue
-- This creates a simple RPC function to update email verification status

CREATE OR REPLACE FUNCTION public.update_user_email_verified(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users 
  SET 
    email_verified = true,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_email_verified(UUID) TO authenticated;
