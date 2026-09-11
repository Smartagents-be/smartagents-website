// Hand-written service worker. The VERSION and SHELL placeholders below are
// substituted by build/render.mjs with the hashed assets from the Vite manifest.
// See .claude/skills/fast-static-site/SKILL.md §7.
/* eslint-env serviceworker */

const VERSION = '__VERSION__';
const CONTENT = '__CONTENT__';
const SHELL = '__PRECACHE__';
/* Three caches, keyed on three different things, because they go stale for
   three different reasons.

   `pages` holds documents, and a document changes whenever a word does, so it
   is keyed on a hash of the rendered HTML. Keyed on the asset names it survived
   every copy-only deploy, and stale-while-revalidate then served the *previous*
   HTML on the first view of every page to every returning visitor.

   `assets` holds hashed files, and a hashed URL is its own version, so the
   cache is not versioned at all. A versioned name plus `skipWaiting()` deleted
   the cache under a page that was already open, and the next chunk that page
   imported lazily was gone from the cache and from the server both. Holding a
   few generations, bounded by `ASSET_LIMIT`, keeps the old chunk reachable.

   `images` stays on `VERSION`: `/media/` is un-hashed, so an image can change
   under a URL it keeps and the version is the only thing that invalidates it. */
const PAGES = `pages-${CONTENT}`;
const ASSETS = 'assets';
const IMAGES = `images-${VERSION}`;
const IMAGE_LIMIT = 200;
/* The page cache was the one unbounded cache here. A visitor who reads every
   page in three languages holds 60 documents, which is small — but nothing in
   the handler said so, and the bound is what stops a crawler, a language switch
   loop or a future sitemap from filling a phone's quota. 80 is well over the
   site's own page count, so an ordinary visit never evicts anything. */
const PAGE_LIMIT = 80;
/* Room for several builds of a site whose whole JS and CSS surface is about a
   dozen files. `trim()` evicts in insertion order, so the oldest generation
   falls out first — the one no open tab can still be asking for. */
const ASSET_LIMIT = 60;

const CURRENT = new Set([PAGES, ASSETS, IMAGES]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(ASSETS)
      .then((cache) => cache.addAll(SHELL).then(() => trim(ASSETS, ASSET_LIMIT)))
      .then(() => self.skipWaiting())
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

/**
 * A response is only worth caching if it is what was asked for. A URL that
 * matches nothing can be answered with HTML and a 200, which `response.ok` calls
 * fine — and a cache-first handler that trusts `ok` then holds that HTML under
 * the asset's own URL for as long as the cache lives, with no amount of
 * reloading helping, because the network is never consulted.
 */
function isCacheable(response, expected) {
  if (!response.ok) return false;
  const type = response.headers.get('Content-Type') || '';
  return expected ? type.startsWith(expected) : !type.startsWith('text/html');
}

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
    /* `response.ok` alone is not the test, for the reason `isCacheable` exists: a
       navigation is any top-level request the browser makes, including a click
       on one of the course PDFs, so trusting `ok` put 200 KB of one-pager in the
       page cache. */
    if (isCacheable(response, 'text/html')) {
      await cache.put(event.request, response.clone());
      await trim(PAGES, PAGE_LIMIT);
    }
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
  if (isCacheable(response)) {
    await cache.put(request, response.clone());
    await trim(ASSETS, ASSET_LIMIT);
  }
  return response;
}

async function handleImage(request) {
  const cache = await caches.open(IMAGES);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response, 'image/')) {
    await cache.put(request, response.clone());
    await trim(IMAGES, IMAGE_LIMIT);
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
