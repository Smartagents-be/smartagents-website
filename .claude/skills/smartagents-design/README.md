# SmartAgents — design system

Extracted from homepage direction **1a** ("Redactioneel — licht, lijnen, veel lucht") in
`SmartAgents Homepage.dc.html`, the agreed direction for the smartagents.be redesign.
That design doc lives in the "Smartagents.be Redesign Direction" Claude Design project and is
the single source of truth; every value here was lifted from it verbatim.

## The company

SmartAgents (Beringen, Belgium — BE 1037.114.694) builds "digital colleagues": agentic AI
automation for Belgian SMEs and enterprises. Four services — procesoptimalisatie, agentic
automatisatie, training, AI staffing en coaching — plus their own product, **SmartSpace**
(in beta): one workspace where a company's agents and its people sit side by side.
The site is Dutch-first (NL / FR / EN).

### Sources

- `SmartAgents Homepage.dc.html` (design project) — the redesign direction, section 1a.
- `assets/logo.svg` / `assets/logo-dark.svg` — supplied by the client.
- No Figma file or brand book was provided. Anything not visible in 1a is absent here
  by design rather than invented.

## Content fundamentals

- **Language**: Dutch (Belgian), formal *u* — never *je* — in body copy. Headings occasionally
  drop into second person plural anyway ("Zullen we eens praten").
- **Sentence case everywhere.** No all-caps, no title case, not even in buttons or labels.
- **Short declaratives.** "Wat werkt en wat niet." "Digitale collega's die nooit slapen."
  Copy is confident but plain — no superlatives, no "revolutionary", no exclamation marks.
- **Honesty as a tone device.** The site repeatedly says where AI does *not* help:
  "we zeggen eerlijk waar AI niets toevoegt", "we zeggen ook wanneer u ons niet nodig hebt",
  "wat niet gebruikt wordt, halen we er weer uit". Keep that — it is the brand's whole posture.
- **Concrete over abstract**: "mail, facturen, offertes, aanbestedingen, calculaties",
  not "business processes".
- **CTA vocabulary**: *Plan een gesprek* (primary, everywhere), *Bekijk wat we doen →*,
  *Ontdek →*, *Ontdek SmartSpace*, *Alle artikelen →*. Arrows are the literal character →,
  never an icon.
- **No emoji.** Ever.
- Dates: "12 juni 2026" — lowercase month, tabular numerals.

## Visual foundations

**Two darks, one accent, a lot of paper.** Ink `oklch(0.148 0.005 247.84)` for text and primary
buttons; navy field `oklch(0.183 0.022 252)` for every dark shape; cyan
`oklch(0.53 0.112 214)` on paper and `#00d8ff` on the field. Nothing else. Paper is a stack of
near-whites (0.9846 → 0.945 on hover); pure white is reserved for a panel that floats over the
page — today only the menu the header folds into under 768px.

**The dark field is the brand.** Large navy shapes cut with angular clip paths — a wedge behind
the header logo, a petal and its counter-lobe on the hero's two flanks, a chevroned full-width
band for SmartSpace, a disc for the DNA section — each carrying a live cyan node network (the logo motif in motion) that reads as
one continuous field across the whole page. There is no illustration, no gradient background and
no texture, and pictures appear on exactly two surfaces (see "Deviations", item 5): the founders on
the team page, and the thumbnails in the homepage's "Inzichten" list.

A page may carry its own silhouette where that says something the shared ones do not. The AI
staffing page opens on an arch — one curve off the right flank where the petal is a leaf — and
closes on a band whose end is cut by a curve rather than by the doc's chevron point. Draw a new
shape the way those are drawn: one closed subpath (a magnet resamples it into a single polyline, so
two lobes written apart collapse into one), joins at the extremes with matching tangents so nothing
corners mid-curve, and every corner that remains sitting on the page edge the shape is welded to.

**A new silhouette takes the box a shared one would have taken.** The arch is hung off the same
flank, at the same insets, as the petal it stands in for — which is what keeps a page's own shape a
variation rather than a second composition, and is why the staffing page overrides no hero
measurement at any breakpoint.

