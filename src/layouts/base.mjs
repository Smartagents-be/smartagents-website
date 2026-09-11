// Shared shell for every public page.
// The <head> order is prescribed by .claude/skills/fast-static-site/SKILL.md §2:
// meta -> inline critical CSS -> preloads -> stylesheet -> module script.
//
// There is no `modulepreload` for the entry. The skill's order has one because
// it assumes the module script is at the foot of the body; here it is in the
// head, four lines below, so the preload scanner finds the same URL in the same
// pass and the hint only ever asked for a byte-identical second discovery of a
// file already being fetched. With `build.modulePreload: false` in
// `vite.config.js` there are no dependency chunks for it to warm either.
//
// The visual frame (full-bleed page, header, footer) comes from the
// design system: see .claude/skills/smartagents-design/README.md.
import { html, raw, join, escapeHtml } from '../../build/lib/html.mjs';
import { languages, defaultLanguage, absolute, pagePath } from '../../build/lib/i18n.mjs';
import { LINKEDIN_URL, OG_IMAGE, schemaGraph } from './schema.mjs';
import { page as trainingPage } from '../pages/training.mjs';
import { page as staffingPage } from '../pages/staffing.mjs';
import { page as sdlcPage } from '../pages/sdlc.mjs';
import { page as processesPage } from '../pages/processes.mjs';
import { page as teamPage } from '../pages/team.mjs';
import { page as jobsPage } from '../pages/jobs.mjs';
import { page as privacyPage } from '../pages/privacy/privacy.mjs';
import { insightsIndexPath } from '../pages/insights/insights.mjs';
import { PHONE, PHONE_HREF, EMAIL } from '../components/contact-form/contact-form.mjs';

/**
 * The services that have a detail page of their own, keyed by the string the
 * homepage rows, the nav bar and the phone sheet are all built from. A service
 * that is not in here is a homepage row and nothing more: it stays out of the
 * nav, and its row renders plain, without the arrow cue (design README,
 * "Deviations", item 4).
 */
const SERVICE_PAGES = {
  training: trainingPage,
  staffing: staffingPage,
  sdlc: sdlcPage,
  processes: processesPage
};

/**
 * URL of a service's detail page in this language, or null where there is none
 * — either because the service has no page, or because that page is not
 * published in this language.
 */
export function servicePath(key, lang) {
  const slug = SERVICE_PAGES[key]?.slugs[lang];
  return slug === undefined ? null : pagePath(lang, slug);
}

/** URL of the team page in this language, or null where it is not published. */
export function teamPath(lang) {
  const slug = teamPage.slugs[lang];
  return slug === undefined ? null : pagePath(lang, slug);
}

/** URL of the jobs page in this language, or null where it is not published. */
export function jobsPath(lang) {
  const slug = jobsPage.slugs[lang];
  return slug === undefined ? null : pagePath(lang, slug);
}

/** URL of the privacy notice in this language, or null where it is not published. */
export function privacyPath(lang) {
  const slug = privacyPage.slugs[lang];
  return slug === undefined ? null : pagePath(lang, slug);
}

