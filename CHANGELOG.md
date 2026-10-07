# Changelog

## 2.3.4
### Nově
- Číslo verze v Nastavení („MůjFlix v…“), zdroj `core/version.js`; test hlídá shodu s `package.json`.
- Vlastní ikony aplikace v repozitáři (`icons/`: 192/512 px, maskable pro Android, apple-touch, favicon, SVG) – aplikace už nezávisí na cizí službě image2url.com
- Content-Security-Policy (meta tag v `index.html`): skripty jen z vlastní domény a cdnjs/jsdelivr, spojení jen na TMDB, AI služby, zdroje a tvoji proxy (`*.workers.dev`, `*.pages.dev`), zakázané `<object>`, pevné `<base>`. Testy teď selžou při jakémkoli porušení CSP
### Opraveno
- Mood picker: četl `window.db`, který neexistuje (top-level `let`), takže nikdy nic nenabídl. Nově používá `db`; pokryto testem.
- „Kde sledovat?": odznak teď ukazuje názvy služeb (Netflix, Max, Disney+ …) místo pouhého „Dostupné v ČR". Dřív se brali jen poskytovatelé z ruční tabulky podle ID, která měla špatná ID (např. Netflix, Prime Video), takže panel zůstal prázdný. Názvy a loga se berou přímo z TMDB, neznámá služba odkazuje na stránku TMDB/JustWatch, přibyly skupiny „Předplatné / Půjčit / Koupit" a při dostupnosti jen v zahraničí se uvede region
- „Kde sledovat?": odkaz na službu se hledá nejdřív podle názvu (ID v ruční tabulce nebyla všechna správná a mohla vést na jinou službu)
- Drobnosti z revize: `openMovieInCinema` po předání přehrávači vždy vynuluje `_cinSiteSlug`/`_cinYear`; URL stillu epizody se escapuje; detekce nelatinského názvu používá jednu společnou funkci; odstraněna nadbytečná větev v `openFavoriteItem`
- Vlastní TMDB klíč z Nastavení se teď opravdu používá ve všech voláních (dřív `tmdbGet` i zbytek aplikace četl jen klíč z `config.js`, takže bez `config.js` nešlo nic načíst ani po zadání klíče); po uložení se projeví hned
- Avatar picker: názvy titulů a jména postav z TMDB se escapují (HTML i uvozovky/zpětná lomítka v `onclick`)
- Profily: PIN lze odebrat (v úpravě profilu s PINem je volba „Odebrat PIN")
- Domovská stránka: „Zobrazit vše" a nový Cinema přehrávač se započítají mezi otevřené vrstvy, takže je `forceHome` nepřekryje
- Karty na domovské stránce bez plakátu už nevytvářejí `<img src="">`
- Překlepy: „série", „zapamatuje pro doporučení", „Chápeme, příště něco lepšího", „Díky za hodnocení"; z oslovení odstraněn duplicitní klíč „šimon"
- Odkazy na zdroje: písmena bez rozkladu (ß, Ł, Ø, Đ, Æ…) se v slugu přepisují (`Straße` → `strasse`), dřív se zahazovala (`stra-e`, `Łódź 1939` → `odz-1939`)
- Bombuj bez známého roku filmu vrací přímý odkaz podle slugu, ne jen stránku hledání; Prehrajto pro název bez latinky hledá původní název (dřív prázdný dotaz)
- Poškozená nebo cizí data v úložišti (`null`, číslo místo pole, objekt místo pole…) už nezpůsobí pád při startu: `safeLS` vrací výchozí hodnotu, když uložená data mají špatný typ (dřív padal `calcProgress`, `updateStreak` i hlídání watchlistu)
- AIBrain: paměť doporučování se při načtení ověří a doplní (chybějící/špatné klíče, NaN), takže poškozená data nevyřadí doporučení
- TMDB proxy (Worker): při nedostupnosti TMDB vrátí 502 s CORS hlavičkami místo nečitelné chyby v prohlížeči
- Objevovat: jedna špatná položka v odpovědi TMDB (prázdná, číslo jako text) už neshodí celou řadu; když se nenačte žádná řada (offline, špatný klíč), zobrazí se hláška „Nepodařilo se načíst nabídku" místo prázdné stránky
- Domovská stránka: prázdná položka v odpovědi TMDB už nezpůsobí pád
- Nový test `tests/discover.mjs` (součást `npm test`)
- Odebrání profilu teď smaže i jeho data (zhlédnuté, hodnocení, streak, AI paměť, osobní API klíče…); dřív zůstala v úložišti navždy
- Watchlist: poškozené záznamy (`null`, čísla, objekty bez slugu) se přeskočí; dřív nešel otevřít seznam ani přidat/odebrat položku
- Kalendář premiér, filtr „Populární": seznam TMDB neobsahuje data epizod, proto byl kalendář vždy prázdný; teď se načtou detaily seriálů (bez duplicit). Filtr „Sledované" už nevolá TMDB pro celou databázi, jen max. 30 seriálů
- Kalendář premiér: týdny se číslují od pondělí (stejně jako odznak „tento týden")
- Nastavení: API klíče se ukládají přes bezpečný zápis (hlásí plné úložiště), prázdné pole klíč opravdu smaže (dřív šel klíč jen přepsat, ne odebrat)
- Nastavení: hodnota klíče v poli se plně escapuje (dřív chybělo `&`), odkazy na externí weby mají `noopener noreferrer`
- Panel změn: uložení „viděno" odolné vůči plnému úložišti
- Pravidelné časovače (štítky žánrů, odznaky docku, streak, domovská lišta) se na skryté kartě/zamčeném telefonu přeskakují – menší spotřeba baterie
- Porovnání TMDB ID při hledání v knihovně je explicitní (`String === String`), zmizelo poslední varování ESLint

### Vyčištěno
- Odstraněn mrtvý panel „changelog“ (openChangelog/closeChangelog/checkChangelogOnLoad, modal v index.html a jeho CSS) – nic do něj nikdy nezapisovalo.

## 2.3.3
### Opraveno
- Odkazy otevírané na externí weby (zdroje, hledání) se otevírají s `noopener,noreferrer`, takže cizí stránka nemá přístup k oknu aplikace
- Kontrola: všechny inline `onclick`/`onchange` v HTML i v generovaných šablonách odkazují na existující funkce, žádná duplicitní ID

## 2.3.2
### Opraveno
- „Naposledy hledané" (Pro tebe → hledání) je zvlášť pro každý profil; ukládání odolné vůči plnému úložišti

## 2.3.1
### Opraveno
- Hodnocení epizod a série dní jsou teď zvlášť pro každý profil (dřív je sdílely všechny); stará data převezme jednorázově první profil
- Přehodnocení stejné epizody mění preference AI jen o rozdíl (dřív se bonus/postih sčítal)
- Souhrn hodnocení seriálu nezapočítá epizody jiného seriálu se stejným začátkem slugu

## 2.3.0
### Nově
- Zvonek „Novinky": ukazuje nově vyšlé (posledních 14 dní) a brzy vycházející (30 dní) epizody sledovaných seriálů, tečka u zvonku při novinkách z posledního týdne. Dřív panel zůstal na „Načítám…"
### Opraveno
- Panel novinek se po kliknutí dovnitř už zavře i při pozdějším kliknutí mimo

## 2.2.9
### Opraveno
- Částečně zhlédnuté epizody: po dokončení nebo vynulování se záznam „rozkoukáno" opravdu smaže (dřív zůstal v úložišti)
- Opakované otevření už zhlédnuté epizody nezvyšuje donekonečna preference AI
- Celkový postup (logo) nezkreslují seriály bez známého počtu epizod (dřív se k nim přičítalo 10 falešných)
- Kalendář premiér: seriál, který není v seznamu, se otevře přes TMDB; názvy se escapují
- Texty „Ukládám…", „Uloženo", „zhlédnuto" mají diakritiku

## 2.2.8
### Opraveno
- Objevovat: „Pro tebe" už neukazuje stejný žánr dvakrát (Akční + Akční a dobrodružný)
- Objevovat: `mfDiscoverOpen()` bez argumentu už nerozbije typ filtru
- Oblíbené: pozdní doplnění plakátů už nevrátí položku, kterou jsi mezitím odebral
- Oblíbené: hlášky mají diakritiku
- Nálada: když v databázi nejsou vestavěné seriály, vybírá z toho, co tu je (místo chyby o TMDB klíči)
- Barva profilu, která není platný `#rrggbb`, nerozbije akcent aplikace
- Testy: streak (místní datum) a oblíbené (race condition)

## 2.2.7
### Opraveno
- Série dní (streak) se počítala podle UTC – po půlnoci se přepínala o 1–2 h pozdě; teď místní čas
- Přerušená série se už nezobrazuje jako platná
- Kalendář premiér: dnešní premiéry se odpoledne ztrácely; týden začíná v pondělí
- Ukládání série, nastavení vzhledu a aktivního profilu nespadne při plném úložišti
- Odstraněn zbytečný druhý obal `localStorage.setItem`, který mohl vyhodit chybu
- Escapování TMDB názvů a URL avatarů na dalších místech (série, nálady, TMDB avatar, chybová hláška)
- Service worker: vždy revaliduje (žádný starý kód z HTTP cache), reaguje na kliknutí na notifikaci
- Notifikace nespadnou v prohlížečích bez `Notification` (iOS Safari mimo PWA)
- Proběhl náhodný klikací test (stovky kliknutí, desktop i mobil) – bez JS chyb

## 2.2.6
### Opraveno
- Cinema: odznak „Kde sledovat?" se vkládal do skrytého starého okna, takže nebyl vidět – teď míří do nového přehrávače
- Cinema: odznak se nenačítal dvakrát a stará odpověď už nepřepíše odznak nového titulu
- Cinema: z názvu se pro odkazy na služby odstraní přípona „— S01E02"
- Domovská stránka: spodní lišta se už nepřekresluje ve smyčce každých 200 ms
- Domovská stránka: po zavření záložního okna se zruší `display:none !important`

## 2.2.5
### Opraveno (doporučovací algoritmus)
- České i anglické názvy žánrů se mapují na stejný klíč (dřív se preference rozdělily a neměly efekt)
- Rozpad preferencí (decay) se už nesčítá při každém přihlášení – řídí se `lastDecay`
- Hodnocení bez uložených ID žánrů nyní ukládá TMDB ID z názvů, takže AI se z něj učí

## 2.1.0
### Opraveno
- Hodnocení ukládá žánry → AI se z hodnocení skutečně učí
- Otevření seriálu už nezkresluje žánrové preference
- Platnost „session“ žánrů vyprší po 6 h neaktivity
- Validace zdrojů: `evilbombuj.si` už neprojde jako `bombuj.si`
- Cinema „Přehrát“: správné escapování URL a názvu (XSS)
- Oblíbené: `__tmdbfav_*` položky se otevírají správně
- „Nedávno sledováno“ zobrazuje i seriály z Discoveru
- Avatar jako URL se v horní liště zobrazí jako obrázek
- Scroll-hide docku (chybějící CSS třída)
- `_getEnglishTitle` skutečně hledá anglický název přes TMDB
- Únik MutationObserveru v `openDiscoverTv`, neomezená `_nfCache`
- `AIBrain.save` hlásí plné úložiště

### Nově
- TMDB proxy (`tmdb-proxy.js` + `worker/`), API klíč mimo prohlížeč
- ESLint, smoke + funkční testy (Playwright), GitHub Actions CI
- Moduly: `ai/brain.js`, `profiles/gate.js`, `finder/finder.js` (app.js: 6019 → ~4900 řádků)

### Odstraněno
- Mrtvý kód, duplicitní načítání fontů

## 2.1.1
- XSS: jméno profilu, avatar a barva se escapují (výběr profilu, badge, tooltip, TMDB avatar picker)
- Odstraněn wrapper `setTimeout/setInterval`, který držel každé ID timeru v paměti navždy
- `dock.js`: polling jen když je záložka viditelná (1 s místo 0,5 s)

## 2.1.2
- Doporučení: po vytvoření profilu a výběru žánrů se domovská stránka hned překreslí (dřív až po refreshi)
- `renderHomepage` je dostupná globálně; překresluje se i po přepnutí profilu
- Řádek „Pro tebe“ použije žánry z profilu, i když je paměť AI ještě prázdná

## 2.1.3
- Obrazovka „Vytvoř si svůj profil“: logo je `position: fixed` s krycím pozadím, takže ho při scrollu nepřekryje PIN pole ani jiný obsah
- PIN a jméno: `autocomplete="off"` + přepsání barvy autofillu Chromu

## 2.1.4
- Odstraněn odkaz na neexistující `news.js` (404 → chyba MIME v konzoli)
- YouTube trailer: `origin` se bere z `location.origin` místo napevno zadaného `mujflix.cz` (opraveno pro `mujflix.pages.dev` a vlastní domény)

## 2.2.0
- Průvodce novým profilem má 2. krok „Jak to funguje“: výběr titulu, přepínání zdrojů („Jiný zdroj“), epizody, Oblíbené a upozornění na reklamy
- Odkaz na blokovač reklam se vybírá podle prohlížeče (`core/adblock.js`): Firefox → uBlock Origin, Chrome/Edge/Brave → uBlock Origin Lite, Safari → AdGuard; stejný jediný odkaz je i v Cinema
- Cinema: Uzi.la je v pořadí zdrojů před Prehraj.to
- Cinema už neoznačuje epizody ve špatném seriálu (`activeSeries` zůstávalo nastavené po zavření)

## 2.2.1
- Uzi.la: tvar odkazů je v `cinema.js` v jedné konfiguraci `UZI` (dosud neověřený odhad `/p/{slug}`), oprava = úprava několika řádků

## 2.2.2
- Uzi.la: opravený tvar odkazů podle ověřených příkladů – filmy `/p/{název}`, seriály `/tv/{název}/S04E08` (dřív chybně `/p/{název}-s04e08`); odstraněn zbytečný zdroj „s rokem“

## 2.2.3
- Uzi.la: u filmů a seriálů se z TMDB načtou alternativní názvy (slovenský, český, původní) a „Jiný zdroj“ nabídne každou variantu odkazu zvlášť (např. `spider-man-cez-paralelne-svety`)

## 2.2.4
- Doporučení „Pro tebe“ (domů i Objevovat): ID žánrů se převádí mezi filmy a seriály (`core/genres.js`) – dřív se u seriálů posílala filmová ID (Akční 28 místo 10759, Sci-Fi 878 místo 10765) a žánry z onboardingu u seriálů nefungovaly
