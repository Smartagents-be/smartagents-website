// Shared shell for every public page.
// The <head> order is prescribed by .claude/skills/fast-static-site/SKILL.md §2:
// meta -> inline critical CSS -> preloads -> stylesheet -> module script.
// No `modulepreload` for the entry: the script is in the head, so the preload
// scanner already finds it in the same pass, and `build.modulePreload: false`
// leaves no dependency chunks to warm.
//
// The visual frame comes from .claude/skills/smartagents-design/README.md.
import { html, raw, join, escapeHtml } from '../../build/lib/html.mjs';
import { languages, defaultLanguage, absolute, pagePath, pathOf } from '../../build/lib/i18n.mjs';
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
 * The services with a detail page of their own, keyed by the string the homepage
 * rows, the nav bar and the phone sheet are all built from. A service that is
 * not in here is a homepage row and nothing more.
 */
export const SERVICE_PAGES = {
  training: trainingPage,
  staffing: staffingPage,
  sdlc: sdlcPage,
  processes: processesPage
};

/**
 * URL of a service's detail page in this language, or null: either the service
 * has no page, or that page is not published in this language.
 */
export function servicePath(key, lang) {
  return pathOf(SERVICE_PAGES[key], lang);
}

/** URL of the team page in this language, or null where it is not published. */
export function teamPath(lang) {
  return pathOf(teamPage, lang);
}

/** URL of the jobs page in this language, or null where it is not published. */
export function jobsPath(lang) {
  return pathOf(jobsPage, lang);
}

