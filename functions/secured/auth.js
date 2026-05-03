// Shared auth helpers for the /secured/* Cloudflare Pages Functions.
const EXPORT_SESSION_COOKIE = 'export_session';
const EXPORT_ACCESS_MESSAGE = 'export-access';

export async function generateToken(secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(EXPORT_ACCESS_MESSAGE));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function parseCookies(header) {
  const cookies = {};
  for (const part of (header || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    cookies[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return cookies;
}

export function getSecuredBasePath(pathname) {
  const marker = '/secured';
  const index = String(pathname || '').indexOf(marker);

  if (index === -1) {
    return marker;
  }

  return pathname.slice(0, index) + marker;
}

export function buildSecuredPath(basePath, suffix = '') {
  const normalizedBasePath = String(basePath || '/secured').replace(/\/+$/, '') || '/secured';

  if (!suffix) {
    return normalizedBasePath;
  }

  if (suffix === '/') {
    return `${normalizedBasePath}/`;
  }

  return `${normalizedBasePath}${suffix.startsWith('/') ? suffix : `/${suffix}`}`;
}

export function normalizeSecuredRedirect(redirect, basePath) {
  const securedRoot = buildSecuredPath(basePath, '/');
  return typeof redirect === 'string' && redirect.startsWith(securedRoot) ? redirect : securedRoot;
}

export { EXPORT_SESSION_COOKIE };
