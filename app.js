

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

function _esc(e) {
  return escapeHTML(e)
}

function safeSetItem(e, t) {
  try {
    return localStorage.setItem(e, t), !0
  } catch (e) {
    return "QuotaExceededError" !== e.name && 22 !== e.code || showToast("⚠ Paměť prohlížeče plná – data se neukládají", 4e3), !1
  }
}

! function() {
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
  };

try {
  const _savedDb = JSON.parse(localStorage.getItem("mf_db_custom") || "{}");
  Object.assign(db, _savedDb);
} catch (err) {}

function epsInSeason(e, t) {
  const n = epsBySeason[e];
  if (n && n[t - 1]) return n[t - 1];
  const d = db[e];
  if (d && d._seasonEpCounts && d._seasonEpCounts[t - 1]) return d._seasonEpCounts[t - 1];
  return 10
}

function totalSeasons(e) {
  const t = epsBySeason[e];
  if (t) return t.length;
  const d = db[e];
  if (d && d._seasonEpCounts && d._seasonEpCounts.length) return d._seasonEpCounts.length;
  return 1
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
const _tmdbMemCache = new Map();
const TMDB_CACHE_MAX = 100;
const TMDB_CACHE_TTL = 30 * 60 * 1000;

function _tmdbMemSet(key, value) {
  const now = Date.now();
  for (const [k, v] of _tmdbMemCache) {
    if (now - v._ts > TMDB_CACHE_TTL) _tmdbMemCache.delete(k);
  }
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

window.MF_PROXY = {
  enabled: false,
  baseUrl: '/api',
  tmdbEndpoint: '/tmdb'
};

async function tmdbGet(e, forceDirect = false) {
  const useProxy = window.MF_PROXY?.enabled && !forceDirect;

  if (useProxy) {
    try {
      const base = window.MF_PROXY.baseUrl || '';
      const endpoint = window.MF_PROXY.tmdbEndpoint || '/tmdb';
      const baseWithSlash = base && !base.endsWith('/') ? base + '/' : base;
      const endpointClean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const cleanPath = e.startsWith('/') ? e.slice(1) : e;
      const proxyUrl = `${baseWithSlash}${endpointClean}?path=${encodeURIComponent(cleanPath)}`;

      const cached = _tmdbMemGet(proxyUrl);
      if (cached) return cached;

      const resp = await mfFetch(proxyUrl);
      if (!resp.ok) {
        console.warn("[TMDB-Proxy] HTTP error:", resp.status, resp.statusText);
        
        return tmdbGet(e, true);
      }
      const data = await resp.json();
      if (!data) return null;
      _tmdbMemSet(proxyUrl, data);
      return data;
    } catch (err) {
      console.error("[TMDB-Proxy] Fetch error:", err.message, "- fallback to direct");
      return tmdbGet(e, true);
    }
  }

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

function openForYouSeries() {
  _forYouSeries && openWithCopy(_forYouSeries.name, _forYouSeries.mediaType || "tv")
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

function showToast(e, t) {
  let n = document.getElementById("mf-toast");
  n || (n = document.createElement("div"), n.id = "mf-toast", n.setAttribute("role", "status"), n.setAttribute("aria-live", "polite"), n.style.cssText = "position:fixed;bottom:85px;left:50%;transform:translateX(-50%) translateY(12px);z-index:99999;background:rgba(10,10,12,0.96);color:#fff;font-family:'Outfit',sans-serif;font-weight:700;font-size:0.8rem;padding:10px 22px;border-radius:50px;opacity:0;transition:opacity 0.25s,transform 0.3s cubic-bezier(0.34,1.4,0.64,1),border-color 0.2s;pointer-events:none;backdrop-filter:blur(20px);white-space:nowrap;max-width:90vw;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.7);", document.body.appendChild(n)), n.style.border = "1px solid " + ("success" === t ? "rgba(100,255,120,0.5)" : "error" === t ? "rgba(255,80,80,0.5)" : "rgba(0,122,255,0.25)"), n.textContent = e, n.style.opacity = "1", n.style.transform = "translateX(-50%) translateY(0)", clearTimeout(n._tm), n._tm = setTimeout(() => {
    n.style.opacity = "0", n.style.transform = "translateX(-50%) translateY(8px)"
  }, "error" === t ? 3500 : 2400)
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
    const d = typeof db !== "undefined" ? db[e] : null;
    n.push({
      ts: Date.now(),
      slug: e,
      genres: t || [],
      name: d?.name || "",
      poster: d?._poster || d?.poster || "",
      tmdbId: d?.tmdbId || null
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
    c = Date.now() - (t.lastActive || 0) < 216e5 ? t.sessionGenres || [] : [],
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





function _isNonLatin(e) {
  return /[\u3000-\u9fff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff\u4e00-\u9fff]/.test(e)
}

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
      if (orig && !/[\u3000-鿿가-힯؀-ۿЀ-ӿ一-鿿]/.test(orig)) {
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
      const seasonEpCounts = [];
      for (let s = 1; s <= ns; s++) {
        const sd = seasons.find(x => x.season_number === s);
        const ec = sd && sd.episode_count ? sd.episode_count : 1;
        seasonEpCounts.push(ec);
        for (let e = 1; e <= ec; e++) rec[slug+'-S'+s+'-E'+e] = { se: s, ep: e };
      }
      rec._seasonEpCounts = seasonEpCounts;
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
    let opened = false;
    const obs = new MutationObserver(() => {
      if (modal.classList.contains('open')) { opened = true; return; }
      if (opened) {
        if (db[slug]?._isDiscover) delete db[slug];
        obs.disconnect();
      }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    setTimeout(() => { if (!opened) obs.disconnect(); }, 10000);
  }
}




async function tmdbRow(e) {
  try {
    const t = await tmdbGet(e);
    return (t?.results || []).filter(e => e.poster_path)
  } catch {
    return []
  }
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

function _showCinemaOrFinderChoice(e, t, n, o) {
  try {
    closeUniverse()
  } catch (e) {
    console.warn("[Cinema] Discover close failed:", e)
  }
  openMovieInCinema(e, t, n)
}










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
  try {
    aiBrain.recordWatchTime()
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
  updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateLogoProgress(), aiBrain && db[activeSeries] && db[activeSeries]._genres && aiBrain.boostGenresFromTmdb(db[activeSeries]._genres)
}
document.getElementById("seriesModal").addEventListener("click", e => {
  e.target === document.getElementById("seriesModal") && closeModal()
});

function toggleWatch(e) {
  const t = getWatched(),
    n = !!t[e];
  if (n ? delete t[e] : t[e] = !0, saveWatched(t), renderEpisodes(), updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateLogoProgress(), !n && "function" == typeof openEpRating) {
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
  safeSetItem(uKey("mf_watchlist"), JSON.stringify(e))
}

/* Doplní chybějící plakáty u oblíbených (starší záznamy / přidáno z přehrávače) */
let _mfPosterFixBusy = false;
async function mfBackfillFavPosters() {
  if (_mfPosterFixBusy) return;
  const list = getWatchlist();
  const miss = list.filter(w => w && w.tmdbId && !w.poster);
  if (!miss.length) return;
  _mfPosterFixBusy = true;
  try {
    let changed = false;
    for (const w of miss.slice(0, 30)) {
      try {
        const kind = w.type === "series" ? "tv" : "movie";
        const d = await tmdbGet("/" + kind + "/" + w.tmdbId + "?language=cs-CZ");
        if (d && d.poster_path) { w.poster = "https://image.tmdb.org/t/p/w342" + d.poster_path; changed = true; }
      } catch (e) {}
    }
    if (changed) {
      saveWatchlistData(list);
      try { if (typeof renderHomepage === "function") renderHomepage(); } catch (e) {}
      try { const o = document.getElementById("watchlistOverlay"); if (o && o.classList.contains("open")) renderWatchlist(); } catch (e) {}
    }
  } finally { _mfPosterFixBusy = false; }
}
window.mfBackfillFavPosters = mfBackfillFavPosters;

function tmdbFavSlug(id, mediaType) {
  return "__tmdbfav_" + ("tv" === mediaType ? "tv" : "movie") + "_" + id
}

function isTmdbFavorite(id, mediaType) {
  const slug = tmdbFavSlug(id, mediaType);
  return getWatchlist().some(w => w.slug === slug)
}

function toggleTmdbFavorite(id, mediaType, name, poster, btn) {
  if (!id) return;
  const slug = tmdbFavSlug(id, mediaType),
    list = getWatchlist(),
    idx = list.findIndex(w => w.slug === slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    if (typeof showToast === "function") showToast("Odebráno z Oblíbených");
  } else {
    list.push({
      slug,
      name: name || "",
      type: "tv" === mediaType ? "series" : "movie",
      poster: poster || "",
      tmdbId: id
    });
    if (typeof showToast === "function") showToast("Přidáno do Oblíbených! ❤️")
  }
  saveWatchlistData(list);
  if (idx < 0 && !poster) setTimeout(mfBackfillFavPosters, 50);
  if (btn) btn.classList.toggle("faved", idx < 0);
  if (typeof updateWatchlistBtns === "function") updateWatchlistBtns()
}

function openWatchlist() {
  setTimeout(mfBackfillFavPosters, 50);
  const e = document.getElementById("watchlistOverlay");
  e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), renderWatchlist()
}

function closeWatchlist() {
  const e = document.getElementById("watchlistOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 280)
}

window._wlFilter = "all";
window._wlQuery = "";

function wlSetFilter(f) {
  window._wlFilter = f, renderWatchlist()
}

function wlSearch(v) {
  window._wlQuery = (v || "").trim().toLowerCase(), renderWatchlist()
}

function renderWatchlist() {
  const all = getWatchlist(),
    list = document.getElementById("watchlistList"),
    empty = document.getElementById("watchlistEmpty"),
    count = document.getElementById("wlCount"),
    tools = document.getElementById("wlTools"),
    f = window._wlFilter || "all",
    q = window._wlQuery || "";
  if (!list || !empty) return;
  list.querySelectorAll(".wl-card, .wl-noresult").forEach(x => x.remove());
  const nSeries = all.filter(x => "series" === x.type).length,
    nMovie = all.length - nSeries;
  if (count && (count.textContent = all.length ? all.length + (1 === all.length ? " položka" : all.length < 5 ? " položky" : " položek") : ""), tools) {
    tools.style.display = all.length ? "" : "none";
    const set = (id, txt, n) => {
      const b = document.getElementById(id);
      b && (b.textContent = txt + " · " + n, b.classList.toggle("active", b.dataset.f === f))
    };
    set("wlTabAll", "Vše", all.length), set("wlTabMovie", "Filmy", nMovie), set("wlTabSeries", "Seriály", nSeries)
  }
  if (!all.length) return void(empty.style.display = "flex");
  empty.style.display = "none";
  const shown = [];
  all.forEach((item, idx) => {
    "all" !== f && ("series" === f ? "series" !== item.type : "series" === item.type) || q && !(item.name || "").toLowerCase().includes(q) || shown.push({
      item,
      idx
    })
  });
  if (!shown.length) {
    const n = document.createElement("div");
    return n.className = "wl-noresult", n.textContent = "Nic nenalezeno. Zkus jiný filtr nebo hledání.", void list.appendChild(n)
  }
  shown.forEach(({
    item,
    idx
  }) => {
    const c = document.createElement("div"),
      isSeries = "series" === item.type;
    c.className = "wl-card", c.tabIndex = 0, c.setAttribute("role", "button"), c.setAttribute("aria-label", "Otevřít " + (item.name || "")), c.innerHTML = `<div class="wl-card-poster">${item.poster?`<img src="${_esc(item.poster)}" alt="" loading="lazy" onerror="this.remove()">`:""}<div class="wl-card-fallback">${isSeries?"📺":"🎬"}</div><span class="wl-card-badge">${isSeries?"Seriál":"Film"}</span><button type="button" class="wl-card-remove" title="Odebrat z Oblíbených" aria-label="Odebrat z Oblíbených">✕</button><div class="wl-card-play">▶</div></div><div class="wl-card-name">${_esc(item.name)}</div>`;
    const open = () => openFavoriteItem(item);
    c.onclick = e => {
      e.target.closest(".wl-card-remove") || open()
    }, c.onkeydown = e => {
      "Enter" !== e.key && " " !== e.key || (e.preventDefault(), open())
    }, c.querySelector(".wl-card-remove").onclick = e => {
      e.stopPropagation();
      const cur = getWatchlist(),
        k = cur.findIndex(x => x.slug === item.slug);
      k >= 0 && (cur.splice(k, 1), saveWatchlistData(cur), "function" == typeof updateWatchlistBtns && updateWatchlistBtns(), renderWatchlist())
    }, list.appendChild(c)
  })
}

function openFavoriteItem(e) {
  try { closeWatchlist() } catch (err) {}
  setTimeout(() => {
    try {
      if (e.tmdbId && "series" === e.type) {
        if (typeof openDiscoverTv === "function") return void openDiscoverTv(e.tmdbId, e.name);
      } else if (e.tmdbId) {
        if (typeof _showCinemaOrFinderChoice === "function") return void _showCinemaOrFinderChoice(e.tmdbId, e.name, "movie");
      }
      const tf = /^__tmdbfav_(tv|movie)_(\d+)$/.exec(e.slug || "");
      if (tf) {
        if ("tv" === tf[1] && typeof openDiscoverTv === "function") return void openDiscoverTv(tf[2], e.name);
        if ("movie" === tf[1] && typeof _showCinemaOrFinderChoice === "function") return void _showCinemaOrFinderChoice(tf[2], e.name, "movie");
      }
      if (e.slug && e.slug.startsWith("__dtv_") && typeof openDiscoverTv === "function") {
        return void openDiscoverTv(e.slug.slice(6), e.name);
      }
      if (e.slug && typeof openSeries === "function" && db[e.slug]) {
        return void openSeries(e.slug);
      }
      if (e.slug && typeof openSeries === "function") {
        return void openSeries(e.slug);
      }
      openWithCopy(e.name, "series" === e.type ? "tv" : "movie");
    } catch (err) {
      openWithCopy(e.name, "series" === e.type ? "tv" : "movie");
    }
  }, 300);
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
      genres: db[_ratingSlug]?._genreIds || db[_ratingSlug]?._genres || [],
      ts: Date.now()
    }, _ratingSignalCache = null, safeSetItem(uKey("mf_ratings"), JSON.stringify(t)), aiBrain && db[_ratingSlug]) {
    const t = "loved" === e ? .25 : "liked" === e ? .15 : "ok" === e ? .05 : -.1;
    db[_ratingSlug]._genres && aiBrain.boostGenresFromTmdb(db[_ratingSlug]._genres, t)
  }
  closeRating(), showToast("loved" === e ? "Super! AI si to zapamuje pro doporuceni 🎉" : "meh" === e ? "Chapeme, priste neco lepsiho 👍" : "Diky za hodnoceni!")
}
document.getElementById("watchlistOverlay").addEventListener("click", e => {
  e.target === document.getElementById("watchlistOverlay") && closeWatchlist()
});

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
      n.innerHTML = `<div class="tt-title">${escapeHTML(o.name)}</div><div class="tt-meta">${function(e){const t=e||0,n=t/2,o=Math.floor(n),i=n-o>=.3,a=5-o-(i?1:0);return`<span class="tt-stars">${"★".repeat(o)}${i?"½":""}${"☆".repeat(a)}</span><span class="tt-rating-num">${t.toFixed(1)}</span>`}(o._rating)}<span>${o.totalEps} ep</span></div><div class="tt-genre">${(o._genres||[]).slice(0,2).join(" · ")||""}</div>`, e.appendChild(n)
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
    "mainMenu" === e.parentElement.id && t.classList.add("focus-mode"), e.classList.add("focused"), i && setAdaptiveColor(i);
    const a = i && HARDCODED_TRAILERS[i];
    (n || a) && (n && getTrailerKey(n, o, i), e._trailerTimer = setTimeout(() => {
      (e.classList.contains("focused") || e.classList.contains("kb-focus")) && loadTileTrailer(e, n || null, o, i)
    }, 1400))
  }), e.addEventListener("mouseleave", () => {
    "mainMenu" === e.parentElement.id && t.classList.remove("focus-mode"), e.classList.remove("focused"), clearAdaptiveColor(), e._trailerTimer && clearTimeout(e._trailerTimer), removeTileTrailer(e)
  });
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

/* class AIBrain → ai/brain.js */
const aiBrain = new AIBrain;

/* Finder → finder/finder.js */
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
    (e || t) && (o._trailerTimer = setTimeout(() => {
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

document.addEventListener("keydown", e => {
  if ("INPUT" !== e.target.tagName && "TEXTAREA" !== e.target.tagName) {
    if ("Escape" === e.key) {
      const e = document.getElementById("mfFinderModal");
      return e && "none" !== e.style.pointerEvents && "none" !== e.style.display ? void closeFinderModal() : modalOpen ? void closeModal() : document.getElementById("watchlistOverlay").classList.contains("open") ? void closeWatchlist() : document.getElementById("universeOverlay").classList.contains("open") ? void closeSearch() : document.getElementById("customizeOverlay").classList.contains("open") ? void closeCustomize() : document.getElementById("collectionsOverlay").classList.contains("open") ? void closeCollections() : document.getElementById("ratingOverlay")?.classList.contains("open") ? void closeRating() : document.getElementById("genreEditorOverlay")?.classList.contains("open") ? void closeGenreEditor() : void 0
    }
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
      n = document.getElementById("seriesModal").classList.contains("open");
    if (!t && !n && "menu" === kbLayer) return e.preventDefault(), void openDiscover()
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

function closeGenreEditor() {
  const e = document.getElementById("genreEditorOverlay");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 280), resumeBgParticles()
}

function saveGenrePrefs() {
  document.querySelectorAll("#genreSliders .genre-slider").forEach(e => {
    const t = e.dataset.key,
      n = parseInt(e.value) / 100;
    0 === n ? delete aiBrain.memory.genrePreferences[t] : aiBrain.memory.genrePreferences[t] = n
  }), aiBrain.save(), closeGenreEditor(), showToast("✦ AI preference uloženy!")
}

async function checkNewEpisodes() {
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

window.addEventListener("load", () => {
  if (Object.keys(db).forEach(e => {
      updateTileProgress(e), updateContinueBadge(e)
    }), updateLogoProgress(), updateWatchlistBtns(), showAutosave("idle"), initTileEffects(), loadTmdbTileImages().then(() => initTileEffects()), document.querySelectorAll(".ps-tile-wrapper .tile-bg, .ps-tile-wrapper .tile-logo").forEach(e => {
      const t = () => e.classList.add("loaded");
      e.complete && e.naturalWidth > 0 ? t() : (e.addEventListener("load", t, {
        once: !0
      }), e.addEventListener("error", t, {
        once: !0
      }))
    }), setKbMenuFocus(0), function() {
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
    }(), setTimeout(checkNewEpisodes, 8e3), initPWA(), !1) {}
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

async function initPWA() {
  if ("serviceWorker" in navigator) try {
    let e = await navigator.serviceWorker.getRegistration("./");
    if (!e) return;
    window._swReg = e
  } catch (e) {
    console.warn("[PWA] SW error:", e)
  }
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
const PROFILES_KEY = "mf_profiles_v2",
  ACTIVE_PID_KEY = "mf_active_pid";

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

function setActiveUser(e) {
  localStorage.setItem(ACTIVE_PID_KEY, e), ProfileGate.renderBadge(), _applyProfileAccent()
}

const CZ_VOCATIVE_DICT = {
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

    const lower = trimmed.toLowerCase();
    const base = trimmed.slice(0, -1);

    if (/[aeiouyáéíóúůý]$/i.test(trimmed) === false) {
      if (lower.endsWith("ch")) return trimmed + "u";
      const last = lower.slice(-1);
      if ("khg".includes(last)) return trimmed + "u";
      if ("cčřšžj".includes(last)) return trimmed + "i";
      if (last === "r") {
        const before = lower.slice(-2, -1);
        const isVowel = /[aeiouyáéíóúůý]/.test(before);
        return isVowel ? trimmed + "e" : trimmed.slice(0, -1) + "ře";
      }
      return trimmed + "e";
    }
    if (lower.endsWith("a")) return base + "o";
    return trimmed;
  } catch (e) {
    return name;
  }
}
window.czechVocative = czechVocative;

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

/* ProfileGate → profiles/gate.js */

function refreshUserContent() {
  void 0 !== db && Object.keys(db).forEach(e => {
    "function" == typeof updateTileProgress && updateTileProgress(e), "function" == typeof updateContinueBadge && updateContinueBadge(e)
  }), "function" == typeof updateLogoProgress && updateLogoProgress(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns()
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
  ProfileGate.renderBadge();

  function _showProfileGateOnLoad() {
    const gate = document.getElementById("mfProfileGate");
    if (!gate) return;
    gate.style.display = "flex";
    gate.style.opacity = "1";
    gate.classList.remove("hiding");
    ProfileGate.renderGate();
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

let _premiereMonth = new Date,
  _premiereFilter = "tracked",
  _premiereCache = {};
const CZECH_MONTHS = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
  CZECH_DAYS_SHORT = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

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

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const e = document.getElementById("premiereFabBadge");
    e && e.classList.remove("has-items")
  }, 500), renderCollectionsGrid()
});

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
!0,
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
  const n = document.getElementById("notifBellBadge"),
    o = document.getElementById("hdrNotifBadge");
  if (o) {
    const e = n && "" !== n.textContent.trim() && "none" !== n.style.display;
    o.textContent = e ? "!" : "", o.classList.toggle("visible", e)
  }
  const d = document.getElementById("nfBellDot");
  d && d.classList.toggle("visible", !!(n && "" !== n.textContent.trim() && "none" !== n.style.display))
}
document.addEventListener("keydown", function(e) {
    if ("INPUT" === e.target.tagName || "TEXTAREA" === e.target.tagName) return;
    const t = document.getElementById("seriesModal"),
      n = t && t.classList.contains("open");
    "M" !== e.key && "m" !== e.key || n || (e.preventDefault(), openMoodPicker())
  }),
  function() {
    const e = window.openWithCopy;
    "function" == typeof e && (window.openWithCopy = function(...t) {
      return incrementTodayEp(), e.apply(this, t)
    });
    const t = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(e, n) {
      t(e, n), e && e.includes("watched") && setTimeout(updateStreak, 100)
    }
  }();
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
  }), setInterval(_syncDockBadges, 6e3), setTimeout(_syncDockBadges, 500), window.addEventListener("beforeinstallprompt", e => {
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
      const e = [".wrapped-overlay.open", ".premiere-overlay.open", ".collections-overlay.open", ".mood-overlay.open", ".universe-overlay.open", "#universeOverlay.open", ".genre-editor-overlay.open", "#epRatingOverlay.open", ".pm-overlay.open", ".watchlist-overlay.open"].some(e => !!document.querySelector(e));
      document.body.classList.toggle("modal-open", e)
    }
    localStorage.setItem = function(n, o) {
      e(n, o), (n.startsWith("mf_") || n.startsWith("watched_") || n.startsWith("watchlist") || n.startsWith("streak") || n.startsWith("aiMem")) && void 0
    }, window.refreshUserContent = window.refreshUserContent || function() {
      void 0 !== db && Object.keys(db).forEach(e => {
        "function" == typeof updateTileProgress && updateTileProgress(e), "function" == typeof updateContinueBadge && updateContinueBadge(e)
      }), "function" == typeof updateLogoProgress && updateLogoProgress(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns()
    }, document.addEventListener("DOMContentLoaded", () => {
      let _moT = null;
      new MutationObserver(() => {
        _moT || (_moT = setTimeout(() => { _moT = null; n() }, 150))
      }).observe(document.body, {
        subtree: !0,
        attributes: !0,
        attributeFilter: ["class"]
      }), n()
    })
  }();

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
        o.className = "tmdb-av-item", o.dataset.url = n, o.dataset.name = e.name, o.innerHTML = `\n        <img class="tmdb-av-img" src="${escapeHTML(n)}" alt="${escapeHTML(e.name)}" loading="lazy" onerror="this.parentElement.remove()">\n        <span class="tmdb-av-name">${escapeHTML(e.name)}</span>\n      `, o.onclick = () => {
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
    "Escape" === e.key && (t("tmdbAvatarModal") ? _tmdbAvClose() : t("epRatingOverlay") ? "function" == typeof closeEpRating && closeEpRating(!1) : void 0)
  }, {
    capture: !0
  }), document.getElementById("tmdbAvatarModal").addEventListener("click", function(e) {
    e.target === this && _tmdbAvClose()
  }), document.addEventListener("DOMContentLoaded", function() {
    void 0 !== ProfileGate && setTimeout(() => {
      ProfileGate.renderBadge(), ProfileGate.renderGate()
    }, 200)
  }), function() {
    function e() {
      const n = document.querySelector(".pg-gate"),
        o = n && (n.classList.contains("visible") || "none" !== n.style.display);
      document.body.classList.toggle("mf-panel-open", !!o)
    }
    const t = new MutationObserver(e);
    document.addEventListener("DOMContentLoaded", () => {
      const o = document.querySelector(".pg-gate");
      o && t.observe(o, {
        attributes: !0,
        attributeFilter: ["class", "style"]
      }), e()
    });
  }();
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
! function() {
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
        "function" == typeof mfDiscoverOpen ? mfDiscoverOpen("movie") : "function" == typeof openUniverse && openUniverse()
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
      "#settings": () => {
        "function" == typeof openSettings && openSettings()
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
          ["openWatchlist", "#watchlist"],
          ["openSettings", "#settings"]
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
  }(), function() {
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
    let e = "serialy";
    window.mfSectionBtn = function(e, t) {}, window.mfShowSection = function(t) {
      e = t, window._mfCurrentSection = t;
      const n = document.querySelector(".ps-menu-scene"),
        o = document.querySelector(".key-hint"),
        i = document.getElementById("continueWidget"),
        a = document.getElementById("mfSectionProtebe");
      n && (n.style.display = ""), o && (o.style.display = ""), i && (i.style.display = ""), a && (a.style.display = "none");
      if (document.body.classList.remove("mf-section-protebe"), "serialy" === t) {
        "function" == typeof closeUniverse && closeUniverse();
        const e = document.getElementById("universeOverlay");
        e && (e.classList.remove("visible", "open"), document.body.classList.remove("discover-open"));
        "function" == typeof closeDockOverlays && closeDockOverlays();
        setDockActive("dockHome");
        location.hash = "#serialy";
      }
      else if ("filmy" === t) n && (n.style.display = "none"), o && (o.style.display = "none"), i && (i.style.display = "none"), setDockActive("dockFilmy"), location.hash = "#filmy", "function" == typeof mfDiscoverOpen ? mfDiscoverOpen("movie") : "function" == typeof openUniverse && openUniverse();
      else if ("protebe" === t) n && (n.style.display = "none"), o && (o.style.display = "none"), i && (i.style.display = "none"), a && (a.style.display = "block"), document.body.classList.add("mf-section-protebe"), setDockActive("dockProtebe"), location.hash = "#protebe";
    };
    const t = window.closeUniverse;

    function n() {
      const e = (location.hash || "").toLowerCase();
      "#filmy" === e ? mfShowSection("filmy") : "#protebe" === e ? mfShowSection("protebe") : "#serialy" !== e && "" !== e || mfShowSection("serialy")
    }
    window.closeUniverse = function() {
      t && t.apply(this, arguments), setTimeout(() => {
        if ("filmy" === e) {
          const q = document.querySelector(".ps-menu-scene"),
            w = document.querySelector(".key-hint");
          q && (q.style.display = ""), w && (w.style.display = ""), setDockActive("dockHome"), e = "serialy", location.hash = "#serialy"
        } else {
          setDockActive({serialy:"dockHome",protebe:"dockProtebe"}[e] || "dockHome")
        }
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
  }(), function() {
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

    "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", e) : e()
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
          const a = void 0 !== window.TMDB_KEY ? window.TMDB_KEY : localStorage.getItem("mf_tmdb_key") || "",
            s = document.createElement("div");
          s.id = "mfBeautifulSettings", s.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.75);backdrop-filter:blur(24px);display:flex;align-items:flex-end;justify-content:center;font-family:-apple-system,Inter,sans-serif;animation:mfSettFade 0.22s ease;";
          const r = document.createElement("div");
          r.style.cssText = "background:rgba(18,18,26,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:28px 28px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:0 0 40px;box-shadow:0 -20px 60px rgba(0,0,0,0.6);animation:mfSettUp 0.38s cubic-bezier(0.34,1.1,0.64,1);", r.innerHTML = `\n      \x3c!-- Handle --\x3e\n      <div style="display:flex;justify-content:center;padding:12px 0 4px;">\n        <div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.18);"></div>\n      </div>\n\n      \x3c!-- Header --\x3e\n      <div style="padding:16px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">\n        <div style="display:flex;align-items:center;justify-content:space-between;">\n          <div>\n            <div style="font-size:1.15rem;font-weight:700;color:#fff;letter-spacing:-0.3px;">Nastavení</div>\n            <div style="font-size:0.62rem;color:rgba(255,255,255,0.35);margin-top:2px;">MůjFlix konfigurace</div>\n          </div>\n          <button id="mfSetClose" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>\n        </div>\n      </div>\n\n      \x3c!-- Section: TMDB --\x3e\n      <div style="padding:20px 24px 0;">\n        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🎬 Film databáze</div>\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">\n          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">TMDB API klíč</label>\n          <input id="mfSetTmdb" type="password" placeholder="Vložte váš TMDB API klíč…" value="${t(a)}"\n            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:inherit;">\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;line-height:1.5;">\n            Získej zdarma na <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:rgba(0,122,255,0.7);">themoviedb.org</a> → API → Klíč v3\n          </div>\n        </div>\n      </div>\n\n      \x3c!-- Section: AI --\x3e\n      <div style="padding:16px 24px 0;">\n        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🤖 AI asistent</div>\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">\n          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">Anthropic API klíč</label>\n          <input id="mfSetAnthro" type="password" placeholder="sk-ant-…" value="${t(localStorage.getItem("mf_anthropic_key")||"")}"\n            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:monospace;">\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;">Potřeba pro AI doporučení. Získej na <a href="https://console.anthropic.com" target="_blank" style="color:rgba(0,122,255,0.7);">console.anthropic.com</a></div>\n        </div>\n\n        \x3c!-- AI Source stats --\x3e\n        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 14px;">\n          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n            <span style="font-size:0.68rem;font-weight:600;color:rgba(255,255,255,0.5);">✦ AI Source statistiky</span>\n            <button id="mfResetAiStats" style="font-size:0.6rem;background:transparent;border:none;color:rgba(255,100,100,0.6);cursor:pointer;padding:2px 6px;">Reset</button>\n          </div>\n          <div id="mfAiStatsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;"></div>\n        </div>\n      </div>\n\n      \x3c!-- Save button --\x3e\n      <div style="padding:24px 24px 0;">\n        <button id="mfSetSave" style="width:100%;padding:16px;border-radius:16px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.9rem;font-weight:700;cursor:pointer;letter-spacing:-0.2px;">Uložit nastavení</button>\n      </div>\n    `, s.appendChild(r), document.body.appendChild(s),
            function() {
              if (document.getElementById("mfSettStyle")) return;
              const e = document.createElement("style");
              e.id = "mfSettStyle", e.textContent = "\n      @keyframes mfSettFade { from{opacity:0} to{opacity:1} }\n      @keyframes mfSettUp { from{transform:translateY(40px);opacity:0} to{transform:none;opacity:1} }\n      #mfBeautifulSettings input::placeholder { color:rgba(255,255,255,0.2); }\n      #mfBeautifulSettings *::-webkit-scrollbar { width:3px; }\n      #mfBeautifulSettings *::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12);border-radius:3px; }\n    ", document.head.appendChild(e)
            }(),
            function(e) {
              e.querySelector("#mfSetClose").onclick = () => e.remove(), e.addEventListener("click", t => {
                t.target === e && e.remove()
              }),  e.querySelector("#mfResetAiStats").onclick = () => {
                window.CinAI && (CinAI.resetStats(), n(), "function" == typeof showToast && showToast("AI statistiky vynulovány"))
              }, e.querySelectorAll("input").forEach(e => {
                e.addEventListener("focus", () => e.style.borderColor = "rgba(0,122,255,0.45)"), e.addEventListener("blur", () => e.style.borderColor = "rgba(255,255,255,0.09)")
              }), e.querySelector("#mfSetSave").onclick = () => {
                const n = e.querySelector("#mfSetTmdb").value.trim();
                n && localStorage.setItem("mf_tmdb_key", n);
                const a = e.querySelector("#mfSetAnthro").value.trim();
                a && localStorage.setItem("mf_anthropic_key", a), e.remove(), "function" == typeof showToast && showToast("✅ Nastavení uloženo!", "success")
              }
            }(s), n()
        }()
      }
    }
  }(),
  function() {
    window.openSettings;
    window.openSettings = function() {
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

function _cinJs(e) {
  return JSON.stringify(String(e)).replace(/</g, "\\u003c").replace(/&/g, "\\u0026").replace(/"/g, "&quot;")
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
        n.innerHTML = `\n        <div style="position:absolute;inset:0;${c}">\n          \x3c!-- Tmavý overlay přes backdrop --\x3e\n          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.55) 50%,rgba(0,0,0,0.4) 100%);"></div>\n          \x3c!-- Blur vrstva pro glass efekt --\x3e\n          <div style="position:absolute;inset:0;backdrop-filter:blur(2px);"></div>\n\n          \x3c!-- Obsah uprostřed — tmavý glass panel garantuje čitelnost vždy --\x3e\n          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,'SF Pro Display',Inter,sans-serif;">\n\n            \x3c!-- Glass panel — izoluje texty od pozadí --\x3e\n            <div style="background:rgba(0,0,0,0.62);backdrop-filter:blur(28px) saturate(1.3);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:40px 52px;display:flex;flex-direction:column;align-items:center;gap:20px;box-shadow:0 32px 96px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.06);min-width:300px;max-width:460px;">\n\n              \x3c!-- Název + epizoda --\x3e\n              <div style="text-align:center;">\n                <div style="font-size:1.65rem;font-weight:800;color:#fff;letter-spacing:-0.5px;line-height:1.2;">${escapeHTML(o.title||"")}</div>\n                ${"tv"===o.type?`<div style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin-top:8px;letter-spacing:2px;font-weight:600;">S${String(o.season).padStart(2,"0")} · E${String(o.ep).padStart(2,"0")}</div>`:""}\n              </div>\n\n              \x3c!-- Hlavní play tlačítko --\x3e\n              <button onclick="(function(){const pw=screen.width,ph=screen.height,pop=window.open(${_cinJs(e)},'MujFlixCinema','width='+pw+',height='+ph+',left=0,top=0,menubar=no,toolbar=no,location=no,scrollbars=yes');if(!pop||pop.closed)window.open(${_cinJs(e)},'_blank','noopener');})()"\n                style="padding:18px 52px;border-radius:60px;background:linear-gradient(135deg,rgba(48,209,88,0.97),rgba(37,162,68,1));border:none;color:#fff;font-size:1.1rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25);transition:all 0.2s;letter-spacing:-0.2px;"\n                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 16px 52px rgba(48,209,88,0.6),inset 0 1px 0 rgba(255,255,255,0.25)'"\n                onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25)'">\n                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>\n                Přehrát\n              </button>\n\n              \x3c!-- Zdroj label — vždy čitelný na tmavém panelu --\x3e\n              <div style="font-size:0.68rem;color:rgba(255,255,255,0.55);letter-spacing:2px;text-transform:uppercase;font-weight:600;">${escapeHTML(t)}</div>\n\n              ${a&&l?`\n              \x3c!-- Další epizoda --\x3e\n              <button onclick="(function(){_cinState.season=${s};_cinState.ep=${r};document.getElementById('cinemaSubtitle').textContent='S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}';const e=document.getElementById('cinemaEpSel');if(e)e.value='${r}';const se=document.getElementById('cinemaSeasonSel');if(se)se.value='${s}';_cinLoad();})()"\n                style="display:flex;align-items:center;gap:9px;padding:11px 26px;border-radius:40px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:rgba(255,255,255,0.8);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:-apple-system,Inter,sans-serif;transition:all 0.18s;letter-spacing:-0.1px;"\n                onmouseover="this.style.background='rgba(255,255,255,0.16)';this.style.color='#fff'"\n                onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.8)'">\n                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">\n                  <polygon points="5 3 15 12 5 21 5 3" fill="currentColor" stroke="none"/>\n                  <line x1="19" y1="3" x2="19" y2="21"/>\n                </svg>\n                Další epizoda · S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}\n              </button>`:""}\n\n              \x3c!-- Hledat na webu — vždy viditelné na glass panelu --\x3e\n              <a href="${d}" target="_blank" rel="noopener"\n                style="font-size:0.68rem;color:rgba(255,255,255,0.4);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color 0.15s;font-weight:500;"\n                onmouseover="this.style.color='rgba(255,255,255,0.8)'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">\n                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>\n                Nenašlo se? Hledat na webu\n              </a>\n\n            </div>\x3c!-- /glass panel --\x3e\n          </div>\n        </div>\n      `
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
    setTimeout(() => {
      try {
        const doc = r.contentDocument || r.contentWindow?.document;
        if (doc && (doc.title === "" || doc.body?.innerHTML === "")) {
          l.style.pointerEvents = "auto";
          return;
        }
      } catch (ex) {
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
    document.querySelectorAll(".dock-btn").forEach(e => {
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
      });
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


const MF_CHANGELOG_KEY = 'mf_changelog_v1';
const MF_CHANGELOG_SEEN_KEY = 'mf_changelog_seen_ts';

const CL_TYPES = {
  feature:     { label: '✨ Novinka',        color: '#4da6ff', bg: 'rgba(0,122,255,0.12)',  border: 'rgba(0,122,255,0.3)'  },
  fix:         { label: '🐛 Oprava bugu',    color: '#5fffb0', bg: 'rgba(0,200,100,0.1)',   border: 'rgba(0,200,100,0.3)'  },
  improvement: { label: '⚡ Vylepšení',      color: '#ffd166', bg: 'rgba(255,180,0,0.1)',   border: 'rgba(255,180,0,0.3)'  },
  breaking:    { label: '⚠️ Změna chování', color: '#ff8c69', bg: 'rgba(255,100,60,0.1)',   border: 'rgba(255,100,60,0.3)' },
};

function openChangelog() {
  try {
    const all = JSON.parse(localStorage.getItem(MF_CHANGELOG_KEY) || '[]');
    if (!all.length) return;

    const seenTs  = parseInt(localStorage.getItem(MF_CHANGELOG_SEEN_KEY) || '0');
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

function closeChangelog() {
  const modal = document.getElementById('mfChangelogModal');
  if (!modal) return;
  modal.style.display = 'none';
  localStorage.setItem(MF_CHANGELOG_SEEN_KEY, Date.now().toString());
  const badge = document.getElementById('clNewBadge');
  if (badge) badge.style.display = 'none';
}

function checkChangelogOnLoad() {
  try {
    const all = JSON.parse(localStorage.getItem(MF_CHANGELOG_KEY) || '[]');
    if (!all.length) return;
    const seenTs = parseInt(localStorage.getItem(MF_CHANGELOG_SEEN_KEY) || '0');
    const unseen = all.filter(e => e.ts > seenTs);
    if (!unseen.length) return;

    setTimeout(() => {
      if (typeof showToast !== 'function') return;
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

document.addEventListener('DOMContentLoaded', () => {
  checkChangelogOnLoad();
});

(function() {

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
    /* OPRAVA: na dotyku (mobil/tablet) zůstává :hover "přilepený" po ťuknutí
       a dřív ho scroll náhodou smazal — teď hover funguje jen na zařízeních
       s opravdovou myší, na dotyku se karta nezvětšuje a nepřekáží. */
    @media (hover: hover) and (pointer: fine) {
      .ssv-card:hover {
        transform: translateY(-4px) !important;
        border-color: rgba(255,255,255,0.2) !important;
        box-shadow: 0 14px 32px rgba(0,0,0,0.55) !important;
      }
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
    .episode-card:hover .ep-title { color: #fff !important; }
    /* OPRAVA: rozbalení popisku a tlačítek na hover dělalo řádek epizody
       vyšší, takže "přerůstal" přes sousední řádky. Na dotyku navíc hover
       zůstává "přilepený" po ťuknutí (scroll ho dřív náhodou smazal, teď
       ne) — proto se to celé zapíná jen na zařízeních se skutečnou myší. */
    @media (hover: hover) and (pointer: fine) {
      .episode-card:hover .ep-title { white-space: normal !important; }
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
    @media (hover: hover) and (pointer: fine) {
      .episode-card:hover .ep-desc {
        max-height: 55px !important; opacity: 1 !important; margin-top: 4px !important;
      }
    }
    .ep-actions {
      max-height: 0 !important; opacity: 0 !important; margin-top: 0 !important;
      overflow: hidden !important;
      transition: max-height 0.28s ease, opacity 0.22s ease, margin-top 0.22s ease !important;
    }
    @media (hover: hover) and (pointer: fine) {
      .episode-card:hover .ep-actions {
        max-height: 36px !important; opacity: 1 !important;
        overflow: visible !important; margin-top: 8px !important;
      }
    }
    /* Na dotyku jsou tlačítka (přehrát / označit) vidět rovnou, bez hoveru */
    @media (hover: none), (pointer: coarse) {
      .ep-actions {
        max-height: 36px !important; opacity: 1 !important;
        overflow: visible !important; margin-top: 8px !important;
      }
      .ep-desc {
        max-height: 55px !important; opacity: 1 !important; margin-top: 4px !important;
      }
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

  const _origRenderEpisodes = window.renderEpisodes;
  window.renderEpisodes = async function() {
    await _origRenderEpisodes.apply(this, arguments);
    const grid = document.getElementById('episodesGrid');
    if (!grid) return;
    grid.querySelectorAll('div[style*="font-weight:700"], div[style*="font-weight: 700"]').forEach(el => {
      if (el.textContent.startsWith('Serie ') || el.textContent.startsWith('Série ')) {
        el.className = 'mf-season-header';
        el.style.cssText = '';
      }
    });
  };

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
