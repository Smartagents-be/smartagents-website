# Design: Eleventy-Native i18n Refactor

**Date:** 2026-03-19
**Status:** Approved
**Goal:** Replace `scripts/localize-dist.mjs` entirely with native Eleventy i18n — pagination-based locale routing, a `t` filter for translations, schema injection via filter, and a Nunjucks sitemap template.

---

## Problem

`localize-dist.mjs` (651 lines) post-processes the Eleventy `dist/` output using regex-based HTML manipulation to:
- Replace `data-i18n` attribute content with translations
- Generate `/en/` locale routes by copying and re-processing NL dist
- Fix canonical/hreflang/og:url/og:image/og:locale tags
- Rewrite all internal `href` attributes per locale
- Inject structured data schemas
- Generate the sitemap

This approach is fragile (regex on HTML), hard to extend, and reinvents what Eleventy provides natively.

---

## Approach

Eleventy-native with a `t` filter and pagination over locales. Every page renders twice (NL + EN) in a single Eleventy pass. No post-processing script.

---

## Architecture

**Current flow:**
```
source HTML (data-i18n attrs) → Eleventy → dist/ → localize-dist.mjs → final dist/
```

**New flow:**
```
source .html templates ({{ "key" | t(locale) }}) → Eleventy → final dist/
```

**New files:**

| File | Purpose |
|------|---------|
| `_data/i18n.js` | Loads `en.json` + `nl.json`, exports `{ en, nl }` |
| `_data/locales.mjs` | Exports `['nl', 'en']` — pagination source |
| `sitemap.njk` | Generates `sitemap.xml` as Eleventy template |

**Modified files:**

| File | Change |
|------|--------|
| `.eleventy.js` | Registers `t` filter, `buildSchema` filter, `baseUrl` global; removes sitemap passthrough |
| All page `.html` | Pagination front matter + `{{ "key" \| t(locale) }}` (no rename — `htmlTemplateEngine: "njk"` already set) |
| `_includes/header.njk` | Uses `localePrefix` for all internal hrefs; updated lang switcher |
| `_includes/footer.njk` | Uses `localePrefix` for all internal hrefs |
| `_data/shellConfigs.js` | `valuesLink` HTML replaced by `showValuesLink: true/false` flag |

**Deleted:**

- `scripts/localize-dist.mjs`
- `sitemap.xml` (static copy, replaced by template)

---

## Translation & Data Layer

**`_data/i18n.mjs`** (`.mjs` extension required — project is CJS without `"type": "module"`, but Eleventy 3.x supports ESM data files via `.mjs`):
```js
import { readFileSync } from 'node:fs';
export default {
    en: JSON.parse(readFileSync('./i18n/en.json', 'utf8')),
    nl: JSON.parse(readFileSync('./i18n/nl.json', 'utf8'))
};
```

**`_data/locales.mjs`:**
```js
export default ['nl', 'en'];
```

Both files use `.mjs`. `_data/shellConfigs.js` and `.eleventy.js` remain as CJS (`module.exports`). The two new data files reference `i18n` and `locales` respectively in templates, matching their filenames without extension.

**`t` filter in `.eleventy.js`:**
```js
eleventyConfig.addFilter('t', (key, locale) => i18n[locale]?.[key] ?? key);
```

- Missing keys fall back to the key string (visible, not silently empty)
- `i18n/en.json` and `i18n/nl.json` are unchanged **except** for `approach.step1.title` — see note below

**One required i18n change — remove HTML from `approach.step1.title`:**

`en.json` and `nl.json` both have:
```json
"approach.step1.title": "<a href=\"/services/smart-scan/\" ...>Smart Scan</a>"
```

This embedded href cannot be locale-prefixed at the template level. The link is moved into the template; the translation value becomes plain text:
```json
"approach.step1.title": "Smart Scan"
```

The template wraps it with the locale-aware link:
```njk
<a href="{{ localePrefix }}/services/smart-scan/" style="color:inherit;text-decoration:none;">{{ "approach.step1.title" | t(locale) }}</a>
```

Any other translation keys with embedded root-relative hrefs must be audited and handled the same way. (A grep for `href=\\"` in both JSON files reveals only `approach.step1.title` currently has this pattern.)

---

## Routing & Page Structure

Each page defines its NL permalink once. Pagination computes the final URL.

