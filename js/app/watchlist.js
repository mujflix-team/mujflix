/* Oblíbené: seznam, filtry, hodnocení. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
/* Název oblíbené položky vždy jako text (starší záznamy mohly mít místo názvu objekt → „[object Object]“) */
function mfFavName(w) {
  const n = w && w.name;
  if ("string" == typeof n) return n;
  if (n && "object" == typeof n) {
    const t = n.title || n.name || n.cs || n.original || n.en;
    if ("string" == typeof t) return t
  }
  const d = "undefined" != typeof db && w && db[w.slug];
  return d && "string" == typeof d.name ? d.name : ""
}

function getWatchlist() {
  try {
    // Poškozené záznamy (null, čísla, objekty bez slugu) se přeskočí, aby nespadl seznam ani přidávání
    return safeLS(uKey("mf_watchlist"), "[]").filter(w => w && "object" == typeof w && !Array.isArray(w) && null != w.slug)
      .map(w => "string" == typeof w.name ? w : Object.assign({}, w, { name: mfFavName(w) }))
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
  const miss = list.filter(w => w && w.tmdbId && (!w.poster || !w.name));
  if (!miss.length) return;
  _mfPosterFixBusy = true;
  try {
    const found = {};
    for (const w of miss.slice(0, 30)) {
      try {
        const kind = w.type === "series" ? "tv" : "movie";
        const d = await tmdbGet("/" + kind + "/" + w.tmdbId + "?language=cs-CZ");
        if (d) found[w.slug + "|" + w.tmdbId] = { p: d.poster_path ? "https://image.tmdb.org/t/p/w342" + d.poster_path : "", n: d.title || d.name || "" };
      } catch (e) {}
    }
    // seznam mezitím mohl uživatel změnit (odebrat položku) – načti ho znovu, ať ji nevrátíme zpět
    const fresh = getWatchlist();
    let changed = false;
    fresh.forEach(w => {
      const u = found[w.slug + "|" + w.tmdbId];
      if (u && u.p && !w.poster) { w.poster = u.p; changed = true }
      if (u && u.n && !w.name) { w.name = u.n; changed = true }
    });
    if (changed) {
      saveWatchlistData(fresh);
      try { if (typeof renderHomepage === "function") renderHomepage(); } catch (e) {}
      try { const o = document.getElementById("watchlistOverlay"); if (o && o.classList.contains("open")) renderWatchlist(); } catch (e) {}
    }
  } finally { _mfPosterFixBusy = false; }
}
window.mfBackfillFavPosters = mfBackfillFavPosters;
setTimeout(() => { try { mfBackfillFavPosters() } catch (e) {} }, 3000); // doplní chybějící názvy a plakáty ze starších záznamů

function tmdbFavSlug(id, mediaType) {
  return "__tmdbfav_" + ("tv" === mediaType ? "tv" : "movie") + "_" + id
}

/* Je položka záznamem o titulu z TMDB? Platí i pro seriál uložený pod místním slugem (srdíčko v okně seriálu) */
function _mfFavMatches(w, id, mediaType) {
  const kind = "tv" === mediaType ? "series" : "movie";
  if (w.slug === tmdbFavSlug(id, mediaType)) return true;
  if (w.tmdbId && String(w.tmdbId) === String(id) && w.type === kind) return true;
  return "series" === kind && "undefined" != typeof db && !!db[w.slug] && String(db[w.slug].tmdbId) === String(id)
}

function isTmdbFavorite(id, mediaType) {
  return getWatchlist().some(w => _mfFavMatches(w, id, mediaType))
}

function toggleTmdbFavorite(id, mediaType, name, poster, btn) {
  if (!id) return;
  const slug = tmdbFavSlug(id, mediaType),
    list = getWatchlist(),
    idx = list.findIndex(w => _mfFavMatches(w, id, mediaType));
  if (idx >= 0) {
    for (let i = list.length - 1; i >= 0; i--) _mfFavMatches(list[i], id, mediaType) && list.splice(i, 1);
    if (typeof showToast === "function") showToast("Odebráno z Oblíbených");
  } else {
    list.push({
      slug,
      name: "string" == typeof name ? name : mfFavName({ name }),
      type: "tv" === mediaType ? "series" : "movie",
      poster: poster || "",
      tmdbId: id
    });
    if (typeof showToast === "function") showToast("Přidáno do Oblíbených")
  }
  saveWatchlistData(list);
  if (idx < 0 && !poster) setTimeout(mfBackfillFavPosters, 50);
  if (btn) btn.classList.toggle("faved", idx < 0);
  if (typeof updateWatchlistBtns === "function") updateWatchlistBtns()
}

function openWatchlist() {
  setTimeout(mfBackfillFavPosters, 50);
  const e = document.getElementById("watchlistOverlay");
  clearTimeout(closeWatchlist._t), e.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add("visible"))), renderWatchlist()
}

