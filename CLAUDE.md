# CLAUDE.md - Agent Entry Point

Pre-rendered static site, no backend, no framework. The public site is the
redesigned homepage, five detail pages — training, AI staffing and coaching,
the AI-native SDLC, AI-native businessprocessen, and team — the privacy notice,
the "Inzichten" index and the four articles under it (NL / EN / FR); the
password-gated `/secured/` area (internal documents and pitch decks) is live.

## Skills — read these first

Six of the skills in `.claude/skills/` define the architecture, the look and the
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
- **`new-presentation`** — the decks under `/secured/presentations/`: the seven
  slide archetypes, the shared slide vocabulary, and the copy rules. Read it
  before adding a deck or a slide.

## Quick Commands

- **Build**: `npm run build` (Vite → `build/render.mjs` → `scripts/check-dist.mjs`)
- **Dev**: `npm run dev` — builds, serves `dist/` on :8000, then watches `src/`,
  `build/`, `public/` and `vite.config.js`. A save rebuilds (~0.8s) and reloads
  the open page over SSE, keeping scroll position; a failed build shows the
  error as a banner in the browser. `scripts/live-reload.mjs` injects that
  client into HTML responses only when the server runs with `--watch`, so
  `npm run serve` still serves `dist/` exactly as it deploys.
- **Agents**: `npm run ai` — the entry point for an agent that needs the site
  running (Playwright, a screenshot, a curl). It builds and serves `dist/` on
  **:8001**, so it never fights the human's `npm run dev` on :8000, and it is
  the only port an agent should start or assume. Start it in the background and
  leave it up; a second call while it is already serving prints
  `Already serving ... reusing it.` and exits 0, so it is safe to run at the top
  of any session. There is no watcher on it, deliberately: an agent that edits a
  file runs `npm run build` itself and knows the rebuild finished before it
  looks, where a watcher would race the screenshot. Nothing is injected into the
  HTML either, unlike `npm run dev`, so what the browser sees is what deploys.
  `--port=` and `--reuse` on `scripts/start-local.mjs` are what make this one
  script serve all three cases.
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
  build when that happens. A directory needs two rules, not one: `/secured/*`
  does not match `/secured`, so every top-level directory also gets the
  trailing-slash redirect (`/secured /secured/ 301`) a static host would have
  issued itself. Without it the bare name reached the catch-all and `/secured`
  — the URL people actually type, and the one that has to arrive at the Pages
  Function guarding `/secured/*` — was sent to `/nl/secured`, which is nothing.
  `scripts/start-local.mjs` reads `dist/_redirects` too, so dev routes like
  production. Nothing negotiates on `Accept-Language`.
- **Pages are functions.** A page module exports `{ id, slugs, meta(t), render(ctx) }`
  and returns markup from the `html` tag. Never hard-code visible text: use `t()`.
- **An insight is a page generated from a list.** `src/pages/insights/insights.mjs`
  holds `INSIGHTS` — one entry per article, with its per-language slug under that
  language's own word for the section (`inzichten/` · `insights/` · `analyses/`)
  — and turns each entry into a page module, so `build/render.mjs` spreads
  `insightPages` into `PAGES` and the homepage builds its rows from the same
  list. That word for the section is also a page of its own: `indexPage` in the
  same file is the archive at `/nl/inzichten/`, the parent directory of every
  article slug, and the homepage section and the index print the same rows from
  the same `articleRows()` so the two can never disagree. It is what the rail's
  "Alle artikelen →" points at and what `navHref('insights')` resolves to; both
  used to point at the homepage's `#insights` anchor because there was nowhere
  else to go. Adding an article means adding an entry there plus a body module beside
  it; nothing else has to be told. Title, excerpt, date, alt text and tag labels
  come from the shared `article.*` keys the homepage row already prints, so the
  list and the page it opens can never disagree. Only the long-form body lives
  outside `src/i18n`: `prose.mjs` gives it four block types (`p`, `h2`, `quote`,
  `list`) as tagged template literals — which is what lets a Dutch or French
  sentence carry its apostrophes unescaped — and two inline marks, `**bold**` and
  `[label](href)`. A href of `insight:<key>` resolves to that article in the
  language being rendered, which is the only way a cross-article link stays
  correct in three languages. The copy itself is the client's, ported verbatim
  from the Eleventy blog on `main` under `blog/posts/`. These are the only public
  pages with no hero and no dark shape: they open on the headline at the reading
  measure, with the other three articles in a rail beside the body. See
  "Deviations from the design doc", item 7, in the `smartagents-design` README.
