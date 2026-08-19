// Discover the internal presentation decks and assemble their slides.
// Each deck is a folder of plain HTML fragments plus a deck.json describing it.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { html, raw } from './html.mjs';

/** Friendly display names for the /secured/ overview. Falls back to the slug. */
const DECK_NAMES = {
  'pitch': 'SmartAgents pitch',
  'staffing-pitch': 'AI Staffing pitch',
  'ai-ready-organization': 'AI-ready organisatie',
  'ontbijtsessie': 'Ontbijtsessie',
  'kbc-staffing-pitch': 'KBC · AI Staffing',
  'advocatuur-pitch': 'Advocatuur · Procesoptimalisatie & AI'
};

function prettify(slug) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/** The per-slide footer: brand mark plus "05 / 10". */
function chrome(slideNumber, slideTotal) {
  return html`<div class="chrome">
  <span class="brand"><img src="assets/logo.svg" alt=""><span>Smart<span class="accent">Agents</span></span></span>
  ${slideNumber && slideTotal ? html`<span class="pageno">${slideNumber} / ${slideTotal}</span>` : ''}
</div>`.toString();
}

/** Expand the `<!--chrome 05/10-->` markers the slides carry. */
function expandChrome(fragment) {
  return fragment.replace(/<!--chrome(?:\s+([^/\s]+)\/([^\s]+))?-->/g, (match, number, total) =>
    chrome(number, total)
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

    const url = `/secured/presentations/${entry.name}/`;
    const pdf = existsSync(path.join(dir, `${entry.name}.pdf`))
      ? `${url}${entry.name}.pdf`
      : null;

    decks.push({
      slug: entry.name,
      name: DECK_NAMES[entry.name] || prettify(entry.name),
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
    if (!documents.has(base)) {
      documents.set(base, { name: prettify(base), slug: base, html: null, pdf: null });
    }
    const record = documents.get(base);
    if (ext === '.html') record.html = `/secured/${base}/`;
    if (ext === '.pdf') record.pdf = `/secured/${file}`;
  }

  return [...documents.values()].sort((a, b) => a.name.localeCompare(b.name));
}
