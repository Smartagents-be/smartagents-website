// ── App-builder demo — slide 5 ────────────────────────────────────────────────
// Geen echte LLM: eender welke zin start dezelfde build-animatie, waarna een
// werkende Flappy Bird-kloon verschijnt. Zo hangt de demo nooit af van wifi
// of API-keys, maar voelt hij voor het publiek wél live aan.
(function () {
  const win = document.getElementById('ab-demo');
  if (!win) return;
  const section  = win.closest('section');
  const input    = document.getElementById('ab-input');
  const sendBtn  = document.getElementById('ab-send');
  const statusEl = document.getElementById('ab-status');
  const stepsEl  = document.getElementById('ab-steps');
  const codeEl   = document.getElementById('ab-code');
  const canvas   = document.getElementById('ab-canvas');
  const ctx      = canvas.getContext('2d');

  const STEPS = [
    { label: 'Vraag analyseren',                        ms: 750 },
    { label: 'Ontwerp kiezen: één scherm, één knop',    ms: 850 },
    { label: 'Code schrijven',                          ms: 3300, code: true, meta: '214 regels' },
    { label: 'Testen',                                  ms: 950,  meta: '0 fouten' },
    { label: 'App starten',                             ms: 700 },
  ];

  const CODE_LINES = [
    "const canvas = document.querySelector('#game');",
    "const ctx = canvas.getContext('2d');",
    'const GRAVITY = 0.55;',
    'const FLAP = -9.5;',
    'const GAP = 215;',
    'const SPEED = 4.2;',
    '',
    'let bird = { x: 170, y: 300, vy: 0 };',
    'let pipes = [];',
    'let score = 0;',
    '',
    'function flap() {',
    '  bird.vy = FLAP;',
    '}',
    '',
    'function spawnPipe() {',
    '  const top = 90 + Math.random() * 260;',
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
    timers.forEach(clearTimeout); timers = [];
    resolvers.forEach((r) => r()); resolvers = [];
    stopGame();
  }

  function setState(s) { win.dataset.state = s; }

  function reset() {
    halt();
    setState('idle');
    statusEl.textContent = '';
    statusEl.classList.remove('live');
    stepsEl.innerHTML = '';
    codeEl.textContent = '';
    input.value = '';
    input.disabled = false;
    sendBtn.disabled = false;
  }

  function addStep(st) {
    const row = document.createElement('div');
    row.className = 'ab-step';
    const ico = document.createElement('span');
    ico.className = 'ab-ico';
    ico.innerHTML = '<span class="ab-spinner"></span>';
    const label = document.createElement('span');
    label.textContent = st.label + '…';
    const meta = document.createElement('span');
    meta.className = 'ab-meta';
    row.append(ico, label, meta);
    stepsEl.appendChild(row);
    requestAnimationFrame(() => row.classList.add('is-in'));
    return { row, ico, label, meta };
  }

  function doneStep(parts, st) {
    parts.row.classList.add('done');
    parts.ico.textContent = '✓';
    parts.label.textContent = st.label;
    if (st.meta) parts.meta.textContent = st.meta;
  }

  async function streamCode(myGen) {
    const shown = [];
    for (const line of CODE_LINES) {
      shown.push(line);
      if (shown.length > 15) shown.shift();
      codeEl.textContent = shown.join('\n');
      await wait(82); if (gen !== myGen) return;
    }
  }

  async function build() {
    halt();
    const myGen = gen;
    setState('build');
    stepsEl.innerHTML = '';
    codeEl.textContent = '';
    input.disabled = true;
    sendBtn.disabled = true;
    input.blur();
    statusEl.textContent = 'Bouwen…';
    statusEl.classList.remove('live');

    for (const st of STEPS) {
      const parts = addStep(st);
      await wait(180); if (gen !== myGen) return;
      if (st.code) {
        await streamCode(myGen); if (gen !== myGen) return;
        await wait(280); if (gen !== myGen) return;
      } else {
        await wait(st.ms); if (gen !== myGen) return;
      }
      doneStep(parts, st);
    }

    await wait(400); if (gen !== myGen) return;
    statusEl.textContent = '● Live';
    statusEl.classList.add('live');
    setState('game');
    input.disabled = false;   // opnieuw typen = opnieuw "bouwen"
    sendBtn.disabled = false;
    startGame();
  }

  function submit() {
    if (!input.value.trim()) return;
    if (win.dataset.state === 'build') return;
    build();
  }
  sendBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

  // ── Flappy Bird ──────────────────────────────────────────────────────────
  const GRAVITY = 0.55, FLAP = -9.5, SPEED = 4.2, GAP = 215, PIPE_W = 92, R = 19, FLOOR_H = 54;
  let raf = 0, running = false;
  let W = 0, H = 0, bird, pipes, score, best = 0, phase = 'ready', frame = 0;

  function sizeCanvas() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
  }

  function initGame() {
    sizeCanvas();
    bird = { x: 170, y: H / 2, vy: 0 };
    pipes = [];
    score = 0;
    phase = 'ready';
    frame = 0;
  }

  function startGame() {
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
    if (phase === 'ready') { phase = 'play'; bird.vy = FLAP; }
    else if (phase === 'play') { bird.vy = FLAP; }
    else { best = Math.max(best, score); initGame(); }
  }
  canvas.addEventListener('pointerdown', pressAction);

  // Spatie = fladderen tijdens het spel. Capture-fase + stopPropagation zodat
  // deck-stage (dat spatie als "volgende slide" leest) hem niet meer ziet.
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
    const m = 90;
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
      if (!pipes.length || pipes[pipes.length - 1].x < W - 360) spawnPipe();
      for (const p of pipes) {
        p.x -= SPEED;
        if (!p.passed && p.x + PIPE_W < bird.x - R) { p.passed = true; score++; }
      }
      pipes = pipes.filter((p) => p.x > -PIPE_W - 20);
      if (collide()) phase = 'dead';
    } else if (phase === 'ready') {
      bird.y = H / 2 + Math.sin(frame / 22) * 12;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPipe(p) {
    ctx.fillStyle = '#13314a';
    ctx.strokeStyle = 'rgba(34,211,238,0.5)';
    ctx.lineWidth = 2;
    const bottomY = p.top + GAP;
    // bovenste pijp + kap
    ctx.fillRect(p.x, -4, PIPE_W, p.top + 4);
    ctx.strokeRect(p.x, -4, PIPE_W, p.top + 4);
    ctx.fillRect(p.x - 7, p.top - 24, PIPE_W + 14, 24);
    ctx.strokeRect(p.x - 7, p.top - 24, PIPE_W + 14, 24);
    // onderste pijp + kap
    ctx.fillRect(p.x, bottomY, PIPE_W, H - FLOOR_H - bottomY);
    ctx.strokeRect(p.x, bottomY, PIPE_W, H - FLOOR_H - bottomY);
    ctx.fillRect(p.x - 7, bottomY, PIPE_W + 14, 24);
    ctx.strokeRect(p.x - 7, bottomY, PIPE_W + 14, 24);
  }

  function drawBird() {
    const tilt = (phase === 'ready') ? Math.sin(frame / 22) * 0.08
      : Math.max(-0.45, Math.min(0.9, bird.vy / 14));
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(tilt);
    ctx.fillStyle = '#fbbf24';
    circle(0, 0, R);
    ctx.fillStyle = '#fde68a';
    circle(-5, 5, R * 0.55);
    // vleugel
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(-7, 1 + Math.sin(frame / 3) * (phase === 'play' ? 3 : 1.5), 9.5, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // oog
    ctx.fillStyle = '#ffffff';
    circle(8, -6, 6.5);
    ctx.fillStyle = '#0f172a';
    circle(10, -6, 3);
    // bek
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.moveTo(16, 1);
    ctx.lineTo(27, 5);
    ctx.lineTo(16, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    // lucht
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0c1830');
    g.addColorStop(1, '#152741');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // sterren
    ctx.fillStyle = 'rgba(148,163,184,0.18)';
    for (let i = 0; i < 26; i++) {
      ctx.fillRect((i * 149) % W, (i * 97) % (H - 160), 2.5, 2.5);
    }
    for (const p of pipes) drawPipe(p);
    // grond
    ctx.fillStyle = '#0e1a2e';
    ctx.fillRect(0, H - FLOOR_H, W, FLOOR_H);
    ctx.strokeStyle = 'rgba(34,211,238,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - FLOOR_H + 1);
    ctx.lineTo(W, H - FLOOR_H + 1);
    ctx.stroke();
    ctx.fillStyle = 'rgba(34,211,238,0.18)';
    const off = (frame * SPEED) % 56;
    for (let x = -off; x < W; x += 56) ctx.fillRect(x, H - FLOOR_H / 2, 26, 4);
    drawBird();
    // score + overlays
    ctx.textAlign = 'center';
    if (phase !== 'ready') {
      ctx.fillStyle = '#f8fafc';
      ctx.font = "700 52px Inter, sans-serif";
      ctx.fillText(String(score), W / 2, 86);
    }
    if (phase === 'ready') {
      ctx.fillStyle = 'rgba(248,250,252,0.85)';
      ctx.font = "600 30px Inter, sans-serif";
      ctx.fillText('Klik of spatie om te starten', W / 2, H / 2 - 110);
    }
    if (phase === 'dead') {
      ctx.fillStyle = 'rgba(2,6,23,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f8fafc';
      ctx.font = "700 46px Inter, sans-serif";
      ctx.fillText('Game over', W / 2, H / 2 - 36);
      ctx.font = "600 30px Inter, sans-serif";
      ctx.fillText('Score: ' + score + (best > 0 ? ' · Beste: ' + Math.max(best, score) : ''), W / 2, H / 2 + 12);
      ctx.fillStyle = 'rgba(248,250,252,0.7)';
      ctx.font = "400 24px Inter, sans-serif";
      ctx.fillText('Klik om opnieuw te spelen', W / 2, H / 2 + 56);
    }
  }

  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.previousSlide === section) reset();
    });
  }
})();


