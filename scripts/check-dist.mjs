// Gatekeeper for dist/. Fails the build on correctness problems and on any
// breach of the performance budgets in .claude/skills/fast-static-site/SKILL.md §1.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { brotliCompressSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');

const { languages, defaultLanguage } = await import('../build/lib/i18n.mjs');

/* ------------------------------------------------------------------ *
 * Budgets (fast-static-site §1)
 * ------------------------------------------------------------------ */

const BUDGETS = {
  htmlCompressedBytes: 30 * 1024,
  criticalJsCompressedBytes: 50 * 1024,
  renderBlockingRequests: 3,
  /* The inlined `<style>` block, paid for in every one of the site's 60
     documents. fast-static-site §2 asks for under 14 KB; this is the current
     size plus about 5% of headroom, so the next rule added to the critical
     sheet is a decision rather than a byte that appears in sixty files.
     Getting to 14 KB means per-layout critical CSS (improvements.md item 50). */
  criticalCssBytes: 17_600
};

const textExtensions = new Set(['.html', '.xml', '.txt', '.css', '.js']);
const sourceTextExtensions = new Set(['.css', '.js', '.mjs', '.html']);
const ignoredSourceDirs = new Set(['dist', 'node_modules', '.git', '.claude', '.idea']);

const failures = [];
function fail(file, label, sample) {
  failures.push({ file, label, sample });
}

/* ------------------------------------------------------------------ *
 * Collect
 * ------------------------------------------------------------------ */

function collect(dir, predicate, files = [], base = dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredSourceDirs.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collect(full, predicate, files, base);
      continue;
    }
    if (!predicate(full)) continue;
    files.push({
      fullPath: full,
      relativePath: path.relative(base, full).replace(/\\/g, '/'),
      content: readFileSync(full, 'utf8')
    });
  }
  return files;
}

const distFiles = collect(distDir, (file) => textExtensions.has(path.extname(file)));
const sourceFiles = collect(repoRoot, (file) => sourceTextExtensions.has(path.extname(file)));

const allDistPaths = new Set();
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else allDistPaths.add(path.relative(distDir, full).replace(/\\/g, '/'));
  }
})(distDir);

const htmlFiles = distFiles.filter((file) => file.relativePath.endsWith('.html'));

/** Public pages live under /{lang}/; everything else is the gated area or a fallback. */
const isSecured = (file) => file.startsWith('secured/');
// Two files at the root of dist/ are not pages: `index.html` is the
// no-redirect fallback, and `404.html` is the body Cloudflare serves with a
// real 404 status for a URL that matches nothing. Neither is crawled, neither
// carries hreflang, and both are noindex.
const isRootFallback = (file) => file === 'index.html' || file === '404.html';
const isPublicPage = (file) =>
  file.endsWith('.html') && !isSecured(file) && !isRootFallback(file);
const isNotFound = (file) => /(?:^|\/)404\/index\.html$/.test(file) || file === '404.html';

/* ------------------------------------------------------------------ *
 * 1. Nothing unresolved leaked into the output
 * ------------------------------------------------------------------ */

const leakChecks = [
  { label: 'unresolved undefined.* output', regex: /undefined\.[\w.-]+/ },
  { label: 'unprocessed template marker', regex: /\{\{[\s\S]{0,200}?\}\}|\{%[\s\S]{0,200}?%\}/ },
  { label: 'unreplaced build placeholder', regex: /__[A-Z][A-Z_]+__/ },
  { label: 'unexpanded chrome marker', regex: /<!--\s*chrome/ },
  { label: 'local or development URL in output', regex: /\b(?:https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])|file:\/\/)/i },
  { label: 'raw front matter block', regex: /(?:^|\n)---\s*\n(?:[\w-]+:\s*.*\n)+---\s*(?:\n|$)/ }
];

// Any i18n key appearing verbatim in the output means a translation was not applied.
const i18nKeys = new Set(
  languages.flatMap((language) =>
    Object.keys(JSON.parse(readFileSync(path.join(repoRoot, 'src/i18n', `${language.code}.json`), 'utf8')))
  )
);

