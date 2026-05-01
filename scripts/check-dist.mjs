import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');
const textExtensions = new Set(['.html', '.xml', '.txt']);
const checks = [
  {
    label: 'unresolved undefined.* output',
    regex: /undefined\.[\w.-]+/g
  },
  {
    label: 'unprocessed template marker',
    regex: /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g
  }
];

const failures = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!textExtensions.has(path.extname(entry))) {
      continue;
    }

    const content = readFileSync(fullPath, 'utf8');

    for (const check of checks) {
      const match = content.match(check.regex);
      if (!match) {
        continue;
      }

      failures.push({
        file: path.relative(distDir, fullPath),
        label: check.label,
        sample: match[0]
      });
    }
  }
}

walk(distDir);

if (failures.length > 0) {
  console.error('Build sanity check failed.');
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.label} (${failure.sample})`);
  }
  process.exit(1);
}

console.log('Build sanity check passed.');
