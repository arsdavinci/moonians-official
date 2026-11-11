// Exploded view of the Karakuri Pyonpy face unit. The CAD parts start scattered
// and fly together as the visitor scrolls through the section.
import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

export function mountExplode(scene3d) {
  const mount = scene3d.querySelector('.explode-view');
  const status = scene3d.querySelector('.explode-status');
  const steps = [...scene3d.querySelectorAll('.explode-step')];
  const percentLabel = scene3d.querySelector('.explode-percent');
  const partsLabel = scene3d.querySelector('.explode-parts');
  const bar = scene3d.querySelector('.explode-bar');
  const xray = scene3d.querySelector('.explode-xray');
  const motionOn = () => !document.body.classList.contains('motion-paused');
  const scrub = motionOn();
  scene3d.classList.add(scrub ? 'is-scrub' : 'is-static');

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a2f7a, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rimPink = new THREE.DirectionalLight(0xff9be0, 1.6);
  rimPink.position.set(-6, 2, -4);
  scene.add(rimPink);
  const rimMint = new THREE.DirectionalLight(0x8dffd9, 1.4);
  rimMint.position.set(6, -1, -5);
  scene.add(rimMint);

  const pivot = new THREE.Group();   // scroll and pointer turn this
  const model = new THREE.Group();   // CAD is Z-up; stand it upright here
  model.rotation.x = -Math.PI / 2;
  pivot.add(model);
  scene.add(pivot);

  const parts = [];
  const shells = [];
  const identity = new THREE.Quaternion();
  let seed = 7;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  new GLTFLoader().load('assets/models/karakuri-face.glb', gltf => {
    const meshes = [];
    gltf.scene.traverse(node => { if (node.isMesh) meshes.push(node); });
    const whole = new THREE.Box3();
    meshes.forEach(mesh => { mesh.geometry.computeBoundingBox(); whole.union(mesh.geometry.boundingBox); });
    const centre = whole.getCenter(new THREE.Vector3());
    const size = whole.getSize(new THREE.Vector3());
    const unit = 2.5 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(unit);
    const reach = Math.max(size.x, size.y, size.z);

    meshes.forEach(mesh => {
      // Re-centre each part on itself so it can tumble around its own middle.
      const home = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
      mesh.geometry.translate(-home.x, -home.y, -home.z);
      mesh.geometry.computeVertexNormals();
      // The big outer pieces are the shells that "Look inside" turns to glass.
      const isShell = mesh.geometry.boundingBox.getSize(new THREE.Vector3()).length() > reach * .42;
      mesh.material = new THREE.MeshStandardMaterial({color:mesh.material.color, roughness:.5, metalness:.05, transparent:isShell, opacity:1, side:THREE.DoubleSide});
      if (isShell) shells.push(mesh);
      const outward = home.clone().sub(centre);
      const distance = outward.length();
      if (distance < 1) outward.set(random() - .5, random() - .5, random() - .5);
      outward.normalize();
      const away = outward.multiplyScalar(reach * (.42 + random() * .38)).add(new THREE.Vector3((random() - .5) * reach * .3, (random() - .5) * reach * .3, (random() - .5) * reach * .3));
      const spin = new THREE.Quaternion().setFromEuler(new THREE.Euler(random() * 6.28, random() * 6.28, random() * 6.28));
      mesh.position.copy(home).sub(centre);
      model.add(mesh);
      parts.push({mesh, home:home.clone().sub(centre), away, spin, distance});
    });
    // Inner mechanism arrives first, the outer shells close last.
    parts.sort((a, b) => a.distance - b.distance);
    parts.forEach((part, index) => { part.order = index / Math.max(1, parts.length - 1); });
    partsLabel.textContent = `PARTS ${String(parts.length).padStart(2, '0')}`;
    scene3d.classList.add('is-ready');
    status.hidden = true;
    wake();
  }, undefined, () => {
    scene3d.classList.add('has-error');
    status.textContent = scene3d.dataset.error || '';
  });

  let see = false;
  xray.addEventListener('click', () => {
    see = !see;
    xray.setAttribute('aria-pressed', String(see));
    wake();
  });

  let pointerX = 0, pointerY = 0;
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointerX = event.clientX / innerWidth - .5;
    pointerY = event.clientY / innerHeight - .5;
  }, {passive:true});

  function resize() {
    const width = mount.clientWidth, height = mount.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const narrow = camera.aspect < .9;
    camera.position.set(narrow ? 0 : -1.15, narrow ? -.55 : 0, narrow ? 10.5 : 8.2);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(() => { resize(); wake(); }).observe(mount);
  resize();

  const ease = value => value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  let visible = false, frame = 0, current = scrub ? 0 : 1, shellOpacity = 1, activeStep = -1, spin = 0, last = performance.now();
  function tick(now) {
    frame = 0;
    const delta = Math.min(.05, (now - last) / 1000);
    last = now;
    let target = 1;
    if (scrub) {
      const box = scene3d.getBoundingClientRect();
      target = Math.max(0, Math.min(1, -box.top / Math.max(1, box.height - innerHeight)));
    }
    current += (target - current) * .12;
    if (Math.abs(target - current) < .0008) current = target;
    const build = Math.max(0, Math.min(1, (current - .04) / .8));
    const stagger = .55;
    for (const part of parts) {
      const local = ease(Math.max(0, Math.min(1, build * (1 + stagger) - part.order * stagger)));
      part.mesh.position.copy(part.home).addScaledVector(part.away, 1 - local);
      part.mesh.quaternion.copy(part.spin).slerp(identity, local);
    }
    const wanted = see ? .12 : 1;
    shellOpacity += (wanted - shellOpacity) * .15;
    for (const shell of shells) { shell.material.opacity = shellOpacity; shell.material.depthWrite = shellOpacity > .9; }
    if (motionOn() && current > .97) spin += delta * .35;
    pivot.rotation.y = 2.25 + current * 2.4 + spin + pointerX * .5;
    pivot.rotation.x = .12 + pointerY * .25;
    renderer.render(scene, camera);

    percentLabel.textContent = `ASSEMBLY ${String(Math.round(build * 100)).padStart(3, '0')}%`;
    bar.style.setProperty('--build', build.toFixed(3));
    const step = current < .3 ? 0 : current < .78 ? 1 : 2;
    if (step !== activeStep) { activeStep = step; steps.forEach((el, index) => el.classList.toggle('is-active', index === step)); }
    scene3d.classList.toggle('is-built', build >= 1);
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function wake() { if (visible && !frame) { last = performance.now(); frame = requestAnimationFrame(tick); } }
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; wake(); }).observe(scene3d);
  document.addEventListener('visibilitychange', wake);
}
