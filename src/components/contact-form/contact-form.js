// <sa-contact-form> — progressive enhancement for the contact section.
//
// The form inside works without this component: it falls back to a mailto:
// submit. When a Turnstile site key is configured the component takes over,
// posts JSON to /api/contact and reports the result inline.
//
// Turnstile is third-party and is therefore never part of the initial load: the
// script is fetched on the first interaction with the form, not before.
// See .claude/skills/fast-static-site/SKILL.md §1 (third-party budget: 0).

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileReady = null;

function loadTurnstile() {
  if (turnstileReady) return turnstileReady;

  turnstileReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error('Turnstile failed to load'));
    document.head.append(script);
  });

  return turnstileReady;
}

class ContactForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.status = this.querySelector('.form-status');
    this.sitekey = this.dataset.sitekey;
    if (!this.form || !this.sitekey) return;

    // Nothing about the form should reach the network before someone uses it.
    this.form.addEventListener('focusin', () => this.prepare(), { once: true });
    this.form.addEventListener('submit', (event) => this.submit(event));
  }

  async prepare() {
    if (this.widget !== undefined) return;
    this.widget = null;

    try {
      const turnstile = await loadTurnstile();
      const host = document.createElement('div');
      host.hidden = true;
      this.append(host);
      this.widget = turnstile.render(host, {
        sitekey: this.sitekey,
        size: 'invisible',
        callback: (token) => this.resolveToken?.(token),
        'error-callback': () => this.rejectToken?.(new Error('challenge failed'))
      });
    } catch {
      this.widget = null; // stays on the mailto: fallback
    }
  }

  token() {
    return new Promise((resolve, reject) => {
      this.resolveToken = resolve;
      this.rejectToken = reject;
      window.turnstile.reset(this.widget);
      window.turnstile.execute(this.widget);
    });
  }

  async submit(event) {
    await this.prepare();
    if (!this.widget) return; // let the browser run the mailto: fallback

    event.preventDefault();
    if (this.busy) return;
    this.busy = true;
    this.say(this.dataset.sending, 'busy');

    try {
      const data = Object.fromEntries(new FormData(this.form));
      data['cf-turnstile-response'] = await this.token();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(String(response.status));

      this.form.reset();
      this.say(this.dataset.sent, 'ok');
    } catch {
      this.say(this.dataset.failed, 'error');
    } finally {
      this.busy = false;
    }
  }

  say(message, state) {
    if (!this.status) return;
    this.status.textContent = message || '';
    this.status.dataset.state = state;
  }
}

customElements.define('sa-contact-form', ContactForm);
