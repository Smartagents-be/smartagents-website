// The AI-native SDLC page: the detail page behind the "AI-native SDLC" service
// row on the homepage. The page has one argument and it is not technical. A
// lifecycle is six desks, and today the work waits at five handoffs between
// them; AI-native, it is one run with four places a person decides. The
// bottleneck does not disappear, it changes kind. What carries a team across is
// people changing their minds, so the page opens on the diagnosis, draws that
// one figure, and spends its last block on the work.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join, raw } from '../../build/lib/html.mjs';
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
 * The lifecycle, in the order a team meets it, and the same six words in every
 * row. A second vocabulary for the same lifecycle turns the figure into one
 * about terminology.
 */
const PHASES = ['product', 'analysis', 'build', 'review', 'test', 'release'];

/**
 * The three rows.
 *
 * Each row is one band, never broken, with the six desks named on it. `necks`
 * says where the band narrows and how far: `at` is a desk's centre or the
 * boundary before one, `pinch` is what is left of the band's thickness there as
 * a share of the whole, and `shoulder` is how far either side the narrowing
 * takes, counted in desks. `slow` names the desks the row waits on, which the
 * band necks under and which are set in bold.
 *
 * **`pinchTall` is not a second opinion, it is a different medium.** Standing
 * up, the band's thickness is the page's width and the names run across it, so
 * a pinch deep enough to read on the desk leaves nothing for the words. 0.34
 * against 0.38 is as far apart as the two get, which is close enough that the
 * reader of one is not told something different from the reader of the other.
 *
 * The middle row has two necks, which is what its own sentence has always said:
 * the bottleneck moves to what you ask for *and* to whoever checks it. It is
 * the one row that breaks the deck's one-neck rule, deliberately.
 */
const STAGES = [
  {
    key: 'today',
    slow: ['build'],
    necks: [{ at: { desk: 'build' }, pinch: 0.38, pinchTall: 0.34, shoulder: 2 }]
  },
  {
    key: 'ungated',
    slow: ['analysis', 'review'],
    necks: [
      { at: { desk: 'analysis' }, pinch: 0.52, pinchTall: 0.4, shoulder: 1 },
      { at: { desk: 'review' }, pinch: 0.45, pinchTall: 0.34, shoulder: 1 }
    ]
  },
  {
    key: 'native',
    run: true,
    necks: [{ at: { before: 'release' }, pinch: 0.74, pinchTall: 0.74, shoulder: 1.2 }],
    gates: [
      { key: 'intent', before: 'analysis' },
      { key: 'spec', before: 'build' },
      { key: 'review', before: 'test' },
      { key: 'release', before: 'release' }
    ],
    loop: true
  }
];

/**
 * The two marks the key names. The neck and the bold desk are one claim drawn
 * twice and share a line; a handoff is the hairline between two desks and the
 * row's own clause already counts them.
 */
const LEGEND = ['flow', 'gate'];

/** What the work actually is, in the order a team meets it. */
const WORK = ['people', 'culture', 'gates', 'platform', 'training'];

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
 * The channel
 *
 * One band per row, struck on a 1000-unit span and a 100-unit thickness, the
 * band inset 2 at each edge. `preserveAspectRatio="none"` against a fixed
 * rendered size does the rest: the neck is a *share* of the thickness, so a
 * non-uniform scale keeps it exactly and only shortens the shoulders.
 *
 * It is drawn twice, once along each axis, because the two are not the same
 * shape. Lying down the band narrows from both edges, which is what a channel
 * does. Standing up it narrows from the far edge only: the near edge is where
 * the names start, and a name that follows the shape is a name that gets
 * clipped. A symmetric pinch was tried standing up and that is exactly what it
 * did.
 *
 * **`bandShare()` is what makes the marks safe.** A gate's length was a number
 * written by hand beside it, and it was wrong twice over: struck against the
 * figure's box rather than the band inside it, three gates fell short of the
 * band and the fourth, standing in the neck, ran past it. Every mark reads its
 * extent from the same neck table the path is drawn from, so a pinch can change
 * and nothing needs re-measuring.
 *
 * The share is exact at a neck and at or beyond a shoulder, and approximate
 * between them, because a cubic's parameter is not its x. Every mark this figure
 * draws sits at one of the exact positions: a gate stands on a boundary, and the
 * only boundary a neck sits on is its own.
 * ------------------------------------------------------------------ */

