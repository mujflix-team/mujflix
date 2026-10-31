<div align="center">

# 🎬 MůjFlix

**Osobní filmový a seriálový tracker ve stylu Netflixu.**
Najdi, co sledovat, pamatuj si, kde jsi skončil, a měj profily, hodnocení a seznamy na všech zařízeních.

[![Živá aplikace](https://img.shields.io/badge/živá_aplikace-mujflix.pages.dev-e50914?style=for-the-badge)](https://mujflix.pages.dev)

![Status](https://img.shields.io/badge/status-aktivní-brightgreen)
![Jazyk](https://img.shields.io/badge/jazyk-česky-blue)
![PWA](https://img.shields.io/badge/PWA-ano-5A0FC8)
![Build](https://img.shields.io/badge/build-žádný-lightgrey)
![Závislosti](https://img.shields.io/badge/runtime_závislosti-0-success)

[Co to umí](#-co-to-umí) ·
[Rychlý start](#-rychlý-start) ·
[Nasazení](#-nasazení) ·
[Struktura projektu](#-struktura-projektu) ·
[Jak to funguje](#-jak-to-funguje) ·
[Vývoj](#-vývoj) ·
[Soukromí](#-soukromí) ·
[FAQ](#-časté-problémy-faq)

</div>

---

## Obsah

1. [Co je MůjFlix](#-co-je-můjflix)
2. [Co to umí](#-co-to-umí)
3. [Rychlý start](#-rychlý-start)
4. [Konfigurace (`config.js`)](#-konfigurace-configjs)
5. [Nasazení](#-nasazení) – Cloudflare Pages, Worker, KV
6. [Struktura projektu](#-struktura-projektu) – kde co leží a co to dělá
7. [Jak to funguje](#-jak-to-funguje) – načítání, úložiště, doporučování, zdroje, propojení
8. [Vývoj](#-vývoj) – testy, lint, verze, cache, CSS
9. [Soukromí a bezpečnost](#-soukromí)
10. [Časté problémy (FAQ)](#-časté-problémy-faq)
11. [Přispívání](#-přispívání)
12. [Poděkování](#-poděkování)
13. [Disclaimer](#-disclaimer)

---

## 📖 Co je MůjFlix

MůjFlix je **statická PWA** (progresivní webová aplikace) napsaná ve **vanilla JavaScriptu** – bez frameworku, bez bundleru, bez buildu. Soubory se nahrají na hosting a běží. Všechna data (profily, oblíbené, postup sledování, hodnocení) zůstávají v **tvém prohlížeči** (`localStorage`); volitelně se zrcadlí do tvého vlastního Cloudflare KV, aby se sdílela mezi zařízeními.

Metadata o filmech a seriálech (plakáty, popisy, herci, trailery, hodnocení, kde se dá legálně sledovat) pocházejí z [TMDB](https://www.themoviedb.org/). Aplikace **nehostuje žádná videa** – jen tě navede na streamovací služby nebo externí weby.

**Pro koho je:** pro rodinu a přátele, kteří chtějí jedno místo pro „co jsem rozkoukal“, „co chci vidět“ a „co mi doporučíš“, s oddělenými profily (každý má vlastní vkus, hodnocení a případně PIN).

---

## ✨ Co to umí

### 🏠 Úvodní stránka

- **Hero banner** s doporučeným titulem
- **Pokračovat ve sledování** – plakát, lišta postupu, „S1 E4“, štítek *Nová epizoda* a tlačítko *Dokoukal jsem*
  - **klepnutí na kartu seriálu otevře detail s výběrem epizod** (nic se nespustí samo)
  - **▶ na kartě** rovnou pustí další epizodu (nebo rozkoukaný film)
- **Vybráno pro tebe**, **Protože jsi viděl …** (řady odvozené z posledních zhlédnutých), **Top 10 tento týden**, populární, nově přidané, podle žánru
- Řady respektují **věkové omezení** profilu a režim „Jen anime“

### 🔎 Procházení a hledání

- Dock **Seriály / Filmy** otevře Procházení: banner, řady podle žánrů, filtry, řazení
- **Hledání** (lupa, klávesa `/`) podle českého, anglického i původního názvu
- **Kalendář premiér**, **kolekce**, **výběr podle nálady**, **série dní** (streak)

### 📺 Detail seriálu

Okno se třemi záložkami:

| Záložka | Obsah |
|---|---|
| **Epizody** | Řádek tlačítek sezón (nebo výběr, když je jich moc), mřížka epizod s postupem; klepnutí na řádek epizody ji pustí, dlouhé podržení nabídne další akce (označit jako zhlédnuté…) |
| **Podobné** | Podobné seriály podle TMDB, filtrované věkovým omezením |
| **Popis** | Děj, fakty (rok, žánry, počet sezón, hodnocení, stav), **trailer**, **obsazení** – klepnutí na herce ukáže jeho filmografii a z ní se dá otevřít další titul |

### ❤️ Oblíbené

- Karty **Filmy / Seriály / Rozkoukané / Dokoukané** + počty
- **Rozkoukané** = seriály s rozpracovaným postupem a filmy, které sis pustil a nedokoukal
- Na kartě seriálu je **lišta postupu** a popisek, např. *„S2 E5 · 43 %“*
- **Řazení:** nejnovější přidané · rozkoukané nahoře · A–Z
- Hodnocení, mazání, přehrání jedním klepnutím

### 🎞 Cinema mód (přehrávač)

- Vestavěný přehrávač s výběrem sezóny a epizody, tlačítkem **Další ›** a přepínáním zdrojů za běhu
- Jedna kompaktní lišta ovládání (na telefonu i počítači se nezalamuje)
- Hodnocení epizody / filmu hvězdičkou, srdce do Oblíbených, ikona „kde to legálně sledovat“
- Sandbox iframe blokuje vyskakovací reklamy; tip na blokovač podle prohlížeče

### 🔗 Zdroje a legální streamování

- **České a slovenské weby** (Bombuj, SvetSerialu, Podivana, Prehraj.to, NajSerialy, Uzi.la) – URL se sestaví z názvu, roku, sezóny a epizody; u anime se použije romaji z AniList
- **Legální služby** (Netflix, Disney+, Max, Apple TV+, Prime Video, SkyShowtime, Voyo, Canal+, O2 TV, Crunchyroll …) přes *TMDB Watch Providers* pro ČR/SK
- **Paměť zdrojů** – appka si pamatuje, který zdroj fungoval; tlačítko *Nefunguje to* ho označí a zkusí další
- **Sdílená paměť zdrojů** (volitelná) – zdroj, který fungoval ostatním, se zkusí první; posílá se jen „titul + název zdroje“
- **Ověření zdrojů** (Worker) – před přehráním se zkontroluje, jestli web titul opravdu má (✓ / ✗ v liště zdrojů)

### 🧠 Doporučování

Lokální algoritmus `AIBrain` (žádná externí AI, žádný odesílaný profil) – podrobně viz [Doporučování](#doporučování).

### 👤 Profily a zařízení

- **„Kdo se dívá?“**, avatary (oblíbená postava), barva profilu, PIN (dětská pojistka)
- **Věkové omezení** (Bez omezení / do 7 / 12 / 15) a **zaměření** (Všechno / Jen anime + až 5 oblíbených žánrů)
- **Propojení zařízení** šestimístným kódem nebo QR – bez hesla a e-mailu
- **Záloha** do `.json` a import zpět

### 📱 PWA

- Instalace na plochu (Android, iOS, desktop), vlastní ikona, offline stránka *„Jsi offline“*
- Hláška o nové verzi, tlačítko Zpět v prohlížeči zavírá otevřené vrstvy
- Čisté adresy (`/soukromi`) a vlastní 404

---

## 🚀 Rychlý start

Potřebuješ jen prohlížeč, Node.js 20+ (kvůli testům) a [TMDB API klíč](https://www.themoviedb.org/settings/api) (zdarma).

```bash
git clone https://github.com/mujflix-team/mujflix.git
cd mujflix
cp docs/config.example.js config.js     # a uprav (viz níže)
npm run serve                            # = python3 -m http.server 8080
```

Otevři <http://localhost:8080>.

> ⚠️ Neotvírej `index.html` přes `file://` – prohlížeč blokuje iframy i service worker. Vždy použij lokální server (`npm run serve`, `npx serve .` …).

---

## ⚙ Konfigurace (`config.js`)

`config.js` je jediný soubor, který si děláš sám. Vzor: [`docs/config.example.js`](docs/config.example.js).

| Proměnná | Kdy | Popis |
|---|---|---|
| `window.TMDB_PROXY_URL` | **produkce** | Adresa tvého Cloudflare Workeru. TMDB klíč pak zůstává na serveru. |
| `window.TMDB_KEY_DEFAULT` | jen lokální vývoj | TMDB v3 klíč přímo v prohlížeči. **Nikdy ho nenahrávej do veřejného repozitáře.** |

Produkční `config.js` má obsahovat **jen** `window.TMDB_PROXY_URL = "https://…workers.dev";`.

---

## ☁ Nasazení

### 1. Frontend na Cloudflare Pages

1. Pushni repozitář na GitHub.
2. Cloudflare → *Workers & Pages* → **Create → Pages → Connect to Git**.
3. *Build command:* prázdné · *Output directory:* `/`.
4. Soubor `config.js` přidej do repozitáře (jen adresa Workeru, žádné klíče).
5. Hlavičky (cache fontů, `X-Frame-Options`, `Referrer-Policy`, …) řeší soubor [`_headers`](_headers).

Funguje i GitHub Pages, Netlify nebo jakýkoli statický hosting – `_headers` je specifické pro Cloudflare.

### 2. TMDB proxy Worker (doporučeno)

Složka [`worker/`](worker) obsahuje malý Cloudflare Worker, který k požadavkům přidává TMDB klíč na serveru.

1. Cloudflare → *Workers & Pages* → **Create → Worker**, do editoru vlož obsah [`worker/tmdb-proxy.js`](worker/tmdb-proxy.js) (alternativně `wrangler`, viz [`worker/wrangler.toml`](worker/wrangler.toml)).
2. *Settings → Variables and Secrets*:
   - secret **`TMDB_API_KEY`** = tvůj TMDB v3 klíč,
   - proměnná **`ALLOWED_ORIGINS`** = `https://mujflix.pages.dev,http://localhost:8080` (tvá doména + dev).
3. Adresu Workeru zapiš do `config.js` jako `TMDB_PROXY_URL`.

Worker povoluje jen `GET`, jen známé TMDB cesty, kontroluje `Origin` a cachuje odpovědi 1 hodinu.

### 3. Propojení zařízení (volitelné, KV)

1. *Storage & Databases → KV → Create namespace* (např. `SYNC`).
2. U Workeru *Settings → Bindings → Add → KV namespace*, **Variable name `SYNC`**.
3. Bez KV se nabídka „Propojit zařízení“ v aplikaci nezobrazí.

Limit zdarma je 1000 zápisů denně, proto appka důležité změny (profily, hodnocení, seznamy) odesílá do ~10 s a drobnosti (postup sledování) až po pár minutách, nejvýš jednou za 10 s. Změny se stahují každých 45 s a při návratu na kartu.

### 4. Proměnné Workeru

| Proměnná | Výchozí | Význam |
|---|---|---|
| `TMDB_API_KEY` (secret) | – | TMDB v3 klíč |
| `ALLOWED_ORIGINS` | – | Povolené původy (čárkou) |
| `SRC_SHARE` | zapnuto | `off` vypne sdílenou paměť zdrojů (`/src/*` vrací 501) |
| `PROBE_HOSTS` | v kódu | Domény, které smí Worker při ověření zdrojů stahovat |

### Endpointy Workeru

| Cesta | Účel |
|---|---|
| `/3/…` | Proxy na TMDB (jen povolené cesty, GET) |
| `/sync/…` | Propojení zařízení (KV) |
| `/src/get`, `/src/report` | Sdílená paměť zdrojů |
| `/src/probe` | Ověření, že zdroj titul opravdu má |

---

## 🗂 Struktura projektu

```text
mujflix/
├── index.html              Jediná stránka aplikace: markup všech oken + pořadí načítání skriptů
├── sw.js                   Service worker (síť první, offline stránka jako záloha)
├── manifest.webmanifest    PWA manifest (název, ikony, barvy)
├── offline.html            „Jsi offline“
├── 404.html                Vlastní „nenalezeno“
├── soukromi.html           Soukromí a podmínky (atribuce TMDB)
├── _headers                Hlavičky Cloudflare Pages (cache, bezpečnost)
├── config.js               Tvoje konfigurace (adresa Workeru)
├── package.json            Skripty (test, lint, bump) a verze – zdroj pravdy pro číslo verze
│
├── css/
│   ├── styles.css          Základ (původní vzhled, proměnné, tlačítka)
│   ├── patches.css         Opravy a doplňky nad základem
│   ├── discover.css        Procházení (banner, řady, filtry)
│   └── netflix.css         Netflix vzhled – načítá se poslední a přepisuje ostatní
│
├── js/
│   ├── app/                Jádro aplikace (sdílí globální proměnné, pořadí viz index.html)
│   ├── pages/              Velké obrazovky: home.js, discover.js, cinema.js
│   ├── shell/              Navigace a „obal“: dock, tlačítko Zpět, šipky, aktualizace
│   ├── core/               Služby: TMDB proxy, věk, žánry, propojení zařízení, QR
│   ├── ai/                 brain.js – doporučovací algoritmus
│   ├── finder/             finder.js – sestavení a ověření URL zdrojů
│   └── profiles/           gate.js (profily, avatary, PIN), prefs.js (zaměření a žánry)
│
├── worker/
│   ├── tmdb-proxy.js       Cloudflare Worker: TMDB proxy + /sync + /src
│   └── wrangler.toml       Konfigurace Workeru
│
├── tests/                  Playwright testy (smoke, flows, discover, worker)
├── scripts/                Pomocné skripty (verze, lint, kontrola CSS proměnných, kontrola zdrojů)
├── docs/                   Dokumentace (MAPA, CHANGELOG, TASKS, …)
├── fonts/                  Netflix Sans (woff2)
├── icons/                  Favicon a PWA ikony
└── .github/                CI (lint + testy) a šablona pull requestu
```

### `js/app/` – jádro

Soubory byly kdysi jeden velký `app.js` rozdělený podle témat. **Načítají se v pořadí z `index.html`** a sdílejí globální funkce a proměnné.

| Soubor | Co dělá |
|---|---|
| `core.js` | Úložiště (localStorage podle profilu), práce s TMDB, postup sledování (`calcProgress`, `findNextEp`), hlášky, výpočty vkusu |
| `profiles-util.js` | Klíče podle profilu, oslovení, barva profilu |
| `sections.js` | Sekce aplikace a adresy (`#serialy`, `#filmy` …), přepínání sekcí |
| `series.js` | **Detail seriálu**: záložky Epizody/Podobné/Popis, sezóny, karty epizod, herec a filmografie, označení zhlédnutého |
| `watchlist.js` | **Oblíbené**: filtry, řazení, postup, hodnocení |
| `notify.js` | Editor žánrů, nové epizody, novinky, oznámení, dlouhé podržení epizody |
| `premiere.js` | Kalendář premiér |
| `collections.js` | Kolekce |
| `customize.js` | Vzhled a vlastní nastavení |
| `streak-mood.js` | Série dní a výběr podle nálady |
| `dock-overlays.js` | Dock, zavírání oken, instalace PWA |
| `interaction.js` | Pozadí, klávesové zkratky, rozkoukané epizody |
| `tmdb-avatar.js` | Hledání avatarů postav v TMDB |
| `cinema-legacy.js` | Starší přehrávač jako záloha za novým |
| `fx.js` | Styly efektů a animací |

### `js/pages/` – obrazovky

| Soubor | Co dělá |
|---|---|
| `home.js` | Úvodní stránka: hero, řady, **Pokračovat ve sledování**, „Protože jsi viděl“, věkový filtr řad, „Zobrazit vše“ |
| `discover.js` | Procházení: banner, řady podle žánrů, filtry, hledání |
| `cinema.js` | Přehrávač (Cinema mód): lišta ovládání, zdroje, epizody, hodnocení |

### `js/shell/`, `js/core/`, ostatní

| Soubor | Co dělá |
|---|---|
| `shell/dock.js` | Navigace (Domů · Seriály · Filmy · Oblíbené · Profil), čisté URL |
| `shell/nav.js` | Tlačítko Zpět zavírá přehrávač, detail, Oblíbené, Procházení |
| `shell/polish.js` | Šipky u řad, chybový stav, offline |
| `shell/update.js` | Hláška „Je dostupná nová verze“ |
| `core/tmdb-proxy-shim.js` | Přesměruje TMDB volání přes Worker a odstraní `api_key` |
| `core/age.js` | `MFAge` – věkové omezení podle certifikace z TMDB |
| `core/genres.js` | Převod ID žánrů mezi filmy a seriály |
| `core/sync.js`, `sync-ui.js` | Propojení zařízení (logika, obrazovka) |
| `core/qr.js` | Generátor QR kódů (knihovna třetí strany, MIT) |
| `core/adblock.js` | Odkaz na blokovač reklam podle prohlížeče |
| `core/version.js` | **Generováno** z `package.json` – needituj ručně |
| `ai/brain.js` | `AIBrain` – lokální doporučovací paměť |
| `finder/finder.js` | Sestavení URL zdrojů, ověření přes Worker, paměť zdrojů |
| `profiles/gate.js` | Výběr/tvorba profilů, avatary, PIN |
| `profiles/prefs.js` | Zaměření (Všechno / Jen anime) a oblíbené žánry |

### `docs/`

| Soubor | Obsah |
|---|---|
| [`MAPA.md`](docs/MAPA.md) | Mapa obrazovek, oken a přechodů + pravidla pro novou obrazovku |
| [`CHANGELOG.md`](docs/CHANGELOG.md) | Historie verzí |
| [`TASKS.md`](docs/TASKS.md) | Úkoly a nápady |
| [`SPOLUPRACE.md`](docs/SPOLUPRACE.md), [`CLAUDE.md`](docs/CLAUDE.md) | Pravidla spolupráce |
| [`css-vars.md`](docs/css-vars.md) | Přehled CSS proměnných |
| [`config.example.js`](docs/config.example.js) | Vzor `config.js` |

---

## 🧩 Jak to funguje

### Načítání

`index.html` načte CSS v pořadí `styles → patches → discover → netflix` (pozdější přepisuje dřívější) a pak klasické `<script defer>` soubory – **žádné moduly, žádný build**. Pořadí skriptů je důležité, protože sdílejí globální proměnné. Parametr `?v=` u souborů obchází cache prohlížeče po změně.

### Úložiště

Vše v `localStorage`, klíče jsou podle aktivního profilu. Například:

| Klíč | Obsah |
|---|---|
| `mf_cont_movies` | Rozkoukané filmy |
| `mf_cont_done` | Tituly označené „Dokoukal jsem“ |
| `mf_onboarded`, `mf_tmdb_key` | Úvodní průvodce, klíč (jen lokální vývoj) |

Profily, hodnocení a seznamy se při propojení zařízení slučují – u každého záznamu vyhrává novější změna.

### Doporučování

`AIBrain` počítá skóre titulů z:

- **žánrových preferencí** (co sleduješ, s časovým rozkladem),
- **momentum** posledních 7 dní,
- **hodnocení** (loved vs. meh) a oblíbených žánrů z onboardingu,
- **popularity** s Bayesovskou korekcí,
- **čerstvosti** a toho, co jsi právě prohlížel.

Úvodní stránka navíc skládá řady **„Protože jsi viděl …“** z posledních zhlédnutých titulů (TMDB *recommendations*). Vše se učí **per profil**, preference postupně vyprchávají. Nic se neodesílá.

### Zdroje

`finder.js` z názvu, roku a epizody složí URL pro každý podporovaný web. Worker na požádání ověří (`/src/probe`), že titul existuje (měkká 404 se rozpozná). Výsledek se cachuje 30 min. U webů s ochranou (403) je výsledek „nevíme“ a nic se nemění.

### Věkové omezení

`MFAge.filter(items, want)` dohledá certifikaci z TMDB (americká škála), výsledky cachuje a titul bez hodnocení skryje. Není to rodičovský zámek; u profilu s PINem jde věk změnit jen s PINem.

### Bezpečnost obsahu

`index.html` obsahuje CSP (`<meta>`). Když přidáš externí zdroj dat nebo vlastní doménu Workeru, doplň ji do `connect-src`, jinak ji prohlížeč zablokuje („Refused to connect“). `frame-ancestors` v meta tagu nejde, proto je `X-Frame-Options: DENY` v `_headers`.

---

## 🛠 Vývoj

```bash
npm install
npm run serve           # lokální server na :8080
npm run lint            # ESLint
npm test                # smoke + flows + discover + worker (Playwright / Chromium)
npm run bump -- minor   # nová verze (patch / minor / major / 3.15.0)
```

| Skript | Co dělá |
|---|---|
| `npm test` | Před během vygeneruje `js/core/version.js`, pak spustí čtyři sady testů |
| `npm run check-sources` | Zkontroluje, že zdroje pořád odpovídají očekávanému tvaru |
| `npm run css-vars` | Najde duplicitní CSS proměnné |

Testy běží **offline** – externí požadavky se blokují a TMDB se podvrhuje. Když Playwright nenajde prohlížeč, nastav `CHROMIUM_PATH` na binárku Chromia.

**CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) spustí lint a testy po každém pushi (s 3min pauzou, aby při nahrávání po jednom souboru doběhla jen poslední verze).

### Zásady pro kód a vzhled

- Kód v angličtině, komentáře a UI česky.
- **Jedna akcentová barva**, bez záře, rozmazání a stínů; zaoblení karet 12 px, vedlejší text `rgba(255,255,255,.6)`.
- Tlačítka obdélníková (MůjFlix styl), min. 44 px na dotyk.
- Žádné vodorovné posuvníky (použij šipky z `shell/polish.js`).
- Nové obrazovky řiď pravidly v [`docs/MAPA.md`](docs/MAPA.md).
- Nové CSS patří na konec `css/netflix.css`; když je potřeba přebít starší pravidla, použij silnější selektor (`html body #id …`).

### Cache

`sw.js` je „nejdřív síť, pak cache“. Po úpravě souboru zvedni jeho `?v=` v `index.html`.

---

## 🛡 Soukromí

- **Žádný vlastní backend ani účty.** Jediný server je tvůj Cloudflare Worker (TMDB proxy + volitelně KV).
- **Data žijí v `localStorage`.** Při propojení zařízení se kopie uloží do tvého KV (ne API klíče, ne aktivní profil, ne stav PIN zámku).
- **TMDB klíč** zůstává na Workeru, v prohlížeči není.
- **PIN** je dětská pojistka, ne zabezpečení.
- **Avatary** se stahují z veřejných služeb; posílá se jen hledaný název postavy.
- Plné znění: [`soukromi.html`](soukromi.html).

---

## ❓ Časté problémy (FAQ)

**Nenačítají se plakáty / řady jsou prázdné.** Zkontroluj `TMDB_PROXY_URL` v `config.js`, `ALLOWED_ORIGINS` na Workeru (musí obsahovat tvou doménu) a konzoli prohlížeče (CSP).

**Po nasazení vidím starou verzi.** Zvedni `?v=` v `index.html`; na telefonu zavři a znovu otevři aplikaci (nebo klepni na hlášku o nové verzi).

**Nezobrazuje se „Propojit zařízení“.** Worker nemá KV s názvem `SYNC`.

**Zdroj se neotevře v přehrávači.** Některé weby odmítají vložení do iframe (Uzi.la) – zobrazí se tlačítko *Otevřít*.

**Lokálně to nejde přes `file://`.** Použij `npm run serve`.

---

## 🤝 Přispívání

1. Forkni repozitář a vytvoř větev (`git checkout -b feature/super-vec`).
2. Před commitem spusť `npm run lint` a `npm test`.
3. Doplň záznam do [`docs/CHANGELOG.md`](docs/CHANGELOG.md).
4. Otevři Pull Request (šablona v `.github/`). Zkontroluj, že appka funguje na mobilu i počítači.

---

## 🙏 Poděkování

- [TMDB](https://www.themoviedb.org/) – metadata filmů a seriálů. *Tento produkt využívá TMDB API, ale není jím schválen ani certifikován.*
- AniList, Wikipedie, TVmaze, Fandom, Wikidata – obrázky postav pro avatary
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT) – QR kódy
- [Cloudflare Pages & Workers](https://pages.cloudflare.com/) – hosting a proxy
- AI agenti – programování

## ⚠️ Disclaimer

MůjFlix je osobní tracker – **neposkytuje ani nehostuje žádný obsah** a nestahuje videa, jen navádí na externí weby. Některé zdroje mohou odkazovat na obsah, který nemusí být v souladu s autorským právem ve tvé jurisdikci. **Za používání odpovídá uživatel.** Pro legální sledování aplikace odkazuje na streamovací služby (přes TMDB Watch Providers).

---

<p align="center">
  <strong>🎬 MůjFlix</strong><br />
  <em>Protože sledovat jen tak bez plánu je barbarství.</em>
</p>
