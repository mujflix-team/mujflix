    (function () {
      'use strict';
      if (window._mfhInstalled) return;
      window._mfhInstalled = true;

      var _lastContinue = null;

      function esc(s) {
        return String(s == null ? '' : s)
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
      }

      var TMDB_BASE = 'https://api.themoviedb.org/3';
      var TMDB_IMG = 'https://image.tmdb.org/t/p';
      var _tmdbPromise = null, _tmdbKey = '';

      function getTmdbKey() {
        return localStorage.getItem('mf_tmdb_key') ||
          (typeof TMDB_KEY !== 'undefined' ? TMDB_KEY : '') ||
          window.TMDB_KEY || '';
      }

      function fetchTmdbData() {
        // Jen anime: obecné trendy a populární se nepoužijí, zbytečně se na ně neptáme
        if (window.mfOnlyAnime && window.mfOnlyAnime()) return Promise.resolve({ trending: [], tv: [], movies: [] });
        var ckey = String(window.MFAge ? window.MFAge.limit() : 0);
        if (_tmdbPromise && _tmdbKey === ckey) return _tmdbPromise;
        _tmdbKey = ckey;
        var TMDB_API_KEY = getTmdbKey();
        if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
          console.warn('[mfh] TMDB API klíč není nastaven');
          return Promise.resolve(null);
        }

        var lim = !!(window.MFAge && window.MFAge.limit()), N = lim ? 40 : 10;
        var gj = function (p) { return fetch(TMDB_BASE + p + (p.indexOf('?') < 0 ? '?' : '&') + 'api_key=' + encodeURIComponent(TMDB_API_KEY) + '&language=cs-CZ').then(function (r) { return r.json(); }); };
        var wj = function (p) { return window.MFAge ? window.MFAge.wide(p, gj) : gj(p); };
        _tmdbPromise = Promise.all([wj('/trending/all/week'), wj('/tv/popular'), wj("/movie/popular")]).then(function (parsed) {
          var trending = parsed[0];
          var tv = parsed[1];
          var movies = parsed[2];
          return {
            trending: (trending.results || []).slice(0, N),
            tv: (tv.results || []).slice(0, N),
            movies: (movies.results || []).slice(0, N)
          };
        }).catch(function (e) {
          console.warn('[mfh] TMDB fetch error:', e);
          _tmdbPromise = null;
          return null;
        });
        return _tmdbPromise;
      }

      function getPosterUrl(path, size) {
        if (!path) return null;
        return TMDB_IMG + '/' + (size || 'w300') + path;
      }

      function getBackdropUrl(path, size) {
        if (!path) return null;
        return TMDB_IMG + '/' + (size || 'w780') + path;
      }

      function mfhProfileScopedKey(base) {
        try {
          if (typeof uKey === 'function') return uKey(base);
        } catch (e) {}
        try {
          var pid = localStorage.getItem('mf_active_pid');
          return pid ? base + '_' + pid : base;
        } catch (e) {
          return base;
        }
      }

      function mfhReadJSON(key, fallback) {
        try {
          var raw = localStorage.getItem(key);
          if (!raw) return fallback;
          var parsed = JSON.parse(raw);
          return parsed == null ? fallback : parsed;
        } catch (e) {
          return fallback;
        }
      }

      function mfhGetWatchTimeline() {
        return mfhReadJSON(mfhProfileScopedKey('mf_watch_timeline'), []);
      }
      function mfhGetWatched() {
        return mfhReadJSON(mfhProfileScopedKey('mf_watched'), {});
      }
      function mfhGetPartialWatched() {
        return mfhReadJSON(mfhProfileScopedKey('mf_partial_watched'), {});
      }

      function mfhHasWatchHistory() {
        try {
          var timeline = mfhGetWatchTimeline();
          if (timeline && timeline.length) return true;
          var watched = mfhGetWatched();
          if (watched && Object.keys(watched).some(function (k) { return !!watched[k]; })) return true;
          var partial = mfhGetPartialWatched();
          if (partial && Object.keys(partial).length) return true;
        } catch (e) {}
        return false;
      }

      /* Pokračování: jen to, co uživatel opravdu pouštěl (seriály po nejvyšší zhlédnuté epizodě, filmy z kina).
         „Dokoukal jsem“ položku schová, dokud se u ní neobjeví nové sledování. */
      function mfhReadDone() { return mfhReadJSON(mfhProfileScopedKey('mf_cont_done'), {}); }
      function mfhWriteDone(o) { try { localStorage.setItem(mfhProfileScopedKey('mf_cont_done'), JSON.stringify(o)); } catch (e) {} }
      /* Film, který sis pustil a ještě „nedokoukal jsem“ neklikl (rozkoukaný). */
      window.mfhMovieStarted = function (tmdbId) {
        try {
          var id = String(tmdbId), done = mfhReadDone();
          return mfhMovies().some(function (m) { return String(m.tmdbId) === id; }) && !done['movie:' + id];
        } catch (e) { return false; }
      };
      function mfhMovies() { return mfhReadJSON(mfhProfileScopedKey('mf_cont_movies'), []); }
      function mfhWriteMovies(l) { try { localStorage.setItem(mfhProfileScopedKey('mf_cont_movies'), JSON.stringify(l.slice(-40))); } catch (e) {} }

      /* Po zahájení sledování se úvodní stránka obnoví, jakmile se zavře přehrávač/detail (ne až po reloadu) */
      var _nfDirty = false, _nfDirtyTimer = null;
      window.mfhResetSig = function () { _nfSig = ''; };
      window.mfhMarkDirty = function () {
        _nfDirty = true;
        if (_nfDirtyTimer) return;
        _nfDirtyTimer = setInterval(function () {
          if (!_nfDirty) { clearInterval(_nfDirtyTimer); _nfDirtyTimer = null; return; }
          var busy = ['mfStandaloneCinema', 'cinemaModal', 'seriesModal'].some(function (id) { var el = document.getElementById(id); return el && el.classList.contains('open'); });
          if (busy) return;
          _nfDirty = false; _nfSig = '';
          try { renderHomepage(); } catch (e) {}
        }, 1500);
      };

      window.mfRecordContinueMovie = function (tmdbId, title) {
        try {
          var id = String(tmdbId || '');
          if (!/^\d+$/.test(id)) return;
          var list = mfhMovies().filter(function (m) { return String(m.tmdbId) !== id; });
          var rec = { tmdbId: id, title: title || '', ts: Date.now(), poster: '', backdrop: '' };
          list.push(rec);
          mfhWriteMovies(list);
          window.mfhMarkDirty();
          if (typeof tmdbGet === 'function') tmdbGet('/movie/' + id + '?language=cs-CZ').then(function (d) {
            if (!d) return;
            var cur = mfhMovies();
            cur.forEach(function (m) {
              if (String(m.tmdbId) !== id) return;
              m.title = d.title || m.title;
              m.poster = d.poster_path ? 'https://image.tmdb.org/t/p/w342' + d.poster_path : m.poster;
              m.backdrop = d.backdrop_path ? 'https://image.tmdb.org/t/p/w780' + d.backdrop_path : m.backdrop;
            });
            mfhWriteMovies(cur);
          }).catch(function () {});
        } catch (e) {}
      };

      function mfhPl(n, a, b, c) { return n === 1 ? a : (n >= 2 && n <= 4 ? b : c); }
      /* „zbývá 8 epizod“ / „zbývají 3 série“ – bez minut */
      function mfhLeftText(slug, prog) {
        try {
          var left = Math.max(0, (prog.total || 0) - (prog.seen || 0));
          if (!left) return '';
          var w = (typeof getWatched === 'function') ? getWatched() : {}, seasons = 0;
          for (var a = 1; a <= totalSeasons(slug); a++) {
            for (var e = 1; e <= epsInSeason(slug, a); e++) { if (!w[slug + '-S' + a + '-E' + e]) { seasons++; break; } }
          }
          if (seasons > 1) return 'zbývá ' + seasons + ' ' + mfhPl(seasons, 'série', 'série', 'sérií');
          return 'zbývá ' + left + ' ' + mfhPl(left, 'epizoda', 'epizody', 'epizod');
        } catch (e) { return ''; }
      }

      function mfhContinueCandidates() {
        var out = [], done = mfhReadDone();
        try {
          var timeline = mfhGetWatchTimeline() || [];
          var last = {};
          timeline.forEach(function (t) { if (t && t.slug && (!last[t.slug] || (t.ts || 0) > last[t.slug])) last[t.slug] = t.ts || 0; });
          Object.keys(last).forEach(function (slug) {
            if (typeof db === 'undefined' || !db[slug]) return;
            if (done[slug] && done[slug] >= last[slug]) return;
            var next = (typeof findNextEp === 'function') ? findNextEp(slug) : null;
            if (!next) return;
            var show = db[slug], prog = (typeof calcProgress === 'function') ? calcProgress(slug) : { pct: 0 };
            var pct = prog.pct || 0, runtime = show.runtime || 22;
            out.push({
              kind: 'series', ts: last[slug], slug: slug, title: show.name,
              episode: 'S' + next.se + ' E' + (next.ep < 10 ? '0' + next.ep : next.ep),
              timeLeft: '', left: mfhLeftText(slug, prog),
              description: 'Pokračuj tam, kde jsi skončil/a.', progress: pct, image: show._poster || show.poster || show._backdrop
            });
          });
          mfhMovies().forEach(function (m) {
            if (m.done || (done['movie:' + m.tmdbId] && done['movie:' + m.tmdbId] >= (m.ts || 0))) return;
            out.push({
              kind: 'movie', ts: m.ts || 0, tmdbId: m.tmdbId, mediaType: 'movie', title: m.title || 'Film',
              episode: 'Film', timeLeft: '', description: '', progress: null, image: m.poster || m.backdrop || ''
            });
          });
        } catch (e) { console.warn('[mfh] continue candidates', e); }
        return out.sort(function (a, b) { return b.ts - a.ts; });
      }

      function mfhGetRealContinueItem() {
        var l = mfhContinueCandidates();
        return l.length ? l[0] : null;
      }

      window.mfhGetRealContinueItem = mfhGetRealContinueItem;
      window.mfhFinishContinue = function () {
        var it = _lastContinue || mfhGetRealContinueItem();
        if (!it) return;
        var done = mfhReadDone();
        done[it.kind === 'movie' ? 'movie:' + it.tmdbId : it.slug] = Date.now() + 1;
        mfhWriteDone(done);
        _lastContinue = null;
        _nfSig = '';
        try { if (typeof showToast === 'function') showToast('✓ Dokoukáno: ' + it.title); } catch (e) {}
        try { window.renderHomepage(); } catch (e) {}
      };

      var GENRE_LABELS = {
        28: 'Akční', 12: 'Dobrodružné', 16: 'Animované', 35: 'Komedie', 80: 'Krimi', 99: 'Dokumenty',
        18: 'Drama', 10751: 'Rodinné', 14: 'Fantasy', 36: 'Historické', 27: 'Horor', 9648: 'Mysteriózní',
        10749: 'Romantické', 878: 'Sci-Fi', 53: 'Thrillery', 10752: 'Válečné', 37: 'Westerny',
        10759: 'Akční a dobrodružné', 10765: 'Sci-Fi a fantasy', 10768: 'Válka a politika'
      };
      var HEART_PATH = 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z';
      var _nfRun = 0;
      var _nfSig = '';
      var _nfCache = {};

      function nfJson(path) {
        var ck = path + '|' + (window.MFAge ? window.MFAge.limit() : 0) + '|' + (mfhOnlyAnime() ? 1 : 0);
        if (_nfCache[ck]) return _nfCache[ck];
        var key = getTmdbKey();
        if (!key) return Promise.resolve(null);
        var ks = Object.keys(_nfCache);
        if (ks.length >= 40) delete _nfCache[ks[0]];
        var get = function (p) {
          return fetch(TMDB_BASE + p + (p.indexOf('?') < 0 ? '?' : '&') + 'api_key=' + encodeURIComponent(key) + '&language=cs-CZ')
            .then(function (r) { return r.json(); });
        };
        _nfCache[ck] = (window.MFAge ? window.MFAge.wide(path, get) : get(path))
          .catch(function () { delete _nfCache[ck]; return null; });
        return _nfCache[ck];
      }

      function nfItem(raw, type) {
        type = type || raw.media_type || (raw.title ? 'movie' : 'tv');
        return {
          title: raw.title || raw.name || 'Neznámé',
          image: getPosterUrl(raw.poster_path, 'w342'),
          backdrop: getBackdropUrl(raw.backdrop_path, 'w1280'),
          overview: raw.overview || '',
          rating: raw.vote_average || 0,
          ep: (raw.release_date || raw.first_air_date || '').substring(0, 4),
          genreIds: raw.genre_ids || [],
          tmdbId: raw.id,
          mediaType: type
        };
      }

      function nfItems(data, type) {
        return ((data && data.results) || []).filter(function (r) { return r && typeof r === 'object' && r.media_type !== 'person'; })
          .map(function (r) { return nfItem(r, type); })
          .filter(function (it) { return it.image; });
      }

      function nfActiveProfile() {
        try {
          var pid = localStorage.getItem('mf_active_pid');
          var list = JSON.parse(localStorage.getItem('mf_profiles_v2') || '[]');
          return list.filter(function (p) { return p && p.id === pid; })[0] || null;
        } catch (e) { return null; }
      }

      function nfRenderProfile() {
        var b = document.getElementById('nfAvatar');
        if (!b) return;
        var p = nfActiveProfile();
        var av = (p && p.avatar) || '🙂';
        if (/^https?:\/\//i.test(av)) {
          b.textContent = '';
          var im = document.createElement('img');
          im.src = av; im.alt = ''; im.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;';
          b.appendChild(im);
        } else {
          b.textContent = av;
        }
        b.title = p && p.name ? 'Profil: ' + p.name : 'Profil';
        if (p && p.color) b.style.setProperty('--nf-avatar', p.color);
      }

      /* Menu profilu vpravo nahoře (jako Netflix): rychlé přepnutí, Upravit profil, Spravovat profily */
      function mfCloseProfileMenu() {
        var m = document.getElementById('nfProfileMenu');
        if (m) m.remove();
        document.removeEventListener('pointerdown', mfProfileMenuOutside, true);
        document.removeEventListener('keydown', mfProfileMenuKey, true);
      }
      function mfProfileMenuOutside(e) {
        var m = document.getElementById('nfProfileMenu');
        if (m && !m.contains(e.target) && !(e.target.closest && e.target.closest('#nfAvatar'))) mfCloseProfileMenu();
      }
      function mfProfileMenuKey(e) { if (e.key === 'Escape') mfCloseProfileMenu(); }
      window.mfToggleProfileMenu = function (btn) {
        if (document.getElementById('nfProfileMenu')) return mfCloseProfileMenu();
        var cur = nfActiveProfile(), list = [];
        try { list = JSON.parse(localStorage.getItem('mf_profiles_v2') || '[]'); } catch (e) {}
        var avatarHtml = function (p) {
          var av = p.avatar || '🙂';
          return /^https?:\/\//i.test(av) ? '<img src="' + esc(av) + '" alt="" referrerpolicy="no-referrer">' : esc(av);
        };
        var others = list.filter(function (p) { return !cur || p.id !== cur.id; });
        var m = document.createElement('div');
        m.id = 'nfProfileMenu'; m.setAttribute('role', 'menu');
        m.innerHTML =
          (others.length ? others.map(function (p) {
            return '<button type="button" role="menuitem" class="nf-pm-item" data-pid="' + esc(p.id) + '"><span class="nf-pm-av" style="--c:' + esc(p.color || '#0a84ff') + '">' + avatarHtml(p) + '</span><span>' + esc(p.name || 'Profil') + '</span></button>';
          }).join('') + '<div class="nf-pm-sep"></div>' : '') +
          '<button type="button" role="menuitem" class="nf-pm-item nf-pm-act" data-act="manage"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M17 5v6M14 8h6"/></svg><span>Spravovat profily</span></button>' +
          '<button type="button" role="menuitem" class="nf-pm-item nf-pm-act" data-act="settings"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg><span>Nastavení</span></button>';
        document.body.appendChild(m);
        var r = btn.getBoundingClientRect();
        m.style.top = Math.round(r.bottom + 12) + 'px';
        m.style.right = Math.max(12, Math.round(window.innerWidth - r.right)) + 'px';
        m.addEventListener('click', function (e) {
          var it = e.target.closest && e.target.closest('.nf-pm-item');
          if (!it) return;
          mfCloseProfileMenu();
          if (it.dataset.pid) { if (window.ProfileGate) ProfileGate.selectProfile(it.dataset.pid); }
          else if (it.dataset.act === 'manage' && window.ProfileGate) { ProfileGate.show(); ProfileGate.toggleManageMode(); }
          else if (it.dataset.act === 'settings' && window.MFProfileSettings) MFProfileSettings.open();
        });
        setTimeout(function () {
          document.addEventListener('pointerdown', mfProfileMenuOutside, true);
          document.addEventListener('keydown', mfProfileMenuKey, true);
        }, 0);
      };

      window.nfRenderProfile = nfRenderProfile;

      /* Logo vlevo nahoře: zpátky na domovskou stránku a nahoru k banneru */
      window.mfGoHome = function () {
        try { if (typeof window.closeUniverse === 'function') window.closeUniverse(); } catch (e) {}
        try { var wo = document.getElementById('watchlistOverlay'); if (wo && (wo.classList.contains('open') || wo.classList.contains('visible')) && typeof window.closeWatchlist === 'function') window.closeWatchlist(); } catch (e) {}
        try { var sm = document.getElementById('seriesModal'); if (sm && sm.classList.contains('open') && typeof window.closeModal === 'function') window.closeModal(); } catch (e) {}
        /* Už jsme na domovské stránce → jen plynule nahoru (přepnutí sekce by skočilo skokem) */
        var onHome = document.documentElement.classList.contains('mfh-home-on') && !document.body.classList.contains('mf-section-protebe');
        try { if (!onHome && typeof window.mfShowSection === 'function') window.mfShowSection('serialy'); } catch (e) {}
        var h = document.getElementById('mfSectionHome');
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
        try { if (h && h.scrollTo) h.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
        try { if (window.mfDockReveal) window.mfDockReveal(); } catch (e) {}
      };

      /* Plynulé objevení obrázků: plakát se po načtení jemně rozsvítí (CSS .is-loaded); chyba načtení ho taky odkryje */
      (function () {
        var mark = function (e) {
          var t = e.target;
          if (t && t.tagName === 'IMG' && t.classList) t.classList.add('is-loaded');
        };
        document.addEventListener('load', mark, true);
        document.addEventListener('error', mark, true);
      })();

      /* Šipka u panelu Novinky míří na zvonek */
      function nfPlaceNotifArrow() {
        var p = document.getElementById('notifPanel'), b = document.getElementById('nfBellBtn');
        if (!p || !b || !p.classList.contains('open') || !p.classList.contains('visible')) return;
        var pr = p.getBoundingClientRect(), br = b.getBoundingClientRect();
        if (!pr.width || !br.width) return;
        var x = Math.max(16, Math.min(p.offsetWidth - 28, br.left + br.width / 2 - p.offsetLeft - 6));
        p.style.setProperty('--notif-arrow-x', x + 'px');
      }
      (function () {
        var p = document.getElementById('notifPanel');
        if (!p) return;
        new MutationObserver(function () { requestAnimationFrame(nfPlaceNotifArrow); }).observe(p, { attributes: true, attributeFilter: ['class'] });
        window.addEventListener('resize', nfPlaceNotifArrow);
      })();
      /* Při startu volá překreslení víc míst za sebou (profil, historie, oblíbené…); sloučí se do jednoho, ať řady neblikají víckrát */
      var _rhT = 0;
      window.renderHomepage = function () {
        clearTimeout(_rhT);
        _rhT = setTimeout(function () { try { renderHomepage(); } catch (e) {} }, 140);
      };
      // Po přepnutí/vytvoření profilu překresli doporučení až poté, co se načte paměť AI daného profilu
      window.addEventListener('mf:profile-changed', function () {
        setTimeout(function () { try { nfRenderProfile(); renderHomepage(); } catch (e) {} }, 300);
      });

      /* Srdíčko „Do oblíbených“ na kartě (stejné jako v Procházení); jen pro tituly z TMDB */
      function mfhFavInfo(it) {
        var id = it && (it.tmdbId || (it.fav && it.fav.tmdbId));
        if (!id || it.slug) return null;
        var type = (it.mediaType === 'tv' || (it.fav && it.fav.type === 'series')) ? 'tv' : 'movie';
        return { id: id, type: type };
      }
      function mfhFavButton(it, cid, idx) {
        var f = mfhFavInfo(it);
        if (!f || typeof isTmdbFavorite !== 'function') return '';
        var on = false;
        try { on = isTmdbFavorite(f.id, f.type); } catch (e) {}
        return '<button type="button" class="nf-fav' + (on ? ' on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '" title="' + (on ? 'Odebrat z Oblíbených' : 'Přidat do Oblíbených') + '" aria-label="Oblíbené: ' + esc(it.title) + '" onclick="event.stopPropagation(); mfhToggleFav(this, \'' + cid + '\', ' + idx + ')">' +
          '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12C19 16.6 12 21 12 21z"/></svg></button>';
      }
      window.mfhToggleFav = function (btn, cid, idx) {
        try {
          var track = document.getElementById(cid), it = track && track._mfhItems && track._mfhItems[idx], f = mfhFavInfo(it);
          if (!f || typeof toggleTmdbFavorite !== 'function') return;
          toggleTmdbFavorite(f.id, f.type, it.title, it.image || '', null);
          var on = isTmdbFavorite(f.id, f.type);
          btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false');
          btn.title = on ? 'Odebrat z Oblíbených' : 'Přidat do Oblíbených';
          _nfSig = ''; /* řada Oblíbené se při dalším vykreslení obnoví */
          if (document.getElementById('mfhMyListSection')) nfFillRow('mfhMyList', mfhMyListItems());
        } catch (e) {}
      };

      function mfhCardHtml(it, cid, idx, rank) {
        var open = "mfhOpenIdx('" + cid + "'," + idx + ")";
        return (
          '<div class="nf-card' + (rank ? ' nf-ranked' : '') + '" tabindex="0" role="button" aria-label="' + esc(it.title) + '" ' +
            'onclick="' + open + '" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();' + open + '}">' +
            (rank ? '<span class="nf-rank" aria-hidden="true">' + rank + '</span>' : '') +
            '<div class="nf-poster nf-skeleton">' +
              '<img class="nf-img"' + (it.image ? ' src="' + esc(it.image) + '"' : '') + ' alt="" loading="lazy">' +
              (typeof it.progress === 'number' ? '<div class="nf-cprog" aria-hidden="true"><i style="width:' + Math.round(it.progress) + '%"></i></div>' : '') +
                            (it.resume ? '<button type="button" class="nf-cx" title="Dokoukal jsem – odebrat z pokračování" aria-label="Dokoukal jsem – odebrat z pokračování" onclick="event.stopPropagation(); mfhFinishItem(\'' + esc(String(it.key || '')).replace(/'/g, '') + '\')"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button>' : mfhFavButton(it, cid, idx)) +
            '</div>' +
            '<div class="nf-card-info">' +
              '<p class="nf-card-title">' + esc(it.title) + '</p>' +
              (it.ep ? '<p class="nf-card-ep" title="' + esc(it.ep + (it.left ? ' · ' + it.left : '')) + '">' + esc(it.ep) + '</p>' : '') +
            '</div>' +
          '</div>'
        );
      }

      function mfhBindCardImages(el) {
        el.querySelectorAll('.nf-img').forEach(function (img) {
          var poster = img.parentElement;
          function done() { poster.classList.remove('nf-skeleton'); }
          if (!img.getAttribute('src')) { done(); img.style.opacity = '0.25'; return; }
          if (img.complete && img.naturalWidth) done();
          img.addEventListener('load', done);
          img.addEventListener('error', function () { done(); img.style.opacity = '0.25'; });
        });
      }

      function renderCarousel(id, items, ranked) {
        var el = document.getElementById(id);
        if (!el) return;
        el._mfhItems = items || [];
        el.innerHTML = el._mfhItems.map(function (it, i) { return mfhCardHtml(it, id, i, ranked ? i + 1 : 0); }).join('');
        mfhBindCardImages(el);
        if (id === 'mfhRecent') mfhMarkNewEpisodes(el);
      }

      /* Odznak „Nová epizoda“: seriál, který máš rozkoukaný a od posledního dílu mu vyšla nová epizoda (TMDB, výsledek se na 12 h pamatuje) */
      function mfhMarkNewEpisodes(el) {
        try {
          if (typeof tmdbGet !== 'function' || !getTmdbKey()) return;
          (el._mfhItems || []).forEach(function (it, i) {
            if (!it.resume || !it.slug || !it.left) return;
            var d = (typeof db !== 'undefined' && db[it.slug]) || null, id = d && d.tmdbId || it.tmdbId;
            if (!id) return;
            var ck = 'mf_newep_' + id, cached = null;
            try { cached = JSON.parse(localStorage.getItem(ck) || 'null'); } catch (e) {}
            function paint(air) {
              var age = air ? (Date.now() - new Date(air).getTime()) / 864e5 : 999;
              var card = el.children[i];
              if (age >= 0 && age <= 14 && card && !card.querySelector('.nf-new')) {
                var poster = card.querySelector('.nf-poster');
                if (poster) poster.insertAdjacentHTML('beforeend', '<span class="nf-new">Nová epizoda</span>');
              }
            }
            if (cached && Date.now() - cached.t < 432e5) { paint(cached.air); return; }
            tmdbGet('/tv/' + id + '?language=cs-CZ').then(function (r) {
              var air = r && r.last_episode_to_air && r.last_episode_to_air.air_date || '';
              try { localStorage.setItem(ck, JSON.stringify({ t: Date.now(), air: air })); } catch (e) {}
              paint(air);
            }).catch(function () {});
          });
        } catch (e) {}
      }

      function nfArrowSvg(left) {
        return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="' + (left ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6') + '"/></svg>';
      }

      function nfRowShell(id, title, sub, ranked) {
        var host = document.getElementById('nfRows');
        if (!host) return;
        var sec = document.createElement('section');
        sec.className = 'nf-row' + (ranked ? ' nf-row-ranked' : '');
        sec.id = id + 'Section';
        sec.hidden = true;
        sec.innerHTML =
          '<div class="nf-row-head">' +
            '<h2 class="nf-row-title">' + esc(title) + '</h2>' +
            (sub ? '<span class="nf-row-sub">' + esc(sub) + '</span>' : '') +
          '</div>' +
          '<div class="nf-scroller">' +
            '<div class="nf-track" id="' + id + '"></div>' +
            '<button type="button" class="nf-arrow nf-arrow-l" aria-label="Posunout doleva">' + nfArrowSvg(true) + '</button>' +
            '<button type="button" class="nf-arrow nf-arrow-r" aria-label="Posunout doprava">' + nfArrowSvg(false) + '</button>' +
          '</div>';
        host.appendChild(sec);
        var track = sec.querySelector('.nf-track');
        sec.querySelector('.nf-arrow-l').addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth * 0.85, behavior: 'smooth' }); });
        sec.querySelector('.nf-arrow-r').addEventListener('click', function () { track.scrollBy({ left: track.clientWidth * 0.85, behavior: 'smooth' }); });
      }

      function nfFillRow(id, items, ranked) {
        var sec = document.getElementById(id + 'Section');
        if (!sec) return;
        if (!items || !items.length) { sec.remove(); return; }
        // Věkové omezení profilu: bez omezení se vykreslí hned, jinak až po ověření hodnocení titulů
        if (window.MFAge && window.MFAge.limit() && id !== 'mfhRecent' && id !== 'mfhMyList') {
          var run = _nfRun;
          // Během ověřování hodnocení je vidět načítací stav (ne prázdné místo), ať je jasné, že se něco děje
          var trk = document.getElementById(id);
          if (trk) trk.innerHTML = new Array(9).join('<div class="nf-card nf-card-sk" aria-hidden="true"><div class="nf-poster nf-skeleton"></div></div>');
          sec.hidden = false;
          window.MFAge.filter(items, 20).then(function (ok) {
            if (run !== _nfRun) return;
            var s2 = document.getElementById(id + 'Section');
            if (!s2) return;
            // Omezený profil: řádek s pár tituly (např. Drama jen se třemi) působí rozbitě, tak se raději schová
            if (ok.length < (id === 'mfhForYou' ? 1 : 6)) { s2.remove(); return; }
            renderCarousel(id, ok, ranked);
            s2.hidden = false;
          });
          return;
        }
        renderCarousel(id, items, ranked);
        sec.hidden = false;
      }

      window.mfhSeeAll = function (carouselId) {
        var carousel = document.getElementById(carouselId);
        var items = (carousel && carousel._mfhItems) || [];
        var section = carousel && carousel.closest('section');
        var titleEl = section && section.querySelector('.nf-row-title');
        var modal = document.getElementById('mfhSeeAllModal');
        if (!modal) return;
        var titleTarget = document.getElementById('mfhSeeAllTitle');
        if (titleTarget) titleTarget.textContent = titleEl ? titleEl.textContent : 'Vše';
        var grid = document.getElementById('mfhSeeAllGrid');
        if (grid) {
          grid.innerHTML = items.length
            ? items.map(function (it, i) { return mfhCardHtml(it, carouselId, i, 0); }).join('')
            : '<p class="mfh-seeall-empty">Zatím tu nic není.</p>';
          mfhBindCardImages(grid);
        }
        modal.classList.add('open');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { modal.classList.add('visible'); });
        });
      };

      window.mfhCloseSeeAll = function () {
        var modal = document.getElementById('mfhSeeAllModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(function () { modal.classList.remove('open'); }, 250);
      };

      /* ---------- Hero banner ---------- */

      var _heroItem = null;
      var _heroSeed = Math.random();
      var _trTok = 0, _trObs = null;

      function nfHeroSkeleton() {
        var hero = document.getElementById('nfHero');
        /* Banner, který už je vidět, se při překreslení nemaže (bylo to vidět jako probliknutí); nový se do něj jen vymění */
        if (hero && !hero.querySelector('.nf-hero-body')) { hero.className = 'nf-hero nf-hero-empty'; hero.innerHTML = ''; }
      }

      var _heroTok = 0;
      function nfHeroShow(h) {
        var tok = ++_heroTok, fired = false;
        function go() { if (fired || tok !== _heroTok) return; fired = true; nfHeroPaint(h); }
        if (h.image) {
          /* obrázek se nejdřív stáhne, teprve potom se banner vymění → žádné prázdné bliknutí */
          var im = new Image();
          im.onload = im.onerror = go;
          setTimeout(go, 800);
          im.src = h.image;
        } else go();
      }

      function nfHeroPaint(h) {
        var hero = document.getElementById('nfHero');
        if (!hero) return;
        var first = !hero.querySelector('.nf-hero-body');
        _trTok++; if (_trObs) { try { _trObs.disconnect(); } catch (e) {} _trObs = null; }
        var bg = h.image
          ? '<img class="nf-hero-bg" src="' + esc(h.image) + '" alt="" decoding="async" onerror="this.style.display=\'none\'">'
          : '';
        var meta = [];
        if (h.badge) meta.push('<span class="nf-hero-badge">' + esc(h.badge) + '</span>');
        if (h.rating > 0) meta.push('<span class="nf-hero-rating">★ ' + h.rating.toFixed(1) + '</span>');
        if (h.year) meta.push('<span>' + esc(h.year) + '</span>');
        (h.genres || []).slice(0, 3).forEach(function (g) { meta.push('<span>' + esc(g) + '</span>'); });
        if (h.episode) meta.push('<span>' + esc(h.episode) + '</span>');
        hero.className = 'nf-hero' + (first ? ' nf-hero-in' : '');
        hero.innerHTML =
          bg + '<div class="nf-hero-shade"></div>' +
          '<div class="nf-hero-body">' +
            (h.eyebrow ? '<div class="nf-hero-eyebrow">' + esc(h.eyebrow) + '</div>' : '') +
            '<h1 class="nf-hero-title' + ((h.title || '').length > 26 ? ' nf-long' : '') + '">' + esc(h.title) + '</h1>' +
            '<div class="nf-hero-meta">' + meta.join('') + '</div>' +
            (h.progress != null ? '<div class="nf-hero-bar"><div style="width:' + Math.max(2, h.progress) + '%"></div></div>' : '') +
            (h.overview ? '<p class="nf-hero-desc">' + esc(h.overview) + '</p>' : '') +
            '<div class="nf-hero-actions">' +
              '<button type="button" class="nf-btn nf-btn-primary" id="nfHeroPlay"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>' + esc(h.playLabel) + '</span></button>' +
              '<button type="button" class="nf-btn nf-btn-ghost" id="nfHeroFav"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + HEART_PATH + '"/></svg><span></span></button>' +
            '</div>' +
          '</div>';
        var play = document.getElementById('nfHeroPlay');
        var fav = document.getElementById('nfHeroFav');
        play.addEventListener('click', h.onPlay);
        if (h.onDone) {
          var dn = document.createElement('button');
          dn.type = 'button'; dn.className = 'nf-btn nf-btn-ghost nf-btn-icon'; dn.id = 'nfHeroDone'; dn.title = 'Dokoukal jsem'; dn.setAttribute('aria-label', 'Dokoukal jsem – schovat z pokračování');
          dn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
          dn.addEventListener('click', h.onDone);
          play.parentNode.appendChild(dn);
        }
        function paintFav() {
          var on = !!h.isFav();
          fav.classList.toggle('on', on);
          fav.querySelector('span').textContent = on ? 'V oblíbených' : 'Do oblíbených';
        }
        fav.addEventListener('click', function () { h.onFav(); paintFav(); });
        paintFav();
        if (h.after) h.after();
      }

      function nfHeroFromContinue(c) {
        nfHeroShow({
          image: c.image, title: c.title, eyebrow: 'Pokračovat ve sledování',
          episode: c.left ? c.episode + ' · ' + c.left : c.episode, progress: c.progress, playLabel: 'Pokračovat', onDone: window.mfhFinishContinue,
          onPlay: function () { window.mfhResume(); },
          isFav: function () {
            try { return c.slug && getWatchlist().some(function (w) { return w.slug === c.slug; }); } catch (e) { return false; }
          },
          onFav: function () { if (c.slug && typeof toggleWatchlistItem === 'function') toggleWatchlistItem(c.slug); }
        });
      }

      /* Hromádka rozkoukaných: karty za sebou vpravo nahoře v banneru; klepnutí na kartu ji přepne do banneru. */
      function nfContinueStack(list, sel) {
        var hero = document.getElementById('nfHero');
        if (!hero) return;
        var old = hero.querySelector('.nf-cstack');
        if (old) old.remove();
        if (!list || list.length < 2) return;
        var others = [];
        list.forEach(function (c, i) { if (i !== sel) others.push({ c: c, i: i }); });
        var box = document.createElement('div');
        box.className = 'nf-cstack';
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'Rozkoukané: ' + list.length);
        var shown = others.slice(0, 3);
        shown.forEach(function (o, k) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'nf-cs-card';
          b.style.setProperty('--k', String(k));
          b.setAttribute('aria-label', 'Přepnout na ' + o.c.title);
          b.innerHTML = (o.c.image ? '<img src="' + esc(o.c.image) + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
            '<span class="nf-cs-t">' + esc(o.c.title) + (o.c.episode ? '<small>' + esc(o.c.episode) + '</small>' : '') + '</span>';
          b.addEventListener('click', function () {
            _lastContinue = o.c;
            nfHeroFromContinue(o.c);
            nfContinueStack(list, o.i);
          });
          box.appendChild(b);
        });
        var n = document.createElement('div');
        n.className = 'nf-cs-count';
        n.textContent = list.length + ' ' + mfhPl(list.length, 'rozkoukané', 'rozkoukané', 'rozkoukaných');
        box.appendChild(n);
        hero.appendChild(box);
      }

      function nfHeroFromTmdb(it) {
        _heroItem = it;
        nfHeroShow({
          image: it.backdrop, title: it.title, eyebrow: '', badge: it.mediaType === 'tv' ? 'Seriál' : 'Film',
          rating: it.rating, year: it.ep, overview: it.overview,
          genres: (it.genreIds || []).map(function (g) { return GENRE_LABELS[g]; }).filter(Boolean),
          playLabel: 'Přehrát',
          onPlay: function () { mfhOpenCard(it.title, it.tmdbId, it.mediaType); },
          isFav: function () { try { return isTmdbFavorite(it.tmdbId, it.mediaType); } catch (e) { return false; } },
          onFav: function () {
            if (typeof toggleTmdbFavorite === 'function') toggleTmdbFavorite(it.tmdbId, it.mediaType, it.title, it.image, null);
          },
          after: function () {
        try { nfHeroTrailer(it); } catch (e) {}
        try {
          var ltok = _trTok;
          if (window.mfFetchLogo && it.tmdbId) window.mfFetchLogo(it.mediaType === 'tv' ? 'tv' : 'movie', it.tmdbId).then(function (u) {
            var h1 = document.querySelector('#nfHero .nf-hero-title');
            if (!u || ltok !== _trTok || !h1 || h1.querySelector('img')) return;
            var im = new Image();
            im.className = 'nf-hero-logo'; im.alt = it.title || '';
            im.onload = function () { if (ltok === _trTok && !h1.querySelector('img')) { h1.classList.add('has-logo'); h1.appendChild(im); } };
            im.src = u;
          });
        } catch (e) {}
          }
        });
      }
      /* ---------- Mini přehrávač traileru v banneru ----------
       * Trailer z TMDB (/videos, YouTube). Iframe se načte až po kliknutí (šetří výkon i data); při odscrollování
       * z banneru se video pozastaví a po návratu je zase k dispozici. */
      function ytCmd(frame, func) {
        try { frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: '' }), '*'); } catch (e) {}
      }
      /* YouTube přijímá příkazy (pauza, zvuk) až poté, co se přehrávači pošle „listening“; dál odpovídá stavem přehrávače */
      function ytListen(frame) {
        try { frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'mfhtr', channel: 'widget' }), '*'); } catch (e) {}
      }

      function nfPickTrailer(list) {
        var yt = (list || []).filter(function (v) { return v && v.site === 'YouTube' && v.key && /^[\w-]{6,20}$/.test(v.key); });
        var by = function (type) { return yt.filter(function (v) { return v.type === type; }); };
        var pool = by('Trailer').length ? by('Trailer') : (by('Teaser').length ? by('Teaser') : []);
        if (!pool.length) return null;
        pool.sort(function (a, b) { return (b.official ? 1 : 0) - (a.official ? 1 : 0); });
        return pool[0].key;
      }

      function nfHeroTrailer(it) {
        var tok = ++_trTok;
        if (_trObs) { try { _trObs.disconnect(); } catch (e) {} _trObs = null; }
        var key = getTmdbKey();
        if (!key || !it || !it.tmdbId) return;
        var kind = it.mediaType === 'tv' ? 'tv' : 'movie';
        var url = TMDB_BASE + '/' + kind + '/' + it.tmdbId + '/videos?api_key=' + encodeURIComponent(key) + '&language=cs-CZ&include_video_language=cs,en,null';
        fetch(url).then(function (r) { return r.json(); }).then(function (d) {
          if (tok !== _trTok) return;
          var vid = nfPickTrailer(d && d.results);
          var hero = document.getElementById('nfHero');
          if (!vid || !hero || hero.classList.contains('nf-hero-none') || hero.classList.contains('nf-hero-empty')) return;
          var box = document.createElement('div');
          box.className = 'nf-trailer';
          box.innerHTML =
            '<button type="button" class="nf-tr-open" aria-label="Přehrát trailer: ' + esc(it.title) + '">' +
              '<img src="https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg" alt="" loading="lazy">' +
              '<span class="nf-tr-play"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' +
              '<span class="nf-tr-label">Trailer</span>' +
            '</button>';
          hero.appendChild(box);
          var frame = null;
          function stop() {
            clearTimeout(pauseTimer);
            if (frame) { frame.remove(); frame = null; }
            box.querySelectorAll('.nf-tr-tap, .nf-tr-ctl').forEach(function (n) { n.remove(); });
            box.classList.remove('playing', 'paused');
          }
          var muted = true, paused = false, ytState = null, pauseTimer = null;
          /* Stav přehrávače z odpovědí YouTube (1 hraje, 2 pauza, 0 konec). Bez něj nevíme, jestli pauza opravdu zabrala. */
          function onYtMsg(ev) {
            if (tok !== _trTok || !frame) { if (tok !== _trTok) window.removeEventListener('message', onYtMsg); return; }
            if (ev.source !== frame.contentWindow) return;
            var d = ev.data;
            if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { return; } }
            if (!d || typeof d !== 'object') return;
            var st = d.event === 'onStateChange' ? d.info : (d.info && typeof d.info.playerState === 'number' ? d.info.playerState : null);
            if (typeof st !== 'number') return;
            ytState = st;
            if (st === 0) stop();
          }
          window.addEventListener('message', onYtMsg);
          /* Pozastaví video. Když YouTube pauzu nepotvrdí (telefon, blokátor…), video se radši zavře, ať nehraje dál na pozadí. */
          function pauseVideo() {
            if (!frame) return;
            ytState = null; /* potvrzení musí přijít až po tomto příkazu */
            ytCmd(frame, 'pauseVideo');
            clearTimeout(pauseTimer);
            pauseTimer = setTimeout(function () { if (frame && ytState !== 2) stop(); }, 900);
          }
          function playVideo() { clearTimeout(pauseTimer); if (frame) ytCmd(frame, 'playVideo'); }
          box.querySelector('.nf-tr-open').addEventListener('click', function () {
            if (frame) return;
            muted = true; paused = false; ytState = null;
            frame = document.createElement('iframe');
            frame.className = 'nf-tr-frame';
            frame.title = 'Trailer: ' + it.title;
            frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            /* bez vlastních ovládacích prvků YouTube (nadpis, kanál, lišta); ovládá se jen třemi tlačítky a klepnutím na video */
            frame.src = 'https://www.youtube-nocookie.com/embed/' + vid + '?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
            frame.addEventListener('load', function () { var f = frame; ytListen(f); setTimeout(function () { if (frame === f) ytListen(f); }, 600); setTimeout(function () { if (frame === f) ytListen(f); }, 1800); });
            box.appendChild(frame);
            var tap = document.createElement('button');
            tap.type = 'button'; tap.className = 'nf-tr-tap'; tap.setAttribute('aria-label', 'Pozastavit / pokračovat');
            tap.addEventListener('click', function () { paused = !paused; if (paused) pauseVideo(); else playVideo(); box.classList.toggle('paused', paused); });
            box.appendChild(tap);
            box.classList.add('playing');
            var ctl = document.createElement('div');
            ctl.className = 'nf-tr-ctl';
            ctl.innerHTML =
              '<button type="button" class="nf-tr-snd muted" aria-label="Zapnout zvuk" title="Zvuk"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path class="on" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/><path class="off" d="m22 9-6 6M16 9l6 6"/></svg></button>' +
              '<button type="button" class="nf-tr-fs" aria-label="Celá obrazovka" title="Celá obrazovka"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
              '<button type="button" class="nf-tr-x" aria-label="Zavřít trailer" title="Zavřít">✕</button>';
            box.appendChild(ctl);
            ctl.querySelector('.nf-tr-x').addEventListener('click', function () { if (document.fullscreenElement === box) { try { document.exitFullscreen(); } catch (e) {} } stop(); });
            ctl.querySelector('.nf-tr-snd').addEventListener('click', function (e) {
              muted = !muted; ytCmd(frame, muted ? 'mute' : 'unMute'); e.currentTarget.classList.toggle('muted', muted);
            });
            ctl.querySelector('.nf-tr-fs').addEventListener('click', function () {
              try {
                if (document.fullscreenElement) document.exitFullscreen();
                else (box.requestFullscreen || box.webkitRequestFullscreen).call(box);
              } catch (e) {}
            });
          });
          /* odscrollováno z banneru → pozastavit a schovat, ať video neběží na pozadí */
          if ('IntersectionObserver' in window) {
            _trObs = new IntersectionObserver(function (ents) {
              var vis = ents[0].isIntersecting && ents[0].intersectionRatio > 0.35;
              if (!vis && frame && !document.fullscreenElement) { paused = true; box.classList.add('paused'); pauseVideo(); box.classList.add('away'); }
              else if (vis) box.classList.remove('away');
            }, { threshold: [0, 0.35, 0.6] });
            _trObs.observe(hero);
          }
        }).catch(function () {});
      }

      function mfhRecentItems() {
        var out = [];
        try {
          var sorted = mfhGetWatchTimeline().slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
          var seen = {};
          for (var i = 0; i < sorted.length && out.length < 14; i++) {
            var slug = sorted[i].slug;
            if (!slug || seen[slug]) continue;
            seen[slug] = true;
            if (typeof db === 'undefined') continue;
            if (!db[slug]) {
              // Seriál z Discoveru není v db trvale — použij údaje uložené v timeline
              var tl = sorted[i];
              if (tl.name && tl.tmdbId) {
                out.push({ title: tl.name, image: tl.poster || null, ep: '', tmdbId: tl.tmdbId, mediaType: 'tv' });
              }
              continue;
            }
            var next = (typeof findNextEp === 'function') ? findNextEp(slug) : null;
            out.push({
              title: db[slug].name,
              image: db[slug].poster,
              ep: next ? 'Další: S' + next.se + ' E' + next.ep : '',
              slug: slug
            });
          }
        } catch (e) {}
        return out;
      }

      function mfhMyListItems() {
        try {
          if (typeof getWatchlist !== 'function') return [];
          return getWatchlist().map(function (w) {
            return {
              title: w.name,
              image: w.poster || (typeof db !== 'undefined' && db[w.slug] ? db[w.slug].poster : null),
              ep: w.type === 'series' ? 'Seriál' : 'Film',
              fav: w
            };
          });
        } catch (e) { return []; }
      }

      function mfhSeenTmdbIds() {
        var seen = {};
        try {
          var memory = typeof aiBrain !== 'undefined' && aiBrain.memory;
          if (memory && memory.watchedTmdbIds) Object.keys(memory.watchedTmdbIds).forEach(function (k) { seen[k] = true; });
        } catch (e) {}
        try {
          mfhMyListItems().forEach(function (it) { if (it.fav && it.fav.tmdbId) seen[it.fav.tmdbId] = true; });
        } catch (e) {}
        return seen;
      }

      function mfhTopGenreIds() {
        try {
          var prefs = (typeof aiBrain !== 'undefined' && aiBrain.memory && aiBrain.memory.genreIdPrefs) || {};
          return Object.keys(prefs)
            .filter(function (k) { return prefs[k] > 0.05; })
            .sort(function (a, b) { return prefs[b] - prefs[a]; })
            .slice(0, 3);
        } catch (e) { return []; }
      }
      function mfhTopGenreIdsWithProfile() {
        var ids = mfhTopGenreIds();
        if (ids.length) return ids;
        try {
          var p = nfActiveProfile();
          return ((p && p.likedGenres) || []).slice(0, 3).map(String);
        } catch (e) { return []; }
      }

      /* Semínka pro řady „Protože jsi viděl …“: tituly, které jsi hodnotil vysoko, nedávno sledoval nebo si pustil jako film.
         Skóre = váha hodnocení (milovaný 4, líbil 3, ujde 1) + 1 za sledování + bonus za čerstvost (30 dní). Vrací max. dvě. */
      function mfhSeedTitles(limit) {
        var cand = {};
        function add(type, id, title, w, ts) {
          if (!id || !/^\d+$/.test(String(id)) || !title) return;
          var k = type + ':' + id, c = cand[k] || (cand[k] = { type: type, id: String(id), title: title, w: 0, ts: 0 });
          c.w += w; if (ts > c.ts) c.ts = ts;
        }
        var slugToId = {};
        try {
          mfhGetWatchTimeline().forEach(function (t) {
            if (!t || !t.slug) return;
            if (t.tmdbId) slugToId[t.slug] = t.tmdbId;
            if (t.tmdbId && t.name) add('tv', t.tmdbId, t.name, 1, t.ts || 0);
          });
        } catch (e) {}
        try {
          var rat = (typeof safeLS === 'function' && typeof uKey === 'function') ? safeLS(uKey('mf_ratings'), '{}') : {};
          Object.keys(rat).forEach(function (slug) {
            var r = rat[slug] || {}, w = r.rating === 'loved' ? 4 : r.rating === 'liked' ? 3 : r.rating === 'ok' ? 1 : 0;
            var id = (typeof db !== 'undefined' && db[slug] && db[slug].tmdbId) || slugToId[slug];
            if (w && id) add('tv', id, r.name || (db[slug] && db[slug].name) || '', w, r.ts || 0);
          });
        } catch (e) {}
        try {
          mfhMovies().forEach(function (m) { add('movie', m.tmdbId, m.title, 1, m.ts || 0); });
        } catch (e) {}
        var now = Date.now();
        return Object.keys(cand).map(function (k) { var c = cand[k]; c.score = c.w + (now - c.ts < 30 * 864e5 ? 1 : 0) + c.ts / 1e15; return c; })
          .sort(function (a, b) { return b.score - a.score; })
          .slice(0, limit || 2);
      }
      window.mfhSeedTitles = mfhSeedTitles;

      /* Profil si vybral jen Anime (žádný jiný žánr) → doporučení jsou čistě anime, nic z naučených žánrů. */
      function mfhOnlyAnime() {
        try { return !!(window.mfOnlyAnime && window.mfOnlyAnime()); } catch (e) { return false; }
      }
      function mfhFetchForYouBase(tmdb) {
        var genres = mfhTopGenreIdsWithProfile();
        var key = getTmdbKey();
        var toItem = function (type) { return function (item) { return nfItem(item, type); }; };
        if (!genres.length || !key) {
          var pop = [];
          var tvs = (tmdb && tmdb.tv) || [], mvs = (tmdb && tmdb.movies) || [];
          for (var i = 0; i < Math.max(tvs.length, mvs.length); i++) {
            if (tvs[i]) pop.push(toItem('tv')(tvs[i]));
            if (mvs[i]) pop.push(toItem('movie')(mvs[i]));
          }
          return Promise.resolve(pop);
        }
        return Promise.all(['tv', 'movie'].map(function (type) {
          // Filmy a seriály mají v TMDB částečně jiná ID žánrů (např. Akční 28 vs. 10759)
          var ids = window.mfGenreIdsFor ? window.mfGenreIdsFor(genres, type) : genres;
          if (!ids.length) return Promise.resolve([]);
          var q = '&language=cs-CZ&sort_by=popularity.desc&vote_count.gte=100&with_genres=' + encodeURIComponent(ids.join('|'));
          var gp = function (p) { return fetch(TMDB_BASE + p + (p.indexOf('?') < 0 ? '?' : '&') + 'api_key=' + encodeURIComponent(key)).then(function (r) { return r.json(); }); };
          return (window.MFAge ? window.MFAge.wide('/discover/' + type + '?' + q.slice(1), gp) : gp('/discover/' + type + '?' + q.slice(1)))
            .then(function (d) { return (d.results || []).filter(function (r) { return !(window.mfIsAnime && window.mfIsAnime(r)); }).map(toItem(type)); })
            .catch(function () { return []; });
        })).then(function (lists) {
          var out = [], max = Math.max(lists[0].length, lists[1].length);
          for (var i = 0; i < max; i++) { if (lists[0][i]) out.push(lists[0][i]); if (lists[1][i]) out.push(lists[1][i]); }
          return out;
        });
      }

      /* Anime se přimíchá do doporučení (každé třetí místo) bez ohledu na ostatní žánry */
      function mfhFetchForYou(tmdb) {
        var onlyAnime = mfhOnlyAnime();
        return (onlyAnime ? Promise.resolve([]) : mfhFetchForYouBase(tmdb)).then(function (out) {
          var key = getTmdbKey();
          if (!(window.mfLikesAnime && window.mfLikesAnime()) || !key) return out;
          var toItem = function (type) { return function (item) { return nfItem(item, type); }; };
          return Promise.all(['tv', 'movie'].map(function (type) {
            var ap = '/discover/' + type + '?language=cs-CZ&sort_by=popularity.desc&vote_count.gte=50' + window.MF_ANIME_QUERY;
            var ag = function (p) { return fetch(TMDB_BASE + p + (p.indexOf('?') < 0 ? '?' : '&') + 'api_key=' + encodeURIComponent(key)).then(function (r) { return r.json(); }); };
            return (window.MFAge ? window.MFAge.wide(ap, ag) : ag(ap))
              .then(function (d) { return (d.results || []).map(toItem(type)); })
              .catch(function () { return []; });
          })).then(function (al) {
            var anime = [], m = Math.max(al[0].length, al[1].length);
            for (var j = 0; j < m; j++) { if (al[0][j]) anime.push(al[0][j]); if (al[1][j]) anime.push(al[1][j]); }
            var have = {};
            out.forEach(function (it) { have[(it.type || '') + (it.id || it.title)] = 1; });
            anime = anime.filter(function (it) { return !have[(it.type || '') + (it.id || it.title)]; });
            var merged = [], ai = 0;
            out.forEach(function (it, idx) {
              merged.push(it);
              if (idx % 2 === 1 && anime[ai]) merged.push(anime[ai++]);
            });
            while (ai < anime.length && (onlyAnime || ai < 6)) merged.push(anime[ai++]);
            return merged;
          });
        });
      }


      /* Štítek v rohu byl odstraněn (uživatel ho nechtěl); funkce zůstává jako prázdná kvůli kompatibilitě. */
      window.mfhShowResumeChip = function () {};

      window.mfhFetchForYou = mfhFetchForYou;

      function renderHomepage() {
        nfRenderProfile();
        var host = document.getElementById('nfRows');
        if (!host) return;

        var hasHistory = mfhHasWatchHistory();
        var conts = hasHistory ? mfhContinueCandidates() : [];
        var cont = conts.length ? conts[0] : null;
        _lastContinue = cont;
        var recent = mfhRecentItems();
        // Řada „Pokračovat ve sledování“: rozkoukané tituly s postupem a zbývajícím časem, za nimi zbytek z historie
        var contItems = conts.slice(0, 14).map(function (c) {
          return {
            resume: true, key: c.kind === 'movie' ? 'movie:' + c.tmdbId : c.slug,
            title: c.title, image: c.image, slug: c.slug, tmdbId: c.tmdbId, mediaType: c.mediaType || (c.slug ? 'tv' : 'movie'),
            ep: c.kind === 'movie' ? 'Film' : c.episode, left: c.left || '',
            progress: c.kind === 'movie' ? null : Math.max(3, Math.min(100, c.progress || 0))
          };
        });
        var contSeen = {};
        contItems.forEach(function (c) { contSeen[c.slug || ('m' + c.tmdbId)] = 1; });
        var doneMap = mfhReadDone();
        recent.forEach(function (r) { if (contItems.length < 14 && !contSeen[r.slug || ('m' + r.tmdbId)] && !doneMap[r.slug || ('movie:' + r.tmdbId)]) contItems.push(r); });
        var mine = mfhMyListItems();
        try { if (mine.some(function (m) { return !m.image && m.fav && m.fav.tmdbId; }) && window.mfBackfillFavPosters) window.mfBackfillFavPosters(); } catch (e) {}
        var genres = mfhOnlyAnime() ? [] : mfhTopGenreIdsWithProfile();
        var seeds = mfhOnlyAnime() ? [] : mfhSeedTitles(2);

        var sig = JSON.stringify([
          cont && [cont.slug, cont.progress, cont.episode],
          conts.map(function (c) { return c.slug || ('m' + c.tmdbId); }),
          recent.map(function (r) { return r.slug; }),
          contItems.map(function (c) { return [c.slug, c.progress, c.ep]; }),
          mine.map(function (m) { return m.title; }),
          genres, seeds.map(function (x) { return x.type + x.id; }), !!getTmdbKey(), !!(window.mfLikesAnime && window.mfLikesAnime()), mfhOnlyAnime(), window.MFAge ? window.MFAge.limit() : 0
        ]);
        if (sig === _nfSig && host.children.length) return;
        _nfSig = sig;
        var myRun = ++_nfRun;
        /* výška řad se při překreslení drží, ať stránka neposkočí nahoru */
        if (host.offsetHeight > 200) { host.style.minHeight = host.offsetHeight + 'px'; clearTimeout(host._mh); host._mh = setTimeout(function () { host.style.minHeight = ''; }, 2500); }
        host.innerHTML = '';

        // Banner je vždy doporučený titul; rozkoukané věci jsou v první řadě (ne v banneru)
        nfHeroSkeleton();

        nfRowShell('mfhRecent', conts.length ? 'Pokračovat ve sledování' : 'Nedávno sledováno');
        nfRowShell('mfhMyList', 'Oblíbené');
        seeds.forEach(function (sd, si) { nfRowShell('mfhBecause' + si, 'Protože jsi viděl ' + sd.title); });
        var forYouTitle = (genres.length || mfhOnlyAnime()) ? 'Vybráno pro tebe' : 'Populární právě teď';
        var forYouSub = mfhOnlyAnime() ? 'Podle toho, že sleduješ hlavně anime' : genres.length
          ? 'Podle tvých oblíbených žánrů: ' + genres.map(function (g) { return GENRE_LABELS[g]; }).filter(Boolean).join(' · ')
          : '';
        nfRowShell('mfhForYou', forYouTitle, forYouSub);
        var oa = mfhOnlyAnime();
        nfRowShell('mfhTop10', oa ? 'Top 10 anime' : 'Top 10 tento týden', '', true);
        var genreRows = genres.slice(0, 2).filter(function (g) { return GENRE_LABELS[g]; });
        genreRows.forEach(function (g) { nfRowShell('mfhGenre' + g, GENRE_LABELS[g]); });
        nfRowShell('mfhTopTv', oa ? 'Nejlepší anime seriály' : 'Nejlépe hodnocené seriály');
        nfRowShell('mfhTopMovie', oa ? 'Nejlepší anime filmy' : 'Nejlépe hodnocené filmy');

        nfFillRow('mfhRecent', contItems);
        nfFillRow('mfhMyList', mine);

        if (!getTmdbKey()) {
          ['mfhForYou', 'mfhTop10', 'mfhTopTv', 'mfhTopMovie'].forEach(function (id) { nfFillRow(id, []); });
          genreRows.forEach(function (g) { nfFillRow('mfhGenre' + g, []); });
          var h = document.getElementById('nfHero');
          if (h) h.className = 'nf-hero nf-hero-none';
          return;
        }

        var seen = mfhSeenTmdbIds();
        var fresh = function (items) { return items.filter(function (it) { return !seen[it.tmdbId]; }); };

        /* „Protože jsi viděl …“: doporučení TMDB k titulu; bez toho, co už jsi viděl, a bez titulů z předchozí řady */
        var usedBecause = {};
        seeds.forEach(function (sd, si) {
          nfJson('/' + sd.type + '/' + sd.id + '/recommendations').then(function (d) {
            if (myRun !== _nfRun) return;
            var list = fresh(nfItems(d, sd.type)).filter(function (it) {
              var k = it.mediaType + it.tmdbId;
              if (usedBecause[k] || String(it.tmdbId) === sd.id) return false;
              return true;
            }).slice(0, 16);
            if (list.length < 4) list = [];
            list.forEach(function (it) { usedBecause[it.mediaType + it.tmdbId] = 1; });
            nfFillRow('mfhBecause' + si, list);
          });
        });

        fetchTmdbData().then(function (tmdb) {
          return mfhFetchForYou(tmdb);
        }).then(function (items) {
          return window.MFAge ? window.MFAge.filter(items, 40) : items;
        }).then(function (items) {
          if (myRun !== _nfRun) return;
          items = fresh(items.filter(function (it) { return it.image; })).slice(0, 20);
          nfFillRow('mfhForYou', items);
          /* Banner: titul z nabídky pro tebe; při každém otevření aplikace jiný (během jednoho otevření se nepřeskakuje), u profilu s vkusem jen z nejlepších shod */
          var cands = items.filter(function (it) { return it.backdrop && it.overview; }).slice(0, (genres.length || oa) ? 4 : 8);
          var pick = null;
          if (cands.length) {
            pick = cands[Math.floor(_heroSeed * cands.length)];
          }
          if (pick) nfHeroFromTmdb(pick);
          else { var hh = document.getElementById('nfHero'); if (hh) hh.className = 'nf-hero nf-hero-none'; }
        }).catch(function () {
          if (myRun !== _nfRun) return;
          nfFillRow('mfhForYou', []);
        });

        var AQ = window.MF_ANIME_QUERY || '';
        nfJson(oa ? '/discover/tv?sort_by=popularity.desc&vote_count.gte=50' + AQ : '/trending/all/week').then(function (d) {
          if (myRun !== _nfRun) return;
          nfFillRow('mfhTop10', (oa ? nfItems(d, 'tv') : nfItems(d)).slice(0, 10), true);
        });
        genreRows.forEach(function (g) {
          Promise.all(['tv', 'movie'].map(function (t) {
            return nfJson('/discover/' + t + '?sort_by=popularity.desc&vote_count.gte=100&with_genres=' + g)
              .then(function (d) { return nfItems(d, t); });
          })).then(function (l) {
            if (myRun !== _nfRun) return;
            var out = [], max = Math.max(l[0].length, l[1].length);
            for (var i = 0; i < max; i++) { if (l[0][i]) out.push(l[0][i]); if (l[1][i]) out.push(l[1][i]); }
            nfFillRow('mfhGenre' + g, fresh(out).slice(0, 20));
          });
        });
        nfJson(oa ? '/discover/tv?sort_by=vote_average.desc&vote_count.gte=300' + AQ : '/tv/top_rated').then(function (d) {
          if (myRun !== _nfRun) return;
          nfFillRow('mfhTopTv', fresh(nfItems(d, 'tv')).slice(0, 20));
        });
        nfJson(oa ? '/discover/movie?sort_by=vote_average.desc&vote_count.gte=300' + AQ : '/movie/top_rated').then(function (d) {
          if (myRun !== _nfRun) return;
          nfFillRow('mfhTopMovie', fresh(nfItems(d, 'movie')).slice(0, 20));
        });
      }

      window.mfhOpenIdx = function (cid, idx) {
        var el = document.getElementById(cid);
        var it = el && el._mfhItems && el._mfhItems[idx];
        if (!it) return;
        if (it.slug && typeof openSeries === 'function' && typeof db !== 'undefined' && db[it.slug]) {
          openSeries(it.slug);
          return;
        }
        if (it.fav && typeof openFavoriteItem === 'function') {
          openFavoriteItem(it.fav);
          return;
        }
        mfhOpenCard(it.title, it.tmdbId, it.mediaType);
      };

      /* „Dokoukal jsem“ na kartě v řadě Pokračovat: položka se schová, dokud se u ní neobjeví nové sledování */
      window.mfhFinishItem = function (key) {
        if (!key) return;
        var done = mfhReadDone();
        done[key] = Date.now() + 1;
        mfhWriteDone(done);
        _nfSig = '';
        try { if (typeof showToast === 'function') showToast('Odebráno z pokračování'); } catch (e) {}
        try { renderHomepage(); } catch (e) {}
      };

      window.mfhResume = function () {
        var item = _lastContinue;
        if (!item) return;
        if (item.slug) {
          if (typeof window.mfPlayNextOf === 'function' && window.mfPlayNextOf(item.slug)) return;
          if (typeof openSeries === 'function') openSeries(item.slug);
          return;
        }
        if (item.tmdbId) mfhOpenCard(item.title, item.tmdbId, item.mediaType || 'movie');
      };
      window.mfhToggleFav = function (slug, btn) {
        if (typeof toggleWatchlistItem === 'function') toggleWatchlistItem(slug);
        var inList = false;
        try {
          inList = typeof getWatchlist === 'function' &&
            getWatchlist().some(function (w) { return w.slug === slug; });
        } catch (e) {}
        if (btn) {
          btn.textContent = inList ? '✓ V oblíbených' : '+ Oblíbené';
          btn.style.background = inList ? 'rgba(0,122,255,0.15)' : '';
        }
      };
      function mfhUnlockCinema() {
        var cinema = document.getElementById('cinemaModal') ||
                     document.getElementById('mfStandaloneCinema');
        if (!cinema) return;
        cinema.style.removeProperty('display');
        cinema.style.removeProperty('pointer-events');
        cinema.style.setProperty('pointer-events', 'auto', 'important');
        cinema.style.setProperty('z-index', '99999', 'important');
      }

      window.mfhCloseCinema = function () {
        if (window.MFCinemaPlayer && typeof window.MFCinemaPlayer.close === 'function') {
          window.MFCinemaPlayer.close();
        }
        var cinema = document.getElementById('cinemaModal');
        if (cinema) {
          cinema.style.setProperty('display', 'none', 'important');
          cinema.classList.remove('open');
        }
        var emptyMsg = document.getElementById('mfhCinemaEmptyMsg');
        if (emptyMsg) emptyMsg.remove();
      };

      window.mfhOpenCard = function (title, tmdbId, mediaType) {
        var cinType = (mediaType === 'tv' || mediaType === 'tv_ep') ? 'tv_ep' : 'movie';

        if (cinType === 'tv_ep' && tmdbId && typeof openDiscoverTv === 'function') {
          openDiscoverTv(tmdbId, title);
          return;
        }

        if (window.MFCinemaPlayer && typeof window.MFCinemaPlayer.open === 'function') {
          try {
            window.MFCinemaPlayer.open(
              tmdbId || title,
              title,
              cinType,
              { season: 1, episode: 1 }
            );
            return;
          } catch (e) {
            console.warn('[mfh] MFCinemaPlayer.open failed:', e);
          }
        }

        if (typeof openMovieInCinema === 'function' && tmdbId) {
          openMovieInCinema(tmdbId, title, cinType === 'tv_ep' ? 'tv' : 'movie');
          mfhUnlockCinema();
          return;
        }

        if (typeof showToast === 'function') {
          showToast('⚠ ' + title, 'info');
        }
      };

      function injectHardCSS() {
        if (document.getElementById('mfh-hard-css')) return;
        var css = document.createElement('style');
        css.id = 'mfh-hard-css';
        css.textContent =
          'html.mfh-home-on .ps-menu-scene,' +
          'html.mfh-home-on #mainMenu,' +
          'html.mfh-home-on .logo-progress {' +
            'display: none !important;' +
          '}' +
          'html.mfh-home-on #mfSectionHome {' +
            'display: block !important;' +
          '}' +
          'html:not(.mfh-home-on) #mfSectionHome {' +
            'display: none !important;' +
          '}' +
          'html.mfh-home-on #mfDock, html.mfh-home-on .mf-dock,' +
          'body.mfh-home-on #mfDock, body.mfh-home-on .mf-dock {' +
            'display:flex!important;visibility:visible!important;opacity:1!important;' +
            'pointer-events:auto!important;z-index:10000!important;' +
          '}';
        document.head.appendChild(css);
        
      }

      function forceHome(opts) {
        var now = Date.now();
        if (!(opts && opts.force) && now - (forceHome._lastRun || 0) < 400) {
          return;
        }
        forceHome._lastRun = now;
        try {
          var OPEN_OVERLAY_IDS = [
            'cinemaModal', 'mfStandaloneCinema', 'mfhSeeAllModal', 'universeOverlay', 'watchlistOverlay', 'seriesModal',
            'genreEditorOverlay',
            'wrappedOverlay',
            'dockMoreSheet'
          ];
          var anyOverlayOpen = OPEN_OVERLAY_IDS.some(function (id) {
            var el = document.getElementById(id);
            return el && el.classList.contains('open') &&
              getComputedStyle(el).display !== 'none';
          });
          if (anyOverlayOpen && !(opts && opts.force)) {
            return;
          }

          document.documentElement.classList.add('mfh-home-on');
          document.body.classList.add('mfh-home-on');

          var overlaysToClose = [
            'universeOverlay',
            'watchlistOverlay',
            'seriesModal',
            'cinemaModal',
            'genreEditorOverlay',
            'wrappedOverlay',
            'dockMoreSheet'
          ];
          overlaysToClose.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
              el.style.removeProperty('pointer-events');
              el.classList.remove('active', 'open', 'visible', 'show');
            }
          });
          document.body.classList.remove('modal-open');
          document.documentElement.classList.remove('modal-open');
          document.body.style.overflow = '';

          document.querySelectorAll('.ps-menu-scene, #mainMenu').forEach(function (m) {
            m.style.setProperty('display', 'none', 'important');
          });

          ['mfSectionProtebe', 'mfSectionFilmy', 'mfSectionPlex'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });

          var home = document.getElementById('mfSectionHome');
          if (home) {
            home.style.setProperty('display', 'block', 'important');
            home.style.setProperty('z-index', '50', 'important');
            home.style.setProperty('pointer-events', 'auto', 'important');
          }
          var dock = document.getElementById('mfDock');
          if (dock) {
            dock.style.setProperty('display', 'flex', 'important');
            dock.style.setProperty('visibility', 'visible', 'important');
            dock.style.setProperty('opacity', '1', 'important');
            dock.style.setProperty('z-index', '10000', 'important');
            dock.style.setProperty('pointer-events', 'auto', 'important');
          }

          renderHomepage();
        } catch (e) {
          console.warn('[mfh] forceHome error:', e);
        }
      }

      function hideHome() {
        document.documentElement.classList.remove('mfh-home-on');
        document.body.classList.remove('mfh-home-on');
      }

      window.mfShowHomeSection = forceHome;
      window.mfhShowHome = forceHome;

      function wrapShowSection() {
        if (typeof window.mfShowSection !== 'function') return false;
        if (window.mfShowSection._mfhWrapped) return true;
        var orig = window.mfShowSection;
        var wrapped = function (name) {
          if (name === 'serialy' || name === 'home' || name === 'domu') {
            forceHome();
            return;
          }
          hideHome();
          if (typeof orig === 'function') return orig.apply(this, arguments);
        };
        wrapped._mfhWrapped = true;
        window.mfShowSection = wrapped;
        
        return true;
      }

      var DOCK_HIDE_OVERLAY_IDS = [
        'cinemaModal', 'mfStandaloneCinema',
        'seriesModal', 'genreEditorOverlay',
        'wrappedOverlay',
        'dockMoreSheet', 'mfhSeeAllModal'
      ];

      function dockShouldShow() {
        var anyOpen = false;
        for (var i = 0; i < DOCK_HIDE_OVERLAY_IDS.length; i++) {
          var el = document.getElementById(DOCK_HIDE_OVERLAY_IDS[i]);
          if (el && (el.classList.contains('open') || el.classList.contains('visible') || el.classList.contains('show'))) {
            anyOpen = true;
            break;
          }
        }
        if (anyOpen) return false;
        // Procházení a Oblíbené jsou součástí aplikace: navigace zůstává vidět
        var uo = document.getElementById('universeOverlay'), wo = document.getElementById('watchlistOverlay');
        if ((uo && uo.classList.contains('open') && document.body.classList.contains('discover-open')) || (wo && (wo.classList.contains('open') || wo.classList.contains('visible')))) return true;
        // Samoopravení: třída zůstala na body, ale žádné okno už není otevřené → dock by zůstal schovaný až do refreshe
        if (document.body.classList.contains('modal-open') || document.body.classList.contains('discover-open')) {
          if (!document.body.classList.contains('mf-section-protebe')) {
            document.body.classList.remove('modal-open', 'discover-open');
          }
        }
        if (!document.documentElement.classList.contains('mfh-home-on')) return false;
        if (typeof window.mfDockTarget === 'function' && window.mfDockTarget() !== 'dockHome') return false;
        return true;
      }

      function updateDockVisibility() {
        var dock = document.getElementById('mfDock');
        if (!dock) return;
        var show = dockShouldShow();
        // Nic neměnit, když se stav nezměnil — jinak každý zápis do style spustí
        // MutationObserver a ten volá tuto funkci znovu (nekonečná smyčka každých 200 ms)
        if (show && dock.style.display === 'none' && window.mfDockReveal) window.mfDockReveal();
        if (dock.style.display === (show ? 'flex' : 'none') && dock.style.getPropertyPriority('display') === 'important' && dock.style.visibility === (show ? 'visible' : 'hidden')) return;
        dock.style.setProperty('display', show ? 'flex' : 'none', 'important');
        dock.style.setProperty('visibility', show ? 'visible' : 'hidden', 'important');
        dock.style.setProperty('pointer-events', show ? 'auto' : 'none', 'important');
        if (show) dock.style.setProperty('opacity', '1', 'important');
        var top = document.getElementById('nfTop');
        if (top) top.classList.toggle('nf-top-hidden', !show);
      }
      window.mfhUpdateDockVisibility = updateDockVisibility;

      function hookDock() {
        var dockHome = document.getElementById('dockHome');
        if (!dockHome || dockHome._mfhHooked) return;
        dockHome._mfhHooked = true;
        dockHome.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof setDockActive === 'function') setDockActive('dockHome');
          forceHome({ force: true });
          if (typeof closeUniverse === 'function') closeUniverse();
          if (typeof closeWatchlist === 'function') closeWatchlist();
        };
      }

      function initHomeDockScrollFade() {
        var home = document.getElementById('mfSectionHome');
        var top = document.getElementById('nfTop');
        if (!home || !top || home._mfhTopBound) return;
        home._mfhTopBound = true;
        var ticking = false;
        home.addEventListener('scroll', function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () {
            ticking = false;
            top.classList.toggle('nf-top-solid', home.scrollTop > 24);
          });
        }, { passive: true });
      }

      function init() {
        
        injectHardCSS();
        hookDock();
        initHomeDockScrollFade();
        updateDockVisibility();

        var attempts = 0;
        var wid = setInterval(function () {
          wrapShowSection();
          hookDock();
          initHomeDockScrollFade();
          if (++attempts > 600) clearInterval(wid);
        }, 50);

        setInterval(function () {
          if (document.hidden) return;
          updateDockVisibility();
          if (document.documentElement.classList.contains('mfh-home-on')) {
            var menu = document.querySelector('.ps-menu-scene');
            if (menu) {
              var display = getComputedStyle(menu).display;
              if (display !== 'none') {
                menu.style.setProperty('display', 'none', 'important');
              }
            }
            var home = document.getElementById('mfSectionHome');
            if (home && getComputedStyle(home).display === 'none') {
              home.style.setProperty('display', 'block', 'important');
            }
          }
        }, 500);

        [50, 150, 300, 600, 1000, 1500, 2000, 3000, 5000].forEach(function (t) {
          setTimeout(forceHome, t);
        });

        if (document.documentElement) {
          var mfhDocMoRaf = null;
          var mo = new MutationObserver(function (muts) {
            if (mfhDocMoRaf) return;
            mfhDocMoRaf = setTimeout(function () {
              mfhDocMoRaf = null;
              updateDockVisibility();
              if (!document.documentElement.classList.contains('mfh-home-on')) return;
              document.querySelectorAll('.ps-menu-scene').forEach(function (m) {
                if (getComputedStyle(m).display !== 'none') {
                  m.style.setProperty('display', 'none', 'important');
                }
              });
            }, 200);
          });
          mo.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });
        }

        window.addEventListener('storage', function (e) {
          if (e.key && e.key.indexOf('mf_') === 0) setTimeout(forceHome, 300);
        });

        var gateEl = document.getElementById('mfProfileGate');
        if (gateEl) {
          var go = new MutationObserver(function () {
            var hidden = gateEl.style.display === 'none' ||
                         getComputedStyle(gateEl).display === 'none';
            if (hidden) setTimeout(forceHome, 200);
          });
          go.observe(gateEl, { attributes: true, attributeFilter: ['style', 'class'] });
        }

      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }

      window.addEventListener('load', function () {
        setTimeout(forceHome, 300);
        setTimeout(forceHome, 1500);
      });

      (function setupCinemaRescue() {
        var warned = false;
        function attach() {
          var cinema = document.getElementById('cinemaModal');
          if (!cinema || cinema._mfhRescue) return;
          cinema._mfhRescue = true;

          var mo = new MutationObserver(function () {
            var isOpen = getComputedStyle(cinema).display !== 'none';
            if (!isOpen) {
              warned = false;
              var old = document.getElementById('mfhCinemaEmptyMsg');
              if (old) old.remove();
              return;
            }
            mfhUnlockCinema();
            setTimeout(function () {
              if (getComputedStyle(cinema).display === 'none') return;
              var wrap = document.getElementById('cinemaFrameWrap');
              if (!wrap) return;
              var iframe = wrap.querySelector('iframe');
              if (!iframe || !iframe.src || iframe.src === 'about:blank') {
                if (warned) return;
                warned = true;
                if (document.getElementById('mfhCinemaEmptyMsg')) return;
                var msg = document.createElement('div');
                msg.id = 'mfhCinemaEmptyMsg';
                msg.style.cssText =
                  'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
                  'background:rgba(20,20,30,0.95);padding:24px 32px;border-radius:16px;' +
                  'color:#fff;font-family:-apple-system,Inter,sans-serif;text-align:center;' +
                  'z-index:999999;border:1px solid rgba(255,255,255,0.1);max-width:400px;';
                msg.innerHTML =
                  '<div style="font-size:1.5rem;margin-bottom:8px;">⚠️</div>' +
                  '<div style="font-weight:700;margin-bottom:8px;">Zdroj nenalezen</div>' +
                  '<div style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin-bottom:16px;">' +
                  'Zkus jiný zdroj nebo zavři přehrávač.</div>' +
                  '<button type="button" id="mfhCinemaEmptyClose" ' +
                  'style="padding:10px 20px;background:#007aff;border:none;border-radius:10px;' +
                  'color:#fff;font-weight:700;cursor:pointer;">Zavřít</button>';
                document.body.appendChild(msg);
                var btn = document.getElementById('mfhCinemaEmptyClose');
                if (btn) {
                  btn.onclick = function () {
                    msg.remove();
                    if (typeof mfhCloseCinema === 'function') mfhCloseCinema();
                    else if (typeof closeCinema === 'function') closeCinema();
                    else cinema.style.display = 'none';
                  };
                }
              }
            }, 8000);
          });

          mo.observe(cinema, { attributes: true, attributeFilter: ['style', 'class'] });
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', attach);
        } else {
          attach();
        }
        window.addEventListener('load', attach);
      })();

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var standalone = document.getElementById('mfStandaloneCinema');
        var cinema = document.getElementById('cinemaModal');
        var standaloneOpen = standalone && standalone.classList.contains('open');
        var cinemaOpen = cinema && getComputedStyle(cinema).display !== 'none';
        if (!standaloneOpen && !cinemaOpen) return;
        var emptyMsg = document.getElementById('mfhCinemaEmptyMsg');
        if (emptyMsg) emptyMsg.remove();
        if (typeof mfhCloseCinema === 'function') mfhCloseCinema();
        else if (typeof closeCinema === 'function') closeCinema();
        else if (cinema) cinema.style.display = 'none';
      });
    
  /* Popis s „…“ (hero na domovské stránce, detail seriálu): klepnutím/kliknutím se rozbalí celý, dalším se zase sbalí. */
  document.addEventListener('click', function (e) {
    var d = e.target && e.target.closest && e.target.closest('.nf-hero-desc, #seriesModal .sd-overview');
    if (!d) return;
    d.classList.toggle('is-open');
  });
  document.addEventListener('mouseover', function (e) {
    var d = e.target && e.target.closest && e.target.closest('.nf-hero-desc, #seriesModal .sd-overview');
    if (d && !d.title) d.title = 'Kliknutím zobrazíš celý popis';
  });
})();
