/* Detail seriálu: okno, řady a epizody, označení zhlédnutého. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
async function openDiscoverTv(tmdbId, title) {
  const slug = '__dtv_' + tmdbId;
  const IMG_P = 'https://image.tmdb.org/t/p/w342';
  const IMG_B = 'https://image.tmdb.org/t/p/w780';
  if (!db[slug]) {
    try {
      const d = await tmdbGet('/tv/' + tmdbId + '?language=cs');
      if (!d || d.success === false) throw new Error('no data');
      let svetSlug;
      const orig = d.original_name || '';
      if (orig && !_isNonLatin(orig)) {
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
  clearTimeout(closeConfirm._t), a.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => a.classList.add("visible")))
}

function confirmOk() {
  closeConfirm(), pendingCb && (pendingCb(), pendingCb = null)
}

function confirmCancel() {
  closeConfirm(), pendingCb = null
}

function closeConfirm() {
  const e = document.getElementById("confirmOverlay");
  e.classList.remove("visible"), clearTimeout(closeConfirm._t), closeConfirm._t = setTimeout(() => e.classList.remove("open"), 220)
}

function openSeries(e) {
  if (!db[e]) return;
  try {
    aiBrain.recordWatchTime()
  } catch (e) {}
  clearTimeout(closeModal._t), activeSeries = e, showAllSeasons = !1, modalOpen = !0; document.body.classList.add('modal-open');
  const t = db[e],
    n = findNextEp(e);
  activeSeason = n ? n.se : 1, document.getElementById("sTitle").textContent = t.name, document.getElementById("sInfo").textContent = `${totalSeasons(e)} ${(c => 1 === c ? "série" : c >= 2 && c <= 4 ? "série" : "sérií")(totalSeasons(e))} · ~${t.totalEps} epizod`;
  document.getElementById("modalHeroImg").src = t._backdrop || t.poster, (function (b, g) { b.textContent = g.slice(0, 3).join(" · "), b.style.display = g.length ? "inline-flex" : "none" })(document.getElementById("tmdbBadge"), Array.isArray(t._genres) ? t._genres : []);
  const o = document.getElementById("seriesModal"),
    i = o.querySelector(".modal-body") || o.querySelector("#modalBody");
  i && (i.scrollTop = 0), o.classList.add("open"), requestAnimationFrame(() => requestAnimationFrame(() => {
    o.classList.add("visible");
    const e = o.querySelector(".modal-hero-content");
    e && (e.style.opacity = "0", e.style.transform = "translateY(12px)", setTimeout(() => {
      e.style.transition = "opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.2,0.64,1)", e.style.opacity = "1", e.style.transform = "translateY(0)"
    }, 120))
  })), switchToSeasonView(), renderSeasons(), updatePanelProgress(), updateModalFavBtn(), _sdFill(e, n), _sdLogo(e), kbLayer = "modal-season", kbSeasonIndex = activeSeason - 1, kbEpIndex = -1;
  const a = document.getElementById("modalRateBtn");
  a && (a.style.display = calcProgress(e).seen > 0 ? "flex" : "none")
}

/* Detail seriálu: řádek s metadaty (rok · žánry · série · HD), popis, herci a popisek tlačítka Pokračovat/Přehrát. */
const _sdCache = {};

function _sdPaint(slug, info) {
  if (slug !== activeSeries || !db[slug]) return;
  const t = db[slug], ov = document.getElementById("sOverview"), cast = document.getElementById("sCast"), meta = document.getElementById("sInfo");
  const ns = totalSeasons(slug), pl = ns === 1 ? "série" : ns >= 2 && ns <= 4 ? "série" : "sérií";
  const year = String(info && info.first_air_date || "").slice(0, 4);
  const genres = (Array.isArray(t._genres) && t._genres.length ? t._genres : ((info && info.genres) || []).map(g => g.name)).slice(0, 3);
  const parts = [/^\d{4}$/.test(year) ? year : "", ...genres, `${ns} ${pl}`, "HD"].filter(Boolean);
  meta && (meta.textContent = parts.join(" · "));
  const text = String(info && info.overview || "").trim();
  ov && (ov.textContent = text, ov.hidden = !text);
  const names = ((info && info.cast) || []).slice(0, 4).join(", ");
  cast && (cast.textContent = names ? "Hrají: " + names : "", cast.hidden = !names)
}

