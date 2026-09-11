---
name: motion-fields
description: "Use this skill whenever you touch a navy shape, a hero silhouette, the magnetic pull, a metaball join, the orbit rings, the footer wedge or a button state on the SmartAgents public site: anything in src/motion.js, any clipDefs() path in src/layouts/base.mjs, any .field / .orbits / .hero__field / .btn rule in critical.css or main.css. Covers how the dark field works as one field, how two shapes run together under the cursor, how a magnet's box is struck and frozen, where a free shape may and may not stand, the orbit layer's fades and forced-colors rule, the footer's grid and legal microline, and the four button states. Read it before drawing, moving or retuning any shape."
---

# Motion, fields and shapes

Moved out of the root `CLAUDE.md` so it loads only when shape work happens.
Everything here is measured off a render rather than chosen; treat a number as
load-bearing unless it says otherwise.

## Hero silhouettes

- **The AI-native SDLC hero is the ridge plus two orbs in the bay its neck
  opens.** The ridge is unchanged — a short shoulder high up, a neck pulled back
  almost to the page edge where the headline passes, one long lobe below it,
  narrow once and open twice. What changed is that the page has something to do:
  it was the one detail page whose hero carried a single shape and no companion,
  so the brand's one moving part never fired on it, and the lower-left of the
  flank was a third of a screen of empty paper. The orbs rest 44 to 88px off the
  lobe's outer flank and 38 to 51px off each other, so the cursor runs any two
  together. They stand against **convex** stretches, never in the mouth of the
  neck's concavity, which is bridged across rather than into and seals the bay
  into an island.
  **The box was widened leftward to hold them and the ridge remapped into the
  right 0.786 of it**, so it draws exactly the pixels it drew before — verified
  to 1px. Holding that true takes one inset per band, because the shared
  `.hero__field--right` moves three times: the new left inset is
  `(L_old - 0.2143) / 0.7857`, so 56% becomes 44%, 62% 51.64%, 53% 40.18%. Change
  the shared rule and these have to be recomputed or the ridge stretches.
  **The orbs do not share that box, and this is the one hero where they cannot.**
  It is a share of the page width against a hero that is 540px tall at every
  width, so its aspect runs 1.2 at 1081 to 2.9 at 2560; the ridge stretches with
  it and reads as drawn either way, but an orb that stretches is a flat disc —
  at 2560 they came out half again as wide as tall. Each takes a square slot of
  its own, 1.7 times the orb across so its grown box still contains the join
  window between the two of them. At 1.0 it fell 10px short and the union was
  cut.

- **The AI-native businessprocessen hero is four separate orbs, and the
  cursor runs them together.** They sit on a descending line, growing left to
  right, each within reach of the next; bring the pointer into either gap and the
  two either side of it merge into one fluid. It replaced `processHero`, a
  shoulder-wall-step-sweep terrace hung off the right page edge, and the argument
  is the page's own headline rather than the drawing: "Van uw taken naar
  herbruikbare workflows" is separate pieces becoming one thing.
  **All three share one box** — the whole composition — with each drawing
  authored into a corner of it, so every blob can host a join (see the join-box
  bullet above). Nothing is positioned in CSS: moving a blob means remapping its
  path into a different sub-rectangle.
  **Four orbs, and every adjacent pair merges.** Getting there took the rim fade
  in `src/motion.js` (see the join bullet above), not a rearrangement: before it,
  a third orb standing inside a merging pair's window margin pushed their union
  out to the rim and it came back as a ledge, so this hero could only hold three
  orbs with one merging pair and a 150px cordon around it. With the fade the
  cordon is gone and the spacing is a composition again.
  It must not be the same picture as the jobs hero, because the two sit next to
  each other in the nav — that is the rule that made `processHero` carry a
  straight line in the first place, since the round draft it replaced measured as
  the same shape as the AI-native SDLC ridge. The distinction is carried
  differently now: `jobsJoin` is one drawn silhouette with satellites in its
  pockets, and this is three shapes and no silhouette at all.
  Unlike the jobs satellites these are **not** gated on the join being available.
  A satellite exists *for* the join and is a dark spot on the paper without one;
  three shapes in a line are the composition either way, so they stay on a coarse
  pointer and under `prefers-reduced-motion`, and only the phone drops them.


## The footer

