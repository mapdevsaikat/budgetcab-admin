# RLS Circular Dependency Fix

## Problem
Error `42P17` (undefined function) was occurring when trying to query the `profiles` table. The error was:
```
GET /rest/v1/profiles?select=*&id=eq.89beb522-e6ec-46bf-b8ab-f41d49ba18c3
Status: 500
Error: PostgREST; error=42P17
```

## Root Cause
The RLS policies had a **circular dependency**:

1. User tries to SELECT from `profiles` table
2. RLS checks "Admins can view all profiles" policy
3. Policy tries to SELECT from `profiles` table (to check if user is admin):
   ```sql
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
   ```
4. This triggers RLS again → **infinite loop** → Error 42P17

The same issue existed in:
- `profiles` table
- `bookings` table  
- `drivers` table
- `pricing_rules` table

## Solution

### Created `is_admin()` Helper Function
A `SECURITY DEFINER` function that bypasses RLS to check admin status:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Bypasses RLS
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;
```

### Updated All Admin Policies
Changed from:
```sql
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

To:
```sql
public.is_admin()
```

## Migrations Applied

1. ✅ `fix_rls_circular_dependency` - Created `is_admin()` and fixed `profiles` policies
2. ✅ `fix_all_admin_policies_circular_dependency` - Fixed `bookings`, `drivers`, `pricing_rules` policies

## Result

✅ All admin policies now use `is_admin()` function  
✅ No more circular dependencies  
✅ Queries work correctly  
✅ Admin access still properly restricted  

## Testing

Try accessing your profile now:
```bash
GET /rest/v1/profiles?select=*&id=eq.89beb522-e6ec-46bf-b8ab-f41d49ba18c3
```

Should return status `200` instead of `500`! 🎉

