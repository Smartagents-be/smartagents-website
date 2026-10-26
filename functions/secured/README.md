`functions/secured/` is the Cloudflare Pages Functions pair for the `/secured/*` route area.

Use this folder together with `secured/`:
- `secured/` contains the protected static pages and local CSS/PDF assets
- `functions/secured/` contains the request handlers that protect those URLs

Route mapping in this repo:
- `functions/secured/login.js` -> `/secured/login`
- `functions/secured/[area]/login.js` -> `/secured/<area>/login`, a client area's login
- `functions/secured/[[path]].js` -> catch-all guard for `/secured/*`
- `functions/secured/areas.js` -> not a route: the client areas, read by the guard and the build

Client areas:
- `/secured/<area>/` has a password of its own, a Pages secret named in `areas.js`
  (`SECURED_ISABEL_PASSWORD` for `/secured/isabel/`). It opens that sub-tree and the
  shared deck runtime, nothing else.
- Our `EXPORT_PASSWORD` opens everything, client areas included, and works at a client's
  login page as well as ours.
- Each session is its own cookie (`export_session`, `export_session_<area>`) signed with
  the one `EXPORT_SESSION_SECRET` over a different message, so a client's token never
  verifies as ours.
- A client deck's old address under `/secured/presentations/` answers 301 to the new one.
- `scripts/check-secured.mjs` runs at the end of `npm run build` and checks all of this
  against `dist/` through the real handlers.
- Adding a client: one entry in `CLIENT_AREAS`, one secret in the Pages dashboard.
- A client's decks can live in a repository of their own: Isabel's are in the private
  `Smartagents-be/isabel-presentations`, found by `build/lib/deck-sources.mjs`. The build
  refuses a deck from there that `CLIENT_AREAS` does not give to its area.

This split is platform-driven. The function files should stay under `functions/` unless deployment moves away from Cloudflare Pages Functions.

Deployment modes in this repo:
- `npm run build`
  - Includes the protected `/secured/` document pages and PDFs.
  - Expects Cloudflare Pages Functions to protect those URLs.

Keep Cloudflare-specific behavior isolated here and under `/secured/`.
The public marketing site should continue to use static-compatible paths and directly fetchable browser assets even though this repo no longer maintains a separate static-host build mode.
