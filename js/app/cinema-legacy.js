/* Starší přehrávač (záloha za novým v cinema.js). Část původního app.js, načítá se v tomto pořadí (viz index.html). */
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
  if (window.MFCinemaPlayer) {
    const r = window.MFCinemaPlayer.open(e, t, n);
    // jednorázové předávané hodnoty se vždy vynulují, i kdyby je přehrávač nepřečetl
    return window._cinSiteSlug = null, window._cinYear = null, r
  }
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
        n.innerHTML = `\n        <div style="position:absolute;inset:0;${c}">\n          \x3c!-- Tmavý overlay přes backdrop --\x3e\n          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.55) 50%,rgba(0,0,0,0.4) 100%);"></div>\n          \x3c!-- Blur vrstva pro glass efekt --\x3e\n          <div style="position:absolute;inset:0;backdrop-filter:blur(2px);"></div>\n\n          \x3c!-- Obsah uprostřed — tmavý glass panel garantuje čitelnost vždy --\x3e\n          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,'SF Pro Display',Inter,sans-serif;">\n\n            \x3c!-- Glass panel — izoluje texty od pozadí --\x3e\n            <div style="background:rgba(0,0,0,0.62);backdrop-filter:blur(28px) saturate(1.3);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:40px 52px;display:flex;flex-direction:column;align-items:center;gap:20px;box-shadow:0 32px 96px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.06);min-width:300px;max-width:460px;">\n\n              \x3c!-- Název + epizoda --\x3e\n              <div style="text-align:center;">\n                <div style="font-size:1.65rem;font-weight:800;color:#fff;letter-spacing:-0.5px;line-height:1.2;">${escapeHTML(o.title||"")}</div>\n                ${"tv"===o.type?`<div style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin-top:8px;letter-spacing:2px;font-weight:600;">S${String(o.season).padStart(2,"0")} · E${String(o.ep).padStart(2,"0")}</div>`:""}\n              </div>\n\n              \x3c!-- Hlavní play tlačítko --\x3e\n              <button onclick="(function(){const pw=screen.width,ph=screen.height,pop=window.open(${_cinJs(e)},'MujFlixCinema','width='+pw+',height='+ph+',left=0,top=0,menubar=no,toolbar=no,location=no,scrollbars=yes');if(!pop||pop.closed)window.open(${_cinJs(e)},'_blank','noopener,noreferrer');})()"\n                style="padding:18px 52px;border-radius:60px;background:linear-gradient(135deg,rgba(48,209,88,0.97),rgba(37,162,68,1));border:none;color:#fff;font-size:1.1rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25);transition:all 0.2s;letter-spacing:-0.2px;"\n                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 16px 52px rgba(48,209,88,0.6),inset 0 1px 0 rgba(255,255,255,0.25)'"\n                onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25)'">\n                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>\n                Přehrát\n              </button>\n\n              \x3c!-- Zdroj label — vždy čitelný na tmavém panelu --\x3e\n              <div style="font-size:0.68rem;color:rgba(255,255,255,0.55);letter-spacing:2px;text-transform:uppercase;font-weight:600;">${escapeHTML(t)}</div>\n\n              ${a&&l?`\n              \x3c!-- Další epizoda --\x3e\n              <button onclick="(function(){_cinState.season=${s};_cinState.ep=${r};document.getElementById('cinemaSubtitle').textContent='S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}';const e=document.getElementById('cinemaEpSel');if(e)e.value='${r}';const se=document.getElementById('cinemaSeasonSel');if(se)se.value='${s}';_cinLoad();})()"\n                style="display:flex;align-items:center;gap:9px;padding:11px 26px;border-radius:40px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:rgba(255,255,255,0.8);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:-apple-system,Inter,sans-serif;transition:all 0.18s;letter-spacing:-0.1px;"\n                onmouseover="this.style.background='rgba(255,255,255,0.16)';this.style.color='#fff'"\n                onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.8)'">\n                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">\n                  <polygon points="5 3 15 12 5 21 5 3" fill="currentColor" stroke="none"/>\n                  <line x1="19" y1="3" x2="19" y2="21"/>\n                </svg>\n                Další epizoda · S${String(s).padStart(2,"0")}E${String(r).padStart(2,"0")}\n              </button>`:""}\n\n              \x3c!-- Hledat na webu — vždy viditelné na glass panelu --\x3e\n              <a href="${d}" target="_blank" rel="noopener"\n                style="font-size:0.68rem;color:rgba(255,255,255,0.4);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color 0.15s;font-weight:500;"\n                onmouseover="this.style.color='rgba(255,255,255,0.8)'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">\n                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>\n                Nenašlo se? Hledat na webu\n              </a>\n\n            </div>\x3c!-- /glass panel --\x3e\n          </div>\n        </div>\n      `
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
  m.style.cssText = "flex:1;min-width:0;", m.innerHTML = `<div style="color:#fff;font-family:-apple-system,Inter,sans-serif;font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(n.title||"")}</div>
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


