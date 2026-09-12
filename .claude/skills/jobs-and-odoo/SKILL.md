---
name: jobs-and-odoo
description: "Use this skill whenever you touch the jobs page or the Odoo vacancy integration: src/pages/jobs.mjs, build/lib/odoo-jobs.mjs, the committed snapshot in src/content/jobs/, `npm run sync:jobs`, the ODOO_LOGIN / ODOO_API_KEY build variables, or the Cloudflare deploy hook that fires when a vacancy changes. Covers the three sources the build reads and why it never fails on any of them, the language fallback rules, what may and may not be rewritten from Odoo, why the page has no contact section and no JobPosting in the graph, and the hero silhouette's own constraints. Read it before changing anything about a vacancy, its source or its page."
---

# The jobs page and Odoo

Moved out of the root `CLAUDE.md` so it loads only when jobs or Odoo work
happens.

## The deploy hook

- **A deploy hook is what makes Odoo's vacancies arrive.** The jobs page is
  rendered at build time, so a job published in Odoo reaches the site on the
  next build and not before. The hook is a Cloudflare Pages URL (Settings →
  Builds & deployments → Deploy hooks, on `main`) pasted into an Odoo automation
  rule on `hr.job` that fires on create, write and unlink — publishing or
  closing a vacancy then triggers a deploy within a minute or two. The URL is a
  build trigger and nothing else: anyone holding it can start a deploy of what
  is already on `main`, so it lives in Odoo and in the password manager, not in
  this repo. Nothing breaks without it; the list simply updates on the next
  ordinary push.
  It is wired up now, and it took three pieces rather than one. The hook is
  named **`odoo-hr-job`** on `main`. `base_automation` ("Automation Rules") had
  to be **installed** in the database first — it is not on by default on Odoo
  Online, and its absence is why this sat as a written plan for a while. And a
  trigger cannot cover deletion and saving at once, so there are **two** rules
  on `hr.job`, `Deploy website on vacancy change` (On create and edit) and
  `Deploy website on vacancy deletion` (On deletion), each holding one
  `Send Webhook Notification` action. Neither carries a trigger-field filter:
  any write to a vacancy redeploys, which is right when the page prints the
  title, the description and the location as well as the published flag.

## Odoo owns the vacancy list

