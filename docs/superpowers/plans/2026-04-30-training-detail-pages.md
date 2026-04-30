# Training detail-pagina's — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Voeg drie HTML-detailpagina's toe aan de training-sectie (AI introductie, M365 Copilot, C-Level), beide locales, met "Meer info"-knop links naast "Download fiche" op de overzichtskaarten.

**Architecture:** Eén gedeeld Nunjucks-template (`detail.njk`) wordt geïncludeerd via 6 thin wrappers (3 NL + 3 EN). Content komt volledig uit `i18n/nl.json` en `i18n/en.json` met keys onder `services.training.detail.<courseKey>`. Alle pagina-secties hergebruiken bestaande site-componenten (`page-hero`, `page-section`, `page-role-grid`, `page-benefits-grid`, `approach-step`, `page-cta`). Beperkte CSS-extensies (~6 kleine classes). Voor wijzigingen aan `_includes/pages/services/training.njk`: toevoegen van "Meer info"-knop links naast bestaande "Download fiche".

**Tech Stack:** Eleventy 3, Nunjucks templates, JSON-based i18n via `EleventyI18nPlugin` + custom `t` filter, plain CSS (`styles.css`). Build verificatie via `npm run build`. Geen test suite — verificatie = build slaagt + visuele inspectie van `dist/`.

---

## File Structure

**Aanmaken:**
- `_includes/pages/services/training/detail.njk` (gedeelde template body)
- `services/training/ai-introductie.html` (NL wrapper)
- `services/training/m365-copilot.html` (NL wrapper)
- `services/training/c-level.html` (NL wrapper)
- `en/services/training/ai-introductie.html` (EN wrapper)
- `en/services/training/m365-copilot.html` (EN wrapper)
- `en/services/training/c-level.html` (EN wrapper)

**Aanpassen:**
- `i18n/nl.json` — ~170 nieuwe keys
- `i18n/en.json` — ~170 nieuwe keys
- `styles.css` — ~6 kleine CSS-extensies
- `_includes/pages/services/training.njk` — "Meer info"-knop in 6 kaarten (3 desktop + 3 mobiel)

---

## Task 1: CSS-extensies voor nieuwe componenten

**Files:**
- Modify: `styles.css` (toevoegen na bestaande `.training-onepager-btn--management:hover` block)

- [ ] **Step 1: Voeg CSS-extensies toe aan `styles.css`**

Open `styles.css` en zoek de `.training-onepager-btn--management:hover` block (regel ~3370). Voeg direct daarna toe:

```css
/* ── Training detail page extensions ── */
.training-onepager-btn--filled-cyan {
    color: #0a1828;
    border-color: var(--cyan);
    background: var(--cyan);
}
.training-onepager-btn--filled-cyan:hover {
    background: #1de2ff;
    box-shadow: 0 0 14px rgba(0,216,255,0.3);
}
.training-onepager-btn--filled-management {
    color: #0d0820;
    border-color: #c084fc;
    background: #c084fc;
}
.training-onepager-btn--filled-management:hover {
    background: #d8b4fe;
    box-shadow: 0 0 14px rgba(168,85,247,0.35);
}
.page-hero-kicker {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--cyan);
    margin-bottom: 14px;
}
.page-hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 28px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
}
.page-hero-meta-pill {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.page-hero-meta-pill-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--cyan);
    opacity: 0.85;
}
.page-hero-meta-pill-value {
    font-size: 1rem;
    font-weight: 600;
    color: #ffffff;
}
.page-role-item-kicker {
    display: block;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--cyan);
    margin-bottom: 6px;
}
```

- [ ] **Step 2: Build site om te bevestigen dat CSS valide is**

Run: `npm run build`
Expected: succesvolle build, geen CSS-errors. `dist/styles.css` bevat de nieuwe regels.

Verifieer: `grep -c "page-hero-kicker" dist/styles.css` → moet `1` retourneren.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "$(cat <<'EOF'
voeg CSS extensies toe voor training detail pagina componenten

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Maak gedeelde detail-template

**Files:**
- Create: `_includes/pages/services/training/detail.njk`

- [ ] **Step 1: Maak nieuwe directory en template-bestand aan**

```bash
mkdir -p _includes/pages/services/training
```

Maak het bestand `_includes/pages/services/training/detail.njk` met deze volledige inhoud:

```njk
{% set k = "services.training.detail." + courseKey %}
{% set nlUrl = "/services/training/" + courseKey + "/" %}
{% set enUrl = "/en/services/training/" + courseKey + "/" %}
{% set nlAltUrl = nlUrl | absoluteUrl(baseUrl) %}
{% set enAltUrl = enUrl | absoluteUrl(baseUrl) %}
<!DOCTYPE html>
<html lang="{{ locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ ("page.training.detail." + courseKey + ".title") | t(locale) }}</title>
    <meta name="description" content="{{ ('page.training.detail.' + courseKey + '.description') | t(locale) }}">
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
    <meta property="og:title" content="{{ ('page.training.detail.' + courseKey + '.title') | t(locale) }}">
    <meta property="og:description" content="{{ ('page.training.detail.' + courseKey + '.description') | t(locale) }}">
    <meta property="og:locale" content="{{ ogLocale }}">
    <meta property="og:locale:alternate" content="{{ ogLocaleAlt }}">
    <meta property="og:image" content="{{ resolvedSocialImage }}">
    <meta property="og:image:alt" content="{{ resolvedSocialAlt }}">
    <meta property="og:site_name" content="SmartAgents">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ ('page.training.detail.' + courseKey + '.title') | t(locale) }}">
    <meta name="twitter:description" content="{{ ('page.training.detail.' + courseKey + '.description') | t(locale) }}">
    <meta name="twitter:image" content="{{ resolvedSocialImage }}">
    <meta name="twitter:image:alt" content="{{ resolvedSocialAlt }}">
    <meta name="twitter:domain" content="smartagents.be">

    <link rel="icon" type="image/svg+xml" href="/assets/logo.svg">
    <link rel="stylesheet" href="/styles.css?v={{ assetsVersion }}">
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
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18080961249"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'AW-18080961249');
    </script>
</head>
<body data-service="training" data-training-detail="{{ courseKey }}">
    {% include "header.njk" %}

    <section class="page-hero">
        <div class="container">
            <span class="page-hero-kicker">{{ (k + ".kicker") | t(locale) }}</span>
            <h1>{{ (k + ".title") | t(locale) }}</h1>
            <p>{{ (k + ".subtitle") | t(locale) }}</p>
            <div class="page-hero-meta">
                <div class="page-hero-meta-pill">
                    <span class="page-hero-meta-pill-label">{{ "services.training.detail.meta.duration.label" | t(locale) }}</span>
                    <span class="page-hero-meta-pill-value">{{ (k + ".meta.duration") | t(locale) }}</span>
                </div>
                <div class="page-hero-meta-pill">
                    <span class="page-hero-meta-pill-label">{{ "services.training.detail.meta.participants.label" | t(locale) }}</span>
                    <span class="page-hero-meta-pill-value">{{ (k + ".meta.participants") | t(locale) }}</span>
                </div>
                <div class="page-hero-meta-pill">
                    <span class="page-hero-meta-pill-label">{{ "services.training.detail.meta.location.label" | t(locale) }}</span>
                    <span class="page-hero-meta-pill-value">{{ (k + ".meta.location") | t(locale) }}</span>
                </div>
                <div class="page-hero-meta-pill">
                    <span class="page-hero-meta-pill-label">{{ "services.training.detail.meta.language.label" | t(locale) }}</span>
                    <span class="page-hero-meta-pill-value">{{ (k + ".meta.language") | t(locale) }}</span>
                </div>
            </div>
        </div>
    </section>

    <section class="page-section">
        <div class="container">
            <h2 class="section-title">{{ (k + ".overview.title") | t(locale) }}</h2>
            <div class="page-vision-text">
                <p>{{ (k + ".overview.text") | t(locale) }}</p>
            </div>
        </div>
    </section>

    <section class="page-section page-section-alt">
        <div class="container">
            <h2 class="section-title">{{ (k + ".themes.title") | t(locale) }}</h2>
            <div class="page-role-grid">
                {% for n in [1, 2, 3, 4, 5, 6] %}
                <div class="page-role-item">
                    <div class="page-role-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v8M8 12h8"/>
                        </svg>
                    </div>
                    <div>
                        <span class="page-role-item-kicker">{{ (k + ".theme" + n + ".kicker") | t(locale) }}</span>
                        <h3>{{ (k + ".theme" + n + ".title") | t(locale) }}</h3>
                        <p>{{ (k + ".theme" + n + ".desc") | t(locale) }}</p>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>
    </section>

    <section class="page-section">
        <div class="container">
            <h2 class="section-title">{{ (k + ".takeaway.title") | t(locale) }}</h2>
            <div class="page-benefits-grid">
                {% for n in [1, 2, 3, 4, 5] %}
                <div class="page-benefit-card">
                    <div class="page-benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <h3>{{ (k + ".takeaway" + n + ".title") | t(locale) }}</h3>
                    <p>{{ (k + ".takeaway" + n + ".desc") | t(locale) }}</p>
                </div>
                {% endfor %}
            </div>
        </div>
    </section>

    <section class="page-section page-section-alt">
        <div class="container">
            <h2 class="section-title">{{ (k + ".day.title") | t(locale) }}</h2>
            <div class="approach-grid">
                {% for n in [1, 2, 3, 4] %}
                <div class="approach-step">
                    <div class="approach-step-number">{{ n }}</div>
                    <div class="approach-step-content">
                        <span class="page-role-item-kicker">{{ (k + ".day" + n + ".label") | t(locale) }}</span>
                        <h3>{{ (k + ".day" + n + ".title") | t(locale) }}</h3>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>
    </section>

    <section class="page-section">
        <div class="container">
            <div class="page-vision-text">
                <p><strong>{{ (k + ".recommendation") | t(locale) }}</strong></p>
                <p>
                    <span class="page-role-item-kicker">{{ (k + ".next.label") | t(locale) }}</span>
                    {% set nextHref = (k + ".next.href") | t(locale) %}
                    {% if nextHref and nextHref != "" %}
                        <a href="{{ nextHref }}">{{ (k + ".next.text") | t(locale) }}</a>
                    {% else %}
                        {{ (k + ".next.text") | t(locale) }}
                    {% endif %}
                </p>
            </div>
        </div>
    </section>

    <section class="page-cta">
        <div class="container">
            <h2>{{ (k + ".cta.title") | t(locale) }}</h2>
            <p>{{ (k + ".cta.text") | t(locale) }}</p>
            <div class="page-cta-buttons">
                <a href="{{ "/" | locale_url }}#contact" class="btn btn-primary">{{ "services.training.detail.cta.button" | t(locale) }}</a>
                <a href="/assets/{{ pdfFilename }}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">{{ "services.training.detail.cta.download" | t(locale) }}</a>
            </div>
        </div>
    </section>

    {% include "footer.njk" %}

    <script src="/main.js?v={{ assetsVersion }}"></script>
</body>
</html>
```

