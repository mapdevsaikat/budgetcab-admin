import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import BookingsList from '@/components/BookingsList';
import { Booking } from '@/lib/types';

export default async function DashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch bookings with relationships
  let bookings: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from('bookings')
      .select(`
        *,
        drivers (
          id,
          name
        ),
        booking_options (
          cab_type,
          trip_type,
          number_of_nights
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    bookings = result.data || [];
    error = result.error;

    if (error) {
      // Try fetching without relationships as fallback
      console.warn('Error fetching with relationships, trying basic query:', error);
      const basicResult = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (!basicResult.error) {
        bookings = basicResult.data || [];
        error = null; // Clear error since basic query worked
      } else {
        error = basicResult.error;
      }
    }
  } catch (err) {
    console.error('Unexpected error fetching bookings:', err);
    error = err;
  }

  if (error) {
    // Log detailed error information
    console.error('Error fetching bookings:', {
      message: error?.message || 'Unknown error',
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      error: String(error),
    });
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage all ride bookings</p>
      </div>
      <BookingsList initialBookings={(bookings as Booking[]) || []} />
    </div>
  );
}

// Cache for 30 seconds
export const revalidate = 30;

