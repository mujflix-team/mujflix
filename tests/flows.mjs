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

// --- Japonský název (bez latinky) → adresy z anglického názvu
const jp = await page.evaluate(async () => {
  window.MF_USING_TMDB_PROXY = true;
  const realFetch = window.fetch;
  window.fetch = (u) => {
    u = String(u);
    const json = u.includes("/translations") ? { translations: [] } : { name: "Dragon Ball Super", original_name: "ドラゴンボール超", original_language: "ja" };
    return Promise.resolve({ ok: true, json: () => Promise.resolve(json) });
  };
  MFCinemaPlayer.open("62715", "ドラゴンボール超", "tv", 1, 1);
  await new Promise(r => setTimeout(r, 600));
  const urls = [];
  for (let i = 0; i < 12; i++) {
    urls.push(window.MFCinemaPlayer.currentUrl() || "");
    document.getElementById("mfCinSwitchSrc")?.click();
  }
  window.fetch = realFetch; MFCinemaPlayer.close();
  return urls;
});
check("japonský název: odkazy používají dragon-ball-super", jp.some(u => /najserialy\.io\/serial\/dragon-ball-super\//.test(u)) && jp.some(u => /svetserialu\.to\/serial\/dragon-ball-super\//.test(u)), JSON.stringify(jp));

// --- Prázdné Oblíbené → Objevovat → zavřít: dock zůstane; logo v Objevování vede domů
const dk = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)); const out = {};
  const gate = document.getElementById("mfProfileGate"), gd = gate.style.display; gate.style.display = "none";
  const dock = () => getComputedStyle(document.getElementById("mfDock")).display;
  window.mfGoHome(); await w(500);
  document.getElementById("dockProtebe")?.click(); await w(600);
  document.querySelector("#watchlistEmpty .wl-empty-btn")?.click(); await w(800);
  out.brand = document.querySelector("#universeOverlay .dv-brand")?.getAttribute("onclick") || "";
  window.closeUniverse(); await w(900);
  out.dock = dock(); out.home = document.documentElement.classList.contains("mfh-home-on");
  document.querySelector("#watchlistEmpty .wl-empty-btn")?.click(); await w(800);
  document.querySelector("#universeOverlay .dv-brand").click(); await w(900);
  out.brandHome = document.documentElement.classList.contains("mfh-home-on") && !document.getElementById("universeOverlay").classList.contains("open");
  gate.style.display = gd;
  return out;
});
check("dock: po Oblíbené → Objevovat → ✕ zůstane dock a domovská stránka", dk.dock !== "none" && dk.home, JSON.stringify(dk));
check("objevování: logo MůjFlix vrací na domovskou stránku", /mfGoHome/.test(dk.brand) && dk.brandHome, JSON.stringify(dk));

// --- Dávka C: uvítání, Oblíbené jako řady, obrázky se plynule objeví
const bc = await page.evaluate(() => {
  const r = {};
  r.welcome = /Vítej/.test(document.querySelector("#pwStep1 .pw-title")?.textContent || "");
  const img = document.createElement("img"); img.className = "nf-img"; document.body.appendChild(img);
  r.before = getComputedStyle(img).opacity; img.dispatchEvent(new Event("load")); r.loaded = img.classList.contains("is-loaded"); img.remove();
  const wl = document.getElementById("watchlistOverlay"), c = document.createElement("div"); c.className = "wl-card-poster"; wl.appendChild(c);
  r.radius = getComputedStyle(c).borderRadius; c.remove();
  return r;
});
check("uvítání: nový profil dostane přívětivý nadpis", bc.welcome, JSON.stringify(bc));
check("načítání: obrázek je skrytý do načtení a pak dostane is-loaded", bc.before === "0" && bc.loaded, JSON.stringify(bc));
check("Oblíbené: plakáty mají stejný poloměr jako řady (6px)", bc.radius === "6px", JSON.stringify(bc));

// --- Dávka D: trailer v banneru
const trT = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  const origFetch = window.fetch;
  window.fetch = async (u) => {
    const url = String(u);
    if (/\/videos/.test(url)) return { ok: true, json: async () => ({ results: [{ site: "YouTube", key: "abcDEF12345", type: "Trailer", official: true }, { site: "Vimeo", key: "zzz", type: "Trailer" }] }) };
    const mk = n => ({ results: Array.from({ length: n }, (_, i) => ({ id: 500 + i, title: "H" + i, name: "H" + i, overview: "Popis", poster_path: "/p.jpg", backdrop_path: "/b.jpg", vote_average: 7, release_date: "2020-01-01", first_air_date: "2020-01-01", genre_ids: [18] })) });
    return { ok: true, json: async () => mk(10) };
  };
  localStorage.setItem("mf_tmdb_key", "K");
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  try {
    const pid = getActiveProfileId(); const ps = _getProfiles(); const p = ps.find(x => x.id === pid); p.prefs = { ...p.prefs, maxAge: 0, animeOnly: false }; _saveProfiles(ps);
    window.renderHomepage(); await w(2600);
    const box = document.querySelector("#nfHero .nf-trailer");
    out.box = !!box; out.noFrame = box ? !box.querySelector("iframe") : null;
    if (box) { box.querySelector(".nf-tr-open").click(); await w(100); const f = box.querySelector("iframe"); out.src = f ? f.src : ""; out.ctl = !!box.querySelector(".nf-tr-fs") && !!box.querySelector(".nf-tr-x") && !!box.querySelector(".nf-tr-snd"); out.btns = box.querySelectorAll(".nf-tr-ctl button").length; out.noYtUi = /controls=0/.test(f ? f.src : ""); box.querySelector(".nf-tr-x").click(); out.closed = !box.querySelector("iframe"); }
  } finally { window.fetch = origFetch; localStorage.removeItem("mf_tmdb_key"); }
  return out;
});
check("trailer v banneru: miniatura, po kliknutí YouTube přehrávač s ovládáním, jde zavřít", trT.skip || (trT.box && trT.noFrame && /youtube-nocookie\.com\/embed\/abcDEF12345/.test(trT.src || "") && trT.ctl && trT.btns === 3 && trT.noYtUi && trT.closed), JSON.stringify(trT));

// --- v3.9.1: pauza traileru (klepnutím i odscrollováním) musí opravdu zabrat, jinak se video zavře
const trP = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  const origFetch = window.fetch;
  window.fetch = async (u) => {
    const url = String(u);
    if (/\/videos/.test(url)) return { ok: true, json: async () => ({ results: [{ site: "YouTube", key: "abcDEF12345", type: "Trailer", official: true }] }) };
    const mk = n => ({ results: Array.from({ length: n }, (_, i) => ({ id: 500 + i, title: "H" + i, name: "H" + i, overview: "Popis", poster_path: "/p.jpg", backdrop_path: "/b.jpg", vote_average: 7, release_date: "2020-01-01", first_air_date: "2020-01-01", genre_ids: [18] })) });
    return { ok: true, json: async () => mk(10) };
  };
  localStorage.setItem("mf_tmdb_key", "K");
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const state = (f, st) => window.dispatchEvent(new MessageEvent("message", { data: JSON.stringify({ event: "infoDelivery", info: { playerState: st } }), source: f.contentWindow }));
  try {
    window.mfhResetSig && window.mfhResetSig(); window.renderHomepage(); await w(2600);
    const box = document.querySelector("#nfHero .nf-trailer");
    if (!box) return { skip: true };
    box.querySelector(".nf-tr-open").click(); await w(100);
    let f = box.querySelector("iframe");
    out.origin = /[?&]origin=/.test(f.src) && /enablejsapi=1/.test(f.src);
    box.querySelector(".nf-tr-tap").click(); state(f, 2); await w(1200);
    out.keptWhenConfirmed = !!box.querySelector("iframe") && box.classList.contains("paused");
    box.querySelector(".nf-tr-tap").click(); out.resumed = !box.classList.contains("paused") && !!box.querySelector("iframe");
    box.querySelector(".nf-tr-tap").click(); await w(1200);
    out.closedWhenUnconfirmed = !box.querySelector("iframe");
    box.querySelector(".nf-tr-open").click(); await w(100); f = box.querySelector("iframe"); state(f, 0); await w(100);
    out.closedAtEnd = !box.querySelector("iframe");
  } finally { window.fetch = origFetch; localStorage.removeItem("mf_tmdb_key"); }
  return out;
});
check("trailer: pauza klepnutím se potvrdí, bez potvrzení se video zavře, na konci se zavře, API má origin", trP.skip || (trP.origin && trP.keptWhenConfirmed && trP.resumed && trP.closedWhenUnconfirmed && trP.closedAtEnd), JSON.stringify(trP));

// --- Rozkoukané jsou v první řadě, banner zůstává doporučený titul; kartu jde odebrat tlačítkem „Dokoukal jsem“
const stT = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const slugs = Object.keys(db).slice(0, 3);
  const key = (typeof uKey === "function" ? uKey("mf_watch_timeline") : "mf_watch_timeline");
  const prev = localStorage.getItem(key);
  localStorage.setItem(key, JSON.stringify(slugs.map((sl, i) => ({ slug: sl, ts: Date.now() - i * 1000 }))));
  try {
    window.mfhResetSig && window.mfhResetSig();
    window.renderHomepage(); await w(700);
    out.noStack = !document.querySelector("#nfHero .nf-cstack");
    out.heroNotContinue = !/Pokračovat ve sledování/.test(document.querySelector("#nfHero .nf-hero-eyebrow")?.textContent || "");
    const row = document.getElementById("mfhRecentSection");
    out.cards = row ? row.querySelectorAll(".nf-card").length : 0;
    out.cx = row ? row.querySelectorAll(".nf-cx").length : 0;
    row && row.querySelector(".nf-cx").click(); await w(700);
    const row2 = document.getElementById("mfhRecentSection");
    out.removed = (row2 ? row2.querySelectorAll(".nf-card").length : 0) === out.cards - 1;
  } finally { prev == null ? localStorage.removeItem(key) : localStorage.setItem(key, prev); localStorage.removeItem(uKey("mf_cont_done")); window.mfhResetSig && window.mfhResetSig(); window.renderHomepage(); }
  return out;
});
check("rozkoukané: první řada s tlačítkem Dokoukal jsem u karty (odebere ji), banner je doporučený titul", stT.noStack && stT.heroNotContinue && stT.cards >= 2 && stT.cx === stT.cards && stT.removed, JSON.stringify(stT));

// --- Detail seriálu: Další epizody / Podobné
const sdT = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const slug = Object.keys(db)[0]; db[slug].tmdbId = 1399;
  const of = window.fetch; window.MF_USING_TMDB_PROXY = true;
  window.fetch = async (u, ...r) => /\/similar/.test(String(u)) ? { ok: true, json: async () => ({ results: [{ id: 1, name: "Podobný A", poster_path: "/a.jpg" }, { id: 2, name: "Podobný B", poster_path: "/b.jpg" }] }) } : of(u, ...r);
  try {
    openSeries(slug); await w(500);
    out.links = !!document.getElementById("sdTabEps") && !!document.getElementById("sdTabSim");
    out.openEps = document.getElementById("episodesView").style.display === "flex" && document.querySelectorAll("#episodesGrid .episode-card").length > 0;
    document.getElementById("sdTabSim").click(); await w(600);
    out.cards = document.querySelectorAll("#sdSimilar .sd-sim-card").length;
    out.simOnly = document.getElementById("episodesView").style.display === "none" && !document.getElementById("sdSimilar").hidden;
    document.getElementById("sdTabEps").click(); await w(300);
    out.eps = document.getElementById("episodesView").style.display === "flex" && document.getElementById("sdSimilar").hidden;
  } finally { window.fetch = of; closeModal(); }
  return out;
});
check("detail seriálu: epizody jsou rovnou vidět, záložka Podobné ukáže doporučení a zpět", sdT.links && sdT.openEps && sdT.cards === 2 && sdT.simOnly && sdT.eps, JSON.stringify(sdT));

// --- Logo titulu místo textu
const lgT = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const slug = Object.keys(db)[0]; db[slug].tmdbId = 4242;
  const of = window.fetch; window.MF_USING_TMDB_PROXY = true;
  window.fetch = async (u, ...r) => /\/tv\/4242\/images/.test(String(u)) ? { ok: true, json: async () => ({ logos: [{ file_path: "/en.png", iso_639_1: "en", vote_average: 5 }, { file_path: "/cs.png", iso_639_1: "cs", vote_average: 1 }, { file_path: "/x.svg", iso_639_1: "cs", vote_average: 9 }] }) } : of(u, ...r);
  try {
    out.url = await window.mfFetchLogo("tv", 4242);
    openSeries(slug); await w(600);
    out.img = document.getElementById("sLogo")?.getAttribute("src") || "";
  } finally { window.fetch = of; closeModal(); }
  return out;
});
check("logo titulu: vybere české bez SVG a přidá ho do detailu (když se načte)", /\/cs\.png$/.test(lgT.url || ""), JSON.stringify(lgT));

// --- Pokračovat rovnou pustí epizodu, žádné „Skryto“, žádný toast „Načítám…“
const pcT = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const slug = Object.keys(db)[0]; db[slug].tmdbId = db[slug].tmdbId || 777;
  const wk = typeof uKey === "function" ? uKey("mf_watched") : "mf_watched", wsnap = localStorage.getItem(wk);
  const calls = []; const orig = window._showCinemaOrFinderChoice;
  window._showCinemaOrFinderChoice = (...a) => { calls.push(a.slice(0, 3).join("|")); };
  try {
    openSeries(slug); await w(400);
    document.querySelector("#seriesModal .btn-continue").click(); await w(200);
    out.calls = calls.slice();
    out.viaHome = window.mfPlayNextOf(slug) && calls.length === 2;
    await w(600);
    out.spoiler = document.querySelectorAll("#episodesGrid .spoiler-label, #episodesGrid .spoiler-blur").length;
  } finally { window._showCinemaOrFinderChoice = orig; closeModal(); wsnap == null ? localStorage.removeItem(wk) : localStorage.setItem(wk, wsnap); }
  return out;
});
check("Pokračovat: rovnou spustí další epizodu (i z banneru) a díly nejsou skryté", pcT.calls.length === 1 && /tv_ep/.test(pcT.calls[0]) && pcT.viaHome && pcT.spoiler === 0, JSON.stringify(pcT));

