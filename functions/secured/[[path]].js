// Cloudflare Pages catch-all guard for /secured/*.
// This is the server-side pair to the static content inside /secured/.
import {
  EXPORT_SESSION_COOKIE,
  buildSecuredPath,
  generateToken,
  getSecuredBasePath,
  parseCookies,
  timingSafeEqual
} from './auth.js';

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

  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies[EXPORT_SESSION_COOKIE];

  if (token && env.EXPORT_SESSION_SECRET) {
    const expected = await generateToken(env.EXPORT_SESSION_SECRET);
    if (timingSafeEqual(token, expected)) {
      return uncached(await env.ASSETS.fetch(request));
    }
  }

  const loginUrl = `${url.origin}${buildSecuredPath(securedBasePath, '/login')}?redirect=${encodeURIComponent(url.pathname)}`;
  return uncached(Response.redirect(loginUrl, 302));
}