- **Every page states itself twice: once for a reader and once for a machine.**
  `src/layouts/base.mjs` emits one `<script type="application/ld+json">` per
  page, and `src/layouts/schema.mjs` is where the nodes are built. Two of them
  are on every page — the `Organization` and the `WebSite`, both with a stable
  `@id` on the origin so everything else refers to them rather than restating
  them — and a page module adds its own by exporting `schema({ t, lang, url })`:
  a `Service` on each of the four service pages, a `BlogPosting` on each
  article, two `Person` nodes on the team page, a `Blog` on the insights index,
  an `FAQPage` on the homepage, and a `BreadcrumbList` on everything below the
  homepage. The one rule is that nothing in the graph may say something the page
  does not; every node is read off the same `t()` keys the visible page is, so a
  claim cannot outlive the sentence it was made from. `meta()` carries the other
  half of the head: `ogImage` overrides the brand share card (an article uses
  its own thumbnail) and `article` turns `og:type` into `article` and prints the
  published date the body only had as a `<time datetime>`.
- **The two raster brand images are generated, not exported.**
  `public/media/og-default.png` (1200x630, the default share card) and
  `public/media/smartagents-mark.png` (512x512, what `Organization.logo` points
  at) are drawn by `node scripts/make-social-images.mjs` from the same tokens
  and the same logo mark the site uses, in headless Chrome. It is not part of
  `npm run build`, for the reason `check:slides` is not: it needs a browser and
  the Pages build image has none. Both files are committed. Run it again when
  the wordmark, the claim or the dark field change.
- **`robots.txt` and `llms.txt` are generated too.** `renderSitemap()` writes a
  robots file that names every major AI crawler explicitly rather than leaving
  them to the wildcard — the wire result is the same, but for a company selling
  AI expertise "nobody decided" is not a policy — and `renderLlmsTxt()` writes
  the site in one page, in the default language, from the same page modules and
  string files the site is built from.
- **Decks are data.** Each deck is `deck.json` plus `slides/*.html` fragments.
  The `<!--chrome 05/10-->` marker expands to the slide footer at render time.
  Adding a deck means adding a folder; discovery is automatic. The look lives in
  `presentations/shared/slide.css`, one stylesheet for every deck, listed in a
  deck's `deck.json` under `styles`. It is the `Slide Template` design canvas
  turned into classes, and it is what makes a deck's own `deck.css` empty: the
  ten decks that predate it each carried a thousand-plus lines copied from the
  deck before, which is the drift it exists to end. Seven are empty now; the
  other three keep one figure each, listed in the skill. The eight archetypes,
  the ready markup for each and the rules that keep them on brand are in the
  `new-presentation` skill. Note that `check-dist.mjs` fails on an unexpanded
  chrome marker anywhere in `dist/`, comments in a stylesheet included.
  `npm run check:slides` is the other half: it opens every deck in headless
  Chrome and measures each slide, because a slide with a line too many is
  clipped by the stage's `overflow: hidden` and nothing static can see that.
