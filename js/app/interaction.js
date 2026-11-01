/* Pozadí, klávesové zkratky, rozkoukané epizody. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
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
  // v Netflix stylu je plátno schované (display:none) – animace by jen zbytečně zatěžovala procesor
  if (!e || "none" === getComputedStyle(e).display) return;

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

/* class AIBrain → js/ai/brain.js */
const aiBrain = new AIBrain;

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
      return modalOpen ? void closeModal() : document.getElementById("watchlistOverlay").classList.contains("open") ? void closeWatchlist() : document.getElementById("universeOverlay").classList.contains("open") ? void closeSearch() : document.getElementById("ratingOverlay")?.classList.contains("open") ? void closeRating() : document.getElementById("genreEditorOverlay")?.classList.contains("open") ? void closeGenreEditor() : void 0
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
          n && n.querySelector(".ep-btn-play-hbo")?.click()
        } else if ("m" === e.key || "M" === e.key) {
          e.preventDefault();
          const n = t[kbEpIndex];
          n && n.querySelector(".ep-btn-mark")?.click()
        }
        return
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
  safeSetItem(uKey("mf_partial_watched"), JSON.stringify(e))
}

function setEpisodeProgress(e, t) {
  const n = getPartialWatched();
  if (t >= 100) delete n[e], savePartialWatched(n), markWatched(e);
  else if (t <= 0) {
    delete n[e], savePartialWatched(n);
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
