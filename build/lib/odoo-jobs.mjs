// The open vacancies, read from Odoo Recruitment at build time.
//
// Odoo owns the list, and each vacancy's action goes to that job's own Odoo
// application form, so a candidate lands in Recruitment rather than in the
// contact webhook. What is authored in this repo is the chrome around it, plus
// the reviewed sentence corrections in `src/content/jobs/editorial-copy.json`,
// which match exact source sentences so Odoo stays authoritative.
//
// Three sources, tried in order, and the build never fails on any of them:
//
//   1. **The external API**, when `ODOO_LOGIN` and `ODOO_API_KEY` are set.
//      JSON-RPC against `hr.job`, filtered on `is_published`: real field names,
//      a real published flag, and an unpublished job disappears at once.
//   2. **The public jobs page**, when they are not. No credentials, but it is
//      Odoo's own theme markup, and Odoo restyles its themes on SaaS upgrades —
//      which is what the sanity check below is for.
//   3. **The committed snapshot**, when neither answers or what came back does
//      not look like a job list. A stale vacancy is recoverable; a red build on
//      main is the site not deploying at all.
//
// **The API key never reaches a browser.** It is used for one call from the
// build container, and `scripts/check-dist.mjs` fails the build if its value
// turns up anywhere in the output. Two things have to be true on the Odoo side:
// the key belongs to a user with read access to Recruitment and nothing else (an
// Odoo API key carries that user's full rights), and it lives in a Pages build
// variable marked as a secret.
//
// Language: Odoo is asked for whichever of its own languages best serves each of
// the site's three, and for English when it has none of them. Only *active*
// languages may be asked for — an inactive code is an error, not a soft
// fallback. Today `en_US` is the only active language, so all three resolve to
// it and the list is fetched once. "English" there means Odoo's `en_US`, where a
// translatable field's source value is stored, so a job typed in Dutch under an
// English UI comes back as that Dutch text.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { languages } from './i18n.mjs';
import { applyEditorialCopy } from './job-copy.mjs';

/** Where the recruitment site lives. Overridable for a staging database. */
export const ODOO_ORIGIN = (process.env.ODOO_ORIGIN || 'https://smartagents.odoo.com').replace(/\/$/, '');

/* Odoo Online names the database after the subdomain. Confirmed by probing
   `common.authenticate`, which answers `false` for a database that exists and
   errors for one that does not. */
const ODOO_DB = process.env.ODOO_DB || 'smartagents';
const ODOO_LOGIN = process.env.ODOO_LOGIN;
const ODOO_API_KEY = process.env.ODOO_API_KEY;

/**
 * Site language -> the Odoo languages that would serve it, best first.
 *
 * A preference list rather than one code, because Odoo distinguishes `nl_BE`
 * from `nl_NL` and `fr_BE` from `fr_FR` and a recruitment site may have
 * installed either. Whichever is active first wins.
 */
const ODOO_LANG = { nl: ['nl_BE', 'nl_NL'], en: ['en_US'], fr: ['fr_BE', 'fr_FR'] };

/**
 * What a site language falls back to when Odoo has none of its own: English,
 * deliberately, not the site's own default of Dutch. Odoo stores a translatable
 * field's source value under `en_US` and hands that back for any language it has
 * no translation for, so English is already what an untranslated job arrives in.
 * It also has to be a language Odoo will accept: asking for an inactive one is
 * `Invalid language code` and a failed read.
 */
const ODOO_FALLBACK_LANG = 'en_US';

/** A slow recruitment site must not hold a deploy open. Per request. */
const TIMEOUT_MS = 8000;

/**
 * And the whole live read, however many requests it takes, gets this.
 * `TIMEOUT_MS` bounds one socket; nothing bounded the chain of them, and an
 * authenticate plus a read per language could each sit at the full eight
 * seconds before falling back to a snapshot that is committed in this
 * repository. Generous against the sub-second a healthy Odoo answers in.
 */
const BUDGET_MS = 20000;

const SNAPSHOT_PATH = 'src/content/jobs/odoo-snapshot.json';

/* ------------------------------------------------------------------ *
 * The shape everything is normalised to
 * ------------------------------------------------------------------ */

