// The homepage, built from direction 1a ("Redactioneel — licht, lijnen, veel
// lucht") of the "Smartagents.be Redesign Direction" design project.
// Structure, spacing, colour and motion all come from the design system:
// see .claude/skills/smartagents-design/README.md.
import { html, join, raw } from '../../build/lib/html.mjs';
import { logoMark, orbitRings, trainingPath } from '../layouts/base.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

const SERVICES = ['process', 'agentic', 'training', 'staffing'];
const DNA = ['1', '2', '3', '4'];
const TRANSFORMATION = ['1', '2', '3', '4'];
const STEPS = ['1', '2', '3', '4', '5'];
/**
 * The articles the homepage lists, newest first. Everything here is
 * language-independent: the key names the piece, `thumb` is the stem of its
 * derivations in `/media/insights/`, `widths` are the widths that stem was
 * derived at (the launch photograph is a small original and stops at 480w),
 * and `tags` name the shared `article.tag.*` labels. All prose comes from
 * `t()` under `article.<key>.*`.
 */
const ARTICLES = [
  { key: 'aviso', thumb: 'aviso', widths: [320, 480, 760], tags: ['news', 'ai'] },
  { key: 'what-works', thumb: 'what-works', widths: [320, 480, 760], tags: ['ai', 'tips'] },
  { key: 'smartspace', thumb: 'smartspace', widths: [320, 480, 760], tags: ['news', 'ai'] },
  { key: 'launch', thumb: 'launch', widths: [320, 480], tags: ['news'] }
];

/**
 * A thumbnail is 208px in the listing, 156px on a tablet and 116px once the
 * row has only the page gutter left to give it.
 */
const THUMB_SIZES = '(max-width: 620px) 116px, (max-width: 1080px) 156px, 208px';

const thumbSrcset = (stem, widths, extension) =>
  widths.map((width) => `/media/insights/${stem}-${width}.${extension} ${width}w`).join(', ');

/** `01`-style monospace index; numbers act as the icons in this system. */
const index = (n) => String(n).padStart(2, '0');

/** Repeat a bare element n times — the isometric planes are pure texture. */
const cells = (n) => raw('<i></i>'.repeat(n));

export const page = {
  id: 'home',
  // One entry per language. An empty slug is that language's root, e.g. /nl/.
  slugs: { nl: '', en: '', fr: '' },

  meta: (t) => ({
    title: t('home.title'),
    description: t('home.description')
  }),

  render: ({ t, lang }) => html`<main id="main" tabindex="-1">

${hero(t)}
${services(t, lang)}
${dna(t)}
${transformation(t)}
${approach(t)}
${insights(t)}
${contact(t)}

</main>`
};

/* ------------------------------------------------------------------ *
 * Hero — the copy ranged left in a column of its own, a dark shape on each
 * flank: a petal hung off the right edge, its counter-lobe rising out of the
 * bottom-left. Both are windows onto the same dark field.
 *
 * Each carries its own magnet tuning. `data-magnet-pin` welds the shape to the
 * page edge it hangs from, which is why both can opt out of the nav guard with
 * `data-magnet-free`; the denser sampling is what keeps these curves smooth
 * under a pull.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="home-hero" class="hero">
${orbitRings('home-hero')}
  <div id="home-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="home-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="480" data-magnet-amp="86" data-magnet-sigma="118" data-clip="heroPetal"><sa-node-field id="home-hero-nodes-right"></sa-node-field></div>
  </div>
  <div id="home-hero-field-slot-left" class="field-slot hero__field hero__field--left" aria-hidden="true">
    <div id="home-hero-field-left" class="field" data-magnet data-magnet-free data-magnet-pin="left" data-magnet-points="460" data-magnet-amp="60" data-magnet-sigma="100" data-clip="heroLobe"><sa-node-field id="home-hero-nodes-left"></sa-node-field></div>
  </div>
  <div id="home-hero-inner" class="hero__inner">
    <div id="home-hero-text" class="hero__text">
      <h1 id="home-hero-title">
        <span id="home-hero-wordmark" class="hero__wordmark">${logoMark('ink', 'home-hero-logo')}<span id="home-hero-wordmark-text">Smart<span id="home-hero-wordmark-accent" class="brand-accent">Agents</span></span></span>
        <span id="home-hero-claim" class="hero__claim">${t('hero.claim')}</span>
      </h1>
      <div id="home-hero-actions" class="hero__actions">
        <a id="home-hero-cta-talk" class="btn btn--primary" href="#contact">${t('cta.talk')}</a>
        <a id="home-hero-cta-work" class="btn btn--ghost" href="#services">${t('cta.seeWork')} <span id="home-hero-cta-work-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Wat we doen — hairline-separated rows, not cards
 *
 * Training is the one service with a page of its own, so its row is the one
 * that links: it gets the "Ontdek →" cue back, and the hover, the arrow and
 * the translate come with it (design README, "Deviations" from the design doc,
 * item 4).
 * ------------------------------------------------------------------ */

