# Team Page — Flip Cards Design

**Date:** 2026-03-30
**Status:** Approved

## Summary

Move the "Ontmoet ons team" section off the homepage onto a dedicated `/team/` (NL) and `/en/team/` (EN) page. Replace the current side-by-side layout with interactive 3D flip cards (pure CSS, no JS).

## Pages

- NL: `/team/` — new file `team.njk` at root + `_includes/pages/team/team.njk`
- EN: `/en/team/` — new file `en/team.njk`
- Both use the existing i18n pattern: thin wrappers with front matter + include

## Homepage Change

Remove the entire `<section id="team" class="team">` block from `_includes/pages/index.njk`. No teaser needed — "Team" is already in the nav.

## Team Page Structure

### Hero
- `<h1>` with `team.title` translation key (already exists)
- Subtitle with `team.subtitle` translation key (already exists)
- Same visual style as other page heroes

### Flip Cards Grid
Three cards in a CSS grid (3 columns desktop → 1 column mobile):

1. **Axel Segers** — Oprichter
2. **Tom Haeldermans** — Oprichter
3. **Agents card** — "Mensen met een visie, agents met een missie"

### Flip Card Anatomy

**Front face:**
- Photo (existing `/assets/axel.webp`, `/assets/tom.webp`, `/assets/agent-network.svg`)
- Name (`<h3>`)
- Role (`team.*.role` translation)

**Back face (revealed on hover/focus):**
- Dark background (`#0a0a0a` or similar)
- Bio text (`team.*.bio` translation)
- Skill tags: small inline badges in `#00d8ff` (cyan) with dark text
- LinkedIn link (Axel and Tom only)

**Agents card back face:**
- Bio text (`team.agents.bio`)
- Agent network SVG icon (small, decorative)
- No skill tags, no LinkedIn

### Flip Animation (pure CSS)
- `perspective: 1000px` on card container
- Inner wrapper: `transform-style: preserve-3d; transition: transform 0.6s ease`
- `:hover` and `:focus-within` on container: `rotateY(180deg)` on inner
- Back face: `rotateY(180deg)` + `backface-visibility: hidden`
- Front face: `backface-visibility: hidden`

## New Translation Keys

### nl.json
```json
"team.axel.skills": "Digitale transformatie · Strategie · Ondernemerschap · AI-adoptie",
"team.tom.skills": "Agentic AI · Enterprise architectuur · Automatisatie · Technisch ontwerp",
"page.team.title": "Team — SmartAgents",
"page.team.description": "Ontmoet het team achter SmartAgents: de mensen en agents die uw bedrijf transformeren."
```

### en.json
```json
"team.axel.skills": "Digital transformation · Strategy · Entrepreneurship · AI adoption",
"team.tom.skills": "Agentic AI · Enterprise architecture · Automation · Technical design",
"page.team.title": "Team — SmartAgents",
"page.team.description": "Meet the team behind SmartAgents: the people and agents transforming your business."
```

## Front Matter (NL page)

```yaml
---
layout: shell.njk
locale: nl
nlPermalink: /team/
permalink: /team/
shellContext: team
title: "{{ 'page.team.title' | t(locale) }}"
description: "{{ 'page.team.description' | t(locale) }}"
---
```

## Nav Active State

Add `team` shellContext to `_data/shellConfigs.js` to highlight the "Team" nav item when on `/team/`.

## Constraints

- No JavaScript — pure CSS flip only
- Use existing webp/svg assets — no new images needed
- Skills displayed as plain text tags (no icon dependency)
- Do NOT push to remote without explicit user approval
