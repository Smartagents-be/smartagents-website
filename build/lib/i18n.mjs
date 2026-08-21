// Build-time i18n. Language is decided here and baked into the HTML; nothing is
// swapped at runtime. See .claude/skills/static-i18n/SKILL.md.
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://smartagents.be';

/** Ordered; the first entry is the default language. */
export const languages = [
  { code: 'nl', name: 'Nederlands', dir: 'ltr', ogLocale: 'nl_BE' },
  { code: 'en', name: 'English', dir: 'ltr', ogLocale: 'en_US' },
  { code: 'fr', name: 'Français', dir: 'ltr', ogLocale: 'fr_BE' }
];

export const defaultLanguage = languages[0];

const missing = [];

export function loadStrings(rootDir) {
  const strings = {};
  for (const language of languages) {
    const file = path.join(rootDir, 'src/i18n', `${language.code}.json`);
    strings[language.code] = JSON.parse(readFileSync(file, 'utf8'));
  }

  // The default language is the source of truth for the key set.
  const expected = Object.keys(strings[defaultLanguage.code]);
  for (const language of languages) {
    if (language.code === defaultLanguage.code) continue;
    for (const key of expected) {
      if (!(key in strings[language.code])) {
        missing.push(`${language.code}.json is missing key "${key}"`);
      }
    }
  }

  return strings;
}

/** t(key, params) — `{name}` placeholders are filled at build time. */
export function createTranslator(strings, langCode) {
  return function t(key, params = {}) {
    const template = strings[langCode][key];
    if (template === undefined) {
      missing.push(`${langCode}.json is missing key "${key}"`);
      return key;
    }
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      name in params ? String(params[name]) : match
    );
  };
}

/** Missing translations fail the build (static-i18n §4). */
export function assertNoMissingTranslations() {
  if (missing.length === 0) return;
  const unique = [...new Set(missing)].sort();
  throw new Error(`Missing translations:\n- ${unique.join('\n- ')}`);
}

/** Absolute URL for a page path. */
export function absolute(urlPath) {
  return new URL(urlPath, SITE_ORIGIN).href;
}

/**
 * Build the full alternate map for one page across every language.
 * `slugs` maps a language code to that language's path segment(s).
 */
export function buildAlternates(slugs) {
  return languages
    .filter((language) => slugs[language.code] !== undefined)
    .map((language) => ({
      code: language.code,
      href: absolute(pagePath(language.code, slugs[language.code]))
    }));
}

/** `/nl/`, `/en/about/` — always language-prefixed, always a trailing slash. */
export function pagePath(langCode, slug = '') {
  const trimmed = String(slug).replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${langCode}/${trimmed}/` : `/${langCode}/`;
}