function _sdFill(slug, next) {
  const t = db[slug], btn = document.querySelector("#seriesModal .btn-continue");
  if (btn) {
    const seen = calcProgress(slug).seen > 0, lbl = next ? `S${next.se} E${next.ep}` : "";
    const svg = btn.querySelector("svg");
    btn.textContent = "", svg && btn.appendChild(svg), btn.appendChild(document.createTextNode((seen ? "Pokračovat" : "Přehrát") + (lbl ? " · " + lbl : "")))
  }
  _sdPaint(slug, _sdCache[t.tmdbId]);
  if (!t.tmdbId || _sdCache[t.tmdbId] || !(TMDB_KEY || window.MF_USING_TMDB_PROXY || window.MF_PROXY?.enabled)) return;
  const id = t.tmdbId;
  Promise.all([tmdbGet(`/tv/${id}?language=cs-CZ`).catch(() => null), tmdbGet(`/tv/${id}/credits?language=cs-CZ`).catch(() => null)]).then(([d, c]) => {
    const info = Object.assign({}, d || {}, { cast: ((c && c.cast) || []).map(x => x && x.name).filter(Boolean) });
    _sdCache[id] = info, _sdPaint(slug, info)
  })
}

/* Logo titulu z TMDB (/images) – hezký nápis místo prostého textu. Vrací URL, nebo "". */
const _logoCache = {};

function mfFetchLogo(kind, id) {
  const k = kind + ":" + id;
  return _logoCache[k] || (_logoCache[k] = tmdbGet(`/${kind}/${id}/images?include_image_language=cs,en,null`).then(d => {
    const L = (d && d.logos || []).filter(l => l && l.file_path && !/\.svg$/i.test(l.file_path));
    if (!L.length) return "";
    const rank = l => (l.iso_639_1 === "cs" ? 3 : l.iso_639_1 === "en" ? 2 : 1) * 100 + (l.vote_average || 0);
    L.sort((a, b) => rank(b) - rank(a));
    return "https://image.tmdb.org/t/p/w500" + L[0].file_path
  }).catch(() => (delete _logoCache[k], "")))
}
window.mfFetchLogo = mfFetchLogo;

function _sdLogo(slug) {
  const old = document.getElementById("sLogo");
  old && old.remove();
  const h = document.getElementById("sTitle");
  h && h.classList.remove("sd-has-logo");
  const t = db[slug];
  if (!t || !t.tmdbId || !(TMDB_KEY || window.MF_USING_TMDB_PROXY || window.MF_PROXY?.enabled)) return;
  mfFetchLogo("tv", t.tmdbId).then(u => {
    if (!u || slug !== activeSeries || document.getElementById("sLogo")) return;
    const im = new Image;
    im.id = "sLogo", im.className = "sd-logo", im.alt = t.name || "", im.onload = () => {
      if (slug !== activeSeries || document.getElementById("sLogo")) return;
      h.parentNode.insertBefore(im, h), h.classList.add("sd-has-logo")
    }, im.src = u
  })
}

function _sdHideSimilar() {
  const b = document.getElementById("sdSimilar"), btn = document.getElementById("sdSimilarBtn");
  b && (b.hidden = !0), btn && btn.classList.remove("on")
}

function _sdMoreEpisodes() {
  activeSeries && db[activeSeries] && (showAllSeasons = !1, renderSeasons(), switchToEpisodesView())
}

