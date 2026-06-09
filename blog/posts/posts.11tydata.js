module.exports = {
  layout: 'layouts/blog-post.njk',
  locale: 'nl',
  tags: 'blog',
  schemaType: 'blogPost',
  shellContext: 'blog',
  pageKey: 'blogPost',
  socialAlt: {
    nl: 'SmartAgents Blog',
    en: 'SmartAgents Blog'
  },
  permalink: '/blog/{{ page.fileSlug }}/',
  image: '/assets/blog/default-banner.webp',
  eleventyComputed: {
    nlPermalink: data => `/blog/${data.page.fileSlug}/`,
    imageAlt: data => data.imageAlt || data.title || 'SmartAgents Blog',
    socialImage: data => data.image || '/assets/blog/default-banner.webp'
  }
};
