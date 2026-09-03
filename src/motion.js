// Page motion: the pointer spotlight and the magnetic dark shapes. Loaded
// lazily from app.js, after paint, so none of it can delay LCP.
//
// Two speeds only (design system, "Motion"): travel is 0.34s ease-out-expo,
// colour is 0.22s ease. Nothing bounces, nothing scales, nothing spins.
// Everything here is decorative: with JS off, or under
// `prefers-reduced-motion`, the page is simply static and fully readable.

const still = matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------ *
 * Spotlight — the one place transparency and blur are allowed
 * ------------------------------------------------------------------ */

function spotlights() {
  for (const element of document.querySelectorAll('[data-spotlight]')) {
    const base = getComputedStyle(element).backgroundImage;

    element.addEventListener(
      'pointermove',
      (event) => {
        const rect = element.getBoundingClientRect();
        const x = (((event.clientX - rect.left) / rect.width) * 100).toFixed(1);
        const y = (((event.clientY - rect.top) / rect.height) * 100).toFixed(1);
        element.style.backgroundImage = `radial-gradient(340px circle at ${x}% ${y}%, rgba(0,216,255,0.13), transparent 70%), ${base}`;
      },
      { passive: true }
    );

    element.addEventListener('pointerleave', () => {
      element.style.backgroundImage = base;
    });
  }
}

/* ------------------------------------------------------------------ *
 * Magnets — a dark shape deforms toward a nearby cursor, and two shapes
 * pulled into each other's reach run together like ferrofluid
 *
 * A shape's own silhouette is the outline itself, moved: every sample slides
 * toward the cursor by a Gaussian in *arc length* along the perimeter, so the
 * swell is a bell with the drawn curvature intact and a stretch of edge that is
 * far along the outline cannot move, however close it happens to lie in the
 * plane. One silhouette, never a seam: the clip path is rewritten, so the swell
 * carries the node field with it instead of revealing an edge.
 *
 * The join between two shapes is the only place a field is used, and it is
 * struck over a small window across the gap rather than over a whole shape.
 * There the outlines are read as `exp(-distance/k)` and summed; the contour
 * where that sum is 1 is the metaball union, which lies outside every outline
 * and necks between two of them with a concave fillet at each body. It is
 * traced by marching squares, smoothed, and appended to the lowest of the
 * shapes it was struck from as extra subpaths under one fill, so the join is a
 * union of one fill with itself and there is nothing to fold, notch or seam.
 * The trace is not the silhouette, though — it is drawn a little inside the
 * union, so wherever the join has lifted the contour by less than that the
 * authored outline is what shows and every apex is exactly as drawn. Outside
 * the window there is no field at all. `k` is scaled by how near the cursor is
 * to the gap, not to either shape: at rest it is zero, and two shapes that
 * merely sit close together stay apart until the cursor comes between them.
 * ------------------------------------------------------------------ */

const POINTS = 220; // per shape, unless data-magnet-points says otherwise
const REACH = 175;
const GRIP = 120; // how far past the edge the cursor keeps the swell alive
const BLEED = 140; // room for a bulge to render outside the resting silhouette
const WELD = 30; // px of a pinned edge over which the pull fades to nothing
const SIDES = ['top', 'right', 'bottom', 'left'];

const MERGE = 46; // px: the blend length of a join at full strength
const SPAN = 2 * MERGE * Math.LN2; // px between two outlines beyond which none can close the gap
const ONSET = 0.94; // share of that gap a join must be under before it is drawn at all
const STEP = 12; // px of arc a coarse step of the nearest-pair search covers
const INSET = 0.5; // px the traced union sits inside itself, so it hands back to the outline under cover
const CELL = 4; // px between field samples in a join window
const CAP = 150; // nodes: a stop on the window, in case a pair of shapes is enormous
const SPREAD = 3.4; // blend lengths past which one shape stops lifting another's contour
const ROUND = 2; // Chaikin passes over a traced loop, so a CELL-px grid reads as a curve
const SPACING = 7; // px between the control points a traced loop is redrawn through
const BUCKET = 64; // px: the spatial hash the displaced segments are struck against

/* Every buffer the join pass needs, kept across frames and only ever grown: a
 * window is rewritten sixty times a second, and handing the collector a fresh
 * megabyte of typed arrays each time is the one cost this pass cannot afford. */
const SIDE = 0;
const VALUES = 1;
const EX = 2;
const EY = 3;
const KNOWN = 4;
const START = 5;
const SEEN = 6;
const HEADS = 7;
const ENTRIES = 8;
const FILL = 9;
const FIELD = 16; // and up: one per shape in a window
const LOOP = 48; // and up: one per magnet on the page
const pool = [];

function scratch(slot, size, Kind) {
  const held = pool[slot];
  if (held && held.length >= size && held.constructor === Kind) return held;
  const made = new Kind(Math.max(size, 1024));
  pool[slot] = made;
  return made;
}


/**
 * The authored outline moved into the grown box: every coordinate pair mapped
 * by `x -> (x·w + BLEED) / (w + 2·BLEED)` and the same in y, which is what
 * growing the element's box by BLEED on all four sides does to unit space.
 *
 * The silhouettes in `clipDefs()` are absolute `M`, `L`, `C` and `Z` and
 * nothing else, so the parse is a scan for numbers between commands. A command
 * this does not know how to move is a silhouette that would land somewhere
 * wrong, so it says so and the caller falls back to the sampled spline.
 */
const SIMPLE_PATH = /^[MLCZ\s,\d.eE+-]+$/;

function remapPathData(d, w, h) {
  if (!SIMPLE_PATH.test(d)) return null;

  const sx = w / (w + 2 * BLEED);
  const tx = BLEED / (w + 2 * BLEED);
  const sy = h / (h + 2 * BLEED);
  const ty = BLEED / (h + 2 * BLEED);

  let axis = 0;
  return d.replace(/-?\d*\.?\d+(?:[eE][+-]?\d+)?/g, (number) => {
    const value = parseFloat(number);
    const mapped = axis === 0 ? value * sx + tx : value * sy + ty;
    axis ^= 1;
    return mapped.toFixed(4);
  });
}

