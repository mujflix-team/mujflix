// Nejčastěji rozbíjené toky: Oblíbené, Pokračovat, přepnutí profilu a propojení dvou zařízení.
// Zařízení jsou dva oddělené prohlížeče (každý má vlastní úložiště) a mluví se skutečným kódem Workeru (KV v paměti).
import w from "../worker/tmdb-proxy.js";
import { startApp, check, finish } from "./helpers.mjs";

const A = await startApp();
const { page, errors } = A;

const seedProfiles = (pg, active) => pg.evaluate(a => {
  Object.keys(localStorage).filter(k => k.startsWith("mf_")).forEach(k => localStorage.removeItem(k));
  localStorage.setItem("mf_profiles_v2", JSON.stringify([
    { id: "p_A", name: "Anna", created: 1000, avatar: "🎬" },
    { id: "p_B", name: "Bob", created: 2000, avatar: "🎬" },
  ]));
  localStorage.setItem("mf_active_pid", a);
  ProfileGate.activateProfile(a);
}, active);

// --- Přehrávač: srdíčko přidá a odebere film (text, ne objekt) a drží stav tlačítka
await seedProfiles(page, "p_A");
const cinFav = await page.evaluate(async () => {
  const out = {}, key = uKey("mf_watchlist");
  MFCinemaPlayer.open("603", "Matrix", "movie");
  await new Promise(r => setTimeout(r, 400));
  const b = document.getElementById("mfCinFavBtn");
  b.click();
  const l1 = JSON.parse(localStorage.getItem(key) || "[]");
  out.added = l1.length === 1 && typeof l1[0].slug === "string" && l1[0].name === "Matrix" && l1[0].type === "movie";
  out.heartOn = b.textContent === "♥";
  b.click();
  out.removed = JSON.parse(localStorage.getItem(key) || "[]").length === 0 && b.textContent === "♡";
  MFCinemaPlayer.close();
  return out;
});
check("Oblíbené z přehrávače: srdíčko film přidá (text) a druhým klikem odebere", cinFav.added && cinFav.heartOn && cinFav.removed, JSON.stringify(cinFav));

