// A zip of a folder on disk, hidden files and `.git` included, written with
// nothing but Node's own zlib.
//
// `git archive` makes a zip of a commit's tree, so it can never hold the
// `.git` a clone has, and `zip` is not a tool every build image ships. The
// format needs little: per file a local header and its data, then a central
// directory and its end record. Names, modes and times are what make two zips
// of the same folder the same bytes:
//
// - entries are sorted, so the order does not depend on the file system;
// - every entry carries one time, given by the caller, so a rebuild of the same
//   commit gives the same zip;
// - the mode goes in as a Unix one, so an unzip on macOS or Linux restores the
//   executable bit, and git's read-only packs stay read-only, as in a clone.
//   Windows ignores it.
import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';

/** Every path under `dir`, relative to it with `/` separators, folders before what is in them. */
function walk(dir, prefix = '') {
  const entries = [];
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    const relative = `${prefix}${name}`;
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) throw new Error(`zip: ${relative} is a symbolic link, which this writer does not store`);
    if (stat.isDirectory()) {
      entries.push({ name: `${relative}/`, full, mode: stat.mode });
      entries.push(...walk(full, `${relative}/`));
    } else {
      entries.push({ name: relative, full, mode: stat.mode });
    }
  }
  return entries;
}

/** A date as the 2 16-bit MS-DOS fields a zip stores, read in UTC so the build machine's zone does not matter. */
function dosTime(date) {
  const time = (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2);
  const day = ((date.getUTCFullYear() - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate();
  return { time, day };
}

/**
 * Zip everything under `sourceDir` into `zipFile`, each entry named `<prefix>/<path>`.
 * `mtime` is the one time every entry gets.
 */
export function writeZip(sourceDir, prefix, zipFile, mtime) {
  const { time, day } = dosTime(mtime);
  const entries = [{ name: `${prefix}/`, mode: lstatSync(sourceDir).mode }, ...walk(sourceDir, `${prefix}/`)];

  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const isDir = entry.name.endsWith('/');
    const data = isDir ? Buffer.alloc(0) : readFileSync(entry.full);
    const deflated = isDir ? data : deflateRawSync(data, { level: 9 });
    // Stored rather than deflated when deflating does not help, as for a git pack.
    const method = !isDir && deflated.length < data.length ? 8 : 0;
    const body = method === 8 ? deflated : data;
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed: 2.0
    local.writeUInt16LE(0x0800, 6); // names are UTF-8
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4); // made by: Unix, 2.0, so the mode below counts
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    // Extra field, comment, disk number and internal attributes stay 0.
    central.writeUInt32LE(((entry.mode & 0xffff) * 0x10000 + (isDir ? 0x10 : 0)) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);

    offset += local.length + name.length + body.length;
  }

  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);

  if (entries.length > 0xffff || offset + directory.length > 0xffffffff) {
    throw new Error(`zip: ${zipFile} needs zip64, which this writer does not do`);
  }
  writeFileSync(zipFile, Buffer.concat([...locals, directory, end]));
}
