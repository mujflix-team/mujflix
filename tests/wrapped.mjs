// Wrapped: výpočty (čisté funkce, bez prohlížeče) a obrazovka (headless Chromium).
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { startApp, check, finish } from "./helpers.mjs";

/* ───────────── 1) Výpočty ───────────── */
const sandbox = { window: {} };
vm.runInNewContext(readFileSync("js/app/wrapped.js", "utf8"), sandbox); // bez `document` se vystaví jen MFWrappedCore
const C = sandbox.window.MFWrappedCore;
check("core: MFWrappedCore je vystavené a mimo prohlížeč se nic nespouští", !!C && !sandbox.window.MFWrapped);

const T = (y, m, d, h = 12, mi = 0) => new Date(y, m - 1, d, h, mi).getTime(); // m = 1–12, místní čas (test nezávisí na časovém pásmu)
const P = "https://image.tmdb.org/t/p/w400/a.jpg";
const ep = (slug, ts, extra = {}) => ({ ts, slug, genres: [], name: "", poster: "", tmdbId: null, ...extra });
check("sanity: 3. 10. 2026 je sobota (kontrola ručního výpočtu v testu)", new Date(2026, 9, 3).getDay() === 6);

const timeline = [
  ep("breaking-bad", T(2026, 10, 3, 22, 30), { name: "Breaking Bad", genres: [18, 80], poster: P }),
  ep("breaking-bad", T(2026, 10, 3, 23, 10), { name: "Breaking Bad", genres: [18, 80], poster: P }),
  ep("breaking-bad", T(2026, 10, 4, 0, 30), { name: "Breaking Bad", genres: [18, 80], poster: P }),
  ep("breaking-bad", T(2026, 10, 4, 21, 0), { name: "Breaking Bad", genres: [18, 80], poster: P }),
  ep("breaking-bad", T(2026, 10, 5, 21, 30), { name: "Breaking Bad", genres: [18, 80], poster: P }),
  ep("futurama", T(2026, 10, 14, 10, 0), { name: "Futurama", genres: [16, 35] }),
  ep("futurama", T(2026, 10, 20, 9, 15), { name: "Futurama", genres: [16, 35] }),
  ep("bezejmenny", T(2026, 10, 31, 23, 59), { genres: [10759] }), // seriálové 10759 se sloučí do „Akční“
  ep("edge", T(2026, 10, 1, 0, 0), { name: "Hranice", genres: [28] }), // přesně začátek měsíce → patří do října
  ep("zari", T(2026, 9, 30, 23, 59), { name: "Září" }), // těsně před → ne
  ep("listopad", T(2026, 11, 1, 0, 0), { name: "Listopad" }), // přesně začátek dalšího měsíce → ne
  null, "text", { ts: "x", slug: "a" }, { ts: NaN, slug: "a" }, { ts: T(2026, 10, 9), slug: 5 }, { ts: T(2026, 10, 9) } // poškozené záznamy se přeskočí
];
const movies = [
  { tmdbId: "11", title: "Film A", ts: T(2026, 10, 8, 19, 0), poster: P },
  { tmdbId: "11", title: "Film A", ts: T(2026, 10, 10, 20, 0), poster: P }, // stejný film dvakrát → počítá se jednou, naposledy
  { tmdbId: "12", title: "Film ze září", ts: T(2026, 9, 12, 20, 0) },
  { tmdbId: "", title: "Bez ID", ts: T(2026, 10, 11) }
];
const ratings = {
  "breaking-bad": { rating: "loved", name: "Breaking Bad", ts: T(2026, 10, 6) },
  futurama: { rating: "liked", name: "Futurama", ts: T(2026, 10, 7) },
  stary: { rating: "loved", name: "Starý", ts: T(2026, 9, 2) },
  bezejmenny: { rating: "loved", name: "bezejmenny", ts: T(2026, 10, 30) } // název = slug → vezme se z nameOf
};
const runtimes = { "breaking-bad": 47, futurama: 22 };
const oct = C.compute({
  year: 2026, month: 9, timeline, movies, ratings,
  runtimeOf: s => runtimes[s] || 0, nameOf: s => (s === "bezejmenny" ? "Seriál bez jména" : "")
});

