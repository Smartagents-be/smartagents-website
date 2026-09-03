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
import { absolute, pagePath } from '../../../build/lib/i18n.mjs';
import { orbitRings } from '../../layouts/base.mjs';
import {
  ORGANISATION_ID,
  WEBSITE_ID,
  articleNode,
  breadcrumbNode,
  homeStep,
  imageNode
} from '../../layouts/schema.mjs';
import { contactSection } from '../../components/contact-form/contact-form.mjs';
import { prose } from '../prose.mjs';
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


/* ------------------------------------------------------------------ *
 * The listing — one row per article, and the only markup on the site that two
 * pages render from the same function.
 *
 * The homepage's "Inzichten" section and the index page under /inzichten/ print
 * exactly this list. It used to live in home.mjs and the index did not exist,
 * which is what made "Alle artikelen →" in an article's rail point back at a
 * homepage anchor listing the same four items: the label promised an archive
 * and there was nowhere for it to go. There is now, and both surfaces build
 * from the one function, so they cannot drift.
 *
 * `prefix` is the calling page's id stem, so the two copies keep their ids
 * apart (element-ids §4).
 * ------------------------------------------------------------------ */

/**
 * A thumbnail is 208px in the listing and 156px in the narrow band just under
 * it. On a tablet the article stacks two abreast, so the picture is about half
 * the content width; on a phone it takes the whole column, which is the
 * viewport less the two gutters. The gutter itself is fluid, and `sizes` is
 * resolved before any layout exists, so this names the widest each can be
 * rather than the exact.
 */
const THUMB_SIZES =
  '(max-width: 620px) calc(100vw - 40px), (max-width: 1000px) 44vw, (max-width: 1080px) 156px, 208px';

export function articleRows({ t, lang, prefix }) {
  return INSIGHTS.map(({ key, thumb, widths, tags }) => {
    const href = insightPath(key, lang);
    const id = `${prefix}-${key}`;
    const chips = tags.map(
      (tag) => html`<li id="${id}-tag-${tag}" class="badge">${t(`article.tag.${tag}`)}</li>`
    );

    const content = html`    <figure id="${id}-figure" class="article-row__figure">
      <picture id="${id}-picture">
        <source id="${id}-source" type="image/avif" srcset="${thumbSrcset(thumb, widths, 'avif')}" sizes="${THUMB_SIZES}">
        <img id="${id}-image" class="article-row__image" src="/media/insights/${thumb}-480.jpg" srcset="${thumbSrcset(thumb, widths, 'jpg')}" sizes="${THUMB_SIZES}" width="480" height="270" alt="${t(`article.${key}.alt`)}" loading="lazy" decoding="async">
      </picture>
    </figure>
    <div id="${id}-text" class="article-row__text">
      <h3 id="${id}-title" class="article-row__title">${t(`article.${key}.title`)}</h3>
      <p id="${id}-body" class="article-row__body">${t(`article.${key}.body`)}</p>${href
        ? html`
      <span id="${id}-cue" class="article-row__cue">${t('cta.moreInfo')} <span id="${id}-cue-arrow" aria-hidden="true">&rarr;</span></span>`
        : ''}
    </div>
    <div id="${id}-meta" class="article-row__meta">
      <time id="${id}-date" class="article-row__date" datetime="${byKey.get(key).published}">${t(`article.${key}.date`)}</time>
      <ul id="${id}-tags" class="article-row__tags">
${join(chips)}
      </ul>
    </div>`;

    // The link wraps the whole row, so without a name of its own its accessible
    // name is everything inside it — title, excerpt, cue, date and both badges,
    // 160 to 200 characters. `aria-labelledby` points it at the title alone, so
    // a list of links reads as a list of articles.
    return href
      ? html`<a id="${id}-item" class="article-row" href="${href}" aria-labelledby="${id}-title">
${content}
  </a>`
      : html`<article id="${id}-item" class="article-row">
${content}
  </article>`;
  });
}

/* ------------------------------------------------------------------ *
 * The index: /nl/inzichten/, /en/insights/, /fr/analyses/
 *
 * The archive the rail's "Alle artikelen →" always claimed to point at. It is
 * the parent directory of every article slug, so the URL a reader guesses from
 * an article's own address is the one that answers, and it is a real page for a
 * crawler to enumerate rather than a fragment of the homepage.
 *
 * It opens the way an article does — no hero, no dark shape — because it is the
 * front of the same family. The orbit rings behind it are the homepage
 * section's own, which is what says this is that list on a page of its own.
 * ------------------------------------------------------------------ */

export const indexPage = {
  id: 'insights',
  slugs: { nl: 'inzichten', en: 'insights', fr: 'analyses' },

  meta: (t) => ({
    title: t('insights.index.title'),
    description: t('insights.index.description')
  }),

  /* The archive, as a `Blog` whose `blogPost` list is the four articles by
     `@id`. Each of those ids is declared in full on the article's own page, so
     this node names them without restating them — which is the whole point of
     `@id` and the reason the index can stay this short. */
  schema: ({ t, lang, url }) => [
    {
      '@type': 'Blog',
      '@id': `${absolute(url)}#blog`,
      name: t('section.insights'),
      description: t('insights.index.description'),
      url: absolute(url),
      inLanguage: lang,
      publisher: { '@id': ORGANISATION_ID },
      isPartOf: { '@id': WEBSITE_ID },
      blogPost: INSIGHTS.map((insight) => ({
        '@id': `${absolute(insightPath(insight.key, lang))}#article`
      }))
    },
    breadcrumbNode([homeStep(t, lang), { name: t('section.insights'), url }])
  ],

  render: ({ t, lang }) => html`<main id="main" tabindex="-1">

${indexSection(t, lang)}
${contactSection({ t, lang, prefix: 'insights', title: t('contact.title'), lede: t('contact.lede') })}

</main>`
};

