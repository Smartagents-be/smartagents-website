const fs = require('node:fs');
const path = require('node:path');

// Friendly display names for the pitch decks under secured/presentations/.
// Falls back to a prettified slug when a deck is not listed here.
const DECK_NAMES = {
  'pitch': 'SmartAgents pitch',
  'staffing-pitch': 'AI Staffing pitch',
  'ai-ready-organization': 'AI-ready organisatie',
  'ontbijtsessie': 'Ontbijtsessie',
  'kbc-staffing-pitch': 'KBC · AI Staffing',
  'advocatuur-pitch': 'Advocatuur · Procesoptimalisatie & AI'
};

function prettify(slug) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = function () {
  const files = fs.readdirSync(__dirname);
  const docs = {};

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.njk' && ext !== '.pdf') continue;
    if (file === 'index.njk' || file === 'page.njk') continue;

    const base = path.basename(file, ext);
    if (!docs[base]) {
      docs[base] = {
        name: prettify(base),
        slug: base,
      };
    }

    if (ext === '.njk') docs[base].html = `/secured/${base}/`;
    if (ext === '.pdf') docs[base].pdf = `/secured/${file}`;
  }

  // Discover pitch decks: secured/presentations/<slug>/index.njk
  const pitchDecks = [];
  const presentationsDir = path.join(__dirname, 'presentations');
  if (fs.existsSync(presentationsDir)) {
    for (const entry of fs.readdirSync(presentationsDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'shared') continue;
      if (!fs.existsSync(path.join(presentationsDir, entry.name, 'index.njk'))) continue;
      const deck = {
        name: DECK_NAMES[entry.name] || prettify(entry.name),
        slug: entry.name,
        html: `/secured/presentations/${entry.name}/`
      };
      // A pre-rendered <slug>.pdf next to the deck (see scripts/export-pitch-pdfs.mjs)
      // is offered as a downloadable, shareable version.
      if (fs.existsSync(path.join(presentationsDir, entry.name, `${entry.name}.pdf`))) {
        deck.pdf = `/secured/presentations/${entry.name}/${entry.name}.pdf`;
      }
      pitchDecks.push(deck);
    }
  }

  return {
    securedFiles: Object.values(docs).sort((a, b) => a.name.localeCompare(b.name)),
    pitchDecks: pitchDecks.sort((a, b) => a.name.localeCompare(b.name))
  };
};
