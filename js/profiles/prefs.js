/* MůjFlix — „Zaměření a žánry“ (MFPrefs): přepínač Všechno / Jen anime a oblíbené žánry aktivního profilu.
   Otevírá se z menu profilu (avatar vpravo nahoře). Ukládá do profilu: prefs.animeOnly, prefs.likesAnime, likedGenres. */
(function () {
  "use strict";
  var el = null, state = null;
  var MAX_GENRES = 5;
  var GENRES = [
    ["28", "Akce"], ["12", "Dobrodružný"], ["35", "Komedie"], ["18", "Drama"], ["80", "Krimi"], ["9648", "Mysteriózní"],
    ["878", "Sci-Fi"], ["14", "Fantasy"], ["27", "Horor"], ["53", "Thriller"], ["10749", "Romantika"], ["16", "Animované"],
    ["10751", "Rodinný"], ["99", "Dokument"], ["36", "Historický"], ["10752", "Válečný"], ["37", "Western"], ["10402", "Hudební"]
  ];

  function profile() { try { return typeof getActiveProfile === "function" ? getActiveProfile() : null; } catch (e) { return null; } }

  function ensure() {
    if (el) return el;
    el = document.createElement("div");
    el.id = "mfPrefsModal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Zaměření a žánry");
    el.addEventListener("click", function (e) {
      if (e.target === el) return close();
      var b = e.target.closest && e.target.closest("[data-pf]");
      if (!b) return;
      var a = b.getAttribute("data-pf");
      if (a === "close") close();
      else if (a === "save") save();
      else if (a === "mode") { state.only = b.getAttribute("data-v") === "only"; render(); }
      else if (a === "genre") toggleGenre(b.getAttribute("data-v"));
    });
    el.addEventListener("change", function (e) {
      if (e.target && e.target.id === "mfPrefsMix") { state.mix = !!e.target.checked; }
    });
    el.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.body.appendChild(el);
    return el;
  }

  function toggleGenre(id) {
    var i = state.genres.indexOf(id);
    if (i > -1) state.genres.splice(i, 1);
    else if (state.genres.length < MAX_GENRES) state.genres.push(id);
    else { msg("Vyber nejvýš " + MAX_GENRES + " žánrů.", true); return; }
    render();
  }

  function msg(t, err) {
    var m = el && el.querySelector(".pf-msg");
    if (m) { m.textContent = t || ""; m.className = "pf-msg" + (err ? " pf-err" : ""); }
  }

  function render() {
    ensure();
    var chips = GENRES.map(function (g) {
      var on = state.genres.indexOf(g[0]) > -1;
      return '<button type="button" class="pf-chip' + (on ? " pf-on" : "") + '" data-pf="genre" data-v="' + g[0] + '" aria-pressed="' + on + '">' + g[1] + "</button>";
    }).join("");
    el.innerHTML =
      '<div class="pf-box">' +
        '<button type="button" class="pf-x" data-pf="close" aria-label="Zavřít">×</button>' +
        '<div class="pf-title">Zaměření a žánry</div>' +
        '<div class="pf-text">Nastavení platí pro profil <b>' + esc(state.name) + "</b>. Změníš ho kdykoliv.</div>" +
        '<div class="pf-label">Co chceš vidět</div>' +
        '<div class="pf-seg" role="group" aria-label="Co chceš vidět">' +
          '<button type="button" class="pf-segbtn' + (!state.only ? " pf-on" : "") + '" data-pf="mode" data-v="all" aria-pressed="' + !state.only + '">Všechno</button>' +
          '<button type="button" class="pf-segbtn' + (state.only ? " pf-on" : "") + '" data-pf="mode" data-v="only" aria-pressed="' + state.only + '">Jen anime</button>' +
        "</div>" +
        (state.only
          ? '<div class="pf-note">Doporučení, Objevovat i hledání ukážou jen anime. Žánry níže zůstanou uložené a použijí se po přepnutí zpět na „Všechno“.</div>'
          : '<label class="pf-mix"><input type="checkbox" id="mfPrefsMix"' + (state.mix ? " checked" : "") + '><span>Přimíchávat anime do doporučení</span></label>') +
        '<div class="pf-label">Oblíbené žánry <span class="pf-count">' + state.genres.length + "/" + MAX_GENRES + "</span></div>" +
        '<div class="pf-chips' + (state.only ? " pf-dim" : "") + '">' + chips + "</div>" +
        '<div class="pf-msg" role="status"></div>' +
        '<button type="button" class="pf-save" data-pf="save">Uložit</button>' +
        '<button type="button" class="pf-cancel" data-pf="close">Zrušit</button>' +
      "</div>";
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function open() {
    var p = profile();
    if (!p) return;
    var anime = !!(window.mfOnlyAnime && window.mfOnlyAnime());
    state = {
      id: p.id,
      name: p.name || "Profil",
      only: anime,
      mix: !!(p.prefs && p.prefs.likesAnime),
      genres: (p.likedGenres || []).map(String).filter(function (g) { return GENRES.some(function (x) { return x[0] === g; }); }).slice(0, MAX_GENRES)
    };
    render();
    el.classList.add("show");
    var f = el.querySelector(".pf-segbtn.pf-on"); if (f) f.focus();
  }

  function close() { if (el) el.classList.remove("show"); }

  function save() {
    var all = _getProfiles(), p = all.find(function (x) { return x.id === state.id; });
    if (!p) return close();
    var old = (p.likedGenres || []).map(String);
    p.likedGenres = state.genres.map(Number);
    p.prefs = Object.assign({}, p.prefs, { animeOnly: state.only, likesAnime: state.only ? true : state.mix });
    _saveProfiles(all);
    // nově přidané žánry se hned zohlední v učení doporučení
    try {
      if (window.aiBrain && getActiveProfileId() === state.id) state.genres.filter(function (g) { return old.indexOf(g) < 0; }).forEach(function (g) { aiBrain.boostGenreIds([Number(g)], 0.12); });
    } catch (e) { /* bez AI paměti */ }
    close();
    try { window.dispatchEvent(new Event("mf:profile-changed")); } catch (e) { /* nic */ }
    try { if (typeof showToast === "function") showToast(state.only ? "Zobrazuje se jen anime" : "Žánry a zaměření uloženy", 2200); } catch (e) { /* nic */ }
  }

  /* ── Nastavení (jedna položka v menu profilu, pod ní profil, zaměření, propojení a záloha) ─────────────────── */
  var hub = null;
  function hubClose() { if (hub) hub.classList.remove("show"); }
  function hubRows() {
    var p = profile() || {}, only = !!(window.mfOnlyAnime && window.mfOnlyAnime());
    var n = (p.likedGenres || []).length;
    var linked = !!(window.MFSync && window.MFSync.isLinked && window.MFSync.isLinked());
    var ic = function (d) { return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
    return [
      ["profile", ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'), "Upravit profil", (p.name || "Profil") + " · jméno, avatar, PIN"],
      ["prefs", ic('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'), "Zaměření a žánry", (only ? "Jen anime" : "Všechno") + " · " + (n ? n + " oblíbených žánrů" : "žánry nevybrány")],
      ["sync", ic('<rect x="2" y="5" width="13" height="10" rx="1.5"/><path d="M6 19h5M8.5 15v4"/><rect x="16" y="9" width="6" height="11" rx="1.5"/>'), "Propojení zařízení", linked ? "Propojeno" : "Zatím nepropojeno"],
      ["backup", ic('<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/>'), "Záloha dat", "Uložit do souboru nebo načíst ze zálohy"]
    ];
  }
  function hubOpen() {
    if (!hub) {
      hub = document.createElement("div");
      hub.id = "mfSettingsModal";
      hub.setAttribute("role", "dialog");
      hub.setAttribute("aria-modal", "true");
      hub.setAttribute("aria-label", "Nastavení");
      hub.addEventListener("click", function (e) {
        if (e.target === hub) return hubClose();
        var b = e.target.closest && e.target.closest("[data-st]");
        if (!b) return;
        var a = b.getAttribute("data-st");
        hubClose();
        if (a === "close") return;
        if (a === "profile") { var pr = profile(); if (pr && window.ProfileGate) ProfileGate.openCreate(pr.id); }
        else if (a === "prefs") open();
        else if (a === "sync" && window.MFSyncUI) MFSyncUI.open("home");
        else if (a === "backup" && window.MFSyncUI) MFSyncUI.open("backup");
      });
      hub.addEventListener("keydown", function (e) { if (e.key === "Escape") hubClose(); });
      document.body.appendChild(hub);
    }
    hub.innerHTML = '<div class="pf-box">' +
      '<button type="button" class="pf-x" data-st="close" aria-label="Zavřít">×</button>' +
      '<div class="pf-title">Nastavení</div>' +
      '<div class="pf-text">Profil <b>' + esc((profile() || {}).name || "") + "</b></div>" +
      '<div class="pf-rows">' + hubRows().map(function (r) {
        return '<button type="button" class="pf-row" data-st="' + r[0] + '"><span class="pf-row-ico">' + r[1] + '</span><span class="pf-row-txt"><strong>' + r[2] + "</strong><small>" + esc(r[3]) + '</small></span><span class="pf-row-go" aria-hidden="true">›</span></button>';
      }).join("") + "</div></div>";
    hub.classList.add("show");
    var f = hub.querySelector(".pf-row"); if (f) f.focus();
  }

  window.MFProfileSettings = { open: hubOpen, close: hubClose };

  window.MFPrefs = { open: open, close: close, _genres: GENRES };
})();