/**
 * Every magnet on the page, measured and grown.
 *
 * Two passes, and the split is not tidiness: pass one only reads the layout and
 * pass two only writes to it. Interleaved — measure a shape, grow it, measure
 * the next — each measurement after the first has to flush the style and layout
 * the previous write invalidated, on a document five thousand pixels tall with
 * five live clip paths in it. That was 117ms of forced synchronous layout for
 * five shapes, and it is what made this too expensive to run before the first
 * paint, which in turn is why the grown boxes arrived a tenth of a second after
 * the page did and scored 0.07 of layout shift. Read everything, then write
 * everything, and it is one layout.
 */
function collectMagnets() {
  const items = [];

  /* Pass one: reads only. Nothing in this loop may touch a style, an attribute
     or the DOM — the moment it does, every `getBoundingClientRect` after it
     pays for a fresh layout. */
  const measured = [];
  for (const element of document.querySelectorAll('[data-magnet]')) {
    const clip = document.getElementById(element.dataset.clip);
    const path = clip && clip.querySelector('path');
    if (!path) continue;

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const scale = (element.offsetWidth ? rect.width / element.offsetWidth : 1) || 1;
    const computed = getComputedStyle(element);

    measured.push({
      element,
      path,
      // Intricate curves need denser sampling or a pull reads as a fold. Only
      // the number is read here; the sampling itself is `arm()`'s.
      count: parseInt(element.dataset.magnetPoints, 10) || POINTS,
      w: rect.width / scale,
      h: rect.height / scale,
      scale,
      // Resolved here rather than in pass two: reading a computed inset after
      // the previous shape has been grown is exactly the flush this avoids.
      insets: SIDES.map((side) => parseFloat(computed[side]) || 0),
      // Read before the remap overwrites it: teardown puts the box back to its
      // authored insets, so the path has to go back to the authored outline too.
      original: path.getAttribute('d')
    });
  }

  /* Pass two: writes only. */
  for (const { element, path, count, w, h, scale, insets, original } of measured) {
    // Grow the element's box so a bulge has somewhere to render, then remap the
    // outline into the bigger box: the resting shape is pixel-identical.
    const restore = {};
    SIDES.forEach((side, i) => {
      restore[side] = element.style[side];
      element.style[side] = `${insets[i] - BLEED}px`;
    });

    const guarded = !element.hasAttribute('data-magnet-free');

    // The resting silhouette is the *authored* curve moved into the bigger box,
    // not a spline redrawn through samples of it. Growing the box is an affine
    // map in unit space, and an affine map of a Bézier is the same map applied
    // to its control points, so this is exact where a spline through 480
    // samples is only very close — and it is ten segments where that is four
    // hundred and eighty.
    //
    // It is also what lets the box be grown without sampling anything. Sampling
    // is 111ms on a cold engine for the five shapes on the homepage, almost all
    // of it `getPointAtLength` warming up, and it is only needed for the pull.
    // So the growth happens here, before the first paint, and the sampling
    // waits for `arm()`.
    const resting = remapPathData(original, w, h);
    if (resting) path.setAttribute('d', resting);

    items.push({
      element,
      path,
      // Filled by `arm()`, except where `remapPathData` could not move the
      // authored path and the sampled outline is the only resting shape there
      // is — then it is armed on the spot, below.
      resting,
      count,
      original,
      restore,
      w: w + 2 * BLEED,
      h: h + 2 * BLEED,
      scale,
      outline: null,
      arc: null,
      perimeter: 0,
      turn: 1,
      // A shape whose top or right edge is tucked under the nav or a card must
      // not bulge there; `data-magnet-free` opts out of that guard.
      guarded,
      // How far the outline travels, and how much of it travels with it. Both
      // are per shape: a big shape swells over a wider stretch of its edge than
      // a small one, or the pull reads as a spike rather than as a turn.
      amplitude: parseFloat(element.dataset.magnetAmp) || (guarded ? 92 : 34),
      sigma: parseFloat(element.dataset.magnetSigma) || 96,
      // The page edges the shape hangs from, if any: it stays welded to each of
      // them. A comma-separated list, because a shape tucked into a corner is
      // welded along two sides and a shape spanning a flank along three.
      pins: (element.dataset.magnetPin || '').split(',').map((side) => side.trim()).filter(Boolean),
      active: false,
      // Per-frame state.
      rect: null,
      shape: null, // the displaced outline, in the element's own pixels
      moved: false, // whether that outline differs from the resting one
      reach: Infinity, // px from the cursor to this outline, either side of it
      bridge: '' // extra subpaths this shape shares with a neighbour
    });

    // A silhouette this cannot move as a curve has to be moved as points, and
    // then there is no resting path until it is sampled. Nothing on the site is
    // in that position today; the branch is what makes adding an arc, a
    // quadratic or a relative command a slower shape rather than a broken one.
    if (!resting) arm(items[items.length - 1]);
  }

  return items;
}

/**
 * The half of a magnet the pull needs: the outline as points, its arc length
 * and its winding.
 *
 * Split from the growth above because it is the expensive half and the growth
 * is the urgent one. `getPointAtLength` costs about 85µs a call on a cold
 * engine and about 20µs once it is warm, so the five shapes on the homepage
 * are 111ms the first time and 8ms every time after — and the shapes cannot be
 * grown after the first paint without moving five boxes on a page the visitor
 * is already looking at, which is 0.07 of layout shift. So the box grows before
 * the paint and this runs after it, or on the first pointer move, whichever
 * comes first. Neither costs the visitor anything: there is no pull to draw
 * until the cursor arrives.
 */
