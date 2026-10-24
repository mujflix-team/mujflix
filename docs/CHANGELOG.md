# Changelog

## 3.3.0
- Klidnější aplikace: odstraněno objevování řad (fade-up), banner se jen jemně rozsvítí bez zoomu, plakáty se při najetí zvětšují jen o 3 % (dřív 8 %) a spodní lišta se už nechová při posouvání – zůstává napevno.
- Procházení na telefonu: filtry (typ, řazení, rok, žánry) jsou za tlačítkem „Filtry“ s tečkou, když je něco zapnuté; nesbalují se samy při posouvání.
- Při spuštění se místo prázdné plochy ukáže tmavé pozadí s logem; barva motivu a manifestu sjednocena na #141414.

## 3.2.0
- Jedna navigace pro celou aplikaci: horní lišta (logo · Domů · Seriály · Filmy · Oblíbené · hledání · profil) a v telefonu spodní lišta zůstávají vidět i v Procházení a v Oblíbených. Dřív se z těchto obrazovek dalo jen zavřít křížkem.
- Seriály a Filmy v menu otevřou procházení rovnou daného typu a zvýrazní se správná záložka.

## 3.1.0
- Pevná stavba obrazovek: tlačítko zavřít má všude stejný vzhled (kruh, stejný křížek) a stejné místo vpravo nahoře – v Procházení, Oblíbených, detailu, přehrávači i v oknech (dřív bylo v přehrávači vlevo a v oknech jen holý znak ×).
- Okraje hlavičky Procházení odpovídají úvodní stránce.
- Oprava testu přehrávače (lupa) – v CI běžel dřív, než dokončilo ověření zdroje.

## 3.0.0
- Sjednocený vzhled: Procházení má stejnou neutrální paletu jako úvodní stránka (dřív namodralou), stejná tlačítka (výška, zaoblení 4 px), karty a plakáty (6 px), okna (8 px) a stejný styl vybrané položky (bílá výplň).
- Texty bez emoji v nadpisech řad, v Oblíbených, v hodnocení a v oznámeních; tlačítko v Procházení se také jmenuje „Přehrát“; jednotné „Do oblíbených“.
- Odebrán vysvětlující podtitulek u řady „Populární právě teď“.

## 2.9.1
- Odebrán uvítací tip a okno „O aplikaci“ (působily rušivě); z vyhledávacího pole zmizela nápověda klávesy „/“ (zkratka funguje dál).

## 2.9.0
- Nový uvítací tip pro nové uživatele (menu, hledání, oblíbené) – zavře se tlačítkem „Rozumím“ a už se neukáže.
- Okénko „O aplikaci“ v menu profilu: verze, informace o zdrojích dat a tlačítko pro zkopírování údajů při hlášení problému.
- Jednotné prázdné a chybové stavy (ikona + věta + tlačítko); úvodní stránka při výpadku sítě nabídne „Zkusit znovu“.
- Kostra úvodního banneru během načítání; jemné objevení řad; náhled odkazu (Open Graph) pro sdílení.
- Sjednocené ikony: místo emoji čárové ikony v rychlém procházení, prázdných stavech a Oblíbených.

## 2.8.0
- Přehlednější navigace: nahoře i dole jasné **Domů · Seriály · Filmy · Oblíbené** (v telefonu + Profil). Seriály a Filmy otevřou procházení rovnou správného typu.
- Viditelné hledání: na počítači pole „Hledat filmy a seriály…“ (zkratka `/`), v telefonu lupa.
- Hlavní tlačítko na úvodní stránce se jmenuje „Přehrát“ (dřív „Otevřít“).
- Pod hlavním plakátem řádek rychlého procházení: Seriály, Filmy a žánry (Akční, Komedie, Drama…) – jedním klepnutím se otevře filtrované procházení.
- Oprava testu propojení zařízení (CSP u falešné adresy).

## 2.7.4
- Bezpečnost: odstraněny nepoužívané knihovny GSAP a confetti z CDN (nikde se nevolaly) a cizí domény cdnjs/jsdelivr z CSP – aplikace už nespouští žádný cizí skript.
- Bezpečnost: ověřování zdrojů ve Workeru sleduje přesměrování ručně a po každém kroku kontroluje povolený web a https.
- Drobné zpevnění: název poskytovatele z TMDB se escapuje i v atributu `title`.
- Výběr avatara: když AniList neodpovídá, ukáže se hláška „Anime postavy se teď nepodařilo načíst“ s tlačítkem Zkusit znovu; ostatní řady zůstanou.

