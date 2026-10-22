      // Deterministic pseudo-random (seeded LCG) for decorative elements.
      let seed = 777;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const W = document.getElementById("root").offsetWidth;
      const H = document.getElementById("root").offsetHeight;
      const VERT = H > W;

      // speed lines (S7)
      const linesHost = document.getElementById("s7-lines");
      const lines = [];
      for (let i = 0; i < 16; i++) {
        const d = document.createElement("div");
        const w = 160 + Math.round(rnd() * 420);
        d.className = "sline";
        d.style.cssText = `left:0;top:${Math.round(40 + rnd() * (H - 80))}px;width:${w}px;height:${4 + Math.round(rnd() * 8)}px;background:${i % 3 ? "rgba(255,255,255,0.75)" : "#121010"}`;
        linesHost.appendChild(d);
        lines.push({ el: d, w, speed: 0.3 + rnd() * 0.3, off: rnd() });
      }
      // medal rays (S7)
      const burst = document.getElementById("s7-burst");
      for (let i = 0; i < 14; i++) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        e.setAttribute("x", "94");
        e.setAttribute("y", "76");
        e.setAttribute("width", "12");
        e.setAttribute("height", "16");
        e.setAttribute("rx", "6");
        e.setAttribute("fill", "#ffffff");
        e.setAttribute("transform", `rotate(${(i / 14) * 360} 100 170)`);
        burst.appendChild(e);
      }
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
      // mosaic wall (S9) — every dish of the menu
      const WALL = [
        "src/plat-du-chef.jpg", "cut/pate-blanche.png", "cut/pate-rouge.png", "cut/pate-noire.png", "src/burger.jpg",
        "src/chawarma.jpg", "src/poulet-frites.jpg", "src/frites.jpg", "src/pizza.jpg", "src/poulet-complet.jpg",
        "src/salade-verte.jpg", "src/salade-crudites.jpg", "cut/sandwich.png", "src/formule-riz-creole.jpg", "src/formule-attieke.jpg",
        "src/plateau-partage.jpg", "src/spaghetti.jpg", "src/burger.jpg", "src/pizza.jpg", "src/plat-du-chef.jpg",
      ];
      const wall = document.getElementById("s9-wall");
      const nTiles = VERT ? 18 : 20;
      const tiles = [];
      for (let i = 0; i < nTiles; i++) {
        const t = document.createElement("div");
        t.className = "wt";
        const im = document.createElement("img");
        im.src = "assets/" + WALL[i % WALL.length];
        im.alt = "";
        t.appendChild(im);
        wall.appendChild(t);
        tiles.push(t);
      }

      const tl = gsap.timeline({ paused: true });
      tl.set(".wpanel", { xPercent: -110 }, 0);

      // ---------- helpers ----------
      function wipe(t, id, dir = 1) {
        tl.fromTo(id, { xPercent: -110 * dir, skewX: -12 }, { xPercent: 0, skewX: -12, duration: 0.22, ease: "power3.in", immediateRender: false }, t - 0.22);
        tl.to(id, { xPercent: 110 * dir, duration: 0.28, ease: "power3.out" }, t);
      }
      function punch(sel, t, d = 0.32) {
        tl.fromTo(sel, { scale: 1.9, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "expo.out" }, t);
      }
      function leadIn(sel, t) {
        tl.fromTo(sel, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, t);
      }
      function rise(sel, t, d = 0.4) {
        tl.fromTo(sel, { yPercent: 70, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }, { yPercent: 0, opacity: 1, clipPath: "inset(0% 0% -20% 0%)", duration: d, ease: "expo.out" }, t);
      }
      function pushOut(sel, t, x = -260, d = 0.22) {
        tl.to(sel, { x, opacity: 0, filter: "blur(16px)", duration: d, ease: "power3.in" }, t);
      }
      function cardIn(sel, t, rot = 4) {
        tl.fromTo(sel, { x: VERT ? 0 : 700, y: VERT ? 900 : 0, rotation: rot + 14, opacity: 0 }, { x: 0, y: 0, rotation: rot, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }, t);
      }
      function popIn(sel, t, d = 0.35, from = 0) {
        tl.fromTo(sel, { scale: from, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease: "back.out(2.2)" }, t);
      }
      function drift(sel, t, d, props) {
        tl.to(sel, { ...props, duration: d, ease: "sine.inOut" }, t);
      }
      function ghostIn(sel, t) {
        tl.fromTo(sel, { x: -200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "expo.out" }, t);
      }
      function chapIn(sel, t) {
        tl.fromTo(sel, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }, t);
      }
      // dish counter
      function count(n, t) {
        tl.set("#hud-n", { textContent: String(n).padStart(2, "0") }, t);
        tl.fromTo("#hud-n", { scale: 1.8 }, { scale: 1, duration: 0.3, ease: "back.out(2.5)", immediateRender: false }, t);
      }

      // ================= S0 · intro + menu cover (0 – 4.15) =================
      leadIn("#s0-lead", 0.02);
      punch("#s0-big", 0.15, 0.38);
      pushOut(["#s0-lead", "#s0-big"], 1.0, -300);
      leadIn("#s0-lead2", 1.1);
      punch("#s0-big2", 2.05, 0.35);
      pushOut(["#s0-lead2", "#s0-big2"], 2.78, -300);
      tl.fromTo("#s0-book", { scale: 0.2, rotation: -25, opacity: 0, y: 300 }, { scale: 1, rotation: -3, opacity: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" }, 2.85);
      tl.to("#s0-book", { rotation: 0, duration: 0.4, ease: "sine.inOut" }, 3.4);
      tl.fromTo("#s0-cover", { rotationY: 0 }, { rotationY: -165, duration: 0.55, ease: "power2.inOut" }, 3.45);
      tl.to("#s0-book", { scale: 4.2, duration: 0.35, ease: "power3.in" }, 3.8);

      // ================= S1 · 01 Signature (4.1 – 10.9) =================
      ghostIn("#s1-ghost", 4.15);
      chapIn("#s1-chap", 4.4);
      tl.fromTo("#s1-dish", { x: 700, rotation: 40, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.7, ease: "back.out(1.3)" }, 4.6);
      drift("#s1-dish", 5.3, 5.5, { rotation: 8, scale: 1.05 });
      leadIn("#s1-lead", 5.0);
      rise("#s1-big > div", 6.55, 0.4);
      tl.fromTo("#s1-big > div:nth-child(2)", { yPercent: 70 }, { yPercent: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, 6.85);
      popIn("#s1-a1", 7.9, 0.4);
      popIn("#s1-a2", 8.95, 0.4);
      popIn("#s1-a3", 9.8, 0.4);
      ["#s1-a1", "#s1-a2", "#s1-a3"].forEach((a, i) => drift(a, 8.4 + i * 0.9, 1.2, { y: i % 2 ? -12 : 12 }));
      tl.fromTo("#hud-in", { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }, 6.55);
      count(1, 6.6);
      wipe(10.9, "#wp-r");

      // ================= S2 · 02 Pâtes africaines (10.9 – 22.6) =================
      ghostIn("#s2-ghost", 10.95);
      chapIn("#s2-chap", 11.1);
      leadIn("#s2-lead", 11.15);
      punch("#s2-big", 12.25, 0.38);
      popIn("#s2-fm", 13.0, 0.4);
      tl.to(["#s2-lead", "#s2-big", "#s2-fm"], { y: -200, opacity: 0, filter: "blur(14px)", duration: 0.25, ease: "power3.in" }, 13.75);
      [["#s2-p1", 14.05, 2], ["#s2-p2", 14.95, 3], ["#s2-p3", 15.95, 4]].forEach(([id, t, n], i) => {
        tl.fromTo(id, { scale: 0, rotation: -120, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, t);
        tl.to(id + " .plate", { rotation: i % 2 ? -25 : 25, duration: 6, ease: "none" }, t + 0.5);
        count(n, t + 0.05);
      });
      leadIn("#s2-sl", 17.5);
      [19.45, 19.9, 20.6, 21.3].forEach((t, i) => {
        tl.fromTo(`#s2-sauces .sauce:nth-child(${i + 1})`, { y: 120, scale: 0.3, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.4)" }, t);
      });
      wipe(22.6, "#wp-w");

      // ================= S3 · 03 Fast-food (22.6 – 30.7) =================
      ghostIn("#s3-ghost", 22.65);
      chapIn("#s3-chap", 22.8);
      leadIn("#s3-lead", 22.9);
      punch("#s3-big", 23.25, 0.38);
      pushOut(["#s3-lead", "#s3-big"], 24.3, -320);
      const seq = [
        { n: "#s3-n1", s: "#s3-s1", d: "#s3-d1", tin: 24.5, tsub: 25.55, tout: 26.2, c: 5 },
        { n: "#s3-n2", s: "#s3-s2", d: "#s3-d2", tin: 26.32, tsub: 27.4, tout: 28.12, c: 6 },
        { n: "#s3-n3", s: null, d: "#s3-d3", tin: 28.25, tsub: 0, tout: 29.25, c: 7 },
        { n: "#s3-n4", s: "#s3-s4", d: "#s3-d4", tin: 29.35, tsub: 29.85, tout: 0, c: 8 },
      ];
      seq.forEach((q, i) => {
        punch(q.n, q.tin, 0.3);
        tl.fromTo(q.d, { x: VERT ? 0 : 800, y: VERT ? -900 : 0, rotation: 30, opacity: 0 }, { x: 0, y: 0, rotation: i % 2 ? 4 : -3, opacity: 1, duration: 0.45, ease: "back.out(1.5)" }, q.tin - 0.05);
        count(q.c, q.tin + 0.05);
        if (q.s) leadIn(q.s, q.tsub);
        if (q.tout) {
          pushOut([q.n, q.s].filter(Boolean), q.tout, -320, 0.18);
          tl.to(q.d, { x: VERT ? 0 : -300, y: VERT ? 900 : 0, rotation: -20, opacity: 0, filter: "blur(14px)", duration: 0.2, ease: "power3.in" }, q.tout);
        } else {
          drift(q.d, q.tin + 0.4, 0.9, { rotation: 6, scale: 1.04 });
        }
      });
      wipe(30.7, "#wp-r");

      // ================= S4 · 04 À partager (30.7 – 34.1) =================
      ghostIn("#s4-ghost", 30.72);
      chapIn("#s4-chap", 30.8);
      tl.fromTo("#s4-plateau", { x: VERT ? 0 : -700, y: VERT ? 900 : 0, rotation: -20, opacity: 0 }, { x: 0, y: 0, rotation: -5, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }, 30.75);
      punch("#s4-big", 30.9, 0.32);
      pushOut("#s4-big", 31.4, 300, 0.18);
      punch("#s4-n1", 31.5, 0.3);
      cardIn("#s4-c1", 31.45, 4);
      count(9, 31.55);
      pushOut("#s4-n1", 32.55, 300, 0.18);
      rise("#s4-n2 > div", 32.7, 0.35);
      tl.fromTo("#s4-n2 > div:nth-child(2)", { yPercent: 70 }, { yPercent: 0, duration: 0.35, ease: "expo.out", immediateRender: false }, 33.0);
      cardIn("#s4-c2", 32.65, -3);
      tl.to("#s4-c1", { x: VERT ? -60 : 80, rotation: 10, duration: 0.45, ease: "power3.out" }, 32.7);
      count(10, 32.75);
      wipe(34.1, "#wp-w");

      // ================= S5 · 05 Plus léger (34.1 – 40.4) =================
      ghostIn("#s5-ghost", 34.12);
      chapIn("#s5-chap", 34.2);
      leadIn("#s5-lead", 34.3);
      punch("#s5-big", 35.0, 0.36);
      tl.fromTo("#s5-i1", { y: 200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }, 36.2);
      tl.fromTo("#s5-sv", { rotation: -25 }, { rotation: -6, duration: 0.6, ease: "back.out(1.5)" }, 36.2);
      tl.fromTo("#s5-sc", { x: 200, rotation: 25 }, { x: 0, rotation: 0, duration: 0.6, ease: "back.out(1.5)" }, 36.3);
      count(11, 36.3);
      count(12, 36.75);
      tl.fromTo("#s5-i2", { y: 200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }, 37.45);
      count(13, 37.5);
      tl.fromTo("#s5-i3", { y: 200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }, 38.15);
      count(14, 38.2);
      drift("#s5-sw", 37.9, 2.4, { rotation: 20 });
      drift("#s5-sp", 38.6, 1.8, { rotation: -18 });
      leadIn("#s5-end", 39.0);
      wipe(40.4, "#wp-r");

      // ================= S6 · 06 Formules (40.4 – 43.95) =================
      ghostIn("#s6-ghost", 40.42);
      chapIn("#s6-chap", 40.5);
      leadIn("#s6-lead", 40.6);
      cardIn("#s6-f1", 41.3, -3);
      count(15, 41.35);
      tl.fromTo("#s6-f2", { y: VERT ? 900 : 0, x: VERT ? 0 : 800, rotation: 90, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(1.4)" }, 41.75);
      count(16, 41.8);
      punch("#s6-big", 42.95, 0.34);
      drift("#s6-f2 .plate", 42.3, 1.6, { rotation: 18 });
      tl.to("#hud-in", { y: -90, opacity: 0, duration: 0.3, ease: "power3.in" }, 43.6);
      wipe(43.95, "#wp-k", -1);

      // ================= S7 · service + livraison + 500 F (43.95 – 50.45) =================
      tl.fromTo("#s7-rays", { rotation: 0 }, { rotation: 45, duration: 6.5, ease: "none" }, 43.95);
      [["#s7-k1", 44.1], ["#s7-k2", 44.7], ["#s7-k3", 45.4]].forEach(([id, t], i) => {
        tl.fromTo(id, { y: 300, opacity: 0, rotation: i % 2 ? 8 : -8 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(1.8)" }, t);
      });
      tl.to(["#s7-k1", "#s7-k2", "#s7-k3"], { y: -H, rotation: -10, duration: 0.35, ease: "power3.in", stagger: 0.05 }, 46.05);
      lines.forEach((l) => {
        tl.fromTo(l.el, { x: W + l.off * 600 }, { x: -l.w - 100, duration: l.speed, ease: "none", repeat: Math.ceil(4.2 / l.speed) }, 46.2);
      });
      tl.fromTo("#s7-rider", { x: -W, filter: "blur(16px)" }, { x: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, 46.25);
      tl.to("#s7-rider", { y: -8, duration: 0.16, ease: "sine.inOut", yoyo: true, repeat: 23 }, 47.0);
      leadIn("#s7-par", 46.4);
      popIn("#s7-allo", 46.85, 0.45);
      tl.fromTo("#s7-medal", { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.8)" }, 48.3);
      const counter = { v: 0 };
      const numEl = document.getElementById("s7-num");
      tl.fromTo(counter, { v: 0 }, { v: 500, duration: 0.6, ease: "power2.out", onUpdate: () => { numEl.textContent = Math.round(counter.v / 10) * 10 + " F"; } }, 49.4);
      tl.to("#s7-medal", { scale: 1.08, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, 50.0);
      wipe(50.45, "#wp-r");

      // ================= S8 · Commandez (50.4 – 58.35) =================
      tl.fromTo("#s8-phone", { y: 1000, rotation: 10 }, { y: 0, rotation: -4, duration: 0.6, ease: "expo.out" }, 50.45);
      tl.fromTo("#s8-shot", { scale: 1, transformOrigin: "50% 0%" }, { scale: 1.12, duration: 6.5, ease: "power1.inOut" }, 51.0);
      drift("#s8-phone", 51.1, 6.8, { rotation: 2 });
      punch("#s8-big", 50.5, 0.34);
      leadIn("#s8-lead", 50.9);
      tl.fromTo(urlChars, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out", stagger: 0.054 }, 51.6);
      tl.fromTo("#s8-wa", { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, 53.0);
      [54.35, 55.45, 56.55, 57.55].forEach((t, i) => punch(`#s8-num .w:nth-child(${i + 1})`, t, 0.3));
      tl.to("#s8-num", { scale: 1.05, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "0% 50%" }, 57.9);

      // ================= S9 · mosaic + signature (58.3 – 62.59) =================
      tl.fromTo("#s9-wall", { scale: 2.6 }, { scale: 1, duration: 1.1, ease: "expo.out" }, 58.3);
      tl.fromTo(tiles, { rotationY: 90, opacity: 0 }, { rotationY: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: { each: 0.025, from: "center" } }, 58.3);
      tl.to("#s9-wall", { scale: 1.08, duration: 3.0, ease: "none" }, 59.4);
      tl.fromTo("#s9-veil", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 59.15);
      tl.fromTo("#s9-logo", { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(1.7)" }, 59.25);
      leadIn("#s9-lead", 59.45);
      punch("#s9-big", 60.45, 0.32);
      tl.fromTo("#s9-pill", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }, 60.95);
      tl.fromTo("#s9-info", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 61.15);

      window.__timelines["main"] = tl;