async function _sdToggleSimilar() {
  const box = document.getElementById("sdSimilar"), btn = document.getElementById("sdSimilarBtn"), t = db[activeSeries];
  if (!box || !t) return;
  if (!box.hidden) return switchToSeasonView();
  document.getElementById("seriesModal").classList.remove("sd-detail");
  document.getElementById("seasonSelectView").style.display = "none", document.getElementById("seasonSelectView").classList.remove("active"), document.getElementById("episodesView").style.display = "none";
  box.hidden = !1, btn && btn.classList.add("on"), box.textContent = "Načítám podobné…";
  let list = [];
  try {
    if (t.tmdbId) {
      const d = await tmdbGet(`/tv/${t.tmdbId}/similar?language=cs-CZ`);
      list = ((d && d.results) || []).filter(x => x && x.id && x.poster_path).slice(0, 18)
    }
  } catch (e) {}
  if (box.hidden) return;
  if (!list.length) return void(box.textContent = "Podobné seriály se nepodařilo najít.");
  box.textContent = "";
  const h = document.createElement("div");
  h.className = "sd-sim-title", h.textContent = "Podobné seriály", box.appendChild(h);
  const g = document.createElement("div");
  g.className = "sd-sim-grid", list.forEach(x => {
    const c = document.createElement("button");
    c.type = "button", c.className = "sd-sim-card", c.setAttribute("aria-label", x.name || "");
    const im = document.createElement("img");
    im.src = "https://image.tmdb.org/t/p/w342" + x.poster_path, im.alt = "", im.loading = "lazy", c.appendChild(im);
    const n = document.createElement("span");
    n.textContent = x.name || "", c.appendChild(n), c.onclick = () => {
      try { closeModal() } catch (e) {}
      setTimeout(() => { "function" == typeof openDiscoverTv && openDiscoverTv(x.id, x.name) }, 250)
    }, g.appendChild(c)
  }), box.appendChild(g)
}

function closeModal() {
  const e = document.getElementById("seriesModal");
  e.classList.remove("visible");
  const t = e.querySelector(".modal-hero-content");
  t && (t.style.transition = "", t.style.opacity = "", t.style.transform = ""), clearTimeout(closeModal._t), closeModal._t = setTimeout(() => e.classList.remove("open"), 380), kbLayer = "menu", kbEpIndex = -1, kbSeasonIndex = -1, modalOpen = !1; document.body.classList.remove('modal-open');
}

function renderSeasons() {
  const t = totalSeasons(activeSeries);
  const sel = document.getElementById("epSeasonSelect");
  if (sel) {
    if (sel.options.length !== t) sel.innerHTML = Array.from({ length: t }, (_, k) => `<option value="${k + 1}">Sezóna ${k + 1}</option>`).join("");
    sel.value = String(activeSeason), sel.disabled = showAllSeasons
  }
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
  /* Mřížka sérií se nestaví znovu při každém přepnutí série/šipce – jen se přepne zvýraznění (dřív se při tom znovu načítaly plakáty a dotazy na TMDB, což sekalo). */
  const _key = activeSeries + "|" + n;
  if (e.dataset.sd === _key && e.children.length === n) {
    Array.prototype.forEach.call(e.children, (c, k) => c.classList.toggle("ssv-active", k + 1 === activeSeason));
    return
  }
  e.dataset.sd = _key, e.innerHTML = "";
  for (let o = 1; o <= n; o++) {
    const n = o === activeSeason,
      i = document.createElement("div");
    i.className = "ssv-card" + (n ? " ssv-active" : ""), i.setAttribute("role", "button"), i.tabIndex = 0, i.setAttribute("aria-label", `Série ${o}`);
    const a = t._poster || t.poster || "",
      s = Object.values(t).filter(e => e && "object" == typeof e && e.se === o).length,
      r = s ? `${s} ${mfPlural(s, "epizoda", "epizody", "epizod")}` : "";
    i.innerHTML = `\n          <img src="${a}" alt="S${o}" loading="lazy"\n            onerror="this.src='';this.parentElement.style.background='#1a1a2a'">\n          <div class="ssv-active-badge">\n            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>\n          </div>\n          <div class="ssv-play-overlay">\n            <button class="ssv-play-btn" tabindex="-1" aria-hidden="true">\n              <svg viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"/></svg>\n            </button>\n          </div>\n          <div class="ssv-info">\n            <div class="ssv-num">Série ${o}</div>\n            <div class="ssv-name">${escapeHTML(t.title||"")}</div>\n            ${r?`<div class="ssv-ep-count">${r}</div>`:""}\n          </div>\n        `, i.addEventListener("click", () => {
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
          t && (t.textContent = `${e.episodes.length} ${mfPlural(e.episodes.length, "epizoda", "epizody", "epizod")}`)
        }
      } catch (e) {}
    })(), e.appendChild(i)
  }
}

