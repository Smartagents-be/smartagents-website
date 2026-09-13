---
name: fast-static-site
description: "Use this skill whenever the user is building, optimizing, auditing, or asking about a static website that must be extremely fast: \"McMaster-Carr style\" speed, first contentful paint (FCP), largest contentful paint (LCP), Core Web Vitals, caching, service workers, prefetching, critical CSS, image or video optimization, fonts, bundle size, or hosting/CDN configuration for a site with no backend. Trigger this even when the user only mentions one of these topics (e.g. \"how should I load this hero video\", \"set up caching headers\", \"why is my LCP slow\"), and always trigger it when scaffolding a new static site project. This is the foundation skill; the static-i18n and webcomponent-mpa-spa skills build on the architecture and build pipeline defined here."
---

# Fast Static Site (McMaster-Carr playbook)

Goal: a multi-page static site with no backend that renders in one round trip, feels instant on
navigation, and stays fast as content grows. Everything below is in priority order: the earlier items
give the biggest wins. Do them in order and do not skip the measurement step.

## 1. Architecture decisions (apply by default)

- **Pre-rendered HTML.** Every page is a complete, self-sufficient `.html` file generated at build
  time. Nothing important depends on JavaScript to appear. If the site is multilingual, one HTML file
  per page per language (see the `static-i18n` skill).
- **Build tool: Vite** for bundling, hashing, minification and CSS handling, plus a small Node script
  (`build/render.mjs`) that renders page templates to HTML. Do not add a framework (React, Vue, Svelte)
  and do not add a client-side templating runtime. If the user already has a static site generator
  (Eleventy, Astro in static mode) keep it, the rules below still apply.
- **Interactivity via web components** only where needed. See `webcomponent-mpa-spa` for the pattern.
- **Hosting:** any static host with a CDN and Brotli (Cloudflare Pages, Netlify, Vercel static,
  S3+CloudFront, nginx behind a CDN). HTTP/2 or HTTP/3 is required. Configure headers as in section 6.
- **Budgets** (enforce in CI, see section 8): HTML per page under 30 KB compressed, critical JS under
  50 KB compressed total, no more than 3 render-blocking requests, LCP under 1.5 s on a throttled
  mobile profile, CLS 0, INP under 100 ms.

Suggested layout:

```
src/
  pages/            page templates (one per route)
  layouts/          shared shell (head, header, footer)
  components/       web components (one folder per element)
  styles/           critical.css (inlined) + main.css (async)
  content/          markdown or JSON content
  i18n/             translation files (see static-i18n)
public/             static assets copied as-is (favicons, robots.txt)
build/render.mjs    renders pages -> dist/
dist/               output, deploy this
```

Templating in `render.mjs`: plain JS tagged template literals (an `html` helper that escapes
interpolations) or a small engine like Eta/Nunjucks. Layouts and pages are functions that receive a
context object and return strings. Minify the HTML output (`html-minifier-terser`) and generate a
`404.html` per language.

## 2. The HTML document (the critical path)

Every page must satisfy this order inside `<head>`:

1. `<meta charset>`, `<meta viewport>`, `<title>`.
2. Inline critical CSS in a `<style>` block: only what is needed for above-the-fold layout of that page
   type. Keep it under 14 KB. Generate it per layout (use `critical` or `beasties` at build time,
   or hand-maintain a `critical.css`).
3. `<link rel="preload" as="image">` for the LCP image (or hero poster) with `fetchpriority="high"`
   and, for responsive images, `imagesrcset` and `imagesizes` matching the `<img>`; plus preloads for
   the one or two font files actually used above the fold.
4. `<link rel="modulepreload">` for the entry JS chunk.
5. `<link rel="stylesheet" href="/assets/main.[hash].css">` for the rest of the CSS. Loading it
   normally is fine when it is small (under 30 KB); otherwise load it with `media="print"
   onload="this.media='all'"` and a `<noscript>` fallback.
