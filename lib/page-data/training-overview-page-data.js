const { buildServicePageData } = require('./service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/training/',
  pageKey: 'training',
  serviceNameKey: 'services.training.title',
  pageStyles: ['/services/training/training.css'],
  pageScripts: ['/services/training/training-mobile-chooser.js']
});
