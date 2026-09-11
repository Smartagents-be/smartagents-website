// The AI-native business processes page: the detail page behind the
// "AI-native businessprocessen" service row on the homepage. It is the offer
// for the business side of an organisation, not the engineering side, and it
// is three blocks: the hero, the engagement, and what the engagement leaves
// behind. The form closes it while the reader is still on that last list.
//
// The page is deliberately the deeper version of two things the site already
// sells. The training page teaches a class ("AI voor business teams") and the
// staffing page puts a coach beside a team ("Coaching voor business teams");
// this is the engagement that takes one real process end to end and leaves
// reusable workflows, skills and agents behind. Nothing here says that out
// loud — a page that compares itself to two other pages is a page about the
// price list. It says it by being concrete about the work instead.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../build/lib/html.mjs';
import { index, orbitRings } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep, serviceNode } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * The four phases of the engagement, in the order they run. They are a
 * sequence and not a menu — every engagement runs all four, which is why this
 * block borrows the homepage's `.steps` vocabulary (numbered, one rule per
 * step, the first one cyan) rather than the staffing page's accordion.
 */
const PHASES = [1, 2, 3, 4];

/**
 * What is left behind when the four phases are done. Three of them are the
 * artefacts the client names in that order — a workflow, a skill, an agent,
 * each one more autonomous than the last — and the fourth is the people, which
 * is the only one that decides whether the other three survive the quarter.
 */
const OUTCOMES = ['workflows', 'skills', 'agents', 'people'];