**A shape must read as drawn, and it must not be the ground.** Two ways to lose that, both of them
failed drafts of this one arch. Struck corner to corner with five points of bow across a 690px box,
it read as a black triangle — neither the cursor nor the node network rescues a silhouette a
reader has already filed as a triangle; a fifth of the span is the working figure for the bow.
Opened up to fill the corner instead, it stopped being a shape hung off an edge, and a hero that
has become half navy then wants a second silhouette in the opposite corner to balance it. One
shape per hero, and the paper is its counterweight. The same holds for a shape carrying copy: navy
behind a single column with the rest of the band empty is the page-scale version of the same
mistake.

**Type**: Geist (fallback Inter, system-ui) at 650 for display and headings, 600/550 for UI,
400–450 for body. Tight tracking that loosens as size drops (−0.032em display → −0.005em UI).
Body copy runs 1.6–1.62 leading, capped at 44ch. Monospace (`ui-monospace`) appears only as
cyan two-digit indexes. Instrument Serif italic exists as a single optional hero accent line.

**Layout**: full-bleed — the page runs edge to edge, no sheet and no desk. 64px page gutter,
104px between sections, 72px column gap. Content lists are hairline-separated rows — not cards.
Section headings sit under a 2px cyan rule with 22px of air. Asymmetry is the rule: the hero
text occupies the left 52%, the dark field the rest.

**Borders and elevation**: 1px hairlines at `oklch(0.925 0.005 247.84)` do most of the
separating work. Shadows are deep, wide and very soft (`0 30px 70px -34px` at 32% opacity) —
never a tight drop shadow, never an inner glow except the SmartSpace screenshot frame.
Transparency and blur are used once: the pointer spotlight over the screenshot frame.

**Radii**: 5 chip · 7 button · 8 nav item · 11 menu item · 16 menu panel · 20 card · 26 shell ·
999 pill. Pills are only used for badges and the language chip.

**Motion**: two speeds. Travel (transform, shadow) is 0.34s `cubic-bezier(0.16,1,0.3,1)`;
colour (text, border, background) is 0.22s ease. Hover on filled buttons = lift 2px + soft
shadow; on outlined buttons = cyan border and text; on rows and nav items = a wash background.
Nothing bounces, nothing scales, nothing spins. Scroll reveals are a short fade-and-rise.
The node network drifts at 30fps and freezes under `prefers-reduced-motion`.

**Press states**: the design has none beyond the hover lift settling back — keep it that way.

## Iconography

The system is deliberately icon-poor. The only vector marks are the SmartAgents logo (light and
dark), a 9×6px chevron drawn inline in the nav, and the LinkedIn "in" glyph on the team page's
founder cards — a third-party *brand* mark, drawn inline in `currentColor`, not the first member
of an icon set. Everything else that would be an icon is a typographic arrow (→). Numbers act as
icons: monospace `01–05` in cyan. **Do not introduce an icon library** — if a new surface truly
needs one, raise it rather than picking one silently.

## Fonts

The design doc loads Geist and Instrument Serif from Google Fonts. **This repository does not**:
`.claude/skills/fast-static-site/SKILL.md` §4 forbids third-party font origins, and no licensed
webfont binaries were supplied. `--font-sans` names Geist first and falls back to the platform UI
face, which costs zero requests and zero layout shift.

**Ask the client for the font files.** Once they land: subset to WOFF2, drop them in
`assets/fonts/`, add `@font-face` rules in `tokens/fonts.css` with `font-display: swap`, preload
only the weight used above the fold, and set `size-adjust` on a fallback face so nothing shifts.

## Index

- `styles.css` — the entry point (imports only).
- `tokens/` — `fonts`, `colors`, `typography`, `spacing`, `shape`, `motion`.
- `assets/` — `logo.svg`, `logo-dark.svg`.

The production implementation of all of this lives in `src/`; see `SKILL.md` for the map.

## Deviations from the design doc

