      // Deterministic pseudo-random (seeded LCG) for decorative elements.
      let seed = 4242;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const W = document.getElementById("root").offsetWidth;
      const H = document.getElementById("root").offsetHeight;

      // speed lines (S2, S11)
      function makeLines(hostId, n, color) {
        const host = document.getElementById(hostId);
        const out = [];
        for (let i = 0; i < n; i++) {
          const d = document.createElement("div");
          const w = 160 + Math.round(rnd() * 420);
          d.className = "sline";
          d.style.cssText = `left:0;top:${Math.round(40 + rnd() * (H - 80))}px;width:${w}px;height:${4 + Math.round(rnd() * 8)}px;background:${color(i)}`;
          host.appendChild(d);
          out.push({ el: d, w, speed: 0.3 + rnd() * 0.3, off: rnd() });
        }
        return out;
      }
      const lines2 = makeLines("s2-lines", 14, () => "rgba(255,255,255,0.8)");
      const lines11 = makeLines("s11-lines", 16, (i) => (i % 3 ? "rgba(255,255,255,0.75)" : "#121010"));

      // medal sun rays (S12)
      const burst = document.getElementById("s12-burst");
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * 360;
        const e = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        e.setAttribute("x", "94");
        e.setAttribute("y", "76");
        e.setAttribute("width", "12");
        e.setAttribute("height", "16");
        e.setAttribute("rx", "6");
        e.setAttribute("fill", "#d6060f");
        e.setAttribute("transform", `rotate(${a} 100 170)`);
        burst.appendChild(e);
      }

      // typed URL (S9)
      const URL_TXT = "chiefchiefrestaurant.com";
      const urlHost = document.getElementById("s9-url");
      const urlChars = [];
      for (const ch of URL_TXT) {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = ch;
        urlHost.appendChild(s);
        urlChars.push(s);
      }

      const tl = gsap.timeline({ paused: true });
      tl.set(".wpanel", { xPercent: -110 }, 0);

      // ---------- helpers ----------
      // reference-style colour wipe: a skewed panel crosses the frame, fully covering it at t
      function wipe(t, id, dir = 1) {
        tl.fromTo(id, { xPercent: -110 * dir, skewX: -12 }, { xPercent: 0, skewX: -12, duration: 0.22, ease: "power3.in", immediateRender: false }, t - 0.22);
        tl.to(id, { xPercent: 110 * dir, duration: 0.28, ease: "power3.out" }, t);
      }
      // big word punches in (scale + blur), reference "impact" word
      function punch(sel, t, d = 0.32) {
        tl.fromTo(sel, { scale: 1.9, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "expo.out" }, t);
      }
      // lead-in line types in from left
      function leadIn(sel, t) {
        tl.fromTo(sel, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
      }
      // mask reveal from below
      function rise(sel, t, d = 0.4) {
        tl.fromTo(sel, { yPercent: 70, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }, { yPercent: 0, opacity: 1, clipPath: "inset(0% 0% -20% 0%)", duration: d, ease: "expo.out" }, t);
      }
      // push out with motion blur
      function pushOut(sel, t, x = -260, d = 0.25) {
        tl.to(sel, { x, opacity: 0, filter: "blur(16px)", duration: d, ease: "power3.in" }, t);
      }
      // photo card slides in from right, tilted, with overshoot
      function cardIn(sel, t, rot = 4) {
        tl.fromTo(sel, { x: 700, rotation: rot + 14, opacity: 0 }, { x: 0, rotation: rot, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }, t);
      }
      function popIn(sel, t, d = 0.35, from = 0) {
        tl.fromTo(sel, { scale: from, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: "back.out(2.2)" }, t);
      }
      function drift(sel, t, d, props) {
        tl.to(sel, { ...props, duration: d, ease: "sine.inOut" }, t);
      }

      // ================= S1 · À Maradi (0 – 2.3) =================
      leadIn("#s1-lead", 0.02);
      punch("#s1-big", 0.32, 0.38);
      drift("#s1-big", 0.7, 1.6, { scale: 1.05 });
      popIn("#s1-b1", 0.75);
      popIn("#s1-b2", 1.8);
      popIn("#s1-b3", 1.0);
      popIn("#s1-b4", 1.5);
      ["#s1-b1", "#s1-b2", "#s1-b3", "#s1-b4"].forEach((b, i) => drift(b, 1.1 + i * 0.05, 1.1, { y: i % 2 ? -14 : 14 }));
      wipe(2.3, "#wp-k");

      // ================= S2 · Bien manger / vite (2.25 – 5.1) =================
      leadIn("#s2-lead", 2.4);
      punch("#s2-big .w", 3.35);
      tl.fromTo("#s2-big .w", { y: 0 }, { y: 0, duration: 0.01 }, 3.35);
      tl.set("#s2-big .w:nth-child(2)", { opacity: 0 }, 3.35);
      punch("#s2-big .w:nth-child(2)", 3.58);
      pushOut(["#s2-lead", "#s2-big"], 3.82, -320, 0.22);
      leadIn("#s2-lead2", 3.95);
      tl.fromTo("#s2-big2", { x: 900, skewX: -25, opacity: 0, filter: "blur(18px)" }, { x: 0, skewX: 0, opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "expo.out" }, 4.42);
      lines2.forEach((l) => {
        tl.fromTo(l.el, { x: W + l.off * 400, opacity: 1 }, { x: -l.w - 100, duration: l.speed, ease: "none", repeat: 2 }, 4.3 + l.off * 0.2);
      });
      drift("#s2-big2", 4.8, 0.35, { scale: 1.06 });
      wipe(5.1, "#wp-w");

      // ================= S3 · Plat du chef / pâte noire (5.1 – 8.2) =================
      rise("#s3-t1 > div", 5.15, 0.4);
      tl.fromTo("#s3-t1 > div:nth-child(2)", { yPercent: 70 }, { yPercent: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, 5.45);
      cardIn("#s3-card", 5.15, 4);
      drift("#s3-card", 5.7, 0.6, { rotation: 2 });
      pushOut("#s3-t1", 6.1, -300, 0.22);
      rise("#s3-t2 > div", 6.25, 0.4);
      tl.fromTo("#s3-plate", { x: 760, rotation: 120, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(1.2)" }, 6.2);
      tl.to("#s3-card", { x: 40, y: -40, rotation: 9, scale: 0.9, duration: 0.5, ease: "power3.out" }, 6.25);
      leadIn("#s3-lead", 6.9);
      drift("#s3-plate", 6.8, 1.4, { rotation: 20 });
      wipe(8.2, "#wp-r");

      // ================= S4 · Burgers / chawarma (8.2 – 10.15) =================
      punch("#s4-t1", 8.3);
      cardIn("#s4-card1", 8.25, -4);
      pushOut("#s4-t1", 9.08, -320, 0.2);
      punch("#s4-t2", 9.2);
      cardIn("#s4-card2", 9.15, 5);
      tl.to("#s4-card1", { x: -90, rotation: -10, duration: 0.45, ease: "power3.out" }, 9.2);
      drift("#s4-card2", 9.65, 0.5, { rotation: 3 });
      wipe(10.15, "#wp-w", -1);

      // ================= S5 · Pizzas / poulet (10.15 – 12.3) =================
      punch("#s5-t1", 10.3);
      cardIn("#s5-card1", 10.22, -5);
      pushOut("#s5-t1", 10.8, -320, 0.2);
      rise("#s5-t2 > div", 10.9, 0.4);
      tl.fromTo("#s5-t2 > div:nth-child(2)", { yPercent: 70 }, { yPercent: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, 11.3);
      cardIn("#s5-card2", 10.85, 4);
      tl.to("#s5-card1", { x: -90, rotation: -11, duration: 0.45, ease: "power3.out" }, 10.9);
      drift("#s5-card2", 11.4, 0.8, { rotation: 1, scale: 1.03 });
      wipe(12.3, "#wp-r");

      // ================= S6 · Tous ces bons plats (12.3 – 14.25) =================
      leadIn("#s6-lead", 12.6);
      punch("#s6-big .w", 12.95);
      tl.set("#s6-big .w:nth-child(2)", { opacity: 0 }, 12.95);
      punch("#s6-big .w:nth-child(2)", 13.15);
      tl.fromTo("#s6-pills .pill", { y: 80, opacity: 0, scale: 0.4 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)", stagger: 0.08 }, 13.2);
      drift("#s6-big", 13.4, 0.8, { scale: 1.04 });

      // ================= S7 · Logo (14.2 – 15.05) =================
      tl.fromTo("#s7", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(120% at 50% 50%)", duration: 0.3, ease: "power3.out" }, 14.2);
      tl.fromTo(["#s7-rays", "#s11-rays", "#s13-rays"], { rotation: 0 }, { rotation: 0, duration: 0.01 }, 0);
      tl.to("#s7-rays", { rotation: 25, duration: 0.9, ease: "none" }, 14.2);
      leadIn("#s7-lead", 14.22);
      tl.fromTo("#s7-logo", { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" }, 14.3);
      wipe(15.0, "#wp-w");

      // ================= S8 · Fast-food généreux (15.0 – 20.55) =================
      leadIn("#s8-lead", 15.2);
      punch("#s8-big", 15.45);
      rise("#s8-big2", 15.95, 0.4);
      tl.fromTo("#s8-dish", { x: 800, rotation: 30, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.3)" }, 15.4);
      drift("#s8-dish", 16.0, 4.4, { rotation: 10, scale: 1.04 });
      // line set 1 — plats africains faits maison + création maison
      leadIn("#s8-l1", 16.65);
      punch("#s8-m1", 17.65, 0.3);
      tl.fromTo("#s8-trio .mini", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.09 }, 17.2);
      tl.fromTo("#s8-chips .pill", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.4)", stagger: 0.07 }, 17.85);
      pushOut("#s8-g1", 18.45, -300, 0.22);
      // line set 2 — service rapide & pratique + clock
      leadIn("#s8-l2", 18.6);
      punch("#s8-m2", 18.95);
      rise("#s8-m3", 19.6, 0.35);
      popIn("#s8-clock", 18.9, 0.4);
      tl.fromTo("#s8-hand1", { rotation: 0, svgOrigin: "50 50" }, { rotation: 720, svgOrigin: "50 50", duration: 1.6, ease: "power2.inOut" }, 19.0);
      tl.fromTo("#s8-hand2", { rotation: 0, svgOrigin: "50 50" }, { rotation: 120, svgOrigin: "50 50", duration: 1.6, ease: "power2.inOut" }, 19.0);
      wipe(20.55, "#wp-r");

      // ================= S9 · En ligne / WhatsApp (20.5 – 24.05) =================
      tl.fromTo("#s9-phone", { y: 900, rotation: 10 }, { y: 0, rotation: -4, duration: 0.6, ease: "expo.out" }, 20.55);
      tl.fromTo("#s9-shot", { scale: 1, transformOrigin: "50% 0%" }, { scale: 1.12, duration: 2.8, ease: "power1.inOut" }, 21.0);
      drift("#s9-phone", 21.2, 2.7, { rotation: 2 });
      leadIn("#s9-lead", 20.7);
      tl.fromTo(urlChars, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out", stagger: 0.055 }, 21.55);
      tl.to("#s9-url", { scale: 1.04, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "0% 50%" }, 22.95);
      leadIn("#s9-lead2", 23.05);
      tl.fromTo("#s9-wa", { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 23.25);
      wipe(24.05, "#wp-k", -1);

      // ================= S10 · Paiement (24.0 – 27.8) =================
      leadIn("#s10-lead", 24.2);
      tl.fromTo("#s10-k1", { y: 300, opacity: 0, rotation: -8 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" }, 25.15);
      tl.fromTo("#s10-k2", { y: 300, opacity: 0, rotation: 8 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" }, 25.7);
      tl.fromTo("#s10-k3", { y: 300, opacity: 0, rotation: -8 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" }, 26.75);
      tl.to("#s10-k3", { scale: 1.08, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 }, 27.2);
      wipe(27.8, "#wp-r");

      // ================= S11 · Livraison Allô (27.75 – 31.0) =================
      tl.to("#s11-rays", { rotation: 40, duration: 3.3, ease: "none" }, 27.75);
      lines11.forEach((l) => {
        tl.fromTo(l.el, { x: W + l.off * 600 }, { x: -l.w - 100, duration: l.speed, ease: "none", repeat: Math.ceil(3.2 / l.speed) }, 27.8);
      });
      tl.fromTo("#s11-rider", { x: -W, filter: "blur(16px)" }, { x: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, 27.85);
      tl.to("#s11-rider", { y: -8, duration: 0.16, ease: "sine.inOut", yoyo: true, repeat: 13 }, 28.6);
      leadIn("#s11-lead", 27.9);
      popIn("#s11-allo", 28.2, 0.45);
      rise("#s11-big > div", 29.35, 0.4);
      tl.fromTo("#s11-big > div:nth-child(2)", { yPercent: 70 }, { yPercent: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, 29.95);
      tl.fromTo("#s11-tag", { scale: 2.4, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: -3, duration: 0.3, ease: "power4.in" }, 30.25);
      wipe(31.0, "#wp-w");

      // ================= S12 · À partir de 500 F (30.95 – 32.95) =================
      tl.to("#s12-rays", { rotation: 20, duration: 2.05, ease: "none" }, 30.95);
      leadIn("#s12-lead", 31.0);
      punch("#s12-big", 31.5);
      tl.fromTo("#s12-medal", { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.8)" }, 31.1);
      const counter = { v: 0 };
      const numEl = document.getElementById("s12-num");
      tl.fromTo(
        counter,
        { v: 0 },
        {
          v: 500,
          duration: 0.6,
          ease: "power2.out",
          onUpdate: () => {
            numEl.textContent = Math.round(counter.v / 10) * 10 + " F";
          },
        },
        31.75,
      );
      tl.to("#s12-medal", { scale: 1.08, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, 32.35);
      wipe(32.95, "#wp-r");

      // ================= S13 · Signature (32.9 – 36.96) =================
      tl.to("#s13-rays", { rotation: 30, duration: 4.06, ease: "none" }, 32.9);
      tl.fromTo("#s13-logo", { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(1.7)" }, 33.05);
      tl.to("#s13-logo", { scale: 1.06, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 3 }, 33.7);
      leadIn("#s13-lead", 34.25);
      punch("#s13-big .w", 34.6);
      tl.set("#s13-big .w:nth-child(2), #s13-tj", { opacity: 0 }, 34.6);
      punch("#s13-big div:first-child .w:nth-child(2)", 34.78);
      punch("#s13-tj", 35.15, 0.3);
      tl.fromTo("#s13-pill", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }, 35.5);
      tl.fromTo("#s13-info", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 35.65);

      window.__timelines["main"] = tl;
