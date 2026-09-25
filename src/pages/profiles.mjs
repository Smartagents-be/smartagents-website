// The two founder profiles, and the page template both are rendered from.
//
// One list, two readers: the team page builds its cards from `PROFILES` (for
// the portrait, the LinkedIn URL and the link down), and `profilePages` turns
// the same entries into page modules. The insights module does exactly this and
// for the same reason — two pages of one shape are a list, not two files.
//
// These sit under the team page the way the kata sits under training: the slug
// is the parent's own plus a segment, and the id is the parent's plus a hyphen,
// which is what makes `isCurrentNavItem` mark Team while a reader is on one.
// The parent segment is written out rather than read off `team.mjs`, because
// that page imports `profilePath` back to link down and the pair would close a
// cycle — the same reason `kata.mjs` writes out `training/`.
//
// Two content rules hold here. **Nothing on this page names a programming
// language or a build tool**, the house rule the kata page states: a founder's
// stack is on the CV one click away, and on the site what travels is the way of
// working. And **every fact about a person is sourced** — the CV, the public
// LinkedIn profile, or the isabel-sdlc deck, which is where Tom's three
// personal facts were already written down and approved. Nothing here is
// invented about a real person; where a source is silent, the block is absent.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join, raw } from '../../build/lib/html.mjs';
import { absolute, pathOf } from '../../build/lib/i18n.mjs';
import { orbitRings, teamPath } from '../layouts/base.mjs';
import { ficheKilobytes } from './fiche.mjs';
import { ORGANISATION_ID, breadcrumbNode, founderId, homeStep } from '../layouts/schema.mjs';

/**
 * Tom's CV, shipped as-is from `public/media/`. Named after the person the way
 * a course fiche is named after its course: the browser prints the file name in
 * the download bar, so it has to say whose it is without the page around it.
 *
 * Axel has none. A download link with nothing behind it is worse than no link,
 * so the block is driven by this field being present rather than by a flag.
 */
const TOM_CV = 'Tom_Haeldermans_CV.pdf';

/**
 * The two founders, in the order the team page lists them.
 *
 * `key` names the person and is the id stem, the translation-key stem and the
 * portrait stem; `slugs` is the URL segment per language, under the team page's
 * own slug; `career` is the period each career row prints, one per
 * `profile.<key>.career.<n>` entry, newest first; `facts` and `credentials` are
 * how many rows those two blocks have, `0` meaning the block is not printed.
 *
 * The counts live here rather than being derived, because a string file cannot
 * be asked how many keys share a prefix and a missing key fails the build — so
 * the number and the copy are checked against each other on every build.
 */
export const PROFILES = [
  {
    key: 'axel',
    name: 'Axel Segers',
    slugs: {
      nl: 'team/axel-segers',
      en: 'team/axel-segers',
      fr: 'equipe/axel-segers'
    },
    linkedin: 'https://www.linkedin.com/in/axelsegers/',
    career: ['2026–', '2024–26', '2022–24', '2016–24', '1999–22'],
    // No personal facts about Axel exist in any source this repo can see — the
    // isabel-sdlc deck wrote three for Tom and none for him. Inventing them is
    // the one thing the rule at the top of this file forbids, so the block is
    // off until he supplies them. Three `profile.axel.fact.<n>.{title,body}`
    // entries per language and this number is all it takes.
    facts: 0,
    credentials: 4
  },
  {
    key: 'tom',
    name: 'Tom Haeldermans',
    slugs: {
      nl: 'team/tom-haeldermans',
      en: 'team/tom-haeldermans',
      fr: 'equipe/tom-haeldermans'
    },
    linkedin: 'https://www.linkedin.com/in/tom-haeldermans-862172117/',
    cv: TOM_CV,
    career: ['2026–', '2026–', '2021–26', '2021–24', '2016–21'],
    facts: 3,
    credentials: 8
  }
];

const byKey = new Map(PROFILES.map((profile) => [profile.key, profile]));

/**
 * The facts the hero's list prints under the lede, in the order a reader checks
 * them. Three, not four: the role is the pill over the name, and the same string
 * set twice within one screen is the list restating the hero.
 */
const SPEC = ['base', 'focus', 'background'];

/**
 * The bio's paragraphs. The first is the hero's lede, beside the face; the rest
 * are the "Over mij" block under it. Both profiles run to three.
 */
const LEDE = '1';
const ABOUT = ['2', '3'];

/** Widths shipped for every portrait, smallest first — the team page's own set. */
const PORTRAIT_WIDTHS = [320, 440, 880];

