// A git repository served as plain files, so `git clone https://…/x.git` works
// against a host with no backend.
//
// Git speaks two protocols over HTTP. The smart one needs a program on the
// server; the dumb one needs nothing but files at known paths — `HEAD`,
// `info/refs`, `objects/info/packs` and the packs themselves — and every git
// client still falls back to it when `info/refs?service=git-upload-pack` comes
// back without the smart content type, which a static host always does. So a
// bare repository with `git update-server-info` run over it is a clone URL, and
// Cloudflare Pages ignores the query string and serves the file.
//
// The source is a git bundle committed under `src/content/downloads/`: one
// binary file, all history and branches, and nothing a nested `.git` directory
// would do to this repository's own index. The build turns it into two things —
// the bare repository at `/<slug>.git/` and a zip of a clone of it at
// `/downloads/<slug>.zip` — so the two can never be two versions of the code, and
// unzipping gives the same folder, `.git` included, as cloning.
//
// The page links both unconditionally, so a missing bundle leaves a broken
// `/downloads/<slug>.zip` link and `check-dist.mjs` fails the build on it. That is
// the guard: a clone URL that answers 404 never ships. A bundle that is there
// and fails to unpack fails the build too.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { absolute } from './i18n.mjs';
import { writeZip } from './zip.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Every repository the site serves. `slug` is the URL: `/<slug>.git/` and `/downloads/<slug>.zip`.
 * `folder` is the one folder the zip unpacks to, the name the page's clone command gives too.
 */
export const GIT_DOWNLOADS = {
  'kata-ravago': { bundle: 'src/content/downloads/kata-ravago.bundle', folder: 'kata' }
};

export const cloneUrlPath = (slug) => `/${slug}.git`;
export const zipPath = (slug) => `/downloads/${slug}.zip`;


function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.error) throw new Error(`git ${args[0]} failed to start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}\n${result.stderr.trim()}`);
  return result.stdout.trim();
}

/**
 * Unpack every bundle that is present into `dist/`. Returns the slugs written.
 *
 * `--template=` makes a bare repository with no sample hooks, no `description`
 * and no `info/exclude`: nothing a reader cloning it needs, and the sample hooks
 * are a dozen files of shell script on a public URL. There is no `origin`
 * either — fetching into a fresh repository rather than cloning the bundle
 * keeps the build machine's path out of the shipped `config`.
 */
export function writeGitDownloads(distDir) {
  const written = [];

  for (const [slug, { bundle, folder }] of Object.entries(GIT_DOWNLOADS)) {
    const source = path.join(rootDir, bundle);
    if (!existsSync(source)) continue;

    const repo = path.join(distDir, `${slug}.git`);
    rmSync(repo, { recursive: true, force: true });
    mkdirSync(repo, { recursive: true });

    git(['init', '--bare', '--quiet', '--template=', repo]);
    git(['fetch', '--quiet', source, '+refs/heads/*:refs/heads/*', '+refs/tags/*:refs/tags/*'], repo);

    // HEAD decides what a clone checks out. A bundle records HEAD as a commit,
    // not as the branch it pointed at, so the branch is the one at that commit,
    // `main` first when several are.
    const refs = git(['bundle', 'list-heads', source], repo)
      .split('\n')
      .map((line) => line.split(' '))
      .filter(([, name]) => name);
    const headSha = refs.find(([, name]) => name === 'HEAD')?.[0];
    const branches = refs.filter(([, name]) => name.startsWith('refs/heads/'));
    const atHead = branches.filter(([sha]) => !headSha || sha === headSha).map(([, name]) => name);
    const branch = ['refs/heads/main', 'refs/heads/master'].find((name) => atHead.includes(name))
      ?? atHead[0]
      ?? branches[0]?.[1];
    if (!branch) throw new Error(`${bundle} has no branches`);
    git(['symbolic-ref', 'HEAD', branch], repo);

    // One pack, packed refs, then the two index files the dumb protocol reads.
    git(['repack', '-a', '-d', '-q'], repo);
    git(['pack-refs', '--all'], repo);
    git(['update-server-info'], repo);
    // FETCH_HEAD names the bundle by its path on the build machine.
    for (const leftover of ['logs', 'FETCH_HEAD']) rmSync(path.join(repo, leftover), { recursive: true, force: true });

    // An empty alternates list, in both of the forms git asks for. Git requests
    // them with curl's fail-on-error, and on HTTP/2 the libcurl macOS ships
    // (8.7) answers a 404 there by breaking the shared connection
    // (`nghttp2_session_mem_recv() returned -902`): the next request, for the
    // pack list, hung, or the clone failed with "Unable to find <sha>". Empty
    // is the valid answer for "no alternates", and a 200 leaves curl nothing to
    // fail on. The 404 git gets for the loose commit it probes first does not
    // go through that path and is harmless.
    for (const list of ['alternates', 'http-alternates']) {
      writeFileSync(path.join(repo, 'objects/info', list), '');
    }

    const zip = path.join(distDir, zipPath(slug).slice(1));
    mkdirSync(path.dirname(zip), { recursive: true });
    writeCloneZip(repo, slug, folder, branch.replace('refs/heads/', ''), zip);

    written.push(slug);
  }

  return written;
}

/**
 * The zip is a clone, `.git` included, not `git archive` of the tree: the
 * course runs git in the student's folder (a hook finds the repository by its
 * `.git`, the dev container mounts it, the undo steps are `git restore`), so a
 * folder without one breaks it.
 *
 * `--no-local` clones the way a reader does, over git's own transport: one
 * fresh pack, not hard links to the served one with its bitmap. `--template=`
 * leaves out the sample hooks, as for the served repository. What is left that
 * a clone from the URL would not have is rewritten:
 *
 * - `config` points `origin` at the clone URL rather than at `dist/`, and says
 *   nothing about the build machine's file system. `filemode` is false because
 *   Windows keeps no executable bit: with true, git there would report the
 *   one executable file in the kata as changed.
 * - `logs/` goes: its first line names the path the clone came from.
 * - `index` is read anew from HEAD, see below.
 */
function writeCloneZip(repo, slug, folder, branch, zip) {
  const work = mkdtempSync(path.join(tmpdir(), `${slug}-zip-`));
  try {
    const clone = path.join(work, folder);
    git(['clone', '--quiet', '--no-local', '--template=', repo, clone]);
    writeFileSync(path.join(clone, '.git', 'config'), [
      '[core]',
      '\trepositoryformatversion = 0',
      '\tfilemode = false',
      '\tbare = false',
      '\tlogallrefupdates = true',
      '[remote "origin"]',
      `\turl = ${absolute(cloneUrlPath(slug))}`,
      '\tfetch = +refs/heads/*:refs/remotes/origin/*',
      `[branch "${branch}"]`,
      '\tremote = origin',
      `\tmerge = refs/heads/${branch}`,
      ''
    ].join('\n'));
    rmSync(path.join(clone, '.git', 'logs'), { recursive: true, force: true });

    if (git(['status', '--porcelain'], clone) !== '') throw new Error(`${slug}: the clone for the zip is not clean`);
    // The index a clone writes holds each file's inode and times on this
    // machine, which make every build's zip different and mean nothing after an
    // unzip. Read from HEAD it holds none, and git refreshes it on first use.
    git(['read-tree', 'HEAD'], clone);
    const committed = new Date(Number(git(['log', '-1', '--format=%ct'], clone)) * 1000);
    writeZip(clone, folder, zip, committed);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
