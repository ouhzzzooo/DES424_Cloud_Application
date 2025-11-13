-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type_id uuid NOT NULL REFERENCES activity_types(id) ON DELETE CASCADE,
  time_period text NOT NULL, -- 'week', 'month', 'all-time'
  scope text NOT NULL, -- 'global', 'regional', 'friend'
  total_seconds integer NOT NULL DEFAULT 0,
  rank integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, activity_type_id, time_period, scope)
);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Leaderboard is viewable by everyone
CREATE POLICY "Leaderboard is viewable by everyone"
ON public.leaderboard
FOR SELECT
USING (true);

-- Users can insert their own leaderboard entries
CREATE POLICY "Users can insert own leaderboard entries"
ON public.leaderboard
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own leaderboard entries
CREATE POLICY "Users can update own leaderboard entries"
ON public.leaderboard
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert mock leaderboard data
-- First, let's get some activity type IDs
DO $$
DECLARE
  walk_id uuid;
  stand_id uuid;
  bike_id uuid;
  stairs_id uuid;
  sample_user_id uuid;
BEGIN
  -- Get activity type IDs
  SELECT id INTO walk_id FROM activity_types WHERE name = 'walk' LIMIT 1;
  SELECT id INTO stand_id FROM activity_types WHERE name = 'stand' LIMIT 1;
  SELECT id INTO bike_id FROM activity_types WHERE name = 'bike' LIMIT 1;
  SELECT id INTO stairs_id FROM activity_types WHERE name = 'stairs' LIMIT 1;
  
  -- Get a sample user ID (or we'll create mock ones)
  SELECT id INTO sample_user_id FROM user_profiles LIMIT 1;
  
  -- If we have users and activities, insert mock leaderboard data
  IF sample_user_id IS NOT NULL AND walk_id IS NOT NULL THEN
    -- Weekly global leaderboard for walk
    INSERT INTO public.leaderboard (user_id, activity_type_id, time_period, scope, total_seconds, rank)
    SELECT 
      user_profiles.id,
      walk_id,
      'week',
      'global',
      (5000 + (random() * 10000))::integer,
      ROW_NUMBER() OVER (ORDER BY random())
    FROM user_profiles
    LIMIT 10
    ON CONFLICT (user_id, activity_type_id, time_period, scope) DO NOTHING;
    
    -- Monthly global leaderboard for bike
    INSERT INTO public.leaderboard (user_id, activity_type_id, time_period, scope, total_seconds, rank)
    SELECT 
      user_profiles.id,
      bike_id,
      'month',
      'global',
      (20000 + (random() * 30000))::integer,
      ROW_NUMBER() OVER (ORDER BY random())
    FROM user_profiles
    LIMIT 10
    ON CONFLICT (user_id, activity_type_id, time_period, scope) DO NOTHING;
  END IF;
END $$;