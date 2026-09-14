// The agentic engineering kata: the detail page behind the "Agentic engineering"
// course on the training page, and the first page on the site that sits under
// another one. It answers the four questions that stop a reader booking — what
// happens on the day, what is left afterwards, what has to be brought, what it
// costs in time and people — so it opens on the spec strip rather than on an
// argument, and closes on the requirements.
//
// Nothing on the page names a language or a build tool. The exercises do run on
// one stack and the page says so once, in `kata.requirement.stack.body`, where a
// reader deciding whether their team qualifies needs it.
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
 * The same four facts in the form `courseNode` puts in the graph, line by line
 * with the `kata.spec.*.value` the strip above prints: `duration`, `group`,
 * `location`, `language`. They live beside that list rather than in
 * `schema.mjs`, where they were literals the page could contradict. Nothing can
 * check the pairing — prose is not parsed — so change both in the same pass.
 */
const SPEC_FACTS = {
  workload: 'P1D', // kata.spec.duration.value
  group: [5, 15], // kata.spec.group.value
  mode: 'onsite', // kata.spec.location.value
  languages: ['nl', 'en'] // kata.spec.language.value
};

/**
 * The six themes of the day, in the order they are met. Also what
 * `Course.teaches` says in the graph — `KATA_THEMES` in `src/layouts/schema.mjs`
 * is the same list, keyed the same way.
 */
const THEMES = ['truth', 'workflow', 'cost', 'setup', 'parallel', 'team'];

/**
 * The four steps of the curriculum. The numbers are the course's own: it counts
 * from `step0`, so the first row is `00` where every other numbered list on the
 * site starts at one. Renumbering here would put the page and the repository a
 * step apart for the whole day.
 */
const STEPS = ['00', '01', '02', '03'];

/** What a participant has to bring, in the order it is checked. */
const REQUIREMENTS = ['knowledge', 'tools', 'stack'];

/**
 * This course's one-pager. Named here rather than in the training page's
 * `COURSES` because the course owns it and both pages link it — and because
 * `training.mjs` already imports this module, so the other direction is a cycle.
 */
export const FICHE = 'SmartAgents_Agentic_Engineering_Onepager.pdf';

/**
 * The tour, copied into dist/media/ by build/render.mjs (`PROMO_MEDIA`).
 * Exported because the training page shows the same file one level up.
 */
export const KATA_VIDEO = '/media/kata-agentic-engineering.mp4';
export const KATA_POSTER = '/media/kata-agentic-engineering-poster.jpg';

