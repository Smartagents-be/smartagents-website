// How big a one-pager under /media/ is, in kilobytes, read off the file at build
// time. It lives here because two pages print it and those two may not import
// each other: `training.mjs` already imports `kata.mjs`, so the reverse would
// close a cycle. Read rather than written down, because a number typed into a
// string file goes stale the first time a fiche is replaced.
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MEDIA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/media');

export const ficheKilobytes = (file) => Math.round(statSync(path.join(MEDIA_DIR, file)).size / 1024);
