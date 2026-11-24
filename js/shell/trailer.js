;
/* Trailer v okně: window.mfPlayTrailer("tv" | "movie", tmdbId). Trailer se hledá v TMDB (/videos, nejdřív český, pak anglický),
   přehraje se v YouTube přehrávači nad aplikací. Zavře se křížkem, klepnutím mimo nebo klávesou Esc. */
(function mfTrailer() {
  var cache = {}, box = null;
  function keyFor(kind, id) {
    var k = kind + ":" + id;
    if (!cache[k]) cache[k] = (typeof tmdbGet === "function" && typeof _sdPickTrailer === "function")
      ? tmdbGet("/" + kind + "/" + id + "/videos?language=cs-CZ&include_video_language=cs,en,null").then(function (v) { return _sdPickTrailer(v) || ""; }).catch(function () { delete cache[k]; return ""; })
      : Promise.resolve("");
    return cache[k];
  }
  function close() {
    if (!box) return;
    var b = box; box = null; b.classList.remove("on");
    document.removeEventListener("keydown", onKey, true);
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 220);
  }
  function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); close(); } }
  function toast(t) { if (typeof showToast === "function") showToast(t, 2600); }
  window.mfPlayTrailer = function (kind, id) {
    if (box) return;
    id = String(id || "");
    if (!/^\d+$/.test(id)) { toast("Trailer pro tenhle titul není"); return; }
    keyFor(kind === "tv" ? "tv" : "movie", id).then(function (key) {
      if (!key) { toast("Trailer pro tenhle titul není"); return; }
      if (box) return;
      box = document.createElement("div");
      box.id = "mfTrailerBox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Trailer");
      box.innerHTML = '<div class="tb-frame"><button type="button" class="tb-x" aria-label="Zavřít trailer">✕</button>' +
        '<iframe title="Trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen src="https://www.youtube-nocookie.com/embed/' +
        encodeURIComponent(key) + '?autoplay=1&rel=0&playsinline=1&modestbranding=1"></iframe></div>';
      box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".tb-x")) close(); });
      document.body.appendChild(box);
      document.addEventListener("keydown", onKey, true);
      requestAnimationFrame(function () { box && box.classList.add("on"); });
      var x = box.querySelector(".tb-x"); if (x) x.focus();
    });
  };
  window.mfCloseTrailer = close;

  /* TV ikony na kartách jsou skryté (hidden + data-tk/data-tid), dokud se neověří, že trailer existuje:
     zjišťuje se líně, až když je karta na očích, a nejvýš 4 dotazy naráz. Bez traileru se ikona z karty odstraní. */
  var queue = [], running = 0;
  function pump() {
    while (running < 4 && queue.length) {
      (function (b) {
        running++;
        keyFor(b.getAttribute("data-tk"), b.getAttribute("data-tid")).then(function (key) {
          if (!b.isConnected) return;
          if (key) b.hidden = false; else b.parentNode && b.parentNode.removeChild(b);
        }).then(function () { running--; pump(); });
      })(queue.shift());
    }
  }
  if (window.IntersectionObserver && window.MutationObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var b = e.target.querySelector("[data-tk][hidden]");
        if (b) { queue.push(b); pump(); }
      });
    }, { rootMargin: "200px" });
    var scan = function (root) {
      if (window.__mfNoTrailerProbe || !root.querySelectorAll) return;
      var list = root.matches && root.matches("[data-tk][hidden]") ? [root] : [].slice.call(root.querySelectorAll("[data-tk][hidden]"));
      list.forEach(function (b) { if (!b._mfp && b.parentNode) { b._mfp = 1; io.observe(b.parentNode); } });
    };
    new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); }); }); }).observe(document.documentElement, { childList: true, subtree: true });
    scan(document.documentElement);
  }
})();
