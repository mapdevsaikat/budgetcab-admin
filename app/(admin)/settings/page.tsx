import PushNotificationManager from '@/components/PushNotificationManager';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                <SettingsIcon className="w-8 h-8 text-maahi-brand" />
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-maahi-brand px-6 py-4">
                        <h2 className="text-lg font-semibold text-white">Notifications</h2>
                        <p className="text-red-100 text-sm">Configure how you receive alerts</p>
                    </div>
                    <div className="p-6">
                        <PushNotificationManager />
                    </div>
                </section>

                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-50">
                    <div className="bg-gray-100 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-700">Account Profile</h2>
                        <p className="text-gray-500 text-sm">Update your information (Coming Soon)</p>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-400 italic">Profile management is under development.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