function closeWatchlist() {
  const e = document.getElementById("watchlistOverlay");
  e.classList.remove("visible"), clearTimeout(closeWatchlist._t), closeWatchlist._t = setTimeout(() => e.classList.remove("open"), 280)
}

window._wlFilter = "all";
window._wlQuery = "";

function wlSetFilter(f) {
  window._wlFilter = f, renderWatchlist()
}

function wlSetSort(v) {
  window._wlSort = v, renderWatchlist()
}

/* Rozkoukáno u položky oblíbených: seriál (kolik epizod, další epizoda) nebo film, který sis pustil a nedokoukal jsi ho. */
function wlResumeInfo(item) {
  try {
    if ("series" === item.type) {
      let slug = item.slug && db[item.slug] ? item.slug : null;
      if (!slug && item.tmdbId) slug = Object.keys(db).find(k => db[k] && db[k].tmdbId && String(db[k].tmdbId) === String(item.tmdbId)) || null;
      if (!slug) return null;
      const p = calcProgress(slug);
      if (!p || !p.seen) return null;
      const n = findNextEp(slug);
      return { kind: "series", slug, seen: p.seen, total: p.total, pct: p.pct, done: p.total > 0 && p.seen >= p.total, next: n ? "S" + n.se + " E" + n.ep : "" }
    }
    if (item.tmdbId && typeof window.mfhMovieStarted === "function" && window.mfhMovieStarted(item.tmdbId)) return { kind: "movie", pct: 0, done: false, next: "" }
  } catch (e) {}
  return null
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
    set("wlTabAll", "Vše", all.length), set("wlTabMovie", "Filmy", nMovie), set("wlTabSeries", "Seriály", nSeries);
    const nRes = all.filter(x => { const r = wlResumeInfo(x); return r && !r.done }).length, rb = document.getElementById("wlTabResume");
    rb && (rb.textContent = "Rozkoukané · " + nRes, rb.classList.toggle("active", "resume" === f), rb.style.display = nRes || "resume" === f ? "" : "none");
    const so = document.getElementById("wlSort");
    so && so.value !== (window._wlSort || "new") && (so.value = window._wlSort || "new")
  }
  if (!all.length) return void(empty.style.display = "flex");
  empty.style.display = "none";
  const shown = [];
  all.forEach((item, idx) => {
    if ("resume" === f) {
      const r = wlResumeInfo(item);
      if (!r || r.done) return
    } else if ("all" !== f && ("series" === f ? "series" !== item.type : "series" === item.type)) return;
    q && !(item.name || "").toLowerCase().includes(q) || shown.push({
      item,
      idx
    })
  });
  const sortBy = window._wlSort || "new";
  "az" === sortBy ? shown.sort((a, b) => String(a.item.name || "").localeCompare(String(b.item.name || ""), "cs")) : "resume" === sortBy ? shown.sort((a, b) => { const ra = wlResumeInfo(a.item), rb = wlResumeInfo(b.item); return (rb && !rb.done ? 1 : 0) - (ra && !ra.done ? 1 : 0) || b.idx - a.idx }) : shown.reverse();
  if (!shown.length) {
    const n = document.createElement("div");
    return n.className = "wl-noresult", n.textContent = "Nic nenalezeno. Zkus jiný filtr nebo hledání.", void list.appendChild(n)
  }
  shown.forEach(({
    item,
    idx
  }) => {
    const c = document.createElement("div"),
      isSeries = "series" === item.type,
      res = wlResumeInfo(item);
    c.className = "wl-card", c.tabIndex = 0, c.setAttribute("role", "button"), c.setAttribute("aria-label", "Otevřít " + (item.name || "")), c.innerHTML = `<div class="wl-card-poster">${item.poster?`<img src="${_esc(item.poster)}" alt="" loading="lazy" onerror="this.remove()">`:""}<div class="wl-card-fallback">${isSeries?"📺":"🎬"}</div><span class="wl-card-badge">${isSeries?"Seriál":"Film"}</span><button type="button" class="wl-card-remove" title="Odebrat z Oblíbených" aria-label="Odebrat z Oblíbených">✕</button><div class="wl-card-play">▶</div>${res&&!res.done&&res.kind==="series"?`<div class="wl-card-prog" aria-hidden="true"><i style="width:${Math.max(4,res.pct)}%"></i></div>`:""}</div><div class="wl-card-name">${_esc(item.name)}</div>${res?`<div class="wl-card-sub">${res.done?"Dokoukáno":res.kind==="series"?`${res.seen} z ${res.total} epizod${res.next?" · další "+res.next:""}`:"Rozkoukaný film"}</div>`:""}`;
    const open = () => openFavoriteItem(item);
    c.onclick = e => {
      e.target.closest(".wl-card-remove") || open()
    }, c.onkeydown = e => {
      "Enter" !== e.key && " " !== e.key || (e.preventDefault(), open())
    }, c.querySelector(".wl-card-remove").onclick = e => {
      e.stopPropagation();
      const cur = getWatchlist(),
        k = cur.findIndex(x => x.slug === item.slug && x.name === item.name);
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
      if (e.slug && typeof openSeries === "function" && "undefined" != typeof db && db[e.slug]) {
        return void openSeries(e.slug);
      }
      mfFavFind(e)
    } catch (err) {
      mfFavFind(e)
    }
  }, 300);
}