function services(t, lang) {
  const training = trainingPath(lang);

  const rows = SERVICES.map((key) => {
    const id = `home-services-row-${key}`;
    const linked = key === 'training' && training;

    const content = html`    <span id="${id}-title" class="row__title">${t(`service.${key}.title`)}</span>
    <span id="${id}-body" class="row__body">${t(`service.${key}.body`)}</span>${linked
      ? html`
    <span id="${id}-cue" class="row__cue">${t('cta.moreInfo')} <span id="${id}-cue-arrow" aria-hidden="true">&rarr;</span></span>`
      : ''}`;

    return linked
      ? html`<a id="${id}" class="row" href="${training}">
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
  <div id="home-services-rows" class="rows">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Ons DNA — the disc and its rotating helix
 * ------------------------------------------------------------------ */

function dna(t) {
  const items = DNA.map(
    (n) => html`<div class="numbered">
      <span class="numbered__index" aria-hidden="true">${index(n)}</span>
      <div>
        <div class="numbered__title">${t(`dna.${n}.title`)}</div>
        <p>${t(`dna.${n}.body`)}</p>
      </div>
    </div>`
  );

  return html`<section class="section" id="dna">
  <div class="section__head section__head--wide">
    <h2 class="section-heading">${t('section.dna')}</h2>
  </div>
  <div class="dna">
    <div class="dna__figure" aria-hidden="true">
      <div class="field dna__disc" data-magnet data-clip="dnaField"></div>
      <div class="dna__helix"><sa-node-field variant="helix"></sa-node-field></div>
      <div class="field dna__blob" data-magnet data-magnet-free data-clip="dnaBlob"><sa-node-field></sa-node-field></div>
    </div>
    <div class="dna__list">
${join(items)}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Digitale transformatie — four layers, drawn as an isometric stack
 * ------------------------------------------------------------------ */

function transformation(t) {
  const items = TRANSFORMATION.map(
    (n) => html`<div class="numbered">
      <span class="numbered__index" aria-hidden="true">${index(n)}</span>
      <div>
        <div class="numbered__title">${t(`transformation.${n}.title`)}</div>
        <p>${t(`transformation.${n}.body`)}</p>
      </div>
    </div>`
  );

  // The stack repeats the same four layers as the list beside it, so it is
  // decorative: the accessible copy is the list.
  const labels = TRANSFORMATION.map(
    (n) => html`<div class="stack__label stack__label--${n}${n === '1' ? ' stack__label--active' : ''}">
        <span><b>${index(n)}</b>${t(`transformation.${n}.label`)}</span>
      </div>`
  );

  return html`<section class="section" id="transformation">
  <div class="section__head section__head--wide">
    <h2 class="section-heading">${t('section.transformation')}</h2>
  </div>
  <div class="transformation">
    <div class="transformation__list">
${join(items)}
    </div>
    <div class="stack" aria-hidden="true">
      <div class="field stack__field" data-magnet data-clip="stackField"><sa-node-field></sa-node-field></div>
      <div class="stack__planes">
        <div class="plane plane--1"><div class="plane__quadrants">${cells(4)}</div></div>
        <div class="plane plane--2"><div class="plane__rows">${cells(3)}</div></div>
        <div class="plane plane--3"><div class="plane__grid">${cells(9)}</div></div>
        <div class="plane plane--4"><div class="plane__cells">${cells(16)}</div></div>
${join(labels)}
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Van vraag tot werkende oplossing — five steps
 * ------------------------------------------------------------------ */

function approach(t) {
  const steps = STEPS.map(
    (n) => html`<div class="step${n === '1' ? ' step--first' : ''}">
      <span class="step__index" aria-hidden="true">${index(n)}</span>
      <h3>${t(`step.${n}.title`)}</h3>
      <p>${t(`step.${n}.body`)}</p>
    </div>`
  );

  return html`<section class="section" id="approach">
  <div class="section__head section__head--wide">
    <h2 class="section-heading">${t('section.approach')}</h2>
  </div>
  <div class="steps">
${join(steps)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Inzichten — the one list on this page that carries pictures.
 *
 * The rows stay rows: a hairline list, not a grid of cards. A row is a
 * thumbnail, then the title with its excerpt directly underneath, then the date
 * and the category badges out at the row's right edge. The article therefore
 * reads as one block in one measure, the row stays about as tall as its
 * picture, and the meta anchors the row to the same right edge every other list
 * on this page runs to.
 *
 * Each thumbnail is a 16:9 crop, framed like the founder portraits on the team
 * page — hairline, card radius, and the same cool grade that pulls a
 * photograph, an illustration and a screenshot into one family. See
 * "Deviations from the design doc", item 5, in
 * .claude/skills/smartagents-design/README.md.
 * ------------------------------------------------------------------ */

function insights(t) {
  const rows = ARTICLES.map(({ key, thumb, widths, tags }) => {
    const chips = tags.map(
      (tag) => html`<li id="home-insights-tag-${key}-${tag}" class="badge">${t(`article.tag.${tag}`)}</li>`
    );

    return html`<article id="home-insights-item-${key}" class="article-row">
    <figure id="home-insights-figure-${key}" class="article-row__figure">
      <picture id="home-insights-picture-${key}">
        <source id="home-insights-source-${key}" type="image/avif" srcset="${thumbSrcset(thumb, widths, 'avif')}" sizes="${THUMB_SIZES}">
        <img id="home-insights-image-${key}" class="article-row__image" src="/media/insights/${thumb}-480.jpg" srcset="${thumbSrcset(thumb, widths, 'jpg')}" sizes="${THUMB_SIZES}" width="480" height="270" alt="${t(`article.${key}.alt`)}" loading="lazy" decoding="async">
      </picture>
    </figure>
    <div id="home-insights-text-${key}" class="article-row__text">
      <h3 id="home-insights-title-${key}" class="article-row__title">${t(`article.${key}.title`)}</h3>
      <p id="home-insights-body-${key}" class="article-row__body">${t(`article.${key}.body`)}</p>
    </div>
    <div id="home-insights-meta-${key}" class="article-row__meta">
      <span id="home-insights-date-${key}" class="article-row__date">${t(`article.${key}.date`)}</span>
      <ul id="home-insights-tags-${key}" class="article-row__tags">
${join(chips)}
      </ul>
    </div>
  </article>`;
  });

  return html`<section class="section" id="insights" aria-labelledby="home-insights-heading">
  <div id="home-insights-head" class="section__head">
    <h2 id="home-insights-heading" class="section-heading">${t('section.insights')}</h2>
  </div>
  <div id="home-insights-list" class="rows">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact
 * ------------------------------------------------------------------ */

function contact(t) {
  return contactSection({
    t,
    prefix: 'home',
    title: t('contact.title'),
    lede: t('contact.lede')
  });
}
