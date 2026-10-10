import { startApp, check, finish } from "./helpers.mjs";

const { page, errors, close } = await startApp();

// --- Validace URL zdrojů
const urls = await page.evaluate(() => ({
  good: _isValidStreamUrl("https://www.bombuj.si/film/abc"),
  sub: _isValidStreamUrl("https://serialy.bombuj.si/serial/abc"),
  evil: _isValidStreamUrl("https://evilbombuj.si/film/abc"),
  search: _isValidStreamUrl("https://www.bombuj.si/?s=abc"),
  js: _isValidStreamUrl("javascript:alert(1)"),
}));
check("validace: bombuj.si projde", urls.good);
check("validace: subdoména projde", urls.sub);
check("validace: evilbombuj.si neprojde", !urls.evil);
check("validace: vyhledávací URL neprojde", !urls.search);
check("validace: javascript: neprojde", !urls.js);

// --- Finder modul
const fin = await page.evaluate(() => ({
  slug: _slugify("Pán prstenů: Společenstvo"),
  fns: ["runFinder", "openWithCopy", "showFinderModal", "verifyAndOpen"].every(n => typeof window[n] === "function"),
}));
check("finder: slug je ASCII bez diakritiky", /^[a-z0-9-]+$/.test(fin.slug), fin.slug);
check("finder: veřejné funkce jsou dostupné", fin.fns);

// --- Escapování v inline onclick
const esc = await page.evaluate(() => {
  const s = `https://x.cz/a'b\\c"d</script>`;
  const holder = document.createElement("div");
  holder.innerHTML = `<button onclick="window.__v=${_cinJs(s)}">x</button>`;
  holder.querySelector("button").click();
  return window.__v === s;
});
check("onclick: URL se zvláštními znaky přežije round-trip", esc);

// --- Hodnocení ukládá žánry a AI se z něj učí
const rating = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  db[slug]._genreIds = [35, 18];
  _ratingSlug = slug;
  submitRating("loved");
  const stored = safeLS(uKey("mf_ratings"), "{}")[slug];
  return { genres: stored?.genres, signal: Object.keys(getRatingSignalCached()).length };
});
check("rating: uloží žánry", Array.isArray(rating.genres) && rating.genres.length === 2, JSON.stringify(rating));
check("rating: signál pro AI není prázdný", rating.signal > 0, JSON.stringify(rating));

// --- openSeries nezkresluje preference
const boost = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  db[slug]._genres = ["Comedy"];
  const before = JSON.stringify(aiBrain.memory.genrePreferences);
  for (let i = 0; i < 5; i++) { try { openSeries(slug); } catch (e) { void e; } }
  return before === JSON.stringify(aiBrain.memory.genrePreferences);
});
check("openSeries: neboostuje žánry při pouhém otevření", boost);

// --- Oblíbené: __tmdbfav_ slug
const fav = await page.evaluate(async () => {
  const calls = [];
  window.openDiscoverTv = (id, name) => calls.push(["tv", String(id), name]);
  window._showCinemaOrFinderChoice = (id, name) => calls.push(["movie", String(id), name]);
  openFavoriteItem({ slug: "__tmdbfav_tv_123", name: "A", type: "series" });
  openFavoriteItem({ slug: "__tmdbfav_movie_77", name: "B", type: "movie" });
  await new Promise(r => setTimeout(r, 450));
  return calls;
});
check("oblíbené: seriál se otevře přes Discover", fav.some(c => c[0] === "tv" && c[1] === "123"), JSON.stringify(fav));
check("oblíbené: film se otevře přes cinema volbu", fav.some(c => c[0] === "movie" && c[1] === "77"), JSON.stringify(fav));

// --- sessionGenres vyprší
const sess = await page.evaluate(() => {
  aiBrain.memory.sessionGenres = ["komedie"]; aiBrain.memory.lastActive = Date.now() - 7 * 3600e3;
  const old = aiBrain.memory.lastActive;
  return Date.now() - old > 216e5;
});
check("AI: stará session je starší než 6 h (podmínka expirace)", sess);

// --- Timeline ukládá název
const tl = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  recordWatchToTimeline(slug, [1]);
  const last = safeLS(uKey("mf_watch_timeline"), "[]").pop();
  return last && last.name === db[slug].name;
});
check("timeline: ukládá název seriálu", tl);

// --- Avatar jako URL
const av = await page.evaluate(() => {
  const b = document.getElementById("nfAvatar"); if (!b) return "no-element";
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p1", name: "T", avatar: "https://image.tmdb.org/t/p/w185/x.jpg" }]));
  localStorage.setItem("mf_active_pid", "p1");
  nfRenderProfile();
  return b.querySelector("img") ? "img" : "text:" + b.textContent;
});
check("avatar: URL se vykreslí jako obrázek", av === "img" || av === "no-element", av);

// --- XSS ve jménu profilu
const xss = await page.evaluate(async () => {
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p9", name: "<img src=x onerror=window.__pwn=1>", avatar: "https://x.cz/a.jpg\" onerror=\"window.__pwn=2", color: "red\" onmouseover=\"window.__pwn=3" }]));
  localStorage.setItem("mf_active_pid", "p9");
  try { await ProfileGate.renderGate(); ProfileGate.renderBadge(); } catch (e) { return "err:" + e.message; }
  await new Promise(r => setTimeout(r, 300));
  return String(window.__pwn || "ok");
});
check("profil: HTML ve jménu/avataru/barvě se neprovede", xss === "ok", xss);

// --- Doporučení po výběru žánrů v onboardingu
const onb = await page.evaluate(() => {
  let calls = 0;
  const orig = window.renderHomepage; window.renderHomepage = () => { calls++; };
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p5", name: "T", avatar: "🎬", likedGenres: [], prefs: {} }]));
  localStorage.setItem("mf_active_pid", "p5");
  const w = document.getElementById("mfProfileWelcome");
  w.dataset.profileId = "p5";
  document.getElementById("pwGenres").innerHTML = '<button class="pw-genre selected" data-genre="35"></button>';
  ProfileGate.finishOnboarding();
  window.renderHomepage = orig;
  return { calls, liked: JSON.parse(localStorage.getItem("mf_profiles_v2"))[0].likedGenres };
});
check("onboarding: po výběru žánrů se překreslí domovská stránka", onb.calls >= 1, JSON.stringify(onb));
check("onboarding: žánry se uloží do profilu", onb.liked[0] === 35, JSON.stringify(onb));
const home = await page.evaluate(() => typeof window.renderHomepage);
check("renderHomepage je dostupná globálně", home === "function", home);