- [ ] **Step 2: Verifieer dat `.approach-step`, `.approach-grid`, `.btn-secondary` en `.page-cta-buttons` styling bestaan**

Run: `grep -n "\.approach-step\b\|\.approach-grid\b\|\.btn-secondary\b\|\.page-cta-buttons\b" styles.css | head -20`

Expected: meerdere matches voor approach-step en approach-grid (homepage component). `btn-secondary` en `page-cta-buttons` bestaan mogelijk nog niet — als ze ontbreken, voeg deze regels toe aan `styles.css` direct na de `.btn-primary` regels (zoek `\.btn-primary` in styles.css):

```css
.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 10px;
    border: 1px solid rgba(0,216,255,0.35);
    background: transparent;
    color: var(--cyan);
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.btn-secondary:hover {
    background: rgba(0,216,255,0.1);
    box-shadow: 0 0 16px rgba(0,216,255,0.25);
    transform: translateY(-1px);
}
.page-cta-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin-top: 24px;
}
```

Als ze al bestaan (bv. ergens anders gebruikt), sla dit over.

- [ ] **Step 3: Build site om template-syntax te verifiëren**

Run: `npm run build`
Expected: build slaagt. Op dit moment zijn er nog geen wrappers, dus geen detail-pagina's worden gegenereerd. Dit is OK — we testen alleen of `detail.njk` syntax-correct is door de include-graph.

Als er een Eleventy-error komt over de include zelf (bv. invalid Nunjucks): los op voor je verder gaat.

- [ ] **Step 4: Commit**

```bash
git add _includes/pages/services/training/detail.njk styles.css
git commit -m "$(cat <<'EOF'
voeg gedeelde training detail template toe

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: AI introductie i18n keys (NL + EN)

**Files:**
- Modify: `i18n/nl.json`
- Modify: `i18n/en.json`

- [ ] **Step 1: Voeg AI introductie NL keys toe aan `i18n/nl.json`**

Open `i18n/nl.json`. Direct na de bestaande `"footer.copyright"` regel (vóór de eerste nav.* regels), voeg deze block toe (zorg voor correcte JSON-syntax — de regel ervoor moet eindigen op een komma):

```json
  "services.training.detail.meta.duration.label": "DUUR",
  "services.training.detail.meta.participants.label": "DEELNEMERS",
  "services.training.detail.meta.location.label": "LOCATIE",
  "services.training.detail.meta.language.label": "TAAL",
  "services.training.detail.cta.button": "Plan een verkennend gesprek",
  "services.training.detail.cta.download": "Download fiche (PDF)",
  "services.training.page.detail.button": "Meer info",
  "page.training.detail.ai-introductie.title": "AI introductie — SmartAgents",
  "page.training.detail.ai-introductie.description": "1-dag praktijktraining over veilig en effectief AI-gebruik. Voor iedereen, geen voorkennis nodig.",
  "services.training.detail.ai-introductie.kicker": "PRAKTIJKTRAINING",
  "services.training.detail.ai-introductie.title": "AI introductie",
  "services.training.detail.ai-introductie.subtitle": "Voor iedereen die AI professioneel wil gebruiken. Geen voorkennis nodig. In één dag: hoe LLMs werken, hoe je AI veilig inzet, welke tools je wanneer kiest, en de 4 V's voor een sterke samenwerking met AI.",
  "services.training.detail.ai-introductie.meta.duration": "1 dag",
  "services.training.detail.ai-introductie.meta.participants": "3 — 20",
  "services.training.detail.ai-introductie.meta.location": "Bij u op kantoor",
  "services.training.detail.ai-introductie.meta.language": "NL / EN",
  "services.training.detail.ai-introductie.overview.title": "Wat je leert",
  "services.training.detail.ai-introductie.overview.text": "Zes thema's, één dag.",
  "services.training.detail.ai-introductie.themes.title": "Zes thema's",
  "services.training.detail.ai-introductie.theme1.kicker": "VEILIGHEID",
  "services.training.detail.ai-introductie.theme1.title": "Veilig met AI",
  "services.training.detail.ai-introductie.theme1.desc": "GDPR, EU AI Act en AI wereldwijd — privacy en risico's.",
  "services.training.detail.ai-introductie.theme2.kicker": "FUNDAMENTEN",
  "services.training.detail.ai-introductie.theme2.title": "AI fundamentals",
  "services.training.detail.ai-introductie.theme2.desc": "Hoe LLMs werken: tokens, training, inferentie en limitaties.",
  "services.training.detail.ai-introductie.theme3.kicker": "VERDELEN",
  "services.training.detail.ai-introductie.theme3.title": "Mens of AI?",
  "services.training.detail.ai-introductie.theme3.desc": "Automatisatie, augmentatie of agency? Per taak de juiste keuze.",
  "services.training.detail.ai-introductie.theme4.kicker": "VERWOORDEN",
  "services.training.detail.ai-introductie.theme4.title": "De juiste vraag",
  "services.training.detail.ai-introductie.theme4.desc": "Van losse prompt naar drie lagen: intent, context, vraag.",
  "services.training.detail.ai-introductie.theme5.kicker": "VERIFIËREN",
  "services.training.detail.ai-introductie.theme5.title": "Kritische blik",
  "services.training.detail.ai-introductie.theme5.desc": "Heldere criteria, geen hallucinaties — output durven afkeuren.",
  "services.training.detail.ai-introductie.theme6.kicker": "VERANTWOORDEN",
  "services.training.detail.ai-introductie.theme6.title": "Bewust inzetten",
  "services.training.detail.ai-introductie.theme6.desc": "Bewuste keuze, transparant werk, verifieerbare output.",
  "services.training.detail.ai-introductie.takeaway.title": "Wat neem je mee?",
  "services.training.detail.ai-introductie.takeaway1.title": "Helder beeld",
  "services.training.detail.ai-introductie.takeaway1.desc": "je weet wat AI is, wat het kan en niet kan.",
  "services.training.detail.ai-introductie.takeaway2.title": "AI versterkt je job",
  "services.training.detail.ai-introductie.takeaway2.desc": "je ziet waar AI je werk verbetert in plaats van vervangt.",
  "services.training.detail.ai-introductie.takeaway3.title": "Tool-keuze",
  "services.training.detail.ai-introductie.takeaway3.desc": "ChatGPT, Perplexity of NotebookLM? Je kiest bewust.",
  "services.training.detail.ai-introductie.takeaway4.title": "Veilig met AI",
  "services.training.detail.ai-introductie.takeaway4.desc": "GDPR, EU AI Act en de grenzen van AI-gebruik.",
  "services.training.detail.ai-introductie.takeaway5.title": "Eigen 4V-routine",
  "services.training.detail.ai-introductie.takeaway5.desc": "verdelen, verwoorden, verifiëren, verantwoorden — elke dag.",
  "services.training.detail.ai-introductie.day.title": "Hoe verloopt je dag?",
  "services.training.detail.ai-introductie.day1.label": "OCHTEND 1",
  "services.training.detail.ai-introductie.day1.title": "Veilig gebruik & AI-fundamenten",
  "services.training.detail.ai-introductie.day2.label": "OCHTEND 2",
  "services.training.detail.ai-introductie.day2.title": "Verdelen — mens, AI of samen",
  "services.training.detail.ai-introductie.day3.label": "NAMIDDAG 1",
  "services.training.detail.ai-introductie.day3.title": "Verwoorden — de juiste vraag",
  "services.training.detail.ai-introductie.day4.label": "NAMIDDAG 2",
  "services.training.detail.ai-introductie.day4.title": "Verifiëren & verantwoorden",
  "services.training.detail.ai-introductie.recommendation": "Aanbevolen: eigen laptop met toegang tot een AI-tool naar keuze.",
  "services.training.detail.ai-introductie.next.label": "Volgende stap",
  "services.training.detail.ai-introductie.next.text": "Microsoft 365 Copilot — van chat tot eigen agents",
  "services.training.detail.ai-introductie.next.href": "/services/training/m365-copilot/",
  "services.training.detail.ai-introductie.cta.title": "Klaar om met AI aan de slag te gaan?",
  "services.training.detail.ai-introductie.cta.text": "Plan een verkennend gesprek en we kijken samen of deze training past bij jouw team.",