/**
 * One vacancy as the page needs it. Every field is either a string the page
 * escapes on the way out or a list of them; no HTML from Odoo is ever passed
 * through, because Odoo's job description is authored in a rich-text editor by
 * someone who is not thinking about this site's markup.
 *
 * @typedef {object} Vacancy
 * @property {string} slug      Odoo's own url segment, and this page's id key
 * @property {string} title
 * @property {string[]} points  what the job is, one line per point
 * @property {string|null} location
 * @property {string} url       the job on Odoo
 * @property {string} applyUrl  its application form
 */

/** Collapses whitespace and drops the leading dash Odoo's editor bullets use. */
const clean = (value) =>
  String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .replace(/^[-•–—]\s*/, '')
    .trim();

const decodeEntities = (value) =>
  value
    .replace(/&(?:amp|#38);/g, '&')
    .replace(/&(?:lt|#60);/g, '<')
    .replace(/&(?:gt|#62);/g, '>')
    .replace(/&(?:quot|#34);/g, '"')
    .replace(/&(?:apos|#39);/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

/**
 * Rich text from Odoo to a list of lines. `<br>`, `</p>` and `</li>` are the
 * three things that end a line in what its editor produces; everything else is
 * dropped, entities are decoded once, and empty lines go.
 */
function linesFromHtml(value) {
  if (!value) return [];
  return decodeEntities(
    String(value)
      .replace(/<(?:script|style)[\s\S]*?<\/(?:script|style)>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|li|div|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .split('\n')
    .map(clean)
    .filter(Boolean);
}

/** A vacancy is usable when it can be named and linked to. */
const isUsable = (job) => Boolean(job && job.title && job.slug);

function normalise({ slug, title, points, location }) {
  const cleanSlug = clean(slug).replace(/^\/+|\/+$/g, '');
  return {
    slug: cleanSlug,
    title: clean(title),
    points: (points || []).map(clean).filter(Boolean),
    location: clean(location) || null,
    url: `${ODOO_ORIGIN}/jobs/${cleanSlug}`,
    applyUrl: `${ODOO_ORIGIN}/jobs/apply/${cleanSlug}`
  };
}

/* ------------------------------------------------------------------ *
 * Source 1 — the external API
 * ------------------------------------------------------------------ */

async function rpc(service, method, args) {
  const response = await fetch(`${ODOO_ORIGIN}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service, method, args }, id: 1 }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });

  if (!response.ok) throw new Error(`Odoo JSON-RPC answered ${response.status}`);

  const payload = await response.json();
  // A JSON-RPC fault is a 200 with an `error` member, so the status above says
  // nothing on its own. The message is Odoo's; the key is never in it.
  if (payload.error) {
    throw new Error(`Odoo JSON-RPC: ${payload.error.data?.message || payload.error.message}`);
  }
  return payload.result;
}

/**
 * Every published job, in one language.
 *
 * The address is resolved in a second call, to the same city-and-country pair
 * Odoo's own jobs page prints: a many2one's display name is the partner's postal
 * address, which is not what the recruitment site shows, so the two fields are
 * read and joined the way Odoo joins them. Both sources have to produce the
 * identical string, or a vacancy changes its location text when a build falls
 * back from the API to the public page.
 *
 * Odoo returns the country in the recruitment site's own language rather than
 * the reader's. That is Odoo's to fix; it is not rewritten here.
 */
async function fromApi(odooLang, uid) {
  const rows = await rpc('object', 'execute_kw', [
    ODOO_DB,
    uid,
    ODOO_API_KEY,
    'hr.job',
    'search_read',
    [[['is_published', '=', true]]],
    {
      fields: ['name', 'website_url', 'website_description', 'description', 'address_id'],
      context: { lang: odooLang }
    }
  ]);

  if (!Array.isArray(rows)) throw new Error('Odoo JSON-RPC returned no list of jobs');

  const cities = await citiesFor(rows, uid);

  return rows
    .map((row) =>
      normalise({
        // `website_url` is `/jobs/<slug>-<id>`; the slug is the last segment.
        slug: String(row.website_url || '').split('/').filter(Boolean).pop(),
        title: row.name,
        points: linesFromHtml(row.website_description || row.description),
        location: Array.isArray(row.address_id) ? cities.get(row.address_id[0]) || null : null
      })
    )
    .filter(isUsable);
}

/**
 * Location per address id, in one read, as "City, Country". An address the key
 * may not read is not an error: the vacancy simply prints without a place,
 * which is what a job with no address on it does anyway.
 */
async function citiesFor(rows, uid) {
  const ids = [...new Set(rows.map((row) => (Array.isArray(row.address_id) ? row.address_id[0] : null)).filter(Boolean))];
  if (ids.length === 0) return new Map();

  try {
    const partners = await rpc('object', 'execute_kw', [
      ODOO_DB,
      uid,
      ODOO_API_KEY,
      'res.partner',
      'read',
      [ids],
      { fields: ['city', 'country_id'] }
    ]);
    return new Map(
      (partners || []).map((partner) => [
        partner.id,
        [clean(partner.city), Array.isArray(partner.country_id) ? clean(partner.country_id[1]) : '']
          .filter(Boolean)
          .join(', ')
      ])
    );
  } catch {
    return new Map();
  }
}

/* ------------------------------------------------------------------ *
 * Source 2 — the public jobs page
 * ------------------------------------------------------------------ */

/**
 * Odoo prints how many jobs the page found, in its own search bar, and that is
 * the one thing here that is not markup we are guessing at. It tells an empty
 * list apart from a broken parse, which are the same zero otherwise.
 */
function reportedCount(html) {
  const match = html.match(/o_search_count[^>]*>\s*(\d+)\s*</);
  return match ? Number(match[1]) : null;
}

async function fromPublicPage(odooLang) {
  const url = `${ODOO_ORIGIN}/jobs?lang=${encodeURIComponent(odooLang)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);

  const html = await response.text();
  const jobs = [];

  /* One card per job, each field pulled out of that card's own slice of the
     document rather than off the page, so two cards cannot borrow each other's. */
  const cards = html.split(/<div class="card"[^>]*data-publish=/i).slice(1);

  for (const card of cards) {
    const href = card.match(/href="(\/jobs\/[^"#?]+)"/i);
    if (!href) continue;

    const title = card.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const description = card.match(/data-oe-version="[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    /* The location exactly as the recruitment site prints it. Odoo returns the
       country in its own site language rather than the reader's; Odoo owns this
       content and it is not rewritten here. */
    const text = (match) => (match ? clean(decodeEntities(match[1].replace(/<[^>]+>/g, ''))) : '');
    const locality = card.match(/itemprop="addressLocality"[^>]*>([\s\S]*?)<\/span>/i);
    const country = card.match(/itemprop="addressCountry"[^>]*>([\s\S]*?)<\/span>/i);
    const place = [text(locality), text(country)].filter(Boolean).join(', ');

    jobs.push(
      normalise({
        slug: href[1].replace(/^\/jobs\//, ''),
        title: title ? decodeEntities(title[1].replace(/<[^>]+>/g, '')) : '',
        points: description ? linesFromHtml(description[1]) : [],
        location: place
      })
    );
  }

  const usable = jobs.filter(isUsable);
  const reported = reportedCount(html);

  // Odoo says there are jobs and we found none: the theme moved under us.
  if (reported !== null && reported > 0 && usable.length === 0) {
    throw new Error(`${url} reports ${reported} job(s) but none could be read — Odoo's markup has changed`);
  }

  return usable;
}

/* ------------------------------------------------------------------ *
 * Source 3 — the committed snapshot
 * ------------------------------------------------------------------ */

function fromSnapshot(rootDir) {
  const raw = JSON.parse(readFileSync(path.join(rootDir, SNAPSHOT_PATH), 'utf8'));
  const byLang = {};
  for (const language of languages) {
    byLang[language.code] = (raw.jobs?.[language.code] || []).map(normalise).filter(isUsable);
  }
  return { byLang, fetchedAt: raw.fetchedAt || null };
}

/* ------------------------------------------------------------------ *
 * What the build calls
 * ------------------------------------------------------------------ */

/**
 * Site language -> the Odoo language that will serve it. `active` is the list of
 * codes Odoo will accept, or null when that cannot be known (the public page). A
 * site language takes the first of its preferences that is active; failing that,
 * English — see `ODOO_FALLBACK_LANG`.
 */
function resolveLanguages(active) {
  const accepts = active ? new Set(active) : null;
  const resolved = {};

  for (const language of languages) {
    const wanted = ODOO_LANG[language.code] || [];
    resolved[language.code] =
      (accepts ? wanted.find((code) => accepts.has(code)) : wanted[0]) ||
      (accepts && !accepts.has(ODOO_FALLBACK_LANG) ? [...accepts][0] : ODOO_FALLBACK_LANG);
  }

  return resolved;
}

/**
 * Run `read` once per *distinct* Odoo language and hand each site language the
 * result for the language it resolved to. The dedupe is not a
 * micro-optimisation: with only `en_US` active all three site languages resolve
 * to it, and the build would otherwise ask Odoo the same question three times.
 */
async function byResolvedLanguage(resolved, read) {
  /* In parallel: the reads are independent, and in series three timeouts is 24
     seconds of a deploy. The dedupe above usually leaves one read anyway; this
     is for the day a second language is installed in Odoo. */
  const wanted = [...new Set(Object.values(resolved))];
  const answers = await Promise.all(wanted.map((odooLang) => read(odooLang)));
  const results = new Map(wanted.map((odooLang, i) => [odooLang, answers[i]]));

  return Object.fromEntries(
    Object.entries(resolved).map(([code, odooLang]) => [code, results.get(odooLang) || []])
  );
}

/**
 * Read every published vacancy, in every language the site is built in.
 *
 * @param {object} options
 * @param {string} options.rootDir  repository root, for the snapshot
 * @param {boolean} [options.live]  false to skip the network entirely and read
 *                                  the snapshot — what `npm run dev` and the
 *                                  offline checks want
 * @returns {Promise<{source: string, byLang: Record<string, Vacancy[]>, warning: string|null}>}
 */
async function readRawVacancies({ rootDir, live = true }) {
  if (!live) {
    return { source: 'snapshot', ...fromSnapshot(rootDir), warning: null };
  }

  const attempts = [];

  if (ODOO_LOGIN && ODOO_API_KEY) {
    attempts.push([
      'api',
      async () => {
        const uid = await rpc('common', 'authenticate', [ODOO_DB, ODOO_LOGIN, ODOO_API_KEY, {}]);
        if (!uid) throw new Error('Odoo refused the login and API key');

        /* Which languages Odoo will actually accept — the whole reason the API
           path is worth having over the public one: asking for an inactive
           language is an error, and only the database can say which are on. */
        const active = await rpc('object', 'execute_kw', [
          ODOO_DB,
          uid,
          ODOO_API_KEY,
          'res.lang',
          'search_read',
          [[['active', '=', true]]],
          { fields: ['code'] }
        ]);

        return byResolvedLanguage(resolveLanguages((active || []).map((row) => row.code)), (odooLang) =>
          fromApi(odooLang, uid)
        );
      }
    ]);
  }

  attempts.push([
    'public page',
    async () => {
      /* No credentials, so no way to ask which languages are installed. Odoo
         serves English for a language it does not have, which is the answer the
         resolver reaches anyway. */
      return byResolvedLanguage(resolveLanguages(null), fromPublicPage);
    }
  ]);

  const failures = [];

  /* One deadline across every attempt: what is left of the budget is what the
     next attempt gets, and when it is gone the snapshot answers. The timer is
     unref'd so a request still in flight cannot hold the build open. */
  const deadline = Date.now() + BUDGET_MS;
  const withinBudget = (promise) => {
    const left = deadline - Date.now();
    if (left <= 0) return Promise.reject(new Error(`the ${BUDGET_MS} ms budget for Odoo is spent`));
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error(`no answer within ${BUDGET_MS} ms`)), left);
        timer.unref?.();
      })
    ]);
  };

  for (const [source, run] of attempts) {
    try {
      const byLang = await withinBudget(run());
      return { source, byLang, warning: failures.length ? failures.join(' · ') : null };
    } catch (error) {
      failures.push(`${source}: ${error.message}`);
    }
  }

  // Everything live failed. The snapshot is what keeps the deploy green.
  return {
    source: 'snapshot',
    ...fromSnapshot(rootDir),
    warning: `${failures.join(' · ')} — fell back to ${SNAPSHOT_PATH}`
  };
}

/** Correct only reviewed source sentences; Odoo still owns the job list and links. */
export async function readVacancies(options) {
  const result = await readRawVacancies(options);
  return { ...result, byLang: applyEditorialCopy(result.byLang) };
}

export { SNAPSHOT_PATH, ODOO_LANG };
