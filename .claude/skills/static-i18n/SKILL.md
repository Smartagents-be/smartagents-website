---
name: static-i18n
description: "Use this skill whenever the user's static website needs multiple languages: multilanguage, multilingual, i18n, l10n, translations, language switcher, /en/ and /nl/ style URLs, hreflang, localized SEO, right-to-left support, or per-language sitemaps. Trigger it as soon as more than one language is mentioned for a site, even if the user is currently asking about something else (routing, templates, images with text, video subtitles), because language handling must be designed into the build from the start. Assumes the pre-rendered static architecture from the fast-static-site skill; read that skill first if the project is new."
---

# Static i18n (pre-rendered, one URL per language)

Principle: language is decided at build time, never at runtime. Every page exists once per language
as a complete HTML file under a language-prefixed URL. No client-side string swapping, no JS needed to
show the right language, and each language version is independently cacheable and indexable.

## 1. URL structure and routing

- Pattern: `/{lang}/{path}/` with a trailing slash, e.g. `/en/about/`, `/nl/over-ons/`. `lang` is a
  lowercase BCP 47 tag; use plain language codes (`en`, `nl`, `de`) unless regional variants truly
  differ in content (`en-us`, `en-gb`).
- Output files: `dist/en/about/index.html`, `dist/nl/over-ons/index.html`. Directory-index files give
  clean URLs on every static host.
