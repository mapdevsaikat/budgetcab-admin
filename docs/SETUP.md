# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Environment File

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xvarzrifyuscgxantnuw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YXJ6cmlmeXVzY2d4YW50bnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTg2ODQsImV4cCI6MjA4Mjc3NDY4NH0.0CdDY9q1iyeLpObiMwvq-x5C7SNSnrBjCOyV59q7-z4
```

## 3. Set Up Admin User

You need to set a user's role to 'admin' in the database:

1. Create a user account via Supabase Auth (or use an existing one)
2. Get the user's UUID from `auth.users` table
3. Run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-uuid-here';
```

Or if the profile doesn't exist yet:

```sql
INSERT INTO profiles (id, first_name, last_name, email, mobile, role)
VALUES (
  'your-user-uuid-here',
  'Admin',
  'User',
  'admin@example.com',
  '9999999999',
  'admin'
);
```

## 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your admin account.

## Database Changes Made

The following migration was applied:
- Added `role` column to `profiles` table (values: 'admin', 'user', 'driver')
- Created RLS policies for admin access to:
  - `bookings` (view, update, delete)
  - `drivers` (full access)
  - `pricing_rules` (full access)
  - `profiles` (view and update all)

## Notes

- Only users with `role = 'admin'` can access the dashboard
- All RLS policies are enforced at the database level
- The app is fully responsive and works on mobile devices