6. `<script type="module" src="/assets/app.[hash].js">` at the end of head. Module scripts are
   deferred by default. Never use a blocking classic script.

Rules for the body:

- Set explicit `width` and `height` (or `aspect-ratio` in CSS) on every image, video and embed.
  CLS must be zero.
- Do not depend on JS for layout, navigation, or content. Progressive enhancement only.
- Keep the DOM small: aim for under 1,500 nodes per page. Long lists get pagination or
  content-visibility: `content-visibility: auto; contain-intrinsic-size: auto 500px;` on
  below-the-fold sections.
- No third-party scripts on the critical path. Analytics, if any, loads after `load` and is
  self-hosted or a tiny beacon.

## 3. CSS

- One critical inline block per layout, one shared `main.css` bundle for everything else. Avoid
  per-page CSS files unless a page has a large unique stylesheet.
- Use modern CSS instead of JS: `:has()`, container queries, `@layer`, `color-mix`, native
  `<details>`, `<dialog>`, `popover`, scroll snapping.
- Prefer system fonts or at most one variable font (see section 4).
- Avoid `@import` in CSS (adds a request waterfall). Let Vite bundle it.

## 4. Fonts

- Best: `font-family: system-ui, sans-serif`. Zero requests.
- If a brand font is required: self-host, WOFF2 only, subset per script (Latin, Latin-ext, Cyrillic,
  etc.) using `glyphhanger` or `pyftsubset`, `font-display: swap`, preload only the one weight used
  above the fold, and set `size-adjust` / `ascent-override` on a fallback `@font-face` to remove
  layout shift when the web font arrives.
- Never load fonts from Google Fonts or any third-party origin.

## 5. Images and video

**Images**

- Build step converts every source image to AVIF and WebP at 3 to 4 widths (e.g. 480, 800, 1200,
  1600). Use `sharp` in a build script or `vite-imagetools`. Keep the original as a JPEG/PNG fallback.
- Emit `<picture>` with `type="image/avif"` then `image/webp` sources, `srcset` + `sizes` on each,
  and an `<img>` fallback with `width`, `height`, `alt`, `decoding="async"`.
- Above-the-fold / LCP image: `loading="eager"`, `fetchpriority="high"`, plus the preload from
  section 2. Everything else: `loading="lazy"`.
- Icons: inline SVG sprite (`<svg><use href="#icon-x">`) embedded once per page or a single sprite
  file, never one request per icon and never an icon font.
- Target sizes: hero under 150 KB, content images under 60 KB, thumbnails under 15 KB.

**Video (mp4)**

- Encode two versions: H.264 MP4 (universal) and AV1 or VP9 WebM (smaller). Offer both in
  `<source>` elements, WebM first. Strip audio from decorative/hero videos.
- Always set `poster` (an optimized image, this is the LCP element for hero videos), `width`,
  `height`, `playsinline`, and `preload="none"` (or `"metadata"` for the hero if it autoplays).
- Hero/background loops: `autoplay muted loop playsinline`, short (under 10 s), under 2 MB, and honor
  `prefers-reduced-motion` (show poster only).
- Below-the-fold videos: do not load until near viewport. Use an IntersectionObserver in a small
  `<lazy-video>` web component that sets `src` on the sources when within 200 px of the viewport.
- Long videos: consider serving from a CDN with range requests enabled (any static host does this)
  and keep `preload="none"`.
- Never autoplay with sound, never load YouTube/Vimeo embeds directly (use a click-to-load facade
  if embeds are needed).

## 6. Caching and delivery

Two asset classes with two header policies:

| Asset | URL | Cache-Control |
|---|---|---|
| Hashed assets (JS, CSS, images, fonts, video built by Vite) | `/assets/name.[hash].ext` | `public, max-age=31536000, immutable` |
| HTML pages, `sw.js`, `manifest.json`, `sitemap.xml` | stable URLs | `public, max-age=0, must-revalidate` (with ETag) or a short `s-maxage` at the CDN |