// --- Cinema nesmí označovat epizody ve špatném seriálu
const cin = await page.evaluate(() => {
  const slugs = Object.keys(db); const a = slugs[0];
  activeSeries = a;                                  // starý, už zavřený seriál
  const marked = []; const orig = window.markWatched; window.markWatched = u => marked.push(u);
  MFCinemaPlayer.open("999999", "Jiný seriál", "tv_ep", { season: 1, episode: 1 });
  document.getElementById("mfCinNextEp")?.click();
  window.markWatched = orig; MFCinemaPlayer.close();
  return { marked, a };
});
check("cinema: neoznačuje epizody cizího seriálu", cin.marked.length === 0, JSON.stringify(cin));

// --- Onboarding: krok 2 (tutorial) + jediný odkaz na blokovač podle prohlížeče
const tut = await page.evaluate(() => {
  const w = document.getElementById("mfProfileWelcome");
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p7", name: "T", avatar: "🎬", likedGenres: [], prefs: {} }]));
  localStorage.setItem("mf_active_pid", "p7");
  ProfileGate.openOnboarding("p7");
  const s1 = getComputedStyle(document.getElementById("pwStep1")).display !== "none";
  ProfileGate.finishOnboarding();
  const s2 = getComputedStyle(document.getElementById("pwStep2")).display !== "none";
  const stillOpen = w.classList.contains("show");
  const links = document.querySelectorAll("#pwAdblockLink a").length;
  ProfileGate.closeOnboarding();
  const closed = !w.classList.contains("show");
  const ua = ua => { Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true }); return mfAdblock.link().url; };
  return { s1, s2, stillOpen, links, closed,
    ff: ua("Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"),
    ch: ua("Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"),
    ed: ua("Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36 Edg/130.0") };
});
check("onboarding: začíná krokem 1 (žánry)", tut.s1);
check("onboarding: po potvrzení žánrů následuje krok 2 (tutorial)", tut.s2 && tut.stillOpen, JSON.stringify(tut));
check("onboarding: zobrazí právě jeden odkaz na blokovač", tut.links === 1, String(tut.links));
check("onboarding: „Začít sledovat“ zavře průvodce", tut.closed);
check("blokovač: Firefox → addons.mozilla.org", /addons\.mozilla\.org/.test(tut.ff), tut.ff);
check("blokovač: Chrome → chromewebstore", /chromewebstore\.google\.com/.test(tut.ch), tut.ch);
check("blokovač: Edge → chromewebstore", /chromewebstore\.google\.com/.test(tut.ed), tut.ed);

// --- Uzi.la: ověřený tvar odkazů
const uzi = await page.evaluate(() => {
  const find = (title, type, extra) => {
    MFCinemaPlayer.open("1", title, type, extra);
    let href = "";
    for (let i = 0; i < 8; i++) {
      href = (window.MFCinemaPlayer.currentUrl() || "") || "";
      if (href.includes("uzi.la")) break;
      document.getElementById("mfCinSwitchSrc")?.click();
    }
    MFCinemaPlayer.close(); return href;
  };
  return { movie: find("Forrest Gump", "movie"), tv: find("Jack Reacher", "tv", { season: 4, episode: 8 }), cz: find("Spider-Man: Napříč paralelními světy", "movie") };
});
check("uzi.la: film → /p/forrest-gump", uzi.movie === "https://uzi.la/p/forrest-gump", uzi.movie);
check("uzi.la: seriál → /tv/jack-reacher/S04E08", uzi.tv === "https://uzi.la/tv/jack-reacher/S04E08", uzi.tv);
check("uzi.la: diakritika a dvojtečka se v odkazu odstraní", /^https:\/\/uzi\.la\/p\/[a-z0-9-]+$/.test(uzi.cz), uzi.cz);

// --- Uzi.la: varianty názvu z TMDB (SK / CZ / původní)
const alt = await page.evaluate(async () => {
  window.MF_USING_TMDB_PROXY = true;
  const realFetch = window.fetch;
  window.fetch = (u) => {
    u = String(u);
    const json = u.includes("/translations")
      ? { translations: [{ iso_3166_1: "SK", data: { title: "Spider-Man: Cez paralelné svety" } }, { iso_3166_1: "CZ", data: { title: "Spider-Man: Napříč paralelními světy" } }] }
      : { original_title: "Spider-Man: Across the Spider-Verse" };
    return Promise.resolve({ ok: true, json: () => Promise.resolve(json) });
  };
  MFCinemaPlayer.open("569094", "Spider-Man: Napříč paralelními světy", "movie");
  await new Promise(r => setTimeout(r, 300));
  const urls = [];
  for (let i = 0; i < 8; i++) {
    const h = (window.MFCinemaPlayer.currentUrl() || "") || "";
    if (h.includes("uzi.la")) urls.push(h);
    document.getElementById("mfCinSwitchSrc")?.click();
  }
  window.fetch = realFetch; MFCinemaPlayer.close();
  return [...new Set(urls)];
});
check("uzi.la: nabízí slovenský název (spider-man-cez-paralelne-svety)", alt.includes("https://uzi.la/p/spider-man-cez-paralelne-svety"), JSON.stringify(alt));
check("uzi.la: nabízí i český a původní název", alt.length >= 3, JSON.stringify(alt));

// --- Zdroje: Uzi.la je před Prehraj.to
const order = await page.evaluate(() => { MFCinemaPlayer.open("1", "X", "movie"); const lbl = [...document.querySelectorAll("#mfStandaloneCinema *")].map(e => e.textContent).join("|"); MFCinemaPlayer.close(); return lbl.length > 0; });
check("cinema: otevření bez chyby po přeskládání zdrojů", order);

// --- Žánry: filmová vs. seriálová ID
const gen = await page.evaluate(() => ({
  tv: mfGenreIdsFor([28, 27, 878], "tv"), movie: mfGenreIdsFor([10759, 10765], "movie"), same: mfGenreIdsFor(["35", "18"], "tv")
}));
check("žánry: filmová ID se pro seriály převedou (28→10759, 878→10765, horor vynechán)", JSON.stringify(gen.tv) === '["10759","10765"]', JSON.stringify(gen.tv));
check("žánry: seriálová ID se pro filmy převedou (10759→28|12, 10765→878|14)", JSON.stringify(gen.movie) === '["28","12","878","14"]', JSON.stringify(gen.movie));
check("žánry: společná ID zůstávají", JSON.stringify(gen.same) === '["35","18"]', JSON.stringify(gen.same));

