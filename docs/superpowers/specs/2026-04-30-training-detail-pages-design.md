# Training detail-pagina's — design

**Datum:** 2026-04-30
**Status:** spec, klaar voor implementatieplan

## Aanleiding

De training-overzichtspagina (`/services/training/`) bevat vijf cursussen in een visuele "boom"-structuur. Drie cursussen — AI introductie, M365 Copilot, en C-Level "AI als Strategisch Wapen" — hebben een PDF-onepager via een "Download fiche"-knop op hun kaart.

Bezoekers willen de inhoud van die onepagers ook online kunnen lezen, delen, en laten indexeren door zoekmachines, zonder eerst een PDF te moeten downloaden. We voegen daarom per cursus een aparte HTML-detailpagina toe en op de overzichtskaart een "Meer info"-knop naast "Download fiche".

## Scope

**Wel in scope (deze spec):**
- Detailpagina's voor de drie cursussen die een onepager hebben: `ai-introductie`, `m365-copilot`, `c-level`.
- Beide locales: NL én EN, met volledige inhoudelijke vertaling van de PDF-content.
- "Meer info"-knop op de drie kaarten op de overzichtspagina (zowel desktop-boom als mobiele path-chooser).

**Niet in scope:**
- Detailpagina's voor de Deep Dive ("Context engineering") en Developer trainingen — geen onepager-content beschikbaar. De template-architectuur moet zo opgezet zijn dat deze later eenvoudig kunnen worden toegevoegd: alleen 2 wrappers + i18n-keys, geen template-aanpassingen.
- Nieuwe visuele componenten of een parallel design-systeem dat de PDF-look reproduceert. We hergebruiken bestaande page-secties.

## Architectuur

### Bestandsstructuur

```
services/training/
  ai-introductie.html       (NL wrapper)
  m365-copilot.html         (NL wrapper)
  c-level.html              (NL wrapper)
en/services/training/
  ai-introductie.html       (EN wrapper)
  m365-copilot.html         (EN wrapper)
  c-level.html              (EN wrapper)
_includes/pages/services/training/
  detail.njk                (gedeeld template-body, één per locale via wrapper)
```

### URL-routes

| Cursus | NL | EN |
|---|---|---|
| AI introductie | `/services/training/ai-introductie/` | `/en/services/training/ai-introductie/` |
| M365 Copilot | `/services/training/m365-copilot/` | `/en/services/training/m365-copilot/` |
| C-Level | `/services/training/c-level/` | `/en/services/training/c-level/` |

Slugs blijven NL voor beide locales — consistent met `services/optimalisatie-support/` op EN.

### Wrapper-front matter

NL voorbeeld (`services/training/ai-introductie.html`):
```yaml
---
nlPermalink: /services/training/ai-introductie/
shellContext: services
date: git Last Modified
pageKey: training-ai-introductie
schemaType: service
serviceNameKey: services.training.detail.ai-introductie.title
courseKey: ai-introductie
audienceTheme: cyan
pdfFilename: SmartAgents_AI_Introductie_Onepager.pdf
socialImage: /assets/social-preview.webp
socialAlt:
  nl: SmartAgents – AI-gedreven bedrijfsautomatisatie
  en: SmartAgents – AI-driven business automation
locale: nl
permalink: /services/training/ai-introductie/
---
{% include "pages/services/training/detail.njk" %}
```

EN equivalent: identiek behalve `permalink: /en/services/training/ai-introductie/` en zonder `locale: nl` (komt uit `en/en.json`).

C-Level wrapper gebruikt `audienceTheme: purple` en de C-Level PDF-filename.

### Gedeeld detail-template

`detail.njk` rendert alle secties op basis van `courseKey` voor i18n-lookups en `audienceTheme` voor accent-kleur. Geen course-specifieke conditionals in het template — alle variatie zit in i18n-strings.

## Pagina-secties

Elke detailpagina rendert in deze volgorde, met hergebruik van bestaande site-componenten:

### 1. Hero (`section.page-hero`)

- Kicker (klein label, bv. "PRAKTIJKTRAINING" of "C-LEVEL EXECUTIVE PROGRAMME") via nieuwe `.page-hero-kicker` class — kleine CSS-extensie van ~5 regels.
- `<h1>` met cursus-titel.
- Subtitle paragraaf met intro-tekst.
- Vier metadata-pillen onder elkaar (Duur, Deelnemers, Locatie, Taal) in een flex-rij via nieuwe `.page-hero-meta` class — ~10 regels CSS.

