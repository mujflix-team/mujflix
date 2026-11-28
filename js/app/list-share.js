/* Sdílení vlastního seznamu z Oblíbených odkazem. Seznam je zakódovaný přímo v adrese (?seznam=…), nic se neukládá na server.
   Příjemce vidí náhled s plakáty a může si seznam přidat do svých Oblíbených. */
(function () {
  "use strict";
  var SITE = "https://mujflix.pages.dev", MAX = 60;

  function b64enc(str) {
    var bytes = new TextEncoder().encode(str), bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64dec(s) {
    s = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function itemId(it) { return it.tmdbId || (window.db && db[it.slug] && db[it.slug].tmdbId) || 0; }

  /* Odkaz na seznam: {n: název, t: [[„f“|„s“, tmdbId], …]}; položky bez tmdbId se přeskočí */
  window.mfListShareUrl = function (name) {
    var items = getWatchlist().filter(function (w) { return (w.lists || []).indexOf(name) >= 0; }), t = [];
    items.forEach(function (w) { var id = itemId(w); if (id && t.length < MAX) t.push([w.type === "series" ? "s" : "f", id]); });
    return t.length ? SITE + "/?seznam=" + b64enc(JSON.stringify({ n: name, t: t })) : "";
  };
  window.mfShareList = async function (name) {
    var url = window.mfListShareUrl(name);
    if (!url) { if (typeof showToast === "function") showToast("Seznam je prázdný, není co sdílet"); return "empty"; }
    if (navigator.share) {
      try { await navigator.share({ title: name, text: "Seznam „" + name + "“ na MůjFlix", url: url }); return "shared"; }
      catch (e) { if (e && e.name === "AbortError") return "aborted"; }
    }
    var ok = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(url); ok = true; } } catch (e) {}
    if (typeof showToast === "function") showToast(ok ? "Odkaz na seznam zkopírován" : url);
    return ok ? "copied" : "failed";
  };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* Příjem: otevře se až po výběru profilu */
  function readParam() {
    try {
      var p = new URLSearchParams(location.search).get("seznam");
      if (!p) return null;
      var d = JSON.parse(b64dec(p));
      if (!d || typeof d.n !== "string" || !Array.isArray(d.t)) return null;
      var t = d.t.filter(function (x) { return Array.isArray(x) && (x[0] === "f" || x[0] === "s") && /^\d+$/.test(String(x[1])); }).slice(0, MAX).map(function (x) { return [x[0], +x[1]]; });
      return t.length ? { n: String(d.n).slice(0, 24), t: t } : null;
    } catch (e) { return null; }
  }
  function gateOpen() {
    var g = document.getElementById("mfProfileGate");
    return !!g && getComputedStyle(g).display !== "none" && !g.classList.contains("hiding");
  }
  function close() { var o = document.getElementById("mfSharedList"); o && o.remove(); }

  async function show(d) {
    close();
    var o = document.createElement("div");
    o.id = "mfSharedList", o.className = "sl-overlay", o.setAttribute("role", "dialog"), o.setAttribute("aria-modal", "true"), o.setAttribute("aria-label", "Sdílený seznam");
    o.innerHTML = '<div class="sl-box"><div class="sl-head"><div><div class="sl-kicker">Sdílený seznam</div><div class="sl-title">' + esc(d.n) + '</div><div class="sl-count">' + d.t.length + ' titulů</div></div><button type="button" class="sl-x" aria-label="Zavřít">&#x2715;</button></div><div class="sl-grid"></div><div class="sl-actions"><button type="button" class="sl-add">Přidat do mých Oblíbených</button><button type="button" class="sl-close">Zavřít</button></div></div>';
    document.body.appendChild(o);
    o.querySelector(".sl-x").onclick = o.querySelector(".sl-close").onclick = close;
    o.addEventListener("mousedown", function (e) { e.target === o && close(); });
    var grid = o.querySelector(".sl-grid"), loaded = [];
    await Promise.all(d.t.map(async function (x, i) {
      var kind = x[0] === "s" ? "tv" : "movie";
      try {
        var r = await tmdbGet("/" + kind + "/" + x[1] + "?language=cs-CZ");
        if (r && (r.title || r.name)) loaded[i] = { kind: kind, id: x[1], name: r.title || r.name, poster: r.poster_path ? "https://image.tmdb.org/t/p/w342" + r.poster_path : "" };
      } catch (e) {}
    }));
    loaded = loaded.filter(Boolean);
    grid.innerHTML = loaded.map(function (w) {
      return '<div class="sl-card"><div class="sl-poster">' + (w.poster ? '<img src="' + esc(w.poster) + '" alt="" loading="lazy" onerror="this.remove()">' : '<span>' + esc(w.name.charAt(0).toUpperCase()) + '</span>') + '</div><div class="sl-name">' + esc(w.name) + '</div><div class="sl-sub">' + (w.kind === "tv" ? "Seriál" : "Film") + '</div></div>';
    }).join("") || '<div class="sl-empty">Seznam se nepodařilo načíst. Zkus to za chvíli.</div>';
    o.querySelector(".sl-add").onclick = function () {
      var cur = getWatchlist(), added = 0;
      loaded.forEach(function (w) {
        var slug = tmdbFavSlug(w.id, w.kind), ex = cur.find(function (x) { return x.slug === slug || (itemId(x) === w.id && x.type === (w.kind === "tv" ? "series" : "movie")); });
        if (ex) { ex.lists = Array.from(new Set((ex.lists || []).concat(d.n))); return; }
        cur.push({ slug: slug, name: w.name, type: w.kind === "tv" ? "series" : "movie", poster: w.poster, tmdbId: w.id, lists: [d.n] }); added++;
      });
      saveWatchlistData(cur);
      try { if (typeof updateWatchlistBtns === "function") updateWatchlistBtns(); if (typeof renderHomepage === "function") renderHomepage(); } catch (e) {}
      if (typeof showToast === "function") showToast("Seznam „" + d.n + "“ přidán do Oblíbených");
      close();
    };
  }

  var pending = readParam();
  if (pending) {
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    var tries = 0, iv = setInterval(function () {
      tries++;
      if (tries > 120) return clearInterval(iv);          /* ~60 s, pak se vzdá */
      if (typeof getWatchlist !== "function" || typeof tmdbGet !== "function" || gateOpen()) return;
      clearInterval(iv), show(pending);
    }, 500);
  }
})();
