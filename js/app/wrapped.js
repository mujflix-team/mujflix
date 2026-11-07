/* MůjFlix — Wrapped: měsíční přehled sledování ve stylu příběhu (jako Spotify Wrapped).
 * Počítá jen z dat, která appka už ukládá lokálně (mf_watch_timeline, mf_cont_movies, mf_ratings); nic se nikam neposílá.
 * Dvě části: MFWrappedCore (čisté výpočty a HTML slidů, bez DOM; testuje je tests/wrapped.mjs)
 * a MFWrapped (obrazovka, pozvánka na úvodní stránce, sdílení obrázku).
 * Z globálů používá jen uKey, db, getActiveProfile a showToast, vždy s kontrolou typeof. */
(function () {
  "use strict";

  /* ───────────── Konstanty ───────────── */
  var MONTHS = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
  var WEEKDAYS_ON = ["v pondělí", "v úterý", "ve středu", "ve čtvrtek", "v pátek", "v sobotu", "v neděli"]; // pondělí = 0
  var BUCKETS = [
    { id: "noc", label: "V noci", range: "0–6 h" },
    { id: "rano", label: "Ráno", range: "6–12 h" },
    { id: "odpoledne", label: "Odpoledne", range: "12–18 h" },
    { id: "vecer", label: "Večer", range: "18–24 h" }
  ];
  var DEFAULT_EP_MIN = 40; // délka epizody, když ji appka u seriálu nezná (jen odhad)
  var MOVIE_MIN = 105; // film nemá uloženou délku, počítá se průměr
  var GENRES = {
    28: "Akční", 12: "Dobrodružný", 16: "Animovaný", 35: "Komedie", 80: "Krimi", 99: "Dokumentární", 18: "Drama",
    10751: "Rodinný", 14: "Fantasy", 36: "Historický", 27: "Horor", 10402: "Hudební", 9648: "Mysteriózní",
    10749: "Romantický", 878: "Sci-Fi", 10770: "TV film", 53: "Thriller", 10752: "Válečný", 37: "Western",
    10762: "Dětský", 10763: "Zprávy", 10764: "Reality", 10766: "Telenovela", 10767: "Talk show"
  };
  // Seriálová ID, která mají u filmů jiné číslo: sloučí se, ať v přehledu není „Akční“ a „Akční a dobrodružný“ zvlášť
  var GENRE_BUCKET = { 10759: 28, 10765: 878, 10768: 10752 };

  /* ───────────── Pomocné funkce ───────────── */
  function plural(n, one, few, many) {
    n = Math.abs(Math.floor(Number(n) || 0));
    return n === 1 ? one : (n >= 2 && n <= 4 ? few : many);
  }
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  // Plakát smí být jen z TMDB (data mohou přijít i ze zálohy ze souboru, takže se jim nevěří)
  function safePoster(u) { return typeof u === "string" && /^https:\/\/image\.tmdb\.org\/t\/p\/[\w./-]+$/.test(u) ? u : ""; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function monthKey(year, month) { return year + "-" + pad2(month + 1); }
  function parseMonthKey(k) {
    var m = /^(\d{4})-(\d{2})$/.exec(String(k || ""));
    if (!m) return null;
    var mo = Number(m[2]) - 1;
    return mo >= 0 && mo <= 11 ? { year: Number(m[1]), month: mo } : null;
  }
  function monthLabel(key) { var p = parseMonthKey(key); return p ? MONTHS[p.month] + " " + p.year : ""; }
  function monthRange(year, month) { return [new Date(year, month, 1).getTime(), new Date(year, month + 1, 1).getTime()]; }
  function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
  // Pořadové číslo dne z místního data (UTC kvůli změně letního času), pro hledání dnů v řadě
  function dayNum(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function fmtDuration(min) {
    min = Math.max(0, Math.round(min));
    if (min < 90) return { value: String(min), unit: plural(min, "minuta", "minuty", "minut") };
    var h = Math.round(min / 60);
    return { value: String(h), unit: plural(h, "hodina", "hodiny", "hodin") };
  }
  function fmtDM(dom, month) { return dom + ".\u00a0" + (month + 1) + "."; } // pevná mezera, ať se datum nelomí uprostřed
  // „září“ je střední rod: Tvé září, Moje září, hotové; ostatní měsíce jsou mužského rodu
  function gender(month) {
    return month === 8 ? { your: "Tvé", my: "Moje", done: "hotové" } : { your: "Tvůj", my: "Můj", done: "hotový" };
  }

  /* ───────────── Výpočet statistik ───────────── */
  // o: { year, month, timeline, movies, ratings, runtimeOf(slug) → minuty nebo 0, nameOf(slug) → název nebo "" }
  function compute(o) {
    var range = monthRange(o.year, o.month), start = range[0], end = range[1];
    var runtimeOf = typeof o.runtimeOf === "function" ? o.runtimeOf : function () { return 0; };
    var nameOf = typeof o.nameOf === "function" ? o.nameOf : function () { return ""; };
    var inMonth = function (ts) { return isNum(ts) && ts >= start && ts < end; };

    // Epizody: nejstarší první, ať u názvu a plakátu vyhraje poslední neprázdná hodnota
    var eps = (Array.isArray(o.timeline) ? o.timeline : []).filter(function (e) {
      return e && typeof e === "object" && typeof e.slug === "string" && e.slug && inMonth(e.ts);
    }).sort(function (a, b) { return a.ts - b.ts; });

    // Filmy: u každého jen poslední pustění
    var movieById = {};
    (Array.isArray(o.movies) ? o.movies : []).forEach(function (m) {
      if (!m || typeof m !== "object" || !inMonth(m.ts)) return;
      var id = String(m.tmdbId == null ? "" : m.tmdbId);
      if (!id) return;
      if (!movieById[id] || m.ts >= movieById[id].ts) movieById[id] = m;
    });
    var movies = Object.keys(movieById).map(function (id) {
      var m = movieById[id];
      return { tmdbId: id, title: typeof m.title === "string" ? m.title : "", poster: safePoster(m.poster), ts: m.ts };
    }).sort(function (a, b) { return a.ts - b.ts; });

    // Seriály
    var shows = {}, showList = [];
    eps.forEach(function (e) {
      var s = shows[e.slug];
      if (!s) { s = shows[e.slug] = { slug: e.slug, name: "", poster: "", count: 0, lastTs: 0 }; showList.push(s); }
      s.count++; s.lastTs = e.ts;
      if (typeof e.name === "string" && e.name) s.name = e.name;
      if (safePoster(e.poster)) s.poster = safePoster(e.poster);
    });
    showList.forEach(function (s) { if (!s.name) s.name = String(nameOf(s.slug) || "") || "Seriál"; });
    var topShows = showList.slice().sort(function (a, b) { return b.count - a.count || b.lastTs - a.lastTs; }).slice(0, 5);

    // Odhad času
    var rtCache = {}, minutes = 0;
    eps.forEach(function (e) {
      if (!(e.slug in rtCache)) { var rt = Number(runtimeOf(e.slug)); rtCache[e.slug] = rt > 0 ? Math.min(240, Math.max(5, rt)) : DEFAULT_EP_MIN; }
      minutes += rtCache[e.slug];
    });
    minutes += movies.length * MOVIE_MIN;

    // Žánry (jen u epizod; u filmů appka žánry neukládá). Každý záznam počítá žánr nejvýš jednou.
    var gc = {};
    eps.forEach(function (e) {
      var seen = {};
      (Array.isArray(e.genres) ? e.genres : []).forEach(function (g) {
        var id = Number(g);
        if (!isFinite(id)) return;
        id = GENRE_BUCKET[id] || id;
        if (!GENRES[id] || seen[id]) return;
        seen[id] = 1; gc[id] = (gc[id] || 0) + 1;
      });
    });
    var topGenres = Object.keys(gc).map(function (id) { return { id: Number(id), name: GENRES[id], count: gc[id] }; })
      .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name, "cs"); }).slice(0, 5);

    // Aktivita: epizody i filmy se berou jako jedno „sledování“ (kdy, který den)
    var events = eps.map(function (e) { return { ts: e.ts, label: shows[e.slug].name }; })
      .concat(movies.map(function (m) { return { ts: m.ts, label: m.title || "Film" }; }));
    var hours = { noc: 0, rano: 0, odpoledne: 0, vecer: 0 }, weekdays = [0, 0, 0, 0, 0, 0, 0], late = 0, morning = 0;
    var days = {}; // dayNum → { n, dom, items: { název: počet } }
    events.forEach(function (ev) {
      var d = new Date(ev.ts), h = d.getHours();
      hours[h < 6 ? "noc" : h < 12 ? "rano" : h < 18 ? "odpoledne" : "vecer"]++;
      if (h >= 22 || h < 6) late++;
      if (h >= 6 && h < 12) morning++;
      weekdays[(d.getDay() + 6) % 7]++;
      var k = dayNum(d), day = days[k] || (days[k] = { n: 0, dom: d.getDate(), items: {} });
      day.n++; day.items[ev.label] = (day.items[ev.label] || 0) + 1;
    });
    var dayKeys = Object.keys(days).map(Number).sort(function (a, b) { return a - b; });

    // Nejdelší série dní po sobě
    var streak = null, runStart = 0;
    dayKeys.forEach(function (k, i) {
      if (i > 0 && k !== dayKeys[i - 1] + 1) runStart = i;
      var len = i - runStart + 1;
      if (!streak || len > streak.len) streak = { len: len, fromDom: days[dayKeys[runStart]].dom, toDom: days[k].dom };
    });

    // Nejrušnější den (při shodě vyhrává dřívější)
    var busiest = null;
    dayKeys.forEach(function (k) {
      var d = days[k];
      if (busiest && d.n <= busiest.count) return;
      var top = Object.keys(d.items).sort(function (a, b) { return d.items[b] - d.items[a]; })[0];
      busiest = { dom: d.dom, count: d.n, top: top || "" };
    });

    var peak = BUCKETS.slice().sort(function (a, b) { return hours[b.id] - hours[a.id]; })[0];
    var peakDay = 0;
    weekdays.forEach(function (n, i) { if (n > weekdays[peakDay]) peakDay = i; });

    // Hodnocení v tomto měsíci
    var loved = [], ratedCount = 0, ro = o.ratings && typeof o.ratings === "object" && !Array.isArray(o.ratings) ? o.ratings : {};
    Object.keys(ro).forEach(function (slug) {
      var v = ro[slug];
      if (!v || typeof v !== "object" || !inMonth(v.ts)) return;
      ratedCount++;
      if (v.rating !== "loved") return;
      var nm = typeof v.name === "string" && v.name && v.name !== slug ? v.name : String(nameOf(slug) || "");
      if (nm) loved.push({ name: nm, ts: v.ts });
    });
    loved.sort(function (a, b) { return b.ts - a.ts; });

    var total = events.length;
    var stats = {
      key: monthKey(o.year, o.month), year: o.year, month: o.month, daysInMonth: daysInMonth(o.year, o.month),
      empty: total === 0,
      episodes: eps.length, movies: movies.length, events: total,
      titles: showList.length + movies.length,
      minutes: minutes,
      topShows: topShows, topGenres: topGenres, movieList: movies,
      hours: hours, peakBucket: peak, peakWeekday: peakDay, weekdays: weekdays,
      shareLate: total ? late / total : 0, shareMorning: total ? morning / total : 0,
      activeDays: dayKeys.length, streak: streak, busiest: busiest,
      loved: loved.slice(0, 5), ratedCount: ratedCount
    };
    stats.persona = persona(stats);
    return stats;
  }

  // Typ diváka: první splněné pravidlo z těchto, vždy s číslem, ze kterého vzniklo (bez rodových tvarů)
  function persona(s) {
    var n = s.events;
    if (n < 5) return { id: "start", title: "Začátečník", blurb: "Zatím jen pár zhlédnutí, ale každý velký seriál někde začal." };
    if (s.busiest && s.busiest.count >= 6) return { id: "marathon", title: "Maratonec", blurb: "Za jediný den " + s.busiest.count + " zhlédnutí. Pohodlí gauče vítězí." };
    if (s.shareLate >= 0.4) return { id: "night", title: "Noční sova", blurb: Math.round(s.shareLate * 100) + " % sledování proběhlo po desáté večer nebo v noci." };
    if (s.shareMorning >= 0.35) return { id: "morning", title: "Ranní ptáče", blurb: Math.round(s.shareMorning * 100) + " % sledování připadá na dopoledne. Kdo dřív vstává, ten víc stihne." };
    if (s.activeDays >= 15) return { id: "regular", title: "Stálice", blurb: "MůjFlix běžel v " + s.activeDays + " dnech z " + s.daysInMonth + ". Takhle vypadá pravidelnost." };
    var top = s.topShows[0];
    if (top && s.episodes >= 5 && top.count / s.episodes >= 0.6) return { id: "loyal", title: "Věrný fanoušek", blurb: Math.round(100 * top.count / s.episodes) + " % epizod patřilo jednomu seriálu: " + top.name + "." };
    if (s.titles >= 8) return { id: "explorer", title: "Objevitel", blurb: s.titles + " různých titulů za jediný měsíc." };
    return { id: "chill", title: "Pohodový divák", blurb: "Žádné extrémy, jen dobrá zábava ve vlastním tempu." };
  }

  /* ───────────── Měsíce, výchozí volba, pozvánka ───────────── */
  // Měsíce, ve kterých něco je (nejnovější první, nejvýš 12)
  function listMonths(o) {
    var seen = {};
    (Array.isArray(o.timeline) ? o.timeline : []).concat(Array.isArray(o.movies) ? o.movies : []).forEach(function (e) {
      if (!e || typeof e !== "object" || !isNum(e.ts)) return;
      var d = new Date(e.ts);
      seen[monthKey(d.getFullYear(), d.getMonth())] = 1;
    });
    return Object.keys(seen).sort().reverse().slice(0, 12);
  }
  function prevMonthOf(now) { return now.getMonth() === 0 ? { year: now.getFullYear() - 1, month: 11 } : { year: now.getFullYear(), month: now.getMonth() - 1 }; }
  // Začátkem měsíce (do 10.) je zajímavý ten minulý, jinak ten aktuální; když v něm nic není, nejnovější s daty
  function pickDefaultMonth(months, now) {
    var cur = monthKey(now.getFullYear(), now.getMonth()), p = prevMonthOf(now), prev = monthKey(p.year, p.month);
    if (now.getDate() <= 10 && months.indexOf(prev) > -1) return prev;
    if (months.indexOf(cur) > -1) return cur;
    return months[0] || cur;
  }

  /* ───────────── Slidy (čisté HTML, vše se escapuje) ───────────── */
  var stag = 0;
  function el(tag, cls, inner) { return "<" + tag + ' class="' + cls + '" style="--i:' + (stag++) + '">' + inner + "</" + tag + ">"; }
  function posterHtml(url, name, cls) {
    return url
      ? '<img class="' + cls + '" src="' + esc(url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '<div class="' + cls + " mfw-poster-ph" + '" aria-hidden="true">' + esc((name || "?").trim().charAt(0).toUpperCase()) + "</div>";
  }
  function barsHtml(rows) { // rows: [{ label, count }] → vodorovné sloupce, délka podle největší hodnoty
    var max = rows.reduce(function (m, r) { return Math.max(m, r.count); }, 0) || 1;
    return '<ul class="mfw-bars">' + rows.map(function (r) {
      return '<li><span class="mfw-bl">' + esc(r.label) + '</span><span class="mfw-bt"><i style="--w:' + Math.round(100 * r.count / max) + '%"></i></span><b>' + r.count + "</b></li>";
    }).join("") + "</ul>";
  }
  function pickerHtml(ctx, currentKey) {
    var months = (ctx.months || []).slice();
    if (months.indexOf(currentKey) < 0) months.unshift(currentKey);
    if (months.length < 2) return "";
    return el("label", "mfw-pick", "<span>Měsíc</span>" +
      '<select class="mfw-select" aria-label="Vybrat měsíc">' + months.map(function (k) {
        return '<option value="' + esc(k) + '"' + (k === currentKey ? " selected" : "") + ">" + esc(monthLabel(k)) + "</option>";
      }).join("") + "</select>");
  }

  // Řádky pro souhrn i pro sdílený obrázek
  function shareRows(s) {
    var rows = [], d = fmtDuration(s.minutes);
    rows.push({ label: "Zhlédnuto", value: (s.episodes ? s.episodes + " " + plural(s.episodes, "epizoda", "epizody", "epizod") : "") + (s.episodes && s.movies ? " + " : "") + (s.movies ? s.movies + " " + plural(s.movies, "film", "filmy", "filmů") : "") });
    rows.push({ label: "Čas před obrazovkou", value: "≈ " + d.value + " " + d.unit });
    if (s.topShows[0]) rows.push({ label: "Seriál měsíce", value: s.topShows[0].name });
    if (s.topGenres[0]) rows.push({ label: "Nejčastější žánr", value: s.topGenres[0].name });
    if (s.streak) rows.push({ label: "Nejdelší série", value: s.streak.len + " " + plural(s.streak.len, "den", "dny", "dní") + " v řadě" });
    rows.push({ label: "Typ diváka", value: s.persona.title });
    return rows;
  }

  // ctx: { name: jméno profilu, months: [klíče měsíců s daty] } → [{ theme, html }]
  function buildSlides(s, ctx) {
    ctx = ctx || {};
    var out = [], mname = MONTHS[s.month], gm = gender(s.month), note = "Počítá se jen sledování zaznamenané v tomto prohlížeči a profilu.";
    function add(theme, html) { out.push({ theme: theme, html: html }); stag = 0; }
    stag = 0;

    if (s.empty) {
      add("blue",
        el("p", "mfw-eyebrow", "MůjFlix Wrapped") +
        el("h1", "mfw-title", gm.your + " <br><span class=\"mfw-mark\">" + esc(mname) + "</span>") +
        el("p", "mfw-lead", "Za tento měsíc zatím není co ukázat.") +
        el("p", "mfw-sub", "Wrapped se plní z epizod, které označíš jako zhlédnuté, a z filmů, které si pustíš.") +
        pickerHtml(ctx, s.key) +
        el("p", "mfw-small", note) +
        el("div", "mfw-actions", '<button type="button" class="mfw-btn mfw-btn-main" data-act="close">Zavřít</button>'));
      return out;
    }

    // 1) Úvod
    add("blue",
      el("p", "mfw-eyebrow", "MůjFlix Wrapped") +
      el("h1", "mfw-title", gm.your + " <br><span class=\"mfw-mark\">" + esc(mname) + "</span>") +
      el("p", "mfw-sub", s.year + (ctx.name ? " · " + esc(ctx.name) : "")) +
      pickerHtml(ctx, s.key) +
      el("p", "mfw-hint", "Dál se jde klepnutím vpravo nebo šipkou →"));

    // 2) Celkem
    var dur = fmtDuration(s.minutes), eq = Math.round(s.minutes / 110), bigN = s.episodes || s.movies;
    add("red",
      el("p", "mfw-eyebrow", "Celkem") +
      el("div", "mfw-num", String(bigN)) +
      el("p", "mfw-lead", (s.episodes ? plural(bigN, "epizoda", "epizody", "epizod") : plural(bigN, "film", "filmy", "filmů")) + " zhlédnuto" +
        (s.episodes && s.movies ? " a k tomu " + s.movies + " " + plural(s.movies, "film", "filmy", "filmů") : "")) +
      el("p", "mfw-lead", "Zhruba " + dur.value + " " + dur.unit + " před obrazovkou") +
      (eq >= 3 ? el("p", "mfw-sub", "To vydá na asi " + eq + " " + plural(eq, "celovečerní film", "celovečerní filmy", "celovečerních filmů") + ".") : "") +
      el("p", "mfw-small", "Odhad podle délky epizod, film se počítá za " + MOVIE_MIN + " minut."));

    // 3) Seriál měsíce
    if (s.topShows.length) {
      var t = s.topShows[0], rest = s.topShows.slice(1, 5);
      add("teal",
        el("p", "mfw-eyebrow", "Seriál měsíce") +
        el("div", "mfw-posterwrap", posterHtml(t.poster, t.name, "mfw-poster")) +
        el("h2", "mfw-h", esc(t.name)) +
        el("p", "mfw-lead", t.count + " " + plural(t.count, "epizoda", "epizody", "epizod")) +
        (rest.length ? el("ol", "mfw-list", rest.map(function (r) {
          return "<li><span>" + esc(r.name) + "</span><b>" + r.count + "</b></li>";
        }).join("")) : ""));
    }

    // 4) Žánry
    if (s.topGenres.length) {
      add("amber",
        el("p", "mfw-eyebrow", "Tvoje žánry") +
        el("h2", "mfw-h", "Nejvíc " + esc(s.topGenres[0].name)) +
        el("div", "mfw-barswrap", barsHtml(s.topGenres.map(function (g) { return { label: g.name, count: g.count }; }))) +
        el("p", "mfw-small", "Počet epizod v žánru. Jedna epizoda může spadat do víc žánrů."));
    }

    // 5) Kdy
    add("night",
      el("p", "mfw-eyebrow", "Kdy se díváš") +
      el("h2", "mfw-h", esc(s.peakBucket.label)) +
      el("div", "mfw-barswrap", barsHtml(BUCKETS.map(function (b) { return { label: b.label, count: s.hours[b.id] }; }))) +
      el("p", "mfw-lead", "Nejčastěji " + WEEKDAYS_ON[s.peakWeekday] + ".") +
      el("p", "mfw-small", BUCKETS.map(function (b) { return b.label.toLowerCase() + " " + b.range; }).join(", ") + "."));

    // 6) Série a nejrušnější den
    var st = s.streak, bd = s.busiest;
    add("green",
      el("p", "mfw-eyebrow", "Série a maratony") +
      el("div", "mfw-stats",
        '<div class="mfw-stat"><b>' + s.activeDays + "</b><span>" + plural(s.activeDays, "aktivní den", "aktivní dny", "aktivních dní") + " z " + s.daysInMonth + "</span></div>" +
        (st ? '<div class="mfw-stat"><b>' + st.len + "</b><span>" + plural(st.len, "den", "dny", "dní") + " v řadě" +
          (st.len > 1 ? " · " + st.fromDom + ".\u2013" + fmtDM(st.toDom, s.month) : " · " + fmtDM(st.fromDom, s.month)) + "</span></div>" : "") +
        (bd ? '<div class="mfw-stat"><b>' + bd.count + "</b><span>zhlédnutí za jediný den · " + fmtDM(bd.dom, s.month) +
          (bd.top ? " (" + esc(bd.top) + ")" : "") + "</span></div>" : "")));

    // 7) Filmy
    if (s.movieList.length) {
      var shown = s.movieList.slice(-6).reverse(), more = s.movieList.length - shown.length;
      add("pink",
        el("p", "mfw-eyebrow", "Filmy") +
        el("h2", "mfw-h", s.movieList.length + " " + plural(s.movieList.length, "film", "filmy", "filmů") + " v tomto měsíci") +
        el("div", "mfw-films", shown.map(function (m) {
          return "<figure>" + posterHtml(m.poster, m.title, "mfw-poster") + "<figcaption>" + esc(m.title || "Film") + "</figcaption></figure>";
        }).join("")) +
        (more > 0 ? el("p", "mfw-small", "a " + more + " " + plural(more, "další", "další", "dalších")) : ""));
    }

    // 8) Milované
    if (s.loved.length) {
      add("rose",
        el("p", "mfw-eyebrow", "Hodnocení") +
        el("h2", "mfw-h", "Milované tituly") +
        el("ul", "mfw-list mfw-loved", s.loved.map(function (l) { return "<li><span>♥ " + esc(l.name) + "</span></li>"; }).join("")));
    }

    // 9) Typ diváka
    add("sky",
      el("p", "mfw-eyebrow", "Jaký jsi divák") +
      el("h2", "mfw-title", esc(s.persona.title)) +
      el("p", "mfw-lead", esc(s.persona.blurb)));

    // 10) Souhrn
    add("dark",
      el("p", "mfw-eyebrow", gm.your + " " + esc(mname) + " " + s.year) +
      el("div", "mfw-card", shareRows(s).map(function (r, i) {
        return '<div class="' + (i < 3 ? "mfw-wide" : "") + '"><small>' + esc(r.label) + "</small><b>" + esc(r.value) + "</b></div>";
      }).join("")) +
      el("div", "mfw-actions", '<button type="button" class="mfw-btn mfw-btn-main" data-act="share">Uložit obrázek</button><button type="button" class="mfw-btn" data-act="close">Zavřít</button>') +
      el("p", "mfw-small", note));
    return out;
  }

  var Core = {
    MONTHS: MONTHS, compute: compute, listMonths: listMonths, pickDefaultMonth: pickDefaultMonth, 
    buildSlides: buildSlides, shareRows: shareRows, monthKey: monthKey, parseMonthKey: parseMonthKey, monthLabel: monthLabel,
    plural: plural, fmtDuration: fmtDuration, gender: gender, esc: esc, safePoster: safePoster
  };
  window.MFWrappedCore = Core;
  if (typeof document === "undefined") return; // mimo prohlížeč (test) jen výpočty

  /* ───────────── Čtení dat profilu ───────────── */
  function readJSON(base, fallback) {
    try {
      var raw = localStorage.getItem(typeof uKey === "function" ? uKey(base) : base);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function readData() {
    var tl = readJSON("mf_watch_timeline", []), mv = readJSON("mf_cont_movies", []), rt = readJSON("mf_ratings", {});
    return { timeline: Array.isArray(tl) ? tl : [], movies: Array.isArray(mv) ? mv : [], ratings: rt && typeof rt === "object" && !Array.isArray(rt) ? rt : {} };
  }
  function dbEntry(slug) { try { return typeof db !== "undefined" && db ? db[slug] : null; } catch (e) { return null; } }
  function computeFor(data, key) {
    var p = parseMonthKey(key);
    return compute({
      year: p.year, month: p.month, timeline: data.timeline, movies: data.movies, ratings: data.ratings,
      runtimeOf: function (slug) { var d = dbEntry(slug); return d && Number(d.runtime) > 0 ? Number(d.runtime) : 0; },
      nameOf: function (slug) { var d = dbEntry(slug); return d && typeof d.name === "string" ? d.name : ""; }
    });
  }
  function profileName() {
    try { var p = typeof getActiveProfile === "function" ? getActiveProfile() : null; return p && typeof p.name === "string" ? p.name : ""; } catch (e) { return ""; }
  }
  function toast(msg) { try { if (typeof showToast === "function") showToast(msg); } catch (e) {} }

  /* ───────────── Obrazovka ───────────── */
  var root = null, stage = null, prog = null, prevBtn = null, nextBtn = null;
  var state = { data: null, key: "", stats: null, slides: [], i: 0, months: [] };
  var lastFocus = null, swipe = null, suppressClick = false;
  var X_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function ensureDom() {
    if (root) return;
    root = document.createElement("div");
    root.id = "mfWrapped"; root.className = "mfw"; root.hidden = true; root.tabIndex = -1;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "MůjFlix Wrapped");
    root.innerHTML =
      '<div class="mfw-top"><div class="mfw-prog" aria-hidden="true"></div><button type="button" class="mfw-x" aria-label="Zavřít">' + X_ICON + "</button></div>" +
      '<div class="mfw-stage" aria-live="polite"></div>' +
      '<div class="mfw-nav"><button type="button" class="mfw-btn" data-go="prev">‹ Zpět</button><button type="button" class="mfw-btn mfw-btn-main" data-go="next">Dál ›</button></div>';
    document.body.appendChild(root);
    stage = root.querySelector(".mfw-stage"); prog = root.querySelector(".mfw-prog");
    prevBtn = root.querySelector('[data-go="prev"]'); nextBtn = root.querySelector('[data-go="next"]');
    root.addEventListener("click", onClick);
    root.addEventListener("change", function (e) {
      if (e.target && e.target.classList && e.target.classList.contains("mfw-select")) { setMonth(e.target.value); var sel = stage.querySelector(".mfw-select"); if (sel) sel.focus(); }
    });
    stage.addEventListener("pointerdown", function (e) { swipe = e.pointerType === "mouse" ? null : { x: e.clientX, y: e.clientY }; });
    stage.addEventListener("pointerup", function (e) {
      if (!swipe) return;
      var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y; swipe = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        suppressClick = true; setTimeout(function () { suppressClick = false; }, 50);
        dx < 0 ? next() : prev();
      }
    });
    stage.addEventListener("pointercancel", function () { swipe = null; });
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest(".mfw-x")) return close();
    var nav = t.closest("[data-go]");
    if (nav) return nav.dataset.go === "next" ? next() : prev();
    var act = t.closest("[data-act]");
    if (act) { if (act.dataset.act === "close") close(); else if (act.dataset.act === "share") shareImage(); return; }
    if (suppressClick || t.closest("select, label, a, button") || !t.closest(".mfw-stage")) return;
    var r = stage.getBoundingClientRect();
    (e.clientX - r.left < r.width / 3) ? prev() : next();
  }

  function render() {
    var sl = state.slides[state.i], n = state.slides.length;
    if (!sl) return;
    root.dataset.theme = sl.theme;
    stage.classList.remove("mfw-in");
    stage.innerHTML = '<div class="mfw-slide">' + sl.html + "</div>";
    stage.scrollTop = 0;
    var segs = ""; for (var k = 0; k < n; k++) segs += "<i" + (k <= state.i ? ' class="on"' : "") + "></i>";
    prog.innerHTML = segs; prog.style.visibility = n > 1 ? "visible" : "hidden";
    prevBtn.disabled = state.i === 0; nextBtn.hidden = state.i >= n - 1; prevBtn.hidden = n < 2; // na posledním slidu zbývá Zpět a tlačítka ve slidu
    requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.add("mfw-in"); }); });
  }
  function go(i) { if (i < 0 || i >= state.slides.length) return; state.i = i; render(); }
  function next() { go(state.i + 1); }
  function prev() { go(state.i - 1); }

  function setMonth(key) {
    if (!Core.parseMonthKey(key)) return;
    state.key = key;
    state.stats = computeFor(state.data, key);
    state.slides = buildSlides(state.stats, { name: profileName(), months: state.months });
    state.i = 0;
    render();
  }

  function onKey(e) {
    if (!root || root.hidden) return;
    var tag = e.target && e.target.tagName;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); return close(); }
    if (e.key === "Tab") { // fokus zůstává uvnitř okna
      var f = root.querySelectorAll("button:not([disabled]):not([hidden]), select"), list = [];
      for (var q = 0; q < f.length; q++) if (f[q].offsetParent !== null) list.push(f[q]);
      if (!list.length) { e.preventDefault(); return; }
      var first = list[0], last = list[list.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || a === root)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (tag === "SELECT") return; // šipky mění hodnotu výběru měsíce
    if (tag === "BUTTON" && (e.key === " " || e.key === "Enter")) return; // mezerník a Enter patří fokusovanému tlačítku
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
  }

  function open(opts) {
    opts = opts || {};
    ensureDom();
    state.data = readData();
    state.months = Core.listMonths(state.data);
    var key = Core.parseMonthKey(opts.month) ? opts.month : Core.pickDefaultMonth(state.months, new Date());
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add("mfw-lock");
    setMonth(key);
    document.addEventListener("keydown", onKey, true);
    requestAnimationFrame(function () { root.classList.add("open"); try { root.focus({ preventScroll: true }); } catch (e) {} });
  }
  function close() {
    if (!root || root.hidden) return;
    document.removeEventListener("keydown", onKey, true);
    root.classList.remove("open");
    document.documentElement.classList.remove("mfw-lock");
    setTimeout(function () { if (!root.classList.contains("open")) root.hidden = true; }, 260);
    try { if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); } catch (e) {}
    lastFocus = null;
  }
  function isOpen() { return !!root && !root.hidden; }

  /* ───────────── Sdílení jako obrázek ───────────── */
  function ellipsize(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + "…").width > maxW) text = text.slice(0, -1);
    return text + "…";
  }
  function drawShareCanvas(s) {
    var W = 1080, H = 1920, c = document.createElement("canvas");
    c.width = W; c.height = H;
    var x = c.getContext("2d"), ff = (getComputedStyle(document.body).fontFamily || "sans-serif");
    x.fillStyle = "#0a0a0a"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#fff"; x.textBaseline = "alphabetic";
    x.globalAlpha = 0.85; x.font = "600 40px " + ff; x.fillText("MŮJFLIX WRAPPED", 90, 150); x.globalAlpha = 1;
    x.font = "900 170px " + ff; x.fillText(gender(s.month).my, 90, 330); x.fillText(MONTHS[s.month], 90, 500);
    var rows = shareRows(s), y = 720;
    rows.forEach(function (r) {
      x.globalAlpha = 0.75; x.font = "500 38px " + ff; x.fillText(r.label, 90, y);
      x.globalAlpha = 1; x.font = "800 66px " + ff; x.fillText(ellipsize(x, r.value, W - 180), 90, y + 76);
      y += 190;
    });
    x.globalAlpha = 0.8; x.font = "500 40px " + ff; x.fillText("mujflix.pages.dev", 90, H - 90); x.globalAlpha = 1;
    return c;
  }
  function download(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    toast("Obrázek uložen");
  }
  function shareImage() {
    var s = state.stats;
    if (!s || s.empty) return;
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.resolve(ready).catch(function () {}).then(function () {
      var name = "mujflix-wrapped-" + s.key + ".png";
      drawShareCanvas(s).toBlob(function (blob) {
        if (!blob) return toast("Obrázek se nepodařilo vytvořit");
        var file = null; try { file = new File([blob], name, { type: "image/png" }); } catch (e) {}
        if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: gender(s.month).my + " " + MONTHS[s.month] + " na MůjFlixu" }).catch(function (err) { if (!err || err.name !== "AbortError") download(blob, name); });
        } else download(blob, name);
      }, "image/png");
    });
  }

  window.MFWrapped = { open: open, close: close, isOpen: isOpen };

  function init() {
    window.addEventListener("mf:profile-changed", function () { if (isOpen()) close(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
