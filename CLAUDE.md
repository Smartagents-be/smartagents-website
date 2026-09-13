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
- **Deck PDFs**: `npm run export:pdfs <deck-slug>` (needs a current `dist/`). With no
  slug it re-exports all ten and puts nine unreviewed binaries in the diff. It counts
  the pages it wrote against the deck's own slide list and fails the deck when they
  disagree: Chrome exits 0 on a print whose stylesheets never landed, and what it
  writes then is the slide markup reflowed as an unstyled A4 document. One of those
  was committed over a good export and nothing said a word. On that failure, re-run.
- **Course fiches**: `npm run export:fiches` rebuilds the two one-pagers in
  `public/media/` from `scripts/export-training-fiches.mjs` in headless Chrome
  (needs Chrome, or `CHROME_BIN`). Not part of the build, for the reason
  `check:slides` is not. The copy is the fiche's own; every fact a fiche shares
  with the site is read from `src/i18n/nl.json`, so the strip on the training
  page and the download one click away cannot disagree. Run it and commit both
  PDFs whenever one of those keys changes.
  Four facts sit in each strip and the kata page is the only page that words
  three of them, so both fiches read `kata.spec.duration.value` and
  `kata.spec.language.value`, the agentic one reads `kata.spec.group.value` and
  `kata.spec.location.value`, and the business one reads
  `training.course.business.group`. Its location is the single fact here the
  site states nowhere and it stays editorial copy in the script, worded like
  the kata's. It used to read `training.course.business.format`, a key deleted
  when the format row came off the facts strip, and since the script throws on a
  missing key that one line meant neither PDF could be regenerated at all.

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
  failing the build. The site key's fallback is the real key the pre-redesign
  site shipped with, not an empty string: it was empty for a while, nothing set
  the variable on Pages, and every contact form on the site fell back to
  `mailto:` without once reaching `/api/contact` or n8n.
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
- **Pages are functions.** A page module exports `{ id, slugs, render(ctx) }` and
  returns markup from the `html` tag. Never hard-code visible text: use `t()`.
  **`meta(t)` is optional and usually absent**: `pageMeta()` in
  `build/render.mjs` defaults the title and the description to `<id>.title` and
  `<id>.description`, so the convention that a page's strings are keyed on its
  own name is a rule rather than a habit and a missing key fails the build like
  any other. A page keeps a `meta()` only for what it has to add — the team
  page's `preloadImage`, the notice's `lastmod`, an article's computed title —
  and anything it returns wins. A page whose strings are keyed on something
  other than its id says so with `strings`: the kata page's id is
  `training-kata` because the nav marks a service while the reader is under it,
  and its copy is `kata.*`. The same defaulting is in `contactSection()`, which
  reads `<prefix>.cta.title` and `<prefix>.cta.body` unless the page passes
  something else — the homepage and the training page pass `contact.lede`,
  because neither has a closing line of its own.
