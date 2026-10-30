      // Deterministic pseudo-random (seeded LCG) for decorative elements.
      let seed = 3010;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

      // confetti (S4)
      const confHost = document.getElementById("s4-confetti");
      const conf = [];
      for (let i = 0; i < 40; i++) {
        const d = document.createElement("i");
        const w = 10 + Math.round(rnd() * 14);
        d.className = "dot";
        d.style.cssText = `left:${560 - w / 2}px;top:520px;width:${w}px;height:${Math.round(w * (0.4 + rnd() * 0.6))}px;background:${["#ffffff", "#121010", "#ff4a50"][i % 3]};border-radius:3px`;
        confHost.appendChild(d);
        const a = rnd() * Math.PI * 2;
        const r = 300 + rnd() * 600;
        conf.push({ el: d, x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7 - 100, rot: (rnd() - 0.5) * 900, fall: 240 + rnd() * 360 });
      }
      // typed URL (S9)
      const urlHost = document.getElementById("s9-url");
      const urlChars = [];
      for (const ch of "chiefchiefrestaurant.com") {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = ch;
        urlHost.appendChild(s);
        urlChars.push(s);
      }

      const tl = gsap.timeline({ paused: true });
      tl.set(".wpanel", { xPercent: -110 }, 0);

      // ---------- smooth helpers ----------
      // colour panel crosses the frame, fully covering it at t (soft eases)
      function wipe(t, id, dir = 1) {
        tl.fromTo(id, { xPercent: -110 * dir, skewX: -10 }, { xPercent: 0, skewX: -10, duration: 0.26, ease: "power2.in", immediateRender: false }, t - 0.26);
        tl.to(id, { xPercent: 110 * dir, duration: 0.34, ease: "power2.out" }, t);
      }
      function punch(sel, t, d = 0.36) {
        tl.fromTo(sel, { scale: 1.6, opacity: 0, filter: "blur(12px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "expo.out" }, t);
      }
      function slam(sel, t, d = 0.26) {
        tl.fromTo(sel, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: "power3.in" }, t);
      }
      function leadIn(sel, t) {
        tl.fromTo(sel, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
      }
      function rise(sel, t, d = 0.4) {
        tl.fromTo(sel, { yPercent: 60, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }, { yPercent: 0, opacity: 1, clipPath: "inset(0% 0% -20% 0%)", duration: d, ease: "expo.out" }, t);
      }
      function popIn(sel, t, d = 0.4) {
        tl.fromTo(sel, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: "back.out(2)" }, t);
      }
      function cardIn(sel, t, rot, from = 700) {
        tl.fromTo(sel, { x: from, rotation: rot + 14, opacity: 0 }, { x: 0, rotation: rot, opacity: 1, duration: 0.55, ease: "back.out(1.3)" }, t);
      }
      // "photo → video": slow push-in + drift on the image inside a card
      function kenBurns(sel, t, d, dir = 1) {
        tl.fromTo(sel + " img", { scale: 1.02, xPercent: -2 * dir }, { scale: 1.16, xPercent: 2 * dir, duration: d, ease: "sine.inOut" }, t);
      }
      function strike(sel, t) {
        tl.fromTo(sel + " .strike", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.inOut" }, t);
        tl.to(sel, { opacity: 0.55, scale: 0.86, transformOrigin: "0% 50%", duration: 0.35, ease: "power2.out" }, t + 0.2);
      }

      // ================= S1 · Fin du mois (0 – 3.35) =================
      tl.fromTo("#s1-rays", { rotation: 0 }, { rotation: 25, duration: 3.4, ease: "none" }, 0);
      leadIn("#s1-lead", 0.1);
      punch("#s1-big", 0.45, 0.42);
      tl.fromTo("#s1-cal", { y: 400, rotation: -20, opacity: 0 }, { y: 0, rotation: -8, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }, 0.5);
      tl.to("#s1-cal", { rotation: 6, duration: 2.0, ease: "sine.inOut" }, 1.1);
      tl.fromTo("#s1-logo", { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, 1.55);
      popIn("#s1-gate", 2.65, 0.4);
      tl.to("#s1-gate", { scale: 1.06, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1 }, 3.0);
      wipe(3.35, "#wp-k");

      // ================= HERO dish (3.35 – 13.15) =================
      tl.fromTo("#hero-in", { x: 900, rotation: 160, scale: 0.7, opacity: 0 }, { x: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 3.4);
      tl.to("#hero-in img", { rotation: 35, duration: 2.6, ease: "none" }, 3.6);
      tl.fromTo("#hero-in .shine", { xPercent: 0 }, { xPercent: 520, duration: 0.9, ease: "power2.inOut" }, 5.3);
      document.querySelectorAll(".steam").forEach((s, i) => {
        tl.fromTo(s, { y: 40, opacity: 0, scaleY: 0.6 }, { y: -120, opacity: 0.9, scaleY: 1.2, duration: 1.3, ease: "sine.out", repeat: 1, delay: 0 }, 4.0 + i * 0.35);
      });
      tl.to(["#hero-in", "#hero-steam"], { scale: 0.3, x: -400, y: 200, opacity: 0, duration: 0.3, ease: "power2.in" }, 6.05);
      // back in S4 with the −10 %
      tl.fromTo("#hero-in", { scale: 0.2, x: 300, y: 300, opacity: 0, rotation: -90 }, { scale: 1, x: 0, y: 0, opacity: 1, rotation: 0, duration: 0.7, ease: "back.out(1.4)", immediateRender: false }, 9.4);
      tl.to("#hero-in img", { rotation: 95, duration: 3.6, ease: "none" }, 9.5);
      tl.fromTo("#hero-in .shine", { xPercent: 0 }, { xPercent: 520, duration: 0.9, ease: "power2.inOut", immediateRender: false }, 11.3);

      // ================= S2 · Place à l'attiéké (3.35 – 6.3) =================
      tl.fromTo("#s2-rays", { rotation: 0 }, { rotation: 20, duration: 3.0, ease: "none" }, 3.35);
      leadIn("#s2-lead", 3.45);
      punch("#s2-big", 4.3, 0.4);
      tl.fromTo("#s2-sub", { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 5.35);
      tl.to(["#s2-lead", "#s2-big", "#s2-sub"], { x: -200, opacity: 0, filter: "blur(10px)", duration: 0.22, ease: "power2.in" }, 5.98);
      wipe(6.3, "#wp-w");

      // ================= S3 · Généreux / savoureux / régal (6.3 – 9.2) =================
      cardIn("#s3-c1", 6.35, -6);
      kenBurns("#s3-c1", 6.35, 2.9, 1);
      rise("#s3-w1", 6.4);
      cardIn("#s3-c2", 7.05, 4);
      kenBurns("#s3-c2", 7.05, 2.2, -1);
      rise("#s3-w2", 7.1);
      cardIn("#s3-c3", 8.1, 9);
      kenBurns("#s3-c3", 8.1, 1.2, 1);
      popIn("#s3-w3", 8.2, 0.4);
      wipe(9.2, "#wp-r", -1);

      // ================= S4 · −10 % (9.2 – 13.1) =================
      document.querySelectorAll("#s4-beams .beam").forEach((b, i) => {
        tl.fromTo(b, { rotation: i % 2 ? -26 : 26 }, { rotation: i % 2 ? 20 : -20, duration: 3.9, ease: "sine.inOut" }, 9.2);
      });
      leadIn("#s4-lead", 9.35);
      popIn("#s4-promo", 9.9, 0.4);
      slam("#s4-pct", 11.15, 0.26);
      tl.fromTo("#s4", { x: 0 }, { x: 14, duration: 0.04, ease: "none", yoyo: true, repeat: 5, immediateRender: false }, 11.42);
      tl.set("#s4", { x: 0 }, 11.66);
      conf.forEach((c, i) => {
        tl.fromTo(c.el, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 0.3 }, { x: c.x, y: c.y, rotation: c.rot, scale: 1, duration: 0.6, ease: "expo.out" }, 11.42 + (i % 5) * 0.01);
        tl.to(c.el, { y: c.y + c.fall, opacity: 0, duration: 1.0, ease: "power1.in" }, 12.02);
      });
      tl.fromTo("#s4-sub", { x: -600, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 11.85);
      tl.to("#s4-pct", { scale: 1.05, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 }, 12.3);
      wipe(13.1, "#wp-k");

      // ================= S5 · Le plat 3000 → 2700 (13.1 – 16.2) =================
      cardIn("#s5-card", 13.15, -4, -800);
      kenBurns("#s5-card", 13.15, 3.1, 1);
      leadIn("#s5-lead", 13.25);
      punch("#s5-old", 13.6, 0.36);
      strike("#s5-old", 14.5);
      leadIn("#s5-arrow", 14.55);
      slam("#s5-new", 14.95, 0.26);
      tl.fromTo("#s5-badge", { scale: 0, rotation: -120 }, { scale: 1, rotation: -10, duration: 0.45, ease: "back.out(2)" }, 15.15);
      tl.to("#s5-new", { scale: 1.05, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1 }, 15.5);
      wipe(16.2, "#wp-w", -1);

      // ================= S6 · Le grand plat 7000 → 6300 (16.2 – 19.85) =================
      cardIn("#s6-card", 16.25, 4, 800);
      kenBurns("#s6-card", 16.25, 3.6, -1);
      leadIn("#s6-lead", 16.35);
      punch("#s6-old", 17.15, 0.36);
      strike("#s6-old", 18.0);
      leadIn("#s6-arrow", 18.05);
      slam("#s6-new", 18.45, 0.26);
      tl.fromTo("#s6-badge", { scale: 0, rotation: 120 }, { scale: 1, rotation: 10, duration: 0.45, ease: "back.out(2)" }, 18.65);
      tl.to("#s6-new", { scale: 1.05, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1 }, 19.1);
      wipe(19.85, "#wp-r");

      // ================= S7 · Ven / Sam / Dim (19.85 – 22.95) =================
      slam("#s7-pct", 20.15, 0.26);
      leadIn("#s7-lead", 20.85);
      [21.35, 21.85, 22.2].forEach((t, i) => {
        tl.fromTo(`#s7-days .day:nth-child(${i + 1})`, { y: 260, opacity: 0, rotation: i % 2 ? 8 : -8 }, { y: 0, opacity: 1, rotation: 0, duration: 0.4, ease: "back.out(1.8)" }, t);
      });
      wipe(22.95, "#wp-k", -1);

      // ================= S8 · Sur place / emporter / livré (22.95 – 25.9) =================
      tl.fromTo("#s8-rays", { rotation: 0 }, { rotation: 25, duration: 3.0, ease: "none" }, 22.95);
      [["#s8-k1", 23.05], ["#s8-k2", 23.75], ["#s8-k3", 24.45]].forEach(([id, t], i) => {
        tl.fromTo(id, { y: 300, opacity: 0, rotation: i % 2 ? 8 : -8 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" }, t);
      });
      tl.fromTo("#s8-sub", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }, 24.9);
      wipe(25.9, "#wp-w");

      // ================= S9 · Commandez (25.9 – 33.75) =================
      cardIn("#s9-card", 25.95, 4, 800);
      kenBurns("#s9-card", 25.95, 7.8, 1);
      punch("#s9-big", 26.0, 0.36);
      tl.fromTo(urlChars, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out", stagger: 0.055 }, 27.0);
      tl.fromTo("#s9-wa", { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 28.5);
      [29.25, 30.65, 31.7, 32.8].forEach((t, i) => slam(`#s9-num .w:nth-child(${i + 1})`, t, 0.22));
      tl.to("#s9-num", { scale: 1.05, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "0% 50%" }, 33.2);
      wipe(33.75, "#wp-r", -1);

      // ================= S10 · Signature (33.75 – 37.41) =================
      tl.fromTo("#s10-rays", { rotation: 0 }, { rotation: 30, duration: 3.7, ease: "none" }, 33.75);
      tl.fromTo("#s10-logo", { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, 33.9);
      leadIn("#s10-lead", 34.95);
      slam("#s10-big", 35.85, 0.26);
      tl.fromTo("#s10-band", { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: "expo.out" }, 34.2);
      tl.fromTo("#s10-band .pill", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.1 }, 34.5);

      window.__timelines["main"] = tl;
