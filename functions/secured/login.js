// Cloudflare Pages Function for /secured/login.
// The protected pages live under /secured/, but the request handler must stay
// under functions/secured/ because that is how Pages maps server logic.
import {
  buildSecuredPath,
  generateToken,
  getSecuredBasePath,
  normalizeSecuredRedirect,
  sessionCookieName,
  timingSafeEqual
} from './auth.js';
import { areaRoot } from './areas.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function loginPage(redirectTo, error, securedBasePath, area) {
  const safeRedirect = escapeHtml(redirectTo);
  const tokensStylesheetHref = buildSecuredPath(securedBasePath, '/tokens.css');
  const baseStylesheetHref = buildSecuredPath(securedBasePath, '/base.css');
  const loginStylesheetHref = buildSecuredPath(securedBasePath, '/login.css');
  const loginAction = `${areaRoot(area)}login`;
  const subtitle = area ? `Beveiligde documenten · ${escapeHtml(area.title)}` : 'Beveiligde documenten';
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#e9ebee">
  <title>SmartAgents — Beveiligde documenten</title>
  <link rel="stylesheet" href="${tokensStylesheetHref}">
  <link rel="stylesheet" href="${baseStylesheetHref}">
  <link rel="stylesheet" href="${loginStylesheetHref}">
</head>
<body id="login-body">
  <main id="login-card" class="card">
    <p id="login-brand" class="brand"><span id="login-brand-base" class="brand-base">Smart</span><span id="login-brand-accent" class="brand-accent">Agents</span></p>
    <p id="login-subtitle" class="subtitle">${subtitle}</p>
    <form id="login-form" method="POST" action="${loginAction}">
      <input id="login-redirect" type="hidden" name="redirect" value="${safeRedirect}">
      <label id="login-password-label" for="login-password">Wachtwoord</label>
      <input type="password" id="login-password" name="password" class="${error ? 'has-error' : ''}"${error ? ' aria-describedby="login-error" aria-invalid="true"' : ''} autofocus autocomplete="current-password">
      ${error ? '<p id="login-error" class="error" role="alert">Ongeldig wachtwoord. Probeer opnieuw.</p>' : ''}
      <button id="login-submit" type="submit">Toegang</button>
    </form>
  </main>
</body>
</html>`;
}

/**
 * The login for `/secured/` (`area` null) and for a client area. A client's
 * login takes two passwords: the area's own, which opens that area, and ours,
 * which opens everything — so one of us following a client's link signs in
 * where it lands. Our login takes ours alone.
 *
 * The redirect after a sign-in stays inside what the session opens: a client
 * session cannot be sent to a page it would only bounce off.
 */
export async function handleLogin(context, area = null) {
  const { request, env } = context;
  const url = new URL(request.url);
  const securedBasePath = getSecuredBasePath(url.pathname);
  const areaRootPath = areaRoot(area);
  const loginPath = `${areaRootPath}login`;

  if (request.method === 'GET') {
    const redirect = normalizeSecuredRedirect(url.searchParams.get('redirect') || areaRootPath, securedBasePath);
    const error = url.searchParams.get('error') === '1';
    return new Response(loginPage(redirect, error, securedBasePath, area), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }

  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = String(formData.get('password') || '');
    const redirect = String(formData.get('redirect') || areaRootPath);
    const areaPassword = area ? env[area.password] : null;

    let scope;
    if (env.EXPORT_PASSWORD && timingSafeEqual(password, env.EXPORT_PASSWORD)) {
      scope = null;
    } else if (areaPassword && timingSafeEqual(password, areaPassword)) {
      scope = area.key;
    } else {
      const safeRedirect = normalizeSecuredRedirect(redirect, securedBasePath);
      return Response.redirect(
        `${url.origin}${loginPath}?error=1&redirect=${encodeURIComponent(safeRedirect)}`,
        302
      );
    }

    if (!env.EXPORT_SESSION_SECRET) {
      return new Response('Server misconfiguration', { status: 500 });
    }

    const safeRedirect = scope
      ? redirect.startsWith(areaRootPath) ? redirect : areaRootPath
      : normalizeSecuredRedirect(redirect, securedBasePath);
    const token = await generateToken(env.EXPORT_SESSION_SECRET, scope);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': safeRedirect,
        'Set-Cookie': `${sessionCookieName(scope)}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/secured/`,
        'Cache-Control': 'no-store'
      }
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

export function onRequest(context) {
  return handleLogin(context);
}
