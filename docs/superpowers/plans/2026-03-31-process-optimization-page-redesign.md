# Process Optimization Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the process-optimization service page with a dark/technical aesthetic, a vertical timeline methodology section, redesigned benefit cards, and a "what makes us different" strip.

**Architecture:** All content lives in `_includes/pages/services/process.njk` (full HTML document, not a partial). New CSS classes are appended to `styles.css`. All text is externalized to both i18n JSON files. No new files, no new JavaScript.

**Tech Stack:** Eleventy 3.x, Nunjucks, plain CSS (no preprocessor), i18n via `i18n/nl.json` and `i18n/en.json`.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `i18n/nl.json` | Modify | Dutch translations for all new sections |
| `i18n/en.json` | Modify | English translations for all new sections |
| `styles.css` | Modify (append) | CSS for timeline, benefits, differentiators; version bump to `?v=7` |
| `_includes/pages/services/process.njk` | Rewrite | Full HTML document with 6 sections |

---

## Task 1: Add NL translation keys

**Files:**
- Modify: `i18n/nl.json`

**Note:** `benefit1.desc`, `benefit2.desc`, `benefit3.desc` already exist in the file (lines ~215–219). The script below updates them in place and adds all new keys. Do NOT insert duplicate keys — use the script.

- [ ] **Step 1: Run the following Node.js script to update `i18n/nl.json`**

```bash
node -e "
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('i18n/nl.json', 'utf8'));

// Update existing benefit descriptions (already in file, need longer text)
obj['services.process.page.benefit1.desc'] = 'Elimineer verspilling en verlaag operationele kosten met slankere, AI-ondersteunde processen.';
obj['services.process.page.benefit2.desc'] = 'Stroomlijn workflows en krijg meer gedaan in minder tijd \u2014 zonder extra mensen of middelen.';
obj['services.process.page.benefit3.desc'] = 'Verwijder frustrerende knelpunten en laat uw mensen focussen op het werk dat echt telt.';

// Add new keys
obj['services.process.page.why.title'] = 'Waarom uw processen optimaliseren?';
obj['services.process.page.why.statement'] = 'Repetitieve taken kosten uw team uren per week. AI verandert dat.';
obj['services.process.page.why.point1'] = 'Tot 70% van routinetaken is automatiseerbaar';
obj['services.process.page.why.point2'] = 'Minder handmatig werk, minder fouten';
obj['services.process.page.why.point3'] = 'Teams die focussen op wat echt telt';
obj['services.process.page.methodology.title'] = 'Onze aanpak';
obj['services.process.page.phase1.number'] = '01';
obj['services.process.page.phase1.title'] = 'Verken';
obj['services.process.page.phase1.desc'] = 'We brengen uw huidige workflows in kaart, voeren gesprekken met stakeholders en identificeren waar tijd en energie verloren gaan.';
obj['services.process.page.phase2.number'] = '02';
obj['services.process.page.phase2.title'] = 'Analyseer';
obj['services.process.page.phase2.desc'] = 'We duiken diep in uw processen, kwantificeren verspilling en brengen automatiseringsopportuniteiten in kaart.';
obj['services.process.page.phase3.number'] = '03';
obj['services.process.page.phase3.title'] = 'Ontwerp';
obj['services.process.page.phase3.desc'] = 'We ontwerpen het geoptimaliseerde proces met AI-agents, defini\u00ebren KPI\u2019s en bepalen hoe succes eruitziet.';
obj['services.process.page.phase4.number'] = '04';
obj['services.process.page.phase4.title'] = 'Implementeer';
obj['services.process.page.phase4.desc'] = 'We bouwen en deployen de AI-automatiseringen en integreren ze naadloos in uw bestaande tools en systemen.';
obj['services.process.page.phase5.number'] = '05';
obj['services.process.page.phase5.title'] = 'Meet & Verbeter';
obj['services.process.page.phase5.desc'] = 'We volgen de resultaten op aan de hand van de vooraf bepaalde KPI\u2019s, itereren en zorgen voor een doorlopende verbetercyclus.';
obj['services.process.page.different.title'] = 'Wat ons onderscheidt';
obj['services.process.page.diff1.label'] = 'AI-native';
obj['services.process.page.diff1.tagline'] = 'Niet achteraf toegevoegd \u2014 ingebouwd vanaf dag \u00e9\u00e9n';
obj['services.process.page.diff2.label'] = 'Meetbare resultaten';
obj['services.process.page.diff2.tagline'] = 'We defini\u00ebren KPI\u2019s v\u00f3\u00f3r de start';
obj['services.process.page.diff3.label'] = 'Continu verbeteren';
obj['services.process.page.diff3.tagline'] = 'Geen eenmalig project, maar een doorlopend proces';
obj['services.process.page.diff4.label'] = 'Sector-specifiek';
obj['services.process.page.diff4.tagline'] = 'Diepgaande kennis van uw branche';

fs.writeFileSync('i18n/nl.json', JSON.stringify(obj, null, 2) + '\n');
console.log('nl.json updated, keys:', Object.keys(obj).length);
"
```