The doc is a fixed 1180px canvas rendered in a preview host. Seven things had to be decided
outside it, and are decided the same way everywhere in `src/`:

1. **Responsive behaviour.** The three page measures (`--gutter-page`, `--gap-column`,
   `--section-rhythm`) and the type scale are fluid; the doc's value is always the upper bound.
   The desk's own composition holds down to 1080px, where the two hero shapes pull back into
   their corners so the copy keeps light ground; the shell loses its radius and shadow below
   1252px. Under that the doc has a second canvas of its own — see "The tablet" below — and the
   phone is where the invention still happens.

   **The tablet.** "SmartAgents Homepage Tablet" (834x1112) is drawn, and the site follows it.
   Three thresholds carry it, and each says one thing:

   - **768px — the header.** Above it the nav bar stays a bar: the sections, the language chips
     and the primary action on one row, every measurement in it fluid so it lands on the
     artboard's values at 834px and still holds at 768px in the longest of the three languages.
     The one link that goes is "Contact", because the button beside it goes there. Under 768px
     the row folds into the disclosure it has always folded into — and the wedge folds with it,
     down to the shape it takes on the phone: at the desk's 318px the cut runs past the trigger
     and "Menu" is set on navy. The chips, the gaps and the button's flanks tighten at the same
     line, so the four items clear the slope at 621px, the last width that still has them in the
     row.
   - **1000px — the columns.** Every list that is one column on a phone and three or five across
     a desk runs two abreast between these two numbers: the services, the five steps, the four
     articles. The steps and the DNA entries take the phone's vertical rule while they do, so a
     column of them draws one line. The transformation becomes the phone's single dark block up
     here too, with the list and the isometric stack still side by side inside it, and the
     stack's callouts drop.
   - **940px / 620px — the hero.** The hero stays split all the way down to the phone with the
     copy in a column just over half the page and the petal hung off the right edge; the
     counter-lobe goes, because at this width the two shapes meet in the middle. The column is
     51%, not the artboard's 57%: the petal's tip reaches back to 54% of the page at mid-height,
     which the artboard's own headline clears by a hair in one language at one width, and a
     column that clears it in all three at every width in the band is worth the six points. The
     artboard also turns the hero's hierarchy over — the wordmark steps back and the claim
     becomes the largest thing on the page — which is what the phone already did. Both the column and the lobe are shares of the width, so the pair
     holds to 621px; under it the phone takes over and the petal lies across the top of the copy
     as a sliver. There is no flat band in between: a stripe the width of the page under a block
     of copy read as a misprint, and the split it replaced still reads at 620px.
2. **Fonts.** No webfont is loaded — see above.
3. **The nav names destinations, not categories.** The doc draws a `Diensten` mega-menu over four
   services; two of them have no page, and a dropdown whose real content is two links is a lid over
   two links. The bar is the five things a reader can actually arrive at — the two services with a
   page, the team page, and the Inzichten and Contact sections of the homepage — written out flat,
   which is also what the disclosure under 768px and the phone sheet then carry, unchanged. Ons DNA,
   Aanpak and Digitale transformatie came off the bar and stayed on the homepage: they are read on
   the way down rather than aimed at. Put a section back in the nav only when it becomes a page.
   `NAV_ITEMS` in `src/layouts/base.mjs` is the list, and a service is named there from
   `service.<key>.title`, so its nav entry, its homepage row and its own hero can never drift.
4. **Rows are only links when there is somewhere to go.** The doc's service and article rows link
   to detail pages that mostly do not exist, so a row with no destination renders plain and drops
   the "Ontdek →" cue. Two services now have a page — training and AI staffing and coaching — and
   both rows link; the lookup is `servicePath(key, lang)` in `src/layouts/base.mjs`, and adding a
   page to `SERVICE_PAGES` there brings the hover, the arrow and the translate back on the homepage
   row and puts the service in the nav at the same time. All four article rows link too, through
   `insightPath(key, lang)` in `src/pages/insights/insights.mjs`; only Procesoptimalisatie and
   agentic automatisatie are still plain.
