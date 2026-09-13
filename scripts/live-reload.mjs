// Development-only live reload: watch the sources, rebuild, tell the browser.
// The site is pre-rendered, so there is no module graph to patch: a full
// rebuild takes under a second and the page simply reloads (scroll position
// preserved). Nothing here is ever part of `npm run build`.
import { spawn } from 'node:child_process';
import { statSync, watch } from 'node:fs';
import path from 'node:path';

const EVENTS_PATH = '/__dev/events';

/** Directories and files whose contents feed the build. */
const WATCH_TARGETS = ['src', 'build', 'public', 'vite.config.js'];

/** Editor noise that must never trigger a rebuild. */
const IGNORED = /(^|[\\/])(\.DS_Store|\.git|node_modules)([\\/]|$)|[~]$|\.sw[po]$/;

/**
 * Injected into every HTML response while watching. Subscribes to the SSE
 * stream, reloads on `reload`, and shows a banner on `error` so a failed
 * render is visible in the browser and not only in the terminal.
 */
const CLIENT_SCRIPT = `<script data-dev-live-reload>
(() => {
  const SCROLL_KEY = 'sa:dev:scroll';

  // The service worker caches pages; in dev that would serve stale HTML.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
  }
  if (window.caches) caches.keys().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});

  const saved = sessionStorage.getItem(SCROLL_KEY);
  if (saved !== null) {
    sessionStorage.removeItem(SCROLL_KEY);
    history.scrollRestoration = 'manual';
    addEventListener('load', () => requestAnimationFrame(() => scrollTo(0, Number(saved))));
  }

  const banner = (text) => {
    let element = document.getElementById('dev-build-error');
    if (!text) { element?.remove(); return; }
    if (!element) {
      element = document.createElement('pre');
      element.id = 'dev-build-error';
      element.style.cssText = 'position:fixed;inset:auto 0 0 0;z-index:2147483647;margin:0;padding:1rem 1.25rem;'
        + 'max-height:50vh;overflow:auto;background:#1b0f12;color:#ffb4b4;font:12px/1.5 ui-monospace,monospace;'
        + 'white-space:pre-wrap;border-top:2px solid #ff5c5c';
      document.body.append(element);
    }
    element.textContent = text;
  };

  const source = new EventSource(${JSON.stringify(EVENTS_PATH)});
  source.addEventListener('reload', () => {
    sessionStorage.setItem(SCROLL_KEY, String(scrollY));
    location.reload();
  });
  source.addEventListener('error-report', (event) => banner(JSON.parse(event.data).message));
})();
</script>`;

/**
 * @param {{ repoRoot: string }} options
 * @returns {{ handle(req, res): boolean, inject(html: string): string, start(): void }}
 */
export function createLiveReload({ repoRoot }) {
  const clients = new Set();
  const viteBin = path.resolve(repoRoot, 'node_modules', '.bin', 'vite');

  let building = false;
  let pending = false;
  let buildStartedAt = 0;

  function broadcast(event, data) {
    const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) client.write(frame);
  }

  function run(command, args) {
    return new Promise((resolve) => {
      const child = spawn(command, args, { cwd: repoRoot, env: process.env });
      let output = '';
      child.stdout.on('data', (chunk) => { output += chunk; });
      child.stderr.on('data', (chunk) => { output += chunk; });
      child.on('error', (error) => resolve({ ok: false, output: `${output}${error.message}` }));
      child.on('close', (code) => resolve({ ok: code === 0, output }));
    });
  }

  async function rebuild() {
    building = true;
    const startedAt = Date.now();
    buildStartedAt = startedAt;

    // Same pipeline as scripts/build-site.mjs, except check-dist only reports:
    // a budget or link failure should not stop you from looking at the page.
    const vite = await run(viteBin, ['build', '--logLevel', 'warn']);
    const render = vite.ok ? await run(process.execPath, ['build/render.mjs']) : vite;

    if (!render.ok) {
      const message = (render.output || 'Build failed').trim();
      console.error(`\n✗ build failed\n${message}\n`);
      broadcast('error-report', { message });
    } else {
      const check = await run(process.execPath, ['scripts/check-dist.mjs']);
      if (!check.ok) console.warn(`\n! check-dist\n${check.output.trim()}\n`);
      console.log(`↻ rebuilt in ${Date.now() - startedAt}ms`);
      broadcast('reload', { at: startedAt });
    }

    building = false;
    if (pending) {
      pending = false;
      rebuild();
    }
  }

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (building) pending = true;
      else rebuild();
    }, 80);
  }

  /**
   * True when the event reflects an edit the last build has not seen yet.
   * macOS reports metadata-only events (vite reading vite.config.js during a
   * build, for one), which would otherwise make every build trigger the next.
   */
  function isRealChange(fullPath) {
    try {
      return statSync(fullPath).mtimeMs > buildStartedAt;
    } catch {
      return true; // Deleted or renamed: that is a change worth rebuilding for.
    }
  }

  function start() {
    for (const target of WATCH_TARGETS) {
      const base = path.resolve(repoRoot, target);
      try {
        // For a watched file, `filename` repeats the file itself, not a child.
        const isDirectory = statSync(base).isDirectory();
        watch(base, { recursive: true }, (_event, filename) => {
          if (filename && IGNORED.test(filename)) return;
          if (!isRealChange(isDirectory && filename ? path.resolve(base, filename) : base)) return;
          schedule();
        });
      } catch (error) {
        console.warn(`Not watching ${target}: ${error.message}`);
      }
    }
    console.log(`Watching ${WATCH_TARGETS.join(', ')} — saving a file rebuilds and reloads the page.`);
  }

  /** Returns true when the request was the SSE stream and is now owned by us. */
  function handle(req, res) {
    if (req.url !== EVENTS_PATH) return false;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive'
    });
    res.write('retry: 500\n\n');
    clients.add(res);

    const heartbeat = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => {
      clearInterval(heartbeat);
      clients.delete(res);
    });
    return true;
  }

  const inject = (html) => (html.includes('</body>')
    ? html.replace('</body>', `${CLIENT_SCRIPT}</body>`)
    : html + CLIENT_SCRIPT);

  return { handle, inject, start };
}
