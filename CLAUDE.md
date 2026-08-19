# CLAUDE.md - Agent Entry Point

Pre-rendered static site, no backend, no framework. The public site is the
redesigned homepage (NL / EN / FR); the password-gated `/secured/` area (internal
documents and pitch decks) is live.

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
  - `functions/api/contact.js` — contact endpoint. The homepage form posts to it
    through `<sa-contact-form>`, but only once `TURNSTILE_SITE_KEY` is set at
    build time; without a key the form keeps its `mailto:` fallback.

## Key Patterns

- **Language is a build-time decision.** Public URLs are `/{lang}/{slug}/`; the
  root redirects. A page module declares `slugs: { nl, en, fr }`; omit a language
  to exclude the page from it. Missing translation keys fail the build.
- **Pages are functions.** A page module exports `{ id, slugs, meta(t), render(ctx) }`
  and returns markup from the `html` tag. Never hard-code visible text: use `t()`.
- **Decks are data.** Each deck is `deck.json` plus `slides/*.html` fragments.
  The `<!--chrome 05/10-->` marker expands to the slide footer at render time.
  Adding a deck means adding a folder; discovery is automatic.
- **Colocation**: keep CSS/JS/assets in the component or page folder.
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
  properties, robots meta, the full hreflang contract, and the performance
  budgets from `fast-static-site` §1.

## Known follow-ups

- The decks still load Inter/Fraunces from Google Fonts, which `fast-static-site`
  §4 forbids. Self-host and subset when the decks are revised.
- No image pipeline yet (AVIF/WebP + `srcset`). The homepage needs none today:
  it ships no photography, and the SmartSpace screenshot is a labelled
  placeholder. Add the pipeline with the first real image.
- Geist is named first in `--font-sans` but no binaries were supplied, so the
  platform face is what renders. Ask the client for the WOFF2 files.
- The service and article rows are not links yet: the detail pages do not exist.
  See "Deviations from the design doc" in the `smartagents-design` README.
