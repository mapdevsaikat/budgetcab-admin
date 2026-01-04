import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import DriversList from '@/components/DriversList';
import { Driver } from '@/lib/types';

export default async function DriversPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching drivers:', error);
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <p className="mt-1 text-sm text-gray-500">Manage driver partners</p>
      </div>
      <DriversList initialDrivers={(drivers as Driver[]) || []} />
    </div>
  );
}

