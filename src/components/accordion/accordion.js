// <sa-accordion> — makes a stack of <details> open and close on travel instead
// of snapping, and keeps one of them open at a time.
//
// Light DOM: the markup inside is the no-JS version and stays as the build
// rendered it. Without this file the rows still open and close, and the shared
// `name` attribute still makes them exclusive.
//
// Why not CSS: `::details-content` with `block-size: 0` -> `auto` under
// `interpolate-size: allow-keywords` does this in a handful of declarations, and
// it is what this was written as first. Firefox supports `::details-content` but
// not `interpolate-size`, so `auto` was never interpolable there and every row
// arrived at full height. A row that travels on one engine and jumps on another
// is worse than one behaviour everywhere.
//
// See .claude/skills/webcomponent-mpa-spa/SKILL.md §4.

/** Travel, the site's one speed for it (design system, "Motion"). */
const DURATION = 340;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const still = matchMedia('(prefers-reduced-motion: reduce)');

class Accordion extends HTMLElement {
  /** details -> the animation currently running on it, if any. */
  #running = new Map();

  #onClick = (event) => {
    const summary = event.target.closest('summary');
    if (!summary) return;

    const details = summary.parentElement;
    if (details?.parentElement !== this) return;

    // The browser would toggle `open` here, which is exactly the step that has
    // to wait: a row that is already gone cannot be animated away.
    event.preventDefault();

    if (details.open) this.#close(details);
    else this.#open(details);
  };

  connectedCallback() {
    // Exclusivity moves from the browser to here: left to the `name` group, the
    // row being replaced is closed the instant the new one opens, so it
    // disappears rather than collapsing.
    for (const details of this.#rows()) details.removeAttribute('name');
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#onClick);
    for (const animation of this.#running.values()) animation.cancel();
    this.#running.clear();
  }

  #rows() {
    return Array.from(this.children).filter((child) => child.localName === 'details');
  }

  /** The one element between `<summary>` and the end of the row: its panel. It
      clips in CSS and carries no padding of its own — a padded box cannot be
      animated to nothing, its padding being the floor its height stops at. */
  #panel(details) {
    return details.querySelector(':scope > :not(summary)');
  }

  #open(details) {
    for (const other of this.#rows()) {
      if (other !== details && other.open) this.#close(other);
    }

    details.open = true;
    delete details.dataset.closing;

    const panel = this.#panel(details);
    if (!panel || still.matches) return;

    this.#travel(details, panel, 0, panel.getBoundingClientRect().height);
  }

  #close(details) {
    const panel = this.#panel(details);
    if (!panel || still.matches) {
      details.open = false;
      return;
    }

    // Read the height before anything is animated: an interrupted close is
    // measured mid-collapse, which is where it should carry on from.
    const from = panel.getBoundingClientRect().height;

    // `open` cannot go false until the row has finished collapsing, and the
    // chevron hangs off `[open]`, so without this it points up for the whole
    // close and flips a third of a second after the click.
    details.dataset.closing = '';

    this.#travel(details, panel, from, 0, () => {
      details.open = false;
      delete details.dataset.closing;
    });
  }

  #travel(details, panel, from, to, done) {
    this.#running.get(details)?.cancel();

    const animation = panel.animate(
      { height: [`${from}px`, `${to}px`] },
      // `fill: both` holds the last frame while `done` runs: without it the panel
      // snaps back to full height for the frame between the animation ending and
      // `open` going false.
      { duration: DURATION, easing: EASE, fill: 'both' }
    );

    this.#running.set(details, animation);

    animation.finished.then(
      () => {
        done?.();
        animation.cancel();
        this.#running.delete(details);
      },
      () => {
        /* Cancelled by the next click on the same row; that one cleans up. */
      }
    );
  }
}

customElements.define('sa-accordion', Accordion);