for (const file of distFiles) {
  for (const check of leakChecks) {
    const match = file.content.match(check.regex);
    if (match) fail(file.relativePath, check.label, match[0].slice(0, 80));
  }

  if (!file.relativePath.endsWith('.html')) continue;
  for (const key of i18nKeys) {
    if (file.content.includes(`>${key}<`) || file.content.includes(`"${key}"`)) {
      fail(file.relativePath, 'untranslated i18n key in output', key);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 2. Links, images, CSS custom properties
 * ------------------------------------------------------------------ */

const cssTokenDefinitions = new Set(
  distFiles.flatMap((file) => [...file.content.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]))
);

/**
 * A custom property declared twice in one block keeps the last value, and the
 * declarations that wanted the first do not warn: they resolve to a value of the
 * wrong kind, the declaration is thrown away as invalid, and the property
 * inherits instead. `--text-body` was the ink of body copy at the top of `:root`
 * and 15.5px at the bottom, and seventeen blocks had been inheriting the page's
 * full ink since the ramp was written.
 *
 * So no name may be declared twice inside one `{ ... }`. Scoped redefinitions
 * are the point of custom properties and are untouched — this only looks inside
 * a single block, where a redefinition is always a mistake.
 *
 * Documents are read as well as stylesheets: `tokens.css` never ships as a file
 * of its own, so a stylesheet-only scan would miss the one file this exists for.
 */
for (const file of distFiles) {
  if (!file.relativePath.endsWith('.css') && !file.relativePath.endsWith('.html')) continue;

  for (const block of file.content.matchAll(/\{([^{}]*)\}/g)) {
    const seen = new Set();
    for (const declaration of block[1].matchAll(/(^|;)\s*(--[\w-]+)\s*:/g)) {
      const name = declaration[2];
      if (seen.has(name)) fail(file.relativePath, 'custom property declared twice in one block', name);
      seen.add(name);
    }
  }
}

/**
 * Every `oklch()` in the output has to be a colour sRGB can actually show.
 *
 * A colour outside the gamut is not an error and nothing warns: the browser
 * gamut-maps it and draws something near it. Three things make that worse than a
 * rounding difference. The mapping reduces chroma, so a colour asked to be
 * *brighter* than the medium allows comes back paler. It turns the hue as well,
 * because the channel that has gone negative is clamped and the other two are
 * not — the accent said hue 214 and the screen showed 218. And `color-mix()` and
 * the `/ alpha` form run on the *declared* coordinates and map the result along
 * a different path, so every wash derived from an out-of-gamut token drifts off
 * the token it came from.
 *
 * The ceiling is found per (lightness, hue) by bisection, with a tolerance well
 * inside a 1/255 step, so a value sitting deliberately on the gamut edge passes.
 * Comments are stripped first: the prose above several tokens quotes the
 * out-of-gamut value it replaced.
 */
const OKLAB_TO_LRGB = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701]
];

function oklchToLinearRgb(L, C, h) {
  const rad = (h * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return OKLAB_TO_LRGB.map((row) => row[0] * l + row[1] * m + row[2] * s);
}

const inGamut = (channels) => channels.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** The largest chroma this lightness and hue can carry in sRGB. */
function maxChroma(L, h) {
  let low = 0;
  let high = 0.45;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (inGamut(oklchToLinearRgb(L, mid, h))) low = mid;
    else high = mid;
  }
  return low;
}

for (const file of distFiles) {
  if (!file.relativePath.endsWith('.css') && !file.relativePath.endsWith('.html')) continue;

  const code = file.content.replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const match of code.matchAll(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/g)) {
    const [L, C, h] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (inGamut(oklchToLinearRgb(L, C, h))) continue;
    fail(
      file.relativePath,
      `oklch() outside sRGB (chroma ${C} against a ceiling of ${maxChroma(L, h).toFixed(4)} at this lightness and hue)`,
      match[0] + ')'
    );
  }
}

/**
 * Resolve one `href` or `src` to the path it would have inside `dist/`, or `null`
 * when it is not ours to check. Anything carrying a scheme belongs to somebody
 * else, so the test is for a scheme at all rather than a list of the ones seen
 * so far; a protocol-relative `//host/path` is external too.
 *
 * `directoriesAreIndexes` separates a link from an asset: a page is addressed by
 * its directory and served as the `index.html` inside it, while an asset is
 * addressed by its own name and a missing extension means a missing file.
 */