- **The footer is paper, and about 110px of it.** It was a dark band carrying a
  full `sa-node-field` and three stacked columns of micro type, which spent a
  screen of navy under every page in the site on the one block nobody scrolls
  down wanting. It is two rows on a hairline now, 111px from about 850px up: the two
  ways to reach a person, Inzichten, Jobs and LinkedIn on the first, and on the second the WER/WVV disclosure as a single
  11.5px microline with the privacy notice and the copyright opposite it. What
  is left of the dark field is `.footer-mark`, a small wedge in the bottom-left
  corner holding the logo — the header's wedge turned over, so the page opens
  and closes on the same shape. It carries no node field: the header masks its
  own into the 100px tail past the wordmark, and this wedge's tail is 46px on a
  desk, which is a flat navy plate rather than a window onto anything. Its cut
  follows the header's, which moves four times: the row grows at 1180px, which
  shallows the slope the header draws without changing its cut; the cut itself
  changes at 1000px and again at 767px; and the wedge's own height drops with
  the stack at 800px, which shallows what the same run draws. There is a rule
  for each, and the run is stated in pixels rather than as a share of the wedge,
  because it is the header's run that has to be matched and the two boxes are
  different widths. Measure both boxes before touching it: two drafts of this
  got the premise wrong, one leaving a 180px band and one leaving the phone. Five things are
  load-bearing.
  - **The base row is a grid, and that is what keeps the wedge in the corner.**
    Flex breaks a line on what its items *want* to be — their max-content size —
    before it lets any of them shrink, so the link group pushed itself onto a
    line of its own below the wedge and left the wedge floating in the middle of
    the block. Three tracks (`auto minmax(0, 1fr) auto`) cannot wrap.
  - **The row keeps no block padding**, so its bottom edge is the page's and the
    wedge can reach it. What holds type off that edge is padding on the type.
    The row above it does carry padding, because it wraps on a phone.
  - **The microline's separator is the gap and never a character.** Each fact is
    `white-space: nowrap`, so a break falls only between two facts. The `·` the
    facts used to carry put the break opportunity behind the dot and stranded
    one at the end of every wrapped line.
  - **The disclosure is at its legal minimum, and that is what buys the single
    line.** Art. 2:20 WVV asks for the name, the legal form, the precise seat,
    the enterprise number and "RPR" followed by the *seat of the court*; art.
    III.74 WER puts the enterprise number on every website of a registered
    entity; art. XII.6 WER adds the VAT identification and an e-mail address.
    Four facts carry all of it. "Besloten vennootschap" went because "BV" is
    what it abbreviates and 2:20 takes the abbreviation, and the court's full
    name went because the statute asks only for its seat. One label does double
    duty: the enterprise number and the VAT number are the same identifier in
    Belgium, so `footer.vat` answers III.74 and XII.6 in one string. 1131px of
    type became 727, which is one line from 1261px up in Dutch, 1248 in French
    and 1230 in English, instead of two everywhere below 1780. **The Dutch line
    clears 1280 by 18px**, and it is measured in the platform face because no
    Geist binary is shipped — supplying Geist, or adding a fact, or touching
    this row's gaps, means measuring it again.
  - **800px is where the base row changes shape**, and it is a height threshold
    rather than a line-count one. Stacking does not buy a single line back —
    the widest full-width row below 800 is 720px against 781 of type — it buys
    a two-line block that is wide instead of one that is narrow, and it costs
    about 40px of footer. Above the threshold the block beside the wedge is
    shorter; below it the column would stop fitting two facts to a line and the
    facts would land one per line, which is what the stack exists to prevent.

## Buttons

