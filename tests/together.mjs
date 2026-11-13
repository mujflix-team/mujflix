// Co dnes pustíme dohromady: výpočty (čisté funkce) a obrazovka (headless Chromium).
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { startApp, check, finish } from "./helpers.mjs";

/* ───────────── 1) Výpočty ───────────── */
const sandbox = { window: {} };
vm.runInNewContext(readFileSync("js/app/together.js", "utf8"), sandbox); // bez `document` se vystaví jen MFTogetherCore
const C = sandbox.window.MFTogetherCore;
check("core: MFTogetherCore je vystavené a mimo prohlížeč se nic nespouští", !!C && !sandbox.window.MFTogether);

const P = (name, genres, maxAge = 0) => ({ id: name, name, likedGenres: genres, prefs: { maxAge } });
const eric = P("Eric", [35, 16]), homer = P("Homer", [35, 18]), gojou = P("Gojou", [16, 28]);

check("věk: nejpřísnější omezení vyhrává, 0 = bez omezení", C.strictestAge([P("a", [], 0), P("b", [], 12), P("c", [], 7)]) === 7 && C.strictestAge([P("a", []), P("b", [])]) === 0);
check("žánry: když mají všichni stejný, bere se ten", JSON.stringify(C.sharedGenres([eric, homer])) === '{"ids":[35],"mode":"all"}', JSON.stringify(C.sharedGenres([eric, homer])));
check("žánry: bez společného, ale aspoň dva sdílejí → režim some", C.sharedGenres([eric, homer, gojou]).mode === "some" && C.sharedGenres([eric, homer, gojou]).ids.includes(35) && C.sharedGenres([eric, homer, gojou]).ids.includes(16));
check("žánry: nikdo nic nesdílí → none", C.sharedGenres([P("a", [28]), P("b", [18])]).mode === "none" && C.sharedGenres([P("a", []), P("b", [])]).ids.length === 0);

const cand = (id, genres, va, type = "movie") => ({ id, type, genre_ids: genres, vote_average: va, title: "T" + id });
const ranked = C.rank([cand(1, [35], 6), cand(2, [35, 18], 7), cand(3, [28], 9), cand(2, [35], 5), cand(4, [35], 8, "tv"), { id: 9, type: "x" }], [eric, homer], { "movie:3": 1 });
check("rank: víc sedících profilů je výš, pak hodnocení; viděné, duplicity a neplatné typy se vynechají",
  ranked.map(r => r.key).join(",") === "tv:4,movie:2,movie:1" && C.rank([cand(5, [35], 9), cand(6, [28], 9)], [eric, homer], {})[0].key === "movie:5", ranked.map(r => r.key).join(","));
check("pick: bere jen z nejlépe sedících a vynechá už ukázané", C.pick(ranked, { "tv:4": 1 }, () => 0).key === "movie:2" && C.pick(ranked, { "movie:2": 1, "tv:4": 1, "movie:1": 1 }) === null);
check("fits: převod žánrů mezi filmem a seriálem se použije", C.fits({ genre_ids: [10759] }, "tv", [gojou], (ids, t) => t === "tv" ? ids.map(i => i === 28 ? 10759 : i) : ids).length === 1);
check("text: výčet jmen česky a důvod", C.joinNames(["Eric", "Homer", "Gojou"]) === "Eric, Homer a Gojou" && C.joinNames(["Eric", "Homer"]) === "Eric a Homer"
  && /Hodí se pro všechny: Eric a Homer\. Baví vás: Komedie\./.test(C.explain({ fit: [eric, homer] }, 2, [35])), C.explain({ fit: [eric, homer] }, 2, [35]));

