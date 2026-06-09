# SmartAgents presentation builder

Use this guide whenever creating a new presentation deck for the SmartAgents website. Follow every rule below exactly.

---

## What you're building

A self-contained HTML slideshow powered by the `<deck-stage>` web component. Each deck lives at its own URL under `/presentations/<slug>/`. Slides are Nunjucks partials included into a single `page.njk`. Eleventy builds the final HTML.

---

## File structure

Create these files for every new deck:

```
presentations/<slug>/
  index.njk           ← Eleventy entry point (permalink only)
  page.njk            ← Full HTML document, includes all slides
  deck.css            ← All styles for this deck
  assets/
    logo.svg          ← Copy from presentations/staffing-pitch/assets/
    axel-profile.webp ← Copy from presentations/staffing-pitch/assets/
    tom-profile.webp  ← Copy from presentations/staffing-pitch/assets/
  slides/
    00-cover.njk
    01-waarom-dit-gesprek.njk
    02-<slug>.njk
    ...
```

---

## Step 1 — Register the route

Add an entry to `_data/presentations.js`:

```js
myNewDeck: {
  permalink: '/presentations/my-new-deck/'
}
```

The key becomes the variable name used in `index.njk`.

---

## Step 2 — index.njk

```njk
---
excludeFromSitemap: true
permalink: "{{ presentations.myNewDeck.permalink }}"
---
{% include "./page.njk" %}
```

---

## Step 3 — page.njk

```html
<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="description" content="…">
<meta name="robots" content="noindex, follow">
<title>SmartAgents — Deck title</title>
{% include "document/favicon.njk" %}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../shared/tokens.css">
<link rel="stylesheet" href="deck.css">
</head>
<body>
<deck-stage width="1920" height="1080">
  {% include "./slides/01-cover.njk" %}
  {% include "./slides/02-….njk" %}
</deck-stage>
<script src="../shared/deck-stage.js"></script>
</body>
</html>
```

---

## Step 4 — deck.css

Copy from `presentations/staffing-pitch/deck.css` as your base. It contains all the shared component styles. Add slide-specific overrides or new components at the bottom.

---

## Step 5 — Slide anatomy

Every slide file follows this exact structure:

```njk
<!-- ════════ NN · SLIDE LABEL ════════ -->
  <section data-label="Label" class="slide light">
    <div class="glow soft"></div>
    <div class="frame">

      <p class="eyebrow"><span class="num">NN</span>Section label</p>
      <h2 class="h2">Heading with <span class="accent">accent</span>.</h2>

      <!-- content here -->

    </div>
    {% set slideNumber = "NN" %}
    {% set slideTotal = "TT" %}
    {% include "../../shared/chrome.njk" %}
  </section>
```

**Rules:**
- `data-label` is the slide title shown in the thumbnail rail
- `class="slide light"` on all slides **except** the cover
- `class="slide deeper"` only on the cover slide (dark background)
- `glow soft` on light slides; `glow` on the dark cover
- `{% include "../../shared/chrome.njk" %}` is mandatory on every slide — it renders the footer
- `slideNumber` and `slideTotal` must be set as Nunjucks variables before the include, as two-digit zero-padded strings: `"01"`, `"09"`, `"15"`

**Slide numbering:**
- The cover is always `00-cover.njk` — it is not counted in the visible slide sequence
- Content slides start at `01`. The first content slide is always "Waarom dit gesprek" (`01-waarom-dit-gesprek.njk`)
- All subsequent slides follow in order: `02`, `03`, …
- File names, `slideNumber`, and eyebrow `<span class="num">` must all use the same two-digit number

---

## ⚠️ Footer clearance — the single most important constraint

The `.chrome` element (logo + page number) is `position: absolute; bottom: 40px`. It is always visible. Slide content **must never overlap it**.

How the system prevents overlap: `.frame` has `padding-bottom: 88px`. This 88px dead-zone at the bottom of every frame is reserved for the chrome. **Do not touch it.**

**Rules — non-negotiable:**

1. **Never override `padding-bottom` on `.frame`.** Even `style="padding-bottom: 0"` will let content collide with the footer.
2. **Never position content absolutely at the bottom of a slide.** Use the normal flex flow instead.
3. **When content is dense, reduce it — don't shrink the padding.** Fewer items, shorter text, or a smaller `font-size` on the grid. The padding is not a negotiable margin.
4. **The last element in `.frame` must not have a large `margin-bottom`.** The 88px bottom padding already provides breathing room.
5. **When using `flex: 1`** on a content container, it fills the remaining space *within* the padded frame — content still cannot escape into the footer zone as long as rule 1 holds.

If you find yourself wanting to squeeze content lower, that is a sign the slide has too much content. Split it into two slides.

---

## Cover slide

```njk
  <section data-label="Cover" class="slide deeper">
    <div class="glow"></div>
    <div class="frame cover">
      <div class="cover-meta">
        <span class="cyan-bar">SmartAgents · Deck title</span>
        <img src="assets/logo.svg" alt="SmartAgents" class="cover-logo">
      </div>

      <div>
        <h1>Main headline with<br><span class="accent">accent on key phrase</span>.</h1>
        <p class="sub">One or two lines of supporting context.</p>
      </div>

      <div class="cover-meta">
        <span></span>
        <span>smartagents.be</span>
      </div>
    </div>
  </section>
```

