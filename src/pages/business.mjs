// AI for business teams: the detail page behind the "AI for business teams"
// course on the training page, the same shape as the agentic engineering
// kata's own detail page. It opens on the spec strip rather than on an
// argument, and closes on what a participant has to bring.
//
// This page's content is drawn from the course's own one-pager
// (`SmartAgents_AI_Business_Teams_Onepager.pdf`), not from the developer
// kata's registry: there is no curriculum module list to mirror here, so the
// day's four steps are numbered plainly rather than counted from `step0`, and
// there is no "how you practise" section — that section on the kata page
// describes a flag-board-and-build-grade mechanic specific to that course,
// and nothing here confirms an equivalent for this one.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { pathOf } from '../../build/lib/i18n.mjs';
import { index, orbitRings, servicePath } from '../layouts/base.mjs';
import { ficheKilobytes } from './fiche.mjs';
import { breadcrumbNode, courseNode, homeStep } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/** The four hard facts, in the order a reader checks them. */
const SPEC = ['duration', 'group', 'location', 'language'];

/**
 * The same four facts in the form `courseNode` puts in the graph, beside the
 * `business.spec.*.value` the strip above prints. Nothing can check the
 * pairing — prose is not parsed — so change both in the same pass.
 */
const SPEC_FACTS = {
  workload: 'P1D', // business.spec.duration.value
  group: [5, 20], // business.spec.group.value
  mode: 'blended', // business.spec.location.value: onsite or online
  languages: ['nl', 'en'] // business.spec.language.value
};

/** The four things a participant learns, also what `Course.teaches` says in the graph. */
const THEMES = ['overview', 'workflows', 'assistant', 'safety'];

/** The four blocks of the day, in the order they build on each other. */
const STEPS = [1, 2, 3, 4];

/** What a participant has to bring, in the order it is checked. */
const REQUIREMENTS = ['knowledge', 'laptop', 'subscription'];

/**
 * This course's one-pager. Named here rather than in the training page's
 * `COURSES` because the course owns it and both pages link it, the same
 * reason the kata page names its own.
 */
export const FICHE = 'SmartAgents_AI_Business_Teams_Onepager.pdf';