check("počty: 9 epizod a 1 film v říjnu (hranice měsíce, duplicity a poškozené záznamy)", oct.episodes === 9 && oct.movies === 1 && oct.events === 10 && !oct.empty, JSON.stringify([oct.episodes, oct.movies, oct.events]));
check("titulů: 4 seriály + 1 film", oct.titles === 5, String(oct.titles));
check("top seriály: nejvíc epizod první, při shodě novější; chybějící název z nameOf",
  oct.topShows.map(s => s.slug + ":" + s.count).join() === "breaking-bad:5,futurama:2,bezejmenny:1,edge:1" && oct.topShows[2].name === "Seriál bez jména", oct.topShows.map(s => s.slug + ":" + s.count).join());
check("odhad času: délky z runtimeOf, jinak 40 min a film 105 min", oct.minutes === 5 * 47 + 2 * 22 + 40 + 40 + 105, String(oct.minutes));
check("žánry: sloučené 10759 + 28 → Akční (2), shoda se řadí česky podle abecedy",
  oct.topGenres.map(g => g.name + ":" + g.count).join() === "Drama:5,Krimi:5,Akční:2,Animovaný:2,Komedie:2", oct.topGenres.map(g => g.name + ":" + g.count).join());
check("série dní: nejdelší 3 po sobě (3.–5. 10.), aktivních dní 8", oct.streak.len === 3 && oct.streak.fromDom === 3 && oct.streak.toDom === 5 && oct.activeDays === 8, JSON.stringify([oct.streak, oct.activeDays]));
check("nejrušnější den: při shodě dřívější (3. 10.), nejčastější titul toho dne", oct.busiest.dom === 3 && oct.busiest.count === 2 && oct.busiest.top === "Breaking Bad", JSON.stringify(oct.busiest));
check("denní doba: večer nejvíc, v noci 2, ráno 2", oct.peakBucket.id === "vecer" && oct.hours.vecer === 6 && oct.hours.noc === 2 && oct.hours.rano === 2 && oct.hours.odpoledne === 0, JSON.stringify(oct.hours));
check("dny v týdnu: nejčastěji sobota (po–ne = 1,1,1,1,0,4,2)", oct.peakWeekday === 5 && oct.weekdays.join() === "1,1,1,1,0,4,2", oct.weekdays.join());
check("hodnocení: jen z října, milované s názvem (název = slug se nahradí)", oct.loved.map(l => l.name).join() === "Seriál bez jména,Breaking Bad" && oct.ratedCount === 3, JSON.stringify([oct.loved, oct.ratedCount]));
check("typ diváka: 50 % po desáté večer → Noční sova", oct.persona.id === "night" && /^50 %/.test(oct.persona.blurb), JSON.stringify(oct.persona));

const aug = C.compute({ year: 2026, month: 7, timeline, movies, ratings });
check("prázdný měsíc: empty, nuly, žádný pád", aug.empty && aug.episodes === 0 && aug.events === 0 && aug.streak === null && aug.busiest === null);
const garbage = C.compute({ year: 2026, month: 9, timeline: "x", movies: null, ratings: [] });
check("špatné typy vstupu (po načtení vadné zálohy) nic neshodí", garbage.empty);

const czSort = C.compute({ year: 2026, month: 9, movies: [], ratings: {}, timeline: [ep("a", T(2026, 10, 2), { genres: [10762] }), ep("b", T(2026, 10, 3), { genres: [18] })] }).topGenres.map(g => g.name).join();
check("žánry: česká abeceda při shodě (Dětský před Drama)", czSort === "Dětský,Drama", czSort);

// Typy diváka (každé pravidlo zvlášť; vše v 15:00, ať nezasáhne denní doba)
const many = (n, slugs) => Array.from({ length: n }, (_, i) => ep(slugs[i % slugs.length], T(2026, 10, 1 + i, 15, 0), { genres: [18] }));
const pid = (timeline, extra = {}) => C.compute({ year: 2026, month: 9, timeline, movies: [], ratings: {}, ...extra }).persona.id;
check("typ: Začátečník (méně než 5 zhlédnutí)", pid(many(2, ["a"])) === "start");
check("typ: Maratonec (6 zhlédnutí v jednom dni)", pid(Array.from({ length: 6 }, (_, i) => ep("a", T(2026, 10, 5, 12 + i, 0)))) === "marathon");
check("typ: Ranní ptáče", pid(Array.from({ length: 6 }, (_, i) => ep("a", T(2026, 10, 1 + i, 8, 0)))) === "morning");
check("typ: Stálice (15 aktivních dní)", pid(many(15, ["a", "b", "c"])) === "regular");
check("typ: Věrný fanoušek (aspoň 60 % jeden seriál)", pid(many(6, ["a"])) === "loyal");
check("typ: Objevitel (8 různých titulů)", pid(many(8, ["a", "b", "c", "d", "e", "f", "g", "h"])) === "explorer");
check("typ: Pohodový divák (jinak)", pid(many(5, ["a", "b", "c"])) === "chill");