// --- Karta v řadě: zvětšený plakát se při najetí neořízne (contain: paint to dělalo)
const ctT = await page.evaluate(() => { const c = document.createElement("div"); c.className = "nf-card"; document.body.appendChild(c); const v = getComputedStyle(c).contain; c.remove(); return v; });
check("karty v řadách: bez contain: paint (neořezává zvětšený plakát)", !/paint|strict|content/.test(ctT), ctT);

// --- Ověření zdrojů: zdroj, který titul nemá, se přeskočí
const prT = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  const of = window.fetch, oUrl = window.TMDB_PROXY_URL; window.TMDB_PROXY_URL = "https://w.workers.dev";
  const sent = [];
  window.fetch = async (u, o) => {
    if (/w\.workers\.dev\/src\/probe/.test(String(u))) {
      const urls = JSON.parse(o.body).urls; sent.push(urls);
      return { ok: true, json: async () => ({ results: urls.map(x => /svetserialu/.test(x) ? false : /bombuj/.test(x) ? true : null) }) };
    }
    return /w\.workers\.dev/.test(String(u)) ? { ok: false, json: async () => null } : of(u, o);
  };
  try {
    localStorage.removeItem("mfx_src_pref"); 
    MFCinemaPlayer.open("98765", "Nějaký Seriál", "tv", { season: 1, episode: 1 }); await w(1200);
    out.sent = sent.length > 0 && sent[0].every(x => /^https:\/\//.test(x));
    out.url = MFCinemaPlayer.currentUrl();
    const n0 = sent.length; document.getElementById("mfCinNextEp").click(); await w(700);
    out.noRepeat = sent.length === n0;
    out.ep1 = sent.flat().filter(x => !/\?s=|hledej/.test(x)).every(x => /s01e01|1x01|S01E01/i.test(x));
    out.label = document.getElementById("mfCinSrcLabel")?.textContent || [...document.querySelectorAll("#mfStandaloneCinema *")].map(e => e.textContent).find(t => /zdroj|✓|✗/i.test(t) && t.length < 80) || "";
  } finally { MFCinemaPlayer.close(); await w(400); window.fetch = of; window.TMDB_PROXY_URL = oUrl; }
  return out;
});
const barT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  MFCinemaPlayer.open("98765", "Nějaký Seriál s dlouhým názvem", "tv", { season: 1, episode: 4 }); await w(900);
  const t = document.querySelector("#mfStandaloneCinema .mf-standalone-cinema-top");
  const rows = new Set([...t.querySelectorAll("button,strong")].filter(b => b.offsetParent).map(b => Math.round(b.getBoundingClientRect().top / 10))).size;
  const ns = getComputedStyle(document.getElementById("mfCinNextSeries")).display;
  MFCinemaPlayer.close(); await w(300);
  return { rows, ns, vw: innerWidth };
});
check("kino: lišta se nezalamuje (PC 1 řádek, telefon max 2) a „Další seriál“ je jen na velkém PC", barT.rows <= (barT.vw > 900 ? 1 : 2) && (barT.vw >= 1360 || barT.ns === "none"), JSON.stringify(barT));
check("ověření zdrojů: u seriálu se neptá znovu při každé epizodě (ověřuje 1. epizodu)", prT.noRepeat && prT.ep1, JSON.stringify(prT));
check("ověření zdrojů: Worker se zeptá a otevře se zdroj, který titul má (ne svetserialu)", prT.sent && /bombuj/.test(prT.url) && !/svetserialu/.test(prT.url), JSON.stringify(prT));

// --- Lupa v přehrávači: hledání titulu na aktuálním zdroji
const srchT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  MFCinemaPlayer.open("5", "Odyssea", "movie", { year: 2026 });
  for (let i = 0; i < 40 && !document.querySelector("#mfStandaloneCinemaFrame iframe"); i++) await w(100);
  await w(1800); // přehrávač počká na ověření zdroje; až potom jde kliknout na lupu
  const b = document.getElementById("mfCinSearchSrc"); const has = !!b;
  b && b.click(); await w(600);
  const f = document.querySelector("#mfStandaloneCinemaFrame iframe"); const src = f ? f.getAttribute("src") : "";
  MFCinemaPlayer.close(); return { has, src };
});
check("cinema: lupa otevře hledání titulu na aktuálním zdroji", srchT.has && /\?s=Odyssea|hledej\/Odyssea|search|uzi\.la/i.test(srchT.src || "uzi.la"), JSON.stringify(srchT));

// --- Detail seriálu: řádek sezón přepne epizody jedním klepnutím, fajfka u zhlédnuté; záložka Popis
const ssvT = await page.evaluate(async () => {
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const w = ms => new Promise(r => setTimeout(r, ms));
  const few = Object.keys(db).find(k => totalSeasons(k) >= 3);
  if (!few) return { skip: true };
  const out = {};
  openSeries(few); await w(500);
  const strip = document.getElementById("sdSeasons");
  out.n = strip.children.length === totalSeasons(few);
  const b2 = strip.querySelector('[data-s="2"]'); b2.click(); await w(200);
  out.sw = activeSeason === 2 && b2.classList.contains("active") && !!document.querySelector("#episodesGrid .episode-card");
  const wk = uKey("mf_watched"), snap = localStorage.getItem(wk);
  try {
    const all = {}; for (let e = 1; e <= epsInSeason(few, 1); e++) all[few + "-S1-E" + e] = true;
    localStorage.setItem(wk, JSON.stringify(all)); renderSeasons();
    out.done = strip.querySelector('[data-s="1"]').classList.contains("done") && !strip.querySelector('[data-s="3"]').classList.contains("done");
  } finally { snap == null ? localStorage.removeItem(wk) : localStorage.setItem(wk, snap); }
  document.getElementById("sdTabInfo").click(); await w(200);
  out.info = !document.getElementById("sdInfo").hidden && document.getElementById("episodesView").style.display === "none" && document.getElementById("sdTools").hidden;
  document.getElementById("sdTabEps").click(); await w(200);
  out.back = document.getElementById("sdInfo").hidden && document.getElementById("episodesView").style.display === "flex";
  closeModal();
  return out;
});
check("detail seriálu: řádek sezón přepne epizody, fajfka u zhlédnuté, záložka Popis", ssvT.skip || (ssvT.n && ssvT.sw && ssvT.done && ssvT.info && ssvT.back), JSON.stringify(ssvT));

// --- Popis seriálu: fakty, herci s fotkami a trailer (iframe až po klepnutí, zavře se po opuštění záložky)
const infT = await page.evaluate(async () => {
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const w = ms => new Promise(r => setTimeout(r, ms));
  const slug = Object.keys(db)[0], out = {};
  const picked = _sdPickTrailer({ results: [{ site: "YouTube", key: "enT", type: "Trailer", iso_639_1: "en" }, { site: "YouTube", key: "csT", type: "Trailer", iso_639_1: "cs" }, { site: "YouTube", key: "tz", type: "Teaser", iso_639_1: "cs", official: true }, { site: "Vimeo", key: "vv", type: "Trailer" }] });
  out.pick = picked === "csT" && _sdPickTrailer({ results: [] }) === "";
  openSeries(slug); await w(300);
  activeSeries = slug;
  _sdPaintInfo({ first_air_date: "1999-03-28", status: "Ended", last_air_date: "2013-09-04", number_of_episodes: 140, genres: [{ name: "Komedie" }], networks: [{ name: "Fox" }], vote_average: 8.4, vote_count: 900, castFull: [{ name: "Billy West", role: "Fry", photo: "https://image.tmdb.org/t/p/w185/x.jpg" }, { name: "Bez Fotky", role: "", photo: "" }], trailer: "abc123" }, 3);
  document.getElementById("sdTabInfo").click(); await w(200);
  out.facts = document.querySelectorAll("#sdFacts dt").length === 6 && !document.getElementById("sdFacts").hidden;
  out.cast = document.querySelectorAll("#sdCastRow .sd-actor").length === 2 && [...document.querySelectorAll("#sdCastRow .sd-actor-photo")].every(p => p.querySelector("img") || p.querySelector("svg")) && document.querySelectorAll("#sdCastRow svg").length >= 1;
  out.btn = !!document.querySelector("#sdTrailer .sd-trailer-btn") && !document.querySelector("#sdTrailer iframe");
  document.querySelector("#sdTrailer .sd-trailer-btn").click();
  const f = document.querySelector("#sdTrailer iframe");
  out.iframe = !!f && /youtube-nocookie\.com\/embed\/abc123/.test(f.src);
  document.getElementById("sdTabEps").click(); await w(200);
  out.closed = !document.querySelector("#sdTrailer iframe") && !!document.querySelector("#sdTrailer .sd-trailer-btn");
  closeModal();
  return out;
});
check("popis seriálu: fakty, herci s fotkami, trailer se spustí až po klepnutí a po opuštění záložky se zavře", infT.pick && infT.facts && infT.cast && infT.btn && infT.iframe && infT.closed, JSON.stringify(infT));

// --- Doporučení: semínka „Protože jsi viděl …“ (hodnocení > sledování, film se počítá, max. dvě) a filmografie herce
const recT = await page.evaluate(async () => {
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const w = ms => new Promise(r => setTimeout(r, ms));
  const out = {}, tk = uKey("mf_watch_timeline"), rk = uKey("mf_ratings"), snap = [localStorage.getItem(tk), localStorage.getItem(rk)];
  const slugs = Object.keys(db), a = slugs[0], b = slugs[1], oldIds = [db[a].tmdbId, db[b].tmdbId];
  db[a].tmdbId = 111; db[b].tmdbId = 222;
  try {
    const now = Date.now();
    localStorage.setItem(tk, JSON.stringify([{ slug: a, ts: now - 5 * 864e5, name: "Seriál A", tmdbId: 111 }, { slug: b, ts: now - 1 * 864e5, name: "Seriál B", tmdbId: 222 }]));
    localStorage.setItem(rk, JSON.stringify({ [a]: { rating: "loved", name: "Seriál A", ts: now - 5 * 864e5 }, [b]: { rating: "meh", name: "Seriál B", ts: now } }));
    localStorage.removeItem(uKey("mf_cont_movies"));
    let seeds = window.mfhSeedTitles(2);
    out.order = seeds.length === 2 && seeds[0].id === "111" && seeds[1].id === "222";
    window.mfRecordContinueMovie(333, "Film C"); await w(50);
    seeds = window.mfhSeedTitles(5);
    out.movie = seeds.some(x => x.type === "movie" && x.id === "333");
    out.max = window.mfhSeedTitles(2).length === 2;
    out.badId = (() => { localStorage.setItem(tk, JSON.stringify([{ slug: a, ts: now, name: "X", tmdbId: "ab/c" }])); localStorage.setItem(rk, "{}"); return !window.mfhSeedTitles(5).some(x => x.id === "ab/c") })();
  } finally {
    snap[0] == null ? localStorage.removeItem(tk) : localStorage.setItem(tk, snap[0]); snap[1] == null ? localStorage.removeItem(rk) : localStorage.setItem(rk, snap[1]);
    try { localStorage.removeItem(uKey("mf_cont_movies")); } catch (e) { void e; }
    db[a].tmdbId = oldIds[0]; db[b].tmdbId = oldIds[1];
  }
  const ft = _sdActorTitles({ cast: [
    { id: 1, media_type: "movie", title: "Film", poster_path: "/a.jpg", popularity: 50, character: "Role", release_date: "2001-01-01" },
    { id: 1, media_type: "movie", title: "Film", poster_path: "/a.jpg", popularity: 50 },
    { id: 2, media_type: "tv", name: "Epizodka", poster_path: "/b.jpg", episode_count: 1, character: "Host" },
    { id: 3, media_type: "tv", name: "Seriál", poster_path: "/c.jpg", episode_count: 30, popularity: 90, character: "Hlavní" },
    { id: 4, media_type: "tv", name: "Talk show", poster_path: "/d.jpg", episode_count: 50, genre_ids: [10767] },
    { id: 5, media_type: "movie", title: "Dokument", poster_path: "/e.jpg", character: "Himself" },
    { id: 6, media_type: "movie", title: "Bez plakátu", poster_path: null },
    { id: 7, media_type: "person", name: "Osoba", poster_path: "/f.jpg" }] });
  out.titles = ft.length === 2 && ft[0].id === 3 && ft[1].id === 1;
  const of = window.fetch; window.MF_USING_TMDB_PROXY = true;
  window.fetch = async (u, ...r) => /\/person\/77\/combined_credits/.test(String(u)) ? { ok: true, json: async () => ({ cast: [{ id: 3, media_type: "tv", name: "Seriál", poster_path: "/c.jpg", episode_count: 30, popularity: 90, character: "Hlavní" }, { id: 1, media_type: "movie", title: "Film", poster_path: "/a.jpg", popularity: 50, character: "Role" }] }) } : of(u, ...r);
  try {
    openSeries(slugs[0]); await w(300);
    document.getElementById("sdTabInfo").click(); await w(100);
    _sdOpenActor({ id: 77, name: "Herec Test" }); await w(500);
    const v = document.getElementById("sdActorView");
    out.view = !v.hidden && document.getElementById("sdInfo").hidden && v.querySelectorAll(".sd-actor-grid .sd-sim-card").length === 2 && /Herec Test/.test(v.textContent);
    v.querySelector('[data-f="movie"]').click();
    out.filter = v.querySelectorAll(".sd-actor-grid .sd-sim-card").length === 1;
    v.querySelector(".sd-actor-back").click();
    out.back = v.hidden && !document.getElementById("sdInfo").hidden;
  } finally { window.fetch = of; closeModal(); }
  return out;
});
check("doporučení: semínka podle hodnocení a sledování; filmografie herce se filtruje a jde zavřít", recT.order && recT.movie && recT.max && recT.badId && recT.titles && recT.view && recT.filter && recT.back, JSON.stringify(recT));

