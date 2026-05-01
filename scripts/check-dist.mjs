import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');
const textExtensions = new Set(['.html', '.xml', '.txt']);
const regexChecks = [
  {
    label: 'unresolved undefined.* output',
    regex: /undefined\.[\w.-]+/g
  },
  {
    label: 'unprocessed template marker',
    regex: /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g
  },
  {
    label: 'raw translation key in output',
    regex: /\b(?:page|services|jobs|team|contact|hero|nav|footer|customerzone|training|approach|vision|mission|about|stats|testimonials)\.[\w.-]+\b/g
  },
  {
    label: 'local or development URL leaked into build output',
    regex: /\b(?:https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])|file:\/\/)/gi
  }
];

const failures = [];
const noindexPages = new Set([
  '404.html',
  'en/404.html',
  'customerzone/index.html',
  'en/customerzone/index.html'
]);

function addFailure(file, label, sample) {
  failures.push({ file, label, sample });
}

function isPrimaryPage(file) {
  return file.endsWith('.html') && !file.startsWith('secured/');
}

function isErrorPage(file) {
  return file === '404.html' || file === 'en/404.html';
}

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

    const relativePath = path.relative(distDir, fullPath);
    const content = readFileSync(fullPath, 'utf8');

    for (const check of regexChecks) {
      const match = content.match(check.regex);
      if (!match) {
        continue;
      }

      addFailure(relativePath, check.label, match[0]);
    }

    if (!isPrimaryPage(relativePath)) {
      continue;
    }

    const titleMatch = content.match(/<title>\s*([^<]*)\s*<\/title>/i);
    if (!titleMatch || titleMatch[1].trim().length === 0) {
      addFailure(relativePath, 'empty or missing <title>', '<title>');
    }

    if (!isErrorPage(relativePath)) {
      const descriptionMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
      if (!descriptionMatch || descriptionMatch[1].trim().length === 0) {
        addFailure(relativePath, 'empty or missing meta description', '<meta name="description">');
      }
    }

    const robotsMatch = content.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
    const expectedRobots = noindexPages.has(relativePath) ? 'noindex, follow' : 'index, follow';
    if (!robotsMatch) {
      addFailure(relativePath, 'missing robots meta tag', '<meta name="robots">');
    } else if (robotsMatch[1].trim() !== expectedRobots) {
      addFailure(relativePath, `unexpected robots meta tag, expected "${expectedRobots}"`, robotsMatch[0]);
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
