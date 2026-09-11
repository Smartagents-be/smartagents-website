# CLAUDE.md - Agent Entry Point

Pre-rendered static site, no backend, no framework. The public site is the
redesigned homepage, six detail pages — training, AI staffing and coaching,
the AI-native SDLC, AI-native businessprocessen, team, and jobs — one page below
one of them (the agentic engineering kata, under training), the privacy notice,
the "Inzichten" index and the four articles under it (NL / EN / FR); the
password-gated `/secured/` area (internal documents and pitch decks) is live.

## Skills — read these first

Eight of the skills in `.claude/skills/` define the architecture, the look and the
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
- **`motion-fields`** — the site's shapes: hero silhouettes, the magnetic
  pull, the metaball joins, the orbit rings, the footer and the buttons. Read it
  before drawing or moving anything on the dark field.
- **`jobs-and-odoo`** — the jobs page and the Odoo vacancy integration behind
  it. Read it before touching a vacancy, its source or its page.
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
- **Vacancies**: `npm run sync:jobs` refreshes the committed Odoo snapshot in
  `src/content/jobs/`. The build reads Odoo live and only falls back to that
  file, so this is housekeeping rather than a step: run it, read the diff,
  commit it. `npm run dev` sets `ODOO_OFFLINE=1` and reads the snapshot instead
  of the network, so a save still rebuilds in under a second and the watch loop
  works on a train.
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
- **Odoo owns the vacancy list, and the jobs page prints it. Both are in the
  `jobs-and-odoo` skill** (`.claude/skills/jobs-and-odoo/SKILL.md`): the
  Cloudflare deploy hook and the two Odoo automation rules behind it, the three
  sources the build reads and why it never fails on any of them, the language
  fallbacks, what may not be rewritten from Odoo, and the page's own shape.
- **`ODOO_LOGIN` and `ODOO_API_KEY` are optional build variables**, and they are
  an upgrade rather than a requirement — see the `jobs-and-odoo` skill for
  what the build does with and without them. The
  key belongs to an Odoo user with read access to Recruitment and nothing more,
  because an Odoo API key carries the full rights of the user it was made for.
  It is a *build* variable marked as a secret, never a Function binding: it is
  used on the build machine and `check-dist.mjs` fails the build if its value
  turns up anywhere in `dist/`.
- **Build-time variables are separate.** `TURNSTILE_SITE_KEY` and `SITE_ORIGIN`
  are read by `build/lib/config.mjs` and `build/lib/i18n.mjs` while the site
  renders, so they are ordinary Pages build settings and `wrangler.toml` does not
  touch them. Both have fallbacks, so a missing one changes the output instead of
  failing the build: no site key means the contact form keeps its `mailto:`
  fallback.
- **Node is pinned in `.nvmrc` (22.14.0), with a floor of `>=22.12` in
  `engines` in `package.json`.** Vite 7 needs `^20.19 || >=22.12` and the Pages build image
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
- **The kata page's content is read off the course, not off the marketing
  page.** `src/pages/kata.mjs` was first ported from the client's live
  `/services/training/developers/`, which describes the day as four
  morning/afternoon blocks and says nothing about what is in them. The course
  itself lives in a sibling repository, `../kata-agentic-java`, and that is the
  source of truth: `PRODUCT.md` for what it is and who it is for, and
  `front/src/steps/step*/locales/{nl,en}.json` for the four steps and their
  units. Everything the page now states about the day — the step names, the
  unit lists, the flag boards, the four workflows, the quality gates, the
  self-study track, the soft-skills step nothing else on the site mentioned —
  is read from there. Two rules follow. **A claim about the course is checked
  against that repo, not against the old page**, which is behind it in several
  places. And **nothing on the site names a language or a build tool**: the
  course runs on one stack and the page says so once, in
  `kata.requirement.stack.body`, where a reader deciding whether their team
  qualifies needs it. The video and its poster are the exception and they are
  not text — the poster still reads "on a real Java codebase", which is a
  re-render of `presentations/enterprise-pitch/assets/`, not a copy edit.
