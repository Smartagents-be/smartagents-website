# CLAUDE.md - Agent Entry Point

Pre-rendered static site, no backend, no framework. The public site is the
redesigned homepage plus three detail pages — training, AI staffing and
coaching, and team (NL / EN / FR); the password-gated `/secured/` area
(internal documents and pitch decks) is live.

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

## Deployment

Cloudflare Pages, wired to the GitHub repo. There is no workflow file and never
has been: Pages clones the branch, runs `npm ci` then `npm run build`, and
publishes `dist/`. `main` is production, every other branch gets a preview URL.
Nothing here is a GitHub Action, so a green local build is the only signal.

- **`wrangler.toml` is the deployment config, not the dashboard.** Once a Pages
  project has one, Cloudflare reads `pages_build_output_dir`, bindings and
  `[vars]` from it and ignores the dashboard equivalents. Secrets
  (`TURNSTILE_SECRET_KEY`, `N8N_SHARED_SECRET`, `EXPORT_PASSWORD`,
  `EXPORT_SESSION_SECRET`) stay dashboard-managed; a binding a Function needs at
  runtime belongs in the file. `functions/api/README.md` records one that is
  still missing.
- **Build-time variables are separate.** `TURNSTILE_SITE_KEY` and `SITE_ORIGIN`
  are read by `build/lib/config.mjs` and `build/lib/i18n.mjs` while the site
  renders, so they are ordinary Pages build settings and `wrangler.toml` does not
  touch them. Both have fallbacks, so a missing one changes the output instead of
  failing the build: no site key means the contact form keeps its `mailto:`
  fallback.
- **Node is pinned in `.nvmrc` (22.14.0), mirrored by `engines` in
  `package.json`.** Vite 7 needs `^20.19 || >=22.12` and the Pages build image
  defaults to a much older Node, so the pin is what keeps the build alive.
- **The toolchain is a devDependency.** A build environment with
  `NODE_ENV=production` makes `npm ci` skip it; `scripts/build-site.mjs` checks
  for `vite` up front and says so rather than exiting silently.
- **`dist/.vite/` is scaffolding.** `render.mjs` reads the manifest from it, then
  `build-site.mjs` deletes the directory before `check-dist.mjs` runs, so it
  never ships. Both validators already skip dot-entries at the root of `dist/`.
- **`functions/` is picked up from the repo root**, not from `dist/`. Cloudflare
  derives the routes from the file tree, which is why there is no `_routes.json`.

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
  live in `public/media/`, the founder portraits in `public/media/team/` and the
  "Inzichten" thumbnails in `public/media/insights/`, and all three ship as-is.
  Only the two one-pagers of the courses in "Ons aanbod" are linked; the awareness and management fiches are left over from the
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
- **A magnet resamples the clip path into one closed polyline**, so a silhouette
  is always a single subpath: two lobes written as `M…Z M…Z` collapse into one
  the moment the cursor comes near. `data-magnet-free` opts a shape out of the
  guard that refuses a pull whose nearest point sits under the nav or past the
  right page edge — take it only for a shape that is nowhere near either. The
  AI staffing hero's arch runs the width of its flank directly under the
  header, so it keeps the guard and pins its right edge instead.
- **The AI staffing page's hero is one shape on the petal's own flank.**
  `heroArch` is hung off the right edge in the box `.hero__field--right` gives
  the petal, so every breakpoint that moves the petal moves the arch with it and
  the page overrides nothing. It went through two drafts that both failed the
  same way: a diagonal struck corner to corner with a shallow bow read as a black
  triangle, and the cove that replaced it filled the whole corner and needed a
  second silhouette in the opposite one to balance it. One shape, one edge, and
  the light half of the hero as the counterweight.
- **The tablet is drawn, so it is not invented.** `SmartAgents Homepage Tablet`
  (834x1112) in the design project is the source for everything between the
  desk and the phone, and three breakpoints carry it: 768px is where the header
  stops being a nav bar (and the wedge narrows to the phone's, or the disclosure
  under it sits on navy), 1000px is where every list that runs two abreast starts
  doing so, and 620px is where the hero stops being split — the phone's own line,
  because the column and the lobe are both shares of the width and hold to 621px.
  See "Deviations from the design doc", item 1, in the `smartagents-design`
  README for what each one changes; change a number there and in the CSS
  together.
