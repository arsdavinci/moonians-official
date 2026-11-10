'use strict';
(() => {
  const audio = document.getElementById('moon-audio');
  const card = document.getElementById('moon-music');
  if (!audio || !card) return;

  const flyout = document.createElement('section');
  flyout.className = 'music-flyout';
  flyout.id = 'music-flyout';
  flyout.hidden = true;
  flyout.setAttribute('aria-label', '音楽の操作');
  flyout.innerHTML = '<div class="music-flyout-header"><span>MOONIANS RADIO</span><button type="button" class="music-flyout-close" aria-label="音楽の操作を閉じる">×</button></div>' +
    ['.music-track','.music-status','.music-transport','.music-seek','.music-volume'].map(selector => card.querySelector(selector).outerHTML).join('');
  document.body.append(flyout);

  const dock = document.querySelector('.site-dock');
  const dockButton = document.createElement('button');
  dockButton.type = 'button';
  dockButton.dataset.action = 'music';
  dockButton.setAttribute('aria-controls', flyout.id);
  dockButton.setAttribute('aria-expanded', 'false');
  dockButton.setAttribute('aria-label', '音楽プレーヤーを開く');
  dockButton.innerHTML = '<span class="dock-symbol">♫</span><span>音楽</span><i class="music-dock-light" aria-hidden="true"></i>';
  dock.querySelector('[data-action="passport"]').before(dockButton);

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
  let lastAudibleVolume = volume || .3;
  let context;
  let gain;
  let stopped = true;
  let waiting = false;
  let failure = '';
  let isSeeking = false;
  const players = [card, flyout];
  const each = (selector, callback) => players.forEach(player => player.querySelectorAll(selector).forEach(callback));
  const formatTime = seconds => {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
  };
  const duration = () => Number.isFinite(audio.duration) ? audio.duration : 185.716757;
  function status(text) {
    each('[data-music-status]', el => { if (el.textContent !== text) el.textContent = text; });
  }
  function updateVolume() {
    if (gain && context) gain.gain.setTargetAtTime(volume, context.currentTime, .03);
    else audio.volume = volume;
    const percent = Math.round(volume * 100);
    each('[data-music-volume]', input => {
      input.value = String(percent);
      input.setAttribute('aria-valuetext', `${percent}%`);
      input.style.setProperty('--range-fill', `${percent}%`);
    });
    each('[data-music-volume-output]', output => { output.textContent = `${percent}%`; });
    each('[data-music-mute]', button => {
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
  function updateProgress() {
    const time = audio.currentTime || 0;
    each('[data-music-elapsed]', el => { el.textContent = formatTime(time); });
    each('[data-music-duration]', el => { el.textContent = formatTime(Math.ceil(duration())); });
    each('[data-music-seek]', input => {
      input.max = String(duration());
      input.disabled = !Number.isFinite(audio.duration);
      if (!isSeeking) input.value = String(time);
      input.setAttribute('aria-valuetext', `${formatTime(time)} / ${formatTime(Math.ceil(duration()))}`);
      input.style.setProperty('--range-fill', `${Math.min(100, time / duration() * 100)}%`);
    });
  }
  function render() {
    const playing = !audio.paused && !audio.ended;
    players.forEach(player => player.classList.toggle('is-playing', playing && !waiting));
    dockButton.classList.toggle('is-playing', playing);
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
  each('[data-music-stop]', button => button.addEventListener('click', stop));
  each('[data-music-volume]', input => input.addEventListener('input', () => {
    volume = Number(input.value) / 100;
    if (volume > 0) lastAudibleVolume = volume;
    updateVolume();
  }));
  each('[data-music-mute]', button => button.addEventListener('click', () => {
    if (volume > 0) { lastAudibleVolume = volume; volume = 0; }
    else volume = lastAudibleVolume;
    updateVolume();
  }));
  each('[data-music-seek]', input => {
    input.addEventListener('pointerdown', () => { isSeeking = true; });
    input.addEventListener('input', () => {
      if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(audio.duration, Number(input.value));
      input.setAttribute('aria-valuetext', formatTime(Number(input.value)));
    });
    input.addEventListener('change', () => { isSeeking = false; updateProgress(); });
    input.addEventListener('blur', () => { isSeeking = false; updateProgress(); });
  });
  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('play', render);
  audio.addEventListener('playing', () => { waiting = false; failure = ''; render(); });
  audio.addEventListener('pause', render);
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
  dockButton.addEventListener('click', () => {
    const open = flyout.hidden;
    flyout.hidden = !open;
    dockButton.setAttribute('aria-expanded', String(open));
    if (open) flyout.querySelector('[data-music-play]').focus({preventScroll:true});
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
      navigator.mediaSession.metadata = new MediaMetadata({title:'ぼくらはムーニアンズ',artist:'ムーニアンズ'});
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('stop', stop);
    } catch { /* On-page buttons remain available. */ }
  }
  updateVolume();
  render();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ask, {once:true});
  else ask();
})();