- **A page may sit under another page, and the slug is the only place that is
  said.** `src/pages/kata.mjs` is the first: `training/agentic-engineering-kata`
  in Dutch and English, `formation/kata-agentic-engineering` in French, which is
  the parent's own slug plus a segment. Nothing in the build had to be taught
  this — `pagePath` trims and rejoins, the generated routing table only ever
  names the *top-level* entries of `dist/`, and the catch-all sends the
  unprefixed URL to Dutch like any other. Three things do need saying. The
  parent segment is written out rather than read off `training.mjs`, because
  that page imports `kataPath` back to link down and the pair would close a
  cycle — the same reason `PHONE_HREF` is repeated in the privacy body; rename
  the training slug and this moves with it, and `check-dist.mjs` fails the build
  on the broken link if it does not. The page id is the parent's plus a hyphen
  (`training-kata`), because `isCurrentNavItem` in `src/layouts/base.mjs` now
  marks a service while the reader is on anything under it, on exactly that
  prefix. And the breadcrumb has three steps rather than two, which is what
  `breadcrumbNode` was always shaped for. It carries a `Course` node rather than
  a second `Service`: the training page already declares the `Service`, and this
  page is one thing inside it with a duration, a group size and two languages —
  every field read off the `kata.spec.*` values the strip prints. There is no
  `location` in it, deliberately: the day is held at the client's office, so the
  only address we could name is the one place the course is not.
- **Pages are functions.** A page module exports `{ id, slugs, meta(t), render(ctx) }`
  and returns markup from the `html` tag. Never hard-code visible text: use `t()`.
- **A hero is a headline and its actions, and nothing between them.** For a
  while every hero printed its page's own `description` key as a standfirst,
  through `.hero__lede`: the heroes were eyebrow, headline, two buttons and then
  300px of paper, and the sentence that says who the page is for already existed
  as the page's search snippet, so it was read from there rather than written
  again. It is gone from all seven heroes, along with both `.hero__lede` rules in
  `critical.css`, and the `*.description` keys are metadata again — changing one
  changes the search snippet and the head, not the visible page. What the
  removal does not change is **the homepage's hero wordmark, which is gone**: it
  printed the brand a second time 120px under the header's own, pushed the offer
  below y=1000, and left the one heading on the page reading as a claim with
  nothing under it. The claim is the heading now, at the size the lockup had, so
  `.hero__wordmark` and the `.hero h1.hero__claim` override went with it and
  `.hero h1` is one rule again.
- **An eyebrow is either a link up or it is not printed.** `.page-eyebrow` is
  the shape of a breadcrumb, and on five detail pages it was a `<p>` naming the
  nav item the reader had just clicked. Those are gone, along with the team
  page's "De oprichters" pill over two people who are visibly the founders. It
  survives on the two page families that sit under something other than the
  homepage — the kata page and the four articles — and on both it is
  `.page-eyebrow__up`, an actual link to the parent, which is the whole
  breadcrumb this site needs. It falls back to a plain label in a language the
  parent is not published in, the rule `servicePath()` follows everywhere else.
- **A row's cue is the arrow and nothing else.** Every row list on the site is a
  list of whole-row links whose own title names the destination, and the cue used
  to print "Ontdek →" — twice over on the homepage, across four service rows and
  four article rows, so one word stood at the end of eight rows 1152px wide. The
  word went and `cta.moreInfo` with it. One exception carries a label,
  `.row__cue--named`: the jobs page's three "Werken bij" rows, where only the
  middle one links, so an arrow is a difference a reader has to notice before
  they can read it and `jobs.why.team.link` says where it goes instead.
- **The header's action is the page's, not the site's.** `headerAction()` in
  `src/layouts/base.mjs` is read by the bar, the phone sheet and the sticky
  bar, so the action is the same at every width. On the ten pages with a contact
  section it is `cta.talk` at `#contact`; on the two without it, that anchor
  resolved to `/nl/#contact` and threw the reader onto another page with no
  warning. Jobs sends them to the vacancies one screen down, in the page's own
  words, and the privacy notice sends them to a person by mail, which is the
  channel the notice itself names for a data request.
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
  else to go. **`articleRows()` takes the heading level from its caller**: the
  same rows print under a section `<h2>` on the homepage and directly under the
  page `<h1>` on the index, and a hard-coded `<h3>` made the index read h1, h3,
  h3, h3, h3, h2 — a skipped level and then a jump back.
  Adding an article means adding an entry there plus a body module beside
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
  and a `BreadcrumbList` on everything below the homepage. The homepage adds
  none of its own: it had an `FAQPage` read off the questions block, and both
  went when that block did. The one rule is that nothing in the graph may say something the page
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
- **The privacy notice has rules of its own, and they are in
  `src/pages/privacy/CLAUDE.md`** — the article layout with no hero, the sticky
  rings and their two dim rules, the clause index and its scroll spy, the
  `clause:NN` href, and why the Cookies clause is scoped the way it is. That
  file loads when you work under that directory.