// --- Výběr avatara: anime postavy jsou nahoře a poslední výsledek se drží v paměti (i když síť nic nevrátí)
const avT = await page.evaluate(async () => {
  const mk = n => Array.from({ length: n }, (_, i) => ({ name: "P" + i, url: "https://x.test/" + i + ".jpg" }));
  localStorage.setItem("mf_avatar_rows_v1", JSON.stringify({ t: Date.now(), rows: [
    { title: "Marvel", list: mk(16), anime: false, i: 15 }, { title: "Anime postavy", list: mk(8), anime: true, i: 0 }, { title: "Naruto", list: mk(8), anime: true, i: 1 }] }));
  const g = document.getElementById("pcAvatarGrid"); if (!g) return { none: true };
  window.ProfileGate.loadAvatarPicker(); await new Promise(r => setTimeout(r, 500));
  const titles = [...g.querySelectorAll("h4")].map(h => h.textContent);
  localStorage.removeItem("mf_avatar_rows_v1");
  return { titles };
});
check("avatary: anime řady jsou první a z paměti se zobrazí hned", !avT.none && avT.titles && avT.titles[0] === "Anime postavy" && avT.titles[1] === "Naruto" && avT.titles.includes("Marvel"), JSON.stringify(avT));

// --- Výběr avatara: když AniList neodpovídá, ukáže se hláška s tlačítkem Zkusit znovu a ostatní řady zůstanou
const avFail = await page.evaluate(async () => {
  localStorage.removeItem("mf_avatar_rows_v1");
  const orig = window.fetch, mk = n => ({ query: { pages: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { title: "P" + i, index: i, thumbnail: { source: "https://upload.wikimedia.org/q" + n + "_" + i + ".jpg" } }])) } });
  window.fetch = async u => /anilist/.test(String(u)) ? { ok: false, json: async () => null } : { ok: true, json: async () => mk(8) };
  ProfileGate.openCreate();
  let txt = "";
  for (let i = 0; i < 60 && !/AniList neodpovídá/.test(txt); i++) { await new Promise(r => setTimeout(r, 100)); txt = document.getElementById("pcAvatarGrid").textContent; }
  const rows = document.querySelectorAll("#pcAvatarGrid .pc-av-row").length, retry = !!document.querySelector("#pcAvatarGrid .pc-av-retry");
  window.fetch = orig; localStorage.removeItem("mf_avatar_rows_v1"); ProfileGate.closeCreate && ProfileGate.closeCreate();
  return { msg: /AniList neodpovídá/.test(txt), rows, retry };
});
check("avatary: bez AniListu se ukáže hláška + Zkusit znovu a ostatní řady zůstanou", avFail.msg && avFail.retry && avFail.rows >= 3, JSON.stringify(avFail));

// --- Popis s „…“ se po kliknutí rozbalí
const dsT = await page.evaluate(() => {
  const p = document.createElement("p"); p.className = "nf-hero-desc"; p.textContent = "x ".repeat(400); document.body.appendChild(p);
  p.click(); const open = p.classList.contains("is-open"), dsp = getComputedStyle(p).webkitLineClamp; p.click(); const closed = !p.classList.contains("is-open"); p.remove();
  return { open, dsp, closed };
});
check("popis: klik rozbalí celý text a další klik ho sbalí", dsT.open && dsT.closed && (dsT.dsp === "none" || dsT.dsp === "unset"), JSON.stringify(dsT));

// --- Nová verze: lišta se ukáže, jen když server hlásí jinou verzi
const updT = await page.evaluate(async () => {
  const of = window.fetch, cur = window.MF_VERSION; let ver = cur;
  window.fetch = async (u, o) => /js\/core\/version\.js/.test(String(u)) ? { ok: true, text: async () => 'window.MF_VERSION = "' + ver + '";' } : of(u, o);
  await window.mfCheckUpdate(true); const same = !document.getElementById("mfUpdateBar");
  ver = "99.0.0"; await window.mfCheckUpdate(true); const bar = document.getElementById("mfUpdateBar"), shown = !!bar && /99\.0\.0/.test(bar.textContent);
  bar && bar.querySelector(".mf-upd-x").click(); const closed = !document.getElementById("mfUpdateBar");
  window.fetch = of; return { same, shown, closed };
});
check("nová verze: stejná verze = žádná lišta, jiná = lišta s Obnovit, ✕ ji zavře", updT.same && updT.shown && updT.closed, JSON.stringify(updT));

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
  grid.innerHTML = ProfileGate._charRowHtml('<i>t</i>', [{ name: '<img src=x onerror="window.__xss=1">"', url: "https://x.test/a.jpg" }]);
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
    return { badge: badge && badge.textContent, logos: panel ? panel.querySelectorAll('a img').length : 0, badgeLogos: document.querySelectorAll('#legalProvidersBadge img').length, links, unknownHref: unknown && unknown.href, text: panel ? panel.textContent : "" };
  } finally { window.fetch = orig; try { window.MFCinemaPlayer.close(); } catch { /* přehrávač už je zavřený */ } }
});
check("Kde sledovat: odznak ukáže názvy služeb", /Netflix/.test(lp.badge || "") && /Max/.test(lp.badge || ""), JSON.stringify(lp));
check("Kde sledovat: Netflix, Max i neznámá služba jsou v panelu", ["Netflix", "Max", "Neznámá služba"].every(n => lp.links.includes(n)), JSON.stringify(lp.links));
check("Kde sledovat: v panelu i v odznaku jsou loga služeb", lp.logos >= 2 && lp.badgeLogos >= 2, JSON.stringify([lp.logos, lp.badgeLogos]));
check("Kde sledovat: půjčení má vlastní skupinu a neznámá služba odkaz na TMDB", lp.links.includes("Apple TV") && /Půjčit/.test(lp.text) && /themoviedb\.org/.test(lp.unknownHref || ""), JSON.stringify([lp.text.slice(0, 120), lp.unknownHref]));


const epT = await page.evaluate(async () => {
  const orig = window.tmdbGet, slug = "__t_eps";
  db[slug] = { name: "Test", tmdbId: 4242 }; delete tmdbCache[slug + "-S1"]; delete tmdbCache[slug + "-S2"];
  window.tmdbGet = async p => /language=en-US/.test(p)
    ? { episodes: [{ episode_number: 1, name: "The Real Name", still_path: "/s.jpg", runtime: 22, overview: "x", vote_count: 9, vote_average: 8 }, { episode_number: 2, name: "Episode 2", still_path: null, runtime: 0 }] }
    : { episodes: [{ episode_number: 1, name: "Epizoda 1", still_path: null, runtime: 0 }, { episode_number: 2, name: "2. epizoda", still_path: null, runtime: 0 }] };
  try {
    const r = await fetchTmdbSeason(slug, 1);
    return { n1: r[0].name, still: !!r[0].still, rt: r[0].runtime, n2: r[1].name };
  } finally { window.tmdbGet = orig; delete db[slug]; delete tmdbCache[slug + "-S1"]; }
});
check("epizody: chybějící český název a obrázek se doplní z angličtiny (jinak zůstane Epizoda N)", epT.n1 === "The Real Name" && epT.still && epT.rt === 22 && epT.n2 === "2. epizoda", JSON.stringify(epT));

const allT = await page.evaluate(async () => {
  const orig = window.tmdbGet, slug = "__t_all", oa = activeSeries, os = activeSeason, osa = showAllSeasons;
  db[slug] = { name: "Test", tmdbId: 4343, poster: "", _seasonEpCounts: [2, 2], totalEps: 4 };
  [1, 2].forEach(n => delete tmdbCache[slug + "-S" + n]);
  window.tmdbGet = async p => { const m = /season\/(\d)/.exec(p); return { episodes: [1, 2].map(i => ({ episode_number: i, name: "Název S" + m[1] + "E" + i, still_path: "/a.jpg", runtime: 20 })) } };
  try {
    activeSeries = slug; activeSeason = 1; showAllSeasons = true;
    await renderEpisodes(); await new Promise(r => setTimeout(r, 400));
    const cards = [...document.querySelectorAll("#episodesGrid .episode-card")].map(c => c.textContent.replace(/\s+/g, " ").slice(0, 60));
    const heads = [...document.querySelectorAll("#episodesGrid .sd-season-head")].map(h => getComputedStyle(h).gridColumnStart + "/" + getComputedStyle(h).gridColumnEnd);
    const g = document.getElementById("episodesGrid"), cs = [...g.querySelectorAll(".episode-card")];
    return { cards, heads, enter: g.classList.contains("ep-enter"), ci: cs.map(c => c.style.getPropertyValue("--ci")).join(",") };
  } finally { window.tmdbGet = orig; delete db[slug]; [1, 2].forEach(n => delete tmdbCache[slug + "-S" + n]); activeSeries = oa; activeSeason = os; showAllSeasons = osa; }
});
check("epizody: ve „všech sezónách“ mají názvy i druhé a další sezóny", allT.cards.length === 4 && allT.cards.every(t => /Název S/.test(t)) && allT.heads.length === 2 && allT.heads.every(h => h === "1 / -1" || h === "1/-1") && allT.enter && allT.ci === "0,1,2,3", JSON.stringify(allT));

const offT = await page.evaluate(() => {
  Object.defineProperty(navigator, "onLine", { configurable: true, get: () => false });
  window.dispatchEvent(new Event("offline"));
  const s = document.getElementById("mfOfflineScreen");
  const out = { shown: !!s, text: s ? /Jsi offline/.test(s.textContent) : false, top: s ? getComputedStyle(s).position === "fixed" : false };
  s && s.remove(); delete navigator.onLine;
  return out;
});
check("offline: bez internetu se přes vše ukáže obrazovka „Jsi offline“", offT.shown && offT.text && offT.top, JSON.stringify(offT));

const scT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
  mfDiscoverOpen("all"); await w(600);
  const body = document.getElementById("dvBody"), root = document.getElementById("universeOverlay");
  const pad = document.createElement("div"); pad.style.height = "4000px"; body.appendChild(pad);
  body.scrollTop = 300; await w(80); out.down = root.classList.contains("dv-collapsed");
  body.scrollTop = 200; await w(80); out.up = !root.classList.contains("dv-collapsed");
  body.scrollTop = 500; await w(80); out.again = root.classList.contains("dv-collapsed");
  await w(1700); out.idle = !root.classList.contains("dv-collapsed");
  pad.remove(); closeUniverse && closeUniverse(); await w(200);
  const modal = document.getElementById("seriesModal"), hero = modal.querySelector(".modal-hero");
  modal.classList.add("open"); _sdCompact(modal, true);
  out.compact = modal.classList.contains("nf-compact");
  await w(700); out.cleaned = hero.style.height === "" && hero.style.transition === "";
  _sdCompact(modal, false); await w(700); out.back = !modal.classList.contains("nf-compact") && hero.style.height === "";
  modal.classList.remove("open");
  return out;
});
check("scroll: Procházení schová filtry dolů, vrátí je nahoru i po klidu; hlavička seriálu se zmenšuje a vrací bez zbytků stylu", Object.values(scT).every(Boolean), JSON.stringify(scT));

const imgT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)), host = document.createElement("div");
  host.innerHTML = '<div class="episode-card"><div class="ep-thumb"><img alt=""></div></div>';
  document.body.appendChild(host);
  const im = host.querySelector("img"); im.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  await w(200);
  const out = { loaded: im.classList.contains("is-loaded"), fx: document.documentElement.classList.contains("mf-imgfx"), idx: im.style.getPropertyValue("--i") };
  const bad = document.createElement("img"); host.querySelector(".ep-thumb").appendChild(bad); bad.src = "data:image/png;base64,AAAA"; await w(200);
  out.err = bad.classList.contains("is-loaded"); host.remove();
  return out;
});
check("obrázky: po načtení i po chybě se karta rozsvítí (is-loaded), efekt je zapnutý", imgT.loaded && imgT.fx && imgT.err, JSON.stringify(imgT));

const silT = await page.evaluate(() => {
  const row = document.getElementById("sdCastRow"); if (!row) return null;
  _sdArrows(row); row.innerHTML = ""; const ph = document.createElement("div"); ph.className = "sd-actor-photo"; row.appendChild(ph); _sdSilhouette(ph);
  const out = { svg: !!ph.querySelector("svg"), text: ph.textContent.trim() }; row.innerHTML = ""; return out;
});
check("herec bez fotky: anonymní silueta místo písmene", silT && silT.svg && silT.text === "", JSON.stringify(silT));

const sbT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)), bar = document.getElementById("mfSB");
  if (!bar) return { bar: false };
  const sec = document.getElementById("mfSectionHome"); if (!sec) return { bar: true, sec: false };
  const sv = { d: sec.style.cssText, c: document.body.className };
  document.body.classList.remove("modal-open"); sec.style.cssText += ";display:block;position:fixed;inset:0;overflow-y:auto;height:600px";
  const pad = document.createElement("div"); pad.style.height = "5000px"; sec.appendChild(pad);
  sec.scrollTop = 700; sec.dispatchEvent(new Event("scroll")); await w(150);
  const out = { bar: true, shown: bar.style.display !== "none", on: bar.classList.contains("on"), th: bar.firstChild.offsetHeight > 20 };
  await w(1500); out.off = !bar.classList.contains("on");
  pad.remove(); sec.style.cssText = sv.d; return out;
});
check("posuvník stránky: ukáže se při posouvání úvodní stránky, má jezdec a po chvíli zmizí", sbT.bar && sbT.shown && sbT.on && sbT.th && sbT.off, JSON.stringify(sbT));

const tuT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const out = { slug: mfSlugify("Mimoni: Zlodějova příručka!") };
  const slug = Object.keys(db).find(k => !k.startsWith("__") && totalSeasons(k) > 1) || Object.keys(db)[0];
  openSeries(slug); await w(300);
  out.path = location.pathname;
  const box = document.getElementById("sdSeasons");
  out.sbHidden = box && getComputedStyle(box).scrollbarWidth === "none";
  out.arrows = !!(box && box.parentElement.querySelector(".nf-arrow")) || totalSeasons(slug) < 4;
  closeModal(); await w(1000);
  out.after = location.pathname;
  const pp = mfParseTitlePath("/c/dragon-ball-super-s01e03");
  out.parse = pp.slug === "dragon-ball-super" && pp.season === 1 && pp.episode === 3 && mfParseTitlePath("/c/simpsonovi").episode === 1;
  MFCinemaPlayer.open(1399, "Game of Thrones", "tv_ep", { season: 2, episode: 5 }); await w(300);
  out.cin = location.pathname;
  MFCinemaPlayer.close(); await w(1000);
  out.cinAfter = location.pathname;
  return out;
});
check("adresy titulů: slug bez diakritiky, /s/<název> při otevření a zpět na / po zavření", tuT.slug === "mimoni-zlodejova-prirucka" && /^\/s\/[a-z0-9-]+$/.test(tuT.path) && /^\/(index\.html)?$/.test(tuT.after), JSON.stringify(tuT));
check("adresy titulů: /c/<název>-s02e05 pro epizodu v přehrávači, čtení adresy, po zavření /", tuT.parse && tuT.cin === "/c/game-of-thrones-s02e05" && /^\/(index\.html)?$/.test(tuT.cinAfter), JSON.stringify(tuT));
check("řada sezón: bez posuvníku, šipky při víc sezónách", tuT.sbHidden && tuT.arrows, JSON.stringify(tuT));

