// Per-language 404 (static-i18n §4, item 7).
//
// It used to be a heading, a line and one button, in a bare `<main>` with no
// frame around it: the copy started at x=0, hard against the left edge of the
// window, which made the one page on the site a visitor only ever reaches by
// accident also the one page that looks broken. It is a section like every other
// section now — the page gutter, the section rhythm, the heading's own cyan rule
// — and it offers somewhere to go rather than only somewhere to go back to.
//
// The three destinations are read off keys the chrome already prints, so this
// page cannot name a section by a word no other page uses. Two of them are
// homepage anchors, which every language has; the insights index is a real page
// and drops out of the list in a language it is not published in.
import { html, join } from '../../build/lib/html.mjs';
import { pagePath } from '../../build/lib/i18n.mjs';
import { insightsIndexPath } from './insights/insights.mjs';

export const page = {
  id: 'not-found',
  slugs: { nl: '404', en: '404', fr: '404' },
  // Error pages are not real content: keep them out of the sitemap and indexes.
  excludeFromSitemap: true,
  noindex: true,

  meta: (t) => ({
    title: t('notfound.title'),
    description: t('notfound.description')
  }),

  render: ({ t, lang }) => {
    const home = pagePath(lang);
    const insights = insightsIndexPath(lang);

    const destinations = [
      { key: 'services', href: `${home}#services`, label: t('section.services') },
      insights ? { key: 'insights', href: insights, label: t('nav.insights') } : null,
      { key: 'contact', href: `${home}#contact`, label: t('cta.talk') }
    ].filter(Boolean);

    return html`<main id="main" tabindex="-1">
  <section id="not-found-block" class="section error-page" aria-labelledby="not-found-title">
    <h1 id="not-found-title" class="section-heading">${t('notfound.title')}</h1>
    <p id="not-found-tagline" class="error-page__lede">${t('notfound.tagline')}</p>
    <p id="not-found-help" class="error-page__body">${t('notfound.lede')}</p>
    <div id="not-found-actions" class="error-page__actions">
      <a id="not-found-home" class="btn btn--primary" href="${home}">${t('notfound.home')}</a>
    </div>
    <ul id="not-found-links" class="error-page__links">
${join(
      destinations.map(
        ({ key, href, label }) => html`      <li id="not-found-link-${key}-item"><a id="not-found-link-${key}" class="error-page__link" href="${href}">${label} <span id="not-found-link-${key}-arrow" aria-hidden="true">&rarr;</span></a></li>`
      ),
      '\n'
    )}
    </ul>
  </section>
</main>`;
  }
};