- **Every navy shape, the magnetic pull, the joins, the orbit rings, the footer
  and the button states are in the `motion-fields` skill**
  (`.claude/skills/motion-fields/SKILL.md`). It holds the hero silhouettes page
  by page, how one field becomes one fluid under the cursor, how a magnet's box
  is struck and frozen, where a free shape may and may not stand, the orbit
  layer's fades and its `forced-colors` rule, the footer's grid and legal
  microline, and the four button fills. Read it before drawing, moving or
  retuning any shape.
- **The site names one external source, and it names it as a link.**
  `sdlc.journey.lede` says the journey is built on what Anthropic publishes
  about AI-native engineering, and `sdlc.journey.source` under it links
  `PLAYBOOK_URL` in `src/pages/sdlc.mjs` —
  `claude.com/blog/the-ai-native-sdlc-playbook` — with the `target="_blank"`,
  `rel="noopener noreferrer"` and visually-hidden `a11y.newTab` hint every other
  link out of this site carries. The claim and the link are two elements rather
  than one interpolated sentence: no i18n value on this site carries markup, and
  a sentence split across three keys around an `<a>` is one three translators can
  only get right by accident. `.section-lede--sourced` hands the lede's bottom
  margin to the link so the pair reads as one block. A named document that
  cannot be opened is a name-drop, which is what this line was for a while — see
  item 18 in `improvements.md`.
- **The homepage is hero, services, DNA, insights, contact.** "Digitale
  transformatie" stood between the DNA and the insights: four capability areas
  beside an isometric stack that repeated all four labels a second time. Two of
  the four were two of the services under a different name, which left the page
  carrying three overlapping taxonomies and no way for a reader to tell which
  one was the offer. It is gone, and with it the stack, the `stackField` clip
  path, the `.numbered--plain` modifier nothing else used, and 384 lines of
  `main.css`. `.numbered` itself stays — the kata page's steps are built on it.
- **A tag row is not a summary of the paragraph beside it.** Four blocks printed
  one, and all four are gone: "U krijgt" on the training page (Lesmateriaal ·
  Oefeningen · Labs · Q&A · Slides · Begeleiding), "De kata bevat" on the kata
  page, the four words under each founder on the team page, and the three under
  each track heading on the AI staffing page. Every one of them cut the copy
  beside it into noun phrases and printed them above it, which is the "too many
  subtexts" pattern, and on a closed accordion row it did so before the reader
  had asked for any of it. "Past wanneer" stays on a staffing track: it is the
  one sub-block that tells a reader something the body does not, which is
  whether that track is theirs.
- **The training facts strip is per course, and the developer course prints one
  row fewer.** `FACTS` in `src/pages/training.mjs` is the default list; a
  `COURSES` entry may name the facts it omits through `omitFacts`. The developer
  course omits `format`. Its value was "Bij u op kantoor" and the kata page's own
  spec strip states that same sentence one click away under "Locatie", so the
  row was the fact printed twice on one path — which is the contradiction the
  per-course values exist to prevent. The business course keeps its row, because
  it has no page of its own to state it on. The cost is that the two strips
  differ by one row; the subgrid absorbs that inside the facts row, so the links
  below still sit on one line.
