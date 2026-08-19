// Shared shell for every public page.
// The <head> order is prescribed by .claude/skills/fast-static-site/SKILL.md §2:
// meta -> inline critical CSS -> preloads -> modulepreload -> stylesheet -> module script.
//
// The visual frame (full-bleed page, header, footer) comes from the
// design system: see .claude/skills/smartagents-design/README.md.
import { html, raw, join, escapeHtml } from '../../build/lib/html.mjs';
import { languages, defaultLanguage, absolute, pagePath } from '../../build/lib/i18n.mjs';

const LINKEDIN_URL = 'https://www.linkedin.com/company/smartagents-be/';

/**
 * @param {object} ctx
 * @param {Function} ctx.t              translator for this language
 * @param {string} ctx.lang            language code for this page
 * @param {string} ctx.dir             'ltr' | 'rtl'
 * @param {string} ctx.url             root-relative path of this page
 * @param {string} ctx.title
 * @param {string} ctx.description
 * @param {Array}  ctx.alternates      [{ code, href }] for every language version
 * @param {string} ctx.criticalCss     inlined above-the-fold CSS
 * @param {object} ctx.assets          { js, css } hashed URLs from the Vite manifest
 * @param {object} [ctx.preloadImage]  { href, as, type, imagesrcset, imagesizes }
 * @param {*}      ctx.body            page markup (raw)
 */
