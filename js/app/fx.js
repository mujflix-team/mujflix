/* Styly efektů a animací. Část původního app.js, načítá se v tomto pořadí (viz index.html). */
(function() {

  const style = document.createElement('style');
  style.id = 'mf-remake-styles';
  style.textContent = `
    /* SEASON GRID */
    .ssv-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
      gap: 10px !important;
      padding: 0 16px 32px !important;
    }
    .ssv-card {
      border-radius: 16px !important;
      border: 1px solid rgba(255,255,255,0.07) !important;
      background: rgba(255,255,255,0.04) !important;
      transition: transform 0.3s cubic-bezier(0.34,1.3,0.64,1), border-color 0.2s, box-shadow 0.3s !important;
    }
    /* OPRAVA: na dotyku (mobil/tablet) zůstává :hover "přilepený" po ťuknutí
       a dřív ho scroll náhodou smazal — teď hover funguje jen na zařízeních
       s opravdovou myší, na dotyku se karta nezvětšuje a nepřekáží. */
    @media (hover: hover) and (pointer: fine) {
      .ssv-card:hover {
        transform: translateY(-4px) !important;
        border-color: rgba(255,255,255,0.2) !important;
        box-shadow: 0 14px 32px rgba(0,0,0,0.55) !important;
      }
    }
    .ssv-card.ssv-active {
      border-color: var(--accent,#007aff) !important;
      box-shadow: 0 0 0 2px rgba(0,122,255,0.3), 0 16px 48px rgba(0,122,255,0.35) !important;
    }
    .ssv-play-btn {
      border-radius: 24px !important;
      padding: 10px 20px !important;
      background: rgba(255,255,255,0.95) !important;
      font-weight: 800 !important;
    }
    .ssv-num { font-size: 0.52rem !important; letter-spacing: 2px !important; }
    .ssv-name { font-size: 0.88rem !important; font-weight: 800 !important; }

    /* EPISODE LIST — horizontal rows */
    .episode-grid {
      display: flex !important;
      flex-direction: column !important;
      gap: 0 !important;
      padding: 8px 0 80px !important;
    }
    .episode-card {
      display: flex !important;
      flex-direction: row !important;
      align-items: flex-start !important;
      padding: 12px 16px !important;
      border-radius: 0 !important;
      border: none !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
      background: transparent !important;
      clip-path: none !important;
      min-height: 0 !important;
      gap: 0 !important;
      transition: background 0.18s ease !important;
    }
    .episode-card:hover {
      background: rgba(255,255,255,0.04) !important;
      clip-path: none !important;
      filter: none !important;
      z-index: 2 !important;
    }
    .episode-card:last-child { border-bottom: none !important; }
    .episode-card.watched { opacity: 0.38 !important; }
    .episode-card.watched:hover { opacity: 0.65 !important; }
    .episode-card.next-ep {
      background: rgba(0,122,255,0.06) !important;
    }
    .episode-card.next-ep::before {
      border-radius: 0 !important;
      width: 3px !important;
    }

    /* Thumbnail */
    .ep-thumb {
      width: 148px !important;
      min-width: 148px !important;
      aspect-ratio: 16/9 !important;
      border-radius: 10px !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
    }
    .ep-thumb::after { display: none !important; }
    .ep-thumb img {
      width: 100% !important; height: 100% !important;
      object-fit: cover !important;
      filter: brightness(0.78) saturate(0.82) !important;
      transition: transform 0.4s ease, filter 0.3s !important;
    }
    .episode-card:hover .ep-thumb img {
      transform: scale(1.06) !important;
      filter: brightness(1) saturate(1.1) !important;
    }
    .ep-hover-play {
      background: rgba(0,0,0,0.28) !important;
      opacity: 0 !important;
      transition: opacity 0.2s !important;
    }
    .episode-card:hover .ep-hover-play { opacity: 1 !important; }
    .ep-play-ring {
      width: 38px !important; height: 38px !important;
      border-radius: 50% !important;
      background: rgba(255,255,255,0.92) !important;
    }
    .ep-play-ring svg { margin-left: 2px !important; }

    /* Body */
    .ep-body {
      flex: 1 !important;
      padding: 2px 0 2px 14px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 3px !important;
      min-width: 0 !important;
    }
    .ep-num {
      font-size: 0.56rem !important;
      font-weight: 800 !important;
      color: rgba(255,255,255,0.3) !important;
      letter-spacing: 1.5px !important;
    }
    .ep-title {
      font-size: 0.86rem !important;
      font-weight: 700 !important;
      color: rgba(255,255,255,0.88) !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
    .episode-card:hover .ep-title { color: #fff !important; }
    /* OPRAVA: rozbalení popisku a tlačítek na hover dělalo řádek epizody
       vyšší, takže "přerůstal" přes sousední řádky. Na dotyku navíc hover
       zůstává "přilepený" po ťuknutí (scroll ho dřív náhodou smazal, teď
       ne) — proto se to celé zapíná jen na zařízeních se skutečnou myší. */
    @media (hover: hover) and (pointer: fine) {
      .episode-card:hover .ep-title { white-space: normal !important; }
    }
    .ep-desc {
      font-size: 0.68rem !important;
      color: rgba(255,255,255,0.38) !important;
      max-height: 0 !important; opacity: 0 !important; margin-top: 0 !important;
      transition: max-height 0.3s ease, opacity 0.25s ease, margin-top 0.25s ease !important;
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
    }
    @media (hover: hover) and (pointer: fine) {
      .episode-card:hover .ep-desc {
        max-height: 55px !important; opacity: 1 !important; margin-top: 4px !important;
      }
    }
    .ep-actions {
      max-height: 0 !important; opacity: 0 !important; margin-top: 0 !important;
      overflow: hidden !important;
      transition: max-height 0.28s ease, opacity 0.22s ease, margin-top 0.22s ease !important;
    }
    @media (hover: hover) and (pointer: fine) {
      .episode-card:hover .ep-actions {
        max-height: 36px !important; opacity: 1 !important;
        overflow: visible !important; margin-top: 8px !important;
      }
    }
    /* Na dotyku jsou tlačítka (přehrát / označit) vidět rovnou, bez hoveru */
    @media (hover: none), (pointer: coarse) {
      .ep-actions {
        max-height: 36px !important; opacity: 1 !important;
        overflow: visible !important; margin-top: 8px !important;
      }
      .ep-desc {
        max-height: 55px !important; opacity: 1 !important; margin-top: 4px !important;
      }
    }
    .ep-btn-play-hbo {
      border-radius: 20px !important;
      padding: 6px 16px !important;
      font-weight: 800 !important;
      font-size: 0.68rem !important;
    }
    .ep-btn-mark {
      width: 28px !important; height: 28px !important;
      border-radius: 50% !important;
    }

    /* Season section header (Vše mód) */
    .mf-season-header {
      font-size: 0.58rem !important;
      font-weight: 800 !important;
      color: rgba(255,255,255,0.22) !important;
      letter-spacing: 3px !important;
      text-transform: uppercase !important;
      padding: 18px 16px 8px !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    }

    /* Dock hide */
    body.modal-open #mfDock,
    body.modal-open .mf-dock,
    body.modal-open nav.mf-dock {
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(110%) !important;
      visibility: hidden !important;
      transition: all 0.25s ease !important;
    }

    /* Skrýt profil při otevřeném modalu */
    body.modal-open #mfProfileBadge,
    body.modal-open .mf-profile-badge {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.2s ease !important;
    }

    /* Profile badge — čtvereček */
    #mfProfileBadge { border-radius: 14px !important; }
    .mpb-avatar {
      width: 36px !important; height: 36px !important;
      border-radius: 10px !important; font-size: 1.3rem !important;
    }
    .mpb-avatar img { border-radius: 10px !important; width: 100% !important; height: 100% !important; object-fit: cover !important; }
  `;
  document.head.appendChild(style);

  const _origRenderEpisodes = window.renderEpisodes;
  window.renderEpisodes = async function() {
    await _origRenderEpisodes.apply(this, arguments);
    const grid = document.getElementById('episodesGrid');
    if (!grid) return;
    grid.querySelectorAll('div[style*="font-weight:700"], div[style*="font-weight: 700"]').forEach(el => {
      if (el.textContent.startsWith('Serie ') || el.textContent.startsWith('Série ')) {
        el.className = 'mf-season-header';
        el.style.cssText = '';
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('seriesModal');
    if (!modal) return;
    const obs = new MutationObserver(() => {
      const open = modal.classList.contains('open');
      document.body.classList.toggle('modal-open', open);
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
  });

})();
