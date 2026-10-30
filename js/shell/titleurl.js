/* Čisté adresy titulů: /s/<nazev> (seriál), /f/<nazev> (film), /c/<nazev> (rovnou přehrávač), bez čísla.
   Při otevření detailu se adresa jen přepíše (replaceState), při zavření vrátí na /.
   Při načtení odkazu se titul dohledá přes TMDB hledání a otevře. */
(function () {
  "use strict";

  function slugify(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  window.mfSlugify = slugify;

  function setPath(kind, title) {
    var s = slugify(title);
    if (!s) return;
    try { history.replaceState(history.state, "", "/" + kind + "/" + s); } catch (e) {}
  }
  function clearPath() {
    try { if (/^\/[sfc]\//.test(location.pathname)) history.replaceState(history.state, "", "/"); } catch (e) {}
  }
  function layerOpen() {
    var m = document.getElementById("seriesModal");
    if (m && m.classList.contains("visible")) return true;
    var c = document.getElementById("cinemaModal");
    return !!(c && c.classList.contains("open"));
  }
  function afterClose() { setTimeout(function () { if (!layerOpen()) clearPath(); }, 700); }

  function wrap(name, fn) {
    var orig = window[name];
    if (typeof orig !== "function" || orig._tu) return;
    var w = fn(orig); w._tu = 1; window[name] = w;
  }

  function hook() {
    wrap("openSeries", function (orig) {
      return function (slug) {
        var r = orig.apply(this, arguments);
        try { if (typeof db !== "undefined" && db[slug]) setPath("s", db[slug].name || db[slug].title); } catch (e) {}
        return r;
      };
    });
    wrap("openDiscoverTv", function (orig) {
      return function (id, title) {
        var r = orig.apply(this, arguments);
        try { setPath("s", title); } catch (e) {}
        return r;
      };
    });
    wrap("closeModal", function (orig) {
      return function () { var r = orig.apply(this, arguments); afterClose(); return r; };
    });
    var P = window.MFCinemaPlayer;
    if (P && !P._tu) {
      var o = P.open, c = P.close;
      P.open = function (id, title, type) {
        var r = o.apply(this, arguments);
        if (type === "movie") setPath("f", title);
        else if (type === "tv_ep") setPath("c", title);
        return r;
      };
      P.close = function () { var r = c.apply(this, arguments); afterClose(); return r; };
      P._tu = 1;
    }
  }

  function parsePath(p) {
    var m = /^\/([sfc])\/([^\/?#]+)/.exec(p || "");
    if (!m) return null;
    var q; try { q = decodeURIComponent(m[2]); } catch (e) { q = m[2]; }
    return { kind: m[1], slug: slugify(q) };
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
      clearPath();
      if (typeof showToast === "function") showToast("Titul se nenašel");
      return false;
    }
    var name = hit.name || hit.title;
    if (r.kind === "c") {
      if (window.MFCinemaPlayer) MFCinemaPlayer.open(hit.id, name, hit.media_type === "tv" ? "tv_ep" : "movie", { season: 1, episode: 1 });
    } else if (type === "tv") openDiscoverTv(hit.id, name);
    else if (typeof mfhOpenCard === "function") mfhOpenCard(name, hit.id, "movie");
    return true;
  }
  window.mfOpenTitleFromPath = openTitleFromPath;

  function init() {
    hook();
    if (!parsePath(location.pathname)) return;
    var path = location.pathname, tries = 0;
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
