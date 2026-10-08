/* MůjFlix — Objevovat: banner + řady podle žánru + filtry + hledání */
(function () {
  'use strict';

  var IMG = 'https://image.tmdb.org/t/p/';
  var HISTORY_KEY = 'mf_search_history_v2';

  /* Žánry: pro každý typ jiné ID v TMDB (null = daný typ tento žánr nemá) */
  var GENRES = [
    { key: 'akcni', name: 'Akční a dobrodružné', movie: '28|12', tv: '10759' },
    { key: 'anim', name: 'Animované', movie: '16', tv: '16' },
    { key: 'kom', name: 'Komedie', movie: '35', tv: '35' },
    { key: 'krimi', name: 'Krimi', movie: '80', tv: '80' },
    { key: 'dok', name: 'Dokumenty', movie: '99', tv: '99' },
    { key: 'drama', name: 'Drama', movie: '18', tv: '18' },
    { key: 'rod', name: 'Rodinné', movie: '10751', tv: '10751' },
    { key: 'scifi', name: 'Sci-Fi a fantasy', movie: '878|14', tv: '10765' },
    { key: 'horor', name: 'Horor', movie: '27', tv: null },
    { key: 'thr', name: 'Thriller a mysteriózní', movie: '53|9648', tv: '9648' },
    { key: 'rom', name: 'Romantické', movie: '10749', tv: null },
    { key: 'val', name: 'Válečné', movie: '10752', tv: '10768' },
    { key: 'hist', name: 'Historické', movie: '36', tv: null }
  ];

  var GENRE_NAMES = {
    28: 'Akční', 12: 'Dobrodružný', 16: 'Animovaný', 35: 'Komedie', 80: 'Krimi', 99: 'Dokumentární',
    18: 'Drama', 10751: 'Rodinný', 14: 'Fantasy', 36: 'Historický', 27: 'Horor', 10402: 'Hudební',
    9648: 'Mysteriózní', 10749: 'Romantický', 878: 'Sci-Fi', 53: 'Thriller', 10752: 'Válečný', 37: 'Western',
    10759: 'Akční a dobrodružný', 10762: 'Dětský', 10763: 'Zprávy', 10764: 'Reality', 10765: 'Sci-Fi a fantasy',
    10766: 'Telenovela', 10767: 'Talk show', 10768: 'Válka a politika'
  };

  var SORTS = [
    { key: 'popular', label: 'Populární' },
    { key: 'rating', label: 'Nejlépe hodnocené' },
    { key: 'newest', label: 'Nejnovější' }
  ];

  var state = { type: 'all', genre: '', sort: 'popular', year: '', query: '' };
  var run = 0;
  var searchTimer = null;
  var gridCtx = null;
  var observer = null;
  var built = false;
  var closeTimer = null;
  var els = {};
  var legacyClose = typeof window.closeUniverse === 'function' ? window.closeUniverse : null;

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function hasKey() {
    try {
      return !!((typeof TMDB_KEY !== 'undefined' && TMDB_KEY) || (window.MF_PROXY && window.MF_PROXY.enabled));
    } catch (e) { return false; }
  }

  function api(path) {
    return tmdbGet(path).catch(function () { return null; });
  }

  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function genreByKey(key) {
    for (var i = 0; i < GENRES.length; i++) if (GENRES[i].key === key) return GENRES[i];
    return null;
  }

  function genreIdsFor(g) {
    var out = {};
    [g.movie, g.tv].forEach(function (s) {
      if (s) String(s).split('|').forEach(function (x) { out[x] = true; });
    });
    return out;
  }

  function genreForId(id) {
    id = String(id);
    for (var i = 0; i < GENRES.length; i++) if (genreIdsFor(GENRES[i])[id]) return GENRES[i];
    return null;
  }

  /* ---------- Normalizace položek ---------- */

  function norm(r, forcedType) {
    var type = forcedType || r.media_type || (r.title ? 'movie' : 'tv');
    if (type !== 'movie' && type !== 'tv') return null;
    var date = String(r.release_date || r.first_air_date || '');
    return {
      id: r.id,
      type: type,
      title: r.title || r.name || r.original_title || r.original_name || '',
      year: date.slice(0, 4),
      date: date,
      rating: Number(r.vote_average) || 0,
      pop: Number(r.popularity) || 0,
      poster: r.poster_path ? IMG + 'w342' + r.poster_path : '',
      backdrop: r.backdrop_path ? IMG + 'w1280' + r.backdrop_path : '',
      overview: r.overview || '',
      genreIds: Array.isArray(r.genre_ids) ? r.genre_ids : []
    };
  }

  function normList(results, forcedType) {
    var out = [];
    (results || []).forEach(function (r) {
      if (!r || typeof r !== 'object') return;
      var n = norm(r, forcedType);
      if (n && n.poster && n.title) out.push(n);
    });
    return out;
  }

  function interleave(a, b) {
    var out = [], max = Math.max(a.length, b.length);
    for (var i = 0; i < max; i++) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); }
    return out;
  }

  function sortVal(it, sort) {
    if (sort === 'rating') return it.rating;
    if (sort === 'newest') return it.date || '';
    return it.pop;
  }

  function mergeBy(sort, a, b) {
    return a.concat(b).sort(function (x, y) {
      var kx = sortVal(x, sort), ky = sortVal(y, sort);
      return kx < ky ? 1 : kx > ky ? -1 : 0;
    });
  }

  /* ---------- Oblíbené a historie hledání ---------- */

  function isFav(it) {
    try { return typeof isTmdbFavorite === 'function' && isTmdbFavorite(it.id, it.type); } catch (e) { return false; }
  }

  function toggleFav(it, btn) {
    if (typeof toggleTmdbFavorite !== 'function') return;
    toggleTmdbFavorite(it.id, it.type, it.title, it.poster, null);
    var on = isFav(it);
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? 'Odebrat z Oblíbených' : 'Přidat do Oblíbených';
    if (on) {
      try { if (it.genreIds.length) aiBrain.boostGenreIds(it.genreIds, 0.12); } catch (e) {}
    }
  }

  function histKey() {
    try { return typeof uKey === 'function' ? uKey(HISTORY_KEY) : HISTORY_KEY; } catch (e) { return HISTORY_KEY; }
  }

  function getHistory() {
    try {
      var h = JSON.parse(localStorage.getItem(histKey()) || '[]');
      return Array.isArray(h) ? h : [];
    } catch (e) { return []; }
  }

  function setHistory(list) {
    try { localStorage.setItem(histKey(), JSON.stringify(list.slice(0, 8))); } catch (e) {}
  }

  function pushHistory(q) {
    q = (q || '').trim();
    if (q.length < 2) return;
    var h = getHistory().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
    h.unshift(q);
    setHistory(h);
  }

  /* ---------- Otevření položky ---------- */

  function openItem(it) {
    if (state.query) pushHistory(state.query);
    try {
      if (it.genreIds.length) aiBrain.boostGenreIds(it.genreIds, 0.05);
      aiBrain.recordTmdbSeen(it.id);
    } catch (e) {}
    window._mfFinderTmdbId = it.id;
    window._cinYear = it.year || null;
    if (it.type === 'tv') {
      if (typeof openDiscoverTv === 'function') openDiscoverTv(it.id, it.title);
    } else if (typeof _showCinemaOrFinderChoice === 'function') {
      _showCinemaOrFinderChoice(it.id, it.title, 'movie', it.title);
    }
  }

  /* ---------- Stavební prvky ---------- */

  var HEART = 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z';

  function svg(path, size) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('width', size || 18);
    s.setAttribute('height', size || 18);
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', path);
    s.appendChild(p);
    return s;
  }

  function favButton(it, cls) {
    var b = el('button', cls || 'dv-fav');
    b.type = 'button';
    var on = isFav(it);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.title = on ? 'Odebrat z Oblíbených' : 'Přidat do Oblíbených';
    b.setAttribute('aria-label', 'Oblíbené: ' + it.title);
    b.appendChild(svg(HEART, 18));
    b.addEventListener('click', function (e) { e.stopPropagation(); toggleFav(it, b); });
    return b;
  }

  function card(it, showType) {
    var c = el('div', 'dv-card');
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-label', 'Otevřít ' + it.title);

    var p = el('div', 'dv-poster dv-skel');
    var img = new Image();
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('load', function () { p.classList.remove('dv-skel'); });
    img.addEventListener('error', function () {
      p.classList.remove('dv-skel');
      img.remove();
      p.appendChild(el('div', 'dv-poster-fallback', it.type === 'tv' ? '📺' : '🎬'));
    });
    img.src = it.poster;
    p.appendChild(img);
    if (it.rating > 0) p.appendChild(el('span', 'dv-rate', '★ ' + it.rating.toFixed(1)));
    if (showType) p.appendChild(el('span', 'dv-type', it.type === 'tv' ? 'Seriál' : 'Film'));
    p.appendChild(favButton(it));
    c.appendChild(p);

    c.appendChild(el('div', 'dv-card-title', it.title));
    var meta = [];
    if (it.year) meta.push(it.year);
    if (!showType) meta.push(it.type === 'tv' ? 'Seriál' : 'Film');
    c.appendChild(el('div', 'dv-card-meta', meta.join(' · ')));

    c.addEventListener('click', function () { openItem(it); });
    c.addEventListener('keydown', function (e) {
      if (e.target !== c) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(it); }
    });
    return c;
  }

  function section(title, sub) {
    var s = el('section', 'dv-row');
    var head = el('div', 'dv-row-head');
    head.appendChild(el('h2', 'dv-row-title', title));
    if (sub) head.appendChild(el('p', 'dv-row-sub', sub));
    s.appendChild(head);
    return s;
  }

  function rowSkeleton() {
    var wrap = el('div', 'dv-scroller');
    var track = el('div', 'dv-track');
    for (var i = 0; i < 8; i++) {
      var c = el('div', 'dv-card');
      c.appendChild(el('div', 'dv-poster dv-skel'));
      c.appendChild(el('div', 'dv-card-title dv-skel-line'));
      track.appendChild(c);
    }
    wrap.appendChild(track);
    return wrap;
  }

  function arrow(dir, track) {
    var b = el('button', 'dv-arrow dv-arrow-' + (dir < 0 ? 'l' : 'r'));
    b.type = 'button';
    b.setAttribute('aria-label', dir < 0 ? 'Posunout doleva' : 'Posunout doprava');
    b.appendChild(svg(dir < 0 ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6', 22));
    b.addEventListener('click', function () { track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: 'smooth' }); });
    return b;
  }

  function fillRow(sec, items, showType) {
    var old = sec.querySelector('.dv-scroller');
    var wrap = el('div', 'dv-scroller');
    var track = el('div', 'dv-track');
    items.forEach(function (it) { track.appendChild(card(it, showType)); });
    wrap.appendChild(track);
    wrap.appendChild(arrow(-1, track));
    wrap.appendChild(arrow(1, track));
    if (old) old.replaceWith(wrap); else sec.appendChild(wrap);
  }

  function emptyState(icon, title, sub) {
    var e = el('div', 'dv-empty');
    e.appendChild(el('div', 'dv-empty-icon', icon));
    e.appendChild(el('div', 'dv-empty-title', title));
    if (sub) e.appendChild(el('div', 'dv-empty-sub', sub));
    return e;
  }

  /* ---------- Hero banner ---------- */

  function hero(it) {
    var h = el('section', 'dv-hero');
    if (it.backdrop) {
      var bg = new Image();
      bg.className = 'dv-hero-bg';
      bg.alt = '';
      bg.decoding = 'async';
      bg.src = it.backdrop;
      h.appendChild(bg);
    }
    h.appendChild(el('div', 'dv-hero-shade'));
    var body = el('div', 'dv-hero-body');
    body.appendChild(el('span', 'dv-hero-badge', it.type === 'tv' ? 'Seriál' : 'Film'));
    body.appendChild(el('h1', 'dv-hero-title', it.title));

    var meta = [];
    if (it.rating > 0) meta.push('★ ' + it.rating.toFixed(1));
    if (it.year) meta.push(it.year);
    var names = it.genreIds.slice(0, 3).map(function (g) { return GENRE_NAMES[g]; }).filter(Boolean);
    if (names.length) meta.push(names.join(' · '));
    body.appendChild(el('div', 'dv-hero-meta', meta.join('   ')));
    if (it.overview) body.appendChild(el('p', 'dv-hero-desc', it.overview));

    var actions = el('div', 'dv-hero-actions');
    var play = el('button', 'dv-btn dv-btn-primary', '▶  Otevřít');
    play.type = 'button';
    play.addEventListener('click', function () { openItem(it); });
    actions.appendChild(play);

    var fav = el('button', 'dv-btn dv-btn-ghost');
    fav.type = 'button';
    fav.appendChild(svg(HEART, 18));
    var lbl = el('span', null, isFav(it) ? 'V Oblíbených' : 'Do Oblíbených');
    fav.appendChild(lbl);
    fav.classList.toggle('on', isFav(it));
    fav.addEventListener('click', function () {
      toggleFav(it, fav);
      lbl.textContent = isFav(it) ? 'V Oblíbených' : 'Do Oblíbených';
    });
    actions.appendChild(fav);
    body.appendChild(actions);
    h.appendChild(body);
    return h;
  }

  /* ---------- Data ---------- */

  function seenIds() {
    var seen = {};
    try {
      var m = aiBrain.memory;
      if (m && m.watchedTmdbIds) Object.keys(m.watchedTmdbIds).forEach(function (k) { seen[k] = true; });
    } catch (e) {}
    try { getWatchlist().forEach(function (w) { if (w.tmdbId) seen[w.tmdbId] = true; }); } catch (e) {}
    return seen;
  }

  function topGenreIds() {
    try {
      var prefs = aiBrain.memory.genreIdPrefs || {};
      var seenGroups = {};
      return Object.keys(prefs).filter(function (k) { return prefs[k] > 0.05; })
        .sort(function (a, b) { return prefs[b] - prefs[a]; })
        // ID 28 a 10759 je tentýž žánr (film vs. seriál) – nezobrazovat ho dvakrát
        .filter(function (k) {
          var g = genreForId(k), key = g ? g.key : 'id' + k;
          if (seenGroups[key]) return false;
          seenGroups[key] = true; return true;
        }).slice(0, 3);
    } catch (e) { return []; }
  }

  function discoverUrl(type, page, o) {
    var q = ['language=cs-CZ', 'include_adult=false', 'page=' + page];
    if (o.sort === 'rating') {
      q.push('sort_by=vote_average.desc', 'vote_count.gte=' + (type === 'movie' ? 300 : 150));
    } else if (o.sort === 'newest') {
      var f = type === 'movie' ? 'primary_release_date' : 'first_air_date';
      q.push('sort_by=' + f + '.desc', f + '.lte=' + today(), 'vote_count.gte=25');
    } else {
      q.push('sort_by=popularity.desc', 'vote_count.gte=25');
    }
    if (o.genres) q.push('with_genres=' + encodeURIComponent(o.genres));
    if (o.year) q.push((type === 'movie' ? 'primary_release_year=' : 'first_air_date_year=') + o.year);
    return '/discover/' + type + '?' + q.join('&');
  }

  function fetchDiscover(type, page, o) {
    return api(discoverUrl(type, page, o)).then(function (d) {
      return { items: normList(d && d.results, type), pages: (d && d.total_pages) || 0 };
    });
  }

  /* ---------- Domovská obrazovka (řady) ---------- */

  function renderHome(myRun) {
    var body = els.body;
    body.textContent = '';
    if (!hasKey()) {
      body.appendChild(emptyState('🔑', 'Chybí klíč k TMDB', 'Bez něj nejde načíst filmy a seriály. Nastav ho v Nastavení.'));
      return;
    }

    var heroSlot = el('div', 'dv-hero-slot');
    heroSlot.appendChild(el('div', 'dv-hero dv-skel'));
    body.appendChild(heroSlot);
    renderHistoryChips(body);

    var prefs = topGenreIds();
    var seen = seenIds();
    var rows = [];

    if (prefs.length) {
      var names = prefs.map(function (id) { return GENRE_NAMES[id]; }).filter(Boolean);
      rows.push({
        title: '✨ Pro tebe',
        sub: names.length ? 'Podle toho, co sleduješ: ' + names.join(', ') : '',
        showType: true,
        load: function () {
          // Filmy a seriály mají v TMDB částečně jiná ID žánrů (např. Akční 28 vs. 10759)
          var idsFor = function (type) { return window.mfGenreIdsFor ? window.mfGenreIdsFor(prefs, type) : prefs.map(String); };
          var one = function (type) {
            var ids = idsFor(type);
            return ids.length ? fetchDiscover(type, 1, { genres: ids.join('|') }) : Promise.resolve({ items: [] });
          };
          return Promise.all([one('tv'), one('movie')])
            .then(function (r) { return interleave(r[0].items, r[1].items).filter(function (it) { return !seen[it.id]; }); });
        }
      });
    }

    rows.push({
      title: '🔥 Trendy tento týden', showType: true, hero: true,
      load: function () { return api('/trending/all/week?language=cs-CZ').then(function (d) { return normList(d && d.results); }); }
    });

    var genreRows = [];
    prefs.slice(0, 2).forEach(function (id) { var g = genreForId(id); if (g && genreRows.indexOf(g) < 0) genreRows.push(g); });
    ['kom', 'akcni', 'drama'].forEach(function (k) {
      var g = genreByKey(k);
      if (genreRows.length < 2 && genreRows.indexOf(g) < 0) genreRows.push(g);
    });
    genreRows.forEach(function (g) {
      rows.push({
        title: g.name, sub: 'Filmy i seriály jednoho žánru', showType: true, more: g.key,
        load: function () {
          return Promise.all([
            g.tv ? fetchDiscover('tv', 1, { genres: g.tv }) : Promise.resolve({ items: [] }),
            g.movie ? fetchDiscover('movie', 1, { genres: g.movie }) : Promise.resolve({ items: [] })
          ]).then(function (r) { return interleave(r[0].items, r[1].items); });
        }
      });
    });

    rows.push({ title: '🎬 Nejlépe hodnocené filmy', load: function () {
      return api('/movie/top_rated?language=cs-CZ').then(function (d) { return normList(d && d.results, 'movie'); });
    } });
    rows.push({ title: '📺 Nejlépe hodnocené seriály', load: function () {
      return api('/tv/top_rated?language=cs-CZ').then(function (d) { return normList(d && d.results, 'tv'); });
    } });
    rows.push({ title: '🆕 Nově v kinech a v televizi', showType: true, load: function () {
      return Promise.all([api('/movie/now_playing?language=cs-CZ'), api('/tv/on_the_air?language=cs-CZ')]).then(function (r) {
        return interleave(normList(r[0] && r[0].results, 'movie'), normList(r[1] && r[1].results, 'tv'));
      });
    } });

    var heroDone = false, rowsLeft = rows.length, rowsKept = 0;
    rows.forEach(function (r) {
      var sec = section(r.title, r.sub);
      if (r.more) {
        var more = el('button', 'dv-row-more', 'Zobrazit vše →');
        more.type = 'button';
        more.addEventListener('click', function () { setGenre(r.more); });
        sec.firstChild.appendChild(more);
      }
      sec.appendChild(rowSkeleton());
      body.appendChild(sec);
      r.load().then(function (items) {
        if (myRun !== run) return;
        if (!items.length) { sec.remove(); return; }
        fillRow(sec, items.slice(0, 20), r.showType);
        rowsKept++;
        if (r.hero && !heroDone) {
          for (var i = 0; i < items.length; i++) {
            if (items[i].backdrop && items[i].overview) {
              heroDone = true;
              heroSlot.textContent = '';
              heroSlot.appendChild(hero(items[i]));
              break;
            }
          }
        }
      }).catch(function () { if (myRun === run) sec.remove(); }).then(function () {
        if (myRun === run && r.hero && !heroDone) heroSlot.remove();
        // Když se nenačetla žádná řada (offline, špatný klíč), nenechávej prázdnou stránku
        if (myRun === run && --rowsLeft === 0 && !rowsKept) {
          heroSlot.remove();
          body.appendChild(emptyState('📡', 'Nepodařilo se načíst nabídku', 'Zkontroluj připojení a klíč TMDB v Nastavení a zkus to znovu.'));
        }
      });
    });
  }

  function renderHistoryChips(body) {
    var h = getHistory();
    if (!h.length) return;
    var wrap = el('div', 'dv-history');
    wrap.appendChild(el('span', 'dv-history-label', 'Nedávná hledání'));
    h.forEach(function (q) {
      var chip = el('button', 'dv-hchip', q);
      chip.type = 'button';
      chip.addEventListener('click', function () { els.input.value = q; onInput(); });
      wrap.appendChild(chip);
    });
    var clear = el('button', 'dv-hclear', 'Smazat');
    clear.type = 'button';
    clear.addEventListener('click', function () { setHistory([]); wrap.remove(); });
    wrap.appendChild(clear);
    body.appendChild(wrap);
  }

  /* ---------- Mřížka (filtry a hledání) ---------- */

  function describeFilters() {
    var parts = [];
    if (state.genre) parts.push(genreByKey(state.genre).name);
    parts.push(state.type === 'movie' ? 'Filmy' : state.type === 'tv' ? 'Seriály' : 'Filmy a seriály');
    if (state.year) parts.push(state.year);
    var s = SORTS.filter(function (x) { return x.key === state.sort; })[0];
    if (s && state.sort !== 'popular') parts.push(s.label.toLowerCase());
    return parts.join(' · ');
  }

  function startGrid(mode, myRun) {
    var body = els.body;
    body.textContent = '';
    if (!hasKey()) {
      body.appendChild(emptyState('🔑', 'Chybí klíč k TMDB', 'Bez něj nejde načíst filmy a seriály. Nastav ho v Nastavení.'));
      return;
    }
    var head = el('div', 'dv-grid-head');
    head.appendChild(el('h2', 'dv-grid-title', mode === 'search' ? 'Výsledky pro „' + state.query + '“' : describeFilters()));
    body.appendChild(head);
    var grid = el('div', 'dv-grid');
    body.appendChild(grid);
    var sentinel = el('div', 'dv-sentinel');
    body.appendChild(sentinel);
    var status = el('div', 'dv-status');
    body.appendChild(status);

    gridCtx = { mode: mode, run: myRun, page: 0, pages: 1, loading: false, done: false, total: 0, grid: grid, status: status, head: head, sentinel: sentinel };
    for (var i = 0; i < 12; i++) {
      var s = el('div', 'dv-card dv-ph');
      s.appendChild(el('div', 'dv-poster dv-skel'));
      s.appendChild(el('div', 'dv-card-title dv-skel-line'));
      grid.appendChild(s);
    }
    loadMore();
    if (observer) observer.disconnect();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        if (entries[0] && entries[0].isIntersecting) loadMore();
      }, { root: els.body, rootMargin: '600px 0px' });
      observer.observe(sentinel);
    }
  }

  function matchesFilters(it) {
    if (state.type !== 'all' && it.type !== state.type) return false;
    if (state.year && it.year !== state.year) return false;
    if (state.genre) {
      var ids = genreIdsFor(genreByKey(state.genre));
      var ok = false;
      for (var i = 0; i < it.genreIds.length; i++) if (ids[it.genreIds[i]]) { ok = true; break; }
      if (!ok) return false;
    }
    return true;
  }

  function fetchPage(ctx) {
    var page = ctx.page + 1;
    if (ctx.mode === 'search') {
      return api('/search/multi?language=cs-CZ&include_adult=false&page=' + page + '&query=' + encodeURIComponent(state.query)).then(function (d) {
        var items = normList(d && d.results).filter(matchesFilters);
        if (state.sort !== 'popular') items = mergeBy(state.sort, items, []);
        return { items: items, pages: (d && d.total_pages) || 0 };
      });
    }
    var g = state.genre ? genreByKey(state.genre) : null;
    var types = state.type === 'all' ? ['movie', 'tv'] : [state.type];
    var jobs = [];
    types.forEach(function (t) {
      var gid = g ? g[t] : '';
      if (g && !gid) return;
      jobs.push(fetchDiscover(t, page, { sort: state.sort, genres: gid, year: state.year }));
    });
    if (!jobs.length) return Promise.resolve({ items: [], pages: 0 });
    return Promise.all(jobs).then(function (r) {
      var pages = 0, lists = [];
      r.forEach(function (x) { pages = Math.max(pages, x.pages); lists.push(x.items); });
      return { items: lists.length === 2 ? mergeBy(state.sort, lists[0], lists[1]) : lists[0], pages: pages };
    });
  }

  function loadMore() {
    var ctx = gridCtx;
    if (!ctx || ctx.loading || ctx.done || ctx.run !== run) return;
    ctx.loading = true;
    var added = 0, guard = 0;

    function step() {
      return fetchPage(ctx).then(function (res) {
        if (ctx.run !== run) return;
        ctx.page++;
        ctx.pages = Math.min(res.pages || 0, 500);
        if (ctx.page === 1) ctx.grid.querySelectorAll('.dv-ph').forEach(function (n) { n.remove(); });
        res.items.forEach(function (it) { ctx.grid.appendChild(card(it, state.type === 'all')); added++; ctx.total++; });
        if (ctx.page >= ctx.pages || !res.pages) ctx.done = true;
        guard++;
        if (!ctx.done && added < 12 && guard < 4) return step();
      });
    }

    step().catch(function () { ctx.done = true; }).then(function () {
      if (ctx.run !== run) return;
      ctx.loading = false;
      if (!ctx.total) {
        ctx.grid.textContent = '';
        ctx.status.textContent = '';
        ctx.status.appendChild(emptyState('🔍', ctx.mode === 'search' ? 'Nic jsme nenašli' : 'Žádné výsledky', 'Zkus jiný název nebo uvolni filtry.'));
        var r = el('button', 'dv-btn dv-btn-ghost', 'Zrušit filtry');
        r.type = 'button';
        r.addEventListener('click', resetAll);
        ctx.status.appendChild(r);
        return;
      }
      var c = ctx.head.querySelector('.dv-grid-count');
      if (!c) { c = el('span', 'dv-grid-count'); ctx.head.appendChild(c); }
      c.textContent = ctx.total + (ctx.done ? '' : '+') + ' titulů';
      ctx.status.textContent = ctx.done ? '' : 'Načítám další…';
      if (!ctx.done) {
        var rect = ctx.sentinel.getBoundingClientRect(), root = els.body.getBoundingClientRect();
        if (rect.top < root.bottom + 600) loadMore();
      }
    });
  }

  /* ---------- Stav a ovládání ---------- */

  function filtersActive() {
    return state.type !== 'all' || !!state.genre || state.sort !== 'popular' || !!state.year;
  }

  function syncControls() {
    els.reset.hidden = !(filtersActive() || state.query.length > 0);
    els.clear.hidden = !els.input.value;
    [].forEach.call(els.type.children, function (b) {
      var on = b.getAttribute('data-type') === state.type;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    [].forEach.call(els.genres.children, function (b) {
      var key = b.getAttribute('data-genre');
      var g = genreByKey(key);
      b.disabled = state.type !== 'all' && !g[state.type];
      b.classList.toggle('active', state.genre === key);
      b.setAttribute('aria-pressed', state.genre === key ? 'true' : 'false');
    });
    els.sort.value = state.sort;
    els.year.value = state.year;
  }

  function refresh() {
    run++;
    gridCtx = null;
    if (observer) observer.disconnect();
    var mode = state.query.length >= 2 ? 'search' : filtersActive() ? 'grid' : 'home';
    syncControls();
    els.root.classList.remove('dv-compact');
    els.body.scrollTop = 0;
    if (mode === 'home') renderHome(run); else startGrid(mode, run);
  }

  function setType(t) {
    state.type = t;
    if (state.genre && t !== 'all' && !genreByKey(state.genre)[t]) state.genre = '';
    refresh();
  }

  function setGenre(key) {
    state.genre = state.genre === key ? '' : key;
    refresh();
    var b = els.genres.querySelector('[data-genre="' + key + '"]');
    if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  function resetAll() {
    state = { type: 'all', genre: '', sort: 'popular', year: '', query: '' };
    els.input.value = '';
    refresh();
  }

  function onInput() {
    var v = els.input.value.trim();
    els.clear.hidden = !els.input.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      var q = v.length >= 2 ? v : '';
      if (q === state.query) return;
      state.query = q;
      refresh();
    }, v.length >= 2 ? 350 : 0);
  }

  /* ---------- Sestavení rozhraní ---------- */

  function build() {
    if (built) return true;
    var root = $('universeOverlay');
    if (!root) return false;
    els = {
      root: root, input: $('dvSearch'), clear: $('dvClear'), close: $('dvClose'), reset: $('dvReset'),
      type: $('dvType'), genres: $('dvGenres'), sort: $('dvSort'), year: $('dvYear'), body: $('dvBody')
    };
    if (!els.input || !els.body) return false;

    GENRES.forEach(function (g) {
      var b = el('button', 'dv-chip', g.name);
      b.type = 'button';
      b.setAttribute('data-genre', g.key);
      b.addEventListener('click', function () { setGenre(g.key); });
      els.genres.appendChild(b);
    });
    SORTS.forEach(function (s) {
      var o = el('option', null, s.label);
      o.value = s.key;
      els.sort.appendChild(o);
    });
    var any = el('option', null, 'Kterýkoli rok');
    any.value = '';
    els.year.appendChild(any);
    for (var y = new Date().getFullYear(); y >= 1970; y--) {
      var o2 = el('option', null, String(y));
      o2.value = String(y);
      els.year.appendChild(o2);
    }

    [].forEach.call(els.type.children, function (b) {
      b.addEventListener('click', function () { setType(b.getAttribute('data-type')); });
    });
    els.sort.addEventListener('change', function () { state.sort = els.sort.value; refresh(); });
    els.year.addEventListener('change', function () { state.year = els.year.value; refresh(); });
    els.input.addEventListener('input', onInput);
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { pushHistory(els.input.value); els.input.blur(); }
    });
    els.clear.addEventListener('click', function () { els.input.value = ''; onInput(); els.input.focus(); });
    els.reset.addEventListener('click', resetAll);
    els.close.addEventListener('click', closeUniverse);
    root.addEventListener('click', function (e) { if (e.target === root) closeUniverse(); });

    var lastTop = 0;
    els.body.addEventListener('scroll', function () {
      var top = els.body.scrollTop, d = top - lastTop;
      if (top < 40 || d < -10) root.classList.remove('dv-compact');
      else if (top > 160 && d > 10) root.classList.add('dv-compact');
      if (Math.abs(d) > 10 || top < 40) lastTop = top;
    }, { passive: true });

    root.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        e.stopPropagation();
        els.input.focus();
      }
    });
    built = true;
    return true;
  }

  function openUniverse(focus) {
    if (!build()) return;
    clearTimeout(closeTimer);
    var wasOpen = els.root.classList.contains('open');
    document.body.classList.add('discover-open');
    els.root.classList.add('open');
    requestAnimationFrame(function () { requestAnimationFrame(function () { els.root.classList.add('visible'); }); });
    try { kbLayer = 'search'; } catch (e) {}
    try { if (typeof pauseBgParticles === 'function') pauseBgParticles(); } catch (e) {}
    if (!wasOpen || !els.body.firstChild) refresh();
    if (focus) setTimeout(function () { els.input.focus(); }, 60);
  }

  function closeUniverse() {
    if (!built) return;
    document.body.classList.remove('discover-open');
    els.root.classList.remove('visible');
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      els.root.classList.remove('open');
      run++;
      gridCtx = null;
      if (observer) observer.disconnect();
      state = { type: 'all', genre: '', sort: 'popular', year: '', query: '' };
      els.input.value = '';
      els.body.textContent = '';
    }, 300);
    try { kbLayer = 'menu'; } catch (e) {}
    try { if (typeof resumeBgParticles === 'function') resumeBgParticles(); } catch (e) {}
    try { if (legacyClose) legacyClose(); } catch (e) {}
  }

  window.mfDiscoverOpen = function (type) {
    if (!build()) return;
    type = type || 'all';
    var open = els.root.classList.contains('open');
    if (open && state.type !== type) { state.type = type; refresh(); return; }
    state.type = type || 'all';
    openUniverse(false);
  };
  window.openUniverse = function () { openUniverse(false); };
  window.openDiscover = function () { openUniverse(false); };
  window.openSearch = function () { openUniverse(true); };
  window.closeUniverse = closeUniverse;
  window.closeSearch = closeUniverse;
  window.closeDiscover = closeUniverse;
})();
