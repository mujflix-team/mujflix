/* global Request, console, process */
// Živá kontrola zdrojů: spustí stejný kód, který běží ve Workeru (/src/probe), proti skutečným webům.
// Použití (na svém počítači s internetem):  npm run check-sources
// Očekává: filmy/seriály, které na webech jsou → true, vymyšlené → false. Řádky s ✗ pošli Claudovi.
import w from "../worker/tmdb-proxy.js";

const env = { SYNC: { get: async () => null, put: async () => {}, delete: async () => {} }, ALLOWED_ORIGINS: "https://a.b" };
const probe = async urls => {
  const r = await w.fetch(new Request("https://w/src/probe", { method: "POST", headers: { Origin: "https://a.b", "CF-Connecting-IP": "9.9.9.9" }, body: JSON.stringify({ urls }) }), env, {});
  return (await r.json()).results || urls.map(() => "chyba " + r.status);
};

const REAL_MOVIE = { slug: "oppenheimer", year: 2023 }, REAL_TV = { slug: "breaking-bad" }, FAKE = "nonexistent-xyzzy-qwerty";
const cases = [
  ["Bombuj film", `https://www.bombuj.si/online-film-${REAL_MOVIE.slug}-${REAL_MOVIE.year}`, true],
  ["Bombuj film", `https://www.bombuj.si/online-film-${FAKE}-2031`, false],
  ["Bombuj bez roku", `https://www.bombuj.si/online-film-${REAL_MOVIE.slug}`, true],
  ["Bombuj seriál", `https://serialy.bombuj.si/serial/${REAL_TV.slug}-1x01`, true],
  ["Bombuj seriál", `https://serialy.bombuj.si/serial/${FAKE}-1x01`, false],
  ["SvětSeriálů", `https://svetserialu.to/serial/${REAL_TV.slug}/s01e01`, true],
  ["SvětSeriálů", `https://svetserialu.to/serial/${FAKE}/s01e01`, false],
  ["NajSerialy", `https://www.najserialy.io/serial/${REAL_TV.slug}/s01e01`, true],
  ["NajSerialy", `https://www.najserialy.io/serial/${FAKE}/s01e01`, false],
  ["Uzi.la film", `https://uzi.la/p/forrest-gump`, true],
  ["Uzi.la film", `https://uzi.la/p/${FAKE}`, false],
  ["Uzi.la seriál", `https://uzi.la/tv/${REAL_TV.slug}/S01E01`, true],
  ["Uzi.la seriál", `https://uzi.la/tv/${FAKE}/S01E01`, false],
];
const out = [];
for (let i = 0; i < cases.length; i += 8) out.push(...await probe(cases.slice(i, i + 8).map(c => c[1])));
let bad = 0;
for (const [i, [name, url, want]] of cases.entries()) {
  const got = out[i], ok = got === want;
  if (!ok) bad++;
  console.log((ok ? "✓" : "✗") + " " + name.padEnd(16) + " čekáno " + String(want).padEnd(5) + " dostal " + String(got).padEnd(6) + " " + url);
}
console.log(bad ? `\n${bad} řádků nesedí – pošli mi je a upravím detekci (null = web nic nevrátil / blokuje).` : "\nVšechno sedí.");
process.exit(bad ? 1 : 0);
