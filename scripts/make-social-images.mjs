// Renders the two raster brand images the site needs and cannot derive at build
// time: the default Open Graph card and the square logo that `Organization`
// structured data points at.
//
// Not part of `npm run build`, for the reason `check-slides.mjs` is not: it
// needs a browser, and the Cloudflare Pages build image has none. Both outputs
// are committed under `public/media/`, so a deploy never runs this. Run it again
// when the wordmark, the claim or the dark field change:
//
//   node scripts/make-social-images.mjs
//
// The card is drawn from the same tokens the site is — the navy field, the one
// cyan, the logo mark from `src/layouts/base.mjs` — rather than from a picture
// somebody exported, so it cannot drift from the brand it stands for. There is
// no photograph and no stock art in it, which is the design system's own rule
// about imagery (design README, "Iconography and imagery").
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'public/media');

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

/** The logo mark, lifted out of src/layouts/base.mjs so the two cannot drift. */
const LOGO = readFileSync(path.join(rootDir, 'src/layouts/base.mjs'), 'utf8')
  .match(/<svg \$\{idAttr\}class="logo[\s\S]*?<\/svg>/)[0]
  .replace('${idAttr}', '')
  .replace(/\$\{opacity\[0\]\}/, '0.62')
  .replace(/\$\{opacity\[1\]\}/, '0.42')
  .replace('logo logo--${surface}', 'logo')
  .replace('aria-hidden="true" focusable="false"', '');

const TOKENS = `
  --field: oklch(0.183 0.022 252);
  --field-2: oklch(0.21 0.024 252);
  --cyan: oklch(0.53 0.112 214);
  --cyan-bright: #00d8ff;
  --on-field: oklch(0.97 0.004 247.84);
  --on-field-muted: oklch(0.78 0.014 240);
  --font: Geist, Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
`;

/**
 * The card: the dark field, the petal's own curve cut out of the right flank in
 * a lighter step of the same navy, and the wordmark over it with the claim
 * under a cyan rule. The claim is the site's `hero.claim` in the default
 * language; a share card is one image for every locale, and the Dutch line is
 * the one the company leads with.
 */
const CARD = `<!doctype html><meta charset="utf-8">
<style>
  :root { ${TOKENS} }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: var(--field); font-family: var(--font);
         color: var(--on-field); position: relative; overflow: hidden; }
  .petal { position: absolute; inset: 0 0 0 52%; background: var(--field-2);
           clip-path: path("M624,0 C580,78 498,143 373,177 C249,211 82,249 32,304 C5,334 19,363 71,389 C123,415 217,435 324,460 C437,486 536,515 581,556 C610,582 625,600 625,630 L625,0 Z"); }
  .glow { position: absolute; right: -140px; top: -160px; width: 620px; height: 620px; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in oklch, var(--cyan) 30%, transparent) 0%, transparent 68%); }
  .plate { position: absolute; inset: 96px auto 96px 96px; width: 620px;
           display: flex; flex-direction: column; justify-content: center; gap: 34px; }
  .brand { display: flex; align-items: center; gap: 18px; font-size: 40px; font-weight: 650; letter-spacing: -0.032em; }
  .brand svg { width: 56px; height: 56px; color: var(--cyan-bright); }
  .accent { color: var(--cyan-bright); }
  .rule { width: 132px; height: 3px; background: var(--cyan-bright); }
  h1 { font-size: 58px; line-height: 1.06; letter-spacing: -0.032em; font-weight: 650; max-width: 15ch; }
  p { font-size: 22px; line-height: 1.5; color: var(--on-field-muted); max-width: 30ch; }
</style>
<div class="glow"></div>
<div class="petal"></div>
<div class="plate">
  <div class="brand">${LOGO}<span>Smart<span class="accent">Agents</span></span></div>
  <div class="rule"></div>
  <h1>Digitale collega&rsquo;s die nooit slapen</h1>
  <p>Training, AI staffing en coaching, AI-native SDLC en businessprocessen.</p>
</div>`;

/** The square mark, for `Organization.logo`: the field, the mark, nothing else. */
const LOGOMARK = `<!doctype html><meta charset="utf-8">
<style>
  :root { ${TOKENS} }
  * { margin: 0; box-sizing: border-box; }
  body { width: 512px; height: 512px; background: var(--field); display: grid; place-items: center; }
  svg { width: 300px; height: 300px; color: var(--cyan-bright); }
</style>
${LOGO}`;

function shoot(html, file, width, height) {
  const work = mkdtempSync(path.join(tmpdir(), 'sa-social-'));
  const page = path.join(work, 'page.html');
  writeFileSync(page, html);

  // `timeout` and the `existsSync` below rather than an exit code: headless
  // Chrome writes the screenshot and then sometimes does not exit, which left
  // this script hanging with the file already on disk. The file is the result;
  // the process is only how it got there.
  const target = path.join(outDir, file);
  const result = spawnSync(chromeBin, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--virtual-time-budget=3000',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    `--screenshot=${target}`,
    `--user-data-dir=${work}/profile`,
    `file://${page}`
  ], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 45000, killSignal: 'SIGKILL' });

  rmSync(work, { recursive: true, force: true });
  if (!existsSync(target)) {
    console.error(String(result.stderr || result.error));
    process.exit(1);
  }
  console.log(`Wrote public/media/${file} (${width}x${height}).`);
}

shoot(CARD, 'og-default.png', 1200, 630);
shoot(LOGOMARK, 'smartagents-mark.png', 512, 512);
