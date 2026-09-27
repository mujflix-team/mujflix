/* ══════════════════════════════════════════════════════════════
   MůjFlix — cinema.js (konsolidováno)
   Sloučeno z: cinema-player.js + legal-streaming-providers.js
   Pořadí zachováno: cinema-player.js nejdřív (definuje
   window.MFCinemaPlayer), legal-streaming-providers.js pak
   ho obaluje (potřebuje MFCinemaPlayer už existovat).
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
 * MůjFlix Cinema Player v2
 * Samostatný přehrávač s podporou více zdrojů a navigací epizod.
 *
 * Zdroje filmů:  Bombuj, Prehrajto.cz, Uzi.la
 * Zdroje seriálů: SvetSerialu, Bombuj, Prehrajto.cz, Uzi.la
 * ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var modal, frame, titleNode, sourceLabelNode, sourceCounterNode;
  var tvBar, epGridPanel, epGridBody;
  var current = null; // { tmdbId, title, type, season, episode, sourceIdx, localSlug, year, tried: Set }

  /* ── Helpery na slugy / dotazy ───────────────────────────── */
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function stripDiacritics(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Dash-slug — použij globální _czSlug z app.js (stejná logika jako
  // pro Bombuj/SvetSerialu), s lokálním fallbackem pro jistotu.
  function daslug(value) {
    if (typeof window._czSlug === "function") return window._czSlug(value);
    if (typeof _czSlug === "function") {
      try {
        return _czSlug(value);
      } catch (e) {}
    }
    return stripDiacritics(String(value || ""))
      .toLowerCase()
      .replace(/[':.]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Slug pro vyhledávací dotaz (mezery zůstávají mezerami → %20)
  function searchQuery(value) {
    return stripDiacritics(String(value || ""))
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanTitle(t) {
    return String(t || "").replace(/\s*[—–-]+\s*S\d+E\d+.*/i, "").trim();
  }

  /* ── URL buildery pro filmy ──────────────────────────────── */
  function bombujMovieUrl(title, year) {
    if (typeof window._bombujMovieUrlVariants === "function") {
      try {
        var arr = window._bombujMovieUrlVariants(title, year);
        if (arr && arr[0]) return arr[0];
      } catch (e) {}
    }
    var s = daslug(title);
    if (!s) return "https://www.bombuj.si/?s=" + encodeURIComponent(title || "");
    return year
      ? "https://www.bombuj.si/online-film-" + s + "-" + encodeURIComponent(year)
      : "https://www.bombuj.si/online-film-" + s;
  }

  function bombujMovieUrlNoYear(title) {
    var s = daslug(title);
    return s
      ? "https://www.bombuj.si/online-film-" + s
      : "https://www.bombuj.si/?s=" + encodeURIComponent(title || "");
  }

  function prehrajtoUrl(query) {
    return "https://prehrajto.cz/hledej/" + encodeURIComponent(searchQuery(query));
  }

  function uziMovieUrl(title) {
    var s = daslug(title);
    return s ? "https://uzi.la/p/" + s : "https://uzi.la/?s=" + encodeURIComponent(title || "");
  }

  /* ── URL buildery pro seriály (season/episode) ───────────── */
  function svetSerialuUrl(title, season, episode, siteSlug) {
    if (typeof window._svetSerialuSlugVariants === "function") {
      try {
        var variants = window._svetSerialuSlugVariants(siteSlug, title);
        if (variants && variants[0]) {
          return "https://svetserialu.to/serial/" + variants[0] + "/s" + pad2(season) + "e" + pad2(episode);
        }
      } catch (e) {}
    }
    var s = daslug(title);
    return s
      ? "https://svetserialu.to/serial/" + s + "/s" + pad2(season) + "e" + pad2(episode)
      : "https://svetserialu.to/?s=" + encodeURIComponent(title || "");
  }

  function bombujTvUrl(title, season, episode) {
    var s = daslug(title);
    return s
      ? "https://serialy.bombuj.si/serial/" + s + "-" + season + "x" + pad2(episode)
      : "https://serialy.bombuj.si/?s=" + encodeURIComponent(title || "");
  }

  function prehrajtoTvUrl(title, season, episode) {
    return prehrajtoUrl(title + " S" + pad2(season) + "E" + pad2(episode));
  }

  function uziTvUrl(title, season, episode) {
    var s = daslug(title);
    return s
      ? "https://uzi.la/p/" + s + "-s" + pad2(season) + "e" + pad2(episode)
      : "https://uzi.la/?s=" + encodeURIComponent(title || "");
  }
  
  function uziMovieUrlWithYear(title, year) {
    var s = daslug(title);
    if (!s) return "https://uzi.la/?s=" + encodeURIComponent(title || "");
    return year
      ? "https://uzi.la/p/" + s + "-" + encodeURIComponent(year)
      : "https://uzi.la/p/" + s;
  }

  /* ── Seznamy zdrojů ───────────────────────────────────────── */
  var MOVIE_SOURCES = [
    { id: "bombuj", label: "Bombuj", build: function (t, y) { return bombujMovieUrl(t, y); } },
    { id: "bombuj-noyear", label: "Bombuj (bez roku)", build: function (t) { return bombujMovieUrlNoYear(t); } },
    { id: "prehrajto", label: "Prehrajto.cz", build: function (t) { return prehrajtoUrl(t); } },
        { id: "uzila", label: "Uzi.la (s rokem)", build: function (t, y) { return uziMovieUrlWithYear(t, y); } },
    { id: "uzila-noyear", label: "Uzi.la (bez roku)", build: function (t) { return uziMovieUrl(t); } }
  ];

  var TV_SOURCES = [
    { id: "svetserialu", label: "SvetSerialu", build: function (t, s, e, slug) { return svetSerialuUrl(t, s, e, slug); } },
    { id: "bombuj", label: "Bombuj", build: function (t, s, e) { return bombujTvUrl(t, s, e); } },
    { id: "prehrajto", label: "Prehrajto.cz", build: function (t, s, e) { return prehrajtoTvUrl(t, s, e); } },
    { id: "uzila", label: "Uzi.la", build: function (t, s, e) { return uziTvUrl(t, s, e); } }
  ];

  function sourcesFor(type) {
    return type === "movie" ? MOVIE_SOURCES : TV_SOURCES;
  }

  function buildUrl() {
    var sources = sourcesFor(current.type);
    var src = sources[current.sourceIdx];
    if (current.type === "movie") {
      return src.build(current.title, current.year);
    }
    return src.build(current.title, current.season, current.episode, current.localSlug);
  }

  /* ── Napojení na appku (watched stav, seznam seriálů) ────── */
  function appGetWatched() {
    try {
      return typeof getWatched === "function" ? getWatched() : {};
    } catch (e) {
      return {};
    }
  }

  function appDb() {
    try {
      return typeof db !== "undefined" ? db : null;
    } catch (e) {
      return null;
    }
  }

  function appTotalSeasons(slug) {
    try {
      return typeof totalSeasons === "function" ? totalSeasons(slug) : 1;
    } catch (e) {
      return 1;
    }
  }

  function appEpsInSeason(slug, season) {
    try {
      return typeof epsInSeason === "function" ? epsInSeason(slug, season) : (current.totalEps[season] || 20);
    } catch (e) {
      return current.totalEps[season] || 20;
    }
  }

  function appMarkWatched(uid) {
    try {
      if (typeof markWatched === "function") markWatched(uid);
    } catch (e) {}
  }

  function isEpWatched(season, episode) {
    if (!current.localSlug) return false;
    var w = appGetWatched();
    return !!w[current.localSlug + "-S" + season + "-E" + episode];
  }

  // Zjisti počet sezón/epizod — z lokální db, jinak dotažením z TMDB (fallback).
  function ensureEpCounts(cb) {
    if (current.localSlug && appDb() && appDb()[current.localSlug]) {
      current.totalSeasonsCount = appTotalSeasons(current.localSlug);
      current.epCountFn = function (s) { return appEpsInSeason(current.localSlug, s); };
      cb && cb();
      return;
    }
    // fallback: TMDB
    var key = (typeof TMDB_KEY !== "undefined" && TMDB_KEY) || null;
    if (key && current.tmdbId && !isNaN(parseInt(current.tmdbId, 10))) {
      fetch("https://api.themoviedb.org/3/tv/" + current.tmdbId + "?api_key=" + key + "&language=cs")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data) {
            current.totalSeasonsCount = data.number_of_seasons || 1;
            current.totalEps = {};
            (data.seasons || []).forEach(function (s) {
              if (s.season_number > 0) current.totalEps[s.season_number] = s.episode_count;
            });
            current.epCountFn = function (s) { return current.totalEps[s] || 20; };
          }
          cb && cb();
        })
        .catch(function () { cb && cb(); });
    } else {
      current.totalSeasonsCount = current.totalSeasonsCount || 20;
      current.epCountFn = current.epCountFn || function () { return 20; };
      cb && cb();
    }
  }

  function findNextSeriesSlug() {
    var d = appDb();
    if (!d || !current.localSlug) return null;
    var keys = Object.keys(d);
    var idx = keys.indexOf(current.localSlug);
    if (idx === -1) return null;
    for (var i = 1; i <= keys.length; i++) {
      var candidate = keys[(idx + i) % keys.length];
      if (candidate !== current.localSlug) return candidate;
    }
    return null;
  }

  /* ── Modal DOM ────────────────────────────────────────────── */
  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.id = "mfStandaloneCinema";
    modal.innerHTML =
      '<div class="mf-standalone-cinema-top">' +
        '<strong id="mfStandaloneCinemaTitle"></strong>' +
        '<span id="mfStandaloneCinemaSource"></span>' +
        '<span class="mf-cin-src-label" id="mfCinSrcLabel"></span>' +
        '<span class="mf-cin-src-counter" id="mfCinSrcCounter"></span>' +

        '<div class="mf-cin-tvbar" id="mfCinTvBar" style="display:none">' +
          '<button type="button" class="mf-cin-ep-btn" id="mfCinPrevEp">⏮ Předchozí epizoda</button>' +
          '<span class="mf-cin-ep-current" id="mfCinEpCurrent"></span>' +
          '<button type="button" class="mf-cin-ep-btn" id="mfCinNextEp">Další epizoda ⏭</button>' +
          '<button type="button" class="mf-cin-ep-btn mf-cin-ep-pick" id="mfCinPickEp">📺 Vybrat epizodu</button>' +
          '<button type="button" class="mf-cin-ep-btn mf-cin-next-series" id="mfCinNextSeries">⏭⏭ Další seriál</button>' +
        "</div>" +

        '<button type="button" class="mf-cin-adtip-btn" id="mfCinAdTipBtn" aria-label="Zdroj může zobrazovat reklamy">⚠️</button>' +
        '<button type="button" class="mf-cin-switch-btn" id="mfCinSwitchSrc">🔄 Zkusit jiný zdroj</button>' +
        '<a class="mf-cin-external-btn" id="mfStandaloneCinemaExternal" target="_blank" rel="noopener">🔗 Otevřít v nové kartě</a>' +
        '<button type="button" id="mfStandaloneCinemaClose" aria-label="Zavřít">×</button>' +
      "</div>" +

      '<div class="mf-cin-adtip-pop" id="mfCinAdTip" style="display:none">' +
        '<span>⚠️ Zdroj může zobrazovat reklamy/vyskakovací okna. Doporučujeme blokátor reklam — ' +
        '<a href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/" target="_blank" rel="noopener">Firefox</a> · ' +
        '<a href="https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh" target="_blank" rel="noopener">Chrome</a>' +
        '</span>' +
      "</div>" +

      '<div class="mf-cin-epgrid" id="mfCinEpGrid" style="display:none">' +
        '<div class="mf-cin-epgrid-seasons" id="mfCinEpGridSeasons"></div>' +
        '<div class="mf-cin-epgrid-body" id="mfCinEpGridBody"></div>' +
      "</div>" +

      '<div class="mf-standalone-cinema-frame"><div id="mfStandaloneCinemaFrame"></div></div>';
    document.body.appendChild(modal);

    frame = modal.querySelector("#mfStandaloneCinemaFrame");
    titleNode = modal.querySelector("#mfStandaloneCinemaTitle");
    sourceLabelNode = modal.querySelector("#mfCinSrcLabel");
    sourceCounterNode = modal.querySelector("#mfCinSrcCounter");
    tvBar = modal.querySelector("#mfCinTvBar");
    epGridPanel = modal.querySelector("#mfCinEpGrid");
    epGridBody = modal.querySelector("#mfCinEpGridBody");

    modal.querySelector("#mfStandaloneCinemaClose").onclick = close;
    modal.querySelector("#mfCinSwitchSrc").onclick = function () { cycleSource(1); };
    modal.querySelector("#mfCinPrevEp").onclick = function () { stepEpisode(-1); };
    modal.querySelector("#mfCinNextEp").onclick = function () { stepEpisode(1); };
    modal.querySelector("#mfCinPickEp").onclick = toggleEpGrid;
    modal.querySelector("#mfCinNextSeries").onclick = goNextSeries;

    var adTip = modal.querySelector("#mfCinAdTip");
    var adTipBtn = modal.querySelector("#mfCinAdTipBtn");
    if (adTip && adTipBtn) {
      adTipBtn.onclick = function (event) {
        event.stopPropagation();
        adTip.style.display = adTip.style.display === "none" ? "flex" : "none";
      };
      modal.addEventListener("click", function (event) {
        if (adTip.style.display !== "none" && !adTip.contains(event.target) && event.target !== adTipBtn) {
          adTip.style.display = "none";
        }
      });
    }

    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });
  }

  /* ── Zdroje: přepínání + počítadlo ────────────────────────── */
  function cycleSource(dir) {
    var sources = sourcesFor(current.type);
    current.sourceIdx = (current.sourceIdx + dir + sources.length) % sources.length;
    renderCurrent();
  }

  function renderSourceBar() {
    var sources = sourcesFor(current.type);
    var src = sources[current.sourceIdx];
    current.tried.add(current.sourceIdx);
    var used = current.tried.size;
    var total = sources.length;
    var remaining = total - used;
    sourceLabelNode.textContent = src.label + " (" + (current.sourceIdx + 1) + "/" + total + ")";
    sourceCounterNode.textContent =
      "Vyzkoušeno " + used + " z " + total + (remaining > 0 ? " · zbývá ještě " + remaining : " · vyzkoušeny všechny");
  }

  /* ── TV navigace (epizody) ────────────────────────────────── */
  function updateEpCurrentLabel() {
    modal.querySelector("#mfCinEpCurrent").textContent =
      "S" + pad2(current.season) + " · E" + pad2(current.episode);
  }

  function stepEpisode(dir) {
    ensureEpCounts(function () {
      var epsInThis = current.epCountFn(current.season);
      var newEp = current.episode + dir;
      var newSeason = current.season;
      if (newEp < 1) {
        if (newSeason > 1) {
          newSeason -= 1;
          newEp = current.epCountFn(newSeason);
        } else {
          newEp = 1;
        }
      } else if (newEp > epsInThis) {
        if (!current.totalSeasonsCount || newSeason < current.totalSeasonsCount) {
          newSeason += 1;
          newEp = 1;
        } else {
          newEp = epsInThis;
        }
      }
      current.season = newSeason;
      current.episode = newEp;
      if (current.localSlug) appMarkWatched(current.localSlug + "-S" + current.season + "-E" + current.episode);
      current.tried = new Set();
      current.sourceIdx = 0;
      renderCurrent();
      if (epGridPanel.style.display !== "none") renderEpGrid();
    });
  }

  function goNextSeries() {
    var nextSlug = findNextSeriesSlug();
    if (!nextSlug) {
      if (typeof showToast === "function") showToast("Žádný další seriál v seznamu nenalezen", "error");
      return;
    }
    var d = appDb();
    var entry = d[nextSlug];
    var next = null;
    try {
      next = typeof findNextEp === "function" ? findNextEp(nextSlug) : null;
    } catch (e) {}
    var season = next ? next.se : 1;
    var episode = next ? next.ep : 1;
    if (typeof showToast === "function") showToast("▶ " + (entry.name || nextSlug), "success");
    open(entry.tmdbId || nextSlug, entry.name || nextSlug, "tv_ep", {
      season: season,
      episode: episode,
      localSlug: nextSlug
    });
  }

  /* ── Panel výběru konkrétní epizody (se stavem zhlédnutí) ─── */
  function toggleEpGrid() {
    var show = epGridPanel.style.display === "none";
    epGridPanel.style.display = show ? "flex" : "none";
    if (show) {
      ensureEpCounts(function () {
        renderEpGrid();
      });
    }
  }

  function renderEpGrid() {
    var seasonsBar = modal.querySelector("#mfCinEpGridSeasons");
    var totalS = current.totalSeasonsCount || 1;
    seasonsBar.innerHTML = "";
    for (var s = 1; s <= totalS; s++) {
      (function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "mf-cin-season-chip" + (s === current.season ? " active" : "");
        b.textContent = "S" + pad2(s);
        b.onclick = function () {
          current.season = s;
          renderEpGrid();
        };
        seasonsBar.appendChild(b);
      })(s);
    }

    var epsCount = current.epCountFn ? current.epCountFn(current.season) : 20;
    epGridBody.innerHTML = "";
    for (var e = 1; e <= epsCount; e++) {
      (function (e) {
        var watched = isEpWatched(current.season, e);
        var b = document.createElement("button");
        b.type = "button";
        b.className =
          "mf-cin-ep-chip" +
          (watched ? " watched" : "") +
          (e === current.episode ? " current" : "");
        b.innerHTML =
          '<span class="mf-cin-ep-chip-num">E' + pad2(e) + "</span>" +
          '<span class="mf-cin-ep-chip-mark">' + (watched ? "✓" : "") + "</span>";
        b.title = watched ? "Zhlédnuto" : "Nezhlédnuto";
        b.onclick = function () {
          current.episode = e;
          if (current.localSlug) appMarkWatched(current.localSlug + "-S" + current.season + "-E" + e);
          current.tried = new Set();
          current.sourceIdx = 0;
          renderCurrent();
          renderEpGrid();
        };
        epGridBody.appendChild(b);
      })(e);
    }
  }

  /* ── Vykreslení / načtení přehrávače ──────────────────────── */
  function loadUrl(url, label) {
    frame.classList.remove("mf-cinema-ready");
    frame.innerHTML =
      '<div class="mf-cinema-skeleton" role="status" aria-live="polite">' +
        '<div class="mf-cinema-skeleton-mark">▶</div>' +
        '<div class="mf-cinema-skeleton-line mf-cinema-skeleton-line-title"></div>' +
        '<div class="mf-cinema-skeleton-line mf-cinema-skeleton-line-meta"></div>' +
        "<span>Načítám přehrávač…</span>" +
      "</div>" +
      '<iframe title="Cinema Mode" allow="autoplay; fullscreen" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation" src="' +
      String(url).replace(/"/g, "&quot;") + '"></iframe>';
    var playerFrame = frame.querySelector("iframe");
    playerFrame.addEventListener(
      "load",
      function () {
        frame.classList.add("mf-cinema-ready");
        var skeleton = frame.querySelector(".mf-cinema-skeleton");
        if (skeleton) skeleton.setAttribute("aria-hidden", "true");
      },
      { once: true }
    );
    modal.querySelector("#mfStandaloneCinemaExternal").href = url;
  }

  function renderCurrent() {
    var url = buildUrl();
    var sources = sourcesFor(current.type);
    var label = sources[current.sourceIdx].label;
    modal.querySelector("#mfStandaloneCinemaSource").textContent = label;
    loadUrl(url, label);
    renderSourceBar();
    if (current.type === "tv") {
      tvBar.style.display = "flex";
      updateEpCurrentLabel();
      modal.querySelector("#mfCinNextSeries").style.display = findNextSeriesSlug() ? "inline-flex" : "none";
    } else {
      tvBar.style.display = "none";
      epGridPanel.style.display = "none";
    }
  }

  /* ── Veřejné API ──────────────────────────────────────────── */
  function open(tmdbId, title, type, extra) {
    ensureModal();
    var rawId = String(tmdbId || "");
    var parts = rawId.split("/");
    var isEpisode = type === "tv_ep" || parts.length === 3;
    var baseId = isEpisode ? parts[0] : rawId;
    var year = window._cinYear || null;
    var localSlug =
      (extra && extra.localSlug) ||
      window._cinSiteSlug ||
      (typeof activeSeries !== "undefined" && activeSeries ? activeSeries : null);

    current = {
      tmdbId: baseId,
      title: cleanTitle(title),
      type: isEpisode || type === "tv" ? "tv" : "movie",
      season: extra && extra.season ? extra.season : (isEpisode ? parseInt(parts[1], 10) || 1 : 1),
      episode: extra && extra.episode ? extra.episode : (isEpisode ? parseInt(parts[2], 10) || 1 : 1),
      sourceIdx: 0,
      year: year,
      localSlug: localSlug,
      totalSeasonsCount: null,
      totalEps: {},
      epCountFn: null,
      tried: new Set()
    };
    window._cinSiteSlug = null;
    window._cinYear = null;

    titleNode.textContent = current.title || "Cinema Mode";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    renderCurrent();
    if (current.type === "tv") ensureEpCounts(function () {});
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("open");
    frame.innerHTML = "";
    if (epGridPanel) epGridPanel.style.display = "none";
    document.body.style.overflow = "";
  }

  window.MFCinemaPlayer = { open: open, close: close };
})();