## 2.7.3
- Cinema mode: srovnaná lišta tlačítek na PC i v telefonu – tři skupiny (název se zdrojem · epizody · akce), stejná výška a tvar tlačítek, vyhledávání jako ikona lupy (SVG), Další je hlavní akce, v telefonu dvě řady přes celou šířku.

## 2.7.2
- Rychlost a SEO (podle Lighthouse): styly Objevování se načítají bokem (neblokují první vykreslení), `meta description`, lepší kontrast čísla verze, nový `_headers` (písma a ikony dlouho v cache, `nosniff`). Lighthouse lokálně: výkon 40 → 61, přístupnost 94 → 100, SEO 90 → 100.

## 2.7.1
- Propojení zařízení: souběžné změny na dvou zařízeních se slučují po položkách (zhlédnuté epizody, hodnocení, seznam k vidění, knihovna seriálů) podle poslední společné verze. Dřív vyhrál celý klíč novější strany a to, co se mezitím změnilo na druhém zařízení (třeba offline), se ztratilo. Smazání se přenáší, přidání na obou stranách zůstane.

## 2.7.0
- Lišta „Je dostupná nová verze · Obnovit“: aplikace při návratu do popředí a jednou za 30 min porovná běžící verzi s `js/core/version.js` na serveru. Nové `js/update.js`.

## 2.6.9
- Odstraněno načítání Google Fonts (Inter, Sora, JetBrains Mono) – aplikace používá jen Netflix Sans ze složky `fonts/`; rychlejší start a o dvě cizí domény méně v CSP.

## 2.6.8
- Trailer: tlačítka (zvuk, celá obrazovka, zavřít) jsou dole vpravo, aby nepřekrývala název videa nahoře.

## 2.6.7
- Popis zakončený „…“ (hero na domovské stránce, detail seriálu) se po kliknutí rozbalí celý, dalším kliknutím sbalí.
- Výběr avatara: anime postavy jsou vždy nahoře; řady se kreslí postupně podle toho, jak který zdroj odpoví; zdroje se zkusí znovu, když nic nevrátí; poslední úspěšný výsledek se 12 h drží v paměti, takže picker nezůstane skoro prázdný, když síť zrovna selže (dřív se čekalo na všechny najednou a při výpadku AniList zbyly jen dvě řady seriálů).

## 2.6.6
- Písmo: všech 6 řezů Netflix Sans se využívá podle síly (Thin 100–200, Light 300, Regular 400–450, Medium 500–650, Bold 700–850, Black 900). Dřív 600 → Bold a 800 → Black, takže Medium/Regular skoro nešly vidět. Hero popis je Light.
- Okna (výběr profilu, hodnocení, nálada…) už nepoužívají staré Inter/Sora, ale Netflix Sans.

## 2.6.5
- Ikona: odkazy na favicon/ikony/manifest mají `?v=3` a přibyl `icons/favicon.ico`, aby prohlížeč přestal ukazovat starou (modré M) a vzal nové logo.

## 2.6.4
- Výběr epizod/sérií nesekal: mřížka sérií se nestaví znovu při každém přepnutí (znovu se načítaly plakáty a dotazy na TMDB), přepnutí na seznam dílů neanimuje scroll přes stovky karet a karty dílů mimo obrazovku se nevykreslují (`content-visibility`).

## 2.6.3
- Ověření zdrojů u seriálů se ptá jen na 1. epizodu (ne při každém „Další“) a „nevím“ se 5 minut nepřeptává; limit Workeru zvýšen na 200 kontrol / 10 min. Dřív by při sledování po sobě jdoucích dílů ověření po pár epizodách přestalo fungovat (429).

## 2.6.2
- `npm run check-sources`: živá kontrola všech zdrojů (skutečný vs. vymyšlený titul) stejným kódem jako Worker.

## 2.6.1
- Ověření zdrojů: stránka se vyhodnotí jako „titul nemá“ jen když název titulu chybí v nadpisu i v textu (jistější pro weby, které mají v titulku jen název webu).

## 2.6.0
- Cinema mode: lupa 🔍 hledá titul přímo na aktuálním zdroji; další kliky zkoušejí další název (český, původní, přepis).

## 2.5.3
- Přehrávač před prvním načtením krátce (max 1,5 s) ověří první zdroj, takže se nejdřív neotevře stránka, která titul nemá.

## 2.5.2
- Lišta zdrojů ukazuje stav ověřování: „ověřuji zdroje…“, „ověření teď není dostupné“ (Worker neběží / není nasazen nový) a „žádný z ověřených zdrojů titul nemá“.

## 2.5.1
- Ověření zdrojů: Worker pozná „měkkou 404“ (web vrátí 200 a obecnou stránku, např. úvod Bombuje „Filmy | Seriály“) – v nadpisu stránky musí být něco z názvu titulu.
- Oprava testu ověření zdrojů (CSP: falešný Worker na povolené doméně).

