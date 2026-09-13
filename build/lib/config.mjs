// Build-time configuration for values that differ per environment.
// Nothing secret belongs here: everything in this file is baked into the HTML.

/**
 * Cloudflare Turnstile site key for the contact form. `functions/api/contact.js`
 * rejects any submission without a token, so the form only posts to it when a
 * key is rendered. The default is the key the site shipped with before the
 * redesign (`_data/site.js` on the `archive` branch): with an empty default and
 * no build variable set on Pages, every form fell back to `mailto:` and n8n
 * never heard from it. A site key is public by design. `TURNSTILE_SITE_KEY`
 * still overrides it — with one of Cloudflare's test keys, for instance, on a
 * host the real key is not registered for.
 */
export const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '0x4AAAAAADMvHHhg51ylmZft';
