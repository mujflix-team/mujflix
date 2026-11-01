/* MůjFlix service worker — „nejdřív síť, pak cache“.
   Vždy se snaží vzít čerstvou verzi, takže po nasazení opravy nehrozí starý kód.
   Cache slouží jako záloha pro soubory; bez internetu se místo aplikace ukáže „Jsi offline“. Výjimka: písma (`/fonts/*.woff2`) jdou nejdřív z cache. Cizí domény (TMDB, CDN) se nikdy nezasahují. */
/* Název cache nese verzi aplikace (?v= v adrese skriptu, viz initPWA): nová verze = nová cache, stará se při aktivaci smaže */
const CACHE = "mujflix-shell-" + (new URL(self.location.href).searchParams.get("v") || "v1").replace(/[^\w.-]/g, "");

/* Při instalaci si uložíme stránku „Jsi offline“, aby šla ukázat, i když cache nemá nic jiného. */
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add("./offline.html")).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/config.js")) return; // konfigurace se nikdy necachuje
  if (/\/fonts\/[^/]+\.woff2$/.test(url.pathname)) { // písma se nemění: nejdřív cache, bez zbytečného dotazu na síť
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    })));
    return;
  }
  event.respondWith(
    fetch(req, { cache: "no-cache" }) // vždy zrevaliduj – jinak prohlížeč může ještě 10 min servírovat starý kód
      .then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => req.mode === "navigate" ? caches.match("./offline.html") : caches.match(req, { ignoreSearch: true })) // bez internetu se stránka neotvírá z cache, ale ukáže „Jsi offline“
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      return self.clients.openWindow(target);
    })
  );
});
