// ontbijtsessie: plays the screens.
//
// A screen marked `data-demo` replays its sequence each time its slide opens
// and goes back to its finished state when the slide is left. By default the
// sequence is its `.ui-step` elements coming in one by one: `data-lead` on the
// screen is the pause before the first, `data-wait` on a step the pause before
// it. A screen that needs more than that registers its own player under its
// `data-demo` name with `OntbijtDemos.define(name, (root) => ({ start, stop }))`.
//
// Nothing here is a real model call: the demos must work without wifi.

(function () {
  const players = new Map();
  const factories = {};

  function stepper(root) {
    const steps = [...root.querySelectorAll('.ui-step')];
    let timers = [];
    return {
      start() {
        root.classList.add('is-armed');
        steps.forEach((s) => s.classList.remove('is-in'));
        let t = Number(root.dataset.lead || 400);
        for (const s of steps) {
          t += Number(s.dataset.wait || 420);
          timers.push(setTimeout(() => s.classList.add('is-in'), t));
        }
      },
      stop() {
        timers.forEach(clearTimeout);
        timers = [];
        root.classList.remove('is-armed');
        steps.forEach((s) => s.classList.remove('is-in'));
      },
    };
  }

  function player(root) {
    if (!players.has(root)) {
      const make = factories[root.dataset.demo] || stepper;
      players.set(root, make(root));
    }
    return players.get(root);
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = null;

  function show(slide) {
    if (slide === current) return;
    if (current) current.querySelectorAll('[data-demo]').forEach((r) => player(r).stop());
    current = slide;
    if (!slide || reduce.matches) return;
    slide.querySelectorAll('[data-demo]').forEach((r) => player(r).start());
  }

  window.OntbijtDemos = {
    define(name, factory) { factories[name] = factory; },
    stepper,
  };

  const deck = document.querySelector('deck-stage');
  if (!deck) return;
  deck.addEventListener('slidechange', (e) => show(e.detail.slide));
  window.addEventListener('load', () => {
    const i = deck.index;
    const slides = [...deck.children].filter((c) => c.tagName === 'SECTION');
    if (typeof i === 'number') show(slides[i]);
  });
})();

// ── 04 · App-builder ─────────────────────────────────────────────────────────
// No real model: any sentence starts the same build, after which a working
// Flappy-style game appears. The demo never depends on wifi or API keys, and
// still feels live to the room.
OntbijtDemos.define('appbuilder', (win) => {
  const P = 'ontbijtsessie-slide-04-app';
  const $ = (id) => document.getElementById(`${P}-${id}`);
  const section = win.closest('section');
  const input = $('input');
  const sendBtn = $('send');
  const statusEl = $('status');
  const stepsEl = $('steps');
  const codeEl = $('code');
  const canvas = $('canvas');
  const example = $('idle-example');
  const ctx = canvas.getContext('2d');

  const STEPS = [
    { label: 'Vraag analyseren', ms: 750 },
    { label: 'Ontwerp kiezen: één scherm, één knop', ms: 850 },
    { label: 'Code schrijven', code: true, meta: '214 regels' },
    { label: 'Testen', ms: 950, meta: '0 fouten' },
    { label: 'App starten', ms: 700 },
  ];

  const CODE_LINES = [
    "const canvas = document.querySelector('#game');",
    "const ctx = canvas.getContext('2d');",
    'const GRAVITY = 0.55;',
    'const FLAP = -9.5;',
    'const GAP = 190;',
    'const SPEED = 4.2;',
    '',
    'let bird = { x: 150, y: 220, vy: 0 };',
    'let pipes = [];',
    'let score = 0;',
    '',
    'function flap() {',
    '  bird.vy = FLAP;',
    '}',
    '',
    'function spawnPipe() {',
    '  const top = 70 + Math.random() * 160;',
    '  pipes.push({ x: W + 20, top });',
    '}',
    '',
    'function update() {',
    '  bird.vy += GRAVITY;',
    '  bird.y += bird.vy;',
    '  for (const p of pipes) p.x -= SPEED;',
    '  if (hitsPipe() || bird.y > FLOOR) gameOver();',
    '}',
    '',
    'function draw() {',
    '  ctx.clearRect(0, 0, W, H);',
    '  drawPipes(); drawBird(); drawScore();',
    '  requestAnimationFrame(loop);',
    '}',
    '',
    "canvas.addEventListener('pointerdown', flap);",
    'loop();',
  ];

  let timers = [];
  let resolvers = [];
  let gen = 0;
  const wait = (ms) => new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms));
    resolvers.push(resolve);
  });

  function halt() {
    gen++;
    timers.forEach(clearTimeout);
    timers = [];
    resolvers.forEach((r) => r());
    resolvers = [];
    stopGame();
  }

  function setStatus(text, live = false) {
    statusEl.textContent = text;
    statusEl.classList.toggle('ab__status--live', live);
  }

  function reset() {
    halt();
    win.dataset.state = 'idle';
    setStatus('Klaar om te bouwen');
    stepsEl.replaceChildren();
    codeEl.textContent = '';
    input.value = '';
    input.disabled = false;
    sendBtn.disabled = false;
  }

  function addStep(st, n) {
    const id = `${P}-step-${String(n).padStart(2, '0')}`;
    const row = document.createElement('div');
    row.id = id;
    row.className = 'ui-item ab__step';
    const mark = document.createElement('span');
    mark.id = `${id}-mark`;
    mark.className = 'ab__step-mark';
    mark.textContent = '…';
    const label = document.createElement('span');
    label.id = `${id}-label`;
    label.className = 'ab__step-label';
    label.textContent = st.label;
    const meta = document.createElement('span');
    meta.id = `${id}-meta`;
    meta.className = 'ui-item__end';
    row.append(mark, label, meta);
    stepsEl.appendChild(row);
    return { row, mark, meta };
  }

  function doneStep(parts, st) {
    parts.row.classList.add('ab__step--done');
    parts.mark.textContent = '✓';
    if (st.meta) parts.meta.textContent = st.meta;
  }

  async function streamCode(myGen) {
    const shown = [];
    for (const line of CODE_LINES) {
      shown.push(line);
      if (shown.length > 8) shown.shift();
      codeEl.textContent = shown.join('\n');
      await wait(82);
      if (gen !== myGen) return;
    }
  }

  async function build() {
    halt();
    const myGen = gen;
    win.dataset.state = 'build';
    stepsEl.replaceChildren();
    codeEl.textContent = '';
    input.disabled = true;
    sendBtn.disabled = true;
    input.blur();
    setStatus('Bouwen…');

    for (const [i, st] of STEPS.entries()) {
      const parts = addStep(st, i + 1);
      await wait(180);
      if (gen !== myGen) return;
      if (st.code) {
        await streamCode(myGen);
        if (gen !== myGen) return;
        await wait(280);
      } else {
        await wait(st.ms);
      }
      if (gen !== myGen) return;
      doneStep(parts, st);
    }

    await wait(400);
    if (gen !== myGen) return;
    setStatus('● Live', true);
    win.dataset.state = 'game';
    input.disabled = false; // typing again means building again
    sendBtn.disabled = false;
    startGame();
  }

  function submit() {
    if (!input.value.trim()) return;
    if (win.dataset.state === 'build') return;
    build();
  }
  sendBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });
  example.addEventListener('click', () => {
    input.value = 'Een spelletje voor op de receptie';
    submit();
  });

  // ── The game ────────────────────────────────────────────────────────────
  const GRAVITY = 0.5, FLAP = -8.6, SPEED = 3.8, GAP = 175, PIPE_W = 76, R = 17, FLOOR_H = 44;
  let raf = 0;
  let running = false;
  let W = 0, H = 0, bird, pipes, score, best = 0, phase = 'ready', frame = 0;
  let C = {};

  // Colours come from the tokens, so the game wears the deck's palette.
  function readTokens() {
    const cs = getComputedStyle(win);
    const v = (n) => cs.getPropertyValue(n).trim();
    C = {
      sky: v('--sa-paper'),
      wash: v('--sa-wash-4'),
      pipe: v('--sa-field'),
      pipeEdge: v('--sa-field-line'),
      cyan: v('--sa-cyan'),
      ink: v('--sa-ink'),
      grey: v('--sa-grey-6'),
      line: v('--sa-line-3'),
      white: v('--sa-white'),
      font: cs.fontFamily,
    };
  }

  function sizeCanvas() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
  }

  function initGame() {
    sizeCanvas();
    bird = { x: 150, y: H / 2, vy: 0 };
    pipes = [];
    score = 0;
    phase = 'ready';
    frame = 0;
  }

  function startGame() {
    readTokens();
    initGame();
    running = true;
    raf = requestAnimationFrame(tick);
  }

  function stopGame() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function pressAction() {
    if (win.dataset.state !== 'game') return;
    if (phase === 'ready') {
      phase = 'play';
      bird.vy = FLAP;
    } else if (phase === 'play') {
      bird.vy = FLAP;
    } else {
      best = Math.max(best, score);
      initGame();
    }
  }
  canvas.addEventListener('pointerdown', pressAction);

  // Space flaps while playing. Capture phase plus stopPropagation, so
  // deck-stage (which reads Space as "next slide") never sees it.
  window.addEventListener('keydown', (e) => {
    if (win.dataset.state !== 'game') return;
    if (!section.hasAttribute('data-deck-active')) return;
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      pressAction();
    }
  }, true);

  function spawnPipe() {
    const m = 60;
    const top = m + Math.random() * (H - GAP - FLOOR_H - m * 2);
    pipes.push({ x: W + 20, top, passed: false });
  }

  function collide() {
    if (bird.y + R > H - FLOOR_H || bird.y - R < 0) return true;
    for (const p of pipes) {
      if (bird.x + R > p.x && bird.x - R < p.x + PIPE_W) {
        if (bird.y - R < p.top || bird.y + R > p.top + GAP) return true;
      }
    }
    return false;
  }

  function tick() {
    if (!running) return;
    frame++;
    if (phase === 'play') {
      bird.vy += GRAVITY;
      bird.y += bird.vy;
      if (!pipes.length || pipes[pipes.length - 1].x < W - 320) spawnPipe();
      for (const p of pipes) {
        p.x -= SPEED;
        if (!p.passed && p.x + PIPE_W < bird.x - R) {
          p.passed = true;
          score++;
        }
      }
      pipes = pipes.filter((p) => p.x > -PIPE_W - 20);
      if (collide()) phase = 'dead';
    } else if (phase === 'ready') {
      bird.y = H / 2 + Math.sin(frame / 22) * 10;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  function drawPipe(p) {
    const bottomY = p.top + GAP;
    ctx.fillStyle = C.pipe;
    roundRect(p.x, -8, PIPE_W, p.top + 8, 6);
    roundRect(p.x, bottomY, PIPE_W, H - FLOOR_H - bottomY + 8, 6);
    // the cyan lip is the mark that says "the gap is here"
    ctx.fillStyle = C.cyan;
    ctx.fillRect(p.x, p.top - 4, PIPE_W, 4);
    ctx.fillRect(p.x, bottomY, PIPE_W, 4);
  }

  function drawBird() {
    const tilt = phase === 'ready'
      ? Math.sin(frame / 22) * 0.08
      : Math.max(-0.45, Math.min(0.9, bird.vy / 14));
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(tilt);
    ctx.fillStyle = C.cyan;
    circle(0, 0, R);
    ctx.fillStyle = C.white;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-6, 2 + Math.sin(frame / 3) * (phase === 'play' ? 3 : 1.5), 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    circle(7, -5, 5.5);
    ctx.fillStyle = C.ink;
    circle(8.5, -5, 2.6);
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(25, 4);
    ctx.lineTo(15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.fillStyle = C.sky;
    ctx.fillRect(0, 0, W, H);
    // a few still clouds, as hairline washes
    ctx.fillStyle = C.wash;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 233 + 60) - frame * 0.4) % (W + 160);
      roundRect((x + W + 160) % (W + 160) - 80, 40 + (i * 61) % 160, 120, 26, 13);
    }
    for (const p of pipes) drawPipe(p);
    // ground: a hairline and a ticking mark under it
    ctx.fillStyle = C.wash;
    ctx.fillRect(0, H - FLOOR_H, W, FLOOR_H);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, H - FLOOR_H, W, 1);
    const off = (frame * SPEED) % 48;
    for (let x = -off; x < W; x += 48) ctx.fillRect(x, H - FLOOR_H / 2, 20, 2);
    drawBird();
    ctx.textAlign = 'center';
    if (phase !== 'ready') {
      ctx.fillStyle = C.ink;
      ctx.font = `600 46px ${C.font}`;
      ctx.fillText(String(score), W / 2, 70);
    }
    if (phase === 'ready') {
      ctx.fillStyle = C.grey;
      ctx.font = `500 24px ${C.font}`;
      ctx.fillText('Klik of spatie om te starten', W / 2, H / 2 - 80);
    }
    if (phase === 'dead') {
      ctx.fillStyle = C.sky;
      ctx.globalAlpha = 0.86;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink;
      ctx.font = `600 42px ${C.font}`;
      ctx.fillText('Game over', W / 2, H / 2 - 30);
      ctx.font = `500 26px ${C.font}`;
      ctx.fillText(`Score ${score}${best > 0 ? ` · beste ${Math.max(best, score)}` : ''}`, W / 2, H / 2 + 14);
      ctx.fillStyle = C.grey;
      ctx.font = `400 22px ${C.font}`;
      ctx.fillText('Klik om opnieuw te spelen', W / 2, H / 2 + 54);
    }
  }

  return { start: reset, stop: reset };
});


