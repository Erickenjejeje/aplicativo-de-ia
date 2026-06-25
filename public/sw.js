const CACHE_NAME = 'orion-ia-cache-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // A simple pass-through to avoid caching problems, but enough to satisfy PWA requirements.
  event.respondWith(fetch(event.request));
});
