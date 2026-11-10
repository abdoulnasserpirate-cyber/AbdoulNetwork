/* ==========================================================================
   Allô Multi-Services — PWA : service worker, invitation à installer, mise à jour
   ========================================================================== */
(function () {
  "use strict";

  var VISITS_KEY = "allo-visits";
  var DISMISS_KEY = "allo-install-dismissed";
  var DISMISS_DAYS = 14;
  var DELAY_MS = 20000;

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  function icon(paths) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + paths + "</svg>";
  }
  var ICONS = {
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
    plus: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'
  };

  function makeToast(html, label) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", label);
    el.innerHTML = html;
    document.body.appendChild(el);
    return el;
  }
  function show(el) { requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("is-visible"); }); }); }
  function hide(el) { el.classList.remove("is-visible"); setTimeout(function () { el.remove(); }, 600); }

  /* ---------- Service worker + mise à jour ---------- */
  var updateRequested = false;
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/service-worker.js").then(function (reg) {
        function promptUpdate(worker) {
          var t = makeToast(
            '<div class="toast__row"><div><p class="toast__title">Nouvelle version disponible</p>' +
            '<p class="toast__text">Actualisez pour profiter des dernières informations.</p></div>' +
            '<button class="toast__close" type="button" aria-label="Fermer">' + icon(ICONS.x) + "</button></div>" +
            '<div class="toast__actions"><button class="btn btn--primary btn--sm" type="button" data-update>' + icon(ICONS.refresh) + "Actualiser</button></div>",
            "Mise à jour disponible"
          );
          t.querySelector("[data-update]").addEventListener("click", function () { updateRequested = true; worker.postMessage({ type: "SKIP_WAITING" }); });
          t.querySelector(".toast__close").addEventListener("click", function () { hide(t); });
          show(t);
        }
        if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting);
        reg.addEventListener("updatefound", function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", function () {
            if (nw.state === "installed" && navigator.serviceWorker.controller) promptUpdate(nw);
          });
        });
      }).catch(function () { /* hors ligne ou non pris en charge */ });

      var reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        // recharger uniquement apres un clic sur « Actualiser » (pas a la premiere installation)
        if (reloading || !updateRequested) return;
        reloading = true;
        window.location.reload();
      });
    });
  }

  /* ---------- Invitation à installer ---------- */
  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) return;

  var dismissedAt = parseInt(store(DISMISS_KEY) || "0", 10);
  if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 864e5) return;

  // compte des passages (une fois par session)
  var visits = parseInt(store(VISITS_KEY) || "0", 10);
  try {
    if (!window.sessionStorage.getItem("allo-visit-counted")) {
      visits += 1;
      store(VISITS_KEY, String(visits));
      window.sessionStorage.setItem("allo-visit-counted", "1");
    }
  } catch (e) { /* ignoré */ }

  var ua = window.navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  var deferred = null;
  var shown = false;

  function dismiss(t) { store(DISMISS_KEY, String(Date.now())); hide(t); }

  function invite() {
    if (shown || document.documentElement.classList.contains("menu-open")) return;
    var head = '<div class="toast__row"><img class="toast__icon" src="/assets/icons/icon-192.png" alt="" width="52" height="52">' +
      '<div><p class="toast__title">Installer Allô Multiservice</p>';
    var close = '<button class="toast__close" type="button" aria-label="Fermer">' + icon(ICONS.x) + "</button></div>";
    var t;
    if (deferred) {
      shown = true;
      t = makeToast(head + '<p class="toast__text">Gardez Allô sur votre écran d’accueil pour nous appeler en un geste.</p></div>' + close +
        '<div class="toast__actions"><button class="btn btn--primary btn--sm" type="button" data-install>' + icon(ICONS.download) + "Installer l’application</button></div>",
        "Installer l'application");
      t.querySelector("[data-install]").addEventListener("click", function () {
        deferred.prompt();
        deferred.userChoice.finally(function () { deferred = null; hide(t); store(DISMISS_KEY, String(Date.now())); });
      });
    } else if (isIOS && isSafari) {
      shown = true;
      t = makeToast(head + '<p class="toast__text">Ajoutez Allô à votre écran d’accueil :</p>' +
        '<ol class="ios-steps"><li>' + icon(ICONS.share) + "Touchez Partager</li><li>" + icon(ICONS.plus) + "Puis « Sur l’écran d’accueil »</li></ol></div>" + close,
        "Ajouter à l'écran d'accueil");
    } else {
      return;
    }
    t.querySelector(".toast__close").addEventListener("click", function () { dismiss(t); });
    show(t);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    if (visits >= 2) setTimeout(invite, 3000);
  });
  window.addEventListener("appinstalled", function () { store(DISMISS_KEY, String(Date.now() + 3650 * 864e5)); });

  if (visits >= 2) setTimeout(invite, 4000);
  setTimeout(invite, DELAY_MS);
})();
