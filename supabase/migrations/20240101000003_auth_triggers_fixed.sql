-- Fynly Authentication Triggers (Fixed for CLI)
-- Description: Automatic user profile creation and auth event handling
-- Modified: Added DROP statements for idempotency

-- =====================================================
-- DROP EXISTING TRIGGERS (for idempotency)
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
DROP TRIGGER IF EXISTS on_advisor_status_change ON public.advisors;
DROP TRIGGER IF EXISTS on_booking_status_change ON public.bookings;
DROP TRIGGER IF EXISTS on_payment_completed ON public.payments;

-- =====================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Extract user metadata from auth.users
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name, avatar_url, role, created_at)
  VALUES (
    NEW.id,
    user_email,
    user_name,
    user_avatar,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'investor'),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATE USER EMAIL ON CHANGE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email != OLD.email THEN
    UPDATE public.users
    SET email = NEW.email, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users email update
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_change();

-- =====================================================
-- DELETE USER DATA ON ACCOUNT DELETION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete: anonymize user data instead of hard delete
  UPDATE public.users
  SET
    email = 'deleted_' || OLD.id || '@deleted.local',
    full_name = 'Deleted User',
    phone = NULL,
    avatar_url = NULL,
    updated_at = NOW()
  WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users deletion
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- =====================================================
-- TRACK LOGIN EVENTS
-- =====================================================

CREATE OR REPLACE FUNCTION public.track_user_login()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.events (user_id, event_name, properties, timestamp)
  VALUES (
    NEW.id,
    'user_logged_in',
    jsonb_build_object(
      'provider', NEW.raw_app_meta_data->>'provider',
      'last_sign_in', NEW.last_sign_in_at
    ),
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Silently fail if events table doesn't exist or has issues
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on successful auth
CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.track_user_login();

-- =====================================================
-- ADVISOR APPROVAL NOTIFICATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_advisor_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Track approval event
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.events (user_id, event_name, properties, timestamp)
    VALUES (
      NEW.user_id,
      'advisor_approved',
      jsonb_build_object('advisor_id', NEW.id),
      NOW()
    );
  END IF;
  
  -- Track rejection event
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO public.events (user_id, event_name, properties, timestamp)
    VALUES (
      NEW.user_id,
      'advisor_rejected',
      jsonb_build_object('advisor_id', NEW.id),
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_advisor_status_change
  BEFORE UPDATE OF status ON public.advisors
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_advisor_approval();

-- =====================================================
-- UPDATE ADVISOR STATS ON BOOKING COMPLETION
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_advisor_stats()
RETURNS TRIGGER AS $$
DECLARE
  booking_amount DECIMAL(10,2);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get payment amount
    SELECT advisor_payout INTO booking_amount
    FROM public.payments
    WHERE booking_id = NEW.id
    LIMIT 1;
    
    -- Update advisor stats
    UPDATE public.advisors
    SET
      total_bookings = total_bookings + 1,
      total_revenue = total_revenue + COALESCE(booking_amount, 0),
      updated_at = NOW()
    WHERE id = NEW.advisor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_advisor_stats();

-- =====================================================
-- SEND EMAIL ON PAYMENT COMPLETION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_payment_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Track payment completion event
    INSERT INTO public.events (user_id, event_name, properties, timestamp)
    SELECT
      b.investor_id,
      'payment_completed',
      jsonb_build_object(
        'payment_id', NEW.id,
        'booking_id', NEW.booking_id,
        'amount', NEW.amount
      ),
      NOW()
    FROM public.bookings b
    WHERE b.id = NEW.booking_id;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_completed
  AFTER UPDATE OF status ON public.payments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
  EXECUTE FUNCTION public.handle_payment_completed();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on all functions to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_email_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_user_login() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_advisor_approval() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_advisor_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_payment_completed() TO authenticated;

-- Grant to service role for API operations
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

