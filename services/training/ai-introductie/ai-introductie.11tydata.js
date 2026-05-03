const { buildTrainingDetailPageData } = require('../../../lib/page-data/training-detail-page-data');

module.exports = buildTrainingDetailPageData({
  nlPermalink: '/services/training/ai-introductie/',
  pageKey: 'training-ai-introductie',
  serviceNameKey: 'services.training.detail.ai-introductie.title',
  courseKey: 'ai-introductie',
  pdfHref: '/assets/SmartAgents_AI_Introductie_Onepager.pdf'
});
