import { defineConfig } from 'vite';

// Vite handles bundling, hashing and minification of the JS/CSS shell.
// HTML is produced by build/render.mjs, which reads the manifest this emits.
// See .claude/skills/fast-static-site/SKILL.md §1 and §6.
export default defineConfig({
  build: {
    outDir: 'dist',
    // build/render.mjs writes into the same directory afterwards.
    emptyOutDir: true,
    manifest: true,
    assetsDir: 'assets',
    // Everything under /assets/ is content-hashed and served immutable.
    rollupOptions: {
      input: 'src/app.js',
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    },
    target: 'es2022',
    cssMinify: true,
    /* The entry is the only module the HTML names, and `base.mjs` names it with
       a `<script type="module">` in the head. Vite's preload helper exists to
       inject `<link rel="modulepreload">` for a dynamic import's dependencies
       into HTML Vite itself emits — and it emits none here, because the HTML is
       written by `build/render.mjs`. So the helper was about a kilobyte of the
       entry chunk that nothing ever called. */
    modulePreload: false,
    /* Reported, never asserted. `check-dist.mjs` measures the real budget in
       brotli against the rendered pages; this only gzips every chunk a second
       time to print a column. */
    reportCompressedSize: false
  }
});