const backT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const og = window.tmdbGet, oe = window.openDiscoverTv; let opened = null;
  window.tmdbGet = async (u) => /search\/multi/.test(u) ? { results: [{ id: 777, media_type: "tv", name: "Ride On" }] } : og(u);
  window.openDiscoverTv = async (id, n) => { opened = [id, n]; };
  try {
    await mfOpenTitleFromPath("/c/ride-on-s01e08"); await w(300);
    const during = location.pathname;
    MFCinemaPlayer.close(); await w(400);
    return { during, opened };
  } finally { window.tmdbGet = og; window.openDiscoverTv = oe; }
});
check("zavření přehrávače otevřeného odkazem /c/ vede na detail seriálu", backT.during === "/c/ride-on-s01e08" && backT.opened && backT.opened[0] === 777, JSON.stringify(backT));

const arrT = await page.evaluate(async () => {
  const row = document.getElementById("sdCastRow"); if (!row) return null;
  document.getElementById("seriesModal").classList.add("open");
  document.getElementById("sdCastWrap").hidden = false; document.getElementById("sdInfo").hidden = false;
  row.innerHTML = Array.from({ length: 20 }, (_, i) => '<div class="sd-actor" style="flex:0 0 104px;height:60px">A' + i + "</div>").join("");
  _sdArrows(row); await new Promise(r => setTimeout(r, 200));
  const host = row.parentElement, r = host.querySelector(".nf-arrow-r"), l = host.querySelector(".nf-arrow-l");
  const out = { hasR: !!r, rShown: r && !r.hidden, lHidden: l && l.hidden, bar: getComputedStyle(row).scrollbarWidth };
  document.getElementById("seriesModal").classList.remove("open"); row.innerHTML = "";
  return out;
});
check("detail: řada herců má šipky (vpravo viditelná, vlevo ne) a bez posuvníku", arrT && arrT.hasR && arrT.rShown && arrT.lHidden && arrT.bar === "none", JSON.stringify(arrT));

const ver = await page.evaluate(() => { MFSettings.open(); const t = document.getElementById("mfVersionLine")?.textContent; document.getElementById("mfBeautifulSettings")?.remove(); return t; });
const pkgVer = JSON.parse((await import("node:fs")).readFileSync("package.json", "utf8")).version;
check("verze v Nastavení = package.json a je tam odkaz na Soukromí a podmínky", ver === "MůjFlix v" + pkgVer + " · Soukromí a podmínky", String(ver) + " vs " + pkgVer);

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


const rs = await page.evaluate(() => {
  const slug = Object.keys(db)[0]; let err = null;
  try { openSeries(slug); renderSeasons(); showAllSeasons = true; renderSeasons(); showAllSeasons = false; renderSeasons(); closeModal(); } catch (e) { err = e.message; }
  return { slug: !!slug, err, pills: !!document.getElementById("seasonPills") };
});
check("série: renderSeasons funguje bez skrytých season pills", rs.slug && rs.err === null && !rs.pills, JSON.stringify(rs));

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
  localStorage.removeItem("mf_avatar_rows_v1");
  const orig = window.fetch;
  window.fetch = async (u) => {
    u = String(u);
    const body = /anilist/.test(u) ? { data: { Page: { characters: [{ name: { full: "Gojo" }, image: { large: "https://s4.anilist.co/g.png" } }] } } }
      : { query: { pages: { 1: { title: "Batman", thumbnail: { source: "https://upload.wikimedia.org/b.jpg" } } } } };
    return { ok: true, json: async () => body };
  };
  ProfileGate.openCreate();
  for (let i = 0; i < 40 && document.querySelectorAll("#pcAvatarGrid .pc-av-row").length < 2; i++) await new Promise(r => setTimeout(r, 100));
  const opts = [...document.querySelectorAll("#pcAvatarGrid .pc-character-option")];
  const out = { n: opts.length, rows: document.querySelectorAll("#pcAvatarGrid .pc-av-row").length, titles: !!document.querySelector("#pcAvatarGrid .pc-av-row h4") };
  opts[0].click(); out.picked = ProfileGate._selectedAvatar;
  window.fetch = orig; localStorage.removeItem("mf_avatar_rows_v1"); return out;
});
check("avatar: výchozí nabídka jsou postavy (anime nahoře, pak seriály, Marvel/DC, filmy), výběr se uloží", av2.n >= 2 && av2.rows >= 2 && /anilist\.co\/g\.png$/.test(av2.picked || ""), JSON.stringify(av2));

const avOrd = await page.evaluate(async () => {
  localStorage.removeItem("mf_avatar_rows_v1");
  const orig = window.fetch, mk = n => ({ query: { pages: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { title: "P" + i, index: i, thumbnail: { source: "https://upload.wikimedia.org/p" + n + "_" + i + ".jpg" } }])) } });
  window.fetch = async u => {
    u = String(u);
    const body = /anilist/.test(u) ? { data: { Page: { characters: [], media: [] } } }
      : /Stranger/.test(decodeURIComponent(u)) ? mk(2) : /Marvel|Spider/.test(decodeURIComponent(u)) ? mk(9) : mk(6);
    return { ok: true, json: async () => body };
  };
  ProfileGate.openCreate();
  for (let i = 0; i < 40 && document.querySelectorAll("#pcAvatarGrid .pc-av-row").length < 5; i++) await new Promise(r => setTimeout(r, 100));
  await new Promise(r => setTimeout(r, 600));
  const titles = [...document.querySelectorAll("#pcAvatarGrid .pc-av-row h4")].map(h => h.textContent);
  window.fetch = orig; localStorage.removeItem("mf_avatar_rows_v1"); ProfileGate.closeCreate && ProfileGate.closeCreate();
  return { titles, ver: document.getElementById("pgVersion").textContent, mv: window.MF_VERSION };
});
check("avatar: nejdřív řady s nejvíc obrázky, řada s 2 obrázky (Stranger Things) se nezobrazí", avOrd.titles[0] === "Marvel" && !avOrd.titles.includes("Stranger Things") && avOrd.titles.length >= 5, JSON.stringify(avOrd));
check("verze aplikace je vpravo dole na obrazovce Kdo se dívá", avOrd.ver.startsWith("v" + avOrd.mv) && /^\d+\.\d+\.\d+$/.test(avOrd.mv), JSON.stringify(avOrd));

const dd = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  openSeries(slug); renderSeasons();
  selectSeasonFromDropdown("2");
  const out = { s: activeSeason, all: showAllSeasons };
  closeModal(); return out;
});
check("série: výběr sezóny změní sezónu", dd.s === 2 && dd.all === false, JSON.stringify(dd));


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
check("zdroje: pořadí seriály SvetSerialu, Bombuj, Uzi.la, NajSerialy, Prehrajto (varianty až za nimi); filmy Bombuj, Uzi.la, Prehrajto", JSON.stringify(uziT) === JSON.stringify([["svetserialu", "bombuj", "uzila", "najserialy", "prehrajto", "najserialy-year"], ["bombuj", "uzila", "prehrajto", "bombuj-noyear"]]), JSON.stringify(uziT));
const uziL = await page.evaluate(() => window.MFCinemaPlayer.sourceLabels("tv", ["Anglický", "Slovenský", "Český"]));
check("zdroje: s víc názvy jdou zdroje popořadě, další názvy Uzi.la a NajSerialy až za Prehrajto", JSON.stringify(uziL.slice(0, 5)) === JSON.stringify(["SvetSerialu", "Bombuj", "Uzi.la (Anglický)", "NajSerialy (Anglický)", "Prehrajto.cz"]) && uziL.slice(5).every(l => /^(Uzi\.la|NajSerialy)/.test(l)) && uziL.length === 12, JSON.stringify(uziL));

await page.evaluate(() => history.pushState(null, "", "#filmy"));
await page.waitForTimeout(400);
const hashT = await page.evaluate(() => location.hash);
check("adresa: #hash se po přepnutí sekce odstraní", hashT === "", JSON.stringify(hashT));

const dockT = await page.evaluate(() => {
  ["cinemaModal", "mfStandaloneCinema", "universeOverlay", "watchlistOverlay", "seriesModal", "genreEditorOverlay", "wrappedOverlay", "dockMoreSheet", "mfhSeeAllModal"].forEach(id => document.getElementById(id)?.classList.remove("open", "visible", "show"));
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
    const body = /tvmaze\.com\/search/.test(u) ? [{ show: { id: 5, name: "Breaking Bad" } }]
      : /tvmaze\.com\/shows/.test(u) ? [{ character: { name: "Walter White", image: { medium: "http://static.tvmaze.com/w.jpg" } } }]
      : /superhero/.test(u) ? [{ name: "Walter Kovacs", biography: { publisher: "DC Comics" }, images: { md: "https://cdn.x/b.jpg" } }]
      : /fandom\.com.*Search\/List/.test(u) ? { items: [{ id: 7 }] }
      : /fandom\.com.*Articles\/Details/.test(u) ? { items: { 7: { title: "Michael Scott", thumbnail: "https://static.wikia.nocookie.net/m.png" } } }
      : /query\.wikidata/.test(u) ? { results: { bindings: [{ itemLabel: { value: "Walter Skinner" }, image: { value: "http://commons.wikimedia.org/wiki/Special:FilePath/S.jpg" } }] } }
      : /disneyapi/.test(u) ? { data: [{ name: "Elsa", imageUrl: "https://static.wikia.nocookie.net/e.png" }] }
      : /anilist/.test(u) ? { data: { Page: { characters: [{ name: { full: "Naruto Uzumaki" }, image: { large: "https://s4.anilist.co/n.png" }, media: { nodes: [{ title: { english: "Naruto" } }] } }] } } }
      : { query: { pages: { 1: { index: 1, title: "Walter White", thumbnail: { source: "https://upload.wikimedia.org/w.jpg" } } } } };
    return { ok: true, json: async () => body };
  };
  ProfileGate.openCreate();
  for (let i = 0; i < 40 && document.querySelectorAll("#pcAvatarGrid .pc-av-row").length < 2; i++) await new Promise(r => setTimeout(r, 100));
  await ProfileGate._searchAvatarTitles("walter");
  const opts = [...document.querySelectorAll("#pcAvatarGrid .pc-character-option")];
  const names = opts.map(o => o.dataset.name);
  opts[0].click();
  const out = { names, picked: ProfileGate._selectedAvatar };
  window.fetch = orig; ProfileGate.closeCreate(); return out;
});
check("avatar: hledání nabídne postavy z AniList a Wikipedie a vybere je", ["Naruto Uzumaki", "Walter White", "Elsa", "Michael Scott", "Walter Skinner"].every(n => charT.names.includes(n)) && charT.names.some(n => /^Walter Kovacs/.test(n)) && /tvmaze\.com\/w\.jpg$/.test(charT.picked || ""), JSON.stringify(charT));

const pinAv = await page.evaluate(() => {
  ProfileGate._setPinAvatar("https://s4.anilist.co/x.png");
  const a = document.querySelector("#pmAvatar img");
  const ok1 = !!a && a.getAttribute("src") === "https://s4.anilist.co/x.png" && document.getElementById("pmAvatar").textContent === "";
  ProfileGate._setPinAvatar("🦊");
  const ok2 = !document.querySelector("#pmAvatar img") && document.getElementById("pmAvatar").textContent === "🦊";
  ProfileGate._setPinAvatar("🎬");
  return { ok1, ok2, badge: getComputedStyle(document.getElementById("mfProfileBadge") || document.body).display };
});
check("PIN: obrázkový avatar se vykreslí jako obrázek, emoji jako text; starý odznak je skrytý", pinAv.ok1 && pinAv.ok2 && pinAv.badge === "none", JSON.stringify(pinAv));

const lockT = await page.evaluate(() => {
  const id = ProfileGate.createProfile({ name: "LockT", avatar: "🎬", color: "#007aff", pin: "1234" });
  const prof = _getProfiles().find(p => p.id === id);
  localStorage.removeItem("mf_pin_lock");
  ProfileGate.openPin(prof);
  const wrong = () => { ProfileGate._pinBuffer = "0000"; ProfileGate._checkPin(); return document.getElementById("pmMsg").textContent; };
  const m1 = wrong(), m4 = (wrong(), wrong(), wrong());
  const m5 = wrong();
  const st1 = ProfileGate._pinState(); const left1 = ProfileGate._pinLockLeft();
  ProfileGate._pinBuffer = ""; ProfileGate.pinInput("1");
  const blocked = ProfileGate._pinBuffer === "";
  // vypršení zámku → znovu 5 pokusů, další zámek je delší
  ProfileGate._pinSave({ ...st1, until: Date.now() - 1000 });
  for (let i = 0; i < 4; i++) wrong();
  wrong();
  const st2 = ProfileGate._pinState(); const left2 = ProfileGate._pinLockLeft();
  ProfileGate._pinSave({ ...st2, until: 0 });
  ProfileGate._pinBuffer = "1234"; ProfileGate._checkPin();
  const reset = ProfileGate._pinState();
  ProfileGate.closePin(); localStorage.removeItem("mf_pin_lock");
  const all = _getProfiles().filter(p => p.id !== id); _saveProfiles(all);
  return { m1, m4, m5, level1: st1.level, left1, blocked, level2: st2.level, longer: left2 > left1, resetOk: reset.level === 0 && reset.fails === 0 };
});
check("PIN: po špatném pokusu zbývající počet, po 5. zámek, který se stupňuje; správný PIN ho nuluje", /Zbývá 4 pokusy/.test(lockT.m1) && /Zbývá 1 pokus$/.test(lockT.m4) && /Zkus to znovu za 0:\d\d/.test(lockT.m5) && lockT.level1 === 1 && lockT.left1 > 0 && lockT.blocked && lockT.level2 === 2 && lockT.longer && lockT.resetOk, JSON.stringify(lockT));

