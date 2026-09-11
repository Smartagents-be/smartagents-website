// The privacy notice: the GDPR article 13 notice for smartagents.be.
//
// It has no hero, for the reason the insights have none: it is a piece of
// writing, and a navy shape between the header and the first paragraph is a
// screen to scroll past before reading.
//
// It is the article layout, rail and all, and the rail is what took two drafts.
// It cannot be "read next" — there is no next from a legal notice — but this
// page has the one piece of navigation a notice genuinely needs: its own
// clauses. Nobody reads a privacy statement end to end, and eight headings over
// 2420px of prose is a scroll hunt without an index. With the rail dropped
// instead, the notice was a 1022px column with 354px of empty paper beside it
// for 79% of the page.
//
// The brand on this page is the orbit rings and nothing else; two dark shapes
// were drawn and both are gone. The rings are not the insights index's, though,
// and that is the one thing to keep: they stick. This section is 2820px and the
// outermost ring is 845px in radius, so an origin nailed anywhere in it leaves a
// third of the page with no ground under it. See `.orbits--notice` in main.css.
//
// It also has no contact section. The form is a sales CTA and this page is not
// selling anything, and a notice explaining what happens to the data you hand
// over should not end by asking for more of it; the reader who wants to exercise
// a right gets a mailto: in the body. That is about the section and not the
// site's furniture — the phone's action bar stays, because it is the only way to
// reach a person from a phone on any page here.
//
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html, join } from '../../../build/lib/html.mjs';
import { absolute } from '../../../build/lib/i18n.mjs';
import { index, orbitRings } from '../../layouts/base.mjs';
import { breadcrumbNode, homeStep } from '../../layouts/schema.mjs';
import { prose } from '../prose.mjs';
import { body } from './body.mjs';

/**
 * When this notice last changed, in ISO form for the `<time datetime>`. The
 * printed form is `privacy.updated` in each language, so the two have to be
 * moved together — there is no formatter in this build.
 */
const UPDATED = '2026-09-03';

const SCOPE = 'privacy';

export const page = {
  id: SCOPE,
  slugs: { nl: 'privacy', en: 'privacy', fr: 'confidentialite' },

  /* Title and description default off the page id (`pageMeta` in
     `build/render.mjs`). The date is the one the notice prints itself, so the
     sitemap cannot claim a revision the document does not show. */
  meta: () => ({ lastmod: UPDATED }),

  /* A breadcrumb and nothing else. There is no schema.org type for "the legal
     notice about this site" that says more than the page's own title does, and
     a `WebPage` node restating the `<title>` and the description already in the
     head is noise in the graph rather than a statement in it. */
  schema: ({ t, lang, url }) => [
    breadcrumbNode([homeStep(t, lang), { name: t('privacy.heading'), url }])
  ],

  render: ({ t, lang, url }) => html`<main id="main" tabindex="-1">

<section id="${SCOPE}-notice" class="section section--orbits notice" aria-labelledby="${SCOPE}-title">
${orbitRings(`${SCOPE}-notice`, 'orbits--notice', ['01', '02', '03', '04'])}
  <!-- The head is outside the article grid, so it spans the content width while
       the copy below it takes the article's column and its rail. It was put
       there for a silhouette that had to weld to the page edge, and it is kept
       because the head reads better as the notice's own block than as the first
       thing in a column. -->
  <!-- The printed sheet says where it came from. The header carries the
       wordmark and print hides it, so without this a saved PDF of a legal
       notice names its author only in the footer's legal line and never names
       its source at all. The print stylesheet prints this attribute; nothing
       on screen reads it. -->
  <!-- No eyebrow. It said "Juridisch" over a heading that says "Privacybeleid",
       which is the word again in a coat. The eyebrow is kept on the two page
       families where it adds a level and is a link up to it — the kata page and
       the four articles — and nowhere else. -->
  <header id="${SCOPE}-head" class="article__head notice__head" data-print-url="${absolute(url)}">
    <h1 id="${SCOPE}-title">${t('privacy.heading')}</h1>
    <!-- The standfirst every other head on the site carries, and the sentence
         that says what this document is. It used to be the body's first
         paragraph, where it read as the twenty-first paragraph of twenty-one
         and, below 1000px, arrived after the index of the thing it summarises. -->
    <p id="${SCOPE}-lede" class="article-lede notice__lede">${t('privacy.lede')}</p>
    <p id="${SCOPE}-meta" class="article-meta">
      <time id="${SCOPE}-updated" class="article-meta__date" datetime="${UPDATED}">${t('privacy.updated')}</time>
    </p>
  </header>
  <div id="${SCOPE}-inner" class="article">
${clauseRail(t, lang)}
    <div id="${SCOPE}-main" class="article__main">
      <div id="${SCOPE}-body" class="prose">
${prose(body[lang], { scope: `${SCOPE}-body`, resolveHref: clauseHref(lang) })}
      </div>
      <!-- Below 1000px the index is above the notice and scrolls away with the
           first clause the reader jumps to, and there is nowhere else on the
           site to get back to it from. On a desk the rail is sticky and this is
           hidden. -->
      <p id="${SCOPE}-back" class="notice__back"><a id="${SCOPE}-back-link" href="#${SCOPE}-rail">${t('privacy.backToClauses')} <span id="${SCOPE}-back-arrow" aria-hidden="true">&uarr;</span></a></p>
    </div>
  </div>
</section>

</main>`
};

