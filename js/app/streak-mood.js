/* Série dní. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
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

! function() {
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
}, 1200);
