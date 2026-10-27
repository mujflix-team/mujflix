/* Klíče podle profilu, sekce a adresy (#serialy …). Část původního app.js, načítá se v tomto pořadí (viz index.html). */
const _PP_KEYS = [{
  key: "mf_gemini_key",
  label: "Gemini",
  color: "#007AFF",
  ph: "AIzaSy…"
}, {
  key: "mf_or_key",
  label: "OpenRouter",
  color: "#00cfff",
  ph: "sk-or-…"
}, {
  key: "mf_groq_key",
  label: "Groq",
  color: "#ff9a3c",
  ph: "gsk_…"
}];

function _czSlug(e) {
  return e ? e.toLowerCase().replace(/[łøđðıþßæœ]/g, c => ({ "ł": "l", "ø": "o", "đ": "d", "ð": "d", "ı": "i", "þ": "th", "ß": "ss", "æ": "ae", "œ": "oe" })[c]).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and").replace(/'/g, "").replace(/:/g, "").replace(/\./g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : ""
}

function _svetSerialuSlugVariants(e, t) {
  const n = _czSlug(t || ""),
    o = String(e || n || ""),
    i = [o];
  o.startsWith("the-") && i.push(o.slice(4)), !o.startsWith("the-") && t && t.toLowerCase().startsWith("the ") && i.push("the-" + o);
  const a = o.replace(/-\d{4}$/, "");
  return a !== o && i.push(a), [...new Set(i)]
}