function resolveLocal(from, value, { directoriesAreIndexes = false } = {}) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) return null;

  const withoutQuery = value.split(/[?#]/)[0];
  if (!withoutQuery) return null;

  let target = withoutQuery.startsWith('/')
    ? withoutQuery.slice(1)
    : path.normalize(path.join(path.dirname(from), withoutQuery));

  if (directoriesAreIndexes) {
    if (target === '.' || target === '') target = 'index.html';
    else if (target.endsWith('/')) target += 'index.html';
    else if (!path.extname(target)) target = path.join(target, 'index.html');
  }

  return target.replace(/\\/g, '/');
}

for (const file of distFiles) {
  const { relativePath, content } = file;

  // Scripts set custom properties at runtime, so only stylesheets and documents
  // can be checked statically.
  if (relativePath.endsWith('.css') || relativePath.endsWith('.html')) {
    for (const reference of content.matchAll(/var\(--([\w-]+)(\s*,[^)]*)?\)/g)) {
      if (reference[2]) continue; // has a fallback
      if (cssTokenDefinitions.has(reference[1])) continue;
      fail(relativePath, 'undefined CSS custom property', `--${reference[1]}`);
    }
  }

  if (!relativePath.endsWith('.html')) continue;

  for (const match of content.matchAll(/href="([^"#{][^"]*)"/g)) {
    const target = resolveLocal(relativePath, match[1], { directoriesAreIndexes: true });
    if (target && !allDistPaths.has(target)) fail(relativePath, 'broken internal link', match[1]);
  }

  // The same walk over `src`. An `href` that goes nowhere is a click that does
  // nothing; a `src` that goes nowhere is a hole in the page, and on a slide it
  // is a hole in front of a room.
  //
  // `srcset` cannot match here and is left alone deliberately: it is a candidate
  // list the browser may skip, and the `src` beside it is the one that must
  // work. `<source src>` inside a `<video>` does match, and should.
  for (const match of content.matchAll(/\ssrc="([^"#{][^"]*)"/g)) {
    const target = resolveLocal(relativePath, match[1]);
    if (target && !allDistPaths.has(target)) fail(relativePath, 'broken asset reference', match[1]);
  }

  for (const match of content.matchAll(/<img\s[^>]*>/g)) {
    if (!match[0].includes('alt=')) fail(relativePath, 'missing alt attribute on image', match[0].slice(0, 80));
  }
}

/* ------------------------------------------------------------------ *
 * 2b. Cheap checks over the files already parsed
 * ------------------------------------------------------------------ */

/**
 * Every `clip-path: url(#id)` a page can reach has a `<clipPath id>` behind it.
 * A missing definition does not warn — the shape renders as its bounding box,
 * a navy rectangle where a drawn flank should be, at the one viewport width
 * that asks for it. The pairing of rule to trigger is read out of the CSS
 * rather than restated here, so a new rule finds the pages it breaks.
 */
const clipTriggers = [];
for (const file of distFiles) {
  if (!file.relativePath.endsWith('.css') && !file.relativePath.endsWith('.html')) continue;
  const css = file.relativePath.endsWith('.html')
    ? (file.content.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '')
    : file.content;

  for (const rule of css.matchAll(/([^{}]+)\{[^{}]*clip-path:\s*url\(#([\w-]+)\)/g)) {
    const id = rule[2];
    for (const selector of rule[1].split(',')) {
      // The minifier drops the quotes inside an attribute selector, so both
      // `[data-clip=heroArch]` and `[data-clip="heroArch"]` have to match.
      const attribute = selector.match(/\[data-clip=["']?([\w-]+)["']?\]/);
      if (attribute) {
        clipTriggers.push({ id, needle: `data-clip="${attribute[1]}"` });
        continue;
      }
      const className = [...selector.matchAll(/\.([\w-]+)/g)].at(-1);
      if (className) clipTriggers.push({ id, needle: `class="${className[1]}` });
    }
  }
}

for (const { relativePath, content } of htmlFiles) {
  const defined = new Set([...content.matchAll(/<clipPath id="([\w-]+)"/g)].map((m) => m[1]));
  // One report per missing shape: five selectors sharing a rule are one bug.
  const reported = new Set();

  for (const { id, needle } of clipTriggers) {
    if (defined.has(id) || reported.has(id)) continue;
    // A class can stand anywhere in `class="a b"`, so match the whole attribute.
    const present = needle.startsWith('class="')
      ? new RegExp(`class="[^"]*\\b${needle.slice(7)}\\b`).test(content)
      : content.includes(needle);
    if (present) {
      reported.add(id);
      fail(relativePath, 'clip-path points at an undefined clipPath', `#${id}`);
    }
  }
}

/**
 * One `<h1>` per page, and no skipped heading level. A skipped level is
 * invisible on the page and only bites the reader navigating by headings.
 */
for (const { relativePath, content } of htmlFiles) {
  if (!isPublicPage(relativePath)) continue;

  const levels = [...content.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1s = levels.filter((level) => level === 1).length;
  if (h1s !== 1) fail(relativePath, 'a page has exactly one <h1>', `found ${h1s}`);

  let previous = 0;
  for (const level of levels) {
    if (previous && level > previous + 1) {
      fail(relativePath, 'heading level skipped', `h${previous} then h${level}`);
      break;
    }
    previous = level;
  }
}

/**
 * Anything the page points at by id is on the page: `aria-labelledby`,
 * `aria-describedby`, `aria-controls`, and every in-page `href="#..."`. A
 * reference to a missing id fails silently and only for a screen reader.
 */
for (const { relativePath, content } of htmlFiles) {
  const ids = new Set([...content.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  for (const match of content.matchAll(/\saria-(?:labelledby|describedby|controls)="([^"]+)"/g)) {
    for (const target of match[1].trim().split(/\s+/)) {
      if (!ids.has(target)) fail(relativePath, 'aria reference to a missing id', target);
    }
  }

  for (const match of content.matchAll(/href="#([^"]+)"/g)) {
    const target = decodeURIComponent(match[1]);
    if (!ids.has(target)) fail(relativePath, 'in-page link to a missing id', `#${target}`);
  }
}

/**
 * The JSON-LD graph parses, and the share card it sits beside resolves. The
 * graph is built out of `t()` values, so an unescaped character in a string
 * file is a graph the crawler throws away with nothing on the page to show it.
 */
const siteOrigin = (htmlFiles[0]?.content.match(/<link rel="canonical" href="(https?:\/\/[^/"]+)/) || [])[1] || '';

function resolveAbsolute(from, value) {
  const local = siteOrigin && value.startsWith(siteOrigin) ? value.slice(siteOrigin.length) : value;
  return resolveLocal(from, local);
}

for (const { relativePath, content } of htmlFiles) {
  for (const block of content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      fail(relativePath, 'JSON-LD does not parse', error.message.slice(0, 80));
    }
  }

  if (!isPublicPage(relativePath)) continue;

  const ogImage = content.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (!ogImage) fail(relativePath, 'missing og:image', '<meta property="og:image">');
  else {
    const target = resolveAbsolute(relativePath, ogImage);
    if (target && !allDistPaths.has(target)) fail(relativePath, 'og:image does not resolve', ogImage);
  }

  // A preload's candidate list is a real fetch, unlike a `srcset` the browser
  // may skip: a wrong name costs the LCP image its head start, silently.
  for (const match of content.matchAll(/\simagesrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const href = candidate.trim().split(/\s+/)[0];
      if (!href) continue;
      const target = resolveLocal(relativePath, href);
      if (target && !allDistPaths.has(target)) fail(relativePath, 'imagesrcset candidate missing', href);
    }
  }
}

/** Every URL in the sitemap is a page that exists. */
const sitemap = distFiles.find((file) => file.relativePath === 'sitemap.xml');
if (sitemap) {
  for (const match of sitemap.content.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const target = resolveAbsolute('sitemap.xml', match[1].trim());
    const page = target && !path.extname(target) ? path.join(target, 'index.html') : target;
    const resolved = target?.endsWith('/') ? `${target}index.html` : page;
    if (resolved && !allDistPaths.has(resolved)) {
      fail('sitemap.xml', 'sitemap URL does not resolve in dist/', match[1].trim());
    }
  }
}

/* ------------------------------------------------------------------ *
 * 3. Per-page metadata and i18n contract (static-i18n §2)
 * ------------------------------------------------------------------ */

for (const { relativePath, content } of htmlFiles) {
  const title = content.match(/<title>\s*([^<]*?)\s*<\/title>/i);
  if (!title || !title[1]) fail(relativePath, 'empty or missing <title>', '<title>');

  const robots = content.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  const expectedRobots =
    isSecured(relativePath) || isRootFallback(relativePath) || isNotFound(relativePath)
      ? 'noindex, follow'
      : 'index, follow';

  if (!robots) fail(relativePath, 'missing robots meta tag', '<meta name="robots">');
  else if (robots[1].trim() !== expectedRobots) {
    fail(relativePath, `unexpected robots meta, expected "${expectedRobots}"`, robots[1]);
  }

  if (!isPublicPage(relativePath)) continue;

  const description = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!description || !description[1].trim()) {
    fail(relativePath, 'empty or missing meta description', '<meta name="description">');
  }

  const langAttr = content.match(/<html\s+lang="([^"]+)"\s+dir="([^"]+)"/i);
  if (!langAttr) fail(relativePath, 'missing lang and dir on <html>', '<html>');

  if (!/<link rel="canonical" href="[^"]+"/.test(content)) {
    fail(relativePath, 'missing canonical link', '<link rel="canonical">');
  }

  // hreflang must list every language plus x-default.
  const hreflangs = new Set([...content.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]));
  for (const language of languages) {
    if (!hreflangs.has(language.code)) {
      fail(relativePath, 'missing hreflang alternate', language.code);
    }
  }
  if (!hreflangs.has('x-default')) fail(relativePath, 'missing hreflang x-default', 'x-default');
}

/* ------------------------------------------------------------------ *
 * 4. Performance budgets (public pages only; /secured/ is internal)
 * ------------------------------------------------------------------ */

/* Every public page's brotli size, measured once. Measured twice — here against
   the budget and again at the foot of the file — quality 11 over 60 pages was
   3.5 s of this script's 3.8 s runtime for a number that cannot have changed. */
const compressedBytes = new Map();

for (const { relativePath, content, fullPath } of htmlFiles) {
  if (!isPublicPage(relativePath)) continue;

  const compressed = brotliCompressSync(readFileSync(fullPath)).length;
  compressedBytes.set(relativePath, compressed);
  if (compressed > BUDGETS.htmlCompressedBytes) {
    fail(relativePath, `HTML over budget (${BUDGETS.htmlCompressedBytes} B brotli)`, `${compressed} B`);
  }

  const head = content.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';

  const blockingScripts = [...head.matchAll(/<script\b([^>]*)>/g)].filter((match) => {
    const attrs = match[1];
    if (!/\ssrc=/.test(attrs)) return false;
    return !/\b(?:defer|async)\b/.test(attrs) && !/type="module"/.test(attrs);
  });
  for (const script of blockingScripts) {
    fail(relativePath, 'render-blocking classic script in head', script[0].slice(0, 80));
  }

  const blockingStyles = [...head.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].filter(
    (match) => !/media="print"/.test(match[0])
  );
  if (blockingStyles.length > BUDGETS.renderBlockingRequests) {
    fail(
      relativePath,
      `more than ${BUDGETS.renderBlockingRequests} render-blocking stylesheets`,
      String(blockingStyles.length)
    );
  }

  const critical = head.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  if (!critical) {
    fail(relativePath, 'no inline critical CSS in head', '<style>');
  } else if (Buffer.byteLength(critical) > BUDGETS.criticalCssBytes) {
    fail(
      relativePath,
      `inline critical CSS over budget (${BUDGETS.criticalCssBytes} B)`,
      `${Buffer.byteLength(critical)} B`
    );
  }
}

// Critical JS budget: the entry chunk plus anything it statically pulls in.
const entryJs = [...allDistPaths].filter((file) => /^assets\/app\.[^/]+\.js$/.test(file));
for (const file of entryJs) {
  const compressed = brotliCompressSync(readFileSync(path.join(distDir, file))).length;
  if (compressed > BUDGETS.criticalJsCompressedBytes) {
    fail(file, `entry JS over budget (${BUDGETS.criticalJsCompressedBytes} B brotli)`, `${compressed} B`);
  }
}

/* ------------------------------------------------------------------ *
 * 5. Required output files
 * ------------------------------------------------------------------ */

const required = [
  'index.html',
  '404.html',
  'sitemap.xml',
  'robots.txt',
  'llms.txt',
  'sw.js',
  '_headers',
  '_redirects',
  'favicon.svg'
];
for (const file of required) {
  if (!allDistPaths.has(file)) fail(file, 'required output file missing', file);
}

for (const language of languages) {
  for (const file of [`${language.code}/index.html`, `${language.code}/404/index.html`]) {
    if (!allDistPaths.has(file)) fail(file, 'missing language output', language.code);
  }
}

if (!allDistPaths.has(`${defaultLanguage.code}/index.html`)) {
  fail('index.html', 'default language home missing', defaultLanguage.code);
}

/* ------------------------------------------------------------------ *
 * 5b. The routing table: nothing may hide behind the catch-all
 * ------------------------------------------------------------------ */

// _redirects ends with a catch-all that sends an unprefixed URL to the default
// language. It is followed whether or not an asset matches, so every top-level
// entry in dist/ needs a rule of its own above it or it stops being reachable.
const redirectRules = readFileSync(path.join(distDir, '_redirects'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.startsWith('/'))
  .map((line) => line.split(/\s+/)[0]);

if (redirectRules.at(-1) !== '/*') {
  fail('_redirects', 'the catch-all is not the last rule', redirectRules.at(-1) ?? 'no rules');
}

const covered = new Set(redirectRules.slice(0, -1));
for (const entry of readdirSync(distDir, { withFileTypes: true })) {
  if (entry.name.startsWith('.') || entry.name === '_redirects' || entry.name === '_headers') continue;
  // A directory needs two rules: the splat for everything inside it, and the
  // bare name, which the splat does not match and the catch-all would take.
  const rules = entry.isDirectory()
    ? [`/${entry.name}/*`, `/${entry.name}`]
    : [`/${entry.name}`];
  for (const rule of rules) {
    if (!covered.has(rule)) {
      fail('_redirects', 'unreachable behind the catch-all', rule);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 6. Source hygiene: no stale token lookups
 * ------------------------------------------------------------------ */

const sourceTokenDefinitions = new Set(
  sourceFiles.flatMap((file) => [...file.content.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]))
);

for (const file of sourceFiles) {
  if (!/\b(?:readTokenValue|readNumberToken|getPropertyValue)\s*\(/.test(file.content)) continue;
  for (const match of file.content.matchAll(
    /\b(?:readTokenValue|readNumberToken|getPropertyValue)\s*\(\s*['"`](--[\w-]+)['"`]/g
  )) {
    const token = match[1].slice(2);
    if (sourceTokenDefinitions.has(token)) continue;
    fail(file.relativePath, 'undefined CSS custom property in source script', match[1]);
  }
}

/* ------------------------------------------------------------------ *
 * 7. No build secret is in the output
 *
 * The safety argument for reading Odoo with an API key at build time is that the
 * key stays on the build machine and only the job text ships. This is that
 * argument enforced rather than asserted.
 *
 * Every file in `dist/` is checked, not only HTML. Short values are skipped: a
 * two-character "key" would match everywhere, and a key that short is a
 * misconfiguration to fix in Odoo. The failure prints the variable's name and
 * never its value.
 * ------------------------------------------------------------------ */

/* Only values that are secret. `ODOO_LOGIN` is deliberately not here: it is a
   username, and it is very likely to be an address the footer prints on every
   page of the site — scanning for it would fail the production build on a
   perfect match that is not a leak at all. */
const SECRET_ENV = ['ODOO_API_KEY', 'N8N_SHARED_SECRET', 'EXPORT_PASSWORD', 'EXPORT_SESSION_SECRET'];

for (const name of SECRET_ENV) {
  const value = process.env[name];
  if (!value || value.length < 8) continue;
  for (const file of distFiles) {
    if (!file.content.includes(value)) continue;
    fail(file.relativePath, 'a build secret was written into the output', `$${name}`);
  }
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

if (failures.length > 0) {
  console.error('Build sanity check failed.');
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.label} (${failure.sample})`);
  }
  process.exit(1);
}

const largest = Math.max(...compressedBytes.values());
console.log(
  `Build sanity check passed. ${htmlFiles.length} pages, ` +
    `largest public page ${largest} B brotli (budget ${BUDGETS.htmlCompressedBytes} B).`
);
