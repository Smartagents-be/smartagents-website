// The AI staffing and coaching page: the detail page behind the "AI staffing en
// coaching" service row on the homepage. It is built from the same parts as the
// training page — a page hero, a rows list, a two-column offer — and departs
// from it in one place: the dark field. The hero carries this page's own
// silhouette — `heroArch`, an arch where the petal is a leaf, on the same flank
// and no larger — and the page closes on a navy band instead of the training
// page's pair of small decorative shapes.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { fieldEchoes, orbitRings } from '../layouts/base.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * The three ways this offer reaches a team: one engineer inside the project,
 * coaching for the people who write the code, and coaching for the people who
 * do not. The last one is the odd one out on purpose — it is the only track
 * that never touches the codebase, which is why the onboarding section below
 * speaks for the two that do.
 */
const TRACKS = ['engineer', 'developers', 'business'];

/** The four `staffing.track.<key>.item.n` lines every track carries. */
const TRACK_ITEMS = ['1', '2', '3', '4'];

/**
 * The onboarding pattern. Every engagement starts here, in this order, because
 * the three depend on each other: automation needs a hard setup, and a hard
 * setup needs a codebase worth hardening.
 */
const STEPS = ['audit', 'harden', 'cycle'];

/** What the reporting covers, whichever track is running. */
const CADENCE_ITEMS = ['1', '2', '3', '4'];

/** `01`-style monospace index; numbers act as the icons in this system. */
const index = (n) => String(n).padStart(2, '0');

