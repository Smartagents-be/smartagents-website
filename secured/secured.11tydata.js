const fs = require('node:fs');
const path = require('node:path');
const { resolveSecuredAccessMode, supportsProtectedSecuredDocs } = require('../lib/deploy/secured-access-mode');

module.exports = function () {
  const securedAccessMode = resolveSecuredAccessMode();
  const includeProtectedSecuredDocs = supportsProtectedSecuredDocs(securedAccessMode);
  const files = fs.readdirSync(__dirname);
  const docs = {};

  if (!includeProtectedSecuredDocs) {
    return {
      securedAccessMode,
      securedSupportsProtectedDocs: false,
      securedFiles: []
    };
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.njk' && ext !== '.pdf') continue;
    if (file === 'index.njk' || file === 'en.njk' || file === 'page.njk') continue;

    const base = path.basename(file, ext);
    if (!docs[base]) {
      docs[base] = {
        name: base
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase()),
        slug: base,
      };
    }

    if (ext === '.njk') docs[base].html = `/secured/${base}/`;
    if (ext === '.pdf') docs[base].pdf = `/secured/${file}`;
  }

  return {
    securedAccessMode,
    securedSupportsProtectedDocs: true,
    securedFiles: Object.values(docs).sort((a, b) => a.name.localeCompare(b.name))
  };
};
