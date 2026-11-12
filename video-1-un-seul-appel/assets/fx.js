/* Allô — bibliothèque partagée : icônes (un seul style : glyphes pleins arrondis, grille 100)
   et gestes de motion réutilisés par toutes les scènes. Déterministe, sans horloge. */
(function () {
  const HANDSET = "M27 9C31 7 35 8 37 12L45 28C47 32 46 36 42 39L36 43C40 54 47 62 57 67L62 61C65 58 69 57 73 59L88 67C92 69 93 74 91 78L86 87C83 92 77 94 71 93C42 87 14 59 8 29C7 23 9 17 14 14Z";
  function scalePath(d, s, tx, ty) {
    let i = 0;
    return d.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 0 ? +n * s + tx : +n * s + ty).toFixed(2));
  }
  const ICONS = {
    handset: [HANDSET],
    box: ["M50 6L90 26L90 74L50 94L10 74L10 26ZM13 28.5L50 47L87 28.5L87 32.5L50 51L13 32.5ZM48 51.5L52 51.5L52 92L48 92ZM65 13.5L71 16.5L37 33.5L31 30.5Z"],
    bag: ["M22 34L78 34L73 88L27 88ZM40 50L60 50L60 55L40 55Z",
          "M36 34L36 26C36 16 42 10 50 10C58 10 64 16 64 26L64 34L58 34L58 26C58 20 55 16 50 16C45 16 42 20 42 26L42 34Z"],
    doc: ["M24 8L62 8L80 26L80 92L24 92ZM63 12L63 25L76 25ZM34 44L70 44L70 50L34 50ZM34 58L70 58L70 64L34 64ZM34 72L58 72L58 78L34 78Z"],
    // repas : assiette vue du dessus (plat garni) + fourchette + couteau
    meal: ["M22 50a28 28 0 1 0 56 0a28 28 0 1 0-56 0zM27 50a23 23 0 1 0 46 0a23 23 0 1 0-46 0z",
           "M31 50a19 19 0 1 0 38 0a19 19 0 1 0-38 0zM40 42a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0zM50 38a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0zM56 48a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0zM38 54a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0zM47 58C47 52 53 49 58 52C55 57 51 60 47 58Z",
           "M5 12H8V32H10V12H13V32H15V12H18V35C18 40 15 43 13.5 44V88C13.5 91 9.5 91 9.5 88V44C8 43 5 40 5 35Z",
           "M85 10C92 15 95 28 94 44L90 47V88C90 91 86 91 86 88V10Z"],
    moto: ["M16 66C16 57 23 52 32 52L55 52L63 34L72 34L72 39L67 39L61 53L82 66L78 71L60 60L57 66Z",
           "M14 74a12 12 0 1 0 24 0a12 12 0 1 0-24 0zM21 74a5 5 0 1 0 10 0a5 5 0 1 0-10 0z",
           "M64 74a12 12 0 1 0 24 0a12 12 0 1 0-24 0zM71 74a5 5 0 1 0 10 0a5 5 0 1 0-10 0z",
           "M60 29L79 29L79 35L60 35Z", "M8 28L36 28L36 50L8 50ZM13 37L31 37L31 40L13 40Z", "M28 45L54 45L54 51L28 51Z"],
    wa: ["M50 8C73 8 92 27 92 50C92 73 73 92 50 92C42 92 35 90 29 86L10 92L16 74C11 67 8 59 8 50C8 27 27 8 50 8Z" +
         scalePath(HANDSET, 0.5, 25, 25)],
    shirt: ["M34 12L16 20L6 38L20 46L26 38L26 90L74 90L74 38L80 46L94 38L84 20L66 12C64 19 58 24 50 24C42 24 36 19 34 12Z"],
    iron: ["M10 76C10 54 26 38 50 38L88 38L88 76ZM58 48L80 48L80 54L58 54Z",
           "M36 36C36 24 44 18 56 18L86 18L86 26L58 26C50 26 46 30 46 36Z"],
    pin: ["M50 6C66 6 78 18 78 34C78 56 50 94 50 94C50 94 22 56 22 34C22 18 34 6 50 6ZM38 34a12 12 0 1 0 24 0a12 12 0 1 0-24 0z"],
    calendar: ["M12 20L88 20L88 90L12 90ZM18 38L82 38L82 84L18 84Z", "M28 10L36 10L36 28L28 28Z", "M64 10L72 10L72 28L64 28Z"],
    route: ["M50 6C66 6 78 18 78 34C78 56 50 94 50 94C50 94 22 56 22 34C22 18 34 6 50 6Z"],
  };
  // Silhouettes à un seul tracé, pour les morphs (MorphSVG)
  const SIL = {
    handset: HANDSET,
    wa: ICONS.wa[0].split("Z")[0] + "Z",
    moto: "M8 28L36 28L36 45L55 45L63 34L60 34L60 29L79 29L79 35L72 35L67 46L84 62C92 64 96 70 94 78C92 86 84 90 76 88C70 86 66 81 65 75L39 75C38 82 32 88 25 88C17 88 12 82 12 74C12 70 13 67 15 64C11 60 8 55 8 50Z",
    box: "M50 6L90 26L90 74L50 94L10 74L10 26Z",
  };

  function svgIcon(name, extra) {
    const ps = ICONS[name].map((d) => `<path d="${d}"/>`).join("");
    return `<svg class="ico ${extra || ""}" viewBox="0 0 100 100">${ps}</svg>`;
  }
  // remplit tous les [data-icon] d'un conteneur
  function mountIcons(root) {
    root.querySelectorAll("[data-icon]").forEach((el) => { if (!el.firstChild) el.innerHTML = svgIcon(el.dataset.icon); });
  }
  // découpe un texte en lettres (spans non temporisés)
  function letters(el) {
    if (el.dataset.split) return el.querySelectorAll(".ch");
    const txt = el.textContent; el.textContent = "";
    [...txt].forEach((c) => {
      const s = document.createElement("span"); s.className = "ch"; s.style.display = "inline-block";
      s.textContent = c === " " ? " " : c; el.appendChild(s);
    });
    el.dataset.split = "1";
    return el.querySelectorAll(".ch");
  }
  const isV = () => document.documentElement.dataset.fmt === "v";

  // Gestes
  const FX = {
    ICONS, SIL, svgIcon, mountIcons, letters, isV, scalePath,
    // dérive caméra permanente (jamais linéaire)
    drift(tl, sel, start, dur, amt) {
      const a = amt || 1;
      tl.fromTo(sel, { scale: 1, x: 0, y: 0 }, { scale: 1 + 0.035 * a, x: 12 * a, y: -6 * a, duration: dur, ease: "sine.inOut" }, start);
    },
    // mot qui claque (scale avec overshoot + flou)
    slam(tl, sel, t, o) {
      o = o || {};
      tl.fromTo(sel, { scale: o.from || 1.45, opacity: 0, filter: "blur(14px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: o.dur || 0.42, ease: o.ease || "back.out(1.8)" }, t);
    },
    // lettres qui tombent une à une
    dropLetters(tl, el, t, o) {
      o = o || {};
      const chs = letters(el);
      tl.fromTo(chs, { yPercent: o.from || -110, opacity: 0, rotate: o.rot || 0 },
        { yPercent: 0, opacity: 1, rotate: 0, duration: o.dur || 0.38, ease: "back.out(2.2)", stagger: o.stagger || 0.035 }, t);
      return chs;
    },
    // ondes de sonnerie concentriques
    rings(tl, els, t, o) {
      o = o || {};
      tl.fromTo(els, { scale: o.from || 0.4, opacity: o.alpha || 0.9 },
        { scale: o.to || 7, opacity: 0, duration: o.dur || 1.1, ease: "power2.out", stagger: o.stagger || 0.18, immediateRender: false }, t);
    },
    // badge prix qui claque
    badge(tl, el, flash, t) {
      tl.fromTo(el, { scale: 0, rotate: -14 }, { scale: 1, rotate: -4, duration: 0.55, ease: "elastic.out(1,0.55)" }, t);
      if (flash) tl.fromTo(flash, { opacity: 0.85, scale: 0.6 }, { opacity: 0, scale: 1.6, duration: 0.35, ease: "power2.out" }, t);
    },
    // sortie nette (flou + fondu)
    out(tl, sel, t, o) {
      o = o || {};
      tl.to(sel, { opacity: 0, filter: "blur(10px)", scale: o.scale || 1, x: o.x || 0, y: o.y || 0, duration: o.dur || 0.18, ease: "power3.in" }, t);
    },
  };
  window.FX = FX;
})();
