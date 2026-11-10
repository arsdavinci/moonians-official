'use strict';
(() => {
  const screen = document.querySelector('.tv-screen');
  const start = screen?.querySelector('.tv-start');
  if (!start) return;
  const mount = screen.querySelector('.tv-video-mount');
  const badge = screen.querySelector('.tv-preview-status');
  const hoverMedia = matchMedia('(hover: hover) and (pointer: fine)');
  const t = text => window.MoonLanguage.t(text);
  const quietTest = new URL(location.href).searchParams.get('quiet-test') === '1';
  let mode = 'idle';
  let hovering = false;
  let visible = true;
  let hoverTimer;
  let frame;
  let player;
  let ready = false;
  let generation = 0;
  let apiPromise;

  function state(next, message) {
    mode = next;
    screen.dataset.tvState = next;
    start.hidden = next === 'watch';
    badge.textContent = t(message || 'ホバーで音なしプレビュー');
  }
  function loadAPI() {
    if (window.YT?.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timeout = setTimeout(() => reject(new Error('YouTube API timeout')), 15000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        if (typeof previous === 'function') previous();
        resolve();
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => { clearTimeout(timeout); reject(new Error('YouTube API unavailable')); };
      document.head.append(script);
    });
    return apiPromise;
  }
  function discardPlayer() {
    generation++;
    ready = false;
    screen.classList.remove('tv-preview-ready');
    if (player) { try { player.destroy(); } catch { /* The frame may still be loading. */ } }
    player = undefined;
    frame?.remove();
    frame = undefined;
    mount.replaceChildren();
  }
  function stopPreview() {
    clearTimeout(hoverTimer);
    if (mode === 'watch') return;
    state('idle');
    screen.classList.remove('tv-preview-ready');
    if (ready) player.pauseVideo();
    else if (frame) discardPlayer();
  }
  function createPlayer(audible) {
    discardPlayer();
    const token = generation;
    const params = new URLSearchParams({
      list:screen.dataset.playlist, index:'0', autoplay:'1', mute:audible&&!quietTest?'0':'1',
      playsinline:'1', controls:'1', rel:'0', enablejsapi:'1', hl:window.MoonLanguage.current
    });
    if (location.protocol === 'https:' || location.protocol === 'http:') params.set('origin', location.origin);
    frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/videoseries?${params}`;
    frame.title = t('ムーニアンズTVの動画プレーヤー');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.tabIndex = audible ? 0 : -1;
    // The audible frame starts inside the visitor's click, before awaiting the API.
    mount.append(frame);
    const currentFrame = frame;
    loadAPI().then(() => {
      if (token !== generation || !currentFrame.isConnected) return;
      player = new window.YT.Player(currentFrame, {events:{
        onReady(event) {
          if (token !== generation) return;
          ready = true;
          if (quietTest) event.target.setVolume(5);
          if (mode === 'watch') { event.target.unMute(); event.target.playVideo(); }
          else if (mode === 'preview' && hovering && visible && !document.hidden) {
            event.target.mute(); event.target.playVideoAt(0);
            if (event.target.getPlayerState() === window.YT.PlayerState.PLAYING) {
              badge.textContent = t('音なしでプレビュー中');
              screen.classList.add('tv-preview-ready');
            }
          } else { event.target.mute(); event.target.pauseVideo(); }
        },
        onStateChange(event) {
          if (token !== generation) return;
          if (mode === 'preview' && event.data === window.YT.PlayerState.PLAYING) {
            event.target.mute();
            badge.textContent = t('音なしでプレビュー中');
            screen.classList.add('tv-preview-ready');
          } else if (mode === 'idle' && event.data === window.YT.PlayerState.PLAYING) {
            event.target.mute(); event.target.pauseVideo();
          } else if (mode === 'preview' && event.data === window.YT.PlayerState.ENDED) stopPreview();
        },
        onAutoplayBlocked() {
          if (token === generation && mode === 'preview') badge.textContent = t('再生ボタンで動画をご覧ください。');
        },
        onError() {
          if (token !== generation) return;
          discardPlayer();
          state('idle','動画を読み込めませんでした。YouTubeでご覧ください。');
        }
      }});
    }).catch(() => {
      if (token !== generation) return;
      // Native controls remain usable if the helper API is unavailable during sound playback.
      if (mode !== 'watch') {
        discardPlayer();
        state('idle','再生ボタンで動画をご覧ください。');
      }
    });
  }
  function preview() {
    if (!hovering || !visible || document.hidden || mode === 'watch') return;
    state('preview','プレビューを準備中…');
    if (ready) {
      player.mute();
      player.playVideoAt(0);
    } else createPlayer(false);
  }
  screen.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !hoverMedia.matches || mode === 'watch') return;
    hovering = true;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(preview, 180);
  });
  screen.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    stopPreview();
  });
  start.addEventListener('click', () => {
    clearTimeout(hoverTimer);
    document.querySelector('#moon-audio')?.pause();
    state('watch');
    if (ready) { if (quietTest) player.setVolume(5); player.unMute(); player.playVideo(); }
    else createPlayer(true);
    if (frame) frame.tabIndex = 0;
    frame?.focus({preventScroll:true});
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) stopPreview();
  }, {threshold:.15}).observe(screen);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPreview(); });
  hoverMedia.addEventListener('change', () => { if (!hoverMedia.matches) { hovering = false; stopPreview(); } });
  document.addEventListener('moonians:languagechange', () => {
    if (frame) frame.title = t('ムーニアンズTVの動画プレーヤー');
  });
})();
