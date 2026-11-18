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
  // Building skins: the facade pictures are wrapped onto walls by world position (side walls) and roofs get
  // the rooftop picture, so the merged low-poly city needs no UVs. At night the pictures glow a little.
  const uSkinGlow = {value: .42}, uNight = {value: 0};
  // Which parts of a picture are lights: warm yellow and cyan panes (windows, lamps) and hot pink (neon, the insides of bunny ears).
  const LIGHTS = 'float lightMask(vec3 c, float pinkFrom){ float warm = smoothstep(0.24, 0.42, min(c.r, c.g) - c.b); float cool = smoothstep(0.12, 0.32, min(c.g, c.b) - c.r) * smoothstep(-0.02, 0.06, c.b - c.g); float pink = smoothstep(pinkFrom, pinkFrom + 0.14, c.r - c.g) * step(0.45, c.b); return clamp(warm + cool + pink * 0.8, 0.0, 1.0); }';
  const skinTextures = {};
  const skinTexture = name => skinTextures[name] || (skinTextures[name] = textures.load(`assets/city/tex/${name}.jpg`, t => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; }));
  function skinned(source, wall, roof, size) {
    const material = source.clone(); material.color.set(0xffffff);
    material.onBeforeCompile = shader => {
      shader.uniforms.uWall = {value: skinTexture(wall)}; shader.uniforms.uRoof = {value: skinTexture(roof)}; shader.uniforms.uSkinGlow = uSkinGlow; shader.uniforms.uNight = uNight; shader.uniforms.uSkinSize = {value: 1 / size};
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSkinPos; varying vec3 vSkinNormal; varying vec2 vSkinUv;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvSkinPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vSkinNormal = normalize(mat3(modelMatrix) * objectNormal); vSkinUv = uv;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uWall; uniform sampler2D uRoof; uniform float uSkinGlow; uniform float uSkinSize; varying vec3 vSkinPos; varying vec3 vSkinNormal; varying vec2 vSkinUv; vec3 skinColor; vec3 skinRaw; uniform float uNight;\n' + LIGHTS)
        .replace('#include <map_fragment>', '#include <map_fragment>\nvec3 sn = normalize(vSkinNormal);\nif (abs(sn.y) > 0.75) skinColor = texture2D(uRoof, vSkinPos.xz * uSkinSize).rgb;\nelse skinColor = texture2D(uWall, vSkinUv * uSkinSize).rgb;\nskinRaw = skinColor;\nskinColor = mix(pow(skinColor, vec3(2.2)), vec3(0.95, 0.93, 1.0), 0.34);\ndiffuseColor.rgb = skinColor;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += skinColor * uSkinGlow + pow(skinRaw, vec3(2.2)) * lightMask(skinRaw, 0.44) * uNight * 1.5;');
    };
    material.customProgramCacheKey = () => 'skin-' + wall + roof + size;
    return material;
  }
  const SKINS = [   // material name pattern -> wall picture, roof picture, metres covered by one picture
    [/M_LAV$|M_SKY$/, 'B01', 'B12', 13], [/M_PINK$|M_PINK_D$/, 'B02', 'B12', 13], [/M_MINT$/, 'B03', 'B12', 13], [/M_CREAM$|M_YEL$/, 'B04', 'B12', 13],
    [/M_LAV_D$/, 'B05', 'B12', 11], [/M_PEARL$|M_LAV_L$|M_WHITE$/, 'B06', 'B07', 11], [/M_PURPLE$|M_D_/, 'B08', 'B12', 14]
  ];
  function skinCity() {
    const cache = new Map();
    const dress = (node, rules, hideWindows) => node && node.traverse(o => {
      if (!o.isMesh) return;
      const name = o.material.name || '';
      if (hideWindows && /M_W_/.test(name)) { o.visible = false; return; }
      const rule = rules.find(r => r[0].test(name)); if (!rule) return;
      const key = name + rule[1]; if (!cache.has(key)) cache.set(key, skinned(o.material, rule[1], rule[2], rule[3]));
      o.material = cache.get(key);
    });
    dress(N.City_Far, SKINS, true);
    dress(N.City_Lower, [[/M_D_/, 'B09', 'B12', 9], [/M_LOWGROUND$/, 'B10', 'B10', 16]], false);
  }

  // Floors take the tile picture by world position, so the merged model needs no UVs.
  function nightLights(material) {     // the same night lights for the models made from the design sheets
    if (!material.map) return;
    material.onBeforeCompile = shader => {
      shader.uniforms.uNight = uNight;
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uNight;\n' + LIGHTS)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_MAP\nvec3 lit = texture2D(map, vMapUv).rgb;\ntotalEmissiveRadiance += pow(lit, vec3(2.2)) * lightMask(lit, 0.38) * uNight * 1.3;\n#endif');
    };
    material.customProgramCacheKey = () => 'night-lights';
  }
  function glassy(material) {          // the roadster's grey windscreen becomes see-through glass, so its riders show
    const before = material.onBeforeCompile;
    material.transparent = true;
    material.onBeforeCompile = shader => {
      before(shader);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vGlassY;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlassY = position.y;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlassY;')
        .replace('#include <map_fragment>', '#include <map_fragment>\nvec3 gc = diffuseColor.rgb; float gsat = max(gc.r, max(gc.g, gc.b)) - min(gc.r, min(gc.g, gc.b)); float glum = dot(gc, vec3(0.3333));\nfloat glass = (1.0 - smoothstep(0.04, 0.09, gsat)) * smoothstep(0.08, 0.14, glum) * (1.0 - smoothstep(0.5, 0.6, glum)) * smoothstep(GLASS_FROM, GLASS_FROM + 0.04, vGlassY);\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.96, 1.0), glass * 0.7); diffuseColor.a *= mix(1.0, 0.2, glass);');
      shader.fragmentShader = shader.fragmentShader.replace(/GLASS_FROM/g, '0.38');
    };
    material.customProgramCacheKey = () => 'night-lights-glass';
  }
  function shipLights(material) {      // on the airship only the yellow ornaments (stars, crescent, beads) shine at night; the hull stays dark
    if (!material.map) return;
    material.onBeforeCompile = shader => {
      shader.uniforms.uNight = uNight;
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uNight;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_MAP\nvec3 lit = texture2D(map, vMapUv).rgb;\ntotalEmissiveRadiance += lit * smoothstep(0.42, 0.56, min(lit.r, lit.g) - lit.b) * uNight * 1.25;\n#endif');
    };
    material.customProgramCacheKey = () => 'ship-lights';
    material.transparent = true;       // drawn after the drifting sparkles, so none of them shows in front of the ship
  }
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
  scene.fog = new THREE.Fog(0xe8e4ff, 55, 400);   // far things fade into a pale pastel haze
  const camera = new THREE.PerspectiveCamera(50, 1, .3, 2000);
  const hemi = new THREE.HemisphereLight(0xf4f6ff, 0xe2d4ff, 2.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2ea, 2.6); sun.position.set(-45, 80, 50); scene.add(sun);
  // The glowing stage lights Pyonpy from below, and spills softly onto everyone on the plaza. Strongest at night.
  const stageLight = new THREE.PointLight(0xffd6f2, 0, 30, 1.5); stageLight.position.set(0, 1.1, 0); scene.add(stageLight);
  const stageFill = new THREE.PointLight(0xbfe9ff, 0, 34, 1.4); stageFill.position.set(0, 6.5, 0); scene.add(stageFill);
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
  const fogDay = new THREE.Color(0xe8e4ff), fogNight = new THREE.Color(0x1b1450);
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
    stageLight.intensity = lerp(6, 70, k); stageFill.intensity = lerp(0, 55, k);
    sk.panoMix.value = panoReady ? 1 - k : 0;
    uSkinGlow.value = lerp(.42, .02, k); uNight.value = k;   // the pictures light themselves a little, so shading does not darken their pastel colours if (N.skylineDay) { N.skylineDay.material.opacity = 1 - k; N.skylineNight.material.opacity = k; N.skylineNight.visible = k > .01; N.skylineDay.visible = k < .99; }
    if (N.plazaArt) N.plazaArt.material.color.setScalar(lerp(1, .55, k));
    if (N.mistLayers) N.mistLayers.forEach(m => m.material.color.setRGB(lerp(.925, .2, k), lerp(.894, .16, k), lerp(1, .42, k), THREE.SRGBColorSpace));
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
    anime:   {anchor: 'Anchor_Anime',   label: '3Dアニメ',       labelY: 9, dist: 27, h: 7,   lookY: 14, ask: [-.55, 25, 2.0, 12.5]},
    game:    {anchor: 'Anchor_Game',    label: 'ゲーム',         labelY: 5.6, dist: 17, h: -5, lookY: 0, ask: [.6, 21, -9.5, .6]},
    music:   {anchor: 'Anchor_Music',   label: '音楽',           labelY: 6, dist: 25, h: 4.4, lookY: 6.2, ask: [-.55, 22, 1.9, 6.6]},
    friends: {anchor: 'Anchor_Friends', label: '愉快な仲間たち', labelY: 9, dist: 18, h: 4.6, lookY: 7, ask: [-.5, 17.5, 1.8, 7.6]},
    lab:     {anchor: 'Anchor_Lab',     label: '制作ラボ',       labelY: 7, dist: 20, h: 4.2, lookY: 6, ask: [-.5, 17.5, 1.8, 6.6]},
    roadmap: {anchor: 'Anchor_Roadmap', label: 'ロードマップ',   labelY: 9, dist: 31, h: 6.5, lookY: 25, ask: [-.42, 33, 1.7, 30]}
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
  let ufoAngle = 2.4, ufoRise = 1, airshipStart = null;

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
    sparkle.renderOrder = -1; scene.add(sparkle);
    setShutters(boost.shutter);
    skinCity();
    // The lower level lies in mist: layers of haze thicken with depth, so nothing below is cut off sharply,
    // and only the lights of the town underneath shine up through it.
    N.mistLayers = [-4, -9, -15, -22, -30, -40, -52].map((y, i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(460, 48), new THREE.MeshBasicMaterial({color: 0xece4ff, transparent: true, opacity: .2 + i * .02, depthWrite: false, fog: false}));
      m.rotation.x = -Math.PI / 2; m.position.y = y; m.renderOrder = 3; scene.add(m); return m; });
    const glowing = new Map();
    for (const part of [N.City_Lower]) if (part) part.traverse(o => {
      if (!o.isMesh || !/M_(N_|W_)/.test(o.material.name || '')) return;
      if (!glowing.has(o.material)) { const c = o.material.clone(); c.onBeforeCompile = o.material.onBeforeCompile; c.customProgramCacheKey = o.material.customProgramCacheKey; c.transparent = true; c.depthWrite = false; c.fog = false; glowing.set(o.material, c); }
      o.material = glowing.get(o.material); o.renderOrder = 6;
    });
    // The plaza floor and Pyonpy's stage get their own round pictures.
    const disc = (file, radius, y) => { const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), new THREE.MeshBasicMaterial({map: textures.load(file, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; }), alphaTest: .5, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}));   // solid, so clouds in front of it hide it
      m.rotation.x = -Math.PI / 2; m.position.y = y; m.renderOrder = 1; scene.add(m); return m; };
    N.plazaArt = disc('assets/city/plaza-floor.webp', 17.2, .285); N.stageArt = disc('assets/city/stage-emblem.webp', 2.62, .7);
    // Far skyline: a painted band right round the horizon, day and night versions.
    const band = file => { const map = textures.load(file, t => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; }); map.repeat.set(3, 1);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(310, 310, 216, 96, 1, true), new THREE.MeshBasicMaterial({map, transparent: true, side: THREE.BackSide, depthWrite: false, toneMapped: false, fog: true}));
      m.position.y = -70 + 108; m.renderOrder = -5; scene.add(m); return m; };
    N.skylineDay = band('assets/city/skyline-day.webp'); N.skylineNight = band('assets/city/skyline-night.webp');

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
    const [turn, dist, eye, lookY] = place.ask;
    // the UFO is looked at from the tower's side, so the big airship can never drift in between
    const dir = (place.id === 'game' ? N.UFO.position.clone().setY(0).normalize().negate() : front(place)).applyAxisAngle(V(0, 1, 0), turn);
    const base = place.id === 'game' ? N.UFO.position : place.node.position;
    return {pos: base.clone().addScaledVector(dir, dist).add(V(0, eye, 0)), look: base.clone().add(V(0, lookY, 0))};
  }

  // Choosing a place flies the camera there and stops. You then decide: go in, or back to the city.
  const enterEl = $('#city-enter'); let asking = null;
  async function go(id) {
    const place = PLACES[id], link = links.find(a => a.dataset.place === id);
    if (!place || !link || mode !== 'orbit') return;
    mode = 'fly'; shiftT = -1;
    body.classList.add('is-travelling'); link.classList.add('is-going');
    hintEl.classList.remove('is-on'); bubbleEl.hidden = true;
    sound.fx.select();
    const target = vantage(place);
    if (!motionOff()) { sound.fx.whoosh(1.7); await fly(target.pos, target.look, 1.9, 5); }
    else { camPos.copy(target.pos); camLook.copy(target.look); }
    asking = {id, place, link};
    $('#enter-name').textContent = tr(place.label); $('#enter-where').textContent = tr(link.querySelector('.where').textContent);
    body.classList.remove('is-travelling'); body.classList.add('is-asking'); enterEl.hidden = false; mode = 'ask';
    $('#enter-yes').focus({preventScroll: true});
  }
  async function enterPlace() {
    if (mode !== 'ask' || !asking) return;
    const {id, place, link} = asking; enterEl.hidden = true; shiftT = 0; body.classList.add('is-travelling'); mode = 'fly'; sound.fx.select();
    if (id === 'sns') { await enterSns(); return; }
    if (!motionOff() && await SHOW[id](place)) { location.href = link.href; return; }
    wipeEl.classList.add('is-on'); await wait(.72); location.href = link.href;
  }
  async function backToCity() {
    if (mode !== 'ask' || !asking) return;
    const {link, ship} = asking; asking = null; enterEl.hidden = true; link.classList.remove('is-going'); mode = 'fly'; shiftT = 0; if (ship) ship.halt = false;
    orbitPose(tmp, tmp2);
    if (!motionOff()) await fly(tmp.clone(), tmp2.clone(), 1.5, 4);
    body.classList.remove('is-asking', 'is-travelling'); mode = 'orbit';
  }
  $('#enter-yes').addEventListener('click', enterPlace); $('#enter-no').addEventListener('click', backToCity);
  addEventListener('keydown', event => { if (event.key === 'Escape') backToCity(); });

  let hotGame = false, hotSns = false;
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
    if (id === 'game' || id === 'roadmap') view.tiltT = id === 'game' ? .2 : .75; else view.tiltT = .12;
  }

  // 07 SNS: look up at the airship and open the row of SNS buttons (the airship itself does the same when clicked).
  const snsEl = $('#city-sns'), snsLink = document.querySelector('.city-menu a[data-sns]');
  async function openSns() {
    if (mode !== 'orbit') return;
    mode = 'fly'; shiftT = -1; body.classList.add('is-travelling'); snsLink.classList.add('is-going'); hintEl.classList.remove('is-on'); bubbleEl.hidden = true;
    sound.fx.select();
    const ship = traffic.find(t => t.id === 'airship');
    if (ship && !motionOff()) {
      ship.halt = true; sound.fx.whoosh(2.2);
      const p = ship.car.position.clone().add(V(0, 39, 0)), out = p.clone().setY(0).normalize();
      await fly(p.clone().addScaledVector(out, -132).add(V(0, -16, 0)), p, 2.3, 8);
      burst(p, PASTEL, 90, 14, 1.4); sound.fx.arrive();
    }
    // the same question as every other place: go in, or back to the city
    asking = {id: 'sns', link: snsLink, ship};
    const where = snsLink.querySelector('.where'); $('#enter-name').textContent = 'SNS'; $('#enter-where').textContent = where ? tr(where.textContent) : '';
    body.classList.remove('is-travelling'); body.classList.add('is-asking'); enterEl.hidden = false; mode = 'ask';
    $('#enter-yes').focus({preventScroll: true});
  }
  async function enterSns() {
    const {ship} = asking;
    if (ship && !motionOff()) { const p = ship.car.position.clone().add(V(0, 39, 0)), out = p.clone().setY(0).normalize(); await fly(p.clone().addScaledVector(out, -73).add(V(0, -6, 0)), p, 1.1, 0); }
    wipeEl.classList.add('is-on'); await wait(.72); location.href = snsLink.href;
  }
  snsLink.addEventListener('pointerenter', () => { hotSns = true; snsLink.classList.add('is-hot'); sound.fx.hover(); });
  snsLink.addEventListener('focus', () => { hotSns = true; });
  for (const type of ['pointerleave', 'blur']) snsLink.addEventListener(type, () => { hotSns = false; snsLink.classList.remove('is-hot'); if (mode === 'orbit') view.tiltT = .12; });
  snsLink.addEventListener('click', event => { if (body.classList.contains('no-3d') || event.metaKey || event.ctrlKey || event.shiftKey) return; event.preventDefault(); if (mode === 'intro') skipIntro(); openSns(); });
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
      for (const name of ['hips', 'spine', 'chest', 'head', 'upperarmL', 'forearmL', 'upperarmR', 'forearmR']) PB[name] = model.getObjectByName(name);
      pyonMixer.addEventListener('finished', () => { if (move && move.once) dance(); else if (move) playPyon(pyonActions[move.clip] ? move.clip : 'Idle'); });
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
    game:    {height: 10, hide: []}
  };
  const landmarkModels = {};
  function loadLandmarks() {
    for (const [id, spec] of Object.entries(MODELS)) {
      new GLTFLoader().load(`assets/city/lm/${id}.glb?v=20261118-2`, gltf => {
        const model = gltf.scene;
        model.traverse(node => { if (node.isMesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => { m.envMapIntensity = .45; m.roughness = .5; m.metalness = 0; nightLights(m); }); });
        model.scale.setScalar(spec.height);
        if (id === 'game') {
          N.UFO.traverse(node => { if (node.isMesh && node.parent !== N.UFO_BeamMesh && node !== N.UFO_BeamMesh) node.visible = false; });
          model.position.y = -spec.height * .42; N.UFO.add(model);
        } else {
          const anchor = PLACES[id].node; model.position.copy(anchor.position); model.quaternion.copy(anchor.quaternion); scene.add(model);
          spec.hide.forEach(name => { if (N[name]) N[name].visible = false; });
        }
        if (id === 'friends') {        // the round display on the bunny building shows Yanavis's expressions, one after another
          // The display is tilted and domed, so the picture is laid on it: the surface is measured at a grid of points
          // and both the black backing and the face follow that shape.
          model.updateMatrixWorld(true);
          const CY = .4325, R = .104, G = 8, ray = new THREE.Raycaster(), grid = [];
          const depth = (x, y) => { const from = model.localToWorld(V(x, CY + y, 1)), to = model.localToWorld(V(x, CY + y, 0)); ray.set(from, to.sub(from).normalize()); const hit = ray.intersectObject(model, true)[0]; return hit ? model.worldToLocal(hit.point.clone()).z : null; };
          for (let iy = 0; iy <= G; iy++) for (let ix = 0; ix <= G; ix++) {
            let x = (ix / G * 2 - 1) * R, y = (iy / G * 2 - 1) * R; const r = Math.hypot(x, y); if (r > R) { x *= R / r; y *= R / r; }   // outside the glass: use its edge
            grid.push(depth(x, y));
          }
          const mid = grid[(G / 2) * (G + 1) + G / 2] ?? .26; for (let k = 0; k < grid.length; k++) if (grid[k] === null || Math.abs(grid[k] - mid) > .08) grid[k] = mid;
          const zAt = (x, y) => { const fx = clamp((x / R + 1) / 2, 0, 1) * G, fy = clamp((y / R + 1) / 2, 0, 1) * G, x0 = Math.min(G - 1, Math.floor(fx)), y0 = Math.min(G - 1, Math.floor(fy)), tx = fx - x0, ty = fy - y0, g = (a, b) => grid[b * (G + 1) + a];
            return lerp(lerp(g(x0, y0), g(x0 + 1, y0), tx), lerp(g(x0, y0 + 1), g(x0 + 1, y0 + 1), tx), ty); };
          const laid = (size, lift, material) => { const geo = new THREE.PlaneGeometry(size, size, 16, 16), pos = geo.attributes.position;
            for (let k = 0; k < pos.count; k++) pos.setZ(k, zAt(pos.getX(k), pos.getY(k)) + lift);
            const m = new THREE.Mesh(geo, material); m.position.set(0, CY, 0); model.add(m); return m; };
          const round = document.createElement('canvas'); round.width = round.height = 128; const rc = round.getContext('2d'); rc.fillStyle = '#0b0a1c'; rc.beginPath(); rc.arc(64, 64, 63, 0, Math.PI * 2); rc.fill();
          laid(.232, .003, new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(round), alphaTest: .5, toneMapped: false}));
          const map = textures.load('assets/city/yanavis-faces.webp', t => { t.colorSpace = THREE.SRGBColorSpace; }); map.repeat.set(1 / 6, 1);
          const blue = new THREE.MeshBasicMaterial({map, transparent: true, toneMapped: false});   // eyes and mouth in light blue; unlit, so they glow the same at night
          blue.onBeforeCompile = shader => { shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat fl = dot(diffuseColor.rgb, vec3(0.3333)); diffuseColor.rgb = vec3(0.45, 0.93, 1.0) * (0.85 + 0.3 * fl); diffuseColor.a *= smoothstep(0.08, 0.42, fl);'); };
          blue.customProgramCacheKey = () => 'blue-face';
          const face = laid(.2, .006, blue);
          bigFace = {map, face, now: 0, until: 0, pop: 0};
        }
        landmarkModels[id] = model;
      }, undefined, () => { /* the hand-built landmark stays */ });
    }
  }
  // He dances on the stage, facing the main road. A routine of moves runs one after another: some are his own clips
  // (cheer, jump, talk), the others are made here by swinging his arms, chest and hips in time, with spins and side steps.
  const MOVES = [{n: 'wave', d: 4, clip: 'Idle'}, {n: 'point', d: 4, clip: 'Idle'}, {n: 'Cheer', once: true}, {n: 'spin', d: 3, clip: 'Idle'}, {n: 'side', d: 4, clip: 'Idle'},
    {n: 'Jump', once: true}, {n: 'run', d: 4, clip: 'Run'}, {n: 'pump', d: 4, clip: 'Idle'}, {n: 'Talk', once: true}, {n: 'spin', d: 3, clip: 'Idle'}];
  const PB = {}, danceAxis = V(0, 0, 0), danceQ = new THREE.Quaternion(), danceP = new THREE.Quaternion();
  let moveIndex = -1, move = null, moveT = 0, moveD = 0, pyonTurning = false, pyonFacing = 0;
  function dance() {
    for (let tries = 0; tries < MOVES.length; tries++) {
      moveIndex = (moveIndex + 1) % MOVES.length; move = MOVES[moveIndex]; moveT = 0;
      if (move.once) { const action = pyonActions[move.n]; if (!action) continue; playPyon(move.n, true); moveD = action.getClip().duration + 1; return; }
      playPyon(pyonActions[move.clip] ? move.clip : 'Idle'); moveD = move.d; return;
    }
  }
  function bend(name, ax, ay, az, angle) {      // turn one of his bones about an axis given in his own frame (x = his left, y = up, z = his front)
    const bone = PB[name]; if (!bone || !angle) return;
    danceQ.setFromAxisAngle(danceAxis.set(ax, ay, az).normalize().applyQuaternion(pyon.quaternion), angle); bone.parent.getWorldQuaternion(danceP);
    bone.quaternion.premultiply(danceP.clone().invert().multiply(danceQ).multiply(danceP));
  }
  function updateDance(dt) {
    if (!move) return;
    moveT += dt; if (moveT > moveD) { dance(); }
    let spin = 0, slide = 0, hop = Math.abs(Math.sin(time * Math.PI * 2)) * .09, lean = Math.sin(time * Math.PI) * .07, sway = Math.sin(time * Math.PI) * .2;
    if (!move.once) {
      const w = Math.min(1, moveT / .45, (moveD - moveT) / .45), beat = time * 2, s1 = Math.sin(beat * Math.PI), s2 = Math.sin(beat * Math.PI / 2);   // 120 beats a minute
      pyon.updateMatrixWorld(true);
      if (move.n === 'wave') {                 // both arms up, swaying side to side
        bend('chest', 0, 0, 1, s2 * .16 * w); bend('upperarmL', 0, 0, 1, (2.3 + s2 * .4) * w); bend('upperarmR', 0, 0, 1, (-2.3 + s2 * .4) * w); bend('head', 0, 0, 1, -s2 * .14 * w);
      } else if (move.n === 'point') {         // one arm to the sky, then the other, hips twisting
        const k = s2 > 0 ? 1 : -1, e = Math.abs(s2);
        bend('hips', 0, 1, 0, s2 * .3 * w); bend('chest', 0, 1, 0, -s2 * .5 * w);
        bend('upperarmL', 0, 0, 1, (k > 0 ? 2.5 * e : .5 * e) * w); bend('upperarmR', 0, 0, 1, -(k < 0 ? 2.5 * e : .5 * e) * w);
        hop = Math.abs(s1) * .14;
      } else if (move.n === 'spin') {          // arms out, all the way round twice
        const k = clamp(moveT / (moveD - .3), 0, 1); spin = (k * k * (3 - 2 * k)) * Math.PI * 4; sway = 0;
        bend('upperarmL', 0, 0, 1, 1.45 * w); bend('upperarmR', 0, 0, 1, -1.45 * w); hop = Math.abs(s1) * .05;
      } else if (move.n === 'side') {          // hopping from side to side with rolling arms
        slide = s2 * .55 * w; hop = Math.abs(s1) * .26; lean = -s2 * .16; sway = s2 * .3;
        bend('upperarmL', 1, 0, 0, (-.9 + s1 * .5) * w); bend('upperarmR', 1, 0, 0, (-.9 - s1 * .5) * w); bend('forearmL', 1, 0, 0, -1.0 * w); bend('forearmR', 1, 0, 0, -1.0 * w);
      } else if (move.n === 'pump') {          // fists pumping over his head, knees bouncing
        bend('upperarmL', 0, 0, 1, (2.0 + Math.max(0, s1) * .6) * w); bend('upperarmR', 0, 0, 1, -(2.0 + Math.max(0, -s1) * .6) * w);
        bend('chest', 1, 0, 0, Math.abs(s1) * .12 * w); hop = Math.abs(s1) * .2; sway = s2 * .45;
      } else if (move.n === 'run') { hop = Math.abs(s1) * .08; sway = s2 * .55; }   // running on the spot, turning from side to side
    }
    pyon.rotation.y = pyonFacing + spin + sway; pyon.rotation.z = lean;
    pyon.position.set(slide, .68 + hop, 0);
  }
  /* ── monitors: clips from the site play on every screen; the big Moon Vision screen loops the 3D anime ── */
  const CLIPS = ['11', '03', '16', '05', '23', '01', '12', '09', '20', '14', '22', '07', '18', '25', '02', '27'].map(n => 'capsule/clip-' + n).concat(['capsule2/clip-01']);
  const videos = [];
  function holo(texture, seed) {
    const material = new THREE.MeshBasicMaterial({map: texture, toneMapped: false, transparent: true, opacity: .86, side: THREE.DoubleSide, depthWrite: false});
    material.onBeforeCompile = shader => {
      shader.uniforms.uTime = uTime; shader.uniforms.uSeed = {value: seed};
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTime; uniform float uSeed;')
        .replace('#include <map_fragment>', '#include <map_fragment>\nfloat hy = vMapUv.y; float scan = 0.82 + 0.18 * sin(hy * 240.0 - uTime * 9.0);\nfloat band = smoothstep(0.0, 0.06, abs(fract(hy * 1.3 - uTime * 0.22 + uSeed) - 0.5) - 0.44);\nfloat flick = 0.9 + 0.1 * sin(uTime * 31.0 + uSeed * 7.0) - 0.35 * step(0.985, fract(sin(floor(uTime * 7.0) + uSeed) * 43758.5));\nvec2 edge = smoothstep(vec2(0.0), vec2(0.07), vMapUv) * smoothstep(vec2(0.0), vec2(0.07), 1.0 - vMapUv);\ndiffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.72, 1.0, 1.12) + vec3(0.05, 0.1, 0.16), 0.5) * scan * flick + band * vec3(0.25, 0.5, 0.55);\ndiffuseColor.a *= (0.55 + 0.45 * edge.x * edge.y) * flick;');
    };
    material.customProgramCacheKey = () => 'holo-screen';
    return material;
  }
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
    // Hologram look: see-through, scan lines sliding up, a soft tint, bright edges and an occasional flicker.
    const material = holo(entry.texture, videos.length * 1.37 + entry.planes.length * .61);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    plane.userData = {w, h, entry}; entry.planes.push(plane); if (entry.el.videoWidth) fit(plane);
    return plane;
  }
  function fit(plane) {             // crop the clip to the screen's shape (tall clips are trimmed top and bottom)
    const {w, h, entry} = plane.userData, have = entry.el.videoWidth / entry.el.videoHeight, want = w / h, uv = plane.geometry.attributes.uv;
    let u = 1, v = 1; if (have > want) u = want / have; else v = have / want;
    const u0 = (1 - u) / 2, v0 = (1 - v) / 2;
    uv.setXY(0, u0, v0 + v); uv.setXY(1, u0 + u, v0 + v); uv.setXY(2, u0, v0); uv.setXY(3, u0 + u, v0); uv.needsUpdate = true;
  }
  // The airship plays the SNS videos one after the other. Each is tall, so the screen shows a wide slice of it
  // that drifts up and down and pushes in and out, picking a new framing every few seconds.
  const SNS_CLIPS = ['assets/city/sns/1.mp4', 'assets/city/sns/2.mp4'];
  let sns = null;
  function snsScreen(w, h) {
    if (!sns) {
      const el = document.createElement('video'); el.muted = true; el.playsInline = true; el.preload = 'auto'; el.src = SNS_CLIPS[0];
      const texture = new THREE.VideoTexture(el); texture.colorSpace = THREE.SRGBColorSpace;
      sns = {el, texture, index: 0, planes: [], zoom: 1, pan: .5, zoomT: 1, panT: .5, next: 0};
      el.addEventListener('ended', () => { sns.index = (sns.index + 1) % SNS_CLIPS.length; el.src = SNS_CLIPS[sns.index]; el.play().catch(() => {}); });
      el.play().catch(() => {});
      addEventListener('pointerdown', () => { if (el.paused) el.play().catch(() => {}); }, {passive: true});
    }
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), holo(sns.texture, 4.2 + sns.planes.length));
    plane.userData.want = w / h; sns.planes.push(plane); return plane;
  }
  function updateSns(dt) {
    if (!sns || !sns.el.videoWidth) return;
    if (time > sns.next) {
      // Pyonpy's face is about half way up both videos. Shots that show it stay on for a while and drift slowly;
      // shots of anything else (feet, signs, the street) are quick cuts.
      const face = Math.random() < .68; sns.zoom = face ? 1 + Math.random() * 1.2 : 1.3 + Math.random() * 1.1;
      sns.pan = face ? .5 + (Math.random() - .5) * .08 : Math.random() < .5 ? .08 + Math.random() * .24 : .68 + Math.random() * .24;
      sns.zoomT = sns.zoom * (face ? .88 + Math.random() * .3 : 1); sns.panT = sns.pan + (face ? (Math.random() - .5) * .06 : 0);
      sns.next = time + (face ? 5 + Math.random() * 4 : .55 + Math.random() * .6);
    }
    const k = 1 - Math.pow(.75, dt); sns.zoom = lerp(sns.zoom, sns.zoomT, k); sns.pan = lerp(sns.pan, sns.panT, k);
    const have = sns.el.videoWidth / sns.el.videoHeight;
    for (const plane of sns.planes) {
      const want = plane.userData.want; let u = 1 / sns.zoom, v = (have / want) / sns.zoom; if (v > 1) { u /= v; v = 1; }
      const u0 = (1 - u) / 2, v0 = clamp(sns.pan - v / 2, 0, 1 - v), uv = plane.geometry.attributes.uv;
      uv.setXY(0, u0, v0 + v); uv.setXY(1, u0 + u, v0 + v); uv.setXY(2, u0, v0); uv.setXY(3, u0 + u, v0); uv.needsUpdate = true;
    }
  }
  function loadScreens() {
    // Go round the city in order and hand out the clips in turn, so screens that stand side by side never show the same one.
    const screens = Object.entries(N).filter(([name, node]) => /^Scr\d+$/.test(name) && node.userData.w).map(([, node]) => node)
      .sort((a, b) => Math.atan2(a.position.z, a.position.x) - Math.atan2(b.position.z, b.position.x));
    screens.forEach((node, i) => node.add(videoScreen(CLIPS[i % CLIPS.length], node.userData.w, node.userData.h)));
    const anchor = PLACES.anime.node, big = videoScreen('anime/uchu-ramen', 11.9, 6.7);
    const holder = new THREE.Group(); holder.position.copy(anchor.position); holder.quaternion.copy(anchor.quaternion);
    big.position.set(0, 10.5, 5.8); holder.add(big); scene.add(holder);
    addEventListener('pointerdown', () => videos.forEach(v => { if (v.el.paused) v.el.play().catch(() => {}); }), {passive: true});
  }

  /* ── the cast: characters who walk about the city. Click one to meet them. ── */
  const segment = (x0, z0, x1, z1, y) => { const L = Math.hypot(x1 - x0, z1 - z0); return {length: L * 2, at: (d, out) => { d = ((d % (L * 2)) + L * 2) % (L * 2); const k = (d < L ? d : L * 2 - d) / L; out.set(lerp(x0, x1, k), y, lerp(z0, z1, k)); }}; };
  const CAST = {
    ranpyon: {height: 2.3, yaw: 0, route: circle(4.4, .3), speed: .9, ride: 'scooter', seat: [0, .62, -.12], kicker: 'RANPYON', role: 'ツッコミ担当', name: 'らんぴょん',
              text: '地球人とムーニアンのハーフ。自分の「好き」を形にする、クリエイターなツッコミ担当。'},
    luva:    {height: 3.1, yaw: 0, route: segment(-1.3, -19.5, -1.3, -33, .22), speed: .7, view: [.25, 1], kicker: 'ZA-LUVA SELES', role: '二人の上司', name: 'ザ・ルーヴァ・セレス',
              text: '三日月大使館（クレッセントエンバシー）の偉い人。らんぴょんとぴょんぴーの上司です。胸には三日月、手にはマイク。二人の地球での活動を、おだやかな笑顔で見守っています。'},
    kaguya:  {height: 11.5, yaw: 0, route: circle(1, 0), speed: .5, holo: [0, 3.3, 74], glide: true, view: [.18, -1], kicker: 'PRINCESS KAGUYA', role: '月の宮の皇族', name: 'かぐや様',
              text: '月の宮に住む、皇族のお姫さま。三日月の髪飾りに、竹と月の模様の衣をまとい、手には扇。そして、ぴょんぴーの好きな人です。'},
    // DJ Ramune and PT ride in the plaza roadster, side by side.
    ramune:  {height: 2.0, yaw: 0, route: circle(4.4, .3), speed: .9, ride: 'roadster', seat: [-.5, .42, -.2], kicker: 'DJ RAMUNE', role: 'らんぴょんの妹', name: 'DJらむね',
              text: 'らんぴょんの妹。月でDJをしています。'},
    pt:      {height: 1.1, yaw: 0, route: circle(4.4, .3), speed: .9, ride: 'roadster', seat: [.5, .62, -.2], kicker: 'PTPUTY / PT', role: 'らむねの相方', name: 'ピーティープティ',
              text: 'ニックネームは「PT」。DJらむねの相方で、親友。好きなのは、ぴょんぴー。身長はおよそ45cm。'},
    // Grouper grooves on the spot in front of the Music Dome.
    grouper: {height: 3.0, yaw: 0, route: circle(.6, .22, 20.4, 6.5), speed: .35, dance: true, view: [-.75, -.65], kicker: 'GROUPER', role: '音楽の星のエイリアン', name: 'グルーパー',
              text: '音楽の星「グルーヴィア星」から来た、機械の体のエイリアン。「地球の音楽はクソすぎる！」と地球を破壊しに来たけれど、ぴょんぴーとのラップバトルでそのバイブスに感化され、まさかの友達に。地球滅亡は、ギリギリで回避されました。'},
    // Yanavis rolls on wheels: a smooth glide round the outer ring of the plaza, with a little bump now and then.
    robot:   {height: 1.9, yaw: 0, route: circle(16, .3), speed: -1.7, glide: true, view: 'out', kicker: 'Y.A.N.A.V.I.S', role: '人工知能', name: 'ヤナビス',
              text: '翻訳酸素カプセルから聞こえる声の主。ぴょんぴーのムーニアン語を、日本語に同時翻訳してくれる人工知能です。'}
  };
  const PHOTOS = {ranpyon: 1, pyon: 1, luva: 1, kaguya: 1, ramune: 1, pt: 1, robot: 1, grouper: 1};   // close-up face pictures in assets/city/faces
  const cast = [], profileEl = $('#city-profile');
  // Pyonpy stays on his stage, but meets you the same way as the others.
  const pyonMember = {id: 'pyon', actions: {}, stopped: false, spec: {height: 2.3, view: [.35, 1], kicker: 'PYONPY', role: 'ボケ担当', name: 'ぴょんぴー',
    text: '超ポジティブで、みんなの兄貴分。月と地球を笑いでつなぐ、もふもふのボケ担当。'}};
  let meeting = null, shift = 0, shiftT = 0, profileRide = false;
  function loadCast() {
    Object.entries(CAST).forEach(([id, spec], index) => {
      new GLTFLoader().load(`assets/city/cast/${id}.glb?v=20261118-2`, gltf => {
        const model = gltf.scene; model.scale.setScalar(spec.height); model.rotation.y = spec.yaw;
        model.traverse(node => { if (node.isMesh) { node.frustumCulled = false; (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => { m.envMapIntensity = .5; m.roughness = .55; m.metalness = 0; }); } });
        const group = new THREE.Group(); group.add(model); scene.add(group);
        if (spec.holo) {               // a projected figure: see-through, blue-tinted, scan lines, a flicker, and a beam of light under her feet
          model.traverse(node => { if (!node.isMesh) return;
            const material = new THREE.MeshBasicMaterial({map: node.material.map, transparent: true, toneMapped: false});
            material.onBeforeCompile = shader => {
              shader.uniforms.uTime = uTime;
              shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTime;')
                .replace('#include <map_fragment>', '#include <map_fragment>\nfloat hl = dot(diffuseColor.rgb, vec3(0.3333)); float hs = 0.72 + 0.28 * sin(gl_FragCoord.y * 1.5 - uTime * 6.0);\nfloat hf = 0.93 + 0.07 * sin(uTime * 23.0) - 0.3 * step(0.988, fract(sin(floor(uTime * 6.0)) * 43758.5));\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(hl) * vec3(0.6, 1.0, 1.15) + vec3(0.12, 0.3, 0.42), 0.5) * hs * hf * 1.2; diffuseColor.a *= 0.82 * hf;');
            };
            material.customProgramCacheKey = () => 'holo-figure'; node.material = material; });
          const beam = new THREE.Mesh(new THREE.CylinderGeometry(4.2, .5, spec.holo[1] - .3, 28, 1, true), new THREE.MeshBasicMaterial({color: 0x8fe9ff, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false}));
          beam.position.set(spec.holo[0], (spec.holo[1] + .3) / 2, spec.holo[2]); scene.add(beam);
          const pad = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, .08, 40), new THREE.MeshBasicMaterial({color: 0xbff4ff, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
          pad.position.set(spec.holo[0], spec.holo[1], spec.holo[2]); scene.add(pad);
        }
        const mixer = new THREE.AnimationMixer(model), actions = {};
        gltf.animations.forEach(clip => { actions[clip.name] = mixer.clipAction(clip); });
        // Characters with a full skeleton come with a seated or dancing clip; that is their everyday pose.
        if (actions.Sit) actions.Idle = actions.Walk = actions.Sit;
        if (actions.Dance) actions.Idle = actions.Walk = actions.Dance;
        const member = {id, spec, group, mixer, actions, active: null, d: index * 7, facing: 0, stopped: false, head: model.getObjectByName('Hips') ? model.getObjectByName('Head') : null, chest: model.getObjectByName('Hips') ? (model.getObjectByName('Spine02') || model.getObjectByName('Spine')) : null, look: 0, hop: 0};
        member.proxy = new THREE.Mesh(new THREE.SphereGeometry(spec.height * .62, 10, 8)); member.proxy.userData = {kind: 'cast', id}; proxies.push(member.proxy);
        mixer.addEventListener('finished', () => playCast(member, member.stopped || spec.glide || spec.ride ? 'Idle' : spec.dance ? 'React' : 'Walk'));
        if (id === 'robot') {          // Yanavis's face is a display: six expressions that change by themselves and when it is clicked
          const map = textures.load('assets/city/yanavis-faces.webp', t => { t.colorSpace = THREE.SRGBColorSpace; }); map.repeat.set(1 / 6, 1);
          // The display is a curved cap that hugs the round head, instead of a flat disc standing off it.
          const R = .262, geo = new THREE.PlaneGeometry(.31, .31, 18, 18), pos = geo.attributes.position;
          for (let i = 0; i < pos.count; i++) { const d2 = pos.getX(i) ** 2 + pos.getY(i) ** 2; pos.setZ(i, Math.sqrt(Math.max(0, R * R - d2)) + .004); }
          const face = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({map, transparent: true, toneMapped: false}));
          face.position.set(0, .612, 0); model.add(face);
          // Its face sits on the body section of the rig (the "head" bone of this model only carries the ears), so fix it there.
          const faceBone = model.getObjectByName('chest'); if (faceBone) { group.updateMatrixWorld(true); faceBone.attach(face); }
          member.face = {map, now: 0, until: 0, set(i, seconds) { this.now = i; this.until = time + seconds; map.offset.x = i / 6; }};
        }
        playCast(member, 'Walk'); cast.push(member);
      }, undefined, () => { /* the city works without them */ });
    });
  }
  function playCast(member, name, once = false) {
    const next = member.actions[name]; if (!next) return;
    next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); next.clampWhenFinished = once;
    if (member.active && member.active !== next) next.crossFadeFrom(member.active, .25, false);
    next.play(); member.active = next;
  }
  const castPos = V(0, 0, 0), castNext = V(0, 0, 0), lookQ = new THREE.Quaternion(), lookQ2 = new THREE.Quaternion(), lookE = new THREE.Euler(), UP = V(0, 1, 0);
  function updateCast(dt, still) {
    if (lineup) { cast.forEach((m, i) => { m.group.position.set(-4.5 + i * 3, .3, 8.5); m.group.rotation.y = 0; if (!still) m.mixer.update(dt); }); return; }
    for (const m of cast) {
      if (m.face && time > m.face.until) { const happy = m.face.now !== 0; m.face.set(happy ? 0 : [1, 2, 3, 4, 5, 1, 2][Math.floor(Math.random() * 7)], happy ? 3 + Math.random() * 4 : 1.6 + Math.random() * 1.4); }
      // A rider goes wherever their vehicle goes (Ranpyon on the plaza scooter); everyone else walks their own route.
      const mount = m.spec.ride ? traffic.find(t => t.id === m.spec.ride && t.routeName === 'plaza') : null;
      if (mount) {
        if (m.stopped) mount.halt = true; else if (!cast.some(o => o.stopped && o.spec.ride === m.spec.ride)) mount.halt = false;
        const seat = m.spec.seat || [0, .42, 0], yaw = mount.car.rotation.y;
        castPos.copy(mount.car.position); castPos.x += Math.cos(yaw) * seat[0] + Math.sin(yaw) * seat[2]; castPos.z += -Math.sin(yaw) * seat[0] + Math.cos(yaw) * seat[2]; castPos.y += seat[1];
        castNext.copy(castPos).add(tmp.set(Math.sin(mount.car.rotation.y), 0, Math.cos(mount.car.rotation.y)));
        if (m.active === m.actions.Walk) playCast(m, 'Idle');
      } else {
        if (!m.stopped && !still) m.d += m.spec.speed * dt;
        if (m.spec.holo) { castPos.set(m.spec.holo[0], m.spec.holo[1] + Math.sin(time * .8) * .18, m.spec.holo[2]); castNext.set(castPos.x + Math.sin(time * .32), 0, castPos.z + Math.cos(time * .32)); }   // floats and turns on the spot
        else m.spec.route.at(m.d, castPos); if (!m.spec.holo) m.spec.route.at(m.d + Math.sign(m.spec.speed) * .4, castNext);   // look the way they are actually going
        if (m.spec.dance) {            // riding the rhythm: a looping hop-and-nod, a bounce and a sway, always facing the plaza
          if (m.active !== m.actions.Walk && m.active !== m.actions.React && !m.stopped) playCast(m, 'Walk');
          castPos.y += Math.abs(Math.sin(time * 4.6)) * .14; castNext.set(castPos.x - castPos.x * .1 + Math.sin(time * 2.3) * .5, 0, castPos.z - castPos.z * .1);
        }
        if (m.spec.glide) {            // wheels: no walking sway, just an occasional "koton, koton" over an imagined pebble
          if (m.active === m.actions.Walk) playCast(m, 'Idle');
          const p = Math.abs(m.d / m.spec.speed) % 5.2;
          if (!m.stopped && !m.spec.holo) castPos.y += p < .14 ? Math.sin(p / .14 * Math.PI) * .07 : p > .24 && p < .36 ? Math.sin((p - .24) / .12 * Math.PI) * .045 : 0;
        }
      }
      if (m.hop > 0) { m.hop = Math.max(0, m.hop - dt * 1.1); castPos.y += Math.abs(Math.sin(m.hop * Math.PI * 2)) * .2 * m.hop * m.spec.height / 2; }   // "me?" - two small hops
      m.group.position.copy(castPos);
      let want = m.stopped && !mount ? Math.atan2(camPos.x - castPos.x, camPos.z - castPos.z) : Math.atan2(castNext.x - castPos.x, castNext.z - castPos.z), delta = want - m.facing;
      while (delta > Math.PI) delta -= Math.PI * 2; while (delta < -Math.PI) delta += Math.PI * 2;
      m.facing += delta * (1 - Math.pow(.01, dt)); m.group.rotation.y = m.facing;
      if (!still) m.mixer.update(dt);
      if (m.head && !still) {          // a character with a real skeleton turns to look into the camera while they are the one chosen
        m.look = lerp(m.look, m.stopped || meeting === m ? 1 : 0, 1 - Math.pow(.02, dt));   // riders are chosen without being stopped
        if (m.look > .01) {
          m.group.updateMatrixWorld(true); m.head.getWorldPosition(tmp);
          const dx = camPos.x - tmp.x, dy = camPos.y - tmp.y, dz = camPos.z - tmp.z;
          let yaw = Math.atan2(dx, dz) - m.facing; while (yaw > Math.PI) yaw -= Math.PI * 2; while (yaw < -Math.PI) yaw += Math.PI * 2;
          yaw = clamp(yaw, -1.75, 1.75) * m.look; const pitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -.45, .45) * m.look;
          const turnBone = (bone, y, p) => {     // a turn in world space, whatever way the bone itself lies
            lookQ.setFromEuler(lookE.set(-p, m.facing + y, 0, 'YXZ')).multiply(lookQ2.setFromAxisAngle(UP, -m.facing));
            bone.parent.getWorldQuaternion(lookQ2); bone.quaternion.premultiply(lookQ2.clone().invert().multiply(lookQ).multiply(lookQ2));
          };
          if (m.chest) { turnBone(m.chest, yaw * .28, 0); m.chest.updateMatrixWorld(true); turnBone(m.head, yaw * .72, pitch); }   // the shoulders come round too
          else turnBone(m.head, yaw, pitch);
        }
      }
      m.proxy.position.copy(castPos); m.proxy.position.y += m.spec.height * .55; m.proxy.updateMatrixWorld();
    }
    // While a rider's profile is open, the camera keeps pace just ahead of their vehicle.
    if (meeting && meeting.spec.ride && (mode === 'meet' || mode === 'fly') && profileRide) {
      const p = meeting.group.position, yaw = meeting.group.rotation.y + .55, eye = meeting.spec.height * .58, k = 1 - Math.pow(.004, dt);
      camPos.lerp(tmp.set(p.x + Math.sin(yaw) * 4.4, p.y + eye + 1.0, p.z + Math.cos(yaw) * 4.4), k); camLook.lerp(tmp2.set(p.x, p.y + eye, p.z), k);
    }
    // slide the view sideways while a profile is open, so the character stands on the right
    if (Math.abs(shiftT - shift) > .001) { shift = lerp(shift, shiftT, 1 - Math.pow(.01, dt)); applyOffset(); } else if (shift !== shiftT) { shift = shiftT; applyOffset(); }
    updateName();
  }
  // Finding a character under the pointer is done on the screen, with a generous circle round each of them,
  // so a small or moving character is still easy to point at and click.
  const nameEl = document.createElement('div'); nameEl.className = 'city-name'; nameEl.hidden = true; document.body.appendChild(nameEl);
  let hovered = null;
  const everyone = () => pyon ? [...cast, Object.assign(pyonMember, {group: pyon})] : cast;
  function castAt(x, y, except) {
    let best = null, score = 1;
    for (const m of everyone()) {
      if (m === except) continue;
      m.group.getWorldPosition(tmp); tmp.y += m.spec.height * .5; const far = tmp.distanceTo(camera.position); tmp.project(camera);
      if (tmp.z > 1 || tmp.z < -1) continue;
      const size = m.spec.height * .7 * (innerHeight / 2) / (far * Math.tan(camera.fov * Math.PI / 360));
      const r = Math.max(46, size), d = Math.hypot((tmp.x + 1) / 2 * innerWidth - x, (1 - tmp.y) / 2 * innerHeight - y) / r;
      if (d < score) { score = d; best = m; }
    }
    return best;
  }
  let bigFace = null;
  function updateBigFace(dt) {
    if (!bigFace) return;
    if (time > bigFace.until) { let next = Math.floor(Math.random() * 6); if (next === bigFace.now) next = (next + 1) % 6; bigFace.now = next; bigFace.map.offset.x = next / 6; bigFace.until = time + .9 + Math.random() * .9; bigFace.pop = 1; }
    bigFace.pop = Math.max(0, bigFace.pop - dt * 4); { const k = 1 + Math.sin(bigFace.pop * Math.PI) * .12; bigFace.face.scale.set(k, k, 1); }   // each new face pops in
  }
  function updateName() {             // a small name tag over whoever is pointed at, and over whoever's profile is open
    const m = (mode === 'meet' || (mode === 'fly' && meeting)) ? (hovered || meeting) : mode === 'orbit' ? hovered : null;
    if (!m) { nameEl.hidden = true; return; }
    m.group.getWorldPosition(tmp); tmp.y += m.spec.height * (m.spec.ride ? .98 : 1.1); tmp.project(camera);
    if (tmp.z > 1) { nameEl.hidden = true; return; }
    const label = tr(m.spec.name); if (nameEl.textContent !== label) nameEl.textContent = label;
    nameEl.classList.toggle('is-chosen', m === meeting); nameEl.hidden = false;
    nameEl.style.transform = `translate(${((tmp.x + 1) / 2 * innerWidth).toFixed(1)}px,${((1 - tmp.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%,-100%)`;
  }
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || event.buttons) return;
    hovered = mode === 'orbit' || mode === 'meet' ? castAt(event.clientX, event.clientY, mode === 'meet' ? meeting : null) : null;
    canvas.style.cursor = hovered ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; canvas.style.cursor = ''; });
  let editPlace = null;
  if (new URL(location.href).searchParams.has('edit')) {
    try { const saved = JSON.parse(localStorage.getItem('moonians.city-angles') || '{}'); for (const [id, ask] of Object.entries(saved)) if (PLACES[id] && Array.isArray(ask) && ask.length === 4) PLACES[id].ask = ask; } catch { /* optional */ }
    const open = document.createElement('button'); open.type = 'button'; open.className = 'city-edit-open'; open.textContent = 'アングル編集';
    (document.querySelector('.city-top .city-logo') || document.querySelector('.city-top').firstElementChild).insertAdjacentElement('afterend', open);
    const panel = document.createElement('div'); panel.className = 'city-edit'; panel.hidden = true;
    const FIELDS = [['向き（まわりこみ）', -3.14, 3.14, .01], ['距離', 5, 70, .1], ['カメラの高さ', -12, 45, .1], ['見る高さ', -6, 70, .1]];
    panel.innerHTML = '<strong>アングル編集</strong><select></select>' + FIELDS.map(([label, min, max, step]) => `<label><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}"><output></output></label>`).join('') +
      '<textarea readonly rows="7"></textarea><div><button type="button" data-do="copy">数字をコピー</button><button type="button" data-do="reset">この場所を元にもどす</button><button type="button" data-do="close">終わる</button></div><p>スライダーで決めて「数字をコピー」→ チャットに貼ってください。</p>';
    document.body.appendChild(panel);
    const pick = panel.querySelector('select'), ranges = [...panel.querySelectorAll('input')], outs = [...panel.querySelectorAll('output')], text = panel.querySelector('textarea');
    const original = Object.fromEntries(Object.entries(PLACES).map(([id, p]) => [id, [...p.ask]]));
    for (const [id, p] of Object.entries(PLACES)) pick.add(new Option(p.label, id));
    const show = () => {
      editPlace = PLACES[pick.value]; editPlace.ask.forEach((v, i) => { ranges[i].value = v; outs[i].textContent = (+v).toFixed(2); });
      text.value = Object.entries(PLACES).map(([id, p]) => `${id}: [${p.ask.map(v => +(+v).toFixed(2)).join(', ')}]`).join('\n');
      $('#enter-name').textContent = tr(editPlace.label); $('#enter-where').textContent = '';
      try { localStorage.setItem('moonians.city-angles', JSON.stringify(Object.fromEntries(Object.entries(PLACES).map(([id, p]) => [id, p.ask])))); } catch { /* optional */ }
    };
    ranges.forEach((r, i) => r.addEventListener('input', () => { editPlace.ask[i] = +r.value; show(); }));
    pick.addEventListener('change', show);
    open.addEventListener('click', () => { if (mode !== 'orbit') return; mode = 'edit'; shiftT = -1; panel.hidden = false; enterEl.hidden = false; body.classList.add('is-asking'); show(); });
    panel.addEventListener('click', event => {
      const act = event.target.dataset.do; if (!act) return;
      if (act === 'copy') { text.select(); navigator.clipboard?.writeText(text.value).then(() => { event.target.textContent = 'コピーしました'; setTimeout(() => { event.target.textContent = '数字をコピー'; }, 1500); }).catch(() => { document.execCommand('copy'); }); }
      if (act === 'reset') { editPlace.ask = [...original[editPlace.id]]; show(); }
      if (act === 'close') { editPlace = null; panel.hidden = true; enterEl.hidden = true; body.classList.remove('is-asking'); shiftT = 0; orbitPose(camPos, camLook); mode = 'orbit'; }
    });
  }
  function applyOffset() {
    const w = innerWidth, h = innerHeight;
    if (w < 760) camera.setViewOffset(w, h, 0, h * (.15 + .1 * Math.abs(shift)), w, h);
    else if (shift !== 0) camera.setViewOffset(w, h, -w * (shift > 0 ? .1 : .11) * shift, 0, w, h);   // profile: character on the right; question: place on the left
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  async function meet(id) {
    const m = id === 'pyon' ? (pyon ? Object.assign(pyonMember, {group: pyon}) : null) : cast.find(x => x.id === id); if (!m || mode !== 'orbit') return;
    mode = 'fly'; meeting = m; m.stopped = !m.spec.ride; body.classList.add('is-meeting');   // riders keep driving; the camera rides along
    hintEl.classList.remove('is-on'); bubbleEl.hidden = true;
    sound.fx.select(); playCast(m, 'Idle'); m.hop = 1;
    const p = m.group.position.clone(), eye = m.spec.height * .58;
    // stand where the view is clear: a set side for those on the roads, otherwise wherever the camera already is
    const away = (m.spec.view === 'out' ? p.clone().setY(0).applyAxisAngle(V(0, 1, 0), .9) : m.spec.view ? V(m.spec.view[0], 0, m.spec.view[1]) : camPos.clone().sub(p).setY(0)).normalize();
    const reach = m.spec.ride ? 4.4 : m.spec.height * 1.75, lift = m.spec.ride ? 1.0 : 0;   // riders in the car are seen from a little further back and above
    shiftT = 1;
    if (motionOff()) { camPos.copy(p).addScaledVector(away, reach).add(V(0, eye + lift, 0)); camLook.copy(p).add(V(0, eye, 0)); }
    else if (m.spec.ride) {            // a rider keeps moving, so the camera aims at where they are each moment and arrives right in step with them
      const fromPos = camPos.clone(), fromLook = camLook.clone(), goal = V(0, 0, 0), look = V(0, 0, 0);
      await run(1.5, k => {
        const q = m.group.position, yaw = m.group.rotation.y + .55;
        goal.set(q.x + Math.sin(yaw) * 4.4, q.y + eye + 1.0, q.z + Math.cos(yaw) * 4.4); look.set(q.x, q.y + eye, q.z);
        camPos.lerpVectors(fromPos, goal, k); camPos.y += Math.sin(k * Math.PI) * 1.2; camLook.lerpVectors(fromLook, look, Math.min(1, k * 1.6));   // eyes on them early
      }, easeInOut);
      p.copy(m.group.position);
    }
    else await fly(p.clone().addScaledVector(away, reach).add(V(0, eye + lift, 0)), p.clone().add(V(0, eye, 0)), 1.5, 1.2);
    playCast(m, 'React', true); sound.fx.pop(); sound.fx.arrive();
    if (m === pyonMember) playPyon(pyonActions.Cheer ? 'Cheer' : 'Jump', true);
    if (m.face) { m.face.set(3, .7); setTimeout(() => m.face && m.face.set(0, 4), 700); }
    burst(p.clone().add(V(0, m.spec.height * .9, 0)), PASTEL, 46, 5, .7);
    const photo = $('#profile-photo'); photo.hidden = !PHOTOS[m.id]; if (PHOTOS[m.id]) { photo.src = 'assets/city/faces/' + m.id + '.jpg'; photo.alt = tr(m.spec.name); }
    $('#profile-kicker').textContent = m.spec.kicker; $('#profile-role').textContent = tr(m.spec.role);
    $('#profile-name').textContent = tr(m.spec.name); $('#profile-text').textContent = tr(m.spec.text);
    profileEl.hidden = false; mode = 'meet'; profileRide = !!m.spec.ride;
    $('#profile-link').focus({preventScroll: true});
  }
  async function leave() {
    if (mode !== 'meet' || !meeting) return;
    const m = meeting; profileEl.hidden = true; mode = 'fly'; shiftT = 0; profileRide = false;
    orbitPose(tmp, tmp2);
    if (!motionOff()) await fly(tmp.clone(), tmp2.clone(), 1.3, 1);
    m.stopped = false; playCast(m, m.spec.ride || m.spec.glide ? 'Idle' : 'Walk'); meeting = null; body.classList.remove('is-meeting'); mode = 'orbit';
  }
  $('#profile-close').addEventListener('click', leave);
  addEventListener('keydown', event => { if (event.key === 'Escape') leave(); });
  $('#profile-link').addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault(); const href = event.currentTarget.href;
    sound.fx.select(); wipeEl.classList.add('is-on'); setTimeout(() => { location.href = href; }, 720);
  });
  canvas.addEventListener('click', event => {
    if (mode !== 'meet' || !meeting) return;
    // Someone else in view? Clicking them goes straight over to them.
    const other = castAt(event.clientX, event.clientY, meeting), hit = other ? {object: {userData: {id: other.id}}} : null;
    if (hit) {
      const old = meeting; old.stopped = false; playCast(old, old.spec.ride || old.spec.glide ? 'Idle' : old.spec.dance ? 'React' : 'Walk');
      profileEl.hidden = true; profileRide = false; meeting = null; mode = 'orbit'; meet(hit.object.userData.id); return;
    }
    { playCast(meeting, 'React', true); if (meeting === pyonMember) playPyon(pyonActions.Jump ? 'Jump' : 'Cheer', true); sound.fx.pop(); burst(meeting.group.position.clone().add(V(0, meeting.spec.height * .9, 0)), PASTEL, 30, 5, .7); }
  });

  /* ── plants: 3D models close to the plaza, flat pictures further away (lighter to draw) ── */
  function loadPlants() {
    const spots = Object.entries(N).filter(([name]) => /^P[bt]\d+$/.test(name)).map(([name, node]) => ({tree: name[1] === 't', p: node.getWorldPosition(V(0, 0, 0)), s: node.scale.x || 1}));
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + .2; if (Math.abs(Math.cos(a) * 75) < 10 && Math.sin(a) > 0) continue; spots.push({tree: true, far: true, p: V(Math.cos(a) * 75, .05, Math.sin(a) * 75), s: 1.3}); }   // a ring of picture trees on the outer bridge
    const near = spots.filter(o => !o.far && Math.hypot(o.p.x, o.p.z) < 34), far = spots.filter(o => !near.includes(o));
    const KINDS = {bush: [['bush-pink', 1.5], ['bush-yellow', 1.5]], tree: [['tree-tall', 6], ['tree-fruit', 5]]};
    const dummy = new THREE.Object3D();
    for (const group of ['bush', 'tree']) {
      const mine = near.filter(o => o.tree === (group === 'tree'));
      KINDS[group].forEach(([file, height], k) => {
        const list = mine.filter((_, i) => i % KINDS[group].length === k); if (!list.length) return;
        new GLTFLoader().load(`assets/city/plants/${file}.glb?v=20261118-1`, gltf => {
          let mesh = null; gltf.scene.traverse(o => { if (o.isMesh && !mesh) mesh = o; }); if (!mesh) return;
          mesh.material.envMapIntensity = .4; mesh.material.roughness = .6; mesh.material.metalness = 0;
          const inst = new THREE.InstancedMesh(mesh.geometry, mesh.material, list.length);
          list.forEach((o, i) => { dummy.position.copy(o.p); dummy.rotation.set(0, i * 2.4, 0); dummy.scale.setScalar(height * o.s * (.85 + (i % 3) * .1)); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix); });
          inst.frustumCulled = false; scene.add(inst);
        }, undefined, () => { /* optional */ });
      });
    }
    const PICS = {bush: ['bush-pink', 'bush-purple', 'bush-yellow', 'bush-mix'], tree: ['tree-round', 'tree-tall', 'tree-fruit']};
    far.forEach((o, i) => {
      const names = PICS[o.tree ? 'tree' : 'bush'], file = names[i % names.length];
      textures.load(`assets/city/plants/${file}.webp`, map => {
        map.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map, transparent: true, alphaTest: .35, fog: true}));
        const h = (o.tree ? 5.4 : 1.6) * o.s; sprite.center.set(.5, 0); sprite.scale.set(h * map.image.width / map.image.height, h, 1); sprite.position.copy(o.p); scene.add(sprite);
      });
    });
  }

  /* ── neon signs: glowing outlines in moon letters, hung all over the city (black parts of the pictures add no light) ── */
  const signs = [];
  function loadSigns() {
    const maps = [1, 2, 3, 4, 5, 6, 7, 8].map(n => textures.load(`assets/city/signs/wide-${n}.jpg`, t => { t.colorSpace = THREE.SRGBColorSpace; }));
    const ratio = [2.99, 2.9, 3.06, 3.18, 2.44, 2.4, 2.88, 2.5];
    const hang = (parent, k, width, x, y, z, upright) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width / ratio[k]), new THREE.MeshBasicMaterial({map: maps[k], transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false}));
      m.position.set(x, y, z); if (upright) m.rotation.z = Math.PI / 2;    // a wide sign turned on end makes a tall one
      m.userData.phase = signs.length * 1.7; parent.add(m); signs.push(m); return m;
    };
    // one above or beside every monitor in the city
    Object.entries(N).filter(([name, node]) => /^Scr\d+$/.test(name) && node.userData.w).forEach(([, node], i) => {
      const w = node.userData.w, h = node.userData.h, k = i % 8;
      if (i % 3 === 0) hang(node, k, Math.max(3.2, h * 1.5), -w / 2 - .9, 0, .05, true);          // tall sign down the left edge
      else hang(node, k, Math.max(3, w * .95), 0, h / 2 + .75, .05, false);                      // wide sign over the top
    });
    // a ring of signs round the plaza, and tall ones along the main road
    for (let i = 0; i < 8; i++) { if (i === 2 || i === 7) continue; const a = i / 8 * Math.PI * 2 + .39, g = new THREE.Group(); g.position.set(Math.cos(a) * 25.2, 6.2 + (i % 2) * 1.6, Math.sin(a) * 25.2); g.rotation.y = -a - Math.PI / 2; scene.add(g); hang(g, (i + 3) % 8, 5.2, 0, 0, 0, i % 2 === 1); }
    for (let i = 1; i < 6; i++) { const g = new THREE.Group(), side = i % 2 ? 1 : -1; g.position.set(side * 8.4, 5.5, 26 + i * 6.5); g.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(g); hang(g, (i + 5) % 8, 4.6, 0, 0, 0, true); }
  }

  /* ── traffic: hover cars on the roads and bridges, the lower town, and drones in the air ── */
  // Each route returns a position for a distance travelled; cars face along it and bob as they hover.
  const TAU = Math.PI * 2;
  function tour(points) {                      // a smooth closed path through the given points, travelled at an even speed
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])), true, 'catmullrom', .5), length = curve.getLength();
    return {length, at: (d, out) => { curve.getPointAt((((d / length) % 1) + 1) % 1, out); }};
  }
  function circle(r, y, cx = 0, cz = 0) { return {length: Math.PI * 2 * r, at: (d, out) => { const a = d / r; out.set(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r); }}; }
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
    air1: circle(20, 27), air2: circle(38, 22), air3: circle(58, 12), lift: helix(29, -62, 9, 3), sky: circle(165, 16),
    // Delivery rounds: each courier has its own winding path laid out in advance, at its own heights.
    airTourA: tour([[0, 11, -16], [14, 13, -6], [10, 10, 14], [5, 12, 34], [6, 15, 56], [-6, 17, 56], [-5, 13, 32], [-12, 11, 12], [-14, 14, -6]]),   // plaza, down the main road and back
    airTourB: tour([[-17, 19, 0], [-7, 23, 13], [5, 19, 6], [17, 22, -3], [9, 24, -15], [-3, 20, -7], [-12, 23, -16]]),                             // criss-crossing above the plaza
    airTourC: tour([[18, 17, 10], [12, 20, 30], [-2, 22, 44], [-11, 19, 30], [-18, 16, 14], [-6, 18, 20], [6, 21, 16]])                              // between the plaza and the road's shops
  };
  // yaw: how far each model's own front is turned from +Z.
  const CARS = {
    roadster: {height: 1.7, yaw: Math.PI / 2}, bubble: {height: 2.3, yaw: 0}, bus: {height: 3.1, yaw: Math.PI / 2}, van: {height: 2.7, yaw: Math.PI / 2},
    scooter: {height: 1.8, yaw: 0}, patrol: {height: 1.9, yaw: 0}, delivery: {height: 2.6, yaw: 0}, cart: {height: 2.9, yaw: Math.PI / 2},
    airship: {height: 78, yaw: Math.PI / 2}        // the giant SNS airship
  };
  const FLEET = [   // model, route, speed (m/s; negative = the other way), starting distance
    ['roadster', 'plaza', 3.2, 0], ['scooter', 'plaza', 3.2, 21],
    ['bubble', 'road', 5, 0], ['van', 'road', 5, 38], ['roadster', 'road', 5, 70],
    ['bus', 'ringA', 6, 0], ['bubble', 'ringA', 6, 120], ['van', 'ringA', -5, 60], ['bus', 'ringB', -6, 0], ['scooter', 'ringB', 7, 200],
    ['cart', 'low1', 3.5, 0], ['van', 'low1', 3.5, 90], ['roadster', 'low2', -6, 0], ['cart', 'low2', -3, 130], ['scooter', 'low3', 4, 0], ['bubble', 'low2', -6, 240],
    ['patrol', 'air1', 4, 0], ['patrol', 'air2', 5, 80], ['patrol', 'air3', 6, 200], ['delivery', 'lift', 7, 0], ['delivery', 'airTourA', 5, 0], ['delivery', 'airTourB', 4.4, 30], ['delivery', 'airTourC', 4.8, 60],
    ['airship', 'sky', -3.5, 106]
  ];
  const traffic = []; let lineup = false;
  function loadTraffic() {
    for (const [id, spec] of Object.entries(CARS)) {
      new GLTFLoader().load(`assets/city/cars/${id}.glb?v=20261118-2`, gltf => {
        gltf.scene.traverse(node => { if (node.isMesh) (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => { m.envMapIntensity = .5; m.roughness = .45; m.metalness = 0; if (id !== 'airship') nightLights(m); else shipLights(m); if (id === 'roadster') glassy(m); if (id === 'airship') node.renderOrder = -.5; }); });
        FLEET.filter(f => f[0] === id).forEach(([, route, speed, start], i) => {
          const body = gltf.scene.clone(); body.scale.setScalar(spec.height); body.rotation.y = spec.yaw;
          const car = new THREE.Group(); car.add(body); scene.add(car);
          if (id === 'airship') {       // the video sits flat inside the monitor's rim (measured on the model), with a raised frame round it
            const rim = new THREE.MeshStandardMaterial({color: 0x63d8cf, roughness: .5, metalness: 0});
            for (const side of [1, -1]) {
              const set = new THREE.Group(); set.position.set(-.052, .562, .283 * side); if (side < 0) set.rotation.y = Math.PI;
              set.add(snsScreen(.404, .208));
              for (const [w, h, x, y] of [[.44, .018, 0, .113], [.44, .018, 0, -.113], [.018, .208, -.211, 0], [.018, .208, .211, 0]]) {
                const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, .03), rim); bar.position.set(x, y, 0); set.add(bar);
              }
              body.add(set);
            }
          }
          if (id === 'airship') { const p = new THREE.Mesh(new THREE.SphereGeometry(45, 10, 8)); p.userData = {kind: 'airship', id}; proxies.push(p); car.userData.proxy = p; }
          traffic.push({id, car, body, routeName: route, route: ROUTES[route], speed, d: id === 'airship' && airshipStart !== null ? airshipStart : start, phase: Math.random() * 6, air: /air|lift/.test(route)});
        });
      }, undefined, () => { /* traffic is optional */ });
    }
  }
  const carPos = V(0, 0, 0), carNext = V(0, 0, 0);
  function updateTraffic(dt, still) {
    if (lineup) { Object.keys(CARS).forEach((id, i) => { const t = traffic.find(x => x.id === id); if (t) { t.car.position.set(-10.5 + i * 3, .4, 5); t.car.rotation.set(0, 0, 0); } }); return; }
    for (const t of traffic) {
      if (t.air && t.id !== 'airship') {       // fliers give way to one another (and to the UFO): the later one slows right down and slips over or under
        let slow = 1, dodge = 0;
        const mind = (p, reach, tall, own) => { const dx = t.car.position.x - p.x, dz = t.car.position.z - p.z, dy = t.car.position.y - p.y;
          if (dx * dx + dz * dz < reach * reach && Math.abs(dy) < tall) { slow = Math.min(slow, own); dodge = dy >= 0 ? 3.6 : -3.6; } };
        for (const o of traffic) { if (o === t) break; if (o.air && o.id !== 'airship') mind(o.car.position, 10, 5.5, .15); }
        if (N.UFO) mind(N.UFO.position, 11, 7, .3);
        t.ease = lerp(t.ease ?? 1, slow, 1 - Math.pow(.05, dt)); t.dodge = lerp(t.dodge ?? 0, dodge, 1 - Math.pow(.25, dt));
      }
      if (!still && !t.halt) t.d += t.speed * dt * (t.ease ?? 1);
      t.route.at(t.d, carPos); carPos.y += t.dodge ?? 0; t.route.at(t.d + Math.sign(t.speed) * .6, carNext);
      t.car.position.copy(carPos); t.car.position.y += (t.air ? .5 : .12) * Math.sin(time * (t.air ? 1.6 : 2.4) + t.phase) + (t.air ? 0 : .25);
      t.car.rotation.y = Math.atan2(carNext.x - carPos.x, carNext.z - carPos.z);
      t.body.rotation.z = Math.sin(time * 1.7 + t.phase) * (t.id === 'airship' ? .012 : .04);
      if (t.car.userData.proxy) { t.car.userData.proxy.position.copy(t.car.position); t.car.userData.proxy.position.y += 39; t.car.userData.proxy.updateMatrixWorld(); }
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
    if (event.type === 'pointerup' && travelled < 16 && performance.now() - downAt < 900) pick(event.clientX, event.clientY);
  }
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('wheel', event => { if (mode !== 'orbit') return; event.preventDefault(); view.radT = clamp(view.radT + event.deltaY * .012, 10.5, 17); view.idle = 0; }, {passive: false});
  function pick(x, y) {
    if (mode !== 'orbit') return;
    const someone = castAt(x, y); if (someone) { hovered = null; meet(someone.id); return; }   // characters come first
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(proxies, false)[0];
    if (!hit) return;
    const {kind, id} = hit.object.userData;
    if (kind === 'place') go(id); else if (kind === 'cast') meet(id); else if (kind === 'airship') openSns(); else if (kind === 'pyon') { if (pyon) meet('pyon'); } else if (kind === 'statue') { statueBounce = 1; sound.fx.pop(); burst(N.Statue.position.clone().add(V(0, 4, 0)), [0xff9bd0, 0xffffff], 40, 6, .8); }
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
    loadPyonpy(); loadLandmarks(); loadTraffic(); loadScreens(); loadCast(); loadPlants(); loadSigns();
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
    ufoAngle = 3.927; ufoRise = 0; const ship0 = traffic.find(t => t.id === 'airship'); if (ship0) ship0.d = -176.7; else airshipStart = -176.7;
    hintEl.classList.add('is-on');
    setTimeout(() => { if (mode === 'orbit') hintEl.textContent = tr('ぴょんぴーをタップしてみてね。'); }, 7000);
    setTimeout(() => hintEl.classList.remove('is-on'), 14000);
  }
  gateEl.addEventListener('submit', event => { event.preventDefault(); enter(!event.submitter || event.submitter.value !== 'off'); });

  function ready() {
    loaded = true; mode = 'gate';
    let returning = false;
    // Only someone coming back from one of this site's own pages skips the question; opening or reloading the home always asks.
    try {
      const nav = performance.getEntriesByType('navigation')[0], from = document.referrer ? new URL(document.referrer) : null;
      const inside = from && from.origin === location.origin && !/^\/(index\.html)?$/.test(from.pathname);
      returning = sessionStorage.getItem('moonians.city') === '1' && (!nav || nav.type !== 'reload') && (inside || (nav && nav.type === 'back_forward'));
    } catch { /* optional */ }
    if (returning) { enter(false).then(() => { /* sound comes back on the first tap if it was on */ }); return; }
    progressEl.hidden = true; gateEl.hidden = false;
    const first = gateEl.querySelector('button'); if (first) first.focus({preventScroll: true});
  }

  // Coming back with the browser's Back button: put the city back as it was.
  addEventListener('pageshow', event => {
    if (!event.persisted || !loaded) return;
    wipeEl.classList.remove('is-on'); body.classList.remove('is-travelling'); links.forEach(a => a.classList.remove('is-going')); snsLink.classList.remove('is-going'); traffic.forEach(t => { t.halt = false; });
    Object.assign(boost, {gear: 1, ring: 1, eq: 1, ear: 0, note: 1, ufo: 1, shutter: .86, screen: .72, beam: 0, bubbles: 0, crescent: 1});
    setShutters(boost.shutter); jobs.clear(); orbitPose(camPos, camLook); mode = 'orbit'; asking = null; enterEl.hidden = true; body.classList.remove('is-asking');
    profileEl.hidden = true; shiftT = 0; body.classList.remove('is-meeting'); if (meeting) { meeting.stopped = false; meeting = null; }
  });

  new GLTFLoader().load('assets/city/pastel-moon-city.glb?v=20261118-6', gltf => {
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
    applyOffset();
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
      get mode() { return mode; }, get debug() { return {signs, N, camera, landmarkModels, traffic, jump(i, t) { moveIndex = i - 1; dance(); moveT = t; }}; },
      lineup(on) { lineup = on; }, enter() { return enterPlace(); }, back() { return backToCity(); }, meet(id) { return meet(id); }, leave() { return leave(); },
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
      if (hotSns) {                    // keep following the airship while the SNS item is pointed at
        const ship = traffic.find(t => t.id === 'airship');
        if (ship) { let target = Math.atan2(ship.car.position.x, ship.car.position.z) + Math.PI;
          while (target - view.azT > Math.PI) target -= Math.PI * 2; while (target - view.azT < -Math.PI) target += Math.PI * 2;
          view.azT = target; view.tiltT = .36; view.idle = 0; }
      }
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
      if (mode !== 'fly' && !still) { ufoAngle += dt * .16; ufoRise = Math.min(1, ufoRise + dt / 14); }
      const towerSide = Math.atan2(Math.sin(ufoAngle + Math.PI / 2), Math.cos(ufoAngle + Math.PI / 2));   // 0 when it is level with the Moon Tower
      const ufoR = 60 + Math.sin(ufoAngle * 2.3) * 3 - 0 * towerSide;    // out beyond the landmarks, just above their roofs
      u.position.set(Math.cos(ufoAngle) * ufoR, lerp(18, 31, easeInOut(ufoRise)) + Math.sin(time * .7) * 1.6 * ufoRise + Math.sin(time * 2.6) * .6, Math.sin(ufoAngle) * ufoR);
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
      if (!still) updateDance(dt);
    }
    for (const m of holos) {
      if (m.userData.ring) { const g = m.userData.ring, a = g.a + time * .12; m.position.set(Math.cos(a) * g.r, g.y + Math.sin(time * 1.3 + g.a * 5) * .6, Math.sin(a) * g.r); m.rotation.y = -a + Math.PI / 2 + time * .8; }
      else m.rotation.y = time * m.userData.spin;
      m.material.opacity = (.75 + .25 * Math.sin(time * 5 + m.position.x)) * (.7 + .3 * night);
    }
    for (const c of paintedClouds) { const a = c.userData.a + time * .006; c.position.set(Math.cos(a) * c.userData.r, c.userData.y, Math.sin(a) * c.userData.r); c.material.opacity = .95 - night * .7; }
    updateTraffic(dt, still); updateCast(dt, still); updateSns(dt); updateBigFace(dt);
    if (mode === 'edit' && editPlace) { const v = vantage(editPlace); camPos.copy(v.pos); camLook.copy(v.look); }
    if (mode === 'ask' && asking && asking.id === 'game') { const v = vantage(asking.place), k = 1 - Math.pow(.02, dt); camPos.lerp(v.pos, k); camLook.lerp(v.look, k); }   // the UFO keeps flying, so the camera keeps up with it
    for (const m of signs) m.material.opacity = (.45 + .5 * night) * (.86 + .14 * Math.sin(time * 3.1 + m.userData.phase)) * (Math.sin(time * .7 + m.userData.phase * 2.3) > .985 ? .35 : 1);   // steady glow with a rare flicker
    if (N.stageArt && !still) N.stageArt.rotation.z += dt * .25;
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
