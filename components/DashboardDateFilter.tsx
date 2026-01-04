'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardDateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [range, setRange] = useState(searchParams.get('range') || '30d');

    const ranges = [
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'This Month', value: 'this_month' },
        { label: 'Last Month', value: 'last_month' },
        { label: 'All Time', value: 'all' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRange = e.target.value;
        setRange(newRange);
        const params = new URLSearchParams(window.location.search);
        params.set('range', newRange);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="date-range" className="text-sm font-medium text-gray-700">
                Date Range:
            </label>
            <select
                id="date-range"
                value={range}
                onChange={handleChange}
                className="block w-48 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-maahi-brand focus:outline-none focus:ring-maahi-brand sm:text-sm"
            >
                {ranges.map((r) => (
                    <option key={r.value} value={r.value}>
                        {r.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