function arm(item) {
  if (item.outline) return;

  const { path, count, original, w, h } = item;
  path.setAttribute('d', original);
  const total = path.getTotalLength();
  const sampled = [];
  for (let i = 0; i < count; i++) {
    const point = path.getPointAtLength((total * i) / count);
    sampled.push([point.x, point.y]);
  }

  // Back into the grown box, in unit space and then in the element's own pixels.
  const points = sampled.map(([x, y]) => [
    (x * (w - 2 * BLEED) + BLEED) / w,
    (y * (h - 2 * BLEED) + BLEED) / h
  ]);
  item.resting = item.resting || toPathData(points);
  path.setAttribute('d', item.resting);

  item.outline = points.map(([x, y]) => [x * w, y * h]);

  // Which way the sampled outline is wound. Nothing about a lone shape cares,
  // but a join is handed to one of these as an extra subpath under one fill,
  // and the default `clip-rule: nonzero` turns a loop wound against the body it
  // overlaps into a hole punched through it. The arch on the AI staffing page is
  // wound the other way from every other silhouette on the site, so this cannot
  // be assumed — it is measured.
  item.turn = shoelace(item.outline) < 0 ? -1 : 1;

  // Arc length along the outline, so a bulge falls off along the edge rather
  // than through the shape. Static in the grown box, so it is struck once.
  let perimeter = 0;
  const arc = [0];
  for (let i = 1; i <= item.outline.length; i++) {
    const a = item.outline[i - 1];
    const b = item.outline[i % item.outline.length];
    perimeter += Math.hypot(b[0] - a[0], b[1] - a[1]);
    arc.push(perimeter);
  }
  item.arc = arc;
  item.perimeter = perimeter;
}

/* A closed loop as cubic curves rather than chords: a Catmull-Rom spline
 * through the points, centripetally parameterised so a tight turn rounds
 * instead of cusping or overshooting, written out as the Bézier segments it is
 * equal to. Every join is drawn this way, so wherever the trace leaves a corner
 * — a grid cell the contour turned in, the chord that closes a loop against the
 * window's rim — the silhouette carries a curve through it instead of a point.
 * The bodies stay chords: they are sampled every few pixels off a curve that
 * was smooth to begin with, and the sagitta of a chord that short is a
 * hundredth of a pixel. */
function toCurveData(points, sx, sy) {
  const n = points.length;
  if (n < 3) return '';
  // Centripetal knots: the square root of each chord's length, struck in the
  // pixels the loop was traced in — the box a clip path is written against is
  // not square, and knots taken after the squash would round one axis harder
  // than the other.
  const knot = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    knot[i] = Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])) || 1e-6;
  }
  let data = `M${(points[0][0] * sx).toFixed(4)},${(points[0][1] * sy).toFixed(4)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const here = knot[i];
    const lead = here / (3 * (knot[(i - 1 + n) % n] + here));
    const trail = here / (3 * (here + knot[(i + 1) % n]));
    const c1x = (p1[0] + (p2[0] - p0[0]) * lead) * sx;
    const c1y = (p1[1] + (p2[1] - p0[1]) * lead) * sy;
    const c2x = (p2[0] - (p3[0] - p1[0]) * trail) * sx;
    const c2y = (p2[1] - (p3[1] - p1[1]) * trail) * sy;
    data += `C${c1x.toFixed(4)},${c1y.toFixed(4)} ${c2x.toFixed(4)},${c2y.toFixed(4)} ${(p2[0] * sx).toFixed(4)},${(p2[1] * sy).toFixed(4)}`;
  }
  return `${data}Z`;
}

function toPathData(points) {
  return `${points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(4)},${y.toFixed(4)}`).join('')}Z`;
}

/* ------------------------------------------------------------------ *
 * The join: a metaball union of two nearby outlines, minus both bodies
 * ------------------------------------------------------------------ */

/* Signed distance from every node of a window to a closed polyline: negative
 * inside, positive out, clamped to `band` either way. Exact against the
 * segments within reach, which is what lets the union contour land on the
 * outline itself where only one shape contributes. The window is `cols x rows`
 * nodes of CELL px, its top-left node at (ox, oy).
 *
 * The polyline arrives flat — x, y, x, y — and the hash is two typed arrays
 * rather than an array of arrays. This runs once per shape per window per
 * frame over several thousand nodes, and it is the one place on the site where
 * the shape of the data costs more than the arithmetic. */
