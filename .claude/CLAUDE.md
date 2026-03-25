# SmartAgents Website Notes

This repository deploys to Netlify using Eleventy to generate the final static site into `dist/`.

## Build System

```
npm run build      → node scripts/clean-dist.mjs && eleventy
npm run start:local → node scripts/start-local.mjs  (local preview only)
```

`scripts/start-local.mjs` is a local-only static server for previewing `dist/`. Not used in production.

## i18n Architecture

- Official Eleventy directory-based i18n pattern.
- NL pages live at root, each sets `locale: nl` in front matter.
- EN pages live under `en/`. They omit `locale` — `en/en.json` provides `locale: en` for the entire `en/` tree via directory data cascade.
- Shared page bodies live in `_includes/pages/`. NL and EN source files are thin wrappers: front matter + `{% include "pages/xxx.njk" %}`.
- The `_includes/pages/` folder structure mirrors the source tree.
- `EleventyI18nPlugin` (`defaultLanguage: "nl"`, `errorMode: "allow-fallback"`) provides the `locale_url` filter.
- Translations: `{{ "key" | t(locale) }}`. Filter defined in `.eleventy.js`, reads from `i18n/en.json` / `i18n/nl.json`.
- i18n values containing HTML require `| safe`: `{{ "key" | t(locale) | safe }}`.
- Hash anchor links must split path and fragment: `{{ "/" | locale_url }}#section` — NOT `{{ "/#section" | locale_url }}`.

## Styling

- Brand color: `#00d8ff` (cyan). CSS variable: `--cyan`. Use for `theme-color` meta and accent defaults.
- `styles.css` is copied as-is to `dist/` — no preprocessor. Edit it directly.

## Assets

- All static assets live in `assets/` and are copied to `dist/assets/` via passthrough copy.
- Image formats: `.webp` for photos, `.svg` for logos and illustrations.
- Always reference assets as `/assets/filename.ext` — never from the root.

## Eleventy Setup Rules

When adding, removing, or restructuring pages:

- New page → create NL wrapper at root + EN wrapper under `en/` + shared body in `_includes/pages/`
- New page → add `nlPermalink`, `shellContext`, `locale: nl` (NL only), `permalink`, schema front matter
- New translation key → add to both `i18n/nl.json` and `i18n/en.json`
- New translation key with HTML content → use `| safe` in the template
- New static asset folder → add `eleventyConfig.addPassthroughCopy(...)` in `.eleventy.js`
- Page excluded from sitemap → add `excludeFromSitemap: true`
- New schema type → add handler in the `buildSchema` filter in `.eleventy.js`

## Where Things Live — Quick Reference

| What | Where to edit |
|------|--------------|
| Page content/markup | `_includes/pages/**/*.njk` |
| NL translations | `i18n/nl.json` |
| EN translations | `i18n/en.json` |
| Nav / footer HTML | `_includes/header.njk`, `_includes/footer.njk` |
| Nav active states | `_data/shellConfigs.js` |
| Global styles | `styles.css` |
| Client-side JS | `main.js` |
| Build config / filters | `.eleventy.js` |
| Static assets | `assets/` |

## Git Rules

- Never push to any remote without explicit approval from the user first.
- Always show the user what will be pushed and wait for confirmation before running `git push`.

## Expectation

- Do not treat changes to website content as complete until the build produces correct `dist/` output.
- After relevant changes, run `npm run build` and verify the generated pages/assets in `dist/`.