5. **Two surfaces carry pictures**, which the doc rules out everywhere else.

   **The team page** puts photography in its hero: under the headline, the two founders fill the
   rest of the opening screen side by side, with the petal hung off the right edge and running
   past their feet. The petal and the two portrait scrims are the whole dark field on that page —
   it closes on paper, because a navy band under a pair of navy-scrimmed portraits was a third
   dark mass in one screen. Each portrait *is* the card — a 2:3 crop, a 1px hairline, the card
   radius, no ring, no shadow — and everything about the person is laid over its foot on a scrim
   of the same navy (`color-mix` of `--sa-field`, 97% at the bottom to transparent at the top).
   Hairlines inside the overlay are white at low alpha, not `--border-on-dark`, which disappears
   over a photograph.

   Below 940px the pair needs the whole page, so this hero turns the split a quarter rather than
   losing it: the headline keeps a column, the petal is hung off the right edge beside it at the
   proportion it is drawn at, and the two faces run underneath on the full width. The shape is in
   normal flow for the only time on the site — sized by `aspect-ratio`, with a negative margin
   putting its welded edge back on the page edge — so the row it sits in *is* the petal's height
   and the headline reads on its centre line. Under 621px the phone's own treatment takes over
   unchanged: the sliver across the top-right, the headline under it. What this replaced was a
   flat navy band between the headline and the faces, which is the thing the homepage hero
   already refuses at this width; stretched across a tablet its slope flattened out and the band
   read as a diagonal rule.

   **The homepage's "Inzichten" list** carries a thumbnail per article: a 208px 16:9 crop opening
   the row, the title with its excerpt directly under it, and the date and category badges ranged
   right at the row's end, so the row spans the page like every other list on it and stays about
   as tall as its picture. Below 1080px the meta moves above the title, and below 1000px the
   article stacks — but two abreast, which is how the tablet artboard sets it and what the 156px
   stamp beside five lines of type had been standing in for. Four of them are two rows, not four
   screens, which is the objection that kept the row a row. The list stays a hairline list — no
   cards and no shadows — but every row is now a link and carries the "Ontdek →" cue, inside the
   text column rather than in a reserved third one: the row's third column is the date and the
   badges, and it is ranged right against the page edge.

   **An insight's own page** shows the same thumbnail again, in the same frame, at the reading
   measure. That is the third surface with a picture on it and it is not a new decision so much as
   the same one twice: it is the picture the reader clicked, so showing anything else would be the
   surprise. It is deliberately not full-bleed and not wider than the type — the widest derivation
   is 760w and the smallest original is 542px across, so a banner running the width of the page
   would be the one visibly soft picture on the site.
   The four pictures are a photograph, an illustration and a product screenshot, which is exactly
   why the frame is fixed: 1px hairline, `--radius-panel`, over paper — the navy the portraits sit
   on would put four dark blocks in the section while the lazy images load.

   Both surfaces grade the picture itself `saturate(0.72) contrast(1.04)` so it cools towards the
   field. On the portraits the grade is a decoration and hover lifts it, so a coarse pointer —
   which has no hover to undo it — never gets it at all. On the thumbnails the grade is the thing
   that makes three kinds of picture read as one column, so it stays put on every pointer and only
   lifts once a row is a link. Anything else that wants a picture is a new decision, not a
   precedent.

6. **The SmartSpace band is not built.** The doc's chevroned navy band, its screenshot frame and
   the *Ontdek SmartSpace* button are gone from the homepage, and with them the `bandField` clip
   path, the `nav.smartspace` entry and the `smartspace.*` copy. The product is still named on
   the site — the third article row is about it — but it has no section of its own. Bring the
   band back only if SmartSpace gets a page to send people to.

   The **figure** did come back, once, on the AI staffing page: a full-bleed navy band carrying the
   one thing both tracks share, what the client's management hears and when. It is the only navy
   shape on the public site that carries copy rather than texture, which is what the doc's own band
   always did. Its end is a curve, not the doc's chevron point, and the run that curve eats is
   reserved by padding on `.cadence__inner` so the copy never has to know where the cut is; under
   1000px the clip is dropped and the band is a plain full-width block. Reach for this only when a
   block is genuinely the closing statement of a page — a second one on the same page would make
   both read as cards.

