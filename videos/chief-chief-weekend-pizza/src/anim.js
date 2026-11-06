      // Deterministic pseudo-random (seeded LCG) for decorative elements.
      let seed = 611;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

      // ---------- 3D pizza: a stack of crust discs under the photo gives it real thickness ----------
      document.querySelectorAll(".pz3d").forEach((host) => {
        const stage = host.parentElement;
        const sh = document.createElement("i");
        sh.className = "pz-shadow";
        stage.insertBefore(sh, host);
        for (let i = 14; i >= 1; i--) {
          const l = document.createElement("i");
          l.className = "pz-layer";
          const shade = Math.round(150 - i * 5);
          l.style.cssText = `transform:translateZ(${-i * 2.6}px);background:rgb(${shade + 40},${Math.round(shade * 0.62)},${Math.round(shade * 0.28)})`;
          host.appendChild(l);
        }
        const top = document.createElement("div");
        top.className = "pz-top";
        const im = document.createElement("img");
        im.src = host.dataset.img;
        im.alt = "";
        top.appendChild(im);
        host.appendChild(top);
      });

      // typed URL (S8)
      const urlHost = document.getElementById("s8-url");
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

      // ---------- helpers (fluid eases) ----------
      function wipe(t, id, dir = 1) {
        tl.fromTo(id, { xPercent: -110 * dir, skewX: -10 }, { xPercent: 0, skewX: -10, duration: 0.24, ease: "power2.in", immediateRender: false }, t - 0.24);
        tl.to(id, { xPercent: 110 * dir, duration: 0.32, ease: "power2.out" }, t);
      }
      function punch(sel, t, d = 0.36) {
        tl.fromTo(sel, { scale: 1.7, opacity: 0, filter: "blur(12px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "expo.out" }, t);
      }
      function slam(sel, t, d = 0.24) {
        tl.fromTo(sel, { scale: 2.5, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: "power3.in" }, t);
      }
      function leadIn(sel, t) {
        tl.fromTo(sel, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
      }
      function popUp(sel, t, rot = 0) {
        tl.fromTo(sel, { scale: 0, opacity: 0, rotation: rot - 20 }, { scale: 1, opacity: 1, rotation: rot, duration: 0.45, ease: "back.out(2.6)" }, t);
      }
      function out(sel, t, d = 0.22) {
        tl.to(sel, { x: -220, opacity: 0, filter: "blur(10px)", duration: d, ease: "power2.in" }, t);
      }
      function shake(sel, t, amp = 12, n = 4) {
        tl.fromTo(sel, { x: 0 }, { x: amp, duration: 0.04, ease: "none", yoyo: true, repeat: n, immediateRender: false }, t);
        tl.set(sel, { x: 0 }, t + 0.04 * (n + 1));
      }
      // 3D pizza: arrive from depth, tilt to show thickness, keep spinning
      function pizza3d(id, t, d, opts = {}) {
        tl.fromTo(id, { z: -1600, rotationX: 70, rotationY: -40, rotationZ: -180, opacity: 0 }, { z: 0, rotationX: 28, rotationY: 0, rotationZ: 0, opacity: 1, duration: 0.9, ease: "expo.out" }, t);
        tl.to(id, { rotationZ: opts.spin || 120, duration: d - 0.9, ease: "none" }, t + 0.9);
        tl.to(id, { rotationX: 12, duration: (d - 0.9) / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, t + 0.9);
      }

      // ================= S1 · Le week-end arrive (0 – 3.65) =================
      tl.fromTo("#s1-rays", { rotation: 0 }, { rotation: 25, duration: 3.7, ease: "none" }, 0);
      punch("#s1-big", 0.1, 0.4);
      tl.fromTo("#s1-logo", { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, 1.25);
      tl.to("#s1-big", { y: -200, scale: 0.6, opacity: 0, duration: 0.3, ease: "power2.in" }, 2.1);
      leadIn("#s1-lead", 2.35);
      pizza3d("#pz1", 2.3, 1.4, { spin: 90 });
      slam("#s1-pizza", 3.2, 0.24);
      shake("#s1", 3.44, 12, 3);
      wipe(3.65, "#wp-k");

      // ================= S2 · Ven / Sam / Dim + promo (3.65 – 6.45) =================
      document.querySelectorAll("#s2-beams .beam").forEach((b, i) => {
        tl.fromTo(b, { rotation: i % 2 ? -26 : 26 }, { rotation: i % 2 ? 20 : -20, duration: 2.8, ease: "sine.inOut" }, 3.65);
      });
      [3.68, 4.25, 4.68].forEach((t, i) => {
        tl.fromTo(`#s2-days .flip:nth-child(${i + 1}) .flip-in`, { rotationX: -100, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.55, ease: "back.out(1.6)" }, t);
      });
      leadIn("#s2-lead", 5.25);
      tl.fromTo("#s2-promo", { y: 260, rotation: -12 }, { y: 0, rotation: -4, duration: 0.4, ease: "back.out(2.2)" }, 5.62);
      tl.to("#s2-promo", { scale: 1.06, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 1 }, 6.0);
      wipe(6.45, "#wp-w");

      // ================= S3 · −10 % (6.45 – 9.3) =================
      leadIn("#s3-lead", 6.55);
      pizza3d("#pz3", 6.5, 2.8, { spin: 150 });
      tl.fromTo("#s3-pct", { scale: 3, opacity: 0, rotationY: -60, transformPerspective: 1200 }, { scale: 1, opacity: 1, rotationY: 0, duration: 0.35, ease: "power3.in" }, 7.1);
      shake("#s3", 7.45, 16, 4);
      tl.to("#s3-pct", { rotationY: 14, duration: 0.8, ease: "sine.inOut", yoyo: true, repeat: 1, transformPerspective: 1200 }, 7.7);
      tl.fromTo("#s3-red", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, 7.65);
      tl.fromTo("#s3-all", { x: -600, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 8.15);
      popUp("#s3-badge", 7.35, -10);
      wipe(9.3, "#wp-r", -1);

      // ================= S4 · Généreuses / passion / chaudes (9.3 – 13.65) =================
      leadIn("#s4-a .lead", 9.4);
      punch("#s4-a .big", 9.75, 0.32);
      tl.fromTo("#v-tiree", { y: 900, rotationY: 40, transformPerspective: 1600 }, { y: 0, rotationY: 18, duration: 0.6, ease: "expo.out" }, 9.35);
      out("#s4-a", 10.7);
      leadIn("#s4-b .lead", 10.85);
      punch("#s4-b .big", 11.4, 0.32);
      tl.fromTo("#v-bulles", { y: 900, scale: 0.8, transformPerspective: 1600 }, { y: 0, scale: 1, duration: 0.6, ease: "expo.out" }, 10.8);
      out("#s4-b", 11.95);
      leadIn("#s4-c .lead", 12.1);
      punch("#s4-c .big", 12.6, 0.32);
      tl.fromTo("#v-fumee", { y: 900, rotationY: -40, transformPerspective: 1600 }, { y: 0, rotationY: -18, duration: 0.6, ease: "expo.out" }, 12.0);
      tl.to(["#v-tiree", "#v-bulles", "#v-fumee"], { y: -1100, duration: 0.3, ease: "power2.in", stagger: 0.04 }, 13.3);
      wipe(13.65, "#wp-r");

      // ================= S5 · Amis / famille / solo (13.65 – 15.9) =================
      tl.fromTo("#s5-rays", { rotation: 0 }, { rotation: 20, duration: 2.3, ease: "none" }, 13.65);
      [["#s5-c1", "#s5-p1", 13.75, -16], ["#s5-c2", "#s5-p2", 14.35, 0], ["#s5-c3", "#s5-p3", 14.95, 16]].forEach(([c, p, t, r]) => {
        tl.fromTo(c, { y: 700, rotation: r * 2, rotationY: r * 3, transformPerspective: 1600, opacity: 0 }, { y: 0, rotation: r, rotationY: r * 1.2, opacity: 1, duration: 0.55, ease: "back.out(1.4)" }, t);
        popUp(p, t + 0.05, r ? -r / 3 : 4);
      });
      tl.to("#s5-fan", { scale: 1.05, duration: 0.8, ease: "sine.inOut" }, 15.1);
      wipe(15.9, "#wp-k", -1);

      // ================= S6 · Raison de craquer (15.9 – 18.25) =================
      tl.fromTo("#v-part", { x: 700, rotationY: -40, transformPerspective: 1600 }, { x: 0, rotationY: -10, duration: 0.6, ease: "expo.out" }, 15.95);
      tl.to("#v-part", { rotationY: 6, duration: 1.6, ease: "sine.inOut" }, 16.6);
      leadIn("#s6-lead", 16.0);
      slam("#s6-big", 17.35, 0.24);
      shake("#s6", 17.6, 14, 4);
      wipe(18.25, "#wp-w");

      // ================= S7 · Sur place / emporter / livré (18.25 – 21.15) =================
      [18.38, 18.98, 19.7].forEach((t, i) => {
        tl.fromTo(`#s7-tiles .flip:nth-child(${i + 1}) .flip-in`, { rotationX: -100, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.55, ease: "back.out(1.6)" }, t);
      });
      popUp("#s7-sub", 20.1, -2);
      tl.to(["#s7-tiles", "#s7-sub"], { y: -60, opacity: 0, filter: "blur(10px)", duration: 0.22, ease: "power2.in" }, 20.85);
      wipe(21.15, "#wp-r", -1);

      // ================= S8 · Commandez (21.15 – 30.75) =================
      pizza3d("#pz8", 21.2, 9.5, { spin: 330 });
      punch("#s8-big", 21.3, 0.36);
      tl.fromTo(urlChars, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out", stagger: 0.06 }, 22.2);
      tl.fromTo("#s8-wa", { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 24.0);
      [25.75, 26.45, 27.15, 28.25].forEach((t, i) => slam(`#s8-num .w:nth-child(${i + 1})`, t, 0.22));
      popUp("#s8-rib", 29.0, -2);
      tl.to("#s8-num", { scale: 1.05, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "0% 50%" }, 29.6);
      wipe(30.75, "#wp-k");

      // ================= S9 · Signature (30.75 – 34.53) =================
      tl.fromTo("#s9-rays", { rotation: 0 }, { rotation: 30, duration: 3.8, ease: "none" }, 30.75);
      leadIn("#s9-lead0", 30.85);
      tl.fromTo("#s9-logo", { scale: 0, rotationY: -180, transformPerspective: 1200 }, { scale: 1, rotationY: 0, duration: 0.6, ease: "back.out(1.6)" }, 31.3);
      leadIn("#s9-lead", 32.05);
      slam("#s9-big", 33.25, 0.24);
      tl.fromTo("#s9-band", { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: "expo.out" }, 31.6);

      window.__timelines["main"] = tl;
