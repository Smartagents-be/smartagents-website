// The team page. The two founders are the hero: the page opens on the headline
// and the rest of the first screen is the two of them at full size. There is no
// eyebrow, no standfirst and no separate "De oprichters" section — this is it.
//
// This is the first page in the redesign that carries photography, which the
// design system otherwise rules out. The portraits are therefore treated like
// every other surface here: a hairline frame, the card radius, no ring, and a
// cool, slightly desaturated grade that only lifts on hover.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join, raw } from '../../build/lib/html.mjs';
import { orbitRings } from '../layouts/base.mjs';
import { breadcrumbNode, founderNodes, homeStep } from '../layouts/schema.mjs';
import { contactSection } from '../components/contact-form/contact-form.mjs';

/**
 * The founders, in the order the live site lists them. Names, portraits and
 * LinkedIn URLs are language-independent, so they live here rather than in the
 * string files; everything a reader reads as prose comes from `t()`.
 */
const FOUNDERS = [
  {
    key: 'axel',
    name: 'Axel Segers',
    portrait: '/media/team/axel',
    linkedin: 'https://www.linkedin.com/in/axelsegers/'
  },
  {
    key: 'tom',
    name: 'Tom Haeldermans',
    portrait: '/media/team/tom',
    linkedin: 'https://www.linkedin.com/in/tom-haeldermans-862172117/'
  }
];

/**
 * The LinkedIn "in" mark, drawn inline in `currentColor`. It is a brand mark,
 * like the SmartAgents logo, not the first member of an icon set: the design
 * system's ban on an icon library still stands (design README, "Iconography").
 */
const linkedinMark = (id) =>
  raw(
    `<svg id="${id}-mark" viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true" focusable="false"><path id="${id}-mark-path" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.2 9h3.56v12H3.2V9Zm6.04 0h3.41v1.64h.05c.48-.9 1.65-1.85 3.4-1.85 3.63 0 4.3 2.36 4.3 5.44V21h-3.56v-5.32c0-1.27-.02-2.9-1.79-2.9-1.79 0-2.06 1.38-2.06 2.81V21H9.24V9Z"/></svg>`
  );

/** Widths shipped for every portrait, smallest first. */
const PORTRAIT_WIDTHS = [320, 440, 880];

/**
 * One founder column is about a third of the page above 940px, half of it
 * between there and 700px, and nearly the whole width below that; 440w covers
 * 1x on all three and 880w covers 2x.
 */
const PORTRAIT_SIZES = '(max-width: 700px) 92vw, (max-width: 940px) 46vw, 340px';

const srcset = (portrait, extension) =>
  PORTRAIT_WIDTHS.map((width) => `${portrait}-${width}.${extension} ${width}w`).join(', ');

export const page = {
  id: 'team',
  slugs: { nl: 'team', en: 'team', fr: 'equipe' },

  meta: (t) => ({
    title: t('team.title'),
    description: t('team.description'),
    // The first portrait sits in the opening screen and is the page's largest
    // paint. `type` gates the hint, so a browser without AVIF skips it and
    // falls through to the JPEG in the normal way (fast-static-site §3).
    preloadImage: {
      href: `${FOUNDERS[0].portrait}-440.avif`,
      as: 'image',
      type: 'image/avif',
      imagesrcset: srcset(FOUNDERS[0].portrait, 'avif'),
      imagesizes: PORTRAIT_SIZES
    }
  }),

  /* The two founders as `Person` nodes, each `worksFor` the company node every
     page carries and `sameAs` their own LinkedIn profile. This is the only page
     that names a person, so it is the only one that declares one. */
  schema: ({ t, lang, url }) => [
    ...founderNodes(t),
    breadcrumbNode([homeStep(t, lang), { name: t('nav.team'), url }])
  ],

  render: ({ t, lang }) => html`<main id="main" tabindex="-1">

${hero(t)}
${story(t)}
${contact(t, lang)}

</main>`
};

/* ------------------------------------------------------------------ *
 * The hero: the headline, and the two founders under it. The petal hangs off
 * the right edge as it does on every other hero, alongside the pair rather
 * than in place of them.
 * ------------------------------------------------------------------ */

