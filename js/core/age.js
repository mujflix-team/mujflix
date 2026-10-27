/* MůjFlix — věkové omezení profilu (MFAge).
   Profil má prefs.maxAge: 0/chybí = bez omezení, jinak 7, 12 nebo 15. Hodnocení bere z TMDB (americká škála:
   filmy G / PG / PG-13 / R, seriály TV-Y / TV-G / TV-Y7 / TV-PG / TV-14 / TV-MA), protože české TMDB skoro nemá.
   Filtruje doporučení, Objevovat, hledání a novinky. Titul bez nalezeného hodnocení se u omezeného profilu skryje.
   Cache hodnocení je jen na tomto zařízení (mfx_age_cache). Není to zámek: věk jde změnit v Nastavení (u profilu s PINem jen s PINem). */
(function () {
  "use strict";
  var KEY = "mfx_age_cache", TTL = 60 * 24 * 3600 * 1000, MAX = 2000, POOL = 6;
  var LEVELS = [0, 7, 12, 15];
  var MOVIE = { 7: ["G"], 12: ["G", "PG"], 15: ["G", "PG", "PG-13"] };
  var TV = { 7: ["TV-Y", "TV-G", "TV-Y7"], 12: ["TV-Y", "TV-G", "TV-Y7", "TV-PG"], 15: ["TV-Y", "TV-G", "TV-Y7", "TV-PG", "TV-14"] };
  var inflight = {}, active = 0, waiting = [], MAXREQ = 8;
  function slot(fn) {
    return new Promise(function (res) {
      var run = function () { active++; fn().then(function (v) { active--; res(v); next(); }, function () { active--; res(null); next(); }); };
      function next() { if (waiting.length && active < MAXREQ) waiting.shift()(); }
      if (active < MAXREQ) run(); else waiting.push(run);
    });
  }
  var stats = { ok: 0, fail: 0 };

  function limit() {
    try {
      var p = typeof getActiveProfile === "function" ? getActiveProfile() : null;
      var v = p && p.prefs ? Number(p.prefs.maxAge) : 0;
      return LEVELS.indexOf(v) > 0 ? v : 0;
    } catch (e) { return 0; }
  }
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } }
  function save(o) {
    try {
      var k = Object.keys(o);
      if (k.length > MAX) k.sort(function (a, b) { return (o[a].t || 0) - (o[b].t || 0); }).slice(0, k.length - MAX).forEach(function (x) { delete o[x]; });
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) { /* plné úložiště: jen se nebude ukládat */ }
  }
  function norm(c) { return String(c || "").toUpperCase().replace(/\s+/g, "").replace(/^(TV-Y7)-FV$/, "$1"); }

  function certOf(type, d) {
    if (!d || typeof d !== "object") return null;
    var list = type === "tv" ? ((d.content_ratings || {}).results || []) : ((d.release_dates || {}).results || []);
    var us = list.filter(function (x) { return x && x.iso_3166_1 === "US"; })[0];
    if (!us) return "";
    if (type === "tv") return norm(us.rating);
    var rd = (us.release_dates || []).map(function (r) { return norm(r && r.certification); }).filter(Boolean);
    return rd[0] || "";
  }

  /** Hodnocení titulu: "PG-13", "" (TMDB žádné nemá) nebo null (nepodařilo se zjistit). */
  function rating(type, id) {
    var k = type + ":" + id, c = load()[k];
    if (c && Date.now() - (c.t || 0) < TTL) return Promise.resolve(c.c);
    if (inflight[k]) return inflight[k];
    var path = "/" + type + "/" + id + "?language=en-US&append_to_response=" + (type === "tv" ? "content_ratings" : "release_dates");
    var once = function () { return slot(function () { return typeof tmdbGet === "function" ? tmdbGet(path) : Promise.resolve(null); }); };
    var pr = once().then(function (d) { return d ? d : new Promise(function (r) { setTimeout(r, 500); }).then(once); }).then(function (d) {
      var cert = d ? certOf(type, d) : null;
      if (cert === null) stats.fail++; else stats.ok++;
      if (cert !== null) { var all = load(); all[k] = { c: cert, t: Date.now() }; save(all); }
      return cert;
    }).catch(function () { return null; }).then(function (r) { delete inflight[k]; return r; });
    inflight[k] = pr;
    return pr;
  }

  function allowed(type, cert, lim) {
    var set = (type === "tv" ? TV : MOVIE)[lim] || [];
    return set.indexOf(cert) > -1;
  }

  /** items: [{id|tmdbId, type|mediaType}]. Bez omezení vrátí totéž hned; jinak jen povolené (hodnocení se dohledá a zapamatuje). */
  function filter(items, want) {
    var lim = limit();
    if (!lim || !Array.isArray(items) || !items.length) return Promise.resolve(items);
    var out = new Array(items.length), idx = 0, found = 0;
    function worker() {
      if (idx >= items.length || (want && found >= want)) return Promise.resolve();
      var i = idx++, it = items[i] || {};
      var type = it.mediaType || it.type, id = it.tmdbId || it.id;
      if ((type !== "movie" && type !== "tv") || !id) { out[i] = false; return worker(); }
      return rating(type, id).then(function (c) { out[i] = c !== null && allowed(type, c, lim); if (out[i]) found++; return worker(); });
    }
    var n = Math.min(POOL, items.length), ws = [];
    for (var j = 0; j < n; j++) ws.push(worker());
    return Promise.all(ws).then(function () { var r = items.filter(function (_, k) { return out[k]; }); return want ? r.slice(0, want) : r; });
  }

  /** Omezený profil: seznamy z TMDB (trending, discover, top rated…) mají jen 20 titulů a po odfiltrování by jich zbylo pár.
      Proto se u nich dotáhnou další 2 stránky a výsledky se spojí. get(path) vrací Promise s {results:[…]}. */
  /** Pro omezený profil se obecné seznamy nahradí dotazem, který TMDB filtruje rovnou (filmy podle hodnocení, seriály podle rodinných žánrů). */
  var FAM = { 7: "10762|10751|16", 12: "10762|10751|16|10759|10765|35" };
  function rewrite(path) {
    var lim = limit();
    if (!lim || typeof path !== "string") return path;
    var i = path.indexOf("?"), p = i < 0 ? path : path.slice(0, i), q = i < 0 ? "" : path.slice(i + 1);
    var join = function (base, extra) { return base + (q || extra ? "?" : "") + [extra, q].filter(Boolean).join("&"); };
    if (p === "/movie/popular") { p = "/discover/movie"; q = "sort_by=popularity.desc&vote_count.gte=100" + (q ? "&" + q : ""); }
    else if (p === "/movie/top_rated") { p = "/discover/movie"; q = "sort_by=vote_average.desc&vote_count.gte=300" + (q ? "&" + q : ""); }
    else if (p === "/tv/popular") { p = "/discover/tv"; q = "sort_by=popularity.desc&vote_count.gte=50" + (q ? "&" + q : ""); }
    else if (p === "/tv/top_rated") { p = "/discover/tv"; q = "sort_by=vote_average.desc&vote_count.gte=200" + (q ? "&" + q : ""); }
    if (p === "/discover/movie" && q.indexOf("certification") < 0) q += (q ? "" : "") + certQuery();
    if (p === "/discover/tv" && FAM[lim] && q.indexOf("with_genres") < 0) q += (q ? "&" : "") + "with_genres=" + encodeURIComponent(FAM[lim]);
    q = q.replace(/^&/, "");
    return p + (q ? "?" + q : "");
  }

  function wide(path, get) {
    if (limit() && !/^\/(movie|tv)\/\d+/.test(String(path))) path = rewrite(path);
    if (!limit() || /^\/(movie|tv)\/\d+/.test(String(path).replace(/^https?:\/\/[^/]+(\/3)?/, "")) || /[?&]page=/.test(path)) return get(path);
    var sep = String(path).indexOf("?") < 0 ? "?" : "&";
    var pages = /with_genres=/.test(path) ? [2, 3, 4, 5] : [2, 3];
    return Promise.all([get(path)].concat(pages.map(function (n) { return get(path + sep + "page=" + n); }))).then(function (r) {
      var first = r[0];
      if (!first || !Array.isArray(first.results)) return first;
      var seen = {}, all = [];
      r.forEach(function (d) { ((d && d.results) || []).forEach(function (x) { var k = (x && x.media_type || "") + ":" + (x && x.id); if (!seen[k]) { seen[k] = 1; all.push(x); } }); });
      return Object.assign({}, first, { results: all });
    });
  }

  /** Filmy: TMDB umí filtrovat podle hodnocení rovnou (discover), tak se použije místo dohledávání po jednom. */
  function certQuery() {
    var l = limit(), c = { 7: "G", 12: "PG", 15: "PG-13" }[l];
    return c ? "&certification_country=US&certification.lte=" + c : "";
  }

  window.MFAge = { wide: wide, rewrite: rewrite, certQuery: certQuery, stats: stats, limit: limit, filter: filter, levels: LEVELS, _rating: rating, _allowed: allowed, _certOf: certOf };
})();