function signedDistance(pts, count, cols, rows, ox, oy, band, sd) {
  const nodes = cols * rows;
  sd.fill(band, 0, nodes);
  if (count < 3) return sd;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    const x = pts[2 * i];
    const y = pts[2 * i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  // Inside or out, one scanline per row of nodes.
  const inside = scratch(SIDE, nodes, Uint8Array);
  inside.fill(0, 0, nodes);
  const xs = [];
  for (let j = 0; j < rows; j++) {
    const y = oy + j * CELL;
    if (y < minY || y > maxY) continue;
    xs.length = 0;
    for (let i = 0, k = count - 1; i < count; k = i++) {
      const ay = pts[2 * i + 1];
      const by = pts[2 * k + 1];
      if (ay > y !== by > y) {
        const ax = pts[2 * i];
        const bx = pts[2 * k];
        xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
      }
    }
    xs.sort((a, b) => a - b);
    let cross = 0;
    for (let i = 0; i < cols; i++) {
      const x = ox + i * CELL;
      while (cross < xs.length && xs[cross] < x) cross++;
      inside[j * cols + i] = cross & 1;
    }
  }

  // The segments hashed into coarse buckets over the window, so a node only
  // measures the few that can be nearest. The hash spans the window grown by
  // `band`, and a segment that misses it entirely is further than `band` from
  // every node and is dropped rather than clamped onto the rim — clamping is
  // what makes an outline longer than the window pile onto its edge, and every
  // node along that edge then measures the whole shape. One that only overhangs
  // is still clamped into the rim buckets it reaches, which costs a little and
  // is exact either way: what a bucket holds is a hint, and the distance is
  // measured against the segment itself.
  const bx0 = Math.floor((ox - band) / BUCKET);
  const by0 = Math.floor((oy - band) / BUCKET);
  const bw = Math.floor((ox + (cols - 1) * CELL + band) / BUCKET) + 1 - bx0;
  const bh = Math.floor((oy + (rows - 1) * CELL + band) / BUCKET) + 1 - by0;
  const cells = bw * bh;
  const heads = scratch(HEADS, cells + 1, Int32Array);
  heads.fill(0, 0, cells + 1);

  // A counting sort in place of a bucket of arrays: tally, run the tally into
  // offsets, then write the segments. `heads[n]` ends one bucket along, which
  // is exactly the layout the lookup wants — bucket n runs from heads[n] to
  // heads[n + 1].
  for (let a = 0, b = count - 1; a < count; b = a++) {
    const ax = pts[2 * a];
    const ay = pts[2 * a + 1];
    const bxx = pts[2 * b];
    const byy = pts[2 * b + 1];
    let i0 = Math.floor((ax < bxx ? ax : bxx) / BUCKET) - bx0;
    let i1 = Math.floor((ax > bxx ? ax : bxx) / BUCKET) - bx0;
    let j0 = Math.floor((ay < byy ? ay : byy) / BUCKET) - by0;
    let j1 = Math.floor((ay > byy ? ay : byy) / BUCKET) - by0;
    if (i1 < 0 || j1 < 0 || i0 >= bw || j0 >= bh) continue;
    if (i0 < 0) i0 = 0;
    if (j0 < 0) j0 = 0;
    if (i1 >= bw) i1 = bw - 1;
    if (j1 >= bh) j1 = bh - 1;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) heads[j * bw + i + 1]++;
  }
  let refs = 0;
  for (let n = 1; n <= cells; n++) {
    refs += heads[n];
    heads[n] = refs;
  }
  // Nothing within reach of the window, but the scanline may still have found
  // it enclosing: a shape large enough to swallow the window whole has an
  // outline that misses the hash entirely, and every node in it is inside.
  if (!refs) {
    for (let n = 0; n < nodes; n++) if (inside[n]) sd[n] = -band;
    return sd;
  }
  const entries = scratch(ENTRIES, refs, Int32Array);
  const fill = scratch(FILL, cells, Int32Array);
  for (let n = 0; n < cells; n++) fill[n] = heads[n];
  for (let a = 0, b = count - 1; a < count; b = a++) {
    const ax = pts[2 * a];
    const ay = pts[2 * a + 1];
    const bxx = pts[2 * b];
    const byy = pts[2 * b + 1];
    let i0 = Math.floor((ax < bxx ? ax : bxx) / BUCKET) - bx0;
    let i1 = Math.floor((ax > bxx ? ax : bxx) / BUCKET) - bx0;
    let j0 = Math.floor((ay < byy ? ay : byy) / BUCKET) - by0;
    let j1 = Math.floor((ay > byy ? ay : byy) / BUCKET) - by0;
    if (i1 < 0 || j1 < 0 || i0 >= bw || j0 >= bh) continue;
    if (i0 < 0) i0 = 0;
    if (j0 < 0) j0 = 0;
    if (i1 >= bw) i1 = bw - 1;
    if (j1 >= bh) j1 = bh - 1;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const n = j * bw + i;
        entries[fill[n]++] = a;
      }
    }
  }

  // Everything left unsearched after ring R is at least R buckets away, so
  // stopping at ceil(band / BUCKET) is exact rather than approximate: what it
  // gives up is only distances past `band`, which are clamped anyway. Deriving
  // it from `band` is what keeps that true if the window or the hash changes.
  const rings = Math.ceil(band / BUCKET);
  const reach = band * band;

  for (let j = 0; j < rows; j++) {
    const y = oy + j * CELL;
    if (y < minY - band || y > maxY + band) continue;
    const bj = Math.floor(y / BUCKET) - by0;
    const row = j * cols;
    for (let i = 0; i < cols; i++) {
      const x = ox + i * CELL;
      if (x < minX - band || x > maxX + band) continue;
      const bi = Math.floor(x / BUCKET) - bx0;
      let best = reach;
      for (let ring = 0; ring <= rings; ring++) {
        // Everything in this ring is at least (ring - 1) buckets away.
        const edge = (ring - 1) * BUCKET;
        if (ring > 0 && edge * edge >= best) break;
        const jLo = bj - ring;
        const jHi = bj + ring;
        for (let jj = jLo; jj <= jHi; jj++) {
          if (jj < 0 || jj >= bh) continue;
          const rim = jj === jLo || jj === jHi;
          const step = rim ? 1 : 2 * ring;
          for (let di = -ring; di <= ring; di += step) {
            const ii = bi + di;
            if (ii < 0 || ii >= bw) continue;
            const n = jj * bw + ii;
            for (let e = heads[n], stop = heads[n + 1]; e < stop; e++) {
              const a = entries[e];
              const b = a === 0 ? count - 1 : a - 1;
              const axx = pts[2 * a];
              const ayy = pts[2 * a + 1];
              const ex = pts[2 * b] - axx;
              const ey = pts[2 * b + 1] - ayy;
              let t = ((x - axx) * ex + (y - ayy) * ey) / (ex * ex + ey * ey || 1);
              t = t < 0 ? 0 : t > 1 ? 1 : t;
              const dx = x - axx - ex * t;
              const dy = y - ayy - ey * t;
              const d = dx * dx + dy * dy;
              if (d < best) best = d;
            }
          }
        }
      }
      const n = row + i;
      const d = Math.sqrt(best);
      sd[n] = inside[n] ? -d : d;
    }
  }

  return sd;
}

/* The contour at 0 of a scalar field on a window, as closed loops of points in
 * the window's own pixels. Marching squares, each crossing interpolated
 * linearly. The winding the trace falls into is kept as it is, which is what
 * makes an island between three joined shapes come out wound against the loop
 * around it; whether the whole set is then turned around is the caller's
 * business, because that depends on the body the loops are handed to. */
const corner = new Float64Array(4);
const keys = new Int32Array(4);
const kind = new Int8Array(4); // 1: inside runs out across this edge, -1: back in