**Front matter pattern:**
```yaml
---
nlPermalink: /services/ai/
shellContext: services
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "{% if locale == 'en' %}/en{{ nlPermalink }}{% else %}{{ nlPermalink }}{% endif %}"
---
```

`shellContext` must be retained on every page that includes `header.njk` or `footer.njk` — it drives `{% set shell = shellConfigs[shellContext] %}` in those includes. Without it, `shell` resolves to `undefined`. The customerzone page has no such includes and does not need `shellContext`.

**Generated routes:**

| Page | NL | EN |
|------|----|----|
| `index.html` | `/` | `/en/` |
| `jobs/jobs.html` | `/jobs/` | `/en/jobs/` |
| `services/ai.html` | `/services/ai/` | `/en/services/ai/` |
| `services/smart-scan.html` | `/services/smart-scan/` | `/en/services/smart-scan/` |
| `customerzone/customerzone.html` | `/customerzone/` | `/en/customerzone/` |

**Canonical + hreflang + og:url in `<head>`:**
```njk
{% set nlUrl = baseUrl + nlPermalink %}
{% set enUrl = baseUrl + "/en" + nlPermalink %}
<link rel="canonical" href="{{ page.url | absoluteUrl(baseUrl) }}">
<link rel="alternate" hreflang="nl" href="{{ nlUrl }}">
<link rel="alternate" hreflang="en" href="{{ enUrl }}">
<link rel="alternate" hreflang="x-default" href="{{ nlUrl }}">
<meta property="og:url" content="{{ page.url | absoluteUrl(baseUrl) }}">
```

**`<html>` lang attribute — templated per locale:**
```njk
<html lang="{{ locale }}">
```
Every page currently has `<html lang="nl">` hardcoded. This becomes `{{ locale }}` so EN output gets `lang="en"`.

**Lang switcher:**
```njk
<a class="lang-btn {% if locale == 'en' %}active{% endif %}" href="{{ enUrl }}">EN</a>
<a class="lang-btn {% if locale == 'nl' %}active{% endif %}" href="{{ nlUrl }}">NL</a>
```

---

## Locale-Aware Internal Links (`locale_url` filter)

`localize-dist.mjs` rewrites every internal `href` in EN output to `/en/...`. In the Eleventy-native approach this is handled by the built-in `EleventyI18nPlugin` which provides the `locale_url` filter. The filter accepts a root-relative NL URL and returns the locale-appropriate version based on the current page's URL.

**Plugin registration in `.eleventy.js`:**
```js
const { EleventyI18nPlugin } = require("@11ty/eleventy");
eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: "nl" });
```

No `localePrefix` variable needed in page templates. All internal hrefs use the filter directly:

```njk
<a href="{{ "/" | locale_url }}">                    {# / (NL) or /en/ (EN) #}
<a href="{{ "/#services" | locale_url }}">           {# /#services or /en/#services #}
<a href="{{ "/jobs/" | locale_url }}">               {# /jobs/ or /en/jobs/ #}
<a href="{{ "/customerzone/" | locale_url }}">       {# /customerzone/ or /en/customerzone/ #}
<a href="{{ "/services/ai/" | locale_url }}">        {# /services/ai/ or /en/services/ai/ #}
```

`locale_url` uses `page.url` to detect the current locale from the URL structure (`/en/...` prefix = EN, no prefix = NL). It works inside `{% include %}` files because Nunjucks includes inherit the calling template's `page` context.

**`shell.*` properties in `shellConfigs.js` remain plain NL strings** — `locale_url` handles the rewriting at the template level:
```njk
<a href="{{ shell.homeHref | locale_url }}">        {# shell.homeHref = "/" #}
<a href="{{ shell.jobsHref | locale_url }}">        {# shell.jobsHref = "/jobs/" #}
```

**`nlUrl` and `enUrl`** — still computed in page templates for the lang switcher and hreflang tags:
```njk
{% set nlUrl = baseUrl + nlPermalink %}
{% set enUrl = baseUrl + "/en" + nlPermalink %}
```

**Page body links** — all internal hrefs use `| locale_url`: back-links `"/#services"`, service card links `"/services/ai/"`, CTA buttons `"/#contact"`, `_next` values. ~40 hrefs updated across all pages.

**`shellConfigs.js` — `valuesLink` replaced by a flag:**

