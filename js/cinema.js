
(function () {
  "use strict";

  var modal, frame, titleNode, sourceLabelNode, sourceCounterNode;
  var tvBar, epGridPanel, epGridBody;
  var favBtn;
  var current = null;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function stripDiacritics(s) {
    return String(s || "").toLowerCase().replace(/[łøđðıþßæœ]/g, function (c) {
      return { "ł": "l", "ø": "o", "đ": "d", "ð": "d", "ı": "i", "þ": "th", "ß": "ss", "æ": "ae", "œ": "oe" }[c];
    }).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function daslug(value) {
    if (typeof window._czSlug === "function") return window._czSlug(value);
    if (typeof _czSlug === "function") {
      try {
        return _czSlug(value);
      } catch (e) {}
    }
    return stripDiacritics(String(value || ""))
      .toLowerCase()
      .replace(/[':.]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function searchQuery(value) {
    return stripDiacritics(String(value || ""))
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanTitle(t) {
    return String(t || "").replace(/\s*[—–-]+\s*S\d+E\d+.*/i, "").trim();
  }

  function bombujMovieUrl(title, year) {
    if (typeof window._bombujMovieUrlVariants === "function") {
      try {
        var arr = window._bombujMovieUrlVariants(title, year);
        if (arr && arr[0]) return arr[0];
      } catch (e) {}
    }
    var s = daslug(title);
    if (!s) return "https://www.bombuj.si/?s=" + encodeURIComponent(title || "");
    return year
      ? "https://www.bombuj.si/online-film-" + s + "-" + encodeURIComponent(year)
      : "https://www.bombuj.si/online-film-" + s;
  }

  function bombujMovieUrlNoYear(title) {
    var s = daslug(title);
    return s
      ? "https://www.bombuj.si/online-film-" + s
      : "https://www.bombuj.si/?s=" + encodeURIComponent(title || "");
  }

  function prehrajtoUrl(query) {
    /* U názvů bez latinky (japonština…) je zjednodušený dotaz prázdný – pak se hledá původní název. */
    return "https://prehrajto.cz/hledej/" + encodeURIComponent(searchQuery(query) || String(query || "").trim());
  }

  function svetSerialuUrl(title, season, episode, siteSlug) {
    if (typeof window._svetSerialuSlugVariants === "function") {
      try {
        var variants = window._svetSerialuSlugVariants(siteSlug, title);
        if (variants && variants[0]) {
          return "https://svetserialu.to/serial/" + variants[0] + "/s" + pad2(season) + "e" + pad2(episode);
        }
      } catch (e) {}
    }
    var s = daslug(title);
    return s
      ? "https://svetserialu.to/serial/" + s + "/s" + pad2(season) + "e" + pad2(episode)
      : "https://svetserialu.to/?s=" + encodeURIComponent(title || "");
  }

  function bombujTvUrl(title, season, episode) {
    var s = daslug(title);
    return s
      ? "https://serialy.bombuj.si/serial/" + s + "-" + season + "x" + pad2(episode)
      : "https://serialy.bombuj.si/?s=" + encodeURIComponent(title || "");
  }

  function prehrajtoTvUrl(title, season, episode) {
    return prehrajtoUrl(title + " S" + pad2(season) + "E" + pad2(episode));
  }

  /* Uzi.la — jediné místo, kde se definuje tvar odkazů. Placeholdery: {slug} {ss} {ee} {q}.
   * Ověřené příklady: /p/forrest-gump, /tv/jack-reacher/S04E08 (velké S a E, dvouciferné číslo). */
  var UZI = {
    base: "https://uzi.la",
    movie: "/p/{slug}",
    episode: "/tv/{slug}/S{ss}E{ee}",
    search: "/?s={q}"
  };

  function uziFill(pattern, vars) {
    return UZI.base + pattern.replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] != null ? vars[k] : "";
    });
  }

  function uziSearchUrl(title) {
    return uziFill(UZI.search, { q: encodeURIComponent(title || "") });
  }

  function uziMovieUrl(title) {
    var slug = daslug(title);
    return slug ? uziFill(UZI.movie, { slug: slug }) : uziSearchUrl(title);
  }

  function uziTvUrl(title, season, episode) {
    var slug = daslug(title);
    return slug ? uziFill(UZI.episode, { slug: slug, ss: pad2(season), ee: pad2(episode) }) : uziSearchUrl(title);
  }

  /* NajSerialy.io — /serial/{slug}/s01e01; u novějších seriálů je v adrese rok (např. carrie-2026), u starších ne. */
  function najTvUrl(title, season, episode, withYear) {
    var slug = daslug(title);
    if (!slug) return "https://www.najserialy.io/?s=" + encodeURIComponent(title || "");
    var y = current && (current.firstYear || current.year);
    if (withYear && y && !/-\d{4}$/.test(slug)) slug += "-" + y;
    return "https://www.najserialy.io/serial/" + slug + "/s" + pad2(season) + "e" + pad2(episode);
  }

  var MOVIE_SOURCES = [
    { id: "bombuj", label: "Bombuj", build: function (t, y) { return bombujMovieUrl(t, y); } },
    { id: "bombuj-noyear", label: "Bombuj (bez roku)", build: function (t) { return bombujMovieUrlNoYear(t); } },
    { id: "prehrajto", label: "Prehrajto.cz", build: function (t) { return prehrajtoUrl(t); } },
    { id: "uzila", label: "Uzi.la", noEmbed: true, build: function (t) { return uziMovieUrl(t); } }
  ];

  var TV_SOURCES = [
    { id: "svetserialu", label: "SvetSerialu", build: function (t, s, e, slug) { return svetSerialuUrl(t, s, e, slug); } },
    { id: "bombuj", label: "Bombuj", build: function (t, s, e) { return bombujTvUrl(t, s, e); } },
    { id: "prehrajto", label: "Prehrajto.cz", build: function (t, s, e) { return prehrajtoTvUrl(t, s, e); } },
    { id: "najserialy", label: "NajSerialy", build: function (t, s, e) { return najTvUrl(t, s, e, false); } },
    { id: "najserialy-year", label: "NajSerialy (s rokem)", build: function (t, s, e) { return najTvUrl(t, s, e, true); } },
    { id: "uzila", label: "Uzi.la", noEmbed: true, build: function (t, s, e) { return uziTvUrl(t, s, e); } }
  ];

  function sourcesFor(type) {
    var base = type === "movie" ? MOVIE_SOURCES : TV_SOURCES;
    var alts = current && current.altTitles;
    if (!alts || alts.length < 2) return base;
    // Uzi.la pojmenovává tituly podle lokalizovaného názvu → nabídni víc variant (SK / CZ / původní název)
    var out = [];
    base.forEach(function (src) {
      if (src.id !== "uzila" && src.id.indexOf("najserialy") !== 0) return out.push(src);
      alts.forEach(function (name) {
        out.push({
          id: src.id,
          noEmbed: src.noEmbed,
          label: src.label + " (" + name + ")",
          build: function (t, a, b) {
            if (src.id === "uzila") return type === "movie" ? uziMovieUrl(name) : uziTvUrl(name, a, b);
            return najTvUrl(name, a, b, src.id === "najserialy-year");
          }
        });
      });
    });
    return out;
  }

  /** Doplní alternativní názvy z TMDB (slovenský, český, původní) a zachová právě vybraný zdroj. */
  function loadAltTitles(cur) {
    var key = (typeof TMDB_KEY !== "undefined" && TMDB_KEY) || null;
    var id = parseInt(cur.tmdbId, 10);
    if (!(key || window.MF_USING_TMDB_PROXY) || isNaN(id)) return;
    var kind = cur.type === "movie" ? "movie" : "tv";
    var q = key ? "?api_key=" + key : "";
    var base = "https://api.themoviedb.org/3/" + kind + "/" + id;
    var get = function (url) {
      return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    };
    Promise.all([get(base + q), get(base + "/translations" + q)]).then(function (res) {
      if (current !== cur) return; // mezitím se otevřel jiný titul
      var info = res[0] || {}, tr = (res[1] && res[1].translations) || [];
      var pick = function (country) {
        for (var i = 0; i < tr.length; i++) {
          if (tr[i].iso_3166_1 === country && tr[i].data) return tr[i].data.title || tr[i].data.name || "";
        }
        return "";
      };
      var orig = info.original_title || info.original_name || "";
      var en = kind === "movie" ? (info.title || "") : (info.name || "");
      var finish = function (romaji) {
        if (current !== cur) return;
        var ordered = kind === "movie"
          ? [pick("SK"), pick("CZ"), cur.title, en, orig]
          : [en, romaji, orig, cur.title, pick("SK"), pick("CZ")];
        applyAlts(cur, ordered, info);
      };
      // Anime weby (NajSerialy…) používají romaji název (Shuiro no Kamen) – TMDB ho nemá, vezme se z AniList
      if (kind === "tv" && info.original_language === "ja" && (en || cur.title)) {
        fetch("https://graphql.anilist.co", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query: "query($q:String){Media(search:$q,type:ANIME){title{romaji}}}", variables: { q: en || cur.title } })
        }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
          finish(d && d.data && d.data.Media && d.data.Media.title && d.data.Media.title.romaji || "");
        }).catch(function () { finish(""); });
      } else finish("");
    });
  }

  function applyAlts(cur, ordered, info) {
    var seen = {}, list = [];
    ordered.forEach(function (name) {
      var slug = daslug(name);
      if (name && slug && !seen[slug]) { seen[slug] = 1; list.push(name); }
    });
    var fy = String(info.first_air_date || "").slice(0, 4);
    if (/^\d{4}$/.test(fy)) cur.firstYear = fy;
    if (!list.length) return;
    /* Název bez latinky (ドラゴンボール超) dá prázdný slug → weby ho nenajdou; pro adresy se použije první latinský název (dragon-ball-super). */
    if (!daslug(cur.title)) cur.slugTitle = list[0];
    var before = sourcesFor(cur.type)[cur.sourceIdx];
    cur.altTitles = list;
    var after = sourcesFor(cur.type);
    var keep = before ? after.findIndex(function (s) { return s.label === before.label; }) : -1;
    if (keep < 0 && before) keep = after.findIndex(function (s) { return s.id === before.id; });
    if (keep >= 0) cur.sourceIdx = keep;
    cur.tried = new Set();
    // zdroj načtený s nepoužitelným odkazem (např. japonský název bez latinky) se po doplnění názvů načte znovu
    if (current === cur && cur._loadedUrl && buildUrl() !== cur._loadedUrl) renderCurrent();
    else renderSourceBar();
    probeSources();
  }

  function urlFor(src) {
    var ttl = current.slugTitle || current.title;
    if (current.type === "movie") return src.build(ttl, current.year);
    return src.build(ttl, current.season, current.episode, current.localSlug);
  }

  function buildUrl() {
    return urlFor(sourcesFor(current.type)[current.sourceIdx]);
  }

  function appGetWatched() {
    try {
      return typeof getWatched === "function" ? getWatched() : {};
    } catch (e) {
      return {};
    }
  }

  function appDb() {
    try {
      return typeof db !== "undefined" ? db : null;
    } catch (e) {
      return null;
    }
  }

  function appTotalSeasons(slug) {
    try {
      return typeof totalSeasons === "function" ? totalSeasons(slug) : 1;
    } catch (e) {
      return 1;
    }
  }

  function appEpsInSeason(slug, season) {
    try {
      return typeof epsInSeason === "function" ? epsInSeason(slug, season) : (current.totalEps[season] || 20);
    } catch (e) {
      return current.totalEps[season] || 20;
    }
  }

  function appMarkWatched(uid) {
    try {
      if (typeof markWatched === "function") markWatched(uid);
    } catch (e) {}
  }

  function isEpWatched(season, episode) {
    if (!current.localSlug) return false;
    var w = appGetWatched();
    return !!w[current.localSlug + "-S" + season + "-E" + episode];
  }

  /** Vždy vrátí funkci počtu epizod v sérii (záložní hodnota 20), takže se nikdy nevolá null. */
  function getEpCountFn() {
    if (!current) return function () { return 20; };
    if (typeof current.epCountFn !== "function") current.epCountFn = function () { return 20; };
    return current.epCountFn;
  }

  function ensureEpCounts(cb) {
    if (current.localSlug && appDb() && appDb()[current.localSlug]) {
      current.totalSeasonsCount = appTotalSeasons(current.localSlug);
      current.epCountFn = function (s) { return appEpsInSeason(current.localSlug, s); };
      cb && cb();
      return;
    }
    var key = (typeof TMDB_KEY !== "undefined" && TMDB_KEY) || null;
    if (key && current.tmdbId && !isNaN(parseInt(current.tmdbId, 10))) {
      fetch("https://api.themoviedb.org/3/tv/" + current.tmdbId + "?api_key=" + key + "&language=cs")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data) {
            current.totalSeasonsCount = data.number_of_seasons || 1;
            current.totalEps = {};
            (data.seasons || []).forEach(function (s) {
              if (s.season_number > 0) current.totalEps[s.season_number] = s.episode_count;
            });
            current.epCountFn = function (s) { return current.totalEps[s] || 20; };
          }
          // TMDB nedostupné (offline, blokátor, výpadek): ať je vždy nějaká funkce, jinak „Další epizoda“ spadne
          current.epCountFn = current.epCountFn || function () { return 20; };
          cb && cb();
        })
        .catch(function () {
          current.totalSeasonsCount = current.totalSeasonsCount || 20;
          current.epCountFn = current.epCountFn || function () { return 20; };
          cb && cb();
        });
    } else {
      current.totalSeasonsCount = current.totalSeasonsCount || 20;
      current.epCountFn = current.epCountFn || function () { return 20; };
      cb && cb();
    }
  }

  function findNextSeriesSlug() {
    var d = appDb();
    if (!d || !current.localSlug) return null;
    var keys = Object.keys(d);
    var idx = keys.indexOf(current.localSlug);
    if (idx === -1) return null;
    for (var i = 1; i <= keys.length; i++) {
      var candidate = keys[(idx + i) % keys.length];
      if (candidate !== current.localSlug) return candidate;
    }
    return null;
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.id = "mfStandaloneCinema";
    modal.innerHTML =
      '<div class="mf-standalone-cinema-top">' +
        '<button type="button" id="mfStandaloneCinemaClose" aria-label="Zpět" title="Zpět (Esc)">' +
          '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
        '</button>' +
        '<strong id="mfStandaloneCinemaTitle"></strong>' +
        '<span class="mf-cin-src-label" id="mfCinSrcLabel"></span>' +
        '<span class="mf-cin-src-counter" id="mfCinSrcCounter"></span>' +

        '<div class="mf-cin-tvbar" id="mfCinTvBar" style="display:none">' +
          '<button type="button" class="mf-cin-ep-btn" id="mfCinPrevEp">‹ Předchozí</button>' +
          '<span class="mf-cin-ep-current" id="mfCinEpCurrent"></span>' +
          '<button type="button" class="mf-cin-ep-btn" id="mfCinNextEp">Další ›</button>' +
          '<button type="button" class="mf-cin-ep-btn mf-cin-ep-pick" id="mfCinPickEp">Epizody</button>' +
          '<button type="button" class="mf-cin-ep-btn mf-cin-next-series" id="mfCinNextSeries">Další seriál</button>' +
        "</div>" +

        '<button type="button" class="mf-cin-fav-btn mf-cin-rate-btn" id="mfCinRateBtn" aria-label="Ohodnotit" title="Ohodnotit" style="display:none">☆</button>' +
        '<button type="button" class="mf-cin-fav-btn" id="mfCinFavBtn" aria-label="Přidat do Oblíbených" title="Přidat do Oblíbených">♡</button>' +
        '<button type="button" class="mf-cin-switch-btn" id="mfCinSwitchSrc">Jiný zdroj</button>' +
        '<button type="button" class="mf-cin-switch-btn mf-cin-bad-btn" id="mfCinBadSrc" title="Zdroj nefunguje – zapamatuji si to a zkusím další">Nefunguje to</button>' +
      "</div>" +


      '<div class="mf-cin-epgrid" id="mfCinEpGrid" style="display:none">' +
        '<div class="mf-cin-epgrid-seasons" id="mfCinEpGridSeasons"></div>' +
        '<div class="mf-cin-epgrid-body" id="mfCinEpGridBody"></div>' +
      "</div>" +

      '<div class="mf-standalone-cinema-frame"><div id="mfStandaloneCinemaFrame"></div></div>';
    document.body.appendChild(modal);

    frame = modal.querySelector("#mfStandaloneCinemaFrame");
    titleNode = modal.querySelector("#mfStandaloneCinemaTitle");
    sourceLabelNode = modal.querySelector("#mfCinSrcLabel");
    sourceCounterNode = modal.querySelector("#mfCinSrcCounter");
    tvBar = modal.querySelector("#mfCinTvBar");
    epGridPanel = modal.querySelector("#mfCinEpGrid");
    epGridBody = modal.querySelector("#mfCinEpGridBody");

    modal.querySelector("#mfStandaloneCinemaClose").onclick = close;
    modal.querySelector("#mfCinSwitchSrc").onclick = function () { cycleSource(1); };
    modal.querySelector("#mfCinBadSrc").onclick = markBadAndNext;
    modal.querySelector("#mfCinPrevEp").onclick = function () { stepEpisode(-1); };
    modal.querySelector("#mfCinNextEp").onclick = function () { stepEpisode(1); };
    modal.querySelector("#mfCinPickEp").onclick = toggleEpGrid;
    modal.querySelector("#mfCinNextSeries").onclick = goNextSeries;

    favBtn = modal.querySelector("#mfCinFavBtn");
    if (favBtn) favBtn.onclick = toggleCurrentFavorite;
    modal.querySelector("#mfCinRateBtn").onclick = rateCurrentEpisode;


    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });
  }

  /* ── Paměť zdrojů: který zdroj pro daný titul fungoval / nefungoval (synchronizuje se mezi zařízeními) ─────────── */
  var PREF_KEY = "mf_src_pref", BAD_TTL = 14 * 24 * 3600 * 1000, SOFT_BAD_TTL = 3 * 24 * 3600 * 1000, QUICK_SWITCH_MS = 25 * 1000, GOOD_AFTER_MS = 60 * 1000;

  function prefsLoad() {
    try { var o = JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  function prefsSave(all) {
    try {
      var keys = Object.keys(all);
      if (keys.length > 300) {
        keys.sort(function (a, b) { return (all[a].t || 0) - (all[b].t || 0); }).slice(0, keys.length - 300).forEach(function (k) { delete all[k]; });
      }
      localStorage.setItem(PREF_KEY, JSON.stringify(all));
    } catch (e) {}
  }
  function prefKey() { return current ? current.type + ":" + current.tmdbId : ""; }
  function prefEntry() { var e = prefsLoad()[prefKey()]; return e && typeof e === "object" ? e : { good: "", bad: {} }; }
  /* Sdílená paměť (Worker): jaký zdroj funguje ostatním. Jen nápověda pro začátek, vlastní zkušenost má vždy přednost.
     Posílá se jen „titul + název zdroje“, nic o uživateli. Cache a „už nahlášeno“ jsou jen na tomto zařízení (mfx_*, nesynchronizuje se). */
  var SH_CACHE = "mfx_src_shared", SH_SENT = "mfx_src_reported", SH_OFF = "mfx_src_share_off", SH_TTL = 7 * 24 * 3600 * 1000, SH_TTL_EMPTY = 24 * 3600 * 1000;
  function shRead(k) { try { var o = JSON.parse(localStorage.getItem(k) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } }
  function shWrite(k, o) {
    try {
      var keys = Object.keys(o);
      if (keys.length > 300) keys.slice(0, keys.length - 300).forEach(function (x) { delete o[x]; });
      localStorage.setItem(k, JSON.stringify(o));
    } catch (e) {}
  }
  function shBase() {
    try { if (localStorage.getItem(SH_OFF) === "1") return ""; } catch (e) {}
    return String(window.TMDB_PROXY_URL || "").replace(/\/+$/, "");
  }
  function shPost(path, body) {
    return fetch(shBase() + path, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body) })
      .then(function (r) { return r.ok ? r.json() : null; });
  }
  function shCached(key) {
    var e = shRead(SH_CACHE)[key];
    if (!e || typeof e !== "object") return null;
    var age = Date.now() - (e.t || 0);
    return age < (e.label ? SH_TTL : SH_TTL_EMPTY) ? e : null;
  }
  function shLabel(key) { var e = shCached(key); return e && e.label ? e.label : ""; }
  /** Zeptá se Workeru (jednou za týden na titul) a výsledek uloží; cb(label) se zavolá, jen když je co říct. */
  function shFetch(key, cb) {
    if (!shBase() || shCached(key) || !/^(movie|tv):\d+$/.test(key)) return;
    shPost("/src/get", { key: key }).then(function (r) {
      if (!r) return;
      var all = shRead(SH_CACHE);
      all[key] = { label: typeof r.label === "string" ? r.label : "", t: Date.now() };
      shWrite(SH_CACHE, all);
      if (all[key].label && cb) cb(all[key].label);
    }).catch(function () {});
  }
  function shReport(key, label) {
    if (!shBase() || !label || !/^(movie|tv):\d+$/.test(key)) return;
    var sent = shRead(SH_SENT);
    if (sent[key] === label) return;
    sent[key] = label; shWrite(SH_SENT, sent);
    shPost("/src/report", { key: key, label: label }).catch(function () {});
  }

  function srcIsBad(label) {
    var t = (prefEntry().bad || {})[label];
    return !!t && Date.now() - t < BAD_TTL;
  }
  /** kind: "good" | "bad" (výslovné „Nefunguje to“, platí 14 dní) | "soft" (rychlé přepnutí, platí jen 3 dny). */
  function srcMark(kind, label) {
    if (!current || !label) return;
    var all = prefsLoad(), k = prefKey(), e = all[k] || { good: "", bad: {} };
    e.bad = e.bad || {};
    if (kind === "good") { e.good = label; delete e.bad[label]; shReport(k, label); }
    else { e.bad[label] = Date.now() - (kind === "soft" ? BAD_TTL - SOFT_BAD_TTL : 0); if (e.good === label) e.good = ""; }
    e.t = Date.now();
    all[k] = e;
    prefsSave(all);
  }
  /* ---------- Ověření zdrojů ----------
   * Worker stáhne stránky zdrojů (prohlížeč kvůli CORS nesmí) a řekne, jestli titul opravdu mají. Výsledek: PROBE[url] = true | false.
   * Zdroje, které titul nemají, se přeskakují a při otevření se rovnou přepne na první, který ho má. */
  var PROBE = {}, PROBE_PENDING = {};
  function srcUrl(src) { try { return urlFor(src); } catch (e) { return ""; } }
  function probeState(src) { var u = srcUrl(src); return u ? PROBE[u] : undefined; }
  function isCheckable(u) { return /^https:\/\//.test(u) && !/[?&]s=/.test(u) && !/\/hledej\//.test(u); }

  function probeSources() {
    if (!current || !shBase()) return;
    var cur = current, sources = sourcesFor(cur.type), urls = [], seen = {};
    sources.forEach(function (src) {
      var u = srcUrl(src);
      if (!u || seen[u] || !isCheckable(u) || PROBE[u] !== undefined || PROBE_PENDING[u]) return;
      seen[u] = 1; urls.push(u);
    });
    urls = urls.slice(0, 8);
    if (!urls.length) { applyProbe(); return; }
    urls.forEach(function (u) { PROBE_PENDING[u] = 1; });
    shPost("/src/probe", { urls: urls }).then(function (r) {
      urls.forEach(function (u) { delete PROBE_PENDING[u]; });
      if (!r || !Array.isArray(r.results)) return;
      urls.forEach(function (u, i) { if (r.results[i] === true || r.results[i] === false) PROBE[u] = r.results[i]; });
      var keys = Object.keys(PROBE);
      if (keys.length > 400) keys.slice(0, keys.length - 400).forEach(function (k) { delete PROBE[k]; });
      applyProbe();
      if (urls.length === 8 && current === cur) probeSources(); // zbylé varianty (další názvy) se ověří v dalším kole
    }).catch(function () { urls.forEach(function (u) { delete PROBE_PENDING[u]; }); });
  }

  /** Když zdroj, na kterém právě jsme, titul nemá, přepne na první, který ho má (jen krátce po načtení a pokud uživatel nepřepínal sám). */
  function applyProbe() {
    if (!current || !modal || !modal.classList.contains("open")) return;
    var sources = sourcesFor(current.type);
    var cs = sources[current.sourceIdx], state = cs ? probeState(cs) : undefined;
    if (state === false && !current._manual && Date.now() - (current._srcSince || 0) < 30000) {
      var found = -1;
      for (var n = 1; n <= sources.length; n++) {
        var i = (current.sourceIdx + n) % sources.length;
        if (probeState(sources[i]) === true) { found = i; break; }
      }
      if (found >= 0) {
        var from = cs.label;
        current.sourceIdx = found;
        if (typeof showToast === "function") showToast(from + " tenhle titul nemá, přepínám na " + sources[found].label, 2800);
        renderCurrent();
        return;
      }
      var anyTrue = sources.some(function (x) { return probeState(x) === true; });
      var allKnown = sources.every(function (x) { var st = probeState(x); return st === true || st === false || !isCheckable(srcUrl(x)); });
      if (!anyTrue && allKnown && !current._noneToast) {
        current._noneToast = true;
        if (typeof showToast === "function") showToast("Tenhle titul se na žádném zdroji nenašel", 3500);
      }
    }
    renderSourceBar();
  }

  /** Zdroj, od kterého se začíná: ten, co pro titul fungoval; jinak první, který není označen jako nefunkční. */
  function startIndex() {
    var sources = sourcesFor(current.type), e = prefEntry();
    var pref = e.good || shLabel(prefKey());
    var gi = pref ? sources.findIndex(function (s) { return s.label === pref; }) : -1;
    if (gi >= 0 && !srcIsBad(sources[gi].label) && probeState(sources[gi]) !== false) return gi;
    for (var t = 0; t < sources.length; t++) if (probeState(sources[t]) === true && !srcIsBad(sources[t].label)) return t;
    for (var i = 0; i < sources.length; i++) if (!srcIsBad(sources[i].label) && probeState(sources[i]) !== false) return i;
    for (var k = 0; k < sources.length; k++) if (!srcIsBad(sources[k].label)) return k;
    return 0;
  }
  function currentSrcLabel() {
    var src = current && sourcesFor(current.type)[current.sourceIdx];
    return src ? src.label : "";
  }
  /** Zdroj, na kterém uživatel zůstal dost dlouho (nepřepnul, šel na další epizodu / hodnotil), se bere jako funkční. */
  function noteGoodIfStayed() {
    if (current && current._srcSince && Date.now() - current._srcSince >= GOOD_AFTER_MS) srcMark("good", currentSrcLabel());
  }
  function markBadAndNext() {
    srcMark("bad", currentSrcLabel());
    if (typeof showToast === "function") showToast("Zdroj označen jako nefunkční, zkouším další", 2200);
    cycleSource(1, true);
  }

  function cycleSource(dir, skipQuickCheck) {
    var sources = sourcesFor(current.type);
    // rychlé „Jiný zdroj“ krátce po načtení = zdroj nefungoval
    if (!skipQuickCheck && current._srcSince && Date.now() - current._srcSince < QUICK_SWITCH_MS) srcMark("soft", currentSrcLabel());
    current._manual = true;
    var idx = current.sourceIdx, found = false;
    for (var n = 0; n < sources.length; n++) {
      idx = (idx + dir + sources.length) % sources.length;
      if (!srcIsBad(sources[idx].label) && probeState(sources[idx]) !== false) { found = true; break; }
    }
    // všechny zdroje jsou označené jako nefunkční: prostě jeď dál po řadě
    if (!found) idx = (current.sourceIdx + dir + sources.length) % sources.length;
    current.sourceIdx = idx;
    renderCurrent();
  }

  function renderSourceBar() {
    var sources = sourcesFor(current.type);
    var src = sources[current.sourceIdx];
    current.tried.add(current.sourceIdx);
    var used = current.tried.size;
    var total = sources.length;
    var remaining = total - used;
    var st = probeState(src);
    sourceLabelNode.textContent = src.label + " (" + (current.sourceIdx + 1) + "/" + total + ")" + (st === true ? " ✓" : st === false ? " ✗ titul nemá" : "");
    var has = 0, known = 0;
    sources.forEach(function (x) { var q = probeState(x); if (q === true) has++; if (q === true || q === false) known++; });
    sourceCounterNode.textContent = known ? "titul má " + has + " z " + known + " ověřených zdrojů" : "vyzkoušeno " + used + " z " + total;
  }

  function updateEpCurrentLabel() {
    modal.querySelector("#mfCinEpCurrent").textContent =
      "S" + pad2(current.season) + " · E" + pad2(current.episode);
  }

  function stepEpisode(dir) {
    ensureEpCounts(function () {
      var countFn = getEpCountFn();
      var epsInThis = countFn(current.season);
      var newEp = current.episode + dir;
      var newSeason = current.season;
      if (newEp < 1) {
        if (newSeason > 1) {
          newSeason -= 1;
          newEp = countFn(newSeason);
        } else {
          newEp = 1;
        }
      } else if (newEp > epsInThis) {
        if (!current.totalSeasonsCount || newSeason < current.totalSeasonsCount) {
          newSeason += 1;
          newEp = 1;
        } else {
          newEp = epsInThis;
        }
      }
      current.season = newSeason;
      current.episode = newEp;
      if (current.localSlug) appMarkWatched(current.localSlug + "-S" + current.season + "-E" + current.episode);
      noteGoodIfStayed();
      current.tried = new Set();
      current._manual = false; current._noneToast = false;
      current.sourceIdx = startIndex();
      renderCurrent();
      probeSources();
      if (epGridPanel.style.display !== "none") renderEpGrid();
    });
  }

  function goNextSeries() {
    var nextSlug = findNextSeriesSlug();
    if (!nextSlug) {
      if (typeof showToast === "function") showToast("Žádný další seriál v seznamu nenalezen", "error");
      return;
    }
    var d = appDb();
    var entry = d[nextSlug];
    var next = null;
    try {
      next = typeof findNextEp === "function" ? findNextEp(nextSlug) : null;
    } catch (e) {}
    var season = next ? next.se : 1;
    var episode = next ? next.ep : 1;
    if (typeof showToast === "function") showToast("▶ " + (entry.name || nextSlug), "success");
    open(entry.tmdbId || nextSlug, entry.name || nextSlug, "tv_ep", {
      season: season,
      episode: episode,
      localSlug: nextSlug
    });
  }

  function toggleEpGrid() {
    var show = epGridPanel.style.display === "none";
    epGridPanel.style.display = show ? "flex" : "none";
    if (show) {
      ensureEpCounts(function () {
        renderEpGrid();
      });
    }
  }

  function renderEpGrid() {
    var seasonsBar = modal.querySelector("#mfCinEpGridSeasons");
    var totalS = current.totalSeasonsCount || 1;
    seasonsBar.innerHTML = "";
    for (var s = 1; s <= totalS; s++) {
      (function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "mf-cin-season-chip" + (s === current.season ? " active" : "");
        b.textContent = "S" + pad2(s);
        b.onclick = function () {
          current.season = s;
          renderEpGrid();
        };
        seasonsBar.appendChild(b);
      })(s);
    }

    var epsCount = getEpCountFn()(current.season);
    epGridBody.innerHTML = "";
    for (var e = 1; e <= epsCount; e++) {
      (function (e) {
        var watched = isEpWatched(current.season, e);
        var b = document.createElement("button");
        b.type = "button";
        b.className =
          "mf-cin-ep-chip" +
          (watched ? " watched" : "") +
          (e === current.episode ? " current" : "");
        b.innerHTML =
          '<span class="mf-cin-ep-chip-num">E' + pad2(e) + "</span>" +
          '<span class="mf-cin-ep-chip-mark">' + (watched ? "✓" : "") + "</span>";
        b.title = watched ? "Zhlédnuto" : "Nezhlédnuto";
        b.onclick = function () {
          current.episode = e;
          if (current.localSlug) appMarkWatched(current.localSlug + "-S" + current.season + "-E" + e);
          noteGoodIfStayed();
          current.tried = new Set();
          current.sourceIdx = startIndex();
          renderCurrent();
          renderEpGrid();
        };
        epGridBody.appendChild(b);
      })(e);
    }
  }

  /* Přehrávač běží bez sandboxu: hostingy videa (např. Filemoon uvnitř SvetSerialu) sandbox detekují a odmítnou přehrávat. */
  function loadNoEmbed(url, label) {
    var safe = String(url).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    frame.classList.add("mf-cinema-ready");
    frame.innerHTML =
      '<div class="mf-cin-noembed">' +
        "<strong>" + String(label || "Tento zdroj").replace(/</g, "&lt;") + " nejde zobrazit uvnitř aplikace</strong>" +
        "<span>Web vložení do jiné stránky blokuje. Otevři ho v novém okně, nebo přepni na jiný zdroj.</span>" +
        '<a class="mf-cin-noembed-btn" href="' + safe + '" target="_blank" rel="noopener">Otevřít v novém okně</a>' +
      "</div>";
  }

  function loadUrl(url, label, noEmbed) {
    if (noEmbed) return loadNoEmbed(url, label);
    frame.classList.remove("mf-cinema-ready");
    frame.innerHTML =
      '<div class="mf-cinema-skeleton" role="status" aria-live="polite">' +
        '<div class="mf-cinema-skeleton-mark">▶</div>' +
        '<div class="mf-cinema-skeleton-line mf-cinema-skeleton-line-title"></div>' +
        '<div class="mf-cinema-skeleton-line mf-cinema-skeleton-line-meta"></div>' +
        "<span>Načítám přehrávač…</span>" +
      "</div>" +
      '<iframe title="Cinema Mode" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" ' +
      'referrerpolicy="strict-origin-when-cross-origin"' +
      ' src="' + String(url).replace(/"/g, "&quot;") + '"></iframe>';
    var playerFrame = frame.querySelector("iframe");
    playerFrame.addEventListener(
      "load",
      function () {
        frame.classList.add("mf-cinema-ready");
        var skeleton = frame.querySelector(".mf-cinema-skeleton");
        if (skeleton) skeleton.setAttribute("aria-hidden", "true");
      },
      { once: true }
    );
  }

  function toggleCurrentFavorite() {
    if (!current || !current.tmdbId) return;
    if (typeof window.toggleTmdbFavorite !== "function") return;
    window.toggleTmdbFavorite(current.tmdbId, current.type, current.title || "", "", favBtn);
    updateFavBtn();
  }

  function updateFavBtn() {
    if (!favBtn || !current) return;
    var faved = current.tmdbId && typeof window.isTmdbFavorite === "function"
      ? window.isTmdbFavorite(current.tmdbId, current.type)
      : false;
    favBtn.classList.toggle("faved", !!faved);
    favBtn.textContent = faved ? "♥" : "♡";
    favBtn.title = favBtn.ariaLabel = faved ? "Odebrat z Oblíbených" : "Přidat do Oblíbených";
  }

  /* Hvězdička: označí epizodu jako zhlédnutou a otevře okno „Jak se ti epizoda líbila?“ */
  function rateCurrentEpisode() {
    noteGoodIfStayed();
    if (!current || typeof window.openEpRating !== "function") return;
    var btn = modal.querySelector("#mfCinRateBtn");
    if (current.type === "tv") {
      var slug = current.localSlug || ("__dtv_" + current.tmdbId);
      var uid = slug + "-S" + current.season + "-E" + current.episode;
      appMarkWatched(uid);
      var prev = typeof window.getEpRating === "function" ? window.getEpRating(uid) : 0;
      window.openEpRating(uid, current.title || "", "S" + pad2(current.season) + " · E" + pad2(current.episode), prev || 0, btn);
    } else {
      var mid = "movie-" + current.tmdbId;
      var mprev = typeof window.getEpRating === "function" ? window.getEpRating(mid) : 0;
      window.openEpRating(mid, current.title || "", "Film", mprev || 0, btn);
    }
  }

  function renderCurrent() {
    var url = buildUrl();
    var sources = sourcesFor(current.type);
    var label = sources[current.sourceIdx].label;
    current._loadedUrl = url;
    current._srcSince = Date.now();
    loadUrl(url, label, sources[current.sourceIdx].noEmbed);
    renderSourceBar();
    updateFavBtn();
    var rateBtn = modal.querySelector("#mfCinRateBtn");
    if (rateBtn) rateBtn.style.display = "inline-flex";
    if (current.type === "tv") {
      tvBar.style.display = "flex";
      updateEpCurrentLabel();
      modal.querySelector("#mfCinNextSeries").style.display = findNextSeriesSlug() ? "inline-flex" : "none";
    } else {
      tvBar.style.display = "none";
      epGridPanel.style.display = "none";
    }
  }

  function open(tmdbId, title, type, extra) {
    ensureModal();
    var rawId = String(tmdbId || "");
    var parts = rawId.split("/");
    var isEpisode = type === "tv_ep" || parts.length === 3;
    var baseId = isEpisode ? parts[0] : rawId;
    var year = window._cinYear || null;
    // activeSeries zůstává nastavené i po zavření seriálu — použij ho jen pokud patří k otevíraným titulu
    var activeSlug = null;
    try {
      if (typeof activeSeries !== "undefined" && activeSeries) {
        var dbx = appDb(), ent = dbx && dbx[activeSeries];
        if (ent && ent.tmdbId && String(ent.tmdbId) === String(baseId)) activeSlug = activeSeries;
      }
    } catch (e) {}
    var localSlug = (extra && extra.localSlug) || window._cinSiteSlug || activeSlug;

    current = {
      tmdbId: baseId,
      title: cleanTitle(title),
      type: isEpisode || type === "tv" ? "tv" : "movie",
      season: extra && extra.season ? extra.season : (isEpisode ? parseInt(parts[1], 10) || 1 : 1),
      episode: extra && extra.episode ? extra.episode : (isEpisode ? parseInt(parts[2], 10) || 1 : 1),
      sourceIdx: 0,
      year: year,
      localSlug: localSlug,
      totalSeasonsCount: null,
      totalEps: {},
      epCountFn: null,
      altTitles: null,
      tried: new Set()
    };
    window._cinSiteSlug = null;
    window._cinYear = null;

    titleNode.textContent = current.title || "Cinema Mode";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    if (current.type === "movie" && typeof window.mfRecordContinueMovie === "function") window.mfRecordContinueMovie(current.tmdbId, current.title);
    current.sourceIdx = startIndex();
    renderCurrent();
    if (!prefEntry().good) {
      var openedKey = prefKey(), openedIdx = current.sourceIdx, openedAt = current._srcSince;
      shFetch(openedKey, function (label) {
        // odpověď dorazila brzy a uživatel zatím nic nepřepínal: začni zdrojem, který funguje ostatním
        if (!current || prefKey() !== openedKey || current.sourceIdx !== openedIdx || current._srcSince !== openedAt) return;
        if (Date.now() - openedAt > 2500 || prefEntry().good) return;
        var ni = startIndex();
        if (ni !== openedIdx) { current.sourceIdx = ni; renderCurrent(); }
      });
    }
    if (current.type === "tv") ensureEpCounts(function () {});
    loadAltTitles(current);
    probeSources();
  }

  function close() {
    if (!modal) return;
    if (current && modal.classList.contains("open")) noteGoodIfStayed();
    modal.classList.remove("open");
    frame.innerHTML = "";
    if (epGridPanel) epGridPanel.style.display = "none";
    document.body.style.overflow = "";
  }

  window.MFCinemaPlayer = { open: open, close: close, currentUrl: function () { return current ? buildUrl() : ""; }, sourceIds: function (type) { return (type === "movie" ? MOVIE_SOURCES : TV_SOURCES).map(function (s) { return s.id; }); } };
})();

