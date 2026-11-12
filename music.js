'use strict';
(() => {
  const audio = document.getElementById('moon-audio');
  const card = document.getElementById('moon-music');
  if (!audio || !card) return;

  const body = card.querySelector('.music-expanded-body');
  if (body && !body.querySelector('[data-music-lyric]')) {
    body.insertAdjacentHTML('afterbegin', '<div class="music-lyric" lang="ja" aria-hidden="true"><p data-music-lyric>♪</p><p class="music-lyric-next" data-music-lyric-next></p></div>');
  }
  // The player floats: it leaves the hero and follows the page while scrolling.
  card.classList.add('music-float');
  document.body.append(card);
  const hide = document.createElement('button');
  hide.type = 'button';
  hide.className = 'music-float-hide';
  hide.setAttribute('aria-label', 'プレーヤーをしまう');
  hide.textContent = '×';
  card.append(hide);
  const bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'music-bubble';
  bubble.hidden = true;
  bubble.setAttribute('aria-label', '音楽プレーヤーを出す');
  bubble.innerHTML = '<span aria-hidden="true">♫</span><i class="music-dock-light" aria-hidden="true"></i>';
  document.body.append(bubble);
  function setFloatHidden(hidden) {
    card.hidden = hidden;
    bubble.hidden = !hidden;
    try { sessionStorage.setItem('moonians.music-hidden', hidden ? '1' : ''); } catch { /* Optional. */ }
  }
  hide.addEventListener('click', event => { event.stopPropagation(); setFloatHidden(true); bubble.focus({preventScroll:true}); });
  bubble.addEventListener('click', event => { event.stopPropagation(); setFloatHidden(false); card.querySelector('.music-disclosure').open = true; });
  try { if (sessionStorage.getItem('moonians.music-hidden') === '1') setFloatHidden(true); } catch { /* Optional. */ }

  const flyout = document.createElement('section');
  flyout.className = 'music-flyout';
  flyout.id = 'music-flyout';
  flyout.hidden = true;
  flyout.setAttribute('aria-label', '音楽の操作');
  flyout.innerHTML = '<div class="music-flyout-header"><button type="button" class="music-flyout-close" aria-label="音楽の操作を閉じる">×</button></div>' +
    ['.music-kicker','.music-track','.music-expanded-body','.music-footer'].map(selector => card.querySelector(selector).outerHTML).join('');
  document.body.append(flyout);

  const disclosure = card.querySelector('.music-disclosure');
  const summary = disclosure.querySelector('summary');
  const fineHover = matchMedia('(hover: hover) and (pointer: fine)');
  let hovering = false;
  let keyboardInput = false;
  document.addEventListener('keydown', () => { keyboardInput = true; });
  document.addEventListener('pointerdown', () => { keyboardInput = false; }, {passive:true});
  function collapseCard() {
    if (card.contains(document.activeElement) && document.activeElement !== summary) summary.focus({preventScroll:true});
    disclosure.open = false;
  }
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !fineHover.matches) return;
    hovering = true;
    disclosure.open = true;
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    if (!(keyboardInput && card.contains(document.activeElement))) collapseCard();
  });
  summary.addEventListener('click', event => {
    if (event.pointerType === 'mouse' && fineHover.matches) { event.preventDefault(); disclosure.open = true; }
  });
  disclosure.addEventListener('toggle', () => {
    card.classList.toggle('is-expanded', disclosure.open);
    summary.setAttribute('aria-label', disclosure.open ? '音楽の操作を閉じる' : '音楽の操作を開く');
  });
  card.addEventListener('focusout', () => queueMicrotask(() => {
    if (!hovering && !card.contains(document.activeElement)) disclosure.open = false;
  }));
  document.addEventListener('click', event => {
    if (!card.contains(event.target) && !event.target.closest?.('[data-action="music"],.music-bubble,[data-music-page-play],[data-lyrics]')) collapseCard();
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); collapseCard(); }
  });

  const dock = document.querySelector('.site-dock');
  const dockButton = document.createElement('button');
  dockButton.type = 'button';
  dockButton.dataset.action = 'music';
  dockButton.setAttribute('aria-controls', flyout.id);
  dockButton.setAttribute('aria-expanded', 'false');
  dockButton.setAttribute('aria-label', '音楽プレーヤーを開く');
  dockButton.innerHTML = '<span class="dock-symbol">♫</span><span>音楽</span><i class="music-dock-light" aria-hidden="true"></i>';
  if (dock) {
    const passport = dock.querySelector('[data-action="passport"]');
    if (passport) passport.before(dockButton); else dock.append(dockButton);
  }

  const consent = document.createElement('dialog');
  consent.className = 'fx-dialog music-consent';
  consent.setAttribute('aria-labelledby', 'music-consent-title');
  consent.setAttribute('aria-describedby', 'music-consent-description');
  consent.innerHTML = '<span class="consent-moon" aria-hidden="true">☾</span><p class="consent-kicker">WELCOME TO MOONIANS RADIO</p><h2 id="music-consent-title">音楽を流してもいい？</h2><p id="music-consent-description">テーマソング「ぼくらはムーニアンズ」を<br>聴きながら、月の街を楽しもう。</p><div class="music-consent-actions"><button type="button" class="music-allow">はい、音楽と楽しむ <span>▶</span></button><button type="button" class="music-decline" autofocus>いいえ、音楽なしで</button></div><p class="consent-note">後からプレーヤーで再生・停止・音量を変更できます。</p>';
  document.body.append(consent);

  let volume = .3;
  try {
    const saved = localStorage.getItem('moonians.music-volume');
    if (saved !== null && Number.isFinite(Number(saved))) volume = Math.max(0, Math.min(1, Number(saved)));
  } catch { /* Volume works without browser storage. */ }
  if (new URL(location.href).searchParams.get('quiet-test') === '1') volume = .05;
  let lastAudibleVolume = volume || .3;
  let context;
  let gain;
  let stopped = true;
  let waiting = false;
  let failure = '';
  const players = [card, flyout];
  const pagePlay = [...document.querySelectorAll('[data-music-page-play]')];
  const lyricList = document.querySelector('[data-lyrics]');
  const THEME_LYRICS = window.MoonLyrics || [];
  // Page buttons may name their own track (data-track-src etc.); without one they play the theme song.
  const titleEl = card.querySelector('.music-song-title');
  const kickerEl = card.querySelector('.music-kicker');
  const themeTrack = {src: audio.dataset.src, title: titleEl?.textContent || 'ぼくらはムーニアンズ', kicker: kickerEl?.textContent || '', length: 185.716757, lyrics: true};
  const trackOf = button => button.dataset.trackSrc
    ? {src: button.dataset.trackSrc, title: button.dataset.trackTitle || themeTrack.title, kicker: button.dataset.trackKicker || themeTrack.kicker, length: Number(button.dataset.trackLength) || 0, lyrics: false}
    : themeTrack;
  let track = themeTrack;
  let LYRICS = THEME_LYRICS;
  function mediaTitle() {
    if (!('mediaSession' in navigator && 'MediaMetadata' in window)) return;
    try { navigator.mediaSession.metadata = new MediaMetadata({title:window.MoonLanguage.t(track.title),artist:window.MoonLanguage.t('ムーニアンズ')}); } catch { /* Optional. */ }
  }
  function switchTrack(next) {
    if (next.src === track.src) return;
    track = next;
    LYRICS = next.lyrics ? THEME_LYRICS : [];
    lyricIndex = -2;
    audio.pause();
    audio.dataset.src = next.src;
    audio.src = next.src;
    stopped = true;
    if (titleEl) titleEl.textContent = next.title;
    if (kickerEl) kickerEl.textContent = next.kicker;
    each('.music-song-title', el => { el.textContent = next.title; });
    mediaTitle();
    updateProgress();
  }
  let lyricIndex = -2;
  if (lyricList) {
    lyricList.innerHTML = LYRICS.map(([time, text], index) => text
      ? `<button type="button" data-lyric-index="${index}" data-lyric-time="${time}">${text}</button>`
      : '<span class="lyric-gap" aria-hidden="true"></span>').join('');
    lyricList.addEventListener('click', event => {
      const line = event.target.closest?.('[data-lyric-time]');
      if (line) seekTo(Number(line.dataset.lyricTime));
    });
  }
  function updateLyrics(time) {
    let index = -1;
    for (let i = 0; i < LYRICS.length; i++) { if (LYRICS[i][0] <= time + .05) index = i; else break; }
    if (index === lyricIndex) return;
    lyricIndex = index;
    const text = index >= 0 ? LYRICS[index][1] : '';
    let next = '';
    for (let i = index + 1; i < LYRICS.length; i++) { if (LYRICS[i][1]) { next = LYRICS[i][1]; break; } }
    each('[data-music-lyric]', el => {
      el.textContent = text || '♪';
      el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in');
    });
    each('[data-music-lyric-next]', el => { el.textContent = next; });
    if (lyricList) {
      lyricList.querySelectorAll('.is-current').forEach(el => el.classList.remove('is-current'));
      const current = text && lyricList.querySelector(`[data-lyric-index="${index}"]`);
      if (current) {
        current.classList.add('is-current');
        const top = current.offsetTop - lyricList.clientHeight / 2 + current.offsetHeight / 2;
        if (!audio.paused) lyricList.scrollTo({top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      }
    }
  }
  function seekTo(time) {
    const jump = () => { try { audio.currentTime = time; } catch { /* Not seekable yet. */ } updateProgress(); };
    if (audio.readyState >= 1) jump(); else audio.addEventListener('loadedmetadata', jump, {once:true});
    if (audio.paused) play();
  }
  // A timeline on every track card: drag anywhere to play that track from there.
  const pageSeeks = [...document.querySelectorAll('[data-track-seek]')].map(input => {
    const box = input.closest('.track, .bgm-row');
    const button = box?.querySelector('[data-music-page-play]');
    return {input, box, info: button ? trackOf(button) : themeTrack, elapsed: box?.querySelector('[data-track-elapsed]'), held: false};
  });
  function updatePageSeeks(time, length) {
    pageSeeks.forEach(seek => {
      const current = seek.info.src === track.src;
      const max = current ? length : (seek.info.length || Number(seek.input.max) || 1);
      const at = current ? Math.min(time, max) : 0;
      seek.input.max = String(max);
      if (!seek.held) seek.input.value = String(at);
      const shown = seek.held ? Number(seek.input.value) : at;
      seek.input.style.setProperty('--range-fill', `${Math.min(100, shown / max * 100)}%`);
      seek.input.setAttribute('aria-valuetext', `${formatTime(shown)} / ${formatTime(Math.ceil(max))}`);
      if (seek.elapsed) seek.elapsed.textContent = formatTime(shown);
    });
  }
  pageSeeks.forEach(seek => {
    seek.input.addEventListener('pointerdown', () => { seek.held = true; });
    seek.input.addEventListener('input', () => {
      const time = Number(seek.input.value);
      if (seek.elapsed) seek.elapsed.textContent = formatTime(time);
      seek.input.style.setProperty('--range-fill', `${Math.min(100, time / Number(seek.input.max) * 100)}%`);
      if (seek.info.src !== track.src) { switchTrack(seek.info); setFloatHidden(false); }
      seekTo(time);
    });
    const release = () => { seek.held = false; updateProgress(); };
    seek.input.addEventListener('change', release);
    seek.input.addEventListener('pointerup', release);
    seek.input.addEventListener('pointercancel', release);
  });
  const each = (selector, callback) => players.forEach(player => player.querySelectorAll(selector).forEach(callback));
  // Volume controls live in the players and on every track card; they all share one volume.
  const eachVolume = (selector, callback) => { each(selector, callback); document.querySelectorAll(`.track ${selector}`).forEach(callback); };
  let seekingInput = null;
  const duration = () => Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (track.length || 185.716757);
  const formatTime = seconds => {
    const time = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
  };
  function updateProgress() {
    const time = audio.currentTime || 0;
    const length = duration();
    updateLyrics(time);
    updatePageSeeks(time, length);
    each('[data-music-elapsed]', el => { el.textContent = formatTime(time); });
    each('[data-music-duration]', el => { el.textContent = formatTime(Math.ceil(length)); });
    each('[data-music-seek]', input => {
      input.max = String(length);
      input.disabled = !Number.isFinite(audio.duration) || audio.duration <= 0;
      if (input !== seekingInput) input.value = String(Math.min(time, length));
      input.setAttribute('aria-valuetext', `${formatTime(time)} / ${formatTime(Math.ceil(length))}`);
      input.style.setProperty('--range-fill', `${Math.min(100, time / length * 100)}%`);
    });
  }
  function status(text) {
    each('[data-music-status]', el => { if (el.textContent !== text) el.textContent = text; });
  }
  function updateVolume() {
    if (gain && context) gain.gain.setTargetAtTime(volume, context.currentTime, .03);
    else audio.volume = volume;
    const percent = Math.round(volume * 100);
    eachVolume('[data-music-volume]', input => {
      input.value = String(percent);
      input.setAttribute('aria-valuetext', `${percent}%`);
      input.style.setProperty('--range-fill', `${percent}%`);
    });
    eachVolume('[data-music-volume-output]', output => { output.textContent = `${percent}%`; });
    eachVolume('[data-music-mute]', button => {
      button.setAttribute('aria-pressed', String(volume === 0));
      button.setAttribute('aria-label', volume === 0 ? 'ミュートを解除する' : 'ミュートする');
      button.classList.toggle('is-muted', volume === 0);
    });
    try { localStorage.setItem('moonians.music-volume', String(volume)); } catch { /* Optional preference. */ }
  }
  function connectAudio() {
    // A gain node also makes the custom volume slider useful on mobile Safari.
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!context && AudioContextClass && location.protocol !== 'file:') {
      try {
        context = new AudioContextClass();
        gain = context.createGain();
        gain.gain.value = volume;
        const source = context.createMediaElementSource(audio);
        source.connect(gain);
        gain.connect(context.destination);
        audio.volume = 1;
      } catch {
        context = undefined;
        gain = undefined;
        audio.volume = volume;
      }
    }
    return context?.state === 'suspended' ? context.resume() : Promise.resolve();
  }
  function render() {
    const playing = !audio.paused && !audio.ended;
    players.forEach(player => {
      player.classList.toggle('is-playing', playing && !waiting);
      player.classList.toggle('has-error', Boolean(failure));
    });
    dockButton.classList.toggle('is-playing', playing);
    bubble.classList.toggle('is-playing', playing);
    document.body.classList.toggle('music-playing', playing && !waiting);
    pagePlay.forEach(button => {
      const mine = playing && trackOf(button).src === track.src;
      button.setAttribute('aria-label', mine ? '音楽を一時停止する' : '音楽を再生する');
      button.closest('.track, .bgm-row')?.classList.toggle('is-current-track', mine && !waiting);
      const icon = button.querySelector('[data-music-play-icon]'); if (icon) icon.textContent = mine ? 'Ⅱ' : '▶';
      const label = button.querySelector('[data-music-play-label]'); if (label) label.textContent = mine ? '一時停止' : '再生する';
    });
    dockButton.setAttribute('aria-label', playing ? '再生中の音楽プレーヤーを開く' : '音楽プレーヤーを開く');
    each('[data-music-play]', button => {
      button.setAttribute('aria-label', playing ? '音楽を一時停止する' : '音楽を再生する');
      button.querySelector('[data-music-play-icon]').textContent = playing ? 'Ⅱ' : '▶';
      button.querySelector('[data-music-play-label]').textContent = playing ? '一時停止' : '再生';
    });
    if (failure) status(failure);
    else if (waiting) status('音楽を読み込んでいます…');
    else if (playing) status('再生中 — 音楽と、月の街を。');
    else if (stopped) status('停止中 — 再生ボタンで、いつでも。');
    else status('一時停止中 — 続きから再生できます。');
    updateProgress();
  }
  function play() {
    stopped = false;
    failure = '';
    waiting = true;
    render();
    // Both calls start directly inside the visitor's Yes/Play click.
    // There is no sound, audio download or autoplay attempt before that click.
    try {
      if (!audio.getAttribute('src')) audio.src = audio.dataset.src;
      const resumed = connectAudio();
      const started = audio.play();
      Promise.all([resumed, started]).then(() => {
        waiting = false;
        render();
      }).catch(error => {
        waiting = false;
        if (error?.name === 'AbortError' && audio.paused) {
          failure = '';
          render();
          return;
        }
        audio.pause();
        failure = error?.name === 'NotAllowedError'
          ? '再生ボタンを押すと音楽が始まります。'
          : '音楽を読み込めませんでした。再生ボタンでもう一度お試しください。';
        render();
      });
    } catch {
      waiting = false;
      failure = '音楽を読み込めませんでした。再生ボタンでもう一度お試しください。';
      render();
    }
  }
  function stop() {
    stopped = true;
    waiting = false;
    failure = '';
    audio.pause();
    try { audio.currentTime = 0; } catch { /* It may not have loaded yet. */ }
    render();
  }
  each('[data-music-play]', button => button.addEventListener('click', () => {
    if (!audio.paused && !audio.ended) { waiting = false; audio.pause(); }
    else play();
  }));
  pagePlay.forEach(button => button.addEventListener('click', () => {
    const next = trackOf(button);
    if (next.src !== track.src) { switchTrack(next); setFloatHidden(false); play(); }
    else if (!audio.paused && !audio.ended) { waiting = false; audio.pause(); }
    else { setFloatHidden(false); play(); }
  }));
  each('[data-music-stop]', button => button.addEventListener('click', stop));
  eachVolume('[data-music-volume]', input => input.addEventListener('input', () => {
    volume = Number(input.value) / 100;
    if (volume > 0) lastAudibleVolume = volume;
    updateVolume();
  }));
  eachVolume('[data-music-mute]', button => button.addEventListener('click', () => {
    if (volume > 0) { lastAudibleVolume = volume; volume = 0; }
    else volume = lastAudibleVolume;
    updateVolume();
  }));
  each('[data-music-seek]', input => {
    input.addEventListener('pointerdown', () => { seekingInput = input; });
    input.addEventListener('input', () => {
      if (!Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.max(0, Math.min(audio.duration, Number(input.value)));
      stopped = false;
      render();
    });
    const finishSeeking = () => { if (seekingInput === input) seekingInput = null; updateProgress(); };
    input.addEventListener('change', finishSeeking);
    input.addEventListener('blur', finishSeeking);
  });
  ['pointerup','pointercancel'].forEach(type => document.addEventListener(type, () => { seekingInput = null; updateProgress(); }));
  ['loadedmetadata','durationchange','timeupdate','seeked'].forEach(type => audio.addEventListener(type, updateProgress));
  audio.addEventListener('play', render);
  audio.addEventListener('playing', () => { waiting = false; failure = ''; render(); });
  audio.addEventListener('pause', () => { waiting = false; render(); });
  audio.addEventListener('waiting', () => { if (!audio.paused) { waiting = true; render(); } });
  audio.addEventListener('ended', () => { stopped = true; render(); });
  audio.addEventListener('error', () => {
    waiting = false;
    failure = '音楽を読み込めませんでした。再生ボタンでもう一度お試しください。';
    render();
  });

  function closeFlyout(restoreFocus = false) {
    flyout.hidden = true;
    dockButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) dockButton.focus({preventScroll:true});
  }
  dockButton.setAttribute('aria-controls', card.id);
  dockButton.addEventListener('click', () => {
    const open = card.hidden || !disclosure.open;
    setFloatHidden(false);
    disclosure.open = open;
    dockButton.setAttribute('aria-expanded', String(open));
    if (open) card.querySelector('[data-music-play]').focus({preventScroll:true});
  });
  flyout.querySelector('.music-flyout-close').addEventListener('click', () => closeFlyout(true));
  document.addEventListener('click', event => {
    if (!flyout.hidden && !flyout.contains(event.target) && !dockButton.contains(event.target) && !card.contains(event.target)) closeFlyout();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !flyout.hidden) { event.preventDefault(); closeFlyout(true); }
  });

  consent.querySelector('.music-allow').addEventListener('click', () => {
    play();
    consent.close();
  });
  const decline = () => { stop(); consent.close(); };
  consent.querySelector('.music-decline').addEventListener('click', decline);
  consent.addEventListener('cancel', event => { event.preventDefault(); decline(); });
  consent.addEventListener('click', event => { if (event.target === consent) decline(); });
  consent.addEventListener('close', () => document.body.classList.remove('music-consent-open'));
  function ask() {
    const otherDialog = document.querySelector('dialog[open]');
    if (otherDialog) { otherDialog.addEventListener('close', ask, {once:true}); return; }
    closeFlyout();
    consent.showModal();
    document.body.classList.add('music-consent-open');
  }

  if ('mediaSession' in navigator && 'MediaMetadata' in window) {
    try {
      mediaTitle();
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('stop', stop);
    } catch { /* On-page buttons remain available. */ }
  }
  document.addEventListener('moonians:languagechange', () => {
    render();
    updateVolume();
    mediaTitle();
  });
  updateVolume();
  render();
  // The question waits for the opening sequence (cyber.js) when there is one.
  const askAfterBoot = () => (window.MoonBootDone || Promise.resolve()).then(ask);
  if (audio.dataset.consent === 'off') { /* The music page starts from its own play button. */ }
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', askAfterBoot, {once:true});
  else askAfterBoot();
})();