// ── 05 · Music player ────────────────────────────────────────────────────────
// The waveform is the seek bar. It is a fixed shape, not the real audio
// analysis: the point is "a song came out", not the spectrum. Set up at load,
// not lazily, so the shape is there in thumbnails and in the printed PDF.
(function () {
  const P = 'ontbijtsessie-slide-05';
  const root = document.getElementById(`${P}-track`);
  if (!root) return;
  const a = document.getElementById(`${P}-audio`);
  const pp = document.getElementById(`${P}-track-play`);
  const timeEl = document.getElementById(`${P}-track-time`);
  const wave = document.getElementById(`${P}-track-wave`);
  const ctx = wave.getContext('2d');

  const BARS = 96;
  const heights = Array.from({ length: BARS }, (_, i) => {
    const env = 0.55 + 0.45 * Math.sin((i / BARS) * Math.PI);
    const n = Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.43) * 0.4);
    return Math.max(0.12, Math.min(1, env * (0.35 + 0.65 * n)));
  });

  function fmt(s) {
    s = Math.floor(s || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function drawWave() {
    const w = wave.clientWidth;
    const h = wave.clientHeight;
    if (!w || !h) return;
    if (wave.width !== w * 2) {
      wave.width = w * 2;
      wave.height = h * 2;
    }
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cs = getComputedStyle(root);
    const played = cs.getPropertyValue('--sa-cyan').trim();
    const rest = cs.getPropertyValue('--sa-line-4').trim();
    const pct = a.duration ? a.currentTime / a.duration : 0;
    const step = w / BARS;
    const bw = Math.max(2, step * 0.45);
    heights.forEach((v, i) => {
      const bh = v * h;
      ctx.fillStyle = (i + 0.5) / BARS <= pct ? played : rest;
      ctx.beginPath();
      ctx.roundRect(i * step + (step - bw) / 2, (h - bh) / 2, bw, bh, bw / 2);
      ctx.fill();
    });
  }

  function syncTime() {
    timeEl.textContent = `${fmt(a.currentTime)} / ${fmt(a.duration)}`;
    drawWave();
  }

  function syncButton() {
    pp.textContent = !a.paused && !a.ended ? '❚❚' : '▶';
  }

  pp.addEventListener('click', () => (a.paused ? a.play() : a.pause()));
  wave.addEventListener('click', (e) => {
    if (!a.duration) return;
    const r = wave.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
    syncTime();
  });
  a.addEventListener('play', syncButton);
  a.addEventListener('pause', syncButton);
  a.addEventListener('ended', syncButton);
  a.addEventListener('loadedmetadata', syncTime);
  a.addEventListener('timeupdate', syncTime);
  if (a.readyState >= 1) syncTime();
  if (document.readyState === 'complete') drawWave();
  else window.addEventListener('load', drawWave);
  window.addEventListener('beforeprint', drawWave);

  OntbijtDemos.define('music', () => ({
    start() { syncTime(); syncButton(); },
    stop() { a.pause(); },
  }));
})();

