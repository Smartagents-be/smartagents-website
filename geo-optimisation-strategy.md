# GEO optimisation strategy: smartagents.be

- **Date:** 2026-09-13 (first pass)
- **Audit list of this pass:** `geo-audit-violations.md` (ids `GEO-NNN`, status lines, client questions, rejected proposals, scoring)
- **Evidence behind it:** `geo-research.md`, `geo-inventory.md`, `geo-live.md`, the two reviews of the audit list (`geo-critic-round1.md`, `geo-critic-round2.md`) and the four reviews of the implementation (`impl-critic-round1.md` to `impl-critic-round4.md`), all in the session scratchpad of 2026-09-13. They are not committed; everything this file needs from them is restated here.

This is the repeatable playbook for Generative Engine Optimization on smartagents.be: keeping the site crawlable, indexable, correctly understood and citable by Google (AI Overviews, AI Mode), Bing and Copilot, ChatGPT search, Perplexity and Claude. It records every GEO optimisation now in the codebase, the ones that predate the first pass as well as the first pass's own, what is still open outside the repo, what was deliberately not done and why, and the exact commands and traps, so the next pass can be run from this file alone. Checklists come first; the detail sections under them say how to run each step.

---

## 1. Every GEO pass

### (a) Before anything: platform checks (time-critical)

- [ ] Open Cloudflare Security → Settings and record, with a dated screenshot: the legacy "Block AI bots" state, the Search / Agent / Training category actions, the per-crawler actions, Bot Fight Mode, and any WAF rule on `cf.verified_bot_category` or bot score.
- [ ] Confirm Training is **not** blocked at category level (since 2026-09-15 that category carries Googlebot, Bingbot and Applebot), Search and Agent are Allow, and any training block is per crawler.
- [ ] Read Cloudflare's block-ai-bots doc and blog for a new dated default or opt-out window, and act before that date.
- [ ] Record whether managed robots.txt is on, and diff the served `robots.txt` against `dist/robots.txt`.
- [ ] Confirm Email Address Obfuscation is off: the live `mailto:` count on `/nl/` equals `dist/`.
- [ ] Confirm Markdown for Agents is off and no Rocket Loader or Auto Minify markers are in live HTML.
- [ ] Re-curl removed paths for stale edge copies answering 200; purge the cache once if any do.

### (b) Research refresh

- [ ] Re-fetch raw, not through a summariser, the first-party docs listed in "How to run each step", and note every "last updated" date newer than the previous pass.
- [ ] Re-check each platform's crawler table: which user agent cites, which fetches for a user, which trains (OpenAI, Anthropic, Perplexity, Google, Apple, Meta, Common Crawl).
- [ ] Re-check the Google docs this repo leans on: AI features, AI optimization guide, site names, title links, favicon, Organization and video structured data, sitemaps, site move, redirects, canonical, and the Search documentation updates log.
- [ ] Re-check GSC and BWT help pages for new AI reports or controls.
- [ ] Weight every claim by tier (T1, T1b, T2, T3, T4, Observed, Judgement) and apply the rule: T1 says what a platform does, not what moves citations; T2 marks preprints and simulated engines; T4 is never the sole basis for anything above Low.
- [ ] Quote only what a raw fetch shows verbatim; anything else is a paraphrase without quote marks.

### (c) Audit

- [ ] `npm run build` on a clean tree, then inventory `dist/`: titles, descriptions, one JSON-LD graph per page, robots meta, canonical and hreflang, `sitemap.xml`, `robots.txt`, `llms.txt`, `_redirects`, `_headers`.
- [ ] Measure every title's length in NL, EN and FR.
- [ ] Count net words inside `<main>` per page and note pages with no proof, no author and no source.
- [ ] Live: curl the key pages with each bot user agent; check status and that the body is the page, not a challenge.
- [ ] Live: diff the served `robots.txt` against `dist/robots.txt`.
- [ ] Live: rebuild the old-site URL list from git and sweep it, first hop and final status.
- [ ] Live: curl each removed path ten times for stale edges (status, `age`, `cf-ray`, `x-robots-tag`).
- [ ] Live: `smartagents-website.pages.dev` carries `X-Robots-Tag: noindex` and `smartagents.be` does not.
- [ ] Live: PDF headers, `/favicon.ico` status and content type, `http://www` hop count, root redirect status.
- [ ] Off-site: KBO web address, LinkedIn company name, tagline and About, founders' headlines, GBP and Bing Places, Sortlist and Clutch, third-party pages naming the company and what they say, namesakes.
- [ ] Record the audited commit and every difference between live and `dist/` that Cloudflare introduces.

### (d) Write the audit list

- [ ] One item per finding: id, finding with file:line or a capture, why with a quoted source and its tier, fix, and an acceptance check that fails today.
- [ ] Sort by impact (Critical, High, Medium, Low), then size (XS to XL); give each item one or more owners (`code`, `dashboard`, `off-site`, `client-input`, `ops`).
- [ ] Keep ids stable across passes; split with a letter suffix; list merged, rejected and hygiene items separately.
- [ ] Write every client question as the exact sentence to send.
- [ ] Run every acceptance command against today's `dist/` and live, and confirm each one fails today.
- [ ] Score the site with the rubric (§ Scoring).

### (e) Critic rounds on the list

- [ ] Spawn a read-only critic: it re-opens every file:line, re-curls every live claim, re-fetches quoted docs raw, and checks counts, sorting and arithmetic.
- [ ] Apply every verdict, or record the disagreement and have the next round judge it.
- [ ] Repeat until a round returns nothing.

### (f) Implement

