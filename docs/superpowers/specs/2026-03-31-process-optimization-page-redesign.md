# Process Optimization Page Redesign

## Goal

Rewrite the `/services/process-optimization/` page to be significantly more extensive and visually attractive, with a dark/technical aesthetic and a step-by-step methodology timeline as the centrepiece.

## Visual Style

- **Full dark page** throughout — consistent `#080c10` / `#0d1117` backgrounds
- **Cyan accents** (`#00d8ff`) for timeline line, phase numbers, icons, hover states
- Pure CSS only — no new JavaScript
- Mobile: single-column layout, timeline line runs along the left edge

---

## Sections

### 1. Hero

Same placement as current, but with stronger visual weight:
- Large H1 with cyan accent underline
- Subtitle (2 sentences)
- Dark background, full-width

### 2. Why Process Optimization Matters

Two-column layout:
- **Left**: bold impact statement ("Repetitieve taken kosten je team uren per week. AI verandert dat.")
- **Right**: 3 short impact points with cyan checkmark icons

### 3. Our Methodology (centrepiece)

Vertical timeline with cyan connecting line running down the centre. 5 phases, alternating left/right:

| # | Phase | Content |
|---|-------|---------|
| 01 | Verken | Map current workflows, interview stakeholders, identify pain points |
| 02 | Analyseer | Deep-dive into processes, quantify waste, map automation opportunities |
| 03 | Ontwerp | Design optimized process with AI agents, define KPIs |
| 04 | Implementeer | Build and deploy AI automations, integrate with existing tools |
| 05 | Meet & Verbeter | Track results against KPIs, iterate, continuous improvement loop |

**Each phase card:**
- Large muted phase number (`01`) top-left
- SVG icon (unique per phase)
- Phase name as H3
- 2–3 sentence description
- Dark card: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(0,216,255,0.15)`
- Cyan dot on timeline line

**Mobile:** Single column, all cards left-aligned, timeline line on left edge.

### 4. What You Gain (Benefits)

Redesigned versions of the current 3 benefits — stronger visual weight:
- 48px icon in a cyan-tinted circle
- Larger heading
- 2–3 sentence description (currently just one sentence)
- Dark card with cyan border on hover + subtle cyan `box-shadow` glow

Current benefits preserved: cost savings, speed, happier teams.

### 5. What Makes Us Different

Horizontal strip with 4 differentiators, separated by subtle vertical dividers:

| Icon | Label | Tagline |
|------|-------|---------|
| Lightning | AI-native | Niet achteraf toegevoegd — ingebouwd vanaf dag één |
| Target | Meetbare resultaten | We definiëren KPI's voor de start |
| Arrows | Continu verbeteren | Geen eenmalig project, maar een doorlopend proces |
| Building | Sector-specifiek | Diepgaande kennis van jouw branche |

### 6. CTA

Existing style — no changes needed.

---

## Architecture

**Files to modify:**
- `_includes/pages/services/process.njk` — full rewrite
- `styles.css` — new CSS classes for timeline, differentiators strip, redesigned benefit cards; bump to `?v=7`
- `i18n/nl.json` — new translation keys for all new content
- `i18n/en.json` — English translations for all new keys

**No new files** — same NL/EN wrapper files, same route.

**No new JavaScript** — all visual effects via CSS only.

---

## New Translation Keys

```
services.process.page.why.title
services.process.page.why.statement
services.process.page.why.point1
services.process.page.why.point2
services.process.page.why.point3

services.process.page.methodology.title
services.process.page.phase1.number / .title / .desc
services.process.page.phase2.number / .title / .desc
services.process.page.phase3.number / .title / .desc
services.process.page.phase4.number / .title / .desc
services.process.page.phase5.number / .title / .desc

services.process.page.benefit1.title / .desc  (updated, longer)
services.process.page.benefit2.title / .desc  (updated)
services.process.page.benefit3.title / .desc  (updated)

services.process.page.different.title
services.process.page.diff1.label / .tagline
services.process.page.diff2.label / .tagline
services.process.page.diff3.label / .tagline
services.process.page.diff4.label / .tagline
```

---

## CSS Classes (new)

```
.process-why              — "Why it matters" section
.process-why-grid         — 2-col layout
.process-why-statement    — bold left statement
.process-why-points       — right-side impact points list

.process-timeline         — section wrapper
.process-timeline-line    — the cyan vertical line
.process-phase            — individual phase row (alternating)
.process-phase--left      — content on left
.process-phase--right     — content on right
.process-phase-dot        — cyan circle on timeline line
.process-phase-card       — dark card with border
.process-phase-number     — large muted number (01–05)
.process-phase-icon       — SVG icon wrapper
.process-phase-title      — H3
.process-phase-desc       — description paragraph

.process-benefits         — redesigned benefits section
.process-benefit-card     — individual benefit card (with hover glow)
.process-benefit-icon     — 48px icon in cyan circle

.process-different        — "What makes us different" section
.process-different-grid   — horizontal strip
.process-different-item   — individual differentiator
.process-different-icon   — icon wrapper
```

---

## Build & Verification

After implementation:
1. `npm run build`
2. Verify `dist/services/process-optimization/index.html` contains all 6 sections
3. Verify `dist/en/services/process-optimization/index.html` matches (EN translations)
4. Check mobile layout renders correctly