function contour(values, cols, rows, ox, oy) {
  const nx = cols - 1;
  const ny = rows - 1;
  const total = nx * rows + cols * ny;
  const ex = scratch(EX, total, Float32Array);
  const ey = scratch(EY, total, Float32Array);
  const known = scratch(KNOWN, total, Uint8Array);
  known.fill(0, 0, total);
  const startAt = scratch(START, total, Int32Array);
  startAt.fill(-1, 0, total);
  const from = [];
  const to = [];

  // Edge keys: a horizontal edge by its left node, a vertical one by its top.
  const hKey = (i, j) => j * nx + i;
  const vKey = (i, j) => nx * rows + j * cols + i;

  const crossing = (key, x0, y0, v0, x1, y1, v1) => {
    if (!known[key]) {
      const t = v0 / (v0 - v1);
      ex[key] = x0 + (x1 - x0) * t;
      ey[key] = y0 + (y1 - y0) * t;
      known[key] = 1;
    }
    return key;
  };

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = values[j * cols + i];
      const b = values[j * cols + i + 1];
      const c = values[(j + 1) * cols + i + 1];
      const d = values[(j + 1) * cols + i];
      const code = (a >= 0 ? 1 : 0) | (b >= 0 ? 2 : 0) | (c >= 0 ? 4 : 0) | (d >= 0 ? 8 : 0);
      if (code === 0 || code === 15) continue;

      const x = ox + i * CELL;
      const y = oy + j * CELL;
      corner[0] = a;
      corner[1] = b;
      corner[2] = c;
      corner[3] = d;

      // Walk the cell clockwise: an edge is crossed where the corner before it
      // and the corner after it disagree. Only those edges are struck — an
      // uncrossed one has no crossing to interpolate, and two corners that are
      // equal (two rim nodes, two saturated interior nodes) would divide by
      // zero and cache a NaN under the edge's key.
      let crossed = 0;
      for (let e = 0; e < 4; e++) {
        const before = corner[e] >= 0;
        const after = corner[(e + 1) % 4] >= 0;
        kind[e] = before === after ? 0 : before ? 1 : -1;
        if (kind[e]) crossed++;
      }
      if (kind[0]) keys[0] = crossing(hKey(i, j), x, y, a, x + CELL, y, b);
      if (kind[1]) keys[1] = crossing(vKey(i + 1, j), x + CELL, y, b, x + CELL, y + CELL, c);
      if (kind[2]) keys[2] = crossing(hKey(i, j + 1), x, y + CELL, d, x + CELL, y + CELL, c);
      if (kind[3]) keys[3] = crossing(vKey(i, j), x, y, a, x, y + CELL, d);

      // A segment runs from where the inside runs out to where it comes back.
      // With four crossings the cell is ambiguous, and its centre decides
      // whether the two inside corners are joined across it.
      const joined = crossed === 4 && a + b + c + d >= 0;
      for (let e = 0; e < 4; e++) {
        if (kind[e] !== 1) continue;
        let f = e;
        if (crossed === 2 || joined) {
          do f = (f + 1) % 4;
          while (kind[f] !== -1);
        } else {
          do f = (f + 3) % 4;
          while (kind[f] !== -1);
        }
        startAt[keys[e]] = from.length;
        from.push(keys[e]);
        to.push(keys[f]);
      }
    }
  }

  const seen = scratch(SEEN, from.length, Uint8Array);
  seen.fill(0, 0, from.length);
  const loops = [];
  for (let s = 0; s < from.length; s++) {
    if (seen[s]) continue;
    let cur = s;
    const loop = [];
    do {
      seen[cur] = 1;
      const key = from[cur];
      loop.push([ex[key], ey[key]]);
      cur = startAt[to[cur]];
    } while (cur >= 0 && cur !== s && !seen[cur]);
    // A run that stopped somewhere other than where it started is a fragment
    // the grid could not close: drawing it would leave a chord across the join.
    if (loop.length < 3 || cur !== s) continue;
    // A loop smaller than a cell is grid noise, not a shape.
    let lx = Infinity;
    let ly = Infinity;
    let hx = -Infinity;
    let hy = -Infinity;
    for (const [x, y] of loop) {
      if (x < lx) lx = x;
      if (x > hx) hx = x;
      if (y < ly) ly = y;
      if (y > hy) hy = y;
    }
    if (hx - lx < CELL && hy - ly < CELL) continue;
    loops.push(loop);
  }
  return loops;
}

/* A marched loop made fit to draw: two Chaikin passes to take the CELL-px
 * staircase out of it, then a resample at even arc length.
 *
 * The resample is what the spline that follows needs. Dropping vertices by how
 * far they stand off a chord — the obvious way to shorten the path — leaves
 * them unevenly spaced, with a few tenths of a pixel of jitter between them,
 * and a Catmull-Rom through points like that overshoots between the far-apart
 * ones and scallops the edge. Even spacing costs a few more points and gives a
 * curve that lies on the loop. */
function smooth(loop) {
  let cur = loop;
  for (let pass = 0; pass < ROUND; pass++) {
    const next = new Array(cur.length * 2);
    for (let i = 0; i < cur.length; i++) {
      const [ax, ay] = cur[i];
      const [bx, by] = cur[(i + 1) % cur.length];
      next[2 * i] = [ax + 0.25 * (bx - ax), ay + 0.25 * (by - ay)];
      next[2 * i + 1] = [ax + 0.75 * (bx - ax), ay + 0.75 * (by - ay)];
    }
    cur = next;
  }

  let perimeter = 0;
  for (let i = 0; i < cur.length; i++) {
    const a = cur[i];
    const b = cur[(i + 1) % cur.length];
    perimeter += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  const count = Math.max(6, Math.round(perimeter / SPACING));
  const stride = perimeter / count;
  const out = [];
  let walked = 0;
  let at = 0;
  let carried = 0;
  for (let n = 0; n < count; n++) {
    const want = n * stride;
    while (at < cur.length) {
      const a = cur[at];
      const b = cur[(at + 1) % cur.length];
      const run = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (carried + run >= want || at === cur.length - 1) {
        const t = run > 0 ? Math.min(1, Math.max(0, (want - carried) / run)) : 0;
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        break;
      }
      carried += run;
      at++;
    }
    walked = want;
  }
  return out.length >= 3 ? out : cur;
}

/* Twice the signed area of a closed polyline: which way it is wound. */
function shoelace(loop) {
  let area = 0;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    area += loop[j][0] * loop[i][1] - loop[i][0] * loop[j][1];
  }
  return area;
}

/* How close two outlines come: a coarse sweep, then the same sweep again over
 * the stretch around the winner. The stride is not a constant — it is chosen so
 * a coarse step is about STEP px of arc on either outline, because a stride
 * that is a fine step on a 200-point pebble is a 47px stride on the arch, and a
 * coarse pass that skips a whole turn reads the gap as wider than it is.
 *
 * Only the distance is wanted, never the place: which of two near-equal gaps
 * wins flips from frame to frame as the shapes move, and anything downstream
 * that leaned on the winner's position would flip with it. */
