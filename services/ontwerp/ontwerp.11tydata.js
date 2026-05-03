const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/ontwerp/',
  pageKey: 'ontwerp',
  serviceNameKey: 'services.ontwerp.title',
  pageStyles: ['/services/shared/scan-layout.css'],
  bodyDataService: 'ontwerp'
});
