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
import { html, raw, escapeHtml } from '../../../build/lib/html.mjs';
import { TURNSTILE_SITE_KEY } from '../../../build/lib/config.mjs';

// The three facts the section prints. Exported because the mobile menu sheet
// and the sticky call button in src/layouts/base.mjs print the same two, and a
// phone number that disagrees with itself across the page is worse than a
// duplicated constant.
export const PHONE = '+32 11 11 10 20';
export const PHONE_HREF = 'tel:+3211111020';
export const EMAIL = 'info@smartagents.be';

/**
 * The contact section: the facts on the left, the form on the right.
 *
 * @param {object} options
 * @param {Function} options.t       translator for this language
 * @param {string} options.prefix    id prefix for this page (element-ids §4)
 * @param {string} options.title     the heading, phrased by the calling page
 * @param {string} options.lede      the paragraph under it, likewise
 */
export function contactSection({ t, prefix, title, lede }) {
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
    <sa-contact-form id="${id}-widget"${TURNSTILE_SITE_KEY ? raw(` data-sitekey="${escapeHtml(TURNSTILE_SITE_KEY)}"`) : ''} data-sending="${t('form.sending')}" data-sent="${t('form.sent')}" data-failed="${t('form.failed')}">
      <form id="${id}-form" class="contact-form" method="post" action="mailto:${EMAIL}" enctype="text/plain">
        <div id="${id}-form-pair" class="contact-form__pair">
          <label id="${id}-field-name" class="field-label"><span id="${id}-field-name-label">${t('form.name')}</span><input id="${id}-input-name" type="text" name="name" autocomplete="name" required></label>
          <label id="${id}-field-company" class="field-label"><span id="${id}-field-company-label">${t('form.company')}</span><input id="${id}-input-company" type="text" name="company" autocomplete="organization"></label>
        </div>
        <label id="${id}-field-email" class="field-label"><span id="${id}-field-email-label">${t('form.email')}</span><input id="${id}-input-email" type="email" name="email" autocomplete="email" required></label>
        <label id="${id}-field-message" class="field-label"><span id="${id}-field-message-label">${t('form.message')}</span><textarea id="${id}-input-message" name="message" rows="5" required></textarea></label>
        <div id="${id}-form-foot" class="contact-form__foot">
          <button id="${id}-submit" class="btn btn--primary" type="submit">${t('cta.send')}</button>
          <p id="${id}-status" class="form-status js-only" role="status" aria-live="polite"></p>
        </div>
      </form>
    </sa-contact-form>
  </div>
</section>`;
}
