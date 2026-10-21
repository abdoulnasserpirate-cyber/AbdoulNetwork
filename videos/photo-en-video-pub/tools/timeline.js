(function () {
  const V = ORIENT === "V";
  const DUR = 67.5, F = 1 / 30;
  const $ = (s) => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const tl = gsap.timeline({ paused: true });
  // seeded PRNG (mulberry32) — deterministic "random" placement
  let seed = 1234567;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const reps = (total, cycle) => Math.max(0, Math.floor(total / cycle) - 1);

  // ------------------------------------------------ generic entrances / exits
  const NEUTRAL = { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0, filter: "blur(0px)", clipPath: "inset(0% 0% 0% 0%)" };
  const IN = {
    word: [{ opacity: 0, y: 50, scale: 0.8, rotation: 4, filter: "blur(8px)" }, { duration: 0.42, ease: "back.out(2.6)" }],
    pop: [{ opacity: 0, scale: 0.3 }, { duration: 0.5, ease: "back.out(2.2)" }],
    rise: [{ opacity: 0, y: 110, filter: "blur(12px)" }, { duration: 0.6, ease: "power3.out" }],
    rise3d: [{ opacity: 0, y: 420, rotationX: 38, rotationY: -14, transformPerspective: 1400 }, { duration: 0.9, ease: "power3.out" }],
    slideL: [{ opacity: 0, x: -260, filter: "blur(14px)" }, { duration: 0.55, ease: "power3.out" }],
    drop: [{ opacity: 0, y: -520, rotation: -12 }, { duration: 0.75, ease: "bounce.out" }],
    stamp: [{ opacity: 0, scale: 2.4, rotation: -22 }, { duration: 0.3, ease: "power4.in" }],
    elastic: [{ opacity: 0, scale: 0 }, { duration: 1.0, ease: "elastic.out(1, 0.45)" }],
    mask: [{ clipPath: "inset(0% 100% 0% 0%)" }, { duration: 0.55, ease: "power3.out" }],
    zoom: [{ opacity: 0, scale: 1.7, filter: "blur(18px)" }, { duration: 0.6, ease: "expo.out" }],
    logo: [{ opacity: 0, scale: 0.6, filter: "blur(20px)" }, { duration: 1.0, ease: "expo.out" }],
  };
  function enter(el, t, kind) {
    const [from, opts] = IN[kind];
    const to = {};
    for (const k in from) if (k in NEUTRAL) to[k] = NEUTRAL[k];
    if (kind === "stamp") to.rotation = el.classList.contains("sticker") ? -3 : (el.classList.contains("stamp") ? -6 : 0);
    tl.fromTo(el, Object.assign({}, from), Object.assign(to, opts), t);
  }
  $$("[data-at]").forEach((el) => enter(el, parseFloat(el.dataset.at), el.dataset.in || (el.classList.contains("w") ? "word" : "pop")));
  $$("[data-out]").forEach((el) => {
    tl.to(el, { opacity: 0, scale: 0.9, filter: "blur(12px)", duration: 0.3, ease: "power2.in" }, parseFloat(el.dataset.out));
  });
  // continuous float on wrappers so nothing is ever static
  $$("[data-float]").forEach((el, i) => {
    const sc = el.closest(".scene");
    const s = parseFloat(sc.dataset.start), d = parseFloat(sc.dataset.duration);
    const amp = parseFloat(el.dataset.float), cyc = 1.5 + (i % 3) * 0.25;
    tl.fromTo(el, { y: 0 }, { y: -amp, duration: cyc, ease: "sine.inOut", yoyo: true, repeat: reps(d, cyc) }, s);
  });

  // ------------------------------------------------ backgrounds / camera / signature
  tl.to("#grid", { backgroundPosition: "0px 900px", duration: DUR, ease: "none" }, 0);
  tl.to("#halo1", { scale: 1.18, x: -60, duration: 4, yoyo: true, repeat: reps(DUR, 4), ease: "sine.inOut" }, 0);
  tl.to("#halo3", { scale: 1.2, x: 80, duration: 3.5, yoyo: true, repeat: reps(DUR, 3.5), ease: "sine.inOut" }, 0);
  $$(".pt").forEach((p) => {
    const c = 3 + rnd() * 3;
    tl.to(p, { y: -(120 + rnd() * 260), x: (rnd() - 0.5) * 120, duration: c, yoyo: true, repeat: reps(DUR, c), ease: "sine.inOut" }, 0);
  });
  tl.to("#cam", { scale: 1.035, duration: 5, yoyo: true, repeat: reps(DUR, 5), ease: "sine.inOut" }, 0);
  function shake(t, a) {
    tl.to("#shake", { keyframes: [{ x: a, y: -a * 0.6, rotation: 0.5 }, { x: -a * 0.8, y: a * 0.5, rotation: -0.4 }, { x: a * 0.5, y: a * 0.3, rotation: 0.2 },
      { x: -a * 0.3, y: -a * 0.2, rotation: 0 }, { x: 0, y: 0, rotation: 0 }], duration: 0.36, ease: "none" }, t);
  }
  function flash(t, o) { tl.fromTo("#flash", { opacity: o || 1 }, { opacity: 0, duration: 2 * F + 0.08, ease: "power1.in", immediateRender: false }, t); }
  // diagonal slash sweep (orange band + white streak)
  function slash(t, dir) {
    const r = dir < 0 ? 24 : -24;
    tl.fromTo("#slash", { rotation: r, xPercent: -110 * (dir || 1) }, { xPercent: 110 * (dir || 1), duration: 0.5, ease: "power2.inOut", immediateRender: false }, t);
    tl.fromTo("#slash2", { rotation: r, xPercent: -110 * (dir || 1) }, { xPercent: 110 * (dir || 1), duration: 0.42, ease: "power2.inOut", immediateRender: false }, t + 0.06);
  }
  tl.set("#slash", { rotation: -24, xPercent: -110 }, 0);
  tl.set(".x-line", { rotation: -35, scaleX: 0 }, 0);
  tl.set("#s2dlF, #s1barF, #s5b1, #s5b2", { scaleX: 0 }, 0);
  tl.set("#s6mus .wave i", { scaleY: 0.3 }, 0);
  tl.set("#s5light", { xPercent: -150, skewX: -12 }, 0);
  tl.set("#slash2", { rotation: -24, xPercent: -110 }, 0);
  const LIGHT_IN = ["polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)", "polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)"];
  const LIGHT_OUT = ["polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)", "polygon(130% 0%, 130% 0%, 100% 100%, 100% 100%)"];
  function toLight(t) {
    tl.fromTo("#bgLight", { clipPath: LIGHT_IN[0] }, { clipPath: LIGHT_IN[1], duration: 0.55, ease: "power3.inOut", immediateRender: false }, t);
    tl.to("#sigN", { color: "#0B1026", duration: 0.3 }, t + 0.2);
    slash(t, 1);
  }
  function toDark(t) {
    tl.fromTo("#bgLight", { clipPath: LIGHT_OUT[0] }, { clipPath: LIGHT_OUT[1], duration: 0.55, ease: "power3.inOut", immediateRender: false }, t);
    tl.to("#sigN", { color: "#FFFFFF", duration: 0.3 }, t + 0.2);
    slash(t, 1);
  }
  // signature slides in at the start, then stays
  tl.fromTo("#sig", { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.25);
  tl.to("#sigAv", { scale: 1.06, duration: 1.2, yoyo: true, repeat: reps(DUR - 1.2, 1.2), ease: "sine.inOut" }, 1.2);

  // whip-pan helper: content of a scene leaves sideways with blur
  function whipOut(sel, t) { tl.to(sel, { x: V ? -700 : -1100, filter: "blur(30px)", duration: 0.3, ease: "power2.in" }, t); }
  function zoomThrough(sel, t) { tl.to(sel, { scale: 2.2, opacity: 0, filter: "blur(24px)", duration: 0.35, ease: "power2.in" }, t); }

  // ================================================= S1 hook
  flash(0, 1);
  shake(0.02, 10);
  tl.to("#s1roll", { y: -700, duration: 0.9, ease: "power3.out" }, 1.25);
  tl.to("#s1roll", { opacity: 0.2, duration: 0.12, yoyo: true, repeat: 7, ease: "steps(1)" }, 2.2);
  tl.to("#s1postW", { opacity: 0.35, scale: 0.9, filter: "blur(5px)", duration: 0.25 }, 2.21);
  tl.to("#s1postW", { opacity: 0, scale: 0.8, filter: "blur(16px)", duration: 0.3 }, 3.2);
  shake(2.21 + 0.3, 26);
  flash(2.21 + 0.28, 0.5);
  tl.fromTo("#s1zeroT", { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 13, ease: "none", immediateRender: false }, 2.55);
  // photo card: slash on "photo"
  slash(4.27, 1);
  shake(4.07 + 0.55, 8);
  // card breathing zoom on the image
  tl.fromTo("#s1card .m-img", { scale: 1 }, { scale: 1.08, duration: 3.4, ease: "sine.inOut" }, 4.1);
  // glitch RGB (1 of 2) on "vidéo" → morph into a 9:16 video frame
  const G = 7.6;
  const slices = ["inset(10% 0% 62% 0%)", "inset(48% 0% 20% 0%)", "inset(0% 0% 75% 0%)", "inset(30% 0% 40% 0%)", "inset(70% 0% 5% 0%)"];
  slices.forEach((c, i) => {
    tl.set("#s1card .g1", { opacity: 0.9, x: (i % 2 ? -1 : 1) * (14 + i * 4), clipPath: c }, G + i * F);
    tl.set("#s1card .g2", { opacity: 0.9, x: (i % 2 ? 1 : -1) * (18 + i * 3), clipPath: slices[(i + 2) % 5] }, G + i * F);
    tl.set("#s1cardW", { x: (i % 2 ? -10 : 10) }, G + i * F);
  });
  tl.set("#s1card .g1, #s1card .g2", { opacity: 0, x: 0 }, G + 5 * F);
  tl.set("#s1cardW", { x: 0 }, G + 5 * F);
  const M = V ? { left: 290, top: 540, width: 400, height: 711 } : { left: 1185, top: 110, width: 450, height: 800 };
  tl.to("#s1cardW", Object.assign({ duration: 0.55, ease: "expo.inOut" }, M), G + 2 * F);
  tl.to("#s1play", { opacity: 1, duration: 0.01 }, G + 0.5);
  tl.fromTo("#s1play", { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(2.5)", immediateRender: false }, G + 0.5);
  tl.to("#s1play", { scale: 1.12, duration: 0.45, yoyo: true, repeat: 5, ease: "sine.inOut" }, G + 1.1);
  tl.to("#s1bar", { opacity: 1, duration: 0.3 }, G + 0.6);
  tl.to("#s1barF", { scaleX: 1, duration: 2.8, ease: "none" }, G + 0.6);
  tl.to("#s1camX", { scaleX: 1, duration: 0.25, ease: "power3.out" }, 9.17);
  tl.to("#s1cutX", { scaleX: 1, duration: 0.25, ease: "power3.out" }, 10.42);
  tl.to("#s1cam", { opacity: 0.55, duration: 0.3 }, 9.42);
  tl.to("#s1cut", { opacity: 0.55, duration: 0.3 }, 10.67);
  toLight(10.95);

  // ================================================= S2 step 1
  tl.to("#s2dlF", { scaleX: 1, duration: 1.55, ease: "power1.inOut" }, 12.8);
  const pct2 = { v: 0 };
  tl.to(pct2, { v: 100, duration: 1.55, ease: "power1.inOut", onUpdate: () => { $("#s2pct").textContent = Math.round(pct2.v) + "%"; } }, 12.8);
  tl.to("#s2dl", { opacity: 0, y: 40, duration: 0.3 }, 14.45);
  tl.to("#s2ok", { opacity: 1, duration: 0.01 }, 14.39);
  tl.fromTo("#s2ok", { scale: 0 }, { scale: 1, duration: 0.55, ease: "back.out(3)", immediateRender: false }, 14.39);
  tl.to("#s2ok", { opacity: 0, scale: 0.6, duration: 0.25 }, 15.3);
  tl.to("#s2scr2", { opacity: 1, duration: 0.4 }, 14.65);
  tl.fromTo("#s2scr2", { y: 0 }, { y: -160, duration: 2.6, ease: "sine.inOut" }, 15.0);
  shake(16.85, 14);
  // registry confetti burst (catalog component "confetti"), seeded directions
  const parts = $$("#s2burst .particle");
  tl.fromTo(parts, { "--hf-po": 1, "--hf-px": "0px", "--hf-py": "0px", "--hf-pr": "0deg" },
    { "--hf-po": 1, "--hf-px": (i) => Math.cos(i * 0.83) * (220 + (i % 4) * 60) + "px", "--hf-py": (i) => (-140 - Math.sin(i * 0.61) * 180) + "px",
      "--hf-pr": (i) => 180 + i * 37 + "deg", duration: 0.8, stagger: 0.012, ease: "power2.out", immediateRender: false }, 16.86);
  tl.to(parts, { "--hf-py": (i) => (260 + (i % 5) * 40) + "px", "--hf-po": 0, duration: 0.9, ease: "power1.in" }, 17.75);
  tl.set(parts, { "--hf-po": 0 }, 0);
  toDark(17.85);

  // ================================================= S3 step 2
  tl.to("#s3btn", { scale: 1.18, boxShadow: "0 0 0 10px rgba(255,122,26,.35)", backgroundColor: "rgba(255,122,26,.25)", duration: 0.35, ease: "back.out(3)" }, 19.78);
  tl.to("#s3btn", { scale: 0.92, duration: 0.1, ease: "power2.in" }, 20.5);
  tl.to("#s3btn", { scale: 1, backgroundColor: "#FF7A1A", color: "#0B1026", duration: 0.3, ease: "back.out(3)" }, 20.6);
  tl.fromTo("#s3rip", { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 2.6, duration: 0.6, ease: "power2.out", immediateRender: false }, 20.5);
  // the product photo flies in an arc into the upload zone
  tl.set("#s3fly", { opacity: 1 }, 21.85);
  tl.fromTo("#s3fly", { x: V ? 420 : 520, y: V ? -520 : -380, rotation: -28, scale: 1.5 },
    { keyframes: [{ x: V ? 260 : 380, y: V ? -620 : -460, rotation: -14, scale: 1.35, duration: 0.18 }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.32 }],
      ease: "power2.inOut", immediateRender: false }, 21.85);
  tl.set("#s3fly", { opacity: 0 }, 0);
  tl.set("#s3fly", { opacity: 1 }, 21.85);
  tl.fromTo("#s3up", { borderColor: "rgba(255,255,255,.35)" }, { borderColor: "#FF7A1A", duration: 0.2, immediateRender: false }, 22.3);
  shake(22.32, 7);
  // phone + photo leave with a whip
  whipOut("#s3phoneW", 23.0);
  tl.to("#s3fly", { x: V ? -700 : -1100, filter: "blur(30px)", duration: 0.3, ease: "power2.in" }, 23.0);
  // separator glides left → right: blurry/dark on the left, sharp on the right
  tl.to("#s3blur", { clipPath: "inset(0% 50% 0% 0%)", duration: 0.7, ease: "power3.inOut" }, 24.72);
  tl.fromTo("#s3sep", { x: 0 }, { x: V ? 414 : 404, duration: 0.7, ease: "power3.inOut" }, 24.72);
  tl.to("#s3cmp", { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 26.58);
  tl.to("#s3cmp", { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 27.36);
  zoomThrough("#s3cmpW", 27.75);
  toLight(28.0);

  // ================================================= S4 prompt (hero)
  tl.fromTo("#s4pill", { "--shimmer-pos": "-20%" }, { "--shimmer-pos": "120%", duration: 0.9, ease: "power2.inOut", immediateRender: false }, 29.71);
  tl.fromTo("#s4pill", { "--shimmer-pos": "-20%" }, { "--shimmer-pos": "120%", duration: 0.9, ease: "power2.inOut", immediateRender: false }, 31.2);
  tl.set("#s4pill", { "--shimmer-pos": "-20%" }, 0);
  tl.to("#s4pill", { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 }, 29.71);
  // typewriter: one char at a time at its scripted time, cursor rides the last char
  const chars = $$("#s4card .ch");
  chars.forEach((c, i) => {
    const t = parseFloat(c.dataset.tw);
    tl.set(c, { opacity: 1, attr: { "data-c": 1 } }, t);
    if (i < chars.length - 1) tl.set(c, { attr: { "data-c": 0 } }, parseFloat(chars[i + 1].dataset.tw));
  });
  tl.to("#s4card", { "--cb": 0, duration: 0.4, yoyo: true, repeat: reps(9.4, 0.4), ease: "steps(1)" }, 33.3);
  $$("#s4card .kw").forEach((k) => {
    const t = parseFloat(k.dataset.hl);
    tl.to(k, { color: "#FF7A1A", backgroundSize: "100% 100%", duration: 0.35, ease: "power2.out" }, t + 0.05);
  });
  // orbiting icon chips drift around the card
  ["#s4i1", "#s4i2", "#s4i3", "#s4i4"].forEach((s, i) => {
    tl.to(s, { rotation: i % 2 ? -10 : 10, x: i % 2 ? 14 : -14, duration: 1.6, yoyo: true, repeat: 3, ease: "sine.inOut" }, [34.6, 36.6, 38.2, 41.3][i]);
  });
  tl.to("#s4stk", { y: -14, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, 40.4);
  toDark(42.65);

  // ================================================= S5 result
  tl.to("#s5arc", { strokeDashoffset: 0, duration: 1.4, ease: "power1.inOut" }, 43.0);
  const pct5 = { v: 0 };
  tl.to(pct5, { v: 100, duration: 1.4, ease: "power1.inOut", onUpdate: () => { $("#s5pct").textContent = Math.round(pct5.v) + "%"; } }, 43.0);
  tl.fromTo("#s5scan", { y: -120 }, { y: V ? 790 : 830, duration: 0.7, ease: "none", repeat: 1, immediateRender: false }, 43.0);
  // reveal: flash + slash + glitch (2 of 2)
  flash(44.5, 1);
  slash(44.5, -1);
  shake(44.52, 16);
  tl.set("#s5res", { opacity: 1 }, 44.5);
  [12, -18, 9, -6, 0].forEach((dx, i) => {
    tl.set("#s5res", { x: dx, filter: i < 4 ? `hue-rotate(${(i + 1) * 70}deg) saturate(2.5)` : "none" }, 44.5 + i * F);
  });
  tl.fromTo("#s5res", { scale: 1.25 }, { scale: 1, duration: 0.7, ease: "expo.out", immediateRender: false }, 44.5);
  // simulated product clip: slow push-in, 3D sway, studio light sweep, drops, steam
  tl.fromTo("#s5obj", { scale: 1.05, rotationY: -14, transformPerspective: 1200 }, { scale: 1.2, rotationY: 14, duration: 3.6, ease: "sine.inOut" }, 44.5);
  tl.fromTo("#s5bg", { scale: 1.2, x: 20 }, { scale: 1.3, x: -30, duration: 3.6, ease: "sine.inOut" }, 44.5);
  tl.fromTo("#s5light", { xPercent: -150 }, { xPercent: 420, duration: 1.3, ease: "power1.inOut", repeat: 2, immediateRender: false }, 44.6);
  $$("#s5res .drop").forEach((d) => {
    const x = 4 + rnd() * 92, dl = rnd() * 1.0, c = 0.7 + rnd() * 0.5;
    tl.set(d, { left: x + "%" }, 0);
    tl.fromTo(d, { y: 0, opacity: 0.9 }, { y: V ? 900 : 950, duration: c, ease: "power1.in", repeat: 3, immediateRender: false }, 44.5 + dl);
  });
  $$("#s5res .steam").forEach((s, i) => {
    tl.fromTo(s, { y: 60, opacity: 0, scale: 0.7 }, { y: -260, opacity: 1, scale: 1.3, duration: 1.6, ease: "sine.out", repeat: 1, immediateRender: false }, 44.6 + i * 0.4);
  });
  // FLIP into the right half for the before/after split
  const R = V ? { left: 500, top: 545, width: 420, height: 580 } : { left: 1420, top: 120, width: 420, height: 700 };
  tl.to("#s5res", Object.assign({ duration: 0.55, ease: "expo.inOut" }, R), 46.07);
  tl.fromTo("#s5b1", { scaleX: 0 }, { scaleX: 0.18, duration: 0.5, ease: "power2.out", immediateRender: false }, 46.8);
  tl.fromTo("#s5b2", { scaleX: 0 }, { scaleX: 0.96, duration: 0.6, ease: "back.out(1.4)", immediateRender: false }, 47.5);
  toLight(48.27);

  // ================================================= S6 step 4
  tl.fromTo("#s6prevI", { scale: 1.1 }, { scale: 1.3, duration: 5, ease: "sine.inOut" }, 49.0);
  tl.to("#s6price", { rotation: -6, duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut" }, 50.9);
  tl.to("#s6note", { rotation: 14, y: -8, duration: 0.3, yoyo: true, repeat: 7, ease: "sine.inOut" }, 52.5);
  $$("#s6mus .wave i").forEach((b, i) => {
    tl.fromTo(b, { scaleY: 0.25 }, { scaleY: 1, duration: 0.22 + i * 0.04, yoyo: true, repeat: 7, ease: "sine.inOut", immediateRender: false }, 52.4 + i * 0.05);
  });
  shake(53.97, 10);
  toDark(54.75);

  // ================================================= S7 bonus + CTA
  tl.fromTo("#s7line", { strokeDasharray: 1100, strokeDashoffset: 1100 }, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 57.0);
  tl.fromTo("#s7area", { opacity: 0 }, { opacity: 1, duration: 1.0, ease: "power1.out" }, 57.4);
  tl.fromTo("#s7rev", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 58.2);
  $$("#s7curve .coin").forEach((c, i) => {
    const x = 18 + rnd() * 74, t = 57.3 + i * 0.13;
    tl.set(c, { left: x + "%" }, 0);
    tl.fromTo(c, { opacity: 1, y: -120, rotation: -40 }, { y: (V ? 560 : 620) - (i % 3) * 30, rotation: 360, duration: 0.7, ease: "bounce.out", immediateRender: false }, t);
  });
  tl.to("#s7shop", { scale: 1.1, duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" }, 57.4);
  // comment flood: each new bubble enters at the bottom, the stack climbs
  const B = [59.61, 60.2, 60.6, 61.0, 61.4], SLOT = 155;
  B.forEach((t, i) => {
    tl.fromTo("#s7b" + i, { opacity: 0, y: 80, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, t);
    for (let j = 0; j < i; j++) tl.to("#s7b" + j, { y: -(i - j) * SLOT, duration: 0.35, ease: "power3.out" }, t);
  });
  tl.fromTo("#s7b0 .b-t", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "steps(7)", immediateRender: false }, 59.61);
  tl.to("#s7bubs", { y: -10, duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut" }, 61.9);
  tl.to("#s7save .cta-i", { rotation: -8, scale: 1.08, duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut" }, 63.9);
  tl.to("#s7sub .cta-i", { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: "sine.inOut" }, 65.1);
  // end lockup
  tl.fromTo("#s7halo", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 65.6);
  tl.to("#s7halo", { scale: 1.12, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, 66.8);
  tl.to("#s7logo", { scale: 1.04, duration: 1.0, ease: "sine.inOut" }, 66.6);
  shake(65.62, 6);

  window.__timelines["main"] = tl;
})();