function _bombujMovieUrlVariants(e, t) {
  const n = _czSlug(e);
  const q = `https://www.bombuj.si/?s=${encodeURIComponent(e||"")}`;
  if (!n) return [q];
  const o = parseInt(t) || null;
  if (!o) return [`https://www.bombuj.si/online-film-${n}`, q];
  return [`https://www.bombuj.si/online-film-${n}-${o}`, `https://www.bombuj.si/online-film-${n}-${o-1}`, `https://www.bombuj.si/online-film-${n}`, q]
}
! function() {
    function e() {
      const e = localStorage.getItem("mf_active_pid");
      e && _PP_KEYS.forEach(t => {
        const n = localStorage.getItem(t.key + "_" + e);
        n && (localStorage.setItem(t.key, n), window.MFApiKeysDB?._db && window.MFApiKeysDB.saveKey(t.key, n))
      })
    }
    document.addEventListener("DOMContentLoaded", () => setTimeout(e, 400));
    const t = window.setActiveUser;
    window.setActiveUser = function(n) {
      t && t(n), setTimeout(e, 100)
    }
  }(),
  function() {
    const e = {
      "#": () => {
        "function" == typeof closeDockOverlays && closeDockOverlays()
      },
      "#serialy": () => {
        "function" == typeof closeDockOverlays && closeDockOverlays();
        "function" == typeof setDockActive && setDockActive("dockHome");
        if (typeof window._mfShowSection_orig === "function") window._mfShowSection_orig("serialy");
        else if (typeof mfShowSection === "function") mfShowSection("serialy");
      },
      "#seriale": () => {
        "function" == typeof mfDiscoverOpen ? mfDiscoverOpen("tv") : "function" == typeof openUniverse && openUniverse()
      },
      "#filmy": () => {
        "function" == typeof mfDiscoverOpen ? mfDiscoverOpen("movie") : "function" == typeof openUniverse && openUniverse()
      },
      "#protebe": () => {
        if ("function" == typeof mfShowSection) {
          (window._mfShowSection_orig || mfShowSection)("protebe")
        }
        "function" == typeof setDockActive && setDockActive("dockProtebe")
      },
      "#watchlist": () => {
        "function" == typeof openWatchlist && openWatchlist()
      },
      "#settings": () => {
        "function" == typeof openSettings && openSettings()
      },
      "#profil": () => {
        void 0 !== ProfileGate && ProfileGate.show()
      },
      "#profily": () => {
        void 0 !== ProfileGate && ProfileGate.show()
      }
    };

    function t() {
      const t = (window.location.hash || "").toLowerCase().split("/")[0];
      (e[t] || e["#serialy"])()
    }

    function n() {
      const e = e => {
        location.hash !== e && history.pushState(null, "", e)
      };
      "function" == typeof window.mfShowSection && (window._mfShowSection_orig = window.mfShowSection, window.mfShowSection = function(t, ...n) {
        const o = {
          serialy: "#serialy",
          filmy: "#filmy",
          protebe: "#protebe",
          discover: "#discover"
        };
        return o[t] && e(o[t]), window._mfShowSection_orig.call(this, t, ...n)
      });
      if ([
          ["openWatchlist", "#watchlist"],
          ["openSettings", "#settings"]
        ].forEach(([t, n]) => {
          if ("function" == typeof window[t]) {
            const o = window[t];
            window[t] = function(...t) {
              return e(n), o.apply(this, t)
            }
          }
        }), void 0 !== ProfileGate) {
        ((t, n, o) => {
          if (!t || "function" != typeof t[n]) return;
          const i = t[n].bind(t);
          t[n] = function(...t) {
            return e(o), i(...t)
          }
        })(ProfileGate, "show", "#profily");
        const t = ProfileGate.hide.bind(ProfileGate);
        ProfileGate.hide = function(...n) {
          return e("#serialy"), t(...n)
        };
        const n = ProfileGate.activateProfile.bind(ProfileGate);
        ProfileGate.activateProfile = function(...t) {
          return n(...t);
        }
      }
      document.querySelectorAll(".dock-btn[data-hash]").forEach(t => {
        t.addEventListener("click", () => e(t.dataset.hash))
      })
    }
    window.addEventListener("hashchange", t), document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        n(), location.hash && "#" !== location.hash || history.replaceState(null, "", "#serialy"), t()
      }, 900)
    })
  }(), function() {
    let e = "movie";
    window.ptSetType = function(t) {
      e = t;
      const n = document.getElementById("ptTypeMovie"),
        o = document.getElementById("ptTypeSerial");
      n && o && ("movie" === t ? (n.style.background = "rgba(0,122,255,0.18)", n.style.color = "#007AFF", o.style.background = "transparent", o.style.color = "rgba(255,255,255,0.35)") : (o.style.background = "rgba(0,122,255,0.18)", o.style.color = "#007AFF", n.style.background = "transparent", n.style.color = "rgba(255,255,255,0.35)"))
    }, window.ptFinderSearch = function() {
      const t = document.getElementById("ptFinderInput");
      if (!t) return;
      const n = t.value.trim();
      n ? (! function(e, t) {
        let n;
        try {
          n = safeLS(uKey("mf_pt_chips"), "[]")
        } catch {
          n = []
        }
        const o = {
            name: e,
            type: t,
            ts: Date.now()
          },
          i = n.filter(t => t.name !== e).slice(0, 7);
        i.unshift(o), safeSetItem(uKey("mf_pt_chips"), JSON.stringify(i)), ptRenderChips()
      }(n, e), "function" == typeof verifyAndOpen ? verifyAndOpen(n, e) : "function" == typeof showFinderModal && (showFinderModal(n, e), "function" == typeof runFinder && runFinder(n, e))) : t.focus()
    }, window.ptRenderChips = function() {
      const e = document.getElementById("ptFinderChips");
      if (!e) return;
      let t;
      try {
        t = safeLS(uKey("mf_pt_chips"), "[]")
      } catch {
        t = []
      }
      e.innerHTML = '<span style="font-size:0.55rem;color:rgba(255,255,255,0.25);align-self:center;flex-shrink:0;">Naposledy:</span>', t.length ? t.slice(0, 5).forEach(t => {
        const n = document.createElement("button");
        n.style.cssText = "\n        padding:5px 11px;border-radius:20px;\n        background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);\n        color:rgba(255,255,255,0.6);font-size:0.62rem;font-family:-apple-system,sans-serif;\n        cursor:pointer;white-space:nowrap;transition:all 0.18s;display:flex;align-items:center;gap:5px;\n      ", n.innerHTML = `${"movie"===t.type?"🎬":"📺"} ${escapeHTML(t.name)}`, n.onmouseover = () => {
          n.style.background = "rgba(255,255,255,0.11)", n.style.color = "#fff"
        }, n.onmouseout = () => {
          n.style.background = "rgba(255,255,255,0.06)", n.style.color = "rgba(255,255,255,0.6)"
        }, n.onclick = () => {
          document.getElementById("ptFinderInput").value = t.name, ptSetType(t.type), ptFinderSearch()
        }, e.appendChild(n)
      }) : e.innerHTML += '<span style="font-size:0.6rem;color:rgba(255,255,255,0.18);">zatím nic</span>'
    };
    const t = new MutationObserver(() => {
      const e = document.getElementById("mfSectionProtebe");
      e && "none" !== e.style.display && ptRenderChips()
    });
    document.addEventListener("DOMContentLoaded", () => {
      const e = document.getElementById("mfSectionProtebe");
      e && t.observe(e, {
        attributes: !0,
        attributeFilter: ["style"]
      }), ptRenderChips()
    })
  }(),
  function() {
    let e = "serialy";
    window.mfSectionBtn = function(e, t) {}, window.mfShowSection = function(t) {
      e = t, window._mfCurrentSection = t;
      const n = document.querySelector(".ps-menu-scene"),
        o = document.querySelector(".key-hint"),
        i = document.getElementById("continueWidget"),
        a = document.getElementById("mfSectionProtebe");
      n && (n.style.display = ""), o && (o.style.display = ""), i && (i.style.display = ""), a && (a.style.display = "none");
      if (document.body.classList.remove("mf-section-protebe"), "serialy" === t) {
        "function" == typeof closeUniverse && closeUniverse();
        const e = document.getElementById("universeOverlay");
        e && (e.classList.remove("visible", "open"), document.body.classList.remove("discover-open"));
        "function" == typeof closeDockOverlays && closeDockOverlays();
        setDockActive("dockHome");
        location.hash = "#serialy";
      }
      else if ("filmy" === t) n && (n.style.display = "none"), o && (o.style.display = "none"), i && (i.style.display = "none"), setDockActive("dockFilmy"), location.hash = "#filmy", "function" == typeof mfDiscoverOpen ? mfDiscoverOpen("movie") : "function" == typeof openUniverse && openUniverse();
      else if ("protebe" === t) n && (n.style.display = "none"), o && (o.style.display = "none"), i && (i.style.display = "none"), a && (a.style.display = "block"), document.body.classList.add("mf-section-protebe"), setDockActive("dockProtebe"), location.hash = "#protebe";
    };
    const t = window.closeUniverse;

    function n() {
      const e = (location.hash || "").toLowerCase();
      "#filmy" === e ? mfShowSection("filmy") : "#protebe" === e ? mfShowSection("protebe") : "#serialy" !== e && "" !== e || mfShowSection("serialy")
    }
    window.closeUniverse = function() {
      t && t.apply(this, arguments), setTimeout(() => {
        if ("filmy" === e) {
          const q = document.querySelector(".ps-menu-scene"),
            w = document.querySelector(".key-hint");
          q && (q.style.display = ""), w && (w.style.display = ""), setDockActive("dockHome"), e = "serialy", location.hash = "#serialy"
        } else {
          setDockActive({serialy:"dockHome",protebe:"dockProtebe"}[e] || "dockHome")
        }
      }, 50)
    }, window.addEventListener("hashchange", n), document.addEventListener("DOMContentLoaded", () => setTimeout(n, 900));
    document.addEventListener("click", event => {
      const button = event.target.closest && event.target.closest(".mf-dock .dock-btn");
      if (!button) return;
      const activeId = button.id;
      if (!activeId) return;
      setTimeout(() => setDockActive(activeId), 0);
    }, true);
    const o = window.setDockActive;
    window.setDockActive = function(e) {
      o && o(e), ["dockHome", "dockSeriale", "dockFilmy", "dockProtebe", "dockProfile", "dockMore"].forEach(t => {
        const n = document.getElementById(t);
        n && (t === e ? n.classList.add("active") : n.classList.remove("active"))
      })
    }
  }(), function() {
    function e() {
      function e(e) {
        if (e._tiltInited) return;
        e._tiltInited = !0;
        const t = e.querySelector(".ps-tile");
        t && (e.addEventListener("mousemove", n => {
          const o = e.getBoundingClientRect(),
            i = (n.clientX - o.left) / o.width - .5,
            a = (n.clientY - o.top) / o.height - .5;
          t.style.transform = `rotateY(${7*i*2}deg) rotateX(${7*-a}deg)`, t.style.transformStyle = "preserve-3d", t.style.transition = "transform 0.12s ease"
        }), e.addEventListener("mouseleave", () => {
          t.style.transform = "", t.style.transition = "transform 0.5s cubic-bezier(0.34,1.2,0.64,1)"
        }))
      }
      document.querySelectorAll(".ps-tile-wrapper").forEach(e);
      new MutationObserver(t => t.forEach(t => t.addedNodes.forEach(t => {
        1 === t.nodeType && (t.classList?.contains("ps-tile-wrapper") && e(t), t.querySelectorAll?.(".ps-tile-wrapper").forEach(e))
      }))).observe(document.body, {
        childList: !0,
        subtree: !0
      })
    }

    "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", e) : e()
  }(), window.CinAI = function() {
    const e = "mf_cin_ai_stats";

    function t() {
      try {
        return safeLS(e, "{}")
      } catch (e) {
        return {}
      }
    }

    function n(e) {
      if (!e || 0 === e.tries) return 50;
      const t = e.ok / e.tries,
        n = Date.now() - (e.lastTs || 0),
        o = Math.max(.4, 1 - n / 1728e5);
      return Math.round(100 * t * o)
    }

    function o(e) {
      const o = t();
      return [...e].map((e, t) => ({
        src: e,
        i: t,
        score: n(o[e.id])
      })).sort((e, t) => t.score - e.score)
    }

    function i(n, o) {
      const i = t();
      i[n] || (i[n] = {
          ok: 0,
          tries: 0,
          lastTs: 0
        }), i[n].tries++, o && i[n].ok++, i[n].lastTs = Date.now(),
        function(t) {
          try {
            localStorage.setItem(e, JSON.stringify(t))
          } catch (e) {}
        }(i)
    }
    return {
      findBestSource: async function(e, i, a, s, r) {
        const l = o(e),
          c = t(),
          d = _cinState;
        if (e.every(e => e.popupOnly)) return d.sourceIdx;
        const m = l.slice(0, 4).map(async ({
            src: e,
            i: t
          }) => {
            const n = "movie" === a ? e.movie(i, d.title, d.year) : e.tv(i, s, r, d.title, d.siteSlug || null),
              o = await async function(e) {
                try {
                  const t = new AbortController,
                    n = setTimeout(() => t.abort(), 5e3);
                  return await fetch(e, {
                    method: "HEAD",
                    mode: "no-cors",
                    signal: t.signal
                  }), clearTimeout(n), !0
                } catch (e) {
                  return !1
                }
              }(n);
            return {
              src: e,
              i: t,
              alive: o,
              url: n
            }
          }),
          u = (await Promise.all(m)).filter(e => e.alive);
        if (u.length > 0) {
          const e = u[0];
          return window.MF_DEBUG && console.log(`[CinAI] Nejlepší zdroj: ${e.src.label} (skóre ${n(c[e.src.id])}, probe OK)`), e.i
        }
        return window.MF_DEBUG && console.log("[CinAI] Probe timeout, fallback na přednastavený zdroj"), d.sourceIdx
      },
      monitorIframe: function(e, t) {
        let n = !1;
        e.addEventListener("load", () => {
          n = !0, setTimeout(() => {
            const n = e.getBoundingClientRect(),
              o = n.width > 100 && n.height > 100;
            i(t, o), o && window.MF_DEBUG && console.log(`[CinAI] ${t} ✅ zaznamenán úspěch`)
          }, 2e3)
        }), setTimeout(() => {
          n || (i(t, !1), window.MF_DEBUG && console.log(`[CinAI] ${t} ❌ timeout — zaznamenán neúspěch`))
        }, 12e3)
      },
      renderAIBadge: function(e) {
        const t = document.createElement("div");
        t.id = "cinAIBadge", t.style.cssText = "display:flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.3);border-radius:20px;font-size:0.6rem;color:rgba(0,122,255,0.9);font-family:Inter,sans-serif;font-weight:600;white-space:nowrap;cursor:default;", t.title = "AI automaticky vybírá nejspolehlivější zdroj", t.innerHTML = "✦ AI", e.prepend(t)
      },
      recordResult: i,
      getScore: n,
      loadStats: t,
      resetStats: function() {
        localStorage.removeItem(e), window.MF_DEBUG && console.log("[CinAI] Statistiky vynulovány")
      },
      showStats: function() {
        const e = t();
        if (void 0 === CINEMA_SOURCES) return;
        const o = CINEMA_SOURCES.map(t => {
          const o = e[t.id],
            i = n(o),
            a = "█".repeat(Math.round(i / 10)) + "░".repeat(10 - Math.round(i / 10)),
            s = o ? o.tries : 0;
          return `${t.label.padEnd(12)} ${a} ${i}% (${s}×)`
        }).join("\n");
        if (window.MF_DEBUG && console.log("[CinAI] Statistiky zdrojů:\n" + o), "function" == typeof showToast) {
          const t = CINEMA_SOURCES.map(t => ({
            src: t,
            score: n(e[t.id])
          })).sort((e, t) => t.score - e.score)[0];
          showToast(`🤖 Nejlepší zdroj: ${t.src.label} (${t.score}%)`, "success")
        }
      },
      rankSources: o
    }
  }(), window.MFTransition = function() {
    const e = !!document.startViewTransition;
    return {
      run: function(t, n, o) {
        if (!e) return void o();
        var i, a;
        t && (a = "movie-poster", (i = t) && (i.style.viewTransitionName = a));
        const s = document.startViewTransition(() => {
          t && function(e) {
            e && (e.style.viewTransitionName = "")
          }(t), o()
        });
        return s.finished.catch(() => {}), s
      },
      skeleton: function(e, t) {
        t = t || [{
          w: "100%",
          h: "220px",
          r: "16px",
          delay: 0
        }, {
          w: "60%",
          h: "20px",
          r: "8px",
          delay: .1
        }, {
          w: "40%",
          h: "14px",
          r: "6px",
          delay: .15
        }, {
          w: "100%",
          h: "80px",
          r: "10px",
          delay: .2
        }, {
          w: "80%",
          h: "12px",
          r: "6px",
          delay: .25
        }], e && (e.innerHTML = t.map(e => `<div class="sk-block" style="width:${e.w};height:${e.h};border-radius:${e.r};margin-bottom:12px;animation-delay:${e.delay}s;"></div>`).join(""))
      },
      detailSkeleton: function(e) {
        e && (e.innerHTML = '\n      <div class="sk-block" style="width:100%;height:260px;border-radius:16px 16px 0 0;margin-bottom:0;animation-delay:0s;"></div>\n      <div style="padding:20px 20px 0;">\n        <div class="sk-block" style="width:55%;height:22px;border-radius:8px;margin-bottom:10px;animation-delay:0.08s;"></div>\n        <div class="sk-block dark" style="width:35%;height:13px;border-radius:6px;margin-bottom:18px;animation-delay:0.13s;"></div>\n        <div class="sk-block dark" style="width:100%;height:12px;border-radius:5px;margin-bottom:7px;animation-delay:0.17s;"></div>\n        <div class="sk-block dark" style="width:90%;height:12px;border-radius:5px;margin-bottom:7px;animation-delay:0.20s;"></div>\n        <div class="sk-block dark" style="width:70%;height:12px;border-radius:5px;margin-bottom:20px;animation-delay:0.22s;"></div>\n        <div style="display:flex;gap:10px;">\n          <div class="sk-block light" style="flex:1;height:44px;border-radius:12px;animation-delay:0.27s;"></div>\n          <div class="sk-block" style="flex:1;height:44px;border-radius:12px;animation-delay:0.30s;"></div>\n        </div>\n      </div>')
      },
      searchSkeleton: function(e, t) {
        t = t || 6, e && (e.innerHTML = Array.from({
          length: t
        }, (e, t) => `<div style="animation-delay:${.06*t}s;">\n        <div class="sk-block" style="width:100%;aspect-ratio:2/3;border-radius:14px;margin-bottom:8px;animation-delay:${.06*t}s;"></div>\n        <div class="sk-block dark" style="width:75%;height:11px;border-radius:5px;margin-bottom:5px;animation-delay:${.06*t+.05}s;"></div>\n        <div class="sk-block dark" style="width:45%;height:9px;border-radius:4px;animation-delay:${.06*t+.08}s;"></div>\n      </div>`).join(""))
      },
      SUPPORTS: e
    }
  }(), document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("click", function(e) {
      const t = e.target.closest(".ps-tile-wrapper");
      if (!t) return;
      const n = t.querySelector(".tile-bg, img");
      n && document.startViewTransition && (n.style.viewTransitionName = "movie-poster", setTimeout(() => {
        n.style.viewTransitionName = ""
      }, 700))
    }, !0)
  }), window.JWAvail = function() {
    const e = {},
      t = 432e5,
      n = void 0 !== window.TMDB_KEY ? window.TMDB_KEY : null,
      o = {
        flatrate: {
          label: "Streaming",
          color: "#30d158",
          icon: "▶"
        },
        rent: {
          label: "Pronájem",
          color: "#ff9f0a",
          icon: "🔑"
        },
        buy: {
          label: "Koupit",
          color: "#007AFF",
          icon: "🛒"
        },
        free: {
          label: "Zdarma",
          color: "#5ac8fa",
          icon: "✨"
        }
      };
    async function i(o, i) {
      const a = `${i}_${o}`,
        s = Date.now();
      if (e[a] && s - e[a].ts < t) return e[a].data;
      try {
        const n = safeLS("mf_jw_" + a, "null");
        if (n && s - n.ts < t) return e[a] = n, n.data
      } catch (e) {}
      if (!n) return null;
      try {
        const t = "movie" === i ? `https://api.themoviedb.org/3/movie/${o}/watch/providers?api_key=${n}` : `https://api.themoviedb.org/3/tv/${o}/watch/providers?api_key=${n}`,
          r = await fetch(t);
        if (!r.ok) return null;
        const l = await r.json(),
          c = l.results?.CZ || l.results?.SK || l.results?.DE || null,
          d = {
            data: c,
            ts: s
          };
        e[a] = d;
        try {
          localStorage.setItem("mf_jw_" + a, JSON.stringify(d))
        } catch (e) {}
        return c
      } catch (e) {
        return null
      }
    }
    async function a(e, t, n) {
      if (!e || !t) return;
      e.innerHTML = '<div style="display:flex;gap:8px;align-items:center;opacity:0.35;">\n      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>\n      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>\n      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>\n    </div>';
      const a = await i(t, n);
      if (!a) return void(e.innerHTML = "");
      let s = [];
      ["flatrate", "rent", "buy", "free"].forEach(e => {
        if (!a[e] || !a[e].length) return;
        const t = a[e].slice(0, 4),
          n = o[e];
        s.push(`\n        <div style="margin-bottom:10px;">\n          <div style="font-size:0.55rem;font-weight:700;letter-spacing:0.5px;color:${n.color};margin-bottom:5px;text-transform:uppercase;">${n.icon} ${n.label}</div>\n          <div style="display:flex;gap:6px;flex-wrap:wrap;">\n            ${t.map(e=>{return`\n              <div title="${escapeHTML(e.provider_name)}" style="width:30px;height:30px;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);flex-shrink:0;cursor:default;" >\n                <img src="${t=e.logo_path,`https://image.tmdb.org/t/p/original${t}`}" alt="${e.provider_name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">\n              </div>`;var t}).join("")}\n          </div>\n        </div>`)
      }), 0 !== s.length ? e.innerHTML = `\n      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:4px;">\n        <div style="font-size:0.6rem;color:rgba(255,255,255,0.35);margin-bottom:8px;display:flex;align-items:center;gap:5px;">\n          <span>Dostupné přes</span>\n          <span style="opacity:0.4">·</span>\n          <a href="https://www.justwatch.com/cz" target="_blank" rel="noopener" style="color:rgba(0,122,255,0.7);text-decoration:none;font-size:0.55rem;">JustWatch</a>\n        </div>\n        ${s.join("")}\n      </div>` : e.innerHTML = '<div style="font-size:0.62rem;color:rgba(255,255,255,0.25);padding:4px 0;">Není dostupné ve streaming službách v CZ</div>'
    }
    return {
      render: a,
      fetchProviders: i,
      injectIntoModal: function(e, t) {
        setTimeout(() => {
          const n = document.querySelector(".jw-avail-slot");
          n && a(n, e, t)
        }, 200)
      }
    }
  }(), window.MFSettings = function() {

    function t(e) {
      return escapeHTML(e)
    }

    function n() {
      const e = document.getElementById("mfAiStatsGrid");
      if (!e || !window.CinAI || void 0 === CINEMA_SOURCES) return;
      const t = CinAI.loadStats();
      e.innerHTML = CINEMA_SOURCES.map(e => {
        const n = CinAI.getScore(t[e.id]),
          o = t[e.id],
          i = n >= 70 ? "#30d158" : n >= 40 ? "#ff9f0a" : o ? "#ff453a" : "rgba(255,255,255,0.2)",
          a = o ? o.tries : 0;
        return `<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:rgba(255,255,255,0.03);border-radius:8px;">\n        <div style="width:7px;height:7px;border-radius:50%;background:${i};flex-shrink:0;"></div>\n        <div>\n          <div style="font-size:0.62rem;color:rgba(255,255,255,0.65);font-weight:600;">${e.label}</div>\n          <div style="font-size:0.5rem;color:rgba(255,255,255,0.3);">${a?n+"% ("+a+"×)":"Neotestováno"}</div>\n        </div>\n      </div>`
      }).join("")
    }
    return {
      open: function() {
        document.getElementById("mfBeautifulSettings") || function() {
          const a = localStorage.getItem("mf_tmdb_key") || "",
            s = document.createElement("div");
          s.id = "mfBeautifulSettings", s.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.75);backdrop-filter:blur(24px);display:flex;align-items:flex-end;justify-content:center;font-family:-apple-system,Inter,sans-serif;animation:mfSettFade 0.22s ease;";
          const r = document.createElement("div");
          r.style.cssText = "background:rgba(18,18,26,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:28px 28px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:0 0 40px;box-shadow:0 -20px 60px rgba(0,0,0,0.6);animation:mfSettUp 0.38s cubic-bezier(0.34,1.1,0.64,1);", r.innerHTML = `\n      \x3c!-- Handle --\x3e\n      <div style="display:flex;justify-content:center;padding:12px 0 4px;">\n        <div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.18);"></div>\n      </div>\n\n      \x3c!-- Header --\x3e\n      <div style="padding:16px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">\n        <div style="display:flex;align-items:center;justify-content:space-between;">\n          <div>\n            <div style="font-size:1.15rem;font-weight:700;color:#fff;letter-spacing:-0.3px;">Nastavení</div>\n            <div style="font-size:0.62rem;color:rgba(255,255,255,0.35);margin-top:2px;">MůjFlix konfigurace</div>\n          </div>\n          <button id="mfSetClose" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>\n        </div>\n      </div>\n\n      \x3c!-- Section: TMDB --\x3e\n      <div style="padding:20px 24px 0;">\n        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🎬 Film databáze</div>\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">\n          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">TMDB API klíč</label>\n          <input id="mfSetTmdb" type="password" placeholder="Vložte váš TMDB API klíč…" value="${t(a)}"\n            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:inherit;">\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;line-height:1.5;">\n            Získej zdarma na <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" style="color:rgba(0,122,255,0.7);">themoviedb.org</a> → API → Klíč v3\n          </div>\n        </div>\n      </div>\n\n      \x3c!-- Section: AI --\x3e\n      <div style="padding:16px 24px 0;">\n        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🤖 AI asistent</div>\n        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">\n          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">Anthropic API klíč</label>\n          <input id="mfSetAnthro" type="password" placeholder="sk-ant-…" value="${t(localStorage.getItem("mf_anthropic_key")||"")}"\n            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:monospace;">\n          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;">Potřeba pro AI doporučení. Získej na <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style="color:rgba(0,122,255,0.7);">console.anthropic.com</a></div>\n        </div>\n\n        \x3c!-- AI Source stats --\x3e\n        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 14px;">\n          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n            <span style="font-size:0.68rem;font-weight:600;color:rgba(255,255,255,0.5);">✦ AI Source statistiky</span>\n            <button id="mfResetAiStats" style="font-size:0.6rem;background:transparent;border:none;color:rgba(255,100,100,0.6);cursor:pointer;padding:2px 6px;">Reset</button>\n          </div>\n          <div id="mfAiStatsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;"></div>\n        </div>\n      </div>\n\n      \x3c!-- Save button --\x3e\n      <div style="padding:24px 24px 0;">\n        <button id="mfSetSave" style="width:100%;padding:16px;border-radius:16px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.9rem;font-weight:700;cursor:pointer;letter-spacing:-0.2px;">Uložit nastavení</button>\n      </div>\n    `, s.appendChild(r), document.body.appendChild(s),
            function() {
              if (document.getElementById("mfSettStyle")) return;
              const e = document.createElement("style");
              e.id = "mfSettStyle", e.textContent = "\n      @keyframes mfSettFade { from{opacity:0} to{opacity:1} }\n      @keyframes mfSettUp { from{transform:translateY(40px);opacity:0} to{transform:none;opacity:1} }\n      #mfBeautifulSettings input::placeholder { color:rgba(255,255,255,0.2); }\n      #mfBeautifulSettings *::-webkit-scrollbar { width:3px; }\n      #mfBeautifulSettings *::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12);border-radius:3px; }\n    ", document.head.appendChild(e)
            }(),
            function(e) {
              const v = document.createElement("div");
              v.id = "mfVersionLine", v.style.cssText = "text-align:center;font-size:11px;color:rgba(255,255,255,0.35);padding:18px 0 0", v.textContent = "MůjFlix v" + (window.MF_VERSION || "?"), (e.firstElementChild || e).appendChild(function() {
                const r = document.createElement("label");
                r.id = "mfAnimeRow", r.style.cssText = "display:flex;align-items:center;gap:10px;padding:16px 24px 0;font-size:13px;color:rgba(255,255,255,0.8);cursor:pointer";
                const c = document.createElement("input");
                c.type = "checkbox", c.id = "mfAnimeToggle", c.checked = !!(window.mfLikesAnime && window.mfLikesAnime()), c.onchange = () => {
                  const p = _getProfiles(), id = getActiveProfileId(), pr = p.find(x => x.id === id);
                  pr && (pr.prefs = { ...pr.prefs, likesAnime: c.checked }, _saveProfiles(p), window.dispatchEvent(new Event("mf:profile-changed")), "function" == typeof refreshUserContent && refreshUserContent(), "function" == typeof showToast && showToast(c.checked ? "Anime se přimíchá do doporučení" : "Anime se už nepřimíchává"))
                };
                const t = document.createElement("span");
                return t.textContent = "Přimíchávat anime do doporučení", r.append(c, t), r
              }());
              (e.firstElementChild || e).appendChild(v);
              e.querySelector("#mfSetClose").onclick = () => e.remove(), e.addEventListener("click", t => {
                t.target === e && e.remove()
              }),  e.querySelector("#mfResetAiStats").onclick = () => {
                window.CinAI && (CinAI.resetStats(), n(), "function" == typeof showToast && showToast("AI statistiky vynulovány"))
              }, e.querySelectorAll("input").forEach(e => {
                e.addEventListener("focus", () => e.style.borderColor = "rgba(0,122,255,0.45)"), e.addEventListener("blur", () => e.style.borderColor = "rgba(255,255,255,0.09)")
              }), e.querySelector("#mfSetSave").onclick = () => {
                const n = e.querySelector("#mfSetTmdb").value.trim();
                n ? safeSetItem("mf_tmdb_key", n) : localStorage.removeItem("mf_tmdb_key"), TMDB_KEY = mfTmdbKey(), window.TMDB_KEY = TMDB_KEY;
                const a = e.querySelector("#mfSetAnthro").value.trim();
                a ? safeSetItem("mf_anthropic_key", a) : localStorage.removeItem("mf_anthropic_key"), e.remove(), "function" == typeof showToast && showToast("✅ Nastavení uloženo!", "success")
              }
            }(s), n()
        }()
      }
    }
  }(),
  function() {
    window.openSettings;
    window.openSettings = function() {
      MFSettings.open()
    }
  }();
