# Website review — violations and remedies

**Scope.** The `redesign` branch, built with `npm run build` and served from `dist/`
on `127.0.0.1:8000`. 47 rendered pages: 11 templates × 3 languages, 10 decks, 2
documents. Reviewed at 1440 / 834 / 390 px in Chrome, plus Lighthouse 12.8.2.

**Note.** `smartagents.be` still serves the *old* Eleventy site. Nothing below has
shipped yet, which is the good news: every item is cheap to fix now.

## Lighthouse

| Page | Perf | A11y | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/nl/` (desktop) | 99 | ~~96~~ **100** | 100 | 100 | 0.4 s | **0.067** |
| `/nl/ai-staffing/` (mobile) | 99 | ~~96~~ **100** | 100 | 100 | 1.5 s | 0 |
| `/nl/inzichten/wat-werkt-en-wat-niet/` (mobile) | 100 | ~~96~~ | 100 | 100 | 1.7 s | 0 |
| `/nl/training/` (mobile) | 99 | ~~96~~ **100** | 100 | 100 | 2.0 s | 0 |

Performance is genuinely excellent and needs no work. Accessibility was 96 on every
page for one reason, `color-contrast`, and #5 fixed it. Re-audited 2026-09-03 after
#4, #5 and #29: **100 with no failing audit** on `/nl/`, `/nl/ai-staffing/`,
`/nl/team/` and `/nl/training/`. The insight page was not re-run; it shares every
token and component involved, so it is expected to match. `lighthouserc.json`
asserts `accessibility: 1` and `cumulative-layout-shift: 0`, so the budget's
remaining red count is CLS alone (#6). Lighthouse SEO 100 only means the basics are
present — it does not look at structured data, social cards or content depth, which
is where the real gaps are.

`uses-text-compression`, `uses-long-cache-ttl` and `bf-cache` also flag, but all
three are artefacts of the local dev server; Cloudflare's `_headers` handles them.

---

## Violations

Severity: **P0** blocks launch · **P1** fix before launch · **P2** fix soon.

**Done:** `[ ]` open · `[x]` fixed · `[~]` partly fixed · `[-]` decided against.
Tick a box when the item ships. The six that are not `[ ]` today:

- **#1 `[x]`** — the form sends `subject` and `page_context` as hidden fields
  (`contact-form.mjs`), `validatePayload` no longer requires `subject`, and
  `npm run build` now runs `scripts/check-contact.mjs`: it parses the *rendered*
  form out of `dist/`, posts those exact fields through the real
  `onRequestPost`, and fails the build if they are rejected. The subject strings
  are copied verbatim from `contact.form.subject` on `main`, because n8n's
  classifier already routes on them.
- **#2 `[~]`** — the silent drop is gone: `forwardToN8n` is awaited rather than
  handed to `context.waitUntil`, logs its cause, and a missing or erroring
  webhook answers **502** instead of `{ok:true}`. Delivery itself still does not
  work: `N8N_WEBHOOK_URL` is unbound, and it is in no commit on any branch
  (`main` included) — it exists only in the Cloudflare Pages dashboard. Ticking
  this needs the URL pasted into a `[vars]` block in `wrangler.toml`.
- **#3 `[x]`** — `/nl/privacy/`, `/en/privacy/`, `/fr/confidentialite/`, linked
  from the footer of every page and from a line under every submit button
  ("Door te versturen gaat u akkoord met ons privacybeleid"). It names
  Cloudflare, n8n Cloud (EU region) and Slack as recipients, the art. 6(1)(b)
  and (f) bases, the 7200-second IP-counter expiry and the 24-month message
  retention, and the Gegevensbeschermingsautoriteit for complaints. It has no
  cookie banner because the public pages set no cookies — verified, not assumed.
  Two things still owed: the **street address** (art. 13 is satisfied by name,
  VAT, city, e-mail and phone, but WER art. III.74 wants the geographic address
  — that is #4), and the 24-month figure, which nothing in the code enforces.
- **#4 `[x]`** — the footer carries the full disclosure: `SmartAgents BV`,
  `Besloten vennootschap`, `Mijnschoolstraat 18, 3580 Beringen, België`, the
  e-mail and phone as real `mailto:`/`tel:` links, `BE 1037.114.694` and
  `RPR Ondernemingsrechtbank Antwerpen, afdeling Hasselt`, in three stacks
  above a hairline that keeps the copyright and the three links. Every value is
  read off a register, not supplied from memory: the KBO/BCE public search for
  enterprise number 1037.114.694 (database state 02/09/2026) for the name,
  legal form and seat, and FPS Justice's territorial-competence lookup for
  Beringen (3580) for the court. Six new `footer.*` keys in all three
  languages; `footer.legal` is now `© 2026 SmartAgents` alone, because the VAT
  number moved to its own labelled line rather than being printed twice.
  `src/pages/privacy/body.mjs` still names the controller without the street or
  the legal form, so it now says less than the footer — worth aligning.
- **#5 `[x]`** — one token: `--sa-grey-6` from `oklch(0.56 …)` to
  `oklch(0.54 …)`, measured rather than guessed. 4.43:1 reproduced exactly
  before the change; after it, 4.82:1 on `--sa-paper` and `--sa-paper-2`,
  4.65:1 on the `--sa-wash` a row hover paints under it, 5.04:1 on white in the
  tablet nav panel. 0.54 rather than the 0.52 suggested here: it is the first
  step that clears the floor on every paper-family surface, and the binding
  constraint is the hover wash, not paper. The primitive was safe to move
  because `--text-faint` is its only consumer — the hairlines are the separate
  `--sa-line-*` family. Two errors in the item below: "Wat u leert"
  (`.offer-course__learn`) uses `--text-muted` and measured 7.1:1, so it was
  never an offender, and four call sites went unnamed
  (`.contact-form__privacy`, `.offer-course__tools`, `.phase`, `.journey__note`).
  Lighthouse accessibility is now **100** on `/nl/`, `/nl/ai-staffing/`,
  `/nl/team/` and `/nl/training/`, with no failing audit of any kind.
- **#27 `[-]`** — naming Anthropic's playbook is deliberate; confirmed
  2026-09-03. The line stays.
- **#29 `[x]`** — closed by #4 rather than separately. The expanded footer took
  the count of small footer links from two to four and made `target-size` fail
  outright, so `.footer-block > *` and `.site-footer nav a` now carry a 24px
  minimum row. The height is taken on the row rather than on the two links that
  strictly need it, so the three stacks keep one rhythm.

Two audits that `violations.md` did not list surfaced when the a11y score was
verified rather than reasoned about, and both are fixed:

- **`link-in-text-block`** — the privacy link under the submit button
  (`#*-contact-privacy-link`) is cyan inside faint grey with no underline:
  1.02:1 against its surrounding text where WCAG 1.4.1 wants 3:1. It is the one
  link on the site that sits inside a run of body text, so it is the one place
  colour alone cannot carry it. `.contact-form__privacy a` is now underlined.
  Pre-existing, not caused by #5, though darkening the faint grey moved the
  ratio from ~1.09 to 1.02.
