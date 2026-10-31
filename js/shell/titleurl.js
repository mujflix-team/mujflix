/* Čisté adresy titulů, bez čísla:
   /s/<nazev>            detail seriálu
   /f/<nazev>            film v přehrávači
   /c/<nazev>[-s01e02]   přehrávač (seriál od dané epizody, výchozí 1. díl)
   Adresa se vždy odvozuje ze stavu (co je právě otevřené), takže sedí i po tlačítku Zpět.
   Při načtení odkazu se titul dohledá přes TMDB hledání a otevře. */
(function () {
  "use strict";

  function slugify(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  window.mfSlugify = slugify;
  function p2(n) { return (n < 10 ? "0" : "") + n; }

  var lastSeries = "";   /* název naposledy otevřeného seriálu (detail) */
  function wanted() {
    var P = window.MFCinemaPlayer, st = P && P.state && P.state();
    if (st) {
      var sl = slugify(st.title);
      if (!sl) return "/";
      if (st.type === "movie") return "/f/" + sl;
      return "/c/" + sl + "-s" + p2(st.season) + "e" + p2(st.episode);
    }
    var m = document.getElementById("seriesModal");
    if (m && m.classList.contains("visible") && lastSeries) return "/s/" + slugify(lastSeries);
    return "/";
  }
  function sync() {
    var w = wanted(), cur = location.pathname;
    if (w === cur || (w === "/" && cur === "/index.html")) return;
    /* cizí cesty (např. /soukromi.html) nepřepisujeme */
    if (cur !== "/" && cur !== "/index.html" && !/^\/[sfc]\//.test(cur)) return;
    try { history.replaceState(history.state, "", w); } catch (e) {}
  }
  window.mfUrlSync = sync;
  function later() { setTimeout(sync, 0); setTimeout(sync, 120); setTimeout(sync, 800); }

  function wrap(name, fn) {
    var orig = window[name];
    if (typeof orig !== "function" || orig._tu) return;
    var w = fn(orig); w._tu = 1; window[name] = w;
  }

  function hook() {
    wrap("openSeries", function (orig) {
      return function (slug) {
        var r = orig.apply(this, arguments);
        try { if (typeof db !== "undefined" && db[slug]) lastSeries = db[slug].name || db[slug].title || ""; } catch (e) {}
        later();
        return r;
      };
    });
    wrap("openDiscoverTv", function (orig) {
      return function (id, title) {
        lastSeries = title || "";
        var r = orig.apply(this, arguments);
        later();
        return r;
      };
    });
    wrap("closeModal", function (orig) {
      return function () { var r = orig.apply(this, arguments); later(); return r; };
    });
    var P = window.MFCinemaPlayer;
    if (P && !P._tu) {
      var o = P.open, c = P.close;
      P.open = function () { var r = o.apply(this, arguments); later(); return r; };
      P.close = function () { var r = c.apply(this, arguments); later(); return r; };
      P._tu = 1;
    }
    window.addEventListener("popstate", later);
  }

  function parsePath(p) {
    var m = /^\/([sfc])\/([^\/?#]+)/.exec(p || "");
    if (!m) return null;
    var q; try { q = decodeURIComponent(m[2]); } catch (e) { q = m[2]; }
    var se = 1, ep = 1, sl = slugify(q), em = /-s(\d{1,2})e(\d{1,3})$/.exec(sl);
    if (em) { se = +em[1]; ep = +em[2]; sl = sl.slice(0, em.index); }
    return { kind: m[1], slug: sl, season: se || 1, episode: ep || 1 };
  }

  async function openTitleFromPath(p) {
    var r = parsePath(p);
    if (!r || !r.slug || typeof tmdbGet !== "function") return false;
    var type = r.kind === "s" ? "tv" : r.kind === "f" ? "movie" : "multi";
    var q = encodeURIComponent(r.slug.replace(/-/g, " "));
    var d = null;
    try { d = await tmdbGet("/search/" + type + "?language=cs&query=" + q); } catch (e) {}
    var list = ((d && d.results) || []).filter(function (x) { return type !== "multi" || x.media_type === "tv" || x.media_type === "movie"; });
    var hit = list.filter(function (x) { return slugify(x.name || x.title) === r.slug; })[0] || list[0];
    if (!hit) {
      try { history.replaceState(history.state, "", "/"); } catch (e) {}
      if (typeof showToast === "function") showToast("Titul se nenašel");
      return false;
    }
    var name = hit.name || hit.title;
    var isTv = type === "tv" || (type === "multi" && hit.media_type === "tv");
    if (r.kind === "c") {
      if (window.MFCinemaPlayer) MFCinemaPlayer.open(hit.id, name, isTv ? "tv_ep" : "movie", { season: r.season, episode: r.episode });
    } else if (isTv) openDiscoverTv(hit.id, name);
    else if (typeof mfhOpenCard === "function") mfhOpenCard(name, hit.id, "movie");
    return true;
  }
  window.mfOpenTitleFromPath = openTitleFromPath;
  window.mfParseTitlePath = parsePath;

  function init() {
    hook();
    /* přesměrování z 404.html: /?mfp=/c/nazev-s01e02 */
    var path = location.pathname;
    try {
      var q = new URLSearchParams(location.search).get("mfp");
      if (q && /^\/[sfc]\//.test(q)) { path = q; history.replaceState(history.state, "", q); }
    } catch (e) {}
    if (!parsePath(path)) return;
    var tries = 0;
    var t = setInterval(function () {
      var gate = document.getElementById("mfProfileGate");
      var gateUp = gate && gate.style.display !== "none" && getComputedStyle(gate).display !== "none";
      if (++tries > 120) return clearInterval(t);
      if (gateUp || typeof tmdbGet !== "function" || typeof openDiscoverTv !== "function" || typeof mfhOpenCard !== "function") return;
      clearInterval(t);
      setTimeout(function () { openTitleFromPath(path); }, 600);
    }, 500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
