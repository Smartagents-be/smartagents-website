# SmartAgents — design system

Extracted from homepage direction **1a** ("Redactioneel — licht, lijnen, veel lucht") in
`SmartAgents Homepage.dc.html`, the agreed direction for the smartagents.be redesign.
That design doc lives in the "Smartagents.be Redesign Direction" Claude Design project and is
the single source of truth; every value here was lifted from it verbatim.

## The company

SmartAgents (Beringen, Belgium — BE 1037.114.694) builds "digital colleagues": agentic AI
automation for Belgian SMEs and enterprises. Four services — procesoptimalisatie, agentic
automatisatie, training en coaching, AI staffing — plus their own product, **SmartSpace**
(in beta): one workspace where a company's agents and its people sit side by side.
The site is Dutch-first (NL / FR / EN).

### Sources

- `SmartAgents Homepage.dc.html` (design project) — the redesign direction, section 1a.
- `assets/logo.svg` / `assets/logo-dark.svg` — supplied by the client.
- No Figma file or brand book was provided. Anything not visible in 1a is absent here
  by design rather than invented.

## Content fundamentals

- **Language**: Dutch (Belgian), formal *u* — never *je* — in body copy. Headings occasionally
  drop into second person plural anyway ("Zullen we eens praten").
- **Sentence case everywhere.** No all-caps, no title case, not even in buttons or labels.
- **Short declaratives.** "Wat werkt en wat niet." "Digitale collega's die nooit slapen."
  Copy is confident but plain — no superlatives, no "revolutionary", no exclamation marks.
- **Honesty as a tone device.** The site repeatedly says where AI does *not* help:
  "we zeggen eerlijk waar AI niets toevoegt", "we zeggen ook wanneer u ons niet nodig hebt",
  "wat niet gebruikt wordt, halen we er weer uit". Keep that — it is the brand's whole posture.
- **Concrete over abstract**: "mail, facturen, offertes, aanbestedingen, calculaties",
  not "business processes".
- **CTA vocabulary**: *Plan een gesprek* (primary, everywhere), *Bekijk wat we doen →*,
  *Meer info →*, *Ontdek SmartSpace*, *Alle artikelen →*. Arrows are the literal character →,
  never an icon.
- **No emoji.** Ever.
- Dates: "12 juni 2026" — lowercase month, tabular numerals.

## Visual foundations

**Two darks, one accent, a lot of paper.** Ink `oklch(0.148 0.005 247.84)` for text and primary
buttons; navy field `oklch(0.183 0.022 252)` for every dark shape; cyan
`oklch(0.53 0.112 214)` on paper and `#00d8ff` on the field. Nothing else. Paper is a stack of
near-whites (0.9846 → 0.945 on hover); pure white is reserved for the mega-menu panel.

**The dark field is the brand.** Large navy shapes cut with angular clip paths — a wedge behind
the header logo, a petal and its counter-lobe on the hero's two flanks, a chevroned full-width
band for SmartSpace, a disc for the DNA section — each carrying a live cyan node network (the logo motif in motion) that reads as
one continuous field across the whole page. There is no photography, no illustration, no
gradient background and no texture. Screenshots appear as explicitly labelled placeholders.

**Type**: Geist (fallback Inter, system-ui) at 650 for display and headings, 600/550 for UI,
400–450 for body. Tight tracking that loosens as size drops (−0.032em display → −0.005em UI).
Body copy runs 1.6–1.62 leading, capped at 44ch. Monospace (`ui-monospace`) appears only as
cyan two-digit indexes. Instrument Serif italic exists as a single optional hero accent line.

**Layout**: full-bleed — the page runs edge to edge, no sheet and no desk. 64px page gutter,
104px between sections, 72px column gap. Content lists are hairline-separated rows — not cards.
Section headings sit under a 2px cyan rule with 22px of air. Asymmetry is the rule: the hero
text occupies the left 52%, the dark field the rest.

**Borders and elevation**: 1px hairlines at `oklch(0.925 0.005 247.84)` do most of the
separating work. Shadows are deep, wide and very soft (`0 30px 70px -34px` at 32% opacity) —
never a tight drop shadow, never an inner glow except the SmartSpace screenshot frame.
Transparency and blur are used once: the pointer spotlight over the screenshot frame.

**Radii**: 5 chip · 7 button · 8 nav item · 11 menu item · 16 menu panel · 20 card · 26 shell ·
999 pill. Pills are only used for badges and the language chip.

**Motion**: two speeds. Travel (transform, shadow) is 0.34s `cubic-bezier(0.16,1,0.3,1)`;
colour (text, border, background) is 0.22s ease. Hover on filled buttons = lift 2px + soft
shadow; on outlined buttons = cyan border and text; on rows and nav items = a wash background.
Nothing bounces, nothing scales, nothing spins. Scroll reveals are a short fade-and-rise.
The node network drifts at 30fps and freezes under `prefers-reduced-motion`.

**Press states**: the design has none beyond the hover lift settling back — keep it that way.

## Iconography

The system is deliberately icon-poor. The only vector marks are the SmartAgents logo (light and
dark) and a 9×6px chevron drawn inline in the nav. Everything else that would be an icon is a
typographic arrow (→). Numbers act as icons: monospace `01–05` in cyan. **Do not introduce an
icon library** — if a new surface truly needs one, raise it rather than picking one silently.

## Fonts

The design doc loads Geist and Instrument Serif from Google Fonts. **This repository does not**:
`.claude/skills/fast-static-site/SKILL.md` §4 forbids third-party font origins, and no licensed
webfont binaries were supplied. `--font-sans` names Geist first and falls back to the platform UI
face, which costs zero requests and zero layout shift.

**Ask the client for the font files.** Once they land: subset to WOFF2, drop them in
`assets/fonts/`, add `@font-face` rules in `tokens/fonts.css` with `font-display: swap`, preload
only the weight used above the fold, and set `size-adjust` on a fallback face so nothing shifts.

## Index

- `styles.css` — the entry point (imports only).
- `tokens/` — `fonts`, `colors`, `typography`, `spacing`, `shape`, `motion`.
- `assets/` — `logo.svg`, `logo-dark.svg`.

The production implementation of all of this lives in `src/`; see `SKILL.md` for the map.

## Deviations from the design doc

The doc is a fixed 1180px canvas rendered in a preview host. Four things had to be decided
outside it, and are decided the same way everywhere in `src/`:

1. **Responsive behaviour.** The three page measures (`--gutter-page`, `--gap-column`,
   `--section-rhythm`) and the type scale are fluid; the doc's value is always the upper bound.
   Below 1080px the nav collapses to a disclosure and the two hero shapes pull back into their
   corners so the copy keeps light ground, below 940px the hero petal becomes a flat band under
   the copy, and the shell loses its radius and shadow below 1252px.
2. **Fonts.** No webfont is loaded — see above.
3. **The mega-menu is CSS-only** (`:hover, :focus-within`), so it can never fail to open and is
   reachable from the keyboard.
4. **Rows are only links when there is somewhere to go.** The doc's service and article rows link
   to detail pages that do not exist yet, so they render as plain rows (and drop the "Meer info →"
   cue). Give `row()`/`articleRow()` an href in `src/pages/home.mjs` when those pages land and the
   hover, the arrow and the translate all come back.