- **`target-size`** — see #29 above.

| # | Done | Sev | URI | File | Violation | Possible remedy |
|---|---|---|---|---|---|---|
| 1 | [x] | P0 | every page (`#contact`) | `src/components/contact-form/contact-form.js:85`, `functions/api/contact.js:105` | The form posts `{name, company, email, message}`. `validatePayload` requires `subject` and rejects with 400, so every JS submission fails and the visitor sees "Versturen lukte niet". The site's only conversion path does not work. | Either drop `subject` from the required set in `validatePayload`, or have `contact-form.js` add a derived subject (e.g. page title + intent) before the POST. Add an end-to-end test that posts the real form payload. |
| 2 | [~] | P0 | `/api/contact` | `wrangler.toml`, `functions/api/contact.js:54` | `wrangler.toml` has no `[vars]`, so `env.N8N_WEBHOOK_URL` is `undefined`. `forwardToN8n` runs inside `context.waitUntil` and swallows its own error, so the endpoint answers `{ok:true}` and the message is dropped in silence. Already documented in `functions/api/README.md` and still unfixed. | Add `[vars] N8N_WEBHOOK_URL = "…"` to `wrangler.toml` (the dashboard is ignored once the file exists). Make `forwardToN8n` fail loudly: return 502 when the webhook is missing or errors, rather than reporting success. |
| 3 | [x] | P0 | all public pages | — (page missing), `src/layouts/base.mjs:476` | No privacy policy, cookie policy or terms exist anywhere in the 33 public pages. The site collects name, company, e-mail and free-text message, forwards them to an external n8n instance, and loads Cloudflare Turnstile — all personal-data processing with no notice. GDPR art. 13 requires the notice at the point of collection. | Add a `/privacy/` page in all three languages, link it from the footer and from a line under the submit button ("Door te versturen gaat u akkoord met ons privacybeleid"). Name the n8n and Cloudflare processing and the retention period. |
| 4 | [x] | P1 | all public pages | `src/layouts/base.mjs:476-483` | The footer carries only `© 2026 SmartAgents · BE 1037.114.694` and two links. Belgian company law (WER art. III.74 / e-commerce disclosure) requires the registered name, legal form, geographic address, e-mail and RPR court to be directly accessible. | Expand the footer: full legal name and form, Beringen address, `info@smartagents.be`, phone, VAT, RPR court, plus links to privacy, cookies and terms. |
| 5 | [x] | P1 | all public pages | `src/styles/tokens.css:72`, 12 call sites in `critical.css` / `main.css` | `--text-faint: var(--sa-grey-6)` = `oklch(0.56 0.018 247.84)` ≈ `#6c767f`, which is **4.43:1** on `--sa-paper` — below the 4.5:1 AA floor, and it is used at 11–13 px: form labels, article dates, step indices (`01`–`05`), the `NL EN FR` switcher, "Wat u leert". This is the sole cause of the 96 a11y score. | Darken `--sa-grey-6` to about `oklch(0.52 …)` (≥ 4.6:1 at 12.5 px) and re-run Lighthouse. Cheapest possible fix: one token, twelve call sites, no layout change. |
| 6 | [ ] | P1 | `/nl/` | `src/styles/critical.css:440` (`.hero__field--right`), `src/motion.js` | CLS 0.067, attributed entirely to `#home-hero-field-right`. `collectMagnets()` grows the magnet element's box at setup, so the hero shape resizes after hydration. `lighthouserc.json` asserts CLS 0. | Reserve the grown box in CSS (give `.field-slot` the final dimensions) so `motion.js` grows into space that already exists, or defer the grow until after the first paint has settled. |
| 7 | [ ] | P1 | all 33 public pages | `src/layouts/base.mjs` (head) | Zero JSON-LD. No `Organization`, `WebSite`, `Service`, `BlogPosting`, `Person` or `BreadcrumbList` anywhere. This is the single biggest GEO gap: answer engines have no machine-readable statement of who SmartAgents is, what it sells, or who wrote the articles. | Emit `Organization` + `WebSite` on every page; `Service` on the four service pages; `BlogPosting` with `author`, `datePublished`, `inLanguage`, `image` on the insights; `Person` on the team page; `BreadcrumbList` on detail pages. |
| 8 | [ ] | P1 | all 33 public pages | `src/layouts/base.mjs` (head) | No `og:image`, no `twitter:card`, no `og:site_name`. Every share on LinkedIn — the company's only social channel — renders as a bare text link with no picture. | Add a default 1200×630 OG image in `public/media/`, `og:image` + `og:image:alt` + `twitter:card=summary_large_image` + `og:site_name` in `base.mjs`, and per-article overrides using the existing insight thumbnails. |
| 9 | [ ] | P1 | `/nl/inzichten/*` and equivalents | `src/pages/insights/insights.mjs` | Articles declare `og:type="website"` and carry no `article:published_time`, `article:modified_time` or `author`. The date exists in the DOM as `<time datetime>` but never reaches the head. | Set `og:type="article"` for insight pages and emit `article:published_time`, `article:author` and `name="author"` from the existing `INSIGHTS` entry. |
| 10 | [ ] | P1 | `/nl/inzichten/*` | `src/pages/insights/insights.mjs:~207` (rail) | There is no insights index page. "Alle artikelen →" in the article rail points at `/nl/#insights`, a homepage anchor listing the same four items. The label promises an archive that does not exist, and there is no `/inzichten/` URL for search or AI crawlers to enumerate. | Generate `/nl/inzichten/`, `/en/insights/`, `/fr/analyses/` as real index pages from the same `INSIGHTS` list, point the rail and the nav sheet at them, and add them to the sitemap. |
| 11 | [ ] | P1 | all detail pages | `src/pages/insights/insights.mjs`, `src/styles/main.css:1681` | `.page-eyebrow` ("Inzichten", "Training", "AI staffing en coaching") is rendered in `--sa-cyan` — the exact colour used for every real link on the site (`Ontdek →`, `Alle artikelen →`, phone, e-mail) — but it is a `<p>` with `cursor: auto`. It looks like the "back to section" link and is not one. | Either make it a real link to the section/index it names (best — it is the natural breadcrumb), or restyle it to `--text-muted` + caps tracking so it reads as a label. |
| 12 | [ ] | P1 | all pages | `src/layouts/base.mjs` (`BAR_ITEMS`) | No nav link ever gets `aria-current="page"` or an active class. On `/nl/training/` the "Training" item looks and reads exactly like the other four. The only `aria-current` on the site is on the language switcher. | Pass the current page id into `nav()` and set `aria-current="page"` plus an `.is-current` style on the matching bar and sheet items. |
| 13 | [ ] | P1 | `/nl/team/` (all languages) | `src/pages/team.mjs:124` | `${eager ? '' : ' loading="lazy"'}` is interpolated through the escaping `html` tag, so the rendered attribute is `loading="&quot;lazy&quot;"`. The value is invalid and Tom's portrait loads eagerly. Every other conditional attribute in the codebase correctly uses `raw()`. | Wrap in `raw()`: `${eager ? '' : raw(' loading="lazy"')}`. Grep for other bare-attribute interpolations while you are there. |
| 14 | [ ] | P1 | `/nl/`, all service pages | `src/pages/home.mjs`, `training.mjs`, `staffing.mjs`, `sdlc.mjs`, `processes.mjs` | Every hero is an eyebrow, an `h1` and two buttons — no lede, no value proposition. The homepage `h1` is `SmartAgents / Digitale collega's die nooit slapen`, which carries no service keyword and repeats the wordmark already 60 px above it in the header. On desktop the hero is ~940 px tall with ~550 px of empty paper under the buttons. A first-time visitor scrolls a full screen before learning what the company sells. | Add a 1–2 sentence lede to every hero, below the `h1` and above the buttons. Give the homepage `h1` a subject ("AI-training, staffing en agents voor Belgische organisaties" or similar) and drop the duplicated wordmark from it. |
| 15 | [ ] | P1 | `/nl/ai-staffing/` (277 words), `/nl/team/` (178), `/nl/` (552) | `src/pages/staffing.mjs`, `team.mjs`, `home.mjs` | Body-copy volume is far below what these pages need to rank or convert. `ai-staffing` is three collapsed accordion paragraphs; two of the three are hidden on load. `team` is two 30-word bios. Word counts include nav, footer and form boilerplate, so real content is roughly half these numbers. | Target 600–900 words per service page: who it is for, what a week looks like, what you get, what it costs, what it does not cover. Open the first accordion row *and* give the section a visible intro paragraph outside the `<details>`. |
| 16 | [ ] | P2 | `/nl/`, `/nl/ai-staffing/` | `src/pages/home.mjs:191,224`, `src/pages/staffing.mjs` | `.numbered__title` (Ons DNA, Digitale transformatie), `.track__title` (the three staffing tracks) and `.stack__label` are `<div>`, not headings. Eight named content blocks on the homepage and all three staffing offers are invisible to heading navigation, while the structurally identical `.step` blocks in "Van vraag tot werkende oplossing" correctly use `<h3>`. | Promote them to `<h3>` (and `<h3>` inside `<summary>` for the tracks). Keeps the outline complete and matches the `.step` pattern already in the same file. |
| 17 | [ ] | P2 | `/nl/` | `src/pages/home.mjs` | Four of the seven `main > section` elements — `#home-hero`, `#dna`, `#transformation`, `#approach` — have no `aria-labelledby`, while `#services`, `#insights` and `#contact` do. Unlabelled sections are dropped from the landmark list, so the region rotor shows three of seven. | Add `aria-labelledby` pointing at each section's `h2` (and give those `h2`s ids — see #20). |
| 18 | [ ] | P2 | all pages | `src/layouts/base.mjs:~440,502` | Two `<nav aria-label="Hoofdnavigatie">` (bar + phone sheet) and two `<nav aria-label="Taal">` in the same document. Duplicate landmark names make the landmark list ambiguous. Separately, the active language uses `aria-current="true"` where `"page"` is the correct token. | Label them distinctly ("Hoofdnavigatie" / "Navigatie (mobiel)"), and change `raw(' aria-current="true"')` to `aria-current="page"` at `base.mjs:502`. |
| 19 | [ ] | P2 | `/nl/#insights` | `src/pages/home.mjs` (insight rows) | Each article card is one `<a>` wrapping title, excerpt, cue, date and tags, giving accessible names of 158–200 characters ("AI die je morgen al kan gebruiken Verslag van onze ontbijtsessie met Aviso+, voor KMO-ondernemers … 12 juni 2026 Nieuws AI"). Link lists are unusable at that length. | Move the `<a>` to wrap the title only and make the card clickable via a stretched pseudo-element, or add `aria-labelledby` pointing at the title element. |
| 20 | [ ] | P2 | `/nl/`, header, footer | `src/layouts/base.mjs`, `src/pages/home.mjs` | The repo's own `element-ids` skill requires every element in `<body>` to carry a unique id. 137 elements on the homepage have none: the entire header, the entire footer, and the `#dna`, `#transformation` and `#approach` sections — while `#home-hero`, `#home-services` and `#home-insights` are fully id'd. The convention was applied page-section by page-section and never finished. | Finish the pass on `base.mjs` (header, brand, footer) and the three homepage sections. No duplicates exist today, so this is additive. |
| 21 | [ ] | P2 | `/media/*.pdf` | `public/media/` | `SmartAgents_AI_Introductie_Onepager.pdf` (429 KB) and `SmartAgents_AI_Management_Onepager.pdf` (413 KB) ship and are publicly crawlable but nothing links to them — leftovers from the replaced learning path, as `CLAUDE.md` notes. Google will index them as orphan PDFs competing with `/training/`. | Delete both, or link them from the training page if still current. If kept, add `X-Robots-Tag: noindex` for those two paths in `public/_headers`. |
| 22 | [ ] | P2 | `/nl/training/#offer` | `src/pages/training.mjs`, `public/media/` | "AI voor business teams" downloads `SmartAgents_M365_Copilot_Onepager.pdf` and "Agentic engineering" downloads `SmartAgents_AI_Developers_Onepager.pdf`. The course names on the page and the names inside the PDFs do not match, so the download looks like the wrong file. Neither link states the file size (~400 KB each). | Rename the PDFs to match the course names, or rename the courses. Append the size to the link text and add `type="application/pdf"`. |
| 23 | [ ] | P2 | `/robots.txt` | `public/robots.txt` | `robots.txt` states only `Allow: /` and `Disallow: /secured/`. There is no explicit policy for GPTBot, ClaudeBot, PerplexityBot, Google-Extended or CCBot, and no `llms.txt`. For a company selling AI services, being deliberately legible to AI crawlers is table stakes. | Add explicit `User-agent` blocks for the major AI crawlers (allow, since visibility is the goal), and publish `/llms.txt` summarising the offer, the four services and the article index with canonical URLs. |
| 24 | [ ] | P2 | `/nl/#transformation`, `/nl/#approach` | `src/pages/home.mjs` | Two numbered process lists sit back to back: "Digitale transformatie" (01 Strategie · 02 Processen herdenken · 03 Opleiding · 04 Toepassing) and "Van vraag tot werkende oplossing" (01 SmartScan · 02 Ontwerp · 03 Ontwikkeling · 04 Implementatie · 05 Optimalisatie). They describe overlapping things with different numbering, and a reader cannot tell which one is the actual engagement. | Merge into one numbered engagement model, or reframe "Digitale transformatie" as capability areas without numbers so the two stop competing. |
| 25 | [ ] | P2 | `/nl/training/#offer` | `src/pages/training.mjs` | Neither course states duration, price or price band, group size, location, dates, prerequisites or trainer. "Een AI-subscriptie, eigen laptop" is the only practical detail. Prospects cannot self-qualify, so every enquiry starts from zero. | Add a facts strip per course: duration, format (in-house / open), group size, level, price indication, next dates. This is also the raw material for `Course` structured data. |
| 26 | [ ] | P2 | all pages | site-wide | No proof layer of any kind: no client names or logos, no case studies, no testimonials, no numbers, no certifications, no FAQ. The strongest claim on the site is "Op papier is iedereen AI-expert" — a promise the site itself does not evidence. | Add one case study per service (situation → what we did → measurable result), a client logo strip if permissions allow, two or three named quotes, and an FAQ block (which also feeds `FAQPage` structured data and is the format AI answer engines quote most). |
| 27 | [-] | P2 | `/nl/ai-native-sdlc/#approach` | `src/i18n` (sdlc copy) | "We volgen het AI-native SDLC-playbook van Anthropic." A commercial service page attributing its method to a named third-party vendor invites "why not just read the playbook", and implies an affiliation that does not exist. | Reframe as "gebaseerd op de industriestandaard voor AI-native ontwikkeling, aangevuld met wat wij in Belgische teams zien werken", or state the relationship precisely if there is one. |
| 28 | [ ] | P2 | `/api/contact` | `functions/api/contact.js:44-47` | `checkAndIncrementRateLimit` runs before `validatePayload`, so a submission that 400s still burns one of the caller's 5 attempts per hour. With violation #1 live, a visitor is locked out after five failed sends. | Move the rate-limit increment after validation, or only increment on a submission that reaches `forwardToN8n`. |
| 29 | [x] | P2 | all pages (mobile) | `src/layouts/base.mjs:476-483`, `src/styles/main.css` | Footer nav links "Klantenzone" (73×20) and "LinkedIn" (50×20) are under the 24×24 CSS-px minimum of WCAG 2.2 SC 2.5.8. They are standalone nav links, so the inline-text exception does not apply. | Give footer nav links `padding: 6px 0` / `min-height: 24px`. |
| 30 | [ ] | P2 | any unmatched URL | `build/render.mjs` | There is no `dist/404.html`, so Cloudflare falls back to `index.html` with HTTP **200**. Missing pages are soft 404s; the per-language 404s only answer at `/{lang}/404/`. Documented in `CLAUDE.md` and still open. `src/sw.js` already works around it with a `Content-Type` check. | Write the default language's 404 body to `dist/404.html` in `render.mjs` so Cloudflare returns a real 404. |
| 31 | [ ] | P2 | all pages | `src/layouts/base.mjs:481`, `src/pages/team.mjs` | `rel="noopener"` is set on the LinkedIn links but there is no `target="_blank"`, so the attribute does nothing and the outbound link replaces the page. Also no `rel="noopener noreferrer"` pairing convention. | Decide: either add `target="_blank"` (and keep `rel="noopener"`), or drop the now-meaningless `rel`. |
| 32 | [ ] | P2 | all pages, JS off | `src/components/contact-form/contact-form.mjs:46` | The no-JS fallback is `<form method="post" action="mailto:…" enctype="text/plain">`. `method="post"` to a `mailto:` is unreliable — several browsers silently do nothing, and a phone with no mail client configured does nothing at all. The visitor gets no feedback. | Use `method="get"` for the mailto fallback (widely supported), or replace the fallback with a visible "mail ons op info@smartagents.be" line rather than a submit that may vanish. |
| 33 | [ ] | P2 | all pages (`#contact`) | `src/components/contact-form/contact-form.mjs` | Name, e-mail and message are `required` but nothing marks them. There is no inline error message, no `aria-invalid`, and no privacy line. The visitor only discovers a missing field on submit, via the browser's native bubble. | Mark required fields visibly and with `aria-required`, add per-field error text wired with `aria-describedby` / `aria-invalid`, and put the privacy line under the button (see #3). |
| 34 | [ ] | P2 | all pages | `src/layouts/base.mjs` header | The `<sa-node-field>` inside `.header-wedge` animates cyan dots and connector lines directly behind the `SmartAgents` wordmark. Dots repeatedly travel through the letterforms, which reads as rendering noise on the one element that must always be crisp. | Inset the wedge's node field so its live area stops before the brand box, or fade the field's opacity to 0 across the wordmark's width. |
| 35 | [ ] | P2 | `/nl/` at ≤620 px | `src/styles/critical.css:938-956` | Below 621 px both hero shapes collapse to `#heroSwoop`, a shallow sliver across the top ~424 px box. In practice the brand's signature dark field is a small navy corner. The composition that carries the identity on desktop is essentially absent on the viewport most visitors use. | Give the phone its own silhouette with real presence (a full-bleed band behind the `h1`, or the petal rotated to run down the right edge) rather than reusing the desktop path clipped small. |
| 36 | [ ] | P2 | `/media/insights/*-760.*` | `public/media/insights/` | The 760 w AVIFs are 760×428 and the matching JPEGs 760×427. The `<img>` declares `width="480" height="270"` (16:9 = 270.0), so the three variants disagree by a pixel. Harmless today because `aspect-ratio` is fixed from the attributes, but it means AVIF and JPEG are not the same crop. | Re-cut the 760 pair to a single consistent height (760×428 for both) per the `image-pipeline` skill, and check the `sips --cropOffset` values used. |
| 37 | [ ] | P2 | — | repo root | 20 loose `.png` screenshots (`hero-1440.png`, `sdlc-full.png`, `slide54.png`, …) and a stale `.playwright-mcp/` directory sit in the repo root and are tracked or half-deleted in `git status`. Playwright MCP writes screenshots to the working directory by default. | Add `*.png` at root and `.playwright-mcp/` to `.gitignore`, delete the strays, and point tooling at a scratch directory. |

