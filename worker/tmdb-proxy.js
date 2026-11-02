/**
 * MůjFlix — Cloudflare Worker: TMDB proxy.
 *
 * Secret (povinné):   TMDB_API_KEY      (v3 API key)   NEBO  TMDB_READ_TOKEN (v4 bearer)
 * Proměnná (volitelné): ALLOWED_ORIGINS  (čárkou oddělené, např. "https://mujflix.pages.dev,http://localhost:8080").
 *                        Bez ní se povolí jen mujflix.pages.dev (včetně náhledů) a localhost; vlastní doménu je nutné vypsat sem.
 *
 * Volání: GET https://<worker>/3/trending/all/week?language=cs-CZ
 *
 * Propojení zařízení (volitelné; vyžaduje KV namespace s vazbou SYNC, viz wrangler.toml):
 *   POST /sync/code  {id}    → {code}   jednorázový 6znakový kód (platí 10 min), který odkazuje na ID sady dat
 *   POST /sync/join  {code}  → {id}     výměna kódu za ID (kód se hned smaže; max 10 pokusů / 10 min na IP)
 *   POST /sync/pull  {id}    → {data}   načtení sady dat
 *   POST /sync/push  {id, data}  → {ok} uložení sady dat (max 4 MB)
 */
/* Sdílená paměť zdrojů (volitelné, používá stejné KV s vazbou SYNC; bez KV vrací 501 a appka funguje dál bez ní):
 *   POST /src/get    {key}         → {label, n}  nejčastěji hlášený funkční zdroj pro titul (key = "movie:123" / "tv:456")
 *   POST /src/report {key, label}  → {ok}        „tenhle zdroj fungoval“ (appka hlásí jednou za titul a zařízení)
 *   POST /src/probe {urls:[…]}     → {results:[true|false|null,…]}  ověří, jestli stránky zdrojů titul opravdu mají
 *                                   (true = stránka existuje, false = 404 / „nenalezeno“ / přesměrování na úvod, null = nevíme).
 *                                   Povoleny jsou jen https adresy ze seznamu zdrojů (PROBE_HOSTS), max 8 najednou; výsledek se na 30 min cachuje.
 * Neukládá se nic o uživateli ani zařízení, jen počet hlášení názvu zdroje pro titul. Vypnutí: proměnná SRC_SHARE = "off". */
const SRC_KEY_RE = /^(movie|tv):\d{1,9}$/;
const SRC_TTL = 60 * 60 * 24 * 90;
const SRC_MAX_LABELS = 12;
const srcHits = new Map(); // nejlepší snaha: omezení hlášení na IP (paměť jedné instance Workeru)

