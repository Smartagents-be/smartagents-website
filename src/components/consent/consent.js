// Google Tag Manager, behind the visitor's choice.
//
// Consent Mode v2 in its basic form: the container is not requested at all
// until the visitor accepts, so a visitor who refuses or ignores the banner
// sends Google nothing — not even the cookieless pings the advanced form sends.
// The defaults are still declared as denied first, so every tag inside the
// container reads a consent state and the order is the one Google documents.
//
// The choice is kept in localStorage rather than a cookie, for a year. Storage
// that is blocked or throws means the banner shows again on the next page,
// which is the safe way to fail.
//
// Anything pushed to `dataLayer` before the container loads — the contact form's
// `contact_form_submit` — waits in the array and is only read by GTM once it
// has loaded, which is only ever after consent.

const KEY = 'sa-consent';
const MAX_AGE = 365 * 24 * 60 * 60 * 1000;

const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
};
const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
};

const banner = document.getElementById('site-consent');
const containerId = banner?.dataset.gtm;

window.dataLayer = window.dataLayer || [];
/* gtag() pushes the `arguments` object itself, not an array: GTM tells a
   consent command from an ordinary event by that shape. */
function gtag() {
  window.dataLayer.push(arguments);
}

function read() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (!stored || !['granted', 'denied'].includes(stored.choice)) return null;
    if (!(Date.now() - stored.at < MAX_AGE)) return null;
    return stored.choice;
  } catch {
    return null;
  }
}

function write(choice) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    /* Not remembered; the banner asks again on the next page. */
  }
}

let loaded = false;
function loadContainer() {
  if (loaded) return;
  loaded = true;
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.append(script);
}

/* A withdrawal stops new storage through Consent Mode, but what the tags already
   wrote stays unless it is removed. Google sets these on the registrable domain,
   so every level of the hostname is tried. */
function clearGoogleCookies() {
  const names = document.cookie
    .split(';')
    .map((pair) => pair.split('=')[0].trim())
    .filter((name) => /^(_ga|_gid|_gat|_gcl)/.test(name));
  const parts = location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i += 1) domains.push(`; domain=.${parts.slice(i).join('.')}`);
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

function show({ focus = false } = {}) {
  banner.hidden = false;
  if (focus) banner.querySelector('button')?.focus();
}

function choose(choice) {
  write(choice);
  banner.hidden = true;
  if (choice === 'granted') {
    gtag('consent', 'update', GRANTED);
    loadContainer();
  } else {
    gtag('consent', 'update', DENIED);
    clearGoogleCookies();
  }
}

if (banner && containerId) {
  gtag('consent', 'default', DENIED);

  const choice = read();
  if (choice === 'granted') {
    gtag('consent', 'update', GRANTED);
    loadContainer();
  } else if (!choice) {
    show();
  }

  banner.addEventListener('click', (event) => {
    const answer = event.target.closest('[data-consent]')?.dataset.consent;
    if (answer) choose(answer);
  });

  for (const control of document.querySelectorAll('[data-consent-open]')) {
    control.hidden = false;
    control.addEventListener('click', () => show({ focus: true }));
  }
}
