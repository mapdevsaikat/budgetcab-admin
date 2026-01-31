# Understanding Roles in BudgetCab Admin

## Which Role Field Controls Access?

**The admin app checks `profiles.role` column** - this is the **source of truth** for access control.

## Role Fields Explained

There are **3 places** where roles can be stored:

### 1. `profiles.role` (PRIMARY - Controls Access)
- **Location**: `public.profiles` table, `role` column
- **Purpose**: This is what the admin app checks for access control
- **Used by**: `lib/auth.ts` → `requireAdmin()` function
- **Values**: `'admin'`, `'user'`, `'driver'`

### 2. `auth.users.raw_user_meta_data.role` (Secondary)
- **Location**: `auth.users` table, `raw_user_meta_data` JSON field
- **Purpose**: Used by the `handle_new_user()` trigger to set initial `profiles.role`
- **Priority**: Checked FIRST by the trigger function
- **When to use**: Set this BEFORE user signs up to assign role during registration

### 3. `auth.users.raw_app_meta_data.role` (Tertiary)
- **Location**: `auth.users` table, `raw_app_meta_data` JSON field  
- **Purpose**: Fallback for trigger function, also used by Supabase client
- **Priority**: Checked SECOND by the trigger function (if `raw_user_meta_data.role` is missing)
- **When to use**: Can be set for consistency, but not required

## How the Trigger Function Works

When a new user signs up, `handle_new_user()` determines the role:

```sql
user_role := COALESCE(
  NEW.raw_user_meta_data->>'role',  -- Checked FIRST
  NEW.raw_app_meta_data->>'role',   -- Checked SECOND
  'user'                            -- Default fallback
);
```

Then it inserts into `profiles.role`:
```sql
INSERT INTO profiles (..., role) VALUES (..., user_role);
```

## How to Make Someone an Admin

### For Existing Users (Recommended)
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

### For New Users (Before Signup)
Set the role in metadata before they sign up:
```sql
-- This will be picked up by the trigger
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'newuser@example.com';
```

### For Consistency (Optional)
Also update `raw_app_meta_data`:
```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
WHERE email = 'user@example.com';
```

## What Was Wrong?

You ran:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'admin')
WHERE email = 'admin@example.com';
```

**Problem**: This only updated `raw_app_meta_data.role`, but:
- The app checks `profiles.role` (not auth metadata)
- Your `profiles.role` was still `'user'`
- So you still couldn't access the admin dashboard!

## What I Fixed

✅ Updated `profiles.role` to `'admin'` (this is what matters!)  
✅ Updated `raw_app_meta_data.role` to `'admin'` (for consistency)  
✅ Your `raw_user_meta_data.role` was already `'admin'` (good!)

## Summary

| Field | Purpose | Used By | Priority |
|-------|---------|---------|----------|
| `profiles.role` | **Access control** | Admin app | **PRIMARY** |
| `raw_user_meta_data.role` | Initial role assignment | Trigger function | Secondary |
| `raw_app_meta_data.role` | Consistency/fallback | Trigger function | Tertiary |

**Remember**: Always update `profiles.role` for existing users! The auth metadata is mainly for new user registration.