// Měsíce, výchozí volba, pozvánka
const months = C.listMonths({ timeline, movies });
check("měsíce: nejnovější první a jen ty s daty", months.join() === "2026-11,2026-10,2026-09", months.join());
const D = (y, m, d) => new Date(y, m - 1, d, 12);
check("výchozí měsíc: do 10. minulý, jinak aktuální, bez dat nejnovější s daty",
  C.pickDefaultMonth(months, D(2026, 11, 6)) === "2026-10" && C.pickDefaultMonth(months, D(2026, 11, 20)) === "2026-11" && C.pickDefaultMonth(months, D(2026, 12, 20)) === "2026-11" && C.pickDefaultMonth([], D(2026, 12, 20)) === "2026-12");
const it = (d) => { const t = C.inviteTarget(d); return t ? t.year + "-" + (t.month + 1) : null; };
check("pozvánka: začátek měsíce → minulý, poslední 3 dny → aktuální, jinak žádná (včetně přelomu roku a února)",
  it(D(2026, 11, 6)) === "2026-10" && it(D(2026, 11, 20)) === null && it(D(2026, 11, 28)) === "2026-11" && it(D(2027, 1, 3)) === "2026-12" && it(D(2027, 2, 26)) === "2027-2" && it(D(2027, 2, 25)) === null);

// Čeština
check("skloňování a délka", C.plural(1, "a", "b", "c") === "a" && C.plural(3, "a", "b", "c") === "b" && C.plural(5, "a", "b", "c") === "c" && C.plural(0, "a", "b", "c") === "c"
  && C.fmtDuration(30).unit === "minut" && C.fmtDuration(90).value === "2" && C.fmtDuration(90).unit === "hodiny" && C.fmtDuration(464).value === "8" && C.fmtDuration(464).unit === "hodin");
check("rod: září je střední (Tvé, Moje, hotové), ostatní měsíce mužské", C.gender(8).your === "Tvé" && C.gender(8).my === "Moje" && C.gender(8).done === "hotové" && C.gender(9).your === "Tvůj" && C.gender(9).done === "hotový");

// Slidy
const ctx = { name: "Jana", months };
const slides = C.buildSlides(oct, ctx);
check("slidy: úvod, celkem, seriál, žánry, kdy, série, filmy, milované, typ, souhrn", slides.map(s => s.theme).join() === "blue,red,teal,amber,night,green,pink,rose,sky,dark", slides.map(s => s.theme).join());
check("slidy: úvod má Tvůj říjen a výběr měsíce, souhrn tlačítko Uložit obrázek", /Tvůj <br>.*říjen/.test(slides[0].html) && slides[0].html.includes("mfw-select") && slides[9].html.includes('data-act="share"'));
const sep = C.compute({ year: 2026, month: 8, timeline, movies, ratings });
check("slidy: u září „Tvé září“, nikdy „Tvůj září“", /Tvé <br>.*září/.test(C.buildSlides(sep, ctx)[0].html) && !C.buildSlides(sep, ctx).some(s => /Tvůj\s*(<br>)?\s*(<span[^>]*>)?\s*září/.test(s.html)));
const emptySlides = C.buildSlides(aug, ctx);
check("slidy: prázdný měsíc je jeden slide se zprávou a tlačítkem Zavřít", emptySlides.length === 1 && emptySlides[0].html.includes("Za tento měsíc zatím není co ukázat") && emptySlides[0].html.includes('data-act="close"'));
const lone = C.compute({ year: 2026, month: 9, timeline: [ep("a", T(2026, 10, 2))], movies: [], ratings: {} });
check("slidy: jediná epizoda bez žánrů a filmů nepadá a vynechá žánry, filmy i milované", C.buildSlides(lone, {}).map(s => s.theme).join() === "blue,red,teal,night,green,sky,dark");

