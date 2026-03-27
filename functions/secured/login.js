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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function loginPage(redirectTo, error) {
  const safeRedirect = escapeHtml(redirectTo);
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartAgents — Beveiligde documenten</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e8e8f0;
    }
    .card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
      background: #13131a;
      border: 1px solid #1e1e2e;
      border-radius: 12px;
    }
    .brand {
      font-size: 1.4rem;
      font-weight: 700;
      color: #00d8ff;
      letter-spacing: -0.02em;
      margin-bottom: 0.4rem;
    }
    .subtitle {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 2rem;
    }
    label {
      display: block;
      font-size: 0.82rem;
      color: #aaa;
      margin-bottom: 0.4rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.7rem 0.9rem;
      background: #0a0a0f;
      border: 1px solid ${error ? '#ff4d4d' : '#2a2a3a'};
      border-radius: 8px;
      color: #e8e8f0;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.15s;
    }
    input[type="password"]:focus {
      border-color: #00d8ff;
    }
    .error {
      margin-top: 0.5rem;
      font-size: 0.82rem;
      color: #ff4d4d;
    }
    button {
      margin-top: 1.5rem;
      width: 100%;
      padding: 0.75rem;
      background: #00d8ff;
      color: #0a0a0f;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    button:hover { opacity: 0.85; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">SmartAgents</div>
    <div class="subtitle">Beveiligde documenten</div>
    <form method="POST" action="/secured/login">
      <input type="hidden" name="redirect" value="${safeRedirect}">
      <label for="password">Wachtwoord</label>
      <input type="password" id="password" name="password" autofocus autocomplete="current-password">
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

  if (request.method === 'GET') {
    const redirect = url.searchParams.get('redirect') || '/secured/';
    const error = url.searchParams.get('error') === '1';
    return new Response(loginPage(redirect, error), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }

  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password') || '';
    const redirect = formData.get('redirect') || '/secured/';

    // Valideer redirect: mag enkel verwijzen naar /secured/
    const safeRedirect = redirect.startsWith('/secured/') ? redirect : '/secured/';

    if (!env.EXPORT_PASSWORD || !timingSafeEqual(password, env.EXPORT_PASSWORD)) {
      return Response.redirect(
        `${url.origin}/secured/login?error=1&redirect=${encodeURIComponent(safeRedirect)}`,
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
        'Set-Cookie': `export_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/secured/`,
        'Cache-Control': 'no-store'
      }
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