Example `_headers` (Netlify/Cloudflare Pages; later rules override earlier ones, so the generic
rule goes first; translate to your host):

```
/*
  Cache-Control: public, max-age=0, must-revalidate
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/sw.js
  Cache-Control: no-cache
```

- Everything that can be hashed must be hashed. Reference assets only through the Vite manifest so
  URLs stay correct.
- Enable Brotli (fallback gzip) at the host. Verify with `curl -H "Accept-Encoding: br" -I`.
- Add `Vary: Accept-Encoding`. Do not use `Vary: User-Agent`.
- Serve on HTTP/2 or HTTP/3. Do not domain-shard; keep everything on one origin so preconnect and
  connection reuse work.
- Set `<link rel="preconnect">` only for origins you truly must hit early (usually none).
- If the host supports 103 Early Hints, emit hints for the critical CSS/JS/LCP image.

## 7. Making navigation feel instant

Layer these, in order. The `webcomponent-mpa-spa` skill covers the client-side router in detail;
this section is about network-level speed.

1. **Speculation Rules** (Chromium): a JSON script that prefetches, or prerenders, same-origin links
   with `eagerness: "moderate"` (on hover/pointerdown). Prerender at most a few pages, prefetch
   broadly. Fallback for other browsers: a tiny script that adds `<link rel="prefetch">` on
   `pointerenter`/`touchstart` for links in viewport.
2. **Service worker** (Workbox or hand-written, under 5 KB):
   - Precache the app shell assets from the Vite manifest (JS, CSS, sprite, fonts).
   - Runtime cache HTML pages with **stale-while-revalidate** so return visits render from cache
     immediately and refresh in the background.
   - Cache images with cache-first and a size/age limit (e.g. 200 entries, 30 days).
   - Do not cache videos in the SW; let the browser HTTP cache handle range requests.
   - Enable navigation preload.
   - Register it after `load` so it never competes with the first render.
3. **HTTP cache** correctness (section 6) so that even without a SW, repeat views are cheap.
4. **Cross-document View Transitions** (`@view-transition { navigation: auto; }`) so MPA navigations
   animate like an SPA in supporting browsers at zero JS cost.

## 8. Measure, then enforce

- Run Lighthouse (mobile, throttled) and WebPageTest on the home page and the two heaviest page types
  before and after every optimization. Track FCP, LCP, CLS, INP, TBT, total bytes, request count.
- Add a CI check with `@lhci/cli` (`lhci autorun`) with assertions matching the budgets in section 1,
  and a `budget.json` for resource sizes. Fail the build when a budget is exceeded.
- Look at the waterfall, not only the score: the LCP resource should start downloading before 100 ms
  and there should be no chain of more than two dependent requests before first paint.
- Field data: if analytics is allowed, send `web-vitals` beacons; otherwise rely on CrUX.

## 9. Anti-patterns to reject

- Client-side rendering of page content, or a JS router that is required for the site to work.
- Any framework runtime, jQuery, icon fonts, third-party font hosting, tag managers, chat widgets.
- Unhashed assets with long cache lifetimes, or HTML with long cache lifetimes.
- Lazy loading the LCP image, or omitting width/height anywhere.
- Autoplaying video without a poster or with `preload="auto"`.
- One giant `app.js`: split by route or by component and dynamic-import below-the-fold components.

## Checklist to hand back to the user

When you finish a task with this skill, confirm each item explicitly or list what remains:

- [ ] Every page is complete HTML with inline critical CSS and no blocking scripts
- [ ] LCP element preloaded with `fetchpriority="high"`; all other media lazy
- [ ] Images in AVIF/WebP with srcset/sizes and dimensions; videos with poster, two codecs, correct preload
- [ ] Fonts self-hosted, subset, swapped, or system fonts
- [ ] Hashed immutable assets, revalidating HTML, Brotli, HTTP/2+
- [ ] Speculation rules or hover prefetch, service worker with SWR for HTML
- [ ] Lighthouse CI budgets in place and passing
