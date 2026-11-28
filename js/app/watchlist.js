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
    // Poškozené záznamy (null, čísla, objekty bez textového slugu) se zahodí i z úložiště, aby v Oblíbených nezůstaly prázdné karty
    const raw = safeLS(uKey("mf_watchlist"), "[]"),
      list = raw.filter(w => w && "object" == typeof w && !Array.isArray(w) && "string" == typeof w.slug && w.slug)
        .map(w => "string" == typeof w.name ? w : Object.assign({}, w, { name: mfFavName(w) }));
    list.length !== raw.length && saveWatchlistData(list);
    return list
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

/* Vlastní seznamy: názvy jsou uložené přímo u položek (item.lists), takže se synchronizují i oddělují po profilech beze změny úložiště */
function wlListNames(all) {
  const set = {};
  (all || getWatchlist()).forEach(it => (it.lists || []).forEach(n => { set[n] = 1 }));
  return Object.keys(set).sort((a, b) => a.localeCompare(b, "cs"))
}
function wlItemSet(item, fn) {
  const cur = getWatchlist(), k = cur.findIndex(x => x.slug === item.slug && x.name === item.name);
  if (k < 0) return;
  cur[k].lists = (cur[k].lists || []).slice();
  fn(cur[k].lists);
  cur[k].lists.length || delete cur[k].lists;
  saveWatchlistData(cur), renderWatchlist()
}
function wlCloseMenu() {
  const m = document.getElementById("mfWlMenu");
  m && m.remove(), document.removeEventListener("mousedown", wlMenuOutside, true), document.removeEventListener("keydown", wlMenuKey, true)
}
function wlMenuOutside(e) { const m = document.getElementById("mfWlMenu"); m && !m.contains(e.target) && !e.target.closest(".wl-card-lists") && wlCloseMenu() }
function wlMenuKey(e) { "Escape" === e.key && (e.stopPropagation(), wlCloseMenu()) }
function wlOpenListMenu(item, anchor) {
  const had = !!document.getElementById("mfWlMenu");
  wlCloseMenu();
  if (had && anchor._wlOpen) { anchor._wlOpen = false; return }
  anchor._wlOpen = true;
  const m = document.createElement("div");
  m.id = "mfWlMenu", m.className = "wl-menu", m.setAttribute("role", "dialog"), m.setAttribute("aria-label", "Seznamy");
  const draw = () => {
    const cur = getWatchlist().find(x => x.slug === item.slug && x.name === item.name), mine = (cur && cur.lists) || [];
    m.innerHTML = '<div class="wl-menu-title">Přidat do seznamu</div>' + wlListNames().map(n => `<button type="button" class="wl-menu-row${mine.includes(n) ? " on" : ""}" data-n="${_esc(n)}"><span class="wl-menu-check">${mine.includes(n) ? "✓" : ""}</span><span class="wl-menu-name">${_esc(n)}</span></button>`).join("") + '<form class="wl-menu-new"><input type="text" maxlength="24" placeholder="Nový seznam" aria-label="Název nového seznamu"><button type="submit">Přidat</button></form>';
    m.querySelectorAll(".wl-menu-row").forEach(b => b.onclick = () => { const n = b.dataset.n; wlItemSet(item, l => { const i = l.indexOf(n); i >= 0 ? l.splice(i, 1) : l.push(n) }), draw() });
    m.querySelector("form").onsubmit = e => { e.preventDefault(); const v = m.querySelector("input").value.trim().slice(0, 24); v && (wlItemSet(item, l => { l.includes(v) || l.push(v) }), draw()) }
  };
  draw(), document.body.appendChild(m);
  const r = anchor.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + "px", m.style.top = (r.bottom + 6 + h > innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + "px";
  setTimeout(() => { document.addEventListener("mousedown", wlMenuOutside, true), document.addEventListener("keydown", wlMenuKey, true) }, 0)
}
function wlRenameList(name) {
  const v = (prompt("Nový název seznamu", name) || "").trim().slice(0, 24);
  if (!v || v === name) return;
  const cur = getWatchlist();
  cur.forEach(it => { it.lists && it.lists.includes(name) && (it.lists = Array.from(new Set(it.lists.map(n => n === name ? v : n)))) });
  saveWatchlistData(cur), window._wlFilter = "list:" + v, renderWatchlist()
}
function wlDeleteList(name) {
  if (!confirm("Smazat seznam „" + name + "“? Filmy a seriály zůstanou v Oblíbených.")) return;
  const cur = getWatchlist();
  cur.forEach(it => { it.lists && (it.lists = it.lists.filter(n => n !== name), it.lists.length || delete it.lists) });
  saveWatchlistData(cur), window._wlFilter = "all", renderWatchlist()
}

window._wlFilter = "all";
window._wlQuery = "";

/* Nový díl: rozkoukaný seriál, kterému za posledních 14 dní vyšla epizoda (stejná cache `mf_newep_<id>` jako odznak v Domů) */
function wlNewEpId(item) {
  const r = wlResumeInfo(item);
  if (!r || "series" !== r.kind || r.done) return null;
  return db[r.slug] && db[r.slug].tmdbId || item.tmdbId || null
}
function wlHasNewEp(item) {
  try {
    const id = wlNewEpId(item);
    if (!id) return false;
    const c = JSON.parse(localStorage.getItem("mf_newep_" + id) || "null"), age = c && c.air ? (Date.now() - new Date(c.air).getTime()) / 864e5 : 999;
    return age >= 0 && age <= 14
  } catch (e) { return false }
}
let _wlNewEpAt = 0;
function wlRefreshNewEps() {
  if (Date.now() - _wlNewEpAt < 60000 || "function" != typeof tmdbGet) return;
  _wlNewEpAt = Date.now();
  let changed = 0, pending = 0;
  getWatchlist().forEach(item => {
    const id = wlNewEpId(item);
    if (!id) return;
    const ck = "mf_newep_" + id;
    let c = null;
    try { c = JSON.parse(localStorage.getItem(ck) || "null") } catch (e) {}
    if (c && Date.now() - c.t < 432e5) return;
    pending++;
    tmdbGet("/tv/" + id + "?language=cs-CZ").then(r => {
      const air = r && r.last_episode_to_air && r.last_episode_to_air.air_date || "";
      try { localStorage.setItem(ck, JSON.stringify({ t: Date.now(), air })) } catch (e) {}
      changed++
    }).catch(() => {}).then(() => { --pending || (changed && renderWatchlist()) })
  })
}

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

/* Hledání bez ohledu na diakritiku, velikost písmen, mezery a interpunkci („breakingbad“ najde „Breaking Bad“) */
function wlFold(t) {
  let x = String(t || "").toLowerCase();
  try { x = x.normalize("NFD").replace(/[\u0300-\u036f]/g, "") } catch (e) {}
  return x.replace(/[^a-z0-9\u0400-\u04ff\u3040-\u9fff]+/g, "")
}
function wlSearch(v) {
  window._wlQuery = wlFold(v), renderWatchlist()
}

function renderWatchlist() {
  const all = getWatchlist(),
    list = document.getElementById("watchlistList"),
    empty = document.getElementById("watchlistEmpty"),
    count = document.getElementById("wlCount"),
    tools = document.getElementById("wlTools"),
    q = window._wlQuery || "";
  if (!list || !empty) return;
  let f = window._wlFilter || "all";
  list.querySelectorAll(".wl-card, .wl-noresult, .wl-resume").forEach(x => x.remove());
  const listNames = wlListNames(all);
  "string" == typeof f && 0 === f.indexOf("list:") && !listNames.includes(f.slice(5)) && (f = window._wlFilter = "all");
  const nSeries = all.filter(x => "series" === x.type).length,
    nMovie = all.length - nSeries;
  if (count && (count.textContent = all.length ? all.length + (1 === all.length ? " položka" : all.length < 5 ? " položky" : " položek") : ""), tools) {
    tools.style.display = all.length ? "" : "none";
    const set = (id, txt, n) => {
      const b = document.getElementById(id);
      b && (b.textContent = txt + " · " + n, b.classList.toggle("active", b.dataset.f === f))
    };
    set("wlTabAll", "Vše", all.length), set("wlTabMovie", "Filmy", nMovie), set("wlTabSeries", "Seriály", nSeries);
    const nNew = all.filter(wlHasNewEp).length, nb = document.getElementById("wlTabNew");
    nb && (nb.textContent = "Nový díl · " + nNew, nb.classList.toggle("active", "newep" === f), nb.style.display = nNew || "newep" === f ? "" : "none");
    const nRes = all.filter(x => { const r = wlResumeInfo(x); return r && !r.done }).length, rb = document.getElementById("wlTabResume");
    rb && (rb.textContent = "Rozkoukané · " + nRes, rb.classList.toggle("active", "resume" === f), rb.style.display = nRes || "resume" === f ? "" : "none");
    const tabs = tools.querySelector(".wl-tabs");
    tabs.querySelectorAll(".wl-tab-list").forEach(x => x.remove());
    const anchorTab = document.getElementById("wlTabNew");
    listNames.forEach(n => {
      const b = document.createElement("button");
      b.type = "button", b.className = "wl-tab wl-tab-list" + (("list:" + n) === window._wlFilter ? " active" : ""), b.dataset.f = "list:" + n,
      b.textContent = n + " · " + all.filter(x => (x.lists || []).includes(n)).length, b.onclick = () => wlSetFilter("list:" + n),
      tabs.insertBefore(b, anchorTab)
    });
    const nTodo = all.filter(x => !wlResumeInfo(x)).length, tb = document.getElementById("wlTabTodo");
    tb && (tb.textContent = "Chci vidět · " + nTodo, tb.classList.toggle("active", "todo" === f), tb.style.display = nTodo && nTodo < all.length || "todo" === f ? "" : "none");
    const so = document.getElementById("wlSort");
    so && so.value !== (window._wlSort || "new") && (so.value = window._wlSort || "new", window.mfSyncDropdown && window.mfSyncDropdown(so))
  }
  wlRefreshNewEps();
  if (!all.length) return void(empty.style.display = "flex");
  empty.style.display = "none";
  const shown = [];
  all.forEach((item, idx) => {
    if ("newep" === f) {
      if (!wlHasNewEp(item)) return
    } else if ("string" == typeof f && 0 === f.indexOf("list:")) {
      if (!(item.lists || []).includes(f.slice(5))) return
    } else if ("todo" === f) {
      if (wlResumeInfo(item)) return
    } else if ("resume" === f) {
      const r = wlResumeInfo(item);
      if (!r || r.done) return
    } else if ("all" !== f && ("series" === f ? "series" !== item.type : "series" === item.type)) return;
    q && !wlFold(item.name).includes(q) || shown.push({
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
  if ("string" == typeof f && 0 === f.indexOf("list:")) {
    const nm = f.slice(5), bar = document.createElement("div");
    bar.className = "wl-resume wl-listbar", bar.innerHTML = '<span class="wl-listbar-name"></span><button type="button" class="wl-listbar-btn" data-a="rename">Přejmenovat</button><button type="button" class="wl-listbar-btn" data-a="delete">Smazat seznam</button>',
    bar.querySelector(".wl-listbar-name").textContent = nm,
    bar.querySelector('[data-a="rename"]').onclick = () => wlRenameList(nm), bar.querySelector('[data-a="delete"]').onclick = () => wlDeleteList(nm),
    list.insertBefore(bar, list.firstChild)
  }
  if ("all" === f && !q) {
    const cont = all.map(it => ({ it, r: wlResumeInfo(it) })).filter(x => x.r && !x.r.done);
    if (cont.length) {
      const box = document.createElement("section");
      box.className = "wl-resume";
      box.innerHTML = '<h3 class="wl-resume-title">Pokračovat ve sledování</h3><div class="wl-resume-track"></div>';
      const track = box.querySelector(".wl-resume-track");
      cont.forEach(({ it, r }) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "wl-resume-card";
        b.innerHTML = `<span class="wl-resume-poster">${it.poster ? `<img src="${_esc(it.poster)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span><span class="wl-resume-info"><span class="wl-resume-name">${_esc(it.name)}</span><span class="wl-resume-sub">${"series" === r.kind ? (r.next ? "Další " + r.next : r.seen + " z " + r.total + " epizod") : "Rozkoukaný film"}</span>${"series" === r.kind ? `<span class="wl-resume-bar"><i style="width:${Math.max(4, r.pct)}%"></i></span>` : ""}<span class="wl-resume-go">Pokračovat</span></span>`;
        b.onclick = () => openFavoriteItem(it);
        track.appendChild(b)
      });
      list.insertBefore(box, list.firstChild)
    }
  }
  shown.forEach(({
    item,
    idx
  }) => {
    const c = document.createElement("div"),
      isSeries = "series" === item.type,
      res = wlResumeInfo(item);
    c.className = "wl-card", c._wlItem = item, c.tabIndex = 0, c.setAttribute("role", "button"), c.setAttribute("aria-label", "Otevřít " + (item.name || "")), c.innerHTML = `<div class="wl-card-poster">${item.poster?`<img src="${_esc(item.poster)}" alt="" loading="lazy" onerror="this.remove()">`:""}<div class="wl-card-fallback">${_esc((item.name||"?").trim().charAt(0).toUpperCase())}</div><button type="button" class="wl-card-lists${item.lists && item.lists.length ? " on" : ""}" title="Seznamy" aria-label="Přidat do seznamu"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h12M4 12h8M4 18h8M18 14v6M15 17h6"/></svg></button><button type="button" class="wl-card-remove" title="Odebrat z Oblíbených" aria-label="Odebrat z Oblíbených">✕</button><div class="wl-card-play" aria-hidden="true"><span class="wl-card-play-btn"><svg viewBox="8 5 11 14" width="30" height="36" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></div>${res&&!res.done&&res.kind==="series"?`<div class="wl-card-prog" aria-hidden="true"><i style="width:${Math.max(4,res.pct)}%"></i></div>`:""}</div><div class="wl-card-name">${_esc(item.name)}</div><div class="wl-card-sub">${isSeries?"Seriál":"Film"}${res?" · "+(res.done?"Dokoukáno":res.kind==="series"?`${res.seen} z ${res.total} epizod${res.next?" · další "+res.next:""}`:"Rozkoukaný film"):""}</div>`;
    const open = () => openFavoriteItem(item);
    c.onclick = e => {
      e.target.closest(".wl-card-remove, .wl-card-lists") || open()
    }, c.onkeydown = e => {
      "Enter" !== e.key && " " !== e.key || (e.preventDefault(), open())
    }, c.querySelector(".wl-card-lists").onclick = e => { e.stopPropagation(), wlOpenListMenu(item, e.currentTarget) }, c.querySelector(".wl-card-remove").onclick = e => {
      e.stopPropagation();
      const cur = getWatchlist(),
        k = cur.findIndex(x => x.slug === item.slug && x.name === item.name);
      k >= 0 && (cur.splice(k, 1), saveWatchlistData(cur), "function" == typeof updateWatchlistBtns && updateWatchlistBtns(), renderWatchlist())
    }, list.appendChild(c)
  })
}

function openFavoriteItem(e) {
  /* Oblíbené se zavřou až když je detail/přehrávač vidět (dřív se zavřely hned a během načítání probliklo Domů) */
  (function hideWatchlistUnder() {
    const w = document.getElementById("watchlistOverlay"), m = document.getElementById("seriesModal"), c = m && m.querySelector(".modal-content"), cin = () => document.getElementById("mfStandaloneCinema");
    let tries = 0;
    (function wait() {
      const detail = m && m.classList.contains("visible") && c && parseFloat(getComputedStyle(c).opacity) >= 0.99, cinema = cin() && getComputedStyle(cin()).display !== "none";
      if (!(detail || cinema) && ++tries < 60) return void setTimeout(wait, 50);
      if (w) w.style.transition = "none";
      try { closeWatchlist() } catch (err) {}
      setTimeout(() => { if (w) w.style.transition = "" }, 500)
    })()
  })();
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
  }, 0);
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
  if ("string" != typeof e || !e) return;
  "function" == typeof window.mfHaptic && window.mfHaptic(30);
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
      const mediaType = db[e]?.type === "movie" ? "movie" : "tv";
      db[e]?._genres && aiBrain.boostGenresFromTmdb(db[e]._genres, .12, mediaType),
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
    }, safeSetItem(uKey("mf_ratings"), JSON.stringify(t)), aiBrain && db[_ratingSlug]) {
    const t = "loved" === e ? .25 : "liked" === e ? .15 : "ok" === e ? .05 : -.1;
    db[_ratingSlug]._genres && aiBrain.boostGenresFromTmdb(db[_ratingSlug]._genres, t, db[_ratingSlug]?.type === "movie" ? "movie" : "tv")
  }
  closeRating(), showToast("loved" === e ? "Super! AI si to zapamatuje pro doporučení" : "meh" === e ? "Chápeme, příště něco lepšího" : "Díky za hodnocení!")
}
document.getElementById("watchlistOverlay").addEventListener("click", e => {
  e.target === document.getElementById("watchlistOverlay") && closeWatchlist()
});
// Po přepnutí profilu při otevřených Oblíbených se seznam přepíše (jinak zůstane vidět seznam předchozího profilu)
window.addEventListener("mf:profile-changed", () => {
  try { const o = document.getElementById("watchlistOverlay"); o && o.classList.contains("open") && renderWatchlist() } catch (e) {}
});

mfEnhanceDropdown(document.getElementById("wlSort"));
