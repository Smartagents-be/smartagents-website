---
name: webcomponent-mpa-spa
description: "Use this skill whenever the user wants a multi-page static website that feels like a single page application (SPA), or asks about web components, custom elements, shadow DOM, declarative shadow DOM, Lit, client-side routing for a static site, page transitions, View Transitions API, keeping header/video/state alive between pages, or avoiding flashes of unstyled content in components. Trigger it for any request to build UI components or navigation behavior on a static site, even if the user does not say \"web component\". Builds on the fast-static-site skill (pre-rendered HTML, Vite build) and respects the static-i18n rule that all text is rendered at build time."
---

# Web components + MPA that feels like an SPA

Principle: the site is a real multi-page app. Every URL is a full HTML document that works with JS
disabled. On top of that, four progressive layers make it feel like an SPA. Add layers in order and
stop when the experience is good enough; each layer must degrade to the one below it.

## 1. The four layers

| Layer | What it gives | Cost |
|---|---|---|
| 0. Plain MPA with fast HTML | Correctness, SEO, resilience | none |
| 1. Prefetch/prerender (Speculation Rules + hover prefetch, service worker) | Next page is already loaded when clicked | tiny script (see fast-static-site §7) |
| 2. Cross-document View Transitions | Animated transitions between pages, shared-element morphs | CSS only |
| 3. Soft navigation router | No full reload: header, playing video, scroll state, and component state persist | ~2 KB JS |

Most marketing sites are excellent at layer 2. Add layer 3 only when there is state that must
survive navigation (a playing video, an open panel, an audio player, a filled form). Never make
layer 3 mandatory for the site to function.

## 2. Layer 2: cross-document View Transitions

In `main.css`:

```css
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: 120ms ease-out both fade-out; }
::view-transition-new(root) { animation: 160ms ease-in both fade-in; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation: none; }
}
```

- Give persistent chrome its own name so it does not fade: `header { view-transition-name: header; }`.
- Shared element morph (e.g. a card image growing into a hero): set the same
  `view-transition-name` on the element on both pages. Names must be unique per page; set them
  inline for list items (`style="view-transition-name: card-42"`), and only on the item being
  navigated to if there are many.
- Works only with same-origin navigations that are prefetched or fast. Unsupported browsers just
  navigate normally.

## 3. Layer 3: the soft navigation router (only when needed)

Requirements the router must meet:

1. Intercept clicks on same-origin `<a>` links (ignore modifier keys, `target`, `download`,
   `data-no-router`, hash-only links, and links to files). Also skip interception when the target
   URL's language segment (`/nl/` vs `/en/`) differs from the current page: language switches are
   full navigations, because the header and footer must change too.
2. `fetch()` the target HTML (it is a normal page, likely already in the SW/HTTP cache), parse it with
   `DOMParser`, and swap the contents of `<main>` (or elements marked `data-router-swap`). Update
   `<title>`, `<html lang>`, canonical/hreflang links, and `<meta name="description">`.
3. Wrap the swap in `document.startViewTransition()` when available.
4. Push history state, restore scroll on back/forward (`history.scrollRestoration = 'manual'`,
   store scroll position per entry), scroll to top or to the hash on forward navigation.
5. Move focus to `<main>` (with `tabindex="-1"`) and announce the new title in an
   `aria-live="polite"` region.
6. Execute nothing from the fetched page's `<head>`; the shell already has the JS. If a page needs a
   component that is not defined yet, the component's own lazy loader handles it (section 5).
   If a page has an extra page-specific `<link rel="stylesheet">`, append it to the head before
   the swap and wait for it to load; do not remove stylesheets from previous pages.
7. On any error (network, non-2xx, parse failure), fall back to `location.href = url`.
8. Fire a `page:change` custom event on `document` so components can react.
9. Prefer the Navigation API (`navigation.addEventListener('navigate', ...)` with `intercept`) where
   available; fall back to click + `popstate` handling. Keep the whole thing under ~2 KB min+gzip.
   Do not pull in a framework router.

Persistent elements (video, audio, header, cookie banner) live outside the swapped region so they
are never re-created.

When layer 3 is active, use Speculation Rules `prefetch` only (not `prerender`): the router fetches
the HTML itself, so a prerendered document would be thrown away.

## 4. Web component rules

Use custom elements for behavior, not for content. Static content is plain HTML from the build.

**When to make a component**

