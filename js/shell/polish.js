/* Chybový stav úvodní stránky (výpadek sítě / TMDB). */
(function () {
  'use strict';
  /* --- Úvodní stránka se nenačetla (výpadek TMDB / sítě): jednotný chybový stav s tlačítkem --- */
  function checkHomeLoaded() {
    var hero = document.getElementById('nfHero'), rows = document.getElementById('nfRows');
    if (!hero || !rows || !document.documentElement.classList.contains('mfh-home-on')) return;
    if (document.getElementById('mfHomeError')) return;
    var loaded = !hero.classList.contains('nf-hero-empty') || rows.querySelector('.nf-row:not([hidden]) .nf-card:not(.nf-card-sk)');
    if (loaded) return;
    var gate = document.getElementById('mfProfileGate');
    if (gate && getComputedStyle(gate).display !== 'none' && gate.offsetHeight > 0) return;
    var e = document.createElement('div');
    e.id = 'mfHomeError'; e.className = 'mf-empty';
    e.innerHTML = '<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/></svg>' +
      '<div class="mf-empty-title">Nabídku se nepodařilo načíst</div>' +
      '<div class="mf-empty-sub">Zkontroluj připojení k internetu a zkus to znovu.</div>' +
      '<button type="button" class="mf-empty-btn">Zkusit znovu</button>';
    e.querySelector('button').addEventListener('click', function () { location.reload(); });
    rows.insertBefore(e, rows.firstChild);
  }


  /* --- Šipky pro vodorovně posuvné řady (žánry, řady v Procházení, rychlé procházení) --- */
  var SVG_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var SVG_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  function attachArrows(sc) {
    if (!sc || sc._mfArr || !sc.parentElement) return;
    sc._mfArr = true;
    var host = sc.parentElement;
    if (getComputedStyle(host).position === 'static') host.classList.add('mf-arr-host');
    var l = document.createElement('button'), r = document.createElement('button');
    l.type = r.type = 'button'; l.className = 'mf-arr l'; r.className = 'mf-arr r';
    l.setAttribute('aria-label', 'Posunout doleva'); r.setAttribute('aria-label', 'Posunout doprava');
    l.innerHTML = SVG_L; r.innerHTML = SVG_R;
    host.appendChild(l); host.appendChild(r);
    function upd() {
      var max = sc.scrollWidth - sc.clientWidth;
      var top = sc.offsetTop + 'px', h = sc.offsetHeight + 'px';
      l.style.top = r.style.top = top; l.style.height = r.style.height = h;
      l.classList.toggle('show', sc.scrollLeft > 4);
      r.classList.toggle('show', sc.scrollLeft < max - 4);
    }
    l.addEventListener('click', function () { sc.scrollBy({ left: -sc.clientWidth * 0.8, behavior: 'smooth' }); });
    r.addEventListener('click', function () { sc.scrollBy({ left: sc.clientWidth * 0.8, behavior: 'smooth' }); });
    sc.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    if (window.ResizeObserver) { try { new ResizeObserver(upd).observe(sc); } catch (e) { /* bez pozorování velikosti se šipky jen aktualizují při posunu */ } }
    setTimeout(upd, 300); setTimeout(upd, 1500);
  }
  function scanArrows(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches && root.matches('.dv-chips, .nf-quick')) attachArrows(root);
    root.querySelectorAll('.dv-chips, .nf-quick').forEach(attachArrows);
  }
  function initArrows() {
    scanArrows(document);
    var uo = document.getElementById('universeOverlay');
    if (uo && window.MutationObserver) {
      new MutationObserver(function (ms) {
        ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) scanArrows(n); }); });
      }).observe(uo, { childList: true, subtree: true });
    }
  }

  /* Splash s logem zmizí, jakmile je aplikace připravená (nebo nejpozději po 2 s) */
  function hideSplash() {
    var sp = document.getElementById('mfSplash');
    if (!sp) return;
    sp.classList.add('out');
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 250);
  }
  setTimeout(hideSplash, 2000);
  window.addEventListener('load', function () { setTimeout(hideSplash, 250); });

  /* Bez připojení: celá obrazovka „Jsi offline“ místo výběru profilu a prázdných řad. Po obnovení spojení se stránka načte sama. */
  function netBar() {
    var scr = document.getElementById('mfOfflineScreen');
    if (navigator.onLine) { if (scr) { scr.remove(); location.reload(); } return; }
    if (scr) return;
    scr = document.createElement('div');
    scr.id = 'mfOfflineScreen'; scr.setAttribute('role', 'alert');
    scr.innerHTML = '<div class="mf-off-box"><p class="mf-off-brand">Můj<i>Flix</i></p><h1>Jsi offline</h1>' +
      '<p>Nepodařilo se připojit k internetu. Zkontroluj Wi-Fi nebo data, stránka se načte sama, jakmile se spojení vrátí.</p>' +
      '<button type="button" class="mf-off-btn">Zkusit znovu</button></div>';
    scr.querySelector('button').addEventListener('click', function () { if (navigator.onLine) location.reload(); else { var b = scr.querySelector('button'); b.textContent = 'Pořád bez připojení'; setTimeout(function () { b.textContent = 'Zkusit znovu'; }, 1800); } });
    document.body.appendChild(scr);
  }
  window.addEventListener('online', netBar); window.addEventListener('offline', netBar);


  /* Procházení: řada filtrů a žánrů se při posouvání dolů plynule schová, při posunu nahoru nebo po chvíli klidu se vrátí */
  (function () {
    var last = 0, idle = 0;
    document.addEventListener('scroll', function (e) {
      var t = e.target;
      if (!t || t.id !== 'dvBody') return;
      var root = document.getElementById('universeOverlay'); if (!root) return;
      var y = t.scrollTop, dy = y - last;
      if (y > 70 && dy > 5) root.classList.add('dv-collapsed');
      else if (dy < -5 || y <= 10) root.classList.remove('dv-collapsed');
      last = y;
      clearTimeout(idle);
      idle = setTimeout(function () { root.classList.remove('dv-collapsed'); }, 1400);
    }, true);
  })();


  /* Plynulé objevení obrázků z TMDB: během načítání shimmer, po načtení jemné rozsvícení s malým zpožděním podle pořadí karty.
     Obrázky z cache se ukážou hned (bez bliknutí). Třída mf-imgfx na <html> zapíná styly jen tehdy, když tento skript běží. */
  (function () {
    var SEL = '.ep-thumb img, .sd-sim-poster img, .sd-actor-photo img, .dv-poster img';
    document.documentElement.classList.add('mf-imgfx');
    function done(im) { im.classList.add('is-loaded'); }
    function prep(im) {
      if (im._mfFx) return; im._mfFx = true;
      var card = im.closest('.episode-card, .sd-sim-card, .sd-actor, .dv-card');
      if (card && card.parentElement) {
        var idx = Array.prototype.indexOf.call(card.parentElement.children, card);
        im.style.setProperty('--i', String(Math.min(Math.max(idx, 0), 14)));
      }
      if (im.complete && (im.naturalWidth > 0 || !im.getAttribute('src'))) { done(im); return; }
      im.addEventListener('load', function () { done(im); }, { once: true });
      im.addEventListener('error', function () { done(im); }, { once: true });
    }
    function scan(root) {
      if (!root || root.nodeType !== 1) return;
      if (root.matches && root.matches(SEL)) prep(root);
      if (root.querySelectorAll) root.querySelectorAll(SEL).forEach(prep);
    }
    if (window.MutationObserver) {
      new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(scan); }); })
        .observe(document.documentElement, { childList: true, subtree: true });
    }
    scan(document.documentElement);
  })();


  /* Vlastní posuvník stránky (jen myš): neabírá šířku, ukáže se při posouvání a když najedeš myší k pravému okraji; jde táhnout i kliknout do dráhy.
     Posouvá se úvodní stránka (#mfSectionHome) nebo celé okno, podle toho, co se právě opravdu posouvá. */
  (function () {
    if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var bar, thumb, hideT, drag = null, de = document.documentElement;
    function blocked() {
      return !!document.querySelector('#universeOverlay.open, #watchlistOverlay.open, #seriesModal.open, #mfStandaloneCinema.open, #mfhSeeAllModal.open, #mfProfileGate.show');
    }
    function scroller() {
      if (blocked()) return null;
      var h = document.getElementById('mfSectionHome');
      var hs = h && getComputedStyle(h);
      if (h && hs.display !== 'none' && hs.visibility !== 'hidden' && hs.overflowY !== 'hidden' && h.scrollHeight > h.clientHeight + 4) return h;
      if (getComputedStyle(document.body).overflowY === 'hidden' || getComputedStyle(de).overflowY === 'hidden') return null;
      return de.scrollHeight > innerHeight + 4 ? de : null;
    }
    function pos(sc) { return sc === de ? window.scrollY : sc.scrollTop; }
    function view(sc) { return sc === de ? innerHeight : sc.clientHeight; }
    function to(sc, y, smooth) { if (sc === de) window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' }); else sc.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' }); }
    function update() {
      if (!bar) return;
      var sc = scroller();
      if (!sc) { bar.style.display = 'none'; return; }
      var vh = view(sc), sh = sc.scrollHeight, th = Math.max(56, vh * vh / sh), top = (pos(sc) / Math.max(1, sh - vh)) * (vh - th);
      bar.style.display = ''; thumb.style.height = th + 'px'; thumb.style.transform = 'translateY(' + Math.max(0, Math.min(vh - th, top)) + 'px)';
    }
    function flash() {
      if (!bar) return;
      bar.classList.add('on'); clearTimeout(hideT);
      hideT = setTimeout(function () { if (!drag && !bar.matches(':hover')) bar.classList.remove('on'); }, 1200);
    }
    function onScroll() { update(); if (scroller()) flash(); }
    function init() {
      bar = document.createElement('div'); bar.id = 'mfSB'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
      thumb = bar.firstChild; document.body.appendChild(bar);
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('scroll', function (e) { if (e.target && e.target.id === 'mfSectionHome') onScroll(); }, true);
      window.addEventListener('resize', update);
      document.addEventListener('mousemove', function (e) {
        var sc = scroller();
        if (drag) { var sh = drag.sc.scrollHeight, vh = view(drag.sc), th = thumb.offsetHeight; to(drag.sc, drag.y0 + (e.clientY - drag.my) * (sh - vh) / Math.max(1, vh - th)); return; }
        if (sc && e.clientX > innerWidth - 26) { update(); flash(); }
      }, { passive: true });
      thumb.addEventListener('mousedown', function (e) { var sc = scroller(); if (!sc) return; e.preventDefault(); drag = { sc: sc, my: e.clientY, y0: pos(sc) }; bar.classList.add('on', 'drag'); });
      document.addEventListener('mouseup', function () { if (drag) { drag = null; bar.classList.remove('drag'); flash(); } });
      bar.addEventListener('mousedown', function (e) {
        if (e.target === thumb) return;
        var sc = scroller(); if (!sc) return;
        var sh = sc.scrollHeight, vh = view(sc); to(sc, (e.clientY / vh) * (sh - vh), true);
      });
      if (window.ResizeObserver) { try { new ResizeObserver(update).observe(document.body); } catch (e) { /* bez pozorování se posuvník přepočítá při posunu */ } }
      setTimeout(update, 600); setInterval(update, 2500);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  })();

  function init() {
    netBar();
    var fv = document.getElementById('nfFootVer');
    if (fv) fv.textContent = 'v' + String(window.MF_VERSION || '').replace(/[^\w.\-]/g, '');
    initArrows();
    setTimeout(checkHomeLoaded, 14000);
    setInterval(function () {
      var err = document.getElementById('mfHomeError');
      if (err && document.querySelector('#nfRows .nf-row:not([hidden]) .nf-card:not(.nf-card-sk)')) err.remove();
    }, 3000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
