# MůjFlix – audit v3.21.1 a pokyny pro Clauda

Stav: repozitář `mujflix-team/mujflix`, HEAD `ead937a` (2026-11-01), `package.json` 3.21.1.
Jak je to ověřeno je u každého bodu: **[běh]** = spuštěno v Chromiu, **[kód]** = přečteno/grepem, **[neověřeno]** = nezkoušeno.
Nové zdroje videa se nepřidávají (podivana.xyz zůstává odstraněná), klíče do repozitáře nepatří, nic neměň naslepo: před smazáním vždy `grep` volajících v `js/`, `index.html`, `tests/`.

## Jak pracovat
1. Dělej po skupinách A → B → C → D. Po každé skupině spusť `npm test` (worker, smoke, flows, discover; v době auditu všechny prošly) a zapiš do `docs/CHANGELOG.md`.
2. Verzi zvyš na **3.21.2** (`npm run bump`) a do CHANGELOGu napiš, co bylo skutečně opraveno. Záznam 3.21.1 tvrdí, že `[object Object]` v Oblíbených je pryč. Není.
3. Do `docs/TASKS.md` přesuň hotové body do „Hotovo“.

---

## A. Chyby (nejdřív)

### A1. `[object Object]` v Oblíbených – srdíčko na kartě  [běh, potvrzeno]
**Příznak:** klik na `.nf-fav` na úvodní stránce uloží do `mf_watchlist_<pid>` záznam `{"slug":{},"name":{},"type":"series","poster":""}`. Srdíčko se nerozsvítí, v Oblíbených jsou položky „SERIÁL“ bez názvu a v konzoli je `Cannot create property 'textContent' on string 'mfhForYou'`.

**Příčina:** v `js/pages/home.js` jsou dvě definice `window.mfhToggleFav` ve stejném rozsahu:
- ř. ~414 `function (btn, cid, idx)` – správná, volá ji `mfhFavButton` přes `onclick="event.stopPropagation(); mfhToggleFav(this, 'cid', idx)"` a uvnitř volá `toggleTmdbFavorite(f.id, f.type, it.title, it.image || '', null)`,
- ř. ~1215 `function (slug, btn)` – zbytek ze starého MůjFlixu (volá `toggleWatchlistItem(slug)`), načte se později, a tak platí. Dostane element tlačítka jako `slug` (`window.mfhToggleFav.length === 2`).

**Oprava:**
1. V `js/pages/home.js` **smaž druhou definici** (od `window.mfhToggleFav = function (slug, btn) {` po její `};`, těsně před `function mfhUnlockCinema()`). Nejdřív `grep -rn "mfhToggleFav" js index.html`: pokud ji volá nějaký detail se signaturou `(slug, btn)`, přejmenuj ji na `mfhToggleSlugFav` a uprav volajícího.
2. `js/app/watchlist.js`, `toggleWatchlistItem(e)`: na začátek přidej
   ```js
   if (typeof e !== "string" || !e) return;
   ```
3. `getWatchlist()`: filtr změň z `null != w.slug` na `"string" == typeof w.slug && w.slug`. Poškozené záznamy se tím zahodí; pokud se nějaký zahodil, přepiš seznam jednou zpět přes `saveWatchlistData` (nebudou se pak v Oblíbených dál ukazovat prázdné položky).
4. **Testy** (`tests/flows.mjs`):
   - klik na první `.nf-fav` → v `mf_watchlist_<pid>` je 1 záznam, kde `typeof slug === "string"` a `typeof name === "string"` a tlačítko má třídu `on`,
   - druhý klik záznam odebere,
   - při kliknutí nesmí vzniknout žádný pageerror.

**Poznámka:** žádný dosavadní test srdíčko nezkouší, proto chyba přežila 3.20.x až 3.21.1.

### A2. Mrtvý obal `closeUniverse`  [kód]
`js/app/sections.js` ~222–236 dělá `const t = window.closeUniverse` při načtení `sections.js` (21. skript v `index.html`), jenže `window.closeUniverse` definuje až `js/pages/discover.js` (24. skript) a přepíše ho. `t` je tedy `undefined`; obal se k původní funkci nepřipojí a přepnutí docku na „Domů“ po zavření Procházení z něj neběží.
**Oprava:** buď přesuň tento kód až za `discover.js` (nebo ho zavolej z `closeUniverse` v `discover.js`), nebo ho smaž, pokud dock už přepíná `dock.js`. Ověř ručně: Procházení → zavřít → dock ukazuje „Domů“.

---

## B. Mrtvý kód po starém přehrávači a Finderu

