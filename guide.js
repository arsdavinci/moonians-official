// ぴょんぴーの大冒険 図鑑・攻略ページ。guide-data.json からカードを作る。
(function () {
  'use strict';
  var IMG = 'assets/guide/';
  var WORLD_NAMES = ['', '月あめ平原', '火星ネオンコロニー', 'クリスタル氷星', '星の海', 'リングメカ工場', '魔王星'];
  var MAX = { atk: 8, range: 1220, rate: 4.8, shots: 10 };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function img(name, alt, cls) { return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + IMG + name + '.webp" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">'; }
  function slot(name) { return document.querySelector('[data-slot="' + name + '"]'); }
  function price(n) { return '<span class="g-price" aria-label="柿の種とピーナッツ 各' + n + 'こ">各 <b>' + n + '</b></span>'; }

  // Keep the tab strip just under the header when the header sticks to the top.
  var header = document.querySelector('.site-header'), strip = document.querySelector('.guide-tabs');
  function placeTabs() {
    var pos = header ? getComputedStyle(header).position : '';
    strip.style.setProperty('--guide-top', (pos === 'sticky' || pos === 'fixed') ? header.offsetHeight + 'px' : '0px');
  }
  placeTabs(); window.addEventListener('resize', placeTabs);

  // ── tabs ──
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.guide-tabs [data-tab]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  function openTab(id, scroll) {
    if (!panels.some(function (p) { return p.dataset.panel === id; })) id = 'weapons';
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.tab === id)); });
    panels.forEach(function (p) { p.hidden = p.dataset.panel !== id; });
    var active = tabs.filter(function (t) { return t.dataset.tab === id; })[0];
    var strip = active.parentElement;
    strip.scrollLeft = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
    if (scroll) {
      var head = header && /sticky|fixed/.test(getComputedStyle(header).position) ? header.offsetHeight : 0;
      var anchor = scroll === 'force' ? (document.getElementById('guide') || strip.parentElement) : strip.parentElement;
      var top = anchor.getBoundingClientRect().top + window.scrollY - head - 8;
      if (scroll === 'force' || window.scrollY > top) window.scrollTo({ top: top, behavior: scroll === 'force' ? 'auto' : 'smooth' });
    }
  }
  tabs.forEach(function (t) {
    t.id = 'tab-' + t.dataset.tab;
    t.setAttribute('aria-controls', 'panel-' + t.dataset.tab);
    t.addEventListener('click', function () { openTab(t.dataset.tab, true); history.replaceState(null, '', '#guide-' + t.dataset.tab); });
  });
  // Links like game.html#guide-shop open that tab.
  function fromHash() { var m = /^#guide-(\w+)$/.exec(location.hash); return m ? m[1] : null; }
  openTab(fromHash() || 'weapons', false);
  if (fromHash()) window.addEventListener('load', function () { setTimeout(function () { openTab(fromHash(), 'force'); }, 300); });
  window.addEventListener('hashchange', function () { if (fromHash()) openTab(fromHash(), 'force'); });

  fetch('guide-data.json?v=20261112-3').then(function (r) { return r.json(); }).then(render).catch(function () {
    document.getElementById('guide-body').insertAdjacentHTML('afterbegin', '<p class="guide-note">図鑑のデータを読みこめませんでした。ページを読みなおしてみてな。</p>');
  });

  function render(d) {
    renderWeapons(d);
    renderFusion(d.fusion);
    renderShop(d.shop);
    renderFoes(d);
    renderWorlds(d);
    renderTips(d.tips);
    // Tap to swap a picture (enemy attack pose, vehicle action).
    document.querySelectorAll('[data-swap]').forEach(function (b) {
      var pic = b.querySelector('img'), a = pic.getAttribute('src'), z = IMG + b.dataset.swap + '.webp';
      new Image().src = z;
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        pic.src = on ? z : a;
      });
    });
  }

  function stat(label, key, w) {
    var pct = Math.max(6, Math.round(w[key] / MAX[key] * 100));
    return '<div class="g-stat"><span class="g-k">' + label + '</span><span class="g-bar"><i style="width:' + pct + '%"></i></span><b>' + w[key] + '</b></div>';
  }
  function weaponCard(w) {
    var kind = w.kind === 'moon' ? '🌙月' : '⭐星';
    return '<article class="g-card g-weapon is-' + w.kind + '">' +
      '<div class="g-pic">' + img(w.img, w.name) + '<span class="g-lv">Lv' + w.lv + '</span><span class="g-kind">' + kind + '</span></div>' +
      '<h4>' + esc(w.name) + '<small translate="no">' + esc(w.en) + '</small></h4>' +
      '<div class="g-stats">' + stat('攻撃', 'atk', w) + stat('とどく', 'range', w) + stat('連射', 'rate', w) + stat('弾の数', 'shots', w) + '</div>' +
      '<p class="g-pattern"><span>撃ち方</span>' + esc(w.pattern) + '</p></article>';
  }
  function renderWeapons(d) {
    var html = '';
    [['moon', '🌙 月の武器', 'MOON'], ['star', '⭐ 星の武器', 'STAR']].forEach(function (k) {
      html += '<h3 class="guide-h3 is-' + k[0] + '"><small>' + k[2] + ' WEAPONS</small>' + k[1] + '</h3><div class="g-grid">' +
        d.weapons.filter(function (w) { return w.kind === k[0]; }).map(weaponCard).join('') + '</div>';
    });
    html += '<h3 class="guide-h3 is-special"><small>SPECIAL VEHICLES</small>とくべつな乗り物</h3><div class="g-vehicles">' +
      d.vehicles.map(function (v) {
        // Secret: show only the silhouette.
        return '<article class="g-card g-vehicle"><div class="g-pic g-secret-pic">' + img(v.img, v.name + 'のシルエット', 'g-secret') + '<span class="g-q" aria-hidden="true">？</span></div>' +
          '<div class="g-vehicle-body"><span class="g-badge is-secret">SECRET ／ シークレット</span><h4>' + esc(v.name) + '<small translate="no">' + esc(v.en) + '</small></h4>' +
          '<p class="g-recipe"><span>作り方</span>' + esc(v.recipe) + '</p><p>' + esc(v.text) + '</p></div></article>';
      }).join('') + '</div>';
    slot('weapons').innerHTML = html;
  }

  function dots(n) { var s = ''; for (var i = 0; i < n; i++) s += '<i></i>'; return s; }
  function renderFusion(f) {
    var html = '<ol class="g-steps">' + f.how.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>';
    html += '<div class="g-card g-fuse-demo" aria-hidden="true"><span class="g-fuse-w">' + img('weapon-moon-01-moon-popper', '') + '<b>Lv1</b></span><em>＋</em><span class="g-fuse-w">' + img('weapon-moon-01-moon-popper', '') + '<b>Lv1</b></span><em>→</em><span class="g-fuse-w is-up">' + img('weapon-moon-02-twinmoon-shooter', '') + '<b>Lv2</b></span></div>';
    html += '<div class="g-card g-fuse-special"><p><span>' + img('weapon-moon-08-moonian-nova', '') + '🌙Lv8</span><em>＋</em><span>' + img('weapon-star-08-stellar-guardian-cannon', '') + '⭐Lv8</span><em>→</em><span>' + img('weapon-mech-icon', '', 'g-secret') + 'ロボット</span></p>' +
      '<p><span>' + img('weapon-mech-icon', '', 'g-secret') + 'ロボット</span><em>＋</em><span>' + img('weapon-mech-icon', '', 'g-secret') + 'ロボット</span><em>→</em><span>' + img('weapon-fighter-icon', '', 'g-secret') + '戦闘機</span></p></div>';
    html += '<h3 class="guide-h3"><small>HOW MANY?</small>Lv1 だけで作ると、なんこいる？</h3><div class="g-ladder">' +
      f.ladder.map(function (l) { return '<div class="g-card g-rung"><p><b>Lv' + l.lv + '</b>には Lv1 が <strong>' + l.need + 'こ</strong></p><div class="g-dots n' + l.need + '" aria-hidden="true">' + dots(l.need) + '</div></div>'; }).join('') + '</div>';
    html += '<h3 class="guide-h3"><small>DROP RULES</small>出てくる武器のルール</h3><ul class="g-rules">' + f.rules.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<div class="g-table-wrap"><table class="g-table"><thead><tr><th>ワールド</th><th>出てくる武器</th><th>合成して作れる目標</th></tr></thead><tbody>' +
      f.drops.map(function (r) { return '<tr><td><b>' + r.world + '</b> ' + WORLD_NAMES[r.world] + '</td><td>' + esc(r.drop) + '</td><td>' + esc(r.goal) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    slot('fusion').innerHTML = html;
  }

  function renderShop(s) {
    var html = '<div class="g-card g-keeper">' + img(s.keeper.img, '店主のモチまる') + '<div><p class="g-keeper-name"><small>店主</small>' + esc(s.keeper.name) + '</p><ul>' + s.notes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div></div>';
    html += '<h3 class="guide-h3"><small>ALWAYS IN STOCK</small>どこでも買える（8こ）</h3><div class="g-grid">' +
      s.items.map(function (it) { return '<article class="g-card g-item"><div class="g-pic">' + img(it.img, it.name) + '</div><h4>' + esc(it.name) + '</h4>' + price(it.price) + '<p>' + esc(it.text) + '</p></article>'; }).join('') + '</div>';
    html += '<h3 class="guide-h3"><small>WORLD LIMITED</small>ワールド限定</h3><p class="guide-intro">そのワールドのステージの中のお店だけで買える。</p>';
    for (var w = 1; w <= 6; w++) {
      html += '<p class="g-world-tag"><b>' + w + '</b>' + WORLD_NAMES[w] + '</p><div class="g-grid">' +
        s.limited.filter(function (it) { return it.world === w; }).map(function (it) {
          return '<article class="g-card g-item is-limited"><span class="g-only">ここだけ！</span><div class="g-pic"><span class="g-mark" style="--mark:' + it.color + '" aria-hidden="true">' + esc(it.mark) + '</span></div><h4>' + esc(it.name) + '</h4>' + price(it.price) + '<p>' + esc(it.text) + '</p></article>';
        }).join('') + '</div>';
    }
    slot('shop').innerHTML = html;
  }

  function renderFoes(d) {
    var html = '';
    for (var w = 1; w <= 6; w++) {
      var b = d.bosses.filter(function (x) { return x.world === w; })[0];
      var e = d.enemies.filter(function (x) { return x.world === w; })[0];
      html += '<div class="g-foe-world"><p class="g-world-tag"><b>' + w + '</b>' + WORLD_NAMES[w] + '</p>' +
        '<article class="g-card g-boss"><button class="g-pic g-swap" type="button" data-swap="' + b.img + '-attack" aria-pressed="false" aria-label="' + esc(b.name) + 'の攻撃の姿を見る">' + img(b.img, b.name) + '<span class="g-tap" aria-hidden="true">さわってみて</span></button>' +
        '<div class="g-foe-body"><span class="g-badge is-boss">BOSS</span><h4>' + esc(b.name) + '<small translate="no">' + esc(b.en) + '</small></h4><p class="g-title">' + esc(b.title) + ' ／ すみか：' + esc(b.home) + '</p>' +
        '<p class="g-line">「' + esc(b.line) + '」</p><dl class="g-prof"><div><dt>見た目</dt><dd>' + esc(b.look) + '</dd></div><div><dt>せいかく</dt><dd>' + esc(b.nature) + '</dd></div><div><dt>好き</dt><dd>' + esc(b.like) + '</dd></div><div><dt>にがて</dt><dd>' + esc(b.dislike) + '</dd></div></dl></div></article>' +
        '<article class="g-card g-enemy"><button class="g-pic g-swap" type="button" data-swap="' + e.img + '-attack" aria-pressed="false" aria-label="' + esc(e.name) + 'の攻撃の姿を見る">' + img(e.img, e.name) + '</button>' +
        '<div class="g-foe-body"><span class="g-badge">ENEMY</span><h4>' + esc(e.name) + '<small translate="no">' + esc(e.en) + '</small></h4><p class="g-line">「' + esc(e.line) + '」</p>' +
        '<p>' + esc(e.look) + ' ' + esc(e.nature) + '</p><p class="g-ingame"><span>ゲームでは</span>' + esc(e.game) + '</p></div></article></div>';
    }
    slot('foes').innerHTML = html;
  }

  function renderWorlds(d) {
    slot('worlds').innerHTML = '<div class="g-worlds">' + d.worlds.map(function (w) {
      return '<article class="g-card g-world">' + img(w.bg, '', 'g-world-bg') + '<div class="g-world-body"><span class="g-world-no">WORLD ' + w.no + '</span><h4>' + esc(w.name) + '<small translate="no">' + esc(w.en) + '</small></h4><p>' + esc(w.text) + '</p></div></article>';
    }).join('') + '</div><ul class="g-rules">' + d.worldNotes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  }

  function renderTips(t) {
    slot('tips').innerHTML = '<div class="g-tips">' + t.map(function (x, i) {
      return '<details class="g-card g-tip"' + (i < 3 ? ' open' : '') + '><summary><span class="g-tip-no">' + String(i + 1).padStart(2, '0') + '</span>' + esc(x.title) + '</summary><p>' + esc(x.text) + '</p></details>';
    }).join('') + '</div>';
  }
})();
