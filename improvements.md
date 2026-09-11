# UI/UX review — smartagents.be (redesign branch)

Reviewed 11 September 2026 against the local build on `:8001`: all twelve public
pages in Dutch at 1280, 834 and 390px (English and French home spot-checked),
plus the phone nav sheet, the contact form, the accordion, keyboard focus,
the 404, and a code scan of `src/`, `build/`, `functions/` and `public/`.
Nothing was changed. Numbers in this file were measured, not estimated.

Legend: **[UX]** layout / flow · **[Copy]** wording · **[Slop]** filler that reads
as generated · **[A11y]** accessibility · **[Mobile]** · **[Perf]** · **[Code]**
optimisation or bug found while scanning. Every item has a file or page so it
can be found again. Items are sorted by effort, low → high; inside a band the
most valuable comes first.

---

## What is already right (do not undo)

- One primary action per page, the same colour everywhere, and it changes colour
  rather than moving. Focus rings on buttons and links are visible (2px, 3.4:1).
- Labels above fields, required marks with a legend, inline errors written and
  announced (`role="status"`), keep-what-you-typed on failure, `aria-disabled`
  busy state. This is a textbook form once the Turnstile key is present.
- Nav is visible on desk, current page underlined, logo left and linked, phone
  and mail in the footer and in the phone sheet.
- No cards for content, no icon soup, no webfonts, no third-party requests, CLS 0,
  every image has alt and dimensions, 0 duplicate ids in 60 pages, real 404 status,
  `prefers-reduced-motion` respected in CSS and JS.
