const { buildTrainingDetailPageData } = require('../../../lib/page-data/training-detail-page-data');

module.exports = buildTrainingDetailPageData({
  nlPermalink: '/services/training/management/',
  pageKey: 'training-management',
  serviceNameKey: 'services.training.detail.management.title',
  courseKey: 'management',
  pdfHref: '/assets/SmartAgents_AI_Management_Onepager.pdf'
});
