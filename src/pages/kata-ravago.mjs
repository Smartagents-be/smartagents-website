// The kata's code for one client's participants: a hero with the clone command
// in the middle of it and a zip beside it for a laptop without git.
//
// Not part of the public offer. The page is reached from a link handed to the
// group, so it is in no nav, no sitemap and no llms.txt, and it is noindex — a
// client's name in a search result is the client's call, not the site's. The
// repository itself is served as plain files; see build/lib/git-download.mjs.
import { html } from '../../build/lib/html.mjs';
import { absolute } from '../../build/lib/i18n.mjs';
import { cloneUrlPath, zipPath } from '../../build/lib/git-download.mjs';
import { orbitRings } from '../layouts/base.mjs';

const SLUG = 'kata-ravago';

export const page = {
  id: 'kata-ravago',
  slugs: { nl: SLUG, en: SLUG, fr: SLUG },
  excludeFromSitemap: true,
  noindex: true,
  strings: 'ravago',

  render: ({ t }) => html`<main id="main" tabindex="-1">

${hero(t)}

</main>`
};

function hero(t) {
  const command = `git clone ${absolute(cloneUrlPath(SLUG))}`;

  return html`<section id="ravago-hero" class="hero hero--page hero--download" aria-labelledby="ravago-hero-title">
${orbitRings('ravago-hero')}
  <div id="ravago-hero-inner" class="hero__inner">
    <div id="ravago-hero-text" class="hero__text">
      <h1 id="ravago-hero-title">${t('ravago.hero.title')}</h1>
      <!-- One click selects the whole command (user-select: all), so it copies
           without a script and without a button that only works with one. -->
      <pre id="ravago-clone" class="download__command" aria-label="${t('ravago.clone.label')}"><code id="ravago-clone-code">${command}</code></pre>
      <div id="ravago-hero-actions" class="hero__actions download__actions">
        <a id="ravago-hero-zip" class="btn btn--ghost" href="${zipPath(SLUG)}" download>${t('ravago.zip')}</a>
      </div>
    </div>
  </div>
</section>`;
}
