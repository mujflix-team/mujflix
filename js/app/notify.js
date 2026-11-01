/* Editor žánrů, nové epizody, novinky, oznámení, PWA. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
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
  const list = document.getElementById("notifPanelList");
  if (!list) return;
  try {
    // sledované seriály: oblíbené z TMDB + seriály s aspoň jednou zhlédnutou epizodou
    const ids = new Map(), watched = getWatched();
    getWatchlist().forEach(w => { if (w && "series" === w.type && w.tmdbId) ids.set(String(w.tmdbId), w.name || "") });
    Object.keys(db).forEach(k => {
      const d = db[k];
      if (d && /^\d+$/.test(String(d.tmdbId || "")) && Object.keys(watched).some(x => x.startsWith(k + "-S"))) ids.set(String(d.tmdbId), d.name || "")
    });
    const rows = [], now = Date.now(), DAY = 864e5;
    await Promise.all([...ids.entries()].slice(0, 15).map(async ([id, name]) => {
      const d = await tmdbGet("/tv/" + id + "?language=cs-CZ");
      if (!d) return;
      [[d.next_episode_to_air, "next"], [d.last_episode_to_air, "last"]].forEach(([ep, kind]) => {
        if (!ep || !ep.air_date) return;
        const diff = (new Date(ep.air_date + "T12:00:00").getTime() - now) / DAY;
        if ("next" === kind && diff > -1 && diff <= 30 || "last" === kind && diff <= 0.5 && diff >= -14) rows.push({
          id, kind, diff, show: d.name || name, se: ep.season_number, ep: ep.episode_number, date: ep.air_date
        })
      })
    }));
    rows.sort((a, b) => a.date.localeCompare(b.date)).reverse();
    const fresh = rows.filter(r => Math.abs(r.diff) <= 7).length;
    const dot = document.getElementById("nfBellDot"), badge = document.getElementById("notifBellBadge");
    dot && dot.classList.toggle("visible", fresh > 0), badge && (badge.textContent = fresh, badge.classList.toggle("visible", fresh > 0));
    if (!list) return;
    const recs = await fetchRecommendedNews().catch(() => []);
    const head = t => `<div style="padding:10px 12px 4px;font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);">${t}</div>`;
    const epHtml = rows.map(r => {
      const when = "last" === r.kind ? "vyšlo " + r.date : "vyjde " + r.date;
      return `<div class="notif-item" data-tv="${escapeHTML(r.id)}" style="padding:10px 12px;cursor:pointer;border-radius:10px;"><div style="font-weight:700;font-size:0.8rem;">${escapeHTML(r.show)}</div><div style="color:var(--muted);font-size:0.7rem;">S${r.se} · E${r.ep} — ${escapeHTML(when)}</div></div>`
    }).join("");
    const recHtml = recs.map(r => `<div class="notif-item notif-rec" data-rec="${escapeHTML(String(r.id))}" data-type="${r.type}" data-title="${escapeHTML(r.title)}" style="display:flex;gap:10px;align-items:center;padding:8px 12px;cursor:pointer;border-radius:10px;">${r.poster ? `<img src="${IMG_S}${escapeHTML(r.poster)}" alt="" loading="lazy" style="width:44px;height:64px;object-fit:cover;border-radius:4px;flex:none;">` : ""}<div style="min-width:0;"><div style="font-weight:700;font-size:0.8rem;">${escapeHTML(r.title)}</div><div style="color:var(--muted);font-size:0.7rem;">${"tv" === r.type ? "Seriál" : "Film"}${r.year ? " · " + escapeHTML(String(r.year)) : ""}${r.rating ? " · ★ " + r.rating : ""}</div></div></div>`).join("");
    if (!rows.length && !recs.length) return void(list.innerHTML = '<div style="color:var(--muted);font-size:0.73rem;padding:12px;text-align:center;">Zatím žádné novinky.</div>');
    list.innerHTML = (recs.length ? head("Nové pro tebe") + recHtml : "") + (rows.length ? head("Tvoje seriály") + epHtml : "");
    list.querySelectorAll(".notif-rec").forEach(el => el.addEventListener("click", () => {
      closeNotifPanel();
      const id = el.dataset.rec, title = el.dataset.title;
      "tv" === el.dataset.type ? "function" == typeof openDiscoverTv && openDiscoverTv(id, title) : "function" == typeof _showCinemaOrFinderChoice && _showCinemaOrFinderChoice(id, title, "movie", title)
    }));
    list.querySelectorAll(".notif-item[data-tv]").forEach(el => el.addEventListener("click", () => {
      closeNotifPanel(), "function" == typeof openDiscoverTv && openDiscoverTv(el.dataset.tv, "")
    }))
  } catch (err) {
    list && (list.innerHTML = '<div style="color:var(--muted);font-size:0.73rem;padding:12px;text-align:center;">Novinky se nepodařilo načíst.</div>')
  }
}

/* Nové filmy a seriály podle žánrů, které si uživatel oblíbil (AI preference) – bez toho, co už viděl nebo má v Oblíbených. */
async function fetchRecommendedNews() {
  const iso = d => d.toISOString().slice(0, 10), today = new Date(), from = new Date(Date.now() - 90 * 864e5);
  const prefs = aiBrain && aiBrain.memory && aiBrain.memory.genreIdPrefs || {};
  const genres = Object.entries(prefs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]).filter(x => /^\d+$/.test(x));
  const seen = new Set(Object.keys(aiBrain && aiBrain.memory && aiBrain.memory.watchedTmdbIds || {}).map(String));
  getWatchlist().forEach(w => { w && w.tmdbId && seen.add(String(w.tmdbId)) });
  const q = async (type, withGenres) => {
    const dateKey = "tv" === type ? "first_air_date" : "primary_release_date";
    const p = `/discover/${type}?language=cs-CZ&sort_by=popularity.desc&vote_count.gte=10&${dateKey}.gte=${iso(from)}&${dateKey}.lte=${iso(today)}` + (withGenres && genres.length ? "&with_genres=" + genres.join("|") : "");
    const d = await tmdbGet(p);
    return ((d && d.results) || []).filter(r => r && r.id && !seen.has(String(r.id)) && !(window.mfIsAnime && window.mfIsAnime(r)) && r.poster_path).map(r => ({
      id: r.id, type, title: r.title || r.name || "", poster: r.poster_path,
      year: String(r.release_date || r.first_air_date || "").slice(0, 4), rating: r.vote_average ? r.vote_average.toFixed(1) : ""
    }));
  };
  const anime = window.mfLikesAnime && window.mfLikesAnime();
  const qa = async type => {
    const dateKey = "tv" === type ? "first_air_date" : "primary_release_date";
    const d = await tmdbGet(`/discover/${type}?language=cs-CZ&sort_by=popularity.desc&vote_count.gte=0&${dateKey}.gte=${iso(new Date(Date.now() - 150 * 864e5))}&${dateKey}.lte=${iso(today)}${window.MF_ANIME_QUERY}`);
    return ((d && d.results) || []).filter(r => r && r.id && !seen.has(String(r.id)) && r.poster_path).map(r => ({
      id: r.id, type, title: r.title || r.name || "", poster: r.poster_path,
      year: String(r.release_date || r.first_air_date || "").slice(0, 4), rating: r.vote_average ? r.vote_average.toFixed(1) : ""
    }));
  };
  let movies = [], shows = [];
  if (window.mfOnlyAnime && window.mfOnlyAnime()) {
    const [am, at] = await Promise.all([qa("movie"), qa("tv")]);
    movies = am, shows = at
  } else [movies, shows] = await Promise.all([q("movie", !0), q("tv", !0)]);
  if (anime && !(window.mfOnlyAnime && window.mfOnlyAnime())) {
    const [am, at] = await Promise.all([qa("movie"), qa("tv")]);
    const ids = new Set([...movies, ...shows].map(r => r.id));
    shows = [...at.filter(r => !ids.has(r.id)).slice(0, 4), ...shows], movies = [...am.filter(r => !ids.has(r.id)).slice(0, 2), ...movies]
  }
  if (movies.length + shows.length < 4 && !(window.mfOnlyAnime && window.mfOnlyAnime())) [movies, shows] = await Promise.all([q("movie", !1), q("tv", !1)]);
  if (window.MFAge && window.MFAge.limit()) [movies, shows] = await Promise.all([window.MFAge.filter(movies), window.MFAge.filter(shows)]);
  const out = [];
  for (let i = 0; out.length < 8 && (i < movies.length || i < shows.length); i++) {
    movies[i] && out.push(movies[i]), out.length < 8 && shows[i] && out.push(shows[i])
  }
  return out
}