// ── Avatar player — slide 4 ──────────────────────────────────────────────────
(function () {
  const v = document.getElementById('avatar-video');
  if (!v) return;
  const section = v.closest('section');
  const pp     = document.getElementById('avatar-pp');
  const seek   = document.getElementById('avatar-seek');
  const timeEl = document.getElementById('avatar-time');
  const iPlay  = document.getElementById('avatar-i-play');
  const iPause = document.getElementById('avatar-i-pause');

  function fmt(s) {
    s = Math.floor(s || 0);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function syncIcons() {
    const playing = !v.paused && !v.ended;
    iPlay.style.display  = playing ? 'none' : '';
    iPause.style.display = playing ? '' : 'none';
  }
  function syncBar() {
    const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0;
    seek.value = pct;
    seek.style.background =
      'linear-gradient(to right, var(--on-dark-accent) ' + pct + '%, rgba(248,250,252,0.25) ' + pct + '%)';
  }

  function toggle() { v.paused ? v.play() : v.pause(); }
  pp.addEventListener('click', toggle);
  v.addEventListener('click', toggle);

  v.addEventListener('play', syncIcons);
  v.addEventListener('pause', syncIcons);
  v.addEventListener('ended', syncIcons);
  v.addEventListener('loadedmetadata', () => { timeEl.textContent = '0:00 / ' + fmt(v.duration); syncBar(); });
  v.addEventListener('timeupdate', () => { timeEl.textContent = fmt(v.currentTime) + ' / ' + fmt(v.duration); syncBar(); });

  seek.addEventListener('input', () => {
    if (v.duration) { v.currentTime = (seek.value / 100) * v.duration; syncBar(); }
  });

  // metadata may already be loaded before this script runs
  if (v.readyState >= 1) { timeEl.textContent = '0:00 / ' + fmt(v.duration); syncBar(); }

  // deck-stage verbergt slides zonder ze te unmounten — pauzeer dus expliciet
  // zodra de presentator doorklikt, anders speelt de video gewoon verder.
  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.previousSlide === section) v.pause();
    });
  }
})();