The `valuesLink` property is currently a raw HTML string (e.g. `<li><a href="/#vision-mission" ...>`). Raw HTML strings cannot contain locale-aware Nunjucks expressions, so `valuesLink` is replaced with a boolean flag `showValuesLink`. The link moves into `header.njk` and `footer.njk` using `locale_url`:

```js
// shellConfigs.js
home:     { showValuesLink: true,  ... }
services: { showValuesLink: true,  ... }
jobs:     { showValuesLink: true,  ... }
```

```njk
<!-- header.njk -->
{% if shell.showValuesLink %}
<li><a href="{{ "/#vision-mission" | locale_url }}">{{ "nav.values" | t(locale) }}</a></li>
{% endif %}
```

---

## Customerzone Page

`customerzone/customerzone.html` is standalone — it has no `{% include "header.njk" %}` or `{% include "footer.njk" %}`. It must:

1. Add `nlPermalink: /customerzone/` to front matter (required for canonical/hreflang/og:url computation in `<head>`)
2. Set `{% set localePrefix = '/en' if locale == 'en' else '' %}` at the top of its body
3. Replace all `data-i18n` attribute translations with `| t(locale)` filter calls
4. Update its single internal link `href="/"` to `href="{{ localePrefix }}/"` (back to homepage)
5. Set `excludeFromSitemap: true` in front matter (already specified in the sitemap section)
6. Add `socialImage` and `socialAlt` front matter fields; omit `schemaType` (no schema generated for customerzone)

---

## Template Changes

**`data-i18n` attribute → filter call:**
```njk
<!-- before -->
<h1 data-i18n="hero.title">Transform your business...</h1>

<!-- after -->
<h1>{{ "hero.title" | t(locale) }}</h1>
```

**Page meta (`data-i18n-page`):**
```njk
<!-- before -->
<title data-i18n-page="page.index.title">SmartAgents | AI...</title>

<!-- after -->
<title>{{ "page.index.title" | t(locale) }}</title>
```

**Form inputs with translated values (`data-i18n-value`):**
```njk
<!-- before -->
<input name="_subject" value="Nieuw bericht..." data-i18n-value="contact.form.subject">

<!-- after -->
<input name="_subject" value="{{ 'contact.form.subject' | t(locale) }}">
```

**Contact submit button — `data-label-*` baked directly into source:**

The current source button has no `data-label-*` attributes — they are injected entirely by `localize-dist.mjs`. In the migrated template, all three attributes are added to the source button directly:

```njk
<button type="submit"
  data-label-default="{{ 'contact.form.submit' | t(locale) }}"
  data-label-success="{{ 'contact.form.success' | t(locale) }}"
  data-label-error="{{ 'contact.form.error' | t(locale) }}">
  {{ "contact.form.submit" | t(locale) }}
</button>
```

**`_next` hidden input — remove `data-localize-next`, template the value:**

The current source has `data-localize-next="contact"` — a custom attribute used only by the old post-processor. It is removed in the migration. The value is templated directly:

```njk
<input type="hidden" name="_next"
  value="{{ baseUrl }}{{ localePrefix }}/#contact">
```

**Scope:** ~350 attribute replacements + ~40 internal href updates across 10 pages + 2 includes.

---

## Social Meta & Open Graph

`localize-dist.mjs` sets per-page, per-locale social meta tags from `routeMetadata`. In the Eleventy-native approach each page declares these in front matter, and the `<head>` template reads them directly.

**Front matter additions per page:**
```yaml
socialImage: /assets/agent-network.svg
socialAlt:
  nl: Illustratie van verbonden AI-agents
  en: Illustration of connected AI agents
```

**`<head>` template:**
```njk
{% set ogLocale = 'nl_BE' if locale == 'nl' else 'en_US' %}
{% set ogLocaleAlt = 'en_US' if locale == 'nl' else 'nl_BE' %}
{% set resolvedSocialImage = baseUrl + socialImage %}
{% set resolvedSocialAlt = socialAlt[locale] %}

<meta property="og:locale" content="{{ ogLocale }}">
<meta property="og:locale:alternate" content="{{ ogLocaleAlt }}">
<meta property="og:image" content="{{ resolvedSocialImage }}">
<meta property="og:image:alt" content="{{ resolvedSocialAlt }}">
<meta name="twitter:image" content="{{ resolvedSocialImage }}">
<meta name="twitter:image:alt" content="{{ resolvedSocialAlt }}">
```

---

## Schema Injection

