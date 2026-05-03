# SmartAgents Website

## Structure

This repo uses four different shared layers. They serve different purposes:

- `assets/`
  - Browser-loaded media and file assets.
  - Keep these flat in the `assets/` root rather than creating subfolders.
  - Examples: `assets/logo.svg`, `assets/social-preview.webp`, `assets/axel.webp`, `assets/SmartAgents_AI_Introductie_Onepager.pdf`.

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

## Deployment Modes

- `npm run build`
  - Default build for server-capable deployments.
  - In this repo that means Cloudflare-style protected `/secured/` documents are included.

- `npm run build:cloudflare`
  - Explicit Cloudflare/server-capable build.
  - Publishes the protected `/secured/` document pages and PDFs.
  - The request protection itself is handled by `functions/secured/`.

- `npm run build:static`
  - Safe build for static-only hosts such as GitHub Pages.
  - The public marketing site still builds normally.
  - Protected `/secured/` documents are not published, because a static host cannot enforce server-side access control.
  - `/secured/` remains as an informational placeholder page instead of exposing the files.
