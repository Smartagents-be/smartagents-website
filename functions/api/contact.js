const ALLOWED_ORIGINS = ['https://smartagents.be', 'https://www.smartagents.be'];

/**
 * Used when a submission arrives without one. The form renders `subject` as a
 * hidden field, so in practice every submission carries its own; this is the
 * floor, not the norm.
 */
const DEFAULT_SUBJECT = 'Contact request via smartagents.be';

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

  const validationError = validatePayload(body);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  // Validation first, then the counter. The other way round a malformed
  // submission burned one of the caller's five attempts an hour, so a visitor
  // who mistyped an e-mail address five times was locked out of the site's only
  // conversion path for the rest of the hour — and while the endpoint rejected
  // every submission the form made, five page loads locked out everyone. The
  // counter now only ever counts a submission that was worth forwarding.
  const rateLimitError = await checkAndIncrementRateLimit(env.CONTACT_RATE, ip);
  if (rateLimitError) {
    return jsonResponse({ error: rateLimitError }, 429);
  }

  // Awaited, not `waitUntil`. Handed to `waitUntil` this call outlived the
  // response, so its result could not reach the visitor: a missing
  // `N8N_WEBHOOK_URL` or a webhook that was down both answered `{ ok: true }`
  // and dropped the message. A contact form that reports success it cannot
  // vouch for is worse than one that reports failure, because nobody goes
  // looking. The cost is that the visitor waits for n8n; that is the right way
  // round for the site's only conversion path.
  const delivered = await forwardToN8n(body, env.N8N_WEBHOOK_URL, env.N8N_SHARED_SECRET);
  if (!delivered) {
    return jsonResponse({ error: 'Unable to deliver message' }, 502);
  }

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

/**
 * What a submission must carry: a name, an e-mail and a message. That is what
 * the visitor actually fills in.
 *
 * `subject` is optional and used to be required, which is how this endpoint
 * rejected every submission the site ever made: the form posts what its fields
 * are named, and none of them was called `subject`. The form sends one now, and
 * the rule still does not require it — a lead is worth more than a subject
 * line, and a required field nothing on the site renders is a trap that only
 * springs in production. It is still type- and length-checked when present.
 */
function validatePayload(body) {
  const { name, email, subject, message } = body;

  if (!name || !email || !message) {
    return 'Missing required fields: name, email, message';
  }
  if (typeof name !== 'string' || name.trim().length === 0) return 'Invalid name';
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
  if (subject !== undefined && typeof subject !== 'string') return 'Invalid subject';
  if (typeof message !== 'string' || message.trim().length === 0) return 'Invalid message';
  if (name.length > 100) return 'Name too long';
  if (email.length > 200) return 'Email too long';
  if (typeof subject === 'string' && subject.length > 200) return 'Subject too long';
  if (message.length > 5000) return 'Message too long';

  return null;
}

/**
 * Hands the message to n8n and says whether it arrived.
 *
 * Every failure path returns false and says why on the way out. It used to
 * swallow both — a missing binding and a dead webhook were indistinguishable
 * from success, and `wrangler.toml` has never carried `N8N_WEBHOOK_URL`, so
 * that is not a hypothetical. `console.error` is what reaches `wrangler pages
 * deployment tail` and the dashboard's live log.
 */
async function forwardToN8n(body, webhookUrl, sharedSecret) {
  if (!webhookUrl) {
    console.error('contact: N8N_WEBHOOK_URL is not bound; see functions/api/README.md');
    return false;
  }

  const { name, email, subject, message, company, intent, page_context } = body;

  const payload = {
    name,
    email,
    subject: typeof subject === 'string' && subject.trim() ? subject : DEFAULT_SUBJECT,
    message
  };
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
    if (!res.ok) {
      console.error(`contact: n8n webhook answered ${res.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('contact: n8n webhook unreachable', error);
    return false;
  }
}


function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
