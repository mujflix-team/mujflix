/* Hláška „Je dostupná nová verze“: aplikace (hlavně na telefonu / v nainstalovaném okně) se jinak drží staré verze, dokud ji člověk nezavře.
   Skript občas (při návratu do aplikace a jednou za 30 min) zeptá serveru na js/core/version.js a porovná s verzí, která právě běží. */
(function () {
  var cur = window.MF_VERSION, shown = false, dismissed = "", last = 0;
  if (!cur) return;

  function showBar(v) {
    if (shown || dismissed === v || document.getElementById("mfUpdateBar")) return;
    shown = true;
    var b = document.createElement("div");
    b.id = "mfUpdateBar"; b.setAttribute("role", "status");
    var t = document.createElement("span"); t.textContent = "Je dostupná nová verze MůjFlixu (" + v + ")";
    var go = document.createElement("button"); go.type = "button"; go.className = "mf-upd-go"; go.textContent = "Obnovit";
    go.onclick = function () { go.disabled = true; go.textContent = "Obnovuji…"; location.reload(); };
    var x = document.createElement("button"); x.type = "button"; x.className = "mf-upd-x"; x.setAttribute("aria-label", "Později"); x.textContent = "✕";
    x.onclick = function () { dismissed = v; shown = false; b.remove(); };
    b.appendChild(t); b.appendChild(go); b.appendChild(x);
    document.body.appendChild(b);
  }

  function check(force) {
    if (shown || (!force && Date.now() - last < 60000)) return Promise.resolve();
    last = Date.now();
    return fetch("js/core/version.js?" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (txt) { var m = /MF_VERSION\s*=\s*"([^"]+)"/.exec(txt || ""); if (m && m[1] !== cur) showBar(m[1]); })
      .catch(function () { /* offline: nic */ });
  }

  document.addEventListener("visibilitychange", function () { if (!document.hidden) check(false); });
  setTimeout(function () { check(false); }, 8000);
  setInterval(function () { check(false); }, 30 * 60000);
  window.mfCheckUpdate = check;
})();
