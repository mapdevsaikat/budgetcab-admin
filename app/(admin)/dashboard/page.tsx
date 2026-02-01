import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import DashboardStats from '@/components/DashboardStats';
import DashboardDateFilter from '@/components/DashboardDateFilter';
import { unstable_cache } from 'next/cache';

// Cache dashboard data for 60 seconds
const getCachedDashboardData = unstable_cache(
    async (startDate: string, endDate: string, supabaseUrl: string) => {
        const supabase = createServiceClient();
        
        const [statsResult, userGrowthResult, bookingsTimeSeriesResult, revenueTimeSeriesResult] = await Promise.all([
            supabase.rpc('get_dashboard_stats', {
                start_date: startDate,
                end_date: endDate,
            }),
            supabase.rpc('get_user_growth', {
                start_date: startDate,
                end_date: endDate,
            }),
            supabase.rpc('get_bookings_timeseries', {
                start_date: startDate,
                end_date: endDate,
            }),
            supabase.rpc('get_revenue_timeseries', {
                start_date: startDate,
                end_date: endDate,
            }),
        ]);

        return {
            stats: statsResult.data || {
                total_users: 0,
                total_bookings: 0,
                active_drivers: 0,
                total_revenue: 0,
            },
            timeSeriesData: {
                userGrowth: userGrowthResult.data || [],
                bookingsTimeSeries: bookingsTimeSeriesResult.data || [],
                revenueTimeSeries: revenueTimeSeriesResult.data || [],
            },
            error: statsResult.error,
        };
    },
    ['dashboard-data'],
    {
        revalidate: 60, // Cache for 60 seconds
        tags: ['dashboard'],
    }
);

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    await requireAdmin();

    const params = await searchParams;
    const range = (params.range as string) || '30d';

    // Calculate start and end dates
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
        now.setMonth(now.getMonth(), 1);
        now.setHours(0, 0, 0, 0);
    } else if (range === 'all') {
        startTime = new Date(0);
    }

    // Fetch cached data
    const { stats: displayStats, timeSeriesData, error } = await getCachedDashboardData(
        startTime.toISOString(),
        now.toISOString(),
        process.env.NEXT_PUBLIC_SUPABASE_URL!
    );

    if (error) {
        console.error('Error fetching dashboard stats:', error);
    }

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

// Enable static rendering with revalidation
export const revalidate = 60; // Revalidate every 60 seconds
