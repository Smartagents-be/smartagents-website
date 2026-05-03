const { buildTrainingDetailPageData } = require('../../../lib/page-data/training-detail-page-data');

module.exports = buildTrainingDetailPageData({
  nlPermalink: '/services/training/m365-copilot/',
  pageKey: 'training-m365-copilot',
  serviceNameKey: 'services.training.detail.m365-copilot.title',
  courseKey: 'm365-copilot',
  pdfHref: '/assets/SmartAgents_M365_Copilot_Onepager.pdf'
});
