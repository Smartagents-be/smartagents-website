// The jobs page: the one page on the public site written for someone who wants
// to work here rather than to buy something. Three blocks — the hero, the open
// vacancies, what the job is like around the work — and nothing between them:
// no eyebrow, no standfirst, no lede under a heading, nothing numbered and
// nothing that announces how many of a thing follow.
//
// It is also the only public page with no contact section, the privacy notice
// aside, and that is deliberate rather than an omission. Applying is what this
// page is for and Odoo's own form per vacancy is where an application belongs:
// a candidate who fills it in lands in Recruitment with a stage and a file. A
// second form underneath, posting to the sales webhook, would be the same
// person arriving in the wrong system by picking the wrong box.
//
// Two things about it are worth knowing before editing.
//
// **It is the one page written in `je`.** The design README's content rule is
// formal `u`, never `je`, and it is right for every other page: those are
// addressed to the person deciding whether to buy. This one is addressed to the
// person deciding whether to apply, and the client's own live jobs page — the
// source this page is ported from — is in `je` throughout ("Sluit je aan bij ons
// team", "Wat je gaat doen"). French keeps `vous`, because French has no
// register that reads as friendly-and-professional the way Belgian Dutch `je`
// does in a job ad. Copy on this page follows the client's jobs voice; copy on
// every other page follows the site's.
//
// **The vacancies are Odoo's, not this repo's.** `hr.job` on the recruitment
// site is the source of truth: `build/lib/odoo-jobs.mjs` reads every published
// job at build time, in all three languages, and the page renders whatever came
// back. Nothing about a vacancy is authored here — adding, editing or closing
// one happens in Odoo and reaches the site on the next build, which a
// Cloudflare deploy hook triggers. What this repo still owns is the chrome
// around the list, in `src/i18n`: the heading, the word for the place, the
// label on the action, and the sentence that stands in for the block when
// nothing is open. The action itself goes to that job's Odoo application form,
// so an applicant lands in Recruitment rather than in the contact webhook.
//
// **Nothing below the hero is a new idiom.** The vacancies are the AI staffing
// page's accordion (`.tracks` / `.track`, `<sa-accordion>`) — the same argument
// that put the three tracks in one: a reader picks the one that is theirs and
// reads only that, where three columns side by side would be a table they
// compare. What is under them is the plain hairline `.rows` list every other
// page uses. The hero is the exception and it is the whole of this page's own
// drawing: `jobsJoin` floats free in the flank where the other five heroes
// stand a shape on a page edge.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join, raw } from '../../build/lib/html.mjs';
import { index, orbitRings, teamPath } from '../layouts/base.mjs';
import { breadcrumbNode, homeStep } from '../layouts/schema.mjs';

/**
 * What the job is like around the work itself: what you build, who you build it
 * with, and what a year of it does for you.
 *
 * What is *not* in the list is the point of the list. It briefly carried a flat
 * structure, a share in the company, remote-first and hours not counted, all
 * four written from the old marketing page and none of them confirmed. Every
 * one of those is a promise to a candidate about their own employment, which is
 * the one kind of copy on this site that may not be inferred: it is confirmed
 * by the people who would have to honour it, or it is not published. The three
 * that are here describe the work, which is a thing the company can be held to
 * without anyone signing a contract about it.
 *
 * `team` is the row that goes somewhere — the answer to "who would I be working
 * with" is the team page, and it answers it better than a row can.
 */
const REASONS = ['work', 'team', 'learn'];

export const page = {
  id: 'jobs',
  slugs: { nl: 'jobs', en: 'jobs', fr: 'emplois' },

  meta: (t) => ({
    title: t('jobs.title'),
    description: t('jobs.description')
  }),

  /* Only the trail back to the language root. This page is not a `Service` —
     nothing on it is for sale — and it is not a set of `JobPosting`s either,
     which is worth saying now that the vacancies are real records with real
     fields. Google's `JobPosting` wants a `datePosted` and a `validThrough`,
     and this page prints neither; the rule at the top of `schema.mjs` is that
     nothing in the graph may say something the page does not. Odoo already
     publishes each job at its own indexable URL, which is the canonical place
     for that markup. If it is ever wanted here, the dates have to become
     fields the page shows first. */
  schema: ({ t, lang, url }) => [breadcrumbNode([homeStep(t, lang), { name: t('nav.jobs'), url }])],

  render: ({ t, lang, vacancies: jobs }) => html`<main id="main" tabindex="-1">

${hero(t)}
${vacancies(t, jobs || [])}
${reasons(t, lang)}

</main>`
};