/* ══════════════ ZAČÁTEK: bývalý legal-streaming-providers.js ══════════════ */
/**
 * ═══════════════════════════════════════════════════════════════════
 * MŮJFLIX — Legal Streaming Providers (Apple TV+ style)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Zobrazí legální streamingové služby kde lze pustit film/seriál
 * v cinema mode. Používá TMDB Watch Providers API.
 */

(function() {
  // ══ STREAMING PROVIDERS CONFIG ══
  // Mapování TMDB provider IDs na logo + URL
  const STREAMING_PROVIDERS = {
    // Apple TV+
    350: {
      name: "Apple TV+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Apple_TV_Plus_Logo.svg",
      url: (title, type) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}`
    },
    // Netflix
    8: {
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      url: (title, type) => `https://www.netflix.com/search?query=${encodeURIComponent(title)}`
    },
    // Prime Video
    9: {
      name: "Prime Video",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Amazon_Prime_Video_logo.jpg",
      url: (title, type) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`
    },
    // Disney+
    337: {
      name: "Disney+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Disney%2B_logo.svg",
      url: (title, type) => `https://www.disneyplus.com/search?query=${encodeURIComponent(title)}`
    },
    // HBO Max (now Max)
    1899: {
      name: "Max",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Max_Logo.svg",
      url: (title, type) => `https://www.max.com/search/${encodeURIComponent(title)}`
    },
    // HBO Max (old)
    274: {
      name: "HBO Max",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/HBO_Max_Logo.svg",
      url: (title, type) => `https://www.hbomax.com/search?query=${encodeURIComponent(title)}`
    },
    // Crunchyroll
    372: {
      name: "Crunchyroll",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Crunchyroll_2021.svg",
      url: (title, type) => `https://www.crunchyroll.com/search?query=${encodeURIComponent(title)}`
    },
    // Canal+ (Czech)
    203: {
      name: "Canal+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Canal_plus.svg",
      url: (title, type) => `https://canalplus.cz/vyhledavani?query=${encodeURIComponent(title)}`
    },
    // Voyo
    679: {
      name: "Voyo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Voyo_logo.svg",
      url: (title, type) => `https://voyo.cz/hledat?q=${encodeURIComponent(title)}`
    },
    // Netflix basic (sk)
    100032: {
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      url: (title, type) => `https://www.netflix.com/search?query=${encodeURIComponent(title)}`
    },
    // SkyShowtime
    625: {
      name: "SkyShowtime",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/SkyShowtime_2022.svg",
      url: (title, type) => `https://www.skyshowtime.com/search?q=${encodeURIComponent(title)}`
    },
    // O2 TV
    1777: {
      name: "O2 TV",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/O2_logo.svg",
      url: (title, type) => `https://www.o2tv.cz/hledej?q=${encodeURIComponent(title)}`
    },
    // Mall.TV
    435: {
      name: "Mall.TV",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/MallTV_logo.svg",
      url: (title, type) => `https://mall.tv/vysledky-vyhledavani?search=${encodeURIComponent(title)}`
    },
    // Kiwi
    682: {
      name: "Kiwi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Kiwi.com_logo.svg",
      url: (title, type) => `https://kiwi.com/cz/search?search=${encodeURIComponent(title)}`
    },
    // Plex
    68: {
      name: "Plex",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Plex_logo.svg",
      url: (title, type) => `https://app.plex.tv/search?query=${encodeURIComponent(title)}`
    },
    // Rakuten TV
    358: {
      name: "Rakuten",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Rakuten_TV_logo.svg",
      url: (title, type) => `https://rakuten.tv/search/${encodeURIComponent(title)}`
    },
    // Mubi
    326: {
      name: "Mubi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2c/MUBI_Logo.svg",
      url: (title, type) => `https://mubi.com/search?q=${encodeURIComponent(title)}`
    },
    // Amazon Prime (old ID)
    10: {
      name: "Prime Video",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Amazon_Prime_Video_logo.jpg",
      url: (title, type) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`
    },
    // Hulu
    418: {
      name: "Hulu",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg",
      url: (title, type) => `https://www.hulu.com/search?query=${encodeURIComponent(title)}`
    },
    // Disney+ Hotstar
    122: {
      name: "Disney+ Hotstar",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Disney%2B_Logo.svg",
      url: (title, type) => `https://www.hotstar.com/search?query=${encodeURIComponent(title)}`
    },
    // Paramount+
    531: {
      name: "Paramount+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Paramount%2B_logo.svg",
      url: (title, type) => `https://www.paramountplus.com/search/${encodeURIComponent(title)}`
    },
    // Peacock
    391: {
      name: "Peacock",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Peacock_Logo.svg",
      url: (title, type) => `https://www.peacocktv.com/search/${encodeURIComponent(title)}`
    },
    // Discovery+
    1537: {
      name: "Discovery+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Discovery%2B_logo.svg",
      url: (title, type) => `https://www.discoveryplus.com/search?query=${encodeURIComponent(title)}`
    }
  };

  // Region priority for Czech Republic
  const REGIONS_TO_TRY = ['CZ', 'SK', 'US', 'GB', 'DE'];

  // ══ FETCH WATCH PROVIDERS FROM TMDB ══
  async function fetchWatchProviders(tmdbId, type) {
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/watch/providers?api_key=${window.TMDB_KEY || window.TMDB_KEY_DEFAULT || ''}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      return data;
    } catch (err) {
      console.warn('[LegalProviders] Fetch error:', err);
      return null;
    }
  }

  // ══ GET PROVIDERS FOR CZECH REGION ══
  function getCzechProviders(providersData) {
    if (!providersData?.results) return null;

    // Try CZ first, then SK, then US
    for (const region of REGIONS_TO_TRY) {
      const regionData = providersData.results[region];
      if (regionData?.flatrate?.length) {
        return {
          region: region,
          providers: regionData.flatrate
        };
      }
    }
    return null;
  }

  // ══ RENDER PROVIDERS — floating badge v pravém dolním rohu ══
  function renderLegalProviders(tmdbId, title, type) {
    // Odstraň existující
    const existing = document.getElementById('legalProvidersSection');
    if (existing) existing.remove();

    const cinemaModal = document.getElementById('cinemaModal')
                      || document.getElementById('mfStandaloneCinema');
    if (!cinemaModal) return;

    // ── Wrapper: fixně v pravém dolním rohu cinema modalu ──
    const wrap = document.createElement('div');
    wrap.id = 'legalProvidersSection';
    wrap.style.cssText = `
      position: absolute;
      bottom: 72px;
      right: 16px;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      pointer-events: none;
    `;

    // ── Rozbalený panel (skrytý dokud nejsou data) ──
    const panel = document.createElement('div');
    panel.id = 'legalProvidersPanel';
    panel.style.cssText = `
      background: rgba(10,10,16,0.92);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 12px 14px;
      display: none;
      flex-direction: column;
      gap: 8px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.7);
      pointer-events: auto;
      max-width: 260px;
    `;

    const panelLabel = document.createElement('div');
    panelLabel.style.cssText = `
      font-size: 0.52rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-bottom: 2px;
    `;
    panelLabel.textContent = 'Legálně dostupné na';
    panel.appendChild(panelLabel);

    const providersRow = document.createElement('div');
    providersRow.style.cssText = `
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      justify-content: flex-end;
    `;
    panel.appendChild(providersRow);

    // ── Toggle badge ──
    const badge = document.createElement('button');
    badge.id = 'legalProvidersBadge';
    badge.title = 'Kde legálně sledovat';
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px 7px 9px;
      background: rgba(10,10,16,0.88);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50px;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s ease;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
      color: rgba(255,255,255,0.55);
      font-size: 0.68rem;
      font-weight: 600;
      font-family: -apple-system, sans-serif;
      white-space: nowrap;
    `;
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
      <span id="legalBadgeText">Kde sledovat?</span>
    `;
    badge.onmouseenter = () => {
      badge.style.background = 'rgba(20,20,30,0.95)';
      badge.style.borderColor = 'rgba(255,255,255,0.18)';
      badge.style.color = 'rgba(255,255,255,0.85)';
    };
    badge.onmouseleave = () => {
      badge.style.background = 'rgba(10,10,16,0.88)';
      badge.style.borderColor = 'rgba(255,255,255,0.1)';
      badge.style.color = 'rgba(255,255,255,0.55)';
    };

    let panelOpen = false;
    badge.onclick = () => {
      panelOpen = !panelOpen;
      panel.style.display = panelOpen ? 'flex' : 'none';
    };

    wrap.appendChild(panel);
    wrap.appendChild(badge);
    cinemaModal.appendChild(wrap);

    // ── Fetch providers ──
    fetchWatchProviders(tmdbId, type).then(data => {
      const czData = getCzechProviders(data);

      if (!czData?.providers?.length) {
        badge.style.display = 'none'; // Skryj badge pokud nic není
        return;
      }

      // Aktualizuj badge text
      const badgeText = document.getElementById('legalBadgeText');
      if (badgeText) badgeText.textContent = `Dostupné v ${czData.region === 'CZ' ? 'ČR' : czData.region}`;

      // Zvýrazni badge — jsou data
      badge.style.borderColor = 'rgba(0,122,255,0.3)';
      badge.querySelector('svg').style.stroke = '#007aff';

      // Přidej provider tlačítka
      czData.providers.forEach(provider => {
        const info = STREAMING_PROVIDERS[provider.provider_id];
        if (!info) return;

        const btn = document.createElement('a');
        btn.href = info.url(title, type);
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.title = info.name;
        btn.style.cssText = `
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          text-decoration: none;
          transition: all 0.18s;
          cursor: pointer;
        `;
        btn.onmouseenter = () => {
          btn.style.background = 'rgba(255,255,255,0.1)';
          btn.style.borderColor = 'rgba(255,255,255,0.18)';
        };
        btn.onmouseleave = () => {
          btn.style.background = 'rgba(255,255,255,0.05)';
          btn.style.borderColor = 'rgba(255,255,255,0.08)';
        };

        const logo = document.createElement('img');
        logo.src = info.logo;
        logo.alt = info.name;
        logo.style.cssText = `width:20px;height:20px;object-fit:contain;border-radius:4px;`;
        logo.onerror = () => logo.style.display = 'none';

        const name = document.createElement('span');
        name.style.cssText = `font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.8);white-space:nowrap;font-family:-apple-system,sans-serif;`;
        name.textContent = info.name;

        btn.appendChild(logo);
        btn.appendChild(name);
        providersRow.appendChild(btn);
      });

    }).catch(() => {
      badge.style.display = 'none';
    });
  }

  // ══ HOOK INTO NEW CINEMA PLAYER (window.MFCinemaPlayer) ══
  // app.js's openMovieInCinema delegates to MFCinemaPlayer.open() when it
  // exists, which opens #mfStandaloneCinema instead of #cinemaModal — so we
  // need to hook this too, or the badge never shows in the new player.
  if (window.MFCinemaPlayer && typeof window.MFCinemaPlayer.open === 'function') {
    const _origPlayerOpen = window.MFCinemaPlayer.open;
    window.MFCinemaPlayer.open = function(tmdbId, title, type, extra) {
      const result = _origPlayerOpen.apply(this, arguments);
      const actualTmdbId = String(tmdbId).split('/')[0];
      setTimeout(() => {
        renderLegalProviders(actualTmdbId, title, type);
      }, 800);
      return result;
    };
  }

  // ══ HOOK INTO CINEMA MODE (starý #cinemaModal fallback) ══
  // Override openMovieInCinema to add providers
  const originalOpenMovieInCinema = window.openMovieInCinema;
  window.openMovieInCinema = function(tmdbId, title, type) {
    // Call original
    if (originalOpenMovieInCinema) {
      originalOpenMovieInCinema.apply(this, arguments);
    }

    // Extract actual tmdbId (handle tv_ep format: id/season/ep)
    const actualTmdbId = String(tmdbId).split('/')[0];

    // Add legal providers after a short delay to let modal render
    setTimeout(() => {
      renderLegalProviders(actualTmdbId, title, type);
    }, 800);
  };

  // ══ EXPORT FOR MANUAL USE ══
  window.MFLegalProviders = {
    show: renderLegalProviders,
    providers: STREAMING_PROVIDERS
  };

  console.log('[MFLegalProviders] Legal streaming providers loaded');
})();

/**
 * ══ POUŽITÍ ══
 *
 * Funkce se automaticky spustí při otevření cinema mode.
 * Zobrazí sekci s logy legálních streaming služeb.
 *
 * Podporované služby:
 * - Apple TV+
 * - Netflix
 * - Prime Video
 * - Disney+
 * - Max (HBO)
 * - Crunchyroll
 * - Canal+
 * - Voyo
 * - SkyShowtime
 * - O2 TV
 * - Mall.TV
 * - a další...
 */