// ── 11 · The language model writes one word at a time ─────────────────────
// The sentence grows by the most likely next word; the panel shows the three
// candidates the model weighed, and the winner turns cyan before it joins the
// sentence. Loops while the slide is open; on leaving, the screen goes back to
// the still it was authored as.
OntbijtDemos.define('llm', (root) => {
  const P = 'ontbijtsessie-slide-11';
  const sentence = root.querySelector('.llm__sentence');
  const cands = root.querySelector('.llm__cands');
  const still = {
    sentence: [...sentence.childNodes].map((n) => n.cloneNode(true)),
    cands: [...cands.childNodes].map((n) => n.cloneNode(true)),
  };

  const SEED = 'Beste klant, bedankt voor';
  const STEPS = [
    [['je', 71], ['uw', 24], ['het', 5]],
    [['bericht', 64], ['mail', 21], ['bestelling', 15]],
    [['.', 52], [',', 31], ['en', 17]],
    [['We', 57], ['Ik', 31], ['Graag', 12]],
    [['helpen', 44], ['komen', 38], ['bekijken', 18]],
    [['je', 61], ['u', 27], ['graag', 12]],
    [['snel', 48], ['vandaag', 34], ['meteen', 18]],
    [['verder', 55], ['.', 30], ['en', 15]],
    [['.', 79], ['?', 14], ['…', 7]],
  ];
  const isPunct = (w) => /^[.,?…]$/.test(w);

  let gen = 0;
  let timers = [];
  let resolvers = [];
  let caret = null;
  let words = 0;

  const wait = (ms) => new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms));
    resolvers.push(resolve);
  });

  function halt() {
    gen++;
    timers.forEach(clearTimeout);
    timers = [];
    resolvers.forEach((r) => r());
    resolvers = [];
  }

  function span(id, cls, text) {
    const el = document.createElement('span');
    el.id = id;
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function begin() {
    sentence.replaceChildren(span(`${P}-sentence-seed`, '', SEED));
    caret = span(`${P}-caret`, 'llm__caret');
    caret.setAttribute('aria-hidden', 'true');
    sentence.append(caret);
    cands.replaceChildren();
    words = 0;
  }

  function addWord(w) {
    words++;
    const n = String(words).padStart(2, '0');
    sentence.insertBefore(span(`${P}-sentence-word-${n}`, 'llm__word llm__word--new', (isPunct(w) ? '' : ' ') + w), caret);
  }

  function showCands(list) {
    const rows = list.map(([w, p], i) => {
      const n = String(i + 1).padStart(2, '0');
      const id = `${P}-cand-${n}`;
      const row = document.createElement('div');
      row.id = id;
      row.className = 'ui-item llm__cand';
      const meter = span(`${id}-meter`, 'ui-meter llm__meter');
      const track = span(`${id}-track`, 'ui-meter__track llm__track');
      meter.append(track, span(`${id}-p`, 'llm__p', `${p}%`));
      row.append(span(`${id}-word`, 'llm__cand-word', isPunct(w) ? `‘${w}’` : w), meter);
      return { row, track, p };
    });
    cands.replaceChildren(...rows.map((r) => r.row));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      rows.forEach((r) => r.track.style.setProperty('--v', `${r.p}%`));
    }));
    return rows;
  }

  async function run() {
    halt();
    const mine = gen;
    while (gen === mine) {
      begin();
      await wait(900); if (gen !== mine) return;
      for (const list of STEPS) {
        caret.classList.add('is-thinking');
        const rows = showCands(list);
        await wait(1000); if (gen !== mine) return;
        rows[0].row.classList.add('is-chosen');
        await wait(500); if (gen !== mine) return;
        addWord(list[0][0]);
        await wait(420); if (gen !== mine) return;
      }
      caret.classList.remove('is-thinking');
      await wait(4000); if (gen !== mine) return;
    }
  }

  return {
    start() { run(); },
    stop() {
      halt();
      sentence.replaceChildren(...still.sentence.map((n) => n.cloneNode(true)));
      cands.replaceChildren(...still.cands.map((n) => n.cloneNode(true)));
    },
  };
});

