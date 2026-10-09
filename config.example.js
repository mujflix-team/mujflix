/* Zkopíruj jako config.js (config.js je v .gitignore). */

// DOPORUČENO pro veřejný provoz: Cloudflare Worker (viz worker/ a README) — klíč zůstane na serveru.
window.TMDB_PROXY_URL = "https://mujflix-tmdb-proxy.<tvuj-ucet>.workers.dev";

// Jen pro lokální vývoj bez proxy (klíč bude viditelný v prohlížeči):
// window.TMDB_KEY_DEFAULT = "tvuj_tmdb_api_klic";
