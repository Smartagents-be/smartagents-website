// Cloudflare Pages catch-all guard for /secured/*.
// This is the server-side pair to the static content inside /secured/.
import { buildSecuredPath, getSecuredBasePath, hasSession, parseCookies } from './auth.js';
import { CLIENT_AREAS, SHARED_PREFIXES, areaForPath, areaRoot, movedDeckPath } from './areas.js';

/**
 * Nothing behind the password is held anywhere. `public/_headers` says the same
 * for `/secured/*`, but a response this Function builds itself — the redirect
 * to the login page — never passes through that file. `no-store` and not
 * `no-cache`: the second permits a copy on disk as long as it is revalidated,
 * and a pitch deck on a shared laptop's disk is what the gate is for.
 */
function uncached(response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/**
 * Who may see what:
 *
 * - our session opens everything under /secured/, the client areas included;
 * - a client area's session opens `/secured/<key>/` and the shared deck
 *   runtime, and nothing else — not the overview, not another client's deck;
 * - the login stylesheets are open to anyone, because the login page needs
 *   them before there is a session at all.
 *
 * A client deck's old address, from before the areas, is redirected before
 * any of that: the link a client was sent has to reach their own login, not
 * ours.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const securedBasePath = getSecuredBasePath(url.pathname);
  const publicAssetPaths = new Set([
    buildSecuredPath(securedBasePath, '/login.css'),
    buildSecuredPath(securedBasePath, '/base.css'),
    buildSecuredPath(securedBasePath, '/tokens.css')
  ]);

  if (publicAssetPaths.has(url.pathname)) {
    return uncached(await env.ASSETS.fetch(request));
  }

  const moved = movedDeckPath(url.pathname);
  if (moved) {
    return uncached(Response.redirect(`${url.origin}${moved}${url.search}`, 301));
  }

  const cookies = parseCookies(request.headers.get('Cookie'));
  const area = areaForPath(url.pathname);

  if (await hasSession(cookies, env)) {
    return uncached(await env.ASSETS.fetch(request));
  }

  if (area && (await hasSession(cookies, env, area.key))) {
    return uncached(await env.ASSETS.fetch(request));
  }

  if (SHARED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    for (const each of CLIENT_AREAS) {
      if (await hasSession(cookies, env, each.key)) {
        return uncached(await env.ASSETS.fetch(request));
      }
    }
  }

  const loginUrl = `${url.origin}${areaRoot(area)}login?redirect=${encodeURIComponent(url.pathname)}`;
  return uncached(Response.redirect(loginUrl, 302));
}
