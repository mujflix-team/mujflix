;
/* Nové díly: při startu (nejvýš jednou za 12 hodin) se u seriálů v Oblíbených porovná poslední vysílaná epizoda z TMDB
   s tou, kterou appka viděla minule. Je-li novější a vyšla za posledních 14 dní, ukáže se hláška. První kontrola jen
   zapamatuje stav (žádné hlášky navíc). Žádné oznámení mimo appku, nic se neposílá na server. */
(function mfNewEpisodes() {
  var GAP = 12 * 3600 * 1000, FRESH = 14 * 24 * 3600 * 1000, MAX = 15;
  function ls(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { void e; } }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  async function check(force) {
    try {
      if (typeof getWatchlist !== "function" || typeof tmdbGet !== "function" || typeof uKey !== "function") return [];
      if (!(window.TMDB_KEY || typeof TMDB_KEY !== "undefined" && TMDB_KEY || window.MF_USING_TMDB_PROXY)) return [];
      var kAt = uKey("mf_newep_at");
      if (!force && Date.now() - ls(kAt, 0) < GAP) return [];
      lsSet(kAt, Date.now());
      var seen = ls(uKey("mf_newep"), null), first = !seen || typeof seen !== "object"; seen = first ? {} : seen;
      var items = getWatchlist().filter(function (w) { return w && w.type === "series"; }).map(function (w) {
        var id = w.tmdbId || (typeof db !== "undefined" && db[w.slug] && db[w.slug].tmdbId); return id ? { id: String(id), name: w.name || (db[w.slug] && db[w.slug].name) || "Seriál" } : null;
      }).filter(Boolean).slice(0, MAX);
      var found = [];
      var res = await Promise.all(items.map(function (it) { return tmdbGet("/tv/" + it.id).catch(function () { return null; }); }));
      res.forEach(function (d, i) {
        var l = d && d.last_episode_to_air; if (!l || !l.season_number || !l.episode_number) return;
        var tag = "S" + pad(l.season_number) + "E" + pad(l.episode_number), id = items[i].id, t = Date.parse(l.air_date || "");
        if (!first && seen[id] && seen[id] !== tag && t && Date.now() - t < FRESH) found.push({ id: id, name: items[i].name, tag: tag });
        seen[id] = tag;
      });
      lsSet(uKey("mf_newep"), seen);
      if (found.length && typeof showToast === "function") {
        var names = found.slice(0, 2).map(function (f) { return f.name + " " + f.tag; }).join(", ") + (found.length > 2 ? " a další" : "");
        showToast("Nový díl: " + names, 6000);
      }
      return found;
    } catch (e) { return []; }
  }
  window.mfNewEpisodesCheck = check;
  setTimeout(function () { check(false); }, 8000);
})();
