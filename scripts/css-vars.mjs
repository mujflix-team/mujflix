/* global process, console */
// Inventura CSS proměnných: node scripts/css-vars.mjs [--md|--csv] [--only-dup]
// Sloupce: var | defined_in (soubor:řádek, [root]/[ctx]) | values (:root) | used css/js/html | status
//   dead = 0 použití · same = více definic ve :root se stejnou hodnotou · conflict = různé hodnoty ve :root · single = jedna definice
// Kontextové definice (mimo :root, např. `.tile { --r: 12px }`) se počítají zvlášť a nejsou duplicita.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const SKIP = new Set(["node_modules", ".git", "tests", "worker"]);
function walk(d, out = []) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n)) continue;
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const files = walk(".");
const css = files.filter(f => extname(f) === ".css"), js = files.filter(f => extname(f) === ".js"), html = files.filter(f => extname(f) === ".html");
const stripCss = s => s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " ")); // zachová čísla řádků

const defs = {}; // name -> [{file,line,root,value}]
for (const f of css) {
  const src = stripCss(readFileSync(f, "utf8"));
  // projdi bloky `selektor { … }` (včetně vnořených @media – bere vnitřní bloky)
  const re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while ((m = re.exec(src))) {
    const sel = m[1].trim(), body = m[2], base = m.index + m[1].length + 1;
    const root = sel.split(",").some(x => /^(:root|html)$/.test(x.trim().split("\n").pop().trim()));
    const dre = /(--[\w-]+)\s*:\s*([^;]+);?/g; let d;
    while ((d = dre.exec(body))) {
      const line = src.slice(0, base + d.index).split("\n").length;
      (defs[d[1]] ||= []).push({ file: f.replace(/^\.\//, ""), line, root, value: d[2].trim().replace(/\s+/g, " ") });
    }
  }
}
const count = (list, rx, strip) => list.reduce((n, f) => { let s = readFileSync(f, "utf8"); if (strip) s = stripCss(s); return n + (s.match(rx) || []).length; }, 0);
const esc = n => n.replace(/[-]/g, "\\-");
const rows = Object.keys(defs).sort().map(name => {
  const e = defs[name], roots = e.filter(x => x.root), ctx = e.length - roots.length;
  const vals = [...new Set(roots.map(x => x.value))];
  const usedCss = count(css, new RegExp("var\\(\\s*" + esc(name) + "\\b", "g"), true);
  const jsRx = new RegExp("(?:getPropertyValue|setProperty|removeProperty)\\(\\s*['\"`]" + esc(name) + "['\"`]|var\\(\\s*" + esc(name) + "\\b", "g");
  const usedJs = count(js, jsRx), usedHtml = count(html, new RegExp("var\\(\\s*" + esc(name) + "\\b", "g"));
  const used = usedCss + usedJs + usedHtml;
  const status = used === 0 ? "dead" : roots.length < 2 ? "single" : vals.length === 1 ? "same" : "conflict";
  return { name, defined: e.map(x => `${x.file}:${x.line}${x.root ? "" : "[ctx]"}`).join(", "), values: vals.join(" ; ") || "(jen kontext)", wins: (() => { const imp = roots.filter(x => /!important/.test(x.value)); const w = (imp.length ? imp : roots).slice(-1)[0]; return w ? w.value : "" })(), usedCss, usedJs, usedHtml, ctx, status };
});
const only = process.argv.includes("--only-dup") ? rows.filter(r => /same|conflict|dead/.test(r.status) || r.defined.split(",").length > 1) : rows;
const rank = { conflict: 0, same: 1, dead: 2, single: 3 };
only.sort((a, b) => rank[a.status] - rank[b.status] || a.name.localeCompare(b.name));
if (process.argv.includes("--csv")) {
  console.log("var,defined_in,wins,values,used_css,used_js,used_html,status");
  for (const r of only) console.log([r.name, `"${r.defined}"`, `"${r.wins}"`, `"${r.values}"`, r.usedCss, r.usedJs, r.usedHtml, r.status].join(","));
} else {
  console.log("| var | status | wins (efektivní) | values (:root) | css | js | html | defined_in |\n|---|---|---|---|---|---|---|---|");
  for (const r of only) console.log(`| ${r.name} | ${r.status} | ${r.wins} | ${r.values} | ${r.usedCss} | ${r.usedJs} | ${r.usedHtml} | ${r.defined} |`);
}
console.error(`\n${rows.length} proměnných: ` + ["conflict", "same", "dead", "single"].map(s => s + "=" + rows.filter(r => r.status === s).length).join(" "));
