// The training page: the detail page behind the "Training en coaching" service
// row on the homepage. It carries the offer itself: the two courses we run
// today, each an editorial block rather than a card, in the redesign's own
// language (hairlines, no numbering).
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { orbitRings } from '../layouts/base.mjs';
import { ficheKilobytes } from './fiche.mjs';
import { kataPath, KATA_VIDEO, KATA_POSTER, FICHE as AGENTIC_FICHE } from './kata.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * The courses we run today, in the order they are offered.
 *
 * A fiche is named after the course it belongs to. It used to be named after
 * the product the course was once built around — `M365_Copilot` under "AI voor
 * business teams", `AI_Developers` under "Agentic engineering" — and a browser
 * puts the file name in the download bar, so the reader clicked one course and
 * was handed something that looked like another.
 *
 * The developer course's fiche is named in `kata.mjs`, because that course has a
 * page of its own and prints the same link at the foot of it. One name, one
 * place; this list is the second reader of it.
 */
const COURSES = [
  { key: 'business', fiche: 'SmartAgents_AI_Business_Teams_Onepager.pdf' },
  { key: 'agentic', fiche: AGENTIC_FICHE, detail: kataPath }
];

/** The `learn.n` lines every live course carries. */
const LEARN = ['1', '2', '3', '4'];

const BENEFITS = ['adoption', 'productivity', 'risk', 'return', 'autonomy'];

/**
 * The facts strip under every course: what a prospect has to know before they
 * can decide whether this is for them.
 *
 * Neither course stated a format, a group size, an audience or a price, so the
 * only next step from this page was the contact form and every enquiry started
 * from zero. Everything here is something the site already said somewhere else
 * — the format in the closing paragraph, the group size in "Hoe een cursus
 * verloopt", the audience in the homepage's own service row, the tools in the
 * line this replaced — collected where the decision is made. Duration and open
 * dates are the two facts nothing on the site knows; they are deliberately not
 * guessed at here.
 *
 * The format and the group size are per-course and were not always. They were
 * one shared value each, written when the only page saying anything harder was
 * this one; the kata page now states the developer course's own numbers — one
 * day, five to fifteen, at the client's office — and a shared "in-house of
 * remote, 5 tot 20" put the two strips one click apart in plain contradiction.
 * A fact stated on two pages has to be read from one key.
 */
const FACTS = [
  { name: 'audience', value: (key) => `training.course.${key}.audience` },
  { name: 'format', value: (key) => `training.course.${key}.format` },
  { name: 'group', value: (key) => `training.course.${key}.group` },
  { name: 'tools', value: (key) => `training.course.${key}.tools` },
  { name: 'price', value: () => 'training.facts.price.value' }
];

/** What a participant walks away with, listed under `training.format.tags.title`. */
const INCLUDED = ['material', 'exercises', 'labs', 'qa', 'slides', 'guidance'];

