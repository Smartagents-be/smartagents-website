# Eleventy-Native i18n Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `scripts/localize-dist.mjs` (651 lines of post-processing regex) with native Eleventy pagination-based locale routing, a `t` Nunjucks filter, and a sitemap template — so the build becomes a single `eleventy` pass with no post-processing.

**Architecture:** Every page paginates over `['nl', 'en']`, rendering twice with the correct permalink. A `t(locale)` filter replaces all `data-i18n` attributes. A `localePrefix` variable (`''` or `'/en'`) is set in each page template and propagates into shared includes, rewriting all internal hrefs for EN.

**Tech Stack:** Eleventy 3.x, Nunjucks, Node.js CJS (`.eleventy.js`) + ESM (`.mjs` data files), `i18n/en.json` + `i18n/nl.json`

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `_data/i18n.mjs` | Loads both JSON files, exports `{ en, nl }` |
| Create | `_data/locales.mjs` | Exports `['nl', 'en']` — pagination source |
| Create | `sitemap.njk` | Generates `sitemap.xml` as Eleventy template |
| Modify | `.eleventy.js` | Registers `EleventyI18nPlugin` (provides `locale_url`); adds `t`, `buildSchema`, `absoluteUrl`, `dateToFormat` filters + `baseUrl` global; removes `sitemap.xml` passthrough |
| Modify | `_data/shellConfigs.js` | Replaces `valuesLink` HTML string with `showValuesLink: true/false` |
| Modify | `_includes/header.njk` | `localePrefix` on all hrefs; `showValuesLink` conditional; `t(locale)` filter |
| Modify | `_includes/footer.njk` | `localePrefix` on all hrefs; `t(locale)` filter |
| Modify | `i18n/en.json` | `approach.step1.title` → plain text `"Smart Scan"` |
| Modify | `i18n/nl.json` | `approach.step1.title` → plain text `"Smart Scan"` |
| Modify | `index.html` | Pagination front matter + all `data-i18n` → `t(locale)` + `localePrefix` hrefs + social/schema front matter |
| Modify | `jobs/jobs.html` | Same pattern as index.html |
| Modify | `services/ai.html` | Same pattern |
| Modify | `services/agentic-ai.html` | Same pattern |
| Modify | `services/automation.html` | Same pattern |
| Modify | `services/process-optimization.html` | Same pattern |
| Modify | `services/secure.html` | Same pattern |
| Modify | `services/smart-scan.html` | Same pattern (58 data-i18n attrs — largest service page) |
| Modify | `services/training.html` | Same pattern |
| Modify | `customerzone/customerzone.html` | Standalone page — pagination front matter + `localePrefix` + `t(locale)`, no header/footer includes |
| Delete | `scripts/localize-dist.mjs` | Replaced by native Eleventy |
| Delete | `sitemap.xml` | Replaced by `sitemap.njk` |

---

## Task 1: Eleventy Foundation

**Files:**
- Create: `_data/i18n.mjs`
- Create: `_data/locales.mjs`
- Modify: `.eleventy.js`
- Modify: `package.json`

- [ ] **Step 1: Create `_data/i18n.mjs`**

```js
import { readFileSync } from 'node:fs';
export default {
    en: JSON.parse(readFileSync('./i18n/en.json', 'utf8')),
    nl: JSON.parse(readFileSync('./i18n/nl.json', 'utf8'))
};
```

- [ ] **Step 2: Create `_data/locales.mjs`**

```js
export default ['nl', 'en'];
```

- [ ] **Step 3: Add plugin, filters and global data to `.eleventy.js`**

At the top of `.eleventy.js`, after the existing `module.exports = function(eleventyConfig) {` line, add:

