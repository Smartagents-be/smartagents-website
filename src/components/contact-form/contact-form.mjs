// <sa-contact-form> — the build-time half of the component.
//
// `contact-form.js` beside this file is the behaviour: it upgrades the light
// DOM this module emits, and the form works without it (mailto: fallback).
// Keeping the markup here means the section is authored once and every page
// that needs it renders exactly the same fields, ids and fallbacks
// (webcomponent-mpa-spa §4: components upgrade light DOM, never replace it).
//
// Text is passed in, never hard-coded: `title` and `lede` are the two lines a
// page phrases for itself, everything else comes from the shared `contact.*`
// and `form.*` keys (static-i18n §1).
//
// Two of the fields are hidden and neither is decoration. `/api/contact`
// forwards `subject` and `page_context` to n8n, and the form sent neither:
// `validatePayload` required `subject`, so every upgraded submission came back
// 400 and the visitor read "Versturen lukte niet" on the site's only conversion
// path. They are rendered here rather than assembled in `contact-form.js`, so
// the payload is the same whether the component upgrades or not — with JS off
// they travel in the `mailto:` body, where they are just as useful.
// `page_context` is the caller's own id prefix, which is what says which of the
// six pages a message came from. The server treats both as optional now; see
// the note above `validatePayload` in `functions/api/contact.js`.
//
// `form.subject` carries the exact strings the live site sends today. The
// Eleventy form on `main` posts them from a hidden `_subject` field, and its
// own JS says why they matter: "n8n's classifier expects a `subject`". The
// value is therefore not ours to phrase — it is an input to a workflow that
// already runs on it — so it is copied from `contact.form.subject` on `main`
// rather than written fresh.
import { html, raw, escapeHtml } from '../../../build/lib/html.mjs';
import { pagePath } from '../../../build/lib/i18n.mjs';
import { TURNSTILE_SITE_KEY } from '../../../build/lib/config.mjs';
import { page as privacyPage } from '../../pages/privacy/privacy.mjs';

// The three facts the section prints. Exported because the mobile menu sheet
// and the sticky call button in src/layouts/base.mjs print the same two, and a
// phone number that disagrees with itself across the page is worse than a
// duplicated constant.
/**
 * GDPR article 13 wants the notice at the point of collection, so it goes under
 * the button rather than only in the footer. The key carries the link's label
 * in square brackets — `…ons [privacybeleid].` — because where the link falls
 * in the sentence is a translator's decision, not a template's: Dutch ends on
 * it, French needs four words for it.
 *
 * A language the notice is not published in gets the sentence without a link
 * rather than a link to nothing, the same rule `servicePath()` follows.
 */
function privacyNote(t, lang, id) {
  const slug = privacyPage.slugs[lang];
  const text = t('form.privacyNote');
  const parts = text.match(/^(.*)\[(.+)\](.*)$/);

  if (!parts || slug === undefined) {
    return html`        <p id="${id}-privacy" class="contact-form__privacy">${text.replace(/[[\]]/g, '')}</p>`;
  }

  const [, before, label, after] = parts;
  return html`        <p id="${id}-privacy" class="contact-form__privacy">${before}<a id="${id}-privacy-link" href="${pagePath(lang, slug)}">${label}</a>${after}</p>`;
}

export const PHONE = '+32 11 11 10 20';
export const PHONE_HREF = 'tel:+3211111020';
export const EMAIL = 'info@smartagents.be';

/**
 * One labelled control, its required marker and the slot its error message
 * lands in.
 *
 * Three of the four fields are required and nothing said so: the visitor found
 * out on submit, from the browser's own bubble, one field at a time. The marker
 * is a `*` with the word behind it for a screen reader, and `form.requiredLegend`
 * at the head of the form is what makes the `*` mean something rather than
 * being a glyph the reader has to guess at.
 *
 * The error slot ships empty and hidden. `aria-describedby` points at it from
 * the moment the page loads — a hidden element contributes nothing to the
 * description, so an untouched field is described by nothing and a failing one
 * is described by its message, without the attribute ever being rewritten.
 * `contact-form.js` fills and unhides it; with JS off the browser's own
 * validation is what reports, which is the same thing it did before.
 */
