function buildBreadcrumb(locale, dict, baseUrl, pageUrl, currentLabel, nlPermalink) {
    const homeUrl = locale === 'en' ? `${baseUrl}/en/` : `${baseUrl}/`;
    const homeLabel = dict['nav.home'] || 'Home';
    const items = [{ '@type': 'ListItem', position: 1, name: homeLabel, item: homeUrl }];
    if (nlPermalink && nlPermalink.startsWith('/services/')) {
        const servicesUrl = locale === 'en' ? `${baseUrl}/en/#services` : `${baseUrl}/#services`;
        items.push({ '@type': 'ListItem', position: 2, name: dict['nav.services'], item: servicesUrl });
        items.push({ '@type': 'ListItem', position: 3, name: currentLabel, item: `${baseUrl}${pageUrl}` });
    } else {
        items.push({ '@type': 'ListItem', position: 2, name: currentLabel, item: `${baseUrl}${pageUrl}` });
    }
    return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function stripHtml(value) {
    return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = function(eleventyConfig) {
  const SITE_BASE_URL = process.env.URL || 'https://smartagents.be';

  const { readFileSync } = require('node:fs');
  const { EleventyI18nPlugin } = require("@11ty/eleventy");
  const i18n = {
      en: JSON.parse(readFileSync('./i18n/en.json', 'utf8')),
      nl: JSON.parse(readFileSync('./i18n/nl.json', 'utf8'))
  };

  // Built-in i18n plugin — provides locale_url filter
  eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: "nl", errorMode: "allow-fallback" });

  // Translation filter: {{ "key" | t(locale) }}
  eleventyConfig.addFilter('t', (key, locale) => i18n[locale]?.[key] ?? key);

  // Absolute URL filter: {{ page.url | absoluteUrl(baseUrl) }}
  eleventyConfig.addFilter('absoluteUrl', (url, base) => base ? new URL(url, base).href : url);

  // Date format filter for sitemap: {{ page.date | dateToFormat }}
  eleventyConfig.addFilter('dateToFormat', (date) => {
      const d = date instanceof Date ? date : new Date(date);
      return d.toISOString().slice(0, 10);
  });

  // Schema builder filter: {{ schemaData | buildSchema(locale) }}
  eleventyConfig.addFilter('buildSchema', function(pageData, locale) {
      const dict = i18n[locale];
      const baseUrl = SITE_BASE_URL;
      const { schemaType, serviceNameKey, nlPermalink, pageUrl, postedDate } = pageData;

      if (!schemaType) return '';

      const pageTitle = pageData.pageKey ? dict[`page.${pageData.pageKey}.title`] : null;
      const pageDescription = pageData.pageKey ? dict[`page.${pageData.pageKey}.description`] : null;
      const pageImage = `${baseUrl}${pageData.socialImage || '/assets/logo.svg'}`;
      const schemas = [];

      if (schemaType === 'home') {
          schemas.push({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: pageTitle,
              description: pageDescription,
              url: `${baseUrl}${pageUrl}`,
              inLanguage: locale,
              image: pageImage,
              isPartOf: { '@type': 'WebSite', name: 'SmartAgents', url: baseUrl }
          });
      }

      else if (schemaType === 'service') {
          const serviceName = dict[serviceNameKey] || pageTitle;
          schemas.push({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: serviceName,
              serviceType: serviceName,
              description: pageDescription,
              url: `${baseUrl}${pageUrl}`,
              image: pageImage,
              provider: { '@type': 'Organization', name: 'SmartAgents', url: baseUrl },
              areaServed: { '@type': 'Country', name: 'Belgium' },
              offers: { '@type': 'Offer', url: `${baseUrl}${pageUrl}` }
          });
          schemas.push(buildBreadcrumb(locale, dict, baseUrl, pageUrl, serviceName, nlPermalink));
      }

      else if (schemaType === 'jobs') {
          const datePosted = postedDate || new Date().toISOString().slice(0, 10);
          schemas.push({
              '@context': 'https://schema.org',
              '@type': 'JobPosting',
              title: dict['jobs.role.title'],
              description: `${dict['page.jobs.description']} ${stripHtml(dict['jobs.cta.text'])}`,
              datePosted,
              employmentType: 'FULL_TIME',
              jobLocationType: 'TELECOMMUTE',
              applicantLocationRequirements: { '@type': 'Country', name: 'Belgium' },
              hiringOrganization: {
                  '@type': 'Organization',
                  name: 'SmartAgents',
                  sameAs: baseUrl,
                  logo: `${baseUrl}/assets/logo.svg`
              },
              url: `${baseUrl}${pageUrl}`,
              directApply: false
          });
          schemas.push(buildBreadcrumb(locale, dict, baseUrl, pageUrl, dict['nav.jobs'], nlPermalink));
      }

      const filtered = schemas.filter(Boolean);
      if (filtered.length === 0) return '';
      const payload = filtered.length === 1 ? filtered[0] : filtered;
      return JSON.stringify(payload, null, 4);
  });

  // Global data
  eleventyConfig.addGlobalData('baseUrl', SITE_BASE_URL);

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("export");
  eleventyConfig.addPassthroughCopy("main.js");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy({ "_headers": "_headers" });

  eleventyConfig.ignores.add("dist/**");
  eleventyConfig.ignores.add(".claude/**");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk"]
  };
};
