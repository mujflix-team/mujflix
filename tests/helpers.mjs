import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const STUB = "(function(){const s=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:s(),apply:()=>s()});window.gsap=window.gsap||s();})();window.confetti=window.confetti||function(){};";

export async function startApp() {
  const root = process.cwd();
  const server = createServer(async (req, res) => {
    const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    try {
      const f = await readFile(join(root, p === "/" ? "index.html" : p));
      res.writeHead(200, { "Content-Type": types[extname(p)] || "application/octet-stream" }); res.end(f);
    } catch { res.writeHead(404); res.end(); }
  }).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.route(/^(?!http:\/\/localhost)/, r => r.request().url().endsWith(".js")
    ? r.fulfill({ contentType: "text/javascript", body: STUB }) : r.abort());
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  return { page, errors, close: async () => { await browser.close(); server.close(); } };
}

let failed = 0;
export function check(name, ok, detail = "") {
  console.log((ok ? "  ✓ " : "  ✗ ") + name + (ok ? "" : "  " + detail));
  if (!ok) failed++;
}
export function finish() { if (failed) { console.error(`\n${failed} test(s) failed`); process.exit(1); } console.log("\nAll passed"); }