/* ───────────── 2) Obrazovka ───────────── */
const { page, errors, close } = await startApp();
await page.evaluate(() => {
  const p = (id, name, likedGenres, maxAge) => ({ id, name, avatar: "🎬", color: "#007aff", pin: null, created: 1, history: [], likedGenres, prefs: { maxAge, algo: {}, features: {}, contentPref: "all", lang: "cs" } });
  localStorage.setItem("mf_profiles_v2", JSON.stringify([p("pa", "Eric", [35], 0), p("pb", "Homer", [35], 7), p("pc", "Gojou", [28], 0)]));
  const rate = { 1: "G", 2: "R", 3: "G" };
  window.tmdbGet = async path => {
    const m = path.match(/^\/(movie|tv)\/(\d+)\?/);
    if (m) return m[1] === "movie" ? { release_dates: { results: [{ iso_3166_1: "US", release_dates: [{ certification: rate[m[2]] || "" }] }] } } : null;
    if (path.startsWith("/discover/movie")) return { results: [
      { id: 1, title: "Rodinná komedie", genre_ids: [35], vote_average: 7.1, release_date: "2020-05-01", poster_path: "/a.jpg" },
      { id: 2, title: "Drsná komedie", genre_ids: [35], vote_average: 8.5, release_date: "2019-01-01", poster_path: "/b.jpg" },
      { id: 3, title: "Druhá komedie", genre_ids: [35], vote_average: 6.9, release_date: "2021-01-01", poster_path: "/c.jpg" }] };
    return { results: [] };
  };
});
const isOpen = () => page.evaluate(() => !!document.getElementById("mfTogether"));
const text = sel => page.evaluate(s => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(), sel);

check("ui: obrazovka je v appce k dispozici", await page.evaluate(() => typeof window.MFTogether?.open === "function"));
await page.evaluate(() => { const b = document.body; window.mfToggleProfileMenu(b); });
check("ui: v menu profilu je položka Co dnes pustíme dohromady?", await page.evaluate(() => !!document.querySelector('#nfProfileMenu [data-act="together"]')));
await page.evaluate(() => document.querySelector('#nfProfileMenu [data-act="together"]').click());
await page.waitForTimeout(200);
check("ui: položka z menu otevře dialog se třemi profily", await isOpen() && await page.evaluate(() => document.querySelectorAll("#mfTogether .mft-chip").length) === 3
  && await page.evaluate(() => document.getElementById("mfTogether").getAttribute("role")) === "dialog");
check("ui: tlačítko Najít tip je vypnuté, dokud nejsou vybrané aspoň dva profily", await page.evaluate(() => document.querySelector("#mfTogether .mft-go").disabled));
const chip = i => page.evaluate(n => document.querySelectorAll("#mfTogether .mft-chip")[n].click(), i);
await chip(0); await chip(1);
check("ui: po výběru dvou profilů je tlačítko zapnuté a ukáže nejpřísnější věk", await page.evaluate(() => !document.querySelector("#mfTogether .mft-go").disabled) && /do 7 let/.test(await text(".mft-age")), await text(".mft-age"));
await page.evaluate(() => document.querySelector("#mfTogether .mft-go").click());
await page.waitForSelector("#mfTogether .mft-title", { timeout: 5000 });
const t1 = await text(".mft-title");
check("ui: tip respektuje věk (R film se neukáže) a řekne, pro koho se hodí", /^(Rodinná komedie|Druhá komedie)$/.test(t1) && /Hodí se pro všechny: Eric a Homer/.test(await text(".mft-why")), t1 + " | " + await text(".mft-why"));
await page.evaluate(() => [...document.querySelectorAll("#mfTogether .mft-btn")].find(b => b.textContent === "Jiný tip").click());
const t2 = await text(".mft-title");
check("ui: Jiný tip ukáže jiný titul", t2 && t2 !== t1 && /^(Rodinná komedie|Druhá komedie)$/.test(t2), t1 + " → " + t2);
await page.evaluate(() => [...document.querySelectorAll("#mfTogether .mft-btn")].find(b => b.textContent === "Jiný tip").click());
check("ui: když tipy dojdou, napíše to a nenabízí R film", /To je všechno/.test(await text(".mft-msg")), await text(".mft-res"));
await page.keyboard.press("Escape");
check("ui: Escape dialog zavře", !(await isOpen()));

check("ui: žádné chyby ani porušení CSP", errors.length === 0, JSON.stringify(errors));
await close();
finish();