// --- Stránka Oblíbené: názvy jsou text, počet sedí, odebrání z karty a filtr
const favPage = await page.evaluate(async () => {
  const out = {}, key = uKey("mf_watchlist"), wait = ms => new Promise(r => setTimeout(r, ms));
  localStorage.setItem(key, "[]");
  toggleTmdbFavorite(603, "movie", "Matrix", "", null);
  toggleTmdbFavorite(1399, "tv", "Hra o trůny", "", null);
  toggleTmdbFavorite(27205, "movie", { title: "Počátek" }.title, "", null);
  openWatchlist();
  await wait(300);
  const cards = () => [...document.querySelectorAll("#watchlistList .wl-card")];
  const txt = cards().map(c => c.textContent).join(" | ");
  out.txt = txt;
  out.three = cards().length === 3 && /Matrix/.test(txt) && /Hra o trůny/.test(txt) && /Počátek/.test(txt);
  out.clean = !/\[object|undefined|null/.test(txt);
  out.count = (document.getElementById("wlCount") || {}).textContent;
  document.getElementById("wlTabMovie").click(); await wait(100);
  out.moviesOnly = cards().length === 2 && !/Hra o trůny/.test(cards().map(c => c.textContent).join(" "));
  document.getElementById("wlTabAll").click(); await wait(100);
  const matrix = cards().find(c => /Matrix/.test(c.textContent));
  matrix.querySelector(".wl-card-remove").click(); await wait(100);
  const left = JSON.parse(localStorage.getItem(key)).map(x => x.name);
  out.removed = cards().length === 2 && left.join() === "Hra o trůny,Počátek" && !isTmdbFavorite(603, "movie");
  out.count2 = (document.getElementById("wlCount") || {}).textContent;
  closeWatchlist();
  return out;
});
check("Oblíbené: stránka ukáže 3 karty s názvy bez [object Object], počet sedí", favPage.three && favPage.clean && /^3 /.test(favPage.count || ""), JSON.stringify(favPage));
check("Oblíbené: filtr Filmy a odebrání z karty (úložiště, karty i počet)", favPage.moviesOnly && favPage.removed && /^2 /.test(favPage.count2 || ""), JSON.stringify(favPage));

// --- Po obnovení stránky zůstane vše na místě a bez chyb v konzoli
await page.goto(new URL("/index.html", page.url()).href, { waitUntil: "load" });
await page.waitForTimeout(1500);
const afterReload = await page.evaluate(() => ({ names: getWatchlist().map(x => x.name).join(), fav: isTmdbFavorite(1399, "tv") }));
check("Oblíbené: po obnovení stránky zůstanou položky (názvy jsou text)", afterReload.names === "Hra o trůny,Počátek" && afterReload.fav, JSON.stringify(afterReload));

// --- Přepnutí profilu: Oblíbené, Pokračovat a zhlédnuté se nemíchají
await seedProfiles(page, "p_A");
const sw = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  toggleTmdbFavorite(603, "movie", "Matrix", "", null);
  mfRecordContinueMovie("27205", "Počátek");
  const wa = getWatched(); wa["x-S1-E1"] = true; saveWatched(wa);
  out.aCont = (mfhGetRealContinueItem() || {}).title;
  openWatchlist(); await wait(300);
  out.aCards = document.querySelectorAll("#watchlistList .wl-card").length;
  ProfileGate.activateProfile("p_B"); await wait(400);
  out.bFav = getWatchlist().length === 0 && !isTmdbFavorite(603, "movie");
  out.bWatched = Object.keys(getWatched()).length === 0;
  out.bCont = (mfhGetRealContinueItem() || {}).title || null;
  out.bCards = document.querySelectorAll("#watchlistList .wl-card").length;
  toggleTmdbFavorite(438631, "movie", "Duna", "", null);
  closeWatchlist();
  ProfileGate.activateProfile("p_A"); await wait(400);
  out.aBack = getWatchlist().map(x => x.name).join();
  out.aWatched = !!getWatched()["x-S1-E1"];
  out.aContBack = (mfhGetRealContinueItem() || {}).title;
  return out;
});
check("profil: Oblíbené, zhlédnuté a Pokračovat jednoho profilu nejsou vidět u druhého", sw.bFav && sw.bWatched && sw.bCont === null && sw.aBack === "Matrix" && sw.aWatched && sw.aCont === "Počátek" && sw.aContBack === "Počátek", JSON.stringify(sw));
check("profil: otevřená stránka Oblíbené se po přepnutí profilu přepíše", sw.aCards === 1 && sw.bCards === 0, JSON.stringify(sw));

// --- Úvodní stránka, řada Oblíbené: srdíčko mají všechny karty (i starší seriál jen pod místním slugem) a klik ji odebere
await seedProfiles(page, "p_A");
const myList = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  document.getElementById("mfProfileGate")?.style.setProperty("display", "none", "important");
  const slug = Object.keys(db)[0];
  saveWatchlistData([{ slug, name: db[slug].name, type: "series", poster: "" }, { slug: "__tmdbfav_movie_603", name: "Matrix", type: "movie", poster: "", tmdbId: 603 }]);
  window.mfhResetSig && window.mfhResetSig();
  window.renderHomepage(); await wait(2600);
  const cards = () => [...document.querySelectorAll("#mfhMyList .nf-card")];
  out.cards = cards().length;
  out.hearts = cards().filter(c => c.querySelector(".nf-fav.on")).length;
  const legacy = cards().find(c => c.querySelector(".nf-fav.on") && !/Matrix/.test(c.textContent));
  legacy && legacy.querySelector(".nf-fav").click();
  await wait(300);
  out.left = getWatchlist().map(x => x.name).join();
  out.cardsAfter = cards().length;
  out.slug = slug;
  return out;
});
check("úvodní stránka: v řadě Oblíbené mají srdíčko všechny karty (i starší seriál bez TMDB ID) a klik ji odebere", myList.cards === 2 && myList.hearts === 2 && myList.left === "Matrix" && myList.cardsAfter === 1, JSON.stringify(myList));

