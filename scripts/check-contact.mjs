// Posts the contact form's real payload through the real /api/contact handler.
//
// This exists because the two halves of the contact path were written against
// different field lists and nothing compared them: the form posts what its
// inputs are named, `validatePayload` required a `subject` no input carried,
// and every submission the site ever made came back 400 while the visitor read
// "Versturen lukte niet". A static check could not see it — both files were
// correct on their own — so this builds the payload out of the *rendered* HTML
// rather than out of a fixture, and runs it through the function that answers
// in production. Rename a field and this fails; add a required field the form
// does not render and this fails.
//
// Run after `npm run build`, like `check-dist.mjs`. Needs no network: Turnstile
// and the n8n webhook are stubbed at `globalThis.fetch`.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { onRequestPost } from '../functions/api/contact.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

const ORIGIN = 'https://smartagents.be';
const WEBHOOK = 'https://n8n.example/webhook/contact';

let failures = 0;

function fail(check, detail) {
  console.error(`  ✗ ${check}\n    ${detail}`);
  failures++;
}

function pass(check) {
  console.log(`  ✓ ${check}`);
}

/* ------------------------------------------------------------------ *
 * The payload, read out of the rendered form
 * ------------------------------------------------------------------ */

/**
 * Every named field inside the contact form on a built page, with a value a
 * real visitor could have typed. Text inputs and the textarea get sample copy;
 * a hidden field keeps the value the build put in it, because that value is the
 * thing being checked.
 */
function payloadFromRenderedForm(html) {
  const form = html.match(/<form[^>]*class="contact-form"[\s\S]*?<\/form>/);
  if (!form) return null;

  const payload = {};
  for (const tag of form[0].matchAll(/<(input|textarea|select)\b([^>]*)>/g)) {
    const attrs = tag[2];
    const name = attrs.match(/\sname="([^"]*)"/)?.[1];
    if (!name) continue;

    const type = attrs.match(/\stype="([^"]*)"/)?.[1];
    if (type === 'hidden') {
      payload[name] = attrs.match(/\svalue="([^"]*)"/)?.[1] ?? '';
    } else if (name === 'email') {
      payload[name] = 'visitor@example.com';
    } else {
      payload[name] = `Sample ${name}`;
    }
  }
  return payload;
}

/* ------------------------------------------------------------------ *
 * A Pages Function context, stubbed
 * ------------------------------------------------------------------ */

// `webhookUrl` is read with `in` rather than a default parameter: passing
// `undefined` explicitly is the case under test, and a destructuring default
// would quietly replace it with the real URL.
function makeContext(payload, options = {}) {
  const webhookUrl = 'webhookUrl' in options ? options.webhookUrl : WEBHOOK;
  const origin = options.origin ?? ORIGIN;

  return {
    request: new Request('https://smartagents.be/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        'CF-Connecting-IP': '203.0.113.7'
      },
      body: JSON.stringify({ ...payload, 'cf-turnstile-response': 'stub-token' })
    }),
    env: {
      TURNSTILE_SECRET_KEY: 'stub-secret',
      N8N_SHARED_SECRET: 'stub-shared',
      N8N_WEBHOOK_URL: webhookUrl,
      CONTACT_RATE: null // no KV binding: the rate limiter opts out
    },
    // Kept so a regression back to fire-and-forget is visible rather than silent.
    waitUntil(promise) {
      this.deferred.push(promise);
    },
    deferred: []
  };
}

/** Stubs Turnstile as valid and n8n as `n8nStatus`; records what n8n received. */
function withStubbedFetch(n8nStatus, run) {
  const real = globalThis.fetch;
  const seen = [];

  globalThis.fetch = async (url, init) => {
    const href = String(url);
    if (href.includes('challenges.cloudflare.com')) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    seen.push({ url: href, body: JSON.parse(init.body), headers: init.headers });
    return new Response('{}', { status: n8nStatus });
  };

  return run(seen).finally(() => {
    globalThis.fetch = real;
  });
}

/* ------------------------------------------------------------------ *
 * Checks
 * ------------------------------------------------------------------ */

async function main() {
  const page = path.join(distDir, 'nl/index.html');
  if (!existsSync(page)) {
    console.error('dist/nl/index.html is missing. Run `npm run build` first.');
    process.exit(1);
  }

  const payload = payloadFromRenderedForm(readFileSync(page, 'utf8'));
  if (!payload) {
    console.error('No .contact-form found in dist/nl/index.html.');
    process.exit(1);
  }

  console.log(`Contact path — payload as rendered: {${Object.keys(payload).join(', ')}}`);

  // 1. The real payload is accepted and forwarded.
  await withStubbedFetch(200, async (seen) => {
    const context = makeContext(payload);
    const res = await onRequestPost(context);
    const body = await res.json();

    if (res.status !== 200) {
      fail('the rendered form payload is accepted', `got ${res.status} ${JSON.stringify(body)}`);
    } else {
      pass('the rendered form payload is accepted');
    }

    if (seen.length !== 1) {
      fail('the message reaches n8n', `webhook called ${seen.length} times`);
    } else {
      pass('the message reaches n8n');
      for (const field of ['name', 'email', 'subject', 'message']) {
        if (!seen[0].body[field]) fail(`n8n receives ${field}`, JSON.stringify(seen[0].body));
      }
      if (!seen[0].body.page_context) {
        fail('n8n receives page_context', 'the form should say which page it came from');
      }
    }

    if (context.deferred.length) {
      fail('delivery is awaited, not deferred', 'the handler called waitUntil()');
    } else {
      pass('delivery is awaited, not deferred');
    }
  });

  // 2. A webhook that is not configured must not report success.
  await withStubbedFetch(200, async () => {
    const res = await onRequestPost(makeContext(payload, { webhookUrl: undefined }));
    if (res.status === 200) {
      fail('an unbound N8N_WEBHOOK_URL fails loudly', 'the endpoint answered 200 and dropped the message');
    } else {
      pass(`an unbound N8N_WEBHOOK_URL fails loudly (${res.status})`);
    }
  });

  // 3. A webhook that errors must not report success either.
  await withStubbedFetch(500, async () => {
    const res = await onRequestPost(makeContext(payload));
    if (res.status === 200) {
      fail('an erroring webhook fails loudly', 'the endpoint answered 200 and dropped the message');
    } else {
      pass(`an erroring webhook fails loudly (${res.status})`);
    }
  });

  // 4. The validator still rejects what it should.
  await withStubbedFetch(200, async () => {
    const { name, ...withoutName } = payload;
    const res = await onRequestPost(makeContext(withoutName));
    if (res.status !== 400) {
      fail('a missing name is still rejected', `got ${res.status}`);
    } else {
      pass('a missing name is still rejected');
    }
  });

  // 5. An off-site origin is still refused.
  await withStubbedFetch(200, async () => {
    const res = await onRequestPost(makeContext(payload, { origin: 'https://evil.example' }));
    if (res.status !== 403) {
      fail('a foreign origin is still refused', `got ${res.status}`);
    } else {
      pass('a foreign origin is still refused');
    }
  });

  if (failures) {
    console.error(`\nContact path check failed: ${failures} problem(s).`);
    process.exit(1);
  }
  console.log('\nContact path check passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