const menuT = await page.evaluate(() => {
  const a = ProfileGate.createProfile({ name: "MenuA", avatar: "🎬", color: "#007aff", pin: null });
  const b = ProfileGate.createProfile({ name: "MenuB", avatar: "🦊", color: "#ff6b6b", pin: null });
  localStorage.setItem("mf_active_pid", a);
  document.getElementById("mfProfileGate").style.display = "none";
  mfToggleProfileMenu(document.getElementById("nfAvatar"));
  const m = document.getElementById("nfProfileMenu");
  const out = { open: !!m, others: [...m.querySelectorAll("[data-pid]")].map(x => x.dataset.pid), acts: [...m.querySelectorAll("[data-act]")].map(x => x.dataset.act) };
  m.querySelector("[data-act=settings]").click();
  out.hubRows = [...document.querySelectorAll("#mfSettingsModal [data-st]")].map(x => x.dataset.st).filter(x => x !== "close").join();
  out.hubSub = document.querySelector('#mfSettingsModal [data-st="sync"] small').textContent;
  document.querySelector('#mfSettingsModal [data-st="profile"]').click();
  out.hubClosed = !document.getElementById("mfSettingsModal").classList.contains("show");
  out.menuClosed = !document.getElementById("nfProfileMenu");
  out.title = document.getElementById("pcModalTitle").textContent;
  out.save = document.querySelector("#mfProfileCreate .pc-btn-save").textContent;
  out.name = document.getElementById("pcName").value;
  out.del = document.getElementById("pcDeleteBtn").style.display !== "none";
  ProfileGate.closeCreate();
  // správa profilů: bez třesení, klik na avatar otevře úpravu
  ProfileGate.show(); ProfileGate.toggleManageMode();
  const item = document.querySelector('.pg-profile-item[data-profile-id="' + b + '"]');
  const av = item.querySelector(".pg-avatar");
  out.anim = getComputedStyle(av).animationName;
  out.overlay = !!item.querySelector(".pg-edit-overlay");
  const rm = item.querySelector(".pg-remove-btn");
  out.rmSize = rm.offsetWidth;
  item.click();
  out.editTitle = document.getElementById("pcModalTitle").textContent;
  out.editName = document.getElementById("pcName").value;
  ProfileGate.closeCreate(); ProfileGate._manageMode = false;
  document.getElementById("mfProfileGate").style.display = "none";
  _saveProfiles(_getProfiles().filter(p => p.id !== a && p.id !== b));
  return out;
});
check("menu profilu: přepnutí, Upravit profil (stejná obrazovka, jiný nadpis), Spravovat profily", menuT.open && menuT.others.length >= 1 && menuT.acts.join() === "manage,settings" && menuT.hubRows === "profile,prefs,sync" && menuT.hubClosed && /nepropojeno|Propojeno/.test(menuT.hubSub) && menuT.menuClosed && menuT.title === "Uprav si svůj profil" && /Uložit změny/.test(menuT.save) && menuT.name === "MenuA" && menuT.del, JSON.stringify(menuT));
check("Kdo se dívá → Upravit: bez třesení, tužka na avataru, velké červené mínus, klik otevře úpravu", menuT.anim === "none" && menuT.overlay && menuT.rmSize >= 36 && menuT.editTitle === "Uprav si svůj profil" && menuT.editName === "MenuB", JSON.stringify(menuT));

const cinOrder = await page.evaluate(() => {
  MFCinemaPlayer.open(1, "X", "tv", { season: 1, episode: 1 });
  const ids = [...document.querySelectorAll("#mfStandaloneCinema .mf-standalone-cinema-top .mf-cin-actions > button")].map(b => b.id).filter(Boolean);
  MFCinemaPlayer.close(); return ids;
});
check("kino: srdce je až za hvězdou", cinOrder.indexOf("mfCinRateBtn") > -1 && cinOrder.indexOf("mfCinFavBtn") === cinOrder.indexOf("mfCinRateBtn") + 1, JSON.stringify(cinOrder));

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


// --- Propojení zařízení (Worker podvržen v paměti)
await page.evaluate(() => {
  window.__origProxy = window.TMDB_PROXY_URL;
  window.TMDB_PROXY_URL = "https://w.workers.dev";
  const kv = window.__kv = { codes: {}, data: {}, n: 0 };
  const nativeFetch = window.fetch;
  window.fetch = async (url, init) => {
    if (typeof url !== "string" || !url.startsWith("https://w.workers.dev/sync/")) return nativeFetch(url, init);
    const body = JSON.parse(init.body), route = url.slice("https://w.workers.dev".length);
    const out = (o, st = 200) => new Response(JSON.stringify(o), { status: st });
    if (route === "/sync/code") { const c = "K7M4QX"; kv.codes[c] = body.id; return out({ code: c, ttl: 600 }); }
    if (route === "/sync/join") { const id = kv.codes[body.code]; if (!id) return out({ error: "Unknown code" }, 404); delete kv.codes[body.code]; return out({ id }); }
    if (route === "/sync/pull") return out({ data: kv.data[body.id] ? JSON.parse(kv.data[body.id]) : null });
    if (route === "/sync/push") { kv.n++; kv.data[body.id] = JSON.stringify(body.data); return out({ ok: true }); }
    return out({}, 404);
  };
});
const sy = await page.evaluate(async () => {
  const out = {};
  const PK = "mf_profiles_v2";
  const clear = () => { Object.keys(localStorage).filter(k => k.startsWith("mf_")).forEach(k => localStorage.removeItem(k)); };
  clear();
  localStorage.setItem(PK, JSON.stringify([{ id: "p_A", name: "Anna", created: 1000 }]));
  localStorage.setItem("mf_watched_p_A", JSON.stringify({ "x-S1-E1": true }));
  localStorage.setItem("mf_tmdb_key", "SECRET");
  localStorage.setItem("mf_pin_lock", "{}");
  const r = await MFSync.createCode();
  out.code = r.code; out.linkedA = MFSync.isLinked();
  const blob = JSON.parse(Object.values(__kv.data)[0]);
  out.keys = Object.keys(blob.keys).sort();
  const snapA = Object.assign({}, localStorage);
  // zařízení B
  clear(); localStorage.removeItem("mf_sync_id");
  localStorage.setItem(PK, JSON.stringify([{ id: "p_B", name: "Bob", created: 2000 }]));
  localStorage.setItem("mf_watched_p_B", JSON.stringify({ "y-S1-E1": true }));
  const bad = await MFSync.join("ZZZZZZ").then(() => "ok", e => e.code);
  out.badCode = bad;
  const j = await MFSync.join(r.code);
  out.changedB = j.changed;
  out.profilesB = JSON.parse(localStorage.getItem(PK)).map(p => p.id).sort();
  out.watchedAB = !!localStorage.getItem("mf_watched_p_A") && !!localStorage.getItem("mf_watched_p_B");
  // B změní data a smaže profil Anna
  localStorage.setItem("mf_watched_p_B", JSON.stringify({ "y-S1-E1": true, "y-S1-E2": true }));
  localStorage.setItem(PK, JSON.stringify([{ id: "p_B", name: "Bob", created: 2000 }]));
  await new Promise(r => setTimeout(r, 20));
  await MFSync.syncNow({ reload: false });
  const remote = JSON.parse(Object.values(__kv.data)[0]);
  out.remoteWatchedB = remote.keys["mf_watched_p_B"] && remote.keys["mf_watched_p_B"].v.includes("E2");
  out.tomb = !!remote.del["p_A"];
  // zpět na A: stáhne změny z B
  clear(); Object.entries(snapA).forEach(([k, v]) => { if (k.startsWith("mf_")) localStorage.setItem(k, v); });
  const back = await MFSync.syncNow({ reload: false });
  out.changedA = back.changed;
  out.profilesA = JSON.parse(localStorage.getItem(PK)).map(p => p.id).sort();
  out.watchedBonA = (localStorage.getItem("mf_watched_p_B") || "").includes("E2");
  out.secretKept = localStorage.getItem("mf_tmdb_key") === "SECRET";
  out.nsync = { key: MFSync._syncable("mf_tmdb_key"), anthropic: MFSync._syncable("mf_anthropic_key"), pin: MFSync._syncable("mf_pin_lock"), active: MFSync._syncable("mf_active_pid"), ok: MFSync._syncable("mf_watched_p_A") };
  return out;
});
check("sync: kód a ID vzniknou, klíče se nahrají bez tajných věcí", /^[A-Z0-9]{6}$/.test(sy.code) && sy.linkedA && sy.keys.includes("mf_watched_p_A") && !sy.keys.includes("mf_tmdb_key") && !sy.keys.includes("mf_pin_lock"), JSON.stringify(sy.keys));
check("sync: špatný kód se odmítne", sy.badCode === "unknown", String(sy.badCode));
check("sync: druhé zařízení má profily a data obou stran", sy.profilesB.join() === "p_A,p_B" && sy.watchedAB && sy.changedB, JSON.stringify(sy));
check("sync: změna a smazání profilu se pošle dál", sy.remoteWatchedB && sy.tomb);
check("sync: první zařízení dostane změny, smazaný profil zmizí, tajný klíč zůstane", sy.changedA && sy.profilesA.join() === "p_B" && sy.watchedBonA && sy.secretKept, JSON.stringify(sy));
check("sync: filtr klíčů", sy.nsync.ok && !sy.nsync.key && !sy.nsync.anthropic && !sy.nsync.pin && !sy.nsync.active, JSON.stringify(sy.nsync));

// --- Sloučení při souběžné změně na dvou zařízeních (nic se neztratí, smazání se přenese)
const mgT = await page.evaluate(async () => {
  const out = {}, W = "mf_watched_p_A", id = localStorage.getItem("mf_sync_id");
  const remoteSet = (v, dt) => { const b = JSON.parse(__kv.data[id]); b.keys[W] = { v: JSON.stringify(v), t: Date.now() + dt }; __kv.data[id] = JSON.stringify(b); };
  const remoteGet = () => JSON.parse(JSON.parse(__kv.data[id]).keys[W].v);
  localStorage.setItem(W, JSON.stringify({ a: true })); await MFSync.syncNow({ reload: false });
  // druhé zařízení přidá b, my mezitím offline přidáme c
  remoteSet({ a: true, b: true }, 5000);
  localStorage.setItem(W, JSON.stringify({ a: true, c: true }));
  await MFSync.syncNow({ reload: false });
  out.local1 = Object.keys(JSON.parse(localStorage.getItem(W))).sort().join();
  out.remote1 = Object.keys(remoteGet()).sort().join();
  // druhé zařízení smaže b, my přidáme d
  remoteSet({ a: true, c: true }, 9000);
  localStorage.setItem(W, JSON.stringify({ a: true, b: true, c: true, d: true }));
  await MFSync.syncNow({ reload: false });
  out.local2 = Object.keys(JSON.parse(localStorage.getItem(W))).sort().join();
  out.remote2 = Object.keys(remoteGet()).sort().join();
  // čistá funkce: seznam podle slug, pořadí a smazání
  const m = MFSync._mergeValue(JSON.stringify([{ slug: "x" }, { slug: "y" }]), JSON.stringify([{ slug: "x" }, { slug: "y" }, { slug: "l" }]), JSON.stringify([{ slug: "y" }, { slug: "r" }]), "r");
  out.list = JSON.parse(m).map(x => x.slug).join();
  out.notMergeable = MFSync._mergeValue("1", "\"a\"", "[1]", "r");
  return out;
});
check("sync: souběžné změny na dvou zařízeních se sloučí (přidání na obou stranách zůstane)", mgT.local1 === "a,b,c" && mgT.remote1 === "a,b,c", JSON.stringify(mgT));
check("sync: smazání na jednom zařízení se přenese a přidání na druhém zůstane", mgT.local2 === "a,c,d" && mgT.remote2 === "a,c,d", JSON.stringify(mgT));
check("sync: seznam podle slug se slučuje (x smazáno vzdáleně, l a r zůstanou), nesloučitelné hodnoty vrátí null", mgT.list === "y,r,l" && mgT.notMergeable === null, JSON.stringify(mgT));

// UI propojení
await page.evaluate(() => { MFSync.unlink(); MFSyncUI.close(); });
const syUi = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  MFSyncUI.open("home");
  const m = document.getElementById("mfSyncModal");
  out.homeShown = m.classList.contains("show") && m.querySelectorAll(".sy-choice").length === 2 && /Zobrazit kód/.test(m.textContent) && /Mám kód/.test(m.textContent);
  m.querySelector('[data-sa="show"]').click(); await wait(700);
  out.code = (document.getElementById("syCode") || {}).textContent;
  out.qr = !!document.querySelector("#syQr svg");
  out.timer = /platí ještě/.test((document.getElementById("syTimer") || {}).textContent || "");
  document.querySelector('[data-sa="home"]').click();
  out.linkedHome = /propojené/.test(m.textContent) && !!m.querySelector('[data-sa="unlink"]');
  MFSync.unlink(); MFSyncUI.open("enter");
  const inp = document.getElementById("mfSyncInput"); inp.value = "abcdef"; inp.dispatchEvent(new Event("input"));
  out.fmt = inp.value;
  inp.value = "QQQ QQQ"; document.getElementById("syJoin").click(); await wait(200);
  out.err = (document.getElementById("syMsg") || {}).textContent;
  MFSyncUI.close();
  out.closed = !m.classList.contains("show");
  return out;
});
check("sync UI: úvodní volby, kód + QR + odpočet, propojený stav", syUi.homeShown && /^[A-Z0-9]{3} [A-Z0-9]{3}$/.test(syUi.code) && syUi.qr && syUi.timer && syUi.linkedHome, JSON.stringify(syUi));
check("sync UI: zadání kódu formátuje a hlásí neplatný kód, zavře se", syUi.fmt === "ABC DEF" && /neplatí/.test(syUi.err) && syUi.closed, JSON.stringify(syUi));

