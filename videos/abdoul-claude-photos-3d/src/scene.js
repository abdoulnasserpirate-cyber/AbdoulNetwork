// « Claude retrouve tes photos » — one continuous 3D space (WebGL + CSS3D), driven only by time.
// Every visual state is a pure function of t (seconds). GSAP owns the clock through a setter proxy.
import * as THREE from "../assets/vendor/three.module.min.js";
import { CSS3DRenderer, CSS3DObject } from "../assets/vendor/CSS3DRenderer.js";

const root = document.getElementById("root");
const W = +root.dataset.width;
const H = +root.dataset.height;
const V = H > W; // vertical 9:16
const DUR = +root.dataset.duration;
const FPS = 60;

// ------------------------------------------------------------------ helpers
const easeCache = {};
const E = (name) => easeCache[name] || (easeCache[name] = gsap.parseEase(name));
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (t, t0, t1, ease = "power3.inOut") => E(ease)(clamp((t - t0) / (t1 - t0)));
const win = (t, a, b) => t >= a && t < b;
// fade in over [a, a+fi], hold, fade out over [b-fo, b]
const env = (t, a, b, fi = 0.25, fo = 0.25, ei = "power2.out", eo = "power2.in") =>
  t < a || t > b ? 0 : Math.min(seg(t, a, a + fi, ei), 1 - seg(t, b - fo, b, eo));
const hash = (n) => {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const styleCache = new WeakMap();
function css(el, prop, val) {
  let c = styleCache.get(el);
  if (!c) styleCache.set(el, (c = {}));
  if (c[prop] === val) return;
  c[prop] = val;
  el.style[prop] = val;
}
const htmlCache = new WeakMap();
function html(el, s) {
  if (htmlCache.get(el) === s) return;
  htmlCache.set(el, s);
  el.innerHTML = s;
}
function h(tag, cls, inner = "", styles = null) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (inner) el.innerHTML = inner;
  if (styles) Object.assign(el.style, styles);
  return el;
}
const px = (n) => `${n}px`;

// ------------------------------------------------------------------ layout (screen px per format)
const L = V
  ? {
      title: { x: 110, y: 170, w: 860, fs: 62 },
      counter: { y: 1340, fs: 122 },
      glitchFs: 200,
      ledS1: { cx: 540, cy: 815, w: 760 },
      ledS2: { cx: 540, cy: 505, w: 280 },
      ledS8: { cx: 522, cy: 694, w: 300 },
      ledEnd: { cx: 540, cy: 1172, w: 150 },
      corners: { x: 250, y: 360, w: 580, h: 600 },
      laser: { y: [360, 1040, 600], w: 720, cx: 540 },
      gridS2: { x: 141, y: 690, cw: 250, ch: 190, g: 24 },
      gridS8: { x: 110, y: 380, cw: 260, ch: 195, g: 22 },
      panel: { x: 80, y: 330, w: 840, h: 980 },
      pills: { x: 80, y: 1212, w: 840, h: 150 },
      browser: { w: 600, h: 400 },
      fan: [[70, 400, -24, -8, -260], [170, 360, -12, -3, -170], [270, 395, 0, 2, -85], [370, 440, 12, 6, 0]],
      list: { x: 100, y: 800, w: 820, h: 520 },
      steps: { x: 100, y: 1345, w: 840, h: 140 },
      chat3: { x: 80, y: 360, w: 840, h: 700 },
      doc: { x: 170, y: 330, w: 600, h: 560 },
      env: { x: 200, y: 930, cw: 210, ch: 116, g: 24 },
      wm: { x: 100, y: 560, w: 880, h: 300 },
      sbar: { x: 110, y: 930, w: 860, h: 110 },
    }
  : {
      title: { x: 210, y: 64, w: 1500, fs: 60 },
      counter: { y: 868, fs: 128 },
      glitchFs: 240,
      ledS1: { cx: 960, cy: 490, w: 540 },
      ledS2: { cx: 470, cy: 475, w: 440 },
      ledS8: { cx: 954, cy: 511, w: 300 },
      ledEnd: { cx: 960, cy: 850, w: 150 },
      corners: { x: 750, y: 170, w: 420, h: 440 },
      laser: { y: [170, 760, 380], w: 520, cx: 960 },
      gridS2: { x: 820, y: 190, cw: 300, ch: 200, g: 24 },
      gridS8: { x: 450, y: 165, cw: 320, ch: 215, g: 24 },
      panel: { x: 400, y: 160, w: 1120, h: 700 },
      pills: { x: 400, y: 878, w: 1120, h: 90 },
      browser: { w: 640, h: 430 },
      fan: [[110, 250, -26, -8, -260], [230, 205, -14, -3, -170], [350, 255, -2, 2, -85], [470, 230, 10, 5, 0]],
      list: { x: 1150, y: 160, w: 660, h: 690 },
      steps: { x: 110, y: 868, w: 980, h: 90 },
      chat3: { x: 400, y: 190, w: 1120, h: 620 },
      doc: { x: 260, y: 170, w: 620, h: 660 },
      env: { x: 1050, y: 200, cw: 210, ch: 170, g: 28 },
      wm: { x: 540, y: 250, w: 840, h: 300 },
      sbar: { x: 530, y: 600, w: 860, h: 110 },
    };

// stations of the single 3D space
const ST = {
  A: new THREE.Vector3(0, 0, 0),
  B: new THREE.Vector3(W * 1.25, 0, -300),
  D: new THREE.Vector3(W * 2.55, 200, -900),
  E: new THREE.Vector3(0, -H * 1.2, -400),
  F: new THREE.Vector3(0, -H * 2.4, -800),
};
const wpos = (st, sx, sy, z = 0) => new THREE.Vector3(ST[st].x + sx - W / 2, ST[st].y + H / 2 - sy, ST[st].z + z);

// ------------------------------------------------------------------ renderers
const FOV = 40;
const D = H / 2 / Math.tan((FOV / 2) * (Math.PI / 180));
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.setClearColor(0x050505, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, W / H, 5, 30000);
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(W, H);
document.getElementById("css3d").appendChild(cssRenderer.domElement);
const cssScene = new THREE.Scene();

