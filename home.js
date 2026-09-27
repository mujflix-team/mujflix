/* ══════════════════════════════════════════════════════════════
   MůjFlix — home.js
   Přesunuto z inline <script id="mfh-script"> v index.html.
   Používá document.addEventListener("DOMContentLoaded", ...) —
   s "defer" se chová stejně (spustí se před DOMContentLoaded).
   ══════════════════════════════════════════════════════════════ */
    (function () {
      'use strict';
      if (window._mfhInstalled) return;
      window._mfhInstalled = true;
      console.log('[mfh] Script START');

      /* ═══════════ DATA ═══════════ */
      var DATA = {
        continueWatching: {
          title: 'Simpsonovi',
          episode: 'S12 E04',
          timeLeft: '18 min',
          description: 'Homer se tentokrát zaplete do podvodného plánu, který zahrnuje...',
          progress: 85,
          image: 'https://image.tmdb.org/t/p/w780/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg'
        },
        recentlyWatched: [
          { title: 'Rick and Morty', ep: 'S6 E1', image: 'https://image.tmdb.org/t/p/w300/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg' },
          { title: 'Simpsonovi',     ep: 'S6 E1', image: 'https://image.tmdb.org/t/p/w300/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg' },
          { title: 'Futurama',       ep: 'S6 E1', image: 'https://image.tmdb.org/t/p/w300/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg' },
          { title: 'South Park',     ep: 'S6 E1', image: 'https://image.tmdb.org/t/p/w300/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg' },
          { title: 'Family Guy',     ep: 'S6 E1', image: 'https://image.tmdb.org/t/p/w300/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg' }
        ],
        forYou: [
          { title: 'Kočka',       image: 'https://image.tmdb.org/t/p/w300/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg' },
          { title: 'Temný rytíř', image: 'https://image.tmdb.org/t/p/w300/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg' },
          { title: 'Earth',       image: 'https://image.tmdb.org/t/p/w300/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg' },
          { title: 'Simpsonovi',  image: 'https://image.tmdb.org/t/p/w300/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg' },
          { title: 'Futurama',    image: 'https://image.tmdb.org/t/p/w300/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg' }
        ],
        myList: [
          { title: 'MůjFlix',     image: 'https://image.tmdb.org/t/p/w300/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg' },
          { title: 'Temný rytíř', image: 'https://image.tmdb.org/t/p/w300/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg' },
          { title: 'Avengers',    image: 'https://image.tmdb.org/t/p/w300/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg' },
          { title: 'Müdenieek',   image: 'https://image.tmdb.org/t/p/w300/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg' },
          { title: 'Rick a Morty',image: 'https://image.tmdb.org/t/p/w300/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg' }
        ]
      };
      window.MFH_DATA = DATA;
      var _lastContinue = DATA.continueWatching;

      function esc(s) {
        return String(s == null ? '' : s)
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
      }

      function getRawUserName() {
        // Zkusí nejdřív skutečný profilový systém appky (mf_active_pid + mf_profiles_v2),
        // pak historicky používané klíče pro zpětnou kompatibilitu.
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

      /* ═══════════ TMDB API NASTAVENÍ ═══════════ */
      var TMDB_BASE = 'https://api.themoviedb.org/3';
      var TMDB_IMG = 'https://image.tmdb.org/t/p';
      var _tmdbPromise = null;

      function getTmdbKey() {
        return localStorage.getItem('mf_tmdb_key') ||
          (typeof TMDB_KEY !== 'undefined' ? TMDB_KEY : '') ||
          window.TMDB_KEY || '';
      }

      /* ═══════════ NAČTENÍ DAT Z TMDB ═══════════ */
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

      /* ═══════════ SKUTEČNÁ HISTORIE SLEDOVÁNÍ (per profil) ═══════════
         Homepage dřív vždy ukazovala "Pokračovat ve sledování" se stejným
         trendujícím titulem z TMDB (nebo natvrdo se Simpsonovými) úplně
         nezávisle na tom, jestli daný profil vůbec něco sledoval — proto
         to bylo pro každý nový profil stejné (stejný film, stejný čas).
         Tyhle funkce čtou reálná data konkrétního profilu (stejné klíče,
         jaké používá zbytek appky přes uKey() v app.js). */
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

      /* Sestaví reálnou kartu "Pokračovat ve sledování" z poslední rozečtené
         položky konkrétního profilu — ne z globálního TMDB trendu. */
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
            if (!next) continue; // odkoukáno celé — zkus další seriál v historii
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

      /* ═══════════ RENDER KARTY "POKRAČOVAT VE SLEDOVÁNÍ" ═══════════ */
      function renderContinue(item) {
        var card = document.getElementById('mfhContinueCard');
        if (!card) return;

        _lastContinue = item || null;

        card.innerHTML =
          '<div class="mfh-cont-info">' +
            '<div class="mfh-cont-eyebrow">Pokračovat ve sledování</div>' +
            '<h3 class="mfh-cont-title">' + esc(item.title) + '</h3>' +
            '<p class="mfh-cont-meta">' + esc(item.episode) + ' · ' + esc(item.timeLeft) + ' zbývá</p>' +
            '<p class="mfh-cont-desc">' + esc(item.description) + '</p>' +
            '<div class="mfh-cont-bar"><div class="mfh-cont-fill" style="width:' + item.progress + '%"></div></div>' +
            '<div class="mfh-cont-actions">' +
              '<button class="mfh-btn-primary" onclick="mfhResume()">▶ Pokračovat</button>' +
              '<button class="mfh-btn-secondary" onclick="mfhToggleList(this)">+ Oblíbené</button>' +
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

      /* ═══════════ RENDER KARUSELU ═══════════ */
      function renderCarousel(id, items) {
        var el = document.getElementById(id);
        if (!el) return;

        el.innerHTML = items.map(function (it) {
          var src = it.image ? esc(it.image) : '';
          var tmdbId = it.tmdbId ? String(it.tmdbId) : '';
          var mediaType = it.mediaType ? String(it.mediaType) : '';
          return (
            '<div class="mfh-card" onclick="mfhOpenCard(\'' + esc(it.title) + '\',\'' + esc(tmdbId) + '\',\'' + esc(mediaType) + '\')">' +
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
        }).join('');

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

      /* Přeuspořádá homepage sekce podle toho, jestli profil má historii
         sledování. Bez historie: "Pokračovat ve sledování" a "Nedávno
         sledováno" zmizí (nemá smysl je ukazovat) a "Vybráno pro tebe" /
         "Mohlo by se ti líbit" se přesune úplně nahoru, hned pod uvítání.
         Jakmile profil něco sleduje, sekce se vrátí do původního pořadí
         a "Pokračovat ve sledování" se naplní reálnými daty. */
      function mfhApplyHomeLayout(hasContinueItem) {
        var continueSection = document.getElementById('mfhContinue');
        var recentSection = document.getElementById('mfhRecentSection');
        var forYouSection = document.getElementById('mfhForYouSection');
        var forYouTitle = document.getElementById('mfhForYouTitle');
        var forYouSub = document.getElementById('mfhForYouSub');
        var wrap = document.querySelector('.mfh-wrap');

        if (continueSection) continueSection.style.display = hasContinueItem ? '' : 'none';
        if (recentSection) recentSection.style.display = hasContinueItem ? '' : 'none';

        if (forYouTitle) forYouTitle.textContent = hasContinueItem ? '✨ Vybráno pro tebe' : '✨ Pro tebe — mohlo by se ti líbit';
        if (forYouSub) forYouSub.textContent = hasContinueItem
          ? 'Podle toho, co poslední dobou sleduješ.'
          : 'Zatím jsi nic nesledoval/a — tohle by tě mohlo bavit.';

        if (wrap && forYouSection) {
          if (!hasContinueItem) {
            // Nový profil bez historie → "Pro tebe" jde jako první obsahová sekce.
            var welcome = wrap.querySelector('.mfh-welcome');
            if (welcome && welcome.nextSibling !== forYouSection) {
              wrap.insertBefore(forYouSection, welcome.nextSibling);
            }
          } else {
            // Profil s historií → původní pořadí (Pokračovat, Nedávno, Pro tebe, Seznam).
            var myListSection = document.getElementById('mfhMyList') && document.getElementById('mfhMyList').closest('section');
            if (myListSection && forYouSection.nextSibling !== myListSection) {
              wrap.insertBefore(forYouSection, myListSection);
            }
          }
        }
      }

      /* ═══════════ RENDER HOME PAGE S REÁLNÝMI DATY Z TMDB ═══════════ */
      function renderHomepage() {
        try {
          var nameEl = document.getElementById('mfhUserName');
          if (nameEl) nameEl.textContent = getUserName();
        } catch (e) {
          console.warn('[mfh] renderHomepage error:', e);
        }

        // Continue-watching se teď počítá ze skutečné historie profilu,
        // ne z globálního TMDB trendu — jinak by měl každý profil pořád
        // to samé (stejný titul, stejný zbývající čas).
        var hasHistory = mfhHasWatchHistory();
        var realContinueItem = hasHistory ? mfhGetRealContinueItem() : null;
        mfhApplyHomeLayout(!!realContinueItem);
        if (realContinueItem) renderContinue(realContinueItem);

        fetchTmdbData().then(function (tmdb) {
          if (tmdb && tmdb.trending && tmdb.trending.length) {
            if (realContinueItem) {
              renderCarousel('mfhRecent', tmdb.trending.map(function (item) {
                return {
                  title: item.title || item.name || 'Neznámé',
                  image: getPosterUrl(item.poster_path, 'w300'),
                  tmdbId: item.id,
                  mediaType: item.media_type || (item.title ? 'movie' : 'tv')
                };
              }));
            }

            renderCarousel('mfhForYou', tmdb.tv.map(function (item) {
              return {
                title: item.name || 'Neznámé',
                image: getPosterUrl(item.poster_path, 'w300'),
                ep: item.first_air_date ? item.first_air_date.substring(0, 4) : '',
                tmdbId: item.id,
                mediaType: 'tv'
              };
            }));

            renderCarousel('mfhMyList', tmdb.movies.map(function (item) {
              return {
                title: item.title || 'Neznámé',
                image: getPosterUrl(item.poster_path, 'w300'),
                ep: item.release_date ? item.release_date.substring(0, 4) : '',
                tmdbId: item.id,
                mediaType: 'movie'
              };
            }));
          } else {
            if (realContinueItem) renderCarousel('mfhRecent', DATA.recentlyWatched);
            renderCarousel('mfhForYou', DATA.forYou);
            renderCarousel('mfhMyList', DATA.myList);
          }
        }).catch(function (e) {
          console.warn('[mfh] renderHomepage fallback:', e);
          if (realContinueItem) renderCarousel('mfhRecent', DATA.recentlyWatched);
          renderCarousel('mfhForYou', DATA.forYou);
          renderCarousel('mfhMyList', DATA.myList);
        });
      }

      window.mfhResume = function () {
        var item = _lastContinue || DATA.continueWatching;
        if (item && item.tmdbId) {
          mfhOpenCard(item.title, item.tmdbId, item.mediaType || 'movie');
          return;
        }
        if (typeof openSeries === 'function') openSeries('the-simpsons');
      };
      window.mfhToggleList = function (btn) {
        var isIn = btn.textContent.indexOf('+') === -1;
        btn.textContent = isIn ? '+ Oblíbené' : '✓ V seznamu';
        btn.style.background = isIn ? '' : 'rgba(0,122,255,0.15)';
      };
      /* ═══════════ CINEMA — napojení na MFCinemaPlayer ═══════════ */
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
        console.log('[mfh] Otevřít kartu:', title, tmdbId, mediaType);

        var cinType = (mediaType === 'tv' || mediaType === 'tv_ep') ? 'tv_ep' : 'movie';

        // OPRAVA: seriály z homepage skákaly rovnou do cinema módu s napevno
        // nastavenou S1E1 (bez ohledu na to, kolik sérií/epizod seriál má) a
        // bez načtení dat o seriálu — proto 404 na zdroji. Přes "Objevovat"
        // to funguje správně, protože tam se volá openDiscoverTv(), která
        // nejdřív stáhne sezóny/epizody a otevře pořádný výběr. Homepage teď
        // pro seriály dělá přesně to samé; u filmů se nic nemění.
        if (cinType === 'tv_ep' && tmdbId && typeof openDiscoverTv === 'function') {
          openDiscoverTv(tmdbId, title);
          return;
        }

        // ── Použij MFCinemaPlayer (Bombuj, SvetSerialu, Prehrajto, Uzi.la) ──
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

        // ── Fallback: app.js openMovieInCinema ──
        if (typeof openMovieInCinema === 'function' && tmdbId) {
          openMovieInCinema(tmdbId, title, cinType === 'tv_ep' ? 'tv' : 'movie');
          mfhUnlockCinema();
          return;
        }

        // ── Poslední záchrana ──
        if (typeof showToast === 'function') {
          showToast('⚠ ' + title, 'info');
        }
      };

      /* ═══════════ INJECT CSS DO <head> — nepřepsatelné ═══════════ */
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
        console.log('[mfh] Hard CSS injected');
      }

      /* ═══════════ FORCE HOMEPAGE ═══════════ */
      function forceHome(opts) {
        // VÝKON: forceHome() se volá automaticky ~12× během prvních pár
        // vteřin po startu appky (boot schedule + window.load + reakce na
        // zmizení profile gate + storage event) a pokaždé dělá netriviální
        // práci (zavírá 18 elementů, přestavuje homepage, stahuje z TMDB).
        // Naměřeno: 14 volání za 6,5 s. Reálná potřeba je spustit to jen
        // tehdy, když se od posledního běhu něco skutečně mohlo změnit —
        // ne pokaždé znovu během pár desítek ms. Throttle na 400 ms kolo
        // (kromě force:true, tam se má spustit vždy hned – používá ho jen
        // klik na "Domů").
        var now = Date.now();
        if (!(opts && opts.force) && now - (forceHome._lastRun || 0) < 400) {
          return;
        }
        forceHome._lastRun = now;
        try {
          // OPRAVA: forceHome() se volá i automaticky několikrát po startu
          // appky (50 ms až 5 s po načtení) a dřív bezpodmínečně zavírala
          // VŠECHNY overlaye (Objevování, Oblíbené, detail seriálu, …) —
          // i ten, co uživatel zrovna sám otevřel klikem během té doby.
          // Efekt: klik na "Objevovat"/"Oblíbené" krátce po startu appky
          // vypadal, že "nic neudělá", protože se okno hned zase zabouchlo.
          // Teď kontrolujeme, jestli je otevřený JAKÝKOLI overlay (ne jen
          // cinema) a pokud ano, forceHome (bez explicitního force:true)
          // ho nechá být — automatické volání po startu nemá přebíjet
          // reálnou akci uživatele.
          var OPEN_OVERLAY_IDS = [
            'cinemaModal', 'universeOverlay', 'watchlistOverlay', 'seriesModal',
            'premiereOverlay', 'collectionsOverlay', 'moodOverlay',
            'genreEditorOverlay', 'traktOverlay', 'customizeOverlay',
            'voiceCmdOverlay', 'wrappedOverlay', 'adminPanel',
            'adminLoginModal', 'aiFullscreen', 'aiApikeyOverlay', 'dockMoreSheet'
          ];
          var anyOverlayOpen = OPEN_OVERLAY_IDS.some(function (id) {
            var el = document.getElementById(id);
            return el && el.classList.contains('open') &&
              getComputedStyle(el).display !== 'none';
          });
          if (anyOverlayOpen && !(opts && opts.force)) {
            return;
          }

          // Klasický na <html> i <body>
          document.documentElement.classList.add('mfh-home-on');
          document.body.classList.add('mfh-home-on');

          // 🔥 ZAVŘI VŠECHNY OVERLAYE (včetně cinema, které jinak žere kliky)
          var overlaysToClose = [
            'universeOverlay',
            'watchlistOverlay',
            'seriesModal',
            'cinemaModal',
            'premiereOverlay',
            'collectionsOverlay',
            'moodOverlay',
            'genreEditorOverlay',
            'traktOverlay',
            'customizeOverlay',
            'voiceCmdOverlay',
            'wrappedOverlay',
            'adminPanel',
            'adminLoginModal',
            'aiFullscreen',
            'aiApikeyOverlay',
            'dockMoreSheet'
          ];
          overlaysToClose.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
              // OPRAVA: dřív se tu navíc dávalo
              //   el.style.setProperty('display', 'none', 'important')
              // — inline !important, který zůstane na elementu navždy
              // (dokud ho něco explicitně nesmaže). Funkce pro otevření
              // overlaye (openUniverse, openWatchlist, …) ale jen přidávají
              // CSS třídy "open"/"visible" a inline styl nikdy nemažou —
              // takže jakmile forceHome() proběhne jednou (a běží
              // automaticky hned po startu appky), overlay zůstane
              // "otrávený" a NEJDE HO UŽ NIKDY OTEVŘÍT, i když se třídy
              // správně přidají. Odebrání tříd samo o sobě stačí — bez
              // třídy "open" element skryje základní (ne-!important)
              // "display:none" ve stylesheetu.
              el.style.removeProperty('pointer-events');
              el.classList.remove('active', 'open', 'visible', 'show');
            }
          });
          document.body.classList.remove('modal-open');
          document.documentElement.classList.remove('modal-open');
          document.body.style.overflow = '';

          // Inline !important backup na tile menu
          document.querySelectorAll('.ps-menu-scene, #mainMenu').forEach(function (m) {
            m.style.setProperty('display', 'none', 'important');
          });

          // Skryj ostatní sekce
          ['mfSectionProtebe', 'mfSectionFilmy', 'mfSectionPlex'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });

          // Ukaž homepage + dock (klikatelné)
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

          // Naplň daty
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

      /* ═══════════ OVERRIDE mfShowSection ═══════════ */
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
        console.log('[mfh] mfShowSection wrapped');
        return true;
      }

      /* ═══════════ HOOK NA DOCK ═══════════ */
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

      /* ═══════════ DOCK — plynulé prosvítání podle scrollu na homepage ═══════════
         Dřív měl dock na homepage vždy pevnou neprůhlednost (CSS pravidlo
         "#mfDock, .mf-dock { opacity: 1 !important }"). Teď se při
         scrollování dolů dock postupně zprůhlední (méně ruší nad
         obsahem) a při scrollu zpět nahoru se plynule vrátí do plné
         neprůhlednosti. Přechod je rychlý (~160 ms), aby to nepůsobilo
         líně/zaseknutě. Dock nikdy úplně nezmizí (zůstává klikatelný). */
      function initHomeDockScrollFade() {
        var home = document.getElementById('mfSectionHome');
        var dock = document.getElementById('mfDock');
        if (!home || !dock || home._mfhDockFadeBound) return;
        home._mfhDockFadeBound = true;

        var MAX_SCROLL = 200; // px, po kolika pixelech scrollu dock úplně zmizí

        // Inline !important, protože CSS pravidlo "opacity: 1 !important"
        // by jinak transition u opacity ignorovalo (jiné !important
        // pravidlo v styles.css navíc nastavuje "transition: none !important").
        dock.style.setProperty('transition', 'opacity 0.16s ease-out', 'important');

        var ticking = false;
        function applyOpacity() {
          ticking = false;
          if (!document.body.classList.contains('mfh-home-on')) return;
          var y = home.scrollTop;
          var ratio = Math.min(1, Math.max(0, y / MAX_SCROLL));
          var opacity = 1 - ratio; // dole úplně zmizí (0), nahoře plně viditelný (1)
          dock.style.setProperty('opacity', opacity.toFixed(2), 'important');
          // Skoro neviditelný dock nesmí blokovat kliky na obsah pod ním —
          // jakmile zprůhlední skoro na 0, přestane brát kliky, a při
          // scrollu zpátky nahoru se klikatelnost hned vrátí.
          dock.style.setProperty('pointer-events', ratio > 0.92 ? 'none' : 'auto', 'important');
        }

        home.addEventListener('scroll', function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(applyOpacity);
        }, { passive: true });
      }

      /* ═══════════ INIT ═══════════ */
      function init() {
        console.log('[mfh] init START');
        injectHardCSS();
        hookDock();
        initHomeDockScrollFade();

        // Opakovaně wrapuj mfShowSection
        var attempts = 0;
        var wid = setInterval(function () {
          wrapShowSection();
          hookDock();
          initHomeDockScrollFade();
          if (++attempts > 600) clearInterval(wid); // 30 sekund
        }, 50);

        // 🔥 PERMANENTNÍ INTERVAL — nikdy nezastaví
        setInterval(function () {
          // Pokud máme home-on a ps-menu-scene je viditelný, schovej
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
        }, 500); // VÝKON: 2× za sekundu místo 5× — pořád dost rychlé na "safety net", ale běží to navždy, tak ať to neškube CPU zbytečně

        // Po startu několikrát forceHome
        [50, 150, 300, 600, 1000, 1500, 2000, 3000, 5000].forEach(function (t) {
          setTimeout(forceHome, t);
        });

        // MutationObserver na celý document
        // VÝKON: tenhle observer sleduje ÚPLNĚ CELÝ dokument (childList +
        // subtree + attributes), takže ho spustí i drobné věci jako hover
        // efekt nebo GSAP animace kdekoli v appce — naměřeno 267 spuštění
        // za 6,5 s, z toho hodně dělalo querySelectorAll + getComputedStyle
        // (vynucený přepočet stylů). Teď se skutečná kontrola provede
        // nejvýš jednou za animační snímek (requestAnimationFrame), i když
        // MutationObserver nahlásí mutace vícekrát v rychlém sledu.
        if (document.documentElement) {
          var mfhDocMoRaf = null;
          var mo = new MutationObserver(function (muts) {
            if (mfhDocMoRaf) return;
            mfhDocMoRaf = requestAnimationFrame(function () {
              mfhDocMoRaf = null;
              if (!document.documentElement.classList.contains('mfh-home-on')) return;
              document.querySelectorAll('.ps-menu-scene').forEach(function (m) {
                if (getComputedStyle(m).display !== 'none') {
                  m.style.setProperty('display', 'none', 'important');
                }
              });
            });
          });
          mo.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });
        }

        // Reaguj na změnu localStorage
        window.addEventListener('storage', function (e) {
          if (e.key && e.key.indexOf('mf_') === 0) setTimeout(forceHome, 300);
        });

        // Když zmizí profile gate → force home
        var gateEl = document.getElementById('mfProfileGate');
        if (gateEl) {
          var go = new MutationObserver(function () {
            var hidden = gateEl.style.display === 'none' ||
                         getComputedStyle(gateEl).display === 'none';
            if (hidden) setTimeout(forceHome, 200);
          });
          go.observe(gateEl, { attributes: true, attributeFilter: ['style', 'class'] });
        }

        console.log('[mfh] init DONE — homepage aktivní');
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }

      // Ještě jeden pokus po window.load
      window.addEventListener('load', function () {
        setTimeout(forceHome, 300);
        setTimeout(forceHome, 1500);
      });

      /* ═══════════ ZÁCHRANA – pokud cinema zůstane prázdný ═══════════ */
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
