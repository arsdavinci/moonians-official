'use strict';
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const fineQuery = matchMedia('(pointer: fine)');
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(`moonians.${key}`)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(`moonians.${key}`, JSON.stringify(value)); } catch { /* The experience also works without storage. */ } }
  };
  let motion = store.get('motion', !reduceQuery.matches);
  let night = store.get('night', false);
  const progress = document.createElement('div');
  progress.className = 'page-progress';
  progress.setAttribute('aria-hidden', 'true');
  body.append(progress);
  const aura = document.createElement('div');
  aura.className = 'cursor-aura';
  aura.setAttribute('aria-hidden', 'true');
  body.append(aura);

  const destinations = [
    {id:'world',title:'この世界のこと',description:'月の内側に広がる街へ',symbol:'☾',stamp:'MOON CITY'},
    {id:'characters',title:'仲間たち',description:'らんぴょんとぴょんぴーに会う',symbol:'♡',stamp:'MOON FRIENDS'},
    {id:'journal',title:'街のおたより',description:'写真・動画・テーマソング',symbol:'♫',stamp:'MOON LETTER'},
    {id:'gallery',title:'アルバム',description:'二人の日常を大きな写真で',symbol:'✧',stamp:'MEMORIES'},
    {id:'history',title:'活動の記録',description:'地球での出演と活動の足あと',symbol:'⌁',stamp:'CHRONICLE'},
    {id:'connect',title:'SNSで会おう',description:'いつもの場所で、つながろう',symbol:'↗',stamp:'EARTH LINK'}
  ];
  const savedVisits = store.get('visits', []);
  const visited = new Set(Array.isArray(savedVisits) ? savedVisits.filter(id => destinations.some(d => d.id === id)) : []);

  const dock = document.createElement('nav');
  dock.className = 'site-dock';
  dock.setAttribute('aria-label', '街を楽しむメニュー');
  dock.innerHTML = `<button type="button" data-action="guide" aria-haspopup="dialog"><span class="dock-symbol">⌖</span><span>街のガイド</span><span class="dock-key">⌘ K</span></button><button type="button" data-action="theme" aria-label="夜の街に切り替える" aria-pressed="false"><span class="dock-symbol">☾</span><span class="theme-label">夜の街へ</span></button><button type="button" data-action="motion" aria-label="画面の動きを抑える" aria-pressed="false"><span class="dock-symbol">≈</span><span class="motion-label">動きを抑える</span></button><button type="button" data-action="passport" aria-haspopup="dialog"><span class="dock-symbol">✧</span><span>パスポート</span><span class="stamp-count">0/6</span></button>`;
  body.append(dock);

  const guide = document.createElement('dialog');
  guide.className = 'fx-dialog';
  guide.setAttribute('aria-labelledby', 'guide-title');
  guide.innerHTML = `<div class="fx-dialog-top"><span>YOUR MOON CITY GUIDE</span><button class="fx-close" type="button" aria-label="ガイドを閉じる">×</button></div><h2 class="guide-title" id="guide-title">どこへ、行こう？</h2><label class="guide-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="街の行き先を検索" placeholder="キャラクター、写真、SNS…" autocomplete="off"></label><div class="guide-results">${destinations.map((d,i)=>`<a href="#${d.id}" data-search="${d.title} ${d.description} ${d.id}"><span>0${i+1}</span><div><b>${d.title}</b><small>${d.description}</small></div><span>↗</span></a>`).join('')}</div><p class="guide-empty" hidden>その行き先は、まだ見つからないみたい。別の言葉で探してみてね。</p><p class="guide-help">Tabで行き先を選択 / Enterで移動 / Escで閉じる</p>`;
  body.append(guide);

  const passport = document.createElement('dialog');
  passport.className = 'fx-dialog';
  passport.setAttribute('aria-labelledby', 'passport-title');
  passport.innerHTML = `<div class="fx-dialog-top"><span>MOONIANS / VISITOR CENTER</span><button class="fx-close" type="button" aria-label="パスポートを閉じる">×</button></div><div class="passport-card"><span class="passport-label">YOUR LITTLE MOON PASSPORT</span><h2 id="passport-title">きみも、ムーニー。</h2><p>街の6つの場所をめぐって、<br>きみだけの思い出を集めよう。</p><div class="passport-id"><span>EARTH VISITOR</span><span>MOON ↔ EARTH</span></div><div class="stamp-grid">${destinations.map(d=>`<div class="passport-stamp" data-stamp="${d.id}"><span aria-hidden="true">${d.symbol}</span><b>${d.title}</b><small>${d.stamp}</small></div>`).join('')}</div></div><p class="passport-progress" aria-live="polite"></p><div class="passport-actions"><button type="button" class="passport-download">記念パスポートを保存 <span>↓</span></button><p class="passport-privacy">スタンプは、このブラウザーに保存されます。</p></div>`;
  body.append(passport);
  const toast = document.createElement('div');
  toast.className = 'explore-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = '<span aria-hidden="true">✧</span><span class="toast-message"></span>';
  body.append(toast);
  let toastTimer;
  function announce(message) {
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  }
  function celebrate() {
    if (!motion) return;
    const colors = ['#cbb0f2','#f7a6d3','#9fe6cb','#f7dfa1','#b0d9ff'];
    for (let i=0; i<26; i++) {
      const particle = document.createElement('i');
      particle.className = 'confetti-particle';
      particle.setAttribute('aria-hidden', 'true');
      particle.style.setProperty('--confetti-x', `${(Math.random()-.5)*650}px`);
      particle.style.setProperty('--confetti-y', `${(Math.random()-.5)*480}px`);
      particle.style.setProperty('--confetti-rotation', `${Math.random()*600}deg`);
      particle.style.setProperty('--confetti-color', colors[i%colors.length]);
      body.append(particle);
      setTimeout(() => particle.remove(), 1450);
    }
  }
  function updateStamps() {
    dock.querySelector('.stamp-count').textContent = `${visited.size}/6`;
    passport.querySelectorAll('[data-stamp]').forEach(el => {
      const collected = visited.has(el.dataset.stamp);
      el.classList.toggle('collected', collected);
      el.setAttribute('aria-label', `${destinations.find(d=>d.id===el.dataset.stamp).title}：${collected?'訪問済み':'未訪問'}`);
    });
    passport.querySelector('.passport-progress').textContent = visited.size===6 ? '街めぐり、完了！またいつでも遊びに来てな。' : `${visited.size} / 6 SPOTS EXPLORED — 次の思い出を見つけに行こう。`;
  }
  updateStamps();
  const visitsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || visited.has(entry.target.id)) return;
      const destination = destinations.find(d => d.id===entry.target.id);
      visited.add(destination.id);
      store.set('visits', [...visited]);
      updateStamps();
      if (visited.size===6) { announce('6つの思い出がそろった！パスポートをのぞいてみて。'); celebrate(); }
      else announce(`${destination.title} のスタンプを受け取ったよ。 ${visited.size}/6`);
    });
  }, {threshold:.12});
  destinations.forEach(d => visitsObserver.observe(document.getElementById(d.id)));

  function openDialog(dialog) {
    if (document.querySelector('dialog[open]')) return;
    dialog.showModal();
    body.classList.add('fx-modal-open');
  }
  [guide,passport].forEach(dialog => {
    dialog.querySelector('.fx-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if(e.target===dialog) dialog.close(); });
    dialog.addEventListener('close', () => body.classList.remove('fx-modal-open'));
  });
  dock.querySelector('[data-action="guide"]').addEventListener('click', () => openDialog(guide));
  dock.querySelector('[data-action="passport"]').addEventListener('click', () => { updateStamps(); openDialog(passport); });
  const search = guide.querySelector('input');
  search.addEventListener('input', () => {
    const term = search.value.normalize('NFKC').toLocaleLowerCase().trim();
    let shown=0;
    guide.querySelectorAll('[data-search]').forEach(a => {
      a.hidden = !a.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(term);
      if(!a.hidden) shown++;
    });
    guide.querySelector('.guide-empty').hidden = shown!==0;
  });
  search.addEventListener('keydown', e => {
    if (e.key==='Enter') {
      const first=guide.querySelector('[data-search]:not([hidden])');
      if(first) { e.preventDefault(); first.click(); }
    }
    if (e.key==='ArrowDown') { e.preventDefault(); guide.querySelector('[data-search]:not([hidden])')?.focus(); }
  });
  guide.querySelector('.guide-results').addEventListener('click', e => { if(e.target.closest('a')) guide.close(); });
  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k' && !e.target.closest('input,textarea,[contenteditable="true"]')) {
      e.preventDefault();
      if(guide.open) guide.close(); else openDialog(guide);
    }
  });

  passport.querySelector('.passport-download').addEventListener('click', () => {
    const date = new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const stamps = destinations.map((d,i) => {
      const x=145+(i%3)*195, y=350+Math.floor(i/3)*165;
      const active=visited.has(d.id);
      return `<g transform="translate(${x},${y}) rotate(${i%2?6:-6})"><circle r="64" fill="${active?'#e5d5f6':'#f3ecfa'}" stroke="${active?'#ad82c9':'#cdbbdb'}" stroke-width="2" ${active?'':'stroke-dasharray="4 5"'}/><circle r="57" fill="none" stroke="#bca0cc"/><text text-anchor="middle" y="-5" font-size="30" fill="${active?'#7f5099':'#c4b4ce'}">${d.symbol}</text><text text-anchor="middle" y="20" font-size="12" fill="#695275">${d.title}</text><text text-anchor="middle" y="36" font-size="8" fill="#9d7ab0">${active?'VISITED':'NEXT TIME'}</text></g>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="800" viewBox="0 0 680 800"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#e9ddff"/><stop offset=".55" stop-color="#ffe2ee"/><stop offset="1" stop-color="#d6f8e7"/></linearGradient></defs><rect width="680" height="800" rx="32" fill="url(#bg)"/><rect x="25" y="25" width="630" height="750" rx="22" fill="none" stroke="#b59ac9"/><g font-family="sans-serif" fill="#44304f"><text x="60" y="90" font-size="13" letter-spacing="3">MOONIANS / VISITOR PASSPORT</text><text x="60" y="163" font-size="40" font-weight="700">きみも、ムーニー。</text><text x="60" y="205" font-size="15">月の内側で出会った、きみだけの思い出。</text><path d="M60 242H620" stroke="#b59ac9" stroke-dasharray="4 5"/><text x="60" y="275" font-size="12">EARTH VISITOR</text><text x="620" y="275" font-size="12" text-anchor="end">${visited.size} / 6 SPOTS EXPLORED</text>${stamps}<text x="340" y="660" font-size="15" text-anchor="middle">地球を愛で満たそう。</text><text x="340" y="695" font-size="11" text-anchor="middle" fill="#9273a2">FROM THE MOON, WITH LOVE. / ${date}</text><text x="340" y="736" font-size="10" text-anchor="middle" fill="#9273a2">arsdavinci.github.io/moonians-official</text></g></svg>`;
    const url = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url; link.download='moonians-moon-passport.svg';
    body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });

  function applyTheme() {
    body.classList.toggle('site-night', night);
    const button=dock.querySelector('[data-action="theme"]');
    button.setAttribute('aria-pressed', String(night));
    button.setAttribute('aria-label', night?'昼の街に切り替える':'夜の街に切り替える');
    button.querySelector('.theme-label').textContent=night?'昼の街へ':'夜の街へ';
    button.querySelector('.dock-symbol').textContent=night?'☼':'☾';
    document.querySelector('meta[name="theme-color"]').content=night?'#241a33':'#f1eaff';
  }
  function applyMotion() {
    body.classList.toggle('motion-paused', !motion);
    root.style.scrollBehavior=motion?'':'auto';
    const button=dock.querySelector('[data-action="motion"]');
    button.setAttribute('aria-pressed', String(!motion));
    button.setAttribute('aria-label', motion?'画面の動きを抑える':'画面の動きを再開する');
    button.querySelector('.motion-label').textContent=motion?'動きを抑える':'動きを楽しむ';
    if(!motion) {
      document.querySelectorAll('[data-tilt]').forEach(el=>el.style.transform='');
      document.querySelectorAll('.magnetic').forEach(el=>el.style.translate='');
      document.querySelector('.immersive-hero').style.setProperty('--scene-x','0px');
      document.querySelector('.immersive-hero').style.setProperty('--scene-y','0px');
    }
    updateAnimation();
  }
  dock.querySelector('[data-action="theme"]').addEventListener('click', () => { night=!night; store.set('night',night); applyTheme(); });
  dock.querySelector('[data-action="motion"]').addEventListener('click', () => { motion=!motion; store.set('motion',motion); applyMotion(); });
  reduceQuery.addEventListener('change', () => { if(reduceQuery.matches) { motion=false; store.set('motion',false); applyMotion(); } });
  applyTheme();

  const scenes = {
    moon:{src:'assets/moon-city.png',alt:'ムーニアンズが暮らす月の内部都市。パステルの建物とうさぎのロボットが並ぶ街',name:'月の内部都市',coordinate:'01 / MOON CITY'},
    earth:{src:'assets/city.png',alt:'歌舞月町。ピンクとミントのネオンがきらめく街',name:'歌舞月町',coordinate:'02 / NEON STREET'},
    studio:{src:'assets/lunar-studio.jpeg',alt:'月面を見渡す窓とホログラムの端末がある月のスタジオ',name:'月のスタジオ',coordinate:'03 / LUNAR STUDIO'}
  };
  const sceneImage=document.getElementById('scene-image');
  const panorama=document.getElementById('panorama');
  let sceneSequence=0;
  let currentScene='moon';
  document.querySelectorAll('[data-scene]').forEach(button => {
    button.addEventListener('click', () => {
      const scene=scenes[button.dataset.scene];
      const sequence=++sceneSequence;
      document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      sceneImage.classList.add('changing');
      panorama.setAttribute('aria-busy','true');
      const preload=new Image();
      preload.onload=() => {
        if(sequence!==sceneSequence) return;
        currentScene=button.dataset.scene;
        sceneImage.src=scene.src; sceneImage.alt=scene.alt;
        document.getElementById('scene-name').textContent=scene.name;
        document.getElementById('scene-coordinate').textContent=scene.coordinate;
        requestAnimationFrame(()=>{ sceneImage.classList.remove('changing'); panorama.setAttribute('aria-busy','false'); });
      };
      preload.onerror=() => {
        if(sequence!==sceneSequence) return;
        sceneImage.classList.remove('changing'); panorama.setAttribute('aria-busy','false');
        document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===currentScene)));
        announce('風景を読み込めなかったみたい。もう一度選んでみてね。');
      };
      preload.src=scene.src;
    });
  });

  const greetings={
    ranpyon:['よう来てくれたな！月の内側の街、ゆっくり見ていってな。','ぴょんぴーがボケたら、ツッコむのが僕の仕事やで。','月と地球の架け橋に。きみとも、友達になれたらええな。','もう中学生さんと一緒に仕事がしたくて、NSCに入ったんや。'],
    pyonpy:['地球には面白いヤツがぎょうさんおるって聞いてな！相方のらんぴょんとお笑いで勝負しに来てん！','ツッコミの速さやな！月はのんびりやから地球のスピード感に毎回ビックリやで！','歌舞伎町！ネオンと人の多さ、ちょっと月のナイトシティ思い出すねん','好きな芸人さんは、もう中学生さん。','ムーニアンズで、いつか地球のM-1を獲ること！月と地球を笑いでつなぐこと。']
  };
  document.querySelectorAll('.character').forEach(card => {
    const kind=card.classList.contains('ranpyon')?'ranpyon':'pyonpy';
    const name=kind==='ranpyon'?'らんぴょん':'ぴょんぴー';
    const button=document.createElement('button');
    button.type='button'; button.className='character-talk'; button.textContent=`${name}に話しかける`;
    button.setAttribute('aria-expanded','false');
    const bubble=document.createElement('div');
    bubble.className='speech-bubble'; bubble.hidden=true; bubble.id=`greeting-${kind}`;
    bubble.innerHTML=`<small>${kind.toUpperCase()} / WELCOME MESSAGE</small><span></span>`;
    bubble.setAttribute('role','status'); bubble.setAttribute('aria-live','polite');
    button.setAttribute('aria-controls',bubble.id);
    card.querySelector('dl').before(button,bubble);
    let index=0, timer;
    button.addEventListener('click', () => {
      clearInterval(timer); bubble.hidden=false; bubble.classList.remove('is-complete');
      button.setAttribute('aria-expanded','true'); button.textContent='もうひとこと、聞いてみる';
      const message=greetings[kind][index++%greetings[kind].length];
      const text=bubble.querySelector('span');
      // Announce the complete message once; visual typing is decorative.
      bubble.setAttribute('aria-label',`${name}：${message}`);
      text.setAttribute('aria-hidden','true'); text.textContent='';
      if(!motion) { text.textContent=message; bubble.classList.add('is-complete'); return; }
      const characters=Array.from(message); let position=0;
      timer=setInterval(() => {
        if(!motion) { text.textContent=message; position=characters.length; }
        else text.textContent+=characters[position++];
        if(position===characters.length) { clearInterval(timer); bubble.classList.add('is-complete'); }
      },35);
    });
  });

  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting) { entry.target.classList.remove('reveal-wait'); entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); }
  }),{threshold:.08});
  document.querySelectorAll('.section-heading,.world-layout,.character,.journal-card,.gallery-item,.history-row,.social-grid>a').forEach((el,i)=>{
    el.classList.add('reveal-element','reveal-wait');
    el.style.transitionDelay=`${i%3*55}ms`;
    revealObserver.observe(el);
  });
  document.querySelectorAll('.character,.world-photo,.journal-image').forEach(el=>{
    el.dataset.tilt='';
    el.addEventListener('pointermove',e=>{
      if(!motion||!fineQuery.matches) return;
      const box=el.getBoundingClientRect();
      const x=(e.clientX-box.left)/box.width-.5, y=(e.clientY-box.top)/box.height-.5;
      el.style.transform=`perspective(1200px) rotateX(${-y*4}deg) rotateY(${x*5}deg)`;
    },{passive:true});
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
  document.querySelectorAll('.magnetic').forEach(button=>{
    button.addEventListener('pointermove',e=>{
      if(!motion||!fineQuery.matches) return;
      const box=button.getBoundingClientRect();
      button.style.translate=`${(e.clientX-box.left-box.width/2)*.12}px ${(e.clientY-box.top-box.height/2)*.15}px`;
    },{passive:true});
    button.addEventListener('pointerleave',()=>button.style.translate='');
  });
  const hero=document.querySelector('.immersive-hero');
  hero.addEventListener('pointermove',e=>{
    if(!motion||!fineQuery.matches) return;
    const box=hero.getBoundingClientRect();
    hero.style.setProperty('--scene-x',`${(e.clientX/box.width-.5)*-14}px`);
    hero.style.setProperty('--scene-y',`${((e.clientY-box.top)/box.height-.5)*-10}px`);
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--scene-x','0px');hero.style.setProperty('--scene-y','0px');});
  let pointerFrame=0;
  document.addEventListener('pointermove',e=>{
    if(!motion||!fineQuery.matches||pointerFrame) return;
    const x=e.clientX,y=e.clientY;
    pointerFrame=requestAnimationFrame(()=>{aura.style.left=`${x}px`;aura.style.top=`${y}px`;aura.classList.add('is-visible');pointerFrame=0;});
  },{passive:true});
  document.addEventListener('pointerleave',()=>aura.classList.remove('is-visible'));

  let scrollFrame=0;
  const header=document.querySelector('.site-header');
  function updateScroll(){
    const distance=root.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${distance>0?Math.min(1,scrollY/distance):0})`;
    header.classList.toggle('is-scrolled',scrollY>50);
    scrollFrame=0;
  }
  function scheduleScroll(){if(!scrollFrame) scrollFrame=requestAnimationFrame(updateScroll);}
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',scheduleScroll,{passive:true});
  updateScroll();

  const canvas=document.getElementById('moon-particles');
  const context=canvas.getContext('2d');
  const motes=Array.from({length:38},()=>({x:Math.random(),y:Math.random(),radius:1+Math.random()*2.4,speed:.003+Math.random()*.006,phase:Math.random()*Math.PI*2}));
  let animationFrame=0,heroVisible=true,width=0,height=0;
  function resizeCanvas(){
    const rect=hero.getBoundingClientRect(), ratio=Math.min(devicePixelRatio||1,1.5);
    width=rect.width;height=rect.height;
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    if(context) context.setTransform(ratio,0,0,ratio,0,0);
  }
  function draw(time){
    if(!context) return;
    context.clearRect(0,0,width,height);
    motes.forEach(p=>{
      const t=motion?time/1000:0;
      const x=p.x*width+Math.sin(t*.24+p.phase)*12,y=((p.y-t*p.speed)%1+1)%1*height;
      const opacity=.22+(Math.sin(t+p.phase)+1)*.2;
      context.fillStyle=`rgba(255,250,255,${opacity})`;
      context.shadowColor=night?'#ebafff':'#fff';context.shadowBlur=10;
      context.beginPath();context.arc(x,y,p.radius,0,Math.PI*2);context.fill();
    });
  }
  function animate(time){draw(time);animationFrame=requestAnimationFrame(animate);}
  function updateAnimation(){
    if(animationFrame) {cancelAnimationFrame(animationFrame);animationFrame=0;}
    if(context&&motion&&heroVisible&&!document.hidden) animationFrame=requestAnimationFrame(animate);
    else draw(0);
  }
  new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;updateAnimation();},{threshold:.01}).observe(hero);
  document.addEventListener('visibilitychange',updateAnimation);
  addEventListener('resize',()=>{resizeCanvas();if(!motion) draw(0);},{passive:true});
  resizeCanvas();
  applyMotion();
})();