- **The privacy notice is the article layout without the article.** It is the
  second page with no hero and no dark shape, for the reason the insights have
  none: a 540px navy shape between the header and the first paragraph is a
  screen to scroll past before reading. `.article--single` collapses the
  article's two-column grid, because there is no "read next" from a legal
  notice. It is also the only page with no contact section — a notice that
  explains what happens to the data you hand over should not close by asking for
  more of it, so the route for exercising a right is a `mailto:` in the body.
  Everything it claims is read off the code: no cookies and no third-party
  request on a public page, Turnstile loaded on first form interaction only, and
  the rate-limit key on the caller's IP expiring after exactly 7200 seconds. The
  24-month retention is the one number nothing enforces — it is a promise kept
  by hand in Slack and the mailbox. `src/pages/privacy/body.mjs` records which
  is which; keep it true if either half changes.
- **`src/pages/prose.mjs` is the long-form vocabulary, and it is not the
  insights'.** Two page families run long enough to need headings, quotes and
  lists — the articles and the privacy notice — so it sits a level above both.
  `p`, `h2` and `quote` interleave their interpolations; they used to drop them
  silently, which is the wrong failure for a tag whose job is to carry a
  sentence.
- **Colocation**: keep CSS/JS/assets in the component or page folder. A component
  that also owns markup keeps both halves there under one name:
  `components/contact-form/contact-form.mjs` renders the section at build time,
  `contact-form.js` upgrades it in the browser. The homepage and the team page
  both call `contactSection()`, passing an id prefix and the two lines each page
  phrases for itself; everything else comes from the shared `contact.*` and
  `form.*` keys, so the two forms can never drift apart.
- **`/media/` is the un-hashed public file namespace**: the two course
  one-pagers live in `public/media/` beside the two generated brand images, the
  founder portraits in `public/media/team/` and the "Inzichten" thumbnails in
  `public/media/insights/`, and all of them ship as-is. A fiche is named after
  the course it belongs to (`SmartAgents_AI_Business_Teams_Onepager.pdf`,
  `SmartAgents_Agentic_Engineering_Onepager.pdf`): the browser prints the file
  name in the download bar, and the two were named after the products the
  courses were once built around, so a reader clicked one course and was handed
  something that looked like another. The link prints the format and the size,
  read off the file at build time in `training.mjs`. The awareness and
  management fiches that were left over from the learning path "Ons aanbod"
  replaced are deleted: nothing linked them and Google would have indexed them
  as orphan PDFs competing with `/training/`. A file authored inside a deck and shown
  on a public page too (today: the kata tour video) is never duplicated: it stays
  in the deck folder and `PROMO_MEDIA` in `build/render.mjs` copies it into the
  same `/media/`. `/secured/` is gated, so a public page can never link into it.
  `_headers` gives `/media/*` its own cache policy.
- **Tokens live once.** `src/styles/tokens.css` is the only place custom
  properties are defined; `build/render.mjs` prepends it to `critical.css` and
  inlines the pair in every `<head>`. Never redefine a token in `main.css`.
- **The dark field is one field, and where two shapes meet under the cursor it
  is one fluid.** Every navy shape is a `.field` carrying `data-magnet` and
  `data-clip`, with a `<sa-node-field>` inside. The clip path must sit on the
  same element as `data-magnet`: `src/motion.js` grows that element's box and
  remaps the outline into it. A shape's own silhouette is the outline itself,
  moved: every sample slides toward the cursor by a Gaussian in *arc length*
  along the perimeter, so the swell is a bell with the drawn curvature intact
  and a stretch of edge far along the outline cannot follow the cursor, however
  close it happens to lie in the plane. One silhouette, never a seam — the clip
  path is rewritten, so the swell carries the node field with it.
- **A join is the only place a field is used, and it is local.** Where two
  displaced outlines come within reach of each other, they are read as
  `exp(-distance/k)` and summed over a window covering where the two can reach
  each other — the overlap of their boxes, opened out by how far one still lifts
  the other's contour, *not* a box around the narrowest point, because once two
  shapes are close enough to run together their outlines cross well away from
  it. The contour where that sum is 1 is the metaball union, which lies outside
  every outline and necks between two of them with a concave fillet at each
  body. It is traced by marching squares on a 4px grid, resampled at even arc
  length, and written out as Bézier curves — a chord anywhere on a join is a
  corner waiting to be seen, and a spline through unevenly spaced points
  scallops, so both halves of that matter. The trace is not the silhouette: it
  is drawn half a pixel inside the union, so wherever the join has lifted the
  contour by less than that the authored outline is what shows — which keeps
  every apex exactly as drawn and buries the corner where the two hand over.
  Outside the window there is no field at all.