## 2.5.0
### Nově
- Ověření zdrojů: před přehráním se Worker (nová cesta `/src/probe`) podívá na stránky zdrojů a zjistí, který titul opravdu má. Zdroj bez titulu se přeskočí, otevře se první, který ho má, a v liště je ✓ / ✗ (u nenalezených „titul nemá“). Když ho nemá žádný zdroj, ukáže se zpráva místo chybové stránky.
- **Je nutné znovu nasadit Worker** (`worker/tmdb-proxy.js`), jinak se ověření nespustí a vše funguje jako dřív.

## 2.4.7
### Opraveno
- Karty v řadách na domovské stránce se při najetí myší už neořežou do obdélníku (příčinou bylo `contain: paint` v `css/patches.css`).

## 2.4.6
### Změněno
- Zvonek Novinky a celý panel novinek jsou pryč (tlačítko nahoře i v hlavičce); kontrola nových epizod se už nespouští.
- Trailer v banneru: bez ovládání YouTube (nadpis, kanál, lišta); jen tři malá tlačítka (zvuk, celá obrazovka, zavřít), klepnutí na video = pauza.
- Řady: zvětšený plakát při najetí a jeho stín se už neořízne do obdélníku.

## 2.4.5
### Změněno
- „Pokračovat“ (v detailu seriálu i v banneru domovské stránky) rovnou pustí další epizodu; dřív jen otevřelo detail / seznam dílů.
- Náhledy epizod už se neskrývají (zrušeno „Skryto“).
- Odstraněn toast „📺 Načítám…“ při otevření seriálu z Objevovat.
- Adresa: znovu se čistí `#…` (i po kliknutí a návratu zpět).

## 2.4.4
### Nově
- Hezký nápis titulu: v detailu seriálu i v banneru domovské stránky se místo prostého textu ukáže oficiální logo titulu z TMDB (česká verze, jinak anglická). Když logo neexistuje, zůstává text.

## 2.4.3
### Změněno
- Seznam dílů (po „Další epizody“) má menší hlavičku, aby bylo vidět víc epizod.

## 2.4.2
### Změněno
- Detail seriálu je na celou obrazovku jako v klasických službách: vlevo název, metadata, popis, herci, tlačítka a odkazy „Další epizody“ / „Podobné“. Mřížka sérií se už neukazuje, díly a výběr série jsou po „Další epizody“.

## 2.4.1
### Nově
- Detail seriálu: pod tlačítky jsou odkazy „Další epizody“ (otevře díly) a „Podobné“ (podobné seriály z TMDB, klepnutím se otevře jejich detail).

## 2.4.0
### Nově
- Mini přehrávač traileru v banneru domovské stránky (vpravo nahoře): miniatura, po kliknutí YouTube trailer, celá obrazovka a zavření. Při odscrollování z banneru se video pozastaví. Iframe se načte až po kliknutí.
- „Pokračovat ve sledování“: vpravo v banneru je hromádka dalších rozkoukaných titulů s počtem; klepnutím na kartu se přepne do banneru (tam je i „Dokoukal jsem“).
- Detail seriálu: řádek rok · žánry · počet sérií · HD, popis, herci a tlačítko „Přehrát/Pokračovat · S1 E1“.

## 2.3.11
### Nově
- Uvítání nového profilu je přívětivější („Vítej v MůjFlixu“, nic není povinné).
- Oblíbené mají stejné karty jako ostatní řady (menší zaoblení, zvětšení po najetí, stejné písmo).
- Plakáty se po načtení jemně rozsvítí a načítací dlaždice mají tmavší filmový shimmer.
- „Kde sledovat“: místo názvů a ikony televize jsou vidět loga služeb; kratší odznak i panel.

## 2.3.10
### Opraveno
- Prázdné Oblíbené → Objevovat → ✕ už nenechá zmizet dock; zavření Objevování vrátí na domovskou stránku.
- Panel Novinky: při zavírání se šipka hned schová (žádná druhá šipka); poloha šipky se počítá jen u otevřeného panelu.
- Logo MůjFlix v Objevování vede na domovskou stránku.
- Klik na logo na domovské stránce plynule vyjede nahoru (bez skoku).

## 2.3.9
### Opraveno
- Seriály s japonským/čínským názvem (např. „ドラゴンボール超“) se na NajSerialy, SvetSerialu, Bombuj a Uzi.la už hledají podle latinského názvu z TMDB (`dragon-ball-super`), ne podle prázdného odkazu. Anglický název je první varianta, romaji další.

