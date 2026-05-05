function buildBreadcrumb(locale, dict, baseUrl, pageUrl, currentLabel, nlPermalink, pathPrefix = '') {
    const homePath = locale === 'en' ? '/en/' : '/';
    const homeUrl = buildAbsoluteUrl(homePath, baseUrl, pathPrefix);
    const homeLabel = dict['nav.home'] || 'Home';
    const items = [{ '@type': 'ListItem', position: 1, name: homeLabel, item: homeUrl }];
    if (nlPermalink && nlPermalink.startsWith('/services/')) {
        const servicesPath = locale === 'en' ? '/en/#services' : '/#services';
        const servicesUrl = buildAbsoluteUrl(servicesPath, baseUrl, pathPrefix);
        items.push({ '@type': 'ListItem', position: 2, name: dict['nav.services'], item: servicesUrl });
        items.push({ '@type': 'ListItem', position: 3, name: currentLabel, item: buildAbsoluteUrl(pageUrl, baseUrl, pathPrefix) });
    } else {
        items.push({ '@type': 'ListItem', position: 2, name: currentLabel, item: buildAbsoluteUrl(pageUrl, baseUrl, pathPrefix) });
    }
    return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function stripHtml(value) {
    return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizePathPrefix(rawPathPrefix = process.env.PATH_PREFIX) {
    const value = String(rawPathPrefix || '').trim();

    if (!value || value === '/') {
        return '';
    }

    const ensuredLeadingSlash = value.startsWith('/') ? value : `/${value}`;
    const withoutTrailingSlash = ensuredLeadingSlash.replace(/\/+$/, '');
    return withoutTrailingSlash === '/' ? '' : withoutTrailingSlash;
}

function applyPathPrefix(url, pathPrefix = '') {
    if (!url) {
        return url;
    }

    if (
        /^(?:[a-z]+:)?\/\//i.test(url) ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('data:') ||
        url.startsWith('#')
    ) {
        return url;
    }

    if (!pathPrefix) {
        return url;
    }

    if (url === '/') {
        return `${pathPrefix}/`;
    }

    if (url === pathPrefix || url.startsWith(`${pathPrefix}/`)) {
        return url;
    }

    if (url.startsWith('/')) {
        return `${pathPrefix}${url}`;
    }

    return url;
}

function buildAbsoluteUrl(url, base, pathPrefix = '') {
    const prefixedUrl = applyPathPrefix(url, pathPrefix);
    return base ? new URL(prefixedUrl, base).href : prefixedUrl;
}

function collectFiles(rootDir, fs, path, predicate) {
    const files = [];

    function walk(currentDir) {
        for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }
            if (predicate(fullPath)) {
                files.push(fullPath);
            }
        }
    }

    walk(rootDir);
    return files;
}

const colocatedAssetExtensions = new Set([
    '.css',
    '.js',
    '.pdf',
    '.webp',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.avif'
]);

function collectColocatedAssets(rootDir, fs, path) {
    return collectFiles(
        rootDir,
        fs,
        path,
        (fullPath) => colocatedAssetExtensions.has(path.extname(fullPath).toLowerCase()) && !fullPath.endsWith('.11tydata.js')
    );
}

function collectSecuredStaticFiles(rootDir, fs, path) {
    return collectFiles(
        rootDir,
        fs,
        path,
        (fullPath) => {
            return fullPath.endsWith('.css') || fullPath.endsWith('.pdf');
        }
    );
}

