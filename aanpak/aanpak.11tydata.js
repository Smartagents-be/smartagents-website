module.exports = {
  layout: 'layouts/marketing-page.njk',
  locale: 'nl',
  nlPermalink: '/aanpak/',
  shellContext: 'page',
  date: 'git Last Modified',
  pageKey: 'aanpak',
  socialImage: '/assets/social-preview.webp',
  socialAlt: {
    nl: 'SmartAgents – AI-gedreven bedrijfsautomatisatie',
    en: 'SmartAgents – AI-driven business automation',
    fr: 'SmartAgents – automatisation d\'entreprise pilotée par l\'IA'
  },
  pageStyles: [
    '/shared/css/page-hero.css',
    '/shared/css/page-sections.css',
    '/shared/css/approach.css'
  ],
  pageScripts: [
    '/shared/js/runtime/color-runtime.js'
  ]
};
