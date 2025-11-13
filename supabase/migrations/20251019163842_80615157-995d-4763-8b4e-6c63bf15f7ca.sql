
-- Add sample data seeding function for new users
CREATE OR REPLACE FUNCTION public.seed_sample_data_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  walk_id uuid;
  stand_id uuid;
  bike_id uuid;
  stairs_id uuid;
  goal_id uuid;
BEGIN
  -- Get activity type IDs
  SELECT id INTO walk_id FROM activity_types WHERE name = 'walk';
  SELECT id INTO stand_id FROM activity_types WHERE name = 'stand';
  SELECT id INTO bike_id FROM activity_types WHERE name = 'bike';
  SELECT id INTO stairs_id FROM activity_types WHERE name = 'stairs';

  -- Insert sample daily activity for today
  INSERT INTO user_activity_daily (user_id, activity_type_id, date, total_seconds, session_count)
  VALUES 
    (NEW.id, walk_id, CURRENT_DATE, 4800, 3),
    (NEW.id, stand_id, CURRENT_DATE, 7200, 5),
    (NEW.id, bike_id, CURRENT_DATE, 2400, 2),
    (NEW.id, stairs_id, CURRENT_DATE, 1200, 4);

  -- Create a sample goal
  INSERT INTO user_goals (user_id, activity_type_id, name, target_minutes, repeat_type, start_date)
  VALUES (NEW.id, walk_id, 'Daily Walking Goal', 60, 'daily', CURRENT_DATE)
  RETURNING id INTO goal_id;

  -- Add progress for today
  INSERT INTO user_goal_progress (goal_id, date, achieved_minutes, target_met)
  VALUES (goal_id, CURRENT_DATE, 45, false);

  RETURN NEW;
END;
$$;

-- Create trigger to seed sample data when a new user is created
DROP TRIGGER IF EXISTS on_user_created_seed_data ON user_profiles;
CREATE TRIGGER on_user_created_seed_data
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_sample_data_for_user();
