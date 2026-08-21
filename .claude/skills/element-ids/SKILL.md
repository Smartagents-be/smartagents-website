---
name: element-ids
description: "Use this skill whenever you write or edit HTML markup in this repo: page modules in src/pages/, the shell in src/layouts/base.mjs, web component templates in src/components/, deck slide fragments, or anything under src/content/secured/. Every element you author must carry a unique id so a human can point at any part of a rendered page and name it exactly. Trigger it for new markup, for edits to existing markup, and whenever you are asked why an element has no id or what an element should be called."
---

# Element ids

Principle: every element this repo renders is addressable by name. A person looking at
`smartagents.be` in a browser must be able to inspect any box, any line of text, any decorative
cell, read one `id`, and hand that string back as an unambiguous instruction: "make
`home-hero-claim` smaller". No "the second paragraph in the block under the dark shape".

That is the only job ids do here. They are labels, not hooks. Styling stays on classes, behaviour
stays on `data-*` attributes. See §5.

## 1. The rule

**Every element you write inside `<body>` gets an `id`. No exceptions.** Sections, wrappers,
headings, paragraphs, lists and every list item, links, buttons, form fields, images, SVG roots,
custom elements, and decorative elements including `aria-hidden` texture and repeated `<i>` cells.

`<body>` itself gets one. Elements inside `<head>` do not: they are metadata, never addressable in
a viewport, and most of them (`hreflang`, canonical, Open Graph) are generated from data rather
than authored. That boundary is the whole exception list.

The rule applies to markup you author or edit. It is not a licence to sweep the repo: when you
touch a block, id every element in that block, and leave untouched blocks alone unless asked.

## 2. Naming scheme

```
{scope}-{block}[-{part}][-{key}]
```

Lowercase ASCII kebab-case, digits allowed, no underscores, no camelCase, no locale words.

| Segment | Comes from | Examples |
|---|---|---|
| `scope` | the page's `id` field, `site` for shell chrome shared by every page, the custom element tag minus `sa-`, or the deck folder name | `home`, `not-found`, `site`, `contact-form`, `enterprise-pitch` |
| `block` | the section or component region | `hero`, `services`, `footer`, `slide-05` |
| `part` | the element's role in that block | `title`, `lead`, `cta`, `list`, `item`, `field`, `cell` |
| `key` | disambiguates repeats — a stable content key, never a bare loop index when a key exists | `proces`, `agentic`, `01`, `02` |

Applied to the top of the homepage hero:

```js
function hero(t) {
  return html`<section id="home-hero" class="hero">
  <div id="home-hero-field-slot" class="field-slot hero__field" aria-hidden="true">
    <div id="home-hero-field" class="field" data-magnet data-clip="heroPetal">
      <sa-node-field id="home-hero-nodes"></sa-node-field>
    </div>
  </div>
  <div id="home-hero-inner" class="hero__inner">
    <div id="home-hero-text" class="hero__text">
      <h1 id="home-hero-title">
        <span id="home-hero-wordmark" class="hero__wordmark">…</span>
        <span id="home-hero-claim" class="hero__claim">${t('hero.claim')}</span>
      </h1>
      <div id="home-hero-actions" class="hero__actions">…</div>
    </div>
  </div>
</section>`;
}
```

Names describe **structure and role**, never appearance and never copy. `home-hero-claim`, not
`home-hero-big-blue-text` and not `home-hero-wij-bouwen-agents`. Appearance changes; the role
outlives it.

## 3. Ids are identical in every language

A page is rendered once per language from the same module, so the same element carries the same id
in `/nl/`, `/en/` and `/fr/`. Never derive an id from `t()` output, from a translated slug, or from
anything language-dependent. `home-services-item-training` in all three; never
`home-diensten-item-opleiding`.

This is what makes an id usable in a bug report: the reporter's language does not matter.

## 4. Repeats, loops and uniqueness

Ids are unique per document. Anything rendered more than once needs a suffix.

**Loops over a keyed list** — take the key, not the position:

