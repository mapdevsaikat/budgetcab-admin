-- Fix missing profile for admin user
-- Run this in your Supabase SQL Editor

-- First, check if the user exists in auth.users
SELECT id, email, raw_user_meta_data->>'role' as meta_role 
FROM auth.users 
WHERE id = '31676338-3cb5-4c47-b6bf-837442575edb';

-- Check if profile exists
SELECT * FROM public.profiles WHERE id = '31676338-3cb5-4c47-b6bf-837442575edb';

-- If profile doesn't exist, create it with admin role
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  mobile,
  role
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(u.raw_user_meta_data->>'mobile', ''),
  'admin'
FROM auth.users u
WHERE u.id = '31676338-3cb5-4c47-b6bf-837442575edb'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Verify the profile was created
SELECT id, email, role FROM public.profiles WHERE id = '31676338-3cb5-4c47-b6bf-837442575edb';

