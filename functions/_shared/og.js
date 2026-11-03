// Náhled odkazu na titul pro chaty (Discord, WhatsApp, Telegram, Facebook, Slack, LinkedIn, X).
// Běžný prohlížeč dostane beze změny index.html; jen známí boti dostanou kopii s og: tagy daného titulu z TMDB.
// TMDB se volá přes stávající Worker (žádný klíč tady ani v repozitáři). Když cokoli selže, vrátí se výchozí index.html.

const SITE_ORIGIN = "https://mujflix.pages.dev"; // Worker pouští jen tento Origin (a localhost)
const BOT_RE = /Discordbot|Twitterbot|facebookexternalhit|TelegramBot|WhatsApp|Slackbot|LinkedInBot/i;
const IMG_BASE = "https://image.tmdb.org/t/p/";
const DEFAULT_TIMEOUT_MS = 2500;
const CACHE_TTL = 86400; // 1 den

// Stejné hlavičky jako v _headers pro /*  (soubor _headers se na odpovědi Functions nemusí uplatnit; test hlídá shodu)
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function slugify(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function shorten(text, max = 200) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:–-]+$/, "") + "…";
}

/* Obrázek jen z image.tmdb.org: backdrop (16:9, velká karta), jinak plakát (malá karta) */
export function pickImage(item) {
  const ok = p => typeof p === "string" && /^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png)$/.test(p);
  if (ok(item.backdrop_path)) return { url: IMG_BASE + "w780" + item.backdrop_path, card: "summary_large_image" };
  if (ok(item.poster_path)) return { url: IMG_BASE + "w500" + item.poster_path, card: "summary" };
  return null;
}

/* Vloží o og:/twitter: tagy titulu; tagy, které nahrazuje, ze šablony odstraní */
export function injectMeta(html, m) {
  const strip = [
    /<meta\s+property="og:(?:title|description|image|image:width|image:height|image:alt|url)"[^>]*>\s*/gi,
    /<meta\s+name="twitter:(?:card|image)"[^>]*>\s*/gi,
    /<link\s+rel="canonical"[^>]*>\s*/gi,
    /<title>[\s\S]*?<\/title>\s*/i,
  ];
  let out = html;
  strip.forEach(re => { out = out.replace(re, ""); });
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<link rel="canonical" href="${esc(m.url)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(m.url)}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    `<meta property="og:image:alt" content="${esc(m.name)}" />`,
    `<meta name="twitter:card" content="${esc(m.card)}" />`,
    `<meta name="twitter:image" content="${esc(m.image)}" />`,
  ].join("\n    ");
  return out.includes("</head>") ? out.replace("</head>", "    " + tags + "\n  </head>") : out;
}

function withHeaders(res, extra) {
  const h = new Headers(res.headers);
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => h.set(k, v));
  h.set("Vary", "User-Agent");
  Object.entries(extra || {}).forEach(([k, v]) => h.set(k, v));
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

async function proxyBase(env) {
  let base = env.TMDB_PROXY_URL || "";
  if (!base) {
    try {
      const r = await env.ASSETS.fetch(new Request(SITE_ORIGIN + "/config.js"));
      const m = /TMDB_PROXY_URL\s*=\s*["']([^"']+)["']/.exec(await r.text());
      base = m ? m[1] : "";
    } catch (e) { void e; }
  }
  return /^https:\/\//.test(base) ? base.replace(/\/+$/, "") : "";
}

async function tmdb(fetchFn, base, path, signal) {
  const r = await fetchFn(base + path, { headers: { Origin: SITE_ORIGIN, Accept: "application/json" }, signal });
  if (!r || !r.ok) return null;
  return r.json();
}

