// Objevovat: odolnost vůči špatným odpovědím TMDB a prázdný stav při výpadku
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { check, finish } from "./helpers.mjs";

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const STUB = "(function(){const s=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:s(),apply:()=>s()});window.gsap=window.gsap||s();})();window.confetti=window.confetti||function(){};";
const server = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  try { const f = await readFile(join(process.cwd(), p === "/" ? "index.html" : p)); res.writeHead(200, { "Content-Type": types[extname(p)] || "application/octet-stream" }); res.end(f); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

const hostile = [
  { id: 1, title: '<img src=x onerror="window.__xss=1">', poster_path: "/a.jpg", vote_average: "8.1", release_date: null, genre_ids: null },
  null, 7, "x", {},
  { id: 4, name: '"><script>window.__xss=2</script>', poster_path: "/d.jpg", vote_average: 7.5, first_air_date: "2020-01-01", media_type: "tv" },
  { id: 5, title: "OK film", poster_path: "/e.jpg", vote_average: 6.2, release_date: "2021-05-05", media_type: "movie" },
];

async function scenario(tmdbOk, anime = false, rnd = null) {
  const urls = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.route(/^(?!http:\/\/localhost)/, r => {
    const u = r.request().url();
    if (u.includes("/discover/") || u.includes("/trending/") || u.includes("/search/")) urls.push(u);
    if (u.endsWith(".js")) return r.fulfill({ contentType: "text/javascript", body: STUB });
    if (u.includes("api.themoviedb.org") || u.includes(".workers.dev")) return tmdbOk
      ? r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ results: hostile, page: 1, total_pages: 1 }) })
      : r.abort();
    return r.abort();
  });
  if (rnd !== null) await page.addInitScript(v => { Math.random = () => v; }, rnd);
  await page.addInitScript(anime => {
    if (location.protocol !== "http:" || localStorage.getItem("__s")) return; localStorage.setItem("__s", "1");
    localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p1", name: "Test", avatar: "🎬", color: "#007aff", ...(anime ? { prefs: { likesAnime: true, animeOnly: true }, likedGenres: [28] } : {}) }]));
    localStorage.setItem("mf_active_pid", "p1"); localStorage.setItem("mf_tmdb_key", "K");
  }, anime);
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.openDiscover());
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => ({
    cards: document.querySelectorAll("#dvBody .dv-card").length,
    empty: !!document.querySelector("#dvBody .dv-empty"),
    xss: window.__xss || 0,
    titles: [...document.querySelectorAll("#dvBody .dv-row-title, #dvBody h2, #dvBody h3")].map(n => n.textContent).join("|"),
  }));
  await page.close();
  return { ...r, urls, errors: errors.filter(e => !/Access is denied/.test(e)) };
}

