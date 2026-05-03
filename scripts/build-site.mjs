import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const eleventyBin = path.resolve(repoRoot, 'node_modules', '.bin', 'eleventy');

function resolveSecuredAccessMode() {
  if (process.argv.includes('--static')) {
    return 'static';
  }

  if (process.argv.includes('--cloudflare')) {
    return 'cloudflare';
  }

  return process.env.SECURED_ACCESS_MODE || 'cloudflare';
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function pruneStaticSecuredOutput() {
  const sourceSecuredDir = path.resolve(repoRoot, 'secured');
  const distSecuredDir = path.resolve(repoRoot, 'dist', 'secured');

  if (!existsSync(sourceSecuredDir) || !existsSync(distSecuredDir)) {
    return;
  }

  for (const entry of readdirSync(sourceSecuredDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (ext !== '.html' && ext !== '.pdf') {
      continue;
    }

    rmSync(path.join(distSecuredDir, entry.name), { recursive: true, force: true });

    if (ext === '.html') {
      rmSync(path.join(distSecuredDir, path.basename(entry.name, ext)), { recursive: true, force: true });
    }
  }
}

const securedAccessMode = resolveSecuredAccessMode();
const env = {
  ...process.env,
  SECURED_ACCESS_MODE: securedAccessMode
};

run(process.execPath, ['scripts/clean-dist.mjs'], env);
run(eleventyBin, [], env);
if (securedAccessMode === 'static') {
  pruneStaticSecuredOutput();
}
run(process.execPath, ['scripts/check-dist.mjs'], env);