// ── Music player — slide 6 (matches the slide-4 control bar) ──────────────────
(function () {
  const a = document.getElementById('music-player');
  if (!a) return;
  const section = a.closest('section');
  const pp     = document.getElementById('music-pp');
  const seek   = document.getElementById('music-seek');
  const timeEl = document.getElementById('music-time');
  const iPlay  = document.getElementById('music-i-play');
  const iPause = document.getElementById('music-i-pause');
  const disc   = document.getElementById('music-disc');

  function fmt(s) {
    s = Math.floor(s || 0);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function syncIcons() {
    const playing = !a.paused && !a.ended;
    iPlay.style.display  = playing ? 'none' : '';
    iPause.style.display = playing ? '' : 'none';
    if (disc) disc.classList.toggle('spinning', playing);
  }
  function syncBar() {
    const pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
    seek.value = pct;
    seek.style.background =
      'linear-gradient(to right, var(--on-dark-accent) ' + pct + '%, rgba(248,250,252,0.25) ' + pct + '%)';
  }

  function toggle() { a.paused ? a.play() : a.pause(); }
  pp.addEventListener('click', toggle);
  disc.addEventListener('click', toggle);

  a.addEventListener('play', syncIcons);
  a.addEventListener('pause', syncIcons);
  a.addEventListener('ended', syncIcons);
  a.addEventListener('loadedmetadata', () => { timeEl.textContent = '0:00 / ' + fmt(a.duration); syncBar(); });
  a.addEventListener('timeupdate', () => { timeEl.textContent = fmt(a.currentTime) + ' / ' + fmt(a.duration); syncBar(); });

  seek.addEventListener('input', () => {
    if (a.duration) { a.currentTime = (seek.value / 100) * a.duration; syncBar(); }
  });

  // metadata may already be loaded before this script runs
  if (a.readyState >= 1) { timeEl.textContent = '0:00 / ' + fmt(a.duration); syncBar(); }

  // deck-stage verbergt slides zonder ze te unmounten — pauzeer dus expliciet
  // zodra de presentator doorklikt, anders speelt het liedje gewoon verder.
  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.previousSlide === section) a.pause();
    });
  }
})();