// Bezpečnost: data ze zálohy se nikdy nevkládají jako HTML ani cizí obrázek
const evil = C.compute({
  year: 2026, month: 9, movies: [{ tmdbId: "9", title: '"><script>alert(1)</script>', poster: "https://evil.example/x.jpg", ts: T(2026, 10, 2) }],
  timeline: [ep("x", T(2026, 10, 2), { name: "<img src=x onerror=alert(1)>", poster: "javascript:alert(1)", genres: [18] }), ep("y", T(2026, 10, 3), { name: "Y", poster: "https://image.tmdb.org/t/p/w400/../../evil.js\"onerror=\"1" })],
  ratings: { x: { rating: "loved", name: "<b>milé</b>", ts: T(2026, 10, 4) } }
});
const evilHtml = C.buildSlides(evil, { name: "<i>Jana</i>", months }).map(s => s.html).join("\n");
check("escapování: názvy, jméno profilu i hodnocení jsou jen text", !/<img src=x|<script|<b>milé|<i>Jana/.test(evilHtml) && evilHtml.includes("&lt;img src=x") && evilHtml.includes("&lt;script&gt;") && evilHtml.includes("&lt;b&gt;milé") && evilHtml.includes("&lt;i&gt;Jana"));
check("plakáty: jen z image.tmdb.org, jinak zástupný čtverec", !/evil\.example|javascript:|evil\.js/.test(evilHtml) && evilHtml.includes("mfw-poster-ph") && C.safePoster(P) === P && C.safePoster("http://image.tmdb.org/t/p/w400/a.jpg") === "");

/* ───────────── 2) Obrazovka v prohlížeči ───────────── */
const { page, errors, close } = await startApp();
await page.evaluate(({ timeline, movies, ratings }) => {
  localStorage.setItem("mf_watch_timeline", JSON.stringify(timeline));
  localStorage.setItem("mf_cont_movies", JSON.stringify(movies));
  localStorage.setItem("mf_ratings", JSON.stringify(ratings));
}, { timeline: timeline.filter(Boolean).filter(e => typeof e === "object" && e.slug && typeof e.slug === "string"), movies, ratings });

const isOpen = () => page.evaluate(() => { const r = document.getElementById("mfWrapped"); return !!r && !r.hidden && r.classList.contains("open"); });
const segs = () => page.evaluate(() => [...document.querySelectorAll("#mfWrapped .mfw-prog i")].filter(i => i.classList.contains("on")).length);
const title = () => page.evaluate(() => (document.querySelector("#mfWrapped .mfw-slide")?.textContent || "").replace(/\s+/g, " ").trim());

check("ui: Wrapped je v appce k dispozici", await page.evaluate(() => typeof window.MFWrapped?.open === "function" && !!window.MFWrappedCore));
await page.evaluate(() => MFWrapped.open({ month: "2026-10" }));
await page.waitForTimeout(400);
check("ui: otevře se (dialog, aria-modal) a první slide je „Tvůj říjen“ se jménem měsíce v nadpisu",
  await isOpen() && await page.evaluate(() => { const r = document.getElementById("mfWrapped"); return r.getAttribute("role") === "dialog" && r.getAttribute("aria-modal") === "true"; }) && /Tvůj říjen/.test(await title()), await title());
check("ui: postup má 10 segmentů a svítí první", await page.evaluate(() => document.querySelectorAll("#mfWrapped .mfw-prog i").length) === 10 && await segs() === 1);

await page.keyboard.press("ArrowRight");
check("ui: šipka vpravo přejde na další slide (celkem)", await segs() === 2 && /Celkem/.test(await title()) && /9\s*epizod/.test(await title()), await title());
await page.keyboard.press("ArrowLeft");
check("ui: šipka vlevo se vrátí", await segs() === 1);
const box = await page.evaluate(() => { const r = document.querySelector("#mfWrapped .mfw-stage").getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
await page.mouse.click(box.x + box.w * 0.9, box.y + box.h * 0.5);
check("ui: klik na pravou část dál", await segs() === 2);
await page.mouse.click(box.x + box.w * 0.1, box.y + box.h * 0.5);
check("ui: klik na levou třetinu zpět", await segs() === 1);
await page.click('#mfWrapped [data-go="next"]');
check("ui: tlačítko Dál", await segs() === 2);

// měsíc se přepíná výběrem na úvodním slidu
await page.click('#mfWrapped [data-go="prev"]');
await page.selectOption("#mfWrapped .mfw-select", "2026-09");
await page.waitForTimeout(100);
check("ui: výběr měsíce přepočítá Wrapped (září: Tvé září, 1 film ze září)", /Tvé září/.test(await title()) && await segs() === 1, await title());
await page.selectOption("#mfWrapped .mfw-select", "2026-10");
await page.evaluate(() => document.activeElement && document.activeElement.blur()); // fokus na výběru by šipky bral sobě (mění měsíc)

// poslední slide, uložení obrázku
for (let i = 0; i < 9; i++) await page.keyboard.press("ArrowRight");
check("ui: na posledním slidu je souhrn a Dál zmizí", await segs() === 10 && await page.evaluate(() => document.querySelector('#mfWrapped [data-go="next"]').hidden) && /Uložit obrázek/.test(await title()));
const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 8000 }), page.click('#mfWrapped [data-act="share"]')]).catch(() => [null]);
let dlOk = false, dlInfo = "žádné stažení";
if (dl) {
  const path = await dl.path(); const { statSync } = await import("node:fs"); const size = path ? statSync(path).size : 0;
  dlOk = dl.suggestedFilename() === "mujflix-wrapped-2026-10.png" && size > 8000; dlInfo = dl.suggestedFilename() + " " + size + " B";
}
check("ui: Uložit obrázek stáhne PNG mujflix-wrapped-2026-10.png", dlOk, dlInfo);

