module.exports = {
  layout: 'layouts/customerzone-page.njk',
  locale: 'nl',
  nlPermalink: '/customerzone/',
  shellContext: 'home',
  date: 'git Last Modified',
  excludeFromSitemap: true,
  pageKey: 'customerzone',
  socialImage: '/assets/social-preview.webp',
  socialAlt: {
    nl: 'SmartAgents – AI-gedreven bedrijfsautomatisatie',
    en: 'SmartAgents – AI-driven business automation'
  },
  permalink: '/customerzone/',
  pageStyles: [
    '/customerzone/customerzone.css'
  ],
  pageScripts: [
    '/shared/js/runtime/color-runtime.js',
    '/customerzone/customerzone.js'
  ]
};
