// Sublime Booty ByChris — shared 2D motion vocabulary. Every helper places tweens on a scene's paused
// timeline at absolute (scene-local) seconds, with fromTo so any frame renders on its own.
(function () {
  const M = {
    // Word / line slam: big and blurred, lands hard (expo tail), no slide.
    slam(tl, sel, t, o) {
      o = o || {};
      tl.fromTo(sel, { opacity: 0, scale: o.from || 1.55, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: o.d || 0.32, ease: "expo.out", transformOrigin: o.origin || "0% 50%" }, t);
    },
    // Pop: badge / tile / number landing with a springy overshoot.
    pop(tl, sel, t, o) {
      o = o || {};
      tl.fromTo(sel, { opacity: 0, scale: o.from == null ? 0.3 : o.from, rotation: o.rot || 0 }, { opacity: 1, scale: 1, rotation: o.rotTo || 0, duration: o.d || 0.45, ease: "back.out(2.2)", transformOrigin: o.origin || "50% 50%", stagger: o.stagger || 0 }, t);
    },
    // Blur-in in place: quiet lines (kickers, taglines).
    blurIn(tl, sel, t, o) {
      o = o || {};
      tl.fromTo(sel, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: o.d || 0.2, ease: "power2.out", stagger: o.stagger || 0 }, t);
    },
    // Price-tag slap: swings in from the left edge and settles with a slight tilt.
    tag(tl, sel, t, o) {
      o = o || {};
      tl.fromTo(sel, { opacity: 0, x: -60, rotation: -9, scale: 1.2 }, { opacity: 1, x: 0, rotation: o.rot == null ? -2 : o.rot, scale: 1, duration: 0.38, ease: "back.out(1.8)", stagger: o.stagger || 0 }, t);
    },
    // Whip: horizontal smear in (blur peaks mid-move).
    whipIn(tl, sel, t, o) {
      o = o || {};
      const dx = o.dx == null ? 700 : o.dx;
      tl.fromTo(sel, { x: dx, filter: "blur(18px)" }, { x: 0, filter: "blur(0px)", duration: o.d || 0.34, ease: "power3.out" }, t);
    },
    whipOut(tl, sel, t, o) {
      o = o || {};
      tl.fromTo(sel, { x: 0, filter: "blur(0px)" }, { x: o.dx == null ? -700 : o.dx, filter: "blur(18px)", duration: o.d || 0.16, ease: "power3.in", immediateRender: false }, t);
    },
    // RGB glitch: a few hard frames of offset copies and slice jumps (deterministic sets).
    glitch(tl, sel, t, o) {
      o = o || {};
      const k = o.k || 1;
      const frames = [
        [-22 * k, "inset(10% 0 62% 0)", "drop-shadow(14px 0 0 #00e5ff) drop-shadow(-14px 0 0 #ff1a8c)"],
        [16 * k, "inset(48% 0 20% 0)", "drop-shadow(-10px 0 0 #00e5ff) drop-shadow(10px 0 0 #ff1a8c)"],
        [-8 * k, "inset(0 0 0 0)", "drop-shadow(6px 0 0 #00e5ff) drop-shadow(-6px 0 0 #ff1a8c)"],
        [0, "inset(0 0 0 0)", "drop-shadow(0px 0 0 rgba(0,0,0,0))"],
      ];
      frames.forEach((f, i) => tl.set(sel, { x: f[0], clipPath: f[1], filter: f[2] }, t + i * 0.034));
    },
    // Wipe a cover layer away upward (colour flood into the new world).
    wipeUp(tl, sel, t, o) {
      o = o || {};
      tl.fromTo(sel, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: o.d || 0.36, ease: "power3.inOut" }, t);
    },
    // Iris open of a layer from a point.
    iris(tl, sel, t, o) {
      o = o || {};
      const at = o.at || "50% 50%";
      tl.fromTo(sel, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(130% at ${at})`, duration: o.d || 0.42, ease: "power3.in" }, t);
    },
    // Short punch on an element (stamp landing): scale kick and settle.
    shake(tl, sel, t) {
      [[8, -6], [-6, 4], [3, -2], [0, 0]].forEach((p, i) => tl.set(sel, { x: p[0], y: p[1] }, t + i * 0.034));
    },
    // Hold the timeline to the scene's full length.
    end(tl, d) { tl.set({}, {}, d); },
  };
  window.SBM = M;
})();
