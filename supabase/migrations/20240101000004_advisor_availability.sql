-- Advisor Availability Management
-- Description: Add advisor availability system for real-time booking

-- Advisor availability table
CREATE TABLE public.advisor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advisor_id, day_of_week, start_time)
);

-- Advisor time slots table (for specific date/time bookings)
CREATE TABLE public.advisor_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_booked BOOLEAN DEFAULT false,
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advisor_id, start_time)
);

-- Platform settings table
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_advisor_availability_advisor_id ON public.advisor_availability(advisor_id);
CREATE INDEX idx_advisor_availability_day ON public.advisor_availability(day_of_week);
CREATE INDEX idx_advisor_time_slots_advisor_id ON public.advisor_time_slots(advisor_id);
CREATE INDEX idx_advisor_time_slots_date ON public.advisor_time_slots(date);
CREATE INDEX idx_advisor_time_slots_available ON public.advisor_time_slots(is_available, is_booked);

-- Enable RLS
ALTER TABLE public.advisor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisor_availability
CREATE POLICY "Advisors can manage their own availability" ON public.advisor_availability
  FOR ALL USING (
    advisor_id IN (
      SELECT id FROM public.advisors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view advisor availability" ON public.advisor_availability
  FOR SELECT USING (is_available = true);

-- RLS Policies for advisor_time_slots
CREATE POLICY "Advisors can manage their own time slots" ON public.advisor_time_slots
  FOR ALL USING (
    advisor_id IN (
      SELECT id FROM public.advisors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view available time slots" ON public.advisor_time_slots
  FOR SELECT USING (is_available = true AND is_booked = false);

-- RLS Policies for platform_settings
CREATE POLICY "Only admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('commission_rate', '10.0', 'Platform commission percentage'),
('min_session_duration', '30', 'Minimum session duration in minutes'),
('max_session_duration', '120', 'Maximum session duration in minutes'),
('advance_booking_days', '30', 'Maximum days in advance for booking'),
('cancellation_hours', '24', 'Hours before session for free cancellation');

-- Update trigger for advisor_time_slots
CREATE OR REPLACE FUNCTION update_advisor_time_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_advisor_time_slots_updated_at
  BEFORE UPDATE ON public.advisor_time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_advisor_time_slots_updated_at();

-- Update trigger for advisor_availability
CREATE OR REPLACE FUNCTION update_advisor_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_advisor_availability_updated_at
  BEFORE UPDATE ON public.advisor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_advisor_availability_updated_at();
