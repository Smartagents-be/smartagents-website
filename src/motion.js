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
 * Magnets — a dark shape deforms toward a nearby cursor
 *
 * One silhouette, never a seam: the clip path itself is rewritten, so the
 * bulge carries the node field with it instead of revealing an edge.
 * ------------------------------------------------------------------ */

const POINTS = 220; // per shape, unless data-magnet-points says otherwise
const REACH = 175;
const GRIP = 120; // how far past the edge the cursor keeps the swell alive
const BLEED = 140; // room for a bulge to render outside the resting silhouette
const WELD = 30; // px of a pinned edge over which the pull fades to nothing
const SIDES = ['top', 'right', 'bottom', 'left'];

function collectMagnets() {
  const items = [];

  for (const element of document.querySelectorAll('[data-magnet]')) {
    const clip = document.getElementById(element.dataset.clip);
    const path = clip && clip.querySelector('path');
    if (!path) continue;

    // Intricate curves need denser sampling or a pull reads as a fold.
    const count = parseInt(element.dataset.magnetPoints, 10) || POINTS;
    const total = path.getTotalLength();
    const sampled = [];
    for (let i = 0; i < count; i++) {
      const point = path.getPointAtLength((total * i) / count);
      sampled.push([point.x, point.y]);
    }

    // Grow the element's box so a bulge has somewhere to render, then remap the
    // outline into the bigger box: the resting shape is pixel-identical.
    const rect = element.getBoundingClientRect();
    const scale = element.offsetWidth ? rect.width / element.offsetWidth : 1;
    const w = rect.width / (scale || 1);
    const h = rect.height / (scale || 1);
    const computed = getComputedStyle(element);
    const restore = {};
    for (const side of SIDES) {
      restore[side] = element.style[side];
      element.style[side] = `${(parseFloat(computed[side]) || 0) - BLEED}px`;
    }

    // The echoes are struck from this same path, so they have to live in a box
    // of the same size: the outline is remapped into the grown box below, and a
    // copy left at its authored size would render that outline at a different
    // scale and slide off the shape it is shadowing. Their authored geometry is
    // the field's, so growing them by the same BLEED keeps all three congruent
    // and leaves the transform that offsets them untouched.
    const echoes = [];
    for (const echo of element.parentElement.querySelectorAll(
      `.field-echo[data-clip="${element.dataset.clip}"]`
    )) {
      const shape = getComputedStyle(echo);
      const kept = {};
      for (const side of SIDES) {
        kept[side] = echo.style[side];
        echo.style[side] = `${(parseFloat(shape[side]) || 0) - BLEED}px`;
      }
      echoes.push({ element: echo, restore: kept });
    }

    const guarded = !element.hasAttribute('data-magnet-free');
    const points = sampled.map(([x, y]) => [
      (x * w + BLEED) / (w + 2 * BLEED),
      (y * h + BLEED) / (h + 2 * BLEED)
    ]);
    // Read before the remap overwrites it: teardown puts the box back to its
    // authored insets, so the path has to go back to the authored outline too.
    const original = path.getAttribute('d');
    const resting = toPathData(points);
    path.setAttribute('d', resting);

    items.push({
      element,
      path,
      points,
      resting,
      original,
      restore,
      echoes,
      // A shape whose top or right edge is tucked under the nav or a card must
      // not bulge there; `data-magnet-free` opts out of that guard.
      guarded,
      // How far the outline travels, and how much of it travels with it. Both
      // are per shape: a big shape swells over a wider stretch of its edge than
      // a small one, or the pull reads as a spike rather than as a turn.
      amplitude: parseFloat(element.dataset.magnetAmp) || (guarded ? 92 : 34),
      sigma: parseFloat(element.dataset.magnetSigma) || 96,
      // The page edge the shape hangs from, if any: it stays welded to it.
      pin: element.dataset.magnetPin || null,
      active: false
    });
  }

  return items;
}

function toPathData(points) {
  return `${points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(4)},${y.toFixed(4)}`).join('')}Z`;
}

function magnets() {
  let items = collectMagnets();
  if (!items.length) return;

  const rest = (item) => {
    if (!item.active) return;
    item.path.setAttribute('d', item.resting);
    item.active = false;
  };

  const update = (cursorX, cursorY) => {
    for (const item of items) {
      const rect = item.element.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        rest(item);
        continue;
      }

      const scale = item.element.offsetWidth ? rect.width / item.element.offsetWidth : 1;
      const w = rect.width / (scale || 1);
      const h = rect.height / (scale || 1);
      const x = (cursorX - rect.left) / (scale || 1);
      const y = (cursorY - rect.top) / (scale || 1);

      const outline = item.points.map(([px, py]) => [px * w, py * h]);

      // Arc length along the outline, so the bulge falls off along the edge
      // rather than through the shape.
      let perimeter = 0;
      const arc = [0];
      for (let i = 1; i <= outline.length; i++) {
        const a = outline[i - 1];
        const b = outline[i % outline.length];
        perimeter += Math.hypot(b[0] - a[0], b[1] - a[1]);
        arc.push(perimeter);
      }

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

      // Crossing the edge holds the swell where it is instead of snapping it
      // back: the shape lets go only once the cursor is well inside.
      if (inside) {
        if (best > GRIP) rest(item);
        continue;
      }
      if (best > REACH) {
        rest(item);
        continue;
      }
      if (item.guarded && (outline[nearest][1] < BLEED + 4 || outline[nearest][0] > w - BLEED - 4)) {
        rest(item);
        continue;
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

      const pulled = outline.map(([px, py], i) => {
        let along = Math.abs(arc[i] - arc[nearest]);
        if (along > perimeter / 2) along = perimeter - along;
        const falloff = Math.exp(-((along / sigma) ** 2));
        let ux = dx * amplitude * falloff;
        let uy = dy * amplitude * falloff;

        // A pinned shape stays welded to the page edge it hangs from: the pull
        // fades to nothing over the last WELD pixels before that edge.
        if (item.pin) {
          const edge =
            item.pin === 'left'
              ? px - BLEED
              : item.pin === 'right'
                ? w - BLEED - px
                : item.pin === 'top'
                  ? py - BLEED
                  : h - BLEED - py;
          const weld = Math.min(1, Math.max(0, edge) / WELD);
          if (item.pin === 'left' || item.pin === 'right') ux *= weld;
          else uy *= weld;
        }

        return [(px + ux) / w, (py + uy) / h];
      });

      item.path.setAttribute('d', toPathData(pulled));
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
  const onLeave = () => items.forEach(rest);

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);

  return () => {
    if (frame) cancelAnimationFrame(frame);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    for (const item of items) {
      item.path.setAttribute('d', item.original);
      for (const side of SIDES) item.element.style[side] = item.restore[side];
      for (const echo of item.echoes) {
        for (const side of SIDES) echo.element.style[side] = echo.restore[side];
      }
    }
    items = [];
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
