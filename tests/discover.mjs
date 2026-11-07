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

async function scenario(tmdbOk, anime = false) {
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
  const urls = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.route(/^(?!http:\/\/localhost)/, r => {
    const u = r.request().url();
    if (u.endsWith(".js")) return r.fulfill({ contentType: "text/javascript", body: STUB });
    if (u.includes("/search/") && /query=breking/.test(u)) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 0, total_results: 0, results: [] }) });
    if (u.includes("/search/") && /query=bad(&|$)/.test(u)) return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, total_results: 2, results: [
      { id: 11, media_type: "movie", title: "Bad Boys", release_date: "1995-04-07", poster_path: "/e.jpg", popularity: 99 },
      { id: 12, media_type: "tv", name: "Breaking Bad", first_air_date: "2008-01-20", poster_path: "/f.jpg", popularity: 50 },
    ] }) });
    if (u.includes("/search/")) {
      urls.push(u);
      return r.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ page: 1, total_pages: 1, results: [
        { id: 1, media_type: "movie", title: "Matrix Reloaded", release_date: "2003-05-15", poster_path: "/a.jpg", popularity: 90 },
        { id: 2, media_type: "movie", title: "Dokument o Matrixu", release_date: "2010-01-01", poster_path: "/b.jpg", popularity: 80 },
        { id: 3, media_type: "movie", title: "Matrix", release_date: "1999-03-31", poster_path: "/c.jpg", popularity: 70 },
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
  await page.fill("#dvSearch", "breking bad");
  await page.waitForTimeout(1800);
  const t4 = await titles();
  check("Hledání: překlep („breking bad“) najde Breaking Bad a nepřidá nepodobné názvy", t4.length === 1 && t4[0] === "Breaking Bad", t4.join("|"));
  await page.close();
}

await browser.close(); server.close();
finish();