---

## Content review

### What is good

- **The voice.** Direct, concrete, unhyped, and consistent across all three
  languages: "zeggen ook wanneer u ons niet nodig hebt", "Wat niet gebruikt wordt,
  halen we er weer uit", "Op papier is iedereen AI-expert". For a sector drowning
  in vendor noise this is a real differentiator, and it is sustained on every page.
- **Translation parity is genuine.** NL / EN / FR word counts track within 10–15 %
  on every page, including the long-form articles (782 / 807 / 894). Nothing is a
  stub, nothing is machine-dumped, French carries its own idiom. Missing keys fail
  the build, which is why.
- **The four insight articles are the strongest asset on the site.** Real
  arguments, proper `h2` structure, pull quotes, `<time datetime>`, correct
  hreflang across three different slugs per article. "Wat werkt en wat niet" is
  the kind of page that gets cited. This is the content that will do the GEO work
  once #7 and #9 are fixed.
- **Service naming is honest.** Splitting the old "Procesoptimalisatie" into
  AI-native SDLC and AI-native businessprocessen names two genuinely different
  engagements instead of one vague one.
- **The design system holds.** One row pattern, one numbered pattern, one step
  pattern, one contact section, reused across seven page types with no drift. The
  dark-field motif is distinctive and it is not decoration bolted on — it is the
  same field on every page.
