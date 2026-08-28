// Resolve hashed asset URLs through the Vite manifest, so every reference stays
// correct and every asset can be served immutable.
// See .claude/skills/fast-static-site/SKILL.md §6.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function loadManifest(distDir) {
  const file = path.join(distDir, '.vite', 'manifest.json');
  if (!existsSync(file)) {
    throw new Error(`Vite manifest not found at ${file}. Run "vite build" before rendering.`);
  }
  const manifest = JSON.parse(readFileSync(file, 'utf8'));

  const entry = Object.values(manifest).find((chunk) => chunk.isEntry);
  if (!entry) throw new Error('No entry chunk in the Vite manifest.');

  const js = `/${entry.file}`;
  const css = (entry.css || []).map((href) => `/${href}`);

  // Everything the service worker should precache: the shell.
  const precache = [js, ...css];

  return { manifest, js, css, precache };
}
