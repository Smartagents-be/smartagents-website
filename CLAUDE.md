# CLAUDE.md - Agent Entry Point

This file serves as the primary entry point for AI agents. 

## Primary Documentation
For all architectural, technical, and workflow guidelines, refer to:
👉 **[AGENTS.md](./AGENTS.md)**

## Quick Commands
- **Build**: `npm run build` (Runs `check-dist.mjs` validation)
- **Local Dev**: `npm run start:local`
- **Static Build**: `npm run build:static` (Prunes secured content)

## Tech Stack Summary
- **SSG**: Eleventy 3.0 (Nunjucks)
- **Styling**: Vanilla CSS with shared tokens (`shared/css/base.css`)
- **I18n**: JSON-based (`i18n/`) with `t` filter
- **Deploy**: Cloudflare Pages

## Key Patterns
- **Colocation**: Keep CSS/JS in the component/page folder.
- **Data-Driven**: Use `.11tydata.js` for page configuration.
- **Validation**: `scripts/check-dist.mjs` is the gatekeeper for the `dist/` folder.