function selectSeasonFromDropdown(v) {
  const n = parseInt(v, 10);
  if (!n || !activeSeries) return;
  activeSeason = n, showAllSeasons = !1, renderSeasons(), renderEpisodes()
}

function switchToSeasonView() {
  _sdHideSimilar(), document.getElementById("seriesModal").classList.add("sd-detail");
  document.getElementById("seasonSelectView").style.display = "", document.getElementById("seasonSelectView").classList.add("active"), document.getElementById("episodesView").style.display = "none";
  const e = document.getElementById("modalBody");
  e && e.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

function switchToEpisodesView() {
  _sdHideSimilar(), document.getElementById("seriesModal").classList.remove("sd-detail");
  document.getElementById("seasonSelectView").style.display = "none", document.getElementById("seasonSelectView").classList.remove("active");
  document.getElementById("episodesView").style.display = "flex";
  const e = document.getElementById("epViewTitle");
  e && activeSeries && db[activeSeries] && (e.textContent = db[activeSeries].title || ""), renderEpisodes();
  const t = document.getElementById("modalBody");
  t && (t.scrollTop = 0) /* hned, ne plynule: animace přes dlouhý seznam dílů sekala */
}

function toggleShowAll() {
  showAllSeasons = !showAllSeasons, renderSeasons(), renderEpisodes()
}

/* „Pokračovat“ rovnou pustí další nezhlédnutou epizodu (dřív jen odrolovalo na seznam dílů). */
function jumpToNext() {
  const n = findNextEp(activeSeries);
  if (!n) return;
  const r = activeSeries, l = db[r], _r = (r.startsWith("__dtv_") && l?._svetSlug) ? l._svetSlug : r,
    url = `https://svetserialu.to/serial/${_r}/s${String(n.se).padStart(2,"0")}e${String(n.ep).padStart(2,"0")}`;
  playWithConfirm(n.uid, n.se, n.ep, url)
}

function mfPlayNextOf(slug) {
  if (!db[slug]) return !1;
  activeSeries = slug;
  return jumpToNext(), !0
}
window.mfPlayNextOf = mfPlayNextOf;
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
      const frag = document.createDocumentFragment();
      if (t.innerHTML = "", showAllSeasons) {
        const i = totalSeasons(activeSeries);
        for (let s = 1; s <= i; s++) {
          const i = document.createElement("div");
          i.style.cssText = "grid-column:1/-1;font-family:-apple-system, SF Pro Display, Helvetica Neue,sans-serif;font-size:0.84rem;font-weight:700;color:var(--muted);padding:16px 20px 8px;border-bottom:1px solid var(--border);margin-bottom:0;", i.textContent = `Serie ${s}`, frag.appendChild(i);
          const r = e && e[s] || null,
            l = epsInSeason(activeSeries, s);
          for (let e = 1; e <= l; e++) {
            const i = `${activeSeries}-S${s}-E${e}`,
              l = r ? r.find(t => t.ep === e) : null;
            frag.appendChild(buildEpCard(i, s, e, l, !!o[i], i === a, n.poster))
          }
        }
      } else {
        const i = e && e[activeSeason] || null,
          s = epsInSeason(activeSeries, activeSeason);
        if (0 === s) return void(t.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);font-size:0.76rem;padding:16px;opacity:0.5">Žádné epizody</div>');
        for (let e = 1; e <= s; e++) {
          const s = `${activeSeries}-S${activeSeason}-E${e}`,
            r = i ? i.find(t => t.ep === e) : null;
          frag.appendChild(buildEpCard(s, activeSeason, e, r, !!o[s], s === a, n.poster))
        }
      }
      t.appendChild(frag);
      kbEpIndex >= 0 && setKbEpFocus(kbEpIndex)
    }
    const _reqSeries = activeSeries, _reqSeason = activeSeason;
    const s = tmdbCache[`${activeSeries}-S${activeSeason}`];
    if (void 0 !== s) e(null !== s ? {
      [activeSeason]: s
    } : null);
    else {
      e(null);
      try {
        const r = await Promise.race([fetchTmdbSeason(activeSeries, activeSeason), new Promise(e => setTimeout(() => e(null), 4e3))]);
        r && _reqSeries === activeSeries && _reqSeason === activeSeason && document.getElementById(`card-${activeSeries}-S${activeSeason}-E1`) && e({
          [activeSeason]: r
        })
      } catch {}
    }
  } catch (l) {
    console.error("renderEpisodes error:", l);
    const c = document.getElementById("episodesGrid");
    c && (c.innerHTML = '<div style="color:#ff6060;font-size:0.72rem;padding:16px;grid-column:1/-1">⚠ Chyba při načítání epizod: ' + escapeHTML(l.message) + "</div>")
  }
}

