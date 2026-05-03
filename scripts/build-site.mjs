import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const eleventyBin = path.resolve(repoRoot, 'node_modules', '.bin', 'eleventy');

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

const env = { ...process.env };
run(process.execPath, ['scripts/clean-dist.mjs'], env);
run(eleventyBin, [], env);
run(process.execPath, ['scripts/check-dist.mjs'], env);
