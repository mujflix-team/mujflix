/* MůjFlix — propojení zařízení (MFSync).
 * Data (profily + osobní klíče v localStorage) se ukládají do Cloudflare Workeru (KV) pod náhodným ID.
 * Druhé zařízení získá ID jednorázovým 6znakovým kódem (nebo přes QR s odkazem ?link=KÓD).
 * Sloučení: u každého klíče vyhrává novější změna; profily se spojují podle ID (nic se nepřepisuje celé).
 * Tajné klíče (API klíče), aktivní profil a stav PIN zámku se nikdy nesynchronizují. */
(function () {
  "use strict";

  var ID_KEY = "mf_sync_id", META_KEY = "mf_sync_meta", LAST_KEY = "mf_sync_last";
  var PROFILES_KEY = "mf_profiles_v2";
  var MAX_VALUE = 1024 * 1024; // jednotlivý klíč nad 1 MB se nesynchronizuje
  // Zápisů do KV je na free tarifu 1000 denně. Důležité změny (profily, hodnocení, seznamy…) se posílají rychle,
  // časté drobnosti (průběh sledování, historie hledání, paměť AI…) až po delší době, a nikdy častěji než MIN_GAP.
  var FAST_DELAY = 6 * 1000, SLOW_DELAY = 3 * 60 * 1000, MIN_GAP = 10 * 1000, POLL_MS = 45 * 1000;
  var NOISY = /^mf_(watch_timeline|partial_watched|recent_views|search_history|cin_ai_stats|streak|ai_brain|cont_)/;
  var nativeSet = Storage.prototype.setItem;
  var nativeRemove = Storage.prototype.removeItem;
  var nativeGet = Storage.prototype.getItem;
  var applying = false;
  var pushTimer = null, pushDue = 0, lastPush = 0, busy = null;

  function now() { return Date.now(); }
  function get(k) { try { return nativeGet.call(localStorage, k); } catch (e) { return null; } }
  function set(k, v) { try { nativeSet.call(localStorage, k, v); } catch (e) {} }
  function del(k) { try { nativeRemove.call(localStorage, k); } catch (e) {} }

  function syncable(k) {
    if (typeof k !== "string" || k.indexOf("mf_") !== 0) return false;
    if (k === "mf_active_pid" || k === "mf_pin_lock" || k.indexOf("mf_sync_") === 0) return false;
    if (/(^|_)(key|token)(_|$)/.test(k)) return false; // API klíče a tokeny
    if (k.indexOf("mf_jw_") === 0) return false; // cache
    return true;
  }

  function loadMeta() {
    try {
      var m = JSON.parse(get(META_KEY) || "{}");
      return { t: m.t || {}, g: m.g || {}, d: m.d || {} };
    } catch (e) { return { t: {}, g: {}, d: {} }; }
  }
  function saveMeta(m) { set(META_KEY, JSON.stringify(m)); }

  function base() { return String(window.TMDB_PROXY_URL || "").replace(/\/+$/, ""); }
  function available() { return !!base(); }
  function syncId() { return get(ID_KEY) || ""; }
  function isLinked() { return !!syncId(); }

  function randomId() {
    var b = new Uint8Array(24);
    crypto.getRandomValues(b);
    var s = "";
    for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function api(path, body) {
    if (!available()) return Promise.reject(Object.assign(new Error("unavailable"), { code: "unavailable" }));
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var to = ctrl && setTimeout(function () { ctrl.abort(); }, 15000);
    return fetch(base() + path, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw Object.assign(new Error(j.error || "http " + r.status), { code: r.status === 501 ? "unconfigured" : r.status === 404 ? "unknown" : r.status === 429 ? "toomany" : "http", status: r.status });
        return j;
      });
    }, function () {
      throw Object.assign(new Error("network"), { code: "network" });
    }).then(function (j) { if (to) clearTimeout(to); return j; }, function (e) { if (to) clearTimeout(to); throw e; });
  }

  /* ── Sledování změn: každý zápis do syncovatelného klíče dostane časové razítko ─────────── */
  function touch(k, removed) {
    if (applying || !isLinked() || !syncable(k)) return;
    var m = loadMeta(), t = now();
    if (removed) { m.g[k] = t; delete m.t[k]; } else { m.t[k] = t; delete m.g[k]; }
    if (k === PROFILES_KEY) trackDeletedProfiles(m);
    saveMeta(m);
    schedulePush(NOISY.test(k) ? SLOW_DELAY : FAST_DELAY);
  }
  var lastProfileIds = null;
  function profileIds(raw) {
    try {
      var v = JSON.parse(raw || "[]");
      if (Array.isArray(v)) return v.filter(function (p) { return p && p.id; }).map(function (p) { return p.id; });
      return Object.keys(v || {});
    } catch (e) { return []; }
  }
  function trackDeletedProfiles(m) {
    var cur = profileIds(get(PROFILES_KEY));
    (lastProfileIds || []).forEach(function (id) { if (cur.indexOf(id) < 0) m.d[id] = now(); });
    cur.forEach(function (id) { delete m.d[id]; });
    lastProfileIds = cur;
  }

  Storage.prototype.setItem = function (k, v) {
    if (this === localStorage && !applying && syncable(k)) {
      var same = false;
      try { same = nativeGet.call(this, k) === String(v); } catch (e) {}
      nativeSet.call(this, k, v);
      if (!same) touch(k, false);
      return;
    }
    return nativeSet.call(this, k, v);
  };
  Storage.prototype.removeItem = function (k) {
    if (this === localStorage && !applying && syncable(k)) {
      var had = nativeGet.call(this, k) !== null;
      nativeRemove.call(this, k);
      if (had) touch(k, true);
      return;
    }
    return nativeRemove.call(this, k);
  };

  function schedulePush(delay) {
    if (!isLinked()) return;
    var due = Math.max(now() + delay, lastPush + MIN_GAP);
    if (pushTimer) {
      if (due >= pushDue) return; // už je naplánováno dřív
      clearTimeout(pushTimer);
    }
    pushDue = due;
    pushTimer = setTimeout(function () { pushTimer = null; run(false).catch(function () {}); }, Math.max(1000, due - now()));
  }

  /* ── Sloučení ──────────────────────────────────────────────────────────────────────────────── */
  function localKeys() {
    var out = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (syncable(k)) out.push(k); } } catch (e) {}
    return out;
  }

  function mergeProfiles(localRaw, remoteRaw, preferRemote, tomb) {
    function arr(raw) { try { var v = JSON.parse(raw || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
    var a = arr(localRaw), b = arr(remoteRaw), byId = {}, order = [];
    function add(list, winner) {
      list.forEach(function (p) {
        if (!p || !p.id) return;
        if (tomb[p.id] && tomb[p.id] > (p.created || 0)) return;
        if (!byId[p.id]) order.push(p.id);
        if (!byId[p.id] || winner) byId[p.id] = p;
      });
    }
    if (preferRemote) { add(a, false); add(b, true); } else { add(b, false); add(a, true); }
    return JSON.stringify(order.map(function (id) { return byId[id]; }));
  }

  /** Jedno kolo: stáhne, sloučí, (volitelně) uplatní cizí změny lokálně a pošle zpět. apply=false = jen odeslat vlastní změny. */
  function run(apply) {
    if (busy) return busy;
    if (!isLinked()) return Promise.resolve({ changed: false });
    busy = api("/sync/pull", { id: syncId() }).then(function (res) {
      var remote = res && res.data && res.data.keys ? res.data : { keys: {}, del: {} };
      var meta = loadMeta(), blob = { v: 1, keys: {}, del: Object.assign({}, remote.del || {}) };
      Object.keys(meta.d).forEach(function (id) { if (!blob.del[id] || blob.del[id] < meta.d[id]) blob.del[id] = meta.d[id]; });
      Object.keys(blob.del).forEach(function (id) { if (!(meta.d[id] > blob.del[id])) meta.d[id] = blob.del[id]; });
      Object.keys(remote.keys).forEach(function (k) { blob.keys[k] = remote.keys[k]; });
      var changed = false, changedKeys = [], keys = localKeys(), seen = {};
      if (apply) applying = true;
      try {
        keys.forEach(function (k) {
          seen[k] = 1;
          var v = get(k);
          if (v === null || v.length > MAX_VALUE) return;
          var lt = meta.t[k] || 1, r = remote.keys[k], rt = r ? r.t || 0 : -1;
          if (k === PROFILES_KEY) return; // řeší se zvlášť níže
          if (rt < 0 || lt > rt) { blob.keys[k] = { v: v, t: lt }; }
          else if (r && rt > lt && apply) {
            if (r.v === null) { del(k); } else if (r.v !== v) { set(k, r.v); changed = true; changedKeys.push(k); }
            meta.t[k] = rt;
            if (r.v === null) { delete meta.t[k]; changed = true; changedKeys.push(k); }
          }
        });
        // tombstony lokálních smazání
        Object.keys(meta.g).forEach(function (k) {
          var r = remote.keys[k];
          if (!r || meta.g[k] > (r.t || 0)) blob.keys[k] = { v: null, t: meta.g[k] };
        });
        // klíče, které existují jen na serveru
        if (apply) Object.keys(remote.keys).forEach(function (k) {
          if (seen[k] || k === PROFILES_KEY || !syncable(k)) return;
          var r = remote.keys[k];
          if (r.v === null || meta.g[k] >= (r.t || 0)) return;
          set(k, r.v); meta.t[k] = r.t || 1; changed = true; changedKeys.push(k);
        });
        // profily: spojení podle ID
        var lRaw = get(PROFILES_KEY), rRaw = remote.keys[PROFILES_KEY] ? remote.keys[PROFILES_KEY].v : null;
        var lt2 = meta.t[PROFILES_KEY] || 1, rt2 = remote.keys[PROFILES_KEY] ? remote.keys[PROFILES_KEY].t || 0 : 0;
        var merged = mergeProfiles(lRaw, rRaw, rt2 > lt2, blob.del);
        if (merged !== rRaw) blob.keys[PROFILES_KEY] = { v: merged, t: merged === lRaw ? lt2 : Math.max(now(), lt2, rt2 + 1) };
        if (merged !== lRaw && apply) {
          set(PROFILES_KEY, merged); changed = true; changedKeys.push(PROFILES_KEY);
          meta.t[PROFILES_KEY] = blob.keys[PROFILES_KEY] ? blob.keys[PROFILES_KEY].t : rt2;
        }
        lastProfileIds = profileIds(get(PROFILES_KEY));
      } finally { applying = false; }
      saveMeta(meta);
      var needPush = JSON.stringify(blob) !== JSON.stringify({ v: remote.v || 1, keys: remote.keys, del: remote.del || {} });
      var done = function () {
        lastPush = now();
        set(LAST_KEY, String(now()));
        return { changed: changed, keys: changedKeys };
      };
      return needPush ? api("/sync/push", { id: syncId(), data: blob }).then(done) : Promise.resolve(done());
    }).then(function (r) { busy = null; return r; }, function (e) { busy = null; throw e; });
    return busy;
  }

  /* ── Veřejné API ───────────────────────────────────────────────────────────────────────────── */
  function stamp(t) {
    var m = loadMeta();
    localKeys().forEach(function (k) { if (!m.t[k]) m.t[k] = t; });
    saveMeta(m);
  }

  /** První zařízení: vytvoří ID, nahraje data a vrátí jednorázový kód. */
  function createCode() {
    if (!isLinked()) { set(ID_KEY, randomId()); stamp(now()); }
    lastProfileIds = profileIds(get(PROFILES_KEY));
    return run(false).then(function () { return api("/sync/code", { id: syncId() }); });
  }

  /** Druhé zařízení: vymění kód za ID a stáhne data (vlastní dosavadní data se spojí, cizí mají přednost). */
  function join(code) {
    return api("/sync/join", { code: String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "") }).then(function (r) {
      set(ID_KEY, r.id);
      stamp(1);
      lastProfileIds = profileIds(get(PROFILES_KEY));
      return run(true);
    });
  }

  function unlink() {
    del(ID_KEY); del(META_KEY); del(LAST_KEY);
    if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
  }

  function cinemaOpen() {
    var c = document.getElementById("mfStandaloneCinema");
    return !!(c && c.classList.contains("open")) || !!document.querySelector(".mf-cin-modal.open");
  }

  function banner() {
    if (document.getElementById("mfSyncBanner")) return;
    var b = document.createElement("div");
    b.id = "mfSyncBanner";
    b.innerHTML = '<span>Na jiném zařízení se něco změnilo.</span><button type="button">Načíst změny</button>';
    b.querySelector("button").onclick = function () { location.reload(); };
    document.body.appendChild(b);
  }

  function activeProfileGone() {
    try {
      var id = get("mf_active_pid");
      return !!id && profileIds(get(PROFILES_KEY)).indexOf(id) < 0;
    } catch (e) { return false; }
  }

  /** Po uplatnění cizích změn: jen nový/odebraný profil = překreslí se seznamy bez načtení; ostatní změny stránku obnoví
   *  (při startu hned, při průběžné kontrole jen nabídkou „Načíst změny“, ať to člověka neruší). */
  function afterApply(r, mode) {
    if (!r || !r.changed) return r;
    var keys = r.keys || [], onlyProfiles = keys.every(function (k) { return k === PROFILES_KEY; });
    if (onlyProfiles && !activeProfileGone()) {
      try { window.dispatchEvent(new Event("mf:sync-applied")); } catch (e) {}
      try { if (window.ProfileGate) ProfileGate.renderGate(); } catch (e) {}
      try { if (window.nfRenderProfile) nfRenderProfile(); } catch (e) {}
      return r;
    }
    // pojistka proti nekonečnému obnovování: když se stránka před chvílí kvůli synchronizaci už obnovila, jen nabídni tlačítko
    var lastReload = 0;
    try { lastReload = parseInt(sessionStorage.getItem("mf_sync_reloaded") || "0", 10) || 0; } catch (e) {}
    if (mode === "poll" || now() - lastReload < 15000) { banner(); return r; }
    try { sessionStorage.setItem("mf_sync_reloaded", String(now())); } catch (e) {}
    if (typeof showToast === "function") showToast("Načtena data z jiného zařízení", 1800);
    setTimeout(function () { location.reload(); }, 900);
    return r;
  }

  /** Synchronizace s uplatněním cizích změn. opts.reload === false = jen vrátí výsledek (ruční tlačítko si to řeší samo). */
  function syncNow(opts) {
    opts = opts || {};
    return run(true).then(function (r) { return opts.reload === false ? r : afterApply(r, opts.mode); });
  }

  function poll() {
    if (!isLinked() || !available() || document.visibilityState !== "visible" || cinemaOpen() || busy) return;
    syncNow({ mode: "poll" }).catch(function () {});
  }

  var hiddenAt = 0;
  document.addEventListener("visibilitychange", function () {
    if (!isLinked()) return;
    if (document.visibilityState === "hidden") {
      hiddenAt = now();
      if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; run(false).catch(function () {}); }
    } else if (hiddenAt && now() - hiddenAt > 20 * 1000 && !cinemaOpen()) {
      syncNow({ mode: "poll" }).catch(function () {});
    }
  });
  window.addEventListener("online", function () { poll(); });

  window.addEventListener("DOMContentLoaded", function () {
    lastProfileIds = profileIds(get(PROFILES_KEY));
    if (!isLinked() || !available()) return;
    setTimeout(function () { syncNow().catch(function () {}); }, 1200);
    setInterval(poll, POLL_MS);
  });

  window.MFSync = {
    available: available,
    isLinked: isLinked,
    createCode: createCode,
    join: join,
    unlink: unlink,
    syncNow: syncNow,
    _poll: poll,
    lastSync: function () { return parseInt(get(LAST_KEY) || "0", 10) || 0; },
    _syncable: syncable,
    _mergeProfiles: mergeProfiles
  };
})();
