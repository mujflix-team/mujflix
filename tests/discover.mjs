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

await browser.close(); server.close();
finish();
