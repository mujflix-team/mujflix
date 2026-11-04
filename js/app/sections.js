/* Klíče podle profilu, sekce a adresy (#serialy …). Část původního app.js, načítá se v tomto pořadí (viz index.html). */
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
    /* Jednorázový úklid: klíče AI služeb ze starého hledání (Finder), dnes se nepoužívají */
    try {
      ["mf_gemini_key", "mf_or_key", "mf_groq_key", "mf_anthropic_key", "mf_jina_key", "mf_tavily_key", "mf_cin_ai_stats"].forEach(k => {
        localStorage.removeItem(k);
        Object.keys(localStorage).filter(x => x.indexOf(k + "_") === 0).forEach(x => localStorage.removeItem(x))
      })
    } catch (e) {}
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
        window.MFProfileSettings && window.MFProfileSettings.open()
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
          ["openWatchlist", "#watchlist"]
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
        n(), t() /* adresa zůstává čistá, žádné #serialy */
      }, 900)
    })
  }(), function() {
    let e = "serialy";
    window.mfShowSection = function(t) {
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
  });
