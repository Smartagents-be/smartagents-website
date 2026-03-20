# Eleventy Official i18n Directory-Based Refactor

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the non-standard pagination-over-locales i18n pattern with Eleventy's official directory-based i18n structure so that `EleventyI18nPlugin` and `locale_url` work as designed, and both locales appear natively in `collections.all`.

**Architecture:** Each page gets two source files — the NL file at its current location and a thin EN wrapper under `en/` — both including a shared `_includes/pages/*.njk` template so HTML is never duplicated. A single `en/en.json` directory data file sets `locale: en` for all EN pages automatically. The sitemap simplifies to a plain `collections.all` loop since both locales are now real Eleventy sources.

**Tech Stack:** Eleventy 3.x, Nunjucks, `EleventyI18nPlugin` (built-in), `i18n/en.json` + `i18n/nl.json`

---

## File Map

### Create (new files)

| File | Role |
|------|------|
| `en/en.json` | Directory data: sets `locale: en` for all EN pages automatically |
| `en/index.html` | EN homepage — front matter + `{% include "pages/index.njk" %}` |
| `en/services/ai.html` | EN AI service wrapper |
| `en/services/agentic-ai.html` | EN Agentic AI wrapper |
| `en/services/automation.html` | EN Automation wrapper |
| `en/services/process-optimization.html` | EN Process Optimization wrapper |
| `en/services/secure.html` | EN Secure wrapper |
| `en/services/training.html` | EN Training wrapper |
| `en/services/smart-scan.html` | EN Smart Scan wrapper |
| `en/jobs/jobs.html` | EN Jobs wrapper |
| `en/customerzone/customerzone.html` | EN Customerzone wrapper |
| `_includes/pages/index.njk` | Homepage body (moved from `index.html`) |
| `_includes/pages/ai.njk` | AI service body |
| `_includes/pages/agentic-ai.njk` | Agentic AI body |
| `_includes/pages/automation.njk` | Automation body |
| `_includes/pages/process-optimization.njk` | Process Optimization body |
| `_includes/pages/secure.njk` | Secure body |
| `_includes/pages/training.njk` | Training body |
| `_includes/pages/smart-scan.njk` | Smart Scan body |
| `_includes/pages/jobs.njk` | Jobs body |
| `_includes/pages/customerzone.njk` | Customerzone body |

### Modify

| File | Change |
|------|--------|
| `.eleventy.js` | Task 1: remove stale `jobs.html`/`klantenzone.html` ignores. Task 2: change `errorMode: "never"` → `"allow-fallback"` once first EN counterpart exists |
| `index.html` | Front matter only: remove pagination block, add `locale: nl`, set `permalink: /`; body becomes `{% include "pages/index.njk" %}` |
| `services/ai.html` | Same pattern — front matter + include |
| `services/agentic-ai.html` | Same |
| `services/automation.html` | Same |
| `services/process-optimization.html` | Same |
| `services/secure.html` | Same |
| `services/training.html` | Same |
| `services/smart-scan.html` | Same |
| `jobs/jobs.html` | Same |
| `customerzone/customerzone.html` | Same |
| `sitemap.njk` | Remove dual-entry hack; plain `collections.all` loop now works because both locales are real source files |

### Delete

| File | Reason |
|------|--------|
| `_data/locales.mjs` | No longer used — pagination is removed |
| `_data/i18n.mjs` | Redundant — `.eleventy.js` already loads both JSON files directly via `readFileSync`. No template uses the `{{ i18n }}` global data object; all translation is done via `{{ "key" \| t(locale) }}`. |

### Already deleted (previous migration)

| File | Status |
|------|--------|
| `scripts/localize-dist.mjs` | Deleted in the previous Eleventy migration — not relevant here |

---

## Key Patterns

### `en/en.json` — directory data (sets locale for all EN pages)

```json
{
    "locale": "en"
}
```

Eleventy directory data files cascade to all subdirectories, so `en/en.json` automatically applies `locale: en` to `en/services/ai.html`, `en/jobs/jobs.html`, etc.

### NL source file after refactor (e.g. `services/ai.html`)

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
locale: nl
permalink: /services/ai/
---
{% include "pages/ai.njk" %}
```

Removed: `pagination` block, conditional permalink template.
Added: `locale: nl`, hardcoded `permalink`.

### EN wrapper file (e.g. `en/services/ai.html`)

Identical front matter to the NL file **except**:
- No `locale` key (comes from `en/en.json`)
- `permalink: /en/services/ai/`

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
permalink: /en/services/ai/
---
{% include "pages/ai.njk" %}
```