// --- Detail seriálu: tlačítko „Označit sezónu“ označí všechny díly sezóny a druhým klepnutím je odznačí
await seedProfiles(page, "p_A");
const seasonMark = await page.evaluate(async () => {
  const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  const slug = Object.keys(db)[0];
  saveWatched({});
  openSeries(slug); await wait(500);
  const btn = document.getElementById("seasonMarkBtn"), n1 = epsInSeason(slug, 1), n2 = totalSeasons(slug) > 1 ? 2 : 0;
  out.visible = !!btn && !btn.hidden && /Označit sezónu/.test(btn.textContent);
  if (n2) { const w0 = getWatched(); w0[slug + "-S2-E1"] = true; saveWatched(w0); }
  btn.click(); await wait(200);
  const w1 = getWatched(), all1 = Array.from({ length: n1 }, (_, i) => !!w1[`${slug}-S1-E${i + 1}`]).every(Boolean);
  out.marked = all1 && n1 > 0;
  out.otherKept = !n2 || !!w1[slug + "-S2-E1"];
  out.label = btn.textContent;
  out.done = !!document.querySelector("#sdSeasons .sd-season.done");
  out.noPrompt = !document.querySelector(".ep-rating-modal.open, #epRatingModal.open");
  btn.click(); await wait(200);
  const w2 = getWatched();
  out.cleared = Array.from({ length: n1 }, (_, i) => !!w2[`${slug}-S1-E${i + 1}`]).every(v => !v);
  out.otherKept2 = !n2 || !!w2[slug + "-S2-E1"];
  out.label2 = btn.textContent;
  document.getElementById("seriesModal").classList.remove("open");
  return out;
});
check("detail seriálu: Označit sezónu označí všechny díly (jiné sezóny nechá), popisek se změní", seasonMark.visible && seasonMark.marked && seasonMark.otherKept && /Zrušit/.test(seasonMark.label) && seasonMark.done, JSON.stringify(seasonMark));
check("detail seriálu: druhé klepnutí zhlédnutí sezóny zruší, jiné sezóny zůstanou", seasonMark.cleared && seasonMark.otherKept2 && /Označit/.test(seasonMark.label2), JSON.stringify(seasonMark));

// --- Dvě zařízení proti skutečnému Workeru
const B = await startApp();
const kv = new Map();
const env = { SYNC: { get: async k => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); }, delete: async k => { kv.delete(k); } }, TMDB_API_KEY: "x", ALLOWED_ORIGINS: "" };
let serverCalls = 0;
const wire = async (pg, ip) => {
  await pg.route("https://w.workers.dev/**", async route => {
    const rq = route.request();
    const hasBody = !["GET", "HEAD", "OPTIONS"].includes(rq.method());
    const res = await w.fetch(new Request(rq.url(), { method: rq.method(), headers: { ...rq.headers(), "CF-Connecting-IP": ip }, body: hasBody ? rq.postData() : undefined }), env);
    serverCalls++;
    await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: await res.text() });
  });
  await pg.evaluate(() => { window.TMDB_PROXY_URL = "https://w.workers.dev"; });
};
await wire(page, "10.0.0.1");
await wire(B.page, "10.0.0.2");

const dev = (pg, fn, arg) => pg.evaluate(fn, arg);
// Zařízení 1: profil Anna s oblíbeným, zhlédnutým a rozkoukaným filmem
await page.evaluate(() => {
  Object.keys(localStorage).filter(k => k.startsWith("mf_")).forEach(k => localStorage.removeItem(k));
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p_A", name: "Anna", created: 1000, avatar: "🎬" }]));
  localStorage.setItem("mf_active_pid", "p_A");
  toggleTmdbFavorite(603, "movie", "Matrix", "", null);
  mfRecordContinueMovie("27205", "Počátek");
  const w1 = getWatched(); w1["x-S1-E1"] = true; saveWatched(w1);
  localStorage.setItem("mf_tmdb_key", "TAJNY-KLIC");
});
const code = await dev(page, () => MFSync.createCode().then(r => r.code));
check("dvě zařízení: první vytvoří kód propojení", /^[A-Z0-9]{6}$/.test(code), String(code));

