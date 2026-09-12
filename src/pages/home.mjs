// The homepage, built from direction 1a ("Redactioneel — licht, lijnen, veel
// lucht") of the "Smartagents.be Redesign Direction" design project.
// Structure, spacing, colour and motion all come from the design system:
// see .claude/skills/smartagents-design/README.md.
import { html, join } from '../../build/lib/html.mjs';
import { orbitRings, servicePath } from '../layouts/base.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';
import { articleRows, insightsIndexPath } from './insights/insights.mjs';

// The four services, in the order they are offered. Training and AI staffing
// lead because they are the two a reader arrives already looking for; the two
// AI-native tracks follow, engineering first, because the SDLC page names the
// journey the business page is part of.
const SERVICES = ['training', 'staffing', 'sdlc', 'processes'];
const DNA = ['1', '2', '3', '4'];

export const page = {
  id: 'home',
  // One entry per language. An empty slug is that language's root, e.g. /nl/.
  slugs: { nl: '', en: '', fr: '' },

  render: ({ t, lang }) => html`<main id="main" tabindex="-1">

${hero(t)}
${services(t, lang)}
${dna(t)}
${insights(t, lang)}
${contact(t, lang)}

</main>`
};

/* ------------------------------------------------------------------ *
 * Hero — the copy ranged left in a column of its own, a dark shape on each
 * flank: a petal hung off the right edge, its counter-lobe rising out of the
 * bottom-left and a rounded island beside it. All share the same dark field.
 *
 * `data-magnet-pin` welds each shape to the page edge it hangs from, which is
 * why both can opt out of the nav guard with `data-magnet-free`.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="home-hero" class="hero">
${orbitRings('home-hero')}
  <div id="home-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="home-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="480" data-magnet-amp="86" data-magnet-sigma="118" data-clip="heroPetal"><sa-node-field id="home-hero-nodes-right"></sa-node-field></div>
  </div>
  <div id="home-hero-field-slot-left" class="field-slot hero__field hero__field--left" aria-hidden="true">
    <div id="home-hero-field-left" class="field" data-magnet data-magnet-free data-magnet-pin="left" data-magnet-points="360" data-magnet-amp="46" data-magnet-sigma="110" data-clip="heroLobe"><sa-node-field id="home-hero-nodes-left"></sa-node-field></div>
    <div id="home-hero-island-slot" class="field-slot hero__island-slot">
      <div id="home-hero-field-island" class="field" data-magnet data-magnet-free data-magnet-points="220" data-magnet-amp="30" data-magnet-sigma="80" data-clip="homeHeroIsland"><sa-node-field id="home-hero-nodes-island"></sa-node-field></div>
    </div>
  </div>
  <div id="home-hero-inner" class="hero__inner">
    <div id="home-hero-text" class="hero__text">
      <!-- The wordmark that used to open this block is gone. It printed the
           brand a second time 120px under the header's own wordmark, pushed the
           offer below y=1000 on a laptop, and left the page's one heading
           reading "SmartAgents Digitale collega's die nooit slapen" — a claim
           with nothing under it saying what is sold or to whom. The claim is
           the heading now, at the size the wordmark had, and the line under it
           is the sentence the head has always carried in the page's own
           description key: read from there rather than written again, so the
           page and its search snippet can never say two different things. -->
      <h1 id="home-hero-title">${t('hero.claim')}</h1>
      <div id="home-hero-actions" class="hero__actions">
        <a id="home-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="home-hero-cta-work" class="btn btn--ghost" href="#services">${t('cta.seeWork')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat we doen — hairline-separated rows, not cards
 *
 * A service with a detail page of its own is a link and carries the cue. All
 * four have one today, but the plain-row branch stays: a service is only a link
 * in a language its page is published in, and `servicePath()` returns null
 * everywhere else.
 *
 * The cue is the arrow and nothing else. "Ontdek →" printed on four service rows
 * and four article rows is one word eight times on a page of 1152px links whose
 * own titles already name the destination.
 * It stands inside the title: alone in a third column it was a glyph in 116px
 * of paper, and a cue is read off the thing it is a cue for. The no-break space
 * in front of it is load-bearing (see `.row__cue` in `main.css`).
 * ------------------------------------------------------------------ */