async function handleSrc(request, env, cors, url) {
  if (!env.SYNC || env.SRC_SHARE === "off") return json({ error: "Source sharing is not available" }, 501, cors);
  let body;
  try { body = JSON.parse(await request.text()); } catch { return json({ error: "Bad JSON" }, 400, cors); }
  if (!body || typeof body !== "object" || !SRC_KEY_RE.test(body.key || "")) return json({ error: "Bad key" }, 400, cors);
  const kvKey = "s:" + body.key;
  let counts = {};
  try { const raw = await env.SYNC.get(kvKey); if (raw) counts = JSON.parse(raw) || {}; } catch { counts = {}; }
  if (url.pathname === "/src/get") {
    let best = "", n = 0;
    for (const [l, c] of Object.entries(counts)) if (typeof c === "number" && c > n) { best = l; n = c; }
    return json(best ? { label: best, n } : { label: "", n: 0 }, 200, cors);
  }
  if (url.pathname === "/src/report") {
    const label = typeof body.label === "string" ? body.label.trim().slice(0, 40) : "";
    if (!label || /[<>"]/.test(label)) return json({ error: "Bad label" }, 400, cors);
    const ip = request.headers.get("CF-Connecting-IP") || "?", now = Date.now();
    const h = srcHits.get(ip) || { n: 0, t: now };
    if (now - h.t > 600000) { h.n = 0; h.t = now; }
    if (++h.n > 20) return json({ error: "Too many reports" }, 429, cors);
    srcHits.set(ip, h);
    if (srcHits.size > 2000) srcHits.clear();
    if (!(label in counts) && Object.keys(counts).length >= SRC_MAX_LABELS) return json({ ok: true, ignored: true }, 200, cors);
    counts[label] = Math.min(1000000, (counts[label] || 0) + 1);
    await env.SYNC.put(kvKey, JSON.stringify(counts), { expirationTtl: SRC_TTL });
    return json({ ok: true }, 200, cors);
  }
  return json({ error: "Not found" }, 404, cors);
}

/* Ověření zdrojů: Worker stáhne stránku zdroje (prohlížeč to kvůli CORS nesmí) a řekne, jestli titul opravdu existuje. */
const PROBE_HOSTS = new Set(["www.najserialy.io", "najserialy.io", "svetserialu.to", "www.svetserialu.to", "serialy.bombuj.si", "www.bombuj.si", "bombuj.si", "uzi.la", "www.uzi.la"]);
const PROBE_MAX = 8, PROBE_TTL = 1800, PROBE_LIMIT = 200;
const NOTFOUND_RE = /(\b404\b|nenalezen|nebyl[aoy]? nalezen|neexistuje|stránk[auy] nebyl|not found|nic (jsme )?nenašli)/i;
const probeHits = new Map();

const SLUG_STOP = new Set(["online", "film", "filmy", "serial", "serialy", "sezona", "serie", "epizoda", "dil", "cz", "sk", "hd", "zdarma", "titulky", "dabing"]);
function foldText(t) { return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function slugTokens(pathname) {
  const last = decodeURIComponent(pathname.split("/").filter(Boolean).filter(x => !/^s\d+e\d+$/i.test(x)).pop() || "");
  return foldText(last).split(/[^a-z0-9]+/).filter(t => t.length >= 3 && !/^\d+$/.test(t) && !SLUG_STOP.has(t));
}

async function probeOne(raw, ctx) {
  let u;
  try { u = new URL(String(raw)); } catch { return null; }
  u.hash = ""; // kotva (#player) na serveru nic neznamená
  if (u.protocol !== "https:" || !PROBE_HOSTS.has(u.hostname) || u.username || u.password) return null;
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const ck = new Request("https://probe.invalid/" + encodeURIComponent(u.href));
  if (cache) {
    const hit = await cache.match(ck);
    if (hit) { try { const j = await hit.json(); if (j.v === true || j.v === false) return j.v; } catch { /* nic */ } }
  }
  let v = null;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 4500);
  try {
    /* Přesměrování se sleduje ručně a po každém kroku se kontroluje, že míříme jen na povolené weby (https) – Worker se tak nedá použít ke stahování čehokoli jiného. */
    let cur = u.href, res = null;
    for (let hop = 0; hop < 5; hop++) {
      res = await fetch(cur, { redirect: "manual", signal: ac.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; MujFlix source check)", Accept: "text/html,application/xhtml+xml" } });
      const loc = res.status >= 300 && res.status < 400 ? res.headers.get("Location") : null;
      if (!loc) break;
      let nxt = null;
      try { nxt = new URL(loc, cur); } catch { nxt = null; }
      if (!nxt || nxt.protocol !== "https:" || !PROBE_HOSTS.has(nxt.hostname) || nxt.username || nxt.password) { res = null; break; }
      cur = nxt.href;
    }
    const fin = new URL(cur);
    if (!res || (res.status >= 300 && res.status < 400)) v = null;
    else if (!PROBE_HOSTS.has(fin.hostname)) v = null;
    else if (res.status === 404 || res.status === 410) v = false;
    else if (res.status >= 400) v = null; // 403/429/5xx (ochrana webu, výpadek): nevíme
    else if (fin.pathname.replace(/\/+$/, "") === "" && u.pathname.replace(/\/+$/, "") !== "") v = false; // přesměrováno na úvodní stranu
    else {
      const text = (await res.text()).slice(0, 80000);
      const m = /<title[^>]*>([^<]*)/i.exec(text);
      const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(text);
      const head = ((m ? m[1] : "") + " " + (h1 ? h1[1].replace(/<[^>]+>/g, " ") : "")).trim();
      const toks = slugTokens(u.pathname);
      if (m && NOTFOUND_RE.test(m[1])) v = false;
      else if (text.length < 1500) v = null;
      // měkká 404: web vrátí 200 a obecnou stránku, kde není nic z názvu titulu (ani v nadpisu, ani v textu); u stránek bez názvu v titulku se hledá v celém textu, ať se funkční zdroj omylem nepřeskočí
      else if (toks.length && !toks.some(t => foldText(head).includes(t)) && !toks.some(t => foldText(text).includes(t))) v = false;
      else v = true;
    }
  } catch { v = null; } finally { clearTimeout(timer); }
  if (cache && (v === true || v === false)) {
    const put = cache.put(ck, new Response(JSON.stringify({ v }), { headers: { "Cache-Control": "public, max-age=" + PROBE_TTL } }));
    if (ctx && ctx.waitUntil) ctx.waitUntil(put);
  }
  return v;
}

async function handleProbe(request, cors, ctx) {
  let body;
  try { body = JSON.parse(await request.text()); } catch { return json({ error: "Bad JSON" }, 400, cors); }
  const urls = body && Array.isArray(body.urls) ? body.urls : null;
  if (!urls || !urls.length || urls.length > PROBE_MAX || urls.some(x => typeof x !== "string" || x.length > 300)) return json({ error: "Bad urls" }, 400, cors);
  const ip = request.headers.get("CF-Connecting-IP") || "?", now = Date.now();
  const h = probeHits.get(ip) || { n: 0, t: now };
  if (now - h.t > 600000) { h.n = 0; h.t = now; }
  h.n += urls.length;
  probeHits.set(ip, h);
  if (probeHits.size > 2000) probeHits.clear();
  if (h.n > PROBE_LIMIT) return json({ error: "Too many checks" }, 429, cors);
  const results = await Promise.all(urls.map(x => probeOne(x, ctx)));
  return json({ results }, 200, cors);
}

const SYNC_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bez 0/O/1/I
const SYNC_CODE_TTL = 600;
const SYNC_DATA_TTL = 60 * 60 * 24 * 365;
const SYNC_MAX_BYTES = 4 * 1024 * 1024;
const SYNC_ID_RE = /^[A-Za-z0-9_-]{32,64}$/;

function makeCode() {
  const b = crypto.getRandomValues(new Uint8Array(6));
  let c = "";
  for (const x of b) c += SYNC_ALPHABET[x % SYNC_ALPHABET.length];
  return c;
}

async function handleSync(request, env, cors, url) {
  if (!env.SYNC) return json({ error: "Sync is not configured" }, 501, cors);
  // velké tělo se odmítne ještě před čtením (pozor: bez hlavičky Content-Length se kontroluje až po přečtení)
  if (parseInt(request.headers.get("Content-Length") || "0", 10) > SYNC_MAX_BYTES + 65536) return json({ error: "Too large" }, 413, cors);
  let body;
  try { body = JSON.parse(await request.text()); } catch { return json({ error: "Bad JSON" }, 400, cors); }
  if (!body || typeof body !== "object") return json({ error: "Bad body" }, 400, cors);
  const route = url.pathname;

  if (route === "/sync/code") {
    if (!SYNC_ID_RE.test(body.id || "")) return json({ error: "Bad id" }, 400, cors);
    // kód jde vytvořit jen pro sadu dat, která už existuje (čtení je zdarma, zápisy v KV na free tarifu ne)
    if (!(await env.SYNC.get("d:" + body.id))) return json({ error: "Unknown id" }, 404, cors);
    for (let i = 0; i < 5; i++) {
      const code = makeCode();
      if (await env.SYNC.get("c:" + code)) continue;
      await env.SYNC.put("c:" + code, body.id, { expirationTtl: SYNC_CODE_TTL });
      return json({ code, ttl: SYNC_CODE_TTL }, 200, cors);
    }
    return json({ error: "Try again" }, 503, cors);
  }

  if (route === "/sync/join") {
    const ip = request.headers.get("CF-Connecting-IP") || "x";
    const rk = "r:" + ip;
    const tries = parseInt((await env.SYNC.get(rk)) || "0", 10);
    if (tries >= 10) return json({ error: "Too many attempts" }, 429, cors);
    const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    // počítají se jen neúspěšné pokusy (méně zápisů do KV a nepoškodí to správné zadání)
    const fail = async (msg, status) => { await env.SYNC.put(rk, String(tries + 1), { expirationTtl: 600 }); return json({ error: msg }, status, cors); };
    if (code.length !== 6) return fail("Bad code", 400);
    const id = await env.SYNC.get("c:" + code);
    if (!id) return fail("Unknown code", 404);
    await env.SYNC.delete("c:" + code);
    return json({ id }, 200, cors);
  }

  if (route === "/sync/pull" || route === "/sync/push") {
    if (!SYNC_ID_RE.test(body.id || "")) return json({ error: "Bad id" }, 400, cors);
    const key = "d:" + body.id;
    if (route === "/sync/pull") {
      const raw = await env.SYNC.get(key);
      if (raw) {
        // čtení prodlouží platnost dat, nejvýš jednou týdně (zápisy do KV jsou na free tarifu omezené)
        const rk = "r:" + body.id;
        try {
          if (!(await env.SYNC.get(rk))) {
            await env.SYNC.put(key, raw, { expirationTtl: SYNC_DATA_TTL });
            await env.SYNC.put(rk, "1", { expirationTtl: 60 * 60 * 24 * 7 });
          }
        } catch { /* obnova platnosti nesmí shodit čtení */ }
      }
      return json({ data: raw ? JSON.parse(raw) : null }, 200, cors);
    }
    const raw = JSON.stringify(body.data || {});
    if (raw.length > SYNC_MAX_BYTES) return json({ error: "Too large" }, 413, cors);
    await env.SYNC.put(key, raw, { expirationTtl: SYNC_DATA_TTL });
    return json({ ok: true }, 200, cors);
  }
  return json({ error: "Not found" }, 404, cors);
}

const ALLOWED_PATHS = /^\/3\/(trending\/(all|movie|tv|person)\/(day|week)|(tv|movie)\/(popular|top_rated|now_playing|upcoming|on_the_air|airing_today|\d+(\/(season\/\d+|videos|translations|watch\/providers|credits|similar|recommendations|external_ids|images))?)|search\/(multi|movie|tv|person)|discover\/(movie|tv)|genre\/(movie|tv)\/list|person\/\d+(\/(combined_credits|tv_credits|movie_credits))?|configuration)$/;

const CACHE_TTL = 3600; // sekund

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  // Bez proměnné ALLOWED_ORIGINS se povolí jen web na mujflix.pages.dev (i náhledy PR) a localhost, Worker se nikdy neotevře celému webu.
  const dflt = /^https:\/\/([a-z0-9-]+\.)?mujflix\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const ok = allowed.length === 0 ? (dflt ? origin : "") : (allowed.includes(origin) ? origin : "");
  const h = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  if (ok) h["Access-Control-Allow-Origin"] = ok;
  return h;
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cache-Control": "no-store", // chyby, sync a hlášení zdrojů se nikde po cestě necachují (TMDB odpovědi mají vlastní Cache-Control)
      ...cors,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!cors["Access-Control-Allow-Origin"]) return json({ error: "Origin not allowed" }, 403, cors);
    const reqUrl = new URL(request.url);
    if (reqUrl.pathname.startsWith("/sync/")) {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
      return handleSync(request, env, cors, reqUrl);
    }
    if (reqUrl.pathname.startsWith("/src/")) {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
      if (reqUrl.pathname === "/src/probe") return handleProbe(request, cors, ctx);
      return handleSrc(request, env, cors, reqUrl);
    }
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
    if (!env.TMDB_API_KEY && !env.TMDB_READ_TOKEN) return json({ error: "Proxy is not configured" }, 500, cors);

    const url = new URL(request.url);
    if (!ALLOWED_PATHS.test(url.pathname)) return json({ error: "Path not allowed" }, 404, cors);

    const target = new URL("https://api.themoviedb.org" + url.pathname);
    url.searchParams.forEach((v, k) => { if (k !== "api_key") target.searchParams.set(k, v); });
    const headers = { Accept: "application/json" };
    if (env.TMDB_READ_TOKEN) headers.Authorization = "Bearer " + env.TMDB_READ_TOKEN;
    else target.searchParams.set("api_key", env.TMDB_API_KEY);

    // Cache klíč neobsahuje tajný klíč ani Origin
    const cacheKey = new Request(url.origin + url.pathname + "?" + [...url.searchParams].filter(([k]) => k !== "api_key").sort().map(([k, v]) => k + "=" + v).join("&"));
    const cache = caches.default;
    let res = await cache.match(cacheKey);
    if (!res) {
      let upstream;
      try {
        upstream = await fetch(target.toString(), { headers });
      } catch {
        // TMDB nedostupné: vrať čitelnou chybu s CORS hlavičkami (jinak prohlížeč uvidí jen „CORS error")
        return json({ error: "Upstream unavailable" }, 502, cors);
      }
      res = new Response(upstream.body, upstream);
      if (upstream.ok) {
        res.headers.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
      }
    }
    const out = new Response(res.body, res);
    Object.entries(cors).forEach(([k, v]) => out.headers.set(k, v));
    out.headers.set("X-Content-Type-Options", "nosniff");
    return out;
  },
};