// --- Algoritmus: názvy žánrů, rozpad preferencí, hodnocení bez ID
const algo = await page.evaluate(() => {
  const m = n => aiBrain._tmdbMap(n);
  const names = [m("Akční & Dobrodružný"), m("Rodinný"), m("Science Fiction"), m("Sci-Fi & Fantasy"), m("Thriller"), m("Dokumentární")];
  // rozpad se nesmí kumulovat při opakovaném přihlášení
  aiBrain.memory.genrePreferences = { komedie: 1 }; aiBrain.memory.genreIdPrefs = {};
  aiBrain.memory.lastActive = Date.now() - 10 * 864e5; delete aiBrain.memory.lastDecay;
  aiBrain.applyDecay(); const once = aiBrain.memory.genrePreferences.komedie;
  aiBrain.applyDecay(); aiBrain.applyDecay(); const thrice = aiBrain.memory.genrePreferences.komedie;
  // hodnocení seriálu, který má jen názvy žánrů
  const slug = Object.keys(db)[0]; delete db[slug]._genreIds; db[slug]._genres = ["Komedie", "Akční & Dobrodružný"];
  _ratingSlug = slug; submitRating("loved");
  const stored = safeLS(uKey("mf_ratings"), "{}")[slug].genres;
  return { names, once, thrice, stored };
});
check("algoritmus: české i anglické názvy žánrů se mapují na stejný klíč", JSON.stringify(algo.names) === '["akcni","rodinny","sci-fi","sci-fi","napinavy","dokument"]', JSON.stringify(algo.names));
check("algoritmus: rozpad preferencí proběhne jen jednou", algo.once < 1 && Math.abs(algo.once - algo.thrice) < 1e-9, JSON.stringify(algo));
check("algoritmus: hodnocení bez ID uloží TMDB ID žánrů", algo.stored.includes(35) && algo.stored.includes(10759), JSON.stringify(algo.stored));

// --- Série dní používá místní datum, ne UTC
const lk = await page.evaluate(() => {
  const d = new Date(2026, 0, 5, 0, 30); // 5. 1. 00:30 místního času
  return { key: _localDateKey(d), today: getTodayKey() === _localDateKey(new Date()) };
});
check("streak: klíč dne je místní datum (2026-01-05)", lk.key === "2026-01-05", lk.key);
check("streak: getTodayKey odpovídá místnímu datu", lk.today);

// --- Oblíbené: zpožděné doplnění plakátů nevrátí odebranou položku
const wl = await page.evaluate(async () => {
  localStorage.setItem(uKey("mf_watchlist"), JSON.stringify([{ slug: "a", name: "A", type: "movie", tmdbId: 1, poster: "" }, { slug: "b", name: "B", type: "movie", tmdbId: 2, poster: "x" }]));
  const orig = window.tmdbGet;
  window.tmdbGet = async () => { // během čekání uživatel odebere A
    saveWatchlistData(getWatchlist().filter(w => w.slug !== "a"));
    return { poster_path: "/p.jpg" };
  };
  try { await mfBackfillFavPosters(); } finally { window.tmdbGet = orig; }
  return getWatchlist().map(w => w.slug);
});
check("oblíbené: odebraná položka se po doplnění plakátů nevrátí", wl.join() === "b", wl.join());

// --- Novinky (zvonek): nové epizody sledovaných seriálů
const nw = await page.evaluate(async () => {
  const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  localStorage.setItem(uKey("mf_watchlist"), JSON.stringify([{ slug: "__tmdbfav_tv_9", name: "Test Show", type: "series", tmdbId: 9, poster: "x" }]));
  const orig = window.tmdbGet;
  window.tmdbGet = async () => ({ name: "Test <b>Show</b>", next_episode_to_air: { air_date: d(2), season_number: 2, episode_number: 5 }, last_episode_to_air: { air_date: d(-3), season_number: 2, episode_number: 4 } });
  try { await checkNewEpisodes(); } finally { window.tmdbGet = orig; }
  const list = document.getElementById("notifPanelList");
  return { items: list.querySelectorAll(".notif-item").length, html: list.innerHTML.includes("<b>Show"), dot: document.getElementById("nfBellDot").classList.contains("visible") };
});
check("novinky: zobrazí vyšlou i budoucí epizodu", nw.items === 2, String(nw.items));
check("novinky: název se escapuje", !nw.html);
check("novinky: zvonek svítí", nw.dot);

// --- Hodnocení epizod je per profil (+ jednorázová migrace starého globálního)
const er = await page.evaluate(() => {
  const pid = localStorage.getItem("mf_active_pid");
  localStorage.removeItem("mf_ep_ratings_migrated");
  localStorage.removeItem("mf_ep_ratings_" + pid);
  localStorage.setItem("mf_ep_ratings", JSON.stringify({ "x-S1-E1": 4 }));
  const first = getEpRating("x-S1-E1");
  openEpRating("x-S1-E2", "X", "S1 · E2", 0);
  document.querySelector('.er-star[data-v="5"]').click();
  saveEpRating();
  return { first, own: JSON.parse(localStorage.getItem("mf_ep_ratings_" + pid) || "{}"), globalUntouched: JSON.parse(localStorage.getItem("mf_ep_ratings")) };
});
check("hodnocení epizod: staré globální se převezme do profilu", er.first === 4, String(er.first));
check("hodnocení epizod: nové se ukládá do profilu", er.own["x-S1-E2"] === 5, JSON.stringify(er.own));
check("hodnocení epizod: globální klíč zůstane nedotčený", !("x-S1-E2" in er.globalUntouched));

// --- Vlastní TMDB klíč z Nastavení se používá v tmdbGet
const key = await page.evaluate(async () => {
  const urls = [], orig = window.fetch;
  window.fetch = (u) => { urls.push(String(u)); return Promise.resolve(new Response("{}", { status: 200 })); };
  localStorage.setItem("mf_tmdb_key", "MYUSERKEY");
  try { await tmdbGet("/movie/987654321"); } catch { /* odpověď není důležitá */ }
  localStorage.removeItem("mf_tmdb_key");
  window.fetch = orig;
  return urls.find(u => u.includes("/movie/987654321")) || "";
});
check("TMDB klíč: tmdbGet použije klíč z Nastavení", key.includes("api_key=MYUSERKEY"), key);

// --- Avatar picker: texty z TMDB se escapují
const avt = await page.evaluate(async () => {
  window.__xss = 0;
  const mk = (id, tag = "div") => { let e = document.getElementById(id); if (!e) { e = document.createElement(tag); e.id = id; document.body.appendChild(e); } return e; };
  const grid = mk("pcAvatarGrid"); mk("pcAvatarPreview"); mk("pcAvatarPickerLabel");
  await ProfileGate._renderAvatarRows([{ id: 1, title: '<img src=x onerror="window.__xss=1">"' }]);
  const injected = !!grid.querySelector('img[src="x"]');
  return { injected, xss: window.__xss };
});
check("avatar picker: název titulu nevloží HTML", !avt.injected && avt.xss === 0);

// --- PIN lze odebrat
const pin = await page.evaluate(() => {
  const id = ProfileGate.createProfile({ name: "PinTest", avatar: "🎬", color: "#007aff", pin: "1234" });
  ProfileGate.openCreate(id);
  const shown = getComputedStyle(document.getElementById("pcPinRemoveRow")).display !== "none";
  document.getElementById("pcPinRemove").checked = true;
  ProfileGate.saveProfile();
  const p = _getProfiles().find(p => p.id === id);
  return { shown, pin: p && p.pin };
});
check("PIN: u profilu s PINem se zobrazí volba Odebrat", pin.shown);
check("PIN: po odebrání je profil bez PINu", !pin.pin, String(pin.pin));