### `_includes/pages/ai.njk` — page body

Move everything from `services/ai.html` below the closing `---` of the front matter into this file. The content starts with `{% set nlUrl ... %}` and ends with `</html>`. The include shares the calling template's data context, so all front matter variables (`nlPermalink`, `locale`, `shellContext`, `pageKey`, etc.) are available.

**Critical ordering rule:** The `{% set nlUrl %}` and `{% set enUrl %}` lines **must remain at the very top** of the extracted include — before the `<!DOCTYPE html>` declaration and before any `{% include "header.njk" %}` call. `_includes/header.njk` references `nlUrl` and `enUrl` in the language switcher (lines 35–36). If these variables are defined after the header include, they will be `undefined` in the switcher, producing broken language-switch links.

### Simplified `sitemap.njk`

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
    <lastmod>{{ p.date | dateToFormat }}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>{{ "1.0" if p.url == "/" or p.url == "/en/" else "0.8" }}</priority>
  </url>
  {%- endif %}
  {%- endfor %}
</urlset>
```

Both NL and EN pages now appear in `collections.all` natively — no dual-entry hack needed.

---

## Task 1: Foundation

**Files:**
- Modify: `.eleventy.js` (remove stale ignores only — errorMode changes in Task 2)
- Create: `en/en.json`

- [ ] **Step 1: Remove stale ignores from `.eleventy.js`**

Remove the two stale ignore lines (lines 127–128):
```js
// DELETE these two lines:
eleventyConfig.ignores.add("jobs.html");
eleventyConfig.ignores.add("klantenzone.html");
```

These files were already removed from the repo in the previous migration. The ignores are now dead code.

- [ ] **Step 2: Create `en/en.json`**

```json
{
    "locale": "en"
}
```

- [ ] **Step 3: Verify build still works**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build completes, 21 files written (10 NL pages + 10 EN from pagination + sitemap), no errors.


---

## Task 2: Migrate Homepage (`index.html`)

**Files:**
- Create: `_includes/pages/index.njk`
- Create: `en/index.html`
- Modify: `index.html`
- Modify: `.eleventy.js` (switch `errorMode` now that the first real EN counterpart exists)

- [ ] **Step 1: Extract body to `_includes/pages/index.njk`**

Create `_includes/pages/index.njk` by copying everything from `index.html` that comes **after** the front matter's closing `---`. The content starts with the line:

```njk
{% set nlUrl = baseUrl + '/' %}
```

...and ends with `</html>`. Copy it verbatim into `_includes/pages/index.njk`.

- [ ] **Step 2: Replace `index.html` body with include + update front matter**

`index.html` becomes:

```html
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
locale: nl
permalink: /
---
{% include "pages/index.njk" %}
```

Removed: `pagination` block, conditional `permalink` template.
Added: `locale: nl`, hardcoded `permalink: /`.

- [ ] **Step 3: Create `en/index.html`**

```html
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
permalink: /en/
---
{% include "pages/index.njk" %}
```

Note: no `locale` key — `locale: en` is inherited from `en/en.json`.

- [ ] **Step 4: Switch `errorMode` to `"allow-fallback"` in `.eleventy.js`**

Now that `en/index.html` exists as a real EN counterpart, it is safe to enable stricter error reporting. Change line 29:

```js
// Before:
eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: "nl", errorMode: "never" });

// After:
eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: "nl", errorMode: "allow-fallback" });
```

`"allow-fallback"` warns only when a page has no counterpart in ANY locale. Pages still being migrated in Tasks 3–6 retain their pagination-generated EN output for now, so no warnings are expected at this point.

- [ ] **Step 5: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build completes, no errors, no `[11ty] i18n` warnings.

```bash
grep "^<html" dist/index.html
grep "^<html" dist/en/index.html
grep "<title>" dist/index.html
grep "<title>" dist/en/index.html
grep "canonical" dist/en/index.html
```

Expected:
- `dist/index.html`: `<html lang="nl">`
- `dist/en/index.html`: `<html lang="en">`
- Dutch title in NL, English title in EN
- EN canonical: `https://smartagents.be/en/`


---

## Task 3: Migrate 6 Standard Service Pages

**Files (per page):**
- Create: `_includes/pages/<name>.njk`
- Create: `en/services/<name>.html`
- Modify: `services/<name>.html`

