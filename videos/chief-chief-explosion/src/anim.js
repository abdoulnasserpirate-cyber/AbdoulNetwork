      // Deterministic pseudo-random (seeded LCG) for decorative elements.
      let seed = 1211;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const W = document.getElementById("root").offsetWidth;
      const H = document.getElementById("root").offsetHeight;
      const VERT = H > W;

      // starburst polygons
      function star(n, R, r, rot = 0) {
        const pts = [];
        for (let i = 0; i < n * 2; i++) {
          const a = (i / (n * 2)) * Math.PI * 2 + rot;
          const rr = i % 2 ? r : R;
          pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
        }
        return pts.join(" ");
      }
      document.querySelectorAll(".boom").forEach((svg) => {
        const ps = svg.querySelectorAll("polygon");
        [[18, 98, 62], [18, 80, 52], [18, 62, 40]].forEach(([n, R, r], i) => ps[i] && ps[i].setAttribute("points", star(n, R, r, i * 0.09)));
      });
      document.querySelectorAll(".bt").forEach((p) => p.setAttribute("points", star(16, 96, 74)));
      document.getElementById("trb1").setAttribute("points", star(14, 100, 70));
      document.getElementById("trb2").setAttribute("points", star(14, 82, 56, 0.22));

      // sparks (S3) and confetti (S11)
      function sparks(hostId, n, cx, cy, colors) {
        const host = document.getElementById(hostId);
        const out = [];
        for (let i = 0; i < n; i++) {
          const d = document.createElement("i");
          const w = 10 + Math.round(rnd() * 16);
          d.className = "dot";
          d.style.cssText = `left:${cx - w / 2}px;top:${cy - w / 2}px;width:${w}px;height:${Math.round(w * (0.4 + rnd() * 0.6))}px;background:${colors[i % colors.length]};border-radius:3px`;
          host.appendChild(d);
          const a = rnd() * Math.PI * 2;
          const r = 380 + rnd() * 700;
          out.push({ el: d, x: Math.cos(a) * r, y: Math.sin(a) * r, rot: (rnd() - 0.5) * 900 });
        }
        return out;
      }
      const sp3 = sparks("s3-sparks", 46, W / 2, H / 2, ["#ffffff", "#d6060f", "#ffffff"]);
      const sp9 = sparks("s9-hearts", 30, VERT ? 540 : 520, VERT ? 1300 : 560, ["#ffffff", "#121010", "#ffffff"]);

      // typed URL (S11)
      const urlHost = document.getElementById("s11-url");
      const urlChars = [];
      for (const ch of "chiefchiefrestaurant.com") {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = ch;
        urlHost.appendChild(s);
        urlChars.push(s);
      }

      const tl = gsap.timeline({ paused: true });
      tl.set("#tr-burst", { scale: 0, rotation: 0, transformOrigin: "50% 50%" }, 0);

      // ---------- transitions ----------
      // starburst iris: the burst grows to cover the frame at t, then shrinks away revealing the next scene
      function burstWipe(t) {
        tl.fromTo("#tr-burst", { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.24, ease: "power2.in", immediateRender: false }, t - 0.24);
        tl.to("#tr-burst", { scale: 0, rotation: 50, duration: 0.3, ease: "power2.out" }, t);
      }
      // flash + zoom punch into the next scene
      function flashZoom(t, scene) {
        tl.fromTo("#flash", { opacity: 0 }, { opacity: 0.95, duration: 0.05, ease: "none", immediateRender: false }, t - 0.05);
        tl.to("#flash", { opacity: 0, duration: 0.22, ease: "power2.out" }, t);
        if (scene) tl.fromTo(scene, { scale: 1.22 }, { scale: 1, duration: 0.4, ease: "expo.out", immediateRender: false }, t);
      }
      // ---------- motions ----------
      function slam(sel, t, d = 0.22) {
        tl.fromTo(sel, { scale: 2.8, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: d, ease: "power4.in" }, t);
      }
      function punch(sel, t, d = 0.34) {
        tl.fromTo(sel, { scale: 1.7, opacity: 0, filter: "blur(12px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "expo.out" }, t);
      }
      function popTag(sel, t, rot = -4) {
        tl.fromTo(sel, { scale: 0, opacity: 0, rotation: rot - 25 }, { scale: 1, opacity: 1, rotation: rot, duration: 0.42, ease: "back.out(2.8)" }, t);
      }
      function leadIn(sel, t) {
        tl.fromTo(sel, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: "power3.out" }, t);
      }
      function shake(sel, t, amp = 14, n = 4) {
        tl.fromTo(sel, { x: 0, y: 0 }, { x: amp, y: -amp * 0.4, duration: 0.035, ease: "none", yoyo: true, repeat: n, immediateRender: false }, t);
        tl.set(sel, { x: 0, y: 0 }, t + 0.035 * (n + 1));
      }
      function flyIn(sel, t, fromX, fromY, rot) {
        tl.fromTo(sel, { x: fromX, y: fromY, rotation: rot * 3, scale: 0.6, opacity: 0 }, { x: 0, y: 0, rotation: rot, scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.5)" }, t);
      }
      function wobble(sel, t, d, rot = 3) {
        tl.to(sel, { rotation: rot, scale: 1.04, duration: d, ease: "sine.inOut" }, t);
      }
      function marquee(scene, t, d) {
        document.getElementById(scene).querySelectorAll(".hz-run").forEach((el, i) => {
          tl.fromTo(el, { x: i % 2 ? -900 : 0 }, { x: i % 2 ? 0 : -900, duration: d, ease: "none" }, t);
        });
      }
      function strike(sel, t) {
        const p = document.querySelector(sel + " .marker path");
        const L = 460;
        p.style.strokeDasharray = L;
        tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.inOut" }, t);
        tl.to(sel, { opacity: 0.85, scale: 0.85, transformOrigin: "0% 50%", duration: 0.3, ease: "power2.out" }, t + 0.25);
      }
      function priceBoom(sel, burst, t) {
        tl.fromTo(sel, { scale: 3, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: -3, duration: 0.24, ease: "power4.in" }, t);
        tl.fromTo(burst, { scale: 0, rotation: -180 }, { scale: 1, rotation: -12, duration: 0.45, ease: "back.out(2.2)" }, t + 0.2);
        tl.to(burst + " svg", { rotation: 90, duration: 2.0, ease: "none" }, t + 0.6);
      }

      // ================= S1 · Attention (0 – 2.35) · NOIR =================
      marquee("s1", 0, 2.4);
      slam("#s1-att", 0.05, 0.2);
      shake("#s1", 0.26, 16, 4);
      tl.fromTo("#s1-burger", { scale: 0.15, rotation: -30, opacity: 0, transformPerspective: 1200, rotationY: 50 }, { scale: 1.05, rotation: -4, rotationY: 0, opacity: 1, duration: 0.6, ease: "back.out(1.4)" }, 0.35);
      tl.to("#s1-burger", { scale: 1.16, rotation: 3, duration: 1.4, ease: "sine.inOut" }, 0.95);
      tl.fromTo("#s1-hot", { x: -700, skewX: 25, opacity: 0 }, { x: 0, skewX: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, 0.75);
      tl.fromTo("#s1-logo", { scale: 0, rotationY: -180, transformPerspective: 1000 }, { scale: 1, rotationY: 0, duration: 0.45, ease: "back.out(1.8)" }, 1.55);
      burstWipe(2.35);

      // ================= S2 · Ven / Sam / Dim (2.35 – 4.15) · ROUGE =================
      leadIn("#s2-ce", 2.45);
      [2.75, 3.25, 3.7].forEach((t, i) => {
        tl.fromTo(`#s2-days .dz:nth-child(${i + 1})`, { rotationX: -95, opacity: 0, y: -60 }, { rotationX: 0, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.8)" }, t);
      });
      flashZoom(4.15, "#s3");

      // ================= S3 · Explosion du goût (4.15 – 6.5) · NOIR =================
      leadIn("#s3-lead", 4.3);
      tl.fromTo("#s3-boom", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.8)" }, 4.85);
      tl.to("#s3-boom", { rotation: 40, duration: 1.6, ease: "none" }, 5.25);
      slam("#s3-big", 5.0, 0.22);
      shake("#s3", 5.22, 22, 6);
      tl.fromTo("#flash", { opacity: 0 }, { opacity: 0.6, duration: 0.04, ease: "none", immediateRender: false }, 5.18);
      tl.to("#flash", { opacity: 0, duration: 0.25 }, 5.22);
      document.querySelectorAll("#s3-rings .ring").forEach((r, i) => {
        tl.fromTo(r, { scale: 0, opacity: 0.9 }, { scale: 130, opacity: 0, duration: 0.6, ease: "power2.out" }, 5.22 + i * 0.12);
      });
      sp3.forEach((c, i) => {
        tl.fromTo(c.el, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 0.3 }, { x: c.x, y: c.y, rotation: c.rot, scale: 1, opacity: 0, duration: 1.0, ease: "expo.out" }, 5.22 + (i % 5) * 0.01);
      });
      popTag("#s3-sub", 5.55, -3);
      burstWipe(6.45);

      // ================= S4 · −10 % trio (6.45 – 9.45) · ROUGE =================
      tl.fromTo("#s4-pct", { scale: 3, opacity: 0, rotationY: -70, transformPerspective: 1200 }, { scale: 1, opacity: 1, rotationY: 0, duration: 0.3, ease: "power3.in" }, 6.55);
      shake("#s4", 6.85, 16, 4);
      tl.to("#s4-pct", { rotationY: 16, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1, transformPerspective: 1200 }, 7.1);
      [["#s4-p1", 7.05], ["#s4-p2", 7.85], ["#s4-p3", 8.55]].forEach(([id, t], i) => {
        tl.fromTo(id, { rotationY: VERT ? 0 : 90, rotationX: VERT ? 90 : 0, opacity: 0 }, { rotationY: VERT ? 0 : i === 1 ? 0 : i === 0 ? 8 : -8, rotationX: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, t);
      });
      flashZoom(9.45, "#s5");

      // ================= S5 · Burger 1500 → 1350 (9.45 – 13.4) · BLANC =================
      tl.fromTo("#s5-slash", { xPercent: 120 }, { xPercent: 0, duration: 0.4, ease: "expo.out" }, 9.45);
      flyIn("#s5-burger", 9.55, VERT ? 0 : 700, VERT ? 700 : 0, -6);
      wobble("#s5-burger", 10.1, 3.2, 4);
      punch("#s5-name", 9.6, 0.3);
      punch("#s5-old", 10.65, 0.3);
      strike("#s5-old", 11.6);
      priceBoom("#s5-new", "#s5-burst", 12.15);
      shake("#s5", 12.39, 14, 4);
      burstWipe(13.4);

      // ================= S6 · Shawarma viande 1350 (13.4 – 16.2) · NOIR =================
      tl.fromTo("#v-shaw", { x: VERT ? 0 : 700, y: VERT ? 900 : 0, rotationY: -35, transformPerspective: 1600 }, { x: 0, y: 0, rotationY: -8, duration: 0.55, ease: "expo.out" }, 13.4);
      tl.to("#v-shaw", { rotationY: 6, duration: 2.2, ease: "sine.inOut", transformPerspective: 1600 }, 13.95);
      tl.fromTo("#s6-name > div", { x: -500, opacity: 0, skewX: 20 }, { x: 0, opacity: 1, skewX: 0, duration: 0.3, ease: "expo.out", stagger: 0.35 }, 13.6);
      priceBoom("#s6-new", "#s6-burst", 15.0);
      shake("#s6", 15.24, 14, 4);
      flashZoom(16.15, "#s7");

      // ================= S7 · Shawarma poulet 2000 → 1800 (16.15 – 21.75) · ROUGE =================
      tl.fromTo("#s7-card", { y: VERT ? 900 : 0, x: VERT ? 0 : 800, rotation: 20, rotationY: 40, transformPerspective: 1600 }, { y: 0, x: 0, rotation: 4, rotationY: 0, duration: 0.6, ease: "back.out(1.3)" }, 16.2);
      tl.fromTo("#s7-card img", { scale: 1.02 }, { scale: 1.18, duration: 5.4, ease: "sine.inOut" }, 16.2);
      tl.fromTo("#s7-name > div", { x: -500, opacity: 0, skewX: 20 }, { x: 0, opacity: 1, skewX: 0, duration: 0.3, ease: "expo.out", stagger: 0.55 }, 16.4);
      punch("#s7-old", 17.6, 0.3);
      strike("#s7-old", 18.6);
      priceBoom("#s7-new", "#s7-burst", 19.3);
      shake("#s7", 19.54, 14, 4);
      tl.to("#s7-new", { scale: 1.06, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 3 }, 20.0);
      burstWipe(21.75);

      // ================= S8 · Tacos 1800 (21.75 – 23.05) · BLANC =================
      tl.fromTo("#s8-slash", { xPercent: -120 }, { xPercent: 0, duration: 0.35, ease: "expo.out" }, 21.75);
      flyIn("#s8-tacos", 21.8, VERT ? 0 : -700, VERT ? 700 : 0, 5);
      slam("#s8-name", 21.85, 0.2);
      priceBoom("#s8-new", "#s8-only", 22.15);
      flashZoom(23.05, "#s9");

      // ================= S9 · Croquez / savourez / partagez (23.05 – 26.4) · ROUGE =================
      marquee("s9", 23.05, 3.4);
      tl.fromTo("#s9-femme", { x: VERT ? 0 : 700, y: VERT ? 900 : 0, rotation: 8, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 23.05);
      tl.to("#s9-femme", { scale: 1.05, duration: 3.0, ease: "sine.inOut" }, 23.5);
      popTag("#s9-w1", 23.1, -5);
      popTag("#s9-w2", 23.55, 3);
      popTag("#s9-w3", 24.35, -3);
      slam("#s9-ador", 25.15, 0.22);
      shake("#s9", 25.37, 12, 4);
      sp9.forEach((c, i) => {
        tl.fromTo(c.el, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 0.3 }, { x: c.x * 0.8, y: c.y * 0.8, rotation: c.rot, scale: 1, opacity: 0, duration: 1.0, ease: "expo.out" }, 25.37 + (i % 5) * 0.01);
      });
      burstWipe(26.4);

      // ================= S10 · Services (26.4 – 28.55) · NOIR =================
      [26.45, 27.2, 27.75].forEach((t, i) => {
        tl.fromTo(`#s10-row .svc3d:nth-child(${i + 1})`, { rotationX: -95, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, t);
      });
      flashZoom(28.55, "#s11");

      // ================= S11 · Commandez (28.55 – 36.95) · ROUGE =================
      marquee("s11", 28.55, 8.4);
      slam("#s11-big", 28.7, 0.22);
      shake("#s11", 28.92, 12, 3);
      flyIn("#s11-a", 28.8, VERT ? 600 : 700, 0, -6);
      flyIn("#s11-b", 29.1, VERT ? -600 : 700, 0, 5);
      tl.to("#s11-a", { rotation: 4, y: -20, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 4 }, 29.4);
      tl.to("#s11-b", { rotation: -4, y: 20, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 4 }, 29.6);
      tl.fromTo(urlChars, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out", stagger: 0.062 }, 29.6);
      popTag("#s11-wa", 31.5, -2);
      [32.6, 33.8, 34.9, 35.9].forEach((t, i) => {
        slam(`#s11-num .w:nth-child(${i + 1})`, t, 0.2);
      });
      tl.to("#s11-num", { scale: 1.05, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "0% 50%" }, 36.3);
      burstWipe(36.95);

      // ================= S12 · Signature (36.95 – 40.72) · NOIR =================
      tl.fromTo("#s12-boom", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, 37.0);
      tl.to("#s12-boom", { rotation: 60, duration: 3.2, ease: "none" }, 37.5);
      tl.fromTo("#s12-logo", { scale: 0, rotationY: -180, transformPerspective: 1200 }, { scale: 1, rotationY: 0, duration: 0.55, ease: "back.out(1.6)" }, 37.05);
      leadIn("#s12-lead", 37.95);
      slam("#s12-big", 38.95, 0.22);
      shake("#s12", 39.17, 16, 4);
      tl.fromTo("#s12-band > *", { y: 80, opacity: 0, scale: 0.6 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.2)", stagger: 0.08 }, 37.6);

      window.__timelines["main"] = tl;