function indexSection(t, lang) {
  return html`<section id="insights-index" class="section section--orbits" aria-labelledby="insights-index-title">
${orbitRings('insights-index', 'orbits--insights', ['01', '02', '03', '04'])}
  <div id="insights-index-head" class="section__head">
    <h1 id="insights-index-title" class="section-heading">${t('section.insights')}</h1>
  </div>
  <p id="insights-index-lede" class="section-lede">${t('insights.index.lede')}</p>
  <div id="insights-index-list" class="rows rows--cards">
${join(articleRows({ t, lang, prefix: 'insights-index' }))}
  </div>
</section>`;
}

/**
 * The opening figure is the article's own thumbnail. The article column is wider
 * than any derivation on a desk, so it is capped at 760px — the widest there is
 * — and inset in its column rather than upscaled: `.article__figure` in main.css
 * carries that cap. Below the phone's line it takes the column less the two
 * gutters. `sizes` is resolved before any layout exists, so this names what the
 * figure can be rather than what it is.
 *
 * It is a figure, not a banner: the homepage's thumbnail is `article-row__figure`
 * and this is the same picture on a second surface, so it takes the same word.
 */
const FIGURE_SIZES =
  '(max-width: 620px) calc(100vw - 40px), (max-width: 840px) calc(100vw - 80px), 760px';

/**
 * An article whose widest derivation cannot reach that cap stops at the width it
 * does have. Only the launch photograph is in that position: its original is
 * 542px across, so it stops at 480w (CLAUDE.md, "No build-step image pipeline").
 */
const FIGURE_CAP = 760;

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
      description: t(`article.${key}.body`),

      /* The article's own thumbnail is its share card. It is 760×428 rather
         than the 1200×630 the brand card is, which every platform crops to fit
         — and it is the picture the reader sees again at the top of the page
         they land on, which a generic brand card is not. */
      ogImage: {
        href: `/media/insights/${thumb}-${widths.at(-1)}.jpg`,
        width: widths.at(-1),
        height: Math.round((widths.at(-1) * 9) / 16),
        alt: t(`article.${key}.alt`)
      },

      /* What the head says about an article beyond a title: `og:type=article`
         instead of `website`, and the date, which existed only as a
         `<time datetime>` in the body and reached nothing a crawler reads. */
      article: {
        published,
        section: t('section.insights'),
        tags: tags.map((tag) => t(`article.tag.${tag}`))
      }
    }),

    /* The piece itself as a `BlogPosting`, and the trail through the index that
       now exists to carry it. */
    schema: ({ t, lang, url }) => [
      articleNode({
        t,
        lang,
        url,
        key,
        published,
        image: imageNode(`/media/insights/${thumb}-${widths.at(-1)}.jpg`, widths.at(-1), Math.round((widths.at(-1) * 9) / 16))
      }),
      breadcrumbNode([
        homeStep(t, lang),
        { name: t('section.insights'), url: insightsIndexPath(lang) || pagePath(lang) },
        { name: t(`article.${key}.title`), url }
      ])
    ],

    render: ({ t, lang }) => html`<main id="main" tabindex="-1">

${article({ t, lang, scope, key, published, thumb, widths, tags, body })}
${contactSection({ t, lang, prefix: scope, title: t('contact.title'), lede: t('contact.lede') })}

</main>`
  };
}

/* ------------------------------------------------------------------ *
 * The article — the head, the figure and the body in a column at the reading
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
      <figure id="${scope}-figure" class="article__figure${widths.at(-1) < FIGURE_CAP ? ' article__figure--short-source' : ''}">
        <picture id="${scope}-figure-picture">
          <source id="${scope}-figure-source" type="image/avif" srcset="${thumbSrcset(thumb, widths, 'avif')}" sizes="${FIGURE_SIZES}">
          <img id="${scope}-figure-image" class="article__figure-image" src="/media/insights/${thumb}-480.jpg" srcset="${thumbSrcset(thumb, widths, 'jpg')}" sizes="${FIGURE_SIZES}" width="480" height="270" alt="${t(`article.${key}.alt`)}" loading="eager" decoding="async">
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

/** URL of the insights index in this language, or null where it is not published. */
export function insightsIndexPath(lang) {
  const slug = indexPage.slugs[lang];
  return slug === undefined ? null : pagePath(lang, slug);
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
      <p id="${scope}-rail-foot" class="article__rail-foot"><a id="${scope}-rail-foot-link" class="article__rail-link" href="${insightsIndexPath(lang) || `${home}#insights`}">${t('cta.allArticles')} <span id="${scope}-rail-foot-arrow" aria-hidden="true">&rarr;</span></a></p>
    </aside>`;
}
