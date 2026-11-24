// Smoke test: načte aplikaci v headless Chromiu a ověří, že nevznikne žádná JS chyba.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  try {
    const f = await readFile(join(root, p === "/" ? "index.html" : p));
    res.writeHead(200, { "Content-Type": types[extname(p)] || "application/octet-stream" }); res.end(f);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
// Bez sítě mimo localhost; CDN knihovny (gsap, confetti) jsou nahrazeny prázdným stubem.
await page.route(/^(?!http:\/\/localhost)/, r => r.request().url().endsWith(".js")
  ? r.fulfill({ contentType: "text/javascript", body: "(function(){const s=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:s(),apply:()=>s()});window.gsap=window.gsap||s();})();window.confetti=window.confetti||function(){};" })
  : r.abort());
await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "load" });
await page.waitForTimeout(2000);
const g = await page.evaluate(() => ({ db: typeof db, openSeries: typeof openSeries, aiBrain: typeof aiBrain, AIBrain: typeof AIBrain, ProfileGate: typeof ProfileGate }));
await browser.close(); server.close();

const bad = Object.entries(g).filter(([, v]) => v === "undefined");
if (errors.length || bad.length) { console.error("FAIL", { errors, missing: bad.map(b => b[0]) }); process.exit(1); }
console.log("OK", g);