```js
const SERVICES = ['proces', 'agentic', 'training', 'staffing'];

html`<ul id="home-services-list" class="services">
${join(SERVICES.map((key) => html`
  <li id="home-services-item-${key}" class="service">
    <h3 id="home-services-title-${key}">${t(`services.${key}.title`)}</h3>
    <p id="home-services-body-${key}">${t(`services.${key}.body`)}</p>
  </li>`))}
</ul>`
```

Reordering the array must not renumber anything. That is why the key wins over the index.

**Generated repeats with no meaning of their own** — the isometric texture cells, rule marks,
skeleton rows: pad a 1-based index to two digits so they sort and read predictably.

```js
/** Repeat a bare element n times — the isometric planes are pure texture. */
const cells = (scope, n) =>
  raw(Array.from({ length: n }, (_, i) => `<i id="${scope}-cell-${index(i + 1)}"></i>`).join(''));

// cells('home-smartspace-plane', 24) -> home-smartspace-plane-cell-01 … -cell-24
```

Yes, this puts an id on every texture cell. That is the rule working as intended: the cells are
visible, so they are addressable. Keep the scope prefix short so the cost stays in the noise.

**A component placed twice on one page** takes an id prefix from its call site and derives
everything from it, rather than hard-coding a scope:

```js
function articleRow({ prefix, t, key }) {
  return html`<article id="${prefix}-row-${key}" class="article">
    <h3 id="${prefix}-row-${key}-title">${t(`articles.${key}.title`)}</h3>
  </article>`;
}
// articleRow({ prefix: 'home-insights', … })
```

If you cannot see the whole document from where you are writing, prefix with the scope you were
given. Never invent a bare `title` or `item`.

## 5. What ids must not become

- **Not CSS selectors.** `#home-hero-claim { }` is a specificity trap and couples the stylesheet to
  a naming scheme that exists for humans. Styling stays on classes; the BEM-ish `hero__claim`
  convention in `main.css` is unchanged.
- **Not JS hooks.** `src/motion.js` finds work through `data-magnet`, `data-clip` and
  `data-reveal`. Keep it that way — a selector that reads `[data-magnet]` describes intent, a
  selector that reads `#home-hero-field` describes a location.
- **Not a rename of existing anchors.** `#main` and the in-page anchor targets referenced from
  `href`s and from the i18n JSON keep their current short names. They are part of the URL contract.
  Add ids around them; do not renumber them.

## 6. Ids you get to use for free

Because everything is named, accessibility relationships become mechanical rather than invented:

```html
<section id="home-services" aria-labelledby="home-services-title">
  <h2 id="home-services-title">…</h2>
</section>

<label id="contact-form-email-label" for="contact-form-email">…</label>
<input id="contact-form-email" aria-describedby="contact-form-email-hint">
<p id="contact-form-email-hint">…</p>
```

Wire these up whenever the relationship is real. Never point `aria-labelledby` at an id that does
not exist in the same document — that is worse than omitting it.

## 7. Shadow DOM

Ids inside a shadow root are scoped to that root, so they cannot collide with the light DOM or with
a second instance of the same component. Still name them fully — `contact-form-submit`, not
`submit` — so a string copied out of the inspector is self-explanatory. The host element itself
lives in the light DOM and follows §2 like any other element.

## 8. Decks and the secured area

Slide fragments under `src/content/secured/` are plain HTML files, so the scope is the deck folder
and the slide number:

```html
<section id="enterprise-pitch-05" class="slide">
  <h2 id="enterprise-pitch-05-title">…</h2>
  <ul id="enterprise-pitch-05-list">
    <li id="enterprise-pitch-05-item-01">…</li>
  </ul>
</section>
```

The `<!--chrome 05/10-->` marker expands at render time; ids inside the expansion come from the
renderer, not from the fragment.

## 9. Checklist before you finish a block

1. Every element in the block you touched has an `id`.
2. No id repeats within the page — check loops first, they are where collisions come from.
3. No id contains translated text, a colour, a size, or a position word.
4. The ids are the same in nl, en and fr.
5. Nothing in `main.css` selects on an id; nothing in `motion.js` queries one.