```

- [ ] **Step 2: Voeg AI introductie EN keys toe aan `i18n/en.json`**

Open `i18n/en.json`. Op dezelfde plek (na `"footer.copyright"`) voeg toe:

```json
  "services.training.detail.meta.duration.label": "DURATION",
  "services.training.detail.meta.participants.label": "PARTICIPANTS",
  "services.training.detail.meta.location.label": "LOCATION",
  "services.training.detail.meta.language.label": "LANGUAGE",
  "services.training.detail.cta.button": "Schedule a discovery call",
  "services.training.detail.cta.download": "Download factsheet (PDF)",
  "services.training.page.detail.button": "More info",
  "page.training.detail.ai-introductie.title": "AI introduction — SmartAgents",
  "page.training.detail.ai-introductie.description": "1-day hands-on training on safe and effective AI use. For everyone, no prior knowledge required.",
  "services.training.detail.ai-introductie.kicker": "HANDS-ON TRAINING",
  "services.training.detail.ai-introductie.title": "AI introduction",
  "services.training.detail.ai-introductie.subtitle": "For anyone who wants to use AI professionally. No prior knowledge required. In one day: how LLMs work, how to use AI safely, which tools to choose when, and the 4 V's for strong collaboration with AI.",
  "services.training.detail.ai-introductie.meta.duration": "1 day",
  "services.training.detail.ai-introductie.meta.participants": "3 — 20",
  "services.training.detail.ai-introductie.meta.location": "At your office",
  "services.training.detail.ai-introductie.meta.language": "NL / EN",
  "services.training.detail.ai-introductie.overview.title": "What you'll learn",
  "services.training.detail.ai-introductie.overview.text": "Six themes, one day.",
  "services.training.detail.ai-introductie.themes.title": "Six themes",
  "services.training.detail.ai-introductie.theme1.kicker": "SAFETY",
  "services.training.detail.ai-introductie.theme1.title": "Using AI safely",
  "services.training.detail.ai-introductie.theme1.desc": "GDPR, EU AI Act and AI globally — privacy and risks.",
  "services.training.detail.ai-introductie.theme2.kicker": "FUNDAMENTALS",
  "services.training.detail.ai-introductie.theme2.title": "AI fundamentals",
  "services.training.detail.ai-introductie.theme2.desc": "How LLMs work: tokens, training, inference, and limitations.",
  "services.training.detail.ai-introductie.theme3.kicker": "DIVIDING",
  "services.training.detail.ai-introductie.theme3.title": "Human or AI?",
  "services.training.detail.ai-introductie.theme3.desc": "Automation, augmentation, or agency? The right choice for each task.",
  "services.training.detail.ai-introductie.theme4.kicker": "PHRASING",
  "services.training.detail.ai-introductie.theme4.title": "The right question",
  "services.training.detail.ai-introductie.theme4.desc": "From a single prompt to three layers: intent, context, question.",
  "services.training.detail.ai-introductie.theme5.kicker": "VERIFYING",
  "services.training.detail.ai-introductie.theme5.title": "A critical eye",
  "services.training.detail.ai-introductie.theme5.desc": "Clear criteria, no hallucinations — dare to reject output.",
  "services.training.detail.ai-introductie.theme6.kicker": "OWNING",
  "services.training.detail.ai-introductie.theme6.title": "Conscious use",
  "services.training.detail.ai-introductie.theme6.desc": "Conscious choice, transparent work, verifiable output.",
  "services.training.detail.ai-introductie.takeaway.title": "What you'll take with you",
  "services.training.detail.ai-introductie.takeaway1.title": "A clear picture",
  "services.training.detail.ai-introductie.takeaway1.desc": "you know what AI is, what it can and cannot do.",
  "services.training.detail.ai-introductie.takeaway2.title": "AI amplifies your job",
  "services.training.detail.ai-introductie.takeaway2.desc": "you see where AI improves your work rather than replacing it.",
  "services.training.detail.ai-introductie.takeaway3.title": "Tool choice",
  "services.training.detail.ai-introductie.takeaway3.desc": "ChatGPT, Perplexity, or NotebookLM? You choose deliberately.",
  "services.training.detail.ai-introductie.takeaway4.title": "Safe with AI",
  "services.training.detail.ai-introductie.takeaway4.desc": "GDPR, EU AI Act, and the boundaries of AI use.",
  "services.training.detail.ai-introductie.takeaway5.title": "Your own 4V routine",
  "services.training.detail.ai-introductie.takeaway5.desc": "dividing, phrasing, verifying, owning — every day.",
  "services.training.detail.ai-introductie.day.title": "How does your day look?",
  "services.training.detail.ai-introductie.day1.label": "MORNING 1",
  "services.training.detail.ai-introductie.day1.title": "Safe use & AI fundamentals",
  "services.training.detail.ai-introductie.day2.label": "MORNING 2",
  "services.training.detail.ai-introductie.day2.title": "Dividing — human, AI, or together",
  "services.training.detail.ai-introductie.day3.label": "AFTERNOON 1",
  "services.training.detail.ai-introductie.day3.title": "Phrasing — the right question",
  "services.training.detail.ai-introductie.day4.label": "AFTERNOON 2",
  "services.training.detail.ai-introductie.day4.title": "Verifying & owning",
  "services.training.detail.ai-introductie.recommendation": "Recommended: bring your own laptop with access to an AI tool of your choice.",
  "services.training.detail.ai-introductie.next.label": "Next step",
  "services.training.detail.ai-introductie.next.text": "Microsoft 365 Copilot — from chat to your own agents",
  "services.training.detail.ai-introductie.next.href": "/en/services/training/m365-copilot/",
  "services.training.detail.ai-introductie.cta.title": "Ready to get started with AI?",
  "services.training.detail.ai-introductie.cta.text": "Schedule a discovery call and we'll explore together whether this training fits your team.",
