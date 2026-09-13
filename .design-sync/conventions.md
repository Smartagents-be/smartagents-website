# SmartAgents — how to build with this system

**This design system ships as tokens and a stylesheet, not as a component library.**
There is no React bundle and no component picker: `window.SmartAgents` is deliberately
empty. You write plain semantic HTML and give it the class names below — that is the
whole idiom, and it is exactly how the production site is built (a pre-rendered static
site with no framework).

## Setup

One import, and everything is reachable from it:

```html
<link rel="stylesheet" href="styles.css">
```

`styles.css` pulls `tokens/tokens.css` (every custom property) then `_ds_bundle.css` (the
class layer, lifted verbatim from the production site). No provider, no wrapper component,
no JS is required for anything to be styled. Two things to know:

- **Wrap page content in `.shell`.** It is the page frame — full-bleed, 64px gutter. The
  reset and the `body` rules come with the stylesheet, so `.shell` is the only structural
  class you must remember.
- **No webfont loads, by design.** Don't add one; see `fonts/README.md`.

## The styling idiom

**Class names first, tokens for anything you add.** The class vocabulary is closed —
`guidelines/class-vocabulary.md` is the complete list, and a class that is not on it does
not exist. Do not invent siblings; if `.rows--pair` and `.rows--cards` are the two
modifiers, there is no third.

Naming is BEM: `.section`, `.section__head`, `.section--close`.

For layout glue of your own, use the custom properties rather than literal values:

| family | examples |
|---|---|
| colour | `--sa-ink` · `--sa-field` · `--sa-cyan` · `--sa-paper` · `--sa-line` |
| semantic roles | `--surface-page` · `--text-strong` · `--text-accent` |
| type | `--font-sans` · `--text-body-lg` · `--weight-display` · `--track-display` |
| measure | `--measure` (body, 44ch) · `--measure-prose` (long-form) |

Three conventions carry most of the look, and getting them wrong is what makes a design
stop reading as SmartAgents:

1. **Lists are hairline-separated rows, not cards.** Reach for `.rows` / `.row` before any
   grid of boxes. This is the system's single most load-bearing decision.
2. **Sentence case everywhere** — buttons, labels, headings. Never title case, never caps.
3. **Asymmetry, and one dark shape.** Hero text takes the left 52%; the navy field takes
   the rest. One shape per hero — the paper is its counterweight.

Arrows are the literal character `→`, never an icon. The system is icon-poor on purpose;
don't introduce an icon library.

## Where the truth lives

- `guidelines/class-vocabulary.md` — every class, what it does. Read it before styling.
- `guidelines/dark-field.md` — the navy shapes, and the SVG defs they need to render at
  all (`guidelines/clip-paths.svg` — paste it once per page or a `.field` clips to nothing).
- `guidelines/voice.md` — copy rules. Dutch, formal *u*, short declaratives, no emoji.
- `_ds_bundle.css` — the real rules. When in doubt, read them; they are the site's own.

## A page, idiomatically

```html
<div class="shell">
  <section class="section" id="services" aria-labelledby="services-title">
    <div class="section__head">
      <h2 id="services-title" class="section-heading">Wat we doen</h2>
      <p class="section-lede">Wat werkt en wat niet.</p>
    </div>

    <div class="rows rows--pair">
      <a class="row" href="/training/">
        <span class="row__title">Training</span>
        <span class="row__body">Uw mensen leren werken met AI-agenten.</span>
        <span class="row__cue">Ontdek <span aria-hidden="true">&rarr;</span></span>
      </a>
      <div class="row">
        <span class="row__title">Procesoptimalisatie</span>
        <span class="row__body">We zeggen ook wanneer u ons niet nodig hebt.</span>
      </div>
    </div>

    <div class="hero__actions">
      <a class="btn btn--primary" href="#contact">Plan een gesprek</a>
      <a class="btn btn--ghost" href="#work">Bekijk wat we doen</a>
    </div>
  </section>
</div>
```

A row that leads somewhere is an `<a class="row">` and gets the `.row__cue`; one that does
not is a `<div class="row">` without it. That distinction is deliberate — the cue is the
promise of a destination.
