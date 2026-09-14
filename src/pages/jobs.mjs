// The jobs page: the one page on the public site written for someone who wants
// to work here rather than to buy something. Three blocks — the hero, the open
// vacancies, why to join — and nothing between them.
//
// It is the only public page with no contact section, the privacy notice aside,
// and that is deliberate: Odoo's own form per vacancy is where an application
// belongs, and a second form posting to the sales webhook would be the same
// person arriving in the wrong system.
//
// **It is the one page written in `je`.** The design README asks for formal `u`,
// which is right for a page addressed to someone deciding whether to buy. This
// one is addressed to someone deciding whether to apply, and the client's own
// jobs page is in `je` throughout. French keeps `vous`.
//
// **The vacancies are Odoo's, not this repo's.** `build/lib/odoo-jobs.mjs` reads
// every published job at build time in all three languages and runs the reviewed
// corrections in `src/content/jobs/editorial-copy.json` over them. What this
// repo owns is the chrome around the list, in `src/i18n`.
//
// **Nothing below the hero is a new idiom**: the staffing page's accordion for
// the vacancies, the plain hairline `.rows` list under it. The hero is the
// exception and the whole of this page's own drawing.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join, raw } from '../../build/lib/html.mjs';
import { index, orbitRings, teamPath } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep } from '../layouts/schema.mjs';

export const page = {
  id: 'jobs',
  slugs: { nl: 'jobs', en: 'jobs', fr: 'emplois' },

  /* Only the trail back to the language root. This page is not a `Service` and
     not a set of `JobPosting`s either: Google's wants a `datePosted` and a
     `validThrough`, this page prints neither, and nothing in the graph may say
     something the page does not. Odoo already publishes each job at its own
     indexable URL. */
  schema: ({ t, lang, url }) => [breadcrumbNode([homeStep(t, lang), { name: t('nav.jobs'), url }])],

  render: ({ t, lang, vacancies: jobs }) => html`<main id="main" tabindex="-1">

${hero(t)}
${convince(t, lang)}
${vacancies(t, jobs || [])}

</main>`
};