async function buildPreview({ env, url, type, html, fetchFn, signal }) {
  const base = await proxyBase(env);
  if (!base) return null;
  const idRaw = url.searchParams.get("id") || "";
  const id = /^\d{1,9}$/.test(idRaw) ? idRaw : "";
  const slug = (url.pathname.split("/")[2] || "").replace(/-s\d{1,2}e\d{1,3}$/i, "");
  let item = null;
  if (id) {
    const d = await tmdb(fetchFn, base, `/3/${type}/${id}?language=cs-CZ`, signal).catch(() => null);
    if (d && d.id) item = d;
  }
  if (!item && slug) {
    let q = slug;
    try { q = decodeURIComponent(slug); } catch (e) { void e; }
    const d = await tmdb(fetchFn, base, `/3/search/${type}?language=cs-CZ&query=${encodeURIComponent(slugify(q).replace(/-/g, " "))}`, signal).catch(() => null);
    const list = (d && d.results) || [];
    item = list.find(x => slugify(x.title || x.name) === slugify(q)) || list[0] || null;
  }
  if (!item || !item.id) return null;
  const name = String(item.title || item.name || "").trim();
  if (!name) return null;
  const img = pickImage(item) || { url: SITE_ORIGIN + "/icons/og-image.png", card: "summary_large_image" };
  const pageUrl = url.origin + url.pathname + "?id=" + item.id;
  // Popis: „Seriál · 2005 · ★ 7,9 — začátek děje…“ (děj zkrácený, ať celek nepřesáhne ~200 znaků)
  const year = String(item.release_date || item.first_air_date || "").slice(0, 4);
  const rating = Number(item.vote_average) > 0 ? "★ " + Number(item.vote_average).toFixed(1).replace(".", ",") : "";
  const facts = [type === "tv" ? "Seriál" : "Film", /^\d{4}$/.test(year) ? year : "", rating].filter(Boolean).join(" · ");
  const plot = shorten(item.overview, 200 - facts.length - 3);
  const description = plot ? facts + " — " + plot : facts;
  return injectMeta(html, { name, title: name + " – MůjFlix", description, url: pageUrl, image: img.url, card: img.card });
}

export async function handle(context, type) {
  const { request, env } = context;
  const fetchFn = context.fetchFn || fetch;
  const ua = request.headers.get("User-Agent") || "";
  /* Běžný prohlížeč: žádná práce navíc, pustí se dál stejnou cestou jako bez funkce (static + _redirects → index.html) */
  if (!BOT_RE.test(ua) || (request.method !== "GET" && request.method !== "HEAD")) return context.next();
  let base = null;
  try {
    base = await context.next();
    const isHtml = r => r && r.ok && /text\/html/i.test(r.headers.get("Content-Type") || "");
    let shell = base;
    /* Adresa /f|s|c/… nemá vlastní soubor a pravidlo z _redirects se tu nemusí uplatnit → statická vrstva vrátí 404.html.
       Botovi pak vezmeme hlavní stránku přímo z ASSETS (stejně jako ji dostane prohlížeč po přesměrování). */
    if (!isHtml(shell) && env.ASSETS) {
      for (const p of ["/", "/index.html"]) {
        const r = await env.ASSETS.fetch(new Request(SITE_ORIGIN + p, { redirect: "follow" })).catch(() => null);
        if (isHtml(r)) { shell = r; break; }
      }
    }
    if (!isHtml(shell)) return base;
    const url = new URL(request.url);
    const html = await shell.clone().text();
    const timeoutMs = Number(env.OG_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
    const idRaw = url.searchParams.get("id") || "";
    const keyPart = /^\d{1,9}$/.test(idRaw) ? idRaw : "q-" + (url.pathname.split("/")[2] || "");
    const cacheKey = new Request(`${SITE_ORIGIN}/__og/${type}/${encodeURIComponent(keyPart)}`);
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const hit = cache ? await cache.match(cacheKey).catch(() => null) : null;
    let out = hit ? await hit.text() : null;
    if (!out) {
      const ctl = new AbortController();
      let timer;
      const timeout = new Promise(res => { timer = setTimeout(() => { ctl.abort(); res(null); }, timeoutMs); });
      out = await Promise.race([buildPreview({ env, url, type, html, fetchFn, signal: ctl.signal }).catch(() => null), timeout]);
      clearTimeout(timer);
      if (out && cache) {
        const put = cache.put(cacheKey, new Response(out, { headers: { "Cache-Control": `public, max-age=${CACHE_TTL}` } })).catch(() => {});
        if (context.waitUntil) context.waitUntil(put);
      }
    }
    return withHeaders(new Response(out || html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }), { "Cache-Control": out ? "public, max-age=300" : "public, max-age=60" });
  } catch (e) { void e; return base || new Response("Služba je dočasně nedostupná", { status: 502 }); }
}
