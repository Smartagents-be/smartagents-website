const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/services/agentic-ai/',
  pageKey: 'agentic',
  serviceNameKey: 'services.agentic.title',
  pageStyles: ['/shared/css/approach.css']
});