```js
const { readFileSync } = require('node:fs');
const { EleventyI18nPlugin } = require("@11ty/eleventy");
const i18n = {
    en: JSON.parse(readFileSync('./i18n/en.json', 'utf8')),
    nl: JSON.parse(readFileSync('./i18n/nl.json', 'utf8'))
};

// Built-in i18n plugin — provides locale_url filter
eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: "nl" });

// Translation filter: {{ "key" | t(locale) }}
eleventyConfig.addFilter('t', (key, locale) => i18n[locale]?.[key] ?? key);

// Absolute URL filter: {{ page.url | absoluteUrl(baseUrl) }}
eleventyConfig.addFilter('absoluteUrl', (url, base) => new URL(url, base).href);

// Date format filter for sitemap: {{ page.date | dateToFormat("yyyy-MM-dd") }}
eleventyConfig.addFilter('dateToFormat', (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 10);
});

// Schema builder filter: {{ schemaData | buildSchema(locale) }}
eleventyConfig.addFilter('buildSchema', function(pageData, locale) {
    const dict = i18n[locale];
    const baseUrl = 'https://smartagents.be';
    const { schemaType, serviceNameKey, nlPermalink, pageUrl, postedDate } = pageData;

    if (!schemaType) return '';

    const pageTitle = pageData.pageKey ? dict[`page.${pageData.pageKey}.title`] : null;
    const pageDescription = pageData.pageKey ? dict[`page.${pageData.pageKey}.description`] : null;
    const pageImage = `${baseUrl}${pageData.socialImage || '/assets/logo.svg'}`;
    const schemas = [];

    if (schemaType === 'home') {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: pageTitle,
            description: pageDescription,
            url: `${baseUrl}${pageUrl}`,
            inLanguage: locale,
            image: pageImage,
            isPartOf: { '@type': 'WebSite', name: 'SmartAgents', url: baseUrl }
        });
    }

    if (schemaType === 'service') {
        const serviceName = dict[serviceNameKey] || pageTitle;
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: serviceName,
            serviceType: serviceName,
            description: pageDescription,
            url: `${baseUrl}${pageUrl}`,
            image: pageImage,
            provider: { '@type': 'Organization', name: 'SmartAgents', url: baseUrl },
            areaServed: { '@type': 'Country', name: 'Belgium' },
            offers: { '@type': 'Offer', url: `${baseUrl}${pageUrl}` }
        });
        schemas.push(buildBreadcrumb(locale, dict, baseUrl, pageUrl, serviceName, nlPermalink));
    }

    if (schemaType === 'jobs') {
        const datePosted = postedDate || new Date().toISOString().slice(0, 10);
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: dict['jobs.role.title'],
            description: `${dict['page.jobs.description']} ${stripHtml(dict['jobs.cta.text'])}`,
            datePosted,
            employmentType: 'FULL_TIME',
            jobLocationType: 'TELECOMMUTE',
            applicantLocationRequirements: { '@type': 'Country', name: 'Belgium' },
            hiringOrganization: {
                '@type': 'Organization',
                name: 'SmartAgents',
                sameAs: baseUrl,
                logo: `${baseUrl}/assets/logo.svg`
            },
            url: `${baseUrl}${pageUrl}`,
            directApply: false
        });
        schemas.push(buildBreadcrumb(locale, dict, baseUrl, pageUrl, dict['nav.jobs'], nlPermalink));
    }

    const filtered = schemas.filter(Boolean);
    if (filtered.length === 0) return '';
    const payload = filtered.length === 1 ? filtered[0] : filtered;
    return JSON.stringify(payload, null, 4);
});

// Global data
eleventyConfig.addGlobalData('baseUrl', 'https://smartagents.be');
```

Also add these helper functions inside the same `module.exports` scope (or just before it at module level):

