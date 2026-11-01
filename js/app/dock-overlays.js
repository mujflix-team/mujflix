/* Dock a zavírání oken, PWA instalace. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
function setDockActive(e) {
  document.querySelectorAll(".dock-btn").forEach(e => e.classList.remove("active"));
  const t = document.getElementById(e);
  t && (t.classList.add("active"), t.style.transform = "scale(0.88) translateZ(0)", requestAnimationFrame(() => requestAnimationFrame(() => {
    t.style.transition = "transform 0.38s cubic-bezier(0.34,1.5,0.64,1)", t.style.transform = "", setTimeout(() => {
      t.style.transition = ""
    }, 400)
  })))
}

function closeDockOverlays() {
  "function" == typeof closeModal && closeModal(), "function" == typeof closeWatchlist && document.getElementById("watchlistOverlay")?.classList.contains("open") && closeWatchlist(), setDockActive("dockHome")
}

function closeDockMore() {
  const e = document.getElementById("dockMoreSheet"),
    t = document.getElementById("dockMoreBg");
  e && (e.style.transform = "translateY(100%)", setTimeout(() => {
    "translateY(100%)" === e.style.transform && (e.style.visibility = "hidden")
  }, 400)), t && (t.style.background = "rgba(0,0,0,0)", t.style.pointerEvents = "none");
  setDockActive({
    serialy: "dockHome",
    filmy: "dockFilmy",
    protebe: "dockProtebe"
  } [window._mfCurrentSection || "serialy"] || "dockHome")
}

function _syncDockBadges() {
  const n = document.getElementById("notifBellBadge"),
    o = document.getElementById("hdrNotifBadge");
  if (o) {
    const e = n && "" !== n.textContent.trim() && "none" !== n.style.display;
    o.textContent = e ? "!" : "", o.classList.toggle("visible", e)
  }
  const d = document.getElementById("nfBellDot");
  d && d.classList.toggle("visible", !!(n && "" !== n.textContent.trim() && "none" !== n.style.display))
}
document.addEventListener("keydown", function(e) {
    if ("INPUT" === e.target.tagName || "TEXTAREA" === e.target.tagName) return;
    const t = document.getElementById("seriesModal"),
      n = t && t.classList.contains("open");
    void n
  }),
  function() {
    const t = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(e, n) {
      t(e, n), e && String(e).includes("watched") && setTimeout(updateStreak, 100)
    }
  }();
const _origOpenWatchlist = window.openWatchlist;
"function" == typeof _origOpenWatchlist && (window.openWatchlist = function(...e) {
  return setDockActive("dockProtebe"), _origOpenWatchlist.apply(this, e)
});
const _origCloseWatchlist = window.closeWatchlist;

function triggerPwaInstall() {
  window._pwaInstallPrompt ? (window._pwaInstallPrompt.prompt(), window._pwaInstallPrompt.userChoice.then(({
    outcome: e
  }) => {
    if ("accepted" === e) {
      const e = document.getElementById("pwaInstallBtn");
      e && (e.style.display = "none"), showToast("✅ MůjFlix nainstalován!", "success")
    }
    window._pwaInstallPrompt = null
  })) : showToast("ℹ️ Instalace není k dispozici — otevři MůjFlix v prohlížeči (ne jako PWA)", "info")
}
"function" == typeof _origCloseWatchlist && (window.closeWatchlist = function(...e) {
    return setDockActive("dockHome"), _origCloseWatchlist.apply(this, e)
  }), setInterval(() => { document.hidden || _syncDockBadges() }, 6e3), setTimeout(_syncDockBadges, 500), window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(), window._pwaInstallPrompt = e;
    const t = document.getElementById("pwaInstallBtn");
    t && (t.style.display = "flex", t.onclick = async () => {
      if (!window._pwaInstallPrompt) return;
      window._pwaInstallPrompt.prompt();
      const {
        outcome: e
      } = await window._pwaInstallPrompt.userChoice;
      "accepted" === e && (t.style.display = "none", "function" == typeof showToast && showToast("✅ MůjFlix nainstalován!", "success")), window._pwaInstallPrompt = null
    })
  }), window.addEventListener("appinstalled", () => {
    const e = document.getElementById("pwaInstallBtn");
    e && (e.style.display = "none"), "function" == typeof showToast && showToast("✅ MůjFlix nainstalován!", "success")
  }),
  function() {
    function e() {
      const e = document.getElementById("streakCount"),
        t = document.getElementById("hdrStreakDays");
      if (t)
        if (e && e.textContent) t.textContent = e.textContent || "0";
        else try {
          const e = safeLS("mf_streak", "{}");
          t.textContent = e.current || e.count || "0"
        } catch (e) {
          t.textContent = "0"
        }
    }
    e(), setInterval(() => { document.hidden || e() }, 3e3), document.addEventListener("mf-streak-update", e)
  }(),
  function() {
    const e = "mf_ep_ratings",
      t = ["", "Katastrofa", "Ujde to", "Dobrá", "Výborná", "Masterpiece"];
    let n = null,
      o = 0;

    function _k() {
      // hodnocení epizod patří profilu; staré globální hodnocení se jednorázově převezme prvním profilem
      const k = uKey(e);
      try {
        if (k !== e && null === localStorage.getItem(k) && null !== localStorage.getItem(e) && !localStorage.getItem("mf_ep_ratings_migrated")) {
          localStorage.setItem(k, localStorage.getItem(e)), localStorage.setItem("mf_ep_ratings_migrated", "1")
        }
      } catch {}
      return k
    }

    function i() {
      try {
        return safeLS(_k(), "{}")
      } catch {
        return {}
      }
    }

    function a(e) {
      document.querySelectorAll(".er-star").forEach((t, n) => {
        t.classList.toggle("active", n < e)
      });
      const n = document.getElementById("erLabel"),
        o = document.getElementById("erSaveBtn");
      e > 0 ? (n.textContent = t[e], n.classList.add("rated"), o.classList.add("enabled")) : (n.textContent = "Jak se ti epizoda líbila?", n.classList.remove("rated"), o.classList.remove("enabled"))
    }

    function s(e, t) {
      const n = document.getElementById("card-" + e);
      if (!n) return;
      let o = n.querySelector(".ep-user-rating");
      if (t > 0) {
        if (!o) {
          o = document.createElement("span"), o.className = "ep-user-rating", o.title = "Moje hodnocení — klikni pro změnu", o.onclick = t => {
            t.stopPropagation(), l(e)
          };
          const t = n.querySelector(".ep-meta-row");
          t && t.appendChild(o)
        }
        o.innerHTML = '<span class="er-star-mini">⭐</span> ' + t + "/5"
      } else o && o.remove()
    }

    function r(e) {
      const t = document.getElementById("panelRatingSummary"),
        n = document.getElementById("panelRatingAvg"),
        o = document.getElementById("panelRatingCount");
      if (!t || !n || !o) return;
      const a = i(),
        s = Object.entries(a).filter(([t]) => t.startsWith(e + "-") && /^S\d+-E\d+$/.test(t.slice(e.length + 1))).map(([, e]) => e);
      if (0 === s.length) return void(t.style.display = "none");
      const r = (s.reduce((e, t) => e + t, 0) / s.length).toFixed(1),
        l = "⭐".repeat(Math.round(parseFloat(r)));
      n.textContent = l + " " + r + "/5", o.textContent = "(" + s.length + " hodnocení)", t.style.display = "flex"
    }

    function l(e) {
      const t = e.split("-"),
        n = t.slice(0, t.length - 2).join("-"),
        o = (void 0 !== db && db[n] ? db[n] : {}).name || n,
        i = parseInt((t[t.length - 2] || "S1").replace("S", "")) || 1,
        a = parseInt((t[t.length - 1] || "E1").replace("E", "")) || 1;
      openEpRating(e, o, "S" + i + " · E" + a, getEpRating(e))
    }
    window.getEpRating = function(e) {
      return i()[e] || 0
    }, window.saveEpRating = function() {
      if (!o || !n) return;
      const t = i(),
        _prev = t[n] || 0;
      t[n] = o,
        function(t) {
          safeSetItem(_k(), JSON.stringify(t))
        }(t);
      const a = n,
        l = o;
      closeEpRating(!0), s(a, l), "function" == typeof showToast && showToast("⭐ Hodnocení uloženo"), void 0 !== activeSeries && r(activeSeries);
      if (typeof aiBrain !== "undefined" && typeof db !== "undefined") {
        const parts = a.split("-"),
          epSlug = parts.slice(0, parts.length - 2).join("-"),
          show = db[epSlug];
        if (show?._genres) {
          const _w = { 1: -.15, 2: -.05, 3: 0, 4: .1, 5: .2 },
            // přehodnocení stejné epizody jen upraví rozdíl, nesčítá se
            weight = (_w[l] || 0) - (_w[_prev] || 0);
          weight && aiBrain.boostGenresFromTmdb(show._genres, weight)
        }
      }
    }, window.openEpRating = function(e, t, i, s, anchor) {
      n = e, o = s || 0, document.getElementById("erSeriesName").textContent = t || "", document.getElementById("erEpName").textContent = i || e, a(o);
      const r = document.getElementById("epRatingOverlay"),
        sheet = document.getElementById("epRatingSheet");
      // Hodnocení je nenápadný popover: nezakrývá obrazovku ani neblokuje klikání. Z kina u hvězdičky, jinak v rohu.
      r.classList.remove("er-anchored", "er-corner"), r.classList.add("er-pop"), sheet && (sheet.style.cssText = "");
      clearTimeout(window._erAuto);
      if (anchor && anchor.getBoundingClientRect && sheet) {
        const b = anchor.getBoundingClientRect(),
          w = Math.min(300, window.innerWidth - 24),
          left = Math.max(12, Math.min(window.innerWidth - w - 12, b.right - w)),
          top = Math.min(window.innerHeight - 170, b.bottom + 10);
        r.classList.add("er-anchored"), sheet.style.cssText = `left:${left}px;top:${Math.max(8, top)}px;width:${w}px;transform-origin:${Math.round(b.left + b.width / 2 - left)}px 0px`
      } else r.classList.add("er-corner");
      window._erAuto = setTimeout(() => { n === e && closeEpRating(!1) }, 9e3);
      r.style.display = "flex", requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add("open")))
    }, window.closeEpRating = function(e) {
      const t = document.getElementById("epRatingOverlay");
      clearTimeout(window._erAuto), t.classList.remove("open"), setTimeout(() => {
        t.classList.contains("open") || (t.style.display = "none")
      }, 360), e || (o = 0), n = null
    }, document.addEventListener("DOMContentLoaded", function() {
      document.addEventListener("pointerdown", ev => {
        const ov = document.getElementById("epRatingOverlay");
        ov && ov.classList.contains("open") && ov.classList.contains("er-pop") && !ev.target.closest("#epRatingSheet") && !ev.target.closest("#mfCinRateBtn") && closeEpRating(!1)
      }, !0);
      document.querySelectorAll(".er-star").forEach(e => {
        const t = parseInt(e.dataset.v);
        e.addEventListener("mouseenter", () => a(t)), e.addEventListener("mouseleave", () => a(o)), e.addEventListener("click", () => {
          o = o === t ? 0 : t, a(o), e.classList.remove("bounce"), e.offsetWidth, e.classList.add("bounce"), setTimeout(() => e.classList.remove("bounce"), 300), o && (clearTimeout(window._erAuto), window._erAuto = setTimeout(() => saveEpRating(), 450))
        }), e.addEventListener("touchend", e => {
          e.preventDefault(), o = o === t ? 0 : t, a(o), o && (clearTimeout(window._erAuto), window._erAuto = setTimeout(() => saveEpRating(), 450))
        }, {
          passive: !1
        })
      })
    }), window._refreshPanelRatingSummary = r, window._epRatingRefreshCard = s, window._epRatingOpenFromCard = l, window._epRatingRefreshPanel = r
  }(),
  function() {
    const e = localStorage.setItem.bind(localStorage);
    let t = null;

    function n() {
      const e = [".wrapped-overlay.open", ".universe-overlay.open", "#universeOverlay.open", ".genre-editor-overlay.open", ".pm-overlay.open", ".watchlist-overlay.open"].some(e => !!document.querySelector(e));
      document.body.classList.toggle("modal-open", e)
    }
    window.refreshUserContent = window.refreshUserContent || function() {
      void 0 !== db && Object.keys(db).forEach(e => {
        "function" == typeof updateTileProgress && updateTileProgress(e), "function" == typeof updateContinueBadge && updateContinueBadge(e)
      }), "function" == typeof updateLogoProgress && updateLogoProgress(), "function" == typeof updateWatchlistBtns && updateWatchlistBtns()
    }, document.addEventListener("DOMContentLoaded", () => {
      let _moT = null;
      new MutationObserver(() => {
        _moT || (_moT = setTimeout(() => { _moT = null; n() }, 150))
      }).observe(document.body, {
        subtree: !0,
        attributes: !0,
        attributeFilter: ["class"]
      }), n()
    })
  }();
