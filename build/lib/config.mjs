// Build-time configuration for values that differ per environment.
// Nothing secret belongs here: everything in this file is baked into the HTML.

/**
 * Cloudflare Turnstile site key for the contact form. `functions/api/contact.js`
 * rejects any submission without a token, so with no key configured the form
 * keeps its no-JS fallback (a mailto: submit) instead of posting to the API.
 */
export const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '';
