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

  /* ── holo sheen follows the pointer on character cards ── */
  document.querySelectorAll('.character').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((event.clientX - box.left) / box.width * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((event.clientY - box.top) / box.height * 100).toFixed(1)}%`);
    }, {passive:true});
  });

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
  const marqueeTrack = document.querySelector('.marquee>div');
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
    if (marqueeTrack && motionOn() && marqueeTrack.getAnimations) {
      const velocity = Math.abs(scrollY - lastScroll) / Math.max(16, now - lastTime);
      const animation = marqueeTrack.getAnimations()[0];
      if (animation) {
        animation.playbackRate = 1 + Math.min(9, velocity * 5);
        clearTimeout(marqueeTimer);
        marqueeTimer = setTimeout(() => { animation.playbackRate = 1; }, 220);
      }
    }
    lastScroll = scrollY; lastTime = now;
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); }, {passive:true});
  addEventListener('resize', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); }, {passive:true});
  onScroll();

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
