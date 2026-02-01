'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const VAPID_PUBLIC_KEY = 'BM2DqnspCuAeBKlr_JMocSY5ZiYB8MrP_-VwQjmdDcITmrRPRsGo2XEmmxwEwp3z3T_dcLaf08yw-8yF7obBwcw';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsSubscribed(true);
                        setSubscription(sub);
                        updateSubscriptionOnServer(sub);
                    }
                });
            }).catch(() => {
                // If service worker isn't ready, try to register it
                navigator.serviceWorker.register('/service-worker.js').then(reg => {
                    setRegistration(reg);
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub) {
                            setIsSubscribed(true);
                            setSubscription(sub);
                            updateSubscriptionOnServer(sub);
                        }
                    });
                });
            });
        }
    }, []);

    const updateSubscriptionOnServer = async (sub: PushSubscription) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: user.id,
                    subscription: sub.toJSON()
                }, { onConflict: 'user_id, subscription' });
        }
    };

    const subscribeToPush = async () => {
        if (!registration) return;

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            setIsSubscribed(true);
            setSubscription(sub);
            await updateSubscriptionOnServer(sub);
            alert('Push notifications enabled!');
        } catch (error) {
            console.error('Failed to subscribe to push notifications', error);
            alert('Failed to enable push notifications');
        }
    };

    const unsubscribeFromPush = async () => {
        if (!subscription) return;
        await subscription.unsubscribe();
        setIsSubscribed(false);
        setSubscription(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('push_subscriptions')
                .delete()
                .match({ user_id: user.id, subscription: subscription.toJSON() });
        }
        alert('Push notifications disabled');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${isSubscribed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {isSubscribed ? 'Notifications Active' : 'Notifications Disabled'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {isSubscribed
                            ? 'You will receive instant alerts for new bookings on this device.'
                            : 'Enable push notifications to stay updated on new bookings and changes.'}
                    </p>
                </div>
            </div>

            <div className="pt-2">
                {isSubscribed ? (
                    <button
                        onClick={unsubscribeFromPush}
                        className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Disable Notifications
                    </button>
                ) : (
                    <button
                        onClick={subscribeToPush}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maahi-brand hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Enable Notifications
                    </button>
                )}
            </div>
        </div>
    );
}