Pages: `ai`, `agentic-ai`, `automation`, `process-optimization`, `secure`, `training`

Per-page front matter values:

| Page | `nlPermalink` | `pageKey` | `schemaType` | `serviceNameKey` |
|------|--------------|-----------|-------------|-----------------|
| `ai.html` | `/services/ai/` | `ai` | `service` | `services.ai.title` |
| `agentic-ai.html` | `/services/agentic-ai/` | `agentic` | `service` | `services.agentic.title` |
| `automation.html` | `/services/automation/` | `automation` | `service` | `services.automation.title` |
| `process-optimization.html` | `/services/process-optimization/` | `process` | `service` | `services.process.title` |
| `secure.html` | `/services/secure/` | `secure` | `service` | `services.secure.title` |
| `training.html` | `/services/training/` | `training` | `service` | `services.training.title` |

All 6 use: `socialImage: /assets/agent-network.svg`, `shellContext: services`, `date: git Last Modified`, same `socialAlt`.

- [ ] **Step 1: For each of the 6 pages — extract body to `_includes/pages/<name>.njk`**

Same as Task 2 Step 1: copy everything after the front matter's closing `---` into `_includes/pages/<name>.njk`. The content starts with `{% set nlUrl = baseUrl + nlPermalink %}`.

- [ ] **Step 2: For each of the 6 pages — update the NL source file**

Template (substitute per-page values from the table):

```html
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
locale: nl
permalink: /services/ai/
---
{% include "pages/ai.njk" %}
```

- [ ] **Step 3: For each of the 6 pages — create `en/services/<name>.html`**

Template (same front matter, no `locale`, EN permalink):

```html
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
permalink: /en/services/ai/
---
{% include "pages/ai.njk" %}
```

- [ ] **Step 4: Build and spot-check**

```bash
npm run build 2>&1 | tail -5
grep "<title>" dist/services/ai/index.html
grep "<title>" dist/en/services/ai/index.html
grep "canonical" dist/en/services/ai/index.html
grep "hreflang" dist/en/services/ai/index.html
```

Expected: EN title is English, canonical `https://smartagents.be/en/services/ai/`, hreflang tags present with correct absolute URLs.


---

## Task 4: Migrate `services/smart-scan.html`

**Files:**
- Create: `_includes/pages/smart-scan.njk`
- Create: `en/services/smart-scan.html`
- Modify: `services/smart-scan.html`

Same pattern as Task 3. Smart Scan has more content (58 i18n keys) but the same mechanical steps.

- [ ] **Step 1: Extract body to `_includes/pages/smart-scan.njk`**

Copy everything after front matter's closing `---` from `services/smart-scan.html` into `_includes/pages/smart-scan.njk`.

- [ ] **Step 2: Update `services/smart-scan.html`**

```html
---
nlPermalink: /services/smart-scan/
shellContext: services
date: git Last Modified
pageKey: smartscan
schemaType: service
serviceNameKey: services.smartscan.title
socialImage: /assets/agent-network.svg
socialAlt:
  nl: Illustratie van verbonden AI-agents
  en: Illustration of connected AI agents
locale: nl
permalink: /services/smart-scan/
---
{% include "pages/smart-scan.njk" %}
```

- [ ] **Step 3: Create `en/services/smart-scan.html`**

```html
---
nlPermalink: /services/smart-scan/
shellContext: services
date: git Last Modified
pageKey: smartscan
schemaType: service
serviceNameKey: services.smartscan.title
socialImage: /assets/agent-network.svg
socialAlt:
  nl: Illustratie van verbonden AI-agents
  en: Illustration of connected AI agents
permalink: /en/services/smart-scan/
---
{% include "pages/smart-scan.njk" %}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep "<title>" dist/services/smart-scan/index.html dist/en/services/smart-scan/index.html
```


---

## Task 5: Migrate `jobs/jobs.html`

**Files:**
- Create: `_includes/pages/jobs.njk`
- Create: `en/jobs/jobs.html`
- Modify: `jobs/jobs.html`

- [ ] **Step 1: Extract body to `_includes/pages/jobs.njk`**

- [ ] **Step 2: Update `jobs/jobs.html`**

```html
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
locale: nl
permalink: /jobs/
---
{% include "pages/jobs.njk" %}
```

- [ ] **Step 3: Create `en/jobs/jobs.html`**

