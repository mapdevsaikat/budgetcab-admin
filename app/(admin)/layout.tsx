import { requireAdmin } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import BookingNotifications from '@/components/BookingNotifications';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = await requireAdmin();

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar userEmail={user.email} />
            <BookingNotifications />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