- **Odoo owns the vacancy list, and the build reads it.** `hr.job` on
  `smartagents.odoo.com` is the source of truth for what is open;
  `build/lib/odoo-jobs.mjs` reads every published job in all three languages
  while the site renders, and `src/pages/jobs.mjs` prints whatever came back.
  Nothing about a vacancy is authored in this repo — the chrome around the list
  is (`jobs.vacancies.title`, `jobs.vacancies.empty`, `jobs.cta.apply`), the
  vacancy is not. The one thing this repo adds is a reviewed correction layer
  keyed on exact sentences, described below. Each row's action goes to that job's own Odoo application
  form, which is the point of the integration: an applicant lands in Recruitment
  with a stage and a file rather than in the contact webhook.
  - **Three sources, and the build never fails on any of them.** The external
    API when `ODOO_LOGIN` and `ODOO_API_KEY` are set; the public `/jobs` page
    when they are not; the committed snapshot in `src/content/jobs/` when
    neither answers or when what answered does not look like a job list. Each
    fallback is announced in the build log rather than taken silently. The rule
    behind the order: a stale vacancy on the site is recoverable, and a red
    build on `main` is the site not deploying at all.
  - **The live read is bounded twice: per request and overall.** `TIMEOUT_MS` is
    eight seconds on one socket and `BUDGET_MS` is twenty across the whole
    attempt chain, because the chain is an authenticate, a language read, one
    read per Odoo language and then the public path's own reads — every one of
    which could sit at the full eight seconds, so a recruitment site that was up
    but crawling held a deploy for the better part of a minute before falling
    back to a snapshot that is committed in this repository. The per-language
    reads also run in parallel rather than one after another. Twenty seconds is
    the answer to "how long is a third party worth waiting for when the fallback
    is on disk".
  - **The public-page reader knows when it has been broken.** Odoo prints its
    own result count in the search bar, so "nothing is published" and "the theme
    changed and every selector missed" — the same zero otherwise — are told
    apart: a page that reports jobs and yields none throws, and the snapshot
    takes over. That is the check that makes a credential-free read safe to
    ship; without it a SaaS upgrade would empty the page quietly.
  - **No HTML from Odoo is passed through.** The job description is authored in
    a rich-text editor by someone who is not thinking about this site's markup,
    so it is reduced to lines of text — `<br>`, `</p>` and `</li>` end a line,
    everything else is stripped, entities are decoded once — and the `html` tag
    escapes them on the way out.
  - **The location is printed exactly as Odoo prints it**, city and country, and
    both sources are made to produce the identical string — the public page
    reads the two `PostalAddress` fields, the API reads `city` and `country_id`
    off the partner and joins them the same way, so a vacancy cannot change its
    location text because a build fell back from one source to the other. Odoo
    returns the country in the recruitment site's own language rather than the
    reader's, so a raw read says "Beringen, Belgium" in every language. Today
    the page prints no location at all; the field is read, normalised and kept
    in the snapshot so it is there the day a row wants it. What the build
    changes on its own is form, not substance: a description authored as dashed
    lines becomes a real list, because the alternative is a dash inside a
    bullet.
  - **A reviewed correction layer sits between Odoo and the page, keyed on
    exact sentences.** `build/lib/job-copy.mjs` runs
    `src/content/jobs/editorial-copy.json` over every read — API, public page
    or snapshot. An entry names a job by slug and, per point, the exact source
    sentences it may replace (`sources`) and the reviewed Dutch, English and
    French to print instead; a location string is mapped the same way. This is
    what fixes the typo in the current description and puts "België" in the
    Dutch snapshot, and it is also how a Dutch vacancy gets an English and a
    French rendering while `en_US` is the only active language on the
    recruitment site. Three rules keep Odoo in charge. A sentence that matches
    no `sources` entry passes through untouched, so an edit made in Odoo wins
    over the correction the moment it is made. A closed vacancy is gone
    whatever the file says, because the file only rewrites rows that came back.
    And the corrected sentence is itself listed under `sources`, so a snapshot
    written after the layer ran — every snapshot is, see `sync:jobs` — still
    matches on the next offline read. Add an entry only for a sentence a human
    has reviewed, and never a translation with no Dutch source to match.
  - **English is the fallback language, and only *active* Odoo languages may be
    asked for.** Each site language names the Odoo languages that would serve it
    best first (`nl_BE` then `nl_NL`, `fr_BE` then `fr_FR`) and falls back to
    `en_US` when Odoo has none of them. That is not a stylistic preference: an
    inactive language code is an error from Odoo — `Invalid language code:
    nl_BE`, which is exactly how this was found — and not a soft fallback, so
    the API path reads `res.lang` first and only asks for codes the database
    accepts. English is the right fallback because Odoo stores a translatable
    field's source value under `en_US` and serves it for anything untranslated,
    so naming it here matches what Odoo would do anyway instead of layering a
    second, different answer on top.
    Today `en_US` is the only active language on the recruitment site, so all
    three site languages resolve to it, the list is fetched once rather than
    three times, and the Dutch job text typed under an English UI is what all
    three pages print. **Activating `nl_BE` and `fr_BE` in Odoo** (Settings →
    Translations → Languages) is the whole of what it takes for translated
    vacancies to appear here — no change to this repo.
  - **The API key never reaches a browser, and that is enforced.** It is read
    from the environment by the build, used for one call from the build
    container, and what ships is the job text. `check-dist.mjs` §7 fails the
    build if the value of `ODOO_API_KEY` — or of any other build secret — is
    found in any file in `dist/`, and it prints the variable's name, never its
    value. This is the reason the integration is a build-time read rather than a
    fetch from the page: in the browser the same key would need a Function in
    front of it to stay hidden, and the vacancies would leave the pre-rendered
    HTML that every crawler reads.

## The page itself

