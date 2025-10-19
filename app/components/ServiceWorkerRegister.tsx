"use client";
import { useEffect } from 'react';

function isSecure() {
  if (typeof window === 'undefined') return false;
  return (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service workers not supported in this browser');
      return;
    }

    if (!isSecure()) {
      console.warn('[SW] Service worker requires HTTPS or localhost');
      return;
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
        console.info('[SW] Registered with scope:', reg.scope);

        // Optionally request permission for notifications
        if ('Notification' in window) {
          try {
            if (Notification.permission === 'default') {
              const result = await Notification.requestPermission();
              console.info('[SW] Notification permission:', result);
            }
          } catch (err) {
            console.error('[SW] Failed to request notification permission', err);
          }
        }
      } catch (err) {
        console.error('[SW] Registration failed', err);
      }
    };

    register();
  }, []);

  return null;
}

