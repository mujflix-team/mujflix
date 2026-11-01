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
  { const g = document.getElementById('episodesGrid'); g && delete g.dataset.enterKey }
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
  })), _sdTab("eps"), renderSeasons(), updatePanelProgress(), updateModalFavBtn(), _sdFill(e, n), _sdLogo(e), kbLayer = "modal-season", kbSeasonIndex = activeSeason - 1, kbEpIndex = -1;
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
  cast && (cast.textContent = "", cast.hidden = !0), _sdPaintInfo(info, ns)
}

/* Trailer z TMDB /videos: YouTube, nejdřív český, pak anglický; Trailer před Teaserem, oficiální dřív. */
function _sdPickTrailer(v) {
  const L = ((v && v.results) || []).filter(x => x && x.site === "YouTube" && x.key && /^(Trailer|Teaser)$/.test(x.type || ""));
  if (!L.length) return "";
  const rank = x => (x.type === "Trailer" ? 100 : 0) + (x.iso_639_1 === "cs" ? 20 : x.iso_639_1 === "en" ? 10 : 0) + (x.official ? 5 : 0);
  L.sort((a, b) => rank(b) - rank(a));
  return L[0].key
}

const _sdStatus = { "Returning Series": "Vysílá se", "In Production": "Ve výrobě", "Planned": "Připravuje se", "Ended": "Ukončený", "Canceled": "Zrušený", "Pilot": "Pilot" };

/* Panel Popis: tabulka faktů, trailer (iframe až po klepnutí) a herci s fotkami. */
function _sdPaintInfo(info, ns) {
  const facts = document.getElementById("sdFacts"), castWrap = document.getElementById("sdCastWrap"), castRow = document.getElementById("sdCastRow"), trWrap = document.getElementById("sdTrailerWrap");
  if (!facts) return;
  const rows = [];
  const year = String(info && info.first_air_date || "").slice(0, 4), end = String(info && info.last_air_date || "").slice(0, 4);
  if (/^\d{4}$/.test(year)) rows.push(["Vysílání", info.status === "Ended" && /^\d{4}$/.test(end) && end !== year ? `${year}–${end}` : year + (info.status === "Returning Series" ? "–dosud" : "")]);
  const gen = ((info && info.genres) || []).map(g => g.name).filter(Boolean).join(", ");
  gen && rows.push(["Žánry", gen]);
  const eps = info && info.number_of_episodes;
  rows.push(["Rozsah", `${ns} ${ns === 1 ? "série" : ns >= 2 && ns <= 4 ? "série" : "sérií"}` + (eps ? ` · ${eps} epizod` : "")]);
  info && _sdStatus[info.status] && rows.push(["Stav", _sdStatus[info.status]]);
  const net = info && info.networks && info.networks[0] && info.networks[0].name;
  net && rows.push(["Stanice", net]);
  info && info.vote_average > 0 && info.vote_count > 5 && rows.push(["Hodnocení", `★ ${info.vote_average.toFixed(1)} / 10`]);
  facts.textContent = "", rows.forEach(([k, v]) => {
    const dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = k, dd.textContent = v, facts.appendChild(dt), facts.appendChild(dd)
  }), facts.hidden = !rows.length || !info;
  const cf = (info && info.castFull) || [];
  castRow.textContent = "", cf.forEach(c => {
    const el = document.createElement(c.id ? "button" : "div");
    el.className = "sd-actor", c.id && (el.type = "button", el.setAttribute("aria-label", c.name + ": filmografie"), el.addEventListener("click", () => _sdOpenActor(c)));
    const ph = document.createElement("div");
    ph.className = "sd-actor-photo";
    if (c.photo) { const im = new Image; im.src = c.photo, im.alt = "", im.loading = "lazy", im.addEventListener("error", () => { im.remove(), _sdSilhouette(ph) }), ph.appendChild(im) } else _sdSilhouette(ph);
    const n = document.createElement("div"), r = document.createElement("div");
    n.className = "sd-actor-name", n.textContent = c.name, r.className = "sd-actor-role", r.textContent = c.role, el.append(ph, n, r), castRow.appendChild(el)
  }), castWrap.hidden = !cf.length, _sdArrows(castRow);
  _sdResetTrailer(info && info.trailer || ""), trWrap.hidden = !(info && info.trailer);
  const e = document.getElementById("sdInfoEmpty"), o = document.getElementById("sOverview");
  e && (e.hidden = !!((o && !o.hidden) || !facts.hidden || cf.length || (info && info.trailer)))
}