const ok = await scenario(true);
const vr = await scenario(true, false, 0.5);
const vPages = vr.urls.filter(u => /top_rated|\/discover\//.test(u) && u.includes("include_adult=") || /top_rated/.test(u)).map(u => +(u.match(/[?&]page=(\d+)/) || [])[1]);
check("Objevovat: výchozí nabídka nezačíná pořád na první stránce (každé načtení jiný začátek)", vPages.length > 0 && vPages.some(p => p > 1), JSON.stringify(vPages));
check("Objevovat: špatné položky v odpovědi nerozbijí řady", ok.cards > 0, JSON.stringify(ok));
check("Objevovat: HTML v názvech se nevykoná", ok.xss === 0);
check("Objevovat: bez JS chyb", ok.errors.length === 0, ok.errors.join(" | "));
const off = await scenario(false);
check("Objevovat: při výpadku TMDB se ukáže prázdný stav", off.empty && off.cards === 0, JSON.stringify(off));

const an = await scenario(true, true);
const dUrls = an.urls.filter(u => u.includes("/discover/"));
check("Objevovat: Jen anime ptá se jen na anime (animace + japonština), žádné obecné trendy", dUrls.length > 0 && dUrls.every(u => /with_genres=16(&|$)/.test(u) && /with_original_language=ja/.test(u)) && !an.urls.some(u => u.includes("/trending/")), JSON.stringify(an.urls.slice(0, 4)));
check("Objevovat: Jen anime ukáže anime řady", /anime/i.test(an.titles) && an.errors.length === 0, an.titles + " " + an.errors.join("|"));

// Hledání: rok v dotazu a řazení podle shody názvu
{
  const urls = []; let decomposed = false;
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.route(/^(?!http:\/\/localhost)/, r => {
    const u = r.request().url();
    if (/%E3%82%99|%E3%82%9A/.test(u)) decomposed = true; // rozložená dakuten v dotazu = rozbitá japonština
    if (u.endsWith(".js")) return r.fulfill({ contentType: "text/javascript", body: STUB });
    if (u.includes("/search/") && /query=breking/.test(u)) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 0, total_results: 0, results: [] }) });
    if (u.includes("/search/") && /query=オーバーフロ(decodeURIComponent(u).includes("query=オーバーフロ&")|$)/.test(decodeURIComponent(u))) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, total_results: 2, results: [
      { id: 21, media_type: "tv", name: "Overflow", original_name: "オーバーフロー", first_air_date: "2016-01-01", poster_path: "/g.jpg", popularity: 5 },
      { id: 22, media_type: "tv", name: "Jiné anime", original_name: "別のアニメ", first_air_date: "2016-01-01", poster_path: "/h.jpg", popularity: 9 },
    ] }) });
    if (u.includes("/search/") && /query=オーバーフロー(&|$)/.test(decodeURIComponent(u))) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, total_results: 1, results: [
      { id: 21, media_type: "tv", name: "Overflow", original_name: "オーバーフロー", first_air_date: "2016-01-01", poster_path: "/g.jpg", popularity: 5 },
    ] }) });
    if (u.includes("/search/") && /query=%E3%81%8A/.test(u)) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, total_results: 1, results: [
      { id: 31, media_type: "tv", name: "Nesouvisející seriál", original_name: "ぜんぜん違う", first_air_date: "2010-01-01", poster_path: "/i.jpg", popularity: 8 },
    ] }) });
    if (u.includes("/search/") && /query=(breking|%E3)/.test(u)) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 0, total_results: 0, results: [] }) });
    if (u.includes("/search/") && /query=bezplakatu(&|$)/.test(decodeURIComponent(u))) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, total_results: 1, results: [
      { id: 41, media_type: "tv", name: "Bezplakatu", original_name: "ポスターなし", first_air_date: "2018-01-01", poster_path: null, popularity: 1 },
    ] }) });
    if (u.includes("/search/") && /query=bad(&|$)/.test(u)) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, total_results: 2, results: [
      { id: 11, media_type: "movie", title: "Bad Boys", release_date: "1995-04-07", poster_path: "/e.jpg", popularity: 99 },
      { id: 12, media_type: "tv", name: "Breaking Bad", first_air_date: "2008-01-20", poster_path: "/f.jpg", popularity: 50 },
    ] }) });
    if (u.includes("/search/")) {
      urls.push(u);
      return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, results: [
        { id: 1, media_type: "movie", title: "Matrix Reloaded", original_title: "The Matrix Reloaded", release_date: "2003-05-15", poster_path: "/a.jpg", popularity: 90 },
        { id: 2, media_type: "movie", title: "Dokument o Matrixu", release_date: "2010-01-01", poster_path: "/b.jpg", popularity: 80 },
        { id: 3, media_type: "movie", title: "Matrix", original_title: "The Matrix", release_date: "1999-03-31", poster_path: "/c.jpg", popularity: 70 },
        { id: 4, media_type: "movie", title: "Matrix Revolutions", release_date: "2003-11-05", poster_path: "/d.jpg", popularity: 60 },
      ] }) });
    }
    if (u.includes("api.themoviedb.org") || u.includes(".workers.dev")) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ results: [], page: 1, total_pages: 1 }) });
    return r.abort();
  });
  await page.addInitScript(() => {
    if (location.protocol !== "http:" || localStorage.getItem("__s")) return; localStorage.setItem("__s", "1");
    localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p1", name: "Test", avatar: "🎬", color: "#007aff" }]));
    localStorage.setItem("mf_active_pid", "p1"); localStorage.setItem("mf_tmdb_key", "K");
  });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.openSearch());
  await page.waitForTimeout(800);
  const titles = async () => page.evaluate(() => [...document.querySelectorAll("#dvBody .dv-card-title")].map(n => n.textContent));
  await page.fill("#dvSearch", "matrix");
  await page.waitForTimeout(1500);
  const t1 = await titles();
  check("Hledání: přesný název je první, pak názvy začínající hledaným textem", t1[0] === "Matrix" && t1[1] === "Matrix Reloaded" && t1[3] === "Dokument o Matrixu", t1.join("|"));
  urls.length = 0;
  await page.fill("#dvSearch", "matrix 2003");
  await page.waitForTimeout(1500);
  const t2 = await titles();
  check("Hledání: rok v dotazu se TMDB neposílá a filmy z toho roku jdou první", !urls.some(u => /2003/.test(u)) && t2[0] === "Matrix Reloaded" && t2[1] === "Matrix Revolutions", urls.join(" ") + " " + t2.join("|"));
  await page.fill("#dvSearch", "MATRIX");
  await page.waitForTimeout(1500);
  const t3 = await titles();
  check("Hledání: velikost písmen nevadí", t3[0] === "Matrix", t3.join("|"));
  await page.fill("#dvSearch", "the matrix");
  await page.waitForTimeout(1500);
  const t5 = await titles();
  check("Hledání: shoda s původním (anglickým) názvem řadí na první místo", t5[0] === "Matrix", t5.join("|"));
  await page.fill("#dvSearch", "breking bad");
  await page.waitForTimeout(1800);
  const t4 = await titles();
  check("Hledání: překlep („breking bad“) najde Breaking Bad a nepřidá nepodobné názvy", t4.length === 1 && t4[0] === "Breaking Bad", t4.join("|"));
  await page.fill("#dvSearch", "おーばーふろぉ");
  await page.waitForTimeout(2000);
  const t6 = await titles();
  check("Hledání: japonský název v hiraganě s překlepem („おーばーふろぉ“) najde Overflow", t6[0] === "Overflow", t6.join("|"));
  // Tituly pro dospělé: profil bez věkového omezení je dostane, s omezením ne
  const adultOf = async (prefs) => { await page.evaluate((pr) => { const a = _getProfiles(); a[0].prefs = pr; _saveProfiles(a); }, prefs); urls.length = 0; await page.fill("#dvSearch", "adult" + Math.random().toString(36).slice(2, 7)); await page.waitForTimeout(1500); return urls.some(u => /include_adult=true/.test(u)); };
  check("Hledání: profil bez věkového omezení dostane tituly pro dospělé", (await adultOf({})) === true);
  check("Hledání: profil s věkovým omezením je nedostane", (await adultOf({ maxAge: 12 })) === false);
  await page.evaluate(() => { const a = _getProfiles(); a[0].prefs = {}; _saveProfiles(a); });
  await page.fill("#dvSearch", "bezplakatu");
  await page.waitForTimeout(1500);
  const t7 = await titles();
  const fb7 = await page.evaluate(() => !!document.querySelector("#dvBody .dv-poster-fallback"));
  check("Hledání: titul bez plakátu se najde a ukáže s písmenem místo plakátu", t7[0] === "Bezplakatu" && fb7, t7.join("|") + " " + fb7);
  check("Hledání: do TMDB se neposílá rozložená japonština (dakuten jako zvláštní znak)", !decomposed, String(decomposed));
  await page.close();
}

