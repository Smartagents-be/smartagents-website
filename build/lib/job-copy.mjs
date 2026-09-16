import { readFileSync } from 'node:fs';

const copy = JSON.parse(readFileSync(new URL('../../src/content/jobs/editorial-copy.json', import.meta.url), 'utf8'));

// Odoo credentials are not available locally. Keep reviewed corrections through
// live reads and snapshot refreshes, without replacing a job's whole description.
// An edited or additional source sentence passes through unchanged.
export function applyEditorialCopy(byLang) {
  return Object.fromEntries(Object.entries(byLang).map(([lang, jobs]) => [
    lang,
    jobs.map((job) => {
      const entry = copy[job.slug];
      if (!entry) return job;
      /* Both halves of an entry are optional. A file that corrects only the
         points of a job, or only its location, is a reasonable thing to write
         and nothing upstream validates it. `readVacancies` has no catch around
         this, so a half-written entry would fail the build instead of falling
         back to what Odoo said. */
      return {
        ...job,
        // A point is now `{ type, text }`; a correction matches and replaces the
        // text only, so a reviewed rewrite can never turn a paragraph into a
        // bullet or the reverse — that distinction is read off Odoo's own markup,
        // not from this file.
        points: job.points.map((point) => {
          const match = entry.points?.find((item) => item.sources?.includes(point.text));
          return match ? { ...point, text: match[lang] || point.text } : point;
        }),
        location: entry.locations?.[job.location]?.[lang] || job.location
      };
    })
  ]));
}