function closest(a, na, sa, b, nb, sb) {
  const strideA = Math.max(1, Math.round(STEP / sa));
  const strideB = Math.max(1, Math.round(STEP / sb));
  let gap = Infinity;
  let ia = 0;
  let ib = 0;
  for (let i = 0; i < na; i += strideA) {
    const px = a[2 * i];
    const py = a[2 * i + 1];
    for (let j = 0; j < nb; j += strideB) {
      const dx = px - b[2 * j];
      const dy = py - b[2 * j + 1];
      const d = dx * dx + dy * dy;
      if (d < gap) {
        gap = d;
        ia = i;
        ib = j;
      }
    }
  }
  for (let i = ia - strideA; i <= ia + strideA; i++) {
    const p = (i + na) % na;
    const px = a[2 * p];
    const py = a[2 * p + 1];
    for (let j = ib - strideB; j <= ib + strideB; j++) {
      const q = (j + nb) % nb;
      const dx = px - b[2 * q];
      const dy = py - b[2 * q + 1];
      const d = dx * dx + dy * dy;
      if (d < gap) gap = d;
    }
  }
  return Math.sqrt(gap);
}

/* One shape's outline as a flat x, y, x, y run in viewport pixels, struck the
 * first time a window asks for it and kept for the rest of the frame. */
function flatten(S) {
  if (S.loop) return S.loop;
  const { rect, scale } = S.item;
  const loop = scratch(LOOP + S.index, 2 * S.count, Float64Array);
  for (let i = 0; i < S.count; i++) {
    loop[2 * i] = rect.left + S.pts[i][0] * scale;
    loop[2 * i + 1] = rect.top + S.pts[i][1] * scale;
  }
  S.loop = loop;
  return loop;
}

/* Everything the cursor has drawn between two shapes, once per frame.
 *
 * A pair is considered when both are within `SPAN` of each other after they
 * have been displaced, and the strength of the join is how near the cursor is
 * to the gap itself — not to either shape. So a pull the cursor aims elsewhere
 * never quietly welds two shapes together, and at rest nothing joins at all.
 *
 * Everything here works in viewport pixels — where `getBoundingClientRect` and
 * a pointer event agree — and each element remaps the result into its own box
 * when it writes its path. */