export function basePage(ctx) {
  const language = languages.find((entry) => entry.code === ctx.lang) || defaultLanguage;
  const xDefault = ctx.alternates.find((alt) => alt.code === defaultLanguage.code);

  const hreflang = ctx.alternates.map(
    (alt) => html`<link rel="alternate" hreflang="${alt.code}" href="${alt.href}">`
  );
  if (xDefault) {
    hreflang.push(html`<link rel="alternate" hreflang="x-default" href="${xDefault.href}">`);
  }

  const ogAlternates = languages
    .filter((entry) => entry.code !== language.code && ctx.alternates.some((alt) => alt.code === entry.code))
    .map((entry) => html`<meta property="og:locale:alternate" content="${entry.ogLocale}">`);

  const preloadImage = ctx.preloadImage
    ? html`<link rel="preload" as="${ctx.preloadImage.as || 'image'}" href="${ctx.preloadImage.href}" fetchpriority="high"${ctx.preloadImage.type ? raw(` type="${ctx.preloadImage.type}"`) : ''}${ctx.preloadImage.imagesrcset ? raw(` imagesrcset="${ctx.preloadImage.imagesrcset}"`) : ''}${ctx.preloadImage.imagesizes ? raw(` imagesizes="${ctx.preloadImage.imagesizes}"`) : ''}>`
    : '';

  // Speculation Rules: prefetch broadly on hover/pointerdown (fast-static-site §7).
  const speculationRules = {
    prefetch: [
      {
        source: 'document',
        where: { and: [{ href_matches: '/*' }, { not: { href_matches: '/secured/*' } }] },
        eagerness: 'moderate'
      }
    ]
  };

  return html`<!doctype html>
<html lang="${language.code}" dir="${language.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ctx.title}</title>
<meta name="description" content="${ctx.description}">
<meta name="robots" content="${ctx.noindex ? 'noindex, follow' : 'index, follow'}">
<meta name="theme-color" content="#f9fafb">
<style>${raw(ctx.criticalCss)}</style>
${preloadImage}
<link rel="modulepreload" href="${ctx.assets.js}">
${join(ctx.assets.css.map((href) => html`<link rel="stylesheet" href="${href}">`))}
<link rel="canonical" href="${absolute(ctx.url)}">
${join(hreflang)}
<meta property="og:type" content="website">
<meta property="og:title" content="${ctx.title}">
<meta property="og:description" content="${ctx.description}">
<meta property="og:url" content="${absolute(ctx.url)}">
<meta property="og:locale" content="${language.ogLocale}">
${join(ogAlternates)}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="speculationrules">${raw(JSON.stringify(speculationRules))}</script>
<script type="module" src="${ctx.assets.js}"></script>
</head>
<body>
<a class="skip-link" href="#main">${ctx.t('a11y.skip')}</a>
${clipDefs()}
<div class="shell">
${siteHeader(ctx)}
${ctx.body}
${siteFooter(ctx)}
</div>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ *
 * The logo: the only vector mark in the system besides the nav chevron
 * ------------------------------------------------------------------ */

/**
 * The mark is drawn in `currentColor`, so the two variants are only a colour:
 * `.logo--field` is cyan-on-navy, `.logo--ink` is cyan-on-paper. That lets the
 * header fall back to the paper variant when the wedge behind it is dropped.
 *
 * @param {'ink'|'field'} surface — which surface the mark sits on.
 * @param {string} [id] — element id for the SVG root (element-ids §1).
 */
export function logoMark(surface, id) {
  const opacity = surface === 'field' ? ['0.62', '0.42'] : ['0.6', '0.4'];
  const idAttr = id ? raw(`id="${escapeHtml(id)}" `) : '';

  return html`<svg ${idAttr}class="logo logo--${surface}" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
<g stroke="currentColor" stroke-width="1.5" opacity="${opacity[0]}"><path d="M24 8 12 20M24 8l12 12M12 20l12 4M36 20l-12 4M12 20v12M36 20v12M24 24v16M12 32l12 8M36 32l-12 8"/></g>
<g fill="currentColor"><circle cx="24" cy="8" r="4"/><circle cx="12" cy="20" r="3"/><circle cx="36" cy="20" r="3"/><circle cx="24" cy="24" r="3.5"/><circle cx="12" cy="32" r="2.5"/><circle cx="36" cy="32" r="2.5"/><circle cx="24" cy="40" r="3"/></g>
<circle cx="24" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1" opacity="${opacity[1]}"/>
</svg>`;
}

const CHEVRON = raw(
  '<span class="nav-chevron" aria-hidden="true"><svg width="9" height="6" viewBox="0 0 9 6" fill="none"><path d="M1 1.2 4.5 4.6 8 1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
);

/* ------------------------------------------------------------------ *
 * Clip paths: the angular cuts that make every dark shape
 * ------------------------------------------------------------------ */

/**
 * One hidden <svg> per document holding every clip path the page references.
 * `objectBoundingBox` units, so the silhouettes scale with their element and
 * the shapes stay correct at every viewport width.
 */
export function clipDefs() {
  const paths = {
    // hero: a petal hung off the right edge. It leaves that edge at the top,
    // pinches almost shut at mid-height where the copy passes, then swells back
    // out and returns to the edge at the bottom. Below the 940px breakpoint it
    // becomes a band under the copy.
    heroPetal:
      'M1,0.000 C0.930,0.124 0.800,0.227 0.600,0.281 C0.400,0.335 0.132,0.396 0.052,0.484 C0.008,0.532 0.030,0.578 0.114,0.620 C0.198,0.662 0.348,0.694 0.520,0.734 C0.700,0.776 0.858,0.822 0.930,0.888 C0.976,0.930 1.000,0.958 1,1.000 Z',
    // hero, the counter-shape: a lobe rising out of the bottom-left. It reaches
    // right and up to a rounded tip, then falls away along the left edge, so the
    // pair reads bottom-left to top-right rather than as a mirror. Both are
    // welded to their own page edge; neither touches the hero's other sides.
    heroLobe:
      'M0,0.000 C0.032,0.155 0.090,0.315 0.175,0.450 C0.258,0.552 0.382,0.620 0.530,0.660 C0.642,0.690 0.732,0.708 0.800,0.708 C0.8263,0.708 0.8476,0.7286 0.8476,0.754 C0.8476,0.7794 0.8263,0.800 0.800,0.800 C0.560,0.812 0.320,0.826 0.170,0.878 C0.090,0.908 0.030,0.962 0,1 Z',
    // hero on narrow viewports: the same cut, laid flat under the copy
    heroBand: 'M0,0.18 L1,0 L1,0.82 L0,1 Z',
    // Ons DNA: a disc, and the same silhouette again as a mask for the helix
    dnaField:
      'M0.700,0.000 C0.884,0.000 1.000,0.096 1.000,0.226 C1.000,0.354 0.868,0.416 0.734,0.450 C0.662,0.469 0.620,0.518 0.614,0.626 C0.601,0.860 0.478,1.000 0.298,1.000 C0.112,1.000 0.000,0.890 0.000,0.750 C0.000,0.614 0.150,0.560 0.284,0.526 C0.350,0.509 0.394,0.466 0.400,0.352 C0.410,0.126 0.522,0.000 0.700,0.000 Z',
    dnaFieldMask:
      'M0.700,0.000 C0.884,0.000 1.000,0.096 1.000,0.226 C1.000,0.354 0.868,0.416 0.734,0.450 C0.662,0.469 0.620,0.518 0.614,0.626 C0.601,0.860 0.478,1.000 0.298,1.000 C0.112,1.000 0.000,0.890 0.000,0.750 C0.000,0.614 0.150,0.560 0.284,0.526 C0.350,0.509 0.394,0.466 0.400,0.352 C0.410,0.126 0.522,0.000 0.700,0.000 Z',
    dnaBlob:
      'M0.330,0.045 C0.560,-0.030 0.800,0.115 0.910,0.345 C1.020,0.580 0.980,0.845 0.790,0.955 C0.600,1.060 0.330,0.980 0.180,0.775 C0.035,0.575 0.010,0.325 0.140,0.170 C0.195,0.105 0.260,0.068 0.330,0.045 Z',
    // Digitale transformatie: a skewed slab behind the isometric stack
    stackField:
      'M0.060,0.100 L1,0.030 L1,0.860 L0.060,0.930 C0.024,0.933 0,0.905 0,0.870 L0,0.160 C0,0.125 0.024,0.097 0.060,0.100 Z',
    // SmartSpace: a chevroned full-width band
    bandField:
      'M0,0.034 L0.664,0.006 C0.690,0.002 0.708,0.012 0.722,0.036 L0.930,0.412 C0.957,0.462 0.957,0.538 0.930,0.588 L0.722,0.964 C0.708,0.988 0.690,0.998 0.664,0.994 L0,0.966 Z'
  };

  const defs = Object.entries(paths).map(
    ([id, d]) => html`<clipPath id="${id}" clipPathUnits="objectBoundingBox"><path d="${d}"/></clipPath>`
  );

  return html`<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs>${join(defs, '')}</defs></svg>`;
}

/* ------------------------------------------------------------------ *
 * Header and footer
 * ------------------------------------------------------------------ */

const NAV_SECTIONS = ['dna', 'approach', 'smartspace', 'insights', 'contact'];
const SERVICES = ['process', 'agentic', 'training', 'staffing'];

export function siteHeader({ t, lang, alternates }) {
  const menuItems = SERVICES.map(
    (key) => html`<a class="nav-panel__item" href="#services"><b>${t(`service.${key}.title`)}</b><span>${t(`service.${key}.menu`)}</span></a>`
  );

  const navLinks = NAV_SECTIONS.map(
    (key) => html`<a class="nav-link" href="#${key}">${t(`nav.${key}`)}</a>`
  );

  const mobileLinks = ['services', ...NAV_SECTIONS].map(
    (key) => html`<a href="#${key}">${t(`nav.${key}`)}</a>`
  );

  return html`<header class="site-header">
  <div class="header-wedge" aria-hidden="true"><sa-node-field></sa-node-field></div>
  <a class="brand-link" href="${pagePath(lang)}">${logoMark('field')}<span>Smart<span class="brand-accent">Agents</span></span></a>
  <nav class="site-nav" aria-label="${t('a11y.mainNav')}">
    <div class="nav-group">
      <a class="nav-link" href="#services">${t('nav.services')}${CHEVRON}</a>
      <div class="nav-panel">
        <div class="nav-panel__grid">
${join(menuItems)}
        </div>
        <a class="nav-panel__all" href="#services"><span>${t('nav.allServices')}</span><span aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
${join(navLinks)}
  </nav>
  <details class="nav-toggle">
    <summary>${t('nav.menu')}${CHEVRON}</summary>
    <nav class="nav-toggle__panel" aria-label="${t('a11y.mainNav')}">
${join(mobileLinks)}
    </nav>
  </details>
  <div class="header-actions">
${languageSwitcher(lang, alternates, t)}
    <a class="btn btn--primary btn--sm" href="#contact">${t('cta.talk')}</a>
  </div>
</header>`;
}

export function siteFooter({ t }) {
  return html`<footer class="site-footer">
  <sa-node-field></sa-node-field>
  <span>${t('footer.legal')}</span>
  <nav aria-label="${t('a11y.footerNav')}">
    <a href="/secured/">${t('footer.customerZone')}</a>
    <a href="${LINKEDIN_URL}" rel="noopener">LinkedIn</a>
  </nav>
</footer>`;
}

/** Language switcher: real links to the same page, no JS (static-i18n §5). */
export function languageSwitcher(currentLang, alternates, t) {
  return html`<nav class="lang-switcher" aria-label="${t('a11y.language')}">
  <ul>
${join(
    alternates.map((alt) => {
      const language = languages.find((entry) => entry.code === alt.code);
      const current = alt.code === currentLang;
      return html`    <li><a href="${new URL(alt.href).pathname}" lang="${alt.code}" hreflang="${alt.code}"${current ? raw(' aria-current="true"') : ''}><span class="visually-hidden">${language.name}</span><span aria-hidden="true">${alt.code}</span></a></li>`;
    })
  )}
  </ul>
</nav>`;
}