```

- [ ] **Step 3: Verifieer JSON-validiteit**

Run: `node -e "JSON.parse(require('fs').readFileSync('i18n/nl.json'))" && node -e "JSON.parse(require('fs').readFileSync('i18n/en.json'))" && echo OK`
Expected: `OK`

Als er een SyntaxError komt: ontbrekende komma's of dubbele quotes — los op tot beide bestanden valid JSON zijn.

- [ ] **Step 4: Commit**

```bash
git add i18n/nl.json i18n/en.json
git commit -m "$(cat <<'EOF'
voeg AI introductie i18n keys toe (NL+EN)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: AI introductie wrappers (NL + EN) + verificatie

**Files:**
- Create: `services/training/ai-introductie.html`
- Create: `en/services/training/ai-introductie.html`

- [ ] **Step 1: Maak NL-wrapper**

Maak `services/training/ai-introductie.html` met:

```njk
---
nlPermalink: /services/training/ai-introductie/
shellContext: services
date: git Last Modified
pageKey: training-ai-introductie
schemaType: service
serviceNameKey: services.training.detail.ai-introductie.title
courseKey: ai-introductie
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

- [ ] **Step 2: Maak EN-wrapper**

Maak directory en bestand. Run:
```bash
mkdir -p en/services/training
```

Maak `en/services/training/ai-introductie.html`:

```njk
---
nlPermalink: /services/training/ai-introductie/
shellContext: services
date: git Last Modified
pageKey: training-ai-introductie
schemaType: service
serviceNameKey: services.training.detail.ai-introductie.title
courseKey: ai-introductie
pdfFilename: SmartAgents_AI_Introductie_Onepager.pdf
socialImage: /assets/social-preview.webp
socialAlt:
  nl: SmartAgents – AI-gedreven bedrijfsautomatisatie
  en: SmartAgents – AI-driven business automation
permalink: /en/services/training/ai-introductie/
---
{% include "pages/services/training/detail.njk" %}
```

- [ ] **Step 3: Build site**

Run: `npm run build`
Expected: build slaagt. Verifieer dat de twee output-bestanden bestaan:

Run: `ls dist/services/training/ai-introductie/index.html dist/en/services/training/ai-introductie/index.html`
Expected: beide bestanden bestaan.

- [ ] **Step 4: Verifieer rendered content**

Run:
```bash
grep -c "AI introductie\|AI introduction" dist/services/training/ai-introductie/index.html
grep -c "AI introduction" dist/en/services/training/ai-introductie/index.html
grep "VEILIGHEID\|SAFETY" dist/services/training/ai-introductie/index.html dist/en/services/training/ai-introductie/index.html
```
Expected: NL bevat "AI introductie" + "VEILIGHEID", EN bevat "AI introduction" + "SAFETY".

- [ ] **Step 5: Visuele inspectie via lokale preview**

Bezoek (manueel of via curl):
- http://127.0.0.1:8000/services/training/ai-introductie/
- http://127.0.0.1:8000/en/services/training/ai-introductie/

Verifieer visueel:
- Hero met kicker, titel, subtitle, 4 metadata-pillen
- Overzicht-sectie
- 6 thema-cards in grid
- 5 takeaway-cards met checkmark
- 4 dag-blokken
- Aanbeveling + volgende stap (met link naar M365 Copilot — werkt nog niet maar tekst zichtbaar)
- CTA met twee knoppen (Plan + Download)
- Header en footer correct

Als layout afwijkt: noteer issues, los op (meestal CSS-class typo of i18n-key typo).

- [ ] **Step 6: Commit**

```bash
git add services/training/ai-introductie.html en/services/training/ai-introductie.html
git commit -m "$(cat <<'EOF'
voeg AI introductie detail pagina toe (NL+EN)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: M365 Copilot i18n keys + wrappers + verificatie

**Files:**
- Modify: `i18n/nl.json`, `i18n/en.json`
- Create: `services/training/m365-copilot.html`
- Create: `en/services/training/m365-copilot.html`

- [ ] **Step 1: Voeg M365 Copilot NL keys toe aan `i18n/nl.json`**

Open `i18n/nl.json`, voeg na de bestaande `services.training.detail.ai-introductie.cta.text` regel toe:

```json
  "page.training.detail.m365-copilot.title": "Microsoft 365 Copilot training — SmartAgents",
  "page.training.detail.m365-copilot.description": "1-dag praktijktraining over alle Copilot-capaciteiten in M365. Voor teams die Copilot effectief willen inzetten.",
  "services.training.detail.m365-copilot.kicker": "PRAKTIJKTRAINING",
  "services.training.detail.m365-copilot.title": "Microsoft 365 Copilot",
  "services.training.detail.m365-copilot.subtitle": "Voor iedereen die Copilot professioneel wil gebruiken. Geen voorkennis nodig. Alle Copilot-capaciteiten in één dag, live in een complete M365-omgeving. Je team weet daarna exact waar Copilot het verschil maakt.",
  "services.training.detail.m365-copilot.meta.duration": "1 dag",
  "services.training.detail.m365-copilot.meta.participants": "3 — 20",
  "services.training.detail.m365-copilot.meta.location": "Bij u op kantoor",
  "services.training.detail.m365-copilot.meta.language": "NL / EN",
  "services.training.detail.m365-copilot.overview.title": "Wat je leert",
  "services.training.detail.m365-copilot.overview.text": "De inhoud in zes thema's.",
  "services.training.detail.m365-copilot.themes.title": "Zes thema's",
  "services.training.detail.m365-copilot.theme1.kicker": "AANPAK",
  "services.training.detail.m365-copilot.theme1.title": "Live demo's",
  "services.training.detail.m365-copilot.theme1.desc": "Slides waar nodig, demo's waar het kan — alles direct nabouwbaar.",
  "services.training.detail.m365-copilot.theme2.kicker": "CHAT",
  "services.training.detail.m365-copilot.theme2.title": "Copilot Chat",
  "services.training.detail.m365-copilot.theme2.desc": "Eén venster voor mail, Teams, OneDrive en kalender — alles in één vraag.",
  "services.training.detail.m365-copilot.theme3.kicker": "APPS",
  "services.training.detail.m365-copilot.theme3.title": "Copilot in elke app",
  "services.training.detail.m365-copilot.theme3.desc": "Outlook, Excel, PowerPoint, Word en Teams — Copilot werkt vanuit elke app mee.",
  "services.training.detail.m365-copilot.theme4.kicker": "AGENTS",
  "services.training.detail.m365-copilot.theme4.title": "Ingebouwde specialisten",
  "services.training.detail.m365-copilot.theme4.desc": "Zet Researcher, Analyst en Workflows aan het werk.",
  "services.training.detail.m365-copilot.theme5.kicker": "BOUWEN",
  "services.training.detail.m365-copilot.theme5.title": "Je eigen agent",
  "services.training.detail.m365-copilot.theme5.desc": "In Copilot Studio bouw je in minuten een agent met je eigen documenten.",
  "services.training.detail.m365-copilot.theme6.kicker": "COWORK",
  "services.training.detail.m365-copilot.theme6.title": "Skills op autopilot",
  "services.training.detail.m365-copilot.theme6.desc": "Cowork-skills nemen routinewerk over — Word, PowerPoint en Teams in één flow.",
  "services.training.detail.m365-copilot.takeaway.title": "Wat neem je mee?",
  "services.training.detail.m365-copilot.takeaway1.title": "Helder overzicht",
  "services.training.detail.m365-copilot.takeaway1.desc": "wanneer chat, wanneer in-app, wanneer een agent.",
  "services.training.detail.m365-copilot.takeaway2.title": "Doorzoekbare werkruimte",
  "services.training.detail.m365-copilot.takeaway2.desc": "mail, Teams, OneDrive en kalender in één vraag.",
  "services.training.detail.m365-copilot.takeaway3.title": "Tijdwinst per app",
  "services.training.detail.m365-copilot.takeaway3.desc": "direct in Outlook, Excel, PowerPoint en Word.",
  "services.training.detail.m365-copilot.takeaway4.title": "Ingebouwde AI-specialisten",
  "services.training.detail.m365-copilot.takeaway4.desc": "zoals Researcher, Analyst en Workflows aan het werk.",
  "services.training.detail.m365-copilot.takeaway5.title": "Je eigen agent",
  "services.training.detail.m365-copilot.takeaway5.desc": "werkend, gebouwd in Copilot Studio.",
  "services.training.detail.m365-copilot.day.title": "Hoe verloopt je dag?",
  "services.training.detail.m365-copilot.day1.label": "OCHTEND 1",
  "services.training.detail.m365-copilot.day1.title": "Chat & verbonden bronnen",
  "services.training.detail.m365-copilot.day2.label": "OCHTEND 2",
  "services.training.detail.m365-copilot.day2.title": "Copilot in elke app",
  "services.training.detail.m365-copilot.day3.label": "NAMIDDAG 1",
  "services.training.detail.m365-copilot.day3.title": "Standaard agents inzetten",
  "services.training.detail.m365-copilot.day4.label": "NAMIDDAG 2",
  "services.training.detail.m365-copilot.day4.title": "Eigen agent + Cowork",
  "services.training.detail.m365-copilot.recommendation": "Aanbevolen: M365 Copilot-licentie per deelnemer voor maximaal effect.",
  "services.training.detail.m365-copilot.next.label": "Volgende stap",
  "services.training.detail.m365-copilot.next.text": "Deep Dive: Context engineering & AI-tools meesterschap",
  "services.training.detail.m365-copilot.next.href": "",
  "services.training.detail.m365-copilot.cta.title": "Klaar om met Copilot aan de slag te gaan?",
  "services.training.detail.m365-copilot.cta.text": "Plan een verkennend gesprek en we bekijken hoe Copilot past in jouw M365-omgeving.",
```

