// iOS-optimized Service Worker
// Addresses iOS Safari's service worker limitations and 50MB cache limit

const CACHE_NAME = 'better-chatbot-v1';
const MAX_CACHE_SIZE = 45 * 1024 * 1024; // 45MB (under iOS 50MB limit)

// Critical resources to cache
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache critical resources on iOS to stay under limit
        const isIOS = /iPad|iPhone|iPod/.test(self.navigator.userAgent);
        if (isIOS) {
          return cache.addAll(CRITICAL_RESOURCES.slice(0, 2)); // Only cache most critical
        }
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .catch((error) => {
        console.warn('Service worker install failed:', error);
      })
  );
  
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response (with size check for iOS)
            caches.open(CACHE_NAME)
              .then(async (cache) => {
                try {
                  // Check cache size before adding (iOS optimization)
                  const isIOS = /iPad|iPhone|iPod/.test(self.navigator.userAgent);
                  if (isIOS) {
                    const cacheSize = await getCacheSize(cache);
                    const responseSize = await getResponseSize(responseToCache.clone());
                    
                    if (cacheSize + responseSize > MAX_CACHE_SIZE) {
                      console.warn('Cache size limit reached, skipping cache');
                      return;
                    }
                  }
                  
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('Failed to cache response:', error);
                }
              });

            return response;
          })
          .catch(() => {
            // Network failed, try to serve a fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            throw new Error('Network failed and no cache available');
          });
      })
  );
});

// Helper function to calculate cache size (iOS optimization)
async function getCacheSize(cache) {
  const requests = await cache.keys();
  let totalSize = 0;
  
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    } catch (error) {
      console.warn('Error calculating cache size:', error);
    }
  }
  
  return totalSize;
}

// Helper function to get response size
async function getResponseSize(response) {
  try {
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.warn('Error getting response size:', error);
    return 0;
  }
}

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notify clients of cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    caches.open(CACHE_NAME).then(async (cache) => {
      const size = await getCacheSize(cache);
      event.ports[0].postMessage({
        type: 'CACHE_STATUS',
        size: size,
        maxSize: MAX_CACHE_SIZE,
        usage: (size / MAX_CACHE_SIZE) * 100
      });
    });
  }
});