### 2. Overzicht (`section.page-section`)

Bestaand patroon van `services.agentic.page.overview`:
- `<h2 class="section-title">` ("Wat je leert" / "Wat u meeneemt")
- `<div class="page-vision-text"><p>` met korte intro ("Zes thema's, één dag")

### 3. Zes thema's (`section.page-section page-section-alt`)

Hergebruik `.page-role-grid` uit `agentic.njk`:
- 6 cards in 2×3 layout
- Per card: SVG-icon + nieuwe `.page-role-item-kicker` (klein categorielabel zoals "VEILIGHEID") + `<h3>` titel + `<p>` beschrijving
- Kicker is kleine CSS-extensie van ~3 regels

### 4. Wat neem je mee? (`section.page-section`)

Hergebruik `.page-benefits-grid` uit `agentic.njk`:
- 5 benefit-cards, elk met checkmark-icon + titel (vetgedrukt deel uit PDF) + beschrijving

### 5. Hoe verloopt je dag? (`section.page-section page-section-alt`)

4 numbered cards met hergebruik van `.approach-step` patroon (bestaat al op homepage):
- Per blok: nummer-badge + tijdslot-label (bv. "OCHTEND 1" of "BLOK 1 · 09:00") + titel
- Geen beschrijving op dit niveau

### 6. Aanbeveling + volgende stap (`section.page-section`)

Eenvoudig tekstblok:
- "Aanbevolen: ..." regel
- "Volgende stap: ..." regel met optionele link naar de logische volgende cursus indien die een detailpagina heeft

### 7. CTA (`section.page-cta`)

Bestaand patroon uit `training.njk`:
- Hoofd-knop "Plan een verkennend gesprek" → `/#contact`
- Secundaire knop "Download fiche (PDF)" naast de hoofd-CTA

## i18n-keys

### Per cursus

Alle keys onder `services.training.detail.<courseKey>`:

```
services.training.detail.<key>.kicker                    "PRAKTIJKTRAINING" / "C-LEVEL EXECUTIVE PROGRAMME"
services.training.detail.<key>.title                     "AI introductie" / ...
services.training.detail.<key>.subtitle                  intro paragraaf
services.training.detail.<key>.meta.duration             "1 dag" / "½ dag · 4 uur"
services.training.detail.<key>.meta.participants         "3 — 20" / "Max 8"
services.training.detail.<key>.meta.location             "Bij u op kantoor" / "Onsite of Online"
services.training.detail.<key>.meta.language             "NL / EN"

services.training.detail.<key>.overview.title            "Wat je leert" / "Wat u meeneemt"
services.training.detail.<key>.overview.text             "Zes thema's, één dag" / "Zes strategische thema's"

services.training.detail.<key>.theme1.kicker             "VEILIGHEID" etc.
services.training.detail.<key>.theme1.title              "Veilig met AI"
services.training.detail.<key>.theme1.desc               "GDPR, EU AI Act..."
... × 6

services.training.detail.<key>.takeaway.title            "Wat neem je mee?" / "Wat neemt u mee?"
services.training.detail.<key>.takeaway1.title           "Helder beeld"
services.training.detail.<key>.takeaway1.desc            "je weet wat AI is..."
... × 5

services.training.detail.<key>.day.title                 "Hoe verloopt je dag?" / "Hoe verloopt uw halve dag?"
services.training.detail.<key>.day1.label                "OCHTEND 1" / "BLOK 1 · 09:00"
services.training.detail.<key>.day1.title                "Veilig gebruik & AI-fundamenten"
... × 4

services.training.detail.<key>.recommendation            "Aanbevolen: eigen laptop met toegang tot een AI-tool naar keuze."
services.training.detail.<key>.next.label                "Volgende stap"
services.training.detail.<key>.next.text                 "AI in de praktijk: slimmer werken"
services.training.detail.<key>.next.href                 "/services/training/m365-copilot/"  (optioneel; lege string als er geen logische volgende cursus is)

services.training.detail.<key>.cta.title                 "Klaar om te starten?"
services.training.detail.<key>.cta.text                  korte intro
services.training.detail.<key>.cta.button                "Plan een verkennend gesprek"
services.training.detail.<key>.cta.download              "Download fiche (PDF)"
```

