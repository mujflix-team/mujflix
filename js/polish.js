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

  function init() {
    setTimeout(checkHomeLoaded, 14000);
    setInterval(function () {
      var err = document.getElementById('mfHomeError');
      if (err && document.querySelector('#nfRows .nf-row:not([hidden]) .nf-card:not(.nf-card-sk)')) err.remove();
    }, 3000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
