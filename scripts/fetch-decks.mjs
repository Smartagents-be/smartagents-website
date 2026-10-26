// Fetch the client deck repositories the build cannot find on disk.
//
// The first step of `npm run build`. For each source in
// `build/lib/deck-sources.mjs`: an explicit `<ENV>_DIR` or a sibling checkout
// wins and nothing is fetched; otherwise, with `<ENV>_TOKEN` set, the repo's
// tarball at `<ENV>_REF` (default `main`) is unpacked into `.external/`. That
// is the Cloudflare Pages path: the token is a build variable marked secret, a
// fine-grained GitHub token with read-only Contents on that one repository.
//
// A fetch that fails, or no source at all on Pages, fails the build. Locally a
// missing source is a warning and the area is built empty.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { EXTERNAL_DIR, EXTERNAL_SOURCES, repoName, sourceRoot } from '../build/lib/deck-sources.mjs';

const onPages = process.env.CF_PAGES === '1';
let failed = false;

async function github(url, token, accept) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'smartagents-website-build'
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response;
}

for (const source of EXTERNAL_SOURCES) {
  const target = path.join(EXTERNAL_DIR, repoName(source));
  const token = process.env[`${source.env}_TOKEN`];
  const ref = process.env[`${source.env}_REF`] || 'main';

  // Whatever an earlier build fetched is stale by definition: either this
  // build fetches it again or it reads a checkout that wins over it.
  rmSync(target, { recursive: true, force: true });

  const onDisk = sourceRoot(source);
  if (onDisk) {
    if (!existsSync(path.join(onDisk, source.decks))) {
      console.error(`Decks · ${source.repo}: ${source.env}_DIR is ${onDisk}, which has no ${source.decks}/ folder`);
      failed = true;
      continue;
    }
    console.log(`Decks · ${source.repo}: reading ${onDisk}`);
    continue;
  }

  if (!token) {
    const message = `Decks · ${source.repo}: no checkout and no ${source.env}_TOKEN, so the ${source.area} area is built without its decks.`;
    if (onPages) {
      console.error(`${message}\nSet ${source.env}_TOKEN as a Pages build variable.`);
      failed = true;
    } else {
      console.warn(message);
    }
    continue;
  }

  try {
    const api = `https://api.github.com/repos/${source.repo}`;
    const sha = (await (await github(`${api}/commits/${ref}`, token, 'application/vnd.github.sha')).text()).trim();
    const tarball = Buffer.from(await (await github(`${api}/tarball/${sha}`, token, 'application/vnd.github+json')).arrayBuffer());

    mkdirSync(target, { recursive: true });
    const archive = path.join(EXTERNAL_DIR, `${repoName(source)}.tar.gz`);
    writeFileSync(archive, tarball);
    const tar = spawnSync('tar', ['-xzf', archive, '-C', target, '--strip-components=1'], { stdio: 'inherit' });
    rmSync(archive, { force: true });
    if (tar.status !== 0) throw new Error(`tar exited ${tar.status ?? tar.error?.message}`);

    console.log(`Decks · ${source.repo}@${sha.slice(0, 7)} (${ref}) fetched`);
  } catch (error) {
    // The message names the URL and the status, never the token.
    console.error(`Decks · ${source.repo}: fetch failed: ${error.message}`);
    failed = true;
  }
}

if (failed) process.exit(1);
