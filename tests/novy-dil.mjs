// Oblíbené: záložka „Nový díl“ (cache mf_newep_<id>)
import { startApp, check, finish } from "./helpers.mjs";
const { page, close } = await startApp();
const r = await page.evaluate(() => {
  const slug = Object.keys(db).find((k) => db[k] && db[k].tmdbId);
  if (!slug) return { skip: true };
  const id = db[slug].tmdbId, out = {};
  const it = { slug, type: "series", name: db[slug].name, tmdbId: id };
  // rozkoukáno: aspoň první epizoda zhlédnutá
  const w = getWatched(); w[slug + "-S1-E1"] = Date.now(); try { localStorage.setItem(uKey("mf_watched"), JSON.stringify(w)); } catch { /* bez úložiště */ }
  const fresh = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10), old = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
  localStorage.setItem("mf_newep_" + id, JSON.stringify({ t: Date.now(), air: fresh })); out.fresh = wlHasNewEp(it);
  localStorage.setItem("mf_newep_" + id, JSON.stringify({ t: Date.now(), air: old })); out.old = wlHasNewEp(it);
  localStorage.removeItem("mf_newep_" + id); out.none = wlHasNewEp(it);
  return out;
});
if (r.skip) { console.log("  (přeskočeno: v db není seriál s tmdbId)"); }
else {
  check("Nový díl: čerstvá epizoda se pozná", r.fresh === true, JSON.stringify(r));
  check("Nový díl: stará nebo žádná epizoda ne", r.old === false && r.none === false, JSON.stringify(r));
}
await close();
finish();
