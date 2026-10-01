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

      function getRawUserName() {
        try {
          if (typeof getActiveProfile === 'function') {
            var active = getActiveProfile();
            if (active && active.name) return String(active.name).split(' ')[0];
          }
        } catch (e) {}
        try {
          var pid = localStorage.getItem('mf_active_pid');
          if (pid) {
            var profilesRaw = localStorage.getItem('mf_profiles_v2') || localStorage.getItem('mf_profiles');
            if (profilesRaw) {
              var profiles = JSON.parse(profilesRaw);
              if (Array.isArray(profiles)) {
                var found = profiles.find(function (p) { return p && p.id === pid; });
                if (found && found.name) return String(found.name).split(' ')[0];
              }
            }
          }
        } catch (e) {}
        try {
          var legacyKeys = ['mf_active_profile', 'mf_profile_name', 'mf_current_profile'];
          for (var i = 0; i < legacyKeys.length; i++) {
            var v = localStorage.getItem(legacyKeys[i]);
            if (!v) continue;
            try {
              var o = JSON.parse(v);
              if (o && o.name) return String(o.name).split(' ')[0];
            } catch (e2) {
              if (typeof v === 'string' && v.length < 40) return v.split(' ')[0];
            }
          }
        } catch (e) {}
        return null;
      }

      function getUserName() {
        var name = getRawUserName();
        if (!name) return 'kamaráde';
        try {
          if (typeof window.czechVocative === 'function') return window.czechVocative(name);
        } catch (e) {}
        return name;
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

      function renderContinue(item) {
        var card = document.getElementById('mfhContinueCard');
        if (!card) return;

        _lastContinue = item || null;

        var inFav = false;
        try {
          inFav = item.slug && typeof getWatchlist === 'function' &&
            getWatchlist().some(function (w) { return w.slug === item.slug; });
        } catch (e) {}

        card.innerHTML =
          '<div class="mfh-cont-info">' +
            '<div class="mfh-cont-eyebrow">Pokračovat ve sledování</div>' +
            '<h3 class="mfh-cont-title">' + esc(item.title) + '</h3>' +
            '<p class="mfh-cont-meta">' + esc(item.episode) + ' · ' + esc(item.timeLeft) + ' zbývá</p>' +
            '<p class="mfh-cont-desc">' + esc(item.description) + '</p>' +
            '<div class="mfh-cont-bar"><div class="mfh-cont-fill" style="width:' + item.progress + '%"></div></div>' +
            '<div class="mfh-cont-actions">' +
              '<button class="mfh-btn-primary" onclick="mfhResume()">▶ Pokračovat</button>' +
              (item.slug ?
                '<button class="mfh-btn-secondary" onclick="mfhToggleFav(\'' + esc(item.slug) + '\', this)">' +
                  (inFav ? '✓ V oblíbených' : '+ Oblíbené') +
                '</button>' : '') +
            '</div>' +
          '</div>' +
          '<div class="mfh-cont-image">' +
            '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" ' +
              'loading="lazy" class="mfh-poster-img mfh-skeleton" ' +
              'onerror="this.onerror=null;this.style.display=\'none\';if(this.parentElement)this.parentElement.classList.add(\'mfh-skeleton\');">' +
          '</div>';

        var img = card.querySelector('.mfh-poster-img');
        if (img) {
          img.addEventListener('load', function () {
            img.classList.remove('mfh-skeleton');
          });
        }
      }

      function mfhCardHtml(it, cid, idx) {
        var src = it.image ? esc(it.image) : '';
        return (
          '<div class="mfh-card" onclick="mfhOpenIdx(\'' + cid + '\',' + idx + ')">' +
            '<img class="mfh-card-img mfh-skeleton" ' +
              'src="' + src + '" ' +
              'alt="' + esc(it.title) + '" ' +
              'loading="lazy">' +
            '<div class="mfh-card-body">' +
              '<p class="mfh-card-title">' + esc(it.title) + '</p>' +
              (it.ep ? '<p class="mfh-card-ep">' + esc(it.ep) + '</p>' : '') +
            '</div>' +
          '</div>'
        );
      }

      function mfhBindCardImages(el) {
        el.querySelectorAll('.mfh-card-img').forEach(function (img) {
          img.addEventListener('load', function () {
            img.classList.remove('mfh-skeleton');
          });
          img.addEventListener('error', function () {
            img.classList.remove('mfh-skeleton');
            img.style.opacity = '0.3';
          });
        });
      }

      function renderCarousel(id, items) {
        var el = document.getElementById(id);
        if (!el) return;
        el._mfhItems = items || [];
        el.innerHTML = items.map(function (it, i) { return mfhCardHtml(it, id, i); }).join('');
        mfhBindCardImages(el);
      }

      window.mfhSeeAll = function (carouselId) {
        var carousel = document.getElementById(carouselId);
        var items = (carousel && carousel._mfhItems) || [];
        var section = carousel && carousel.closest('section');
        var titleEl = section && section.querySelector('.mfh-h2');
        var modal = document.getElementById('mfhSeeAllModal');
        if (!modal) return;
        var titleTarget = document.getElementById('mfhSeeAllTitle');
        if (titleTarget) titleTarget.textContent = titleEl ? titleEl.textContent : 'Vše';
        var grid = document.getElementById('mfhSeeAllGrid');
        if (grid) {
          grid.innerHTML = items.length
            ? items.map(function (it, i) { return mfhCardHtml(it, carouselId, i); }).join('')
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

      function mfhApplyHomeLayout(hasContinueItem) {
        var continueSection = document.getElementById('mfhContinue');
        var forYouSection = document.getElementById('mfhForYouSection');
        var forYouTitle = document.getElementById('mfhForYouTitle');
        var forYouSub = document.getElementById('mfhForYouSub');
        var wrap = document.querySelector('.mfh-wrap');

        if (continueSection) continueSection.style.display = hasContinueItem ? '' : 'none';

        if (forYouTitle) forYouTitle.textContent = hasContinueItem ? '✨ Vybráno pro tebe' : '✨ Pro tebe — mohlo by se ti líbit';
        if (forYouSub) forYouSub.textContent = hasContinueItem
          ? 'Podle toho, co poslední dobou sleduješ.'
          : 'Zatím jsi nic nesledoval/a — tohle by tě mohlo bavit.';

        if (wrap && forYouSection) {
          if (!hasContinueItem) {
            var welcome = wrap.querySelector('.mfh-welcome');
            if (welcome && welcome.nextSibling !== forYouSection) {
              wrap.insertBefore(forYouSection, welcome.nextSibling);
            }
          } else {
            var myListSection = document.getElementById('mfhMyList') && document.getElementById('mfhMyList').closest('section');
            if (myListSection && forYouSection.nextSibling !== myListSection) {
              wrap.insertBefore(forYouSection, myListSection);
            }
          }
        }
      }

      function mfhSetSection(el, visible) {
        var s = el && el.closest('section');
        if (s) s.style.display = visible ? '' : 'none';
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
            if (typeof db === 'undefined' || !db[slug]) continue;
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

      function mfhFetchForYou(tmdb) {
        var genres = mfhTopGenreIds();
        var key = getTmdbKey();
        var toItem = function (type) {
          return function (item) {
            return {
              title: item.title || item.name || 'Neznámé',
              image: getPosterUrl(item.poster_path, 'w300'),
              ep: (item.release_date || item.first_air_date || '').substring(0, 4),
              tmdbId: item.id,
              mediaType: type
            };
          };
        };
        if (!genres.length || !key) {
          return Promise.resolve((tmdb && tmdb.trending ? tmdb.trending : []).map(function (item) {
            return toItem(item.media_type || (item.title ? 'movie' : 'tv'))(item);
          }));
        }
        var q = '&language=cs-CZ&sort_by=popularity.desc&vote_count.gte=100&with_genres=' + encodeURIComponent(genres.join('|'));
        return Promise.all(['tv', 'movie'].map(function (type) {
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
        try {
          var nameEl = document.getElementById('mfhUserName');
          if (nameEl) nameEl.textContent = getUserName();
        } catch (e) {
          console.warn('[mfh] renderHomepage error:', e);
        }

        var hasHistory = mfhHasWatchHistory();
        var realContinueItem = hasHistory ? mfhGetRealContinueItem() : null;
        mfhApplyHomeLayout(!!realContinueItem);
        if (realContinueItem) renderContinue(realContinueItem);
        else _lastContinue = null;

        var recent = mfhRecentItems();
        renderCarousel('mfhRecent', recent);
        mfhSetSection(document.getElementById('mfhRecent'), recent.length > 0);

        var mine = mfhMyListItems();
        renderCarousel('mfhMyList', mine);
        mfhSetSection(document.getElementById('mfhMyList'), mine.length > 0);

        fetchTmdbData().then(function (tmdb) {
          return mfhFetchForYou(tmdb);
        }).then(function (items) {
          var seen = mfhSeenTmdbIds();
          items = items.filter(function (it) { return it.image && !seen[it.tmdbId]; }).slice(0, 20);
          renderCarousel('mfhForYou', items);
          mfhSetSection(document.getElementById('mfhForYou'), items.length > 0);
        }).catch(function (e) {
          console.warn('[mfh] renderHomepage for-you error:', e);
          renderCarousel('mfhForYou', []);
          mfhSetSection(document.getElementById('mfhForYou'), false);
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
            document.body.classList.contains('discover-open') ||
            document.body.classList.contains('disco-open')) return false;
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
        dock.style.setProperty('display', show ? 'flex' : 'none', 'important');
        dock.style.setProperty('visibility', show ? 'visible' : 'hidden', 'important');
        dock.style.setProperty('pointer-events', show ? 'auto' : 'none', 'important');
        if (show) dock.style.setProperty('opacity', '1', 'important');
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
        var dock = document.getElementById('mfDock');
        if (!home || !dock || home._mfhDockFadeBound) return;
        home._mfhDockFadeBound = true;

        var MAX_SCROLL = 200;

        dock.style.setProperty('transition', 'opacity 0.16s ease-out', 'important');

        var ticking = false;
        function applyOpacity() {
          ticking = false;
          if (!document.body.classList.contains('mfh-home-on')) return;
          var y = home.scrollTop;
          var ratio = Math.min(1, Math.max(0, y / MAX_SCROLL));
          var opacity = 1 - ratio;
          dock.style.setProperty('opacity', opacity.toFixed(2), 'important');
          dock.style.setProperty('pointer-events', ratio > 0.92 ? 'none' : 'auto', 'important');
        }

        home.addEventListener('scroll', function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(applyOpacity);
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