(function() {
  const STREAMING_PROVIDERS = {
    350: {
      name: "Apple TV+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Apple_TV_Plus_Logo.svg",
      url: (title, type) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}`
    },
    8: {
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      url: (title, type) => `https://www.netflix.com/search?query=${encodeURIComponent(title)}`
    },
    9: {
      name: "Prime Video",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Amazon_Prime_Video_logo.jpg",
      url: (title, type) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`
    },
    337: {
      name: "Disney+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Disney%2B_logo.svg",
      url: (title, type) => `https://www.disneyplus.com/search?query=${encodeURIComponent(title)}`
    },
    1899: {
      name: "Max",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Max_Logo.svg",
      url: (title, type) => `https://www.max.com/search/${encodeURIComponent(title)}`
    },
    274: {
      name: "HBO Max",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/HBO_Max_Logo.svg",
      url: (title, type) => `https://www.hbomax.com/search?query=${encodeURIComponent(title)}`
    },
    372: {
      name: "Crunchyroll",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Crunchyroll_2021.svg",
      url: (title, type) => `https://www.crunchyroll.com/search?query=${encodeURIComponent(title)}`
    },
    203: {
      name: "Canal+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Canal_plus.svg",
      url: (title, type) => `https://canalplus.cz/vyhledavani?query=${encodeURIComponent(title)}`
    },
    679: {
      name: "Voyo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Voyo_logo.svg",
      url: (title, type) => `https://voyo.cz/hledat?q=${encodeURIComponent(title)}`
    },
    100032: {
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      url: (title, type) => `https://www.netflix.com/search?query=${encodeURIComponent(title)}`
    },
    625: {
      name: "SkyShowtime",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/SkyShowtime_2022.svg",
      url: (title, type) => `https://www.skyshowtime.com/search?q=${encodeURIComponent(title)}`
    },
    1777: {
      name: "O2 TV",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/O2_logo.svg",
      url: (title, type) => `https://www.o2tv.cz/hledej?q=${encodeURIComponent(title)}`
    },
    435: {
      name: "Mall.TV",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/MallTV_logo.svg",
      url: (title, type) => `https://mall.tv/vysledky-vyhledavani?search=${encodeURIComponent(title)}`
    },
    682: {
      name: "Kiwi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Kiwi.com_logo.svg",
      url: (title, type) => `https://kiwi.com/cz/search?search=${encodeURIComponent(title)}`
    },
    68: {
      name: "Plex",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Plex_logo.svg",
      url: (title, type) => `https://app.plex.tv/search?query=${encodeURIComponent(title)}`
    },
    358: {
      name: "Rakuten",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Rakuten_TV_logo.svg",
      url: (title, type) => `https://rakuten.tv/search/${encodeURIComponent(title)}`
    },
    326: {
      name: "Mubi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2c/MUBI_Logo.svg",
      url: (title, type) => `https://mubi.com/search?q=${encodeURIComponent(title)}`
    },
    10: {
      name: "Prime Video",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Amazon_Prime_Video_logo.jpg",
      url: (title, type) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`
    },
    418: {
      name: "Hulu",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg",
      url: (title, type) => `https://www.hulu.com/search?query=${encodeURIComponent(title)}`
    },
    122: {
      name: "Disney+ Hotstar",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Disney%2B_Logo.svg",
      url: (title, type) => `https://www.hotstar.com/search?query=${encodeURIComponent(title)}`
    },
    531: {
      name: "Paramount+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Paramount%2B_logo.svg",
      url: (title, type) => `https://www.paramountplus.com/search/${encodeURIComponent(title)}`
    },
    391: {
      name: "Peacock",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Peacock_Logo.svg",
      url: (title, type) => `https://www.peacocktv.com/search/${encodeURIComponent(title)}`
    },
    1537: {
      name: "Discovery+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Discovery%2B_logo.svg",
      url: (title, type) => `https://www.discoveryplus.com/search?query=${encodeURIComponent(title)}`
    }
  };

  const REGIONS_TO_TRY = ['CZ', 'SK', 'US', 'GB', 'DE'];

  async function fetchWatchProviders(tmdbId, type) {
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/watch/providers?api_key=${window.TMDB_KEY || window.TMDB_KEY_DEFAULT || ''}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      return data;
    } catch (err) {
      console.warn('[LegalProviders] Fetch error:', err);
      return null;
    }
  }

  /* Vrátí { region, link, groups: { flatrate, rent, buy } }. Nejdřív ČR/SK (cokoli: předplatné, půjčení, koupě),
   * teprve potom zahraniční regiony (jen předplatné). */
  function getCzechProviders(providersData) {
    if (!providersData?.results) return null;
    const pick = (d, kinds) => {
      const groups = {};
      const seen = new Set();
      kinds.forEach(k => {
        groups[k] = (Array.isArray(d[k]) ? d[k] : []).filter(p => {
          if (!p || p.provider_id == null || seen.has(p.provider_id)) return false;
          seen.add(p.provider_id);
          return true;
        });
      });
      return groups;
    };
    for (const region of REGIONS_TO_TRY) {
      const d = providersData.results[region];
      if (!d) continue;
      const local = region === 'CZ' || region === 'SK';
      const groups = pick(d, local ? ['flatrate', 'rent', 'buy'] : ['flatrate']);
      if (Object.values(groups).some(g => g.length)) {
        return { region: region, link: typeof d.link === 'string' ? d.link : '', groups: groups };
      }
    }
    return null;
  }

  /* Normalizovaný název pro porovnání ("Disney Plus" ≈ "Disney+ Hotstar", "Amazon Prime Video" ≈ "Prime Video"). */
  function normProviderName(n) {
    return String(n || '').toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
  }

  /* Odkaz na službu se hledá nejdřív podle ID, pak podle názvu (ID v ruční mapě nebyla všechna správná). */
  function findKnownProvider(provider) {
    const n = normProviderName(provider.provider_name);
    if (n) {
      // Podle názvu (spolehlivé): ID v ruční tabulce nejsou všechna správná, takže ID by mohlo vést na jinou službu
      return Object.values(STREAMING_PROVIDERS).find(info => {
        const k = normProviderName(info.name);
        return k && (n === k || n.includes(k) || k.includes(n));
      }) || null;
    }
    return STREAMING_PROVIDERS[provider.provider_id] || null;
  }

  let _legalToken = 0;
  function renderLegalProviders(tmdbId, title, type) {
    const myToken = ++_legalToken;
    title = String(title || '').replace(/\s*[—–-]+\s*S\d+E\d+.*/i, '').trim();
    const existing = document.getElementById('legalProvidersSection');
    if (existing) existing.remove();

    // Nový přehrávač (mfStandaloneCinema) má přednost; starý #cinemaModal je jen záložní
    const cinemaModal = document.getElementById('mfStandaloneCinema')
                      || document.getElementById('cinemaModal');
    if (!cinemaModal) return;

    const wrap = document.createElement('div');
    wrap.id = 'legalProvidersSection';
    wrap.style.cssText = `
      position: absolute;
      bottom: 72px;
      right: 16px;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      pointer-events: none;
    `;

    const panel = document.createElement('div');
    panel.id = 'legalProvidersPanel';
    panel.style.cssText = `
      background: rgba(10,10,16,0.92);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 12px 14px;
      display: none;
      flex-direction: column;
      gap: 8px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.7);
      pointer-events: auto;
      max-width: 240px;
    `;

    const panelLabel = document.createElement('div');
    panelLabel.style.cssText = `
      font-size: 0.52rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-bottom: 2px;
    `;
    panelLabel.textContent = 'Legálně dostupné na';
    panel.appendChild(panelLabel);

    const providersRow = document.createElement('div');
    providersRow.style.cssText = `
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      justify-content: flex-end;
    `;
    panel.appendChild(providersRow);

    const badge = document.createElement('button');
    badge.id = 'legalProvidersBadge';
    badge.title = 'Kde legálně sledovat';
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px 7px 9px;
      background: rgba(10,10,16,0.88);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50px;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s ease;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
      color: rgba(255,255,255,0.55);
      font-size: 0.68rem;
      font-weight: 600;
      font-family: -apple-system, sans-serif;
      white-space: nowrap;
    `;
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M9 20h6M12 17v3"/><path d="M10.5 8.2v5.6l4.6-2.8z" fill="currentColor"/>
      </svg>
      <span id="legalBadgeText">Kde sledovat?</span>
    `;
    badge.onmouseenter = () => {
      badge.style.background = 'rgba(20,20,30,0.95)';
      badge.style.borderColor = 'rgba(255,255,255,0.18)';
      badge.style.color = 'rgba(255,255,255,0.85)';
    };
    badge.onmouseleave = () => {
      badge.style.background = 'rgba(10,10,16,0.88)';
      badge.style.borderColor = 'rgba(255,255,255,0.1)';
      badge.style.color = 'rgba(255,255,255,0.55)';
    };

    let panelOpen = false;
    badge.onclick = () => {
      panelOpen = !panelOpen;
      panel.style.display = panelOpen ? 'flex' : 'none';
    };

    wrap.appendChild(panel);
    wrap.appendChild(badge);
    cinemaModal.appendChild(wrap);

    fetchWatchProviders(tmdbId, type).then(data => {
      if (myToken !== _legalToken) return; // mezitím se otevřel jiný titul
      const czData = getCzechProviders(data);
      const total = czData ? Object.values(czData.groups).reduce((n, g) => n + g.length, 0) : 0;

      if (!total) {
        badge.style.display = 'none';
        return;
      }

      const regionName = czData.region === 'CZ' ? 'ČR' : czData.region;
      const flat = czData.groups.flatrate || [];
      const nameList = (flat.length ? flat : (czData.groups.rent || []).concat(czData.groups.buy || [])).map(p => p.provider_name).filter(Boolean);
      const shown = nameList.slice(0, 2).join(', ') + (nameList.length > 2 ? ' +' + (nameList.length - 2) : '');
      const prefix = (czData.region === 'CZ' ? '' : czData.region + ': ') + (flat.length ? '' : 'půjčit/koupit: ');

      const badgeText = badge.querySelector('#legalBadgeText');
      if (badgeText) {
        badgeText.textContent = prefix + (shown || 'Dostupné v ' + regionName);
        /* Místo textu a ikony televize jsou vidět loga služeb (název zůstává pro čtečky a v title) */
        badgeText.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
      }
      const allP = (czData.groups.flatrate || []).concat(czData.groups.rent || [], czData.groups.buy || []).filter(p => p.logo_path);
      if (allP.length) {
        const oldSvg = badge.querySelector('svg');
        if (oldSvg) oldSvg.remove();
        const stack = document.createElement('span');
        stack.style.cssText = 'display:flex;align-items:center;';
        allP.slice(0, 3).forEach((p, i) => {
          const im = document.createElement('img');
          im.src = 'https://image.tmdb.org/t/p/w92' + p.logo_path;
          im.alt = '';
          im.style.cssText = 'width:24px;height:24px;border-radius:6px;object-fit:cover;border:1px solid rgba(0,0,0,0.5);' + (i ? 'margin-left:-8px;' : '');
          im.onerror = () => { im.style.display = 'none'; };
          stack.appendChild(im);
        });
        if (allP.length > 3) {
          const more = document.createElement('span');
          more.textContent = '+' + (allP.length - 3);
          more.style.cssText = 'margin-left:6px;font-size:0.68rem;font-weight:700;color:rgba(255,255,255,0.7);';
          stack.appendChild(more);
        }
        badge.insertBefore(stack, badge.firstChild);
        badge.style.padding = '6px 10px';
      }
      badge.title = 'Dostupné legálně v regionu ' + regionName;

      badge.style.borderColor = 'rgba(0,122,255,0.3)';
      const bsvg = badge.querySelector('svg'); if (bsvg) bsvg.style.stroke = '#007aff';

      panelLabel.textContent = 'Legálně dostupné (' + regionName + ')';

      const GROUP_LABELS = { flatrate: 'Předplatné', rent: 'Půjčit', buy: 'Koupit' };
      const fallbackUrl = czData.link || ('https://www.justwatch.com/cz/hledat?q=' + encodeURIComponent(title));

      Object.keys(GROUP_LABELS).forEach(kind => {
        const list = czData.groups[kind] || [];
        if (!list.length) return;
        if (czData.groups.flatrate.length || Object.keys(GROUP_LABELS).filter(k => (czData.groups[k] || []).length).length > 1) {
          const gl = document.createElement('div');
          gl.style.cssText = 'width:100%;text-align:right;font-size:0.5rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-top:4px;';
          gl.textContent = GROUP_LABELS[kind];
          providersRow.appendChild(gl);
        }
        list.forEach(provider => {
          const info = findKnownProvider(provider);
          const providerName = provider.provider_name || (info && info.name) || 'Služba';
          const logoUrl = provider.logo_path ? 'https://image.tmdb.org/t/p/w92' + provider.logo_path : (info && info.logo) || '';

          const btn = document.createElement('a');
          btn.href = info ? info.url(title, type) : fallbackUrl;
          btn.target = '_blank';
          btn.rel = 'noopener noreferrer';
          btn.title = providerName;
          btn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            padding: ${logoUrl ? '3px' : '6px 10px'};
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: ${logoUrl ? '12px' : '20px'};
            text-decoration: none;
            transition: all 0.18s;
            cursor: pointer;
          `;
          btn.onmouseenter = () => {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.borderColor = 'rgba(255,255,255,0.18)';
          };
          btn.onmouseleave = () => {
            btn.style.background = 'rgba(255,255,255,0.05)';
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
          };

          if (logoUrl) {
            const logo = document.createElement('img');
            logo.src = logoUrl;
            logo.alt = providerName;
            logo.style.cssText = `width:40px;height:40px;object-fit:cover;border-radius:9px;display:block;`;
            logo.onerror = () => { logo.style.display = 'none'; btn.style.padding = '6px 10px'; name.style.display = ''; };
            btn.appendChild(logo);
          }

          const name = document.createElement('span');
          if (logoUrl) name.style.display = 'none';
          name.style.cssText += `font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.8);white-space:nowrap;font-family:-apple-system,sans-serif;`;
          name.textContent = providerName;
          btn.appendChild(name);
          providersRow.appendChild(btn);
        });
      });

    }).catch(() => {
      badge.style.display = 'none';
    });
  }

  if (window.MFCinemaPlayer && typeof window.MFCinemaPlayer.open === 'function') {
    const _origPlayerOpen = window.MFCinemaPlayer.open;
    window.MFCinemaPlayer.open = function(tmdbId, title, type, extra) {
      const result = _origPlayerOpen.apply(this, arguments);
      const actualTmdbId = String(tmdbId).split('/')[0];
      setTimeout(() => {
        renderLegalProviders(actualTmdbId, title, type);
      }, 800);
      return result;
    };
  }

  const originalOpenMovieInCinema = window.openMovieInCinema;
  window.openMovieInCinema = function(tmdbId, title, type) {
    if (originalOpenMovieInCinema) {
      originalOpenMovieInCinema.apply(this, arguments);
    }
    // MFCinemaPlayer.open je už obalený výše — nevykreslovat podruhé
    if (window.MFCinemaPlayer && typeof window.MFCinemaPlayer.open === 'function') return;

    const actualTmdbId = String(tmdbId).split('/')[0];

    setTimeout(() => {
      renderLegalProviders(actualTmdbId, title, type);
    }, 800);
  };

  window.MFLegalProviders = {
    show: renderLegalProviders,
    providers: STREAMING_PROVIDERS
  };

})();

