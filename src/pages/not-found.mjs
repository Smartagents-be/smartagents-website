// Per-language 404 (static-i18n §4, item 7).
//
// A section like every other section — the page gutter, the section rhythm, the
// heading's cyan rule — because the one page a visitor reaches only by accident
// should not also be the one that looks broken.
//
// The three destinations are read off keys the chrome already prints, so this
// page cannot name a section by a word no other page uses. The insights index is
// a real page and drops out in a language it is not published in.
import { html, join } from '../../build/lib/html.mjs';
import { pagePath } from '../../build/lib/i18n.mjs';
import { insightsIndexPath } from './insights/insights.mjs';

export const page = {
  id: 'not-found',
  slugs: { nl: '404', en: '404', fr: '404' },
  // Error pages are not real content: keep them out of the sitemap and indexes.
  excludeFromSitemap: true,
  noindex: true,

  strings: 'notfound',

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
