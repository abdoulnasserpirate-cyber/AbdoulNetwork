/* ==========================================================================
   Allô Multi-Services — service worker
   - pages HTML : réseau d'abord, cache ensuite, puis offline.html
   - CSS / JS / polices : cache d'abord (versionné)
   - images : stale-while-revalidate
   Pensez à incrémenter VERSION à chaque mise en ligne d'une modification.
   ========================================================================== */
const VERSION = "v1.0.0";
const STATIC_CACHE = `allo-static-${VERSION}`;
const RUNTIME_CACHE = `allo-runtime-${VERSION}`;
const IMAGE_CACHE = `allo-images-${VERSION}`;

const PRECACHE = [
  "/",
  "/index.html",
  "/a-propos.html",
  "/contact.html",
  "/offline.html",
  "/404.html",
  "/manifest.webmanifest",
  "/css/tokens.css",
  "/css/main.css",
  "/css/motion.css",
  "/js/config.js",
  "/js/app.js",
  "/js/motion.js",
  "/js/contact.js",
  "/js/pwa.js",
  "/assets/logo/logo-dark.webp",
  "/assets/logo/logo-light.webp",
  "/assets/icons/icon-192.png",
  "/favicon.ico"
];

const CDN_HOSTS = ["cdnjs.cloudflare.com", "cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("allo-") && !k.endsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = (await cache.match(request, { ignoreSearch: true })) || (await caches.match(request, { ignoreSearch: true }));
    return cached || caches.match("/offline.html");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === "opaque")) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Pages HTML
  if (request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html")) {
    if (url.origin === self.location.origin) event.respondWith(networkFirst(request));
    return;
  }

  // Bibliothèques CDN et polices
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Images
  if (request.destination === "image" || /\.(png|jpe?g|webp|avif|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // CSS, JS, manifest
  if (/\.(css|js|webmanifest|woff2?)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