// --- Slugy odkazů na zdroje
const sl = await page.evaluate(() => ({
  ss: _czSlug("Straße"), lod: _czSlug("Łódź 1939"), orn: _czSlug("Ørnen"), amp: _czSlug("Law & Order: SVU"),
  noYear: _bombujMovieUrlVariants("Amélie", null),
}));
check("slug: ß, Ł, Ø se přepíšou místo zahození", sl.ss === "strasse" && sl.lod === "lodz-1939" && sl.orn === "ornen", JSON.stringify(sl));
check("slug: & se přepíše na and", sl.amp === "law-and-order-svu");
check("Bombuj bez roku: první je přímý odkaz, ne hledání", sl.noYear[0] === "https://www.bombuj.si/online-film-amelie" && sl.noYear.length === 2, JSON.stringify(sl.noYear));

// --- AIBrain přežije poškozená data
const br = await page.evaluate(() => {
  const res = {};
  const key = "mf_ai_brain_" + (getActiveProfileId() || "default");
  for (const [name, raw] of [["null", "null"], ["pole", "[]"], ["číslo", "5"], ["prázdný", "{}"], ["null žánry", '{"genrePreferences":null,"genreIdPrefs":"x","watchedSlugs":[]}'], ["NaN", '{"genrePreferences":{"akcni":"abc","drama":0.4},"watchedCount":"7"}']]) {
    localStorage.setItem(key, raw);
    try {
      const b = new AIBrain();
      b.boostGenresFromTmdb(["Action"]); b.boostGenreIds([28]); b.recordWatch("x", 1); b.recordTmdbSeen(5); b.applyDecay(); b.recordWatchTime(); b.getTopGenres();
      res[name] = "ok";
    } catch (e) { res[name] = String(e.message); }
  }
  localStorage.removeItem(key);
  return res;
});
check("AIBrain: poškozená data nezpůsobí chybu", Object.values(br).every(v => v === "ok"), JSON.stringify(br));

// --- safeLS: špatný typ uložených dat se nahradí výchozí hodnotou
const ls = await page.evaluate(() => {
  const out = {};
  localStorage.setItem("__t", "null"); out.nullObj = safeLS("__t", "{}");
  localStorage.setItem("__t", "5"); out.numArr = safeLS("__t", "[]");
  localStorage.setItem("__t", "{}"); out.objArr = safeLS("__t", "[]");
  localStorage.setItem("__t", '[1,2]'); out.arrOk = safeLS("__t", "[]");
  localStorage.setItem("__t", '{"a":1}'); out.objOk = safeLS("__t", "{}");
  localStorage.setItem("__t", "{broken"); out.broken = safeLS("__t", "[]");
  localStorage.removeItem("__t"); out.missing = safeLS("__t", "{}");
  return out;
});
check("safeLS: null/špatný typ vrátí výchozí hodnotu", JSON.stringify([ls.nullObj, ls.numArr, ls.objArr, ls.broken, ls.missing]) === '[{},[],[],[],{}]', JSON.stringify(ls));
check("safeLS: platná data zůstanou", JSON.stringify([ls.arrOk, ls.objOk]) === '[[1,2],{"a":1}]');

// --- Odebrání profilu smaže jeho data
const rp = await page.evaluate(async () => {
  const keep = ProfileGate.createProfile({ name: "Zůstane", avatar: "🎬", color: "#007aff" });
  const gone = ProfileGate.createProfile({ name: "Smazat", avatar: "🎬", color: "#ff3b30" });
  localStorage.setItem("mf_watched_" + gone, "{}"); localStorage.setItem("mf_tmdb_key_" + gone, "SECRET"); localStorage.setItem("mf_ai_brain_" + gone, "{}");
  localStorage.setItem("mf_watched_" + keep, "{}");
  ProfileGate.removeProfile(gone);
  await new Promise(r => setTimeout(r, 400));
  return { left: Object.keys(localStorage).filter(k => k.includes(gone)), keep: localStorage.getItem("mf_watched_" + keep) !== null, listed: _getProfiles().some(p => p.id === gone) };
});
check("profil: po odebrání nezůstanou jeho data ani klíče", rp.left.length === 0 && !rp.listed, JSON.stringify(rp));
check("profil: data ostatních profilů zůstanou", rp.keep);

// --- Watchlist s poškozenými záznamy
const wlj = await page.evaluate(async () => {
  const out = {};
  saveWatchlistData([null, 5, "x", {}, { slug: "dup", name: "a", type: "movie" }, { slug: '"><img src=x onerror=window.__xss=1>', name: "<b>x</b>", type: "movie" }]);
  for (const [n, f] of [["open", () => openWatchlist()], ["render", () => renderWatchlist()], ["toggle", () => toggleWatchlistItem("dup")]]) {
    try { f(); out[n] = "ok"; } catch (e) { out[n] = e.message; }
  }
  saveWatchlistData([]);
  return out;
});
check("watchlist: poškozené záznamy nerozbijí seznam", Object.values(wlj).every(v => v === "ok"), JSON.stringify(wlj));

// --- Kalendář premiér: filtr Populární načte detail seriálu (seznam TMDB nemá next_episode_to_air)
const pm = await page.evaluate(async () => {
  const d = new Date(), pad = n => String(n).padStart(2, "0");
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const orig = window.fetch;
  localStorage.setItem("mf_tmdb_key", "K");
  window.fetch = (u) => {
    u = String(u);
    const body = /\/tv\/on_the_air/.test(u) ? { results: [{ id: 777001, name: "Seznam bez epizod", poster_path: "/p.jpg" }] }
      : /\/tv\/777001/.test(u) ? { id: 777001, name: "Seznam bez epizod", poster_path: "/p.jpg", next_episode_to_air: { air_date: today, season_number: 1, episode_number: 2 } } : {};
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  };
  try {
    _premiereFilter = "popular"; _premiereMonth = new Date(); for (const k of Object.keys(_premiereCache)) delete _premiereCache[k];
    const res = await fetchPremiereEpisodes();
    return { n: res.length, show: res[0] && res[0].show_name, date: res[0] && res[0].air_date === today };
  } finally { window.fetch = orig; localStorage.removeItem("mf_tmdb_key"); }
});
check("premiéry: Populární najde epizodu z detailu seriálu", pm.n === 1 && pm.show === "Seznam bez epizod" && pm.date, JSON.stringify(pm));