Per cursus zijn dat ~32 keys × 3 cursussen × 2 talen = ~192 keys totaal toegevoegd aan `i18n/nl.json` en `i18n/en.json`.

### Page-meta keys (per cursus)

```
page.training.detail.<key>.title                         browser tab
page.training.detail.<key>.description                   meta description / OG description
```

### Gedeelde keys voor knoppen op overzichtspagina

```
services.training.page.detail.button                     "Meer info" / "More info"
```

EN-vertalingen worden volledig op basis van de NL-PDF-content gemaakt. Voor C-Level wordt de formele "u"-vorm in NL behouden en formeel/professionele "you" in EN gebruikt.

## Schema (JSON-LD)

`schemaType: service` voor alle drie de detailpagina's. De bestaande `buildSchema`-handler in `.eleventy.js` ondersteunt dit type al en heeft geen wijzigingen nodig. Een `Course`-type zou technisch correcter zijn, maar vereist een nieuwe schema-handler en is niet kritiek voor de huidige doelen — kan later toegevoegd worden indien gewenst.

## "Meer info"-knoppen op overzichtspagina

Op de drie cursus-kaarten op `/services/training/` (zowel de desktop-boom als de mobiele path-chooser) wordt een "Meer info"-knop toegevoegd **links** van de bestaande "Download fiche"-knop, in dezelfde flex-rij.

Layout per kaart-meta (na deze wijziging):
```
[Meer info →]  [⤓ Download fiche]
```

Beide knoppen delen de bestaande `.training-onepager-btn` base-class. "Meer info" krijgt een gevulde stijl (filled cyan / filled purple) als primaire actie; "Download fiche" blijft outline als secundaire actie. De gevulde variant is een nieuwe modifier-class (`.training-onepager-btn--filled-cyan`, `.training-onepager-btn--filled-management`) van ~6 regels CSS per variant.

Op de management-kaart krijgt "Meer info" een purple gevulde stijl, net zoals de bestaande purple "Download fiche" een purple outline heeft.

**Mobiele kaart** (`tmc-card`): twee knoppen onder elkaar of in flex-wrap. Identieke knoppen, layout volgt natuurlijk uit dezelfde flex-rij gestapeld op smalle schermen.

## CSS-uitbreidingen

Beperkt tot kleine extensies:

1. `.page-hero-kicker` — klein label boven `<h1>` in hero, ~5 regels
2. `.page-hero-meta` — flex-rij voor 4 metadata-pillen, ~10 regels
3. `.page-hero-meta-pill` — individuele pill-styling, ~8 regels
4. `.page-role-item-kicker` — kleine label boven `<h3>` in role-card, ~3 regels
5. `.training-onepager-btn--filled-cyan` — gevulde cyan-knop variant, ~6 regels
6. `.training-onepager-btn--filled-management` — gevulde purple-knop variant, ~6 regels

Geen wijzigingen aan bestaande componenten. Alle nieuwe CSS staat in `styles.css` op een logische plek bij vergelijkbare regels.

## Build-verificatie

Na implementatie:
- `npm run build` produceert succesvol 6 nieuwe pagina's in `dist/`:
  - `dist/services/training/{ai-introductie,m365-copilot,c-level}/index.html`
  - `dist/en/services/training/{ai-introductie,m365-copilot,c-level}/index.html`
- Iedere pagina bevat de juiste hreflang-links naar de andere locale.
- "Meer info"-knoppen op de overzichtspagina linken correct naar de bovenstaande URLs.
- "Download fiche"-knoppen op de detailpagina's linken naar de juiste PDF in `/assets/`.
- Local preview op `http://127.0.0.1:8000` toont alle pagina's correct in beide locales.

## Toekomstige uitbreiding (out of scope nu)

Wanneer onepager-content voor cursus 4 (Deep Dive) of 5 (Developer) beschikbaar komt:
1. Nieuwe NL-wrapper + EN-wrapper aanmaken met de juiste `courseKey`, permalink, en `audienceTheme` (`blue` voor Deep Dive, `green` voor Developer — vereist 2 extra filled-knop varianten).
2. Bijbehorende i18n-keys toevoegen aan `nl.json` en `en.json`.
3. "Meer info"-knop activeren op de bijbehorende kaart op de overzichtspagina.

Geen wijzigingen aan `detail.njk` of bestaande pagina's nodig.
