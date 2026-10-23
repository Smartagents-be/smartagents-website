// Runs the real /secured/ Functions against the built `dist/` and checks who
// can open what.
//
// The gate is one rule per area and a client area is a password that opens a
// sub-tree and nothing else; a mistake in either direction is invisible on the
// page — the deck still renders for the person who should see it — and only
// shows when somebody else opens a URL they should not. So every case is
// asked, with each password, through the same handlers Pages runs. The deck
// pages' own files are followed too, because a client deck whose stylesheet or
// images stayed outside the area renders blank for the client and fine for us.
//
// Run after `npm run build`, like `check-contact.mjs`. Needs no network and no
// secrets: the passwords and the session secret are stand-ins, and
// `env.ASSETS` reads `dist/`.
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { onRequest as guard } from '../functions/secured/[[path]].js';
import { onRequest as login } from '../functions/secured/login.js';
import { onRequest as areaLogin } from '../functions/secured/[area]/login.js';
import { CLIENT_AREAS } from '../functions/secured/areas.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const ORIGIN = 'https://smartagents.be';

const env = {
  EXPORT_PASSWORD: 'ours',
  EXPORT_SESSION_SECRET: 'session-secret',
  ASSETS: {
    async fetch(request) {
      const pathname = decodeURIComponent(new URL(request.url).pathname);
      const file = path.join(distDir, pathname);
      const target = existsSync(file) && statSync(file).isDirectory() ? path.join(file, 'index.html') : file;
      return existsSync(target) ? new Response(readFileSync(target)) : new Response('Not found', { status: 404 });
    }
  }
};
const AREA_PASSWORD = {};
for (const area of CLIENT_AREAS) {
  AREA_PASSWORD[area.key] = `theirs-${area.key}`;
  env[area.password] = AREA_PASSWORD[area.key];
}

let failures = 0;
function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  ✓ ${name}`);
  } else {
    console.error(`  ✗ ${name}${detail ? `\n    ${detail}` : ''}`);
    failures++;
  }
}

/** The routing Pages derives from the file tree under functions/secured/. */
function route(request) {
  const { pathname } = new URL(request.url);
  if (pathname === '/secured/login') return login({ request, env });
  const area = pathname.match(/^\/secured\/([^/]+)\/login$/);
  if (area) return areaLogin({ request, env, params: { area: area[1] } });
  return guard({ request, env });
}

function get(pathname, cookie = '') {
  return route(new Request(`${ORIGIN}${pathname}`, { headers: cookie ? { Cookie: cookie } : {} }));
}

async function signIn(loginPath, password, redirect = '') {
  const body = new URLSearchParams({ password, redirect });
  const response = await route(new Request(`${ORIGIN}${loginPath}`, { method: 'POST', body }));
  const cookie = (response.headers.get('Set-Cookie') || '').split(';')[0];
  return { response, cookie, location: response.headers.get('Location') || '' };
}

const pathOf = (location) => new URL(location, ORIGIN).pathname;

async function opens(name, pathname, cookie) {
  const response = await get(pathname, cookie);
  check(name, response.status === 200, `${pathname} answered ${response.status} ${response.headers.get('Location') || ''}`);
}

async function refuses(name, pathname, cookie, loginPath) {
  const response = await get(pathname, cookie);
  const location = response.headers.get('Location') || '';
  check(
    name,
    response.status === 302 && pathOf(location) === loginPath,
    `${pathname} answered ${response.status} ${location}`
  );
}

/** Every same-site file a built page asks for, as absolute paths. */
function filesOf(pagePath) {
  const html = readFileSync(path.join(distDir, pagePath, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/\s(?:href|src)="([^"#][^"]*)"/g)].map((m) => m[1]);
  return [...new Set(refs.filter((ref) => !/^[a-z]+:/i.test(ref)).map((ref) => new URL(ref, `${ORIGIN}${pagePath}`).pathname))];
}

console.log('Secured area —');

// Nobody signed in.
await refuses('the overview asks for our login', '/secured/', '', '/secured/login');
for (const area of CLIENT_AREAS) {
  await refuses(`/secured/${area.key}/ asks for its own login`, `/secured/${area.key}/`, '', `/secured/${area.key}/login`);
}
await opens('the login stylesheets are open', '/secured/login.css', '');
await refuses('a path naming no area is not a login', '/secured/presentations/login', '', '/secured/login');

const ours = await signIn('/secured/login', 'ours');
check('our password signs in at our login', ours.cookie.startsWith('export_session='), ours.response.status);

for (const area of CLIENT_AREAS) {
  const root = `/secured/${area.key}/`;
  const loginPath = `${root}login`;
  const password = AREA_PASSWORD[area.key];

  const wrong = await signIn('/secured/login', password);
  check(`${area.key}'s password does not open our login`, !wrong.cookie && wrong.location.includes('error=1'));

  const theirs = await signIn(loginPath, password, '/secured/');
  check(`${area.key}'s password signs in at ${loginPath}`, theirs.cookie.startsWith(`export_session_${area.key}=`));
  check(`a redirect out of the area lands on ${root}`, pathOf(theirs.location) === root, theirs.location);

  const oursThere = await signIn(loginPath, 'ours');
  check(`our password signs in at ${loginPath} too`, oursThere.cookie.startsWith('export_session='));

  // What their session opens: their overview, every page it links, and every
  // file each of those pages loads.
  const pages = [root, ...filesOf(root).filter((ref) => ref.startsWith(root) && ref.endsWith('/'))];
  check(`${root} lists something`, pages.length > 1);
  const files = new Set(pages.flatMap((page) => [page, ...filesOf(page)]));
  const blocked = [];
  for (const file of files) {
    const response = await get(file, theirs.cookie);
    if (response.status !== 200) blocked.push(`${file} → ${response.status}`);
  }
  check(`their session opens all ${files.size} files of their area and its decks`, !blocked.length, blocked.join('\n    '));

  // What it does not: ours, and the rest of /secured/.
  await refuses(`their session does not open our overview`, '/secured/', theirs.cookie, '/secured/login');
  await refuses(`their session does not open another deck`, '/secured/presentations/pitch/', theirs.cookie, '/secured/login');
  const otherPdf = filesOf('/secured/').find((ref) => ref.endsWith('.pdf') && !ref.startsWith(root));
  if (otherPdf) await refuses(`their session does not open ${otherPdf}`, otherPdf, theirs.cookie, '/secured/login');

  // Their token in our cookie's name is not ours.
  const forged = `export_session=${theirs.cookie.split('=')[1]}`;
  await refuses('their token under our cookie name is refused', '/secured/', forged, '/secured/login');

  // Ours opens theirs.
  await opens(`our session opens ${root}`, root, ours.cookie);
  await opens(`our session opens their decks`, pages[1], ours.cookie);
}

// The old address of a client deck is moved, not lost.
for (const area of CLIENT_AREAS) {
  const deck = filesOf(`/secured/${area.key}/`).find((ref) => /\/presentations\/[^/]+\/$/.test(ref));
  if (!deck) continue;
  const slug = deck.split('/').at(-2);
  const response = await get(`/secured/presentations/${slug}/`);
  check(
    `/secured/presentations/${slug}/ moves to ${deck}`,
    response.status === 301 && pathOf(response.headers.get('Location')) === deck,
    `${response.status} ${response.headers.get('Location')}`
  );
}

if (failures) {
  console.error(`\nSecured area check failed: ${failures} problem(s).`);
  process.exit(1);
}
console.log('\nSecured area check passed.');
