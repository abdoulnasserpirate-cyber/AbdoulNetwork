/* Chief-Chief — service worker : l'app reste utilisable avec un réseau faible.
   Pages, config et scripts : réseau d'abord (toujours à jour), cache en secours.
   Images et polices : cache d'abord. */
const CACHE = "chief-chief-v1";
const SHELL = [
  "./", "index.html", "styles.css", "app.js", "config.js", "manifest.webmanifest",
  "img/logo.webp", "img/logo-192.png",
  "img/plat-du-chef.webp", "img/pizza.webp", "img/poulet-frites.webp", "img/riz-creole.webp"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isAsset = /\.(webp|png|jpg|jpeg|svg|woff2?)$/.test(url.pathname) || url.host.includes("fonts.g");
  if (url.origin !== location.origin && !url.host.includes("fonts.g")) return;

  if (isAsset) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
  );
});
