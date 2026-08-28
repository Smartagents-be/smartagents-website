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
    reportCompressedSize: true
  }
});
