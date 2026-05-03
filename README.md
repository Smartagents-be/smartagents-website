# SmartAgents Website

## Structure

This repo uses four different shared layers. They serve different purposes:

- `assets/`
  - Browser-loaded media and file assets.
  - Keep these flat in the `assets/` root rather than creating subfolders.
  - Examples: `assets/logo.svg`, `assets/social-preview.webp`, `assets/axel-profile.webp`, `assets/SmartAgents_AI_Introductie_Onepager.pdf`.

- `shared/`
  - Shared cross-page CSS and JS that the browser loads directly.
  - Examples: `shared/css/base.css`, `shared/js/runtime/color-runtime.js`.

- `_includes/`
  - Reusable Eleventy/Nunjucks template source.
  - This is for layouts, macros, SEO snippets, and small document fragments that pages include at build time.
  - Examples: `_includes/layouts/marketing-page.njk`, `_includes/macros/service-page.njk`, `_includes/document/shared-stylesheets.njk`.

- `_data/`
  - Global Eleventy data available to templates as variables at build time.
  - Example: `_data/shellConfigs.js`.

## Colocation Pattern

This project follows a **Colocation Pattern** (the "everything-in-its-place" rule) for components and services:

- **Page-specific assets** (CSS, JS, PDFs) live in the same folder as their template (`.njk`).
- **Standardized Entry Points**: All pages use `.njk` files as entry points (e.g., `services/agentic-ai/index.njk`) instead of `.html` to maintain consistency and signal template-based rendering.
- **Automatic Collection**: The build system (`.eleventy.js`) automatically identifies and collects these colocated assets, passing them through to the `dist/` directory while preserving their relative paths.
- **Why?**: This grouping makes the codebase much easier to navigate for developers and AI agents alike. If you need to fix a footer, you look in the `footer/` folder and find everything you need.

## Rule Of Thumb

- If the browser requests it directly and it is a media/file asset, it belongs in `assets/`.
- If the browser requests it directly and it is shared CSS or JS, it belongs in `shared/`.
- If it is included from a template with Nunjucks or used as a layout, it belongs in `_includes/`.
- If it is configuration/data that templates read, it belongs in `_data/`.

## Ownership

- Browser-loaded media/files should live in the flat `assets/` root.
- Shared cross-page CSS and JS should live in `shared/`.
- Shared template building blocks should live in `_includes/`.

## Build And Deploy

- `npm run build`
  - The single production build for this repo.
  - Cleans `dist/`, runs Eleventy, and validates the output with `scripts/check-dist.mjs`.
  - Includes the protected `/secured/` document pages and PDFs for Cloudflare deployment.

- `npm run start:local`
  - Serves `dist/` locally for quick verification.

- Cloudflare-specific protection stays isolated to `functions/secured/`.
  - The public marketing site should remain static-compatible even though this repo no longer maintains a separate static-host build mode.

## Static-Compatible Paths

Keep the public site easy to export in the future:

- Use root-relative browser paths and pass them through `withPathPrefix` or `absoluteUrl` when appropriate.
- Keep public pages as normal folder routes with `index.html` output.
- Keep browser-loaded assets directly fetchable from `assets/`, `shared/`, or colocated page folders.
- Do not make public marketing pages depend on server-side auth, request rewriting, or Cloudflare-specific runtime behavior.
