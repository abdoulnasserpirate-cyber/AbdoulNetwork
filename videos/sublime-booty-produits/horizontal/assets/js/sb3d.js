// Sublime Booty ByChris — procedural 3D packaging (jars, bottles, boxes) rendered with Three.js.
// Every frame is drawn from timeline time only: SB3D.stage(...).render(t) is a pure function of t.
(function () {
  const BRAND = { pink: "#FF1A8C", deep: "#C4006A", blush: "#FFD6EA", black: "#0B0508", gold: "#E2B14A", white: "#FFFFFF" };
  let THREE = null;
  let fontsReady = null;

  function loadThree() {
    if (THREE) return Promise.resolve(THREE);
    return import(new URL("assets/vendor/three.module.min.js", document.baseURI).href).then((m) => (THREE = m));
  }

  function loadFonts() {
    if (!fontsReady) {
      fontsReady = Promise.all([
        document.fonts.load('900 120px "SB Display"'),
        document.fonts.load('italic 900 120px "SB Display"'),
        document.fonts.load('800 120px "Poppins"'),
        document.fonts.load('600 120px "Poppins"'),
      ]).catch(() => null);
    }
    return fontsReady;
  }

  // ---------- label artwork ----------
  function fitFont(g, text, weight, family, max, maxWidth) {
    let size = max;
    g.font = `${weight} ${size}px ${family}`;
    while (g.measureText(text).width > maxWidth && size > 10) {
      size -= 4;
      g.font = `${weight} ${size}px ${family}`;
    }
    return size;
  }

  // A wrap-around label: brand line, product name, descriptor. Artwork centred at u = 0.5.
  function labelCanvas(o) {
    const W = o.w || 2048, H = o.h || 900;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    if (o.band) { g.fillStyle = o.band; g.fillRect(0, H * 0.78, W, H * 0.22); }
    if (o.rule) { g.fillStyle = o.rule; g.fillRect(0, H * 0.06, W, 10); g.fillRect(0, H * 0.94 - 10, W, 10); }
    const cx = W / 2, span = o.span || 0.36; // fraction of circumference the artwork occupies
    const maxW = W * span;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = o.ink2 || o.ink;
    fitFont(g, "SUBLIME BOOTY", 800, "Poppins", H * 0.075, maxW);
    g.fillText("SUBLIME BOOTY", cx, H * 0.17);
    g.font = `italic 900 ${Math.round(H * 0.06)}px "SB Display"`;
    g.fillText("ByChris", cx, H * 0.25);
    g.fillStyle = o.ink;
    const lines = o.name.split("\n");
    const lh = lines.length > 1 ? 0.2 : 0.26;
    lines.forEach((ln, i) => {
      fitFont(g, ln, 900, '"SB Display"', H * lh, maxW);
      g.fillText(ln, cx, H * (0.47 + (i - (lines.length - 1) / 2) * lh));
    });
    if (o.sub) {
      g.fillStyle = o.band ? o.bandInk || o.bg : o.ink2 || o.ink;
      fitFont(g, o.sub.toUpperCase(), 800, "Poppins", H * 0.07, maxW);
      g.fillText(o.sub.toUpperCase(), cx, o.band ? H * 0.89 : H * 0.8);
    }
    return c;
  }

  function tex(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }

  function glossy(color, extra) {
    return new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 }, extra || {}));
  }
  function metal(color, rough) {
    return new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: rough == null ? 0.28 : rough });
  }

  function lathe(points, mat, seg) {
    return new THREE.Mesh(new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg || 96), mat);
  }

  // A label sleeve on a cylinder; artwork centre faces the camera (+z).
  function sleeve(r, h, y, canvas, finish) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 96, 1, true),
      new THREE.MeshPhysicalMaterial(Object.assign({ map: tex(canvas), roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15 }, finish || {})),
    );
    m.position.y = y;
    m.rotation.y = Math.PI;
    return m;
  }

  // ---------- packaging ----------
  const BUILD = {
    // Squat cosmetic jar with a lid. p: {body, lid, lidMetal, label:{...}}
    jar(p) {
      const g = new THREE.Group();
      const r = p.r || 0.78, h = p.h || 0.95;
      g.add(lathe([[0, 0], [r - 0.06, 0], [r, 0.06], [r, h - 0.04], [r - 0.05, h], [r - 0.08, h + 0.02], [0, h + 0.02]], glossy(p.body)));
      g.add(sleeve(r + 0.004, h * 0.8, h * 0.48, labelCanvas(Object.assign({ w: 2048, h: Math.round((2048 * h * 0.8) / (2 * Math.PI * r)), span: p.span || 0.3 }, p.label))));
      const lidH = p.lidH || 0.36;
      const lidMat = p.lidMetal ? metal(p.lid, 0.22) : glossy(p.lid);
      const lid = lathe([[0, 0], [r + 0.03, 0], [r + 0.05, 0.03], [r + 0.05, lidH - 0.05], [r, lidH], [0, lidH]], lidMat);
      lid.position.y = h + 0.02;
      g.add(lid);
      return g;
    },
    // Tall tub (cereal / powder).
    tub(p) {
      return BUILD.jar(Object.assign({ r: 0.72, h: 1.75, lidH: 0.3 }, p));
    },
    // Syrup bottle: shoulder, neck, cap.
    bottle(p) {
      const g = new THREE.Group();
      const r = p.r || 0.5, h = p.h || 1.6;
      g.add(lathe([[0, 0], [r - 0.05, 0], [r, 0.05], [r, h], [r * 0.9, h + 0.16], [r * 0.5, h + 0.34], [0.2, h + 0.42], [0.2, h + 0.55], [0, h + 0.55]], glossy(p.body, { transmission: p.glass ? 0.4 : 0, thickness: 0.4 })));
      g.add(sleeve(r + 0.004, h * 0.72, h * 0.5, labelCanvas(Object.assign({ w: 2048, h: Math.round((2048 * h * 0.72) / (2 * Math.PI * r)), span: 0.3 }, p.label))));
      const capMat = p.capMetal ? metal(p.cap, 0.25) : glossy(p.cap);
      const cap = lathe([[0, 0], [0.24, 0], [0.25, 0.02], [0.25, 0.36], [0.22, 0.4], [0, 0.4]], capMat);
      cap.position.y = h + 0.5;
      g.add(cap);
      return g;
    },
    // Dropper bottle (oil / serum).
    dropper(p) {
      const g = BUILD.bottle(Object.assign({ r: 0.42, h: 1.15 }, p));
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), glossy(p.bulb || BRAND.black, { roughness: 0.4 }));
      bulb.scale.set(1, 1.5, 1);
      bulb.position.y = (p.h || 1.15) + 1.08;
      g.add(bulb);
      return g;
    },
    // Pump bottle (lotion).
    pump(p) {
      const g = BUILD.bottle(Object.assign({ r: 0.5, h: 1.75 }, p));
      const h = p.h || 1.75;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 24), metal(p.cap, 0.3));
      stem.position.y = h + 1.02; g.add(stem);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.18), p.capMetal ? metal(p.cap, 0.25) : glossy(p.cap));
      head.position.set(0.12, h + 1.2, 0); g.add(head);
      return g;
    },
    // Printed carton box (tea, kits, suppositories, gaines).
    box(p) {
      const w = p.w || 1.2, h = p.h || 1.6, d = p.d || 0.5;
      const front = labelCanvas(Object.assign({ w: 1024, h: Math.round(1024 * h / w), span: 0.86 }, p.label));
      const side = document.createElement("canvas"); side.width = 256; side.height = 512;
      const sg = side.getContext("2d"); sg.fillStyle = p.label.band || p.label.ink; sg.fillRect(0, 0, 256, 512);
      const plain = glossy(p.label.bg, { roughness: 0.3, clearcoat: 0.6 });
      const sideMat = new THREE.MeshPhysicalMaterial({ map: tex(side), roughness: 0.3, clearcoat: 0.6 });
      const mats = [sideMat, sideMat, plain, plain, new THREE.MeshPhysicalMaterial({ map: tex(front), roughness: 0.3, clearcoat: 0.6 }), plain];
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
      m.position.y = h / 2;
      const g = new THREE.Group(); g.add(m);
      return g;
    },
    // Bar of soap with the name pressed into its face.
    soap(p) {
      const c = labelCanvas(Object.assign({ w: 1024, h: 640, span: 0.8 }, p.label));
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 0.85), [glossy(p.body), glossy(p.body), glossy(p.body), glossy(p.body), new THREE.MeshPhysicalMaterial({ map: tex(c), roughness: 0.5 }), glossy(p.body)]);
      m.position.y = 0.21;
      const g = new THREE.Group(); g.add(m);
      return g;
    },
  };

  // ---------- studio ----------
  function studioEnv(renderer, rimColor) {
    const s = new THREE.Scene();
    s.background = new THREE.Color(0x111111);
    const strip = (x, z, w, h, color, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, 1.5, z); m.lookAt(0, 1.2, 0); s.add(m);
    };
    strip(-5, 4, 1.6, 9, 0xffffff, 3.2);   // key softbox, front left
    strip(5.5, -2, 1.2, 9, rimColor, 4.5); // brand-coloured rim, back right
    strip(0, 7, 6, 1.2, 0xffffff, 1.2);    // low front fill
    const pm = new THREE.PMREMGenerator(renderer);
    return pm.fromScene(s, 0.03).texture;
  }

  function shadowTex() {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(0,0,0,0.6)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return tex(c);
  }

  // stage({canvas, width, height, items:[{kind, ...params, x, y, z, ry, s}], camera:{y, z, lookY, fov}, rim, podium})
  // items[i].pose(t) -> {x,y,z,ry,rx,s} overrides, so motion stays a function of t.
  async function stage(cfg) {
    await loadThree();
    await loadFonts();
    const renderer = new THREE.WebGLRenderer({ canvas: cfg.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(cfg.width, cfg.height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = cfg.exposure || 1.15;
    const scene = new THREE.Scene();
    scene.environment = studioEnv(renderer, cfg.rim || 0xff1a8c);
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-4, 6, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(cfg.rim || 0xff1a8c, 2.2); rim.position.set(5, 3, -4); scene.add(rim);
    const cam = cfg.camera || {};
    const camera = new THREE.PerspectiveCamera(cam.fov || 26, cfg.width / cfg.height, 0.1, 100);
    camera.position.set(cam.x || 0, cam.y == null ? 1.6 : cam.y, cam.z || 11);
    camera.lookAt(cam.lookX || 0, cam.lookY == null ? 1.1 : cam.lookY, 0);
    if (cfg.podium) {
      const pd = cfg.podium;
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(pd.r, pd.r + 0.04, 0.3, 96), glossy(pd.color || BRAND.pink, { roughness: 0.35 }));
      plinth.position.set(pd.x || 0, -0.15, pd.z || 0); scene.add(plinth);
    }
    const sh = shadowTex();
    const objs = cfg.items.map((it) => {
      const holder = new THREE.Group();
      holder.add(BUILD[it.kind](it));
      const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: sh, transparent: true, depthWrite: false }));
      s.rotation.x = -Math.PI / 2; s.position.y = 0.003;
      const shadowGroup = new THREE.Group(); shadowGroup.add(s);
      scene.add(holder); scene.add(shadowGroup);
      return { it, holder, shadowGroup };
    });
    function render(t) {
      for (const o of objs) {
        const base = o.it;
        const q = base.pose ? base.pose(t) : {};
        const p = Object.assign({ x: base.x || 0, z: base.z || 0, rx: 0, rz: 0, shadow: 1 }, q);
        p.y = (base.y || 0) + (q.y || 0);
        p.ry = (base.ry || 0) + (q.ry || 0);
        p.x = (base.x || 0) + (q.x || 0);
        p.s = (base.s || 1) * (q.s == null ? 1 : q.s);
        o.holder.position.set(p.x, p.y, p.z);
        o.holder.rotation.set(p.rx, p.ry, p.rz);
        o.holder.scale.setScalar(p.s);
        o.shadowGroup.position.set(p.x, (base.y || 0) + 0.002, p.z);
        o.shadowGroup.scale.setScalar(p.s * (base.shadowScale || 1));
        o.shadowGroup.visible = p.s > 0.01 && p.shadow > 0;
      }
      renderer.render(scene, camera);
    }
    return { render, THREE, scene, camera };
  }

  // Shared label presets so every scene names the products the same way.
  const L = {
    pink: (name, sub) => ({ bg: BRAND.pink, ink: BRAND.white, ink2: BRAND.black, name, sub, band: BRAND.black, bandInk: BRAND.white }),
    black: (name, sub) => ({ bg: BRAND.black, ink: BRAND.pink, ink2: BRAND.white, name, sub, band: BRAND.pink, bandInk: BRAND.white }),
    gold: (name, sub) => ({ bg: BRAND.black, ink: BRAND.gold, ink2: BRAND.gold, name, sub, rule: BRAND.gold }),
    blush: (name, sub) => ({ bg: BRAND.blush, ink: BRAND.deep, ink2: BRAND.black, name, sub, band: BRAND.pink, bandInk: BRAND.white }),
    white: (name, sub) => ({ bg: "#FFF7FB", ink: BRAND.pink, ink2: BRAND.black, name, sub, band: BRAND.black, bandInk: BRAND.white }),
  };

  // The catalogue: every product shown in the film, named as on the price lists.
  const P = {
    imperiale: { kind: "jar", body: BRAND.black, lid: BRAND.gold, lidMetal: true, label: L.gold("Crème\nImpériale", "Fessier") },
    vip: { kind: "jar", body: BRAND.pink, lid: BRAND.black, label: L.pink("Crème\nVIP", "Fessier") },
    cereales: { kind: "tub", body: BRAND.pink, lid: BRAND.black, span: 0.2, label: L.pink("Booty\nGain", "Céréales") },
    sexyLady: { kind: "bottle", body: BRAND.black, cap: BRAND.pink, label: L.black("Sexy\nLady", "Sirop") },
    priseDePoids: { kind: "bottle", body: BRAND.pink, cap: BRAND.black, label: L.pink("Prise\nde poids", "Sirop") },
    savon: { kind: "soap", body: BRAND.blush, label: L.blush("Savon", "Fessier") },
    suppo: { kind: "box", w: 1.1, h: 1.5, d: 0.45, label: L.white("Ultra\nDosé", "Suppositoires") },
    siropSeins: { kind: "bottle", body: BRAND.blush, cap: BRAND.pink, label: L.blush("Gros\nLolo", "Sirop seins") },
    cremeSeins: { kind: "jar", body: "#FFF7FB", lid: BRAND.pink, label: L.white("Gros\nLolo", "Crème seins") },
    theCaolin: { kind: "box", w: 1.2, h: 1.5, d: 0.5, label: L.black("Thé\nCaolin", "Raffermissant") },
    huile: { kind: "dropper", body: BRAND.gold, cap: BRAND.black, bulb: BRAND.black, glass: true, label: L.black("Huile", "Raffermissante") },
    theVentre: { kind: "box", w: 1.25, h: 1.7, d: 0.5, label: L.pink("Ventre\nPlat", "Thé") },
    cremeVentre: { kind: "jar", body: BRAND.black, lid: BRAND.pink, label: L.black("Ventre\nPlat", "Crème") },
    thePerte: { kind: "box", w: 1.2, h: 1.55, d: 0.5, label: L.white("Perte\nde poids", "Thé") },
    gaineBBL: { kind: "box", w: 1.5, h: 1.9, d: 0.45, label: L.black("Gaine\nBBL", "Silhouette") },
    gaineCulotte: { kind: "box", w: 1.5, h: 1.9, d: 0.45, label: L.pink("Gaine\nCulotte", "Silhouette") },
    royalJar: { kind: "jar", body: BRAND.black, lid: BRAND.gold, lidMetal: true, label: L.gold("Royal\nSkin", "Crème teint") },
    royalSerum: { kind: "dropper", body: BRAND.black, cap: BRAND.gold, capMetal: true, bulb: BRAND.black, label: L.gold("Royal\nSkin", "Sérum") },
    glowPump: { kind: "pump", body: "#FFF7FB", cap: BRAND.pink, label: L.white("Pure\nGlow", "Lait éclaircissant") },
    glowJar: { kind: "jar", body: BRAND.blush, lid: "#FFF7FB", label: L.blush("Pure\nGlow", "Crème teint") },
  };
  const make = (name, extra) => Object.assign({}, P[name], extra);

  // Ease helpers for pose(t) functions.
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const E = {
    expoOut: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp01(x))),
    backOut: (x, s = 1.6) => { x = clamp01(x) - 1; return x * x * ((s + 1) * x + s) + 1; },
    inOut: (x) => { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; },
    p: (t, a, b) => clamp01((t - a) / (b - a)),
  };

  const isPortrait = () => document.documentElement.dataset.resolution !== "landscape";

  // One scene's 3D layer: a paused timeline whose clock tween redraws the stage, plus the build promise.
  // The scene adds its own 2D tweens to the returned timeline, then registers it.
  function timeline3d(id, duration, cfg) {
    const portrait = isPortrait();
    const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080;
    const pick = (v) => (v && (v.portrait || v.landscape) ? (portrait ? v.portrait : v.landscape) : v);
    const clock = { t: 0 };
    let st = null;
    const tl = gsap.timeline({ paused: true });
    tl.to(clock, { t: duration, duration, ease: "none", onUpdate: () => st && st.render(clock.t) }, 0);
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady[id] = stage({
      canvas: document.getElementById(cfg.canvas), width: W, height: H,
      items: pick(cfg.items), camera: pick(cfg.camera), podium: pick(cfg.podium), rim: cfg.rim, exposure: cfg.exposure,
    }).then((s) => { st = s; s.render(clock.t); });
    return tl;
  }

  // Standard entrance poses, all functions of t.
  const drop = (t0, spin) => (t) => {
    const k = E.backOut(E.p(t, t0, t0 + 0.55), 1.3);
    return { y: (1 - k) * 4, ry: -0.6 + 0.6 * E.expoOut(E.p(t, t0, t0 + 0.9)) + (spin == null ? 0.06 : spin) * t };
  };
  const spinIn = (t0) => (t) => {
    const k = E.expoOut(E.p(t, t0, t0 + 0.7));
    return { s: k, ry: (1 - k) * -Math.PI * 1.5 + 0.08 * t };
  };

  window.SB3D = { timeline3d, isPortrait, drop, spinIn, stage, BUILD, L, E, BRAND, P, make };
})();
