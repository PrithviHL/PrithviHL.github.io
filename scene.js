// WebGL particle sculpture that morphs between shapes as the page scrolls.
// One shape per section: neural sphere, anatomical heart, DNA helix, signal
// wave, spiral galaxy, torus knot. An ECG-style pulse ripples through it.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const TAU = Math.PI * 2;

// Deterministic random so the sculpture looks the same on every visit.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- shapes: each returns Float32Array(count * 3) --------------------------

function sphere(n, r = 3) {
  const out = new Float32Array(n * 3);
  const rand = rng(1);
  for (let i = 0; i < n; i++) {
    // Fibonacci sphere, with a fraction of points scattered inside as "neurons".
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.399963229728653;
    const shell = rand() < 0.82 ? r : r * (0.35 + rand() * 0.6);
    out.set([Math.cos(th) * rad * shell, y * shell, Math.sin(th) * rad * shell], i * 3);
  }
  return out;
}

function heart(n, s = 0.2) {
  const out = new Float32Array(n * 3);
  const rand = rng(2);
  for (let i = 0; i < n; i++) {
    const t = rand() * TAU;
    // Classic heart curve, filled (k) and given depth that bulges in the middle.
    const k = Math.sqrt(rand()) * (rand() < 0.65 ? 1 : 0.999);
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const depth = 6 * Math.sqrt(Math.max(0, 1 - k * k)) * (rand() - 0.5) * 2;
    out.set([x * k * s, (y * k + 2) * s, depth * s], i * 3);
  }
  return out;
}