// Zařízení 2: vlastní profil Bob a vlastní oblíbený seriál, pak se připojí
await B.page.evaluate(() => {
  Object.keys(localStorage).filter(k => k.startsWith("mf_")).forEach(k => localStorage.removeItem(k));
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p_B", name: "Bob", created: 2000, avatar: "🎬" }]));
  localStorage.setItem("mf_active_pid", "p_B");
  toggleTmdbFavorite(1399, "tv", "Hra o trůny", "", null);
});
const joined = await dev(B.page, code => MFSync.join(code).then(r => ({ ok: true, changed: r.changed }), e => ({ ok: false, err: String(e && (e.code || e.message)) })), code);
const bState = await B.page.evaluate(() => {
  const g = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
  return {
    profiles: (g("mf_profiles_v2") || []).map(p => p.id).sort().join(),
    favA: (g("mf_watchlist_p_A") || []).map(x => x.name).join(),
    favB: (g("mf_watchlist_p_B") || []).map(x => x.name).join(),
    watchedA: !!(g("mf_watched_p_A") || {})["x-S1-E1"],
    contA: (g("mf_cont_movies_p_A") || []).map(x => x.title).join(),
    secret: localStorage.getItem("mf_tmdb_key"),
  };
});
check("dvě zařízení: po připojení má druhé profily, oblíbené, zhlédnuté i rozkoukané obou", joined.ok && bState.profiles === "p_A,p_B" && bState.favA === "Matrix" && bState.favB === "Hra o trůny" && bState.watchedA && bState.contA === "Počátek", JSON.stringify({ joined, bState }));
check("dvě zařízení: tajný klíč se nepřenese a na serveru není", bState.secret === null && ![...kv.values()].some(v => String(v).includes("TAJNY-KLIC")), JSON.stringify(bState.secret));

// Souběžně: zařízení 2 odebere Matrix z Anniných oblíbených, zařízení 1 přidá Dunu
await B.page.evaluate(async () => { ProfileGate.activateProfile("p_A"); await new Promise(r => setTimeout(r, 300)); toggleTmdbFavorite(603, "movie", "Matrix", "", null); await new Promise(r => setTimeout(r, 30)); await MFSync.syncNow({ reload: false }); });
await page.evaluate(async () => { toggleTmdbFavorite(438631, "movie", "Duna", "", null); await new Promise(r => setTimeout(r, 30)); await MFSync.syncNow({ reload: false }); });
const aAfter = await page.evaluate(() => getWatchlist().map(x => x.name).sort().join());
await B.page.evaluate(() => MFSync.syncNow({ reload: false }));
const bAfter = await B.page.evaluate(() => getWatchlist().map(x => x.name).sort().join());
check("dvě zařízení: souběžné odebrání a přidání se sloučí (Matrix pryč, Duna zůstane) na obou", aAfter === "Duna" && bAfter === "Duna", JSON.stringify({ aAfter, bAfter }));

// Smazání profilu na zařízení 2 se přenese na zařízení 1
await B.page.evaluate(async () => {
  localStorage.setItem("mf_profiles_v2", JSON.stringify(JSON.parse(localStorage.getItem("mf_profiles_v2")).filter(p => p.id !== "p_B")));
  await new Promise(r => setTimeout(r, 30));
  await MFSync.syncNow({ reload: false });
});
const delA = await page.evaluate(async () => { await MFSync.syncNow({ reload: false }); return JSON.parse(localStorage.getItem("mf_profiles_v2")).map(p => p.id).join(); });
check("dvě zařízení: smazaný profil zmizí i na druhém zařízení", delA === "p_A", String(delA));
check("dvě zařízení: komunikace šla přes skutečný Worker", serverCalls >= 6, String(serverCalls));

check("žádné JS chyby", errors.length === 0 && B.errors.length === 0, errors.concat(B.errors).join(" | "));
await A.close();
await B.close();
finish();
