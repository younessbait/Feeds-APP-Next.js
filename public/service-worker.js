/* eslint-disable no-restricted-globals */
// Basic service worker for push notifications with error handling

self.addEventListener('install', (event) => {
  // Activate new worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of open pages
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    if (event.data) {
      const text = event.data.text();
      try {
        payload = JSON.parse(text);
      } catch (_) {
        payload = { title: 'New Notification', body: text };
      }
    }
  } catch (err) {
    // Fallback to empty payload
    payload = {};
  }

  const title = payload.title || 'Notification';
  const body = payload.body || 'You have a new message';
  const data = { url: payload.url || '/', ...payload.data };

  const options = {
    body,
    data,
    // icon: '/icons/icon-192.png',
    // badge: '/icons/badge.png',
    tag: payload.tag,
    renotify: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow && targetUrl) {
          return self.clients.openWindow(targetUrl);
        }
      })
      .catch((err) => {
        // Swallow errors to avoid unhandled rejections
        console.error('[SW] notificationclick error', err);
      })
  );
});