/* Klepnutí na herce: jeho seriály a filmy (TMDB combined_credits) přímo v záložce Popis. Zpět vrací na popis. */
const _sdPeople = {};

function _sdCloseActor(silent) {
  const v = document.getElementById("sdActorView");
  if (!v) return;
  v.hidden = !0, v.textContent = "", delete v.dataset.pid;
  if (!silent) {
    const inf = document.getElementById("sdInfo");
    inf && (inf.hidden = !1)
  }
}

function _sdActorTitles(d) {
  const seen = {}, out = [];
  ((d && d.cast) || []).forEach(c => {
    if (!c || !c.id || !c.poster_path || !/^(tv|movie)$/.test(c.media_type)) return;
    const g = c.genre_ids || [];
    if (g.indexOf(10767) > -1 || g.indexOf(10763) > -1) return;
    if (/\b(self|himself|herself|themselves)\b/i.test(c.character || "")) return;
    if (c.media_type === "tv" && (c.episode_count || 0) < 2) return;
    const k = c.media_type + c.id;
    if (seen[k]) return;
    seen[k] = 1, out.push({ id: c.id, type: c.media_type, title: c.title || c.name || "", poster: "https://image.tmdb.org/t/p/w342" + c.poster_path, year: String(c.release_date || c.first_air_date || "").slice(0, 4), pop: (c.popularity || 0) + Math.min(c.vote_count || 0, 4000) / 400 })
  });
  return out.sort((a, b) => b.pop - a.pop).slice(0, 40)
}

/* Herec bez fotky: anonymní silueta místo prvního písmena */
function _sdSilhouette(ph) {
  ph.classList.add("sd-actor-nophoto"), ph.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 100 150" aria-hidden="true"><circle cx="50" cy="52" r="22"/><path d="M8 150c0-34 18-54 42-54s42 20 42 54z"/></svg>')
}

/* Plakát v kartě „Podobné“ v rámečku, který během načítání ukazuje shimmer */
function _sdPoster(im) {
  const w = document.createElement("span");
  return w.className = "sd-sim-poster", w.appendChild(im), w
}

/* Šipky jako na úvodní stránce (.nf-arrow) pro vodorovnou řadu v detailu; posuvník je schovaný */
function _sdArrows(row) {
  const host = row && row.parentElement;
  if (!host) return;
  if (!host._sdArr) {
    host._sdArr = true;
    const svg = left => '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (left ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6") + '"/></svg>';
    const mk = left => {
      const b = document.createElement("button");
      b.type = "button", b.className = "nf-arrow " + (left ? "nf-arrow-l" : "nf-arrow-r"), b.hidden = true;
      b.setAttribute("aria-label", left ? "Posunout doleva" : "Posunout doprava"), b.innerHTML = svg(left);
      b.addEventListener("click", () => row.scrollBy({ left: (left ? -1 : 1) * row.clientWidth * 0.85, behavior: "smooth" }));
      host.appendChild(b); return b;
    };
    host._l = mk(true), host._r = mk(false);
    const upd = () => { const m = row.scrollWidth - row.clientWidth; host._l.hidden = row.scrollLeft < 4; host._r.hidden = row.scrollLeft > m - 4; };
    row.addEventListener("scroll", upd, { passive: true }), window.addEventListener("resize", upd), host._upd = upd;
  }
  setTimeout(host._upd, 50), setTimeout(host._upd, 600);
}

