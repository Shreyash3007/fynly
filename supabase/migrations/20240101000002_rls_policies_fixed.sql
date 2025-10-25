-- Fynly Row Level Security (RLS) Policies (Fixed for CLI)
-- Description: Comprehensive RLS policies for data isolation and security
-- Modified: Functions moved to public schema for CLI compatibility

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS (in public schema)
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is advisor
CREATE OR REPLACE FUNCTION public.is_advisor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'advisor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get advisor_id for current user
CREATE OR REPLACE FUNCTION public.current_advisor_id()
RETURNS UUID AS $$
  SELECT id FROM public.advisors WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "users_select_admin"
  ON public.users
  FOR SELECT
  USING (public.is_admin());

-- Admins can update all users
CREATE POLICY "users_update_admin"
  ON public.users
  FOR UPDATE
  USING (public.is_admin());

-- =====================================================
-- ADVISORS TABLE POLICIES
-- =====================================================

-- Public can view approved advisors
CREATE POLICY "advisors_select_approved"
  ON public.advisors
  FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin());

-- Advisors can update their own profile
CREATE POLICY "advisors_update_own"
  ON public.advisors
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users with advisor role can insert their profile
CREATE POLICY "advisors_insert_own"
  ON public.advisors
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'advisor')
  );

-- Admins can update any advisor
CREATE POLICY "advisors_update_admin"
  ON public.advisors
  FOR UPDATE
  USING (public.is_admin());

-- Admins can view all advisors
CREATE POLICY "advisors_select_admin"
  ON public.advisors
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Investors can view their own bookings
CREATE POLICY "bookings_select_investor"
  ON public.bookings
  FOR SELECT
  USING (investor_id = auth.uid());

-- Advisors can view their bookings
CREATE POLICY "bookings_select_advisor"
  ON public.bookings
  FOR SELECT
  USING (
    advisor_id IN (SELECT id FROM public.advisors WHERE user_id = auth.uid())
  );

-- Investors can create bookings
CREATE POLICY "bookings_insert_investor"
  ON public.bookings
  FOR INSERT
  WITH CHECK (investor_id = auth.uid());

-- Advisors can update their bookings
CREATE POLICY "bookings_update_advisor"
  ON public.bookings
  FOR UPDATE
  USING (
    advisor_id IN (SELECT id FROM public.advisors WHERE user_id = auth.uid())
  );

-- Investors can cancel their bookings
CREATE POLICY "bookings_update_investor"
  ON public.bookings
  FOR UPDATE
  USING (investor_id = auth.uid());

-- Admins can view all bookings
CREATE POLICY "bookings_select_admin"
  ON public.bookings
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

-- Investors can view their payment history
CREATE POLICY "payments_select_investor"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.investor_id = auth.uid()
    )
  );

-- Advisors can view payments for their bookings
CREATE POLICY "payments_select_advisor"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM public.bookings b
      INNER JOIN public.advisors a ON a.id = b.advisor_id
      WHERE b.id = payments.booking_id
      AND a.user_id = auth.uid()
    )
  );

-- System can insert payments (via service role or API)
CREATE POLICY "payments_insert_system"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- System can update payments
CREATE POLICY "payments_update_system"
  ON public.payments
  FOR UPDATE
  USING (true);

-- Admins can view all payments
CREATE POLICY "payments_select_admin"
  ON public.payments
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================

-- Anyone can view reviews
CREATE POLICY "reviews_select_all"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Investors can create reviews for their completed bookings
CREATE POLICY "reviews_insert_investor"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    investor_id = auth.uid() AND
    EXISTS(
      SELECT 1 FROM public.bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.investor_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Investors can update their own reviews
CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  USING (investor_id = auth.uid());

-- Admins can delete reviews
CREATE POLICY "reviews_delete_admin"
  ON public.reviews
  FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- ADMIN_ACTIONS TABLE POLICIES
-- =====================================================

-- Only admins can insert admin actions
CREATE POLICY "admin_actions_insert_admin"
  ON public.admin_actions
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can view admin actions
CREATE POLICY "admin_actions_select_admin"
  ON public.admin_actions
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- Users can view their own events
CREATE POLICY "events_select_own"
  ON public.events
  FOR SELECT
  USING (user_id = auth.uid());

-- System can insert events
CREATE POLICY "events_insert_system"
  ON public.events
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all events
CREATE POLICY "events_select_admin"
  ON public.events
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- CONSENT_LOGS TABLE POLICIES
-- =====================================================

-- Users can view their own consent logs
CREATE POLICY "consent_logs_select_own"
  ON public.consent_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own consent logs
CREATE POLICY "consent_logs_insert_own"
  ON public.consent_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all consent logs
CREATE POLICY "consent_logs_select_admin"
  ON public.consent_logs
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- STORAGE POLICIES (if using Supabase Storage)
-- =====================================================

-- Note: Storage policies would be configured separately if using Supabase Storage for avatars/documents

