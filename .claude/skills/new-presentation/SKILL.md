---
name: new-presentation
description: "Use this skill whenever a SmartAgents presentation, deck, pitch or slide is being created, extended or restyled: a new deck under /secured/presentations/, a slide added to an existing one, or a request to bring an older deck onto the redesigned brand. Covers the deck pipeline (deck.json plus slide fragments), the eight slide archetypes drawn on the Slide Template canvas, the shared slide vocabulary in shared/slide.css, and the rules that keep a deck reading as SmartAgents rather than as a stack of cards."
---

# SmartAgents presentations

A deck is a folder. `build/lib/decks.mjs` discovers it, `src/layouts/deck.mjs` wraps it,
`<deck-stage>` presents it, and `npm run export:pdfs` prints it. Adding a deck means adding
the folder; nothing has to be told about it.

Every deck lands under `/secured/presentations/<slug>/`, behind the password gate. There is
no public deck URL and no way to make one: a public page cannot link into `/secured/`.

## 1. What a deck is made of

```
src/content/secured/presentations/<slug>/
  deck.json          the title, the stage size, the slide order
  deck.css           empty in seven of the ten decks; one figure in each of
                     the other three
  assets/
    logo.svg         cyan mark, for a slide on paper
    logo-dark.svg    bright mark. `chrome()` in build/lib/decks.mjs picks it
                     over logo.svg when the `<section>` itself carries `.field`,
                     which is what the retired whole-navy slides did and no
                     redesigned slide does. Ship it: the branch is live, and a
                     deck that ever takes it would otherwise 404 in the footer
  slides/
    00-cover.html
    01-<topic>.html
    ...
```

Copy `template/` from this skill directory as the starting point and rename the folder. It
is a complete eight-slide deck, one per archetype, with the copy replaced by placeholders
and `assets/` already filled: the two logos, two portraits and a blank frame for the media
slide. Copied verbatim it builds and it renders, so the first thing to do is look at the
deck you are about to write, and every placeholder you replace is one the build was already
happy with.

`deck.json`:

```json
{
  "title": "SmartAgents — <deck>",
  "description": "One sentence. It is the meta description and nothing else reads it.",
  "lang": "nl",
  "width": "1920",
  "height": "1080",
  "styles": ["../shared/slide.css"],
  "scripts": ["../shared/node-field.js"],
  "slides": ["00-cover", "01-...", "..."]
}
```

`lang` sets the document language and defaults to `nl` when omitted. Set it for a deck in
another language: it is what a screen reader and the browser's hyphenation read.

`styles` is the important line. `../shared/slide.css` is the whole visual system; without
it a slide renders as unstyled text. Every deck in the folder once carried a
1000-to-1700-line `deck.css` copied from the deck before it, which is the thing this
stylesheet exists to end; seven are empty now and the other three keep one figure each.
**Do not copy an old `deck.css` into a new deck**, and do not start one: reach for a shared
class, and if there isn't one, read §3 before you write a rule.

`scripts` carries `../shared/node-field.js`, which upgrades the `<sa-node-field>` inside the
cover's and the closing slide's dark shape into the live network. Leave the line out and
both shapes are still correct navy silhouettes, just still ones. Every deck in the folder
takes it.

A slide fragment is plain HTML, one `<section>`, no document around it:

```html
<!-- ════ 02 · WHAT THE SLIDE IS ════ -->
<section id="<slug>-slide-02" data-label="Label" class="slide slide--footed">
  <div id="<slug>-slide-02-inner" class="slide__inner">
    ...
  </div>
  <!--chrome 02/07-->
</section>
```

- `data-label` is the title in the thumbnail rail. Keep it to two or three words.
- `<!--chrome NN/TT-->` expands at build time to the footer: mark on the left, `02 / 07` on
  the right. A slide that carries it **must** carry `slide--footed`, which reserves the band
  it sits in. The cover and the closing slide carry neither, so **`TT` is two less than the
  number of entries in `slides`**, and `NN` runs 01 upward over the slides between them, not
  over the file names. Renumbering by hand after inserting a slide is the most common way a
  deck ships wrong; nothing in the build checks it.
- Read the `element-ids` skill: every element inside the section takes an id, scoped
  `<deck-slug>-slide-NN-<part>`.

## 2. The eight archetypes

Drawn on the `Slide Template` canvas in the SmartAgents Website design project. The markup
for each is one file in `template/slides/`; `reference/slides.md` covers the variations and
the geometry of the dark shape. This is what each archetype is for.

| Archetype | Class | Use it for | Limit |
|---|---|---|---|
| Cover | `slide--cover` | The opening. Title, one line, speaker and date. | One per deck |
| Rows | `.rows` | A list of parallel points, each with a one-line gloss. | 4 rows |
| Statement | `.statement` | One thought, set large. Slows the deck down. | Not two in a row |
| Compare | `.compare` | Now against next. The right column is the answer. | Equal-length lists |
| Steps | `.steps` | A progression with a direction. Cyan rule = reached. | 3 to 5 columns |
| Media | `.media` | A screenshot, video or photograph with words beside it. | Alternate the side |
| People | `.people` | Who is doing this. Portrait, name, role, one line. | 2 people |
| Close | `.close` | The question you leave in the room, plus contact. | Last slide |

