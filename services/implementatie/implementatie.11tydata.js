const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/implementatie/',
  pageKey: 'implementatie',
  serviceNameKey: 'services.implementatie.title',
  pageStyles: ['/services/shared/scan-layout.css'],
  bodyDataService: 'implementatie'
});
