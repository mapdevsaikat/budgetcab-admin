# Push Notifications Setup for New Bookings

## Overview

This system sends push notifications to admin users whenever a new booking is created in the `bookings` table. The notifications work whether the PWA app is open, in the background, or closed (with proper setup).

## How It Works

### 1. **Client-Side Real-Time Listening** (Currently Implemented ✅)

The `BookingNotifications` component:
- Subscribes to Supabase Realtime changes on the `bookings` table
- Listens for `INSERT` events (new bookings)
- Shows local browser notifications immediately when a new booking is detected
- Works when the app is open or in the background

### 2. **Push Notification Subscription**

Users must enable push notifications via the Settings page:
- The `PushNotificationManager` component handles subscription
- Stores subscription in the `push_subscriptions` table
- Uses VAPID keys for secure push notifications

### 3. **Service Worker**

The service worker (`service-worker.js`):
- Handles incoming push notifications
- Displays notifications with proper formatting
- Opens the bookings page when notification is clicked

## Setup Requirements

### Enable Supabase Realtime

Make sure Realtime is enabled for the `bookings` table in your Supabase dashboard:

1. Go to Database → Replication
2. Find the `bookings` table
3. Enable replication/publication
4. Or run this SQL:

```sql
-- Enable Realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```

### Enable Push Notifications

1. Admin users must visit the Settings page
2. Click "Enable Notifications" button
3. Grant browser permission for notifications
4. The subscription will be saved automatically

## Notification Behavior

### When App is Open
- Notification appears as a browser notification
- Clicking opens the bookings page

### When App is in Background
- Notification appears on the device
- Works on mobile PWA installations
- Clicking opens the app and navigates to bookings

### When App is Closed (Requires Edge Function)
- For true push notifications when app is closed, deploy the Edge Function
- See `supabase/functions/README.md` for setup instructions

## Testing

1. Enable notifications in Settings
2. Create a test booking (or have someone create one)
3. You should receive a notification with:
   - Booking reference
   - Customer name
   - Pickup location
   - Fare amount

## Troubleshooting

### Notifications Not Working?

1. **Check Realtime is enabled:**
   - Verify `bookings` table has Realtime enabled in Supabase dashboard

2. **Check Push Subscription:**
   - Go to Settings page
   - Verify "Notifications Active" status
   - If not active, click "Enable Notifications"

3. **Check Browser Permissions:**
   - Ensure browser allows notifications
   - Check browser settings for the site

4. **Check Service Worker:**
   - Open DevTools → Application → Service Workers
   - Verify service worker is registered and active

5. **Check Console:**
   - Look for any errors in browser console
   - Check Network tab for Realtime connection

## Files Involved

- `components/BookingNotifications.tsx` - Listens for new bookings
- `components/PushNotificationManager.tsx` - Manages push subscriptions
- `public/service-worker.js` - Handles push notifications
- `app/(admin)/layout.tsx` - Includes BookingNotifications component
- `supabase/functions/send-booking-notification/` - Edge Function for server-side notifications (optional)

## Next Steps (Optional)

For production-grade notifications that work when the app is completely closed:

1. Deploy the Edge Function (see `supabase/functions/README.md`)
2. Set up VAPID keys
3. Configure database trigger to call Edge Function automatically

The current implementation works great for most use cases where admins have the app open or in the background!
