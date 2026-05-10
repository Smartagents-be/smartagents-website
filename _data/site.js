module.exports = {
  // Cloudflare test key (always passes) used locally; real key set via TURNSTILE_SITE_KEY env var in production
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
};
