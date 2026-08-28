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
<link rel="stylesheet" href="../../tokens.css">
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
  const list = (scope, items) => html`<ul id="${scope}-list" class="list">
${join(
    items.map(
      (item) => html`  <li id="${scope}-item-${item.slug}" class="item">
    <span id="${scope}-name-${item.slug}" class="item-name">${item.name}</span>
    <span id="${scope}-actions-${item.slug}" class="actions">
      ${
        item.html
          ? html`<a id="${scope}-view-${item.slug}" class="btn btn-view" href="${item.html}">Bekijken</a>`
          : ''
      }
      ${
        item.pdf
          ? html`<a id="${scope}-pdf-${item.slug}" class="btn btn-pdf" href="${item.pdf}" download>PDF</a>`
          : ''
      }
    </span>
  </li>`
    )
  )}
</ul>`;

  const section = (scope, title, items) => html`<section id="${scope}" class="group" aria-labelledby="${scope}-title">
  <h2 id="${scope}-title" class="section-title">${title}</h2>
  ${list(scope, items)}
</section>`;

  const sections = [];
  if (documents.length) {
    sections.push(section('secured-documents', 'Documenten', documents));
  }
  if (decks.length) {
    sections.push(
      section(
        'secured-decks',
        'Pitches',
        decks.map((deck) => ({ slug: deck.slug, name: deck.name, html: deck.url, pdf: deck.pdf }))
      )
    );
  }
  if (!sections.length) {
    sections.push(html`<p id="secured-empty" class="empty">Geen documenten beschikbaar.</p>`);
  }

  return html`<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SmartAgents — Documenten</title>
<meta name="description" content="Beveiligde documenten van SmartAgents.">
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="#f9fafb">
<link rel="stylesheet" href="/secured/tokens.css">
<link rel="stylesheet" href="/secured/base.css">
<link rel="stylesheet" href="/secured/overview.css">
</head>
<body id="secured-body">
<header id="secured-header" class="page-head">
  <p id="secured-brand" class="brand"><span id="secured-brand-base" class="brand-base">Smart</span><span id="secured-brand-accent" class="brand-accent">Agents</span></p>
  <p id="secured-subtitle" class="subtitle">Beveiligde documenten</p>
</header>
<main id="secured-main">
${join(sections)}
</main>
</body>
</html>
`;
}
