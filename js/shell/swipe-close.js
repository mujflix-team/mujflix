;
/* Zavření okna tažením dolů (telefon): detail seriálu, Oblíbené a Objevovat. Okno se táhne za prstem;
   pustí-li se po 120 px, zavře se stejnou funkcí jako křížek/Zpět. Nezačne, když je obsah odrolovaný
   nebo prst začal ve vodorovně posuvné řadě, ve formuláři či v přehrávači. */
(function mfSwipeClose() {
  try {
    if (!("ontouchstart" in window)) return;
    var LAYERS = { seriesModal: "closeModal", watchlistOverlay: "closeWatchlist", universeOverlay: "closeUniverse" };
    var TH = 120, st = null;
    function layerOf(t) { var el = t && t.closest ? t.closest("#seriesModal, #watchlistOverlay, #universeOverlay") : null; return el && LAYERS[el.id] ? el : null; }
    function blocked(t, root) {
      for (var n = t; n && n !== root.parentNode; n = n.parentNode) {
        if (!n.tagName) continue;
        if (/^(INPUT|TEXTAREA|SELECT|IFRAME|VIDEO)$/.test(n.tagName)) return true;
        if (n.id === "epRatingOverlay") return true;
        if (n.scrollTop > 0) return true;
        if (n.scrollWidth > n.clientWidth + 2) { var ox = getComputedStyle(n).overflowX; if (ox === "auto" || ox === "scroll") return true; }
      }
      return false;
    }
    document.addEventListener("touchstart", function (e) {
      st = null;
      if (e.touches.length !== 1) return;
      var root = layerOf(e.target);
      if (!root || blocked(e.target, root)) return;
      st = { root: root, x: e.touches[0].clientX, y: e.touches[0].clientY, dy: 0, on: false };
    }, { passive: true });
    document.addEventListener("touchmove", function (e) {
      if (!st) return;
      var dy = e.touches[0].clientY - st.y, dx = e.touches[0].clientX - st.x;
      if (!st.on) {
        if (dy < 0 || Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 10 || dy < -6) st = null; return; }
        if (dy < 12) return;
        st.on = true; st.root.style.transition = "none";
      }
      st.dy = Math.max(0, dy);
      st.root.style.transform = "translateY(" + st.dy * 0.8 + "px)";
    }, { passive: true });
    function end() {
      if (!st) return;
      var s = st; st = null;
      if (!s.on) return;
      var close = s.dy >= TH, r = s.root;
      r.style.transition = "transform .2s var(--ease-std, ease)";
      r.style.transform = "";
      setTimeout(function () { r.style.transition = ""; r.style.transform = ""; }, 260);
      if (close) {
        if (typeof window.mfHaptic === "function") window.mfHaptic(25);
        var fn = window[LAYERS[r.id]]; if (typeof fn === "function") fn();
      }
    }
    document.addEventListener("touchend", end, { passive: true });
    document.addEventListener("touchcancel", end, { passive: true });
  } catch (e) { void e; }
})();