- **An action changes colour and never moves.** The primary button is
  "Diepzee", `--sa-deep` — the accent turned down until white type sits on it
  — and its four states are four fills: rest, hover, pressed, withdrawn. It
  used to be ink that rose 2px and threw a shadow on hover, which is a card
  idiom borrowed by a button, and it left the one genuinely pressable control
  on the page with nowhere to go when it was actually pressed. `--lift`,
  `--shadow-lift` and `--shadow-lift-dark` went with it; only `/secured/`, which
  keeps its own token file, still has them. The relief is `--shadow-action`, an
  inset hairline along the top edge, reversed into `--shadow-action-press`.
  Three things are load-bearing, all in the buttons block in `critical.css`.
  - **The state order in the stylesheet is the cascade.** Five rules of equal
    specificity — hover, focus, active, disabled — so which one wins is which
    one is written last. Pressed beats the focus ring on purpose (while a key
    is held, the press is what the reader is causing) and disabled beats
    everything.
  - **The focus ring is `--sa-cyan-ring` at 0.8, and both design canvases say
    about a third.** A ring drawn flush against a fill has two edges and has to
    clear 3:1 on both; at 0.32 it measures 1.56:1 against the paper, fainter
    than the 2px outline it replaces. 0.8 is the band that clears both sides at
    once — 3.37:1 outward, 3.42:1 against `--sa-deep` — so it is a ceiling as
    well as a floor, with 0.75 (3.10 and 3.72) the floor. It is the only value
    in the buttons taken off the canvas rather than from it.
  - **The ring is a box-shadow, so a forced palette has none.** `.btn` gives up
    the site's offset outline to draw it, and the `forced-colors` rule at the
    foot of the block is what hands the outline back. It is in the critical
    sheet, not in the forced-colours block at the foot of `main.css`: that block
    is for decoration being dropped, and a focus ring arriving with `main.css`
    arrives after the first Tab. The same block now also hands the burger's two
    bars back: they are painted backgrounds on a 1.5px box, a forced palette
    forces a background to the Canvas family, and the phone's only way into the
    navigation had no icon in it at all. Drawn as a border it survives.
  - **`.btn--ondark` is gone, and with it `--action-ondark-*`.** It was the
    button on the dark field, and the dark field has carried no buttons since the
    navy bands the redesign replaced: zero usages across the 60 rendered pages,
    four rules and four tokens inlined into every `<head>` on the site. The one
    thing worth keeping is the argument, so it is written here — that button
    keeps the site's offset outline rather than the flush ring, because a ring
    drawn against `#00d8ff` has two edges to clear 3:1 on and nothing clears both
    it and the navy behind it.
  The withdrawn state is `aria-disabled`, not `disabled`: `contact-form.js`
  marks the submit while a message is in flight and a disabled button would
  drop the focus ring and stop being announced at the moment there is something
  to announce. What refuses the second click is the `busy` guard at the top of
  `submit()`, which was always the half doing the work.

## The dark field and the join

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
- **A join is painted into a box, and that is what decides where a free shape
  may stand.** `src/motion.js` grows every magnet's box by `BLEED` — 140px on
  each side — and the traced union has to fit inside the grown box of whichever
  shape carries it. Outside that box there is nothing painted for the clip path
  to reveal, so the union is cut off along the box's edge and what renders is a
  shape with a straight chord sliced out of it. It looks like a join artefact and
  it is not: it is the element's own paint box showing.
  Three consequences for any composition of free shapes. **Give every shape a box
  big enough to host.** The fix is not to move the shapes: it is to draw the box
  around the whole composition and author the silhouette into a corner of it, so
  whichever shape the pass picks can hold what it draws. That is what the three
  blobs of the AI-native businessprocessen hero do — one box, three paths, no
  positioning in CSS at all — and it is what let them join each other after three
  drafts that could not. **The lift has to fade to nothing at the window's rim, and it is
  now made to.** A join is traced in a window struck around the pair plus about
  150px of margin (`SPREAD * k`), and the pass cancels what every *other* shape
  adds by subtracting a constant `floor` — which only holds if all of them are at
  least `spread` away. A third shape standing nearer than that was still lifting
  the contour at the rim, where the field is clamped to `-band` and marching
  squares closes the loop along a straight line: a ledge across the far side of
  whichever shape the rim crossed. Measured on the AI-native businessprocessen
  hero before the fix: 47px of ledge with the third orb 40px away, 17px at 100px,
  3px at 194px — and worse as the viewport narrowed, because the margin is in
  screen pixels while a composition is in `vw`. `src/motion.js` now fades the
  lift out over the outer half of the margin, so it is full strength across the
  middle of the window — the gap, both facing edges and the waist the join is
  made of — and zero by the rim, where `sum` is the nearest shape's term alone
  and the contour is its own outline. The rim has nothing left to cut, and a
  chain of shapes can merge along its whole length. **A shape still has to be
  bigger than `MERGE`** (46px): one only a little larger leaves no room for a
  union to be traced around it and comes out with a spike.
  **Two magnets on one page may not share a `data-clip`.** `src/motion.js`
  resolves the outline with `getElementById` and rewrites that single path in
  place, so the second remap wins and the first shape is left drawn into the
  wrong box. It shows up as spacing that will not come out even however the boxes
  are moved. `PEBBLE_A` and `PEBBLE_B` in `base.mjs` are how several ids carry
  two drawings without the path data being copied. **And a free shape may not be parked in the mouth of the
  main outline's concave notch**: the bridge then forms across the opening rather
  than against a flank, seals the notch into an enclosed lens of paper, and the
  trace stair-steps where marching squares carries contour the authored outline
  should have kept. Both heroes hit this, and both were fixed by moving the shape
  onto a convex stretch.


## Magnets

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

## The staffing arch and the training bead

