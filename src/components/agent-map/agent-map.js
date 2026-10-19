// <sa-agent-map>: the homepage hero's diagram. The drawing and the motion are
// both CSS, so this does one thing — stop the clock when nobody can see it,
// in a hidden tab or with the hero scrolled away, the rule `<sa-node-field>`
// keeps. Without this element the diagram still draws and still moves.

class AgentMap extends HTMLElement {
  #visible = true;
  #observer = null;
  #sync = () => this.toggleAttribute('data-paused', !this.#visible || document.hidden);

  connectedCallback() {
    if ('IntersectionObserver' in window) {
      this.#observer = new IntersectionObserver(([entry]) => {
        this.#visible = entry.isIntersecting;
        this.#sync();
      });
      this.#observer.observe(this);
    }
    document.addEventListener('visibilitychange', this.#sync);
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    document.removeEventListener('visibilitychange', this.#sync);
  }
}

customElements.define('sa-agent-map', AgentMap);
