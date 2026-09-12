// The AI-native SDLC page: the detail page behind the "AI-native SDLC" service
// row on the homepage. The page has one argument and it is not technical — the
// lifecycle moves from traditional to agentic to AI-native, the bottleneck moves
// with it, and what carries a team across is people changing their minds. So it
// opens on the diagnosis, draws the journey once as a figure, and spends its
// last block on the work.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { index, orbitRings } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * Anthropic's write-up of the AI-native SDLC, which the journey's lede says this
 * block is built on. The one external source the public site names, and named as
 * a link: a claim about what somebody else published is checkable or marketing.
 */
const PLAYBOOK_URL = 'https://claude.com/blog/the-ai-native-sdlc-playbook';

/** What we find when we walk in, in the order it is met. */
const ISSUES = ['belief', 'capability', 'foundation', 'tooling'];

/**
 * The three stages, and the lifecycle each one runs.
 *
 * `mark` is what the figure draws: `block` is a phase everything upstream waits
 * behind, `human` a phase a person still owns. Read top to bottom, the thickened
 * run travels outward and changes colour — the bottleneck moves, it does not
 * disappear. Phase names are shared keys, because "Bouwen" is the same word in
 * all three lines and three copies of it drift.
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

  /* One `Service` provided by the company node every page carries, and the trail
     back to the language root, both read off the keys the page prints. */
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
 * Hero — the ridge, and two orbs in the bay it opens.
 *
 * A short shoulder high up, a neck pulled back almost to the page edge where the
 * headline passes, one long lobe below it: narrow once, open twice.
 *
 * The two orbs stand in the bay the neck opens — the near one 45px off the
 * lobe's outer flank, the far one 43px below and left of it, against the 60px a
 * join closes at. They sit against *convex* stretches of the lobe rather than in
 * the mouth of the neck: a shape parked in a concavity is bridged across rather
 * than into, which seals the bay into an enclosed lens of paper (the trap the
 * jobs hero records).
 *
 * All three share one box, widened leftward to hold them, because a shape paints
 * only its own box and sharing one is what lets any of the three host a join.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="sdlc-hero" class="hero hero--page hero--sdlc">
${orbitRings('sdlc-hero')}
  <div id="sdlc-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="sdlc-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="440" data-magnet-amp="86" data-magnet-sigma="118" data-clip="sdlcHeroRidge"><sa-node-field id="sdlc-hero-nodes-right"></sa-node-field></div>
    <div id="sdlc-hero-field-slot-orb-near" class="field-slot hero__drift hero__drift--a">
      <div id="sdlc-hero-field-orb-near" class="field" data-magnet data-magnet-free data-magnet-points="109" data-magnet-amp="24" data-magnet-sigma="46" data-clip="sdlcOrbNear"><sa-node-field id="sdlc-hero-nodes-orb-near"></sa-node-field></div>
    </div>
    <div id="sdlc-hero-field-slot-orb-far" class="field-slot hero__drift hero__drift--b">
      <div id="sdlc-hero-field-orb-far" class="field" data-magnet data-magnet-free data-magnet-points="80" data-magnet-amp="20" data-magnet-sigma="33" data-clip="sdlcOrbFar"><sa-node-field id="sdlc-hero-nodes-orb-far"></sa-node-field></div>
    </div>
  </div>
  <div id="sdlc-hero-inner" class="hero__inner">
    <div id="sdlc-hero-text" class="hero__text">
      <h1 id="sdlc-hero-title">${t('sdlc.hero.title')}</h1>
      <!-- The standfirst, and it is the page's own description key rather than
           a line of its own. Every hero on the site was eyebrow, headline, two
           buttons and then 300px of paper: on a 1280x800 laptop the first
           sentence saying who this is for arrived at y≈800, under the fold. The
           sentence already existed — it is the page's own search snippet — so it
           is printed from that key instead of written a second time, which is
           also the only way the page and the snippet can never drift apart. -->
      <div id="sdlc-hero-actions" class="hero__actions">
        <a id="sdlc-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="sdlc-hero-cta-journey" class="btn btn--ghost" href="#journey">${t('sdlc.cta.journey')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat we vandaag zien — the diagnosis
 *
 * Four hairline rows, no cue. It opens the page because a reader who does not
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
 * Three stages, each a name, a clause, and one bar divided into the five phases
 * of that stage. A phase that holds the cycle up takes the room: ink where the
 * work waits, cyan where a person decides. Read top to bottom the wide block
 * leaves the middle, splits to the two ends and turns cyan — the lede's own
 * sentence, drawn instead of asserted.
 *
 * **The width is a share of one cycle, and that is the only thing it claims.**
 * Every bar is the same length and always full, so nothing here says an agentic
 * cycle is shorter, or counts hours. Do not add a scale, a tick or a number: the
 * moment a reader can read a quantity off it, it is asserting one.
 *
 * Four drawings were tried first and each failed differently. A dot on a
 * hairline, then a thickened run of it: a mark you have to go looking for and
 * then be told the meaning of. A navy band pinching at the bottleneck: a
 * constriction says "low capacity here", not "the work is stacked up behind it".
 * A drawn heap on the rule: right, and three dark lumps on a page built out of
 * hairlines and one cyan. The bar is the site's own vocabulary, which is why it
 * reads as designed rather than drawn.
 *
 * `SHARE` is where the argument lives, so it is one table rather than a number
 * per row: adding a phase or a mark cannot silently rescale the claim.
 * ------------------------------------------------------------------ */

