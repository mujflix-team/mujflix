;
/* Tenký modrý běžící pruh úplně nahoře, když se načítají data (TMDB / worker).
   Ukáže se až po 250 ms, aby při rychlých odpovědích neblikal. */
(function mfLoadBar() {
  try {
    if (window.__mfLoadBar || typeof window.fetch !== "function") return;
    window.__mfLoadBar = true;
    var n = 0, timer = 0, bar = null, orig = window.fetch.bind(window);
    function make() {
      if (bar) return bar;
      bar = document.createElement("div");
      bar.id = "mfLoadBar";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = "<i></i>";
      document.body.appendChild(bar);
      return bar;
    }
    function show() { timer = 0; if (n > 0 && document.body) make().classList.add("on"); }
    function inc() { n++; if (!timer && !(bar && bar.classList.contains("on"))) timer = setTimeout(show, 250); }
    function dec() { n = Math.max(0, n - 1); if (n === 0) { clearTimeout(timer); timer = 0; if (bar) bar.classList.remove("on"); } }
    function watched(u) { return /api\.themoviedb\.org|\.workers\.dev/.test(String(u && u.url ? u.url : u)); }
    window.fetch = function (input) {
      if (!watched(input)) return orig.apply(this, arguments);
      inc();
      var p = orig.apply(this, arguments);
      p.then(dec, dec);
      return p;
    };
  } catch (err) { console.warn("[load bar]", err); }
})();
