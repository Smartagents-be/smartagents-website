// The AI-native SDLC page: the detail page behind the "AI-native SDLC" service
// row on the homepage. Four blocks — the page hero, what we find when we walk
// in, the journey, what the work actually is — and then the form.
//
// The page has one argument and it is not a technical one: the lifecycle moves
// from traditional to agentic to AI-native, the bottleneck moves with it, and
// what carries a team across is people changing their minds rather than tools
// being installed. So the page opens on the diagnosis, draws the journey once
// as a figure, and spends its last block on the work: convincing people,
// building on the culture that is already there, gates, and one way of working.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { index, orbitRings } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/** What we find when we walk in, in the order it is met. */
const ISSUES = ['belief', 'capability', 'foundation', 'tooling'];

/**
 * The three stages, and the lifecycle each one runs.
 *
 * `mark` is what the figure draws: `block` is a phase everything upstream of it
 * waits behind, `human` is a phase a person still owns. Traditional has one
 * block in the middle; agentic has two, at the ends of the build; AI-native has
 * no block at all and two human ends instead. Read the three lines top to
 * bottom and the mark travels outward and changes colour, which is the whole
 * claim of the block: the bottleneck moves, it does not disappear.
 *
 * The phase names are shared keys (`sdlc.phase.*`) rather than per-stage ones:
 * "Bouwen" is the same word in all three lines, and three translators keeping
 * three copies of it in step is a drift waiting to happen.
 */
const STAGES = [
  {
    key: 'traditional',
    phases: [
      { key: 'requirements' },
      { key: 'design' },
      { key: 'build', mark: 'block' },
      { key: 'test' },
      { key: 'release' }
    ]
  },
  {
    key: 'agentic',
    phases: [
      { key: 'requirements', mark: 'block' },
      { key: 'design' },
      { key: 'build' },
      { key: 'review', mark: 'block' },
      { key: 'release' }
    ]
  },
  {
    key: 'native',
    phases: [
      { key: 'intent', mark: 'human' },
      { key: 'spec' },
      { key: 'build' },
      { key: 'gates' },
      { key: 'accept', mark: 'human' }
    ]
  }
];

/** The two marks the figure uses, in the order they first appear in it. */
const LEGEND = ['block', 'human'];

/** What the work actually is, in the order a team meets it. */
const WORK = ['people', 'culture', 'training', 'gates', 'platform'];