/* ------------------------------------------------------------------ *
 * Hero — the page hero, carrying this page's own silhouette.
 *
 * **Three shapes, not one, and the cursor decides how many.** Two smaller ones
 * drift in the pockets the diagonal leaves, resting 37 to 68px off the main
 * outline against the 60px a join closes at (measured on the *displaced*
 * outlines). They are the two silhouettes the staffing arch has shed, reused
 * rather than redrawn — `heroPebbleA` is now shared by three compositions, so
 * changing it for one moves the other two.
 *
 * Both are printed only where a join can happen: `.hero__drift` in main.css
 * carries the negative of the gates `src/motion.js` arms the magnets on. What
 * CSS cannot reach is JS that never runs.
 *
 * Their magnet numbers are struck from their own perimeters, not copied off the
 * main shape: sigma is about 14% of each outline's length (42 and 32 against the
 * main's 104). At the main shape's sigma a third of a pebble's outline moved at
 * once and the whole pebble slid toward the cursor instead of swelling.
 *
 * The amplitude is set by the neck rather than the box: the box argues the swell
 * up, the 0.174 neck argues it back down, and the neck wins. Measured by driving
 * the pointer into the lower lobe's flank, at 78 the swell filled the neck in and
 * the silhouette closed into a single kidney; at 52 it breathes and holds. Move
 * the lobes in `clipDefs()` and this has to be measured again, in that order.
 *
 * No eyebrow: `.page-eyebrow` names the section a detail page belongs to, and
 * this page belongs to none. One action, where every other hero carries two —
 * applying happens in Odoo, so the only honest destination is the list.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="jobs-hero" class="hero hero--page hero--jobs">
${orbitRings('jobs-hero')}
  <div id="jobs-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="jobs-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-points="400" data-magnet-amp="52" data-magnet-sigma="104" data-clip="jobsJoin"><sa-node-field id="jobs-hero-nodes-right"></sa-node-field></div>
    <div id="jobs-hero-field-slot-drift-a" class="field-slot hero__drift hero__drift--a">
      <div id="jobs-hero-field-drift-a" class="field" data-magnet data-magnet-free data-magnet-points="100" data-magnet-amp="26" data-magnet-sigma="42" data-clip="heroPebbleB"><sa-node-field id="jobs-hero-nodes-drift-a"></sa-node-field></div>
    </div>
    <div id="jobs-hero-field-slot-drift-b" class="field-slot hero__drift hero__drift--b">
      <div id="jobs-hero-field-drift-b" class="field" data-magnet data-magnet-free data-magnet-points="78" data-magnet-amp="22" data-magnet-sigma="32" data-clip="heroPebbleA"><sa-node-field id="jobs-hero-nodes-drift-b"></sa-node-field></div>
    </div>
  </div>
  <div id="jobs-hero-inner" class="hero__inner">
    <div id="jobs-hero-text" class="hero__text">
      <h1 id="jobs-hero-title">${t('jobs.hero.title')}</h1>
      <!-- The standfirst, and it is the page's own description key rather than
           a line of its own. Every hero on the site was eyebrow, headline, two
           buttons and then 300px of paper: on a 1280x800 laptop the first
           sentence saying who this is for arrived at y≈800, under the fold. The
           sentence already existed — it is the page's own search snippet — so it
           is printed from that key instead of written a second time, which is
           also the only way the page and the snippet can never drift apart. -->
      <div id="jobs-hero-actions" class="hero__actions">
        <a id="jobs-hero-cta-vacancies" class="btn btn--primary" href="#vacancies">${t('jobs.cta.vacancies')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Openstaande vacatures — one row per vacancy, one open at a time
 *
 * The staffing page's panel with vacancies in it: `<details>` sharing a `name`,
 * so it works with JS off, and `<sa-accordion>` takes over when it loads.
 *
 * The panel stands on paper with no shape beside it. The staffing page's pair is
 * that composition's — the leaf only works because an opaque panel clips its far
 * contour — and reaching for it here would be copying a drawing.
 * ------------------------------------------------------------------ */

/**
 * One vacancy, as Odoo published it: the role and the description are Odoo's,
 * everything around them this repo's, so the page reads as the site in three
 * languages while the vacancy is never written twice.
 *
 * The row does not print the place. Odoo sends one and `odoo-jobs.mjs` still
 * normalises it, but every vacancy carries the same address, and a tag that
 * reads the same on every row places nothing. The address is in the footer.
 *
 * The action goes to that job's own application form, so a candidate lands in
 * Recruitment with a stage and a file rather than in the contact webhook.
 *
 * The role is an `<h3>` inside the `<summary>`, the way a track's name is, or
 * the open vacancies would be the only named blocks missing from the outline.
 * The id key is Odoo's slug — stable per job and language-independent, the two
 * things element-ids §4 asks; a loop index would renumber every row below one
 * that closes.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {object} options.job    one normalised vacancy (build/lib/odoo-jobs.mjs)
 * @param {boolean} options.open  whether the row stands open on arrival
 */
function vacancy({ t, job, open }) {
  const id = `jobs-vacancy-${job.slug}`;

  const points = job.points.map(
    (point, i) => html`              <li id="${id}-point-${index(i + 1)}" class="track__point">${point}</li>`
  );

  return html`      <details id="${id}" class="track" name="jobs-vacancy"${open ? raw(' open') : ''}>
        <summary id="${id}-summary" class="track__summary">
          <div id="${id}-head" class="track__head">
            <h3 id="${id}-title" class="track__title">${job.title}</h3>
          </div>
          <span id="${id}-chevron" class="track__chevron" aria-hidden="true"></span>
        </summary>
        <div id="${id}-panel" class="track__panel">
          <div id="${id}-panel-inner" class="track__inner">${points.length ? html`
            <ul id="${id}-points" class="track__points">
${join(points)}
            </ul>` : ''}
            <p id="${id}-actions" class="track__actions">
              <a id="${id}-apply" class="btn btn--primary" href="${job.applyUrl}" target="_blank" rel="noopener noreferrer">${t('jobs.cta.apply')}<span id="${id}-apply-hint" class="visually-hidden"> (${t('a11y.newTab')})</span></a>
            </p>
          </div>
        </div>
      </details>`;
}