Expected: prints `nl.json updated, keys: <number>` with no errors.

- [ ] **Step 2: Verify the JSON is valid and has no duplicate keys**

```bash
node -e "
const fs = require('fs');
const text = fs.readFileSync('i18n/nl.json', 'utf8');
const obj = JSON.parse(text);
const keys = Object.keys(obj);
const uniqueKeys = new Set(keys);
if (keys.length === uniqueKeys.size) {
  console.log('OK: no duplicates,', keys.length, 'keys');
} else {
  console.error('DUPLICATE KEYS FOUND');
  process.exit(1);
}
"
```

Expected: `OK: no duplicates, <N> keys`

- [ ] **Step 3: Commit**

```bash
git add i18n/nl.json
git commit -m "voeg NL vertalingen toe voor herontwerp procesoptimalisatie pagina"
```

---

## Task 2: Add EN translation keys

**Files:**
- Modify: `i18n/en.json`

- [ ] **Step 1: Run the following Node.js script to update `i18n/en.json`**

```bash
node -e "
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('i18n/en.json', 'utf8'));

// Update existing benefit descriptions
obj['services.process.page.benefit1.desc'] = 'Eliminate waste and reduce operational costs with leaner, AI-supported processes.';
obj['services.process.page.benefit2.desc'] = 'Streamline workflows and get more done in less time \u2014 without extra headcount or resources.';
obj['services.process.page.benefit3.desc'] = 'Remove frustrating bottlenecks and let your people focus on work that truly matters.';

// Add new keys
obj['services.process.page.why.title'] = 'Why optimize your processes?';
obj['services.process.page.why.statement'] = 'Repetitive tasks cost your team hours every week. AI changes that.';
obj['services.process.page.why.point1'] = 'Up to 70% of routine tasks can be automated';
obj['services.process.page.why.point2'] = 'Less manual work, fewer errors';
obj['services.process.page.why.point3'] = 'Teams focused on what truly matters';
obj['services.process.page.methodology.title'] = 'Our approach';
obj['services.process.page.phase1.number'] = '01';
obj['services.process.page.phase1.title'] = 'Discover';
obj['services.process.page.phase1.desc'] = 'We map your current workflows, interview stakeholders, and identify where time and energy are being lost.';
obj['services.process.page.phase2.number'] = '02';
obj['services.process.page.phase2.title'] = 'Analyse';
obj['services.process.page.phase2.desc'] = 'We deep-dive into your processes, quantify waste, and map out automation opportunities.';
obj['services.process.page.phase3.number'] = '03';
obj['services.process.page.phase3.title'] = 'Design';
obj['services.process.page.phase3.desc'] = 'We design the optimized process with AI agents, define KPIs, and determine what success looks like.';
obj['services.process.page.phase4.number'] = '04';
obj['services.process.page.phase4.title'] = 'Implement';
obj['services.process.page.phase4.desc'] = 'We build and deploy the AI automations and integrate them seamlessly into your existing tools and systems.';
obj['services.process.page.phase5.number'] = '05';
obj['services.process.page.phase5.title'] = 'Measure & Improve';
obj['services.process.page.phase5.desc'] = 'We track results against the pre-defined KPIs, iterate, and ensure a continuous improvement cycle.';
obj['services.process.page.different.title'] = 'What sets us apart';
obj['services.process.page.diff1.label'] = 'AI-native';
obj['services.process.page.diff1.tagline'] = 'Not bolted on \u2014 built in from day one';
obj['services.process.page.diff2.label'] = 'Measurable results';
obj['services.process.page.diff2.tagline'] = 'We define KPIs before we start';
obj['services.process.page.diff3.label'] = 'Continuous improvement';
obj['services.process.page.diff3.tagline'] = 'Not a one-off project, but an ongoing process';
obj['services.process.page.diff4.label'] = 'Sector-specific';
obj['services.process.page.diff4.tagline'] = 'Deep knowledge of your industry';

fs.writeFileSync('i18n/en.json', JSON.stringify(obj, null, 2) + '\n');
console.log('en.json updated, keys:', Object.keys(obj).length);
"
```

