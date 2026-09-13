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

/**
 * What each field the visitor fills in has to satisfy. Anything with no
 * `pattern` only has to be non-empty. The e-mail pattern is the same one
 * `validatePayload` in functions/api/contact.js applies, deliberately: a form
 * that accepts what the endpoint will reject sends the visitor a network round
 * trip to be told what the page already knew.
 *
 * The rules are keyed on the name in the markup, which for the message field is
 * `body` — see `payload()` for why, and `contact-form.mjs` for the rest of it.
 */
const RULES = [
  { name: 'name' },
  { name: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { name: 'body' }
];

class ContactForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.status = this.querySelector('.form-status');
    this.submitter = this.querySelector('button[type="submit"]');
    this.sitekey = this.dataset.sitekey;
    // Upgraded whether or not a site key is configured: only the token step is
    // gated on one (`prepare`). Returning here without a key left a build with
    // no `TURNSTILE_SITE_KEY` on the native validation described below.
    if (!this.form) return;

    // The browser's own validation is the fallback, not the plan: one field at a
    // time, in a bubble that vanishes, with no mark left afterwards. Taking
    // `novalidate` is what lets every failing field be named at once, and it is
    // taken only once the component has upgraded, so a page with no JS keeps the
    // native behaviour rather than losing validation altogether.
    this.form.noValidate = true;

    // Nothing about the form should reach the network before someone uses it.
    this.form.addEventListener('focusin', () => this.prepare(), { once: true });
    this.form.addEventListener('submit', (event) => this.submit(event));

    // A message clears as soon as the field it is about stops being wrong, not
    // on the next submit: a form that keeps saying "fill this in" at a field
    // that now has something in it is reporting its own staleness.
    for (const { name } of RULES) {
      this.control(name)?.addEventListener('input', () => this.revalidate(name));
    }
  }

  control(name) {
    return this.form.elements[name] || null;
  }

  /** The empty span the markup already pointed this field's description at. */
  slot(name) {
    const described = this.control(name)?.getAttribute('aria-describedby');
    return described ? this.form.querySelector(`#${CSS.escape(described)}`) : null;
  }

  /** The rule's complaint about this field's current value, or null. */
  problem(rule) {
    const value = (this.control(rule.name)?.value || '').trim();
    if (!value) return this.dataset.errorRequired;
    if (rule.pattern && !rule.pattern.test(value)) return this.dataset.errorEmail;
    return null;
  }

  mark(name, message) {
    const control = this.control(name);
    const slot = this.slot(name);
    if (!control || !slot) return;

    slot.textContent = message || '';
    slot.hidden = !message;
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }

  /** Re-check one field, but only once it has already been reported wrong. */
  revalidate(name) {
    const control = this.control(name);
    if (!control || control.getAttribute('aria-invalid') !== 'true') return;

    const rule = RULES.find((entry) => entry.name === name);
    this.mark(name, this.problem(rule));
  }

  /**
   * What goes on the wire: every named field, under the name the endpoint knows
   * it by. `data-post-as` renames a control — the message field is `body` in
   * the markup so the `mailto:` fallback carries it, and `message` here. The
   * mapping is read off the markup rather than written down, because
   * `scripts/check-contact.mjs` builds its payload from that same markup.
   */
  payload() {
    const data = Object.fromEntries(new FormData(this.form));
    for (const control of this.form.querySelectorAll('[data-post-as]')) {
      const as = control.dataset.postAs;
      if (control.name && as && as !== control.name) {
        data[as] = data[control.name];
        delete data[control.name];
      }
    }
    return data;
  }

  /** Marks every failing field and returns the first one, or null. */
  validate() {
    let first = null;
    for (const rule of RULES) {
      const message = this.problem(rule);
      this.mark(rule.name, message);
      if (message && !first) first = this.control(rule.name);
    }
    return first;
  }

  async prepare() {
    if (this.widget !== undefined) return;
    this.widget = null;
    if (!this.sitekey) return; // validation upgraded, posting did not

    try {
      const turnstile = await loadTurnstile();
      /* The widget is rendered the way the pre-redesign form rendered it —
         `interaction-only`, `flexible` — above the button. It used to be
         `size: 'invisible'` in a hidden host: that is not a size Turnstile has,
         and a challenge that asks for a click could never be answered in a box
         nobody can see. The host is still hidden while there is nothing to click,
         because an empty flex item takes a gap in the form's column; the two
         interactive callbacks show it for exactly as long as a click is wanted.
         `execution: 'execute'` keeps the challenge off the network until submit. */
      const host = document.createElement('div');
      host.id = `${this.id}-challenge`;
      host.hidden = true;
      this.form.insertBefore(host, this.form.querySelector('.contact-form__foot'));
      /* All three failure callbacks, not only `error-callback`. An expiry or a
         timeout reports on its own channel, and unwired it never settles the
         promise `token()` waits on: the button stays busy for the life of the
         page and the only way out is a reload. */
      this.widget = turnstile.render(host, {
        sitekey: this.sitekey,
        appearance: 'interaction-only',
        size: 'flexible',
        execution: 'execute',
        'before-interactive-callback': () => { host.hidden = false; },
        'after-interactive-callback': () => { host.hidden = true; },
        callback: (token) => this.settleToken?.(null, token),
        'error-callback': () => this.settleToken?.(new Error('challenge failed')),
        'expired-callback': () => this.settleToken?.(new Error('challenge expired')),
        'timeout-callback': () => this.settleToken?.(new Error('challenge timed out'))
      });
    } catch {
      this.widget = null; // stays on the mailto: fallback
    }
  }

  /**
   * One token, however the widget answers. The handler is cleared as it settles,
   * so a late callback from the previous attempt cannot resolve the next one.
   */
  token() {
    return new Promise((resolve, reject) => {
      this.settleToken = (error, value) => {
        this.settleToken = null;
        if (error) reject(error);
        else resolve(value);
      };
      window.turnstile.reset(this.widget);
      window.turnstile.execute(this.widget);
    });
  }

  async submit(event) {
    /* Stopped synchronously, always: `preventDefault` only counts while the
       event is still being dispatched. Deciding after `await this.prepare()`
       meant an Enter pressed while Turnstile was still loading did both — the
       browser opened the mail client and the component posted the JSON. The
       fallback is dispatched by hand below instead. */
    event.preventDefault();
    if (this.busy) return;

    const firstInvalid = this.validate();
    if (firstInvalid) {
      this.say('');
      firstInvalid.focus();
      return;
    }

    await this.prepare();
    // No site key, or Turnstile never loaded: hand it to the mail client.
    // `form.submit()` runs the form's own `mailto:` action without dispatching
    // another submit event, so this cannot come back round to here.
    if (!this.widget) {
      this.form.submit();
      return;
    }

    this.setBusy(true);
    this.say(this.dataset.sending, 'busy');

    try {
      const data = this.payload();
      data['cf-turnstile-response'] = await this.token();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(String(response.status));

      this.form.reset();
      for (const { name } of RULES) this.mark(name, null);
      this.say(this.dataset.sent, 'ok');
    } catch (error) {
      /* 429 gets its own sentence, because it is the one failure the visitor can
         act on: "Versturen lukte niet" in front of a rate limit invites exactly
         the retry that caused it. Everything else is the same line it was. */
      const rateLimited = error?.message === '429';
      this.say(rateLimited ? this.dataset.rateLimited : this.dataset.failed, 'error');
    } finally {
      this.setBusy(false);
    }
  }

  /**
   * The status line says the message is going; the button is what the hand is
   * still on. `aria-disabled` rather than `disabled`, because a disabled button
   * leaves the focus ring nowhere and stops being announced at the moment there
   * is something to announce. The guard at the top of `submit` is what actually
   * refuses the second click.
   */
  setBusy(busy) {
    this.busy = busy;
    if (busy) this.submitter?.setAttribute('aria-disabled', 'true');
    else this.submitter?.removeAttribute('aria-disabled');
  }

  say(message, state) {
    if (!this.status) return;
    this.status.textContent = message || '';
    if (state) this.status.dataset.state = state;
    else delete this.status.dataset.state;
  }
}

customElements.define('sa-contact-form', ContactForm);
