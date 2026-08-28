# /api/contact

Cloudflare Pages Function that proxies contact form submissions to n8n.

## Request pipeline

1. **Origin check** — allows `smartagents.be` and `www.smartagents.be` only → 403
2. **Turnstile verify** — validates `cf-turnstile-response` via Cloudflare siteverify → 403
3. **Rate limiting** — KV namespace `CONTACT_RATE`; max 5/hour per IP, 100/hour global → 429
4. **Payload validation** — required: `name`, `email`, `subject`, `message`; length limits enforced → 400
5. **Forward to n8n** — clean payload with `X-SmartAgents-Secret` header → 502 on failure

## Expected request body (JSON)

```json
{
  "name": "string (required, max 100)",
  "email": "string (required, max 200)",
  "subject": "string (required, max 200)",
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
| `N8N_WEBHOOK_URL` | Var | **Not bound yet.** See the warning below. |
| `N8N_SHARED_SECRET` | Secret | Cloudflare Pages dashboard. Must match n8n "Authorize header" Code node. |

`wrangler.toml` has no `[vars]` block, so `env.N8N_WEBHOOK_URL` is `undefined`
in production. `forwardToN8n` runs inside `context.waitUntil` and swallows its
own errors, so a submission still answers `{ ok: true }` and is then dropped in
silence. Add the webhook URL to `wrangler.toml`:

```toml
[vars]
N8N_WEBHOOK_URL = "https://.../webhook/..."
```

Setting it in the Pages dashboard instead does not work: once a project has a
`wrangler.toml`, Cloudflare reads bindings and plain vars from that file and
ignores the dashboard's. Secrets stay dashboard-managed.

## Related files

The front end is `src/components/contact-form/`: `contact-form.mjs` renders the
section at build time, `contact-form.js` upgrades it in the browser and POSTs
here. The form only posts to this endpoint when `TURNSTILE_SITE_KEY` is set as a
**build** environment variable; without it the markup keeps its `mailto:`
fallback and this function is never called. Build variables are ordinary Pages
build settings and are unaffected by `wrangler.toml`.
