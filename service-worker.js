/*
 * Service worker for the 15 Puzzle PWA.
 * Strategy: cache-first for the app shell (it is fully static), network fallback
 * for anything unexpected. Bump CACHE_VERSION when shipping a new build so old
 * caches are evicated on activation.
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = 'puzzle15-' + CACHE_VERSION;

// The complete app shell -- everything needed to run fully offline.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

// --- Install: precache the app shell ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// --- Activate: drop caches from previous versions ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch: cache-first, then network (and cache the result) ---
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests over http(s); ignore chrome-extension etc.
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          // Cache a copy of valid same-origin responses for future offline use.
          if (response && response.ok && new URL(req.url).origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline and not cached: fall back to the cached app entry page if
          // a navigation was attempted.
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});