// Esc zavře a vrátí fokus
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
check("ui: Esc zavře okno", !(await isOpen()) && await page.evaluate(() => document.getElementById("mfWrapped").hidden && !document.documentElement.classList.contains("mfw-lock")));

// prázdný měsíc
await page.evaluate(() => MFWrapped.open({ month: "2026-08" }));
await page.waitForTimeout(300);
check("ui: prázdný měsíc ukáže zprávu a Zavřít funguje", /zatím není co ukázat/.test(await title()) && await page.evaluate(() => (document.querySelector("#mfWrapped .mfw-prog").style.visibility === "hidden")));
await page.click('#mfWrapped [data-act="close"]');
await page.waitForTimeout(400);
check("ui: Zavřít zavře okno", !(await isOpen()));

// z menu profilu
await page.evaluate(() => { const b = document.createElement("button"); b.id = "t-av"; b.style.cssText = "position:fixed;top:10px;right:10px"; document.body.appendChild(b); mfToggleProfileMenu(b); });
const hasItem = await page.evaluate(() => !!document.querySelector('#nfProfileMenu [data-act="wrapped"]'));
await page.evaluate(() => document.querySelector('#nfProfileMenu [data-act="wrapped"]').click()); // pod menu leží výběr profilu, myší by se nedalo kliknout
await page.waitForTimeout(400);
check("ui: v menu profilu je Wrapped a otevře okno", hasItem && await isOpen() && !(await page.evaluate(() => !!document.getElementById("nfProfileMenu"))));
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// pozvánka na úvodní stránce (pevné datum: 6. 11. 2026 → nabízí říjen)
await page.clock.setFixedTime(new Date(2026, 10, 6, 12, 0));
await page.evaluate(() => { localStorage.removeItem("mf_wrapped_seen"); MFWrapped.refreshInvite(); });
const invite = await page.evaluate(() => { const b = document.getElementById("mfWrappedInvite"); return { hidden: b.hidden, text: b.textContent.replace(/\s+/g, " ").trim() }; });
check("pozvánka: 6. 11. nabídne „Tvůj říjen je hotový“", !invite.hidden && /Tvůj říjen je hotový/.test(invite.text), JSON.stringify(invite));
await page.evaluate(() => document.querySelector("#mfWrappedInvite .mfw-invite-go").click());
await page.waitForTimeout(400);
check("pozvánka: klik otevře Wrapped za říjen a pozvánka se schová i po obnovení", await isOpen() && /říjen/.test(await title())
  && await page.evaluate(() => { MFWrapped.refreshInvite(); return document.getElementById("mfWrappedInvite").hidden && JSON.parse(localStorage.getItem("mf_wrapped_seen")).includes("2026-10"); }));
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
await page.evaluate(() => { localStorage.removeItem("mf_wrapped_seen"); MFWrapped.refreshInvite(); document.querySelector("#mfWrappedInvite .mfw-invite-x").click(); });
check("pozvánka: křížek ji skryje a zapamatuje si to", await page.evaluate(() => document.getElementById("mfWrappedInvite").hidden && JSON.parse(localStorage.getItem("mf_wrapped_seen")).includes("2026-10")));
await page.clock.setFixedTime(new Date(2026, 10, 20, 12, 0));
await page.evaluate(() => { localStorage.removeItem("mf_wrapped_seen"); MFWrapped.refreshInvite(); });
check("pozvánka: 20. 11. (uprostřed měsíce) se nenabízí", await page.evaluate(() => document.getElementById("mfWrappedInvite").hidden));

check("ui: žádné chyby ani porušení CSP", errors.length === 0, JSON.stringify(errors));
await close();
finish();
