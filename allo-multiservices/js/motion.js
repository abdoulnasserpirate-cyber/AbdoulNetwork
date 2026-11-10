/* ==========================================================================
   Allô Multi-Services — animations (GSAP 3 + ScrollTrigger + Lenis)
   Mouvement calme, précis : power3.out / expo.out, 0,5 à 0,9 s.
   Aucune animation ne bloque l'accès au contenu ni aux numéros.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;

  function endIntro() {
    root.classList.remove("has-intro");
    var intro = document.querySelector(".intro");
    if (intro) intro.remove();
  }

  // GSAP absent (réseau coupé, CDN bloqué) ou animations réduites : tout est visible
  if (!gsap || !ST || reduce) {
    root.classList.remove("js-motion");
    root.classList.add("no-motion");
    window.__motionReady = true;
    if (gsap && root.classList.contains("has-intro")) {
      gsap.to(".intro", { opacity: 0, duration: 0.3, delay: 0.2, onComplete: endIntro });
    } else {
      endIntro();
    }
    return;
  }

  window.__motionReady = true;
  gsap.registerPlugin(ST);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  var isDesktop = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches;

  /* ---------- Lenis : défilement fluide ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothTouch: false });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("allo:lock", function () { lenis.stop(); });
    document.addEventListener("allo:unlock", function () { lenis.start(); });
    // ancres internes (#partenaire, #contenu…)
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href^='#']");
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90 });
      if (target.tabIndex < 0 && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  /* ---------- Écran d'ouverture (1,2 s max, première visite de la session) ---------- */
  var introDelay = 0;
  var intro = document.querySelector(".intro");
  if (intro && root.classList.contains("has-intro")) {
    introDelay = 1.0;
    var arc = intro.querySelector(".intro__arc path");
    var logo = intro.querySelector(".intro__logo img");
    var len = arc ? arc.getTotalLength() : 0;
    intro.style.animation = "none";
    var tl = gsap.timeline({ onComplete: endIntro });
    tl.fromTo(logo, { opacity: 0, scale: 0.94, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" });
    if (arc) tl.fromTo(arc, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, 0.2);
    tl.to(intro, { yPercent: -100, duration: 0.55, ease: "expo.inOut" }, 0.68);
  } else {
    endIntro();
  }

  /* ---------- Entrée de page (navigateurs sans View Transitions) ---------- */
  if (!("CSSViewTransitionRule" in window) && !introDelay) {
    gsap.from("main", { opacity: 0, y: 14, duration: 0.5, ease: "power2.out", clearProps: "transform,opacity" });
  }

  /* ---------- Titres : révélation ligne par ligne ---------- */
  document.querySelectorAll("[data-reveal='lines']").forEach(function (el) {
    var lines = el.querySelectorAll(".line-mask > span");
    var inHero = !!el.closest(".hero, .page-head");
    var vars = { yPercent: 0, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1 };
    gsap.set(lines, { yPercent: 105 });
    if (inHero) {
      gsap.to(lines, Object.assign(vars, { delay: introDelay + 0.1 }));
    } else {
      gsap.to(lines, Object.assign(vars, { scrollTrigger: { trigger: el, start: "top 85%" } }));
    }
  });

  /* ---------- Fondus vers le haut ---------- */
  document.querySelectorAll("[data-reveal='up']").forEach(function (el) {
    var inHero = !!el.closest(".hero, .page-head");
    var delay = parseFloat(el.getAttribute("data-delay") || "0");
    var tween = { opacity: 1, y: 0, duration: 0.8 };
    gsap.set(el, { y: 24 });
    if (inHero) gsap.to(el, Object.assign(tween, { delay: introDelay + 0.35 + delay }));
    else gsap.to(el, Object.assign(tween, { delay: delay, scrollTrigger: { trigger: el, start: "top 88%" } }));
  });

  document.querySelectorAll("[data-reveal='fade']").forEach(function (el) {
    gsap.to(el, { opacity: 1, duration: 0.7, scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  /* ---------- Cascades (cartes, étiquettes, engagements) ---------- */
  document.querySelectorAll("[data-reveal='stagger']").forEach(function (el) {
    var kids = Array.prototype.filter.call(el.children, function (c) { return !c.hidden; });
    var inHero = !!el.closest(".hero, .page-head");
    gsap.set(kids, { y: 32 });
    var tween = { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, clearProps: "transform" };
    if (inHero) gsap.to(kids, Object.assign(tween, { delay: introDelay + 0.5 }));
    else gsap.to(kids, Object.assign(tween, { scrollTrigger: { trigger: el, start: "top 85%" } }));
  });

  /* ---------- Images : clip-path qui s'ouvre + zoom arrière 1,12 -> 1 ---------- */
  document.querySelectorAll("[data-reveal='image']").forEach(function (el) {
    var img = el.querySelector("img");
    var inHero = !!el.closest(".hero, .page-head");
    var tl = gsap.timeline(inHero ? { delay: introDelay + 0.25 } : { scrollTrigger: { trigger: el, start: "top 85%" } });
    gsap.set(el, { clipPath: "inset(12% 10% 12% 10% round 28px)" });
    tl.to(el, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.1, ease: "expo.out" }, 0);
    if (img) tl.to(img, { scale: 1, duration: 1.4, ease: "expo.out" }, 0);
  });

  /* ---------- Parallaxe douce (≤ 8 %) ---------- */
  document.querySelectorAll("[data-parallax]").forEach(function (el) {
    var amount = parseFloat(el.getAttribute("data-parallax")) || 6;
    gsap.fromTo(el, { yPercent: -amount / 2 }, {
      yPercent: amount / 2, ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ---------- Tracé de route du hero ---------- */
  var route = document.querySelector(".route");
  if (route) {
    var maskPath = route.querySelector(".route__mask");
    var routePath = route.querySelector(".route__path");
    var stops = document.querySelectorAll(".route-stop");
    var rlen = maskPath.getTotalLength();
    var rtl = gsap.timeline({ delay: introDelay + 0.7 });
    gsap.set(maskPath, { strokeDasharray: rlen, strokeDashoffset: rlen });
    gsap.set(stops, { scale: 0 });
    rtl.set(routePath, { opacity: 1 })
      .to(maskPath, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, 0);
    stops.forEach(function (s, i) {
      rtl.to(s, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 0.15 + i * 0.95);
    });
    // parallaxe entre la photo et le tracé
    gsap.to([route].concat(Array.prototype.slice.call(stops)), { y: -28, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ---------- Étapes : le trait se remplit au défilement ---------- */
  var fill = document.querySelector(".steps__fill");
  if (fill) {
    var horizontal = window.matchMedia("(min-width: 900px)").matches;
    gsap.fromTo(fill, horizontal ? { scaleX: 0 } : { scaleY: 0 }, {
      scaleX: 1, scaleY: 1, ease: "none",
      scrollTrigger: { trigger: ".steps", start: "top 75%", end: horizontal ? "bottom 70%" : "bottom 60%", scrub: 0.6 }
    });
  }

  /* ---------- Filets décoratifs et surlignage ---------- */
  document.querySelectorAll(".swoosh path").forEach(function (p) {
    var l = p.getTotalLength();
    gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", scrollTrigger: { trigger: p.closest("svg"), start: "top 88%" } });
  });
  document.querySelectorAll(".hl").forEach(function (el) {
    ST.create({ trigger: el, start: "top 80%", once: true, onEnter: function () { el.classList.add("is-in"); } });
  });

  /* ---------- Boutons légèrement magnétiques (desktop) ---------- */
  if (isDesktop) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.25);
      });
      btn.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  window.addEventListener("load", function () { ST.refresh(); });
})();