## 2.3.8
### Nově
- Po změně věku, žánrů nebo „Jen anime“ se domovská stránka i Objevovat obnoví samy (bez Ctrl+R). Řady se při ověřování věku ukážou jako načítací dlaždice, ne jako prázdné místo.
- Logo vlevo nahoře vrací na domovskou stránku k banneru.
- Panel Novinky má šipku, která míří na zvonek (stejně jako menu profilu u avatara).
- Skrytý náhled epizody (dřív „Spoiler“ s opičkou) je teď tmavý panel s přeškrtnutým okem a nápisem „Skryto“; po najetí myší se náhled ukáže.
- V detailu seriálu je místo štítku TMDB výpis žánrů.

### Opraveno
- Seznam epizod se netrhá: žádné blur ani brightness filtry na stovkách miniatur a epizody se vkládají najednou (jeden přepočet místo stovek).
- Šedá plocha za žánry v „Zaměření a žánry“ po kliknutí: štítky spadly pod obecné pravidlo `[class*="-chip"]:hover` (přejmenováno na `pf-tag`).
- Šipky u řad už nemizí pod zvětšenou kartou a klik nepropadne na film pod nimi.
- `#serialy` a spol. se z adresy mažou hned, ne až po chvíli.

## 2.3.7
### Opraveno
- Omezený profil: řádky s méně než 6 tituly (např. Drama jen se třemi) se na domovské stránce a v Objevovat schovají, aby nepůsobily rozbitě.
- Omezený profil: žánrové řádky dotáhnou až 5 stránek z TMDB (dřív 3), takže jich po filtru zbude víc.

## 2.3.6
### Opraveno
- Věkové omezení: omezený profil dostává mnohem víc titulů. Obecné seznamy (populární, nejlépe hodnocené) se nahradí dotazem, který TMDB filtruje rovnou: filmy podle hodnocení (`certification.lte`), seriály podle rodinných žánrů u Do 7 a Do 12.
- Domovská stránka: prázdný vysoký banner, když pro něj není titul, se teď sbalí (výšku z media query mu dřív přebíjela). Hlavní příčina prázdné plochy nad řádkem u omezeného profilu.
- Domovská stránka: nadpis prvního řádku už nezasahuje do tlačítek Otevřít a Oblíbené v horním banneru (menší překryv banneru a řádků).

## 2.3.5
### Nově
- Verze aplikace vpravo dole na obrazovce „Kdo se dívá?“ (po nasazení hned vidíš, že běží nová).
- Verze se hlídá sama: na Cloudflare Pages se při sestavení k verzi z `package.json` přidá krátké ID commitu (např. „v2.3.5 · abc1234“, datum sestavení je v nápovědě po najetí myší). Vyžaduje v Cloudflare Pages nastavit Build command `node scripts/version.mjs` a Build output directory `.`; bez toho se zobrazí jen číslo verze.
- Věkové omezení rychleji a spolehlivěji: dohledávání hodnocení má společnou frontu (nejvýš 8 dotazů naráz) a jeden opakovaný pokus; filtr se zastaví, jakmile má dost titulů; filmy se pro omezený profil berou přímo přes TMDB filtr hodnocení (`certification.lte`); nabídka domovské stránky se po změně věku načte znovu.
- Verze vpravo dole: datum sestavení se ukáže i po najetí myší (dřív bylo nepřístupné).
- Výběr avatara: nahoře jsou řady s nejvíc obrázky; řady, kde se našly jen 1–4 obrázky (třeba Stranger Things), se nezobrazí.

