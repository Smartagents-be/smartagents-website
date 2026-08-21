// Shell for the internal presentation decks under /secured/presentations/.
// One layout function, one deck.json per deck: the ten decks used to be ten
// near-identical HTML documents.
import { html, raw, join } from '../../build/lib/html.mjs';

export function deckPage(deck) {
  const { config, slides } = deck;

  const fonts = config.fonts
    ? html`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${config.fonts}" rel="stylesheet">`
    : '';

  const extraStyles = (config.styles || []).map(
    (href) => html`<link rel="stylesheet" href="${href}">`
  );
  const extraScripts = (config.scripts || []).map(
    (src) => html`<script src="${src}"></script>`
  );

  return html`<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${config.description}">
<meta name="robots" content="noindex, follow">
<title>${config.title}</title>
<link rel="icon" type="image/svg+xml" href="assets/logo.svg">
${fonts}
<link rel="stylesheet" href="../shared/tokens.css">
${join(extraStyles)}
<link rel="stylesheet" href="deck.css">
</head>
<body>
<deck-stage width="${config.width}" height="${config.height}">
${join(slides)}
</deck-stage>

<script src="../shared/deck-stage.js"></script>
${join(extraScripts)}
</body>
</html>
`;
}

/** The /secured/ overview: internal documents and decks behind the password gate. */
export function securedIndexPage({ documents, decks }) {
  const list = (items) => html`<div class="list">
${join(
    items.map(
      (item) => html`  <div class="item">
    <span class="item-name">${item.name}</span>
    <div class="actions">
      ${item.html ? html`<a class="btn btn-view" href="${item.html}">Bekijken</a>` : ''}
      ${item.pdf ? html`<a class="btn btn-pdf" href="${item.pdf}" download>PDF</a>` : ''}
    </div>
  </div>`
    )
  )}
</div>`;

  const sections = [];
  if (documents.length) {
    sections.push(html`<h2 class="section-title">Documenten</h2>`, list(documents));
  }
  if (decks.length) {
    sections.push(
      html`<h2 class="section-title">Pitches</h2>`,
      list(decks.map((deck) => ({ name: deck.name, html: deck.url, pdf: deck.pdf })))
    );
  }
  if (!sections.length) {
    sections.push(html`<p class="empty">Geen documenten beschikbaar.</p>`);
  }

  return html`<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SmartAgents — Documenten</title>
<meta name="description" content="Beveiligde documenten van SmartAgents.">
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="#0f172a">
<link rel="stylesheet" href="/secured/base.css">
<link rel="stylesheet" href="/secured/overview.css">
</head>
<body>
<header>
  <div class="brand"><span class="brand-base">Smart</span><span class="brand-accent">Agents</span></div>
  <div class="subtitle">Beveiligde documenten</div>
</header>
${join(sections)}
</body>
</html>
`;
}
