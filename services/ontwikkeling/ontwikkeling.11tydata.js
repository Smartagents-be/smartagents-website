const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/ontwikkeling/',
  pageKey: 'ontwikkeling',
  serviceNameKey: 'services.ontwikkeling.title',
  pageStyles: ['/services/shared/scan-layout.css']
});
