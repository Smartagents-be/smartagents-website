# /api/contact

Cloudflare Pages Function that proxies contact form submissions to n8n.

## Request pipeline

1. **Origin check** — allows `smartagents.be` and `www.smartagents.be` only → 403
2. **Turnstile verify** — validates `cf-turnstile-response` via Cloudflare siteverify → 403
3. **Payload validation** — required: `name`, `email`, `message`; length limits enforced → 400
4. **Rate limiting** — KV namespace `CONTACT_RATE`; max 5/hour per IP, 100/hour global → 429.
   After validation, not before: a submission that 400s must not burn one of the caller's five
   attempts an hour, or a visitor who mistypes an e-mail address five times is locked out of the
   site's only conversion path for the rest of the hour.
5. **Forward to n8n** — clean payload with `X-SmartAgents-Secret` header, awaited → 502 on failure

## Expected request body (JSON)

```json
{
  "name": "string (required, max 100)",
  "email": "string (required, max 200)",
  "subject": "string (optional, max 200; the form sends one, and the function
               falls back to a default when it is absent)",
  "message": "string (required, max 5000)",
  "company": "string (optional, max 200)",
  "intent": "string (optional, max 100)",
  "page_context": "string (optional, max 200)",
  "cf-turnstile-response": "string (required, injected by Turnstile widget)"
}
```

## Environment bindings

| Name | Type | Notes |
|------|------|-------|
| `CONTACT_RATE` | KV namespace | Rate limit counters, TTL 2h. ID in `wrangler.toml`. |
| `TURNSTILE_SECRET_KEY` | Secret | Cloudflare Pages dashboard |
| `N8N_WEBHOOK_URL` | Var | **Not bound yet.** See the warning below. Without it every submission now answers 502. |
| `N8N_SHARED_SECRET` | Secret | Cloudflare Pages dashboard. Must match n8n "Authorize header" Code node. |

`wrangler.toml` has no `[vars]` block, so `env.N8N_WEBHOOK_URL` is `undefined`
in production and **no message can be delivered**. It no longer fails silently:
`forwardToN8n` is awaited rather than handed to `context.waitUntil`, logs the
cause, and the endpoint answers 502, so the visitor is told the message did not
go through instead of being thanked for one that vanished. That is the correct
failure, not a fix — the binding is still missing. Add the webhook URL to
`wrangler.toml`:

```toml
[vars]
N8N_WEBHOOK_URL = "https://.../webhook/..."
```

Setting it in the Pages dashboard instead does not work: once a project has a
`wrangler.toml`, Cloudflare reads bindings and plain vars from that file and
ignores the dashboard's. Secrets stay dashboard-managed.

## What the form sends

`subject` and `page_context` are hidden inputs rendered by
`src/components/contact-form/contact-form.mjs`, so they travel with a JS
submission and in the `mailto:` body alike. `page_context` is the calling page's
id prefix — `home`, `training`, `staffing`, `sdlc`, `processes`, `team` — which
is what says where a message came from.

The two halves of this path were written against different field lists once, and
it cost every submission the site made: the form posted `{name, company, email,
message}` and `validatePayload` required a `subject` no input carried, so the
endpoint 400'd and the visitor read "Versturen lukte niet". `npm run build` now
runs `scripts/check-contact.mjs`, which parses the rendered form out of
`dist/nl/index.html`, posts exactly those fields through `onRequestPost`, and
fails the build if the endpoint does not accept them, if the message does not
reach the webhook, or if a missing or erroring webhook is reported as success.
Run it alone with `npm run check:contact` after a build.

## Related files

The front end is `src/components/contact-form/`: `contact-form.mjs` renders the
section at build time, `contact-form.js` upgrades it in the browser and POSTs
here. The form only posts to this endpoint when `TURNSTILE_SITE_KEY` is set as a
**build** environment variable; without it the markup keeps its `mailto:`
fallback and this function is never called. Build variables are ordinary Pages
build settings and are unaffected by `wrangler.toml`.