Expected: prints `en.json updated, keys: <number>` with no errors.

- [ ] **Step 2: Verify valid JSON, no duplicates**

```bash
node -e "
const fs = require('fs');
const text = fs.readFileSync('i18n/en.json', 'utf8');
const obj = JSON.parse(text);
console.log('OK: en.json valid,', Object.keys(obj).length, 'keys');
"
```

Expected: `OK: en.json valid, <N> keys`

- [ ] **Step 3: Commit**

```bash
git add i18n/en.json
git commit -m "voeg EN vertalingen toe voor herontwerp procesoptimalisatie pagina"
```

---

## Task 3: Add CSS classes and bump stylesheet version

**Files:**
- Modify: `styles.css` — append new classes at the very end (currently 3902 lines)
- Modify: all `_includes/pages/**/*.njk` files — change `styles.css?v=6` to `styles.css?v=7`

- [ ] **Step 1: Append the following CSS block to the very end of `styles.css`**

```css

/* ===========================
   Process Optimization Page
   =========================== */

/* Why section */
.process-why {
    padding: 100px 0;
    background: var(--dark);
}

.process-why .section-title {
    text-align: center;
    margin-bottom: 60px;
}

.process-why-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    max-width: 900px;
    margin: 0 auto;
}

.process-why-statement {
    font-size: 1.7rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--white);
}

.process-why-points {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.process-why-point {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    font-size: 1rem;
    color: var(--gray-light);
    line-height: 1.6;
}

.process-why-point-icon {
    flex-shrink: 0;
    color: var(--cyan);
    margin-top: 1px;
}

/* Methodology timeline */
.process-timeline {
    padding: 100px 0;
    background: var(--dark-lighter);
}

.process-timeline .section-title {
    text-align: center;
    margin-bottom: 80px;
}

.process-timeline-track {
    position: relative;
    max-width: 860px;
    margin: 0 auto;
}

.process-timeline-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, transparent, var(--cyan-30) 8%, var(--cyan-30) 92%, transparent);
    transform: translateX(-50%);
    pointer-events: none;
}

.process-phase {
    display: grid;
    grid-template-columns: 1fr 40px 1fr;
    gap: 0 20px;
    align-items: center;
    margin-bottom: 56px;
    position: relative;
}

.process-phase:last-child {
    margin-bottom: 0;
}

.process-phase-dot {
    width: 14px;
    height: 14px;
    background: var(--cyan);
    border-radius: 50%;
    box-shadow: 0 0 12px var(--cyan-40);
    justify-self: center;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
}

.process-phase-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--cyan-15);
    border-radius: 12px;
    padding: 32px;
    transition: border-color 0.2s ease, background 0.2s ease;
}

.process-phase-card:hover {
    border-color: var(--cyan-30);
    background: rgba(255, 255, 255, 0.06);
}

/* Left-side phase: card | dot | empty */
.process-phase--left .process-phase-card {
    grid-column: 1;
    grid-row: 1;
    text-align: right;
}

.process-phase--left .process-phase-dot {
    grid-column: 2;
    grid-row: 1;
}

.process-phase--left .process-phase-empty {
    grid-column: 3;
    grid-row: 1;
}

/* Right-side phase: empty | dot | card */
.process-phase--right .process-phase-empty {
    grid-column: 1;
    grid-row: 1;
}

.process-phase--right .process-phase-dot {
    grid-column: 2;
    grid-row: 1;
}

.process-phase--right .process-phase-card {
    grid-column: 3;
    grid-row: 1;
    text-align: left;
}

.process-phase-number {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--cyan-20);
    line-height: 1;
    margin-bottom: 12px;
    font-feature-settings: "tnum";
}

.process-phase-icon {
    width: 32px;
    height: 32px;
    color: var(--cyan);
    margin-bottom: 12px;
}

.process-phase--left .process-phase-icon {
    margin-left: auto;
}

.process-phase-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--white);
    margin-bottom: 10px;
}

.process-phase-desc {
    font-size: 0.9rem;
    color: var(--gray-light);
    line-height: 1.65;
    margin: 0;
}

/* Benefits — redesigned */
.process-benefits {
    padding: 100px 0;
    background: var(--dark);
}

.process-benefits .section-title {
    text-align: center;
    margin-bottom: 60px;
}

.process-benefits-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
}

.process-benefit-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--white-07);
    border-radius: 16px;
    padding: 36px 28px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.process-benefit-card:hover {
    border-color: var(--cyan-20);
    box-shadow: 0 0 30px var(--cyan-06);
}

.process-benefit-icon {
    width: 52px;
    height: 52px;
    background: var(--cyan-10);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    flex-shrink: 0;
}

.process-benefit-icon svg {
    width: 26px;
    height: 26px;
    stroke: var(--cyan);
}

.process-benefit-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--white);
    margin-bottom: 12px;
}

.process-benefit-card p {
    font-size: 0.9rem;
    color: var(--gray-light);
    line-height: 1.65;
    margin: 0;
}

/* What makes us different */
.process-different {
    padding: 80px 0;
    background: var(--dark-lighter);
    border-top: 1px solid var(--white-07);
}

.process-different .section-title {
    text-align: center;
    margin-bottom: 56px;
}

.process-different-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    max-width: 960px;
    margin: 0 auto;
}

.process-different-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 28px;
    border-right: 1px solid var(--white-07);
}

.process-different-item:last-child {
    border-right: none;
}

.process-different-icon {
    width: 44px;
    height: 44px;
    background: var(--cyan-10);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    flex-shrink: 0;
}

.process-different-icon svg {
    width: 22px;
    height: 22px;
    stroke: var(--cyan);
}

.process-different-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--white);
    margin-bottom: 8px;
}

.process-different-tagline {
    font-size: 0.85rem;
    color: var(--gray-light);
    line-height: 1.55;
    margin: 0;
}

/* Mobile overrides for process page */
@media (max-width: 900px) {
    .process-why-grid {
        grid-template-columns: 1fr;
        gap: 36px;
    }

    .process-why-statement {
        font-size: 1.35rem;
    }

    .process-timeline-line {
        left: 19px;
        transform: none;
    }

    .process-phase {
        grid-template-columns: 40px 1fr;
    }

    .process-phase--left .process-phase-card,
    .process-phase--right .process-phase-card {
        grid-column: 2;
        grid-row: 1;
        text-align: left;
    }

    .process-phase--left .process-phase-dot,
    .process-phase--right .process-phase-dot {
        grid-column: 1;
        grid-row: 1;
    }

    .process-phase--left .process-phase-empty,
    .process-phase--right .process-phase-empty {
        display: none;
    }

    .process-phase--left .process-phase-icon {
        margin-left: 0;
    }

    .process-phase-number {
        font-size: 1.6rem;
    }

    .process-benefits-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .process-different-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 32px;
    }

    .process-different-item {
        border-right: none;
        padding: 0;
    }
}
```

