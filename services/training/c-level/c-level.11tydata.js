const { buildTrainingDetailPageData } = require('../../../lib/page-data/training-detail-page-data');

module.exports = buildTrainingDetailPageData({
  nlPermalink: '/services/training/c-level/',
  pageKey: 'training-c-level',
  serviceNameKey: 'services.training.detail.c-level.title',
  courseKey: 'c-level',
  pdfHref: '/assets/SmartAgents_AI_C-Level_Onepager.pdf'
});
