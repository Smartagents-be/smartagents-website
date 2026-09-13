// <sa-node-field> — the live cyan node network that fills every dark shape.
//
// The whole page shares one field in document coordinates: each element is a
// window onto it, so the network reads as continuous from the header wedge to
// the last dark shape on the page even though it is painted into separate
// canvases. The footer used to be the bottom of that run; it is paper now, and
// the wedge left in its corner is too small to carry a field — see
// `.footer-mark` in `main.css`.
// `variant="helix"` swaps the drifting network for the rotating double helix
// used in the Ons DNA disc.
//
// See .claude/skills/smartagents-design/README.md ("The dark field is the
// brand") and .claude/skills/webcomponent-mpa-spa/SKILL.md §4.

const CYAN = '0,216,255';
const FPS = 30;
const HELIX_TURN_SECONDS = 60;
const LINK_RADIUS = 128;
// One node per this many square px of document, so the field keeps the same
// weave whatever the page height. The floor keeps a short page from looking
// empty; the ceiling is what keeps the link pass affordable.
const NODE_AREA = 8700;
const NODE_MIN = 120;
const NODE_MAX = 2200;

const still = matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------ *
 * The shared field
 * ------------------------------------------------------------------ */

const windows = new Set();
let nodes = [];
let fieldWidth = 0;
let fieldHeight = 0;
let timer = 0;

function makeNode() {
  return {
    x: Math.random() * fieldWidth,
    y: Math.random() * fieldHeight,
    vx: (Math.random() - 0.5) * 0.16,
    vy: (Math.random() - 0.5) * 0.16,
    r: 1.4 + Math.random() * 1.5
  };
}

function population() {
  return Math.max(
    NODE_MIN,
    Math.min(NODE_MAX, Math.round((fieldWidth * fieldHeight) / NODE_AREA))
  );
}

function seed() {
  nodes = Array.from({ length: population() }, makeNode);
}

/**
 * Match the population to a field that has changed size, without disturbing the
 * nodes already in it. Re-seeding is a whole new network, and a page's height is
 * not a constant: the staffing page's accordion moves it every frame for a third
 * of a second, and re-seeding on each of those frames was the network flying
 * apart and reassembling thirty times a second. A taller document is the same
 * field with more nodes in it.
 */
function refill() {
  const target = population();
  // Hysteresis, so a field that is growing is topped up two or three times on
  // the way rather than on every frame — a node appearing is invisible among a
  // thousand of them, a hundred appearing at once is not.
  if (Math.abs(target - nodes.length) < Math.max(24, Math.round(target * 0.05))) return;
  if (nodes.length > target) nodes.length = target;
  else while (nodes.length < target) nodes.push(makeNode());
}

/** True when the field's document box moved, so every window has to re-measure
    its slice of it — the shapes below a block that just grew have all shifted. */
function measureField() {
  const root = document.documentElement;
  const width = Math.max(root.scrollWidth, innerWidth);
  const height = Math.max(root.scrollHeight, innerHeight);
  if (Math.abs(width - fieldWidth) < 2 && Math.abs(height - fieldHeight) < 2) return false;
  fieldWidth = width;
  fieldHeight = height;
  if (nodes.length) refill();
  else seed();
  return true;
}

function drift() {
  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < -20) node.x = fieldWidth + 20;
    else if (node.x > fieldWidth + 20) node.x = -20;
    if (node.y < -20) node.y = fieldHeight + 20;
    else if (node.y > fieldHeight + 20) node.y = -20;
  }
}

function tick() {
  drift();
  // A window whose document position has shifted is looking at the wrong slice
  // until it is told: the field is anchored to the document, not to the shape.
  if (measureField()) for (const view of windows) view.measure();
  for (const view of windows) view.draw();
}

/**
 * Whether a frame has anything to do: a window with a piece of the field on
 * screen, in a tab being looked at, with motion allowed. The clock stops rather
 * than waking thirty times a second to decide it has nothing to paint.
 *
 * It deliberately does not idle out while the reader is reading: the field
 * drifting at 30fps is the brand (design README), and a shape that dies after
 * two still seconds is not that. Nothing on screen, nothing to draw — no more.
 */