- [ ] **Step 2: Bump stylesheet version from `?v=6` to `?v=7` in all njk files**

```bash
find /Users/axel/projects/smartagents-website/_includes/pages -name "*.njk" -exec sed -i '' 's|styles\.css?v=6|styles.css?v=7|g' {} +
```

- [ ] **Step 3: Verify version was updated everywhere**

```bash
grep -r "styles.css" /Users/axel/projects/smartagents-website/_includes/pages/ | grep -v "?v=7"
```

Expected: no output (all files now reference `?v=7`).

- [ ] **Step 4: Commit**

```bash
git add styles.css _includes/pages/
git commit -m "voeg CSS toe voor herontwerp procesoptimalisatie pagina en bump styles versie naar v7"
```

---

## Task 4: Rewrite process.njk

**Files:**
- Modify: `_includes/pages/services/process.njk` — full rewrite

**Note:** This file is a full HTML document (DOCTYPE through closing `</html>`), not a content partial. It is included by thin wrapper files at `services/process-optimization/index.html` (NL) and `en/services/process-optimization/index.html` (EN). The `locale` variable comes from the wrapper's front matter. Do not change the wrapper files.

- [ ] **Step 1: Replace the entire contents of `_includes/pages/services/process.njk` with the following**

```njk
{% set nlUrl = '/services/process-optimization/' %}
{% set enUrl = '/en/services/process-optimization/' %}
{% set nlAltUrl = nlUrl | absoluteUrl(baseUrl) %}
{% set enAltUrl = enUrl | absoluteUrl(baseUrl) %}
<!DOCTYPE html>
<html lang="{{ locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ "page.process.title" | t(locale) }}</title>
    <meta name="description" content="{{ 'page.process.description' | t(locale) }}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#00d8ff">
    <link rel="canonical" href="{{ page.url | absoluteUrl(baseUrl) }}">
    <link rel="alternate" hreflang="nl" href="{{ nlAltUrl }}">
    <link rel="alternate" hreflang="en" href="{{ enAltUrl }}">
    <link rel="alternate" hreflang="x-default" href="{{ nlAltUrl }}">
    <meta property="og:url" content="{{ page.url | absoluteUrl(baseUrl) }}">

    <!-- Open Graph -->
    {% set ogLocale = 'nl_BE' if locale == 'nl' else 'en_US' %}
    {% set ogLocaleAlt = 'en_US' if locale == 'nl' else 'nl_BE' %}
    {% set resolvedSocialImage = baseUrl + socialImage %}
    {% set resolvedSocialAlt = socialAlt[locale] %}
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ 'page.process.title' | t(locale) }}">
    <meta property="og:description" content="{{ 'page.process.description' | t(locale) }}">
    <meta property="og:locale" content="{{ ogLocale }}">
    <meta property="og:locale:alternate" content="{{ ogLocaleAlt }}">
    <meta property="og:image" content="{{ resolvedSocialImage }}">
    <meta property="og:image:alt" content="{{ resolvedSocialAlt }}">
    <meta property="og:site_name" content="SmartAgents">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ 'page.process.title' | t(locale) }}">
    <meta name="twitter:description" content="{{ 'page.process.description' | t(locale) }}">
    <meta name="twitter:image" content="{{ resolvedSocialImage }}">
    <meta name="twitter:image:alt" content="{{ resolvedSocialAlt }}">
    <meta name="twitter:domain" content="smartagents.be">

    <link rel="icon" type="image/svg+xml" href="/assets/logo.svg">
    <link rel="stylesheet" href="/styles.css?v=7">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Structured Data -->
    {% include "schema-organization.njk" %}
    {% set schemaData = { schemaType: schemaType, pageKey: pageKey, serviceNameKey: serviceNameKey, socialImage: socialImage, nlPermalink: nlPermalink, pageUrl: page.url } %}
    {% set schema = schemaData | buildSchema(locale) %}
    {% if schema %}
    <script type="application/ld+json" data-generated-schema="page">{{ schema | safe }}</script>
    {% endif %}
</head>
<body data-service="process">
    {% include "header.njk" %}

    <section class="page-hero">
        <div class="container">
            <h1>{{ "services.process.title" | t(locale) }}</h1>
            <p>{{ "services.process.page.subtitle" | t(locale) }}</p>
        </div>
    </section>

    <section class="process-why">
        <div class="container">
            <h2 class="section-title">{{ "services.process.page.why.title" | t(locale) }}</h2>
            <div class="process-why-grid">
                <p class="process-why-statement">{{ "services.process.page.why.statement" | t(locale) }}</p>
                <ul class="process-why-points">
                    <li class="process-why-point">
                        <span class="process-why-point-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {{ "services.process.page.why.point1" | t(locale) }}
                    </li>
                    <li class="process-why-point">
                        <span class="process-why-point-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {{ "services.process.page.why.point2" | t(locale) }}
                    </li>
                    <li class="process-why-point">
                        <span class="process-why-point-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {{ "services.process.page.why.point3" | t(locale) }}
                    </li>
                </ul>
            </div>
        </div>
    </section>

    <section class="process-timeline">
        <div class="container">
            <h2 class="section-title">{{ "services.process.page.methodology.title" | t(locale) }}</h2>
            <div class="process-timeline-track">
                <div class="process-timeline-line"></div>

                <div class="process-phase process-phase--left">
                    <div class="process-phase-card">
                        <div class="process-phase-number">{{ "services.process.page.phase1.number" | t(locale) }}</div>
                        <div class="process-phase-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        </div>
                        <h3 class="process-phase-title">{{ "services.process.page.phase1.title" | t(locale) }}</h3>
                        <p class="process-phase-desc">{{ "services.process.page.phase1.desc" | t(locale) }}</p>
                    </div>
                    <div class="process-phase-dot"></div>
                    <div class="process-phase-empty"></div>
                </div>

                <div class="process-phase process-phase--right">
                    <div class="process-phase-empty"></div>
                    <div class="process-phase-dot"></div>
                    <div class="process-phase-card">
                        <div class="process-phase-number">{{ "services.process.page.phase2.number" | t(locale) }}</div>
                        <div class="process-phase-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                        <h3 class="process-phase-title">{{ "services.process.page.phase2.title" | t(locale) }}</h3>
                        <p class="process-phase-desc">{{ "services.process.page.phase2.desc" | t(locale) }}</p>
                    </div>
                </div>

                <div class="process-phase process-phase--left">
                    <div class="process-phase-card">
                        <div class="process-phase-number">{{ "services.process.page.phase3.number" | t(locale) }}</div>
                        <div class="process-phase-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </div>
                        <h3 class="process-phase-title">{{ "services.process.page.phase3.title" | t(locale) }}</h3>
                        <p class="process-phase-desc">{{ "services.process.page.phase3.desc" | t(locale) }}</p>
                    </div>
                    <div class="process-phase-dot"></div>
                    <div class="process-phase-empty"></div>
                </div>

                <div class="process-phase process-phase--right">
                    <div class="process-phase-empty"></div>
                    <div class="process-phase-dot"></div>
                    <div class="process-phase-card">
                        <div class="process-phase-number">{{ "services.process.page.phase4.number" | t(locale) }}</div>
                        <div class="process-phase-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        </div>
                        <h3 class="process-phase-title">{{ "services.process.page.phase4.title" | t(locale) }}</h3>
                        <p class="process-phase-desc">{{ "services.process.page.phase4.desc" | t(locale) }}</p>
                    </div>
                </div>

                <div class="process-phase process-phase--left">
                    <div class="process-phase-card">
                        <div class="process-phase-number">{{ "services.process.page.phase5.number" | t(locale) }}</div>
                        <div class="process-phase-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="32" height="32"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                        </div>
                        <h3 class="process-phase-title">{{ "services.process.page.phase5.title" | t(locale) }}</h3>
                        <p class="process-phase-desc">{{ "services.process.page.phase5.desc" | t(locale) }}</p>
                    </div>
                    <div class="process-phase-dot"></div>
                    <div class="process-phase-empty"></div>
                </div>

            </div>
        </div>
    </section>

    <section class="process-benefits">
        <div class="container">
            <h2 class="section-title">{{ "services.process.page.benefits.title" | t(locale) }}</h2>
            <div class="process-benefits-grid">
                <div class="process-benefit-card">
                    <div class="process-benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <h3>{{ "services.process.page.benefit1.title" | t(locale) }}</h3>
                    <p>{{ "services.process.page.benefit1.desc" | t(locale) }}</p>
                </div>
                <div class="process-benefit-card">
                    <div class="process-benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                    </div>
                    <h3>{{ "services.process.page.benefit2.title" | t(locale) }}</h3>
                    <p>{{ "services.process.page.benefit2.desc" | t(locale) }}</p>
                </div>
                <div class="process-benefit-card">
                    <div class="process-benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <h3>{{ "services.process.page.benefit3.title" | t(locale) }}</h3>
                    <p>{{ "services.process.page.benefit3.desc" | t(locale) }}</p>
                </div>
            </div>
        </div>
    </section>

    <section class="process-different">
        <div class="container">
            <h2 class="section-title">{{ "services.process.page.different.title" | t(locale) }}</h2>
            <div class="process-different-grid">
                <div class="process-different-item">
                    <div class="process-different-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <p class="process-different-label">{{ "services.process.page.diff1.label" | t(locale) }}</p>
                    <p class="process-different-tagline">{{ "services.process.page.diff1.tagline" | t(locale) }}</p>
                </div>
                <div class="process-different-item">
                    <div class="process-different-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                    <p class="process-different-label">{{ "services.process.page.diff2.label" | t(locale) }}</p>
                    <p class="process-different-tagline">{{ "services.process.page.diff2.tagline" | t(locale) }}</p>
                </div>
                <div class="process-different-item">
                    <div class="process-different-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.42"/></svg>
                    </div>
                    <p class="process-different-label">{{ "services.process.page.diff3.label" | t(locale) }}</p>
                    <p class="process-different-tagline">{{ "services.process.page.diff3.tagline" | t(locale) }}</p>
                </div>
                <div class="process-different-item">
                    <div class="process-different-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <p class="process-different-label">{{ "services.process.page.diff4.label" | t(locale) }}</p>
                    <p class="process-different-tagline">{{ "services.process.page.diff4.tagline" | t(locale) }}</p>
                </div>
            </div>
        </div>
    </section>

    <section class="page-cta">
        <div class="container">
            <h2>{{ "services.process.page.cta.title" | t(locale) }}</h2>
            <p>{{ "services.process.page.cta.text" | t(locale) }}</p>
            <a href="{{ "/" | locale_url }}#contact" class="btn btn-primary">{{ "services.process.page.cta.button" | t(locale) }}</a>
        </div>
    </section>

    {% include "footer.njk" %}

    <script src="/main.js?v=2"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add _includes/pages/services/process.njk
git commit -m "herschrijf process-optimization pagina met tijdlijn, voordelen en onderscheidende factoren"
```