- Tone of voice is consistent and human ("we zeggen ook wanneer u ons niet nodig
  hebt"). Keep that sentence; it is the best line on the site.

---

## Low effort (copy, one rule, one attribute)

> **Applied on 11 September 2026** on the `redesign` branch. Items 1–20 and
> 22–25 are done, measured in the browser at 1280, 834 and 390px in all three
> languages, with `npm run build` green (60 pages, contact path check passed) and
> no console errors on any page. Item 21 and half of item 13 are not done, for
> the reasons under each. `CLAUDE.md` was updated wherever a change contradicted
> what it said. The item text below is left as it was written, as the record of
> what was found; a **Done** line says what was actually changed where that
> differs from the recommendation.

### 1. Every hero fails the five-second test: no sentence says what the page offers. [UX][Copy]
Every detail page hero is eyebrow → headline → two buttons → 300px of paper
(`training-hero`, `staffing-hero`, `sdlc-hero`, `processes-hero`, `kata-hero`,
`jobs-hero`). "Leer AI gebruiken als een professional" or "Sluit je aan bij ons
team" tells a stranger nothing about who it is for or why it matters, and the
first real sentence arrives at y≈800 on a 1280×800 laptop, below the fold.
The sentence already exists: every page's `*.description` in `src/i18n` is a
literal one-liner. Print it as a standfirst under the H1 (the kata page's facts
strip is the model of what a hero can carry).

**Done, and then reversed on the client's instruction.** `.hero__lede` printed
each page's own `description` key under its H1 for a while. It is gone from all
seven heroes now, along with both of its rules in `critical.css`, so a hero is
a headline and its actions again and the `*.description` keys are metadata
only. The finding stands as written; the answer to it is the client's call.

### 2. Homepage hero is a tagline under a second logo. [UX][Copy]
`#home-hero` prints the wordmark 120px below the header's wordmark, then
"Digitale collega's die nooit slapen" as the H1, then the buttons. Nothing says
what SmartAgents does or for whom; the offer starts at y≈1000. Two fixes, both
small: drop the hero wordmark (the header already carries the brand) and add
one literal line under the claim, e.g. the current `home.description` ("…bouwt
digitale collega's voor Belgische organisaties: training, AI staffing en
coaching, een AI-native SDLC en AI-native businessprocessen"). Keep the claim
as the H1 if the brand wants it; the sub-line does the explaining.

### 3. "Verstuur" is the button the checklist says never to use. [Copy][Form]
`cta.send` in all three languages. Name the result: "Verstuur bericht" /
"Stuur mijn vraag" ("Send my question", "Envoyer ma question"). Put the
reassurance that already exists in `contact.lede` ("We antwoorden zelf, meestal
binnen een werkdag") next to the button on the pages where the lede is absent
(home, training). And mark `Bedrijf` as "(optioneel)" — the legend says which
fields are required, the checklist asks for both to be marked.

### 4. The current language is not visibly marked. [A11y][UX]
`#header-lang` NL/EN/FR: all three links compute to the same colour
(`oklch(0.54 …)`), weight 550, no underline. `aria-current="page"` is set, so
the fix is one CSS rule: give `[aria-current]` in `.lang-switcher` the same
underline the nav's current item has. Colour alone would not be enough anyway.

### 5. "Ontdek →" appears eight times on the homepage. [Slop][Copy]
Four service rows and four article rows each end on `cta.moreInfo`. The rows
are already whole-row links (1152×118px), so the word is decorative. Either keep
only the arrow, or make the label descriptive per row ("Bekijk training",
"Lees het verslag"). On `/jobs/` only one of the three "Werken bij" rows is a
link (to the team page) and carries the cue, while all three look identical;
either link none or say why that one goes somewhere.

**Done, the first option, with one exception.** The cue is the arrow alone on the
service rows and the article rows, and `cta.moreInfo` is deleted. The jobs page
takes the second option instead: with two of its three rows going nowhere, an
arrow is a difference a reader has to notice before they can read it, so that row
says "Ontmoet het team →" (`jobs.why.team.link`).

### 6. Third-level pages have no way up. [UX][Nav]
The kata page's eyebrow "Training" and the article eyebrow "Inzichten" are plain
`<p class="page-eyebrow">` (`src/pages/kata.mjs:148`,
`src/pages/insights/insights.mjs:377`). The breadcrumb exists only in JSON-LD.
Make the eyebrow the link to the parent; that is the whole breadcrumb this site
needs.

### 7. Header "Plan een gesprek" on Jobs and Privacy navigates to the homepage. [UX]
On pages without a `#contact` section the header CTA, the phone bar and the
sheet CTA all resolve to `/nl/#contact`, a full page change with no warning. On
`/jobs/` the CTA is also the wrong ask for a candidate. Swap the header action to
"Bekijk de vacatures" (`#vacancies`) on jobs, and to mail/phone on privacy, in
`siteHeader()` / `mobileActions()` (`src/layouts/base.mjs`).

### 8. The 404 page is unstyled. [UX]
`/nl/404/` (and `dist/404.html`) prints the heading flush to the left edge at
x=0, no page gutter, no hero, one button. It is the only page that looks broken.
Wrap it in the shell's padding, keep the tone, and offer two or three
destinations (services, insights, contact) as well as home.
**[Code]** `scripts/start-local.mjs:119,130` answer a missing URL with a
plain-text "Not found" instead of serving `dist/404.html`, so nobody on
`:8000`/`:8001` ever sees the real page. Serve the file with a 404 status.

**Done.** It is a `.section` with the page frame, a standfirst (`notfound.lede`)
and three destinations read off keys the chrome already prints — so it cannot
name a section by a word no other page uses. `scripts/start-local.mjs` serves
`dist/404.html` with a 404 status.

### 9. Link hover colour fails AA. [A11y]
`critical.css:51-53` sets `a:hover` to `--sa-cyan-hover` (#038fab) = 3.64:1 on
paper; the rest state is 4.72:1. WCAG applies to every state. Use `--sa-deep`
(12:1) on hover, or keep the colour and change only the underline.

### 10. Input focus ring is invisible. [A11y]
`main.css:1527` uses `--focus-ring` at 14% alpha = 1.21:1 on paper; the 1px
border change is the only signal. Point it at `--sa-cyan-ring` (the buttons
already use the measured 0.8 value). That token has one consumer.

### 11. Orbit rings and the phone menu vanish or shout under forced colours. [A11y]
CLAUDE.md says the rings are hidden under `forced-colors: active`; the only
such block in `main.css` is `.cycle__phase` (`main.css:4449`). Five hairlines
become full-strength `CanvasText` circles through the reading column. Add
`.orbits { display: none }` to a forced-colors block in `critical.css`. The
burger's three bars are `background`-drawn (`main.css:~208`) and disappear;
draw them as borders. `.legend__mark` (`main.css:4392`) is the same case.

### 12. Tap targets under 44px on touch. [Mobile][A11y]
Measured at 390px: `.person__link` (LinkedIn) 36×36; language chips 46×37 in the
sheet and 26×33 in the tablet header; `Download de fiche` 226×22; `Bekijk het
programma` 158×22; `Alle artikelen →` 103×17; phone and mail links in every
contact block 118×18 / 148×18; `privacybeleid` 85×16. All clear the 24px WCAG
floor only by their surrounding gap. Give inline action links the footer's
`inline-flex; min-height: 32px` treatment and the chips 44px.

### 13. Smallest type on the site is legal copy and the nav. [Readability]
`.footer-micro__item` 11.5px, nav links 12–13px, `.tour__tags-item` 12.5px,
`.field-label__text` 12.5px, `.track__fit-body` 13.5px, `.step p` and
`.person__body` 14px. Contrast passes (4.8:1 at the faintest), so this is a
call, not a failure — but 11.5px enterprise numbers and a 12px nav are the two
to raise (12.5 / 14).

**Not done, and measured rather than declined on taste.** Both raises regress a
constraint that was measured before them.
The nav's 12px floor only applies between 1181px (where the bar folds) and
1276px; at 1280 the clamp already resolves to 13.06px. In that band the French
row is 564px wide with the primary action standing 24px from the window edge
inside a 59px gutter. At a 13px floor that row is 609px and the action is 21px
*past* the window edge, and `.shell` is `overflow: clip`, so it would be cut
rather than scrolled to. Paying it back means folding the bar at 1240px instead
of 1180px, which takes the nav bar off every 1181–1240px tablet — a design
decision, not a one-rule change.
The footer microline at 12.5px is 836px of type in Dutch against a 799px track
at 1280, so it wraps to two lines on the commonest laptop width; 12px is 809px
and still wraps. It holds one line from about 1340px up at 12.5. Contrast is
4.82:1 either way.

### 14. Two identical "Plan een gesprek" buttons on the phone's first screen. [Mobile][UX]
At 390×844 the hero's primary button (bottom 283px) and the sticky bar's
`#mobile-actions-talk` (top 775px) are both visible. Show the bar only once the
hero CTA has scrolled out (one IntersectionObserver, or `animation-timeline:
view()` where supported).

### 15. Tag clouds that say nothing. [Slop]
- Training, "U krijgt": Lesmateriaal · Oefeningen · Labs · Q&A · Slides ·
  Begeleiding (`training.format.tags.*`).
- Kata, "De kata bevat": Lesmateriaal · Slides · Quizzen · Flagborden ·
  Projectwerk · Workshops (`kata.practice.tags.*`).
- Team: "Digitale transformatie · Strategie · Ondernemerschap · AI-adoptie"
  under each founder (`team.person.*.tags`).
- Staffing: a tag line under each track heading ("Direct impact op uw project •
  Agents op uw codebase • Expert AI-gebruik", `staffing.track.*.tag.*`).
These are the "too many subtexts" pattern. The paragraphs beside them already
say it. Cut the tag rows; keep the staffing "Past wanneer" line, which is the
one genuinely useful sub-block.

### 16. Eyebrow inventory. [Slop]
Five detail pages carry an eyebrow that repeats the nav item just clicked
(`training.hero.eyebrow` = "Training" on the training page). Team has a pill
badge "De oprichters" above two people who are visibly the founders. Privacy
has "Juridisch". Keep an eyebrow only where it adds a level (kata → "Training",
article → "Inzichten", both as links per item 6); drop the rest and the pill.

### 17. "Prijs: Op maat, na een korte intake" is a row that answers nothing. [Copy]
Both course columns on `/training/`. Either give a range ("vanaf € …/dag") or
drop the row and let the CTA ask.

**Done, by dropping the row.** A range is the better answer and nothing in the
repo or on the site knows one; a number is not ours to invent. The CTA under the
strip is what asks now.

### 18. External claim without a link. [Copy]
`sdlc.journey.lede`: "We volgen het AI-native SDLC-playbook van Anthropic."
Link the source or name it more loosely; a named document that cannot be
opened reads as a name-drop.

**Done, by naming it more loosely, and then by linking it.** No public Anthropic
document could be pointed at with confidence at the time, so the line stopped
claiming a specific playbook: "We bouwen op wat Anthropic publiceert over
AI-native engineering." The client has since supplied the document, so the lede
keeps that wording and carries the source under it as a link —
`sdlc.journey.source` on `PLAYBOOK_URL` in `sdlc.mjs`, which is
claude.com/blog/the-ai-native-sdlc-playbook. It is the only external source the
public site names.

### 19. Contact block is inconsistent across pages. [Consistency]
The home and training contact sections have a title and no lede; the other
seven have a lede ("Vertel kort…"). The home is the one page where the
reassurance matters most.

### 20. Heading order skips a level on the insights index. [A11y][Code]
`/nl/inzichten/`, `/en/insights/`, `/fr/analyses/`: `h1 h3 h3 h3 h3 h2`.
`articleRows()` (`src/pages/insights/insights.mjs:159`) hard-codes `<h3>` for
the homepage; pass the level in.

### 21. The tour video has no captions. [A11y]
Both `<video>` blocks (training format, kata tour) ship an MP4 with no
`<track kind="captions">` and no transcript. The voice-over is the content.

**Not done: it needs the content, not the code.** `<track kind="captions">` wants
a WebVTT file per language, and nothing in this repo or in `../kata-agentic-java`
has a transcript of the voice-over. Writing one from the audio is the work; the
markup is ten minutes after that. Left for whoever can supply or approve the
transcript.

### 22. Vacancy card spacing. [UX]
`/jobs/`, open row: the `Solliciteer` button sits flush under the last bullet
with no gap, and the description list runs the full 1150px width at 16px.
Add the panel's own vertical rhythm before the action and cap the list at the
prose measure.

### 23. Stray orbit node at a section edge. [UX] (verify)
On the homepage at 1280 a 4px grey dot sits at the right edge just above the
"Inzichten" heading (y≈1440 in the full-page capture) and on `/inzichten/` at
the top right. It is a travelling `.orbits__node` reaching the clipped edge of
its layer, which extends past its section. Either clip the layer to the section
or fade the node before the edge.

**Verified, then fixed.** Confirmed by measurement, not by eye: on the homepage
`home-insights-orbit-02` stands 4px past the layer's right edge at full opacity
with 1px of a 5px dot showing, and the same node does it on `/inzichten/`. The
layer is masked to nothing over its last 44px on each flank — horizontal only,
because no node on the site reaches the top or bottom edge lit and a vertical
fade would pull the rings off the header's hairline. `.orbits--notice` declares
its own mask, so it restates this one intersected with it.

### 24. Dead and duplicated CSS shipped in every head. [Code]
- `.btn--ondark` ×4 (`critical.css:531-555`): zero usages in 47 pages. Delete.
- Nine unused tokens inlined in every head: `--sa-field-2`, `--sa-grey-5`,
  `--surface-desk`, `--font-serif-accent`, `--track-caps`, `--space-15`,
  `--shell-width`, `--radius-shell`, `--shadow-shell`. Delete.
- `.orbits__path--04` (`critical.css:861-880`) is only used below the fold;
  move it to `main.css`.
- `.section-rule`, `.page-cta`, `.page-cta__body` in `main.css` are dead.
- Three consecutive identical `@media (max-width: 1000px)` blocks at
  `main.css:942, 956, 997`; two at `620px` (`1606, 1618`). Merge.
- `.rows--pair` and `.rows--cards` are byte-identical (`main.css:463, 1373`).
- `a.row:hover`, `a.article-row:hover`, `.rail-row:hover` are the same block
  (`main.css:436, 1310, 4103`).
- `.orbits--offer/--insights/--notice` all set `opacity: .8`; one rule on
  `.section--orbits .orbits`.
- `.step { border-top: 1px solid oklch(0.9 0.006 247.84) }` (`main.css:1097`)
  is `--sa-line-2` written out.
- `.article-row__figure/__text/__meta` are each declared twice at top level.

**Done, all of it, plus four tokens the first deletion orphaned.** Removing
`.btn--ondark` left `--action-ondark-bg`, `-bg-hover`, `-bg-press` and `-fg` with
no reader, so they went too — fourteen tokens in all, counting `--focus-ring`
from item 10. The inline critical block is 17,197 B, down from 18,071.

### 25. Small JS and function fixes. [Code]
- `src/sw.js:66` caches any OK navigation: a click on a one-pager PDF lands
  400 KB in the `pages-*` cache. Use `isCacheable(response, 'text/html')`.
  The `pages-*` cache is also unbounded (`:59`), unlike images; `trim()` at
  `:101` is fire-and-forget and should be inside `event.waitUntil`.
- Speculation rules (`base.mjs:129-137`) and the hover fallback
  (`src/app.js:94-117`) prefetch `/media/*.pdf` on hover from the training
  page. Add `{ not: { href_matches: '/media/*' } }` and skip on
  `navigator.connection?.saveData`.
- `functions/api/contact.js:45-48`: with `TURNSTILE_SECRET_KEY` unset the
  string `"undefined"` is posted and the visitor gets a 403 "captcha failed".
  Return 500 and log. No body-size guard before `request.json()` (`:28-33`);
  `intent` (`:176`) has no form field; add `Cache-Control: no-store` to
  `jsonResponse`.
- `contact-form.js:183` collapses 429, 502 and 400 into one message; give the
  rate-limit its own string (it is the one the visitor can act on).
- `src/motion.js`: dead `cursorX/cursorY` params on `joins()` (`:805`), dead
  `walked` in `smooth()` (`:707`), stale "loaded lazily" comment (`:1-2`),
  reduced-motion read once and never listened to (`:1253`).
- `vite.config.js`: `build.modulePreload: false` removes the ~1 KB
  `__vitePreload` helper nothing uses; `reportCompressedSize: false` saves
  build time.
- `src/layouts/base.mjs:20` redefines `LINKEDIN_URL` that `schema.mjs` exports;
  four copies of `String(n).padStart(2,'0')` (`base.mjs:244`, `prose.mjs:37`,
  `home.mjs:32`, `privacy.mjs:164`).
- `build/render.mjs:146-164` renders and minifies `404.html` a second time with
  identical input; `cpSync` the file. `:218-237` copies 78 MB of `secured/`
  one `cpSync` per file every build; one recursive copy with a filter.
- `scripts/check-dist.mjs:350, 517` brotli-compress every page twice at
  quality 11 (3.5 s of the script's 3.8 s). Compute once.
- `public/_headers`: `Vary: Accept-Encoding` is added by Cloudflare anyway.
- `sitemap.xml` has no `<lastmod>`; articles carry a date.
- Redundant `twitter:title/description/image` (`base.mjs:167-169`, Twitter
  falls back to `og:*`) and a `modulepreload` for the same URL as the module
  script two lines below.

**Done, all bullets, plus one the scan did not name:** `spotlights()` in
`src/motion.js` is deleted. It hung a `pointermove` handler on every
`[data-spotlight]` element and wrote a gradient string per event, and no page on
the site has carried the attribute since the dark cards it was drawn for became
hairline rows — so it shipped in the entry chunk everywhere and ran nowhere. That
also retires the first bullet of item 44.
---

## Medium effort (a component, a section, a decision)

### 26. Detail-page heroes are 640px of decoration before any content. [UX]
Same root as item 1, but structural. On a 1280×800 laptop the hero on every
detail page ends at y≈640 and the first section heading at y≈740: the first
fold is a headline, two buttons and a navy shape. Cut the hero to ~420px on
detail pages (keep the homepage's), or fill it: standfirst + the page's own
facts strip (kata) or the first row of the page's list. The jobs hero is the
clearest case — its only action scrolls to a list one screen down.

### 27. The homepage carries three overlapping taxonomies. [Slop][IA]
"Wat we doen" (four services), "Ons DNA" (four self-descriptions), "Digitale
transformatie" (four phases, unlinked, with the labels repeated a second time
inside the illustration). Two of the phases are two of the services
("Opleiding" = Training, "Processen herdenken" = AI-native processen). "Ons
DNA" rows like "Innovators — Nieuwe technologie trekt ons aan, en geeft ons
energie" are the filler the brief asks to avoid. Recommendation: cut
"Digitale transformatie" entirely; reduce "Ons DNA" to one paragraph (or move
it to the team page, whose "Waarom we begonnen zijn" already says it better).
Homepage becomes hero → services → insights → contact, and the fold moves up
by ~1300px.

**Done, the first half.** "Digitale transformatie" is gone: the section, the
isometric stack beside it, the `stackField` clip path, the `.numbered--plain`
modifier nothing else used and 384 lines of `main.css`. "Ons DNA" stays — that
half is a copy decision, not a layout one, and it was not asked for. The
homepage is hero → services → DNA → insights → contact.

### 28. "Waarom investeren in AI-training?" is a generated benefits list. [Slop]
Five rows: Snellere adoptie, Hogere productiviteit, Minder risico, Kostenbewust,
Minder afhankelijk van externen (`training.benefit.*`). This is the pattern a
reader now recognises as AI copy, and it stands between the hero and the actual
offer. Keep the two that are specific to this company ("Kostenbewust" with the
token argument, "Minder afhankelijk") as one sentence in the offer intro, drop
the section.

### 29. No proof anywhere. [Trust]
No client name, logo, quote, number or certification on any page; the Aviso+
breakfast article is the only third party mentioned. For B2B this is the
checklist's biggest gap, and it is content, not code: one honest block — two
or three client names from real engagements and one quote with a name and a
role — placed after "Wat we doen" on the homepage and on the staffing page.
Needs the client. Do not invent it.

### 30. Staffing accordion: half the panel is empty. [UX][Layout]
The open track panel is 1150px wide; the copy sits in the left 590px and the
right half is paper. Either run body left and "Past wanneer" right as two
columns, or cap the panel at the prose measure. The section heading "Wat we
doen" duplicates the homepage heading; name it for the page ("Het aanbod",
"Drie manieren van meewerken" without the count).

### 31. Article measure is ~100 characters; privacy 128. [Readability]
`.article__main` on the four insight pages is 828px at 16px; the notice is
1022px. The checklist's 50–75ch is `--measure-prose: 100ch` → ~72ch. CLAUDE.md
records this as the client's call; put the number in front of them with the
two screenshots side by side.

### 32. Inline validation depends on the Turnstile key. [Form][Code]
`contact-form.js:49` returns before upgrading when `data-sitekey` is empty, so
the form falls back to native bubbles in the browser's language ("Please fill
in this field." on a Dutch page). Upgrade the form unconditionally (novalidate,
inline errors, busy state) and gate only the token step on the key.
Also from the scan: Turnstile's `expired-callback`/`timeout-callback` are not
wired (`:140-147`), so a stalled challenge leaves the button busy for the life
of the page; `preventDefault()` runs after an `await` (`:167-170`), so a fast
Enter during script load sends the `mailto:` and the JSON post; and the no-JS
`mailto:` fallback loses the message body (`contact-form.mjs:121`: mail
clients drop unknown query keys — name the textarea `body`).

### 33. The action does not move focus into the form. [UX][A11y]
Clicking "Plan een gesprek" scrolls `#contact` to the top with the header
cleared, but `document.activeElement` stays on `body`; the first field is 160px
lower. Focus the name field (with `preventScroll`) on the same-page CTA.

### 34. Phone nav sheet is not modal. [A11y][Mobile]
Below 621px the panel is `position: fixed` over the page, but `main`/`footer`
are not `inert`, the body still scrolls under it, Tab walks out of it, and the
toggle keeps the hamburger icon while open. Set `inert` + `overflow: hidden`
on toggle, swap the icon to ×, close on outside click.

### 35. Animations that never stop. [Perf][Motion]
`<sa-node-field>` drifts up to 2,200 nodes at 30 fps forever on every page
(`node-field.js:109-115`, only `document.hidden` polled inside the timer);
four orbit layers rotate 780–1690px transparent boxes forever
(`critical.css:798-880`). The brief says "animations appear only in response
to something, not playing forever". Cheapest wins: stop the clock when no
window intersects the viewport (the IO exists at `:147`), react to
`visibilitychange` instead of polling, animate the 8px node instead of its
1690px box. A step further: run the field only while the pointer or scroll is
moving and idle out after ~2 s — at 0.16px/tick a paused field is
indistinguishable at a glance.

### 36. Type is in px; text-only zoom does nothing. [A11y]
Setting the root to 32px changes no size on the page. Page zoom works, so
WCAG 1.4.4 is technically met, but Firefox/Safari "zoom text only" users get
nothing. Move the scale in `tokens.css` to rem.

### 37. Stale HTML after a content-only deploy. [Code]
`renderServiceWorker` (`build/render.mjs:491`) derives the SW version from the
two asset hashes; a copy change, a new article or an Odoo vacancy produces a
byte-identical `sw.js`, so the SWR page handler serves the previous HTML on the
first view of every page for every returning visitor. Fold a build id into
`VERSION`, or go network-first for navigations with a ~1.5 s timeout.
`skipWaiting` + immediate old-cache deletion (`sw.js:15-32`) can also strand a
lazy chunk an open page requests later.

### 38. Critical CSS is 18 KB against a 14 KB promise, and main.css blocks anyway. [Perf]
The inline block is 18,071 B (4.1 KB brotli) in all 47 pages, `main.css` is a
plain blocking `<link>` (48 KB raw / 8 KB br), so the inline block buys no
earlier paint. Decide once: trim critical (items 24, 39) and add a
`criticalCssBytes` budget to `check-dist.mjs`, or load `main.css` async and
move the phone header/actions rules into critical.

### 39. Every page ships all 22 clip paths and 20 `[data-clip]` rules. [Perf][Code]
`clipDefs()` (`base.mjs:281-546`) emits 7.4 KB of SVG on every page; the
privacy notice and the articles use none. Render the body first and emit only
the ids found in `data-clip`. Same for the `[data-clip="X"]` rules in
`critical.css:595-681`.

### 40. Breakpoints leave fractional-pixel cracks. [Code]
Census: 620 ×23, 1000 ×13 (+1001), 940 ×8 (+941), 1080 ×5 (+1081, +1080.98
×2), 1180 ×4, 767/768 ×5, and one-offs 800, 700, 553, 480, 400. The `.98`
exists because max/min pairs miss 1080.5px. Use range syntax
(`(width < 1081px)`) and retire the pairs. Header clearance (96px, 56px) and
591px are repeated literals that want tokens.

### 41. Missing security headers. [Code]
`public/_headers` has `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy`; no `Content-Security-Policy` (start Report-Only with
`'self'`, `'unsafe-inline'` for the style block, `'inline-speculation-rules'`,
`challenges.cloudflare.com`), no `Strict-Transport-Security`. `/secured/*`
responses come from a Function and should say `private, no-store` themselves.

### 42. Cheap checks `check-dist.mjs` does not run yet. [Code]
Heading order (would have caught item 20), one `<h1>` per page, `og:image` /
`imagesrcset` candidates resolved against `dist/`, `aria-labelledby` targets
exist, JSON-LD parses, `sitemap.xml` locs resolve, critical CSS size budget.
Each is one loop over the files it already parses.

### 43. Duplication across page modules. [Code]
Ten identical `meta()` bodies; eight identical `contact(t, lang)` wrappers;
nine identical breadcrumb builders; seven copies of
`slug === undefined ? null : pagePath(lang, slug)`; `SERVICE_PAGES` defined
in both `render.mjs:40` and `base.mjs:29`; `courseNode` in `schema.mjs:202`
hard-codes `P1D`, 5, 15 and `['nl','en']` while its comment says they are
read off `kata.spec.*`. Default `meta` and `contact` from `page.id`, one
`pathOf(page, lang)` in `i18n.mjs`, and structured spec data in `kata.mjs`.

### 44. Motion pass does per-frame work it could cache. [Perf][Code]
`src/motion.js`: spotlight handler reads `getBoundingClientRect()` and writes
a gradient string on every `pointermove` (`:15-34`); one rect read per magnet
per frame interleaved with `setAttribute('d')` writes (`:1095, :1204`);
`Math.hypot` over 220–480 points per magnet with no bbox early-out
(`:1110-1125`); ~480 array allocations plus a `toFixed(4)` string per point per
frame (`:1153, :1202`). Cache rects at setup, squared distances, typed arrays,
one decimal.

### 45. Odoo read is sequential and unbounded. [Code]
`build/lib/odoo-jobs.mjs:379-389` awaits three language reads in series (8 s
timeout each) and the API chain before them; worst case holds a deploy 40 s+
before the snapshot wins. `Promise.all` and one overall deadline.

---

## High effort (architecture, programme)

### 46. Measure, then test with five people. [Process]
There is no analytics by policy (correct for the brand). What is left: the
form's `page_context` field says which page converts; Cloudflare's server-side
Pages analytics needs no script. Then one round of five moderated sessions on
the two tasks that matter — "find out what the training costs and book it",
"find someone to put in my team" — plus one screen-reader pass. Items 1, 2, 26
and 27 are the ones a session will confirm or kill in five minutes.

### 47. The hero shapes are the one delight; keep them, gate them. [Motion]
The metaball join is the brand's personality and it is opt-in by nature
(pointer, desk, motion allowed). It is done right. What is missing is the
"turn it off" half of the checklist: a visible toggle is overkill, but
honouring `prefers-reduced-motion` at runtime (item 25, last bullet) and
idling the field (item 35) are what make it a courtesy rather than a cost.

### 48. Ship the join engine only where it can run. [Perf][Code]
`src/app.js:88` statically imports `src/motion.js`; ~700 lines of contour
tracing, marching squares and pooled buffers are in the 16 KB entry chunk on
every phone, yet they only run behind `(min-width: 1081px) and (hover: hover)
and (pointer: fine)`. Keep `collectMagnets`/`remapPathData` (needed before
paint for CLS) in the entry; dynamically import the rest from `arm()`, which
already runs on first idle or first pointer move. Entry roughly halves.

### 49. Break the layout ↔ pages import cycle. [Code]
`base.mjs:10-17` imports seven page modules for nav hrefs; every page imports
`orbitRings`/`index`/`servicePath` back. It works because nothing runs at
module evaluation, but it is the root cause of three duplications CLAUDE.md
documents as deliberate (kata's parent slug, `PHONE_HREF` in the privacy body,
`FOUNDERS` in `schema.mjs`). Move chrome helpers to `src/layouts/chrome.mjs`
(no page imports) and the registry to `src/pages/index.mjs`; item 43 collapses
into it.

### 50. Per-layout critical CSS. [Perf]
`.hero__wordmark`, `.hero h1.hero__claim`, `.hero__field--left` and their
media overrides are homepage-only (3 of 47 pages) but inlined everywhere.
`render.mjs:510` already concatenates the block; split into base + home and
choose per page. Pairs with items 38 and 39.

### 51. Node-field per-tick allocations. [Perf][Code]
`node-field.js:218-232`: each window filters and sorts the full node array and
builds an `rgba()` string per link, six windows × 30 fps. Sort once per tick,
binary-search each window's x-range, quantise link alpha into ~8 buckets and
stroke one path per bucket. Also `:127-128`: a re-attached element never
re-observes (reconnect bug).

### 52. Specificity chains and the reduced-motion `!important` kill-switch. [Code]
`.hero h1.hero__claim`, `.numbered p.numbered__units`,
`.nav-toggle__panel a.nav-sheet__item` exist because base rules are
element-qualified; rewrite bases with `:where()`. `main.css:2107-2109` uses
`!important` ×3 for reduced motion where targeted rules already cover every
animation.

---

## Checklist items that do not apply or need the client

- Security badges, checkout, password rules, undo/redo, empty states,
  onboarding, mascots, unsubscribe flows: no such surfaces on this site.
- Search: eleven pages; not needed.
- Reviews, client logos, certifications (item 29): content the client owns.
- Real-device testing and PageSpeed field data: run once the branch is on a
  preview URL; nothing here was measured on a phone.
- Odoo's "Beringen, Belgium" on the Dutch page and the typo in the vacancy are
  Odoo's to fix (documented in CLAUDE.md).
