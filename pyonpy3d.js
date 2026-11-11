// Interactive 3D Pyonpy. Loaded on demand by cyber.js when the stage scrolls near,
// so three.js and the model never touch the first page load.
import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';

export function mountPyonpy(stage, {motionOn}) {
  const mount = stage.querySelector('.pyonpy-view');
  const status = stage.querySelector('.pyonpy-status');
  const buttons = [...stage.querySelectorAll('[data-motion]')];

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  mount.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 50);
  camera.position.set(0, 1.05, 4.7);

  // Soft key light plus pink and mint rims, to sit inside the neon page.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a3f8f, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2.5, 4, 4);
  scene.add(key);
  const rimPink = new THREE.DirectionalLight(0xff9be0, 1.3);
  rimPink.position.set(-4, 2.5, -3);
  scene.add(rimPink);
  const rimMint = new THREE.DirectionalLight(0x8dffd9, 1.2);
  rimMint.position.set(4, 1.5, -3.5);
  scene.add(rimMint);

  // Hologram pad under his feet.
  const pad = new THREE.Group();
  const ringMaterial = color => new THREE.MeshBasicMaterial({color, transparent:true, opacity:.75, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false});
  const ringA = new THREE.Mesh(new THREE.RingGeometry(.92, .95, 96), ringMaterial(0x8dffd9));
  const ringB = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.13, 96, 1, 0, Math.PI * 1.5), ringMaterial(0xff9be0));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(.92, 64), new THREE.MeshBasicMaterial({color:0xb9a5ff, transparent:true, opacity:.12, depthWrite:false}));
  [ringA, ringB, disc].forEach(mesh => { mesh.rotation.x = -Math.PI / 2; pad.add(mesh); });
  pad.position.y = .005;
  scene.add(pad);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, .82, 0);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 2 - .12;
  controls.autoRotateSpeed = 1.4;
  // Horizontal drags turn him; vertical swipes still scroll the page on phones.
  renderer.domElement.style.touchAction = 'pan-y';
  let idleTimer = 0;
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleTimer); });
  controls.addEventListener('end', () => { idleTimer = setTimeout(() => { controls.autoRotate = motionOn(); }, 3500); });

  let mixer, actions = {}, active, returnTimer = 0;
  const clock = new THREE.Clock();
  function play(name, {once = false, hold = 0} = {}) {
    const next = actions[name];
    if (!next || !mixer) return;
    clearTimeout(returnTimer);
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    if (active && active !== next) next.crossFadeFrom(active, .3, false);
    next.play();
    active = next;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.motion === name)));
    if (hold) returnTimer = setTimeout(() => play('Idle'), hold);
  }

  new GLTFLoader().load('assets/models/pyonpy.glb', gltf => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.62 / size.y;
    model.scale.setScalar(scale);
    model.position.set(-(box.min.x + size.x / 2) * scale, -box.min.y * scale, -(box.min.z + size.z / 2) * scale);
    model.traverse(node => { if (node.isMesh) node.frustumCulled = false; });
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach(clip => {
      // Keep walk and run on the spot so he stays on the pad.
      clip.tracks = clip.tracks.filter(track => !/^(root|RootNode)\.position$/.test(track.name));
      actions[clip.name] = mixer.clipAction(clip);
    });
    mixer.addEventListener('finished', () => play('Idle'));
    play('Idle');
    controls.autoRotate = motionOn();
    stage.classList.add('is-ready');
    status.hidden = true;
    buttons.forEach(button => { button.disabled = false; });
  }, undefined, () => {
    stage.classList.add('has-error');
    status.textContent = stage.dataset.error || '';
  });

  buttons.forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.motion;
    if (name === 'Walk' || name === 'Run') play(name, {hold:3600});
    else play(name, {once:true});
  }));

  function resize() {
    const width = mount.clientWidth, height = mount.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Pull back on narrow stages so the ears never leave the frame.
    camera.position.setLength(camera.aspect < .8 ? 6.2 : 4.7);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(mount);
  resize();

  let visible = false, frame = 0;
  function tick() {
    frame = 0;
    const delta = Math.min(clock.getDelta(), .05);
    const moving = motionOn();
    if (mixer && moving) mixer.update(delta);
    if (!moving) controls.autoRotate = false;
    pad.rotation.y += moving ? delta * .5 : 0;
    controls.update();
    renderer.render(scene, camera);
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  const wake = () => { if (visible && !frame) { clock.getDelta(); frame = requestAnimationFrame(tick); } };
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; wake(); }).observe(stage);
  document.addEventListener('visibilitychange', wake);
}