/* ------------------------------------------------------------------ *
 * Hero — the page hero, carrying this page's own silhouette.
 *
 * **Three shapes, not one, and the cursor decides how many.** Two smaller ones
 * drift in the pockets the diagonal leaves — `heroPebbleB` in the upper right,
 * `heroPebbleA` in the lower left — resting 37 to 68px off the main outline
 * against the 60px a join closes at (`2·MERGE·ln2·ONSET` in `src/motion.js`,
 * measured on the *displaced* outlines, so at rest they are plainly three
 * shapes and under a cursor brought between them they run together into one
 * fluid). It is the training hero's bead, twice and at a lower weight: the same
 * two silhouettes the AI staffing arch has shed, reused rather than redrawn,
 * because what they say here is the same sentence. `heroPebbleA` is now shared
 * by three compositions — change it for one and the other two move with it.
 *
 * Both are printed only where a join can happen, which is the whole reason they
 * are here: `.hero__drift` in main.css carries the negative of the gates
 * `src/motion.js` arms the magnets on, so a coarse pointer, a narrow window and
 * `prefers-reduced-motion` all drop them. What CSS cannot reach is JS that never
 * runs, and that is the one state where they are two dark spots on the paper
 * with nothing to have come away from.
 *
 * Their magnet numbers are struck from their own perimeters and not copied off
 * the main shape: sigma is about 14% of each outline's length (42 and 32 against
 * the main's 104) and `points` a sample every 3px, which is the "a big shape
 * swells over a wider stretch of its edge than a small one" rule in CLAUDE.md.
 * At the main shape's sigma a third of a pebble's outline moved at once and the
 * whole pebble slid toward the cursor instead of swelling.
 *
 * `jobsJoin` is welded to nothing: it floats in the hero's right flank with
 * paper all the way round it, the only silhouette on the public site that does.
 * It was hung off the header's hairline for four drafts and every one of them
 * read as something growing out of the navigation rather than as a shape — the
 * argument and the four failures are in `clipDefs()`, the box is in the
 * "Detail pages — jobs" block in main.css.
 *
 * There is **no `data-magnet-pin`** any more, because there is no edge to pin
 * to. `data-magnet-free` stays, and it is now taken for the reason CLAUDE.md
 * gives first rather than second: the shape is nowhere near the nav or a page
 * edge, so the guard that refuses a pull from a tucked-under edge has nothing
 * to guard. It also sets the amplitude default, which is why this element still
 * states its own.
 *
 * The amplitude is well under the petal's (52 against 86) and the sigma a
 * little over it (104 against 96), and the pair is set by the neck rather than
 * by the box. The box is 533px wide at 1440 where the first draft's was 403,
 * which argues the swell up; the neck between the two lobes is 0.174 of the box
 * on a diagonal, which argues it back down, and the neck wins. Measured by
 * driving the pointer into the lower lobe's flank: at 78 the swell filled the
 * neck in and the silhouette closed into a single kidney — the site's own
 * signature interaction erasing the one articulation the drawing has — and at
 * 52 it breathes and holds. 52 is not a weaker pull than the site's, either: at
 * a 16px cursor offset this outline travels 23px against the training petal's
 * 16. Both numbers are read on the *displaced* outline. Move the lobes in
 * `clipDefs()` and this has to be measured again, in that order.
 *
 * No eyebrow. `.page-eyebrow` is the section a detail page belongs to, printed
 * over the headline, and this page belongs to no section: it is not one of the
 * four services and there is nothing above it but the homepage. The headline
 * says the whole of it.
 *
 * One action, where every other page hero carries two. The second was
 * `cta.talk` pointing at this page's own contact form, and the form is gone:
 * applying happens in Odoo now, on the vacancy itself, so the only thing the
 * hero can honestly send a reader to is the list. A second button beside it
 * would have to invent a destination.
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
      <div id="jobs-hero-actions" class="hero__actions">
        <a id="jobs-hero-cta-vacancies" class="btn btn--primary" href="#vacancies">${t('jobs.cta.vacancies')} <span id="jobs-hero-cta-vacancies-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Openstaande vacatures — one row per vacancy, one open at a time
 *
 * The AI staffing page's panel, with vacancies in it. Every row is a
 * `<details>` sharing a `name`, so the block works with JS off — the rows open,
 * and the browser closes the open one when another opens — and `<sa-accordion>`
 * takes both over when it loads, which is the only way either of them travels
 * rather than snaps.
 *
 * The panel stands on paper with no shape beside it. The two the staffing page
 * flanks its panel with are that composition's, and the leaf in particular only
 * works because an opaque panel clips its far contour; a second page reaching
 * for the pair would be copying a drawing rather than using a vocabulary.
 * ------------------------------------------------------------------ */

