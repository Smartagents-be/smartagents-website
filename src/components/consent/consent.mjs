// The consent banner and the footer control that reopens it, rendered at build
// time. `consent.js` is the browser half: it decides whether either is shown and
// is the only thing that ever loads Google Tag Manager.
//
// Both are printed `hidden`. With JS off nothing can load the container, so
// there is nothing to consent to and neither should appear.
import { html } from '../../../build/lib/html.mjs';
import { pathOf } from '../../../build/lib/i18n.mjs';
import { GTM_ID } from '../../../build/lib/config.mjs';
import { page as privacyPage } from '../../pages/privacy/privacy.mjs';

/**
 * The two answers carry the same class on purpose. The Belgian DPA reads a
 * refusal that is smaller, greyer or one click further away than the
 * acceptance as consent that was not freely given.
 *
 * Not a dialog: the page stays usable behind it, and no choice is the same as
 * refusing. It sits right after the skip link so a keyboard reaches it before
 * the header rather than after the footer.
 */
export function consentBanner(t, lang) {
  if (!GTM_ID) return '';
  const privacy = pathOf(privacyPage, lang);

  return html`<section id="site-consent" class="consent" aria-label="${t('consent.label')}" data-gtm="${GTM_ID}" hidden>
  <p id="site-consent-body" class="consent__body">${t('consent.body')}${privacy ? html` <a id="site-consent-link" href="${privacy}">${t('consent.more')}</a>` : ''}</p>
  <div id="site-consent-actions" class="consent__actions">
    <button id="site-consent-deny" class="btn btn--ghost btn--sm" type="button" data-consent="denied">${t('consent.deny')}</button>
    <button id="site-consent-accept" class="btn btn--ghost btn--sm" type="button" data-consent="granted">${t('consent.accept')}</button>
  </div>
</section>`;
}

/** The way back to the choice, which has to be as easy to reach as the banner was. */
export function consentControl(t) {
  if (!GTM_ID) return '';
  return html`      <button id="site-footer-consent" class="footer-nav__button" type="button" data-consent-open hidden>${t('consent.settings')}</button>
`;
}
