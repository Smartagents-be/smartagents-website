# design-sync notes — smartagents-website

## What this repo is, and why the converter was not run

`smartagents-website` is a **pre-rendered static site, not a component library**. There is
no React, no `dist/` of components, no Storybook, and `package.json` carries exactly two
devDependencies (`vite`, `html-minifier-terser`). The design-sync converter bundles a
package's compiled `dist/` entry into `window.<globalName>.*` with esbuild — here there is
nothing to bundle, so `package-build.mjs` was never run and never will be until a
component package exists.

The design system is real, it just lives as **CSS**: `src/styles/tokens.css` (212 lines of
custom properties) and `src/styles/{critical,main}.css` (~3,950 lines of a closed BEM
vocabulary), composed by the page modules in `src/pages/`.

## What was synced (2026-09-02)

The user was offered three paths (port the markup to React components / sync the look only
/ don't sync) and **chose "sync the look only, no components"**. So the upload is a
styles-only bundle, hand-assembled to the app's output contract:

- `styles.css` — the entry point; `@import`s `tokens/tokens.css` then `_ds_bundle.css`.
  This matters: a rendered design receives **only this file's transitive import closure**,
  which is why the class layer is named `_ds_bundle.css` and imported rather than linked.
- `_ds_bundle.js` — a deliberate stub. Valid `@ds-bundle` header, `components: []`,
  `window.SmartAgents = {}`. Shipped rather than omitted because the app's self-check
  expects the file at the project root; an empty namespace is the honest statement.
- `guidelines/` — class vocabulary (the closed list), the dark field, voice, and the
  14 `clipPath` defs the navy shapes need.
- No `components/`, no `_preview/`, no `_vendor/` — there are no components.

**The component picker in Claude Design will be empty. That is the expected outcome**, not
a failed sync. The design agent styles on-brand by writing the real class names.

## No `_ds_sync.json` anchor — on purpose

The sidecar's `keyRecipe` belongs to a converter shape this bundle does not have, so
writing one would hand a future `resync.mjs` an anchor it cannot honour. Omitted per the
base skill's guidance ("omitting the sidecar is then the honest choice"). The cost is that
the next sync re-verifies everything — which here costs nothing, since there is nothing to
verify but the CSS.

## Re-sync risks

- **`/design-sync` will re-detect the shape as `package` and try to build.** It has no
  Storybook and no `*.stories.*`, so detection lands on the package shape and asks for a
  build command. There is none that produces a component entry. Re-run this styles-only
  assembly instead: the exact sources are in `config.json`, and the steps are (1) copy
  tokens, (2) concatenate `critical.css` + `main.css` in that order into `_ds_bundle.css`,
  (3) re-render `clipDefs()` to `guidelines/clip-paths.svg`, (4) re-validate names, (5)
  upload.
- **Validate every class and token named in the guidelines against the built CSS before
  uploading.** This run caught three real errors that way: `.nav-sheet` and `.video-block`
  are not standalone classes (only their BEM elements exist), and `fonts/README.md` named
  `--tracking-display` and `--font-serif`, which are really `--track-display` and
  `--font-serif-accent`. A conventions file that names things which do not exist is worse
  than none — the agent trusts it and ships silently unstyled output.
- **`clipDefs()` is a build-time function in `src/layouts/base.mjs`**, re-rendered with
  `node -e "import('./src/layouts/base.mjs').then(m => process.stdout.write(m.clipDefs()))"`.
  If a silhouette is added or renamed there, the table in `guidelines/dark-field.md` and
  the SVG both go stale.
- **The render check is `ds-bundle/.render-check.html`** (dot-prefixed, never uploaded).
  Serve `ds-bundle/` and open it: it exercises the hero petal, both button variants, the
  rows, the section rule, the numbered indexes and the badge. If the closure ever breaks,
  this is where it shows first.

## Not synced, and why

`src/motion.js` (magnetic shapes, metaball joins) and `<sa-node-field>` (the live cyan node
network) are the brand's only moving parts and neither travels: motion binds to document
coordinates and a rendered design has no such document. Both are documented as known gaps
in the README so a design maps onto the real markup anyway (`data-magnet`, `data-clip`).

The four web components under `src/components/` are behaviour, not UI parts — nothing in a
design depends on them to look right.

## Upload record

Project **SmartAgents Website** — `51c2fbf6-0201-40f4-adfe-9f6a60ea8ad6`
(https://claude.ai/code/../design/p/51c2fbf6-0201-40f4-adfe-9f6a60ea8ad6). Created fresh
by this run; 13 files uploaded, remote listing verified against the local manifest.

An unrelated project, "SmartSpace Design System" (June 2026), also exists on this account.
It is **not** from this repo — leave it alone.

`ds-bundle/` is gitignored: it is rebuilt from `src/styles/` every sync, so committing it
would just create a second copy to drift.

Minor: `finalize_plan`'s `localDir` resolves against the process cwd, not the repo root.
Pass an absolute path.
