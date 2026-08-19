import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const viteBin = path.resolve(repoRoot, 'node_modules', '.bin', 'vite');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// 1. Vite builds and hashes the JS/CSS shell and writes the manifest.
run(viteBin, ['build']);
// 2. render.mjs turns every template into a complete HTML file.
run(process.execPath, ['build/render.mjs']);
// 3. check-dist.mjs is the gatekeeper for what ships.
run(process.execPath, ['scripts/check-dist.mjs']);
