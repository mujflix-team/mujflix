/* Série dní a výběr nálady. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
const _STREAK_BASE = "mf_streak_v1",
  _STREAK_TODAY_BASE = "mf_streak_today_v1";

// série dní patří profilu; staré globální hodnoty převezme jednorázově první profil
function _streakKey(base) {
  const k = uKey(base);
  try {
    if (k !== base && null === localStorage.getItem(k) && null !== localStorage.getItem(base) && !localStorage.getItem(base + "_migrated")) {
      localStorage.setItem(k, localStorage.getItem(base)), localStorage.setItem(base + "_migrated", "1")
    }
  } catch {}
  return k
}

function getStreakData() {
  try {
    return safeLS(_streakKey(_STREAK_BASE), '{"streak":0,"lastDate":null}')
  } catch {
    return {
      streak: 0,
      lastDate: null
    }
  }
}

function saveStreakData(e) {
  safeSetItem(_streakKey(_STREAK_BASE), JSON.stringify(e))
}

function _localDateKey(d) {
  // místní datum (ne UTC) – jinak se po půlnoci série počítá o 1–2 h pozdě
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
}

function getTodayKey() {
  return _localDateKey(new Date)
}

function getTodayEpCount() {
  try {
    return safeLS(_streakKey(_STREAK_TODAY_BASE), "{}")[getTodayKey()] || 0
  } catch {
    return 0
  }
}

function incrementTodayEp() {
  try {
    const e = getTodayKey();
    let t = safeLS(_streakKey(_STREAK_TODAY_BASE), "{}");
    const n = Object.keys(t).sort();
    for (; n.length > 7;) delete t[n.shift()];
    t[e] = (t[e] || 0) + 1, safeSetItem(_streakKey(_STREAK_TODAY_BASE), JSON.stringify(t)), updateStreak()
  } catch {}
}

function updateStreak() {
  const e = getTodayKey();
  let t = getStreakData();
  const n = new Date;
  n.setDate(n.getDate() - 1);
  const o = _localDateKey(n),
    i = getTodayEpCount();
  i > 0 && (t.lastDate === e || (t.lastDate === o ? (t.streak += 1, t.lastDate = e, saveStreakData(t)) : (t.lastDate, t.streak = 1, t.lastDate = e, saveStreakData(t))));
  // série, která se přerušila (poslední sledování dřív než včera), se nezobrazuje
  const a = t.lastDate === e || t.lastDate === o ? t.streak || 0 : 0,
    s = document.getElementById("streakWidget"),
    r = document.getElementById("streakCount"),
    l = document.getElementById("streakTodayCount"),
    c = document.getElementById("streakFire");
  r && (r.textContent = a), l && (l.textContent = i), c && (c.textContent = a >= 30 ? "💥" : a >= 14 || a >= 7 ? "🔥" : a >= 3 ? "✨" : "⭐"), s && (a >= 1 || i > 0 ? s.classList.add("visible") : s.classList.remove("visible"))
}

function openMoodPicker() {
  const e = document.getElementById("moodOverlay");
  if (!e) return;
  document.querySelectorAll(".mood-btn").forEach(e => e.classList.remove("selected"));
  const t = document.getElementById("moodResultSection");
  t && t.classList.remove("visible"), e.classList.add("open")
}

function closeMoodPicker() {
  const e = document.getElementById("moodOverlay");
  e && e.classList.remove("open")
}! function() {
  const e = window.markWatched;
  "function" == typeof e && (window.markWatched = function(...t) {
    e.apply(this, t), incrementTodayEp()
  });
  const t = window.toggleWatched;
  "function" == typeof t && (window.toggleWatched = function(...e) {
    const n = t.apply(this, e);
    return setTimeout(updateStreak, 50), n
  })
}(), setTimeout(() => {
  updateStreak()
}, 1200), document.getElementById("moodOverlay")?.addEventListener("click", function(e) {
  e.target === this && closeMoodPicker()
});
const moodConfig = {
  relax: {
    slugs: ["futurama", "the-simpsons"],
    label: "Klidná epizoda"
  },
  fun: {
    slugs: ["family-guy", "south-park", "the-simpsons"],
    label: "Smíchy"
  },
  adventure: {
    slugs: ["futurama", "south-park"],
    label: "Dobrodružství"
  },
  nostalgia: {
    slugs: ["the-simpsons", "futurama", "breaking-bad"],
    label: "Klasika"
  },
  random: {
    slugs: ["the-simpsons", "family-guy", "south-park", "futurama", "breaking-bad"],
    label: "Překvapení"
  },
  binge: {
    slugs: ["the-simpsons", "family-guy", "south-park", "futurama", "breaking-bad"],
    label: "Maratonská epizoda"
  }
};

function selectMood(e) {
  document.querySelectorAll(".mood-btn").forEach(e => e.classList.remove("selected"));
  const t = document.querySelector(`[data-mood="${e}"]`);
  t && t.classList.add("selected");
  const n = moodConfig[e] || moodConfig.random,
    // vestavěné seriály nemusí být v databázi – pak vezmi cokoli, co tu je
    _have = n.slugs.filter(x => db && db[x]),
    o = _have.length ? _have : Object.keys(db || {}).filter(x => !x.startsWith("__")),
    i = [],
    a = new Set;
  for (let t = 0; t < 40 && i.length < 2; t++) {
    const t = o[Math.floor(Math.random() * o.length)];
    if (!db || !db[t]) continue;
    const n = db[t],
      s = "function" == typeof window.totalSeasons ? window.totalSeasons(t) : n.seasons?.length || 1;
    if (!s) continue;
    const r = Math.ceil(Math.random() * Math.min(s, "nostalgia" === e ? 4 : s)),
      l = "function" == typeof window.epsInSeason ? window.epsInSeason(t, r) : 10;
    if (!l) continue;
    const c = Math.ceil(Math.random() * l),
      d = `${t}-S${r}-E${c}`;
    a.has(d) || (a.add(d), i.push({
      slug: t,
      se: r,
      ep: c,
      name: n.name,
      poster: n._poster || n.poster
    }))
  }
  const s = document.getElementById("moodResultCards"),
    r = document.getElementById("moodResultSection");
  if (s && r) {
    if (0 === i.length) return s.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:0.72rem;">Zatím tu nemám žádný seriál, ze kterého bych vybíral 🎬</div>', void r.classList.add("visible");
    s.innerHTML = i.map(e => `\n      <div class="mood-ep-card" onclick="closeMoodPicker();openSeries('${e.slug}');setTimeout(()=>{activeSeason=${e.se};showAllSeasons=false;renderSeasons&&renderSeasons();renderEpisodes&&renderEpisodes();setTimeout(()=>{const c=document.getElementById('card-${e.slug}-S${e.se}-E${e.ep}');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},200);},350)">\n        <img class="mood-ep-thumb" loading="lazy" src="${e.poster||""}" alt="${escapeHTML(e.name)}" onerror="this.style.background='#111'">\n        <div class="mood-ep-info">\n          <div class="mood-ep-show">${escapeHTML(e.name)}</div>\n          <div class="mood-ep-title">Série ${e.se}, Epizoda ${e.ep}</div>\n          <div class="mood-ep-meta">${n.label}</div>\n        </div>\n        <div class="mood-play-icon">▶</div>\n      </div>\n    `).join(""), r.classList.add("visible"), showToast?.("🎭 " + n.label + " — vybráno!")
  }
}
