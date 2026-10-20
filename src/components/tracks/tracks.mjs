// The track panel: a row with a name and the copy it opens on, ending on the
// "Past wanneer" line that lets a reader rule it out. Two pages print it — the
// AI staffing page has one track and shows it standing open, the training page
// has the two coaching tracks as an accordion — so the row lives here and each
// page passes its own id scope and string keys.
// The look is `.tracks__panel` / `.track` in `main.css`; `<sa-accordion>` makes
// a group of `<details>` travel rather than snap.
// See element-ids/SKILL.md: every element carries an id.
import { html, join } from '../../../build/lib/html.mjs';

/**
 * One block of a track's copy, as a key under `base`. A string is a paragraph;
 * `{ lead }` is the line the copy opens on, `{ h }` a subheading and
 * `{ list, n }` a bullet list of `<list>.1` … `<list>.n`. Ids come from the key
 * path with its dots turned to hyphens, so they are the same in every language
 * and survive a reorder.
 */
function copyBlock({ t, base, id, block }) {
  const k = (path) => `${base}.${path}`;
  const slug = (path) => `${id}-${path.replaceAll('.', '-')}`;

  if (typeof block === 'string') {
    return html`              <p id="${slug(block)}" class="track__body">${t(k(block))}</p>`;
  }
  if (block.lead) {
    return html`              <p id="${slug(block.lead)}" class="track__lead">${t(k(block.lead))}</p>`;
  }
  if (block.h) {
    return html`              <h4 id="${slug(block.h)}" class="track__subtitle">${t(k(block.h))}</h4>`;
  }
  const items = Array.from({ length: block.n }, (_, i) => {
    const path = `${block.list}.${i + 1}`;
    return html`                <li id="${slug(path)}" class="track__point">${t(k(path))}</li>`;
  });
  return html`              <ul id="${slug(block.list)}s" class="track__points">
${join(items)}
              </ul>`;
}

/**
 * One track.
 *
 * As a disclosure it is a `<details>` sharing `group` with its siblings, so the
 * panel works with JS off. Standing alone it is an `<article>` with the same
 * head and panel and no control: a single row that closes leaves a page with
 * nothing on it.
 *
 * The name is an `<h3>`: `<summary>` takes heading content, and without one the
 * offers were the only named blocks on the site missing from the outline.
 *
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.id      the row's id, and the scope of everything in it
 * @param {string} options.base    the string keys' prefix, e.g. `staffing.track.engineer`
 * @param {Array} options.copy     the panel's blocks, see `copyBlock()`
 * @param {string} [options.group] the `<details>` name; omit for a standing row
 * @param {boolean} [options.open] whether a disclosure stands open on arrival
 */
export function track({ t, id, base, copy, group, open }) {
  const inner = html`<div id="${id}-panel" class="track__panel">
          <div id="${id}-panel-inner" class="track__inner">
            <div id="${id}-copy" class="track__copy">
${join(copy.map((block) => copyBlock({ t, base, id, block })))}
            </div>
            <div id="${id}-fit" class="track__fit">
              <p id="${id}-fit-label" class="track__fit-label">${t('track.fitLabel')}</p>
              <p id="${id}-fit-body" class="track__fit-body">${t(`${base}.fit`)}</p>
            </div>
          </div>
        </div>`;
  const title = html`<h3 id="${id}-title" class="track__title">${t(`${base}.title`)}</h3>`;

  if (!group) {
    return html`      <article id="${id}" class="track track--standing">
        <div id="${id}-summary" class="track__summary">
          <div id="${id}-head" class="track__head">
            ${title}
          </div>
        </div>
        ${inner}
      </article>`;
  }

  return html`      <details id="${id}" class="track" name="${group}"${open ? ' open' : ''}>
        <summary id="${id}-summary" class="track__summary">
          <div id="${id}-head" class="track__head">
            ${title}
          </div>
          <span id="${id}-chevron" class="track__chevron" aria-hidden="true"></span>
        </summary>
        ${inner}
      </details>`;
}
