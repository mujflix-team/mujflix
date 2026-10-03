;

(function mfDockSync() {
  try {
    var IDS = ["dockHome", "dockFilmy", "dockProtebe", "dockProfile"];
    function shown(el) {
      if (!el) return false;
      var cs = getComputedStyle(el);
      return cs.display !== "none" && cs.visibility !== "hidden";
    }
    function has(id, cls) {
      var el = document.getElementById(id);
      return !!(el && el.classList.contains(cls));
    }
    function target() {
      var gate = document.getElementById("mfProfileGate");
      if (gate && shown(gate) && gate.offsetHeight > 0 && gate.style.display !== "none") return "dockProfile";
      if (has("universeOverlay", "open") && document.body.classList.contains("discover-open")) return "dockFilmy";
      if (has("watchlistOverlay", "visible")) return "dockProtebe";
      var pr = document.getElementById("mfSectionProtebe");
      if (document.body.classList.contains("mf-section-protebe") || (pr && pr.style.display === "block")) return "dockProtebe";
      return "dockHome";
    }
    function apply() {
      try {
        var id = target();
        IDS.forEach(function (d) {
          var b = document.getElementById(d);
          if (!b) return;
          var want = d === id;
          if (b.classList.contains("active") !== want) b.classList.toggle("active", want);
          if (want) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
        });
        if (typeof window.mfhUpdateDockVisibility === "function") window.mfhUpdateDockVisibility();
        document.querySelectorAll(".dock-btn.active").forEach(function (b) {
          if (IDS.indexOf(b.id) === -1) b.classList.remove("active");
        });
      } catch (e) {}
    }
    var timer = null;
    function sync(delay) {
      clearTimeout(timer);
      timer = setTimeout(apply, typeof delay === "number" ? delay : 60);
    }
    window.mfSyncDockToView = sync;
    window.mfDockTarget = target;
    function init() {
      ["universeOverlay", "watchlistOverlay", "mfProfileGate", "mfSectionProtebe", "seriesModal", "mfStandaloneCinema", "cinemaModal", "mfhSeeAllModal", "dockMoreSheet", "ratingOverlay"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) new MutationObserver(function () { sync(); }).observe(el, { attributes: true, attributeFilter: ["class", "style"] });
      });
      new MutationObserver(function () { apply(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
      var orig = window.setDockActive;
      if (typeof orig === "function") window.setDockActive = function () {
        var r = orig.apply(this, arguments);
        sync(140);
        return r;
      };
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") { sync(60); sync(420); } }, true);
      document.addEventListener("click", function () { sync(120); setTimeout(apply, 450); }, true);
      window.addEventListener("hashchange", function () { sync(); });
      window.addEventListener("popstate", function () { sync(); });
      setInterval(apply, 500);
      apply();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 0); });
    else init();
  } catch (err) { console.warn("[dock sync]", err); }
})();

;

(function mfSmartDock() {
  try {
    var dock, pill, badge, hidden = false, lastY = {}, ticking = false;

    function movePill() {
      if (!dock || !pill) return;
      var act = dock.querySelector(".dock-btn.active");
      if (!act || act.offsetWidth === 0) { pill.style.opacity = "0"; return; }
      pill.style.opacity = "1";
      pill.style.width = act.offsetWidth + "px";
      pill.style.height = act.offsetHeight + "px";
      pill.style.transform = "translate(" + act.offsetLeft + "px," + act.offsetTop + "px)";
    }

    function updateBadge() {
      if (!badge) return;
      var n = 0;
      try { n = (typeof getWatchlist === "function" ? getWatchlist() : []).length; } catch (e) {}
      badge.textContent = n > 99 ? "99+" : String(n);
      badge.classList.toggle("visible", n > 0);
    }

    function setHidden(h) {
      if (h === hidden || !dock) return;
      hidden = h;
      dock.classList.toggle("mf-dock-hidden", h);
    }

    function onScroll(e) {
      var t = e.target === document ? document.scrollingElement : e.target;
      if (!t || t.nodeType !== 1) return;
      if (t.scrollHeight - t.clientHeight < 120) return;
      var key = t.id || t.className || "doc";
      var y = t.scrollTop, prev = lastY[key];
      lastY[key] = y;
      if (prev === undefined) return;
      var d = y - prev;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (y < 80) setHidden(false);
        else if (d > 14) setHidden(true);
        else if (d < -10) setHidden(false);
      });
    }

    function onDockClick(e) {
      var btn = e.target.closest && e.target.closest(".dock-btn");
      if (!btn) return;
      var wasActive = btn.classList.contains("active");
      setHidden(false);
      if (!wasActive) return;
      setTimeout(function () {
        if (btn.id === "dockFilmy") {
          var inp = document.getElementById("dvSearch");
          var body = document.getElementById("dvBody");
          if (body) body.scrollTo({ top: 0, behavior: "smooth" });
          if (inp) inp.focus();
        } else if (btn.id === "dockHome") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          document.querySelectorAll(".mfh-wrap, #mfHome, .mfh-scroll").forEach(function (el) {
            if (el.scrollTo) el.scrollTo({ top: 0, behavior: "smooth" });
          });
        }
      }, 60);
    }

    function init() {
      dock = document.getElementById("mfDock");
      if (!dock) return;
      pill = document.createElement("div");
      pill.className = "mf-dock-pill";
      dock.insertBefore(pill, dock.firstChild);
      dock.classList.add("has-pill");
      var prot = document.getElementById("dockProtebe");
      if (prot) {
        badge = document.createElement("span");
        badge.className = "mf-dock-badge";
        prot.appendChild(badge);
      }
      new MutationObserver(function () { requestAnimationFrame(movePill); })
        .observe(dock, { attributes: true, subtree: true, attributeFilter: ["class"] });
      if (window.ResizeObserver) new ResizeObserver(function () { movePill(); }).observe(dock);
      window.addEventListener("resize", movePill);
      window.addEventListener("storage", updateBadge);
      if (typeof window.saveWatchlistData === "function") {
        var orig = window.saveWatchlistData;
        window.saveWatchlistData = function () {
          var r = orig.apply(this, arguments);
          updateBadge();
          return r;
        };
      }
      document.addEventListener("scroll", onScroll, { capture: true, passive: true });
      document.addEventListener("click", onDockClick, true);
      document.addEventListener("mousemove", function (e) {
        if (hidden && e.clientY > window.innerHeight - 70) setHidden(false);
      }, { passive: true });
      setTimeout(movePill, 300); setTimeout(movePill, 1200);
      updateBadge();
      setInterval(updateBadge, 5000);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  } catch (err) { console.warn("[smart dock]", err); }
})();
