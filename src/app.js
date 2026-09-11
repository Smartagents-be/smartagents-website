// Entry chunk. Deliberately tiny: prefetch helper, component lazy-loader and
// service worker registration. No framework, no router (layer 2 of the
// MPA-feels-like-SPA stack is CSS-only view transitions).
// See .claude/skills/webcomponent-mpa-spa/SKILL.md §5.
import './styles/main.css';

/* ------------------------------------------------------------------ *
 * Lazy component registration
 * ------------------------------------------------------------------ */

/** tag name -> dynamic import. Vite splits each into its own hashed chunk. */
const COMPONENTS = {
  'sa-accordion': () => import('./components/accordion/accordion.js'),
  'sa-lazy-video': () => import('./components/lazy-video/lazy-video.js'),
  'sa-node-field': () => import('./components/node-field/node-field.js'),
  'sa-contact-form': () => import('./components/contact-form/contact-form.js'),
  'sa-clause-index': () => import('./components/clause-index/clause-index.js')
};

const loading = new Set();

function upgrade(tagName) {
  if (loading.has(tagName) || customElements.get(tagName)) return;
  loading.add(tagName);
  COMPONENTS[tagName]().catch((error) => {
    loading.delete(tagName);
    console.error(`Failed to load <${tagName}>`, error);
  });
}

const nearViewport = 'IntersectionObserver' in window
  ? new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          upgrade(entry.target.localName);
        }
      },
      { rootMargin: '200px' }
    )
  : null;

function scan(root = document) {
  for (const tagName of Object.keys(COMPONENTS)) {
    for (const element of root.querySelectorAll(tagName)) {
      if (nearViewport) nearViewport.observe(element);
      else upgrade(tagName);
    }
  }
}

scan();
// Re-scan when a soft navigation swaps content in (no router today, but the
// contract is in place for when one is added).
document.addEventListener('page:change', () => scan());

/* ------------------------------------------------------------------ *
 * The menu disclosure
 *
 * The header menu is a <details>, so it opens and closes with no JS at all and
 * the page is fully navigable without this. What a `<details>` cannot be on its
 * own is modal, and on a phone the panel is a full-height sheet over the page:
 * everything it covers goes `inert` — out of the tab order, out of hit-testing
 * and off the accessibility tree in one attribute, where a focus trap would be
 * a hundred lines — the document stops scrolling, and Escape or a click outside
 * puts the sheet away. What stays reachable is the header row it hangs from.
 *
 * Above the phone the same panel is a compact dropdown and is not modal. It
 * takes only the outside click from this block: a menu left standing open
 * behind the page you have just clicked on is a menu that has not noticed.
 * ------------------------------------------------------------------ */

const navToggle = document.getElementById('nav-toggle');

if (navToggle) {
  /* Where the panel becomes the sheet (`main.css`). Listened to, not read once:
     a phone that turns to landscape crosses it mid-visit. */
  const sheetWidth = matchMedia('(max-width: 620px)');

  /* The skip link is in here because it points into `#main`, and a link to
     inert content is a tab stop that goes nowhere. */
  const behindSheet = ['site-skip-link', 'main', 'site-footer', 'mobile-actions']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const syncSheet = () => {
    const modal = navToggle.open && sheetWidth.matches;
    for (const element of behindSheet) element.inert = modal;
    document.documentElement.classList.toggle('has-sheet', modal);
  };

  navToggle.addEventListener('toggle', syncSheet);
  sheetWidth.addEventListener('change', syncSheet);

  const close = ({ focusTrigger } = {}) => {
    navToggle.open = false;
    syncSheet();
    if (focusTrigger) navToggle.querySelector('summary')?.focus();
  };

  navToggle.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) close();
  });

  /* `pointerdown`, not `click`: a drag that starts inside the panel and ends
     outside it fires `click` and is not a dismissal. */
  document.addEventListener('pointerdown', (event) => {
    if (navToggle.open && !navToggle.contains(event.target)) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.open) close({ focusTrigger: true });
  });
}

/* ------------------------------------------------------------------ *
 * A same-page action that opens a form puts the cursor in it
 *
 * "Plan een gesprek" scrolls `#contact` into view and leaves the focus on
 * `<body>`, so the next Tab starts back at the top of the document. A link to
 * an anchor on this page that contains a form hands the focus to that form's
 * first control instead; `preventScroll` leaves the anchor jump to the browser.
 * Nothing happens on load — a landing on `#contact` has not asked for the
 * keyboard, and on a phone it would raise one over the page it just loaded.
 * ------------------------------------------------------------------ */

document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a[href*="#"]');
  if (!link || event.defaultPrevented) return;

  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname) return;
  if (!url.hash || url.hash === '#') return;

  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  const field = target?.querySelector('form :is(input, textarea, select):not([type="hidden"])');
  /* On the next frame: following the fragment is the click's default action, it
     runs after the listeners, and it moves the focus to `<body>` when the target
     is not focusable — which a `<section>` never is. Focusing in the handler is
     focusing a moment before the browser takes it away again. */
  if (field) requestAnimationFrame(() => field.focus({ preventScroll: true }));
});

/* ------------------------------------------------------------------ *
 * The phone's action bar, held back while the hero's own action is on screen
 *
 * At 390x844 the hero's primary button and the sticky bar's copy of it are both
 * on the first screen: the same words 490px apart, one covering the bottom of
 * the page to say what the other already says.
 *
 * The bar ships visible and this hides it, never the other way round: with JS
 * off the reader gets a duplicated action rather than none. `data-hide-until`
 * names the element the bar defers to, so the markup says what it waits for.
 * ------------------------------------------------------------------ */

const actionBar = document.getElementById('mobile-actions');
const deferTo = actionBar?.dataset.hideUntil
  ? document.querySelector(actionBar.dataset.hideUntil)
  : null;

if (actionBar && deferTo && 'IntersectionObserver' in window) {
  new IntersectionObserver(
    ([entry]) => actionBar.classList.toggle('is-deferred', entry.isIntersecting),
    { threshold: 0 }
  ).observe(deferTo);
}

/* ------------------------------------------------------------------ *
 * Page motion — spotlight, magnets. Decorative, so it waits.
 * ------------------------------------------------------------------ */

import './motion.js';

/* ------------------------------------------------------------------ *
 * Hover prefetch — fallback for browsers without Speculation Rules
 * ------------------------------------------------------------------ */

if (!HTMLScriptElement.supports?.('speculationrules')) {
  const prefetched = new Set();

  const prefetch = (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname.startsWith('/secured/')) return;
    /* `/media/` is files, not pages: the two course one-pagers are 200 KB each.
       Speculation Rules carry the same exclusion; this is the fallback. */
    if (url.pathname.startsWith('/media/')) return;
    if (link.hasAttribute('download') || link.target) return;
    if (url.pathname === location.pathname) return;
    if (prefetched.has(url.href)) return;
    if (navigator.connection?.saveData) return;

    prefetched.add(url.href);
    const hint = document.createElement('link');
    hint.rel = 'prefetch';
    hint.href = url.href;
    document.head.append(hint);
  };

  document.addEventListener('pointerenter', prefetch, { capture: true, passive: true });
  document.addEventListener('touchstart', prefetch, { capture: true, passive: true });
}

/* ------------------------------------------------------------------ *
 * Service worker — registered after load so it never competes with paint
 * ------------------------------------------------------------------ */

if ('serviceWorker' in navigator) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* A failed registration must never break the page. */
    });
  });
}
