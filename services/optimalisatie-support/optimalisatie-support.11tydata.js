const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/optimalisatie-support/',
  pageKey: 'optimalisatie',
  serviceNameKey: 'services.optimalisatie.title',
  pageStyles: ['/services/shared/scan-layout.css'],
  bodyDataService: 'optimalisatie'
});
