// Measure every slide in every deck and report the ones whose content does not
// fit the stage.
//
// The stage is a fixed 1920x1080 box with `overflow: hidden`, so a slide with
// too much copy on it does not warn, wrap or scroll: the surplus is simply not
// painted. Nothing in `npm run build` can see this, because it is a layout
// fact and the build never lays anything out. Until this script existed the
// skill's advice was "open the deck and look at every slide", which across ten
// decks is two hundred and some slides by hand, every time a line of copy
// changes.
//
// So: serve `dist/`, open each deck in headless Chrome, and ask the page. The
// deck renders every slide into the DOM at once (the rail needs them), so one
// page load measures the whole deck.
//
// Two numbers per slide:
//   overflow  `.slide__body` content taller than the box it is centred in.
//             `.slide__body` is `justify-content: safe center`, so an overrun
//             spills downward into the padding the footer reserves rather than
//             off both ends; up to about 90px is invisible, past that it runs
//             into the chrome band.
//   escape    any element whose painted box crosses the 1080px floor or the
//             slide's left or right edge. This catches what the first number
//             cannot: a `.slide__note` pushed off the foot, a media frame
//             wider than its column, a heading that has run past the padding.
//
// Usage:
//   npm run build          # dist/ must be current
//   npm run check:slides   # or: node scripts/check-slides.mjs <deck-slug>
//
// Override the browser with CHROME_BIN=/path/to/chrome.
//
// This is not part of `npm run build` on purpose: it needs a browser, and the
// Cloudflare Pages build image has none. It is a thing you run before you show
// a deck to anyone.

import { createReadStream, existsSync, mkdtempSync, rmSync, statSync, readdirSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const repoRoot = resolve(process.cwd());
const distDir = resolve(repoRoot, 'dist');
const presentationsDir = resolve(repoRoot, 'src', 'content', 'secured', 'presentations');
const host = '127.0.0.1';

// Slack before a slide is called broken. `.slide--footed` reserves 184px at the
// foot and the chrome sits 80px up, so a body that runs a little long lands in
// paper rather than on the footer. Below this it is invisible; above it, it is
// eating the band.
const OVERFLOW_SLACK = 90;

if (!existsSync(distDir)) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

const chromeBin = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean).find((p) => existsSync(p));

if (!chromeBin) {
  console.error('No Chrome/Chromium found. Set CHROME_BIN to the browser binary.');
  process.exit(1);
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function serveDist() {
  return new Promise((ready) => {
    const server = createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url || '/', `http://${host}`).pathname);
      let filePath = join(distDir, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
      if (!filePath.startsWith(distDir)) { res.writeHead(403); res.end(); return; }
      if (pathname.endsWith('/')) filePath = join(filePath, 'index.html');
      if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
      if (!existsSync(filePath)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
      createReadStream(filePath).pipe(res);
    });
    server.listen(0, host, () => ready(server));
  });
}

/**
 * Run one expression in the page and return its value. Chrome is driven over
 * the DevTools protocol rather than with a driver library, because the repo has
 * no runtime dependencies and this needs three calls.
 */
async function measure(url) {
  const profile = mkdtempSync(join(tmpdir(), 'sa-slides-'));
  const child = spawn(chromeBin, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--window-size=1920,1080',
    'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  try {
    const endpoint = await new Promise((res, rej) => {
      let buf = '';
      const timer = setTimeout(() => rej(new Error('Chrome did not report a debugging port')), 20000);
      child.stderr.on('data', (chunk) => {
        buf += chunk;
        const m = buf.match(/ws:\/\/[^\s]+/);
        if (m) { clearTimeout(timer); res(m[0].replace(/\/devtools\/browser\/.*/, '')); }
      });
      child.on('error', rej);
    });

    const targets = await (await fetch(`${endpoint.replace('ws://', 'http://')}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
    const ws = new WebSocket(targets.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 0;
    const call = (method, params) => new Promise((res) => {
      const mine = ++id;
      const onMessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === mine) { ws.removeEventListener('message', onMessage); res(msg.result); }
      };
      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id: mine, method, params }));
    });

    // The deck's own script has to have run and laid the slides out. Poll
    // rather than sleep: a deck with video posters takes longer than one
    // without, and a fixed wait is either flaky or slow.
    const deadline = Date.now() + 20000;
    for (;;) {
      const { result } = await call('Runtime.evaluate', {
        expression: 'document.readyState === "complete" && !!document.querySelector(".slide")',
        returnByValue: true
      });
      if (result.value) break;
      if (Date.now() > deadline) throw new Error('deck did not finish loading');
      await new Promise((r) => setTimeout(r, 200));
    }

    const { result } = await call('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        const STAGE_H = 1080, STAGE_W = 1920;
        return [...document.querySelectorAll('.slide')].map((slide, i) => {
          const label = slide.dataset.label || '';
          const body = slide.querySelector('.slide__body');
          const overflow = body ? Math.max(0, body.scrollHeight - body.clientHeight) : 0;
          const base = slide.getBoundingClientRect();
          let escape = 0, culprit = '';
          for (const el of slide.querySelectorAll('*')) {
            if (el.closest('.slide__shape, .orbits')) continue;
            const r = el.getBoundingClientRect();
            if (!r.width && !r.height) continue;
            const over = Math.max(
              r.bottom - (base.top + STAGE_H),
              (base.top) - r.top,
              r.right - (base.left + STAGE_W),
              base.left - r.left
            );
            if (over > escape) { escape = over; culprit = el.id || el.className || el.tagName; }
          }
          return { i, label, overflow: Math.round(overflow), escape: Math.round(escape), culprit };
        });
      })()`
    });

    ws.close();
    return result.value || [];
  } finally {
    // Wait for the browser to be gone before clearing its profile: killing it
    // and deleting in the same tick races the flush of its own leveldb and
    // throws ENOTEMPTY, which would be reported as a deck that failed to
    // measure. The directory is disposable either way, so never let tidying up
    // fail the run.
    child.kill();
    await new Promise((res) => (child.exitCode === null ? child.once('exit', res) : res()));
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
    } catch { /* a leftover temp profile is not worth a failure */ }
  }
}

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

let flagged = 0;
let slides = 0;

for (const slug of decks) {
  const url = `http://${host}:${port}/secured/presentations/${slug}/`;
  let rows;
  try {
    rows = await measure(url);
  } catch (error) {
    console.error(`${slug}: could not measure (${error.message})`);
    flagged += 1;
    continue;
  }

  slides += rows.length;
  const bad = rows.filter((r) => r.overflow > OVERFLOW_SLACK || r.escape > 1);
  if (!bad.length) {
    console.log(`${slug}: ${rows.length} slides, all fit`);
    continue;
  }

  console.log(`${slug}: ${rows.length} slides, ${bad.length} over`);
  for (const r of bad) {
    const num = String(r.i + 1).padStart(2, '0');
    const bits = [];
    if (r.overflow > OVERFLOW_SLACK) bits.push(`body +${r.overflow}px`);
    if (r.escape > 1) bits.push(`${r.culprit} ${r.escape}px past the edge`);
    console.log(`  ${num} ${r.label || '(no label)'} — ${bits.join(', ')}`);
  }
  flagged += bad.length;
}

server.close();

console.log(
  flagged
    ? `\n${flagged} of ${slides} slides need a look. Shorten the copy or split the slide; do not take off slide--footed.`
    : `\n${slides} slides, all fit.`
);
process.exit(flagged ? 1 : 0);