// --- „Kde sledovat?": názvy služeb (Netflix, Max…) se berou z TMDB, ne jen z ruční mapy
const lp = await page.evaluate(async () => {
  const orig = window.fetch;
  window.fetch = function (u, ...rest) {
    u = String(u);
    if (/watch\/providers/.test(u)) return Promise.resolve(new Response(JSON.stringify({ results: {
      CZ: { link: "https://www.themoviedb.org/movie/550/watch?locale=CZ", flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg" }, { provider_id: 1899, provider_name: "Max", logo_path: "/m.jpg" }, { provider_id: 999999, provider_name: "Neznámá služba", logo_path: "/u.jpg" }], rent: [{ provider_id: 2, provider_name: "Apple TV", logo_path: "/a.jpg" }] }
    } }), { status: 200 }));
    return orig.call(window, u, ...rest);
  };
  try {
    window.MFCinemaPlayer.open("550", "Fight Club", "movie");
    await new Promise(r => setTimeout(r, 1500));
    const badge = document.getElementById("legalBadgeText");
    const panel = document.getElementById("legalProvidersPanel");
    const links = panel ? [...panel.querySelectorAll("a")].map(a => a.title) : [];
    const unknown = panel ? [...panel.querySelectorAll("a")].find(a => a.title === "Neznámá služba") : null;
    return { badge: badge && badge.textContent, links, unknownHref: unknown && unknown.href, text: panel ? panel.textContent : "" };
  } finally { window.fetch = orig; try { window.MFCinemaPlayer.close(); } catch { /* přehrávač už je zavřený */ } }
});
check("Kde sledovat: odznak ukáže názvy služeb", /Netflix/.test(lp.badge || "") && /Max/.test(lp.badge || ""), JSON.stringify(lp));
check("Kde sledovat: Netflix, Max i neznámá služba jsou v panelu", ["Netflix", "Max", "Neznámá služba"].every(n => lp.links.includes(n)), JSON.stringify(lp.links));
check("Kde sledovat: půjčení má vlastní skupinu a neznámá služba odkaz na TMDB", lp.links.includes("Apple TV") && /Půjčit/.test(lp.text) && /themoviedb\.org/.test(lp.unknownHref || ""), JSON.stringify([lp.text.slice(0, 120), lp.unknownHref]));

// --- Mood picker nabídne epizody
const md = await page.evaluate(() => {
  const out = {};
  openMoodPicker();
  for (const mood of Object.keys(moodConfig)) {
    selectMood(mood);
    const cards = [...document.querySelectorAll("#moodResultCards .mood-ep-card")];
    out[mood] = cards.length;
  }
  closeMoodPicker();
  return out;
});
check("mood picker: každá nálada nabídne epizody", Object.values(md).every(n => n >= 1), JSON.stringify(md));

const ver = await page.evaluate(() => { MFSettings.open(); const t = document.getElementById("mfVersionLine")?.textContent; document.getElementById("mfBeautifulSettings")?.remove(); return t; });
const pkgVer = JSON.parse((await import("node:fs")).readFileSync("package.json", "utf8")).version;
check("verze v Nastavení = package.json", ver === "MůjFlix v" + pkgVer, String(ver) + " vs " + pkgVer);

const fz = await page.evaluate(() => {
  const evil = `Film "X" '</b><img src=x onerror="window.__finderXss=1"> \\`;
  window._mfFinderTmdbId = "123"; window._mfFinderType = "movie";
  showFinderModal(evil, "movie", "2020");
  showFinderResults([{ url: "https://bombuj.si/film-a'b?x=\"1\"", title: evil }, { url: "https://svetserialu.to/x'y", title: evil }], evil, "movie");
  const c = document.getElementById("mfFinderContent");
  const btns = [...c.querySelectorAll("button[onclick]")];
  let opened = [], oc = null;
  const origOpen = window.open, origCin = window.openMovieInCinema;
  window.open = u => { opened.push(u); }; window.openMovieInCinema = (...a) => { oc = a; };
  btns.forEach(b => { try { b.click(); } catch (e) { opened.push("ERR " + e.message); } });
  window.open = origOpen; window.openMovieInCinema = origCin;
  return { xss: window.__finderXss || 0, imgs: c.querySelectorAll("img[src='x']").length, btns: btns.length, opened, oc, evil };
});
check("finder: hostilní název nevytvoří HTML/XSS", fz.xss === 0 && fz.imgs === 0, JSON.stringify(fz));
check("finder: tlačítka fungují i s uvozovkami v názvu", fz.btns >= 3 && fz.opened.length >= 2 && !fz.opened.some(u => /^ERR/.test(u)) && fz.oc && fz.oc[0] === "123" && fz.oc[1] === fz.evil, JSON.stringify(fz));

const cm = await page.evaluate(async () => {
  MFCinemaPlayer.open("1399", "Hra o trůny", "tv", { season: 1, episode: 1 });
  await new Promise(r => setTimeout(r, 400));
  const ifr = document.querySelector("#mfStandaloneCinema iframe"), fav = document.getElementById("mfCinFavBtn");
  const out = { src: ifr && ifr.src, sandbox: ifr && ifr.hasAttribute("sandbox"), protect: !!document.getElementById("mfCinProtect"), adtip: !!document.getElementById("mfCinAdTipBtn"), fav: fav && fav.textContent };
  MFCinemaPlayer.close();
  return out;
});
check("cinema: přehrávač běží bez sandboxu (Filemoon)", /svetserialu/.test(cm.src || "") && cm.sandbox === false, JSON.stringify(cm));
check("cinema: bez přepínače ochrany a varovné ikony, oblíbené je jen srdce", !cm.protect && !cm.adtip && /^[♡♥]$/.test(cm.fav || ""), JSON.stringify(cm));

const gs = await page.evaluate(async () => {
  const key = Object.keys(HARDCODED_TRAILERS)[0], saved = window.gsap, out = {};
  const mk = () => { const tile = document.createElement("div"); tile.className = "focused"; tile.innerHTML = '<div class="ps-tile"></div>'; document.body.appendChild(tile); return tile; };
  // kontrola, že se k trailerům s gsap vůbec dostaneme (jinak by test nic neprokazoval)
  const t1 = mk(); try { await loadTileTrailer(t1, 1, "tv", key); } catch (e) { out.withErr = e.message; }
  out.withGsap = !!t1.querySelector(".tile-trailer"); try { removeTileTrailer(t1); } catch { /* stub */ } t1.remove();
  delete window.gsap;
  const t2 = mk(); try { await loadTileTrailer(t2, 1, "tv", key); removeTileTrailer(t2); } catch (e) { out.err = e.message; }
  out.withoutGsap = !!t2.querySelector(".tile-trailer"); t2.remove();
  window.gsap = saved; return out;
});
check("trailer: s gsap se přidá, bez gsap (CDN výpadek) nic nespadne a nepřidá", gs.withGsap === true && !gs.err && gs.withoutGsap === false, JSON.stringify(gs));

const ac = await page.evaluate(() => {
  const root = document.documentElement, g = n => getComputedStyle(root).getPropertyValue(n).trim().toLowerCase();
  const out = {};
  custApplyAll({}); out.def = [g("--accent"), g("--accent2")];
  const id = ProfileGate.createProfile({ name: "Barva", avatar: "🎬", color: "#ff3b30" });
  ProfileGate.selectProfile(id); out.prof = g("--accent");
  custApplyAll({}); out.profAfterCust = g("--accent");
  custApplyAll({ accent: "#00ff00", accent2: "#0000ff" }); out.cust = [g("--accent"), g("--accent2")];
  custApplyAll({ bg: "navy" }); out.bg = g("--bg");
  root.style.setProperty("--radius", "5px"); out.radius = g("--radius");
  return out;
});
check("vzhled: výchozí barvy beze změny", ac.def[0] === "#007aff" && ac.def[1] === "#5ac8fa", JSON.stringify(ac));
check("vzhled: barva profilu se použije i po custApplyAll", ac.prof === "#ff3b30" && ac.profAfterCust === "#ff3b30", JSON.stringify(ac));
check("vzhled: Přizpůsobit (akcent, pozadí, radius) přebije výchozí CSS", ac.cust[0] === "#00ff00" && ac.cust[1] === "#0000ff" && ac.bg === "#04050f" && ac.radius === "5px", JSON.stringify(ac));

const rs = await page.evaluate(() => {
  const slug = Object.keys(db)[0]; let err = null;
  try { openSeries(slug); renderSeasons(); showAllSeasons = true; renderSeasons(); showAllSeasons = false; renderSeasons(); closeModal(); } catch (e) { err = e.message; }
  return { slug: !!slug, err, ssv: !!document.getElementById("ssvGrid"), pills: !!document.getElementById("seasonPills") };
});
check("série: renderSeasons funguje bez skrytých season pills", rs.slug && rs.err === null && rs.ssv && !rs.pills, JSON.stringify(rs));

const pk = await page.evaluate(async () => {
  const id = ProfileGate.createProfile({ name: "Pin", avatar: "🎬", color: "#007aff", pin: "2580" });
  const p = _getProfiles().find(x => x.id === id);
  ProfileGate.openPin(p);
  const ev = k => document.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  ev("2"); ev("5"); const filled2 = document.querySelectorAll("#mfPinModal .pm-dot.filled").length;
  ev("Backspace"); const filled1 = document.querySelectorAll("#mfPinModal .pm-dot.filled").length;
  ev("Escape"); const closed = !document.getElementById("mfPinModal").classList.contains("show");
  ProfileGate.openCreate(); const f = i => document.getElementById("pcPin" + i);
  f(0).focus(); f(0).value = "a7"; f(0).dispatchEvent(new Event("input", { bubbles: true })); const letter = f(0).value;
  const dt = new DataTransfer(); dt.setData("text", "12-34"); f(1).dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  const pasted = [0, 1, 2, 3].map(i => f(i).value).join("");
  return { filled2, filled1, closed, letter, pasted };
});
check("PIN: klávesnice (číslice, Backspace, Esc)", pk.filled2 === 2 && pk.filled1 === 1 && pk.closed, JSON.stringify(pk));
check("PIN pole: jen číslice a vložení ze schránky", pk.letter === "7" && pk.pasted === "1234", JSON.stringify(pk));

const av2 = await page.evaluate(async () => {
  const orig = window.tmdbGet;
  window.tmdbGet = async () => ({ posters: [{ file_path: "/p1.jpg" }, { file_path: '/x"onerror="1.jpg' }], backdrops: [{ file_path: "/b1.jpg" }] });
  ProfileGate.openCreate();
  await new Promise(r => setTimeout(r, 80));
  await ProfileGate._renderAvatarRows([{ id: 1, title: "Film", _type: "movie" }]);
  const opts = [...document.querySelectorAll("#pcAvatarGrid .pc-character-option")];
  const out = { n: opts.length, rows: document.querySelectorAll("#pcAvatarGrid .pc-av-row:not([hidden])").length, bad: !!document.querySelector("#pcAvatarGrid img[onerror]") };
  opts[0].click(); out.picked = ProfileGate._selectedAvatar;
  window.tmdbGet = orig; return out;
});
check("avatar: nabízí plakáty/záběry (ne herce), vybraný obrázek se uloží, bez XSS", av2.n === 3 && av2.rows === 1 && !av2.bad && /image\.tmdb\.org\/t\/p\/w500\/b1\.jpg$/.test(av2.picked || ""), JSON.stringify(av2));

const dd = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  openSeries(slug); renderSeasons();
  selectSeasonFromDropdown("2");
  const out = { s: activeSeason, all: showAllSeasons, val: document.getElementById("epSeasonSelect").value };
  closeModal(); return out;
});
check("série: výběr sezóny v rozbalovátku změní sezónu", dd.s === 2 && dd.all === false && dd.val === "2", JSON.stringify(dd));