/**
 * The portrait is 400px in the hero's left column and 360px leading the stacked
 * hero below 1001px, where `.hero--profile .profile-portrait` caps it. Both are
 * plain lengths on purpose: written as `min(100vw - 40px, 360px)` Chrome stopped
 * agreeing with its own preload and fetched two portraits per load. A `sizes`
 * entry is not a place to be clever; state the width the box renders at.
 */
const PORTRAIT_SIZES = '(max-width: 1000px) 360px, 400px';

const srcset = (key, extension) =>
  PORTRAIT_WIDTHS.map((width) => `/media/team/${key}-${width}.${extension} ${width}w`).join(', ');

/**
 * URL of a founder's profile in this language, or null where it is not
 * published in it. This is what makes the team page's card a link — the design
 * README's "a row is a link only when there is somewhere to go", applied to a
 * card.
 */
export function profilePath(key, lang) {
  return pathOf(byKey.get(key), lang);
}

/**
 * The LinkedIn "in" mark, drawn inline in `currentColor`. The same mark the team
 * page carries, and for the same reason it is allowed at all: a third-party
 * *brand* mark, not the first member of an icon set.
 */
const linkedinMark = (id) =>
  raw(
    `<svg id="${id}-mark" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path id="${id}-mark-path" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.2 9h3.56v12H3.2V9Zm6.04 0h3.41v1.64h.05c.48-.9 1.65-1.85 3.4-1.85 3.63 0 4.3 2.36 4.3 5.44V21h-3.56v-5.32c0-1.27-.02-2.9-1.79-2.9-1.79 0-2.06 1.38-2.06 2.81V21H9.24V9Z"/></svg>`
  );

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

/** One founder's page module. */
function profilePage(profile) {
  const { key, name, slugs, linkedin, cv } = profile;

  return {
    /* The parent's id plus a hyphen, so `isCurrentNavItem` marks Team while the
       reader is on a profile — the prefix rule the kata page established. */
    id: `team-${key}`,
    slugs,

    /* The copy is keyed on the person, not on the page id. */
    strings: `profile.${key}`,

    /* The portrait is the opening screen's largest paint on every one of these
       pages, so it is preloaded the way the team page preloads the first of the
       pair. `type` gates the hint: a browser without AVIF skips it and falls
       through to the JPEG.

       The `href` is the fallback for a browser that ignores `imagesrcset`, so it
       names the candidate this page's own `sizes` resolves to at 1x: both
       widths land on the 440. */
    meta: () => ({
      preloadImage: {
        href: `/media/team/${key}-440.avif`,
        as: 'image',
        type: 'image/avif',
        imagesrcset: srcset(key, 'avif'),
        imagesizes: PORTRAIT_SIZES
      }
    }),

    /* The `Person` node the team page already declares, on their own page and
       carrying what this page adds: the role it prints, the seat it names and
       the CV it links. `@id` is the founder id rather than a new one, so the
       graph has one node per person however many pages describe them. */
    schema: ({ t, lang, url }) => [
      {
        '@type': 'Person',
        '@id': founderId(key),
        name,
        jobTitle: t(`profile.${key}.role`),
        description: t(`profile.${key}.description`),
        image: absolute(`/media/team/${key}-880.jpg`),
        url: absolute(url),
        worksFor: { '@id': ORGANISATION_ID },
        sameAs: [linkedin]
      },
      breadcrumbNode([
        homeStep(t, lang),
        { name: t('nav.team'), url: teamPath(lang) },
        { name, url }
      ])
    ],

    render: ({ t, lang }) => html`<main id="main" tabindex="-1">

${hero({ t, lang, profile })}
${about({ t, profile })}
${career({ t, profile })}
${credentials({ t, profile })}
${facts({ t, profile })}

</main>`
  };
}

/** Both profiles as page modules, for `build/render.mjs` to spread into `PAGES`. */
export const profilePages = PROFILES.map(profilePage);

/* ------------------------------------------------------------------ *
 * Hero — the way up, the face, the name, the lede, three facts, two actions
 *
 * Portrait left and copy right, the `SmartAgents Team Profiel` artboard. The
 * portrait carries the page's one navy shape: `profileField`, the DNA disc's
 * outline, hung behind the frame and breaking out of it on the top-left and
 * bottom-right, so the face is set on the field rather than beside it. It is a
 * window onto the same network every other shape on the site is.
 *
 * The first bio paragraph is the lede, in the first person like the rest of
 * the bio; the other two are "Over mij" under the hero. The role is the pill
 * over the name, and the three spec facts are a hairline list under the lede.
 *
 * The way up is a breadcrumb — Team / name — the only one on the site that
 * names the page it stands on, because on a profile the page is a person and
 * the trail reads as an introduction. The first step falls back to plain text
 * in a language the team page is not published in.
 * ------------------------------------------------------------------ */