function helix(n) {
  const out = new Float32Array(n * 3);
  const rand = rng(3);
  for (let i = 0; i < n; i++) {
    const u = rand();
    const x = (u - 0.5) * 12; // the helix lies horizontally across the screen
    const a = u * TAU * 3.2;
    const R = 1.5;
    const pick = rand();
    let y, z;
    if (pick < 0.72) {
      const off = pick < 0.36 ? 0 : Math.PI;
      y = Math.cos(a + off) * R + (rand() - 0.5) * 0.18;
      z = Math.sin(a + off) * R + (rand() - 0.5) * 0.18;
    } else {
      // base-pair rungs between the two strands
      const rungA = Math.round(u * 46) / 46;
      const aa = rungA * TAU * 3.2;
      const m = rand() * 2 - 1;
      y = Math.cos(aa) * R * m;
      z = Math.sin(aa) * R * m;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function wave(n) {
  const out = new Float32Array(n * 3);
  const cols = Math.ceil(Math.sqrt(n * 2.4));
  const rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) {
    const cx = i % cols;
    const cz = Math.floor(i / cols);
    const x = (cx / (cols - 1) - 0.5) * 16;
    const z = (cz / Math.max(1, rows - 1) - 0.5) * 7;
    const h = Math.sin(x * 0.7 + z * 0.4) * 0.55 + Math.cos(z * 1.1) * 0.25;
    // Tilt the surface toward the camera so the waves are visible.
    const tilt = 0.6;
    out.set([x, h * Math.cos(tilt) - z * Math.sin(tilt) - 1.6, h * Math.sin(tilt) + z * Math.cos(tilt)], i * 3);
  }
  return out;
}

function galaxy(n) {
  const out = new Float32Array(n * 3);
  const rand = rng(5);
  for (let i = 0; i < n; i++) {
    const r = Math.pow(rand(), 0.6) * 5;
    const arm = (i % 3) * (TAU / 3);
    const a = r * 1.15 + arm + (rand() - 0.5) * 0.5 * (1 + r * 0.15);
    const y = (rand() - 0.5) * 0.5 * Math.exp(-r * 0.35) * 2;
    // Tilt the disc toward the camera so it reads as a spiral, not a line.
    const gx = Math.cos(a) * r;
    const gz = Math.sin(a) * r;
    const tilt = 1.05;
    out.set([gx, y * Math.cos(tilt) - gz * Math.sin(tilt), y * Math.sin(tilt) + gz * Math.cos(tilt)], i * 3);
  }
  return out;
}

function torusKnot(n, p = 2, q = 3) {
  const out = new Float32Array(n * 3);
  const rand = rng(6);
  for (let i = 0; i < n; i++) {
    const t = rand() * TAU;
    const r = 2 + Math.cos(q * t);
    const cx = r * Math.cos(p * t);
    const cy = r * Math.sin(p * t);
    const cz = -Math.sin(q * t);
    // thicken the curve into a tube
    const ang = rand() * TAU;
    const tube = 0.32 * Math.sqrt(rand());
    out.set([cx * 1.05 + Math.cos(ang) * tube, cy * 1.05 + Math.sin(ang) * tube, cz * 1.4 + Math.sin(ang * 1.7) * tube], i * 3);
  }
  return out;
}

// Per-section placement: [x, y, scale, opacity]. x is reduced on narrow screens.
const LAYOUT = [
  [0, 0.1, 1.0, 1.0], // hero: neural sphere
  [-3.4, 0, 0.95, 0.95], // about: heart beside the photo
  [0, 0.2, 1.0, 0.55], // projects: helix behind the cards (dimmer)
  [0, -0.4, 1.0, 0.7], // journey: signal wave
  [-3.4, -0.2, 0.72, 0.7], // skills: galaxy beside the heading
  [0, 0.4, 0.95, 0.65], // contact: torus knot (dimmed behind the heading)
];

const VERT = /* glsl */ `
  attribute vec3 aA;
  attribute vec3 aB;
  attribute float aRand;
  uniform float uMix;
  uniform float uTime;
  uniform float uPulse;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vGlow;
  varying float vRand;
  void main() {
    float m = smoothstep(0.0, 1.0, uMix);
    vec3 p = mix(aA, aB, m);
    // Points take slightly different paths while morphing, which reads as a swirl.
    float swirl = sin(m * 3.14159) * (0.8 + aRand);
    p.xz = mat2(cos(swirl * 0.35), -sin(swirl * 0.35), sin(swirl * 0.35), cos(swirl * 0.35)) * p.xz;
    p += 0.05 * vec3(sin(uTime * 0.8 + aRand * 40.0), cos(uTime * 0.7 + aRand * 31.0), sin(uTime * 0.6 + aRand * 23.0));
    // Heartbeat: a shell expanding from the centre pushes points outward and lights them up.
    float d = length(p);
    float w = exp(-pow((d - uPulse) * 2.4, 2.0));
    p += normalize(p + 1e-4) * w * 0.22;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand * 0.9) * (1.0 + w * 1.6) * uPixelRatio / -mv.z;
    vGlow = w;
    vRand = aRand;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  uniform float uAlpha;
  varying float vGlow;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    vec3 col = mix(mix(uC1, uC2, vRand), uC3, clamp(vGlow * 1.2, 0.0, 1.0));
    gl_FragColor = vec4(col * (1.0 + vGlow * 1.4), a * (0.5 + vGlow * 0.5) * uAlpha);
  }
`;

/**
 * Start the scene. Returns null if WebGL isn't available (the CSS gradient
 * behind the canvas is the fallback).
 */
export function startScene(canvas, sections, { reducedMotion = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;

  const narrow = () => innerWidth < 720;
  const count = narrow() ? 2200 : 5000;
  const pixelRatio = Math.min(devicePixelRatio || 1, narrow() ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 10);

  const shapes = [sphere(count), heart(count), helix(count), wave(count), galaxy(count), torusKnot(count)];

  const geo = new THREE.BufferGeometry();
  const aA = new THREE.BufferAttribute(shapes[0].slice(), 3);
  const aB = new THREE.BufferAttribute(shapes[1].slice(), 3);
  const rand = rng(9);
  const aRand = new Float32Array(count).map(() => rand());
  geo.setAttribute("position", new THREE.BufferAttribute(shapes[0].slice(), 3)); // for bounds only
  geo.setAttribute("aA", aA);
  geo.setAttribute("aB", aB);
  geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));

  const uniforms = {
    uMix: { value: 0 },
    uTime: { value: 0 },
    uPulse: { value: 99 },
    uSize: { value: narrow() ? 60 : 72 },
    uPixelRatio: { value: pixelRatio },
    uAlpha: { value: 1 },
    uC1: { value: new THREE.Color("#4c8dff") },
    uC2: { value: new THREE.Color("#9085e9") },
    uC3: { value: new THREE.Color("#2fe0a0") },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  // ---- scroll → continuous section index --------------------------------
  let centers = [];
  const measure = () => {
    centers = sections.map((el) => el.offsetTop + el.offsetHeight / 2 - innerHeight / 2);
  };
  measure();
  const sectionIndex = () => {
    const y = scrollY;
    if (y <= centers[0]) return 0;
    for (let i = 0; i < centers.length - 1; i++) {
      if (y < centers[i + 1]) return i + (y - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
    }
    return centers.length - 1;
  };

  let pair = 0; // shapes[pair] → shapes[pair + 1] are loaded into aA / aB
  let smoothF = sectionIndex();
  const loadPair = (i) => {
    const a = Math.max(0, Math.min(shapes.length - 2, i));
    if (a === pair) return;
    pair = a;
    aA.array.set(shapes[a]);
    aB.array.set(shapes[a + 1]);
    aA.needsUpdate = true;
    aB.needsUpdate = true;
  };
  loadPair(Math.floor(smoothF));

  // ---- pointer parallax ------------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / innerHeight) * 2 - 1;
  });

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.position.z = innerWidth < 720 ? 13 : 10;
    camera.updateProjectionMatrix();
    measure();
  };
  addEventListener("resize", resize);
  resize();
  // Layout can shift after fonts and images load.
  addEventListener("load", measure);
  setTimeout(measure, 1500);

  const lerp = (a, b, t) => a + (b - a) * t;
  const clock = new THREE.Clock();
  let running = true;
  let rotY = 0;

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    uniforms.uTime.value = reducedMotion ? 0 : t;

    // follow scroll smoothly
    const target = sectionIndex();
    smoothF = reducedMotion ? target : lerp(smoothF, target, 1 - Math.pow(0.002, dt));
    const base = Math.min(Math.floor(smoothF), shapes.length - 2);
    loadPair(base);
    uniforms.uMix.value = Math.max(0, Math.min(1, smoothF - pair));

    // placement for the current position between two sections
    const i0 = Math.max(0, Math.min(LAYOUT.length - 1, Math.floor(smoothF)));
    const i1 = Math.min(LAYOUT.length - 1, i0 + 1);
    const f = smoothF - i0;
    const L = LAYOUT[i0].map((v, k) => lerp(v, LAYOUT[i1][k], Math.min(1, Math.max(0, f))));
    const xScale = narrow() ? 0.15 : 1;
    group.position.set(L[0] * xScale, L[1], 0);
    group.scale.setScalar(L[2]);
    uniforms.uAlpha.value = L[3] * (narrow() ? 0.75 : 1);

    // heartbeat: a double "lub-dub" every 1.6 s
    if (!reducedMotion) {
      const beat = t % 1.6;
      uniforms.uPulse.value = beat < 1.1 ? beat * 7.5 : 99;
      rotY += dt * 0.12;
    }

    pointer.x = lerp(pointer.x, pointer.tx, 0.05);
    pointer.y = lerp(pointer.y, pointer.ty, 0.05);
    group.rotation.y = rotY + pointer.x * 0.35;
    group.rotation.x = pointer.y * 0.2 + (pair === 2 ? 0.25 : 0);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", () => {
    const wasRunning = running;
    running = !document.hidden;
    if (running && !wasRunning) {
      clock.getDelta();
      requestAnimationFrame(frame);
    }
  });

  return { measure };
}