- **No third-party requests.** No webfonts, no icon library, no analytics on the
  public pages. Turnstile is the one exception and loads only on interaction.
- **`/secured/` is self-contained but not off-brand.** It serves its own
  `tokens.css`, `base.css` and `deck-stage.js` and links nothing from the public
  build, yet `src/content/secured/tokens.css` carries the same values as
  `src/styles/tokens.css`: paper, ink, the navy field, one cyan. Every page
  behind the password reads it — the login gate, the overview, both Smart Scan
  documents and all nine decks — so it is the one place a colour is defined
  there. Keep it in step with the public token file.
- **The dark field is a class in `/secured/`.** `.field` on any element flips
  the semantic roles to their on-navy values, so a rule written once reads on
  both grounds. A deck's cover carries it (`class="slide deeper field"`), and so
  does any navy shape inside a paper slide: a chart card, a screenshot frame,
  the closing contact strip. A slide without it is paper. The one thing that
  breaks is painting `--sa-field` on an element and leaving the class off — the
  text inside then stays ink on navy.
- **The decks are paper with categorical colour.** `--sky`, `--blue`,
  `--purple`, `--violet`, `--teal`, `--green`, `--amber` and `--rose` exist only
  in the secured token file: a deck codes a section or a step by colour and the
  public site never does. Each has an on-paper value and an on-navy step under
  `.field`. Reach for `--accent` first; these are for when a thing is genuinely
  one of several.
- **Validation**: `scripts/check-dist.mjs` is the gatekeeper. It checks unresolved
  templates, broken internal links, missing alt text, undefined CSS custom
  properties, robots meta, the full hreflang contract, the routing table, and the
  performance budgets from `fast-static-site` §1.

## Known follow-ups

- Nothing under `/secured/` loads a webfont any more: `deck.json` lost its
  `fonts` entry and the Smart Scan documents lost their Google Fonts links, so
  Geist-then-platform carries the sans and Georgia stands in for the serif
  accent. The decks were drawn against Inter and the documents against DM Serif
  Display, so a few headings set a little differently now. Supplying the Geist
  and Instrument Serif binaries closes both that gap and the public site's.
- The deck covers are flat navy. On the public site a `.field` carries a live
  cyan node network, but `<sa-node-field>` paints from document coordinates and
  a deck is a fixed 1920×1080 stage, so it was not ported. A stage-local variant
  would put the brand's one moving element back on the covers.
- No build-step image pipeline. Two blocks carry pictures and both sets were
  derived once, by hand, with `sips` — AVIF plus a JPEG fallback, wired up with
  `<picture>` and `srcset`:
  - `public/media/team/` — the founder portraits, a 2:3 crop at 320w, 440w and
    880w (`src/pages/team.mjs`). They open the team page, so the first one is
    also declared as `meta().preloadImage`.
  - `public/media/insights/` — the homepage article thumbnails, a 16:9 crop at
    320w, 480w and 760w, all lazy (`src/pages/home.mjs`). The sources are the
    four blog post banners on `main`, under `assets/blog/`; `launch` stops at
    480w because its original is only 542px wide.

  `sips --cropOffset` is the top-left of the crop window in *points*, so set the
  source to 72dpi first or the offset lands at half the distance, and never pass
  `0 0` — it reads as "unset" and centres the crop. Turn the derivation into a
  build step when a third block needs it; note that `sips`, the only image tool
  on a stock Mac, cannot write WebP, which is why the fallback is JPEG.
- Geist is named first in `--font-sans` but no binaries were supplied, so the
  platform face is what renders. Ask the client for the WOFF2 files.
- Two of the four service rows link out — training and AI staffing — through
  `servicePath()` in `src/layouts/base.mjs`, which is the one place the homepage
  rows, the mega menu and the phone sheet all ask. Procesoptimalisatie, agentic
  automatisatie and the article rows still have nowhere to go, so they stay plain
  rows without a "Ontdek →" cue. See "Deviations from the design doc" in the
  `smartagents-design` README.
- The live site also has a Jobs page. It has not been redesigned yet, and
  nothing links to it.
- A URL that matches no page is a soft 404: Cloudflare has no `404.html` at the
  root of `dist/`, so it falls back to serving `index.html` with a 200. The
  per-language 404s exist but only answer at `/{lang}/404/`. Writing the default
  language's 404 to `dist/404.html` would give the real status code.