// vstupy a kroky onboardingu
const syEnt = await page.evaluate(() => {
  const out = {};
  out.gateBtn = !!document.getElementById("profileSyncBtn");
  MFSync.unlink();
  ProfileGate.openOnboarding("p_x");
  out.k3 = document.querySelector('#mfProfileWelcome [data-ob-step="1"]').textContent;
  ProfileGate.finishOnboarding();
  out.btn2 = document.getElementById("pwStep2Btn").textContent;
  ProfileGate.onboardingNext();
  out.step3 = document.getElementById("pwStep3").style.display !== "none" && /jinde/.test(document.getElementById("pwStep3").textContent);
  ProfileGate.closeOnboarding();
  // už propojeno → 2 kroky
  localStorage.setItem("mf_sync_id", "x".repeat(32));
  ProfileGate.openOnboarding("p_x");
  out.k2 = document.querySelector('#mfProfileWelcome [data-ob-step="1"]').textContent;
  ProfileGate.finishOnboarding();
  out.btn2b = document.getElementById("pwStep2Btn").textContent;
  ProfileGate.onboardingNext();
  out.closed = !document.getElementById("mfProfileWelcome").classList.contains("show");
  MFSync.unlink();
  return out;
});
check("onboarding: nepropojeno = 3 kroky s krokem Propojení", syEnt.k3.endsWith("1/3") && syEnt.btn2 === "Pokračovat" && syEnt.step3, JSON.stringify(syEnt));
check("onboarding: propojeno = 2 kroky", syEnt.k2.endsWith("1/2") && syEnt.btn2b === "Začít sledovat" && syEnt.closed, JSON.stringify(syEnt));
check("sync: tlačítko v Kdo se dívá", syEnt.gateBtn);
const syMenu = await page.evaluate(() => { window.mfToggleProfileMenu(document.getElementById("nfAvatar")); document.querySelector('#nfProfileMenu [data-act="settings"]').click(); const it = document.querySelector('#mfSettingsModal [data-st="sync"]'); const ok = !!it; if (it) it.click(); const shown = document.getElementById("mfSyncModal")?.classList.contains("show"); MFSyncUI.close(); return { ok, shown }; });
check("sync: položka v menu profilu otevře obrazovku", syMenu.ok && syMenu.shown, JSON.stringify(syMenu));


// --- Průběžná synchronizace: nový profil z jiného zařízení se objeví bez obnovení, ostatní změny nabídnou „Načíst změny“
const sy2 = await page.evaluate(async () => {
  const out = {}, PK = "mf_profiles_v2";
  Object.keys(localStorage).filter(k => k.startsWith("mf_")).forEach(k => localStorage.removeItem(k));
  __kv.codes = {}; __kv.data = {};
  localStorage.setItem(PK, JSON.stringify([{ id: "p_A", name: "Anna", created: 1000 }]));
  localStorage.setItem("mf_watched_p_A", JSON.stringify({ a: true }));
  localStorage.setItem("mf_active_pid", "p_A");
  await MFSync.createCode();
  const id = localStorage.getItem("mf_sync_id");
  const edit = fn => { const b = JSON.parse(__kv.data[id]); fn(b); __kv.data[id] = JSON.stringify(b); };
  // jiné zařízení přidalo profil
  await new Promise(r => setTimeout(r, 30));
  edit(b => { b.keys[PK] = { v: JSON.stringify([{ id: "p_A", name: "Anna", created: 1000 }, { id: "p_C", name: "Cyril", created: 3000 }]), t: Date.now() }; });
  ProfileGate.show();
  await MFSync.syncNow({ mode: "poll" });
  out.names = [...document.querySelectorAll("#pgProfilesList .pg-name")].map(x => x.textContent);
  out.noBanner1 = !document.getElementById("mfSyncBanner");
  // jiné zařízení změnilo data aktivního profilu
  edit(b => { b.keys["mf_watched_p_A"] = { v: JSON.stringify({ a: true, b: true }), t: Date.now() }; });
  await MFSync.syncNow({ mode: "poll" });
  out.banner = !!document.getElementById("mfSyncBanner");
  out.applied = (localStorage.getItem("mf_watched_p_A") || "").includes('"b"');
  // změna profilů se posílá rychle (do ~6 s + rezerva), ne až po minutách
  const before = __kv.n;
  await new Promise(r => setTimeout(r, 30));
  localStorage.setItem(PK, JSON.stringify([{ id: "p_A", name: "Anna2", created: 1000 }, { id: "p_C", name: "Cyril", created: 3000 }]));
  await new Promise(r => setTimeout(r, 11500));
  out.fastPush = __kv.n > before;
  document.getElementById("mfSyncBanner")?.remove();
  MFSync.unlink();
  return out;
});
check("sync: nový profil z jiného zařízení se objeví hned (bez obnovení)", sy2.names.includes("Cyril") && sy2.noBanner1, JSON.stringify(sy2));
check("sync: ostatní změny se načtou a nabídne se „Načíst změny“", sy2.banner && sy2.applied, JSON.stringify(sy2));
check("sync: změna profilu se odešle do ~10 s", sy2.fastPush, JSON.stringify(sy2));

await page.evaluate(() => { if (window.__origProxy === undefined) delete window.TMDB_PROXY_URL; else window.TMDB_PROXY_URL = window.__origProxy; });
// Staré dlaždicové menu je pryč, nic nespouští trailer se zvukem na pozadí a data vestavěných seriálů se doplňují dál
const trl = await page.evaluate(() => ({
  tiles: document.querySelectorAll(".ps-tile-wrapper, #mainMenu").length,
  trailer: document.querySelectorAll(".tile-trailer, iframe[src*='youtube']").length,
  enrich: typeof loadTmdbDbData === "function",
}));
check("úklid: žádné staré dlaždice ani trailer na pozadí, doplnění dat seriálů zůstalo", trl.tiles === 0 && trl.trailer === 0 && trl.enrich, JSON.stringify(trl));
const enr = await page.evaluate(async () => {
  const keep = window.fetchTmdbDetails, k = Object.keys(db)[0], bak = { b: db[k]._backdrop, p: db[k]._poster };
  window.fetchTmdbDetails = async () => ({ backdrop: "https://x/b.jpg", poster: "https://x/p.jpg", rating: 8, genres: [{ name: "Komedie" }] });
  try { await loadTmdbDbData(); } finally { window.fetchTmdbDetails = keep; }
  const r = { b: db[k]._backdrop, p: db[k]._poster, g: (db[k]._genres || []).join() };
  db[k]._backdrop = bak.b; db[k]._poster = bak.p; return r;
});
check("úklid: vestavěným seriálům se z TMDB doplní obrázky a žánry i bez dlaždic", enr.b === "https://x/b.jpg" && enr.p === "https://x/p.jpg" && enr.g === "Komedie", JSON.stringify(enr));

// --- Kino: „Další epizoda“ nespadne, když je TMDB nedostupné
const nxt = await page.evaluate(async () => {
  const nf = window.fetch;
  window.fetch = (u, i) => (typeof u === "string" && u.includes("api.themoviedb.org")) ? Promise.reject(new Error("offline")) : nf(u, i);
  try {
    MFCinemaPlayer.open("424242", "Nějaký seriál", "tv_ep", { season: 1, episode: 1 });
    document.getElementById("mfCinNextEp").click();
    await new Promise(r => setTimeout(r, 300));
    return document.getElementById("mfCinEpCurrent").textContent;
  } finally { window.fetch = nf; MFCinemaPlayer.close(); }
});
check("kino: Další epizoda funguje i bez TMDB", /S01 · E02/.test(nxt), nxt);


// --- Paměť zdrojů: „Nefunguje to“, rychlé přepnutí, zapamatování funkčního zdroje
const mem = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  localStorage.removeItem("mf_src_pref");
  const label = () => document.getElementById("mfCinSrcLabel").textContent.replace(/\s*\(\d+\/\d+\)\s*$/, "");
  const real = Date.now;
  MFCinemaPlayer.open("777001", "Paměť test", "movie", {});
  await wait(50);
  out.first = label();
  document.getElementById("mfCinBadSrc").click(); await wait(50);
  out.afterBad = label();
  const pref = JSON.parse(localStorage.getItem("mf_src_pref") || "{}")["movie:777001"];
  out.badStored = !!(pref && pref.bad && pref.bad[out.first]);
  // na druhém zdroji zůstane „dlouho“ → zavření ho uloží jako funkční
  Date.now = () => real() + 61000;
  MFCinemaPlayer.close(); Date.now = real;
  const pref2 = JSON.parse(localStorage.getItem("mf_src_pref") || "{}")["movie:777001"];
  out.goodStored = pref2 && pref2.good === out.afterBad;
  // znovu otevřít: začne funkčním zdrojem, ne tím nefunkčním
  MFCinemaPlayer.open("777001", "Paměť test", "movie", {}); await wait(50);
  out.reopen = label();
  // rychlé „Jiný zdroj“ označí aktuální jako nefunkční a přeskočí nefunkční
  document.getElementById("mfCinSwitchSrc").click(); await wait(50);
  const pref3 = JSON.parse(localStorage.getItem("mf_src_pref") || "{}")["movie:777001"];
  out.quickBad = !!(pref3.bad[out.afterBad]);
  out.skipsBad = label() !== out.first && label() !== out.afterBad;
  MFCinemaPlayer.close();
  // označení nefunkčního po 14 dnech vyprší
  const all = JSON.parse(localStorage.getItem("mf_src_pref")); all["movie:777001"].bad = { [out.first]: Date.now() - 15 * 24 * 3600 * 1000 }; all["movie:777001"].good = "";
  localStorage.setItem("mf_src_pref", JSON.stringify(all));
  MFCinemaPlayer.open("777001", "Paměť test", "movie", {}); await wait(50);
  out.expired = label() === out.first;
  MFCinemaPlayer.close();
  return out;
});
check("zdroje: Nefunguje to označí zdroj a přepne na další", mem.badStored && mem.afterBad !== mem.first, JSON.stringify(mem));
check("zdroje: delší sledování uloží zdroj jako funkční a příště se začne jím", mem.goodStored && mem.reopen === mem.afterBad, JSON.stringify(mem));
check("zdroje: rychlé přepnutí označí zdroj, nefunkční se přeskakují, po 14 dnech vyprší", mem.quickBad && mem.skipsBad && mem.expired, JSON.stringify(mem));


// --- Sdílená paměť zdrojů (Worker): nápověda pro začátek, vlastní zkušenost má přednost, hlášení jednou za titul
const shr = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)), real = Date.now, nf = window.fetch, oldUrl = window.TMDB_PROXY_URL;
  const label = () => document.getElementById("mfCinSrcLabel").textContent.replace(/\s*\(\d+\/\d+\)\s*$/, "");
  const reset = () => { ["mf_src_pref", "mfx_src_shared", "mfx_src_reported", "mfx_src_share_off"].forEach(k => localStorage.removeItem(k)); };
  const calls = []; let sharedLabel = "";
  window.TMDB_PROXY_URL = "https://test.workers.dev";
  window.fetch = (u, i) => {
    if (typeof u === "string" && u.startsWith("https://test.workers.dev/src/")) {
      const b = JSON.parse(i.body); calls.push({ p: u.slice(-4), key: b.key, label: b.label });
      return Promise.resolve(new Response(JSON.stringify(u.endsWith("/get") ? { label: sharedLabel, n: 3 } : { ok: true }), { status: 200 }));
    }
    return nf(u, i);
  };
  try {
    reset();
    MFCinemaPlayer.open("777009", "Zjisti zdroje", "movie", {}); await wait(50);
    out.L1 = label(); document.getElementById("mfCinSwitchSrc").click(); await wait(50);
    out.L2 = label(); MFCinemaPlayer.close(); reset(); calls.length = 0;
    sharedLabel = out.L2;
    // 1) odpověď z Workeru dorazí brzy → začne se sdíleným zdrojem
    MFCinemaPlayer.open("777004", "Sdíleno", "movie", {}); await wait(150);
    out.async = label(); MFCinemaPlayer.close();
    // 2) příště už jde z cache (bez dotazu)
    const before = calls.filter(c => c.p === "/get").length;
    MFCinemaPlayer.open("777004", "Sdíleno", "movie", {}); await wait(50);
    out.cached = label(); out.noRefetch = calls.filter(c => c.p === "/get").length === before; MFCinemaPlayer.close();
    // 3) vlastní zkušenost má přednost před sdíleným
    reset(); localStorage.setItem("mfx_src_shared", JSON.stringify({ "movie:777005": { label: out.L2, t: Date.now() } }));
    localStorage.setItem("mf_src_pref", JSON.stringify({ "movie:777005": { good: out.L1, bad: {}, t: Date.now() } }));
    MFCinemaPlayer.open("777005", "Vlastní", "movie", {}); await wait(50);
    out.ownWins = label() === out.L1; MFCinemaPlayer.close();
    // 4) funkční zdroj se nahlásí jednou
    reset(); calls.length = 0; sharedLabel = "";
    for (let i = 0; i < 2; i++) {
      MFCinemaPlayer.open("777006", "Hlášení", "movie", {}); await wait(50);
      Date.now = () => real() + 61000; MFCinemaPlayer.close(); Date.now = real;
    }
    const rep = calls.filter(c => c.p === "port");
    out.reports = rep.length; out.repKey = rep[0] && rep[0].key; out.repLabel = rep[0] && rep[0].label;
    // 5) vypnuto: žádná komunikace
    reset(); localStorage.setItem("mfx_src_share_off", "1"); calls.length = 0;
    MFCinemaPlayer.open("777007", "Vypnuto", "movie", {}); await wait(100);
    Date.now = () => real() + 61000; MFCinemaPlayer.close(); Date.now = real;
    out.offCalls = calls.length;
    // 6) nedostupný Worker nic nerozbije
    reset(); window.fetch = (u, i) => (typeof u === "string" && u.includes("/src/")) ? Promise.reject(new Error("offline")) : nf(u, i);
    try { MFCinemaPlayer.open("777008", "Offline", "movie", {}); await wait(100); out.offlineOk = !!label(); } catch { out.offlineOk = false; }
    MFCinemaPlayer.close();
  } finally { Date.now = real; window.fetch = nf; window.TMDB_PROXY_URL = oldUrl; reset(); }
  return out;
});
check("sdílené zdroje: zdroj od ostatních se použije na začátku i z cache (bez dalšího dotazu)", shr.L1 !== shr.L2 && shr.async === shr.L2 && shr.cached === shr.L2 && shr.noRefetch, JSON.stringify(shr));
check("sdílené zdroje: vlastní zkušenost má přednost", shr.ownWins, JSON.stringify(shr));
check("sdílené zdroje: funkční zdroj se nahlásí jen jednou (titul + název zdroje)", shr.reports === 1 && shr.repKey === "movie:777006" && !!shr.repLabel, JSON.stringify(shr));
check("sdílené zdroje: po vypnutí se nic neposílá, výpadek Workeru nic nerozbije", shr.offCalls === 0 && shr.offlineOk, JSON.stringify(shr));


