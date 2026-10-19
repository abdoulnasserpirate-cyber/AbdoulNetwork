      // ---------- motion (absolute times, synced to voix_off.mp3) ----------
      const END = 48.875;
      const $ = (s) => document.querySelector(s);
      const $$ = (s) => Array.from(document.querySelectorAll(s));

      // masked line: rises from an invisible baseline
      const rise = (el, t, d = 0.85, extra = {}) =>
        tl.fromTo(el, { yPercent: 115, ...extra.from }, { yPercent: 0, duration: d, ease: "expo.out", ...extra.to }, t);
      // anamorphic flare sweeping across a title
      const flare = (el, t, span = 420) => {
        tl.fromTo(el, { opacity: 0, x: -span, scaleX: 0.35 }, { opacity: 1, x: 0, scaleX: 1, duration: 0.42, ease: "power2.out" }, t);
        tl.to(el, { opacity: 0, x: span, scaleX: 0.5, duration: 0.6, ease: "power2.in" }, t + 0.42);
      };
      const pop = (el, t, from = {}, d = 0.7) =>
        tl.fromTo(el, { opacity: 0, y: 40, scale: 0.9, ...from }, { opacity: 1, y: 0, scale: 1, duration: d, ease: "back.out(1.5)" }, t);
      const fadeIn = (el, t, d = 0.5) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: d, ease: "power1.out" }, t);
      const fadeOut = (el, t, d = 0.3) => tl.to(el, { opacity: 0, duration: d, ease: "power1.in" }, t);
      // gentle hover between t0 and t1
      const levitate = (el, t0, t1, amp = 10) => {
        const half = 1.3, n = Math.max(1, Math.floor((t1 - t0) / half));
        tl.fromTo(el, { y: 0 }, { y: -amp, duration: half, ease: "sine.inOut", yoyo: true, repeat: n - 1 }, t0);
      };

      // ---------- backdrop: satin, leaks, bokeh, grain (whole film) ----------
      const RIB = {
        rib1: "M-100,560 C170,680 400,560 640,700 C820,600 930,460 1100,540 L1100,710 C930,640 820,770 640,880 C400,760 170,860 -100,740 Z",
        rib2: "M-100,240 C140,140 360,280 580,170 C780,90 910,280 1100,200 L1100,320 C910,400 780,230 580,300 C360,410 140,260 -100,380 Z",
        rib3: "M-100,820 C220,900 440,760 700,880 C870,950 960,780 1100,820 L1100,836 C960,796 870,966 700,896 C440,776 220,916 -100,836 Z",
      };
      [["rib1", 5.4], ["rib2", 6.1], ["rib3", 4.8]].forEach(([id, half]) => {
        const n = Math.floor(END / half);
        tl.to("#" + id, { attr: { d: RIB[id] }, duration: half, ease: "sine.inOut", yoyo: true, repeat: n - 1 }, 0);
      });
      tl.fromTo("#silk", { x: 0, y: 0 }, { x: P ? -40 : -80, y: P ? 60 : 30, duration: END, ease: "none" }, 0);
      tl.fromTo(".leak-a", { x: 0, y: 0, opacity: 0.7 }, { x: P ? 260 : 420, y: P ? 380 : 120, opacity: 1, duration: END, ease: "sine.inOut" }, 0);
      tl.fromTo(".leak-b", { x: 0, y: 0 }, { x: P ? -300 : -520, y: P ? -500 : -160, duration: END, ease: "sine.inOut" }, 0);
      // two bokeh planes drift upward at different speeds (parallax) and the near one twinkles
      tl.fromTo(".bk-far", { x: 0, y: 0 }, { x: 70, y: -120, duration: END, ease: "none" }, 0);
      tl.fromTo(".bk-near", { x: 0, y: 0 }, { x: -50, y: -230, duration: END, ease: "none" }, 0);
      tl.fromTo(".bk-near", { opacity: 1 }, { opacity: 0.45, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: Math.floor(END / 2.2) - 1 }, 0);
      tl.fromTo(".grain", { backgroundPosition: "0px 0px" }, { backgroundPosition: "2560px 1792px", duration: END, ease: "steps(290)" }, 0);

      // ---------- scene seams: flash + zoom/blur, push-in in between ----------
      const SEAMS = [3.6, 8.55, 20.45, 25.95, 32.85, 35.9, 39.15, 44.95];
      const SCENES = ["#s1", "#s2", "#s3", "#s4", "#s5", "#s6", "#s6b", "#s7", "#s8"];
      SCENES.forEach((sel, i) => {
        const cam = $(sel + " > .cam");
        const tIn = i === 0 ? 0 : SEAMS[i - 1] - 0.2;
        const tOut = i < SEAMS.length ? SEAMS[i] - 0.25 : END;
        const settle = tIn + (i === 0 ? 0.6 : 0.55);
        tl.fromTo(cam, { opacity: 0, scale: 1.1, filter: "blur(14px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: settle - tIn, ease: "power3.out" }, tIn);
        tl.to(cam, { scale: 1.045, duration: tOut - settle, ease: "none" }, settle);
        if (i < SEAMS.length) {
          tl.to(cam, { opacity: 0, scale: 1.14, filter: "blur(16px)", duration: 0.5, ease: "power2.in" }, tOut);
        }
      });
      SEAMS.forEach((t) => {
        tl.fromTo(".flash", { opacity: 0 }, { opacity: 0.85, duration: 0.14, ease: "power2.out" }, t - 0.1);
        tl.to(".flash", { opacity: 0, duration: 0.42, ease: "power2.in" }, t + 0.04);
      });

      // ---------- 1 · hook ----------
      rise("#s1 .s1-mesdames .in", 0.78);
      rise("#s1 .s1-l1 .in", 1.02);
      rise("#s1 .s1-l2 .in", 1.7);
      rise("#s1 .s1-sentir .in", 2.25, 0.7);
      rise("#s1 .s1-sub .in", 2.72, 1.0, { from: { scale: 1.25 }, to: { scale: 1 } });
      flare("#s1 .s1-sub .flare", 2.95, P ? 380 : 700);

      // ---------- 2 · brand ----------
      $$("#s2 .ring circle").forEach((c, i) =>
        tl.fromTo(c, { strokeDasharray: 610, strokeDashoffset: 610 }, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 3.75 + i * 0.15));
      tl.fromTo("#s2 .s2-sb", { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, 3.85);
      tl.fromTo("#s2 .s2-crown", { opacity: 0, y: -170, rotation: -8 }, { opacity: 1, y: 0, rotation: 0, duration: 1.0, ease: "back.out(1.6)" }, 4.25);
      rise("#s2 .s2-kicker", 3.85, 0.7);
      rise("#s2 .brand", 4.35, 0.95);
      rise("#s2 .s2-by", 5.0, 0.8);
      flare("#s2 > .cam > .flare", 4.6, P ? 380 : 520);
      [["#s2 .v1", 6.55], ["#s2 .d1", 6.9], ["#s2 .v2", 7.0], ["#s2 .d2", 7.6], ["#s2 .v3", 7.7]].forEach(([s, t]) =>
        tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, t));

      // ---------- gamme header + stage helpers ----------
      const gamme = (sc, t0, tTitle, tSub) => {
        tl.fromTo(sc + " .g-num", { opacity: 0, scale: 1.35, filter: "blur(10px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out", transformOrigin: "0% 50%" }, t0);
        fadeIn(sc + " .g-label", t0 + 0.25);
        rise(sc + " .g-title", tTitle, 0.9);
        tl.fromTo(sc + " .g-line", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.inOut", transformOrigin: "0% 50%" }, tTitle + 0.2);
        if (tSub != null) rise(sc + " .g-sub", tSub, 0.9);
      };
      const stageIn = (st, t) => {
        tl.fromTo(st + " .halo", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.0, ease: "power2.out" }, t);
        tl.fromTo(st + " .spot", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.out" }, t + 0.1);
        tl.fromTo(st + " .podium", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, t);
      };
      const prodIn = (prod, info, t, tEnd) => {
        tl.fromTo(prod, { opacity: 0, y: -160, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "back.out(1.3)" }, t - 0.15);
        tl.fromTo(info, { opacity: 0, x: P ? 0 : 70, y: P ? 40 : 0 }, { opacity: 1, x: 0, y: 0, duration: 0.55, ease: "power3.out" }, t);
        levitate(prod + " .main", t + 0.6, tEnd);
      };

      // ---------- 3 · 01 fessiers ----------
      gamme("#s3", 8.75, 9.05);
      stageIn("#s3 .st-a", 9.3);
      const T3 = [11.9, 13.47, 14.9, 15.89, 17.05, 18.95];
      T3.forEach((t, i) => {
        const end = i < 5 ? T3[i + 1] - 0.2 : 20.4;
        prodIn(`#s3 .p${i + 1}`, `#s3 .i${i + 1}`, t, end);
        if (i < 5) {
          tl.to(`#s3 .p${i + 1}`, { opacity: 0, scale: 0.88, y: 30, duration: 0.3, ease: "power2.in" }, end);
          tl.to(`#s3 .i${i + 1}`, { opacity: 0, x: P ? 0 : -50, duration: 0.25, ease: "power2.in" }, end);
        }
        tl.to("#s3 .c-roll span", { yPercent: -100 * i, duration: 0.45, ease: "power3.inOut" }, t - 0.1);
        flare("#s3 .st-a .flare", t + 0.25, P ? 360 : 420);
      });
      fadeIn("#s3 .counter", 11.6);

      // ---------- 4 · 02 poitrine ----------
      gamme("#s4", 20.55, 20.65, 20.85);
      stageIn("#s4 .st-l", 21.2);
      stageIn("#s4 .st-r", 21.45);
      prodIn("#s4 .st-l .prod", "#s4 .st-l .info", 22.4, 26.0);
      prodIn("#s4 .st-r .prod", "#s4 .st-r .info", 24.1, 26.0);
      flare("#s4 > .cam > .flare", 22.6, P ? 360 : 500);

      // ---------- 5 · 03 ventre plat ----------
      gamme("#s5", 26.05, 26.15, 26.4);
      stageIn("#s5 .st-l", 27.0);
      stageIn("#s5 .st-r", 27.25);
      prodIn("#s5 .st-l .prod", "#s5 .st-l .info", 28.63, 32.8);
      prodIn("#s5 .st-r .prod", "#s5 .st-r .info", 30.51, 32.8);
      flare("#s5 > .cam > .flare", 30.7, P ? 360 : 500);

      // ---------- 6 · paiement ----------
      rise("#s6 .kick", 32.95, 0.7);
      rise("#s6 .head", 33.05, 0.9);
      [[".c-nita", 33.35], [".c-amana", 33.72], [".c-wave", 34.45], [".c-more", 35.15]].forEach(([c, t]) =>
        pop("#s6 " + c, t, { y: 70, scale: 0.85, rotationX: -25 }, 0.65));
      flare("#s6 > .cam > .flare", 34.5, P ? 380 : 700);

      // ---------- 6b · livraison: map pulls back Maradi → Niger → Africa ----------
      const pinDot = $("#s6b .pin-dot"), pinPulse = $("#s6b .pin-pulse");
      tl.set("#map", { attr: { viewBox: MAPVB.a } }, 35.6);
      tl.fromTo(pinDot, { attr: { r: 0, "stroke-width": 0.5 } }, { attr: { r: 1.5 }, duration: 0.5, ease: "back.out(2)" }, 35.95);
      tl.fromTo(pinPulse, { attr: { r: 1.5 }, opacity: 0.9 }, { attr: { r: 4.2 }, opacity: 0.25, duration: 0.9, ease: "power2.out" }, 36.0);
      tl.fromTo("#s6b .lyr-a", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 36.1);
      tl.fromTo("#s6b .rt-a", { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.55, ease: "power2.out", stagger: 0.05 }, 36.15);
      tl.fromTo("#s6b .qd", { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.05 }, 36.5);
      // → whole Niger
      tl.to("#map", { attr: { viewBox: MAPVB.b }, duration: 0.65, ease: "power3.inOut" }, 36.85);
      tl.to(pinDot, { attr: { r: 8, "stroke-width": 2.5 }, duration: 0.65, ease: "power3.inOut" }, 36.85);
      tl.to(pinPulse, { attr: { r: 20 }, opacity: 0.35, duration: 0.65, ease: "power3.inOut" }, 36.85);
      fadeOut("#s6b .lyr-a", 36.85, 0.3);
      tl.fromTo("#s6b .lyr-b", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 37.1);
      tl.fromTo("#s6b .rt-b", { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.4, ease: "power2.out", stagger: 0.03 }, 37.12);
      tl.fromTo("#s6b .ct, #s6b .ct-l", { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.015 }, 37.25);
      // → Africa
      tl.to("#map", { attr: { viewBox: MAPVB.c }, duration: 0.65, ease: "power3.inOut" }, 38.0);
      tl.to(pinDot, { attr: { r: 20, "stroke-width": 6 }, duration: 0.65, ease: "power3.inOut" }, 38.0);
      tl.to(pinPulse, { attr: { r: 52 }, duration: 0.65, ease: "power3.inOut" }, 38.0);
      fadeOut("#s6b .lyr-b", 38.0, 0.3);
      tl.fromTo("#s6b .lyr-c", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 38.2);
      tl.fromTo("#s6b .rt-c", { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.5, ease: "power2.out", stagger: 0.03 }, 38.25);
      tl.fromTo("#s6b .wd", { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.03 }, 38.6);
      // arrowheads only appear once each line has finished drawing
      [["a", 36.15, 0.55, 0.05], ["b", 37.12, 0.4, 0.03], ["c", 38.25, 0.5, 0.03]].forEach(([k, t, d, st]) =>
        $$("#s6b .rt-" + k).forEach((el, i) => {
          tl.set(el, { attr: { "marker-end": "none" } }, 35.6);
          tl.set(el, { attr: { "marker-end": `url(#head-${k})` } }, t + i * st + d * 0.85);
        }));
      // captions
      rise("#s6b .kick", 35.95, 0.7);
      [[".cap-a", 36.05, 36.72], [".cap-b", 37.0, 37.92], [".cap-c", 38.1, null]].forEach(([c, t, out]) => {
        tl.fromTo("#s6b " + c, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, t);
        if (out) tl.to("#s6b " + c, { opacity: 0, y: -30, duration: 0.2, ease: "power2.in" }, out);
      });

      // ---------- 7 · commandez ----------
      rise("#s7 .s7-cmd .in", 39.3, 0.95, { from: { scale: 1.12 }, to: { scale: 1 } });
      rise("#s7 .s7-now .in", 39.95, 0.85);
      tl.fromTo("#s7 .wa .wa-dot", { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)" }, 40.8);
      tl.fromTo("#s7 .wa span", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 40.9);
      tl.to("#s7 .wa .wa-dot", { scale: 1.08, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 5 }, 41.5);
      [41.85, 42.7, 43.28, 43.66, 44.26].forEach((t, i) =>
        tl.fromTo(`#s7 .pg${i} > span`, { yPercent: 120, scale: 1.2 }, { yPercent: 0, scale: 1, duration: 0.55, ease: "expo.out" }, t - 0.05));
      flare("#s7 > .cam > .flare", 44.4, P ? 380 : 700);

      // ---------- 8 · end card (held to the last frame) ----------
      $$("#s8 .ring circle").forEach((c, i) =>
        tl.fromTo(c, { strokeDasharray: 610, strokeDashoffset: 610 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 44.95 + i * 0.15));
      tl.fromTo("#s8 .s8-logo", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, 45.0);
      rise("#s8 .s8-brand .in", 45.1, 0.95);
      rise("#s8 .s8-by .in", 45.75, 0.8);
      flare("#s8 > .cam > .flare", 45.5, P ? 380 : 560);
      rise("#s8 .s8-slogan .in", 46.6, 1.0);
      tl.fromTo("#s8 .s8-wa", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 47.2);