Rows is the default and the rest are the reasons not to use it. **If two consecutive slides
would take the same archetype, change one of them.** A deck where every slide is a row list
reads as one long list.

**The head is pinned to the top; everything under it goes in `.slide__body`.** That wrapper
fills the rest of the slide and centres its content, so a sparse slide floats in the middle
of the paper instead of hanging off the heading. Never centre `.slide__inner` itself — that
drops the heading to the middle with it.

Two archetypes are their own body and take no wrapper: `.compare` and `.media` both grow to
fill the slide themselves, and nesting them in `.slide__body` centres a thing that is already
the full height. Rows, statement, steps and people all want the wrapper.

**A section divider is a statement with an eyebrow and no title.** A deck long enough to have
parts says so on a slide of its own: `.slide__eyebrow` names the part, `.statement` says what
it is about, `.statement__support` says what is in it. Three decks in the folder do this and
all three do it the same way. Do not invent a divider archetype; there isn't one.

## 3. The vocabulary

`shared/slide.css` is the complete list. A class not in that file does not exist; do not
invent a sibling. Sizes are absolute pixels against the 1920x1080 stage — never rem, vw or
clamp, which would measure against the browser window instead of the slide.

Structure: `.slide` · `.slide--footed` · `.slide__inner` · `.slide__body`
Head: `.rule` · `.slide__eyebrow` · `.slide__title` (`--sm`) · `.slide__lede` (`--sm`) · `.slide__note`
Rows: `.rows` (`--tight`) · `.row` · `.row__term` · `.row__detail`
Statement: `.statement` · `.statement__support`
Compare: `.compare` · `.compare__col` (`--then`) · `.compare__head` · `.compare__title` · `.compare__sub` · `.compare__list` · `.compare__item`
Steps: `.steps` (`--3`, `--5`) · `.step` (`--ahead`) · `.step__num` · `.step__title` · `.step__body`
Media: `.media` (`--flip`) · `.media__words` · `.media__frame` (`--fit`, `--audio`) · `.portraits`
People: `.people` · `.person` · `.person__photo` · `.person__text` · `.person__role` · `.person__name` · `.person__body` · `.person__meta`
Cover and close: `.slide__brand` · `.cover` · `.cover__title` · `.cover__sub` · `.cover__meta` · `.close` · `.close__title` · `.close__sub` · `.contact` · `.contact__end`
Wrap guard: `.nobreak`
Dark shape: `.field` · `.slide__shape` (`--petal`, `--lobe`) · `<sa-node-field>` · `.node` (`--lit`, `--dim`) · `.link`
Orbits: `.orbits` (`--close`) · `.orbits__origin` · `.orbits__ring--01…05` · `.orbits__path--01…03` · `.orbits__node`

Anything genuinely new goes in the deck's own `deck.css`, written with tokens rather than
literal values (`--sa-grey-3`, `--sa-line`, `--ls-h3`, `--fw-semibold`). If you find yourself
writing it twice across two decks, it belongs in `shared/slide.css` instead.

**Before you write a rule, grep `shared/slide.css` for what you are about to name.** Five
decks put the same two founders on a slide, and the classes for it were written three times
before anybody noticed; `.people` and `.portraits` are what is left of that, and §2 says
which of the two a slide wants.

Everything a deck still owns is listed here, so the list is checkable and so is its absence:

| Deck | Classes | Why it is not shared |
|---|---|---|
| `isabel-sdlc` | `.flow`, `.map`, `.weeks`, `.slide-notes` | Two diagrams, each drawn for one argument |
| `token-efficient-ai-development` | `.snips`, `.close__roles` | The only deck that shows code verbatim |
| `lease-lens-demo` | `.qr` | A QR code, on the one slide that hands out a URL |

That is the bar: a figure nothing else will ever want. A figure two decks want is shared
today, not after the second copy. Nothing in that column overrides a shared class either: a
deck that needs a shared class to behave differently gets a modifier in `shared/slide.css`
(`.cover__title--sm` is one) rather than a redefinition in its own file, or the deck stops
looking like the deck before it in exactly the way this stylesheet exists to prevent.

## 4. The five rules that carry the look

1. **Paper is the ground.** Slides are `--sa-paper`. The navy is a clipped shape on the
   cover and the closing slide and nowhere else. A whole slide painted navy is not a
   SmartAgents slide.
2. **One shape per slide, and it runs off an edge.** `--petal` hangs off the right, `--lobe`
   rises out of the bottom-left. A dark shape floating clear of every edge reads as a hole.
3. **Lists are hairline rows, never cards.** No boxes, no shadows, no fills behind a list
   item. This is the single most load-bearing decision in the system.
