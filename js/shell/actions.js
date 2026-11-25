/* MůjFlix — centrální mapa akcí pro CSP bez 'unsafe-inline'.
 * Všechny inline handlery (onclick, onchange, oninput, onkeydown, onkeyup, onerror)
 * se nahrazují atributy data-act="název" + data-arg="hodnota".
 * Delegovaný listener v core.js volá ACTIONS[act](element, arg). */

import { escapeHTML } from '../core/utils.js'; // pokud existuje, jinak lokální

// Lokální escape pro případ, že utils není načten
function esc(s) {
  return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
}

// Pomocná: bezpečné volání globálních funkcí (mohou ještě neexistovat při startu)
function call(fnName, ...args) {
  if (typeof window[fnName] === 'function') {
    return window[fnName](...args);
  }
  return undefined;
}

// Pomocná: najít nejbližší prvek s data-act (pro delegaci)
function findActionTarget(el) {
  while (el && el !== document) {
    if (el.hasAttribute && el.hasAttribute('data-act')) return el;
    el = el.parentElement;
  }
  return null;
}

// ==================== AKCE ====================

export const ACTIONS = {

  /* --- Profilová brána (ProfileGate) --- */

  // PIN vstup: data-arg = "0".."9" | "back"
  'pin-input': (el, arg) => {
    call('ProfileGate?.pinInput', arg);
  },

  // PIN digit navigace (Enter/šipky): data-arg = index 0..3
  'pin-digit-nav': (el, arg) => {
    call('ProfileGate?.pinDigitNav', el, Number(arg));
  },

  // Přepnout režim správy profilů
  'toggle-manage-mode': () => {
    call('ProfileGate?.toggleManageMode');
  },

  // Otevřít vytvoření/úpravu profilu: data-arg = profileId (nebo prázdné pro nový)
  'open-create-profile': (el, arg) => {
    call('ProfileGate?.openCreate', arg || null);
  },

  // Smazat profil z editace
  'delete-from-edit': () => {
    call('ProfileGate?.deleteFromEdit');
  },

  // Zavřít vytvoření profilu
  'close-create-profile': () => {
    call('ProfileGate?.closeCreate');
  },

  // Uložit profil
  'save-profile': () => {
    call('ProfileGate?.saveProfile');
  },

  // Vybrat avatar (emoji/obrázek): data-arg = avatar URL/emoji, data-name = název
  'pick-avatar': (el, arg) => {
    const name = el.dataset.name || '';
    call('ProfileGate?.pickAvatar', arg, name, el);
  },

  // Přepnout avatar picker
  'toggle-avatar-picker': () => {
    call('ProfileGate?.toggleAvatarPicker');
  },

  // Vybrat barvu profilu: data-arg = barva, přidá .selected na kliknutý
  'pick-color': (el, arg) => {
    call('ProfileGate?._pickColor', arg, el);
  },

  // Vybrat emoji: data-arg = emoji, přidá .selected
  'pick-emoji': (el, arg) => {
    call('ProfileGate?._pickEmoji', arg, el);
  },

  // Hledání v avatar pickeru: data-arg = query (nebo prázdné pro reset)
  'search-avatar': (el, arg) => {
    call('ProfileGate?.searchAvatarTitles', arg || '');
  },

  // Načíst avatar picker znovu (retry tlačítko)
  'load-avatar-picker': () => {
    call('ProfileGate?.loadAvatarPicker');
  },

  // Zavřít PIN modal
  'close-pin': () => {
    call('ProfileGate?.closePin');
  },

  // Zavřít profil gate
  'close-profile-gate': () => {
    call('ProfileGate?.hide');
  },

  // Vybrat profil: data-arg = profileId
  'select-profile': (el, arg) => {
    call('ProfileGate?.selectProfile', arg);
  },

  // Smazat profil: data-arg = profileId
  'remove-profile': (el, arg) => {
    call('ProfileGate?.removeProfile', arg);
  },

  // Onboarding: přeskočit žánry
  'skip-onboarding-genres': () => {
    call('ProfileGate?.skipOnboardingGenres');
  },

  // Onboarding: dokončit
  'finish-onboarding': () => {
    call('ProfileGate?.finishOnboarding');
  },

  // Onboarding: propojit zařízení
  'onboarding-link': (el, arg) => {
    call('ProfileGate?.onboardingLink', arg);
  },

  // Žánrový editor
  'toggle-genre': (el) => {
    el.classList.toggle('selected');
  },

  'save-genre-prefs': () => {
    call('saveGenrePrefs');
  },

  'close-genre-editor': (el) => {
    if (event?.target === el) call('closeGenreEditor');
  },

  /* --- Hlavní navigace / Dock --- */

  // Otevřít univerzum (vyhledávání/Objevování)
  'open-universe': (el) => {
    call('openUniverse');
  },

  // Zavřít univerzum
  'close-universe': () => {
    call('closeUniverse');
  },

  // Nastavit aktivní dock tlačítko: data-arg = dockId
  'set-dock-active': (el, arg) => {
    call('setDockActive', arg);
  },

  // Zavřít "více" v docku
  'close-dock-more': () => {
    call('closeDockMore');
  },

  // PWA instalace
  'trigger-pwa-install': () => {
    call('triggerPwaInstall');
  },

  // Otevřít Objevování s typem: data-arg = "tv" | "movie" | "all" [, data-genre]
  'discover-open': (el, arg) => {
    const genre = el.dataset.genre || null;
    call('mfDiscoverOpen', arg, genre);
  },

  // Domů dock tlačítko: složitá logika (retap, show home section, close universe)
  'dock-home': () => {
    if (call('mfHomeRetap') && call('mfHomeRetap')) return;
    call('setDockActive', 'dockHome');
    if (typeof window.mfShowHomeSection === 'function') {
      call('mfShowHomeSection');
    } else if (typeof window.mfShowSection === 'function') {
      call('mfShowSection', 'serialy');
    }
    call('closeUniverse');
  },

  // Zobrazit Home sekci
  'show-home-section': () => {
    call('mfShowHomeSection');
  },

  // Zobrazit sekci: data-arg = "serialy" | "filmy" | "protebe"
  'show-section': (el, arg) => {
    call('mfShowSection', arg);
  },

  // Jít domů (logo klik)
  'go-home': () => {
    call('mfGoHome');
  },

  // Home retap (dvojklik na logo/dock Home)
  'home-retap': () => {
    return call('mfHomeRetap');
  },

  // Toggle profilové menu
  'toggle-profile-menu': (el) => {
    call('mfToggleProfileMenu', el);
  },

  // Logo -> Profil gate
  'logo-to-gate': (el) => {
    call('mfLogoToGate', el);
  },

  /* --- Watchlist / Oblíbené --- */

  'open-watchlist': () => {
    call('openWatchlist');
  },

  'close-watchlist': () => {
    call('closeWatchlist');
  },

  // Přepnout filtr: data-arg = "all" | "movie" | "series" | "newep"
  'wl-set-filter': (el, arg) => {
    call('wlSetFilter', arg);
  },

  // Přepnout řazení: data-arg = hodnota selectu
  'wl-set-sort': (el, arg) => {
    call('wlSetSort', arg);
  },

  // Hledat v oblíbených: data-arg = query
  'wl-search': (el, arg) => {
    call('wlSearch', arg);
  },

  // Přepnout položku v oblíbených: data-arg = slug/key
  'toggle-watchlist-item': (el, arg) => {
    call('toggleWatchlistItem', arg);
  },

  // Označit/sezonu: data-arg = season číslo (nebo auto z kontextu)
  'toggle-season-watched': (el, arg) => {
    call('toggleSeasonWatched', arg);
  },

  // Zobrazit/skrýt všechny epizody
  'toggle-show-all': () => {
    call('toggleShowAll');
  },

  // Přejít na další epizodu (Pokračovat)
  'jump-to-next': () => {
    call('jumpToNext');
  },

  // Shuffle epizoda
  'shuffle-episode': () => {
    call('shuffleEpisode');
  },

  /* --- Detail seriálu / Tabs --- */

  // Přepnout tab: data-arg = "eps" | "sim" | "info"
  'sd-tab': (el, arg) => {
    call('_sdTab', arg);
  },

  /* --- Hodnocení epizody/filmu --- */

  // Odložit hodnocení
  'submit-rating': (el, arg) => {
    call('submitRating', arg);
  },

  // Zavřít hodnocení
  'close-rating': (el, arg) => {
    const force = arg === 'true';
    call('closeRating', force);
  },

  // Potvrdit dialog
  'confirm-ok': () => {
    call('confirmOk');
  },

  'confirm-cancel': () => {
    call('confirmCancel');
  },

  // Epizodické hodnocení
  'close-ep-rating': (el, arg) => {
    const save = arg !== 'false';
    call('closeEpRating', save);
  },

  'save-ep-rating': () => {
    call('saveEpRating');
  },

  /* --- TMDB Avatar picker (v detailu) --- */

  'tmdb-set-tab': (el, arg) => {
    call('_tmdbSetTab', arg);
  },

  'tmdb-av-search': () => {
    call('_tmdbAvSearch');
  },

  'tmdb-av-close': () => {
    call('_tmdbAvClose');
  },

  'tmdb-av-confirm': () => {
    call('_tmdbAvConfirm');
  },

  /* --- Homepage karty --- */

  // Otevřít kartu: data-cid, data-idx, data-key
  'open-card': (el, arg) => {
    const cid = el.dataset.cid;
    const idx = el.dataset.idx;
    call('mfhOpenIdx', cid, idx ? Number(idx) : 0);
  },

  // Přepnout oblíbené: data-cid, data-idx
  'toggle-favorite': (el, arg) => {
    const cid = el.dataset.cid;
    const idx = el.dataset.idx;
    call('mfhToggleFav', el, cid, idx ? Number(idx) : 0);
  },

  // Dokončit/odebrat z pokračování: data-key
  'finish-item': (el, arg) => {
    const key = el.dataset.key;
    call('mfhFinishItem', key);
  },

  // Zrušit TMDB preview v profilové bráně
  'cancel-tmdb-preview': () => {
    ProfileGate._selectedAvatarUrl = null;
    ProfileGate._selectedAvatarName = null;
    const preview = document.getElementById('pcTmdbPreview');
    if (preview) preview.remove();
  },

  /* --- Sdílení / Trailer / Cinema --- */

  'share-current': () => {
    call('mfShareCurrent');
  },

  'play-trailer': (el, arg) => {
    // arg = "tv|movie", data-tmdb-id = tmdbId
    const tmdbId = el.dataset.tmdbId || el.dataset.tid || '';
    call('mfPlayTrailer', arg, tmdbId ? Number(tmdbId) : null);
  },

  // Cinema mode zavření (z titleurl.js bridge)
  'close-cinema': () => {
    call('mfhCloseCinema') || call('closeCinema');
  },

  // Zavřít next episode overlay v cinema modu
  'close-next-ep-overlay': () => {
    const overlay = document.getElementById('cinNextEpOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  // Zkusit znovu (offline stránka)
  'retry-offline': () => {
    location.reload();
  },

  /* --- Ostatní --- */

  // Zavřít modal (generic)
  'close-modal': () => {
    call('closeModal');
  },

  // Zavřít nastavení/sync atd.
  'close-dock-more': () => {
    call('closeDockMore');
  },
};

// ==================== DELEGOVANÝ LISTENER ====================

let _actionsListenerAttached = false;

export function attachActionsListener() {
  if (_actionsListenerAttached) return;
  _actionsListenerAttached = true;

  // Click delegace
  document.addEventListener('click', (e) => {
    const target = findActionTarget(e.target);
    if (!target) return;

    const act = target.dataset.act;
    const arg = target.dataset.arg;
    const handler = ACTIONS[act];
    if (handler) {
      // Prevent default pro <a> a button type=submit
      if (target.tagName === 'A' || (target.tagName === 'BUTTON' && target.type === 'submit')) {
        e.preventDefault();
      }
      handler(target, arg);
    }
  }, true); // capture phase - chytí i dynamicky přidané prvky

  // Input/Change/Keydown/Keyup delegace (pro formuláře)
  document.addEventListener('input', (e) => {
    const target = findActionTarget(e.target);
    if (!target) return;
    const act = target.dataset.act;
    const handler = ACTIONS[act];
    if (handler && (act.startsWith('wl-') || act === 'search-avatar' || act === 'toggle-genre' || act === 'pin-digit-nav')) {
      handler(target, target.value);
    }
  }, true);

  document.addEventListener('change', (e) => {
    const target = findActionTarget(e.target);
    if (!target) return;
    const act = target.dataset.act;
    const handler = ACTIONS[act];
    if (handler && (act === 'wl-set-sort' || act.startsWith('pick-'))) {
      handler(target, target.value);
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    const target = findActionTarget(e.target);
    if (!target) return;
    const act = target.dataset.act;
    const handler = ACTIONS[act];
    // Enter/Space pro role="button" prvky
    if (handler && (act === 'open-universe' || act === 'logo-to-gate' || act === 'go-home' || act === 'open-card')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler(target, target.dataset.arg);
      }
    }
    // PIN digit navigace
    if (act === 'pin-digit-nav' && e.key === 'Enter') {
      handler(target, target.dataset.arg);
    }
  }, true);

  document.addEventListener('keyup', (e) => {
    const target = findActionTarget(e.target);
    if (!target) return;
    const act = target.dataset.act;
    const handler = ACTIONS[act];
    if (handler && act === 'pin-digit-nav') {
      handler(target, target.dataset.arg);
    }
  }, true);

  // Error na obrázcích (capture - bubbluje)
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
      const act = e.target.dataset.act;
      if (act === 'img-error-hide') {
        e.target.style.display = 'none';
      } else if (act === 'img-error-remove') {
        e.target.remove();
      }
    }
  }, true);

  console.log('[MůjFlix] Actions listener attached, CSP ready for script-src without unsafe-inline');
}

// Auto-attach při načtení modulu (pokud už je document ready)
if (document.readyState !== 'loading') {
  attachActionsListener();
} else {
  document.addEventListener('DOMContentLoaded', attachActionsListener, { once: true });
}