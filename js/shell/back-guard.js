;
/* Gesto/tlačítko Zpět v nainstalované aplikaci (PWA): na úvodní obrazovce by Zpět rovnou opustilo aplikaci a Android při tom
   zešedne celou obrazovku (náhled odchodu z aplikace). Proto je pod aplikací jedna pojistná položka historie:
   první Zpět jen ukáže hlášku a zůstane v aplikaci, druhý Zpět do 2 s ji normálně opustí. Vrstvy (okna, přehrávač)
   řeší nav.js, tahle pojistka je pod nimi. Jen ve standalone režimu. */
(function mfBackGuard() {
  try {
    var standalone = window.__mfForceStandalone || (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
    if (!standalone || !history.pushState) return;
    var timer = 0;
    function push() { try { history.pushState({ mfGuard: 1 }, "", location.href); } catch (e) { void e; } }
    try { history.replaceState({ mfBase: 1 }, "", location.href); } catch (e) { void e; }
    push();
    window.addEventListener("popstate", function () {
      var s = history.state;
      if (!(s && s.mfBase)) return;
      if (typeof showToast === "function") showToast("Pro ukončení stiskni Zpět ještě jednou", 2000);
      clearTimeout(timer);
      timer = setTimeout(function () { if (history.state && history.state.mfBase) push(); }, 2100);
    });
  } catch (err) { console.warn("[back guard]", err); }
})();
