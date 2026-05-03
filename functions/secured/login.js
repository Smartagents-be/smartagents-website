// Cloudflare Pages Function for /secured/login.
// The protected pages live under /secured/, but the request handler must stay
// under functions/secured/ because that is how Pages maps server logic.
import {
  EXPORT_SESSION_COOKIE,
  buildSecuredPath,
  generateToken,
  getSecuredBasePath,
  normalizeSecuredRedirect,
  timingSafeEqual
} from './auth.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function loginPage(redirectTo, error, securedBasePath) {
  const safeRedirect = escapeHtml(redirectTo);
  const siteBasePath = securedBasePath.replace(/\/secured$/, '');
  const baseStylesheetHref = `${siteBasePath || ''}/shared/css/base.css`;
  const loginStylesheetHref = buildSecuredPath(securedBasePath, '/login.css');
  const loginAction = buildSecuredPath(securedBasePath, '/login');
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartAgents — Beveiligde documenten</title>
  <link rel="stylesheet" href="${baseStylesheetHref}">
  <link rel="stylesheet" href="${loginStylesheetHref}">
</head>
<body>
  <div class="card">
    <div class="brand"><span class="brand-base">Smart</span><span class="brand-accent">Agents</span></div>
    <div class="subtitle">Beveiligde documenten</div>
    <form method="POST" action="${loginAction}">
      <input type="hidden" name="redirect" value="${safeRedirect}">
      <label for="password">Wachtwoord</label>
      <input type="password" id="password" name="password" class="${error ? 'has-error' : ''}" autofocus autocomplete="current-password">
      ${error ? '<div class="error">Ongeldig wachtwoord. Probeer opnieuw.</div>' : ''}
      <button type="submit">Toegang</button>
    </form>
  </div>
</body>
</html>`;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const securedBasePath = getSecuredBasePath(url.pathname);
  const securedRootPath = buildSecuredPath(securedBasePath, '/');
  const loginPath = buildSecuredPath(securedBasePath, '/login');

  if (request.method === 'GET') {
    const redirect = normalizeSecuredRedirect(url.searchParams.get('redirect') || securedRootPath, securedBasePath);
    const error = url.searchParams.get('error') === '1';
    return new Response(loginPage(redirect, error, securedBasePath), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }

  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password') || '';
    const redirect = formData.get('redirect') || securedRootPath;
    const safeRedirect = normalizeSecuredRedirect(redirect, securedBasePath);

    if (!env.EXPORT_PASSWORD || !timingSafeEqual(password, env.EXPORT_PASSWORD)) {
      return Response.redirect(
        `${url.origin}${loginPath}?error=1&redirect=${encodeURIComponent(safeRedirect)}`,
        302
      );
    }

    if (!env.EXPORT_SESSION_SECRET) {
      return new Response('Server misconfiguration', { status: 500 });
    }

    const token = await generateToken(env.EXPORT_SESSION_SECRET);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': safeRedirect,
        'Set-Cookie': `${EXPORT_SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=${securedRootPath}`,
        'Cache-Control': 'no-store'
      }
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
