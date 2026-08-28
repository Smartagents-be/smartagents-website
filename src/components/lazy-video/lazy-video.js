// <sa-lazy-video> — upgrades a plain <video> so its sources only load when the
// element approaches the viewport. Light DOM: the markup inside is the no-JS
// version and stays exactly as the build rendered it.
// See .claude/skills/webcomponent-mpa-spa/SKILL.md §4 and fast-static-site §5.

class LazyVideo extends HTMLElement {
  #observer = null;

  connectedCallback() {
    const video = this.querySelector('video');
    if (!video) return;

    // Already loaded (e.g. reconnected after a soft navigation).
    if (this.dataset.loaded === 'true') return;

    if (!('IntersectionObserver' in window)) {
      this.#load(video);
      return;
    }

    this.#observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.#load(video);
      },
      { rootMargin: '200px' }
    );
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #load(video) {
    for (const source of video.querySelectorAll('source[data-src]')) {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
    }
    video.load();
    this.dataset.loaded = 'true';
    this.#observer?.disconnect();
    this.#observer = null;
    this.dispatchEvent(new CustomEvent('sa:video-ready', { bubbles: true, composed: true }));
  }
}

if (!customElements.get('sa-lazy-video')) {
  customElements.define('sa-lazy-video', LazyVideo);
}
