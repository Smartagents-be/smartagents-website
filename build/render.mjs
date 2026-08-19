// Renders every page template to a complete HTML file in dist/.
// Runs after `vite build`, which produces the hashed assets and the manifest.
// See .claude/skills/fast-static-site/SKILL.md §1.
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';

import { html, raw, join } from './lib/html.mjs';
import {
  languages,
  defaultLanguage,
  loadStrings,
  createTranslator,
  assertNoMissingTranslations,
  buildAlternates,
  pagePath,
  absolute
} from './lib/i18n.mjs';
import { loadManifest } from './lib/assets.mjs';
import { loadDecks, loadSecuredDocuments } from './lib/decks.mjs';
import { basePage } from '../src/layouts/base.mjs';
import { deckPage, securedIndexPage } from '../src/layouts/deck.mjs';

import { page as homePage } from '../src/pages/home.mjs';
import { page as notFoundPage } from '../src/pages/not-found.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const contentDir = path.join(rootDir, 'src/content');

const PAGES = [homePage, notFoundPage];

const MINIFY_OPTIONS = {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
  removeRedundantAttributes: false,
  sortAttributes: false
};

let written = 0;

async function writeHtml(relativePath, markup) {
  const target = path.join(distDir, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, await minify(String(markup), MINIFY_OPTIONS));
  written++;
}

/* ------------------------------------------------------------------ *
 * Public, language-prefixed pages
 * ------------------------------------------------------------------ */

async function renderPublicPages({ strings, criticalCss, assets }) {
  const sitemapEntries = [];

  for (const page of PAGES) {
    const alternates = buildAlternates(page.slugs);

    for (const language of languages) {
      const slug = page.slugs[language.code];
      if (slug === undefined) continue; // Intentionally not available in this language.

      const t = createTranslator(strings, language.code);
      const meta = page.meta(t);
      const url = pagePath(language.code, slug);

      const body = page.render({ t, lang: language.code, dir: language.dir, alternates, url });

      await writeHtml(
        path.join(url.slice(1), 'index.html'),
        basePage({
          t,
          lang: language.code,
          dir: language.dir,
          url,
          title: meta.title,
          description: meta.description,
          noindex: page.noindex === true,
          alternates,
          criticalCss,
          assets,
          preloadImage: meta.preloadImage,
          body
        })
      );

      if (!page.excludeFromSitemap) {
        sitemapEntries.push({ url, alternates });
      }
    }
  }

  return sitemapEntries;
}

/* ------------------------------------------------------------------ *
 * Root fallback + 404 for hosts without redirect support
 * ------------------------------------------------------------------ */

async function renderRootFallback() {
  const target = pagePath(defaultLanguage.code);
  const links = languages.map(
    (language) =>
      html`<li><a href="${pagePath(language.code)}" lang="${language.code}" hreflang="${language.code}">${language.name}</a></li>`
  );

  // The host redirects / to a language (see _redirects). This file only matters
  // when that redirect is unavailable, so it must work with no CSS and no JS.
  await writeHtml(
    'index.html',
    html`<!doctype html>
<html lang="${defaultLanguage.code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="0; url=${target}">
<title>SmartAgents</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${absolute(target)}">
<script>
(function () {
  var supported = ${raw(JSON.stringify(languages.map((language) => language.code)))};
  var preferred = (navigator.languages || [navigator.language || '']);
  for (var i = 0; i < preferred.length; i++) {
    var code = String(preferred[i]).slice(0, 2).toLowerCase();
    if (supported.indexOf(code) !== -1) { location.replace('/' + code + '/'); return; }
  }
})();
</script>
</head>
<body>
<ul>
${join(links)}
</ul>
</body>
</html>`
  );
}

/* ------------------------------------------------------------------ *
 * The password-gated area: overview, decks, standalone documents
 * ------------------------------------------------------------------ */

const COPY_SKIP = new Set(['.html', '.json']);

function copySecuredStatic() {
  const source = path.join(contentDir, 'secured');

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (COPY_SKIP.has(path.extname(entry.name).toLowerCase())) continue;

      const target = path.join(distDir, 'secured', path.relative(source, full));
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(full, target);
    }
  };

  walk(source);
}

async function renderSecured() {
  const decks = loadDecks(contentDir);
  const documents = loadSecuredDocuments(contentDir);

  await writeHtml('secured/index.html', securedIndexPage({ documents, decks }));

  for (const deck of decks) {
    await writeHtml(path.join('secured/presentations', deck.slug, 'index.html'), deckPage(deck));
  }

  // Standalone documents are already complete HTML pages; copy them into their
  // own directory so the URL keeps a trailing slash.
  for (const document of documents) {
    if (!document.html) continue;
    const source = path.join(contentDir, 'secured', `${document.slug}.html`);
    await writeHtml(path.join('secured', document.slug, 'index.html'), readFileSync(source, 'utf8'));
  }

  copySecuredStatic();
  return { decks, documents };
}

/* ------------------------------------------------------------------ *
 * Sitemap, robots, service worker
 * ------------------------------------------------------------------ */

function renderSitemap(entries) {
  const urls = entries.map((entry) => {
    const alternates = entry.alternates
      .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.code}" href="${alt.href}"/>`)
      .join('\n');
    return `  <url>\n    <loc>${absolute(entry.url)}</loc>\n${alternates}\n  </url>`;
  });

  writeFileSync(
    path.join(distDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
  );

  writeFileSync(
    path.join(distDir, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /secured/\n\nSitemap: ${absolute('/sitemap.xml')}\n`
  );
}

function renderServiceWorker(precache) {
  const template = readFileSync(path.join(rootDir, 'src/sw.js'), 'utf8');
  // The hashed asset names are the version: new assets mean a new cache.
  const version = precache.join('|').replace(/[^a-z0-9]/gi, '').slice(-16) || 'dev';

  writeFileSync(
    path.join(distDir, 'sw.js'),
    template
      .replace("'__VERSION__'", JSON.stringify(version))
      .replace("'__PRECACHE__'", JSON.stringify(precache))
  );
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

const strings = loadStrings(rootDir);
// Tokens first: critical.css and every component stylesheet build on them, and
// the inlined block is the only place they are defined.
const criticalCss = ['src/styles/tokens.css', 'src/styles/critical.css']
  .map((file) => readFileSync(path.join(rootDir, file), 'utf8'))
  .join('\n');
const assets = loadManifest(distDir);

const sitemapEntries = await renderPublicPages({ strings, criticalCss, assets });
await renderRootFallback();
const { decks, documents } = await renderSecured();

// Static files that ship as-is (favicon, any future robots additions).
cpSync(path.join(rootDir, 'public'), distDir, { recursive: true });

renderSitemap(sitemapEntries);
renderServiceWorker(assets.precache);

assertNoMissingTranslations();

console.log(
  `Rendered ${written} pages: ${PAGES.length} templates × ${languages.length} languages, ` +
    `${decks.length} decks, ${documents.filter((d) => d.html).length} documents.`
);
