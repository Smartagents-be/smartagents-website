// Where the decks come from: this repo, and the repositories a client's decks
// are authored in.
//
// Most decks live in `src/content/secured/presentations/`. A client whose decks
// are written by someone other than the site's maintainers has a repository of
// its own: today `Smartagents-be/isabel-presentations`, which is private, so
// its decks stay out of this public repo. Every deck in it lands in the
// client's area under `/secured/<area>/`, behind the client's own password.
//
// A source is found in this order, first match wins:
//
//   1. `<ENV>_DIR`, an explicit checkout. The client repo's own CI sets it, so
//      a push there is built against the real site before it is deployed.
//   2. The sibling checkout, `../<repo name>`, which is how it is worked on.
//   3. `.external/<repo name>`, fetched by `scripts/fetch-decks.mjs` from
//      GitHub with `<ENV>_TOKEN`. That is how Cloudflare Pages gets it.
//
// No source at all is a warning here and a failure on Pages: a production
// build that quietly dropped a client's decks would publish an empty area, and
// a failed build keeps the previous deployment live instead.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const LOCAL_DECKS_DIR = path.join(rootDir, 'src/content/secured/presentations');
export const EXTERNAL_DIR = path.join(rootDir, '.external');

/**
 * `area` is a key in `CLIENT_AREAS`; the build fails on a deck in the repo
 * whose slug that area does not claim, so the guard and the build agree on
 * which password opens it. `decks` is the folder inside the repo.
 */
export const EXTERNAL_SOURCES = [
  {
    key: 'isabel',
    repo: 'Smartagents-be/isabel-presentations',
    env: 'ISABEL_PRESENTATIONS',
    area: 'isabel',
    decks: 'decks'
  }
];

export function repoName(source) {
  return source.repo.split('/')[1];
}

/** The checkout a source resolves to, or null; see the order above. */
export function sourceRoot(source) {
  const explicit = process.env[`${source.env}_DIR`];
  if (explicit) return path.resolve(explicit);
  const sibling = path.resolve(rootDir, '..', repoName(source));
  if (existsSync(path.join(sibling, source.decks))) return sibling;
  const fetched = path.join(EXTERNAL_DIR, repoName(source));
  if (existsSync(path.join(fetched, source.decks))) return fetched;
  return null;
}

/**
 * Every folder that holds decks, this repo's first. An external source that
 * resolved nowhere is returned with `dir: null`, so a caller can say so.
 */
export function deckSources() {
  return [
    { key: 'local', dir: LOCAL_DECKS_DIR, area: null, fetched: false },
    ...EXTERNAL_SOURCES.map((source) => {
      const root = sourceRoot(source);
      return {
        key: source.key,
        repo: source.repo,
        dir: root ? path.join(root, source.decks) : null,
        area: source.area,
        fetched: Boolean(root && root.startsWith(EXTERNAL_DIR))
      };
    })
  ];
}