function closeNotifPanel() {
  const e = document.getElementById("notifPanel");
  e.classList.remove("visible"), setTimeout(() => e.classList.remove("open"), 220)
}

function _notifOutsideClick(e) {
  const t = document.getElementById("notifPanel"),
    n = document.getElementById("notifBell");
  if (!t || !t.classList.contains("open")) return;
  // listener je jednorázový – při kliknutí dovnitř ho vrať, ať panel jde zavřít i později
  if (t.contains(e.target) || n && n.contains(e.target)) return void document.addEventListener("click", _notifOutsideClick, { once: !0, capture: !0 });
  closeNotifPanel()
}

function buildEpCard(e, t, n, o, i, a, s) {
  const r = _buildEpCardBase(e, t, n, o, i, a, s),
    l = getPartialWatched(),
    c = l[e] || 0;
  if (c > 0 && !i) {
    const e = r.querySelector(".ep-thumb");
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
        r._lp = Date.now(), showEpisodeProgressDialog(e, t, n, l[e] || (i ? 100 : 0))
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
    }), updateLogoProgress(), updateWatchlistBtns(), loadTmdbDbData(), initPWA(), !1) {}
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
    const t = e.target.closest("button, .dock-btn, .ps-tile-wrapper, .ssv-card, .episode-card, .sh-card, .mf-header-btn");
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
});

async function initPWA() {
  if ("serviceWorker" in navigator) try {
    if (!/^https:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    let e = await navigator.serviceWorker.getRegistration("/");
    if (!e) e = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    if (!e) return;
    window._swReg = e
  } catch (e) {
    console.warn("[PWA] SW error:", e)
  }
}

window.mfNotify = function(e, t, n) {
  if ("undefined" == typeof Notification || "granted" !== Notification.permission) return;
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
