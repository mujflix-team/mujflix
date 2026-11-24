/* MůjFlix — „Co dnes pustíme dohromady?“: z vybraných profilů vybere jeden titul, který se hodí všem.
 * Bere jen to, co appka už ukládá lokálně (oblíbené žánry profilů, věkové omezení, co už profily viděly).
 * Z TMDB se stáhnou obecné seznamy podle žánrů, žádné údaje o profilech se nikam neposílají.
 * Dvě části: MFTogetherCore (čisté výpočty, bez DOM; testuje je tests/together.mjs) a MFTogether (obrazovka).
 * Z globálů používá _getProfiles, tmdbGet, mfGenreIdsFor, MFAge, mfhOpenCard, openDiscoverTv, showToast, vždy s kontrolou typeof. */
(function () {
  "use strict";

  var GENRE_NAMES = {
    28: "Akce", 12: "Dobrodružný", 16: "Animovaný", 35: "Komedie", 80: "Krimi", 99: "Dokumentární", 18: "Drama",
    10751: "Rodinný", 14: "Fantasy", 36: "Historický", 27: "Horor", 10402: "Hudební", 9648: "Mysteriózní",
    10749: "Romantický", 878: "Sci-fi", 53: "Thriller", 10752: "Válečný", 37: "Western"
  };

  /* ───────────── Výpočty ───────────── */
  var Core = {};

  /** Nejpřísnější věkové omezení z vybraných profilů (0 = nikdo nemá omezení). */
  Core.strictestAge = function (profiles) {
    var v = (profiles || []).map(function (p) { return Number(p && p.prefs && p.prefs.maxAge) || 0; }).filter(function (n) { return n > 0; });
    return v.length ? Math.min.apply(null, v) : 0;
  };

  function liked(p) { return ((p && p.likedGenres) || []).map(Number).filter(function (n) { return n > 0; }); }

  /** Žánry, které se hodí společně: ty, které má rád každý; jinak ty, které mají aspoň dva; jinak nic. */
  Core.sharedGenres = function (profiles) {
    var votes = {}, n = (profiles || []).length;
    (profiles || []).forEach(function (p) { liked(p).filter(function (g, i, a) { return a.indexOf(g) === i; }).forEach(function (g) { votes[g] = (votes[g] || 0) + 1; }); });
    var ids = Object.keys(votes).map(Number);
    var all = ids.filter(function (g) { return votes[g] === n; });
    if (n > 0 && all.length) return { ids: all, mode: "all" };
    var some = ids.filter(function (g) { return votes[g] >= 2; }).sort(function (a, b) { return votes[b] - votes[a] || a - b; }).slice(0, 4);
    if (some.length) return { ids: some, mode: "some" };
    return { ids: [], mode: "none" };
  };

  /** Kolika vybraným profilům titul sedí (aspoň jeden jejich oblíbený žánr). toType(ids, "movie"|"tv") převádí ID žánrů mezi filmy a seriály. */
  Core.fits = function (item, type, profiles, toType) {
    var g = (item && item.genre_ids || []).map(Number), out = [];
    (profiles || []).forEach(function (p) {
      var l = liked(p);
      if (toType) l = (toType(l, type) || []).map(Number);
      if (l.some(function (x) { return g.indexOf(x) > -1; })) out.push(p);
    });
    return out;
  };

  /** Seřadí kandidáty: víc sedících profilů, pak lépe hodnocené. Už viděné (seen = { "movie:123": 1 }) a duplicity vynechá. */
  Core.rank = function (cands, profiles, seen, toType) {
    var used = {}, out = [];
    (cands || []).forEach(function (c) {
      if (!c || !c.id || !(c.type === "movie" || c.type === "tv")) return;
      var k = c.type + ":" + c.id;
      if (used[k] || (seen && seen[k])) return;
      used[k] = 1;
      out.push({ item: c, key: k, fit: Core.fits(c, c.type, profiles, toType) });
    });
    out.sort(function (a, b) {
      return (b.fit.length - a.fit.length) || ((Number(b.item.vote_average) || 0) - (Number(a.item.vote_average) || 0));
    });
    return out;
  };

  /** Vybere jeden titul z nejlepších (pool) a vynechá už ukázané (shown = { klíč: 1 }). rnd vrací číslo 0–1. */
  Core.pick = function (ranked, shown, rnd, pool) {
    var rest = (ranked || []).filter(function (r) { return !(shown && shown[r.key]); });
    if (!rest.length) return null;
    var top = rest[0].fit.length;
    var best = rest.filter(function (r) { return r.fit.length === top; }).slice(0, pool || 6);
    return best[Math.floor((rnd ? rnd() : Math.random()) * best.length)];
  };

  Core.joinNames = function (names) {
    var n = (names || []).filter(Boolean);
    if (n.length < 2) return n.join("");
    return n.slice(0, -1).join(", ") + " a " + n[n.length - 1];
  };

  /** Věta, proč titul vybrán. */
  Core.explain = function (entry, total, genreIds) {
    var names = Core.joinNames((entry.fit || []).map(function (p) { return p.name || "Profil"; }));
    var gn = (genreIds || []).map(function (g) { return GENRE_NAMES[g]; }).filter(Boolean);
    var s = entry.fit.length === total
      ? "Hodí se pro všechny: " + names + "."
      : entry.fit.length
        ? "Nejvíc sedí: " + names + "."
        : "Oblíbený titul bez ohledu na žánr.";
    if (gn.length && entry.fit.length === total) s += " Baví vás: " + gn.join(", ") + ".";
    return s;
  };

  Core.genreNames = GENRE_NAMES;
  window.MFTogetherCore = Core;
  if (typeof document === "undefined") return;

  /* ───────────── Obrazovka ───────────── */
  var el = null, sel = {}, ranked = [], shown = {}, lastGenres = [], busy = false, age = 0, chosen = [];

  function profilesAll() { try { return typeof _getProfiles === "function" ? _getProfiles() : []; } catch (e) { return []; } }
  function activeId() { try { return typeof getActiveProfileId === "function" ? getActiveProfileId() : null; } catch (e) { return null; } }
  function $(s) { return el && el.querySelector(s); }
  function mk(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  /** Co už vybrané profily viděly (paměť doporučování každého profilu). */
  function seenOf(profiles) {
    var seen = {};
    profiles.forEach(function (p) {
      try {
        var m = JSON.parse(localStorage.getItem("mf_ai_brain_" + p.id) || "{}"), w = (m && m.watchedTmdbIds) || {};
        Object.keys(w).forEach(function (id) { seen["movie:" + id] = 1; seen["tv:" + id] = 1; });
      } catch (e) {}
    });
    return seen;
  }

  function toType(ids, type) { return typeof mfGenreIdsFor === "function" ? mfGenreIdsFor(ids, type).map(Number) : ids; }

  function ageOk(it, lim) {
    if (!lim || !window.MFAge || !MFAge._rating) return Promise.resolve(true);
    return MFAge._rating(it.type, it.id).then(function (c) { return c !== null && MFAge._allowed(it.type, c, lim); }, function () { return false; });
  }

  function fetchCands(genres, page) {
    var get = typeof tmdbGet === "function" ? tmdbGet : function () { return Promise.resolve(null); };
    return Promise.all(["movie", "tv"].map(function (type) {
      var g = genres.length ? "&with_genres=" + encodeURIComponent(toType(genres, type).join("|")) : "";
      var path = "/discover/" + type + "?language=cs-CZ&sort_by=popularity.desc&vote_count.gte=" + (type === "tv" ? 100 : 300) + g + "&page=" + page;
      return get(path).then(function (d) {
        return ((d && d.results) || []).map(function (x) { return Object.assign({}, x, { type: type }); });
      }, function () { return []; });
    })).then(function (r) { return r[0].concat(r[1]); });
  }

  function find() {
    if (busy) return;
    var profiles = profilesAll().filter(function (p) { return sel[p.id]; });
    if (profiles.length < 2) return;
    busy = true; shown = {}; ranked = [];
    chosen = profiles; age = Core.strictestAge(profiles);
    var sg = Core.sharedGenres(profiles); lastGenres = sg.ids;
    var res = $(".mft-res"); res.textContent = ""; res.appendChild(mk("p", "mft-msg", "Hledám…"));
    var seen = seenOf(profiles), page = 1 + Math.floor(Math.random() * 2);
    fetchCands(sg.ids, page).then(function (c) {
      var r = Core.rank(c, profiles, seen, toType);
      return Promise.all(r.map(function (e) { return ageOk(e.item, age); })).then(function (ok) {
        ranked = r.filter(function (_, i) { return ok[i]; });
      });
    }).then(function () { busy = false; show(); }, function () {
      busy = false;
      var res2 = $(".mft-res"); if (res2) { res2.textContent = ""; res2.appendChild(mk("p", "mft-msg", "Nepodařilo se načíst. Zkus to znovu.")); }
    });
  }

  function openTitle(it) {
    var name = it.title || it.name || "";
    close();
    if (it.type === "tv" && typeof openDiscoverTv === "function") openDiscoverTv(it.id, name);
    else if (typeof mfhOpenCard === "function") mfhOpenCard(name, it.id, it.type);
  }

  function show() {
    var res = $(".mft-res"); if (!res) return;
    res.textContent = "";
    var e = Core.pick(ranked, shown);
    if (!e) { res.appendChild(mk("p", "mft-msg", ranked.length ? "To je všechno, co jsme našli. Zkus jiné složení." : "Nic vhodného jsme nenašli. Zkus jiné složení.")); return; }
    shown[e.key] = 1;
    var it = e.item, name = it.title || it.name || "", year = String(it.release_date || it.first_air_date || "").slice(0, 4);
    var box = mk("div", "mft-pick");
    if (it.poster_path) {
      var im = mk("img", "mft-poster"); im.src = "https://image.tmdb.org/t/p/w342" + it.poster_path; im.alt = ""; im.referrerPolicy = "no-referrer"; box.appendChild(im);
    }
    var info = mk("div", "mft-info");
    info.appendChild(mk("h3", "mft-title", name));
    info.appendChild(mk("div", "mft-meta", [it.type === "tv" ? "Seriál" : "Film", year, it.vote_average ? "★ " + Number(it.vote_average).toFixed(1) : ""].filter(Boolean).join(" · ")));
    info.appendChild(mk("p", "mft-why", Core.explain(e, chosen.length, lastGenres)));
    var row = mk("div", "mft-row");
    var open = mk("button", "mft-btn mft-primary", "Otevřít"); open.type = "button"; open.addEventListener("click", function () { openTitle(it); });
    var other = mk("button", "mft-btn", "Jiný tip"); other.type = "button"; other.addEventListener("click", show);
    row.appendChild(open); row.appendChild(other);
    info.appendChild(row);
    box.appendChild(info);
    res.appendChild(box);
  }

  function refreshGo() {
    var n = Object.keys(sel).filter(function (k) { return sel[k]; }).length, go = $(".mft-go");
    if (go) go.disabled = n < 2;
    var all = profilesAll().filter(function (p) { return sel[p.id]; }), a = Core.strictestAge(all), note = $(".mft-age");
    if (note) note.textContent = a ? "Platí nejpřísnější omezení: do " + a + " let." : "";
  }

  function build() {
    el = mk("div", ""); el.id = "mfTogether"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Co dnes pustíme dohromady?");
    var card = mk("div", "mft-card");
    var x = mk("button", "mft-x", "×"); x.type = "button"; x.setAttribute("aria-label", "Zavřít"); x.addEventListener("click", close);
    card.appendChild(x);
    card.appendChild(mk("h2", "mft-h", "Co dnes pustíme dohromady?"));
    var profiles = profilesAll();
    if (profiles.length < 2) {
      card.appendChild(mk("p", "mft-msg", "K tomu potřebuješ aspoň dva profily. Přidej další v nabídce Spravovat profily."));
    } else {
      card.appendChild(mk("p", "mft-sub", "Vyber, kdo se dívá (aspoň dva)."));
      var chips = mk("div", "mft-chips");
      profiles.forEach(function (p) {
        var b = mk("button", "mft-chip"); b.type = "button"; b.setAttribute("aria-pressed", sel[p.id] ? "true" : "false");
        var av = mk("span", "mft-av"), a = p.avatar || "🙂";
        if (/^https?:\/\//i.test(a)) { var im = mk("img"); im.src = a; im.alt = ""; im.referrerPolicy = "no-referrer"; av.appendChild(im); } else av.textContent = a;
        b.appendChild(av); b.appendChild(mk("span", "mft-nm", p.name || "Profil"));
        b.addEventListener("click", function () { sel[p.id] = !sel[p.id]; b.setAttribute("aria-pressed", sel[p.id] ? "true" : "false"); refreshGo(); });
        chips.appendChild(b);
      });
      card.appendChild(chips);
      card.appendChild(mk("p", "mft-age"));
      var go = mk("button", "mft-btn mft-primary mft-go", "Najít tip"); go.type = "button"; go.disabled = true; go.addEventListener("click", find);
      card.appendChild(go);
      card.appendChild(mk("div", "mft-res"));
    }
    el.appendChild(card);
    el.addEventListener("click", function (e) { if (e.target === el) close(); });
    document.body.appendChild(el);
  }

  function onKey(e) { if (e.key === "Escape") close(); }
  function open() {
    if (el) return;
    var id = activeId(); sel = {}; if (id) sel[id] = true;
    ranked = []; shown = {};
    build(); refreshGo();
    document.documentElement.classList.add("mft-lock");
    document.addEventListener("keydown", onKey, true);
    var x = $(".mft-x"); if (x) x.focus();
  }
  function close() {
    if (!el) return;
    el.remove(); el = null;
    document.documentElement.classList.remove("mft-lock");
    document.removeEventListener("keydown", onKey, true);
  }

  window.MFTogether = { open: open, close: close, isOpen: function () { return !!el; } };
})();