- **The AI staffing page's hero is an arch and two pebbles.** `heroArch` is hung
  off the right edge and `heroPebbleA`/`heroPebbleB` are positioned inside the
  arch's own box, so the three move as one and the page overrides only that box.
  The box hangs 14% past the hero's foot: the arch's tail runs on into the
  section below and passes behind the track panel there, which is the whole
  reason that panel is opaque. The pebbles hang from nothing and they are
  dropped from the tablet down, where the shared `.hero__field--right` carries
  the arch alone and the phone turns it into the same sliver the petal becomes.
  The arch went through two drafts that both failed the same way: a diagonal
  struck corner to corner with a shallow bow read as a black triangle, and the
  cove that replaced it filled the whole corner and needed a second silhouette
  in the opposite one to balance it.
- **The training hero carries a bead of the same field above the petal, and it
  is there for the join.** `.hero__bead` in `main.css` is a slot inside
  `.hero__field--right` holding one more `.field` on `heroPebbleA` — the
  staffing page's larger pebble, now a shared silhouette rather than that
  page's own. It stands 41px off the petal's drawn flank at 1081, 50 at 1440
  and 61 at 2560, against the 60px a join closes at (`2·MERGE·ln2·ONSET` in
  `src/motion.js`, measured on the *displaced* outlines), so a cursor brought
  into the gap runs the two together into one fluid and at rest they are two
  shapes. Three things are load-bearing. The box is on the **slot** and not on
  the field, with a floor under its width: a box struck as a share of a hero
  that is 540px tall at every desk width and as wide as the window keeps its
  height and stretches without limit — the pebbles run 1.20 to 2.15 in aspect
  between 1440 and 2560 and by 2560 they have closed on the arch and on each
  other — and a bead is a pill at one end of that and a disc at the other, which
  is the bullet `clipDefs()` says the silhouette was drawn off-round to avoid.
  The band it stands in is 185px deep at 1081 and that is what fixes its height:
  26px of paper under the header, the 118px box, then the gap — re-measured
  whenever the width floor moves, because a wider bead meets a higher part of
  the flank. And it is **printed only where
  a join can happen** — the media query is the negative of the gates
  `src/motion.js` arms the magnets on, so a coarse pointer and
  `prefers-reduced-motion` drop it as well as a narrow window. What CSS cannot
  reach is JS that never runs, which is the one state where it is a dark spot on
  the paper with nothing to have come away from. That trade, and the licence for
  a free-floating shape beside a flank welded on one edge rather than three, are
  argued in "Deviations from the design doc", item 13, in the
  `smartagents-design` README.

## The orbit layer

- **The orbit layer fades out over its last 44px on each flank.** The layer is
  wider than the page in every direction the rings need and `overflow: hidden`
  is what keeps that off the document — but a hard clip cannot end a travelling
  node gracefully. A node is a 4–5px dot whose opacity is keyed to the rotation
  and nothing else, so on every layer struck near or past a page edge (the
  insights list's origin is at 104%) it is lit for part of the turn it spends
  outside the layer, and a lit dot crossing a hard clip is drawn as a sliver of
  itself: measured on the homepage, `home-insights-orbit-02` stood 4px past the
  right edge with 1px showing — a grey speck on the page gutter above the
  "Inzichten" heading, which reads as dirt on the screen. The mask is horizontal
  only: no node on the site reaches the top or bottom edge lit, and a vertical
  fade would pull the rings off the header's hairline, where an arc stopping
  under the bar reads as an arc going behind it. `.orbits--notice` declares its
  own mask (the 200px fade at its foot) and therefore has to restate this one
  beside it, intersected.
- **The orbit rings are hidden under `forced-colors: active`, site-wide.** A
  forced palette substitutes a system colour for every border and drops the
  alpha with it, so five hairlines drawn at 5–11% precisely to sit under the
  type came back as `CanvasText` at the layer's full 0.8 — ground designed to be
  barely there rendering as the strongest line on the screen, through the
  reading column. A decoration has no weight it can be given in a palette it
  does not choose, so it goes, the way `@media print` already drops it.
  `.cycle__phase` on the AI-native SDLC page is the other half of the same
  thought: that figure carries meaning, so a forced palette gets a border it can
  keep instead — and `.legend__mark`, the key under that figure, is the same case
  one step on: two painted swatches that came back as invisible rectangles beside
  two labels, so they take the border their phases take, at the same weight. This
  entry was written before the rule existed and described the intention rather
  than the code; the `.orbits` rule is in `critical.css` now, not in main.css,
  because rings that arrive unhidden until the stylesheet lands flash across the
  copy on every first paint. The privacy notice is only where this landed hardest — a sticky
  origin puts the same arcs on every screen of a 2820px document rather than
  behind one hero — but the rule is not scoped to it, because no orbit set on
  the site means anything.