export const page = {
  id: 'sdlc',
  slugs: { nl: 'ai-native-sdlc', en: 'ai-native-sdlc', fr: 'sdlc-ai-native' },

  meta: (t) => ({
    title: t('sdlc.title'),
    description: t('sdlc.description')
  }),

  /* What this page is, for a machine: one `Service` provided by the company
     node every page carries, and the trail back to the language root. Both are
     read off the same keys the page prints, so the graph cannot describe an
     offer the page no longer makes. */
  schema: ({ t, lang, url }) => [
    serviceNode({ t, lang, url, key: 'sdlc' }),
    breadcrumbNode([homeStep(t, lang), { name: t('service.sdlc.title'), url }])
  ],

  render: ({ t, lang }) => {
    return html`<main id="main" tabindex="-1">

${hero(t)}
${issues(t)}
${journey(t)}
${work(t)}
${contact(t, lang)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — the page hero the training page opens on, carrying this page's own
 * shape instead of the petal.
 *
 * One silhouette, hung off the right edge in the box the petal would have
 * taken: a new shape here is a variation on the composition, not a second one,
 * and nothing about this page needs the box moved the way the staffing arch
 * needed it. What is its own is the flank — a short shoulder high up, a neck
 * pulled back almost to the edge where the headline passes, then one long lobe
 * reaching further left below it. Narrow once, open twice: the same figure the
 * page argues about a lifecycle, drawn as the ground it argues it on.
 *
 * `data-magnet-free` because the shape's own outline runs along the top edge at
 * the corner it is welded to, and the nav guard would refuse it a pull there;
 * `data-magnet-pin="right"` is what keeps the swell from peeling it off the
 * page edge it hangs from. Amplitude and sigma are the petal's: same box, same
 * size, so the pull should read the same. Sampled at 440 points, because a
 * flank with three turns in it folds rather than swells if the sampling cannot
 * follow the curve.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="sdlc-hero" class="hero hero--page">
${orbitRings('sdlc-hero')}
  <div id="sdlc-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="sdlc-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="440" data-magnet-amp="86" data-magnet-sigma="118" data-clip="sdlcHeroRidge"><sa-node-field id="sdlc-hero-nodes-right"></sa-node-field></div>
  </div>
  <div id="sdlc-hero-inner" class="hero__inner">
    <div id="sdlc-hero-text" class="hero__text">
      <p id="sdlc-hero-eyebrow" class="page-eyebrow">${t('sdlc.hero.eyebrow')}</p>
      <h1 id="sdlc-hero-title">${t('sdlc.hero.title')}</h1>
      <p id="sdlc-hero-lede" class="hero__lede">${t('sdlc.hero.lede')}</p>
      <div id="sdlc-hero-actions" class="hero__actions">
        <a id="sdlc-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="sdlc-hero-cta-journey" class="btn btn--ghost" href="#journey">${t('sdlc.cta.journey')} <span id="sdlc-hero-cta-journey-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat we vandaag zien — the diagnosis
 *
 * Four hairline rows, no cue: nothing here links anywhere, and the block is
 * read rather than clicked. It opens the page because a reader who does not
 * recognise their own team in these four lines is not the reader this page is
 * for, and saying so first is cheaper for both of us than a promise.
 * ------------------------------------------------------------------ */

function issues(t) {
  const rows = ISSUES.map((key) => {
    const id = `sdlc-issue-${key}`;

    return html`    <div id="${id}" class="row">
      <span id="${id}-title" class="row__title">${t(`sdlc.issue.${key}.title`)}</span>
      <span id="${id}-body" class="row__body">${t(`sdlc.issue.${key}.body`)}</span>
    </div>`;
  });

  return html`<section id="sdlc-issues" class="section" aria-labelledby="sdlc-issues-title">
  <div id="sdlc-issues-head" class="section__head">
    <h2 id="sdlc-issues-title" class="section-heading">${t('sdlc.issues.title')}</h2>
  </div>
  <div id="sdlc-issues-rows" class="rows rows--pair">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * De weg ernaartoe — the one figure on the page
 *
 * Three stages, each a name and a sentence beside one continuous hairline with
 * the five phases of that stage set along it. One or two of those phases carry
 * a mark sitting on the rule: ink where the work waits, cyan where a person
 * decides. Read the three rules top to bottom and the mark travels outward and
 * changes colour — which is the argument, seen rather than explained.
 *
 * The hairline belongs to the row, not to the cells. The deck this page is
 * drawn from tried the other version first, a rule over every phase, and it
 * read as a spreadsheet: the eye had to be told which cell was the bottleneck
 * instead of seeing it. One line with a heavy dot on it is a line with a dot on
 * it, and three of them are a movement.
 *
 * The deck's own figure is a navy ribbon whose height is throughput, drawn in
 * SVG against a fixed 1920x1080 stage. It is the better drawing and it does not
 * survive a page that has to hold from 320px to a wide desk, so the page keeps
 * the claim and gives up the ribbon.
 *
 * No orbit diagram behind it. It was there, dimmed, the way it is under the
 * training page's offer — but that block is panels and this one is hairlines
 * and cyan dots, which is exactly what the diagram is made of. A decorative
 * cyan node landed 50px from the legend's cyan swatch and there was no way for
 * a reader to tell which of the two carried meaning. Ground goes behind a
 * figure, not inside one.
 * ------------------------------------------------------------------ */

/**
 * One stage: the label column, and the lifecycle it runs.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.key      stage key, also the id suffix
 * @param {Array} options.phases    `{ key, mark? }` in lifecycle order
 * @param {number} options.position 1-based, printed as the monospace index
 */
function stage({ t, key, phases, position }) {
  const id = `sdlc-stage-${key}`;

  // A marked phase says so in text as well as with its dot. The dot and the
  // legend beside it are the whole argument of this block, and neither reaches
  // a reader who is not looking at them: without this a screen reader gets
  // three identical lists of five words, and the ink/cyan distinction is
  // colour carrying meaning on its own. The label is the legend's own key, so
  // the two can never say different things.
  const items = phases.map(
    ({ key: phase, mark }) =>
      html`        <li id="${id}-phase-${phase}" class="phase${mark ? ` phase--${mark}` : ''}">${t(`sdlc.phase.${phase}`)}${
        mark
          ? html`<span id="${id}-phase-${phase}-mark" class="visually-hidden">, ${t(`sdlc.legend.${mark}`)}</span>`
          : ''
      }</li>`
  );

  return html`    <div id="${id}" class="stage">
      <div id="${id}-label" class="stage__label">
        <span id="${id}-index" class="stage__index" aria-hidden="true">${index(position)}</span>
        <h3 id="${id}-name" class="stage__name">${t(`sdlc.stage.${key}.title`)}</h3>
        <p id="${id}-body" class="stage__body">${t(`sdlc.stage.${key}.body`)}</p>
      </div>
      <ol id="${id}-flow" class="stage__flow">
${join(items)}
      </ol>
    </div>`;
}

function journey(t) {
  const stages = STAGES.map(({ key, phases }, i) =>
    stage({ t, key, phases, position: i + 1 })
  );

  // The legend is what tells the two marks apart, so it is copy and not
  // decoration: the dot beside each line is the same mark the figure uses.
  const legend = LEGEND.map(
    (key) => html`    <li id="sdlc-journey-legend-${key}" class="legend">
      <span id="sdlc-journey-legend-${key}-mark" class="legend__mark legend__mark--${key}" aria-hidden="true"></span>${t(`sdlc.legend.${key}`)}
    </li>`
  );

  return html`<section id="journey" class="section" aria-labelledby="sdlc-journey-title">
  <div id="sdlc-journey-head" class="section__head">
    <h2 id="sdlc-journey-title" class="section-heading">${t('sdlc.journey.title')}</h2>
  </div>
  <p id="sdlc-journey-lede" class="section-lede">${t('sdlc.journey.lede')}</p>
  <div id="sdlc-journey-figure" class="journey">
${join(stages)}
  </div>
  <div id="sdlc-journey-foot" class="journey__foot">
    <ul id="sdlc-journey-legend" class="journey__legend">
${join(legend)}
    </ul>
    <p id="sdlc-journey-note" class="journey__note">${t('sdlc.journey.note')}</p>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Waar het werk zit — what the work actually is
 *
 * Numbered entries in a hairline list: the same `.numbered` idiom the homepage
 * uses for the four layers of a transformation, dropped into a `.rows`
 * container so the last one closes on a rule like every other list on the site.
 * Numbered rather than plain because these are met in this order — you do not
 * codify a way of working for a team that has not been convinced there is
 * anything wrong with the one it has.
 *
 * It reads differently from the diagnosis above it on purpose. That block is
 * three columns of hairline rows; this one is a cyan index and a paragraph. Two
 * lists of the same shape in one page read as one list interrupted.
 * ------------------------------------------------------------------ */

function work(t) {
  const items = WORK.map((key, i) => {
    const id = `sdlc-work-${key}`;

    return html`    <div id="${id}" class="numbered">
      <span id="${id}-index" class="numbered__index" aria-hidden="true">${index(i + 1)}</span>
      <div id="${id}-copy">
        <div id="${id}-title" class="numbered__title">${t(`sdlc.work.${key}.title`)}</div>
        <p id="${id}-body">${t(`sdlc.work.${key}.body`)}</p>
      </div>
    </div>`;
  });

  return html`<section id="sdlc-work" class="section" aria-labelledby="sdlc-work-title">
  <div id="sdlc-work-head" class="section__head">
    <h2 id="sdlc-work-title" class="section-heading">${t('sdlc.work.title')}</h2>
  </div>
  <p id="sdlc-work-lede" class="section-lede">${t('sdlc.work.lede')}</p>
  <div id="sdlc-work-rows" class="rows">
${join(items)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the two lines this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({
    t,
    lang,
    prefix: 'sdlc',
    title: t('sdlc.cta.title'),
    lede: t('sdlc.cta.body')
  });
}