/**
 * The block, or the sentence that stands in for it. A vacancy list is the one
 * block on this site that can legitimately be empty, and when it is the section
 * keeps its heading rather than disappearing and leaving the hero pointing at an
 * anchor that is not there.
 *
 * A plain open row when there is exactly one vacancy: a disclosure with a single
 * row is a control that only ever hides the thing the reader came for.
 */
function vacancies(t, jobs) {
  if (jobs.length === 0) {
    return html`<section id="vacancies" class="section" aria-labelledby="jobs-vacancies-title">
  <div id="jobs-vacancies-head" class="section__head">
    <h2 id="jobs-vacancies-title" class="section-heading">${t('jobs.vacancies.title')}</h2>
  </div>
  <p id="jobs-vacancies-lede" class="section-lede">${t('jobs.vacancies.lede')}</p>
  <p id="jobs-vacancies-empty" class="jobs-empty">${t('jobs.vacancies.empty')}</p>
</section>`;
  }

  const rows = jobs.map((job, i) => vacancy({ t, job, open: i === 0 || jobs.length === 1 }));

  return html`<section id="vacancies" class="section" aria-labelledby="jobs-vacancies-title">
  <div id="jobs-vacancies-head" class="section__head">
    <h2 id="jobs-vacancies-title" class="section-heading">${t('jobs.vacancies.title')}</h2>
  </div>
  <p id="jobs-vacancies-lede" class="section-lede">${t('jobs.vacancies.lede')}</p>
  <div id="jobs-vacancies-ground" class="tracks">
    <sa-accordion id="jobs-vacancies-panel" class="tracks__panel">
${join(rows)}
    </sa-accordion>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Waarom SmartAgents — what is true around the work, and why join
 *
 * Two paragraphs at the reading measure, the team page's own `.story`
 * treatment: this reads as warm, continuous writing that pulls a candidate
 * in, not a row list. Folds in what used to be the separate "Werken bij
 * SmartAgents" row list (what you build, who with, what you learn) rather
 * than keeping two sections that both answer "why work here". Everything
 * here is traceable to copy already published elsewhere on the site (the DNA
 * section, the team page's own story), so nothing is a new promise about
 * employment terms.
 *
 * The one link — to the team page — sits inside the second paragraph's own
 * sentence rather than as a trailing cue: the source string carries the
 * link's label in square brackets, the same mechanism the contact form's
 * privacy line uses, because where a link falls in a sentence is a
 * translator's decision and Dutch, English and French do not agree on it.
 * ------------------------------------------------------------------ */

function convince(t, lang) {
  const team = teamPath(lang);

  const paragraphs = ['1', '2'].map((n) => {
    const text = t(`jobs.convince.${n}`);
    const parts = text.match(/^(.*)\[(.+)\](.*)$/);

    if (!parts) return html`      <p id="jobs-convince-body-${n}">${text}</p>`;

    const [, before, label, after] = parts;
    return html`      <p id="jobs-convince-body-${n}">${before}<a id="jobs-convince-body-${n}-link" href="${team}">${label}</a>${after}</p>`;
  });

  return html`<section id="jobs-convince" class="section" aria-labelledby="jobs-convince-title">
  <div id="jobs-convince-head" class="section__head">
    <h2 id="jobs-convince-title" class="section-heading">${t('jobs.convince.title')}</h2>
  </div>
  <div id="jobs-convince-body" class="story">
${join(paragraphs)}
  </div>
</section>`;
}