// ── 12 · Retrieval: question, search, the hit, the cited answer ────────────
// The stepper's document order would bring the citation in before the third
// document, so this screen keeps its own order. The dots run only while the
// search is running.
OntbijtDemos.define('rag', (root) => {
  const P = 'ontbijtsessie-slide-12';
  const order = [
    ['q', 600],
    ['search', 1300],
    ['doc-01', 800],
    ['doc-02', 550],
    ['doc-03', 550],
    ['doc-02-cite', 900],
    ['a', 1200],
  ].map(([id, ms]) => [document.getElementById(`${P}-${id}`), ms]);
  const steps = [...root.querySelectorAll('.ui-step')];
  let timers = [];

  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  return {
    start() {
      root.classList.add('is-armed');
      root.classList.remove('is-searching', 'is-found');
      steps.forEach((s) => s.classList.remove('is-in'));
      let t = 0;
      for (const [el, ms] of order) {
        t += ms;
        at(t, () => el.classList.add('is-in'));
        if (el.id.endsWith('-search')) at(t, () => root.classList.add('is-searching'));
        if (el.id.endsWith('-cite')) at(t, () => root.classList.replace('is-searching', 'is-found'));
      }
    },
    stop() {
      timers.forEach(clearTimeout);
      timers = [];
      root.classList.remove('is-armed', 'is-searching', 'is-found');
      steps.forEach((s) => s.classList.remove('is-in'));
    },
  };
});

