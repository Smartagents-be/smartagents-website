const ALLOWED_ORIGINS = ['https://smartagents.be', 'https://www.smartagents.be'];

function isAllowedOrigin(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.smartagents-website.pages.dev');
  } catch {
    return false;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get('Origin') || '';
  if (!isAllowedOrigin(origin)) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const turnstileToken = body['cf-turnstile-response'];
  if (!turnstileToken || typeof turnstileToken !== 'string') {
    return jsonResponse({ error: 'Missing captcha token' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) {
    return jsonResponse({ error: 'Unable to verify request origin' }, 403);
  }

  const verified = await verifyTurnstile(turnstileToken, ip, env.TURNSTILE_SECRET_KEY);
  if (!verified.success) {
    return jsonResponse({ error: 'Captcha verification failed' }, 403);
  }

  const rateLimitError = await checkAndIncrementRateLimit(env.CONTACT_RATE, ip);
  if (rateLimitError) {
    return jsonResponse({ error: rateLimitError }, 429);
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  context.waitUntil(forwardToN8n(body, env.N8N_WEBHOOK_URL, env.N8N_SHARED_SECRET));

  return jsonResponse({ ok: true }, 200);
}

async function verifyTurnstile(token, ip, secretKey) {
  const form = new FormData();
  form.append('secret', secretKey);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form
    });
    return res.json();
  } catch {
    return { success: false };
  }
}

async function checkAndIncrementRateLimit(kv, ip) {
  if (!kv) return null;
  const hourBucket = Math.floor(Date.now() / 3_600_000);
  const ipKey = `rate:ip:${ip}:${hourBucket}`;
  const globalKey = `rate:global:${hourBucket}`;

  const [ipRaw, globalRaw] = await Promise.all([
    kv.get(ipKey),
    kv.get(globalKey)
  ]);

  const ipCount = parseInt(ipRaw || '0', 10);
  const globalCount = parseInt(globalRaw || '0', 10);

  if (ipCount >= 5) return 'Too many requests from your IP';
  if (globalCount >= 100) return 'Service temporarily unavailable';

  await Promise.all([
    kv.put(ipKey, String(ipCount + 1), { expirationTtl: 7200 }),
    kv.put(globalKey, String(globalCount + 1), { expirationTtl: 7200 })
  ]);

  return null;
}

function validatePayload(body) {
  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return 'Missing required fields: name, email, subject, message';
  }
  if (typeof name !== 'string' || name.trim().length === 0) return 'Invalid name';
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
  if (typeof subject !== 'string') return 'Invalid subject';
  if (typeof message !== 'string') return 'Invalid message';
  if (name.length > 100) return 'Name too long';
  if (email.length > 200) return 'Email too long';
  if (subject.length > 200) return 'Subject too long';
  if (message.length > 5000) return 'Message too long';

  return null;
}

async function forwardToN8n(body, webhookUrl, sharedSecret) {
  const { name, email, subject, message, company, intent, page_context } = body;

  const payload = { name, email, subject, message };
  if (company) payload.company = String(company).slice(0, 200);
  if (intent) payload.intent = String(intent).slice(0, 100);
  if (page_context) payload.page_context = String(page_context).slice(0, 200);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-SmartAgents-Secret': sharedSecret
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return false;
  }
}


function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