- **What holds a join together is `k`, and `k` is the cursor's.** It scales on
  how near the cursor is to the *further* of the two shapes, so a join needs the
  cursor to be near both and at rest there is none. It is keyed on the distance
  to each outline and never on the point that realises it: distance to a closed
  curve moves as smoothly as the cursor does, while the nearest point jumps
  across a shape the moment two approaches tie — and a join keyed on that jumps
  with it, which is seen as the whole thing flickering as the pointer travels.
  Two outlines facing each other across `g` can only close it when `g` is under
  `2k·ln2`, which is the early-out the pass leans on: most frames strike no
  window at all. A join has to arrive a little inside that limit, where its
  waist is already tens of pixels wide, and is then held to the limit itself
  once open — a 4px grid cannot draw a waist thinner than a cell, and without
  the hysteresis the merge stutters on sub-pixel cursor travel. What the
  neighbours add to the sum has the value it would have at the window's rim
  taken off it, smoothly, so the lift is gone by the rim and the window's own
  shape can never show.
- **The union covers the bodies it was struck from, so the lowest of them paints
  it** and the others draw their bodies over the top: that is what keeps the DNA
  disc's helix from being painted out by the blob reaching it. It also makes
  winding load-bearing. A join appended to a body under one fill and the default
  `clip-rule: nonzero` reads a loop wound against that body as a hole punched
  through it, and the silhouettes in `clipDefs()` are not all wound the same way
  — the staffing arch and the tracks wedge run one way, the DNA shapes the
  other. `src/motion.js` measures each path's winding at setup and turns the
  join to match. A new silhouette may be drawn either way round; a silhouette
  with two subpaths of its own has to wind them consistently.
- **A page's height is not a constant, and `<sa-node-field>` is anchored to the
  document.** The shared field re-measures on every tick, and it used to re-seed
  whenever the document grew or shrank by more than 2px — which is fine for a
  page that only reflows on resize and is the network flying apart thirty times
  a second on one that does not. The AI staffing accordion was the first block
  on the site to move the document height at runtime and it found this. A field
  that has changed size is now topped up rather than re-seeded, with enough
  hysteresis that an opening row does not change the population at all, and
  every window re-measures its slice because the shapes below a block that just
  grew have all shifted. Anything else that animates a block's height inherits
  this for free; anything that re-seeds will look the same way again.
- **A magnet rewrites the path its `data-clip` names, not the one the element
  is actually clipped by.** `collectMagnets()` in `src/motion.js` resolves the
  outline with `getElementById(element.dataset.clip)` and never reads the
  computed `clip-path`. Every hero silhouette is swapped to `#heroSwoop` under
  621px, so down there the magnet is rewriting a path nothing is using and the
  pull does nothing — which is right, because there is no cursor on a phone,
  but it is right by accident. A silhouette that is swapped at some width for a
  reason other than the phone would need the magnet told about it.
- **Setting up a magnet is two steps, and only the first one runs before the
  page is painted.** `collectMagnets()` grows the box and writes the resting
  silhouette; `arm()` samples the outline and builds the arc-length table, on
  the first idle callback or on the first pointer move, whichever comes first.
  The split is what put CLS at 0. Growing five boxes by 140px a tenth of a
  second after the page arrived scored 0.07 of layout shift, and the growth
  could not simply be moved before the paint because sampling those five
  outlines costs 111ms on a cold engine (`getPointAtLength` is ~85µs a call
  until it warms up, then ~20µs). It does not have to be: growing the box is an
  affine map in unit space, an affine map of a Bézier is the same map applied to
  its control points, so `remapPathData()` moves the *authored* curve into the
  grown box exactly, in ten segments rather than four hundred and eighty, with
  no sampling at all. The dense outline is only what the pull runs on, and
  nothing needs it until a cursor arrives. `collectMagnets()` also reads every
  layout value before it writes any of them, for the ordinary reason.
