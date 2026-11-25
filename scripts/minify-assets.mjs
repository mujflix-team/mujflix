/* global console */
// Minifikace skriptů a stylů při sestavení na Cloudflare Pages (volá ji scripts/version.mjs jen tam).
// Soubory v repozitáři zůstávají čitelné; mění se jen kopie, ze které web běží.
// Skripty se načítají klasicky (<script defer>), esbuild u nich nepřejmenovává globální názvy,
// takže inline onclick="…" i window.* fungují dál. Kdyby esbuild chyběl nebo soubor selhal, soubor zůstane beze změny.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function list(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...list(p));
    else if (/\.(js|css)$/.test(f)) out.push(p);
  }
  return out;
}

export async function minifyAssets(roots = ["js", "css"]) {
  let esbuild;
  try { esbuild = await import("esbuild"); } catch { console.log("Minifikace přeskočena (esbuild není nainstalovaný)"); return { files: 0, before: 0, after: 0 }; }
  let files = 0, before = 0, after = 0;
  for (const p of roots.flatMap(list)) {
    const src = readFileSync(p, "utf8");
    try {
      const r = await esbuild.transform(src, { loader: p.endsWith(".css") ? "css" : "js", minify: true, legalComments: "none", target: "es2019" });
      if (!r.code || r.code.length >= src.length) continue;
      writeFileSync(p, r.code);
      files++; before += src.length; after += r.code.length;
    } catch (e) { console.log("Minifikace selhala, soubor beze změny:", p, String(e.message || e).split("\n")[0]); }
  }
  console.log(`Minifikace: ${files} souborů, ${Math.round(before / 1024)} kB → ${Math.round(after / 1024)} kB`);
  return { files, before, after };
}
