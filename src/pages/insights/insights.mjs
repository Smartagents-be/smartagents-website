// The four articles the homepage's "Inzichten" list points at, and the page
// template all four are rendered from.
//
// One list, two readers: the homepage builds its rows from `INSIGHTS` and links
// them with `insightPath()`, and `insightPages` turns the same entries into
// page modules for `build/render.mjs`. Adding an article means adding an entry
// here plus its body module beside this file; nothing else has to be told.
//
// Everything a reader reads in the shell of the page — the title, the excerpt,
// the date, the alt text, the tag labels — comes from the shared `article.*`
// keys in src/i18n, the same ones the homepage row prints, so a title can never
// differ between the list and the page it opens. Only the long-form body lives
// outside those files: see prose.mjs for why, and the `<key>.mjs` modules for
// the copy itself.
//
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../../build/lib/html.mjs';
import { pagePath } from '../../../build/lib/i18n.mjs';
import { contactSection } from '../../components/contact-form/contact-form.mjs';
import { prose } from './prose.mjs';
import { body as aviso } from './aviso.mjs';
import { body as whatWorks } from './what-works.mjs';
import { body as smartspace } from './smartspace.mjs';
import { body as launch } from './launch.mjs';

/**
 * The articles, newest first — the order the homepage lists them in.
 *
 * `key` names the piece and is the id and translation-key stem; `slugs` is its
 * URL segment per language, under that language's own word for "insights";
 * `published` is the machine-readable date behind the printed one; `thumb` is
 * the stem of its derivations in /media/insights/ and `widths` the widths that
 * stem was derived at (the launch photograph is a small original and stops at
 * 480w); `tags` name the shared `article.tag.*` labels; `body` is the long-form
 * copy, keyed by language.
 */
export const INSIGHTS = [
  {
    key: 'aviso',
    slugs: {
      nl: 'inzichten/ontbijtsessie-aviso',
      en: 'insights/breakfast-session-aviso',
      fr: 'analyses/petit-dejeuner-aviso'
    },
    published: '2026-06-12',
    thumb: 'aviso',
    widths: [320, 480, 760],
    tags: ['news', 'ai'],
    body: aviso
  },
  {
    key: 'what-works',
    slugs: {
      nl: 'inzichten/wat-werkt-en-wat-niet',
      en: 'insights/what-works-and-what-doesnt',
      fr: 'analyses/ce-qui-fonctionne-et-ce-qui-ne-fonctionne-pas'
    },
    published: '2026-06-05',
    thumb: 'what-works',
    widths: [320, 480, 760],
    tags: ['ai', 'tips'],
    body: whatWorks
  },
  {
    key: 'smartspace',
    slugs: {
      nl: 'inzichten/smartspace',
      en: 'insights/smartspace',
      fr: 'analyses/smartspace'
    },
    published: '2026-05-01',
    thumb: 'smartspace',
    widths: [320, 480, 760],
    tags: ['news', 'ai'],
    body: smartspace
  },
  {
    key: 'launch',
    slugs: {
      nl: 'inzichten/hello-ai-era',
      en: 'insights/hello-ai-era',
      fr: 'analyses/hello-ai-era'
    },
    published: '2026-04-21',
    thumb: 'launch',
    widths: [320, 480],
    tags: ['news'],
    body: launch
  }
];

const byKey = new Map(INSIGHTS.map((insight) => [insight.key, insight]));

/**
 * URL of an article in this language, or null where it is not published in it.
 * This is what makes the homepage row a link (design README, "Deviations",
 * item 4: a row is a link only when there is somewhere to go).
 */
export function insightPath(key, lang) {
  const slug = byKey.get(key)?.slugs[lang];
  return slug === undefined ? null : pagePath(lang, slug);
}

/** `/media/insights/<stem>-<w>.<ext>` srcset for one derivation set. */
export const thumbSrcset = (stem, widths, extension) =>
  widths.map((width) => `/media/insights/${stem}-${width}.${extension} ${width}w`).join(', ');

/**
 * The banner is the article's own thumbnail. The article column is wider than
 * any derivation on a desk, so the figure is capped at 760px — the widest there
 * is — and inset in its column rather than upscaled: `.article__banner` in
 * main.css carries that cap. Below the phone's line it takes the column less the
 * two gutters. `sizes` is resolved before any layout exists, so this names what
 * the figure can be rather than what it is.
 */
const BANNER_SIZES =
  '(max-width: 620px) calc(100vw - 40px), (max-width: 840px) calc(100vw - 80px), 760px';

/**
 * An article whose widest derivation cannot reach that cap stops at the width it
 * does have. Only the launch photograph is in that position: its original is
 * 542px across, so it stops at 480w (CLAUDE.md, "No build-step image pipeline").
 */
const BANNER_CAP = 760;

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

/** One page module per article, in the same order, for build/render.mjs. */
export const insightPages = INSIGHTS.map(insightPage);