## 2.3.4
- Oprava: s věkovým omezením zbývalo v řádcích jen pár titulů, protože se filtrovala jedna stránka (20 titulů). Omezený profil teď dotáhne 3 stránky seznamů (`MFAge.wide`) a základní seznam doporučení bere 40 titulů místo 10.
- Oprava: dock se někdy sám schoval, když se stránka přesunula sama (načtení řádků, filtrování). Teď se schová jen při posouvání uživatelem (kolečko, prst, klávesy).
- Věk jde nepovinně zvolit už při zakládání profilu (výchozí Bez omezení). Z Nastavení v menu profilu zmizela duplicitní položka Záloha dat; zůstává v Propojení zařízení.
- Nové: **Věkové omezení profilu** (Nastavení → Zaměření a žánry → Bez omezení / Do 7 / Do 12 / Do 15). Hodnocení se bere z TMDB (americká škála G/PG/PG-13, TV-Y…TV-14), filtruje Pro tebe, Objevovat, hledání i novinky; titul bez hodnocení se u omezeného profilu skryje. Hodnocení se pamatuje jen na zařízení (`mfx_age_cache`). Není to zámek: u profilu s PINem jde věk změnit jen s PINem. Nový `js/core/age.js`.
- Úklid: z `index.html` odstraněno staré dlaždicové menu (`.ps-menu-scene`, ~230 řádků), které bylo na nové domovské stránce vždy skryté. Vzhled beze změny (31 ze 32 snímků pixel po pixelu shodných, zbylý se liší jen načasováním tečky u zvonku); data `db` a `mf_db_custom` zůstávají.
- Menu profilu (avatar vpravo nahoře) je úklidnější: zbyly jen přepnutí profilu, **Spravovat profily** a **Nastavení**. Pod Nastavením je Upravit profil, Zaměření a žánry, Propojení zařízení a Záloha dat (u každé položky je vidět aktuální stav).
- Nové: **Zaměření a žánry** v menu profilu (avatar vpravo nahoře): přepínač **Všechno / Jen anime** a výběr oblíbených žánrů (až 5), vše se ukládá do profilu a synchronizuje mezi zařízeními. „Jen anime“ filtruje doporučení, Objevovat (řady i hledání) a novinky; při zakládání profilu je v prvním kroku stejný přepínač. Pokryto testy.
- Sdílená paměť zdrojů: Worker má `/src/get` a `/src/report` (KV, jen počty hlášení názvu zdroje pro titul, omezení 20 hlášení / 10 min na IP, vypnutí `SRC_SHARE=off`). Kino hlásí funkční zdroj jednou za titul a zařízení a na začátku použije zdroj od ostatních, pokud nemá vlastní zkušenost. **Vyžaduje nasazení nového kódu Workeru** (bez něj appka funguje jako dřív). Pokryto testy ve Workeru i v kině.
- Rychlost: service worker bere písma (`/fonts/*.woff2`) rovnou z cache bez dotazu na síť (ověřeno, funguje i offline). Zbytek zůstává „nejdřív síť“, aby po nasazení opravy nehrozil starý kód.
- Úklid 3: z CSS odstraněno 159 mrtvých pravidel starých dlaždic (`.ps-tile*`, `.ps-menu*`, `.tile-*`, `.tsi-*`); `styles.css` 187 → 164 kB. Vzhled beze změny (snímky shodné), testy prošly.
- Úklid 2: z `js/app.js` odstraněn mrtvý kód starých dlaždic (efekty, trailery, klávesová navigace dlaždic, animace načtení). Doplnění obrázků, hodnocení a žánrů vestavěným seriálům z TMDB zůstalo (`loadTmdbDbData`) a je pokryté testem. Opraveno: po odstranění dlaždic se tato data jinak přestala doplňovat.

- Worker (propojení): kód jde vytvořit jen pro existující sadu dat a do KV se při zadání kódu zapisuje jen při chybě (ochrana limitu 1000 zápisů denně před zneužitím). Nový test `tests/worker.mjs`.
- Propojení: první zařízení bez dat se nahraje i prázdné, aby šel vytvořit kód.
- Kino: appka si pamatuje zdroj, který pro titul fungoval (začne jím příště i u dalších epizod), a nově je tu tlačítko „Nefunguje to“ (označí zdroj na 14 dní a zkusí další). Rychlé přepnutí „Jiný zdroj“ do 25 s označí zdroj jako podezřelý na 3 dny. Paměť se synchronizuje mezi zařízeními.
- Záloha dat do souboru (menu profilu → Záloha dat): export / import profilů, seznamů a hodnocení bez API klíčů.
- Rychlejší start: GSAP a confetti se z CDN načítají s `defer` (neblokují vykreslení) a QR knihovna (56 kB) se stahuje až při zobrazení kódu.
- Test „Objevovat“ už nezávisí na `config.js` (s adresou Workeru se TMDB volalo přes `workers.dev` a test to blokoval, takže CI padalo).
- Opraveno: v kině „Další epizoda“ spadla (`epCountFn is not a function`), když byl TMDB nedostupný; teď se použije záložní počet epizod. Tím padal i test v GitHub Actions.
- Spolupráce ve dvou: `CLAUDE.md` (pravidla pro Clauda), `docs/TASKS.md`, `docs/SPOLUPRACE.md`, šablona Pull Requestu; `config.js` už není v `.gitignore`.
- Opraveno: v pozadí hrála znělka Simpsonových bez obrazu (starý trailer na skryté dlaždici). Trailer se na neviditelné dlaždici už nespouští.
- Propojení zařízení: změny se posílají rychle (profily a hodnocení do ~10 s), druhé zařízení je stahuje každých 45 s a při návratu na kartu. Nový profil se objeví bez obnovení, ostatní změny nabídnou „Načíst změny“.
- Propojení zařízení: 6znakový kód nebo QR, data (profily, seznamy, hodnocení) se sdílejí přes Worker + Cloudflare KV; tajné klíče a PIN zámek se nesdílí. Vstupy: menu profilu vpravo nahoře, „Kdo se dívá?“ (pod Upravit) a nový 3. krok při vytvoření profilu (jen když není propojeno). Soubory: `js/core/sync.js`, `sync-ui.js`, `qr.js`, `worker/tmdb-proxy.js`.
- README přepsáno: aktuální struktura, profily, PIN zámek, avatary, NajSerialy/Uzi.la.

