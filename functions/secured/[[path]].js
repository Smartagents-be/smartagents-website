async function generateToken(secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode('export-access'));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function parseCookies(header) {
  const cookies = {};
  for (const part of (header || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    cookies[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return cookies;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies['export_session'];

  if (token && env.EXPORT_SESSION_SECRET) {
    const expected = await generateToken(env.EXPORT_SESSION_SECRET);
    if (timingSafeEqual(token, expected)) {
      return env.ASSETS.fetch(request);
    }
  }

  const loginUrl = `${url.origin}/secured/login?redirect=${encodeURIComponent(url.pathname)}`;
  return Response.redirect(loginUrl, 302);
}