### B1. Starý přehrávač  [běh + kód]
`js/app/cinema-legacy.js`: `openMovieInCinema` hned na začátku volá `MFCinemaPlayer.open` a vrací; `js/pages/cinema.js:976` ho definuje vždy. Všechno za tím (kód s `_cinState`, `_cinLoad`, `_cinShowPlayButton`, `_cinShowEmbedPlayer`, `_cinBuildSourceBar`, `_cinLoadEpPicker`, `_cinBuildSeasonSel`, `_cinBuildEpSel`, `cinemaSwitchSeason`, `cinemaSwitchEp`, `_cinUpdateSubtitle`) je nedosažitelné.
**Postup:** nech `openMovieInCinema`, `closeCinema` a to, co ještě někdo používá (`CINEMA_SOURCES`, `STREAMING_PROVIDERS`, `window.MFLegalProviders` – ověř grepem). Smaž zbytek a z `index.html` `#cinemaModal`, `#cinemaFrameWrap`, `#cinemaLoader` (a odkaz na neexistující `#cinemaFileWarn` v `closeCinema`). Obal `window.openMovieInCinema` v `js/pages/cinema.js:1406` po svém `return` nedělá nic užitečného, zjednoduš ho. Po smazání: `npm test` + ručně Domů → film → přehrávač → Zpět.

### B2. Finder  [kód]
Od 3.21.1 volá `openFavoriteItem` jen `mfFavFind` (TMDB podle názvu), takže `openWithCopy` (`js/finder/finder.js:617`) volá už jen wrapper v `js/app/dock-overlays.js:46`.
**Postup:** nejdřív `grep` symbolů z `finder.js` (dříve je používaly `series.js`, `core.js`, `sections.js`, `notify.js`, `interaction.js`, `discover.js`, `tests/flows.mjs`). Pokud nikdo, smaž `js/finder/finder.js` (624 řádků) a jeho `<script>`, wrapper v `dock-overlays.js` a `window._mfFinderTmdbId` (`discover.js:190`). Pokud ano, přesuň symboly a pak smaž.

### B3. Zbytky AI klíčů a hledání  [kód]
- `js/app/sections.js`: pole `_PP_KEYS` (Gemini, OpenRouter, Groq) a UI k němu; `window.ptFinderSearch` a prvky `ptFinderInput`, `ptFinderChips`, `ptTypeMovie`, `ptTypeSerial` (v `index.html` nejsou).
- `js/finder/finder.js`: `mf_anthropic_key`, `x-api-key`.
- Při příštím startu jednorázově `localStorage.removeItem` pro `mf_gemini_key`, `mf_or_key`, `mf_groq_key`, `mf_anthropic_key`, `mf_jina_key`, `mf_tavily_key` (včetně variant `<klíč>_<pid>`). Do synchronizace se nedostaly (`syncable()` vynechává klíče s `key`/`token`), takže jde o čistotu, ne únik.

### B4. Funkce bez volání  [kód]
`getMomentumCached()` (`js/app/core.js`) a `switchToEpisodesView()` (`js/app/series.js`) – název se v celém repozitáři objevuje jen u definice. Smaž. (`getMomentumCached`/`getRatingSignalCached` už jsou v TASKS.)

### B5. CSS a ostatní  [kód]
- 14 `@keyframes` bez použití v `css/*.css`, `index.html` ani JS: `bgShift`, `dotBlink`, `dotPulse`, `gridDrift`, `iconRingPulse`, `mf-fade-up`, `pmSlideIn`, `pulseHint`, `scanLine`, `scrollHintFade`, `spin`, `tv-shimmer`, `wheelGlowPulse`, `wheelGlowSpin`. Před smazáním zkontroluj `animation:` v řetězcích JS (hlavně `spin`).
- `html.mf-low-power` se nastavuje v `index.html` a nemá žádné CSS. Buď dodělej úsporný režim (vypnout nekonečné animace a `filter`), nebo třídu odstraň.
- `mf_sync_reloaded` se zapisuje a nikde nečte – smaž zápis.
- `!important`: `css/styles.css` 1147, `netflix.css` 403, `patches.css` 181. Neřeš hromadně; při každé úpravě bloku v `patches.css` zkontroluj, jestli ho `netflix.css` nepřebíjí, a mrtvé pravidlo smaž.

---

## C. Worker (`worker/tmdb-proxy.js`)

1. **CORS fail-open  [kód]:** `corsHeaders` při prázdném `ALLOWED_ORIGINS` vrací `*`. Změň na „povolit jen localhost“, ať se Worker po smazání proměnné neotevře celému webu. Kontrola `Origin` chrání jen před cizími weby v prohlížeči, ne před skripty – nepopisuj to jako zabezpečení.
2. **Limity v paměti  [kód]:** `probeHits` a `srcHits` jsou `Map` v jedné instanci Workeru. Cloudflare jich spouští víc, takže limit je ve skutečnosti volnější. Pokud záleží, použij KV (šetři zápisy – na free tarifu je 1000/den) nebo Rate Limiting binding.
3. **`/sync/push` bez verze  [kód]:** dvě zařízení, která pushnou ve stejné chvíli, si přepíšou změny (klient slučuje při `pull`, mezi `pull` a `push` je ale okno). Přidej `rev`/ETag a vrať 409 při neshodě; klient pak znovu `pull` + merge.
4. **Tělo bez limitu  [kód]:** `request.text()` v `handleSync` se čte před kontrolou `SYNC_MAX_BYTES`. Zkontroluj `Content-Length` předem.
5. **TTL dat  [kód]:** `SYNC_DATA_TTL` (1 rok) se obnovuje jen při `push`. Zařízení, které jen čte, data neprodlužuje. Při `pull` občas obnov (nejvýš 1× týdně).
6. **Vlastní nastavení:** `docs/TASKS.md` stále uvádí „vyměnit TMDB klíč (starý byl v historii GitHubu)“. Pokud se nestalo, je to nejdůležitější bod z bezpečnosti (klíč z historie je veřejný) – klíč jen jako secret Workeru.

