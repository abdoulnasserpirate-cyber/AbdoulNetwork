/* Chief-Chief — application */
(() => {
  "use strict";

  const C = window.CC_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const body = document.body;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilitaires ---------- */
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const storage = (kind) => ({
    get(k, d) { try { const v = window[kind].getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { window[kind].setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
    del(k) { try { window[kind].removeItem(k); } catch (e) { /* stockage indisponible */ } }
  });
  const local = storage("localStorage");
  const session = storage("sessionStorage");

  /* Heure de Maradi, quel que soit le réglage du téléphone */
  function now() {
    const d = new Date();
    try {
      const p = {};
      new Intl.DateTimeFormat("en-CA", {
        timeZone: C.TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(d).forEach((x) => { p[x.type] = x.value; });
      return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour % 24 };
    } catch (e) {
      const pad = (n) => String(n).padStart(2, "0");
      return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, hour: d.getHours() };
    }
  }
  const promoActive = () => {
    const P = C.PROMO; if (!P || !P.active) return false;
    const t = now().date; return (!P.from || t >= P.from) && (!P.until || t <= P.until);
  };
  const isClosedToday = () => (C.CLOSED_DATES || []).includes(now().date);
  const isBeforeOpening = () => !!C.ORDER_OPEN_DATE && now().date < C.ORDER_OPEN_DATE;
  const isOutOfHours = () => { const h = now().hour; return h < C.OPEN_HOUR || h >= C.CLOSE_HOUR; };
  const isNight = () => now().hour >= C.NIGHT_HOUR;
  const frDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  /* ---------- Plats ---------- */
  const PROMO_ON = promoActive();
  const dishes = new Map();
  const sig = Object.assign({ cat: "signature", sauce: false }, C.SIGNATURE);
  dishes.set(sig.id, sig);
  C.CATEGORIES.forEach((cat) => cat.items.forEach((d) => dishes.set(d.id, Object.assign({ cat: cat.id, catName: cat.name }, d))));

  const hasPromo = (d) => PROMO_ON && !!d.promo;
  const basePrice = (d, v) => (d.variants ? d.variants[v || 0].price : d.price);
  const unitPrice = (d, v) => {
    const b = basePrice(d, v);
    return hasPromo(d) ? Math.round((b * (100 - C.PROMO.percent)) / 100 / 50) * 50 : b;
  };
  const needsOptions = (d) => !!(d.variants || d.sauce);
  const isOff = (d) => d.available === false;
  const BADGES = { populaire: "Populaire 🔥", nouveau: "Nouveau ✨", epice: "Épicé 🌶️", leger: "Léger 🍃" };

  /* ---------- Panier ---------- */
  let cart = local.get("cc-cart", []).filter((l) => dishes.has(l.id) && !isOff(dishes.get(l.id)) && l.q > 0);
  const lineKey = (id, v, s) => `${id}|${v == null ? "" : v}|${s || ""}`;
  const lineUnit = (l) => unitPrice(dishes.get(l.id), l.v);
  const cartCount = () => cart.reduce((a, l) => a + l.q, 0);
  const cartSubtotal = () => cart.reduce((a, l) => a + l.q * lineUnit(l), 0);
  const qtyOf = (id) => cart.filter((l) => l.id === id).reduce((a, l) => a + l.q, 0);
  const saveCart = () => local.set("cc-cart", cart);

  function addLine(id, v, s, q) {
    const k = lineKey(id, v, s);
    const ex = cart.find((l) => l.key === k);
    if (ex) ex.q += q; else cart.push({ key: k, id, v: v == null ? null : v, s: s || null, q });
    cartChanged(id);
  }
  function changeLine(key, delta) {
    const l = cart.find((x) => x.key === key); if (!l) return;
    l.q += delta;
    if (l.q <= 0) cart = cart.filter((x) => x !== l);
    cartChanged(l.id);
  }
  function decDish(id) {
    for (let i = cart.length - 1; i >= 0; i--) if (cart[i].id === id) return changeLine(cart[i].key, -1);
  }
  function cartChanged(id) {
    saveCart();
    updateCartUI();
    if (id) refreshCardAction(id); else dishes.forEach((d) => refreshCardAction(d.id));
    if (cartSheet.classList.contains("open")) renderCart();
  }

  /* ================= Rendu du menu ================= */
  const sectionsEl = $("#sections");
  const catsTrack = $("#cats-track");
  const indicator = $("#cats-indicator");

  function photoHTML(d, cls = "") {
    if (d.img) return `<div class="ph ${cls}"><img src="${esc(d.img)}" alt="${esc(d.name)}" loading="lazy" decoding="async"></div>`;
    return `<div class="ph art ${cls}" role="img" aria-label="${esc(d.name)}">${d.emoji || "🍽️"}</div>`;
  }
  function priceHTML(d) {
    const from = d.variants ? "<small>dès</small>" : "";
    if (hasPromo(d)) return `<div class="price">${from}<s>${fmt(basePrice(d))}</s><strong>${fmt(unitPrice(d))}</strong></div>`;
    return `<div class="price">${from}<strong>${fmt(basePrice(d))}</strong></div>`;
  }
  function actionHTML(d) {
    if (isOff(d)) return "";
    const q = qtyOf(d.id);
    if (!q) return `<button class="add" data-act="add" aria-label="Ajouter ${esc(d.name)}"><svg><use href="#i-plus"/></svg></button>`;
    return `<div class="stepper"><button data-act="dec" aria-label="Retirer un"><svg><use href="#i-minus"/></svg></button><span>${q}</span><button data-act="inc" aria-label="Ajouter un"><svg><use href="#i-plus"/></svg></button></div>`;
  }
  function cardHTML(d, i) {
    const tags = isOff(d)
      ? `<span class="tag tag-off">Indisponible</span>`
      : (d.badge ? `<span class="tag">${BADGES[d.badge]}</span>` : "");
    const promo = hasPromo(d) && !isOff(d) ? `<span class="tag-promo">-${C.PROMO.percent}%</span>` : "";
    const ph = photoHTML(d).replace("</div>", `${tags}${promo}</div>`);
    return `<article class="card${isOff(d) ? " off" : ""}" data-id="${esc(d.id)}" style="--d:${Math.min(i, 6) * 0.06}s" tabindex="0" aria-label="${esc(d.name)}">
      ${ph}
      <div class="card-body">
        <h3 class="card-name">${esc(d.name)}</h3>
        <p class="card-desc">${esc(d.desc || "")}</p>
        <div class="card-foot">${priceHTML(d)}<div class="card-act">${actionHTML(d)}</div></div>
      </div>
    </article>`;
  }
  function refreshCardAction(id) {
    const d = dishes.get(id);
    $$(`[data-id="${CSS.escape(id)}"] .card-act`).forEach((el) => { el.innerHTML = actionHTML(d); });
    if (id === sig.id) $("#sig-act").innerHTML = sigActionHTML();
  }
  const sigActionHTML = () => {
    const q = qtyOf(sig.id);
    return q
      ? `<div class="stepper"><button data-act="dec" aria-label="Retirer un"><svg><use href="#i-minus"/></svg></button><span>${q}</span><button data-act="inc" aria-label="Ajouter un"><svg><use href="#i-plus"/></svg></button></div>`
      : `<button class="btn-gold btn-sm" data-act="add">Ajouter</button>`;
  };

  function renderMenu() {
    $("#signature").innerHTML = `<div class="signature" data-id="${esc(sig.id)}">
      <span class="ribbon">★ Choix du Chef</span>
      ${photoHTML(sig, "sig-photo")}
      <div>
        <h3>${esc(sig.name)}</h3>
        <p>${esc(sig.desc)}</p>
        <div class="sig-foot"><span class="sig-price">${fmt(unitPrice(sig))}</span><span id="sig-act">${sigActionHTML()}</span></div>
      </div>
    </div>`;

    sectionsEl.innerHTML = C.CATEGORIES.map((cat) => `
      <section class="section" id="sec-${esc(cat.id)}" data-cat="${esc(cat.id)}">
        <div class="section-head reveal"><h2>${cat.emoji} ${esc(cat.name)}</h2>${
          PROMO_ON && cat.items.some((d) => d.promo) ? `<span class="section-sub">-${C.PROMO.percent}% en ce moment</span>` : ""}</div>
        <div class="grid">${cat.items.map(cardHTML).join("")}</div>
      </section>`).join("");

    const cats = [{ id: "signature", name: "Signature Chief-Chief", emoji: "⭐" }].concat(C.CATEGORIES);
    catsTrack.insertAdjacentHTML("beforeend", cats.map((c) =>
      `<button class="cat" data-cat="${esc(c.id)}">${c.emoji} ${esc(c.name)}</button>`).join(""));

    // Effet brillance jusqu'au chargement de chaque photo
    $$(".ph img").forEach((img) => {
      const done = () => img.parentElement.classList.add("loaded");
      if (img.complete && img.naturalWidth) done(); else { img.addEventListener("load", done); img.addEventListener("error", done); }
    });
  }

  /* Apparition au scroll */
  let revealObs;
  function observeReveals() {
    const els = $$(".reveal, .card, .signature");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    revealObs = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => revealObs.observe(e));
  }

  /* ================= Interactions menu ================= */
  $("#menu").addEventListener("click", (e) => {
    const holder = e.target.closest("[data-id]"); if (!holder) return;
    const d = dishes.get(holder.dataset.id);
    const act = e.target.closest("[data-act]");
    if (act) {
      e.stopPropagation();
      const a = act.dataset.act;
      if (a === "dec") return decDish(d.id);
      if (isOff(d)) return;
      if (needsOptions(d)) return openDish(d.id);
      addLine(d.id, null, null, 1);
      return feedback(d, holder.querySelector(".ph"), a === "add");
    }
    if (e.target.closest(".sig-photo") || holder.classList.contains("card") || holder.classList.contains("signature")) openDish(d.id);
  });
  $("#menu").addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card")) { e.preventDefault(); openDish(e.target.dataset.id); }
  });

  /* ================= ÉCRAN 8 — Feedback ajout ================= */
  const toastEl = $("#toast");
  let toastT;
  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }
  function cartTarget() {
    return $("#nav-cart .nav-ico");
  }
  function flyFrom(srcEl, d) {
    if (reduceMotion || !srcEl || !srcEl.animate) return Promise.resolve();
    const r = srcEl.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > innerHeight) return Promise.resolve();
    const t = cartTarget().getBoundingClientRect();
    let fly;
    if (d.thumb || d.img) { fly = document.createElement("img"); fly.src = d.thumb || d.img; fly.alt = ""; }
    else { fly = document.createElement("div"); fly.textContent = d.emoji || "🍽️"; }
    fly.className = "fly";
    const sx = r.left + r.width / 2 - 28, sy = r.top + r.height / 2 - 28;
    fly.style.left = sx + "px"; fly.style.top = sy + "px";
    document.body.appendChild(fly);
    const dx = t.left + t.width / 2 - 28 - sx, dy = t.top + t.height / 2 - 28 - sy;
    const anim = fly.animate([
      { transform: "translate(0,0) scale(.6)", opacity: 0 },
      { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0.15 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(.8)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: 0.7 }
    ], { duration: 700, easing: "cubic-bezier(.5,0,.6,1)" });
    return anim.finished.catch(() => {}).then(() => fly.remove());
  }
  function feedback(d, srcEl, withFly = true, label) {
    if (navigator.vibrate) { try { navigator.vibrate(25); } catch (e) { /* non supporté */ } }
    toast(`<b>✓</b> ${esc(label || d.name)} dans le panier`);
    (withFly ? flyFrom(srcEl, d) : Promise.resolve()).then(() => {
      $$("[data-cart-badge]").forEach((b) => { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); });
    });
  }

  function updateCartUI() {
    const n = cartCount();
    $$("[data-cart-badge]").forEach((b) => { b.hidden = !n; b.textContent = n; });
    $("#mc-count").textContent = n;
    $("#mc-total").textContent = fmt(cartSubtotal());
    body.classList.toggle("has-mini", n > 0);
    $("#mini-cart").setAttribute("aria-hidden", n ? "false" : "true");
    $("#mini-cart").tabIndex = n ? 0 : -1;
  }

  /* ================= Couches (panneaux, modales) + bouton retour ================= */
  const layers = [];
  let ignorePop = false;
  function pushLayer(close) {
    if (!layers.length) { try { history.pushState({ ccLayer: 1 }, ""); } catch (e) { /* ignoré */ } }
    layers.push(close);
    syncLock();
  }
  function popLayer(close) {
    const i = layers.lastIndexOf(close); if (i < 0) return;
    layers.splice(i, 1);
    if (!layers.length && history.state && history.state.ccLayer) { ignorePop = true; history.back(); }
    syncLock();
  }
  window.addEventListener("popstate", () => {
    if (ignorePop) { ignorePop = false; return; }
    const top = layers[layers.length - 1];
    if (top) {
      layers.pop();
      top(true);
      if (layers.length) { try { history.pushState({ ccLayer: 1 }, ""); } catch (e) { /* ignoré */ } }
      syncLock();
    }
  });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && layers.length) layers[layers.length - 1]();
  });
  function syncLock() {
    body.classList.toggle("lock", layers.length > 0);
    updateNav();
  }

  /* ---------- Panneaux du bas ---------- */
  const backdrop = $("#backdrop");
  const dishSheet = $("#dish-sheet");
  const cartSheet = $("#cart-sheet");
  const sheetClosers = new Map();

  function openSheet(el) {
    if (el.classList.contains("open")) return;
    el.classList.remove("closing");
    el.style.transform = "";
    el.setAttribute("aria-hidden", "false");
    el.classList.add("open");
    backdrop.classList.add("show");
    const close = (fromPop) => closeSheet(el, fromPop);
    sheetClosers.set(el, close);
    pushLayer(close);
    setTimeout(() => { const f = el.querySelector(".sheet-scroll"); if (f) f.focus({ preventScroll: true }); }, 50);
  }
  function closeSheet(el, fromPop) {
    if (!el.classList.contains("open")) return;
    el.classList.add("closing");
    el.classList.remove("open");
    el.style.transform = "";
    el.setAttribute("aria-hidden", "true");
    if (!$$(".sheet.open").length) backdrop.classList.remove("show");
    const close = sheetClosers.get(el);
    sheetClosers.delete(el);
    if (!fromPop) popLayer(close);
  }
  backdrop.addEventListener("click", () => { $$(".sheet.open").forEach((s) => closeSheet(s)); });
  $$(".sheet-scroll").forEach((s) => { s.tabIndex = -1; s.style.outline = "none"; });

  /* Fermeture en glissant vers le bas */
  $$(".sheet").forEach((sheet) => {
    let y0 = null, dy = 0, t0 = 0, dragging = false;
    const scroller = sheet.querySelector(".sheet-scroll");
    sheet.addEventListener("touchstart", (e) => {
      const fromGrip = !!e.target.closest(".sheet-grip");
      const atTop = scroller.scrollTop <= 0 && !e.target.closest("#cart-list, input");
      if (!fromGrip && !atTop) { y0 = null; return; }
      y0 = e.touches[0].clientY; dy = 0; t0 = Date.now(); dragging = false;
    }, { passive: true });
    sheet.addEventListener("touchmove", (e) => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (!dragging && dy > 8) { dragging = true; sheet.classList.add("dragging"); }
      if (dragging) {
        if (e.cancelable) e.preventDefault();
        sheet.style.transform = `translateY(${Math.max(0, dy)}px)`;
      } else if (dy < 0) y0 = null;
    }, { passive: false });
    sheet.addEventListener("touchend", () => {
      if (y0 == null) return;
      sheet.classList.remove("dragging");
      const fast = dy / Math.max(1, Date.now() - t0) > 0.6;
      if (dragging && (dy > 110 || fast)) closeSheet(sheet);
      else sheet.style.transform = "";
      y0 = null; dragging = false;
    });
  });

  /* ================= ÉCRAN 7 — Fiche plat ================= */
  const ds = { id: null, v: null, s: null, q: 1 };
  const dsBody = $("#ds-body");

  function openDish(id) {
    const d = dishes.get(id);
    ds.id = id; ds.v = d.variants ? 0 : null; ds.s = null; ds.q = 1;
    const badges = [];
    if (hasPromo(d)) badges.push(`<span class="tag tag-red">-${C.PROMO.percent}%</span>`);
    if (d.badge) badges.push(`<span class="tag">${BADGES[d.badge]}</span>`);
    if (isOff(d)) badges.push(`<span class="tag tag-off">Indisponible</span>`);
    let html = photoHTML(d, "ds-photo") + `<div class="ds-head"><h2 id="ds-name">${esc(d.name)}</h2>
      ${badges.length ? `<div class="ds-badges">${badges.join("")}</div>` : ""}
      <p class="ds-desc">${esc(d.desc || "")}</p></div>`;
    if (d.variants) {
      html += `<div class="opt"><div class="opt-title">Choisissez <small>1 choix</small></div>
        <div class="chips" role="radiogroup" aria-label="Variante" data-opt="v">${d.variants.map((v, i) =>
          `<button class="chip" role="radio" aria-checked="${i === 0}" data-val="${i}">${esc(v.label)}<small>${fmt(unitPrice(d, i))}</small></button>`).join("")}</div></div>`;
    }
    if (d.sauce) {
      html += `<div class="opt"><div class="opt-title">Sauce <small class="req">obligatoire · offerte</small></div>
        <div class="chips" role="radiogroup" aria-label="Sauce" data-opt="s">${C.SAUCES.map((s) =>
          `<button class="chip" role="radio" aria-checked="false" data-val="${esc(s)}">${esc(s)}</button>`).join("")}</div>
        <p class="opt-err" id="ds-err" hidden>Choisissez une sauce</p></div>`;
    }
    dsBody.innerHTML = html;
    dsBody.scrollTop = 0;
    const img = dsBody.querySelector(".ph img");
    if (img) {
      img.loading = "eager";
      const done = () => img.parentElement.classList.add("loaded");
      if (img.complete && img.naturalWidth) done(); else img.addEventListener("load", done);
    }
    const addBtn = $("#ds-add");
    addBtn.disabled = isOff(d);
    addBtn.style.opacity = isOff(d) ? ".5" : "";
    $("#ds-qty").style.display = isOff(d) ? "none" : "";
    updateDishPrice();
    openSheet(dishSheet);
  }
  function updateDishPrice() {
    const d = dishes.get(ds.id);
    $("#ds-qty-val").textContent = ds.q;
    if (isOff(d)) { $("#ds-add").textContent = "Indisponible"; return; }
    $("#ds-add").innerHTML = `Ajouter · <span id="ds-price">${fmt(unitPrice(d, ds.v) * ds.q)}</span>`;
  }
  dsBody.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) {
      const group = chip.parentElement;
      $$(".chip", group).forEach((c) => c.setAttribute("aria-checked", c === chip ? "true" : "false"));
      if (group.dataset.opt === "v") ds.v = +chip.dataset.val;
      else { ds.s = chip.dataset.val; const er = $("#ds-err"); if (er) er.hidden = true; }
      return updateDishPrice();
    }
    const photo = e.target.closest(".ds-photo");
    if (photo && !photo.classList.contains("art")) openLightbox(photo.querySelector("img").src);
  });
  $("#ds-qty").addEventListener("click", (e) => {
    const b = e.target.closest("[data-q]"); if (!b) return;
    ds.q = Math.max(1, Math.min(50, ds.q + +b.dataset.q));
    updateDishPrice();
  });
  $("#ds-add").addEventListener("click", () => {
    const d = dishes.get(ds.id);
    if (isOff(d)) return;
    if (d.sauce && !ds.s) {
      const g = dsBody.querySelector('[data-opt="s"]');
      g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake");
      $("#ds-err").hidden = false;
      g.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      return;
    }
    addLine(d.id, ds.v, ds.s, ds.q);
    const src = dsBody.querySelector(".ds-photo");
    const label = d.name + (d.variants ? ` (${d.variants[ds.v].label})` : "");
    feedback(d, src, true, ds.q > 1 ? `${ds.q} × ${label}` : label);
    closeSheet(dishSheet);
  });

  /* Lightbox */
  const lightbox = $("#lightbox");
  function openLightbox(src) {
    lightbox.querySelector("img").src = src;
    lightbox.classList.add("open"); lightbox.setAttribute("aria-hidden", "false");
    pushLayer(closeLightbox);
  }
  function closeLightbox(fromPop) {
    lightbox.classList.remove("open"); lightbox.setAttribute("aria-hidden", "true");
    if (fromPop !== true) popLayer(closeLightbox);
  }
  lightbox.addEventListener("click", () => closeLightbox());

  /* ================= ÉCRAN 11 — Panier ================= */
  const cartList = $("#cart-list");
  const customer = local.get("cc-customer", {});
  const form = {
    name: $("#f-name"), phone: $("#f-phone"), address: $("#f-address"), note: $("#f-note"), zone: customer.zone || null
  };
  form.name.value = customer.name || "";
  form.phone.value = customer.phone || "";
  form.address.value = customer.address || "";
  const zoneById = (id) => C.ZONES.find((z) => z.id === id);
  const zonePrice = (z) => (isNight() ? z.night : z.day);

  function saveCustomer() {
    local.set("cc-customer", { name: form.name.value.trim(), phone: form.phone.value.trim(), address: form.address.value.trim(), zone: form.zone });
  }

  function renderZones() {
    $("#f-zones").innerHTML = C.ZONES.map((z) =>
      `<button type="button" class="chip" role="radio" aria-checked="${form.zone === z.id}" data-zone="${esc(z.id)}">${esc(z.name)}<small>${fmt(zonePrice(z))}</small></button>`).join("");
  }
  $("#f-zones").addEventListener("click", (e) => {
    const c = e.target.closest("[data-zone]"); if (!c) return;
    form.zone = c.dataset.zone;
    $$("#f-zones .chip").forEach((x) => x.setAttribute("aria-checked", x === c ? "true" : "false"));
    setErr($("#f-zone-field"), "");
    saveCustomer();
    renderRecap();
  });

  function renderCart() {
    const empty = !cart.length;
    $("#cart-empty").hidden = !empty;
    $("#cart-content").hidden = empty;
    $("#cart-foot").hidden = empty;
    cartList.innerHTML = cart.map((l) => {
      const d = dishes.get(l.id);
      const opts = [d.variants ? d.variants[l.v].label : null, l.s ? `Sauce ${l.s}` : null].filter(Boolean).join(" · ");
      const thumb = d.thumb || d.img
        ? `<img class="line-thumb" src="${esc(d.thumb || d.img)}" alt="" loading="lazy">`
        : `<span class="line-thumb">${d.emoji || "🍽️"}</span>`;
      return `<li class="line" data-key="${esc(l.key)}">
        <div class="line-del" aria-hidden="true"><svg><use href="#i-trash"/></svg>Supprimer</div>
        <div class="line-main">
          ${thumb}
          <div class="line-info"><div class="line-name">${esc(d.name)}</div>${opts ? `<div class="line-opt">${esc(opts)}</div>` : ""}</div>
          <div class="line-right">
            <span class="line-price">${fmt(lineUnit(l) * l.q)}</span>
            <div class="qty sm"><button data-lq="-1" aria-label="Moins"><svg><use href="#i-minus"/></svg></button><span>${l.q}</span><button data-lq="1" aria-label="Plus"><svg><use href="#i-plus"/></svg></button></div>
          </div>
        </div>
      </li>`;
    }).join("");
    renderZones();
    renderRecap();
  }
  function totals() {
    const sub = cartSubtotal();
    const z = zoneById(form.zone);
    const del = z ? zonePrice(z) : 0;
    return { sub, z, del, total: sub + del };
  }
  function renderRecap() {
    const t = totals();
    $("#r-sub").textContent = fmt(t.sub);
    $("#r-zone").textContent = t.z ? `(${t.z.name})` : "";
    $("#r-night").hidden = !(t.z && isNight());
    $("#r-del").textContent = t.z ? fmt(t.del) : "—";
    $("#r-total").textContent = fmt(t.total);
    $("#order-total").textContent = fmt(t.total);
  }
  cartList.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lq]"); if (!b) return;
    const key = b.closest(".line").dataset.key;
    const l = cart.find((x) => x.key === key);
    if (l && l.q === 1 && +b.dataset.lq < 0) return removeLine(b.closest(".line"));
    changeLine(key, +b.dataset.lq);
  });
  function removeLine(li) {
    li.classList.add("removing");
    setTimeout(() => {
      const key = li.dataset.key;
      const l = cart.find((x) => x.key === key);
      cart = cart.filter((x) => x.key !== key);
      cartChanged(l && l.id);
    }, reduceMotion ? 0 : 220);
  }
  /* Suppression par glissement à gauche */
  (() => {
    let el = null, x0 = 0, y0 = 0, dx = 0, mode = null;
    cartList.addEventListener("touchstart", (e) => {
      const m = e.target.closest(".line-main"); if (!m || e.target.closest("button")) return;
      el = m; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; mode = null;
    }, { passive: true });
    cartList.addEventListener("touchmove", (e) => {
      if (!el) return;
      const mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
      if (!mode) mode = Math.abs(mx) > Math.abs(my) + 4 ? "x" : (Math.abs(my) > 6 ? "y" : null);
      if (mode !== "x") return;
      if (e.cancelable) e.preventDefault();
      dx = Math.min(0, mx);
      el.classList.add("dragging");
      el.style.transform = `translateX(${dx}px)`;
    }, { passive: false });
    cartList.addEventListener("touchend", () => {
      if (!el) return;
      el.classList.remove("dragging");
      if (mode === "x" && dx < -90) { el.style.transform = "translateX(-100%)"; removeLine(el.parentElement); }
      else el.style.transform = "";
      el = null;
    });
  })();

  function openCart() {
    closeSearch();
    renderCart();
    openSheet(cartSheet);
  }
  $$("[data-open-cart]").forEach((b) => b.addEventListener("click", openCart));

  /* Validation */
  function setErr(field, msg) {
    field.classList.toggle("invalid", !!msg);
    field.querySelector(".err").textContent = msg;
  }
  [form.name, form.phone, form.address].forEach((inp) => inp.addEventListener("input", () => {
    setErr(inp.closest(".field"), ""); saveCustomer();
  }));
  function validate() {
    let first = null;
    const check = (cond, field, msg) => { setErr(field, cond ? "" : msg); if (!cond && !first) first = field; };
    check(form.name.value.trim().length >= 2, form.name.closest(".field"), "Indiquez votre nom");
    check(form.phone.value.replace(/\D/g, "").length >= 8, form.phone.closest(".field"), "Numéro invalide");
    check(!!zoneById(form.zone), $("#f-zone-field"), "Choisissez votre zone");
    check(form.address.value.trim().length >= 3, form.address.closest(".field"), "Indiquez votre adresse");
    if (first) first.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    return !first;
  }

  function blockingNotice() {
    if (isBeforeOpening()) return "soon";
    if (isClosedToday()) return "closed";
    if (isOutOfHours()) return "hours";
    return null;
  }

  $("#order-btn").addEventListener("click", () => {
    if (!cart.length) return;
    const block = blockingNotice();
    if (block) return showNotice(block);
    if (!validate()) return;
    const t = totals();
    const name = form.name.value.trim();
    const lines = cart.map((l) => {
      const d = dishes.get(l.id);
      const opts = [d.variants ? d.variants[l.v].label : null, l.s ? `sauce ${l.s}` : null].filter(Boolean).join(", ");
      return `• ${l.q} × ${d.name}${opts ? ` (${opts})` : ""} — ${fmt(lineUnit(l) * l.q)}`;
    });
    const note = form.note.value.trim();
    const msg = [
      "🍽️ *Nouvelle commande Chief-Chief*", "",
      ...lines, "",
      `Sous-total : ${fmt(t.sub)}`,
      `Livraison (${t.z.name})${isNight() ? " 🌙 tarif de nuit" : ""} : ${fmt(t.del)}`,
      `*Total : ${fmt(t.total)}*`, "",
      `👤 Nom : ${name}`,
      `📞 Téléphone : ${form.phone.value.trim()}`,
      `📍 Zone : ${t.z.name}`,
      `🏠 Adresse : ${form.address.value.trim()}`,
      note ? `📝 Précision : ${note}` : null,
      "", "💵 Paiement à la livraison"
    ].filter((x) => x !== null).join("\n");
    const url = `https://wa.me/${C.WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    // Pas de "noopener" ici : avec, window.open renvoie toujours null.
    const w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (e) { /* ignoré */ } }
    else setTimeout(() => { location.href = url; }, 600);
    saveCustomer();
    showDone(name, t);
  });

  /* ================= Modales ================= */
  const modal = $("#modal");
  const modalCard = $("#modal-card");
  let modalOnClose = null;
  function openModal(cls, html, onClose) {
    if (modal.classList.contains("open")) closeModal(false, true);
    modalCard.className = "modal-card " + cls;
    modalCard.innerHTML = html;
    modalOnClose = onClose || null;
    modal.setAttribute("aria-hidden", "false");
    void modalCard.offsetWidth;
    modal.classList.add("open");
    pushLayer(closeModal);
    const f = modalCard.querySelector("[data-primary]"); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
  }
  function closeModal(fromPop, silent) {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (fromPop !== true) popLayer(closeModal);
    const cb = modalOnClose; modalOnClose = null;
    if (cb && !silent) cb();
  }
  $(".modal-backdrop").addEventListener("click", () => closeModal());
  modalCard.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });

  /* ÉCRAN 12 — Notices */
  const NOTICES = {
    hours: { icon: "i-clock", title: "Hors horaires", text: () => `Nous prenons les commandes de ${C.OPEN_HOUR}h à ${C.CLOSE_HOUR}h.` },
    closed: { icon: "i-store", title: "Fermeture exceptionnelle", text: () => C.CLOSED_MESSAGE },
    soon: { icon: "i-calendar", title: "Bientôt ouvert", text: () => `Les commandes ouvrent le ${frDate(C.ORDER_OPEN_DATE)}.` }
  };
  function showNotice(kind) {
    const n = NOTICES[kind];
    openModal("notice", `<div class="notice-ico"><svg><use href="#${n.icon}"/></svg></div>
      <h3>${n.title}</h3><p>${esc(n.text())}</p>
      <button class="btn-dark" data-close data-primary>Compris</button>`);
  }

  /* ÉCRAN 2 — Promo */
  function showPromo() {
    session.set("cc-promo-seen", 1);
    const floaties = [["🎉", "-14px", "8%", "0s"], ["✨", "-10px", "78%", ".6s"], ["💫", "46%", "-14px", "1.2s"], ["🎉", "58%", "calc(100% - 18px)", ".9s"], ["✨", "calc(100% - 24px)", "14%", "1.5s"]];
    openModal("promo", `
      ${floaties.map(([e, top, left, d]) => `<span class="floaty" aria-hidden="true" style="top:${top};left:${left};animation-delay:${d}">${e}</span>`).join("")}
      <button class="icon-btn modal-x" data-close aria-label="Fermer"><svg><use href="#i-close"/></svg></button>
      <span class="promo-pill">SPÉCIALE RÉDUCTION</span>
      <div class="promo-big">-${C.PROMO.percent}%</div>
      <p class="promo-items">${esc(C.PROMO.label)}</p>
      ${C.PROMO.until ? `<p class="promo-date">Offre valable jusqu'au ${frDate(C.PROMO.until)}</p>` : '<p class="promo-date"></p>'}
      <button class="btn-gold" id="promo-go" data-primary>Voir les plats en promo</button>`);
    $("#promo-go").addEventListener("click", () => {
      closeModal();
      setTimeout(() => scrollToSection(C.PROMO.targetSection || "formules"), 120);
    });
  }

  /* ÉCRAN 13 — Confirmation */
  function showDone(name, t) {
    openModal("done", `
      <svg class="check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="40"/><path d="M25 43l11 11 23-24"/></svg>
      <h3>✅ Commande envoyée !</h3>
      <p>Merci ${esc(name)} ! Chief-Chief vous recontacte pour la livraison vers <b>${esc(t.z.name)}</b>.<br>Total : <b>${fmt(t.total)}</b></p>
      <button class="btn-dark" data-close data-primary>Fermer</button>`, () => {
      cart = [];
      cartChanged();
      form.address.value = ""; form.note.value = "";
      saveCustomer();
      setTimeout(() => scrollToSection("signature"), 80);
    });
    closeSheet(cartSheet);
    confetti();
  }
  function confetti() {
    if (reduceMotion) return;
    const box = document.createElement("div");
    box.className = "confetti";
    const colors = ["#A61C24", "#E3A63C", "#6F1218", "#F4C26B"];
    for (let i = 0; i < 46; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--x", (Math.random() * 120 - 60) + "px");
      p.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      p.style.animationDuration = 1.6 + Math.random() * 1.2 + "s";
      p.style.animationDelay = Math.random() * 0.4 + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3400);
  }

  /* ================= ÉCRAN 3 — Bandeau + carrousel ================= */
  (function ticker() {
    const msgs = C.TICKER.filter((m) => PROMO_ON || !/-\s?\d+\s?%/.test(m));
    const el = $("#ticker-text");
    let i = 0;
    el.textContent = msgs[0] || "";
    if (msgs.length < 2) return;
    setInterval(() => {
      if (document.hidden) return;
      el.classList.add("out");
      setTimeout(() => {
        i = (i + 1) % msgs.length;
        el.textContent = msgs[i];
        el.classList.remove("out"); el.classList.add("in");
        void el.offsetWidth;
        el.classList.remove("in");
      }, 260);
    }, 4000);
  })();

  const carousel = (() => {
    const frame = $("#carousel-frame"), dots = $("#dots"), hook = $("#hook");
    const items = C.CAROUSEL;
    frame.innerHTML = items.map((s, i) =>
      `<div class="slide" aria-hidden="${i !== 0}"><img src="${esc(s.img)}" alt="${esc(s.title)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"><span class="slide-cap">${esc(s.title)}</span></div>`).join("");
    dots.innerHTML = items.map((s, i) => `<button role="tab" aria-label="${esc(s.title)}"></button>`).join("");
    const slides = $$(".slide", frame), dotEls = $$("button", dots);
    let cur = -1, timer = null, visible = true;
    function go(i) {
      i = (i + items.length) % items.length;
      if (i === cur) return;
      slides.forEach((s, k) => { s.classList.toggle("active", k === i); s.setAttribute("aria-hidden", k !== i); });
      dotEls.forEach((d, k) => { d.classList.toggle("active", k === i); d.setAttribute("aria-selected", k === i); });
      if (cur < 0) hook.textContent = items[i].hook;
      else if (hook.textContent !== items[i].hook) {
        hook.classList.add("fading");
        setTimeout(() => { hook.textContent = items[i].hook; hook.classList.remove("fading"); }, 350);
      }
      cur = i;
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(() => { if (visible && !document.hidden && !body.classList.contains("is-splash")) go(cur + 1); }, 2000);
    }
    dots.addEventListener("click", (e) => { const i = dotEls.indexOf(e.target.closest("button")); if (i >= 0) { go(i); play(); } });
    let x0 = null, y0 = 0;
    frame.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    frame.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(cur + (dx < 0 ? 1 : -1)); play(); }
      x0 = null;
    });
    go(0); play();
    return { setVisible(v) { visible = v; } };
  })();

  /* ================= ÉCRAN 4 — Scroll ================= */
  const hero = $("#hero");
  const progressBar = $("#progress span");
  const carouselEl = $("#carousel");
  const compactH = 56;
  let heroBottom = 0, sectionTops = [], trackLock = 0, activeCat = null;

  function measure() {
    heroBottom = hero.offsetTop + hero.offsetHeight;
    sectionTops = $$(".section").filter((s) => !s.hidden).map((s) => ({ id: s.dataset.cat, top: s.getBoundingClientRect().top + scrollY }));
    if (activeCat) placeIndicator(activeCat, false);
  }
  function catsOffset() {
    return (body.classList.contains("searching") ? 64 : compactH) + $("#cats").offsetHeight;
  }
  function setActiveCat(id, smooth = true) {
    if (!id || id === activeCat) return;
    activeCat = id;
    $$(".cat", catsTrack).forEach((c) => c.classList.toggle("active", c.dataset.cat === id));
    placeIndicator(id, smooth);
  }
  function placeIndicator(id, smooth) {
    const tab = $(`.cat[data-cat="${CSS.escape(id)}"]`, catsTrack); if (!tab) return;
    indicator.style.width = tab.offsetWidth + "px";
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    indicator.style.opacity = "1";
    const left = tab.offsetLeft - (catsTrack.clientWidth - tab.offsetWidth) / 2;
    try { catsTrack.scrollTo({ left, behavior: smooth && !reduceMotion ? "smooth" : "auto" }); } catch (e) { catsTrack.scrollLeft = left; }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      const compact = y > heroBottom - compactH;
      if (compact !== body.classList.contains("compact")) {
        body.classList.toggle("compact", compact);
        $$("#compact-bar button").forEach((b) => { b.tabIndex = compact ? 0 : -1; });
        $("#compact-bar").setAttribute("aria-hidden", !compact);
      }
      carousel.setVisible(y < heroBottom);
      if (!reduceMotion && y < heroBottom) carouselEl.style.transform = `translateY(${y * 0.1}px)`;
      if (Date.now() > trackLock && sectionTops.length) {
        const off = y + catsOffset() + 24;
        let id = sectionTops[0].id;
        for (const s of sectionTops) if (s.top <= off) id = s.id;
        if (y >= max - 4) id = sectionTops[sectionTops.length - 1].id;
        setActiveCat(id);
      }
      updateNav();
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { measure(); onScroll(); });

  function scrollToSection(id) {
    const s = $(`.section[data-cat="${CSS.escape(id)}"]`); if (!s) return;
    const y = s.getBoundingClientRect().top + scrollY - (catsOffset() + 8);
    trackLock = Date.now() + 700;
    setActiveCat(id);
    scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? "auto" : "smooth" });
  }
  catsTrack.addEventListener("click", (e) => {
    const c = e.target.closest(".cat"); if (!c) return;
    scrollToSection(c.dataset.cat);
  });

  /* ================= ÉCRAN 9 — Recherche ================= */
  const searchInput = $("#search-input");
  const searchIndex = new Map();
  function buildSearchIndex() {
    $$(".card, .signature").forEach((el) => {
      const d = dishes.get(el.dataset.id);
      searchIndex.set(el, norm(`${d.name} ${d.desc || ""} ${d.catName || "signature chef"} ${(d.variants || []).map((v) => v.label).join(" ")}`));
    });
  }
  function openSearch() {
    if (body.classList.contains("searching")) { searchInput.focus(); return; }
    body.classList.add("searching");
    $("#search-bar").setAttribute("aria-hidden", "false");
    searchInput.tabIndex = 0; $("#search-close").tabIndex = 0;
    searchInput.focus({ preventScroll: true });
    if (scrollY < heroBottom) scrollTo({ top: heroBottom - 64 + 1, behavior: "auto" });
    updateNav();
  }
  function closeSearch() {
    if (!body.classList.contains("searching")) return;
    searchInput.value = "";
    filter("");
    body.classList.remove("searching");
    $("#search-bar").setAttribute("aria-hidden", "true");
    searchInput.tabIndex = -1; $("#search-close").tabIndex = -1;
    searchInput.blur();
    updateNav();
  }
  let filterT;
  function filter(q) {
    const terms = norm(q).trim().split(/\s+/).filter(Boolean);
    let any = false;
    searchIndex.forEach((txt, el) => {
      const ok = terms.every((t) => txt.includes(t));
      any = any || ok;
      if (ok) {
        el.classList.remove("hide", "fade-out");
        el.classList.add("in");
      } else if (!el.classList.contains("hide")) {
        el.classList.add("fade-out");
      }
    });
    clearTimeout(filterT);
    filterT = setTimeout(() => {
      searchIndex.forEach((txt, el) => { if (el.classList.contains("fade-out")) el.classList.add("hide"); });
      $$(".section").forEach((s) => { s.hidden = !$$(".card:not(.hide), .signature:not(.hide)", s).length; });
      $("#no-result").hidden = any;
      measure(); onScroll();
    }, reduceMotion ? 0 : 200);
    if (!terms.length) {
      $$(".section").forEach((s) => { s.hidden = false; });
      $("#no-result").hidden = true;
    }
  }
  searchInput.addEventListener("input", () => filter(searchInput.value));
  searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") searchInput.blur(); });
  $("#search-close").addEventListener("click", closeSearch);

  /* ================= ÉCRAN 10 — Barre du bas ================= */
  const navBtns = $$("#bottom-nav [data-nav]");
  function updateNav() {
    let cur = scrollY < heroBottom - 120 ? "home" : "menu";
    if (body.classList.contains("searching")) cur = "search";
    if (cartSheet.classList.contains("open")) cur = "cart";
    navBtns.forEach((b) => {
      const on = b.dataset.nav === cur;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
  }
  $("#bottom-nav").addEventListener("click", (e) => {
    const b = e.target.closest("[data-nav]"); if (!b) return;
    const n = b.dataset.nav;
    if (n !== "cart") $$(".sheet.open").forEach((s) => closeSheet(s));
    if (n === "home") { closeSearch(); scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); }
    if (n === "menu") { closeSearch(); scrollToSection("signature"); }
    if (n === "search") openSearch();
    if (n === "cart") openCart();
  });
  $$('[data-go="top"]').forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })));

  /* ================= ÉCRAN 14 — Installation ================= */
  (function install() {
    const el = $("#install");
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    let deferred = null;
    if (standalone || local.get("cc-install-dismissed", false)) return;
    addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });
    function show() {
      if (local.get("cc-install-dismissed", false)) return;
      if (ios) {
        $("#install-sub").innerHTML = `Touchez <svg><use href="#i-share"/></svg> puis «\u00a0Sur l'écran d'accueil\u00a0»`;
        $("#install-btn").hidden = true;
      } else if (!deferred) return;
      el.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
    }
    function hide(forever) {
      el.classList.remove("show");
      setTimeout(() => { el.hidden = true; }, 350);
      if (forever) local.set("cc-install-dismissed", true);
    }
    $("#install-btn").addEventListener("click", async () => {
      if (!deferred) return;
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) { /* ignoré */ }
      deferred = null;
      hide(true);
    });
    $("#install-close").addEventListener("click", () => hide(true));
    addEventListener("appinstalled", () => hide(true));
    setTimeout(show, 6000);
  })();

  /* ================= Pied de page ================= */
  $$("[data-hours]").forEach((e) => { e.textContent = `${C.OPEN_HOUR}h à ${C.CLOSE_HOUR}h`; });
  $$("[data-wa-display]").forEach((e) => { e.textContent = C.WHATSAPP_DISPLAY; });
  $("#footer-wa").href = `https://wa.me/${C.WHATSAPP_NUMBER.replace(/\D/g, "")}`;

  /* ================= Démarrage ================= */
  if (C.WHATSAPP_NUMBER.replace(/\D/g, "").length < 10) console.warn("Chief-Chief : renseignez WHATSAPP_NUMBER dans config.js");
  renderMenu();
  buildSearchIndex();
  updateCartUI();
  observeReveals();
  requestAnimationFrame(() => { measure(); onScroll(); });
  addEventListener("load", () => { measure(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); onScroll(); });

  /* ÉCRAN 1 → ÉCRAN 2 : splash puis une seule pop-up */
  setTimeout(() => {
    body.classList.remove("is-splash");
    const sp = $("#splash"); if (sp) setTimeout(() => sp.remove(), 300);
    measure();
    if (isClosedToday()) showNotice("closed");
    else if (PROMO_ON && !session.get("cc-promo-seen", false)) showPromo();
  }, 1200);

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
