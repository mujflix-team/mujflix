/* global process, console */
// Zdroj pravdy je package.json. Tento skript z něj vygeneruje js/core/version.js.
//   node scripts/version.mjs            → jen synchronizuje (běží automaticky před `npm test`)
//   node scripts/version.mjs patch|minor|major|2.4.0 → zvedne verzi, synchronizuje, přidá nadpis do docs/CHANGELOG.md
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const arg = process.argv[2];

if (arg) {
  const [ma, mi, pa] = pkg.version.split(".").map(Number);
  const next = { major: `${ma + 1}.0.0`, minor: `${ma}.${mi + 1}.0`, patch: `${ma}.${mi}.${pa + 1}` }[arg] || arg;
  if (!/^\d+\.\d+\.\d+$/.test(next)) { console.error("Použití: patch | minor | major | X.Y.Z"); process.exit(1); }
  pkg.version = next;
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  const cl = readFileSync("docs/CHANGELOG.md", "utf8");
  if (!cl.includes(`## ${next}`)) writeFileSync("docs/CHANGELOG.md", cl.replace("# Changelog\n", `# Changelog\n\n## ${next}\n### Nově\n- \n\n### Opraveno\n- \n`));
}

// Na Cloudflare Pages (Build command: node scripts/version.mjs) se k verzi přidá krátké ID commitu a datum sestavení
const env = process.env || {};
const sha = String(env.CF_PAGES_COMMIT_SHA || env.GITHUB_SHA || "").replace(/[^0-9a-f]/gi, "").slice(0, 7);
const built = sha ? `window.MF_BUILD = "${sha}";\nwindow.MF_BUILD_DATE = "${new Date().toISOString().slice(0, 10)}";\n` : "";
const out = `/* GENEROVÁNO z package.json (node scripts/version.mjs) – needituj ručně. */\nwindow.MF_VERSION = "${pkg.version}";\n${built}`;
let cur = ""; try { cur = readFileSync("js/core/version.js", "utf8"); } catch { /* soubor ještě neexistuje */ }
if (cur !== out) writeFileSync("js/core/version.js", out);
console.log("Verze:", pkg.version);
