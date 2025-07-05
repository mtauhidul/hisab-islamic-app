const CACHE_NAME = 'hisabdaily-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

/**
 * Install event - cache resources
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

/**
 * Background sync event for offline counter updates
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'counter-sync') {
    event.waitUntil(syncCounterData());
  }
});

/**
 * Sync counter data with Firestore when online
 */
async function syncCounterData() {
  try {
    // This would need to be implemented with the Firebase SDK
    // For now, we'll rely on the app-level sync
    console.log('Syncing counter data...');
  } catch (error) {
    console.error('Failed to sync counter data:', error);
  }
}
