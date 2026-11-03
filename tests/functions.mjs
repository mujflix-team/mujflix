// Test Pages Function pro náhled odkazů (functions/): bez sítě, TMDB i Cache API jsou zamockované.
import { readFileSync } from "node:fs";
import { onRequest as onF } from "../functions/f/[[path]].js";
import { onRequest as onS } from "../functions/s/[[path]].js";
import { onRequest as onC } from "../functions/c/[[path]].js";
import { SECURITY_HEADERS } from "../functions/_shared/og.js";
import { check, finish } from "./helpers.mjs";

const INDEX = readFileSync("index.html", "utf8");
const WORKER = "https://worker.example";
const DISCORD = "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)";
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36";

const assets = { fetch: async req => {
  const p = new URL(req.url).pathname;
  if (p === "/config.js") return new Response(`window.TMDB_PROXY_URL = "${WORKER}/";`);
  if (p === "/") return new Response(INDEX, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
  return new Response("nenalezeno", { status: 404 });
} };

const store = new Map();
globalThis.caches = { default: {
  match: async r => { const v = store.get(r.url); return v ? new Response(v) : undefined; },
  put: async (r, res) => { store.set(r.url, await res.text()); },
} };

const calls = [];
const mkFetch = handler => async (url, init) => { calls.push({ url: String(url), headers: init && init.headers }); return handler(String(url), init); };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
const MOVIE = { id: 603, title: "Matrix", overview: "Programátor Neo zjistí, že svět kolem něj je simulace. ".repeat(8), backdrop_path: "/bd.jpg", poster_path: "/po.jpg" };

let nextCalls = 0;
const staticPage = () => { nextCalls++; return new Response(INDEX, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }); };
async function run(fn, path, { ua = DISCORD, fetchFn, env = {}, method = "GET", next = staticPage } = {}) {
  store.clear(); calls.length = 0; nextCalls = 0;
  const res = await fn({ request: new Request("https://mujflix.pages.dev" + path, { method, headers: { "User-Agent": ua } }), env: { ASSETS: assets, ...env }, fetchFn, next });
  return { res, text: await res.text() };
}
const metaOf = (html, prop) => { const m = new RegExp(`<meta (?:property|name)="${prop}" content="([^"]*)"`).exec(html); return m ? m[1] : null; };
const isDefault = t => t === INDEX;

