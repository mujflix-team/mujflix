;
/* Ukázka při najetí na kartu (jen počítač s myší): po chvíli se na plakátu spustí krátký trailer bez zvuku, jako na Netflixu.
   Trailer se hledá v TMDB (/videos), iframe vznikne až po 1 s najetí a zmizí při odjetí. Nespouští se na dotykových
   zařízeních, při úspoře dat ani když je otevřené okno. Vypnutí: localStorage mf_hover_trailer = "0". */
(function mfHoverTrailer() {
  try {
    if (!window.matchMedia || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var DELAY = 1000, cache = {}, timer = 0, cur = null;
    function off() { try { return localStorage.getItem("mf_hover_trailer") === "0" || (navigator.connection && navigator.connection.saveData); } catch (e) { return false; } }
    function itemOf(card) {
      if (card.classList.contains("dv-card")) { var d = card._dvItem; return d && d.id ? { id: d.id, kind: d.type === "tv" ? "tv" : "movie" } : null; }
      var list = document.getElementById(card.getAttribute("data-cid") || ""); var it = list && list._mfhItems && list._mfhItems[+card.getAttribute("data-idx")];
      return it && it.tmdbId ? { id: it.tmdbId, kind: it.mediaType === "tv" ? "tv" : "movie" } : null;
    }
    function keyFor(m) {
      var k = m.kind + ":" + m.id;
      if (!cache[k]) cache[k] = (typeof tmdbGet === "function" && typeof _sdPickTrailer === "function")
        ? tmdbGet("/" + m.kind + "/" + m.id + "/videos?language=cs-CZ&include_video_language=cs,en,null").then(function (v) { return _sdPickTrailer(v) || ""; }).catch(function () { delete cache[k]; return ""; })
        : Promise.resolve("");
      return cache[k];
    }
    function modalOpen() { var m = document.getElementById("seriesModal"); return !!(m && m.classList.contains("visible")); }
    function stop() {
      clearTimeout(timer); timer = 0;
      if (cur) { var f = cur.frame; cur.host.classList.remove("mf-ht"); cur = null; if (f && f.parentNode) f.parentNode.removeChild(f); }
    }
    function start(card, m) {
      keyFor(m).then(function (key) {
        if (!key || !card.matches(":hover") || modalOpen() || cur) return;
        var host = card.querySelector(".nf-poster, .dv-poster"); if (!host) return;
        var f = document.createElement("iframe");
        f.className = "mf-hover-trailer"; f.tabIndex = -1; f.setAttribute("aria-hidden", "true"); f.title = "Ukázka"; f.allow = "autoplay; encrypted-media";
        f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(key) + "?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&modestbranding=1&loop=1&playlist=" + encodeURIComponent(key);
        f.addEventListener("load", function () { f.classList.add("on"); });
        host.appendChild(f); host.classList.add("mf-ht"); cur = { card: card, frame: f, host: host };
      });
    }
    document.addEventListener("mouseover", function (e) {
      var card = e.target.closest && e.target.closest(".nf-card, .dv-card");
      if (cur && (!card || card !== cur.card)) stop();
      if (!card || (cur && cur.card === card) || off() || card.classList.contains("nf-card-sk")) return;
      var m = itemOf(card); if (!m) return;
      clearTimeout(timer); timer = setTimeout(function () { start(card, m); }, DELAY);
    });
    document.addEventListener("mouseout", function (e) {
      var card = e.target.closest && e.target.closest(".nf-card, .dv-card");
      if (card && !(e.relatedTarget && card.contains(e.relatedTarget))) stop();
    });
    document.addEventListener("click", stop, true);
    window.addEventListener("scroll", function () { if (cur || timer) stop(); }, { passive: true, capture: true });
  } catch (e) { void e; }
})();
