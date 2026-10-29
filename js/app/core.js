/* Základ: úložiště, TMDB, postup sledování, hlášky, žánry a výpočty vkusu. Část původního app.js, načítá se v tomto pořadí (viz index.html). */


function safeLS(e, t) {
  // Výchozí hodnota (rozparsovaná) – použije se i tehdy, když uložená data mají špatný typ (null, číslo místo pole…)
  let d;
  try {
    d = JSON.parse(String(t))
  } catch {
    d = t
  }
  try {
    const v = JSON.parse(localStorage.getItem(e) || String(t));
    return null == d || typeof v == typeof d && (null !== v || null === d) && Array.isArray(v) === Array.isArray(d) ? v : d
  } catch {
    return d
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

/* Jediné místo, odkud se bere TMDB klíč: vlastní klíč v nastavení > klíč profilu > výchozí (proxy) */
function mfTmdbKey() {
  try {
    const own = localStorage.getItem("mf_tmdb_key");
    if (own) return own;
    const pid = localStorage.getItem("mf_active_pid");
    const per = pid ? localStorage.getItem("mf_tmdb_key_" + pid) : null;
    if (per) return per;
  } catch (e) {}
  return window.TMDB_KEY_DEFAULT || "";
}
let TMDB_KEY = mfTmdbKey(),
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

window.TMDB_KEY = TMDB_KEY;

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
  _ratingSlug = null;

function getWatched() {
  return safeLS(uKey("mf_watched"), "{}")
}

function saveWatched(e) {
  safeSetItem(uKey("mf_watched"), JSON.stringify(e))
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
    n.searchParams.has("api_key") || n.searchParams.set("api_key", mfTmdbKey()), n.searchParams.has("language") || n.searchParams.set("language", "cs-CZ");
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
    // Neúspěch (síť, 404) se necachuje, ať se příště zkusí znovu
    if (!o || !Array.isArray(o.episodes)) return null;
    return tmdbCache[n] = o.episodes.map(e => ({
      ep: e.episode_number,
      name: e.name || `Epizoda ${e.episode_number}`,
      still: e.still_path ? IMG + e.still_path : null,
      stillS: e.still_path ? IMG_S + e.still_path : null,
      overview: e.overview || "",
      runtime: e.runtime || 0,
      rating: e.vote_count > 2 ? e.vote_average || 0 : 0
    }))
  } catch {
    return null
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
async function loadTmdbDbData() {
  // Doplní vestavěným seriálům obrázky, hodnocení a žánry z TMDB (používá domovská stránka, hodnocení a AI).
  for (const e of Object.keys(db)) {
    const n = await fetchTmdbDetails(e);
    if (n) db[e]._backdrop = n.backdrop, db[e]._poster = n.poster, db[e]._rating = n.rating || 0, n.genres.length && (db[e]._genres = n.genres.map(e => e.name))
  }
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
  // Pokračuje se za nejvyšší zhlédnutou epizodou (ne první mezerou): když jsi viděl S1E2, nabídne se S1E3, ne S1E1.
  const t = getWatched(),
    n = totalSeasons(e);
  let hs = 0,
    he = 0;
  for (let o = 1; o <= n; o++)
    for (let n = 1; n <= epsInSeason(e, o); n++)
      if (t[`${e}-S${o}-E${n}`]) hs = o, he = n;
  if (!hs) return {
    se: 1,
    ep: 1,
    uid: `${e}-S1-E1`
  };
  let s = hs,
    p = he + 1;
  if (p > epsInSeason(e, s)) {
    if (s >= n) return null;
    s++, p = 1
  }
  return {
    se: s,
    ep: p,
    uid: `${e}-S${s}-E${p}`
  }
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
  document.getElementById("panelProgressFill").style.width = n + "%", document.getElementById("panelProgressText").textContent = `${t} / ${e} zhlédnuto${o && t ? ` · Další S${o.se} E${o.ep}` : ""}`, "function" == typeof _epRatingRefreshPanel && _epRatingRefreshPanel(activeSeries)
}

function calcTotalProgress() {
  const e = getWatched();
  let t = 0,
    n = 0;
  for (const o of Object.keys(db)) {
    // položky bez známého počtu epizod (např. nově přidané z Objevovat) by přidaly falešných 10 epizod na sérii
    if (!epsBySeason[o] && !(db[o] && db[o]._seasonEpCounts && db[o]._seasonEpCounts.length)) continue;
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
    }), n.length > 500 && n.splice(0, n.length - 500), localStorage.setItem(uKey("mf_watch_timeline"), JSON.stringify(n)), _momentumCache = null, window.mfhMarkDirty && window.mfhMarkDirty()
  } catch {}
}

function _isNonLatin(e) {
  return /[\u3000-\u9fff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff\u4e00-\u9fff]/.test(e)
}