- [ ] **Step 2: Voeg M365 Copilot EN keys toe aan `i18n/en.json`**

Open `i18n/en.json`, voeg op dezelfde plek toe:

```json
  "page.training.detail.m365-copilot.title": "Microsoft 365 Copilot training — SmartAgents",
  "page.training.detail.m365-copilot.description": "1-day hands-on training on all Copilot capabilities in M365. For teams who want to use Copilot effectively.",
  "services.training.detail.m365-copilot.kicker": "HANDS-ON TRAINING",
  "services.training.detail.m365-copilot.title": "Microsoft 365 Copilot",
  "services.training.detail.m365-copilot.subtitle": "For anyone who wants to use Copilot professionally. No prior knowledge required. All Copilot capabilities in one day, live in a complete M365 environment. Your team will know exactly where Copilot makes the difference.",
  "services.training.detail.m365-copilot.meta.duration": "1 day",
  "services.training.detail.m365-copilot.meta.participants": "3 — 20",
  "services.training.detail.m365-copilot.meta.location": "At your office",
  "services.training.detail.m365-copilot.meta.language": "NL / EN",
  "services.training.detail.m365-copilot.overview.title": "What you'll learn",
  "services.training.detail.m365-copilot.overview.text": "The content in six themes.",
  "services.training.detail.m365-copilot.themes.title": "Six themes",
  "services.training.detail.m365-copilot.theme1.kicker": "APPROACH",
  "services.training.detail.m365-copilot.theme1.title": "Live demos",
  "services.training.detail.m365-copilot.theme1.desc": "Slides where needed, demos where possible — everything immediately reproducible.",
  "services.training.detail.m365-copilot.theme2.kicker": "CHAT",
  "services.training.detail.m365-copilot.theme2.title": "Copilot Chat",
  "services.training.detail.m365-copilot.theme2.desc": "One window for mail, Teams, OneDrive, and calendar — everything in one query.",
  "services.training.detail.m365-copilot.theme3.kicker": "APPS",
  "services.training.detail.m365-copilot.theme3.title": "Copilot in every app",
  "services.training.detail.m365-copilot.theme3.desc": "Outlook, Excel, PowerPoint, Word, and Teams — Copilot works alongside you in every app.",
  "services.training.detail.m365-copilot.theme4.kicker": "AGENTS",
  "services.training.detail.m365-copilot.theme4.title": "Built-in specialists",
  "services.training.detail.m365-copilot.theme4.desc": "Put Researcher, Analyst, and Workflows to work.",
  "services.training.detail.m365-copilot.theme5.kicker": "BUILDING",
  "services.training.detail.m365-copilot.theme5.title": "Your own agent",
  "services.training.detail.m365-copilot.theme5.desc": "In Copilot Studio you build an agent with your own documents in minutes.",
  "services.training.detail.m365-copilot.theme6.kicker": "COWORK",
  "services.training.detail.m365-copilot.theme6.title": "Skills on autopilot",
  "services.training.detail.m365-copilot.theme6.desc": "Cowork skills take over routine work — Word, PowerPoint, and Teams in one flow.",
  "services.training.detail.m365-copilot.takeaway.title": "What you'll take with you",
  "services.training.detail.m365-copilot.takeaway1.title": "Clear overview",
  "services.training.detail.m365-copilot.takeaway1.desc": "when to use chat, when in-app, when an agent.",
  "services.training.detail.m365-copilot.takeaway2.title": "Searchable workspace",
  "services.training.detail.m365-copilot.takeaway2.desc": "mail, Teams, OneDrive, and calendar in one query.",
  "services.training.detail.m365-copilot.takeaway3.title": "Time savings per app",
  "services.training.detail.m365-copilot.takeaway3.desc": "directly in Outlook, Excel, PowerPoint, and Word.",
  "services.training.detail.m365-copilot.takeaway4.title": "Built-in AI specialists",
  "services.training.detail.m365-copilot.takeaway4.desc": "like Researcher, Analyst, and Workflows at work.",
  "services.training.detail.m365-copilot.takeaway5.title": "Your own agent",
  "services.training.detail.m365-copilot.takeaway5.desc": "working, built in Copilot Studio.",
  "services.training.detail.m365-copilot.day.title": "How does your day look?",
  "services.training.detail.m365-copilot.day1.label": "MORNING 1",
  "services.training.detail.m365-copilot.day1.title": "Chat & connected sources",
  "services.training.detail.m365-copilot.day2.label": "MORNING 2",
  "services.training.detail.m365-copilot.day2.title": "Copilot in every app",
  "services.training.detail.m365-copilot.day3.label": "AFTERNOON 1",
  "services.training.detail.m365-copilot.day3.title": "Deploying standard agents",
  "services.training.detail.m365-copilot.day4.label": "AFTERNOON 2",
  "services.training.detail.m365-copilot.day4.title": "Your own agent + Cowork",
  "services.training.detail.m365-copilot.recommendation": "Recommended: M365 Copilot license per participant for maximum effect.",
  "services.training.detail.m365-copilot.next.label": "Next step",
  "services.training.detail.m365-copilot.next.text": "Deep Dive: Context engineering & AI tools mastery",
  "services.training.detail.m365-copilot.next.href": "",
  "services.training.detail.m365-copilot.cta.title": "Ready to get started with Copilot?",
  "services.training.detail.m365-copilot.cta.text": "Schedule a discovery call and we'll explore how Copilot fits in your M365 environment.",
```

- [ ] **Step 3: Maak NL-wrapper `services/training/m365-copilot.html`**

```njk
---
nlPermalink: /services/training/m365-copilot/
shellContext: services
date: git Last Modified
pageKey: training-m365-copilot
schemaType: service
serviceNameKey: services.training.detail.m365-copilot.title
courseKey: m365-copilot
pdfFilename: SmartAgents_M365_Copilot_Onepager.pdf
socialImage: /assets/social-preview.webp
socialAlt:
  nl: SmartAgents – AI-gedreven bedrijfsautomatisatie
  en: SmartAgents – AI-driven business automation
locale: nl
permalink: /services/training/m365-copilot/
---
{% include "pages/services/training/detail.njk" %}
```

- [ ] **Step 4: Maak EN-wrapper `en/services/training/m365-copilot.html`**

