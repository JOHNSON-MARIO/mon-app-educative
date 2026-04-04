// Nom du cache
const CACHE_NAME = 'my-site-cache-v1';

// Fichiers à mettre en cache
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/script/main.js',
  '/images/logo.png'
];

// INSTALLATION
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Active immédiatement le SW

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Erreur lors du cache :', error);
      })
  );
});

// ACTIVATION
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim(); // Prend le contrôle immédiatement
});

// FETCH (stratégie cache-first)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si trouvé en cache → retourne
        if (response) {
          return response;
        }

        // Sinon → fetch + mise en cache dynamique
        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
      })
      .catch(() => {
        // Optionnel : fallback si offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
