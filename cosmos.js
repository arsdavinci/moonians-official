/* Home background: a 3D Earth with the Moon orbiting it. Scrolling turns the moon
   around the Earth and flies the camera from Earth orbit to the Moon, where the
   lights of the moon palace wait at the bottom of the page. Fast scrolling stretches
   the stars into warp streaks. Pure decoration: textures are drawn in code. */
import * as THREE from 'three';

const body = document.body;
const small = innerWidth < 760;
const motionOn = () => !body.classList.contains('motion-paused') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNight = () => body.classList.contains('site-night');

const canvas = document.createElement('canvas');
canvas.id = 'cosmos-canvas';
canvas.setAttribute('aria-hidden', 'true');
const stars = document.getElementById('space-canvas');
if (stars) stars.after(canvas); else body.prepend(canvas);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:!small, powerPreference:'low-power'});
} catch { canvas.remove(); throw new Error('cosmos: no WebGL'); }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.25 : 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, .1, 400);

/* ── procedural textures ── */
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 5) { let s = 0, a = .5; for (let i = 0; i < oct; i++) { s += a * noise(x, y); x *= 2.03; y *= 2.03; a *= .5; } return s; }
// Seamless in longitude: sample noise on a cylinder.
function sphereNoise(u, v, scale, oct) {
  const ang = u * Math.PI * 2;
  return (fbm(Math.cos(ang) * scale + 50, v * scale * 1.6 + Math.sin(ang) * scale, oct));
}

function earthTextures() {
  const W = small ? 512 : 1024, H = W / 2;
  const day = document.createElement('canvas'); day.width = W; day.height = H;
  const lights = document.createElement('canvas'); lights.width = W; lights.height = H;
  const dctx = day.getContext('2d'), lctx = lights.getContext('2d');
  const dimg = dctx.createImageData(W, H), limg = lctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / H, lat = Math.abs(v - .5) * 2;
    for (let x = 0; x < W; x++) {
      const u = x / W, i = (y * W + x) * 4;
      const h = sphereNoise(u, v, 2.2, 5) - lat * .12;
      const cloud = sphereNoise(u + .3, v, 4.5, 4);
      let r, g, b, city = 0;
      if (lat > .86) { r = 235; g = 244; b = 255; }
      else if (h > .52) {
        const k = Math.min(1, (h - .52) * 5);
        const dry = sphereNoise(u, v, 6, 3);
        r = 40 + k * 120 * dry + 30; g = 120 + k * 40 - dry * 30; b = 70 + k * 30;
        if (dry > .55) { r = 200 + k * 30; g = 170 + k * 20; b = 110; }
        city = Math.max(0, sphereNoise(u, v, 18, 3) - .55) * 4 * (1 - lat);
      } else {
        const d = Math.min(1, (.52 - h) * 4);
        r = 20 + (1 - d) * 40; g = 70 + (1 - d) * 90; b = 150 + (1 - d) * 60;
      }
      const c = Math.max(0, cloud - .5) * 2.2;
      dimg.data[i] = r + (255 - r) * c; dimg.data[i + 1] = g + (255 - g) * c; dimg.data[i + 2] = b + (255 - b) * c; dimg.data[i + 3] = 255;
      const lc = Math.min(1, city * (hash(x, y) > .55 ? 1.6 : .4)) * (1 - c);
      limg.data[i] = 255 * lc; limg.data[i + 1] = 200 * lc; limg.data[i + 2] = 120 * lc; limg.data[i + 3] = 255;
    }
  }
  dctx.putImageData(dimg, 0, 0); lctx.putImageData(limg, 0, 0);
  const a = new THREE.CanvasTexture(day), b = new THREE.CanvasTexture(lights);
  a.colorSpace = b.colorSpace = THREE.SRGBColorSpace;
  return [a, b];
}

