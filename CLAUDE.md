# CLAUDE.md

## Color rules

- Use `assets/css/base.css` as the single source of truth for runtime color tokens.
- Always reference colors in templates, HTML, CSS, and JS through tokens from `base.css`.
- Do not add literal color values outside `assets/css/base.css` for live site code.
- Do not add inline `#hex`, `rgb()`, `rgba()`, or literal gradient color stops in templates, stylesheets, or JS.
- Reuse an existing token before introducing a new tone.
- Keep the token set intentionally small. Prefer the nearest existing tone over adding a barely different new one.
- Keep the palette aligned with the SmartAgents design system: brand cyan / blue, dark neutrals, and the existing service/status accents.
- For shared service theming, use the contextual `--service-color`, `--service-color-08`, `--service-color-15`, and `--service-color-20` vars instead of inventing page-specific color aliases.
- If a new tone is truly required, add it to `base.css` first and then consume it everywhere via `var(--token)`.
- Standalone pages should load `base.css`; they should not redefine the shared palette locally.
- Exceptions:
  - Static SVG asset files may keep embedded literal colors when they are treated as standalone artwork.
  - JS may build `rgba(...)` strings only from RGB channel tokens defined in `base.css`; it should not introduce raw palette values itself.