/** URL of the privacy notice in this language, or null where it is not published. */
export function privacyPath(lang) {
  return pathOf(privacyPage, lang);
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

  /* The brand card from `scripts/make-social-images.mjs` unless the page brings
     its own — an article uses its thumbnail, the picture the reader sees again
     at the top of the page they land on. */
  const share = ctx.ogImage || OG_IMAGE;

  /* An article says so in the head as well as the DOM: the date reached nothing
     a crawler reads, and `og:type` said "website" on a page that is not one. */
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

  // `<` escaped rather than trusted: a `</script>` in a description would end
  // the block and put the rest of the JSON in the document.
  const schema = JSON.stringify(schemaGraph({ t: ctx.t, extra: ctx.schema || [] })).replace(/</g, '\\u003c');

  /* Speculation Rules: prefetch broadly on hover/pointerdown
     (fast-static-site §7). `/media/*` is excluded with `/secured/*` — the two
     course one-pagers are ~200 KB each and the training page links both, so an
     eye down the offer pulled half a megabyte nobody asked for. The hover
     fallback in `src/app.js` carries the same exclusion. */
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
${clipDefs(ctx.body)}
<div id="site-shell" class="shell">
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
 * The mark is drawn in `currentColor`, so the two variants are only a colour and
 * the header can fall back to the paper one when its wedge is dropped.
 *
 * @param {'ink'|'field'} surface — which surface the mark sits on.
 * @param {string} id — element id for the SVG root; every part is named from it,
 *   so it is required rather than optional (element-ids §1).
 */
export function logoMark(surface, id) {
  const opacity = surface === 'field' ? ['0.62', '0.42'] : ['0.6', '0.4'];
  // Every part of the mark is nameable too (element-ids §1), derived from the
  // root's id so two marks on one page keep their parts apart.
  const at = (part) => raw(`id="${escapeHtml(id)}-${part}" `);

  return html`<svg id="${id}" class="logo logo--${surface}" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
<g ${at('edges')}stroke="currentColor" stroke-width="1.5" opacity="${opacity[0]}"><path ${at('edge-paths')}d="M24 8 12 20M24 8l12 12M12 20l12 4M36 20l-12 4M12 20v12M36 20v12M24 24v16M12 32l12 8M36 32l-12 8"/></g>
<g ${at('nodes')}fill="currentColor"><circle ${at('node-top')}cx="24" cy="8" r="4"/><circle ${at('node-upper-left')}cx="12" cy="20" r="3"/><circle ${at('node-upper-right')}cx="36" cy="20" r="3"/><circle ${at('node-centre')}cx="24" cy="24" r="3.5"/><circle ${at('node-lower-left')}cx="12" cy="32" r="2.5"/><circle ${at('node-lower-right')}cx="36" cy="32" r="2.5"/><circle ${at('node-bottom')}cx="24" cy="40" r="3"/></g>
<circle ${at('halo')}cx="24" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1" opacity="${opacity[1]}"/>
</svg>`;
}

/**
 * The orbit diagram behind a hero: five concentric rings from one origin off the
 * left edge, three carrying a node that travels and fades. Pure texture, so it
 * is `aria-hidden`. The fourth node is opt-in — it only reads on a ground tall
 * enough to give the outermost ring room.
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

/** `01`-style two-digit index: numbers act as the icons in this system. */
export const index = (n) => String(n).padStart(2, '0');

const CHEVRON = raw(
  '<span id="nav-toggle-chevron" class="nav-chevron" aria-hidden="true"><svg id="nav-toggle-chevron-mark" width="9" height="6" viewBox="0 0 9 6" fill="none"><path id="nav-toggle-chevron-path" d="M1 1.2 4.5 4.6 8 1.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
);

/* ------------------------------------------------------------------ *
 * Clip paths: the angular cuts that make every dark shape
 * ------------------------------------------------------------------ */

/**
 * One hidden <svg> per document holding every clip path the page references, in
 * `objectBoundingBox` units so the silhouettes scale with their element.
 */
/* Every silhouette on the site, as a path in the unit square of its box.
 * Winding is not free: a magnet may append a join's contour as an extra subpath,
 * and `clip-rule: nonzero` reads a loop wound against the body it overlaps as a
 * hole. `src/motion.js` turns the join to match each path's measured winding, so
 * a path may be drawn either way round — but a shape that grows a second subpath
 * of its own has to agree with itself. */
/* The two pebbles, named once. `src/motion.js` rewrites a clip path's `d` in
 * place, so two magnets naming the same clip fight over one element and the
 * first shape is left drawn into the wrong box — every magnet on a page needs
 * its own id, and the businessprocessen hero has four pebbles in a line. These
 * constants are how four ids carry two drawings without copied paths. */
const PEBBLE_A =
  'M0.020,0.470 C0.035,0.225 0.190,0.055 0.430,0.022 C0.665,-0.010 0.945,0.135 0.982,0.398 C1.018,0.640 0.900,0.878 0.655,0.972 C0.430,1.058 0.115,0.905 0.045,0.690 C0.028,0.635 0.012,0.560 0.020,0.470 Z';
const PEBBLE_B =
  'M0.010,0.430 C0.030,0.190 0.210,0.030 0.470,0.020 C0.720,0.010 0.985,0.180 0.995,0.430 C1.005,0.680 0.830,0.960 0.560,0.990 C0.320,1.015 0.060,0.850 0.020,0.620 C0.012,0.560 0.005,0.495 0.010,0.430 Z';

/**
 * Shapes a page needs that its markup never names, keyed by the one it does:
 * `heroSwoop` is what every hero silhouette becomes below 620px, and
 * `dnaFieldMask` holds the rotating helix inside the disc. Both are a
 * stylesheet reaching for a second path on the page's behalf. A third one
 * belongs here too — `check-dist.mjs` fails the build on a `clip-path:
 * url(#id)` with no `<clipPath>` behind it.
 */
const CLIP_ALSO = {
  heroPetal: ['heroSwoop'],
  heroArch: ['heroSwoop'],
  sdlcHeroRidge: ['heroSwoop'],
  processLobe: ['heroSwoop'],
  jobsJoin: ['heroSwoop'],
  dnaField: ['dnaFieldMask']
};

/**
 * Which of the silhouettes below this page actually uses. The body is rendered
 * before the shell wraps it (`basePage`), so the markup can simply be asked;
 * emitting all twenty-two put 7.4 KB of path data in every page, including the
 * five that draw no dark shape at all.
 *
 * @param {string} body — the page's rendered markup.
 */
function clipsUsed(body) {
  const used = new Set();
  for (const match of String(body).matchAll(/data-clip="([A-Za-z]+)"/g)) {
    used.add(match[1]);
    for (const extra of CLIP_ALSO[match[1]] || []) used.add(extra);
  }
  return used;
}

export function clipDefs(body) {
  const used = clipsUsed(body);
  const paths = {
    // hero: a petal hung off the right edge, pinching almost shut at mid-height
    // where the copy passes. Below 940px it becomes a band under the copy.
    heroPetal:
      'M1,0.000 C0.930,0.124 0.800,0.227 0.600,0.281 C0.400,0.335 0.132,0.396 0.052,0.484 C0.008,0.532 0.030,0.578 0.114,0.620 C0.198,0.662 0.348,0.694 0.520,0.734 C0.700,0.776 0.858,0.822 0.930,0.888 C0.976,0.930 1.000,0.958 1,1.000 Z',
    // hero, the counter-shape: a lobe rising out of the bottom-left to a rounded
    // tip, so the pair reads bottom-left to top-right rather than as a mirror.
    heroLobe:
      'M0,0.000 C0.032,0.155 0.090,0.315 0.175,0.450 C0.258,0.552 0.382,0.620 0.530,0.660 C0.642,0.690 0.732,0.708 0.800,0.708 C0.8263,0.708 0.8476,0.7286 0.8476,0.754 C0.8476,0.7794 0.8263,0.800 0.800,0.800 C0.560,0.812 0.320,0.826 0.170,0.878 C0.090,0.908 0.030,0.962 0,1 Z',
    // hero on a phone: the petal reduced to the sliver that fits beside one
    // column of copy. Welded to the top and the right, free of the other two.
    heroSwoop:
      'M0.670,0.000 C0.772,0.074 0.848,0.148 0.890,0.214 C0.922,0.270 0.912,0.324 0.878,0.368 C0.848,0.408 0.876,0.452 0.928,0.492 C0.966,0.522 0.990,0.552 1.000,0.578 L1.000,0.000 Z',
    // Ons DNA: a disc, and the same silhouette again as a mask for the helix
    dnaField:
      'M0.700,0.000 C0.884,0.000 1.000,0.096 1.000,0.226 C1.000,0.354 0.868,0.416 0.734,0.450 C0.662,0.469 0.620,0.518 0.614,0.626 C0.601,0.860 0.478,1.000 0.298,1.000 C0.112,1.000 0.000,0.890 0.000,0.750 C0.000,0.614 0.150,0.560 0.284,0.526 C0.350,0.509 0.394,0.466 0.400,0.352 C0.410,0.126 0.522,0.000 0.700,0.000 Z',
    dnaFieldMask:
      'M0.700,0.000 C0.884,0.000 1.000,0.096 1.000,0.226 C1.000,0.354 0.868,0.416 0.734,0.450 C0.662,0.469 0.620,0.518 0.614,0.626 C0.601,0.860 0.478,1.000 0.298,1.000 C0.112,1.000 0.000,0.890 0.000,0.750 C0.000,0.614 0.150,0.560 0.284,0.526 C0.350,0.509 0.394,0.466 0.400,0.352 C0.410,0.126 0.522,0.000 0.700,0.000 Z',
    // The small companion. The four handles are set by curvature rather than by
    // eye, so the radius runs on across each join instead of stepping — drawn by
    // eye the flank stepped 66px to 84px and read as a flat spot. Move an anchor
    // and the lengths want refitting.
    dnaBlob:
      'M0.330,0.045 C0.560,-0.030 0.800,0.115 0.910,0.345 C1.020,0.580 0.980,0.845 0.790,0.955 C0.600,1.060 0.3360,0.9882 0.180,0.775 C0.0466,0.5910 0.0048,0.3312 0.140,0.170 C0.1884,0.1128 0.260,0.068 0.330,0.045 Z',
    // Hoe een cursus verloopt: a stone on the hairline the tour hangs from. It
    // stands on a fifth of its own width, so the cursor rocks it without lifting.
    tourStone:
      'M0.560,1.000 C0.740,0.995 0.880,0.930 0.945,0.800 C1.000,0.688 0.980,0.545 0.895,0.430 C0.800,0.302 0.640,0.190 0.470,0.120 C0.330,0.062 0.210,0.048 0.140,0.100 C0.060,0.160 0.030,0.320 0.055,0.510 C0.082,0.716 0.180,0.900 0.300,0.970 C0.375,1.014 0.450,1.004 0.560,1.000 Z',
    // The counterweight under the agentic engineering course: flat top welded to
    // the rule that closes the offer, free-hand underside running out long and
    // shallow to the right. The one easing lifts 4px over 37px, which is about
    // the limit — twice that and the underside reads as scallops.
    tourDome:
      'M0,0 L1,0 C0.978,0.150 0.835,0.330 0.780,0.330 C0.742,0.330 0.698,0.295 0.660,0.295 C0.560,0.295 0.340,1.000 0.230,1.000 C0.130,1.000 0.018,0.560 0,0 Z',
    // AI staffing en coaching: an arch, one long descent from the top edge down
    // to the bottom right corner. Three turns of the same curve, each easing out
    // of the last, because struck as a single sweep it reads as a bevel — and
    // each catch is a place the cursor has something to pull on. Opened up to
    // fill the corner it stops being a shape hung off an edge and becomes ground.
    heroArch:
      'M0.300,0 C0.520,0.070 0.610,0.180 0.600,0.320 C0.592,0.440 0.660,0.520 0.760,0.590 C0.860,0.660 0.900,0.730 0.890,0.830 C0.884,0.910 0.930,0.970 1,1 L1,0 Z',
    // The two pebbles that fall away from the arch into the light half of the
    // hero. Both off-round — a circle beside a hand-drawn arch reads as a bullet
    // — with the flatter side on the larger, so the pair has a heavy and a light.
    // `heroPebbleA` is not the staffing page's alone: the training hero stands
    // one above the petal's shoulder (`.hero__bead`), so redrawing it moves both.
    heroPebbleA: PEBBLE_A,
    heroPebbleB: PEBBLE_B,
    // The two smaller blobs of the businessprocessen line. Separate ids because
    // two magnets may not share a clip; two drawings because a third within a few
    // points of these would be drift. Each is one pebble mapped into its place in
    // the shared composition box — every blob carries the *whole* box, because a
    // box drawn tight around one cannot hold a union reaching its neighbour.
    processBeadA:
      'M0.002,0.150 C0.006,0.066 0.042,0.010 0.094,0.007 C0.144,0.003 0.197,0.063 0.199,0.150 C0.201,0.236 0.166,0.334 0.112,0.344 C0.064,0.353 0.012,0.296 0.004,0.216 C0.002,0.195 0.001,0.172 0.002,0.150 Z',
    processBeadC:
      'M0.520,0.503 C0.522,0.461 0.540,0.434 0.565,0.432 C0.590,0.431 0.616,0.460 0.617,0.503 C0.617,0.545 0.600,0.593 0.574,0.598 C0.550,0.603 0.525,0.574 0.521,0.535 C0.520,0.525 0.519,0.514 0.520,0.503 Z',
    processBeadB:
      'M0.245,0.348 C0.248,0.249 0.284,0.181 0.339,0.168 C0.394,0.155 0.458,0.213 0.467,0.319 C0.475,0.416 0.448,0.511 0.391,0.549 C0.339,0.584 0.267,0.522 0.250,0.436 C0.246,0.414 0.243,0.384 0.245,0.348 Z',
    // "Hoe we meewerken": a leaf in the left page gutter beside the track panel,
    // pinching twice on the way down so the gutter carries movement, not a bar.
    tracksLeaf:
      'M0,0.030 C0.350,0.015 0.780,0.045 0.850,0.115 C0.905,0.175 0.740,0.265 0.560,0.340 C0.400,0.407 0.290,0.470 0.330,0.545 C0.372,0.622 0.640,0.560 0.780,0.630 C0.905,0.693 0.870,0.760 0.700,0.828 C0.520,0.898 0.240,0.950 0,0.985 Z',
    // The counterweight to the leaf, under the far corner of the same panel, so
    // the panel sits between two shapes on a diagonal.
    tracksTail:
      'M0.010,0 C0.012,0.340 0.055,0.610 0.130,0.720 C0.205,0.825 0.310,0.872 0.450,0.878 L0.520,0.878 C0.640,0.878 0.655,0.640 0.745,0.420 C0.815,0.250 0.905,0.105 1,0.055 L1,0 Z',
    // AI-native SDLC: a ridge on the flank the petal is a leaf on — a short
    // shoulder, a neck pulled back almost to the page edge where the headline
    // passes, one long lobe below. Narrow once, open twice.
    //
    // At a turn this tight the handles have to be longer than the segment looks
    // like it wants: two drafts cusped at the neck and read as a chevron.
    //
    // The ridge occupies the right 0.786 of its box, the left quarter holding
    // `sdlcOrbNear` and `sdlcOrbFar` — a shape paints only its own box, so an orb
    // outside it would not be painted at all, and sharing one box is what lets
    // any of the three host a join. The three band insets that keep the ridge
    // drawing its old pixels are in main.css.
    sdlcHeroRidge:
      'M1.000,0.000 C0.898,0.040 0.670,0.070 0.670,0.180 C0.670,0.290 0.780,0.320 0.780,0.430 C0.780,0.540 0.458,0.550 0.458,0.700 C0.458,0.850 0.878,0.965 1.000,1.000 Z',
    // The two orbs in the bay the ridge's neck opens. Each sits in the middle
    // 0.588 of its own **square** slot: the ridge's box runs 1.2 to 2.9 in aspect
    // and stretches with it, but an orb that stretches is a flat disc. The slot
    // is 1.7 times the orb across so its grown box still contains the join window
    // between the two — a union traced outside a box is cut off at the edge.
    sdlcOrbNear:
      'M0.218,0.482 C0.227,0.338 0.318,0.238 0.459,0.219 C0.597,0.200 0.762,0.285 0.783,0.440 C0.805,0.582 0.735,0.722 0.591,0.778 C0.459,0.828 0.274,0.738 0.232,0.612 C0.222,0.579 0.213,0.535 0.218,0.482 Z',
    sdlcOrbFar:
      'M0.212,0.459 C0.224,0.318 0.329,0.224 0.482,0.218 C0.629,0.212 0.785,0.312 0.791,0.459 C0.797,0.606 0.694,0.770 0.535,0.788 C0.394,0.803 0.241,0.706 0.218,0.571 C0.213,0.535 0.209,0.497 0.212,0.459 Z',
    // AI-native businessprocessen: the end of a chain, and the only silhouette on
    // the site that does not fill its own box. The hero is five blobs in a line,
    // small to large; this is the largest, and nothing is fused until the cursor
    // runs two of them together.
    //
    // **It occupies the bottom-right quarter of its box and leaves the rest
    // empty, and that is the whole trick.** A join is written into the first
    // shape in DOM order whose box reaches the window, and anything outside that
    // box is cut off — two pebbles joining at the far end of the line are hosted
    // here anyway, and a tight box rendered them with a straight chord sliced
    // out. So the box is drawn around the whole composition with 140px of `BLEED`
    // to spare, and the blob authored into one corner of it.
    //
    // The cost is that this path cannot be read as a silhouette on its own. It is
    // `heroPebbleA` mapped into that rectangle, so redrawing that moves this;
    // moving the composition means remapping this, in the same pass.
    processLobe:
      'M0.668,0.688 C0.673,0.544 0.726,0.444 0.807,0.424 C0.887,0.406 0.981,0.491 0.994,0.646 C1.006,0.788 0.966,0.928 0.883,0.984 C0.807,1.034 0.700,0.944 0.677,0.818 C0.671,0.785 0.666,0.741 0.668,0.688 Z',
    // Jobs: the only silhouette on the public site welded to nothing at all. It
    // floats in the hero's right flank with paper all the way round, which the
    // site otherwise only does at pebble scale beside the staffing arch.
    //
    // **Closing it is the point.** Welded to the header's hairline — four drafts
    // — the outline ran corner to corner and the top edge closed it, so the
    // silhouette had two corners in it and the union's contour was cut in half.
    // Free, the trace is the whole loop: two lobes running together with a
    // concave fillet on both sides of the neck and no corner anywhere. That is
    // the metaball union `src/motion.js` draws, standing still.
    //
    // The lobes are (0.28, 0.26) r 0.16 x 0.184 and (0.72, 0.68) r 0.32 x 0.256
    // turned -25°, traced at the 1 contour and resampled into sixteen anchors.
    // Four numbers carry it:
    //
    // **Solidity 0.82** — outline area over convex hull — is the test it is held
    // to, and the one that catches every earlier draft: a blob with no waist
    // measures 1.00, and a row-by-row width scan misses it because the waist is
    // *diagonal*. **The neck is 0.174 of the box** at 0.32 along the axis; any
    // thinner folds under the cursor (see `src/pages/jobs.mjs`). **The belly is
    // an ellipse turned -25°** — axis-aligned it fits a circle, and a true disc
    // at 70% of the ink is the bullet `clipDefs()` refuses. **The offset is
    // diagonal**: stacked square it is a vase, and symmetry about a vertical axis
    // is what makes a shape read as furniture.
    //
    // The path is fitted to its box after tracing (`fitDrawn`). A cubic runs
    // outside its own anchors, and an earlier draft's control points reached
    // x 1.029 — the ink sat 6px past the box positioning it, so every inset in
    // the CSS was measuring a shape that is not the one on screen. That is what
    // lets `right: var(--gutter-page)` put the ink *on* the content edge, and why
    // the box's aspect is the traced loop's own 1.04.
    jobsJoin:
      'M0.001,0.201 C-0.004,0.265 0.025,0.354 0.069,0.400 C0.111,0.446 0.216,0.436 0.258,0.476 C0.295,0.512 0.294,0.572 0.304,0.629 C0.317,0.694 0.298,0.782 0.327,0.842 C0.356,0.900 0.422,0.956 0.482,0.980 C0.541,1.005 0.623,1.004 0.688,0.991 C0.753,0.977 0.824,0.941 0.873,0.896 C0.925,0.850 0.975,0.784 0.991,0.719 C1.007,0.655 1.002,0.565 0.971,0.508 C0.941,0.453 0.869,0.405 0.807,0.382 C0.746,0.361 0.668,0.369 0.601,0.376 C0.532,0.382 0.432,0.452 0.398,0.425 C0.362,0.398 0.407,0.283 0.390,0.217 C0.373,0.151 0.344,0.063 0.295,0.029 C0.247,-0.004 0.147,-0.011 0.100,0.018 C0.049,0.047 0.005,0.137 0.001,0.201 Z'
  };

  const defs = Object.entries(paths)
    .filter(([id]) => used.has(id))
    .map(
      ([id, d]) => html`<clipPath id="${id}" clipPathUnits="objectBoundingBox"><path id="${id}-path" d="${d}"/></clipPath>`
    );

  // No dark shape on the page: print nothing rather than an empty `<defs>`.
  if (!defs.length) return '';

  return html`<svg id="site-clip-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs id="site-clip-defs-list">${join(defs, '')}</defs></svg>`;
}

/* ------------------------------------------------------------------ *
 * Header and footer
 * ------------------------------------------------------------------ */

/**
 * The nav in reading order: the homepage, every service with a page behind it,
 * the team page, and the one homepage section a reader arrives looking for.
 *
 * Contact is not in the list at all: the button two items along goes to the same
 * anchor, in the bar and in the sheet alike. Jobs is last rather than beside the
 * team page, where it belongs by subject, because a reader who came to apply
 * will find it anywhere and a reader who did not should meet the services first;
 * what it costs the row is measured in `.site-nav` in `critical.css`.
 *
 * Home is first and is not redundant with the brand link beside it: the wordmark
 * is unlabelled, outside the nav landmark, and never takes `aria-current`.
 */
const NAV_ITEMS = ['home', 'training', 'staffing', 'sdlc', 'processes', 'team', 'insights', 'jobs'];

/**
 * What the bar itself prints. Inzichten is in `NAV_ITEMS` for the phone sheet
 * alone: with four service names in the row there is no width left for a section
 * read on the way down the homepage anyway.
 *
 * Jobs is in both, and was added knowing it does not quite fit — in French,
 * between 1181px and about 1240px, the primary action now stands 31px inside the
 * page gutter rather than on it. Nothing is clipped; the arithmetic and the
 * lever are in `.site-nav` in `critical.css`.
 *
 * The difference is emitted rather than painted over: a nav link hidden in CSS
 * ships in every HTML file at every width, buys nothing for anyone, and puts
 * what the bar contains in a stylesheet instead of here.
 */
const BAR_ITEMS = new Set(['home', 'training', 'staffing', 'sdlc', 'processes', 'team', 'jobs']);

/**
 * Where a nav key points from `lang`. A service, the team page and the insights
 * index resolve to a page, and to `null` in a language it is not published in;
 * everything else is a homepage anchor, which every language has.
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
 * What a nav item is called: `service.<key>.nav` for the bar and the sheet,
 * `service.<key>.title` for the homepage row and the page's own hero.
 *
 * One name in all three places held while the offer was four items. Measured at
 * 1181px, the narrowest width the bar is printed at, four full service names are
 * 706px of a row with 533px to give: the primary action hung 53px past the
 * window edge in French, and `.shell` is `overflow: clip`, so it was cut rather
 * than scrolled to. The full names only fit again from about 1480px up.
 *
 * So the drift is bought deliberately, under one rule: the short name is always
 * the long one's opening words ("AI staffing en coaching" -> "AI staffing"), the
 * two sit on adjacent lines in `src/i18n`, and the page's hero states the full
 * name within a screen of the click. A short name that is not the long one's
 * head is a second name, and then the two really can say different things.
 */
function navLabel(key, t) {
  return SERVICE_PAGES[key] ? t(`service.${key}.nav`) : t(`nav.${key}`);
}

/**
 * Whether a nav key names the page being rendered. The services and the team
 * page are keyed on their own page id; `insights` stands for the index and the
 * four articles, and a service stands for itself plus anything under it.
 */
function isCurrentNavItem(key, pageId) {
  if (!pageId) return false;
  if (key === 'insights') return pageId === 'insights' || pageId.startsWith('insight-');
  // A page below a service is still in that service, on the prefix alone — which
  // is why a page id below one has to be named after it.
  return key === pageId || pageId.startsWith(`${key}-`);
}

/**
 * Which `aria-current` a marked nav item takes. `page` says "this link is the
 * page you are on"; an article is in the Inzichten section but is not its index,
 * and a link that navigates away must not claim to be the page. `true` is the
 * token for current-in-some-other-sense, and leaves the visual marker alone.
 */
function navCurrentValue(key, pageId) {
  return key === pageId ? 'page' : 'true';
}

/**
 * What the header's one action is on this page, and where it goes.
 *
 * `cta.talk` at `#contact` is right on the ten pages that carry a contact
 * section and wrong on the two that do not, where the anchor resolved to
 * `/nl/#contact` and threw the reader onto another page. So jobs sends them to
 * the vacancies one screen down, and the privacy notice to a person by mail,
 * which is the channel the notice itself names for a data request.
 *
 * The menu sheet reads this too, so the action is the same at every width.
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
  // the same from a detail page: on `/nl/` the browser treats `/nl/#insights`
  // as a plain in-page jump.
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

  // The disclosure is two panels in one: a compact dropdown from 768px and a
  // full-height sheet on a phone. The sheet adds the three things the header has
  // no room for down there — the action, the chips, the two contact facts — and
  // all three are display:none above the phone breakpoint.
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
 * The footer carries the company's identity because it has to. WER art. III.74 —
 * the Belgian transposition of the e-commerce disclosure duty — asks for the
 * registered name and legal form, the seat, an e-mail address, a phone number,
 * the enterprise/VAT number and the register court to be directly and
 * *permanently* accessible, and permanently is what makes this the footer.
 *
 * Row one is the ways to reach a person, plus the two destinations the header
 * does not carry. The site's page names were cut from it: the header is sticky,
 * so a second copy of a permanently visible list is six more tab stops rather
 * than navigation. Inzichten stays because `BAR_ITEMS` drops it from the bar and
 * the phone sheet is hidden above 1180px — without this there is one link to the
 * section in a desk page. Jobs stays because the foot of a service page is where
 * a reader who has read to the end looks for it.
 *
 * The customer zone is not linked from here or anywhere public: it is a password
 * gate, and a link in every footer advertises a locked door.
 *
 * Row two is the disclosure as a single microline, with the privacy notice
 * opposite and the copyright closing the corner the mark opens. A disclosure is
 * looked up, not read; one line holding every fact in the register's order is
 * findable and complete at a tenth of what three columns cost.
 *
 * The facts are the register's own, read off KBO/BCE for enterprise number
 * 1037.114.694 and the FPS Justice territorial-competence lookup for Beringen.
 * Change one only against the register. Only the city line, the legal form and
 * the court name actually translate, and they must stay able to; the copyright
 * year is the build's.
 *
 * The wedge in the corner is the header's turned over, so the page opens and
 * closes on the same shape. A stamp, not a link: the header is sticky, so the
 * brand one click from home is never off screen.
 */
export function siteFooter({ t, lang, pageId }) {
  const privacy = privacyPath(lang);
  const insights = insightsIndexPath(lang);
  const jobs = jobsPath(lang);

  // Both of these can be the page you are standing on, and on both this is the
  // only link to it in the chrome. `pageId === 'insights'` and not
  // `isCurrentNavItem`: that helper answers "is this item's section the one you
  // are in", which is true on all four articles, and `aria-current="page"` on an
  // article would tell a screen reader a link navigating away was this page.
  const onInsights = raw(pageId === 'insights' ? ' aria-current="page"' : '');
  const onJobs = raw(pageId === 'jobs' ? ' aria-current="page"' : '');
  const onPrivacy = raw(pageId === 'privacy' ? ' aria-current="page"' : '');

  // The disclosure at its legal minimum: who, where, under which number, before
  // which court. Art. 2:20 WVV wants the name, the legal form, the precise seat,
  // the enterprise number and "RPR" followed by the seat of the court; art.
  // III.74 WER puts the enterprise number on every website of a registered
  // entity; art. XII.6 WER adds the VAT identification and the e-mail address,
  // which is the row above.
  //
  // One label does double duty: in Belgium the VAT number is the enterprise
  // number with `BE` in front, so `footer.vat` states both requirements in one
  // string. If it ever has to say "btw" in as many words, budget about 34px and
  // re-measure the line. Together the wording trims took 1131px of type down to
  // 727, which is what puts the whole disclosure on one line from 1261px up.
  //
  // The facts are separated by the gap between them and nothing else: a `·` in
  // an `::after` put a break opportunity behind the dot and stranded one at the
  // end of every wrapped line.
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
 * The header prints it twice — in the header actions and inside the menu sheet —
 * and exactly one is ever displayed, so only one is ever in the accessibility
 * tree. `prefix` keeps their ids apart (element-ids §4).
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