```js
function buildBreadcrumb(locale, dict, baseUrl, pageUrl, currentLabel, nlPermalink) {
    const homeUrl = locale === 'en' ? `${baseUrl}/en/` : `${baseUrl}/`;
    const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl }];
    if (nlPermalink && nlPermalink.startsWith('/services/')) {
        const servicesUrl = locale === 'en' ? `${baseUrl}/en/#services` : `${baseUrl}/#services`;
        items.push({ '@type': 'ListItem', position: 2, name: dict['nav.services'], item: servicesUrl });
        items.push({ '@type': 'ListItem', position: 3, name: currentLabel, item: `${baseUrl}${pageUrl}` });
    } else {
        items.push({ '@type': 'ListItem', position: 2, name: currentLabel, item: `${baseUrl}${pageUrl}` });
    }
    return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function stripHtml(value) {
    return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
```

Remove the `sitemap.xml` passthrough copy line:
```js
// DELETE this line:
eleventyConfig.addPassthroughCopy("sitemap.xml");
```

- [ ] **Step 4: Update `package.json` build script**

Change:
```json
"build": "node scripts/clean-dist.mjs && eleventy && node scripts/localize-dist.mjs"
```
To:
```json
"build": "node scripts/clean-dist.mjs && eleventy"
```

- [ ] **Step 5: Verify build runs without errors (it will produce incomplete output — that's expected)**

```bash
npm run build 2>&1 | head -30
```
Expected: Eleventy runs and writes files. Some pages will render with missing content until tasks 5–9 are complete. No JS errors or Eleventy crashes.

- [ ] **Step 6: Commit**

```bash
git add _data/i18n.mjs _data/locales.mjs .eleventy.js package.json
git commit -m "feat: add Eleventy t/buildSchema/absoluteUrl/dateToFormat filters and i18n data files"
```

---

## Task 2: Shell Layer — `shellConfigs.js`, `header.njk`, `footer.njk`

**Files:**
- Modify: `_data/shellConfigs.js`
- Modify: `_includes/header.njk`
- Modify: `_includes/footer.njk`

- [ ] **Step 1: Update `_data/shellConfigs.js` — replace `valuesLink` with `showValuesLink`**

Replace the entire file content with:

```js
module.exports = {
  home: {
    homeHref: "/",
    homeSectionPrefix: "/",
    servicesPrefix: "/services/",
    jobsHref: "/jobs/",
    customerzoneHref: "/customerzone/",
    logoSrc: "/assets/logo.svg",
    showValuesLink: true,
    servicesActive: "",
    jobsActive: ""
  },
  services: {
    homeHref: "/",
    homeSectionPrefix: "/",
    servicesPrefix: "/services/",
    jobsHref: "/jobs/",
    customerzoneHref: "/customerzone/",
    logoSrc: "/assets/logo.svg",
    showValuesLink: true,
    servicesActive: "active",
    jobsActive: ""
  },
  jobs: {
    homeHref: "/",
    homeSectionPrefix: "/",
    servicesPrefix: "/services/",
    jobsHref: "/jobs/",
    customerzoneHref: "/customerzone/",
    logoSrc: "/assets/logo.svg",
    showValuesLink: true,
    servicesActive: "",
    jobsActive: "active"
  }
};
```

- [ ] **Step 2: Replace `_includes/header.njk`**

```njk
{% set shell = shellConfigs[shellContext] %}
<nav class="navbar">
    <div class="nav-container">
        <a href="{{ shell.homeHref | locale_url }}" class="logo">
            <img src="{{ shell.logoSrc }}" alt="SmartAgents" class="logo-icon">
            <div class="logo-text">
                <span>SmartAgents</span>
                <small class="logo-tagline">{{ "footer.tagline" | t(locale) }}</small>
            </div>
        </a>
        <ul class="nav-links">
            <li class="nav-dropdown">
                <a href="{{ "/#services" | locale_url }}" class="{{ shell.servicesActive }}">{{ "nav.services" | t(locale) }}</a>
                <ul class="nav-submenu">
                    <li><a href="{{ "/services/ai/" | locale_url }}">{{ "services.ai.title" | t(locale) }}</a></li>
                    <li><a href="{{ "/services/agentic-ai/" | locale_url }}">{{ "services.agentic.title" | t(locale) }}</a></li>
                    <li><a href="{{ "/services/process-optimization/" | locale_url }}">{{ "services.process.title" | t(locale) }}</a></li>
                    <li><a href="{{ "/services/automation/" | locale_url }}">{{ "services.automation.title" | t(locale) }}</a></li>
                    <li><a href="{{ "/services/training/" | locale_url }}">{{ "services.training.title" | t(locale) }}</a></li>
                    <li><a href="{{ "/services/secure/" | locale_url }}">{{ "services.secure.title" | t(locale) }}</a></li>
                    <li><a href="{{ "/services/smart-scan/" | locale_url }}">{{ "services.smartscan.title" | t(locale) }}</a></li>
                </ul>
            </li>
            <li><a href="{{ "/#about" | locale_url }}">{{ "nav.about" | t(locale) }}</a></li>
            {% if shell.showValuesLink %}
            <li><a href="{{ "/#vision-mission" | locale_url }}">{{ "nav.values" | t(locale) }}</a></li>
            {% endif %}
            <li><a href="{{ "/#team" | locale_url }}">{{ "nav.team" | t(locale) }}</a></li>
            <li><a href="{{ "/#contact" | locale_url }}">{{ "nav.contact" | t(locale) }}</a></li>
            <li><a href="{{ shell.jobsHref | locale_url }}" class="{{ shell.jobsActive }}">{{ "nav.jobs" | t(locale) }}</a></li>
            <li class="mobile-only"><a href="{{ shell.customerzoneHref | locale_url }}">{{ "nav.customerzone" | t(locale) }}</a></li>
        </ul>
        <a href="{{ shell.customerzoneHref | locale_url }}" class="btn btn-primary btn-nav">{{ "nav.customerzone" | t(locale) }}</a>
        <div class="lang-switcher">
            <a class="lang-btn {% if locale == 'en' %}active{% endif %}" data-lang-link="en" href="{{ enUrl }}">EN</a>
            <a class="lang-btn {% if locale == 'nl' %}active{% endif %}" data-lang-link="nl" href="{{ nlUrl }}">NL</a>
        </div>
        <button class="mobile-menu-btn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</nav>
```

Note: `enUrl` and `nlUrl` are computed in the page template and propagate into this include. `locale_url` uses `page.url` (also inherited via Nunjucks scope) to detect the current locale.

- [ ] **Step 3: Replace `_includes/footer.njk`**

Replace the entire file. Key changes: all `shell.*` hrefs get `{{ localePrefix }}` prepended, all `data-i18n` attributes become `| t(locale)` filter calls, Smart Scan link gets `data-i18n`. Keep all existing SVG social icons unchanged.

The footer structure stays the same. Replace every:
- `href="{{ shell.homeHref }}"` → `href="{{ shell.homeHref | locale_url }}"`
- `href="{{ shell.homeSectionPrefix }}#services"` → `href="{{ "/#services" | locale_url }}"` (and similarly for `"/#about"`, `"/#team"`, `"/#contact"`, `"/#vision-mission"`)
- `href="{{ shell.jobsHref }}"` → `href="{{ shell.jobsHref | locale_url }}"`
- `href="{{ shell.servicesPrefix }}ai/"` → `href="{{ "/services/ai/" | locale_url }}"` (and all other service links — inline full NL path, pipe through `locale_url`)
- `data-i18n="key">Text</tag>` → remove `data-i18n` attribute, replace `Text` with `{{ "key" | t(locale) }}`
- `{{ shell.valuesLink | safe }}` → `{% if shell.showValuesLink %}<li><a href="{{ "/#vision-mission" | locale_url }}">{{ "nav.values" | t(locale) }}</a></li>{% endif %}`

Note: Smart Scan link also gets `| locale_url` (not `data-i18n` — that was a wording error in the earlier draft).

- [ ] **Step 4: Build and spot-check header/footer output**

```bash
npm run build 2>&1 | tail -5
```
Expected: Build completes. Then check:
```bash
grep -c "localePrefix\|data-i18n" dist/index.html
```
Expected: `0` — no raw `localePrefix` variable names or `data-i18n` attributes in output (index.html not yet migrated, so it may still have them — that's fine for now, just confirm no template errors).

```bash
grep "nav.services\|nav.about" dist/index.html | head -3
```
Expected: No raw key strings — the nav renders translated text since header.njk now uses `| t(locale)`.

- [ ] **Step 5: Commit**

```bash
git add _data/shellConfigs.js _includes/header.njk _includes/footer.njk
git commit -m "feat: migrate header/footer to locale-aware localePrefix and t(locale) filter"
```

---

## Task 3: Sitemap Template

**Files:**
- Create: `sitemap.njk`
- Delete: `sitemap.xml`

- [ ] **Step 1: Create `sitemap.njk` at the project root**

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
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

- [ ] **Step 2: Delete `sitemap.xml`**

```bash
rm /Users/tomhaeldermans/SmartAgents-Code/smartagents-website/sitemap.xml
```

- [ ] **Step 3: Verify sitemap output after build**

```bash
npm run build 2>&1 | tail -3
cat dist/sitemap.xml | head -20
```
Expected: Valid XML with `<url>` entries. At this point only the pages already migrated (none yet) appear — the sitemap will grow as tasks 5–9 complete.

- [ ] **Step 4: Commit**

```bash
git add sitemap.njk
git rm sitemap.xml
git commit -m "feat: replace static sitemap.xml with Eleventy sitemap.njk template"
```

---

## Task 4: Fix `approach.step1.title` in i18n JSON

**Files:**
- Modify: `i18n/en.json`
- Modify: `i18n/nl.json`

Background: Both files have `"approach.step1.title"` with an embedded `<a href="/services/smart-scan/">` HTML anchor. This href cannot be locale-prefixed at template level when it lives inside a JSON value. The link moves into the template; the JSON value becomes plain text.

- [ ] **Step 1: Update `i18n/en.json`**

Find line: `"approach.step1.title": "<a href=\"/services/smart-scan/\" style=\"color:inherit;text-decoration:none;\">Smart Scan</a>"`
Replace with: `"approach.step1.title": "Smart Scan"`

- [ ] **Step 2: Update `i18n/nl.json`**

Find line: `"approach.step1.title": "<a href=\"/services/smart-scan/\" style=\"color:inherit;text-decoration:none;\">Smart Scan</a>"`
Replace with: `"approach.step1.title": "Smart Scan"`

(The link wrapping will be added back in Task 5 when `index.html` is migrated — the approach step template wraps it with `<a href="{{ localePrefix }}/services/smart-scan/" ...>{{ "approach.step1.title" | t(locale) }}</a>`.)

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('i18n/en.json','utf8')); console.log('en.json OK')"
node -e "JSON.parse(require('fs').readFileSync('i18n/nl.json','utf8')); console.log('nl.json OK')"
```
Expected: both print `OK`.

- [ ] **Step 4: Commit**

```bash
git add i18n/en.json i18n/nl.json
git commit -m "fix: extract approach.step1.title href from i18n JSON to template"
```

---

## Task 5: Migrate `index.html`

**Files:**
- Modify: `index.html`

This is the largest page (86 `data-i18n` attributes). Work through it section by section.

- [ ] **Step 1: Replace front matter**

Current front matter:
```yaml
---
permalink: /
shellContext: home
---
```
Replace with:
```yaml
---
nlPermalink: /
shellContext: home
date: git Last Modified
socialImage: /assets/agent-network.svg
socialAlt:
  nl: Illustratie van verbonden AI-agents
  en: Illustration of connected AI agents
schemaType: home
pageKey: index
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "{% if locale == 'en' %}/en{{ nlPermalink }}{% else %}{{ nlPermalink }}{% endif %}"
---
```

- [ ] **Step 2: Update `<html>` tag and add URL vars at top of `<body>`**

Change:
```html
<html lang="nl">
```
To:
```njk
<html lang="{{ locale }}">
```

At the very start of `<body>`, before `{% include "header.njk" %}`, add:
```njk
{% set nlUrl = baseUrl + '/' %}
{% set enUrl = baseUrl + '/en/' %}
```

No `localePrefix` variable needed — all internal hrefs use `| locale_url` instead (see Steps 5–7).

- [ ] **Step 3: Replace `<head>` meta tags**

Replace:
```html
<title data-i18n-page="page.index.title">SmartAgents | AI & Process Automation Solutions</title>
<meta name="description" data-i18n-page="page.index.description" content="...">
```
With:
```njk
<title>{{ "page.index.title" | t(locale) }}</title>
<meta name="description" content="{{ 'page.index.description' | t(locale) }}">
```

Replace the hardcoded canonical/hreflang/og block with:
```njk
<link rel="canonical" href="{{ page.url | absoluteUrl(baseUrl) }}">
<link rel="alternate" hreflang="nl" href="{{ nlUrl }}">
<link rel="alternate" hreflang="en" href="{{ enUrl }}">
<link rel="alternate" hreflang="x-default" href="{{ nlUrl }}">
<meta property="og:url" content="{{ page.url | absoluteUrl(baseUrl) }}">
```

Note: use `nlUrl`/`enUrl` (set in Step 2, computed from `nlPermalink`) — NOT hardcoded `baseUrl + "/"`. This pattern is reused verbatim in Tasks 6–9 where `nlPermalink` is page-specific.

Replace hardcoded OG/Twitter title and description with `| t(locale)` equivalents. Replace `og:locale`, `og:locale:alternate`, `og:image`, `og:image:alt`, `twitter:image`, `twitter:image:alt`:
```njk
{% set ogLocale = 'nl_BE' if locale == 'nl' else 'en_US' %}
{% set ogLocaleAlt = 'en_US' if locale == 'nl' else 'nl_BE' %}
{% set resolvedSocialImage = baseUrl + socialImage %}
{% set resolvedSocialAlt = socialAlt[locale] %}
<meta property="og:title" content="{{ 'page.index.title' | t(locale) }}">
<meta property="og:description" content="{{ 'page.index.description' | t(locale) }}">
<meta property="og:locale" content="{{ ogLocale }}">
<meta property="og:locale:alternate" content="{{ ogLocaleAlt }}">
<meta property="og:image" content="{{ resolvedSocialImage }}">
<meta property="og:image:alt" content="{{ resolvedSocialAlt }}">
<meta name="twitter:title" content="{{ 'page.index.title' | t(locale) }}">
<meta name="twitter:description" content="{{ 'page.index.description' | t(locale) }}">
<meta name="twitter:image" content="{{ resolvedSocialImage }}">
<meta name="twitter:image:alt" content="{{ resolvedSocialAlt }}">
```

Add schema injection just before `</head>`:
```njk
{% set schemaData = { schemaType: schemaType, pageKey: pageKey, socialImage: socialImage, nlPermalink: nlPermalink, pageUrl: page.url } %}
{% set schema = schemaData | buildSchema(locale) %}
{% if schema %}
<script type="application/ld+json" data-generated-schema="page">{{ schema | safe }}</script>
{% endif %}
```

**Important:** `index.html` already contains two static `<script type="application/ld+json">` blocks (Organization and WebSite schemas). Do NOT remove them — they are not generated by `buildSchema` and must stay in the `<head>`. The new `buildSchema` injection is added alongside them, not instead of them.

- [ ] **Step 4: Replace all `data-i18n` and `data-i18n-page` attributes in body**

For every element with `data-i18n="key"`:
- Remove the `data-i18n="key"` attribute
- Replace the inner text with `{{ "key" | t(locale) }}`

Example pattern:
```html
<!-- before -->
<h2 class="section-title" data-i18n="services.title">Our Services</h2>
<!-- after -->
<h2 class="section-title">{{ "services.title" | t(locale) }}</h2>
```

For `data-i18n-value` (hidden subject input):
```njk
<input type="hidden" name="_subject" value="{{ 'contact.form.subject' | t(locale) }}">
```

- [ ] **Step 5: Update all internal hrefs to use `locale_url`**

Every `href="/services/..."`, `href="/#..."`, `href="/jobs/"` in the page body gets `| locale_url` applied. Service card links:
```njk
<a href="{{ "/services/ai/" | locale_url }}" class="btn btn-secondary btn-sm">{{ "services.learnmore" | t(locale) }}</a>
```

Hero CTAs:
```njk
<a href="{{ "/#contact" | locale_url }}" class="btn btn-primary">{{ "hero.cta.primary" | t(locale) }}</a>
<a href="{{ "/#services" | locale_url }}" class="btn btn-secondary">{{ "hero.cta.secondary" | t(locale) }}</a>
```

- [ ] **Step 6: Update the approach step 1 link (wraps the now-plain-text translation)**

Find the approach step 1 title element and replace with:
```njk
<h3><a href="{{ "/services/smart-scan/" | locale_url }}" style="color:inherit;text-decoration:none;">{{ "approach.step1.title" | t(locale) }}</a></h3>
```

- [ ] **Step 7: Update contact form**

Replace `_next` input and submit button:
```njk
<input type="hidden" name="_next" value="{{ baseUrl }}{{ "/#contact" | locale_url }}">
```
```njk
<button type="submit" class="btn btn-primary"
  data-label-default="{{ 'contact.form.submit' | t(locale) }}"
  data-label-success="{{ 'contact.form.success' | t(locale) }}"
  data-label-error="{{ 'contact.form.error' | t(locale) }}">
  {{ "contact.form.submit" | t(locale) }}
</button>
```
Remove the `data-localize-next="contact"` attribute from the `_next` input.

- [ ] **Step 8: Build and verify NL and EN output**

```bash
npm run build 2>&1 | tail -5
```
Expected: Build succeeds, 20 files written (10 pages × 2 locales).

```bash
# Check NL homepage title
grep "<title>" dist/index.html

# Check EN homepage title
grep "<title>" dist/en/index.html

# Check EN canonical
grep "canonical" dist/en/index.html

# Check lang attribute
grep "<html" dist/index.html dist/en/index.html

# Check EN service link is prefixed correctly by locale_url
grep "/en/services/ai/" dist/en/index.html | head -2

# Confirm no raw locale_url filter artifacts left in output
grep -c "locale_url\|data-i18n" dist/index.html

# Check submit button has data-label-* in both locales
grep "data-label-success" dist/index.html dist/en/index.html
```

Expected:
- NL title contains Dutch text, EN title contains English text
- `<html lang="nl">` in `dist/index.html`, `<html lang="en">` in `dist/en/index.html`
- EN canonical = `https://smartagents.be/en/`
- `/en/services/ai/` appears in EN output
- Both have `data-label-success` with locale-correct text

- [ ] **Step 9: Commit**

```bash
git add index.html i18n/en.json i18n/nl.json
git commit -m "feat: migrate index.html to Eleventy-native i18n pagination"
```

---

## Task 6: Migrate Service Pages (6 standard pages)

**Files:**
- Modify: `services/ai.html`
- Modify: `services/agentic-ai.html`
- Modify: `services/automation.html`
- Modify: `services/process-optimization.html`
- Modify: `services/secure.html`
- Modify: `services/training.html`

All 6 follow the identical pattern. Apply to each in sequence.

**Per-page front matter values:**

| Page | `nlPermalink` | `pageKey` | `schemaType` | `serviceNameKey` | `socialImage` | `socialAlt.nl` | `socialAlt.en` |
|------|--------------|-----------|-------------|-----------------|--------------|----------------|----------------|
| `ai.html` | `/services/ai/` | `ai` | `service` | `services.ai.title` | `/assets/agent-network.svg` | `Illustratie van verbonden AI-agents` | `Illustration of connected AI agents` |
| `agentic-ai.html` | `/services/agentic-ai/` | `agentic` | `service` | `services.agentic.title` | `/assets/agent-network.svg` | (same as above) | (same as above) |
| `automation.html` | `/services/automation/` | `automation` | `service` | `services.automation.title` | `/assets/agent-network.svg` | (same) | (same) |
| `process-optimization.html` | `/services/process-optimization/` | `process` | `service` | `services.process.title` | `/assets/agent-network.svg` | (same) | (same) |
| `secure.html` | `/services/secure/` | `secure` | `service` | `services.secure.title` | `/assets/agent-network.svg` | (same) | (same) |
| `training.html` | `/services/training/` | `training` | `service` | `services.training.title` | `/assets/agent-network.svg` | (same) | (same) |

- [ ] **Step 1: For each page, replace front matter with full pagination front matter**

Template (substitute per-page values from the table above):
```yaml
---
nlPermalink: /services/ai/
shellContext: services
date: git Last Modified
pageKey: ai
schemaType: service
serviceNameKey: services.ai.title
socialImage: /assets/agent-network.svg
socialAlt:
  nl: Illustratie van verbonden AI-agents
  en: Illustration of connected AI agents
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "{% if locale == 'en' %}/en{{ nlPermalink }}{% else %}{{ nlPermalink }}{% endif %}"
---
```

- [ ] **Step 2: For each page, update `<html>` tag**

```njk
<html lang="{{ locale }}">
```

- [ ] **Step 3: For each page, add URL vars + `<head>` meta before `{% include "header.njk" %}`**

At the very start of `<body>`:
```njk
{% set nlUrl = baseUrl + nlPermalink %}
{% set enUrl = baseUrl + "/en" + nlPermalink %}
```

No `localePrefix` variable — all internal hrefs use `| locale_url` (see Step 5).

Replace `<head>` title, description, canonical/hreflang, OG/Twitter, og:locale, og:image with the same pattern as Task 5 Step 3 (substitute `pageKey` for the i18n key prefix, e.g. `page.ai.title`). Hreflang uses `nlUrl`/`enUrl` variables as in Task 5.

Add schema injection before `</head>`:
```njk
{% set schemaData = { schemaType: schemaType, pageKey: pageKey, serviceNameKey: serviceNameKey, socialImage: socialImage, nlPermalink: nlPermalink, pageUrl: page.url } %}
{% set schema = schemaData | buildSchema(locale) %}
{% if schema %}
<script type="application/ld+json" data-generated-schema="page">{{ schema | safe }}</script>
{% endif %}
```

- [ ] **Step 4: For each page, replace all `data-i18n` attributes with `| t(locale)` calls**

Remove `data-i18n="key"` attribute, replace inner text with `{{ "key" | t(locale) }}`.

- [ ] **Step 5: For each page, update all internal hrefs**

- Back-link: `href="{{ "/#services" | locale_url }}"`
- Related service links: `href="{{ "/services/agentic-ai/" | locale_url }}"` etc.
- CTA button: `href="{{ "/#contact" | locale_url }}"`

- [ ] **Step 6: Build and spot-check**

```bash
npm run build 2>&1 | tail -5

# Check one NL and one EN service page
grep "<title>" dist/services/ai/index.html
grep "<title>" dist/en/services/ai/index.html
grep "canonical" dist/en/services/ai/index.html
grep "/en/services/" dist/en/services/ai/index.html | head -3
```

Expected: EN title is English, canonical is `https://smartagents.be/en/services/ai/`, related links include `/en/services/`.

- [ ] **Step 7: Commit**

```bash
git add services/ai.html services/agentic-ai.html services/automation.html \
        services/process-optimization.html services/secure.html services/training.html
git commit -m "feat: migrate 6 standard service pages to Eleventy-native i18n pagination"
```

---

## Task 7: Migrate `services/smart-scan.html`

**Files:**
- Modify: `services/smart-scan.html`

This is the largest service page (58 `data-i18n` attributes). Same pattern as Task 6 but more content.

- [ ] **Step 1: Replace front matter**

```yaml
---
nlPermalink: /services/smart-scan/
shellContext: services
date: git Last Modified
pageKey: smartscan
schemaType: service
serviceNameKey: page.smartscan.title
socialImage: /assets/agent-network.svg
socialAlt:
  nl: Illustratie van verbonden AI-agents
  en: Illustration of connected AI agents
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "{% if locale == 'en' %}/en{{ nlPermalink }}{% else %}{{ nlPermalink }}{% endif %}"
---
```

- [ ] **Step 2: Update `<html>` tag, add URL vars, update `<head>`, add schema — same as Task 6 Steps 2–3**

Use `page.smartscan.title` and `page.smartscan.description` as the i18n keys for `<title>` and `<meta description>`.

- [ ] **Step 3: Replace all 58 `data-i18n` attributes with `| t(locale)` calls**

- [ ] **Step 4: Update all internal hrefs with `locale_url`**

Back-link, related services, CTA button — same pattern as Task 6 Step 5.

- [ ] **Step 5: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep "<title>" dist/services/smart-scan/index.html dist/en/services/smart-scan/index.html
grep "canonical" dist/en/services/smart-scan/index.html
```

- [ ] **Step 6: Commit**

```bash
git add services/smart-scan.html
git commit -m "feat: migrate smart-scan.html to Eleventy-native i18n pagination"
```

---

## Task 8: Migrate `jobs/jobs.html`

**Files:**
- Modify: `jobs/jobs.html`

- [ ] **Step 1: Replace front matter**

```yaml
---
nlPermalink: /jobs/
shellContext: jobs
date: git Last Modified
pageKey: jobs
schemaType: jobs
postedDate: "2026-03-19"
socialImage: /assets/handshake.webp
socialAlt:
  nl: Professionele handdruk tussen zakenpartners
  en: Professional handshake between business partners
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "{% if locale == 'en' %}/en{{ nlPermalink }}{% else %}{{ nlPermalink }}{% endif %}"
---
```

- [ ] **Step 2: Update `<html>` tag, add URL vars, update `<head>`, add schema — same pattern as Task 6**

Use `page.jobs.title` and `page.jobs.description` as i18n keys.

- [ ] **Step 3: Replace all 30 `data-i18n` attributes with `| t(locale)` calls**

- [ ] **Step 4: Update internal `href="/#contact"` CTA with `locale_url`**

```njk
<a href="{{ "/#contact" | locale_url }}" class="btn btn-secondary jobs-cta-btn">{{ "jobs.cta.button" | t(locale) }}</a>
```

- [ ] **Step 5: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep "<title>" dist/jobs/index.html dist/en/jobs/index.html
grep "canonical" dist/en/jobs/index.html
grep "JobPosting" dist/jobs/index.html | head -2
```

Expected: NL page has Dutch title, EN page has English title, `JobPosting` schema present.

- [ ] **Step 6: Commit**

```bash
git add jobs/jobs.html
git commit -m "feat: migrate jobs/jobs.html to Eleventy-native i18n pagination"
```

---

## Task 9: Migrate `customerzone/customerzone.html`

**Files:**
- Modify: `customerzone/customerzone.html`

This page has no `{% include "header.njk" %}` or `{% include "footer.njk" %}` — it is self-contained. `localePrefix` must be set directly in the page body.

- [ ] **Step 1: Replace front matter**

```yaml
---
nlPermalink: /customerzone/
date: git Last Modified
excludeFromSitemap: true
socialImage: /assets/logo.svg
socialAlt:
  nl: SmartAgents logo
  en: SmartAgents logo
pagination:
  data: locales
  size: 1
  alias: locale
permalink: "{% if locale == 'en' %}/en{{ nlPermalink }}{% else %}{{ nlPermalink }}{% endif %}"
---
```

Note: no `shellContext` — this page has no header/footer includes.

- [ ] **Step 2: Update `<html>` tag**

```njk
<html lang="{{ locale }}">
```

- [ ] **Step 3: Add URL vars at top of `<body>` and update `<head>`**

At start of `<body>`:
```njk
{% set nlUrl = baseUrl + nlPermalink %}
{% set enUrl = baseUrl + "/en" + nlPermalink %}
```

No `localePrefix` variable — internal hrefs use `| locale_url`.

Update `<head>` with canonical/hreflang/og:url/og:locale/og:image — same pattern as other pages. Use `page.customerzone.title` and `page.customerzone.description` as i18n keys for `<title>` and description.

- [ ] **Step 4: Replace all 9 `data-i18n` attributes with `| t(locale)` calls**

- [ ] **Step 5: Update internal `href="/"` back-link**

```njk
<a href="{{ "/" | locale_url }}">
```

- [ ] **Step 6: Build and verify customerzone is excluded from sitemap**

```bash
npm run build 2>&1 | tail -5
grep "customerzone" dist/sitemap.xml
grep "<title>" dist/customerzone/index.html dist/en/customerzone/index.html
```

Expected: `customerzone` does NOT appear in `sitemap.xml`. Both locale titles render correctly.

- [ ] **Step 7: Commit**

```bash
git add customerzone/customerzone.html
git commit -m "feat: migrate customerzone to Eleventy-native i18n pagination"
```

---

## Task 10: Cleanup and Final Verification

**Files:**
- Delete: `scripts/localize-dist.mjs`

- [ ] **Step 1: Delete `localize-dist.mjs`**

```bash
rm scripts/localize-dist.mjs
```

- [ ] **Step 2: Full build**

```bash
npm run build 2>&1
```

Expected: All 20+ files written (10 source pages × 2 locales + sitemap), zero errors.

- [ ] **Step 3: Verify dist structure**

```bash
ls dist/
ls dist/en/
ls dist/en/services/
```

Expected:
```
dist/             index.html  jobs/  services/  customerzone/  sitemap.xml  assets/  ...
dist/en/          index.html  jobs/  services/  customerzone/
dist/en/services/ ai/  agentic-ai/  automation/  process-optimization/  secure/  smart-scan/  training/
```

- [ ] **Step 4: Spot-check NL homepage**

```bash
# Lang attribute
grep "^<html" dist/index.html

# Title (should be Dutch)
grep "<title>" dist/index.html

# Canonical
grep "canonical" dist/index.html

# data-i18n attributes must be gone
grep -c "data-i18n" dist/index.html
```

Expected: `lang="nl"`, Dutch title, canonical `https://smartagents.be/`, `0` data-i18n attributes.

- [ ] **Step 5: Spot-check EN homepage**

```bash
grep "^<html" dist/en/index.html
grep "<title>" dist/en/index.html
grep "canonical" dist/en/index.html
grep "/en/services/" dist/en/index.html | wc -l
grep "data-label-success" dist/en/index.html
# Confirm locale_url resolved correctly — no raw filter artifacts
grep -c "locale_url" dist/en/index.html
```

Expected: `lang="en"`, English title, canonical `https://smartagents.be/en/`, multiple `/en/services/` links, `data-label-success="Message sent!"`, `0` raw `locale_url` strings in output.

- [ ] **Step 6: Spot-check sitemap**

```bash
cat dist/sitemap.xml
```

Expected: Contains both `/` and `/en/` entries for all pages. No `customerzone`. Priority `1.0` for `/` and `/en/`.

- [ ] **Step 7: Verify EN service page internal links**

```bash
grep "href=" dist/en/services/ai/index.html | grep -v "http\|fonts\|assets" | head -10
```

Expected: All internal hrefs start with `/en/`.

- [ ] **Step 8: Verify hreflang on a service page**

```bash
grep "hreflang" dist/services/ai/index.html
grep "hreflang" dist/en/services/ai/index.html
```

Expected: Both have `hreflang="nl"` pointing to `https://smartagents.be/services/ai/` and `hreflang="en"` pointing to `https://smartagents.be/en/services/ai/`.

- [ ] **Step 9: Final commit**

```bash
git rm scripts/localize-dist.mjs
git commit -m "feat: complete Eleventy-native i18n refactor — remove localize-dist.mjs"
```
