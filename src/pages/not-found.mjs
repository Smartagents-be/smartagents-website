// Per-language 404 (static-i18n §4, item 7).
import { html } from '../../build/lib/html.mjs';
import { pagePath } from '../../build/lib/i18n.mjs';

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

  render: ({ t, lang }) => html`<main id="main" tabindex="-1">
  <div id="not-found-block" class="error-page">
    <h1 id="not-found-title">${t('notfound.title')}</h1>
    <p id="not-found-tagline">${t('notfound.tagline')}</p>
    <a id="not-found-home" class="btn btn--primary" href="${pagePath(lang)}">${t('notfound.home')}</a>
  </div>
</main>`
};
