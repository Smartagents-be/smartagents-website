// Client areas inside /secured/: a sub-tree with a password of its own.
//
// `/secured/` is one password for us. A client area is `/secured/<key>/`, and
// its own password opens that sub-tree and nothing else, so a deck can be
// handed to a client without handing over every other client's pitch. Our
// password still opens everything, the client areas included.
//
// This file is read by both halves: the Pages Functions that guard the URLs,
// and the build (`build/lib/decks.mjs`, `src/layouts/deck.mjs`) that decides
// where a deck is written. A deck is in an area by its slug, so moving one in
// or out is an edit here and nowhere else — the URL, the overview section, the
// guard and the redirect from the old address all follow.

/**
 * `password` names the Pages secret that opens the area (set it in the
 * dashboard, like `EXPORT_PASSWORD`). `prefix` claims every deck and document
 * whose slug starts with it; `slugs` claims the ones named before the prefix
 * rule existed.
 */
export const CLIENT_AREAS = [
  {
    key: 'isabel',
    title: 'Isabel',
    password: 'SECURED_ISABEL_PASSWORD',
    prefix: 'isabel',
    slugs: ['rce-coaching']
  }
];

/**
 * Served to any valid session, ours or a client's: the brand stylesheets and
 * the deck runtime every deck loads. None of it carries client content, and
 * without it a client's deck renders unstyled.
 */
export const SHARED_PREFIXES = ['/secured/presentations/shared/', '/secured/overview.css'];

export function areaForSlug(slug) {
  return CLIENT_AREAS.find((area) => slug.startsWith(area.prefix) || area.slugs.includes(slug)) || null;
}

/** The area a URL path lies in, or null for the rest of /secured/. */
export function areaForPath(pathname) {
  return CLIENT_AREAS.find((area) => pathname === `/secured/${area.key}` || pathname.startsWith(`/secured/${area.key}/`)) || null;
}

export function areaRoot(area) {
  return area ? `/secured/${area.key}/` : '/secured/';
}

/** Where a deck is published: under its client's area, or with the rest. */
export function deckPath(slug) {
  return `${areaRoot(areaForSlug(slug))}presentations/${slug}/`;
}

/**
 * A client deck used to live at `/secured/presentations/<slug>/` with every
 * other deck, and those links have been sent out. The new address for an old
 * one, or null when the path was never a client deck's.
 */
export function movedDeckPath(pathname) {
  const match = pathname.match(/^\/secured\/presentations\/([^/]+)(\/.*)?$/);
  if (!match || !areaForSlug(match[1])) return null;
  return `${deckPath(match[1])}${(match[2] || '/').slice(1)}`;
}
