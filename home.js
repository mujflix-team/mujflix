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
      var _tmdbPromise = null;

      function getTmdbKey() {
        return localStorage.getItem('mf_tmdb_key') ||
          (typeof TMDB_KEY !== 'undefined' ? TMDB_KEY : '') ||
          window.TMDB_KEY || '';
      }

      function fetchTmdbData() {
        if (_tmdbPromise) return _tmdbPromise;
        var TMDB_API_KEY = getTmdbKey();
        if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
          console.warn('[mfh] TMDB API klíč není nastaven');
          return Promise.resolve(null);
        }

        _tmdbPromise = Promise.all([
          fetch(TMDB_BASE + '/trending/all/week?api_key=' + encodeURIComponent(TMDB_API_KEY) + '&language=cs-CZ'),
          fetch(TMDB_BASE + '/tv/popular?api_key=' + encodeURIComponent(TMDB_API_KEY) + '&language=cs-CZ&page=1'),
          fetch(TMDB_BASE + '/movie/popular?api_key=' + encodeURIComponent(TMDB_API_KEY) + '&language=cs-CZ&page=1')
        ]).then(function (resList) {
          return Promise.all(resList.map(function (r) { return r.json(); }));
        }).then(function (parsed) {
          var trending = parsed[0];
          var tv = parsed[1];
          var movies = parsed[2];
          return {
            trending: (trending.results || []).slice(0, 10),
            tv: (tv.results || []).slice(0, 10),
            movies: (movies.results || []).slice(0, 10)
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

      function mfhGetRealContinueItem() {
        try {
          var timeline = mfhGetWatchTimeline();
          if (!timeline || !timeline.length) return null;
          var sorted = timeline.slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
          var seenSlugs = {};
          for (var i = 0; i < sorted.length; i++) {
            var slug = sorted[i].slug;
            if (!slug || seenSlugs[slug]) continue;
            seenSlugs[slug] = true;
            if (typeof db === 'undefined' || !db[slug]) continue;
            var show = db[slug];
            var next = (typeof findNextEp === 'function') ? findNextEp(slug) : null;
            if (!next) continue;
            var prog = (typeof calcProgress === 'function') ? calcProgress(slug) : { pct: 0 };
            var runtime = show.runtime || 22;
            var pct = prog.pct || 0;
            var timeLeft = Math.max(1, Math.round(runtime * (1 - pct / 100))) + ' min';
            return {
              title: show.name,
              episode: 'S' + next.se + ' E' + (next.ep < 10 ? '0' + next.ep : next.ep),
              timeLeft: timeLeft,
              description: 'Pokračuj tam, kde jsi skončil/a.',
              progress: pct,
              image: show._backdrop || show.poster,
              slug: slug
            };
          }
        } catch (e) {
          console.warn('[mfh] mfhGetRealContinueItem error:', e);
        }
        return null;
      }

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
        if (_nfCache[path]) return _nfCache[path];
        var key = getTmdbKey();
        if (!key) return Promise.resolve(null);
        var ks = Object.keys(_nfCache);
        if (ks.length >= 40) delete _nfCache[ks[0]];
        _nfCache[path] = fetch(TMDB_BASE + path + (path.indexOf('?') < 0 ? '?' : '&') + 'api_key=' + encodeURIComponent(key) + '&language=cs-CZ')
          .then(function (r) { return r.json(); })
          .catch(function () { delete _nfCache[path]; return null; });
        return _nfCache[path];
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
        return ((data && data.results) || []).filter(function (r) { return r.media_type !== 'person'; })
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

      window.nfRenderProfile = nfRenderProfile;
      window.renderHomepage = function () { return renderHomepage.apply(this, arguments); };
      // Po přepnutí/vytvoření profilu překresli doporučení až poté, co se načte paměť AI daného profilu
      window.addEventListener('mf:profile-changed', function () {
        setTimeout(function () { try { nfRenderProfile(); renderHomepage(); } catch (e) {} }, 300);
      });

      function mfhCardHtml(it, cid, idx, rank) {
        var open = "mfhOpenIdx('" + cid + "'," + idx + ")";
        return (
          '<div class="nf-card' + (rank ? ' nf-ranked' : '') + '" tabindex="0" role="button" aria-label="' + esc(it.title) + '" ' +
            'onclick="' + open + '" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();' + open + '}">' +
            (rank ? '<span class="nf-rank" aria-hidden="true">' + rank + '</span>' : '') +
            '<div class="nf-poster nf-skeleton">' +
              '<img class="nf-img" src="' + (it.image ? esc(it.image) : '') + '" alt="" loading="lazy">' +
            '</div>' +
            '<div class="nf-card-info">' +
              '<p class="nf-card-title">' + esc(it.title) + '</p>' +
              (it.ep ? '<p class="nf-card-ep">' + esc(it.ep) + '</p>' : '') +
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
            '<a class="nf-see-all" href="#" onclick="event.preventDefault(); mfhSeeAll(\'' + id + '\');">Zobrazit vše ›</a>' +
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

      function nfHeroSkeleton() {
        var hero = document.getElementById('nfHero');
        if (hero) { hero.className = 'nf-hero nf-hero-empty'; hero.innerHTML = ''; }
      }

      function nfHeroShow(h) {
        var hero = document.getElementById('nfHero');
        if (!hero) return;
        var bg = h.image
          ? '<img class="nf-hero-bg" src="' + esc(h.image) + '" alt="" decoding="async" onerror="this.style.display=\'none\'">'
          : '';
        var meta = [];
        if (h.badge) meta.push('<span class="nf-hero-badge">' + esc(h.badge) + '</span>');
        if (h.rating > 0) meta.push('<span class="nf-hero-rating">★ ' + h.rating.toFixed(1) + '</span>');
        if (h.year) meta.push('<span>' + esc(h.year) + '</span>');
        (h.genres || []).slice(0, 3).forEach(function (g) { meta.push('<span>' + esc(g) + '</span>'); });
        if (h.episode) meta.push('<span>' + esc(h.episode) + '</span>');
        hero.className = 'nf-hero';
        hero.innerHTML =
          bg + '<div class="nf-hero-shade"></div>' +
          '<div class="nf-hero-body">' +
            (h.eyebrow ? '<div class="nf-hero-eyebrow">' + esc(h.eyebrow) + '</div>' : '') +
            '<h1 class="nf-hero-title">' + esc(h.title) + '</h1>' +
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
        function paintFav() {
          var on = !!h.isFav();
          fav.classList.toggle('on', on);
          fav.querySelector('span').textContent = on ? 'V oblíbených' : 'Do oblíbených';
        }
        fav.addEventListener('click', function () { h.onFav(); paintFav(); });
        paintFav();
      }

      function nfHeroFromContinue(c) {
        nfHeroShow({
          image: c.image, title: c.title, eyebrow: 'Pokračovat ve sledování',
          episode: c.episode + ' · ' + c.timeLeft + ' zbývá', progress: c.progress, playLabel: 'Pokračovat',
          onPlay: function () { window.mfhResume(); },
          isFav: function () {
            try { return c.slug && getWatchlist().some(function (w) { return w.slug === c.slug; }); } catch (e) { return false; }
          },
          onFav: function () { if (c.slug && typeof toggleWatchlistItem === 'function') toggleWatchlistItem(c.slug); }
        });
      }

      function nfHeroFromTmdb(it) {
        _heroItem = it;
        nfHeroShow({
          image: it.backdrop, title: it.title, eyebrow: '', badge: it.mediaType === 'tv' ? 'Seriál' : 'Film',
          rating: it.rating, year: it.ep, overview: it.overview,
          genres: (it.genreIds || []).map(function (g) { return GENRE_LABELS[g]; }).filter(Boolean),
          playLabel: 'Otevřít',
          onPlay: function () { mfhOpenCard(it.title, it.tmdbId, it.mediaType); },
          isFav: function () { try { return isTmdbFavorite(it.tmdbId, it.mediaType); } catch (e) { return false; } },
          onFav: function () {
            if (typeof toggleTmdbFavorite === 'function') toggleTmdbFavorite(it.tmdbId, it.mediaType, it.title, it.image, null);
          }
        });
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

      function mfhFetchForYou(tmdb) {
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
          return fetch(TMDB_BASE + '/discover/' + type + '?api_key=' + encodeURIComponent(key) + q)
            .then(function (r) { return r.json(); })
            .then(function (d) { return (d.results || []).map(toItem(type)); })
            .catch(function () { return []; });
        })).then(function (lists) {
          var out = [], max = Math.max(lists[0].length, lists[1].length);
          for (var i = 0; i < max; i++) { if (lists[0][i]) out.push(lists[0][i]); if (lists[1][i]) out.push(lists[1][i]); }
          return out;
        });
      }

      function renderHomepage() {
        nfRenderProfile();
        var host = document.getElementById('nfRows');
        if (!host) return;

        var hasHistory = mfhHasWatchHistory();
        var cont = hasHistory ? mfhGetRealContinueItem() : null;
        _lastContinue = cont;
        var recent = mfhRecentItems();
        var mine = mfhMyListItems();
        try { if (mine.some(function (m) { return !m.image && m.fav && m.fav.tmdbId; }) && window.mfBackfillFavPosters) window.mfBackfillFavPosters(); } catch (e) {}
        var genres = mfhTopGenreIdsWithProfile();

        var sig = JSON.stringify([
          cont && [cont.slug, cont.progress, cont.episode],
          recent.map(function (r) { return r.slug; }),
          mine.map(function (m) { return m.title; }),
          genres, !!getTmdbKey()
        ]);
        if (sig === _nfSig && host.children.length) return;
        _nfSig = sig;
        var myRun = ++_nfRun;
        host.innerHTML = '';

        if (cont) nfHeroFromContinue(cont); else nfHeroSkeleton();

        nfRowShell('mfhRecent', 'Nedávno sledováno');
        nfRowShell('mfhMyList', 'Oblíbené');
        var forYouTitle = genres.length ? 'Vybráno pro tebe' : 'Populární právě teď';
        var forYouSub = genres.length
          ? genres.map(function (g) { return GENRE_LABELS[g]; }).filter(Boolean).join(' · ')
          : 'Čím víc budeš sledovat, tím přesnější to bude';
        nfRowShell('mfhForYou', forYouTitle, forYouSub);
        nfRowShell('mfhTop10', 'Top 10 tento týden', '', true);
        var genreRows = genres.slice(0, 2).filter(function (g) { return GENRE_LABELS[g]; });
        genreRows.forEach(function (g) { nfRowShell('mfhGenre' + g, GENRE_LABELS[g]); });
        nfRowShell('mfhTopTv', 'Nejlépe hodnocené seriály');
        nfRowShell('mfhTopMovie', 'Nejlépe hodnocené filmy');

        nfFillRow('mfhRecent', recent);
        nfFillRow('mfhMyList', mine);

        if (!getTmdbKey()) {
          ['mfhForYou', 'mfhTop10', 'mfhTopTv', 'mfhTopMovie'].forEach(function (id) { nfFillRow(id, []); });
          genreRows.forEach(function (g) { nfFillRow('mfhGenre' + g, []); });
          if (!cont) {
            var h = document.getElementById('nfHero');
            if (h) h.className = 'nf-hero nf-hero-none';
          }
          return;
        }

        var seen = mfhSeenTmdbIds();
        var fresh = function (items) { return items.filter(function (it) { return !seen[it.tmdbId]; }); };

        fetchTmdbData().then(function (tmdb) {
          return mfhFetchForYou(tmdb);
        }).then(function (items) {
          if (myRun !== _nfRun) return;
          items = fresh(items.filter(function (it) { return it.image; })).slice(0, 20);
          nfFillRow('mfhForYou', items);
          if (!cont) {
            var pick = items.filter(function (it) { return it.backdrop && it.overview; })[0];
            if (pick) nfHeroFromTmdb(pick);
            else { var hh = document.getElementById('nfHero'); if (hh) hh.className = 'nf-hero nf-hero-none'; }
          }
        }).catch(function () {
          if (myRun !== _nfRun) return;
          nfFillRow('mfhForYou', []);
        });

        nfJson('/trending/all/week').then(function (d) {
          if (myRun !== _nfRun) return;
          nfFillRow('mfhTop10', nfItems(d).slice(0, 10), true);
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
        nfJson('/tv/top_rated').then(function (d) {
          if (myRun !== _nfRun) return;
          nfFillRow('mfhTopTv', fresh(nfItems(d, 'tv')).slice(0, 20));
        });
        nfJson('/movie/top_rated').then(function (d) {
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

      window.mfhResume = function () {
        var item = _lastContinue;
        if (!item) return;
        if (item.slug && typeof openSeries === 'function') {
          openSeries(item.slug);
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
            'cinemaModal', 'universeOverlay', 'watchlistOverlay', 'seriesModal',
            'premiereOverlay', 'collectionsOverlay', 'moodOverlay',
            'genreEditorOverlay', 'customizeOverlay',
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
            'premiereOverlay',
            'collectionsOverlay',
            'moodOverlay',
            'genreEditorOverlay',
            'customizeOverlay',
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
        'cinemaModal', 'mfStandaloneCinema', 'universeOverlay',
        'watchlistOverlay', 'seriesModal', 'premiereOverlay',
        'collectionsOverlay', 'moodOverlay', 'genreEditorOverlay',
        'customizeOverlay',
        'wrappedOverlay',
        'dockMoreSheet', 'mfhSeeAllModal'
      ];

      function dockShouldShow() {
        if (!document.documentElement.classList.contains('mfh-home-on')) return false;
        if (typeof window.mfDockTarget === 'function' && window.mfDockTarget() !== 'dockHome') return false;
        if (document.body.classList.contains('modal-open') ||
            document.body.classList.contains('discover-open')) return false;
        for (var i = 0; i < DOCK_HIDE_OVERLAY_IDS.length; i++) {
          var el = document.getElementById(DOCK_HIDE_OVERLAY_IDS[i]);
          if (el && (el.classList.contains('open') || el.classList.contains('visible') || el.classList.contains('show'))) {
            return false;
          }
        }
        return true;
      }

      function updateDockVisibility() {
        var dock = document.getElementById('mfDock');
        if (!dock) return;
        var show = dockShouldShow();
        // Nic neměnit, když se stav nezměnil — jinak každý zápis do style spustí
        // MutationObserver a ten volá tuto funkci znovu (nekonečná smyčka každých 200 ms)
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
    })();
