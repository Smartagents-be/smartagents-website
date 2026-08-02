module.exports = {
  layout: 'layouts/marketing-page.njk',
  locale: 'nl',
  nlPermalink: '/contact/',
  shellContext: 'page',
  date: 'git Last Modified',
  pageKey: 'contact',
  socialImage: '/assets/social-preview.webp',
  socialAlt: {
    nl: 'SmartAgents – AI-gedreven bedrijfsautomatisatie',
    en: 'SmartAgents – AI-driven business automation',
    fr: 'SmartAgents – automatisation d\'entreprise pilotée par l\'IA'
  },
  pageStyles: [
    '/shared/css/page-hero.css',
    '/shared/css/page-sections.css',
    '/shared/css/forms.css',
    '/home/home.css'
  ],
  pageScripts: [
    '/shared/js/runtime/color-runtime.js',
    '/shared/js/forms/contact-form.js'
  ],
  pageExternalScripts: [
    'https://challenges.cloudflare.com/turnstile/v0/api.js'
  ]
};
