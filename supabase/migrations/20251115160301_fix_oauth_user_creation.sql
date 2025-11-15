-- Fix handle_new_user function to properly handle OAuth users
-- This ensures both user_profiles and user_settings are created
-- and handles cases where email might be NULL (OAuth users)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user profile with proper handling of OAuth metadata
  -- OAuth users might have email in NEW.email or in raw_user_meta_data
  INSERT INTO public.user_profiles (
    id, 
    email, 
    display_name
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.email,
      NEW.raw_user_meta_data->>'email'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      NEW.email,
      NEW.raw_user_meta_data->>'email',
      'User'
    )
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  
  -- Insert user settings (required for app functionality)
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if settings already exist
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
