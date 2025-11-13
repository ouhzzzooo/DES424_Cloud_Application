
-- First drop the old constraint completely
ALTER TABLE user_goals DROP CONSTRAINT IF EXISTS user_goals_repeat_type_check;

-- Update all existing data to lowercase
UPDATE user_goals SET repeat_type = 'daily' WHERE repeat_type = 'Daily';
UPDATE user_goals SET repeat_type = 'weekly' WHERE repeat_type = 'Weekly';
UPDATE user_goals SET repeat_type = 'none' WHERE repeat_type = 'None';

-- Now add the new constraint
ALTER TABLE user_goals ADD CONSTRAINT user_goals_repeat_type_check 
CHECK (repeat_type IN ('none', 'daily', 'weekly'));
