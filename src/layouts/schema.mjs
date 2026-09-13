// The site's structured data, in one place.
//
// Every public page carries the same two nodes — the company and the site — and
// adds whatever it is itself: a `Service` on a service page, a `BlogPosting` on
// an article, `Person` on the team page, a `BreadcrumbList` on anything below
// the homepage. `basePage` merges the two halves into one `@graph`, which is
// what lets a page-specific node point at the company with `{"@id": …}`.
//
// One rule: nothing in here may say something the page does not. Everything is
// read off the same `t()` keys the visible page is built from, so a claim in the
// graph cannot outlive the sentence it was made from.
import { SITE_ORIGIN, absolute, defaultLanguage, languages, pagePath } from '../../build/lib/i18n.mjs';
import { EMAIL, PHONE } from '../components/contact-form/contact-form.mjs';

export const LINKEDIN_URL = 'https://www.linkedin.com/company/smartagents-be/';

/* Stable node identities. A `@id` is what makes the graph a graph rather than a
   pile of repeated objects. They are fragment URLs on the origin, not on the
   page, so the company node is the same node on all 57 pages. */
export const ORGANISATION_ID = `${SITE_ORIGIN}/#organisation`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const founderId = (key) => `${SITE_ORIGIN}/#${key}`;

/** The default share card, 1200×630 (scripts/make-social-images.mjs). */
export const OG_IMAGE = {
  href: '/media/og-default.png',
  width: 1200,
  height: 630
};

/**
 * The two founders. Names, portraits and profile URLs live in
 * `src/pages/team.mjs`, where the page renders them; this is the same list keyed
 * for the graph, short enough that duplicating it costs less than a shared
 * module both would import.
 */
const FOUNDERS = [
  { key: 'axel', name: 'Axel Segers', linkedin: 'https://www.linkedin.com/in/axelsegers/' },
  { key: 'tom', name: 'Tom Haeldermans', linkedin: 'https://www.linkedin.com/in/tom-haeldermans-862172117/' }
];

/**
 * The registered seat, split into the fields schema.org wants. The footer prints
 * the two as one line, because a reader reads an address as a line.
 * They are the register's own values (KBO/BCE, enterprise number 1037.114.694)
 * and the same in all three languages, so they are constants rather than keys —
 * only the country's *name* translates, and `addressCountry` takes the ISO code.
 */
const SEAT = {
  postalCode: '3580',
  addressLocality: 'Beringen',
  addressCountry: 'BE'
};

/** `BE 1037.114.694` as the VAT identifier wants it: no spaces, no dots. */
const VAT_ID = 'BE1037114694';

/** Drops keys with no value, so an absent field is absent rather than null. */
function node(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined && value !== null));
}

/** An `ImageObject` for a file under /media/, with the dimensions it really has. */
export function imageNode(href, width, height) {
  return node({
    '@type': 'ImageObject',
    url: absolute(href),
    width,
    height
  });
}

/* ------------------------------------------------------------------ *
 * The two nodes every page carries
 * ------------------------------------------------------------------ */

export function organisationNode(t) {
  return node({
    '@type': 'Organization',
    '@id': ORGANISATION_ID,
    name: 'SmartAgents',
    legalName: t('footer.company'),
    url: SITE_ORIGIN,
    logo: imageNode('/media/smartagents-mark.png', 512, 512),
    image: imageNode(OG_IMAGE.href, OG_IMAGE.width, OG_IMAGE.height),
    description: t('home.description'),
    email: EMAIL,
    telephone: PHONE,
    vatID: VAT_ID,
    address: node({
      '@type': 'PostalAddress',
      streetAddress: t('footer.street'),
      ...SEAT
    }),
    areaServed: { '@type': 'Country', name: 'Belgium' },
    founder: FOUNDERS.map((founder) => ({ '@id': founderId(founder.key) })),
    sameAs: [LINKEDIN_URL]
  });
}

export function websiteNode(t) {
  return node({
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_ORIGIN,
    name: 'SmartAgents',
    description: t('home.description'),
    publisher: { '@id': ORGANISATION_ID },
    inLanguage: languages.map((language) => language.code)
  });
}

/* ------------------------------------------------------------------ *
 * What a page adds
 * ------------------------------------------------------------------ */