async function _sdOpenActor(c) {
  const v = document.getElementById("sdActorView"), inf = document.getElementById("sdInfo");
  if (!v || !c || !c.id) return;
  inf && (inf.hidden = !0), v.hidden = !1, v.dataset.pid = String(c.id), v.textContent = "";
  const top = document.createElement("div");
  top.className = "sd-actor-top";
  const back = document.createElement("button");
  back.type = "button", back.className = "sd-actor-back", back.textContent = "‹ Zpět na popis", back.addEventListener("click", () => _sdCloseActor());
  const h = document.createElement("h3");
  h.className = "sd-actor-title", h.textContent = c.name;
  const sub = document.createElement("div");
  sub.className = "sd-actor-sub", sub.textContent = "Načítám…", top.append(back, h, sub), v.appendChild(top);
  let d = _sdPeople[c.id];
  if (!d) try { d = await tmdbGet(`/person/${c.id}/combined_credits?language=cs-CZ`) } catch (e) { d = null }
  if (v.hidden || v.dataset.pid !== String(c.id)) return;
  d && (_sdPeople[c.id] = d);
  let list = _sdActorTitles(d);
  try {
    if (window.MFAge && window.MFAge.limit() && list.length) list = (await window.MFAge.filter(list.map(x => ({ tmdbId: x.id, mediaType: x.type, x })))).map(o => o.x)
  } catch (e) {}
  if (v.hidden || v.dataset.pid !== String(c.id)) return;
  if (!list.length) return void(sub.textContent = d ? "Nic dalšího se nenašlo." : "Filmografii se nepodařilo načíst.");
  sub.textContent = `${list.length} ${mfPlural(list.length, "titul", "tituly", "titulů")}, nejznámější první`;
  const bar = document.createElement("div");
  bar.className = "sd-actor-filter";
  const grid = document.createElement("div");
  grid.className = "sd-actor-grid";
  const draw = f => {
    Array.prototype.forEach.call(bar.children, b => b.classList.toggle("active", b.dataset.f === f)), grid.textContent = "";
    list.filter(x => f === "all" || x.type === f).forEach(x => {
      const b = document.createElement("button");
      b.type = "button", b.className = "sd-sim-card", b.setAttribute("aria-label", x.title);
      const im = new Image;
      im.src = x.poster, im.alt = "", im.loading = "lazy";
      const n = document.createElement("span");
      n.textContent = x.title + (x.year ? " (" + x.year + ")" : ""), b.append(_sdPoster(im), n), b.addEventListener("click", () => {
        try { closeModal() } catch (e) {}
        setTimeout(() => { x.type === "tv" ? "function" == typeof openDiscoverTv && openDiscoverTv(x.id, x.title) : "function" == typeof mfhOpenCard && mfhOpenCard(x.title, x.id, "movie") }, 250)
      }), grid.appendChild(b)
    })
  };
  [["all", "Vše"], ["tv", "Seriály"], ["movie", "Filmy"]].forEach(([f, t]) => {
    if (f !== "all" && !list.some(x => x.type === f)) return;
    const b = document.createElement("button");
    b.type = "button", b.className = "sd-tab", b.dataset.f = f, b.textContent = t, b.addEventListener("click", () => draw(f)), bar.appendChild(b)
  }), v.append(bar, grid), draw("all")
}

