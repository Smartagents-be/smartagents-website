# Export Beveiliging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bescherm alle bestanden onder `/export/*` op Cloudflare Pages via een wachtwoordpagina met HMAC-gesigneerde sessiecookie.

**Architecture:** Twee Cloudflare Pages Functions — `[[path]].js` onderschept alle `/export/*` requests en valideert de sessiecookie; `login.js` serveert het loginformulier en zet de cookie na verificatie. Statische bestanden in `dist/export/` worden ongewijzigd gelaten en geproxied via `env.ASSETS.fetch()`.

**Tech Stack:** Cloudflare Pages Functions (Workers runtime), Web Crypto API (HMAC-SHA256), vanilla HTML/CSS voor loginpagina.

---

## Bestandsstructuur

| Bestand | Actie | Verantwoordelijkheid |
|---------|-------|----------------------|
| `functions/export/[[path]].js` | Nieuw | Middleware: cookie valideren, redirect of proxy naar ASSETS |
| `functions/export/login.js` | Nieuw | GET: loginpagina tonen; POST: wachtwoord valideren + cookie zetten |

---

### Task 1: Middleware `[[path]].js`

**Files:**
- Create: `functions/export/[[path]].js`

- [ ] **Stap 1: Maak het bestand aan**

Maak de map `functions/export/` aan en schrijf `[[path]].js`:

```javascript
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
    if (token === expected) {
      return env.ASSETS.fetch(request);
    }
  }

  const loginUrl = `${url.origin}/export/login?redirect=${encodeURIComponent(url.pathname)}`;
  return Response.redirect(loginUrl, 302);
}
```

- [ ] **Stap 2: Commit**

```bash
git add functions/export/[[path]].js
git commit -m "voeg export middleware toe: bewaakt /export/* met sessiecookie"
```

---

### Task 2: Loginpagina `login.js`

**Files:**
- Create: `functions/export/login.js`

- [ ] **Stap 1: Maak `login.js` aan**

```javascript
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

function loginPage(redirectTo, error) {
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
    <form method="POST" action="/export/login">
      <input type="hidden" name="redirect" value="${redirectTo}">
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
    const redirect = url.searchParams.get('redirect') || '/export/';
    const error = url.searchParams.get('error') === '1';
    return new Response(loginPage(redirect, error), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password') || '';
    const redirect = formData.get('redirect') || '/export/';

    // Valideer redirect: mag enkel verwijzen naar /export/
    const safeRedirect = redirect.startsWith('/export/') ? redirect : '/export/';

    if (!env.EXPORT_PASSWORD || password !== env.EXPORT_PASSWORD) {
      return Response.redirect(
        `${url.origin}/export/login?error=1&redirect=${encodeURIComponent(safeRedirect)}`,
        302
      );
    }

    const token = await generateToken(env.EXPORT_SESSION_SECRET);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': safeRedirect,
        'Set-Cookie': `export_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/export`
      }
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
```

- [ ] **Stap 2: Commit**

```bash
git add functions/export/login.js
git commit -m "voeg export loginpagina toe: wachtwoord validatie en sessiecookie"
```

---

### Task 3: Lokaal testen met Wrangler

**Files:** geen wijzigingen

- [ ] **Stap 1: Start lokale preview**

Wrangler Pages dev serveert `dist/` als statische assets én laadt de `functions/` map:

```bash
npx wrangler pages dev dist --compatibility-date=2026-03-22
```

Verwacht: `Serving at http://localhost:8788`

- [ ] **Stap 2: Test redirect zonder cookie**

Open `http://localhost:8788/export/smartscan-rapport-claes-logistics.html` in de browser.

Verwacht: redirect naar `/export/login?redirect=%2Fexport%2Fsmartscan-rapport-claes-logistics.html`

- [ ] **Stap 3: Test loginpagina**

Open `http://localhost:8788/export/login`.

Verwacht: styled loginpagina met SmartAgents branding, wachtwoordveld en knop.

- [ ] **Stap 4: Test verkeerd wachtwoord**

Vul een willekeurig wachtwoord in en submit.

Verwacht: loginpagina opnieuw met rode foutmelding "Ongeldig wachtwoord. Probeer opnieuw."

- [ ] **Stap 5: Test met juist wachtwoord via `--binding`**

Stop de server (Ctrl+C) en herstart met tijdelijke env vars:

```bash
npx wrangler pages dev dist \
  --compatibility-date=2026-03-22 \
  --binding EXPORT_PASSWORD=testpw \
  --binding EXPORT_SESSION_SECRET=supergeheimesecretstring32chars!!
```

Vul `testpw` in op de loginpagina.

Verwacht: redirect terug naar het originele rapport, bestand wordt getoond.

- [ ] **Stap 6: Verifieer cookie**

Open DevTools → Application → Cookies → `localhost`.

Verwacht: cookie `export_session` aanwezig, `HttpOnly` aangevinkt.

- [ ] **Stap 7: Test herbezoek zonder opnieuw inloggen**

Refresh de rapportpagina.

Verwacht: rapport wordt direct getoond, geen redirect naar login.

---

### Task 4: Environment variabelen instellen in Cloudflare Pages

**Files:** geen wijzigingen

- [ ] **Stap 1: Genereer een sterk session secret**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Kopieer de output (64 hex-tekens). Dit wordt `EXPORT_SESSION_SECRET`.

- [ ] **Stap 2: Stel env vars in via Cloudflare dashboard**

1. Ga naar [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → `smartagents-website`
2. Settings → Environment Variables → Production
3. Voeg toe:
   - `EXPORT_PASSWORD` = het gedeelde wachtwoord voor klanten
   - `EXPORT_SESSION_SECRET` = de gegenereerde hex-string uit stap 1
4. Klik "Save"

- [ ] **Stap 3: Deploy en verifieer op productie**

```bash
git push
```

Na deployment: open `https://smartagents.be/export/smartscan-rapport-claes-logistics.html`.

Verwacht: redirect naar loginpagina. Vul het juiste wachtwoord in → rapport wordt getoond.
