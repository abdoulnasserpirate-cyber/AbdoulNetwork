/* ==========================================================================
   Allô Multi-Services — navigation, menu, données
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var cfg = window.ALLO_CONFIG || {};
  var contacts = cfg.contacts || {};

  function digits(str) { return String(str || "").replace(/\D/g, ""); }
  function telHref(num) { return "tel:" + (contacts.indicatif || "+227") + digits(num); }
  function waHref(text) {
    var url = "https://wa.me/" + digits(contacts.whatsapp);
    return text ? url + "?text=" + encodeURIComponent(text) : url;
  }
  window.Allo = window.Allo || {};
  window.Allo.waHref = waHref;
  window.Allo.telHref = telHref;

  /* ---------- Hydratation depuis config.js ---------- */
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, cfg);
  }
  doc.querySelectorAll("[data-bind]").forEach(function (el) {
    var v = get(el.getAttribute("data-bind"));
    if (typeof v === "string" && v) el.textContent = v;
  });
  doc.querySelectorAll("[data-tel]").forEach(function (el) {
    var key = el.getAttribute("data-tel");
    var num = key === "principal" ? contacts.principal : (contacts.secondaires || [])[parseInt(key, 10)];
    if (num) el.setAttribute("href", telHref(num));
  });
  doc.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", waHref(el.getAttribute("data-wa") || ""));
  });
  doc.querySelectorAll("[data-maps]").forEach(function (el) {
    if (cfg.mapsUrl) el.setAttribute("href", cfg.mapsUrl);
  });
  if (cfg.servicesDomicile && cfg.servicesDomicile.actif === false) {
    doc.querySelectorAll("[data-feature='servicesDomicile']").forEach(function (el) {
      if (el.tagName === "OPTION") el.remove(); else el.hidden = true;
    });
    doc.querySelectorAll("[data-cols-feature]").forEach(function (el) { el.style.setProperty("--cols", "2"); });
  }

  /* ---------- Header : fond flouté au défilement, masqué en descendant ---------- */
  var header = doc.querySelector(".site-header");
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
      var goingDown = y > lastY + 4;
      var goingUp = y < lastY - 4;
      if (goingDown && y > 160 && !root.classList.contains("menu-open")) header.classList.add("is-hidden");
      else if (goingUp || y < 160) header.classList.remove("is-hidden");
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  // un focus clavier dans le header le rend toujours visible
  if (header) header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });

  /* ---------- Menu mobile ---------- */
  var toggle = doc.querySelector(".menu-toggle");
  var menu = doc.getElementById("mobile-menu");
  var toggleLabel = toggle ? toggle.querySelector(".menu-toggle__label") : null;
  var lastFocus = null;

  function focusables() {
    var list = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a[href], button:not([disabled])")));
    return list.filter(function (el) { return el && el.offsetParent !== null; });
  }
  function openMenu() {
    lastFocus = doc.activeElement;
    root.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fermer le menu");
    if (toggleLabel) toggleLabel.textContent = "Fermer";
    menu.removeAttribute("inert");
    menu.setAttribute("aria-hidden", "false");
    doc.body.style.overflow = "hidden";
    doc.dispatchEvent(new CustomEvent("allo:lock"));
    var first = menu.querySelector("a");
    window.setTimeout(function () { if (first) first.focus({ preventScroll: true }); }, 250);
  }
  function closeMenu(restore) {
    root.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    if (toggleLabel) toggleLabel.textContent = "Menu";
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    doc.body.style.overflow = "";
    doc.dispatchEvent(new CustomEvent("allo:unlock"));
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  if (toggle && menu) {
    menu.setAttribute("inert", "");
    toggle.addEventListener("click", function () {
      root.classList.contains("menu-open") ? closeMenu() : openMenu();
    });
    doc.addEventListener("keydown", function (e) {
      if (!root.classList.contains("menu-open")) return;
      if (e.key === "Escape") { e.preventDefault(); closeMenu(); return; }
      if (e.key === "Tab") {
        var f = focusables();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    menu.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a) closeMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900 && root.classList.contains("menu-open")) closeMenu(false);
    });
  }

  /* ---------- Transition de page de repli (sans View Transitions) ---------- */
  var supportsVT = "CSSViewTransitionRule" in window;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!supportsVT && !reduce) {
    doc.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      var main = doc.querySelector("main");
      var go = function () { location.href = url.href; };
      if (window.gsap && main) window.gsap.to(main, { opacity: 0, y: -10, duration: 0.25, ease: "power2.in", onComplete: go });
      else { root.classList.add("page-leave"); window.setTimeout(go, 240); }
    });
    // retour arrière depuis le cache : réafficher la page
    window.addEventListener("pageshow", function (e) {
      if (!e.persisted) return;
      root.classList.remove("page-leave");
      var main = doc.querySelector("main");
      if (main) { main.style.opacity = ""; main.style.transform = ""; }
    });
  }
})();