export const page = {
  id: 'training',
  slugs: { nl: 'training', en: 'training', fr: 'formation' },

  meta: (t) => ({
    title: t('training.title'),
    description: t('training.description')
  }),

  /* What this page is, for a machine: one `Service` provided by the company
     node every page carries, and the trail back to the language root. Both are
     read off the same keys the page prints, so the graph cannot describe an
     offer the page no longer makes. */
  schema: ({ t, lang, url }) => [
    serviceNode({ t, lang, url, key: 'training' }),
    breadcrumbNode([homeStep(t, lang), { name: t('service.training.title'), url }])
  ],

  render: ({ t, lang }) => {
    return html`<main id="main" tabindex="-1">

${hero(t)}
${why(t)}
${offer(t, lang)}
${format(t)}
${contact(t, lang)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — the homepage hero minus the wordmark: the same orbit rings, one petal
 * hung off the right edge, the copy in its own column on the left, and a bead
 * of the same field standing in the paper above the petal's shoulder.
 *
 * The bead is the second free-floating shape on the site and it is drawn with
 * the first: `heroPebbleA` is the larger of the two the AI staffing page's arch
 * has shed, reused rather than redrawn, because what it says here is the same
 * sentence — the field has come away in a piece — and a second pebble drawn to
 * within a few points of that one would be drift, not a new shape. So that
 * silhouette is now shared by two pages: change it for one composition and the
 * other moves with it. It hangs inside the petal's own box, the way the
 * pebbles hang inside the arch's, so the two travel together.
 *
 * What buys a shape hanging from nothing is stated in the design README, and
 * it is stated for the arch: a ground welded along three sides is what makes a
 * piece read as shed from it. The petal is welded on the right edge alone, so
 * this page takes the licence on a narrower argument — the bead stands over
 * the flank at 41 to 61px and the cursor runs the two together — and the
 * README carries that argument now, in "Deviations from the design doc". Read
 * it before drawing a third one.
 *
 * The gap is 50px at 1440, 41 at 1081 and 61 at 2560, against the 60px a join
 * closes at (`2·MERGE·ln2·ONSET` in src/motion.js) — measured on the
 * *displaced* outlines, so at the widest end it is the swell of both edges
 * toward the cursor that closes it and not the resting distance. At rest the
 * two are plainly separate shapes. That is the whole reason the bead is here,
 * so it is dropped wherever a join cannot happen: not only under 1081px but on
 * a coarse pointer and under `prefers-reduced-motion`, which is the query in
 * `.hero__bead` in main.css read off the gates in `src/motion.js`.
 *
 * The three magnet numbers are struck for this shape and not copied. `sigma`
 * is 60, which is 14% of the bead's 420px perimeter against the pebble's 16%
 * and the petal's 6%: at the default 96 a quarter of the outline moved at once
 * and the whole bead slid toward the cursor instead of swelling, which is the
 * "a big shape swells over a wider stretch of its edge than a small one" rule
 * in CLAUDE.md read the other way round. `points` is 140, a sample every 3.0px
 * of perimeter — finer than the petal's 3.3 and inside the join's 4px grid.
 * And `data-magnet-free` is taken 26px under the nav, which is the one place
 * CLAUDE.md says to think twice. The lift is not what makes it safe: measured,
 * a cursor in the nav row raises the bead's crown 24 to 30px and it does cross
 * the bar. The bar is what makes it safe — the header is `--surface-page` at
 * `z-index: 60` and paints over whatever arrives under it, which is what every
 * hero field on the site already leans on. The petal beside this bead rests
 * 4px under the header and lifts 30 to 52px into it. What the crossing costs is
 * the crown flattening along the hairline while the cursor is up there, and if
 * that is ever worth fixing it is worth fixing for `.hero__field--right`
 * site-wide, not for the bead alone.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="training-hero" class="hero hero--page">
${orbitRings('training-hero')}
  <div id="training-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="training-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="480" data-magnet-amp="86" data-magnet-sigma="118" data-clip="heroPetal"><sa-node-field id="training-hero-nodes-right"></sa-node-field></div>
    <div id="training-hero-field-slot-bead" class="field-slot hero__bead">
      <div id="training-hero-field-bead" class="field" data-magnet data-magnet-free data-magnet-points="140" data-magnet-amp="30" data-magnet-sigma="60" data-clip="heroPebbleA"><sa-node-field id="training-hero-nodes-bead"></sa-node-field></div>
    </div>
  </div>
  <div id="training-hero-inner" class="hero__inner">
    <div id="training-hero-text" class="hero__text">
      <p id="training-hero-eyebrow" class="page-eyebrow">${t('training.hero.eyebrow')}</p>
      <h1 id="training-hero-title">${t('training.hero.title')}</h1>
      <div id="training-hero-actions" class="hero__actions">
        <a id="training-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="training-hero-cta-offer" class="btn btn--ghost" href="#offer">${t('training.cta.offer')} <span id="training-hero-cta-offer-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Waarom — the argument, and what it returns
 * ------------------------------------------------------------------ */

function why(t) {
  const rows = BENEFITS.map(
    (key) => html`    <div id="training-benefit-${key}" class="row">
      <span id="training-benefit-${key}-title" class="row__title">${t(`training.benefit.${key}.title`)}</span>
      <span id="training-benefit-${key}-body" class="row__body">${t(`training.benefit.${key}.body`)}</span>
    </div>`
  );

  return html`<section id="training-why" class="section" aria-labelledby="training-why-title">
  <div id="training-why-head" class="section__head">
    <h2 id="training-why-title" class="section-heading">${t('training.why.title')}</h2>
  </div>
  <div id="training-why-rows" class="rows">
${join(rows)}
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
  <div id="training-offer-list" class="offer">
${join(columns)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe een cursus verloopt — the copy beside the developer course tour
 *
 * Two shapes of the dark field open the section, hung off the two rules that
 * bound it. A half disc drops from the rule the offer closes on, just left of
 * the split between the two courses, and a stone stands on the rule the tour
 * hangs from, further right and a band lower — so the pair reads as one
 * diagonal across the band rather than two ornaments.
 * Each is pinned to its own rule, so the cursor swells and rocks them but never
 * peels them off, and both are windows onto the one node field.
 *
 * The stone lives inside the section head, which is what puts its foot on the
 * rule: the head's bottom edge is the tour's top border, whatever the heading
 * does to the height above it. The disc hangs off the section's own top edge,
 * which is the rule the offer closes on.
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
  <div id="training-format-inner" class="tour">
    <div id="training-format-copy" class="tour__copy">
      <p id="training-format-body" class="tour__body">${t('training.format.body')}</p>
      <p id="training-format-group" class="tour__meta">${t('training.format.group')}</p>
      <div id="training-format-tags" class="tour__tags">
        <p id="training-format-tags-title" class="tour__tags-title">${t('training.format.tags.title')}</p>
        <ul id="training-format-tags-list" class="tour__tags-list">
${join(
        INCLUDED.map(
          (key) => html`          <li id="training-format-tag-${key}" class="tour__tags-item">${t(`training.format.tags.${key}`)}</li>`
        ),
        '\n'
      )}
        </ul>
      </div>
      <p id="training-format-accents" class="tour__body">${t('training.format.accents')}</p>
    </div>
    <div id="training-format-media" class="video-block">
      <sa-lazy-video id="training-format-video" class="video-frame">
        <video id="training-format-video-el" controls playsinline preload="none" poster="${KATA_POSTER}" aria-label="${t('training.format.videoLabel')}">
          <source id="training-format-video-source" type="video/mp4" data-src="${KATA_VIDEO}">
        </video>
      </sa-lazy-video>
      <noscript id="training-format-video-noscript"><a id="training-format-video-fallback" class="video-block__fallback" href="${KATA_VIDEO}">${t('training.format.fallback')}</a></noscript>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the heading this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({
    t,
    lang,
    prefix: 'training',
    title: t('training.cta.title')
  });
}
