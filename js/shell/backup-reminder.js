/* Připomenutí zálohy: data jsou jen v tomto prohlížeči (smazání dat prohlížeče = ztráta profilů a seznamů).
   Jednou za 30 dní, když zařízení není propojené a jsou tu nějaká data, se dole ukáže nenápadná lišta
   „Stáhnout zálohu“ (otevře obrazovku Záloha dat). „✕“ ji odloží na 14 dní, „Zálohovat“ na 7 dní.
   Klíče mf_backup_* jsou jen pro toto zařízení (nesynchronizují se ani se nezálohují). */
(function () {
  "use strict";
  var DAY = 864e5, EVERY = 30 * DAY, FIRST = "mf_backup_first", LAST = "mf_backup_last", SNOOZE = "mf_backup_snooze";

  function num(k) { try { return Number(localStorage.getItem(k)) || 0; } catch (e) { return 0; } }
  function put(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* bez úložiště nic neukládáme */ } }

  /** Je v úložišti něco, co by byla škoda ztratit (sledované, seznam, hodnocení)? */
  function hasData() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^mf_(watched|watchlist|ratings)/.test(k || "") && (localStorage.getItem(k) || "").length > 4) return true;
      }
    } catch (e) { /* nic */ }
    return false;
  }

  function busy() {
    var gate = document.getElementById("mfProfileGate");
    if (gate && gate.style.display !== "none" && getComputedStyle(gate).display !== "none") return true;
    return !!document.querySelector("#mfProfileWelcome.show, #mfSyncModal.show, #seriesModal.open, #mfStandaloneCinema.open, #mfUpdateBar, #mfBackupBar");
  }

  function show() {
    var b = document.createElement("div");
    b.id = "mfBackupBar"; b.setAttribute("role", "status");
    var t = document.createElement("span"); t.textContent = "Data máš jen v tomto prohlížeči. Stáhni si zálohu.";
    var go = document.createElement("button"); go.type = "button"; go.className = "mf-upd-go"; go.textContent = "Zálohovat";
    go.onclick = function () { put(SNOOZE, Date.now() + 7 * DAY); b.remove(); if (window.MFSyncUI) window.MFSyncUI.open("backup"); };
    var x = document.createElement("button"); x.type = "button"; x.className = "mf-upd-x"; x.setAttribute("aria-label", "Později"); x.textContent = "✕";
    x.onclick = function () { put(SNOOZE, Date.now() + 14 * DAY); b.remove(); };
    b.appendChild(t); b.appendChild(go); b.appendChild(x);
    document.body.appendChild(b);
  }

  /** force = ignoruj „zaneprázdněno“ (test). Vrátí true, když se lišta ukázala. */
  function check(force) {
    if (document.getElementById("mfBackupBar")) return false;
    if (window.MFSync && window.MFSync.isLinked && window.MFSync.isLinked()) return false;
    if (!hasData()) return false;
    var now = Date.now();
    if (!num(FIRST)) put(FIRST, now); // odpočet začíná, až tu data poprvé jsou
    var since = num(LAST) || num(FIRST);
    if (now - since < EVERY || now < num(SNOOZE)) return false;
    if (!force && busy()) return false;
    show();
    return true;
  }

  window.mfBackupReminder = { check: check, noteBackup: function () { put(LAST, Date.now()); } };
  setTimeout(function () { check(false); }, 20000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) check(false); });
})();