function insightPage(insight) {
  const { key, slugs, published, thumb, widths, tags, body } = insight;
  const scope = `insight-${key}`;

  return {
    id: scope,
    slugs,

    meta: (t) => ({
      // The list and the page print the same title; the brand is appended the
      // way every other page appends it.
      title: `${t(`article.${key}.title`)} · SmartAgents`,
      description: t(`article.${key}.body`)
    }),

    render: ({ t, lang }) => html`<main id="main" tabindex="-1">

${article({ t, lang, scope, key, published, thumb, widths, tags, body })}
${contactSection({ t, prefix: scope, title: t('contact.title'), lede: t('contact.lede') })}

</main>`
  };
}

/* ------------------------------------------------------------------ *
 * The article — the head, the banner and the body in a column at the reading
 * measure, and the other three articles in a rail beside it.
 *
 * There is no hero. Every other page opens on one because it is selling
 * something and the petal is what says whose page it is; this one is a piece of
 * writing, and a 540px shape between the header and the first paragraph is a
 * screen the reader has to scroll past to start reading. So the page opens on
 * the headline, at the measure the body runs at, and carries no dark shape at
 * all — the one page on the public site that is paper end to end.
 *
 * The rail is not decoration either. A single column of prose with the rest of
 * the page empty is the mistake the design README names at page scale ("navy
 * behind a single column with the rest of the band empty"), and the honest thing
 * to put in the other half of a page someone is reading is what else there is to
 * read. It is the homepage's own list idiom — hairline rows, title and date, no
 * thumbnail, no cards — narrowed to 260px against the right page gutter, and it
 * sticks so it is still there at the foot of a long piece. Below 1000px it drops
 * under the article, which is where a "read next" block belongs anyway.
 * ------------------------------------------------------------------ */

function article({ t, lang, scope, key, published, thumb, widths, tags, body }) {
  const home = pagePath(lang);

  // An authored href is either a plain one (`#contact`) or `insight:<key>`,
  // which resolves to that article in the language being rendered.
  const resolveHref = (href) =>
    href.startsWith('insight:') ? insightPath(href.slice('insight:'.length), lang) || home : href;

  const chips = tags.map(
    (tag) => html`          <li id="${scope}-tag-${tag}" class="badge">${t(`article.tag.${tag}`)}</li>`
  );

  return html`<section id="${scope}-article" class="section section--article" aria-labelledby="${scope}-title">
  <div id="${scope}-article-inner" class="article">
    <div id="${scope}-main" class="article__main">
      <header id="${scope}-head" class="article__head">
        <p id="${scope}-eyebrow" class="page-eyebrow">${t('section.insights')}</p>
        <h1 id="${scope}-title">${t(`article.${key}.title`)}</h1>
        <p id="${scope}-lede" class="article-lede">${t(`article.${key}.body`)}</p>
        <div id="${scope}-meta" class="article-meta">
          <time id="${scope}-date" class="article-meta__date" datetime="${published}">${t(`article.${key}.date`)}</time>
          <ul id="${scope}-tags" class="article-meta__tags">
${join(chips)}
          </ul>
        </div>
      </header>
      <figure id="${scope}-banner" class="article__banner${widths.at(-1) < BANNER_CAP ? ' article__banner--short-source' : ''}">
        <picture id="${scope}-banner-picture">
          <source id="${scope}-banner-source" type="image/avif" srcset="${thumbSrcset(thumb, widths, 'avif')}" sizes="${BANNER_SIZES}">
          <img id="${scope}-banner-image" class="article__banner-image" src="/media/insights/${thumb}-480.jpg" srcset="${thumbSrcset(thumb, widths, 'jpg')}" sizes="${BANNER_SIZES}" width="480" height="270" alt="${t(`article.${key}.alt`)}" loading="eager" decoding="async">
        </picture>
      </figure>
      <div id="${scope}-body" class="prose">
${prose(body[lang], { scope: `${scope}-body`, resolveHref })}
      </div>
    </div>
${rail({ t, lang, scope, key, home })}
  </div>
</section>`;
}

/** The other articles, newest first, in the order the homepage lists them. */
function rail({ t, lang, scope, key, home }) {
  const others = INSIGHTS.filter((insight) => insight.key !== key).map((insight) => {
    const href = insightPath(insight.key, lang);
    const id = `${scope}-rail-item-${insight.key}`;

    return html`        <li id="${id}">
          <a id="${id}-link" class="rail-row" href="${href}">
            <span id="${id}-title" class="rail-row__title">${t(`article.${insight.key}.title`)}</span>
            <time id="${id}-date" class="rail-row__date" datetime="${insight.published}">${t(`article.${insight.key}.date`)}</time>
          </a>
        </li>`;
  });

  return html`    <aside id="${scope}-rail" class="article__rail" aria-labelledby="${scope}-rail-title">
      <h2 id="${scope}-rail-title" class="article__rail-title">${t('insight.more')}</h2>
      <ul id="${scope}-rail-list" class="article__rail-list">
${join(others)}
      </ul>
      <p id="${scope}-rail-foot" class="article__rail-foot"><a id="${scope}-rail-foot-link" class="article__rail-link" href="${home}#insights">${t('cta.allArticles')} <span id="${scope}-rail-foot-arrow" aria-hidden="true">&rarr;</span></a></p>
    </aside>`;
}
