/* global process, console, document */
// Vyrobí náhledový obrázek pro odkazy v chatech (icons/og-image.png, 1200×630).
// Spuštění: node scripts/og-image.mjs   (potřebuje Playwright; cestu k Chromiu lze zadat v CHROMIUM_PATH)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

// písmo se vloží přímo do stránky (ze setContent se soubory z disku nenačtou)
const font = f => "data:font/woff2;base64," + readFileSync("fonts/" + f).toString("base64");
const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><style>
@font-face { font-family: NS; font-weight: 900; src: url("${font("NetflixSans-Blk.woff2")}") format("woff2"); }
@font-face { font-family: NS; font-weight: 500; src: url("${font("NetflixSans-Md.woff2")}") format("woff2"); }
html, body { margin: 0; width: 1200px; height: 630px; background: #141414; overflow: hidden; }
body { display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: NS, sans-serif; }
.logo { font-weight: 900; font-size: 250px; line-height: 1; letter-spacing: -10px; color: #fff; }
.logo span { color: #84bbf4; }
.claim { margin-top: 34px; font-weight: 500; font-size: 56px; color: #fff; letter-spacing: -0.5px; }
.bar { margin-top: 44px; width: 120px; height: 8px; border-radius: 4px; background: #0a84ff; }
</style></head><body>
<div class="logo">Můj<span>Flix</span></div>
<div class="claim">Filmy a seriály na jednom místě</div>
<div class="bar"></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "icons/og-image.png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log("icons/og-image.png hotovo");
