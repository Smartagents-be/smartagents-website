const socialAlt = {
  nl: 'SmartAgents – AI-gedreven bedrijfsautomatisatie',
  en: 'SmartAgents – AI-driven business automation'
};

const servicePageStyles = [
  '/shared/css/scroll-reveal.css',
  '/shared/css/page-hero.css',
  '/shared/css/page-sections.css',
  '/shared/css/page-role-grid.css',
  '/shared/css/page-benefits.css',
  '/shared/css/page-cta.css'
];

const servicePageScripts = [
  '/shared/js/runtime/color-runtime.js',
  '/shared/js/effects/scroll-reveal.js',
  '/shared/js/effects/canvas-effects.js'
];

function buildServicePageData(overrides = {}) {
  const { pageStyles = [], pageScripts = [], ...rest } = overrides;

  return {
    layout: 'layouts/marketing-page.njk',
    locale: 'nl',
    shellContext: 'services',
    date: 'git Last Modified',
    schemaType: 'service',
    socialImage: '/assets/social-preview.webp',
    socialAlt,
    pageStyles: [...servicePageStyles, ...pageStyles],
    pageScripts: [...servicePageScripts, ...pageScripts],
    ...rest
  };
}

module.exports = {
  buildServicePageData
};
