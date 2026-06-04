module.exports = {
  layout: 'layouts/blog-post.njk',
  locale: 'nl',
  tags: 'blog',
  schemaType: 'blogPost',
  shellContext: 'blog',
  pageKey: 'blogPost',
  socialImage: '/assets/social-preview.webp',
  socialAlt: {
    nl: 'SmartAgents Blog',
    en: 'SmartAgents Blog'
  },
  permalink: '/blog/{{ page.fileSlug }}/'
};
