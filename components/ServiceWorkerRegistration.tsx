'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      const swUrl = '/service-worker.js';
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New service worker available, prompt user to refresh
                    if (confirm('A new version is available. Refresh to update?')) {
                      window.location.reload();
                    }
                  } else {
                    // First time installation
                    console.log('Service Worker installed for the first time');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Check for service worker updates periodically (every hour)
      const updateInterval = setInterval(() => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.update();
          });
        });
      }, 60 * 60 * 1000); // Check every hour

      return () => {
        clearInterval(updateInterval);
      };
    }
  }, []);

  return null;
}
