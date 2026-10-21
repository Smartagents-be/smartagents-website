// <sa-copy-command> — a copy button beside a command.
//
// Light DOM: the build renders the command, a button with `hidden` on it, and a
// visually hidden status line. With this file absent the command still copies
// with one click and a Cmd-C (`user-select: all`), and the button stays hidden,
// because a button that does nothing without a script is worse than none.
//
// The button is an icon with an `aria-label`; for two seconds after a copy its
// glyph turns to a check (`data-state="copied"`, drawn in main.css) and the
// status line says so, which is what a screen reader hears.
const RESET_MS = 2000;

class CopyCommand extends HTMLElement {
  #timer = 0;

  connectedCallback() {
    this.button = this.querySelector('button');
    this.code = this.querySelector('code');
    this.status = this.querySelector('[role="status"]');
    if (!this.button || !this.code) return;

    this.onClick ||= this.copy.bind(this);
    this.button.addEventListener('click', this.onClick);
    this.button.hidden = false;
  }

  disconnectedCallback() {
    this.button?.removeEventListener('click', this.onClick);
    clearTimeout(this.#timer);
  }

  async copy() {
    const text = this.code.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // No clipboard (an insecure origin, a refused permission): select the
      // line instead, so the reader's own Cmd-C finishes the job.
      getSelection()?.selectAllChildren(this.code);
      return;
    }

    this.button.dataset.state = 'copied';
    if (this.status) this.status.textContent = this.button.dataset.copied;

    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      delete this.button.dataset.state;
      if (this.status) this.status.textContent = '';
    }, RESET_MS);
  }
}

customElements.define('sa-copy-command', CopyCommand);
