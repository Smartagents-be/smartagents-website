module.exports = {
  layout: 'layouts/marketing-page.njk',
  locale: 'nl',
  nlPermalink: '/',
  shellContext: 'home',
  date: 'git Last Modified',
  socialImage: '/assets/social-preview.webp',
  socialAlt: {
    nl: 'SmartAgents – AI-gedreven bedrijfsautomatisatie',
    en: 'SmartAgents – AI-driven business automation'
  },
  metaAuthor: 'SmartAgents',
  schemaType: 'home',
  pageKey: 'index',
  pageStyles: [
    '/shared/css/scroll-reveal.css',
    '/home/home.css',
    '/shared/css/approach.css',
    '/shared/css/forms.css'
  ],
  pageScripts: [
    '/shared/js/runtime/color-runtime.js',
    '/home/stat-counters.js',
    '/shared/js/forms/contact-form.js',
    '/shared/js/effects/scroll-reveal.js',
    '/shared/js/effects/canvas-effects.js',
    '/home/services-split.js'
  ]
};