// --- Bot + platné ?id=: tagy s názvem a obrázkem z TMDB (přes Worker, s Origin, bez klíče)
{
  const { res, text } = await run(onF, "/f/matrix?id=603", { fetchFn: mkFetch(() => json(MOVIE)) });
  check("funkce: Discordbot a platné ?id= dostane og:title s názvem a obrázek z TMDB", metaOf(text, "og:title") === "Matrix – MůjFlix" && metaOf(text, "og:image") === "https://image.tmdb.org/t/p/w780/bd.jpg" && metaOf(text, "twitter:card") === "summary_large_image" && metaOf(text, "og:url") === "https://mujflix.pages.dev/f/matrix?id=603" && /<link rel="canonical" href="https:\/\/mujflix\.pages\.dev\/f\/matrix\?id=603"/.test(text), text.slice(text.indexOf("<title>"), text.indexOf("<title>") + 400));
  check("funkce: popis z TMDB je nejvýš ~200 znaků, status 200, HTML a hlavičky zabezpečení i Vary (u bota)", metaOf(text, "og:description").length <= 205 && /…$/.test(metaOf(text, "og:description")) && res.status === 200 && /text\/html/.test(res.headers.get("content-type")) && res.headers.get("X-Frame-Options") === "DENY" && res.headers.get("Vary") === "User-Agent", metaOf(text, "og:description"));
  const c = calls[0];
  check("funkce: TMDB se volá jen přes Worker, povolenou cestou, s Origin a bez klíče", calls.length === 1 && c.url === WORKER + "/3/movie/603?language=cs-CZ" && c.headers.Origin === "https://mujflix.pages.dev" && !/api_key|Authorization/i.test(JSON.stringify(c)), JSON.stringify(calls));
  check("funkce: zbytek stránky (CSP, skripty, ostatní og: tagy) zůstane", text.includes('http-equiv="Content-Security-Policy"') && text.includes('og:site_name') && text.includes("js/core/version.js"));
}
// --- Seriál (/s/ i /c/ = tv), bez backdropu plakát a malá karta
{
  const tv = { id: 1399, name: "Hra o trůny", overview: "Osm rodů.", poster_path: "/p.jpg" };
  const a = await run(onS, "/s/hra-o-truny?id=1399", { fetchFn: mkFetch(() => json(tv)) });
  const b = await run(onC, "/c/hra-o-truny-s01e02?id=1399", { fetchFn: mkFetch(() => json(tv)) });
  check("funkce: seriál (/s/ a /c/) se čte jako tv; bez backdropu je plakát w500 a card=summary", /\/3\/tv\/1399\?/.test(calls[0].url) && metaOf(a.text, "og:image") === "https://image.tmdb.org/t/p/w500/p.jpg" && metaOf(a.text, "twitter:card") === "summary" && metaOf(b.text, "og:title") === "Hra o trůny – MůjFlix", metaOf(a.text, "og:image"));
}
// --- Běžný prohlížeč: původní index.html beze změny, TMDB se nevolá
{
  const { res, text } = await run(onF, "/f/matrix?id=603", { ua: CHROME, fetchFn: mkFetch(() => json(MOVIE)) });
  check("funkce: běžný prohlížeč dostane původní index.html beze změny (pustí se dál přes next()) a TMDB se nevolá", isDefault(text) && calls.length === 0 && nextCalls === 1 && res.status === 200, String(calls.length));
  const nf = await run(onF, "/f/matrix?id=603", { next: () => new Response("<h1>Stránka nebyla nalezena</h1>", { status: 404, headers: { "Content-Type": "text/html" } }), fetchFn: mkFetch(() => json(MOVIE)) });
  check("funkce: když statická stránka není (404), bot dostane totéž a TMDB se nevolá", nf.res.status === 404 && /nebyla nalezena/.test(nf.text) && calls.length === 0);
  const nx = await run(onF, "/f/matrix?id=603", { next: () => { throw new Error("next selhal"); }, fetchFn: mkFetch(() => json(MOVIE)) });
  check("funkce: když selže statická vrstva, vrátí se 502 a TMDB se nevolá", nx.res.status === 502 && calls.length === 0);
}
// --- Escapování: název z TMDB i z adresy se v HTML neprovede
{
  const evil = { id: 1, title: `</title><script>alert(1)</script>" onload="x' & <b>`, overview: `<img src=x onerror=alert(2)> "citace" & 'apostrof'`, backdrop_path: "/ok.jpg" };
  const { text } = await run(onF, "/f/x?id=1", { fetchFn: mkFetch(() => json(evil)) });
  check("funkce: název a popis s <script>, uvozovkami a & se v HTML neprovede (jsou escapované)", !/<script>alert/.test(text) && !/<img src=x/.test(text) && text.includes("&lt;script&gt;alert(1)&lt;/script&gt;") && text.includes("&quot;") && text.includes("&amp;") && !/<title>[^<]*<script/.test(text));
  const r2 = await run(onF, "/f/%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E", { fetchFn: mkFetch(url => json(/search/.test(url) ? { results: [] } : null)) });
  check("funkce: škodlivá adresa se nikam nevloží (výchozí tagy)", isDefault(r2.text) && !/alert\(1\)/.test(r2.text.replace(INDEX, "")));
}
// --- Obrázek jen z image.tmdb.org
{
  const bad = { id: 2, title: "Zlý obrázek", overview: "x", backdrop_path: "https://evil.example/x.jpg", poster_path: "/../../evil.jpg" };
  const { text } = await run(onF, "/f/zly?id=2", { fetchFn: mkFetch(() => json(bad)) });
  const img = metaOf(text, "og:image");
  check("funkce: obrázek se bere jen z image.tmdb.org, jinak výchozí obrázek MůjFlix", img === "https://mujflix.pages.dev/icons/og-image.png" && !/evil/.test(text.replace(INDEX, "")), img);
}
// --- Chyby: TMDB 500, 404, timeout, neplatné ID → výchozí tagy
{
  const e500 = await run(onF, "/f/matrix?id=603", { fetchFn: mkFetch(() => json({ error: "x" }, 500)) });
  check("funkce: TMDB vrátí 500 → výchozí tagy (index.html)", isDefault(e500.text) && e500.res.status === 200);
  const thrown = await run(onF, "/f/matrix?id=603", { fetchFn: mkFetch(() => { throw new Error("síť"); }) });
  check("funkce: TMDB vyhodí chybu → výchozí tagy", isDefault(thrown.text));
  const t0 = Date.now();
  const slow = await run(onF, "/f/matrix?id=603", { env: { OG_TIMEOUT_MS: "60" }, fetchFn: mkFetch((u, init) => new Promise((_, rej) => { init.signal.addEventListener("abort", () => rej(new Error("abort"))); })) });
  check("funkce: pomalý TMDB (timeout) → výchozí tagy a odpověď přijde včas", isDefault(slow.text) && Date.now() - t0 < 1500, String(Date.now() - t0));
  const nf = await run(onF, "/f/neexistuje?id=999999999", { fetchFn: mkFetch(url => /search/.test(url) ? json({ results: [] }) : json({ success: false }, 404)) });
  check("funkce: neexistující titul → výchozí tagy", isDefault(nf.text));
  const bad = await run(onF, "/f/matrix?id=abc%26x%3D1", { fetchFn: mkFetch(url => /search/.test(url) ? json({ results: [] }) : json(MOVIE)) });
  check("funkce: neplatné ID se nepoužije (volá se jen hledání) a nic se nenajde → výchozí tagy", isDefault(bad.text) && calls.every(c => /\/3\/search\/movie\?/.test(c.url)), JSON.stringify(calls.map(c => c.url)));
}
// --- Bez ?id= záložní hledání podle názvu z adresy
{
  const { text } = await run(onS, "/s/dark", { fetchFn: mkFetch(() => json({ results: [{ id: 70523, name: "Dark Matter", overview: "x" }, { id: 70524, name: "Dark", overview: "Zmizí dítě.", backdrop_path: "/d.jpg" }] })) });
  check("funkce: bez ?id= se titul najde hledáním podle názvu z adresy (přesná shoda názvu má přednost)", /\/3\/search\/tv\?language=cs-CZ&query=dark$/.test(calls[0].url) && metaOf(text, "og:title") === "Dark – MůjFlix" && metaOf(text, "og:url") === "https://mujflix.pages.dev/s/dark?id=70524", calls[0].url);
}
// --- Všechna volání TMDB mají jen povolené cesty Workeru
{
  const ALLOWED = /^\/3\/(movie\/\d+|tv\/\d+|search\/(movie|tv|multi))$/;
  const all = [];
  for (const [fn, p] of [[onF, "/f/matrix?id=603"], [onS, "/s/dark"], [onC, "/c/dark-s01e02"], [onF, "/f/x?id=abc"]]) {
    await run(fn, p, { fetchFn: mkFetch(() => json({ results: [] }, 200)) });
    calls.forEach(c => all.push(new URL(c.url)));
  }
  check("funkce: volá jen /3/movie/<id>, /3/tv/<id> a /3/search/(movie|tv|multi) na Workeru", all.length >= 4 && all.every(u => u.origin === WORKER && ALLOWED.test(u.pathname)), all.map(u => u.pathname).join(" "));
}
// --- Cache: druhý požadavek stejného titulu TMDB nevolá
{
  store.clear(); calls.length = 0;
  const f = mkFetch(() => json(MOVIE));
  const mk = () => ({ request: new Request("https://mujflix.pages.dev/f/matrix?id=603", { headers: { "User-Agent": DISCORD } }), env: { ASSETS: assets }, fetchFn: f, next: staticPage });
  const a = await (await onF(mk())).text(); const b = await (await onF(mk())).text();
  check("funkce: výsledek se cachuje (druhý požadavek nevolá TMDB a vrátí totéž)", calls.length === 1 && a === b && store.size === 1, String(calls.length));
}
// --- HEAD i jiný způsob nezlomí funkci; boti WhatsApp a Telegram
{
  const w = await run(onF, "/f/matrix?id=603", { ua: "WhatsApp/2.23.20 A", fetchFn: mkFetch(() => json(MOVIE)) });
  const t = await run(onF, "/f/matrix?id=603", { ua: "TelegramBot (like TwitterBot)", fetchFn: mkFetch(() => json(MOVIE)) });
  const p = await run(onF, "/f/matrix?id=603", { ua: DISCORD, method: "POST", fetchFn: mkFetch(() => json(MOVIE)) });
  check("funkce: WhatsApp a TelegramBot jsou boti; POST od bota se nezpracuje (index.html)", metaOf(w.text, "og:title") === "Matrix – MůjFlix" && metaOf(t.text, "og:title") === "Matrix – MůjFlix" && isDefault(p.text));
}
// --- Hlavičky zabezpečení ve funkci = blok /* v _headers
{
  const block = readFileSync("_headers", "utf8").split("\n/*\n")[1] || "";
  const fromFile = {};
  block.split("\n").forEach(l => { const m = /^\s+([\w-]+):\s*(.+)$/.exec(l); if (m) fromFile[m[1]] = m[2].trim(); });
  check("hlavičky zabezpečení ve funkci jsou stejné jako v _headers pro /*", Object.keys(fromFile).length >= 6 && Object.entries(fromFile).every(([k, v]) => SECURITY_HEADERS[k] === v) && Object.keys(SECURITY_HEADERS).length === Object.keys(fromFile).length, JSON.stringify(fromFile));
}
finish();