- Menu profilu vpravo nahoře (jako Netflix): rychlé přepnutí na jiný profil, „Upravit profil“, „Spravovat profily“.
- Úprava profilu používá stejnou obrazovku jako tvorba (1:1), jen s textem „Uprav si svůj profil“, tlačítkem „Uložit změny“ a „Smazat profil“.
- Kdo se dívá → Upravit: avatary se netřesou (tužka na tmavém překryvu), klik na avatar otevře úpravu, červené „−“ je větší.
- Kino: srdce je až za hvězdou; „Kde legálně sledovat“ má nový vzhled (ikona TV, panel a tlačítka ve stylu Netflixu).

- Avatar, hledání: další zdroje obrázků postav – Fandom wiki (Marvel, DC, Star Wars, Harry Potter, Game of Thrones, Stranger Things, Breaking Bad, Disney) a Wikidata (fiktivní postavy). Výsledky se doplňují průběžně podle toho, jak který zdroj odpoví. TVmaze bere výhradně obrázek postavy (character.image), postavy bez něj přeskočí.

- Avatar, výchozí nabídka: seriály, Marvel/DC, Star Wars, Harry Potter, animované a filmové postavy jsou první, anime je jen pár řad na konci.
- Avatar, hledání: nové zdroje TVmaze (postavy z obsazení seriálu), superhrdinové (akabab/superhero-api) a Disney (disneyapi.dev) vedle Wikipedie a AniList. Hledání „Breaking Bad“ ukáže postavy seriálu, „Batman“ superhrdiny, „Elsa“ Disney postavy.
- Uvítací „Ahoj, …“ a odznak profilu se už nezobrazují (pojistka proti prázdnému rámečku v rohu).

- PIN: jen 5 pokusů. Po špatném pokusu se ukáže, kolik jich zbývá; po pátém se zadávání zablokuje s odpočtem a zámek se stupňuje (30 s → 2 min → 10 min → 30 min → 1 h → 4 h → 24 h). Stav se pamatuje po profilech (obnovení stránky ho neobejde), správný PIN ho vynuluje.

- Odstraněn průhledný obdélník v levém horním rohu (starý odznak profilu).
- PIN obrazovka: obrázkový avatar se vykreslí jako obrázek (dřív se vypsala jeho adresa jako text).
- Kdo se dívá: obrázkový avatar vyplní celý čtverec, ne kruh.
- Avatar: mnohem víc postav – řada za každé z nejpopulárnějších anime (AniList) a víc seriálů, Pán prstenů, Star Trek, Doctor Who apod. (Wikipedie).

- Avatar: jen postavy (žádné záběry ani náhledy epizod). Výchozí nabídka: oblíbené anime postavy (AniList) a řady postav ze seriálů a filmů (Breaking Bad, Game of Thrones, Stranger Things, Marvel, DC, Star Wars, Harry Potter, animované…) z Wikipedie. Hledání najde i další postavy.
- NajSerialy: u japonských seriálů se použije romaji název z AniList (Shuiro no Kamen) a zdroj se po doplnění názvu načte znovu; dřív se otevřela jen úvodní stránka webu.
- Novinky: víc anime (až 4 seriály a 2 filmy, delší období) pro profily se zapnutým Anime.
- PIN obrazovka je na nízkých oknech (notebooky) menší.

- Avatar: nahoře řady postav – AniList (oblíbené anime postavy, hledání postav z animí) a Wikipedie (postavy a obrázky ze seriálů a filmů); pod nimi řady titulů z TMDB. Hledání jména postavy (např. „Walter White“, „Naruto“) ukáže její obrázek.
- Nový zdroj NajSerialy.io (seriály; varianta bez roku i s rokem v adrese, např. carrie-2026, a alternativní názvy).
- Uzi.la web zakazuje vložení do jiné stránky (Firefox i Chrome), takže se místo prázdné stránky ukáže vysvětlení a tlačítko „Otevřít v novém okně“.

- Kino: tlačítko „Nová karta“ odstraněno.
- Výběr avatara při tvorbě profilu ve stylu Netflixu: řady podle filmů a seriálů (název + čtvercové obrázky ze záběrů a plakátů), bez záložek a proklikávání; hledání sestaví řady z výsledků.