// --- Zaměření a žánry (menu profilu) a „Jen anime“ při zakládání profilu
const pfT = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  const id = getActiveProfileId(), ps0 = _getProfiles(), bak = JSON.stringify(ps0.find(x => x.id === id));
  const prof = () => _getProfiles().find(x => x.id === id);
  const reset = () => { const ps = _getProfiles(), p = ps.find(x => x.id === id); p.prefs = { ...p.prefs }; delete p.prefs.animeOnly; p.prefs.likesAnime = false; p.likedGenres = []; _saveProfiles(ps); };
  const click = (a, v) => document.querySelector('#mfPrefsModal [data-pf="' + a + '"]' + (v ? '[data-v="' + v + '"]' : "")).click();
  try {
    reset();
    mfToggleProfileMenu(document.getElementById("nfAvatar")); await wait(50);
    out.menuItem = !!document.querySelector('#nfProfileMenu [data-act="settings"]');
    document.querySelector('#nfProfileMenu [data-act="settings"]').click(); await wait(30);
    out.hubSub = document.querySelector('#mfSettingsModal [data-st="prefs"] small').textContent;
    document.querySelector('#mfSettingsModal [data-st="prefs"]').click(); await wait(50);
    out.opened = document.getElementById("mfPrefsModal").classList.contains("show");
    out.startAll = document.querySelector('#mfPrefsModal .pf-segbtn.pf-on').dataset.v === "all";
    click("mode", "only"); click("genre", "28"); click("genre", "35"); click("save"); await wait(50);
    let p = prof();
    out.only = p.prefs.animeOnly === true && p.prefs.likesAnime === true && window.mfOnlyAnime() === true;
    out.genres = JSON.stringify(p.likedGenres) === "[28,35]";
    out.closed = !document.getElementById("mfPrefsModal").classList.contains("show");
    // znovu otevřít: nastavení je vidět; zpět na „Všechno“ + přimíchávání
    MFPrefs.open();
    out.reopenOnly = document.querySelector('#mfPrefsModal .pf-segbtn.pf-on').dataset.v === "only" && document.querySelectorAll('#mfPrefsModal .pf-tag.pf-on').length === 2;
    click("mode", "all"); document.getElementById("mfPrefsMix").checked = true; document.getElementById("mfPrefsMix").dispatchEvent(new Event("change", { bubbles: true })); click("save"); await wait(50);
    p = prof(); out.backAll = p.prefs.animeOnly === false && p.prefs.likesAnime === true && window.mfOnlyAnime() === false && JSON.stringify(p.likedGenres) === "[28,35]";
    // nejvýš 5 žánrů
    MFPrefs.open(); ["80", "12", "878"].forEach(g => click("genre", g)); click("genre", "14");
    out.max5 = document.querySelectorAll('#mfPrefsModal .pf-tag.pf-on').length === 5 && /nejvýš 5/.test(document.querySelector("#mfPrefsModal .pf-msg").textContent);
    MFPrefs.close();
    // zakládání profilu: přepínač „Jen anime“
    reset();
    ProfileGate.openOnboarding(id); await wait(30);
    out.obBox = !!document.getElementById("pwAnimeOnly");
    document.getElementById("pwAnimeOnly").checked = true;
    document.querySelector('#pwGenres [data-genre="35"]').classList.add("selected");
    ProfileGate.finishOnboarding(); ProfileGate.closeOnboarding();
    p = prof(); out.obOnly = p.prefs.animeOnly === true && p.prefs.likesAnime === true && window.mfOnlyAnime() === true && JSON.stringify(p.likedGenres) === "[35]";
    reset();
    ProfileGate.openOnboarding(id); await wait(30);
    out.obReset = document.getElementById("pwAnimeOnly").checked === false;
    document.querySelector('#pwGenres [data-genre="35"]').classList.add("selected");
    ProfileGate.finishOnboarding(); ProfileGate.closeOnboarding();
    p = prof(); out.obAll = !("animeOnly" in p.prefs) && window.mfOnlyAnime() === false;
    out.obAgeDefault = !("maxAge" in p.prefs);
    reset();
    ProfileGate.openOnboarding(id); await wait(30);
    document.querySelector('#pwAge [data-age="12"]').click();
    out.obAgeOn = document.querySelector('#pwAge .pw-on').dataset.age === "12";
    ProfileGate.finishOnboarding(); ProfileGate.closeOnboarding();
    out.obAge12 = prof().prefs.maxAge === 12;
    ProfileGate.openOnboarding(id); await wait(30);
    out.obAgeReset = document.querySelector('#pwAge .pw-on').dataset.age === "0";
    ProfileGate.finishOnboarding(); ProfileGate.closeOnboarding();
    out.obAgeCleared = !("maxAge" in prof().prefs);
  } finally {
    const ps = _getProfiles(), i = ps.findIndex(x => x.id === id); if (i > -1) { ps[i] = JSON.parse(bak); _saveProfiles(ps); }
    try { MFPrefs.close(); ProfileGate.closeOnboarding(); mfCloseProfileMenu(); } catch { /* nic */ }
  }
  return out;
});
check("zaměření: Nastavení v menu profilu → Zaměření a žánry otevře okno (s popiskem aktuální volby)", pfT.menuItem && pfT.opened && pfT.startAll && /Všechno/.test(pfT.hubSub), JSON.stringify(pfT));
check("zaměření: Jen anime + žánry se uloží do profilu a po otevření jsou vidět; zpět na Všechno funguje", pfT.only && pfT.genres && pfT.closed && pfT.reopenOnly && pfT.backAll, JSON.stringify(pfT));
check("zaměření: nejvýš 5 žánrů", pfT.max5, JSON.stringify(pfT));
check("zakládání profilu: věk je nepovinný (výchozí Bez omezení), zvolený se uloží a příště se vrátí na výchozí", pfT.obAgeDefault && pfT.obAgeOn && pfT.obAge12 && pfT.obAgeReset && pfT.obAgeCleared, JSON.stringify(pfT));
check("zakládání profilu: přepínač Jen anime se uloží, bez něj zůstane běžný režim", pfT.obBox && pfT.obOnly && pfT.obReset && pfT.obAll, JSON.stringify(pfT));


// --- Věkové omezení profilu (MFAge + nastavení v okně Zaměření a žánry)
const ageT = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)), real = window.tmdbGet;
  const id = getActiveProfileId(), bak = JSON.stringify(_getProfiles().find(x => x.id === id));
  const setP = fn => { const ps = _getProfiles(), p = ps.find(x => x.id === id); fn(p); _saveProfiles(ps); };
  const click = (a, v) => document.querySelector('#mfPrefsModal [data-pf="' + a + '"]' + (v ? '[data-v="' + v + '"]' : "")).click();
  const calls = [];
  window.tmdbGet = async path => {
    calls.push(path);
    const m = /^\/(movie|tv)\/(\d+)/.exec(path), t = m[1], n = Number(m[2]);
    const movieCert = { 1: "G", 2: "PG", 3: "PG-13", 4: "R", 5: "" }, tvCert = { 11: "TV-Y7-FV", 12: "TV-PG", 13: "TV-14", 14: "TV-MA" };
    if (n === 99) return null;
    if (t === "movie") return { release_dates: { results: [{ iso_3166_1: "DE", release_dates: [{ certification: "16" }] }, { iso_3166_1: "US", release_dates: [{ certification: "" }, { certification: movieCert[n] ?? "" }] }] } };
    return { content_ratings: { results: [{ iso_3166_1: "US", rating: tvCert[n] ?? "" }] } };
  };
  localStorage.removeItem("mfx_age_cache");
  const items = [1, 2, 3, 4, 5, 99].map(n => ({ tmdbId: n, mediaType: "movie" })).concat([11, 12, 13, 14].map(n => ({ id: n, type: "tv" })), [{ title: "bez id" }]);
  const ids = l => l.map(x => (x.tmdbId || x.id || "?") + (x.mediaType || x.type || "")).join();
  try {
    setP(p => { p.prefs = { ...p.prefs, maxAge: 0 }; delete p.pin; });
    out.none = (await MFAge.filter(items)).length === items.length && calls.length === 0;
    setP(p => { p.prefs = { ...p.prefs, maxAge: 7 }; });
    out.a7 = ids(await MFAge.filter(items));
    setP(p => { p.prefs = { ...p.prefs, maxAge: 12 }; });
    out.a12 = ids(await MFAge.filter(items));
    setP(p => { p.prefs = { ...p.prefs, maxAge: 15 }; });
    out.a15 = ids(await MFAge.filter(items));
    const before = calls.length; await MFAge.filter(items); out.cached = calls.length === before + 2 && /\/99\?/.test(calls[calls.length - 1]); // znovu se zkusí jen nezjištěný (id 99)
    // okno: změna věku, u profilu s PINem jen s PINem
    setP(p => { p.prefs = { ...p.prefs, maxAge: 0 }; p.pin = "1234"; });
    MFPrefs.open(); click("age", "12");
    out.pinField = !!document.getElementById("mfPrefsPin");
    click("save");
    out.blocked = (_getProfiles().find(x => x.id === id).prefs.maxAge || 0) === 0 && /PIN/.test(document.querySelector("#mfPrefsModal .pf-msg").textContent);
    const f = document.getElementById("mfPrefsPin"); f.value = "1234"; click("save"); await wait(30);
    out.saved = _getProfiles().find(x => x.id === id).prefs.maxAge === 12 && MFAge.limit() === 12;
    // stejná hodnota bez PINu se ukládá volně (měním jen žánry)
    MFPrefs.open(); out.noPinSame = !document.getElementById("mfPrefsPin"); MFPrefs.close();
  } finally {
    window.tmdbGet = real; localStorage.removeItem("mfx_age_cache");
    const ps = _getProfiles(), i = ps.findIndex(x => x.id === id); if (i > -1) { ps[i] = JSON.parse(bak); _saveProfiles(ps); }
    try { MFPrefs.close(); } catch { /* nic */ }
  }
  return out;
});
check("věk: bez omezení se nic nefiltruje ani nedotazuje", ageT.none, JSON.stringify(ageT));
check("věk: do 7 jen G / TV-Y7, do 12 + PG / TV-PG, do 15 + PG-13 / TV-14; R, TV-MA, bez hodnocení a neznámé se skryjí", ageT.a7 === "1movie,11tv" && ageT.a12 === "1movie,2movie,11tv,12tv" && ageT.a15 === "1movie,2movie,3movie,11tv,12tv,13tv", JSON.stringify(ageT));
check("věk: hodnocení se zapamatuje (podruhé bez dotazu)", ageT.cached, JSON.stringify(ageT));
check("věk: u profilu s PINem jde věk změnit jen se správným PINem", ageT.pinField && ageT.blocked && ageT.saved && ageT.noPinSame, JSON.stringify(ageT));


// --- Omezený profil dostane víc kandidátů (3 stránky) + dock se neschová sám od sebe
const wideT = await page.evaluate(async () => {
  const out = {}, id = getActiveProfileId(), bak = JSON.stringify(_getProfiles().find(x => x.id === id));
  const setAge = v => { const ps = _getProfiles(), p = ps.find(x => x.id === id); p.prefs = { ...p.prefs, maxAge: v }; _saveProfiles(ps); };
  const seen = [], get = async p => { seen.push(p); const n = /page=(\d)/.exec(p); const k = n ? Number(n[1]) : 1; return { results: [{ id: k * 10, media_type: "movie" }, { id: 5, media_type: "movie" }] }; };
  try {
    setAge(0); seen.length = 0; const a = await MFAge.wide("/trending/all/week", get); out.free = seen.length === 1 && a.results.length === 2;
    setAge(12); seen.length = 0; const b = await MFAge.wide("/discover/movie?x=1", get);
    out.lim = seen.length === 3 && /page=2/.test(seen[1]) && /page=3/.test(seen[2]) && b.results.length === 4;
    seen.length = 0; await MFAge.wide("/movie/123?append_to_response=release_dates", get); out.detail = seen.length === 1;
    seen.length = 0; await MFAge.wide("/tv/popular?page=1", get); out.paged = seen.length === 1;
    setAge(7); out.rw = MFAge.rewrite("/movie/popular").includes("/discover/movie") && MFAge.rewrite("/movie/popular").includes("certification.lte=G") && /with_genres=10762/.test(MFAge.rewrite("/tv/popular")) && MFAge.rewrite("/trending/all/week") === "/trending/all/week";
    setAge(15); out.rw15 = /certification\.lte=PG-13/.test(MFAge.rewrite("/discover/movie?with_genres=28")) && !/with_genres/.test(MFAge.rewrite("/tv/popular")) && /discover\/tv/.test(MFAge.rewrite("/tv/popular"));
    setAge(0); out.rw0 = MFAge.rewrite("/movie/popular") === "/movie/popular";
    const dock = document.getElementById("mfDock"); if (dock) {
      const sc = document.createElement("div"); sc.id = "tstScroll"; sc.style.cssText = "position:fixed;left:0;top:0;width:10px;height:300px;overflow:auto;z-index:-1";
      sc.innerHTML = '<div style="height:4000px"></div>'; document.body.appendChild(sc);
      const w = () => new Promise(r => setTimeout(r, 150));
      sc.scrollTop = 100; await w(); sc.scrollTop = 500; await w();
      out.dockStays = !dock.classList.contains("mf-dock-hidden");
      document.dispatchEvent(new Event("wheel")); sc.scrollTop = 900; await w();
      out.dockHides = dock.classList.contains("mf-dock-hidden");
      sc.remove(); window.mfDockReveal && window.mfDockReveal();
    } else { out.dockStays = out.dockHides = true; }
  } finally {
    const ps = _getProfiles(), i = ps.findIndex(x => x.id === id); if (i > -1) { ps[i] = JSON.parse(bak); _saveProfiles(ps); }
  }
  return out;
});
check("věk: omezený profil dotáhne 3 stránky seznamu (neomezený ani detail titulu ne)", wideT.free && wideT.lim && wideT.detail && wideT.paged && wideT.rw && wideT.rw15 && wideT.rw0, JSON.stringify(wideT));
check("dock: zůstává napevno (neschová se ani při posouvání uživatelem)", wideT.dockStays && !wideT.dockHides, JSON.stringify(wideT));


