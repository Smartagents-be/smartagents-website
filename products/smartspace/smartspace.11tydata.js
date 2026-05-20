const { buildServicePageData } = require('../../lib/page-data/service-page-data');

module.exports = buildServicePageData({
  nlPermalink: '/products/smartspace/',
  pageKey: 'smartspace',
  serviceNameKey: 'products.smartspace.title',
  shellContext: 'products',
  schemaType: 'product',
  pageStyles: ['/products/smartspace/smartspace.css']
});