Moves from `localize-dist.mjs` into `.eleventy.js` as a `buildSchema` filter.

**Note on existing static schemas:** `index.html` already contains two hardcoded `<script type="application/ld+json">` blocks (Organization + WebSite schemas). These remain as-is — they are not generated by `buildPageSchemas()` and are not replaced by the filter.

Each page declares its schema type in front matter:

```yaml
schemaType: service          # home | service | jobs | (omit for no schema)
serviceNameKey: services.ai.title
postedDate: "2026-03-19"     # jobs page only; omit to use page.date
```

Filter usage in `<head>`:
```njk
{% set schemaData = { schemaType: schemaType, serviceNameKey: serviceNameKey, nlPermalink: nlPermalink, pageUrl: page.url, postedDate: postedDate } %}
{% set schema = schemaData | buildSchema(locale) %}
{% if schema %}
<script type="application/ld+json">{{ schema | safe }}</script>
{% endif %}
```

The schema-building logic from `buildPageSchemas()` moves verbatim into the filter with three changes:
1. `postedDate` comes from front matter (`postedDate` field) rather than `routeMetadata`, falling back to Eleventy's `page.date` formatted as `YYYY-MM-DD`
2. `serviceNameKey` is a translation key string (e.g. `"services.ai.title"`) — the filter resolves it via `i18n[locale][serviceNameKey]`, the same `i18n` object loaded at `.eleventy.js` startup
3. `pageUrl` is the locale-resolved URL (`page.url` from Eleventy, e.g. `/en/services/ai/` for EN) — used for all `url` fields in schema output (Service url, BreadcrumbList items, JobPosting url). The old script computed this from `toPublicUrl(relPath, locale)`; `page.url` is the direct equivalent

---

## Sitemap

Replaces `writeSitemap()` with a `sitemap.njk` template. Pages excluded from the sitemap (customerzone) set `excludeFromSitemap: true` in front matter.

```yaml
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
```

(`eleventyExcludeFromCollections: true` prevents the sitemap template itself from appearing in `collections.all`. The `excludeFromSitemap: true` pattern is only for content pages like customerzone.)

```njk
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {%- for p in collections.all %}
  {%- if not p.data.excludeFromSitemap %}
  <url>
    <loc>{{ baseUrl }}{{ p.url }}</loc>
    <lastmod>{{ p.date | dateToFormat("yyyy-MM-dd") }}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>{{ "1.0" if p.url == "/" or p.url == "/en/" else "0.8" }}</priority>
  </url>
  {%- endif %}
  {%- endfor %}
</urlset>
```

**`lastmod` source:** Eleventy's `page.date` defaults to file creation date locally and build date on Netlify. To preserve current behavior (source file mtime), each page front matter should set:
```yaml
date: git Last Modified
```
This instructs Eleventy to use the last git commit date for the file, which is stable across CI builds.

---

## Build Pipeline

**`package.json`:**
```json
"scripts": {
  "build": "node scripts/clean-dist.mjs && eleventy",
  "serve:dist": "node scripts/serve-dist.mjs"
}
```

**`.eleventy.js` changes:**
- Add: `EleventyI18nPlugin` (built-in, provides `locale_url` filter):
  ```js
  const { EleventyI18nPlugin } = require("@11ty/eleventy");
  eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: "nl" });
  ```
- Add: `t` filter
- Add: `buildSchema` filter
- Add: `absoluteUrl` filter — not a built-in Eleventy filter; define it directly:
  ```js
  eleventyConfig.addFilter('absoluteUrl', (url, base) => new URL(url, base).href);
  ```
- Add: `dateToFormat` filter — not built-in; define using JS:
  ```js
  eleventyConfig.addFilter('dateToFormat', (date, fmt) => {
      const d = date instanceof Date ? date : new Date(date);
      return d.toISOString().slice(0, 10); // always produces YYYY-MM-DD
  });
  ```
  (The `fmt` argument is accepted but unused — only `YYYY-MM-DD` format is needed for the sitemap.)
- Add: `baseUrl` global data (`https://smartagents.be`)
- Remove: `sitemap.xml` passthrough copy

**Unchanged:**
- `main.js`, `styles.css`, `assets/`
- `i18n/en.json`, `i18n/nl.json`
- `scripts/clean-dist.mjs`, `scripts/serve-dist.mjs`

---

## What Gets Deleted

- `scripts/localize-dist.mjs`
- `sitemap.xml`
