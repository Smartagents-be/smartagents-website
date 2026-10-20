// The AI staffing page: the detail page behind the "AI staffing" service row.
// Three blocks and nothing else — the page hero, the offer, the form — because
// the offer is the page. The two coaching tracks that stood beside it moved to
// the training page, which is "AI training en coaching" now.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { track } from '../components/tracks/tracks.mjs';
import { index, orbitRings } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * What the engineer track's panel says, in order, as keys under
 * `staffing.track.engineer.` — see `copyBlock()` in `tracks.mjs`.
 */
const COPY = [
  { lead: 'lead' },
  'intro.1',
  'intro.2',
  { h: 'embedded.title' },
  'embedded.body',
  { h: 'more.title' },
  'more.body',
  { list: 'more.point', n: 3 },
  { h: 'ownership.title' },
  'ownership.body'
];

/** The selection, in the order every candidate goes through it. */
const SELECTION = [1, 2, 3, 4, 5];

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
${selection(t)}
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
        <a id="staffing-hero-cta-tracks" class="btn btn--ghost" href="#tracks">${t('staffing.cta.tracks')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe we meewerken — the one track, standing open
 *
 * This was three rows that opened one at a time: the engineer track and two
 * coaching tracks. Coaching is on the training page now, and an accordion of
 * one row is a control that can only hide the page, so the track stands open in
 * the same panel with no chevron.
 *
 * The panel is opaque, sits above the hero's tail, and is flanked by the leaf in
 * the left gutter and the wedge under the far corner.
 * ------------------------------------------------------------------ */

function tracks(t) {
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
    <div id="staffing-tracks-panel" class="tracks__panel">
${track({ t, id: 'staffing-track-engineer', base: 'staffing.track.engineer', copy: COPY })}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Zo vinden we jouw engineer — the selection, in five steps
 *
 * Between the offer and the form, because it answers the question a reader has
 * once they want the offer: how do you know the person you send is good? The
 * homepage's `.steps` vocabulary, as on the businessprocessen page: a sequence
 * every candidate runs in order, so there is nothing to open or pick between.
 *
 * Nothing here is a number we have not committed to — no days to a shortlist,
 * no replacement guarantee. Those belong in the steps the day they are promises.
 * ------------------------------------------------------------------ */

function selection(t) {
  const steps = SELECTION.map((n) => {
    const id = `staffing-selection-${index(n)}`;

    return html`    <div id="${id}" class="step${n === 1 ? ' step--first' : ''}">
      <span id="${id}-index" class="step__index" aria-hidden="true">${index(n)}</span>
      <h3 id="${id}-title">${t(`staffing.selection.${index(n)}.title`)}</h3>
      <p id="${id}-body">${t(`staffing.selection.${index(n)}.body`)}</p>
    </div>`;
  });

  return html`<section id="selection" class="section" aria-labelledby="staffing-selection-title">
  <div id="staffing-selection-head" class="section__head">
    <h2 id="staffing-selection-title" class="section-heading">${t('staffing.selection.title')}</h2>
  </div>
  <p id="staffing-selection-lede" class="section-lede">${t('staffing.selection.lede')}</p>
  <div id="staffing-selection-steps" class="steps">
${join(steps)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the two lines this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({ t, lang, prefix: 'staffing' });
}