- Yes: carousel, tabs, accordion (only if `<details>` is not enough), lazy video, dialog trigger,
  language dropdown, image gallery, form with validation, filter/sort of a list, counter, anything with
  state or events.
- No: cards, sections, headings, grids, layouts. Use semantic HTML and CSS classes.

**Authoring**

- Vanilla `HTMLElement` by default. Lit is acceptable if the user asks for it or the site has more than
  ~10 stateful components; it costs about 6 KB and brings reactive properties and templating. Never
  mix two component libraries.
- One folder per component: `src/components/lazy-video/lazy-video.js` (+ `.css` if styles are large).
- Name with a project prefix: `<ex-carousel>`, `<ex-lazy-video>`. Never generic prefixes like `x-`.
- Progressive enhancement: the element's light DOM children are the no-JS version. The component
  upgrades them, it does not replace them with something that only exists in JS.
- Prefer light DOM for components that contain page text or need global styles. Use shadow DOM
  only when style isolation is a real requirement (a widget reused across sites, a third-party-like
  design). When using shadow DOM on the server-rendered path, emit **declarative shadow DOM**
  (`<template shadowrootmode="open">`) from the build so the component is styled before JS runs.
  The class must then reuse it: `const root = this.shadowRoot ?? this.attachShadow({mode:'open'})`,
  and only render its template when the root is empty.
- Shadow styles: share one `CSSStyleSheet` per component class via `adoptedStyleSheets` (build it
  once at module load, `import styles from './x.css?inline'` in Vite), not a `<style>` string per
  instance.
- Attributes for configuration (strings, booleans), properties for complex data, `CustomEvent`
  with `bubbles: true, composed: true` for output. Reflect state to attributes only when CSS needs it.
- Register with `customElements.define` guarded by `if (!customElements.get(name))`.
- Clean up in `disconnectedCallback` (observers, listeners, timers), because the router will
  disconnect and reconnect elements.

**Avoiding FOUC and layout shift**

- In critical CSS: `:not(:defined) { visibility: hidden; }` is too aggressive for content-bearing
  elements. Instead give each component a stable no-JS layout (dimensions, `aspect-ratio`) in critical
  CSS so upgrading does not move anything, and hide only pure-JS controls (arrows, dots) until
  `:defined`.
- Never set `display: none` on the whole element pre-upgrade.

## 5. Loading strategy

- The entry `app.js` contains: router (if used), prefetch helper, SW registration, and the definitions
  of components that appear above the fold on most pages (usually the header ones).
- Everything else is registered lazily. A tiny loader in `app.js`:
  - Maps tag name to a dynamic `import()` (Vite splits these into hashed chunks).
  - Uses `IntersectionObserver` to import when the element approaches the viewport, or on first
    interaction (`pointerenter`, `focusin`) for interaction-only components.
  - Re-scans after every `page:change` event.
- Do not import all components eagerly. Do not use a bundle bigger than the budget in
  fast-static-site §1.
- Third-party widgets (maps, embeds) get a facade component: a static image with a play/open button
  that loads the real thing on click.

## 6. State between pages (when using the router)

- Component-local state lives in the component instance. If the element is inside the swapped
  region it will be recreated; if that state must persist, move the element outside the swap region
  or store its state in `sessionStorage` keyed by URL and restore in `connectedCallback`.
- Global state (open menu, mute preference): a tiny event-based store module, no library.
- URL is the source of truth for anything shareable (active tab, filter). Update it with
  `history.replaceState`.

## 7. Accessibility and semantics (non-negotiable)

- Keyboard operable, focus visible, `aria-*` roles that match the pattern (WAI-ARIA APG).
- Native elements first: `<button>`, `<dialog>`, `<details>`, `popover`, `<select>`.
- Respect `prefers-reduced-motion` in every animation and in the router's transitions.
- The soft router must announce page changes and manage focus (section 3, item 5).

## 8. Checklist

- [ ] Every page works with JS disabled; components upgrade light DOM instead of replacing it
- [ ] Cross-document view transitions in CSS with reduced-motion guard
- [ ] Router (if present) is under ~2 KB, falls back to full navigation on error, handles focus,
      scroll, title, lang, and history correctly
- [ ] Components: prefixed names, guarded define, cleanup on disconnect, lazy registration by
      viewport/interaction, no FOUC/CLS on upgrade
- [ ] Shadow DOM only where isolation is needed, and then rendered declaratively at build time
- [ ] No text hard-coded in components; text comes from build-rendered HTML (see static-i18n)
