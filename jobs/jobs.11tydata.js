module.exports = {
  layout: 'layouts/marketing-page.njk',
  locale: 'nl',
  nlPermalink: '/jobs/',
  shellContext: 'jobs',
  date: 'git Last Modified',
  pageKey: 'jobs',
  schemaType: 'jobs',
  postedDate: '2026-03-19',
  socialImage: '/assets/handshake.webp',
  socialAlt: {
    nl: 'Professionele handdruk tussen zakenpartners',
    en: 'Professional handshake between business partners'
  },
  pageStyles: [
    '/shared/css/scroll-reveal.css',
    '/shared/css/page-hero.css',
    '/shared/css/page-sections.css',
    '/shared/css/page-role-grid.css',
    '/shared/css/page-benefits.css',
    '/shared/css/page-cta.css',
    '/shared/css/forms.css',
    '/jobs/jobs.css',
    '/jobs/jobs-team.css'
  ],
  pageScripts: [
    '/shared/js/runtime/color-runtime.js',
    '/shared/js/effects/scroll-reveal.js',
    '/shared/js/effects/canvas-effects.js',
    '/shared/js/forms/contact-form.js',
    '/jobs/jobs-carousel.js'
  ]
};
