// Discover the internal presentation decks and assemble their slides.
// Each deck is a folder of plain HTML fragments plus a deck.json describing it.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { html, raw } from './html.mjs';
import { areaForSlug, areaRoot, deckPath } from '../../functions/secured/areas.js';

/** Friendly display names for the /secured/ overview. Falls back to the slug. */
const DECK_NAMES = {
  'pitch': 'SmartAgents pitch',
  'staffing-pitch': 'AI Staffing pitch',
  'ai-ready-organization': 'AI-ready organisatie',
  'ontbijtsessie': 'Ontbijtsessie',
  'kbc-staffing-pitch': 'KBC · AI Staffing',
  'kbc-staffing-pitch-en': 'KBC · AI Staffing (EN)',
  'advocatuur-pitch': 'Advocatuur · Procesoptimalisatie & AI',
  'isabel-sdlc': 'Isabel · AI-native SDLC',
  'isabel-testing-strategy': 'Isabel · Testing strategy',
  'isabel-update-6-oct': 'Isabel · Update and cake moments, 6 October',
  'isabel-update-13-oct': 'Isabel · Ponto update, 13 October',
  'isabel-update-20-oct': 'Isabel · Update and playgrounds, 20 October',
  'rce-coaching': 'Isabel · Coaching: restrict, contain, expand',
  'lease-lens-demo': 'LeaseLens demo'
};

function prettify(slug) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * The per-slide footer: brand mark plus "05 / 10".
 *
 * The mark is an `<img>`, which cannot inherit `currentColor`, so the two
 * surfaces are two files: the cyan-on-paper mark for a normal slide and the
 * bright-on-navy one for a slide that carries `.field`.
 */
function chrome(slideNumber, slideTotal, onField) {
  const mark = onField ? 'assets/logo-dark.svg' : 'assets/logo.svg';
  return html`<div class="chrome">
  <span class="brand"><img src="${mark}" alt=""><span>Smart<span class="accent">Agents</span></span></span>
  ${slideNumber && slideTotal ? html`<span class="pageno">${slideNumber} / ${slideTotal}</span>` : ''}
</div>`.toString();
}

/**
 * Expand the `<!--chrome 05/10-->` markers the slides carry. One fragment is
 * one slide, so the section's own class list says which ground the footer
 * lands on.
 */
function expandChrome(fragment) {
  const onField = /<section[^>]*\bclass="[^"]*\bfield\b/.test(fragment);
  return fragment.replace(/<!--chrome(?:\s+([^/\s]+)\/([^\s]+))?-->/g, (match, number, total) =>
    chrome(number, total, onField)
  );
}

export function loadDecks(contentDir) {
  const decksDir = path.join(contentDir, 'secured/presentations');
  if (!existsSync(decksDir)) return [];

  const decks = [];
  for (const entry of readdirSync(decksDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory() || entry.name === 'shared') continue;

    const dir = path.join(decksDir, entry.name);
    const configFile = path.join(dir, 'deck.json');
    if (!existsSync(configFile)) continue;

    const config = JSON.parse(readFileSync(configFile, 'utf8'));
    const slides = config.slides.map((name) => {
      const file = path.join(dir, 'slides', `${name}.html`);
      if (!existsSync(file)) throw new Error(`Deck "${entry.name}" lists a missing slide: ${name}.html`);
      return raw(expandChrome(readFileSync(file, 'utf8')));
    });

    // A client's deck is published under its area, where the client's own
    // password reaches it; see `functions/secured/areas.js`.
    const url = deckPath(entry.name);
    const pdf = existsSync(path.join(dir, `${entry.name}.pdf`))
      ? `${url}${entry.name}.pdf`
      : null;

    decks.push({
      slug: entry.name,
      name: DECK_NAMES[entry.name] || prettify(entry.name),
      area: areaForSlug(entry.name),
      dir,
      url,
      pdf,
      config,
      slides
    });
  }

  return decks;
}

/** Standalone documents living directly under /secured/ (HTML with a matching PDF). */
export function loadSecuredDocuments(contentDir) {
  const dir = path.join(contentDir, 'secured');
  const documents = new Map();

  for (const file of readdirSync(dir)) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.html' && ext !== '.pdf') continue;

    const base = path.basename(file, ext);
    // A client's document sits in its area, like a client's deck.
    const root = areaRoot(areaForSlug(base));
    if (!documents.has(base)) {
      documents.set(base, { name: prettify(base), slug: base, area: areaForSlug(base), html: null, pdf: null });
    }
    const record = documents.get(base);
    if (ext === '.html') record.html = `${root}${base}/`;
    if (ext === '.pdf') record.pdf = `${root}${file}`;
  }

  return [...documents.values()].sort((a, b) => a.name.localeCompare(b.name));
}