// ── LLM next-word demo — slide 12 ─────────────────────────────────────────────
(function () {
  const root = document.getElementById('llm-demo');
  if (!root) return;
  const sentenceEl = document.getElementById('llm-sentence');
  const candsEl    = document.getElementById('llm-cands');
  const section    = root.closest('section');

  const SEED  = 'Beste klant, bedankt voor';
  const STEPS = [
    [['je', 71], ['uw', 24], ['het', 5]],
    [['bericht', 64], ['mail', 21], ['bestelling', 15]],
    [['.', 52], [',', 31], ['en', 17]],
    [['We', 57], ['Ik', 31], ['Graag', 12]],
    [['helpen', 44], ['komen', 38], ['bekijken', 18]],
    [['je', 61], ['u', 27], ['graag', 12]],
    [['snel', 48], ['vandaag', 34], ['meteen', 18]],
    [['verder', 55], ['.', 30], ['en', 15]],
    [['.', 79], ['!', 14], ['…', 7]],
  ];
  const isPunct = (w) => /^[.,!…]$/.test(w);

  let timers = [];
  let resolvers = [];
  let gen = 0;
  let caret = null;
  const wait = (ms) => new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms));
    resolvers.push(resolve);
  });
  // Stop the current run: bump the generation (so in-flight loops bail) and
  // unblock any pending wait() so the abandoned async function resolves.
  function halt() {
    gen++;
    timers.forEach(clearTimeout); timers = [];
    resolvers.forEach((r) => r()); resolvers = [];
  }

  function initSentence() {
    sentenceEl.innerHTML = '<span class="s-seed">' + SEED + '</span><span class="s-caret"></span>';
    caret = sentenceEl.querySelector('.s-caret');
  }
  function appendWord(w) {
    const span = document.createElement('span');
    span.className = 's-word s-word--new';
    span.textContent = (isPunct(w) ? '' : ' ') + w;
    sentenceEl.insertBefore(span, caret);
  }
  function setThinking(on) { if (caret) caret.classList.toggle('s-caret--think', on); }

  function renderCands(cands) {
    candsEl.innerHTML = '';
    const rows = cands.map(([w, p]) => {
      const row = document.createElement('div');
      row.className = 'cand';
      row.innerHTML =
        '<span class="cand-w">' + w + '</span>' +
        '<div class="cand-track"><div class="cand-fill"></div></div>' +
        '<span class="cand-p">' + p + '%</span>';
      candsEl.appendChild(row);
      return row;
    });
    requestAnimationFrame(() => {
      rows.forEach((row, i) => { row.querySelector('.cand-fill').style.width = cands[i][1] + '%'; });
    });
    return rows;
  }

  async function loop() {
    halt();                       // cancel any prior run, claim a fresh gen
    const myGen = gen;
    while (gen === myGen) {
      initSentence();
      candsEl.innerHTML = '';
      await wait(980); if (gen !== myGen) return;
      for (const cands of STEPS) {
        setThinking(true);
        const rows = renderCands(cands);
        await wait(1008);          // bars grow, model "weighs" the options
        if (gen !== myGen) return;
        rows[0].classList.add('is-chosen');   // winner lights up
        await wait(504);
        if (gen !== myGen) return;
        appendWord(cands[0][0]);  // chosen word joins the sentence
        await wait(420);
        if (gen !== myGen) return;
      }
      setThinking(false);
      await wait(3920);           // hold the finished sentence, then loop
      if (gen !== myGen) return;
    }
  }

  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.slide === section) loop();
      else if (e.detail.previousSlide === section) halt();
    });
  }
  // direct load on this slide (slidechange may have fired before listener attached)
  if (section.hasAttribute('data-deck-active')) loop();
})();


