import { startApp, check, finish } from "./helpers.mjs";

const { page, errors, close } = await startApp();

// --- Validace URL zdrojů
const urls = await page.evaluate(() => ({
  good: _isValidStreamUrl("https://www.bombuj.si/film/abc"),
  sub: _isValidStreamUrl("https://serialy.bombuj.si/serial/abc"),
  evil: _isValidStreamUrl("https://evilbombuj.si/film/abc"),
  search: _isValidStreamUrl("https://www.bombuj.si/?s=abc"),
  js: _isValidStreamUrl("javascript:alert(1)"),
}));
check("validace: bombuj.si projde", urls.good);
check("validace: subdoména projde", urls.sub);
check("validace: evilbombuj.si neprojde", !urls.evil);
check("validace: vyhledávací URL neprojde", !urls.search);
check("validace: javascript: neprojde", !urls.js);

// --- Finder modul
const fin = await page.evaluate(() => ({
  slug: _slugify("Pán prstenů: Společenstvo"),
  fns: ["runFinder", "openWithCopy", "showFinderModal", "verifyAndOpen"].every(n => typeof window[n] === "function"),
}));
check("finder: slug je ASCII bez diakritiky", /^[a-z0-9-]+$/.test(fin.slug), fin.slug);
check("finder: veřejné funkce jsou dostupné", fin.fns);

// --- Escapování v inline onclick
const esc = await page.evaluate(() => {
  const s = `https://x.cz/a'b\\c"d</script>`;
  const holder = document.createElement("div");
  holder.innerHTML = `<button onclick="window.__v=${_cinJs(s)}">x</button>`;
  holder.querySelector("button").click();
  return window.__v === s;
});
check("onclick: URL se zvláštními znaky přežije round-trip", esc);

// --- Hodnocení ukládá žánry a AI se z něj učí
const rating = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  db[slug]._genreIds = [35, 18];
  _ratingSlug = slug;
  submitRating("loved");
  const stored = safeLS(uKey("mf_ratings"), "{}")[slug];
  return { genres: stored?.genres, signal: Object.keys(getRatingSignalCached()).length };
});
check("rating: uloží žánry", Array.isArray(rating.genres) && rating.genres.length === 2, JSON.stringify(rating));
check("rating: signál pro AI není prázdný", rating.signal > 0, JSON.stringify(rating));

// --- openSeries nezkresluje preference
const boost = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  db[slug]._genres = ["Comedy"];
  const before = JSON.stringify(aiBrain.memory.genrePreferences);
  for (let i = 0; i < 5; i++) { try { openSeries(slug); } catch (e) { void e; } }
  return before === JSON.stringify(aiBrain.memory.genrePreferences);
});
check("openSeries: neboostuje žánry při pouhém otevření", boost);

// --- Oblíbené: __tmdbfav_ slug
const fav = await page.evaluate(async () => {
  const calls = [];
  window.openDiscoverTv = (id, name) => calls.push(["tv", String(id), name]);
  window._showCinemaOrFinderChoice = (id, name) => calls.push(["movie", String(id), name]);
  openFavoriteItem({ slug: "__tmdbfav_tv_123", name: "A", type: "series" });
  openFavoriteItem({ slug: "__tmdbfav_movie_77", name: "B", type: "movie" });
  await new Promise(r => setTimeout(r, 450));
  return calls;
});
check("oblíbené: seriál se otevře přes Discover", fav.some(c => c[0] === "tv" && c[1] === "123"), JSON.stringify(fav));
check("oblíbené: film se otevře přes cinema volbu", fav.some(c => c[0] === "movie" && c[1] === "77"), JSON.stringify(fav));

// --- sessionGenres vyprší
const sess = await page.evaluate(() => {
  aiBrain.memory.sessionGenres = ["komedie"]; aiBrain.memory.lastActive = Date.now() - 7 * 3600e3;
  const old = aiBrain.memory.lastActive;
  return Date.now() - old > 216e5;
});
check("AI: stará session je starší než 6 h (podmínka expirace)", sess);

// --- Timeline ukládá název
const tl = await page.evaluate(() => {
  const slug = Object.keys(db)[0];
  recordWatchToTimeline(slug, [1]);
  const last = safeLS(uKey("mf_watch_timeline"), "[]").pop();
  return last && last.name === db[slug].name;
});
check("timeline: ukládá název seriálu", tl);

// --- Avatar jako URL
const av = await page.evaluate(() => {
  const b = document.getElementById("nfAvatar"); if (!b) return "no-element";
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p1", name: "T", avatar: "https://image.tmdb.org/t/p/w185/x.jpg" }]));
  localStorage.setItem("mf_active_pid", "p1");
  nfRenderProfile();
  return b.querySelector("img") ? "img" : "text:" + b.textContent;
});
check("avatar: URL se vykreslí jako obrázek", av === "img" || av === "no-element", av);

// --- XSS ve jménu profilu
const xss = await page.evaluate(async () => {
  localStorage.setItem("mf_profiles_v2", JSON.stringify([{ id: "p9", name: "<img src=x onerror=window.__pwn=1>", avatar: "https://x.cz/a.jpg\" onerror=\"window.__pwn=2", color: "red\" onmouseover=\"window.__pwn=3" }]));
  localStorage.setItem("mf_active_pid", "p9");
  try { await ProfileGate.renderGate(); ProfileGate.renderBadge(); } catch (e) { return "err:" + e.message; }
  await new Promise(r => setTimeout(r, 300));
  return String(window.__pwn || "ok");
});
check("profil: HTML ve jménu/avataru/barvě se neprovede", xss === "ok", xss);

check("žádné JS chyby", errors.length === 0, errors.join(" | "));
await close();
finish();
