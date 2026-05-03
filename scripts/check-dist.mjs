import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import securedAccessModeHelpers from '../lib/deploy/secured-access-mode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');
const { resolveSecuredAccessMode } = securedAccessModeHelpers;
const securedAccessMode = resolveSecuredAccessMode(process.env.SECURED_ACCESS_MODE);
const textExtensions = new Set(['.html', '.xml', '.txt', '.css']);
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
    regex: /\b(?:page|services|jobs|team|contact|hero|nav|footer|customerzone|training|approach|vision|mission|about|stats|testimonials)\.(?!css\b|js\b|svg\b|webp\b|png\b|jpg\b|jpeg\b|pdf\b)[\w.-]+\b/g
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
  'en/customerzone/index.html',
  'secured/index.html',
  'en/secured/index.html'
]);

function addFailure(file, label, sample) {
  failures.push({ file, label, sample });
}

function extractCustomPropertyDefinitions(content) {
  return Array.from(content.matchAll(/--([\w-]+)\s*:/g), match => match[1]);
}

function extractCustomPropertyReferences(content) {
  return Array.from(content.matchAll(/var\(--([\w-]+)(\s*,[^)]*)?\)/g), match => ({
    name: match[1],
    hasFallback: Boolean(match[2])
  }));
}

function isPrimaryPage(file) {
  return file.endsWith('.html') && !file.startsWith('secured/') && !file.match(/secured\/.*\/index\.html/);
}

function isErrorPage(file) {
  return file === '404.html' || file === 'en/404.html';
}

function isNoindexPage(file) {
    if (noindexPages.has(file)) return true;
    if (file.startsWith('secured/')) return true;
    if (file.startsWith('en/secured/')) return true;
    return false;
}

function hasFrontMatterLeak(content) {
  return /(?:^|\n)---\s*\n(?:[\w-]+:\s*.*\n)+---\s*(?:\n|$)/m.test(content);
}

function collectTextFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      collectTextFiles(fullPath, files);
      continue;
    }

    if (!textExtensions.has(path.extname(entry))) {
      continue;
    }

    files.push({
      fullPath,
      relativePath: path.relative(distDir, fullPath),
      content: readFileSync(fullPath, 'utf8')
    });
  }

  return files;
}

const textFiles = collectTextFiles(distDir);
const allFiles = new Set();
function collectAllFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      collectAllFiles(fullPath);
    } else {
      allFiles.add(path.relative(distDir, fullPath).replace(/\\/g, '/'));
    }
  }
}
collectAllFiles(distDir);

const sharedCssTokenDefinitions = new Set(
  textFiles
    .filter(file => file.relativePath.endsWith('.css'))
    .flatMap(file => extractCustomPropertyDefinitions(file.content))
);

for (const file of textFiles) {
    const { relativePath, content } = file;
    const normalizedPath = relativePath.replace(/\\/g, '/');

    for (const check of regexChecks) {
      const match = content.match(check.regex);
      if (!match) {
        continue;
      }

      addFailure(normalizedPath, check.label, match[0]);
    }

    // Broken internal link check (HTML only)
    if (normalizedPath.endsWith('.html')) {
      const hrefs = content.matchAll(/href="([^"#{][^"]+)"/g);
      for (const match of hrefs) {
        const href = match[1];
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('//')) {
          continue;
        }
        
        const linkPath = href.split(/[?#]/)[0];
        let normalizedTarget;
        
        if (linkPath.startsWith('/')) {
            normalizedTarget = linkPath.slice(1);
        } else {
            // Resolve relative path against the current file's directory
            const currentDir = path.dirname(normalizedPath);
            normalizedTarget = path.normalize(path.join(currentDir, linkPath));
        }

        if (normalizedTarget === '.') normalizedTarget = 'index.html';
        else if (normalizedTarget.endsWith('/')) normalizedTarget += 'index.html';
        else if (!path.extname(normalizedTarget) && !normalizedTarget.endsWith('.html')) normalizedTarget = path.join(normalizedTarget, 'index.html');
        
        // On Windows, normalizedTarget might use backslashes
        const lookupTarget = normalizedTarget.replace(/\\/g, '/');

        if (!allFiles.has(lookupTarget)) {
            addFailure(normalizedPath, 'broken internal link', href);
        }
      }

      // Missing alt text check
      const imgs = content.matchAll(/<img\s+[^>]*src="([^"]+)"[^>]*>/g);
      for (const match of imgs) {
        const imgTag = match[0];
        if (!imgTag.includes('alt=')) {
          addFailure(normalizedPath, 'missing alt attribute on image', imgTag);
        }
      }
    }

    const localTokenDefinitions = new Set(extractCustomPropertyDefinitions(content));
    const tokenReferences = extractCustomPropertyReferences(content);

    for (const tokenReference of tokenReferences) {
      if (tokenReference.hasFallback) {
        continue;
      }

      const tokenName = tokenReference.name;
      if (localTokenDefinitions.has(tokenName) || sharedCssTokenDefinitions.has(tokenName)) {
        continue;
      }

      addFailure(normalizedPath, 'undefined CSS custom property', `--${tokenName}`);
    }

    if (!isPrimaryPage(normalizedPath)) {
      continue;
    }

    if (hasFrontMatterLeak(content)) {
      addFailure(normalizedPath, 'raw front matter block in output', '---');
    }

    const titleMatch = content.match(/<title>\s*([^<]*)\s*<\/title>/i);
    if (!titleMatch || titleMatch[1].trim().length === 0) {
      addFailure(normalizedPath, 'empty or missing <title>', '<title>');
    }

    if (!isErrorPage(normalizedPath)) {
      const descriptionMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
      if (!descriptionMatch || descriptionMatch[1].trim().length === 0) {
        addFailure(normalizedPath, 'empty or missing meta description', '<meta name="description">');
      }
    }

    const robotsMatch = content.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
    const expectedRobots = isNoindexPage(normalizedPath) ? 'noindex, follow' : 'index, follow';
    if (!robotsMatch) {
      addFailure(normalizedPath, 'missing robots meta tag', '<meta name="robots">');
    } else if (robotsMatch[1].trim() !== expectedRobots) {
      addFailure(normalizedPath, `unexpected robots meta tag, expected "${expectedRobots}"`, robotsMatch[0]);
    }
}

const securedDistDir = path.join(distDir, 'secured');
try {
  const securedEntries = readdirSync(securedDistDir);
  const unexpectedTopLevelSecuredHtml = securedEntries.filter((entry) => entry.endsWith('.html') && entry !== 'index.html');

  for (const entry of unexpectedTopLevelSecuredHtml) {
    addFailure(`secured/${entry}`, 'unexpected top-level secured html output', entry);
  }

  if (securedAccessMode === 'static') {
    const leakedProtectedFiles = securedEntries.filter((entry) => entry.endsWith('.pdf'));
    for (const entry of leakedProtectedFiles) {
      addFailure(`secured/${entry}`, 'protected secured file leaked into static build', entry);
    }

    const leakedProtectedPages = securedEntries.filter((entry) => statSync(path.join(securedDistDir, entry)).isDirectory());
    for (const entry of leakedProtectedPages) {
      addFailure(`secured/${entry}/`, 'protected secured html leaked into static build', entry);
    }
  }
} catch {
  // No secured output directory is also valid for some build targets.
}

if (failures.length > 0) {
  console.error('Build sanity check failed.');
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.label} (${failure.sample})`);
  }
  process.exit(1);
}

console.log('Build sanity check passed.');
