// Simple service worker - no caching for now
self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Just pass through - no caching
  event.respondWith(fetch(event.request));
});