export const page = {
  id: 'training-business',

  /* Under the training page's own slug in every language, so the URL says
     what the breadcrumb says. See the note on the kata page's own slugs. */
  slugs: {
    nl: 'training/ai-voor-business-teams',
    en: 'training/ai-for-business-teams',
    fr: 'formation/ia-pour-equipes-business'
  },

  strings: 'business',

  schema: ({ t, lang, url }) => [
    courseNode({ t, url, key: 'business', themes: THEMES, facts: SPEC_FACTS }),
    breadcrumbNode([
      homeStep(t, lang),
      { name: t('service.training.title'), url: servicePath('training', lang) },
      { name: t('business.hero.title'), url }
    ])
  ],

  render: ({ t, lang }) => {
    return html`<main id="main" tabindex="-1">

${hero(t, lang)}
${spec(t)}
${tour(t)}
${day(t)}
${themes(t)}
${requirements(t, lang)}
${contact(t, lang)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — the training page's hero, read closer
 *
 * Not a silhouette of its own, the same reasoning as the kata page's: this
 * page hangs off a course inside the training page, and a new shape would say
 * "another service" rather than "this offer, closer up".
 * ------------------------------------------------------------------ */

function hero(t, lang) {
  const parent = servicePath('training', lang);

  return html`<section id="business-hero" class="hero hero--page hero--kata">
${orbitRings('business-hero')}
  <div id="business-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="business-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="420" data-magnet-amp="56" data-magnet-sigma="96" data-clip="trainingHeroSwell"><sa-node-field id="business-hero-nodes-right"></sa-node-field></div>
  </div>
  <div id="business-hero-inner" class="hero__inner">
    <div id="business-hero-text" class="hero__text">
${parent
    ? html`      <p id="business-hero-eyebrow" class="page-eyebrow"><a id="business-hero-eyebrow-link" class="page-eyebrow__up" href="${parent}"><span id="business-hero-eyebrow-arrow" aria-hidden="true">&larr;</span> ${t('business.hero.eyebrow')}</a></p>`
    : html`      <p id="business-hero-eyebrow" class="page-eyebrow">${t('business.hero.eyebrow')}</p>`}
      <h1 id="business-hero-title">${t('business.hero.title')}</h1>
      <div id="business-hero-actions" class="hero__actions">
        <a id="business-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="business-hero-cta-day" class="btn btn--ghost" href="#business-day">${t('business.cta.day')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * The spec strip — four facts on the rule under the hero
 * ------------------------------------------------------------------ */

function spec(t) {
  const items = SPEC.map(
    (key) => html`      <div id="business-spec-${key}" class="spec__item">
        <dt id="business-spec-${key}-label">${t(`business.spec.${key}.label`)}</dt>
        <dd id="business-spec-${key}-value">${t(`business.spec.${key}.value`)}</dd>
      </div>`
  );

  return html`<section id="business-spec" class="spec-band">
    <dl id="business-spec-list" class="spec">
${join(items)}
    </dl>
  </section>`;
}

/* ------------------------------------------------------------------ *
 * Wat je leert — the four themes, as a numbered "what to expect" list
 *
 * No video beside it: unlike the kata, this course has no tour of its own to
 * show, so the copy runs full width rather than in the kata's two-column
 * `.tour` grid.
 * ------------------------------------------------------------------ */

function tour(t) {
  const expectItems = [1, 2, 3, 4].map((n) => {
    const id = `business-tour-expect-${n}`;

    return html`      <div id="${id}" class="numbered">
        <span id="${id}-index" class="numbered__index" aria-hidden="true">${index(n)}</span>
        <div id="${id}-copy">
          <div id="${id}-title" class="numbered__title">${t(`business.tour.expect.${n}.title`)}</div>
          <p id="${id}-body">${t(`business.tour.expect.${n}.body`)}</p>
        </div>
      </div>`;
  });

  return html`<section id="business-tour" class="section" aria-labelledby="business-tour-title">
  <div id="business-tour-head" class="section__head">
    <h2 id="business-tour-title" class="section-heading">${t('business.tour.title')}</h2>
  </div>
  <div id="business-tour-copy" class="tour__copy">
    <p id="business-tour-body" class="tour__body">${t('business.tour.body')}</p>
    <p id="business-tour-expect-lede" class="tour__body tour__body--follow">${t('business.tour.expect.lede')}</p>
    <div id="business-tour-expect-rows" class="rows">
${join(expectItems)}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe je dag verloopt — the four blocks of the day
 * ------------------------------------------------------------------ */

function day(t) {
  const items = STEPS.map((n) => {
    const id = `business-step-${n}`;

    return html`    <div id="${id}" class="numbered">
      <span id="${id}-index" class="numbered__index" aria-hidden="true">${index(n)}</span>
      <div id="${id}-copy">
        <h3 id="${id}-title" class="numbered__title">${t(`business.step.${n}.title`)}</h3>
        <p id="${id}-body">${t(`business.step.${n}.body`)}</p>
      </div>
    </div>`;
  });

  return html`<section id="business-day" class="section" aria-labelledby="business-day-title">
  <div id="business-day-head" class="section__head">
    <h2 id="business-day-title" class="section-heading">${t('business.day.title')}</h2>
  </div>
  <p id="business-day-lede" class="section-lede">${t('business.day.lede')}</p>
  <div id="business-day-rows" class="rows">
${join(items)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat neem je mee — the four results, one row per theme
 * ------------------------------------------------------------------ */

function themes(t) {
  const rows = THEMES.map((key) => {
    const id = `business-theme-${key}`;

    return html`    <div id="${id}" class="row">
      <span id="${id}-title" class="row__title">${t(`business.theme.${key}.title`)}</span>
      <span id="${id}-body" class="row__body">${t(`business.theme.${key}.body`)}</span>
    </div>`;
  });

  return html`<section id="business-themes" class="section" aria-labelledby="business-themes-title">
  <div id="business-themes-head" class="section__head">
    <h2 id="business-themes-title" class="section-heading">${t('business.themes.title')}</h2>
  </div>
  <p id="business-themes-lede" class="section-lede">${t('business.themes.lede')}</p>
  <div id="business-themes-rows" class="rows rows--pair">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat je meebrengt — the three practical conditions
 * ------------------------------------------------------------------ */

function requirements(t, lang) {
  const rows = REQUIREMENTS.map((key) => {
    const id = `business-requirement-${key}`;

    return html`    <div id="${id}" class="row">
      <span id="${id}-title" class="row__title">${t(`business.requirement.${key}.title`)}</span>
      <span id="${id}-body" class="row__body">${t(`business.requirement.${key}.body`)}</span>
    </div>`;
  });

  return html`<section id="business-requirements" class="section section--close" aria-labelledby="business-requirements-title">
  <div id="business-requirements-head" class="section__head">
    <h2 id="business-requirements-title" class="section-heading">${t('business.requirements.title')}</h2>
  </div>
  <div id="business-requirements-rows" class="rows">
${join(rows)}
  </div>
  <p id="business-requirements-links" class="offer-course__links">
    <a id="business-requirements-fiche" class="offer-course__fiche" href="/media/${FICHE}" type="application/pdf">${t('training.download')} <span id="business-requirements-fiche-size" class="offer-course__fiche-size">(PDF, ${ficheKilobytes(FICHE)} kB)</span> <span id="business-requirements-fiche-arrow" aria-hidden="true">&rarr;</span></a>
    <a id="business-requirements-offer" class="offer-course__fiche" href="${servicePath('training', lang)}">${t('business.cta.offer')} <span id="business-requirements-offer-arrow" aria-hidden="true">&rarr;</span></a>
  </p>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the two lines this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({ t, lang, prefix: 'business' });
}

/**
 * URL of this page in `lang`, for the training page's course column, so the
 * slug is named in exactly one place.
 */
export function businessPath(lang) {
  return pathOf(page, lang);
}
