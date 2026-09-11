// The AI staffing and coaching page: the detail page behind the "AI staffing en
// coaching" service row. Three blocks and nothing else — the page hero, the
// offer, the form — because the offer is the page.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { orbitRings } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * The three ways this offer reaches a team, and the order they open in. The
 * first is the one the page is titled after, so it stands open on arrival.
 */
const TRACKS = ['engineer', 'developers', 'business'];

export const page = {
  id: 'staffing',
  slugs: { nl: 'ai-staffing', en: 'ai-staffing', fr: 'ai-staffing' },

  /* One `Service` provided by the company node every page carries, and the trail
     back to the language root, both read off the keys the page prints. */
  schema: ({ t, lang, url }) => [
    serviceNode({ t, lang, url, key: 'staffing' }),
    breadcrumbNode([homeStep(t, lang), { name: t('service.staffing.title'), url }])
  ],

  render: ({ t, lang }) => {
    return html`<main id="main" tabindex="-1">

${hero(t)}
${tracks(t)}
${contact(t, lang)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — the shared page hero carrying this page's own shapes.
 *
 * An arch hung off the right flank and two pebbles that have come away from it
 * into the light half. The arch is the ground the page is set against; the
 * pebbles are what says the ground is not a wall, and they earn their licence
 * here because the arch itself is welded along three sides.
 *
 * The arch's box hangs past the hero's foot, so its tail runs on behind the
 * track panel — which is why that panel is opaque: the tail slides under it and
 * comes out in the gutter, tying the two blocks together with no rule.
 *
 * All three are `data-magnet-free`. The arch is sampled more densely than a
 * shape this size normally is: its free side is three turns of one curve, and a
 * pull reads as a fold rather than a swell if the sampling cannot follow it.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="staffing-hero" class="hero hero--page hero--staffing">
${orbitRings('staffing-hero')}
  <div id="staffing-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="staffing-hero-field-arch" class="field" data-magnet data-magnet-free data-magnet-pin="top,right,bottom" data-magnet-points="340" data-magnet-amp="46" data-clip="heroArch"><sa-node-field id="staffing-hero-nodes-arch"></sa-node-field></div>
    <div id="staffing-hero-field-pebble-a" class="field hero__pebble hero__pebble--a" data-magnet data-magnet-free data-magnet-points="200" data-magnet-amp="30" data-clip="heroPebbleA"><sa-node-field id="staffing-hero-nodes-pebble-a"></sa-node-field></div>
    <div id="staffing-hero-field-pebble-b" class="field hero__pebble hero__pebble--b" data-magnet data-magnet-free data-magnet-points="160" data-magnet-amp="24" data-clip="heroPebbleB"><sa-node-field id="staffing-hero-nodes-pebble-b"></sa-node-field></div>
  </div>
  <div id="staffing-hero-inner" class="hero__inner">
    <div id="staffing-hero-text" class="hero__text">
      <h1 id="staffing-hero-title">${t('staffing.hero.title')}</h1>
      <!-- The standfirst, and it is the page's own description key rather than
           a line of its own. Every hero on the site was eyebrow, headline, two
           buttons and then 300px of paper: on a 1280x800 laptop the first
           sentence saying who this is for arrived at y≈800, under the fold. The
           sentence already existed — it is the page's own search snippet — so it
           is printed from that key instead of written a second time, which is
           also the only way the page and the snippet can never drift apart. -->
      <div id="staffing-hero-actions" class="hero__actions">
        <a id="staffing-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="staffing-hero-cta-tracks" class="btn btn--ghost" href="#tracks">${t('staffing.cta.tracks')} <span id="staffing-hero-cta-tracks-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe we meewerken — the three tracks, one open at a time
 *
 * Three columns side by side read as a price table and the reader compares them;
 * rows that open let them pick the one that is theirs. The offer has never been
 * a choice between three — it is one of three, and which one is obvious from the
 * team asking.
 *
 * Every row is a `<details>` sharing a `name`, so the panel works with JS off,
 * and `<sa-accordion>` takes both over when it loads. The first row stands open,
 * so the block never arrives as three closed bars.
 *
 * The panel is opaque, sits above the hero's tail, and is flanked by the leaf in
 * the left gutter and the wedge under the far corner.
 * ------------------------------------------------------------------ */

/**
 * One track: a summary that is a name and three words, and a body it opens on.
 *
 * The three words under the name are gone — they were the paragraph the row
 * opens on, cut into noun phrases and printed above it, on a closed row where
 * the reader has not asked for any of it. "Past wanneer" stays: it is the one
 * sub-block that tells a reader whether this track is theirs.
 *
 * The name is an `<h3>`: `<summary>` takes heading content, and without one the
 * three offers this page exists to sell were the only named blocks on the site
 * missing from the heading outline.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.key    track key, also the id suffix
 * @param {boolean} options.open  whether the row stands open on arrival
 */
function track({ t, key, open }) {
  const id = `staffing-track-${key}`;

  return html`      <details id="${id}" class="track" name="staffing-track"${open ? ' open' : ''}>
        <summary id="${id}-summary" class="track__summary">
          <div id="${id}-head" class="track__head">
            <h3 id="${id}-title" class="track__title">${t(`staffing.track.${key}.title`)}</h3>
          </div>
          <span id="${id}-chevron" class="track__chevron" aria-hidden="true"></span>
        </summary>
        <div id="${id}-panel" class="track__panel">
          <div id="${id}-panel-inner" class="track__inner">
            <div id="${id}-copy" class="track__copy">
              <p id="${id}-body" class="track__body">${t(`staffing.track.${key}.body`)}</p>
              <p id="${id}-how" class="track__body">${t(`staffing.track.${key}.how`)}</p>
            </div>
            <div id="${id}-fit" class="track__fit">
              <p id="${id}-fit-label" class="track__fit-label">${t('staffing.track.fitLabel')}</p>
              <p id="${id}-fit-body" class="track__fit-body">${t(`staffing.track.${key}.fit`)}</p>
            </div>
          </div>
        </div>
      </details>`;
}

function tracks(t) {
  const rows = TRACKS.map((key, i) => track({ t, key, open: i === 0 }));

  return html`<section id="tracks" class="section" aria-labelledby="staffing-tracks-title">
  <div id="staffing-tracks-head" class="section__head">
    <h2 id="staffing-tracks-title" class="section-heading">${t('staffing.tracks.title')}</h2>
  </div>
  <div id="staffing-tracks-ground" class="tracks">
    <div id="staffing-tracks-leaf-slot" class="field-slot tracks__leaf" aria-hidden="true">
      <div id="staffing-tracks-leaf" class="field" data-magnet data-magnet-free data-magnet-pin="left" data-magnet-points="260" data-magnet-amp="34" data-clip="tracksLeaf"><sa-node-field id="staffing-tracks-leaf-nodes"></sa-node-field></div>
    </div>
    <div id="staffing-tracks-tail-slot" class="field-slot tracks__tail" aria-hidden="true">
      <div id="staffing-tracks-tail" class="field" data-magnet data-magnet-free data-magnet-points="220" data-magnet-amp="30" data-clip="tracksTail"><sa-node-field id="staffing-tracks-tail-nodes"></sa-node-field></div>
    </div>
    <sa-accordion id="staffing-tracks-panel" class="tracks__panel">
${join(rows)}
    </sa-accordion>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the two lines this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({ t, lang, prefix: 'staffing' });
}