/* Položka bez ID i místního seriálu: dohledá se v TMDB podle názvu a otevře se normální detail (žádný vyhledávací dialog) */
async function mfFavFind(e) {
  const name = mfFavName(e), kind = "series" === e.type ? "tv" : "movie";
  try {
    if (name) {
      const d = await tmdbGet("/search/" + kind + "?language=cs-CZ&query=" + encodeURIComponent(name)),
        r = d && d.results && d.results[0];
      if (r) return void ("tv" === kind ? openDiscoverTv(r.id, r.name || name) : _showCinemaOrFinderChoice(r.id, r.title || name, "movie"))
    }
  } catch (err) {}
  "function" == typeof showToast && showToast("Tenhle titul se nepodařilo otevřít", 3000)
}

function toggleWatchlistItem(e) {
  const t = getWatchlist(),
    n = t.findIndex(t => t.slug === e);
  if (n >= 0) t.splice(n, 1), showToast("Odebráno z Oblíbených");
  else {
    t.push({
      slug: e,
      name: db[e]?.name || e,
      type: "series",
      poster: db[e]?._poster || db[e]?.poster || ""
    }), showToast("Přidáno do Oblíbených");
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
  e.classList.toggle("in-watchlist", t), e.textContent = t ? "♥" : "♡", e.title = e.ariaLabel = t ? "Odebrat z Oblíbených" : "Přidat do Oblíbených"
}

function closeRating() {
  const e = document.getElementById("ratingOverlay");
  e.classList.remove("visible"), clearTimeout(closeRating._t), closeRating._t = setTimeout(() => e.classList.remove("open"), 280)
}

function submitRating(e) {
  if (!_ratingSlug) return;
  const t = safeLS(uKey("mf_ratings"), "{}");
  if (t[_ratingSlug] = {
      rating: e,
      name: db[_ratingSlug]?.name || _ratingSlug,
      genres: db[_ratingSlug]?._genreIds?.length ? db[_ratingSlug]._genreIds : aiBrain.idsForNames(db[_ratingSlug]?._genres),
      ts: Date.now()
    }, _ratingSignalCache = null, safeSetItem(uKey("mf_ratings"), JSON.stringify(t)), aiBrain && db[_ratingSlug]) {
    const t = "loved" === e ? .25 : "liked" === e ? .15 : "ok" === e ? .05 : -.1;
    db[_ratingSlug]._genres && aiBrain.boostGenresFromTmdb(db[_ratingSlug]._genres, t)
  }
  closeRating(), showToast("loved" === e ? "Super! AI si to zapamatuje pro doporučení 🎉" : "meh" === e ? "Chápeme, příště něco lepšího 👍" : "Díky za hodnocení!")
}
document.getElementById("watchlistOverlay").addEventListener("click", e => {
  e.target === document.getElementById("watchlistOverlay") && closeWatchlist()
});
