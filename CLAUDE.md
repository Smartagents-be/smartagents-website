# CLAUDE.md - Agent Entry Point

Pre-rendered static site, no backend, no framework. The public site is the
redesigned homepage plus two detail pages, training and team (NL / EN / FR);
the password-gated `/secured/` area (internal documents and pitch decks) is
live.

## Skills — read these first

Five skills in `.claude/skills/` define the architecture, the look and the
markup conventions. They are the source of truth; this file only records how
they are applied here.

- **`fast-static-site`** — the foundation. Pre-rendered HTML, Vite, critical CSS,
  caching, service worker, budgets.
- **`static-i18n`** — one HTML file per page per language, decided at build time.
- **`webcomponent-mpa-spa`** — web components and the layers that make an MPA
  feel like an SPA.
- **`smartagents-design`** — the brand: tokens, type, the dark field, motion,
  tone of voice. Read its `README.md` before touching anything visual.
- **`element-ids`** — every element rendered inside `<body>` carries a unique,
  language-independent `id` so any part of a page can be named exactly. Read it
  before writing or editing markup.

## Quick Commands

- **Build**: `npm run build` (Vite → `build/render.mjs` → `scripts/check-dist.mjs`)
- **Dev**: `npm run dev` — builds, serves `dist/` on :8000, then watches `src/`,
  `build/`, `public/` and `vite.config.js`. A save rebuilds (~0.8s) and reloads
  the open page over SSE, keeping scroll position; a failed build shows the
  error as a banner in the browser. `scripts/live-reload.mjs` injects that
  client into HTML responses only when the server runs with `--watch`, so
  `npm run serve` still serves `dist/` exactly as it deploys.
- **Deck PDFs**: `npm run export:pdfs` (needs a current `dist/`)

## Tech Stack

- **Templating**: `build/lib/html.mjs` — a tagged template literal that escapes
  interpolations. No template engine, no client-side templating runtime.
  (Eleventy and Nunjucks were removed; there is no `.njk` left in the repo.)
- **Server logic**: Cloudflare Pages Functions in `functions/`
  - `functions/secured/` — password gate for `/secured/*`
  - `functions/api/contact.js` — contact endpoint. The contact form posts to it
    through `<sa-contact-form>`, but only once `TURNSTILE_SITE_KEY` is set at
    build time; without a key the form keeps its `mailto:` fallback.

## Key Patterns

- **Language is a build-time decision.** Public URLs are `/{lang}/{slug}/`; an
  unprefixed URL resolves to Dutch, the first entry in `languages` and therefore
  the default. A page module declares `slugs: { nl, en, fr }`; omit a language to
  exclude the page from it. Missing translation keys fail the build.
- **The routing table is generated.** `public/_redirects` holds the rules a human
  wrote. `build/render.mjs` wraps them with a pass-through rule for every
  top-level entry in `dist/` and, on the last line, the catch-all that sends an
  unprefixed URL to the default language: `/training/` lands on `/nl/training/`.
  A redirect is followed whether or not an asset matches it, so anything without
  a rule above the catch-all stops being reachable; `check-dist.mjs` fails the
  build when that happens. `scripts/start-local.mjs` reads `dist/_redirects` too,
  so dev routes like production. Nothing negotiates on `Accept-Language`.
- **Pages are functions.** A page module exports `{ id, slugs, meta(t), render(ctx) }`
  and returns markup from the `html` tag. Never hard-code visible text: use `t()`.
- **Decks are data.** Each deck is `deck.json` plus `slides/*.html` fragments.
  The `<!--chrome 05/10-->` marker expands to the slide footer at render time.
  Adding a deck means adding a folder; discovery is automatic.
- **Colocation**: keep CSS/JS/assets in the component or page folder. A component
  that also owns markup keeps both halves there under one name:
  `components/contact-form/contact-form.mjs` renders the section at build time,
  `contact-form.js` upgrades it in the browser. The homepage and the team page
  both call `contactSection()`, passing an id prefix and the two lines each page
  phrases for itself; everything else comes from the shared `contact.*` and
  `form.*` keys, so the two forms can never drift apart.
- **`/media/` is the un-hashed public file namespace**: the training one-pagers
  live in `public/media/` and the founder portraits in `public/media/team/`,
  and both ship as-is. Only the two one-pagers of the courses in "Ons aanbod"
  are linked; the awareness and management fiches are left over from the
  learning path that section replaced. A file authored inside a deck and shown
  on a public page too (today: the kata tour video) is never duplicated: it stays
  in the deck folder and `PROMO_MEDIA` in `build/render.mjs` copies it into the
  same `/media/`. `/secured/` is gated, so a public page can never link into it.
  `_headers` gives `/media/*` its own cache policy.
- **Tokens live once.** `src/styles/tokens.css` is the only place custom
  properties are defined; `build/render.mjs` prepends it to `critical.css` and
  inlines the pair in every `<head>`. Never redefine a token in `main.css`.
- **The dark field is one field.** Every navy shape is a `.field` carrying
  `data-magnet` and `data-clip`, with a `<sa-node-field>` inside. The clip path
  must sit on the same element as `data-magnet`: `src/motion.js` grows that
  element's box and remaps the outline into it.
- **No third-party requests.** No webfonts, no icon library, no analytics on the
  public pages. Turnstile is the one exception and loads only on interaction.
- **`/secured/` is self-contained** — its own `base.css`, `tokens.css` and
  `deck-stage.js`, no dependency on the public site's assets.
- **Validation**: `scripts/check-dist.mjs` is the gatekeeper. It checks unresolved
  templates, broken internal links, missing alt text, undefined CSS custom
  properties, robots meta, the full hreflang contract, the routing table, and the
  performance budgets from `fast-static-site` §1.

## Known follow-ups

- The decks still load Inter/Fraunces from Google Fonts, which `fast-static-site`
  §4 forbids. Self-host and subset when the decks are revised.
- No build-step image pipeline. The team page is the only page with photography
  and its two portraits were derived once, by hand, into `public/media/team/`:
  a 2:3 crop at 320w, 440w and 880w, AVIF plus a JPEG fallback, wired up with
  `<picture>` and `srcset` in `src/pages/team.mjs`. They open that page, so the
  first one is also declared as `meta().preloadImage`. Everything else still
  ships no images (the SmartSpace screenshot is a labelled placeholder). Turn
  the derivation into a build step when a third page needs it; note that `sips`,
  the only image tool on a stock Mac, cannot write WebP, which is why the
  fallback is JPEG.
- Geist is named first in `--font-sans` but no binaries were supplied, so the
  platform face is what renders. Ask the client for the WOFF2 files.
- Only the training service row links out; the other service rows and the
  article rows still have nowhere to go, so they stay plain rows without a
  "Ontdek →" cue. See "Deviations from the design doc" in the
  `smartagents-design` README.
- The live site also has a Jobs page. It has not been redesigned yet, and
  nothing links to it.
- A URL that matches no page is a soft 404: Cloudflare has no `404.html` at the
  root of `dist/`, so it falls back to serving `index.html` with a 200. The
  per-language 404s exist but only answer at `/{lang}/404/`. Writing the default
  language's 404 to `dist/404.html` would give the real status code.