- **A magnet's box is frozen in pixels the moment it is set up, and so is
  everything struck from it.** The outline is sampled, the grown box is
  measured, the outline is remapped into it, and the arc-length table the
  falloff runs on is built — once. The committed build before this one
  re-measured the box every frame and so tracked a runtime size change; this one
  does not, which is the trade for not rebuilding an arc-length table sixty
  times a second. So a shape may not be struck between two edges that can move
  apart afterwards: it would not merely shift, it would stretch, and the
  silhouette would stop fitting what it was sampled against. Only a window
  resize rebuilds it. Nothing is precomputed against a *neighbour's* position,
  though — a join is struck from where both outlines stand this frame, so shapes
  that move relative to each other at runtime are fine. The AI staffing page has
  one of each: the track panel's leaf is anchored to the panel's top and sized
  from the gutter, so it is still while rows open; the wedge under the panel's
  foot is anchored with `bottom` plus a height, so it travels with the foot at a
  constant size. Sizing the `.field` itself is still insets-only — an explicit
  width or height over-constrains the box and moves it instead of growing it —
  but the `.field-slot` around it is ordinary CSS and is where a stable box
  belongs.
- **The magnet attributes tune the swell, and the swell is what decides a
  join.** `data-magnet-amp` is how far the outline travels at the deepest point
  of the pull, and `data-magnet-sigma` is how wide a stretch of the perimeter
  travels with it — a big shape swells over a wider stretch of its edge than a
  small one, or the pull reads as a spike rather than a turn. Both feed the join
  only through the gap they leave: two shapes run together when what is left
  between them is under `2k·ln2`. `data-magnet-free` opts a shape out of the
  guard that refuses a pull from an edge tucked under the nav or past the page
  edge. Take it only for a shape that is nowhere near either, or for one that
  pins the edge it would have been guarded on. It also changes the default
  amplitude — 34 guarded-out against 92 guarded — so removing it from a small
  shape does not merely lift a guard, it triples the pull and translates the
  whole silhouette; the DNA blob is 100px across and needs the 34, and the disc
  beside it, which opts out because its own outline runs along the top of its
  box, has to say `data-magnet-amp="92"` to keep the pull it had.
  `data-magnet-pin` (a comma-separated list) welds the shape to each page edge
  it hangs from: the pull fades to nothing over the last 30px before each, so
  no swell can peel it off the edge it is drawn from. A silhouette may be
  several subpaths when a join is drawn, and a join between three shapes can
  leave a paper island: the trace keeps marching squares' own relative winding
  and the set is turned as a whole by the sign of its total area, so the island
  stays wound against the loop around it and the nonzero fill rule paints it as
  the paper it is.
- **The AI staffing page's hero is an arch and two pebbles.** `heroArch` is hung
  off the right edge and `heroPebbleA`/`heroPebbleB` are positioned inside the
  arch's own box, so the three move as one and the page overrides only that box.
  The box hangs 14% past the hero's foot: the arch's tail runs on into the
  section below and passes behind the track panel there, which is the whole
  reason that panel is opaque. The pebbles are the only free-floating dark
  shapes on the site and they are dropped from the tablet down, where the shared
  `.hero__field--right` carries the arch alone and the phone turns it into the
  same sliver the petal becomes. The arch went through two drafts that both
  failed the same way: a diagonal struck corner to corner with a shallow bow
  read as a black triangle, and the cove that replaced it filled the whole
  corner and needed a second silhouette in the opposite one to balance it.