The `.cover` class uses `justify-content: space-between` on a full-height flex column — the top meta, the headline block, and the bottom meta are automatically spaced. Do not include `{% include "../../shared/chrome.njk" %}` on the cover; the bottom meta acts as its visual anchor.

---

## Glow variants

| Class | When to use |
|---|---|
| `<div class="glow"></div>` | Dark cover slide only |
| `<div class="glow soft"></div>` | All light content slides |
| `<div class="glow center"></div>` | Light slide where the glow should emanate from the center (rare) |

Always place the glow div as the **first child** of `<section>`, before `.frame`.

---

## Type hierarchy

Use these classes in order of visual weight:

| Class | Size | Use |
|---|---|---|
| `.eyebrow` | 26px | Section number + label, always at top of frame |
| `h1.title` | 84px | Only on cover or very sparse slides |
| `h2.h2` | 64px | Standard slide headline |
| `.lede` | 32px | Subtitle or intro sentence below the headline |
| `.body` | 28px | Longer descriptive text |
| `.accent` | — | Inline cyan highlight on any text element |

Eyebrow format: `<p class="eyebrow"><span class="num">01</span>Label text</p>`

---

## Layout components

### Card grid

```html
<div class="grid-3" style="margin-top: 40px;">
  <div class="card">
    <span class="lab">Label</span>
    <h3>Card heading</h3>
    <p>Body text.</p>
  </div>
</div>
```

Available grid classes: `.grid-2`, `.grid-3`, `.grid-4`, `.grid-3-2`

### Service card (colored icon)

```html
<div class="card svc" style="--c: #8b5cf6;">
  <div class="svc-head">
    <span class="svc-icon"><svg …></span>
    <h3>Service name</h3>
  </div>
  <p>Description.</p>
</div>
```

### Steps (5-column process)

```html
<div class="steps">
  <div class="step" style="--c: var(--sa-cyan);">
    <div class="step-head"><span class="big-n">01</span></div>
    <h4>Step title</h4>
    <p>Description.</p>
  </div>
</div>
```

### Sectors (role/profile cards)

```html
<div class="dept-grid" style="grid-template-columns: repeat(4, 1fr);">
  <div class="sector">
    <h4>Role name</h4>
    <ul><li>Bullet</li></ul>
  </div>
</div>
```

### Callout box

```html
<div class="callout">
  Supporting note with <strong>bold emphasis</strong> for key terms.
</div>
```

Use for contextual notes or caveats. Always last in the frame before the chrome include. Because it sits at the end of the flex column, the 88px bottom padding ensures it never overlaps the footer.

### Proof / track-record banner

```html
<div class="proof">
  <div class="yrs"><b>20</b><span>jaar</span></div>
  <div class="proof-txt">
    <div class="proof-head">Headline</div>
    <p>Supporting text with <strong>bold terms</strong>.</p>
  </div>
</div>
```

### Three-phase layout

```html
<div class="phases">
  <div class="phase">
    <div class="ph">Fase 1 · Label</div>
    <h4>Phase heading</h4>
    <ul><li>Item</li></ul>
  </div>
</div>
```

### Big-three benefit cards

```html
<div class="bigthree">
  <div class="bigthree-card">
    <div class="h">Sneller</div>
    <p>Explanation.</p>
  </div>
</div>
```

### Security grid (3×2)

```html
<div class="sec-grid">
  <div class="sec-card">
    <span class="sec-ic"><svg …></span>
    <h4>Title</h4>
    <p>Description.</p>
  </div>
</div>
```

### Pill row (tags)

```html
<div class="pillrow">
  <span class="pill">Tag label</span>
</div>
```

### Founder card

```html
<div class="founder">
  <div class="photo" style="background-image: url('assets/axel-profile.webp');"></div>
  <div class="info">
    <div class="role">Founder</div>
    <h3>Axel Segers</h3>
    <p>Short bio.</p>
  </div>
</div>
```

---

## Closing / CTA slide

Always the last slide. Use `class="slide light"`. Structure:
1. Eyebrow
2. `h1.title` (smaller, ~60px via inline style)
3. Short paragraph (`.body`)
4. Founder grid (`grid-2` of `.founder` cards)
5. Contact bar (inline-styled dark panel at the bottom)

The contact bar uses a fixed dark background (`#0f172a`) so it stands out on the white slide. Keep it to three columns: call-to-action text, email/URL, location/VAT.

---

## Copy and writing

All slide copy follows the SmartAgents writing standard. Apply the `/blog-style` skill.
---

## Checklist before finishing a deck

- [ ] Every slide has `{% include "../../shared/chrome.njk" %}` with correct `slideNumber` and `slideTotal`
- [ ] Cover uses `class="slide deeper"` with `<div class="glow"></div>`; all others use `class="slide light"` with `<div class="glow soft"></div>`
- [ ] No slide overrides `padding-bottom` on `.frame`
- [ ] No content sits in the bottom 88px of any slide
- [ ] Route is registered in `_data/presentations.js`
- [ ] `page.njk` includes all slide files in order
- [ ] Assets copied to `presentations/<slug>/assets/`
- [ ] `npm run build` passes with no errors
- [ ] No em-dash (— or --) anywhere in slide copy
- [ ] No exclamation marks in slide copy
- [ ] All headings and eyebrow labels are sentence case
- [ ] Closing slide ends with a concrete action, not a vague sentiment
