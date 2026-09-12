// The AI-native business processes page: the detail page behind the "AI-native
// businessprocessen" service row. Three blocks — the hero, the engagement, and
// what the engagement leaves behind — and the form closes it while the reader is
// still on that last list.
//
// It is the deeper version of two things the site already sells: the training
// page teaches a class and the staffing page puts a coach beside a team, where
// this takes one real process end to end. Nothing says that out loud — a page
// that compares itself to two other pages is a page about the price list.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { index, orbitRings } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * The four phases of the engagement, in the order they run. A sequence and not a
 * menu — every engagement runs all four, which is why this borrows the
 * homepage's `.steps` vocabulary rather than the staffing page's accordion.
 */
const PHASES = [1, 2, 3, 4];

/**
 * What is left behind when the four phases are done: three artefacts the client
 * names in that order, each more autonomous than the last, and the people, which
 * is the only one that decides whether the other three survive the quarter.
 */
const OUTCOMES = ['workflows', 'skills', 'agents', 'people'];

export const page = {
  id: 'processes',
  slugs: { nl: 'ai-native-processen', en: 'ai-native-processes', fr: 'processus-ai-native' },

  /* One `Service` provided by the company node every page carries, and the trail
     back to the language root, both read off the keys the page prints. */
  schema: ({ t, lang, url }) => [
    serviceNode({ t, lang, url, key: 'processes' }),
    breadcrumbNode([homeStep(t, lang), { name: t('service.processes.title'), url }])
  ],

  render: ({ t, lang }) => {
    return html`<main id="main" tabindex="-1">

${hero(t)}
${phases(t)}
${outcome(t)}
${contact(t, lang)}

</main>`;
  }
};

/* ------------------------------------------------------------------ *
 * Hero — three blobs in a line, and the cursor runs them together.
 *
 * The headline is "Van uw taken naar herbruikbare workflows" — separate pieces
 * becoming one thing — so the hero is separate pieces and the becoming is the
 * reader's to do.
 *
 * **Every blob carries the same box — the whole composition — with its drawing
 * authored into a corner of it** (see `clipDefs()`). `src/motion.js` paints a
 * traced join into one shape's box and cuts what falls outside, so a tight box
 * renders a blob with a straight chord sliced out. There is nothing to position
 * in CSS as a result: the slots are one rule, and where each blob sits is in its
 * path.
 *
 * **Every adjacent pair merges, and that took a fix to the join pass.** The pass
 * used to cancel a third shape's lift at the window rim by subtracting a
 * constant, which only holds if every other shape is at least `spread` away; a
 * nearer one still lifted the contour where the rim clamps the field, and
 * marching squares closed the loop along a straight line — a ledge across the
 * far side of whichever orb the rim crossed. Measured here before the fix: 47px
 * with a third orb 40px away, 17px at 100, 3px at 194.
 *
 * What is left is the ordinary constraint: an orb has to be bigger than the
 * join's blend length. `MERGE` is 46px and drafts at 52 and 60px came out with
 * spikes; the smallest here is 64px at the design size.
 *
 * `processLobe` is **first** in the DOM so it hosts, the middle blob second: the
 * pass takes the first shape in DOM order that reaches a window.
 *
 * Nothing is gated on the join being available, which is the difference between
 * these and the jobs hero's satellites: a satellite exists *for* the join and is
 * a dark spot without one, where three shapes in a line read as a constellation
 * whether or not anything can merge them. Each names its own `data-clip` —
 * two magnets on one page may not share one.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="processes-hero" class="hero hero--page hero--processes">
${orbitRings('processes-hero')}
  <div id="processes-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="processes-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-points="230" data-magnet-amp="28" data-magnet-sigma="97" data-clip="processLobe"><sa-node-field id="processes-hero-nodes-right"></sa-node-field></div>
    <div id="processes-hero-field-slot-drift-b" class="field-slot hero__drift hero__drift--b">
      <div id="processes-hero-field-drift-b" class="field" data-magnet data-magnet-free data-magnet-points="157" data-magnet-amp="22" data-magnet-sigma="66" data-clip="processBeadB"><sa-node-field id="processes-hero-nodes-drift-b"></sa-node-field></div>
    </div>
    <div id="processes-hero-field-slot-drift-c" class="field-slot hero__drift hero__drift--c">
      <div id="processes-hero-field-drift-c" class="field" data-magnet data-magnet-free data-magnet-points="58" data-magnet-amp="14" data-magnet-sigma="24" data-clip="processBeadC"><sa-node-field id="processes-hero-nodes-drift-c"></sa-node-field></div>
    </div>
    <div id="processes-hero-field-slot-drift-a" class="field-slot hero__drift hero__drift--a">
      <div id="processes-hero-field-drift-a" class="field" data-magnet data-magnet-free data-magnet-points="136" data-magnet-amp="20" data-magnet-sigma="57" data-clip="processBeadA"><sa-node-field id="processes-hero-nodes-drift-a"></sa-node-field></div>
    </div>
  </div>
  <div id="processes-hero-inner" class="hero__inner">
    <div id="processes-hero-text" class="hero__text">
      <h1 id="processes-hero-title">${t('processes.hero.title')}</h1>
      <!-- The standfirst, and it is the page's own description key rather than
           a line of its own. Every hero on the site was eyebrow, headline, two
           buttons and then 300px of paper: on a 1280x800 laptop the first
           sentence saying who this is for arrived at y≈800, under the fold. The
           sentence already existed — it is the page's own search snippet — so it
           is printed from that key instead of written a second time, which is
           also the only way the page and the snippet can never drift apart. -->
      <div id="processes-hero-actions" class="hero__actions">
        <a id="processes-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="processes-hero-cta-phases" class="btn btn--ghost" href="#phases">${t('processes.cta.phases')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe een traject verloopt — the four phases
 *
 * A sequence rather than a panel: an engagement runs all four in order, so there
 * is nothing to pick between and nothing to open. The homepage's `.steps`
 * vocabulary exactly, plus `.steps--four` — five columns with four steps in them
 * leaves a column of paper at the end of the row.
 *
 * The lede carries the one thing the four titles cannot say: that the review
 * starts from the work that already exists, and that "AI adds nothing here" is
 * part of the answer we come back with.
 * ------------------------------------------------------------------ */