// ── RAG retrieval demo — slide 13 ─────────────────────────────────────────────
(function () {
  const demo = document.getElementById('rag-demo');
  if (!demo) return;
  const section = demo.closest('section');
  const q      = document.getElementById('rag-q');
  const search = document.getElementById('rag-search');
  const docs   = Array.from(demo.querySelectorAll('.rag-doc'));
  const hit    = document.getElementById('rag-hit');
  const badge  = document.getElementById('rag-badge');
  const dots   = document.getElementById('rag-dots');
  const answer = document.getElementById('rag-a');

  let timers = [];
  let resolvers = [];
  let gen = 0;
  const wait = (ms) => new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms));
    resolvers.push(resolve);
  });
  function halt() {
    gen++;
    timers.forEach(clearTimeout); timers = [];
    resolvers.forEach((r) => r()); resolvers = [];
  }

  function reset() {
    [q, search, answer].concat(docs).forEach((el) => el && el.classList.remove('is-in'));
    hit.classList.remove('is-hit');
    badge.classList.remove('is-in');
    if (dots) dots.style.visibility = 'hidden';
  }

  async function loop() {
    halt();
    const myGen = gen;
    while (gen === myGen) {
      reset();
      await wait(700);  if (gen !== myGen) return;
      q.classList.add('is-in');                       // 1. the question
      await wait(1330);  if (gen !== myGen) return;
      search.classList.add('is-in');                  // 2. start searching
      if (dots) dots.style.visibility = 'visible';
      await wait(910);  if (gen !== myGen) return;
      for (const d of docs) {                          // 3. documents surface
        d.classList.add('is-in');
        await wait(588);  if (gen !== myGen) return;
      }
      await wait(630);  if (gen !== myGen) return;
      hit.classList.add('is-hit');                     // 4. relevant one wins
      badge.classList.add('is-in');
      if (dots) dots.style.visibility = 'hidden';
      await wait(1190);  if (gen !== myGen) return;
      answer.classList.add('is-in');                   // 5. grounded answer + bron
      await wait(10000); if (gen !== myGen) return;     // hold 10s, then loop
    }
  }

  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.slide === section) loop();
      else if (e.detail.previousSlide === section) halt();
    });
  }
  if (section.hasAttribute('data-deck-active')) loop();
})();

