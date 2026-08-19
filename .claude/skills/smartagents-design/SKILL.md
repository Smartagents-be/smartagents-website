---
name: smartagents-design
description: Use this skill to generate well-branded interfaces and assets for SmartAgents, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read `README.md` in this skill first, then explore the other files here.

If you are making visual artifacts (slides, mocks, throwaway prototypes), copy
the assets out and produce static HTML files the user can open.

If you are working on production code in this repository, the design system is
already implemented:

- Tokens: `src/styles/tokens.css` (the copy in `tokens/` here is the portable
  reference; keep the two in step if you change either).
- Above-the-fold CSS: `src/styles/critical.css`. Everything else:
  `src/styles/main.css`.
- Page chrome: `src/layouts/base.mjs` (shell, header, footer, logo, clip paths).
- The homepage this system was extracted from: `src/pages/home.mjs`.
- The live dark field: `src/components/node-field/node-field.js`.
- Reveals, spotlight and the magnetic shapes: `src/motion.js`.

All visible text goes through `t()` and lives in `src/i18n/*.json`. Never
hard-code copy into a template.

If the user invokes this skill with no other guidance, ask what they want to
build, ask a few questions, and act as an expert designer who outputs HTML
artifacts *or* production code, depending on the need.