- Štítek „Pokračovat ve sledování“ v rohu odstraněn. V hero u pokračování místo minut „S1 E02 · zbývá 8 epizod“ (nebo „zbývá 3 série“).
- Hodnocení epizody je malý popover bez ztmavení a bez blokování klikání; klik na hvězdu uloží samo, zmizí po 9 s nebo kliknutím jinam.
- Profil, který si vybral jen Anime, dostává čistě anime doporučení (Vybráno pro tebe, Top 10, nejlépe hodnocené, Novinky) – žádné Breaking Bad ani sci-fi z naučených žánrů.
- Dlouhé názvy v hero jsou max. 2 řádky a menší písmo, nezasahují do horní lišty.
- Nový profil: průvodce (1/2) se ukáže hned, nic nebliká a domovská stránka není vidět.
- Kino: hvězdička je vždy vidět (seriály i filmy), nenápadná.
- Výkon: rozmazání pozadí vypnuté všude.

- Hodnocení epizody z kina vyskakuje přímo z ikony hvězdičky (bublina u ikony), ne zespoda obrazovky.
- Anime a Animované jsou oddělené (anime = japonský původ + animace): Simpsonovi se nemíchají s Chainsaw Manem v Objevovat, v doporučení ani v Novinkách. Anime se do doporučení přidává jen u profilů, které ho zapnuly.
- Pokračovat ve sledování: jen to, co uživatel opravdu pouštěl (seriály i filmy z kina). Počítá se od nejvyšší zhlédnuté epizody (po S1E2 nabídne S1E3, ne S1E1). Nové tlačítko „Dokoukal jsem“ položku schová a ukáže další rozkoukanou.

- Písmo Netflix Sans (složka `fonts/`, woff2) místo systémového.
- Okno seriálu: nižší hlavička a při scrollování seznamu se zmenší na jeden řádek (název + Pokračovat), takže nezabírá půl obrazovky.

- Avatar: výběr obrázku se potvrdí sám (picker se zavře), při výběru nepřekáží logo.
- Pokračovat ve sledování: seriály z Objevovat se po zhlédnutí ukládají (dřív po zavření zmizely, takže „Pokračovat“ nemělo co ukázat).
- Zdroje: Uzi.la je až za Prehrajto.cz.
- Adresa už neukazuje #serialy/#filmy.
- Dock: samoopravení, když zůstane schovaný po zavření okna (nově se vrací i dotykem u spodní hrany).
- Písmo ve stylu Netflixu; mobil: tlačítko zavřít okno seriálu níž; hover v okně seriálu jen na myši a jemnější.
- Výkon: vypnutá nepoužívaná animace částic, rozmazání pozadí vypnuté na mobilu, dlouhé seznamy epizod se vykreslují líně.
- Kino: hvězdička označí epizodu jako zhlédnutou a otevře hodnocení.

- Výběr série v Netflix stylu: mřížka plakátů s názvem série a počtem epizod, při najetí kulaté tlačítko přehrát; zmizel bílý popisek „Série N“ a velké modré tlačítko.

- Přehlednější struktura: CSS je ve složce `css/`, veškeré skripty (včetně `ai`, `core`, `finder`, `profiles`) ve `js/`, changelog v `docs/`. V kořeni zůstaly jen vstupní soubory a konfigurace.

- „Pokračovat ve sledování“: nenápadný štítek v rohu (náhled, název, lišta rozkoukanosti, tlačítko ▶), jednou za spuštění, sám zmizí a nic nezakrývá.

- Anime se spolehlivě mixuje do doporučení „Pro tebe“ (každé třetí místo, i bez dalších žánrů); stávající profily ho zapnou v Nastavení („Přimíchávat anime do doporučení“).

- Výběr žánrů po vytvoření profilu: bez emoji a nově s Anime. Anime se ukládá do profilu a algoritmus ho zapojuje do doporučení na úvodní obrazovce i do Novinek.

- Epizody: odstraněn starý modrý pruh u „další epizody“ (rámeček kolem čísla).
- Vytvoření profilu: avatar vedle jména a PINu, výběr avatara na celou obrazovku (styl Netflix).
- Zadání PIN: celá obrazovka se čtyřmi políčky a číselnou klávesnicí, funguje i NumLock.
- Novinky: nově ukazují doporučené nové filmy a seriály podle oblíbených žánrů (bez už viděného), pod nimi epizody tvých seriálů.

