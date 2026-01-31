# BudgetCab Admin Dashboard

A fully responsive admin web application for managing BudgetCab bookings, drivers, and pricing.

## Features

- **Bookings Management**: View, filter, and manage all bookings. Update status, assign drivers, and modify pricing.
- **Driver Management**: Add, edit, activate/deactivate drivers. Set shift times.
- **Pricing Management**: Manage pricing rules with time-based slots and priority.

## Tech Stack

- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Lucide React (Icons)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up admin user:**
   - Create a user account in Supabase Auth
   - Update the `profiles` table to set `role = 'admin'` for that user:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Database Schema

The app uses the following tables:
- `bookings` - All ride bookings
- `drivers` - Driver partners
- `pricing_rules` - Fare calculation rules
- `profiles` - User profiles with role-based access

## Role-Based Access

The app uses role-based access control:
- **admin**: Full access to all features
- **user**: Regular user (not used in admin app)
- **driver**: Driver role (not used in admin app)

Only users with `role = 'admin'` in the `profiles` table can access the admin dashboard.

## Security

- Row Level Security (RLS) policies are enforced on all tables
- Admin-only access is enforced at both database and application level
- API keys are kept secure using environment variables

## Project Structure

```
├── app/
│   ├── dashboard/          # Admin dashboard pages
│   │   ├── page.tsx        # Bookings list
│   │   ├── drivers/        # Drivers management
│   │   └── pricing/        # Pricing management
│   ├── login/              # Login page
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   ├── BookingsList.tsx
│   ├── BookingModal.tsx
│   ├── DriversList.tsx
│   └── PricingRulesList.tsx
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── auth.ts            # Authentication helpers
│   └── types.ts           # TypeScript types
└── app/actions/           # Server actions
```

## Usage

### Managing Bookings

1. Navigate to the Bookings page
2. Use the search bar to find specific bookings
3. Filter by status using the dropdown
4. Click on any booking to view/edit details
5. Update status, assign driver, or modify price as needed

### Managing Drivers

1. Navigate to the Drivers page
2. Click "Add Driver" to create a new driver
3. Click the edit icon to modify existing drivers
4. Toggle active/inactive status using the checkmark/X button

### Managing Pricing

1. Navigate to the Pricing page
2. Click "Add Pricing Rule" to create a new rule
3. Set time slots, base fare, and per-km rate
4. Use priority to determine which rule applies when slots overlap

## Notes

- The app is designed to be lean and functional - no charts or statistics pages
- All data is fetched in real-time from Supabase
- Changes are saved immediately to the database
- The UI is fully responsive and works on mobile devices