const SPAN = 1000;
const MID = 50;
const HALF = 48;

const round = (n) => Math.round(n * 100) / 100;

/** Where a neck sits, in span units: a desk's centre, or the boundary before one. */
function neckPos(at) {
  const step = SPAN / PHASES.length;
  return at.desk ? (PHASES.indexOf(at.desk) + 0.5) * step : PHASES.indexOf(at.before) * step;
}

/**
 * Each neck's position and reach, the reach clamped twice: to the ends of the
 * box, and to half the gap to its neighbour. Two shoulders that overlap draw a
 * path that doubles back on itself, which is what the middle row's pair did
 * before the second clamp existed.
 */
function struck({ necks, vertical }) {
  const step = SPAN / PHASES.length;
  const list = necks.map((n) => ({
    pos: neckPos(n.at),
    pinch: vertical ? n.pinchTall ?? n.pinch : n.pinch,
    reach: n.shoulder * step
  }));

  return list.map((n, i) => {
    const gaps = [n.pos, SPAN - n.pos];
    if (i > 0) gaps.push((n.pos - list[i - 1].pos) / 2);
    if (i < list.length - 1) gaps.push((list[i + 1].pos - n.pos) / 2);
    return { ...n, reach: Math.min(n.reach, ...gaps) };
  });
}

/** What is left of the band's thickness at `pos`, as a share of the whole. */
function bandShare({ necks, pos, vertical = false }) {
  return struck({ necks, vertical }).reduce((share, n) => {
    const d = Math.abs(pos - n.pos);
    if (d >= n.reach) return share;
    const t = (n.reach - d) / n.reach;
    return Math.min(share, 1 - t * t * (3 - 2 * t) * (1 - n.pinch));
  }, 1);
}

/** The band. `vertical` swaps the axes and drops the near edge's curve. */
function channelPath({ necks, vertical = false }) {
  const list = struck({ necks, vertical });
  const P = vertical ? (a, b) => `${round(b)},${round(a)}` : (a, b) => `${round(a)},${round(b)}`;
  const ease = (a0, b0, a1, b1) => {
    const m = a0 + (a1 - a0) / 2;
    return `C${P(m, b0)} ${P(m, b1)} ${P(a1, b1)}`;
  };
  const flat = (sign) => MID + sign * HALF;
  const tight = (sign, pinch) => MID + sign * HALF * pinch;

  const along = (sign, back) =>
    (back ? [...list].reverse() : list).flatMap((n) => {
      const from = back ? n.pos + n.reach : n.pos - n.reach;
      const to = back ? n.pos - n.reach : n.pos + n.reach;

      return [
        `L${P(from, flat(sign))}`,
        ease(from, flat(sign), n.pos, tight(sign, n.pinch)),
        ease(n.pos, tight(sign, n.pinch), to, flat(sign))
      ];
    });

  return [
    `M${P(0, flat(-1))}`,
    ...(vertical ? [] : along(-1, false)),
    `L${P(SPAN, flat(-1))}`,
    `L${P(SPAN, flat(1))}`,
    ...along(1, true),
    `L${P(0, flat(1))}`,
    'Z'
  ].join(' ');
}