- **A disclosure is a `<details>`, and an accordion is three of them sharing a
  `name`.** The AI staffing page's track panel is the only figure on the site
  that opens and closes. The markup is what works with JS off — the rows open,
  and the `name` group makes the browser close the open one — and
  `<sa-accordion>` takes both over when it loads, because that is the only way
  either of them travels rather than snaps. The CSS version came first and does
  not work: Gecko supports `::details-content` but not `interpolate-size`, so
  `block-size: 0` -> `auto` on the pseudo is not interpolable there and every
  row arrives at full height. Two boxes inside the row, not one: a padded box
  cannot be animated to nothing, because its own padding is the floor its height
  stops at. The same no-JS-first reasoning is why the mobile nav is a
  `<details>`.
- **The tablet is drawn, so it is not invented.** `SmartAgents Homepage Tablet`
  (834x1112) in the design project is the source for everything between the
  desk and the phone, and four breakpoints carry it now. 1180px is where the
  header stops being a nav bar: the artboard drew that row against four items
  and the offer is six, four of them service names two and three words long, so
  the row is a desk-only thing and the tablet takes the disclosure the phone
  already has, in its compact dropdown mode. 768px is what is left of the
  artboard's own header — the taller row, the fluid brand, the wedge narrowed to
  the phone's, the tightened gutter — and it no longer moves the nav. 1000px is
  where every list that runs two abreast starts doing so, and 620px is where the
  hero stops being split, the phone's own line, because the column and the lobe
  are both shares of the width and hold to 621px. See "Deviations from the
  design doc", item 1, in the `smartagents-design` README for what each one
  changes; change a number there and in the CSS together. If the offer ever
  shrinks back to two services the row fits at 768px again and that band should
  get it back.
- **No third-party requests.** No webfonts, no icon library, no analytics on the
  public pages. Turnstile is the one exception and loads only on interaction.
- **`/secured/` is self-contained but not off-brand.** It serves its own
  `tokens.css`, `base.css` and `deck-stage.js` and links nothing from the public
  build, yet `src/content/secured/tokens.css` carries the same values as
  `src/styles/tokens.css`: paper, ink, the navy field, one cyan. Every page
  behind the password reads it — the login gate, the overview, both Smart Scan
  documents and all ten decks — so it is the one place a colour is defined
  there. Keep it in step with the public token file.
- **The dark field is a class in `/secured/`.** `.field` on any element flips
  the semantic roles to their on-navy values, so a rule written once reads on
  both grounds. A slide is paper and never carries it; what carries it is the
  navy shape clipped into the cover and the closing slide, and any navy element
  inside a paper slide. The retired decks put it on the `<section>` and painted
  a whole slide navy, which is the one thing the redesign does not do. The
  branch in `chrome()` that swaps in `logo-dark.svg` for a `.field` section is
  what is left of them. The one thing that
  breaks is painting `--sa-field` on an element and leaving the class off — the
  text inside then stays ink on navy.
- **The decks are paper with categorical colour.** `--sky`, `--blue`,
  `--purple`, `--violet`, `--teal`, `--green`, `--amber` and `--rose` exist only
  in the secured token file: a deck codes a section or a step by colour and the
  public site never does. Each has an on-paper value and an on-navy step under
  `.field`. Reach for `--accent` first; these are for when a thing is genuinely
  one of several.
- **The form reports its own failures, and only counts a submission it could
  forward.** Three of the four fields are required and nothing said so: the
  visitor found out on submit, one field at a time, from a bubble that vanished.
  The marker is a `*` with the word behind it for a screen reader and a legend
  at the head of the form; `contact-form.js` takes `novalidate` once it has
  upgraded, names every failing field at once in a slot `aria-describedby`
  already points at, and clears each one on `input`. The e-mail pattern is the
  one `validatePayload` applies, deliberately — a form that accepts what the
  endpoint rejects sends the visitor a round trip to be told what the page knew.
  On the endpoint, `checkAndIncrementRateLimit` now runs *after*
  `validatePayload`: the other way round a malformed submission burned one of
  the caller's five attempts an hour.