/* Trailer: nejdřív jen náhled s tlačítkem Přehrát; iframe se vytvoří až po klepnutí a zavře se po opuštění záložky. */
function _sdResetTrailer(key) {
  const box = document.getElementById("sdTrailer");
  if (!box) return;
  const k = key === void 0 ? box.dataset.k || "" : key;
  box.textContent = "", box.dataset.k = k;
  if (!k) return;
  const b = document.createElement("button");
  b.type = "button", b.className = "sd-trailer-btn", b.setAttribute("aria-label", "Přehrát trailer");
  const im = new Image;
  im.src = `https://i.ytimg.com/vi/${encodeURIComponent(k)}/hqdefault.jpg`, im.alt = "", im.loading = "lazy";
  const pl = document.createElement("span");
  pl.className = "sd-trailer-play", pl.innerHTML = '<svg viewBox="0 0 10 12" aria-hidden="true"><polygon points="0,0 10,6 0,12"/></svg>';
  b.append(im, pl), b.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(k)}?autoplay=1&rel=0&playsinline=1&modestbranding=1`, f.title = "Trailer", f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen", f.allowFullscreen = !0, f.referrerPolicy = "strict-origin-when-cross-origin", box.textContent = "", box.appendChild(f)
  }), box.appendChild(b)
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
  Promise.all([tmdbGet(`/tv/${id}?language=cs-CZ`).catch(() => null), tmdbGet(`/tv/${id}/credits?language=cs-CZ`).catch(() => null), tmdbGet(`/tv/${id}/videos?language=cs-CZ&include_video_language=cs,en,null`).catch(() => null)]).then(([d, c, v]) => {
    const castFull = ((c && c.cast) || []).filter(x => x && x.name).slice(0, 14).map(x => ({ id: x.id, name: x.name, role: x.character || "", photo: x.profile_path ? "https://image.tmdb.org/t/p/w185" + x.profile_path : "" }));
    const info = Object.assign({}, d || {}, { cast: ((c && c.cast) || []).map(x => x && x.name).filter(Boolean), castFull, trailer: _sdPickTrailer(v) });
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
  const b = document.getElementById("sdSimilar");
  b && (b.hidden = !0)
}

/* Záložky detailu: Epizody (sezóny + díly na jedné obrazovce) a Podobné. */
function _sdTab(name) {
  const sim = name === "sim", info = name === "info", eps = document.getElementById("episodesView"), box = document.getElementById("sdSimilar"), inf = document.getElementById("sdInfo");
  document.getElementById("seriesModal").classList.remove("sd-detail");
  [["sdTabEps", !sim && !info], ["sdTabSim", sim], ["sdTabInfo", info]].forEach(([id, on]) => {
    const b = document.getElementById(id);
    b && (b.classList.toggle("active", on), b.setAttribute("aria-selected", on ? "true" : "false"))
  });
  const head = document.getElementById("sdHead");
  head && head.classList.toggle("sd-head-plain", sim || info);
  const tools = document.getElementById("sdTools");
  tools && (tools.hidden = sim || info);
  inf && (inf.hidden = !info);
  _sdCloseActor(!0);
  if (info) {
    _sdHideSimilar(), eps && (eps.style.display = "none");
    const e = document.getElementById("sdInfoEmpty"), o = document.getElementById("sOverview");
    e && (e.hidden = !!((o && !o.hidden) || !document.getElementById("sdFacts").hidden || !document.getElementById("sdCastWrap").hidden || !document.getElementById("sdTrailerWrap").hidden));
    return
  }
  _sdResetTrailer();
  if (!sim) {
    _sdHideSimilar(), eps && (eps.style.display = "flex"), renderEpisodes();
    return
  }
  eps && (eps.style.display = "none"), box && (box.hidden = !1), _sdLoadSimilar()
}

async function _sdLoadSimilar() {
  const box = document.getElementById("sdSimilar"), t = db[activeSeries];
  if (!box || !t) return;
  if (box.dataset.for === activeSeries && box.querySelector(".sd-sim-grid")) return;
  box.dataset.for = activeSeries, box.textContent = "Načítám podobné…";
  let list = [];
  try {
    if (t.tmdbId) {
      /* Doporučení TMDB (podle chování diváků) + podobné (žánry a klíčová slova), dvě stránky z každého. Pořadí: shoda v obou
         seznamech, shoda žánrů s tímto seriálem a hodnocení; bez titulů s téměř žádnými hlasy. */
      const id = t.tmdbId, get = p => tmdbGet(p).catch(() => null),
        r = await Promise.all([`/tv/${id}/recommendations?language=cs-CZ`, `/tv/${id}/recommendations?language=cs-CZ&page=2`, `/tv/${id}/similar?language=cs-CZ`, `/tv/${id}/similar?language=cs-CZ&page=2`].map(get).concat(t._genreIds ? [null] : [get(`/tv/${id}?language=cs-CZ`)])),
        mine = new Set((t._genreIds || ((r[4] && r[4].genres) || []).map(g => g.id)).map(Number)), byId = {};
      [[r[0], 3], [r[1], 2], [r[2], 2], [r[3], 1]].forEach(([d, w]) => ((d && d.results) || []).forEach(x => {
        if (!x || !x.id || !x.poster_path || String(x.id) === String(id)) return;
        (byId[x.id] || (byId[x.id] = { x, s: 0 })).s += w
      }));
      const all = Object.values(byId), good = all.filter(e => (e.x.vote_count || 0) >= 30);
      list = (good.length >= 6 ? good : all).map(e => {
        const g = e.x.genre_ids || [], overlap = mine.size ? g.filter(i => mine.has(i)).length / Math.max(mine.size, g.length || 1) : 0;
        return { x: e.x, sc: e.s + overlap * 4 + (e.x.vote_average || 0) / 5 }
      }).sort((a, b) => b.sc - a.sc).map(e => e.x).slice(0, 30)
    }
  } catch (e) {}
  try {
    if (window.MFAge && window.MFAge.limit() && list.length) list = (await window.MFAge.filter(list.map(x => ({ tmdbId: x.id, mediaType: "tv", x })))).map(o => o.x)
  } catch (e) {}
  if (box.hidden || box.dataset.for !== activeSeries) return;
  if (!list.length) return void(box.textContent = "Podobné seriály se nepodařilo najít.");
  box.textContent = "";
  const h = document.createElement("div");
  h.className = "sd-sim-title", h.textContent = "Podobné seriály", box.appendChild(h);
  const g = document.createElement("div");
  g.className = "sd-sim-grid", list.forEach(x => {
    const c = document.createElement("button");
    c.type = "button", c.className = "sd-sim-card", c.setAttribute("aria-label", x.name || "");
    const im = document.createElement("img");
    im.src = "https://image.tmdb.org/t/p/w342" + x.poster_path, im.alt = "", im.loading = "lazy", c.appendChild(_sdPoster(im));
    const n = document.createElement("span");
    n.textContent = x.name || "", c.appendChild(n), c.onclick = () => {
      try { closeModal() } catch (e) {}
      setTimeout(() => { "function" == typeof openDiscoverTv && openDiscoverTv(x.id, x.name) }, 250)
    }, g.appendChild(c)
  }), box.appendChild(g)
}

function closeModal() {
  const e = document.getElementById("seriesModal");
  _sdResetTrailer();
  e.classList.remove("visible");
  const t = e.querySelector(".modal-hero-content");
  t && (t.style.transition = "", t.style.opacity = "", t.style.transform = ""), clearTimeout(closeModal._t), closeModal._t = setTimeout(() => e.classList.remove("open"), 380), kbLayer = "menu", kbEpIndex = -1, kbSeasonIndex = -1, modalOpen = !1; document.body.classList.remove('modal-open');
}

function renderSeasons() {
  const t = totalSeasons(activeSeries);
  const o = document.getElementById("seasonAllBtn");
  o && (o.className = "season-all-btn" + (showAllSeasons ? " active" : ""), o.textContent = showAllSeasons ? "← Jedna sezóna" : "☰ Všechny epizody", o.hidden = t < 2);
  const i = document.getElementById("epViewSeasonText");
  i && (i.textContent = showAllSeasons ? "Všechny sezóny" : `Sezóna ${activeSeason}`), renderSeasonStrip(t)
}

/* Řádek sezón: tlačítka S1, S2 … posuvná do stran, jedno klepnutí přepne epizody. Zcela zhlédnutá sezóna má fajfku. */
function renderSeasonStrip(t) {
  const box = document.getElementById("sdSeasons");
  if (!box) return;
  if (t < 2) return void(box.hidden = !0, box.textContent = "");
  box.hidden = !1;
  const w = getWatched();
  const done = n => { const c = epsInSeason(activeSeries, n); if (!c) return !1; for (let e = 1; e <= c; e++) if (!w[`${activeSeries}-S${n}-E${e}`]) return !1; return !0 };
  const key = activeSeries + "|" + t;
  if (box.dataset.k !== key || box.children.length !== t) {
    box.dataset.k = key, box.textContent = "";
    for (let n = 1; n <= t; n++) {
      const b = document.createElement("button");
      b.type = "button", b.className = "sd-season", b.dataset.s = String(n), b.setAttribute("role", "tab"), b.setAttribute("aria-label", `Sezóna ${n}`), b.textContent = "S" + n;
      b.addEventListener("click", () => selectSeasonFromDropdown(n)), box.appendChild(b)
    }
  }
  Array.prototype.forEach.call(box.children, (b, k) => {
    const n = k + 1, on = !showAllSeasons && n === activeSeason;
    b.classList.toggle("active", on), b.classList.toggle("done", done(n)), b.setAttribute("aria-selected", on ? "true" : "false")
  });
  const cur = box.querySelector(".active");
  cur && (box.scrollLeft = cur.offsetLeft - (box.clientWidth - cur.offsetWidth) / 2), _sdArrows(box)
}

function selectSeasonFromDropdown(v) {
  const n = parseInt(v, 10);
  if (!n || !activeSeries) return;
  activeSeason = n, showAllSeasons = !1, renderSeasons(), renderEpisodes()
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
          i.className = "sd-season-head", i.textContent = `Sezóna ${s}`, frag.appendChild(i);
          const r = e && e[s] || null,
            l = epsInSeason(activeSeries, s);
          for (let e = 1; e <= l; e++) {
            const i = `${activeSeries}-S${s}-E${e}`,
              l = r ? r.find(t => t.ep === e) : null;
            { const c = buildEpCard(i, s, e, l, !!o[i], i === a, n.poster); !l && void 0 === tmdbCache[`${activeSeries}-S${s}`] && c.classList.add("ep-loading"); frag.appendChild(c) }
          }
        }
      } else {
        const i = e && e[activeSeason] || null,
          s = epsInSeason(activeSeries, activeSeason);
        if (0 === s) return void(t.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);font-size:0.76rem;padding:16px;opacity:0.5">Žádné epizody</div>');
        for (let e = 1; e <= s; e++) {
          const s = `${activeSeries}-S${activeSeason}-E${e}`,
            r = i ? i.find(t => t.ep === e) : null;
          { const c = buildEpCard(s, activeSeason, e, r, !!o[s], s === a, n.poster); !r && void 0 === tmdbCache[`${activeSeries}-S${activeSeason}`] && c.classList.add("ep-loading"); frag.appendChild(c) }
        }
      }
      t.appendChild(frag);
      /* karty naskakují postupně zleva doprava po řádcích; jen při prvním vykreslení seznamu, ne při každém dotažení další sezóny */
      const _ek = activeSeries + "|" + (showAllSeasons ? "all" : activeSeason);
      if (t.dataset.enterKey !== _ek) t.dataset.enterKey = _ek, t.classList.add("ep-enter"), clearTimeout(t._et), t._et = setTimeout(() => t.classList.remove("ep-enter"), 1800);
      t.classList.contains("ep-enter") && t.querySelectorAll(".episode-card").forEach((c, i) => c.style.setProperty("--ci", String(Math.min(i, 20))));
      kbEpIndex >= 0 && setKbEpFocus(kbEpIndex)
    }
    const _reqSeries = activeSeries, _reqSeason = activeSeason, _reqAll = showAllSeasons;
    const _still = () => _reqSeries === activeSeries && _reqSeason === activeSeason && _reqAll === showAllSeasons;
    const seasons = _reqAll ? Array.from({ length: totalSeasons(activeSeries) }, (_, k) => k + 1) : [activeSeason];
    const collect = () => { const m = {}; seasons.forEach(x => { const c = tmdbCache[`${activeSeries}-S${x}`]; c && (m[x] = c) }); return m };
    const missing = seasons.filter(x => void 0 === tmdbCache[`${activeSeries}-S${x}`]);
    const have = collect();
    e(Object.keys(have).length ? have : null);
    // chybějící sezóny se dotahují na pozadí; seznam se po každé obnoví, jen pokud je okno pořád na stejném místě
    missing.forEach(x => {
      fetchTmdbSeason(activeSeries, x).then(r => { r && _still() && document.getElementById("episodesGrid") && e(collect()); r || document.querySelectorAll("#episodesGrid .ep-loading").forEach(c => c.classList.remove("ep-loading")) }).catch(() => { document.querySelectorAll("#episodesGrid .ep-loading").forEach(c => c.classList.remove("ep-loading")) })
    })
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
  }), y.addEventListener("click", o => {
    /* Celý řádek epizodu pouští přehrávání (kromě kolečka „zhlédnuto“ a po dlouhém stisku, který otevírá dialog postupu). */
    if (o.target.closest && (o.target.closest(".ep-btn-mark") || o.target.closest(".ep-user-rating"))) return;
    if (y._lp && Date.now() - y._lp < 900) return;
    playWithConfirm(e, t, n, c)
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
  updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateLogoProgress(), activeSeries && db[activeSeries] && renderSeasons(), !_already && aiBrain && db[activeSeries] && db[activeSeries]._genres && aiBrain.boostGenresFromTmdb(db[activeSeries]._genres)
}
document.getElementById("seriesModal").addEventListener("click", e => {
  e.target === document.getElementById("seriesModal") && closeModal()
});

/* Zmenšení hlavičky plynule: výška se animuje z naměřené na cílovou (FLIP), obsah se jemně prolne. */
function _sdCompact(modal, on) {
  const hero = modal.querySelector(".modal-hero");
  if (!hero || window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return void modal.classList.toggle("nf-compact", on);
  const h0 = hero.offsetHeight;
  hero.style.transition = "none", hero.style.height = "", modal.classList.toggle("nf-compact", on);
  const h1 = hero.offsetHeight;
  if (Math.abs(h0 - h1) < 2) return void(hero.style.transition = "");
  hero.style.height = h0 + "px", hero.style.overflow = "hidden", hero.offsetHeight;
  hero.style.transition = "height .4s cubic-bezier(.4,0,.2,1)", hero.style.height = h1 + "px";
  modal.classList.add("sd-morph"), clearTimeout(hero._t);
  hero._t = setTimeout(() => { hero.style.transition = hero.style.height = hero.style.overflow = "", modal.classList.remove("sd-morph") }, 440)
}

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
      !on && y > 60 && room > 240 ? _sdCompact(modal, !0) : on && y < 5 && _sdCompact(modal, !1)
    })
  }, { passive: !0 });
  new MutationObserver(() => { !modal.classList.contains("open") && modal.classList.contains("nf-compact") && modal.classList.remove("nf-compact") }).observe(modal, { attributes: !0, attributeFilter: ["class"] })
})();

function toggleWatch(e) {
  const t = getWatched(),
    n = !!t[e];
  if (n ? delete t[e] : t[e] = !0, saveWatched(t), n || persistSeriesRecord(e.replace(/-S\d+-E\d+$/, "")), renderEpisodes(), renderSeasons(), updatePanelProgress(), updateTileProgress(activeSeries), updateContinueBadge(activeSeries), updateLogoProgress(), !n && "function" == typeof openEpRating) {
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