7. **Long-form copy is a page type the doc never drew.** The four insight articles are the only
   thing on the site that is read rather than scanned, and four decisions had to be made for them
   that nothing else on the site needed.

   **The measure is the page, not a measure.** Body copy is capped at 44ch everywhere, which is
   right for the two or three lines a marketing block runs to and far too narrow for twenty
   paragraphs of one: at the reading size 44ch is about fifty characters, and a column of that width
   turns an article into a very tall thin ribbon. A capped column has a second problem here, which
   two drafts of this page both had — set at 58ch and then at 72ch, it left 300–440px of dead page
   between the prose and the rail, which is the same "single column with the rest empty" the band
   rule already refuses. So the article column takes what the page leaves beside the rail, the way
   the hero takes 52% and every other block on the site is a share of the width. On a 1440px desk
   that is 965px, around 115 characters — long by the usual measure, and the client's call. The
   levers if it ever wants tightening are the body size and `--measure-prose`, which is now only an
   outer bound so the column cannot run away on a very wide monitor.

   The standfirst under the headline sits at 62ch: narrower than the body it introduces, which is
   what makes it read as a standfirst, but not the site's 44ch, which beside a column this wide
   reads as a stub.

   **The banner is inset, not stretched.** The column is wider than any derivation, so the figure is
   capped at 760px — the widest there is — and sits inset in its column. An article whose widest
   derivation cannot reach that stops at the width it does have: `BANNER_CAP` in
   `src/pages/insights/insights.mjs` and `.article__banner--short-source`. Only the launch
   photograph is in that position, at 480px, because its original is 542px across. Stretching 760px
   of pixels across 965 is the one soft picture this system refuses.

   **The other half of the page.** A single column of prose with the rest of the page empty is the
   mistake this README already names at page scale — "navy behind a single column with the rest of
   the band empty". The honest thing to put beside a page someone is reading is what else there is
   to read, so the other three articles sit in a rail against the right edge: the homepage's row
   idiom narrowed, hairline under each, title and date, no thumbnail, and it sticks so it is still
   there at the foot of a long piece. Its track is a flat 260px on the right page gutter, so its
   right edge is the nav's and the footer's and the only air between the two columns is the column
   gap. Below 1000px — the same line every other two-abreast list collapses on — it drops under the
   article, which is where a "read next" block belongs anyway.

   **There is no hero, and no dark shape at all.** Every other page opens on one because it is
   selling something and the petal is what says whose page it is. This one is a piece of writing, and
   a 540px shape between the header and the first paragraph is a screen the reader has to scroll past
   before they can start. So the page opens on the headline, at the measure the body runs at, and it
   is the one page on the public site that is paper end to end. An article headline is a sentence, so
   it is set at `--text-h1-sub` on a 26ch measure rather than at the display size: at the display
   size two of the four run to three lines, and the brand's display voice is not what a piece of
   writing opens in. Under it the excerpt the homepage row prints is printed again, then the date and
   the category badges take the row the other detail pages give their buttons — an article's next
   action is to read it, so there is nothing to press.

   **Three marks inside the body, and no more.** A heading is `--text-h3` at the display weight. A
   pull quote is the 2px cyan rule a section heading sits under, stood on its side — no quotation
   marks, no italic, the rule and the size are the whole signal. A list is a disc with a cyan
   marker, because the site's own list idioms (hairline rows, cyan two-digit indexes) do not survive
   inside a paragraph's rhythm, and the marker is cyan for the same reason the indexes are. Inline
   links are the one underlined thing on the site: cyan is the accent colour of every link here, and
   inside a paragraph colour alone is not a reliable cue. Nothing else — no drop cap, no aside, no
   figure inside the body.