- **The contact path is checked end to end, because it broke in the gap between
  its two halves.** The form posts what its inputs are named; `/api/contact`
  validates its own list; nothing compared them, so a required `subject` no
  input carried 400'd every submission the site ever made. `scripts/check-contact.mjs`
  runs as the last build step: it parses the rendered form out of `dist/`, posts
  those exact fields through the real `onRequestPost`, and fails the build if
  they are rejected, if the message does not reach the webhook, or if a missing
  or erroring webhook is answered with `{ ok: true }`. Turnstile and n8n are
  stubbed at `globalThis.fetch`, so it needs no network and no secrets. Add a
  field to the form or a rule to `validatePayload` and this is what tells you
  the other half disagrees.
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
- One of the brand's two moving parts is ported to a deck.
  `presentations/shared/node-field.js` is `<sa-node-field>` with the sharing
  taken out: the site keeps one field in document coordinates and treats every
  dark shape as a window onto it, which a fixed, transform-scaled stage has
  nothing to anchor to, so each element seeds and drifts its own network in its
  own box and the host's `clip-path` does the rest. It is denser and brighter
  than the site's, because a silhouette covers about a quarter of the box it is
  drawn in. The magnetic pull in `src/motion.js` is not ported and will not be:
  it has no meaning without a cursor on the shape. The orbit rings are ported
  too, at about half the site's period and with the long fade, because a slide
  is looked at rather than scrolled past. Every deck in the folder is on this
  now; the flat navy covers went with the per-deck stylesheets.
- No build-step image pipeline. Both picture sets under `public/media/` were
  derived by hand with `sips`. The recipe, and the two traps that cost the most
  time (`--cropOffset` is in points; an odd-dimension AVIF renders as its alt
  text in Gecko), are in the `image-pipeline` skill.
- Geist is named first in `--font-sans` but no binaries were supplied, so the
  platform face is what renders. Ask the client for the WOFF2 files.
- All four service rows link out, through `servicePath()` in
  `src/layouts/base.mjs`, which is the one place the homepage rows and the nav
  bar both ask. Procesoptimalisatie is gone: it was one row standing for two
  different engagements, and it is now the two it always was — AI-native SDLC
  for the engineering side and AI-native businessprocessen for the business
  side. The plain-row branch in `services()` survives for the case it was
  always really about: a language a page is not published in, where
  `servicePath()` returns null. Agentic automatisatie was dropped as a service
  of its own — it is part of what the staffing track does inside a project. All
  four article rows link too, through `insightPath()`. See "Deviations from the
  design doc" in the `smartagents-design` README.
- **`NAV_ITEMS` is not what the bar prints.** `BAR_ITEMS` in
  `src/layouts/base.mjs` is: the four services and the team page. Inzichten is
  in `NAV_ITEMS` for the phone sheet alone, because with four service names in
  the row there is no width left for a section that is read on the way down the
  homepage anyway, and Contact is in neither — the button two items along goes
  to the same anchor, in the bar and in the sheet. The difference is emitted
  rather than hidden in CSS: a nav link that is `display: none` at every width
  ships in every one of the site's HTML files, is out of the accessibility tree
  too, and puts what the bar contains in a stylesheet instead of beside the
  list.
- The live site also has a Jobs page. It has not been redesigned yet, and
  nothing links to it.
- A URL that matches no page gets a real 404 now: `render.mjs` writes the
  default language's not-found body to `dist/404.html` as well as to
  `/nl/404/`, and Cloudflare serves that with the status code. It used to fall
  back to `index.html` with a 200, and `src/sw.js` still checks the
  `Content-Type` before it caches anything (`isCacheable`) — a cache-first
  worker that stores a 200 stores the homepage under a missing asset's URL, and
  the asset then fails on every later visit with no way to reload out of it.
  Keep that check whatever the host does.
