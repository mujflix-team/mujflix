/**
 * MůjFlix — Cloudflare Worker: TMDB proxy.
 *
 * Secret (povinné):   TMDB_API_KEY      (v3 API key)   NEBO  TMDB_READ_TOKEN (v4 bearer)
 * Proměnná (volitelné): ALLOWED_ORIGINS  (čárkou oddělené, např. "https://mujflix.pages.dev,http://localhost:8080")
 *
 * Volání: GET https://<worker>/3/trending/all/week?language=cs-CZ
 */
const ALLOWED_PATHS = /^\/3\/(trending\/(all|movie|tv|person)\/(day|week)|(tv|movie)\/(popular|top_rated|now_playing|upcoming|on_the_air|airing_today|\d+(\/(season\/\d+|videos|translations|watch\/providers|credits|similar|recommendations|external_ids|images))?)|search\/(multi|movie|tv|person)|discover\/(movie|tv)|genre\/(movie|tv)\/list|person\/\d+(\/(combined_credits|tv_credits|movie_credits))?|configuration)$/;

const CACHE_TTL = 3600; // sekund

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const ok = allowed.length === 0 ? "*" : (allowed.includes(origin) ? origin : "");
  const h = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors },
  });
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
    if (!cors["Access-Control-Allow-Origin"]) return json({ error: "Origin not allowed" }, 403, cors);
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
      const upstream = await fetch(target.toString(), { headers });
      res = new Response(upstream.body, upstream);
      if (upstream.ok) {
        res.headers.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
      }
    }
    const out = new Response(res.body, res);
    Object.entries(cors).forEach(([k, v]) => out.headers.set(k, v));
    return out;
  },
};