/**
 * @param {object} ctx
 * @param {Function} ctx.t              translator for this language
 * @param {string} ctx.lang            language code for this page
 * @param {string} ctx.dir             'ltr' | 'rtl'
 * @param {string} ctx.url             root-relative path of this page
 * @param {string} ctx.pageId          the page module's own id, for aria-current
 * @param {string} ctx.title
 * @param {string} ctx.description
 * @param {Array}  ctx.alternates      [{ code, href }] for every language version
 * @param {string} ctx.criticalCss     inlined above-the-fold CSS
 * @param {object} ctx.assets          { js, css } hashed URLs from the Vite manifest
 * @param {object} [ctx.preloadImage]  { href, as, type, imagesrcset, imagesizes }
 * @param {object} [ctx.ogImage]       { href, width, height, alt } — overrides the brand card
 * @param {object} [ctx.article]       { published, modified, section, tags } for an article page
 * @param {Array}  [ctx.schema]        extra JSON-LD nodes this page contributes
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

  /* The share card. Every share of this site on LinkedIn — the company's only
     social channel — used to render as a bare text link, because no page
     carried an `og:image` at all. The default is the brand card generated by
     `scripts/make-social-images.mjs`; an article overrides it with its own
     thumbnail, which is the picture the reader will see again at the top of the
     page they land on. */
  const share = ctx.ogImage || OG_IMAGE;

  /* An article says so in the head as well as in the DOM. The date was printed
     as `<time datetime>` in the body and reached nothing a crawler reads, and
     `og:type` said "website" on a page that is plainly not one. */
  const article = ctx.article
    ? [
        html`<meta property="article:published_time" content="${ctx.article.published}">`,
        html`<meta property="article:modified_time" content="${ctx.article.modified || ctx.article.published}">`,
        html`<meta property="article:author" content="SmartAgents">`,
        html`<meta property="article:section" content="${ctx.article.section}">`,
        ...ctx.article.tags.map((tag) => html`<meta property="article:tag" content="${tag}">`),
        html`<meta name="author" content="SmartAgents">`
      ]
    : [];

  // `<` escaped rather than trusted: everything in the graph comes from our own
  // string files today, but a `</script>` in a description would end the block
  // and put the rest of the JSON in the document.
  const schema = JSON.stringify(schemaGraph({ t: ctx.t, extra: ctx.schema || [] })).replace(/</g, '\\u003c');

  /* Speculation Rules: prefetch broadly on hover/pointerdown
     (fast-static-site §7).

     `/media/*` is excluded for the same reason `/secured/*` is, and it is not a
     theoretical one: the two course one-pagers are about 200 KB each and the
     training page links both, so a reader running an eye down the offer pulled
     half a megabyte of PDF nobody asked for. A prefetch is for a page the reader
     is about to navigate to; a file the browser hands to a download bar is not
     that. The hover fallback in `src/app.js` carries the same exclusion. */
  const speculationRules = {
    prefetch: [
      {
        source: 'document',
        where: {
          and: [
            { href_matches: '/*' },
            { not: { href_matches: '/secured/*' } },
            { not: { href_matches: '/media/*' } }
          ]
        },
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
${join(ctx.assets.css.map((href) => html`<link rel="stylesheet" href="${href}">`))}
<link rel="canonical" href="${absolute(ctx.url)}">
${join(hreflang)}
<meta property="og:type" content="${ctx.article ? 'article' : 'website'}">
<meta property="og:site_name" content="SmartAgents">
<meta property="og:title" content="${ctx.title}">
<meta property="og:description" content="${ctx.description}">
<meta property="og:url" content="${absolute(ctx.url)}">
<meta property="og:locale" content="${language.ogLocale}">
${join(ogAlternates)}
<meta property="og:image" content="${absolute(share.href)}">
<meta property="og:image:width" content="${String(share.width)}">
<meta property="og:image:height" content="${String(share.height)}">
<meta property="og:image:alt" content="${share.alt || ctx.title}">
${join(article)}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${raw(schema)}</script>
<script type="speculationrules">${raw(JSON.stringify(speculationRules))}</script>
<script type="module" src="${ctx.assets.js}"></script>
</head>
<body id="site-body">
<a id="site-skip-link" class="skip-link" href="#main">${ctx.t('a11y.skip')}</a>
${clipDefs()}
<div id="site-shell" class="shell">
${siteHeader(ctx)}
${ctx.body}
${siteFooter(ctx)}
</div>
${mobileActions(ctx)}
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
 * @param {string} id — element id for the SVG root; every part of the mark is
 *   named from it, so it is required rather than optional (element-ids §1).
 */
export function logoMark(surface, id) {
  const opacity = surface === 'field' ? ['0.62', '0.42'] : ['0.6', '0.4'];
  // Every part of the mark is nameable too (element-ids §1), derived from the
  // root's id so the two marks a page prints keep their parts apart.
  const at = (part) => raw(`id="${escapeHtml(id)}-${part}" `);

  return html`<svg id="${id}" class="logo logo--${surface}" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
<g ${at('edges')}stroke="currentColor" stroke-width="1.5" opacity="${opacity[0]}"><path ${at('edge-paths')}d="M24 8 12 20M24 8l12 12M12 20l12 4M36 20l-12 4M12 20v12M36 20v12M24 24v16M12 32l12 8M36 32l-12 8"/></g>
<g ${at('nodes')}fill="currentColor"><circle ${at('node-top')}cx="24" cy="8" r="4"/><circle ${at('node-upper-left')}cx="12" cy="20" r="3"/><circle ${at('node-upper-right')}cx="36" cy="20" r="3"/><circle ${at('node-centre')}cx="24" cy="24" r="3.5"/><circle ${at('node-lower-left')}cx="12" cy="32" r="2.5"/><circle ${at('node-lower-right')}cx="36" cy="32" r="2.5"/><circle ${at('node-bottom')}cx="24" cy="40" r="3"/></g>
<circle ${at('halo')}cx="24" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1" opacity="${opacity[1]}"/>
</svg>`;
}

/**
 * The orbit diagram behind a hero: five concentric rings struck from one origin
 * off the left edge, three of them carrying a node that travels the ring and
 * fades in and out as it goes. Pure texture, so it is `aria-hidden` and paints
 * under both the copy and the dark shapes.
 *
 * A fourth node, on the outermost ring, is opt-in: it only reads on a ground
 * tall enough to give that ring room, so a call site asks for it by name.
 *
 * @param {string} prefix — id prefix from the call site (element-ids §4).
 * @param {string} [variant] — extra class on the layer, e.g. `orbits--insights`.
 * @param {string[]} [paths] — which rings carry a travelling node.
 */
export function orbitRings(prefix, variant = '', paths = ['01', '02', '03']) {
  const rings = ['01', '02', '03', '04', '05'];
  const layer = variant ? `orbits ${variant}` : 'orbits';

  return html`  <div id="${prefix}-orbits" class="${layer}" aria-hidden="true">
    <div id="${prefix}-orbits-origin" class="orbits__origin">
${join(rings.map((key) => html`      <div id="${prefix}-orbit-ring-${key}" class="orbits__ring orbits__ring--${key}"></div>`))}
${join(paths.map((key) => html`      <div id="${prefix}-orbit-${key}" class="orbits__path orbits__path--${key}"><i id="${prefix}-orbit-node-${key}" class="orbits__node"></i></div>`))}
    </div>
  </div>`;
}

/**
 * `01`-style two-digit index. Numbers act as the icons in this system, so every
 * numbered list on the site prints one, and they all print it the same way.
 */
export const index = (n) => String(n).padStart(2, '0');

const CHEVRON = raw(
  '<span id="nav-toggle-chevron" class="nav-chevron" aria-hidden="true"><svg id="nav-toggle-chevron-mark" width="9" height="6" viewBox="0 0 9 6" fill="none"><path id="nav-toggle-chevron-path" d="M1 1.2 4.5 4.6 8 1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
);

/* ------------------------------------------------------------------ *
 * Clip paths: the angular cuts that make every dark shape
 * ------------------------------------------------------------------ */

/**
 * One hidden <svg> per document holding every clip path the page references.
 * `objectBoundingBox` units, so the silhouettes scale with their element and
 * the shapes stay correct at every viewport width.
 */
/* Every silhouette on the site, as a path in the unit square of the box that
 * carries it. Winding is not free: a magnet may append the contour of a join to
 * one of these as an extra subpath under one fill, and the default
 * `clip-rule: nonzero` reads a loop wound against the body it overlaps as a
 * hole punched through it. `src/motion.js` measures each path's winding at
 * setup and turns the join to match, so a path may be drawn either way round —
 * but if a shape ever grows a second subpath of its own, the two have to agree
 * with each other. */
/* The two pebbles, named once. `src/motion.js` resolves a magnet's outline with
 * `getElementById(element.dataset.clip)` and rewrites that path's `d` in place,
 * so two magnets on one page naming the same clip fight over a single element:
 * the second remap wins and the first shape is left drawn into the wrong box.
 * Every magnet on a page therefore needs its own id — and the AI-native
 * businessprocessen hero has four pebbles in one line. These constants are how
 * four ids carry two drawings without the paths being copied, which is the drift
 * `clipDefs()` refuses when it says a second pebble drawn to within a few points
 * of the first is not a new shape. */
const PEBBLE_A =
  'M0.020,0.470 C0.035,0.225 0.190,0.055 0.430,0.022 C0.665,-0.010 0.945,0.135 0.982,0.398 C1.018,0.640 0.900,0.878 0.655,0.972 C0.430,1.058 0.115,0.905 0.045,0.690 C0.028,0.635 0.012,0.560 0.020,0.470 Z';
const PEBBLE_B =
  'M0.010,0.430 C0.030,0.190 0.210,0.030 0.470,0.020 C0.720,0.010 0.985,0.180 0.995,0.430 C1.005,0.680 0.830,0.960 0.560,0.990 C0.320,1.015 0.060,0.850 0.020,0.620 C0.012,0.560 0.005,0.495 0.010,0.430 Z';

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
    // hero on a phone: the petal again, but reduced to the sliver that fits
    // beside a single column of copy. It leaves the top edge two thirds across,
    // runs down and out to the right, pinches once where the claim passes, then
    // swells back to the right edge. Welded to the top and the right, free of
    // the other two, so it reads as one corner of the same shape.
    heroSwoop:
      'M0.670,0.000 C0.772,0.074 0.848,0.148 0.890,0.214 C0.922,0.270 0.912,0.324 0.878,0.368 C0.848,0.408 0.876,0.452 0.928,0.492 C0.966,0.522 0.990,0.552 1.000,0.578 L1.000,0.000 Z',
    // Ons DNA: a disc, and the same silhouette again as a mask for the helix
    dnaField:
      'M0.700,0.000 C0.884,0.000 1.000,0.096 1.000,0.226 C1.000,0.354 0.868,0.416 0.734,0.450 C0.662,0.469 0.620,0.518 0.614,0.626 C0.601,0.860 0.478,1.000 0.298,1.000 C0.112,1.000 0.000,0.890 0.000,0.750 C0.000,0.614 0.150,0.560 0.284,0.526 C0.350,0.509 0.394,0.466 0.400,0.352 C0.410,0.126 0.522,0.000 0.700,0.000 Z',
    dnaFieldMask:
      'M0.700,0.000 C0.884,0.000 1.000,0.096 1.000,0.226 C1.000,0.354 0.868,0.416 0.734,0.450 C0.662,0.469 0.620,0.518 0.614,0.626 C0.601,0.860 0.478,1.000 0.298,1.000 C0.112,1.000 0.000,0.890 0.000,0.750 C0.000,0.614 0.150,0.560 0.284,0.526 C0.350,0.509 0.394,0.466 0.400,0.352 C0.410,0.126 0.522,0.000 0.700,0.000 Z',
    // The small companion. Its left flank is one long curve between two short
    // ones, and the four handles around it are set by curvature rather than by
    // eye: the anchors and every tangent are the drawn ones, but the handle
    // lengths are picked so the radius of curvature runs on across each join
    // instead of stepping. Drawn by eye the flank stepped from 66px to 84px at
    // its foot, which the eye reads as a flat spot on the lower left even
    // though the tangents match. Move an anchor and the lengths want refitting.
    dnaBlob:
      'M0.330,0.045 C0.560,-0.030 0.800,0.115 0.910,0.345 C1.020,0.580 0.980,0.845 0.790,0.955 C0.600,1.060 0.3360,0.9882 0.180,0.775 C0.0466,0.5910 0.0048,0.3312 0.140,0.170 C0.1884,0.1128 0.260,0.068 0.330,0.045 Z',
    // Hoe een cursus verloopt: a stone standing on the hairline the tour hangs
    // from. A taut edge runs from the high shoulder down to the blunt nose, the
    // back is round, and the foot is the only flat: it stands on a fifth of its
    // own width, so it reads as balanced, and the cursor rocks it without ever
    // lifting it off the rule.
    tourStone:
      'M0.560,1.000 C0.740,0.995 0.880,0.930 0.945,0.800 C1.000,0.688 0.980,0.545 0.895,0.430 C0.800,0.302 0.640,0.190 0.470,0.120 C0.330,0.062 0.210,0.048 0.140,0.100 C0.060,0.160 0.030,0.320 0.055,0.510 C0.082,0.716 0.180,0.900 0.300,0.970 C0.375,1.014 0.450,1.004 0.560,1.000 Z',
    // The counterweight, hung under the agentic engineering course: a flat top
    // welded to the rule that closes the offer, and a free-hand underside. It
    // is heaviest left of centre and runs out long and shallow to the right: one
    // sweep from the deep point out to the tip, easing once on the way. That
    // easing lifts 4px against a 118px shape and is drawn out over 37px, which
    // is about the limit — twice the relief, or a second one beside it, and the
    // underside stops reading as a drawn curve and starts reading as a row of
    // scallops. Every join sits at an extreme with a level tangent, so there is
    // no corner anywhere in it, and both ends return to the rule almost
    // vertically, so the shape hangs off the line rather than resting on it.
    tourDome:
      'M0,0 L1,0 C0.978,0.150 0.835,0.330 0.780,0.330 C0.742,0.330 0.698,0.295 0.660,0.295 C0.560,0.295 0.340,1.000 0.230,1.000 C0.130,1.000 0.018,0.560 0,0 Z',
    // AI staffing en coaching: the hero's shape on that page. Where the petal is
    // a leaf hung off the right edge, this is an arch — one long descent from
    // the top edge, just under a third across the box, down to the bottom right
    // corner, with the top and right page edges closing it.
    //
    // It is not one curve but three turns of the same curve, each easing out of
    // the last: the outline leans left, catches, leans left again, catches
    // again, and arrives at the corner almost level. Struck as a single sweep
    // the same silhouette reads as a bevel; taken in steps it reads as drawn,
    // and each catch is a place the cursor has something to pull on.
    //
    // Two things it must not become. Struck corner to corner with a shallow bow,
    // it reads as a black triangle rather than as anything drawn. Opened up to
    // fill the whole corner, it stops being a shape hung off an edge and becomes
    // the ground the page is set on. Held to a flank, it needs neither.
    heroArch:
      'M0.300,0 C0.520,0.070 0.610,0.180 0.600,0.320 C0.592,0.440 0.660,0.520 0.760,0.590 C0.860,0.660 0.900,0.730 0.890,0.830 C0.884,0.910 0.930,0.970 1,1 L1,0 Z',
    // The two pebbles that fall away from the arch into the light half of the
    // hero. Neither is welded to anything, which is what makes the arch read as
    // a shape that has shed pieces rather than as a wall. Both are drawn
    // off-round — a circle beside a hand-drawn arch reads as a bullet — and the
    // larger one carries the flatter side, so the pair has a heavy and a light.
    //
    // `heroPebbleA` is no longer the staffing page's alone: the training hero
    // stands one above the petal's shoulder, close enough for the cursor to run
    // the two together (`.hero__bead` in main.css). Redraw it for one
    // composition and the other moves with it — and the off-round is
    // load-bearing there too, which is why that bead's box carries a floor on
    // its width.
    heroPebbleA: PEBBLE_A,
    heroPebbleB: PEBBLE_B,
    // The two smaller blobs of the AI-native businessprocessen line. Separate ids
    // because two magnets on one page may not share a clip; two
    // drawings because there are only two pebbles and a third drawn to within a
    // few points of them would be drift. They alternate so no two neighbours in
    // the line are the same outline.
    // Each is one of the two pebbles mapped into its own place in the shared
    // composition box — the same trick `processLobe` uses, and for the same
    // reason: `src/motion.js` paints a traced join into one shape's box, and a
    // box drawn tight around a small blob cannot hold a union that reaches its
    // neighbour. Every blob on this page therefore carries the *whole* box and
    // is authored into a corner of it, so whichever one the pass picks as host
    // can hold whatever it draws.
    processBeadA:
      'M0.002,0.150 C0.006,0.066 0.042,0.010 0.094,0.007 C0.144,0.003 0.197,0.063 0.199,0.150 C0.201,0.236 0.166,0.334 0.112,0.344 C0.064,0.353 0.012,0.296 0.004,0.216 C0.002,0.195 0.001,0.172 0.002,0.150 Z',
    processBeadC:
      'M0.520,0.503 C0.522,0.461 0.540,0.434 0.565,0.432 C0.590,0.431 0.616,0.460 0.617,0.503 C0.617,0.545 0.600,0.593 0.574,0.598 C0.550,0.603 0.525,0.574 0.521,0.535 C0.520,0.525 0.519,0.514 0.520,0.503 Z',
    processBeadB:
      'M0.245,0.348 C0.248,0.249 0.284,0.181 0.339,0.168 C0.394,0.155 0.458,0.213 0.467,0.319 C0.475,0.416 0.448,0.511 0.391,0.549 C0.339,0.584 0.267,0.522 0.250,0.436 C0.246,0.414 0.243,0.384 0.245,0.348 Z',
    // "Wat we doen": a leaf standing in the left page gutter beside the track
    // panel. Welded to the left page edge and free of everything else, it runs
    // the height of the panel and pinches twice on the way down, so the gutter
    // carries a line of movement rather than a bar.
    tracksLeaf:
      'M0,0.030 C0.350,0.015 0.780,0.045 0.850,0.115 C0.905,0.175 0.740,0.265 0.560,0.340 C0.400,0.407 0.290,0.470 0.330,0.545 C0.372,0.622 0.640,0.560 0.780,0.630 C0.905,0.693 0.870,0.760 0.700,0.828 C0.520,0.898 0.240,0.950 0,0.985 Z',
    // The counterweight to the leaf, hung under the far corner of the same
    // panel: a wedge that drops from the panel's foot and runs out to the right.
    // The leaf holds the near edge and the wedge the far one, so the panel sits
    // between two shapes on a diagonal rather than on top of a decoration.
    tracksTail:
      'M0.010,0 C0.012,0.340 0.055,0.610 0.130,0.720 C0.205,0.825 0.310,0.872 0.450,0.878 L0.520,0.878 C0.640,0.878 0.655,0.640 0.745,0.420 C0.815,0.250 0.905,0.105 1,0.055 L1,0 Z',
    // AI-native SDLC: the hero's shape on that page. A ridge on the flank the
    // petal is a leaf on — a short shoulder high up, a neck pulled back almost
    // to the page edge where the headline passes, and one long lobe below it
    // that reaches half way across its box. Narrow once, open twice, which is
    // the figure the page argues about a lifecycle drawn as the ground it
    // argues it on.
    //
    // Two drafts before this one cusped at the neck and again at the lobe and
    // read as a chevron: at a turn this tight the handles have to be longer
    // than the segment looks like it wants, or the curvature steps and the eye
    // reads the step as a corner. The shipped one lengthens them and pulls the
    // lobe back off the far edge of the box.
    // The ridge occupies the right 0.786 of its box and the left quarter is
    // empty, which is where the two orbs beside it live (`sdlcOrbNear` and
    // `sdlcOrbFar`). The box was widened leftward to make room for them and the
    // ridge remapped into what is left, so it draws exactly the pixels it drew
    // before — see "Detail pages — AI-native SDLC" in main.css for the three
    // band insets that hold that true at every width. A shape only ever paints
    // its own box, so an orb outside the ridge's box would not be painted at
    // all; sharing one box is also what lets any of the three host a join, which
    // is the rule the AI-native businessprocessen hero is built on.
    sdlcHeroRidge:
      'M1.000,0.000 C0.898,0.040 0.670,0.070 0.670,0.180 C0.670,0.290 0.780,0.320 0.780,0.430 C0.780,0.540 0.458,0.550 0.458,0.700 C0.458,0.850 0.878,0.965 1.000,1.000 Z',
    // The two orbs in the bay the ridge's neck opens: the near one off the lower
    // lobe's outer flank, the far one below and left of it.
    //
    // Each sits in the middle 0.588 of its own **square** slot, and the square is
    // the point. The ridge's box is a share of the page width against a hero
    // that is 540px tall at every width, so its aspect runs from 1.2 at 1081 to
    // 2.9 at 2560 — the ridge has always stretched with it and reads as drawn
    // either way, but an orb that stretches is a flat disc: at 2560 these came
    // out half again as wide as they were tall. `aspect-ratio: 1` on the slot
    // keeps them round at every width, and the slot is 1.7 times the orb across
    // so that its grown box still contains the join window between the two of
    // them — a shape paints only its own box, and a union traced outside it is
    // cut off along its edge.
    sdlcOrbNear:
      'M0.218,0.482 C0.227,0.338 0.318,0.238 0.459,0.219 C0.597,0.200 0.762,0.285 0.783,0.440 C0.805,0.582 0.735,0.722 0.591,0.778 C0.459,0.828 0.274,0.738 0.232,0.612 C0.222,0.579 0.213,0.535 0.218,0.482 Z',
    sdlcOrbFar:
      'M0.212,0.459 C0.224,0.318 0.329,0.224 0.482,0.218 C0.629,0.212 0.785,0.312 0.791,0.459 C0.797,0.606 0.694,0.770 0.535,0.788 C0.394,0.803 0.241,0.706 0.218,0.571 C0.213,0.535 0.209,0.497 0.212,0.459 Z',
    // AI-native businessprocessen: the end of a chain, and the only silhouette
    // on the site that does not fill its own box.
    //
    // The hero is five separate blobs in a line, small to large, and this is the
    // largest — the one at the bottom right. The other four are pebbles placed
    // beside it (`.hero--processes .hero__drift--*` in main.css). Nothing is
    // fused: at rest a reader sees five shapes, and the cursor runs the ones it
    // comes between into one fluid. The page's headline is "Van uw taken naar
    // herbruikbare workflows" — separate pieces becoming one thing — so the
    // figure is the sentence, and the fusing is the reader's to do.
    //
    // **It occupies the bottom-right quarter of its box and leaves the rest
    // empty, and that is the whole trick.** A join is traced into a window and
    // written into the *first shape in DOM order whose box reaches that window*
    // — `group[0]` in `src/motion.js` — and anything outside that shape's grown
    // box is cut off, because there is nothing painted out there for the clip to
    // reveal. Two pebbles joining each other at the far end of the line would be
    // hosted by this shape anyway, since it is first in the DOM, and a box drawn
    // tight around the blob would not reach them: what rendered was a pebble
    // with a straight vertical chord sliced out of it. So the box is drawn
    // around the *whole composition* and the blob is authored into one corner of
    // it. Every window between any two of the five then falls inside the host's
    // box with 140px of `BLEED` to spare, and every join renders whole.
    //
    // The cost is that this path is the one on the site that cannot be read as a
    // silhouette on its own: `0.666 -> 1.0` in x and `0.406 -> 1.0` in y are
    // where the blob is, not what it is. It is `heroPebbleA` mapped into that
    // rectangle, so the drawing is still the shared one the staffing arch sheds
    // and the training hero stands a bead of — redraw that and this moves with
    // it. Move the composition and this has to be remapped, in the same pass.
    processLobe:
      'M0.668,0.688 C0.673,0.544 0.726,0.444 0.807,0.424 C0.887,0.406 0.981,0.491 0.994,0.646 C1.006,0.788 0.966,0.928 0.883,0.984 C0.807,1.034 0.700,0.944 0.677,0.818 C0.671,0.785 0.666,0.741 0.668,0.688 Z',
    // Jobs: the only silhouette on the public site welded to nothing at all.
    // Every other one is a leaf, an arch, a ridge or a terrace hung off a page
    // edge and read as ground. This one floats in the hero's right flank with
    // paper all the way round it, which is the one thing the brand's shapes are
    // otherwise never allowed to do — and the licence is that the site already
    // has free shapes in `heroPebbleA` and `heroPebbleB`, which "hang from
    // nothing" beside the staffing arch. This is that, at hero scale.
    //
    // It got here by elimination. It was welded to the header's hairline for
    // four drafts, on the argument that five heroes hang a shape off the right
    // flank and a sixth would be a template rather than a composition. The
    // argument was right and the execution never was: a wide flat weld with a
    // hard corner at each end, hung in the middle of the bar under the nav, is
    // an open mega-menu panel; narrow it and the flanks splay downward into the
    // caret of one; centre the lobe on the line instead so the outline leaves it
    // vertically and the drawing is finally sound, but the thing is still a
    // shape growing out of the navigation. Detached, none of that exists, and
    // the shape is free to close.
    //
    // **Closing it is the point.** Welded, the outline ran from one corner of
    // the top edge to the other and the top edge closed it — so the silhouette
    // had two corners in it and the union's own contour was cut in half. Free,
    // the trace is the whole loop: two lobes running together, the small one
    // upper-left and the large one lower-right, with a concave fillet on both
    // sides of the neck and not one corner anywhere. That is the metaball union
    // `src/motion.js` draws when the cursor brings two dark shapes together,
    // standing still — the page about joining opens on a join, and now it opens
    // on the whole of one.
    //
    // The lobes are (0.28, 0.26) r 0.16 x 0.184 and (0.72, 0.68) r 0.32 x 0.256
    // turned -25°, traced at the 1 contour, resampled at even arc length into
    // sixteen anchors and written out as a periodic chain. Four numbers carry it.
    //
    // **Solidity 0.82** — the outline's area over its convex hull's — is the
    // test this shape is held to, and it is the one that catches the failure
    // every earlier draft shared. A blob with no waist measures 1.00. A row-by-
    // row width scan cannot catch it here because the waist is *diagonal*: scan
    // horizontally and you never cross it at its narrowest. One of the welded
    // drafts measured convex on its whole right flank at every viewport width,
    // which is a light bulb on the one page that is meant to be a join.
    //
    // **The neck is 0.174 of the box** at 0.32 along the axis between the lobe
    // centres. Thinner reads better standing still and folds under the cursor;
    // see the amplitude note in `src/pages/jobs.mjs`.
    //
    // **The belly is an ellipse turned -25°.** Axis-aligned it fits a circle to
    // within about a pixel over three hundred scan rows, and a true disc at 70%
    // of the ink is the bullet `clipDefs()` already refuses in a 90px pebble.
    //
    // **The offset is diagonal.** Two lobes stacked square over one another are
    // a vase at every pinch from 0.18 to 0.30; a four-beat profile drawn by hand
    // through thirteen anchors is a chess pawn. Both were drawn. What they have
    // in common is symmetry about a vertical axis, and that is the rule they
    // were hiding: a shape reads as furniture the moment its two flanks answer
    // each other.
    //
    // The path is fitted to its box after tracing. A cubic runs outside its own
    // anchors, and an earlier draft's control points reached x 1.029 — the ink
    // sat 6px past the box that positioned it, so every inset in the CSS was
    // measuring a shape that is not the one on screen. `fitDrawn` maps the
    // sampled curve's bounding box onto the unit square, which is exact in one
    // pass because an affine map of a Bézier is the same map on its control
    // points. Control points outside [0,1] are expected and fine; it is the
    // curve that fills the box. That is what lets `right: var(--gutter-page)`
    // put the ink *on* the page's content edge rather than a few pixels inside
    // it, and it is why the box's aspect is 1.04 — the traced loop's own.
    jobsJoin:
      'M0.001,0.201 C-0.004,0.265 0.025,0.354 0.069,0.400 C0.111,0.446 0.216,0.436 0.258,0.476 C0.295,0.512 0.294,0.572 0.304,0.629 C0.317,0.694 0.298,0.782 0.327,0.842 C0.356,0.900 0.422,0.956 0.482,0.980 C0.541,1.005 0.623,1.004 0.688,0.991 C0.753,0.977 0.824,0.941 0.873,0.896 C0.925,0.850 0.975,0.784 0.991,0.719 C1.007,0.655 1.002,0.565 0.971,0.508 C0.941,0.453 0.869,0.405 0.807,0.382 C0.746,0.361 0.668,0.369 0.601,0.376 C0.532,0.382 0.432,0.452 0.398,0.425 C0.362,0.398 0.407,0.283 0.390,0.217 C0.373,0.151 0.344,0.063 0.295,0.029 C0.247,-0.004 0.147,-0.011 0.100,0.018 C0.049,0.047 0.005,0.137 0.001,0.201 Z'
  };

  const defs = Object.entries(paths).map(
    ([id, d]) => html`<clipPath id="${id}" clipPathUnits="objectBoundingBox"><path id="${id}-path" d="${d}"/></clipPath>`
  );

  return html`<svg id="site-clip-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs id="site-clip-defs-list">${join(defs, '')}</defs></svg>`;
}

/* ------------------------------------------------------------------ *
 * Header and footer
 * ------------------------------------------------------------------ */

/**
 * The nav in reading order: the homepage, every service that has a page behind
 * it, the team page, and the one homepage section a reader arrives looking for.
 * Nothing here is a menu — the mega menu it replaced listed four services of which two had
 * nowhere to go, and a dropdown whose only real items are two links is a lid
 * over two links. All four services have a page now, so the bar is the offer.
 *
 * Contact is not in the list at all. It used to be, and it was already dropped
 * from the bar at tablet width because the button two items along goes to the
 * same anchor — which is just as true of the phone sheet, where the link and
 * that same button end up adjacent. One argument, applied in both places.
 *
 * What came off the bar — Ons DNA, Aanpak, Digitale transformatie — is still
 * on the homepage in that order, read on the way down rather than aimed at.
 *
 * Jobs is last, and unlike Inzichten it is in the bar as well. Last rather than
 * beside the team page, which is where it belongs by subject, because a reader
 * who came to apply will find it wherever it is and a reader who did not should
 * meet the four services first. What it costs the row is measured in
 * `.site-nav` in `critical.css`.
 *
 * Home is first and it is not redundant with the brand link beside it. The
 * wordmark is the way home to anyone who has learnt that a wordmark is; it is
 * not labelled, it is not in the nav landmark, and it does not take the
 * `aria-current` the other items take, so on a detail page there was nothing in
 * the nav that named the page a reader is most likely to want next.
 */
const NAV_ITEMS = ['home', 'training', 'staffing', 'sdlc', 'processes', 'team', 'insights', 'jobs'];

/**
 * What the bar itself prints: home, the four services, the team page and jobs.
 * Inzichten is in `NAV_ITEMS` for the phone sheet and not for the bar, because
 * with four service names in the row there is no width left for a section that
 * is read on the way down the homepage anyway.
 *
 * Jobs is in both, and it is the one item in the row that was added knowing it
 * does not quite fit. Dutch and English had the free space for it; French did
 * not, and between 1181px and about 1240px the primary action there now stands
 * 31px inside the page gutter rather than on it. Nothing is clipped and nothing
 * overlaps — the arithmetic, the band and the lever if it ever has to be paid
 * back are in `.site-nav` in `critical.css`. It is bought because the
 * alternative was the footer and the phone sheet alone, and on a desk that is
 * one link at the bottom of the page for the one page a candidate arrives
 * looking for.
 *
 * The difference is emitted rather than painted over. Hiding a nav link in CSS
 * leaves it in every one of the site's HTML files at every width — never shown,
 * and out of the accessibility tree too, so it buys nothing for anyone — and it
 * puts what the bar contains in a stylesheet instead of here, where the next
 * person editing this list will look.
 */
const BAR_ITEMS = new Set(['home', 'training', 'staffing', 'sdlc', 'processes', 'team', 'jobs']);

/**
 * Where a nav key points from `lang`. A service, the team page and the insights
 * index resolve to a page, and to `null` in a language that page is not
 * published in; everything else is a homepage anchor, which every language has.
 *
 * Inzichten used to be the homepage's own `#insights` anchor, because there was
 * no index page to send it to. There is one now, so the sheet's "Inzichten"
 * lands on the archive rather than scrolling the homepage to a list of the same
 * four items.
 */
function navHref(key, lang, home) {
  if (key === 'home') return home;
  if (key === 'team') return teamPath(lang);
  if (key === 'jobs') return jobsPath(lang);
  if (key === 'insights') return insightsIndexPath(lang);
  if (SERVICE_PAGES[key]) return servicePath(key, lang);
  return `${home}#${key}`;
}

/**
 * What a nav item is called. A service has two names and this is the shorter of
 * them: `service.<key>.nav` for the bar and the sheet, `service.<key>.title` for
 * the homepage row and the page's own hero.
 *
 * It used to be one name in all three places, on the rule that a service named
 * twice is a service that will one day be named two different things. The rule
 * held while the offer was four items; it stopped holding when it became six.
 * Measured at 1181px, the narrowest width the bar is printed at, the four full
 * service names are 706px of a row that has 533px to give — the primary action
 * hung 53px past the window edge in French and `.shell` is `overflow: clip`, so
 * it was cut rather than scrolled to, which is why nothing said so. Adding Home
 * put it 113px past. The full names only fit again from about 1480px up.
 *
 * So the drift the old rule guarded against is bought deliberately and in one
 * place: the short name is a truncation of the long one and always its head
 * ("AI staffing en coaching" -> "AI staffing"), the two live on adjacent lines
 * in `src/i18n`, and the hero of the page the link opens states the full name
 * within a screen of the click. What is not allowed is a short name that is not
 * the long one's opening words: that is a second name, and then the two really
 * can say different things.
 */
function navLabel(key, t) {
  return SERVICE_PAGES[key] ? t(`service.${key}.nav`) : t(`nav.${key}`);
}

/**
 * Whether a nav key names the page currently being rendered. The four services
 * and the team page are keyed on their own page id; `insights` stands for the
 * whole section — the index and the four articles — and a service stands for
 * itself plus anything under it, so `training` matches `training-kata` too.
 *
 * The nav used to say nothing at all about where the reader was: on
 * `/nl/training/` the "Training" item looked and read exactly like the other
 * four, and the only `aria-current` in the document was on the language chip.
 */
function isCurrentNavItem(key, pageId) {
  if (!pageId) return false;
  if (key === 'insights') return pageId === 'insights' || pageId.startsWith('insight-');
  // A page below a service page is still in that service: `training-kata` is
  // part of Training, so the bar marks Training while the reader is on it. The
  // prefix is the service's own key plus a hyphen, which is why a page id below
  // one has to be named after it.
  return key === pageId || pageId.startsWith(`${key}-`);
}

/**
 * Which `aria-current` a marked nav item takes. `page` says "this link is the
 * page you are on"; an article is in the Inzichten section but is not the
 * Inzichten index, and a link that navigates away must not claim to be the
 * page. `true` is the token for that — the item is current in some other
 * sense — and it leaves the visual marker alone, which is right in both cases.
 */
function navCurrentValue(key, pageId) {
  return key === pageId ? 'page' : 'true';
}

/**
 * What the header's one action is on this page, and where it goes.
 *
 * It was `cta.talk` pointing at `#contact` on every page of the site, which is
 * right on the ten pages that carry a contact section and wrong on the two that
 * do not: on `/jobs/` and on the privacy notice the same anchor resolved to
 * `/nl/#contact`, so the primary action in the header threw the reader onto
 * another page with no warning. On the jobs page it was also the wrong ask —
 * applying happens on the vacancy, in Odoo, and this page's own argument is the
 * list one screen down.
 *
 * So two pages name their own. Jobs sends the reader to the vacancies, in the
 * page's own words, and the privacy notice sends them to a person: a legal page
 * is read by someone who wants to ask something, and mail is the channel the
 * notice itself names for a data request. Everywhere else this is unchanged.
 *
 * The phone's sticky bar and the menu sheet read the same function, so the
 * action a reader sees is the same one at every width.
 */
function headerAction(t, lang, pageId) {
  const home = pagePath(lang);

  if (pageId === 'jobs') {
    return { key: 'vacancies', href: '#vacancies', label: t('jobs.cta.vacancies') };
  }
  if (pageId === 'privacy') {
    return { key: 'mail', href: `mailto:${EMAIL}`, label: t('cta.mail') };
  }
  return { key: 'talk', href: `${home}#contact`, label: t('cta.talk') };
}

export function siteHeader({ t, lang, alternates, pageId }) {
  // Every section anchor is written against the homepage, so the header works
  // the same from a detail page as it does from the homepage itself: on `/nl/`
  // the browser treats `/nl/#insights` as a plain in-page jump.
  const home = pagePath(lang);
  const action = headerAction(t, lang, pageId);

  // A page that is not published in this language drops out of the nav rather
  // than pointing at an anchor no page carries.
  const items = NAV_ITEMS.map((key) => ({
    key,
    href: navHref(key, lang, home),
    label: navLabel(key, t),
    current: isCurrentNavItem(key, pageId)
  })).filter((item) => item.href !== null);

  // The key rides along as a modifier class so a single link stays nameable.
  const navLinks = items
    .filter(({ key }) => BAR_ITEMS.has(key))
    .map(
      ({ key, href, label, current }) => html`<a id="nav-link-${key}" class="nav-link nav-link--${key}${current ? ' is-current' : ''}" href="${href}"${current ? raw(` aria-current="${navCurrentValue(key, pageId)}"`) : ''}>${label}</a>`
    );

  // The disclosure is two panels in one: a compact dropdown from the point the
  // nav bar folds (768px), and a full-height sheet on a phone. Both carry the
  // same list the bar does; the sheet adds three things the header no longer
  // has room for down there — the primary action, the language chips and the
  // two ways to reach a person. All three are display:none above the phone
  // breakpoint, so the dropdown stays a plain list of links.
  const sheetLinks = items.map(
    ({ key, href, label, current }) => html`<a id="nav-sheet-link-${key}" class="nav-sheet__item${current ? ' is-current' : ''}" href="${href}"${current ? raw(` aria-current="${navCurrentValue(key, pageId)}"`) : ''}>${label}</a>`
  );

  return html`<header id="site-header" class="site-header">
  <div id="site-header-wedge" class="header-wedge" aria-hidden="true"><sa-node-field id="site-header-wedge-nodes"></sa-node-field></div>
  <a id="site-header-brand" class="brand-link" href="${pagePath(lang)}">${logoMark('field', 'site-header-logo')}<span id="site-header-brand-text">Smart<span id="site-header-brand-accent" class="brand-accent">Agents</span></span></a>
  <nav id="site-nav" class="site-nav" aria-label="${t('a11y.mainNav')}">
${join(navLinks)}
  </nav>
  <details id="nav-toggle" class="nav-toggle">
    <summary id="nav-toggle-summary"><span id="nav-toggle-label" class="nav-toggle__label">${t('nav.menu')}${CHEVRON}</span><span id="nav-toggle-burger" class="nav-toggle__burger" aria-hidden="true"><i id="nav-toggle-burger-bar-01"></i><i id="nav-toggle-burger-bar-02"></i></span></summary>
    <nav id="nav-sheet" class="nav-toggle__panel" aria-label="${t('a11y.menuNav')}">
${join(sheetLinks)}
    <a id="nav-sheet-cta" class="btn btn--primary nav-sheet__cta nav-sheet__cta--${action.key}" href="${action.href}">${action.label}</a>
${languageSwitcher(lang, alternates, t, 'nav-sheet', t('a11y.languageMenu'))}
    <div id="nav-sheet-facts" class="nav-sheet__facts">
      <a id="nav-sheet-fact-call" href="${PHONE_HREF}">${PHONE}</a>
      <a id="nav-sheet-fact-mail" href="mailto:${EMAIL}">${EMAIL}</a>
    </div>
    </nav>
  </details>
  <div id="site-header-actions" class="header-actions">
${languageSwitcher(lang, alternates, t, 'header', t('a11y.language'))}
    <a id="site-header-cta" class="btn btn--primary btn--sm" href="${action.href}">${action.label}</a>
  </div>
</header>`;
}

/**
 * The phone's action bar: a call button and the primary action, stuck to the
 * bottom edge. It exists because the header's own CTA is dropped on a phone —
 * without it there is no action on screen until the contact section scrolls
 * into view. `position: sticky`, not fixed, so it ends up under the footer at
 * the bottom of the page instead of covering it.
 */
export function mobileActions({ t, lang, pageId }) {
  const action = headerAction(t, lang, pageId);

  return html`<div id="mobile-actions" class="mobile-actions" data-hide-until="#main .hero .btn, #main .error-page .btn">
  <a id="mobile-actions-call" class="mobile-actions__call" href="${PHONE_HREF}">${t('cta.call')}</a>
  <a id="mobile-actions-talk" class="btn btn--primary mobile-actions__talk" href="${action.href}">${action.label}</a>
</div>`;
}

/**
 * The footer carries the company's identity because it has to. WER art. III.74
 * — the Belgian transposition of the e-commerce disclosure duty — asks for the
 * registered name and legal form, the geographic address of the seat, an
 * e-mail address, a phone number, the enterprise/VAT number and the register
 * court to be directly and permanently accessible. "Permanently" is what makes
 * this the footer rather than the privacy notice: the footer is on every page.
 *
 * It used to spend a full dark band and three stacked columns on that, which is
 * a screen of navy under every page for information nobody arrives wanting. It
 * is two rows of paper now, about 110px in all.
 *
 * Row one is the ways to reach a person: the two the disclosure duty asks for
 * on the left, and on the right the two destinations a reader may want that the
 * header does not carry. It briefly also carried the site's six page names, and they were
 * cut: the header is sticky, so five of the six are on screen at every scroll
 * position, and a second copy of a list that is already permanently visible is
 * not navigation, it is six more tab stops at the foot of every page.
 *
 * Inzichten is the sixth, and it stays. `BAR_ITEMS` drops it from the header
 * row because four service names fill that row, and the phone sheet that does
 * carry it is `display: none` above 1180px — so with the page names gone there
 * was exactly one link to the section left in a desk page, on the homepage.
 * A section with no route into it from five of the site's pages is a section
 * nobody reaches.
 *
 * Jobs is beside it and stays even though the bar carries it too. The bar
 * carries it from 1181px up and the phone sheet below that, so this is not the
 * only route in the way Inzichten's is — but the foot of the page is where a
 * reader who has read to the end of a service page looks for it, and it is one
 * line rather than one line lower with the privacy notice because a link
 * somebody is meant to look for goes in the row of destinations, not in the
 * legal line.
 *
 * The customer zone is not linked from here, or from anywhere public. It is a
 * password gate: the people who use it are given the URL, and a link to it in
 * the footer of every page advertises a locked door to everyone else.
 *
 * Row two is the disclosure as a single microline, with the privacy notice
 * opposite it and the copyright closing the corner the mark opens. A disclosure
 * is looked up, not read — what it needs is to be findable and complete, and
 * one line holding every fact in the order the register states them is both, at
 * a tenth of the page three columns cost. The notice sits here rather than with
 * the two links above it because it is the same kind of information: a reader
 * looking for what the site does with their data is already reading the row
 * that says who is doing it.
 *
 * The facts are the register's own, read off KBO/BCE for enterprise number
 * 1037.114.694 (seat Mijnschoolstraat 18, 3580 Beringen; legal form besloten
 * vennootschap) and the competent enterprise court from the FPS Justice
 * territorial-competence lookup for Beringen (Ondernemingsrechtbank Antwerpen,
 * afdeling Hasselt). Change one only against the register. The street and the
 * company name are `t()` keys with the same value in all three languages, so
 * nothing here is hard-coded text: only the city line, the legal form and the
 * court name actually translate, and they must stay able to. The copyright year
 * is the build's, not a string in three files that goes stale on 1 January.
 *
 * The dark field survives as one small wedge in the bottom-left corner holding
 * the mark — the header's wedge turned over, so the page opens and closes on
 * the same shape. It is a stamp rather than a link: the header is sticky, so
 * the brand one click from home is never off screen, and a second home link at
 * the foot of the page is one more thing in the tab order for nothing.
 */
export function siteFooter({ t, lang, pageId }) {
  const privacy = privacyPath(lang);
  const insights = insightsIndexPath(lang);
  const jobs = jobsPath(lang);

  // Both of these can be the page you are standing on, and on both of those
  // pages this is the only link to it in the chrome: the header bar drops
  // Inzichten (`BAR_ITEMS`) and never carried the notice at all, and the phone
  // sheet that does carry Inzichten is `display: none` above 1180px. So the
  // footer is where `aria-current` has to be said, the way the bar, the sheet
  // and the language switcher all say it.
  // `pageId === 'insights'` and not `isCurrentNavItem`: that helper answers
  // "is this nav item's *section* the one you are in", which is true on all
  // four articles too, and this link goes to the index rather than to them.
  // `aria-current="page"` means this page; on an article it told a screen
  // reader that a link navigating away was the page it was already on.
  const onInsights = raw(pageId === 'insights' ? ' aria-current="page"' : '');
  const onJobs = raw(pageId === 'jobs' ? ' aria-current="page"' : '');
  const onPrivacy = raw(pageId === 'privacy' ? ' aria-current="page"' : '');

  // The disclosure at its legal minimum: who, where, under which number, before
  // which court. Four facts, and each one is there because a statute asks for
  // it — art. 2:20 WVV wants the name, the legal form, the precise seat, the
  // enterprise number and "RPR" followed by the seat of the court; art. III.74
  // WER puts the enterprise number on every website of a registered entity; and
  // art. XII.6 WER adds the VAT identification, which in Belgium is the
  // enterprise number with `BE` in front of it, and the e-mail address, which
  // is the row above.
  //
  // What came out was wording. "Besloten vennootschap" is what "BV"
  // abbreviates and 2:20 takes the abbreviation, so the line said the legal
  // form twice. "RPR Ondernemingsrechtbank Antwerpen, afdeling Hasselt" named
  // the court where the statute asks only for its seat after the letters RPR.
  // The street and the town are one address and are printed as one item, though
  // they stay two keys because `schema.mjs` needs the street on its own for
  // `PostalAddress.streetAddress`.
  //
  // One label does double duty and it is worth knowing which: the enterprise
  // number and the VAT number are the same identifier in Belgium, the second
  // being the first with `BE` in front of it, so `footer.vat` states III.74's
  // ondernemingsnummer and XII.6's btw-identificatienummer in one string. That
  // is the only place where a required word was folded rather than dropped. If
  // it ever has to say "btw" in as many words, budget about 34px for it and
  // re-measure the line.
  //
  // Together: 1131px of type down to 727, which is what puts the whole
  // disclosure on one line from 1261px up rather than two everywhere under
  // 1780. `.footer-micro` in `main.css` carries the per-language figures and
  // the one caveat that matters — the line is measured in the platform face,
  // because no Geist binary is shipped yet.
  //
  // The facts are separated by the gap between them and by nothing else. They
  // used to carry a `·` in an `::after`, which put a break opportunity behind
  // the dot and so left one stranded at the end of every wrapped line: at
  // 11.5px a dangling mark reads as a speck of dirt. A register line separates
  // perfectly well on spacing, and spacing cannot strand.
  const seat = [
    ['name', t('footer.company')],
    ['address', `${t('footer.street')}, ${t('footer.city')}`],
    ['vat', t('footer.vat')],
    ['court', t('footer.rpr')]
  ].map(
    ([part, value]) => html`      <span id="site-footer-seat-${part}" class="footer-micro__item">${value}</span>`
  );

  return html`<footer id="site-footer" class="site-footer">
  <div id="site-footer-top" class="site-footer__row site-footer__top">
    <address id="site-footer-contact" class="footer-contact">
      <a id="site-footer-reach-mail" class="footer-contact__link" href="mailto:${EMAIL}">${EMAIL}</a>
      <a id="site-footer-reach-call" class="footer-contact__link" href="${PHONE_HREF}">${PHONE}</a>
    </address>
    <nav id="site-footer-nav" class="footer-nav" aria-label="${t('a11y.footerNav')}">
${insights ? html`      <a id="site-footer-link-insights" href="${insights}"${onInsights}>${t('nav.insights')}</a>
` : ''}${jobs ? html`      <a id="site-footer-link-jobs" href="${jobs}"${onJobs}>${t('nav.jobs')}</a>
` : ''}      <a id="site-footer-link-linkedin" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">LinkedIn<span id="site-footer-link-linkedin-hint" class="visually-hidden"> (${t('a11y.newTab')})</span></a>
    </nav>
  </div>
  <div id="site-footer-base" class="site-footer__row site-footer__base">
    <div id="site-footer-mark" class="footer-mark" aria-hidden="true">${logoMark('field', 'site-footer-logo')}</div>
    <div id="site-footer-seat" class="footer-micro">
${join(seat)}
    </div>
    <div id="site-footer-legalese" class="footer-legalese">
${privacy ? html`      <a id="site-footer-link-privacy" href="${privacy}"${onPrivacy}>${t('footer.privacy')}</a>
` : ''}      <span id="site-footer-copyright" class="footer-legalese__copyright">${t('footer.legal', { year: String(new Date().getFullYear()) })}</span>
    </div>
  </div>
</footer>`;
}

/**
 * Language switcher: real links to the same page, no JS (static-i18n §5).
 *
 * The header prints it twice — once in the header actions and once inside the
 * menu sheet, because on a phone the header has room for the brand and the
 * menu trigger and nothing else. Exactly one of the two is ever displayed, so
 * only one is ever in the accessibility tree; `prefix` keeps their ids apart
 * (element-ids §4).
 */
export function languageSwitcher(currentLang, alternates, t, prefix, label) {
  return html`<nav id="${prefix}-lang" class="lang-switcher" aria-label="${label || t('a11y.language')}">
  <ul id="${prefix}-lang-list">
${join(
    alternates.map((alt) => {
      const language = languages.find((entry) => entry.code === alt.code);
      const current = alt.code === currentLang;
      return html`    <li id="${prefix}-lang-item-${alt.code}"><a id="${prefix}-lang-link-${alt.code}" href="${new URL(alt.href).pathname}" lang="${alt.code}" hreflang="${alt.code}"${current ? raw(' aria-current="page"') : ''}><span id="${prefix}-lang-name-${alt.code}" class="visually-hidden">${language.name}</span><span id="${prefix}-lang-code-${alt.code}" aria-hidden="true">${alt.code}</span></a></li>`;
    })
  )}
  </ul>
</nav>`;
}