- **The training facts strip states four facts, and price is not one of them.**
  "Prijs — Op maat, na een korte intake" is a row that answers nothing: a reader
  checking whether they can afford a day leaves knowing exactly what they knew
  before it, at a fifth of the strip's height. A range would be worth printing
  and nothing in this repo or on the site knows one, so the CTA under the strip
  is what asks. Put the row back the day there is a figure behind it.
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
  `form.*` keys, so the two forms can never drift apart. **Every page that
  carries the section carries the lede**, including the homepage and the
  training page, which used to open on the heading alone: `contact.lede` is where
  "We antwoorden zelf, meestal binnen een werkdag" lives, and the homepage is the
  page where that reassurance matters most.
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
  `_headers` gives `/media/*` its own cache policy. **Nothing prefetches it**:
  the two course one-pagers are about 200 KB each and the training page links
  both, so a reader running an eye down the offer used to pull half a megabyte of
  PDF nobody asked for. The exclusion is in the speculation rules in `base.mjs`
  and in the hover fallback in `src/app.js`, which also skips a metered
  connection — a prefetch is for a page the reader is about to navigate to, and a
  file the browser hands to a download bar is not that.
- **Tokens live once.** `src/styles/tokens.css` is the only place custom
  properties are defined; `build/render.mjs` prepends it to `critical.css` and
  inlines the pair in every `<head>`. Never redefine a token in `main.css`.
  **A token with no reader is paid for on every page view of every page**, so
  fourteen came out: the nine the UI review named, `--focus-ring` (the form's
  focus ring points at `--focus-ring-action` now, the value the buttons are
  measured at) and the four `--action-ondark-*` steps that were `.btn--ondark`'s
  fills. Nine of them are still declared in `src/content/secured/tokens.css`,
  which is a separate file for a separate build and does use them: the two files
  are kept in step on the values they share, never on the set of names.
- **A colour token has to name the colour that renders, and `check-dist.mjs`
  fails the build if it does not.** Every `oklch()` in `dist/` is checked
  against the sRGB gamut for its own lightness and hue. This is not pedantry
  about a rounding step; an out-of-gamut colour fails in three ways at once and
  none of them warn.
  - **It comes back paler, not brighter.** Gamut mapping reduces chroma, so an
    accent asked to be more vivid than the medium allows is drawn *less* vivid.
    `--sa-cyan-bright-hover` was declared at chroma 0.128 against a ceiling of
    0.1047 and washed out to `#5ff6ff` — a hover step that went toward grey.
  - **It turns the hue.** The channel that has gone negative is clamped and the
    other two are not, so the colour rotates. `--sa-cyan` said hue 214 and the
    screen showed 218. That is why "the brand is teal, not cyan" had to be
    re-measured off a screenshot rather than read out of the file: the token
    said cyan, the site drew teal, and both were "correct".
  - **Every derivative drifts.** `color-mix()` and the `/ alpha` form run on the
    *declared* coordinates and map the result along a different path than the
    base colour took, so a wash is not the token at lower opacity — it is a
    different colour. `/secured/` had eight `--accent-NN` steps mixed off one
    unreachable accent.
  Both token files are clean now and both name the rendered hex in a trailing
  comment. Two consequences for anyone changing a colour. **Measure in the
  browser, not offline** — Chrome does CSS Color 4 gamut mapping, not a naive
  channel clamp, so a hand calculation lands a step or two off; the way to pick
  a value is to paint the candidate to a 1×1 canvas and read it back. And
  **lowering a lightness lowers the chroma with it**, because the gamut narrows
  as it darkens: `--sa-deep` at L 0.33 tops out at 0.066.
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
  Three more things the form says for itself. **Optional is marked as well as
  required** — `form.optional` beside "Bedrijf", because marking only one of the
  two leaves the other ambiguous to a reader who has not read the legend.
  **The button names the result**, `cta.send` being "Verstuur bericht" rather
  than "Verstuur". And **429 has its own sentence**: "Versturen lukte niet" in
  front of a rate limit invites exactly the retry that caused it, so
  `form.rateLimited` names the wait and the phone, and every other failure keeps
  the one line it had.
  **A missing `TURNSTILE_SECRET_KEY` is a 500, not a failed captcha.** Unbound,
  the key was posted to Turnstile as the literal string "undefined", Turnstile
  answered `invalid-input-secret`, and the visitor was told their captcha had
  failed — a 403 blaming them for a binding nobody had set.
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
- **`.orbits--insights` pushes its origin to 150% on a phone and the number is
  probably backwards.** The same override was tried on the privacy notice and
  dropped: measured there, moving the origin out lifts the innermost ring off
  the reading measure but shortens the vertical reach the outer rings need, so
  the cyan ring gains 161 rows of crossing and the darkest ink ring gains the
  column's whole height. The insights index has not been measured against its
  own geometry — its section is a third the height and its origin starts at 104%
  rather than 98% — so the rule stands there and the comment says so. Measure it
  before copying either number to a third page.
