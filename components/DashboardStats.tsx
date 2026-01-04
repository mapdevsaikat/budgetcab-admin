'use client';

import { Users, Calendar, UserCheck, IndianRupee } from 'lucide-react';
import { useState } from 'react';
import InsightsModal from './InsightsModal';
import GrowthChart from './GrowthChart';

interface DashboardStatsProps {
    stats: {
        total_users: number;
        total_bookings: number;
        active_drivers: number;
        total_revenue: number;
    };
    timeSeriesData: {
        userGrowth: { date: string; count: number }[];
        bookingsTimeSeries: { date: string; count: number }[];
        revenueTimeSeries: { date: string; revenue: number }[];
    };
}

export default function DashboardStats({ stats, timeSeriesData }: DashboardStatsProps) {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const statItems = [
        {
            name: 'Total Users',
            value: stats.total_users,
            icon: Users,
            color: 'bg-blue-500',
            modalKey: 'users',
            chartData: timeSeriesData.userGrowth,
            chartTitle: 'User Growth Over Time',
            chartColor: '#3b82f6',
        },
        {
            name: 'Bookings Received',
            value: stats.total_bookings,
            icon: Calendar,
            color: 'bg-indigo-500',
            modalKey: 'bookings',
            chartData: timeSeriesData.bookingsTimeSeries,
            chartTitle: 'Bookings Over Time',
            chartColor: '#6366f1',
        },
        {
            name: 'Online Drivers',
            value: stats.active_drivers,
            icon: UserCheck,
            color: 'bg-green-500',
            modalKey: null, // No chart for online drivers
            chartData: [],
            chartTitle: '',
            chartColor: '',
        },
        {
            name: 'Total Revenue',
            value: `₹${stats.total_revenue.toLocaleString('en-IN')}`,
            icon: IndianRupee,
            color: 'bg-yellow-500',
            modalKey: 'revenue',
            chartData: timeSeriesData.revenueTimeSeries.map(d => ({
                date: d.date,
                count: typeof d.revenue === 'string' ? parseFloat(d.revenue) : Number(d.revenue)
            })),
            chartTitle: 'Revenue Over Time (₹)',
            chartColor: '#eab308',
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item) => (
                    <div
                        key={item.name}
                        onClick={() => item.modalKey && setActiveModal(item.modalKey)}
                        className={`relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 ${item.modalKey ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
                            }`}
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                            {item.modalKey && (
                                <span className="ml-2 text-xs text-blue-600 hover:text-blue-800">View insights →</span>
                            )}
                        </dd>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {statItems.map((item) => (
                item.modalKey && (
                    <InsightsModal
                        key={item.modalKey}
                        isOpen={activeModal === item.modalKey}
                        onClose={() => setActiveModal(null)}
                        title={`${item.name} Insights`}
                    >
                        <div className="h-96">
                            <GrowthChart
                                data={item.chartData}
                                title={item.chartTitle}
                                color={item.chartColor}
                            />
                        </div>
                    </InsightsModal>
                )
            ))}
        </>
    );
}