// ── FAQ / support agent (knowledge-base grounded) — slide 22 ──────────────────
(function () {
  const demo = document.getElementById('faq-demo');
  if (!demo) return;
  const section = demo.closest('section');
  const kb    = Array.from(demo.querySelectorAll('.faq-kb'));
  const c1    = document.getElementById('faq-c1');
  const chip1 = document.getElementById('faq-chip1');
  const r1    = document.getElementById('faq-r1');
  const c2    = document.getElementById('faq-c2');
  const chip2 = document.getElementById('faq-chip2');
  const r2    = document.getElementById('faq-r2');
  const cartWrap = document.getElementById('faq-cart-wrap');
  const cart  = document.getElementById('faq-cart');

  let timers = [];
  let resolvers = [];
  let gen = 0;
  const wait = (ms) => new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms));
    resolvers.push(resolve);
  });
  function halt() {
    gen++;
    timers.forEach(clearTimeout); timers = [];
    resolvers.forEach((r) => r()); resolvers = [];
  }

  function reset() {
    [c1, chip1, r1, c2, chip2, r2, cartWrap].concat(kb).forEach((el) => el && el.classList.remove('is-in'));
    kb.forEach((p) => p.classList.remove('is-used'));
    cart.classList.remove('glow', 'pressed');
    cart.textContent = '🛒 Toevoegen aan winkelmandje';
  }

  async function loop() {
    halt();
    const myGen = gen;
    while (gen === myGen) {
      reset();
      await wait(840); if (gen !== myGen) return;
      for (const p of kb) {                              // knowledge base populates
        p.classList.add('is-in');
        await wait(182); if (gen !== myGen) return;
      }
      await wait(910); if (gen !== myGen) return;
      c1.classList.add('is-in');                         // exchange 1: technical question
      await wait(1260); if (gen !== myGen) return;
      chip1.classList.add('is-in');                      // agent consults Specs
      kb[3].classList.add('is-used');
      await wait(1190); if (gen !== myGen) return;
      r1.classList.add('is-in');                         // grounded answer
      await wait(1890); if (gen !== myGen) return;
      kb[3].classList.remove('is-used');
      c2.classList.add('is-in');                         // exchange 2: product search
      await wait(1260); if (gen !== myGen) return;
      chip2.classList.add('is-in');                      // agent consults Catalogus
      kb[1].classList.add('is-used');
      await wait(1190); if (gen !== myGen) return;
      r2.classList.add('is-in');                         // suggests product
      await wait(1470); if (gen !== myGen) return;
      cartWrap.classList.add('is-in');                   // tool action appears
      await wait(1330); if (gen !== myGen) return;
      cart.classList.add('glow');
      await wait(2030); if (gen !== myGen) return;
      cart.classList.remove('glow'); cart.classList.add('pressed');  // added to cart
      cart.textContent = '✓ Toegevoegd!';
      await wait(10000); if (gen !== myGen) return;       // hold 10s, then loop
    }
  }

  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.slide === section) loop();
      else if (e.detail.previousSlide === section) halt();
    });
  }
  if (section.hasAttribute('data-deck-active')) loop();
})();

// ── Offerte two-agent generator — slide 23 ────────────────────────────────────
(function () {
  const demo = document.getElementById('off-demo');
  if (!demo) return;
  const section  = demo.closest('section');
  const a1       = document.getElementById('off-a1');
  const a1status = document.getElementById('off-a1-status');
  const srcs     = Array.from(demo.querySelectorAll('.off-src'));
  const summary  = document.getElementById('off-summary');
  const a2       = document.getElementById('off-a2');
  const a2status = document.getElementById('off-a2-status');
  const fields   = Array.from(demo.querySelectorAll('.off-field'));
  const badge    = document.getElementById('off-badge');
  const jij      = document.getElementById('off-jij');
  const jijWait  = document.getElementById('off-jij-wait');
  const jijDone  = document.getElementById('off-jij-done');
  const btn      = document.getElementById('off-btn');

  let timers = [];
  let resolvers = [];
  let gen = 0;
  const wait = (ms) => new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms));
    resolvers.push(resolve);
  });
  function halt() {
    gen++;
    timers.forEach(clearTimeout); timers = [];
    resolvers.forEach((r) => r()); resolvers = [];
  }

  function reset() {
    [a1, summary, a2, jij].concat(srcs).concat(fields).forEach((el) => el && el.classList.remove('is-in'));
    srcs.forEach((s) => s.classList.remove('loading', 'done'));
    badge.classList.remove('is-in');
    jijWait.classList.remove('is-in');
    jijDone.classList.remove('is-in');
    btn.classList.remove('glow', 'pressed');
    btn.textContent = 'Goedkeuren';
    a1status.textContent = '';
    a2status.textContent = '';
  }

  async function loop() {
    halt();
    const myGen = gen;
    while (gen === myGen) {
      reset();
      await wait(910); if (gen !== myGen) return;
      a1.classList.add('is-in');                         // ① Agent 1 appears
      a1status.textContent = 'Bronnen…';
      await wait(840); if (gen !== myGen) return;
      for (const s of srcs) {                            // sources arrive + load
        s.classList.add('is-in', 'loading');
        await wait(952); if (gen !== myGen) return;
        s.classList.remove('loading'); s.classList.add('done');
        await wait(448); if (gen !== myGen) return;
      }
      await wait(490); if (gen !== myGen) return;
      a1status.textContent = '✓ Klaar';
      summary.classList.add('is-in');                    // summary handoff
      await wait(1540); if (gen !== myGen) return;
      a2.classList.add('is-in');                         // ② Agent 2 generates
      a2status.textContent = 'Genereren…';
      await wait(1008); if (gen !== myGen) return;
      for (const f of fields) {                          // pdf fields fill in
        f.classList.add('is-in');
        await wait(602); if (gen !== myGen) return;
      }
      await wait(560); if (gen !== myGen) return;
      badge.classList.add('is-in');                      // pdf ready
      a2status.textContent = '✓ Gereed';
      await wait(1190); if (gen !== myGen) return;
      jij.classList.add('is-in');                        // ③ Jij waits
      jijWait.classList.add('is-in');
      await wait(1330); if (gen !== myGen) return;
      btn.classList.add('glow');                         // button invites
      await wait(2030); if (gen !== myGen) return;
      btn.classList.remove('glow'); btn.classList.add('pressed');  // approve + send
      btn.textContent = '✓ Verzonden';
      jijWait.classList.remove('is-in');
      jijDone.classList.add('is-in');
      await wait(10000); if (gen !== myGen) return;       // hold 10s, then loop
    }
  }

  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.slide === section) loop();
      else if (e.detail.previousSlide === section) halt();
    });
  }
  if (section.hasAttribute('data-deck-active')) loop();
})();

