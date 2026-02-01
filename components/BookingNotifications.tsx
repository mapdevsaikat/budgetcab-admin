'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Booking } from '@/lib/types';

export default function BookingNotifications() {
  const lastBookingIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const supabase = createClient();

    const sendPushNotification = async (booking: Booking) => {
      try {
        // Get the service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Get push subscription
        const subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          console.log('No push subscription found');
          return;
        }

        // Prepare notification data
        const pickupLocation = booking.pickup_address || 'Location not specified';
        const customerName = booking.user_first_name || 'Customer';
        const bookingRef = booking.booking_ref;
        const price = booking.price_total ? `₹${booking.price_total.toFixed(2)}` : 'Price TBD';

        const notificationTitle = `New Booking: ${bookingRef}`;
        const notificationBody = `${customerName} - ${pickupLocation}\nFare: ${price}`;
        
        // Show local notification immediately (works even if app is open)
        // Using type assertion for vibrate property which is valid in browser API but not in TypeScript types
        await registration.showNotification(notificationTitle, {
          body: notificationBody,
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
          vibrate: [200, 100, 200],
          tag: `booking-${booking.id}`,
          requireInteraction: false,
          data: {
            url: `/bookings`,
            bookingId: booking.id,
            bookingRef: bookingRef,
          },
          actions: [
            {
              action: 'view',
              title: 'View Booking',
            },
          ],
        } as NotificationOptions);

        // Also send push notification via server (if Edge Function is set up)
        // This ensures notifications work even when the app is closed
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Call Edge Function to send push notification to all admin devices
            await supabase.functions.invoke('send-booking-notification', {
              body: {
                booking: {
                  id: booking.id,
                  booking_ref: bookingRef,
                  user_first_name: booking.user_first_name,
                  pickup_address: booking.pickup_address,
                  price_total: booking.price_total,
                  status: booking.status,
                },
              },
            });
          }
        } catch (error) {
          // Edge Function might not be set up, that's okay
          // Local notification will still work
          console.log('Edge Function not available, using local notifications only');
        }
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    };

    // Function to check for new bookings
    const checkForNewBookings = async () => {
      try {
        // Fetch the most recent bookings
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('id, booking_ref, user_first_name, pickup_address, price_total, status, created_at')
          .in('status', ['pending', 'confirmed'])
          .order('created_at', { ascending: false })
          .limit(10); // Check last 10 bookings

        if (error) {
          console.error('Error checking for new bookings:', error);
          return;
        }

        if (!bookings || bookings.length === 0) {
          return;
        }

        // Initialize lastBookingId on first run
        if (lastBookingIdRef.current === null) {
          lastBookingIdRef.current = bookings[0].id;
          return;
        }

        // Find new bookings (those that weren't in the last check)
        if (lastBookingIdRef.current) {
          const lastSeenIndex = bookings.findIndex(
            (b) => b.id === lastBookingIdRef.current
          );

          // If we found the last seen booking, notify for all bookings before it
          if (lastSeenIndex > 0) {
            const newBookings = bookings.slice(0, lastSeenIndex);
            // Send notifications for new bookings (oldest first)
            for (const booking of newBookings.reverse()) {
              if (booking.status === 'pending' || booking.status === 'confirmed') {
                await sendPushNotification(booking as Booking);
              }
            }
          }
          // If last seen booking not found, it might have been deleted or status changed
          // In this case, we'll just update the ref and skip notifications to avoid spam
        }

        // Update last seen booking ID
        if (bookings.length > 0) {
          lastBookingIdRef.current = bookings[0].id;
        }
      } catch (error) {
        console.error('Error in booking check:', error);
      }
    };

    // Initial check
    checkForNewBookings();

    // Set up polling interval (check every 15 seconds)
    // Adjust this interval based on your needs (shorter = more responsive, but more API calls)
    pollingIntervalRef.current = setInterval(checkForNewBookings, 15000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
