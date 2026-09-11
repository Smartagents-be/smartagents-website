// `npm run sync:jobs` — refresh the committed vacancy snapshot from Odoo.
//
// The build reads Odoo live and falls back to `src/content/jobs/`. This is how
// that fallback stays worth having: run it, look at the diff, commit it. The
// build deliberately does not write it — a build that edits tracked files leaves
// a dirty tree behind, and the moment you want to *see* what Odoo now says is
// the moment it changes. It needs the network, so it is not part of the build.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { languages } from '../build/lib/i18n.mjs';
import { readVacancies, SNAPSHOT_PATH, ODOO_ORIGIN } from '../build/lib/odoo-jobs.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(rootDir, SNAPSHOT_PATH);

const { source, byLang, warning } = await readVacancies({ rootDir });

if (source === 'snapshot') {
  console.error(`sync:jobs — could not reach ${ODOO_ORIGIN}. Nothing written.`);
  if (warning) console.error(`  ${warning}`);
  process.exit(1);
}

/* Only the authored fields are written. `url` and `applyUrl` are derived from
   the slug and the origin every time they are read, so a snapshot taken against
   a staging database cannot pin production URLs into the repo. */
const jobs = {};
for (const language of languages) {
  jobs[language.code] = (byLang[language.code] || []).map(({ slug, title, points, location }) => ({
    slug,
    title,
    points,
    location
  }));
}

const next = `${JSON.stringify({ source, fetchedAt: new Date().toISOString(), jobs }, null, 2)}\n`;
const previous = existsSync(target) ? readFileSync(target, 'utf8') : '';

mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, next);

const counts = languages.map((l) => `${l.code} ${jobs[l.code].length}`).join(' · ');
console.log(`sync:jobs — read from Odoo (${source}): ${counts}`);
if (warning) console.log(`  note: ${warning}`);
console.log(previous === next ? '  snapshot unchanged' : `  snapshot updated: ${SNAPSHOT_PATH} — commit it`);
