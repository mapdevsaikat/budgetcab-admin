import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import BookingsList from '@/components/BookingsList';
import { Booking } from '@/lib/types';

export default async function DashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      drivers (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100); // Limit to recent 100 bookings for faster load

  if (error) {
    console.error('Error fetching bookings:', error);
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

