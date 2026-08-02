module.exports = {
  layout: 'layouts/marketing-page.njk',
  locale: 'nl',
  nlPermalink: '/services/',
  shellContext: 'services',
  date: 'git Last Modified',
  pageKey: 'services',
  socialImage: '/assets/social-preview.webp',
  socialAlt: {
    nl: 'SmartAgents – AI-gedreven bedrijfsautomatisatie',
    en: 'SmartAgents – AI-driven business automation',
    fr: 'SmartAgents – automatisation d\'entreprise pilotée par l\'IA'
  },
  pageStyles: [
    '/shared/css/page-hero.css',
    '/shared/css/page-sections.css',
    '/home/home.css'
  ],
  pageScripts: [
    '/shared/js/runtime/color-runtime.js'
  ]
};
