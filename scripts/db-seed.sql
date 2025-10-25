-- ============================================
-- Fynly Database Seed Data
-- Sample data for development and testing
-- ============================================

-- WARNING: This will insert test data
-- Only run in development environment

-- Insert test admin user (password: admin123)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@fynly.com',
  '$2a$10$vGBvXgHLcZJvWlqcDxJrXuqcYhN8HjG.nRJvHmHzT6VqNwU8zJ9NG',
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Admin User", "role": "admin"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert test investor (password: investor123)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'investor@test.com',
  '$2a$10$vGBvXgHLcZJvWlqcDxJrXuqcYhN8HjG.nRJvHmHzT6VqNwU8zJ9NG',
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Test Investor", "role": "investor"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert test advisor (password: advisor123)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'advisor@test.com',
  '$2a$10$vGBvXgHLcZJvWlqcDxJrXuqcYhN8HjG.nRJvHmHzT6VqNwU8zJ9NG',
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Test Advisor", "role": "advisor"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert test advisor profile
INSERT INTO public.advisors (
  id,
  user_id,
  bio,
  experience_years,
  sebi_reg_no,
  linkedin_url,
  expertise,
  hourly_rate,
  status,
  verified_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'Experienced financial advisor specializing in mutual funds and tax planning. Helping investors achieve their financial goals for over 10 years.',
  10,
  'SEBI/INA000001234',
  'https://linkedin.com/in/testadvisor',
  ARRAY['mutual_funds', 'tax_planning', 'portfolio_management']::expertise_area[],
  1500.00,
  'approved',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO public.events (user_id, event_name, properties) VALUES
('22222222-2222-2222-2222-222222222222', 'user_logged_in', '{"provider": "email"}'),
('33333333-3333-3333-3333-333333333333', 'advisor_approved', '{"advisor_id": "44444444-4444-4444-4444-444444444444"}');

-- Success message
SELECT 'Seed data inserted successfully!' as message;

