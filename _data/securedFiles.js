const fs = require('fs');
const path = require('path');

module.exports = function () {
  const dir = './secured';
  const files = fs.readdirSync(dir);

  const docs = {};
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.html' && ext !== '.pdf') continue;
    const base = path.basename(file, ext);
    if (!docs[base]) {
      docs[base] = {
        name: base
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase()),
        slug: base,
      };
    }
    if (ext === '.html') docs[base].html = `/secured/${file}`;
    if (ext === '.pdf') docs[base].pdf = `/secured/${file}`;
  }

  return Object.values(docs).sort((a, b) => a.name.localeCompare(b.name));
};
