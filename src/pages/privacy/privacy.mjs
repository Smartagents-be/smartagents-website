// The privacy notice: the GDPR article 13 notice for smartagents.be.
//
// It is the second page on the public site with no hero and no dark shape, and
// for the same reason the insights are: it is a piece of writing, and a 540px
// navy shape between the header and the first paragraph is a screen the reader
// has to scroll past before they can start reading. So it opens on the headline
// at the measure the body runs at.
//
// It also has no contact section, which every other page carries. Two reasons.
// The form is a sales CTA and this page is not selling anything; and a notice
// that explains what happens to the data you hand over should not end by asking
// for more of it. The reader who wants to exercise a right gets a mailto: in
// the body, which is the route the notice itself names.
//
// The layout is the article's, minus the rail: there is no "read next" here.
// `.article--single` collapses the two-column grid to one — see main.css.
// See .claude/skills/smartagents-design/README.md and element-ids/SKILL.md.
import { html } from '../../../build/lib/html.mjs';
import { prose } from '../prose.mjs';
import { body } from './body.mjs';

/**
 * When this notice last changed, in ISO form for the `<time datetime>`. The
 * printed form is `privacy.updated` in each language, so the two have to be
 * moved together — there is no formatter in this build, by the same decision
 * that has the insights print their dates from translation keys.
 */
const UPDATED = '2026-09-03';

const SCOPE = 'privacy';

export const page = {
  id: SCOPE,
  slugs: { nl: 'privacy', en: 'privacy', fr: 'confidentialite' },

  meta: (t) => ({
    title: t('privacy.title'),
    description: t('privacy.description')
  }),

  render: ({ t, lang }) => html`<main id="main" tabindex="-1">

<section id="${SCOPE}-notice" class="section" aria-labelledby="${SCOPE}-title">
  <div id="${SCOPE}-inner" class="article article--single">
    <div id="${SCOPE}-main" class="article__main">
      <header id="${SCOPE}-head" class="article__head">
        <p id="${SCOPE}-eyebrow" class="page-eyebrow">${t('privacy.eyebrow')}</p>
        <h1 id="${SCOPE}-title">${t('privacy.heading')}</h1>
        <p id="${SCOPE}-meta" class="article-meta">
          <time id="${SCOPE}-updated" class="article-meta__date" datetime="${UPDATED}">${t('privacy.updated')}</time>
        </p>
      </header>
      <div id="${SCOPE}-body" class="prose">
${prose(body[lang], { scope: `${SCOPE}-body`, resolveHref: (href) => href })}
      </div>
    </div>
  </div>
</section>

</main>`
};
