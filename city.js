// Pastel Moon City: the 3D home. Drag to look around the plaza; choosing a place flies the camera
// to its landmark, plays a short scene there, then opens that page.
// The city model is built in Blender (D:\Development\03_Game\PastelMoonCity\blender\build_city.py --low).
import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

const $ = selector => document.querySelector(selector);
const body = document.body;
const canvas = $('#city-canvas');
const tr = text => (window.MoonLanguage ? window.MoonLanguage.t(text) : text);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeInOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = k => 1 - Math.pow(1 - k, 3);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function motionOff() {
  try { if (JSON.parse(localStorage.getItem('moonians.motion')) === false) return true; } catch { /* optional */ }
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ───────────── sound: one volume for the music and the synthesised effects ───────────── */
const sound = (() => {
  const bgm = $('#city-bgm'), toggle = $('#sound-toggle'), state = $('#sound-state');
  const sliders = [$('#sound-volume'), $('#gate-volume')], out = $('#gate-volume-out');
  let ctx = null, master = null, on = false, volume = .3, wanted = false;
  try {
    const v = parseFloat(localStorage.getItem('moonians.music-volume'));   // same setting as the music player on the other pages
    if (v >= 0 && v <= 1) volume = v;
    wanted = JSON.parse(localStorage.getItem('moonians.sound')) === true;
  } catch { /* optional */ }
  function apply() {
    bgm.volume = clamp(volume, 0, 1);
    if (master) master.gain.value = clamp(volume * 1.3, 0, 1);
    sliders.forEach(s => { if (s) s.value = Math.round(volume * 100); });
    if (out) out.textContent = Math.round(volume * 100);
    toggle.setAttribute('aria-pressed', String(on));
    state.textContent = tr(on ? '音：オン' : '音：オフ');
  }
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination); }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }
  function set(next) {
    on = next; wanted = next;
    if (on) { ensure(); bgm.play().catch(() => { /* needs a tap first */ }); } else bgm.pause();
    try { localStorage.setItem('moonians.sound', JSON.stringify(on)); } catch { /* optional */ }
    apply();
  }
  function setVolume(v) {
    volume = clamp(v, 0, 1);
    try { localStorage.setItem('moonians.music-volume', String(volume)); } catch { /* optional */ }
    apply();
  }
  function tone({f = 660, f2 = 0, d = .18, type = 'sine', g = .4, delay = 0}) {
    if (!on || !ctx) return;
    const o = ctx.createOscillator(), a = ctx.createGain(), t0 = ctx.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    a.gain.setValueAtTime(.0001, t0); a.gain.linearRampToValueAtTime(g, t0 + .014); a.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(a).connect(master); o.start(t0); o.stop(t0 + d + .04);
  }
  function whoosh(d = 1.5) {
    if (!on || !ctx) return;
    const n = Math.floor(ctx.sampleRate * d), buffer = ctx.createBuffer(1, n, ctx.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), a = ctx.createGain(), t0 = ctx.currentTime;
    src.buffer = buffer; band.type = 'bandpass'; band.Q.value = 1.4;
    band.frequency.setValueAtTime(260, t0); band.frequency.exponentialRampToValueAtTime(2400, t0 + d * .6); band.frequency.exponentialRampToValueAtTime(500, t0 + d);
    a.gain.setValueAtTime(.0001, t0); a.gain.linearRampToValueAtTime(.3, t0 + d * .45); a.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    src.connect(band).connect(a).connect(master); src.start(t0);
  }
  const fx = {
    hover: () => tone({f: 880, f2: 1320, d: .07, g: .12, type: 'triangle'}),
    select: () => [523, 659, 784, 1047].forEach((f, i) => tone({f, d: .24, g: .28, type: 'triangle', delay: i * .07})),
    pop: () => { tone({f: 420, f2: 1100, d: .12, g: .3, type: 'sine'}); tone({f: 1400, d: .1, g: .14, type: 'triangle', delay: .08}); },
    arrive: () => [784, 988, 1319, 1568].forEach((f, i) => tone({f, d: .5, g: .2, type: 'sine', delay: i * .09})),
    enter: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone({f, d: .42, g: .22, type: 'triangle', delay: i * .1})),
    whoosh
  };
  toggle.addEventListener('click', () => { set(!on); if (on) fx.pop(); });
  sliders.forEach(s => s && s.addEventListener('input', () => setVolume(s.value / 100)));
  document.addEventListener('moonians:languagechange', apply);
  // A returning visitor who chose sound gets it back on their first tap (browsers block it before that).
  addEventListener('pointerdown', () => { if (wanted && !on && !body.classList.contains('is-loading')) set(true); }, {passive: true});
  apply();
  return {set, setVolume, fx, get on() { return on; }, get wanted() { return wanted; }};
})();

/* ───────────── page elements ───────────── */
const loaderEl = $('#city-loader'), progressEl = $('#city-progress'), gateEl = $('#city-gate');
const percentEl = $('#city-percent'), barEl = $('#city-bar'), wipeEl = $('#city-wipe');
const hintEl = $('#city-hint'), bubbleEl = $('#city-bubble'), labelsEl = $('#city-labels');
const links = [...document.querySelectorAll('.city-menu a[data-place]')];
const wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));

function fail() {
  body.classList.add('no-3d', 'is-exploring');
  body.classList.remove('is-loading');
  $('#city-error').hidden = false;
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance'});
} catch { renderer = null; }

if (!renderer) fail(); else start();

