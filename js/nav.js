;
/* Tlačítko Zpět v prohlížeči/telefonu zavírá otevřené vrstvy (přehrávač, detail, Oblíbené, Objevovat)
   krok po kroku, místo aby uživatele vyhodilo z aplikace. */
(function mfBackLayers() {
  try {
    var LAYERS = [
      { id: "universeOverlay", open: function (e) { return e.classList.contains("open"); }, close: function () { if (window.closeUniverse) window.closeUniverse(); } },
      { id: "watchlistOverlay", open: function (e) { return e.classList.contains("open") || e.classList.contains("visible"); }, close: function () { if (window.closeWatchlist) window.closeWatchlist(); } },
      { id: "seriesModal", open: function (e) { return e.classList.contains("open"); }, close: function () { if (window.closeModal) window.closeModal(); } },
      { id: "mfhSeeAllModal", open: function (e) { return e.classList.contains("open"); }, close: function () { if (window.mfhCloseSeeAll) window.mfhCloseSeeAll(); } },
      { id: "mfStandaloneCinema", open: function (e) { return e.classList.contains("open"); }, close: function () { var b = document.getElementById("mfStandaloneCinemaClose"); if (b) b.click(); } }
    ];
    /* interní přepínání sekcí (#serialy, #filmy …) nesmí přidávat položky do historie, jen přepisuje aktuální */
    var rawPush = history.pushState;
    history.pushState = function (st, t, u) {
      if (typeof u === "string" && u.charAt(0) === "#") return history.replaceState(history.state, t, location.pathname + location.search);
      return rawPush.apply(this, arguments);
    };
    var stack = [];
    var pops = 0;
    function depth() { var s = history.state; return (s && s.mfLayer) || 0; }
    function find(id) { for (var i = 0; i < LAYERS.length; i++) if (LAYERS[i].id === id) return LAYERS[i]; }
    try { if (depth()) history.replaceState({ mfLayer: 0 }, "", location.href); } catch (e) {}

    function check() {
      LAYERS.forEach(function (l) {
        var el = document.getElementById(l.id);
        var on = !!(el && l.open(el));
        var at = stack.indexOf(l.id);
        if (on && at === -1) {
          stack.push(l.id);
          try { history.pushState({ mfLayer: stack.length }, "", location.href); } catch (e) {}
        } else if (!on && at !== -1) {
          stack.splice(at, 1);
        }
      });
      var extra = depth() - stack.length;
      if (extra > 0) { pops++; try { history.go(-extra); } catch (e) { pops--; } }
    }
    window.addEventListener("popstate", function () {
      if (pops > 0) { pops--; return; }
      var target = depth();
      while (stack.length > target) {
        var l = find(stack.pop());
        try { if (l) l.close(); } catch (e) {}
      }
    });
    document.addEventListener("click", function () { setTimeout(check, 60); setTimeout(check, 500); }, true);
    setInterval(function () { if (!document.hidden) check(); }, 250);
  } catch (err) { console.warn("[back layers]", err); }
})();