/* Filtry: víc žánrů najednou, minimální hodnocení, skrýt už otevřené, přehled aktivních filtrů */
{
  const urls = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  const items = [
    { id: 5, title: "Prvni film", poster_path: "/a.jpg", vote_average: 7.9, release_date: "2021-05-05", genre_ids: [35, 878] },
    { id: 6, title: "Druhy film", poster_path: "/b.jpg", vote_average: 7.4, release_date: "2020-02-02", genre_ids: [35, 878] },
  ];
  await page.route(/^(?!http:\/\/localhost)/, r => {
    const u = r.request().url();
    if (u.includes("/discover/")) urls.push(u);
    if (u.endsWith(".js")) return r.fulfill({ contentType: "text/javascript", body: STUB });
    if (u.includes("api.themoviedb.org") || u.includes(".workers.dev")) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ results: items, page: 1, total_pages: 1 }) });
    return r.abort();
  });
  await page.addInitScript(() => {
    if (location.protocol !== "http:" || localStorage.getItem("__s")) return; localStorage.setItem("__s", "1");
    localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p1", name: "Test", avatar: "🎬", color: "#007aff" }]));
    localStorage.setItem("mf_active_pid", "p1"); localStorage.setItem("mf_tmdb_key", "K");
  });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  await page.getByText("Test", { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.openDiscover());
  await page.waitForTimeout(2000);
  await page.click('#dvGenres [data-genre="kom"]');
  await page.click('#dvGenres [data-genre="scifi"]');
  await page.locator("#universeOverlay .dv-select .mf-dd-btn").nth(2).click();
  await page.locator("#universeOverlay .mf-dd.open .mf-dd-opt", { hasText: "7+" }).click();
  await page.waitForTimeout(2000);
  const last = urls.slice(-2);
  check("Filtry: dva žánry se pošlou TMDB najednou (film 35,878, seriál 35,10765) a minimální hodnocení", last.some(u => u.includes("/discover/movie") && /with_genres=35%2C878/.test(u)) && last.some(u => u.includes("/discover/tv") && /with_genres=35%2C10765/.test(u)) && last.every(u => /vote_average\.gte=7(&|$)/.test(u)), last.join(" | "));
  const st = await page.evaluate(() => ({
    chips: [...document.querySelectorAll("#dvBody .dv-achip")].map(b => b.textContent),
    dot: document.querySelector("#dvFilterBtn .dv-filter-dot").textContent,
    pressed: [...document.querySelectorAll("#dvGenres .dv-chip.active")].map(b => b.dataset.genre),
    title: document.querySelector("#dvBody .dv-grid-title").textContent,
  }));
  check("Filtry: přehled aktivních filtrů, počet na tlačítku a nadpis odpovídají výběru", st.chips.join("|") === "Komedie ×|Sci-Fi a fantasy ×|★ 7+ ×" && st.dot === "3" && st.pressed.join() === "kom,scifi" && /Komedie \+ Sci-Fi a fantasy/.test(st.title), JSON.stringify(st));
  await page.evaluate(() => aiBrain.recordTmdbSeen(5));
  await page.click("#dvHideSeen");
  await page.waitForTimeout(1500);
  const seen = await page.evaluate(() => ({ titles: [...document.querySelectorAll("#dvBody .dv-grid .dv-card-title")].map(n => n.textContent), on: document.getElementById("dvHideSeen").getAttribute("aria-pressed") }));
  check("Filtry: Skrýt už otevřené schová titul, který jsi otevřel, a ostatní nechá", seen.on === "true" && seen.titles.length > 0 && !seen.titles.includes("Prvni film") && seen.titles.includes("Druhy film"), JSON.stringify(seen));
  await page.click("#dvBody .dv-achip");
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ chips: [...document.querySelectorAll("#dvBody .dv-achip")].map(b => b.textContent), pressed: [...document.querySelectorAll("#dvGenres .dv-chip.active")].map(b => b.dataset.genre) }));
  check("Filtry: klepnutí na štítek odebere jen ten filtr", after.chips.join("|") === "Sci-Fi a fantasy ×|★ 7+ ×|Bez už otevřených ×" && after.pressed.join() === "scifi", JSON.stringify(after));
  await page.evaluate(() => document.getElementById("dvReset").click());
  await page.waitForTimeout(1200);
  const reset = await page.evaluate(() => ({ active: document.querySelectorAll("#dvBody .dv-achip").length, pressed: document.querySelectorAll("#dvGenres .dv-chip.active").length, rating: document.getElementById("dvRating").value, seen: document.getElementById("dvHideSeen").getAttribute("aria-pressed") }));
  check("Filtry: Zrušit filtry vrátí vše (žánry, hodnocení i skrývání)", reset.active === 0 && reset.pressed === 0 && reset.rating === "" && reset.seen === "false", JSON.stringify(reset));
  await page.click('#dvProviders [data-provider="8"]');
  await page.click('#dvProviders [data-provider="1899"]');
  const pick = async (n, text) => { await page.locator("#universeOverlay .dv-select .mf-dd-btn").nth(n).click(); await page.locator("#universeOverlay .mf-dd.open .mf-dd-opt", { hasText: text }).click(); };
  await pick(1, "2010–2019"); await pick(3, "Do 90 min"); await pick(4, "Česky");
  await page.waitForTimeout(2000);
  const nu = urls.slice(-2).join(" ");
  check("Filtry: služby (Netflix | Max, region CZ), dekáda, délka a jazyk se pošlou TMDB a jdou kombinovat", /with_watch_providers=8%7C1899/.test(nu) && /watch_region=CZ/.test(nu) && /primary_release_date\.gte=2010-01-01/.test(nu) && /primary_release_date\.lte=2019-12-31/.test(nu) && /with_runtime\.lte=90/.test(nu) && /with_original_language=cs/.test(nu), nu.slice(0, 400));
  const nchips = await page.evaluate(() => [...document.querySelectorAll("#dvBody .dv-achip")].map(b => b.textContent).join("|"));
  check("Filtry: nové filtry jsou v přehledu aktivních štítků", /Netflix ×/.test(nchips) && /Max ×/.test(nchips) && /2010–2019 ×/.test(nchips) && /Do 90 min ×/.test(nchips) && /Česky ×/.test(nchips), nchips);
  await page.evaluate(() => document.getElementById("dvReset").click());
  await page.waitForTimeout(800);
  await page.locator("#universeOverlay .dv-select .mf-dd-btn").nth(2).click();
  await page.locator("#universeOverlay .mf-dd.open .mf-dd-opt", { hasText: "8+" }).click();
  await page.waitForTimeout(1200);
  const dd = await page.evaluate(() => ({ val: document.getElementById("dvRating").value, hidden: document.getElementById("dvRating").hidden, label: document.querySelectorAll("#universeOverlay .dv-select .mf-dd-label")[2].textContent, chips: [...document.querySelectorAll("#dvBody .dv-achip")].map(b => b.textContent) }));
  check("Filtry: vlastní rozbalovací seznam (hodnocení) přepne hodnotu a vznikne štítek", dd.val === "8" && dd.hidden && /8\+/.test(dd.label) && dd.chips.some(c => /8\+/.test(c)), JSON.stringify(dd));
  check("Filtry: bez JS chyb", errors.filter(e => !/Access is denied/.test(e)).length === 0, errors.join(" | "));
  await page.close();
}

await browser.close(); server.close();
finish();