/**
 * The clause index: every `h2` in the body of this language, in order, linking
 * to itself. Read off the same array `prose()` renders and deriving the anchor
 * the same way, so a heading added to `body.mjs` appears here with no second
 * edit and the two can never name different ids.
 *
 * A `<nav>`, not the article rail's `<aside>`: eight in-page links whose whole
 * purpose is navigation do not belong in a `complementary` landmark.
 *
 * It is also first in the DOM. An index belongs before the thing it indexes, and
 * putting it there is what lets the desk layout be an `order` on the rail rather
 * than a phone's tab order running through the whole notice first.
 */
/**
 * Every `h2` of this language's body, in order, with the id `prose()` will give
 * it. Both the clause index and the `clause:NN` hrefs in the copy are built from
 * this, so a heading added to `body.mjs` moves them together or not at all.
 */
function clauses(lang) {
  return body[lang]
    .map((block, i) => ({ block, id: `${SCOPE}-body-block-${index(i + 1)}` }))
    .filter(({ block }) => block.type === 'h2');
}

/**
 * Resolve an authored href. Everything passes through untouched except
 * `clause:NN`, which is the NNth clause of this notice — see `body.mjs` for why
 * a cross-reference is an ordinal rather than an id. An ordinal with no clause
 * behind it is a build-time error rather than a dead link in three languages.
 */
function clauseHref(lang) {
  const list = clauses(lang);

  return (href) => {
    if (!href.startsWith('clause:')) return href;

    const clause = list[Number(href.slice(7)) - 1];
    if (!clause) throw new Error(`privacy: ${href} names no clause in ${lang}`);
    return `#${clause.id}`;
  };
}

function clauseRail(t, lang) {
  const clauses_ = clauses(lang);

  const rows = clauses_.map(({ block, id }) => html`        <li id="${id}-clause">
          <a id="${id}-clause-link" class="rail-row" href="#${id}">
            <span id="${id}-clause-title" class="rail-row__title">${block.text}</span>
          </a>
        </li>`);

  /* `tabindex="-1"` so the back-link at the foot of the notice moves focus and
     not only the viewport: a jump to a landmark that cannot hold focus leaves a
     keyboard user's next Tab where they were, at the bottom of the page. */
  return html`    <nav id="${SCOPE}-rail" class="article__rail notice__clauses" tabindex="-1" aria-labelledby="${SCOPE}-rail-title">
      <h2 id="${SCOPE}-rail-title" class="article__rail-title notice__clause-title">${t('privacy.clauses')}</h2>
      <sa-clause-index id="${SCOPE}-rail-index">
        <ul id="${SCOPE}-rail-list" class="article__rail-list notice__clause-list">
${join(rows)}
        </ul>
      </sa-clause-index>
    </nav>`;
}