- [ ] Split the code items into file-disjoint tracks; one track owns `scripts/check-dist.mjs`; each track edits only the CLAUDE.md bullets that document its own change.
- [ ] Keep client-gated work (wording, dates the page does not print) off `main`, which is production: use a branch and its preview URL.
- [ ] Each track runs `npm run build` (render, `check-dist`, `check-contact`) green before handing over.
- [ ] Write a "Status after this pass" line on each item wherever the implementation differs from the planned fix.

### (g) Harsh critic on the implementation

- [ ] Build HEAD and HEAD plus the patch in two scratch worktrees with `ODOO_OFFLINE=1` and diff the two `dist/` trees: bodies, heads, graphs, `robots.txt`, `llms.txt`, `sitemap.xml`.
- [ ] Run every acceptance check; inject bad input into the scratch copy to prove each new build check fails when it should.
- [ ] Look for side effects of every string or node read in more than one place (a title is also `og:title`, and was `og:image:alt`).
- [ ] Repeat until a round returns nothing; remove the scratch worktrees.

### (h) Deploy checks (on the preview, then on production)

- [ ] Slashless old URLs answer one 301 to their target; Cloudflare does not document trailing-slash matching.
- [ ] The old-URL sweep ends in 404 only for the URLs with no successor.
- [ ] Both course PDFs carry their `Link: <…>; rel="canonical"` header.
- [ ] `smartagents-website.pages.dev` answers with `X-Robots-Tag: noindex`; `smartagents.be` answers without one.
- [ ] `/favicon.ico` answers 200 with an image content type, not a 302 and not HTML.
- [ ] The served `robots.txt` states the one training policy the client chose (GEO-004).
- [ ] Served JSON-LD is byte-identical to `dist/` (no edge rewriting).
- [ ] GSC URL Inspection live test on every changed page, then request indexing.

### (i) Measurement

- [ ] GSC: Search generative AI control reads Include; generative AI report impressions (no clicks exist); Crawl stats host status and 404 share; the Not found (404) export.
- [ ] BWT: AI Performance citations, cited pages and grounding queries; sitemap processed; crawl data.
- [ ] Cloudflare AI Crawl Control metrics per bot, if the plan has them: requests, 2xx/3xx/404 split, blocked counts, top 404 paths.
- [ ] Prompt panel: 15 prompts (5 per language) × 5 runs × 4 engines, logged out, from Belgium, recording UI language, date and model; mention rate, own-domain citation rate, third-party citation rate and factual accuracy, each with a 95% Wilson interval.
- [ ] Lead self-attribution from intake notes or the form, and the earned-mention log (URL, date, anchor text).
- [ ] Score and compare with the previous pass: ranges with confidence classes, never one number.

### (j) Update this file

- [ ] Tick, move or add items in sections 2 to 4; add new commands and lessons; set the date at the top.

---

## 2. Done in code (state as of 2026-09-13)

Items under **This pass** are in the working tree of `main`, uncommitted and not deployed. Two carry **pending client review** and must not reach production before the client replies.

**Predates the first pass**