function phases(t) {
  const steps = PHASES.map((n) => {
    const id = `processes-phase-${index(n)}`;

    return html`    <div id="${id}" class="step${n === 1 ? ' step--first' : ''}">
      <span id="${id}-index" class="step__index" aria-hidden="true">${index(n)}</span>
      <h3 id="${id}-title">${t(`processes.phase.${index(n)}.title`)}</h3>
      <p id="${id}-body">${t(`processes.phase.${index(n)}.body`)}</p>
    </div>`;
  });

  return html`<section id="phases" class="section" aria-labelledby="processes-phases-title">
  <div id="processes-phases-head" class="section__head">
    <h2 id="processes-phases-title" class="section-heading">${t('processes.phases.title')}</h2>
  </div>
  <p id="processes-phases-lede" class="section-lede">${t('processes.phases.lede')}</p>
  <div id="processes-phases-steps" class="steps steps--four">
${join(steps)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat u overhoudt — what the engagement leaves behind
 *
 * A hairline list, not cards and not a second sequence: these are four things
 * that exist at the same time when the engagement ends.
 *
 * No dark shape. One was drawn for the left gutter on the model of the staffing
 * page's leaf, and the leaf works because the opaque panel beside it clips its
 * right contour. A hairline list has no such wall, and a silhouette 78px wide
 * carrying its own contour read as a smear against the rows.
 * ------------------------------------------------------------------ */

function outcome(t) {
  const rows = OUTCOMES.map((key) => {
    const id = `processes-outcome-row-${key}`;

    return html`      <div id="${id}" class="row">
        <span id="${id}-title" class="row__title">${t(`processes.outcome.${key}.title`)}</span>
        <span id="${id}-body" class="row__body">${t(`processes.outcome.${key}.body`)}</span>
      </div>`;
  });

  return html`<section id="processes-outcome" class="section" aria-labelledby="processes-outcome-title">
  <div id="processes-outcome-head" class="section__head">
    <h2 id="processes-outcome-title" class="section-heading">${t('processes.outcome.title')}</h2>
  </div>
  <div id="processes-outcome-rows" class="rows">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact — the shared form, with the two lines this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({ t, lang, prefix: 'processes' });
}