/**
 * The trail from the language root to this page. Emitted by every page below
 * the homepage and by nothing else, because a breadcrumb whose only step is the
 * page you are on is not a trail.
 *
 * @param {Array<{name: string, url: string}>} steps — the root first, this page last.
 */
export function breadcrumbNode(steps) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: steps.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: absolute(step.url)
    }))
  };
}

/** One of the four things the company sells, as its own page says it. */
export function serviceNode({ t, lang, url, key }) {
  return node({
    '@type': 'Service',
    '@id': `${absolute(url)}#service`,
    name: t(`service.${key}.title`),
    description: t(`service.${key}.body`),
    serviceType: t(`service.${key}.title`),
    url: absolute(url),
    provider: { '@id': ORGANISATION_ID },
    areaServed: { '@type': 'Country', name: 'Belgium' },
    inLanguage: lang
  });
}

/**
 * One course the training page sells a detail page for. `Course` rather than a
 * second `Service`: the training page already carries the `Service`, and this is
 * one named thing inside it with a duration, a group size and two languages, all
 * printed in the spec strip the reader sees.
 *
 * Nothing here is a fact the page does not state. The price is not in the graph
 * because the page does not quote one, and neither is a `location`: the day is
 * held at the client's office, so the only address we could name is the one
 * place the course is not.
 *
 * The `Course` carries no `inLanguage` either, and that one is a trap: read off
 * `lang` it told a French reader the course is given in French while the spec
 * strip beside it said "Néerlandais ou anglais". The page's language and the
 * course's language are two different facts.
 *
 * `teaches` is the theme's name *and* its sentence, joined the way the row
 * prints them: six bare nouns on their own assert nothing.
 *
 * The page hands over its own `key`, themes and facts, the way `serviceNode`
 * takes a key, so a second course page needs no change here. The facts were
 * literals in the `CourseInstance` below, which left the page free to change its
 * length and go on telling a crawler the old one.
 */
export function courseNode({ t, url, key, themes, facts }) {
  return node({
    '@type': 'Course',
    '@id': `${absolute(url)}#course`,
    name: t(`${key}.hero.title`),
    description: t(`${key}.description`),
    url: absolute(url),
    provider: { '@id': ORGANISATION_ID },
    teaches: themes.map((theme) => `${t(`${key}.theme.${theme}.title`)}: ${t(`${key}.theme.${theme}.body`)}`),
    hasCourseInstance: node({
      '@type': 'CourseInstance',
      courseMode: facts.mode,
      courseWorkload: facts.workload,
      inLanguage: facts.languages,
      minimumAttendeeCapacity: facts.group[0],
      maximumAttendeeCapacity: facts.group[1]
    })
  });
}

/**
 * One article. `author` is the company rather than a person: the pieces are
 * published under the SmartAgents byline and the site prints no byline of its
 * own, and inventing one here would be the exact thing the rule at the top of
 * this file forbids.
 */
export function articleNode({ t, lang, url, key, published, image }) {
  return node({
    '@type': 'BlogPosting',
    '@id': `${absolute(url)}#article`,
    headline: t(`article.${key}.title`),
    description: t(`article.${key}.body`),
    image,
    datePublished: published,
    dateModified: published,
    author: { '@id': ORGANISATION_ID },
    publisher: { '@id': ORGANISATION_ID },
    inLanguage: lang,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: absolute(url)
  });
}

/** The founders, for the team page. */
export function founderNodes(t) {
  return FOUNDERS.map((founder) =>
    node({
      '@type': 'Person',
      '@id': founderId(founder.key),
      name: founder.name,
      description: t(`team.person.${founder.key}.body`),
      image: absolute(`/media/team/${founder.key}-440.jpg`),
      worksFor: { '@id': ORGANISATION_ID },
      sameAs: [founder.linkedin]
    })
  );
}

/* ------------------------------------------------------------------ *
 * The document
 * ------------------------------------------------------------------ */

/**
 * The whole graph for one rendered page: the company, the site, and whatever
 * the page module contributed.
 */
export function schemaGraph({ t, extra = [] }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organisationNode(t), websiteNode(t), ...extra]
  };
}

/** The language root, for the first step of every breadcrumb. */
export const homeStep = (t, lang) => ({ name: t('nav.home'), url: pagePath(lang) });

export { defaultLanguage };