// ── Examples 02 to 06 ────────────────────────────────────────────────────────
// Players for examples 02 to 06. Each one runs the plain stepper and adds the
// moments a stepper cannot show: a status that changes, a source that lights up
// while it is read, a button that gets pressed. Timings are read off the same
// `data-lead` and `data-wait` the stepper uses, so the two never drift.

(function () {
  const D = window.OntbijtDemos;
  if (!D) return;

  // When the stepper brings each `.ui-step` in, in milliseconds from start.
  function landings(root) {
    const out = new Map();
    let t = Number(root.dataset.lead || 400);
    for (const s of root.querySelectorAll('.ui-step')) {
      t += Number(s.dataset.wait || 420);
      out.set(s, t);
    }
    return out;
  }

  function withExtras(root, plan, restore) {
    const base = D.stepper(root);
    let timers = [];
    return {
      start() {
        base.start();
        plan((ms, fn) => timers.push(setTimeout(fn, ms)), landings(root));
      },
      stop() {
        timers.forEach(clearTimeout);
        timers = [];
        base.stop();
        restore();
      },
    };
  }

  // Facturen (18): each stage says what it is doing, then that it is done.
  D.define('facturen', (root) => {
    const [inn, read, out] = root.querySelectorAll('[data-done]');
    const step = (el) => el.closest('.ui-step');
    const fields = [...root.querySelectorAll('.ui-invoice-field')];
    const done = (el) => { el.textContent = el.dataset.done; el.classList.add('ui-green'); };
    return withExtras(root, (at, land) => {
      [inn, read, out].forEach((s) => { s.textContent = ''; });
      at(land.get(step(inn)) + 500, () => done(inn));
      at(land.get(step(read)) + 200, () => { read.textContent = read.dataset.busy; read.classList.remove('ui-green'); });
      at(land.get(fields[fields.length - 1]) + 500, () => done(read));
      at(land.get(step(out)) + 500, () => done(out));
    }, () => [inn, read, out].forEach(done));
  });

  // FAQ-bot (21): the agent reads a source before each answer, then puts the
  // laptop in the cart.
  D.define('faq', (root) => {
    const cart = root.querySelector('.ui-cart');
    const source = (tool) => root.querySelector(`[data-kb="${tool.dataset.kbUse}"]`);
    return withExtras(root, (at, land) => {
      cart.textContent = cart.dataset.idle;
      for (const tool of root.querySelectorAll('[data-kb-use]')) {
        at(land.get(tool), () => source(tool).classList.add('is-used'));
        at(land.get(tool) + 1400, () => source(tool).classList.remove('is-used'));
      }
      at(land.get(cart) + 1600, () => { cart.textContent = cart.dataset.done; });
    }, () => {
      root.querySelectorAll('.is-used').forEach((c) => c.classList.remove('is-used'));
      cart.textContent = cart.dataset.done;
    });
  });
})();

