/* Pancake House — scroll-driven 3D griddle scene (three.js + GSAP ScrollTrigger) */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage = document.querySelector('.stage');
const canvas = document.getElementById('scene');
const gsap = window.gsap;
const TAU = Math.PI * 2;

/* split the hero copy so letters can pop in */
const heroChars = window.__split ? window.__split(document.querySelector('#panelHero h1')) : [];
const stackChars = window.__split ? window.__split(document.querySelector('#panelStack h2')) : [];

function noWebGL() {
  document.documentElement.classList.add('no-webgl');
  canvas.classList.add('off');
}

main();

function main() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    if (!renderer.getContext()) throw new Error('no ctx');
  } catch (e) { noWebGL(); domOnly(); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.7;

  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x9a6a3a, 0.9));
  const key = new THREE.DirectionalLight(0xffe2b0, 2.4); key.position.set(4, 7, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb565, 1.3); rim.position.set(-6, 2, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xfff6e8, 0.5); fill.position.set(-3, -2, 6); scene.add(fill);

  /* ---------- textures ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  function canvasTex(w, h, draw, srgb = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  // v runs bottom-centre (canvas bottom) -> rim (middle band) -> top-centre (canvas top)
  const faceY = () => (Math.random() < 0.5 ? rnd(0, 0.33) : rnd(0.67, 1));
  const pancakeMap = canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    [[0, '#9a5519'], [0.16, '#b0661f'], [0.28, '#c98436'], [0.35, '#d9a250'], [0.42, '#e8bd72'], [0.5, '#efcd8c'],
     [0.58, '#e8bd72'], [0.65, '#d49a4b'], [0.72, '#c27c31'], [0.86, '#a85f1e'], [1, '#97521a']].forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) { // mottled browning
      const y = faceY() * h, x = Math.random() * w, r = rnd(3, 16);
      g.fillStyle = Math.random() < 0.55 ? `rgba(110,55,12,${rnd(0.05, 0.16)})` : `rgba(245,200,120,${rnd(0.05, 0.14)})`;
      g.beginPath(); g.ellipse(x, y, r * 1.8, r * 0.6, 0, 0, TAU); g.fill();
    }
    for (let i = 0; i < 1400; i++) { // little bubbles
      const y = faceY() * h, x = Math.random() * w;
      g.fillStyle = `rgba(250,215,150,${rnd(0.25, 0.6)})`;
      g.beginPath(); g.ellipse(x, y, rnd(0.8, 2.6), rnd(0.5, 1.4), 0, 0, TAU); g.fill();
    }
    for (let i = 0; i < 260; i++) { // soft crumb on the rim
      const y = rnd(0.38, 0.62) * h, x = Math.random() * w;
      g.fillStyle = `rgba(215,160,85,${rnd(0.08, 0.2)})`;
      g.fillRect(x, y, rnd(6, 30), rnd(1, 2.5));
    }
  });
  const pancakeBump = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${rnd(0.1, 0.35)})` : `rgba(255,255,255,${rnd(0.1, 0.3)})`;
      g.beginPath(); g.arc(Math.random() * w, Math.random() * h, rnd(0.5, 2.2), 0, TAU); g.fill();
    }
  }, false);
  const bananaMap = canvasTex(256, 256, (g, w) => {
    const c = w / 2;
    const gr = g.createRadialGradient(c, c, 0, c, c, c);
    gr.addColorStop(0, '#f6eed2'); gr.addColorStop(0.55, '#fbf3d9'); gr.addColorStop(0.8, '#f3e3b0'); gr.addColorStop(0.93, '#e8d184'); gr.addColorStop(1, '#d9bb63');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(190,160,100,.25)'; g.lineWidth = 2;
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * c * 0.75, c + Math.sin(a) * c * 0.75); g.stroke(); }
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * TAU;
      g.fillStyle = 'rgba(120,85,40,.55)';
      g.beginPath(); g.ellipse(c + Math.cos(a) * 20, c + Math.sin(a) * 20, 5, 2.5, a, 0, TAU); g.fill();
    }
    g.fillStyle = 'rgba(200,170,110,.6)'; g.beginPath(); g.arc(c, c, 7, 0, TAU); g.fill();
  });
  const shadowMap = canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(90,50,15,.55)'); gr.addColorStop(0.5, 'rgba(90,50,15,.22)'); gr.addColorStop(1, 'rgba(90,50,15,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });

  /* ---------- materials ---------- */
  const pancakeMat = new THREE.MeshStandardMaterial({ map: pancakeMap, bumpMap: pancakeBump, bumpScale: 1.6, roughness: 0.66, metalness: 0, color: 0xf2d2a0, envMapIntensity: 0.6 });
  const syrupMat = new THREE.MeshPhysicalMaterial({ color: 0x8f3a06, roughness: 0.07, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03,
    emissive: 0x4a1600, emissiveIntensity: 0.45, specularIntensity: 1, ior: 1.5, envMapIntensity: 1.1 });
  const butterMat = new THREE.MeshPhysicalMaterial({ color: 0xffd45a, roughness: 0.32, envMapIntensity: 0.7, clearcoat: 0.5, clearcoatRoughness: 0.2, sheen: 0.6, sheenColor: new THREE.Color(0xfff3c4) });
  const bananaSide = new THREE.MeshStandardMaterial({ color: 0xe9cf78, roughness: 0.55 });
  const bananaCap = new THREE.MeshStandardMaterial({ map: bananaMap, roughness: 0.5, color: 0xf3e6c4, envMapIntensity: 0.6 });

  /* ---------- geometry ---------- */
  const T = 0.26;
  const prof = [];
  for (let i = 0; i < 8; i++) { const r = 0.9 * i / 7; prof.push(new THREE.Vector2(r, -T / 2 - 0.012 * (1 - (r / 0.9) ** 2))); }
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + Math.PI * (i + 1) / 11; prof.push(new THREE.Vector2(0.9 + 0.11 * Math.cos(a), (T / 2) * Math.sin(a))); }
  for (let i = 7; i >= 0; i--) { const r = 0.9 * i / 7; prof.push(new THREE.Vector2(r, T / 2 + 0.03 * (1 - (r / 0.9) ** 2))); }
  prof[prof.length - 1].x = 0.0001; prof[0].x = 0.0001;
  const pancakeGeo = new THREE.LatheGeometry(prof, 72);
  const butterGeo = new RoundedBoxGeometry(0.46, 0.22, 0.4, 4, 0.06);
  const bananaGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.075, 40);
  const dropGeo = new THREE.SphereGeometry(1, 18, 14);

  const rig = new THREE.Group(); scene.add(rig);           // layout (position/scale per screen)
  const intro = new THREE.Group(); rig.add(intro);          // on-load fly in
  const stack = new THREE.Group(); intro.add(stack);        // pancakes + butter + glaze

  const pancakes = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(pancakeGeo, pancakeMat);
    const s = 1 + rnd(-0.03, 0.03);
    m.scale.set(s, 1, s * rnd(0.96, 1));
    stack.add(m); pancakes.push(m);
  }
  const P0 = pancakes[0];
  const butter = new THREE.Mesh(butterGeo, butterMat); stack.add(butter);
  const butter2 = new THREE.Mesh(butterGeo, butterMat); stack.add(butter2);

  // syrup glaze for the finished stack: puddle + drips
  const glaze = new THREE.Group(); stack.add(glaze);
  const puddleProf = [];
  for (let i = 0; i <= 10; i++) { const r = 0.88 * i / 10; puddleProf.push(new THREE.Vector2(Math.max(r, 0.0001), 0.035 * Math.cos((i / 10) * Math.PI / 2))); }
  const glazeMat = syrupMat.clone(); glazeMat.envMapIntensity = 0.35; glazeMat.clearcoat = 0.6; glazeMat.color.set(0x7a2f04);
  const puddle = new THREE.Mesh(new THREE.LatheGeometry(puddleProf.reverse(), 64), glazeMat);
  glaze.add(puddle);
  const drips = [];
  for (let k = 0; k < 7; k++) {
    const a = k / 7 * TAU + rnd(-0.2, 0.2), len = rnd(0.12, 0.42);
    const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, len, 4, 10), syrupMat);
    const holder = new THREE.Group();
    holder.position.set(Math.cos(a) * 0.93, 0, Math.sin(a) * 0.93);
    d.position.y = -len / 2; holder.add(d); glaze.add(holder);
    drips.push(holder);
  }

  // banana slices
  const ORBIT_A = [[-1.75, 1.25, 0.6], [1.85, 1.5, -0.4], [2.15, -0.55, 0.8], [-2.0, -0.85, 0.5], [0.35, 2.05, -0.7], [-0.75, -1.65, 1.1], [1.3, 0.25, 1.9]];
  const ORBIT_B = [[-2.6, 2.1, 0.9], [2.7, 2.2, -0.8], [3.0, -1.0, 1.2], [-2.9, -1.5, 0.8], [0.6, 3.0, -1.2], [-1.2, -2.5, 1.6], [2.0, 0.6, 2.5]];
  const ORBIT_C = [[-1.9, 0.9, 0.8], [1.9, 1.7, -0.6], [2.0, -1.2, 1.0], [-1.6, -0.6, 1.4], [0.45, -0.46, 0.3], [-0.42, -0.46, -0.22], [1.4, 2.6, 0.4]];
  const bananas = ORBIT_A.map((p, i) => {
    const holder = new THREE.Group();
    const m = new THREE.Mesh(bananaGeo, [bananaSide, bananaCap, bananaCap]);
    m.rotation.set(rnd(0, TAU), rnd(0, TAU), rnd(0, TAU));
    holder.add(m); holder.position.set(...p);
    intro.add(holder);
    return { holder, m, spin: rnd(0.3, 0.9) * (i % 2 ? 1 : -1), phase: rnd(0, TAU) };
  });

  const drops = Array.from({ length: 16 }, () => {
    const m = new THREE.Mesh(dropGeo, syrupMat);
    m.scale.setScalar(0.0001); intro.add(m);
    const dir = new THREE.Vector3(rnd(-1, 1), rnd(-0.2, 1), rnd(-0.6, 1)).normalize().multiplyScalar(rnd(1.3, 2.6));
    return { m, dir, size: rnd(0.04, 0.1) };
  });

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: 0.8 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.55; intro.add(shadow);

  /* ---------- syrup ribbons ---------- */
  function makeRibbon(points, { tubular = 520, radius = 0.085, width = 2.0, thin = 0.5 } = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.5);
    const radial = 14;
    const geo = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
    const pos = geo.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
    for (let i = 0; i <= tubular; i++) {
      const u = i / tubular;
      curve.getPointAt(u, c);
      const N = geo.normals[i], Bn = geo.binormals[i];
      const sm = x => x * x * (3 - 2 * x);
      const taper = sm(Math.min(1, u / 0.07)) * sm(Math.min(1, (1 - u) / 0.14));
      const wob = 1 + 0.18 * Math.sin(u * 37) + 0.08 * Math.sin(u * 91);
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j;
        v.fromBufferAttribute(pos, idx); d.subVectors(v, c);
        const a = d.dot(N), b = d.dot(Bn);
        v.copy(c).addScaledVector(N, a * width * wob * (0.35 + 0.65 * taper)).addScaledVector(Bn, b * thin * (0.4 + 0.6 * taper));
        pos.setXYZ(idx, v.x, v.y, v.z);
      }
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, syrupMat);
    mesh.frustumCulled = false;
    const head = new THREE.Mesh(dropGeo, syrupMat); head.scale.setScalar(0.11);
    const per = radial * 6;
    const state = { head: 0, tail: 0 };
    const tmp = new THREE.Vector3();
    function update() {
      const hs = Math.floor(Math.min(1, state.head) * tubular), ts = Math.floor(Math.min(1, state.tail) * tubular);
      const n = Math.max(0, hs - ts);
      geo.setDrawRange(ts * per, n * per);
      mesh.visible = n > 0;
      head.visible = state.head > 0.01 && state.head < 0.995 && n > 0;
      if (head.visible) { curve.getPointAt(Math.min(1, state.head), tmp); head.position.copy(tmp); }
    }
    update();
    return { mesh, head, state, update };
  }
  const r1 = makeRibbon([[-8, -3.4, 1], [-5, -2.7, 1.4], [-2.2, -2.3, 1.3], [0.4, -1.8, 0.8], [1.9, -0.8, -0.2], [1.8, 0.6, -1.2], [0.4, 1.3, -1.2],
    [-1.3, 0.9, 0], [-1.6, -0.3, 1.1], [-0.5, -1.05, 1.7], [1.1, -0.6, 1.6], [1.9, 0.8, 0.7], [1.1, 2.4, -0.4], [0.3, 4.2, -1], [-0.5, 6.5, -1]]);
  const helix = [[-8, -3, 1.2], [-4.5, -2.6, 1.6]];
  for (let k = 0; k <= 26; k++) {
    const a = Math.PI * 0.85 + k * (2.15 * TAU) / 26, y = -2.15 + k * (3.6 / 26), r = 1.55 + 0.15 * Math.sin(k);
    helix.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  helix.push([1.6, 2.6, 0.2], [2.6, 4.6, -0.4], [3.2, 7, -1]);
  const r2 = makeRibbon(helix, { tubular: 640 });
  intro.add(r1.mesh, r1.head);
  stack.add(r2.mesh, r2.head);

  /* ---------- poses ---------- */
  const BASE_Y = -1.7, STEP = 0.255;
  const HERO_TILT = 0.55;
  P0.position.set(0, 0.1, 0); P0.rotation.set(HERO_TILT, 0, -0.12);
  const topOffset = (tilt, h = 0.24) => [0, Math.cos(tilt) * h, Math.sin(tilt) * h];
  const bo = topOffset(HERO_TILT);
  butter.position.set(0.08, 0.1 + bo[1], bo[2]); butter.rotation.set(HERO_TILT, 0.5, -0.12);
  for (let i = 1; i < 5; i++) { pancakes[i].position.set(0, 12, 0); pancakes[i].rotation.set(0.7, rnd(0, TAU), -0.3); }
  butter2.position.set(0.05, 12.5, 0);
  glaze.position.set(0, BASE_Y + 4 * STEP + T / 2 + 0.01, 0);
  glaze.scale.set(0.001, 0.001, 0.001);
  drips.forEach(d => d.scale.set(1, 0.001, 1));

  /* ---------- layout ---------- */
  const lay = { x: 0, y: 0, s: 1 };
  const motion = { y: 0, s: 1 }; // scroll-driven offsets for the rig
  function layout() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const mobile = w < 760;
    camera.fov = mobile ? 40 : 32;
    camera.updateProjectionMatrix();
    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vw = vh * camera.aspect;
    if (mobile) { lay.x = 0; lay.y = -vh * 0.2; lay.s = Math.min(1, vw / 5.4); }
    else { lay.x = vw * 0.2; lay.y = -0.15; lay.s = Math.min(1.35, vw / 9.4, vh / 5.4); }
  }
  layout();
  addEventListener('resize', () => { layout(); render(); });

  /* ---------- pointer parallax ---------- */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { ptr.tx = (e.clientX / innerWidth - 0.5); ptr.ty = (e.clientY / innerHeight - 0.5); }, { passive: true });

  /* ---------- render loop ---------- */
  const clock = new THREE.Clock();
  let active = true;
  function render() {
    const t = clock.getElapsedTime();
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    rig.position.set(lay.x, lay.y + motion.y * lay.s, 0);
    rig.scale.setScalar(lay.s * motion.s);
    rig.rotation.set(0.3 + ptr.y * 0.18, ptr.x * 0.45, 0);
    bananas.forEach((b, i) => {
      b.m.rotation.x += 0.01 * b.spin; b.m.rotation.y += 0.007 * b.spin;
      b.m.position.y = Math.sin(t * 1.3 + b.phase) * 0.09 * b.holder.userData.float;
    });
    stack.position.y = Math.sin(t * 1.1) * 0.04 * stackFloat.v;
    r1.update(); r2.update();
    renderer.render(scene, camera);
  }
  bananas.forEach(b => (b.holder.userData.float = 1));
  const stackFloat = { v: 1 };
  gsap.ticker.add(() => { if (active) render(); });

  if (reduce) { render(); return; }

  /* ---------- intro (on load) ---------- */
  intro.position.y = -7; intro.rotation.z = -0.9; intro.scale.setScalar(0.5);
  const it = gsap.timeline({ delay: 0.15 });
  it.to(intro.position, { y: 0, duration: 1.6, ease: 'expo.out' }, 0)
    .to(intro.rotation, { z: 0, duration: 1.8, ease: 'back.out(1.6)' }, 0)
    .to(intro.scale, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'expo.out' }, 0)
    .from(heroChars, { yPercent: 115, rotate: () => gsap.utils.random(-18, 18), opacity: 0, stagger: 0.022, duration: 0.85, ease: 'back.out(2.4)' }, 0.1)
    .from('#panelHero .eyebrow, #panelHero p, #panelHero .cta-row', { y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0.5)
    .from('.ghost span', { scale: 0.6, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'elastic.out(1,0.6)' }, 0.25);

  /* ---------- scroll story ---------- */
  const tl = gsap.timeline({
    defaults: { ease: 'power1.inOut' },
    scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 1.1,
      onUpdate: s => dots(s.progress) }
  });
  const flipEnd = HERO_TILT + TAU;
  // 1. the flip
  tl.to('.scroll-cue', { opacity: 0, duration: 0.3 }, 0.05)
    .to(P0.rotation, { x: flipEnd, z: 0.18, duration: 1.7, ease: 'power2.inOut' }, 0)
    .to(P0.position, { y: 1.0, duration: 0.85, ease: 'power2.out' }, 0)
    .to(P0.position, { y: 0.15, duration: 0.85, ease: 'power2.in' }, 0.85)
    .to(butter.position, { y: 2.2, x: -0.3, duration: 0.8, ease: 'power2.out' }, 0.05)
    .to(butter.rotation, { x: HERO_TILT + Math.PI * 2, y: 2.2, duration: 1.6 }, 0.05)
    .to(butter.position, { y: 0.15 + bo[1], x: 0.08, duration: 0.85, ease: 'bounce.out' }, 0.85)
    .to(shadow.scale, { x: 0.6, y: 0.6, duration: 0.85, ease: 'power2.out' }, 0)
    .to(shadow.scale, { x: 1, y: 1, duration: 0.85, ease: 'power2.in' }, 0.85)
    .to('.ghost', { yPercent: -8, scale: 1.06, duration: 2.4 }, 0);
  bananas.forEach((b, i) => {
    tl.to(b.holder.position, { x: ORBIT_B[i][0], y: ORBIT_B[i][1], z: ORBIT_B[i][2], duration: 1.6, ease: 'power3.out' }, 0.1 + i * 0.05);
  });
  // 2. syrup ribbon swirls in, splash
  tl.to(r1.state, { head: 1, duration: 2.1, ease: 'power1.inOut' }, 0.8)
    .to(r1.state, { tail: 1, duration: 1.7, ease: 'power1.in' }, 2.3);
  drops.forEach((d, i) => {
    const st = 1.55 + i * 0.03;
    tl.fromTo(d.m.position, { x: 0, y: 0.1, z: 0.2 }, { x: d.dir.x, y: d.dir.y + 0.4, z: d.dir.z, duration: 1.0, ease: 'power2.out' }, st)
      .fromTo(d.m.scale, { x: 0.0001, y: 0.0001, z: 0.0001 }, { x: d.size, y: d.size * 1.25, z: d.size, duration: 0.3, ease: 'back.out(3)' }, st)
      .to(d.m.scale, { x: 0.0001, y: 0.0001, z: 0.0001, duration: 0.4, ease: 'power2.in' }, st + 0.75);
  });
  // 3. copy swap
  tl.to('#panelHero > *', { y: -70, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power2.in' }, 2.7)
    .to('.ghost', { opacity: 0, scale: 0.92, duration: 0.8 }, 2.8)
    .set('#panelHero', { visibility: 'hidden' }, 3.6)
    .fromTo('#panelStack', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 3.55)
    .from('#panelStack .eyebrow', { y: 30, opacity: 0, duration: 0.5 }, 3.55)
    .from(stackChars, { yPercent: 120, opacity: 0, rotate: i => (i % 2 ? 12 : -12), stagger: 0.025, duration: 0.6, ease: 'back.out(2)' }, 3.6)
    .from('#panelStack p, #panelStack .cta-row', { y: 40, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, 4.1);
  // 4. hero pancake becomes the base, butter hops off
  tl.to(butter.position, { y: 11, x: 2.2, duration: 1.1, ease: 'power2.in' }, 2.9)
    .to(butter.rotation, { z: 3, duration: 1.1 }, 2.9)
    .to(P0.position, { x: 0, y: BASE_Y, z: 0, duration: 1.3, ease: 'power2.inOut' }, 3.1)
    .to(P0.rotation, { x: TAU, z: 0, y: 0.4, duration: 1.3, ease: 'power2.inOut' }, 3.1)
    .to(shadow.position, { y: BASE_Y - 0.16, duration: 1.3 }, 3.1)
    .to(shadow.scale, { x: 1.15, y: 1.15, duration: 1.3 }, 3.1)
    .to(stack.rotation, { y: 0.9, duration: 6, ease: 'none' }, 3.4)
    .to(stackFloat, { v: 0, duration: 0.6 }, 3.2);
  // 5. pancakes drop in, one by one
  for (let i = 1; i < 5; i++) {
    const st = 4.1 + (i - 1) * 0.62;
    tl.fromTo(pancakes[i].position, { y: 12 }, { y: BASE_Y + i * STEP, duration: 0.6, ease: 'power3.in', immediateRender: false }, st)
      .to(pancakes[i].rotation, { x: 0, z: 0, duration: 0.6, ease: 'power2.out' }, st)
      .fromTo(pancakes[i].scale, { y: 1 }, { y: 0.82, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, st + 0.6);
  }
  bananas.forEach((b, i) => {
    tl.to(b.holder.position, { x: ORBIT_C[i][0], y: ORBIT_C[i][1], z: ORBIT_C[i][2], duration: 1.8, ease: 'power2.inOut' }, 4.0 + i * 0.08);
  });
  tl.to([bananas[4].holder.userData, bananas[5].holder.userData], { float: 0, duration: 0.5 }, 6.3);
  tl.to(bananas[4].m.rotation, { x: 0.05, z: 0.1, duration: 0.8 }, 6.3).to(bananas[5].m.rotation, { x: -0.08, z: -0.05, duration: 0.8 }, 6.3);
  // butter + glaze crown the stack
  tl.fromTo(butter2.position, { y: 12.5 }, { y: BASE_Y + 4 * STEP + 0.26, duration: 0.6, ease: 'power3.in', immediateRender: false }, 6.75)
    .to(glaze.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.5)' }, 7.3);
  drips.forEach((d, k) => tl.to(d.scale, { y: 1, duration: 0.9, ease: 'power2.out' }, 7.5 + k * 0.05));
  // 6. second ribbon wraps the stack
  tl.to(r2.state, { head: 1, duration: 2.5, ease: 'power1.inOut' }, 5.0)
    .to(r2.state, { tail: 1, duration: 1.6, ease: 'power1.in' }, 7.5);
  // 7. hand-off to the toffee landing
  tl.to(motion, { y: 1.6, s: 0.86, duration: 1.4, ease: 'power2.in' }, 8.6)
    .to('#panelStack > *', { y: -60, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power2.in' }, 8.7)
    .to('.toffee-wipe', { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power3.inOut' }, 8.9)
    .to(canvas, { opacity: 0, duration: 0.5 }, 9.5)
    .set({}, {}, 10.2);

  const dotEls = document.querySelectorAll('.progress-dots b');
  function dots(p) { const n = p < 0.25 ? 0 : p < 0.38 ? 1 : p < 0.72 ? 2 : 3; dotEls.forEach((d, i) => d.classList.toggle('on', i === n)); }

  window.ScrollTrigger.create({ trigger: '#story', start: 'top bottom', end: 'bottom top', onToggle: s => { active = s.isActive; } });
  window.ScrollTrigger.refresh();
}

/* if WebGL is unavailable, keep the copy choreography so the page still tells the story */
function domOnly() {
  if (reduce || !gsap || !window.ScrollTrigger) return;
  gsap.from(heroChars, { yPercent: 115, opacity: 0, stagger: 0.02, duration: 0.8, ease: 'back.out(2.4)' });
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 1 } });
  tl.to('#panelHero > *', { y: -70, opacity: 0, stagger: 0.06, duration: 0.7 }, 2.7)
    .to('.ghost', { opacity: 0, duration: 0.8 }, 2.8)
    .fromTo('#panelStack', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 3.5)
    .to('.toffee-wipe', { clipPath: 'inset(0% 0 0 0)', duration: 1.1 }, 8.9)
    .set({}, {}, 10.2);
}
