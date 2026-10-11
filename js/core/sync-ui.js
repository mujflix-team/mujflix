/* MůjFlix — obrazovka „Propojit zařízení“ (MFSyncUI). Logika je v js/core/sync.js. */
(function () {
  "use strict";
  var el = null, tick = null, expiresAt = 0, onCloseCb = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var ICON = '<svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="26" height="18" rx="2.5"/><path d="M11 34h12M17 28v6"/><rect x="31" y="18" width="13" height="22" rx="2.5"/><path d="M36.5 36h2"/><path d="M26 8c6 0 11 2.4 14 6" /><path d="M37 9l3.2 5-5.4 1.4"/></svg>';

  function ensure() {
    if (el) return el;
    el = document.createElement("div");
    el.id = "mfSyncModal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Propojit zařízení");
    el.addEventListener("click", function (e) {
      if (e.target === el) close();
      var b = e.target.closest && e.target.closest("[data-sa]");
      if (b) act(b.getAttribute("data-sa"));
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "Enter" && e.target && e.target.id === "mfSyncInput") act("join");
    });
    document.body.appendChild(el);
    return el;
  }

  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  function ago(ts) {
    if (!ts) return "ještě nikdy";
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return "před chvílí";
    var m = Math.round(s / 60);
    if (m < 60) return "před " + m + " min";
    var h = Math.round(m / 60);
    if (h < 24) return "před " + h + " h";
    return "před " + Math.round(h / 24) + " dny";
  }

  function frame(inner, back) {
    return '<div class="sy-box">' +
      '<button type="button" class="sy-x" data-sa="close" aria-label="Zavřít">×</button>' +
      (back ? '<button type="button" class="sy-back" data-sa="home" aria-label="Zpět">‹ Zpět</button>' : '') +
      inner + '</div>';
  }

  function render(screen, data) {
    ensure();
    stopTick();
    data = data || {};
    var S = window.MFSync, html = "";
    if (screen === "home") {
      if (!S || !S.available()) {
        html = frame('<div class="sy-ico">' + ICON + '</div><h2 class="sy-title">Propojit zařízení</h2>' +
          '<p class="sy-text">Propojení zatím není zapnuté. Je potřeba nastavit adresu Cloudflare Workeru v <b>config.js</b> (viz README).</p>' +
          '<button type="button" class="sy-btn sy-ghost" data-sa="close">Zavřít</button>');
      } else if (S.isLinked()) {
        html = frame('<div class="sy-ico sy-ok">' + ICON + '</div><h2 class="sy-title">Zařízení je propojené ✓</h2>' +
          '<p class="sy-text">Profily, seznamy a hodnocení se sdílejí mezi všemi propojenými zařízeními.<br>Poslední synchronizace: <b id="syLast">' + esc(ago(S.lastSync())) + '</b></p>' +
          '<div class="sy-msg" id="syMsg" role="status"></div>' +
          '<div class="sy-choices">' +
          '<button type="button" class="sy-choice" data-sa="sync"><strong>Synchronizovat teď</strong><span>Stáhne změny z ostatních zařízení</span></button>' +
          '<button type="button" class="sy-choice" data-sa="show"><strong>Přidat další zařízení</strong><span>Zobrazí kód, který zadáš na druhém zařízení</span></button>' +
          '</div><button type="button" class="sy-btn sy-link" data-sa="unlink">Odpojit toto zařízení</button>');
      } else {
        html = frame('<div class="sy-ico">' + ICON + '</div><h2 class="sy-title">Propojit zařízení</h2>' +
          '<p class="sy-text">Měj stejné profily, seznamy a hodnocení na telefonu, tabletu i počítači. Bez hesla a bez e-mailu – stačí opsat krátký kód.</p>' +
          '<div class="sy-choices">' +
          '<button type="button" class="sy-choice" data-sa="show"><strong>Zobrazit kód</strong><span>Moje data jsou tady a chci je dostat na jiné zařízení</span></button>' +
          '<button type="button" class="sy-choice" data-sa="enter"><strong>Mám kód</strong><span>Chci sem načíst data z jiného zařízení</span></button>' +
          '</div>');
      }
    } else if (screen === "show") {
      html = frame('<h2 class="sy-title">Tvůj kód</h2><div class="sy-code" id="syCode" aria-live="polite">…</div>' +
        '<div class="sy-qr" id="syQr"></div>' +
        '<ol class="sy-steps"><li>Na druhém zařízení otevři MůjFlix.</li><li>Klikni na <b>Propojit zařízení</b> → <b>Mám kód</b>.</li><li>Opiš kód nebo naskenuj QR kód fotoaparátem.</li></ol>' +
        '<div class="sy-msg" id="syMsg" role="status"></div><div class="sy-timer" id="syTimer"></div>' +
        '<button type="button" class="sy-btn sy-ghost" data-sa="show">Nový kód</button>', true);
    } else if (screen === "enter") {
      html = frame('<h2 class="sy-title">Zadej kód</h2><p class="sy-text">Opiš 6znakový kód, který vidíš na prvním zařízení.</p>' +
        '<input id="mfSyncInput" class="sy-input" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="7" placeholder="ABC DEF" value="' + esc(data.code || "") + '" aria-label="Kód">' +
        '<div class="sy-msg" id="syMsg" role="status"></div>' +
        '<button type="button" class="sy-btn sy-primary" id="syJoin" data-sa="join">Připojit</button>', true);
    } else if (screen === "done") {
      html = frame('<div class="sy-ico sy-ok">' + ICON + '</div><h2 class="sy-title">Hotovo ✓</h2><p class="sy-text">Zařízení je propojené. Načítám tvoje profily…</p>');
    }
    el.innerHTML = html;
    el.classList.add("show");
    document.body.classList.add("mf-sync-open");
    var inp = document.getElementById("mfSyncInput");
    if (inp) {
      inp.addEventListener("input", function () {
        var v = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        inp.value = v.length > 3 ? v.slice(0, 3) + " " + v.slice(3) : v;
      });
      inp.dispatchEvent(new Event("input"));
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
    }
  }

  function msg(text, kind) {
    var m = document.getElementById("syMsg");
    if (!m) return;
    m.textContent = text || "";
    m.className = "sy-msg" + (kind ? " sy-" + kind : "");
  }

  function errText(e) {
    var c = e && e.code;
    if (c === "unknown") return "Kód neplatí nebo už vypršel. Na prvním zařízení vytvoř nový.";
    if (c === "toomany") return "Moc pokusů. Zkus to za 10 minut.";
    if (c === "unconfigured") return "Server zatím nemá propojení zapnuté (chybí úložiště KV).";
    if (c === "unavailable") return "Propojení není nastavené.";
    if (c === "network") return "Nepodařilo se spojit se serverem. Zkontroluj připojení k internetu.";
    return "Něco se nepovedlo. Zkus to prosím znovu.";
  }

  function showCode() {
    render("show");
    msg("Vytvářím kód…");
    window.MFSync.createCode().then(function (r) {
      var code = String(r.code || "");
      var c = document.getElementById("syCode");
      if (!c) return;
      c.textContent = code.slice(0, 3) + " " + code.slice(3);
      msg("");
      expiresAt = Date.now() + (r.ttl || 600) * 1000;
      var qr = document.getElementById("syQr");
      try {
        var url = location.origin + location.pathname + "?link=" + code;
        var q = window.qrcode(0, "M");
        q.addData(url); q.make();
        qr.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      } catch (e) { if (qr) qr.style.display = "none"; }
      var timer = document.getElementById("syTimer");
      var upd = function () {
        var left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
        if (timer) timer.textContent = left > 0 ? "Kód platí ještě " + Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") : "Kód vypršel – vytvoř nový.";
        if (!left) stopTick();
      };
      upd(); tick = setInterval(upd, 1000);
    }, function (e) { msg(errText(e), "err"); var c = document.getElementById("syCode"); if (c) c.textContent = "–"; });
  }

  function doJoin() {
    var inp = document.getElementById("mfSyncInput");
    var code = inp ? inp.value.replace(/[^A-Za-z0-9]/g, "") : "";
    if (code.length !== 6) { msg("Kód má 6 znaků.", "err"); return; }
    var btn = document.getElementById("syJoin");
    if (btn) { btn.disabled = true; btn.textContent = "Připojuji…"; }
    msg("");
    window.MFSync.join(code).then(function () {
      render("done");
      setTimeout(function () { location.reload(); }, 1200);
    }, function (e) {
      if (btn) { btn.disabled = false; btn.textContent = "Připojit"; }
      msg(errText(e), "err");
    });
  }

  function act(a) {
    var S = window.MFSync;
    if (a === "close") return close();
    if (a === "home") return render("home");
    if (a === "show") return showCode();
    if (a === "enter") return render("enter");
    if (a === "join") return doJoin();
    if (a === "sync") {
      msg("Synchronizuji…");
      return S.syncNow({ reload: false }).then(function (r) {
        if (r.changed) { msg("Hotovo, načítám změny…", "ok"); setTimeout(function () { location.reload(); }, 800); }
        else { msg("Vše je aktuální ✓", "ok"); var l = document.getElementById("syLast"); if (l) l.textContent = ago(S.lastSync()); }
      }, function (e) { msg(errText(e), "err"); });
    }
    if (a === "unlink") {
      if (!window.confirm("Odpojit toto zařízení? Data zůstanou tady i na ostatních zařízeních, jen se přestanou sdílet.")) return;
      S.unlink();
      return render("home");
    }
  }

  function open(screen, data) {
    render(screen || "home", data);
  }

  function close() {
    stopTick();
    if (el) el.classList.remove("show");
    document.body.classList.remove("mf-sync-open");
    var cb = onCloseCb; onCloseCb = null;
    if (cb) try { cb(); } catch (e) {}
  }

  window.MFSyncUI = { open: open, close: close, onClose: function (f) { onCloseCb = f; } };

  // Odkaz z QR kódu: ?link=ABC123 otevře zadání kódu
  window.addEventListener("DOMContentLoaded", function () {
    var code = "";
    try { code = new URLSearchParams(location.search).get("link") || ""; } catch (e) {}
    if (!code) return;
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    if (!window.MFSync || !window.MFSync.available()) return;
    if (window.MFSync.isLinked()) { if (typeof showToast === "function") showToast("Toto zařízení už je propojené", 2500); return; }
    setTimeout(function () { open("enter", { code: code }); }, 400);
  });
})();