```njk
---
nlPermalink: /services/training/m365-copilot/
shellContext: services
date: git Last Modified
pageKey: training-m365-copilot
schemaType: service
serviceNameKey: services.training.detail.m365-copilot.title
courseKey: m365-copilot
pdfFilename: SmartAgents_M365_Copilot_Onepager.pdf
socialImage: /assets/social-preview.webp
socialAlt:
  nl: SmartAgents – AI-gedreven bedrijfsautomatisatie
  en: SmartAgents – AI-driven business automation
permalink: /en/services/training/m365-copilot/
---
{% include "pages/services/training/detail.njk" %}
```

- [ ] **Step 5: JSON-validatie + build + verificatie**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('i18n/nl.json'))" && node -e "JSON.parse(require('fs').readFileSync('i18n/en.json'))" && echo OK_JSON
npm run build
ls dist/services/training/m365-copilot/index.html dist/en/services/training/m365-copilot/index.html
grep -c "Microsoft 365 Copilot" dist/services/training/m365-copilot/index.html
grep -c "Microsoft 365 Copilot" dist/en/services/training/m365-copilot/index.html
```
Expected: alle bestanden bestaan, "Microsoft 365 Copilot" verschijnt in beide.

Visuele check via http://127.0.0.1:8000/services/training/m365-copilot/ en /en/ variant.

- [ ] **Step 6: Commit**

```bash
git add i18n/nl.json i18n/en.json services/training/m365-copilot.html en/services/training/m365-copilot.html
git commit -m "$(cat <<'EOF'
voeg M365 Copilot detail pagina toe (NL+EN)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: C-Level i18n keys + wrappers + verificatie

**Files:**
- Modify: `i18n/nl.json`, `i18n/en.json`
- Create: `services/training/c-level.html`
- Create: `en/services/training/c-level.html`

C-Level gebruikt formele "u"-vorm in NL.

- [ ] **Step 1: Voeg C-Level NL keys toe aan `i18n/nl.json`**

Voeg na M365 Copilot keys toe:

```json
  "page.training.detail.c-level.title": "AI als Strategisch Wapen — C-Level — SmartAgents",
  "page.training.detail.c-level.description": "Halve dag executive programme voor C-suite. Strategische realiteit, vijf beslissingen, en uw 90-dagen routekaart.",
  "services.training.detail.c-level.kicker": "C-LEVEL EXECUTIVE PROGRAMME",
  "services.training.detail.c-level.title": "AI als Strategisch Wapen",
  "services.training.detail.c-level.subtitle": "Voor C-suite en directieleden — zoals CEO's, COO's, CFO's en algemeen directeurs. Geen technische voorkennis nodig. Een halve dag waarin u de strategische realiteit, de keuzes en uw 90-dagen routekaart helder krijgt — klaar om uw organisatie te leiden in plaats van te ondergaan.",
  "services.training.detail.c-level.meta.duration": "½ dag · 4 uur",
  "services.training.detail.c-level.meta.participants": "Max 8",
  "services.training.detail.c-level.meta.location": "Onsite of Online",
  "services.training.detail.c-level.meta.language": "NL / EN",
  "services.training.detail.c-level.overview.title": "Wat u meeneemt",
  "services.training.detail.c-level.overview.text": "Zes strategische thema's.",
  "services.training.detail.c-level.themes.title": "Zes strategische thema's",
  "services.training.detail.c-level.theme1.kicker": "REALITEIT",
  "services.training.detail.c-level.theme1.title": "De cijfers achter de hype",
  "services.training.detail.c-level.theme1.desc": "Wat AI vandaag echt verandert in elke sector.",
  "services.training.detail.c-level.theme2.kicker": "RIJPHEID",
  "services.training.detail.c-level.theme2.title": "Waar staat u nu?",
  "services.training.detail.c-level.theme2.desc": "Eerlijke zelfevaluatie van uw AI-volwassenheid.",
  "services.training.detail.c-level.theme3.kicker": "KEUZES",
  "services.training.detail.c-level.theme3.title": "Vijf CEO-beslissingen",
  "services.training.detail.c-level.theme3.desc": "Build of buy, snelheid, data, governance, KPI's.",
  "services.training.detail.c-level.theme4.kicker": "TALENT",
  "services.training.detail.c-level.theme4.title": "Capaciteit op de juiste manier",
  "services.training.detail.c-level.theme4.desc": "Welke rollen, welke skills, welk leiderschap.",
  "services.training.detail.c-level.theme5.kicker": "RISICO",
  "services.training.detail.c-level.theme5.title": "Governance & EU AI Act",
  "services.training.detail.c-level.theme5.desc": "Compliance, data en verantwoord AI-gebruik.",
  "services.training.detail.c-level.theme6.kicker": "ACTIE",
  "services.training.detail.c-level.theme6.title": "Uw 90-dagen routekaart",
  "services.training.detail.c-level.theme6.desc": "Concreet plan dat u meeneemt naar uw bestuur.",
  "services.training.detail.c-level.takeaway.title": "Wat neemt u mee?",
  "services.training.detail.c-level.takeaway1.title": "Helder strategisch beeld",
  "services.training.detail.c-level.takeaway1.desc": "u weet waar AI uw sector raakt.",
  "services.training.detail.c-level.takeaway2.title": "Eigen rijpheidsscore",
  "services.training.detail.c-level.takeaway2.desc": "verkenner, adopter, integrator of leider.",
  "services.training.detail.c-level.takeaway3.title": "Vijf beslissingen helder",
  "services.training.detail.c-level.takeaway3.desc": "build of buy, snelheid, data, KPI's, governance.",
  "services.training.detail.c-level.takeaway4.title": "Persoonlijke 90-dagen routekaart",
  "services.training.detail.c-level.takeaway4.desc": "diagnose, lancering, schaal.",
  "services.training.detail.c-level.takeaway5.title": "Gedeelde directietaal",
  "services.training.detail.c-level.takeaway5.desc": "uw team beslist met dezelfde begrippen.",
  "services.training.detail.c-level.day.title": "Hoe verloopt uw halve dag?",
  "services.training.detail.c-level.day1.label": "BLOK 1 · 09:00",
  "services.training.detail.c-level.day1.title": "Realiteit & rijpheid",
  "services.training.detail.c-level.day2.label": "BLOK 2 · 10:00",
  "services.training.detail.c-level.day2.title": "Vijf strategische keuzes",
  "services.training.detail.c-level.day3.label": "BLOK 3 · 11:15",
  "services.training.detail.c-level.day3.title": "Talent, governance & risico",
  "services.training.detail.c-level.day4.label": "BLOK 4 · 12:15",
  "services.training.detail.c-level.day4.title": "Uw 90-dagen routekaart",
  "services.training.detail.c-level.recommendation": "Aanbevolen: breng een eigen strategische uitdaging mee — zo werkt u tijdens de sessie aan uw eigen casus.",
  "services.training.detail.c-level.next.label": "Verdieping voor uw team",
  "services.training.detail.c-level.next.text": "Deep Dive: Context engineering & AI-tools meesterschap",
  "services.training.detail.c-level.next.href": "",
  "services.training.detail.c-level.cta.title": "Klaar om AI strategisch in te zetten?",
  "services.training.detail.c-level.cta.text": "Plan een verkennend gesprek over uw strategische context.",
```

- [ ] **Step 2: Voeg C-Level EN keys toe aan `i18n/en.json`**

