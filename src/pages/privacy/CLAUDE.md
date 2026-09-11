# The privacy notice

This file loads when Claude works with files under `src/pages/privacy/`. It was
moved out of the root `CLAUDE.md`, where it was loaded into every session.

- **The privacy notice is the article layout, rail and all.** It has no hero,
  for the reason the insights have none: a 540px navy shape between the header
  and the first paragraph is a screen to scroll past before reading. What it
  does have is the rail, and what is in the rail is not a "read next" — there is
  no next from a legal notice — but the notice's own clauses. That is the one
  piece of navigation a legal page needs (nobody reads a privacy statement end
  to end; they arrive wanting one thing) and it is what answers the page's real
  problem: without it the notice was a 1022px column of GDPR prose, 133
  characters to the line and the longest measure on the site, with 354px of
  empty paper beside it for four fifths of its height — the "single column with
  the rest of the band empty" the design README refuses at page scale. The list
  is generated from the same array `prose()` renders and derives its anchors the
  same way, so a heading added to `body.mjs` appears in the index with no second
  edit and the two can never name different ids. It is a `<nav>`, not the
  article's `<aside>`: eight in-page links whose whole purpose is navigation do
  not belong in a `complementary` landmark. It is also **first in the DOM** and
  put back on the right by `order` on a desk — an index belongs before the thing
  it indexes, and the other way round a phone's tab order ran through the whole
  notice before reaching the index sitting under the headline. Seven things are
  load-bearing, each with its rule in main.css under `.notice`:
  - **There is no dark shape on this page**, and it is the only page on the
    public site with a `.section--orbits` and no silhouette. Two were drawn and
    both are gone — a crest in the air beside the head, through three drafts,
    and a mirrored close standing on the footer's hairline. What the drafts
    taught is kept in item 11 of the design README even though the shapes are
    not, because every one of the three failures is a failure a new silhouette
    can repeat. The rings are the whole of the brand here.
  - **The rings stick.** `.orbits--notice` is the one orbit set on the site that
    is not nailed to its section: the origin is `position: sticky` at `top: 50vh`
    and the arcs hold the right flank the whole way down, because the outermost
    ring is 845px in radius against a 2820px section and an origin nailed
    anywhere in it leaves a third of the page with no ground under it. Its
    `top` is **clamped** (`clamp(380px, 50vh, 520px)`) and that clamp is
    load-bearing: plain `50vh` walks the origin down as the window grows taller
    while the clause index stays pinned at 96px, so *which rings cross the index
    is a function of viewport height* — at 900 tall it is rings 01 and 02, at
    1100 ring 03 arrives, at 1600 ring 04 arrives too. Ring 03 is the heaviest
    of the five and deliberately undimmed, so a taller window reintroduced the
    artefact the dimming exists to remove, with a heavier arc. Held under the
    height at which ring 03's window opens — struck off the rail's top-left
    corner, lowest at **534px on a 1280px-wide page**, so 520 leaves 14px — the
    crossing set is 01 and 02 at every height, which is what makes two dim rules
    a complete answer instead of one that happens to hold at 900. Six review
    passes measured this across widths, where the crossings move under 5px;
    height was the axis that mattered. The cap's own cost is at the other end:
    the field reaches viewport y 1365 and no further, so a window over ~1500px
    tall has bare paper under the arcs. Raising it to get that back breaks the
    crossing set and the ring weights with it. Three
    details carry it. The layer takes `overflow: clip` and not `hidden` —
    `hidden` makes it a scroll container and a sticky child would never move, the
    same pair of declarations and the same reason as `.shell`. It is the
    *origin* that sticks and not the layer, because a sticky box is in flow and
    a sticky layer would add a screen of height to the section, where a 0x0
    origin costs nothing and is still a containing block for the rings. And the
    horizontal placement is `margin-left`, because on a sticky box `left` is an
    inset for horizontal stickiness rather than a position. Two consequences are
    paid for in the same rule. The layer is masked to nothing over its last
    200px, because held against the viewport the rings are still at full radius
    when the section's bottom edge arrives and four arcs stopping dead on one
    horizontal line read as a seam. And **rings 01 and 02 are dimmed to 6% and
    10%** from their drawn 10% and 20%: the rings and the clause index are now
    both anchored to the viewport, so those two arcs stand across the same eight
    labels for the whole section and never move relative to them, and an arc at
    the weight of the rules it crosses, held still, is a stray column rule in a
    table rather than ground. The offender is the cyan one, not the innermost —
    sampled, it composites to rgb(209,228,235) against hairlines at
    rgb(228,230,233) while ring 01 is a dead heat at rgb(231,232,233). Scoped to
    two rings and not taken out of the layer's opacity, because rings 03, 04 and
    05 have no crossing of the rail at any height inside the clamp or any width
    from 1024 to 2560, and they are the only ground in the gap the wide-cap
    decision leaves open — those are **widths**, and that decision is the
    "measure is capped below 1000px" bullet further down: 190px at 1600 wide,
    510 at 1920, 1150 at 2560. The `top` cap's own cost, two sentences up, is
    quoted at *heights*. Same numerals, two axes; say which every time.
    Under `prefers-reduced-motion` the origin stops being
    sticky and falls back to the 34% it was struck at before it stuck: a layer
    held against the viewport while the page moves past it is scroll-coupled
    motion, and it is the only such motion on the site. The clause rail is
    sticky too and is deliberately not treated that way — it is navigation a
    reader is using, and a decoration is the half that can be given up.
  - **There is no phone override on the rings**, and every other orbit set on
    the site has one. The reasoning behind those — push the origin out so the
    strong inner rings leave the reading measure — is half true and the
    conclusion does not follow: moving the origin out also shortens the vertical
    reach the outer rings need to arrive. Counted at 390px, rows of the measure
    each ring crosses at 98% against 150%: ring 02 (cyan) 490 → 651, ring 03
    (the darkest ink ring) 72 → 845. It is worse on every ring but the one it
    was aimed at. `.orbits--insights` carries the same override and the same
    reversal and is left alone — see the follow-ups.
  - **The head sits outside the article grid.** It was put there for a
    silhouette that had to weld to the page edge, and it is kept because the
    head reads as the notice's own block — headline, standfirst and date across
    the content width, the copy below in the article's column.
  - **The measure is capped below 1000px and deliberately not above it.** Below
    1000px the article grid collapses and the column takes the whole page: at
    999px the notice ran 112 characters to the line against 74 one pixel
    earlier, so the block is held to the desk's own 780px. Above ~1500px the
    column is capped at the prose measure while the rail stays welded to the
    right gutter, so the gap between them grows with the window — 510px at 1920
    — and that is left alone. Capping the block closed the gap and opened a
    worse one: the rail left the page gutter, which is the one thing
    `.article__rail` promises, and this page alone stopped matching the four
    insight pages on the same grid. If it is ever
    worth solving it is worth solving for the article layout as a whole.
  - **The standfirst is `privacy.lede` in `src/i18n`, not the body's first
    paragraph.** It is the sentence that says what the document is; as the first
    block of the body it read as one paragraph of twenty-one and, below 1000px,
    arrived after the index of the thing it summarises.
  - **Below 1000px the index goes above the notice** in two columns, and the
    body ends on a "Terug naar de inhoud ↑" link: down there the index scrolls
    away with the first clause a reader jumps to, and there is nothing else on
    the site to get back to it with. On a desk the rail is sticky and the link
    is hidden.
  The copy carries one authored href that is not a URL: `clause:NN` is the NNth
  clause of the notice, resolved in `privacy.mjs` from the same derivation the
  index is built from, so a cross-reference ("zie hieronder", useless to a reader
  who arrived at that clause from the index) is a link without a hand-kept
  anchor. An ordinal with no clause behind it fails the build. Both ways to reach
  a person in the body are links too, and the number is `white-space: nowrap`
  (`.prose a[href^="tel:"]`) for the reason every fact in the footer's legal
  microline is: four ordinary spaces make a phone number five words to a line
  breaker, and it broke across two lines at an English tablet, a French phone and
  a Dutch laptop. `PHONE_HREF` is repeated in `body.mjs` rather than imported
  from `contact-form.mjs`, which imports the privacy page back and would close a
  cycle.
  Three things say where the reader is. `scroll-padding-top` went from the
  header's own height and nothing more (2px of clearance at 1180px, 4 at the
  tablet's 72px row) to 96px on the desk and 108 on the tablet, so a clause
  lands with air under the bar. `.prose__heading:target` takes the pull quote's
  cyan rule stood back up, which answers the click. And
  `components/clause-index/clause-index.js` — `<sa-clause-index>`, wrapping the
  list, lazily loaded like every other component — puts `aria-current="location"`
  on the row whose clause the reader is in, which answers the scrolling that
  follows. All three degrade to eight working links. The component's one real
  trap is the foot of the document: the last clauses of a long notice never
  cross the line, because the page runs out of scroll before they reach it, so
  on a 1440x900 desk the index said "Cookies" to a reader looking straight at
  "Uw rechten" — and said it to anyone who pressed those rows too, which is an
  index lying about the row just pressed. At the floor the hash decides if there
  is one *and its heading is still on screen*, and the last heading on screen
  decides otherwise; a `hashchange` listener catches a press that moves no
  pixels. The "still on screen" half is not belt and braces: a hash outlives the
  press that set it, so honoured unconditionally the mark travelled backwards —
  press clause five, read on to the end, and at the floor it jumped back to a
  heading 376px above the top of the screen.
  **The spy owns both marks, and paper owns neither.** `:target` and the row's
  `aria-current` are the same 2px cyan rule with different lifetimes — one set
  by the last hash, one tracking the scroll — so left alone they name different
  clauses in the same viewport: click a row, scroll back 200px, and the rail
  marks one clause while the copy marks another 300px away. The component stamps
  `data-clause-spy` on the root and the stylesheet stands `:target` down under
  it, which leaves `:target` as the no-JS half and as the only mark the four
  insight pages have. Both are reset in `@media print`: they are screen state
  that outlives the gesture that set it, so whichever was live when Print was
  pressed came out on the PDF as a stray rule in the margin and a contents list
  with seven grey rows and one black one — two people printing the same legal
  notice getting two different documents.
  The **Cookies clause** is the one place this page has been factually wrong:
  two drafts said the site sets no cookies at all, and `functions/secured/login.js`
  sets `export_session` for seven days on `/secured/`. The clause is scoped to
  the public pages now and names that one — as is `privacy.description`, the
  page's own search snippet, which is the last summary of the clause left
  anywhere: the homepage FAQ said it a third time and went with the block. On a
  page whose whole posture is that every claim is read off the code, an absolute
  has to be checked against the
  whole repo and not just `src/`. It is also the only page with no contact section — a notice that
