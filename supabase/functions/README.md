# Supabase Edge Functions for Push Notifications

## Setup Instructions

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link your project
```bash
supabase link --project-ref your-project-ref
```

### 4. Set Environment Variables
Set the following secrets in your Supabase project:
```bash
supabase secrets set VAPID_PUBLIC_KEY=your-vapid-public-key
supabase secrets set VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 5. Deploy the Function
```bash
supabase functions deploy send-booking-notification
```

## How It Works

1. When a new booking is inserted into the `bookings` table, the Edge Function is triggered
2. It fetches all admin users' push subscriptions from the `push_subscriptions` table
3. It sends push notifications to all admin devices

## Alternative: Database Trigger Approach

You can also set up a database trigger that calls the Edge Function automatically:

```sql
-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/send-booking-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'booking', jsonb_build_object(
          'id', NEW.id,
          'booking_ref', NEW.booking_ref,
          'user_first_name', NEW.user_first_name,
          'pickup_address', NEW.pickup_address,
          'price_total', NEW.price_total,
          'status', NEW.status
        )
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.status IN ('pending', 'confirmed'))
  EXECUTE FUNCTION notify_new_booking();
```

## Note

The current implementation uses local notifications via Supabase Realtime, which works when the app is open or in the background. For true push notifications when the app is completely closed, you'll need to:

1. Implement the Web Push protocol in the Edge Function using a library like `web-push`
2. Set up VAPID keys properly
3. Deploy the Edge Function

The client-side implementation (BookingNotifications component) will handle notifications when the app is open or in the background.