function services(t, lang) {
  const rows = SERVICES.map((key) => {
    const id = `home-services-row-${key}`;
    const href = servicePath(key, lang);

    const content = html`    <span id="${id}-title" class="row__title">${t(`service.${key}.title`)}${href
      ? html`&nbsp;<span id="${id}-cue" class="row__cue" aria-hidden="true">&rarr;</span>`
      : ''}</span>
    <span id="${id}-body" class="row__body">${t(`service.${key}.body`)}</span>`;

    return href
      ? html`<a id="${id}" class="row" href="${href}">
${content}
  </a>`
      : html`<div id="${id}" class="row">
${content}
  </div>`;
  });

  return html`<section class="section" id="services" aria-labelledby="home-services-title">
  <div id="home-services-head" class="section__head">
    <h2 id="home-services-title" class="section-heading">${t('section.services')}</h2>
  </div>
  <div id="home-services-rows" class="rows rows--pair">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Ons DNA — the disc and its rotating helix
 * ------------------------------------------------------------------ */

function dna(t) {
  const items = DNA.map(
    (n) => html`<div id="home-dna-item-${n}" class="numbered numbered--plain">
      <div id="home-dna-item-${n}-inner">
        <h3 id="home-dna-item-${n}-title" class="numbered__title">${t(`dna.${n}.title`)}</h3>
        <p id="home-dna-item-${n}-body">${t(`dna.${n}.body`)}</p>
      </div>
    </div>`
  );

  return html`<section class="section" id="dna" aria-labelledby="home-dna-title">
  <div id="home-dna-head" class="section__head section__head--wide">
    <h2 id="home-dna-title" class="section-heading">${t('section.dna')}</h2>
  </div>
  <div id="home-dna-inner" class="dna">
    <!-- The disc's outline runs along the top and the right of its own box, and
         a guarded shape is refused a pull from an edge that does — the guard is
         there to stop a hero shape swelling up under the nav bar. This one is a
         figure in the middle of a section with clear paper above it, so it opts
         out, and states the amplitude a guarded shape would have had by
         default: without that it drops to the free default of 34, which on a
         shape this size is barely a pull at all. -->
    <div id="home-dna-figure" class="dna__figure" data-helix-frame aria-hidden="true">
      <div id="home-dna-disc" class="field dna__disc" data-magnet data-magnet-free data-magnet-amp="92" data-clip="dnaField">
        <div id="home-dna-helix" class="dna__helix"><sa-node-field id="home-dna-helix-nodes" variant="helix"></sa-node-field></div>
      </div>
      <div id="home-dna-blob" class="field dna__blob" data-magnet data-magnet-free data-clip="dnaBlob"><sa-node-field id="home-dna-blob-nodes"></sa-node-field></div>
    </div>
    <div id="home-dna-list" class="dna__list">
${join(items)}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Inzichten — the one list on this page that carries pictures.
 *
 * The rows stay rows: a thumbnail, the title with its excerpt directly
 * underneath, then the date and the badges at the right edge. The article reads
 * as one block in one measure, and the row stays about as tall as its picture.
 *
 * Each thumbnail is a 16:9 crop framed like the founder portraits, with the same
 * cool grade that pulls a photograph, an illustration and a screenshot into one
 * family. See "Deviations from the design doc", item 5.
 * ------------------------------------------------------------------ */

function insights(t, lang) {
  const archive = insightsIndexPath(lang);

  return html`<section class="section section--orbits" id="insights" aria-labelledby="home-insights-heading">
${orbitRings('home-insights', 'orbits--insights', ['01', '02', '03', '04'])}
  <div id="home-insights-head" class="section__head">
    <h2 id="home-insights-heading" class="section-heading">${t('section.insights')}</h2>${archive
      ? html`
    <a id="home-insights-all" class="section-link" href="${archive}">${t('cta.allArticles')} <span id="home-insights-all-arrow" aria-hidden="true">&rarr;</span></a>`
      : ''}
  </div>
  <div id="home-insights-list" class="rows rows--cards">
${join(articleRows({ t, lang, prefix: 'home-insights' }))}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({ t, lang, prefix: 'home', title: t('contact.title'), lede: t('contact.lede') });
}
