// Hand-written service worker. The VERSION and SHELL placeholders below are
// substituted by build/render.mjs with the hashed assets from the Vite manifest.
// See .claude/skills/fast-static-site/SKILL.md §7.
/* eslint-env serviceworker */

const VERSION = '__VERSION__';
const SHELL = '__PRECACHE__';
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const IMAGE_LIMIT = 200;

const CURRENT = new Set([PAGES, ASSETS, IMAGES]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSETS).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const names = await caches.keys();
      await Promise.all(names.filter((name) => !CURRENT.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

/** Keep the image cache bounded. */
async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

/** HTML: stale-while-revalidate, so repeat views render from cache instantly. */
async function handlePage(event) {
  const cache = await caches.open(PAGES);
  const cached = await cache.match(event.request);

  const network = (async () => {
    const preload = await event.preloadResponse;
    const response = preload || (await fetch(event.request));
    if (response && response.ok) await cache.put(event.request, response.clone());
    return response;
  })();

  if (cached) {
    event.waitUntil(network.catch(() => {}));
    return cached;
  }

  try {
    return await network;
  } catch (error) {
    return cached || Response.error();
  }
}

/** Hashed assets are immutable: cache-first, never revalidate. */
async function handleAsset(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function handleImage(request) {
  const cache = await caches.open(IMAGES);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    trim(IMAGES, IMAGE_LIMIT);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // The password-gated area must always reach the server.
  if (url.pathname.startsWith('/secured/')) return;

  // Videos are left to the browser's HTTP cache so range requests keep working.
  if (request.destination === 'video' || request.destination === 'audio') return;

  if (request.mode === 'navigate') {
    event.respondWith(handlePage(event));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(handleAsset(request));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(handleImage(request));
  }
});