function start() {
  let dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  /* ── sky: a gradient dome that follows the camera ── */
  function makeSky(colors, whole = false) {
    return new THREE.Mesh(new THREE.SphereGeometry(900, 32, 20), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {pano: {value: null}, panoMix: {value: 0}, whole: {value: whole ? 1 : 0}, c0: {value: new THREE.Color(colors[0])}, c1: {value: new THREE.Color(colors[1])}, c2: {value: new THREE.Color(colors[2])}, c3: {value: new THREE.Color(colors[3])}},
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D pano; uniform float panoMix; uniform float whole; uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; varying vec3 vDir; void main(){ float y = normalize(vDir).y; float h = clamp(mix(y, y * 0.5 + 0.5, whole), 0.0, 1.0); vec3 c = mix(c0, c1, smoothstep(0.0, 0.07, h)); c = mix(c, c2, smoothstep(0.07, 0.34, h)); c = mix(c, c3, smoothstep(0.34, 1.0, h)); if (panoMix > 0.0) { vec3 d = normalize(vDir); vec2 uv = vec2(atan(d.z, d.x) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5); c = mix(c, texture2D(pano, uv).rgb, panoMix); } gl_FragColor = vec4(c, 1.0); \n#include <colorspace_fragment>\n }'
    }));
  }
  const SKY = ['#fbe4f5', '#d6e4ff', '#8fbcfc', '#6798f5'];
  const scene = new THREE.Scene();
  const sky = makeSky(SKY); sky.renderOrder = -10; scene.add(sky);
  const textures = new THREE.TextureLoader();
  let panoReady = false;
  textures.load('assets/city/sky-panorama.jpg', texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = THREE.RepeatWrapping; sky.material.uniforms.pano.value = texture; panoReady = true; });
  const tileTexture = textures.load('assets/city/floor-tile.jpg', texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4; });
  // Floors take the tile picture by world position, so the merged model needs no UVs.
  function tiled(material) {
    material.onBeforeCompile = shader => {
      shader.uniforms.uTile = {value: tileTexture};
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTilePos;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvTilePos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uTile; varying vec3 vTilePos;')
        .replace('#include <map_fragment>', '#include <map_fragment>\nvec4 tileTexel = texture2D(uTile, vTilePos.xz * 0.11);\n#ifdef DECODE_VIDEO_TEXTURE\n#endif\ndiffuseColor.rgb = mix(diffuseColor.rgb, pow(tileTexel.rgb, vec3(2.2)), 0.85);');
    };
    material.customProgramCacheKey = () => 'tiled';
  }
  scene.fog = new THREE.Fog(0xdde6ff, 120, 560);
  const camera = new THREE.PerspectiveCamera(50, 1, .3, 2000);
  const hemi = new THREE.HemisphereLight(0xf4f6ff, 0xe2d4ff, 2.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2ea, 2.6); sun.position.set(-45, 80, 50); scene.add(sun);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene(); envScene.add(makeSky(SKY));
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, '#fff'); r.addColorStop(.35, 'rgba(255,255,255,.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const envDay = pmrem.fromScene(envScene, .03).texture;
  scene.environment = envDay;

  /* ── day and night ── */
  const NIGHT_SKY = ['#5a3d9c', '#2c2170', '#140f45', '#070522'];
  const envNightScene = new THREE.Scene(); envNightScene.add(makeSky(NIGHT_SKY));
  const envNight = pmrem.fromScene(envNightScene, .03).texture;
  const skyDay = SKY.map(c => new THREE.Color(c)), skyNight = NIGHT_SKY.map(c => new THREE.Color(c));
  const fogDay = new THREE.Color(0xdde6ff), fogNight = new THREE.Color(0x1b1450);
  const sunDay = new THREE.Color(0xfff2ea), sunNight = new THREE.Color(0x8fa4ff);
  const hemiSkyDay = new THREE.Color(0xf4f6ff), hemiSkyNight = new THREE.Color(0x4a47b0), hemiGroundDay = new THREE.Color(0xe2d4ff), hemiGroundNight = new THREE.Color(0x3a2a80);
  let night = 0, nightT = 0;
  try { nightT = night = JSON.parse(localStorage.getItem('moonians.city-night')) === true ? 1 : 0; } catch { /* optional */ }
  const uTime = {value: 0}, uGlow = {value: 1};
  const nightToggle = $('#night-toggle'), nightLabel = $('#night-label'), keep = {};
  function showNight() {
    if (!nightToggle) return;
    nightToggle.setAttribute('aria-pressed', String(nightT === 1));
    nightLabel.textContent = tr(nightT === 1 ? '昼にする' : '夜にする');
    body.classList.toggle('city-night', nightT === 1);
  }
  if (nightToggle) nightToggle.addEventListener('click', () => {
    nightT = nightT === 1 ? 0 : 1;
    try { localStorage.setItem('moonians.city-night', JSON.stringify(nightT === 1)); } catch { /* optional */ }
    sound.fx.pop(); showNight();
  });
  document.addEventListener('moonians:languagechange', showNight);
  showNight();

  // LEDs: every glowing material is animated in its shader, by where each light sits in the city.
  const LED = {
    neon: 'float la = atan(vLedPos.z, vLedPos.x); float fx = 0.72 + 0.48 * sin(la * 5.0 + length(vLedPos.xz) * 0.12 + vLedPos.y * 0.35 - uTime * 2.6); fx += 0.4 * step(0.9, sin(la * 2.0 + vLedPos.y * 0.05 - uTime * 1.4));',
    window: 'float lh = ledHash(floor(vLedPos * vec3(0.6, 0.5, 0.6))); float fx = 0.45 + 0.8 * smoothstep(0.35, 0.5, fract(lh * 9.0 + uTime * (0.04 + lh * 0.12)));',
    screen: 'float fx = 0.85 + 0.2 * sin(vLedPos.y * 9.0 - uTime * 7.0) + 0.14 * step(0.95, fract(sin(floor(uTime * 9.0)) * 91.7));'
  };
  function led(material, kind) {
    material.onBeforeCompile = shader => {
      shader.uniforms.uTime = uTime; shader.uniforms.uGlow = uGlow;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLedPos;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvLedPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTime; uniform float uGlow; varying vec3 vLedPos;\nfloat ledHash(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + LED[kind] + '\ntotalEmissiveRadiance *= fx * uGlow;');
    };
    material.customProgramCacheKey = () => 'led-' + kind;
  }

  // Sunbeams slanting across the city by day; stars and a moon by night.
  const beamTexture = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
    const across = g.createLinearGradient(0, 0, 64, 0); across.addColorStop(0, 'rgba(255,255,255,0)'); across.addColorStop(.5, 'rgba(255,255,255,1)'); across.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = across; g.fillRect(0, 0, 64, 256); g.globalCompositeOperation = 'destination-in';
    const along = g.createLinearGradient(0, 0, 0, 256); along.addColorStop(0, 'rgba(0,0,0,0)'); along.addColorStop(.25, 'rgba(0,0,0,1)'); along.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = along; g.fillRect(0, 0, 64, 256); return new THREE.CanvasTexture(c); })();
  const sunDir = V(-45, 80, 50).normalize(), beams = [];
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14 + (i % 3) * 9, 230), new THREE.MeshBasicMaterial({map: beamTexture, color: 0xfff1d6, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}));
    m.position.set(-70 + i * 24 + (i % 2) * 9, 48, -40 + (i * 37) % 90).addScaledVector(sunDir, 30);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), sunDir); m.rotateY(i * .9);
    m.renderOrder = 4; scene.add(m); beams.push(m);
  }
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({map: dot, color: 0xfff3d0, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
  sunDisc.scale.setScalar(260); scene.add(sunDisc);
  const moonDisc = new THREE.Sprite(new THREE.SpriteMaterial({map: dot, color: 0xdfe6ff, transparent: true, opacity: 0, depthWrite: false, fog: false}));
  moonDisc.scale.setScalar(90); scene.add(moonDisc);
  const starN = 900, starPos = new Float32Array(starN * 3);
  for (let i = 0; i < starN; i++) { const v = V(Math.random() - .5, Math.random() * .9 + .04, Math.random() - .5).normalize().multiplyScalar(820); starPos.set([v.x, v.y, v.z], i * 3); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({size: 5, map: dot, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, fog: false, color: 0xffffff}));
  stars.frustumCulled = false; scene.add(stars);
  function applyNight(k) {
    const sk = sky.material.uniforms;
    ['c0', 'c1', 'c2', 'c3'].forEach((name, i) => sk[name].value.copy(skyDay[i]).lerp(skyNight[i], k));
    scene.fog.color.copy(fogDay).lerp(fogNight, k);
    hemi.color.copy(hemiSkyDay).lerp(hemiSkyNight, k); hemi.groundColor.copy(hemiGroundDay).lerp(hemiGroundNight, k); hemi.intensity = lerp(2.5, .75, k);
    sun.color.copy(sunDay).lerp(sunNight, k); sun.intensity = lerp(2.6, .55, k);
    scene.environment = k > .5 ? envNight : envDay;
    uGlow.value = lerp(1, 1.75, k);
    sk.panoMix.value = panoReady ? 1 - k : 0;
    stars.material.opacity = k; moonDisc.material.opacity = k * .95; sunDisc.material.opacity = (1 - k) * .95;
    if (keep.cloud) keep.cloud.emissiveIntensity = lerp(.34, .04, k);
    if (keep.mist) keep.mist.opacity = lerp(.13, .3, k);
  }

  /* ── loading scene: a little moon gate spinning in space ── */
  const loadScene = new THREE.Scene();
  loadScene.add(makeSky(['#ff9fd2', '#c59af5', '#6a4bd0', '#1d1450'], true));
  const loadCam = new THREE.PerspectiveCamera(46, 1, .1, 2000);
  const gate = new THREE.Group(); loadScene.add(gate);
  const basic = (color, opacity = 1) => new THREE.MeshBasicMaterial({color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1});
  const moonCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 2), basic(0xffd9ee, .35)); gate.add(moonCore);
  const moonWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.5, 1)), new THREE.LineBasicMaterial({color: 0x8ffbe6})); gate.add(moonWire);
  const crescentShape = new THREE.Shape();
  { const R = 2.25, d = .45 * R, a = THREE.MathUtils.degToRad(50), r2 = Math.hypot(R * Math.cos(a) - d, R * Math.sin(a)), ph = Math.atan2(R * Math.sin(a), R * Math.cos(a) - d);
    crescentShape.absarc(0, 0, R, a, Math.PI * 2 - a, false); crescentShape.absarc(d, 0, r2, Math.PI * 2 - ph, ph, true); }
  const crescent = new THREE.Mesh(new THREE.ExtrudeGeometry(crescentShape, {depth: .28, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2, curveSegments: 40}), basic(0xffe680));
  crescent.geometry.center(); crescent.scale.x = -1; gate.add(crescent);
  const spinners = [[3.0, .5, .2, 0x8ffbe6], [3.5, -.4, .9, 0xff9bd0], [4.1, 1.2, -.3, 0xffffff]].map(([r, rx, ry, color]) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, .018, 6, 160), basic(color, .9)); m.rotation.set(rx, ry, 0); gate.add(m); return m;
  });
  let progressRing = null, progressShown = -1;
  function drawProgress(p) {
    if (Math.abs(p - progressShown) < .01) return;
    progressShown = p;
    if (progressRing) { gate.remove(progressRing); progressRing.geometry.dispose(); }
    progressRing = new THREE.Mesh(new THREE.TorusGeometry(4.75, .07, 8, 200, Math.max(.001, p) * Math.PI * 2), basic(0xff8fc8));
    progressRing.rotation.z = Math.PI / 2; gate.add(progressRing);
  }
  const warpN = 420, warpPos = new Float32Array(warpN * 3);
  for (let i = 0; i < warpN; i++) { warpPos[i * 3] = (Math.random() - .5) * 60; warpPos[i * 3 + 1] = (Math.random() - .5) * 60; warpPos[i * 3 + 2] = -Math.random() * 120; }
  const warpGeo = new THREE.BufferGeometry(); warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPos, 3));
  loadScene.add(new THREE.Points(warpGeo, new THREE.PointsMaterial({size: .7, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff0fb})));

  /* ── state ── */
  let mode = 'loading';            // loading → gate → intro → orbit → fly
  let progress = 0, progressView = 0, loaded = false;
  const camPos = V(40, 95, 190), camLook = V(0, 10, 0);
  const view = {az: 0, azT: 0, tilt: 0, tiltT: 0, rad: 15, radT: 15, idle: 0};
  const boost = {gear: 1, ring: 1, eq: 1, ear: 0, note: 1, ufo: 1, shutter: .86, screen: .72, beam: 0, bubbles: 0, crescent: 1};
  const jobs = new Set();          // running animations: fn(dt) returns true when finished
  const run = (duration, step, ease = easeInOut) => new Promise(resolve => {
    let t = 0;
    const job = dt => { t += dt; const k = clamp(t / duration, 0, 1); step(ease(k), k); if (k >= 1) { jobs.delete(job); resolve(); } };
    jobs.add(job); job(0);
  });
  function orbitPose(pos, look) {
    const up = Math.max(0, view.tilt), down = Math.max(0, -view.tilt), rad = view.rad * (1 + down * .3);
    pos.set(Math.sin(view.az) * rad, 4.2 + 1.6 * up + 17 * down, Math.cos(view.az) * rad);
    look.set(-Math.sin(view.az) * 42 * down, 5.4 + 21 * up - 12 * down, -Math.cos(view.az) * 42 * down);   // looking down means looking out over the far rim
  }
  function fly(toPos, toLook, duration, arc = 0, ease = easeInOut) {
    const fromPos = camPos.clone(), fromLook = camLook.clone();
    return run(duration, k => {
      camPos.lerpVectors(fromPos, toPos, k); camPos.y += Math.sin(k * Math.PI) * arc;
      camLook.lerpVectors(fromLook, toLook, k);
    }, ease);
  }

  /* ── the city ── */
  const N = {};                     // named nodes from the model
  const PLACES = {
    anime:   {anchor: 'Anchor_Anime',   label: '3Dアニメ',       labelY: 9, dist: 27, h: 7,   lookY: 14},
    game:    {anchor: 'Anchor_Game',    label: 'ゲーム',         labelY: 3.4, dist: 17, h: -5, lookY: 0},
    music:   {anchor: 'Anchor_Music',   label: '音楽',           labelY: 6, dist: 25, h: 4.4, lookY: 6.2},
    friends: {anchor: 'Anchor_Friends', label: '愉快な仲間たち', labelY: 9, dist: 18, h: 4.6, lookY: 7},
    lab:     {anchor: 'Anchor_Lab',     label: '制作ラボ',       labelY: 7, dist: 20, h: 4.2, lookY: 6},
    roadmap: {anchor: 'Anchor_Roadmap', label: 'ロードマップ',   labelY: 9, dist: 31, h: 6.5, lookY: 25}
  };
  const proxies = [];               // invisible pick targets
  const tmp = V(0, 0, 0), tmp2 = V(0, 0, 0);
  const front = place => V(0, 0, 1).applyQuaternion(place.node.quaternion);
  const at = (place, dist, h) => place.node.position.clone().addScaledVector(front(place), dist).add(V(0, h, 0));

  const seen = new Set();
  function tune(material) {
    if (seen.has(material)) return; seen.add(material);
    const name = material.name || '';
    material.envMapIntensity = .55;
    if (/M_(N_|W_|SCREEN|GLOW|HALO|LANTERN)/.test(name)) {
      material.emissiveIntensity = /M_W_|SCREEN/.test(name) ? .82 : 1;
      led(material, /M_W_/.test(name) ? 'window' : /SCREEN/.test(name) ? 'screen' : 'neon');
      material.color.copy(material.emissive).multiplyScalar(.22);
      material.envMapIntensity = 0;
    }
    if (/M_(FLOOR|PLAZA|ROAD)$/.test(name)) { material.roughness = .1; material.metalness = .25; material.envMapIntensity = 1.2; tiled(material); }
    if (/M_LOWGROUND$/.test(name)) { material.roughness = .7; material.metalness = 0; material.envMapIntensity = .12; }
    if (/M_D_/.test(name)) material.envMapIntensity = .25;
    if (/M_MIST$/.test(name)) { material.transparent = true; material.opacity = .13; material.depthWrite = false; material.side = THREE.DoubleSide; material.emissiveIntensity = .5; material.envMapIntensity = 0; }
    if (/M_(GLASS|BUBBLE)$/.test(name)) { material.depthWrite = false; material.envMapIntensity = 1.4; material.roughness = .05; }
    if (/M_CLOUD$/.test(name)) { material.emissiveIntensity = .34; material.envMapIntensity = .2; keep.cloud = material; }
    if (/M_MIST$/.test(name)) keep.mist = material;
  }

  const holos = [], paintedClouds = [];
  let sparkle = null, pyon = null, pyonMixer = null, pyonActions = {}, pyonActive = null, statueBounce = 0;
  const ufoBase = V(0, 0, 0), shutterBase = {};
  let ufoAngle = 2.4;

  function build(gltf) {
    const root = gltf.scene; scene.add(root);
    root.traverse(node => {
      if (node.name) N[node.name] = node;
      if (node.isMesh) { (Array.isArray(node.material) ? node.material : [node.material]).forEach(tune); node.frustumCulled = node.name.indexOf('City_') !== 0; }
    });
    for (const [id, place] of Object.entries(PLACES)) { place.id = id; place.node = N[place.anchor]; }

    if (N.City_Mist) N.City_Mist.traverse(o => { o.renderOrder = 3; });   // the haze between the main level and the town below

    // Moon Vision: a real picture on the big screen, behind shutters that open when you arrive.
    const screen = N.Anime_Screen;
    if (screen) {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 7.6), new THREE.MeshBasicMaterial({color: 0xbfe6ff}));
      face.position.z = .13; screen.add(face); N.screenFace = face;
      new THREE.TextureLoader().load('assets/anime/uchu-ramen-poster.jpg', texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const want = 13.6 / 7.6, have = texture.image.width / texture.image.height;
        if (have > want) { texture.repeat.x = want / have; texture.offset.x = (1 - texture.repeat.x) / 2; }
        else { texture.repeat.y = have / want; texture.offset.y = (1 - texture.repeat.y) / 2; }
        face.material.map = texture; face.material.color.set(0xffffff); face.material.needsUpdate = true;
      });
    }
    ['Anime_ShutterL', 'Anime_ShutterR'].forEach(name => { if (N[name]) shutterBase[name] = N[name].position.clone(); });

    // UFO: the beam rides with it.
    if (N.UFO) {
      ufoBase.copy(N.UFO.position);
      if (N.UFO_BeamMesh) {
        N.UFO_BeamMesh.traverse(o => { if (o.isMesh) o.material = new THREE.MeshBasicMaterial({color: 0xa6ffee, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}); });
        N.UFO.attach(N.UFO_BeamMesh);
      }
    }

    // Pick targets.
    const proxy = (kind, id, geometry, position, quaternion) => {
      const m = new THREE.Mesh(geometry); m.position.copy(position); if (quaternion) m.quaternion.copy(quaternion);
      m.updateMatrixWorld(); m.userData = {kind, id}; proxies.push(m); return m;
    };
    const P = PLACES, up = (place, y) => place.node.position.clone().add(V(0, y, 0));
    proxy('place', 'anime', new THREE.BoxGeometry(20, 29, 11), up(P.anime, 14.5), P.anime.node.quaternion);
    N.ufoProxy = proxy('place', 'game', new THREE.SphereGeometry(9.5, 12, 8), P.game.node.position);
    proxy('place', 'music', new THREE.SphereGeometry(11, 12, 8), up(P.music, 3.5));
    proxy('place', 'friends', new THREE.SphereGeometry(7.2, 12, 8), up(P.friends, 6.5));
    proxy('place', 'lab', new THREE.BoxGeometry(13, 14, 10), up(P.lab, 6.5), P.lab.node.quaternion);
    proxy('place', 'roadmap', new THREE.BoxGeometry(17, 72, 17), up(P.roadmap, 36));
    proxy('pyon', 'pyon', new THREE.SphereGeometry(1.7, 10, 8), V(0, 1.9, 0));
    if (N.Statue) proxy('statue', 'statue', new THREE.SphereGeometry(2.6, 10, 8), N.Statue.position.clone().add(V(0, 2.8, 0)));

    // Floating labels above each landmark.
    for (const place of Object.values(PLACES)) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'city-label'; button.textContent = tr(place.label); button.dataset.ja = place.label;
      button.addEventListener('click', () => go(place.id));
      button.addEventListener('pointerenter', () => hot(place.id, false));
      button.addEventListener('pointerleave', () => hot(null));
      labelsEl.append(button); place.el = button;
    }

    // Soft twinkles drifting over the plaza.
    const n = 260, positions = new Float32Array(n * 3), colors = new Float32Array(n * 3), palette = [0xffffff, 0xff9bd0, 0x8ffbe6, 0xffe680, 0xb9a3ff].map(c => new THREE.Color(c));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 70;
      positions.set([Math.cos(a) * r, 2 + Math.random() * 38, Math.sin(a) * r], i * 3);
      const c = palette[i % palette.length]; colors.set([c.r, c.g, c.b], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    sparkle = new THREE.Points(geometry, new THREE.PointsMaterial({size: .55, map: dot, vertexColors: true, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false}));
    scene.add(sparkle);
    setShutters(boost.shutter);

    // Holographic neon icons: one turning above each landmark, the rest circling the inner ring bridge.
    const atlas = textures.load('assets/city/neon-icons.jpg', texture => { texture.colorSpace = THREE.SRGBColorSpace; });
    const icon = (index, size) => {
      const map = atlas.clone(); map.repeat.set(.25, .25); map.offset.set((index % 4) * .25, .75 - Math.floor(index / 4) * .25);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}));
      scene.add(mesh); holos.push(mesh); return mesh;
    };
    for (const [id, index, height] of [['anime', 12, 33], ['music', 6, 19], ['friends', 2, 23], ['lab', 10, 17], ['roadmap', 0, 12]]) {
      const m = icon(index, 5); m.position.copy(PLACES[id].node.position); m.position.y += height; m.userData.spin = .9;
    }
    [1, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15, 1, 3, 9].forEach((index, i) => {
      const a = (i / 14) * Math.PI * 2 + .3, m = icon(index, 4.2);
      m.userData.ring = {a, r: 46, y: 11 + (i % 3) * 3};
    });
    // Painted clouds drifting between the towers.
    for (let i = 0; i < 12; i++) {            // each cloud is its own picture, so none is cut off at an edge
      textures.load(`assets/city/cloud-${i % 5 + 1}.webp`, map => {
        map.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map, transparent: true, depthWrite: false, fog: true}));
        const a = (i / 12) * Math.PI * 2 + i, r = 90 + (i * 53) % 110, w = 62 + (i * 7) % 20;
        sprite.userData = {a, r, y: 26 + (i * 17) % 60}; sprite.scale.set(w, w * map.image.height / map.image.width, 1);
        scene.add(sprite); paintedClouds.push(sprite);
      });
    }
  }

  function setShutters(closed) {
    const k = 1 + 3.62 * closed;
    for (const [name, sign] of [['Anime_ShutterL', 1], ['Anime_ShutterR', -1]]) {
      const node = N[name]; if (!node) continue;
      node.scale.x = k;
      node.position.copy(shutterBase[name]).addScaledVector(tmp.set(1, 0, 0).applyQuaternion(node.quaternion), sign * (k - 1) * .75);
    }
    if (N.screenFace) N.screenFace.material.color.setScalar(boost.screen);
  }

  /* ── bursts of sparkles ── */
  const bursts = [];
  function burst(position, colors, count = 70, speed = 9, size = .9) {
    const positions = new Float32Array(count * 3), cols = new Float32Array(count * 3), velocity = [];
    for (let i = 0; i < count; i++) {
      positions.set([position.x, position.y, position.z], i * 3);
      const c = new THREE.Color(colors[i % colors.length]); cols.set([c.r, c.g, c.b], i * 3);
      const v = V(Math.random() - .5, Math.random() - .2, Math.random() - .5).normalize().multiplyScalar(speed * (.35 + Math.random() * .65)); velocity.push(v);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({size, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false}));
    points.frustumCulled = false; scene.add(points); bursts.push({points, velocity, life: 0, max: 1.5});
  }
  function updateBursts(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i], p = b.points.geometry.attributes.position; b.life += dt;
      for (let k = 0; k < b.velocity.length; k++) { const v = b.velocity[k]; v.y -= 6 * dt; v.multiplyScalar(1 - 1.2 * dt); p.setXYZ(k, p.getX(k) + v.x * dt, p.getY(k) + v.y * dt, p.getZ(k) + v.z * dt); }
      p.needsUpdate = true; b.points.material.opacity = 1 - b.life / b.max;
      if (b.life >= b.max) { scene.remove(b.points); b.points.geometry.dispose(); b.points.material.dispose(); bursts.splice(i, 1); }
    }
  }
  const PASTEL = [0xffffff, 0xff9bd0, 0x8ffbe6, 0xffe680, 0xb9a3ff];

  /* ── what happens at each place once the camera arrives ── */
  const SHOW = {
    async anime(place) {
      sound.fx.arrive();
      const centre = at(place, 0, 15), near = at(place, 12.5, 15);
      await Promise.all([
        run(1.5, k => { boost.shutter = lerp(.86, 0, k); boost.screen = lerp(.72, 1.25, k); setShutters(boost.shutter); }, easeOut),
        fly(near, centre, 1.7, 0)
      ]);
    },
    async game(place) {
      sound.fx.arrive(); sound.fx.whoosh(1.6);
      const ufo = N.UFO.position;
      burst(ufo.clone().add(V(0, -2, 0)), PASTEL, 90, 11, 1.1);
      await Promise.all([
        run(1.2, k => { boost.beam = k * .6; boost.ufo = 1 + k * 7; }, easeOut),
        fly(ufo.clone().add(V(.6, -8.5, 2.4)), ufo.clone(), 1.2, 0)
      ]);
      wipeEl.classList.add('is-on');           // the beam swallows the view as we are pulled inside
      await fly(ufo.clone().add(V(.1, -2.4, .3)), ufo.clone().add(V(0, 2, 0)), .72, 0, k => k * k);
      return true;
    },
    async music(place) {
      sound.fx.arrive();
      burst(at(place, 0, 12), [0xff9bd0, 0xffffff, 0x8ffbe6], 80, 10, 1.1);
      await Promise.all([
        run(1.5, k => { boost.eq = 1 + k * 5; boost.note = 1 + k * 4; }, easeOut),
        fly(at(place, 13.5, 3.4), at(place, 0, 5.4), 1.6, 0)
      ]);
    },
    async friends(place) {
      sound.fx.arrive(); sound.fx.pop();
      burst(at(place, 5, 7), [0xff9bd0, 0x8fd4ff, 0xffffff], 60, 7, .9);
      await Promise.all([
        run(1.5, k => { boost.ear = Math.sin(k * Math.PI); }, k => k),
        fly(at(place, 11.5, 5.6), at(place, 0, 6.8), 1.6, 0)
      ]);
    },
    async lab(place) {
      sound.fx.arrive();
      burst(at(place, 2, 11), [0xffe680, 0x8ffbe6, 0xffffff], 70, 8, .9);
      await Promise.all([
        run(1.5, k => { boost.gear = 1 + k * 9; boost.bubbles = k; }, easeOut),
        fly(at(place, 12.5, 3.6), at(place, 0, 4.8), 1.6, 0)
      ]);
    },
    async roadmap(place) {
      sound.fx.arrive(); sound.fx.whoosh(1.8);
      await Promise.all([
        run(1.9, k => { boost.ring = 1 + k * 9; boost.crescent = 1 + k * 8; }, easeOut),
        fly(at(place, 24, 47), at(place, 0, 56), 1.9, 0)
      ]);
      burst(at(place, 0, 66), PASTEL, 90, 12, 1.3);
      await wait(.2);
    }
  };

  function vantage(place) {
    if (place.id === 'game') { const ufo = N.UFO.position; return {pos: ufo.clone().addScaledVector(front(place), place.dist).add(V(0, place.h, 0)), look: ufo.clone()}; }
    return {pos: at(place, place.dist, place.h), look: at(place, 0, place.lookY)};
  }

  async function go(id) {
    const place = PLACES[id], link = links.find(a => a.dataset.place === id);
    if (!place || !link || mode !== 'orbit') return;
    mode = 'fly';
    body.classList.add('is-travelling'); link.classList.add('is-going');
    hintEl.classList.remove('is-on'); bubbleEl.hidden = true;
    sound.fx.select();
    if (!motionOff()) {
      sound.fx.whoosh(1.7);
      const target = vantage(place);
      await fly(target.pos, target.look, 1.9, 5);
      if (await SHOW[id](place)) { location.href = link.href; return; }
    }
    wipeEl.classList.add('is-on');
    await wait(.72);
    location.href = link.href;
  }

  let hotGame = false;
  function hot(id, turn = true) {
    hotGame = id === 'game' && turn;
    links.forEach(a => a.classList.toggle('is-hot', a.dataset.place === id));
    for (const place of Object.values(PLACES)) if (place.el) place.el.classList.toggle('is-hot', place.id === id);
    if (!id || !turn || mode !== 'orbit' || !PLACES[id].node) return;
    // Swing round so the place sits behind the plaza stage.
    const p = id === 'game' ? N.UFO.position : PLACES[id].node.position;
    let target = Math.atan2(p.x, p.z) + Math.PI;
    while (target - view.azT > Math.PI) target -= Math.PI * 2;
    while (target - view.azT < -Math.PI) target += Math.PI * 2;
    view.azT = target; view.idle = 0;
    if (id === 'game' || id === 'roadmap') view.tiltT = id === 'game' ? .34 : .75; else view.tiltT = .12;
  }

  links.forEach(link => {
    link.addEventListener('click', event => {
      if (body.classList.contains('no-3d') || !loaded || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      if (mode === 'intro') skipIntro();
      go(link.dataset.place);
    });
    link.addEventListener('pointerenter', () => { hot(link.dataset.place); sound.fx.hover(); });
    link.addEventListener('focus', () => hot(link.dataset.place));
    link.addEventListener('pointerleave', () => hot(null));
    link.addEventListener('blur', () => hot(null));
  });

  /* ── Pyonpy on the plaza stage ── */
  const LINES = ['ようこそ、パステルムーンシティへ！ 吾輩が案内するじょ〜。', '行きたい建物をタップしてだ！', 'ぶどうまんじゅう、食べたいんじゃ〜。', 'らんぴょん、どこ行ったんじゃろ？'];
  let lineIndex = 0, bubbleTimer = 0;
  function loadPyonpy() {
    new GLTFLoader().load('assets/models/pyonpy.glb', gltf => {
      const model = gltf.scene, box = new THREE.Box3().setFromObject(model), size = box.getSize(V(0, 0, 0)), scale = 2.3 / size.y;
      model.scale.setScalar(scale);
      model.position.set(-(box.min.x + size.x / 2) * scale, -box.min.y * scale, -(box.min.z + size.z / 2) * scale);
      model.traverse(node => { if (node.isMesh) { node.frustumCulled = false; (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => { m.envMapIntensity = .5; }); } });
      pyon = new THREE.Group(); pyon.position.set(0, .68, 0); pyon.add(model); scene.add(pyon);
      pyonMixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip => {
        clip.tracks = clip.tracks.filter(track => !/^(root|RootNode)\.position$/.test(track.name));
        pyonActions[clip.name] = pyonMixer.clipAction(clip);
      });
      pyonMixer.addEventListener('finished', () => { if (!pyonTurning) dance(); });
      dance();
      burst(V(0, 2, 0), PASTEL, 50, 6, .8);
    }, undefined, () => { /* the city works without him */ });
  }
  // The landmark models made from the design sheets (Meshy). Each replaces the hand-built one once it has loaded.
  const MODELS = {
    anime:   {height: 27,  hide: ['Proc_Anime', 'Anime_ShutterL', 'Anime_ShutterR', 'Anime_Screen']},
    music:   {height: 15,  hide: ['Proc_Music', 'Music_Note', 'Music_EqBars']},
    friends: {height: 17,  hide: ['Proc_Friends', 'Friends_EarL', 'Friends_EarR', 'Friends_Face']},
    lab:     {height: 14,  hide: ['Proc_Lab', 'Gear_A', 'Gear_B', 'Lab_Bubbles']},
    roadmap: {height: 72,  hide: ['Proc_Roadmap', 'Tower_Ring1', 'Tower_Ring2', 'Tower_Ring3', 'Tower_Crescent']},
    game:    {height: 6.2, hide: []}
  };
  const landmarkModels = {};
  function loadLandmarks() {
    for (const [id, spec] of Object.entries(MODELS)) {
      new GLTFLoader().load(`assets/city/lm/${id}.glb?v=20261118-2`, gltf => {
        const model = gltf.scene;
        model.traverse(node => { if (node.isMesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => { m.envMapIntensity = .45; m.roughness = .5; m.metalness = 0; }); });
        model.scale.setScalar(spec.height);
        if (id === 'game') {
          N.UFO.traverse(node => { if (node.isMesh && node.parent !== N.UFO_BeamMesh && node !== N.UFO_BeamMesh) node.visible = false; });
          model.position.y = -spec.height * .42; N.UFO.add(model);
        } else {
          const anchor = PLACES[id].node; model.position.copy(anchor.position); model.quaternion.copy(anchor.quaternion); scene.add(model);
          spec.hide.forEach(name => { if (N[name]) N[name].visible = false; });
        }
        landmarkModels[id] = model;
      }, undefined, () => { /* the hand-built landmark stays */ });
    }
  }
  // He dances on the stage: his happy moves one after another, with a little bounce and sway on top.
  const DANCE = ['Cheer', 'Jump', 'Talk', 'Cheer', 'Idle', 'Jump'];
  let danceIndex = 0, pyonTurning = false, pyonFacing = 0;
  function dance() {
    const moves = DANCE.filter(name => pyonActions[name]); if (!moves.length) return;
    const name = moves[danceIndex++ % moves.length];
    playPyon(name, true);
    if (name === 'Idle') setTimeout(() => { if (pyonActive === pyonActions.Idle && !pyonTurning) dance(); }, 1600);
  }
  /* ── monitors: clips from the site play on every screen; the big Moon Vision screen loops the 3D anime ── */
  const CLIPS = ['capsule/clip-11', 'capsule/clip-12', 'capsule/clip-16', 'capsule/clip-23', 'capsule/clip-05', 'capsule/clip-03', 'capsule2/clip-01'];
  const videos = [];
  function videoScreen(src, w, h) {
    let entry = videos.find(v => v.src === src);
    if (!entry) {
      const el = document.createElement('video');
      el.src = 'assets/' + src + '.mp4'; el.muted = true; el.loop = true; el.playsInline = true; el.preload = 'auto'; el.crossOrigin = 'anonymous';
      const texture = new THREE.VideoTexture(el); texture.colorSpace = THREE.SRGBColorSpace;
      entry = {src, el, texture, planes: []}; videos.push(entry);
      el.addEventListener('loadedmetadata', () => entry.planes.forEach(fit));
      el.play().catch(() => { /* starts on the first tap */ });
    }
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: entry.texture, toneMapped: false}));
    plane.userData = {w, h, entry}; entry.planes.push(plane); if (entry.el.videoWidth) fit(plane);
    return plane;
  }
  function fit(plane) {             // crop the clip to the screen's shape (tall clips are trimmed top and bottom)
    const {w, h, entry} = plane.userData, have = entry.el.videoWidth / entry.el.videoHeight, want = w / h, uv = plane.geometry.attributes.uv;
    let u = 1, v = 1; if (have > want) u = want / have; else v = have / want;
    const u0 = (1 - u) / 2, v0 = (1 - v) / 2;
    uv.setXY(0, u0, v0 + v); uv.setXY(1, u0 + u, v0 + v); uv.setXY(2, u0, v0); uv.setXY(3, u0 + u, v0); uv.needsUpdate = true;
  }
  function loadScreens() {
    let i = 0;
    for (const [name, node] of Object.entries(N)) {
      if (!/^Scr\d+$/.test(name) || !node.userData.w) continue;
      const plane = videoScreen(CLIPS[i++ % CLIPS.length], node.userData.w, node.userData.h);
      node.add(plane);
    }
    const anchor = PLACES.anime.node, big = videoScreen('anime/uchu-ramen', 11.9, 6.7);
    const holder = new THREE.Group(); holder.position.copy(anchor.position); holder.quaternion.copy(anchor.quaternion);
    big.position.set(0, 10.5, 5.8); holder.add(big); scene.add(holder);
    addEventListener('pointerdown', () => videos.forEach(v => { if (v.el.paused) v.el.play().catch(() => {}); }), {passive: true});
  }

  /* ── traffic: hover cars on the roads and bridges, the lower town, and drones in the air ── */
  // Each route returns a position for a distance travelled; cars face along it and bob as they hover.
  const TAU = Math.PI * 2;
  const circle = (r, y, cx = 0, cz = 0) => ({length: TAU * r, at: (d, out) => { const a = d / r; out.set(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r); }});
  function stadium(x, z0, z1, y) {            // up one lane, round the end, back down the other
    const r = x, straight = z1 - z0, total = straight * 2 + Math.PI * r * 2;
    return {length: total, at: (d, out) => {
      d = ((d % total) + total) % total;
      if (d < straight) out.set(-x, y, z0 + d);
      else if (d < straight + Math.PI * r) { const a = (d - straight) / r; out.set(-Math.cos(a) * r, y, z1 + Math.sin(a) * r); }
      else if (d < straight * 2 + Math.PI * r) out.set(x, y, z1 - (d - straight - Math.PI * r));
      else { const a = (d - straight * 2 - Math.PI * r) / r; out.set(Math.cos(a) * r, y, z0 - Math.sin(a) * r); }
    }};
  }
  const helix = (r, y0, y1, turns) => ({length: TAU * r * turns * 2, at: (d, out) => { const total = TAU * r * turns * 2, k = (((d % total) + total) % total) / total, a = d / r; out.set(Math.cos(a) * r, lerp(y0, y1, .5 - .5 * Math.cos(k * TAU)), Math.sin(a) * r); }});
  const ROUTES = {
    plaza: circle(6.6, .32), road: stadium(2.1, 21, 62, .22), ringA: circle(46, .06), ringB: circle(75, .06),
    low1: circle(34, -69.9), low2: circle(50, -69.9), low3: circle(22, -69.9),
    air1: circle(24, 15), air2: circle(38, 22), air3: circle(58, 12), lift: helix(29, -62, 9, 3)
  };
  // yaw: how far each model's own front is turned from +Z.
  const CARS = {
    roadster: {height: 1.7, yaw: Math.PI / 2}, bubble: {height: 2.3, yaw: 0}, bus: {height: 3.1, yaw: Math.PI / 2}, van: {height: 2.7, yaw: Math.PI / 2},
    scooter: {height: 1.8, yaw: 0}, patrol: {height: 1.9, yaw: 0}, delivery: {height: 2.6, yaw: 0}, cart: {height: 2.9, yaw: Math.PI / 2}
  };
  const FLEET = [   // model, route, speed (m/s; negative = the other way), starting distance
    ['roadster', 'plaza', 3.2, 0], ['scooter', 'plaza', 3.2, 21],
    ['bubble', 'road', 5, 0], ['van', 'road', 5, 38], ['roadster', 'road', 5, 70],
    ['bus', 'ringA', 6, 0], ['bubble', 'ringA', 6, 120], ['van', 'ringA', -5, 60], ['bus', 'ringB', -6, 0], ['scooter', 'ringB', 7, 200],
    ['cart', 'low1', 3.5, 0], ['van', 'low1', 3.5, 90], ['roadster', 'low2', -6, 0], ['cart', 'low2', -3, 130], ['scooter', 'low3', 4, 0], ['bubble', 'low2', -6, 240],
    ['patrol', 'air1', 4, 0], ['patrol', 'air2', -5, 80], ['patrol', 'air3', 6, 200], ['delivery', 'lift', 7, 0], ['delivery', 'air2', 5, 10], ['delivery', 'lift', 7, 500]
  ];
  const traffic = []; let lineup = false;
  function loadTraffic() {
    for (const [id, spec] of Object.entries(CARS)) {
      new GLTFLoader().load(`assets/city/cars/${id}.glb?v=20261118-1`, gltf => {
        gltf.scene.traverse(node => { if (node.isMesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => { m.envMapIntensity = .5; m.roughness = .45; m.metalness = 0; }); });
        FLEET.filter(f => f[0] === id).forEach(([, route, speed, start], i) => {
          const body = gltf.scene.clone(); body.scale.setScalar(spec.height); body.rotation.y = spec.yaw;
          const car = new THREE.Group(); car.add(body); scene.add(car);
          traffic.push({id, car, body, route: ROUTES[route], speed, d: start, phase: Math.random() * 6, air: /air|lift/.test(route)});
        });
      }, undefined, () => { /* traffic is optional */ });
    }
  }
  const carPos = V(0, 0, 0), carNext = V(0, 0, 0);
  function updateTraffic(dt, still) {
    if (lineup) { Object.keys(CARS).forEach((id, i) => { const t = traffic.find(x => x.id === id); if (t) { t.car.position.set(-10.5 + i * 3, .4, 5); t.car.rotation.set(0, 0, 0); } }); return; }
    for (const t of traffic) {
      if (!still) t.d += t.speed * dt;
      t.route.at(t.d, carPos); t.route.at(t.d + Math.sign(t.speed) * .6, carNext);
      t.car.position.copy(carPos); t.car.position.y += (t.air ? .5 : .12) * Math.sin(time * (t.air ? 1.6 : 2.4) + t.phase) + (t.air ? 0 : .25);
      t.car.rotation.y = Math.atan2(carNext.x - carPos.x, carNext.z - carPos.z);
      t.body.rotation.z = Math.sin(time * 1.7 + t.phase) * .04;
    }
  }

  function playPyon(name, once = false) {
    const next = pyonActions[name]; if (!next) return;
    next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); next.clampWhenFinished = once;
    if (pyonActive && pyonActive !== next) next.crossFadeFrom(pyonActive, .25, false);
    next.play(); pyonActive = next;
  }
  function tapPyon() {
    sound.fx.pop();
    const moves = ['Cheer', 'Jump', 'Talk'].filter(name => pyonActions[name]);
    if (moves.length) playPyon(moves[lineIndex % moves.length], true);
    burst(V(0, 3, 0), PASTEL, 36, 5, .7);
    bubbleEl.textContent = tr(LINES[lineIndex % LINES.length]); bubbleEl.dataset.ja = LINES[lineIndex % LINES.length]; lineIndex++;
    bubbleEl.hidden = false; clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => { bubbleEl.hidden = true; }, 3800);
  }
  document.addEventListener('moonians:languagechange', () => {
    for (const place of Object.values(PLACES)) if (place.el) place.el.textContent = tr(place.label);
    if (!bubbleEl.hidden && bubbleEl.dataset.ja) bubbleEl.textContent = tr(bubbleEl.dataset.ja);
  });

  /* ── pointer: drag to look around, tap to pick ── */
  const pointers = new Map(), raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let pinch = 0, travelled = 0, downAt = 0;
  canvas.addEventListener('pointerdown', event => {
    if (mode === 'intro') { skipIntro(); return; }
    if (mode !== 'orbit') return;
    try { canvas.setPointerCapture(event.pointerId); } catch { /* synthetic pointers cannot be captured */ }
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    travelled = 0; downAt = performance.now(); view.idle = 0;
    canvas.classList.add('is-dragging');
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  canvas.addEventListener('pointermove', event => {
    const p = pointers.get(event.pointerId);
    if (!p || mode !== 'orbit') return;
    const dx = event.clientX - p.x, dy = event.clientY - p.y; p.x = event.clientX; p.y = event.clientY;
    view.idle = 0;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) view.radT = clamp(view.radT * (pinch / d), 10.5, 17);
      pinch = d; travelled += 20; return;
    }
    travelled += Math.abs(dx) + Math.abs(dy);
    const k = 2.6 / Math.min(innerWidth, 900);
    view.azT -= dx * k * 1.9; view.tiltT = clamp(view.tiltT + dy * k * .9, -.9, 1);
  });
  function release(event) {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId); pinch = 0;
    if (!pointers.size) canvas.classList.remove('is-dragging');
    if (event.type === 'pointerup' && travelled < 9 && performance.now() - downAt < 450) pick(event.clientX, event.clientY);
  }
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('wheel', event => { if (mode !== 'orbit') return; event.preventDefault(); view.radT = clamp(view.radT + event.deltaY * .012, 10.5, 17); view.idle = 0; }, {passive: false});
  function pick(x, y) {
    if (mode !== 'orbit') return;
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(proxies, false)[0];
    if (!hit) return;
    const {kind, id} = hit.object.userData;
    if (kind === 'place') go(id); else if (kind === 'pyon') { if (pyon) tapPyon(); } else if (kind === 'statue') { statueBounce = 1; sound.fx.pop(); burst(N.Statue.position.clone().add(V(0, 4, 0)), [0xff9bd0, 0xffffff], 40, 6, .8); }
  }

  /* ── entering the city ── */
  let introToken = 0;
  async function enter(withSound) {
    if (mode !== 'gate') return;
    mode = 'switch';
    sound.set(withSound); sound.fx.enter();
    try { sessionStorage.setItem('moonians.city', '1'); } catch { /* optional */ }
    wipeEl.classList.add('is-on');
    await wait(.72);
    body.classList.remove('is-loading');
    wipeEl.classList.remove('is-on');
    loadPyonpy(); loadLandmarks(); loadTraffic(); loadScreens();
    const token = ++introToken;
    if (motionOff()) { finishIntro(); return; }
    mode = 'intro';
    camPos.set(46, 105, 205); camLook.set(0, 12, 0);
    sound.fx.whoosh(3);
    await fly(V(1.2, 2.7, 47), V(-1, 12, 0), 3.4, 0);
    if (token !== introToken || mode !== 'intro') return;
    await wait(1.1);
    if (token !== introToken || mode !== 'intro') return;
    orbitPose(tmp, tmp2);
    await fly(tmp.clone(), tmp2.clone(), 2.6, 0);
    if (token !== introToken || mode !== 'intro') return;
    finishIntro();
  }
  function skipIntro() { introToken++; jobs.clear(); finishIntro(); }
  function finishIntro() {
    orbitPose(camPos, camLook);
    mode = 'orbit'; body.classList.add('is-exploring');
    hintEl.classList.add('is-on');
    setTimeout(() => { if (mode === 'orbit') hintEl.textContent = tr('ぴょんぴーをタップしてみてね。'); }, 7000);
    setTimeout(() => hintEl.classList.remove('is-on'), 14000);
  }
  gateEl.addEventListener('submit', event => { event.preventDefault(); enter(!event.submitter || event.submitter.value !== 'off'); });

  function ready() {
    loaded = true; mode = 'gate';
    let returning = false;
    try { returning = sessionStorage.getItem('moonians.city') === '1'; } catch { /* optional */ }
    if (returning) { enter(false).then(() => { /* sound comes back on the first tap if it was on */ }); return; }
    progressEl.hidden = true; gateEl.hidden = false;
    const first = gateEl.querySelector('button'); if (first) first.focus({preventScroll: true});
  }

  // Coming back with the browser's Back button: put the city back as it was.
  addEventListener('pageshow', event => {
    if (!event.persisted || !loaded) return;
    wipeEl.classList.remove('is-on'); body.classList.remove('is-travelling'); links.forEach(a => a.classList.remove('is-going'));
    Object.assign(boost, {gear: 1, ring: 1, eq: 1, ear: 0, note: 1, ufo: 1, shutter: .86, screen: .72, beam: 0, bubbles: 0, crescent: 1});
    setShutters(boost.shutter); jobs.clear(); orbitPose(camPos, camLook); mode = 'orbit';
  });

  new GLTFLoader().load('assets/city/pastel-moon-city.glb?v=20261118-4', gltf => {
    try { build(gltf); } catch (error) { console.error(error); fail(); return; }
    progress = 1;
  }, event => { progress = Math.min(.98, event.loaded / (event.total || 3460872)); }, () => fail());

  /* ── frame loop ── */
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    for (const cam of [camera, loadCam]) { cam.aspect = w / h; }
    camera.fov = w / h < .75 ? 64 : w / h < 1.2 ? 56 : 48;
    // On narrow screens the menu sits along the bottom, so lift the whole view to keep Pyonpy above it.
    if (w < 760) camera.setViewOffset(w, h, 0, h * .15, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    loadCam.position.set(0, 0, w / h < .8 ? 24 : 14.5); loadCam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const clock = new THREE.Clock();
  let time = 0, slow = 0, frames = 0, frame = 0;
  function tick() {
    frame = 0;
    step(Math.min(clock.getDelta(), .05));
    if (!document.hidden) frame = requestAnimationFrame(tick);
  }
  function step(dt) {
    time += dt;
    for (const job of [...jobs]) job(dt);

    if (body.classList.contains('is-loading')) {
      progressView = lerp(progressView, progress, 1 - Math.pow(.001, dt));
      const shown = Math.round(progressView * 100);
      percentEl.textContent = shown; barEl.style.width = shown + '%';
      drawProgress(progressView);
      if (progress >= 1 && progressView > .995 && mode === 'loading') ready();
      gate.rotation.y = Math.sin(time * .5) * .35; gate.position.y = Math.sin(time * 1.3) * .12;
      moonWire.rotation.y += dt * .5; moonWire.rotation.x += dt * .2; moonCore.rotation.y -= dt * .3;
      crescent.rotation.y += dt * 1.3;
      spinners.forEach((m, i) => { m.rotation.z += dt * (.5 + i * .25) * (i % 2 ? -1 : 1); m.rotation.x += dt * .12; });
      const speed = 18 + progressView * 60;
      for (let i = 0; i < warpN; i++) { let z = warpPos[i * 3 + 2] + dt * speed; if (z > 12) z = -120; warpPos[i * 3 + 2] = z; }
      warpGeo.attributes.position.needsUpdate = true;
      renderer.render(loadScene, loadCam);
    } else {
      update(dt);
      renderer.render(scene, camera);
      if (mode === 'orbit') {           // drop quality if this device struggles
        slow += dt; frames++;
        if (frames === 90) {
          const average = slow / frames;
          if (average > .027) { if (dpr > 1) { dpr = Math.max(1, dpr - .5); renderer.setPixelRatio(dpr); } else if (N.City_Lower && N.City_Lower.visible && average > .04) N.City_Lower.visible = false; }
          slow = 0; frames = 0;
        }
      }
    }
  }
  // Test hook (?quiet-test=…): advance the city by hand where the browser is not drawing frames, such as a background tab.
  if (new URL(location.href).searchParams.has('quiet-test')) {
    const channel = new MessageChannel(); let wake = null;
    channel.port1.onmessage = () => { if (wake) wake(); };
    window.__city = {
      get mode() { return mode; },
      lineup(on) { lineup = on; },
      async advance(seconds) { for (let t = 0; t < seconds; t += 1 / 30) { step(1 / 30); await new Promise(resolve => { wake = resolve; channel.port2.postMessage(0); }); } return mode; }
    };
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !frame) { clock.getDelta(); frame = requestAnimationFrame(tick); } });

  function update(dt) {
    const still = motionOff();
    if (!still) uTime.value = time;
    night = Math.abs(nightT - night) < .002 ? nightT : lerp(night, nightT, 1 - Math.pow(.02, dt));
    applyNight(night);
    beams.forEach((m, i) => { m.material.opacity = (1 - night) * (.07 + .07 * (Math.sin(time * .35 + i * 1.7) * .5 + .5)); m.visible = night < .98; });
    if (mode === 'orbit') {
      view.idle += dt;
      if (hotGame && N.UFO) {          // keep following the UFO while its menu item is pointed at
        let target = Math.atan2(N.UFO.position.x, N.UFO.position.z) + Math.PI;
        while (target - view.azT > Math.PI) target -= Math.PI * 2; while (target - view.azT < -Math.PI) target += Math.PI * 2;
        view.azT = target; view.tiltT = .34; view.idle = 0;
      }
      if (view.idle > 6 && !still && !pointers.size) view.azT += dt * .045;
      const k = 1 - Math.pow(.0015, dt);
      view.az = lerp(view.az, view.azT, k); view.tilt = lerp(view.tilt, view.tiltT, k); view.rad = lerp(view.rad, view.radT, k);
      orbitPose(camPos, camLook);
    }
    camera.position.copy(camPos); camera.lookAt(camLook);
    sky.position.copy(camPos); stars.position.copy(camPos); stars.rotation.y = time * .004;
    sunDisc.position.copy(camPos).addScaledVector(sunDir, 760); moonDisc.position.copy(camPos).add(tmp2.set(260, 330, -620));
    if (N.screenFace) N.screenFace.material.color.setScalar(boost.screen * (.93 + .07 * Math.sin(time * 9) + (Math.sin(time * 2.3) > .97 ? -.2 : 0)));

    if (N.UFO) {
      const u = N.UFO;
      // The UFO circles high over the city; it holds still while the camera flies anywhere, so it is easy to reach.
      if (mode !== 'fly' && !still) ufoAngle += dt * .16;
      u.position.set(Math.cos(ufoAngle) * 30, 27 + Math.sin(time * 1.25) * .8, Math.sin(ufoAngle) * 30);
      u.rotation.y += dt * .35 * boost.ufo; u.rotation.z = Math.sin(time * .9) * .06; u.rotation.x = Math.cos(time * .7) * .05;
      if (N.ufoProxy) { N.ufoProxy.position.copy(u.position); N.ufoProxy.updateMatrixWorld(); }
      if (N.UFO_BeamMesh) N.UFO_BeamMesh.traverse(o => { if (o.isMesh) { o.material.opacity = boost.beam * (.8 + Math.sin(time * 22) * .2); o.visible = boost.beam > .01; } });
    }
    if (!still || mode === 'fly') {
      if (N.Gear_A) N.Gear_A.rotateZ(dt * .5 * boost.gear);
      if (N.Gear_B) N.Gear_B.rotateZ(-dt * .75 * boost.gear);
      if (N.Tower_Ring1) N.Tower_Ring1.rotateY(dt * .22 * boost.ring);
      if (N.Tower_Ring2) N.Tower_Ring2.rotateY(-dt * .3 * boost.ring);
      if (N.Tower_Ring3) N.Tower_Ring3.rotateY(dt * .12 * boost.ring);
      if (N.Tower_Crescent) N.Tower_Crescent.rotateY(dt * .5 * boost.crescent);
      if (N.Sky_Clouds) N.Sky_Clouds.rotation.y += dt * .0035;
      if (N.Sky_Bubbles) N.Sky_Bubbles.position.y = Math.sin(time * .45) * 1.4;
      if (N.Sky_Stars) N.Sky_Stars.position.y = Math.sin(time * .3) * .8;
      if (sparkle) { sparkle.rotation.y += dt * .012; sparkle.position.y = Math.sin(time * .5) * .8; sparkle.material.opacity = .65 + Math.sin(time * 2.1) * .25; }
    }
    if (N.Music_EqBars) N.Music_EqBars.scale.y = 1 + (Math.sin(time * 6 * Math.min(boost.eq, 2.4)) * .5 + .5) * .12 * boost.eq;
    if (N.Music_Note) { N.Music_Note.position.y = (N.Music_Note.userData.y ??= N.Music_Note.position.y) + Math.abs(Math.sin(time * 2.2 * Math.min(boost.note, 2.5))) * .45 * boost.note; }
    for (const [name, sign] of [['Friends_EarL', 1], ['Friends_EarR', -1]]) {
      const ear = N[name]; if (!ear) continue;
      ear.userData.q ??= ear.quaternion.clone();
      ear.quaternion.copy(ear.userData.q).multiply(new THREE.Quaternion().setFromAxisAngle(tmp.set(0, 0, 1), sign * (Math.sin(time * 1.4) * .03 + Math.sin(time * 15) * .3 * boost.ear)));
    }
    if (N.Friends_Face) N.Friends_Face.scale.setScalar(1 + boost.ear * .22);
    if (N.Lab_Bubbles) { N.Lab_Bubbles.position.y = (N.Lab_Bubbles.userData.y ??= N.Lab_Bubbles.position.y) + Math.sin(time * 1.1) * .35 + boost.bubbles * 3; }
    if (N.Statue) { statueBounce = Math.max(0, statueBounce - dt * 1.6); N.Statue.scale.setScalar(1 + Math.sin(statueBounce * Math.PI * 3) * .12 * statueBounce); }
    if (pyon) {
      if (pyonMixer && !still) pyonMixer.update(dt);
      // When the view moves round, he steps round slowly on the spot until he faces it again, then goes back to dancing.
      let delta = Math.atan2(camPos.x, camPos.z) - pyonFacing;
      while (delta > Math.PI) delta -= Math.PI * 2; while (delta < -Math.PI) delta += Math.PI * 2;
      if (!pyonTurning && Math.abs(delta) > .3 && !still) { pyonTurning = true; playPyon(pyonActions.Walk ? 'Walk' : 'Idle'); if (pyonActive) pyonActive.timeScale = .7; }
      if (pyonTurning) {
        pyonFacing += Math.sign(delta) * Math.min(Math.abs(delta), dt * .55);
        if (Math.abs(delta) < .04) { pyonTurning = false; if (pyonActive) pyonActive.timeScale = 1; dance(); }
      } else if (still) pyonFacing += delta * (1 - Math.pow(.02, dt));
      const groove = pyonTurning || still ? 0 : 1;
      pyon.rotation.y = pyonFacing + Math.sin(time * 1.6) * .22 * groove;
      pyon.rotation.z = Math.sin(time * 3.2) * .07 * groove;
      pyon.position.y = .68 + Math.abs(Math.sin(time * 3.2)) * .09 * groove;
    }
    for (const m of holos) {
      if (m.userData.ring) { const g = m.userData.ring, a = g.a + time * .12; m.position.set(Math.cos(a) * g.r, g.y + Math.sin(time * 1.3 + g.a * 5) * .6, Math.sin(a) * g.r); m.rotation.y = -a + Math.PI / 2 + time * .8; }
      else m.rotation.y = time * m.userData.spin;
      m.material.opacity = (.75 + .25 * Math.sin(time * 5 + m.position.x)) * (.7 + .3 * night);
    }
    for (const c of paintedClouds) { const a = c.userData.a + time * .006; c.position.set(Math.cos(a) * c.userData.r, c.userData.y, Math.sin(a) * c.userData.r); c.material.opacity = .95 - night * .7; }
    updateTraffic(dt, still);
    updateBursts(dt);

    // Labels and Pyonpy's speech bubble follow their spots on screen.
    const showLabels = mode === 'orbit';
    for (const place of Object.values(PLACES)) {
      if (!place.el || !place.node) continue;
      tmp.copy(place.id === 'game' ? N.UFO.position : place.node.position); tmp.y += place.labelY; tmp.project(camera);
      const on = showLabels && tmp.z < 1 && Math.abs(tmp.x) < 1.05 && tmp.y < 1 && tmp.y > -.9;
      place.el.classList.toggle('is-on', on);
      if (on) place.el.style.transform = `translate(${((tmp.x + 1) / 2 * innerWidth).toFixed(1)}px,${((1 - tmp.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%,-100%)`;
    }
    if (!bubbleEl.hidden) {
      tmp.set(0, 3.5, 0).project(camera);
      bubbleEl.style.transform = `translate(${((tmp.x + 1) / 2 * innerWidth + 14).toFixed(1)}px,${((1 - tmp.y) / 2 * innerHeight).toFixed(1)}px) translate(0,-100%)`;
    }
  }
  frame = requestAnimationFrame(tick);
}