function joins(items, cursorX, cursorY, linked) {
  // Every shape the page has, not only the pulled ones: a shape standing still
  // is still something a neighbour's swell can arrive at, and leaving it out of
  // the field would butt the neck against it instead of filleting into it.
  // Its outline in viewport pixels is flattened only if a window actually needs
  // it — most frames strike none.
  const shapes = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (!item.rect) continue;
    const { rect, scale } = item;
    const pts = item.shape || item.outline;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      const x = rect.left + pts[i][0] * scale;
      const y = rect.top + pts[i][1] * scale;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    shapes.push({
      item,
      index,
      pts,
      count: pts.length,
      step: (item.perimeter * scale) / pts.length,
      loop: null,
      minX,
      minY,
      maxX,
      maxY
    });
  }

  for (const item of items) item.bridge = '';
  if (shapes.length < 2) return;

  for (let a = 0; a < shapes.length; a++) {
    for (let b = a + 1; b < shapes.length; b++) {
      const A = shapes[a];
      const B = shapes[b];
      // Only a pair the cursor has actually reached for can join.
      if (!A.item.moved && !B.item.moved) continue;
      if (
        A.maxX + SPAN < B.minX ||
        B.maxX + SPAN < A.minX ||
        A.maxY + SPAN < B.minY ||
        B.maxY + SPAN < A.minY
      ) {
        continue;
      }

      // How close the two displaced outlines come.
      const gap = closest(flatten(A), A.count, A.step, flatten(B), B.count, B.step);

      // Strength: how near the cursor is to the further of the two shapes, so
      // a join needs the cursor to be near both, eased so it arrives and leaves
      // without a step. Nothing else scales it — two shapes that merely sit
      // close stay apart until the cursor comes to them.
      //
      // It is the *distance* to each outline, never the place on it. Distance
      // to a closed curve moves as smoothly as the cursor does; the point that
      // realises it jumps from one side of a shape to the other the moment two
      // approaches tie, and a strength keyed on that jumps with it — which is
      // seen as the whole join flickering as the pointer travels.
      const t = Math.min(1, Math.max(A.item.reach, B.item.reach) / REACH);
      const near = 1 - t * t * (3 - 2 * t);
      const k = MERGE * near;
      // Two outlines facing each other across g join when 2·e^(-g/2k) reaches
      // 1, so g = 2k·ln2 is the widest gap any pair of them can close; a turn
      // in either outline only narrows it. Past that there is nothing to draw
      // and the window is not worth striking. Below k = 6 the blend is shorter
      // than the grid can resolve.
      //
      // A neck is born at that limit with no width at all, and a 4px grid
      // cannot draw a waist thinner than a cell: right at the limit the trace
      // flickers between joined and apart on sub-pixel cursor travel. So a join
      // has to arrive a little inside the limit, where the waist is already
      // tens of pixels wide, and is then held to the limit itself once it is
      // open. It still pinches away smoothly on the way out; what it no longer
      // does is stutter on the way in.
      const key = A.index * items.length + B.index;
      const limit = 2 * k * Math.LN2;
      if (k < 6 || gap > limit * (linked.has(key) ? 1 : ONSET)) {
        linked.delete(key);
        continue;
      }
      linked.add(key);

      // The window is where these two shapes can reach each other: the overlap
      // of their boxes, opened out by how far one still lifts the other's
      // contour. It is not a box around the gap — once two shapes are close
      // enough to run together their outlines cross well away from the
      // narrowest point, and a window centred on that point cuts the fillets
      // off at its rim.
      const spread = SPREAD * k;
      const lx = Math.max(A.minX, B.minX) - spread;
      const hx = Math.min(A.maxX, B.maxX) + spread;
      const ly = Math.max(A.minY, B.minY) - spread;
      const hy = Math.min(A.maxY, B.maxY) + spread;
      const ox = Math.floor(lx / CELL) * CELL;
      const oy = Math.floor(ly / CELL) * CELL;
      // Measured from the origin the floor put down, not from the box, or the
      // last node lands short of the rim by up to a cell.
      const cols = Math.min(Math.ceil((hx - ox) / CELL) + 1, CAP);
      const rows = Math.min(Math.ceil((hy - oy) / CELL) + 1, CAP);
      if (cols < 4 || rows < 4) continue;
      const band = spread + 2 * CELL;
      // What one shape's term is worth at the rim, and so what has to come off
      // every term but the nearest for the lift to be gone by the time the
      // window ends.
      const floor = Math.exp(-spread / k);

      // Every shape that could move the contour inside the window, not just the
      // pair: three shapes meeting is one field, and the island they can leave
      // between them has to come out of the same trace as the loops around it.
      // A shape further than `spread` from the window cannot lift anything
      // there by as much as the floor already takes off, so it is left out.
      const group = [];
      for (const S of shapes) {
        if (
          S.maxX + spread < ox ||
          S.minX - spread > ox + (cols - 1) * CELL ||
          S.maxY + spread < oy ||
          S.minY - spread > oy + (rows - 1) * CELL
        ) {
          continue;
        }
        group.push(S);
      }
      if (group.length < 2) continue;

      const nodes = cols * rows;
      const fields = group.map((S, i) =>
        signedDistance(flatten(S), S.count, cols, rows, ox, oy, band, scratch(FIELD + i, nodes, Float32Array))
      );

      // The union: k·log(the nearest shape's term, plus what the others add).
      // Each shape alone reaches 1 on its own outline, so the contour never
      // cuts inside a body; where two of them are within reach of each other
      // the sum lifts the contour off both and it necks between them with a
      // fillet at each. Nothing is stitched, so there is no seam — and with the
      // floor taken off what the others add, the lift is gone by the rim and
      // the contour there is the outline itself.
      const values = scratch(VALUES, nodes, Float32Array);
      let any = false;
      let sealed = true;
      for (let j = 0; j < rows; j++) {
        const rim = j === 0 || j === rows - 1;
        for (let i = 0; i < cols; i++) {
          const n = j * cols + i;
          let top = 0;
          let extra = 0;
          for (let f = 0; f < fields.length; f++) {
            const sd = fields[f][n];
            const term = sd < 8 * k ? Math.exp(-sd / k) : 0;
            if (term > top) {
              extra += top;
              top = term;
            } else {
              extra += term;
            }
          }
          // Taken off smoothly, not clipped: `max(0, extra - floor)` creases the
          // contour along the level set where the two meet, and a crease in a
          // silhouette is exactly the artifact this whole pass exists to avoid.
          // Below twice the floor the term eases into zero with a matching
          // slope instead, so the join leaves the outline tangentially.
          const over = extra - floor;
          const sum = top + (over > floor ? over : extra > 0 ? (extra * extra) / (4 * floor) : 0);
          // Traced a hair inside the union rather than on it. Where the join
          // has lifted the contour by less than that, the loop runs inside the
          // body and the outline the body draws is the silhouette, so the two
          // hand over under cover rather than crossing in the open. Half a
          // pixel is all it takes: the loop is drawn as a curve, which carries
          // whatever is left of the crossing through as a bend.
          const v = sum > 0 ? k * Math.log(sum) - INSET : -band;
          values[n] = v;
          if (v >= 0) any = true;
          else if (rim || i === 0 || i === cols - 1) sealed = false;
        }
      }
      // Nothing to draw, or a window that fell entirely inside the union: the
      // contour would then be the rim itself, a rectangle of straight lines
      // through the middle of a curve, adding nothing the bodies do not.
      if (!any || sealed) continue;
      for (let i = 0; i < cols; i++) {
        values[i] = -band;
        values[(rows - 1) * cols + i] = -band;
      }
      for (let j = 0; j < rows; j++) {
        values[j * cols] = -band;
        values[j * cols + cols - 1] = -band;
      }

      const loops = contour(values, cols, rows, ox, oy);
      if (!loops.length) continue;

      // The union covers the bodies it was struck from, so it is painted by the
      // one of them that sits lowest: every other shape in the group paints its
      // own body over the top, and nothing a shape carries above a neighbour —
      // the DNA helix over the disc — can be painted out from underneath it.
      const host = group[0].item;

      // Wound the way that host's body is wound, or the nonzero fill rule reads
      // the union as a hole punched through it. The trace keeps its own
      // relative winding, so an island between three shapes stays wound against
      // the loop around it and is painted as the paper it is; what decides
      // whether the whole set is turned around is the areas summed, which is
      // the area of the region itself — asking the largest loop instead would
      // turn the set inside out on a window where the rim happened to cut the
      // outer loop smaller than an island inside it.
      let wound = 0;
      for (const loop of loops) wound += shoelace(loop);
      if (wound * host.turn < 0) for (const loop of loops) loop.reverse();

      // Into the host's own pixels first, so the spline is struck on the shape
      // as it is drawn, and squashed into the unit box only as it is written.
      const { rect, scale, w, h } = host;
      for (const loop of loops) {
        for (const point of loop) {
          point[0] = (point[0] - rect.left) / scale;
          point[1] = (point[1] - rect.top) / scale;
        }
        host.bridge += toCurveData(smooth(loop), 1 / w, 1 / h);
      }
    }
  }
}