```json
  "page.training.detail.c-level.title": "AI as a Strategic Weapon — C-Level — SmartAgents",
  "page.training.detail.c-level.description": "Half-day executive programme for C-suite. Strategic reality, five decisions, and your 90-day roadmap.",
  "services.training.detail.c-level.kicker": "C-LEVEL EXECUTIVE PROGRAMME",
  "services.training.detail.c-level.title": "AI as a Strategic Weapon",
  "services.training.detail.c-level.subtitle": "For C-suite and board members — including CEOs, COOs, CFOs, and managing directors. No technical background required. A half-day in which you gain clarity on the strategic reality, the decisions, and your 90-day roadmap — ready to lead your organisation rather than be led by AI.",
  "services.training.detail.c-level.meta.duration": "½ day · 4 hours",
  "services.training.detail.c-level.meta.participants": "Max 8",
  "services.training.detail.c-level.meta.location": "Onsite or Online",
  "services.training.detail.c-level.meta.language": "NL / EN",
  "services.training.detail.c-level.overview.title": "What you'll take away",
  "services.training.detail.c-level.overview.text": "Six strategic themes.",
  "services.training.detail.c-level.themes.title": "Six strategic themes",
  "services.training.detail.c-level.theme1.kicker": "REALITY",
  "services.training.detail.c-level.theme1.title": "The numbers behind the hype",
  "services.training.detail.c-level.theme1.desc": "What AI is actually changing today in every sector.",
  "services.training.detail.c-level.theme2.kicker": "MATURITY",
  "services.training.detail.c-level.theme2.title": "Where do you stand?",
  "services.training.detail.c-level.theme2.desc": "Honest self-assessment of your AI maturity.",
  "services.training.detail.c-level.theme3.kicker": "CHOICES",
  "services.training.detail.c-level.theme3.title": "Five CEO decisions",
  "services.training.detail.c-level.theme3.desc": "Build or buy, speed, data, governance, KPIs.",
  "services.training.detail.c-level.theme4.kicker": "TALENT",
  "services.training.detail.c-level.theme4.title": "Capacity, the right way",
  "services.training.detail.c-level.theme4.desc": "Which roles, which skills, which leadership.",
  "services.training.detail.c-level.theme5.kicker": "RISK",
  "services.training.detail.c-level.theme5.title": "Governance & EU AI Act",
  "services.training.detail.c-level.theme5.desc": "Compliance, data, and responsible AI use.",
  "services.training.detail.c-level.theme6.kicker": "ACTION",
  "services.training.detail.c-level.theme6.title": "Your 90-day roadmap",
  "services.training.detail.c-level.theme6.desc": "Concrete plan you bring back to your board.",
  "services.training.detail.c-level.takeaway.title": "What you'll take away",
  "services.training.detail.c-level.takeaway1.title": "Clear strategic picture",
  "services.training.detail.c-level.takeaway1.desc": "you know where AI impacts your sector.",
  "services.training.detail.c-level.takeaway2.title": "Your own maturity score",
  "services.training.detail.c-level.takeaway2.desc": "explorer, adopter, integrator, or leader.",
  "services.training.detail.c-level.takeaway3.title": "Five decisions clarified",
  "services.training.detail.c-level.takeaway3.desc": "build or buy, speed, data, KPIs, governance.",
  "services.training.detail.c-level.takeaway4.title": "Personal 90-day roadmap",
  "services.training.detail.c-level.takeaway4.desc": "diagnosis, launch, scale.",
  "services.training.detail.c-level.takeaway5.title": "Shared executive vocabulary",
  "services.training.detail.c-level.takeaway5.desc": "your team decides using the same concepts.",
  "services.training.detail.c-level.day.title": "How does your half-day look?",
  "services.training.detail.c-level.day1.label": "BLOCK 1 · 09:00",
  "services.training.detail.c-level.day1.title": "Reality & maturity",
  "services.training.detail.c-level.day2.label": "BLOCK 2 · 10:00",
  "services.training.detail.c-level.day2.title": "Five strategic choices",
  "services.training.detail.c-level.day3.label": "BLOCK 3 · 11:15",
  "services.training.detail.c-level.day3.title": "Talent, governance & risk",
  "services.training.detail.c-level.day4.label": "BLOCK 4 · 12:15",
  "services.training.detail.c-level.day4.title": "Your 90-day roadmap",
  "services.training.detail.c-level.recommendation": "Recommended: bring your own strategic challenge — this way you work on your own case during the session.",
  "services.training.detail.c-level.next.label": "Deeper dive for your team",
  "services.training.detail.c-level.next.text": "Deep Dive: Context engineering & AI tools mastery",
  "services.training.detail.c-level.next.href": "",
  "services.training.detail.c-level.cta.title": "Ready to deploy AI strategically?",
  "services.training.detail.c-level.cta.text": "Schedule a discovery call about your strategic context.",
```

- [ ] **Step 3: Maak NL-wrapper `services/training/c-level.html`**

```njk
---
nlPermalink: /services/training/c-level/
shellContext: services
date: git Last Modified
pageKey: training-c-level
schemaType: service
serviceNameKey: services.training.detail.c-level.title
courseKey: c-level
pdfFilename: SmartAgents_AI_als_Strategisch_Wapen_C-Level_Onepager.pdf
socialImage: /assets/social-preview.webp
socialAlt:
  nl: SmartAgents – AI-gedreven bedrijfsautomatisatie
  en: SmartAgents – AI-driven business automation
locale: nl
permalink: /services/training/c-level/
---
{% include "pages/services/training/detail.njk" %}
```

- [ ] **Step 4: Maak EN-wrapper `en/services/training/c-level.html`**

```njk
---
nlPermalink: /services/training/c-level/
shellContext: services
date: git Last Modified
pageKey: training-c-level
schemaType: service
serviceNameKey: services.training.detail.c-level.title
courseKey: c-level
pdfFilename: SmartAgents_AI_als_Strategisch_Wapen_C-Level_Onepager.pdf
socialImage: /assets/social-preview.webp
socialAlt:
  nl: SmartAgents – AI-gedreven bedrijfsautomatisatie
  en: SmartAgents – AI-driven business automation
permalink: /en/services/training/c-level/
---
{% include "pages/services/training/detail.njk" %}
```

- [ ] **Step 5: JSON-validatie + build + verificatie**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('i18n/nl.json'))" && node -e "JSON.parse(require('fs').readFileSync('i18n/en.json'))" && echo OK_JSON
npm run build
ls dist/services/training/c-level/index.html dist/en/services/training/c-level/index.html
grep -c "Strategisch Wapen\|Strategic Weapon" dist/services/training/c-level/index.html dist/en/services/training/c-level/index.html
```
Expected: alle bestanden bestaan, "Strategisch Wapen" in NL, "Strategic Weapon" in EN.

Visuele check via http://127.0.0.1:8000/services/training/c-level/ en /en/ variant.

- [ ] **Step 6: Commit**

```bash
git add i18n/nl.json i18n/en.json services/training/c-level.html en/services/training/c-level.html
git commit -m "$(cat <<'EOF'
voeg C-Level detail pagina toe (NL+EN)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: "Meer info"-knoppen op overzichtspagina

**Files:**
- Modify: `_includes/pages/services/training.njk`

Voeg "Meer info"-knop toe **links** van bestaande "Download fiche"-knop op alle 3 cursus-kaarten, zowel desktop-boom als mobiele path-chooser.

- [ ] **Step 1: Mobiele kaart — AI introductie (Course 1)**

Open `_includes/pages/services/training.njk`. Zoek de bestaande course1-mobiele kaart (bevat `/assets/SmartAgents_AI_Introductie_Onepager.pdf` met klasse `tmc-card--cyan`). Vervang het bestaande `<a href="/assets/SmartAgents_AI_Introductie_Onepager.pdf"...>` blok met:

```njk
                                    <a href="/services/training/ai-introductie/" class="training-onepager-btn training-onepager-btn--filled-cyan">
                                        {{ "services.training.page.detail.button" | t(locale) }}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                    </a>
                                    <a href="/assets/SmartAgents_AI_Introductie_Onepager.pdf" target="_blank" rel="noopener noreferrer" class="training-onepager-btn training-onepager-btn--cyan">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        {{ "services.training.page.onepager.download" | t(locale) }}
                                    </a>
```

NB: de "Meer info"-knop moet linkable zijn naar zowel NL als EN — gebruik `locale_url`-filter voor cross-locale linkability:

Vervang `href="/services/training/ai-introductie/"` door `href="{{ "/services/training/ai-introductie/" | locale_url }}"` zodat EN-pagina linkt naar `/en/services/training/ai-introductie/`.

Definitieve mobiele AI introductie-vervanging (met locale_url):

```njk
                                    <a href="{{ "/services/training/ai-introductie/" | locale_url }}" class="training-onepager-btn training-onepager-btn--filled-cyan">
                                        {{ "services.training.page.detail.button" | t(locale) }}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                    </a>
                                    <a href="/assets/SmartAgents_AI_Introductie_Onepager.pdf" target="_blank" rel="noopener noreferrer" class="training-onepager-btn training-onepager-btn--cyan">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        {{ "services.training.page.onepager.download" | t(locale) }}
                                    </a>
```

- [ ] **Step 2: Mobiele kaart — M365 Copilot (Course 2)**