---

## Task 5: Build and verify

**Files:**
- Read: `dist/services/process-optimization/index.html`
- Read: `dist/en/services/process-optimization/index.html`

- [ ] **Step 1: Run the build**

```bash
cd /Users/axel/projects/smartagents-website && npm run build 2>&1 | tail -5
```

Expected: exits with code 0, last line contains `[11ty] Wrote X files in Ys` with no `TemplateContentUnescapedCurlyError` or `Nunjucks` errors.

- [ ] **Step 2: Verify NL output contains all new sections**

```bash
grep -c "process-why\|process-timeline\|process-benefits\|process-different\|page-cta\|page-hero" dist/services/process-optimization/index.html
```

Expected: `6`

- [ ] **Step 3: Verify EN phase titles are translated (not NL)**

```bash
grep "process-phase-title" dist/en/services/process-optimization/index.html
```

Expected: output contains `Discover`, `Analyse`, `Design`, `Implement`, `Measure &amp; Improve` (not `Verken`, `Analyseer`, etc.)

- [ ] **Step 4: Verify stylesheet is v7 in both outputs**

```bash
grep "styles.css" dist/services/process-optimization/index.html && grep "styles.css" dist/en/services/process-optimization/index.html
```

Expected: both lines show `styles.css?v=7`

- [ ] **Step 5: Verify no raw translation keys leaked into output**

```bash
grep "services\.process\.page\.phase\|services\.process\.page\.diff\|services\.process\.page\.why" dist/services/process-optimization/index.html | head -5
```

Expected: no output