const recT = await page.evaluate(async () => {
  const orig = window.tmdbGet;
  const calls = [];
  window.tmdbGet = async (p) => {
    calls.push(p);
    if (p.startsWith("/discover/movie")) return { results: [{ id: 501, title: "Nový <b>film</b>", poster_path: "/m.jpg", release_date: "2026-09-01", vote_average: 7.5 }] };
    if (p.startsWith("/discover/tv")) return { results: [{ id: 601, name: "Nový seriál", poster_path: "/t.jpg", first_air_date: "2026-09-10", vote_average: 8 }] };
    return null;
  };
  aiBrain.memory.genreIdPrefs = { 28: 0.9, 18: 0.5 };
  await checkNewEpisodes();
  const list = document.getElementById("notifPanelList");
  const out = { recs: list.querySelectorAll(".notif-rec").length, xss: !!list.querySelector("b"), usedGenres: calls.some(c => /with_genres=28%7C18|with_genres=28\|18/.test(c)), empty: /Zatím žádné/.test(list.textContent) };
  window.tmdbGet = orig; return out;
});
check("Novinky: ukazují doporučené nové filmy a seriály podle žánrů, bez XSS", recT.recs === 2 && !recT.xss && recT.usedGenres && !recT.empty, JSON.stringify(recT));

const nextEpT = await page.evaluate(() => {
  openSeries(Object.keys(db)[0]); activeSeason = 1; renderSeasons(); renderEpisodes && 0;
  const c = document.createElement("div"); c.className = "episode-card next-ep"; c.dataset.n = "1";
  document.getElementById("episodesGrid").appendChild(c);
  const cs = getComputedStyle(c, "::before"); const out = { bg: cs.backgroundImage, pos: cs.position }; c.remove(); closeModal(); return out;
});
check("epizody: ‚další epizoda‘ nekreslí starý modrý pruh", nextEpT.bg === "none" && nextEpT.pos !== "absolute", JSON.stringify(nextEpT));