export const page = {
  id: 'processes',
  slugs: { nl: 'ai-native-processen', en: 'ai-native-processes', fr: 'processus-ai-native' },

  meta: (t) => ({
    title: t('processes.title'),
    description: t('processes.description')
  }),

  /* What this page is, for a machine: one `Service` provided by the company
     node every page carries, and the trail back to the language root. Both are
     read off the same keys the page prints, so the graph cannot describe an
     offer the page no longer makes. */
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
 * Hero — four blobs in a line, and nothing fused.
 *
 * The page's headline is "Van uw taken naar herbruikbare workflows" — separate
 * pieces becoming one thing — so the hero is separate pieces: four shapes on a
 * descending line, growing left to right, ending in one big enough to be what
 * the other three are heading toward. It replaced a terrace hung off the right
 * page edge, which said nothing and filled the corner with a slab.
 *
 * **The last pair joins under the cursor and the others do not, and that is a
 * limit of the engine rather than a choice.** `src/motion.js` traces a join and
 * writes it into the first shape in DOM order whose box reaches the join's
 * window; anything past that shape's grown box — its own box plus `BLEED`,
 * 140px — is cut off, because there is nothing painted out there for the clip to
 * reveal. Between two *small* shapes there is no box wide enough: the union has
 * to reach the far side of the partner, so it needs `gap + partner width +
 * swell` to stay under 140, and two beads 100px across with a 50px gap are
 * already over it. What renders is a bead with a straight vertical chord sliced
 * out of it. This was drawn three ways before the constraint was understood —
 * five beads, then four evenly spaced, then four with even gaps — and every one
 * of them sliced somewhere.
 *
 * So the bead nearest the big blob sits 36 to 58px off it, inside the 60px a
 * join closes at, and joins cleanly because the *big* shape hosts it. The other
 * two stand 77 to 125px apart, which is past the limit at every width, so no
 * join is ever attempted between them and there is nothing to render wrong.
 * They still answer the cursor — each swells toward it — they simply never run
 * together. That is the honest version of "may or may not interact".
 *
 * `processLobe` is **first** in the DOM for the same reason: it has to be the
 * host of the one join that happens, and its box is drawn around the whole
 * composition with the blob authored into one corner of it (see `clipDefs()`).
 *
 * Nothing here is gated on the join being available, and that is the difference
 * between these and the jobs hero's two satellites. A satellite exists *for* the
 * join and is a dark spot on the paper without one, so it is dropped wherever a
 * join cannot happen. These four are the composition: four shapes in a line read
 * as a constellation whether or not anything can merge them, so they stay on a
 * coarse pointer and under `prefers-reduced-motion`, and only the phone drops
 * them — down there the first shape becomes the shared sliver and there is no
 * flank left to put the other three in.
 *
 * Each bead names its own `data-clip`. Two magnets on one page may not share
 * one: `src/motion.js` resolves the outline by id and rewrites that single path
 * in place, so the second remap wins and the first shape is left drawn into the
 * wrong box. It cost an afternoon of uneven gaps that no amount of moving the
 * boxes would fix.
 *
 * The magnet numbers are struck per blob from its own perimeter — sigma about
 * 14% of each outline's length, `points` a sample every 3px — which is the "a
 * big shape swells over a wider stretch of its edge than a small one" rule in
 * CLAUDE.md. Copying one set across four would slide the small ones bodily
 * toward the cursor instead of swelling them.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="processes-hero" class="hero hero--page hero--processes">
${orbitRings('processes-hero')}
  <div id="processes-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="processes-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-points="170" data-magnet-amp="32" data-magnet-sigma="72" data-clip="processLobe"><sa-node-field id="processes-hero-nodes-right"></sa-node-field></div>
    <div id="processes-hero-field-slot-drift-a" class="field-slot hero__drift hero__drift--a">
      <div id="processes-hero-field-drift-a" class="field" data-magnet data-magnet-free data-magnet-points="83" data-magnet-amp="20" data-magnet-sigma="35" data-clip="processBeadA"><sa-node-field id="processes-hero-nodes-drift-a"></sa-node-field></div>
    </div>
    <div id="processes-hero-field-slot-drift-b" class="field-slot hero__drift hero__drift--b">
      <div id="processes-hero-field-drift-b" class="field" data-magnet data-magnet-free data-magnet-points="107" data-magnet-amp="24" data-magnet-sigma="45" data-clip="processBeadB"><sa-node-field id="processes-hero-nodes-drift-b"></sa-node-field></div>
    </div>
    <div id="processes-hero-field-slot-drift-c" class="field-slot hero__drift hero__drift--c">
      <div id="processes-hero-field-drift-c" class="field" data-magnet data-magnet-free data-magnet-points="135" data-magnet-amp="28" data-magnet-sigma="57" data-clip="processBeadC"><sa-node-field id="processes-hero-nodes-drift-c"></sa-node-field></div>
    </div>
  </div>
  <div id="processes-hero-inner" class="hero__inner">
    <div id="processes-hero-text" class="hero__text">
      <p id="processes-hero-eyebrow" class="page-eyebrow">${t('processes.hero.eyebrow')}</p>
      <h1 id="processes-hero-title">${t('processes.hero.title')}</h1>
      <div id="processes-hero-actions" class="hero__actions">
        <a id="processes-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="processes-hero-cta-phases" class="btn btn--ghost" href="#phases">${t('processes.cta.phases')} <span id="processes-hero-cta-phases-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Hoe een traject verloopt — the four phases
 *
 * The one figure on the page, and it is a sequence rather than a panel: an
 * engagement runs all four phases in order, so there is nothing for a reader
 * to pick between and nothing to open. That is the homepage's `.steps`
 * vocabulary exactly — a rule along the top of each step with its dot sitting
 * on it, a monospace index, and the first rule in cyan so the reading order is
 * unambiguous — and it is reused here rather than redrawn. The only thing this
 * page adds is `.steps--four`: five columns with four steps in them leaves a
 * column of paper at the end of the row.
 *
 * The lede under the heading carries the one thing the four titles cannot say
 * on their own: that the review starts from the work that already exists, and
 * that "AI adds nothing here" is part of the answer we come back with. It is
 * the same register as `step.1.body` on the homepage, which is where the site
 * says this first.
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
 * Wat u overhoudt — the four things the engagement leaves behind
 *
 * A hairline list, not cards and not a second sequence: these are four things
 * that exist at the same time when the engagement ends, and the row idiom is
 * what the site uses for exactly that. It is the training page's benefit list
 * with a different argument in it.
 *
 * No dark shape. A second one was drawn for the left gutter here, on the model
 * of the AI staffing page's leaf, and it was wrong for a reason worth writing
 * down: the leaf works because the track panel beside it is opaque and clips
 * it, so its right contour is never shown and the panel edge hands it a crisp
 * counter-edge. A hairline list has no such wall. The same shape beside it has
 * to carry its own contour, and a silhouette 78px wide and 546px tall does not
 * have the width to draw one — it read as a smear against the rows, and under
 * the cursor it reached past the row padding onto the first word. The hero
 * carries this page's dark field on its own, and the paper is the
 * counterweight.
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
  return contactSection({
    t,
    lang,
    prefix: 'processes',
    title: t('processes.cta.title'),
    lede: t('processes.cta.body')
  });
}
