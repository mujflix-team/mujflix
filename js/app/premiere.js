/* Kalendář premiér. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
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
  if (!(void 0 !== window.TMDB_KEY ? window.TMDB_KEY : localStorage.getItem("mf_tmdb_key") || "") && !mfTmdbKey()) throw new Error("No TMDB key");
  const e = _premiereMonth,
    t = `${e.getFullYear()}-${e.getMonth()}-${_premiereFilter}`;
  if (_premiereCache[t]) return _premiereCache[t];
  let n = [];
  if ("tracked" === _premiereFilter) {
    const e = (void 0 !== db ? Object.keys(db) : []).filter(e => "__foryou__" !== e && "__search__" !== e && db[e]?.tmdbId);
    n = await Promise.all(e.slice(0, 30).map(async e => {
      try {
        return await tmdbGet(`/tv/${db[e].tmdbId}?language=cs`)
      } catch {
        return null
      }
    })), n = n.filter(Boolean)
  } else {
    const [e, t] = await Promise.all([tmdbGet("/tv/on_the_air?language=cs&page=1"), tmdbGet("/tv/on_the_air?language=cs&page=2")]);
    // Seznamy TMDB (on_the_air) neobsahují next/last_episode_to_air – ty jsou jen v detailu seriálu
    const _seen = new Set, l = [...e?.results || [], ...t?.results || []].filter(e => e && e.id && !_seen.has(e.id) && _seen.add(e.id)).slice(0, 24);
    n = (await Promise.all(l.map(async e => {
      try {
        return await tmdbGet(`/tv/${e.id}?language=cs`)
      } catch {
        return null
      }
    }))).filter(Boolean)
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
  const n = _localDateKey(new Date);
  if (!e.length) return void(t.innerHTML = '<div class="premiere-empty"><div class="premiere-empty-icon">📭</div><p>Žádné premiéry tento měsíc.<br>Zkus filtr "Populární".</p></div>');
  const o = {};
  e.forEach(e => {
    const t = new Date(e.air_date + "T12:00:00"),
      n = e.air_date,
      i = Math.ceil((t.getDate() + (new Date(t.getFullYear(), t.getMonth(), 1).getDay() + 6) % 7) / 7);
    o[i] || (o[i] = {}), o[i][n] || (o[i][n] = []), o[i][n].push(e)
  });
  const i = e.filter(e => {
      const t = new Date(e.air_date + "T12:00:00"),
        n = new Date,
        o = new Date(n.getFullYear(), n.getMonth(), n.getDate());
      // týden začíná v pondělí a od půlnoci (dřív se odpoledne vyřadily dnešní premiéry)
      o.setDate(o.getDate() - (n.getDay() + 6) % 7);
      const i = new Date(o);
      return i.setDate(o.getDate() + 6), i.setHours(23, 59, 59, 999), t >= o && t <= i
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
        s += `<div class="premiere-ep-item${e.isTracked?" is-tracked":""}" onclick="premiereOpenShow(${e.show_id})">\n            <div class="premiere-ep-poster">${t?`<img src="${t}" alt="" loading="lazy">`:""}</div>\n            <div class="premiere-ep-info">\n              <div class="premiere-ep-show">${escapeHTML(e.show_name)}</div>\n              <div class="premiere-ep-detail">S${String(e.season_number).padStart(2,"0")} · E${String(e.episode_number).padStart(2,"0")}</div>\n              <div class="premiere-ep-badge-row">\n                ${e.isTracked?'<span class="premiere-ep-badge tracked">⭐ Sleduji</span>':'<span class="premiere-ep-badge new">NOVÉ</span>'}\n                ${e.networks?`<span class="premiere-ep-badge network">${e.networks.slice(0,18)}</span>`:""}\n              </div>\n            </div>\n            <div class="premiere-ep-time">${i?"🔴 Dnes":""}</div>\n          </div>`
      }), s += "</div></div></div>"
    })
  }), t.innerHTML = s
}

function premiereOpenShow(e) {
  const t = void 0 !== db ? Object.keys(db).find(t => String(db[t]?.tmdbId) === String(e)) : null;
  closePremiereCalendar(), t ? setTimeout(() => openSeries(t), 350) : setTimeout(() => {
    // seriál není v seznamu → otevři ho přes TMDB (stejně jako v Objevovat)
    "function" == typeof openDiscoverTv ? openDiscoverTv(e, "") : showToast("🔍 Seriál není v tvém seznamu")
  }, 350)
}
