import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import DashboardStats from '@/components/DashboardStats';
import DashboardDateFilter from '@/components/DashboardDateFilter';

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    await requireAdmin();
    const supabase = await createClient();

    const range = (searchParams.range as string) || '30d';

    // Calculate start and end dates directly in standard Date objects
    // Note: Database expects ISO strings or typical timestamp formats
    const now = new Date();
    let startTime = new Date();

    if (range === '7d') {
        startTime.setDate(now.getDate() - 7);
    } else if (range === '30d') {
        startTime.setDate(now.getDate() - 30);
    } else if (range === 'this_month') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'last_month') {
        startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        // End date should be start of this month
        now.setMonth(now.getMonth(), 1);
        now.setHours(0, 0, 0, 0);
        // Actually for 'last_month', end date is end of last month, which is same as start of this month
    } else if (range === 'all') {
        startTime = new Date(0); // Epoch
    }

    // Call the improved RPC function
    const { data: stats, error } = await supabase.rpc('get_dashboard_stats', {
        start_date: startTime.toISOString(),
        end_date: now.toISOString(),
    });

    if (error) {
        console.error('Error fetching dashboard stats:', error);
    }

    // Fetch time-series data for charts
    const [userGrowthResult, bookingsTimeSeriesResult, revenueTimeSeriesResult] = await Promise.all([
        supabase.rpc('get_user_growth', {
            start_date: startTime.toISOString(),
            end_date: now.toISOString(),
        }),
        supabase.rpc('get_bookings_timeseries', {
            start_date: startTime.toISOString(),
            end_date: now.toISOString(),
        }),
        supabase.rpc('get_revenue_timeseries', {
            start_date: startTime.toISOString(),
            end_date: now.toISOString(),
        }),
    ]);

    // Fallback defaults
    const displayStats = stats || {
        total_users: 0,
        total_bookings: 0,
        active_drivers: 0,
        total_revenue: 0,
    };

    const timeSeriesData = {
        userGrowth: userGrowthResult.data || [],
        bookingsTimeSeries: bookingsTimeSeriesResult.data || [],
        revenueTimeSeries: revenueTimeSeriesResult.data || [],
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview of your platform performance
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <DashboardDateFilter />
                </div>
            </div>

            <DashboardStats stats={displayStats} timeSeriesData={timeSeriesData} />
        </div>
    );
}
