      // Deterministic pseudo-random (seeded LCG) for decorative elements.
      let seed = 2510;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

      // confetti bursts (S8, S10)
      function makeConfetti(hostId, n) {
        const host = document.getElementById(hostId);
        const out = [];
        for (let i = 0; i < n; i++) {
          const d = document.createElement("i");
          const w = 10 + Math.round(rnd() * 14);
          d.className = "dot";
          d.style.cssText = `left:${960 - w / 2}px;top:${540}px;width:${w}px;height:${Math.round(w * (0.4 + rnd() * 0.6))}px;background:${["#ffffff", "#121010", "#ff4a50"][i % 3]};border-radius:3px`;
          host.appendChild(d);
          const a = rnd() * Math.PI * 2;
          const r = 380 + rnd() * 700;
          out.push({ el: d, x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7 - 120, rot: (rnd() - 0.5) * 900, fall: 260 + rnd() * 380 });
        }
        return out;
      }
      const conf8 = makeConfetti("s8-confetti", 46);
      const conf10 = makeConfetti("s10-confetti", 46);
      // frost particles (S9)
      const frostHost = document.getElementById("s9-frost");
      const frost = [];
      for (let i = 0; i < 40; i++) {
        const d = document.createElement("i");
        const s = 6 + Math.round(rnd() * 12);
        d.className = "dot";
        d.style.cssText = `left:${Math.round(rnd() * 1900)}px;top:-40px;width:${s}px;height:${s}px;border-radius:50%;background:rgba(214,6,15,${0.25 + rnd() * 0.35})`;
        frostHost.appendChild(d);
        frost.push({ el: d, delay: rnd() * 1.2, dur: 1.6 + rnd() * 1.2, drift: (rnd() - 0.5) * 200 });
      }

      const tl = gsap.timeline({ paused: true });
      tl.set(".sl", { xPercent: -105 }, 0);

      // ---------- transitions (ultra-fast, sharp) ----------
      // 5 broadcast slices cross the frame, fully covering it at t
      function slices(t, dir = 1) {
        document.querySelectorAll(".sl").forEach((el, i) => {
          const lag = (i % 2 ? 0.03 : 0) + i * 0.012;
          tl.fromTo(el, { xPercent: -105 * dir }, { xPercent: 0, duration: 0.14, ease: "power3.in", immediateRender: false }, t - 0.14 - 0.05 + lag);
          tl.to(el, { xPercent: 105 * dir, duration: 0.17, ease: "power3.out" }, t + lag);
        });
      }
      function flash(t, peak = 1) {
        tl.fromTo("#flash", { opacity: 0 }, { opacity: peak, duration: 0.04, ease: "none", immediateRender: false }, t - 0.04);
        tl.to("#flash", { opacity: 0, duration: 0.18, ease: "power2.out" }, t);
      }
      // glitch: horizontal jitter + clip slices on a scene, 0.2 s
      function glitch(sel, t) {
        const steps = [
          [26, "inset(10% 0 60% 0)"], [-34, "inset(45% 0 20% 0)"], [18, "inset(0 0 75% 0)"], [-12, "inset(70% 0 5% 0)"], [0, "inset(0 0 0 0)"],
        ];
        steps.forEach(([x, c], i) => tl.set(sel, { x, clipPath: c }, t + i * 0.04));
      }
      function shake(sel, t, amp = 16, n = 5) {
        tl.fromTo(sel, { x: 0, y: 0 }, { x: amp, y: -amp * 0.5, duration: 0.035, ease: "none", yoyo: true, repeat: n, immediateRender: false }, t);
        tl.set(sel, { x: 0, y: 0 }, t + 0.035 * (n + 1));
      }
      function zoomPunch(sel, t) {
        tl.fromTo(sel, { scale: 1.18 }, { scale: 1, duration: 0.35, ease: "expo.out", immediateRender: false }, t);
      }
      // ---------- text motions ----------
      function slam(sel, t, d = 0.22) {
        tl.fromTo(sel, { scale: 2.8, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: "power4.in" }, t);
      }
      function punch(sel, t, d = 0.3) {
        tl.fromTo(sel, { scale: 1.9, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "expo.out" }, t);
      }
      function leadIn(sel, t) {
        tl.fromTo(sel, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: "power3.out" }, t);
      }
      function rise(sel, t, d = 0.35) {
        tl.fromTo(sel, { yPercent: 70, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }, { yPercent: 0, opacity: 1, clipPath: "inset(0% 0% -20% 0%)", duration: d, ease: "expo.out" }, t);
      }
      function pushOut(sel, t, x = -300, d = 0.16) {
        tl.to(sel, { x, opacity: 0, filter: "blur(16px)", duration: d, ease: "power3.in" }, t);
      }
      function whipIn(sel, t, x = 900, rot = 0) {
        tl.fromTo(sel, { x, rotation: rot + 12, opacity: 0, filter: "blur(18px)" }, { x: 0, rotation: rot, opacity: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out" }, t);
      }
      function popIn(sel, t, d = 0.3) {
        tl.fromTo(sel, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: "back.out(2.4)" }, t);
      }
      function beams(id, t, d) {
        document.getElementById(id).querySelectorAll(".beam").forEach((b, i) => {
          tl.fromTo(b, { rotation: i % 2 ? -28 : 28 }, { rotation: i % 2 ? 22 : -22, duration: d, ease: "sine.inOut" }, t);
        });
      }
      function burst(list, t) {
        list.forEach((c, i) => {
          tl.fromTo(c.el, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 0.3 }, { x: c.x, y: c.y, rotation: c.rot, scale: 1, duration: 0.6, ease: "expo.out" }, t + (i % 5) * 0.01);
          tl.to(c.el, { y: c.y + c.fall, opacity: 0, duration: 1.0, ease: "power1.in" }, t + 0.6);
        });
      }

      // ================= S1 · Dimanche, c'est le Classico (0 – 2.15) =================
      beams("s1-beams", 0, 2.2);
      slam("#s1-dim", 0.08, 0.2);
      shake("#s1", 0.28);
      tl.to("#s1-dim", { y: -250, scale: 0.55, duration: 0.25, ease: "power3.inOut" }, 0.62);
      leadIn("#s1-lead", 0.8);
      punch("#s1-big", 1.15, 0.28);
      tl.fromTo("#s1-fcb", { x: -500, rotation: -40, opacity: 0 }, { x: 0, rotation: -6, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, 1.15);
      tl.fromTo("#s1-rma", { x: 500, rotation: 40, opacity: 0 }, { x: 0, rotation: 6, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, 1.15);
      shake("#s1", 1.4, 12, 3);
      flash(2.15);

      // ================= S2 · Soirée pizza (2.15 – 4.1) =================
      tl.fromTo("#s2-rays", { rotation: 0 }, { rotation: 30, duration: 2.0, ease: "none" }, 2.15);
      glitch("#s2", 2.15);
      leadIn("#s2-lead", 2.2);
      tl.fromTo("#s2-logo", { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.8)" }, 2.3);
      leadIn("#s2-lead2", 3.0);
      slam("#s2-big", 3.55, 0.2);
      shake("#s2", 3.75);
      tl.fromTo("#s2-ball", { x: 700, rotation: 360, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.45, ease: "back.out(1.4)" }, 3.5);
      tl.to("#s2-ball img", { rotation: 200, duration: 0.6, ease: "none" }, 3.5);
      slices(4.1);

      // ================= S3 · Scoreboard (4.1 – 8.0) =================
      leadIn("#s3-lead", 4.2);
      tl.fromTo("#s3-board", { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.3, ease: "expo.out" }, 4.15);
      tl.fromTo("#s3-fcb", { x: -300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, 4.35);
      tl.fromTo("#s3-rma", { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, 4.35);
      slam("#s3-vs .big", 4.6, 0.2);
      leadIn("#s3-cl", 4.8);
      tl.to(["#s3-fcb", "#s3-rma"], { scale: 1.06, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 3 }, 5.0);
      [5.5, 6.6, 7.2].forEach((t, i) => {
        tl.fromTo(`#s3-dates .pill:nth-child(${i + 1})`, { y: 120, scale: 0.3, opacity: 0, rotation: i % 2 ? 8 : -8 }, { y: 0, scale: 1, opacity: 1, rotation: 0, duration: 0.3, ease: "back.out(2.6)" }, t);
      });
      shake("#s3", 7.25, 10, 3);
      slices(8.0, -1);

      // ================= S4 · Quoi de mieux qu'une bonne pizza (8.0 – 11.2) =================
      leadIn("#s4-lead", 8.1);
      tl.fromTo("#v-part", { x: 800, rotation: 12 }, { x: 0, rotation: 3, duration: 0.4, ease: "expo.out" }, 8.05);
      tl.to("#v-part", { rotation: -2, scale: 1.03, duration: 2.6, ease: "sine.inOut" }, 8.5);
      rise("#s4-big > div", 9.65);
      tl.fromTo("#s4-big > div:nth-child(2)", { yPercent: 70 }, { yPercent: 0, duration: 0.35, ease: "expo.out", immediateRender: false }, 9.95);
      slam("#s4-tag", 10.45, 0.2);
      shake("#s4", 10.65, 10, 3);
      tl.to("#v-part", { x: 900, rotation: 20, filter: "blur(16px)", duration: 0.18, ease: "power3.in" }, 11.05);
      flash(11.2, 0.85);

      // ================= S5 · La pizza, plat du Classico (11.2 – 13.6) =================
      zoomPunch("#s5", 11.2);
      slam("#s5-big", 11.25, 0.22);
      tl.fromTo("#s5-ball", { y: -700, scale: 0.6 }, { y: 0, scale: 1, duration: 0.5, ease: "bounce.out" }, 11.3);
      tl.to("#s5-ball img", { rotation: 540, duration: 2.3, ease: "power1.out" }, 11.3);
      punch("#s5-sub", 12.15, 0.28);
      tl.to("#s5-ball", { scale: 1.08, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 }, 12.9);
      flash(13.6);

      // ================= S6 · Partage / savoure / vibre (13.6 – 16.7) =================
      [["#s6-c1", "#s6-t1", 13.65, 14.5], ["#s6-c2", "#s6-t2", 14.55, 15.22], ["#s6-c3", "#s6-t3", 15.25, 0]].forEach(([c, t, tin, tout], i) => {
        whipIn(c, tin, -800, i % 2 ? 4 : -4);
        tl.fromTo(t + " > div", { x: 400, opacity: 0, skewX: -20 }, { x: 0, opacity: 1, skewX: 0, duration: 0.22, ease: "expo.out", stagger: 0.08 }, tin + 0.05);
        if (tout) {
          flash(tout, 0.9);
          tl.set([c, t], { opacity: 0 }, tout);
        } else {
          shake("#s6", 15.95, 12, 4);
          tl.to(c, { rotation: 6, scale: 1.04, duration: 1.2, ease: "sine.inOut" }, 15.6);
        }
      });
      slices(16.7);

      // ================= S7 · Nos pizzas / bien chaudes / coup d'envoi (16.7 – 22.1) =================
      leadIn("#s7-a > .lead", 16.8);
      punch("#s7-a > .big", 17.4, 0.28);
      tl.fromTo("#v-bulles", { y: 900, rotation: -8 }, { y: 0, rotation: -3, duration: 0.4, ease: "expo.out" }, 16.75);
      tl.fromTo("#v-tiree", { y: 900, rotation: 8 }, { y: 0, rotation: 2, duration: 0.4, ease: "expo.out" }, 17.55);
      tl.fromTo("#v-fumee", { y: 900, rotation: -6 }, { y: 0, rotation: -2, duration: 0.4, ease: "expo.out" }, 18.65);
      pushOut("#s7-a", 18.6, -300);
      leadIn("#s7-b > .lead", 18.7);
      punch("#s7-b > .big", 19.05, 0.28);
      pushOut("#s7-b", 20.05, -300);
      tl.to(["#v-bulles", "#v-tiree", "#v-fumee"], { y: 1000, rotation: 12, duration: 0.25, ease: "power3.in", stagger: 0.05 }, 20.0);
      leadIn("#s7-c > .lead", 20.25);
      slam("#s7-c > .big", 21.0, 0.22);
      shake("#s7", 21.22);
      popIn("#s7-whistle", 21.3, 0.3);
      glitch("#s7", 22.0);
      flash(22.1);

      // ================= S8 · −15 % (22.1 – 26.2) =================
      beams("s8-beams", 22.1, 4.1);
      leadIn("#s8-lead", 22.2);
      tl.fromTo("#s8-plate", { x: 800, rotation: 120, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.45, ease: "back.out(1.3)" }, 22.3);
      tl.to("#s8-plate", { rotation: 40, duration: 3.6, ease: "none" }, 22.75);
      slam("#s8-pct", 23.55, 0.2);
      shake("#s8", 23.75, 20, 6);
      flash(23.75, 0.7);
      burst(conf8, 23.75);
      slam("#s8-sticker", 23.85, 0.2);
      tl.to("#s8-sticker", { rotation: -12, scale: 1.08, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 3 }, 24.1);
      rise("#s8-red", 24.2);
      tl.fromTo("#s8-all", { x: -600, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "back.out(1.6)" }, 24.8);
      tl.to("#s8-pct", { scale: 1.06, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }, 25.4);
      slices(26.2, -1);

      // ================= S9 · Climatisé (26.2 – 28.6) =================
      frost.forEach((f) => tl.fromTo(f.el, { y: 0, x: 0 }, { y: 1160, x: f.drift, duration: f.dur, ease: "none" }, 26.2 + f.delay * 0.8));
      punch("#s9-big", 26.35, 0.28);
      leadIn("#s9-lead", 27.0);
      tl.fromTo("#s9-ac", { scale: 0.2, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.35, ease: "back.out(2)" }, 27.55);
      tl.fromTo(".snow", { rotation: 0 }, { rotation: 180, duration: 1.0, ease: "power2.out" }, 27.55);
      flash(28.6, 0.9);

      // ================= S10 · Grand écran + ambiance (28.6 – 32.2) =================
      beams("s10-beams", 28.6, 3.6);
      leadIn("#s10-lead", 28.65);
      rise("#s10-big > div", 28.95);
      tl.fromTo("#s10-big > div:nth-child(2)", { yPercent: 70 }, { yPercent: 0, duration: 0.35, ease: "expo.out", immediateRender: false }, 29.2);
      tl.fromTo("#s10-tv", { scale: 0.2, rotation: -10, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }, 28.75);
      tl.to("#s10-tv", { rotation: 2, scale: 1.03, duration: 2.6, ease: "sine.inOut" }, 29.3);
      leadIn("#s10-amb .lead", 30.0);
      slam("#s10-folie", 31.2, 0.2);
      shake("#s10", 31.4, 22, 6);
      burst(conf10, 31.4);
      glitch("#s10", 32.1);

      // ================= S11 · Conditions (32.2 – 36.2) =================
      slam("#s11-att", 32.35, 0.2);
      tl.fromTo(".warn-ico", { rotation: -15 }, { rotation: 15, duration: 0.1, ease: "none", yoyo: true, repeat: 5 }, 32.6);
      rise("#s11-lead", 33.0);
      tl.fromTo("#s11-stamp", { scale: 3, rotation: -18, opacity: 0 }, { scale: 1, rotation: -4, opacity: 1, duration: 0.2, ease: "power4.in" }, 34.1);
      shake("#s11", 34.3, 18, 5);
      tl.fromTo("#s11-soir", { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "back.out(2)" }, 34.9);
      slices(36.2);

      // ================= S12 · Réservez (36.2 – 42.7) =================
      punch("#s12-big", 36.35, 0.3);
      leadIn("#s12-lead", 37.5);
      popIn("#s12-wa", 37.7, 0.35);
      [38.25, 39.55, 40.55, 41.6].forEach((t, i) => {
        slam(`#s12-num .w:nth-child(${i + 1})`, t, 0.18);
        shake("#s12-num", t + 0.18, 8, 2);
      });
      tl.to("#s12-num", { scale: 1.06, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }, 42.0);
      flash(42.7);

      // ================= S13 · Signature (42.7 – 45.94) =================
      tl.fromTo("#s13-rays", { rotation: 0 }, { rotation: 30, duration: 3.3, ease: "none" }, 42.7);
      tl.fromTo("#s13-logo", { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(1.7)" }, 43.1);
      leadIn("#s13-lead", 43.85);
      slam("#s13-big", 44.8, 0.2);
      shake("#s13", 45.0, 12, 3);
      tl.fromTo("#s13-band", { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: "expo.out" }, 43.3);

      // live bug
      tl.fromTo("#bug-in", { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, 4.3);
      tl.fromTo(".live", { opacity: 1 }, { opacity: 0.2, duration: 0.4, ease: "none", yoyo: true, repeat: 45 }, 4.3);

      window.__timelines["main"] = tl;