- **`--measure-prose` is 100ch, and 100ch is 128 characters.** The token caps
  every `.article__main` on the site — the four insight pages and the privacy
  notice — and it only bites above about 1500px, where the grid would otherwise
  give the column more. There it resolves to 1022px, which at the body size is
  128 characters to the line, not 100: at 1920 the notice is a 128-character
  column with 510px of gutter beside it, which is the measure the design README
  calls "long by the usual measure, and the client's call". The README names the
  lever (the body size and this token) and 78ch would put it at about 100
  characters. It is left alone here because lowering it changes the four
  articles' measure at every desk width, which is a decision the client made,
  not one to take silently while fixing a legal page.
- **There is a print stylesheet, and it exists for one page.** A GDPR notice is
  the page most likely to be saved as a PDF — by a DPO, a procurement reviewer,
  a client's lawyer — and until the block at the foot of `main.css` existed that
  print carried a solid navy shape, the orbit rings, the sticky header, the
  phone's action bar and a rail beside a column. The rules are written for every
  page rather than scoped to that one, because nothing in them is
  page-specific: hide what is chrome or texture, unstack what is a share of a
  viewport that no longer exists, and print the href after an off-page link.
- **The phone's action bar waits for the hero's own action to leave.** At
  390×844 the hero's primary button and the sticky bar's copy of it were both on
  the first screen — the same words 490px apart, one of them covering the foot of
  the page to say what the other already said. `data-hide-until` on
  `#mobile-actions` names the element the bar defers to and `src/app.js` puts
  `.is-deferred` on and off with one IntersectionObserver. The bar ships
  *visible* and this hides it, so with JS off a reader gets the duplicate rather
  than no action at all; the `visibility` delay is on the hiding direction only,
  because on the base rule it holds the bar invisible for a third of a second
  after it should have come back.
- **`src/motion.js` carries no spotlight any more, and it reacts to
  `prefers-reduced-motion` at runtime.** The spotlight hung a `pointermove`
  handler on every `[data-spotlight]` element, read that element's box and wrote
  a `radial-gradient` string into its inline style on every event — and no page
  has carried the attribute since the dark cards it was drawn for became hairline
  rows, so it shipped in the entry chunk on every page and ran on none of them.
  The reduced-motion query used to be read once at module evaluation with the
  whole wire-up standing inside that reading; both queries feed one `sync()` now,
  so a reader who turns the setting on mid-visit gets the magnets torn down
  rather than left pulling.
- **`sitemap.xml` prints `lastmod` only where a page knows one.** Four articles
  and the privacy notice carry a date the page itself prints, and they hand it to
  the sitemap as `meta.lastmod`; nothing else has an honest answer. A `lastmod`
  invented from the build clock tells a crawler that every page changed on every
  deploy, which is how a sitemap stops being read.
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
  platform face is what renders. Ask the client for the WOFF2 files. One thing
  is measured against the face that renders today and has to be re-measured
  when they arrive: the footer's disclosure line clears a 1280px laptop by 18px
  in Dutch, and the same string sets 12px wider in some faces. See
  `.footer-micro` in `main.css`. The header row is the second: at 1181px the
  nav's seven names are 564px in French with no slack left behind them — the
  primary action is already 31px inside the gutter there — so a wider face
  widens that band rather than clipping anything, and in Dutch and English the
  15px of slack the row has is about 1.5%, which a face setting 2% wider does
  clip. See `.site-nav` in `critical.css`.
