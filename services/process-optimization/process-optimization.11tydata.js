const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/process-optimization/',
  pageKey: 'process',
  serviceNameKey: 'services.process.title',
  pageStyles: ['/services/process-optimization/process.css'],
  bodyDataService: 'process'
});
