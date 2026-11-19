;
/* Stažení dolů na Domů (jako na Instagramu): když jsi úplně nahoře a přetáhneš prstem dolů, objeví se
   kolečko a po puštění se obnoví doporučení na Domů. Jen dotykové displeje. */
(function mfPullRefresh() {
  try {
    /* Tlačítko obnovení v hlavičce: na Domů nový výběr titulů, v Objevování nové řady, v ostatních sekcích překreslení sekce */
    var rb = document.getElementById("hdrReload");
    if (rb) rb.addEventListener("click", function () {
      rb.classList.remove("spin"); void rb.offsetWidth; rb.classList.add("spin");
      try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { void e; }
      var dv = document.getElementById("universeOverlay");
      var onHome = document.documentElement.classList.contains("mfh-home-on") && !document.body.classList.contains("mf-section-protebe");
      try {
        if (dv && dv.classList.contains("open") && window.mfDiscoverReroll) window.mfDiscoverReroll();
        else if (onHome && window.mfhNewPicks) window.mfhNewPicks();
        else if (typeof window.mfShowSection === "function") window.mfShowSection(window._mfCurrentSection || "serialy");
      } catch (e) { void e; }
      if (typeof showToast === "function") showToast("Obnovuji…");
    });
    /* návrat na stránku z paměti (zpět v PWA) – když zůstala prázdná/šedá, načti ji znovu */
    window.addEventListener("pageshow", function (e) { if (e.persisted) location.reload(); });
    if (!("ontouchstart" in window)) return;
    var TH = 64, MAX = 96, K = 0.45, y0 = 0, pull = 0, armed = false, on = false, busy = false, ind = null; /* TH = práh obnovení, K = odpor (prst musí ujet cca 2,2× víc) */
    function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { void e; } } /* haptická odezva (Android; iOS vibrace nepodporuje) */
    window.mfHaptic = buzz; /* sdílená haptika pro akce (dock, oblíbené, hodnocení) */
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".dock-btn")) buzz(25); }, true);
    var BLOCK = '#seriesModal, #universeOverlay, #watchlistOverlay, #mfStandaloneCinema, #mfProfileGate, #mfSettings, #epRatingOverlay, [role="dialog"], [aria-modal="true"], .modal, .modal-content';
    /* jen když prst začne v horní části Domů (hlavní lišta nebo banner) a nic není otevřené nad ním (detail, epizody, Objevování, nastavení…) */
    function homeOk(t) {
      var r = document.documentElement;
      if (!r.classList.contains("mfh-home-on") || document.body.classList.contains("mf-section-protebe")) return false;
      if (!t || !t.closest) return false;
      if (t.closest(BLOCK) || !t.closest("#mfHeader, #nfHero")) return false;
      if (document.querySelector("#seriesModal.open, #seriesModal.visible, #universeOverlay.open, #watchlistOverlay.open")) return false;
      return (window.pageYOffset || r.scrollTop || 0) <= 0;
    }
    function make() {
      if (ind) return ind;
      ind = document.createElement("div");
      ind.setAttribute("aria-hidden", "true");
      ind.style.cssText = "position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);width:36px;height:36px;margin-left:-18px;border-radius:50%;background:#2a2a2a;border:1px solid #3a3a3a;box-shadow:0 4px 14px rgba(0,0,0,.6);z-index:1000;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateY(-60px);pointer-events:none;will-change:transform,opacity";
      ind.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>';
      document.body.appendChild(ind);
      return ind;
    }
    function draw(d, anim) {
      var i = make();
      i.style.transition = anim ? "transform .22s cubic-bezier(.2,.7,.2,1), opacity .22s" : "none";
      i.style.opacity = d > 4 ? String(Math.min(1, d / TH)) : "0";
      i.style.transform = "translateY(" + (d - 60) + "px) rotate(" + (d * 3) + "deg)";
    }
    document.addEventListener("touchstart", function (e) {
      on = !busy && e.touches.length === 1 && homeOk(e.target);
      pull = 0; armed = false;
      if (on) y0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchmove", function (e) {
      if (!on) return;
      var dy = e.touches[0].clientY - y0;
      if (dy <= 0 || (window.pageYOffset || document.documentElement.scrollTop || 0) > 0) { if (pull) draw(0, true); pull = 0; return; }
      pull = Math.min(MAX, dy * K);
      if (!armed && pull >= TH) { armed = true; buzz(30); }
      else if (armed && pull < TH) { armed = false; }
      draw(pull, false);
    }, { passive: true });
    function end() {
      if (!on) return;
      on = false;
      if (pull >= TH && !busy) {
        busy = true;
        buzz([35, 50, 45]);
        draw(TH * 0.7, true);
        if (typeof showToast === "function") showToast("Obnovuji doporučení…");
        try { (window.mfhNewPicks || window.mfhRefresh || function () {})(); } catch (e) {}
        setTimeout(function () { draw(0, true); busy = false; }, 900);
      } else draw(0, true);
      pull = 0; armed = false;
    }
    document.addEventListener("touchend", end, { passive: true });
    document.addEventListener("touchcancel", end, { passive: true });
  } catch (err) { console.warn("[pull refresh]", err); }
})();
