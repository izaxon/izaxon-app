/* Bump VERSION whenever a file in APP_SHELL changes. */
const VERSION = '2026-11-03-1';
const SCOPE = new URL(self.registration.scope);
const CACHE_PREFIX = `izaxon-app-shell:${SCOPE.pathname}:`;
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/icons/icon-maskable-512.png',
  './assets/fonts/geist-latin.woff2',
  './assets/fonts/geist-mono-latin.woff2',
].map((path) => new URL(path, SCOPE).href);

const APP_SHELL_URLS = new Set(APP_SHELL);
const STATIC_ASSET_URLS = new Set(
  APP_SHELL.filter((url) => /\.(png|woff2)$/.test(url)),
);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: 'reload' })));
    // A new version waits until the app asks to update, or all old tabs close.
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

async function networkFirst(request, cacheKey) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response.ok) return response;
    return (await caches.match(cacheKey, { cacheName: CACHE_NAME })) || response;
  } catch {
    return (await caches.match(cacheKey, { cacheName: CACHE_NAME })) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;

  // Cache only the explicit app shell, never APIs or external destinations.
  const cacheKey = new URL(url.pathname, SCOPE.origin).href;
  if (!APP_SHELL_URLS.has(cacheKey)) return;

  if (STATIC_ASSET_URLS.has(cacheKey)) {
    event.respondWith((async () => (
      (await caches.match(cacheKey, { cacheName: CACHE_NAME })) || fetch(request)
    ))());
    return;
  }

  // HTML, CSS, JS and the manifest use the network when available. The
  // fallback stays the complete snapshot made at installation, not a mix of
  // independently refreshed files. Query strings do not create extra caches.
  event.respondWith(networkFirst(request, cacheKey));
});