```html
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
permalink: /en/jobs/
---
{% include "pages/jobs.njk" %}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep "<title>" dist/jobs/index.html dist/en/jobs/index.html
grep "JobPosting" dist/jobs/index.html | head -1
```

Expected: NL Dutch title, EN English title, `JobPosting` schema present.


---

## Task 6: Migrate `customerzone/customerzone.html`

**Files:**
- Create: `_includes/pages/customerzone.njk`
- Create: `en/customerzone/customerzone.html`
- Modify: `customerzone/customerzone.html`

Note: customerzone has no `shellContext` and no `schemaType` — it is a standalone page with no header/footer includes. `excludeFromSitemap: true` keeps it out of the sitemap.

- [ ] **Step 1: Extract body to `_includes/pages/customerzone.njk`**

- [ ] **Step 2: Update `customerzone/customerzone.html`**

```html
---
nlPermalink: /customerzone/
date: git Last Modified
excludeFromSitemap: true
socialImage: /assets/logo.svg
socialAlt:
  nl: SmartAgents logo
  en: SmartAgents logo
locale: nl
permalink: /customerzone/
---
{% include "pages/customerzone.njk" %}
```

- [ ] **Step 3: Create `en/customerzone/customerzone.html`**

```html
---
nlPermalink: /customerzone/
date: git Last Modified
excludeFromSitemap: true
socialImage: /assets/logo.svg
socialAlt:
  nl: SmartAgents logo
  en: SmartAgents logo
permalink: /en/customerzone/
---
{% include "pages/customerzone.njk" %}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build 2>&1 | tail -5
grep "<title>" dist/customerzone/index.html dist/en/customerzone/index.html
grep "customerzone" dist/sitemap.xml
```

Expected: Both locale titles render correctly. `customerzone` does NOT appear in sitemap.


---

## Task 7: Simplify Sitemap + Cleanup

**Files:**
- Modify: `sitemap.njk`
- Delete: `_data/locales.mjs`

- [ ] **Step 1: Replace `sitemap.njk` with simplified version**

Both locales now appear in `collections.all` natively, so the dual-entry hack is no longer needed. Replace the entire file content with:

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
    <lastmod>{{ p.date | dateToFormat }}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>{{ "1.0" if p.url == "/" or p.url == "/en/" else "0.8" }}</priority>
  </url>
  {%- endif %}
  {%- endfor %}
</urlset>
```

- [ ] **Step 2: Delete `_data/locales.mjs` and `_data/i18n.mjs`**

```bash
rm _data/locales.mjs _data/i18n.mjs
```

`locales.mjs` was the pagination source — no longer used. `i18n.mjs` exposed locale dictionaries as Eleventy global data, but `.eleventy.js` already loads the same JSON files directly via `readFileSync` for the `t` and `buildSchema` filters. No template uses `{{ i18n }}` directly.

- [ ] **Step 3: Full build**

```bash
npm run build 2>&1
```

Expected: 21 files written (10 NL pages + 10 EN pages + sitemap), zero errors.

- [ ] **Step 4: Verify sitemap**

```bash
cat dist/sitemap.xml
```

Expected:
- 18 `<url>` entries (9 NL + 9 EN — customerzone excluded)
- `/` and `/en/` have `<priority>1.0</priority>`
- All URLs start with `https://smartagents.be`
- No customerzone entries

- [ ] **Step 5: Verify EN internal links**

```bash
grep "href=" dist/en/services/ai/index.html | grep -v "http\|fonts\|assets\|stylesheet" | head -10
```

Expected: All internal hrefs start with `/en/`.

- [ ] **Step 6: Verify `locale_url` resolves correctly**

```bash
grep -c "locale_url" dist/en/index.html
```

Expected: `0` — no raw `locale_url` strings in built output.

- [ ] **Step 7: Verify hreflang**

```bash
grep "hreflang" dist/services/ai/index.html
grep "hreflang" dist/en/services/ai/index.html
```

Expected: Both have `hreflang="nl"` → `https://smartagents.be/services/ai/` and `hreflang="en"` → `https://smartagents.be/en/services/ai/`.


---

## After All Tasks: Update CLAUDE.md

Update `.claude/CLAUDE.md` to reflect the new source structure:
- Pages live in two locations: NL at root, EN under `en/`
- Page body content lives in `_includes/pages/*.njk`
- `en/en.json` sets `locale: en` for all EN pages
- When adding a new page: create both NL source, EN wrapper, and `_includes/pages/<name>.njk`