module.exports = function(eleventyConfig) {
  const SITE_BASE_URL = process.env.URL || 'https://smartagents.be';
  const PATH_PREFIX = normalizePathPrefix();
  const SITE_ROOT_URL = buildAbsoluteUrl('/', SITE_BASE_URL, PATH_PREFIX);
  const BASE_DOMAIN = new URL(SITE_ROOT_URL).hostname;
  const colocatedAssetRoots = ['404', 'customerzone', 'footer', 'header', 'home', 'jobs', 'services', 'team'];

  const fs = require('node:fs');
  const path = require('node:path');
  const { readFileSync } = fs;
  const { EleventyI18nPlugin } = require("@11ty/eleventy");
  const i18n = {
      en: JSON.parse(readFileSync('./i18n/en.json', 'utf8')),
      nl: JSON.parse(readFileSync('./i18n/nl.json', 'utf8'))
  };

  // Built-in i18n plugin — provides locale_url filter
  eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: "nl", errorMode: "allow-fallback" });

  // Translation filter: {{ "key" | t(locale) }}
  eleventyConfig.addFilter('t', (key, locale) => i18n[locale]?.[key] ?? key);

  // Prefix root-relative URLs for subpath deployments.
  eleventyConfig.addFilter('withPathPrefix', (url) => applyPathPrefix(url, PATH_PREFIX));

  // Absolute URL filter: {{ page.url | absoluteUrl(baseUrl) }}
  eleventyConfig.addFilter('absoluteUrl', (url, base) => buildAbsoluteUrl(url, base, PATH_PREFIX));

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
      const pageImage = buildAbsoluteUrl(pageData.socialImage || '/assets/logo.svg', baseUrl, PATH_PREFIX);
      const schemas = [];

      if (schemaType === 'home') {
          schemas.push({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: pageTitle,
              description: pageDescription,
              url: buildAbsoluteUrl(pageUrl, baseUrl, PATH_PREFIX),
              inLanguage: locale,
              image: pageImage,
              isPartOf: { '@type': 'WebSite', name: 'SmartAgents', url: SITE_ROOT_URL }
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
              url: buildAbsoluteUrl(pageUrl, baseUrl, PATH_PREFIX),
              image: pageImage,
              provider: { '@type': 'Organization', name: 'SmartAgents', url: SITE_ROOT_URL },
              areaServed: { '@type': 'Country', name: 'Belgium' },
              offers: { '@type': 'Offer', url: buildAbsoluteUrl(pageUrl, baseUrl, PATH_PREFIX) }
          });
          schemas.push(buildBreadcrumb(locale, dict, baseUrl, pageUrl, serviceName, nlPermalink, PATH_PREFIX));
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
                  sameAs: SITE_ROOT_URL,
                  logo: buildAbsoluteUrl('/assets/logo.svg', baseUrl, PATH_PREFIX)
              },
              url: buildAbsoluteUrl(pageUrl, baseUrl, PATH_PREFIX),
              directApply: false
          });
          schemas.push(buildBreadcrumb(locale, dict, baseUrl, pageUrl, dict['nav.jobs'], nlPermalink, PATH_PREFIX));
      }

      const filtered = schemas.filter(Boolean);
      if (filtered.length === 0) return '';
      const payload = filtered.length === 1 ? filtered[0] : filtered;
      return JSON.stringify(payload, null, 4);
  });

  // Global data
  eleventyConfig.addGlobalData('baseUrl', SITE_BASE_URL);
  eleventyConfig.addGlobalData('siteRootUrl', SITE_ROOT_URL);
  eleventyConfig.addGlobalData('baseDomain', BASE_DOMAIN);
  eleventyConfig.addGlobalData('pathPrefix', PATH_PREFIX);
  eleventyConfig.addGlobalData('assetsVersion', String(Date.now()));

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("shared");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy({ "_headers": "_headers" });
  colocatedAssetRoots.forEach((dir) => {
      collectColocatedAssets(dir, fs, path).forEach((file) => {
          eleventyConfig.addPassthroughCopy({ [file]: file });
      });
  });
  collectSecuredStaticFiles('secured', fs, path).forEach((file) => {
      eleventyConfig.addPassthroughCopy({ [file]: file });
  });

  eleventyConfig.ignores.add("dist/**");
  eleventyConfig.ignores.add(".claude/**");
  eleventyConfig.ignores.add("**/page.njk");
  eleventyConfig.ignores.add("services/training/detail.njk");
  eleventyConfig.ignores.add("header/*.njk");
  eleventyConfig.ignores.add("footer/*.njk");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    pathPrefix: PATH_PREFIX ? `${PATH_PREFIX}/` : '/',
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk"]
  };
};