/* ------------------------------------------------------------------ *
 * De weg ernaartoe — the one figure on the page
 *
 * Three rows, each a name, the one clause it makes, and the same six-desk
 * lifecycle. **The band is the bar**: the six desks are named on it in white,
 * divided by hairlines, and the band's own silhouette narrows where the work is
 * slowest. Read top to bottom the narrowest point travels right and gets wider.
 *
 * Four things it took several drawings to arrive at, each of which reads as a
 * detail and is not.
 *
 * 1. **The band is never broken.** A handoff was a paper cut clean through it
 *    for a while, and five of those turn one flowing channel into six blocks
 *    with curved ends: the line stops being a line, which is most obvious
 *    standing up, where it disappears entirely. A handoff is the hairline
 *    between two desks. What says the last row has none is that its desks carry
 *    no hairline at all, only the four gates.
 *
 * 2. **Nothing is drawn over the neck.** The bottleneck desk had its own paper
 *    chip, which bought a deeper pinch and hid the pinch it was marking. The
 *    chip is gone, the pinch is capped at what a line of type can sit in, and
 *    the desk is marked by weight alone.
 *
 * 3. **The neck is on the desk that is slow, not the handoff in front of it.**
 *    The playbook's claim is that Build itself was the expensive stage. The neck
 *    was moved to the boundary once to keep the names readable, and the Dutch
 *    was then written to justify the move, which is the wrong way round.
 *
 * 4. **Every mark is struck against the band, never against the box.** See
 *    `bandShare()` above.
 *
 * Nothing here is a measurement. The bar is always full and always the same
 * length; the only thing it claims is where it narrows.
 * ------------------------------------------------------------------ */

/**
 * One row: the name, the clause it makes, and the lifecycle it runs.
 *
 * The bar is an `<ol>` and each desk an `<li>` carrying its own name, so it is
 * content rather than a picture of content, and it sits over the band rather
 * than beside it. `aria-describedby` points the list at the row's clause,
 * because the movement between the three bars is the argument and a screen
 * reader gets it from that sentence or not at all.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.key        row key, also the id suffix
 * @param {string[]} [options.slow]   desks the row waits on
 * @param {Array} options.necks       where the band narrows, and how far
 * @param {boolean} [options.run]     one run: no hairlines between desks
 * @param {Array} [options.gates]     `{ key, before }`, in the order they stand
 * @param {boolean} [options.loop]    draw the dotted return to Product
 */