export const page = {
  id: 'training-kata',

  /* Under the training page's own slug in every language, so the URL says what
     the breadcrumb says. The parent segment is written out rather than read off
     `training.mjs`, because that page imports `kataPath` back and the pair would
     close a cycle. Rename the training slug and this has to move with it —
     `check-dist.mjs` fails the build on the broken link if it does not. */
  slugs: {
    nl: 'training/agentic-engineering-kata',
    en: 'training/agentic-engineering-kata',
    fr: 'formation/kata-agentic-engineering'
  },

  /* The id is what the nav matches a service's children on
     (`isCurrentNavItem`); the copy is keyed on the course. */
  strings: 'kata',

  /* One `Course` provided by the company node every page carries, and a
     three-step trail. Both are read off the keys the page prints. */
  schema: ({ t, lang, url }) => [
    courseNode({ t, url, key: 'kata', themes: THEMES, facts: SPEC_FACTS }),
    breadcrumbNode([
      homeStep(t, lang),
      { name: t('service.training.title'), url: servicePath('training', lang) },
      { name: t('kata.hero.title'), url }
    ])
  ],

  render: ({ t, lang }) => {
    return html`<main id="main" tabindex="-1">

${hero(t, lang)}
${spec(t)}
${tour(t)}
${day(t)}
${themes(t)}
${practice(t)}
${requirements(t, lang)}
${contact(t, lang)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — the training page's hero, petal and all
 *
 * Not a silhouette of its own: this page hangs off a course inside the training
 * page and is the same offer read closer, where a new shape would say "another
 * service".
 * ------------------------------------------------------------------ */

function hero(t, lang) {
  const parent = servicePath('training', lang);

  return html`<section id="kata-hero" class="hero hero--page hero--kata">
${orbitRings('kata-hero')}
  <div id="kata-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="kata-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="420" data-magnet-amp="56" data-magnet-sigma="96" data-clip="trainingHeroSwell"><sa-node-field id="kata-hero-nodes-right"></sa-node-field></div>
  </div>
  <div id="kata-hero-inner" class="hero__inner">
    <div id="kata-hero-text" class="hero__text">
      <!-- The eyebrow is the way up, and it is the whole breadcrumb this page
           needs. It named the section this page sits in and did nothing with
           it: a paragraph shaped exactly like a breadcrumb, on the one page of
           the site that is two levels down, while the only trail back to the
           training page lived in the JSON-LD where no reader can reach it. As a
           link it costs nothing and answers the question the eyebrow was
           already asking. It falls back to a plain label in a language the
           training page is not published in, the same rule servicePath()
           follows everywhere else. -->
${parent
    ? html`      <p id="kata-hero-eyebrow" class="page-eyebrow"><a id="kata-hero-eyebrow-link" class="page-eyebrow__up" href="${parent}"><span id="kata-hero-eyebrow-arrow" aria-hidden="true">&larr;</span> ${t('kata.hero.eyebrow')}</a></p>`
    : html`      <p id="kata-hero-eyebrow" class="page-eyebrow">${t('kata.hero.eyebrow')}</p>`}
      <h1 id="kata-hero-title">${t('kata.hero.title')}</h1>
      <!-- The standfirst; see the note in the training page's hero. -->
      <div id="kata-hero-actions" class="hero__actions">
        <a id="kata-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="kata-hero-cta-day" class="btn btn--ghost" href="#kata-day">${t('kata.cta.day')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * The spec strip — four facts on the rule under the hero
 *
 * A day, a group size, a place and two languages, before a word of argument:
 * every enquiry the training page produced started with these four. Each pair
 * carries its own top hairline rather than the strip carrying one, so the rules
 * stay right as the four wrap to two columns and then to one.
 *
 * The section carries no `aria-label` deliberately: named, it becomes a landmark,
 * and the only name it has is the page's — so a landmark list said the page title
 * twice. Unnamed, a `<section>` is not exposed as a region at all.
 * ------------------------------------------------------------------ */

function spec(t) {
  const items = SPEC.map(
    (key) => html`      <div id="kata-spec-${key}" class="spec__item">
        <dt id="kata-spec-${key}-label">${t(`kata.spec.${key}.label`)}</dt>
        <dd id="kata-spec-${key}-value">${t(`kata.spec.${key}.value`)}</dd>
      </div>`
  );

  return html`<section id="kata-spec" class="spec-band">
    <dl id="kata-spec-list" class="spec">
${join(items)}
    </dl>
  </section>`;
}

/* ------------------------------------------------------------------ *
 * Wat de kata is — the copy beside the tour
 *
 * The same block and the same eighty seconds of video the training page closes
 * on, which is the one thing deliberately said twice on the site: there it
 * illustrates how a course runs, here it is the course. It costs nothing on the
 * wire — `preload="none"`, so the poster is the only byte fetched.
 *
 * No caption: the section is titled and the two paragraphs beside the frame say
 * what the tour shows. No dark shape either — the training page's dome and stone
 * are struck off a split and a rule that do not exist here.
 * ------------------------------------------------------------------ */

function tour(t) {
  const expectItems = [1, 2, 3, 4].map((n) => {
    const id = `kata-tour-expect-${n}`;

    return html`      <div id="${id}" class="numbered">
        <span id="${id}-index" class="numbered__index" aria-hidden="true">${index(n)}</span>
        <div id="${id}-copy">
          <div id="${id}-title" class="numbered__title">${t(`kata.tour.expect.${n}.title`)}</div>
          <p id="${id}-body">${t(`kata.tour.expect.${n}.body`)}</p>
        </div>
      </div>`;
  });

  return html`<section id="kata-tour" class="section" aria-labelledby="kata-tour-title">
  <div id="kata-tour-head" class="section__head">
    <h2 id="kata-tour-title" class="section-heading">${t('kata.tour.title')}</h2>
  </div>
  <div id="kata-tour-inner" class="tour">
    <div id="kata-tour-copy" class="tour__copy">
      <p id="kata-tour-body" class="tour__body">${t('kata.tour.body')}</p>
      <p id="kata-tour-expect-lede" class="tour__body tour__body--follow">${t('kata.tour.expect.lede')}</p>
      <div id="kata-tour-expect-rows" class="rows">
${join(expectItems)}
      </div>
    </div>
    <div id="kata-tour-media" class="video-block">
      <sa-lazy-video id="kata-tour-video" class="video-frame">
        <video id="kata-tour-video-el" controls playsinline preload="none" poster="${KATA_POSTER}" aria-label="${t('kata.tour.videoLabel')}">
          <source id="kata-tour-video-source" type="video/mp4" data-src="${KATA_VIDEO}">
        </video>
      </sa-lazy-video>
      <noscript id="kata-tour-video-noscript"><a id="kata-tour-video-fallback" class="video-block__fallback" href="${KATA_VIDEO}">${t('kata.tour.fallback')}</a></noscript>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe uw dag verloopt — the four steps of the curriculum
 *
 * Numbered, unlike the themes below it, because these are met in this order and
 * one does not work without the one before — and because four hairline rows
 * followed by six more of the same shape read as one list.
 *
 * Each step prints its own units under the paragraph, in course order and in the
 * micro size: that is the level of detail a technical lead decides on. One line
 * of text rather than a nested list, which would make the block a table of
 * contents.
 *
 * **Course order is the registry's order, not a tidy one.** `front/src/steps/
 * step1/index.tsx` puts `prompt` and `tools` ahead of `context` deliberately.
 * Check the four registries, not the four locale files, when this line changes.
 * ------------------------------------------------------------------ */

function day(t) {
  const items = STEPS.map((key) => {
    const id = `kata-step-${key}`;

    // Each unit is its own unbreakable chunk carrying the separator behind it:
    // the line runs ten two-word names, and as one string the browser broke
    // inside a name and stranded a separator at the end of every wrapped line.
    // The footer's microline drops the character instead — there the gap alone
    // reads as a list of facts; here the items are prose phrases.
    const units = t(`kata.step.${key}.units`).split(' · ');
    const chunks = units.map(
      (unit, i) => html`<span id="${id}-unit-${index(i + 1)}" class="numbered__unit">${unit}${i < units.length - 1 ? ' ·' : ''}</span>`
    );

    return html`    <div id="${id}" class="numbered">
      <span id="${id}-index" class="numbered__index" aria-hidden="true">${key}</span>
      <div id="${id}-copy">
        <h3 id="${id}-title" class="numbered__title">${t(`kata.step.${key}.title`)}</h3>
        <p id="${id}-body">${t(`kata.step.${key}.body`)}</p>
        <p id="${id}-units" class="numbered__units">${join(chunks, ' ')}</p>
      </div>
    </div>`;
  });

  return html`<section id="kata-day" class="section" aria-labelledby="kata-day-title">
  <div id="kata-day-head" class="section__head">
    <h2 id="kata-day-title" class="section-heading">${t('kata.day.title')}</h2>
  </div>
  <p id="kata-day-lede" class="section-lede">${t('kata.day.lede')}</p>
  <div id="kata-day-rows" class="rows">
${join(items)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat blijft hangen — what the day is about
 *
 * One word as the title and one sentence as the body: these are the things a
 * participant should still be able to name a week later.
 *
 * **Nothing on this page announces how many of anything there are.** A count in
 * a heading is a promise about length rather than content, and it dates the
 * moment a seventh theme arrives. Name the block; let the rows do the counting.
 * ------------------------------------------------------------------ */

function themes(t) {
  const rows = THEMES.map((key) => {
    const id = `kata-theme-${key}`;

    return html`    <div id="${id}" class="row">
      <span id="${id}-title" class="row__title">${t(`kata.theme.${key}.title`)}</span>
      <span id="${id}-body" class="row__body">${t(`kata.theme.${key}.body`)}</span>
    </div>`;
  });

  return html`<section id="kata-themes" class="section" aria-labelledby="kata-themes-title">
  <div id="kata-themes-head" class="section__head">
    <h2 id="kata-themes-title" class="section-heading">${t('kata.themes.title')}</h2>
  </div>
  <p id="kata-themes-lede" class="section-lede">${t('kata.themes.lede')}</p>
  <div id="kata-themes-rows" class="rows rows--pair">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe u oefent — what a team actually does all day
 *
 * Now a numbered list like the tour section above it, matching the copy's own
 * "Hoe de training is opgebouwd" structure. It sits between the six themes above
 * and the three requirements below, which read as lists too — three lists in a
 * row was the earlier reason this one stayed a paragraph, and that tension still
 * applies; the copy just now asks for the list shape anyway.
 * ------------------------------------------------------------------ */

function practice(t) {
  const items = [1, 2, 3].map((n) => {
    const id = `kata-practice-item-${n}`;

    return html`      <div id="${id}" class="numbered">
        <span id="${id}-index" class="numbered__index" aria-hidden="true">${index(n)}</span>
        <div id="${id}-copy">
          <div id="${id}-title" class="numbered__title">${t(`kata.practice.item.${n}.title`)}</div>
          <p id="${id}-body">${t(`kata.practice.item.${n}.body`)}</p>
        </div>
      </div>`;
  });

  return html`<section id="kata-practice" class="section" aria-labelledby="kata-practice-title">
  <div id="kata-practice-head" class="section__head">
    <h2 id="kata-practice-title" class="section-heading">${t('kata.practice.title')}</h2>
  </div>
  <div id="kata-practice-inner" class="practice">
    <p id="kata-practice-lede" class="tour__body">${t('kata.practice.lede')}</p>
    <p id="kata-practice-items-lede" class="tour__body tour__body--follow">${t('kata.practice.items.lede')}</p>
    <div id="kata-practice-rows" class="rows">
${join(items)}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat u meebrengt — the three practical conditions
 *
 * Three lines that let a reader rule themselves in or out. `.section--close`,
 * because a heading and three rows at the full rhythm is a half-empty screen.
 *
 * It carries the page's two exits: the one-pager used to be reachable from the
 * training page and nowhere else, so a reader arriving from a search could not
 * get it and had no way back up to the offer.
 * ------------------------------------------------------------------ */

function requirements(t, lang) {
  const rows = REQUIREMENTS.map((key) => {
    const id = `kata-requirement-${key}`;

    return html`    <div id="${id}" class="row">
      <span id="${id}-title" class="row__title">${t(`kata.requirement.${key}.title`)}</span>
      <span id="${id}-body" class="row__body">${t(`kata.requirement.${key}.body`)}</span>
    </div>`;
  });

  return html`<section id="kata-requirements" class="section section--close" aria-labelledby="kata-requirements-title">
  <div id="kata-requirements-head" class="section__head">
    <h2 id="kata-requirements-title" class="section-heading">${t('kata.requirements.title')}</h2>
  </div>
  <div id="kata-requirements-rows" class="rows">
${join(rows)}
  </div>
  <p id="kata-requirements-links" class="offer-course__links">
    <a id="kata-requirements-fiche" class="offer-course__fiche" href="/media/${FICHE}" type="application/pdf">${t('training.download')} <span id="kata-requirements-fiche-size" class="offer-course__fiche-size">(PDF, ${ficheKilobytes(FICHE)} kB)</span> <span id="kata-requirements-fiche-arrow" aria-hidden="true">&rarr;</span></a>
    <a id="kata-requirements-offer" class="offer-course__fiche" href="${servicePath('training', lang)}">${t('kata.cta.offer')} <span id="kata-requirements-offer-arrow" aria-hidden="true">&rarr;</span></a>
  </p>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the two lines this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({ t, lang, prefix: 'kata' });
}

/**
 * URL of this page in `lang`, for the training page's course column, so the slug
 * is named in exactly one place.
 */
export function kataPath(lang) {
  return pathOf(page, lang);
}
