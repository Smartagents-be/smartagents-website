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

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const securedBasePath = getSecuredBasePath(url.pathname);
  const publicAssetPaths = new Set([buildSecuredPath(securedBasePath, '/login.css')]);

  if (publicAssetPaths.has(url.pathname)) {
    return env.ASSETS.fetch(request);
  }

  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies[EXPORT_SESSION_COOKIE];

  if (token && env.EXPORT_SESSION_SECRET) {
    const expected = await generateToken(env.EXPORT_SESSION_SECRET);
    if (timingSafeEqual(token, expected)) {
      return env.ASSETS.fetch(request);
    }
  }

  const loginUrl = `${url.origin}${buildSecuredPath(securedBasePath, '/login')}?redirect=${encodeURIComponent(url.pathname)}`;
  return Response.redirect(loginUrl, 302);
}
