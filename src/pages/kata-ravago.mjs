// The kata's code for one client's participants: a hero with the clone command
// in the middle of it and a zip beside it for a laptop without git.
//
// Not part of the public offer. The page is reached from a link handed to the
// group, so it is in no nav, no sitemap and no llms.txt, and it is noindex — a
// client's name in a search result is the client's call, not the site's. The
// repository itself is served as plain files; see build/lib/git-download.mjs.
import { html } from '../../build/lib/html.mjs';
import { absolute } from '../../build/lib/i18n.mjs';
import { GIT_DOWNLOADS, cloneUrlPath, zipPath } from '../../build/lib/git-download.mjs';
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
  const { folder } = GIT_DOWNLOADS[SLUG];
  const command = `git clone ${absolute(cloneUrlPath(SLUG))} ${folder}`;

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
${setup(t, folder)}
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

// The tools in a table, versions as `check.mjs` in the kata enforces them, and
// what to do between the download and the course's first page. The assistant
// runs install.txt: that check names what is missing and how to install it.
const TOOLS = [
  ['git', 'Git', '2.x'],
  ['node', 'Node.js (+ npm)', '22.12+ (20.19+)'],
  ['jdk', 'Java JDK', '25+'],
  ['maven', 'Maven', '3.9+'],
  ['docker', 'Docker', '23+']
];

function setup(t, folder) {
  return html`<section id="ravago-setup" class="download__setup" aria-labelledby="ravago-setup-title">
        <h2 id="ravago-setup-title" class="download__setup-title">${t('ravago.setup.title')}</h2>
        <table id="ravago-setup-tools" class="download__tools">
          <thead id="ravago-setup-tools-head">
            <tr id="ravago-setup-tools-head-row">
              <th id="ravago-setup-tools-head-tool" scope="col">${t('ravago.setup.tool')}</th>
              <th id="ravago-setup-tools-head-version" scope="col">${t('ravago.setup.version')}</th>
            </tr>
          </thead>
          <tbody id="ravago-setup-tools-body">
${TOOLS.map(([key, name, version]) => html`            <tr id="ravago-setup-tools-${key}">
              <th id="ravago-setup-tools-${key}-name" scope="row">${name}</th>
              <td id="ravago-setup-tools-${key}-version">${version}</td>
            </tr>
`)}          </tbody>
        </table>
        <h3 id="ravago-setup-also-title" class="download__setup-subtitle">${t('ravago.setup.also.title')}</h3>
        <ul id="ravago-setup-also" class="download__setup-list">
          <li id="ravago-setup-also-assistant">${t('ravago.setup.also.assistant')}</li>
          <li id="ravago-setup-also-editor">${t('ravago.setup.also.editor')}</li>
          <li id="ravago-setup-also-network">${t('ravago.setup.also.network')}</li>
          <li id="ravago-setup-also-ports">${t('ravago.setup.also.ports')}</li>
        </ul>
        <h3 id="ravago-setup-start-title" class="download__setup-subtitle">${t('ravago.setup.start.title')}</h3>
        <ol id="ravago-setup-start" class="download__setup-list">
          <li id="ravago-setup-start-install">${t('ravago.setup.start.install')}</li>
          <li id="ravago-setup-start-get">${t('ravago.setup.start.get', { folder })}</li>
          <li id="ravago-setup-start-assistant">${t('ravago.setup.start.assistant', { folder })} <code id="ravago-setup-start-assistant-prompt">Execute install.txt</code></li>
          <li id="ravago-setup-start-course">${t('ravago.setup.start.course')} <code id="ravago-setup-start-course-command">cd front</code>, <code id="ravago-setup-start-course-dev">npm run dev</code>, ${t('ravago.setup.start.open')} <code id="ravago-setup-start-course-url">localhost:5173</code></li>
        </ol>
      </section>`;
}
