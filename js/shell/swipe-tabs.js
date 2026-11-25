;
/* Přepínání sekcí tažením do strany (telefon): Domů, Seriály, Filmy, Oblíbené, Profil jako na dolní liště.
   Tažení doleva = další sekce, doprava = předchozí. Nezačne ve vodorovně posuvných řadách, formulářích, přehrávači
   ani když je otevřené okno (detail, přehrávač, trailer, nastavení). Vyvolá stejné klepnutí na dock jako ruční výběr. */
(function mfSwipeTabs() {
  try {
    if (!("ontouchstart" in window)) return;
    var ORDER = ["dockHome", "dockObjevovat", "dockProtebe", "dockProfile"], MIN = 90, st = null; /* na telefonu: Domů, Objevovat, Oblíbené, Profil */
    function modalOpen() {
      if (document.querySelector("#seriesModal.open, #mfStandaloneCinema.open, #mfTrailerBox, #epRatingOverlay.open")) return true;
      var ms = document.querySelectorAll("[aria-modal='true']");
      for (var i = 0; i < ms.length; i++) {
        if (!ms[i].getClientRects().length) continue;
        var cs = getComputedStyle(ms[i]); /* zavřená okna zůstávají v DOM jako průhledná a neklikací */
        if (cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.01 && cs.pointerEvents !== "none") return true;
      }
      return false;
    }
    function blocked(t) {
      for (var n = t; n && n.nodeType === 1; n = n.parentNode) {
        if (/^(INPUT|TEXTAREA|SELECT|IFRAME|VIDEO)$/.test(n.tagName) || n.hasAttribute("data-no-swipe")) return true;
        if (n.scrollWidth > n.clientWidth + 2) { var ox = getComputedStyle(n).overflowX; if (ox === "auto" || ox === "scroll") return true; }
      }
      return false;
    }
    document.addEventListener("touchstart", function (e) {
      st = null;
      if (e.touches.length !== 1 || modalOpen() || blocked(e.target)) return;
      st = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
      var s = st; st = null;
      if (!s || !e.changedTouches || !e.changedTouches.length || modalOpen()) return;
      var dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y;
      if (Math.abs(dx) < MIN || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - s.t > 700) return;
      var act = document.querySelector(".dock-btn.active"), i = act ? ORDER.indexOf(act.id) : -1;
      if (i < 0) return;
      var next = document.getElementById(ORDER[i + (dx < 0 ? 1 : -1)]);
      if (!next) return;
      if (typeof window.mfHaptic === "function") window.mfHaptic(20);
      next.click();
    }, { passive: true });
    document.addEventListener("touchcancel", function () { st = null; }, { passive: true });
  } catch (e) { void e; }
})();