- **A detail page's hero is 440px, and the number is the page's own rhythm.**
  `--section-rhythm` of paper, the copy, and `--section-rhythm` again is 398px
  at 1280 for a two-line headline and two buttons; 440 is that with 42px of
  slack, and it is a floor rather than a height — the kata hero carries an
  eyebrow too and stands at 458. It was 540, which put the foot of every detail
  hero at y=594 on a 1280x800 laptop and the first section heading at 696, so
  the whole first fold was a headline, two buttons and a navy shape. Every
  silhouette struck as a share of the hero is drawn 19% shorter with it; the one
  that is not a share — the jobs page's pendant, which is struck in `vw` against
  a fixed band — has its four numbers scaled by the same 440/540 so it keeps its
  aspect and its place. The training bead's gap to the petal was re-measured
  after the change and is recorded in `main.css`, in the `motion-fields` skill
  and in the design README. The homepage's own hero is untouched.
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
  `src/layouts/base.mjs` is read by the header row and by the phone sheet, so
  the action is the same at every width. On the ten pages with a contact
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
- **Nothing animates a box it does not paint, and nothing ticks with nothing on
  screen.** Each orbit ring's travelling node used to be carried round by
  rotating a box the size of its ring — up to 1690px square — which handed the
  compositor four large layers per page for four dots: measured with CDP's
  `LayerTree` on the training page, two 1360x1360 and two 1060x1060 layers, none
  of which painted anything but a 5px dot. The thing that rotates is 0x0 now and
  stands on the diagram's origin, with the node hung out at the ring's radius
  plus half its own width; the cost is that the radius is written twice per ring
  and a ring that moves has to move in both places. `<sa-node-field>` stops its
  clock rather than skipping the work: in a hidden tab (`visibilitychange`, not
  `document.hidden` read inside the timer), under `prefers-reduced-motion`, and
  when no window is on screen. Be honest about the last one — the header's wedge
  is a window and the header is sticky, so on every page of the public site
  there is one on screen at all times. Measured, the whole field is about 28ms
  of script in four idle seconds; the animation that was actually expensive here
  was the rings.
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
- **"Waarom investeren in AI-training?" is gone, and the two lines worth keeping
  are the lede under "Ons aanbod".** It was five rows — Snellere adoptie, Hogere
  productiviteit, Minder risico, Kostenbewust, Minder afhankelijk van externen —
  between the hero and the offer, so a reader who had come to see the courses
  read a page of reasons to want training first. Three of the five say what any
  training company's benefits list says, in the shape a reader now recognises as
  generated. The two that were ours are kept as one sentence: the token argument
  (the lightest model that can do the job, which is also what
  `training.course.agentic.learn.3` teaches) and the independence it buys. The
  test they pass and the other three fail is whether a competitor's page could
  print the same line.
- **An open staffing track is one column, and "Past wanneer" ends it.** The row
  was two columns for a while, the copy beside the fit line; side by side they
  read as a column of prose with a sidebar against it, where that line is the
  end of the answer rather than a note on it. It sits under the paragraphs now,
  set apart by a rule across its top. The heading was "Wat we doen", which is
  the homepage's own section heading; it is "Hoe we meewerken" now, and the
  hero's second button names the same thing.
- **Prose that stands alone across a full-width block runs to 80ch, where a
  lede held short beside something takes 44.** That is the section lede on five
  pages, the kata page's practice paragraph, the track panel's copy and the
  jobs panel's. It is long by the usual measure — about a hundred characters,
  short of the 100ch the privacy notice runs at — and it is the answer to a
  paragraph that reads as a stub with two thirds of its band left bare. The two
  numbers `.story` and `.article-lede` take (62ch) are the article layout's,
  where a rail takes the other half of the page.
- **The training facts strip states three facts, and neither price nor format
  is one of them.** Format was "In-house of remote" against the kata spec
  strip's "Bij u op kantoor" one click away — the same fact in two wordings on
  one path, which is the contradiction the per-course values exist to prevent —
  so it is not a row on either course and `training.facts.format.label` is gone
  with it. `FACTS` in `src/pages/training.mjs` is now the whole list for both
  courses, and the two strips are the same height again.
  Price is the same argument from the other side: "Op maat, na een korte
  intake" is a row that answers nothing, at a fifth of the strip's height. A
  range would be worth printing and nothing in this repo or on the site knows
  one, so the CTA under the strip is what asks. Put the row back the day there
  is a figure behind it.
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
  read off the file at build time in `training.mjs`. Both PDFs are generated
  by `npm run export:fiches` rather than exported by hand. The awareness and
  management fiches that were left over from the learning path "Ons aanbod"
  replaced are deleted: nothing linked them and Google would have indexed them
  as orphan PDFs competing with `/training/`. A file authored inside a deck and shown
  on a public page too (today: the kata tour video) is never duplicated: it stays
  in the deck folder and `PROMO_MEDIA` in `build/render.mjs` copies it into the
  same `/media/`. `/secured/` is gated, so a public page can never link into it.
  `_headers` gives `/media/*` its own cache policy — and, since the security
  headers went in, `/*` carries `Strict-Transport-Security` (a year, this
  hostname, no `includeSubDomains` or `preload` until somebody has checked every
  name under smartagents.be) and a `Content-Security-Policy-Report-Only` that
  reports and blocks nothing. It becomes `Content-Security-Policy` when a week
  of real traffic has named nothing; there is no `report-uri`, because a
  reporting endpoint is a third-party request on a site whose policy is not to
  make any, so the console is the destination. `/secured/*` has a policy of its
  own allowing inline scripts, because the gated documents were authored as
  standalone HTML and still carry them — one global rule would fill the console
  with reports about the one area that is not public. The gated area is also
  `private, no-store`, in `_headers` and again in the Function, which builds a
  redirect that never passes through that file. **Nothing prefetches it**:
  the two course one-pagers are about 200 KB each and the training page links
  both, so a reader running an eye down the offer used to pull half a megabyte of
  PDF nobody asked for. The exclusion is in the speculation rules in `base.mjs`
  and in the hover fallback in `src/app.js`, which also skips a metered
  connection — a prefetch is for a page the reader is about to navigate to, and a
  file the browser hands to a download bar is not that.
