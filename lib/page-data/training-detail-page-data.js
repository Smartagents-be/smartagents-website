const { buildServicePageData } = require('./service-page-data');

function buildTrainingDetailPageData(overrides = {}) {
  return buildServicePageData({
    pageStyles: [
      '/services/training/training.css',
      '/services/training/training-detail.css',
      '/shared/css/forms.css'
    ],
    pageScripts: [
      '/shared/js/forms/contact-form.js'
    ],
    ...overrides
  });
}

module.exports = {
  buildTrainingDetailPageData
};
