// <sa-node-field> — the live cyan node network, for a deck.
//
// The public site's component (src/components/node-field/node-field.js) keeps
// ONE field in document coordinates and treats every dark shape as a window
// onto it, so the network reads as continuous from the header wedge to the
// footer. A deck has no document to anchor to: it is a fixed 1920x1080 stage
// that <deck-stage> scales with a transform, and every navy shape is its own
// island on its own slide. So this is the same weave with the sharing taken
// out — each element seeds and drifts its own network inside its own box.
//
// The host is clipped (`clip-path` on `.slide__shape`), so nodes that drift
// outside the silhouette are simply not painted. Nothing has to know the shape.
//
// Colours, density and link radius are the site's, so a slide and a page put
// the same field on the same navy.

const CYAN = '0,216,255';
const FPS = 30;
// Sparser than the site's field, and joined over a shorter reach. There, one
// shape is a window onto a document-tall network sitting behind body text, so a
// close weave reads as texture. Here the silhouette is the only thing on that
// half of the slide and nothing sits on top of it: the same weave reads as a
// solid web. Roughly three neighbours per node is the number that stays a
// constellation. Node spacing is sqrt(NODE_AREA); the count follows from the
// box, so a big shape and a small one carry the same weave.
const LINK_RADIUS = 105;
const NODE_AREA = 9500;
const NODE_MIN = 18;
const NODE_MAX = 400;

const still = matchMedia('(prefers-reduced-motion: reduce)');

const fields = new Set();
let timer = 0;

function startClock() {
  if (timer || still.matches || fields.size === 0) return;
  timer = setInterval(() => {
    if (document.hidden) return;
    for (const field of fields) field.step();
  }, 1000 / FPS);
}

function stopClock() {
  clearInterval(timer);
  timer = 0;
}

class NodeField extends HTMLElement {
  connectedCallback() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    this.context = this.canvas.getContext('2d');
    this.append(this.canvas);

    this.nodes = [];
    this.observer = new ResizeObserver(() => {
      this.measure();
      this.draw();
    });
    this.observer.observe(this);

    fields.add(this);
    this.measure();
    this.draw();
    startClock();

    this.onMotionChange = () => {
      stopClock();
      startClock();
      this.draw();
    };
    still.addEventListener('change', this.onMotionChange);
  }

  disconnectedCallback() {
    fields.delete(this);
    this.observer?.disconnect();
    still.removeEventListener('change', this.onMotionChange);
    if (fields.size === 0) stopClock();
  }

  makeNode() {
    return {
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r: 1.6 + Math.random() * 1.5
    };
  }

  measure() {
    this.w = this.offsetWidth;
    this.h = this.offsetHeight;
    if (!this.w || !this.h) return;

    // A shape that changed size is topped up, never re-seeded: re-seeding is a
    // whole new network, seen as the field flying apart and reassembling.
    const target = Math.max(NODE_MIN, Math.min(NODE_MAX, Math.round((this.w * this.h) / NODE_AREA)));
    if (this.nodes.length > target) this.nodes.length = target;
    else while (this.nodes.length < target) this.nodes.push(this.makeNode());

    // The stage is transform-scaled, so back the scale out of the backing store
    // or the field is soft on a big screen.
    const rect = this.getBoundingClientRect();
    const scale = this.w ? rect.width / this.w : 1;
    const dpr = Math.min((devicePixelRatio || 1) * (scale || 1), 3);
    const width = Math.round(this.w * dpr);
    const height = Math.round(this.h * dpr);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  step() {
    for (const node of this.nodes) {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -20) node.x = this.w + 20;
      else if (node.x > this.w + 20) node.x = -20;
      if (node.y < -20) node.y = this.h + 20;
      else if (node.y > this.h + 20) node.y = -20;
    }
    this.draw();
  }

  draw() {
    if (!this.w || !this.h) return;
    const ctx = this.context;
    ctx.clearRect(0, 0, this.w, this.h);

    // Sorted by x so the link pass can stop at the first node too far right to
    // reach, instead of being quadratic in the whole population.
    const local = this.nodes.slice().sort((a, b) => a.x - b.x);
    ctx.lineWidth = 1;

    for (let i = 0; i < local.length; i++) {
      const a = local[i];
      for (let j = i + 1; j < local.length; j++) {
        const b = local[j];
        if (b.x - a.x > LINK_RADIUS) break;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK_RADIUS) continue;
        ctx.strokeStyle = `rgba(${CYAN},${(0.26 * (1 - d / LINK_RADIUS)).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = `rgba(${CYAN},0.78)`;
    for (const node of local) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

customElements.define('sa-node-field', NodeField);