- **A page carries only the silhouettes it draws.** `clipDefs()` emitted all
  twenty-two on every page — 7.4 KB of path data in the `<body>` of the privacy
  notice and the four articles, which draw no dark shape at all. The body is
  rendered before the shell wraps it, so it is simply asked: every
  `data-clip="X"` it names, plus the handful a stylesheet reaches for on the
  page's behalf (`heroSwoop` below 620px, `dnaFieldMask` for the helix), which
  is the `CLIP_ALSO` map in `base.mjs`. A page with no dark shape prints no
  `<svg>` at all. What makes it safe is the check in `check-dist.mjs`, which
  reads the `clip-path: url(#id)` rules out of the CSS rather than restating
  them: a missing definition does not warn, it draws the shape as its bounding
  box, and only at the viewport width that asks for it.
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
  **The type scale is in rem and the px value is in a comment beside it.** In px
  it ignored the browser's own default text size and Firefox's and Safari's
  "zoom text only" entirely — the root went to 24px and nothing on the page
  moved. Every step divides into 16 exactly, so the default root renders
  byte-identically to what it did. Four sizes stay in px on purpose and each
  says why where it is written: the header's nav row and the brand beside it,
  which are measured to the pixel at 1181px against a row that clips, and the
  phone's form controls, where 16px is the number iOS Safari watches. Spacing
  stays in px. Two new tokens are there for the opposite reason to the fourteen
  that came out — `--scroll-clearance` (96px) and `--header-phone` (56px) each
  had readers in two different stylesheets, and a number that has to match
  across files is what a token is for.
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
  **What a `<details>` cannot be on its own is modal, and on a phone the nav
  sheet is.** `src/app.js` puts `inert` on the skip link, `main` and the footer
  while the sheet is open, stops the document scrolling
  through `.has-sheet`, and closes on Escape or a pointerdown outside — so the
  page behind the sheet is out of the tab order and off the accessibility tree
  instead of being a list of links nobody can see. `inert` is the whole of it;
  there is no focus trap. The trigger's two bars turn into a × in CSS on
  `[open]`, because the one control on screen used to say "open the menu" while
  the menu was open. Above the phone the same panel is a dropdown and none of
  this applies except the outside click, which a menu left standing open behind
  the page needed anyway.
- **Every media query is range syntax, and that is what closed the fractional
  cracks.** `(width < 621px)` and `(width >= 621px)` partition the axis;
  `max-width: 620px` paired with `min-width: 621px` matched neither at 620.5,
  which is an ordinary width under browser zoom. Everywhere on the site that
  crack cost a layout seam nobody saw; on the training bead and the jobs drifts
  it printed a dark shape with the magnets off, which is why those two queries
  carried a hand-written `1080.98px` patch. The patches are gone. Converting a
  pair is mechanical — `max-width: N` becomes `width < N+1`, `min-width: M`
  becomes `width >= M` — and it puts the site's floor at Safari 16.4, which is
  a few months later than the 16.2 `color-mix()` already asks for.
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
  **The form is upgraded whether or not a site key is configured**, and only the
  token step is gated on one: it used to return before upgrading, so a build
  with no `TURNSTILE_SITE_KEY` fell all the way back to the browser's own
  validation — one field at a time, in a bubble, in the browser's language over
  Dutch copy. Two more things the component now gets right. The submit is
  stopped **synchronously**, always, and the `mailto:` fallback is dispatched by
  hand: the decision used to be taken after `await this.prepare()`, so an Enter
  pressed while Turnstile was still loading opened the mail client *and* posted
  the JSON. And Turnstile's `expired-callback` and `timeout-callback` are wired
  beside `error-callback`, because with those two unwired a stalled challenge
  never settled the promise and the button stayed busy for the life of the page.
  **A same-page action that opens a form puts the cursor in it**: a click on a
  link whose anchor contains a form focuses that form's first control, on the
  next frame and with `preventScroll` — the next frame because following a
  fragment is the click's own default action and it puts the focus on `<body>`
  when the target is not focusable, which a `<section>` never is.
  **A missing `TURNSTILE_SECRET_KEY` is a 500, not a failed captcha.** Unbound,
  the key was posted to Turnstile as the literal string "undefined", Turnstile
  answered `invalid-input-secret`, and the visitor was told their captcha had
  failed — a 403 blaming them for a binding nobody had set.
