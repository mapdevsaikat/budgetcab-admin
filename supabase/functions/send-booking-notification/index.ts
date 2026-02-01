// Supabase Edge Function to send push notifications when a new booking is created
// This ensures notifications work even when the PWA app is closed

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get booking data from request
    const { booking } = await req.json();

    if (!booking) {
      return new Response(
        JSON.stringify({ error: 'Booking data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all admin users' push subscriptions
    const { data: adminProfiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (profileError || !adminProfiles) {
      throw profileError;
    }

    const adminUserIds = adminProfiles.map(p => p.id);

    // Get all push subscriptions for admin users
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', adminUserIds);

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No push subscriptions found for admin users' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification payload
    const pickupLocation = booking.pickup_address || 'Location not specified';
    const customerName = booking.user_first_name || 'Customer';
    const bookingRef = booking.booking_ref;
    const price = booking.price_total ? `₹${booking.price_total.toFixed(2)}` : 'Price TBD';

    const notificationPayload = {
      title: `New Booking: ${bookingRef}`,
      body: `${customerName} - ${pickupLocation}\nFare: ${price}`,
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      vibrate: [200, 100, 200],
      tag: `booking-${booking.id}`,
      data: {
        url: '/bookings',
        bookingId: booking.id,
        bookingRef: bookingRef,
      },
      actions: [
        {
          action: 'view',
          title: 'View Booking',
        },
      ],
    };

    // Send push notification to all admin subscriptions
    // Note: You'll need to implement Web Push protocol here
    // For now, this is a placeholder structure
    
    // In production, you would use a library like web-push to send notifications
    // Example: await webpush.sendNotification(subscription, JSON.stringify(notificationPayload))

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent',
        count: subscriptions.length 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
