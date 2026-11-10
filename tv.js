'use strict';
(() => {
  const screen = document.querySelector('.tv-screen');
  const preview = screen?.querySelector('.tv-preview');
  if (!preview) return;
  preview.addEventListener('click', () => {
    // Keep the theme song and the video soundtrack from playing over each other.
    document.querySelector('#moon-audio')?.pause();
    const player = document.createElement('iframe');
    const language = window.MoonLanguage.current;
    player.src = `https://www.youtube-nocookie.com/embed/botLtQdCyu0?autoplay=1&playsinline=1&rel=0&hl=${language}`;
    player.title = window.MoonLanguage.t('ムーニアンズTVの動画プレーヤー');
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    screen.replaceChildren(player);
    player.focus({preventScroll:true});
  }, {once:true});
})();
