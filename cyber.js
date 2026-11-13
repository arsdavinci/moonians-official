'use strict';
/* MOON OS effects layer. Everything here is decoration: each block checks that its
   elements exist, so the same file runs on the home, anime and sources pages. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const t = value => (window.MoonLanguage ? window.MoonLanguage.t(value) : value);
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)').matches;
  const hasExperience = Boolean(document.querySelector('.site-dock'));
  if (!hasExperience) {
    // Pages without the dock still honour the saved motion preference.
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('moonians.motion')); } catch { /* optional */ }
    if (saved === false || (saved === null && reduceQuery.matches)) body.classList.add('motion-paused');
  }
  const motionOn = () => !body.classList.contains('motion-paused');
  const isNight = () => body.classList.contains('site-night');

  /* ── boot sequence ── */
  let bootResolve;
  window.MoonBootDone = new Promise(resolve => { bootResolve = resolve; });
  function finishBoot() { body.classList.add('is-booted'); bootResolve(); }
  if (root.classList.contains('boot-pending') && motionOn()) {
    const boot = document.createElement('div');
    boot.className = 'moon-boot';
    boot.setAttribute('role', 'presentation');
    boot.innerHTML = '<div class="moon-boot-inner"><img src="assets/logo.png?v=20261110-11" alt="" width="2421" height="833"><p class="moon-boot-title">MOON GATE // DOCKING SEQUENCE</p><div class="moon-boot-bar"><i></i></div><div class="moon-boot-row"><span>EARTH → INNER MOON</span><span class="moon-boot-percent">000%</span></div><div class="moon-boot-log" aria-hidden="true"></div><p class="moon-boot-skip">CLICK TO SKIP</p></div>';
    body.append(boot);
    root.classList.remove('boot-pending');
    try { sessionStorage.setItem('moonians.boot', '1'); } catch { /* optional */ }
    const lines = ['LINK  EARTH ↔ MOON', 'GRAVITY  1/6 G', 'PASTEL NEON  ONLINE'];
    const log = boot.querySelector('.moon-boot-log');
    const percent = boot.querySelector('.moon-boot-percent');
    const started = performance.now();
    const duration = 1500;
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      boot.style.setProperty('--boot', '1');
      percent.textContent = '100%';
      boot.classList.add('is-done');
      finishBoot();
      setTimeout(() => boot.remove(), 950);
    }
    function tick(now) {
      if (closed) return;
      const p = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      boot.style.setProperty('--boot', eased.toFixed(3));
      percent.textContent = `${String(Math.round(eased * 100)).padStart(3, '0')}%`;
      const shown = Math.min(lines.length, Math.floor(p * (lines.length + .6)));
      if (log.childElementCount < shown) {
        const row = document.createElement('div');
        row.innerHTML = `&gt; ${lines[log.childElementCount]} … <b>OK</b>`;
        log.append(row);
      }
      if (p < 1) requestAnimationFrame(tick); else setTimeout(close, 220);
    }
    requestAnimationFrame(tick);
    boot.addEventListener('click', close);
    document.addEventListener('keydown', close, {once:true});
    setTimeout(close, 4000);
  } else {
    root.classList.remove('boot-pending');
    finishBoot();
  }

  /* ── starfield ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'space-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const palette = ['255,255,255', '255,255,255', '214,202,255', '255,170,228', '160,255,224', '160,214,255', '255,243,170'];
  const dayPalette = ['122,92,240', '122,92,240', '224,86,174', '20,170,136', '58,140,224'];
  let stars = [], meteors = [], width = 0, height = 0, starFrame = 0, nextMeteor = 2500, pointerX = 0, pointerY = 0;
  function buildStars() {
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    width = innerWidth; height = innerHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(230, Math.round(width * height / 7000));
    stars = Array.from({length:count}, () => {
      const depth = .15 + Math.random() * .85;
      return {x:Math.random(), y:Math.random(), depth, size:.5 + depth * 1.5 * Math.random() + (Math.random() > .96 ? 1.6 : 0), phase:Math.random() * 6.28, speed:.6 + Math.random() * 1.8, tint:Math.floor(Math.random() * 7)};
    });
  }
  function spawnMeteor(now) {
    const fromLeft = Math.random() > .5;
    meteors.push({x:fromLeft ? Math.random() * width * .6 : width * (.4 + Math.random() * .6), y:Math.random() * height * .45, vx:(fromLeft ? 1 : -1) * (520 + Math.random() * 380), vy:230 + Math.random() * 200, born:now, life:850 + Math.random() * 500, tint:palette[2 + Math.floor(Math.random() * 5)]});
  }
  function drawStars(now) {
    const night = isNight();
    const seconds = now / 1000;
    ctx.clearRect(0, 0, width, height);
    const scroll = scrollY;
    for (const star of stars) {
      const x = ((star.x * width + pointerX * star.depth * 14) % width + width) % width;
      const y = ((star.y * height - scroll * star.depth * .18 + pointerY * star.depth * 10) % height + height) % height;
      const twinkle = .5 + Math.sin(seconds * star.speed + star.phase) * .5;
      const alpha = night ? .25 + twinkle * .75 * star.depth : (.1 + twinkle * .32) * star.depth;
      const tint = night ? palette[star.tint] : dayPalette[star.tint % dayPalette.length];
      ctx.fillStyle = `rgba(${tint},${alpha.toFixed(3)})`;
      if (star.size > 2.1) {
        const r = star.size * (1.4 + twinkle * .9);
        ctx.beginPath();
        ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
        ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(x, y, star.size * .62, 0, 6.283); ctx.fill();
      }
    }
    meteors = meteors.filter(m => now - m.born < m.life);
    for (const m of meteors) {
      const age = (now - m.born) / 1000, life = (now - m.born) / m.life;
      const x = m.x + m.vx * age, y = m.y + m.vy * age;
      const tail = .16;
      const gradient = ctx.createLinearGradient(x, y, x - m.vx * tail, y - m.vy * tail);
      const strength = Math.sin(life * Math.PI) * (night ? .95 : .5);
      gradient.addColorStop(0, `rgba(${night ? '255,255,255' : '122,92,240'},${strength})`);
      gradient.addColorStop(.3, `rgba(${m.tint},${strength * .6})`);
      gradient.addColorStop(1, `rgba(${m.tint},0)`);
      ctx.strokeStyle = gradient; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - m.vx * tail, y - m.vy * tail); ctx.stroke();
    }
  }
  function loopStars(now) {
    if (now > nextMeteor) { spawnMeteor(now); nextMeteor = now + 3500 + Math.random() * 6500; }
    drawStars(now);
    starFrame = requestAnimationFrame(loopStars);
  }
  function updateStars() {
    cancelAnimationFrame(starFrame); starFrame = 0;
    if (motionOn() && !document.hidden) starFrame = requestAnimationFrame(loopStars);
    else { meteors = []; drawStars(0); }
  }
  buildStars();
  updateStars();
  addEventListener('resize', () => { buildStars(); if (!starFrame) drawStars(0); }, {passive:true});
  document.addEventListener('visibilitychange', updateStars);
  new MutationObserver(updateStars).observe(body, {attributes:true, attributeFilter:['class']});
  addEventListener('scroll', () => { if (!starFrame) drawStars(0); }, {passive:true});

  /* ── cursor ring + click sparks ── */
  if (fine) {
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    body.append(ring);
    let targetX = -100, targetY = -100, ringX = -100, ringY = -100, ringFrame = 0;
    function followRing() {
      ringX += (targetX - ringX) * .2; ringY += (targetY - ringY) * .2;
      ring.style.transform = `translate3d(${ringX.toFixed(1)}px,${ringY.toFixed(1)}px,0)`;
      ringFrame = Math.abs(targetX - ringX) + Math.abs(targetY - ringY) > .3 ? requestAnimationFrame(followRing) : 0;
    }
    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX; targetY = event.clientY;
      pointerX = event.clientX / innerWidth - .5; pointerY = event.clientY / innerHeight - .5;
      if (!ring.classList.contains('is-visible')) { ringX = targetX; ringY = targetY; ring.classList.add('is-visible'); }
      ring.classList.toggle('is-hot', Boolean(event.target.closest && event.target.closest('a,button,summary,input,[data-photo]')));
      if (!ringFrame && motionOn()) ringFrame = requestAnimationFrame(followRing);
    }, {passive:true});
    document.documentElement.addEventListener('pointerleave', () => ring.classList.remove('is-visible'));
    const sparkColors = ['#ff9be0', '#8dffd9', '#b9a5ff', '#fff09a', '#8fd3ff'];
    document.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || !motionOn() || (event.target.closest && event.target.closest('input,video,iframe'))) return;
      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('i');
        spark.className = 'click-spark';
        spark.setAttribute('aria-hidden', 'true');
        spark.textContent = i % 2 ? '✦' : '✧';
        const angle = Math.PI * 2 * i / 6 + Math.random() * .8, distance = 26 + Math.random() * 30;
        spark.style.left = `${event.clientX - 6}px`; spark.style.top = `${event.clientY - 7}px`;
        spark.style.setProperty('--sx', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--sy', `${Math.sin(angle) * distance}px`);
        spark.style.setProperty('--spark', sparkColors[i % sparkColors.length]);
        body.append(spark);
        setTimeout(() => spark.remove(), 720);
      }
    }, {passive:true});
  }

  /* ── hero HUD frame with a live Tokyo clock ── */
  const hero = document.querySelector('.immersive-hero');
  if (hero) {
    const frame = document.createElement('div');
    frame.className = 'hud-frame';
    frame.setAttribute('aria-hidden', 'true');
    frame.innerHTML = '<div class="hud-side"><span>SECTOR 0422–0721</span><span>TOKYO <b class="hud-clock">--:--:--</b> JST</span></div>';
    hero.querySelector('.panorama').after(frame);
    const clock = frame.querySelector('.hud-clock');
    const formatter = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Tokyo', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false});
    const updateClock = () => { if (!document.hidden) clock.textContent = formatter.format(new Date()); };
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ── today's real moon age in the signal bar ── */
  const moonAge = document.querySelector('[data-moon-age]');
  if (moonAge) {
    const synodic = 29.530588853;
    const age = (((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % synodic + synodic) % synodic;
    const names = ['新月', '三日月', '上弦の月', '十三夜月', '満月', '居待月', '下弦の月', '有明月'];
    const name = names[Math.floor(((age + synodic / 16) % synodic) / (synodic / 8))];
    const lit = (1 - Math.cos(age / synodic * Math.PI * 2)) / 2;
    const shift = (1 - lit) * 100 * (age < synodic / 2 ? 1 : -1);
    moonAge.innerHTML = `<i class="moon-icon" style="--moon-shift:${shift.toFixed(0)}%"></i><span>MOON AGE ${age.toFixed(1)}</span><span class="moon-phase-name"></span>`;
    moonAge.querySelector('.moon-phase-name').textContent = t(name);
    moonAge.title = '';
  }

  /* ── decode effect on English HUD labels ── */
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#';
  function decode(el) {
    const final = el.textContent;
    if (!motionOn() || el.childElementCount || /[぀-ヿ一-鿿]/.test(final)) return;
    const started = performance.now(), duration = 520 + final.length * 14;
    (function step(now) {
      const p = Math.min(1, (now - started) / duration), solved = Math.floor(p * final.length);
      let out = final.slice(0, solved);
      for (let i = solved; i < final.length; i++) out += final[i] === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)];
      el.textContent = p < 1 ? out : final;
      if (p < 1) requestAnimationFrame(step);
    })(started);
  }
  const decodeObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    decodeObserver.unobserve(entry.target);
    window.MoonBootDone.then(() => decode(entry.target));
  }), {threshold:.6});
  document.querySelectorAll('.eyebrow,.english-name,.big-label').forEach(el => decodeObserver.observe(el));

  /* ── the signature is written out when the message above it scrolls into view
     (a fully clipped element never reports as intersecting, so watch its neighbour) ── */
  const signature = document.querySelector('.moon-signature');
  if (signature && motionOn()) {
    signature.classList.add('sig-wait');
    new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      signature.classList.add('is-signing');
      signature.classList.remove('sig-wait');
    }, {threshold:.9}).observe(signature.previousElementSibling || signature.parentElement);
  }

  /* ── holo sheen follows the pointer on character cards ── */
  document.querySelectorAll('.character').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((event.clientX - box.left) / box.width * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((event.clientY - box.top) / box.height * 100).toFixed(1)}%`);
    }, {passive:true});
  });

  /* ══ motion kit ══ */
  // Rotating word: the words stay in Japanese here; language.js translates them as they change.
  document.querySelectorAll('[data-rotator]').forEach(line => {
    const words = line.dataset.rotator.split('|');
    const word = line.querySelector('b');
    let index = 0;
    setInterval(() => {
      if (!motionOn() || document.hidden) return;
      word.style.translate = '0 -100%';
      setTimeout(() => {
        index = (index + 1) % words.length;
        word.style.transition = 'none';
        word.textContent = words[index];
        word.style.translate = '0 100%';
        void word.offsetHeight;
        word.style.transition = '';
        word.style.translate = '0 0';
      }, 600);
    }, 2600);
  });

  // Magnetic buttons.
  if (fine) document.querySelectorAll('.tv-channel-link,.nav-social,.anime-cta,.character-talk,.back-top,.explode-xray,.passport-download,.anime-back').forEach(button => {
    button.classList.add('is-magnetic');
    button.addEventListener('pointermove', event => {
      if (!motionOn()) return;
      const box = button.getBoundingClientRect();
      button.style.translate = `${(event.clientX - box.left - box.width / 2) * .22}px ${(event.clientY - box.top - box.height / 2) * .3}px`;
    }, {passive:true});
    button.addEventListener('pointerleave', () => { button.style.translate = ''; });
  });

  // Night lens: the same photo, graded as night, shows through around the cursor.
  const albumPhoto = document.querySelector('.gallery-moon');
  if (albumPhoto && fine) {
    const lens = document.createElement('i');
    lens.className = 'night-lens';
    lens.setAttribute('aria-hidden', 'true');
    lens.style.backgroundImage = `url(${albumPhoto.querySelector('img').getAttribute('src')})`;
    albumPhoto.append(lens);
    albumPhoto.classList.add('has-lens');
    albumPhoto.addEventListener('pointermove', event => {
      const box = albumPhoto.getBoundingClientRect();
      lens.style.setProperty('--x', `${event.clientX - box.left}px`);
      lens.style.setProperty('--y', `${event.clientY - box.top}px`);
    }, {passive:true});
  }

  // Pointer parallax layers.
  const depthLayers = [['.anime-hero-bg', 22], ['.anime-hero-copy', -8], ['.lab-hero-photo', 14], ['.footer-giant', 10]]
    .map(([selector, depth]) => ({el:document.querySelector(selector), depth})).filter(layer => layer.el);
  if (fine && depthLayers.length) {
    depthLayers.forEach(layer => layer.el.setAttribute('data-depth', layer.depth));
    addEventListener('pointermove', event => {
      if (!motionOn() || event.pointerType !== 'mouse') return;
      const x = event.clientX / innerWidth - .5, y = event.clientY / innerHeight - .5;
      depthLayers.forEach(layer => { layer.el.style.translate = `${(-x * layer.depth).toFixed(1)}px ${(-y * layer.depth).toFixed(1)}px`; });
    }, {passive:true});
  }

  // Ink reveal: wrap the intro paragraphs so their text lights up with the scroll.
  const inks = [...document.querySelectorAll('.world-copy>p:not(.world-sign)')].map(paragraph => {
    const ink = document.createElement('span');
    ink.className = 'ink';
    ink.append(...paragraph.childNodes);
    paragraph.append(ink);
    return ink;
  });

  // Stacking cards for the build log, only when every entry fits the screen.
  const stackLog = document.querySelector('.lab-log');
  const stackCards = stackLog ? [...stackLog.querySelectorAll('.lab-entry')] : [];
  function checkStack() {
    if (!stackLog) return;
    stackCards.forEach((cardEl, index) => { cardEl.style.setProperty('--i', index); });
    const fits = motionOn() && innerWidth > 860 && stackCards.every(cardEl => cardEl.offsetHeight < innerHeight - 190);
    stackLog.classList.toggle('can-stack', fits);
    if (!fits) stackCards.forEach(cardEl => { cardEl.style.scale = ''; cardEl.style.filter = ''; });
  }
  checkStack();
  addEventListener('resize', checkStack, {passive:true});
  addEventListener('load', checkStack);

  // Count-up for plain numbers.
  document.querySelectorAll('.lab-specs b').forEach(el => {
    const text = el.textContent.trim();
    if (!/^\d+$/.test(text) || !motionOn()) return;
    const to = Number(text), started = performance.now() + 500;
    (function step(now) {
      const p = Math.max(0, Math.min(1, (now - started) / 1500));
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3)))).padStart(text.length, '0');
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  });

  // Depth carousel of the four scenes in the world section.
  const worldLayout = document.querySelector('.world-layout');
  if (worldLayout) {
    const sceneList = [['assets/moon-city.png', '月の内部都市'], ['assets/kabukicho-duo.jpg', '歌舞月町'], ['assets/lunar-studio.jpeg', '月のスタジオ'], ['assets/scene-cockpit.jpg', '宇宙船コックピット']];
    const carousel = document.createElement('div');
    carousel.className = 'scene-carousel';
    carousel.setAttribute('role', 'group');
    carousel.setAttribute('aria-label', '月と地球の風景');
    carousel.innerHTML = `<div class="scene-cards">${sceneList.map(([src, name], index) => `<button class="scene-card" type="button" data-slot="${index}"><img src="${src}" alt="" loading="lazy"><span class="location-tag">${name}</span></button>`).join('')}</div><div class="scene-carousel-nav"><button type="button" data-turn="-1" aria-label="前の風景">←</button><span class="scene-dots" aria-hidden="true">${sceneList.map(() => '<i></i>').join('')}</span><button type="button" data-turn="1" aria-label="次の風景">→</button></div>`;
    worldLayout.querySelector('.world-photo').after(carousel);
    worldLayout.classList.add('has-carousel');
    const sceneCards = [...carousel.querySelectorAll('.scene-card')], dots = [...carousel.querySelectorAll('.scene-dots i')];
    let front = 0;
    const place = () => {
      sceneCards.forEach((cardEl, index) => {
        const slot = (index - front + sceneCards.length) % sceneCards.length;
        cardEl.dataset.slot = slot;
        cardEl.tabIndex = slot === 2 ? -1 : 0;
      });
      dots.forEach((dot, index) => dot.classList.toggle('is-on', index === front));
    };
    const turn = step => { front = (front + step + sceneCards.length) % sceneCards.length; place(); };
    let swiped = false;
    sceneCards.forEach((cardEl, index) => cardEl.addEventListener('click', () => { if (swiped) { swiped = false; return; } front = index === front ? (front + 1) % sceneCards.length : index; place(); }));
    carousel.querySelectorAll('[data-turn]').forEach(button => button.addEventListener('click', () => turn(Number(button.dataset.turn))));
    // Swipe left/right (touch, pen or mouse drag) to turn the carousel.
    const deck = carousel.querySelector('.scene-cards');
    let startX = 0, startY = 0, tracking = false;
    deck.addEventListener('pointerdown', event => { if (event.button > 0) return; tracking = true; swiped = false; startX = event.clientX; startY = event.clientY; }, {passive:true});
    deck.addEventListener('pointerup', event => {
      if (!tracking) return;
      tracking = false;
      const dx = event.clientX - startX, dy = event.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped = true; turn(dx < 0 ? 1 : -1); setTimeout(() => { swiped = false; }, 400); }
    });
    deck.addEventListener('pointercancel', () => { tracking = false; });
    deck.addEventListener('dragstart', event => event.preventDefault());
    place();
  }

  // Home character cards: compact cards, tap one to open the full profile.
  const characterGrid = document.querySelector('.character-grid');
  if (characterGrid && characterGrid.querySelector('.character-detail')) {
    characterGrid.classList.add('is-cards');
    characterGrid.querySelectorAll('.character').forEach(card => {
      const detail = card.querySelector('.character-detail');
      const info = card.querySelector('.character-info');
      const name = card.classList.contains('ranpyon') ? 'らんぴょん' : 'ぴょんぴー';
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'character-open';
      open.innerHTML = 'くわしく見る <span aria-hidden="true">＋</span>';
      open.setAttribute('aria-haspopup', 'dialog');
      info.append(open);
      const sheet = document.createElement('dialog');
      sheet.className = 'character-dialog';
      sheet.setAttribute('aria-label', `${name}のプロフィール`);
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'character-dialog-close';
      close.setAttribute('aria-label', 'プロフィールを閉じる');
      close.textContent = '×';
      const article = document.createElement('article');
      article.className = card.className.replace(/\b(reveal-wait|revealed)\b/g, '');
      article.append(card.querySelector('.character-image').cloneNode(true));
      const body = document.createElement('div');
      body.className = 'character-info';
      info.querySelectorAll(':scope>.english-name,:scope>h3,:scope>p').forEach(el => body.append(el.cloneNode(true)));
      body.append(detail);   // moved, not copied, so its buttons keep working
      article.append(body);
      const scroller = document.createElement('div');
      scroller.className = 'character-dialog-scroll';
      scroller.append(article);
      sheet.append(close, scroller);
      document.body.append(sheet);
      const more = detail.querySelector(':scope>details');
      if (more) more.open = true;
      open.addEventListener('click', event => {
        event.stopPropagation();
        sheet.showModal();
        scroller.scrollTop = 0;
        close.focus({preventScroll:true});
        document.body.classList.add('character-open-lock');
      });
      close.addEventListener('click', () => sheet.close());
      sheet.addEventListener('click', event => { if (event.target === sheet) sheet.close(); });
      sheet.addEventListener('close', () => {
        document.body.classList.remove('character-open-lock');
        open.focus({preventScroll:true});
      });
    });
  }

  // Keep the current page visible in the sideways-scrolling sub-page nav.
  const pageNav = document.querySelector('.page-nav'), currentLink = pageNav && pageNav.querySelector('[aria-current=page]');
  if (currentLink && pageNav.scrollWidth > pageNav.clientWidth) pageNav.scrollLeft = currentLink.offsetLeft - (pageNav.clientWidth - currentLink.offsetWidth) / 2;

  // Star trail that follows the mouse on every page.
  const trailArea = document;
  if (fine) {
    let lastSpark = 0;
    const marks = ['✦', '✧', '☾', '★'], tints = ['#ff9be0', '#8dffd9', '#b9a5ff', '#fff09a'];
    trailArea.addEventListener('pointermove', event => {
      const now = performance.now();
      if (!motionOn() || event.pointerType !== 'mouse' || now - lastSpark < 65) return;
      lastSpark = now;
      const spark = document.createElement('i');
      spark.className = 'trail-spark';
      spark.setAttribute('aria-hidden', 'true');
      spark.textContent = marks[Math.floor(Math.random() * marks.length)];
      spark.style.left = `${event.clientX - 7}px`;
      spark.style.top = `${event.clientY - 9}px`;
      spark.style.setProperty('--sx', `${Math.random() * 60 - 30}px`);
      spark.style.setProperty('--spark', tints[Math.floor(Math.random() * tints.length)]);
      body.append(spark);
      setTimeout(() => spark.remove(), 900);
    }, {passive:true});
  }

  /* ── orbit rail: section dots + a moon that fills as you scroll ── */
  const sections = [['world', 'この世界のこと'], ['characters', '仲間たち'], ['journal', '街のおたより'], ['gallery', 'アルバム'], ['history', '活動の記録'], ['connect', 'SNSで会おう']]
    .map(([id, label]) => ({id, label, el:document.getElementById(id)})).filter(section => section.el);
  let rail, railLinks = [], railPercent;
  if (sections.length) {
    rail = document.createElement('nav');
    rail.className = 'orbit-rail';
    rail.setAttribute('aria-label', 'セクション');
    rail.innerHTML = `<span class="rail-moon" aria-hidden="true"></span>${sections.map(section => `<a href="#${section.id}" aria-label="${section.label}"></a>`).join('')}<span class="rail-percent" aria-hidden="true">00</span>`;
    body.append(rail);
    railLinks = [...rail.querySelectorAll('a')];
    railPercent = rail.querySelector('.rail-percent');
  }

  /* ── scroll-driven bits: rail, flight-log trace, marquee speed ── */
  const historyList = document.querySelector('.history-list');
  const marqueeTracks = [...document.querySelectorAll('.marquee>div')];
  let scrollFrame = 0, lastScroll = scrollY, lastTime = performance.now(), marqueeTimer = 0;
  function onScroll() {
    scrollFrame = 0;
    const now = performance.now();
    const distance = root.scrollHeight - innerHeight;
    const progress = distance > 0 ? Math.min(1, scrollY / distance) : 0;
    body.classList.toggle('at-top', scrollY < 80);
    if (rail) {
      rail.style.setProperty('--progress', progress.toFixed(3));
      railPercent.textContent = String(Math.round(progress * 100)).padStart(2, '0');
      let current = -1;
      sections.forEach((section, index) => { if (section.el.getBoundingClientRect().top < innerHeight * .5) current = index; });
      railLinks.forEach((link, index) => link.classList.toggle('is-current', index === current));
    }
    if (historyList) {
      const box = historyList.getBoundingClientRect();
      historyList.style.setProperty('--trace', Math.max(0, Math.min(1, (innerHeight * .7 - box.top) / box.height)).toFixed(3));
    }
    if (marqueeTracks.length && motionOn() && marqueeTracks[0].getAnimations) {
      const velocity = Math.abs(scrollY - lastScroll) / Math.max(16, now - lastTime);
      const running = marqueeTracks.map(track => track.getAnimations()[0]).filter(Boolean);
      running.forEach(animation => { animation.playbackRate = 1 + Math.min(9, velocity * 5); });
      clearTimeout(marqueeTimer);
      marqueeTimer = setTimeout(() => running.forEach(animation => { animation.playbackRate = 1; }), 220);
    }
    inks.forEach(ink => {
      const box = ink.parentElement.getBoundingClientRect();
      ink.style.setProperty('--lit', motionOn() ? Math.max(0, Math.min(1, (innerHeight * .88 - box.top) / (innerHeight * .42))).toFixed(3) : '1');
    });
    if (stackLog) {
      stackCards.forEach((cardEl, index) => {
        const next = stackCards[index + 1];
        if (!next) return;
        const gap = next.getBoundingClientRect().top - cardEl.getBoundingClientRect().top;
        const covered = Math.max(0, Math.min(1, 1 - gap / Math.max(1, cardEl.offsetHeight)));
        cardEl.style.scale = (1 - covered * .06).toFixed(3);
        cardEl.style.filter = `brightness(${(1 - covered * .35).toFixed(2)})`;
      });
    }
    lastScroll = scrollY; lastTime = now;
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); }, {passive:true});
  addEventListener('resize', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); }, {passive:true});
  onScroll();

  /* ── orbit scene: scrolling scrubs through a frame sequence ──
     Frames load only when the section is near the viewport. Without motion the
     section stays a normal block with its first frame as a still image. */
  const orbit = document.querySelector('.orbit-scene');
  if (orbit && motionOn()) {
    const total = Number(orbit.dataset.frames);
    const small = innerWidth < 700 || (navigator.connection && navigator.connection.saveData);
    const stride = small ? 2 : 1;
    const indexes = [];
    for (let i = 1; i <= total; i += stride) indexes.push(i);
    const frames = new Array(indexes.length);
    const view = orbit.querySelector('.orbit-canvas').getContext('2d');
    const glow = orbit.querySelector('.orbit-bg').getContext('2d');
    const steps = [...orbit.querySelectorAll('.orbit-step')];
    const angleLabel = orbit.querySelector('.orbit-angle');
    const frameLabel = orbit.querySelector('.orbit-frame');
    const bar = orbit.querySelector('.orbit-bar');
    let loading = false, current = 0, shown = -1, orbitFrame = 0, orbitVisible = false, activeStep = 0;
    orbit.classList.add('is-scrub');
    function loadFrames() {
      if (loading) return;
      loading = true;
      let next = 0;
      const pump = () => {
        if (next >= indexes.length) return;
        const slot = next++;
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => { frames[slot] = image; if (slot === 0) orbit.classList.add('is-ready'); shown = -1; pump(); };
        image.onerror = pump;
        image.src = `${orbit.dataset.path}${String(indexes[slot]).padStart(3, '0')}.webp`;
      };
      for (let i = 0; i < 6; i++) pump();
    }
    function nearestLoaded(slot) {
      for (let distance = 0; distance < frames.length; distance++) {
        if (frames[slot - distance]) return slot - distance;
        if (frames[slot + distance]) return slot + distance;
      }
      return -1;
    }
    function renderOrbit() {
      orbitFrame = 0;
      if (!motionOn()) { orbit.classList.remove('is-scrub', 'is-ready'); return; }
      const box = orbit.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -box.top / Math.max(1, box.height - innerHeight)));
      const target = progress * (frames.length - 1);
      current += (target - current) * .16;
      if (Math.abs(target - current) < .02) current = target;
      const slot = nearestLoaded(Math.round(current));
      if (slot >= 0 && slot !== shown) {
        shown = slot;
        view.drawImage(frames[slot], 0, 0, 640, 1138);
        glow.drawImage(frames[slot], 0, 0, 64, 114);
      }
      const eased = current / Math.max(1, frames.length - 1);
      bar.style.setProperty('--orbit', eased.toFixed(3));
      angleLabel.textContent = `ORBIT ${String(Math.round(eased * 60)).padStart(3, '0')}°`;
      frameLabel.textContent = `F ${String(indexes[Math.round(current)] || 1).padStart(3, '0')} / ${total}`;
      const step = progress < .36 ? 0 : progress < .7 ? 1 : 2;
      if (step !== activeStep) { activeStep = step; steps.forEach((el, index) => el.classList.toggle('is-active', index === step)); }
      if (orbitVisible && (current !== target || slot !== Math.round(current))) orbitFrame = requestAnimationFrame(renderOrbit);
    }
    const kickOrbit = () => { if (orbitVisible && !orbitFrame) orbitFrame = requestAnimationFrame(renderOrbit); };
    new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadFrames(); }, {rootMargin:'150% 0px'}).observe(orbit);
    new IntersectionObserver(entries => { orbitVisible = entries[0].isIntersecting; kickOrbit(); }).observe(orbit);
    addEventListener('scroll', kickOrbit, {passive:true});
    addEventListener('resize', kickOrbit, {passive:true});
    setInterval(kickOrbit, 400);
  }

  /* ── 3D Pyonpy: three.js and the model load only when the stage is near ── */
  const pyonpyStage = document.getElementById('pyonpy-3d');
  if (pyonpyStage) {
    pyonpyStage.hidden = false;
    const stageObserver = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      stageObserver.disconnect();
      import('./pyonpy3d.js?v=20261111-8').then(module => module.mountPyonpy(pyonpyStage, {motionOn})).catch(() => { pyonpyStage.hidden = true; });
    }, {rootMargin:'80% 0px'});
    stageObserver.observe(pyonpyStage);
  }

  /* ── easter egg: type “moon”, or tap the giant footer logo three times ── */
  let typed = '', gravityTimer = 0, taps = 0, tapTimer = 0;
  function lowGravity() {
    if (!motionOn()) return;
    body.classList.add('low-gravity');
    const now = performance.now();
    for (let i = 0; i < 16; i++) setTimeout(() => spawnMeteor(performance.now()), i * 140);
    nextMeteor = now + 4000;
    const toast = document.querySelector('.explore-toast');
    if (toast) {
      toast.querySelector('.toast-message').textContent = t('低重力モード、発動！月の重力は、地球の6分の1やで。');
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 4200);
    }
    clearTimeout(gravityTimer);
    gravityTimer = setTimeout(() => body.classList.remove('low-gravity'), 9000);
  }
  document.addEventListener('keydown', event => {
    if (event.key.length !== 1 || event.metaKey || event.ctrlKey || (event.target.closest && event.target.closest('input,textarea,[contenteditable="true"]'))) return;
    typed = (typed + event.key.toLowerCase()).slice(-4);
    if (typed === 'moon') { typed = ''; lowGravity(); }
  });
  const giant = document.querySelector('.footer-giant');
  if (giant) giant.addEventListener('click', () => {
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { taps = 0; }, 900);
    if (taps >= 3) { taps = 0; lowGravity(); }
  });
})();
