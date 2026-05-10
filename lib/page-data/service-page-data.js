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
  '/shared/css/page-cta.css',
  '/shared/css/forms.css'
];

const servicePageScripts = [
  '/shared/js/runtime/color-runtime.js',
  '/shared/js/effects/scroll-reveal.js',
  '/shared/js/effects/canvas-effects.js',
  '/shared/js/forms/contact-form.js'
];

const servicePageExternalScripts = [
  'https://challenges.cloudflare.com/turnstile/v0/api.js'
];

function mergeUnique(base, extra) {
  return [...new Set([...base, ...extra])];
}

function buildServicePageData(overrides = {}) {
  const { pageStyles = [], pageScripts = [], pageExternalScripts = [], ...rest } = overrides;

  return {
    layout: 'layouts/marketing-page.njk',
    locale: 'nl',
    shellContext: 'services',
    date: 'git Last Modified',
    schemaType: 'service',
    socialImage: '/assets/social-preview.webp',
    socialAlt,
    pageStyles: mergeUnique(servicePageStyles, pageStyles),
    pageScripts: mergeUnique(servicePageScripts, pageScripts),
    pageExternalScripts: mergeUnique(servicePageExternalScripts, pageExternalScripts),
    ...rest
  };
}

module.exports = {
  buildServicePageData
};