export const page = {
  id: 'staffing',
  slugs: { nl: 'ai-staffing', en: 'ai-staffing', fr: 'ai-staffing' },

  meta: (t) => ({
    title: t('staffing.title'),
    description: t('staffing.description')
  }),

  render: ({ t }) => {
    return html`<main id="main" tabindex="-1">

${hero(t)}
${tracks(t)}
${onboarding(t)}
${cadence(t)}
${contact(t)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — the page hero the training page opens on, carrying this page's own
 * shape instead of the petal.
 *
 * `heroArch` is the whole dark field of this hero: one shape on the right
 * flank, the same flank and the same box the petal takes on the training page,
 * with the copy ranged against it across paper. There were two before it —
 * corner to corner top right, the same curve turned half a turn bottom left —
 * and neither the pair nor the single cove that followed them earned the room
 * they took: a hero this size holds one silhouette, and the counterweight it
 * needs is the paper, not a second shape.
 *
 * The arch is the one hero shape on the site that keeps the nav guard. Its top
 * edge runs the width of the flank directly under the header, so a pull from up
 * there would peel it off the bar and open a stripe of paper between the two;
 * guarded, a cursor whose nearest point is in that band gets no swell at all.
 * It is pinned to the right page edge, the one it is welded to.
 *
 * The arch is sampled more densely than a shape this size normally is: its whole
 * free side is one long curve, and a pull reads as a fold rather than a swell if
 * the sampling cannot follow it.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="staffing-hero" class="hero hero--page hero--staffing">
${orbitRings('staffing-hero')}
  <div id="staffing-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    ${fieldEchoes('staffing-hero-field-right', 'heroArch', { pin: 'right' })}
    <div id="staffing-hero-field-right" class="field" data-magnet data-magnet-pin="right" data-magnet-points="520" data-magnet-amp="80" data-magnet-sigma="112" data-clip="heroArch"><sa-node-field id="staffing-hero-nodes-right"></sa-node-field></div>
  </div>
  <div id="staffing-hero-inner" class="hero__inner">
    <div id="staffing-hero-text" class="hero__text">
      <p id="staffing-hero-eyebrow" class="page-eyebrow">${t('staffing.hero.eyebrow')}</p>
      <h1 id="staffing-hero-title">${t('staffing.hero.title')}</h1>
      <div id="staffing-hero-actions" class="hero__actions">
        <a id="staffing-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="staffing-hero-cta-tracks" class="btn btn--ghost" href="#tracks">${t('staffing.cta.tracks')} <span id="staffing-hero-cta-tracks-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Drie sporen — staffing and the two coachings, side by side
 *
 * The offer figure from the training page, stripped back: there is no fiche to
 * download and no line about how the track is bought, so the column is a name,
 * a paragraph and the list, and it closes on the last item. The three stand
 * between hairlines, so the reader compares them instead of scrolling past
 * them, and the orbit diagram returns behind the row to give the section
 * ground of its own. Three columns need the room a desk has, so this figure
 * folds at 1000px rather than at the offer's own 940px.
 *
 * The section carries no visible heading — the three track names are the
 * heading here — so the name it is still known by moves to `aria-label`: a
 * landmark with no accessible name is one a screen reader cannot offer to jump
 * to. The cyan rule that would have sat over that heading stays: it is what
 * says a new section has started, and every other section on the site opens
 * with one.
 * ------------------------------------------------------------------ */

/**
 * One track: a column of hairline-separated blocks.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.key  track key, also the id suffix
 */
function trackColumn({ t, key }) {
  const id = `staffing-track-${key}`;

  const items = TRACK_ITEMS.map(
    (n) => html`        <li id="${id}-item-${n}" class="offer-course__item">${t(`staffing.track.${key}.item.${n}`)}</li>`
  );

  return html`    <article id="${id}" class="offer-course">
      <h3 id="${id}-title" class="offer-course__title">${t(`staffing.track.${key}.title`)}</h3>
      <p id="${id}-body" class="offer-course__body">${t(`staffing.track.${key}.body`)}</p>
      <ul id="${id}-items" class="offer-course__list">
${join(items)}
      </ul>
    </article>`;
}

function tracks(t) {
  const columns = TRACKS.map((key) => trackColumn({ t, key }));

  return html`<section id="tracks" class="section section--orbits" aria-label="${t('staffing.tracks.title')}">
${orbitRings('staffing-tracks', 'orbits--tracks')}
  <div id="staffing-tracks-rule" class="section-rule" aria-hidden="true"></div>
  <div id="staffing-tracks-list" class="offer offer--tracks">
${join(columns)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Zo verloopt de onboarding — the three steps, always in this order
 *
 * The homepage's step figure, at three across instead of five: a rule along the
 * top of each with its dot sitting on it, standing up into a spine once the row
 * folds. A sequence, so it is numbered — this is the one list on the page that
 * is a path rather than a set.
 * ------------------------------------------------------------------ */

function onboarding(t) {
  const steps = STEPS.map(
    (key, i) => html`    <div id="staffing-step-${key}" class="step${i === 0 ? ' step--first' : ''}">
      <span id="staffing-step-${key}-index" class="step__index" aria-hidden="true">${index(i + 1)}</span>
      <h3 id="staffing-step-${key}-title">${t(`staffing.step.${key}.title`)}</h3>
      <p id="staffing-step-${key}-body">${t(`staffing.step.${key}.body`)}</p>
    </div>`
  );

  return html`<section id="staffing-onboarding" class="section" aria-labelledby="staffing-onboarding-title">
  <div id="staffing-onboarding-head" class="section__head">
    <h2 id="staffing-onboarding-title" class="section-heading">${t('staffing.onboarding.title')}</h2>
  </div>
  <p id="staffing-onboarding-lede" class="section-lede">${t('staffing.onboarding.lede')}</p>
  <div id="staffing-onboarding-steps" class="steps steps--three">
${join(steps)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat het management ziet — the navy band
 *
 * The one thing both tracks share is what leaves them: a report, on the cadence
 * the client asks for. It gets the page's second dark shape, and unlike every
 * other shape on the public site this one carries copy rather than texture —
 * which is what the design doc's own full-width band always did.
 * The band is full-bleed, so it sits between the two sections rather than
 * inside the page gutters; the right end is cut away by the shape, and the
 * inner block reserves that run with its own padding.
 *
 * It runs in two columns: what the reporting is, and what it covers. Stacked in
 * one, the block was a column of copy down the left of a band the width of the
 * page, and the two thirds of navy beside it carried nothing at all — the one
 * place on the site where the dark field was filler rather than a shape. Split,
 * the same words hold the band's width and it stands a third shorter.
 * ------------------------------------------------------------------ */

function cadence(t) {
  const items = CADENCE_ITEMS.map(
    (n) => html`          <li id="staffing-cadence-item-${n}" class="cadence__item">${t(`staffing.cadence.item.${n}`)}</li>`
  );

  return html`<section id="staffing-cadence" class="cadence" aria-labelledby="staffing-cadence-title">
  <div id="staffing-cadence-field-slot" class="field-slot cadence__field" aria-hidden="true">
    <div id="staffing-cadence-field" class="field" data-magnet data-magnet-points="300" data-clip="cadenceBand"><sa-node-field id="staffing-cadence-nodes"></sa-node-field></div>
  </div>
  <div id="staffing-cadence-inner" class="cadence__inner">
    <div id="staffing-cadence-lead" class="cadence__lead">
      <p id="staffing-cadence-eyebrow" class="cadence__eyebrow">${t('staffing.cadence.eyebrow')}</p>
      <h2 id="staffing-cadence-title" class="cadence__title">${t('staffing.cadence.title')}</h2>
      <p id="staffing-cadence-body" class="cadence__body">${t('staffing.cadence.body')}</p>
      <a id="staffing-cadence-cta" class="btn btn--ondark" href="#contact">${t('cta.talk')}</a>
    </div>
    <div id="staffing-cadence-list-block" class="cadence__list-block">
      <p id="staffing-cadence-list-title" class="cadence__list-title">${t('staffing.cadence.list')}</p>
      <ul id="staffing-cadence-list" class="cadence__list">
${join(items)}
      </ul>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the two lines this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t) {
  return contactSection({
    t,
    prefix: 'staffing',
    title: t('staffing.cta.title'),
    lede: t('staffing.cta.body')
  });
}