- Výběr epizod v Netflix stylu: číslo epizody, náhled, popis, tlačítko přehrát; sezóna se vybírá rozbalovátkem, odstraněny staré šipky.
### Nově
- Oficiální logo MůjFlix (nápis) jako ikona aplikace (favicon, PWA 192/512, maskable, iOS); SVG ikony nahrazeny.
- Číslo verze v Nastavení („MůjFlix v…“), zdroj `core/version.js`; test hlídá shodu s `package.json`.
- Vlastní ikony aplikace v repozitáři (`icons/`: 192/512 px, maskable pro Android, apple-touch, favicon, SVG) – aplikace už nezávisí na cizí službě image2url.com
- Content-Security-Policy (meta tag v `index.html`): skripty jen z vlastní domény a cdnjs/jsdelivr, spojení jen na TMDB, AI služby, zdroje a tvoji proxy (`*.workers.dev`, `*.pages.dev`), zakázané `<object>`, pevné `<base>`. Testy teď selžou při jakémkoli porušení CSP
### Opraveno
- **PIN:** v okně „Zadej PIN“ jde psát číslicemi z klávesnice (řada i numerická, NumLock), Backspace maže, Esc zavírá. Pole PIN při vytváření profilu přijímá jen číslice (dřív šlo napsat písmeno a PIN se tiše neuložil), Backspace skočí zpět, jde vložit 4 číslice ze schránky.
- **Avatar profilu:** místo fotek herců se nabízejí plakáty a záběry z vybraného filmu/seriálu (TMDB nemá obrázky postav). Texty „postava“ → „obrázek“.
- **Barva profilu a „Přizpůsobit vzhled“ (akcent, pozadí, zaoblení) nic nedělaly**: `--accent`, `--accent2`, `--bg`, `--radius*` měly v CSS `!important` (styles.css i `<style>` v index.html), které přebíjelo inline styl z JS. `!important` odstraněn, výchozí hodnoty jsou v posledním bloku `:root` v styles.css (stejné jako dřív). `custApplyAll` už nepřepíše barvu profilu výchozí modrou. Pozadí „Tmavé“ je nově `#060608` (dřív pevně `#000`). Pokryto testy.
- Trailery na dlaždicích: když se nenačte gsap z CDN (výpadek, blokátor), už nespadne hover efekt; trailer se prostě nezobrazí. Pokryto testem.
- Úložiště: obal `localStorage.setItem` už nespadne na nestringovém klíči.
- Cinema mode: přehrávač běží bez sandboxu (sandbox blokoval Filemoon uvnitř SvetSerialu). Odstraněno tlačítko „Ochrana“, varovná ikona a text „+ Oblíbené“ (nově jen srdíčko ♡/♥, i v okně seriálu); v okně seriálu zmizely „Hodnotit“, „Otevřít na externím webu“ a nápověda „Vyber si sezónu“; z onboardingu zmizel odstavec „Video se nenačte?“. Pokryto testem.
- Finder: název nebo URL s `'`, `"` či `\` rozbil tlačítka v okně výsledků a název z externího zdroje šel vložit jako HTML (XSS). Nově se escapuje pro HTML i JS; pokryto testem.
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
- **CSS zmenšeno o ~88 kB (z 362 kB na ~273 kB):** odstraněno ~1 800 deklarací, které přebíjela pozdější deklarace stejné vlastnosti pod stejným selektorem (mrtvý kód po vrstvených přepisech) a 96 nepoužitých CSS proměnných (`--ios-*`, `--ios26-*` …). Vzhled ověřen porovnáním computed stylů ~900 prvků před/po (desktop i mobil, výchozí stav, Nastavení, Watchlist, Přizpůsobit) – 0 rozdílů.
- Odstraněna CSS pravidla pro třídy/ID, které nikde v HTML ani JS neexistují (`nn-*` staré notifikace, `timerFab`, `syncStatusBadge`, …); pravidla s `:not(.tv-mode)` zůstávají (negace chybějící třídy platí vždy).
- Odstraněny skryté (nikdy nezobrazené) prvky: výběr sezón „season pills“ + počítadlo a indikátor automatického ukládání včetně JS a CSS.
- Odstraněny nepoužité funkce `scoreAndSortItems`, `tmdbRow`, `fetchNameVariants`, `addToWatchlistByName` a `AIBrain.boostGenres`.
- `npm run css-vars` – inventura CSS proměnných (definice, efektivní hodnota, použití v CSS/JS/HTML, status dead/conflict). Výstup v `docs/css-vars.md`.
- Prohlížečový TMDB shim přesunut `tmdb-proxy.js` → `core/tmdb-proxy-shim.js` (Worker zůstává `worker/tmdb-proxy.js`), ať se názvy nepletou.
- Verze se generuje z `package.json` (`npm run bump -- patch|minor|major`), `core/version.js` se nepíše ručně.
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