// ── 22 · Offertes: agent 1 gathers, agent 2 drafts, you approve ──────────────
// The markup is the finished screen; the player rewinds it, plays it through
// and loops, and `stop` leaves it finished again.
OntbijtDemos.define('offerte', (root) => {
  const q = (s) => root.querySelector(s);
  const steps = [...root.querySelectorAll('.ui-step')];
  const heads = [...root.querySelectorAll('.off__head')];
  const srcs = [...root.querySelectorAll('.off-src')];
  const summary = q('.off__summary');
  const doc = q('.off__doc');
  const fields = [...root.querySelectorAll('.off__field')];
  const badge = q('.off__badge');
  const you = q('.off__you');
  const statuses = [...root.querySelectorAll('.off__status')];
  const button = q('.off__button');

  let gen = 0;
  let timers = [];
  const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
  const show = (el) => el.classList.add('is-in');

  function finish() {
    root.classList.remove('is-armed', 'is-waiting');
    steps.forEach((s) => s.classList.remove('is-in'));
    srcs.forEach((s) => s.classList.remove('is-loading'));
    statuses.forEach((s) => { s.textContent = s.dataset.final; });
    button.classList.remove('is-invite');
    button.classList.add('ui-button--ghost');
    button.textContent = '✓ Verzonden';
  }

  function rewind() {
    finish();
    root.classList.add('is-armed', 'is-waiting');
    statuses.forEach((s) => { s.textContent = ''; });
    button.classList.remove('ui-button--ghost');
    button.textContent = 'Goedkeuren';
  }

  async function run(my) {
    const live = () => gen === my;
    while (live()) {
      rewind();
      await wait(700); if (!live()) return;
      show(heads[0]); statuses[0].textContent = 'bronnen…';
      await wait(700); if (!live()) return;
      for (const s of srcs) {
        s.classList.add('is-loading'); show(s);
        await wait(850); if (!live()) return;
        s.classList.remove('is-loading');
        await wait(350); if (!live()) return;
      }
      statuses[0].textContent = statuses[0].dataset.final;
      show(summary);
      await wait(1300); if (!live()) return;
      show(heads[1]); statuses[1].textContent = 'genereren…';
      show(doc);
      await wait(800); if (!live()) return;
      for (const f of fields) {
        show(f);
        await wait(550); if (!live()) return;
      }
      show(badge); statuses[1].textContent = statuses[1].dataset.final;
      await wait(1100); if (!live()) return;
      show(you);
      await wait(1200); if (!live()) return;
      button.classList.add('is-invite');
      await wait(1800); if (!live()) return;
      button.classList.remove('is-invite');
      button.classList.add('ui-button--ghost');
      button.textContent = '✓ Verzonden';
      root.classList.remove('is-waiting');
      await wait(10000);
    }
  }

  return {
    start() { this.stop(); run(++gen); },
    stop() {
      gen++;
      timers.forEach(clearTimeout);
      timers = [];
      finish();
    },
  };
});
