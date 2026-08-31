const { buildTrainingDetailPageData } = require('../../../lib/page-data/training-detail-page-data');

module.exports = buildTrainingDetailPageData({
  nlPermalink: '/services/training/developers/',
  pageKey: 'training-developers',
  serviceNameKey: 'services.training.detail.developers.title',
  courseKey: 'developers',
  pdfHref: '/assets/training_agentic_dev.pdf'
});
