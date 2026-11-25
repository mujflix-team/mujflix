/* Editor žánrů, karta epizody, registrace service workeru (PWA). Část původního app.js, načítá se v tomto pořadí (viz index.html). */
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

function buildEpCard(e, t, n, o, i, a, s) {
  const r = _buildEpCardBase(e, t, n, o, i, a, s);
  if ("function" == typeof getEpRating) {
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
    const t = e.target.closest("button, .dock-btn, .ssv-card, .episode-card, .sh-card, .mf-header-btn");
    if (!t || t.disabled) return;
    if (t.classList.contains("episode-card")) return;
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
    /* Adresa skriptu nese verzi aplikace: po nasazení se service worker vymění a jeho aktivace smaže starou cache */
    await navigator.serviceWorker.register("/sw.js?v=" + encodeURIComponent(window.MF_VERSION || "0"), { scope: "/" });
  } catch (e) {
    console.warn("[PWA] SW error:", e)
  }
}
