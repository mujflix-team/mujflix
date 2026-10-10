/* MůjFlix service worker — „nejdřív síť, pak cache“.
   Vždy se snaží vzít čerstvou verzi, takže po nasazení opravy nehrozí starý kód.
   Cache slouží jen jako záloha, když je člověk offline. Cizí domény (TMDB, CDN) se nikdy nezasahují. */
const CACHE = "mujflix-shell-v1";

self.addEventListener("install", () => self.skipWaiting());

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
  event.respondWith(
    fetch(req, { cache: "no-cache" }) // vždy zrevaliduj – jinak prohlížeč může ještě 10 min servírovat starý kód
      .then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)))
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
