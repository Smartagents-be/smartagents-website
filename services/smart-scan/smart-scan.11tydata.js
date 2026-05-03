const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/smart-scan/',
  pageKey: 'smartscan',
  serviceNameKey: 'services.smartscan.title',
  pageStyles: ['/services/shared/scan-layout.css']
});