- All four service rows link out, through `servicePath()` in
  `src/layouts/base.mjs`, which is the one place the homepage rows and the nav
  bar both ask. Procesoptimalisatie is gone: it was one row standing for two
  different engagements, and it is now the two it always was — AI-native SDLC
  for the engineering side and AI-native businessprocessen for the business
  side. The plain-row branch in `services()` survives for the case it was
  always really about: a language a page is not published in, where
  `servicePath()` returns null. A course column on the training page links out
  the same way, through `kataPath()`, and the column's closing grid row is a
  `.offer-course__links` wrapper rather than a bare `<a>`: the two columns are
  subgrids of six rows, and a second link as a row of its own would push one
  column's bottom edge below the other's. Wrapped, the pair sits on one line
  wherever the column is wide enough and wraps below about 1100px, where the
  cost is trailing paper in the shorter column rather than a mismatched rule.
  The two courses no longer share a format or a group size, either: those two
  facts are per-course keys now, because the kata page states the developer
  course's own numbers and a shared value put the two strips one click apart in
  contradiction. Agentic automatisatie was dropped as a service
  of its own — it is part of what the staffing track does inside a project. All
  four article rows link too, through `insightPath()`. See "Deviations from the
  design doc" in the `smartagents-design` README.
- **`NAV_ITEMS` is not what the bar prints.** `BAR_ITEMS` in
  `src/layouts/base.mjs` is: home, the four services and the team page.
  Inzichten is in `NAV_ITEMS` for the phone sheet alone, because with four
  service names in the row there is no width left for a section that is read on
  the way down the homepage anyway, and Contact is in neither — the button two items along goes
  to the same anchor, in the bar and in the sheet. The difference is emitted
  rather than hidden in CSS: a nav link that is `display: none` at every width
  ships in every one of the site's HTML files, is out of the accessibility tree
  too, and puts what the bar contains in a stylesheet instead of beside the
  list.
- **A service has two names, and the nav prints the shorter one.**
  `service.<key>.nav` is what `navLabel()` reads for the bar and the sheet;
  `service.<key>.title` is what the homepage row and the page's own hero print.
  It used to be one name in all three places, on the rule that a service named
  twice is a service that will one day be named two different things — and that
  rule held while the offer was four items. It stopped holding at six. Measured
  at 1181px, the narrowest width the bar is printed at, four full service names
  are 706px of a row with 533px to give: the primary action hung 53px past the
  window edge in French, 14px in Dutch, and `.shell` is `overflow: clip`, so it
  was cut rather than scrolled to and nothing said so. The full names only fit
  again from about 1480px up, which would have meant folding the nav to a
  disclosure on every 1280 and 1366 laptop. The short names are 502px and the
  row clears at 1181px in all three languages with 15px to spare. So the drift
  the old rule guarded against is bought deliberately and in one place, under
  one constraint: **the short name is always the long name's opening words**
  ("AI staffing en coaching" → "AI staffing"), the two sit on adjacent lines in
  `src/i18n`, and the hero of the page the link opens states the full name
  within a screen of the click. A short name that is not the long one's head is
  a second name, and then the two really can say different things. Home is
  first in the bar and is not redundant with the wordmark beside it: the
  wordmark is unlabelled, is outside the nav landmark, and never takes the
  `aria-current` the other items take. The measurement lives in `.site-nav` in
  `critical.css`; re-measure it whenever a nav name changes.
- A URL that matches no page gets a real 404 now: `render.mjs` copies the
  default language's rendered `/nl/404/` to `dist/404.html`, and Cloudflare
  serves that with the status code. It used to fall back to `index.html` with a
  200, and `src/sw.js` still checks the `Content-Type` before it caches anything
  (`isCacheable`) — a cache-first worker that stores a 200 stores the homepage
  under a missing asset's URL, and the asset then fails on every later visit
  with no way to reload out of it. Keep that check whatever the host does; the
  page handler applies it too, because a navigation is any top-level request the
  browser makes and a click on one of the course PDFs was landing 200 KB of
  one-pager in the page cache.
  Two things about the page itself. It is **copied rather than rendered twice**:
  it used to be a second `basePage()` call with the same arguments and a second
  minify of the same 13 KB, the one difference being a hard-coded `noindex: true`
  the page module was already producing — two renders of one document can only
  ever agree by accident. And **it is a `.section` with rules of its own**.
  `.error-page` matched nothing in either stylesheet, so the one page a visitor
  reaches only when something has gone wrong printed its heading flush against
  the window's left edge at x=0: the only page on the site that looked broken, on
  the occasion a reader is already least sure the site works. It carries the
  page frame, a standfirst and three places to go, all read off keys the chrome
  already prints. `scripts/start-local.mjs` serves it too — it used to answer a
  missing URL with the two words "Not found" as `text/plain`, so nobody working
  on the site ever saw the real page.