function hero({ t, lang, profile }) {
  const { key, name, linkedin, cv } = profile;
  const id = `profile-${key}-hero`;
  const parent = teamPath(lang);

  const facts = SPEC.map(
    (fact) => html`        <div id="${id}-fact-${fact}" class="profile-facts__item">
          <dt id="${id}-fact-${fact}-label">${t(`profile.spec.${fact}.label`)}</dt>
          <dd id="${id}-fact-${fact}-value">${t(`profile.${key}.spec.${fact}.value`)}</dd>
        </div>`
  );

  return html`<section id="${id}" class="hero hero--profile" aria-labelledby="${id}-title">
${orbitRings(id, 'orbits--profile', ['02', '03'])}
  <nav id="${id}-trail" class="profile-trail" aria-label="${t('a11y.breadcrumb')}">
${parent
    ? html`    <a id="${id}-trail-up" class="profile-trail__up" href="${parent}">${t('nav.team')}</a>`
    : html`    <span id="${id}-trail-up">${t('nav.team')}</span>`}
    <span id="${id}-trail-sep" aria-hidden="true">/</span>
    <span id="${id}-trail-here" class="profile-trail__here" aria-current="page">${name}</span>
  </nav>
  <div id="${id}-grid" class="profile-hero">
    <div id="${id}-portrait" class="profile-portrait">
      <div id="${id}-field-slot" class="field-slot profile-portrait__field" aria-hidden="true">
        <div id="${id}-field" class="field" data-clip="profileField"><sa-node-field id="${id}-nodes"></sa-node-field></div>
      </div>
      <div id="${id}-frame" class="profile-portrait__frame">
        <picture id="${id}-picture">
          <source id="${id}-source-avif" type="image/avif" srcset="${srcset(key, 'avif')}" sizes="${PORTRAIT_SIZES}">
          <!-- An empty alt: the h1 beside it is the name and the pill over it
               the role, so a text alternative would be the same sentence twice
               in a row to a screen reader. -->
          <img id="${id}-image" class="profile-portrait__image" src="/media/team/${key}-440.jpg" srcset="${srcset(key, 'jpg')}" sizes="${PORTRAIT_SIZES}" width="440" height="660" alt="" decoding="async">
        </picture>
      </div>
    </div>
    <div id="${id}-text" class="hero__text profile-hero__text">
      <p id="${id}-role" class="profile-role">${t(`profile.${key}.role`)}</p>
      <h1 id="${id}-title">${name}</h1>
      <p id="${id}-lede" class="profile-lede">${t(`profile.${key}.about.${LEDE}`)}</p>
      <dl id="${id}-facts" class="profile-facts">
${join(facts)}
      </dl>
      <div id="${id}-actions" class="hero__actions">
        <a id="${id}-cta-linkedin" class="btn btn--ghost btn--marked" href="${linkedin}" target="_blank" rel="noopener noreferrer">${linkedinMark(`${id}-cta-linkedin`)} ${t('profile.cta.linkedin')}<span id="${id}-cta-linkedin-newtab" class="visually-hidden"> ${t('a11y.newTab')}</span></a>
${cv
    ? html`        <a id="${id}-cv" class="offer-course__fiche" href="/media/${cv}" type="application/pdf">${t('profile.cv.label', { name: name.split(' ')[0] })} <span id="${id}-cv-size" class="offer-course__fiche-size">(PDF, ${ficheKilobytes(cv)} kB)</span> <span id="${id}-cv-arrow" aria-hidden="true">&darr;</span></a>
`
    : ''}      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Over mij — the rest of the bio, heading left and prose right
 *
 * The split every two-column block on this page shares: the heading on its
 * cyan rule in a narrow column, the content in the wide one.
 * ------------------------------------------------------------------ */

function about({ t, profile }) {
  const { key } = profile;
  const id = `profile-${key}-about`;

  return html`<section id="${id}" class="section" aria-labelledby="${id}-title">
  <div id="${id}-split" class="profile-split">
    <h2 id="${id}-title" class="section-heading">${t('profile.about.title')}</h2>
    <div id="${id}-body" class="profile-prose">
${join(ABOUT.map((n) => html`      <p id="${id}-${n}">${t(`profile.${key}.about.${n}`)}</p>`))}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Loopbaan — one hairline row per role, newest first
 *
 * The left column names the organisation and, under it, the period and the
 * place; the right column the role and what it was. The copy keys hold the
 * role and the organisation as one title, "Rol · Organisatie", so the row
 * splits it on the last interpunct: one string per language stays one string
 * to translate, and a title with no interpunct is all role.
 *
 * Newest first, the order `INSIGHTS` uses and the order a CV is read in; the
 * numbering in `src/i18n` runs the same way, so `career.1` is the top row.
 * ------------------------------------------------------------------ */

const splitTitle = (title) => {
  const at = title.lastIndexOf(' · ');
  return at < 0 ? { role: title, org: '' } : { role: title.slice(0, at), org: title.slice(at + 3) };
};

function career({ t, profile }) {
  const { key, career: years } = profile;
  const id = `profile-${key}-career`;

  const rows = years.map((period, i) => {
    const n = String(i + 1);
    const rowId = `${id}-${n}`;
    const { role, org } = splitTitle(t(`profile.${key}.career.${n}.title`));

    return html`    <div id="${rowId}" class="profile-role-row">
      <div id="${rowId}-where" class="profile-role-row__where">
        <h3 id="${rowId}-org" class="profile-role-row__org">${org || role}</h3>
        <p id="${rowId}-when" class="profile-role-row__when"><span id="${rowId}-years" class="profile-role-row__years">${period}</span> · ${t(`profile.${key}.career.${n}.units`)}</p>
      </div>
      <div id="${rowId}-what" class="profile-role-row__what">
${org ? html`        <p id="${rowId}-role" class="profile-role-row__role">${role}</p>
` : ''}        <p id="${rowId}-body" class="profile-role-row__body">${t(`profile.${key}.career.${n}.body`)}</p>
      </div>
    </div>`;
  });

  return html`<section id="${id}" class="section" aria-labelledby="${id}-title">
  <div id="${id}-head" class="section__head">
    <h2 id="${id}-title" class="section-heading">${t('profile.career.title')}</h2>
  </div>
  <div id="${id}-list" class="profile-roles">
${join(rows)}
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Opleiding en certificaten — the split, a hairline list on the right
 *
 * Each row is the credential and its issuer, with the year set apart on the
 * right. The copy keys hold "Uitgever, jaar" as one body; the row splits a
 * trailing year or year range off it, and a body with none is all issuer.
 *
 * Tom holds two more certifications than are printed here, and both name a
 * programming language in their title. They are on the CV one click away; the
 * house rule that nothing on this site names a language holds on the page. A
 * platform certification's proper name is neither a language nor a build tool:
 * it is the awarded title, and abbreviating it would misname the credential.
 * ------------------------------------------------------------------ */

const YEAR_TAIL = /^(.*), (\d{4}(?: – \d{4})?)$/;

function credentials({ t, profile }) {
  const { key, credentials: count } = profile;
  if (!count) return '';

  const id = `profile-${key}-credentials`;
  const rows = Array.from({ length: count }, (_, i) => {
    const n = String(i + 1);
    const body = t(`profile.${key}.credential.${n}.body`);
    const [, issuer, year] = body.match(YEAR_TAIL) || [null, body, ''];

    return html`      <li id="${id}-${n}" class="profile-credential">
        <span id="${id}-${n}-what" class="profile-credential__what">
          <span id="${id}-${n}-title" class="profile-credential__title">${t(`profile.${key}.credential.${n}.title`)}</span>
          <span id="${id}-${n}-issuer" class="profile-credential__issuer">${issuer}</span>
        </span>
${year ? html`        <span id="${id}-${n}-year" class="profile-credential__year">${year}</span>
` : ''}      </li>`;
  });

  return html`<section id="${id}" class="section" aria-labelledby="${id}-title">
  <div id="${id}-split" class="profile-split">
    <h2 id="${id}-title" class="section-heading">${t(`profile.${key}.credentials.title`)}</h2>
    <ul id="${id}-list" class="profile-credentials">
${join(rows)}
    </ul>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ *
 * Buiten het werk — three short blocks abreast, on hairlines
 *
 * Printed only for a person who has facts on file. See the note on `facts` in
 * `PROFILES`.
 * ------------------------------------------------------------------ */

function facts({ t, profile }) {
  const { key, facts: count } = profile;
  if (!count) return '';

  const id = `profile-${key}-facts`;
  const items = Array.from({ length: count }, (_, i) => {
    const n = String(i + 1);

    return html`    <div id="${id}-${n}" class="profile-aside">
      <h3 id="${id}-${n}-title" class="profile-aside__title">${t(`profile.${key}.fact.${n}.title`)}</h3>
      <p id="${id}-${n}-body" class="profile-aside__body">${t(`profile.${key}.fact.${n}.body`)}</p>
    </div>`;
  });

  return html`<section id="${id}" class="section" aria-labelledby="${id}-title">
  <div id="${id}-head" class="section__head">
    <h2 id="${id}-title" class="section-heading">${t('profile.facts.title')}</h2>
  </div>
  <div id="${id}-list" class="profile-asides">
${join(items)}
  </div>
</section>`;
}
