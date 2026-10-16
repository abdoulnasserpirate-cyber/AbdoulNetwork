// Original motion-design motifs inspired by the naive, saturated world of Baya
// (flowers, birds, leaves, garden). Not copies of any specific artwork.
// Pure string builders; deterministic (seeded PRNG only).
(function () {
  const P = {
    blue: "#2f5fd0",
    deep: "#1d2f7a",
    rose: "#e8467c",
    pink: "#f59bbf",
    green: "#2a9d6a",
    lime: "#9ccc4a",
    ochre: "#e3a33a",
    saffron: "#f6c23e",
    red: "#d8432f",
    violet: "#7a4fc4",
    cream: "#fbf2e2",
    ink: "#141a33",
  };

  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  // Flower: N rounded petals around a center; each petal is its own <g class="petal"> so it can bloom.
  function flower({ r = 60, n = 8, petal = P.rose, inner = P.pink, core = P.saffron, dot = P.ink, ring = P.blue } = {}) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      s += `<g class="petal" transform="rotate(${a})"><ellipse cx="0" cy="${-r * 0.55}" rx="${r * 0.3}" ry="${r * 0.52}" fill="${petal}" stroke="${P.ink}" stroke-width="${r * 0.04}"/><ellipse cx="0" cy="${-r * 0.5}" rx="${r * 0.13}" ry="${r * 0.3}" fill="${inner}"/></g>`;
    }
    let dots = "";
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 * i) / 10;
      dots += `<circle cx="${(Math.cos(a) * r * 0.2).toFixed(1)}" cy="${(Math.sin(a) * r * 0.2).toFixed(1)}" r="${r * 0.035}" fill="${dot}"/>`;
    }
    return `<g class="flower">${s}<circle class="core" r="${r * 0.3}" fill="${ring}" stroke="${P.ink}" stroke-width="${r * 0.04}"/><circle r="${r * 0.24}" fill="${core}"/>${dots}</g>`;
  }

  function leaf({ len = 120, w = 40, fill = P.green, vein = P.lime } = {}) {
    return `<g class="leaf"><path d="M0 0 C ${w} ${-len * 0.3} ${w} ${-len * 0.75} 0 ${-len} C ${-w} ${-len * 0.75} ${-w} ${-len * 0.3} 0 0 Z" fill="${fill}" stroke="${P.ink}" stroke-width="3"/><path d="M0 -6 L0 ${-len * 0.9}" stroke="${vein}" stroke-width="4" stroke-linecap="round"/></g>`;
  }

  // Stylised bird facing right: plump body, almond wing, fan tail, big eye.
  function bird({ s = 1, body = P.blue, wing = P.rose, tail = P.green, beak = P.saffron } = {}) {
    return `<g class="bird" transform="scale(${s})">
      <g class="tail"><path d="M-95 5 L-175 -45 L-160 0 L-180 40 Z" fill="${tail}" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"/><path d="M-110 4 L-165 -25 M-112 8 L-168 25" stroke="${P.saffron}" stroke-width="5" stroke-linecap="round"/></g>
      <path d="M-110 10 C -100 -60 20 -85 70 -40 C 95 -15 90 30 55 55 C 10 85 -90 70 -110 10 Z" fill="${body}" stroke="${P.ink}" stroke-width="5"/>
      <path d="M85 -25 L130 -12 L86 4 Z" fill="${beak}" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"/>
      <g class="wing"><path d="M-60 0 C -30 -55 40 -40 35 5 C 10 40 -40 35 -60 0 Z" fill="${wing}" stroke="${P.ink}" stroke-width="4"/><path d="M-40 6 C -20 -20 10 -22 20 0" fill="none" stroke="${P.cream}" stroke-width="4" stroke-linecap="round"/><path d="M-30 18 C -15 0 5 0 15 15" fill="none" stroke="${P.cream}" stroke-width="4" stroke-linecap="round"/></g>
      <circle cx="55" cy="-22" r="17" fill="${P.cream}" stroke="${P.ink}" stroke-width="4"/><circle cx="59" cy="-22" r="8" fill="${P.ink}"/>
    </g>`;
  }

  // A small "garden" cluster: stem + leaves + flower, wrapped in groups the timeline can grow.
  function plant({ h = 260, fl = {}, seed = 1 } = {}) {
    const R = rng(seed);
    const lean = (R() - 0.5) * 30;
    return `<g class="plant"><path class="stem" d="M0 0 C ${lean} ${-h * 0.35} ${-lean} ${-h * 0.7} 0 ${-h}" fill="none" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/><g class="pl-leaf" transform="translate(0 ${-h * 0.35}) rotate(-50)">${leaf({ len: h * 0.35, w: h * 0.1 })}</g><g class="pl-leaf" transform="translate(0 ${-h * 0.55}) rotate(55)">${leaf({ len: h * 0.3, w: h * 0.09, fill: P.lime, vein: P.green })}</g><g class="pl-flower" transform="translate(0 ${-h})">${flower(fl)}</g></g>`;
  }

  window.BAYA = { P, rng, flower, leaf, bird, plant };
})();