- **The jobs page is the one page written to a candidate, and that is the only
  thing new about it.** `src/pages/jobs.mjs` is four blocks — the hero, the open
  vacancies, what the job is like around the work, the form — ported from the
  client's live `/jobs/`. Everything it is made of already existed: the shared
  AI staffing page's `<sa-accordion>` for the vacancies and the plain hairline
  `.rows` list under it. The hero is the exception, and it is the only thing on
  the page that is drawn rather than reused. Five things are worth knowing.
  - **It was the first page written in `je`, and it is no longer the only
    one.** The design README's content rule used to be formal `u`; this page
    broke it first, because it is read by someone deciding whether to apply and
    the client's own jobs copy — which this page is ported from — is `je`
    throughout. The rest of the Dutch site has since followed, so nothing here
    is a local voice any more. French stays `vous`: it has no register that
    reads as friendly and professional at once.
  - **The open vacancy's panel has rules of its own**, which the staffing
    page's tracks did not need: a track carries two capped paragraphs, a vacancy
    carries Odoo's description as a list of lines and then the action. Both took
    the panel's full 1150px — about 150 characters to the line — and the button
    sat flush against the last bullet, so the page's one conversion point read as
    part of the sentence above it. `.track__points` takes the track body's own
    80ch and `.track__actions` puts the panel's rhythm before the button.
  - **The vacancies come from Odoo** (see the entry above); the page owns only
    the chrome around them and the empty state for when nothing is published.
    **There is no contact section**, which makes this and the privacy notice the
    only public pages without one, and it is deliberate: applying happens on the
    vacancy, in Odoo, where a candidate lands in Recruitment with a stage and a
    file. A second form underneath posting to the sales webhook would be the
    same person arriving in the wrong system by picking the wrong box. A
    candidate who fits nothing currently open is answered the same way — by a
    published `hr.job` for an open application, which arrives here as an
    ordinary row with an ordinary apply form, so Odoo stays the only owner.
    The hero therefore carries one action where every other page carries two:
    the only place it can honestly send a reader is the list.
    There is deliberately no `JobPosting` in the graph: Google's needs a
    `datePosted` and a `validThrough`, the page prints neither, and `schema.mjs`
    opens on the rule that nothing in the graph may say something the page does
    not. Odoo already publishes each job at its own indexable URL, which is the
    canonical place for that markup.
  - **The hero's shape is welded to nothing, and it is the only one on the
    public site that is.** `jobsJoin` floats in the right flank with paper on all
    four sides: two lobes running together, the small one upper-left and the
    large one lower-right, with a concave fillet either side of the neck.
    It got there by elimination. Five heroes hang a shape off the right flank
    and by the sixth that is a template rather than a composition, so this one
    was hung off the header's hairline instead — for four drafts. Every one read
    as a form growing out of the navigation rather than as a shape: a wide flat
    weld with a hard corner at each end is an open mega-menu panel; narrow it and
    the flanks splay downward into the caret of one; centre the lobe on the line
    so the outline leaves it vertically and the drawing is finally sound, but it
    is still a stem out of the bar. The argument for not being a sixth flank
    shape was right; the conclusion was not. The licence for floating is that the
    site already does it at small scale — `heroPebbleA` and `heroPebbleB` "hang
    from nothing" beside the staffing arch — and this is that at hero scale.
    **Being free is what let it close.** Welded, the outline ran corner to corner
    along the top edge and that edge closed it, so the silhouette carried two
    corners and half the union's contour was simply cut off. Free, the trace is
    the whole loop with no corner anywhere in it — the metaball union
    `src/motion.js` draws when the cursor runs two dark shapes together, standing
    still. The page about joining opens on a join, and now on the whole of one.
    **It is traced, not drawn.** The lobes are (0.28, 0.26) r 0.16 x 0.184 and
    (0.72, 0.68) r 0.32 x 0.256 turned -25°, taken at the 1 contour and
    resampled at even arc length into sixteen anchors. Redrawing it means moving
    the lobes and tracing again, never editing an anchor. Four numbers hold it,
    and each was measured off a render rather than chosen:
    **solidity 0.82** (the outline's area over its convex hull's) is the test,
    because it is the one thing that catches the failure every earlier draft
    shared — a blob with no waist measures 1.00, and a row-by-row width scan
    cannot catch it when the waist is *diagonal*; one welded draft measured
    convex along its entire right flank at every viewport width, which is a light
    bulb on the page that is meant to be a join. **The neck is 0.174 of the box**
    at 0.32 along the axis between the lobe centres. **The lower lobe is an
    ellipse turned -25°** — axis-aligned it fits a circle to within a pixel over
    three hundred scan rows, and a true disc at 70% of the ink is the bullet
    `clipDefs()` already refuses in a 90px pebble. And **the offset is
    diagonal**: two lobes stacked square are a vase at every pinch from 0.18 to
    0.30, and a hand-drawn four-beat profile is a chess pawn. Both were drawn.
    What they share is symmetry about a vertical axis, and that is the rule they
    were hiding — a shape reads as furniture the moment its two flanks answer
    each other.
    **There are three shapes, and the cursor decides how many.** Two smaller ones
    drift in the pockets the diagonal leaves — `heroPebbleB` off the upper lobe's
    outer flank, `heroPebbleA` under it in the lower left — resting 37 to 68px
    off the main outline against the 60px a join closes at, so at rest a reader
    sees three shapes and a cursor brought into a gap runs them together into one
    fluid. It is the training hero's bead, twice: the same two silhouettes the
    staffing arch has shed, reused rather than redrawn. `heroPebbleA` is now
    shared by three compositions — change it for one and the other two move.
    Both are printed only where a join can happen (`.hero__drift` in main.css
    carries the negative of the gates `src/motion.js` arms the magnets on), and
    their sigma is struck from their own perimeter, not copied off the main
    shape's.
    **A drifting shape may not be parked in the mouth of the main shape's own
    concave notch.** Drawn first at `left: 46%` the upper one sat in the opening
    between the two lobes, so the bridge formed across that opening, sealed the
    notch into an enclosed lens of paper, and the traced union stair-stepped
    visibly down the neck — marching squares carrying a stretch of contour the
    authored outline should have kept. At 49% the bridge lands on the lobe's
    outer flank, the notch stays open, and the merge is as smooth as the training
    hero's. Paper islands are legal (`src/motion.js` winds them so the nonzero
    rule paints them as paper); one that appears because a shape was parked in a
    concavity is an accident.
        The pull is well under the petal's (amplitude 52 against 86) with the sigma a
    little over it (104 against 96), and the neck sets both: driving the pointer
    into the lower lobe's flank, 78 filled the neck in and closed the silhouette
    into one kidney. It is not a weaker pull than the site's — at a 16px cursor
    offset this outline travels 23px against the training petal's 16. There is no
    `data-magnet-pin` any more, because there is no edge to pin to.
    **One rule carries the box** in `main.css` under "Detail pages — jobs", where
    there were three bands of independent shares. All three were fighting the
    same thing — **the hero is 540px tall at every width from 621px to 2560 and
    the flank is not** — so a box struck as `inset` grows in one axis only: the
    drawn proportion ran 0.66 at 700px and 1.94 at 2560. Now `top` is a flat 48px
    of paper under the header, which is the whole difference between this and the
    drafts before it; the height is `min(max(35.6vw, 260px), 538px)` and the
    width is that times the traced loop's own 1.04 aspect, so the two cap
    together at 1513px and the drawing is never stretched. **The height cap is
    load-bearing and it arrived with the detachment**: welded, a shape could run
    past the hero's foot and read as continuing, but a floating one has to sit
    inside a band, and the band's floor is not the foot (invisible — `.hero` and
    the section under it paint the same `--surface-section`) but the section rule
    about 105px below it. Uncapped, a 1920 window put the shape 27px past that
    rule and on top of the vacancies block. The right edge is `--gutter-page`
    itself, so the lower lobe's tangent lands **on** the page's content edge —
    the vertical the section hairlines, the accordion below and the footer row
    all end on — rather than 27px inside it, which is near the strongest vertical
    on the page without meeting it. That only works because the path is fitted to
    its box after tracing: a cubic runs outside its own anchors, and an earlier
    draft drew 6px past the box that placed it, so every inset was measuring a
    shape that is not on screen. `vw` and not `%` throughout, because width and
    drop have to stay in a fixed ratio and the two disagree by about 1% when a
    scrollbar is present. Below 621px it joins the four other hero shapes in
    becoming the phone's sliver: a free shape needs a flank of paper to float in
    and a phone has none.
  - **It is in the nav bar, and it is the one item there that does not quite
    fit.** `jobs` is in `NAV_ITEMS` and in `BAR_ITEMS`, plus
    `site-footer-link-jobs` in the footer's row of destinations. Dutch and
    English had the free space for a seventh name; French did not, so between
    1181px and about 1240px the primary action there stands 31px inside the page
    gutter instead of on it. Nothing is clipped, nothing overlaps and the
    document does not scroll — the measurement, the band and the one lever that
    would pay it back (fold the bar at 1240px rather than 1180px) are in
    `.site-nav` in `critical.css`. The footer row it joins is still one line and
    the footer is still 111px at 1280 in all three languages.
  - **"Werken bij SmartAgents" describes the work, never the terms.** Three
    rows: what you build, who you build it with, what you learn. It briefly
    carried four others — a flat structure, a share in the company, remote-first
    and hours not counted — written from the old marketing page and confirmed by
    nobody, and they came out. Every one of those is a promise to a candidate
    about their own employment, which is the one kind of copy on this site that
    may not be inferred: it is confirmed by the people who would have to honour
    it, or it is not published. A row about the work itself does not need that
    signature, which is why the three that remain are all of that kind.
    `REASONS` in the page module is the list.