function magnets() {
  let items = collectMagnets();
  if (!items.length) return;

  /* The sampling half, run once, whenever it is first needed. Idle time is the
     usual answer; the first pointer move is the deadline, because that is the
     first frame that has a pull to draw. */
  let armed = false;
  const armAll = () => {
    if (armed) return;
    armed = true;
    for (const item of items) arm(item);
  };
  const idle = window.requestIdleCallback
    ? requestIdleCallback(armAll, { timeout: 1200 })
    : setTimeout(armAll, 200);

  // Which pairs are currently run together, so a join arrives at one gap and
  // lets go at a slightly wider one instead of flickering at a single width.
  const linked = new Set();

  const rest = (item) => {
    item.shape = null;
    item.moved = false;
    item.bridge = '';
    if (!item.active) return;
    item.path.setAttribute('d', item.resting);
    item.active = false;
  };

  // One shape's displaced outline: the committed deformation, unchanged. The
  // outline is what moves, so every curve keeps the shape it was drawn with and
  // a stretch of edge far along the perimeter cannot follow the cursor.
  const displace = (item, cursorX, cursorY) => {
    const rect = item.element.getBoundingClientRect();
    item.rect = rect;
    item.shape = null;
    item.moved = false;
    item.reach = Infinity;
    if (!rect.width || !rect.height) return;

    const { scale } = item;
    const x = (cursorX - rect.left) / scale;
    const y = (cursorY - rect.top) / scale;

    const { outline, arc, perimeter, w, h } = item;
    let nearest = 0;
    let best = Infinity;
    let inside = false;
    for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
      if (
        outline[i][1] > y !== outline[j][1] > y &&
        x <
          ((outline[j][0] - outline[i][0]) * (y - outline[i][1])) /
            (outline[j][1] - outline[i][1]) +
            outline[i][0]
      ) {
        inside = !inside;
      }
      const d = Math.hypot(x - outline[i][0], y - outline[i][1]);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }

    // How far the cursor stands from this outline, whichever side of it: what
    // a join is scaled by, and the one measure of nearness that cannot jump.
    item.reach = best * scale;

    // Crossing the edge holds the swell where it is instead of snapping it
    // back: the shape lets go only once the cursor is well inside.
    if (inside) {
      if (best <= GRIP) item.shape = outline;
      return;
    }
    if (best > REACH) return;
    if (item.guarded && (outline[nearest][1] < BLEED + 4 || outline[nearest][0] > w - BLEED - 4)) {
      return;
    }

    // Peak pull at mid-reach, where the turn stretches furthest. It eases off
    // again at the far limit and as the cursor comes back onto the edge, so
    // neither approach nor contact has a step in it.
    const t = best / REACH;
    const bell = Math.sin(Math.PI * t) ** 0.85;
    // The tip reaches toward the cursor, never past it.
    const amplitude = Math.min(item.amplitude * bell, best * 1.08);
    const sigma = item.sigma * (0.76 + 0.36 * bell); // widest where the swell is deepest
    const dx = (x - outline[nearest][0]) / (best || 1);
    const dy = (y - outline[nearest][1]) / (best || 1);

    item.shape = outline.map(([px, py], i) => {
      let along = Math.abs(arc[i] - arc[nearest]);
      if (along > perimeter / 2) along = perimeter - along;
      const falloff = Math.exp(-((along / sigma) ** 2));
      let ux = dx * amplitude * falloff;
      let uy = dy * amplitude * falloff;

      // A pinned shape stays welded to every page edge it hangs from: the pull
      // fades to nothing over the last WELD pixels before each of them.
      for (const pin of item.pins) {
        const edge =
          pin === 'left'
            ? px - BLEED
            : pin === 'right'
              ? w - BLEED - px
              : pin === 'top'
                ? py - BLEED
                : h - BLEED - py;
        const weld = Math.min(1, Math.max(0, edge) / WELD);
        if (pin === 'left' || pin === 'right') ux *= weld;
        else uy *= weld;
      }

      return [px + ux, py + uy];
    });
    item.moved = true;
  };

  const update = (cursorX, cursorY) => {
    armAll();
    let pulled = false;
    for (const item of items) {
      displace(item, cursorX, cursorY);
      if (item.shape) pulled = true;
    }
    if (!pulled) {
      linked.clear();
      items.forEach(rest);
      return;
    }

    joins(items, cursorX, cursorY, linked);

    for (const item of items) {
      if (!item.shape && !item.bridge) {
        rest(item);
        continue;
      }
      const body = item.moved
        ? toPathData(item.shape.map(([x, y]) => [x / item.w, y / item.h]))
        : item.resting;
      item.path.setAttribute('d', body + item.bridge);
      item.active = true;
    }
  };

  // One rewrite per frame, not per event: the hero shapes are sampled at ~480
  // points each and a fine pointer fires well above 60Hz.
  let queuedX = 0;
  let queuedY = 0;
  let frame = 0;

  const onMove = (event) => {
    queuedX = event.clientX;
    queuedY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update(queuedX, queuedY);
    });
  };
  const onLeave = () => {
    linked.clear();
    items.forEach(rest);
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);

  return () => {
    if (frame) cancelAnimationFrame(frame);
    if (window.requestIdleCallback) cancelIdleCallback(idle);
    else clearTimeout(idle);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    for (const item of items) {
      item.path.setAttribute('d', item.original);
      for (const side of SIDES) item.element.style[side] = item.restore[side];
    }
    items = [];
    // The narrow layouts never strike a window, so nothing should be holding a
    // window's worth of buffers once the magnets are gone.
    pool.length = 0;
  };
}

/* ------------------------------------------------------------------ *
 * Wire-up
 * ------------------------------------------------------------------ */

if (!still.matches) {
  spotlights();

  // The magnets only make sense with a real pointer and a desktop layout; the
  // narrow layouts swap in different clip paths.
  const magnetic = matchMedia('(min-width: 1081px) and (hover: hover) and (pointer: fine)');
  let teardown = null;

  const sync = () => {
    if (magnetic.matches && !teardown) teardown = magnets();
    else if (!magnetic.matches && teardown) {
      teardown();
      teardown = null;
    }
  };

  sync();
  magnetic.addEventListener('change', sync);

  // Setting up a magnet is a measurement: the box is grown by BLEED in pixels
  // and the authored outline is remapped into the bigger box using that box's
  // own width and height. Both are only true at the size they were read at, so
  // a window that changes size leaves every shape struck against a box that no
  // longer exists — the silhouettes stretch and slide off the edges they are
  // supposed to hang from. Crossing the breakpoint already rebuilt them, which
  // is why this only ever showed up on a resize that stayed on one side of it.
  // Struck again from the authored path, at the size the page now is.
  let settle = 0;
  addEventListener(
    'resize',
    () => {
      if (!teardown) return;
      clearTimeout(settle);
      // Once the drag stops, not on every frame of it: a rebuild resamples ~480
      // points per shape and the resting outline is not visible mid-drag anyway.
      settle = setTimeout(() => {
        if (!teardown) return;
        teardown();
        teardown = magnets();
      }, 160);
    },
    { passive: true }
  );
}