- **The message field is called `body` on the wire and `message` at the
  endpoint, and the markup says so twice.** `name="body"` is what the `mailto:`
  fallback needs — a mail client reads `subject` and `body` out of the query
  string and drops every other key, so a textarea called `message` handed the
  visitor an empty mail with JS off — and `data-post-as="message"` is what
  `contact-form.js` renames it back to for the JSON post. The rename is declared
  in the rendered HTML rather than written in two files, because
  `scripts/check-contact.mjs` builds its payload from that same markup and reads
  the same attribute.
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
  print carried a solid navy shape, the orbit rings, the sticky header and a
  rail beside a column. The rules are written for every
  page rather than scoped to that one, because nothing in them is
  page-specific: hide what is chrome or texture, unstack what is a share of a
  viewport that no longer exists, and print the href after an off-page link.
- **There is no sticky action bar on a phone.** `#mobile-actions` was a call
  button and the page's own action stuck to the bottom edge, and it covered the
  foot of every phone screen for the life of the visit — including the hero,
  where it printed the same words 490px under the button it was standing in for,
  which is what the `data-hide-until` observer in `src/app.js` existed to work
  around. What a phone has instead is what every other width has: the hero's own
  two buttons, the action inside the menu sheet, and the contact section at the
  foot. The observer, the `.is-deferred` fade, `mobileActions()` and `cta.call`
  are gone with it.
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
  performance budgets from `fast-static-site` §1 — including a
  `criticalCssBytes` budget on the inlined `<style>` block, which is paid for on
  every page view of every page.
  Seven cheap checks were added on top, each one a loop over files it had
  already parsed and each one for a bug that shipped: exactly one `<h1>` per
  page and no skipped heading level; every `aria-labelledby` /
  `aria-describedby` / `aria-controls` and every in-page `href="#id"` resolving
  on that page; the JSON-LD parsing; `og:image` and every `imagesrcset`
  candidate resolving in `dist/`; every `<loc>` in the sitemap resolving; and
  every `clip-path: url(#id)` a page can reach having a `<clipPath>` behind it.
  That last one is what makes the per-page clip defs safe — the rules are read
  out of the CSS rather than restated, so a stylesheet pointing at a shape a
  page does not carry fails the build instead of rendering the shape as its
  bounding box.

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
- **The service worker's three caches are keyed on three different things,
  because they go stale for three different reasons.** `pages-<content>` is a
  hash of every rendered document in `dist/`, computed by `contentVersion()` in
  `render.mjs`: it used to be keyed on the hashed asset names, so a deploy that
  only changed copy, added an article or picked up a vacancy from Odoo produced
  a byte-identical `sw.js`, the browser saw no update, and stale-while-revalidate
  served the *previous* HTML on the first view of every page to every returning
  visitor. A hash of the documents changes exactly when a document does, and an
  unchanged rebuild still produces a byte-identical `sw.js`. `assets` is not
  versioned at all — a hashed URL is its own version — and that is what stops a
  deploy stranding an open tab: with a versioned name, `skipWaiting()` plus the
  cleanup in `activate` deleted the cache under a page that was already open,
  and the first lazy chunk it imported afterwards (`sa-node-field`,
  `sa-accordion`, the contact form) was gone from the cache and from the server
  both. One cache holding a few generations, bounded by `ASSET_LIMIT`, keeps the
  old chunk reachable until it ages out. `images-<version>` stays keyed on the
  assets, because `/media/` is un-hashed and the version is the only thing that
  can invalidate an image that changed under a URL it kept.