/**
 * What a phase holds of its own cycle. Not minutes: the ratio between a phase
 * that stops the work and one that does not, which is the only comparison the
 * copy makes. A person deciding holds less than a jam and more than a phase that
 * flows, because the lede's point is that the bottleneck does not disappear.
 */
const SHARE = { block: 3.4, human: 2.2, flow: 1 };

/**
 * One stage: the name, the clause it makes, and the cycle it runs.
 *
 * The bar is an `<ol>` and each phase an `<li>` carrying its own name, so it is
 * content rather than a picture of content. `aria-describedby` points the list
 * at the stage's clause, because the movement between the three bars is the
 * argument and a screen reader gets it from that sentence or not at all.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.key    stage key, also the id suffix
 * @param {Array} options.phases  `{ key, mark? }` in lifecycle order
 */
function stage({ t, key, phases }) {
  const id = `sdlc-stage-${key}`;

  const items = phases.map(({ key: phase, mark }) => {
    const share = SHARE[mark ?? 'flow'];

    // A marked phase says so in words as well as by width and colour, or the
    // distinction is colour carrying meaning alone. The label is the legend's
    // own key, so the two can never say different things.
    return html`        <li id="${id}-phase-${phase}" class="cycle__phase${mark ? ` cycle__phase--${mark}` : ''}" style="--share: ${share}"><span id="${id}-phase-${phase}-name" class="cycle__name">${t(`sdlc.phase.${phase}`)}</span>${
      mark
        ? html`<span id="${id}-phase-${phase}-mark" class="visually-hidden">, ${t(`sdlc.legend.${mark}`)}</span>`
        : ''
    }</li>`;
  });

  return html`    <div id="${id}" class="stage">
      <div id="${id}-head" class="stage__head">
        <h3 id="${id}-name" class="stage__name">${t(`sdlc.stage.${key}.title`)}</h3>
        <p id="${id}-body" class="stage__body">${t(`sdlc.stage.${key}.body`)}</p>
      </div>
      <ol id="${id}-cycle" class="cycle" aria-describedby="${id}-body">
${join(items)}
      </ol>
    </div>`;
}

function journey(t) {
  const stages = STAGES.map(({ key, phases }) => stage({ t, key, phases }));

  // The legend is copy, not decoration: it says the wide block is where the work
  // waits rather than where most of it happens.
  const legend = LEGEND.map(
    (key) => html`    <li id="sdlc-journey-legend-${key}" class="legend">
      <span id="sdlc-journey-legend-${key}-mark" class="legend__mark legend__mark--${key}" aria-hidden="true"></span>${t(`sdlc.legend.${key}`)}
    </li>`
  );

  return html`<section id="journey" class="section" aria-labelledby="sdlc-journey-title">
  <div id="sdlc-journey-head" class="section__head">
    <h2 id="sdlc-journey-title" class="section-heading">${t('sdlc.journey.title')}</h2>
  </div>
  <p id="sdlc-journey-lede" class="section-lede section-lede--sourced">${t('sdlc.journey.lede')}</p>
  <p id="sdlc-journey-source" class="section-source"><a id="sdlc-journey-source-link" href="${PLAYBOOK_URL}" target="_blank" rel="noopener noreferrer">${t('sdlc.journey.source')}<span id="sdlc-journey-source-hint" class="visually-hidden"> (${t('a11y.newTab')})</span></a></p>
  <div id="sdlc-journey-figure" class="journey">
${join(stages)}
  </div>
  <ul id="sdlc-journey-legend" class="journey__legend">
${join(legend)}
  </ul>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Waar het werk zit — what the work actually is
 *
 * The homepage's `.numbered` idiom in a `.rows` container, so the last entry
 * closes on a rule. Numbered because these are met in this order: you do not
 * codify a way of working for a team that has not been convinced there is
 * anything wrong with the one it has. It reads differently from the diagnosis
 * above on purpose — two lists of the same shape read as one interrupted.
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
  return contactSection({ t, lang, prefix: 'sdlc' });
}