- The root `/` is not a page. Redirect it to the default language (or the user's preferred language)
  at the hosting layer: a `_redirects` rule (Netlify/Cloudflare) or CloudFront function that reads
  `Accept-Language`, with `302` and `Vary: Accept-Language`. Also ship a fallback `dist/index.html`
  containing `<meta http-equiv="refresh" content="0; url=/en/">` plus a link list of all languages,
  for hosts without redirect support. Never do language detection with JS on a real content page.
- Do not use cookies, query strings or `localStorage` to select language. The URL is the single
  source of truth. Remembering a chosen language is optional and only affects the root redirect.
- Slugs can be translated (`/nl/over-ons/`) or kept identical across languages (`/nl/about/`).
  Translating is better for SEO and users; it requires a slug field per language in the page's
  metadata (see section 3). Choose one approach for the whole site.

## 2. Per-page HTML requirements

Every rendered page must contain:

```html
<html lang="nl" dir="ltr">
<link rel="canonical" href="https://example.com/nl/over-ons/">
<link rel="alternate" hreflang="en" href="https://example.com/en/about/">
<link rel="alternate" hreflang="nl" href="https://example.com/nl/over-ons/">
<link rel="alternate" hreflang="x-default" href="https://example.com/en/about/">
<meta property="og:locale" content="nl_NL">
<meta property="og:locale:alternate" content="en_US">
```

- `hreflang` must list every language version of that page including itself, plus `x-default`
  pointing to the default language. Generate this from the page metadata; never hand-write it.
- `dir="rtl"` for Arabic, Hebrew, Persian, Urdu. Use CSS logical properties everywhere
  (`margin-inline-start`, `padding-block`, `inset-inline`) so RTL needs no separate stylesheet.
- Localize `<title>`, `<meta name="description">`, Open Graph tags, `alt` texts, `aria-label`s,
  form labels, and any text inside SVGs. Missing translations must fail the build (section 4).

## 3. Content and translation files

Two kinds of translatable content:

**UI strings** (navigation, buttons, footer, component labels): flat JSON per language.

```
src/i18n/en.json
src/i18n/nl.json
```

```json
{
  "nav.home": "Home",
  "nav.about": "About us",
  "cta.contact": "Contact us",
  "footer.copyright": "© {year} Example BV"
}
```

- Keys are dot-namespaced, stable, and never contain the English text as key.
- Placeholders use `{name}` and are filled at build time. Plurals use ICU-style branches or a
  helper backed by `Intl.PluralRules`; do not concatenate strings.
- The default language file is the source of truth. A build check reports keys missing from any
  other language.

**Page content** (headings, paragraphs, hero copy): one content file per page per language,
either Markdown with front matter or JSON:

```
src/content/about/en.md
src/content/about/nl.md
```

Front matter per language file carries: `title`, `description`, `slug` (if translated slugs),
`ogImage` (localized image if it contains text), and any page-specific fields. Shared, language
independent data (prices, coordinates, image sources) lives once in `src/content/about/data.json`.

## 4. Build pipeline

In `build/render.mjs` (or the SSG's equivalent):

1. Load `languages` config: ordered list of codes, default language, display names in their own
   language (`Nederlands`, not `Dutch`), `dir`, and the Open Graph locale (`nl_NL`).
2. For each page template and each language: load the language's UI strings and the page's content
   file, compute the URL and the map of alternate URLs, render HTML, write to `dist/{lang}/{slug}/index.html`.
3. Pass a `t(key, params)` function and `lang`, `dir`, `alternates`, `url`, and a `link(pageId)`
   helper into every template and layout. Templates never hard-code visible text, and never
   hard-code paths: navigation and internal links are built with `link()` from page metadata so
   translated slugs stay correct.
4. Fail the build if a language is missing a content file for a page or a UI key, unless the page is
   explicitly marked as not available in that language (then omit it from that language's nav,
   sitemap and hreflang, and do not fall back to another language on that URL).
5. Emit `dist/sitemap.xml` (or one sitemap per language plus an index) with `xhtml:link` alternates,
   and `robots.txt` pointing to it.
6. Emit `dist/index.html` root fallback and the host redirect file. The fallback may include a few
   lines of JS that read `navigator.languages` and redirect before the meta refresh fires.
7. Emit a `404.html` per language (`dist/nl/404.html`) and configure the host to serve it for
   missing paths under `/nl/`; if the host only supports one 404 page, make it language-neutral
   with links to every language home.

Formatting: dates, numbers, currencies via `Intl.DateTimeFormat`, `Intl.NumberFormat`,
`Intl.RelativeTimeFormat` at build time with the page's locale. Never format by hand.

## 5. Language switcher

- A `<nav aria-label="Language">` in the shared layout listing every language as a real `<a>` link
  to the same page in that language (from `alternates`), using the language's own name and
  `lang`/`hreflang` attributes on each link. Mark the current one with `aria-current="true"`.
- No JS is required. If the switcher is a dropdown, use `<details>` or a small web component that
  enhances the plain list.
- Never link the switcher to the home page of the other language when a translated version of the
  current page exists.

## 6. Media

- Images that contain rendered text: one file per language, referenced from the language content
  file. Prefer real HTML text over text in images.
- Videos: one video file, plus per-language subtitle/caption tracks (`<track kind="captions"
  srclang="nl" src="...nl.vtt">`) with the page's language marked `default`. Localize the poster only
  if it contains text.
- Fonts: subset per script and only load the subsets a language needs (Latin for en/nl, Cyrillic
  for ru, and so on). Add `unicode-range` on `@font-face` so the browser fetches only what it uses.

## 7. Web components and language

Components receive text through attributes or slots rendered at build time. A component must never
fetch translation JSON at runtime. If a component needs locale-aware behavior (number formatting in
a calculator, date pickers), read `document.documentElement.lang` and use `Intl`.

## 8. Checks before shipping

- [ ] Every page exists at `/{lang}/...` for every configured language, or is intentionally excluded
- [ ] `lang`, `dir`, canonical, full hreflang set with x-default on every page
- [ ] Root URL redirects at the host and has a static fallback
- [ ] Missing translations fail the build
- [ ] Switcher links to the equivalent page, not the home page
- [ ] Sitemap contains all language versions with alternates
- [ ] RTL languages (if any) render correctly with logical properties
- [ ] Localized titles/descriptions/alt text/OG tags verified in at least two languages