function moonTexture() {
  const W = small ? 512 : 1024, H = W / 2;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), img = c.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W, v = y / H, i = (y * W + x) * 4;
    const mare = sphereNoise(u, v, 1.8, 4) > .55 ? .62 : 1;
    const n = 150 + sphereNoise(u, v, 9, 4) * 90;
    const k = n * mare;
    img.data[i] = k * 1.02; img.data[i + 1] = k; img.data[i + 2] = k * .97; img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  // craters
  for (let n = 0; n < (small ? 120 : 260); n++) {
    const x = hash(n, 1) * W, y = H * (.08 + hash(n, 2) * .84), r = 2 + Math.pow(hash(n, 3), 3) * W * .035;
    const g = c.createRadialGradient(x - r * .25, y - r * .25, r * .1, x, y, r);
    g.addColorStop(0, 'rgba(60,58,66,.38)'); g.addColorStop(.75, 'rgba(70,68,76,.22)'); g.addColorStop(.92, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── objects ── */
const sunDir = new THREE.Vector3(-1, .35, .55).normalize();
const sun = new THREE.DirectionalLight(0xfff4e8, 2.6); sun.position.copy(sunDir).multiplyScalar(50); scene.add(sun);
scene.add(new THREE.AmbientLight(0xd8c8ff, .55));
// Soft front light that rises near the end so the pastel moon reads bright, not in shadow.
const fill = new THREE.PointLight(0xffe6f4, 0, 0, 0); camera.add(fill);

const seg = small ? 48 : 96;
const [earthMap, earthLights] = earthTextures();
const earth = new THREE.Group(); scene.add(earth);
const earthMat = new THREE.MeshStandardMaterial({map:earthMap, roughness:.85, metalness:0, emissive:0xffffff, emissiveMap:earthLights, emissiveIntensity:1});
// City lights only on the night side.
earthMat.onBeforeCompile = shader => {
  shader.uniforms.sunDirView = {value:new THREE.Vector3()};
  earthMat.userData.shader = shader;
  shader.fragmentShader = 'uniform vec3 sunDirView;\n' + shader.fragmentShader.replace('#include <emissivemap_fragment>',
    '#include <emissivemap_fragment>\n totalEmissiveRadiance *= smoothstep(0.15, -0.25, dot(normalize(vNormal), sunDirView));');
};
new THREE.TextureLoader().load('assets/cosmos/earth-pastel.webp?v=1', tex => {
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  earthMat.map = tex; earthMat.emissiveIntensity = 0; earthMat.needsUpdate = true; wake();
});
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(4, seg, seg / 2), earthMat);
earthMesh.rotation.z = .41;
earth.add(earthMesh);
const glowMat = new THREE.ShaderMaterial({
  transparent:true, side:THREE.BackSide, depthWrite:false, blending:THREE.AdditiveBlending,
  uniforms:{color:{value:new THREE.Color(0xffc6ec)}},
  vertexShader:'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader:'uniform vec3 color; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(-dot(vN, vV) * 2.1, 0.0, 1.0), 2.5); gl_FragColor = vec4(color * f * 0.9, 1.0); }'
});
earth.add(new THREE.Mesh(new THREE.SphereGeometry(4.55, seg, seg / 2), glowMat));

const moonOrbit = new THREE.Group(); moonOrbit.rotation.x = .22; moonOrbit.rotation.z = -.12; scene.add(moonOrbit);
const ORBIT = 15;
const moonMat = new THREE.MeshStandardMaterial({map:moonTexture(), roughness:1, metalness:0});
// Pastel moon art (equirectangular); the procedural map stays as the fallback.
new THREE.TextureLoader().load('assets/cosmos/moon-pastel.webp?v=1', tex => {
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  moonMat.map = tex; moonMat.color.set(0xffffff); moonMat.needsUpdate = true; wake();
});
const moon = new THREE.Mesh(new THREE.SphereGeometry(1.25, seg, seg / 2), moonMat);
moonOrbit.add(moon);
// Faint orbit ring
const ringPts = []; for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; ringPts.push(new THREE.Vector3(Math.cos(a) * ORBIT, 0, Math.sin(a) * ORBIT)); }
const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineDashedMaterial({color:0xb9a8ff, transparent:true, opacity:.28, dashSize:.5, gapSize:.45}));
ring.computeLineDistances(); moonOrbit.add(ring);

// The moon palace: a warm glow on the moon's surface, revealed at the end of the journey.
function glowSprite(color) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const c = cv.getContext('2d'), g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  return new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending});
}
const palace = new THREE.Sprite(glowSprite('rgba(255,170,215,.8)'));
palace.scale.setScalar(.9); moon.add(palace);

// Warp streaks
const STREAKS = small ? 140 : 320;
const streakPos = new Float32Array(STREAKS * 6), streakSeed = [];
for (let i = 0; i < STREAKS; i++) streakSeed.push({x:(Math.random() - .5) * 120, y:(Math.random() - .5) * 80, z:-Math.random() * 160});
const streakGeo = new THREE.BufferGeometry(); streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
const streakMat = new THREE.LineBasicMaterial({color:0xd8ccff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false});
const streaks = new THREE.LineSegments(streakGeo, streakMat); streaks.frustumCulled = false;
camera.add(streaks); scene.add(camera);

/* ── scroll journey ── */
let progress = 0, smooth = 0, velocity = 0, lastScroll = scrollY, drift = 0, last = performance.now(), frame = 0;
const pointer = {x:0, y:0, sx:0, sy:0};
const ease = t => t * t * (3 - 2 * t);
const camFar = new THREE.Vector3(), camNear = new THREE.Vector3(), look = new THREE.Vector3(), tmp = new THREE.Vector3(), moonWorld = new THREE.Vector3();

function readScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  progress = Math.min(1, Math.max(0, scrollY / max));
}
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // On narrow screens the scene sits further back so the Earth does not crowd the text.
  camera.setViewOffset(w, h, w > 900 ? -w * .2 : 0, 0, w, h);
  camera.updateProjectionMatrix();
}

function render(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const moving = motionOn();
  smooth += (progress - smooth) * (moving ? Math.min(1, dt * 4) : 1);
  const sy = scrollY; velocity += ((sy - lastScroll) / Math.max(dt, .001) - velocity) * .2; lastScroll = sy;
  if (moving) drift += dt;
  pointer.sx += (pointer.x - pointer.sx) * .05; pointer.sy += (pointer.y - pointer.sy) * .05;

  const p = smooth;
  earthMesh.rotation.y = drift * .04 + p * 2.4;
  // Moon travels 1.25 laps around the Earth as you scroll; ends on the near side.
  const ang = Math.PI * .85 + p * Math.PI * 2.5 + drift * .01;
  moon.position.set(Math.cos(ang) * ORBIT, 0, Math.sin(ang) * ORBIT);
  moon.getWorldPosition(moonWorld);

  // Camera: wide orbit view → swoops toward the moon.
  const zoom = small ? 1.35 : 1;
  camFar.set(Math.sin(p * 1.6 - .4) * 34 * zoom, 11 - p * 6, Math.cos(p * 1.6 - .4) * 34 * zoom);
  const toward = ease(Math.min(1, Math.max(0, (p - .55) / .45)));
  camNear.copy(moonWorld).add(tmp.set(moonWorld.x, 0, moonWorld.z).normalize().multiplyScalar(5.5 * zoom)).add(new THREE.Vector3(0, 1.4, 0));
  camera.position.lerpVectors(camFar, camNear, toward);
  camera.position.x += pointer.sx * 1.5; camera.position.y += pointer.sy * 1;
  look.set(0, 0, 0).lerp(moonWorld, toward);
  camera.lookAt(look);
  // Turn the palace (texture centre = local +x) toward the camera as we arrive.
  tmp.copy(camera.position).sub(moonWorld);
  const face = Math.atan2(-tmp.z, tmp.x);
  moon.rotation.y = drift * .02 * (1 - toward) + face * toward;
  fill.intensity = toward * 2.2;

  // Palace glow faces the camera side of the moon.
  palace.position.copy(tmp.copy(camera.position).sub(moonWorld).normalize().multiplyScalar(1.27).applyQuaternion(moon.quaternion.clone().invert()));
  palace.material.opacity = ease(Math.min(1, Math.max(0, (p - .8) / .2))) * (.75 + Math.sin(now / 400) * .25);

  if (earthMat.userData.shader) earthMat.userData.shader.uniforms.sunDirView.value.copy(sunDir).transformDirection(camera.matrixWorldInverse);

  // Warp streaks stretch with scroll speed.
  const speed = moving ? Math.min(1, Math.abs(velocity) / 2600) : 0;
  streakMat.opacity += ((speed > .08 ? speed : 0) * (isNight() ? .9 : .5) - streakMat.opacity) * .15;
  if (streakMat.opacity > .01) {
    const len = 2 + speed * 26, dir = Math.sign(velocity) || 1;
    for (let i = 0; i < STREAKS; i++) {
      const s = streakSeed[i];
      s.z += dt * speed * 220 * dir;
      if (s.z > 0) s.z -= 160; if (s.z < -160) s.z += 160;
      const k = i * 6;
      streakPos[k] = s.x; streakPos[k + 1] = s.y; streakPos[k + 2] = s.z - 10;
      streakPos[k + 3] = s.x; streakPos[k + 4] = s.y; streakPos[k + 5] = s.z - 10 - len;
    }
    streakGeo.attributes.position.needsUpdate = true;
  }
  streaks.visible = streakMat.opacity > .01;

  canvas.style.opacity = isNight() ? '.92' : '.5';
  renderer.render(scene, camera);
  frame = moving && !document.hidden ? requestAnimationFrame(render) : 0;
}
function wake() { if (!frame) { last = performance.now(); frame = requestAnimationFrame(render); } }

resize(); readScroll(); smooth = progress;
addEventListener('resize', () => { resize(); wake(); }, {passive:true});
addEventListener('scroll', () => { readScroll(); wake(); }, {passive:true});
addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; pointer.x = e.clientX / innerWidth - .5; pointer.y = .5 - e.clientY / innerHeight; wake(); }, {passive:true});
document.addEventListener('visibilitychange', wake);
new MutationObserver(wake).observe(body, {attributes:true, attributeFilter:['class']});
wake();