// ------------------------------------------------------------------ dust (parallax field across the whole journey)
{
  const rnd = mulberry32(7);
  const N = 2600;
  const pos = new Float32Array(N * 3);
  const sz = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = -1800 + rnd() * 10000;
    pos[i * 3 + 1] = -8600 + rnd() * 10200;
    pos[i * 3 + 2] = -4200 + rnd() * 3600;
    sz[i] = 2 + rnd() * 4;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("sz", new THREE.BufferAttribute(sz, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uD: { value: D } },
    vertexShader: `attribute float sz; uniform float uD; varying float vA;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = clamp(sz*uD/-mv.z, 1.0, 9.0);
      vA = clamp(1.2 - (-mv.z)/9000., 0.15, 1.); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying float vA; void main(){ float d=length(gl_PointCoord-.5)*2.; float a=(1.-smoothstep(.5,1.,d))*.45*vA;
      gl_FragColor=vec4(vec3(1.,.16,.16)*a, a); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Points(g, m));
}

// ------------------------------------------------------------------ LED wall (the face as a relief of light points)
const LP = window.LED_POINTS;
const led = (() => {
  const n = LP.n;
  const pos = new Float32Array(n * 3);
  const lum = new Float32Array(n);
  const yn = new Float32Array(n);
  let ymin = 1e9, ymax = -1e9;
  for (let i = 0; i < n; i++) {
    ymin = Math.min(ymin, LP.d[i * 3 + 1]);
    ymax = Math.max(ymax, LP.d[i * 3 + 1]);
  }
  const yc = (ymin + ymax) / 2;
  for (let i = 0; i < n; i++) {
    const x = LP.d[i * 3], y = LP.d[i * 3 + 1], l = LP.d[i * 3 + 2];
    pos[i * 3] = x;
    pos[i * 3 + 1] = y - yc;
    pos[i * 3 + 2] = l * 0.07;
    lum[i] = l;
    yn[i] = (y - ymin) / (ymax - ymin);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("lum", new THREE.BufferAttribute(lum, 1));
  g.setAttribute("yn", new THREE.BufferAttribute(yn, 1));
  const uniforms = {
    uD: { value: D }, uW: { value: 760 }, uSpacing: { value: 1 / (LP.cols - 1) },
    uReveal: { value: 0 }, uScanY: { value: -1 }, uScan: { value: 0 }, uBoost: { value: 0 }, uOpacity: { value: 1 },
  };
  const m = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `attribute float lum; attribute float yn;
      uniform float uD, uW, uSpacing, uReveal, uScanY, uScan, uBoost;
      varying float vL; varying float vA; varying float vS;
      void main(){
        float a = 1.0 - smoothstep(uReveal - 0.06, uReveal, yn);
        float band = exp(-pow((yn - uScanY) / 0.03, 2.0)) * uScan;
        vec3 p = position;
        p.z += band * 0.05 + (1.0 - a) * 0.25;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float s = uSpacing * (0.32 + 0.78 * lum) * (1.0 + 0.6 * band) * uW * 2.3;
        gl_PointSize = s * uD / -mv.z;
        vL = lum; vA = a; vS = band;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform float uBoost, uOpacity; varying float vL; varying float vA; varying float vS;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float core = 1.0 - smoothstep(0.36, 0.44, d);
        float glow = exp(-d * d * 4.5) * 0.4;
        vec3 col = mix(vec3(1.0, 0.165, 0.165), vec3(1.0, 0.8, 0.8), smoothstep(0.72, 1.0, vL));
        col = mix(col, vec3(1.0, 0.95, 0.95), vS * 0.75);
        float b = (0.16 + 1.0 * vL) * (1.0 + uBoost + vS * 0.9);
        float a = (core + glow) * vA * uOpacity;
        gl_FragColor = vec4(col * b * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  return { pts, u: uniforms };
})();

// laser (core line + soft glow)
const hFade = (() => {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 4;
  const x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, "rgba(255,255,255,0)");
  gr.addColorStop(0.15, "rgba(255,255,255,1)");
  gr.addColorStop(0.85, "rgba(255,255,255,1)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 256, 4);
  return new THREE.CanvasTexture(c);
})();
// soft glow: rounded box of size uBox (fraction of the plane) fading to 0 at the plane edge
function softGlow(color, opacity, box = [0.5, 0.5]) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uBox: { value: new THREE.Vector2(box[0], box[1]) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform vec2 uBox; varying vec2 vUv;
      void main(){ vec2 q = abs(vUv - 0.5) * 2.0; vec2 d = max(q - uBox, 0.0) / max(1.0 - uBox, 1e-3);
        float r = length(d); float a = exp(-r * r * 5.0) * (1.0 - smoothstep(0.85, 1.0, r)); a *= uOpacity;
        gl_FragColor = vec4(uColor * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}
const laserGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), softGlow(0xff3030, 0.8, [0.8, 0.0]));
const laserCore = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({ color: 0xffe0e0, alphaMap: hFade, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(laserGlow, laserCore);

// cards (the 9 places) + lines + particles
const loader = new THREE.TextureLoader();
const cards = [];
for (let i = 0; i < 9; i++) {
  const tex = loader.load(`assets/thumbs/found-${i + 1}.png`);
  tex.colorSpace = THREE.SRGBColorSpace;
  const grp = new THREE.Group();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), softGlow(0xff2a2a, 0.0, [0.62, 0.55]));
  glow.position.z = -2;
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 }));
  frame.position.z = -1;
  const img = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  grp.add(glow, frame, img);
  scene.add(grp);
  cards.push({ grp, glow, frame, img });
}
const lineMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
const lines = [];
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lineMat);
  scene.add(m);
  lines.push(m);
}
const partGeo = new THREE.BufferGeometry();
const PPL = 5;
const partPos = new Float32Array(9 * PPL * 3);
partGeo.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
const parts = new THREE.Points(partGeo, new THREE.PointsMaterial({ color: 0xff8080, size: 9, sizeAttenuation: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(parts);

// ------------------------------------------------------------------ CSS3D helpers
function o3(el, st, box, z = 0, parent = cssScene) {
  el.style.width = px(box.w);
  if (box.h != null) el.style.height = px(box.h);
  const o = new CSS3DObject(el);
  o.position.copy(wpos(st, box.x + box.w / 2, box.y + (box.h || 0) / 2, z));
  o.userData.base = o.position.clone();
  parent.add(o);
  return o;
}
function relPos(el, ancestor) {
  let x = 0, y = 0, n = el;
  while (n && n !== ancestor) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

const STAR = `<svg viewBox="0 0 24 24" class="star"><g stroke="#D97757" stroke-width="2.6" stroke-linecap="round">${Array.from(
  { length: 12 }, (_, a) => `<line x1="12" y1="12" x2="${(12 + 10 * Math.cos(a * 0.5236)).toFixed(2)}" y2="${(12 + 10 * Math.sin(a * 0.5236)).toFixed(2)}"/>`).join("")}</g></svg>`;
const CURSOR = `<svg viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.2 L17.5 13.2 Z" fill="#fff" stroke="#000" stroke-width="1.2"/></svg>`;
const MAG = `<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="none" stroke="#bbb" stroke-width="2.4"/><line x1="15" y1="15" x2="21" y2="21" stroke="#bbb" stroke-width="2.6" stroke-linecap="round"/></svg>`;
const MAG_D = MAG.replace(/#bbb/g, "#555");
const ENV = `<svg viewBox="0 0 64 48"><rect x="2" y="2" width="60" height="44" rx="5" fill="none" stroke="#F5F5F5" stroke-width="3.5"/><path d="M4 6 L32 28 L60 6" fill="none" stroke="#F5F5F5" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
const AV = "assets/photo/avatar-natural-256.png";

function makeCursor(parent) {
  const halo = h("div", "halo");
  const cur = h("div", "cursor", CURSOR);
  parent.append(halo, cur);
  return { cur, halo };
}
// path: [[t, x, y, ease]], clicks: [t...]
function driveCursor(c, t, path, clicks, vis) {
  let x = path[0][1], y = path[0][2];
  for (let i = 1; i < path.length; i++) {
    const [t1, x1, y1, e] = path[i];
    const t0 = path[i - 1][0];
    if (t >= t0) {
      const p = seg(t, t0, t1, e || "power3.inOut");
      x = lerp(path[i - 1][1], x1, p);
      y = lerp(path[i - 1][2], y1, p);
    }
  }
  let press = 0, ring = 0, ringP = 0;
  for (const tc of clicks) {
    if (t >= tc - 0.08 && t < tc + 0.12) press = Math.max(press, 1 - Math.abs(t - tc) / 0.1);
    if (t >= tc && t < tc + 0.5) { ringP = (t - tc) / 0.5; ring = 1; }
  }
  css(c.cur, "opacity", String(vis));
  css(c.cur, "transform", `translate(${x - 6}px, ${y - 4}px) scale(${1 - press * 0.18})`);
  css(c.halo, "opacity", String(ring ? (1 - ringP) * vis : 0));
  css(c.halo, "transform", `translate(${x}px, ${y}px) scale(${0.35 + E("expo.out")(ringP) * 1.3})`);
}

function typed(segs, n, caret) {
  let out = "", left = n;
  for (const [txt, u] of segs) {
    if (left <= 0) break;
    const s = txt.slice(0, left);
    left -= s.length;
    out += u ? `<u>${esc(s)}</u>` : esc(s);
  }
  return out + (caret ? '<span class="caret"></span>' : "");
}
const segLen = (segs) => segs.reduce((a, s) => a + s[0].length, 0);
// typing progress with a slightly human rhythm (monotonic)
const typeN = (t, t0, t1, N) => {
  const p = clamp((t - t0) / (t1 - t0));
  const q = clamp(p + 0.006 * Math.sin(p * 47) * Math.sin(p * Math.PI));
  return Math.floor(q * N + 1e-6);
};
const blink = (t) => Math.floor(t * 2.4) % 2 === 0;

// ------------------------------------------------------------------ texts
const P1 = [["Analyse cette photo et liste chaque détail précis qui me rend reconnaissable", 1], [", pour que tu puisses m'identifier n'importe où en ligne.", 0]];
const P2 = [["Voici mon selfie, je m'appelle Abdoul Nasser Oumarou.", 1], [" Utilise Chrome pour faire une ", 0], ["recherche d'image inversée", 1],
  [" de mon visage, trouve ", 0], ["chaque endroit", 1], [" où j'apparais en ligne et donne-moi ", 0], ["le lien de chacun", 1], [".", 0]];
const P3 = [["Maintenant, rédige une ", 0], ["demande de retrait personnalisée", 1], [" pour chaque site où je ne veux plus apparaître", 0], [", au nom de la protection de mes données.", 0]];
const DESC = [["Cheveux", "Courts, noirs, coupe nette et dégradée."], ["Visage", "Ovale allongé, pommettes marquées."],
  ["Yeux", "Marron foncé, en amande, regard direct."], ["Barbe", "Fine et courte, sur la mâchoire et le menton."],
  ["Teint", "Foncé, uniforme."], ["Vêtements", "Chemise blanche col ouvert, blazer bleu marine."], ["Arrière-plan", "Fond gris dégradé de studio."]];
const DESC_T = [14.25, 14.85, 15.6, 16.3, 16.68, 16.98, 17.3];
const PLACES = ["Page Facebook Abdoul Network", "TikTok @abdoulnetwork", "Instagram", "LinkedIn", "YouTube",
  "Chaîne WhatsApp AbdoulNetwork Lab", "Portfolio Abdoul Network", "Digital Abdoul Academy", "Boutique Chariow"];

// ------------------------------------------------------------------ station A: corners
const corners = [];
for (let k = 0; k < 4; k++) {
  const el = h("div", "corner");
  const cx = k % 2, cy = Math.floor(k / 2);
  el.style[cx ? "borderRight" : "borderLeft"] = "8px solid #F5F5F5";
  el.style[cy ? "borderBottom" : "borderTop"] = "8px solid #F5F5F5";
  const C = L.corners;
  const o = o3(el, "A", { x: C.x + cx * (C.w - 70), y: C.y + cy * (C.h - 70), w: 70, h: 70 }, 60);
  corners.push({ o, el, dx: cx ? 1 : -1, dy: cy ? -1 : 1 });
}

// ------------------------------------------------------------------ station B: Claude app cube (chat front, settings right)
const P = L.panel;
const cube = new THREE.Object3D();
cube.position.copy(wpos("B", P.x + P.w / 2, P.y + P.h / 2, -P.w / 2));
cssScene.add(cube);

const front = h("div", "panel");
front.innerHTML = `<div class="dots3"><i></i><i></i><i></i></div><div class="me"><img src="${AV}" alt=""></div>`;
const iv = V
  ? { hello: 210, in1: { l: 40, t: 360, w: 760, h: 380 }, bub: { r: 40, t: 96 }, resp: { l: 40, t: 200, w: 760 }, in0: { l: 40, t: 850, w: 760, h: 96 }, in2: { l: 40, t: 380, w: 760, h: 470 } }
  : { hello: 150, in1: { l: 60, t: 280, w: 1000, h: 300 }, bub: { r: 50, t: 84 }, resp: { l: 60, t: 168, w: 1000 }, in0: { l: 60, t: 590, w: 1000, h: 84 }, in2: { l: 60, t: 250, w: 1000, h: 410 } };
const box = (b) => ({ left: px(b.l), top: px(b.t), width: px(b.w), height: b.h ? px(b.h) : "auto" });

// view 1: greeting + input with selfie + prompt 1
const v1 = h("div", "view");
const hello = h("div", "hello", `${STAR}<span>Bonjour, Abdul</span>`, { top: px(iv.hello) });
const in1 = h("div", "input", "", box(iv.in1));
const att1 = h("div", "att", `<img src="${AV}" alt="">`);
const txt1 = h("div", "itext");
const bar1 = h("div", "ibar", `<span class="plus">+</span><span class="model">Claude ▾</span><span class="send">↑</span>`);
in1.append(att1, txt1, bar1);
v1.append(hello, in1);
// view 2: bubble + response + empty input
const v2 = h("div", "view");
const bub = h("div", "bubble", `<img src="${AV}" alt=""><span>Analyse cette photo et liste chaque détail…</span>`, { right: px(iv.bub.r), top: px(iv.bub.t) });
const resp = h("div", "resp", "", box(iv.resp));
const respH = h("h4", "", "Description visuelle détaillée");
resp.append(respH);
const respLines = DESC.map(([k, v]) => {
  const p = h("p", "", `<i class="hlbg"></i><span><b>${k}</b> — ${v}</span>`);
  resp.append(p);
  return p;
});
const thinking = h("div", "thinking", `${STAR.replace('class="star"', 'class="star" style="width:34px;height:34px"')}<span>Réflexion…</span>`, { left: px(iv.resp.l), top: px(iv.resp.t) });
const in0 = h("div", "input", `<div class="itext"><span class="ph">Écris un message…</span></div>`, box(iv.in0));
v2.append(bub, thinking, resp, in0);
// view 3: input with selfie + prompt 2 (response scrolled up, blurred)
const v3 = h("div", "view");
const in2 = h("div", "input", "", box(iv.in2));
const att2 = h("div", "att", `<img src="${AV}" alt="">`);
const txt2 = h("div", "itext");
const bar2 = h("div", "ibar", `<span class="plus">+</span><span class="model">Claude ▾</span><span class="send">↑</span>`);
in2.append(att2, txt2, bar2);
v3.append(in2);
front.append(v1, v2, v3);
const curF = makeCursor(front);
front.style.width = px(P.w); front.style.height = px(P.h);
const frontO = new CSS3DObject(front);
frontO.position.set(0, 0, P.w / 2);
cube.add(frontO);

// settings face
const side = h("div", "panel");
side.innerHTML = `<div class="dots3"><i></i><i></i><i></i></div>`;
const shead = h("div", "shead", `Paramètres<i></i>`);
const sv = V ? { side: { l: 30, t: 150, w: 260 }, main: { l: 310, t: 150, w: 500, h: 800 } } : { side: { l: 34, t: 150, w: 300 }, main: { l: 370, t: 150, w: 710, h: 520 } };
const sside = h("ul", "sside", "", { left: px(sv.side.l), top: px(sv.side.t), width: px(sv.side.w) });
const SIDE = ["Général", "Compte", "Confidentialité", "Facturation", "Capacités", "Connecteurs"];
const sItems = SIDE.map((s) => {
  const li = h("li", "", `<i class="act"></i><span>${s}</span>`);
  sside.append(li);
  return li;
});
const smain = h("div", "smain", "", box(sv.main));
const gen = h("div", "gen", `<div class="row"><span>Nom</span><b>Abdul</b></div><div class="row"><span>Apparence</span><b>Sombre</b></div><div class="row"><span>Langue</span><b>Français</b></div><div class="row"><span>Notifications</span><b>Activées</b></div>`);
const con = h("div", "con");
const conH = h("h4", "", "Connecteurs");
const search = h("div", "search", `${MAG}<span class="q"></span>`);
const searchQ = search.querySelector(".q");
const clist = h("div", "clist");
const ICON_GLOBE = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>`;
const ICON_BOX = `<svg viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>`;
const CONN = [
  ["Claude in Chrome", V ? "Navigue et agit dans Chrome." : "Laisse Claude naviguer, lire les pages et agir dans Chrome.", true],
  ["Google Drive", "Fichiers et dossiers", false], ["Gmail", "E-mails et brouillons", false], ["Notion", "Pages et bases", false]];
const connEls = CONN.map(([n, d, hero], i) => {
  const c = h("div", "conn" + (hero ? " hero" : ""), `<div class="ci">${hero ? ICON_GLOBE : ICON_BOX}</div><div><b>${n}</b><small>${d}</small></div>` +
    (hero ? `<span class="btn"><span class="b1">Installer</span><span class="b2">✓ Installé</span></span>` : ""), { top: px(i * 150) });
  clist.append(c);
  return c;
});
const btn = connEls[0].querySelector(".btn");
const btn1 = btn.querySelector(".b1"), btn2 = btn.querySelector(".b2");
con.append(conH, search, clist);
smain.append(gen, con);
side.append(shead, sside, smain);
const curS = makeCursor(side);
side.style.width = px(P.w); side.style.height = px(P.h);
const sideO = new CSS3DObject(side);
sideO.position.set(P.w / 2, 0, 0);
sideO.rotation.y = Math.PI / 2;
cube.add(sideO);

// pills (float in front of the panel)
function makePills(items, box, st, z) {
  const wrap = h("div", "pills", "", { alignContent: "flex-start" });
  const els = items.map(([n, tx]) => {
    const p = h("span", "pill", `<b>${n}</b>${tx}`);
    wrap.append(p);
    return p;
  });
  const o = o3(wrap, st, box, z);
  return { o, els, wrap };
}
const pills1 = makePills([["1", "Ajoute ton selfie"], ["2", "Décris chaque détail"], ["3", "Ce qui te rend reconnaissable"]], L.pills, "B", 90);
const pills2 = makePills([["1", "Selfie + nom"], ["2", "Recherche d'image inversée"], ["3", "Chaque endroit + le lien"]], L.pills, "B", 90);
const PILL1_T = [9.25, 10.85, 12.4];
const PILL2_T = [26.45, 28.45, 31.6];

// ------------------------------------------------------------------ station D: browsers + list + steps
const browsers = L.fan.map(([x, y, yaw, roll, z], k) => {
  const el = h("div", "brow");
  const tabs = ["Recherche d'image inversée", "Correspondances visuelles", "Images similaires", "Pages contenant l'image"];
  el.innerHTML = `<div class="bbar"><i></i><i></i><i></i><span class="url">${tabs[k]} — résultats</span></div>
    <div class="bhead">${tabs[k]}</div>
    <div class="bbody"><div class="bq"><img src="${AV}" alt=""><span class="scan"></span></div>
    <div class="bres">${Array.from({ length: 6 }, (_, j) => `<img src="assets/thumbs/found-${((k * 2 + j) % 9) + 1}.png" alt="">`).join("")}</div></div>`;
  const o = o3(el, "D", { x, y, w: L.browser.w, h: L.browser.h }, z);
  o.userData.yaw = (yaw * Math.PI) / 180;
  o.userData.roll = (roll * Math.PI) / 180;
  return { o, el, scan: el.querySelector(".scan") };
});
const listEl = h("div", "panel");
const found = h("div", "found", `<p class="lead">J'ai trouvé <b>9 endroits</b> où tu apparais :</p><ol>${PLACES.map(
  (p, i) => `<li><span class="n">${i + 1}.</span><span class="t">${p}</span><span class="lk"></span></li>`).join("")}</ol>`,
  V ? { left: "40px", top: "70px", right: "30px" } : { left: "44px", top: "80px", right: "34px" });
listEl.append(h("div", "dots3", "<i></i><i></i><i></i>"), found);
const listO = o3(listEl, "D", L.list, 40);
const listItems = [...found.querySelectorAll("li")];
const listLead = found.querySelector(".lead");
const steps = makePills([["1", "Selfie + nom"], ["2", "Chrome"], ["3", "Endroits"], ["4", "Liens"]], L.steps, "D", 120);
const STEP_T = [34.0, 34.8, 35.7, 36.45];

// ------------------------------------------------------------------ station E: chat 3 + document + envelopes
const chat3 = h("div", "panel");
const c3In = h("div", "input", "", V ? { left: "40px", top: "300px", width: "760px", height: "360px" } : { left: "60px", top: "250px", width: "1000px", height: "320px" });
const txt3 = h("div", "itext");
c3In.append(txt3, h("div", "ibar", `<span class="plus">+</span><span class="model">Claude ▾</span><span class="send">↑</span>`));
const c3Top = h("div", "found", `<p class="lead">J'ai trouvé <b>9 endroits</b> où tu apparais :</p><ol>${PLACES.slice(0, V ? 4 : 3).map(
  (p, i) => `<li><span class="n">${i + 1}.</span><span class="t">${p}</span><span class="lk"></span></li>`).join("")}</ol>`,
  { left: V ? "40px" : "60px", top: "70px", right: "30px", opacity: "0.35", filter: "blur(1.5px)" });
chat3.append(h("div", "dots3", "<i></i><i></i><i></i>"), c3Top, c3In);
const curC3 = makeCursor(chat3);
const chat3O = o3(chat3, "E", L.chat3, 0);

const LETTER = (n, site, url) => `<span class="hd">${n}. ${site}</span>\n──────────────\nObjet : demande de retrait de photos\n\nBonjour,\n\nDes photos de moi sont publiées\nà cette adresse : ${url}\nJe vous demande de les retirer,\nau nom de la protection de mes\ndonnées personnelles.\n\nCordialement,\nAbdoul Nasser Oumarou\n\n`;
const docEl = h("div", "doc");
const docN = h("span", "dn", "1/9");
const dh = h("div", "dh", `<b>Demandes de retrait</b>`);
dh.append(docN);
const dscroll = h("div", "dscroll", `<pre>${LETTER(1, "Facebook", "facebook.com/…")}${LETTER(2, "TikTok", "tiktok.com/…")}${LETTER(3, "Instagram", "instagram.com/…")}</pre>`);
docEl.append(dh, dscroll);
const docO = o3(docEl, "E", L.doc, 20);
const envs = [];
for (let i = 0; i < 9; i++) {
  const c = i % 3, r = Math.floor(i / 3);
  const el = h("div", "envc" + (i % 2 === 0 ? " red" : ""), ENV);
  const EB = L.env;
  const o = o3(el, "E", { x: EB.x + c * (EB.cw + EB.g), y: EB.y + r * (EB.ch + EB.g), w: EB.cw, h: EB.ch }, 40);
  envs.push({ o, el });
}
const ENV_T = Array.from({ length: 9 }, (_, i) => 47.6 + i * 0.16);

// ------------------------------------------------------------------ station F: wordmark + search bar
const MARK = `<svg viewBox="0 0 170 170"><g stroke="#F5F5F5" stroke-width="8" stroke-linecap="round"><line x1="85" y1="26" x2="26" y2="140"/><line x1="85" y1="26" x2="144" y2="140"/><line x1="26" y1="140" x2="144" y2="140"/><line x1="85" y1="26" x2="85" y2="100"/><line x1="85" y1="100" x2="26" y2="140"/><line x1="85" y1="100" x2="144" y2="140"/></g>
  <g fill="#FF2A2A"><circle cx="85" cy="26" r="20"/><circle cx="26" cy="140" r="20"/><circle cx="144" cy="140" r="20"/><circle cx="85" cy="100" r="15"/></g></svg>`;
const wmEl = h("div", "wm");
const wtLayers = [];
const wt = h("div", "wt");
for (let k = 8; k >= 1; k--) {
  const ex = h("div", "ex", `<span class="ln">ABDOUL</span><span class="ln r">NETWORK</span>`, { transform: `translate(${k * 1.6}px, ${k * 2.2}px)` });
  wt.append(ex);
  wtLayers.push(ex);
}
wt.append(h("div", "fr", `<span class="ln">ABDOUL</span><span class="ln r">NETWORK</span>`));
const markEl = h("div", "mark", MARK);
wmEl.append(markEl, wt);
const wmO = o3(wmEl, "F", L.wm, 0);
const sbar = h("div", "sbar", `<span class="mag">${MAG_D}</span><span class="tx"></span>`);
const sbarTx = sbar.querySelector(".tx");
const sub = h("span", "sub", `<span class="s1">S'abonner</span><span class="s2">Abonné ✓</span>`);
const sub2 = sub.querySelector(".s2");
sbar.append(sub);
const curE = makeCursor(sbar);
const sbarO = o3(sbar, "F", L.sbar, 0);

// ------------------------------------------------------------------ overlay: titles, counter, glitch
const TITLES = [
  [0.05, "Claude peut retrouver <em>toutes tes photos</em>"],
  [3.55, "J'ai testé sur moi : <em>9 endroits</em>"],
  [6.75, "Étape 1 : <em>un selfie + un prompt</em>"],
  [13.6, "Claude décrit <em>ton visage</em>"],
  [17.75, "L'astuce : <em>le connecteur Chrome</em>"],
  [24.15, "Étape 2 : <em>ton visage + ton nom</em>"],
  [32.2, "Claude ouvre <em>son propre navigateur</em>"],
  [37.0, "Le résultat fait <em>vraiment peur</em>"],
  [39.65, "Le bonus : <em>une demande de retrait</em> par site"],
  [49.65, "Abonne-toi pour <em>plus d'astuces IA</em>"],
];
const overlay = document.getElementById("overlay");
const scrimH = V ? 420 : 250;
overlay.prepend(h("div", "", "", { position: "absolute", left: 0, top: 0, width: "100%", height: px(scrimH),
  background: `linear-gradient(to bottom, rgba(5,5,5,.95) 0, rgba(5,5,5,.88) ${scrimH * 0.62}px, rgba(5,5,5,0) ${scrimH}px)` }));
const titles = TITLES.map(([t0, src], i) => {
  const el = h("div", "title", "", { left: px(L.title.x), top: px(L.title.y), width: px(L.title.w), fontSize: px(L.title.fs) });
  const words = [];
  let inK = false;
  for (const tok of src.split(" ")) {
    let s = tok;
    let k = inK;
    if (s.startsWith("<em>")) { s = s.slice(4); k = true; inK = true; }
    if (s.endsWith("</em>")) { s = s.slice(0, -5); inK = false; }
    const w = h("span", "w" + (k ? " k" : ""), esc(s));
    el.append(w, document.createTextNode(" "));
    words.push(w);
  }
  overlay.append(el);
  const t1 = i + 1 < TITLES.length ? TITLES[i + 1][0] : DUR + 1;
  return { el, words, t0, t1 };
});

const counterEl = h("div", "counter", "", { top: px(L.counter.y), fontSize: px(L.counter.fs), height: px(L.counter.fs) });
const cw = h("div", "cw");
counterEl.append(cw);
overlay.append(counterEl);
const digitStrip = `<span class="digit"><span class="strip">${Array.from({ length: 10 }, (_, d) => `<span>${d}</span>`).join("")}</span></span>`;
const CNT = {
  photos: `<span class="qmark">?</span>PHOTOS`,
  endroits: `${digitStrip}<span class="wd">ENDROITS</span>`,
  astuce: `L'ASTUCE`,
  bonus: `LE BONUS`,
  demandes: `${digitStrip}<span class="wd">DEMANDES</span>`,
};
const CARD_T = Array.from({ length: 9 }, (_, i) => 4.15 + i * 0.19);
const rollCount = (t, times, dur = 0.14) => times.reduce((a, ti) => a + E("power2.out")(clamp((t - ti) / dur)), 0);

const glitch = document.getElementById("glitch");
const GL_WORDS = { astuce: "L'ASTUCE", bonus: "LE BONUS" };
glitch.innerHTML = `<span class="gwrap"><span class="g m"></span><span class="g c"></span><span class="g main"></span></span>`;
const gWrap = glitch.querySelector(".gwrap");
const gM = glitch.querySelector(".g.m"), gC = glitch.querySelector(".g.c"), gMain = glitch.querySelector(".g.main");
[gM, gC, gMain].forEach((g) => (g.style.fontSize = px(L.glitchFs)));
const flash = document.getElementById("flash");
const bgdots = document.getElementById("bgdots");
const glLayer = document.getElementById("gl");
const cssLayer = document.getElementById("css3d");

// ------------------------------------------------------------------ focus points (screen px at a station's home framing)
await document.fonts.ready;
camera.position.set(0, 0, D);
cssRenderer.render(cssScene, camera); // attach every CSS3D element so offsets can be measured
const panelScreen = (el) => {
  const r = relPos(el, front.contains(el) ? front : side);
  return { x: P.x + r.x + r.w / 2, y: P.y + r.y + r.h / 2, w: r.w, h: r.h };
};
const F = {
  home: [W / 2, H / 2],
  in1: (() => { const r = panelScreen(in1); return [r.x, r.y]; })(),
  in2: (() => { const r = panelScreen(in2); return [r.x, r.y]; })(),
  side: (() => { const r = panelScreen(sItems[5]); return [V ? 400 : r.x + 200, r.y - (V ? 120 : 60)]; })(),
  search: (() => { const r = panelScreen(search); return [r.x, r.y + (V ? 60 : 90)]; })(),
  btn: (() => { const r = panelScreen(btn); return [r.x - (V ? 120 : 260), r.y + 20]; })(),
};
const respTop = P.y + iv.resp.t;
// cursor targets inside faces (panel-local px)
const cpos = (el, anc) => { const r = relPos(el, anc); return [r.x + r.w / 2, r.y + r.h / 2]; };
const plus1 = cpos(bar1.querySelector(".plus"), front);
const send1 = cpos(bar1.querySelector(".send"), front);
const send2 = cpos(bar2.querySelector(".send"), front);
const sideCon = cpos(sItems[5], side);
const searchC = cpos(search, side);
const btnC = cpos(btn, side);
const send3 = cpos(c3In.querySelector(".send"), chat3);
const subC = cpos(sub, sbar);

// ------------------------------------------------------------------ camera path
// [t, station, focus[x,y], dist, yaw, pitch, ease into this key]
const CAM = [
  [0.0, "A", F.home, 1.13, -12, 3],
  [3.4, "A", F.home, 0.98, 6, 0, "power2.inOut"],
  [4.3, "A", F.home, 1.03, 0, 1, "power3.inOut"],
  [6.6, "A", F.home, 1.06, -4, 0, "sine.inOut"],
  [7.5, "B", F.home, 1.03, 24, -2, "power3.inOut"],
  [8.4, "B", F.home, 1.0, 0, 0, "power2.out"],
  [9.7, "B", F.in1, 0.86, -3, 2, "power3.inOut"],
  [13.1, "B", F.in1, 0.84, 2, 1, "sine.inOut"],
  [13.95, "B", [W / 2, respTop + (V ? 200 : 140)], 0.92, 0, 0, "power3.inOut"],
  [17.4, "B", [W / 2, respTop + (V ? 470 : 300)], 0.92, -2, 0, "sine.inOut"],
  [18.6, "B", F.home, 1.06, 0, 0, "power3.inOut"],
  [19.4, "B", F.home, 1.0, 0, 0, "power3.inOut"],
  [20.35, "B", F.side, 0.9, 3, 1, "power3.inOut"],
  [21.25, "B", F.search, 0.86, -2, 1, "power3.inOut"],
  [22.05, "B", F.btn, 0.82, 2, 0, "power3.inOut"],
  [23.2, "B", F.btn, 0.81, 0, 0, "sine.inOut"],
  [24.0, "B", F.home, 1.05, 0, 0, "power3.inOut"],
  [25.0, "B", F.in2, 0.95, -2, 1, "power3.inOut"],
  [31.9, "B", F.in2, 0.92, 3, 1, "sine.inOut"],
  [32.45, "B", F.home, 1.12, -6, 0, "power3.inOut"],
  [33.3, "D", F.home, 1.08, 10, 0, "power3.inOut"],
  [36.75, "D", F.home, 0.99, -3, 0, "sine.inOut"],
  [37.35, "A", F.home, 1.0, 0, 0, "expo.inOut"],
  [38.7, "A", F.home, 0.99, 0, 0, "sine.inOut"],
  [38.84, "A", F.home, 0.93, 0, 0, "back.out(2.5)"],
  [39.45, "A", F.home, 0.93, 0, 0, "none"],
  [40.3, "E", F.home, 1.0, -6, 0, "power3.inOut"],
  [45.3, "E", F.home, 0.98, 4, 0, "sine.inOut"],
  [46.0, "E", F.home, 1.0, 0, 0, "power2.inOut"],
  [49.3, "E", F.home, 1.02, 0, 0, "sine.inOut"],
  [50.15, "F", F.home, 1.14, 8, 0, "power3.inOut"],
  [55.7, "F", F.home, 1.0, 0, 0, "expo.out"],
];
const tgtOf = (k) => wpos(k[1], k[2][0], k[2][1]);
const CAMV = CAM.map((k) => ({ t: k[0], p: tgtOf(k), d: k[3], yaw: k[4], pitch: k[5], e: k[6] || "power3.inOut" }));
function camState(t) {
  let a = CAMV[0], b = CAMV[0], p = 0;
  if (t >= CAMV[CAMV.length - 1].t) a = b = CAMV[CAMV.length - 1];
  else for (let i = 1; i < CAMV.length; i++) {
    if (t < CAMV[i].t) { a = CAMV[i - 1]; b = CAMV[i]; p = E(b.e)((t - a.t) / (b.t - a.t)); break; }
  }
  const tg = a.p.clone().lerp(b.p, p);
  // freeze around « peur »: no drift
  const drift = 1 - env(t, 38.86, 39.45, 0.06, 0.12);
  const yaw = lerp(a.yaw, b.yaw, p) + Math.sin(t * 0.45) * 1.1 * drift;
  const pitch = lerp(a.pitch, b.pitch, p) + Math.cos(t * 0.33) * 0.7 * drift;
  return { tg, d: lerp(a.d, b.d, p) * D, yaw, pitch };
}
function camPos(s) {
  const y = (s.yaw * Math.PI) / 180, x = (s.pitch * Math.PI) / 180;
  return new THREE.Vector3(Math.sin(y) * Math.cos(x), Math.sin(x), Math.cos(y) * Math.cos(x)).multiplyScalar(s.d).add(s.tg);
}

// ------------------------------------------------------------------ layout helpers for station A
const gridSlot = (G, i) => {
  const c = i % 3, r = Math.floor(i / 3);
  return { x: G.x + c * (G.cw + G.g) + G.cw / 2, y: G.y + r * (G.ch + G.g) + G.ch / 2, w: G.cw, h: G.ch };
};
const ledAt = (st, l, z = 0) => ({ p: wpos(st, l.cx, l.cy, z), w: l.w });
const LED_S1 = ledAt("A", L.ledS1), LED_S2 = ledAt("A", L.ledS2), LED_S8 = ledAt("A", L.ledS8, 150), LED_END = ledAt("F", L.ledEnd, 30);

// ------------------------------------------------------------------ render(t)
let lastT = -1;
const v3tmp = new THREE.Vector3();
function render(tIn) {
  const t = Math.round(clamp(tIn, 0, DUR) * FPS) / FPS;
  if (t === lastT) return;
  lastT = t;

  // ---- camera (+ speed-based blur for whips)
  const cs = camState(t);
  const cp = camPos(cs);
  camera.position.copy(cp);
  camera.lookAt(cs.tg);
  camera.updateMatrixWorld();
  const cp2 = camPos(camState(Math.max(0, t - 1 / FPS)));
  const speed = cp.distanceTo(cp2);
  const mb = clamp((speed - 25) / 30, 0, 1) * 7;
  const blurV = mb > 0.4 ? `blur(${mb.toFixed(1)}px)` : "none";
  css(glLayer, "filter", blurV);
  css(cssLayer, "filter", blurV);

  // ---- background dots drift with the camera (parallax)
  css(bgdots, "backgroundPosition", `${(-cs.tg.x * 0.05 + t * 5).toFixed(1)}px ${(cs.tg.y * 0.05 - t * 8).toFixed(1)}px`);

  // ---- LED wall
  const inA = t < 7.6 || win(t, 36.7, 40.5);
  let lp, lw;
  if (t < 3.55) { lp = LED_S1.p; lw = LED_S1.w; }
  else if (t < 20) { const q = seg(t, 3.6, 4.35); lp = LED_S1.p.clone().lerp(LED_S2.p, q); lw = lerp(LED_S1.w, LED_S2.w, q); }
  else if (t < 45) { const q = seg(t, 36.85, 37.6); lp = LED_S2.p.clone().lerp(LED_S8.p, q); lw = lerp(LED_S2.w, LED_S8.w, q); }
  else { lp = LED_END.p; lw = LED_END.w; }
  led.pts.visible = inA || t > 49.8;
  led.pts.position.copy(lp);
  led.pts.scale.setScalar(lw);
  led.pts.rotation.y = t < 7 ? Math.sin(t * 0.6) * 0.12 : t > 49 ? Math.sin(t * 0.8) * 0.18 : 0;
  led.u.uW.value = lw;
  led.u.uReveal.value = t > 49 ? lerp(-0.1, 1.1, seg(t, 51.0, 51.9, "power2.out")) : lerp(-0.1, 1.1, seg(t, 0.0, 1.25, "power2.out"));
  // laser scan: down, up, settle — then off
  const L1 = seg(t, 0.35, 1.55, "sine.inOut"), L2 = seg(t, 1.55, 2.65, "sine.inOut");
  const scanSy = t < 1.55 ? lerp(L.laser.y[0], L.laser.y[1], L1) : lerp(L.laser.y[1], L.laser.y[2], L2);
  const scanOn = env(t, 0.3, 3.35, 0.2, 0.35);
  const bustTop = L.ledS1.cy - (L.ledS1.w * 1.25) / 2;
  led.u.uScanY.value = 1 - (scanSy - bustTop) / (L.ledS1.w * 1.25);
  led.u.uScan.value = t < 3.55 ? scanOn : 0;
  const pulse = env(t, 38.74, 39.6, 0.05, 0.5, "power4.out") * 0.8 + env(t, 37.2, 37.9, 0.05, 0.5) * 0.4;
  led.u.uBoost.value = pulse + (t > 49 ? 0.2 : 0);
  laserGlow.visible = laserCore.visible = scanOn > 0;
  const lzp = wpos("A", L.laser.cx, scanSy, 45);
  laserGlow.position.copy(lzp); laserCore.position.copy(lzp);
  laserGlow.scale.set(L.laser.w * 1.15, 150, 1); laserCore.scale.set(L.laser.w, 5, 1);
  laserGlow.material.uniforms.uOpacity.value = 0.75 * scanOn; laserCore.material.opacity = scanOn;

  // ---- corners lock on « idée »
  corners.forEach((c, k) => {
    const lock = seg(t, 2.35 + k * 0.05, 3.0, "expo.out");
    const out = seg(t, 3.5, 3.75, "power2.in");
    c.o.visible = t < 3.8;
    c.o.position.copy(c.o.userData.base).add(v3tmp.set(c.dx * 140 * (1 - lock), c.dy * 140 * (1 - lock), 700 * (1 - lock)));
    css(c.el, "opacity", String(lock * (1 - out)));
  });

  // ---- cards, lines, particles
  const origin = LED_S2.p;
  const toS8 = (i) => seg(t, 36.8 + i * 0.04, 37.45 + i * 0.04, "power3.inOut");
  cards.forEach((c, i) => {
    const ti = CARD_T[i];
    const q = seg(t, ti, ti + 0.45, "expo.out");
    const s2 = gridSlot(L.gridS2, i), s8 = gridSlot(L.gridS8, i);
    const zOff = (i % 2 ? 40 : -40);
    const p2 = wpos("A", s2.x, s2.y, zOff), p8 = wpos("A", s8.x, s8.y, i === 4 ? -60 : zOff * 0.5);
    const k8 = toS8(i);
    const pos = origin.clone().lerp(p2, q).lerp(p8, k8);
    c.grp.position.copy(pos);
    const sw = lerp(s2.w, s8.w, k8), sh = lerp(s2.h, s8.h, k8);
    const sc = lerp(0.15, 1, q);
    c.img.scale.set(sw * sc, sh * sc, 1);
    c.frame.scale.set((sw + 8) * sc, (sh + 8) * sc, 1);
    c.glow.scale.set((sw + 120) * sc, (sh + 120) * sc, 1);
    c.glow.material.uniforms.uOpacity.value = (i % 2 === 0 ? 0.55 : 0.22) * q + pulse * 0.5;
    c.grp.rotation.y = (1 - q) * 0.8 + Math.sin(t * 0.7 + i) * 0.04;
    c.grp.visible = inA && t >= ti;
    const hole = i === 4 ? 1 - toS8(i) : 1;
    c.img.material.opacity = clamp(q * 1.5) * hole;
    c.frame.material.opacity = 0.16 * hole;
    c.glow.material.uniforms.uOpacity.value *= hole;
  });
  const linesOn = env(t, 4.1, 6.9, 0.1, 0.35);
  lines.forEach((m, i) => {
    const ti = CARD_T[i];
    const q = seg(t, ti, ti + 0.45, "expo.out");
    const s2 = gridSlot(L.gridS2, i);
    const end = origin.clone().lerp(wpos("A", s2.x, s2.y, i % 2 ? 40 : -40), q);
    const dx = end.x - origin.x, dy = end.y - origin.y;
    const len = Math.hypot(dx, dy);
    m.position.set((origin.x + end.x) / 2, (origin.y + end.y) / 2, (origin.z + end.z) / 2 - 5);
    m.rotation.z = Math.atan2(dy, dx);
    m.scale.set(Math.max(len, 0.01), 2.5, 1);
    m.visible = linesOn > 0 && t >= ti;
  });
  lineMat.opacity = 0.65 * linesOn;
  for (let i = 0; i < 9; i++) {
    const s2 = gridSlot(L.gridS2, i);
    const end = wpos("A", s2.x, s2.y, i % 2 ? 40 : -40);
    const q = seg(t, CARD_T[i], CARD_T[i] + 0.45, "expo.out");
    for (let k = 0; k < PPL; k++) {
      const f = ((t * 0.9 + k / PPL + i * 0.13) % 1) * q;
      const j = (i * PPL + k) * 3;
      partPos[j] = lerp(origin.x, end.x, f);
      partPos[j + 1] = lerp(origin.y, end.y, f);
      partPos[j + 2] = lerp(origin.z, end.z, f);
    }
  }
  partGeo.attributes.position.needsUpdate = true;
  parts.visible = linesOn > 0;
  parts.material.opacity = 0.9 * linesOn;

  // ---- station B : the Claude cube
  const inB = win(t, 6.3, 33.6);
  cube.visible = inB;
  frontO.visible = sideO.visible = inB;
  const flip = seg(t, 18.55, 19.25, "power3.inOut") - seg(t, 23.95, 24.6, "power3.inOut");
  cube.rotation.y = -flip * (Math.PI / 2);
  // panel entrance (rises from depth) — then subtle float
  cube.position.copy(wpos("B", P.x + P.w / 2, P.y + P.h / 2, -P.w / 2 - 500 * (1 - seg(t, 6.6, 7.6, "expo.out"))));
  css(front, "opacity", String(seg(t, 6.6, 7.2, "power2.out")));
  // views
  const v1o = 1 - seg(t, 13.5, 13.85, "power2.in");
  const v2o = seg(t, 13.6, 13.95, "power2.out");
  const v3k = seg(t, 24.55, 25.05, "power3.inOut");
  css(v1, "opacity", String(v1o));
  css(v1, "transform", `translateY(${-140 * seg(t, 13.5, 13.9, "power2.in")}px)`);
  css(v2, "opacity", String(t < 24 ? v2o : 1));
  css(resp, "transform", `translateY(${-(V ? 140 : 120) * v3k}px)`);
  css(resp, "opacity", String(1 - 0.68 * v3k));
  css(resp, "filter", v3k > 0.01 ? `blur(${(2.2 * v3k).toFixed(2)}px)` : "none");
  css(bub, "opacity", String(1 - v3k));
  css(in0, "opacity", String(1 - v3k));
  css(v3, "opacity", String(v3k));
  css(v3, "transform", `translateY(${60 * (1 - v3k)}px)`);
  // view1 typing
  css(att1, "opacity", String(seg(t, 8.95, 9.2, "power2.out")));
  css(att1, "transform", `scale(${lerp(0.4, 1, seg(t, 8.95, 9.3, "back.out(2)"))})`);
  const n1 = typeN(t, 9.9, 12.95, segLen(P1));
  html(txt1, n1 > 0 ? typed(P1, n1, t < 13.45 && (t < 12.95 || blink(t))) : `<span class="ph">Comment puis-je t'aider aujourd'hui ?</span>`);
  in1.classList.toggle("focus", t > 8.9);
  driveCursor(curF, t, t < 20 ? [[8.0, P.w - 60, P.h - 40], [8.85, plus1[0], plus1[1]], [9.6, plus1[0] + 60, plus1[1] + 30, "power2.inOut"],
    [13.0, plus1[0] + 60, plus1[1] + 30], [13.42, send1[0], send1[1]]] :
    [[31.2, P.w - 60, P.h - 20], [31.95, send2[0], send2[1]]],
  t < 20 ? [8.89, 13.45] : [32.0], t < 20 ? env(t, 8.0, 13.85, 0.25, 0.3) : env(t, 31.2, 32.4, 0.2, 0.3));
  // view2 response
  css(thinking, "opacity", String(env(t, 13.75, 14.25, 0.1, 0.15)));
  css(respH, "opacity", String(seg(t, 13.95, 14.2, "power2.out")));
  respLines.forEach((p, i) => {
    const q = seg(t, DESC_T[i], DESC_T[i] + 0.35, "power1.out");
    css(p, "clipPath", `inset(0 ${(100 - q * 100).toFixed(1)}% 0 0)`);
    if (i === 3) css(p.firstChild, "transform", `scaleX(${seg(t, 16.38, 16.75, "power3.out")})`);
  });
  // view3 prompt 2
  const n2 = typeN(t, 25.1, 31.75, segLen(P2));
  html(txt2, typed(P2, n2, t < 32.0 && (t < 31.75 || blink(t))));
  // pills
  [[pills1, PILL1_T, 6.8, 13.65], [pills2, PILL2_T, 24.5, 32.3]].forEach(([pl, times, a, b]) => {
    const on = win(t, a, b);
    pl.o.visible = on;
    const out = seg(t, b - 0.3, b, "power2.in");
    pl.els.forEach((el, i) => {
      const q = seg(t, times[i], times[i] + 0.45, "back.out(2.2)");
      css(el, "opacity", String(clamp(q * 2) * (1 - out)));
      css(el, "transform", `translateY(${(1 - q) * 40}px) scale(${lerp(0.6, 1, q)})`);
    });
  });
  // settings face
  css(shead.firstElementChild, "transform", `scaleX(${seg(t, 19.45, 19.85, "power3.out")})`);
  const conOn = seg(t, 20.55, 20.8, "power2.out");
  sItems.forEach((li, i) => {
    const a = i === 0 ? 1 - conOn : i === 5 ? conOn : 0;
    css(li.firstElementChild, "opacity", String(a));
    css(li, "color", a > 0.5 ? "#fff" : "#aaa");
  });
  css(gen, "opacity", String(1 - conOn));
  css(con, "opacity", String(conOn));
  css(con, "transform", `translateY(${(1 - conOn) * 30}px)`);
  const qN = typeN(t, 21.55, 21.95, 6);
  html(searchQ, "Chrome".slice(0, qN) + (t > 21.0 && t < 22.2 && (t < 21.95 || blink(t)) ? '<span class="caret"></span>' : ""));
  css(search, "borderColor", t > 21.0 ? "#FF2A2A" : "#45453f");
  const filt = seg(t, 22.0, 22.3, "power2.inOut");
  connEls.forEach((c, i) => { if (i) { css(c, "opacity", String(1 - filt)); css(c, "transform", `translateY(${filt * 30}px)`); } });
  connEls[0].classList.toggle("lit", t > 22.0);
  const inst = seg(t, 22.9, 23.05, "power2.out");
  css(btn1, "opacity", String(1 - inst));
  css(btn2, "opacity", String(inst));
  css(btn, "transform", `scale(${1 + 0.12 * env(t, 22.3, 22.7, 0.08, 0.3) + 0.08 * env(t, 22.95, 23.4, 0.05, 0.35)})`);
  driveCursor(curS, t, [[19.6, P.w - 80, P.h - 60], [20.5, sideCon[0], sideCon[1]], [20.95, searchC[0], searchC[1]], [22.25, btnC[0], btnC[1]], [23.3, btnC[0] + 70, btnC[1] + 60]],
    [20.55, 21.0, 22.3], env(t, 19.6, 23.8, 0.2, 0.4));

  // ---- station D : browsers, list, steps
  const inD = win(t, 32.5, 37.6);
  browsers.forEach((b, k) => {
    const tk = 33.35 + k * 0.42;
    const q = seg(t, tk, tk + 0.6, "expo.out");
    b.o.visible = inD && t >= tk - 0.05;
    b.o.position.copy(b.o.userData.base).add(v3tmp.set(300 * (1 - q), -60 * (1 - q), -900 * (1 - q)));
    b.o.rotation.set(0, b.o.userData.yaw + (1 - q) * 0.6, b.o.userData.roll);
    css(b.el, "opacity", String(clamp(q * 1.6) * (0.55 + 0.15 * k)));
    css(b.scan, "top", `${(((t - tk) * 0.8) % 1) * 100}%`);
  });
  const lq = seg(t, 35.45, 36.0, "expo.out");
  listO.visible = inD && t > 35.4;
  listO.position.copy(listO.userData.base).add(v3tmp.set(0, -80 * (1 - lq), -500 * (1 - lq)));
  css(listEl, "opacity", String(lq));
  css(listLead, "opacity", String(seg(t, 35.6, 35.8)));
  listItems.forEach((li, i) => {
    const q = seg(t, 35.7 + i * 0.105, 35.95 + i * 0.105, "power2.out");
    css(li, "opacity", String(q));
    css(li, "transform", `translateX(${(1 - q) * 30}px)`);
  });
  steps.o.visible = inD;
  steps.els.forEach((el, i) => {
    const q = seg(t, 33.2 + i * 0.08, 33.6 + i * 0.08, "back.out(2)");
    css(el, "opacity", String(q));
    css(el, "transform", `translateY(${(1 - q) * 30}px) scale(${lerp(0.7, 1, q) * (1 + 0.12 * env(t, STEP_T[i], STEP_T[i] + 0.35, 0.06, 0.25))})`);
    const on = t >= STEP_T[i];
    el.classList.toggle("on", on);
    html(el.firstElementChild, on ? "✓" : String(i + 1));
  });

  // ---- station E : chat 3, document, envelopes
  const inE = win(t, 39.5, 50.6);
  chat3O.visible = inE && t < 46.4;
  const c3out = seg(t, 45.6, 46.25, "power3.in");
  chat3O.position.copy(chat3O.userData.base).add(v3tmp.set(0, 0, -700 * c3out));
  css(chat3, "opacity", String(1 - c3out));
  const n3 = typeN(t, 40.55, 45.25, segLen(P3));
  html(txt3, n3 > 0 ? typed(P3, n3, t < 45.5 && (t < 45.25 || blink(t))) : '<span class="caret"></span>');
  driveCursor(curC3, t, [[44.7, (V ? 760 : 1060), (V ? 640 : 590)], [45.45, send3[0], send3[1]]], [45.5], env(t, 44.7, 45.9, 0.2, 0.3));
  const dq = seg(t, 45.75, 46.35, "expo.out");
  docO.visible = inE && t > 45.7;
  docO.position.copy(docO.userData.base).add(v3tmp.set(0, -120 * (1 - dq), 600 * (1 - dq)));
  docO.rotation.set(0, (V ? 0.18 : 0.26) * (1 - 0.4 * dq), -0.04);
  css(docEl, "opacity", String(dq));
  css(dscroll, "transform", `translateY(${-(V ? 1000 : 1000) * seg(t, 46.1, 47.45, "power2.inOut")}px)`);
  html(docN, t < 46.55 ? "1/9" : t < 47.0 ? "2/9" : "3/9");
  const docCenter = docO.userData.base;
  envs.forEach((e, i) => {
    const ti = ENV_T[i];
    const q = seg(t, ti, ti + 0.45, "back.out(1.8)");
    const lin = clamp((t - ti) / 0.45);
    e.o.visible = inE && t >= ti;
    const arc = Math.sin(lin * Math.PI) * 160;
    const sendUp = -env(t, 48.95, 49.45, 0.12, 0.3) * 18;
    const away = seg(t, 49.35, 50.1, "power3.in");
    e.o.position.copy(docCenter.clone().lerp(e.o.userData.base, q)).add(v3tmp.set(0, arc - sendUp + away * 900, 60 + away * -600));
    e.o.rotation.set(0, 0, (1 - q) * (i % 2 ? 0.5 : -0.5));
    css(e.el, "opacity", String(clamp(lin * 3) * (1 - away)));
  });

  // ---- station F : wordmark + search bar
  const inF = t > 49.3;
  const wq = seg(t, 49.85, 50.8, "expo.out");
  wmO.visible = inF;
  wmO.position.copy(wmO.userData.base).add(v3tmp.set(0, 0, -900 * (1 - wq)));
  wmO.rotation.set(0, (35 * (1 - wq) + Math.sin(t * 0.9) * 3 * wq) * (Math.PI / 180), 0);
  css(wmEl, "opacity", String(wq));
  const sq = seg(t, 50.2, 50.8, "expo.out");
  sbarO.visible = inF;
  sbarO.position.copy(sbarO.userData.base).add(v3tmp.set(0, -100 * (1 - sq), -300 * (1 - sq)));
  css(sbar, "opacity", String(sq));
  const nS = typeN(t, 50.65, 51.75, "@abdoulnetwork".length);
  html(sbarTx, esc("@abdoulnetwork".slice(0, nS)) + (t < 53.1 && (t < 51.75 || blink(t)) ? '<span class="caret"></span>' : ""));
  css(sub, "transform", `scale(${1 + 0.1 * env(t, 52.2, 52.7, 0.12, 0.3) - 0.06 * env(t, 53.15, 53.4, 0.05, 0.15)})`);
  css(sub2, "opacity", String(seg(t, 53.25, 53.4, "power2.out")));
  driveCursor(curE, t, [[52.1, (V ? 860 : 860), 160], [53.1, subC[0], subC[1]], [54.0, subC[0] + 40, subC[1] + 50]], [53.2], env(t, 52.1, 55.2, 0.25, 0.5));

  // ---- titles
  titles.forEach((T) => {
    const on = t >= T.t0 - 0.01 && t < T.t1;
    css(T.el, "display", on ? "block" : "none");
    if (!on) return;
    const out = seg(t, T.t1 - 0.22, T.t1, "power2.in");
    T.words.forEach((w, i) => {
      const q = seg(t, T.t0 + i * 0.06, T.t0 + i * 0.06 + 0.5, "expo.out");
      css(w, "opacity", String(q * (1 - out)));
      css(w, "transform", `translateY(${((1 - q) * 26 - out * 16).toFixed(1)}px)`);
      css(w, "filter", q < 0.98 ? `blur(${((1 - q) * 6).toFixed(1)}px)` : "none");
    });
  });

  // ---- counter
  let mode = null, a = 0, tIn0 = 0, value = 0;
  if (win(t, 0.25, 3.55)) { mode = "photos"; a = env(t, 0.25, 3.55, 0.3, 0.2); tIn0 = 0.25; }
  else if (win(t, 4.1, 6.85)) { mode = "endroits"; a = env(t, 4.1, 6.85, 0.15, 0.25); tIn0 = 4.1; value = rollCount(t, CARD_T); }
  else if (win(t, 18.95, 20.45)) { mode = "astuce"; a = env(t, 18.95, 20.45, 0.15, 0.3); tIn0 = 18.95; }
  else if (win(t, 37.2, 39.62)) { mode = "endroits"; a = env(t, 37.2, 39.62, 0.06, 0.2); tIn0 = 37.2; value = 9; }
  else if (win(t, 40.05, 47.5)) { mode = "bonus"; a = env(t, 40.05, 47.5, 0.12, 0.25); tIn0 = 40.05; }
  else if (win(t, 47.6, 49.55)) { mode = "demandes"; a = env(t, 47.6, 49.55, 0.08, 0.3); tIn0 = 47.6; value = rollCount(t, ENV_T); }
  css(counterEl, "display", mode ? "flex" : "none");
  if (mode) {
    html(cw, CNT[mode]);
    const strip = cw.querySelector(".strip");
    if (strip) css(strip, "transform", `translateY(${(-Math.min(value, 9)).toFixed(3)}em)`);
    const wd = cw.querySelector(".wd");
    if (wd) {
      const plural = value > 1.5;
      html(wd, mode === "endroits" ? (plural ? "ENDROITS" : "ENDROIT") : plural ? "DEMANDES" : "DEMANDE");
    }
    const qm = cw.querySelector(".qmark");
    if (qm) {
      const f = Math.round(t * FPS);
      css(qm, "filter", `blur(${(3 + 5 * hash(Math.floor(f / 4))).toFixed(1)}px)`);
      css(qm, "opacity", String(0.55 + 0.45 * hash(Math.floor(f / 3) + 7)));
    }
    const arrive = 1 - seg(t, tIn0, tIn0 + 0.45, "expo.out");
    const bump = mode === "endroits" || mode === "demandes"
      ? (mode === "endroits" && t > 37 ? [37.2] : mode === "endroits" ? CARD_T : ENV_T).reduce((m, ti) => Math.max(m, env(t, ti, ti + 0.25, 0.04, 0.2)), 0) : 0;
    css(counterEl, "opacity", String(a));
    css(cw, "transform", `translateY(${(arrive * 40).toFixed(1)}px) scale(${(1 + arrive * 0.5 + bump * 0.08).toFixed(3)})`);
    css(cw, "filter", arrive > 0.02 || bump > 0.05 ? `blur(${(arrive * 10 + bump * 2).toFixed(1)}px)` : "none");
  }

  // ---- glitch cards (fly through the camera)
  let gk = null, g0 = 0;
  if (win(t, 18.42, 19.1)) { gk = "astuce"; g0 = 18.42; }
  else if (win(t, 39.5, 40.18)) { gk = "bonus"; g0 = 39.5; }
  if (gk) {
    const p = (t - g0) / 0.68;
    html(gMain, GL_WORDS[gk]); html(gC, GL_WORDS[gk]); html(gM, GL_WORDS[gk]);
    const f = Math.round(t * FPS);
    const jitter = p < 0.2 || p > 0.75 ? 1 : 0.25;
    const sc = 0.45 * Math.pow(7, E("power2.in")(p));
    const op = clamp(p / 0.12) * (1 - clamp((p - 0.72) / 0.28));
    css(glitch, "opacity", String(op));
    css(gWrap, "transform", `scale(${sc.toFixed(3)}) translateX(${((hash(f) - 0.5) * 30 * jitter).toFixed(1)}px) skewX(${((hash(f + 3) - 0.5) * 14 * jitter).toFixed(1)}deg)`);
    css(gWrap, "filter", `blur(${(Math.max(0, p - 0.55) * 22).toFixed(1)}px)`);
    css(gC, "transform", `translate(${(-10 - 26 * hash(f + 1) * jitter).toFixed(1)}px, ${((hash(f + 5) - 0.5) * 12 * jitter).toFixed(1)}px)`);
    css(gM, "transform", `translate(${(10 + 26 * hash(f + 2) * jitter).toFixed(1)}px, ${((hash(f + 6) - 0.5) * 12 * jitter).toFixed(1)}px)`);
    const y1 = (hash(f + 9) * 70).toFixed(0), y2 = (Number(y1) + 8 + hash(f + 11) * 20).toFixed(0);
    css(gMain, "clipPath", jitter > 0.5 && hash(f + 13) > 0.35 ? `polygon(0 0,100% 0,100% ${y1}%,0 ${y1}%,0 ${y2}%,100% ${y2}%,100% 100%,0 100%)` : "none");
  } else css(glitch, "opacity", "0");
  const fl = Math.max(env(t, 18.68, 18.86, 0.03, 0.12), env(t, 39.76, 39.94, 0.03, 0.12), env(t, 38.76, 38.95, 0.02, 0.15) * 0.6, env(t, 37.15, 37.35, 0.03, 0.15) * 0.5);
  css(flash, "opacity", (fl * 0.13).toFixed(3));

  renderer.render(scene, camera);
  cssRenderer.render(cssScene, camera);
}

// ------------------------------------------------------------------ clock: GSAP timeline drives a setter proxy
const proxy = {};
let tNow = 0;
Object.defineProperty(proxy, "t", { get: () => tNow, set: (v) => { tNow = v; render(v); } });
const tl = gsap.timeline({ paused: true });
tl.to(proxy, { t: DUR, duration: DUR, ease: "none" }, 0);
window.addEventListener("hf-seek", (e) => render(e.detail.time));
render(0);
window.__timelines["main"] = tl;