function stage({ t, key, slow = [], necks, run, gates, loop }) {
  const id = `sdlc-stage-${key}`;

  const cells = PHASES.map((phase) => {
    const marked = slow.includes(phase);

    // A marked desk says so in words as well as in weight, or the distinction is
    // typography carrying meaning alone.
    return html`          <li id="${id}-phase-${phase}" class="cycle__phase${marked ? ' cycle__phase--slow' : ''}">${t(`sdlc.phase.${phase}`)}${
      marked ? html`<span id="${id}-phase-${phase}-mark" class="visually-hidden">, ${t('sdlc.mark.slow')}</span>` : ''
    }</li>`;
  });

  // One element per gate, carrying both axes as custom properties: a viewBox
  // cannot be swapped from a stylesheet, but a number can, and the alternative
  // is a second set of marks that has to be kept in step with the first.
  //
  // The two axes turn the same share into two different lengths, because the
  // two bands are not the same shape. Lying down the band narrows from both
  // edges, so what is left is `2 x HALF x share`, inset by the same amount top
  // and bottom. Standing up only the far edge moves, so the near edge stays at
  // `MID - HALF` and what is left is `HALF x (1 + share)` off it. Reading the
  // symmetric length on both axes is what left the fourth gate 12% of the
  // figure short of the band it stands in, which is the very failure
  // `bandShare()` was written to end.
  const marks = (gates ?? []).map(({ key: gate, before }, i) => {
    const pos = neckPos({ before });
    const wide = bandShare({ necks, pos });
    const tall = bandShare({ necks, pos, vertical: true });

    return html`        <span id="${id}-gate-mark-${gate}" class="cycle__gate" style="--at: ${round((pos / SPAN) * 100)}%; --inset: ${round(MID - HALF * wide)}%; --reach: ${round(HALF * (1 + tall))}%" aria-hidden="true">${i + 1}</span>`;
  });

  const channel = (axis, vertical) => {
    const box = vertical ? '0 0 100 1000' : '0 0 1000 100';

    return html`        <svg id="${id}-channel-${axis}" class="cycle-channel cycle-channel--${axis}" viewBox="${box}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path id="${id}-channel-${axis}-path" d="${channelPath({ necks, vertical })}"></path></svg>`;
  };

  // The gates are named under the figure. A name on a 22px mark either overlaps
  // its neighbour or sets too small to read, and the number on each mark is what
  // ties the two together, so the list is a key rather than a thing to count
  // along. It comes after the return: the arrowhead is at the left edge and so
  // is the first word of this line, and the other way round the arrow pointed at
  // the words instead of at Product.
  const gateNames = gates
    ? html`
      <div id="${id}-gates" class="cycle-gates">
        <span id="${id}-gates-label" class="cycle-gates__label">${t('sdlc.gates.label')}</span>
        <ol id="${id}-gates-list" class="cycle-gates__list" aria-labelledby="${id}-gates-label">
${join(
  gates.map(
    ({ key: gate }, i) => html`          <li id="${id}-gate-${gate}" class="cycle-gates__item"><span id="${id}-gate-${gate}-num" class="cycle-gates__num">${i + 1}</span>${t(`sdlc.gate.${gate}`)}</li>`
  )
)}
        </ol>
      </div>`
    : '';

  // The return. Its sentence is the whole of it for a screen reader, which is
  // right: the dashes and the arrowhead are how the sentence is drawn, not a
  // second thing to announce.
  const feedback = loop
    ? html`
      <div id="${id}-return" class="cycle-return">
        <span id="${id}-return-line" class="cycle-return__line" aria-hidden="true"></span>
        <span id="${id}-return-label" class="cycle-return__label">${t('sdlc.loop.label')}</span>
      </div>`
    : '';

  return html`    <div id="${id}" class="stage">
      <div id="${id}-head" class="stage__head">
        <h3 id="${id}-name" class="stage__name">${t(`sdlc.stage.${key}.title`)}</h3>
        <p id="${id}-body" class="stage__body">${t(`sdlc.stage.${key}.body`)}</p>
      </div>
      <div id="${id}-figure" class="cycle-figure">
${channel('wide', false)}
${channel('tall', true)}
        <ol id="${id}-cycle" class="cycle${run ? ' cycle--run' : ''}" aria-describedby="${id}-body">
${join(cells)}
        </ol>${marks.length ? raw(`\n${join(marks)}`) : ''}
      </div>${feedback}${gateNames}
    </div>`;
}

function journey(t) {
  const stages = STAGES.map((row) => stage({ t, ...row }));

  // The legend is copy, not decoration. It names the two marks in the figure's
  // own words, which is what stops the narrowing being read as a gap in the
  // argument and the band being read as where most of the work happens.
  const legend = LEGEND.map((key) => {
    const id = `sdlc-journey-legend-${key}`;

    // The channel's swatch is the channel, struck by the same generator: a
    // painted box with a flat edge would be the one key on the page that does
    // not show its own mark.
    //
    // **The shoulder is what makes it read, not the pinch.** The swatch is 34px
    // for the span a row gives 1100, so a desk of shoulder is 5.7px here: at
    // 2.4 desks the taper ran 13.6px in from each end, the whole swatch was
    // transition, and it drew a bowtie, with no flat band left to narrow *from*. At
    // 1.5 it is 8.5px in from each end and half the swatch is still band, which
    // is the thing the eye needs before a narrowing is a narrowing. The pinch is
    // the row's own, near enough: 0.55 against 0.38 only because three pixels of
    // waist is the floor a 14px swatch can show.
    const mark =
      key === 'flow'
        ? html`<svg id="${id}-mark" class="legend__mark legend__mark--flow" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path id="${id}-mark-path" d="${channelPath({ necks: [{ at: { desk: 'build' }, pinch: 0.55, shoulder: 1.5 }] })}"></path></svg>`
        : html`<span id="${id}-mark" class="legend__mark legend__mark--${key}" aria-hidden="true"></span>`;

    return html`    <li id="${id}" class="legend">
      ${mark}${t(`sdlc.legend.${key}`)}
    </li>`;
  });

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
