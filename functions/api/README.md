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
| `N8N_WEBHOOK_URL` | Var | Defined in `wrangler.toml` `[vars]` |
| `N8N_SHARED_SECRET` | Secret | Cloudflare Pages dashboard. Must match n8n "Authorize header" Code node. |

## Related files

This endpoint currently has no front end: the contact form, its client-side
handler and the Turnstile widget were removed with the rest of the old site
ahead of the redesign. The function and its `CONTACT_RATE` KV binding are kept
so the endpoint can be wired back up.

When rebuilding the form:

- Add the site key to a page module's context and render the `<div class="cf-turnstile">`
  widget at build time (no runtime templating).
- Put the form handler in a web component under `src/components/`, POSTing to
  `/api/contact`. See `.claude/skills/webcomponent-mpa-spa/SKILL.md` §4.
