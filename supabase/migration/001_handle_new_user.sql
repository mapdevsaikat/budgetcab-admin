-- Remove the old trigger (commonly named on_auth_user_created)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Also remove the function associated with it to ensure a fresh start
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- <--- CRITICAL: This allows the function to bypass RLS
SET search_path = public -- <--- CRITICAL: Ensures it runs in the correct schema
AS $$
DECLARE
  default_role TEXT := 'user';
  user_role TEXT;
BEGIN
  -- 1. DETERMINE ROLE
  -- Check if role is passed in raw_user_meta_data (for admin invites)
  -- Otherwise use default 'user' role
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    NEW.raw_app_meta_data->>'role',
    default_role
  );

  -- 2. CREATE PROFILE WITH ROLE COLUMN
  -- User now exists in auth.users (AFTER INSERT), so foreign key constraint works
  -- Function runs as postgres (SECURITY DEFINER), so RLS is bypassed
  INSERT INTO public.profiles (id, first_name, last_name, email, mobile, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    mobile = EXCLUDED.mobile,
    role = COALESCE(EXCLUDED.role, profiles.role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();