function field({ t, id, key, label, required, control }) {
  const mark = required
    ? html`<span id="${id}-field-${key}-required" class="field-label__required"><span id="${id}-field-${key}-required-mark" aria-hidden="true">*</span><span id="${id}-field-${key}-required-word" class="visually-hidden">${t('form.required')}</span></span>`
    : '';

  return html`          <label id="${id}-field-${key}" class="field-label">
            <span id="${id}-field-${key}-label" class="field-label__text">${label}${mark}</span>
            ${control}
            <span id="${id}-error-${key}" class="field-error" hidden></span>
          </label>`;
}

/**
 * The contact section: the facts on the left, the form on the right.
 *
 * @param {object} options
 * @param {Function} options.t       translator for this language
 * @param {string} options.lang      language code, for the privacy notice's URL
 * @param {string} options.prefix    id prefix for this page (element-ids §4)
 * @param {string} options.title     the heading, phrased by the calling page
 * @param {string} options.lede      the paragraph under it, likewise
 */
export function contactSection({ t, lang, prefix, title, lede }) {
  const id = `${prefix}-contact`;

  return html`<section class="section" id="contact" aria-labelledby="${id}-title">
  <div id="${id}" class="contact">
    <div id="${id}-intro" class="contact__intro">
      <h2 id="${id}-title" class="section-heading">${title}</h2>
      <p id="${id}-lede" class="contact__lede">${lede}</p>
      <div id="${id}-facts" class="contact__facts">
        <span id="${id}-fact-call">${t('contact.callLabel')} <a id="${id}-fact-call-link" href="${PHONE_HREF}">${PHONE}</a></span>
        <span id="${id}-fact-mail">${t('contact.mailLabel')} <a id="${id}-fact-mail-link" href="mailto:${EMAIL}">${EMAIL}</a></span>
        <span id="${id}-fact-location">${t('contact.location')}</span>
      </div>
    </div>
    <sa-contact-form id="${id}-widget"${TURNSTILE_SITE_KEY ? raw(` data-sitekey="${escapeHtml(TURNSTILE_SITE_KEY)}"`) : ''} data-sending="${t('form.sending')}" data-sent="${t('form.sent')}" data-failed="${t('form.failed')}" data-error-required="${t('form.error.required')}" data-error-email="${t('form.error.email')}">
      <form id="${id}-form" class="contact-form" method="get" action="mailto:${EMAIL}">
        <p id="${id}-legend" class="contact-form__legend">${t('form.requiredLegend')}</p>
        <div id="${id}-form-pair" class="contact-form__pair">
${field({ t, id, key: 'name', label: t('form.name'), required: true, control: html`<input id="${id}-input-name" type="text" name="name" autocomplete="name" required aria-required="true" aria-describedby="${id}-error-name">` })}
${field({ t, id, key: 'company', label: t('form.company'), required: false, control: html`<input id="${id}-input-company" type="text" name="company" autocomplete="organization">` })}
        </div>
${field({ t, id, key: 'email', label: t('form.email'), required: true, control: html`<input id="${id}-input-email" type="email" name="email" autocomplete="email" required aria-required="true" aria-describedby="${id}-error-email">` })}
${field({ t, id, key: 'message', label: t('form.message'), required: true, control: html`<textarea id="${id}-input-message" name="message" rows="5" required aria-required="true" aria-describedby="${id}-error-message"></textarea>` })}
        <input id="${id}-input-subject" type="hidden" name="subject" value="${t('form.subject')}">
        <input id="${id}-input-page" type="hidden" name="page_context" value="${prefix}">
        <div id="${id}-form-foot" class="contact-form__foot">
          <button id="${id}-submit" class="btn btn--primary" type="submit">${t('cta.send')}</button>
          <p id="${id}-status" class="form-status js-only" role="status" aria-live="polite"></p>
        </div>
${privacyNote(t, lang, id)}
        <noscript id="${id}-noscript"><p id="${id}-noscript-line" class="contact-form__fallback">${t('form.noScript')} <a id="${id}-noscript-mail" href="mailto:${EMAIL}">${EMAIL}</a></p></noscript>
      </form>
    </sa-contact-form>
  </div>
</section>`;
}