- [x] All copy, `<details>` content and diagram labels in the initial HTML; web components are light-DOM upgrades (`build/render.mjs`, `src/pages/`).
- [x] `robots.txt` generated, naming 15 AI crawlers explicitly, allowing all and disallowing only `/secured/` (`robotsTxt()`, `AI_CRAWLERS`, `build/render.mjs`).
- [x] `llms.txt` generated from the same page modules and strings (`renderLlmsTxt()`, `build/render.mjs`).
- [x] `sitemap.xml` with hreflang alternates, and `lastmod` only where a page prints a date: four articles and the privacy notice, 15 of 42 URLs (`renderSitemap()`, `meta.lastmod`, `build/render.mjs`).
- [x] Self-canonical, reciprocal hreflang and `x-default` on every page (`src/layouts/base.mjs`), enforced by `scripts/check-dist.mjs`.
- [x] `index, follow` on public pages, `noindex` on the 404 and `/secured/`, no snippet restrictions (`base.mjs`), enforced by `check-dist.mjs`.
- [x] `/secured/` noindexed by `_headers` and disallowed in `robots.txt` (`public/_headers`, `render.mjs`).
- [x] A real 404 status for unmatched URLs: `dist/404.html` copied from `/nl/404/` (`build/render.mjs`).
- [x] One JSON-LD graph per page: Organization and WebSite everywhere, a Service per service page, the kata Course, BlogPosting with dates equal to the visible `<time>`, Blog, Person, BreadcrumbList (`src/layouts/schema.mjs`, each page's `schema()`).
- [x] Legal name, address, enterprise number and phone printed in the footer and matched in the graph (`src/i18n/*.json` `footer.*`, `schema.mjs`).
- [x] Default 1200x630 share card and the 512px logo `Organization.logo` points at, generated from tokens (`scripts/make-social-images.mjs`, `public/media/`).
- [x] Head metadata: a unique `<title>` and meta description per page within each language, the `og:*` tags, `twitter:card`, and on articles `og:type=article` with `article:published_time` (`src/layouts/base.mjs`).
- [x] One named outbound first-party source with a working link (`PLAYBOOK_URL`, `src/pages/sdlc.mjs`).
- [x] No analytics and no third-party requests on public pages (CLAUDE.md "No third-party requests").
- [x] Build gatekeeping: missing i18n keys, broken internal links, missing alt text, one `<h1>` and no skipped heading level, JSON-LD parses, `og:image` and sitemap `<loc>` resolve, routing-table coverage, performance budgets (`scripts/check-dist.mjs`).

**This pass**

- [x] Permanent redirects for the old Eleventy site: 128 in its block, 131 authored static 301s in the file with `/contact`, `/contact/` and `/pitch` (counted from `public/_redirects` on 2026-09-13; recount rather than copy). Every old page and `/assets/` file with a real successor, each page with and without its trailing slash (PDFs, the kata video and poster, two portraits, four post images, the brand card, the logo); every old item with no successor stays 404 and is named in the comment (`public/_redirects`, GEO-003). **The M365 Copilot page and one-pager go to the training page (the PDF to `/nl/training/`): pending client confirmation.**
- [x] Build check on the shipped routing table, `dist/_redirects`: every rule in the shipped table with one fixed destination resolves in `dist/`; a `#fragment` on an `.html` target names an existing `\sid="…"` (a fragment on anything else, such as `.pdf#page=2`, is allowed); a malformed fragment is reported rather than crashing the check; a directory target has its trailing slash; a static source is never a file in `dist/`, `/` excepted in `HIDDEN_ON_PURPOSE` (`scripts/check-dist.mjs` §5b, GEO-003).
- [x] `X-Robots-Tag: noindex` on `https://:project.pages.dev/*` and `https://:version.:project.pages.dev/*` (`public/_headers`, GEO-042).
- [x] `Link: rel="canonical"` headers on both course one-pagers, pointing at the Dutch page each belongs to (`public/_headers`, GEO-026).
- [x] `favicon.ico` (16, 32 and 48px PNG frames, 24-bit) and `favicon-96.png`, generated and committed; linked in the head; required by the build; cached like `favicon.svg`; `.ico` served as `image/x-icon` locally (`scripts/make-social-images.mjs`, `src/layouts/base.mjs`, `scripts/check-dist.mjs`, `public/_headers`, `scripts/start-local.mjs`, GEO-025).
- [x] Eight descriptive titles built only from copy the site prints, 65 characters or fewer in all three languages: `home`, `training`, `staffing`, `sdlc`, `processes`, `team`, `jobs`, `insights.index` (`src/i18n/{nl,en,fr}.json`, GEO-007a). The homepage titles name all four services and the brand; Belgium did not fit. **All eight: pending client review, do not deploy before.**
- [x] The default card's `og:image:alt` describes the card (wordmark and `hero.claim`), not the page title (`ogImageAlt()`, `src/layouts/schema.mjs`; `base.mjs`).
- [x] `WebSite.alternateName: ['smartagents.be']` as the site-name fallback (`websiteNode()`, `schema.mjs`, GEO-043).
- [x] `Organization.iso6523Code` `0208:<number>` and the KBO public-search URL in `sameAs`, the number read off `footer.vat`; the build throws if that label stops reading as one ten-digit number (`organisationNode()`, `schema.mjs`, GEO-013a).
- [x] `Service` no longer claims the page language as the delivery language: no `inLanguage` (`serviceNode()`, `schema.mjs`, GEO-024).
- [x] A `Course` for "AI voor business teams" with only the facts the training page prints (name, body, `learn.1-4`, audience, group 5-20), and the training `Service` listing both courses by `@id` under `hasOfferCatalog` (`courseNode()`, `schema.mjs`; `src/pages/training.mjs`, GEO-032).
- [x] `public/CNAME` deleted (hygiene, GEO-029).
- [x] CLAUDE.md bullets updated: routing table, titles and `og:image:alt`, the graph, the raster brand images, `/media/` headers.

---

## 3. Open: owner outside the repo

**TIME-CRITICAL**

- [ ] **GEO-001** (dashboard): opt out of Cloudflare's mixed-purpose change **before 2026-09-15**, record the bot settings with screenshots, and start a monthly crawler-log baseline. If this was not done in time, check at once that Googlebot and Bingbot are not blocked (GSC Crawl stats, BWT live URL test).

**Before deploying this pass**

- [ ] **GEO-007a** (client-input): client approves the eight titles and makes two choices: the brand or "in België" in the homepage title, and an engineer-first or a coaching-first staffing title. Until then ship from a branch without them.
- [ ] **GEO-003** (client-input): is the M365 Copilot page and one-pager → `/training/` acceptable; do `/aanpak/`, the four method pages, `/customerzone/` and the two old videos have a successor.

**Dashboard**

- [ ] **GEO-005**: GSC Domain property via DNS TXT; submit the sitemap; confirm the AI control reads Include; request indexing for 11 URLs; export the 404 list after GEO-003 is live. BWT: import, sitemap, same URLs, AI Performance baseline.
- [ ] **GEO-002**: Purge Everything once; re-run the stale-edge check on 2026-09-20; ticket with `cf-ray` ids if 200s persist.
- [ ] **GEO-004**: after the client's training decision, turn managed robots.txt off (Option A) or keep it and remove the eight overlapping bots from `AI_CRAWLERS` (Option B, a code change).
- [ ] **GEO-010**: Email Address Obfuscation off.
- [ ] **GEO-011**: one Redirect Rule `http*://www.smartagents.be/*` → `https://smartagents.be/${1}` 301; the root stays 302 unless the client wants `/nl/` as the homepage.

**Off-site**

- [ ] **GEO-006**: KBO web address via My Enterprise; LinkedIn display name "SmartAgents", About and website; founders' headlines; confirm no profile still lists Kortessem.
- [ ] **GEO-017**: ask ClickForest and made-in.be to update their descriptions; check Trendstop.
- [ ] **GEO-018**: Google Business Profile and Bing Places, if the client confirms eligibility; NAP identical to the footer.
- [ ] **GEO-022**: Sortlist and Clutch profiles; add each live profile to `Organization.sameAs`.
- [ ] **GEO-009**: start the earned-mention log; pursue the Aviso+ recap and trade press.
- [ ] **GEO-021** (ops): run the baseline prompt panel once GEO-003 and GEO-005 are live, then quarterly.
- [ ] **GEO-039** (later, optional): Wikidata, only after two independent references exist, preferably by an independent editor.

**Client input, then code**

- [ ] **GEO-008**: named cases or attributable outcomes; never revive "Claes Logistics" without confirmation.
- [ ] **GEO-015**: who wrote each article; then a byline and a Person author.
- [ ] **GEO-014b**, with **GEO-014a** folded in: the founders' track record and role as visible copy on the team page. `Person.jobTitle` ships only with that line; today only the portrait alt text says "founder".
- [ ] **GEO-013b**: may the page print the founding date (2026-04-21) and the working languages; then `foundingDate` and `availableLanguage`.
- [ ] **GEO-020**: one- or two-sentence definitions of AI-native SDLC, agentic engineering and kata.
- [ ] **GEO-023**: a sustainable article cadence and first-hand topics.
- [ ] **GEO-033**: sources for article claims; subheadings in the launch piece.
- [ ] **GEO-034**: in-body contextual links (kata ↔ SDLC, articles → services and team).
- [ ] **GEO-037**: "how did you find us" in intake or as an optional form field.
- [ ] **GEO-007b**: keep the homepage H1 slogan, shared with Syntra AB and Smart Lions, or not.
- [ ] **GEO-030**: Claude Partner Network membership and directory URL.
- [ ] **GEO-040**: is SmartSpace still offered; a first-mention qualifier or a dated note.
- [ ] **GEO-041a**: may the graph state `uploadDate` 2026-08-02 for the kata video; otherwise close.
- [ ] **GEO-041b**: does the video have narration; captions, transcript and a YouTube copy if so.

---

## 4. Deferred / rejected

**Deferred (kept, with the reason)**

- [ ] **GEO-031** per-language 404 files: as planned it fails `check-dist` (links to `/xx/404/`, `isNotFound`) and spans four files, for a Low item.
- [ ] **GEO-019** honest `lastmod` for the other 27 URLs, and `dateModified` (merges GEO-028): a failing hash check breaks the `npm run dev` save loop, a warning lets dates rot and risks the 15 honest ones; design kept in the audit list.
- [ ] **GEO-016** IndexNow on deploy: needs a Pages deploy webhook and GEO-019's changed-URL source; Google does not take part; 42 URLs.
- [ ] **GEO-041a** `VideoObject`: Google requires `uploadDate`, which no page prints; gated on the client.
- [ ] **GEO-041b** captions and transcript: depends on whether the video has narration.
- [ ] **GEO-011** root 302 → 301: a trade-off (site names are root-only), pending the client.
- [ ] **GEO-036** (hygiene) 1200px article share images and `max-image-preview:large`: social previews, not GEO.
- [ ] **GEO-041c** (hygiene) the kata poster names a language: re-render when the deck asset is next touched.

**Rejected (with the reason)**

- [ ] More `llms.txt` work (EN/FR files, `llms-full.txt`, Markdown mirrors, a `Link` header): no engine documents reading it; Google "will neither harm nor help"; 97% of files get no traffic (Ahrefs). Keep the existing file, do not score it.
- [ ] FAQ block or `FAQPage`: FAQ rich results ended 2026-05-07, and the site removed the block on purpose.
- [ ] "AI schema" (`speakable`, `articleBody`, `wordCount`, properties with no visible text): Google says no special markup is needed; Ahrefs' matched test found no uplift.
- [ ] `Course.offers`, `instructor`, `courseMode` the page does not print: Course Info rich result retired, and the graph says only what the page says.
- [ ] AI-specific content rewrites for "+40% visibility": a simulated GPT-3.5 engine; C-SEO Bench found rewrites largely ineffective.
- [ ] Answer-engine chunking: Google says there is no requirement.
- [ ] Blocking Google-Extended or GPTBot to leave AI Overviews or ChatGPT search: wrong levers; the search agents are separate user agents.
- [ ] Build-clock or git-date `lastmod`, bumping article dates: Google needs verifiably accurate dates.
- [ ] AI rank-position tracking and vendor "GEO scores": not reproducible; only rates over repeated runs are defensible.
- [ ] Analytics, including GA4's AI Assistant channel: excluded by policy, and the channel omits Perplexity and Claude.
- [ ] Catch-all `/*` 302 → 301: browsers would cache it for `/favicon.ico` and any future root file.
- [ ] `ProfessionalService` / `LocalBusiness`: implies a place customers visit and opening hours the site does not state.
- [ ] Region hreflang (`nl-BE`, `fr-BE`), `x-default` in the sitemap, treating identical NL/EN titles as duplicates: one version per language already, and "Training", "Team", "Jobs" are correct Dutch.
- [ ] Cloudflare Markdown for Agents: Pro plan and up, adds `ai-train=yes` by default, no citation evidence.
- [ ] Content-Signal or managed robots.txt as protection: Cloudflare says signals "express preferences; they are not technical countermeasures".
- [ ] Seeding or buying mentions; a Wikipedia article: inauthentic mentions do not help; notability is unrealistic.
- [ ] `JobPosting` on the jobs page: the repo's stated reason, the page prints no `datePosted` or `validThrough` and Odoo publishes each posting.
- [ ] Moving the `→` cue out of row headings (GEO-027), the "Past wanneer" line into the staffing `<summary>` (GEO-035), an Atom feed (GEO-038): contradict CLAUDE.md or add nothing a 42-URL sitemap does not.
- [ ] `max-snippet:-1`, `max-video-preview:-1` (R8): they restate Google's defaults. (`max-image-preview:large` is a separate, deferred hygiene item, GEO-036; the site does not carry it today.)
- [ ] `twitter:title`, `twitter:description`, `twitter:image` (R9): X falls back to the complete `og:*` set.
- [ ] `og:locale` `en_US` → a Belgian English locale (R10): read by social previews only.
- [ ] `telephone` reformatted to E.164 (R23): schema.org `telephone` is text, and the value matches the visible footer.
- [ ] Image or video sitemaps (R24): few images, all in page HTML with alt text; the one video is handled on the page (GEO-041a).
- [ ] Reviving "Case: Claes Logistics bespaart 200 uur per maand": deleted from the old site within days and unconfirmed.

---

## 5. How to run each step

Every `dist/*.html` is minified to one line. Count with `grep -o … | wc -l`, never `grep -c` (it counts lines, so it answers 0 or 1), and slice `<main>` in Node rather than with a `sed` range (which prints the whole document). Run local commands from the repo root after `npm run build`.

### (a) Platform

The dashboard settings cannot be seen from outside; what can:

```sh
diff <(curl -s https://smartagents.be/robots.txt) dist/robots.txt                        # any output is Cloudflare's
curl -s https://smartagents.be/robots.txt | grep -o 'Cloudflare Managed' | wc -l         # 0 when managed robots.txt is off (2 on 2026-09-13)
curl -s https://smartagents.be/robots.txt | grep -o '^User-agent: GPTBot' | wc -l        # 1 when there is one policy (2 on 2026-09-13)
[ "$(curl -s https://smartagents.be/nl/ | grep -o 'mailto:info@smartagents.be' | wc -l)" -eq "$(grep -o 'mailto:info@smartagents.be' dist/nl/index.html | wc -l)" ] && echo SAME
curl -s https://smartagents.be/nl/ | grep -o 'email-decode\|rocket-loader\|cdn-cgi/scripts' | wc -l   # 0
for u in /fr/services/ /en/services/agentic-ai/ /fr/team/; do for i in $(seq 1 10); do
  curl -s -o /dev/null -D - "https://smartagents.be$u" | awk -v u="$u" 'tolower($1)=="age:"{a=$2} tolower($1)=="cf-ray:"{r=$2} /^HTTP/{s=$2} END{print u, s, "age="a, r}'
done; done | awk '$2=="200"' | wc -l                                                     # stale edge copies; want 0
```

Replace the stale-edge paths with whatever the old-URL sweep finds removed.

### (b) Research refresh

Re-fetch raw (`curl`, or the doc's `index.md` on Cloudflare) and check the "last updated" line:

- **Google:** `developers.google.com/search/docs/` → `appearance/ai-features`, `fundamentals/ai-optimization-guide`, `crawling-indexing/google-common-crawlers`, `crawling-indexing/robots/robots_txt`, `crawling-indexing/robots-meta-tag`, `appearance/site-names`, `appearance/title-link`, `appearance/favicon-in-search`, `appearance/structured-data/organization`, `appearance/structured-data/video`, `crawling-indexing/sitemaps/build-sitemap`, `crawling-indexing/site-move-with-url-changes`, `fundamentals/creating-helpful-content`, and `/search/updates`. GSC help 16984139 (AI report) and 16908024 (AI control).
- **Bing / Microsoft:** the AI Performance post (blogs.bing.com, February 2026), Microsoft's "Optimizing your content for inclusion in AI search answers", the July 2025 sitemaps post, indexnow.org/documentation.
- **OpenAI** developers.openai.com/api/docs/bots · **Anthropic** support.claude.com/en/articles/8896518 · **Perplexity** docs.perplexity.ai/guides/bots · **Apple** support.apple.com/en-us/119829.
- **Cloudflare:** `bots/additional-configurations/block-ai-bots/`, `…/managed-robots-txt/`, `pages/configuration/headers/`, `pages/configuration/redirects/`, `pages/configuration/serving-pages/`, `waf/tools/scrape-shield/email-address-obfuscation/`, `fundamentals/reference/markdown-for-agents`, `ai-crawl-control/`, and blog.cloudflare.com for dated AI-crawler changes.

**Evidence tiers.** T1 first-party doc or blog: authoritative on what a platform does, weak on what moves citations. T1b a named employee outside a doc. T2 research, peer-reviewed above preprint, engines often simulated. T3 industry study, large N, mostly correlational. T4 opinion, never the sole basis above Low. Observed proves a fault exists, not what it costs. Judgement has no external source. The weighted practices and the full source list of the first pass are in `geo-research.md` (§b practices 1-20, §c myths, §d rubric).

**Impact.** Critical: observed or scheduled loss of crawl, index or citation eligibility. High: a material effect backed by T1 or observation. Medium: plausible and moderate, or strong but only T2/T3, or a prerequisite for measurement. Low: small or speculative. Hygiene: not GEO, listed apart.

### (c) Audit

**Titles over 65 characters** (entities decoded):

```sh
node <<'EOF'
const fs = require('fs'), p = require('path');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(p.join(d, e.name)) : e.name === 'index.html' ? [p.join(d, e.name)] : []);
const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
for (const f of walk('dist').filter((f) => !f.startsWith('dist/secured'))) {
  const t = decode((fs.readFileSync(f, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  if ([...t].length > 65) console.log([...t].length, f, t);
}
EOF
```

On 2026-09-13 it prints two titles outside this pass: the French kata page (70) and the French SmartSpace article (69).

**The graph on every page** (a parse error throws):

```sh
node <<'EOF'
const fs = require('fs'), p = require('path');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(p.join(d, e.name)) : e.name === 'index.html' ? [p.join(d, e.name)] : []);
for (const f of walk('dist').filter((f) => !f.startsWith('dist/secured'))) {
  const blocks = [...fs.readFileSync(f, 'utf8').matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
  console.log(blocks.length, f, blocks.flatMap((b) => JSON.parse(b[1])['@graph'].map((n) => n['@type'])).join(','));
}
EOF
```

One node's properties: `node -e 'const g=JSON.parse(require("fs").readFileSync("dist/nl/index.html","utf8").match(/application\/ld\+json">(.*?)<\/script>/)[1])["@graph"];console.log(g.find(n=>n["@type"]==="Organization"))'`.

**Other local counts:**

```sh
grep -oE '<title>(Training|Team|Jobs|Formation|Équipe|Emplois|AI-native SDLC|SDLC AI-native) · SmartAgents</title>' dist/*/index.html dist/*/*/index.html | wc -l   # bare titles; 0
grep -o '<lastmod>' dist/sitemap.xml | wc -l; grep -o '<loc>' dist/sitemap.xml | wc -l                     # 15 of 42 on 2026-09-13
grep -o 'rel="icon"[^>]*image/png' dist/nl/index.html | wc -l                                             # 1
node -e 'const h=require("fs").readFileSync("dist/nl/team/index.html","utf8");const m=h.slice(h.indexOf("<main"),h.indexOf("</main>")).replace(/<[^>]+>/g," ");console.log(m.split(/\s+/).filter(Boolean).length)'   # net words in <main>
```

**Bot user agents, live.** A 200 here proves only that no user-agent string is blocked: Cloudflare identifies verified bots by IP, so a spoofed agent never meets a verified-bot block. The dashboard and the crawler logs are the real check.

```sh
for ua in Googlebot/2.1 bingbot/2.0 OAI-SearchBot/1.0 ChatGPT-User/1.0 GPTBot/1.1 Claude-SearchBot/1.0 Claude-User/1.0 ClaudeBot/1.0 PerplexityBot/1.0 Perplexity-User/1.0 Applebot/0.1 CCBot/2.0; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -A "Mozilla/5.0 (compatible; $ua)" https://smartagents.be/nl/)
  h1=$(curl -s -A "Mozilla/5.0 (compatible; $ua)" https://smartagents.be/nl/ | grep -o '<h1' | wc -l | tr -d ' ')
  echo "$code h1=$h1 $ua"                                                                  # want 200 h1=1 for each
done
```

**Old-URL sweep.** Rebuild the list from the old site's git tree, never from file names (see Lessons), and follow each URL:

```sh
R='cbd2582^1'
{ git ls-tree -r "$R" --name-only | grep -E '\.njk$' | grep -vE '^(secured|customerzone|404)/' |
    while read f; do git show "${R}:${f}" | sed -n 's/^permalink: *//p' | head -1; done
  for l in "" en/ fr/; do
    for s in smartagents-lancering smartspace-platform wat-werkt-en-wat-niet ontbijtsessie-aviso; do echo "/${l}blog/$s/"; done
    echo "/${l}customerzone/"
  done
  printf '%s\n' /services/training/c-level/ /en/services/training/c-level/
  git ls-tree -r "$R" --name-only | grep '^assets/' | sed 's|^|/|'
} | grep -v '\.xml$' | sort -u |
while read u; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://smartagents.be$u") $(curl -s -o /dev/null -L -w '%{http_code}' "https://smartagents.be$u") $u"
done | awk '{f[$2]++} $2=="404"{print "still 404:", $3} END{for (k in f) print "final", k, f[k]}'
```

Against the local server (`npm run ai`, :8001) swap the host for `http://localhost:8001`. After this pass the only `still 404` lines should be the no-successor URLs named in the `_redirects` comment, plus old `/assets/` files with no successor. Add the four posts deleted in June (`wat-is-een-agent`, `rpa-vs-agents`, `case-claes-logistics`, `copilot-tips`) as known, pre-existing 404s.

**Hosts and files, live:**

```sh
curl -sI https://smartagents-website.pages.dev/nl/ | grep -io '^x-robots-tag: noindex' | wc -l          # 1
curl -sI https://smartagents.be/nl/ | grep -io '^x-robots-tag' | wc -l                                   # 0, always
curl -sIL http://www.smartagents.be/ | grep -o '^HTTP[^ ]* [0-9]*' | wc -l                               # 3 after GEO-011 (4 on 2026-09-13)
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://smartagents.be/favicon.ico              # 200 image/…; was 302 text/plain
curl -s 'https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=1037114694&actionLu=Zoek' | grep -o 'smartagents\.be' | wc -l   # >= 1 after GEO-006
```

### (e) and (g) Critic rounds

A critic is read-only and gets the list or the diff plus this file. For an implementation round:

```sh
git worktree add ../scratch-head HEAD && git worktree add ../scratch-new HEAD
L="$(git rev-parse --git-dir)/geo-new-files"
git ls-files --others --exclude-standard -- public src scripts build functions > "$L"   # new site files only
xargs -r git add -N < "$L"                     # intent-to-add, so the diff carries them (works in zsh and bash)
git diff HEAD --binary | git -C ../scratch-new apply
xargs -r git reset -q -- < "$L" && rm "$L"     # take them back out of the real index; no-op when the list is empty
(cd ../scratch-head && npm ci && ODOO_OFFLINE=1 npm run build) && (cd ../scratch-new && npm ci && ODOO_OFFLINE=1 npm run build)
diff -r ../scratch-head/dist ../scratch-new/dist | head
git worktree remove --force ../scratch-head && git worktree remove --force ../scratch-new
```

The path list keeps nested worktrees under `.claude/` and the untracked audit documents out of the patch. Prove a new check by breaking the scratch copy, never the real `dist/`.

### (f) The build checks that now guard GEO

`npm run build` fails on each of these, so a pass does not have to re-check them by hand:

- a missing i18n key in any language, which includes every title and every graph string;
- `footer.vat` not reading as one ten-digit number (thrown in `schema.mjs`);
- robots meta: `index, follow` on public pages, `noindex` on the 404 and `/secured/`;
- self-canonical, reciprocal hreflang and `x-default`;
- JSON-LD that does not parse; `og:image` or a sitemap `<loc>` that does not resolve;
- a broken internal link, missing alt text, more than one `<h1>` or a skipped heading level;
- a top-level `dist/` entry with no routing rule (the catch-all would swallow it);
- in `dist/_redirects`: a target outside `dist/`; a `#fragment` on an `.html` target with no matching `\sid="…"` (a fragment on a non-HTML target such as `.pdf#page=2` passes); a malformed fragment; a directory target without its trailing slash; a static source that is a file in `dist/` (`/` excepted);
- `favicon.svg`, `favicon.ico` or `favicon-96.png` missing.

### (h) Deploy checks, live

```sh
for u in /services/training /blog/smartspace-platform /fr/team /team /jobs; do
  curl -s -o /dev/null -w "%{http_code} %{redirect_url} $u\n" "https://smartagents.be$u"     # 301 to the target; before the first pass /fr/team answered 404 and the others 302 to /nl/…
done
curl -sI https://smartagents.be/media/SmartAgents_Agentic_Engineering_Onepager.pdf | grep -i '^link:'   # rel="canonical" to the kata page
curl -sI https://smartagents.be/media/SmartAgents_AI_Business_Teams_Onepager.pdf | grep -i '^link:'     # rel="canonical" to /nl/training/
diff <(curl -s https://smartagents.be/nl/ | grep -o '<script type="application/ld+json">[^<]*</script>') \
     <(grep -o '<script type="application/ld+json">[^<]*</script>' dist/nl/index.html)   # no output once the deployed build is this dist/
```

Run the same on the preview URL first; there `X-Robots-Tag: noindex` is expected on every response.

### (i) Measurement

- **GSC:** Settings → Search generative AI (Include); Performance → generative AI report (impressions by page, country, date; no clicks); Settings → Crawl stats (host status, response split); Pages → Not found (404).
- **BWT:** AI Performance (citations, cited pages, grounding queries); Sitemaps; Crawl information; IndexNow once GEO-016 exists.
- **Cloudflare:** AI Crawl Control → Metrics per crawler; availability on this plan was not verified.
- **Prompt panel:** 15 buyer prompts, 5 per language, across unbranded category, problem-shaped, comparison and branded; 5 runs each on ChatGPT with search, Perplexity, Google AI Mode or observed AI Overviews, and Copilot, so 300 runs. Record logged-out state, country, UI language, date and model. For branded answers score factual accuracy: founders, services, Beringen and no Kortessem, languages, no namesake confusion. Also check whether Brave Search shows the current URLs, since Claude's web search is reported to use Brave (secondary source).
- **Outcomes:** intake or form attribution (GEO-037) and the earned-mention log (GEO-009).

---

## 6. Rules that keep GEO honest in this repo

- **The graph says only what the page says.** Every node is read off the `t()` keys the visible page prints. No property from alt text, a comment or a fact the client told us but the page does not state (`foundingDate`, `jobTitle`, `uploadDate` wait for visible copy or explicit approval).
- **`lastmod` only where a page knows its date.** Never the build clock, never git dates; a sitemap that says everything changed every deploy stops being read.
- **Titles are built from visible copy.** Nav names, course and track headings, phrases from the page's own description; 65 characters or fewer in NL, EN and FR, measured; no slogan, no bare label; client reviews wording before it deploys.
- **No invented facts.** No figure, client, case or partnership the client cannot source. A deleted placeholder case is not proof.
- **No analytics and no third-party requests.** Measurement comes from GSC, BWT, Cloudflare, the prompt panel and self-attribution.
- **No language or build-tool names on course pages**, beyond the one place the stack is stated for a team deciding whether it qualifies.
- **No announced counts** in headings or ledes ("Vier stappen"); name the block and let the rows count.
- **No FAQ blocks, no chunking, no AI-specific rewrites.** Write for the reader; a GEO change adds a fact or removes a fault.
- **A redirect goes to a true successor or not at all.** A URL with nothing to succeed it answers 404, because a redirect to the homepage is a soft 404.
- **Search and user agents are never blocked.** A training decision is made per crawler, never by Cloudflare's Training category.
- **A client-gated change stays off `main`.** `main` is production.

---

## 7. Lessons and traps

- **Eleventy strips a leading date from `fileSlug`.** The first sweep tested twelve `/blog/2026-…/` URLs that never existed; derive old URLs from `permalink:` lines and data files in git, not from file names.
- **Old public files are more than the obvious ones.** The first list had eight `/assets/` files and missed portraits, post images, the brand card and the logo; list `git ls-tree` of the old `assets/` and grep old templates for references.
- **Minified HTML breaks line tools.** `grep -c` answers 0 or 1 on a one-line file, and `sed -n '/<main/,/<\/main>/p'` prints the whole page including nav and footer.
- **An acceptance check must fail before the fix.** The first cross-link check passed on day one because the nav already links every page.
- **Alt text is not visible copy for the graph rule.** `Person.jobTitle` was added from the portrait alt ("oprichter van SmartAgents") and removed again; it waits for GEO-014b.
- **In a list-shaped title, check which noun "voor / for / pour" attaches to, in each language separately.** The round-2 French "AI staffing et coaching pour les développeurs et équipes métier" put the staffing under the same "pour" as the coaching; it went through three wordings before "AI engineer staffing, coaching des développeurs et équipes métier".
- **A string read in two places moves both.** The new titles also became the default card's `og:image:alt`, which then described a picture that was not there.
- **Measure titles, don't estimate them.** The first draft had 13 of 24 titles over 65 characters, and the French lost their articles when trimmed.
- **`check-dist` must read `dist/_redirects`, not `public/_redirects`.** The shipped table is what Cloudflare follows; a check on the source misses generated rules and ordering.
- **A redirect check that only resolves paths is not enough.** Fragment ids, directory slashes and sources that shadow a live page all passed the first version; inject bad rules into a scratch copy to find the gaps.
- **Cloudflare's redirects doc never says `/foo/` matches `/foo`.** List both forms explicitly and verify on the preview.
- **Lineage is not identity.** The old M365 one-pager had the same blob hash as a file only at a rename; the file served today is a different document, so its redirect is as open a question as the page's.
- **Cloudflare, 2026-09-15:** any Training block, the legacy "Block AI bots" toggle included, also blocks Googlebot, Bingbot and Applebot. The docs were not ambiguous; an early draft said "most likely nothing is blocked" with no evidence.
- **A spoofed user agent proves nothing about verified-bot blocks.** Cloudflare verifies by IP.
- **Managed robots.txt is prepended, not substituted.** RFC 9309 and Google merge groups so Allow wins a tie; the overlap was eight bots, not nine.
- **Stale edges served old-site pages with 200, but with `X-Robots-Tag: noindex` and the current `_headers`.** The index harm was small and redirects beat assets on Pages; the real cost was old GA and GTM loading for visitors.
- **Chrome on macOS never exits after a headless `--screenshot`.** Spawn it detached, poll for the file, then kill the process group.
- **A running local server predates your change.** The :8001 server still served `.ico` as `application/octet-stream`; restart it before verifying.
- **A plan can fail the build it depends on.** The per-language 404 change would have broken `check-dist` (links to `/xx/404/`, `isNotFound`); read the checks before scheduling work.
- **A committed hash manifest that fails the build would fail every Odoo-triggered deploy.** Anything build-checked must tolerate live Odoo data and env-dependent markup.
- **Required properties decide whether markup is worth shipping.** A `VideoObject` without `uploadDate` is invalid for Google.
- **Re-fetch before quoting.** Two quotes were paraphrases in quote marks (site names, the old `llms.txt`); the Kortessem address was also in the old graph, which the paraphrase missed.
- **An acceptance grep can match its own comment.** The `pages.dev` rule count read 3 because the comment above the rules says `pages.dev`; anchor the pattern.
- **Uncommitted work on `main` is one push from production.**

---

## 8. Scoring

**Rubric** (`geo-research.md` §d): six dimensions, each sub-item scored 0-2 with halves, scaled to the weight.

| Dimension | Weight | Sub-items |
|---|---|---|
| A Crawl and access | 25 | effective robots.txt allows search and user agents; Cloudflare blocks neither Search nor Training-with-Search; one training policy; no snippet restrictions; content in initial HTML; low 404 and redirect rate for bot hits; honest lastmod |
| B Index and first-party AI visibility | 20 | GSC and BWT verified; AI control Include; indexed coverage per language; GSC AI impressions trend; BWT citations and grounding queries; IndexNow |
| C Sampled AI share of voice | 25 | prompt panel rates with 95% intervals |
| D Entity and earned media | 15 | NAP and legal identity consistent; `sameAs` targets resolve; authentic third-party pages; schema valid and matching visible text |
| E Content quality | 10 | first-hand specifics; named authors; honest dates; sourced claims; answers not locked in PDFs, media or collapsed UI; descriptive headings |
| F Outcomes | 5 | self-attributed leads |

Label every sub-score **M** (measured), **S** (sampled), **I** (judgement) or **n/s** (not scorable yet), and give a range from the minimum to the maximum once unknowns resolve. Score production, not `dist/`. Never score `llms.txt` or schema presence, an AI rank position, a single-run screenshot or a vendor "visibility score".

**Score on 2026-09-13, production at `cbd2582`, before this pass deployed:**

| Dimension | Weight | Score |
|---|---|---|
| A | 25 | 12.5-19.6 (A2 and A6 n/s) |
| B | 20 | 0-13.3 (B1, B2, B4, B5 n/s) |
| C | 25 | not scored |
| D | 15 | 7.5 |
| E | 10 | 5.8 |
| F | 5 | not scored |
| **Scorable** | **70** | **25.8-46.2** |

Expected after this pass deploys: D2 rises to 1.5-2 (KBO `sameAs`, `alternateName`); D4 to 2 once GEO-015 is answered; A5 stays 2; A7 stays 1 while GEO-019 is deferred.

**Before a score out of 100 means anything:** A2, B1 and B2 need the GEO-001 and GEO-005 dashboard visits; A6 needs a month of crawler logs; B4 and B5 need weeks of GSC and BWT data on the new URLs; C needs a baseline prompt panel (GEO-021); F needs lead attribution (GEO-037). Until all of those exist, report "scorable N of 70" with its range, never a total out of 100.

---

## 9. Re-audit triggers

Run the full pass, or the listed steps, when any of these happens:

- **Quarterly**, with the prompt panel.
- **A Cloudflare setting or product change** touching bots, robots.txt, caching, redirects or rewriting, or a dated Cloudflare announcement about AI crawlers: steps (a) and (h).
- **A new platform guidance doc or crawler** from Google, Bing, OpenAI, Anthropic, Perplexity or Apple, or a dated change in one: steps (b) to (d) for what it touches.
- **A new service, course, page or article**: titles, graph, sitemap, `llms.txt`, internal links, and the client-input items it may close.
- **A slug rename or a removed page**: add 301s from every old form, slashed and slashless, and re-run the old-URL sweep.
- **A domain, host or Pages project change**: `pages.dev` noindex, canonical origin, `SITE_ORIGIN`, redirects, GSC and BWT properties.
- **A change to footer identity** (name, address, enterprise number, phone): graph, KBO, LinkedIn, GBP and directories together.
- **A client answer to any open question** in section 3.
- **GSC or BWT reports a spike** in 404s, blocked crawls or dropped AI impressions.
