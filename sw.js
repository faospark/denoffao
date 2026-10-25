/**
 * sw.js — Progressive Web App Service Worker for Den of Fao
 * Compatible with XAMPP Apache (/denoffao/) and GitHub Pages (denoffao.me)
 */

const CACHE_NAME = 'denoffao-pwa-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './projects.html',
  './mods.html',
  './blog.html',
  './guestbook.html',
  './project-chrono-cross.html',
  './project-saga-frontier.html',
  './project-ffvi-old-ver-mods.html',
  './project-ffvi-old-ver-tile-tool.html',
  './project-kupo-library.html',
  './project-kupo-ui-pr.html',
  './project-kyaro.html',
  './project-kyaro-pc.html',
  './project-suisaveeditor.html',
  './assets/obsidian.css',
  './components.js',
  './site.webmanifest',
  './favicon.svg',
  './favicon-96x96.png',
  './apple-touch-icon.png',
  './web-app-manifest-192x192.png',
  './web-app-manifest-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache each core asset individually so a single missing optional path never aborts install
      return Promise.allSettled(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle standard GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (e.g. Google Translate, Discord/YouTube embeds)
  if (url.origin !== self.location.origin) return;

  const isHTML =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html') ||
    url.pathname.endsWith('.html');

  const isCodeOrStyle =
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.webmanifest');

  // Network-First for HTML, CSS, and JS so live updates always appear immediately when online
  if (isHTML || isCodeOrStyle) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (isHTML) return caches.match('./index.html');
            return Response.error();
          })
        )
    );
    return;
  }

  // Stale-While-Revalidate for local images, icons, and media assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