// ── Facturen pipeline (in → read + recognise → booked) — slide 19 ─────────────
(function () {
  const demo = document.getElementById('fac-demo');
  if (!demo) return;
  const section   = demo.closest('section');
  const inv       = document.getElementById('fac-inv');
  const invStatus = document.getElementById('fac-inv-status');
  const arrows    = Array.from(demo.querySelectorAll('.fac-ar'));
  const read      = document.getElementById('fac-read');
  const readStatus= document.getElementById('fac-read-status');
  const fields    = Array.from(demo.querySelectorAll('.fac-field'));
  const booked    = document.getElementById('fac-booked');
  const badge     = document.getElementById('fac-badge');

  let timers = [];
  let resolvers = [];
  let gen = 0;
  const wait = (ms) => new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms));
    resolvers.push(resolve);
  });
  function halt() {
    gen++;
    timers.forEach(clearTimeout); timers = [];
    resolvers.forEach((r) => r()); resolvers = [];
  }

  function reset() {
    [inv, read, booked].concat(arrows).concat(fields).forEach((el) => el && el.classList.remove('is-in'));
    badge.classList.remove('is-in');
    invStatus.textContent = '';
    readStatus.textContent = '';
  }

  async function loop() {
    halt();
    const myGen = gen;
    while (gen === myGen) {
      reset();
      await wait(980); if (gen !== myGen) return;
      inv.classList.add('is-in');                        // ① invoice arrives
      await wait(1050); if (gen !== myGen) return;
      invStatus.textContent = '✓ Binnen';
      arrows[0].classList.add('is-in');
      await wait(840); if (gen !== myGen) return;
      read.classList.add('is-in');                       // ② agent reads
      readStatus.textContent = 'Lezen…';
      await wait(1190); if (gen !== myGen) return;
      for (const f of fields) {                          // recognised fields fill in
        f.classList.add('is-in');
        await wait(784); if (gen !== myGen) return;
      }
      await wait(490); if (gen !== myGen) return;
      readStatus.textContent = '✓ Gematcht';
      arrows[1].classList.add('is-in');
      await wait(910); if (gen !== myGen) return;
      booked.classList.add('is-in');                     // ③ klaargezet voor boekhouder
      await wait(840); if (gen !== myGen) return;
      badge.classList.add('is-in');
      await wait(10000); if (gen !== myGen) return;       // hold 10s, then loop
    }
  }

  const deck = document.querySelector('deck-stage');
  if (deck) {
    deck.addEventListener('slidechange', (e) => {
      if (e.detail.slide === section) loop();
      else if (e.detail.previousSlide === section) halt();
    });
  }
  if (section.hasAttribute('data-deck-active')) loop();
})();
