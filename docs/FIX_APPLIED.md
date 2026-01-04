# Fix Applied: handle_new_user Function

## Problem
The `handle_new_user()` trigger function was **NOT inserting the `role` column** into the `profiles` table when new users registered. This caused:
- New users couldn't login (their profile had `role = NULL`)
- Admin checks failed because `profiles.role` was missing
- Registration appeared to succeed but authentication failed

## Root Cause
The original function only inserted these columns:
```sql
INSERT INTO public.profiles (id, first_name, last_name, email, mobile)
```

But the `role` column was **missing**, even though it was being set in `raw_app_meta_data`.

## Solution Applied

### ✅ Fixed the function to:
1. **Determine the role** from either `raw_user_meta_data` or `raw_app_meta_data`, defaulting to `'user'`
2. **Insert the role** into the `profiles` table:
   ```sql
   INSERT INTO public.profiles (id, first_name, last_name, email, mobile, role)
   VALUES (
     NEW.id,
     COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
     COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
     COALESCE(NEW.email, ''),
     COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
     user_role  -- <--- THIS WAS MISSING!
   )
   ```

### Migration Applied
```
fix_handle_new_user_add_role
```

## Testing

Now new users can register successfully! Try it:

1. **Test registration in your user app**
2. **Verify the profile has a role**:
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'test@example.com';
   ```
3. **Check auth metadata**:
   ```sql
   SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'test@example.com';
   ```

## How Roles Work Now

- **Default for new users**: `role = 'user'`
- **For admin creation**: Pass `role` in `raw_user_meta_data` during signup
- **Manual admin promotion**: 
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
  ```

## Files Updated
- ✅ Database function (via migration)
- ✅ Local file: `supabase/migration/001_handle_new_user.sql`