const animeT = await page.evaluate(() => {
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "pa", name: "A", avatar: "🎬", likedGenres: [], prefs: {} }]));
  localStorage.setItem("mf_active_pid", "pa");
  ProfileGate.openOnboarding("pa");
  const labels = [...document.querySelectorAll("#pwGenres .pw-genre")].map(b => b.textContent);
  const noEmoji = labels.every(l => /^[A-Za-zÁ-ž\- ]+$/.test(l));
  document.querySelector('#pwGenres [data-genre="anime"]').classList.add("selected");
  document.querySelector('#pwGenres [data-genre="35"]').classList.add("selected");
  ProfileGate.finishOnboarding();
  const p = JSON.parse(localStorage.getItem("mf_profiles_v2"))[0];
  const out = { labels: labels.length, noEmoji, hasAnime: labels.includes("Anime"), liked: p.likedGenres, likes: p.prefs.likesAnime, fn: window.mfLikesAnime() };
  ProfileGate.closeOnboarding(); return out;
});
check("onboarding: žánry bez emoji, Anime se uloží do profilu a algoritmu", animeT.noEmoji && animeT.hasAnime && !animeT.liked.includes(16) && animeT.liked.includes(35) && animeT.likes === true && animeT.fn === true, JSON.stringify(animeT));

const mixT = await page.evaluate(async () => {
  const origFetch = window.fetch;
  window.fetch = async (u) => {
    const url = String(u);
    const mk = (n, base) => ({ results: Array.from({ length: n }, (_, i) => ({ id: base + i, title: "T" + (base + i), name: "T" + (base + i), poster_path: "/p.jpg", vote_average: 7 })) });
    const body = /with_original_language=ja/.test(url) ? mk(5, 9000) : mk(8, 100);
    return { ok: true, json: async () => body };
  };
  localStorage.setItem("mf_tmdb_key", "K");
  const id = getActiveProfileId();
  const ps = _getProfiles(); const p = ps.find(x => x.id === id); p.prefs = { ...p.prefs, likesAnime: true }; p.likedGenres = [35]; _saveProfiles(ps);
  const out = await window.mfhFetchForYou({ tv: [], movies: [] });
  const anime = out.filter(x => String(x.id || "").startsWith("9") || /^T9/.test(x.title || "")).length;
  window.fetch = origFetch; return { n: out.length, anime };
});
check("doporučení: anime se zamíchá mezi ostatní tituly", mixT.anime >= 3 && mixT.n > mixT.anime, JSON.stringify(mixT));

const chipT = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  const w = getWatched(); w[slug + "-S1E1"] = true; localStorage.setItem("mf_watched", JSON.stringify(w));
  document.getElementById("mfProfileGate") && (document.getElementById("mfProfileGate").style.display = "none");
  window.mfhShowResumeChip();
  const c = document.getElementById("mfResumeChip");
  const out = { shown: !!c, once: (window.mfhShowResumeChip(), document.querySelectorAll("#mfResumeChip").length <= 1) };
  c && c.remove(); return out;
});
check("pokračovat ve sledování: štítek v rohu už se nezobrazuje", chipT.shown === false, JSON.stringify(chipT));

const av3 = await page.evaluate(async () => {
  ProfileGate.openCreate(); ProfileGate.toggleAvatarPicker();
  const open1 = !document.getElementById("pcAvatarPicker").hidden && document.getElementById("mfProfileCreate").classList.contains("picker-open");
  ProfileGate.pickAvatar("https://image.tmdb.org/t/p/w342/p1.jpg", "Vybraný obrázek");
  const out = { open1, closed: document.getElementById("pcAvatarPicker").hidden, cls: document.getElementById("mfProfileCreate").classList.contains("picker-open") };
  ProfileGate.closeCreate(); return out;
});
check("avatar: výběr obrázku se potvrdí sám a picker se zavře", av3.open1 && av3.closed && !av3.cls, JSON.stringify(av3));

const persistT = await page.evaluate(() => {
  const slug = "__dtv_777";
  db[slug] = { name: "Test", tmdbId: 777, _isDiscover: true, _seasonEpCounts: [3], poster: "", [slug + "-S1-E1"]: { se: 1, ep: 1 } };
  markWatched(slug + "-S1-E1");
  const saved = JSON.parse(localStorage.getItem("mf_db_custom") || "{}")[slug];
  const out = { saved: !!saved, light: saved && !Object.keys(saved).some(k => /-S\d+-E\d+$/.test(k)), notDiscover: saved && saved._isDiscover === false, counts: saved && saved._seasonEpCounts.length };
  delete db[slug]; localStorage.removeItem("mf_db_custom"); return out;
});
check("seriál z Objevovat se po zhlédnutí uloží (pokračování po restartu)", persistT.saved && persistT.light && persistT.notDiscover && persistT.counts === 1, JSON.stringify(persistT));

const uziT = await page.evaluate(() => { return [window.MFCinemaPlayer.sourceIds("tv"), window.MFCinemaPlayer.sourceIds("movie")]; });
check("zdroje: Uzi.la je až za Přehraj to", uziT.every(l => l.indexOf("uzila") > l.indexOf("prehrajto") && l.indexOf("prehrajto") > -1), JSON.stringify(uziT));

await page.evaluate(() => history.pushState(null, "", "#filmy"));
await page.waitForTimeout(400);
const hashT = await page.evaluate(() => location.hash);
check("adresa: #hash se po přepnutí sekce odstraní", hashT === "", JSON.stringify(hashT));

const dockT = await page.evaluate(() => {
  ["cinemaModal", "mfStandaloneCinema", "universeOverlay", "watchlistOverlay", "seriesModal", "premiereOverlay", "collectionsOverlay", "moodOverlay", "genreEditorOverlay", "customizeOverlay", "wrappedOverlay", "dockMoreSheet", "mfhSeeAllModal"].forEach(id => document.getElementById(id)?.classList.remove("open", "visible", "show"));
  document.body.classList.remove("mf-section-protebe");
  document.body.classList.add("modal-open"); document.documentElement.classList.add("mfh-home-on");
  window.mfhUpdateDockVisibility();
  return { cls: document.body.classList.contains("modal-open") };
});
check("dock: zapomenutá třída modal-open se samo opraví", dockT.cls === false, JSON.stringify(dockT));

const rateT = await page.evaluate(() => {
  MFCinemaPlayer.open(456, "The Simpsons", "tv", { localSlug: "the-simpsons", season: 1, episode: 2 });
  const b = document.getElementById("mfCinRateBtn");
  const out = { exists: !!b, shown: b && b.style.display !== "none" };
  b && b.click();
  const ov = document.getElementById("epRatingOverlay");
  out.open = ov && ov.style.display === "flex"; out.watched = !!getWatched()["the-simpsons-S1-E2"];
  closeEpRating(false); MFCinemaPlayer.close(); return out;
});
check("kino: hvězdička označí epizodu a otevře hodnocení", rateT.exists && rateT.open && rateT.watched, JSON.stringify(rateT));

