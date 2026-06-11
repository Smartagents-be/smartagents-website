// Export each secured pitch deck to a shareable PDF.
//
// The decks use the <deck-stage> web component, which has a print mode
// (@media print) that lays out one slide per page at the authored 1920x1080
// size. We serve the built dist/ folder and let headless Chrome print each
// deck to PDF, written next to the deck source as <slug>.pdf so the build
// picks it up as a passthrough asset.
//
// Usage:
//   npm run build            # dist/ must be current
//   node scripts/export-pitch-pdfs.mjs
//
// Override the browser with CHROME_BIN=/path/to/chrome if needed.

import { createReadStream, existsSync, statSync, readdirSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const repoRoot = resolve(process.cwd());
const distDir = resolve(repoRoot, 'dist');
const presentationsDir = resolve(repoRoot, 'secured', 'presentations');
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

const decks = readdirSync(presentationsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== 'shared')
  .filter((e) => existsSync(join(presentationsDir, e.name, 'index.njk')))
  .map((e) => e.name)
  .sort();

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

  if (status === 0 && existsSync(out)) {
    console.log(`ok (${(statSync(out).size / 1024 / 1024).toFixed(1)} MB)`);
  } else {
    failures += 1;
    console.log('FAILED');
    if (result.stderr) console.error(result.stderr.split('\n').slice(-3).join('\n'));
  }
}

server.close();
console.log(`Done. ${decks.length - failures}/${decks.length} decks exported.`);
process.exit(failures ? 1 : 0);
