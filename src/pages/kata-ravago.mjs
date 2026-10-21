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
  // `kata` names the folder, so the group's paths match the course's own.
  const command = `git clone ${absolute(cloneUrlPath(SLUG))} kata`;

  return html`<section id="ravago-hero" class="hero hero--page hero--download" aria-labelledby="ravago-hero-title">
${orbitRings('ravago-hero')}
  <div id="ravago-hero-inner" class="hero__inner">
    <div id="ravago-hero-text" class="hero__text">
      <h1 id="ravago-hero-title">${t('ravago.hero.title')}</h1>
      <!-- One click selects the whole command (user-select: all), so it copies
           without a script; <sa-copy-command> adds the button when it loads. -->
      <sa-copy-command id="ravago-clone" class="download__command">
        <pre id="ravago-clone-pre" class="download__command-text" aria-label="${t('ravago.clone.label')}"><code id="ravago-clone-code">${command}</code></pre>
        <button id="ravago-clone-copy" class="btn btn--ghost download__copy" type="button" aria-label="${t('ravago.copy')}" title="${t('ravago.copy')}" data-copied="${t('ravago.copied')}" hidden>
          <svg id="ravago-clone-copy-icon" class="download__copy-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect id="ravago-clone-copy-icon-front" x="9" y="9" width="12" height="12" rx="2"/><path id="ravago-clone-copy-icon-back" d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>
          <svg id="ravago-clone-copy-done" class="download__copy-done" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path id="ravago-clone-copy-done-check" d="M5 12.5l4.5 4.5L19 7.5"/></svg>
        </button>
        <span id="ravago-clone-status" class="visually-hidden" role="status"></span>
      </sa-copy-command>
      <div id="ravago-hero-actions" class="hero__actions download__actions">
        <a id="ravago-hero-zip" class="btn btn--ghost" href="${zipPath(SLUG)}" download>${t('ravago.zip')}</a>
      </div>
      <!-- The terms stand under the two ways to get the code rather than in a
           section of their own: a reader who has the command has read them. -->
      <section id="ravago-terms" class="download__terms" aria-labelledby="ravago-terms-title">
        <h2 id="ravago-terms-title" class="download__terms-title">${t('ravago.terms.title')}</h2>
        <p id="ravago-terms-use">${t('ravago.terms.use')}</p>
        <p id="ravago-terms-rights">${t('ravago.terms.rights')}</p>
      </section>
    </div>
  </div>
</section>`;
}
