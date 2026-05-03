# AGENTS.md - AI Agent Guide for SmartAgents Website

This file is the definitive technical and architectural reference for AI agents working on this repository.

## Core Architecture: The Colocation Pattern

This project uses a **Colocation Pattern** to manage complexity. Instead of global folders for CSS or JS, assets live beside the templates they serve.

- **Component/Page Folders**: Each major area (e.g., `header/`, `footer/`, `home/`, `services/agentic-ai/`) is self-contained.
- **Files in a folder**:
  - `index.njk`: The entry point (Dutch/Root).
  - `en.njk`: The English entry point.
  - `page.njk`: The shared markup (included by index/en).
  - `*.css`: Scoped styles.
  - `*.js`: Scoped scripts.
- **Automatic Collection**: `.eleventy.js` uses a `collectColocatedAssets` function to find these files and pass them through to `dist/` while maintaining their relative paths.

## Tech Stack & Build System

- **SSG**: Eleventy 3.0 (Nunjucks).
- **Environment**: Node.js.
- **Deployment**: Cloudflare Pages (with Functions for `/secured/` content).
- **Build Commands**:
  - `npm run build`: Standard build (includes secured docs).
  - `npm run build:cloudflare`: Explicit Cloudflare build.
  - `npm run build:static`: Prunes `/secured/` content for static hosts.
  - `npm run start:local`: Local preview server for `dist/`.

## I18n (Internationalization)

- **Translation Files**: `i18n/nl.json` and `i18n/en.json`.
- **Usage**: Use the `t` filter: `{{ "key" | t(locale) }}`.
- **HTML in Translations**: If a key contains HTML, use `| safe`: `{{ "key" | t(locale) | safe }}`.
- **Locale Switcher**: Managed in `header/header.njk` using the `locale_url` filter.

## Directory Structure Reference

- `_data/`: Global data (e.g., `shellConfigs.js`).
- `_includes/`: Shared layouts (`layouts/`), macros, and document fragments (SEO, fonts).
- `assets/`: Global static assets (logos, team photos, PDFs). **Keep this flat.**
- `shared/`: Global CSS/JS (e.g., `base.css` with color tokens).
- `functions/`: Cloudflare Pages Functions for server-side logic (Auth).
- `dist/`: The generated output (Never edit manually).

## Styling & Design System

- **Color Tokens**: `shared/css/base.css` is the **Single Source of Truth**.
- **Variables**: Use `--cyan`, `--service-color`, etc. Avoid literal hex/rgb values in component CSS.
- **Responsive**: Use the mobile-first approach established in `base.css`.

## Routing Rules

- **Entry Points**: Always use `.njk` for page entry points (e.g., `team/index.njk`).
- **Permalinks**: Defined in the front matter of `index.njk` and `en.njk`.
- **Breadcrumbs & SEO**: Controlled via `schemaType` and `pageKey` in `.11tydata.js` files.

## Validation & Quality Control

- **`scripts/check-dist.mjs`**: A mandatory build sanity check.
  - Detects: Unresolved variables, raw translation keys, broken internal links, missing alt text, and leaked front matter.
  - **Action**: Always run `npm run build` after changes to ensure this script passes.

## AI Working Guidelines

1. **Colocate by default**: When adding a new service or component, create a new folder and keep its CSS/JS inside it.
2. **Update i18n**: Never hardcode strings in templates. Add keys to both `nl.json` and `en.json`.
3. **Use Data Cascades**: Prefer `.11tydata.js` for setting page-level variables (`pageStyles`, `pageScripts`, `schemaType`).
4. **Safety First**: Do not modify `functions/` or `secured/` without understanding the Cloudflare auth flow.
5. **No Duplication**: Do not copy `page.njk` content into `index.njk`. Use `{% include "./page.njk" %}`.