function shouldRun() {
  if (still.matches || document.hidden) return false;
  for (const view of windows) if (view.visible) return true;
  return false;
}

function syncClock() {
  if (shouldRun()) startClock();
  else stopClock();
}

function startClock() {
  if (timer || !shouldRun()) return;
  timer = setInterval(tick, 1000 / FPS);
}

function stopClock() {
  clearInterval(timer);
  timer = 0;
}

/* A tab in the background paints nothing, and `setInterval` is throttled there
   rather than stopped. Listened to once for every window on the page. */
document.addEventListener('visibilitychange', syncClock);

/* ------------------------------------------------------------------ *
 * The element
 * ------------------------------------------------------------------ */

class NodeField extends HTMLElement {
  connectedCallback() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    this.context = this.canvas.getContext('2d');
    this.append(this.canvas);

    this.helix = this.getAttribute('variant') === 'helix';
    this.frame = this.helix ? this.closest('[data-helix-frame]') : null;
    this.phase = 0;
    // True until the observer says otherwise, and where there is no observer.
    this.visible = true;

    this.observer = new ResizeObserver(() => {
      this.measure();
      this.draw();
    });
    this.observer.observe(this);

    /* A window that scrolled far out of sight costs nothing to skip, and when
       the last one goes off screen the clock stops rather than drifting two
       thousand nodes for windows that all decline to paint. */
    if ('IntersectionObserver' in window) {
      this.inView = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry.isIntersecting;
          syncClock();
          // Coming back on screen with the clock stopped: there is no next tick
          // to measure in, so paint once here.
          if (this.visible) {
            this.measure();
            this.draw();
          }
        },
        { rootMargin: '250px' }
      );
      this.inView.observe(this);
    }

    windows.add(this);
    measureField();
    this.measure();
    this.draw();
    syncClock();

    this.onMotionChange = () => {
      syncClock();
      this.draw();
    };
    still.addEventListener('change', this.onMotionChange);
  }

  disconnectedCallback() {
    windows.delete(this);
    this.observer?.disconnect();
    this.inView?.disconnect();
    still.removeEventListener('change', this.onMotionChange);
    syncClock();
  }

  measure() {
    const rect = this.getBoundingClientRect();
    // A clip path can scale the box; divide it back out so the shared field
    // stays in untransformed document coordinates.
    const scale = this.offsetWidth ? rect.width / this.offsetWidth : 1;
    this.w = this.offsetWidth;
    this.h = this.offsetHeight;
    this.ox = (rect.left + scrollX) / (scale || 1);
    this.oy = (rect.top + scrollY) / (scale || 1);

    // Magnets grow the paint box to reveal the field beyond its resting edge.
    // Keep the helix anchored to the illustration, so that growth changes only
    // the visible window, never the helix's scale or position.
    const frame = this.frame?.getBoundingClientRect() || rect;
    this.frameW = frame.width / (scale || 1);
    this.frameH = frame.height / (scale || 1);
    this.frameX = (frame.left - rect.left) / (scale || 1);
    this.frameY = (frame.top - rect.top) / (scale || 1);

    const dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.round(this.w * dpr);
    const height = Math.round(this.h * dpr);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw() {
    if (!this.w || !this.h || !this.visible) return;
    this.context.clearRect(0, 0, this.w, this.h);
    if (this.helix) {
      this.context.save();
      this.context.translate(this.frameX, this.frameY);
      this.drawHelix();
      this.context.restore();
    } else this.drawNetwork();
  }

  /** The drifting network: this element's slice of the shared field. */
  drawNetwork() {
    const ctx = this.context;
    const x0 = this.ox - LINK_RADIUS;
    const x1 = this.ox + this.w + LINK_RADIUS;
    const y0 = this.oy - LINK_RADIUS;
    const y1 = this.oy + this.h + LINK_RADIUS;

    // Sorted by x so the link pass can stop at the first node too far right to
    // reach: without it the pass is quadratic in the window's node count, which
    // at this density is what would cost the frame.
    const local = nodes.filter((n) => n.x > x0 && n.x < x1 && n.y > y0 && n.y < y1);
    local.sort((a, b) => a.x - b.x);

    ctx.save();
    ctx.translate(-this.ox, -this.oy);
    ctx.lineWidth = 1;

    for (let i = 0; i < local.length; i++) {
      const a = local[i];
      for (let j = i + 1; j < local.length; j++) {
        const b = local[j];
        if (b.x - a.x > LINK_RADIUS) break;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK_RADIUS) continue;
        ctx.strokeStyle = `rgba(${CYAN},${(0.22 * (1 - d / LINK_RADIUS)).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = `rgba(${CYAN},0.62)`;
    for (const node of local) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------------------------------------------------------------- *
   * The helix variant
   * ---------------------------------------------------------------- */

  strand(offset) {
    const w = this.frameW;
    const h = this.frameH;
    const points = [];
    const steps = 180;
    const height = h - 64;
    const zoom = 1.8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ease = t * t * (3 - 2 * t);
      const angle = t * Math.PI * 5.5 + this.phase + offset;
      // Enlarge the whole helix equally in both axes, so the silhouette crops
      // it without flattening the turns by stretching only their width.
      const cx = w * (0.65 - 0.35 * ease);
      const cy = 32 + t * height;
      const tangentX = -w * 2.1 * t * (1 - t);
      const length = Math.hypot(tangentX, height) || 1;
      const radius = w * (0.09 + 0.055 * Math.abs(2 * t - 1));
      const across = Math.sin(angle) * radius;
      points.push({
        x: w / 2 + (cx + across * height / length - w / 2) * zoom,
        y: h / 2 + (cy - across * tangentX / length - h / 2) * zoom,
        depth: Math.cos(angle)
      });
    }
    return points;
  }

  drawHelix() {
    const ctx = this.context;
    if (!still.matches) this.phase += Math.PI * 2 / (HELIX_TURN_SECONDS * FPS);
    // The same dots and straight hairline links as the shared field, arranged
    // into a helix. Dense, bright curves made this look like a separate graphic.
    const strands = [0, Math.PI].map((offset) => {
      const points = this.strand(offset);
      return points.filter((_, i) => i % 8 === 0 || i === points.length - 1);
    });
    ctx.lineWidth = 1;

    // Rear backbone, paired rungs, then the front backbone: crossings read as
    // two strands winding around an axis instead of an intersecting network.
    const backbone = (front) => {
      for (const strand of strands) {
        for (let i = 1; i < strand.length; i++) {
          const a = strand[i - 1];
          const b = strand[i];
          const depth = (a.depth + b.depth) / 2;
          if ((depth >= 0) !== front) continue;
          const near = (depth + 1) / 2;
          ctx.strokeStyle = `rgba(${CYAN},${0.13 + near * 0.09})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    };

    backbone(false);
    for (let i = 0; i < strands[0].length; i += 2) {
      const a = strands[0][i];
      const b = strands[1][i];
      ctx.strokeStyle = `rgba(${CYAN},0.18)`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    backbone(true);

    // Only the rung junctions carry dots; intermediate line vertices keep the
    // helix's outline without adding more visual weight.
    for (const front of [false, true]) {
      for (const strand of strands) {
        for (let i = 0; i < strand.length; i += 2) {
          const point = strand[i];
          if ((point.depth >= 0) !== front) continue;
          const near = (point.depth + 1) / 2;
          ctx.fillStyle = `rgba(${CYAN},${0.45 + near * 0.17})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5 + near * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

customElements.define('sa-node-field', NodeField);

// The field is anchored in document coordinates, so a reflow moves every window.
addEventListener(
  'resize',
  () => {
    measureField();
    for (const view of windows) {
      view.measure();
      view.draw();
    }
  },
  { passive: true }
);
