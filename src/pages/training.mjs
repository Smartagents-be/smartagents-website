// The training page: the detail page behind the "Training en coaching" service
// row on the homepage. It carries the offer itself: the two courses we run
// today, each an editorial block rather than a card, in the redesign's own
// language (hairlines, no numbering).
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { orbitRings } from '../layouts/base.mjs';
import { ficheKilobytes } from './fiche.mjs';
import { kataPath, FICHE as AGENTIC_FICHE } from './kata.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * The courses we run today, in the order they are offered.
 *
 * A fiche is named after the course it belongs to, not the product the course
 * was once built around: a browser puts the file name in the download bar, so a
 * reader clicked one course and was handed something that looked like another.
 * The developer course's is named in `kata.mjs`, where that course's own page
 * prints the same link.
 */
const COURSES = [
  { key: 'business', fiche: 'SmartAgents_AI_Business_Teams_Onepager.pdf' },
  { key: 'agentic', fiche: AGENTIC_FICHE, detail: kataPath }
];

/** The `learn.n` lines every live course carries. */
const LEARN = ['1', '2', '3', '4'];

/**
 * The facts strip under every course: what a prospect has to know before they
 * can decide whether this is for them. Everything here is something the site
 * already said somewhere else, collected where the decision is made. Duration
 * and open dates are the two facts nothing on the site knows, and they are
 * deliberately not guessed at.
 *
 * Price is not here, and it was: "Op maat, na een korte intake" is a row that
 * answers nothing, at a fifth of the strip's height. A range would be worth
 * printing and nothing here knows one. Put the row back the day there is a
 * figure behind it.
 *
 * The group size is per-course: the kata page states the developer course's own
 * numbers, and a shared value put the two strips one click apart in plain
 * contradiction. Format is not a row at all — "in-house of remote" and "bij u op
 * kantoor" are the same fact the kata spec strip and the closing block already
 * state, and a fact printed twice is the contradiction these keys exist to
 * prevent.
 */
const FACTS = [
  { name: 'audience', value: (key) => `training.course.${key}.audience` },
  { name: 'group', value: (key) => `training.course.${key}.group` },
  { name: 'tools', value: (key) => `training.course.${key}.tools` }
];