/**
 * One vacancy, as Odoo published it.
 *
 * Everything inside the row is Odoo's: the role, the place, and the lines of
 * the job description. Everything around it is this repo's — the heading, the
 * word for the place, the action's label — so the page reads as the site in
 * three languages while the vacancy itself is never written twice.
 *
 * The action is the point of the whole integration. It goes to that job's own
 * application form on the recruitment site, so a candidate lands in Recruitment
 * with a stage and a file rather than in the contact webhook. It opens in a new
 * tab, like every other off-site link here, and says so to a screen reader.
 *
 * The role is an `<h3>` inside the `<summary>`, the way a track's name is:
 * `<summary>` takes heading content, and without one the open vacancies would
 * be the only named blocks on the site missing from the heading outline.
 *
 * The id key is Odoo's slug, which is stable per job and language-independent
 * — the two things element-ids §4 asks of a key. A loop index would renumber
 * every row below one that closes.
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
            <h3 id="${id}-title" class="track__title">${job.title}</h3>${job.location ? html`
            <ul id="${id}-tags" class="track__tags">
              <li id="${id}-tag-location" class="track__tag">${job.location}</li>
            </ul>` : ''}
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
 * The block, or the sentence that stands in for it.
 *
 * A vacancy list is the one block on this site that can legitimately be empty:
 * Odoo is the source and Odoo can have nothing published. When it does, the
 * section keeps its heading and prints the one line that is true — there is
 * nothing open, write to us anyway — rather than disappearing and leaving the
 * page's own hero pointing at an anchor that is not there.
 *
 * The panel is a `<sa-accordion>` when there is more than one row and a plain
 * open row when there is exactly one. A disclosure with a single row is a
 * control that only ever hides the thing the reader came for.
 */
function vacancies(t, jobs) {
  if (jobs.length === 0) {
    return html`<section id="vacancies" class="section" aria-labelledby="jobs-vacancies-title">
  <div id="jobs-vacancies-head" class="section__head">
    <h2 id="jobs-vacancies-title" class="section-heading">${t('jobs.vacancies.title')}</h2>
  </div>
  <p id="jobs-vacancies-empty" class="jobs-empty">${t('jobs.vacancies.empty')}</p>
</section>`;
  }

  const rows = jobs.map((job, i) => vacancy({ t, job, open: i === 0 || jobs.length === 1 }));

  return html`<section id="vacancies" class="section" aria-labelledby="jobs-vacancies-title">
  <div id="jobs-vacancies-head" class="section__head">
    <h2 id="jobs-vacancies-title" class="section-heading">${t('jobs.vacancies.title')}</h2>
  </div>
  <div id="jobs-vacancies-ground" class="tracks">
    <sa-accordion id="jobs-vacancies-panel" class="tracks__panel">
${join(rows)}
    </sa-accordion>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Werken bij SmartAgents — the four things that are true around the work
 *
 * The hairline row list, unchanged: four things that are all true at the same
 * time, which is exactly what that idiom is for. One of them links — "met wie
 * je werkt" goes to the team page, through `teamPath()` the way every other row
 * on the site links out, and renders plain in a language the team page is not
 * published in.
 * ------------------------------------------------------------------ */

function reasons(t, lang) {
  const team = teamPath(lang);

  const rows = REASONS.map((key) => {
    const id = `jobs-reason-${key}`;
    const href = key === 'team' ? team : null;

    const inner = html`        <span id="${id}-title" class="row__title">${t(`jobs.why.${key}.title`)}</span>
        <span id="${id}-body" class="row__body">${t(`jobs.why.${key}.body`)}</span>${href ? html`
        <span id="${id}-cue" class="row__cue" aria-hidden="true">${t('cta.moreInfo')} &rarr;</span>` : ''}`;

    return href
      ? html`      <a id="${id}" class="row" href="${href}">
${inner}
      </a>`
      : html`      <div id="${id}" class="row">
${inner}
      </div>`;
  });

  return html`<section id="jobs-why" class="section" aria-labelledby="jobs-why-title">
  <div id="jobs-why-head" class="section__head">
    <h2 id="jobs-why-title" class="section-heading">${t('jobs.why.title')}</h2>
  </div>
  <div id="jobs-why-rows" class="rows">
${join(rows)}
  </div>
</section>`;
}