4. **Sentence case everywhere** — headings, labels, buttons, `data-label`. Never title case,
   never caps.
5. **Cyan is a rule and a mark, not a fill.** The 88x3 `.rule` opens a slide; a step's border
   says it has been reached; the wordmark's second half. Cyan never paints a panel.

Arrows are the character `→`. There are no icons; do not introduce an icon library.

## 5. Copy

Apply the `blog-style` guide to every line of slide copy. On top of it, four rules that are
specific to slides:

- **No em-dash (— or --) anywhere.** Use a comma, a colon, a full stop, or rewrite.
- **No exclamation marks.**
- **A slide holds one idea.** If the text will not fit, it is two slides, not a smaller font.
- **The closing slide ends on a concrete action**, never a sentiment.

Dutch by default, formal *u*, "we / ons / onze" for SmartAgents. A deck written in another
language keeps the same voice and the same four rules, and sets `lang` in `deck.json`.

Two things to watch in any language:

- **A hyphenated term will break across its hyphen** at 104px on a cover, and a projected
  line ending on "AI-" reads as a typo. Wrap the word, not the line around it, in `.nobreak`
  — which is in `shared/slide.css`, so do not redeclare it in a `deck.css`. Five decks did,
  and all five copies were identical and dead.
- **Height is the real limit.** Four rows only fit when each detail is one line, and a
  three-line lede above them will not. `.rows--tight` buys back the air between rows and
  carries four two-line details, but only on a slide with no lede. There is no warning when
  you exceed the height: the content simply runs over the footer. Open the deck and look.

  `--tight` is for four rows, and only for four. Half the tight slides in the folder have
  three rows, where the normal padding fits with room to spare and `.slide__body` centres
  the block anyway. That is drift, not a decision: reaching for it out of habit gives one
  deck's three-row slides a different rhythm from the next deck's.

## 6. Speaker notes

Optional. One JSON object keyed by slide index, placed once in the deck's first slide
fragment; `deck-stage.js` reads `#speaker-notes` and posts the active index to the host
window.

```html
<script type="application/json" id="speaker-notes">
{ "0": "Titelscherm. Noem de aanleiding.", "1": "Drie punten, niet vier." }
</script>
```

## 7. Finishing

```
npm run build          # renders, then check-dist.mjs gates it
npm run check:slides   # needs a current dist/ and Chrome; measures every slide
npm run dev            # serves dist/ on :8000; open /secured/presentations/<slug>/
npm run export:pdfs    # needs a current dist/; writes <slug>.pdf into the deck folder
```

`check:slides` is the one that catches the mistake this system is most prone to. The stage
is a fixed 1920x1080 box with `overflow: hidden`, so a slide with one line too many does not
warn, wrap or scroll: the surplus is simply not painted, and you find out in the room. The
script opens each deck in headless Chrome and measures every slide, which takes about twenty
seconds for all ten decks. Pass a slug to do one: `node scripts/check-slides.mjs <slug>`.
It is not part of `npm run build`, because the Cloudflare Pages image has no browser.

`export:pdfs` re-exports **every** deck, not just yours, so it dirties the other PDFs in the
working tree. Restore them (`git checkout -- <path>`) and keep only the one you meant to
produce.

`check-dist.mjs` catches an undefined custom property, a broken `href`, a `src` pointing at a
file that is not in `dist/` (an image, a video, an audio file, a script) and a missing `alt`.

It does **not** catch two things, so check them yourself:

- **A token defined on the public site but absent from `src/content/secured/tokens.css`.**
  The check pools every definition across `dist/`, so such a token passes and the slide
  renders unstyled.
- **A chrome number.** `01/09` on the eighth slide of a ten-slide deck is valid HTML and a
  wrong footer. Count them, or read them off the rail.

Neither validator has an opinion about whether a slide is any good. Open the deck.

The PDF is committed alongside the deck and picked up automatically by the `/secured/`
overview, which offers it next to the "Bekijken" link.

### Checklist

- [ ] `deck.json` lists `../shared/slide.css` and `../shared/node-field.js`
- [ ] `deck.css` holds no rule another deck could want, and overrides no shared class
- [ ] Slide order in `deck.json` matches the filenames
- [ ] Every `<!--chrome NN/TT-->` has the right number and total, and its slide carries `slide--footed`
- [ ] `TT` equals the number of slides minus two
- [ ] Cover and closing slide carry neither the marker nor `slide--footed`
- [ ] No two consecutive slides use the same archetype
- [ ] Every class used appears in `shared/slide.css`; nothing new went into `deck.css`
- [ ] Every element inside a section has an id, scoped `<deck-slug>-slide-NN-<part>`
- [ ] Every `<img>` has an `alt` (`alt=""` for the decorative mark)
- [ ] Sentence case; no em-dash; no exclamation marks in the copy (the `title` in
      `deck.json` keeps the house `SmartAgents — <deck>` form, which is a name, not copy)
- [ ] `npm run build` passes
- [ ] `npm run check:slides` passes
