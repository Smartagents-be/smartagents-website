// The homepage, built from direction 1a ("Redactioneel — licht, lijnen, veel
// lucht") of the "Smartagents.be Redesign Direction" design project.
// Structure, spacing, colour and motion all come from the design system:
// see .claude/skills/smartagents-design/README.md.
import { html, join, raw, escapeHtml } from '../../build/lib/html.mjs';
import { TURNSTILE_SITE_KEY } from '../../build/lib/config.mjs';
import { logoMark } from '../layouts/base.mjs';

const SERVICES = ['process', 'agentic', 'training', 'staffing'];
const DNA = ['1', '2', '3', '4'];
const TRANSFORMATION = ['1', '2', '3', '4'];
const STEPS = ['1', '2', '3', '4', '5'];
const ARTICLES = ['1', '2', '3'];

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

  render: ({ t }) => html`<main id="main" tabindex="-1">

${hero(t)}
${services(t)}
${dna(t)}
${transformation(t)}
${approach(t)}
${smartspace(t)}
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
${orbits()}
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

/**
 * The orbit diagram behind the hero: five rings struck from one origin off the
 * left edge, three of them carrying a node that travels the ring and fades in
 * and out as it goes. Pure texture, so it is `aria-hidden` and paints under
 * both the copy and the two dark shapes.
 */
function orbits() {
  const rings = ['01', '02', '03', '04', '05'];
  const paths = ['01', '02', '03'];

  return html`  <div id="home-hero-orbits" class="hero__orbits" aria-hidden="true">
    <div id="home-hero-orbits-origin" class="hero__orbits-origin">
${join(rings.map((key) => html`      <div id="home-hero-orbit-ring-${key}" class="hero__ring hero__ring--${key}"></div>`))}
${join(paths.map((key) => html`      <div id="home-hero-orbit-${key}" class="hero__orbit hero__orbit--${key}"><i id="home-hero-orbit-node-${key}" class="hero__orbit-node"></i></div>`))}
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ *
 * Wat we doen — hairline-separated rows, not cards
 * ------------------------------------------------------------------ */

function services(t) {
  const rows = SERVICES.map(
    (key) => html`<div class="row">
    <span class="row__title">${t(`service.${key}.title`)}</span>
    <span class="row__body">${t(`service.${key}.body`)}</span>
  </div>`
  );

  return html`<section class="section" id="services">
  <div class="section__head">
    <h2 class="section-heading">${t('section.services')}</h2>
  </div>
  <div class="rows">
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
 * SmartSpace — the chevroned band
 * ------------------------------------------------------------------ */

function smartspace(t) {
  return html`<section class="band" id="smartspace">
  <div class="field-slot band__field" aria-hidden="true">
    <div class="field" data-magnet data-clip="bandField"><sa-node-field></sa-node-field></div>
  </div>
  <div class="band__inner">
    <div>
      <p class="band__eyebrow">${t('smartspace.eyebrow')}</p>
      <h2>${t('smartspace.title')}</h2>
      <p>${t('smartspace.body')}</p>
      <a class="btn btn--ondark" href="#contact">${t('cta.discoverSmartSpace')}</a>
    </div>
    <div class="screenshot-frame" data-spotlight>
      <span>${t('smartspace.screenshot')}</span>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Inzichten
 * ------------------------------------------------------------------ */

function insights(t) {
  const rows = ARTICLES.map(
    (n) => html`<div class="article-row">
    <span class="article-row__date">${t(`article.${n}.date`)}</span>
    <span class="article-row__title">${t(`article.${n}.title`)}</span>
    <span class="article-row__body">${t(`article.${n}.body`)}</span>
  </div>`
  );

  return html`<section class="section" id="insights">
  <div class="section__head">
    <h2 class="section-heading">${t('section.insights')}</h2>
  </div>
  <div class="rows">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Contact
 * ------------------------------------------------------------------ */

function contact(t) {
  return html`<section class="section" id="contact">
  <div class="contact">
    <div>
      <h2 class="section-heading">${t('contact.title')}</h2>
      <p class="contact__lede">${t('contact.lede')}</p>
      <div class="contact__facts">
        <span>${t('contact.callLabel')} <a href="tel:+3211111020">+32 11 11 10 20</a></span>
        <span>${t('contact.mailLabel')} <a href="mailto:hallo@smartagents.be">hallo@smartagents.be</a></span>
        <span>${t('contact.location')}</span>
      </div>
    </div>
    <sa-contact-form${TURNSTILE_SITE_KEY ? raw(` data-sitekey="${escapeHtml(TURNSTILE_SITE_KEY)}"`) : ''} data-sending="${t('form.sending')}" data-sent="${t('form.sent')}" data-failed="${t('form.failed')}">
      <form class="contact-form" method="post" action="mailto:hallo@smartagents.be" enctype="text/plain">
        <div class="contact-form__pair">
          <label class="field-label"><span>${t('form.name')}</span><input type="text" name="name" autocomplete="name" required></label>
          <label class="field-label"><span>${t('form.company')}</span><input type="text" name="company" autocomplete="organization"></label>
        </div>
        <label class="field-label"><span>${t('form.email')}</span><input type="email" name="email" autocomplete="email" required></label>
        <label class="field-label"><span>${t('form.message')}</span><textarea name="message" rows="5" required></textarea></label>
        <div class="contact-form__foot">
          <button class="btn btn--primary" type="submit">${t('cta.send')}</button>
          <p class="form-status js-only" role="status" aria-live="polite"></p>
        </div>
      </form>
    </sa-contact-form>
  </div>
</section>`;
}