export const page = {
  id: 'training',
  slugs: { nl: 'training', en: 'training', fr: 'formation' },

  /* One `Service` provided by the company node every page carries, and the trail
     back to the language root, both read off the keys the page prints. */
  schema: ({ t, lang, url }) => [
    serviceNode({ t, lang, url, key: 'training' }),
    breadcrumbNode([homeStep(t, lang), { name: t('service.training.title'), url }])
  ],

  render: ({ t, lang }) => {
    return html`<main id="main" tabindex="-1">

${hero(t)}
${offer(t, lang)}
${format(t)}
${contact(t, lang)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — the orbit rings, one dark mass hung off the right page edge, the copy
 * in its own column, and a bead of the same field beside the mass's upper
 * flank. The mass is `trainingHeroSwell`, this page's own: three lobes traced
 * as a metaball union, replacing the petal three heroes were drawing.
 *
 * The bead is `heroPebbleA`, the larger of the two the AI staffing arch has
 * shed, reused rather than redrawn: a second pebble drawn to within a few points
 * of it would be drift. That silhouette is shared by three compositions now —
 * change it for one and the others move with it.
 *
 * What buys a shape hanging from nothing is stated in the design README for the
 * arch: a ground welded along three sides is what makes a piece read as shed
 * from it. The swell is welded on the right edge alone, so this page takes the
 * licence on a narrower argument — the bead stands over the flank and the cursor
 * runs the two together. Read "Deviations from the design doc" before drawing a
 * third one.
 *
 * The bead is dropped wherever a join cannot happen — the query in `.hero__bead`
 * is read off the gates in `src/motion.js`. Where it stands, and why its nearest
 * point lands on a convex stretch of the swell rather than in a bay, is in that
 * rule's own comment.
 *
 * The magnet numbers are struck for these shapes, not copied. On the bead
 * `sigma` is 60, 14% of its 420px perimeter: at the default 96 the whole bead
 * slid toward the cursor instead of swelling. `points` is a sample every 3.0px,
 * inside the join's 4px grid. On the swell `amp` is 56 and `sigma` 96, lowered
 * from the petal's 86 and 118 because this drawing is its two bays and `sigma`
 * is the share of the perimeter that travels together. The bead's
 * `data-magnet-free` is taken under the nav; the header paints over whatever
 * arrives under it.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="training-hero" class="hero hero--page hero--training">
${orbitRings('training-hero')}
  <div id="training-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="training-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="420" data-magnet-amp="56" data-magnet-sigma="96" data-clip="trainingHeroSwell"><sa-node-field id="training-hero-nodes-right"></sa-node-field></div>
    <div id="training-hero-field-slot-bead" class="field-slot hero__bead">
      <div id="training-hero-field-bead" class="field" data-magnet data-magnet-free data-magnet-points="140" data-magnet-amp="30" data-magnet-sigma="60" data-clip="heroPebbleA"><sa-node-field id="training-hero-nodes-bead"></sa-node-field></div>
    </div>
  </div>
  <div id="training-hero-inner" class="hero__inner">
    <div id="training-hero-text" class="hero__text">
      <h1 id="training-hero-title">${t('training.hero.title')}</h1>
      <!-- The standfirst, and it is the page's own description key rather than
           a line of its own. Every hero on the site was eyebrow, headline, two
           buttons and then 300px of paper: on a 1280x800 laptop the first
           sentence saying who this is for arrived at y≈800, under the fold. The
           sentence already existed — it is the page's own search snippet — so it
           is printed from that key instead of written a second time, which is
           also the only way the page and the snippet can never drift apart. -->
      <div id="training-hero-actions" class="hero__actions">
        <a id="training-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="training-hero-cta-offer" class="btn btn--ghost" href="#offer">${t('training.cta.offer')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Ons aanbod — the courses
 *
 * The two courses stand side by side, split by a hairline, so the offer is one
 * screen and the reader compares rather than scrolls. Nothing is numbered: this
 * is a list, not a path. The hero's orbit diagram returns behind the pair, dimmer
 * and struck from the opposite edge, so the section has ground of its own.
 *
 * `offer.lede` is what is left of the benefits section that used to stand
 * between the hero and this one: the two lines a competitor's page could not
 * print, and the offer is the argument on this page anyway.
 * ------------------------------------------------------------------ */

/**
 * One course we run today: a column of hairline-separated blocks.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.key      course key, also the id suffix
 * @param {string} options.fiche    file name of the one-pager in /media/
 * @param {string} options.lang
 * @param {Function} [options.detail] resolves this course's own page in `lang`,
 *   where it has one. Only the developer course does today; the business course
 *   is the offer's whole statement of itself and has nowhere to go.
 */
function courseColumn({ t, lang, key, fiche, detail }) {
  const id = `training-offer-course-${key}`;

  const items = LEARN.map(
    (n) => html`        <li id="${id}-learn-${n}" class="offer-course__item">${t(`training.course.${key}.learn.${n}`)}</li>`
  );

  return html`    <article id="${id}" class="offer-course">
      <h3 id="${id}-title" class="offer-course__title">${t(`training.course.${key}.title`)}</h3>
      <p id="${id}-body" class="offer-course__body">${t(`training.course.${key}.body`)}</p>
      <p id="${id}-learn-label" class="offer-course__learn">${t('training.offer.learn')}</p>
      <ul id="${id}-learn-list" class="offer-course__list">
${join(items)}
      </ul>
      <dl id="${id}-facts" class="offer-course__facts">
${join(
        FACTS.map(
          ({ name, value }) => html`        <div id="${id}-fact-${name}" class="offer-course__fact">
          <dt id="${id}-fact-${name}-label">${t(`training.facts.${name}.label`)}</dt>
          <dd id="${id}-fact-${name}-value">${t(value(key))}</dd>
        </div>`
        ),
        '\n'
      )}
      </dl>
      <p id="${id}-links" class="offer-course__links">
${
        detail?.(lang)
          ? html`        <a id="${id}-detail" class="offer-course__fiche" href="${detail(lang)}">${t(`training.course.${key}.detail`)} <span id="${id}-detail-arrow" aria-hidden="true">&rarr;</span></a>
`
          : ''
      }        <a id="${id}-fiche" class="offer-course__fiche" href="/media/${fiche}" type="application/pdf">${t('training.download')} <span id="${id}-fiche-size" class="offer-course__fiche-size">(PDF, ${ficheKilobytes(fiche)} kB)</span> <span id="${id}-fiche-arrow" aria-hidden="true">&rarr;</span></a>
      </p>
    </article>`;
}

function offer(t, lang) {
  const columns = COURSES.map((course) => courseColumn({ t, lang, ...course }));

  return html`<section id="offer" class="section section--orbits" aria-labelledby="training-offer-title">
${orbitRings('training-offer', 'orbits--offer')}
  <div id="training-offer-head" class="section__head">
    <h2 id="training-offer-title" class="section-heading">${t('training.offer.title')}</h2>
  </div>
  <p id="training-offer-lede" class="section-lede">${t('training.offer.lede')}</p>
  <div id="training-offer-list" class="offer">
${join(columns)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe een cursus verloopt — the copy beside the developer course tour
 *
 * Two shapes hung off the two rules that bound the section: a half disc dropping
 * from the rule the offer closes on, just right of the split between the courses,
 * and a stone standing on the rule the tour hangs from, lower and further right,
 * so the pair reads as one diagonal. Each is pinned to its own rule, so the
 * cursor swells and rocks them but never peels them off.
 *
 * The stone lives inside the section head, which is what puts its foot on the
 * rule whatever the heading does to the height above it.
 * ------------------------------------------------------------------ */

function format(t) {
  return html`<section id="training-format" class="section" aria-labelledby="training-format-title">
  <div id="training-format-dome-slot" class="field-slot tour__dome" aria-hidden="true">
    <div id="training-format-dome" class="field" data-magnet data-magnet-free data-magnet-pin="top" data-magnet-points="280" data-magnet-amp="24" data-magnet-sigma="70" data-clip="tourDome"><sa-node-field id="training-format-dome-nodes"></sa-node-field></div>
  </div>
  <div id="training-format-head" class="section__head tour__ground">
    <h2 id="training-format-title" class="section-heading">${t('training.format.title')}</h2>
    <div id="training-format-stone-slot" class="field-slot tour__stone" aria-hidden="true">
      <div id="training-format-stone" class="field" data-magnet data-magnet-free data-magnet-pin="bottom" data-magnet-points="300" data-magnet-amp="42" data-magnet-sigma="70" data-clip="tourStone"><sa-node-field id="training-format-stone-nodes"></sa-node-field></div>
    </div>
  </div>
  <div id="training-format-inner" class="tour__copy">
    <p id="training-format-body" class="tour__body">${t('training.format.body')}</p>
    <p id="training-format-accents" class="tour__body tour__body--follow">${t('training.format.accents')}</p>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the heading this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({ t, lang, prefix: 'training', title: t('training.cta.title'), lede: t('contact.lede') });
}
