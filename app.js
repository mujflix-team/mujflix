function openAi() {
  if ("function" == typeof openAiPanel) try {
    return void openAiPanel()
  } catch (e) {
    console.warn("[AI]", e)
  }
  const e = document.getElementById("aiFullscreen");
  if (e) {
    e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => {
      e.classList.add("visible");
      const t = document.getElementById("aiInput");
      t && t.focus()
    })), void 0 !== aiPanelOpen && (window.aiPanelOpen = !0);
    const t = document.getElementById("aiFab");
    return t && t.classList.add("open"), "function" == typeof updateStatusBadge && updateStatusBadge(), "function" == typeof updateMsgCounter && updateMsgCounter(), "function" == typeof renderAiWatchList && renderAiWatchList(), void("function" == typeof pauseBgParticles && pauseBgParticles())
  }
  setTimeout(() => {
    "function" == typeof openAiPanel && openAiPanel()
  }, 200)
}

function safeLS(e, t) {
  try {
    return JSON.parse(localStorage.getItem(e) || String(t))
  } catch {
    try {
      return JSON.parse(String(t))
    } catch {
      return t
    }
  }
}

function escapeHTML(e) {
  return e || 0 === e ? String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") : ""
}

function safeSetItem(e, t) {
  try {
    return localStorage.setItem(e, t), !0
  } catch (e) {
    return "QuotaExceededError" !== e.name && 22 !== e.code || showToast("⚠ Paměť prohlížeče plná – data se neukládají", 4e3), !1
  }
}

function _slugBase(e) {
  return /[\u3000-\u9fff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff]/.test(e) ? "" : e.toLowerCase().replace(/[áàâ]/g, "a").replace(/[éěê]/g, "e").replace(/[íîì]/g, "i").replace(/[óô]/g, "o").replace(/[úůû]/g, "u").replace(/[ý]/g, "y").replace(/[ž]/g, "z").replace(/[š]/g, "s").replace(/[č]/g, "c").replace(/[ř]/g, "r").replace(/[ď]/g, "d").replace(/[ť]/g, "t").replace(/[ň]/g, "n").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

function slugifyBombuj(e) {
  const t = _slugBase(e);
  return t ? t + "-" + (new Date).getFullYear() : ""
}

function slugifySvet(e) {
  return _slugBase(e)
}! function() {
  var e = EventTarget.prototype.addEventListener,
    t = {
      wheel: !0,
      touchstart: !0,
      touchmove: !0
    };
  EventTarget.prototype.addEventListener = function(n, o, i) {
    return t[n] && (void 0 === i || !1 === i || "object" == typeof i && void 0 === i.passive) && ("object" == typeof i ? i.passive = !0 : i = {
      passive: !0,
      capture: !!i
    }), e.call(this, n, o, i)
  }
}(), ["https://image.tmdb.org/t/p/w500/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg", "https://image.tmdb.org/t/p/w500/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg", "https://image.tmdb.org/t/p/w500/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg", "https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg"].forEach(e => {
  const t = new Image;
  t.src = e, t.loading = "eager"
}), window.MF_DEBUG = !1, window.addEventListener("unhandledrejection", e => {
  window.MF_DEBUG && console.error("[MF] Unhandled rejection:", e.reason)
});

// ══ CLEANUP HANDLER - Čistí timery při unload ══
const _mfIntervals = new Set();
const _mfTimeouts = new Set();
// Wrapper pro setInterval který sleduje všechny intervaly
const originalSetInterval = setInterval;
window.setInterval = function(fn, delay) {
  const id = originalSetInterval(fn, delay);
  _mfIntervals.add(id);
  return id;
};
// Wrapper pro setTimeout
const originalSetTimeout = setTimeout;
window.setTimeout = function(fn, delay) {
  const id = originalSetTimeout(fn, delay);
  _mfTimeouts.add(id);
  return id;
};

// Cleanup na unload - zastaví všechny timery
window.addEventListener("beforeunload", () => {
  _mfIntervals.forEach(id => clearInterval(id));
  _mfTimeouts.forEach(id => clearTimeout(id));
  _mfIntervals.clear();
  _mfTimeouts.clear();
  window.MF_DEBUG && console.log("[MF] Cleanup - všechny timery zastaveny");
});

// ⚠️ API KLÍČE - DOPORUČENO PŘESUNOUT DO PROXY NEBO ENVIRONMENT
// Aktuální klíče jsou exponované v client-side kódu
const TMDB_KEY = window.TMDB_KEY_DEFAULT || "",
  TMDB = "https://api.themoviedb.org/3",
  IMG = "https://image.tmdb.org/t/p/w400",
  IMG_S = "https://image.tmdb.org/t/p/w185",
  IMG_P = "https://image.tmdb.org/t/p/w300",
  IMG_B = "https://image.tmdb.org/t/p/w780",
  epsBySeason = {
    "the-simpsons": [13, 22, 24, 22, 22, 25, 25, 25, 25, 23, 22, 21, 22, 22, 22, 21, 22, 22, 20, 21, 23, 22, 22, 22, 22, 22, 22, 21, 23, 23, 22, 22, 22, 22, 18, 22, 22],
    "family-guy": [7, 21, 22, 30, 18, 12, 16, 16, 13, 22, 22, 22, 13, 16, 20, 20, 20, 20, 20, 20, 20, 20, 21],
    "south-park": [13, 18, 17, 17, 14, 17, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 10, 10, 10, 10, 10, 2, 6, 6, 6, 6, 6],
    futurama: [13, 19, 22, 18, 16, 26, 26, 10, 10, 10],
    "breaking-bad": [7, 13, 13, 13, 16]
  },
  db = {
    "the-simpsons": {
      name: "The Simpsons",
      tmdbId: 456,
      poster: "https://image.tmdb.org/t/p/w400/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg",
      totalEps: 805,
      runtime: 22,
      type: "tv",
      trailerKey: "oMXk1wi-9Zs"
    },
    "family-guy": {
      name: "Family Guy",
      tmdbId: 1434,
      poster: "https://image.tmdb.org/t/p/w400/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg",
      totalEps: 432,
      runtime: 22,
      type: "tv",
      trailerKey: "J32iwo65RMc"
    },
    "south-park": {
      name: "South Park",
      tmdbId: 2190,
      poster: "https://image.tmdb.org/t/p/w400/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg",
      totalEps: 327,
      runtime: 22,
      type: "tv",
      trailerKey: "FMKcPao7A6Y"
    },
    futurama: {
      name: "Futurama",
      tmdbId: 615,
      poster: "https://image.tmdb.org/t/p/w400/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg",
      totalEps: 140,
      runtime: 22,
      type: "tv",
      trailerKey: "GxEY6KNsz44"
    },
    "breaking-bad": {
      name: "Breaking Bad",
      tmdbId: 1396,
      poster: "https://image.tmdb.org/t/p/w400/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      totalEps: 62,
      runtime: 47,
      type: "tv",
      trailerKey: "HhesaQXLuRY"
    }
  },
  TMDB_GENRE_MAP = {
    komedie: 35,
    akcni: 28,
    "sci-fi": 10765,
    fantasy: 10765,
    drama: 18,
    rodinny: 10751,
    dobrodruzny: 12,
    horor: 27,
    animovany: 16,
    krimi: 80
  };

function epsInSeason(e, t) {
  const n = epsBySeason[e];
  return n && n[t - 1] ? n[t - 1] : 10
}

function totalSeasons(e) {
  const t = epsBySeason[e];
  return t ? t.length : 1
}
const tmdbCache = {};
let activeSeries = "",
  activeSeason = 1,
  showAllSeasons = !1,
  kbMenuIndex = 0,
  kbSeasonIndex = -1,
  kbEpIndex = -1,
  kbLayer = "menu",
  kbSearchIndex = 0,
  modalOpen = !1,
  aiPanelOpen = !1,
  aiThinking = !1,
  _forYouSeries = null,
  _ratingSlug = null,
  asTimer = null,
  asHide = null;

function showAutosave(e) {
  const t = document.getElementById("autosaveIndicator"),
    n = document.getElementById("autosaveText");
  t.className = "autosave-indicator", clearTimeout(asHide), "saving" === e ? (t.classList.add("saving"), n.textContent = "Ukladam...") : "saved" === e ? (t.classList.add("saved"), n.textContent = "✓ Ulozeno", asHide = setTimeout(() => t.style.opacity = "0.2", 2200)) : t.style.opacity = "0.2"
}

function getWatched() {
  return safeLS(uKey("mf_watched"), "{}")
}

function saveWatched(e) {
  showAutosave("saving"), safeSetItem(uKey("mf_watched"), JSON.stringify(e)), clearTimeout(asTimer), asTimer = setTimeout(() => showAutosave("saved"), 280)
}
// ══ TMDB CACHE S LRU A TIMESTAMP ══
const _tmdbMemCache = new Map();
const TMDB_CACHE_MAX = 100;
const TMDB_CACHE_TTL = 30 * 60 * 1000; // 30 minut

function _tmdbMemSet(key, value) {
  // TTL-based cleanup
  const now = Date.now();
  for (const [k, v] of _tmdbMemCache) {
    if (now - v._ts > TMDB_CACHE_TTL) _tmdbMemCache.delete(k);
  }
  // LRU cleanup when full
  if (_tmdbMemCache.size >= TMDB_CACHE_MAX) {
    const firstKey = _tmdbMemCache.keys().next().value;
    _tmdbMemCache.delete(firstKey);
  }
  _tmdbMemCache.set(key, { data: value, _ts: now });
}

function _tmdbMemGet(key) {
  const entry = _tmdbMemCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry._ts > TMDB_CACHE_TTL) {
    _tmdbMemCache.delete(key);
    return null;
  }
  return entry.data;
}

// ══ PROXY CONFIG - Pro server-side API volání ══
// Nastaveno na Cloudflare Pages Functions
window.MF_PROXY = {
  enabled: false,  // ← ZMĚŇ NA true PRO CLOUDFLARE
  baseUrl: '/api', // ← Cloudflare Pages: /api/tmdb
  // Pro externí server použij: baseUrl: 'https://tvuj-server.cz/api'
  tmdbEndpoint: '/tmdb',
  firebaseEndpoint: '/firebase'
};

// ══ PROXY INSTALACE (Cloudflare Pages) ══
// 1. Vytvoř: functions/api/tmdb/[[catchall]].js
// 2. wrangler secret put TMDB_KEY
// 3. Push na GitHub → auto deploy

async function tmdbGet(e, forceDirect = false) {
  // Automaticky použít proxy pokud je povolena (pokud forceDirect není true)
  const useProxy = window.MF_PROXY?.enabled && !forceDirect;

  if (useProxy) {
    try {
      // Sestavit proxy URL
      // baseUrl = '/api' (nebo 'https://server.cz/api')
      // endpoint = '/tmdb'
      // path = 'tv/456'
      // Výsledek: /api/tmdb?path=tv/456
      const base = window.MF_PROXY.baseUrl || '';
      const endpoint = window.MF_PROXY.tmdbEndpoint || '/tmdb';
      // Přidat trailing slash k base pokud chybí a endpoint nezačíná na /
      const baseWithSlash = base && !base.endsWith('/') ? base + '/' : base;
      const endpointClean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const cleanPath = e.startsWith('/') ? e.slice(1) : e;
      const proxyUrl = `${baseWithSlash}${endpointClean}?path=${encodeURIComponent(cleanPath)}`;

      const cached = _tmdbMemGet(proxyUrl);
      if (cached) return cached;

      const resp = await mfFetch(proxyUrl);
      if (!resp.ok) {
        console.warn("[TMDB-Proxy] HTTP error:", resp.status, resp.statusText);
        // ⚠️ FALLBACK: Pokud proxy selže, zkusíme přímé volání
        console.info("[TMDB] Fallback to direct API");
        return tmdbGet(e, true); // forceDirect = true
      }
      const data = await resp.json();
      if (!data) return null;
      _tmdbMemSet(proxyUrl, data);
      return data;
    } catch (err) {
      console.error("[TMDB-Proxy] Fetch error:", err.message, "- fallback to direct");
      // FALLBACK: Network error - zkusíme přímé volání
      return tmdbGet(e, true);
    }
  }

  // Standardní přímé volání (pokud proxy není povolena)
  try {
    const t = e.startsWith("http") ? e : `${TMDB}${e}`,
      n = new URL(t);
    n.searchParams.has("api_key") || n.searchParams.set("api_key", TMDB_KEY), n.searchParams.has("language") || n.searchParams.set("language", "cs-CZ");
    const o = n.toString();
    const cached = _tmdbMemGet(o);
    if (cached) return cached;
    const i = await mfFetch(o);
    if (!i.ok) {
      console.warn("[TMDB] HTTP error:", i.status, i.statusText);
      return null;
    }
    const a = await i.json();
    // Validate response
    if (!a || typeof a !== 'object') {
      console.warn("[TMDB] Invalid response structure");
      return null;
    }
    _tmdbMemSet(o, a);
    return a
  } catch (e) {
    console.error("[TMDB] Fetch error:", e.message);
    return null
  }
}

async function mfFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
async function fetchTmdbSeason(e, t) {
  const n = `${e}-S${t}`;
  if (void 0 !== tmdbCache[n]) return tmdbCache[n];
  try {
    const o = await tmdbGet(`/tv/${db[e].tmdbId}/season/${t}`);
    return tmdbCache[n] = o ? o.episodes.map(e => ({
      ep: e.episode_number,
      name: e.name || `Epizoda ${e.episode_number}`,
      still: e.still_path ? IMG + e.still_path : null,
      stillS: e.still_path ? IMG_S + e.still_path : null
    })) : null, tmdbCache[n]
  } catch {
    return tmdbCache[n] = null, null
  }
}
async function getTmdbStill(e, t, n) {
  const o = await fetchTmdbSeason(e, t);
  if (!o) return null;
  const i = o.find(e => e.ep === n);
  return i ? i.stillS || i.still : null
}
async function fetchTmdbDetails(e) {
  if (!db[e]) return null;
  try {
    const t = await tmdbGet(`/tv/${db[e].tmdbId}`);
    return t ? {
      poster: t.poster_path ? IMG_P + t.poster_path : null,
      backdrop: t.backdrop_path ? IMG_B + t.backdrop_path : null,
      genres: t.genres || [],
      rating: t.vote_average || 0
    } : null
  } catch {
    return null
  }
}
async function loadTmdbTileImages() {
  for (const e of Object.keys(db)) {
    const t = document.querySelector(`.ps-tile-wrapper[data-slug="${e}"]`);
    if (!t) continue;
    const n = await fetchTmdbDetails(e);
    if (n) {
      const o = t.querySelector(".tile-bg");
      if (o) {
        const t = e => new Promise(t => {
            const n = new Image;
            n.onload = () => t(e), n.onerror = () => t(null), n.src = e
          }),
          i = n.backdrop ? await t(n.backdrop) || await t(db[e]._poster || db[e].poster || "") || "" : await t(db[e]._poster || db[e].poster || "") || "";
        i && (o.src = i, o.complete && o.naturalWidth ? o.classList.add("loaded") : o.addEventListener("load", () => o.classList.add("loaded"), {
          once: !0
        }))
      }
      db[e]._backdrop = n.backdrop, db[e]._poster = n.poster, db[e]._rating = n.rating || 0, n.genres.length && (db[e]._genres = n.genres.map(e => e.name))
    } else {
      const n = t.querySelector(".tile-bg"),
        o = db[e]._poster || db[e].poster || "";
      n && o && (n.src = o, n.addEventListener("load", () => n.classList.add("loaded"), {
        once: !0
      }))
    }
  }
}
async function loadForYouTile() {
  const e = document.getElementById("forYouInner");
  if (!e) return;
  const t = void 0 !== aiBrain && aiBrain?.memory?.genrePreferences || {},
    n = Object.entries(t).sort((e, t) => t[1] - e[1]).slice(0, 3).map(([e]) => e);
  n.length || n.push("drama", "akcni", "sci-fi");
  const o = n[Math.floor(Math.random() * n.length)],
    i = TMDB_GENRE_MAP[o] || 18,
    a = o.charAt(0).toUpperCase() + o.slice(1),
    s = Math.floor(5 * Math.random()) + 1,
    r = Math.random() > .35 ? "tv" : "movie";
  window._forYouSeen || (window._forYouSeen = new Set);
  const l = new Set(Object.values(db).map(e => e.tmdbId));
  try {
    const t = "tv" === r ? `/discover/tv?with_genres=${i}&sort_by=vote_average.desc&vote_count.gte=200&page=${s}&language=cs` : `/discover/movie?with_genres=${i}&sort_by=vote_average.desc&vote_count.gte=500&page=${s}&language=cs`,
      n = await tmdbGet(t);
    if (!n?.results?.length) return void renderForYouFallback(e);
    const o = n.results.filter(e => e.poster_path && !l.has(e.id) && !window._forYouSeen.has(e.id)),
      c = o.length ? o : n.results.filter(e => e.poster_path && !l.has(e.id));
    if (!c.length) return void renderForYouFallback(e);
    const d = c[Math.floor(Math.random() * Math.min(8, c.length))];
    window._forYouSeen.add(d.id);
    const m = d.name || d.title || d.original_name || "?";
    _forYouSeries = {
      tmdbId: d.id,
      name: m,
      mediaType: r,
      backdrop: d.backdrop_path ? IMG_B + d.backdrop_path : null,
      poster: d.poster_path ? IMG_P + d.poster_path : null,
      genre: a,
      overview: d.overview || "",
      rating: d.vote_average ? d.vote_average.toFixed(1) : null,
      year: (d.first_air_date || d.release_date || "").slice(0, 4)
    }, e.innerHTML = `\n      <img class="fyi-bg" src="${_forYouSeries.backdrop||_forYouSeries.poster||""}" alt="" onerror="this.style.display='none'">\n      <div class="fyi-gradient"></div>\n      <div class="fyi-badge-wrap">\n            <div class="fyi-badge">✦ Doporučení</div>\n        ${_forYouSeries.rating?`<div class="fyi-rating">★ ${_forYouSeries.rating}</div>`:""}\n      </div>\n      <div class="fyi-title">${m}</div>\n      <div class="fyi-genre">${a} · ${"tv"===r?"Seriál":"Film"}${_forYouSeries.year?" · "+_forYouSeries.year:""}</div>`
  } catch (t) {
    renderForYouFallback(e)
  }
}

function renderForYouFallback(e) {
  _forYouSeries = {
    name: "Objevi neco",
    genre: "Doporučení",
    tmdbId: 0
  }, e.innerHTML = '<div class="fyi-loading"><div style="font-size:2rem;">🎲</div><div class="fyi-loading-text">Doporučení</div></div>'
}

function openForYouSeries() {
  _forYouSeries && openWithCopy(_forYouSeries.name, _forYouSeries.mediaType || "tv")
}

function rerollForYou() {
  loadForYouTile()
}

function calcProgress(e) {
  const t = getWatched(),
    n = totalSeasons(e);
  let o = 0,
    i = 0;
  for (let a = 1; a <= n; a++) {
    const n = epsInSeason(e, a);
    for (let s = 1; s <= n; s++) o++, t[`${e}-S${a}-E${s}`] && i++
  }
  return {
    total: o,
    seen: i,
    pct: o ? Math.round(i / o * 100) : 0
  }
}

function findNextEp(e) {
  const t = getWatched(),
    n = totalSeasons(e);
  for (let o = 1; o <= n; o++)
    for (let n = 1; n <= epsInSeason(e, o); n++)
      if (!t[`${e}-S${o}-E${n}`]) return {
        se: o,
        ep: n,
        uid: `${e}-S${o}-E${n}`
      };
  return null
}

function updateTileProgress(e) {
  const t = document.getElementById(`prog-${e}`);
  t && (t.style.width = calcProgress(e).pct + "%")
}

function updateContinueBadge(e) {
  const t = document.getElementById(`cont-${e}`),
    n = document.getElementById(`cont-text-${e}`);
  if (!t || !n) return;
  const o = findNextEp(e),
    {
      seen: i
    } = calcProgress(e);
  o && i > 0 ? (n.textContent = `S${o.se}·E${o.ep}`, t.classList.add("visible")) : t.classList.remove("visible")
}

function updatePanelProgress() {
  const {
    total: e,
    seen: t,
    pct: n
  } = calcProgress(activeSeries);
  const o = findNextEp(activeSeries);
  document.getElementById("panelProgressFill").style.width = n + "%", document.getElementById("panelProgressText").textContent = `${t} / ${e} videno${o && t ? ` · Další S${o.se} E${o.ep}` : ""}`, "function" == typeof _epRatingRefreshPanel && _epRatingRefreshPanel(activeSeries)
}

function calcTotalProgress() {
  const e = getWatched();
  let t = 0,
    n = 0;
  for (const o of Object.keys(db)) {
    const i = totalSeasons(o);
    for (let a = 1; a <= i; a++) {
      const i = epsInSeason(o, a);
      for (let s = 1; s <= i; s++) t++, e[`${o}-S${a}-E${s}`] && n++
    }
  }
  return {
    total: t,
    seen: n,
    pct: t ? Math.round(n / t * 100) : 0
  }
}

function updateLogoProgress() {
  const {
    pct: e
  } = calcTotalProgress();
  document.getElementById("logoProgressFill").style.width = e + "%", document.getElementById("logoProgressText").textContent = e + "%"
}! function() {
  const e = {
    "the-simpsons": "#f5c518",
    "family-guy": "#1a73e8",
    "south-park": "#ff6b35",
    futurama: "#7c4dff"
  };
  Object.entries({
    "the-simpsons": "/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg",
    "family-guy": "/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg",
    "south-park": "/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg",
    futurama: "/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg"
  }).forEach(([t, n]) => {
    const o = document.getElementById("tile-bg-" + t);
    if (!o) return;
    const i = void 0 !== db && db[t] ? db[t].name : t,
      a = e[t] || "#333",
      s = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="${a}22"/><rect width="300" height="450" fill="url(%23g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></linearGradient></defs><text x="150" y="220" text-anchor="middle" fill="white" font-size="18" font-family="sans-serif" font-weight="bold">${i}</text></svg>`)}`;
    o.onerror = () => {
      o.src = s, o.onerror = null, o.classList.add("loaded")
    }, o.src = "https://image.tmdb.org/t/p/w500" + n, o.complete && o.naturalWidth > 0 ? o.classList.add("loaded") : o.addEventListener("load", () => o.classList.add("loaded"), {
      once: !0
    })
  })
}();
function updateContinueWidget() {
  /* no-op — #continueWidget bylo nahrazeno #mfhContinue v home.js (viz skupina K) */
}

function showToast(e, t) {
  let n = document.getElementById("mf-toast");
  n || (n = document.createElement("div"), n.id = "mf-toast", n.setAttribute("role", "status"), n.setAttribute("aria-live", "polite"), n.style.cssText = "position:fixed;bottom:85px;left:50%;transform:translateX(-50%) translateY(12px);z-index:99999;background:rgba(10,10,12,0.96);color:#fff;font-family:'Outfit',sans-serif;font-weight:700;font-size:0.8rem;padding:10px 22px;border-radius:50px;opacity:0;transition:opacity 0.25s,transform 0.3s cubic-bezier(0.34,1.4,0.64,1),border-color 0.2s;pointer-events:none;backdrop-filter:blur(20px);white-space:nowrap;max-width:90vw;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.7);", document.body.appendChild(n)), n.style.border = "1px solid " + ("success" === t ? "rgba(100,255,120,0.5)" : "error" === t ? "rgba(255,80,80,0.5)" : "rgba(0,122,255,0.25)"), n.textContent = e, n.style.opacity = "1", n.style.transform = "translateX(-50%) translateY(0)", clearTimeout(n._tm), n._tm = setTimeout(() => {
    n.style.opacity = "0", n.style.transform = "translateX(-50%) translateY(8px)"
  }, "error" === t ? 3500 : 2400)
}
let _searchPlatform = "movies",
  _shType = "all",
  _uniGenre = "",
  _uniGenreType = "all",
  _shCurrentItems = [],
  _shPreviewItem = null,
  _shFocusIdx = -1,
  _searchDebounce = null,
  _uniPage = 1,
  _uniTotalPages = 1,
  _uniSelectedVariant = null,
  _discoCurrent = {
    genre: "",
    type: "tv"
  };

function openUniverse() {
  const e = document.getElementById("universeOverlay");
  document.body.classList.add("discover-open"), e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => {
    e.classList.add("visible");
    const t = document.getElementById("searchTitleInput");
    t && (renderSearchHistory(), setTimeout(() => t.focus(), 40));
  })), kbLayer = "search", pauseBgParticles();
  const t = document.getElementById("discoBody");
  t && t.querySelector(".disco-loading") && loadDiscoContent(_discoCurrent.genre, _discoCurrent.type)
}

function openSearch() {
  openUniverse()
}

function openDiscover() {
  openUniverse()
}

function closeUniverse() {
  const e = document.getElementById("universeOverlay");
  document.body.classList.remove("discover-open"), e.classList.remove("visible"), setTimeout(() => {
    e.classList.remove("open")
  }, 350), kbLayer = "menu", resumeBgParticles();
  const t = document.getElementById("searchTitleInput");
  t && (t.value = "");
  const n = document.getElementById("shClearBtn");
  n && (n.style.display = "none")
}

function closeSearch() {
  closeUniverse()
}

function closeDiscover() {
  closeUniverse()
}

function clearSearch() {
  const e = document.getElementById("searchTitleInput");
  e && (e.value = "", e.focus());
  const t = document.getElementById("shClearBtn");
  t && (t.style.display = "none"), renderSearchHistory(), loadDiscoContent(_discoCurrent.genre, _discoCurrent.type)
}

function discoFilter(e, t, n) {
  document.querySelectorAll(".disco-nav-item").forEach(e => e.classList.remove("active")), e.classList.add("active"), _discoCurrent = {
    genre: t,
    type: n
  };
  const o = document.getElementById("searchTitleInput");
  o && (o.value = "");
  const i = document.getElementById("shClearBtn");
  i && (i.style.display = "none"), loadDiscoContent(t, n)
}

function handleSearchInputKey(e) {
  "Escape" !== e.key || closeUniverse()
}

const MF_SEARCH_HISTORY_KEY = "mf_search_history";
function getSearchHistory() {
  const e = safeLS(MF_SEARCH_HISTORY_KEY, "[]");
  return Array.isArray(e) ? e.filter(t => typeof t === "string" && t.trim()).slice(0, 6) : [];
}
function renderSearchHistory() {
  /* no-op — historie vyhledávání vypnuta na přání uživatele */
}
function saveSearchHistory(e) {
  /* no-op — historie vyhledávání vypnuta na přání uživatele, nic se neukládá */
}

function onSearchInput(e) {
  const t = document.getElementById("shClearBtn");
  const n = document.getElementById("mfSearchHistory");
  t && (t.style.display = e ? "flex" : "none"), n && (n.style.display = e.trim() ? "none" : ""), clearTimeout(_searchDebounce), e.trim() ? _searchDebounce = setTimeout(() => discoSearch(e.trim()), 320) : loadDiscoContent(_discoCurrent.genre, _discoCurrent.type)
}
async function discoSearch(e) {
  const t = document.getElementById("discoBody");
  if (t) {
    saveSearchHistory(e);
    t.innerHTML = '<div class="disco-loading"><div class="disco-spinner"></div><span>Hledám...</span></div>';
    try {
      const [n, o] = await Promise.all([tmdbGet(`/search/movie?query=${encodeURIComponent(e)}&language=cs`), tmdbGet(`/search/tv?query=${encodeURIComponent(e)}&language=cs`)]), i = (n?.results || []).filter(e => e.poster_path).map(e => ({
        ...e,
        _rowType: "movie"
      })), a = (o?.results || []).filter(e => e.poster_path).map(e => ({
        ...e,
        _rowType: "tv"
      }));
      t.innerHTML = "", i.length && (renderDiscoRow(t, `🎬 Filmy (${i.length}) — <span class="disco-search-query">"${escapeHTML(e)}"</span>`, i.slice(0, 20), "movie"), t.lastElementChild?.classList.add("disco-search-section")), a.length && (renderDiscoRow(t, `📺 Seriály (${a.length}) — <span class="disco-search-query">"${escapeHTML(e)}"</span>`, a.slice(0, 20), "tv"), t.lastElementChild?.classList.add("disco-search-section")), i.length || a.length || (t.innerHTML = `<div class="mf-search-empty"><div class="mf-search-empty-icon">⌕</div><strong>Nic jsme nenašli</strong><span>Zkus jiný název nebo filtr.</span><button type="button" onclick="clearSearch()">Zobrazit doporučení</button></div>`)
    } catch {
      t.innerHTML = '<div class="disco-loading">Chyba při hledání</div>'
    }
  }
}
const TMDB_GENRE_CS = {
    28: "Akce",
    12: "Dobrodružství",
    16: "Animák",
    35: "Komedie",
    80: "Krimi",
    99: "Dokument",
    18: "Drama",
    10751: "Rodinné",
    14: "Fantasy",
    36: "Historie",
    27: "Horor",
    10402: "Hudba",
    9648: "Mystérium",
    10749: "Romantika",
    878: "Sci-Fi",
    10770: "TV film",
    53: "Thriller",
    10752: "Válečný",
    37: "Western",
    10759: "Akce & Dobrodružství",
    10762: "Dětský",
    10763: "Zpravodajství",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Telenovela",
    10767: "Talk show",
    10768: "Válka & Politika"
  },
  TMDB_ID_TO_CZKEY = {
    28: "akcni",
    12: "dobrodruzny",
    16: "animovany",
    35: "komedie",
    80: "krimi",
    99: "dokument",
    18: "drama",
    10751: "rodinny",
    14: "fantasy",
    36: "historicky",
    27: "horor",
    10402: "hudba",
    9648: "krimi",
    10749: "romantika",
    878: "sci-fi",
    53: "napinavy",
    10752: "valecny",
    37: "western",
    10759: "akcni",
    10762: "detsky",
    10764: "reality",
    10765: "sci-fi",
    10768: "valecny"
  };

function _computeWatchMomentum() {
  try {
    const e = safeLS(uKey("mf_watch_timeline"), "[]"),
      t = Date.now() - 6048e5,
      n = e.filter(e => e.ts > t),
      o = {};
    return n.forEach(e => {
      const t = (Date.now() - e.ts) / 6048e5,
        n = Math.exp(2 * -t);
      (e.genres || []).forEach(e => {
        o[e] = (o[e] || 0) + n
      })
    }), o
  } catch {
    return {}
  }
}

function _computePersonalRatingSignal() {
  try {
    const e = safeLS(uKey("mf_ratings"), "{}"),
      t = {};
    Object.values(e).forEach(e => {
      const n = "loved" === e.rating ? 1.5 : "liked" === e.rating ? .8 : "ok" === e.rating ? .2 : -.5;
      (e.genres || []).forEach(e => {
        t[e] = (t[e] || 0) + n
      })
    });
    const n = Math.max(1, Math.max(...Object.values(t).map(Math.abs)));
    return Object.keys(t).forEach(e => t[e] = t[e] / n), t
  } catch {
    return {}
  }
}
let _momentumCache = null,
  _momentumTs = 0,
  _ratingSignalCache = null,
  _ratingSignalTs = 0;

function getMomentumCached() {
  return (!_momentumCache || Date.now() - _momentumTs > 6e4) && (_momentumCache = _computeWatchMomentum(), _momentumTs = Date.now()), _momentumCache
}

function getRatingSignalCached() {
  return (!_ratingSignalCache || Date.now() - _ratingSignalTs > 6e4) && (_ratingSignalCache = _computePersonalRatingSignal(), _ratingSignalTs = Date.now()), _ratingSignalCache
}

function recordWatchToTimeline(e, t) {
  try {
    const n = safeLS(uKey("mf_watch_timeline"), "[]");
    n.push({
      ts: Date.now(),
      slug: e,
      genres: t || []
    }), n.length > 500 && n.splice(0, n.length - 500), localStorage.setItem(uKey("mf_watch_timeline"), JSON.stringify(n)), _momentumCache = null
  } catch {}
}

function computeAiScore(e) {
  const t = aiBrain?.memory || {},
    n = getActiveProfile(),
    o = t.genreIdPrefs || {},
    i = t.genrePreferences || {},
    a = n?.likedGenres || [],
    s = t.ratedGenres || {},
    r = t.watchedTmdbIds || {},
    l = t.watchedSlugs || {},
    c = t.sessionGenres || [],
    d = getMomentumCached(),
    m = getRatingSignalCached(),
    u = e.genre_ids || [],
    p = [];
  let g = 0,
    f = 0,
    y = 0,
    h = 0,
    v = 0,
    b = !1,
    w = 0;
  u.forEach(e => {
    if (o[e]) {
      g += o[e];
      const t = TMDB_GENRE_CS[e];
      t && !p.includes(t) && p.push(t)
    }
    const t = TMDB_ID_TO_CZKEY[e];
    if (t && i[t]) {
      f += i[t];
      const n = TMDB_GENRE_CS[e];
      n && !p.includes(n) && p.push(n)
    }
    if (a.includes(e)) {
      y += 1;
      const t = TMDB_GENRE_CS[e];
      t && !p.includes(t) && p.push(t)
    }
    if (d[e]) {
      h += d[e];
      const t = TMDB_GENRE_CS[e];
      t && !p.includes(t) && p.push(t)
    }
    if (m[e] && (v += m[e]), s[e]) {
      const t = s[e].disliked || 0;
      t >= 2 && (b = !0, w = Math.max(w, t))
    }
  });
  const _ = e.vote_average || 0,
    S = e.vote_count || 0,
    k = S > 0 ? (3500 + S * _) / (500 + S) : 7,
    x = k >= 5 ? Math.pow(Math.max(0, k - 5) / 5, 1.3) : 0,
    E = e.release_date || e.first_air_date || "",
    I = E ? parseInt(E.slice(0, 4)) : 0,
    T = (new Date).getFullYear(),
    C = T - I,
    B = I > 0 ? .8 * Math.max(0, 1 - C / 10) : 0,
    L = c.map(e => aiBrain._tmdbMap?.(e) || e.toLowerCase().replace(/\s+/g, "-")),
    P = u.filter(e => {
      const t = TMDB_ID_TO_CZKEY[e];
      return t && L.includes(t)
    }),
    A = P.length > 0 ? Math.min(.9, .4 + .2 * P.length) : 0,
    M = Math.min(1, Math.log10(Math.max(1, S)) / 5);
  let $ = 0;
  try {
    const e = safeLS(uKey("mf_recent_views"), "[]"),
      t = Date.now() - 18e5,
      n = new Set;
    e.filter(e => e.ts > t).forEach(e => (e.genres || []).forEach(e => n.add(e)));
    const o = u.filter(e => n.has(e)).length;
    $ = Math.min(.8, .3 * o)
  } catch {}
  const F = Math.max(1, Object.values(o).reduce((e, t) => e + t, 0) / Math.max(1, Object.keys(o).length) * 3),
    z = Math.min(1, g / F),
    R = Math.min(1, f / .8),
    j = Math.min(1, y / 3),
    O = Math.min(1, h / 3),
    D = Math.min(1, Math.max(-1, v)),
    N = .3 * z + .2 * R + .12 * j + .08 * x + .05 * B + .04 * A + .06 * O + .08 * Math.max(0, D) + .03 * M + .04 * $;
  let W = 0;
  e.id && r[e.id] && (W += .35), b && (W += .15 + Math.min(.1, .03 * w)), D < -.3 && (W += .1);
  const G = Object.keys(db || {}).find(t => {
    const n = db[t];
    return n?.name && (e.name || e.title) && n.name.toLowerCase() === (e.name || e.title || "").toLowerCase()
  });
  G && l[G] >= 3 && (W += .2), _ > 0 && _ < 5.5 && S > 100 && (W += .15), I > 0 && I < 1980 && (W += .1), e.adult && (W += .4);
  const H = .05 * (Math.random() - .5),
    K = Math.max(0, N - W + H),
    q = Math.min(100, Math.round(100 * K));
  let U = null;
  const Y = [],
    V = p[0],
    lastName = t.lastWatchedName,
    lastGenres = t.lastWatchedGenres || [],
    lastSlug = t.lastWatchedSlug,
    sharesWithLast = lastName && lastGenres.length && p.some(g => lastGenres.includes(g)) && G !== lastSlug;
  return sharesWithLast && Y.push({
    label: `Protože jsi sledoval "${lastName}"`,
    strength: .35
  }), O > .4 && V && Y.push({
    label: `Tvůj trend: ${V}`,
    strength: .06 * O
  }), z + R > .25 && V && Y.push({
    label: `Tvůj oblíbený žánr: ${V}`,
    strength: .3 * z + .2 * R
  }), $ > .4 && V && Y.push({
    label: "Podobné tomu, co jsi prohl. dnes",
    strength: .04 * $
  }), A > .3 && V && Y.push({
    label: `Odpovídá dnešní náladě: ${V}`,
    strength: .04 * A
  }), D > .5 && Y.push({
    label: "Tvoje oblíbená kategorie ❤️",
    strength: .08 * D
  }), j > .3 && Y.push({
    label: "Odpovídá tvé historii",
    strength: .12 * j
  }), k >= 8 && Y.push({
    label: `Hvězdné hodnocení: ★${k.toFixed(1)}`,
    strength: .08 * x
  }), B > .6 && I >= T - 1 && Y.push({
    label: `Čerstvá novinka ${I} 🆕`,
    strength: .05 * B
  }), S > 5e3 && Y.push({
    label: "Sledují tisíce lidí 🔥",
    strength: .03 * M
  }), Y.sort((e, t) => t.strength - e.strength), Y.length && (U = Y[0].label), {
    score: q,
    matchedCzNames: p,
    whyLabel: U,
    signals: {
      A: z,
      B: R,
      C: j,
      D: x,
      E: B,
      F: A,
      G: O,
      H: D,
      I: M,
      J: $
    }
  }
}

function scoreAndSortItems(e) {
  if (!e?.length) return [];
  const t = e.map(e => {
    const t = computeAiScore(e);
    return {
      item: e,
      score: t.score,
      whyLabel: t.whyLabel,
      signals: t.signals
    }
  });
  t.sort((e, t) => t.score - e.score);
  const n = [],
    o = {},
    i = {
      movie: 0,
      tv: 0
    };
  for (const e of t) {
    const t = (e.item.genre_ids || [])[0] || "unknown",
      a = e.item._rowType || (e.item.title ? "movie" : "tv"),
      s = "movie" === a ? "tv" : "movie";
    o[t] = o[t] || 0;
    const r = (i[a] || 0) - (i[s] || 0) > 8;
    if (o[t] < 3 && !r && (n.push(e), o[t]++, i[a] = (i[a] || 0) + 1), n.length >= 30) break
  }
  if (n.length < 16)
    for (const e of t)
      if (n.find(t => t.item.id === e.item.id) || n.push(e), n.length >= 24) break;
  if (n.length > 8)
    for (let e = 0; e < 3; e++) {
      const e = Math.floor(5 * Math.random()),
        t = 5 + Math.floor(5 * Math.random()),
        o = (n[e]?.score || 0) - (n[t]?.score || 0);
      Math.abs(o) < 15 && n[e] && n[t] && ([n[e], n[t]] = [n[t], n[e]])
    }
  return n
}

function renderPersonalisedRow(e, t, n) {
  if (!t || !t.length) return;
  const o = scoreAndSortItems(t),
    i = getActiveProfile(),
    a = i?.color || "#007AFF",
    s = document.createElement("div");
  s.className = "disco-section";
  const r = document.createElement("div");
  r.className = "disco-row";
  const l = document.createElement("div");
  l.className = "disco-row-header", l.innerHTML = `\n        <div class="disco-row-title">\n            ✦ Doporučení\n          <span class="drt-tag">AI VÝBĚR</span>\n        </div>\n        <div class="disco-row-nav" style="gap:8px;align-items:center;">\n          <button onclick="refreshPersonalisedRow()" style="font-size:0.52rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${a};background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.2);border-radius:20px;padding:5px 12px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(0,122,255,0.15)'" onmouseout="this.style.background='rgba(0,122,255,0.07)'">\n            ↻ Nová doporučení\n          </button>\n          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,-1)">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>\n          </button>\n          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,1)">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>\n          </button>\n        </div>`;
  const c = document.createElement("div");
  c.className = "disco-row-scroll", c.id = "personalisedRowScroll", o.slice(0, 24).forEach(({
    item: e,
    score: t,
    whyLabel: o
  }) => {
    const i = e.name || e.title || "",
      s = e.original_name || e.original_title || i,
      r = i || s,
      l = _isNonLatin(i) && s && !_isNonLatin(s) ? s : i,
      d = e.vote_average ? e.vote_average.toFixed(1) : "",
      m = e.poster_path ? `https://image.tmdb.org/t/p/w342${e.poster_path}` : e.poster || "",
      u = e._rowType || n || (e.title ? "movie" : "tv"),
      p = null !== t && t > 0,
      g = document.createElement("div");
    g.className = "disco-card ai-match-card", g.style.position = "relative";
    const f = p ? `\n          <div class="ai-match-badge" style="\n            position:absolute;top:8px;left:8px;z-index:15;\n            background:linear-gradient(135deg,rgba(10,132,255,0.92),rgba(0,90,200,0.88));\n            color:#fff;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:0.48rem;font-weight:900;\n            letter-spacing:0.5px;padding:3px 7px;border-radius:6px;\n            box-shadow:0 0 0 1px rgba(10,132,255,0.35),0 2px 8px rgba(0,0,0,0.45);\n            animation:none;\n            pointer-events:none;\n          ">${t}% Shoda</div>` : "";
    if (g.innerHTML = `\n          ${f}\n          <img class="disco-card-img" src="${m}" alt="" loading="lazy">\n          <div class="disco-card-overlay"></div>\n          <div class="disco-play-btn"><svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11"/></svg></div>\n          <div class="disco-card-finder-btn" title="Najít kde sledovat" onclick="event.stopPropagation();verifyAndOpen('${l.replace(/'/g,"'")}','${u}','${(e.release_date||e.first_air_date||"").slice(0,4)}')">\n            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>\n          </div>\n          <div class="disco-card-glow"></div>\n          <div class="disco-card-info">\n            <div class="disco-card-name">${r}</div>\n            ${o?`<div style="font-size:0.42rem;color:${a}cc;margin-bottom:4px;font-weight:700;letter-spacing:0.3px;line-height:1.3;">💡 ${o}</div>`:""}\n            <div class="disco-card-meta">\n              <span class="disco-card-type">${"movie"===u?"🎬 Film":"📺 Seriál"}</span>\n              ${d?`<span class="disco-card-rating">★ ${d}</span>`:""}\n            </div>\n          </div>`, g.onclick = () => {
        e.id && (aiBrain.boostGenreIds(e.genre_ids || [], .05), aiBrain.recordTmdbSeen(e.id)), e.id ? (window._mfFinderTmdbId = e.id, window._cinYear = (e.release_date || e.first_air_date || "").slice(0, 4) || null, "tv" === u ? openDiscoverTv(e.id, r) : _showCinemaOrFinderChoice(e.id, r, u, null)) : (closeUniverse(), window._mfFinderTmdbId = null, openWithCopy(l, u, (e.release_date || e.first_air_date || "").slice(0, 4) || null))
      }, TMDB_KEY && e.id) {
      const t = document.createElement("div");
      t.style.cssText = "position:absolute;inset:0;z-index:8;pointer-events:none;border-radius:20px;overflow:hidden;opacity:0;background:#000;transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1);", g.appendChild(t), g.addEventListener("mouseenter", () => {
        g._t = setTimeout(async () => {
          if (!g.matches(":hover")) return;
          const n = await getTrailerKey(e.id, u);
          n && g.matches(":hover") && !t.querySelector("iframe") && (t.innerHTML = `<div style="width:100%;height:100%;position:relative;overflow:hidden;"><iframe src="https://www.youtube-nocookie.com/embed/${n}?autoplay=1&mute=1&controls=0&loop=1&playlist=${n}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=8&vq=hd720&hl=cs&widget_referrer=mujflix&enablejsapi=1&origin=https://mujflix.cz" style="position:absolute;top:50%;left:50%;width:350%;height:350%;transform:translate(-50%,-50%);border:none;pointer-events:none;display:block;" allow="autoplay;encrypted-media"></iframe><div style="position:absolute;inset:0;z-index:20;pointer-events:none;background:transparent;"></div><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.18) 38%,transparent 60%);pointer-events:none;border-radius:20px;"></div></div>`, t.style.opacity = "1")
        }, 900)
      }), g.addEventListener("mouseleave", () => {
        clearTimeout(g._t), t.style.opacity = "0", setTimeout(() => {
          t.innerHTML = ""
        }, 650)
      })
    }
    c.appendChild(g)
  }), r.appendChild(l), r.appendChild(c), s.appendChild(r), e.insertBefore(s, e.firstChild)
}

function refreshPersonalisedRow() {
  const e = document.getElementById("discoBody"),
    t = e?.querySelector(".disco-section");
  if (t) {
    const e = t.querySelector(".disco-row-title");
    e && e.textContent.includes("Doporučení") && t.remove()
  }
  loadDiscoContent(_discoCurrent.genre, _discoCurrent.type)
}

function _isNonLatin(e) {
  return /[\u3000-\u9fff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff\u4e00-\u9fff]/.test(e)
}

// MůjFlix — Discover TV → Series Modal
async function openDiscoverTv(tmdbId, title) {
  const slug = '__dtv_' + tmdbId;
  const IMG_P = 'https://image.tmdb.org/t/p/w342';
  const IMG_B = 'https://image.tmdb.org/t/p/w780';
  if (!db[slug]) {
    if (typeof showToast === 'function') showToast('📺 Načítám…', 1800);
    try {
      const d = await tmdbGet('/tv/' + tmdbId + '?language=cs');
      if (!d || d.success === false) throw new Error('no data');
      let svetSlug;
      const orig = d.original_name || '';
      if (orig && !/[　-鿿가-힯؀-ۿЀ-ӿ一-鿿]/.test(orig)) {
        svetSlug = _czSlug(orig);
      } else {
        try {
          const en = await tmdbGet('/tv/' + tmdbId + '?language=en-US');
          svetSlug = _czSlug((en && (en.name || en.original_name)) || d.name || title || '');
        } catch(e2) { svetSlug = _czSlug(d.name || title || ''); }
      }
      const rec = {
        name: d.name || title, tmdbId,
        totalEps: d.number_of_episodes || 0,
        poster: d.poster_path ? IMG_P + d.poster_path : '',
        _poster: d.poster_path ? IMG_P + d.poster_path : '',
        _backdrop: d.backdrop_path ? IMG_B + d.backdrop_path : '',
        _genres: (d.genres || []).map(g => g.name),
        _genreIds: (d.genres || []).map(g => g.id),
        _rating: d.vote_average || 0,
        _svetSlug: svetSlug, _isDiscover: true,
      };
      const seasons = d.seasons || [], ns = d.number_of_seasons || 1;
      for (let s = 1; s <= ns; s++) {
        const sd = seasons.find(x => x.season_number === s);
        const ec = sd && sd.episode_count ? sd.episode_count : 1;
        for (let e = 1; e <= ec; e++) rec[slug+'-S'+s+'-E'+e] = { se: s, ep: e };
      }
      db[slug] = rec;
    } catch(err) {
      console.error('[openDiscoverTv]', err);
      if (typeof showToast === 'function') showToast('⚠ Nepodařilo se načíst', 3000);
      return;
    }
  }
  if (typeof closeUniverse === 'function') closeUniverse();
  setTimeout(() => { if (typeof openSeries === 'function') openSeries(slug); }, 150);
  const modal = document.getElementById('seriesModal');
  if (modal) {
    const obs = new MutationObserver(() => {
      if (!modal.classList.contains('open') && db[slug]?._isDiscover) {
        delete db[slug]; obs.disconnect();
      }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
}

function renderDiscoRow(e, t, n, o) {
  if (!n || !n.length) return;
  const i = document.createElement("div");
  i.className = "disco-section";
  const a = document.createElement("div");
  a.className = "disco-row";
  const s = document.createElement("div");
  s.className = "disco-row-header", s.innerHTML = `<div class="disco-row-title">${t}</div>\n        <div class="disco-row-nav">\n          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,-1)">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>\n          </button>\n          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,1)">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>\n          </button>\n        </div>`;
  const r = document.createElement("div");
  r.className = "disco-row-scroll", n.forEach(e => {
    const t = e.name || e.title || "",
      n = e.original_name || e.original_title || t,
      i = t || n,
      a = _isNonLatin(t) && n && !_isNonLatin(n) ? n : t,
      s = e.vote_average ? e.vote_average.toFixed(1) : "",
      l = e.poster_path ? `https://image.tmdb.org/t/p/w342${e.poster_path}` : e.poster || "",
      c = e._rowType || o,
      d = document.createElement("div");
    if (d.className = "disco-card", d.innerHTML = `<img class="disco-card-img" src="${l}" alt="" loading="lazy">\n          <div class="disco-card-overlay"></div>\n          <div class="disco-play-btn"><svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11"/></svg></div>\n          <div class="disco-card-finder-btn" title="Najít kde sledovat" onclick="event.stopPropagation();verifyAndOpen('${a.replace(/'/g,"\\'")}','${c}','${(e.release_date||e.first_air_date||"").slice(0,4)}')">\n            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>\n          </div>\n          <div class="disco-card-glow"></div>\n          <div class="disco-card-info">\n            <div class="disco-card-name">${i}</div>\n            <div class="disco-card-meta">\n              <span class="disco-card-type">${"movie"===c?"🎬 Film":"📺 Seriál"}</span>\n              ${s?`<span class="disco-card-rating">★ ${s}</span>`:""}\n            </div>\n          </div>`, d.onclick = () => {
        e.id ? (window._mfFinderTmdbId = e.id, window._cinYear = (e.release_date || e.first_air_date || "").slice(0, 4) || null, "tv" === c ? openDiscoverTv(e.id, i) : _showCinemaOrFinderChoice(e.id, i, c, null)) : (closeUniverse(), window._mfFinderTmdbId = null, openWithCopy(a, c, (e.release_date || e.first_air_date || "").slice(0, 4) || null))
      }, TMDB_KEY && e.id) {
      const t = document.createElement("div");
      t.style.cssText = "position:absolute;inset:0;z-index:8;pointer-events:none;border-radius:20px;overflow:hidden;opacity:0;background:#000;transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1);", d.style.position = "relative", d.appendChild(t), d.addEventListener("mouseenter", () => {
        d._t = setTimeout(async () => {
          if (!d.matches(":hover")) return;
          const n = await getTrailerKey(e.id, c);
          n && d.matches(":hover") && !t.querySelector("iframe") && (t.innerHTML = `<div style="width:100%;height:100%;position:relative;overflow:hidden;"><iframe src="https://www.youtube-nocookie.com/embed/${n}?autoplay=1&mute=1&controls=0&loop=1&playlist=${n}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=8&vq=hd720&hl=cs&widget_referrer=mujflix&enablejsapi=1&origin=https://mujflix.cz" style="position:absolute;top:50%;left:50%;width:350%;height:350%;transform:translate(-50%,-50%);border:none;pointer-events:none;display:block;" allow="autoplay;encrypted-media"></iframe><div style="position:absolute;inset:0;z-index:20;pointer-events:none;background:transparent;"></div><div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.18) 38%,transparent 60%);pointer-events:none;border-radius:20px;"></div></div>`, t.style.opacity = "1")
        }, 900)
      }), d.addEventListener("mouseleave", () => {
        clearTimeout(d._t), t.style.opacity = "0", setTimeout(() => {
          t.innerHTML = ""
        }, 650)
      })
    }
    r.appendChild(d)
  }), a.appendChild(s), a.appendChild(r), i.appendChild(a), e.appendChild(i)
}

function discoScrollRow(e, t) {
  const n = e.closest(".disco-row-header").nextElementSibling;
  n && n.scrollBy({
    left: 152 * t * 3,
    behavior: "smooth"
  })
}
async function tmdbRow(e) {
  try {
    const t = await tmdbGet(e);
    return (t?.results || []).filter(e => e.poster_path)
  } catch {
    return []
  }
}
async function loadDiscoContent(e, t) {
  const n = document.getElementById("discoBody");
  if (!n) return;
  n.innerHTML = '<div class="disco-loading"><div class="disco-spinner"></div><span>Načítám...</span></div>';
  const o = Math.floor(15 * Math.random()) + 1,
      i = Math.floor(10 * Math.random()) + 1;
  let a = [];
  if (TMDB_KEY) try {
    if (e) {
      const [t, n, s, r, l, c] = await Promise.all([tmdbRow("/discover/movie?with_genres=" + e + "&sort_by=popularity.desc&vote_count.gte=30&language=cs&page=" + o), tmdbRow("/discover/movie?with_genres=" + e + "&sort_by=vote_average.desc&vote_count.gte=100&language=cs&page=" + i), tmdbRow("/discover/movie?with_genres=" + e + "&sort_by=release_date.desc&vote_count.gte=10&language=cs&page=1"), tmdbRow("/discover/tv?with_genres=" + e + "&sort_by=popularity.desc&vote_count.gte=20&language=cs&page=" + o), tmdbRow("/discover/tv?with_genres=" + e + "&sort_by=vote_average.desc&vote_count.gte=50&language=cs&page=" + i), tmdbRow("/discover/tv?with_genres=" + e + "&sort_by=release_date.desc&vote_count.gte=10&language=cs&page=1")]);
      a = [], t.length && a.push({
        label: "🔥 Populární filmy",
        items: t.slice(0, 24),
        rowType: "movie"
      }), r.length && a.push({
        label: "📺 Populární seriály",
        items: r.slice(0, 24),
        rowType: "tv"
      }), n.length && a.push({
        label: "⭐ Nejlépe hodnocené filmy",
        items: n.slice(0, 24),
        rowType: "movie"
      }), l.length && a.push({
        label: "⭐ Nejlépe hodnocené seriály",
        items: l.slice(0, 24),
        rowType: "tv"
      }), s.length && a.push({
        label: "🆕 Nejnovější filmy",
        items: s.filter(e => !t.find(t => t.id === e.id)).slice(0, 24),
        rowType: "movie"
      }), c.length && a.push({
        label: "🆕 Nejnovější seriály",
        items: c.filter(e => !r.find(t => t.id === e.id)).slice(0, 24),
        rowType: "tv"
      })
    } else {
      const e = Math.random() > .5 ? "week" : "day",
        [t, n, s, r, l, c, d, m, u, p, g, f, y] = await Promise.all([tmdbRow("/trending/tv/" + e + "?language=cs"), tmdbRow("/tv/top_rated?language=cs&page=" + i), tmdbRow("/tv/on_the_air?language=cs"), tmdbRow("/trending/movie/" + e + "?language=cs"), tmdbRow("/movie/top_rated?language=cs&page=" + i), tmdbRow("/movie/now_playing?language=cs"), tmdbRow("/movie/upcoming?language=cs"), tmdbRow("/discover/movie?with_genres=28&sort_by=popularity.desc&vote_count.gte=100&language=cs&page=" + o), tmdbRow("/discover/tv?with_genres=18&sort_by=vote_average.desc&vote_count.gte=200&language=cs&page=" + i), tmdbRow("/discover/movie?with_genres=27&sort_by=popularity.desc&vote_count.gte=80&language=cs&page=" + o), tmdbRow("/discover/tv?with_genres=9648,27&sort_by=popularity.desc&vote_count.gte=50&language=cs&page=" + i), tmdbRow("/discover/movie?with_genres=35&sort_by=popularity.desc&vote_count.gte=100&language=cs&page=" + o), tmdbRow("/discover/movie?with_genres=878&sort_by=vote_average.desc&vote_count.gte=150&language=cs&page=" + i)]);
      a = [{
        label: "🔥 Trending filmy",
        items: r.slice(0, 24),
        rowType: "movie"
      }, {
        label: "📺 Trending seriály",
        items: t.slice(0, 24),
        rowType: "tv"
      }, {
        label: "🍿 Právě v kinech",
        items: c.filter(e => !r.find(t => t.id === e.id)).slice(0, 24),
        rowType: "movie"
      }, {
        label: "👻 Horor & Thriller filmy",
        items: p.slice(0, 24),
        rowType: "movie"
      }, {
        label: "😱 Děsivé seriály",
        items: g.slice(0, 24),
        rowType: "tv"
      }, {
        label: "⭐ Nejlépe hodnocené seriály",
        items: n.slice(0, 24),
        rowType: "tv"
      }, {
        label: "🏆 Největší filmy všech dob",
        items: l.slice(0, 24),
        rowType: "movie"
      }, {
        label: "💥 Akční filmy",
        items: m.slice(0, 24),
        rowType: "movie"
      }, {
        label: "🚀 Sci-Fi filmy",
        items: y.slice(0, 24),
        rowType: "movie"
      }, {
        label: "😂 Komedie",
        items: f.slice(0, 24),
        rowType: "movie"
      }, {
        label: "🎬 Brzy v kinech",
        items: d.filter(e => e.backdrop_path).slice(0, 24),
        rowType: "movie"
      }, {
        label: "🎭 Nejlepší dramata",
        items: u.slice(0, 24),
        rowType: "tv"
      }, {
        label: "📡 Právě vysílané",
        items: s.filter(e => !t.find(t => t.id === e.id)).slice(0, 24),
        rowType: "tv"
      }]
    }
  } catch (e) {
    console.warn("Disco load error:", e)
  }
  if (n.innerHTML = "", !e && a.length > 0) {
    const e = a.flatMap(e => e.items.map(t => ({
        ...t,
        _rowType: e.rowType
      }))),
      t = new Set,
      o = e.filter(e => !(!e.id || t.has(e.id)) && (t.add(e.id), !0));
    o.length > 0 && renderPersonalisedRow(n, o, "all")
  }
  const s = [...a[0]?.items || [], ...a[1]?.items || []].filter(e => e.backdrop_path),
    r = s[Math.floor(Math.random() * Math.min(12, s.length))];
  if (r) {
    const e = r._rowType || (r.title ? "movie" : "tv"),
      t = r.name || r.title || "",
      o = document.createElement("div");
    o.className = "disco-hero";
    const i = document.createElement("img");
    i.src = "https://image.tmdb.org/t/p/w1280" + r.backdrop_path, i.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;transition:transform 8s ease,opacity 0.8s ease;";
    const a = document.createElement("div");
    a.style.cssText = "position:absolute;inset:0;z-index:2;opacity:0;transition:opacity 0.8s ease;background:#000;overflow:hidden;pointer-events:none;";
    const s = document.createElement("div");
    s.className = "disco-hero-grad", s.style.zIndex = "4";
    const l = document.createElement("div");
    l.className = "disco-hero-content", l.style.zIndex = "5";
    const c = t.replace(/'/g, "\\'"),
      d = r.vote_average ? r.vote_average.toFixed(1) : "",
      m = (r.release_date || r.first_air_date || "").slice(0, 4);
    l.innerHTML = `\n          <div class="disco-hero-badge">\n            <span class="disco-hero-badge-type">${"movie"===e?"🎬 Film":"📺 Seriál"}</span>\n            ${d?`<span class="disco-hero-badge-rating">★ ${d}</span>`:""}\n            ${m?`<span class="disco-hero-badge-year">${m}</span>`:""}\n          </div>\n          <div class="disco-hero-title">${t}</div>\n          <div class="disco-hero-desc">${(r.overview||"Žádný popis není k dispozici.").substring(0,160)}${(r.overview||"").length>160?"…":""}</div>\n          <div class="disco-hero-btns">\n            <button class="disco-hero-btn primary" onclick="event.stopPropagation();if(heroItem.id){window._mfFinderTmdbId=heroItem.id;window._cinYear='${m}';'tv'==='${e}'?openDiscoverTv(heroItem.id,'${c}'):_showCinemaOrFinderChoice(heroItem.id,'${c}','${e}',null);}else{openWithCopy('${c}','${e}','${m}');closeUniverse();}    ">↗ Otevřít na externím webu</button>\n                <button class="disco-hero-btn secondary" onclick="event.stopPropagation();shAddToWatchlistByItem({name:'${c}',media_type:'${e}'});showToast('Přidáno do Oblíbených ❤️')">＋ Oblíbené</button>\n          </div>`, o.append(i, a, s, l), o.onclick = () => {
      r.id ? (window._mfFinderTmdbId = r.id, window._cinYear = (r.release_date || r.first_air_date || "").slice(0, 4) || null, _showCinemaOrFinderChoice(r.id, t, e, t)) : (openWithCopy(t, e, (r.release_date || r.first_air_date || "").slice(0, 4) || null), closeUniverse())
    }, TMDB_KEY && r.id && (o.addEventListener("mouseenter", () => {
      o._t = setTimeout(async () => {
        if (!o.matches(":hover")) return;
        const t = await getTrailerKey(r.id, e);
        t && o.matches(":hover") && !a.querySelector("iframe") && (a.innerHTML = `<div style="position:absolute;inset:0;overflow:hidden;"><iframe src="https://www.youtube-nocookie.com/embed/${t}?autoplay=1&mute=1&controls=0&loop=1&playlist=${t}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=5&vq=hd720&hl=cs&widget_referrer=mujflix&enablejsapi=1&origin=https://mujflix.cz" style="position:absolute;top:50%;left:50%;width:350%;height:350%;transform:translate(-50%,-50%);border:none;pointer-events:none;display:block;" allow="autoplay;encrypted-media"></iframe><div style="position:absolute;inset:0;z-index:20;pointer-events:none;background:transparent;"></div></div>`, a.style.opacity = "1", i.style.opacity = "0")
      }, 1300)
    }), o.addEventListener("mouseleave", () => {
      clearTimeout(o._t), a.style.opacity = "0", i.style.opacity = "1", setTimeout(() => {
        a.innerHTML = ""
      }, 800)
    })), n.appendChild(o)
  }
  a.filter(e => e.items.length).forEach(e => renderDiscoRow(n, e.label, e.items, e.rowType)), a.filter(e => e.items.length).length || 0 !== n.querySelectorAll(".disco-section").length || n.insertAdjacentHTML("beforeend", '<div class="disco-loading" style="padding:60px;text-align:center"><div style="font-size:2.5rem;margin-bottom:16px">😕</div><div style="font-size:0.9rem;color:rgba(255,255,255,0.5)">Žádný obsah se nepodařilo načíst.<br>Zkontroluj připojení k internetu.</div></div>')
}

function shAddToWatchlistByItem(e) {
  addToWatchlistByName(e.name || e.title || "", "movie" === e.media_type || "movie" === e.type ? "movie" : "series")
}

function loadSearchPopular() {
  loadDiscoContent(_discoCurrent.genre, _discoCurrent.type)
}

function searchTMDB(e) {
  discoSearch(e)
}

function renderShResults(e) {
  const t = document.getElementById("searchResults");
  t && (t.innerHTML = "", e.length ? e.forEach((e, n) => {
    t.appendChild(buildShCard(e, n))
  }) : t.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--muted);font-size:0.78rem;padding:50px 0;opacity:0.5;">Nic nenalezeno 🔍</div>')
}

function appendShResults(e) {
  const t = document.getElementById("searchResults");
  if (!t) return;
  const n = _shCurrentItems.length - e.length;
  e.forEach((e, o) => {
    t.appendChild(buildShCard(e, n + o))
  })
}

function buildShCard(e, t) {
  const n = "movie" === e.media_type || !!e.title,
    o = e.name || e.title || e.original_name || e.original_title || "",
    i = e.poster_path ? `https://image.tmdb.org/t/p/w342${e.poster_path}` : "",
    a = e.vote_average ? e.vote_average.toFixed(1) : "",
    s = (e.release_date || e.first_air_date || "").slice(0, 4),
    r = document.createElement("div");
  r.className = "sh-card", r.dataset.idx = t, r.innerHTML = `\n        ${i?`<img src="${i}" alt="" loading="lazy">`:'<div style="width:100%;height:100%;background:#111;"></div>'}\n        <div class="sh-card-overlay"></div>\n        <div class="sh-card-play-btn"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>\n        <div class="sh-card-info">\n          <div class="sh-card-name">${o}</div>\n          <div class="sh-card-meta">\n            <span class="sh-card-type-badge${n?" movie":""}">${n?"Film":"Seriál"}</span>\n            ${a?`<span class="sh-card-rating">★${a}</span>`:""}\n            ${s?`<span style="font-size:0.5rem;color:rgba(255,255,255,0.4)">${s}</span>`:""}\n          </div>\n        </div>\n        <div class="sh-card-copy-hint">📋</div>\n      `, r.addEventListener("mouseenter", () => {
    _shFocusIdx = t, window._shFocusedCard && window._shFocusedCard !== r && window._shFocusedCard.classList.remove("sh-focused"), window._shFocusedCard = r, r.classList.add("sh-focused"), showShPreview(e)
  });
  let l = !1;
  return r.addEventListener("click", () => {
    l || (l = !0, setTimeout(() => {
      l = !1
    }, 800), openShItem(e))
  }), r
}
async function fetchNameVariants(e) {
  const t = "movie" === e.media_type || e.title ? "movie" : "tv",
    n = e.original_name || e.original_title || "",
    o = e.name || e.title || n;
  if (!e.id) return {
    cs: o,
    orig: n || o
  };
  try {
    const n = (e, t) => Promise.race([e, new Promise((e, n) => setTimeout(() => n(new Error("timeout")), t))]),
      [i, a] = await Promise.all([n(tmdbGet(`/${t}/${e.id}?language=cs`), 4e3), n(tmdbGet(`/${t}/${e.id}?language=en-US`), 4e3)]);
    return {
      cs: i?.name || i?.title || o,
      orig: a?.name || a?.title || a?.original_name || a?.original_title || o
    }
  } catch {}
  return {
    cs: o,
    orig: n || o
  }
}
async function getCorrectTmdbName(e) {
  const t = await fetchNameVariants(e);
  if (_uniSelectedVariant) return _uniSelectedVariant;
  const n = t.cs || t.orig,
    o = t.orig || t.cs;
  return _isNonLatin(n) && o && !_isNonLatin(o) ? o : n
}
async function openShItem(e) {
  const t = "movie" === e.media_type || !!e.title ? "movie" : "tv";
  if (e.id) {
    const n = e.name || e.title || e.original_name || e.original_title || "…";
    return window._mfFinderTmdbId = e.id, window._cinYear = (e.release_date || e.first_air_date || "").slice(0, 4) || null, _showCinemaOrFinderChoice(e.id, n, t, n), void getCorrectTmdbName(e).then(e => {
      if (!e || e === n) return;
      const t = document.querySelector("#mfCinemaChoiceModal [data-mf-title]");
      t && (t.textContent = e);
      const o = document.getElementById("mfCinemaChoiceModal");
      o && (o._mfSearchName = e)
    }).catch(() => {})
  }
  const n = getCorrectTmdbName(e),
    o = new Promise(t => setTimeout(() => t(e.name || e.title || ""), 3e3)),
    i = await Promise.race([n, o]);
  window._mfFinderTmdbId = null, openWithCopy(i, t, (e.release_date || e.first_air_date || "").slice(0, 4) || null), closeUniverse()
}

function _showCinemaOrFinderChoice(e, t, n, o) {
  const i = document.getElementById("mfCinemaChoiceModal");
  i && i.remove();
  try {
    closeUniverse()
  } catch (e) {
    console.warn("[Cinema] Discover close failed:", e)
  }
  openMovieInCinema(e, t, n)
}! function() {
  const e = document.createElement("style");
  e.textContent = "\n        @keyframes aiMatchPulse {\n          0%, 100% { box-shadow: 0 0 8px var(--accent, #007AFF)55, 0 2px 8px rgba(0,0,0,0.5); }\n          50%       { box-shadow: 0 0 18px var(--accent, #007AFF)99, 0 2px 12px rgba(0,0,0,0.6); }\n        }\n        .ai-match-card .ai-match-badge {\n          transition: transform 0.2s;\n        }\n        .ai-match-card:hover .ai-match-badge {\n          transform: scale(1.08);\n        }\n      ", document.head.appendChild(e)
}();
let _shPreviewFetchTimeout = null;
async function showShPreview(e) {
  const t = document.getElementById("shPreviewContent"),
    n = document.getElementById("shPreviewEmpty");
  if (!t || !n) return;
  _shPreviewItem = e, _uniSelectedVariant = null;
  const o = e.name || e.title || "",
    i = e.backdrop_path ? `https://image.tmdb.org/t/p/w780${e.backdrop_path}` : e.poster_path ? `https://image.tmdb.org/t/p/w342${e.poster_path}` : "",
    a = e.vote_average ? e.vote_average.toFixed(1) : "",
    s = (e.release_date || e.first_air_date || "").slice(0, 4),
    r = "movie" === e.media_type || !!e.title,
    l = r ? "movie" : "tv",
    c = document.getElementById("uniHeroBadges");
  c && (c.innerHTML = `\n        <span class="uni-hero-badge ${r?"type-movie":"type-tv"}">${r?"🎬 Film":"📺 Seriál"}</span>\n        ${a?`<span class="uni-hero-badge rating">★ ${a}</span>`:""}\n        ${s?`<span class="uni-hero-badge year">${s}</span>`:""}\n      `), document.getElementById("shPreviewTitle").textContent = o, document.getElementById("shPreviewMeta").textContent = "", document.getElementById("shPreviewDesc").textContent = e.overview || "", document.getElementById("shPreviewNames").innerHTML = "", document.getElementById("uniNameVariants").style.display = "none";
  document.getElementById("shPreviewBackdrop").innerHTML = i ? `<img src="${i}" alt="">` : "";
  const d = document.getElementById("shPreviewOpenBtn");
  d.onclick = () => openShItem(e), d.textContent = "▶ Otevřít" + (r ? " na Bombuj" : " na SvetSerialu");
  const m = getWatchlist().some(e => e.name === o),
    u = document.getElementById("shPreviewWlBtn");
  u.classList.toggle("in-wl", m), u.textContent = m ? "✓ V oblíbených" : "❤️ Chci koukat", n.style.display = "none", t.style.display = "flex";
  let p = document.getElementById("shJwAvail");
  if (!p) {
    p = document.createElement("div"), p.id = "shJwAvail", p.className = "jw-avail-slot";
    const e = document.getElementById("shPreviewNames");
    e && e.parentNode && e.parentNode.insertBefore(p, e.nextSibling)
  }
  e.id && window.JWAvail ? JWAvail.render(p, e.id, l) : p.innerHTML = "", clearTimeout(_shPreviewFetchTimeout), _shPreviewFetchTimeout = setTimeout(() => fetchShPreviewDetails(e), 350)
}
async function fetchShPreviewDetails(e) {
  if (!e.id || e !== _shPreviewItem) return;
  const t = "movie" === e.media_type || e.title ? "movie" : "tv",
    [n, o] = await Promise.all([fetchNameVariants(e), tmdbGet(`/${t}/${e.id}/credits?language=cs`).catch(() => null)]);
  if (e !== _shPreviewItem) return;
  const i = (o?.cast || []).slice(0, 4).map(e => e.name).join(", "),
    a = document.getElementById("shPreviewNames");
  a && i && (a.innerHTML = `<strong>Hrají:</strong> ${i}`);
  const s = document.getElementById("uniNameVariants"),
    r = document.getElementById("uniNameVariantBtns");
  if (!s || !r) return;
  n.cs !== n.orig && n.cs && n.orig ? (s.style.display = "block", r.innerHTML = "", [
    [n.cs, "CZ", "🇨🇿 Český název"],
    [n.orig, "EN", "🌍 Originální název"]
  ].forEach(([e, t, n]) => {
    const o = document.createElement("button");
    o.className = "uni-name-variant-btn" + ("CZ" === t ? " active" : ""), "CZ" === t && (_uniSelectedVariant = e), o.innerHTML = `\n            <div class="uni-variant-text">\n              <div class="uni-variant-lang">${n}</div>\n              <div class="uni-variant-name">${e}</div>\n            </div>\n            <span class="uni-variant-copy-icon">📋</span>\n          `, o.onclick = () => {
      document.querySelectorAll(".uni-name-variant-btn").forEach(e => e.classList.remove("active")), o.classList.add("active"), _uniSelectedVariant = e;
      const t = document.getElementById("shPreviewOpenBtn");
      t && (t.textContent = `▶ Kopírovat: "${e.slice(0,20)}${e.length>20?"…":""}"`), showToast(`📋 Zvoleno: ${e}`, "info")
    }, r.appendChild(o)
  })) : (_uniSelectedVariant = n.cs || n.orig, s.style.display = "none")
}

function hideShPreview() {
  const e = document.getElementById("shPreviewContent"),
    t = document.getElementById("shPreviewEmpty");
  e && (e.style.display = "none"), t && (t.style.display = "flex"), _shPreviewItem = null, _uniSelectedVariant = null
}

function shAddToWatchlist() {
  if (!_shPreviewItem) return;
  const e = _shPreviewItem,
    t = e.name || e.title || "",
    n = "movie" === e.media_type || !!e.title,
    o = getWatchlist(),
    i = o.findIndex(e => e.name === t);
  if (i >= 0) o.splice(i, 1), saveWatchlistData(o), showToast("Odebráno z oblíbených");
  else {
    o.push({
      name: t,
      type: n ? "movie" : "series",
      poster: e.poster_path ? `https://image.tmdb.org/t/p/w185${e.poster_path}` : ""
    }), saveWatchlistData(o), showToast("Přidáno do Oblíbených! ❤️");
    try {
      e.genre_ids?.length && aiBrain.boostGenreIds(e.genre_ids, .12)
    } catch (e) {
      console.warn("[Watchlist] aiBrain boost failed:", e)
    }
  }
  const a = document.getElementById("shPreviewWlBtn"),
    s = getWatchlist().some(e => e.name === t);
  a && (a.classList.toggle("in-wl", s), a.textContent = s ? "✓ V oblíbených" : "❤️ Chci koukat")
}

function doSearch() {
  const e = document.getElementById("searchTitleInput")?.value?.trim();
  e && (openWithCopy(e, "tv" === _shType ? "tv" : "movie"), closeUniverse())
}

function openSearchPlatform(e) {
  doSearch()
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("universeOverlay")?.addEventListener("click", e => {
    e.target === document.getElementById("universeOverlay") && closeUniverse()
  })
});
let pendingCb = null;

function showConfirm(e, t, n, o, i) {
  document.getElementById("confirmIcon").textContent = e, document.getElementById("confirmTitle").textContent = t, document.getElementById("confirmSub").textContent = n, document.getElementById("confirmOk").textContent = o, pendingCb = i;
  const a = document.getElementById("confirmOverlay");
  a.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => a.classList.add("visible")))
}

function confirmOk() {
  closeConfirm(), pendingCb && (pendingCb(), pendingCb = null)
}

function confirmCancel() {
  closeConfirm(), pendingCb = null
}

function closeConfirm() {
  const e = document.getElementById("confirmOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 220)
}

function openSeries(e) {
  if (!db[e]) return;
  playOpen();
  try {
    db[e]._genres && aiBrain.boostGenresFromTmdb(db[e]._genres, .04), aiBrain.recordWatchTime()
  } catch (e) {}
  activeSeries = e, showAllSeasons = !1, modalOpen = !0; document.body.classList.add('modal-open');
  const t = db[e],
    n = findNextEp(e);
  activeSeason = n ? n.se : 1, document.getElementById("sTitle").textContent = t.name, document.getElementById("sInfo").textContent = `${totalSeasons(e)} serii · ~${t.totalEps} epizod`;
  document.getElementById("modalHeroImg").src = t._backdrop || t.poster, document.getElementById("tmdbBadge").style.display = TMDB_KEY ? "inline-flex" : "none";
  const o = document.getElementById("seriesModal"),
    i = o.querySelector(".modal-body") || o.querySelector("#modalBody");
  i && (i.scrollTop = 0), o.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => {
    o.classList.add("visible");
    const e = o.querySelector(".modal-hero-content");
    e && (e.style.opacity = "0", e.style.transform = "translateY(12px)", setTimeout(() => {
      e.style.transition = "opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.2,0.64,1)", e.style.opacity = "1", e.style.transform = "translateY(0)"
    }, 120))
  })), switchToSeasonView(), renderSeasons(), updatePanelProgress(), updateModalFavBtn(), kbLayer = "modal-season", kbSeasonIndex = activeSeason - 1, kbEpIndex = -1;
  const a = document.getElementById("modalRateBtn");
  a && (a.style.display = calcProgress(e).seen > 0 ? "flex" : "none")
}

function closeModal() {
  playClick();
  const e = document.getElementById("seriesModal");
  e.classList.remove("visible");
  const t = e.querySelector(".modal-hero-content");
  t && (t.style.transition = "", t.style.opacity = "", t.style.transform = ""), setTimeout(() => e.classList.remove("open"), 380), kbLayer = "menu", kbEpIndex = -1, kbSeasonIndex = -1, modalOpen = !1; document.body.classList.remove('modal-open');
}

function renderSeasons() {
  const e = document.getElementById("seasonPills");
  e && (e.innerHTML = "");
  const t = totalSeasons(activeSeries);
  if (e)
    for (let n = 1; n <= t; n++) {
      const t = document.createElement("button");
      t.className = "season-pill" + (n !== activeSeason || showAllSeasons ? "" : " active"), t.textContent = `${n}`, t.dataset.season = n, t.title = `Serie ${n}`, t.onclick = () => {
        activeSeason = n, showAllSeasons = !1, renderSeasons(), renderEpisodes(), kbLayer = "modal-season", kbSeasonIndex = n - 1, kbEpIndex = -1
      }, e.appendChild(t)
    }
  const n = document.getElementById("seasonCounter");
  n && (n.textContent = showAllSeasons ? "Vsechny" : `${activeSeason} / ${t}`);
  const o = document.getElementById("seasonAllBtn");
  o && (o.className = "season-all-btn" + (showAllSeasons ? " active" : ""), o.textContent = showAllSeasons ? "← Jedna sezóna" : "☰ Všechny epizody");
  const i = document.getElementById("epViewSeasonText");
  i && (i.textContent = showAllSeasons ? "Všechny sezóny" : `Sezóna ${activeSeason}`), renderSeasonSelectView()
}

function renderSeasonSelectView() {
  const e = document.getElementById("ssvGrid");
  if (!e || !activeSeries || !db[activeSeries]) return;
  const t = db[activeSeries],
    n = totalSeasons(activeSeries);
  e.innerHTML = "";
  for (let o = 1; o <= n; o++) {
    const n = o === activeSeason,
      i = document.createElement("div");
    i.className = "ssv-card" + (n ? " ssv-active" : ""), i.title = `Série ${o}`;
    const a = t._poster || t.poster || "",
      s = Object.values(t).filter(e => e && "object" == typeof e && e.se === o).length,
      r = s ? `${s} epizod` : "";
    i.innerHTML = `\n          <img src="${a}" alt="S${o}" loading="lazy"\n            onerror="this.src='';this.parentElement.style.background='#1a1a2a'">\n          <div class="ssv-active-badge">\n            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>\n          </div>\n          <div class="ssv-play-overlay">\n            <button class="ssv-play-btn">\n              <svg viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"/></svg>\n              Otevřít\n            </button>\n          </div>\n          <div class="ssv-info">\n            <div class="ssv-num">Série ${o}</div>\n            <div class="ssv-name">${t.title||""}</div>\n            ${r?`<div class="ssv-ep-count">${r}</div>`:""}\n          </div>\n        `, i.addEventListener("click", () => {
      activeSeason = o, showAllSeasons = !1, renderSeasons(), switchToEpisodesView()
    }), TMDB_KEY && t.tmdbId && (async () => {
      try {
        const e = await tmdbGet(`/tv/${t.tmdbId}/season/${o}?language=cs`);
        if (e?.poster_path) {
          const t = i.querySelector("img");
          t && (t.src = `https://image.tmdb.org/t/p/w342${e.poster_path}`)
        }
        if (e?.episodes?.length) {
          const t = i.querySelector(".ssv-ep-count");
          t && (t.textContent = `${e.episodes.length} epizod`)
        }
      } catch (e) {}
    })(), e.appendChild(i)
  }
}

function switchToSeasonView() {
  document.getElementById("seasonSelectView").style.display = "", document.getElementById("seasonSelectView").classList.add("active"), document.getElementById("episodesView").style.display = "none";
  const e = document.getElementById("modalBody");
  e && e.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

function switchToEpisodesView() {
  document.getElementById("seasonSelectView").style.display = "none", document.getElementById("seasonSelectView").classList.remove("active");
  document.getElementById("episodesView").style.display = "flex";
  const e = document.getElementById("epViewTitle");
  e && activeSeries && db[activeSeries] && (e.textContent = db[activeSeries].title || ""), renderEpisodes();
  const t = document.getElementById("modalBody");
  t && t.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

function renderSeasonStrip() {}

function toggleShowAll() {
  showAllSeasons = !showAllSeasons, renderSeasons(), renderEpisodes()
}

function jumpToNext() {
  const e = findNextEp(activeSeries);
  e && (activeSeason = e.se, showAllSeasons = !1, renderSeasons(), switchToEpisodesView(), setTimeout(() => {
    const t = document.getElementById(`card-${e.uid}`);
    t && t.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
  }, 200))
}
async function renderEpisodes() {
  try {
    const t = document.getElementById("episodesGrid");
    if (!t) return;
    if (!activeSeries || !db[activeSeries]) return void(t.innerHTML = '<div style="color:var(--muted);font-size:0.76rem;padding:16px;opacity:0.5">⚠ Žádný seriál není vybrán</div>');
    t.style.display = "grid";
    const n = db[activeSeries],
      o = getWatched(),
      i = findNextEp(activeSeries),
      a = i ? i.uid : null;

    function e(e) {
      if (t.innerHTML = "", showAllSeasons) {
        const i = totalSeasons(activeSeries);
        for (let s = 1; s <= i; s++) {
          const i = document.createElement("div");
          i.style.cssText = "grid-column:1/-1;font-family:-apple-system, SF Pro Display, Helvetica Neue,sans-serif;font-size:0.84rem;font-weight:700;color:var(--muted);padding:16px 20px 8px;border-bottom:1px solid var(--border);margin-bottom:0;", i.textContent = `Serie ${s}`, t.appendChild(i);
          const r = e && e[s] || null,
            l = epsInSeason(activeSeries, s);
          for (let e = 1; e <= l; e++) {
            const i = `${activeSeries}-S${s}-E${e}`,
              l = r ? r.find(t => t.ep === e) : null;
            t.appendChild(buildEpCard(i, s, e, l, !!o[i], i === a, n.poster))
          }
        }
      } else {
        const i = e && e[activeSeason] || null,
          s = epsInSeason(activeSeries, activeSeason);
        if (0 === s) return void(t.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);font-size:0.76rem;padding:16px;opacity:0.5">Žádné epizody</div>');
        for (let e = 1; e <= s; e++) {
          const s = `${activeSeries}-S${activeSeason}-E${e}`,
            r = i ? i.find(t => t.ep === e) : null;
          t.appendChild(buildEpCard(s, activeSeason, e, r, !!o[s], s === a, n.poster))
        }
      }
      kbEpIndex >= 0 && setKbEpFocus(kbEpIndex)
    }
    const s = tmdbCache[`${activeSeries}-S${activeSeason}`];
    if (void 0 !== s) e(null !== s ? {
      [activeSeason]: s
    } : null);
    else {
      e(null);
      try {
        const r = await Promise.race([fetchTmdbSeason(activeSeries, activeSeason), new Promise(e => setTimeout(() => e(null), 4e3))]);
        r && document.getElementById(`card-${activeSeries}-S${activeSeason}-E1`) && e({
          [activeSeason]: r
        })
      } catch {}
    }
  } catch (l) {
    console.error("renderEpisodes error:", l);
    const c = document.getElementById("episodesGrid");
    c && (c.innerHTML = '<div style="color:#ff6060;font-size:0.72rem;padding:16px;grid-column:1/-1">⚠ Chyba při načítání epizod: ' + l.message + "</div>")
  }
}

function _buildEpCardBase(e, t, n, o, i, a, s) {
  const r = activeSeries || "",
    l = db[activeSeries],
    _r = (r.startsWith('__dtv_') && l?._svetSlug) ? l._svetSlug : r,
    c = _r ? `https://svetserialu.to/serial/${_r}/s${String(t).padStart(2,"0")}e${String(n).padStart(2,"0")}` : `https://svetserialu.to/?s=${encodeURIComponent(l&&l.name||"")}`,
    d = o ? o.name : `Epizoda ${n}`,
    m = o && o.overview ? o.overview : "",
    u = o && o.runtime ? `${o.runtime} min` : "",
    p = o && o.rating ? o.rating.toFixed(1) : "",
    g = o && o.still ? o.still : s,
    f = !i && o && o.still,
    y = document.createElement("div");
  return y.className = "episode-card" + (i ? " watched" : "") + (a ? " next-ep" : "") + (f ? " spoiler-blur" : ""), y.id = `card-${e}`, y.innerHTML = `\n        <div class="ep-thumb">\n          <img src="${g}" alt="" loading="lazy">\n          ${a?'<div class="ep-next-tag">Další</div>':""}\n          <div class="ep-seen-dot">✓</div>\n          ${f?'<div class="spoiler-label"><span style="font-size:1.4rem">🙈</span><span>Spoiler</span></div>':""}\n          <div class="ep-hover-play">\n            <div class="ep-play-ring">\n              <svg viewBox="0 0 10 12"><polygon points="0,0 10,6 0,12"/></svg>\n            </div>\n          </div>\n        </div>\n        <div class="ep-body">\n          <div class="ep-meta-row">\n            <span class="ep-num">S${t} · E${n}</span>\n            ${u?`<span class="ep-runtime">${u}</span>`:""}\n            ${p?`<span class="ep-rating">★ ${p}</span>`:""}\n          </div>\n          <div class="ep-title">${d}</div>\n          ${m?`<div class="ep-desc">${m}</div>`:""}\n          <div class="ep-actions">\n            <button class="ep-btn-play-hbo">\n              <svg viewBox="0 0 10 12" width="10" height="12"><polygon points="0,0 10,6 0,12" fill="currentColor"/></svg>\n                Otevřít epizodu\n            </button>\n            <button class="ep-btn-mark" title="${i?"Označit jako neshlédnuté":"Označit jako shlédnuté"}">${i?"✓":"○"}</button>\n          </div>\n        </div>`, y.querySelector(".ep-btn-play-hbo").addEventListener("click", o => {
    o.stopPropagation(), playWithConfirm(e, t, n, c)
  }), y.querySelector(".ep-hover-play").addEventListener("click", o => {
    o.stopPropagation(), playWithConfirm(e, t, n, c)
  }), y.querySelector(".ep-btn-mark").addEventListener("click", t => {
    t.stopPropagation(), toggleWatch(e)
  }), y
}

function playWithConfirm(e, t, n, o) {
  const i = db[activeSeries]?.name || activeSeries,
    a = db[activeSeries]?.tmdbId,
    s = `${i} — S${String(t).padStart(2,"0")}E${String(n).padStart(2,"0")}`;
  const _ps = (activeSeries.startsWith('__dtv_') && db[activeSeries]?._svetSlug) ? db[activeSeries]._svetSlug : activeSeries;
  a ? (window._cinSiteSlug = _ps, _showCinemaOrFinderChoice(a + "/" + t + "/" + n, s, "tv_ep", o), markWatched(e)) : showConfirm("↗", "Otevřít epizodu?", s, "Otevřít na externím webu", () => {
    markWatched(e), window.open(o, "_blank", "noopener,noreferrer")
  })
}

function markWatched(e) {
  try {
    const t = e.split("-S")[0];
    db[t] && db[t]._genres && aiBrain.recordWatch(t, db[t]._genres), db[t] && db[t]._genreIds && (aiBrain.boostGenreIds(db[t]._genreIds, .07), recordWatchToTimeline(t, db[t]._genreIds)), aiBrain.recordWatchTime()
  } catch (e) {}
  const t = getWatched();
  t[e] = !0, saveWatched(t);
  const n = document.getElementById(`card-${e}`);
  if (n) {
    n.classList.add("watched"), n.classList.remove("spoiler-blur");
    const e = n.querySelector(".ep-btn-mark");
    e && (e.textContent = "✓")
  }
  updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateContinueWidget(), updateLogoProgress(), aiBrain && db[activeSeries] && db[activeSeries]._genres && aiBrain.boostGenresFromTmdb(db[activeSeries]._genres), setTimeout(() => showNextEpPrompt(e), 600)
}
document.getElementById("seriesModal").addEventListener("click", e => {
  e.target === document.getElementById("seriesModal") && closeModal()
});
let _nextEpTimer = null,
  _nextEpTarget = null;
async function showNextEpPrompt(e) {
  const t = findNextEp(activeSeries);
  if (!t) return;
  const n = db[activeSeries],
    _nSlug = (activeSeries.startsWith('__dtv_') && db[activeSeries]?._svetSlug) ? db[activeSeries]._svetSlug : activeSeries,
    o = `https://svetserialu.to/serial/${_nSlug}/s${String(t.se).padStart(2,"0")}e${String(t.ep).padStart(2,"0")}`;
  _nextEpTarget = {
    uid: t.uid,
    se: t.se,
    ep: t.ep,
    url: o
  }, document.getElementById("nextEpTitle").textContent = n.name || activeSeries, document.getElementById("nextEpSub").textContent = `Série ${t.se} · Epizoda ${t.ep}`;
  const i = document.getElementById("nextEpThumbImg");
  if (i.src = n.poster || "", TMDB_KEY) {
    const e = await getTmdbStill(activeSeries, t.se, t.ep);
    e && (i.src = e)
  }
  document.getElementById("nextEpOverlay").classList.add("open");
  let a = 10;
  const s = document.getElementById("nextEpCountdown");
  s.textContent = `${a}s`, _nextEpTimer = setInterval(() => {
    a--, s.textContent = `${a}s`, a <= 0 && nextEpPlay()
  }, 1e3)
}

function nextEpPlay() {
  if (nextEpDismiss(), !_nextEpTarget) return;
  const e = _nextEpTarget;
  markWatched(e.uid);
  const t = db[activeSeries]?.tmdbId;
  if (t) {
    const n = `${db[activeSeries]?.name||activeSeries} — S${String(e.se).padStart(2,"0")}E${String(e.ep||e.epNum||"?").padStart(2,"0")}`;
    window._cinSiteSlug = (activeSeries.startsWith('__dtv_') && db[activeSeries]?._svetSlug) ? db[activeSeries]._svetSlug : activeSeries, _showCinemaOrFinderChoice(t + "/" + e.se + "/" + (e.ep || e.epNum), n, "tv_ep", e.url)
  } else window.open(e.url, "_blank", "noopener,noreferrer");
  activeSeason = e.se, showAllSeasons = !1, renderSeasons(), renderEpisodes(), setTimeout(() => {
    const t = document.getElementById(`card-${e.uid}`);
    t && t.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
  }, 200)
}

function nextEpDismiss() {
  clearInterval(_nextEpTimer), _nextEpTimer = null, _nextEpTarget = null;
  document.getElementById("nextEpOverlay").classList.remove("open")
}

function toggleWatch(e) {
  const t = getWatched(),
    n = !!t[e];
  if (n ? delete t[e] : t[e] = !0, saveWatched(t), renderEpisodes(), updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateContinueWidget(), updateLogoProgress(), !n && "function" == typeof openEpRating) {
    const t = e.split("-"),
      n = t.slice(0, t.length - 2).join("-"),
      o = (void 0 !== db && db[n] ? db[n] : {}).name || n,
      i = parseInt((t[t.length - 2] || "S1").replace("S", "")) || 1,
      a = parseInt((t[t.length - 1] || "E1").replace("E", "")) || 1,
      s = "function" == typeof getEpRating ? getEpRating(e) : 0;
    setTimeout(() => openEpRating(e, o, "S" + i + " · E" + a, s), 350)
  }
}

function shuffleEpisode() {
  const e = totalSeasons(activeSeries),
    t = Math.floor(Math.random() * e) + 1,
    n = epsInSeason(activeSeries, t),
    o = Math.floor(Math.random() * n) + 1;
  activeSeason = t, showAllSeasons = !1, renderSeasons(), renderEpisodes(), setTimeout(() => {
    const e = `${activeSeries}-S${t}-E${o}`,
      n = document.getElementById(`card-${e}`);
    n && (n.classList.add("shuffle-highlight"), n.scrollIntoView({
      behavior: "smooth",
      block: "center"
    }), setTimeout(() => n.classList.remove("shuffle-highlight"), 2200));
    const _ss = (activeSeries.startsWith('__dtv_') && db[activeSeries]?._svetSlug) ? db[activeSeries]._svetSlug : activeSeries;
    const i = `https://svetserialu.to/serial/${_ss}/s${String(t).padStart(2,"0")}e${String(o).padStart(2,"0")}`,
      a = db[activeSeries]?.tmdbId,
      s = `${db[activeSeries].name} — S${String(t).padStart(2,"0")}E${String(o).padStart(2,"0")}`;
    a ? (markWatched(e), window._cinSiteSlug = _ss, _showCinemaOrFinderChoice(a + "/" + t + "/" + o, s, "tv_ep", i)) : showConfirm("🎲", "Náhodná epizoda", s, "Otevřít na externím webu", () => {
      markWatched(e), window.open(i, "_blank", "noopener,noreferrer")
    })
  }, 90)
}

function getWatchlist() {
  try {
    return safeLS(uKey("mf_watchlist"), "[]")
  } catch {
    return []
  }
}

function saveWatchlistData(e) {
  safeSetItem(uKey("mf_watchlist"), JSON.stringify(e)), updateWatchlistBadge()
}

function updateWatchlistBadge() {
  const e = getWatchlist(),
    t = document.getElementById("watchlistFabBadge");
  t && (t.textContent = e.length, t.classList.toggle("visible", e.length > 0))
}

// ── KDO SE DÍVÁ — watcher avatary na dlaždicích ──
function updateWatcherBadges() {
  const watchers = window._mfWatchers;
  if (!watchers) return;

  document.querySelectorAll('.ps-tile-wrapper[data-slug]').forEach(wrapper => {
    const slug = wrapper.dataset.slug;
    const list = watchers[slug];

    // Odstraň starý badge
    const old = wrapper.querySelector('.tile-watcher-badge');
    if (old) old.remove();
    if (!list || !list.length) return;

    const badge = document.createElement('div');
    badge.className = 'tile-watcher-badge';

    // Max 3 avatary, zbytek jako +N
    const visible = list.slice(0, 3);
    const rest = list.length - visible.length;

    const avatarsHtml = visible.map(w =>
      `<div class="twa" style="--wc:${w.color};background:${w.color}33" title="${w.name}">${w.avatar}</div>`
    ).join('');

    const restHtml = rest > 0
      ? `<div class="twa twa-rest">+${rest}</div>`
      : '';

    // Label se jmény — zobrazí se na hover
    const names = list.map(w => w.name).join(', ');
    const labelHtml = `<div class="twa-label">${names}</div>`;

    badge.innerHTML = avatarsHtml + restHtml + labelHtml;

    // Přidej do .ps-tile (obsahuje obrázek + overlay), ne do wrapperu
    const tile = wrapper.querySelector('.ps-tile') || wrapper;
    tile.appendChild(badge);
  });
}

// Spusť také při startu pokud jsou watcher data k dispozici
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { if (window._mfWatchers) updateWatcherBadges(); }, 1000);
});

function openWatchlist() {
  const e = document.getElementById("watchlistOverlay");
  e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), renderWatchlist()
}

function closeWatchlist() {
  const e = document.getElementById("watchlistOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 280)
}

function renderWatchlist() {
  const e = getWatchlist(),
    t = document.getElementById("watchlistList"),
    n = document.getElementById("watchlistEmpty");
  t.querySelectorAll(".wl-item").forEach(e => e.remove()), e.length ? (n.style.display = "none", e.forEach((e, n) => {
    const o = document.createElement("div");
    o.className = "wl-item", o.innerHTML = `<div class="wl-item-thumb"><img src="${e.poster||""}" alt="" onerror="this.style.display='none'"></div><div class="wl-item-info"><div class="wl-item-name">${_esc(e.name)}</div><div class="wl-item-meta">${"series"===e.type?"Serial":"Film"}</div></div><div class="wl-item-actions"><button class="wl-search-btn">Hledat</button><button class="wl-remove-btn">✕</button></div>`, o.querySelector(".wl-search-btn").onclick = () => openWithCopy(e.name, "series" === e.type ? "tv" : "movie"), o.querySelector(".wl-remove-btn").onclick = () => {
      const e = getWatchlist();
      e.splice(n, 1), saveWatchlistData(e), renderWatchlist()
    }, t.appendChild(o)
  })) : n.style.display = "block"
}

function toggleWatchlistItem(e) {
  const t = getWatchlist(),
    n = t.findIndex(t => t.slug === e);
  if (n >= 0) t.splice(n, 1), showToast("Odebrano z oblibenych");
  else {
    t.push({
      slug: e,
      name: db[e]?.name || e,
      type: "series",
      poster: db[e]?._poster || db[e]?.poster || ""
    }), showToast("Pridano do Oblibenych! ❤️");
    try {
      db[e]?._genres && aiBrain.boostGenresFromTmdb(db[e]._genres, .12),
      db[e]?._genreIds && aiBrain.boostGenreIds(db[e]._genreIds, .12)
    } catch (t) {
      console.warn("[Watchlist] aiBrain boost failed:", t)
    }
  }
  saveWatchlistData(t), updateWatchlistBtns()
}

function updateWatchlistBtns() {
  const e = getWatchlist();
  Object.keys(db).forEach(t => {
    const n = document.getElementById(`wlbtn-${t}`);
    n && n.classList.toggle("in-watchlist", e.some(e => e.slug === t))
  });
  updateModalFavBtn()
}

function updateModalFavBtn() {
  const e = document.getElementById("modalFavBtn");
  if (!e || !activeSeries) return;
  const t = getWatchlist().some(e => e.slug === activeSeries);
  e.classList.toggle("in-watchlist", t), e.innerHTML = t ? "✓ V oblíbených" : "❤️ Oblíbené"
}

function addToWatchlistByName(e, t = "movie") {
  const n = getWatchlist();
  n.some(t => t.name === e) || (n.push({
    name: e,
    type: t,
    poster: ""
  }), saveWatchlistData(n))
}

function openRating(e) {
  _ratingSlug = e;
  const t = safeLS(uKey("mf_ratings"), "{}");
  if (t[e] && Date.now() - t[e].ts < 18e5) return;
  const n = db[e];
  document.getElementById("ratingTitle").textContent = `Jak se ti libil ${n.name}?`;
  document.getElementById("ratingThumbImg").src = n._poster || n.poster || "";
  const o = document.getElementById("ratingOverlay");
  o.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => o.classList.add("visible")))
}

function closeRating() {
  const e = document.getElementById("ratingOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 280)
}

function submitRating(e) {
  if (!_ratingSlug) return;
  const t = safeLS(uKey("mf_ratings"), "{}");
  if (t[_ratingSlug] = {
      rating: e,
      name: db[_ratingSlug]?.name || _ratingSlug,
      ts: Date.now()
    }, safeSetItem(uKey("mf_ratings"), JSON.stringify(t)), aiBrain && db[_ratingSlug]) {
    const t = "loved" === e ? .25 : "liked" === e ? .15 : "ok" === e ? .05 : -.1;
    db[_ratingSlug]._genres && aiBrain.boostGenresFromTmdb(db[_ratingSlug]._genres, t)
  }
  closeRating(), showToast("loved" === e ? "Super! AI si to zapamuje pro doporuceni 🎉" : "meh" === e ? "Chapeme, priste neco lepsiho 👍" : "Diky za hodnoceni!"), setTimeout(loadForYouTile, 500)
}
document.getElementById("watchlistOverlay").addEventListener("click", e => {
  e.target === document.getElementById("watchlistOverlay") && closeWatchlist()
});

function importHistory(e) {
  const t = e.target.files[0];
  if (!t) return;
  const n = new FileReader;
  n.onload = e => {
    try {
      localStorage.setItem(uKey("mf_watched"), JSON.stringify(JSON.parse(e.target.result))), showAutosave("saved"), Object.keys(db).forEach(e => {
        updateTileProgress(e), updateContinueBadge(e)
      }), updateContinueWidget(), activeSeries && (renderEpisodes(), updatePanelProgress()), showToast("✓ Zaloha nactena!")
    } catch {
      showToast("⚠ Chybny soubor")
    }
  }, n.readAsText(t)
}

let _bgParticlesPaused = !1,
  _bgParticlesRaf = null;

function pauseBgParticles() {
  _bgParticlesPaused = !0, _bgParticlesRaf && (cancelAnimationFrame(_bgParticlesRaf), _bgParticlesRaf = null)
}

function resumeBgParticles() {
  _bgParticlesPaused && (_bgParticlesPaused = !1, "function" == typeof _bgParticlesDraw && _bgParticlesDraw())
}
let _bgParticlesDraw = null;
! function() {
  const e = document.getElementById("particles");
  if (!e) return;

  function t() {
    e.width = window.innerWidth, e.height = window.innerHeight
  }
  t(), window.addEventListener("resize", t);
  const n = e.getContext("2d"),
    o = Array.from({
      length: 90
    }, () => ({
      x: Math.random() * e.width,
      y: Math.random() * e.height,
      r: 1.8 * Math.random() + .4,
      vx: .18 * (Math.random() - .5),
      vy: .18 * (Math.random() - .5),
      op: .3 * Math.random() + .04,
      pulse: Math.random() * Math.PI * 2,
      pspd: .012 * Math.random() + .003,
      col: Math.random() < .55 ? 0 : 1
    }));

  function i() {
    _bgParticlesPaused || (n.clearRect(0, 0, e.width, e.height), o.forEach(t => {
      t.x += t.vx, t.y += t.vy, t.pulse += t.pspd, t.x < -2 && (t.x = e.width + 2), t.x > e.width + 2 && (t.x = -2), t.y < -2 && (t.y = e.height + 2), t.y > e.height + 2 && (t.y = -2);
      const o = t.op * (.55 + .45 * Math.sin(t.pulse));
      n.beginPath(), n.arc(t.x, t.y, t.r, 0, 2 * Math.PI), n.fillStyle = 0 === t.col ? "rgba(0,122,255," + o.toFixed(3) + ")" : "rgba(255,255,255," + (.35 * o).toFixed(3) + ")", n.fill()
    }), _bgParticlesRaf = requestAnimationFrame(i))
  }
  _bgParticlesDraw = i, i()
}();
let audioCtx = null,
  _audioUnlocked = !1;

function getAudioCtx() {
  if (!audioCtx) try {
    audioCtx = new(window.AudioContext || window.webkitAudioContext)
  } catch {}
  return audioCtx && "suspended" === audioCtx.state && audioCtx.resume().catch(() => {}), audioCtx
}

function _unlockAudio() {
  if (!_audioUnlocked) {
    if (_audioUnlocked = !0, !audioCtx) try {
      audioCtx = new(window.AudioContext || window.webkitAudioContext)
    } catch {}
    audioCtx && "suspended" === audioCtx.state && audioCtx.resume().catch(() => {})
  }
}
document.addEventListener("pointerdown", _unlockAudio, {
  once: !0,
  passive: !0
}), document.addEventListener("keydown", _unlockAudio, {
  once: !0,
  passive: !0
});
let _masterComp = null,
  _masterReverb = null,
  _masterGain = null;

function _getMaster() {
  const e = getAudioCtx();
  return e ? (_masterGain || (_masterGain = e.createGain(), _masterGain.gain.value = .85, _masterComp = e.createDynamicsCompressor(), _masterComp.threshold.value = -18, _masterComp.knee.value = 6, _masterComp.ratio.value = 3, _masterComp.attack.value = .003, _masterComp.release.value = .12, _masterGain.connect(_masterComp), _masterComp.connect(e.destination)), _masterGain) : null
}

function _apTone(e, t, n, o, i = {}) {
  try {
    const a = getAudioCtx();
    if (!a) return;
    const s = _getMaster();
    if (!s) return;
    const {
      type: r = "sine",
      detune: l = 0,
      attack: c = .003,
      hold: d = 0,
      releaseRatio: m = .85
    } = i, u = a.createOscillator(), p = a.createGain();
    u.type = r, u.frequency.value = e, l && (u.detune.value = l);
    const g = t;
    p.gain.setValueAtTime(0, g), p.gain.linearRampToValueAtTime(o, g + c), d > 0 && p.gain.setValueAtTime(o, g + c + d), p.gain.exponentialRampToValueAtTime(1e-4, g + n), u.connect(p), p.connect(s), u.start(g), u.stop(g + n + .01)
  } catch {}
}

function playClick() {
  const e = getAudioCtx();
  if (!e) return;
  const t = e.currentTime;
  _apTone(1046.5, t, .045, .032, {
    attack: .002
  }), _apTone(1318.5, t + .004, .038, .018, {
    attack: .002
  })
}

function playHover() {
  const e = getAudioCtx();
  e && _apTone(1e3, e.currentTime, .02, .012, {
    attack: .002
  })
}

function playOpen() {
  const e = getAudioCtx();
  if (!e) return;
  const t = e.currentTime;
  _apTone(783.99, t, .075, .03, {
    attack: .003
  }), _apTone(987.77, t + .065, .06, .022, {
    attack: .003
  })
}

function playSuccess() {
  const e = getAudioCtx();
  if (!e) return;
  const t = e.currentTime;
  _apTone(1046.5, t, .065, .03, {
    attack: .003
  }), _apTone(1318.5, t + .075, .06, .026, {
    attack: .003
  }), _apTone(1567.98, t + .14, .08, .022, {
    attack: .003
  })
}

function playClose() {
  const e = getAudioCtx();
  if (!e) return;
  const t = e.currentTime;
  _apTone(987.77, t, .06, .025, {
    attack: .003
  }), _apTone(783.99, t + .055, .05, .018, {
    attack: .003
  })
}

function playError() {
  const e = getAudioCtx();
  if (!e) return;
  const t = e.currentTime;
  _apTone(220, t, .08, .035, {
    type: "triangle",
    attack: .005
  }), _apTone(196, t + .1, .07, .028, {
    type: "triangle",
    attack: .005
  })
}

const SERIES_COLORS = {
  "the-simpsons": "255,185,0",
  "family-guy": "40,80,255",
  "south-park": "255,80,0",
  futurama: "0,180,255",
  "the-boys": "180,0,0",
  "breaking-bad": "0,200,80",
  "hunter-x-hunter": "100,180,255",
  "scissor-seven": "255,60,180",
  __foryou__: "0,122,255"
};

function setAdaptiveColor(e) {
  const t = document.getElementById("adaptiveBg");
  if (!t) return;
  const n = SERIES_COLORS[e] || "0,122,255";
  t.style.background = `radial-gradient(ellipse 80% 60% at 50% 40%,rgba(${n},0.07) 0%,transparent 70%)`, t.classList.add("active")
}

function clearAdaptiveColor() {
  document.getElementById("adaptiveBg")?.classList.remove("active")
}

function initTileEffects() {
  document.getElementById("mainMenu");
  document.querySelectorAll(".ps-tile-wrapper[data-slug]").forEach(e => {
    const t = e.dataset.slug;
    if (t && "__search__" !== t && "__foryou__" !== t && db[t]) {
      const n = document.createElement("div");
      n.className = "tile-tooltip";
      const o = db[t];
      n.innerHTML = `<div class="tt-title">${o.name}</div><div class="tt-meta">${function(e){const t=e||0,n=t/2,o=Math.floor(n),i=n-o>=.3,a=5-o-(i?1:0);return`<span class="tt-stars">${"★".repeat(o)}${i?"½":""}${"☆".repeat(a)}</span><span class="tt-rating-num">${t.toFixed(1)}</span>`}(o._rating)}<span>${o.totalEps} ep</span></div><div class="tt-genre">${(o._genres||[]).slice(0,2).join(" · ")||""}</div>`, e.appendChild(n)
    }
    const n = e.querySelector(".tile-bg");
    if (n) {
      const e = () => n.classList.add("loaded");
      n.complete && n.naturalWidth ? e() : (n.addEventListener("load", e, {
        once: !0
      }), n.addEventListener("error", e, {
        once: !0
      }))
    }
    const o = e.querySelector(".tile-logo");
    if (o) {
      const e = () => o.classList.add("loaded");
      o.complete && o.naturalWidth ? e() : (o.addEventListener("load", e, {
        once: !0
      }), o.addEventListener("error", e, {
        once: !0
      }))
    }
    t && db[t], initUniversalHover(e)
  })
}

function initUniversalHover(e) {
  if (e._hoverInited) return;
  e._hoverInited = !0;
  const t = document.getElementById("mainMenu"),
    n = e.dataset.tmdbId,
    o = e.dataset.type || "tv",
    i = e.dataset.slug;
  e.addEventListener("mouseenter", () => {
    "mainMenu" === e.parentElement.id && t.classList.add("focus-mode"), e.classList.add("focused"), i && setAdaptiveColor(i), playHover();
    const a = i && HARDCODED_TRAILERS[i];
    (n || a) && (n && getTrailerKey(n, o, i), e._trailerTimer = setTimeout(() => {
      (e.classList.contains("focused") || e.classList.contains("kb-focus")) && loadTileTrailer(e, n || null, o, i)
    }, 1400))
  }), e.addEventListener("mouseleave", () => {
    "mainMenu" === e.parentElement.id && t.classList.remove("focus-mode"), e.classList.remove("focused"), clearAdaptiveColor(), e._trailerTimer && clearTimeout(e._trailerTimer), removeTileTrailer(e)
  });
  // Klik na tile → vždy rovnou do cinema mode / finder (ne jen při trailerech)
  e.addEventListener("click", function(ev) {
    if (!i || i === "__search__" || i === "__foryou__") return;
    const _gEl = document.getElementById("mfProfileGate");
    if (_gEl && _gEl.style.display === "flex") return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    var tmdbId = e.dataset.tmdbId;
    var type = o || "tv";
    var item = (typeof db !== "undefined") && db[i];
    var title = (item && item.name) || i;
    if (tmdbId && typeof _showCinemaOrFinderChoice === "function") {
      window._mfFinderTmdbId = tmdbId;
      window._cinYear = (item && item._year) || null;
      _showCinemaOrFinderChoice(tmdbId, title, type, title);
    } else if (typeof openSeries === "function") {
      openSeries(i);
    }
  }, true);
}
const HARDCODED_TRAILERS = {
    "the-simpsons": "oMXk1wi-9Zs",
    "family-guy": "J32iwo65RMc",
    futurama: "GxEY6KNsz44",
    "south-park": "FMKcPao7A6Y"
  },
  _trailerCache = {};
let _activeTrailerWrapper = null;
async function getTrailerKey(e, t = "tv", n = null) {
  if (n && HARDCODED_TRAILERS[n]) return HARDCODED_TRAILERS[n];
  if (n && db[n]?.trailerKey) return db[n].trailerKey;
  const o = "trailer-" + t + "-" + e;
  if (_trailerCache[o]) return _trailerCache[o];
  try {
    const n = TMDB + "/" + t + "/" + e + "/videos?api_key=" + TMDB_KEY,
      i = await fetch(n);
    if (i.ok) {
      const e = await i.json(),
        t = e?.results || [],
        n = t.find(e => "YouTube" === e.site && "Trailer" === e.type) || t.find(e => "YouTube" === e.site && "Teaser" === e.type) || t.find(e => "YouTube" === e.site);
      if (n) return _trailerCache[o] = n.key, n.key
    }
  } catch (e) {}
  return null
}
async function loadTileTrailer(e, t, n = "tv", o = null) {
  if (!(o && HARDCODED_TRAILERS[o]) && !t) return;
  if (_activeTrailerWrapper && _activeTrailerWrapper !== e && removeTileTrailer(_activeTrailerWrapper), e.querySelector(".tile-trailer")) return;
  const i = await getTrailerKey(t, n, o);
  if (!i) return;
  if (!e.classList.contains("focused") && !e.classList.contains("kb-focus")) return;
  _activeTrailerWrapper = e, _activeTrailerWrapper = e;
  const a = document.createElement("div");
  a.className = "tile-trailer";
  const s = `https://www.youtube-nocookie.com/embed/${i}?autoplay=1&mute=1&controls=0&loop=1&playlist=${i}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=12&vq=hd720&hl=cs&widget_referrer=mujflix&enablejsapi=1&origin=https://mujflix.cz`;
  a.innerHTML = `\n        <div class="tr-video-container">\n          <iframe src="${s}" allow="autoplay;encrypted-media" style="pointer-events:none;" referrerpolicy="strict-origin-when-cross-origin"></iframe>\n          <div style="position:absolute;inset:0;z-index:10;pointer-events:none;background:transparent;"></div>\n        </div>\n        <div class="tr-grad"></div>\n      `;
  const r = e.querySelector(".ps-tile");
  r && r.appendChild(a);
  const l = e.querySelector(".tile-bg"),
    c = e.querySelector(".tile-logo"),
    d = e.querySelector(".tile-continue-badge"),
    m = e.querySelector(".tile-watchlist-btn"),
    u = a.querySelector(".tr-video-container"),
    p = gsap.timeline({
      defaults: {
        ease: "power3.inOut"
      }
    });
  p.to(r, {
    scale: 1.18,
    y: -12,
    duration: 1,
    boxShadow: "0 40px 100px rgba(0,0,0,0.95), 0 0 60px rgba(0,122,255,0.14)"
  }, 0), l && p.to(l, {
    opacity: 0,
    filter: "blur(20px) scale(1.15)",
    duration: .8
  }, .1), c && p.to(c, {
    opacity: .05,
    filter: "blur(10px)",
    scale: .85,
    duration: .6
  }, .15), d && p.to(d, {
    opacity: 0,
    y: -10,
    duration: .5
  }, 0), m && p.to(m, {
    opacity: 0,
    scale: .5,
    duration: .4
  }, 0), p.fromTo(a, {
    opacity: 0
  }, {
    opacity: 1,
    duration: 1.4
  }, .45), u && p.fromTo(u, {
    scale: .92
  }, {
    scale: 1.08,
    duration: 2.5,
    ease: "power1.out"
  }, .35), e._gsapTl = p
}

function removeTileTrailer(e) {
  if (!e) return;
  e._trailerTimer && clearTimeout(e._trailerTimer), _activeTrailerWrapper === e && (_activeTrailerWrapper = null);
  const t = e.querySelector(".tile-trailer"),
    n = e.querySelector(".ps-tile");
  if (e._gsapTl && (e._gsapTl.kill(), e._gsapTl = null), t || n) {
    const o = e.querySelector(".tile-bg"),
      i = e.querySelector(".tile-logo"),
      a = e.querySelector(".tile-continue-badge"),
      s = e.querySelector(".tile-watchlist-btn");
    gsap.to(n, {
      scale: 1,
      duration: .4,
      ease: "power2.out"
    }), o && gsap.to(o, {
      opacity: 1,
      filter: "blur(0px)",
      duration: .4
    }), i && gsap.to(i, {
      opacity: 1,
      filter: "blur(0px)",
      duration: .4,
      onComplete: () => {
        i && (i.style.opacity = "1")
      }
    }), a && gsap.to(a, {
      opacity: 1,
      scale: 1,
      duration: .3
    }), s && gsap.to(s, {
      opacity: 1,
      scale: 1,
      duration: .3
    }), t && gsap.to(t, {
      opacity: 0,
      duration: .3,
      onComplete: () => t.remove()
    })
  }
}

function initMagnetic(e, t = .35) {
  e && (e.addEventListener("mousemove", n => {
    const o = e.getBoundingClientRect(),
      i = (n.clientX - o.left - o.width / 2) * t,
      a = (n.clientY - o.top - o.height / 2) * t;
    e.style.transform = `translate(${i}px,${a}px)`
  }), e.addEventListener("mouseleave", () => {
    e.style.transform = ""
  }))
}
let _popularType = "tv";
async function loadTrending() {
  loadPopular("tv")
}
async function loadPopular(e) {
  const i = document.getElementById("popularList");
  if (!i) return;
  const t = document.getElementById("popularSection");
  try {
    const n = "tv" === e ? "/trending/tv/week" : "/trending/movie/week",
      o = await tmdbGet(n);
    if (!o || !o.results) return;
    i.innerHTML = "", o.results.filter(e => e.poster_path).slice(0, 30).forEach((t, n) => {
      const o = t.name || t.title || t.original_name || "",
        a = document.createElement("div");
      a.className = "pop-item", a.innerHTML = `<div class="pop-rank">${n+1}</div><img src="${t.poster_path?"https://image.tmdb.org/t/p/w92"+t.poster_path:""}" alt="" loading="lazy" onerror="this.style.display='none'"><div class="pop-item-name">${_esc(o)}</div>`, a.onclick = () => openWithCopy(o, "tv" === e ? "tv" : "movie"), a.addEventListener("mouseenter", playHover), i.appendChild(a)
    }), t?.classList.add("visible")
  } catch (e) {}
}
let wrappedIdx = 0;

function openWrapped() {
  const e = getWatched();
  let t = 0,
    n = 0,
    o = {};
  Object.keys(e).forEach(e => {
    const i = e.match(/^(.+)-S\d+-E\d+$/);
    if (!i) return;
    const a = i[1];
    db[a] && (t++, n += db[a].runtime || 22, o[a] = (o[a] || 0) + 1)
  });
  const i = Math.round(n / 60),
    a = Math.round(n / 1440 * 10) / 10,
    s = Object.entries(o).sort((e, t) => t[1] - e[1])[0],
    r = s ? db[s[0]]?.name : "zatim nic",
    l = s ? s[1] : 0,
    c = safeLS(uKey("mf_ratings"), "{}"),
    d = Object.values(c).filter(e => "loved" === e.rating).length,
    m = aiBrain ? Object.entries(aiBrain.memory.genrePreferences || {}).sort((e, t) => t[1] - e[1]).slice(0, 5) : [],
    u = m[0] ? m[0][0] : "Komedie",
    p = [];
  t >= 100 ? p.push("&#x1F3C6; Legenda") : t >= 50 ? p.push("&#x1F4FA; Maratonec") : t >= 10 && p.push("&#x1F3AC; Divak"), d >= 3 && p.push("&#x2764;&#xFE0F; Kritik"), l >= 10 && p.push("&#x1F31F; Verny fanousek");
  const g = `Tvuj profil rika jasne: ${u} zanr${"zatim nic"!=r?`, nejvic te tahne ${r}`:""}. Za ${i} hodin sledovani sis budoval vlastni filmovy vkus. ${d>0?`Oba palce jsi udelil ${d}x – AI si to zapamatovala.`:"Zkus neco ohodnotit."} Priste budou doporuceni jeste presnejsi.`,
    f = s && (db[s[0]]?._poster || db[s[0]]?.poster) || "",
    y = [{
      bg: "rgba(13,0,21,0.97)",
      accent: "180,0,255",
      content: `<div class="w-card"><div class="w-eyebrow">Tvůj MujFlix Wrapped</div><span class="w-emoji">&#x1F3AC;</span><div class="w-number" id="wNumEps">0</div><div class="w-label">epizod celkem</div><div class="w-sub">Kdyz to scitas – mas opravdu dobry vkus na cas.</div>${p.length?`<div class="w-badge-row">${p.map((e,t)=>`<div class="w-badge" style="animation-delay:${.12*t+.3}s">${e}</div>`).join("")}</div>`:""}</div>`,
      counter: {
        el: "wNumEps",
        to: t
      }
    }, {
      bg: "rgba(0,18,28,0.97)",
      accent: "0,160,255",
      content: `<div class="w-card"><div class="w-eyebrow">Cas na obrazovce</div><span class="w-emoji">&#x23F1;&#xFE0F;</span><div class="w-number" id="wNumH">0</div><div class="w-label">hodin (${a} dní)</div><div class="w-sub">${i>100?"Absolutni legenda. Kdyz nespis, koukáš.":i>30?"Solidni divak s dobrym vkusem.":"Jen zacinas. Ceka te hodne dobreho."}</div></div>`,
      counter: {
        el: "wNumH",
        to: i
      }
    }, {
      bg: "rgba(20,8,0,0.97)",
      accent: "255,100,0",
      content: `<div class="w-card"><div class="w-eyebrow">Tvůj #1 Favorit</div><span class="w-emoji">&#x1F4FA;</span><div class="w-number text">${r}</div><div class="w-label">${l} epizod</div><div class="w-sub">Tenhle serial te proste tahne. AI vím proc.</div></div>`,
      counter: null
    }, {
      bg: "rgba(5,0,20,0.97)",
      accent: "140,80,255",
      content: `<div class="w-card"><div class="w-eyebrow">Tvůj filmovy DNA</div><span class="w-emoji">&#x1F9E0;</span><div class="w-number text" style="font-size:1.8rem">${u.charAt(0).toUpperCase()+u.slice(1)}</div><div class="w-label">dominantní žánr</div><div class="w-chart-wrap">${m.map(([e,t])=>`<div class="w-bar-row"><div class="w-bar-label">${e.slice(0,10)}</div><div class="w-bar-track"><div class="w-bar-fill" style="--target:${t.toFixed(2)}"></div></div><div class="w-bar-pct">${Math.round(100*t)}%</div></div>`).join("")}</div></div>`,
      counter: null
    }, {
      bg: "rgba(10,8,0,0.97)",
      accent: "0,122,255",
      content: `<div class="w-card"><div class="w-eyebrow">AI si te precetla</div><span class="w-emoji">&#x2726;</span><div class="w-ai-text">${g}</div><div style="margin-top:16px;text-align:center;"><button onclick="event.stopPropagation();closeWrapped();openGenreEditor();" style="background:rgba(0,122,255,0.12);border:1px solid rgba(0,122,255,0.35);color:var(--accent);font-family:Outfit,sans-serif;font-size:0.73rem;font-weight:800;border-radius:50px;padding:10px 22px;cursor:pointer;transition:all 0.2s;">🎛 Vyladit moje preference</button></div><div style="margin-top:14px;text-align:center;font-size:0.58rem;color:rgba(255,255,255,0.18);letter-spacing:4px;text-transform:uppercase">MujFlix AI &middot; Osobni shrnut&iacute;</div></div>`,
      counter: null
    }],
    h = document.getElementById("wrappedOverlay"),
    v = h.querySelector(".wrapped-slides-wrap"),
    b = h.querySelector(".wrapped-nav");
  if (v.innerHTML = "", b.innerHTML = "", f) {
    const e = document.getElementById("wrappedPosterBlur");
    e && (e.style.backgroundImage = `url(${f})`, setTimeout(() => e.classList.add("vis"), 200))
  }
  y.forEach((e, t) => {
    const n = document.createElement("div");
    n.className = "wrapped-slide" + (0 === t ? " active" : ""), n.style.cssText = `background:${e.bg}`, n.innerHTML = e.content, v.appendChild(n);
    const o = document.createElement("div");
    o.className = "wrapped-dot" + (0 === t ? " active" : ""), o.onclick = e => {
      e.stopPropagation(), goWrappedSlide(t)
    }, b.appendChild(o)
  }), _wrappedSlideConfigs = y, wrappedIdx = 0, h.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => {
    h.classList.add("visible"), startWrappedCanvas(), setTimeout(() => {
      animateWrappedBars(), animateWrappedCounter(y[0])
    }, 400)
  })), pauseBgParticles(), playOpen()
}
let _wrappedSlideConfigs = [],
  _wrappedCanvasRaf = null;

function startWrappedCanvas() {
  const e = document.getElementById("wrappedCanvas");
  if (!e) return;
  e.width = window.innerWidth, e.height = window.innerHeight;
  const t = e.getContext("2d"),
    n = Array.from({
      length: 80
    }, () => ({
      x: Math.random() * e.width,
      y: Math.random() * e.height,
      r: 2.2 * Math.random() + .4,
      vx: .35 * (Math.random() - .5),
      vy: .35 * (Math.random() - .5),
      op: .5 * Math.random() + .05,
      hue: Math.random() < .3 ? 60 : 80 * Math.random() + 200,
      pulse: Math.random() * Math.PI * 2,
      pspd: .015 * Math.random() + .004
    }));
  ! function o() {
    t.clearRect(0, 0, e.width, e.height), n.forEach(n => {
      n.x += n.vx, n.y += n.vy, n.pulse += n.pspd, n.x < 0 && (n.x = e.width), n.x > e.width && (n.x = 0), n.y < 0 && (n.y = e.height), n.y > e.height && (n.y = 0);
      const o = n.op * (.5 + .5 * Math.sin(n.pulse)),
        i = 60 === n.hue ? `rgba(0,122,255,${o})` : `hsla(${n.hue},80%,70%,${.5*o})`;
      t.beginPath(), t.arc(n.x, n.y, n.r, 0, 2 * Math.PI), t.fillStyle = i, t.fill()
    }), _wrappedCanvasRaf = requestAnimationFrame(o)
  }()
}

function stopWrappedCanvas() {
  _wrappedCanvasRaf && (cancelAnimationFrame(_wrappedCanvasRaf), _wrappedCanvasRaf = null)
}

function animateWrappedCounter(e) {
  if (!e || !e.counter) return;
  const t = document.getElementById(e.counter.el);
  if (!t) return;
  const n = e.counter.to;
  let o = 0;
  const i = Math.max(1, Math.ceil(n / 50)),
    a = setInterval(() => {
      o = Math.min(o + i, n), t.textContent = o, o >= n && clearInterval(a)
    }, 28)
}

function animateWrappedBars() {
  document.querySelectorAll(".w-bar-fill").forEach(e => {
    const t = parseFloat(e.style.getPropertyValue("--target") || "1");
    e.style.transform = `scaleX(${t})`, e.classList.add("animated")
  })
}

function goWrappedSlide(e) {
  const t = document.querySelectorAll(".wrapped-slide"),
    n = document.querySelectorAll(".wrapped-dot");
  e < 0 || e >= t.length || (t[wrappedIdx].classList.add("exit"), t[wrappedIdx].classList.remove("active"), n[wrappedIdx].classList.remove("active"), setTimeout(() => {
    t[wrappedIdx] && t[wrappedIdx].classList.remove("exit")
  }, 450), wrappedIdx = e, t[e].classList.add("active"), n[e].classList.add("active"), 3 === e && setTimeout(animateWrappedBars, 280), _wrappedSlideConfigs[e] && setTimeout(() => animateWrappedCounter(_wrappedSlideConfigs[e]), 200), playClick())
}

function nextWrappedSlide() {
  wrappedIdx >= document.querySelectorAll(".wrapped-slide").length - 1 ? closeWrapped() : goWrappedSlide(wrappedIdx + 1)
}

function closeWrapped() {
  const e = document.getElementById("wrappedOverlay");
  e.classList.remove("visible"), stopWrappedCanvas();
  const t = document.getElementById("wrappedPosterBlur");
  t && t.classList.remove("vis"), setTimeout(() => e.classList.remove("open"), 600)
}
class AIBrain {
  constructor() {
    this._key = () => "mf_ai_brain_" + (getActiveProfileId() || "default"), this.memory = this._load()
  }
  _load() {
    try {
      const e = localStorage.getItem(this._key());
      return e ? JSON.parse(e) : this._defaultMemory()
    } catch {
      return this._defaultMemory()
    }
  }
  _defaultMemory() {
    return {
      genrePreferences: {},
      genreIdPrefs: {},
      watchedCount: 0,
      ratings: {},
      ratedGenres: {},
      watchedSlugs: {},
      watchedTmdbIds: {},
      wt: {},
      sessionGenres: [],
      totalEpsWatched: 0,
      lastActive: Date.now()
    }
  }
  reloadForProfile() {
    this.memory = this._load()
  }
  save() {
    try {
      localStorage.setItem(this._key(), JSON.stringify(this.memory))
    } catch (e) {}
  }
  _tmdbMap(e) {
    return {
      Comedy: "komedie",
      "Action & Adventure": "akcni",
      "Sci-Fi & Fantasy": "sci-fi",
      Drama: "drama",
      Family: "rodinny",
      Mystery: "krimi",
      Animation: "animovany",
      Horror: "horor",
      Adventure: "dobrodruzny",
      Crime: "krimi",
      "Science Fiction": "sci-fi",
      Fantasy: "fantasy",
      Action: "akcni",
      Thriller: "napinavy",
      Romance: "romantika",
      Documentary: "dokument",
      "War & Politics": "valecny",
      Western: "western",
      History: "historicky",
      Music: "hudba",
      Kids: "detsky",
      Reality: "reality",
      Talk: "talk-show",
      News: "zpravodajstvi",
      Soap: "telenovela"
    } [e] || e.toLowerCase().replace(/\s+/g, "-")
  }
  boostGenres(e, t = .1) {
    e?.length && (e.forEach(e => {
      const n = e.toLowerCase().replace(/\s+/g, "-");
      this.memory.genrePreferences[n] = Math.min(1, (this.memory.genrePreferences[n] || 0) + t)
    }), this.save())
  }
  boostGenresFromTmdb(e, t = .1) {
    e?.length && (e.forEach(e => {
      const n = this._tmdbMap(e);
      this.memory.genrePreferences[n] = Math.min(1, (this.memory.genrePreferences[n] || 0) + t)
    }), this.save())
  }
  boostGenreIds(e, t = .1) {
    e?.length && (e.forEach(e => {
      this.memory.genreIdPrefs[e] = Math.min(1, (this.memory.genreIdPrefs[e] || 0) + t)
    }), this.save())
  }
  recordWatch(e, t) {
    this.memory.watchedCount = (this.memory.watchedCount || 0) + 1, this.memory.totalEpsWatched = (this.memory.totalEpsWatched || 0) + 1, this.memory.watchedSlugs[e] = (this.memory.watchedSlugs[e] || 0) + 1, t?.length && this.boostGenresFromTmdb(t, .06), this.memory.sessionGenres || (this.memory.sessionGenres = []), t?.length && (this.memory.sessionGenres = [...t.slice(0, 2), ...this.memory.sessionGenres].slice(0, 10)), this.memory.lastActive = Date.now(), typeof db !== "undefined" && db[e]?.name && t?.length && (this.memory.lastWatchedName = db[e].name, this.memory.lastWatchedGenres = t, this.memory.lastWatchedSlug = e), this.save()
  }
  recordTmdbSeen(e) {
    e && (this.memory.watchedTmdbIds[e] = !0), this.save()
  }
  // Volá se při ProfileGate.activateProfile() — preference postupně
  // vyprchávají, když profil delší dobu nikdo nepoužívá.
  applyDecay() {
    const e = Date.now(),
      t = (e - (this.memory.lastActive || e)) / 864e5,
      n = Math.max(.92, 1 - .01 * t);
    Object.keys(this.memory.genrePreferences).forEach(e => {
      this.memory.genrePreferences[e] *= n, this.memory.genrePreferences[e] < .01 && delete this.memory.genrePreferences[e]
    }), Object.keys(this.memory.genreIdPrefs).forEach(e => {
      this.memory.genreIdPrefs[e] *= n, this.memory.genreIdPrefs[e] < .01 && delete this.memory.genreIdPrefs[e]
    }), this.save()
  }
  recordWatchTime() {
    const e = (new Date).getHours(),
      t = e < 6 ? "noc" : e < 12 ? "rano" : e < 18 ? "odpoledne" : "vecer";
    this.memory.wt || (this.memory.wt = {}), this.memory.wt[t] = (this.memory.wt[t] || 0) + 1, this.save()
  }
  getTopGenres(e = 3) {
    return Object.entries(this.memory.genrePreferences).sort((e, t) => t[1] - e[1]).slice(0, e).map(e => e[0])
  }
}
const aiBrain = new AIBrain;
let aiHistory = [];
try {
  aiHistory = safeLS(uKey("mf_ai_history"), "[]")
} catch {}
let ttsEnabled = !1,
  speechSynth = window.speechSynthesis,
  aiMsgDay = 0,
  AI_DAY_LIMIT = 999;

function saveAiUsage() {
  const e = (new Date).toDateString();
  localStorage.setItem("mf_ai_usage", JSON.stringify({
    date: e,
    count: aiMsgDay
  }))
}

function saveAiHistory() {
  localStorage.setItem(uKey("mf_ai_history"), JSON.stringify(aiHistory.slice(-40)))
}

function updateMsgCounter() {
  const e = document.getElementById("aiMsgCountNum"),
    t = document.getElementById("aiMsgCountMax"),
    n = AI_DAY_LIMIT - aiMsgDay;
  e && (e.textContent = n, e.style.color = n <= 5 ? "rgba(255,80,80,0.95)" : n <= 10 ? "rgba(255,190,0,0.95)" : "var(--accent)"), t && (t.textContent = "zbývá dnes");
  const o = document.getElementById("aiLimitBar");
  o && (o.style.width = aiMsgDay / AI_DAY_LIMIT * 100 + "%", o.style.background = n <= 5 ? "rgba(255,80,80,0.7)" : n <= 10 ? "rgba(255,190,0,0.7)" : "rgba(0,122,255,0.5)")
}

function linkifyFilms(e) {
  return e.replace(/\b([A-ZÁÉÍÓÚŮŽŠŘČĎŤŇĚ][a-záéíóúůžšřčďťňěA-ZÁÉÍÓÚŮŽŠŘČĎŤŇĚ\s\-:]{3,40})\b/g, e => {
    if (["Ahoj", "Dobry", "Jsem", "Tvoj", "Tenhle", "Tato", "Tento", "Tohle", "Pokud", "Mohu", "Chces", "Zkus"].some(t => e.startsWith(t))) return e;
    encodeURIComponent(e.trim());
    return `<a class="ai-film-link" onclick="event.stopPropagation();window.open('https://svetserialu.to/serial/${slugifySvet(e.trim())}','_blank','noopener')">${e}</a>`
  })
}

function updateStatusBadge() {
  const e = document.getElementById("aiStatusDot"),
    t = document.getElementById("aiStatusModel"),
    n = document.getElementById("aiStatusSub"),
    o = localStorage.getItem("mf_gemini_key"),
    i = localStorage.getItem("mf_or_key"),
    a = localStorage.getItem("mf_groq_key"),
    s = localStorage.getItem("mf_jina_key"),
    r = localStorage.getItem("mf_tavily_key"),
    l = AI_DAY_LIMIT - aiMsgDay,
    c = l <= 10 ? " · ⚠" + l + " zpráv" : "",
    d = [void 0 !== _tfReady && _tfReady ? "🧠LocalAI" : "", a ? "⚡Groq" : "", s ? "👁Jina" : "", r ? "🌐Tavily" : ""].filter(Boolean).join(" · ");
  o ? (e.className = "ai-status-dot", t.textContent = "Gemini 2.0 Flash", n.textContent = (d ? d + " · " : "") + "Nastavení" + c) : i ? (e.className = "ai-status-dot warn", t.textContent = "OpenRouter (záloha)", n.textContent = (d ? d + " · " : "") + "Nastavení" + c) : (e.className = "ai-status-dot error", t.textContent = "Žádný klíč", n.textContent = "Klikni pro nastavení AI"), updateMsgCounter()
}

function openApikeyOverlay() {
  const e = document.getElementById("aiApikeyOverlay");
  e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible")));
  const t = localStorage.getItem("mf_gemini_key");
  t && (document.getElementById("aiGeminiKeyInput").value = t);
  const n = localStorage.getItem("mf_or_key");
  n && (document.getElementById("aiOrKeyInput").value = n);
  const o = localStorage.getItem("mf_groq_key");
  o && (document.getElementById("aiGroqKeyInput").value = o, document.getElementById("groqStatus").textContent = "✅ Groq aktivní");
  const i = localStorage.getItem("mf_jina_key");
  i && "__enabled__" !== i && (document.getElementById("aiJinaKeyInput").value = i);
  const a = localStorage.getItem("mf_tavily_key");
  a && (document.getElementById("aiTavilyKeyInput").value = a)
}

function openApikeyOverlayOnTrakt() {
  openApikeyOverlay(), setTimeout(() => {
    const e = [...document.querySelectorAll(".ai-key-tab")].find(e => e.textContent.includes("Trakt"));
    e && switchKeyTab("trakt", e)
  }, 50)
}

function updateTraktSidebarLabel() {
  const e = localStorage.getItem("trakt_access_token"),
    t = localStorage.getItem("trakt_username"),
    n = document.getElementById("traktSidebarLbl");
  n && (n.textContent = e ? `Trakt.tv — ${t||"Připojeno"} ✓` : "Trakt.tv — Nepřipojen")
}

function closeApikeyOverlay() {
  const e = document.getElementById("aiApikeyOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 280)
}

function switchKeyTab(e, t) {
  document.querySelectorAll(".ai-key-tab").forEach(e => e.classList.remove("active")), document.querySelectorAll(".ai-key-panel").forEach(e => e.classList.remove("active")), t.classList.add("active");
  document.getElementById({
    gemini: "keyPanelGemini",
    or: "keyPanelOr",
    groq: "keyPanelGroq",
    jina: "keyPanelJina",
    tavily: "keyPanelTavily",
    trakt: "keyPanelTrakt"
  } [e] || "keyPanelGemini")?.classList.add("active"), "trakt" === e && aiTraktRefreshStatus()
}

function aiTraktRefreshStatus() {
  const e = localStorage.getItem("trakt_access_token"),
    t = localStorage.getItem("trakt_username"),
    n = document.getElementById("aiTraktDot"),
    o = document.getElementById("aiTraktStatusLbl"),
    i = document.getElementById("aiTraktUser"),
    a = document.getElementById("aiTraktConnectBtn"),
    s = document.getElementById("aiTraktDisconnectBtn");
  e ? (n.style.background = "#2ecc71", n.style.boxShadow = "0 0 8px rgba(46,204,113,0.6)", o.textContent = "Připojeno", i.textContent = t || "", a.style.display = "none", s.style.display = "block") : (n.style.background = "#555", n.style.boxShadow = "none", o.textContent = "Nepřipojen", i.textContent = "", a.style.display = "block", s.style.display = "none")
}

function aiTraktConnect() {
  const e = document.getElementById("aiTraktClientIdInput").value.trim();
  e && localStorage.setItem("trakt_client_id_user", e), traktStartAuth(), document.getElementById("aiTraktPinWrap").style.display = "block"
}

function aiTraktVerifyPin() {
  const e = document.getElementById("aiTraktPinInput").value.trim().toUpperCase();
  document.getElementById("traktPinInput").value = e, traktSubmitPin(), setTimeout(aiTraktRefreshStatus, 1500)
}

function aiTraktDisconnect() {
  ["trakt_access_token", "trakt_refresh_token", "trakt_username", "trakt_expires_at"].forEach(e => localStorage.removeItem(e)), document.getElementById("traktFab")?.classList.remove("connected"), aiTraktRefreshStatus(), showToast("Trakt odpojen")
}

function saveGeminiKey() {
  const e = document.getElementById("aiGeminiKeyInput").value.trim();
  e && (localStorage.setItem("mf_gemini_key", e), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey("mf_gemini_key", e), closeApikeyOverlay(), updateStatusBadge(), showToast("✦ Gemini aktivován!"))
}

function saveOrKey() {
  const e = document.getElementById("aiOrKeyInput").value.trim();
  e && (localStorage.setItem("mf_or_key", e), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey("mf_or_key", e), closeApikeyOverlay(), updateStatusBadge(), showToast("↻ OpenRouter přidán!"))
}

function saveGroqKey() {
  const e = document.getElementById("aiGroqKeyInput").value.trim();
  e && (localStorage.setItem("mf_groq_key", e), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey("mf_groq_key", e), showToast("⚡ Groq aktivován! Slugy se budou čistit AI."), document.getElementById("groqStatus").textContent = "✅ Groq aktivní — automatické čištění URL slugů", updateStatusBadge())
}

function saveJinaKey() {
  const e = document.getElementById("aiJinaKeyInput").value.trim() || "__enabled__";
  localStorage.setItem("mf_jina_key", e), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey("mf_jina_key", e), closeApikeyOverlay(), showToast("👁 Jina Reader aktivována! Budu ověřovat odkazy.")
}

function saveTavilyKey() {
  const e = document.getElementById("aiTavilyKeyInput").value.trim();
  e && (localStorage.setItem("mf_tavily_key", e), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey("mf_tavily_key", e), closeApikeyOverlay(), showToast("🌐 Tavily aktivován! Záložní vyhledávač odkazů."))
}

function toggleAiPanel() {
  aiPanelOpen ? closeAiPanel() : openAiPanel()
}

function openAiPanel() {
  const e = document.getElementById("aiFullscreen");
  e.style.transform = "translateX(18px)", e.style.opacity = "0", e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => {
    e.classList.add("visible"), e.style.transform = "", e.style.opacity = ""
  }));
  const t = document.getElementById("aiFab");
  t && t.classList.add("open"), aiPanelOpen = !0, document.getElementById("aiInput").focus(), renderAiWatchList(), updateStatusBadge(), updateMsgCounter(), document.getElementById("aiProfileText").value = localStorage.getItem("mf_user_profile") || "", pauseBgParticles()
}

function closeAiPanel() {
  const e = document.getElementById("aiFullscreen");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 340);
  const t = document.getElementById("aiFab");
  t && t.classList.remove("open"), aiPanelOpen = !1, resumeBgParticles()
}

function renderAiWatchList() {
  const e = document.getElementById("aiWatchList");
  e && (e.innerHTML = "", Object.keys(db).forEach(t => {
    const n = db[t],
      o = calcProgress(t),
      i = (findNextEp(t), document.createElement("div"));
    i.className = "ai-watch-item", i.onclick = () => {
      closeAiPanel(), openSeries(t)
    }, i.innerHTML = `<div class="ai-watch-poster"><img src="${n._poster||n.poster||""}" alt="" onerror="this.style.display='none'"></div><div class="ai-watch-info"><div class="ai-watch-name">${n.name}</div><div class="ai-watch-progress-wrap"><div class="ai-watch-bar"><div class="ai-watch-bar-fill" style="width:${o.pct}%"></div></div><span class="ai-watch-pct">${o.pct}%</span></div></div>`, e.appendChild(i)
  }))
}

function saveUserProfile() {
  const e = document.getElementById("aiProfileText").value;
  localStorage.setItem("mf_user_profile", e), showToast("✓ Profil ulozen!"), showAutosave("saved")
}

function clearAiHistory() {
  aiHistory = [], saveAiHistory();
  document.getElementById("aiMessages").innerHTML = '<div class="ai-msg-wrap ai"><div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>Historia smazana. Cim mohu pomoct? 🎬</div></div>', showToast("Historie smazana")
}

function showAddSeriesForm() {
  const e = document.getElementById("aiAddForm");
  e.classList.toggle("visible"), e.classList.contains("visible") && document.getElementById("aiAddName").focus()
}

function aiConfirmAddSeries() {
  const e = document.getElementById("aiAddName").value.trim(),
    t = document.getElementById("aiAddSlug").value.trim() || e.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  e && (db[t] || (db[t] = {
    name: e,
    tmdbId: 0,
    poster: "",
    totalEps: 0,
    runtime: 22
  }, epsBySeason[t] = [12]), document.getElementById("aiAddForm").classList.remove("visible"), document.getElementById("aiAddName").value = "", document.getElementById("aiAddSlug").value = "", showToast(`✓ ${e} pridan!`), renderAiWatchList())
}

function toggleTts() {
  ttsEnabled = !ttsEnabled, document.getElementById("aiTtsToggle").classList.toggle("tts-on", ttsEnabled), showToast(ttsEnabled ? "🔊 Hlas zapnut" : "🔇 Hlas vypnut")
}
async function aiSend() {
  const e = document.getElementById("aiInput"),
    t = e.value.trim();
  if (!t || aiThinking) return;
  if (aiMsgDay >= AI_DAY_LIMIT) return void showToast("Denni limit dosažen. Zítra zase!");
  aiMsgDay++, saveAiUsage(), updateMsgCounter(), e.value = "", e.style.height = "";
  const n = document.createElement("div");
  n.className = "ai-msg-wrap user", n.innerHTML = `<div class="ai-msg-avatar">👤</div><div class="ai-msg-bubble">${escapeHTML(t)}</div>`, n.style.opacity = "0", n.style.transform = "translateY(10px)", document.getElementById("aiMessages").appendChild(n), requestAnimationFrame(() => {
    n.style.transition = "opacity 0.3s ease, transform 0.38s cubic-bezier(0.34,1.2,0.64,1)", n.style.opacity = "1", n.style.transform = "translateY(0)"
  });
  const o = document.createElement("div");
  o.className = "ai-thinking-wrap ai-msg-wrap ai", o.innerHTML = '<div class="ai-msg-avatar">✦</div><div class="ai-thinking-bubble"><span></span><span></span><span></span></div>', document.getElementById("aiMessages").appendChild(o), document.getElementById("aiMessages").scrollTop = 99999, aiThinking = !0, document.getElementById("aiSendBtn").disabled = !0, aiHistory.push({
    role: "user",
    content: t
  });
  let i = "";
  try {
    const e = await analyzeUserMood(t);
    e && e.moodLabel ? (i = " Nálada: " + e.moodLabel + ".", showMoodBadge(e.moodLabel), aiBrain.boostGenres([e.mood || "light"], .05)) : showMoodBadge(null)
  } catch (e) {}
  const a = getWatched(),
    s = Object.keys(a).length,
    r = aiBrain.getTopGenres(3).join(", ") || "neznamy",
    l = localStorage.getItem("mf_user_profile") || "",
    c = (new Date).getHours(),
    d = c < 5 ? "noc" : c < 12 ? "rano" : c < 18 ? "odpoledne" : c < 22 ? "vecer" : "pozde v noci",
    m = safeLS(uKey("mf_ratings"), "{}"),
    u = Object.values(m).filter(e => "loved" === e.rating).map(e => e.name).join(", ") || "zadne",
    p = Object.values(m).filter(e => "meh" === e.rating).map(e => e.name).join(", ") || "zadne",
    g = Object.entries(db).map(([e, t]) => {
      const n = calcProgress(e);
      return `${t.name} (${n.pct}% zhlédnuto${t._rating?", ★"+t._rating:""})`
    }).join(", "),
    f = (localStorage.getItem("mf_groq_key"), `Jsi MujFlix AI – osobní filmový průvodce. Odpovídáš VŽDY v češtině, jsi přátelský, konkrétní a osobní jako kamarád který miluje filmy.\n\nPROFIL UŽIVATELE:\n- Zhlédnuté epizody: ${s}\n- Oblíbené žánry: ${r||"zatím neznámé"}\n- Denní čas: ${d}\n- Miluje: ${u}\n- Nelíbilo se: ${p}\n${l?"- Osobní poznámky: "+l:""}${i?"\n- Nálada dnes: "+i:""}\n\nSLEDOVANÉ TITULY (z MujFlixu):\n${Object.entries(db).slice(0,8).map(([e,t])=>{const n=calcProgress(e);let o=`${t.name} (${n.pct}% zhlédnuto`;return t._rating&&(o+=`, ★${t._rating}`),t.tmdbRating&&(o+=`, TMDB:${t.tmdbRating}`),t.genres&&t.genres.length&&(o+=`, žánr:${t.genres.slice(0,2).join("/")}`),o+")"}).join(", ")||g}\n\nSTREAMOVACÍ WEBY (Czech/Slovak):\n- Filmy: bombuj.si, prima+, netflix.com\n- Seriály: svetserialu.to, hbogo.com, netflix.com, disney+\n- Zdarma: prehraj.to, webshare.cz (přes prohlížeč)\n- Uživatel může kliknout na ikonu 🎬 u titulu pro automatické nalezení zdroje\n\nPRAVIDLA:\n- Používej **tučný text** pro názvy, hodnocení a klíčové info\n- Vždy navrhuj KONKRÉTNÍ tituly s krátkým odůvodněním proč právě tento\n- Zmiňuj kde streamovat (platforma) ale NIKDY nekopíruj přímé URL — jen název platformy\n- Buď stručný — max 4-5 vět pokud není požadováno víc\n- Pokud se ptají na zdroj/kde sledovat → řekni jen platformu, pro přímý odkaz ať kliknou na 🔍 ikonu u titulu\n- Když nevíš přesně, raději řekni že nevíš než vymýšlíš\n- Občas použij emoji 🎬🍿✨ pro živost\n- NIKDY neříkej "jako AI" nebo "jako jazykový model" – jsi guru, ne robot\n- Pokud uživatel píše o konkrétním titulu ze své knihovny, komentuj jeho postup a náladu`);
  try {
    const e = localStorage.getItem("mf_gemini_key"),
      t = localStorage.getItem("mf_or_key");
    let n = "";
    if (e) {
      const o = aiHistory.slice(-10).map(e => ({
          role: "assistant" === e.role ? "model" : "user",
          parts: [{
            text: e.content
          }]
        })),
        i = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
      let a = "";
      for (const t of i) {
        const i = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${t}:generateContent?key=${e}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{
                  text: f
                }]
              },
              contents: o,
              generationConfig: {
                maxOutputTokens: 600,
                temperature: .85
              }
            })
          }),
          s = await i.json();
        if (429 !== i.status) {
          if (!i.ok) {
            const e = s?.error?.message || "Chyba API";
            n = 400 === i.status || 403 === i.status ? `❗ Chyba Gemini klíče: ${e}. Zkontroluj klic v nastaveni.` : `⚠ Gemini API chyba (${i.status}): ${e}`;
            break
          }
          if (n = s?.candidates?.[0]?.content?.parts?.[0]?.text || "", !n) {
            const e = s?.promptFeedback?.blockReason;
            n = e ? `⚠ Zpráva zablokována: ${e}` : "⚠ Prázdná odpověď. Zkus to jinak."
          }
          break
        }
        a = `⚠ Gemini kvóta překročena (${t}). Zkouším záložní model...`
      }
      if (!n && a && t) try {
        const e = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`,
              "HTTP-Referer": "https://mujflix.local"
            },
            body: JSON.stringify({
              model: "mistralai/mistral-7b-instruct:free",
              messages: [{
                role: "system",
                content: f
              }, ...aiHistory.slice(-10)],
              max_tokens: 500
            })
          }),
          o = await e.json();
        n = o?.choices?.[0]?.message?.content || "⚠ OpenRouter vrátil prázdnou odpověď.", n && !n.startsWith("⚠") && showToast("📡 Gemini kvóta – přepnuto na OpenRouter zálohu")
      } catch {
        n = "⚠ Gemini i OpenRouter jsou momentálně nedostupné. Zkus to za chvíli."
      } else !n && a && (n = "⚠ **Gemini kvóta dosažena.** Free tier má denní limit.\n\n💡 Řešení:\n1. Počkej do zítřka\n2. Nastav **OpenRouter** jako zálohu (ikona robota → záložka OpenRouter)\n3. Nebo si poříď placený Gemini klic")
    } else if (t) {
      const e = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
            "HTTP-Referer": "https://mujflix.local"
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            messages: [{
              role: "system",
              content: f
            }, ...aiHistory.slice(-10)],
            max_tokens: 500
          })
        }),
        o = await e.json();
      n = o?.choices?.[0]?.message?.content || "⚠ OpenRouter vrátil prázdnou odpověď. Zkus to znovu."
    } else n = "❗ Nastav AI klic kliknutim na ikonu robota v AI panelu. Podporujeme **Gemini** (1000x/den zdarma) nebo **OpenRouter**.";
    aiHistory.push({
      role: "assistant",
      content: n
    }), saveAiHistory(), o.remove();
    const i = n.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>"),
      a = document.createElement("div");
    if (a.className = "ai-msg-wrap ai", a.innerHTML = `<div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>${linkifyFilms(i)}<div class="ai-msg-feedback"><button class="ai-fb-btn" onclick="this.parentElement.style.display='none';showToast('Diky! 👍')">👍</button><button class="ai-fb-btn" onclick="this.parentElement.style.display='none';showToast('Priste lepe!')">👎</button></div></div>`, a.style.opacity = "0", a.style.transform = "translateY(12px)", document.getElementById("aiMessages").appendChild(a), requestAnimationFrame(() => {
        a.style.transition = "opacity 0.32s ease, transform 0.42s cubic-bezier(0.34,1.18,0.64,1)", a.style.opacity = "1", a.style.transform = "translateY(0)"
      }), document.getElementById("aiMessages").scrollTop = 99999, ttsEnabled && speechSynth) {
      speechSynth.cancel();
      const e = new SpeechSynthesisUtterance(n.replace(/<[^>]+>/g, "").substring(0, 200));
      e.lang = "cs-CZ", e.rate = .95, "function" == typeof aiBubbleShow && aiBubbleShow(e), speechSynth.speak(e)
    }
  } catch (e) {
    o.remove();
    const t = document.createElement("div");
    t.className = "ai-msg-wrap ai", t.innerHTML = '<div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>⚠ Chyba pripojeni. Zkontroluj API klic nebo internet.</div>', document.getElementById("aiMessages").appendChild(t)
  }
  aiThinking = !1, document.getElementById("aiSendBtn").disabled = !1
}

function aiQuick(e) {
  document.getElementById("aiInput").value = e, setTimeout(aiSend, 80)
}

function handleAiInputKey(e) {
  "Enter" !== e.key || e.shiftKey || (e.preventDefault(), aiSend())
}

function autoResizeInput(e) {
  e.style.height = "", e.style.height = Math.min(e.scrollHeight, 140) + "px"
}(() => {
  const e = (new Date).toDateString();
  let t;
  try {
    t = safeLS("mf_ai_usage", '{"date":"","count":0}')
  } catch {
    t = {
      date: "",
      count: 0
    }
  }
  t.date === e ? aiMsgDay = t.count : (localStorage.setItem("mf_ai_usage", JSON.stringify({
    date: e,
    count: 0
  })), aiMsgDay = 0)
})();
let recog = null,
  _voiceMode = "chat";
const _SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function startVoice(e) {
  if (!_SR) {
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    return void showToast(isFirefox ? "Firefox hlasové ovládání nepodporuje 😔 Zkus Chrome nebo Edge" : "Hlasové ovládání není podporováno v tomto prohlížeči", "error");
  }
  _voiceMode = e || "chat";
  const t = document.getElementById("aiVoiceOverlay"),
    n = document.getElementById("aiVoiceModeLbl");
  if (n && (n.textContent = "dictate" === _voiceMode ? "🎙 Diktuji..." : "🎙 Mluv — pošlu to AI"), t.style.display = "flex", requestAnimationFrame(() => {
      t.style.opacity = "1"
    }), recog) try {
    recog.stop()
  } catch {}
  recog = new _SR, recog.lang = "cs-CZ", recog.interimResults = !0, recog.continuous = "dictate" === _voiceMode, recog.onresult = e => {
    const t = Array.from(e.results).filter(e => e.isFinal).map(e => e[0].transcript).join(""),
      n = Array.from(e.results).filter(e => !e.isFinal).map(e => e[0].transcript).join(""),
      o = document.getElementById("aiVoiceTranscript");
    if (o && (o.innerHTML = (t ? "<strong>" + t + "</strong>" : "") + (n ? '<span style="opacity:0.5"> ' + n + "</span>" : "")), "chat" === _voiceMode) e.results[e.results.length - 1].isFinal && (document.getElementById("aiInput").value = Array.from(e.results).map(e => e[0].transcript).join(""), stopVoice(), aiPanelOpen || openAiPanel(), setTimeout(aiSend, 250));
    else if (t) {
      const e = document.getElementById("aiInput");
      e && (e.value = (e.value ? e.value + " " : "") + t, autoResizeInput(e))
    }
  }, recog.onerror = e => {
    "not-allowed" === e.error ? showToast("Povol mikrofon v nastavení prohlížeče", "error") : "no-speech" !== e.error && showToast("Chyba mikrofonu: " + e.error, "error"), stopVoice()
  }, recog.onend = () => {
    "dictate" !== _voiceMode && stopVoice()
  }, recog.start()
}

function stopVoice() {
  if (recog) try {
    recog.stop()
  } catch {}
  const e = document.getElementById("aiVoiceOverlay");
  e && (e.style.opacity = "0", setTimeout(() => {
    e.style.display = "none";
    const t = document.getElementById("aiVoiceTranscript");
    t && (t.innerHTML = "")
  }, 280))
}
let _tfPipeline = null,
  _tfLoading = !1,
  _tfReady = !1;
async function initTransformers() {}

function quickMoodDetect(e) {
  const t = e.toLowerCase(),
    n = [{
      k: ["komedi", "vtip", "smích", "smich", "humor", "legra", "sranda", "depk", "nud"],
      r: {
        mood: "light",
        ml: "😄 Komedie"
      }
    }, {
      k: ["akci", "akce", "výbuch", "bojov", "superhrdinu", "napínavý"],
      r: {
        mood: "action",
        ml: "💥 Akce"
      }
    }, {
      k: ["drama", "dojemn", "pláč", "plac", "smutný", "emoci"],
      r: {
        mood: "deep",
        ml: "🎭 Drama"
      }
    }, {
      k: ["horor", "děsiv", "strach", "zombie", "upír", "upir"],
      r: {
        mood: "dark",
        ml: "👻 Horor"
      }
    }, {
      k: ["sci-fi", "scifi", "vesmír", "robot", "budoucnost"],
      r: {
        mood: "wonder",
        ml: "🚀 Sci-Fi"
      }
    }, {
      k: ["romantick", "lásk", "lask", "romance", "zamilovan"],
      r: {
        mood: "warm",
        ml: "❤️ Romantika"
      }
    }, {
      k: ["fantasy", "pohádku", "pohadku", "drak", "magie"],
      r: {
        mood: "wonder",
        ml: "🧙 Fantasy"
      }
    }, {
      k: ["krimi", "detektiv", "vražd", "vrazd", "mystery"],
      r: {
        mood: "mystery",
        ml: "🔍 Krimi"
      }
    }, {
      k: ["animovan", "anime", "kreslen"],
      r: {
        mood: "fun",
        ml: "🎨 Animák"
      }
    }];
  for (const e of n)
    if (e.k.some(e => t.includes(e))) return {
      mood: e.r.mood,
      moodLabel: e.r.ml
    };
  return null
}
async function analyzeUserMood(e) {
  const t = quickMoodDetect(e);
  if (t) return t;
  if (!_tfReady || !_tfPipeline) return null;
  try {
    const t = ["komedie humor", "akce", "drama", "horor", "sci-fi", "romantika", "fantasy", "krimi"],
      n = await _tfPipeline(e, t, {
        multi_label: !1
      });
    if (n.scores[0] < .4) return null;
    const o = {
      "komedie humor": "😄 Komedie",
      akce: "💥 Akce",
      drama: "🎭 Drama",
      horor: "👻 Horor",
      "sci-fi": "🚀 Sci-Fi",
      romantika: "❤️ Romantika",
      fantasy: "🧙 Fantasy",
      krimi: "🔍 Krimi"
    };
    return {
      mood: n.labels[0],
      moodLabel: o[n.labels[0]] || n.labels[0]
    }
  } catch {
    return null
  }
}

function showMoodBadge(e) {
  let t = document.getElementById("aiMoodBadge");
  if (!t) {
    t = document.createElement("div"), t.id = "aiMoodBadge", t.style.cssText = "display:inline-flex;align-items:center;gap:5px;background:rgba(0,122,255,0.1);border:1px solid rgba(0,122,255,0.3);border-radius:20px;padding:3px 10px;font-size:0.62rem;font-weight:700;color:var(--accent);margin:0 0 6px 0;transition:opacity 0.3s;";
    const e = document.getElementById("aiInput");
    e && e.parentElement && e.parentElement.insertBefore(t, e)
  }
  t.style.opacity = e ? "1" : "0", e && (t.textContent = "✦ Nálada: " + e)
}
const _groqCache = new Map;
async function groqCleanSlug(e, t) {
  const n = getGroqKey();
  if (!n) return null;
  const o = e + "|" + t;
  if (_groqCache.has(o)) return _groqCache.get(o);
  try {
    const i = "movie" === t ? "bombuj.si format /online-film-{slug}" : "svetserialu.to format /serial/{slug}",
      a = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + n
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 40,
          temperature: 0,
          messages: [{
            role: "user",
            content: "URL slug for " + i + '. Title: "' + e + '". Rules: lowercase hyphens no accents no year. Reply ONLY the slug.'
          }]
        })
      });
    if (!a.ok) return null;
    const s = await a.json(),
      r = (s?.choices?.[0]?.message?.content || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
    return r && _groqCache.set(o, r), r || null
  } catch {
    return null
  }
}
async function jinaVerifyUrl(e) {
  try {
    const t = getJinaKey(),
      n = {
        Accept: "text/plain"
      };
    t && "__enabled__" !== t && t.length > 10 && (n.Authorization = "Bearer " + t);
    const o = await fetch("https://r.jina.ai/" + e, {
      headers: n
    });
    if (!o.ok) return !1;
    const i = await o.text();
    if (i.length < 200) return !1;
    const a = i.toLowerCase();
    return !["404", "nenalezeno", "not found", "neexistuje", "page not found"].some(e => a.includes(e))
  } catch {
    return !1
  }
}
async function tavilyFindUrl(e, t) {
  const n = getTavilyKey();
  if (!n) return null;
  try {
    const o = "movie" === t ? "bombuj.si" : "svetserialu.to",
      i = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: n,
          query: e + " " + ("movie" === t ? "film" : "serial") + " " + o,
          max_results: 5,
          include_domains: [o]
        })
      });
    if (!i.ok) return null;
    const a = await i.json(),
      s = (a?.results || []).find(e => e.url && e.url.includes(o));
    return s?.url || null
  } catch {
    return null
  }
}
let _pTimer = null;

function showPipelineProgress(e, t) {
  let n = document.getElementById("mf-prog");
  n || (n = document.createElement("div"), n.id = "mf-prog", n.style.cssText = "position:fixed;bottom:130px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(6,6,8,0.97);font-family:'Outfit',sans-serif;font-size:0.72rem;padding:8px 18px;border-radius:40px;border:1px solid rgba(0,122,255,0.2);backdrop-filter:blur(20px);white-space:nowrap;pointer-events:none;transition:opacity 0.3s;", document.body.appendChild(n)), n.innerHTML = e.map((e, n) => n < t ? '<span style="color:rgba(100,255,100,0.8)">✓ ' + e + "</span>" : n === t ? '<span style="color:var(--accent)">' + e + " ●</span>" : '<span style="opacity:0.3">' + e + "</span>").join(" → "), n.style.opacity = "1", clearTimeout(_pTimer)
}

function hidePipelineProgress() {
  const e = document.getElementById("mf-prog");
  e && (e.style.opacity = "0")
}
const _urlCache2 = new Map;

function showFinderModal(e, t, n) {
  let o = document.getElementById("mfFinderModal");
  o || (o = document.createElement("div"), o.id = "mfFinderModal", o.style.cssText = "\n          position:fixed;inset:0;z-index:20000;\n          display:flex;align-items:center;justify-content:center;\n          background:rgba(0,0,0,0);\n          backdrop-filter:blur(0px);\n          transition:all 0.38s ease;\n          pointer-events:none;\n        ", o.innerHTML = '\n          <div id="mfFinderBox" style="\n            width:min(520px,92vw);\n            background:rgba(14,14,22,0.92);\n            backdrop-filter:blur(52px) saturate(2.2);\n            -webkit-backdrop-filter:blur(52px) saturate(2.2);\n            border:1px solid rgba(255,255,255,0.13);\n            border-radius:24px;\n            box-shadow:0 40px 100px rgba(0,0,0,0.9),inset 0 1.5px 0 rgba(255,255,255,0.18),inset 0 -1px 0 rgba(0,0,0,0.2);\n            transform:translateY(32px) scale(0.94);\n            transition:transform 0.42s cubic-bezier(0.34,1.15,0.64,1);\n            overflow:hidden;\n          ">\n            \x3c!-- Header --\x3e\n            <div style="padding:20px 22px 16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px;">\n              <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.25);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">🔍</div>\n              <div style="flex:1;min-width:0;">\n                <div id="mfFinderTitle" style="font-size:0.92rem;font-weight:800;letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>\n                <div id="mfFinderSub" style="font-size:0.6rem;color:rgba(255,255,255,0.38);margin-top:1px;"></div>\n              </div>\n              <button onclick="closeFinderModal()" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:0.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;">✕</button>\n            </div>\n            \x3c!-- Progress / Results --\x3e\n            <div id="mfFinderContent" style="padding:20px 22px 22px;min-height:120px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;">\n              <div id="mfFinderSpinner" style="width:28px;height:28px;border:2px solid rgba(0,122,255,0.15);border-top-color:rgba(0,122,255,0.8);border-right-color:rgba(0,122,255,0.4);border-radius:50%;animation:mfFinderSpin 0.7s linear infinite;"></div>\n              <div id="mfFinderStatus" style="font-size:0.72rem;color:rgba(255,255,255,0.45);text-align:center;"></div>\n            </div>\n            \x3c!-- API Key prompt (hidden by default) --\x3e\n            <div id="mfFinderKeyPrompt" style="display:none;padding:0 22px 22px;">\n              <div style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin-bottom:12px;text-align:center;">Zadej Anthropic API klíč pro vyhledávání</div>\n              <div style="display:flex;gap:8px;">\n                <input id="mfFinderKeyInput" type="password" placeholder="sk-ant-..." style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 14px;color:#fff;font-size:0.78rem;outline:none;font-family:-apple-system,sans-serif;" />\n                <button id="mfFinderKeySave" style="padding:10px 16px;border-radius:12px;background:#007AFF;border:none;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;white-space:nowrap;">Uložit</button>\n              </div>\n              <div style="margin-top:16px;display:flex;gap:8px;">\n                <button onclick="mfFinderFallback()" style="flex:1;padding:11px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.72rem;font-weight:600;cursor:pointer;">Hledat ručně</button>\n              </div>\n            </div>\n          </div>\n        ', document.body.appendChild(o), document.getElementById("mfFinderKeySave").onclick = () => {
    const e = document.getElementById("mfFinderKeyInput").value.trim();
    e && (setAnthropicKey(e), document.getElementById("mfFinderKeyPrompt").style.display = "none", runFinder(window._mfFinderName, window._mfFinderType, window._mfFinderYear))
  }), o.style.display = "flex", o.style.opacity = "1", o.style.pointerEvents = "auto";
  const i = document.getElementById("mfFinderBox");
  i && (i.style.transform = "translateY(40px) scale(0.92)"), setTimeout(() => {
    o.style.background = "rgba(0,0,0,0.78)", o.style.backdropFilter = "blur(20px)", o.style.webkitBackdropFilter = "blur(20px)", i && (i.style.transform = "translateY(0) scale(1)")
  }, 10), document.getElementById("mfFinderTitle").textContent = e, document.getElementById("mfFinderSub").textContent = "movie" === t ? "🎬 Film · Hledám na bombuj.si…" : "📺 Seriál · Hledám na svetserialu.to…", document.getElementById("mfFinderContent").style.display = "flex", document.getElementById("mfFinderKeyPrompt").style.display = "none", setFinderStatus("Prohledávám zdroje…"), window._mfFinderName = e, window._mfFinderType = t, window._mfFinderYear = n || null
}

function closeFinderModal() {
  _cancelFinderCountdown();
  const e = document.getElementById("mfFinderModal");
  if (!e) return;
  e.style.opacity = "0", e.style.background = "rgba(0,0,0,0)", e.style.backdropFilter = "blur(0px)", e.style.webkitBackdropFilter = "blur(0px)";
  const t = document.getElementById("mfFinderBox");
  t && (t.style.transform = "translateY(40px) scale(0.92)"), setTimeout(() => {
    e.style.pointerEvents = "none", e.style.display = "none"
  }, 360)
}

function setFinderStatus(e, t = "") {
  const n = document.getElementById("mfFinderStatus");
  n && (n.textContent = (t ? t + " " : "") + e)
}
let _finderCountdownTimer = null;

function _cancelFinderCountdown() {
  _finderCountdownTimer && (clearInterval(_finderCountdownTimer), _finderCountdownTimer = null)
}

function _startFinderCountdown(e, t, n, o) {
  _cancelFinderCountdown();
  let i = o;
  t.textContent = i, n && (n.style.width = "100%"), _finderCountdownTimer = setInterval(() => {
    i--, t.textContent = i, n && (n.style.width = i / o * 100 + "%"), i <= 0 && (_cancelFinderCountdown(), closeFinderModal(), window.open(e, "_blank", "noopener"))
  }, 1e3)
}

function showFinderResults(e, t, n) {
  const o = document.getElementById("mfFinderContent");
  if (!o) return;
  const i = document.getElementById("mfFinderSpinner");
  if (i && (i.style.display = "none"), _cancelFinderCountdown(), !e || 0 === e.length) return void(o.innerHTML = `\n          <div style="text-align:center;padding:8px 0;">\n            <div style="font-size:2rem;margin-bottom:8px;">😕</div>\n            <div style="font-size:0.82rem;font-weight:700;margin-bottom:4px;">Nic nenalezeno</div>\n            <div style="font-size:0.65rem;color:rgba(255,255,255,0.38);margin-bottom:16px;">Zkus hledat ručně</div>\n            <div style="display:flex;gap:8px;justify-content:center;">\n              <button onclick="window.open('${"movie"===n?"https://www.bombuj.si/?s="+encodeURIComponent(t):"https://svetserialu.to/?s="+encodeURIComponent(t)}','_blank');closeFinderModal()" style="padding:10px 18px;border-radius:12px;background:#007AFF;border:none;color:#fff;font-size:0.75rem;font-weight:700;cursor:pointer;">Hledat ručně</button>\n              <button onclick="closeFinderModal()" style="padding:10px 16px;border-radius:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.75rem;font-weight:600;cursor:pointer;">Zavřít</button>\n            </div>\n          </div>`);
  const a = e.find(e => !e._fallback),
    s = window._mfFinderTmdbId || null,
    r = window._mfFinderType || n;
  let l = '<div style="width:100%;display:flex;flex-direction:column;gap:8px;">';
  if (a) {
    const e = new URL(a.url).hostname.replace("www.", ""),
      n = `https://www.google.com/s2/favicons?domain=${e}&sz=32`,
      o = s ? `\n          <button onclick="_cancelFinderCountdown();closeFinderModal();openMovieInCinema('${s}','${(t||"").replace(/'/g,"\\'")}','${r}');" style="flex:1;padding:10px;border-radius:12px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">\n            🎬 Kino\n          </button>` : "",
      i = `\n          <button onclick="_cancelFinderCountdown();window.open('${a.url}','_blank','noopener');closeFinderModal();" style="flex:1;padding:10px;border-radius:12px;background:${s?"rgba(255,255,255,0.09)":"#007AFF"};border:${s?"1px solid rgba(255,255,255,0.12)":"none"};color:#fff;font-size:0.78rem;font-weight:${s?"500":"700"};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">\n            <svg viewBox="0 0 24 24" width="13" height="13" fill="white"><polygon points="5 3 19 12 5 21 5 3"/>      </svg> ${s?"Bombuj / SvetSer.":"Otevřít na externím webu"}\n          </button>`;
    l += `\n          <div id="mfFinderBestResult" style="\n            border-radius:18px;\n            background:linear-gradient(135deg,rgba(0,122,255,0.18) 0%,rgba(0,122,255,0.07) 100%);\n            border:1.5px solid rgba(0,122,255,0.35);\n            padding:18px 18px 14px;\n            margin-bottom:2px;\n            box-shadow:0 8px 32px rgba(0,122,255,0.12),inset 0 1px 0 rgba(0,122,255,0.2);\n          ">\n            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">\n              <img alt="" src="${n}" width="20" height="20" style="border-radius:5px;opacity:0.9;" onerror="this.style.display='none'">\n              <div style="flex:1;min-width:0;">\n                <div style="font-size:0.85rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.title||t}</div>\n                <div style="font-size:0.58rem;color:rgba(0,180,255,0.7);margin-top:1px;">${e}</div>\n              </div>\n              <span style="font-size:0.6rem;background:rgba(0,122,255,0.2);color:rgba(100,200,255,0.9);padding:3px 8px;border-radius:20px;font-weight:700;">Nejlepší shoda</span>\n            </div>\n            <div style="display:flex;gap:8px;">\n              ${o}${i}\n            </div>\n          </div>`
  }
  const c = e.filter(e => e !== a);
  c.length && (l += '<div style="font-size:0.58rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:4px 2px 2px;">Další zdroje</div>', c.forEach(e => {
    const n = e.url ? new URL(e.url).hostname.replace("www.", "") : "",
      o = `https://www.google.com/s2/favicons?domain=${n}&sz=24`;
    l += `\n            <button onclick="_cancelFinderCountdown();window.open('${e.url}','_blank','noopener');closeFinderModal()" style="\n              display:flex;align-items:center;gap:12px;padding:11px 14px;\n              background:rgba(255,255,255,0.04);\n              border:1px solid rgba(255,255,255,0.08);\n              border-radius:12px;cursor:pointer;text-align:left;width:100%;\n              transition:all 0.2s ease;\n            " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.14)'" onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)'">\n              <img alt="" src="${o}" width="18" height="18" style="border-radius:4px;opacity:0.7;flex-shrink:0;" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\'><text y=\\'18\\' font-size=\\'16\\'>🔗</text></svg>'">\n              <div style="flex:1;min-width:0;">\n                <div style="font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.title||t}</div>\n                <div style="font-size:0.55rem;color:rgba(255,255,255,0.3);margin-top:1px;">${n}</div>\n              </div>\n              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>\n            </button>`
  })), l += "</div>", o.innerHTML = l
}
window.mfFinderFallback = function() {
  const e = window._mfFinderName || "",
    t = "movie" === (window._mfFinderType || "tv") ? `https://www.bombuj.si/?s=${encodeURIComponent(e)}` : `https://svetserialu.to/?s=${encodeURIComponent(e)}`;
  window.open(t, "_blank", "noopener"), closeFinderModal()
};
function getGeminiKey() {
  return localStorage.getItem("mf_gemini_key") || ""
}

function getAnthropicKey() {
  return localStorage.getItem("mf_anthropic_key") || ""
}

function setAnthropicKey(e) {
  localStorage.setItem("mf_anthropic_key", e), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey("mf_anthropic_key", e)
}

function getGroqKey() {
  return localStorage.getItem("mf_groq_key") || ""
}

function getJinaKey() {
  return localStorage.getItem("mf_jina_key") || ""
}

function getTavilyKey() {
  return localStorage.getItem("mf_tavily_key") || ""
}
const _VALID_DOMAINS = ["bombuj.si", "svetserialu.to", "prehraj.to", "webshare.cz", "sledujtefilmy.cz"];

function _isValidStreamUrl(e) {
  if (!e || "string" != typeof e) return !1;
  try {
    const t = new URL(e);
    if (!["http:", "https:"].includes(t.protocol)) return !1;
    const n = t.hostname.replace("www.", "");
    return "/" !== t.pathname && "" !== t.pathname && (!/[?&](s|q|search)=/.test(t.search) && (!/\/(search|hledej|results|index\.php)/.test(t.pathname) && _VALID_DOMAINS.some(e => n.endsWith(e))))
  } catch {
    return !1
  }
}

function _parseFinderJson(e) {
  if (!e) return null;
  try {
    const t = e.replace(/```json|```/gi, "").trim(),
      n = JSON.parse(t);
    if (n?.results) return n
  } catch {}
  const t = e.match(/\{[\s\S]*?"results"[\s\S]*?\}/);
  if (t) try {
    return JSON.parse(t[0])
  } catch {}
  const n = [...e.matchAll(/https?:\/\/(?:www\.)?(?:bombuj\.si|svetserialu\.to|prehraj\.to)[^\s"',<>\)\]]+/g)].map(e => e[0].replace(/[.,;:!?]+$/, "")).filter(_isValidStreamUrl);
  return n.length ? {
    results: n.map(e => ({
      url: e,
      title: e.split("/").filter(Boolean).pop()?.replace(/-/g, " ").replace(/\b\w/g, e => e.toUpperCase()) || "",
      site: new URL(e).hostname.replace("www.", "")
    }))
  } : null
}

function _slugify(e) {
  const t = {
    "á": "a",
    "č": "c",
    "ď": "d",
    "é": "e",
    "ě": "e",
    "í": "i",
    "ň": "n",
    "ó": "o",
    "ř": "r",
    "š": "s",
    "ť": "t",
    "ú": "u",
    "ů": "u",
    "ý": "y",
    "ž": "z",
    "Á": "a",
    "Č": "c",
    "Ď": "d",
    "É": "e",
    "Ě": "e",
    "Í": "i",
    "Ň": "n",
    "Ó": "o",
    "Ř": "r",
    "Š": "s",
    "Ť": "t",
    "Ú": "u",
    "Ů": "u",
    "Ý": "y",
    "Ž": "z"
  };
  return e.split("").map(e => t[e] || e).join("").toLowerCase().replace(/&/g, "and").replace(/'/g, "").replace(/:/g, "").replace(/\.+/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "")
}

function _svetSlugVariants(e, t) {
  const n = e || _slugify(t || ""),
    o = [n];
  n.startsWith("the-") ? o.push(n.slice(4)) : t && t.toLowerCase().startsWith("the ") && o.push("the-" + n), o.push(n.replace(/-\d{4}$/, ""));
  const i = n.replace(/-+/g, "-");
  return i !== n && o.push(i), [...new Set(o)].filter(Boolean)
}

function _buildCandidateUrls(e, t, n) {
  const o = _slugify(e);
  if (!o) return "movie" === t ? [{
    url: `https://www.bombuj.si/?s=${encodeURIComponent(e||"")}`,
    site: "bombuj.si"
  }, {
    url: `https://svetserialu.to/?s=${encodeURIComponent(e||"")}`,
    site: "svetserialu.to"
  }] : [{
    url: `https://svetserialu.to/?s=${encodeURIComponent(e||"")}`,
    site: "svetserialu.to"
  }, {
    url: `https://serialy.bombuj.si/?s=${encodeURIComponent(e||"")}`,
    site: "bombuj.si"
  }];
  const i = n || (new Date).getFullYear(),
    a = o.startsWith("the-") ? o.slice(4) : o,
    s = o.replace(/-\d{4}$/, ""),
    r = o.startsWith("the-") ? o : "the-" + o;
  return "movie" === t ? [{
    url: `https://www.bombuj.si/online-film-${o}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${o}-${i}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${o}-${i-1}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${o}-${i-2}`,
    site: "bombuj.si"
  }, {
    url: `https://www.bombuj.si/online-film-${s}`,
    site: "bombuj.si"
  }, {
    url: `https://svetserialu.to/film/${o}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/film/${s}`,
    site: "svetserialu.to"
  }, {
    url: `https://prehraj.to/${o}`,
    site: "prehraj.to"
  }, {
    url: `https://prehraj.to/film/${o}`,
    site: "prehraj.to"
  }] : [{
    url: `https://svetserialu.to/serial/${o}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${o}/s01e01`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${a}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${a}/s01e01`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${s}`,
    site: "svetserialu.to"
  }, {
    url: `https://svetserialu.to/serial/${r}`,
    site: "svetserialu.to"
  }, {
    url: `https://serialy.bombuj.si/serial/${o}`,
    site: "bombuj.si"
  }, {
    url: `https://serialy.bombuj.si/serial/${o}-1x1`,
    site: "bombuj.si"
  }, {
    url: `https://serialy.bombuj.si/serial/${a}`,
    site: "bombuj.si"
  }, {
    url: `https://prehraj.to/serial/${o}`,
    site: "prehraj.to"
  }]
}
async function _jinaFetch(e) {
  const t = getJinaKey();
  if (!t) return null;
  try {
    const n = await fetch(`https://r.jina.ai/${e}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + t,
        Accept: "application/json",
        "X-Return-Format": "text"
      },
      signal: AbortSignal.timeout(6e3)
    });
    return n.ok ? await n.text() : null
  } catch {
    return null
  }
}
async function _jinaVerify(e) {
  const t = await _jinaFetch(e);
  if (!t) return null;
  if (/\b(404|page.{0,25}not.{0,10}found|stránka nebyla nalezena|nenalezena|nebyl nalezen)\b/i.test(t.slice(0, 800))) return null;
  const n = t.match(/https?:\/\/(?:www\.)?(?:bombuj\.si|svetserialu\.to|prehraj\.to)[^\s"',<>]{3,}/);
  return n ? n[0].replace(/[.,;]+$/, "") : e
}
async function _jinaVerifyBatch(e) {
  return new Promise(t => {
    let n = !1,
      o = e.length;
    o ? e.forEach(async e => {
      try {
        const o = await _jinaVerify(e.url);
        o && !n && (n = !0, t({
          url: o,
          site: e.site
        }))
      } catch {}
      o--, 0 !== o || n || t(null)
    }) : t(null)
  })
}
async function _finderPatternBuild(e, t, n) {
  setFinderStatus("⚡ Pattern matching…");
  const o = _buildCandidateUrls(e, t, n);
  if (getJinaKey()) {
    const t = o.slice(0, 3),
      n = o.slice(3),
      i = await _jinaVerifyBatch(t);
    if (i) return {
      results: [{
        title: e,
        url: i.url,
        site: i.site
      }]
    };
    const a = await _jinaVerifyBatch(n);
    return a ? {
      results: [{
        title: e,
        url: a.url,
        site: a.site
      }]
    } : null
  } {
    const t = await Promise.allSettled(o.slice(0, 5).map(e => fetch(e.url, {
        method: "HEAD",
        signal: AbortSignal.timeout(3e3),
        mode: "no-cors"
      }).then(t => "opaque" === t.type ? e : null).catch(() => null))),
      n = t.find(e => "fulfilled" === e.status && e.value)?.value;
    return n ? {
      results: [{
        title: e,
        url: n.url,
        site: n.site
      }]
    } : null
  }
}
async function _finderGemini(e, t, n, o = 1) {
  const i = getGeminiKey();
  if (!i || i.includes("__VLOZ")) return null;
  const a = "movie" === t ? "bombuj.si" : "svetserialu.to",
    s = n ? ` ${n}` : "",
    r = [`"${e}"${s} site:${a} ${"movie"===t?"online-film":"serial"}`, `${e}${s} ${"movie"===t?"film online":"seriál sledovat"} site:${a} OR site:prehraj.to`, `${e}${s} ${a} ${"movie"===t?"film 2023 2024 2025":"serial epizoda"} -/?s=`],
    l = r[Math.min(o - 1, r.length - 1)];
  setFinderStatus(`✦ Gemini hledá${o>1?` (pokus ${o})`:""}…`);
  try {
    const a = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${i}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tools: [{
          google_search: {}
        }],
        system_instruction: {
          parts: [{
            text: 'Jsi expert na české a slovenské streamovací weby.\nURL VZORY (přesně dodržuj):\n- bombuj.si FILMY: https://www.bombuj.si/online-film-SLUG nebo s rokem /online-film-SLUG-YYYY\n  Příklady: /online-film-kung-fu-panda, /online-film-kung-fu-panda-4-2024, /online-film-spasitel, /online-film-deadpool-wolverine-2024\n- bombuj.si SERIÁLY: https://serialy.bombuj.si/serial/SLUG-SxEE\n  Příklady: /serial/the-simpsons-1x1, /serial/family-guy-2x3\n- svetserialu.to SERIÁLY: https://svetserialu.to/serial/SLUG\n  Příklady: /serial/chainsaw-man, /serial/the-simpsons, /serial/simpsons (bez "the-"), /serial/miraculous-tales-of-ladybug-and-cat-noir\n- prehraj.to: záloha\nSLUG pravidla: diakritika pryč, mezery→pomlčky, spec. znaky pryč.\nZÁSADNÍ: URL musí vést PŘÍMO na stránku titulu — NE /?s= ani /search.\nOdpovídej POUZE JSON bez markdown.'
          }]
        },
        contents: [{
          role: "user",
          parts: [{
            text: `Najdi přímý URL na ${"movie"===t?"FILM":"SERIÁL"}: "${e}"\nProveď Google search: ${l}\nVyber URL která PŘÍMO vede na stránku titulu (ne vyhledávání).\nVrať POUZE: {"results":[{"title":"přesný název","url":"https://plná-url","site":"doména.tld"}]}`
          }]
        }]
      })
    });
    if (!a.ok) return 429 === a.status && o < 2 ? (await new Promise(e => setTimeout(e, 3e3)), _finderGemini(e, t, n, o + 1)) : null;
    const s = await a.json(),
      r = (s?.candidates?.[0]?.content?.parts || []).map(e => e.text || "").join("");
    if (!r) return null;
    const c = _parseFinderJson(r);
    if (!c?.results?.length) return o < 3 ? (await new Promise(e => setTimeout(e, 500)), _finderGemini(e, t, n, o + 1)) : null;
    let d = c.results.filter(e => _isValidStreamUrl(e.url)).map(e => ({
      ...e,
      site: new URL(e.url).hostname.replace("www.", "")
    }));
    if (d.length && getJinaKey()) {
      const e = await _jinaVerifyBatch(d.map(e => ({
        url: e.url,
        site: e.site
      })));
      if (e) {
        const t = d.find(t => t.site === e.site) || d[0];
        d = [{
          ...t,
          url: e.url
        }]
      } else d = []
    }
    return d.length ? {
      results: d
    } : null
  } catch (i) {
    return o < 2 ? _finderGemini(e, t, n, o + 1) : null
  }
}
async function _finderGroqSlug(e, t, n) {
  const o = getGroqKey();
  if (!o) return null;
  const i = n ? ` (prefer year ${n})` : "";
  setFinderStatus("⚡ Groq slug…");
  try {
    const a = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + o
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 200,
        temperature: 0,
        messages: [{
          role: "user",
          content: `Generate ALL likely URL paths for "${e}"${i} on ${"movie"===t?`bombuj.si. Format: /online-film-slug or /online-film-slug-YYYY (include year if known: ${n||"unknown"}). Examples: /online-film-kung-fu-panda, /online-film-kung-fu-panda-4-2024, /online-film-deadpool-wolverine-2024, /online-film-spasitel${n?`, /online-film-spasitel-${n}`:""}. For recent movies (2020+) include year variant too.`:'svetserialu.to. Format: /serial/slug. Examples: /serial/chainsaw-man, /serial/the-simpsons, /serial/simpsons (sometimes without "the-"), /serial/miraculous-tales-of-ladybug-and-cat-noir, /serial/family-guy.'}.\nDiacritics: á→a č→c ď→d é→e ě→e í→i ň→n ó→o ř→r š→s ť→t ú/ů→u ý→y ž→z. Remove apostrophes, colons, dots.\nReply ONLY as JSON array of paths, most likely first. Max 5 paths. Example: ["/online-film-inception","/online-film-inception-2010"]`
        }]
      })
    });
    if (!a.ok) return null;
    const s = await a.json();
    let r = (s?.choices?.[0]?.message?.content || "").trim(),
      l = [];
    try {
      const e = JSON.parse(r.replace(/```json|```/gi, "").trim());
      Array.isArray(e) && (l = e.filter(e => "string" == typeof e && e.startsWith("/")))
    } catch {
      l = [...r.matchAll(/\/[a-z0-9][a-z0-9/-]*/g)].map(e => e[0]).filter(e => e.length > 3)
    }
    if (!l.length) return null;
    const c = "movie" === t ? "https://www.bombuj.si" : "https://svetserialu.to",
      d = "movie" === t ? "bombuj.si" : "svetserialu.to",
      m = l.slice(0, 5).filter(e => _isValidStreamUrl(c + e)).map(e => ({
        url: c + e,
        site: d
      }));
    if (getJinaKey()) {
      const t = await _jinaVerifyBatch(m);
      return t ? {
        results: [{
          title: e,
          url: t.url,
          site: t.site,
          _groqGenerated: !0
        }]
      } : null
    }
    return m.length ? {
      results: [{
        title: e,
        url: m[0].url,
        site: m[0].site,
        _groqGenerated: !0
      }]
    } : null
  } catch {
    return null
  }
}
async function _finderAnthropic(e, t, n) {
  const o = getAnthropicKey();
  if (!o) return null;
  const i = "movie" === t ? "bombuj.si" : "svetserialu.to",
    a = n ? ` (rok: ${n})` : "";
  setFinderStatus("🤖 Claude AI hledá…");
  try {
    const n = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": o,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }],
        system: 'Expert na české streamovací weby. Vrať POUZE JSON bez markdown.\nURL vzory:\n- bombuj.si filmy: /online-film-SLUG nebo /online-film-SLUG-YYYY (př: /online-film-kung-fu-panda, /online-film-deadpool-wolverine-2024)\n- bombuj.si seriály: serialy.bombuj.si/serial/SLUG-SxEE (př: /serial/the-simpsons-1x1)\n- svetserialu.to seriály: /serial/SLUG (př: /serial/the-simpsons, /serial/chainsaw-man; někdy bez "the-")\nURL nesmí obsahovat /?s= ani /search. Pokud nenajdeš na primárním webu, zkus prehraj.to.',
        messages: [{
          role: "user",
          content: `Najdi přímý odkaz na ${"movie"===t?"film":"seriál"} "${e}"${a} na ${i} nebo prehraj.to.\nProhledej web a vrať POUZE: {"results":[{"title":"...","url":"https://...","site":"..."}]}`
        }]
      })
    });
    if (!n.ok) return null;
    const s = await n.json(),
      r = _parseFinderJson((s.content || []).filter(e => "text" === e.type).map(e => e.text).join(""));
    return r?.results && (r.results = r.results.filter(e => _isValidStreamUrl(e.url))), r?.results?.length ? r : null
  } catch {
    return null
  }
}
async function _finderTavily(e, t, n) {
  const o = getTavilyKey();
  if (!o) return null;
  const i = "movie" === t ? "bombuj.si" : "svetserialu.to",
    a = n ? ` ${n}` : "";
  setFinderStatus("🌐 Tavily search…");
  try {
    const n = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: o,
        max_results: 6,
        query: `"${e}"${a} ${"movie"===t?"film online":"seriál online"} ${i}`,
        include_domains: [i, "prehraj.to", "serialy.bombuj.si"]
      })
    });
    if (!n.ok) return null;
    const s = await n.json(),
      r = (s?.results || []).map(t => ({
        title: t.title || e,
        url: t.url,
        site: new URL(t.url).hostname.replace("www.", "")
      })).filter(e => _isValidStreamUrl(e.url));
    return r.length ? {
      results: r
    } : null
  } catch {
    return null
  }
}
const _finderCache = {};

function _finderCacheKey(e, t) {
  return `${t}::${e.toLowerCase().trim()}`
}

function _finderCacheGet(e, t) {
  const n = _finderCacheKey(e, t),
    o = _finderCache[n];
  return o ? Date.now() - o.ts > 18e5 ? (delete _finderCache[n], null) : o.results : null
}

function _finderCacheSet(e, t, n) {
  _finderCache[_finderCacheKey(e, t)] = {
    results: n,
    ts: Date.now()
  }
}
async function runFinder(e, t, n) {
  const o = "movie" === t ? "bombuj.si" : "svetserialu.to";
  setFinderStatus("🔍 Hledám…");
  const i = _finderCacheGet(e, t);
  if (i) return showFinderResults(i, e, t), void(document.getElementById("mfFinderSub").textContent = "✅ Z cache");
  let a = [],
    s = "";
  const r = await Promise.race([_finderGemini(e, t, n).then(e => e?.results?.length ? {
    r: e,
    engine: "✦ Gemini"
  } : null), _finderPatternBuild(e, t, n).then(e => e?.results?.length ? {
    r: e,
    engine: "⚡ Pattern"
  } : null), new Promise(e => setTimeout(() => e(null), 13e3))]);
  if (r?.r?.results?.length && (a = r.r.results, s = r.engine), !a.length && getGroqKey()) {
    const o = await _finderGroqSlug(e, t, n);
    o?.results?.length && (a = o.results, s = "⚡ Groq")
  }
  if (!a.length && getAnthropicKey()) {
    const o = await _finderAnthropic(e, t, n);
    o?.results?.length && (a = o.results, s = "🤖 Claude")
  }
  if (!a.length && getTavilyKey()) {
    const o = await _finderTavily(e, t, n);
    o?.results?.length && (a = o.results, s = "🌐 Tavily")
  }
  if (!a.length) {
    const o = await _finderGemini(e, t, n, 2);
    o?.results?.length && (a = o.results, s = "✦ Gemini #2")
  }
  if (!a.length) {
    const o = _buildCandidateUrls(e, t, n)[0];
    o && (a = [{
      title: e,
      url: o.url,
      site: o.site,
      _unverified: !0
    }], s = "⚡ Odhad")
  }
  a.length && !a[0]._unverified && _finderCacheSet(e, t, a);
  const l = [{
    title: `🔎 Hledat "${e}" na ${o}`,
    url: "movie" === t ? `https://www.bombuj.si/?s=${encodeURIComponent(e)}` : `https://svetserialu.to/?s=${encodeURIComponent(e)}`,
    site: o,
    _fallback: !0
  }, {
    title: "🔎 Hledat na prehraj.to",
    url: `https://prehraj.to/hledej/${encodeURIComponent(e)}`,
    site: "prehraj.to",
    _fallback: !0
  }];
  showFinderResults([...a, ...l], e, t);
  const c = document.getElementById("mfFinderSub");
  c && (c.textContent = a.length ? `✅ Nalezeno — ${s}` : "🔗 Zkus hledat ručně níže")
}
async function verifyAndOpen(e, t, n) {
  showFinderModal(e, t, n), await runFinder(e, t, n)
}

function _fallbackCopy(e, t) {
  showFinderModal(e, t), showFinderResults([{
    title: `Hledat "${e}" na ${"movie"===t?"bombuj.si":"svetserialu.to"}`,
    url: "movie" === t ? `https://www.bombuj.si/?s=${encodeURIComponent(e)}` : `https://svetserialu.to/?s=${encodeURIComponent(e)}`,
    site: "movie" === t ? "bombuj.si" : "svetserialu.to"
  }, {
    title: "Hledat na prehraj.to",
    url: `https://prehraj.to/hledej/${encodeURIComponent(e)}`,
    site: "prehraj.to"
  }], e, t);
  const n = document.getElementById("mfFinderSub");
  n && (n.textContent = "Přímé vyhledávání (bez AI)")
}
async function openWithCopy(e, t, n) {
  window._mfFinderTmdbId = window._mfFinderTmdbId || null;
  let o = e;
  _isNonLatin(e) && (showToast("🔍 Hledám anglický název…"), o = await _getEnglishTitle(e, t), o !== e && showToast(`🌐 Přeloženo: "${o}"`)), getGeminiKey() || getAnthropicKey() || getGroqKey() || getTavilyKey() || getJinaKey() ? verifyAndOpen(o, t, n) : _fallbackCopy(o, t)
}! function() {
  const e = document.createElement("style");
  e.textContent = "\n        @keyframes mfFinderSpin { to { transform: rotate(360deg); } }\n        #mfFinderModal button:active { transform: scale(0.96) !important; transition-duration: 0.08s !important; }\n      ", document.head.appendChild(e)
}();
const menuWrappers = () => Array.from(document.querySelectorAll("#mainMenu .ps-tile-wrapper"));

function setKbMenuFocus(e) {
  const t = menuWrappers();
  if (!t.length) return;
  const n = t[kbMenuIndex];
  n && (clearTimeout(n._trailerTimer), removeTileTrailer(n)), t.forEach(e => e.classList.remove("kb-focus")), kbMenuIndex = Math.max(0, Math.min(e, t.length - 1));
  const o = t[kbMenuIndex];
  if (!o) return;
  o.classList.add("kb-focus"), o.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest"
  });
  const i = o.dataset.slug;
  if (i && "__search__" !== i && setAdaptiveColor(i), i && "__search__" !== i && "__foryou__" !== i) {
    const e = db[i]?.tmdbId,
      t = HARDCODED_TRAILERS[i];
    e && "function" == typeof preFetchTrailer && preFetchTrailer(i), (e || t) && (o._trailerTimer = setTimeout(() => {
      o.classList.contains("kb-focus") && loadTileTrailer(o, e || null, "tv", i)
    }, 1400))
  }
}

function setKbEpFocus(e) {
  const t = Array.from(document.querySelectorAll("#episodesGrid .episode-card"));
  t.length && (t.forEach(e => e.classList.remove("kb-focus")), kbEpIndex = Math.max(0, Math.min(e, t.length - 1)), t[kbEpIndex]?.classList.add("kb-focus"), t[kbEpIndex]?.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  }))
}

function applyKbTilt(e) {
  if (!e) return;
  const t = e.querySelector(".ps-tile"),
    n = e.querySelector(".tile-glare"),
    o = e.querySelector(".tile-bg"),
    i = e.querySelector(".tile-logo");
  t && (t.style.transition = "transform 0.4s cubic-bezier(0.34,1.2,0.64,1),box-shadow 0.4s ease,filter 0.4s ease", t.style.transform = "perspective(900px) rotateX(-4deg) rotateY(0deg) scale(1.06) translateY(-10px)", t.style.filter = "brightness(1.1) saturate(1.2)", t.style.boxShadow = "0 0 0 2.5px var(--accent),0 32px 64px rgba(0,0,0,0.85),0 0 40px rgba(0,122,255,0.18)", n && (n.style.transition = "opacity 0.4s ease", n.style.opacity = "1", n.style.background = "radial-gradient(ellipse 80% 60% at 50% 25%,rgba(255,255,255,0.13) 0%,transparent 65%)"), o && (o.style.transition = "transform 0.4s cubic-bezier(0.25,0.8,0.25,1)", o.style.transform = "scale(1.06)"), i && (i.style.transition = "transform 0.35s cubic-bezier(0.34,1.2,0.64,1)", i.style.transform = "translateX(-50%) scale(1.05) translateY(-3px)"))
}

function clearKbTilt(e) {
  if (!e) return;
  const t = e.querySelector(".ps-tile"),
    n = e.querySelector(".tile-glare"),
    o = e.querySelector(".tile-bg"),
    i = e.querySelector(".tile-logo");
  e.matches(":hover") || (t && (t.style.transform = "", t.style.filter = "", t.style.boxShadow = ""), n && (n.style.opacity = ""), o && (o.style.transform = ""), i && (i.style.transform = ""))
}
document.addEventListener("keydown", e => {
  if ("INPUT" !== e.target.tagName && "TEXTAREA" !== e.target.tagName) {
    if ("Escape" === e.key) {
      const e = document.getElementById("mfFinderModal");
      return e && "none" !== e.style.pointerEvents && "none" !== e.style.display ? void closeFinderModal() : aiPanelOpen ? void closeAiPanel() : modalOpen ? void closeModal() : document.getElementById("watchlistOverlay").classList.contains("open") ? void closeWatchlist() : document.getElementById("wrappedOverlay").classList.contains("open") ? void closeWrapped() : document.getElementById("universeOverlay").classList.contains("open") ? void closeSearch() : document.getElementById("adminOverlay").classList.contains("open") ? void closeAdmin() : document.getElementById("customizeOverlay").classList.contains("open") ? void closeCustomize() : document.getElementById("collectionsOverlay").classList.contains("open") ? void closeCollections() : document.getElementById("editOverlay")?.classList.contains("open") ? void closeEditMode() : document.getElementById("ratingOverlay")?.classList.contains("open") ? void closeRating() : document.getElementById("traktOverlay")?.classList.contains("open") ? void closeTraktOverlay() : document.getElementById("voiceModeOverlay")?.classList.contains("open") ? void closeVoiceMode() : document.getElementById("genreEditorOverlay")?.classList.contains("open") ? void closeGenreEditor() : void 0
    }
    if (!("a" !== e.key && "A" !== e.key || modalOpen || aiPanelOpen)) return e.preventDefault(), void toggleAiPanel();
    if (!("/" !== e.key && "." !== e.key || modalOpen || aiPanelOpen)) return e.preventDefault(), void openSearch();
    if ("menu" !== kbLayer || modalOpen || aiPanelOpen) {
      if ("modal-season" === kbLayer && modalOpen) {
        const t = totalSeasons(activeSeries);
        return void("ArrowLeft" === e.key ? (e.preventDefault(), kbSeasonIndex > 0 && (kbSeasonIndex--, activeSeason = kbSeasonIndex + 1, renderSeasons(), renderEpisodes())) : "ArrowRight" === e.key ? (e.preventDefault(), kbSeasonIndex < t - 1 && (kbSeasonIndex++, activeSeason = kbSeasonIndex + 1, renderSeasons(), renderEpisodes())) : "ArrowDown" === e.key ? (e.preventDefault(), kbLayer = "modal-ep", kbEpIndex = 0, setKbEpFocus(0)) : "r" === e.key || "R" === e.key ? (e.preventDefault(), shuffleEpisode()) : "n" !== e.key && "N" !== e.key || (e.preventDefault(), jumpToNext()))
      }
      if ("modal-ep" === kbLayer && modalOpen) {
        const t = Array.from(document.querySelectorAll("#episodesGrid .episode-card"));
        if ("ArrowDown" === e.key) e.preventDefault(), setKbEpFocus(kbEpIndex + 1);
        else if ("ArrowUp" === e.key) {
          if (e.preventDefault(), kbEpIndex <= 0) return kbLayer = "modal-season", void t.forEach(e => e.classList.remove("kb-focus"));
          setKbEpFocus(kbEpIndex - 1)
        } else if ("Enter" === e.key) {
          e.preventDefault();
          const n = t[kbEpIndex];
          n && n.querySelector(".ep-btn-play")?.click()
        } else if ("m" === e.key || "M" === e.key) {
          e.preventDefault();
          const n = t[kbEpIndex];
          n && n.querySelector(".ep-btn-mark")?.click()
        }
        return
      }
      "search" !== kbLayer || ("ArrowLeft" === e.key ? (e.preventDefault(), kbSearchIndex = 0, updateSearchFocus()) : "ArrowRight" === e.key ? (e.preventDefault(), kbSearchIndex = 1, updateSearchFocus()) : "Enter" === e.key && (e.preventDefault(), openSearchPlatform(0 === kbSearchIndex ? "movies" : "series")))
    } else if ("ArrowLeft" === e.key) e.preventDefault(), setKbMenuFocus(kbMenuIndex - 1);
    else if ("ArrowRight" === e.key) e.preventDefault(), setKbMenuFocus(kbMenuIndex + 1);
    else if ("Enter" === e.key) {
      const e = menuWrappers()[kbMenuIndex];
      if (e) {
        const t = e.dataset.slug;
        "__search__" === t ? openSearch() : "__foryou__" === t ? openForYouSeries() : openSeries(t)
      }
    }
  }
}), document.addEventListener("keydown", e => {
  if ("Escape" === e.key) {
    const e = document.getElementById("universeOverlay");
    if (e?.classList.contains("open")) return void closeDiscover()
  }
  if ("ArrowDown" === e.key) {
    const t = document.getElementById("universeOverlay").classList.contains("open"),
      n = document.getElementById("seriesModal").classList.contains("open"),
      o = document.getElementById("aiFullscreen")?.classList.contains("open");
    if (!t && !n && !o && "menu" === kbLayer) return e.preventDefault(), void openDiscover()
  }
  if ("ArrowUp" === e.key) {
    if (document.getElementById("universeOverlay").classList.contains("open")) return e.preventDefault(), void closeDiscover()
  }
}, {
  capture: !0
});
function getPartialWatched() {
  try {
    return safeLS(uKey("mf_partial_watched"), "{}")
  } catch {
    return {}
  }
}

function savePartialWatched(e) {
  localStorage.setItem(uKey("mf_partial_watched"), JSON.stringify(e))
}

function setEpisodeProgress(e, t) {
  const n = getPartialWatched();
  if (t >= 100) delete n[e], markWatched(e);
  else if (t <= 0) {
    delete n[e];
    const t = getWatched();
    delete t[e], saveWatched(t), renderEpisodes()
  } else {
    n[e] = t, savePartialWatched(n);
    const o = document.getElementById(`card-${e}`);
    if (o) {
      let e = o.querySelector(".ep-progress-bar-wrap");
      if (!e) {
        e = document.createElement("div"), e.className = "ep-progress-bar-wrap", e.innerHTML = '<div class="ep-progress-bar-fill"></div>';
        const t = o.querySelector(".ep-body");
        t && t.appendChild(e)
      }
      const n = e.querySelector(".ep-progress-bar-fill");
      n && (n.style.width = t + "%"), o.classList.add("ep-card-partial")
    }
  }
  showToast(t >= 100 ? "✓ Označeno jako zhlédnuté" : t <= 0 ? "○ Označeno jako nezhlédnuté" : `◐ Rozkoukanost: ${t}%`)
}

function showEpisodeProgressDialog(e, t, n, o) {
  const i = o || 0,
    a = `S${t}·E${n}`;
  let s = document.getElementById("epProgressDlg");
  s && s.remove(), s = document.createElement("div"), s.id = "epProgressDlg", s.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.75);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;", s.innerHTML = `<div style="background:rgba(10,10,12,0.99);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px 22px;width:min(340px,90vw);box-shadow:0 40px 100px rgba(0,0,0,0.9);">\n        <div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1rem;font-weight:900;margin-bottom:4px;">📺 Rozkoukanost</div>\n        <div style="font-size:0.7rem;color:var(--muted);margin-bottom:18px;">${a} — nastav, jak daleko jsi sledoval</div>\n        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">\n          <input type="range" id="epProgSlider" min="0" max="100" value="${i}" step="5" style="flex:1;accent-color:var(--accent);">\n          <div id="epProgVal" style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1.1rem;font-weight:900;color:var(--accent);min-width:40px;text-align:right;">${i}%</div>\n        </div>\n        <div style="display:flex;gap:4px;margin-bottom:18px;">\n          ${[0,25,50,75,100].map(e=>`<button onclick="document.getElementById('epProgSlider').value=${e};document.getElementById('epProgVal').textContent='${e}%'" style="flex:1;padding:7px 4px;border-radius:8px;border:1px solid rgba(255,255,255,${e===i?"0.3":"0.08"});background:rgba(255,255,255,${e===i?"0.1":"0.04"});color:${e===i?"var(--accent)":"var(--muted)"};font-size:0.65rem;font-weight:700;cursor:pointer;">${e}%</button>`).join("")}\n        </div>\n        <div style="display:flex;gap:10px;">\n          <button onclick="document.getElementById('epProgressDlg').remove()" style="flex:1;padding:11px;border-radius:11px;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--muted);font-family:Outfit,sans-serif;cursor:pointer;">Zrušit</button>\n          <button onclick="setEpisodeProgress('${e}',parseInt(document.getElementById('epProgSlider').value));document.getElementById('epProgressDlg').remove()" style="flex:2;padding:11px;border-radius:11px;background:var(--accent);border:none;color:#000;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-weight:900;cursor:pointer;">✓ Uložit</button>\n        </div>\n      </div>`, s.querySelector("#epProgSlider").addEventListener("input", e => {
    document.getElementById("epProgVal").textContent = e.target.value + "%"
  }), s.addEventListener("click", e => {
    e.target === s && s.remove()
  }), document.body.appendChild(s)
}
const GENRE_LABELS = {
  komedie: "😄 Komedie",
  drama: "🎭 Drama",
  akcni: "💥 Akce",
  "sci-fi": "🚀 Sci-Fi",
  horor: "👻 Horor",
  fantasy: "🧙 Fantasy",
  krimi: "🔍 Krimi",
  animovany: "🎨 Animák",
  dobrodruzny: "⚔️ Dobrodružství",
  rodinny: "👨‍👩‍👧 Rodinné",
  napinavy: "🔪 Thrillery"
};

function openGenreEditor() {
  const e = document.getElementById("genreEditorOverlay");
  e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), renderGenreSliders(), pauseBgParticles()
}

function closeGenreEditor() {
  const e = document.getElementById("genreEditorOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 280), resumeBgParticles()
}

function renderGenreSliders() {
  const e = document.getElementById("genreSliders");
  if (!e) return;
  const t = aiBrain.memory.genrePreferences || {},
    n = {
      ...Object.fromEntries(Object.keys(GENRE_LABELS).map(e => [e, 0])),
      ...t
    };
  e.innerHTML = Object.entries(n).map(([e, t]) => {
    const n = Math.round(100 * t);
    return `<div class="genre-slider-row">\n          <div class="genre-slider-label">\n            <span class="genre-slider-name">${GENRE_LABELS[e]||e}</span>\n            <span class="genre-slider-pct" id="gpct-${e}">${n}%</span>\n          </div>\n          <input type="range" class="genre-slider" data-key="${e}" min="0" max="100" value="${n}" step="5"\n            oninput="document.getElementById('gpct-${e}').textContent=this.value+'%'">\n        </div>`
  }).join("")
}

function saveGenrePrefs() {
  document.querySelectorAll("#genreSliders .genre-slider").forEach(e => {
    const t = e.dataset.key,
      n = parseInt(e.value) / 100;
    0 === n ? delete aiBrain.memory.genrePreferences[t] : aiBrain.memory.genrePreferences[t] = n
  }), aiBrain.save(), closeGenreEditor(), showToast("✦ AI preference uloženy!")
}
let _notifData = [];
async function checkNewEpisodes() {
  // Epizody odstraněny — panel používá pouze changelog (notifications-changelog.js)
}
function renderNotifPanel() {
  // Epizody odstraněny — panel renderuje notifications-changelog.js
}

function openNotifPanel() {
  const e = document.getElementById("notifPanel");
  e.classList.contains("open") ? closeNotifPanel() : (e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), document.addEventListener("click", _notifOutsideClick, {
    once: !0,
    capture: !0
  }))
}

function closeNotifPanel() {
  const e = document.getElementById("notifPanel");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 220)
}

function _notifOutsideClick(e) {
  const t = document.getElementById("notifPanel"),
    n = document.getElementById("notifBell");
  !t || t.contains(e.target) || n.contains(e.target) || closeNotifPanel()
}


function buildEpCard(e, t, n, o, i, a, s) {
  const r = _buildEpCardBase(e, t, n, o, i, a, s),
    l = getPartialWatched(),
    c = l[e] || 0;
  if (c > 0 && !i) {
    const e = r.querySelector(".ep-body");
    if (e) {
      const t = document.createElement("div");
      t.className = "ep-progress-bar-wrap", t.innerHTML = `<div class="ep-progress-bar-fill" style="width:${c}%"></div>`, e.appendChild(t), r.classList.add("ep-card-partial")
    }
  }
  let d;
  if (r.addEventListener("contextmenu", o => {
      o.preventDefault(), o.stopPropagation();
      const a = l[e] || (i ? 100 : 0);
      showEpisodeProgressDialog(e, t, n, a)
    }), r.addEventListener("touchstart", o => {
      d = setTimeout(() => {
        showEpisodeProgressDialog(e, t, n, l[e] || (i ? 100 : 0))
      }, 600)
    }, {
      passive: !0
    }), r.addEventListener("touchend", () => clearTimeout(d), {
      passive: !0
    }), r.addEventListener("touchmove", () => clearTimeout(d), {
      passive: !0
    }), "function" == typeof getEpRating) {
    const t = getEpRating(e);
    if (t > 0) {
      const n = r.querySelector(".ep-meta-row");
      if (n) {
        const o = document.createElement("span");
        o.className = "ep-user-rating", o.title = "Moje hodnocení — klikni pro změnu", o.innerHTML = '<span class="er-star-mini">⭐</span> ' + t + "/5", o.onclick = t => {
          t.stopPropagation(), "function" == typeof _epRatingOpenFromCard && _epRatingOpenFromCard(e)
        }, n.appendChild(o)
      }
    }
  }
  return r
}

function setMood(e, t) {
  document.querySelectorAll(".uni-mood-chip").forEach(e => e.classList.remove("active")), e.classList.add("active")
}

function setSectionTab(e, t) {
  document.querySelectorAll(".uni-section-tab").forEach(e => e.classList.remove("active")), e.classList.add("active");
  const n = document.getElementById("uniSectionLabel");
  n && (n.textContent = {
    trending: "🔥 Právě letí",
    toprated: "⭐ Nejlépe hodnocené",
    new: "🆕 Nové přírůstky",
    top10: "🏆 Top 10 CZ"
  } [t] || "🔥 Právě letí")
}
window.addEventListener("load", () => {
  if (Object.keys(db).forEach(e => {
      updateTileProgress(e), updateContinueBadge(e)
    }), updateContinueWidget(), updateLogoProgress(), updateWatchlistBadge(), updateWatchlistBtns(), showAutosave("idle"), updateStatusBadge(), initTileEffects(), loadTmdbTileImages().then(() => initTileEffects()), document.querySelectorAll(".ps-tile-wrapper .tile-bg, .ps-tile-wrapper .tile-logo").forEach(e => {
      const t = () => e.classList.add("loaded");
      e.complete && e.naturalWidth > 0 ? t() : (e.addEventListener("load", t, {
        once: !0
      }), e.addEventListener("error", t, {
        once: !0
      }))
    }), loadForYouTile(), loadTrending(), setKbMenuFocus(0), initMagnetic(document.getElementById("aiFab"), .3), document.querySelectorAll(".ps-tile-wrapper").forEach(e => {
      e.addEventListener("click", () => playOpen(), {
        passive: !0
      })
    }), function() {
      const e = ["Akce", "Drama", "Sci-Fi", "Horor", "Krimi", "Animák", "Komedie", "Thriller", "Dokument", "Reality", "Romantika", "Fantasy"],
        t = document.getElementById("tsiTags");
      if (!t) return;
      let n = 0;

      function o() {
        const o = [];
        for (let t = 0; t < 3; t++) o.push(e[(n + t) % e.length]);
        n = (n + 3) % e.length, t.style.opacity = "0", t.style.transform = "translateY(4px)", setTimeout(() => {
          t.innerHTML = o.map(e => `<span>${e}</span>`).join(""), t.style.transition = "opacity 0.4s ease, transform 0.4s ease", t.style.opacity = "1", t.style.transform = "translateY(0)"
        }, 300)
      }
      o(), setInterval(o, 2800)
    }(), setTimeout(checkNewEpisodes, 8e3), updateTraktSidebarLabel(), initPWA(), aiHistory.length > 0) {
    const e = document.getElementById("aiMessages"),
      t = document.createElement("div");
    t.style.cssText = "text-align:center;font-size:0.57rem;color:var(--muted);padding:8px 0;opacity:0.45;", t.textContent = "── predchozi konverzace ──", e.appendChild(t), aiHistory.slice(-8).forEach(t => {
      const n = document.createElement("div");
      n.className = "ai-msg-wrap " + ("user" === t.role ? "user" : "ai");
      const o = (t.content || "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
      "user" === t.role ? n.innerHTML = `<div class="ai-msg-avatar">👤</div><div class="ai-msg-bubble">${o}</div>` : n.innerHTML = `<div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>${linkifyFilms(o)}</div>`, e.appendChild(n)
    });
    const n = document.createElement("div");
    n.style.cssText = "text-align:center;font-size:0.57rem;color:var(--accent);padding:6px 0;opacity:0.6;", n.textContent = "── ted ──", e.appendChild(n), document.getElementById("aiMessages").scrollTop = 99999
  }
  document.querySelectorAll(".tile-bg").forEach(e => {
    e.complete && e.naturalWidth > 0 && e.classList.add("loaded")
  });
  const e = document.querySelector(".mf-header");
  if (e) {
    const t = document.querySelector(".ps-menu-scene") || document.body;
    window.addEventListener("scroll", () => {
      e.classList.toggle("scrolled", window.scrollY > 20)
    }, {
      passive: !0
    });
    const n = () => e.classList.toggle("scrolled", (t.scrollTop || window.scrollY) > 20);
    t.addEventListener("scroll", n, {
      passive: !0
    })
  }
  document.addEventListener("pointerdown", e => {
    const t = e.target.closest("button, .dock-btn, .ps-tile-wrapper, .ssv-card, .episode-card, .sh-card, .mood-btn, .mf-header-btn");
    if (!t || t.disabled) return;
    if (t.classList.contains("ps-tile-wrapper") || t.classList.contains("episode-card")) return;
    const n = t.style.transition;
    t.style.transition = "transform 0.07s ease", t.style.transform = (t.style.transform || "") + " scale(0.93)";
    const o = () => {
      t.style.transition = "transform 0.38s cubic-bezier(0.34,1.5,0.64,1)", t.style.transform = t.style.transform.replace(/ ?scale\(0\.93\)/g, ""), setTimeout(() => {
        t.style.transition = n
      }, 420), document.removeEventListener("pointerup", o), document.removeEventListener("pointercancel", o)
    };
    document.addEventListener("pointerup", o, {
      once: !0
    }), document.addEventListener("pointercancel", o, {
      once: !0
    })
  }, {
    passive: !0
  });
  const t = document.querySelector(".ps-menu");
  t && t.addEventListener("wheel", e => {
    Math.abs(e.deltaY) > Math.abs(e.deltaX) && (e.preventDefault(), t.scrollBy({
      left: 1.4 * e.deltaY,
      behavior: "smooth"
    }))
  }, {
    passive: !1
  });
  document.querySelectorAll(".ps-tile-wrapper").forEach((e, t) => {
    e.style.opacity = "0", e.style.transform = "translateY(18px) translateZ(0)", setTimeout(() => {
      e.style.transition = "opacity 0.45s ease, transform 0.5s cubic-bezier(0.34,1.18,0.64,1)", e.style.opacity = "1", e.style.transform = "translateY(0) translateZ(0)", setTimeout(() => {
        e.style.transition = "", e.style.transform = ""
      }, 520)
    }, 60 + 55 * t)
  })
});
const TRAKT_DEFAULT_CLIENT_ID = "b4d4f6e7c4aadf32b56d3e5b5e69c59d7c5c14e6f34d9c11b2e64f7b2a1d5e8f",
  TRAKT_API = "https://api.trakt.tv",
  TRAKT_REDIRECT = "urn:ietf:wg:oauth:2.0:oob";

function traktGetClientId() {
  return localStorage.getItem("mf_trakt_client_id") || TRAKT_DEFAULT_CLIENT_ID
}

function traktSaveClientId(e) {
  e.trim() ? localStorage.setItem("mf_trakt_client_id", e.trim()) : localStorage.removeItem("mf_trakt_client_id")
}

function getTraktTokenKey() {
  try {
    return "mf_trakt_" + (("function" == typeof getActiveProfileId ? getActiveProfileId() : null) || "default")
  } catch (e) {
    return "mf_trakt_default"
  }
}

function traktGetToken() {
  return localStorage.getItem(getTraktTokenKey())
}

function traktGetRefresh() {
  return localStorage.getItem(getTraktTokenKey() + "_refresh")
}

function traktSaveSetting(e, t) {
  localStorage.setItem("mf_trakt_" + e, t ? "1" : "0")
}

function traktGetSetting(e) {
  return "0" !== localStorage.getItem("mf_trakt_" + e)
}

function openTraktOverlay() {
  const e = document.getElementById("traktOverlay");
  e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), traktRefreshUI()
}

function closeTraktOverlay() {
  const e = document.getElementById("traktOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 300)
}

function traktRefreshUI() {
  const e = traktGetToken(),
    t = document.getElementById("traktFab"),
    n = document.getElementById("traktConnectSection"),
    o = document.getElementById("traktDashSection"),
    i = document.getElementById("traktStatus"),
    a = document.getElementById("traktStatusText"),
    s = document.getElementById("traktStatusUser"),
    r = document.getElementById("traktClientIdInput");
  r && (r.value = localStorage.getItem("mf_trakt_client_id") || "");
  const l = document.getElementById("traktSyncAuto"),
    c = document.getElementById("traktSyncWl");
  if (l && (l.checked = traktGetSetting("autoSync")), c && (c.checked = traktGetSetting("syncWl")), e) {
    t && t.classList.add("connected"), n && (n.style.display = "none"), o && (o.style.display = "block"), i && i.classList.add("ok"), a && (a.textContent = "Připojeno");
    const e = localStorage.getItem(getTraktTokenKey() + "_username");
    s && e && (s.textContent = "@" + e), traktLoadStats()
  } else t && t.classList.remove("connected"), n && (n.style.display = "block"), o && (o.style.display = "none"), i && i.classList.remove("ok"), a && (a.textContent = "Nepřipojen — propoj svůj Trakt účet"), s && (s.textContent = "")
}
async function traktStartAuth() {
  const e = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${traktGetClientId()}&redirect_uri=${encodeURIComponent(TRAKT_REDIRECT)}`;
  window.open(e, "_blank", "noopener,width=600,height=700");
  const t = document.getElementById("traktPinWrap");
  t && t.classList.add("visible");
  const n = document.getElementById("traktPinInput");
  n && setTimeout(() => n.focus(), 300), showToast("🔐 Přihlaste se na Trakt a zadejte PIN kód")
}
async function traktSubmitPin() {
  const e = document.getElementById("traktPinInput")?.value?.trim();
  if (!e || e.length < 4) return void showToast("⚠ Zadejte platný PIN kód");
  const t = traktGetClientId();
  showToast("⏳ Ověřuji PIN…");
  try {
    const n = await fetch(`${TRAKT_API}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": t
      },
      body: JSON.stringify({
        code: e,
        client_id: t,
        client_secret: "",
        redirect_uri: TRAKT_REDIRECT,
        grant_type: "authorization_code"
      })
    });
    if (!n.ok) throw new Error("PIN neplatný nebo vypršel");
    const o = await n.json();
    localStorage.setItem(getTraktTokenKey(), o.access_token), o.refresh_token && localStorage.setItem(getTraktTokenKey() + "_refresh", o.refresh_token), await traktFetchMe(o.access_token, t), showToast("✅ Trakt.tv připojen!"), traktRefreshUI(), updateTraktSidebarLabel(), aiTraktRefreshStatus(), traktGetSetting("syncWl") && traktImportWatchlist()
  } catch (e) {
    showToast("❌ Chyba: " + e.message)
  }
}
async function traktFetchMe(e, t) {
  try {
    const n = await fetch(`${TRAKT_API}/users/me`, {
      headers: {
        Authorization: "Bearer " + e,
        "trakt-api-key": t,
        "trakt-api-version": "2",
        "Content-Type": "application/json"
      }
    });
    if (n.ok) {
      const e = await n.json();
      e.username && localStorage.setItem(getTraktTokenKey() + "_username", e.username)
    }
  } catch {}
}
async function traktAPI(e, t = "GET", n = null) {
  const o = traktGetToken(),
    i = traktGetClientId();
  if (!o) return null;
  const a = {
    method: t,
    headers: {
      Authorization: "Bearer " + o,
      "trakt-api-key": i,
      "trakt-api-version": "2",
      "Content-Type": "application/json"
    }
  };
  n && (a.body = JSON.stringify(n));
  try {
    const t = await fetch(TRAKT_API + e, a);
    return 401 === t.status ? (traktHandleExpired(), null) : 429 === t.status ? (console.warn("[Trakt] Rate limited - čekám 5s"), await new Promise(e => setTimeout(e, 5e3)), null) : t.ok ? 204 === t.status || await t.json() : null
  } catch {
    return null
  }
}

function traktHandleExpired() {
  localStorage.removeItem("mf_trakt_token"), showToast("⚠ Trakt relace vypršela — znovu se přihlaš"), traktRefreshUI()
}
async function traktLoadStats() {
  const e = localStorage.getItem(getTraktTokenKey() + "_username");
  if (!e) return;
  const t = await traktAPI(`/users/${e}/stats`);
  if (!t) return;
  const n = (e, t) => {
    const n = document.getElementById(e);
    n && (n.textContent = t)
  };
  n("tstat-movies", t.movies?.watched || 0), n("tstat-shows", t.shows?.watched || 0), n("tstat-eps", t.episodes?.watched || 0);
  const o = t.movies?.minutes || 0 + t.episodes?.minutes || 0;
  n("tstat-hours", Math.round(o / 60))
}
async function traktScrobbleEpisode(e, t, n) {
  if (!traktGetToken() || !traktGetSetting("autoSync")) return;
  const o = db[e]?.tmdbId;
  if (o) try {
    await traktAPI("/sync/history", "POST", {
      shows: [{
        ids: {
          tmdb: o
        },
        seasons: [{
          number: t,
          episodes: [{
            number: n
          }]
        }]
      }]
    })
  } catch {}
}
async function traktScrobbleMovie(e) {
  if (traktGetToken() && traktGetSetting("autoSync")) try {
    await traktAPI("/sync/history", "POST", {
      movies: [{
        ids: {
          tmdb: e
        }
      }]
    })
  } catch {}
}
async function traktImportWatchlist() {
  showToast("📋 Načítám Trakt Watchlist…");
  const [e, t] = await Promise.all([traktAPI("/sync/watchlist/movies"), traktAPI("/sync/watchlist/shows")]);
  if (!e && !t) return void showToast("⚠ Watchlist nepodařilo načíst");
  const n = getWatchlist ? getWatchlist() : [];
  let o = 0;
  (e || []).forEach(e => {
    const t = e.movie;
    if (!t) return;
    const i = t.title;
    n.some(e => e.name === i) || (n.push({
      name: i,
      type: "movie",
      poster: "",
      trakt: !0,
      tmdb: t.ids?.tmdb
    }), o++)
  }), (t || []).forEach(e => {
    const t = e.show;
    if (!t) return;
    const i = t.title;
    n.some(e => e.name === i) || (n.push({
      name: i,
      type: "series",
      poster: "",
      trakt: !0,
      tmdb: t.ids?.tmdb
    }), o++)
  }), "function" == typeof saveWatchlistData && saveWatchlistData(n), showToast(`✅ Načteno ${o} položek z Trakt Watchlistu`)
}
async function traktImportHistory() {
  showToast("📥 Načítám historii z Traktu…");
  const e = await traktAPI("/sync/history/shows?limit=1000");
  if (!e) return void showToast("⚠ Historii se nepodařilo načíst");
  const t = getWatched();
  let n = 0;
  e.forEach(e => {
    if ("episode" !== e.type) return;
    const o = e.show,
      i = e.episode,
      a = Object.keys(db).find(e => db[e].tmdbId && db[e].tmdbId === o?.ids?.tmdb);
    if (!a) return;
    const s = `${a}-S${i.season}-E${i.number}`;
    t[s] || (t[s] = !0, n++)
  }), saveWatched(t), Object.keys(db).forEach(e => {
    updateTileProgress(e), updateContinueBadge(e)
  }), activeSeries && (renderEpisodes(), updatePanelProgress()), updateContinueWidget(), showToast(`✅ Importováno ${n} epizod z Traktu`)
}
async function traktFullSync() {
  showToast("🔄 Synchronizuji s Traktem…");
  const e = document.getElementById("traktStatus");
  e && e.classList.add("pending");
  const t = getWatched(),
    n = [];
  Object.keys(t).forEach(e => {
    const t = e.match(/^(.+)-S(\d+)-E(\d+)$/);
    if (!t) return;
    const [, o, i, a] = t, s = db[o]?.tmdbId;
    if (!s) return;
    const r = n.find(e => e.ids.tmdb === s),
      l = {
        number: parseInt(a)
      },
      c = {
        number: parseInt(i),
        episodes: [l]
      };
    if (r) {
      const e = r.seasons.find(e => e.number === parseInt(i));
      e ? e.episodes.push(l) : r.seasons.push(c)
    } else n.push({
      ids: {
        tmdb: s
      },
      seasons: [c]
    })
  }), n.length > 0 && await traktAPI("/sync/history", "POST", {
    shows: n
  }), traktGetSetting("syncWl") && await traktImportWatchlist(), await traktLoadStats(), e && e.classList.remove("pending"), showToast(`✅ Sync dokončen — odesláno ${n.length} seriálů`)
}

function traktDisconnect() {
  clearTraktToken(), localStorage.removeItem(getTraktTokenKey() + "_refresh"), localStorage.removeItem(getTraktTokenKey() + "_username"), traktRefreshUI(), showToast("Trakt.tv odpojen"), closeTraktOverlay()
}
const _origMarkWatched = markWatched;
markWatched = function(e) {
    _origMarkWatched(e);
    const t = e.match(/^(.+)-S(\d+)-E(\d+)$/);
    t && traktScrobbleEpisode(t[1], parseInt(t[2]), parseInt(t[3]))
  },
  function() {
    traktRefreshUI();
    const e = document.getElementById("traktClientIdInput");
    e && (e.value = localStorage.getItem("mf_trakt_client_id") || "")
  }();
const SW_CODE = "\nconst CACHE = 'mujflix-v1';\nconst PRECACHE = [];\n\nself.addEventListener('install', e => { self.skipWaiting(); });\nself.addEventListener('activate', e => { e.waitUntil(clients.claim()); });\n\n// Push notifikace\nself.addEventListener('push', e => {\n  const data = e.data ? e.data.json() : {};\n  const title = data.title || 'MůjFlix';\n  const options = {\n    body: data.body || 'Nová epizoda čeká!',\n    icon: data.icon || '',\n    badge: data.badge || '',\n    tag: data.tag || 'mujflix-notif',\n    data: { url: data.url || './' },\n    vibrate: [200, 100, 200],\n    requireInteraction: false,\n  };\n  e.waitUntil(self.registration.showNotification(title, options));\n});\n\n// Klik na notifikaci → otevři MůjFlix\nself.addEventListener('notificationclick', e => {\n  e.notification.close();\n  const target = e.notification.data?.url || './';\n  e.waitUntil(\n    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {\n      for (const c of cls) {\n        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();\n      }\n      if (clients.openWindow) return clients.openWindow(target);\n    })\n  );\n});\n";
async function initPWA() {
  if ("serviceWorker" in navigator) try {
    let e = await navigator.serviceWorker.getRegistration("./");
    if (!e) return void updatePwaBtn("unsupported");
    window._swReg = e;
    const t = Notification.permission;
    updatePwaBtn("granted" === t ? "granted" : "denied" === t ? "denied" : "default")
  } catch (e) {
    console.warn("[PWA] SW error:", e), updatePwaBtn("error")
  } else updatePwaBtn("unsupported")
}

function updatePwaBtn(e) {
  const t = document.getElementById("pwaNotifBtn"),
    n = document.getElementById("pwaNotifBtnLbl");
  if (!t || !n) return;
  const o = {
      default: {
        text: "Povolit push notifikace",
        color: "rgba(100,200,255,0.9)",
        bg: "rgba(100,180,255,0.1)",
        border: "rgba(100,180,255,0.25)",
        icon: "🔔"
      },
      granted: {
        text: "Notifikace povoleny ✓",
        color: "rgba(80,220,120,0.9)",
        bg: "rgba(60,200,100,0.1)",
        border: "rgba(60,200,100,0.3)",
        icon: "✅"
      },
      denied: {
        text: "Notifikace blokovány",
        color: "rgba(255,100,80,0.8)",
        bg: "rgba(255,80,60,0.08)",
        border: "rgba(255,80,60,0.25)",
        icon: "🚫"
      },
      error: {
        text: "Notifikace nedostupné",
        color: "rgba(160,160,160,0.7)",
        bg: "rgba(150,150,150,0.06)",
        border: "rgba(150,150,150,0.15)",
        icon: "⚠️"
      },
      unsupported: {
        text: "Prohlížeč nepodporuje",
        color: "rgba(160,160,160,0.7)",
        bg: "rgba(150,150,150,0.06)",
        border: "rgba(150,150,150,0.15)",
        icon: "⚠️"
      }
    },
    i = o[e] || o.default;
  n.textContent = i.text, t.style.color = i.color, t.style.background = i.bg, t.style.border = `1px solid ${i.border}`, t.firstChild.textContent = i.icon + " ", t.disabled = "granted" === e || "denied" === e || "error" === e || "unsupported" === e
}
async function requestPushPermission() {
  if (!("Notification" in window)) return void showToast("⚠ Prohlížeč notifikace nepodporuje");
  if ("denied" === Notification.permission) return void showToast("🚫 Notifikace jsou blokovány — odblokuj je v nastavení prohlížeče");
  const e = await Notification.requestPermission();
  "granted" === e ? (updatePwaBtn("granted"), showToast("✅ Notifikace povoleny! MůjFlix tě upozorní na nové epizody."), setTimeout(() => {
    window._swReg ? window._swReg.showNotification("MůjFlix 🎬", {
      body: "Notifikace fungují! Budeme tě informovat o nových epizodách.",
      tag: "mujflix-test",
      icon: "",
      vibrate: [200, 100, 200]
    }) : new Notification("MůjFlix 🎬", {
      body: "Notifikace fungují!"
    })
  }, 800)) : "denied" === e && (updatePwaBtn("denied"), showToast("🚫 Notifikace blokovány — povol je v nastavení prohlížeče"))
}
window.mfNotify = function(e, t, n) {
  if ("granted" !== Notification.permission) return;
  const o = {
    body: t,
    tag: "mujflix-" + (n || "general"),
    icon: "",
    data: {
      url: "./?open=" + (n || "")
    },
    vibrate: [200, 100, 200]
  };
  window._swReg ? window._swReg.showNotification(e, o) : new Notification(e, o)
};
const _origCheckNewEps = "function" == typeof checkNewEpisodes ? checkNewEpisodes : null;
document.addEventListener("keydown", e => {
  "v" === e.key || "V" === e.key ? speechManager.startListening() : "m" !== e.key && "M" !== e.key || speechManager.stopListening();
});
const PROFILES_KEY = "mf_profiles_v2",
  ACTIVE_PID_KEY = "mf_active_pid",
  PROFILE_COLORS = ["#007AFF", "#ff6b6b", "#4ecdc4", "#a29bfe", "#fd79a8", "#fdcb6e", "#6c5ce7", "#00b894", "#e17055", "#74b9ff"],
  PROFILE_EMOJIS = ["🎬", "🍿", "🎭", "🎪", "🎡", "🃏", "🎲", "🎰", "🦁", "🐺", "🦊", "🐸", "👾", "🤖", "🦸", "🧙", "🧛", "🤡", "👻", "🤩", "😎", "🥷", "🦄", "🐉"];

function _getProfiles() {
  const normalize = (value) => {
    if (Array.isArray(value)) return value.filter(profile => profile && typeof profile === "object");
    if (value && typeof value === "object") {
      return Object.entries(value).map(([id, profile]) => ({
        ...(profile && typeof profile === "object" ? profile : {}),
        id: profile && profile.id ? profile.id : "p_" + id
      }));
    }
    return [];
  };
  try {
    const stored = window.MFProfilesDB && typeof window.MFProfilesDB.getSync === "function"
      ? window.MFProfilesDB.getSync()
      : [];
    const databaseProfiles = normalize(stored);
    if (databaseProfiles.length) return databaseProfiles;
  } catch (e) {
    console.warn("[ProfileGate] Nelze načíst profily z databáze:", e);
  }
  try {
    const keys = [PROFILES_KEY, "mf_profiles", "mujflix_users_v1", "mujflix_users"];
    for (const key of keys) {
      const profiles = normalize(safeLS(key, "[]"));
      if (profiles.length) return profiles;
    }
  } catch (e) {
    console.warn("[ProfileGate] Nelze načíst profily z úložiště:", e);
  }
  return [];
}

function _saveProfiles(profiles) {
  try {
    if (window.MFProfilesDB && typeof window.MFProfilesDB.saveProfiles === "function") {
      window.MFProfilesDB.saveProfiles(profiles);
    }
  } catch (e) {
    console.warn("[ProfileGate] Nelze uložit profily do databáze:", e);
  }
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch(e) {
    console.warn("[ProfileGate] Nelze uložit profily do úložiště:", e);
  }
}

function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PID_KEY) || null
}

function getActiveProfile() {
  const e = getActiveProfileId();
  return e && _getProfiles().find(t => t.id === e) || null
}

function uKey(e) {
  const t = getActiveProfileId();
  return t ? e + "_" + t : e
}

function getActiveUser() {
  return getActiveProfile()
}

function getActiveUserId() {
  return getActiveProfileId()
}

function setActiveUser(e) {
  localStorage.setItem(ACTIVE_PID_KEY, e), ProfileGate.renderBadge(), _applyProfileAccent()
}

// ══════════════════════════════════════════════════════════════════
// ČESKÉ SKLOŇOVÁNÍ JMEN — 5. pád (vokativ) pro oslovení "Ahoj, ...!"
// Nejdřív zkusí slovník nejběžnějších českých jmen, pak spadne na
// obecná heuristická pravidla podle poslední hlásky jména.
// ══════════════════════════════════════════════════════════════════
const CZ_VOCATIVE_DICT = {
  // Mužská jména
  "jan": "Jene", "honza": "Honzo", "jiří": "Jiří", "petr": "Petře", "pavel": "Pavle",
  "josef": "Josefe", "pepa": "Pepo", "jaroslav": "Jaroslave", "martin": "Martine",
  "tomáš": "Tomáši", "miroslav": "Miroslave", "františek": "Františku", "zdeněk": "Zdeňku",
  "václav": "Václave", "michal": "Michale", "vladimír": "Vladimíre", "karel": "Karle",
  "milan": "Milane", "jakub": "Jakube", "kuba": "Kubo", "lukáš": "Lukáši", "david": "Davide",
  "ondřej": "Ondřeji", "marek": "Marku", "radek": "Radku", "roman": "Romane",
  "stanislav": "Stanislave", "standa": "Stando", "antonín": "Antoníne", "tonda": "Tondo",
  "vojtěch": "Vojtěchu", "filip": "Filipe", "daniel": "Danieli", "adam": "Adame",
  "dominik": "Dominiku", "matěj": "Matěji", "šimon": "Šimone", "patrik": "Patriku",
  "radim": "Radime", "libor": "Libore", "bohumil": "Bohumile", "vlastimil": "Vlastimile",
  "přemysl": "Přemysle", "rostislav": "Rostislave", "ladislav": "Ladislave",
  "otakar": "Otakare", "kryštof": "Kryštofe", "matyáš": "Matyáši", "alois": "Aloisi",
  "viktor": "Viktore", "robert": "Roberte", "richard": "Richarde", "erik": "Eriku",
  "denis": "Denisi", "kevin": "Kevine", "oliver": "Olivere", "vít": "Víte", "igor": "Igore",
  "alexandr": "Alexandře", "alex": "Alexi", "emil": "Emile", "bruno": "Bruno",
  "šimon ": "Šimone", "ivo": "Ivo", "ivan": "Ivane", "dušan": "Dušane", "hynek": "Hynku",
  "sebastián": "Sebastiáne", "matouš": "Matouši", "šťěpán": "Štěpáne", "štěpán": "Štěpáne",
  "vašek": "Vašku", "jindřich": "Jindřichu", "bedřich": "Bedřichu", "oskar": "Oskare",
  "leoš": "Leoši", "miloš": "Miloši", "luboš": "Luboši", "aleš": "Aleši",
  // Ženská jména
  "jana": "Jano", "marie": "Marie", "eva": "Evo", "hana": "Hano", "anna": "Anno",
  "věra": "Věro", "petra": "Petro", "lenka": "Lenko", "lucie": "Lucie",
  "kateřina": "Kateřino", "káťa": "Káťo", "kristýna": "Kristýno", "barbora": "Barboro",
  "bára": "Báro", "tereza": "Terezo", "míša": "Míšo", "michaela": "Michaelo",
  "veronika": "Veroniko", "zuzana": "Zuzano", "alena": "Aleno", "ivana": "Ivano",
  "jitka": "Jitko", "monika": "Moniko", "renata": "Renato", "simona": "Simono",
  "nikola": "Nikolo", "klára": "Kláro", "adéla": "Adélo", "karolína": "Karolíno",
  "natálie": "Natálie", "eliška": "Eliško", "sofie": "Sofie", "viktorie": "Viktorie",
  "aneta": "Aneto", "denisa": "Deniso", "gabriela": "Gabrielo", "andrea": "Andreo",
  "dana": "Dano", "ludmila": "Ludmilo", "vlasta": "Vlasto", "milena": "Mileno",
  "olga": "Olgo", "marta": "Marto", "blanka": "Blanko", "iveta": "Iveto",
  "radka": "Radko", "silvie": "Silvie", "kamila": "Kamilo", "pavla": "Pavlo",
  "helena": "Heleno", "markéta": "Markéto", "julie": "Julie", "ema": "Emo",
  "amálie": "Amálie", "vendula": "Vendulo", "šárka": "Šárko", "štěpánka": "Štěpánko",
  "magdaléna": "Magdaléno", "linda": "Lindo", "sára": "Sáro", "diana": "Diano"
};

function czechVocative(name) {
  try {
    if (!name || typeof name !== "string") return name;
    const trimmed = name.trim();
    if (!trimmed) return name;
    const key = trimmed.toLowerCase();
    if (CZ_VOCATIVE_DICT[key]) return CZ_VOCATIVE_DICT[key];

    // Obecná heuristika, když jméno není ve slovníku
    const lower = trimmed.toLowerCase();
    const base = trimmed.slice(0, -1);

    if (/[aeiouyáéíóúůý]$/i.test(trimmed) === false) {
      // Jméno končí na souhlásku → mužské skloňování
      if (lower.endsWith("ch")) return trimmed + "u";
      const last = lower.slice(-1);
      if ("khg".includes(last)) return trimmed + "u";
      if ("cčřšžj".includes(last)) return trimmed + "i";
      if (last === "r") {
        const before = lower.slice(-2, -1);
        const isVowel = /[aeiouyáéíóúůý]/.test(before);
        return isVowel ? trimmed + "e" : trimmed.slice(0, -1) + "ře";
      }
      // d, t, n, b, p, v, f, m, s, z, l a ostatní → +e
      return trimmed + "e";
    }
    if (lower.endsWith("a")) return base + "o";
    // jména končící na e/ie/o/í/y zůstávají ve vokativu stejná
    return trimmed;
  } catch (e) {
    return name;
  }
}
window.czechVocative = czechVocative;

function createUser(e, t) {
  return ProfileGate.createProfile({
    name: e,
    avatar: t || "🎬",
    color: PROFILE_COLORS[0]
  })
}

function updateUser(e, t) {
  const n = _getProfiles(),
    o = n.findIndex(t => t.id === e);
  o < 0 || (n[o] = {
    ...n[o],
    ...t
  }, _saveProfiles(n))
}

function updateUserPrefs(e, t) {
  const n = _getProfiles(),
    o = n.findIndex(t => t.id === e);
  o < 0 || (n[o].prefs || (n[o].prefs = {}), n[o].prefs = {
    ...n[o].prefs,
    ...t
  }, _saveProfiles(n))
}

function updateUserFeature(e, t, n) {
  const o = _getProfiles(),
    i = o.findIndex(t => t.id === e);
  i < 0 || (o[i].prefs || (o[i].prefs = {}), o[i].prefs.features || (o[i].prefs.features = {}), o[i].prefs.features[t] = n, _saveProfiles(o), _applyProfileAccent())
}

function addToUserHistory(e) {
  const t = getActiveProfileId();
  if (!t) return;
  const n = _getProfiles(),
    o = n.findIndex(e => e.id === t);
  if (o < 0) return;
  const i = {
    id: e.id,
    type: e.media_type || "movie",
    name: e.title || e.name || "",
    genres: e.genre_ids || [],
    rating: e.vote_average || 0,
    ts: Date.now()
  };
  n[o].history || (n[o].history = []), n[o].history = [i, ...n[o].history.filter(t => t.id !== e.id)].slice(0, 200);
  const a = {};
  n[o].history.forEach(e => (e.genres || []).forEach(e => {
    a[e] = (a[e] || 0) + 1
  })), n[o].likedGenres = Object.entries(a).sort((e, t) => t[1] - e[1]).slice(0, 5).map(e => +e[0]), getActiveProfileId() === t && void 0 !== aiBrain && aiBrain.boostGenreIds(i.genres || [], .04), _saveProfiles(n)
}

function deleteUser(e) {
  if (!confirm("Smazat profil?")) return;
  const t = _getProfiles().filter(t => t.id !== e);
  _saveProfiles(t), getActiveProfileId() === e && (t.length ? setActiveUser(t[0].id) : localStorage.removeItem(ACTIVE_PID_KEY)), ProfileGate.renderBadge(), getActiveProfileId() || ProfileGate.show()
}

function _getUserDB() {
  const e = {};
  return _getProfiles().forEach(t => {
    e[t.id] = t
  }), e
}

function _saveUserDB(e) {
  _saveProfiles(Object.values(e))
}

function _applyProfileAccent() {
  const e = getActiveProfile(),
    t = e?.color || "#007AFF";
  document.documentElement.style.setProperty("--accent", t), document.documentElement.style.setProperty("--accent2", t);
  const n = document.getElementById("mfProfileBadge");
  if (n) {
    n.style.borderColor = t + "44";
    const e = n.querySelector(".mpb-avatar");
    e && (e.style.borderColor = t + "88")
  }
  const o = document.querySelector(".bg-glow");
  if (o) {
    const e = parseInt(t.slice(1, 3), 16),
      n = parseInt(t.slice(3, 5), 16),
      i = parseInt(t.slice(5, 7), 16);
    o.style.background = `\n          radial-gradient(ellipse 70% 55% at 15% 15%, rgba(${e},${n},${i},0.07) 0%, transparent 65%),\n          radial-gradient(ellipse 55% 65% at 85% 85%, rgba(60,80,255,0.05) 0%, transparent 65%),\n          radial-gradient(ellipse 40% 40% at 50% 100%, rgba(${e},${n},${i},0.03) 0%, transparent 70%)`
  }
}

function _applyUserPreferences() {
  const e = getActiveProfile();
  if (!e) return;
  const t = e.prefs?.features || {};
  "function" == typeof _setSoundEnabled && _setSoundEnabled(!1 !== t.soundEnabled)
}
async function _userAwareFetch(e) {
  const t = getActiveProfile(),
    n = t?.likedGenres || [],
    o = t?.prefs?.contentPref || e || "all",
    i = t?.prefs?.algo || {
      trending: .4,
      topRated: .3,
      watchlistBased: .3
    },
    a = Math.floor(6 * Math.random()) + 1;
  let s = [];
  try {
    if (n.length && Math.random() < 1.2 * (i.watchlistBased + i.topRated)) {
      const e = n.slice(0, 3).join(",");
      if ("tv" !== o) {
        const t = await tmdbGet(`/discover/movie?with_genres=${e}&sort_by=vote_average.desc&vote_count.gte=200&page=${a}`);
        (t?.results || []).filter(e => e.poster_path).forEach(e => s.push({
          ...e,
          media_type: "movie",
          _personalised: !0
        }))
      }
      if ("movie" !== o) {
        const t = await tmdbGet(`/discover/tv?with_genres=${e}&sort_by=vote_average.desc&vote_count.gte=100&page=${a}`);
        (t?.results || []).filter(e => e.poster_path).forEach(e => s.push({
          ...e,
          media_type: "tv",
          _personalised: !0
        }))
      }
    }
    if (Math.random() < i.trending) {
      const e = await tmdbGet(`/trending/${"movie"===o?"movie":"tv"===o?"tv":"all"}/week?language=cs&page=${a}`);
      (e?.results || []).filter(e => e.poster_path && ("movie" === e.media_type || "tv" === e.media_type)).forEach(e => s.push(e))
    }
    if (Math.random() < i.topRated) {
      if ("tv" !== o) {
        const e = await tmdbGet(`/movie/top_rated?language=cs&page=${a}`);
        (e?.results || []).filter(e => e.poster_path).forEach(e => s.push({
          ...e,
          media_type: "movie"
        }))
      }
      if ("movie" !== o) {
        const e = await tmdbGet(`/tv/top_rated?language=cs&page=${a}`);
        (e?.results || []).filter(e => e.poster_path).forEach(e => s.push({
          ...e,
          media_type: "tv"
        }))
      }
    }
  } catch (e) {}
  return s
}

function _saveAlgoWeight(e, t) {
  const n = getActiveProfileId();
  if (!n) return;
  const o = _getProfiles(),
    i = o.findIndex(e => e.id === n);
  i < 0 || (o[i].prefs || (o[i].prefs = {}), o[i].prefs.algo || (o[i].prefs.algo = {}), o[i].prefs.algo[e] = +t, _saveProfiles(o))
}

function _saveContentPref(e, t) {
  const n = getActiveProfileId();
  n && (updateUserPrefs(n, {
    contentPref: e
  }), t.closest("div").querySelectorAll("button").forEach(t => {
    const n = t.dataset.pref === e;
    t.style.borderColor = n ? "rgba(200,164,0,0.5)" : "rgba(255,255,255,0.1)", t.style.background = n ? "rgba(200,164,0,0.12)" : "rgba(255,255,255,0.03)", t.style.color = n ? "#c8a400" : "rgba(255,255,255,0.5)"
  }))
}

function clearTraktToken() {
  try {
    localStorage.removeItem(getTraktTokenKey())
  } catch (e) {}
}
const ProfileGate = {
  _pinBuffer: "",
  _pinTargetId: null,
  _editingId: null,
  _manageMode: false,
  _selectedEmoji: PROFILE_EMOJIS[0],
  _selectedColor: PROFILE_COLORS[0],
  _selectedAvatar: PROFILE_EMOJIS[0],
  show() {
    const e = document.getElementById("mfProfileGate");
    e && (e.style.display = "flex", e.classList.remove("hiding")), this._manageMode = false, this.renderGate()
  },
  hide() {
    const e = document.getElementById("mfProfileGate");
    e && (e.classList.add("hiding"), setTimeout(() => {
      e.style.display = "none"
    }, 520))
  },
  renderGate() {
    const e = document.getElementById("pgProfilesList");
    if (!e) return;
    const t = _getProfiles();
    e.innerHTML = "", t.forEach(t => {
      const n = document.createElement("div");
      n.dataset.profileId = t.id;
      n.className = "pg-profile-item" + (this._manageMode ? " pg-manage-mode" : "");
      const avatar = /^https?:\/\//i.test(t.avatar || "") ?
        `<img class="pg-avatar-image" src="${t.avatar}" alt="">` : (t.avatar || "🎬");
      n.innerHTML = `
            <div class="pg-avatar-wrap">
              <div class="pg-avatar" style="--pg-color:${t.color||"#007AFF"};${getActiveProfileId()===t.id?"border-color:"+t.color+";box-shadow:0 0 0 1px "+t.color+",0 8px 40px rgba(0,0,0,0.6);":""}">
                ${avatar}
              </div>
              ${this._manageMode ? `<button class="pg-remove-btn" type="button" aria-label="Odebrat profil ${t.name}" onclick="event.stopPropagation(); window.ProfileGate?.removeProfile('${t.id}')">−</button>` : ""}
            </div>
            <div class="pg-name">${t.name}</div>
          `;
      n.onclick = () => this._manageMode ? void 0 : ProfileGate.selectProfile(t.id);
      e.appendChild(n);
    });
    const n = document.createElement("div");
    n.className = "pg-profile-item", n.innerHTML = '\n          <div class="pg-add-btn">＋</div>\n          <div class="pg-name" style="color:rgba(255,255,255,0.35)">Přidat profil</div>\n        ', n.onclick = () => ProfileGate.openCreate(), e.appendChild(n)
    const manage = document.getElementById("profileManageBtn");
    if (manage) {
      manage.textContent = this._manageMode ? "Hotovo" : "Upravit";
      manage.classList.toggle("active", this._manageMode);
    }
  },
  toggleManageMode() {
    this._manageMode = !this._manageMode;
    this.renderGate();
  },
  removeProfile(e) {
    const t = _getProfiles().find(t => t.id === e);
    if (!t) return;
    const item = document.querySelector(`.pg-profile-item[data-profile-id="${e}"]`);
    if (item) item.classList.add("pg-removing");
    setTimeout(() => {
      const profiles = _getProfiles().filter(profile => profile.id !== e);
      _saveProfiles(profiles);
      if (getActiveProfileId() === e) {
        profiles.length ? setActiveUser(profiles[0].id) : localStorage.removeItem(ACTIVE_PID_KEY);
        this.renderBadge();
      }
      this._manageMode = true;
      this.renderGate();
      if (!profiles.length) this.show();
    }, item ? 220 : 0);
  },
  selectProfile(e) {
    // OPRAVA: robustní select — loguje proč případně selhalo
    try {
      const profiles = _getProfiles();
      const t = profiles.find(t => t.id === e);
      if (!t) {
        console.warn('[ProfileGate] selectProfile: profil nenalezen, id=', e, 'dostupné:', profiles.map(p=>p.id));
        // Fallback: pokud existuje aspoň jeden profil, vezmi první
        if (profiles.length > 0) {
          console.info('[ProfileGate] Fallback: aktivuji první profil');
          this.activateProfile(profiles[0].id);
        }
        return;
      }
      t.pin ? this.openPin(t) : this.activateProfile(t.id);
    } catch(err) {
      console.error('[ProfileGate] selectProfile chyba:', err);
      // Nouzový fallback — zavři gate i bez profilu
      this.hide();
    }
  },
  activateProfile(e) {
    localStorage.setItem(ACTIVE_PID_KEY, e), this.renderBadge(), _applyProfileAccent(), _applyUserPreferences(), this.hide(), this.closePin(), setTimeout(() => {
      void 0 !== aiBrain && (aiBrain.reloadForProfile(), aiBrain.applyDecay()), "function" == typeof refreshUserContent && refreshUserContent(), "function" == typeof updateWatchlistBadge && updateWatchlistBadge(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns(), "function" == typeof updateLogoProgress && updateLogoProgress(), "function" == typeof updateContinueWidget && updateContinueWidget()
    }, 100);
    const t = _getProfiles().find(t => t.id === e);
    if (t) {
      const n = document.getElementById("mfWelcomeNote");
      n && (n.textContent = "Ahoj, " + czechVocative((t.name || "").split(" ")[0]), n.classList.add("show"), clearTimeout(n._timer), n._timer = setTimeout(() => n.classList.remove("show"), 4200));
    }
  },
  openPin(e) {
    this._pinBuffer = "", this._pinTargetId = e.id;
    const t = document.getElementById("mfPinModal");
    t && (document.getElementById("pmAvatar").textContent = e.avatar || "🎬", document.getElementById("pmTitle").textContent = e.name, t.classList.add("show"), this._renderPinDots())
  },
  closePin() {
    this._pinBuffer = "", this._pinTargetId = null;
    const e = document.getElementById("mfPinModal");
    e && e.classList.remove("show"), this._renderPinDots()
  },
  pinInput(e) {
    "back" === e ? this._pinBuffer = this._pinBuffer.slice(0, -1) : this._pinBuffer.length < 4 && (this._pinBuffer += e), this._renderPinDots(), 4 === this._pinBuffer.length && setTimeout(() => this._checkPin(), 120)
  },
  _renderPinDots(e) {
    for (let t = 0; t < 4; t++) {
      const n = document.getElementById("pmd" + t);
      n && (n.className = "pm-dot", t < this._pinBuffer.length && n.classList.add("filled"), "error" === e && n.classList.add("error"))
    }
  },
  _checkPin() {
    const e = _getProfiles().find(e => e.id === this._pinTargetId);
    e && (this._pinBuffer === e.pin ? this.activateProfile(e.id) : (this._renderPinDots("error"), setTimeout(() => {
      this._pinBuffer = "", this._renderPinDots()
    }, 700)))
  },
  openCreate(e) {
    this._editingId = e || null, this._selectedEmoji = PROFILE_EMOJIS[0], this._selectedColor = PROFILE_COLORS[0], this._selectedAvatar = PROFILE_EMOJIS[0];
    const t = document.getElementById("mfProfileCreate");
    if (!t) return;
    // FIX: Disable pointer-events on gate so it doesn't swallow clicks on the create modal
    const _gate = document.getElementById("mfProfileGate");
    if (_gate) _gate.style.pointerEvents = "none";
    document.getElementById("pcModalTitle").textContent = e ? "Upravit profil" : "Vytvoř si svůj profil";
    const n = document.getElementById("pcName");
    if (e) {
      const t = _getProfiles().find(t => t.id === e);
      t && (n.value = t.name, this._selectedAvatar = t.avatar || PROFILE_EMOJIS[0], this._selectedColor = t.color || PROFILE_COLORS[0])
    } else n.value = "";
    const preview = document.getElementById("pcAvatarPreview");
    preview && (preview.innerHTML = /^https?:\/\//i.test(this._selectedAvatar) ? `<img src="${this._selectedAvatar}" alt="">` : this._selectedAvatar);
    const picker = document.getElementById("pcAvatarPicker");
    picker && (picker.hidden = true);
    this.loadAvatarPicker("movie");
    ["pcPin0", "pcPin1", "pcPin2", "pcPin3"].forEach(e => {
      const t = document.getElementById(e);
      t && (t.value = "")
    }), t.classList.add("show"), setTimeout(() => n.focus(), 100)
  },
  closeCreate() {
    const e = document.getElementById("mfProfileCreate");
    e && e.classList.remove("show"), this._editingId = null;
    // FIX: Restore pointer-events on gate
    const _gate = document.getElementById("mfProfileGate");
    if (_gate) _gate.style.pointerEvents = "";
  },
  _pickEmoji(e, t) {
    this._selectedEmoji = e, document.querySelectorAll(".pc-emoji-btn").forEach(e => e.classList.remove("selected")), t.classList.add("selected")
  },
  toggleAvatarPicker() {
    const e = document.getElementById("pcAvatarPicker");
    if (e) e.hidden = !e.hidden;
  },
  async loadAvatarPicker(e) {
    const grid = document.getElementById("pcAvatarGrid");
    if (!grid) return;
    document.querySelectorAll("[data-avatar-type]").forEach(t => t.classList.toggle("active", t.dataset.avatarType === e));
    grid.innerHTML = '<div class="pc-avatar-loading">Načítám postavy…</div>';
    try {
      const data = await tmdbGet(e === "tv" ? "/trending/tv/week?language=cs" : "/trending/movie/week?language=cs");
      const items = (data?.results || []).filter(t => t.poster_path).slice(0, 12);
      this._renderAvatarTitles(items, e);
    } catch (err) {
      grid.innerHTML = '<div class="pc-avatar-loading">Tituly se nepodařilo načíst.</div>';
      console.warn("[ProfileGate] Avatar picker", err);
    }
  },
  async searchAvatarTitles(e) {
    const q = e.trim(), grid = document.getElementById("pcAvatarGrid");
    if (!grid || !q) return this.loadAvatarPicker(document.querySelector(".pc-avatar-tabs button.active")?.dataset.avatarType || "movie");
    clearTimeout(this._avatarSearchTimer);
    this._avatarSearchTimer = setTimeout(() => this._searchAvatarTitles(q), 280);
  },
  async _searchAvatarTitles(q) {
    const grid = document.getElementById("pcAvatarGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="pc-avatar-loading">Hledám…</div>';
    try {
      const type = document.querySelector(".pc-avatar-tabs button.active")?.dataset.avatarType || "movie";
      const data = await tmdbGet(`/search/${type}?query=${encodeURIComponent(q)}&language=cs`);
      this._renderAvatarTitles((data?.results || []).filter(t => t.poster_path).slice(0, 12), type);
    } catch (err) {
      grid.innerHTML = '<div class="pc-avatar-loading">Vyhledávání se nepodařilo.</div>';
    }
  },
  _renderAvatarTitles(items, type) {
    const grid = document.getElementById("pcAvatarGrid");
    if (!grid) return;
    grid.innerHTML = items.length ? items.map(t => `
      <button type="button" class="pc-avatar-option" onclick="window.ProfileGate?.loadAvatarCharacters(${t.id},'${type}')">
        <img src="https://image.tmdb.org/t/p/w185${t.poster_path}" alt="${String(t.title || t.name || "").replace(/"/g, "&quot;")}" loading="lazy">
        <span>${String(t.title || t.name || "").slice(0, 18)}</span>
      </button>`).join("") : '<div class="pc-avatar-loading">Nic jsme nenašli.</div>';
  },
  async loadAvatarCharacters(id, type) {
    const grid = document.getElementById("pcAvatarGrid");
    if (!grid) return;
    grid.innerHTML = '<div class="pc-avatar-loading">Načítám postavy…</div>';
    try {
      const data = await tmdbGet(`/${type}/${id}/credits?language=cs`);
      const cast = (data?.cast || []).filter(t => t.profile_path).slice(0, 20);
      grid.innerHTML = cast.length ? `<button type="button" class="pc-avatar-back" onclick="window.ProfileGate?.loadAvatarPicker('${type}')">← Zpět na tituly</button>` + cast.map(t => `
        <button type="button" class="pc-avatar-option pc-character-option" onclick="window.ProfileGate?.pickAvatar('https://image.tmdb.org/t/p/w185${t.profile_path}','${String(t.character || t.name || "").replace(/'/g, "\\'")}',this)">
          <img src="https://image.tmdb.org/t/p/w185${t.profile_path}" alt="${String(t.character || t.name || "").replace(/"/g, "&quot;")}" loading="lazy">
          <span>${String(t.character || t.name || "").slice(0, 18)}</span>
        </button>`).join("") : '<div class="pc-avatar-loading">Postavy jsme nenašli.</div>';
    } catch (err) {
      grid.innerHTML = '<div class="pc-avatar-loading">Postavy se nepodařilo načíst.</div>';
    }
  },
  pickAvatar(e, t, n) {
    this._selectedAvatar = e;
    const preview = document.getElementById("pcAvatarPreview");
    preview && (preview.innerHTML = `<img src="${e}" alt="">`);
    const label = document.getElementById("pcAvatarPickerLabel");
    label && (label.textContent = t || "Vybraná postava");
    document.querySelectorAll(".pc-avatar-option").forEach(e => e.classList.remove("selected"));
    n && n.classList.add("selected");
  },
  _pickColor(e, t) {
    this._selectedColor = e, document.querySelectorAll(".pc-color-swatch").forEach(e => e.classList.remove("selected")), t.classList.add("selected")
  },
  pinDigitNav(e, t) {
    if (e.value && t < 3) {
      const e = document.getElementById("pcPin" + (t + 1));
      e && e.focus()
    }
  },
  saveProfile() {
    const e = (document.getElementById("pcName")?.value || "").trim();
    if (!e) {
      const e = document.getElementById("pcName");
      return void(e && (e.style.borderColor = "rgba(255,80,80,0.5)", e.focus()))
    }
    const t = ["pcPin0", "pcPin1", "pcPin2", "pcPin3"].map(e => document.getElementById(e)?.value || "").join(""),
      n = 4 === t.length && /^\d{4}$/.test(t) ? t : null,
      o = _getProfiles();
    if (this._editingId) {
      const t = o.findIndex(e => e.id === this._editingId);
      t >= 0 && (o[t].name = e, o[t].avatar = this._selectedAvatar, n && (o[t].pin = n), _saveProfiles(o)), this.closeCreate(), this.renderGate(), this.renderBadge()
    } else {
      const t = this.createProfile({
        name: e,
        avatar: this._selectedAvatar,
        color: this._selectedColor,
        pin: n
      });
      this.closeCreate(), this.activateProfile(t), setTimeout(() => this.openOnboarding(t), 220)
    }
  },
  createProfile({
    name: e,
    avatar: t,
    color: n,
    pin: o
  }) {
    const i = "p_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      a = _getProfiles();
    return a.push({
      id: i,
      name: e,
      avatar: t || "🎬",
      color: n || PROFILE_COLORS[0],
      pin: o || null,
      created: Date.now(),
      history: [],
      likedGenres: [],
      prefs: {
        algo: {
          trending: .4,
          topRated: .3,
          watchlistBased: .3
        },
        features: {
          showTrailer: !0,
          showRating: !0,
          confettiOnWin: !0,
          soundEnabled: !0,
          darkGold: !0
        },
        contentPref: "all",
        lang: "cs"
      },
      trakt: null
    }), _saveProfiles(a), i
  },
  openOnboarding(e) {
    const t = document.getElementById("mfProfileWelcome"),
      n = document.getElementById("pwGenres");
    if (!t || !n) return;
    const o = [
      ["28", "⚡ Akce"], ["35", "😂 Komedie"], ["18", "🎭 Drama"],
      ["878", "🚀 Sci-Fi"], ["27", "👻 Horor"], ["16", "🎨 Animované"],
      ["10749", "💞 Romantika"], ["14", "✨ Fantasy"], ["53", "🔪 Thriller"]
    ];
    n.innerHTML = o.map(([e, t]) => `<button type="button" class="pw-genre" data-genre="${e}" onclick="this.classList.toggle('selected')">${t}</button>`).join("");
    t.dataset.profileId = e, t.classList.add("show"), t.setAttribute("aria-hidden", "false");
  },
  finishOnboarding() {
    const e = document.getElementById("mfProfileWelcome");
    if (!e) return;
    const t = e.dataset.profileId || getActiveProfileId(),
      n = [...e.querySelectorAll(".pw-genre.selected")].map(e => +e.dataset.genre);
    if (t) {
      const o = _getProfiles(), i = o.find(e => e.id === t);
      i && (n.length && (i.likedGenres = n.slice(0, 5)), i.prefs = { ...i.prefs, onboardingDone: !0 }, _saveProfiles(o));
      if (getActiveProfileId() === t && void 0 !== aiBrain) n.forEach(e => aiBrain.boostGenreIds([e], .12));
    }
    e.classList.remove("show"), e.setAttribute("aria-hidden", "true");
  },
  renderBadge() {
    const e = getActiveProfile(),
      t = document.getElementById("_mfUserBadge");
    t && t.remove();
    let n = document.getElementById("mfProfileBadge");
    if (!n) {
      n = document.createElement("div");
      n.id = "mfProfileBadge";
      n.onclick = () => ProfileGate.show();
      document.body.appendChild(n);
    }
    if (e) {
      const avatar = /^https?:\/\//i.test(e.avatar || "")
        ? `<img src="${e.avatar}" alt="">`
        : (e.avatar || "🎬");
      n.style.borderColor = (e.color || "#007AFF") + "44";
      n.innerHTML = `
        <div class="mpb-avatar" style="border-color:${e.color || "#007AFF"}88">${avatar}</div>
        <span class="mpb-name">${e.name}</span>
        <span class="mpb-arrow">▼</span>
      `;
    } else {
      n.style.borderColor = "rgba(255,255,255,0.1)";
      n.innerHTML = '<div class="mpb-avatar">👤</div><span class="mpb-name">Profil</span><span class="mpb-arrow">▼</span>';
    }
  }
};

// OPRAVA: const ProfileGate není automaticky na window — inline onclick="window.ProfileGate?.xyz()"
// by jinak tiše selhalo (optional chaining skryje undefined). Explicitní přiřazení to opravuje.
window.ProfileGate = ProfileGate;

function _renderUserBadge() {
  ProfileGate.renderBadge()
}

function openUserPanel() {
  ProfileGate.show()
}

function closeUserPanel() {}

function refreshUserContent() {
  void 0 !== db && Object.keys(db).forEach(e => {
    "function" == typeof updateTileProgress && updateTileProgress(e), "function" == typeof updateContinueBadge && updateContinueBadge(e)
  }), "function" == typeof updateContinueWidget && updateContinueWidget(), "function" == typeof updateLogoProgress && updateLogoProgress(), "function" == typeof updateWatchlistBadge && updateWatchlistBadge(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns()
}! function() {
  const e = _getProfiles();
  try {
    const t = safeLS("mujflix_users_v1", "{}"),
      n = Object.keys(t);
    if (n.length && 0 === e.length) {
      n.forEach(e => {
        const n = t[e],
          o = {
            id: "p_" + e,
            name: n.name || "Uživatel",
            avatar: n.avatar || "🎬",
            color: PROFILE_COLORS[0],
            pin: null,
            created: n.created || Date.now(),
            history: n.history || [],
            likedGenres: n.likedGenres || [],
            prefs: n.prefs || {},
            trakt: null
          };
        _getProfiles();
        const i = _getProfiles();
        i.push(o), _saveProfiles(i)
      });
      const e = localStorage.getItem("mujflix_active_user");
      e && localStorage.setItem(ACTIVE_PID_KEY, "p_" + e)
    }
  } catch (e) {}
  // Renderuj badge (aktualizuje avatar v hlavičce)
  ProfileGate.renderBadge();

  // Zobraz gate ihned po načtení DOM — vždy, bez ohledu na uložený profil.
  // Obsah stránky je zablokovaný gate překryvem (z-index 99999).
  // Odemkne se teprve po ProfileGate.activateProfile() → hide().
  function _showProfileGateOnLoad() {
    const gate = document.getElementById("mfProfileGate");
    if (!gate) return;
    gate.style.display = "flex";
    gate.style.opacity = "1";
    gate.classList.remove("hiding");
    ProfileGate.renderGate();
    // Render once more after the first layout pass so profiles are visible
    // even when storage-backed profile data finishes initializing late.
    requestAnimationFrame(() => {
      const list = document.getElementById("pgProfilesList");
      if (list && !list.children.length) ProfileGate.renderGate();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _showProfileGateOnLoad);
  } else {
    _showProfileGateOnLoad();
  }
}();
class SpeechManager {
  constructor() {
    const e = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new e, this.recognition.lang = "cs-CZ", this.recognition.continuous = !1, this.recognition.interimResults = !0, this.synth = window.speechSynthesis, this.isSpeaking = !1, this.isListening = !1, this.setupRecognitionListeners()
  }
  setupRecognitionListeners() {
    this.recognition.onstart = () => {
      window.MF_DEBUG && console.log("🎤 Poslechávám..."), this.isListening = !0, document.body.classList.add("listening");
      const e = document.getElementById("speechMicBtn");
      e && e.classList.add("listening")
    }, this.recognition.onresult = e => {
      let t = "";
      for (let n = e.resultIndex; n < e.results.length; n++) t += e.results[n][0].transcript;
      window.MF_DEBUG && console.log("📝 Text:", t), e.isFinal && this.handleSpeechResult(t)
    }, this.recognition.onerror = e => {
      console.error("❌ Chyba sluchačky:", e.error)
    }, this.recognition.onend = () => {
      window.MF_DEBUG && console.log("🔇 Přestaly jsem poslouchat"), this.isListening = !1, document.body.classList.remove("listening");
      const e = document.getElementById("speechMicBtn");
      e && e.classList.remove("listening")
    }
  }
  startListening() {
    this.isListening || this.recognition.start()
  }
  stopListening() {
    this.recognition.stop()
  }
  speak(e, t = "cs-CZ", n = 1) {
    this.isSpeaking && this.synth.cancel();
    const o = new SpeechSynthesisUtterance(e);
    "function" == typeof aiBubbleShow && aiBubbleShow(o), o.lang = t, o.rate = n, o.pitch = 1, o.volume = 1, o.onstart = () => {
      window.MF_DEBUG && console.log("🔊 Mluvím:", e), this.isSpeaking = !0
    }, o.onend = () => {
      window.MF_DEBUG && console.log("✅ Skončil jsem mluvit"), this.isSpeaking = !1
    }, o.onerror = e => {
      console.error("❌ Chyba TTS:", e.error)
    }, this.synth.speak(o)
  }
  handleSpeechResult(e) {
    window.MF_DEBUG && console.log("🎯 Zpracovávám:", e), e.toLowerCase().includes("simpsons") || e.toLowerCase().includes("simpsonovi") ? (this.speak("Otevírám The Simpsons!"), "function" == typeof openSeries && openSeries("the-simpsons")) : e.toLowerCase().includes("south park") ? (this.speak("South Park se otevírá!"), "function" == typeof openSeries && openSeries("south-park")) : e.toLowerCase().includes("family guy") ? (this.speak("Family Guy, tady jsem!"), "function" == typeof openSeries && openSeries("family-guy")) : e.toLowerCase().includes("futurama") ? (this.speak("Futurama se otevírá!"), "function" == typeof openSeries && openSeries("futurama")) : e.toLowerCase().includes("náhodný") || e.toLowerCase().includes("nevím co koukat") ? (this.speak("Otevírám vyhledávání."), openSearch()) : this.speak("Pochopil jsem: " + e)
  }
}
const speechManager = new SpeechManager;
async function _checkAdminCredentials(e, t) {
  const n = (new TextEncoder).encode(e + ":" + t),
    o = await crypto.subtle.digest("SHA-256", n);
  return "8f10270aba9208087a115fb18fc008a47e349f3d17ceeba3292eddbc7be97b37" === Array.from(new Uint8Array(o)).map(e => e.toString(16).padStart(2, "0")).join("")
}
console.log("🎤 Speech Manager zaregistrován!"), console.log("💡 Zkratky: V = start listening, M = stop"),
  function() {
    const e = document.getElementById("ai-bubble-canvas");
    if (!e) return;
    const t = e.getContext("2d"),
      n = 320,
      o = 320,
      i = 110;
    e.width = n, e.height = o;
    let a = !1,
      s = null,
      r = 0,
      l = 0,
      c = 0,
      d = 0;

    function m(e, t, n) {
      return .5 * (Math.sin(2.1 * e + n) * Math.cos(1.7 * t + .7 * n) + Math.sin(3.4 * e - 1.1 * n) * Math.sin(2.9 * t + .5 * n))
    }

    function u(e) {
      if (s = requestAnimationFrame(u), document.hidden) return;
      if (e - d < (a ? 20 : 50)) return;
      d = e, t.clearRect(0, 0, n, o), c += .018 + .06 * r, r += .12 * (l - r), t.save(), t.translate(160, 160);
      for (let e = 3; e >= 0; e--) {
        const n = i * (1.05 + .18 * r) + 18 * e,
          o = .06 - .012 * e,
          a = t.createRadialGradient(0, 0, .3 * n, 0, 0, n);
        a.addColorStop(0, "hsla(65,100%,75%," + (o + .08 * r) + ")"), a.addColorStop(1, "hsla(95,80%,50%,0)"), t.beginPath(), t.arc(0, 0, n, 0, 2 * Math.PI), t.fillStyle = a, t.fill()
      }
      t.beginPath();
      for (let e = 0; e <= 128; e++) {
        const n = e / 128 * Math.PI * 2,
          o = Math.cos(n),
          a = Math.sin(n),
          s = m(o, a, c) * (.08 + .22 * r),
          l = i * (1 + s),
          d = o * l,
          u = a * l;
        0 === e ? t.moveTo(d, u) : t.lineTo(d, u)
      }
      t.closePath();
      const p = t.createRadialGradient(.28 * -i, -35.2, 5.5, 0, 0, 1.15 * i);
      p.addColorStop(0, "hsla(80,100%,92%,0.98)"), p.addColorStop(.25, "hsla(65,100%,68%,0.95)"), p.addColorStop(.55, "hsla(55,90%,42%,0.92)"), p.addColorStop(.82, "hsla(40,80%,18%,0.97)"), p.addColorStop(1, "hsla(30,70%,8%,1)"), t.fillStyle = p, t.fill(), t.save(), t.clip();
      const g = t.createRadialGradient(-41.8, .42 * -i, 0, -22, -22, 71.5);
      g.addColorStop(0, "rgba(255,255,255,0.75)"), g.addColorStop(.35, "rgba(255,255,255,0.18)"), g.addColorStop(1, "rgba(255,255,255,0)"), t.fillStyle = g, t.fillRect(-160, -160, n, o);
      const f = t.createRadialGradient(55, .55 * i, 0, 33, 44, 66);
      if (f.addColorStop(0, "hsla(105,100%,85%," + (.12 + .18 * r) + ")"), f.addColorStop(1, "rgba(0,0,0,0)"), t.fillStyle = f, t.fillRect(-160, -160, n, o), t.restore(), r > .04)
        for (let e = 0; e < 3; e++) {
          const n = (2.5 * c + 1.2 * e) % (2 * Math.PI),
            o = i * (1.05 + .12 * e + .06 * Math.sin(n) * r),
            a = r * (.35 - .1 * e) * Math.abs(Math.sin(.5 * n));
          t.beginPath(), t.arc(0, 0, o, 0, 2 * Math.PI), t.strokeStyle = "hsla(65,100%,70%," + a + ")", t.lineWidth = 1.5 - .4 * e, t.stroke()
        }
      const y = t.createRadialGradient(0, 0, 0, 0, 0, 77);
      y.addColorStop(0, "hsla(75,100%,85%," + (.05 + .25 * r) + ")"), y.addColorStop(1, "rgba(0,0,0,0)"), t.beginPath(), t.arc(0, 0, 77, 0, 2 * Math.PI), t.fillStyle = y, t.fill(), t.restore()
    }
    window.aiBubbleShow = function(e) {
      const t = document.getElementById("ai-voice-bubble-overlay");
      t && (a = !0, r = 0, l = .1, t.classList.add("active"), s || u(), e && function(e) {
        let t = !1;
        e.onstart = () => {
          t = !0, l = .45;
          const e = document.getElementById("ai-bubble-label");
          e && (e.textContent = "AI mluvi...")
        }, e.onend = e.onerror = () => {
          t = !1, l = 0, setTimeout(() => {
            t || aiBubbleStop()
          }, 900)
        }, e.onboundary = () => {
          l = .5 + .4 * Math.random(), setTimeout(() => {
            l = Math.max(.2, l - .2)
          }, 80)
        };
        const n = setInterval(() => {
          if (!t) return void clearInterval(n);
          const e = Date.now() / 1e3,
            o = Math.abs(.3 * Math.sin(3.8 * e) + .15 * Math.sin(7.2 * e) + .2 * Math.sin(1.4 * e));
          l = .2 + .6 * o
        }, 40)
      }(e))
    }, window.aiBubbleStop = function() {
      a = !1, l = 0;
      const e = document.getElementById("ai-voice-bubble-overlay");
      e && e.classList.remove("active"), window.speechSynthesis && window.speechSynthesis.cancel(), setTimeout(() => {
        a || (cancelAnimationFrame(s), s = null, t.clearRect(0, 0, n, o))
      }, 600)
    }
  }();
let _adminLoggedIn = !1,
  _adminLoginTime = null,
  _adminBcastType = "toast",
  _adminFpsActive = !1,
  _adminFpsRaf = null,
  _adminFpsLast = 0,
  _adminFpsFrames = 0;

function adminLogin() {
  const e = document.getElementById("adminLoginModal");
  if (!e) return;
  e.style.display = "flex";
  const t = document.getElementById("adminLoginErr");
  t && (t.style.display = "none");
  const n = document.getElementById("adminUser"),
    o = document.getElementById("adminPass");
  n && (n.value = "", setTimeout(() => n.focus(), 80)), o && (o.value = "")
}

function adminCloseLogin() {
  const e = document.getElementById("adminLoginModal");
  e && (e.style.display = "none")
}
async function adminDoLogin() {
  const e = (document.getElementById("adminUser")?.value || "").trim(),
    t = document.getElementById("adminPass")?.value || "",
    n = document.getElementById("adminLoginErr");
  if (await _checkAdminCredentials(e, t)) _adminLoggedIn = !0, _adminLoginTime = Date.now(), adminCloseLogin(), adminOpenPanel();
  else {
    n && (n.style.display = "block");
    const e = document.getElementById("adminPass");
    e && (e.value = "", e.focus());
    const t = document.getElementById("adminLoginModal")?.querySelector("div");
    t && (t.style.animation = "none", t.style.transform = "translateX(0)", setTimeout(() => {
      t.style.transition = "transform 0.08s ease", [10, -10, 7, -7, 4, -4, 0].forEach((e, n) => {
        setTimeout(() => t.style.transform = `translateX(${e}px)`, 60 * n)
      })
    }, 10))
  }
}

function adminLogout() {
  _adminLoggedIn = !1, adminStopFps(), document.getElementById("adminPanel").style.display = "none", "function" == typeof showToast && showToast("👋 Admin odhlášen")
}

function adminOpenPanel() {
  if (!_adminLoggedIn) return;
  const e = document.getElementById("adminPanel");
  if (!e) return;
  e.style.display = "block", document.querySelectorAll(".adm-tab-content").forEach(e => e.style.display = "none");
  const t = document.getElementById("adminTab_profiles");
  t && (t.style.display = "block"), document.querySelectorAll(".adm-tab").forEach(e => {
    e.style.background = "rgba(255,255,255,0.04)", e.style.borderColor = "rgba(255,255,255,0.08)", e.style.color = "rgba(255,255,255,0.5)"
  });
  const n = document.querySelector(".adm-tab");
  n && (n.style.background = "rgba(0,122,255,0.12)", n.style.borderColor = "rgba(0,122,255,0.3)", n.style.color = "var(--accent)"), adminRefresh(), adminStartSessionTimer(), adminLoadBroadcastHistory();
  const o = "1" === localStorage.getItem("mf_admin_debug"),
    i = document.getElementById("adminDebugToggle");
  i && (i.textContent = o ? "ON" : "OFF", i.style.color = o ? "var(--accent)" : "rgba(255,255,255,0.5)")
}
let _adminSessionInterval = null;

function adminStartSessionTimer() {
  clearInterval(_adminSessionInterval), _adminSessionInterval = setInterval(() => {
    const e = document.getElementById("adminSessionTime");
    if (!e || !_adminLoginTime) return;
    const t = Math.floor((Date.now() - _adminLoginTime) / 1e3),
      n = Math.floor(t / 60),
      o = t % 60;
    e.textContent = `Session: ${n}:${String(o).padStart(2,"0")}`
  }, 1e3)
}

function adminRefresh() {
  adminLoadStats(), adminLoadProfiles(), adminLoadWatchlists(), adminLoadHistory(), adminLoadStorage()
}

function adminLoadStats() {
  const e = document.getElementById("adminStatsRow");
  if (!e) return;
  let t = 0,
    n = 0,
    o = 0;
  try {
    t = safeLS("mf_profiles_v2", "[]").length
  } catch (e) {}
  try {
    Object.keys(localStorage).forEach(e => {
      if (e.includes("watchlist") || e.includes("wl")) try {
        const t = JSON.parse(localStorage.getItem(e));
        Array.isArray(t) && (n += t.length)
      } catch (e) {}
    })
  } catch (e) {}
  try {
    Object.keys(localStorage).forEach(e => {
      if (e.includes("history") || e.includes("hist")) try {
        const t = JSON.parse(localStorage.getItem(e));
        Array.isArray(t) && (o += t.length)
      } catch (e) {}
    })
  } catch (e) {}
  const i = Object.keys(localStorage).reduce((e, t) => e + (localStorage.getItem(t) || "").length, 0),
    a = [{
      icon: "👥",
      label: "Profilů",
      value: t,
      color: "var(--accent)"
    }, {
      icon: "📋",
      label: "Watchlist položek",
      value: n,
      color: "#00cfff"
    }, {
      icon: "📜",
      label: "Historie záznamů",
      value: o,
      color: "#ff4ecb"
    }, {
      icon: "💾",
      label: "Storage",
      value: (i / 1024).toFixed(1) + " KB",
      color: "#50fa7b"
    }];
  e.innerHTML = a.map(e => `\n      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;text-align:center;">\n        <div style="font-size:1.4rem;margin-bottom:4px;">${e.icon}</div>\n        <div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1.35rem;font-weight:900;color:${e.color};">${e.value}</div>\n        <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-top:2px;">${e.label}</div>\n      </div>\n    `).join("")
}

function adminSwitchTab(e, t) {
  document.querySelectorAll(".adm-tab").forEach(e => {
    e.style.background = "rgba(255,255,255,0.04)", e.style.borderColor = "rgba(255,255,255,0.08)", e.style.color = "rgba(255,255,255,0.5)"
  }), document.querySelectorAll(".adm-tab-content").forEach(e => e.style.display = "none");
  const n = t || ("undefined" != typeof event ? event.currentTarget : null);
  n && (n.style.background = "rgba(0,122,255,0.12)", n.style.borderColor = "rgba(0,122,255,0.3)", n.style.color = "var(--accent)");
  const o = document.getElementById("adminTab_" + e);
  o && (o.style.display = "block"), "apikeys" === e && setTimeout(adminRenderPerProfileKeys, 60)
}

function adminLoadProfiles() {
  const e = document.getElementById("adminProfilesList");
  if (!e) return;
  let t = [];
  try {
    t = safeLS("mf_profiles_v2", "[]")
  } catch (e) {}
  t.length ? e.innerHTML = t.map((e, t) => `\n      <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">\n        <div style="width:40px;height:40px;border-radius:50%;background:${e.color||"#333"};display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">${e.avatar||"🎬"}</div>\n        <div style="flex:1;min-width:0;">\n          <div style="font-size:0.85rem;font-weight:700;">${e.name||"Profil "+(t+1)}</div>\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-top:2px;">\n            PIN: ${e.pin?"••••":"—"} · Barva: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${e.color||"#888"};vertical-align:middle;"></span>\n            ${e.traktToken?" · Trakt ✓":""}\n          </div>\n        </div>\n        <div style="display:flex;gap:6px;">\n          <button onclick="adminEditProfile(${t})" style="padding:6px 12px;border-radius:8px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);color:rgba(0,122,255,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">✏ Upravit</button>\n          <button onclick="adminDeleteProfile(${t})" style="padding:6px 12px;border-radius:8px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,100,100,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">🗑</button>\n        </div>\n      </div>\n    `).join("") : e.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Žádné profily</div>'
}

function adminDeleteProfile(e) {
  if (confirm("Smazat profil č. " + (e + 1) + "? Toto je nevratné!")) try {
    const t = safeLS("mf_profiles_v2", "[]");
    t.splice(e, 1), safeSetItem("mf_profiles_v2", JSON.stringify(t)), adminRefresh(), "function" == typeof showToast && showToast("🗑 Profil smazán")
  } catch (e) {}
}

function adminEditProfile(e) {
  try {
    const t = safeLS("mf_profiles_v2", "[]"),
      n = t[e];
    if (!n) return;
    const o = prompt("Nové jméno profilu:", n.name || "");
    if (null === o) return;
    o.trim() && (n.name = o.trim());
    const i = prompt("Nový PIN (4 číslice, prázdné = bez PINu):", "");
    null !== i && (n.pin = i.trim() || null), t[e] = n, safeSetItem("mf_profiles_v2", JSON.stringify(t)), adminLoadProfiles(), "function" == typeof showToast && showToast("✓ Profil upraven")
  } catch (e) {}
}

function adminCreateProfile() {
  const e = prompt("Jméno nového profilu:");
  if (e && e.trim()) try {
    const t = safeLS("mf_profiles_v2", "[]");
    t.push({
      name: e.trim(),
      avatar: "🎬",
      color: "#007AFF",
      pin: null
    }), safeSetItem("mf_profiles_v2", JSON.stringify(t)), adminRefresh(), "function" == typeof showToast && showToast("✓ Profil vytvořen: " + e.trim())
  } catch (e) {}
}

function adminLoadWatchlists() {
  const e = document.getElementById("adminWatchlistContent");
  if (!e) return;
  let t = [];
  try {
    t = safeLS("mf_profiles_v2", "[]")
  } catch (e) {}
  t.length ? (e.innerHTML = "", t.forEach((t, n) => {
    t.id;
    let o = [];
    ["mf_watchlist_" + (t.id || n), "mf_watchlist_" + n, "mf_watchlist"].forEach(e => {
      try {
        const t = safeLS(e, "[]");
        Array.isArray(t) && t.length && (o = t)
      } catch (e) {}
    });
    const i = document.createElement("div");
    i.style.cssText = "background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;", i.innerHTML = `\n        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">\n          <div style="font-size:1rem;">${t.avatar||"🎬"}</div>\n          <div style="font-size:0.82rem;font-weight:700;">${t.name||"Profil "+(n+1)}</div>\n          <div style="margin-left:auto;font-size:0.6rem;color:rgba(255,255,255,0.3);">${o.length} položek</div>\n        </div>\n        ${o.length?o.slice(0,5).map(e=>`\n          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid rgba(255,255,255,0.04);font-size:0.7rem;">\n            <span>${"movie"===e.type?"🎬":"📺"}</span>\n            <span style="flex:1;">${e.name||e.title||"?"}</span>\n          </div>\n        `).join("")+(o.length>5?`<div style="font-size:0.62rem;color:rgba(255,255,255,0.3);margin-top:6px;">... a ${o.length-5} dalších</div>`:""):'<div style="font-size:0.68rem;color:rgba(255,255,255,0.25);">Prázdný watchlist</div>'}\n      `, e.appendChild(i)
  })) : e.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);">Žádné profily</div>'
}

function adminLoadHistory() {
  const e = document.getElementById("adminHistoryContent");
  if (!e) return;
  let t = [];
  try {
    t = safeLS("mf_user_history", "[]")
  } catch (e) {}
  Object.keys(localStorage).forEach(e => {
    if (e.includes("history") && !t.length) try {
      const n = safeLS(e, "[]");
      Array.isArray(n) && n.length && (t = n)
    } catch (e) {}
  }), t.length ? e.innerHTML = t.slice(0, 30).map((e, t) => {
    const n = e.title || e.name || e.t || JSON.stringify(e).slice(0, 40),
      o = e.ts || e.timestamp || e.date;
    return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);">\n        <span style="font-size:0.65rem;color:rgba(255,255,255,0.2);min-width:20px;">${t+1}</span>\n        <span style="flex:1;font-size:0.72rem;">${n}</span>\n        <span style="font-size:0.6rem;color:rgba(255,255,255,0.25);">${o?new Date(o).toLocaleDateString("cs-CZ"):""}</span>\n      </div>`
  }).join("") + (t.length > 30 ? `<div style="font-size:0.65rem;color:rgba(255,255,255,0.3);margin-top:8px;">... a ${t.length-30} dalších záznamů</div>` : "") : e.innerHTML = '<div style="color:rgba(255,255,255,0.3);">Žádná historie</div>'
}

function adminClearHistory() {
  confirm("Smazat celou historii sledování?") && (Object.keys(localStorage).forEach(e => {
    e.includes("history") && localStorage.removeItem(e)
  }), adminRefresh(), "function" == typeof showToast && showToast("🗑 Historie smazána"))
}

function adminLoadStorage() {
  const e = document.getElementById("adminStorageList"),
    t = document.getElementById("adminStorageSize");
  if (!e) return;
  const n = Object.keys(localStorage).sort(),
    o = n.reduce((e, t) => e + (localStorage.getItem(t) || "").length, 0);
  t && (t.textContent = "Celkem: " + (o / 1024).toFixed(1) + " KB / ~5 MB");
  const i = (document.getElementById("adminStorageSearch")?.value || "").toLowerCase(),
    a = n.filter(e => !i || e.toLowerCase().includes(i));
  e.innerHTML = a.map(e => {
    const t = localStorage.getItem(e) || "",
      n = (t.length / 1024).toFixed(2);
    let o = t.length > 60 ? t.slice(0, 60) + "…" : t;
    try {
      o = JSON.stringify(JSON.parse(t)).slice(0, 60) + "…"
    } catch (e) {}
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;background:rgba(255,255,255,0.02);">\n        <div style="flex:1;min-width:0;">\n          <div style="font-size:0.65rem;font-weight:700;color:rgba(255,255,255,0.6);font-family:monospace;">${e}</div>\n          <div style="font-size:0.58rem;color:rgba(255,255,255,0.2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${o}</div>\n        </div>\n        <div style="font-size:0.6rem;color:rgba(255,255,255,0.2);white-space:nowrap;">${n} KB</div>\n        <button onclick="adminViewKey('${e.replace(/'/g,"\\'")}')" style="padding:3px 8px;border-radius:5px;background:rgba(100,180,255,0.08);border:1px solid rgba(100,180,255,0.18);color:rgba(120,190,255,0.7);font-size:0.55rem;cursor:pointer;">👁</button>\n        <button onclick="adminClearKey('${e.replace(/'/g,"\\'")}')" style="padding:3px 8px;border-radius:5px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.18);color:rgba(255,100,100,0.65);font-size:0.55rem;cursor:pointer;">×</button>\n      </div>`
  }).join("")
}

function adminViewKey(e) {
  const t = localStorage.getItem(e) || "(prázdné)";
  let n = t;
  try {
    n = JSON.stringify(JSON.parse(t), null, 2)
  } catch (e) {}
  const o = document.createElement("div");
  o.style.cssText = "position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;", o.innerHTML = `<div style="background:rgba(8,8,12,0.99);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:24px;width:min(600px,95vw);max-height:80vh;display:flex;flex-direction:column;">\n      <div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-weight:800;margin-bottom:12px;">🔑 ${e}</div>\n      <pre style="flex:1;overflow:auto;font-size:0.65rem;color:rgba(255,255,255,0.7);background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;white-space:pre-wrap;word-break:break-all;">${n}</pre>\n      <div style="display:flex;gap:8px;margin-top:14px;">\n        <button onclick="navigator.clipboard.writeText(${JSON.stringify(t)});showToast&&showToast('✓ Zkopírováno!')" style="padding:9px 18px;border-radius:10px;background:rgba(0,122,255,0.08);border:1px solid rgba(0,122,255,0.2);color:var(--accent);font-size:0.7rem;font-weight:700;cursor:pointer;">📋 Kopírovat</button>\n        <button onclick="this.closest('div[style]').remove()" style="margin-left:auto;padding:9px 18px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:0.7rem;cursor:pointer;">Zavřít</button>\n      </div>\n    </div>`, o.addEventListener("click", e => {
    e.target === o && o.remove()
  }), document.body.appendChild(o)
}

function adminClearKey(e) {
  confirm("Smazat klíč: " + e + "?") && (localStorage.removeItem(e), adminLoadStorage(), adminLoadStats(), "function" == typeof showToast && showToast("✓ Klíč smazán: " + e))
}

function adminClearAll() {
  confirm("⚠️ Smazat VŠECHNA data?\nToto je nevratné — zmizí profily, watchlisty, nastavení, vše.") && confirm("Opravdu si jistý? Klikni OK pro definitivní reset.") && (localStorage.clear(), adminRefresh(), "function" == typeof showToast && showToast("💣 Vše smazáno — aplikace resetována"))
}

function adminExport() {
  const e = {};
  Object.keys(localStorage).forEach(t => {
    e[t] = localStorage.getItem(t)
  });
  const t = new Blob([JSON.stringify(e, null, 2)], {
      type: "application/json"
    }),
    n = URL.createObjectURL(t),
    o = document.createElement("a");
  o.href = n, o.download = "mujflix-backup-" + (new Date).toISOString().slice(0, 10) + ".json", o.click(), URL.revokeObjectURL(n), "function" == typeof showToast && showToast("📤 Export stažen")
}

function adminImport() {
  const e = document.createElement("input");
  e.type = "file", e.accept = ".json", e.onchange = e => {
    const t = e.target.files[0];
    if (!t) return;
    const n = new FileReader;
    n.onload = e => {
      try {
        const t = JSON.parse(e.target.result);
        if (!confirm("Importovat " + Object.keys(t).length + " klíčů? Stávající data budou přepsána.")) return;
        Object.entries(t).forEach(([e, t]) => localStorage.setItem(e, t)), adminRefresh(), "function" == typeof showToast && showToast("📥 Import dokončen!")
      } catch (e) {
        alert("Chyba při importu: " + e.message)
      }
    }, n.readAsText(t)
  }, e.click()
}

function adminSetAccent(e) {
  document.documentElement.style.setProperty("--accent", e), localStorage.setItem("mf_admin_accent", e), "function" == typeof showToast && showToast("🎨 Accent: " + e)
}

function adminTestToast() {
  "function" == typeof showToast ? showToast("🍞 Testovací toast od admina!") : alert("showToast není dostupný")
}

function adminTestConfetti() {
  "function" == typeof confetti ? confetti({
    particleCount: 200,
    spread: 90,
    origin: {
      y: .5
    }
  }) : "function" == typeof showToast && showToast("❌ confetti není dostupné")
}

function adminForceWrapped() {
  adminLogout(), setTimeout(() => {
    "function" == typeof openWrapped && openWrapped()
  }, 300)
}

function adminToggleDebugLegacy() {
  const e = "1" === localStorage.getItem("mf_admin_debug");
  localStorage.setItem("mf_admin_debug", e ? "0" : "1");
  const t = document.getElementById("adminDebugToggleLegacy");
  t && (t.textContent = e ? "OFF" : "ON", t.style.color = e ? "rgba(255,255,255,0.5)" : "var(--accent)"), "function" == typeof showToast && showToast("Debug: " + (e ? "vypnut" : "zapnut"))
}

function adminToggleFps() {
  _adminFpsActive = !_adminFpsActive;
  const e = document.getElementById("adminFpsToggle"),
    t = document.getElementById("adminFpsCounter");
  if (e && (e.textContent = _adminFpsActive ? "ON" : "OFF", e.style.color = _adminFpsActive ? "var(--accent)" : "rgba(255,255,255,0.5)"), _adminFpsActive) {
    t && (t.style.display = "block"), _adminFpsLast = performance.now(), _adminFpsFrames = 0, _adminFpsRaf = requestAnimationFrame(function e(n) {
      if (_adminFpsFrames++, n - _adminFpsLast >= 500) {
        const e = Math.round(1e3 * _adminFpsFrames / (n - _adminFpsLast));
        t && (t.textContent = "FPS: " + e, t.style.color = e >= 55 ? "#0f0" : e >= 30 ? "#ff0" : "#f00"), _adminFpsLast = n, _adminFpsFrames = 0
      }
      _adminFpsActive && (_adminFpsRaf = requestAnimationFrame(e))
    })
  } else adminStopFps()
}

function adminStopFps() {
  _adminFpsActive = !1, _adminFpsRaf && (cancelAnimationFrame(_adminFpsRaf), _adminFpsRaf = null);
  const e = document.getElementById("adminFpsCounter");
  e && (e.style.display = "none")
}

function adminBcastType(e) {
  _adminBcastType = e, document.getElementById("admBcastToast").style.background = "toast" === e ? "rgba(0,122,255,0.1)" : "rgba(255,255,255,0.04)", document.getElementById("admBcastToast").style.borderColor = "toast" === e ? "rgba(0,122,255,0.3)" : "rgba(255,255,255,0.08)", document.getElementById("admBcastToast").style.color = "toast" === e ? "var(--accent)" : "rgba(255,255,255,0.45)", document.getElementById("admBcastBanner").style.background = "banner" === e ? "rgba(0,122,255,0.1)" : "rgba(255,255,255,0.04)", document.getElementById("admBcastBanner").style.borderColor = "banner" === e ? "rgba(0,122,255,0.3)" : "rgba(255,255,255,0.08)", document.getElementById("admBcastBanner").style.color = "banner" === e ? "var(--accent)" : "rgba(255,255,255,0.45)"
}

function adminSendBroadcast() {
  const e = document.getElementById("adminBroadcastMsg")?.value?.trim();
  if (!e) return void("function" == typeof showToast && showToast("⚠ Napiš zprávu!"));
  if ("toast" === _adminBcastType) "function" == typeof showToast && showToast(e);
  else {
    let t = document.getElementById("adminBanner");
    t || (t = document.createElement("div"), t.id = "adminBanner", t.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:999997;background:var(--accent);color:#000;font-family:-apple-system, SF Pro Display, Helvetica Neue,sans-serif;font-weight:800;font-size:0.78rem;padding:10px 20px;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px;", t.innerHTML = '<span id="adminBannerText"></span><button onclick="document.getElementById(\'adminBanner\').remove()" style="background:rgba(0,0,0,0.15);border:none;border-radius:6px;padding:3px 10px;cursor:pointer;font-weight:900;font-size:0.7rem;">✕</button>', document.body.appendChild(t)), document.getElementById("adminBannerText").textContent = e
  }
  const t = safeLS("mf_admin_broadcasts", "[]");
  t.unshift({
    msg: e,
    type: _adminBcastType,
    ts: Date.now()
  }), localStorage.setItem("mf_admin_broadcasts", JSON.stringify(t.slice(0, 20))), adminLoadBroadcastHistory(), document.getElementById("adminBroadcastMsg").value = "", "function" == typeof showToast && showToast("📢 Zpráva odeslána!")
}

function adminScheduleBroadcast() {
  const e = document.getElementById("adminBroadcastMsg")?.value?.trim();
  if (!e) return void("function" == typeof showToast && showToast("⚠ Napiš zprávu!"));
  const t = prompt("Za kolik sekund odeslat?", "30");
  if (!t) return;
  const n = 1e3 * parseInt(t);
  "function" == typeof showToast && showToast("⏰ Naplánováno za " + t + "s"), setTimeout(() => adminSendBroadcast(), n)
}

function adminLoadBroadcastHistory() {
  const e = document.getElementById("adminBroadcastHistory");
  if (!e) return;
  const t = safeLS("mf_admin_broadcasts", "[]");
  t.length ? e.innerHTML = '<div style="font-size:0.62rem;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Historie zpráv</div>' + t.slice(0, 5).map(e => `<div style="padding:7px 10px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);margin-bottom:5px;font-size:0.68rem;">\n        <span style="color:rgba(255,255,255,0.5);">${e.msg}</span>\n        <span style="float:right;font-size:0.58rem;color:rgba(255,255,255,0.2);">${new Date(e.ts).toLocaleTimeString("cs-CZ")}</span>\n      </div>`).join("") : e.innerHTML = ""
}! function() {
  const e = localStorage.getItem("mf_admin_accent");
  e && document.documentElement.style.setProperty("--accent", e)
}();
let _premiereMonth = new Date,
  _premiereFilter = "tracked",
  _premiereCache = {};
const CZECH_MONTHS = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
  CZECH_DAYS_SHORT = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

function openPremiereCalendar() {
  const e = document.getElementById("premiereOverlay");
  e && (e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), _premiereMonth = new Date, renderPremiereCalendar())
}

function closePremiereCalendar() {
  const e = document.getElementById("premiereOverlay");
  e && (e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 320))
}

function premiereChangeMonth(e) {
  _premiereMonth = new Date(_premiereMonth.getFullYear(), _premiereMonth.getMonth() + e, 1), renderPremiereCalendar()
}

function setPremiereFilter(e, t) {
  _premiereFilter = t, document.querySelectorAll(".premiere-filter-chip").forEach(e => e.classList.remove("active")), e.classList.add("active"), renderPremiereCalendar()
}
async function renderPremiereCalendar() {
  const e = document.getElementById("premiereCalendarBody"),
    t = document.getElementById("premiereMonthLabel");
  if (!e || !t) return;
  const n = _premiereMonth;
  t.textContent = `${CZECH_MONTHS[n.getMonth()]} ${n.getFullYear()}`, e.innerHTML = '<div class="premiere-loading"><div class="premiere-loading-spinner"></div><div class="premiere-loading-text">Načítám premiéry…</div></div>';
  try {
    renderPremiereGrid(await fetchPremiereEpisodes())
  } catch (t) {
    e.innerHTML = '<div class="premiere-empty"><div class="premiere-empty-icon">⚠️</div><p>Nepodařilo se načíst premiéry.<br>Zkontroluj TMDB API klíč.</p></div>'
  }
}
async function fetchPremiereEpisodes() {
  if (!(void 0 !== window.TMDB_KEY ? window.TMDB_KEY : localStorage.getItem("mf_tmdb_key") || "")) throw new Error("No TMDB key");
  const e = _premiereMonth,
    t = `${e.getFullYear()}-${e.getMonth()}-${_premiereFilter}`;
  if (_premiereCache[t]) return _premiereCache[t];
  let n = [];
  if ("tracked" === _premiereFilter) {
    const e = (void 0 !== db ? Object.keys(db) : []).filter(e => "__foryou__" !== e && "__search__" !== e && db[e]?.tmdbId);
    n = await Promise.all(e.map(async e => {
      try {
        return await tmdbGet(`/tv/${db[e].tmdbId}?language=cs`)
      } catch {
        return null
      }
    })), n = n.filter(Boolean)
  } else {
    const [e, t] = await Promise.all([tmdbGet("/tv/on_the_air?language=cs&page=1"), tmdbGet("/tv/on_the_air?language=cs&page=2")]);
    n = [...e?.results || [], ...t?.results || []]
  }
  const o = e.getFullYear(),
    i = e.getMonth(),
    a = new Date(o, i + 1, 0).getDate(),
    s = `${o}-${String(i+1).padStart(2,"0")}-01`,
    r = `${o}-${String(i+1).padStart(2,"0")}-${String(a).padStart(2,"0")}`,
    l = [];
  return await Promise.all(n.slice(0, 30).map(async e => {
    try {
      const t = e.next_episode_to_air,
        n = e.last_episode_to_air;
      [t, n].filter(e => !!e?.air_date && (e.air_date >= s && e.air_date <= r)).forEach(t => {
        l.push({
          show_name: e.name,
          show_id: e.id,
          poster_path: e.poster_path,
          backdrop_path: e.backdrop_path,
          networks: (e.networks || []).map(e => e.name).join(", "),
          episode_number: t.episode_number,
          season_number: t.season_number,
          air_date: t.air_date,
          isTracked: "tracked" === _premiereFilter
        })
      })
    } catch {}
  })), l.sort((e, t) => e.air_date.localeCompare(t.air_date)), _premiereCache[t] = l, l
}

function renderPremiereGrid(e) {
  const t = document.getElementById("premiereCalendarBody");
  if (!t) return;
  const n = (new Date).toISOString().slice(0, 10);
  if (!e.length) return void(t.innerHTML = '<div class="premiere-empty"><div class="premiere-empty-icon">📭</div><p>Žádné premiéry tento měsíc.<br>Zkus filtr "Populární".</p></div>');
  const o = {};
  e.forEach(e => {
    const t = new Date(e.air_date + "T12:00:00"),
      n = e.air_date,
      i = Math.ceil((t.getDate() + new Date(t.getFullYear(), t.getMonth(), 1).getDay()) / 7);
    o[i] || (o[i] = {}), o[i][n] || (o[i][n] = []), o[i][n].push(e)
  });
  const i = e.filter(e => {
      const t = new Date(e.air_date + "T12:00:00"),
        n = new Date,
        o = new Date(n);
      o.setDate(n.getDate() - n.getDay());
      const i = new Date(o);
      return i.setDate(o.getDate() + 6), t >= o && t <= i
    }),
    a = document.getElementById("premiereFabBadge");
  a && (a.textContent = i.length, a.classList.toggle("has-items", i.length > 0));
  let s = "";
  Object.entries(o).sort(([e], [t]) => +e - +t).forEach(([e, t]) => {
    s += `<div class="premiere-week-label">Týden ${e}</div>`, Object.entries(t).sort(([e], [t]) => e.localeCompare(t)).forEach(([e, t]) => {
      const o = new Date(e + "T12:00:00"),
        i = e === n;
      s += `<div class="premiere-day-group"><div class="premiere-day-header">\n          <div class="premiere-day-date${i?" today":""}">\n            <div class="premiere-day-num">${o.getDate()}</div>\n            <div class="premiere-day-name">${CZECH_DAYS_SHORT[o.getDay()]}</div>\n          </div>\n          <div class="premiere-ep-list">`, t.forEach(e => {
        const t = e.poster_path ? `https://image.tmdb.org/t/p/w92${e.poster_path}` : "";
        s += `<div class="premiere-ep-item${e.isTracked?" is-tracked":""}" onclick="premiereOpenShow(${e.show_id})">\n            <div class="premiere-ep-poster">${t?`<img src="${t}" alt="" loading="lazy">`:""}</div>\n            <div class="premiere-ep-info">\n              <div class="premiere-ep-show">${e.show_name}</div>\n              <div class="premiere-ep-detail">S${String(e.season_number).padStart(2,"0")} · E${String(e.episode_number).padStart(2,"0")}</div>\n              <div class="premiere-ep-badge-row">\n                ${e.isTracked?'<span class="premiere-ep-badge tracked">⭐ Sleduji</span>':'<span class="premiere-ep-badge new">NOVÉ</span>'}\n                ${e.networks?`<span class="premiere-ep-badge network">${e.networks.slice(0,18)}</span>`:""}\n              </div>\n            </div>\n            <div class="premiere-ep-time">${i?"🔴 Dnes":""}</div>\n          </div>`
      }), s += "</div></div></div>"
    })
  }), t.innerHTML = s
}

function premiereOpenShow(e) {
  const t = void 0 !== db ? Object.keys(db).find(t => db[t]?.tmdbId == e) : null;
  closePremiereCalendar(), t ? setTimeout(() => openSeries(t), 350) : setTimeout(() => showToast("🔍 Seriál není v tvém seznamu"), 350)
}
const COLLECTIONS_DATA = [{
  id: 1,
  name: "Marvel Cinematic Universe",
  universe: "MCU",
  icon: "🦸",
  color: "#e23030",
  tmdbCollections: [131292, 86311, 263, 422837, 284433, 131296, 422834, 422843, 422834],
  films: [{
    title: "Iron Man",
    year: 2008,
    tmdbId: 1726,
    order: 1
  }, {
    title: "Iron Man 2",
    year: 2010,
    tmdbId: 10138,
    order: 2
  }, {
    title: "Thor",
    year: 2011,
    tmdbId: 10195,
    order: 3
  }, {
    title: "Captain America: První Avenger",
    year: 2011,
    tmdbId: 1771,
    order: 4
  }, {
    title: "Avengers",
    year: 2012,
    tmdbId: 24428,
    order: 5
  }, {
    title: "Iron Man 3",
    year: 2013,
    tmdbId: 68721,
    order: 6
  }, {
    title: "Thor: Temný svět",
    year: 2013,
    tmdbId: 76338,
    order: 7
  }, {
    title: "Captain America: Návrat prvního Avengera",
    year: 2014,
    tmdbId: 100402,
    order: 8
  }, {
    title: "Strážci Galaxie",
    year: 2014,
    tmdbId: 118340,
    order: 9
  }, {
    title: "Avengers: Age of Ultron",
    year: 2015,
    tmdbId: 99861,
    order: 10
  }, {
    title: "Ant-Man",
    year: 2015,
    tmdbId: 102899,
    order: 11
  }, {
    title: "Captain America: Občanská válka",
    year: 2016,
    tmdbId: 271110,
    order: 12
  }, {
    title: "Doctor Strange",
    year: 2016,
    tmdbId: 284052,
    order: 13
  }, {
    title: "Strážci Galaxie vol. 2",
    year: 2017,
    tmdbId: 283995,
    order: 14
  }, {
    title: "Spider-Man: Homecoming",
    year: 2017,
    tmdbId: 315635,
    order: 15
  }, {
    title: "Thor: Ragnarok",
    year: 2017,
    tmdbId: 284053,
    order: 16
  }, {
    title: "Black Panther",
    year: 2018,
    tmdbId: 284054,
    order: 17
  }, {
    title: "Avengers: Infinity War",
    year: 2018,
    tmdbId: 299536,
    order: 18
  }, {
    title: "Ant-Man a Vosa",
    year: 2018,
    tmdbId: 363088,
    order: 19
  }, {
    title: "Captain Marvel",
    year: 2019,
    tmdbId: 299537,
    order: 20
  }, {
    title: "Avengers: Endgame",
    year: 2019,
    tmdbId: 299534,
    order: 21
  }, {
    title: "Spider-Man: Daleko od domova",
    year: 2019,
    tmdbId: 429617,
    order: 22
  }]
}, {
  id: 2,
  name: "Harry Potter",
  universe: "Wizarding World",
  icon: "⚡",
  color: "#7c4dff",
  films: [{
    title: "Harry Potter a Kámen mudrců",
    year: 2001,
    tmdbId: 671,
    order: 1
  }, {
    title: "Harry Potter a Tajemná komnata",
    year: 2002,
    tmdbId: 672,
    order: 2
  }, {
    title: "Harry Potter a vězeň z Azkabanu",
    year: 2004,
    tmdbId: 673,
    order: 3
  }, {
    title: "Harry Potter a Ohnivý pohár",
    year: 2005,
    tmdbId: 674,
    order: 4
  }, {
    title: "Harry Potter a Fénixův řád",
    year: 2007,
    tmdbId: 675,
    order: 5
  }, {
    title: "Harry Potter a Princ dvojí krve",
    year: 2009,
    tmdbId: 767,
    order: 6
  }, {
    title: "Harry Potter a Relikvie smrti – část 1",
    year: 2010,
    tmdbId: 12444,
    order: 7
  }, {
    title: "Harry Potter a Relikvie smrti – část 2",
    year: 2011,
    tmdbId: 12445,
    order: 8
  }, {
    title: "Fantastická zvířata a kde je najít",
    year: 2016,
    tmdbId: 259316,
    order: 9
  }, {
    title: "Fantastická zvířata: Grindelwaldovy zločiny",
    year: 2018,
    tmdbId: 338952,
    order: 10
  }, {
    title: "Fantastická zvířata: Tajemství Dumbledora",
    year: 2022,
    tmdbId: 338953,
    order: 11
  }]
}, {
  id: 3,
  name: "Star Wars",
  universe: "Galaxy Far Far Away",
  icon: "⚔️",
  color: "#ffe340",
  films: [{
    title: "Epizoda I – Skrytá hrozba",
    year: 1999,
    tmdbId: 1893,
    order: 1
  }, {
    title: "Epizoda II – Klony útočí",
    year: 2002,
    tmdbId: 1894,
    order: 2
  }, {
    title: "Epizoda III – Pomsta Sithů",
    year: 2005,
    tmdbId: 1895,
    order: 3
  }, {
    title: "Solo: Star Wars Story",
    year: 2018,
    tmdbId: 348350,
    order: 4
  }, {
    title: "Rogue One",
    year: 2016,
    tmdbId: 330459,
    order: 5
  }, {
    title: "Epizoda IV – Nová naděje",
    year: 1977,
    tmdbId: 11,
    order: 6
  }, {
    title: "Epizoda V – Impérium vrací úder",
    year: 1980,
    tmdbId: 1891,
    order: 7
  }, {
    title: "Epizoda VI – Návrat Jediho",
    year: 1983,
    tmdbId: 1892,
    order: 8
  }, {
    title: "Epizoda VII – Síla se probouzí",
    year: 2015,
    tmdbId: 140607,
    order: 9
  }, {
    title: "Rogue One",
    year: 2016,
    tmdbId: 330459,
    order: 10
  }, {
    title: "Epizoda VIII – Poslední z Jediů",
    year: 2017,
    tmdbId: 181808,
    order: 11
  }, {
    title: "Epizoda IX – Vzestup Skywalkera",
    year: 2019,
    tmdbId: 181812,
    order: 12
  }]
}, {
  id: 4,
  name: "DC Extended Universe",
  universe: "DCU",
  icon: "🦇",
  color: "#2d5fcc",
  films: [{
    title: "Man of Steel",
    year: 2013,
    tmdbId: 49521,
    order: 1
  }, {
    title: "Batman v Superman",
    year: 2016,
    tmdbId: 209112,
    order: 2
  }, {
    title: "Suicide Squad",
    year: 2016,
    tmdbId: 297761,
    order: 3
  }, {
    title: "Wonder Woman",
    year: 2017,
    tmdbId: 297762,
    order: 4
  }, {
    title: "Justice League",
    year: 2017,
    tmdbId: 141052,
    order: 5
  }, {
    title: "Aquaman",
    year: 2018,
    tmdbId: 297802,
    order: 6
  }, {
    title: "Shazam!",
    year: 2019,
    tmdbId: 287947,
    order: 7
  }, {
    title: "Birds of Prey",
    year: 2020,
    tmdbId: 495764,
    order: 8
  }, {
    title: "Wonder Woman 1984",
    year: 2020,
    tmdbId: 464052,
    order: 9
  }, {
    title: "The Suicide Squad",
    year: 2021,
    tmdbId: 437209,
    order: 10
  }, {
    title: "Black Adam",
    year: 2022,
    tmdbId: 640146,
    order: 11
  }, {
    title: "Shazam! Fury of the Gods",
    year: 2023,
    tmdbId: 605116,
    order: 12
  }]
}, {
  id: 5,
  name: "James Bond 007",
  universe: "Špionážní ságy",
  icon: "🔫",
  color: "#c0a030",
  films: [{
    title: "GoldenEye",
    year: 1995,
    tmdbId: 710,
    order: 1
  }, {
    title: "Casino Royale",
    year: 2006,
    tmdbId: 36557,
    order: 2
  }, {
    title: "Quantum of Solace",
    year: 2008,
    tmdbId: 10764,
    order: 3
  }, {
    title: "Skyfall",
    year: 2012,
    tmdbId: 37724,
    order: 4
  }, {
    title: "Spectre",
    year: 2015,
    tmdbId: 206647,
    order: 5
  }, {
    title: "No Time to Die",
    year: 2021,
    tmdbId: 370172,
    order: 6
  }]
}, {
  id: 6,
  name: "John Wick",
  universe: "Kontinentální universe",
  icon: "🐶",
  color: "#007AFF",
  films: [{
    title: "John Wick",
    year: 2014,
    tmdbId: 245891,
    order: 1
  }, {
    title: "John Wick: Chapter 2",
    year: 2017,
    tmdbId: 370172,
    order: 2
  }, {
    title: "John Wick: Chapter 3 – Parabellum",
    year: 2019,
    tmdbId: 458156,
    order: 3
  }, {
    title: "John Wick: Chapter 4",
    year: 2023,
    tmdbId: 603692,
    order: 4
  }]
}];
let _collectionsActive = null;

function openCollections() {
  const e = document.getElementById("collectionsOverlay");
  e && (e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), collectionsShowGrid())
}

function closeCollections() {
  const e = document.getElementById("collectionsOverlay");
  e && (e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 320))
}

function collectionsShowGrid() {
  const e = document.getElementById("collectionsGridView"),
    t = document.getElementById("collectionsDetailView"),
    n = document.getElementById("collectionsBreadcrumb");
  e && (e.style.display = "block"), t && t.classList.remove("active"), n && (n.innerHTML = '<span class="collections-breadcrumb-home">Kolekce</span>'), _collectionsActive = null, renderCollectionsGrid()
}

function renderCollectionsGrid() {
  const e = document.getElementById("collectionsGrid");
  e && (e.innerHTML = COLLECTIONS_DATA.map(e => {
    const t = e.films.slice(0, 3).map(e => '<div style="background:rgba(255,255,255,0.04);width:100%;height:100%;"></div>').join("");
    return `<div class="collection-card" onclick="collectionsOpenDetail(${e.id})">\n        <div class="collection-card-banner" id="col-banner-${e.id}">${t}</div>\n        <div class="collection-card-overlay"></div>\n        <div class="collection-card-icon">${e.icon}</div>\n        <div class="collection-card-info">\n          <div class="collection-card-universe">${e.universe}</div>\n          <div class="collection-card-name">${e.name}</div>\n          <div class="collection-card-count">${e.films.length} filmů</div>\n        </div>\n      </div>`
  }).join(""), COLLECTIONS_DATA.forEach(e => loadCollectionPosters(e)))
}
async function loadCollectionPosters(e) {
  const t = localStorage.getItem("mf_tmdb_key") || "";
  if (!t) return;
  const n = document.getElementById(`col-banner-${e.id}`);
  if (!n) return;
  const o = e.films.slice(0, 3),
    i = await Promise.all(o.map(async e => {
      try {
        const n = await fetch(`https://api.themoviedb.org/3/movie/${e.tmdbId}?api_key=${t}&language=cs`).then(e => e.json());
        return n.poster_path ? `https://image.tmdb.org/t/p/w185${n.poster_path}` : null
      } catch {
        return null
      }
    }));
  n && (n.innerHTML = i.map((e, t) => e ? `<img class="collection-card-banner-img" src="${e}" alt="" loading="lazy" style="${0===t?"grid-column:1/-1;height:60%;object-fit:cover;":""}">` : '<div style="background:rgba(255,255,255,0.04);width:100%;height:100%;"></div>').join(""))
}
async function collectionsOpenDetail(e) {
  const t = COLLECTIONS_DATA.find(t => t.id === e);
  if (!t) return;
  _collectionsActive = t;
  const n = document.getElementById("collectionsGridView"),
    o = document.getElementById("collectionsDetailView"),
    i = document.getElementById("collectionsBreadcrumb"),
    a = document.getElementById("collectionsDetailTitle"),
    s = document.getElementById("collectionsDetailSubtitle"),
    r = document.getElementById("collectionsDetailIcon"),
    l = document.getElementById("collectionsDetailBg"),
    c = document.getElementById("collectionsDetailFilms");
  n && (n.style.display = "none"), o && o.classList.add("active"), i && (i.innerHTML = `\n      <span class="collections-breadcrumb-home" onclick="collectionsShowGrid()">Kolekce</span>\n      <span class="collections-breadcrumb-sep">›</span>\n      <span class="collections-breadcrumb-current">${t.name}</span>\n    `), a && (a.textContent = t.name), s && (s.textContent = `${t.films.length} filmů · ${t.universe}`), r && (r.textContent = t.icon), c && (c.innerHTML = '<div class="collections-loading"><div class="collections-loading-spinner"></div></div>');
  const d = localStorage.getItem("mf_tmdb_key") || "",
    m = await Promise.all(t.films.map(async e => {
      try {
        if (!d) return {
          ...e,
          poster: null,
          rating: null
        };
        const t = await fetch(`https://api.themoviedb.org/3/movie/${e.tmdbId}?api_key=${d}&language=cs`).then(e => e.json());
        return {
          ...e,
          poster: t.poster_path ? `https://image.tmdb.org/t/p/w185${t.poster_path}` : null,
          backdrop: t.backdrop_path,
          rating: t.vote_average?.toFixed(1)
        }
      } catch {
        return {
          ...e,
          poster: null,
          rating: null
        }
      }
    }));
  l && m[0]?.backdrop && (l.style.backgroundImage = `url(https://image.tmdb.org/t/p/w780${m[0].backdrop})`), c && (c.innerHTML = m.map((e, t) => `\n        <div class="collections-film-row" onclick="collectionsPlayFilm('${e.title.replace(/'/g,"\\'")}','movie')">\n          <div class="collections-film-num">${e.order}</div>\n          <div class="collections-film-poster">${e.poster?`<img src="${e.poster}" alt="" loading="lazy">`:""}</div>\n          <div class="collections-film-info">\n            <div class="collections-film-title">${e.title}</div>\n            <div class="collections-film-meta">${e.year}</div>\n          </div>\n          ${e.rating?`<div class="collections-film-rating">★ ${e.rating}</div>`:""}\n          <button class="collections-film-play" title="  Otevřít na externím webu" onclick="event.stopPropagation();collectionsPlayFilm('${e.title.replace(/'/g,"\\'")}','movie')">▶</button>\n        </div>\n      `).join(""))
}

function collectionsPlayFilm(e, t) {
  closeCollections(), setTimeout(() => {
    "function" == typeof openWithCopy ? openWithCopy(e, t) : showToast(`▶ ${e}`)
  }, 400)
}
let _voiceRecognition = null,
  _voiceListening = !1;

function openVoiceCmd() {
  const e = document.getElementById("voiceCmdOverlay");
  e && (e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), startVoiceRecognition())
}

function closeVoiceCmd() {
  stopVoiceRecognition();
  const e = document.getElementById("voiceCmdOverlay");
  e && (e.classList.remove("visible", "listening"), setTimeout(() => e.classList.remove("open"), 300))
}

function startVoiceRecognition() {
  const e = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  if (!e) return document.getElementById("voiceCmdStatus").textContent = isFirefox ? "Firefox nepodporuje hlasové ovládání" : "Prohlížeč nepodporuje hlasové ovládání", void(document.getElementById("voiceCmdTranscript").textContent = "Zkus Chrome nebo Edge.");
  if (_voiceRecognition) try {
    _voiceRecognition.abort()
  } catch {}
  _voiceRecognition = new e, _voiceRecognition.lang = "cs-CZ", _voiceRecognition.continuous = !1, _voiceRecognition.interimResults = !0, _voiceListening = !0;
  const t = document.getElementById("voiceCmdOverlay"),
    n = document.getElementById("voiceCmdOrbCenter"),
    o = document.getElementById("voiceCmdStatus"),
    i = document.getElementById("voiceCmdTranscript");
  t && t.classList.add("listening"), n && n.classList.add("listening"), o && (o.textContent = "Poslouchám…"), i && (i.textContent = ""), _voiceRecognition.onresult = e => {
    const t = Array.from(e.results).map(e => e[0].transcript).join("");
    i && (i.textContent = `"${t}"`), e.results[e.results.length - 1].isFinal && processVoiceCommand(t.toLowerCase().trim())
  }, _voiceRecognition.onerror = e => {
    o && (o.textContent = "Chyba: " + ("no-speech" === e.error ? "Nic jsem neslyšel" : e.error)), t && t.classList.remove("listening"), n && n.classList.remove("listening")
  }, _voiceRecognition.onend = () => {
    _voiceListening = !1, t && t.classList.remove("listening"), n && n.classList.remove("listening"), o && "Poslouchám…" === o.textContent && (o.textContent = "Hotovo")
  }, _voiceRecognition.start()
}

function stopVoiceRecognition() {
  if (_voiceListening = !1, _voiceRecognition) {
    try {
      _voiceRecognition.abort()
    } catch {}
    _voiceRecognition = null
  }
}

function processVoiceCommand(e) {
  const t = document.getElementById("voiceCmdStatus"),
    n = document.getElementById("voiceCmdResult"),
    o = document.getElementById("voiceCmdResultText");
  t && (t.textContent = "Zpracovávám…");
  let i = null,
    a = "";
  const s = e.match(/(?:pusť|přehraj|spusť|dej mi)\s+(?:další díl\s+)?(.+)/i),
    r = e.match(/(?:najdi|hledej|ukaž)\s+(?:mi\s+)?(?:nějaký\s+|nějaké\s+|film\s+)?(.+)/i),
    l = e.match(/náhodný|nevím co koukat|něco náhodného/i),
    c = e.match(/premiéry|co vychází|what.s on/i);
  e.match(/(?:pusť|otevři|dej)\s+(?:seriál\s+)?(.+)/i);
  if (l) i = () => {
    closeVoiceCmd(), setTimeout(() => openSearch?.(), 400)
  }, a = "🔍 Otevírám vyhledávání…";
  else if (c) i = () => {
    closeVoiceCmd(), setTimeout(() => openPremiereCalendar(), 400)
  }, a = "📅 Otevírám premiéry…";
  else if (r) {
    const e = r[1].trim();
    i = () => {
      closeVoiceCmd(), setTimeout(() => {
        "function" == typeof openSearch && openSearch();
        const t = document.getElementById("searchTitleInput");
        t && (t.value = e, t.dispatchEvent(new Event("input")))
      }, 400)
    }, a = `🔍 Hledám: "${e}"`
  } else if (s) {
    const e = s[1].trim(),
      t = void 0 !== db ? Object.keys(db).find(t => db[t]?.name?.toLowerCase().includes(e.split(" ")[0].toLowerCase())) : null;
    t ? (i = () => {
      closeVoiceCmd(), setTimeout(() => openSeries(t), 400)
    }, a = `▶ Otvírám: ${db[t].name}`) : (i = () => {
      closeVoiceCmd(), setTimeout(() => openWithCopy && openWithCopy(e, "tv"), 400)
    }, a = `▶ Přehrávám: "${e}"`)
  } else i = () => {
    closeVoiceCmd(), setTimeout(() => {
      "function" == typeof toggleAiPanel && (aiPanelOpen || toggleAiPanel()), setTimeout(() => {
        const t = document.getElementById("aiInput");
        t && (t.value = e), "function" == typeof sendAiMessage && sendAiMessage(e)
      }, 500)
    }, 400)
  }, a = `🤖 Ptám se AI: "${e}"`;
  n && n.classList.add("visible"), o && (o.textContent = a), t && (t.textContent = "Příkaz rozpoznán ✓"), setTimeout(() => {
    i && i()
  }, 1200)
}
document.addEventListener("keydown", e => {
  "INPUT" !== e.target.tagName && "TEXTAREA" !== e.target.tagName && ("v" !== e.key && "V" !== e.key || e.ctrlKey || e.metaKey || (e.preventDefault(), openVoiceCmd()))
}), document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const e = document.getElementById("premiereFabBadge");
    e && e.classList.remove("has-items")
  }, 500), renderCollectionsGrid()
});
const ADMIN_PIN_KEY = "mf_admin_pin",
  ADMIN_SETTINGS_KEY = "mf_admin_settings";
let _adminLogs = [],
  _adminErrors = [];

function adminLog(e, t = "info") {
  const n = (new Date).toTimeString().slice(0, 8);
  _adminLogs.push(`[${n}] [${t.toUpperCase()}] ${e}`), _adminLogs.length > 200 && _adminLogs.shift()
}

function adminPinGateOpen() {
  document.getElementById("adminPinGate").classList.add("open"), setTimeout(() => document.getElementById("adminPinInput").focus(), 100)
}

function adminPinGateClose() {
  document.getElementById("adminPinGate").classList.remove("open"), document.getElementById("adminPinInput").value = "", document.getElementById("adminPinHint").textContent = "Nastav vlastní PIN v Admin → Nastavení", document.getElementById("adminPinHint").style.color = "rgba(255,255,255,0.25)"
}

function adminCheckPin() {
  const e = document.getElementById("adminPinInput").value;
  e === (localStorage.getItem(ADMIN_PIN_KEY) || "1337") ? (adminPinGateClose(), adminOpen()) : e.length >= 4 && (document.getElementById("adminPinHint").textContent = "❌ Špatný PIN", document.getElementById("adminPinHint").style.color = "#ff5050", document.getElementById("adminPinInput").value = "")
}

function adminOpen() {
  openAdmin()
}

function adminClose() {
  closeAdmin()
}

function adminTab(e, t) {
  document.querySelectorAll(".admin-nav-item").forEach(e => e.classList.remove("active")), document.querySelectorAll(".admin-panel").forEach(e => e.classList.remove("active")), e.classList.add("active"), document.getElementById("adminPanel-" + t)?.classList.add("active"), adminRefreshPanel(t)
}

function adminRefreshAll() {
  adminRefreshPanel("stats"), adminLoadSettings()
}

function adminRefreshPanel(e) {
  switch (e) {
    case "stats":
      adminRenderStats();
      break;
    case "content":
      adminRenderContent();
      break;
    case "algo":
      adminRenderAlgo();
      break;
    case "users":
      adminRenderUsers();
      break;
    case "storage":
      adminRefreshStorage();
      break;
    case "logs":
      adminRefreshLogs()
  }
}

function adminRenderStats() {
  const e = "function" == typeof getWatched ? getWatched() : {},
    t = Object.keys(e).length,
    n = void 0 !== db ? Object.keys(db).length : 0,
    o = "function" == typeof getWatchlist ? getWatchlist() : [],
    i = safeLS(uKey?.("mf_ratings", "mf_ratings") || "{}");
  let a;
  try {
    a = safeLS("function" == typeof uKey ? uKey("mf_watch_timeline") : "mf_watch_timeline", "[]")
  } catch {
    a = []
  }
  const s = ("function" == typeof _getProfiles ? _getProfiles() : []).length,
    r = [{
      value: n,
      label: "Seriálů v DB",
      sub: "sledované tituly"
    }, {
      value: t,
      label: "Zhlédnutých epizod",
      sub: "~" + (45 * t / 60).toFixed(1) + " hod odhadovaně"
    }, {
      value: o.length,
      label: "Watchlist",
      sub: "chci koukat"
    }, {
      value: Object.keys(i).length,
      label: "Hodnocení",
      sub: "loved/liked/meh"
    }, {
      value: a.length,
      label: "Watch events",
      sub: "timeline záznamy"
    }, {
      value: s,
      label: "Profilů",
      sub: "Netflix-style"
    }],
    l = document.getElementById("adminStatsGrid");
  l && (l.innerHTML = r.map(e => `\n        <div class="admin-stat-card">\n          <div class="admin-stat-value">${e.value}</div>\n          <div class="admin-stat-label">${e.label}</div>\n          <div class="admin-stat-sub">${e.sub}</div>\n        </div>`).join(""));
  const c = document.getElementById("adminSeriesTableBody");
  c && void 0 !== db && (c.innerHTML = Object.entries(db).map(([e, t]) => {
    const n = "function" == typeof calcProgress ? calcProgress(e) : {
        done: 0,
        total: t.totalEps || 0,
        pct: 0
      },
      o = i[e]?.rating || "—",
      a = "loved" === o ? "green" : "liked" === o ? "blue" : "meh" === o ? "red" : "",
      s = n.pct >= 80 ? "#2ecc71" : n.pct >= 40 ? "#f1c40f" : "#e74c3c";
    return `<tr>\n          <td><strong>${t.name}</strong></td>\n          <td>${n.done}/${n.total}</td>\n          <td><span style="color:${s};font-weight:700">${n.pct}%</span></td>\n          <td>${t._rating?"★ "+t._rating:"—"}</td>\n          <td>${a?`<span class="admin-badge ${a}">${o}</span>`:'<span style="color:rgba(255,255,255,0.25)">—</span>'}</td>\n        </tr>`
  }).join("") || '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,0.3)">Žádné seriály</td></tr>');
  const d = document.getElementById("adminGenreBars");
  if (d && void 0 !== aiBrain) {
    const e = aiBrain.memory?.genrePreferences || {},
      t = Object.entries(e).sort((e, t) => t[1] - e[1]).slice(0, 10),
      n = t[0]?.[1] || 1,
      o = {
        komedie: "😄 Komedie",
        drama: "🎭 Drama",
        akcni: "💥 Akce",
        "sci-fi": "🚀 Sci-Fi",
        horor: "👻 Horor",
        fantasy: "🧙 Fantasy",
        krimi: "🔍 Krimi",
        animovany: "🎨 Animák",
        napinavy: "🔪 Thriller",
        rodinny: "👨‍👩‍👧 Rodinné"
      },
      i = ["#ff5050", "#ff7040", "#e8c020", "#50ff80", "#50c0ff", "#9060ff", "#ff60c0", "#60ffd0", "#ffa040", "#80ff40"];
    d.innerHTML = t.length ? t.map(([e, t], a) => `\n        <div class="admin-algo-bar-row">\n          <div class="admin-algo-bar-label">${o[e]||e}</div>\n          <div class="admin-algo-bar-track"><div class="admin-algo-bar-fill" style="width:${Math.round(t/n*100)}%;background:${i[a%i.length]}"></div></div>\n          <div class="admin-algo-bar-val">${Math.round(100*t)}%</div>\n        </div>`).join("") : '<div style="font-size:0.65rem;color:rgba(255,255,255,0.3)">Žádná data — sleduj seriály pro AI učení</div>'
  }
}

function adminRenderContent(e = "") {
  const t = document.getElementById("adminSeriesGrid");
  if (!t || void 0 === db) return;
  const n = Object.entries(db).filter(([t, n]) => !e || n.name.toLowerCase().includes(e.toLowerCase()));
  t.innerHTML = n.map(([e, t]) => {
    const n = "function" == typeof calcProgress ? calcProgress(e) : {
      pct: 0
    };
    return `<div class="admin-series-card">\n        <img src="${t._poster||t.poster||""}" alt="" onerror="this.style.opacity=0">\n        <div class="admin-series-card-info">\n          <div class="admin-series-card-name" title="${e}">${t.name}</div>\n          <div class="admin-series-card-meta">tmdb:${t.tmdbId||"?"} · ${t.totalEps||0} ep · ${n.pct}%</div>\n        </div>\n        <div class="admin-series-card-actions">\n          <button class="admin-series-action-btn" onclick="adminEditSeries('${e}')" title="Editovat">✏️</button>\n          <button class="admin-series-action-btn" onclick="adminRemoveSeries('${e}')" title="Odstranit">🗑</button>\n        </div>\n      </div>`
  }).join("") || '<div style="color:rgba(255,255,255,0.3);font-size:0.72rem;padding:20px">Žádné seriály nalezeny</div>'
}

function adminFilterContent(e) {
  adminRenderContent(e)
}

function adminEditSeries(e) {
  if (void 0 === db || !db[e]) return;
  const t = db[e],
    n = prompt("Nový název:", t.name);
  n && n.trim() && (db[e].name = n.trim(), "function" == typeof saveDb ? saveDb() : "function" == typeof autoSave && autoSave(), adminLog(`Série "${e}" přejmenována na "${n.trim()}"`, "info"), adminRenderContent(), showToast?.(`✏️ Přejmenováno: ${n.trim()}`))
}

function adminRemoveSeries(e) {
  confirm(`Opravdu odstranit "${db[e]?.name||e}"?\nTato akce je nevratná!`) && (delete db[e], "function" == typeof saveDb && saveDb(), adminLog(`Série "${e}" odstraněna`, "warn"), adminRenderContent(), showToast?.(`🗑 Odstraněno: ${e}`))
}

function adminAddSeriesPrompt() {
  const e = prompt("Název seriálu:");
  if (!e?.trim()) return;
  const t = e.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    n = parseInt(prompt("TMDB ID (nebo 0):") || "0");
  void 0 !== db && (db[t] = {
    name: e.trim(),
    tmdbId: n,
    poster: "",
    totalEps: 0,
    runtime: 45
  }, void 0 !== epsBySeason && (epsBySeason[t] = [12]), "function" == typeof saveDb && saveDb(), adminLog(`Přidána série: ${e} (${t})`, "info"), adminRenderContent(), showToast?.(`✅ Přidáno: ${e.trim()}`))
}

function adminExportDB() {
  if (void 0 === db) return;
  const e = JSON.stringify({
      db: db,
      epsBySeason: void 0 !== epsBySeason ? epsBySeason : {}
    }, null, 2),
    t = new Blob([e], {
      type: "application/json"
    }),
    n = document.createElement("a");
  n.href = URL.createObjectURL(t), n.download = "mujflix_db_export_" + (new Date).toISOString().slice(0, 10) + ".json", n.click(), adminLog("DB exportována", "ok")
}

function adminImportDBPrompt() {
  const e = document.createElement("input");
  e.type = "file", e.accept = ".json", e.onchange = e => {
    const t = e.target.files[0];
    if (!t) return;
    const n = new FileReader;
    n.onload = e => {
      try {
        const t = JSON.parse(e.target.result);
        t.db && (Object.assign(db, t.db), t.epsBySeason && void 0 !== epsBySeason && Object.assign(epsBySeason, t.epsBySeason), "function" == typeof saveDb && saveDb(), adminLog("DB importována: " + Object.keys(t.db).length + " seriálů", "ok"), adminRenderContent(), showToast?.("✅ DB importována!"))
      } catch (e) {
        alert("Chyba parsování JSON: " + e.message)
      }
    }, n.readAsText(t)
  }, e.click()
}

function adminRefetchAllPosters() {
  showToast?.("🖼 Stahuju postery..."), adminLog("Bulk poster refetch zahájen", "info"), "function" == typeof enrichAllSeriesWithTmdb ? enrichAllSeriesWithTmdb() : showToast?.("ℹ️ Funkce enrichAllSeriesWithTmdb není dostupná")
}

function adminResetWatched() {
  confirm("Opravdu smazat celou sledovanost? Toto nelze vrátit!") && (localStorage.removeItem("function" == typeof uKey ? uKey("mf_watched") : "mf_watched"), "function" == typeof refreshUserContent && refreshUserContent(), adminLog("Sledovanost smazána", "warn"), showToast?.("🗑 Sledovanost smazána"), adminRenderStats())
}

function adminRenderAlgo() {
  const e = (void 0 !== aiBrain && aiBrain.memory || {}).genreIdPrefs || {},
    t = Object.entries(e).sort((e, t) => t[1] - e[1]).slice(0, 8),
    n = t[0]?.[1] || 1,
    o = ["#ff5050", "#ff7040", "#e8c020", "#50ff80", "#50c0ff", "#9060ff", "#ff60c0", "#60ffd0"],
    i = document.getElementById("adminAlgoBrainBars");
  i && (i.innerHTML = t.length ? t.map(([e, t], i) => `\n        <div class="admin-algo-bar-row">\n          <div class="admin-algo-bar-label">${TMDB_GENRE_CS?.[e]||"ID:"+e} (${e})</div>\n          <div class="admin-algo-bar-track"><div class="admin-algo-bar-fill" style="width:${Math.round(t/n*100)}%;background:${o[i%o.length]}"></div></div>\n          <div class="admin-algo-bar-val">${t.toFixed(2)}</div>\n        </div>`).join("") : '<div style="font-size:0.65rem;color:rgba(255,255,255,0.3)">Prázdný AI Brain — sleduj obsah</div>'), adminRefreshAlgo()
}

function adminRefreshAlgo() {
  const e = safeLS("function" == typeof uKey ? uKey("mf_watch_timeline") : "mf_watch_timeline", "[]"),
    t = document.getElementById("adminTimelineCode");
  if (t) {
    if (!e.length) return void(t.textContent = "Žádné záznamy v timeline");
    const n = e.slice(-20).reverse();
    t.textContent = n.map(e => {
      const t = new Date(e.ts),
        n = Math.round((Date.now() - e.ts) / 6e4);
      return `${t.toTimeString().slice(0,8)} (${n}m ago) | ${e.slug} | genres: [${(e.genres||[]).join(",")}]`
    }).join("\n")
  }
}

function adminTestScore() {
  const e = document.getElementById("adminAlgoTestTitle").value || "Test Film",
    t = document.getElementById("adminAlgoTestGenres").value || "",
    n = parseFloat(document.getElementById("adminAlgoTestRating").value) || 7.5,
    o = t.split(",").map(Number).filter(Boolean),
    i = {
      id: Math.floor(1e5 * Math.random()),
      name: e,
      genre_ids: o,
      vote_average: n,
      vote_count: 1e3,
      release_date: (new Date).getFullYear() + "-01-01",
      _rowType: "tv"
    },
    a = "function" == typeof computeAiScore ? computeAiScore(i) : null,
    s = document.getElementById("adminAlgoTestResult");
  if (s && a) {
    s.style.display = "block";
    const e = a.signals || {};
    s.innerHTML = `\n        <div class="admin-score-title">Výsledek: <strong style="font-size:1.1rem">${a.score}% Shoda</strong> ${a.whyLabel?"— "+a.whyLabel:""}</div>\n        <div class="admin-algo-bars">\n          ${Object.entries(e).map(([e,t])=>`\n            <div class="admin-algo-bar-row">\n              <div class="admin-algo-bar-label">${e})</div>\n              <div class="admin-algo-bar-track"><div class="admin-algo-bar-fill" style="width:${Math.round(100*Math.abs(t))}%;background:${t<0?"#ff4040":"#50c0ff"}"></div></div>\n              <div class="admin-algo-bar-val">${t.toFixed(2)}</div>\n            </div>`).join("")}\n        </div>`
  }
}

function adminClearTimeline() {
  if (!confirm("Smazat watch timeline?")) return;
  const e = "function" == typeof uKey ? uKey("mf_watch_timeline") : "mf_watch_timeline";
  localStorage.removeItem(e), _momentumCache = null, adminRefreshAlgo(), showToast?.("🗑 Timeline smazána"), adminLog("Watch timeline vymazána", "warn")
}

function adminResetAiBrain() {
  confirm("Opravdu resetovat celý AI Brain? Ztratíš všechna naučená doporučení!") && (void 0 !== aiBrain && (aiBrain.memory = {
    genrePreferences: {},
    genreIdPrefs: {},
    ratedGenres: {},
    watchedTmdbIds: {},
    watchedSlugs: {},
    sessionGenres: [],
    totalWatched: 0
  }, aiBrain.save?.()), _momentumCache = null, _ratingSignalCache = null, adminLog("AI Brain resetován", "warn"), showToast?.("⚠ AI Brain resetován"), adminRenderAlgo(), adminRenderStats())
}

function adminRenderUsers() {
  const e = "function" == typeof _getProfiles ? _getProfiles() : [],
    t = "function" == typeof getActiveProfileId ? getActiveProfileId() : null,
    n = document.getElementById("adminUsersTableBody");
  n && (n.innerHTML = e.map(e => {
    const n = Object.keys("function" == typeof getWatched ? getWatched() : {}).length,
      o = e.id === t;
    return `<tr>\n          <td style="font-size:1.4rem">${e.avatar||"🎬"}</td>\n          <td><strong>${e.name}</strong>${o?' <span class="admin-badge green">AKTIVNÍ</span>':""}</td>\n          <td style="font-family:monospace;font-size:0.6rem;color:rgba(255,255,255,0.35)">${e.id}</td>\n          <td>${e.pin?'<span class="admin-badge yellow">●●●●</span>':'<span style="color:rgba(255,255,255,0.25)">žádný</span>'}</td>\n          <td><div style="width:18px;height:18px;border-radius:50%;background:${e.color||"#007AFF"};border:1px solid rgba(255,255,255,0.2)"></div></td>\n          <td>${o?n:"—"}</td>\n          <td><button class="admin-series-action-btn" onclick="adminSwitchToProfile('${e.id}')">Přepnout</button></td>\n        </tr>`
  }).join("") || '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,0.3)">Žádné profily</td></tr>');
  const o = document.getElementById("adminProfileSwitchBtns");
  o && (o.innerHTML = e.map(e => `<button class="admin-btn secondary" onclick="adminSwitchToProfile('${e.id}')" style="${e.id===t?"border-color:rgba(80,220,120,0.5);color:#50dc78":""}">${e.avatar||"🎬"} ${e.name}</button>`).join(""))
}

function adminSwitchToProfile(e) {
  void 0 !== ProfileGate && ProfileGate.activateProfile(e), adminLog("Přepnuto na profil: " + e, "info"), adminRenderUsers()
}

function adminRefreshStorage(e = "") {
  const t = [];
  for (let n = 0; n < localStorage.length; n++) {
    const o = localStorage.key(n);
    e && !o.toLowerCase().includes(e.toLowerCase()) || t.push(o)
  }
  t.sort();
  let n = 0;
  t.forEach(e => {
    n += 2 * (localStorage.getItem(e) || "").length
  });
  const o = document.getElementById("adminStorageStats");
  o && (o.innerHTML = `\n        <div class="admin-stat-card"><div class="admin-stat-value">${t.length}</div><div class="admin-stat-label">Klíčů</div></div>\n        <div class="admin-stat-card"><div class="admin-stat-value">${(n/1024).toFixed(1)}</div><div class="admin-stat-label">KB použito</div><div class="admin-stat-sub">z ~5MB limitu</div></div>\n        <div class="admin-stat-card"><div class="admin-stat-value">${(n/1024/5e3*100).toFixed(1)}%</div><div class="admin-stat-label">Plnost</div></div>\n      `);
  const i = document.getElementById("adminStorageCode");
  i && (i.textContent = t.map(e => {
    let t = localStorage.getItem(e) || "";
    return t.length > 120 && (t = t.slice(0, 120) + "..."), `${e}\n  → ${t}`
  }).join("\n\n") || "Žádné klíče", i.onclick = () => {
    navigator.clipboard?.writeText(i.textContent), showToast?.("📋 Zkopírováno!")
  })
}

function adminFilterStorage(e) {
  adminRefreshStorage(e)
}

function adminExportAllStorage() {
  const e = {};
  for (let t = 0; t < localStorage.length; t++) {
    const n = localStorage.key(t);
    e[n] = localStorage.getItem(n)
  }
  const t = new Blob([JSON.stringify(e, null, 2)], {
      type: "application/json"
    }),
    n = document.createElement("a");
  n.href = URL.createObjectURL(t), n.download = "mujflix_storage_backup_" + (new Date).toISOString().slice(0, 10) + ".json", n.click(), adminLog("localStorage exportován", "ok")
}

function adminClearCache() {
  const e = [];
  for (let t = 0; t < localStorage.length; t++) {
    const n = localStorage.key(t);
    (n.includes("_cache") || n.includes("tmdb_cache")) && e.push(n)
  }
  e.forEach(e => localStorage.removeItem(e)), adminLog(`Cache vymazána (${e.length} klíčů)`, "ok"), showToast?.(`🗑 Cache vymazána (${e.length} klíčů)`), adminRefreshStorage()
}

function adminRefreshLogs() {
  const e = document.getElementById("adminLogViewer");
  e && (e.innerHTML = _adminLogs.length ? _adminLogs.slice(-50).reverse().map(e => `<div class="${e.includes("[INFO]")?"log-info":e.includes("[WARN]")?"log-warn":e.includes("[OK]")?"log-ok":""}">${e}</div>`).join("") : '<div style="color:rgba(255,255,255,0.3)">Žádné logy</div>');
  const t = document.getElementById("adminErrorLog");
  t && (t.innerHTML = _adminErrors.length ? _adminErrors.slice(-30).reverse().map(e => `<div class="log-err">${e}</div>`).join("") : '<div style="color:rgba(80,220,120,0.6)">Žádné chyby 🎉</div>')
}

function adminClearLogs() {
  _adminLogs = [], _adminErrors = [], adminRefreshLogs()
}

function adminCopyLogs() {
  const e = [..._adminLogs, ..._adminErrors].join("\n");
  navigator.clipboard?.writeText(e).then(() => showToast?.("📋 Logy zkopírovány"))
}

function adminLoadSettings() {
  try {
    const e = safeLS(ADMIN_SETTINGS_KEY, "{}"),
      t = document.getElementById("adminVisibleToggle"),
      n = document.getElementById("adminDebugToggle"),
      o = document.getElementById("adminVerboseToggle");
    t && t.classList.toggle("on", !!e.visible), n && n.classList.toggle("on", !!e.debug), o && o.classList.toggle("on", !!e.verbose);
    const i = document.getElementById("adminTriggerBtn");
    i && i.classList.toggle("visible", !!e.visible)
  } catch {}
}

function adminSaveSettings(e) {
  const t = safeLS(ADMIN_SETTINGS_KEY, "{}");
  Object.assign(t, e), safeSetItem(ADMIN_SETTINGS_KEY, JSON.stringify(t)), adminLoadSettings()
}

function adminSavePin() {
  const e = document.getElementById("adminNewPin").value.trim();
  e.length < 4 ? showToast?.("PIN musí mít alespoň 4 číslice") : (localStorage.setItem(ADMIN_PIN_KEY, e), document.getElementById("adminNewPin").value = "", showToast?.("🔐 Admin PIN uložen"), adminLog("Admin PIN změněn", "ok"))
}

function adminToggleVisible(e) {
  e.classList.toggle("on"), adminSaveSettings({
    visible: e.classList.contains("on")
  })
}

function adminToggleDebug(e) {
  e.classList.toggle("on"), adminSaveSettings({
    debug: e.classList.contains("on")
  }), showToast?.(e.classList.contains("on") ? "🐛 Debug mode ON — AI skóre viditelné" : "🐛 Debug mode OFF")
}

function adminToggleVerbose(e) {
  e.classList.toggle("on"), adminSaveSettings({
    verbose: e.classList.contains("on")
  })
}

function adminFactoryReset() {
  if (!confirm("⚠️ FACTORY RESET ⚠️\n\nToto smaže VŠECHNA data MůjFlixu.\nJsi si jistý? Toto nelze vrátit!")) return;
  if (!confirm("Opravdu? Všechna data budou smazána!")) return;
  const e = [];
  for (let t = 0; t < localStorage.length; t++) {
    const n = localStorage.key(t);
    (n.startsWith("mf_") || n.startsWith("trakt_") || n.startsWith("ai_")) && e.push(n)
  }
  e.forEach(e => localStorage.removeItem(e)), adminLog("FACTORY RESET proveden", "warn"), showToast?.("☠ Factory reset hotov — obnovuji stránku..."), setTimeout(() => location.reload(), 1500)
}

function adminClearAllProfiles() {
  confirm("Smazat všechny profily?") && (localStorage.removeItem("mf_profiles"), localStorage.removeItem("mf_profiles_v2"), localStorage.removeItem("mf_active_pid"), showToast?.("🗑 Profily smazány — obnovuji..."), setTimeout(() => location.reload(), 1e3))
}! function() {
  const e = console.error.bind(console),
    t = console.warn.bind(console);
  console.error = (...t) => {
    _adminErrors.push("[ERR] " + t.join(" ")), _adminErrors.length > 100 && _adminErrors.shift(), e(...t)
  }, console.warn = (...e) => {
    _adminLogs.push("[WARN] " + e.join(" ")), _adminLogs.length > 200 && _adminLogs.shift(), t(...e)
  }
}(), document.addEventListener("keydown", e => {
    e.ctrlKey && e.shiftKey && "A" === e.key && (e.preventDefault(), adminPinGateOpen())
  }),
  function() {
    try {
      const e = safeLS(ADMIN_SETTINGS_KEY, "{}"),
        t = document.getElementById("adminTriggerBtn");
      t && e.visible && t.classList.add("visible")
    } catch {}
    adminLog("MůjFlix admin modul načten", "ok")
  }();
const EDIT_STORAGE_KEY = "mf_fab_layout_v2",
  SNAP_PX = 16,
  ROW_HEIGHTS = [22, 96, 170],
  FAB_REGISTRY = [{
    id: "aiFab",
    name: "AI",
    icon: "🤖",
    selector: "#aiFab"
  }, {
    id: "voiceModeFab",
    name: "Hlas",
    icon: "🎤",
    selector: "#voiceModeFab"
  }, {
    id: "syncBtn",
    name: "Sync",
    icon: "🔄",
    selector: "#syncBtn"
  }];
let _editActive = !1,
  _selectedFab = null,
  _editProps = {},
  _dragState = null,
  _copiedStyle = null;

function openEditMode() {
  _editActive = !0, _loadEditLayout(), document.body.classList.add("edit-mode-active"), document.getElementById("editOverlay").classList.add("open"), requestAnimationFrame(() => document.getElementById("editOverlay").classList.add("visible")), document.getElementById("editTopbar").classList.add("visible"), FAB_REGISTRY.forEach(e => {
    const t = document.querySelector(e.selector);
    t && (t.dataset.fabId = e.id, _applyStoredProps(t, e.id), _attachDrag(t, e))
  }), _buildFabList(), _openTray()
}

function closeEditMode() {
  _editActive = !1, _selectedFab = null, document.body.classList.remove("edit-mode-active"), document.getElementById("editOverlay").classList.remove("visible"), setTimeout(() => document.getElementById("editOverlay").classList.remove("open"), 300), document.getElementById("editTopbar").classList.remove("visible"), closeTray(), _saveEditLayout()
}

function handleOverlayClick(e) {
  e.target === document.getElementById("editOverlay") && _deselectFab()
}

function _openTray() {
  const e = document.getElementById("editFabTray");
  e.classList.add("open"), requestAnimationFrame(() => e.classList.add("visible"))
}

function closeTray() {
  const e = document.getElementById("editFabTray");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 350)
}

function _buildFabList() {
  const e = document.getElementById("editFabList");
  e && (e.innerHTML = FAB_REGISTRY.map(e => {
    document.querySelector(e.selector);
    const t = (_editProps[e.id] || {}).hidden;
    return `<div class="edit-fab-chip${t?" hidden-fab":""}" id="chip_${e.id}" onclick="selectFabById('${e.id}')">\n        <span class="edit-fab-chip-icon">${e.icon}</span>\n        <span>${e.name}</span>\n        ${t?'<span style="font-size:0.4rem;color:rgba(255,100,100,0.7);">skrytá</span>':""}\n      </div>`
  }).join(""))
}

function selectFabById(e) {
  const t = FAB_REGISTRY.find(t => t.id === e);
  if (!t) return;
  const n = document.querySelector(t.selector);
  n && _selectFab(n, t)
}

function _selectFab(e, t) {
  document.querySelectorAll(".fab-selected").forEach(e => e.classList.remove("fab-selected")), document.querySelectorAll(".edit-fab-chip").forEach(e => e.classList.remove("selected")), e.classList.add("fab-selected");
  const n = document.getElementById("chip_" + t.id);
  n && n.classList.add("selected"), _selectedFab = {
    el: e,
    fab: t
  }, _showTrayProps(e, t)
}

function _deselectFab() {
  document.querySelectorAll(".fab-selected").forEach(e => e.classList.remove("fab-selected")), document.querySelectorAll(".edit-fab-chip").forEach(e => e.classList.remove("selected")), _selectedFab = null;
  const e = document.getElementById("editPropsSection");
  e && (e.style.display = "none");
  const t = document.getElementById("editTrayName");
  t && (t.innerHTML = "✏ <span>Vyber ikonku</span>")
}

function _showTrayProps(e, t) {
  const n = document.getElementById("editPropsSection");
  n && (n.style.display = "block");
  const o = document.getElementById("editTrayName");
  o && (o.innerHTML = `${t.icon} <span>${t.name}</span>`);
  const i = t.id,
    a = _editProps[i] || {},
    s = e.querySelector(".mf-fab-icon") || e,
    r = parseInt(s.style.width) || 52,
    l = parseInt(s.style.height) || 52,
    c = parseInt(s.style.borderRadius) || 16,
    d = Math.round(100 * (parseFloat(e.style.opacity) || 1));
  _setSlider("editSliderW", "editValW", r), _setSlider("editSliderH", "editValH", l), _setSlider("editSliderR", "editValR", c), _setSlider("editSliderO", "editValO", d), _syncToggle("editToggleShadow", !1 !== a.shadow), _syncToggle("editToggleGlow", !1 !== a.glow), _syncToggle("editToggleLabel", !1 !== a.label), _syncToggle("editToggleMagnet", !1 !== a.magnet), _syncToggle("editToggleBlur", !1 !== a.blur), _syncToggle("editToggleBorder", !1 !== a.border), _syncToggle("editTogglePulse", !!a.pulse), _syncToggle("editToggleBounce", !!a.bounce);
  const m = document.getElementById("editToggleHide");
  m && (m.textContent = a.hidden ? "👁 Zobrazit ikonku" : "🙈 Skrýt ikonku")
}

function _setSlider(e, t, n) {
  const o = document.getElementById(e),
    i = document.getElementById(t);
  o && (o.value = n), i && (i.textContent = n)
}

function _syncToggle(e, t) {
  const n = document.getElementById(e);
  n && n.classList.toggle("on", !!t)
}

function applyEditProp(e, t, n) {
  if (!_selectedFab) return;
  const {
    el: o,
    fab: i
  } = _selectedFab, a = i.id;
  _editProps[a] || (_editProps[a] = {});
  const s = _editProps[a],
    r = o.querySelector(".mf-fab-icon") || o;
  switch (n && (document.querySelectorAll(".edit-color-swatch").forEach(e => e.classList.remove("active")), n.classList.add("active")), e) {
    case "width":
      r.style.width = t + "px", document.getElementById("editValW").textContent = t, s.w = +t;
      break;
    case "height":
      r.style.height = t + "px", document.getElementById("editValH").textContent = t, s.h = +t;
      break;
    case "radius":
      r.style.borderRadius = t + "px", document.getElementById("editSliderR").value = t, document.getElementById("editValR").textContent = t, s.r = +t;
      break;
    case "opacity":
      o.style.opacity = t / 100, document.getElementById("editValO").textContent = t, s.opacity = +t;
      break;
    case "color":
      _applyColor(o, r, t), s.color = t
  }
  _saveEditLayout()
}

function applyPresetSize(e) {
  applyEditProp("width", e), applyEditProp("height", e), _setSlider("editSliderW", "editValW", e), _setSlider("editSliderH", "editValH", e)
}

function toggleEditProp(e, t) {
  if (!_selectedFab) return;
  const {
    el: n,
    fab: o
  } = _selectedFab, i = o.id;
  _editProps[i] || (_editProps[i] = {});
  const a = _editProps[i],
    s = n.querySelector(".mf-fab-icon") || n;
  switch (e) {
    case "shadow":
      a.shadow = !1 === a.shadow, s.style.boxShadow = !1 === a.shadow ? "none" : "", _syncToggle("editToggleShadow", !1 !== a.shadow);
      break;
    case "glow":
      a.glow = !1 === a.glow, s.style.filter = !1 === a.glow ? "none" : "", _syncToggle("editToggleGlow", !1 !== a.glow);
      break;
    case "label":
      a.label = !1 === a.label;
      const e = n.querySelector(".mf-fab-label");
      e && (e.style.display = !1 === a.label ? "none" : ""), _syncToggle("editToggleLabel", !1 !== a.label);
      break;
    case "magnet":
      a.magnet = !1 === a.magnet, _syncToggle("editToggleMagnet", !1 !== a.magnet);
      break;
    case "blur":
      a.blur = !1 === a.blur, s.style.backdropFilter = !1 === a.blur ? "none" : "", _syncToggle("editToggleBlur", !1 !== a.blur);
      break;
    case "border":
      a.border = !1 === a.border, s.style.borderWidth = !1 === a.border ? "0" : "", _syncToggle("editToggleBorder", !1 !== a.border);
      break;
    case "pulse":
      a.pulse = !a.pulse, n.style.animation = a.pulse ? "fabPulse 2s ease-in-out infinite" : "", _syncToggle("editTogglePulse", !!a.pulse);
      break;
    case "bounce":
      a.bounce = !a.bounce, a.bounce && (n.dataset.origTransition = s.style.transition, s.style.setProperty("--fab-hover-transform", "translateY(-8px) scale(1.12)")), _syncToggle("editToggleBounce", !!a.bounce)
  }
  _saveEditLayout()
}

function toggleHideFab() {
  if (!_selectedFab) return;
  const {
    el: e,
    fab: t
  } = _selectedFab, n = t.id;
  _editProps[n] || (_editProps[n] = {}), _editProps[n].hidden = !_editProps[n].hidden, e.classList.toggle("fab-hidden-by-user", !!_editProps[n].hidden);
  const o = document.getElementById("editToggleHide");
  o && (o.textContent = _editProps[n].hidden ? "👁 Zobrazit ikonku" : "🙈 Skrýt ikonku"), _buildFabList(), _saveEditLayout(), showToast?.(_editProps[n].hidden ? "🙈 Ikonka skryta" : "👁 Ikonka zobrazena")
}

function snapFabTo(e) {
  if (!_selectedFab) return;
  const {
    el: t
  } = _selectedFab, n = window.innerWidth, o = window.innerHeight, i = t.offsetWidth, a = t.offsetHeight, s = 22, r = {
    tl: [s, null, null, o - a - s],
    tc: [(n - i) / 2, null, null, o - a - s],
    tr: [null, s, null, o - a - s],
    ml: [s, null, null, (o - a) / 2],
    mc: [(n - i) / 2, null, null, (o - a) / 2],
    mr: [null, s, null, (o - a) / 2],
    bl: [s, null, null, s],
    bc: [(n - i) / 2, null, null, s],
    br: [null, s, null, s]
  }, [l, c, d, m] = r[e] || [null, null, null, null];
  t.style.left = null !== l ? l + "px" : "", t.style.right = null !== c ? c + "px" : "", t.style.top = null !== d ? d + "px" : "", t.style.bottom = null !== m ? m + "px" : "", null !== l && (t.style.right = "auto"), null !== c && (t.style.left = "auto"), _savePos(t), _saveEditLayout(), showToast?.("📍 Přesunuto")
}

function snapFabToRow(e) {
  if (!_selectedFab) return;
  const {
    el: t
  } = _selectedFab, n = ROW_HEIGHTS[e - 1] ?? 22;
  t.style.bottom = n + "px", t.style.top = "auto", _savePos(t), _saveEditLayout(), showToast?.("📍 Řada " + e)
}

function _savePos(e) {
  const t = FAB_REGISTRY.find(t => document.querySelector(t.selector) === e);
  if (!t) return;
  const n = e.getBoundingClientRect();
  _editProps[t.id] || (_editProps[t.id] = {}), _editProps[t.id].x = n.left, _editProps[t.id].y = window.innerHeight - n.bottom
}

function duplicateFabStyle() {
  _selectedFab && (_copiedStyle = Object.assign({}, _editProps[_selectedFab.fab.id] || {}), delete _copiedStyle.x, delete _copiedStyle.y, delete _copiedStyle.hidden, showToast?.("⧉ Styl zkopírován"))
}

function pasteFabStyle() {
  if (!_selectedFab || !_copiedStyle) return void showToast?.("Nejdřív zkopíruj styl");
  const {
    el: e,
    fab: t
  } = _selectedFab, n = t.id, o = {
    x: _editProps[n]?.x,
    y: _editProps[n]?.y,
    hidden: _editProps[n]?.hidden
  };
  _editProps[n] = Object.assign({}, _copiedStyle, o), _applyStoredProps(e, n), _showTrayProps(e, t), _saveEditLayout(), showToast?.("✓ Styl vložen")
}

function resetSelectedFab() {
  if (!_selectedFab) return;
  const {
    el: e,
    fab: t
  } = _selectedFab, n = t.id;
  _editProps[n] = {}, _clearFabStyles(e), _showTrayProps(e, t), _saveEditLayout(), showToast?.("↺ Ikonka resetována")
}

function _clearFabStyles(e) {
  e.style.left = "", e.style.right = "", e.style.top = "", e.style.bottom = "", e.style.opacity = "", e.style.animation = "", e.classList.remove("fab-hidden-by-user");
  const t = e.querySelector(".mf-fab-icon") || e;
  t.style.width = "", t.style.height = "", t.style.borderRadius = "", t.style.boxShadow = "", t.style.filter = "", t.style.borderColor = "", t.style.backdropFilter = "", t.style.borderWidth = "";
  const n = e.querySelector("svg");
  n && (n.style.color = "");
  const o = e.querySelector(".mf-fab-label");
  o && (o.style.display = "")
}

function _applyColor(e, t, n) {
  t.style.borderColor = n + "55", t.style.boxShadow = `0 4px 20px rgba(0,0,0,0.6), 0 0 18px ${n}22`;
  const o = e.querySelector("svg");
  o && (o.style.color = n);
  const i = e.querySelector(".mf-fab-label");
  i && (i.style.color = n)
}

function _attachDrag(e, t) {
  e._editDragAttached || (e._editDragAttached = !0, e.addEventListener("mousedown", n => {
    if (!_editActive) return;
    n.preventDefault(), n.stopPropagation(), _selectFab(e, t);
    const o = e.getBoundingClientRect();
    _dragState = {
      el: e,
      startX: n.clientX,
      startY: n.clientY,
      startLeft: o.left,
      startBottom: window.innerHeight - o.bottom
    };
    const i = n => {
        if (!_dragState) return;
        const o = n.clientX - _dragState.startX,
          i = -(n.clientY - _dragState.startY);
        let a = _dragState.startLeft + o,
          s = _dragState.startBottom + i;
        if (!1 !== (_editProps[t.id] || {}).magnet) {
          const t = window.innerWidth,
            n = window.innerHeight,
            o = e.offsetWidth,
            i = e.offsetHeight;
          a < 16 ? (a = 0, _showSnap("v", 0)) : a + o > t - 16 ? (a = t - o, _showSnap("v", t - o)) : _hideSnap("v"), s < 16 ? (s = 0, _showSnap("h", n)) : s + i > n - 16 ? (s = n - i, _showSnap("h", i)) : _hideSnap("h");
          const r = (t - o) / 2;
          Math.abs(a - r) < 16 && (a = r, _showSnap("v", r))
        }
        e.style.left = a + "px", e.style.right = "auto", e.style.bottom = s + "px", e.style.top = "auto"
      },
      a = () => {
        if (!_dragState) return;
        const e = _dragState.el.getBoundingClientRect();
        _editProps[t.id] || (_editProps[t.id] = {}), _editProps[t.id].x = e.left, _editProps[t.id].y = window.innerHeight - e.bottom, _dragState = null, _hideSnap("h"), _hideSnap("v"), _saveEditLayout(), document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", a)
      };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", a)
  }), e.addEventListener("touchstart", n => {
    if (!_editActive) return;
    n.preventDefault(), n.stopPropagation(), _selectFab(e, t);
    const o = n.touches[0],
      i = e.getBoundingClientRect();
    _dragState = {
      el: e,
      startX: o.clientX,
      startY: o.clientY,
      startLeft: i.left,
      startBottom: window.innerHeight - i.bottom
    }
  }, {
    passive: !1
  }), e.addEventListener("touchmove", t => {
    if (!_dragState || !_editActive) return;
    t.preventDefault();
    const n = t.touches[0],
      o = n.clientX - _dragState.startX,
      i = -(n.clientY - _dragState.startY);
    let a = _dragState.startLeft + o,
      s = _dragState.startBottom + i;
    e.style.left = a + "px", e.style.right = "auto", e.style.bottom = s + "px", e.style.top = "auto"
  }, {
    passive: !1
  }), e.addEventListener("touchend", n => {
    if (!_dragState) return;
    const o = e.getBoundingClientRect();
    _editProps[t.id] || (_editProps[t.id] = {}), _editProps[t.id].x = o.left, _editProps[t.id].y = window.innerHeight - o.bottom, _dragState = null, _saveEditLayout()
  }))
}

function _loadEditLayout() {
  try {
    _editProps = safeLS(EDIT_STORAGE_KEY, "{}")
  } catch {
    _editProps = {}
  }
}

function _saveEditLayout() {
  localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(_editProps))
}

function _applyStoredProps(e, t) {
  const n = _editProps[t];
  if (!n) return;
  const o = e.querySelector(".mf-fab-icon") || e;
  void 0 !== n.x && (e.style.left = "auto", e.style.right = "auto", e.style.left = n.x + "px"), void 0 !== n.y && (e.style.bottom = "auto", e.style.top = "auto", e.style.bottom = n.y + "px"), n.w && (o.style.width = n.w + "px"), n.h && (o.style.height = n.h + "px"), void 0 !== n.r && (o.style.borderRadius = n.r + "px"), void 0 !== n.opacity && (e.style.opacity = n.opacity / 100), n.color && _applyColor(e, o, n.color), !1 === n.shadow && (o.style.boxShadow = "none"), !1 === n.glow && (o.style.filter = "none"), !1 === n.blur && (o.style.backdropFilter = "none"), !1 === n.border && (o.style.borderWidth = "0"), n.pulse && (e.style.animation = "fabPulse 2s ease-in-out infinite");
  const i = e.querySelector(".mf-fab-label");
  i && !1 === n.label && (i.style.display = "none"), n.hidden ? e.classList.add("fab-hidden-by-user") : e.classList.remove("fab-hidden-by-user")
}

function _showSnap(e, t) {
  if ("h" === e) {
    const e = document.getElementById("snapLineH");
    e && (e.style.display = "block", e.style.bottom = t + "px", e.style.top = "auto")
  } else {
    const e = document.getElementById("snapLineV");
    e && (e.style.display = "block", e.style.left = t + "px")
  }
}

function _hideSnap(e) {
  const t = document.getElementById("h" === e ? "snapLineH" : "snapLineV");
  t && (t.style.display = "none")
}

function resetEditLayout() {
  confirm("Obnovit výchozí rozložení všech ikonek?") && (_editProps = {}, localStorage.removeItem(EDIT_STORAGE_KEY), FAB_REGISTRY.forEach(e => {
    const t = document.querySelector(e.selector);
    t && _clearFabStyles(t)
  }), _deselectFab(), _buildFabList(), showToast?.("✓ Rozložení obnoveno"))
}
const _pulseStyle = document.createElement("style");
_pulseStyle.textContent = "@keyframes fabPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.08)} }", document.head.appendChild(_pulseStyle),
  function() {
    try {
      _editProps = safeLS(EDIT_STORAGE_KEY, "{}"), FAB_REGISTRY.forEach(e => {
        const t = document.querySelector(e.selector);
        t && (t.dataset.fabId = e.id, _applyStoredProps(t, e.id))
      })
    } catch {}
  }();
let _vmListening = !1,
  _vmRecog = null;

function openVoiceMode() {
  const e = document.getElementById("voiceModeOverlay");
  e.style.display = "flex", requestAnimationFrame(() => e.classList.add("visible")), document.getElementById("voiceModeFab").classList.add("active")
}

function closeVoiceMode() {
  const e = document.getElementById("voiceModeOverlay");
  e.classList.remove("visible"), setTimeout(() => {
    e.style.display = "none"
  }, 400), document.getElementById("voiceModeFab").classList.remove("active"), _vmListening && vmStopListen()
}

function vmToggleListen() {
  _vmListening ? vmStopListen() : vmStartListen()
}

function vmStartListen() {
  const e = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  if (!e) return void(document.getElementById("vmTranscript").textContent = isFirefox ? "Firefox hlasové ovládání nepodporuje 😔 Zkus Chrome" : "Tvůj prohlížeč hlasové ovládání nepodporuje 😔");
  _vmListening = !0;
  document.getElementById("vmOrb").classList.add("listening"), document.getElementById("vmStatus").textContent = "Poslouchám…", document.getElementById("vmTranscript").textContent = "", _vmRecog = new e, _vmRecog.lang = "cs-CZ", _vmRecog.continuous = !1, _vmRecog.interimResults = !0, _vmRecog.onresult = e => {
    let t = "";
    for (let n = e.resultIndex; n < e.results.length; n++) t += e.results[n][0].transcript;
    document.getElementById("vmTranscript").textContent = t, e.results[e.results.length - 1].isFinal && vmHandleCommand(t.toLowerCase().trim())
  }, _vmRecog.onend = () => {
    vmStopListen()
  }, _vmRecog.onerror = e => {
    document.getElementById("vmStatus").textContent = "Chyba: " + e.error, vmStopListen()
  }, _vmRecog.start()
}

function vmStopListen() {
  _vmListening = !1;
  if (document.getElementById("vmOrb").classList.remove("listening"), document.getElementById("vmStatus").textContent = "Klikni pro poslech", _vmRecog) {
    try {
      _vmRecog.stop()
    } catch (e) {}
    _vmRecog = null
  }
}

function vmHandleCommand(e) {
  if (document.getElementById("vmStatus").textContent = "✓ Příkaz rozpoznán", e.includes("náhodn")) setTimeout(() => {
    closeVoiceMode(), openUniverse?.()
  }, 400);
  else if (e.includes("premiér")) setTimeout(() => {
    closeVoiceMode(), openPremiereCalendar?.()
  }, 400);
  else if (e.includes("kolekc") || e.includes("ságy")) setTimeout(() => {
    closeVoiceMode(), openCollections?.()
  }, 400);
  else if (e.includes("watchlist") || e.includes("chci koukat")) setTimeout(() => {
    closeVoiceMode(), openWatchlist?.()
  }, 400);
  else if (e.includes("ai") || e.includes("doporuč")) setTimeout(() => {
    closeVoiceMode(), toggleAiPanel?.()
  }, 400);
  else if (e.includes("wrapped") || e.includes("statistik")) setTimeout(() => {
    closeVoiceMode(), openWrapped?.()
  }, 400);
  else if (e.includes("hledej") || e.includes("najdi") || e.includes("hledat")) {
    const t = e.replace(/hledej|najdi|hledat/g, "").trim();
    setTimeout(() => {
      closeVoiceMode(), openUniverse?.(), setTimeout(() => {
        const e = document.getElementById("shSearchInput");
        e && (e.value = t, e.dispatchEvent(new Event("input")))
      }, 600)
    }, 400)
  } else e.includes("zavři") || e.includes("zavrit") || e.includes("zruš") ? closeVoiceMode() : (document.getElementById("vmTranscript").textContent = '"' + e + '"  — zkus jiný příkaz 🤔', document.getElementById("vmStatus").textContent = "Příkaz nebyl rozpoznán")
}

function _custStorageKey() {
  try {
    return "mf_customize_" + (("function" == typeof getActiveProfileId ? getActiveProfileId() : null) || localStorage.getItem("mf_active_pid") || "default")
  } catch {
    return "mf_customize_default"
  }
}

function _custGetSettings() {
  try {
    return safeLS(_custStorageKey(), "{}")
  } catch {
    return {}
  }
}

function custSave() {
  const e = _custCollectSettings();
  localStorage.setItem(_custStorageKey(), JSON.stringify(e)), custApplyAll(e), showToast?.("✓ Nastavení uloženo pro tvůj profil")
}

function custReset() {
  confirm("Obnovit výchozí vzhled?") && (localStorage.removeItem(_custStorageKey()), custApplyAll({}), custLoadUI({}), showToast?.("✓ Výchozí vzhled obnoven"))
}

function _custCollectSettings() {
  return {
    accent: document.querySelector("#accentSwatches .accent-swatch.active")?.dataset.accent || "#007AFF",
    accent2: document.querySelector("#accentSwatches .accent-swatch.active")?.dataset.accent2 || "#34aadc",
    bg: document.querySelector("#bgOptions .font-option.active")?.dataset.bg || "dark",
    compact: document.getElementById("custCompact")?.checked,
    hideKeys: document.getElementById("custHideKeys")?.checked,
    tileH: document.getElementById("custTileH")?.value || 300,
    tileRadius: document.getElementById("custTileRadius")?.value || 16,
    grain: !1 !== document.getElementById("custGrain")?.checked,
    glow: !1 !== document.getElementById("custGlow")?.checked,
    animations: !1 !== document.getElementById("custAnimations")?.checked,
    videoHover: !1 !== document.getElementById("custVideoHover")?.checked,
    showEpBadge: !1 !== document.getElementById("custShowEpBadge")?.checked,
    showProgress: !1 !== document.getElementById("custShowProgress")?.checked
  }
}

function custApplyAll(e) {
  const t = document.documentElement,
    n = document.body;
  e.accent ? t.style.setProperty("--accent", e.accent) : t.style.setProperty("--accent", "#007AFF"), e.accent2 ? t.style.setProperty("--accent2", e.accent2) : t.style.setProperty("--accent2", "#34aadc");
  t.style.setProperty("--bg", {
    dark: "#060608",
    darker: "#020203",
    navy: "#04050f",
    warm: "#0a0806",
    "green-dark": "#04080a"
  } [e.bg] || "#060608"), document.querySelectorAll(".ps-tile-wrapper").forEach(t => t.classList.toggle("compact", !!e.compact)), e.tileH && t.style.setProperty("--tile-h", e.tileH + "px"), e.tileRadius && t.style.setProperty("--radius", e.tileRadius + "px"), n.classList.toggle("grain-none", !e.grain);
  const o = document.querySelector(".bg-glow");
  if (o && (o.style.display = !1 === e.glow ? "none" : ""), !1 === e.animations) {
    const e = document.createElement("style");
    e.id = "cust-no-anim", e.textContent = "*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.1ms !important; }", document.getElementById("cust-no-anim") || document.head.appendChild(e)
  } else document.getElementById("cust-no-anim")?.remove();
  const i = document.querySelector(".key-hint");
  i && (i.style.display = e.hideKeys ? "none" : "")
}

function custApply() {
  custApplyAll(_custCollectSettings())
}

function custApplyTileH(e) {
  document.documentElement.style.setProperty("--tile-h", e + "px")
}

function custApplyTileRadius(e) {
  document.documentElement.style.setProperty("--radius", e + "px")
}

function custPickAccent(e) {
  document.querySelectorAll("#accentSwatches .accent-swatch").forEach(e => e.classList.remove("active")), e.classList.add("active"), custApply()
}

function custPickBg(e) {
  document.querySelectorAll("#bgOptions .font-option").forEach(e => e.classList.remove("active")), e.classList.add("active"), custApply()
}

function custSwitchTab(e, t) {
  document.querySelectorAll(".customize-tab").forEach(e => e.classList.remove("active")), e.classList.add("active"), document.querySelectorAll(".cust-tab-panel").forEach(e => e.style.display = "none");
  const n = document.getElementById("custPanel-" + t);
  n && (n.style.display = ""), "tiles" === t && buildCustTileToggles()
}

function buildCustTileToggles() {
  const e = document.getElementById("custTileToggles");
  if (!e) return;
  const t = document.querySelectorAll(".ps-tile-wrapper");
  e.children.length > 0 || t.forEach(t => {
    const n = t.dataset.slug || t.textContent.trim().slice(0, 20),
      o = t.querySelector(".tile-hero-overlay-title")?.textContent || n,
      i = document.createElement("div");
    i.className = "customize-row", i.innerHTML = `<div class="customize-row-left"><div class="customize-row-label">${o}</div></div>\n        <label class="cust-toggle"><input type="checkbox" checked onchange="custToggleTile('${n}',this.checked)"><div class="cust-toggle-slider"></div></label>`, e.appendChild(i)
  })
}

function custToggleTile(e, t) {
  const n = document.querySelector(`.ps-tile-wrapper[data-slug="${e}"]`);
  n && (n.style.display = t ? "" : "none")
}

function custLoadUI(e) {
  document.querySelectorAll("#accentSwatches .accent-swatch").forEach(t => {
    t.classList.toggle("active", t.dataset.accent === (e.accent || "#007AFF"))
  }), document.querySelectorAll("#bgOptions .font-option").forEach(t => {
    t.classList.toggle("active", t.dataset.bg === (e.bg || "dark"))
  });
  const t = (e, t, n = !0) => {
    const o = document.getElementById(e);
    o && (o.checked = void 0 !== t ? t : n)
  };
  t("custCompact", e.compact, !1), t("custHideKeys", e.hideKeys, !1), t("custGrain", e.grain, !0), t("custGlow", e.glow, !0), t("custAnimations", e.animations, !0), t("custVideoHover", e.videoHover, !0), t("custShowEpBadge", e.showEpBadge, !0), t("custShowProgress", e.showProgress, !0);
  const n = (e, t, n) => {
    const o = document.getElementById(e);
    o && (o.value = t || n)
  };
  n("custTileH", e.tileH, 300), n("custTileRadius", e.tileRadius, 16)
}

function openCustomize() {
  const e = _custGetSettings();
  custLoadUI(e), custApplyAll(e);
  try {
    const e = safeLS("mf_profiles_v2", "[]"),
      t = localStorage.getItem("mf_active_pid"),
      n = e.find(e => e.id === t);
    document.getElementById("customizeProfileHint").textContent = "Nastavení se ukládají jen pro tebe · profil: " + (n ? n.name : "Výchozí")
  } catch {}
  const t = document.getElementById("customizeOverlay");
  t.classList.add("open"), requestAnimationFrame(() => t.classList.add("visible"))
}

function closeCustomize() {
  const e = document.getElementById("customizeOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 300)
}
document.addEventListener("keydown", e => {
    "Escape" === e.key && document.getElementById("voiceModeOverlay").classList.contains("visible") && closeVoiceMode()
  }),
  function() {
    try {
      const e = safeLS("mf_customize_default", "{}"),
        t = safeLS("mf_profiles_v2", "[]"),
        n = localStorage.getItem("mf_active_pid"),
        o = t.find(e => e.id === n),
        i = safeLS("mf_customize_" + (o ? o.id : "default"), "{}");
      custApplyAll(Object.keys(i).length ? i : e)
    } catch {}
  }();
const ADMIN_CODE = "mfadmin99",
  ADMIN_KEY = "mf_admin_unlocked";

function isAdminUnlocked() {
  return "1" === localStorage.getItem(ADMIN_KEY)
}

function openAdmin() {
  if (!isAdminUnlocked()) {
    const e = prompt("Admin kód:");
    if (e !== ADMIN_CODE) return null !== e ? void showToast?.("❌ Nesprávný kód") : void 0;
    localStorage.setItem(ADMIN_KEY, "1"), showAdminFab()
  }
  adminRefreshStats();
  const e = document.getElementById("adminOverlay");
  e.classList.add("open"), requestAnimationFrame(() => e.classList.add("visible"))
}

function closeAdmin() {
  const e = document.getElementById("adminOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 300)
}

function adminLock() {
  localStorage.removeItem(ADMIN_KEY), hideAdminFab(), closeAdmin(), showToast?.("🔐 Admin zamčen")
}

function showAdminFab() {
  document.getElementById("adminFab")?.classList.add("visible")
}

function hideAdminFab() {
  document.getElementById("adminFab")?.classList.remove("visible")
}
isAdminUnlocked() && showAdminFab();
let _logoClickTimer, _logoClickCount = 0;

function adminRefreshStats() {
  try {
    const e = safeLS("mf_profiles_v2", "[]");
    document.getElementById("adminStatProfiles").textContent = e.length || 1;
    let t = 0,
      n = 0;
    try {
      t += safeLS("watchlist", "[]").length
    } catch {}
    try {
      Object.keys(localStorage).forEach(e => {
        if (e.startsWith("watched_")) {
          const t = safeLS(e, "{}");
          n += Object.keys(t).length
        }
      })
    } catch {}
    document.getElementById("adminStatShows").textContent = t, document.getElementById("adminStatEps").textContent = n;
    let o = 0;
    Object.keys(localStorage).forEach(e => {
      (e.startsWith("mf_") || e.startsWith("watchlist") || e.startsWith("watched_") || e.startsWith("ai_")) && (o += (localStorage.getItem(e) || "").length)
    }), document.getElementById("adminStatStorage").textContent = (o / 1024).toFixed(1) + " KB"
  } catch (e) {}
}

function adminExportAll() {
  try {
    const e = {};
    Object.keys(localStorage).forEach(t => {
      e[t] = localStorage.getItem(t)
    });
    const t = JSON.stringify(e, null, 2),
      n = new Blob([t], {
        type: "application/json"
      }),
      o = URL.createObjectURL(n),
      i = document.createElement("a");
    i.href = o, i.download = "mujflix_backup_" + (new Date).toISOString().slice(0, 10) + ".json", i.click(), URL.revokeObjectURL(o), showToast?.("✓ Záloha stažena")
  } catch (e) {
    showToast?.("❌ Export selhal: " + e.message)
  }
}

function adminImportAll() {
  const e = document.createElement("input");
  e.type = "file", e.accept = ".json", e.onchange = e => {
    const t = e.target.files[0];
    if (!t) return;
    const n = new FileReader;
    n.onload = e => {
      try {
        const t = JSON.parse(e.target.result);
        if (!confirm("Přepsat všechna data? Tato akce je nevratná!")) return;
        Object.keys(t).forEach(e => localStorage.setItem(e, t[e])), showToast?.("✓ Import dokončen — obnovuji stránku…"), setTimeout(() => location.reload(), 1500)
      } catch (e) {
        showToast?.("❌ Neplatný soubor zálohy")
      }
    }, n.readAsText(t)
  }, e.click()
}

function adminShowStorage() {
  const e = Object.keys(localStorage).sort();
  let t = "LocalStorage klíče MůjFlix:\n\n";
  e.forEach(e => {
    const n = localStorage.getItem(e);
    t += `${e}: ${n?n.slice(0,80):"(prázdné)"}${n&&n.length>80?"…":""}\n`
  });
  const n = document.createElement("pre");
  n.textContent = t, n.style.cssText = "background:#0a0a0f;color:#007AFF;padding:20px;border-radius:12px;max-height:60vh;overflow:auto;font-size:0.65rem;line-height:1.5;white-space:pre-wrap;word-break:break-all;";
  const o = document.createElement("div");
  o.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px;";
  const i = document.createElement("div");
  i.style.cssText = "background:#0d0d12;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:700px;width:100%;max-height:90vh;display:flex;flex-direction:column;gap:12px;";
  const a = document.createElement("div");
  a.style.cssText = "display:flex;align-items:center;justify-content:space-between;", a.innerHTML = '<span style="font-family:-apple-system,sans-serif;font-weight:900;font-size:1rem;">🗄️ LocalStorage</span><button onclick="this.closest(\'[style*="z-index:999999"]\').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.1rem;cursor:pointer;">✕</button>', i.appendChild(a), i.appendChild(n), o.appendChild(i), document.body.appendChild(o)
}

function adminShowAllProfiles() {
  try {
    const e = safeLS("mf_profiles_v2", "[]");
    if (!e.length) return void showToast?.("Žádné profily v localStorage");
    let t = '<div style="font-family:-apple-system,sans-serif;font-size:0.9rem;font-weight:900;margin-bottom:14px;">👥 Profily</div>';
    e.forEach(e => {
      t += `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;margin-bottom:7px;">\n          <span style="font-size:1.4rem;">${e.avatar||"👤"}</span>\n          <div style="flex:1;"><div style="font-weight:700;font-size:0.82rem;">${e.name||"—"}</div><div style="font-size:0.58rem;color:rgba(255,255,255,0.3);">ID: ${e.id||"?"}</div></div>\n          <button onclick="if(confirm('Smazat profil ${(e.name||"?").replace(/'/g,"")}')){let ps;try{ps=safeLS('mf_profiles_v2', '[]')}catch{ps=[]};localStorage.setItem('mf_profiles_v2',JSON.stringify(ps.filter(x=>x.id!=='${e.id}')));this.closest('[style*="z-index"]').remove();showToast?.('Profil smazán');}" style="background:rgba(255,60,60,0.1);border:1px solid rgba(255,60,60,0.25);color:#ff6666;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:0.65rem;">Smazat</button>\n        </div>`
    });
    const n = document.createElement("div");
    n.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.85);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px;";
    const o = document.createElement("div");
    o.style.cssText = "background:#0d0d12;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:500px;width:100%;max-height:85vh;overflow-y:auto;", o.innerHTML = t + '<button onclick="this.closest(\'[style*="z-index:999999"]\').remove()" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.5);cursor:pointer;margin-top:10px;">Zavřít</button>', n.appendChild(o), document.body.appendChild(n)
  } catch (e) {
    showToast?.("Chyba: " + e.message)
  }
}

function adminForceCache() {
  Object.keys(localStorage).filter(e => e.startsWith("tmdb_") || e.startsWith("mf_cache_")).forEach(e => localStorage.removeItem(e)), showToast?.("✓ TMDB cache smazána"), adminRefreshStats()
}

function adminShowDebugLog() {
  const e = window._mfDebugLog || [],
    t = e.length ? e.join("\n") : "Žádné záznamy v debug logu.\n\nPro pokročilé ladění otevři DevTools (F12) → Console.",
    n = document.createElement("div");
  n.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px;";
  const o = document.createElement("div");
  o.style.cssText = "background:#050508;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;max-width:700px;width:100%;max-height:90vh;display:flex;flex-direction:column;gap:12px;", o.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-family:-apple-system,sans-serif;font-weight:900;">🪲 Debug Log</span><button onclick="this.closest('[style*="z-index:999999"]').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.1rem;cursor:pointer;">✕</button></div><pre style="background:#020204;color:#50ff80;padding:16px;border-radius:10px;flex:1;overflow:auto;font-size:0.62rem;line-height:1.6;white-space:pre-wrap;word-break:break-all;">${t}</pre>`, n.appendChild(o), document.body.appendChild(n)
}

function adminCloneProfile() {
  try {
    const e = safeLS("mf_profiles_v2", "[]"),
      t = localStorage.getItem("mf_active_pid"),
      n = e.find(e => e.id === t) || e[0];
    if (!n) return void showToast?.("Žádný aktivní profil");
    const o = prompt("Název klonu:", n.name + " (kopie)");
    if (!o) return;
    const i = {
      ...n,
      id: "prof_" + Date.now(),
      name: o
    };
    e.push(i), safeSetItem("mf_profiles_v2", JSON.stringify(e));
    const a = localStorage.getItem("mf_customize_" + n.id);
    a && localStorage.setItem("mf_customize_" + i.id, a), showToast?.("✓ Profil klonován: " + o), adminRefreshStats()
  } catch (e) {
    showToast?.("Chyba: " + e.message)
  }
}

function adminBroadcastToast() {
  const e = prompt("Zpráva pro všechny profily:");
  e && (localStorage.setItem("mf_broadcast_msg", JSON.stringify({
    text: e,
    ts: Date.now()
  })), showToast?.("✓ Zpráva nastavena — zobrazí se při příštím přihlášení"))
}

function adminRecalcStats() {
  showToast?.("🔄 Přepočítávám statistiky…"), setTimeout(() => {
    showToast?.("✓ Statistiky přepočítány")
  }, 800)
}

function adminThemeLock() {
  const e = prompt("Akcentová barva pro všechny profily (hex, např. #007AFF):");
  if (e) try {
    safeLS("mf_profiles_v2", "[]").forEach(t => {
      const n = "mf_customize_" + t.id,
        o = safeLS(n, "{}");
      o.accent = e, localStorage.setItem(n, JSON.stringify(o))
    }), document.documentElement.style.setProperty("--accent", e), showToast?.("✓ Téma aplikováno na všechny profily")
  } catch (e) {
    showToast?.("Chyba: " + e.message)
  }
}

function adminClearWatched() {
  confirm("Smazat VEŠKEROU historii sledování? Tato akce je nevratná!") && (Object.keys(localStorage).filter(e => e.startsWith("watched_")).forEach(e => localStorage.removeItem(e)), showToast?.("✓ Historie sledování smazána"), adminRefreshStats())
}

function adminNukeAll() {
  confirm("⚠️ SMAZAT VEŠKERÁ DATA MUJFLIX? Toto je nevratné!") && confirm("Opravdu? Přijdeš o všechny profily, sledování, nastavení!") && (Object.keys(localStorage).filter(e => e.startsWith("mf_") || e.startsWith("watchlist") || e.startsWith("watched_") || e.startsWith("ai_") || e.startsWith("tmdb_")).forEach(e => localStorage.removeItem(e)), showToast?.("💣 Factory reset dokončen. Obnovuji…"), setTimeout(() => location.reload(), 1800))
}

function adminLoadApiKeys() {
  const e = document.getElementById("adminApiKeysList");
  if (!e) return;
  e.innerHTML = [{
    key: "mf_gemini_key",
    label: "✦ Gemini API",
    prefix: "AIza",
    color: "#007AFF"
  }, {
    key: "mf_or_key",
    label: "↻ OpenRouter",
    prefix: "sk-or-",
    color: "#00cfff"
  }, {
    key: "mf_groq_key",
    label: "⚡ Groq",
    prefix: "gsk_",
    color: "#ff9a3c"
  }, {
    key: "mf_jina_key",
    label: "👁 Jina",
    prefix: "jina_",
    color: "#bd93f9"
  }, {
    key: "mf_tavily_key",
    label: "🌐 Tavily",
    prefix: "tvly-",
    color: "#50fa7b"
  }, {
    key: "mf_tmdb_key",
    label: "🎬 TMDB",
    prefix: "",
    color: "#ff6b35"
  }].map(e => {
    const t = localStorage.getItem(e.key) || "",
      n = t ? t.slice(0, 6) + "••••••••" + t.slice(-3) : "— není nastaven —",
      o = !!t;
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">\n        <div style="font-size:0.78rem;font-weight:700;color:${e.color};min-width:100px;">${e.label}</div>\n        <div style="flex:1;font-family:monospace;font-size:0.65rem;color:${o?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.2)"};">${n}</div>\n        <div style="font-size:0.6rem;padding:2px 8px;border-radius:6px;background:${o?"rgba(80,250,123,0.12)":"rgba(255,80,80,0.1)"};border:1px solid ${o?"rgba(80,250,123,0.3)":"rgba(255,80,80,0.25)"};color:${o?"#50fa7b":"rgba(255,100,100,0.7)"};">${o?"✓ OK":"✗ Chybí"}</div>\n        ${o?`<button onclick="if(confirm('Smazat klíč ${e.label}?')){localStorage.removeItem('${e.key}');adminLoadApiKeys();showToast?.('🗑 Klíč smazán');}" style="padding:4px 10px;border-radius:7px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,100,100,0.65);font-size:0.6rem;cursor:pointer;">Smazat</button>`:""}\n      </div>`
  }).join("")
}

function adminSetGlobalKey(e, t) {
  t && t.trim() ? (localStorage.setItem(e, t.trim()), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey(e, t.trim()), showToast?.("✓ Klíč uložen: " + e.replace("mf_", "").replace("_key", "").toUpperCase()), adminLoadApiKeys(), adminLog("API klíč nastaven: " + e, "ok")) : showToast?.("❌ Zadej hodnotu klíče")
}

function adminClearAllApiKeys() {
  confirm("Smazat VŠECHNY API klíče? (Gemini, OpenRouter, Groq, Jina, Tavily, TMDB)") && (["mf_gemini_key", "mf_or_key", "mf_groq_key", "mf_jina_key", "mf_tavily_key", "mf_tmdb_key"].forEach(e => localStorage.removeItem(e)), showToast?.("🗑 Všechny API klíče smazány"), adminLoadApiKeys(), adminLog("Všechny API klíče smazány", "warn"))
}
document.querySelector(".logo")?.addEventListener("click", () => {
  if (_logoClickCount++, clearTimeout(_logoClickTimer), _logoClickTimer = setTimeout(() => {
      _logoClickCount = 0
    }, 1500), _logoClickCount >= 5)
    if (_logoClickCount = 0, isAdminUnlocked()) openAdmin();
    else {
      const e = prompt("🔐 Admin kód:");
      e === ADMIN_CODE ? (localStorage.setItem(ADMIN_KEY, "1"), showAdminFab(), showToast?.("⚡ Admin odemčen")) : null !== e && showToast?.("❌ Nesprávný kód")
    }
});
const MF_DEVICE_KEY = "mf_device_id",
  MF_DEVICES_REG_KEY = "mf_registered_devices",
  MF_BLOCKED_KEY = "mf_blocked_devices";

function adminGetDeviceId() {
  let e = localStorage.getItem(MF_DEVICE_KEY);
  return e || (e = "dev_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36), localStorage.setItem(MF_DEVICE_KEY, e)), e
}

function adminRegisterThisDevice() {
  const e = adminGetDeviceId(),
    t = prompt("Název tohoto zařízení:", navigator.platform || "Moje zařízení") || navigator.platform || "Neznámé";
  let n = safeLS(MF_DEVICES_REG_KEY, "[]");
  const o = n.find(t => t.id === e);
  o ? (o.name = t, o.lastSeen = Date.now()) : n.push({
    id: e,
    name: t,
    registered: Date.now(),
    lastSeen: Date.now(),
    ua: navigator.userAgent.slice(0, 80)
  }), localStorage.setItem(MF_DEVICES_REG_KEY, JSON.stringify(n)), showToast?.("✓ Zařízení registrováno: " + t), adminRefreshDevices()
}

function adminRefreshDevices() {
  const e = document.getElementById("adminDevicesList"),
    t = document.getElementById("adminCurrentDeviceId"),
    n = adminGetDeviceId();
  t && (t.textContent = "📍 Toto zařízení: " + n);
  let o = safeLS(MF_DEVICES_REG_KEY, "[]"),
    i = safeLS(MF_BLOCKED_KEY, "[]");
  o.find(e => e.id === n) || o.push({
    id: n,
    name: "Toto zařízení (neregistrované)",
    registered: null,
    lastSeen: Date.now(),
    ua: navigator.userAgent.slice(0, 80)
  }), e && (o.length ? e.innerHTML = o.map(e => {
    const t = i.some(t => t.id === e.id),
      o = e.id === n,
      a = e.lastSeen ? new Date(e.lastSeen).toLocaleDateString("cs-CZ") : "—";
    return `<div style="display:flex;align-items:center;gap:10px;padding:11px 12px;background:rgba(255,255,255,0.025);border:1px solid ${t?"rgba(255,80,80,0.25)":o?"rgba(0,122,255,0.2)":"rgba(255,255,255,0.06)"};border-radius:10px;">\n        <div style="font-size:1.2rem;">${o?"💻":"📱"}</div>\n        <div style="flex:1;min-width:0;">\n          <div style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:6px;">\n            ${e.name||"Neznámé"}\n            ${o?'<span style="font-size:0.48rem;background:rgba(0,122,255,0.1);border:1px solid rgba(0,122,255,0.3);color:var(--accent);padding:1px 7px;border-radius:20px;font-weight:800;letter-spacing:1px;">TOTO</span>':""}\n            ${t?'<span style="font-size:0.48rem;background:rgba(255,80,80,0.12);border:1px solid rgba(255,80,80,0.3);color:rgba(255,100,100,0.9);padding:1px 7px;border-radius:20px;font-weight:800;letter-spacing:1px;">BLOKOVÁNO</span>':""}\n          </div>\n          <div style="font-size:0.58rem;color:rgba(255,255,255,0.28);margin-top:2px;font-family:monospace;">${e.id}</div>\n          <div style="font-size:0.55rem;color:rgba(255,255,255,0.2);margin-top:1px;">Naposledy: ${a}</div>\n        </div>\n        <div style="display:flex;gap:5px;">\n          ${t?`<button onclick="adminUnblockDevice('${e.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(80,250,123,0.1);border:1px solid rgba(80,250,123,0.25);color:#50fa7b;font-size:0.6rem;font-weight:700;cursor:pointer;">🔓 Odblokovat</button>`:o?"":`<button onclick="adminBlockDeviceById('${e.id}','${(e.name||"").replace(/'/g,"'")}','${e.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.22);color:rgba(255,100,100,0.7);font-size:0.6rem;font-weight:700;cursor:pointer;">🚫 Blokovat</button>`}\n          ${e.registered?`<button onclick="adminRemoveDevice('${e.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.35);font-size:0.6rem;cursor:pointer;">Odebrat</button>`:""}\n        </div>\n      </div>`
  }).join("") : e.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);padding:10px">Žádná zařízení</div>')
}

function adminBlockDeviceById(e, t, n) {
  if (!confirm(`Zablokovat zařízení "${t}"?\n\nID: ${e}\nToto zařízení nebude moci používat MůjFlix.`)) return;
  let o = safeLS(MF_BLOCKED_KEY, "[]");
  o.some(t => t.id === e) || o.push({
    id: e,
    name: t,
    blockedAt: Date.now()
  }), localStorage.setItem(MF_BLOCKED_KEY, JSON.stringify(o)), showToast?.("🚫 Zařízení zablokováno: " + t), adminRefreshDevices(), adminLog("Zařízení zablokováno: " + e + " (" + t + ")", "warn")
}

function adminBlockDevice() {
  const e = document.getElementById("adminBlockDeviceId")?.value?.trim(),
    t = document.getElementById("adminBlockDeviceName")?.value?.trim() || "Neznámé";
  e ? (adminBlockDeviceById(e, t, e), document.getElementById("adminBlockDeviceId") && (document.getElementById("adminBlockDeviceId").value = ""), document.getElementById("adminBlockDeviceName") && (document.getElementById("adminBlockDeviceName").value = "")) : showToast?.("❌ Zadej Device ID")
}

function adminUnblockDevice(e) {
  let t = safeLS(MF_BLOCKED_KEY, "[]");
  t = t.filter(t => t.id !== e), localStorage.setItem(MF_BLOCKED_KEY, JSON.stringify(t)), showToast?.("🔓 Zařízení odblokováno"), adminRefreshDevices(), adminLog("Zařízení odblokováno: " + e, "ok")
}

function adminRemoveDevice(e) {
  if (!confirm("Odebrat záznam o zařízení?")) return;
  let t = safeLS(MF_DEVICES_REG_KEY, "[]");
  t = t.filter(t => t.id !== e), localStorage.setItem(MF_DEVICES_REG_KEY, JSON.stringify(t)), adminRefreshDevices()
}

function adminClearBlockedDevices() {
  confirm("Odblokovat všechna zařízení?") && (localStorage.removeItem(MF_BLOCKED_KEY), showToast?.("🔓 Všechna zařízení odblokována"), adminRefreshDevices(), adminLog("Všechna blokování smazána", "ok"))
}
const _origAdminRefresh = adminRefresh;
adminRefresh = function() {
    _origAdminRefresh(), adminLoadApiKeys(), adminRefreshDevices()
  },
  function() {
    try {
      const e = localStorage.getItem(MF_DEVICE_KEY);
      if (!e) return;
      if (safeLS(MF_BLOCKED_KEY, "[]").some(t => t.id === e)) return void(document.body.innerHTML = `<div style="position:fixed;inset:0;background:#060608;display:flex;align-items:center;justify-content:center;font-family:Outfit,sans-serif;"><div style="text-align:center;max-width:400px;padding:40px;"><div style="font-size:3rem;margin-bottom:20px;">🚫</div><div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1.4rem;font-weight:900;margin-bottom:10px;color:#fff;">Přístup zamítnut</div><div style="font-size:0.82rem;color:rgba(255,255,255,0.4);line-height:1.6;">Toto zařízení bylo zablokováno administrátorem. Kontaktuj správce aplikace pro obnovení přístupu.</div><div style="margin-top:16px;font-size:0.6rem;color:rgba(255,255,255,0.2);font-family:monospace;">Device ID: ${e}</div></div></div>`)
    } catch (e) {}
  }();
try {
  const e = safeLS("mf_broadcast_msg", "null");
  e && Date.now() - e.ts < 6048e5 && setTimeout(() => showToast?.("📣 " + e.text), 3e3)
} catch {}
const STREAK_KEY = "mf_streak_v1",
  STREAK_TODAY_KEY = "mf_streak_today_v1";

function getStreakData() {
  try {
    return safeLS(STREAK_KEY, '{"streak":0,"lastDate":null}')
  } catch {
    return {
      streak: 0,
      lastDate: null
    }
  }
}

function saveStreakData(e) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(e))
}

function getTodayKey() {
  return (new Date).toISOString().slice(0, 10)
}

function getTodayEpCount() {
  try {
    return safeLS(STREAK_TODAY_KEY, "{}")[getTodayKey()] || 0
  } catch {
    return 0
  }
}

function incrementTodayEp() {
  try {
    const e = getTodayKey();
    let t = safeLS(STREAK_TODAY_KEY, "{}");
    const n = Object.keys(t).sort();
    for (; n.length > 7;) delete t[n.shift()];
    t[e] = (t[e] || 0) + 1, localStorage.setItem(STREAK_TODAY_KEY, JSON.stringify(t)), updateStreak()
  } catch {}
}

function updateStreak() {
  const e = getTodayKey();
  let t = getStreakData();
  const n = new Date;
  n.setDate(n.getDate() - 1);
  const o = n.toISOString().slice(0, 10),
    i = getTodayEpCount();
  i > 0 && (t.lastDate === e || (t.lastDate === o ? (t.streak += 1, t.lastDate = e, saveStreakData(t)) : (t.lastDate, t.streak = 1, t.lastDate = e, saveStreakData(t))));
  const a = t.streak || 0,
    s = document.getElementById("streakWidget"),
    r = document.getElementById("streakCount"),
    l = document.getElementById("streakTodayCount"),
    c = document.getElementById("streakFire");
  r && (r.textContent = a), l && (l.textContent = i), c && (c.textContent = a >= 30 ? "💥" : a >= 14 || a >= 7 ? "🔥" : a >= 3 ? "✨" : "⭐"), s && (a >= 1 || i > 0 ? s.classList.add("visible") : s.classList.remove("visible"))
}

function openMoodPicker() {
  const e = document.getElementById("moodOverlay");
  if (!e) return;
  document.querySelectorAll(".mood-btn").forEach(e => e.classList.remove("selected"));
  const t = document.getElementById("moodResultSection");
  t && t.classList.remove("visible"), e.classList.add("open")
}

function closeMoodPicker() {
  const e = document.getElementById("moodOverlay");
  e && e.classList.remove("open")
}! function() {
  const e = window.markWatched;
  "function" == typeof e && (window.markWatched = function(...t) {
    e.apply(this, t), incrementTodayEp()
  });
  const t = window.toggleWatched;
  "function" == typeof t && (window.toggleWatched = function(...e) {
    const n = t.apply(this, e);
    return setTimeout(updateStreak, 50), n
  })
}(), setTimeout(() => {
  updateStreak()
}, 1200), document.getElementById("moodOverlay")?.addEventListener("click", function(e) {
  e.target === this && closeMoodPicker()
});
const moodConfig = {
  relax: {
    slugs: ["futurama", "the-simpsons"],
    label: "Klidná epizoda"
  },
  fun: {
    slugs: ["family-guy", "south-park", "the-simpsons"],
    label: "Smíchy"
  },
  adventure: {
    slugs: ["futurama", "south-park"],
    label: "Dobrodružství"
  },
  nostalgia: {
    slugs: ["the-simpsons", "futurama", "breaking-bad"],
    label: "Klasika"
  },
  random: {
    slugs: ["the-simpsons", "family-guy", "south-park", "futurama", "breaking-bad"],
    label: "Překvapení"
  },
  binge: {
    slugs: ["the-simpsons", "family-guy", "south-park", "futurama", "breaking-bad"],
    label: "Maratonská epizoda"
  }
};

function selectMood(e) {
  document.querySelectorAll(".mood-btn").forEach(e => e.classList.remove("selected"));
  const t = document.querySelector(`[data-mood="${e}"]`);
  t && t.classList.add("selected");
  const n = moodConfig[e] || moodConfig.random,
    o = n.slugs,
    i = [],
    a = new Set;
  for (let t = 0; t < 40 && i.length < 2; t++) {
    const t = o[Math.floor(Math.random() * o.length)];
    if (!window.db || !window.db[t]) continue;
    const n = window.db[t],
      s = "function" == typeof window.totalSeasons ? window.totalSeasons(t) : n.seasons?.length || 1;
    if (!s) continue;
    const r = Math.ceil(Math.random() * Math.min(s, "nostalgia" === e ? 4 : s)),
      l = "function" == typeof window.epsInSeason ? window.epsInSeason(t, r) : 10;
    if (!l) continue;
    const c = Math.ceil(Math.random() * l),
      d = `${t}-S${r}-E${c}`;
    a.has(d) || (a.add(d), i.push({
      slug: t,
      se: r,
      ep: c,
      name: n.name,
      poster: n._poster || n.poster
    }))
  }
  const s = document.getElementById("moodResultCards"),
    r = document.getElementById("moodResultSection");
  if (s && r) {
    if (0 === i.length) return s.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:0.72rem;">Nastav TMDB klíč pro lepší doporučení 🎬</div>', void r.classList.add("visible");
    s.innerHTML = i.map(e => `\n      <div class="mood-ep-card" onclick="closeMoodPicker();openSeries('${e.slug}');setTimeout(()=>{activeSeason=${e.se};showAllSeasons=false;renderSeasons&&renderSeasons();renderEpisodes&&renderEpisodes();setTimeout(()=>{const c=document.getElementById('card-${e.slug}-S${e.se}-E${e.ep}');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},200);},350)">\n        <img class="mood-ep-thumb" loading="lazy" src="${e.poster||""}" alt="${e.name}" onerror="this.style.background='#111'">\n        <div class="mood-ep-info">\n          <div class="mood-ep-show">${e.name}</div>\n          <div class="mood-ep-title">Série ${e.se}, Epizoda ${e.ep}</div>\n          <div class="mood-ep-meta">${n.label}</div>\n        </div>\n        <div class="mood-play-icon">▶</div>\n      </div>\n    `).join(""), r.classList.add("visible"), showToast?.("🎭 " + n.label + " — vybráno!")
  }
}
let _timerInterval = null,
  _timerRemaining = 0,
  _timerTotal = 0,
  _timerPanelOpen = !1,
  _selectedPreset = null;

function toggleTimerPanel() {
  _timerPanelOpen = !_timerPanelOpen;
  const e = document.getElementById("timerPanel");
  e && e.classList.toggle("open", _timerPanelOpen)
}

function setTimerPreset(e) {
  _selectedPreset = e, _timerTotal = 60 * e, _timerRemaining = _timerTotal, updateTimerDisplay(_timerRemaining), document.querySelectorAll(".timer-preset-btn").forEach(t => {
    t.classList.toggle("active", parseInt(t.dataset.min) === e)
  })
}

function updateTimerDisplay(e) {
  const t = Math.floor(e / 60),
    n = e % 60,
    o = `${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`,
    i = document.getElementById("timerDisplay"),
    a = document.getElementById("timerFabLabel");
  i && (i.textContent = o), a && (a.textContent = o);
  const s = document.getElementById("timerFab");
  if (s && _timerTotal > 0) {
    const t = (_timerTotal - e) / _timerTotal * 100;
    s.style.background = `conic-gradient(rgba(0,122,255,0.35) ${t}%, rgba(8,8,14,0.92) ${t}%)`
  }
}

function startTimer() {
  if (!_selectedPreset) return void showToast?.("⏱ Zvol délku sledování");
  _timerInterval && clearInterval(_timerInterval);
  const e = document.getElementById("timerStartBtn"),
    t = document.getElementById("timerStopBtn"),
    n = document.getElementById("timerFab");
  e && (e.textContent = "⏸ Běží…"), t && t.classList.add("visible"), n && n.classList.add("active"), showToast?.(`⏱ Časovač spuštěn — ${_selectedPreset} min`), _timerInterval = setInterval(() => {
    _timerRemaining--, updateTimerDisplay(_timerRemaining), _timerRemaining <= 0 && (clearInterval(_timerInterval), _timerInterval = null, timerFinished())
  }, 1e3)
}

function stopTimer() {
  _timerInterval && (clearInterval(_timerInterval), _timerInterval = null);
  const e = document.getElementById("timerStartBtn"),
    t = document.getElementById("timerStopBtn"),
    n = document.getElementById("timerFab");
  e && (e.textContent = "▶ Start"), t && t.classList.remove("visible"), n && (n.classList.remove("active"), n.style.background = ""), _timerRemaining = _selectedPreset ? 60 * _selectedPreset : 0, updateTimerDisplay(_timerRemaining), showToast?.("⏱ Časovač zastaven")
}

function timerFinished() {
  const e = document.getElementById("timerFab"),
    t = document.getElementById("timerStartBtn"),
    n = document.getElementById("timerStopBtn");
  e && (e.classList.remove("active"), e.style.background = ""), t && (t.textContent = "▶ Start"), n && n.classList.remove("visible"), showToast?.("⏱ Čas sledování vypršel! 🎬", "success"), Notification && "granted" === Notification.permission && new Notification("MůjFlix ⏱", {
    body: "Čas sledování vypršel!",
    icon: "LOGO.png"
  });
  const o = document.getElementById("timerFab");
  o && (o.style.animation = "none", o.style.boxShadow = "0 0 0 0 rgba(0,122,255,0.8)", o.style.transition = "box-shadow 0s", setTimeout(() => {
    o.style.boxShadow = "0 0 0 30px rgba(0,122,255,0)", o.style.transition = "box-shadow 0.8s ease"
  }, 10))
}

function openSyncModal() {
  const e = document.getElementById("syncModal");
  if (!e) return;
  e.classList.add("open"), _updateSyncModalStatus();
  const t = localStorage.getItem("mf_sync_group") || "",
    n = document.getElementById("syncGroupInput");
  n && (n.value = t);
  const o = document.getElementById("syncFirebaseWarn"),
    i = document.getElementById("syncFbSetupBtn");
  if (o || i) {
    const e = window.MFSync && window.MFSync._db;
    o && (o.style.display = e ? "none" : "block"), i && (i.style.display = e ? "none" : "block")
  }
}

function closeSyncModal() {
  const e = document.getElementById("syncModal");
  e && e.classList.remove("open")
}

function _updateSyncModalStatus() {
  const e = window._mfSyncStatus || "offline",
    t = document.getElementById("syncModalDot"),
    n = document.getElementById("syncModalText"),
    o = document.getElementById("syncDisconnectBtn"),
    i = localStorage.getItem("mf_sync_group");
  t && (t.className = "sync-status-dot", "online" === e ? t.classList.add("online") : "syncing" === e ? t.classList.add("syncing") : "error" === e && t.classList.add("error"));
  const a = {
    online: i ? `✓ Připojeno ke skupině: ${i}` : "Připojeno (bez skupiny)",
    syncing: "Synchronizuji…",
    offline: "Offline — Firebase není nastaven",
    error: "Chyba připojení — zkontroluj Firebase config",
    "no-group": "Firebase OK — zadej kód skupiny pro sync"
  };
  n && (n.textContent = a[e] || e), o && (o.style.display = i ? "block" : "none")
}

function syncGenerateCode() {
  const e = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let t = "";
  for (let n = 0; n < 8; n++) t += e[Math.floor(32 * Math.random())];
  const n = document.getElementById("syncGroupInput");
  n && (n.value = t)
}

function syncConnect() {
  const e = document.getElementById("syncGroupInput"),
    t = (e?.value || "").trim().replace(/\s/g, "").toUpperCase();
  if (!t || t.length < 4) return e && (e.style.borderColor = "rgba(255,80,80,0.5)", e.focus()), void showToast?.("⚠️ Zadej platný kód skupiny (min. 4 znaky)", "error");
  window.MFSync && "function" == typeof window.MFSync.connectGroup ? (window.MFSync.connectGroup(t), setTimeout(() => window.MFSync.pushData(), 500), closeSyncModal(), showToast?.("☁️ Připojeno ke skupině " + t + "!", "success")) : showToast?.("⚠️ Firebase není nastaven v kódu — vyplň FIREBASE_CONFIG", "error")
}

function syncDisconnect() {
  window.MFSync && "function" == typeof window.MFSync.disconnect && window.MFSync.disconnect(), _updateSyncModalStatus(), showToast?.("☁️ Sync odpojen", "success")
}

function setDockActive(e) {
  document.querySelectorAll(".dock-btn").forEach(e => e.classList.remove("active"));
  const t = document.getElementById(e);
  t && (t.classList.add("active"), t.style.transform = "scale(0.88) translateZ(0)", requestAnimationFrame(() => requestAnimationFrame(() => {
    t.style.transition = "transform 0.38s cubic-bezier(0.34,1.5,0.64,1)", t.style.transform = "", setTimeout(() => {
      t.style.transition = ""
    }, 400)
  })))
}

function closeDockOverlays() {
  "function" == typeof closeModal && closeModal(), "function" == typeof closeWatchlist && document.getElementById("watchlistOverlay")?.classList.contains("open") && closeWatchlist(), setDockActive("dockHome")
}

function openDockMore() {
  const e = document.getElementById("dockMoreSheet"),
    t = document.getElementById("dockMoreBg");
  e && (e.style.display = "block", e.style.visibility = "visible", e.offsetHeight, e.style.transform = "translateY(0)"), t && (t.style.background = "rgba(0,0,0,0.5)", t.style.pointerEvents = "auto"), setDockActive("dockMore");
  const n = document.getElementById("sheetPremiereBadge"),
    o = document.getElementById("premiereFabBadge");
  if (n && o) {
    const e = parseInt(o.textContent) || 0;
    e > 0 && (n.textContent = e + " nových", n.style.display = "inline")
  }
}

function closeDockMore() {
  const e = document.getElementById("dockMoreSheet"),
    t = document.getElementById("dockMoreBg");
  e && (e.style.transform = "translateY(100%)", setTimeout(() => {
    "translateY(100%)" === e.style.transform && (e.style.visibility = "hidden")
  }, 400)), t && (t.style.background = "rgba(0,0,0,0)", t.style.pointerEvents = "none");
  setDockActive({
    serialy: "dockHome",
    filmy: "dockFilmy",
    protebe: "dockProtebe"
  } [window._mfCurrentSection || "serialy"] || "dockHome")
}

function _syncDockBadges() {
  const e = document.getElementById("watchlistFabBadge"),
    t = document.getElementById("dockWatchlistBadge");
  if (e && t) {
    const n = parseInt(e.textContent) || 0;
    t.textContent = n > 0 ? n : "", t.classList.toggle("visible", n > 0)
  }
  const n = document.getElementById("notifBellBadge"),
    o = document.getElementById("hdrNotifBadge");
  if (o) {
    const e = n && "" !== n.textContent.trim() && "none" !== n.style.display;
    o.textContent = e ? "!" : "", o.classList.toggle("visible", e)
  }
  const i = document.getElementById("hdrSyncDot");
  if (i) {
    const e = window._mfSyncStatus || "offline";
    i.className = "mf-sync-dot", "online" === e ? i.classList.add("online") : "syncing" === e ? i.classList.add("syncing") : "error" === e && i.classList.add("error")
  }
  const a = document.getElementById("hdrTimerBtn");
  a && window._timerInterval ? a.classList.add("active-btn") : a && a.classList.remove("active-btn")
}
setTimerPreset(45), document.addEventListener("keydown", function(e) {
    if ("INPUT" === e.target.tagName || "TEXTAREA" === e.target.tagName) return;
    const t = document.getElementById("seriesModal"),
      n = t && t.classList.contains("open");
    "M" !== e.key && "m" !== e.key || n || (e.preventDefault(), openMoodPicker()), "T" !== e.key && "t" !== e.key || n || (e.preventDefault(), toggleTimerPanel())
  }), setTimeout(() => {
    Notification && Notification.permission
  }, 5e3),
  function() {
    const e = window.openWithCopy;
    "function" == typeof e && (window.openWithCopy = function(...t) {
      return incrementTodayEp(), e.apply(this, t)
    });
    const t = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(e, n) {
      t(e, n), e && e.includes("watched") && setTimeout(updateStreak, 100), e && (e.startsWith("mf_") || e.startsWith("watched_") || e.startsWith("watchlist") || e.startsWith("streak")) && (clearTimeout(window._mfSyncDebounce), window._mfSyncDebounce = setTimeout(() => {
        window.MFSync && "function" == typeof window.MFSync.pushData && window.MFSync.pushData()
      }, 2500))
    }
  }(), document.getElementById("syncModal")?.addEventListener("click", function(e) {
    e.target === this && closeSyncModal()
  });
const _origOpenWatchlist = window.openWatchlist;
"function" == typeof _origOpenWatchlist && (window.openWatchlist = function(...e) {
  return setDockActive("dockProtebe"), _origOpenWatchlist.apply(this, e)
});
const _origCloseWatchlist = window.closeWatchlist;

function triggerPwaInstall() {
  window._pwaInstallPrompt ? (window._pwaInstallPrompt.prompt(), window._pwaInstallPrompt.userChoice.then(({
    outcome: e
  }) => {
    if ("accepted" === e) {
      const e = document.getElementById("pwaInstallBtn");
      e && (e.style.display = "none"), showToast("✅ MůjFlix nainstalován!", "success")
    }
    window._pwaInstallPrompt = null
  })) : showToast("ℹ️ Instalace není k dispozici — otevři MůjFlix v prohlížeči (ne jako PWA)", "info")
}
"function" == typeof _origCloseWatchlist && (window.closeWatchlist = function(...e) {
    return setDockActive("dockHome"), _origCloseWatchlist.apply(this, e)
  }), setInterval(_syncDockBadges, 2e3), setTimeout(_syncDockBadges, 500), window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(), window._pwaInstallPrompt = e;
    const t = document.getElementById("pwaInstallBtn");
    t && (t.style.display = "flex", t.onclick = async () => {
      if (!window._pwaInstallPrompt) return;
      window._pwaInstallPrompt.prompt();
      const {
        outcome: e
      } = await window._pwaInstallPrompt.userChoice;
      "accepted" === e && (t.style.display = "none", "function" == typeof showToast && showToast("✅ MůjFlix nainstalován!", "success")), window._pwaInstallPrompt = null
    })
  }), window.addEventListener("appinstalled", () => {
    const e = document.getElementById("pwaInstallBtn");
    e && (e.style.display = "none"), "function" == typeof showToast && showToast("✅ MůjFlix nainstalován!", "success")
  }),
  function() {
    function e() {
      const e = document.getElementById("streakCount"),
        t = document.getElementById("hdrStreakDays");
      if (t)
        if (e && e.textContent) t.textContent = e.textContent || "0";
        else try {
          const e = safeLS("mf_streak", "{}");
          t.textContent = e.current || e.count || "0"
        } catch (e) {
          t.textContent = "0"
        }
    }
    e(), setInterval(e, 3e3), document.addEventListener("mf-streak-update", e)
  }(),
  function() {
    const e = "mf_ep_ratings",
      t = ["", "Katastrofa 😬", "Ujde to 😐", "Dobrá 👍", "Výborná 🔥", "Masterpiece 🏆"];
    let n = null,
      o = 0;

    function i() {
      try {
        return safeLS(e, "{}")
      } catch {
        return {}
      }
    }

    function a(e) {
      document.querySelectorAll(".er-star").forEach((t, n) => {
        t.classList.toggle("active", n < e)
      });
      const n = document.getElementById("erLabel"),
        o = document.getElementById("erSaveBtn");
      e > 0 ? (n.textContent = t[e], n.classList.add("rated"), o.classList.add("enabled")) : (n.textContent = "Jak se ti epizoda líbila?", n.classList.remove("rated"), o.classList.remove("enabled"))
    }

    function s(e, t) {
      const n = document.getElementById("card-" + e);
      if (!n) return;
      let o = n.querySelector(".ep-user-rating");
      if (t > 0) {
        if (!o) {
          o = document.createElement("span"), o.className = "ep-user-rating", o.title = "Moje hodnocení — klikni pro změnu", o.onclick = t => {
            t.stopPropagation(), l(e)
          };
          const t = n.querySelector(".ep-meta-row");
          t && t.appendChild(o)
        }
        o.innerHTML = '<span class="er-star-mini">⭐</span> ' + t + "/5"
      } else o && o.remove()
    }

    function r(e) {
      const t = document.getElementById("panelRatingSummary"),
        n = document.getElementById("panelRatingAvg"),
        o = document.getElementById("panelRatingCount");
      if (!t || !n || !o) return;
      const a = i(),
        s = Object.entries(a).filter(([t]) => t.startsWith(e + "-")).map(([, e]) => e);
      if (0 === s.length) return void(t.style.display = "none");
      const r = (s.reduce((e, t) => e + t, 0) / s.length).toFixed(1),
        l = "⭐".repeat(Math.round(parseFloat(r)));
      n.textContent = l + " " + r + "/5", o.textContent = "(" + s.length + " hodnocení)", t.style.display = "flex"
    }

    function l(e) {
      const t = e.split("-"),
        n = t.slice(0, t.length - 2).join("-"),
        o = (void 0 !== db && db[n] ? db[n] : {}).name || n,
        i = parseInt((t[t.length - 2] || "S1").replace("S", "")) || 1,
        a = parseInt((t[t.length - 1] || "E1").replace("E", "")) || 1;
      openEpRating(e, o, "S" + i + " · E" + a, getEpRating(e))
    }
    window.getEpRating = function(e) {
      return i()[e] || 0
    }, window.saveEpRating = function() {
      if (!o || !n) return;
      const t = i();
      t[n] = o,
        function(t) {
          localStorage.setItem(e, JSON.stringify(t))
        }(t);
      const a = n,
        l = o;
      closeEpRating(!0), s(a, l), "function" == typeof showToast && showToast("⭐ Hodnocení uloženo"), void 0 !== activeSeries && r(activeSeries);
      if (typeof aiBrain !== "undefined" && typeof db !== "undefined") {
        const parts = a.split("-"),
          epSlug = parts.slice(0, parts.length - 2).join("-"),
          show = db[epSlug];
        if (show?._genres) {
          const weight = { 1: -.15, 2: -.05, 3: 0, 4: .1, 5: .2 }[l] || 0;
          weight && aiBrain.boostGenresFromTmdb(show._genres, weight)
        }
      }
    }, window.openEpRating = function(e, t, i, s) {
      n = e, o = s || 0, document.getElementById("erSeriesName").textContent = t || "", document.getElementById("erEpName").textContent = i || e, a(o);
      const r = document.getElementById("epRatingOverlay");
      r.style.display = "flex", requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add("open")))
    }, window.closeEpRating = function(e) {
      const t = document.getElementById("epRatingOverlay");
      t.classList.remove("open"), setTimeout(() => {
        t.style.display = "none"
      }, 360), e || (o = 0), n = null
    }, document.addEventListener("DOMContentLoaded", function() {
      document.querySelectorAll(".er-star").forEach(e => {
        const t = parseInt(e.dataset.v);
        e.addEventListener("mouseenter", () => a(t)), e.addEventListener("mouseleave", () => a(o)), e.addEventListener("click", () => {
          o = o === t ? 0 : t, a(o), e.classList.remove("bounce"), e.offsetWidth, e.classList.add("bounce"), setTimeout(() => e.classList.remove("bounce"), 300)
        }), e.addEventListener("touchend", e => {
          e.preventDefault(), o = o === t ? 0 : t, a(o)
        }, {
          passive: !1
        })
      })
    }), window._refreshPanelRatingSummary = r, window._epRatingRefreshCard = s, window._epRatingOpenFromCard = l, window._epRatingRefreshPanel = r
  }(),
  function() {
    const e = localStorage.setItem.bind(localStorage);
    let t = null;

    function n() {
      const e = [".wrapped-overlay.open", "#ai-voice-bubble-overlay.open", ".premiere-overlay.open", ".collections-overlay.open", ".trakt-overlay.open", ".voice-cmd-overlay.open", ".mood-overlay.open", ".universe-overlay.open", ".genre-editor-overlay.open", "#epRatingOverlay.open", "#syncOverlay.open", "#voiceCmdOverlay.open", "#syncModal.open", ".pm-overlay.open", ".watchlist-overlay.open"].some(e => !!document.querySelector(e));
      document.body.classList.toggle("modal-open", e)
    }
    localStorage.setItem = function(n, o) {
      e(n, o), (n.startsWith("mf_") || n.startsWith("watched_") || n.startsWith("watchlist") || n.startsWith("streak") || n.startsWith("aiMem")) && (clearTimeout(t), t = setTimeout(() => {
        window.MFSync && window.MFSync._db && window.MFSync._syncRef && window.MFSync.pushData()
      }, 1500))
    }, window.refreshUserContent = window.refreshUserContent || function() {
      void 0 !== db && Object.keys(db).forEach(e => {
        "function" == typeof updateTileProgress && updateTileProgress(e), "function" == typeof updateContinueBadge && updateContinueBadge(e)
      }), "function" == typeof updateContinueWidget && updateContinueWidget(), "function" == typeof updateLogoProgress && updateLogoProgress(), "function" == typeof updateWatchlistBadge && updateWatchlistBadge(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns()
    }, document.addEventListener("DOMContentLoaded", () => {
      new MutationObserver(n).observe(document.body, {
        subtree: !0,
        attributes: !0,
        attributeFilter: ["class", "style"]
      }), n()
    })
  }();
const _APK_KEYS = [{
  id: "mf_gemini_key",
  label: "✦ Gemini API Key",
  placeholder: "AIza...",
  type: "password"
}, {
  id: "mf_or_key",
  label: "↻ OpenRouter Key",
  placeholder: "sk-or-...",
  type: "password"
}, {
  id: "mf_groq_key",
  label: "⚡ Groq Key",
  placeholder: "gsk_...",
  type: "password"
}, {
  id: "mf_jina_key",
  label: "👁 Jina Key",
  placeholder: "jina_...",
  type: "password"
}, {
  id: "mf_tavily_key",
  label: "🌐 Tavily Key",
  placeholder: "tvly-...",
  type: "password"
}, {
  id: "mf_tmdb_key",
  label: "🎬 TMDB Key",
  placeholder: "TMDB API key...",
  type: "text"
}, {
  id: "mf_trakt_client_id",
  label: "📡 Trakt Client ID",
  placeholder: "Trakt client ID...",
  type: "text"
}];
let _apkCurrentProfileId = null,
  _apkCurrentProfileName = "";

function adminOpenProfileApiKeys(e) {
  try {
    const t = safeLS("mf_profiles_v2", "[]")[e];
    if (!t) return;
    _apkCurrentProfileId = t.id, _apkCurrentProfileName = t.name, document.getElementById("apkProfileName").textContent = t.name;
    const n = document.getElementById("apkKeyRows");
    n.innerHTML = "", _APK_KEYS.forEach(e => {
      const o = e.id + "_" + t.id,
        i = e.id,
        a = localStorage.getItem(o) || localStorage.getItem(i) || "",
        s = document.createElement("div");
      s.className = "apk-key-item", s.innerHTML = `\n        <div class="apk-key-label">${e.label}</div>\n        <div class="apk-key-input-row">\n          <input \n            class="apk-key-input" \n            id="apk_input_${e.id}"\n            type="${e.type}" \n            placeholder="${e.placeholder}"\n            value="${a?"••••••••••••":""}"\n            data-key="${o}"\n            data-has-value="${a?"1":"0"}"\n            onfocus="if(this.dataset.hasValue==='1'&&this.value==='••••••••••••'){this.value='';this.dataset.hasValue='0';}"\n          >\n          <button class="apk-save-btn" onclick="_apkSaveKey('${e.id}','${o}','${t.id}')">Uložit</button>\n          <button class="apk-clear-btn" onclick="_apkClearKey('${o}','${e.id}','${t.id}')">🗑</button>\n        </div>\n        <div class="apk-status" id="apk_status_${e.id}">✓ Uloženo</div>\n      `, n.appendChild(s)
    }), document.getElementById("adminProfileApiModal").classList.add("open")
  } catch (e) {
    console.error("adminOpenProfileApiKeys error:", e)
  }
}

function _apkSaveKey(e, t, n) {
  const o = document.getElementById("apk_input_" + e);
  if (!o) return;
  const i = o.value.trim();
  if (!i || "••••••••••••" === i) return void("function" == typeof showToast && showToast("⚠ Zadej hodnotu klíče"));
  localStorage.setItem(t, i);
  n === localStorage.getItem("mf_active_pid") && localStorage.setItem(e, i);
  const a = document.getElementById("apk_status_" + e);
  a && (a.style.display = "block", setTimeout(() => a.style.display = "none", 2e3)), o.value = "••••••••••••", o.dataset.hasValue = "1", "function" == typeof showToast && showToast("✓ Klíč uložen pro profil " + _apkCurrentProfileName)
}

function _apkClearKey(e, t, n) {
  if (!confirm("Smazat tento API klíč?")) return;
  localStorage.removeItem(e);
  n === localStorage.getItem("mf_active_pid") && localStorage.removeItem(t);
  const o = document.getElementById("apk_input_" + t);
  o && (o.value = "", o.dataset.hasValue = "0"), "function" == typeof showToast && showToast("🗑 Klíč smazán")
}

function _apkClose() {
  document.getElementById("adminProfileApiModal").classList.remove("open"), _apkCurrentProfileId = null
}! function() {
  window.adminLoadProfiles;
  window.adminLoadProfiles = function() {
    const e = document.getElementById("adminProfilesList");
    if (!e) return;
    let t = [];
    try {
      t = safeLS("mf_profiles_v2", "[]")
    } catch (e) {}
    t.length ? e.innerHTML = t.map((e, t) => {
      const n = _APK_KEYS.filter(t => !!localStorage.getItem(t.id + "_" + e.id) || !!localStorage.getItem(t.id)).length;
      return `\n      <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">\n        <div style="width:40px;height:40px;border-radius:50%;background:${e.color||"#333"};display:flex;align-items:center;justify-content:center;font-size:${e.avatarUrl?"0":" 1.2"}rem;flex-shrink:0;overflow:hidden;">\n          ${e.avatarUrl?`<img src="${e.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" alt="">`:e.avatar||"🎬"}\n        </div>\n        <div style="flex:1;min-width:0;">\n          <div style="font-size:0.85rem;font-weight:700;">${e.name||"Profil "+(t+1)}</div>\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-top:2px;">\n            PIN: ${e.pin?"••••":"—"} · Barva: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${e.color||"#888"};vertical-align:middle;"></span>\n            ${e.traktToken?" · Trakt ✓":""} · 🔑 ${n}/${_APK_KEYS.length} klíčů\n          </div>\n        </div>\n        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">\n          <button onclick="adminOpenProfileApiKeys(${t})" style="padding:6px 12px;border-radius:8px;background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.2);color:rgba(255,200,0,0.8);font-size:0.62rem;font-weight:700;cursor:pointer;">🔑 API</button>\n          <button onclick="adminEditProfile(${t})" style="padding:6px 12px;border-radius:8px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);color:rgba(0,122,255,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">✏ Upravit</button>\n          <button onclick="adminDeleteProfile(${t})" style="padding:6px 12px;border-radius:8px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,100,100,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">🗑</button>\n        </div>\n      </div>`
    }).join("") : e.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Žádné profily</div>'
  }
}();
const _origAdminOpenPanel = window.adminOpenPanel;
window.adminOpenPanel = function() {
  _origAdminOpenPanel && _origAdminOpenPanel(), setTimeout(() => {
    "function" == typeof window.adminLoadProfiles && window.adminLoadProfiles()
  }, 100)
};
let _tmdbAvSelectedUrl = null,
  _tmdbAvSelectedName = null,
  _tmdbAvCallback = null,
  _tmdbAvMode = "person";
window._tmdbSetTab = function(e) {
  _tmdbAvMode = e, document.getElementById("tmdbTabPerson").classList.toggle("active", "person" === e), document.getElementById("tmdbTabMovie").classList.toggle("active", "movie" === e);
  const t = document.getElementById("tmdbAvHint"),
    n = document.getElementById("tmdbAvInput");
  "person" === e ? (t && (t.textContent = "Vyhledej herce, režiséra nebo jakoukoli osobnost z TMDB."), n && (n.placeholder = "Jméno herce nebo osobnosti…")) : (t && (t.textContent = "Vyhledej film nebo seriál a použij jeho poster jako avatar."), n && (n.placeholder = "Název filmu nebo seriálu…")), document.getElementById("tmdbAvGrid").innerHTML = '<div class="tmdb-av-loading">Zadej název a hledej…</div>'
}, window._tmdbAvOpen = function(e) {
  _tmdbAvCallback = e, _tmdbAvSelectedUrl = null, _tmdbAvSelectedName = null, document.getElementById("tmdbAvInput").value = "", document.getElementById("tmdbAvGrid").innerHTML = '<div class="tmdb-av-loading">Zadej jméno a hledej…</div>', document.getElementById("tmdbAvatarModal").classList.add("open"), setTimeout(() => document.getElementById("tmdbAvInput").focus(), 100)
}, window._tmdbAvClose = function() {
  document.getElementById("tmdbAvatarModal").classList.remove("open"), _tmdbAvCallback = null
}, window._tmdbAvSearch = async function() {
    const e = document.getElementById("tmdbAvInput").value.trim();
    if (!e) return;
    const t = document.getElementById("tmdbAvGrid");
    t.innerHTML = '<div class="tmdb-av-loading">🔍 Hledám…</div>';
    const n = localStorage.getItem("mf_tmdb_key") || (() => {
      const e = localStorage.getItem("mf_active_pid");
      return e ? localStorage.getItem("mf_tmdb_key_" + e) : null
    })() || "";
    if (n) try {
      let o = [];
      if ("person" === _tmdbAvMode) {
        const t = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${n}&query=${encodeURIComponent(e)}&language=cs&page=1`);
        o = ((await t.json()).results || []).filter(e => e.profile_path).slice(0, 20).map(e => ({
          imgPath: e.profile_path,
          name: e.name,
          size: "w185"
        }))
      } else {
        const [t, i] = await Promise.all([fetch(`https://api.themoviedb.org/3/search/movie?api_key=${n}&query=${encodeURIComponent(e)}&language=cs&page=1`), fetch(`https://api.themoviedb.org/3/search/tv?api_key=${n}&query=${encodeURIComponent(e)}&language=cs&page=1`)]), [a, s] = await Promise.all([t.json(), i.json()]), r = (a.results || []).filter(e => e.poster_path).slice(0, 10).map(e => ({
          imgPath: e.poster_path,
          name: e.title || e.name,
          size: "w342"
        })), l = (s.results || []).filter(e => e.poster_path).slice(0, 10).map(e => ({
          imgPath: e.poster_path,
          name: e.name,
          size: "w342"
        }));
        o = [...r, ...l].slice(0, 20)
      }
      if (!o.length) return void(t.innerHTML = '<div class="tmdb-av-loading">Žádné výsledky. Zkus jiný název.</div>');
      t.innerHTML = "", o.forEach(e => {
        const n = `https://image.tmdb.org/t/p/${e.size}${e.imgPath}`,
          o = document.createElement("div");
        o.className = "tmdb-av-item", o.dataset.url = n, o.dataset.name = e.name, o.innerHTML = `\n        <img class="tmdb-av-img" src="${n}" alt="${e.name}" loading="lazy" onerror="this.parentElement.remove()">\n        <span class="tmdb-av-name">${e.name}</span>\n      `, o.onclick = () => {
          document.querySelectorAll(".tmdb-av-item").forEach(e => e.classList.remove("selected")), o.classList.add("selected"), _tmdbAvSelectedUrl = n, _tmdbAvSelectedName = e.name
        }, t.appendChild(o)
      })
    } catch (e) {
      t.innerHTML = '<div class="tmdb-av-loading">⚠ Chyba při hledání: ' + e.message + "</div>"
    } else t.innerHTML = '<div class="tmdb-av-loading">⚠ Nastav TMDB API klíč v nastavení, aby šlo hledat.</div>'
  }, window._tmdbAvConfirm = function() {
    _tmdbAvSelectedUrl ? (_tmdbAvCallback && _tmdbAvCallback(_tmdbAvSelectedUrl, _tmdbAvSelectedName), _tmdbAvClose()) : "function" == typeof showToast && showToast("⚠ Vyber nejdřív obrázek")
  }, document.addEventListener("DOMContentLoaded", function() {
    if (!document.querySelector(".pc-box .pc-label")) return;
    const e = document.querySelectorAll(".pc-box .pc-label");
    let t = null;
    if (e.forEach(e => {
        "Avatar" === e.textContent.trim() && (t = e)
      }), !t) return;
    const n = document.createElement("button");
    n.className = "pc-tmdb-btn", n.textContent = "🎬 Vybrat foto z TMDB (herec/osobnost)", n.onclick = () => {
      window._tmdbAvOpen((e, t) => {
        ProfileGate._selectedAvatarUrl = e, ProfileGate._selectedAvatarName = t, document.querySelectorAll(".pc-emoji-btn").forEach(e => e.classList.remove("selected")), "function" == typeof showToast && showToast("✓ Obrázek z TMDB vybrán: " + t);
        let o = document.getElementById("pcTmdbPreview");
        o || (o = document.createElement("div"), o.id = "pcTmdbPreview", o.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);border-radius:11px;margin-top:6px;", n.insertAdjacentElement("afterend", o)), o.innerHTML = `\n          <img src="${e}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" alt="">\n          <span style="font-size:0.75rem;color:rgba(255,255,255,0.7);">${t}</span>\n          <button onclick="ProfileGate._selectedAvatarUrl=null;ProfileGate._selectedAvatarName=null;document.getElementById('pcTmdbPreview').remove();" style="margin-left:auto;background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:0.75rem;">✕ Zrušit</button>\n        `
      })
    }, document.getElementById("pcEmojiGrid") && t.insertAdjacentElement("afterend", n)
  }),
  function() {
    const e = ProfileGate.saveProfile.bind(ProfileGate);
    ProfileGate.saveProfile = function() {
      if (this._selectedAvatarUrl) {
        if (!(document.getElementById("pcName")?.value || "").trim()) return void e.call(this);
        this._editingId ? (e.call(this), setTimeout(() => {
          const e = _getProfiles(),
            t = e.findIndex(e => e.id === this._editingId);
          t >= 0 && (e[t].avatarUrl = this._selectedAvatarUrl, e[t].avatarTmdbName = this._selectedAvatarName, _saveProfiles(e), this.renderGate(), this.renderBadge()), this._selectedAvatarUrl = null, this._selectedAvatarName = null
        }, 50)) : (e.call(this), setTimeout(() => {
          const e = _getProfiles();
          if (e.length) {
            const t = e[e.length - 1];
            t.avatarUrl = this._selectedAvatarUrl, t.avatarTmdbName = this._selectedAvatarName, _saveProfiles(e), this.renderGate(), this.renderBadge()
          }
          this._selectedAvatarUrl = null, this._selectedAvatarName = null
        }, 50))
      } else e.call(this)
    }
  }(),
  function() {
    const e = ProfileGate.renderBadge.bind(ProfileGate);
    ProfileGate.renderBadge = function() {
      e.call(this);
      const t = "function" == typeof getActiveProfile ? getActiveProfile() : null;
      if (!t || !t.avatarUrl) return;
      const n = document.getElementById("mfProfileBadge");
      if (!n) return;
      const o = n.querySelector(".mpb-avatar");
      o && (o.innerHTML = `<img src="${t.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`)
    };
    const t = ProfileGate.renderGate.bind(ProfileGate);
    ProfileGate.renderGate = function() {
      t.call(this);
      const e = "function" == typeof _getProfiles ? _getProfiles() : [];
      document.querySelectorAll("#pgProfilesList .pg-profile-item").forEach((t, n) => {
        if (!e[n] || !e[n].avatarUrl) return;
        const o = t.querySelector(".pg-avatar");
        o && (o.innerHTML = `<img src="${e[n].avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="">`)
      })
    }
  }(),
  function() {
    const e = ProfileGate.openCreate.bind(ProfileGate);
    ProfileGate.openCreate = function(t) {
      e.call(this, t), this._selectedAvatarUrl = null, this._selectedAvatarName = null;
      const n = document.getElementById("pcTmdbPreview");
      if (n && n.remove(), t) {
        const e = ("function" == typeof _getProfiles ? _getProfiles() : []).find(e => e.id === t);
        e && e.avatarUrl && (this._selectedAvatarUrl = e.avatarUrl, this._selectedAvatarName = e.avatarTmdbName || "", setTimeout(() => {
          const t = document.querySelector(".pc-tmdb-btn");
          if (!t) return;
          let n = document.getElementById("pcTmdbPreview");
          n || (n = document.createElement("div"), n.id = "pcTmdbPreview", n.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);border-radius:11px;margin-top:6px;", t.insertAdjacentElement("afterend", n)), n.innerHTML = `\n            <img src="${e.avatarUrl}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" alt="">\n            <span style="font-size:0.75rem;color:rgba(255,255,255,0.7);">${e.avatarTmdbName||"TMDB obrázek"}</span>\n            <button onclick="ProfileGate._selectedAvatarUrl=null;ProfileGate._selectedAvatarName=null;document.getElementById('pcTmdbPreview').remove();" style="margin-left:auto;background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:0.75rem;">✕ Zrušit</button>\n          `
        }, 80))
      }
    }
  }(), document.addEventListener("keydown", function(e) {
    function t(e, t) {
      const n = e ? document.getElementById(e) : document.querySelector(t);
      return !!n && (n.classList.contains("open") || n.classList.contains("visible") || n.style.display && "none" !== n.style.display)
    }
    "Escape" === e.key && (t("adminProfileApiModal") ? _apkClose() : t("tmdbAvatarModal") ? _tmdbAvClose() : t("epRatingOverlay") ? "function" == typeof closeEpRating && closeEpRating(!1) : (t("syncModal") || t("syncOverlay")) && "function" == typeof closeSyncModal && closeSyncModal())
  }, {
    capture: !0
  }), document.getElementById("tmdbAvatarModal").addEventListener("click", function(e) {
    e.target === this && _tmdbAvClose()
  }), document.getElementById("adminProfileApiModal").addEventListener("click", function(e) {
    e.target === this && _apkClose()
  }), document.addEventListener("DOMContentLoaded", function() {
    void 0 !== ProfileGate && setTimeout(() => {
      ProfileGate.renderBadge(), ProfileGate.renderGate()
    }, 200)
  }), console.info("[MůjFlix Patch v3] ✓ Všechny opravy načteny: z-index fix, real-time sync, per-profil API klíče, TMDB avatary"),
  function() {
    function e() {
      const e = document.getElementById("aiFullscreen"),
        t = e && e.classList.contains("open"),
        n = document.querySelector(".pg-gate"),
        o = n && (n.classList.contains("visible") || "none" !== n.style.display);
      document.body.classList.toggle("mf-panel-open", !(!t && !o))
    }
    const t = new MutationObserver(e);
    document.addEventListener("DOMContentLoaded", () => {
      const n = document.getElementById("aiFullscreen");
      n && t.observe(n, {
        attributes: !0,
        attributeFilter: ["class", "style"]
      });
      const o = document.querySelector(".pg-gate");
      o && t.observe(o, {
        attributes: !0,
        attributeFilter: ["class", "style"]
      }), e()
    });
    window.closeAiPanel, window.openAiPanel;
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        if ("function" == typeof openAiPanel && !openAiPanel._patched) {
          const e = openAiPanel;
          window.openAiPanel = function() {
            e.apply(this, arguments), document.body.classList.add("mf-panel-open")
          }, window.openAiPanel._patched = !0
        }
        if ("function" == typeof closeAiPanel && !closeAiPanel._patched) {
          const e = closeAiPanel;
          window.closeAiPanel = function() {
            e.apply(this, arguments), setTimeout(() => {
              document.body.classList.remove("mf-panel-open")
            }, 290)
          }, window.closeAiPanel._patched = !0
        }
      }, 300)
    })
  }();
const _FB_LS = "mf_firebase_cfg";
window.openFirebaseCfgModal = function() {
  const e = document.getElementById("mfFbModal");
  if (!e) return;
  const t = function() {
    try {
      return safeLS(_FB_LS, "{}")
    } catch (e) {
      return {}
    }
  }();
  ["apiKey", "authDomain", "databaseURL", "projectId", "appId"].forEach(e => {
    const n = document.getElementById("fbI_" + e);
    n && t[e] && (n.value = t[e])
  });
  const n = document.getElementById("fbI_groupKey");
  n && (n.value = localStorage.getItem("mf_sync_group") || ""), document.getElementById("mfFbStatus").textContent = "", e.classList.add("open")
}, window.mfFbClose = function() {
  document.getElementById("mfFbModal")?.classList.remove("open")
}, window.mfFbGenKey = function() {
  const e = "mf-" + Math.random().toString(36).slice(2, 7) + "-" + Math.random().toString(36).slice(2, 5),
    t = document.getElementById("fbI_groupKey");
  t && (t.value = e)
}, window.mfFbSave = function() {
  const e = e => document.getElementById("fbI_" + e)?.value?.trim() || "",
    t = {
      apiKey: e("apiKey"),
      authDomain: e("authDomain"),
      databaseURL: e("databaseURL"),
      projectId: e("projectId"),
      appId: e("appId"),
      storageBucket: "",
      messagingSenderId: ""
    },
    n = e("groupKey"),
    o = document.getElementById("mfFbStatus");
  if (!t.apiKey || !t.databaseURL) return o.textContent = "⚠ Vyplň alespoň API Key a Database URL", void(o.style.color = "#e17055");
  localStorage.setItem(_FB_LS, JSON.stringify(t)), n && localStorage.setItem("mf_sync_group", n), o.textContent = "✓ Uloženo — stránka se obnoví pro aktivaci sync…", o.style.color = "#30d158", "function" == typeof showToast && showToast("🔥 Firebase nastaven! Obnovuji…", "success"), setTimeout(() => location.reload(), 1500)
}, document.getElementById("mfFbModal").addEventListener("click", function(e) {
  e.target === this && mfFbClose()
}), document.addEventListener("keydown", function(e) {
  if ("Escape" !== e.key) return;
  const t = document.getElementById("mfFbModal");
  t && t.classList.contains("open") && (e.stopImmediatePropagation(), mfFbClose())
}, {
  capture: !0
});
const _PP_KEYS = [{
  key: "mf_gemini_key",
  label: "Gemini",
  color: "#007AFF",
  ph: "AIzaSy…"
}, {
  key: "mf_or_key",
  label: "OpenRouter",
  color: "#00cfff",
  ph: "sk-or-…"
}, {
  key: "mf_groq_key",
  label: "Groq",
  color: "#ff9a3c",
  ph: "gsk_…"
}];

function _czSlug(e) {
  return e ? e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and").replace(/'/g, "").replace(/:/g, "").replace(/\./g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : ""
}

function _svetSerialuSlugVariants(e, t) {
  const n = _czSlug(t || ""),
    o = String(e || n || ""),
    i = [o];
  o.startsWith("the-") && i.push(o.slice(4)), !o.startsWith("the-") && t && t.toLowerCase().startsWith("the ") && i.push("the-" + o);
  const a = o.replace(/-\d{4}$/, "");
  return a !== o && i.push(a), [...new Set(i)]
}

function _bombujMovieUrlVariants(e, t) {
  const n = _czSlug(e);
  const q = `https://www.bombuj.si/?s=${encodeURIComponent(e||"")}`;
  if (!n) return [q];
  if (!t) return [q];
  const o = parseInt(t) || null;
  if (!o) return [q];
  return [`https://www.bombuj.si/online-film-${n}-${o}`, `https://www.bombuj.si/online-film-${n}-${o-1}`, `https://www.bombuj.si/online-film-${n}`, q]
}
window.adminRenderPerProfileKeys=function(){const e=document.getElementById("adminTab_apikeys");if(!e)return;let t=document.getElementById("mfPerProfileSection");t||(t=document.createElement("div"),t.id="mfPerProfileSection",e.querySelector(":scope > div")?.appendChild(t),t.parentNode||e.appendChild(t));let n=[];try{n=safeLS("mf_profiles_v2","[]")}catch(e){}n.length?t.innerHTML=`\n    <div class="mfPPS-title">👤 API klíče pro konkrétní profil</div>\n    <div class="mfPPS-sub">Každý profil může mít vlastní klíč — použije ho místo globálního.</div>\n    ${n.map(e=>{const t=e.id,n=e.avatarUrl?`<img src="${e.avatarUrl}" alt="">`:e.avatar||"🎬",o=_PP_KEYS.map(e=>{const n=e.key+"_"+t,o=localStorage.getItem(n)||"",i=o?o.slice(0,5)+"•••"+o.slice(-3):"";return`<div class="mfPPS-row">\n          <span class="mfPPS-lbl" style="color:${e.color}">${e.label}</span>\n          <input class="mfPPS-inp" id="ppk_${t}_${e.key}"\n            type="password" placeholder="${i||e.ph}"\n            ${o?`value="${o}"`:""}>\n          <button class="mfPPS-save"\n            onclick="adminSavePerKey('${t}','${e.key}')">Uložit</button>\n          ${o?`<button class="mfPPS-del"\n            onclick="adminDelPerKey('${t}','${e.key}')">✕</button>`:""}\n        </div>`}).join("");return`<div class="mfPPS-card">\n        <div class="mfPPS-head">\n          <div class="mfPPS-av" style="background:${e.color||"rgba(255,255,255,0.08)"}33;\n            border:1px solid ${e.color||"rgba(255,255,255,0.1)"}44">${n}</div>\n          <div>\n            <div class="mfPPS-name">${e.name||"Profil"}</div>\n            <div class="mfPPS-id">${t}</div>\n          </div>\n        </div>\n        ${o}\n      </div>`}).join("")}\n  `:t.innerHTML='<div class="mfPPS-title">👤 Per-profil API klíče</div><div class="mfPPS-sub" style="color:rgba(255,255,255,0.25)">Žádné profily.</div>'},
window.adminSavePerKey = function(e, t) {
    const n = document.getElementById("ppk_" + e + "_" + t),
      o = n?.value?.trim();
    o ? (localStorage.setItem(t + "_" + e, o), showToast?.("✓ Klíč uložen pro " + e.slice(0, 10) + "…"), adminRenderPerProfileKeys()) : showToast?.("❌ Zadej hodnotu klíče")
  }, window.adminDelPerKey = function(e, t) {
    localStorage.removeItem(t + "_" + e), showToast?.("🗑 Klíč smazán"), adminRenderPerProfileKeys()
  },
  function() {
    function e() {
      const e = localStorage.getItem("mf_active_pid");
      e && _PP_KEYS.forEach(t => {
        const n = localStorage.getItem(t.key + "_" + e);
        n && (localStorage.setItem(t.key, n), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey(t.key, n))
      })
    }
    document.addEventListener("DOMContentLoaded", () => setTimeout(e, 400));
    const t = window.setActiveUser;
    window.setActiveUser = function(n) {
      t && t(n), setTimeout(e, 100)
    }
  }(),
  function() {
    const e = {
      "#": () => {
        "function" == typeof closeDockOverlays && closeDockOverlays()
      },
      "#serialy": () => {
        "function" == typeof closeDockOverlays && closeDockOverlays();
        "function" == typeof setDockActive && setDockActive("dockHome");
        if (typeof window._mfShowSection_orig === "function") window._mfShowSection_orig("serialy");
        else if (typeof mfShowSection === "function") mfShowSection("serialy");
      },
      "#filmy": () => {
        "function" == typeof openUniverse && (openUniverse(), setTimeout(() => {
          document.querySelectorAll('[data-rtype="movie"]').forEach(e => e.click())
        }, 400))
      },
      "#protebe": () => {
        if ("function" == typeof mfShowSection) {
          (window._mfShowSection_orig || mfShowSection)("protebe")
        }
        "function" == typeof setDockActive && setDockActive("dockProtebe")
      },
      "#watchlist": () => {
        "function" == typeof openWatchlist && openWatchlist()
      },
      "#ai": () => {
        "function" == typeof openAi && openAi(), "function" == typeof setDockActive && setDockActive("dockAI")
      },
      "#sync": () => {
        "function" == typeof openSyncModal && openSyncModal()
      },
      "#firebase": () => {
        "function" == typeof openFirebaseCfgModal && openFirebaseCfgModal()
      },
      "#admin": () => {
        "function" == typeof openAdmin && openAdmin()
      },
      "#settings": () => {
        "function" == typeof openSettings ? openSettings() : "function" == typeof openApikeyOverlay && openApikeyOverlay()
      },
      "#profil": () => {
        void 0 !== ProfileGate && ProfileGate.show()
      },
      "#profily": () => {
        void 0 !== ProfileGate && ProfileGate.show()
      }
    };

    function t() {
      const t = (window.location.hash || "").toLowerCase().split("/")[0];
      (e[t] || e["#serialy"])()
    }

    function n() {
      const e = e => {
        location.hash !== e && history.pushState(null, "", e)
      };
      "function" == typeof window.mfShowSection && (window._mfShowSection_orig = window.mfShowSection, window.mfShowSection = function(t, ...n) {
        const o = {
          serialy: "#serialy",
          filmy: "#filmy",
          protebe: "#protebe",
          discover: "#discover"
        };
        return o[t] && e(o[t]), window._mfShowSection_orig.call(this, t, ...n)
      });
      if ([
          ["openAi", "#ai"],
          ["openUniverse", "#discover"],
          ["openWatchlist", "#watchlist"],
          ["openSyncModal", "#sync"],
          ["openAdmin", "#admin"],
          ["openSettings", "#settings"],
          ["openApikeyOverlay", "#settings"],
          ["openFirebaseCfgModal", "#firebase"]
        ].forEach(([t, n]) => {
          if ("function" == typeof window[t]) {
            const o = window[t];
            window[t] = function(...t) {
              return e(n), o.apply(this, t)
            }
          }
        }), void 0 !== ProfileGate) {
        ((t, n, o) => {
          if (!t || "function" != typeof t[n]) return;
          const i = t[n].bind(t);
          t[n] = function(...t) {
            return e(o), i(...t)
          }
        })(ProfileGate, "show", "#profily");
        const t = ProfileGate.hide.bind(ProfileGate);
        ProfileGate.hide = function(...n) {
          return e("#serialy"), t(...n)
        };
        const n = ProfileGate.activateProfile.bind(ProfileGate);
        ProfileGate.activateProfile = function(...t) {
          // OPRAVA: původní kód pushoval #serialy dvakrát (zde + v hide override)
          // Nyní jen zavoláme originál — hide override se postará o hash
          return n(...t);
        }
      }
      document.querySelectorAll(".dock-btn[data-hash]").forEach(t => {
        t.addEventListener("click", () => e(t.dataset.hash))
      })
    }
    window.addEventListener("hashchange", t), window.addEventListener("popstate", t), document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        n(), location.hash && "#" !== location.hash || history.replaceState(null, "", "#serialy"), t()
      }, 900)
    })
  }(), document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      const e = document.getElementById("hdrSyncBtn");
      e && (e.style.display = "");
      const t = document.getElementById("aiFab");
      t && !t.classList.contains("dock-btn") && (t.style.display = "none")
    }, 500)
  }), console.info("[MůjFlix v4] ✓ AI fix, Firebase GUI, per-profil API, URL routing, badge fix"),
  function() {
    let e = "movie";
    window.ptSetType = function(t) {
      e = t;
      const n = document.getElementById("ptTypeMovie"),
        o = document.getElementById("ptTypeSerial");
      n && o && ("movie" === t ? (n.style.background = "rgba(0,122,255,0.18)", n.style.color = "#007AFF", o.style.background = "transparent", o.style.color = "rgba(255,255,255,0.35)") : (o.style.background = "rgba(0,122,255,0.18)", o.style.color = "#007AFF", n.style.background = "transparent", n.style.color = "rgba(255,255,255,0.35)"))
    }, window.ptFinderSearch = function() {
      const t = document.getElementById("ptFinderInput");
      if (!t) return;
      const n = t.value.trim();
      n ? (! function(e, t) {
        let n;
        try {
          n = safeLS("mf_pt_chips", "[]")
        } catch {
          n = []
        }
        const o = {
            name: e,
            type: t,
            ts: Date.now()
          },
          i = n.filter(t => t.name !== e).slice(0, 7);
        i.unshift(o), localStorage.setItem("mf_pt_chips", JSON.stringify(i)), ptRenderChips()
      }(n, e), "function" == typeof verifyAndOpen ? verifyAndOpen(n, e) : "function" == typeof showFinderModal && (showFinderModal(n, e), "function" == typeof runFinder && runFinder(n, e))) : t.focus()
    }, window.ptRenderChips = function() {
      const e = document.getElementById("ptFinderChips");
      if (!e) return;
      let t;
      try {
        t = safeLS("mf_pt_chips", "[]")
      } catch {
        t = []
      }
      e.innerHTML = '<span style="font-size:0.55rem;color:rgba(255,255,255,0.25);align-self:center;flex-shrink:0;">Naposledy:</span>', t.length ? t.slice(0, 5).forEach(t => {
        const n = document.createElement("button");
        n.style.cssText = "\n        padding:5px 11px;border-radius:20px;\n        background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);\n        color:rgba(255,255,255,0.6);font-size:0.62rem;font-family:-apple-system,sans-serif;\n        cursor:pointer;white-space:nowrap;transition:all 0.18s;display:flex;align-items:center;gap:5px;\n      ", n.innerHTML = `${"movie"===t.type?"🎬":"📺"} ${t.name}`, n.onmouseover = () => {
          n.style.background = "rgba(255,255,255,0.11)", n.style.color = "#fff"
        }, n.onmouseout = () => {
          n.style.background = "rgba(255,255,255,0.06)", n.style.color = "rgba(255,255,255,0.6)"
        }, n.onclick = () => {
          document.getElementById("ptFinderInput").value = t.name, ptSetType(t.type), ptFinderSearch()
        }, e.appendChild(n)
      }) : e.innerHTML += '<span style="font-size:0.6rem;color:rgba(255,255,255,0.18);">zatím nic</span>'
    };
    const t = new MutationObserver(() => {
      const e = document.getElementById("mfSectionProtebe");
      e && "none" !== e.style.display && ptRenderChips()
    });
    document.addEventListener("DOMContentLoaded", () => {
      const e = document.getElementById("mfSectionProtebe");
      e && t.observe(e, {
        attributes: !0,
        attributeFilter: ["style"]
      }), ptRenderChips()
    })
  }(),
  function() {
    const e = "http://100.72.144.107:8080/plex",
      t = "mf_plex_token",
      n = "mf_plex_url";

    function o() {
      return localStorage.getItem(n) || e
    }

    function i() {
      return localStorage.getItem(t) || "yzrL-FrFEgc85YobxCes"
    }! function() {
      const t = localStorage.getItem(n);
      t && !t.includes(":32400") || localStorage.setItem(n, e)
    }();
    let a = null,
      s = [];

    function r() {
      return o().replace(/\/plex\/?$/, "").replace(":8080", ":32400")
    }
    async function l(e) {
      try {
        const t = await fetch(e, {
          method: "GET",
          headers: {
            Accept: "application/json"
          },
          credentials: "omit"
        });
        if (!t.ok) throw new Error("HTTP " + t.status);
        return await t.json()
      } catch (t) {
        const n = await fetch(e, {
          method: "GET",
          credentials: "omit"
        });
        if (!n.ok) throw new Error("HTTP " + n.status);
        const o = await n.text();
        try {
          return JSON.parse(o)
        } catch (e) {
          throw new Error("Síťová chyba — zkontroluj URL a token")
        }
      }
    }

    function c(e, t, n) {
      const o = document.createElement("button");
      return o.textContent = e, o.dataset.sectionKey = t || "", o.style.cssText = `padding:8px 16px;border-radius:20px;border:1px solid ${n?"rgba(229,160,13,0.5)":"rgba(255,255,255,0.08)"};background:${n?"rgba(229,160,13,0.14)":"rgba(255,255,255,0.04)"};color:${n?"#e5a00d":"rgba(255,255,255,0.6)"};font-size:0.78rem;font-weight:${n?"700":"500"};cursor:pointer;white-space:nowrap;transition:all 0.15s;`, o.onclick = () => {
        document.querySelectorAll("#plexLibFilters button").forEach(e => {
          e.style.background = "rgba(255,255,255,0.04)", e.style.borderColor = "rgba(255,255,255,0.08)", e.style.color = "rgba(255,255,255,0.6)", e.style.fontWeight = "500"
        }), o.style.background = "rgba(229,160,13,0.14)", o.style.borderColor = "rgba(229,160,13,0.5)", o.style.color = "#e5a00d", o.style.fontWeight = "700", t ? plexLoadSection(t, null) : plexLoadAll(s)
      }, o
    }
    window.plexInit = async function() {
      const e = i(),
        t = document.getElementById("plexOnboarding"),
        n = document.getElementById("plexLoader"),
        r = document.getElementById("plexConnError"),
        d = document.getElementById("plexGrid"),
        m = document.getElementById("plexLibFilters"),
        u = document.getElementById("plexServerStatus");
      if (t && (t.style.display = "none"), r && (r.style.display = "none"), d && (d.style.display = "none"), m && (m.style.display = "none"), !e) return t && (t.style.display = "block"), void(u && (u.textContent = "Token není nastaven"));
      n && (n.style.display = "block"), u && (u.textContent = "Připojování k " + o() + "…");
      try {
        const t = await l(`${o()}/library/sections?X-Plex-Token=${e}&Accept=application/json`),
          i = t.MediaContainer?.Directory || [];
        if (s = i, n && (n.style.display = "none"), u && (u.textContent = `Připojeno · ${i.length} knihoven`), m) {
          m.style.display = "flex", m.innerHTML = "";
          const e = c("Vše", null, !0);
          m.appendChild(e), i.forEach(e => {
            const t = "movie" === e.type ? "🎬" : "show" === e.type ? "📺" : "🎵";
            m.appendChild(c(t + " " + e.title, e.key, !1))
          })
        }
        i.length > 0 ? (a = null, await plexLoadAll(i)) : d && (d.style.display = "block", d.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;">Žádné knihovny nenalezeny.</p>')
      } catch (e) {
        n && (n.style.display = "none");
        const t = document.getElementById("plexConnErrorMsg");
        t && (t.innerHTML = `Chyba: <strong>${e.message}</strong><br><br>Zkontroluj URL a token, nebo zda Plex povoluje přístup z prohlížeče.`), r && (r.style.display = "block"), u && (u.textContent = "Chyba připojení")
      }
    }, window.plexLoadAll = async function(e) {
      const t = document.getElementById("plexGrid");
      if (t) {
        t.style.display = "block", t.innerHTML = "";
        for (const t of e) await plexLoadSection(t.key, t.title)
      }
    }, window.plexLoadSection = async function(e, t) {
      const n = document.getElementById("plexGrid"),
        a = i();
      if (n) {
        null === t && (n.innerHTML = "");
        try {
          const s = await l(`${o()}/library/sections/${e}/all?X-Plex-Token=${a}&X-Plex-Container-Start=0&X-Plex-Container-Size=200`),
            c = s.MediaContainer?.Metadata || [];
          if (0 === c.length) return;
          const d = t || s.MediaContainer?.title1 || "Knihovna",
            m = document.createElement("div");
          m.style.cssText = "margin-bottom:32px;", m.innerHTML = `<div style="font-size:1rem;font-weight:700;letter-spacing:-0.3px;margin-bottom:14px;padding:0 2px;">${d} <span style="font-size:0.72rem;color:var(--muted);font-weight:400;">(${c.length})</span></div>`;
          const u = document.createElement("div");
          u.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;", c.forEach(e => {
            const t = function(e) {
              const t = i(),
                n = e.thumb ? `${r()}${e.thumb}?X-Plex-Token=${t}&width=200` : null,
                o = e.year ? ` (${e.year})` : "",
                a = e.rating ? `⭐ ${parseFloat(e.rating).toFixed(1)}` : "",
                s = e.viewCount > 0,
                l = document.createElement("div");
              l.style.cssText = "position:relative;cursor:pointer;border-radius:12px;overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);transition:transform 0.18s,box-shadow 0.18s;", l.title = e.title + o, l.onmouseenter = () => {
                l.style.transform = "scale(1.04)", l.style.boxShadow = "0 8px 32px rgba(0,0,0,0.6)"
              }, l.onmouseleave = () => {
                l.style.transform = "", l.style.boxShadow = ""
              };
              const c = document.createElement("div");
              c.style.cssText = `aspect-ratio:2/3;background:rgba(255,255,255,0.04) url('${n||""}') center/cover no-repeat;`, n || (c.style.display = "flex", c.style.alignItems = "center", c.style.justifyContent = "center", c.innerHTML = '<span style="font-size:2rem;">🎬</span>');
              if (s) {
                const e = document.createElement("div");
                e.style.cssText = "position:absolute;top:6px;right:6px;background:rgba(229,160,13,0.9);border-radius:6px;padding:2px 6px;font-size:0.58rem;font-weight:700;color:#000;", e.textContent = "✓ Viděno", l.appendChild(e)
              }
              l.appendChild(c);
              const d = document.createElement("div");
              return d.style.cssText = "padding:8px 8px 10px;", d.innerHTML = `<div style="font-size:0.72rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(e.title)}</div><div style="font-size:0.62rem;color:var(--muted);margin-top:2px;">${o.replace("(","").replace(")","")||""}${a?" · "+a:""}</div>`, l.appendChild(d), l.onclick = () => {
                const n = `${r()}/web/index.html#!/server/${e.librarySectionID}/details?key=${encodeURIComponent(e.key)}&X-Plex-Token=${t}`;
                window.open(n, "_blank")
              }, l
            }(e);
            u.appendChild(t)
          }), m.appendChild(u), n.appendChild(m)
        } catch (t) {
          console.warn("[Plex] Chyba načítání sekce", e, t)
        }
      }
    }, window.plexSaveSettings = function() {
      const o = document.getElementById("plexTokenInput")?.value?.trim(),
        i = document.getElementById("plexUrlInput")?.value?.trim() || e;
      o ? (localStorage.setItem(t, o), localStorage.setItem(n, i), plexInit()) : alert("Vlož prosím Plex Token.")
    }, window.openPlexSettings = function() {
      const e = document.getElementById("plexSettingsModal");
      e && (document.getElementById("plexUrlInputS").value = o(), document.getElementById("plexTokenInputS").value = i(), e.style.display = "flex")
    }, window.closePlexSettings = function() {
      const e = document.getElementById("plexSettingsModal");
      e && (e.style.display = "none")
    }, window.plexSaveSettingsModal = function() {
      const o = document.getElementById("plexTokenInputS")?.value?.trim(),
        i = document.getElementById("plexUrlInputS")?.value?.trim() || e;
      o && localStorage.setItem(t, o), i && localStorage.setItem(n, i), closePlexSettings(), plexRefresh()
    }, window.plexRefresh = function() {
      plexInit()
    }
  }(),
  function() {
    let e = "serialy";
    window.mfSectionBtn = function(e, t) {}, window.mfShowSection = function(t) {
      e = t, window._mfCurrentSection = t;
      const n = document.querySelector(".ps-menu-scene"),
        o = document.querySelector(".key-hint"),
        i = document.getElementById("continueWidget"),
        a = document.getElementById("mfSectionProtebe");
      n && (n.style.display = ""), o && (o.style.display = ""), i && (i.style.display = ""), a && (a.style.display = "none");
      const s = document.getElementById("mfSectionPlex");
      if (s && (s.style.display = "none"), document.body.classList.remove("mf-section-protebe"), "serialy" === t) {
        "function" == typeof closeUniverse && closeUniverse();
        const e = document.getElementById("universeOverlay");
        e && (e.classList.remove("visible", "open"), document.body.classList.remove("discover-open"));
        "function" == typeof closeDockOverlays && closeDockOverlays();
        setDockActive("dockHome");
        location.hash = "#serialy";
      }
      else if ("filmy" === t) n && (n.style.display = "none"), o && (o.style.display = "none"), i && (i.style.display = "none"), setDockActive("dockFilmy"), location.hash = "#filmy", "function" == typeof openUniverse && (openUniverse(), setTimeout(() => {
        document.querySelectorAll('[data-rtype="movie"], [onclick*="movie"], .disco-filter-btn').forEach(e => {
          (e.textContent.toLowerCase().includes("film") || "movie" === e.dataset.rtype) && e.click()
        })
      }, 350));
      else if ("protebe" === t) n && (n.style.display = "none"), o && (o.style.display = "none"), i && (i.style.display = "none"), a && (a.style.display = "block"), document.body.classList.add("mf-section-protebe"), setDockActive("dockProtebe"), location.hash = "#protebe";
      else if ("plex" === t) {
        n && (n.style.display = "none"), o && (o.style.display = "none"), i && (i.style.display = "none"), a && (a.style.display = "none");
        const e = document.getElementById("mfSectionPlex");
        e && (e.style.display = "block"), setDockActive("dockPlex"), location.hash = "#plex", "function" == typeof plexInit && plexInit()
      }
    };
    const t = window.closeUniverse;

    function n() {
      const e = (location.hash || "").toLowerCase();
      "#filmy" === e ? mfShowSection("filmy") : "#protebe" === e ? mfShowSection("protebe") : "#plex" === e ? mfShowSection("plex") : "#serialy" !== e && "" !== e || mfShowSection("serialy")
    }
    window.closeUniverse = function() {
      t && t.apply(this, arguments), "filmy" === e && setTimeout(() => {
        const t = document.querySelector(".ps-menu-scene"),
          n = document.querySelector(".key-hint");
        t && (t.style.display = ""), n && (n.style.display = ""), setDockActive("dockHome"), e = "serialy", location.hash = "#serialy"
      }, 50)
    }, window.addEventListener("hashchange", n), document.addEventListener("DOMContentLoaded", () => setTimeout(n, 900));
    document.addEventListener("click", event => {
      const button = event.target.closest && event.target.closest(".mf-dock .dock-btn");
      if (!button) return;
      const activeId = button.id;
      if (!activeId) return;
      setTimeout(() => setDockActive(activeId), 0);
    }, true);
    const o = window.setDockActive;
    window.setDockActive = function(e) {
      o && o(e), ["dockHome", "dockFilmy", "dockProtebe", "dockProfile", "dockMore"].forEach(t => {
        const n = document.getElementById(t);
        n && (t === e ? n.classList.add("active") : n.classList.remove("active"))
      })
    }
  }(), console.info("[MůjFlix v4 sekce] ✓ Edit fix, Seriály/Filmy/Pro tebe sekce, dock redesign"),
  function() {
    function e() {
      function e(e) {
        if (e._tiltInited) return;
        e._tiltInited = !0;
        const t = e.querySelector(".ps-tile");
        t && (e.addEventListener("mousemove", n => {
          const o = e.getBoundingClientRect(),
            i = (n.clientX - o.left) / o.width - .5,
            a = (n.clientY - o.top) / o.height - .5;
          t.style.transform = `rotateY(${7*i*2}deg) rotateX(${7*-a}deg)`, t.style.transformStyle = "preserve-3d", t.style.transition = "transform 0.12s ease"
        }), e.addEventListener("mouseleave", () => {
          t.style.transform = "", t.style.transition = "transform 0.5s cubic-bezier(0.34,1.2,0.64,1)"
        }))
      }
      document.querySelectorAll(".ps-tile-wrapper").forEach(e);
      new MutationObserver(t => t.forEach(t => t.addedNodes.forEach(t => {
        1 === t.nodeType && (t.classList?.contains("ps-tile-wrapper") && e(t), t.querySelectorAll?.(".ps-tile-wrapper").forEach(e))
      }))).observe(document.body, {
        childList: !0,
        subtree: !0
      })
    }

    function t() {
      if (document.addEventListener("pointerdown", e => {
          const t = e.target.closest(".disco-nav-item, .disco-hero-btn, .disco-row-nav-btn, .disco-close");
          if (!t) return;
          const n = document.createElement("span"),
            o = t.getBoundingClientRect(),
            i = 2.2 * Math.max(o.width, o.height);
          n.style.cssText = `\n        position:absolute;border-radius:50%;pointer-events:none;\n        width:${i}px;height:${i}px;\n        left:${e.clientX-o.left-i/2}px;\n        top:${e.clientY-o.top-i/2}px;\n        background:rgba(255,255,255,0.15);\n        transform:scale(0);\n        animation:ios26Ripple 0.55s cubic-bezier(0.25,0.8,0.25,1) forwards;\n        z-index:99;\n      `, "static" === getComputedStyle(t).position && (t.style.position = "relative"), t.style.overflow = "hidden", t.appendChild(n), setTimeout(() => n.remove(), 600)
        }), !document.getElementById("ios26RippleStyle")) {
        const e = document.createElement("style");
        e.id = "ios26RippleStyle", e.textContent = "@keyframes ios26Ripple { to { transform:scale(1); opacity:0; } }", document.head.appendChild(e)
      }
    }

    function n() {
      setTimeout(() => {
        ! function() {
          // BUG FIX: Původní kód nastavoval transform přímo na .disco-card,
          // kde CSS :hover už má transform: scale(1.13) translateY(-18px).
          // JS override způsoboval "pulsování" — CSS a JS bojovaly o stejnou vlastnost.
          // Řešení: JS tilt aplikujeme POUZE na vnitřní shimmer overlay (pointer-events:none),
          // transform na samotné kartě nechám čistě na CSS :hover. Click tak vždy funguje.
          function e(e) {
            if (e._tiltInited) return;
            e._tiltInited = !0;
            const t = document.createElement("div");
            t.style.cssText = "\n        position:absolute;inset:0;border-radius:20px;pointer-events:none;\n        background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28) 0%, transparent 65%);\n        opacity:0;transition:opacity 0.2s ease;z-index:20;mix-blend-mode:screen;\n      ";
            // OPRAVA: přidáme overlay ale NENASTAVUJEME transform na 'e' (disco-card)
            // Pouze pohybujeme světelným shimmerem po ploše karty
            e.appendChild(t);
            e.addEventListener("mousemove", n => {
              const c = (n.clientX - e.getBoundingClientRect().left) / e.offsetWidth * 100,
                d = (n.clientY - e.getBoundingClientRect().top) / e.offsetHeight * 100;
              t.style.background = `radial-gradient(circle at ${c}% ${d}%, rgba(255,255,255,0.22) 0%, transparent 60%)`;
              t.style.opacity = "1";
              // ŽÁDNÝ transform na 'e' — necháme CSS :hover dělat svou práci
            }, { passive: true });
            e.addEventListener("mouseleave", () => {
              t.style.opacity = "0";
              // ŽÁDNÝ e.style.transform reset — CSS se postará sám
            });
            // Click fix: okamžitě resetuj hover vizuál před kliknutím
            e.addEventListener("pointerdown", () => {
              t.style.opacity = "0";
            }, { passive: true });
          }
          document.querySelectorAll(".disco-card").forEach(e), new MutationObserver(t => {
            t.forEach(t => t.addedNodes.forEach(t => {
              1 === t.nodeType && (t.classList?.contains("disco-card") && e(t), t.querySelectorAll?.(".disco-card").forEach(e))
            }))
          }).observe(document.body, {
            childList: !0,
            subtree: !0
          })
        }(), document.querySelectorAll(".disco-nav-item").forEach(e => {
            e.addEventListener("mousemove", t => {
              const n = e.getBoundingClientRect(),
                o = .18 * (t.clientX - (n.left + n.width / 2)),
                i = .18 * (t.clientY - (n.top + n.height / 2));
              e.style.transform = `translate(${o}px, ${i}px) scale(1.05)`
            }), e.addEventListener("mouseleave", () => {
              e.style.transform = ""
            })
          }),
          function() {
            const e = document.querySelector(".disco-hero");
            if (!e) return;
            const t = e.querySelector("img");
            t && (e.addEventListener("mousemove", n => {
              const o = e.getBoundingClientRect(),
                i = (n.clientX - o.width / 2) / o.width,
                a = (n.clientY - o.height / 2) / o.height;
              t.style.transform = `scale(1.07) translate(${-14*i}px, ${-8*a}px)`, t.style.transition = "transform 0.15s ease"
            }), e.addEventListener("mouseleave", () => {
              t.style.transform = "scale(1.06)", t.style.transition = "transform 1.2s ease"
            }))
          }(), document.addEventListener("mouseover", e => {
            const t = e.target.closest(".disco-card");
            if (!t || t._colorSampled) return;
            t._colorSampled = !0;
            const n = t.querySelector(".disco-card-img");
            if (n && n.complete) try {
              const e = document.createElement("canvas");
              e.width = 4, e.height = 4;
              const o = e.getContext("2d");
              o.drawImage(n, 0, .65 * n.naturalHeight, n.naturalWidth, .35 * n.naturalHeight, 0, 0, 4, 4);
              const i = o.getImageData(0, 0, 4, 4).data;
              let a = 0,
                s = 0,
                r = 0,
                l = 0;
              for (let e = 0; e < i.length; e += 4) a += i[e], s += i[e + 1], r += i[e + 2], l++;
              a = Math.round(a / l), s = Math.round(s / l), r = Math.round(r / l);
              const c = t.querySelector(".disco-card-glow");
              c && (c.style.background = `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(${a},${s},${r},0.45) 0%, transparent 70%)`), t.addEventListener("mouseenter", () => {
                t.style.setProperty("--card-accent", `rgba(${a},${s},${r},0.5)`), t.style.borderColor = `rgba(${Math.min(a+40,255)},${Math.min(s+40,255)},${Math.min(r+40,255)},0.38)`
              }, {
                passive: !0
              }), t.addEventListener("mouseleave", () => {
                t.style.borderColor = ""
              }, {
                passive: !0
              })
            } catch (e) {}
          }, {
            passive: !0
          })
      }, 80)
    }
    const o = window.openUniverse;
    o && (window.openUniverse = function(...e) {
      const t = o.apply(this, e);
      return n(), t
    });
    new MutationObserver(() => {
      const e = document.querySelector(".universe-overlay.visible");
      e && !e._tiltInited && (e._tiltInited = !0, n())
    }).observe(document.body, {
      attributes: !0,
      subtree: !0,
      attributeFilter: ["class"]
    }), "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", () => {
      e(), t()
    }) : (e(), t())
  }(), window.CinAI = function() {
    const e = "mf_cin_ai_stats";

    function t() {
      try {
        return safeLS(e, "{}")
      } catch (e) {
        return {}
      }
    }

    function n(e) {
      if (!e || 0 === e.tries) return 50;
      const t = e.ok / e.tries,
        n = Date.now() - (e.lastTs || 0),
        o = Math.max(.4, 1 - n / 1728e5);
      return Math.round(100 * t * o)
    }

    function o(e) {
      const o = t();
      return [...e].map((e, t) => ({
        src: e,
        i: t,
        score: n(o[e.id])
      })).sort((e, t) => t.score - e.score)
    }

    function i(n, o) {
      const i = t();
      i[n] || (i[n] = {
          ok: 0,
          tries: 0,
          lastTs: 0
        }), i[n].tries++, o && i[n].ok++, i[n].lastTs = Date.now(),
        function(t) {
          try {
            localStorage.setItem(e, JSON.stringify(t))
          } catch (e) {}
        }(i)
    }
    return {
      findBestSource: async function(e, i, a, s, r) {
        const l = o(e),
          c = t(),
          d = _cinState;
        if (e.every(e => e.popupOnly)) return d.sourceIdx;
        const m = l.slice(0, 4).map(async ({
            src: e,
            i: t
          }) => {
            const n = "movie" === a ? e.movie(i, d.title, d.year) : e.tv(i, s, r, d.title, d.siteSlug || null),
              o = await async function(e) {
                try {
                  const t = new AbortController,
                    n = setTimeout(() => t.abort(), 5e3);
                  return await fetch(e, {
                    method: "HEAD",
                    mode: "no-cors",
                    signal: t.signal
                  }), clearTimeout(n), !0
                } catch (e) {
                  return !1
                }
              }(n);
            return {
              src: e,
              i: t,
              alive: o,
              url: n
            }
          }),
          u = (await Promise.all(m)).filter(e => e.alive);
        if (u.length > 0) {
          const e = u[0];
          return window.MF_DEBUG && console.log(`[CinAI] Nejlepší zdroj: ${e.src.label} (skóre ${n(c[e.src.id])}, probe OK)`), e.i
        }
        return window.MF_DEBUG && console.log("[CinAI] Probe timeout, fallback na přednastavený zdroj"), d.sourceIdx
      },
      monitorIframe: function(e, t) {
        let n = !1;
        e.addEventListener("load", () => {
          n = !0, setTimeout(() => {
            const n = e.getBoundingClientRect(),
              o = n.width > 100 && n.height > 100;
            i(t, o), o && window.MF_DEBUG && console.log(`[CinAI] ${t} ✅ zaznamenán úspěch`)
          }, 2e3)
        }), setTimeout(() => {
          n || (i(t, !1), window.MF_DEBUG && console.log(`[CinAI] ${t} ❌ timeout — zaznamenán neúspěch`))
        }, 12e3)
      },
      renderAIBadge: function(e) {
        const t = document.createElement("div");
        t.id = "cinAIBadge", t.style.cssText = "display:flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.3);border-radius:20px;font-size:0.6rem;color:rgba(0,122,255,0.9);font-family:Inter,sans-serif;font-weight:600;white-space:nowrap;cursor:default;", t.title = "AI automaticky vybírá nejspolehlivější zdroj", t.innerHTML = "✦ AI", e.prepend(t)
      },
      recordResult: i,
      getScore: n,
      loadStats: t,
      resetStats: function() {
        localStorage.removeItem(e), window.MF_DEBUG && console.log("[CinAI] Statistiky vynulovány")
      },
      showStats: function() {
        const e = t();
        if (void 0 === CINEMA_SOURCES) return;
        const o = CINEMA_SOURCES.map(t => {
          const o = e[t.id],
            i = n(o),
            a = "█".repeat(Math.round(i / 10)) + "░".repeat(10 - Math.round(i / 10)),
            s = o ? o.tries : 0;
          return `${t.label.padEnd(12)} ${a} ${i}% (${s}×)`
        }).join("\n");
        if (window.MF_DEBUG && console.log("[CinAI] Statistiky zdrojů:\n" + o), "function" == typeof showToast) {
          const t = CINEMA_SOURCES.map(t => ({
            src: t,
            score: n(e[t.id])
          })).sort((e, t) => t.score - e.score)[0];
          showToast(`🤖 Nejlepší zdroj: ${t.src.label} (${t.score}%)`, "success")
        }
      },
      rankSources: o
    }
  }(), window.MFTransition = function() {
    const e = !!document.startViewTransition;
    return {
      run: function(t, n, o) {
        if (!e) return void o();
        var i, a;
        t && (a = "movie-poster", (i = t) && (i.style.viewTransitionName = a));
        const s = document.startViewTransition(() => {
          t && function(e) {
            e && (e.style.viewTransitionName = "")
          }(t), o()
        });
        return s.finished.catch(() => {}), s
      },
      skeleton: function(e, t) {
        t = t || [{
          w: "100%",
          h: "220px",
          r: "16px",
          delay: 0
        }, {
          w: "60%",
          h: "20px",
          r: "8px",
          delay: .1
        }, {
          w: "40%",
          h: "14px",
          r: "6px",
          delay: .15
        }, {
          w: "100%",
          h: "80px",
          r: "10px",
          delay: .2
        }, {
          w: "80%",
          h: "12px",
          r: "6px",
          delay: .25
        }], e && (e.innerHTML = t.map(e => `<div class="sk-block" style="width:${e.w};height:${e.h};border-radius:${e.r};margin-bottom:12px;animation-delay:${e.delay}s;"></div>`).join(""))
      },
      detailSkeleton: function(e) {
        e && (e.innerHTML = '\n      <div class="sk-block" style="width:100%;height:260px;border-radius:16px 16px 0 0;margin-bottom:0;animation-delay:0s;"></div>\n      <div style="padding:20px 20px 0;">\n        <div class="sk-block" style="width:55%;height:22px;border-radius:8px;margin-bottom:10px;animation-delay:0.08s;"></div>\n        <div class="sk-block dark" style="width:35%;height:13px;border-radius:6px;margin-bottom:18px;animation-delay:0.13s;"></div>\n        <div class="sk-block dark" style="width:100%;height:12px;border-radius:5px;margin-bottom:7px;animation-delay:0.17s;"></div>\n        <div class="sk-block dark" style="width:90%;height:12px;border-radius:5px;margin-bottom:7px;animation-delay:0.20s;"></div>\n        <div class="sk-block dark" style="width:70%;height:12px;border-radius:5px;margin-bottom:20px;animation-delay:0.22s;"></div>\n        <div style="display:flex;gap:10px;">\n          <div class="sk-block light" style="flex:1;height:44px;border-radius:12px;animation-delay:0.27s;"></div>\n          <div class="sk-block" style="flex:1;height:44px;border-radius:12px;animation-delay:0.30s;"></div>\n        </div>\n      </div>')
      },
      searchSkeleton: function(e, t) {
        t = t || 6, e && (e.innerHTML = Array.from({
          length: t
        }, (e, t) => `<div style="animation-delay:${.06*t}s;">\n        <div class="sk-block" style="width:100%;aspect-ratio:2/3;border-radius:14px;margin-bottom:8px;animation-delay:${.06*t}s;"></div>\n        <div class="sk-block dark" style="width:75%;height:11px;border-radius:5px;margin-bottom:5px;animation-delay:${.06*t+.05}s;"></div>\n        <div class="sk-block dark" style="width:45%;height:9px;border-radius:4px;animation-delay:${.06*t+.08}s;"></div>\n      </div>`).join(""))
      },
      SUPPORTS: e
    }
  }(), window.showShSkeletons = function() {
    const e = document.getElementById("searchResults");
    e && MFTransition.searchSkeleton(e, 8)
  },
  function() {
    window.buildShCard;
    document.addEventListener("click", function(e) {
      const t = e.target.closest(".sh-card");
      if (!t) return;
      const n = t.querySelector("img");
      n && document.startViewTransition && (n.style.viewTransitionName = "movie-poster", setTimeout(() => {
        n.style.viewTransitionName = ""
      }, 600))
    }, !0)
  }(), document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("click", function(e) {
      const t = e.target.closest(".ps-tile-wrapper");
      if (!t) return;
      const n = t.querySelector(".tile-bg, img");
      n && document.startViewTransition && (n.style.viewTransitionName = "movie-poster", setTimeout(() => {
        n.style.viewTransitionName = ""
      }, 700))
    }, !0)
  }), window.JWAvail = function() {
    const e = {},
      t = 432e5,
      n = void 0 !== window.TMDB_KEY ? window.TMDB_KEY : null,
      o = {
        flatrate: {
          label: "Streaming",
          color: "#30d158",
          icon: "▶"
        },
        rent: {
          label: "Pronájem",
          color: "#ff9f0a",
          icon: "🔑"
        },
        buy: {
          label: "Koupit",
          color: "#007AFF",
          icon: "🛒"
        },
        free: {
          label: "Zdarma",
          color: "#5ac8fa",
          icon: "✨"
        }
      };
    async function i(o, i) {
      const a = `${i}_${o}`,
        s = Date.now();
      if (e[a] && s - e[a].ts < t) return e[a].data;
      try {
        const n = safeLS("mf_jw_" + a, "null");
        if (n && s - n.ts < t) return e[a] = n, n.data
      } catch (e) {}
      if (!n) return null;
      try {
        const t = "movie" === i ? `https://api.themoviedb.org/3/movie/${o}/watch/providers?api_key=${n}` : `https://api.themoviedb.org/3/tv/${o}/watch/providers?api_key=${n}`,
          r = await fetch(t);
        if (!r.ok) return null;
        const l = await r.json(),
          c = l.results?.CZ || l.results?.SK || l.results?.DE || null,
          d = {
            data: c,
            ts: s
          };
        e[a] = d;
        try {
          localStorage.setItem("mf_jw_" + a, JSON.stringify(d))
        } catch (e) {}
        return c
      } catch (e) {
        return null
      }
    }
    async function a(e, t, n) {
      if (!e || !t) return;
      e.innerHTML = '<div style="display:flex;gap:8px;align-items:center;opacity:0.35;">\n      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>\n      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>\n      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>\n    </div>';
      const a = await i(t, n);
      if (!a) return void(e.innerHTML = "");
      let s = [];
      ["flatrate", "rent", "buy", "free"].forEach(e => {
        if (!a[e] || !a[e].length) return;
        const t = a[e].slice(0, 4),
          n = o[e];
        s.push(`\n        <div style="margin-bottom:10px;">\n          <div style="font-size:0.55rem;font-weight:700;letter-spacing:0.5px;color:${n.color};margin-bottom:5px;text-transform:uppercase;">${n.icon} ${n.label}</div>\n          <div style="display:flex;gap:6px;flex-wrap:wrap;">\n            ${t.map(e=>{return`\n              <div title="${e.provider_name}" style="width:30px;height:30px;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);flex-shrink:0;cursor:default;" >\n                <img src="${t=e.logo_path,`https://image.tmdb.org/t/p/original${t}`}" alt="${e.provider_name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">\n              </div>`;var t}).join("")}\n          </div>\n        </div>`)
      }), 0 !== s.length ? e.innerHTML = `\n      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:4px;">\n        <div style="font-size:0.6rem;color:rgba(255,255,255,0.35);margin-bottom:8px;display:flex;align-items:center;gap:5px;">\n          <span>Dostupné přes</span>\n          <span style="opacity:0.4">·</span>\n          <a href="https://www.justwatch.com/cz" target="_blank" rel="noopener" style="color:rgba(0,122,255,0.7);text-decoration:none;font-size:0.55rem;">JustWatch</a>\n        </div>\n        ${s.join("")}\n      </div>` : e.innerHTML = '<div style="font-size:0.62rem;color:rgba(255,255,255,0.25);padding:4px 0;">Není dostupné ve streaming službách v CZ</div>'
    }
    return {
      render: a,
      fetchProviders: i,
      injectIntoModal: function(e, t) {
        setTimeout(() => {
          const n = document.querySelector(".jw-avail-slot");
          n && a(n, e, t)
        }, 200)
      }
    }
  }(), window.MFSettings = function() {
    function e(e, n, o, i, a, s) {
      return `<div style="margin-bottom:10px;">\n      <label style="font-size:0.65rem;color:rgba(255,255,255,0.45);display:block;margin-bottom:4px;">${n}</label>\n      <input id="${e}" type="${a||"text"}" placeholder="${s||""}" value="${t(i[o]||"")}"\n        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:9px;padding:9px 11px;color:#fff;font-size:0.75rem;outline:none;box-sizing:border-box;font-family:monospace;">\n    </div>`
    }

    function t(e) {
      return (e || "").replace(/"/g, "&quot;").replace(/</g, "&lt;")
    }

    function n() {
      const e = document.getElementById("mfAiStatsGrid");
      if (!e || !window.CinAI || void 0 === CINEMA_SOURCES) return;
      const t = CinAI.loadStats();
      e.innerHTML = CINEMA_SOURCES.map(e => {
        const n = CinAI.getScore(t[e.id]),
          o = t[e.id],
          i = n >= 70 ? "#30d158" : n >= 40 ? "#ff9f0a" : o ? "#ff453a" : "rgba(255,255,255,0.2)",
          a = o ? o.tries : 0;
        return `<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:rgba(255,255,255,0.03);border-radius:8px;">\n        <div style="width:7px;height:7px;border-radius:50%;background:${i};flex-shrink:0;"></div>\n        <div>\n          <div style="font-size:0.62rem;color:rgba(255,255,255,0.65);font-weight:600;">${e.label}</div>\n          <div style="font-size:0.5rem;color:rgba(255,255,255,0.3);">${a?n+"% ("+a+"×)":"Neotestováno"}</div>\n        </div>\n      </div>`
      }).join("")
    }
    return {
      open: function() {
        document.getElementById("mfBeautifulSettings") || function() {
          let o = {};
          try {
            o = safeLS("mf_firebase_cfg", "{}")
          } catch (e) {}
          const i = localStorage.getItem("mf_sync_group") || "",
            a = void 0 !== window.TMDB_KEY ? window.TMDB_KEY : localStorage.getItem("mf_tmdb_key") || "",
            s = document.createElement("div");
          s.id = "mfBeautifulSettings", s.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.75);backdrop-filter:blur(24px);display:flex;align-items:flex-end;justify-content:center;font-family:-apple-system,Inter,sans-serif;animation:mfSettFade 0.22s ease;";
          const r = document.createElement("div");
          r.style.cssText = "background:rgba(18,18,26,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:28px 28px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:0 0 40px;box-shadow:0 -20px 60px rgba(0,0,0,0.6);animation:mfSettUp 0.38s cubic-bezier(0.34,1.1,0.64,1);", r.innerHTML = `\n      \x3c!-- Handle --\x3e\n      <div style="display:flex;justify-content:center;padding:12px 0 4px;">\n        <div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.18);"></div>\n      </div>\n\n      \x3c!-- Header --\x3e\n      <div style="padding:16px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">\n        <div style="display:flex;align-items:center;justify-content:space-between;">\n          <div>\n            <div style="font-size:1.15rem;font-weight:700;color:#fff;letter-spacing:-0.3px;">Nastavení</div>\n            <div style="font-size:0.62rem;color:rgba(255,255,255,0.35);margin-top:2px;">MůjFlix konfigurace</div>\n          </div>\n          <button id="mfSetClose" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>\n        </div>\n      </div>\n\n      \x3c!-- Section: TMDB --\x3e\n      <div style="padding:20px 24px 0;">\n        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🎬 Film databáze</div>\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">\n          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">TMDB API klíč</label>\n          <input id="mfSetTmdb" type="password" placeholder="Vložte váš TMDB API klíč…" value="${t(a)}"\n            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:inherit;">\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;line-height:1.5;">\n            Získej zdarma na <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:rgba(0,122,255,0.7);">themoviedb.org</a> → API → Klíč v3\n          </div>\n        </div>\n      </div>\n\n      \x3c!-- Section: Sync --\x3e\n      <div style="padding:16px 24px 0;">\n        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">☁️ Sync mezi zařízeními</div>\n\n        \x3c!-- Sync group key --\x3e\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">\n          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">Sync kód skupiny</label>\n          <div style="display:flex;gap:8px;">\n            <input id="mfSetSyncGrp" type="text" placeholder="Sdílený kód (stejný na všech zařízeních)" value="${t(i)}"\n              style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;font-family:monospace;box-sizing:border-box;">\n            <button id="mfSetSyncGen" style="padding:10px 14px;border-radius:10px;background:rgba(0,122,255,0.12);border:1px solid rgba(0,122,255,0.25);color:rgba(0,122,255,0.9);font-size:0.72rem;cursor:pointer;white-space:nowrap;">🎲 Vygenerovat</button>\n          </div>\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;">Zadej stejný kód na všech svých zařízeních pro synchronizaci sledovanosti.</div>\n        </div>\n\n        \x3c!-- Firebase accordion --\x3e\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;margin-bottom:8px;">\n          <button id="mfFbToggle" style="width:100%;padding:14px 16px;background:transparent;border:none;color:rgba(255,255,255,0.65);font-size:0.78rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-family:inherit;">\n            <span>🔥 Firebase konfigurace <span style="font-size:0.6rem;font-weight:400;opacity:0.5;">(pokročilé)</span></span>\n            <span id="mfFbChevron" style="transition:transform 0.2s;">▾</span>\n          </button>\n          <div id="mfFbFields" style="display:none;padding:0 16px 16px;border-top:1px solid rgba(255,255,255,0.06);">\n            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin:10px 0 12px;line-height:1.5;">\n              Firebase potřebuješ pro sync. Vytvořit zdarma na <a href="https://console.firebase.google.com" target="_blank" style="color:rgba(0,122,255,0.7);">console.firebase.google.com</a>\n            </div>\n            ${e("mfFbApi","API klíč","apiKey",o,"text","AIzaSy…")}\n            ${e("mfFbAuth","Auth doména","authDomain",o,"text","mujflix.firebaseapp.com")}\n            ${e("mfFbDb","Database URL","databaseURL",o,"url","https://mujflix-default-rtdb.firebaseio.com")}\n            ${e("mfFbProj","Project ID","projectId",o,"text","mujflix-xxxxx")}\n            ${e("mfFbApp","App ID","appId",o,"text","1:123:web:abc")}\n            <div id="mfFbStatus" style="font-size:0.65rem;margin-top:8px;color:rgba(255,255,255,0.3);"></div>\n          </div>\n        </div>\n      </div>\n\n      \x3c!-- Section: AI --\x3e\n      <div style="padding:16px 24px 0;">\n        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🤖 AI asistent</div>\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">\n          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">Anthropic API klíč</label>\n          <input id="mfSetAnthro" type="password" placeholder="sk-ant-…" value="${t(localStorage.getItem("mf_anthropic_key")||"")}"\n            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:monospace;">\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;">Potřeba pro AI doporučení. Získej na <a href="https://console.anthropic.com" target="_blank" style="color:rgba(0,122,255,0.7);">console.anthropic.com</a></div>\n        </div>\n\n        \x3c!-- AI Source stats --\x3e\n        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 14px;">\n          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n            <span style="font-size:0.68rem;font-weight:600;color:rgba(255,255,255,0.5);">✦ AI Source statistiky</span>\n            <button id="mfResetAiStats" style="font-size:0.6rem;background:transparent;border:none;color:rgba(255,100,100,0.6);cursor:pointer;padding:2px 6px;">Reset</button>\n          </div>\n          <div id="mfAiStatsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;"></div>\n        </div>\n      </div>\n\n      \x3c!-- Save button --\x3e\n      <div style="padding:24px 24px 0;">\n        <button id="mfSetSave" style="width:100%;padding:16px;border-radius:16px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.9rem;font-weight:700;cursor:pointer;letter-spacing:-0.2px;">Uložit nastavení</button>\n      </div>\n    `, s.appendChild(r), document.body.appendChild(s),
            function() {
              if (document.getElementById("mfSettStyle")) return;
              const e = document.createElement("style");
              e.id = "mfSettStyle", e.textContent = "\n      @keyframes mfSettFade { from{opacity:0} to{opacity:1} }\n      @keyframes mfSettUp { from{transform:translateY(40px);opacity:0} to{transform:none;opacity:1} }\n      #mfBeautifulSettings input::placeholder { color:rgba(255,255,255,0.2); }\n      #mfBeautifulSettings *::-webkit-scrollbar { width:3px; }\n      #mfBeautifulSettings *::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12);border-radius:3px; }\n    ", document.head.appendChild(e)
            }(),
            function(e, t) {
              e.querySelector("#mfSetClose").onclick = () => e.remove(), e.addEventListener("click", t => {
                t.target === e && e.remove()
              }), e.querySelector("#mfFbToggle").onclick = () => {
                const t = e.querySelector("#mfFbFields"),
                  n = e.querySelector("#mfFbChevron"),
                  o = "none" === t.style.display;
                t.style.display = o ? "block" : "none", n.style.transform = o ? "rotate(180deg)" : ""
              }, e.querySelector("#mfSetSyncGen").onclick = () => {
                const t = Math.random().toString(36).slice(2, 8).toUpperCase() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
                e.querySelector("#mfSetSyncGrp").value = t
              }, e.querySelector("#mfResetAiStats").onclick = () => {
                window.CinAI && (CinAI.resetStats(), n(), "function" == typeof showToast && showToast("AI statistiky vynulovány"))
              }, e.querySelectorAll("input").forEach(e => {
                e.addEventListener("focus", () => e.style.borderColor = "rgba(0,122,255,0.45)"), e.addEventListener("blur", () => e.style.borderColor = "rgba(255,255,255,0.09)")
              }), e.querySelector("#mfSetSave").onclick = () => {
                const n = e.querySelector("#mfSetTmdb").value.trim();
                n && localStorage.setItem("mf_tmdb_key", n);
                const o = e.querySelector("#mfSetSyncGrp").value.trim();
                o && (localStorage.setItem("mf_sync_group", o), window.MFSync && MFSync._db && MFSync.connectGroup(o));
                const i = {
                  apiKey: e.querySelector("#mfFbApi")?.value.trim() || t.apiKey || "",
                  authDomain: e.querySelector("#mfFbAuth")?.value.trim() || t.authDomain || "",
                  databaseURL: e.querySelector("#mfFbDb")?.value.trim() || t.databaseURL || "",
                  projectId: e.querySelector("#mfFbProj")?.value.trim() || t.projectId || "",
                  appId: e.querySelector("#mfFbApp")?.value.trim() || t.appId || "",
                  storageBucket: t.storageBucket || "",
                  messagingSenderId: t.messagingSenderId || ""
                };
                i.apiKey && i.databaseURL && localStorage.setItem("mf_firebase_cfg", JSON.stringify(i));
                const a = e.querySelector("#mfSetAnthro").value.trim();
                a && localStorage.setItem("mf_anthropic_key", a), e.remove(), "function" == typeof showToast && showToast("✅ Nastavení uloženo!", "success")
              }
            }(s, o), n()
        }()
      }
    }
  }(),
  function() {
    window.openSettings;
    window.openSettings = function() {
      MFSettings.open()
    };
    window.openApikeyOverlay;
    window.openApikeyOverlay = function() {
      MFSettings.open()
    }
  }();
const CINEMA_SOURCES = [{
  id: "svetserialu",
  label: "SvetSerialu",
  popupOnly: !0,
  movie: (e, t) => `https://svetserialu.to/?s=${encodeURIComponent(t||"")}`,
  tv: (e, t, n, o, i) => {
    const a = _svetSerialuSlugVariants(i, o)[0];
    return a ? `https://svetserialu.to/serial/${a}/s${String(t).padStart(2,"0")}e${String(n).padStart(2,"0")}` : `https://svetserialu.to/?s=${encodeURIComponent(o||"")}`
  },
  tvVariants: (e, t, n, o, i) => _svetSerialuSlugVariants(i, o).map(e => `https://svetserialu.to/serial/${e}/s${String(t).padStart(2,"0")}e${String(n).padStart(2,"0")}`)
}, {
  id: "bombuj",
  label: "Bombuj",
  movie: (e, t, n) => _bombujMovieUrlVariants(t, n)[0],
  movieVariants: (e, t, n) => _bombujMovieUrlVariants(t, n),
  tv: (e, t, n, o) => {
    const i = _czSlug(o);
    return i ? `https://serialy.bombuj.si/serial/${i}-${t}x${String(n).padStart(2,"0")}` : `https://serialy.bombuj.si/?s=${encodeURIComponent(o||"")}`
  },
  tvVariants: (e, t, n, o) => {
    const i = _czSlug(o);
    return i ? [`https://serialy.bombuj.si/serial/${i}-${t}x${String(n).padStart(2,"0")}`, `https://serialy.bombuj.si/serial/${i}-${t}x${n}`, `https://www.bombuj.si/serial/${i}/s${String(t).padStart(2,"0")}e${String(n).padStart(2,"0")}`] : [`https://serialy.bombuj.si/?s=${encodeURIComponent(o||"")}`]
  }
}];
let _cinState = {
  tmdbId: null,
  type: "movie",
  title: "",
  season: 1,
  ep: 1,
  sourceIdx: 0,
  totalSeasons: 1,
  totalEps: {},
  year: null
};

function openMovieInCinema(e, t, n) {
  if (window.MFCinemaPlayer) return window.MFCinemaPlayer.open(e, t, n);
  let o = 1,
    i = 1,
    a = e;
  if ("tv_ep" === (n = n || "movie") && String(e).includes("/")) {
    const t = String(e).split("/");
    a = t[0], o = parseInt(t[1]) || 1, i = parseInt(t[2]) || 1, n = "tv"
  }
  const s = (t || "").replace(/\s*[—–-]+\s*S\d+E\d+.*/i, "").trim();
  _cinState = {
    tmdbId: a,
    type: n,
    title: s,
    season: o,
    ep: i,
    sourceIdx: "movie" === n ? 1 : 0,
    totalSeasons: 1,
    totalEps: {},
    year: window._cinYear || null,
    siteSlug: window._cinSiteSlug || null
  }, window._cinSiteSlug = null, window._cinYear = null;
  const r = document.getElementById("cinemaModal");
  if (!r) return;
  r.parentNode !== document.body && document.body.appendChild(r);
  const l = typeof TMDB_KEY !== "undefined" ? TMDB_KEY : "",
    titleEl = document.getElementById("cinemaTitle"),
    subtitleEl = document.getElementById("cinemaSubtitle");
  titleEl && (titleEl.textContent = s || "Přehrávám…");
  subtitleEl && (subtitleEl.textContent = "tv" === n ? `S${String(o).padStart(2,"0")}E${String(i).padStart(2,"0")}` : "");
  r.classList.add("open"), r.style.display = "flex", r.style.visibility = "visible", r.style.opacity = "1", document.body.style.overflow = "hidden", _cinBuildSourceBar(), _cinLoadEpPicker();
  const
    c = () => {
      if (window.CinAI) {
        const e = document.getElementById("cinemaSourceBar");
        e && CinAI.renderAIBadge(e), CinAI.findBestSource(CINEMA_SOURCES, a, "tv" === n ? "tv" : "movie", o, i).then(e => {
          e !== _cinState.sourceIdx && (_cinState.sourceIdx = e, _cinBuildSourceBar()), _cinLoad()
        }).catch(() => _cinLoad())
      } else _cinLoad()
    };
  "movie" === n && a && l ? fetch(`https://api.themoviedb.org/3/movie/${a}?api_key=${l}&language=cs-CZ`).then(e => e.json()).then(async e => {
    const t = e.release_date || "";
    t && (_cinState.year = parseInt(t.substring(0, 4)) || null);
    let n = e.title || "";
    try {
      const e = ((await fetch(`https://api.themoviedb.org/3/movie/${a}/translations?api_key=${l}`).then(e => e.json())).translations || []).find(e => "CZ" === e.iso_3166_1 || "cs" === e.iso_639_1);
      e && e.data && e.data.title && (n = e.data.title)
    } catch (e) {}
    n && (_cinState.title = n.replace(/\s*[—–-]+\s*S\d+E\d+.*/i, "").trim())
  }).catch(() => {}).finally(() => c()) : a && l ? fetch(`https://api.themoviedb.org/3/tv/${a}?api_key=${l}&language=cs-CZ`).then(e => e.json()).then(async e => {
    const t = e.first_air_date || "";
    t && (_cinState.year = parseInt(t.substring(0, 4)) || null);
    let n = e.name || "";
    try {
      const e = ((await fetch(`https://api.themoviedb.org/3/tv/${a}/translations?api_key=${l}`).then(e => e.json())).translations || []).find(e => "CZ" === e.iso_3166_1 || "cs" === e.iso_639_1);
      e && e.data && e.data.name && (n = e.data.name)
    } catch (e) {}
    n && (_cinState.title = n.replace(/\s*[—–-]+\s*S\d+E\d+.*/i, "").trim())
  }).catch(() => {}).finally(() => c()) : c()
}

function _cinLoad() {
  const e = _cinState,
    t = CINEMA_SOURCES[e.sourceIdx],
    n = "movie" === e.type ? t.movie(e.tmdbId, e.title, e.year) : t.tv(e.tmdbId, e.season, e.ep, e.title, e.siteSlug || null);
  window.MF_DEBUG && console.log(`[Cinema] URL: ${n} | title: "${e.title}" | year: ${e.year}`);
  const o = document.getElementById("cinemaFileWarn");
  o && (o.style.display = "none");
  const i = document.getElementById("cinemaLoader");
  i && (i.style.display = "none"), t.popupOnly ? requestAnimationFrame(() => _cinShowPlayButton(n, t.label)) : requestAnimationFrame(() => _cinShowEmbedPlayer(n))
}

function _cinShowPlayButton(e, t) {
  const n = document.getElementById("cinemaFrameWrap");
  if (!n) return;
  n.innerHTML = "", document.querySelectorAll(".cin-extra-btn").forEach(e => e.remove());
  const o = _cinState;
  try {
    const i = o.totalEps[o.season] || 0,
      a = "tv" === o.type && (o.ep < i || o.season < o.totalSeasons),
      s = a ? o.ep < i ? o.season : o.season + 1 : null,
      r = a ? o.ep < i ? o.ep + 1 : 1 : null,
      l = a ? CINEMA_SOURCES[o.sourceIdx].tv(o.tmdbId, s, r, o.title, o.siteSlug || null) : null;
    if (a && l) {
      const e = document.getElementById("cinNextEpOverlay"),
        t = document.getElementById("cinNextEpTitle"),
        n = document.getElementById("cinNextEpBtn");
      e && t && n && (t.textContent = `${o.title} — S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}`, n.onclick = () => {
        e.style.display = "none", _cinState.season = s, _cinState.ep = r, document.getElementById("cinemaSubtitle").textContent = `S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}`;
        const t = document.getElementById("cinemaEpSel");
        t && (t.value = String(r));
        const n = document.getElementById("cinemaSeasonSel");
        n && (n.value = String(s)), _cinLoad()
      })
    }
    const c = encodeURIComponent(o.title || ""),
      d = "svetserialu" === CINEMA_SOURCES[o.sourceIdx].id ? `https://svetserialu.to/?s=${c}` : "movie" === o.type ? `https://www.bombuj.si/?s=${c}` : `https://serialy.bombuj.si/?s=${c}`,
      m = document.createElement("div");
    if (m.className = "cin-extra-btn", m.style.cssText = "display:flex;align-items:center;gap:5px;", a && l) {
      const e = document.createElement("button");
      e.innerHTML = `⏭ S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}`, e.style.cssText = "padding:5px 12px;border-radius:18px;background:rgba(0,122,255,0.18);border:1px solid rgba(0,122,255,0.35);color:rgba(0,122,255,0.9);font-size:0.72rem;font-weight:700;cursor:pointer;white-space:nowrap;", e.onclick = () => {
        _cinState.season = s, _cinState.ep = r, document.getElementById("cinemaSubtitle").textContent = `S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}`;
        const e = document.getElementById("cinemaEpSel");
        e && (e.value = String(r));
        const t = document.getElementById("cinemaSeasonSel");
        t && (t.value = String(s)), _cinLoad()
      }, m.appendChild(e)
    }
    const u = document.createElement("a");
    u.textContent = "🔍", u.href = d, u.target = "_blank", u.rel = "noopener", u.style.cssText = "padding:5px 10px;border-radius:18px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);font-size:0.72rem;text-decoration:none;", m.appendChild(u);
    const p = document.querySelector('#cinemaTopBar button[onclick*="closeCinema"]');
    p ? p.parentNode.insertBefore(m, p) : document.getElementById("cinemaTopBar")?.appendChild(m);
    const g = TMDB_KEY,
      f = "tv" === o.type ? `https://api.themoviedb.org/3/tv/${o.tmdbId}?api_key=${g}&language=cs` : `https://api.themoviedb.org/3/movie/${o.tmdbId}?api_key=${g}&language=cs`,
      y = i => {
        const c = i ? `background:url('${i}') center/cover no-repeat;` : "background:linear-gradient(135deg,#0a0a14 0%,#111122 100%);";
        n.innerHTML = `\n        <div style="position:absolute;inset:0;${c}">\n          \x3c!-- Tmavý overlay přes backdrop --\x3e\n          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.55) 50%,rgba(0,0,0,0.4) 100%);"></div>\n          \x3c!-- Blur vrstva pro glass efekt --\x3e\n          <div style="position:absolute;inset:0;backdrop-filter:blur(2px);"></div>\n\n          \x3c!-- Obsah uprostřed — tmavý glass panel garantuje čitelnost vždy --\x3e\n          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,'SF Pro Display',Inter,sans-serif;">\n\n            \x3c!-- Glass panel — izoluje texty od pozadí --\x3e\n            <div style="background:rgba(0,0,0,0.62);backdrop-filter:blur(28px) saturate(1.3);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:40px 52px;display:flex;flex-direction:column;align-items:center;gap:20px;box-shadow:0 32px 96px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.06);min-width:300px;max-width:460px;">\n\n              \x3c!-- Název + epizoda --\x3e\n              <div style="text-align:center;">\n                <div style="font-size:1.65rem;font-weight:800;color:#fff;letter-spacing:-0.5px;line-height:1.2;">${o.title||""}</div>\n                ${"tv"===o.type?`<div style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin-top:8px;letter-spacing:2px;font-weight:600;">S${String(o.season).padStart(2,"0")} · E${String(o.ep).padStart(2,"0")}</div>`:""}\n              </div>\n\n              \x3c!-- Hlavní play tlačítko --\x3e\n              <button onclick="(function(){const pw=screen.width,ph=screen.height,pop=window.open('${e.replace(/'/g,"\\'")}','MujFlixCinema','width='+pw+',height='+ph+',left=0,top=0,menubar=no,toolbar=no,location=no,scrollbars=yes');if(!pop||pop.closed)window.open('${e.replace(/'/g,"\\'")}','_blank','noopener');})()"\n                style="padding:18px 52px;border-radius:60px;background:linear-gradient(135deg,rgba(48,209,88,0.97),rgba(37,162,68,1));border:none;color:#fff;font-size:1.1rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25);transition:all 0.2s;letter-spacing:-0.2px;"\n                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 16px 52px rgba(48,209,88,0.6),inset 0 1px 0 rgba(255,255,255,0.25)'"\n                onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25)'">\n                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>\n                Přehrát\n              </button>\n\n              \x3c!-- Zdroj label — vždy čitelný na tmavém panelu --\x3e\n              <div style="font-size:0.68rem;color:rgba(255,255,255,0.55);letter-spacing:2px;text-transform:uppercase;font-weight:600;">${t}</div>\n\n              ${a&&l?`\n              \x3c!-- Další epizoda --\x3e\n              <button onclick="(function(){_cinState.season=${s};_cinState.ep=${r};document.getElementById('cinemaSubtitle').textContent='S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}';const e=document.getElementById('cinemaEpSel');if(e)e.value='${r}';const se=document.getElementById('cinemaSeasonSel');if(se)se.value='${s}';_cinLoad();})()"\n                style="display:flex;align-items:center;gap:9px;padding:11px 26px;border-radius:40px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:rgba(255,255,255,0.8);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:-apple-system,Inter,sans-serif;transition:all 0.18s;letter-spacing:-0.1px;"\n                onmouseover="this.style.background='rgba(255,255,255,0.16)';this.style.color='#fff'"\n                onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.8)'">\n                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">\n                  <polygon points="5 3 15 12 5 21 5 3" fill="currentColor" stroke="none"/>\n                  <line x1="19" y1="3" x2="19" y2="21"/>\n                </svg>\n                Další epizoda · S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}\n              </button>`:""}\n\n              \x3c!-- Hledat na webu — vždy viditelné na glass panelu --\x3e\n              <a href="${d}" target="_blank" rel="noopener"\n                style="font-size:0.68rem;color:rgba(255,255,255,0.4);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color 0.15s;font-weight:500;"\n                onmouseover="this.style.color='rgba(255,255,255,0.8)'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">\n                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>\n                Nenašlo se? Hledat na webu\n              </a>\n\n            </div>\x3c!-- /glass panel --\x3e\n          </div>\n        </div>\n      `
      };
    y(null), o.tmdbId && g && fetch(f).then(e => e.ok ? e.json() : null).then(e => {
      if (!e) return;
      const t = e.backdrop_path;
      if (t) {
        const e = `https://image.tmdb.org/t/p/w1280${t}`,
          n = new Image;
        n.onload = () => y(e), n.src = e
      }
    }).catch(() => {})
  } catch (e) {
    console.warn("[Cinema] _cinShowPlayButton error:", e)
  }
}

function _cinShowEmbedPlayer(e) {
  const t = document.getElementById("cinemaFrameWrap");
  if (!t) return;
  t.innerHTML = "";
  const n = _cinState,
    o = CINEMA_SOURCES[n.sourceIdx].label,
    i = "tv" === n.type ? `S${String(n.season).padStart(2,"0")}E${String(n.ep).padStart(2,"0")} · ${o}` : o,
    a = document.createElement("div");
  a.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;";
  const s = document.createElement("div");
  s.style.cssText = "flex:1;position:relative;background:#000;";
  const r = document.createElement("iframe");
  r.src = e, r.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:none;", r.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen"), r.setAttribute("referrerpolicy", "no-referrer"), r.setAttribute("allowfullscreen", "");
  // Bez sandbox — Bombuj a SvetSerialu potřebují volný přístup
  const l = document.createElement("div");
  l.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(0,0,0,0.92);pointer-events:none;z-index:2;transition:opacity 0.5s;";
  l.innerHTML = `
    <div style="font-size:2.5rem;">🎬</div>
    <div style="color:rgba(255,255,255,0.65);font-size:0.82rem;font-family:-apple-system,Inter,sans-serif;text-align:center;padding:0 24px;line-height:1.7;max-width:360px;">
      Načítám přehrávač…
      <br><span style="color:rgba(255,255,255,0.3);font-size:0.65rem;">Pokud zůstane prázdné, klikni na tlačítko níže</span>
    </div>
    <button id="_cinFallbackBtn" style="pointer-events:auto;padding:12px 28px;border-radius:50px;background:linear-gradient(135deg,#30d158,#25a244);border:none;color:#fff;font-size:0.82rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 8px 28px rgba(48,209,88,0.4);" onclick="window.open('${e.replace(/'/g,"\\'")}','_blank','noopener')">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Otevřít v nové kartě
    </button>`;
  let c = setTimeout(() => {
    if ("none" === l.style.display) return;
    l.innerHTML = `
      <div style="font-size:2rem;">⚠️</div>
      <div style="color:rgba(255,255,255,0.65);font-size:0.8rem;font-family:-apple-system,Inter,sans-serif;text-align:center;padding:0 24px;line-height:1.7;max-width:360px;">
        Zdroj <strong>${o}</strong> blokuje přehrávání v okně.<br>
        <span style="color:rgba(255,255,255,0.35);font-size:0.65rem;">Otevři přímo nebo zkus jiný zdroj.</span>
      </div>
      <button style="pointer-events:auto;padding:12px 28px;border-radius:50px;background:linear-gradient(135deg,#30d158,#25a244);border:none;color:#fff;font-size:0.82rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 8px 28px rgba(48,209,88,0.4);" onclick="window.open('${e.replace(/'/g,"\\'")}','_blank','noopener')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Otevřít v nové kartě
      </button>`;
    l.style.pointerEvents = "auto";
  }, 8e3);
  r.onload = () => {
    clearTimeout(c);
    // Zkontroluj po 1s jestli iframe má skutečný obsah (ne prázdná stránka)
    setTimeout(() => {
      try {
        const doc = r.contentDocument || r.contentWindow?.document;
        if (doc && (doc.title === "" || doc.body?.innerHTML === "")) {
          // Prázdný iframe — zobraz fallback
          l.style.pointerEvents = "auto";
          return;
        }
      } catch (ex) {
        // Cross-origin — to je OK, znamená že stránka se načetla
      }
      l.style.opacity = "0";
      setTimeout(() => { l.style.display = "none"; }, 500);
    }, 1000);
  };
  if (window.CinAI) {
    const srcId = CINEMA_SOURCES[_cinState.sourceIdx].id;
    CinAI.monitorIframe(r, srcId);
  }
  s.appendChild(r), s.appendChild(l);
  const d = document.createElement("div");
  d.style.cssText = "flex-shrink:0;background:rgba(10,10,16,0.97);border-top:1px solid rgba(255,255,255,0.07);padding:10px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;";
  const m = document.createElement("div");
  m.style.cssText = "flex:1;min-width:0;", m.innerHTML = `<div style="color:#fff;font-family:-apple-system,Inter,sans-serif;font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.title||""}</div>
    <div style="color:rgba(255,255,255,0.35);font-family:Inter,sans-serif;font-size:0.6rem;">${i}</div>`;
  const u = document.createElement("button");
  u.innerHTML = "🔗 Nová karta", u.style.cssText = "padding:8px 14px;border-radius:20px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);font-size:0.72rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;", u.onclick = () => window.open(e, "_blank", "noopener");
  d.appendChild(m), d.appendChild(u), a.appendChild(s), a.appendChild(d), t.appendChild(a)
}

function _cinShowLauncher(e) {
  const t = document.getElementById("cinemaFrameWrap");
  if (!t) return void console.warn("[Cinema] cinemaFrameWrap not found");
  t.innerHTML = "";
  const n = _cinState,
    o = CINEMA_SOURCES[n.sourceIdx].label,
    i = "tv" === n.type ? `S${String(n.season).padStart(2,"0")}E${String(n.ep).padStart(2,"0")} · ${o}` : o,
    a = document.createElement("div");
  a.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;font-family:Inter,sans-serif;padding:20px;text-align:center;";
  const s = document.createElement("div");
  s.textContent = "🎬", s.style.fontSize = "3rem";
  const r = document.createElement("div");
  r.textContent = n.title || "Přehrávám…", r.style.cssText = "font-size:1.1rem;font-weight:700;color:#fff;";
  const l = document.createElement("div");
  l.textContent = i, l.style.cssText = "font-size:0.75rem;color:rgba(255,255,255,0.4);";
  const c = document.createElement("div");
  c.style.cssText = "display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px;margin-top:8px;";
  const d = document.createElement("button");
  d.style.cssText = "padding:16px 24px;border-radius:16px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.95rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 24px rgba(0,122,255,0.35);", d.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> Spustit kino', d.addEventListener("click", function() {
    const t = window.screen.width,
      n = window.screen.height,
      o = window.open(e, "MujFlixCinema", "width=" + t + ",height=" + n + ",left=0,top=0,menubar=no,toolbar=no,location=no,status=no,scrollbars=no");
    o && !o.closed || window.open(e, "_blank", "noopener")
  });
  const m = document.createElement("div");
  m.textContent = "Přehrávač se otevře v novém okně. Pokud prohlížeč blokuje popup, klikni na ikonu v adresním řádku a povol.", m.style.cssText = "font-size:0.62rem;color:rgba(255,255,255,0.22);line-height:1.5;";
  const u = document.createElement("button");
  u.textContent = "🔗 Otevřít v nové kartě", u.style.cssText = "padding:12px;border-radius:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.55);font-size:0.8rem;cursor:pointer;", u.addEventListener("click", function() {
    window.open(e, "_blank", "noopener")
  }), c.appendChild(d), c.appendChild(m), c.appendChild(u), a.appendChild(s), a.appendChild(r), a.appendChild(l), a.appendChild(c), t.appendChild(a)
}

function _cinShowFileWarning(e) {
  let t = document.getElementById("cinemaFileWarn");
  t || (t = document.createElement("div"), t.id = "cinemaFileWarn", t.style.cssText = "position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;", document.getElementById("cinemaModal").appendChild(t)), t.style.display = "flex", t.innerHTML = `\n      <div style="background:rgba(28,28,30,0.97);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px 28px;max-width:420px;width:100%;text-align:center;font-family:Inter,sans-serif;">\n        <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>\n        <div style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:8px;">Chrome blokuje přehrávač</div>\n        <div style="font-size:0.75rem;color:rgba(255,255,255,0.45);line-height:1.6;margin-bottom:24px;">\n          Soubor je otevřen přes <code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;">file://</code> protokol.<br>\n          Chrome z bezpečnostních důvodů blokuje video iframy.<br><br>\n          <strong style="color:rgba(255,255,255,0.7);">Řešení:</strong> Otevři MůjFlix přes lokální server.\n        </div>\n\n        \x3c!-- Možnost 1: Otevřít přímo zdroj --\x3e\n        <button onclick="window.open('${e}','_blank','noopener')" style="width:100%;padding:14px;border-radius:14px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;">\n          <svg viewBox="0 0 24 24" width="15" height="15" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>\n            Otevřít na externím webu\n        </button>\n\n        \x3c!-- Možnost 2: Instrukce na lokální server --\x3e\n        <button onclick="document.getElementById('cinLocalServerHelp').style.display=document.getElementById('cinLocalServerHelp').style.display==='none'?'block':'none'" style="width:100%;padding:12px;border-radius:14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.78rem;font-weight:600;cursor:pointer;margin-bottom:10px;">\n          🖥️ Jak spustit lokální server?\n        </button>\n        <div id="cinLocalServerHelp" style="display:none;text-align:left;background:rgba(0,0,0,0.4);border-radius:12px;padding:16px;margin-bottom:10px;">\n          <div style="color:rgba(255,255,255,0.8);font-size:0.72rem;line-height:1.8;">\n            <strong style="color:#5ac8fa;">Možnost A — VS Code:</strong><br>\n            Nainstaluj rozšíření <em>Live Server</em> → klikni pravým na soubor → <em>Open with Live Server</em><br><br>\n            <strong style="color:#5ac8fa;">Možnost B — Python:</strong><br>\n            Otevři terminál ve složce se souborem a spusť:<br>\n            <code style="display:block;background:rgba(255,255,255,0.08);padding:8px 12px;border-radius:8px;margin-top:6px;font-size:0.75rem;color:#fff;">python -m http.server 8080</code>\n            <span style="color:rgba(255,255,255,0.4);font-size:0.65rem;">Pak otevři: http://localhost:8080/mujflix.html</span>\n          </div>\n        </div>\n\n        <button onclick="closeCinema()" style="width:100%;padding:10px;border-radius:12px;background:transparent;border:none;color:rgba(255,255,255,0.25);font-size:0.72rem;cursor:pointer;">Zavřít</button>\n      </div>`
}

function _cinBuildSourceBar() {
  const e = document.getElementById("cinemaSourceBar");
  e.innerHTML = "", CINEMA_SOURCES.forEach((t, n) => {
    const o = document.createElement("button");
    let i = t.label;
    if (window.CinAI) {
      const e = CinAI.loadStats(),
        n = CinAI.getScore(e[t.id]);
      if (e[t.id] && e[t.id].tries > 0) {
        i = (n >= 70 ? "🟢" : n >= 40 ? "🟡" : "🔴") + " " + t.label
      }
    }
    o.textContent = i, o.style.cssText = "background:" + (n === _cinState.sourceIdx ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)") + ";border:1px solid " + (n === _cinState.sourceIdx ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)") + ";color:" + (n === _cinState.sourceIdx ? "#fff" : "rgba(255,255,255,0.5)") + ";font-size:0.78rem;padding:7px 16px;border-radius:20px;cursor:pointer;font-family:-apple-system,Inter,sans-serif;font-weight:" + (n === _cinState.sourceIdx ? "700" : "500") + ";transition:all 0.18s;white-space:nowrap;letter-spacing:0.1px;backdrop-filter:blur(16px);", o.title = (window.CinAI ? "[AI skóre: " + CinAI.getScore(CinAI.loadStats()[t.id]) + "%] " : "") + "Přepnout zdroj na " + t.label, o.addEventListener("click", () => {
      _cinState.sourceIdx = n, _cinBuildSourceBar(), _cinLoad()
    }), e.appendChild(o)
  })
}
async function _cinLoadEpPicker() {
  const e = document.getElementById("cinemaEpPicker");
  if ("tv" !== _cinState.type) return void(e.style.display = "none");
  e.style.display = "flex";
  let t = _cinState.totalSeasons;
  const n = TMDB_KEY;
  if (n && _cinState.tmdbId) try {
    const e = await fetch(`https://api.themoviedb.org/3/tv/${_cinState.tmdbId}?api_key=${n}&language=cs`);
    if (e.ok) {
      const n = await e.json();
      t = n.number_of_seasons || 1, _cinState.totalSeasons = t, (n.seasons || []).forEach(e => {
        e.season_number > 0 && (_cinState.totalEps[e.season_number] = e.episode_count)
      })
    }
  } catch (e) {}
  _cinBuildSeasonSel(t)
}

function _cinBuildSeasonSel(e) {
  const t = document.getElementById("cinemaSeasonSel");
  t.innerHTML = "";
  for (let n = 1; n <= e; n++) {
    const e = document.createElement("option");
    e.value = n, e.textContent = "S" + String(n).padStart(2, "0"), n === _cinState.season && (e.selected = !0), t.appendChild(e)
  }
  _cinBuildEpSel(_cinState.season)
}

function _cinBuildEpSel(e) {
  const t = document.getElementById("cinemaEpSel");
  t.innerHTML = "";
  const n = _cinState.totalEps[e] || 20;
  for (let e = 1; e <= n; e++) {
    const n = document.createElement("option");
    n.value = e, n.textContent = "E" + String(e).padStart(2, "0"), e === _cinState.ep && (n.selected = !0), t.appendChild(n)
  }
}

function cinemaSwitchSeason() {
  const e = parseInt(document.getElementById("cinemaSeasonSel").value);
  _cinState.season = e, _cinState.ep = 1, _cinBuildEpSel(e), document.getElementById("cinemaEpSel").value = 1, _cinUpdateSubtitle(), _cinLoad()
}

function cinemaSwitchEp() {
  _cinState.ep = parseInt(document.getElementById("cinemaEpSel").value), _cinUpdateSubtitle(), _cinLoad()
}

function _cinUpdateSubtitle() {
  document.getElementById("cinemaSubtitle").textContent = `S${String(_cinState.season).padStart(2,"0")}E${String(_cinState.ep).padStart(2,"0")}`
}

function closeCinema() {
  const e = document.getElementById("cinemaFrameWrap");
  e && (e.innerHTML = "");
  const t = document.getElementById("cinemaModal");
  t && (t.classList.remove("open"), t.style.display = "none", t.style.visibility = "", t.style.opacity = "");
  document.getElementById("cinemaLoader").style.display = "none";
  const n = document.getElementById("cinemaFileWarn");
  n && (n.style.display = "none"), document.body.style.overflow = ""
}
window.openMovieInCinema = openMovieInCinema;
window.closeCinema = closeCinema;
document.addEventListener("keydown", function(e) {
    if ("Escape" === e.key) {
      const e = document.getElementById("cinemaModal");
      e && "none" !== e.style.display && closeCinema()
    }
  }),
  function() {
    "use strict";
    const e = document.createElement("style");
    e.id = "mf-fx-engine", e.textContent = "\n\n  /* ── SKELETON SCREEN BASE ── */\n  @keyframes mf-shimmer {\n    0%   { background-position: -600px 0; }\n    100% { background-position:  600px 0; }\n  }\n  .mf-skeleton {\n    position: relative;\n    overflow: hidden;\n    background: rgba(255,255,255,0.05);\n    border-radius: 12px;\n  }\n  .mf-skeleton::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    background: linear-gradient(\n      90deg,\n      transparent 0%,\n      rgba(255,255,255,0.055) 40%,\n      rgba(255,255,255,0.10) 50%,\n      rgba(255,255,255,0.055) 60%,\n      transparent 100%\n    );\n    background-size: 600px 100%;\n    animation: mf-shimmer 1.4s ease-in-out infinite;\n    border-radius: inherit;\n  }\n\n  /* Skeleton tile — stejný rozměr jako .disco-card */\n  .mf-skeleton-tile {\n    width: 130px;\n    min-width: 130px;\n    height: 195px;\n    border-radius: 20px;\n    flex-shrink: 0;\n  }\n  .mf-skeleton-tile.wide {\n    width: 200px;\n    min-width: 200px;\n    height: 115px;\n  }\n  .mf-skeleton-row {\n    display: flex;\n    gap: 10px;\n    overflow: hidden;\n    padding: 0 4px;\n  }\n  .mf-skeleton-section {\n    display: flex;\n    flex-direction: column;\n    gap: 14px;\n    padding: 24px 0 8px;\n  }\n  .mf-skeleton-header {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    padding: 0 4px;\n  }\n  .mf-skeleton-title {\n    height: 18px;\n    width: 140px;\n    border-radius: 8px;\n  }\n  .mf-skeleton-tag {\n    height: 14px;\n    width: 60px;\n    border-radius: 6px;\n  }\n\n  /* Skeleton episode card */\n  .mf-skeleton-ep {\n    display: flex;\n    gap: 14px;\n    align-items: center;\n    padding: 14px 16px;\n    border-radius: 16px;\n    background: rgba(255,255,255,0.03);\n    border: 1px solid rgba(255,255,255,0.05);\n  }\n  .mf-skeleton-ep-thumb {\n    width: 160px;\n    min-width: 160px;\n    height: 90px;\n    border-radius: 10px;\n  }\n  .mf-skeleton-ep-body {\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n  }\n  .mf-skeleton-line {\n    height: 12px;\n    border-radius: 6px;\n  }\n  .mf-skeleton-line.short  { width: 55%; }\n  .mf-skeleton-line.medium { width: 75%; }\n  .mf-skeleton-line.long   { width: 90%; }\n\n  /* ── ENTRANCE ANIMATIONS (200-300ms sweet spot) ── */\n  @keyframes mf-enter-up {\n    from { opacity: 0; transform: translateY(8px); }\n    to   { opacity: 1; transform: translateY(0); }\n  }\n  @keyframes mf-enter-fade {\n    from { opacity: 0; }\n    to   { opacity: 1; }\n  }\n  @keyframes mf-enter-scale {\n    from { opacity: 0; transform: scale(0.96); }\n    to   { opacity: 1; transform: scale(1); }\n  }\n  @keyframes mf-enter-left {\n    from { opacity: 0; transform: translateX(-10px); }\n    to   { opacity: 1; transform: translateX(0); }\n  }\n\n  /* ── EXIT ANIMATIONS (150ms fast) ── */\n  @keyframes mf-exit-down {\n    from { opacity: 1; transform: translateY(0); }\n    to   { opacity: 0; transform: translateY(6px); }\n  }\n  @keyframes mf-exit-scale {\n    from { opacity: 1; transform: scale(1); }\n    to   { opacity: 0; transform: scale(0.92); }\n  }\n\n  /* ── ATTENTION (500-800ms + bounce) ── */\n  @keyframes mf-attention-bounce {\n    0%   { transform: scale(1); }\n    20%  { transform: scale(1.12); }\n    40%  { transform: scale(0.96); }\n    60%  { transform: scale(1.06); }\n    80%  { transform: scale(0.99); }\n    100% { transform: scale(1); }\n  }\n  @keyframes mf-attention-shake {\n    0%,100% { transform: translateX(0); }\n    20%     { transform: translateX(-5px) rotate(-1deg); }\n    40%     { transform: translateX(5px)  rotate(1deg); }\n    60%     { transform: translateX(-3px) rotate(-0.5deg); }\n    80%     { transform: translateX(3px)  rotate(0.5deg); }\n  }\n  @keyframes mf-attention-glow {\n    0%,100% { box-shadow: 0 0 0 0 rgba(10,132,255,0); }\n    50%     { box-shadow: 0 0 0 8px rgba(10,132,255,0.25); }\n  }\n\n  /* ── FEEDBACK (<100ms) ── */\n  @keyframes mf-press {\n    0%   { transform: scale(1); }\n    40%  { transform: scale(0.93); }\n    100% { transform: scale(1); }\n  }\n  @keyframes mf-ripple {\n    0%   { transform: scale(0); opacity: 0.4; }\n    100% { transform: scale(3.5); opacity: 0; }\n  }\n\n  /* ── PROGRESS ILLUSION ── */\n  .mf-progress-illusion {\n    position: fixed;\n    top: 0; left: 0; right: 0;\n    height: 2px;\n    z-index: 9999;\n    background: linear-gradient(90deg, var(--accent, #0A84FF), var(--accent2, #34aadc));\n    transform-origin: left;\n    transform: scaleX(0);\n    transition: transform 0.25s ease;\n    box-shadow: 0 0 8px rgba(10,132,255,0.6);\n    border-radius: 0 2px 2px 0;\n    pointer-events: none;\n    opacity: 0;\n  }\n  .mf-progress-illusion.active { opacity: 1; }\n\n  /* ── OPTIMISTIC UI — watchlist button ── */\n  .tile-watchlist-btn.mf-optimistic {\n    animation: mf-attention-bounce 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;\n  }\n  .tile-watchlist-btn.mf-optimistic-add {\n    color: var(--accent) !important;\n    background: rgba(10,132,255,0.18) !important;\n    border-color: rgba(10,132,255,0.5) !important;\n    transform: scale(1.15) !important;\n    box-shadow: 0 0 16px rgba(10,132,255,0.4) !important;\n  }\n  .tile-watchlist-btn.mf-optimistic-remove {\n    color: rgba(255,255,255,0.3) !important;\n    transform: scale(0.85) !important;\n  }\n\n  /* ── STAGGER: mf-stagger-child gets stagger delay ── */\n  .mf-stagger-parent > * {\n    opacity: 0;\n    transform: translateY(16px);\n  }\n  .mf-stagger-parent.mf-stagger-done > * {\n    animation: mf-enter-up 0.16s cubic-bezier(0.16,1,0.3,1) forwards;\n  }\n\n  /* ── DISCO CARD ENTRANCE ── */\n  .disco-card.mf-card-enter {\n    animation: mf-enter-up 0.16s cubic-bezier(0.16,1,0.3,1) both;\n  }\n\n  /* ── EPISODE CARD ENTRANCE ── */\n  .episode-card.mf-card-enter {\n    animation: mf-enter-up 0.25s cubic-bezier(0.34,1.1,0.64,1) both;\n  }\n\n  /* ── SECTION ENTRANCE ── */\n  .disco-section.mf-section-enter {\n    animation: mf-enter-up 0.16s cubic-bezier(0.16,1,0.3,1) both;\n  }\n\n  /* ── MODAL CONTENT LINES — stagger within modal ── */\n  .modal-content .mf-reveal {\n    opacity: 0;\n    transform: translateY(10px);\n    animation: mf-enter-up 0.22s cubic-bezier(0.34,1.15,0.64,1) forwards;\n  }\n\n  /* ── TOAST MICRO-INTERACTION ── */\n  .toast.mf-toast-enter {\n    animation: mf-enter-up 0.26s cubic-bezier(0.34,1.28,0.64,1) both !important;\n  }\n  .toast.mf-toast-exit {\n    animation: mf-exit-down 0.15s ease forwards !important;\n  }\n\n  /* ── RIPPLE CONTAINER ── */\n  .mf-ripple-container {\n    position: relative;\n    overflow: hidden;\n  }\n  .mf-ripple-wave {\n    position: absolute;\n    border-radius: 50%;\n    background: rgba(255,255,255,0.18);\n    pointer-events: none;\n    animation: mf-ripple 0.5s ease-out forwards;\n    transform: scale(0);\n  }\n\n  /* ── DOCK BTN PRESS FEEDBACK ── */\n  .dock-btn:active,\n  .dock-btn.mf-pressed {\n    animation: mf-press 0.12s ease forwards;\n  }\n\n  /* ── HEADER SCROLL ANTICIPATION ── */\n  .mf-header.mf-anticipate {\n    transition: background 0.18s ease, backdrop-filter 0.18s ease !important;\n  }\n\n  /* ── TILE WRAPPER ENTRANCE ── */\n  .ps-tile-wrapper.mf-tile-enter {\n    animation: mf-enter-up 0.25s cubic-bezier(0.34,1.12,0.64,1) both;\n  }\n\n  /* ── SCORE BADGE ATTENTION ── */\n  .ai-match-badge.mf-attention {\n    animation: mf-attention-bounce 0.7s cubic-bezier(0.34,1.4,0.64,1);\n  }\n\n  /* ── GENRE CHIP ENTRANCE ── */\n  .disco-filter-btn.mf-chip-enter {\n    animation: mf-enter-left 0.22s cubic-bezier(0.34,1.1,0.64,1) both;\n  }\n\n  /* ── LOADING STATES ── */\n  .mf-loading-pulse {\n    animation: mf-shimmer 1.4s ease-in-out infinite;\n    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);\n    background-size: 400px 100%;\n  }\n\n  ", document.head.appendChild(e);
    const t = document.createElement("div");
    t.className = "mf-progress-illusion", t.id = "mfProgressBar", document.body.appendChild(t);
    let n = null,
      o = 0;

    function i(e, t) {
      const n = e.getBoundingClientRect(),
        o = (t?.clientX ?? n.left + n.width / 2) - n.left,
        i = (t?.clientY ?? n.top + n.height / 2) - n.top,
        a = .8 * Math.max(n.width, n.height),
        s = document.createElement("div");
      s.className = "mf-ripple-wave", s.style.cssText = `\n      width: ${a}px; height: ${a}px;\n      left: ${o-a/2}px; top: ${i-a/2}px;`, e.appendChild(s), s.addEventListener("animationend", () => s.remove())
    }
    window.MFProgress = {
      start() {
        t.classList.add("active"), o = 0, t.style.transform = "scaleX(0)", clearInterval(n), n = setInterval(() => {
          const e = .08 * (.92 - o) + .004;
          o = Math.min(o + e, .92), t.style.transform = `scaleX(${o})`
        }, 80)
      },
      finish() {
        clearInterval(n), o = 1, t.style.transform = "scaleX(1)", t.style.transition = "transform 0.18s ease", setTimeout(() => {
          t.style.opacity = "0", t.style.transition = "transform 0.18s ease, opacity 0.25s ease", setTimeout(() => {
            t.classList.remove("active"), t.style.opacity = "", t.style.transform = "scaleX(0)", t.style.transition = "", o = 0
          }, 280)
        }, 180)
      },
      error() {
        clearInterval(n), t.style.background = "linear-gradient(90deg, #ff3b30, #ff6b6b)", t.style.transform = "scaleX(1)", setTimeout(() => this.finish(), 800)
      }
    }, window.MFSkeleton = {
      buildDiscoSkeleton(e = 8) {
        const t = document.createElement("div");
        t.className = "mf-skeleton-section", t.dataset.mfSkeleton = "1";
        const n = document.createElement("div");
        n.className = "mf-skeleton-header", n.innerHTML = '\n        <div class="mf-skeleton mf-skeleton-title"></div>\n        <div class="mf-skeleton mf-skeleton-tag"></div>';
        const o = document.createElement("div");
        o.className = "mf-skeleton-row";
        for (let t = 0; t < e; t++) {
          const e = document.createElement("div");
          e.className = "mf-skeleton mf-skeleton-tile", e.style.animationDelay = .06 * t + "s", o.appendChild(e)
        }
        return t.appendChild(n), t.appendChild(o), t
      },
      buildEpisodeSkeleton(e = 5) {
        const t = document.createElement("div");
        t.dataset.mfSkeleton = "1", t.style.display = "flex", t.style.flexDirection = "column", t.style.gap = "8px", t.style.padding = "8px 0";
        for (let n = 0; n < e; n++) {
          const e = document.createElement("div");
          e.className = "mf-skeleton-ep", e.innerHTML = `\n          <div class="mf-skeleton mf-skeleton-ep-thumb" style="animation-delay:${.07*n}s"></div>\n          <div class="mf-skeleton-ep-body">\n            <div class="mf-skeleton mf-skeleton-line short" style="animation-delay:${.07*n+.04}s"></div>\n            <div class="mf-skeleton mf-skeleton-line medium" style="animation-delay:${.07*n+.08}s"></div>\n            <div class="mf-skeleton mf-skeleton-line long" style="animation-delay:${.07*n+.12}s"></div>\n          </div>`, t.appendChild(e)
        }
        return t
      },
      inject(e, t = "disco", n = 8) {
        this.remove(e);
        const o = "episode" === t ? this.buildEpisodeSkeleton(n) : this.buildDiscoSkeleton(n);
        return e.insertBefore(o, e.firstChild), o
      },
      remove(e) {
        e?.querySelectorAll("[data-mf-skeleton]").forEach(e => e.remove())
      }
    }, window.MFStagger = {
      run(e, t = {}) {
        const {
          delay: n = 15,
          duration: o = 160,
          easing: i = "cubic-bezier(0.16,1,0.3,1)",
          from: a = "bottom"
        } = t;
        [...e.children].forEach((e, t) => {
          e.style.opacity = "0", e.style.transform = "left" === a ? "translateX(-8px)" : "scale" === a ? "scale(0.94)" : "translateY(8px)", e.style.transition = "none", requestAnimationFrame(() => {
            setTimeout(() => {
              e.style.transition = `opacity ${o}ms ${i}, transform ${o}ms ${i}`, e.style.opacity = "1", e.style.transform = "none"
            }, t * n)
          })
        })
      },
      observe(e, t = {}) {
        if (!("IntersectionObserver" in window)) return void this.run(e, t);
        new IntersectionObserver((e, n) => {
          e.forEach(e => {
            e.isIntersecting && (this.run(e.target, t), n.unobserve(e.target))
          })
        }, {
          threshold: .06
        }).observe(e)
      }
    }, document.querySelectorAll(".dock-btn").forEach(e => {
      e.classList.add("mf-ripple-container"), e.addEventListener("click", t => {
        i(e, t)
      })
    }), document.addEventListener("click", function(e) {
      const t = e.target.closest(".tile-watchlist-btn");
      if (!t) return;
      const n = t.classList.contains("in-watchlist");
      t.classList.remove("mf-optimistic", "mf-optimistic-add", "mf-optimistic-remove"), t.offsetWidth, n ? (t.classList.add("mf-optimistic-remove"), setTimeout(() => t.classList.remove("mf-optimistic-remove"), 200)) : (t.classList.add("mf-optimistic-add"), t.classList.add("mf-optimistic"), i(t, e)), setTimeout(() => {
        t.classList.remove("mf-optimistic-add", "mf-optimistic", "mf-optimistic-remove")
      }, 600)
    }, {
      capture: !0
    }), window.MFAttention = {
      bounce(e, t = 0) {
        setTimeout(() => {
          e.style.animation = "none", e.offsetWidth, e.style.animation = "mf-attention-bounce 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards", e.addEventListener("animationend", () => {
            e.style.animation = ""
          }, {
            once: !0
          })
        }, t)
      },
      glow(e, t = 0) {
        setTimeout(() => {
          e.style.animation = "none", e.offsetWidth, e.style.animation = "mf-attention-glow 0.7s ease-in-out", e.addEventListener("animationend", () => {
            e.style.animation = ""
          }, {
            once: !0
          })
        }, t)
      },
      shake(e) {
        e.style.animation = "none", e.offsetWidth, e.style.animation = "mf-attention-shake 0.5s ease", e.addEventListener("animationend", () => {
          e.style.animation = ""
        }, {
          once: !0
        })
      }
    };
    const a = window.loadDiscoContent;
    "function" == typeof a && (window.loadDiscoContent = function(...e) {
      MFProgress.start();
      const t = a.apply(this, e);
      return t && "function" == typeof t.then ? t.then(() => MFProgress.finish()).catch(() => MFProgress.error()) : setTimeout(() => MFProgress.finish(), 600), t
    });
    const s = new IntersectionObserver(e => {
        e.forEach(e => {
          if (e.isIntersecting && !e.target._mfEntered) {
            e.target._mfEntered = !0;
            const t = e.target.getBoundingClientRect().left < .3 * window.innerWidth,
              n = e.target,
              o = Math.max(0, e.intersectionRatio),
              i = t ? 0 : Math.round(40 * (1 - o));
            n.style.opacity = "0", n.style.transform = t ? "translateX(-12px)" : "translateY(16px)", setTimeout(() => {
              n.style.transition = "opacity 0.24s cubic-bezier(0.34,1.1,0.64,1), transform 0.26s cubic-bezier(0.34,1.12,0.64,1)", n.style.opacity = "1", n.style.transform = "none"
            }, i), s.unobserve(n)
          }
        })
      }, {
        threshold: .05,
        rootMargin: "0px 0px -20px 0px"
      }),
      r = window.renderDiscoRow;
    "function" == typeof r && (window.renderDiscoRow = function(e, t, n, o) {
      r.apply(this, arguments);
      const i = e.querySelector(".disco-row:last-child .disco-row-scroll");
      i && setTimeout(() => {
        MFStagger.observe(i, {
          delay: 15,
          duration: 160
        })
      }, 0)
    });
    const l = document.getElementById("discoBody");
    if (l) {
      new MutationObserver(e => {
        e.forEach(e => {
          e.addedNodes.forEach(e => {
            if (e instanceof HTMLElement && e.classList?.contains("disco-section")) {
              const t = [...l.children].indexOf(e);
              e.style.opacity = "0", e.style.transform = "translateY(6px)", setTimeout(() => {
                e.style.transition = "opacity 0.16s cubic-bezier(0.16,1,0.3,1), transform 0.16s cubic-bezier(0.16,1,0.3,1)", e.style.opacity = "1", e.style.transform = "none"
              }, 20 * t);
              const n = e.querySelector(".disco-row-scroll");
              n && setTimeout(() => {
                [...n.querySelectorAll(".disco-card")].forEach((e, n) => {
                  e.style.opacity = "0", e.style.transform = "translateY(4px) scale(0.98)", setTimeout(() => {
                    e.style.transition = "opacity 0.14s cubic-bezier(0.16,1,0.3,1), transform 0.14s cubic-bezier(0.16,1,0.3,1)", e.style.opacity = "1", e.style.transform = "none"
                  }, 12 * n)
                })
              }, 0)
            }
          })
        })
      }).observe(l, {
        childList: !0,
        subtree: !1
      })
    }
    const c = new MutationObserver(e => {
      e.forEach(e => {
        if (0 === e.addedNodes.length) return;
        const t = [...e.target.querySelectorAll(".episode-card:not([data-mf-animated])")];
        t.length < 2 || t.forEach((e, t) => {
          e.dataset.mfAnimated = "1", e.style.opacity = "0", e.style.transform = "translateY(12px)", setTimeout(() => {
            e.style.transition = "opacity 0.23s cubic-bezier(0.34,1.1,0.64,1), transform 0.25s cubic-bezier(0.34,1.1,0.64,1)", e.style.opacity = "1", e.style.transform = "none"
          }, 50 * t)
        })
      })
    });

    function d() {
      document.querySelectorAll(".episodes-list, .ep-list, #episodesList, .modal-ep-list, .modal-body").forEach(e => {
        e._mfEpWatched || (e._mfEpWatched = !0, c.observe(e, {
          childList: !0
        }))
      })
    }
    d();
    const m = document.querySelector(".modal-overlay");
    m && new MutationObserver(() => d()).observe(m, {
      attributes: !0,
      attributeFilter: ["class"]
    });
    const u = window.loadDiscoContent;
    "function" != typeof u || u._mfPatched || (u._mfPatched = !0, window.loadDiscoContent = function(e, t) {
      const n = document.getElementById("discoBody");
      n && (n.style.opacity = "0.4", n.style.transition = "opacity 0.15s ease", n.querySelector("[data-mf-skeleton]") || (n.insertBefore(MFSkeleton.buildDiscoSkeleton(10), n.firstChild), n.insertBefore(MFSkeleton.buildDiscoSkeleton(10), n.firstChild)));
      const o = u.apply(this, arguments),
        i = () => {
          n && (MFSkeleton.remove(n), n.style.opacity = "1", n.style.transition = "opacity 0.3s ease", setTimeout(() => {
            n.style.transition = ""
          }, 350)), MFProgress.finish()
        };
      return o && "function" == typeof o.then ? o.then(i).catch(() => {
        i(), MFProgress.error()
      }) : setTimeout(i, 500), o
    });
    const p = new MutationObserver(() => {
        [...document.querySelectorAll(".disco-filter-btn:not([data-mf-staggered])")].forEach((e, t) => {
          e.dataset.mfStaggered = "1", e.style.opacity = "0", e.style.transform = "translateX(-6px)", setTimeout(() => {
            e.style.transition = "opacity 0.2s cubic-bezier(0.34,1.1,0.64,1), transform 0.22s cubic-bezier(0.34,1.1,0.64,1)", e.style.opacity = "", e.style.transform = "", setTimeout(() => {
              e.style.transition = ""
            }, 250)
          }, 50 * t)
        })
      }),
      g = document.querySelector(".disco-filters, .filter-bar, #discoFilters");
    g && p.observe(g, {
      childList: !0
    });
    const f = window.showToast;
    "function" == typeof f && (window.showToast = function(e, t, n) {
      f.apply(this, arguments), requestAnimationFrame(() => {
        const e = document.querySelector(".toast:last-child, .toast");
        e && !e._mfToasted && (e._mfToasted = !0, e.classList.add("mf-toast-enter"))
      })
    });
    const y = document.querySelector(".mf-header");
    if (y) {
      let e = 0,
        t = !1;
      const n = document.querySelector(".ps-menu-scene") || window;
      (n === window ? window : n).addEventListener("scroll", function() {
        t || (t = !0, requestAnimationFrame(() => {
          t = !1;
          const o = n === window ? window.scrollY : n.scrollTop,
            i = Math.abs(o - e);
          e = o, i > 6 && o > 30 && y.classList.add("mf-anticipate"), o < 10 && y.classList.remove("mf-anticipate")
        }))
      }, {
        passive: !0
      })
    }
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        document.querySelectorAll(".ps-tile-wrapper").forEach((e, t) => {
          e.style.opacity = "0", e.style.transform = "translateY(20px)", setTimeout(() => {
            e.style.transition = "opacity 0.26s cubic-bezier(0.34,1.1,0.64,1), transform 0.28s cubic-bezier(0.34,1.12,0.64,1)", e.style.opacity = "1", e.style.transform = "none", setTimeout(() => {
              e.style.transition = ""
            }, 320)
          }, 120 + 50 * t)
        })
      }, 200)
    }), document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        const e = document.querySelector('.dock-btn.active, .dock-btn[data-active="true"]');
        e && MFAttention.bounce(e, 600)
      }, 800)
    });
    const h = window.updateWatchlistBadge;
    "function" == typeof h && (window.updateWatchlistBadge = function() {
      h.apply(this, arguments);
      const e = document.querySelector(".dock-badge");
      e && requestAnimationFrame(() => MFAttention.bounce(e, 100))
    }), console.info("[MůjFlix FX Engine v2.0] ✓ Skeleton · OptimisticUI · ProgressIllusion · Stagger · Attention · Anticipation")
  }(),
  function() {
    "use strict";
    const e = document.createElement("style");
    e.id = "mf-disco-fx", e.textContent = "\n\n  /* TYPOGRAPHY POLISH */\n  .disco-row-title {\n    font-size: clamp(0.95rem, 2vw, 1.05rem) !important;\n    font-weight: 800 !important;\n    letter-spacing: -0.35px !important;\n    line-height: 1.15 !important;\n  }\n  .disco-card-name {\n    font-size: clamp(0.66rem, 1.4vw, 0.72rem) !important;\n    font-weight: 800 !important;\n    letter-spacing: -0.15px !important;\n    line-height: 1.25 !important;\n  }\n  .disco-nav-item {\n    font-size: clamp(0.68rem, 1.5vw, 0.75rem) !important;\n    letter-spacing: 0.1px !important;\n    font-weight: 700 !important;\n  }\n\n  /* SPACING — 48px rail matches new header padding */\n  .disco-section { padding-bottom: 0 !important; }\n  .disco-row-header { padding: 0 48px 14px !important; }\n  .disco-row-scroll { gap: 10px !important; padding-left: 48px !important; padding-right: 48px !important; padding-bottom: 16px !important; }\n\n  /* SKELETON SCREENS */\n  @keyframes mf-disco-shimmer {\n    0%   { background-position: -700px 0; }\n    100% { background-position:  700px 0; }\n  }\n  .mf-disco-skel {\n    background: rgba(255,255,255,0.045);\n    border-radius: 8px;\n    position: relative;\n    overflow: hidden;\n    flex-shrink: 0;\n  }\n  .mf-disco-skel::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    background: linear-gradient(\n      105deg,\n      transparent 20%,\n      rgba(255,255,255,0.055) 45%,\n      rgba(255,255,255,0.11) 50%,\n      rgba(255,255,255,0.055) 55%,\n      transparent 80%\n    );\n    background-size: 700px 100%;\n    animation: mf-disco-shimmer 1.5s ease-in-out infinite;\n    border-radius: inherit;\n  }\n  .mf-disco-skel-card  { width: 154px; height: 231px; }\n  .mf-disco-skel-wide  { width: 220px; height: 130px; }\n  .mf-disco-skel-title { width: 160px; height: 20px; border-radius: 8px; margin-bottom: 10px; }\n  .mf-disco-skel-tag   { width: 70px;  height: 14px; border-radius: 6px; }\n  .mf-disco-skel-row   { display: flex; gap: 10px; overflow: hidden; }\n  .mf-disco-skel-section { padding: 16px 0 8px; display: flex; flex-direction: column; gap: 12px; }\n  .mf-disco-skel-hdr   { display: flex; align-items: center; gap: 10px; }\n\n  /* KEYBOARD FOCUS IN DISCO */\n  .mf-disco-kb-focus {\n    outline: none !important;\n    box-shadow:\n      0 0 0 2px rgba(255,255,255,0.8),\n      0 16px 48px rgba(0,0,0,0.85) !important;\n    transform: scale(1.07) translateY(-6px) !important;\n    z-index: 10;\n    position: relative;\n    transition:\n      transform 0.22s cubic-bezier(0.25,1,0.5,1),\n      box-shadow 0.2s ease !important;\n  }\n  .mf-disco-kb-focus .disco-card-info {\n    opacity: 1 !important;\n    transform: translateY(0) !important;\n  }\n  .mf-disco-kb-focus .disco-card-overlay {\n    opacity: 1 !important;\n  }\n  .mf-disco-row-active .disco-row-title {\n    color: #fff !important;\n    transition: color 0.2s ease;\n  }\n\n  /* ATTENTION BOUNCE on kb-selected card */\n  @keyframes mf-disco-attention {\n    0%   { transform: scale(1.07) translateY(-6px); }\n    25%  { transform: scale(1.11) translateY(-9px); }\n    55%  { transform: scale(1.06) translateY(-5px); }\n    75%  { transform: scale(1.08) translateY(-7px); }\n    100% { transform: scale(1.07) translateY(-6px); }\n  }\n  .mf-disco-kb-focus.mf-disco-attention-play {\n    animation: mf-disco-attention 0.65s cubic-bezier(0.34,1.56,0.64,1);\n  }\n\n  /* OPTIMISTIC CHIP */\n  .disco-nav-item.mf-chip-optimistic {\n    background: rgba(255,255,255,0.14) !important;\n    border-color: rgba(255,255,255,0.3) !important;\n    color: #fff !important;\n    transition: background 0.08s ease, border-color 0.08s ease, color 0.08s ease !important;\n  }\n\n  /* KEYBOARD HINT */\n  #mf-disco-kb-hint {\n    position: fixed;\n    bottom: 90px;\n    left: 50%;\n    transform: translateX(-50%) translateY(8px);\n    background: rgba(10,10,16,0.92);\n    backdrop-filter: blur(20px);\n    border: 1px solid rgba(255,255,255,0.1);\n    border-radius: 50px;\n    padding: 7px 18px;\n    font-family: -apple-system, 'SF Pro Text', sans-serif;\n    font-size: 0.6rem;\n    font-weight: 600;\n    color: rgba(255,255,255,0.5);\n    letter-spacing: 0.3px;\n    pointer-events: none;\n    z-index: 9999;\n    opacity: 0;\n    transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.34,1.2,0.64,1);\n    white-space: nowrap;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n  #mf-disco-kb-hint.visible {\n    opacity: 1;\n    transform: translateX(-50%) translateY(0);\n  }\n  #mf-disco-kb-hint kbd {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    background: rgba(255,255,255,0.08);\n    border: 1px solid rgba(255,255,255,0.14);\n    border-radius: 5px;\n    padding: 1px 5px;\n    font-size: 0.55rem;\n    font-weight: 700;\n    color: rgba(255,255,255,0.6);\n    line-height: 1.4;\n  }\n\n  /* ATTENTION bounce reuse */\n  @keyframes mf-attention-bounce {\n    0%   { transform: scale(1); }\n    20%  { transform: scale(1.14); }\n    40%  { transform: scale(0.96); }\n    60%  { transform: scale(1.07); }\n    80%  { transform: scale(0.99); }\n    100% { transform: scale(1); }\n  }\n\n  /* ── REDESIGN OVERRIDES ── */\n  .disco-header {\n    background: rgba(6,6,9,0.92) !important;\n    backdrop-filter: blur(44px) saturate(1.8) !important;\n    -webkit-backdrop-filter: blur(44px) saturate(1.8) !important;\n    border-bottom: 0.5px solid rgba(255,255,255,0.06) !important;\n    position: sticky !important;\n    top: 0 !important;\n    z-index: 20 !important;\n    box-shadow: 0 1px 0 rgba(0,0,0,0.5) !important;\n  }\n  .disco-nav-item.active {\n    background: rgba(10,132,255,0.16) !important;\n    border-color: rgba(10,132,255,0.38) !important;\n    color: #fff !important;\n    box-shadow: 0 0 0 0.5px rgba(10,132,255,0.4) !important;\n  }\n  .disco-hero-btn.primary {\n    background: var(--accent) !important;\n    color: #fff !important;\n    box-shadow: 0 4px 18px rgba(10,132,255,0.4) !important;\n  }\n  .disco-hero-btn.primary:hover {\n    background: #1a8fff !important;\n    box-shadow: 0 8px 28px rgba(10,132,255,0.55) !important;\n  }\n  .disco-card {\n    border-radius: 12px !important;\n  }\n  .disco-card-inner {\n    border-radius: 12px !important;\n  }\n  .disco-card-img {\n    border-radius: 12px !important;\n  }\n  .disco-card-rating {\n    color: rgba(255,200,50,0.85) !important;\n  }\n  ", document.head.appendChild(e);
    const t = {
        open: !1,
        kbActive: !1,
        rowIdx: 0,
        cardIdx: 0,
        rows: [],
        hintTimer: null
      },
      n = document.createElement("div");

    function o() {
      clearTimeout(t.hintTimer), n.classList.remove("visible")
    }

    function i() {
      return [...document.querySelectorAll("#discoBody .disco-row-scroll")].filter(e => e.querySelectorAll(".disco-card").length > 0)
    }

    function a(e) {
      return [...e.querySelectorAll(".disco-card")]
    }

    function s() {
      document.querySelectorAll(".mf-disco-kb-focus").forEach(e => e.classList.remove("mf-disco-kb-focus", "mf-disco-attention-play")), document.querySelectorAll(".mf-disco-row-active").forEach(e => e.classList.remove("mf-disco-row-active"))
    }

    function r(e, o) {
      t.rowIdx = e, t.cardIdx = o, t.rows = i(), s();
      const r = t.rows[e];
      if (!r) return;
      const l = r.closest(".disco-row");
      l && l.classList.add("mf-disco-row-active");
      const c = a(r);
      t.cardIdx = Math.min(o, c.length - 1);
      const d = c[t.cardIdx];
      d && (d.classList.add("mf-disco-kb-focus"), d.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      }), r.closest(".disco-section")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      }), clearTimeout(d._discoAttnTimer), d._discoAttnTimer = setTimeout(() => {
        d.classList.add("mf-disco-attention-play"), d.addEventListener("animationend", () => d.classList.remove("mf-disco-attention-play"), {
          once: !0
        })
      }, 520), n.classList.add("visible"), clearTimeout(t.hintTimer), t.hintTimer = setTimeout(() => n.classList.remove("visible"), 3500))
    }
    n.id = "mf-disco-kb-hint", n.innerHTML = "<kbd>&#8593;&#8595;</kbd> Radky &nbsp; <kbd>&#8592;&#8594;</kbd> Karty &nbsp; <kbd>Enter</kbd> Prehrat &nbsp; <kbd>Esc</kbd> Zpet", document.body.appendChild(n), document.addEventListener("keydown", function(e) {
      if (!t.open) return;
      const n = document.getElementById("universeOverlay");
      if (!n?.classList.contains("open")) return;
      if (document.activeElement?.matches("input,textarea,select")) return;
      const l = e.key;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " "].includes(l)) return;
      if ("Escape" === l) return;
      if (e.preventDefault(), e.stopPropagation(), t.rows = i(), !t.rows.length) return;
      if (!t.kbActive) return t.kbActive = !0, void r(0, 0);
      const c = t.rows[t.rowIdx],
        d = c ? a(c) : [];
      if ("ArrowRight" === l)
        if (t.cardIdx + 1 < d.length) r(t.rowIdx, t.cardIdx + 1);
        else {
          const e = c?.closest(".disco-row")?.querySelector(".disco-row-nav-btn:last-child");
          e && (e.style.animation = "none", e.offsetWidth, e.style.animation = "mf-attention-bounce 0.38s cubic-bezier(0.34,1.5,0.64,1)", e.addEventListener("animationend", () => e.style.animation = "", {
            once: !0
          }))
        }
      else if ("ArrowLeft" === l)
        if (t.cardIdx - 1 >= 0) r(t.rowIdx, t.cardIdx - 1);
        else {
          const e = c?.closest(".disco-row")?.querySelector(".disco-row-nav-btn:first-child");
          e && (e.style.animation = "none", e.offsetWidth, e.style.animation = "mf-attention-bounce 0.38s cubic-bezier(0.34,1.5,0.64,1)", e.addEventListener("animationend", () => e.style.animation = "", {
            once: !0
          }))
        }
      else if ("ArrowDown" === l) {
        if (t.rowIdx + 1 < t.rows.length) {
          const e = a(t.rows[t.rowIdx + 1]);
          r(t.rowIdx + 1, Math.min(t.cardIdx, e.length - 1))
        }
      } else if ("ArrowUp" === l)
        if (t.rowIdx > 0) {
          const e = a(t.rows[t.rowIdx - 1]);
          r(t.rowIdx - 1, Math.min(t.cardIdx, e.length - 1))
        } else t.kbActive = !1, s(), o(), "function" == typeof closeUniverse && closeUniverse();
      else if ("Enter" === l || " " === l) {
        const e = document.querySelector(".mf-disco-kb-focus");
        e && (e.classList.remove("mf-disco-attention-play"), e.offsetWidth, e.classList.add("mf-disco-attention-play"), setTimeout(() => e.click(), 80))
      }
    }, {
      capture: !0
    });
    const l = window.openUniverse,
      c = window.closeUniverse;
    "function" != typeof l || l._dFxOpen || (window.openUniverse = function() {
      t.open = !0, t.kbActive = !1, t.rowIdx = 0, t.cardIdx = 0;
      const e = l.apply(this, arguments);
      return setTimeout(f, 120), e
    }, window.openUniverse._dFxOpen = !0), "function" != typeof c || c._dFxClose || (window.closeUniverse = function() {
      return t.open = !1, t.kbActive = !1, s(), o(), c.apply(this, arguments)
    }, window.closeUniverse._dFxClose = !0);
    const d = document.getElementById("universeOverlay");

    function m(e) {
      u(e), [
        [8, !1],
        [10, !0],
        [10, !1]
      ].forEach(([t, n], o) => {
        const i = function(e, t) {
          const n = document.createElement("div");
          n.className = "mf-disco-skel-section", n.dataset.mfDiscoSkeleton = "1", n.innerHTML = '<div class="mf-disco-skel-hdr">\n      <div class="mf-disco-skel mf-disco-skel-title"></div>\n      <div class="mf-disco-skel mf-disco-skel-tag" style="animation-delay:.1s"></div>\n    </div>';
          const o = document.createElement("div");
          o.className = "mf-disco-skel-row";
          for (let n = 0; n < e; n++) {
            const e = document.createElement("div");
            e.className = "mf-disco-skel " + (t ? "mf-disco-skel-wide" : "mf-disco-skel-card"), e.style.animationDelay = .05 * n + "s", o.appendChild(e)
          }
          return n.appendChild(o), n
        }(t, n);
        i.style.opacity = "0", e.appendChild(i), setTimeout(() => {
          i.style.transition = "opacity 0.22s ease", i.style.opacity = "1", setTimeout(() => i.style.transition = "", 250)
        }, 80 * o)
      })
    }

    function u(e) {
      e?.querySelectorAll("[data-mf-disco-skeleton]").forEach(e => {
        e.style.transition = "opacity 0.15s ease", e.style.opacity = "0", setTimeout(() => e.remove(), 160)
      })
    }
    d && new MutationObserver(() => {
      !d.classList.contains("open") && t.open && (t.open = !1, t.kbActive = !1, s(), o())
    }).observe(d, {
      attributes: !0,
      attributeFilter: ["class"]
    });
    const p = window.loadDiscoContent;
    "function" != typeof p || p._dFxPatched || (window.loadDiscoContent = async function() {
      const e = document.getElementById("discoBody");
      let n;
      e && (e.innerHTML = "", m(e)), window.MFProgress && MFProgress.start();
      try {
        n = await p.apply(this, arguments)
      } catch (e) {
        throw window.MFProgress && MFProgress.error(), e
      }
      return e && u(e), window.MFProgress && MFProgress.finish(), t.open && (t.kbActive = !1, s(), t.rows = []), requestAnimationFrame(() => {
        e && (e.querySelectorAll(".disco-row-scroll").forEach((e, t) => {
          [...e.querySelectorAll(".disco-card:not([data-dfx])")].forEach((e, n) => {
            e.dataset.dfx = "1", e.style.opacity = "0", e.style.transform = "translateY(18px) scale(0.95)";
            setTimeout(() => {
              e.style.transition = "opacity 0.24s cubic-bezier(0.34,1.1,0.64,1), transform 0.26s cubic-bezier(0.34,1.12,0.64,1)", e.style.opacity = "1", e.style.transform = "none", setTimeout(() => e.style.transition = "", 280)
            }, 60 * t + 50 * n)
          })
        }), e.querySelectorAll(".disco-section:not([data-dhdr])").forEach((e, t) => {
          e.dataset.dhdr = "1";
          const n = e.querySelector(".disco-row-header");
          n && (n.style.opacity = "0", n.style.transform = "translateX(-12px)", setTimeout(() => {
            n.style.transition = "opacity 0.22s cubic-bezier(0.34,1.1,0.64,1), transform 0.24s cubic-bezier(0.34,1.1,0.64,1)", n.style.opacity = "1", n.style.transform = "none", setTimeout(() => n.style.transition = "", 260)
          }, 60 * t))
        }))
      }), n
    }, window.loadDiscoContent._dFxPatched = !0);
    const g = window.discoFilter;

    function f() {
      [...document.querySelectorAll(".disco-nav-item:not([data-chip-s])")].forEach((e, t) => {
        e.dataset.chipS = "1", e.style.opacity = "0", e.style.transform = "translateX(-10px) scale(0.92)", setTimeout(() => {
          e.style.transition = "opacity 0.2s cubic-bezier(0.34,1.1,0.64,1), transform 0.22s cubic-bezier(0.34,1.15,0.64,1)", e.style.opacity = "1", e.style.transform = "none", setTimeout(() => e.style.transition = "", 250)
        }, 50 * t)
      })
    }
    "function" != typeof g || g._dFxChip || (window.discoFilter = function(e) {
      return document.querySelectorAll(".disco-nav-item").forEach(e => e.classList.remove("mf-chip-optimistic")), e.classList.add("mf-chip-optimistic"), e.style.transform = "scale(0.93)", setTimeout(() => {
        e.style.transition = "transform 0.22s cubic-bezier(0.34,1.4,0.64,1)", e.style.transform = "", setTimeout(() => e.style.transition = "", 250)
      }, 60), g.apply(this, arguments)
    }, window.discoFilter._dFxChip = !0);
    const y = document.getElementById("discoBody");
    y && new MutationObserver(() => {
      t.open && t.kbActive && (t.rows = i(), t.rows[t.rowIdx] || (t.rowIdx = 0, t.cardIdx = 0, t.rows.length && r(0, 0)))
    }).observe(y, {
      childList: !0
    }), console.info("[MujFlix FX Engine v3.0] Disco KB Nav + Skeleton + Stagger + Optimistic + Typography")
  }(),
  function() {
    let e = null,
      t = !1;
    document.addEventListener("mousemove", function(n) {
      t || (t = !0, requestAnimationFrame(function() {
        t = !1;
        const o = document.getElementById("cinemaModal");
        if (!o || "none" === o.style.display) return;
        if (!!(!document.fullscreenElement && !document.webkitFullscreenElement)) return;
        const i = document.getElementById("cinemaTopBar"),
          a = document.getElementById("cinemaBottomBar"),
          s = window.innerHeight,
          r = n.clientY;
        i && (i.style.opacity = r < .22 * s ? "1" : "0"), a && (a.style.opacity = r > .78 * s ? "1" : "0"), i && (i.style.pointerEvents = r < .22 * s ? "auto" : "none"), a && (a.style.pointerEvents = r > .78 * s ? "auto" : "none"), clearTimeout(e), e = setTimeout(function() {
          i && (i.style.opacity = "0", i.style.pointerEvents = "none"), a && (a.style.opacity = "0", a.style.pointerEvents = "none")
        }, 2500)
      }))
    })
  }();
// ══════════════════════════════════════════════════════════════════
// 🔧 PATCH: Timer FAB schovat v Objevování + oprava klikání na karty
// ══════════════════════════════════════════════════════════════════
;(function _mfDiscoverClickFix() {

  // 1) Přidej/odeber třídu na body podle stavu universe overlay
  const _origOpen  = window.openUniverse;
  const _origClose = window.closeUniverse;

  window.openUniverse = function(...args) {
    document.body.classList.add('disco-open');
    return _origOpen?.apply(this, args);
  };

  window.closeUniverse = function(...args) {
    document.body.classList.remove('disco-open');
    return _origClose?.apply(this, args);
  };

  // 2) Synchronizuj stav při načtení (kdyby bylo hash #discover)
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('universeOverlay');
    if (overlay?.classList.contains('open')) {
      document.body.classList.add('disco-open');
    }

    // 3) MutationObserver jako záloha
    if (overlay) {
      new MutationObserver(() => {
        if (overlay.classList.contains('open')) {
          document.body.classList.add('disco-open');
        } else {
          document.body.classList.remove('disco-open');
        }
      }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
  });

  console.log('[MůjFlix Fix] ✓ Timer FAB + Discover click fix načten');
})();

// ══════════════════════════════════════════════════════════════════
// 📝 CHANGELOG SYSTEM — MůjFlix Update Notifications
// Správce: adminSaveChangelog() přidá záznam, uživatel ho vidí
// při příštím načtení přes modal (pokud je novější než posledně viděný).
// ══════════════════════════════════════════════════════════════════

const MF_CHANGELOG_KEY = 'mf_changelog_v1';
const MF_CHANGELOG_SEEN_KEY = 'mf_changelog_seen_ts';
let _clSelectedType = 'feature';

// ── Typy changelogů — ikona + barva ──────────────────────────────
const CL_TYPES = {
  feature:     { label: '✨ Novinka',        color: '#4da6ff', bg: 'rgba(0,122,255,0.12)',  border: 'rgba(0,122,255,0.3)'  },
  fix:         { label: '🐛 Oprava bugu',    color: '#5fffb0', bg: 'rgba(0,200,100,0.1)',   border: 'rgba(0,200,100,0.3)'  },
  improvement: { label: '⚡ Vylepšení',      color: '#ffd166', bg: 'rgba(255,180,0,0.1)',   border: 'rgba(255,180,0,0.3)'  },
  breaking:    { label: '⚠️ Změna chování', color: '#ff8c69', bg: 'rgba(255,100,60,0.1)',   border: 'rgba(255,100,60,0.3)' },
};

// ── Výběr typu v admin panelu ─────────────────────────────────────
function clSetType(type) {
  _clSelectedType = type;
  Object.keys(CL_TYPES).forEach(t => {
    const btn = document.getElementById('clType_' + t);
    if (!btn) return;
    if (t === type) {
      btn.style.background = CL_TYPES[t].bg;
      btn.style.borderColor = CL_TYPES[t].border;
      btn.style.color = CL_TYPES[t].color;
    } else {
      btn.style.background = 'rgba(255,255,255,0.04)';
      btn.style.borderColor = 'rgba(255,255,255,0.08)';
      btn.style.color = 'rgba(255,255,255,0.4)';
    }
  });
}

// ── Uložení nového záznamu (volá admin) ──────────────────────────
function adminSaveChangelog() {
  const version = document.getElementById('clVersion')?.value?.trim();
  const title   = document.getElementById('clTitle')?.value?.trim();
  const desc    = document.getElementById('clDesc')?.value?.trim();

  if (!title) return void (typeof showToast === 'function' && showToast('⚠ Zadej alespoň nadpis změny!'));

  const entry = {
    id:      Date.now(),
    version: version || '',
    title,
    desc:    desc || '',
    type:    _clSelectedType,
    ts:      Date.now(),
  };

  try {
    const all = JSON.parse(localStorage.getItem(MF_CHANGELOG_KEY) || '[]');
    all.unshift(entry);
    localStorage.setItem(MF_CHANGELOG_KEY, JSON.stringify(all.slice(0, 50)));
    // Vymazat pole po uložení
    document.getElementById('clVersion').value = '';
    document.getElementById('clTitle').value   = '';
    document.getElementById('clDesc').value    = '';
    adminRenderChangelogHistory();
    typeof showToast === 'function' && showToast('📝 Changelog přidán! Uživatelé uvidí notifikaci.', 'success');
  } catch (e) {
    console.warn('[Changelog] Uložení selhalo:', e);
  }
}

// ── Smazání záznamu z changelogu ─────────────────────────────────
function adminDeleteChangelog(id) {
  try {
    const all = JSON.parse(localStorage.getItem(MF_CHANGELOG_KEY) || '[]');
    localStorage.setItem(MF_CHANGELOG_KEY, JSON.stringify(all.filter(e => e.id !== id)));
    adminRenderChangelogHistory();
    typeof showToast === 'function' && showToast('🗑 Záznam smazán');
  } catch (e) {}
}

// ── Render historie v admin panelu ────────────────────────────────
function adminRenderChangelogHistory() {
  const el = document.getElementById('adminChangelogHistory');
  if (!el) return;
  try {
    const all = JSON.parse(localStorage.getItem(MF_CHANGELOG_KEY) || '[]');
    if (!all.length) {
      el.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.25);text-align:center;padding:20px 0;">Zatím žádné záznamy</div>';
      return;
    }
    el.innerHTML = all.slice(0, 20).map(e => {
      const ct = CL_TYPES[e.type] || CL_TYPES.feature;
      const d  = new Date(e.ts);
      const dateStr = d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
      return `
        <div style="padding:12px 14px;border-radius:11px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);margin-bottom:8px;position:relative;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:${e.desc ? '6px' : '0'};">
            <span style="font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${ct.bg};border:1px solid ${ct.border};color:${ct.color};">${ct.label}</span>
            ${e.version ? `<span style="font-size:0.58rem;color:rgba(255,255,255,0.3);font-family:monospace;">${e.version}</span>` : ''}
            <span style="font-size:0.58rem;color:rgba(255,255,255,0.2);margin-left:auto;">${dateStr}</span>
          </div>
          <div style="font-size:0.8rem;font-weight:700;color:#fff;margin-bottom:${e.desc ? '4px' : '0'};">${e.title}</div>
          ${e.desc ? `<div style="font-size:0.7rem;color:rgba(255,255,255,0.45);line-height:1.5;">${e.desc}</div>` : ''}
          <button onclick="adminDeleteChangelog(${e.id})" style="position:absolute;top:10px;right:10px;background:rgba(255,50,50,0.12);border:none;border-radius:6px;padding:3px 8px;color:rgba(255,100,100,0.7);font-size:0.6rem;cursor:pointer;">✕</button>
        </div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = '';
  }
}

// ── Zobrazení changelog modalu pro uživatele ──────────────────────
function openChangelog() {
  try {
    const all = JSON.parse(localStorage.getItem(MF_CHANGELOG_KEY) || '[]');
    if (!all.length) return;

    const seenTs  = parseInt(localStorage.getItem(MF_CHANGELOG_SEEN_KEY) || '0');
    // Nepřečtené = novější než poslední viděný timestamp
    const unseen  = all.filter(e => e.ts > seenTs);
    const toShow  = unseen.length ? unseen : all.slice(0, 5);

    const modal   = document.getElementById('mfChangelogModal');
    const body    = document.getElementById('clModalBody');
    const subtitle = document.getElementById('clModalSubtitle');
    if (!modal || !body) return;

    subtitle.textContent = unseen.length
      ? `${unseen.length} nová změna${unseen.length > 1 ? 's' : ''} od tvé poslední návštěvy`
      : 'Historie posledních změn';

    body.innerHTML = toShow.map(e => {
      const ct = CL_TYPES[e.type] || CL_TYPES.feature;
      const d  = new Date(e.ts);
      const dateStr = d.toLocaleDateString('cs-CZ');
      return `
        <div style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
            <span style="font-size:0.62rem;font-weight:700;padding:3px 10px;border-radius:20px;background:${ct.bg};border:1px solid ${ct.border};color:${ct.color};">${ct.label}</span>
            ${e.version ? `<span style="font-size:0.65rem;font-weight:700;color:rgba(255,255,255,0.4);font-family:monospace;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:6px;">${e.version}</span>` : ''}
            <span style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-left:auto;">${dateStr}</span>
          </div>
          <div style="font-size:0.92rem;font-weight:800;color:#fff;margin-bottom:6px;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;">${e.title}</div>
          ${e.desc ? `<div style="font-size:0.78rem;color:rgba(255,255,255,0.5);line-height:1.6;">${e.desc}</div>` : ''}
        </div>`;
    }).join('');

    modal.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      modal.style.opacity = '1';
    }));
  } catch (e) {
    console.warn('[Changelog] openChangelog chyba:', e);
  }
}

// ── Zavření modalu — uložení timestamp "viděno" ───────────────────
function closeChangelog() {
  const modal = document.getElementById('mfChangelogModal');
  if (!modal) return;
  modal.style.display = 'none';
  localStorage.setItem(MF_CHANGELOG_SEEN_KEY, Date.now().toString());
  // Skrýt badge na profilu
  const badge = document.getElementById('clNewBadge');
  if (badge) badge.style.display = 'none';
}

// ── Automatická kontrola nepřečtených změn po načtení ────────────
function checkChangelogOnLoad() {
  try {
    const all = JSON.parse(localStorage.getItem(MF_CHANGELOG_KEY) || '[]');
    if (!all.length) return;
    const seenTs = parseInt(localStorage.getItem(MF_CHANGELOG_SEEN_KEY) || '0');
    const unseen = all.filter(e => e.ts > seenTs);
    if (!unseen.length) return;

    // Zobrazí toast s možností otevřít changelog po 4s (aby se stránka stihla načíst)
    setTimeout(() => {
      if (typeof showToast !== 'function') return;
      // Přidáme klikatelný toast ručně
      let t = document.getElementById('mf-toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'mf-toast';
        t.style.cssText = "position:fixed;bottom:85px;left:50%;transform:translateX(-50%) translateY(12px);z-index:99999;background:rgba(10,10,12,0.96);color:#fff;font-family:'Outfit',sans-serif;font-weight:700;font-size:0.8rem;padding:10px 22px;border-radius:50px;opacity:0;transition:opacity 0.25s,transform 0.3s cubic-bezier(0.34,1.4,0.64,1);pointer-events:auto;backdrop-filter:blur(20px);white-space:nowrap;max-width:90vw;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.7);cursor:pointer;";
        document.body.appendChild(t);
      }
      t.style.border = '1px solid rgba(0,122,255,0.35)';
      t.textContent  = `🆕 ${unseen.length} nová změna — klikni pro detail`;
      t.style.opacity   = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
      t.onclick = () => { openChangelog(); t.style.opacity = '0'; };
      clearTimeout(t._tm);
      t._tm = setTimeout(() => {
        t.style.opacity   = '0';
        t.style.transform = 'translateX(-50%) translateY(12px)';
        t.onclick = null;
      }, 7000);
    }, 4000);
  } catch (e) {}
}

// Zavolej při načtení (po DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  checkChangelogOnLoad();
  // Načti historii v adminu pokud je tab aktivní
  const obs = new MutationObserver(() => {
    const tab = document.getElementById('adminTab_changelog');
    if (tab && tab.style.display !== 'none') adminRenderChangelogHistory();
  });
  const panel = document.getElementById('adminPanel');
  if (panel) obs.observe(panel, { attributes: true, subtree: true, attributeFilter: ['style'] });
});

console.log('[MůjFlix Changelog] ✓ Changelog systém načten');

// ════════════════════════════════════════════════════════════
// EPISODE PICKER REMAKE — přepisuje renderSeasonSelectView
//                         a _buildEpCardBase za běhu
// ════════════════════════════════════════════════════════════
(function() {

  // ── Inject CSS přes JS (highest specificity, after all other styles) ──
  const style = document.createElement('style');
  style.id = 'mf-remake-styles';
  style.textContent = `
    /* SEASON GRID */
    .ssv-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
      gap: 10px !important;
      padding: 0 16px 32px !important;
    }
    .ssv-card {
      border-radius: 16px !important;
      border: 1px solid rgba(255,255,255,0.07) !important;
      background: rgba(255,255,255,0.04) !important;
      transition: transform 0.3s cubic-bezier(0.34,1.3,0.64,1), border-color 0.2s, box-shadow 0.3s !important;
    }
    .ssv-card:hover {
      transform: translateY(-8px) scale(1.02) !important;
      border-color: rgba(255,255,255,0.2) !important;
      box-shadow: 0 24px 60px rgba(0,0,0,0.9) !important;
    }
    .ssv-card.ssv-active {
      border-color: var(--accent,#007aff) !important;
      box-shadow: 0 0 0 2px rgba(0,122,255,0.3), 0 16px 48px rgba(0,122,255,0.35) !important;
    }
    .ssv-play-btn {
      border-radius: 24px !important;
      padding: 10px 20px !important;
      background: rgba(255,255,255,0.95) !important;
      font-weight: 800 !important;
    }
    .ssv-num { font-size: 0.52rem !important; letter-spacing: 2px !important; }
    .ssv-name { font-size: 0.88rem !important; font-weight: 800 !important; }

    /* EPISODE LIST — horizontal rows */
    .episode-grid {
      display: flex !important;
      flex-direction: column !important;
      gap: 0 !important;
      padding: 8px 0 80px !important;
    }
    .episode-card {
      display: flex !important;
      flex-direction: row !important;
      align-items: flex-start !important;
      padding: 12px 16px !important;
      border-radius: 0 !important;
      border: none !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
      background: transparent !important;
      clip-path: none !important;
      min-height: 0 !important;
      gap: 0 !important;
      transition: background 0.18s ease !important;
    }
    .episode-card:hover {
      background: rgba(255,255,255,0.04) !important;
      clip-path: none !important;
      filter: none !important;
      z-index: 2 !important;
    }
    .episode-card:last-child { border-bottom: none !important; }
    .episode-card.watched { opacity: 0.38 !important; }
    .episode-card.watched:hover { opacity: 0.65 !important; }
    .episode-card.next-ep {
      background: rgba(0,122,255,0.06) !important;
    }
    .episode-card.next-ep::before {
      border-radius: 0 !important;
      width: 3px !important;
    }

    /* Thumbnail */
    .ep-thumb {
      width: 148px !important;
      min-width: 148px !important;
      aspect-ratio: 16/9 !important;
      border-radius: 10px !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
    }
    .ep-thumb::after { display: none !important; }
    .ep-thumb img {
      width: 100% !important; height: 100% !important;
      object-fit: cover !important;
      filter: brightness(0.78) saturate(0.82) !important;
      transition: transform 0.4s ease, filter 0.3s !important;
    }
    .episode-card:hover .ep-thumb img {
      transform: scale(1.06) !important;
      filter: brightness(1) saturate(1.1) !important;
    }
    .ep-hover-play {
      background: rgba(0,0,0,0.28) !important;
      opacity: 0 !important;
      transition: opacity 0.2s !important;
    }
    .episode-card:hover .ep-hover-play { opacity: 1 !important; }
    .ep-play-ring {
      width: 38px !important; height: 38px !important;
      border-radius: 50% !important;
      background: rgba(255,255,255,0.92) !important;
    }
    .ep-play-ring svg { margin-left: 2px !important; }

    /* Body */
    .ep-body {
      flex: 1 !important;
      padding: 2px 0 2px 14px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 3px !important;
      min-width: 0 !important;
    }
    .ep-num {
      font-size: 0.56rem !important;
      font-weight: 800 !important;
      color: rgba(255,255,255,0.3) !important;
      letter-spacing: 1.5px !important;
    }
    .ep-title {
      font-size: 0.86rem !important;
      font-weight: 700 !important;
      color: rgba(255,255,255,0.88) !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
    .episode-card:hover .ep-title {
      color: #fff !important;
      white-space: normal !important;
    }
    .ep-desc {
      font-size: 0.68rem !important;
      color: rgba(255,255,255,0.38) !important;
      max-height: 0 !important; opacity: 0 !important; margin-top: 0 !important;
      transition: max-height 0.3s ease, opacity 0.25s ease, margin-top 0.25s ease !important;
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
    }
    .episode-card:hover .ep-desc {
      max-height: 55px !important; opacity: 1 !important; margin-top: 4px !important;
    }
    .ep-actions {
      max-height: 0 !important; opacity: 0 !important; margin-top: 0 !important;
      overflow: hidden !important;
      transition: max-height 0.28s ease, opacity 0.22s ease, margin-top 0.22s ease !important;
    }
    .episode-card:hover .ep-actions {
      max-height: 36px !important; opacity: 1 !important;
      overflow: visible !important; margin-top: 8px !important;
    }
    .ep-btn-play-hbo {
      border-radius: 20px !important;
      padding: 6px 16px !important;
      font-weight: 800 !important;
      font-size: 0.68rem !important;
    }
    .ep-btn-mark {
      width: 28px !important; height: 28px !important;
      border-radius: 50% !important;
    }

    /* Season section header (Vše mód) */
    .mf-season-header {
      font-size: 0.58rem !important;
      font-weight: 800 !important;
      color: rgba(255,255,255,0.22) !important;
      letter-spacing: 3px !important;
      text-transform: uppercase !important;
      padding: 18px 16px 8px !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    }

    /* Dock hide */
    body.modal-open #mfDock,
    body.modal-open .mf-dock,
    body.modal-open nav.mf-dock {
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(110%) !important;
      visibility: hidden !important;
      transition: all 0.25s ease !important;
    }

    /* Skrýt profil při otevřeném modalu */
    body.modal-open #mfProfileBadge,
    body.modal-open .mf-profile-badge {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.2s ease !important;
    }

    /* Profile badge — čtvereček */
    #mfProfileBadge { border-radius: 14px !important; }
    .mpb-avatar {
      width: 36px !important; height: 36px !important;
      border-radius: 10px !important; font-size: 1.3rem !important;
    }
    .mpb-avatar img { border-radius: 10px !important; width: 100% !important; height: 100% !important; object-fit: cover !important; }
  `;
  document.head.appendChild(style);

  // ── Přepis renderEpisodes — změní season header class ──
  const _origRenderEpisodes = window.renderEpisodes;
  window.renderEpisodes = async function() {
    await _origRenderEpisodes.apply(this, arguments);
    // Oprav season headers v "Vše" módu — přidej třídu
    const grid = document.getElementById('episodesGrid');
    if (!grid) return;
    grid.querySelectorAll('div[style*="font-weight:700"], div[style*="font-weight: 700"]').forEach(el => {
      if (el.textContent.startsWith('Serie ') || el.textContent.startsWith('Série ')) {
        el.className = 'mf-season-header';
        el.style.cssText = '';
      }
    });
  };

  // ── Dock MutationObserver ──
  document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('seriesModal');
    if (!modal) return;
    const obs = new MutationObserver(() => {
      const open = modal.classList.contains('open');
      document.body.classList.toggle('modal-open', open);
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
  });

})();