// --- Banner bez titulu se sbalí (dřív ho přebila výška z media query)
const heroT = await page.evaluate(() => {
  const h = document.getElementById("nfHero"); if (!h) return { skip: true };
  const old = h.className; h.className = "nf-hero nf-hero-none"; const a = h.getBoundingClientRect().height;
  h.className = "nf-hero nf-hero-empty"; const b = h.getBoundingClientRect().height; h.className = old;
  return { a, b };
});
check("banner: stav „bez titulu“ je nízký, jen načítací stav je vysoký", heroT.skip || (heroT.a < 200 && heroT.b > 300), JSON.stringify(heroT));


// --- Dávka A: zvonek, logo, žánrové štítky, spoiler
const batchA = await page.evaluate(async () => {
  const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
  out.home = typeof window.mfGoHome === "function" && /mfGoHome/.test(document.getElementById("nfLogo").getAttribute("onclick") || "");
  const gate = document.getElementById("mfProfileGate"), gd = gate.style.display; gate.style.display = "none";
  try { window.mfGoHome && window.mfGoHome(); } catch { /* nic */ }
  gate.style.display = gd;
  MFPrefs.open(); await w(100);
  const tags = document.querySelector("#mfPrefsModal .pf-tags"); out.tagsClass = !!tags && !document.querySelector('#mfPrefsModal [class*="-chip"]');
  MFPrefs.close();
  const sp = document.createElement("div"); sp.className = "episode-card spoiler-blur"; sp.innerHTML = '<div class="ep-thumb"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></div>'; document.body.appendChild(sp);
  out.noBlur = getComputedStyle(sp.querySelector("img")).filter === "none"; sp.remove();
  return out;
});
check("logo vrací na domovskou stránku", batchA.home, JSON.stringify(batchA));
const bellGone = await page.evaluate(() => !document.getElementById("nfBellBtn") && !document.getElementById("notifBell") && !document.getElementById("hdrNotifBtn") && !document.getElementById("notifPanel"));
check("zvonek Novinky už v aplikaci není", bellGone);
check("žánry: štítky nespadají pod obecné pravidlo „-chip“ (šedá plocha), spoiler bez blur filtru", batchA.tagsClass && batchA.noBlur, JSON.stringify(batchA));


// --- Záloha dat do souboru
const bk = await page.evaluate(async () => {
  const out = {}, PK = "mf_profiles_v2";
  Object.keys(localStorage).filter(k => k.startsWith("mf_")).forEach(k => localStorage.removeItem(k));
  localStorage.setItem(PK, JSON.stringify([{ id: "p_A", name: "Anna", created: 1 }]));
  localStorage.setItem("mf_watched_p_A", JSON.stringify({ x: true }));
  localStorage.setItem("mf_tmdb_key", "SECRET");
  const ex = MFSync.exportData();
  out.hasData = ex.app === "mujflix" && !!ex.data["mf_watched_p_A"] && !!ex.data[PK];
  out.noSecret = !("mf_tmdb_key" in ex.data) && !JSON.stringify(ex).includes("SECRET");
  // jiný stav: jiný profil a prázdná data → import vrátí data a spojí profily
  Object.keys(localStorage).filter(k => k.startsWith("mf_")).forEach(k => localStorage.removeItem(k));
  localStorage.setItem(PK, JSON.stringify([{ id: "p_B", name: "Bob", created: 2 }]));
  const n = MFSync.importData(JSON.parse(JSON.stringify(ex)));
  out.imported = n >= 2 && !!localStorage.getItem("mf_watched_p_A");
  out.profiles = JSON.parse(localStorage.getItem(PK)).map(p => p.id).sort().join();
  out.badFile = (() => { try { MFSync.importData({ app: "jine", data: {} }); return "ok"; } catch (e) { return e.code; } })();
  out.evilKey = (() => { MFSync.importData({ app: "mujflix", data: { "mf_tmdb_key": "X", "mf_active_pid": "p_Z", "jiny_klic": "1" } }); return localStorage.getItem("mf_tmdb_key") === null && localStorage.getItem("jiny_klic") === null && localStorage.getItem("mf_active_pid") !== "p_Z"; })();
  MFSyncUI.open("backup");
  out.ui = !!document.querySelector('#mfSyncModal [data-sa="export"]') && !!document.getElementById("mfBackupFile");
  MFSyncUI.close();
  return out;
});
check("záloha: export obsahuje data bez API klíčů", bk.hasData && bk.noSecret, JSON.stringify(bk));
check("záloha: import vrátí data a spojí profily, špatný soubor a cizí klíče odmítne", bk.imported && bk.profiles === "p_A,p_B" && bk.badFile === "badfile" && bk.evilKey, JSON.stringify(bk));
check("záloha: obrazovka s tlačítky Stáhnout / Načíst", bk.ui);

// --- v2.9: rychlé procházení, OG tagy, menu
const pol = await page.evaluate(() => ({
  chips: document.querySelectorAll("#nfQuick .nf-chip").length >= 8,
  og: !!document.querySelector('meta[property="og:image"]'),
  dockBtns: ["dockHome", "dockSeriale", "dockFilmy", "dockProtebe"].every(i => document.getElementById(i)),
  noPopups: !document.getElementById("nfTip") && !window.mfAbout,
}));
check("v2.9: rychlé procházení, OG tagy a menu Seriály/Filmy existují", pol.chips && pol.og && pol.dockBtns && pol.noPopups, JSON.stringify(pol));

// --- v3.2: jedna navigace pro celou aplikaci
const nav3 = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)); const o = {};
  const gate = document.getElementById("mfProfileGate"), gd = gate.style.display; gate.style.display = "none"; window.mfGoHome(); await w(500);
  document.getElementById("dockProtebe").click(); await w(700);
  o.favNav = getComputedStyle(document.getElementById("nfTop")).display !== "none";
  document.getElementById("dockFilmy").click(); await w(900);
  const u = document.getElementById("universeOverlay");
  o.discover = u.classList.contains("open"); o.wlClosed = !document.getElementById("watchlistOverlay").classList.contains("visible");
  o.dockShown = getComputedStyle(document.getElementById("mfDock")).display !== "none"; o.topShown = getComputedStyle(document.getElementById("nfTop")).display !== "none";
  o.active = document.querySelector("#mfDock .dock-btn.active")?.id;
  document.getElementById("dockSeriale").click(); await w(700);
  o.tv = window.mfDiscoverType() === "tv" && document.querySelector("#mfDock .dock-btn.active")?.id === "dockSeriale";
  document.getElementById("dockHome").click(); await w(900);
  o.home = document.documentElement.classList.contains("mfh-home-on") && !u.classList.contains("open");
  gate.style.display = gd; return o;
});
check("navigace: Oblíbené i Procházení mají horní lištu a dock, Seriály/Filmy přepínají typ a zvýrazní se správná záložka", nav3.favNav && nav3.discover && nav3.wlClosed && nav3.dockShown && nav3.topShown && nav3.active === "dockFilmy" && nav3.tv && nav3.home, JSON.stringify(nav3));

// --- v3.4: každá dvojice záložek funguje (z Procházení i z Oblíbených), logo a hledání zavřou Oblíbené
const nav4 = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)); const bad = [];
  const gate = document.getElementById("mfProfileGate"), gd = gate.style.display; gate.style.display = "none"; window.mfGoHome(); await w(500);
  const st = () => ({ uo: document.getElementById("universeOverlay").classList.contains("open"), wl: document.getElementById("watchlistOverlay").classList.contains("visible"), act: document.querySelector("#mfDock .dock-btn.active")?.id });
  const want = { dockHome: { uo: false, wl: false }, dockSeriale: { uo: true, wl: false }, dockFilmy: { uo: true, wl: false }, dockProtebe: { uo: false, wl: true } };
  const ids = Object.keys(want);
  for (const a of ids) for (const b of ids) {
    if (a === b) continue;
    document.getElementById(a).click(); await w(700); document.getElementById(b).click(); await w(800);
    const s = st(); if (s.uo !== want[b].uo || s.wl !== want[b].wl || s.act !== b) bad.push(a + ">" + b + " " + JSON.stringify(s));
  }
  document.getElementById("dockProtebe").click(); await w(700); document.getElementById("nfLogo").click(); await w(800);
  let s = st(); if (s.wl || s.uo) bad.push("logo z Oblíbených " + JSON.stringify(s));
  document.getElementById("dockProtebe").click(); await w(700); document.getElementById("nfSearchBtn").click(); await w(800);
  s = st(); if (s.wl || !s.uo) bad.push("lupa z Oblíbených " + JSON.stringify(s));
  window.closeUniverse(); await w(600); window.mfGoHome(); await w(400); gate.style.display = gd;
  return bad;
});
check("navigace: každá dvojice záložek funguje, Oblíbené a Procházení se nikdy nepřekrývají", nav4.length === 0, nav4.join(" | "));

// --- v3.5: řada Pokračovat ve sledování s postupem
const crT = await page.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)); const o = {};
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const slug = Object.keys(db)[0];
  const tk = uKey("mf_watch_timeline"), wk = uKey("mf_watched"); const ts = localStorage.getItem(tk), ws = localStorage.getItem(wk);
  try {
    localStorage.setItem(tk, JSON.stringify([{ slug, ts: Date.now(), name: db[slug].name }]));
    window.mfGoHome(); await w(300); window.renderHomepage(); await w(900);
    const row = document.getElementById("mfhRecentSection");
    o.title = row && row.querySelector(".nf-row-title")?.textContent;
    o.cards = row ? row.querySelectorAll(".nf-card").length : 0;
    o.prog = row ? row.querySelectorAll(".nf-cprog i").length : 0;
  } finally { ts == null ? localStorage.removeItem(tk) : localStorage.setItem(tk, ts); ws == null ? localStorage.removeItem(wk) : localStorage.setItem(wk, ws); window.renderHomepage(); }
  return o;
});
check("úvodní stránka: řada Pokračovat ve sledování má postup na plakátu", crT.title === "Pokračovat ve sledování" && crT.cards >= 1 && crT.prog >= 1, JSON.stringify(crT));

// --- v3.5: česká čísla
const plT = await page.evaluate(() => [0, 1, 2, 4, 5, 11, 21].map(n => mfPlural(n, "epizoda", "epizody", "epizod")).join());
check("čeština: 0 epizod, 1 epizoda, 2–4 epizody, 5+ epizod", plT === "epizod,epizoda,epizody,epizody,epizod,epizod,epizod", plT);

// --- v3.6: tlačítko Zpět zavírá vrstvy po krocích
await page.evaluate(() => { document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important"); window.mfGoHome(); });
await page.waitForTimeout(600);
const startUrl = page.url();
await page.evaluate(() => document.getElementById("dockSeriale").click()); await page.waitForTimeout(900);
const bk1 = await page.evaluate(() => document.getElementById("universeOverlay").classList.contains("open"));
await page.goBack(); await page.waitForTimeout(900);
const bk2 = await page.evaluate(() => !document.getElementById("universeOverlay").classList.contains("open"));
await page.evaluate(() => document.getElementById("dockFilmy").click()); await page.waitForTimeout(900);
await page.evaluate(() => window.closeUniverse()); await page.waitForTimeout(900);
const bk3 = page.url() === startUrl;
await page.goBack().catch(() => {}); await page.waitForTimeout(300);
check("zpět: tlačítko Zpět zavře Procházení a nevyhodí z aplikace, zavření křížkem nezanechá slepou položku", bk1 && bk2 && bk3, JSON.stringify({ bk1, bk2, bk3 }));

// --- v3.9: stránky Soukromí a podmínky + 404 a odkaz z přihlašovací obrazovky
const legalT = await page.evaluate(async () => {
  const get = async u => { const r = await fetch(u); return { ok: r.ok, t: r.ok ? await r.text() : "" }; };
  const [p, n] = await Promise.all([get("soukromi.html"), get("404.html")]);
  const a = document.querySelector("#mfProfileGate .pg-legal");
  return { privacy: p.ok && /TMDB/.test(p.t) && /nehostuje/.test(p.t) && /Externí weby/.test(p.t), notFound: n.ok && /nenašli/.test(n.t), link: !!a && /soukromi\.html$/.test(a.getAttribute("href")) };
});
check("soukromí a podmínky: stránka s TMDB atribucí a upozorněním o externích webech, 404 a odkaz na přihlašovací obrazovce", legalT.privacy && legalT.notFound && legalT.link, JSON.stringify(legalT));

// --- Výběr profilu se po obnovení stránky přeskočí (a bez příznaku se ukáže)
{
  const ids = await page.evaluate(() => { const ps = _getProfiles(); return ps.length ? ps[0].id : null; });
  const noPin = await page.evaluate(() => !_getProfiles()[0].pin);
  if (ids && noPin) {
    await page.evaluate((id) => { sessionStorage.removeItem("mf_gate_ok"); localStorage.setItem("mf_active_pid", id); }, ids);
    await page.goto(page.url().split("/").slice(0, 3).join("/") + "/index.html", { waitUntil: "load" }); await page.waitForTimeout(1200);
    const shown = await page.evaluate(() => getComputedStyle(document.getElementById("mfProfileGate")).display !== "none");
    await page.evaluate((id) => { sessionStorage.setItem("mf_gate_ok", "1"); localStorage.setItem("mf_active_pid", id); }, ids);
    await page.goto(page.url().split("/").slice(0, 3).join("/") + "/index.html", { waitUntil: "load" }); await page.waitForTimeout(1200);
    const hidden = await page.evaluate(() => getComputedStyle(document.getElementById("mfProfileGate")).display === "none");
    check("výběr profilu: nový start se ptá, po obnovení ve stejném okně se přeskočí", shown && hidden, JSON.stringify({ shown, hidden }));
  }
}

check("žádné JS chyby", errors.length === 0, errors.join(" | "));
await close();
finish();
