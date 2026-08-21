import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(repoRoot, 'dist');
const viteBin = path.resolve(repoRoot, 'node_modules', '.bin', 'vite');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit'
  });

  // A missing binary exits without printing anything, which on a CI runner
  // reads as "the build failed for no reason". Say what went wrong instead.
  if (result.error) {
    console.error(`\nBuild step failed to start: ${command}\n${result.error.message}`);
    if (command === viteBin) {
      console.error(
        'vite is a devDependency. A build environment with NODE_ENV=production\n' +
        'skips devDependencies, so the toolchain is never installed.'
      );
    }
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// Vite is the toolchain, not a runtime dependency: check for it before the
// first step so the failure names the cause rather than the symptom.
if (!existsSync(viteBin)) {
  console.error(
    `\nvite not found at ${viteBin}.\n` +
    'Run "npm ci" first, and make sure the install kept devDependencies\n' +
    '(NODE_ENV=production drops them).'
  );
  process.exit(1);
}

// 1. Vite builds and hashes the JS/CSS shell and writes the manifest.
run(viteBin, ['build']);
// 2. render.mjs turns every template into a complete HTML file.
run(process.execPath, ['build/render.mjs']);
// 3. The manifest is scaffolding for step 2, not output. render.mjs and
//    check-dist.mjs both skip dot-entries, so dropping it changes neither the
//    routing table nor the checks; it only keeps it out of the deploy.
rmSync(path.join(distDir, '.vite'), { recursive: true, force: true });
// 4. check-dist.mjs is the gatekeeper for what ships.
run(process.execPath, ['scripts/check-dist.mjs']);