const onlyAnimeT = await page.evaluate(async () => {
  const origFetch = window.fetch; const urls = [];
  window.fetch = async (u) => { urls.push(String(u)); return { ok: true, json: async () => ({ results: [{ id: 9001, name: "A", title: "A", poster_path: "/p.jpg", vote_average: 8, original_language: "ja", genre_ids: [16] }] }) }; };
  localStorage.setItem("mf_tmdb_key", "K");
  const id = getActiveProfileId(); const ps = _getProfiles(); const p = ps.find(x => x.id === id);
  const bak = JSON.stringify([p.prefs, p.likedGenres]);
  p.prefs = { ...p.prefs, likesAnime: true }; p.likedGenres = []; _saveProfiles(ps);
  const out = await window.mfhFetchForYou({ tv: [{ id: 1, name: "Breaking Bad" }], movies: [] });
  const only = window.mfOnlyAnime();
  const ps2 = _getProfiles(); const p2 = ps2.find(x => x.id === id); const b = JSON.parse(bak); p2.prefs = b[0]; p2.likedGenres = b[1]; _saveProfiles(ps2);
  window.fetch = origFetch;
  return { only, n: out.length, generic: urls.some(u => !/with_original_language=ja/.test(u)) };
});
check("anime-only profil: doporučení jsou jen anime (žádné Breaking Bad ani sci-fi)", onlyAnimeT.only && onlyAnimeT.n > 0 && !onlyAnimeT.generic, JSON.stringify(onlyAnimeT));

const najT = await page.evaluate(() => {
  MFCinemaPlayer.open("1", "Overflow", "tv", { season: 1, episode: 1 });
  const urls = [];
  for (let i = 0; i < 8; i++) { const u = MFCinemaPlayer.currentUrl(); if (/najserialy/.test(u)) urls.push(u); document.getElementById("mfCinSwitchSrc").click(); }
  let noEmbed = false;
  for (let i = 0; i < 8; i++) { if (document.querySelector(".mf-cin-noembed")) { noEmbed = !!document.querySelector(".mf-cin-noembed-btn[target=_blank]") && !document.querySelector("#mfStandaloneCinemaFrame iframe"); break; } document.getElementById("mfCinSwitchSrc").click(); }
  MFCinemaPlayer.close();
  return { urls, noEmbed, ids: MFCinemaPlayer.sourceIds("tv") };
});
check("zdroj NajSerialy: tvar /serial/{slug}/s01e01; Uzi.la ukáže tlačítko místo prázdného iframe", najT.urls.includes("https://www.najserialy.io/serial/overflow/s01e01") && najT.noEmbed && najT.ids.includes("najserialy"), JSON.stringify(najT));

const charT = await page.evaluate(async () => {
  const orig = window.fetch;
  window.fetch = async (u) => {
    u = String(u);
    const body = /anilist/.test(u) ? { data: { Page: { characters: [{ name: { full: "Naruto Uzumaki" }, image: { large: "https://s4.anilist.co/n.png" }, media: { nodes: [{ title: { english: "Naruto" } }] } }] } } }
      : { query: { pages: { 1: { index: 1, title: "Walter White", thumbnail: { source: "https://upload.wikimedia.org/w.jpg" } } } } };
    return { ok: true, json: async () => body };
  };
  window.tmdbGet = async () => ({ results: [] });
  ProfileGate.openCreate();
  await new Promise(r => setTimeout(r, 60));
  await ProfileGate._searchAvatarTitles("walter");
  const opts = [...document.querySelectorAll("#pcAvatarGrid .pc-character-option")];
  const names = opts.map(o => o.dataset.name);
  opts[0].click();
  const out = { names, picked: ProfileGate._selectedAvatar };
  window.fetch = orig; ProfileGate.closeCreate(); return out;
});
check("avatar: hledání nabídne postavy z AniList a Wikipedie a vybere je", charT.names.includes("Naruto Uzumaki") && charT.names.includes("Walter White") && /anilist\.co\/n\.png$/.test(charT.picked || ""), JSON.stringify(charT));

const nextT = await page.evaluate(() => {
  const slug = "the-simpsons"; const w = getWatched();
  Object.keys(w).filter(k => k.startsWith(slug + "-S")).forEach(k => delete w[k]);
  w[slug + "-S1-E2"] = true; saveWatched(w);
  const a = findNextEp(slug);
  w[slug + "-S1-E13"] = true; saveWatched(w);
  const b = findNextEp(slug);
  Object.keys(w).filter(k => k.startsWith(slug + "-S")).forEach(k => delete w[k]); saveWatched(w);
  return { a: a && a.uid, b: b && b.uid, empty: findNextEp(slug).uid };
});
check("pokračování: bere nejvyšší zhlédnutou epizodu, ne první mezeru", nextT.a === "the-simpsons-S1-E3" && nextT.b === "the-simpsons-S2-E1" && nextT.empty === "the-simpsons-S1-E1", JSON.stringify(nextT));

const contT = await page.evaluate(() => {
  const pid = localStorage.getItem("mf_active_pid");
  const k = b => pid ? b + "_" + pid : b;
  localStorage.setItem(k("mf_watch_timeline"), JSON.stringify([{ ts: Date.now() - 5000, slug: "the-simpsons", genres: [], name: "The Simpsons" }]));
  localStorage.setItem(k("mf_cont_movies"), JSON.stringify([{ tmdbId: "603", title: "Matrix", ts: Date.now(), poster: "", backdrop: "" }]));
  localStorage.removeItem(k("mf_cont_done"));
  const w = getWatched(); w["the-simpsons-S1-E1"] = true; saveWatched(w);
  const first = mfhGetRealContinueItem();
  mfhFinishContinue();
  const second = mfhGetRealContinueItem();
  mfhFinishContinue();
  const third = mfhGetRealContinueItem();
  Object.keys(w).filter(x => x.startsWith("the-simpsons-S")).forEach(x => delete w[x]); saveWatched(w);
  return { first: first && first.kind + ":" + first.title, second: second && second.kind + ":" + second.episode, left: second && second.left, third };
});
check("pokračování: film z kina, pak seriál po poslední epizodě; Dokoukal jsem je schová", contT.first === "movie:Matrix" && contT.second === "series:S1 E02" && /^zbývá \d+ (epizod|epizody|epizoda|série|sérií)$/.test(contT.left || "") && !/min/.test(contT.left) && contT.third === null, JSON.stringify(contT));

check("žádné JS chyby", errors.length === 0, errors.join(" | "));
await close();
finish();
