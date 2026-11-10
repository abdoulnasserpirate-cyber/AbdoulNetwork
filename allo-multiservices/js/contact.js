/* ==========================================================================
   Allô Multi-Services — formulaire de contact vers WhatsApp
   ========================================================================== */
(function () {
  "use strict";

  var tabs = document.querySelector(".tabs");
  if (!tabs) return;

  var DRAFT_KEY = "allo-contact-draft-v1";
  var tabButtons = Array.prototype.slice.call(tabs.querySelectorAll("[role='tab']"));
  var panels = {
    particulier: document.getElementById("form-particulier"),
    entreprise: document.getElementById("form-entreprise")
  };
  var success = document.querySelector(".success");

  /* ---------- Stockage local (protégé : navigation privée, stockage bloqué) ---------- */
  function readDraft() {
    try { return JSON.parse(window.localStorage.getItem(DRAFT_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function writeDraft(data) {
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) { /* ignoré */ }
  }
  function clearDraft(formId) {
    var d = readDraft();
    delete d[formId];
    writeDraft(d);
  }

  /* ---------- Onglets ---------- */
  function selectTab(name, focus) {
    tabButtons.forEach(function (btn, i) {
      var on = btn.getAttribute("data-tab") === name;
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      if (on) { tabs.setAttribute("data-active", String(i)); if (focus) btn.focus(); }
    });
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
    if (success) success.classList.remove("is-visible");
  }
  tabButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () { selectTab(btn.getAttribute("data-tab")); });
    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var next = tabButtons[(i + (e.key === "ArrowRight" ? 1 : -1) + tabButtons.length) % tabButtons.length];
      selectTab(next.getAttribute("data-tab"), true);
    });
  });
  // ancre #partenaire -> onglet Entreprise
  function syncHash() { if (location.hash === "#partenaire") selectTab("entreprise"); }
  syncHash();
  window.addEventListener("hashchange", syncHash);
  document.querySelectorAll("a[href$='#partenaire']").forEach(function (a) {
    a.addEventListener("click", function () { selectTab("entreprise"); });
  });

  /* ---------- Validation ---------- */
  var messages = {
    required: "Ce champ est nécessaire.",
    phone: "Indiquez un numéro valide (8 chiffres, ex. 74 58 18 24).",
    select: "Choisissez une option."
  };
  function validateField(input) {
    var field = input.closest(".field");
    var error = field ? field.querySelector(".field__error") : null;
    var value = input.value.trim();
    var msg = "";
    if (input.required && !value) msg = input.tagName === "SELECT" ? messages.select : messages.required;
    else if (input.type === "tel" && value) {
      var d = value.replace(/\D/g, "");
      if (d.indexOf("227") === 0 && d.length === 11) d = d.slice(3);
      if (d.length !== 8) msg = messages.phone;
    }
    if (field) {
      field.classList.toggle("is-invalid", !!msg);
      field.classList.toggle("is-valid", !msg && !!value);
    }
    if (error) error.textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  /* ---------- Message WhatsApp (sans emoji) ---------- */
  function buildMessage(form) {
    var type = form.getAttribute("data-type");
    var lines = ["Bonjour Allô Multi-Services,", "Nouvelle demande depuis le site.", ""];
    if (type === "entreprise") lines.push("Type : Devenir partenaire");
    var fields = Array.prototype.slice.call(form.querySelectorAll("[data-msg]"));
    // le type de besoin en premier, comme dans l'exemple du cahier des charges
    fields.sort(function (a, b) { return (b.getAttribute("data-msg") === "Type") - (a.getAttribute("data-msg") === "Type"); });
    fields.forEach(function (input) {
      var v = input.value.trim();
      if (!v && !input.required) return;
      lines.push(input.getAttribute("data-msg") + " : " + (v || "-"));
    });
    return lines.join("\n");
  }

  Object.keys(panels).forEach(function (id) {
    var form = panels[id];
    if (!form) return;
    var inputs = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));

    // restauration du brouillon
    var saved = readDraft()[id] || {};
    inputs.forEach(function (input) {
      if (saved[input.name] != null && saved[input.name] !== "") input.value = saved[input.name];
    });

    inputs.forEach(function (input) {
      var touched = false;
      input.addEventListener("blur", function () { touched = true; validateField(input); });
      input.addEventListener("input", function () {
        if (touched || input.closest(".field").classList.contains("is-invalid")) validateField(input);
        var d = readDraft();
        d[id] = d[id] || {};
        d[id][input.name] = input.value;
        writeDraft(d);
      });
      input.addEventListener("change", function () { if (input.tagName === "SELECT") validateField(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var url = window.Allo && window.Allo.waHref
        ? window.Allo.waHref(buildMessage(form))
        : "https://wa.me/22774581824?text=" + encodeURIComponent(buildMessage(form));
      // window.open avec "noopener" renvoie toujours null : on coupe l'opener à la main
      var win = window.open(url, "_blank");
      if (win) { try { win.opener = null; } catch (err) { /* ignoré */ } }
      else window.location.href = url;

      clearDraft(id);
      form.reset();
      inputs.forEach(function (input) {
        var f = input.closest(".field");
        if (f) f.classList.remove("is-valid", "is-invalid");
      });
      form.hidden = true;
      if (success) {
        success.classList.add("is-visible");
        var title = success.querySelector("[tabindex]");
        if (title) title.focus();
      }
    });
  });

  var again = document.querySelector("[data-new-request]");
  if (again) again.addEventListener("click", function () {
    var active = tabButtons.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0];
    selectTab(active ? active.getAttribute("data-tab") : "particulier", true);
  });
})();