- **The engineering is exemplary.** 99–100 performance on every page, zero
  third-party requests on the public site, zero console errors, `prefers-reduced-motion`
  honoured in both CSS and all three JS components, a real skip link, visible
  `:focus-visible` rings, working `<details>`-based nav and accordion with JS off,
  and a `check-dist.mjs` gate that already enforces hreflang, alt text, undefined
  custom properties and the routing table.

### What is bad

- **The homepage sells nothing above the fold.** A full screen of brand mark,
  tagline and two buttons. The company name appears twice within 60 px. No
  sentence anywhere in the hero says what SmartAgents does (#14).
- **Two competing process models on one page** (#24) — the reader cannot tell
  whether the engagement is four steps or five.
- **The staffing page is a stub** (#15). Three collapsed rows, two hidden on load,
  roughly 150 words of actual content behind the site's most commercially
  loaded service name.
- **Attributing the method to Anthropic** (#27) undercuts the expertise the page
  is selling.
- **Everything is a claim, nothing is evidence** (#26). "Ruime ervaring in
  enterprise-systemen", "meer dan 25 jaar ervaring" — no project, no client, no
  number, no outcome anywhere on the site.
- **The training offer cannot be bought** (#25). No duration, price, dates or
  location, so the only next step is the contact form — which does not work (#1).

### What is missing

| Missing | Why it matters |
|---|---|
| Privacy policy, cookie policy, terms | Legal requirement, and blocks launch (#3) |
| Full company identification in the footer | Belgian disclosure requirement (#4) |
| Case studies / references / testimonials | The whole proof layer (#26) |
| Pricing or price bands | Prospects cannot self-qualify; every lead starts cold |
| An insights index page | No archive URL to rank or crawl (#10) |
| Author attribution and bylines on articles | E-E-A-T; AI answer engines cite attributed sources |
| FAQ blocks | The single most-quoted format in AI answers, and free `FAQPage` markup |
| Structured data of any kind | The biggest GEO gap (#7) |
| OG images | Every LinkedIn share is a bare link (#8) |
| `llms.txt` and an AI-crawler policy | Deliberate legibility to the engines this company sells expertise in (#23) |
| Company story: founding, why, where | "Ontmoet ons team" is two 30-word bios and nothing else |
| Jobs page | Exists on the live site, not redesigned, nothing links to it |
| A thank-you state / confirmation e-mail | Even once #1 and #2 are fixed, the visitor gets one line of text and no receipt |

---

## Suggested order

1. **#1, #2, #3** — the form must deliver and the privacy notice must exist before
   any traffic arrives. Nothing else matters if enquiries vanish.
2. **#5, #6** — two small changes that put the build back inside its own
   `lighthouserc.json` budget (a11y 100, CLS 0).
3. **#13, #18, #12, #16, #17** — a half-day of markup corrections.
4. **#7, #8, #9, #10, #23** — the SEO/GEO block; mostly `base.mjs` head work plus
   one generated index page.
5. **#14, #15, #24, #25, #26** — the copy work, which is the largest item and the
   one that decides whether the site converts.
