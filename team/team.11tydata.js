module.exports = {
  layout: 'layouts/marketing-page.njk',
  locale: 'nl',
  nlPermalink: '/team/',
  shellContext: 'team',
  date: 'git Last Modified',
  pageKey: 'team',
  socialImage: '/assets/social-preview.webp',
  socialAlt: {
    nl: 'SmartAgents – Het team achter intelligente AI-automatisatie',
    en: 'SmartAgents – The team behind intelligent AI automation',
    fr: 'SmartAgents – l\'équipe derrière l\'automatisation intelligente par l\'IA'
  },
  pageStyles: [
    '/team/team.css'
  ],
  pageScripts: [
    '/team/flip-cards.js'
  ]
};
