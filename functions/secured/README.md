`functions/secured/` is the Cloudflare Pages Functions pair for the `/secured/*` route area.

Use this folder together with `secured/`:
- `secured/` contains the protected static pages and local CSS/PDF assets
- `functions/secured/` contains the request handlers that protect those URLs

Route mapping in this repo:
- `functions/secured/login.js` -> `/secured/login`
- `functions/secured/[[path]].js` -> catch-all guard for `/secured/*`

This split is platform-driven. The function files should stay under `functions/` unless deployment moves away from Cloudflare Pages Functions.

Deployment modes in this repo:
- `npm run build`
  - Includes the protected `/secured/` document pages and PDFs.
  - Expects Cloudflare Pages Functions to protect those URLs.

Keep Cloudflare-specific behavior isolated here and under `/secured/`.
The public marketing site should continue to use static-compatible paths and directly fetchable browser assets even though this repo no longer maintains a separate static-host build mode.
