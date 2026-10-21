var SB = (function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="currentColor"/></svg>';
  // n sparkles inside box [x0,y0,x1,y1] (px); returns the elements
  function sparkles(host, n, seed, box, color, smin, smax) {
    var r = rng(seed), out = [];
    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "spark";
      var s = smin + r() * (smax - smin);
      el.style.width = el.style.height = s + "px";
      el.style.left = box[0] + r() * (box[2] - box[0]) - s / 2 + "px";
      el.style.top = box[1] + r() * (box[3] - box[1]) - s / 2 + "px";
      el.style.color = color;
      el.innerHTML = STAR;
      host.appendChild(el);
      out.push(el);
    }
    return out;
  }
  // twinkle every sparkle between t0 and t1 with finite repeats
  function twinkle(tl, els, t0, t1, seed) {
    var r = rng(seed);
    els.forEach(function (el) {
      var period = 0.9 + r() * 0.9, start = t0 + r() * period;
      tl.set(el, { scale: 0, opacity: 0 }, 0);
      for (var t = start; t + period <= t1 + 0.001; t += period + r() * 0.4) {
        tl.fromTo(el, { scale: 0, opacity: 0, rotation: -30 }, { keyframes: [{ scale: 1, opacity: 1, rotation: 0, duration: period * 0.4, ease: "power2.out" }, { scale: 0, opacity: 0, rotation: 30, duration: period * 0.6, ease: "power2.in" }], immediateRender: false }, t);
      }
    });
  }
  // soft drifting light discs
  function bokeh(host, n, seed, W, H, color, smin, smax) {
    var r = rng(seed), out = [];
    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "bokeh";
      var s = smin + r() * (smax - smin);
      el.style.width = el.style.height = s + "px";
      el.style.left = r() * W - s / 2 + "px";
      el.style.top = r() * H - s / 2 + "px";
      el.style.background = "radial-gradient(circle," + color + " 0%,rgba(255,255,255,0) 70%)";
      el.style.opacity = (0.35 + r() * 0.5).toFixed(2);
      el.dataset.dx = ((r() - 0.5) * 160).toFixed(1);
      el.dataset.dy = (-40 - r() * 140).toFixed(1);
      host.appendChild(el);
      out.push(el);
    }
    return out;
  }
  function drift(tl, els, dur) {
    els.forEach(function (el) {
      tl.fromTo(el, { x: 0, y: 0 }, { x: +el.dataset.dx, y: +el.dataset.dy, duration: dur, ease: "none" }, 0);
    });
  }
  function fmt(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  }
  return { rng: rng, sparkles: sparkles, twinkle: twinkle, bokeh: bokeh, drift: drift, fmt: fmt };
})();
