-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  age INTEGER,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  date_of_birth DATE,
  sex TEXT CHECK (sex IN ('Male', 'Female', 'Other')),
  region_id UUID REFERENCES public.regions(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  inactivity_alerts BOOLEAN DEFAULT true,
  goal_reminders BOOLEAN DEFAULT true,
  achievement_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity_types table
CREATE TABLE public.activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_activity_events table
CREATE TABLE public.user_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type_id UUID NOT NULL REFERENCES public.activity_types(id),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster querying
CREATE INDEX idx_user_activity_events_user_time ON public.user_activity_events(user_id, timestamp DESC);

-- Create user_activity_daily table
CREATE TABLE public.user_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type_id UUID NOT NULL REFERENCES public.activity_types(id),
  date DATE NOT NULL,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  steps INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date, activity_type_id)
);

-- Create index for faster querying
CREATE INDEX idx_user_activity_daily_user_date ON public.user_activity_daily(user_id, date DESC);

-- Create user_goals table
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type_id UUID NOT NULL REFERENCES public.activity_types(id),
  name TEXT NOT NULL,
  target_minutes INTEGER NOT NULL,
  repeat_type TEXT NOT NULL CHECK (repeat_type IN ('None', 'Daily', 'Weekly')),
  repeat_interval INTEGER DEFAULT 1,
  byweekday TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_goal_progress table
CREATE TABLE public.user_goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  achieved_minutes INTEGER NOT NULL DEFAULT 0,
  target_met BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(goal_id, date)
);

-- Create user_goal_results table
CREATE TABLE public.user_goal_results (
  id UUID PRIMARY KEY REFERENCES public.user_goals(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'cancelled', 'failed')),
  finished_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_friendships table
CREATE TABLE public.user_friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_user_id),
  CHECK (user_id != friend_user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('inactivity', 'goal_reminder', 'achievement', 'friend_request', 'goal_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster notification queries
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for regions (public read)
CREATE POLICY "Regions are viewable by everyone" ON public.regions FOR SELECT USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for activity_types (public read)
CREATE POLICY "Activity types are viewable by everyone" ON public.activity_types FOR SELECT USING (true);

-- RLS Policies for user_activity_events
CREATE POLICY "Users can view own activity events" ON public.user_activity_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity events" ON public.user_activity_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activity events" ON public.user_activity_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activity events" ON public.user_activity_events FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_activity_daily
CREATE POLICY "Users can view own daily activity" ON public.user_activity_daily FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily activity" ON public.user_activity_daily FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily activity" ON public.user_activity_daily FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_goals
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_goal_progress
CREATE POLICY "Users can view own goal progress" ON public.user_goal_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.user_goals WHERE id = goal_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own goal progress" ON public.user_goal_progress FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_goals WHERE id = goal_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own goal progress" ON public.user_goal_progress FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.user_goals WHERE id = goal_id AND user_id = auth.uid()));

-- RLS Policies for user_goal_results
CREATE POLICY "Users can view own goal results" ON public.user_goal_results FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.user_goals WHERE user_goals.id = user_goal_results.id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own goal results" ON public.user_goal_results FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_goals WHERE user_goals.id = user_goal_results.id AND user_id = auth.uid()));

-- RLS Policies for user_friendships
CREATE POLICY "Users can view own friendships" ON public.user_friendships FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_user_id);
CREATE POLICY "Users can insert own friendships" ON public.user_friendships FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friendships" ON public.user_friendships FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = friend_user_id);
CREATE POLICY "Users can delete own friendships" ON public.user_friendships FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_activity_daily_updated_at BEFORE UPDATE ON public.user_activity_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goal_progress_updated_at BEFORE UPDATE ON public.user_goal_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_friendships_updated_at BEFORE UPDATE ON public.user_friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile and settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default activity types
INSERT INTO public.activity_types (name, icon) VALUES
  ('Stand', 'user-standing'),
  ('Walk', 'walking'),
  ('Stairs', 'stairs'),
  ('Bike', 'bike');

-- Insert default regions
INSERT INTO public.regions (name, timezone) VALUES
  ('North America', 'America/New_York'),
  ('Europe', 'Europe/London'),
  ('Asia', 'Asia/Tokyo'),
  ('Australia', 'Australia/Sydney');