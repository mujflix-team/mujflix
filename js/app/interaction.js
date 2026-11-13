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
  // v tmavém stylu je plátno schované (display:none) – animace by jen zbytečně zatěžovala procesor
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
