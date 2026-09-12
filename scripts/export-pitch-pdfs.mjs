// Export each secured pitch deck to a shareable PDF.
//
// <deck-stage> has a print mode that lays out one slide per page at the authored
// 1920x1080 size, so this serves the built dist/ and lets headless Chrome print
// each deck next to its source as <slug>.pdf, which the build picks up as a
// passthrough asset. Run after `npm run build`; CHROME_BIN overrides the
// browser.

import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const repoRoot = resolve(process.cwd());
const distDir = resolve(repoRoot, 'dist');
const presentationsDir = resolve(repoRoot, 'src', 'content', 'secured', 'presentations');
const host = '127.0.0.1';

if (!existsSync(distDir)) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

const chromeCandidates = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);

const chromeBin = chromeCandidates.find((p) => existsSync(p));
if (!chromeBin) {
  console.error('No Chrome/Chromium found. Set CHROME_BIN to the browser binary.');
  process.exit(1);
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

function serveDist() {
  return new Promise((resolveServer) => {
    const server = createServer((req, res) => {
      const requestUrl = new URL(req.url || '/', `http://${host}`);
      const pathname = decodeURIComponent(requestUrl.pathname);
      const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
      let filePath = join(distDir, safePath);
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403); res.end('Forbidden'); return;
      }
      if (pathname.endsWith('/')) filePath = join(filePath, 'index.html');
      if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
      if (statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
      if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
      createReadStream(filePath).pipe(res);
    });
    server.listen(0, host, () => resolveServer(server));
  });
}

/** How many slides the deck declares, or 0 if the manifest cannot be read. */
function slideCount(slug) {
  try {
    const deck = JSON.parse(readFileSync(join(presentationsDir, slug, 'deck.json'), 'utf8'));
    return Array.isArray(deck.slides) ? deck.slides.length : 0;
  } catch {
    return 0;
  }
}

/**
 * How many pages the written PDF has, or 0 if it cannot be told. Chrome's page
 * tree may be nested, and every node carries its own `/Count`, so the total is
 * the largest of them. Unparseable means unknown, never zero: this number gates
 * a failure, and a check that cannot read its input must not invent one.
 */
function pageCount(file) {
  const counts = [...readFileSync(file, 'latin1').matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  return counts.length ? Math.max(...counts) : 0;
}

// An optional slug exports one deck, the way `check-slides.mjs` takes one. Every
// run rewrites the PDF of every deck it touches, and a PDF is a committed
// binary: exporting all ten to pick up a change to one puts nine unrelated
// files in the diff, each of them a fresh print that differs from the committed
// one in ways nobody reviewed.
const only = process.argv[2];
const decks = readdirSync(presentationsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== 'shared')
  .filter((e) => existsSync(join(presentationsDir, e.name, 'deck.json')))
  .map((e) => e.name)
  .filter((name) => !only || name === only)
  .sort();

if (!decks.length) {
  console.error(only ? `No deck named "${only}".` : 'No decks found.');
  process.exit(1);
}

const server = await serveDist();
const { port } = server.address();
console.log(`Serving dist at http://${host}:${port}`);

let failures = 0;
for (const slug of decks) {
  const url = `http://${host}:${port}/secured/presentations/${slug}/`;
  const out = join(presentationsDir, slug, `${slug}.pdf`);
  process.stdout.write(`Exporting ${slug} ... `);
  // Use async spawn (not spawnSync): the static server lives in this same
  // process, so a synchronous child would block the event loop and Chrome
  // could never fetch the deck's assets. Also avoid --user-data-dir and
  // --no-sandbox: in this Chrome build either makes --print-to-pdf hang.
  const status = await new Promise((res) => {
    const child = spawn(chromeBin, [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=10000',
      `--print-to-pdf=${out}`,
      url
    ], { stdio: 'ignore' });
    child.on('exit', (code) => res(code));
    child.on('error', () => res(1));
  });

  if (status !== 0 || !existsSync(out)) {
    failures += 1;
    console.log(`FAILED (chrome exited ${status})`);
    continue;
  }

  // A run that finishes is not a run that worked. Chrome answers 0 and writes a
  // file whether or not the deck's stylesheets landed before the virtual-time
  // budget ran out, and what it writes then is the slide markup reflowed as an
  // unstyled A4 document: serif, portrait, several slides to the page. One of
  // those was committed over a good export and nothing said a word, so the page
  // count is checked against the deck's own slide list: a print that lost the
  // stylesheet loses the one-slide-per-page rule with it, every time.
  const expected = slideCount(slug);
  const pages = pageCount(out);
  if (expected && pages && pages !== expected) {
    failures += 1;
    console.log(`FAILED (${pages} pages for ${expected} slides; the stylesheet did not land, re-run)`);
    continue;
  }

  console.log(`ok (${(statSync(out).size / 1024 / 1024).toFixed(1)} MB, ${pages || '?'} pages)`);
}

server.close();
console.log(`Done. ${decks.length - failures}/${decks.length} decks exported.`);
process.exit(failures ? 1 : 0);