Zoek het course2-mobiele blok (bevat `/assets/SmartAgents_M365_Copilot_Onepager.pdf`). Vervang het bestaande download-anchor blok met:

```njk
                                    <a href="{{ "/services/training/m365-copilot/" | locale_url }}" class="training-onepager-btn training-onepager-btn--filled-cyan">
                                        {{ "services.training.page.detail.button" | t(locale) }}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                    </a>
                                    <a href="/assets/SmartAgents_M365_Copilot_Onepager.pdf" target="_blank" rel="noopener noreferrer" class="training-onepager-btn training-onepager-btn--cyan">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        {{ "services.training.page.onepager.download" | t(locale) }}
                                    </a>
```

- [ ] **Step 3: Mobiele kaart — C-Level (Management)**

Zoek het management-mobiele blok (bevat `/assets/SmartAgents_AI_als_Strategisch_Wapen_C-Level_Onepager.pdf` met `tmc-card--management`). Vervang het bestaande download-anchor blok met (let op: filled-management voor purple):

```njk
                                    <a href="{{ "/services/training/c-level/" | locale_url }}" class="training-onepager-btn training-onepager-btn--filled-management">
                                        {{ "services.training.page.detail.button" | t(locale) }}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                    </a>
                                    <a href="/assets/SmartAgents_AI_als_Strategisch_Wapen_C-Level_Onepager.pdf" target="_blank" rel="noopener noreferrer" class="training-onepager-btn training-onepager-btn--management">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        {{ "services.training.page.onepager.download" | t(locale) }}
                                    </a>
```

- [ ] **Step 4: Desktop-boom kaart — AI introductie (Course 1)**

Zoek het course1-desktop blok in `training-trunk-section` (bevat `<a href="/assets/SmartAgents_AI_Introductie_Onepager.pdf"` binnen `<div class="training-node-meta">`). Vervang het bestaande download-anchor blok met:

```njk
                            <a href="{{ "/services/training/ai-introductie/" | locale_url }}" class="training-onepager-btn training-onepager-btn--filled-cyan">
                                {{ "services.training.page.detail.button" | t(locale) }}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            </a>
                            <a href="/assets/SmartAgents_AI_Introductie_Onepager.pdf" target="_blank" rel="noopener noreferrer" class="training-onepager-btn training-onepager-btn--cyan">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                {{ "services.training.page.onepager.download" | t(locale) }}
                            </a>
```

- [ ] **Step 5: Desktop-boom kaart — M365 Copilot (Course 2)**

Zoek het course2-desktop blok (bevat `/assets/SmartAgents_M365_Copilot_Onepager.pdf` binnen `training-node-meta`). Vervang met:

```njk
                            <a href="{{ "/services/training/m365-copilot/" | locale_url }}" class="training-onepager-btn training-onepager-btn--filled-cyan">
                                {{ "services.training.page.detail.button" | t(locale) }}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            </a>
                            <a href="/assets/SmartAgents_M365_Copilot_Onepager.pdf" target="_blank" rel="noopener noreferrer" class="training-onepager-btn training-onepager-btn--cyan">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                {{ "services.training.page.onepager.download" | t(locale) }}
                            </a>
```

- [ ] **Step 6: Desktop-boom kaart — C-Level (Management branch)**

Zoek het management-desktop blok (`training-node--management`, bevat `/assets/SmartAgents_AI_als_Strategisch_Wapen_C-Level_Onepager.pdf` binnen `training-node-meta`). Vervang met (purple):

```njk
                                <a href="{{ "/services/training/c-level/" | locale_url }}" class="training-onepager-btn training-onepager-btn--filled-management">
                                    {{ "services.training.page.detail.button" | t(locale) }}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </a>
                                <a href="/assets/SmartAgents_AI_als_Strategisch_Wapen_C-Level_Onepager.pdf" target="_blank" rel="noopener noreferrer" class="training-onepager-btn training-onepager-btn--management">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    {{ "services.training.page.onepager.download" | t(locale) }}
                                </a>
```

- [ ] **Step 7: Build + verificatie**

Run:
```bash
npm run build
grep -c "Meer info\|More info" dist/services/training/index.html
grep -c "Meer info\|More info" dist/en/services/training/index.html
```
Expected: minstens 6 hits per pagina (3 cursussen × 2 layouts: desktop + mobile).

Run:
```bash
grep -c "/services/training/ai-introductie/" dist/services/training/index.html
grep -c "/en/services/training/ai-introductie/" dist/en/services/training/index.html
```
Expected: ≥2 in NL (mobiel + desktop), ≥2 in EN.

Visuele check via http://127.0.0.1:8000/services/training/ — beide knoppen zichtbaar naast elkaar (Meer info links gevuld cyan, Download fiche rechts outline cyan). Voor C-Level: gevuld purple + outline purple.

- [ ] **Step 8: Commit**

```bash
git add _includes/pages/services/training.njk
git commit -m "$(cat <<'EOF'
voeg Meer info knop toe naast Download fiche op training kaarten

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Eindverificatie

**Files:** geen wijzigingen, alleen verificatie

- [ ] **Step 1: Volledige rebuild en check op build-warnings**

Run: `npm run build 2>&1 | tail -10`
Expected: succesvolle build, geen errors of waarschuwingen over missende keys/templates.

- [ ] **Step 2: Verifieer alle 6 pagina's bestaan en zijn niet leeg**

Run:
```bash
for p in services/training/ai-introductie services/training/m365-copilot services/training/c-level en/services/training/ai-introductie en/services/training/m365-copilot en/services/training/c-level; do
  echo "$p: $(wc -c < dist/$p/index.html) bytes"
done
```
Expected: elke pagina ≥ 15000 bytes (alle secties gerenderd).

- [ ] **Step 3: Verifieer hreflang-links over en weer**

Run:
```bash
grep "alternate.*hreflang" dist/services/training/ai-introductie/index.html
grep "alternate.*hreflang" dist/en/services/training/ai-introductie/index.html
```
Expected: NL-pagina linkt naar `/en/services/training/ai-introductie/`, EN-pagina linkt naar `/services/training/ai-introductie/`.

- [ ] **Step 4: Visuele round-trip via lokale preview**

Bezoek met de browser:
- http://127.0.0.1:8000/services/training/ — klik op "Meer info" bij elke van de 3 cursussen, controleer dat juiste detailpagina opent
- Controleer EN-variant: http://127.0.0.1:8000/en/services/training/
- Op elke detailpagina: klik op "Plan een verkennend gesprek" en "Download fiche (PDF)" — beide moeten werken
- Controleer dat layout op mobiele viewport (DevTools, 375px breed) goed oogt — 4 metadata-pillen wrappen correct, 6 thema-cards stapelen, 2 knoppen in CTA wrappen

Eventuele visuele issues: noteer en fix.

- [ ] **Step 5: Final commit als er nog wijzigingen zijn**

Run: `git status`

Als alles al gecommit is: geen actie nodig. Als kleine fixes uit visuele check: commit ze nu.

```bash
git add -A
git status  # bevestig wat erin gaat
git commit -m "$(cat <<'EOF'
fixes uit visuele verificatie training detail pagina's

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

(Sla over als geen wijzigingen.)

---

## Self-Review Checklist (uitgevoerd voor commit)

**Spec coverage:**
- ✅ Drie detailpagina's (AI introductie, M365 Copilot, C-Level): tasks 4, 5, 6
- ✅ NL + EN beide: alle wrapper-tasks bevatten beide
- ✅ "Meer info"-knop links naast "Download fiche": task 7
- ✅ Gevuld cyan / gevuld purple knop-stijl: task 1 CSS
- ✅ Bestaande site-componenten: detail.njk gebruikt page-hero/page-section/page-role-grid/page-benefits-grid/approach-step/page-cta
- ✅ Hero met kicker + 4 metadata-pillen: task 1 CSS + task 2 template
- ✅ Schema service: wrapper front matter
- ✅ Toekomstige uitbreiding (cursus 4/5): detail.njk template-driven, alleen wrapper + i18n nodig

**Placeholders:** geen TBD/TODO. Alle code-blocks compleet.

**Type consistency:** alle classes en i18n-key conventies consistent. `courseKey` dotaccess via `(k + ".x.y") | t(locale)` patroon overal hetzelfde.