function hero(t) {
  return html`<section id="team-hero" class="hero hero--team" aria-labelledby="team-hero-title">
${orbitRings('team-hero')}
  <div id="team-hero-field-slot-right" class="field-slot hero__field hero__field--right" aria-hidden="true">
    <div id="team-hero-field-right" class="field" data-magnet data-magnet-free data-magnet-pin="right" data-magnet-points="480" data-magnet-amp="86" data-magnet-sigma="118" data-clip="heroPetal"><sa-node-field id="team-hero-nodes-right"></sa-node-field></div>
  </div>
  <div id="team-hero-head" class="team-hero__head">
    <h1 id="team-hero-title">${t('team.hero.title')}</h1>
  </div>
  <div id="team-founders" class="founders">
    <p id="team-founders-label" class="founders__label"><span id="team-founders-badge" class="badge">${t('team.founders.title')}</span></p>
${join(FOUNDERS.map((founder, i) => person({ t, eager: i === 0, ...founder })))}
  </div>
</section>`;
}

/**
 * One founder: the portrait, with everything about them laid over its foot on a
 * scrim of the brand's own navy, so the photograph reads as another window onto
 * the dark field rather than as a picture with a caption under it.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.key       string key, also the id suffix
 * @param {string} options.name      proper noun, never translated
 * @param {string} options.portrait  path stem in /media/team/, without width or extension
 * @param {string} options.linkedin  absolute profile URL
 * @param {boolean} options.eager    true for the portrait that is preloaded
 */
function person({ t, key, name, portrait, linkedin, eager }) {
  const id = `team-person-${key}`;

  return html`    <article id="${id}" class="person">
      <picture id="${id}-picture" class="person__picture">
        <source id="${id}-source-avif" type="image/avif" srcset="${srcset(portrait, 'avif')}" sizes="${PORTRAIT_SIZES}">
        <img id="${id}-image" class="person__image" src="${portrait}-440.jpg" srcset="${srcset(portrait, 'jpg')}" sizes="${PORTRAIT_SIZES}" width="440" height="660" alt="${t(`team.person.${key}.portrait`)}" decoding="async"${eager ? '' : raw(' loading="lazy"')}>
      </picture>
      <div id="${id}-overlay" class="person__overlay">
        <h2 id="${id}-name" class="person__name">${name}</h2>
        <p id="${id}-body" class="person__body">${t(`team.person.${key}.body`)}</p>
        <p id="${id}-tags" class="person__tags">${t(`team.person.${key}.tags`)}</p>
        <a id="${id}-linkedin" class="person__link" href="${linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${name} ${t('team.linkedinLabel')}">${linkedinMark(`${id}-linkedin`)}</a>
      </div>
    </article>`;
}

/* ------------------------------------------------------------------ *
 * Waarom we begonnen zijn — the page's own prose
 *
 * The page used to be a headline and two thirty-word bios, and nothing else:
 * about 180 words including the nav, the footer and the form. That is thin for
 * the page a prospect opens to decide whether to trust two people they have
 * never met, and it is the only page on the site where the company can say why
 * it exists without it reading as a sales line.
 *
 * Three paragraphs, at the reading measure, in the article's own idiom rather
 * than in a row list: this is writing, not an offer.
 * ------------------------------------------------------------------ */

function story(t) {
  const paragraphs = ['1', '2', '3'].map(
    (n) => html`      <p id="team-story-body-${n}">${t(`team.story.${n}`)}</p>`
  );

  return html`<section id="team-story" class="section" aria-labelledby="team-story-title">
  <div id="team-story-head" class="section__head">
    <h2 id="team-story-title" class="section-heading">${t('team.story.title')}</h2>
  </div>
  <div id="team-story-body" class="story">
${join(paragraphs)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Slot — the same contact section the homepage carries, with the two lines
 * this page phrases for itself.
 * ------------------------------------------------------------------ */

function contact(t, lang) {
  return contactSection({
    t,
    lang,
    prefix: 'team',
    title: t('team.cta.title'),
    lede: t('team.cta.body')
  });
}