function _buildEpCardBase(e, t, n, o, i, a, s) {
  const r = activeSeries || "",
    l = db[activeSeries],
    _r = (r.startsWith('__dtv_') && l?._svetSlug) ? l._svetSlug : r,
    c = _r ? `https://svetserialu.to/serial/${_r}/s${String(t).padStart(2,"0")}e${String(n).padStart(2,"0")}` : `https://svetserialu.to/?s=${encodeURIComponent(l&&l.name||"")}`,
    d = escapeHTML(o && o.name ? o.name : `Epizoda ${n}`),
    m = o && o.overview ? escapeHTML(o.overview) : "",
    u = o && o.runtime ? `${o.runtime} min` : "",
    p = o && o.rating ? o.rating.toFixed(1) : "",
    g = escapeHTML(o && o.still ? o.still : s),
    f = !1,
    y = document.createElement("div");
  return y.className = "episode-card" + (i ? " watched" : "") + (a ? " next-ep" : "") + (f ? " spoiler-blur" : ""), y.id = `card-${e}`, y.dataset.n = n, y.innerHTML = `\n        <div class="ep-thumb">\n          <img src="${g}" alt="" loading="lazy">\n          ${a?'<div class="ep-next-tag">Další</div>':""}\n          <div class="ep-seen-dot">✓</div>\n          ${f?'<div class="spoiler-label" aria-label="Náhled je skrytý, aby ti nic neprozradil"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a12 12 0 0 1-2.6 3.3"/><path d="M6.3 7.6C4.5 9 3.3 10.8 2.5 12c1 2 4.5 6 9.5 6 1.3 0 2.5-.3 3.6-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg><span>Skryto</span></div>':""}\n          <div class="ep-hover-play">\n            <div class="ep-play-ring">\n              <svg viewBox="0 0 10 12"><polygon points="0,0 10,6 0,12"/></svg>\n            </div>\n          </div>\n        </div>\n        <div class="ep-body">\n          <div class="ep-meta-row">\n            <span class="ep-num">S${t} · E${n}</span>\n            ${u?`<span class="ep-runtime">${u}</span>`:""}\n            ${p?`<span class="ep-rating">★ ${p}</span>`:""}\n          </div>\n          <div class="ep-title">${d}</div>\n          ${m?`<div class="ep-desc">${m}</div>`:""}\n          <div class="ep-actions">\n            <button class="ep-btn-play-hbo">\n              <svg viewBox="0 0 10 12" width="10" height="12"><polygon points="0,0 10,6 0,12" fill="currentColor"/></svg>\n                Otevřít epizodu\n            </button>\n            <button class="ep-btn-mark" title="${i?"Označit jako neshlédnuté":"Označit jako shlédnuté"}">${i?"✓":"○"}</button>\n          </div>\n        </div>`, y.querySelector(".ep-btn-play-hbo").addEventListener("click", o => {
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

/* Seriál z Objevovat se po zavření okna z db maže. Jakmile u něj ale něco zhlédneš, uloží se jeho (lehký) záznam, aby šlo
   pokračovat ve sledování i po restartu. Načítá se zpět přes mf_db_custom. */
function persistSeriesRecord(slug) {
  try {
    const rec = db[slug];
    if (!rec || !String(slug).startsWith("__dtv_")) return;
    const light = {};
    Object.keys(rec).forEach(k => { /-S\d+-E\d+$/.test(k) || (light[k] = rec[k]) });
    light._isDiscover = !1, light._persisted = !0, rec._isDiscover = !1;
    const saved = JSON.parse(localStorage.getItem("mf_db_custom") || "{}");
    saved[slug] = light, localStorage.setItem("mf_db_custom", JSON.stringify(saved))
  } catch {}
}

function markWatched(e) {
  // znovu otevřená už zhlédnutá epizoda nesmí donekonečna zvyšovat preference AI
  const _already = !!getWatched()[e];
  try {
    if (_already) throw 0;
    const t = e.replace(/-S\d+-E\d+$/, "");
    db[t] && db[t]._genres && aiBrain.recordWatch(t, db[t]._genres), db[t] && db[t]._genreIds && (aiBrain.boostGenreIds(db[t]._genreIds, .07), recordWatchToTimeline(t, db[t]._genreIds)), aiBrain.recordWatchTime()
  } catch (e) {}
  const t = getWatched();
  t[e] = !0, saveWatched(t), persistSeriesRecord(e.replace(/-S\d+-E\d+$/, ""));
  const n = document.getElementById(`card-${e}`);
  if (n) {
    n.classList.add("watched"), n.classList.remove("spoiler-blur");
    const e = n.querySelector(".ep-btn-mark");
    e && (e.textContent = "✓")
  }
  updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateLogoProgress(), !_already && aiBrain && db[activeSeries] && db[activeSeries]._genres && aiBrain.boostGenresFromTmdb(db[activeSeries]._genres)
}
document.getElementById("seriesModal").addEventListener("click", e => {
  e.target === document.getElementById("seriesModal") && closeModal()
});

/* Hlavička seriálu se při scrollování seznamu zmenší, aby nezabírala půl obrazovky. */
(function() {
  const body = document.getElementById("modalBody"), modal = document.getElementById("seriesModal");
  if (!body || !modal) return;
  let ticking = !1;
  body.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = !0, requestAnimationFrame(() => {
      ticking = !1;
      const y = body.scrollTop, room = body.scrollHeight - body.clientHeight, on = modal.classList.contains("nf-compact");
      !on && y > 60 && room > 240 ? modal.classList.add("nf-compact") : on && y < 5 && modal.classList.remove("nf-compact")
    })
  }, { passive: !0 });
  new MutationObserver(() => { !modal.classList.contains("open") && modal.classList.contains("nf-compact") && modal.classList.remove("nf-compact") }).observe(modal, { attributes: !0, attributeFilter: ["class"] })
})();

function toggleWatch(e) {
  const t = getWatched(),
    n = !!t[e];
  if (n ? delete t[e] : t[e] = !0, saveWatched(t), n || persistSeriesRecord(e.replace(/-S\d+-E\d+$/, "")), renderEpisodes(), updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateLogoProgress(), !n && "function" == typeof openEpRating) {
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