## D. Soukromí a bezpečnost klienta

1. **PIN v čistém textu  [kód]:** `js/profiles/gate.js` ~467–485 ukládá `pin` do profilu, porovnává se `this._pinBuffer === e.pin` (ř. 181) a `prefs.js:103`. `mf_profiles_v2` se synchronizuje na server, takže PIN je v KV čitelný komukoli se sync ID. Ulož hash (SHA-256 se solí na profil, `crypto.subtle`) a starý PIN jednorázově převeď. Jde o ochranu před dětmi, ne před útočníkem (localStorage je čitelné).
2. `gate.js:432` – `<img src="${e}">` bez `escapeHTML` (`pickAvatarEl` teď pouští jen `https://`, ale escapuj kvůli dalším volajícím).
3. `js/app/tmdb-avatar.js:51` – `e.message` jde do `innerHTML` bez escapování.
4. **CSP v `index.html`:** z `connect-src` odeber hostitele, které po B2 nepoužívá nic: `api.anthropic.com`, `api.groq.com`, `generativelanguage.googleapis.com`, `api.tavily.com`, `r.jina.ai`. Ostatní (`api.tvmaze.com`, `akabab.github.io`, `api.disneyapi.dev`, `*.fandom.com`, `query.wikidata.org`, `en.wikipedia.org` – `gate.js`; `graphql.anilist.co` – `gate.js`, `cinema.js`) nech. `script-src 'unsafe-inline'` zůstává kvůli `onclick=` v řetězcích; zapiš do TASKS jako dluh, ne jako chybu.
5. XSS přes TMDB názvy: **v pořádku** (epizody, karty i Procházení escapují, test „HTML v názvech se nevykoná“ prochází).

## E. Časovače a výkon  [kód]
Pořád běží: `js/shell/nav.js:54` (každých 250 ms), `js/shell/dock.js:85` (1 s) a `:21` (1,5 s, `strip` čistí `#` v adrese), `js/app/dock-overlays.js:102` (3 s), `js/shell/polish.js:211` (2,5 s, posuvník) a `:222` (3 s, chybová hláška). Většina má pojistku `document.hidden`, ale `dock.js:21` a `polish.js:222` ne. Doporučení: `strip` a odstranění chybové hlášky pouštět jen při `hashchange`/`popstate`/změně DOM, `nav.js` nahradit událostmi nebo prodloužit interval. Měř před a po (Chromium, CPU throttling 4×, `Performance.getMetrics`) – výkon jsem po 3.20.13 měřil, tyto časovače ještě ne.

## F. Cache a verze  [kód]
- `sw.js`: `CACHE = "mujflix-shell-v1"` se nikdy nemění, přitom se cachují všechny `basic` odpovědi. Odvoď název z `MF_VERSION` (a starou cache smaž v `activate`) a ověř, že po nasazení nezůstane starý kód.
- `?v=` parametry v `index.html` (hodnoty 1–7, 12, 21) nesouvisejí s verzí aplikace a po změně souboru se musí zvyšovat ručně. Generuj je skriptem z hashe obsahu, nebo je odstraň a spolehni se na `Cache-Control`.

## G. Co je v pořádku (nepřepisovat)
Žádné duplicitní funkce na nejvyšší úrovni; všechny skripty z `js/` kromě `qr.js` (načítá se dynamicky ze `sync-ui.js:141`) jsou v `index.html`; všechna CSS jsou nalinkovaná; úvodní stránka se bez chyb v konzoli načte; API klíče se nesynchronizují; oprava horní lišty po reloadu (`updateDockVisibility`) platí; Podivana je odstraněná; testy `worker`, `smoke`, `flows`, `discover` procházejí.

## H. Neověřeno
Striktní ESLint (`no-undef`, `no-unused-vars`) – sandbox nedosáhl na npm registry; spusť lokálně `npx eslint -c scripts/eslint.config.js .` a v dočasné konfiguraci zapni `no-undef` a `no-unused-vars` jako varování. Firefox, skutečná zařízení a produkční Worker se neměřily. Klik na srdíčko jsem zkoušel v dev kopii bez `config.js` (falešné TMDB).
