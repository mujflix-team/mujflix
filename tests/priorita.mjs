// Priorita zdrojů (zvlášť seriály/filmy), menu Další a typ pod názvem na kartách v Domů.
import { startApp, check, finish } from "./helpers.mjs";
const { page, close } = await startApp();
const o = await page.evaluate(() => {
  const P = MFCinemaPlayer.priority, r = {};
  P.reset("tv"); P.reset("movie");
  r.defTv = P.list("tv")[0].id; r.custom0 = P.isCustom("tv") || P.isCustom("movie");
  P.set("movie", ["prehrajto"].concat(P.list("movie").map((x) => x.id)));
  r.mv = P.list("movie")[0].id; r.tvBeze = P.list("tv")[0].id === r.defTv; r.custom = [P.isCustom("tv"), P.isCustom("movie")];
  P.set("tv", ["najserialy"].concat(P.list("tv").map((x) => x.id)));
  MFCinemaPlayer.open("1", "Test", "tv", { season: 1, episode: 1 }); r.tvSrc = MFCinemaPlayer.sourceLabel(); MFCinemaPlayer.close();
  P.reset("tv"); P.reset("movie"); r.custom1 = P.isCustom("tv") || P.isCustom("movie");
  return r;
});
await page.evaluate(() => MFProfileSettings.open());
await page.waitForTimeout(500);
const o2 = await page.evaluate(() => {
  const r = {};
  const rows = [...document.querySelectorAll("#mfSettingsModal [data-st]")].map((b) => b.dataset.st);
  r.rows = rows.join(",");
  document.querySelector('#mfSettingsModal [data-st="adv"]').click();
  document.querySelector('#mfSettingsModal [data-st="sources"]').click();
  r.tabs = document.querySelectorAll("#mfSettingsModal .pf-tab").length;
  const n = document.querySelectorAll("#mfSettingsModal .pf-src").length;
  document.querySelector('#mfSettingsModal [data-st="src-kind:movie"]').click();
  r.rowsMv = document.querySelectorAll("#mfSettingsModal .pf-src").length; r.rowsTv = n;
  return r;
});
Object.assign(o, o2);
check("priorita: výchozí pořadí není vlastní", o.custom0 === false);
check("priorita: filmy a seriály mají vlastní seznam", o.mv === "prehrajto" && o.tvBeze && o.custom[0] === false && o.custom[1] === true, JSON.stringify(o));
check("priorita: seriál začne na zdroji s nejvyšší prioritou", /najserial/i.test(o.tvSrc || ""), o.tvSrc);
check("priorita: reset vrátí výchozí", o.custom1 === false);
check("menu Další: Priorita zdrojů je v Pokročilé a záložky Seriály/Filmy fungují", /adv,sources/.test(o.rows) && o.tabs === 2 && o.rowsMv < o.rowsTv, JSON.stringify(o));
const lg = await page.evaluate(() => {
  document.querySelector('#mfSettingsModal [data-st="src-back"]').click();
  document.querySelector('#mfSettingsModal [data-st="adv"]').click();
  document.querySelector('#mfSettingsModal [data-st="logins"]').click();
  return { n: document.querySelectorAll("#mfSettingsModal .pf-login").length, ok: [...document.querySelectorAll("#mfSettingsModal .pf-login")].every((a) => /^https:\/\//.test(a.href) && a.rel.includes("noopener")) };
});
check("Přihlášení ke zdrojům: odkazy na weby (bezpečné)", lg.n === 9 && lg.ok, JSON.stringify(lg));
await close();
finish();
