<div align="center">

# 🎬 MůjFlix

**Osobní filmový a seriálový tracker ve stylu Netflixu.**
Najdi, co sledovat, pamatuj si, kde jsi skončil, a měj profily, hodnocení a seznamy na všech zařízeních.

[![Živá aplikace](https://img.shields.io/badge/živá_aplikace-mujflix.pages.dev-0a84ff?style=for-the-badge)](https://mujflix.pages.dev)

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
7. [Jak to funguje](#-jak-to-funguje) – načítání, adresy, úložiště, doporučování, zdroje, propojení, profily, PWA
8. [Vývoj](#-vývoj) – testy, lint, verze, cache, CSS
9. [Známá omezení a technický dluh](#-známá-omezení-a-technický-dluh)
10. [Soukromí a bezpečnost](#-soukromí)
11. [Časté problémy (FAQ)](#-časté-problémy-faq)
12. [Přispívání](#-přispívání)
13. [Poděkování](#-poděkování)
14. [Disclaimer](#-disclaimer)

---

## 📖 Co je MůjFlix

MůjFlix je **statická PWA** (progresivní webová aplikace) napsaná ve **vanilla JavaScriptu** – bez frameworku, bez bundleru, bez buildu (jediný „build“ je volitelné vygenerování čísla verze). Soubory se nahrají na hosting a běží. Všechna data (profily, oblíbené, postup sledování, hodnocení) zůstávají v **tvém prohlížeči** (`localStorage`); volitelně se zrcadlí do tvého vlastního Cloudflare KV, aby se sdílela mezi zařízeními.

Celé řešení se skládá ze tří částí:

```text
 Prohlížeč (PWA, localStorage)  ──►  Cloudflare Worker  ──►  TMDB API        (metadata, plakáty, žánry, věkové značky)
        │                              │ ├─ KV „SYNC“        (propojení zařízení, sdílená paměť zdrojů)
        │                              │ └─ /src/probe       (ověření, že zdrojový web titul opravdu má)
        └──►  externí weby (iframe / nové okno)             (Bombuj, SvětSeriálů, Uzi.la … – přímo z prohlížeče)
```

Metadata o filmech a seriálech (plakáty, popisy, herci, trailery, hodnocení, kde se dá legálně sledovat) pocházejí z [TMDB](https://www.themoviedb.org/). Aplikace **nehostuje žádná videa** – jen tě navede na streamovací služby nebo externí weby.

**Pro koho je:** pro rodinu a přátele, kteří chtějí jedno místo pro „co jsem rozkoukal“, „co chci vidět“ a „co mi doporučíš“, s oddělenými profily (každý má vlastní vkus, hodnocení a případně PIN).

---

## ✨ Co to umí

### 🏠 Úvodní stránka

- **Hero banner** s doporučeným titulem (s trailerem, který se při odscrollování nebo klepnutí pozastaví); při výměně titulu starý banner zešedne do černa a nový se rozjasní
- **Pokračovat ve sledování** – plakát, lišta postupu, „S1 E4“, štítek *Nová epizoda* a tlačítko *Dokoukal jsem*
  - **klepnutí na kartu seriálu otevře detail s výběrem epizod** (nic se nespustí samo)
  - **▶ na kartě** rovnou pustí další epizodu (nebo rozkoukaný film)
- **Vybráno pro tebe**, **Protože jsi viděl …** (řady odvozené z posledních zhlédnutých), **Top 10 tento týden**, populární, nově přidané, podle žánru
- Řady respektují **věkové omezení** profilu a režim „Jen anime“ (v tom případě je řada *Top 10* jen anime)
- **Zvonek novinek** v horní liště: nové filmy a seriály z posledních ~90 dní podle tvých oblíbených žánrů, bez toho, co už znáš
- **Série dní** (🔥 v hlavičce): kolik dní po sobě sis pustil nebo označil epizodu

### 🔎 Procházení a hledání

- Dock **Seriály / Filmy** otevře Procházení: banner, řady podle žánrů, filtry (žánr, rok), řazení (oblíbenost / hodnocení / nejnovější)
- **Hledání** (lupa, klávesa `/` nebo `.`) podle českého, anglického i původního názvu, s historií hledání
- Procházení se učí z toho, na co klikáš (žánry z otevřených titulů zvyšují preference)

### 📺 Detail seriálu

Okno se třemi záložkami:

| Záložka | Obsah |
|---|---|
| **Epizody** | Řádek tlačítek sezón (nebo výběr, když je jich moc), mřížka epizod s postupem; klepnutí na řádek epizody ji pustí, dlouhé podržení nabídne další akce (označit jako zhlédnuté…) |
| **Podobné** | Podobné seriály podle TMDB, filtrované věkovým omezením |
| **Popis** | Děj, fakty (rok, žánry, počet sezón, hodnocení, stav), **trailer**, **obsazení** – klepnutí na herce ukáže jeho filmografii a z ní se dá otevřít další titul |

### ❤️ Oblíbené

- Filtry **Vše / Filmy / Seriály** s počty a **hledání** v oblíbených
- Rozkoukané tituly najdeš na úvodní stránce v řadě **Pokračovat ve sledování** (samostatná záložka v Oblíbených se skrývá)
- Na kartě seriálu je **lišta postupu** a popisek, např. *„S2 E5 · 43 %“*
- **Řazení:** nejnovější přidané · podle abecedy
- Hodnocení titulu (`loved` / `liked` / `ok` / `meh`, učí doporučování), mazání, přehrání jedním klepnutím
- Prázdné Oblíbené nabídnou tlačítko **Objevovat**

### 🎞 Cinema mód (přehrávač)

- Vestavěný přehrávač s výběrem sezóny a epizody, tlačítkem **Další ›** (na konci seriálu i **další seriál**)
- Jedna kompaktní lišta ovládání (na telefonu i počítači se nezalamuje), pod názvem titulu není nic navíc
- **Zdroj se vybírá sám:** začíná se naposledy použitým zdrojem zvlášť pro filmy a seriály (weby mají vlastní přehrávač, který si pamatuje, kde jsi skončil); zdroj, který titul nemá, se přeskočí. V liště jsou dvě ikony skupin zdrojů (česká vlajka = české weby, přeškrtnutá = zahraniční Movy a Cinejoy, adresa z TMDB ID) a malé tlačítko *Zdroj nejde*, které zkusí další zdroj ve skupině.
- Hodnocení epizody / filmu hvězdičkou, srdce do Oblíbených, ikona „kde to legálně sledovat“
- Zdroje se vkládají do `<iframe>` **bez `sandbox`** (hostingy videa sandbox odmítají), takže vyskakovací reklamy cizích webů neblokuje; proto tip na blokovač reklam podle prohlížeče

### 🔗 Zdroje a legální streamování

- **České a slovenské weby** – URL se sestaví z názvu, roku, sezóny a epizody; u anime se použije romaji z AniList:

  | Zdroj | Filmy | Seriály | Vložení do přehrávače |
  |---|:-:|:-:|---|
  | Bombuj (`bombuj.si`, `serialy.bombuj.si`) | ✓ | ✓ | ano |
  | SvětSeriálů (`svetserialu.to`) | – | ✓ | ano |
  | NajSerialy (`najserialy.io`) | – | ✓ | ano |
  | Prehraj.to (`prehrajto.cz`, hledání) | ✓ | ✓ | ano |
  | Uzi.la (`uzi.la`) | ✓ | ✓ | ne, tlačítko *Otevřít v novém okně* (`noEmbed`) |

- **Legální služby** (Netflix, Disney+, Max, Apple TV+, Prime Video, SkyShowtime, Voyo, Canal+, O2 TV, Crunchyroll …) přes *TMDB Watch Providers* pro ČR/SK
- **Alternativní názvy** – appka z TMDB načte český, slovenský, anglický a původní název a zkouší je postupně (weby pojmenovávají tituly různě, např. *Family Guy* = `griffinovi-1999`)
- **Paměť zdrojů** – appka si pamatuje, který zdroj u titulu fungoval, a zvlášť poslední použitý zdroj pro filmy a seriály (`mf_src_last_movie`, `mf_src_last_tv`)
- **Sdílená paměť zdrojů** (volitelná) – zdroj, který fungoval ostatním, se zkusí první; posílá se jen „titul + název zdroje“
- **Ověření zdrojů** (Worker) – před přehráním se zkontroluje, jestli web titul opravdu má ; zdroj bez titulu se automaticky přeskočí
- **Lupa v přehrávači** – hledání titulu přímo na aktuálním zdroji

### 🧠 Doporučování

Lokální algoritmus `AIBrain` (žádná externí AI, žádný odesílaný profil) – podrobně viz [Doporučování](#doporučování). Starší „Finder“ (`js/finder/finder.js`) umí volitelně použít AI služby s vlastním klíčem, viz [Starší Finder](#starší-finder-a-api-klíče-třetích-stran).

### 👤 Profily a zařízení

- **„Kdo se dívá?“**, avatary (emoji nebo obrázek oblíbené postavy), barva profilu, 4místný PIN (dětská pojistka; po 5 špatných pokusech zámek 30 s, který se stupňuje až na 24 h)
- **Věkové omezení** (Bez omezení / do 7 / 12 / 15) a **zaměření** (Všechno / Jen anime + až 5 oblíbených žánrů, volitelně „Přimíchávat anime do doporučení“)
- **Propojení zařízení** šestimístným kódem nebo QR – bez hesla a e-mailu
- **Záloha** do `.json` a import zpět
- **Nastavení** (vlastní TMDB klíč pro lokální vývoj, volitelné klíče pro starší Finder, přehled spolehlivosti zdrojů, číslo verze)

### 📱 PWA

- Instalace na plochu (Android, iOS, desktop), vlastní ikona, offline stránka *„Jsi offline“*
- Hláška o nové verzi, tlačítko Zpět v prohlížeči zavírá otevřené vrstvy
- Čisté adresy titulů (`/s/…`, `/f/…`, `/c/…`), `/soukromi` a vlastní 404
- Klávesové zkratky: `/` nebo `.` hledání, `Esc` zavře vrstvu, v detailu seriálu šipky a `Enter` (přehrát) / `M` (označit epizodu)

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
3. *Build command:* prázdné (nebo volitelně `node scripts/version.mjs` – přidá do `js/core/version.js` ID commitu a datum sestavení) · *Output directory:* `/`.
4. Soubor `config.js` přidej do repozitáře (jen adresa Workeru, žádné klíče).
5. Hlavičky (cache fontů a ikon, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, …) řeší soubor [`_headers`](_headers).
6. Čisté adresy titulů (`/s/…`, `/f/…`, `/c/…`) přepisuje na `index.html` soubor [`_redirects`](_redirects).

Funguje i GitHub Pages, Netlify nebo jakýkoli statický hosting – `_headers` a `_redirects` jsou specifické pro Cloudflare (Netlify čte `_redirects` taky). Jinde se čisté adresy zachrání přes [`404.html`](404.html), který odkaz pošle do aplikace jako `/?mfp=/c/…`. Aplikace počítá s tím, že běží v **kořeni domény** (`<base href="/">`, service worker se registruje na `/sw.js`).

### 2. TMDB proxy Worker (doporučeno)

Složka [`worker/`](worker) obsahuje malý Cloudflare Worker, který k požadavkům přidává TMDB klíč na serveru.

1. Cloudflare → *Workers & Pages* → **Create → Worker**, do editoru vlož obsah [`worker/tmdb-proxy.js`](worker/tmdb-proxy.js) (alternativně `wrangler`, viz [`worker/wrangler.toml`](worker/wrangler.toml)).
2. *Settings → Variables and Secrets*:
   - secret **`TMDB_API_KEY`** = tvůj TMDB v3 klíč,
   - proměnná **`ALLOWED_ORIGINS`** = `https://mujflix.pages.dev,http://localhost:8080` (tvá doména + dev).
3. Adresu Workeru zapiš do `config.js` jako `TMDB_PROXY_URL`.

Worker povoluje pro TMDB jen `GET`, jen známé cesty (trendy, populární, detail titulu a jeho sezón / videí / překladů / obsazení / podobných / doporučení / watch providers, hledání, `discover`, žánry, osoby), kontroluje `Origin` a cachuje odpovědi 1 hodinu. API klíč se v odpovědích ani v cache klíči nikdy neobjeví. Když TMDB neodpovídá, vrátí čitelnou chybu `502` s CORS hlavičkami.

> Místo `TMDB_API_KEY` jde použít i **`TMDB_READ_TOKEN`** (TMDB v4 „Read Access Token“, posílá se jako `Bearer`).

### 3. Propojení zařízení (volitelné, KV)

1. *Storage & Databases → KV → Create namespace* (např. `SYNC`).
2. U Workeru *Settings → Bindings → Add → KV namespace*, **Variable name `SYNC`**.
3. Bez KV se nabídka „Propojit zařízení“ v aplikaci nezobrazí.

Limit zdarma je 1000 zápisů denně, proto appka důležité změny (profily, hodnocení, seznamy) odesílá do ~6 s a drobnosti (postup sledování, historie hledání, paměť doporučování, série dní) až po 3 minutách, nejvýš jednou za 10 s. Změny se stahují každých 45 s a při návratu na kartu. Podrobnosti viz [Propojení zařízení](#propojení-zařízení).

### 4. Proměnné Workeru

| Proměnná | Výchozí | Význam |
|---|---|---|
| `TMDB_API_KEY` (secret) | – | TMDB v3 klíč |
| `TMDB_READ_TOKEN` (secret) | – | Alternativa: TMDB v4 Read Access Token (má přednost před v3 klíčem) |
| `ALLOWED_ORIGINS` | – | Povolené původy (čárkou). **Když je prázdná, Worker povolí všechny původy (`*`)** – v produkci ji vždy nastav. |
| `SRC_SHARE` | zapnuto | `off` vypne sdílenou paměť zdrojů (`/src/get` a `/src/report` pak vrací 501) |
| KV vazba `SYNC` | – | Nutná pro propojení zařízení a sdílenou paměť zdrojů |

Seznam domén, které smí Worker při ověření zdrojů stahovat (`PROBE_HOSTS`), **není proměnná prostředí**, ale konstanta v [`worker/tmdb-proxy.js`](worker/tmdb-proxy.js). Přidáš-li nový zdrojový web, doplň ho tam, do `scripts/check-sources.mjs` i do `connect-src` v CSP.

### Endpointy Workeru

| Cesta | Metoda | Účel |
|---|---|---|
| `/3/…` | GET | Proxy na TMDB (jen povolené cesty) |
| `/sync/code`, `/sync/join`, `/sync/pull`, `/sync/push` | POST | Propojení zařízení (KV) |
| `/src/get`, `/src/report` | POST | Sdílená paměť zdrojů (KV) |
| `/src/probe` | POST | Ověření, že zdroj titul opravdu má (KV nepotřebuje) |

Ochrany proti zneužití: `/sync/join` povolí 10 neúspěšných pokusů na IP za 10 min; `/src/report` 20 hlášení na IP za 10 min (a nejvýš 12 různých názvů zdrojů u jednoho titulu); `/src/probe` max. 8 adres najednou a 200 adres na IP za 10 min, jen `https` a jen domény ze seznamu, přesměrování se sledují ručně (max. 5 kroků) a po každém kroku se kontroluje, že míří na povolenou doménu. Limity na IP jsou „nejlepší snaha“ v paměti jedné instance Workeru.

---

## 🗂 Struktura projektu

```text
mujflix/
├── index.html              Jediná stránka aplikace: markup všech oken + pořadí načítání skriptů
├── sw.js                   Service worker (síť první, offline stránka jako záloha)
├── manifest.webmanifest    PWA manifest (název, ikony, barvy)
├── offline.html            „Jsi offline“
├── 404.html                Vlastní „nenalezeno“ + záloha pro čisté adresy /s/ /f/ /c/
├── soukromi.html           Soukromí a podmínky (atribuce TMDB)
├── _headers                Hlavičky Cloudflare Pages (cache, bezpečnost)
├── _redirects              Přepis /s/*, /f/*, /c/* na index.html (Cloudflare Pages / Netlify)
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
│   ├── shell/              Navigace a „obal“: dock, tlačítko Zpět, šipky, aktualizace, čisté adresy titulů
│   ├── core/               Služby: TMDB proxy, věk, žánry, propojení zařízení, QR
│   ├── ai/                 brain.js – lokální paměť pro doporučování
│   ├── finder/             finder.js – starší Finder zdrojů (volitelně s AI klíči)
│   └── profiles/           gate.js (profily, avatary, PIN), prefs.js (zaměření a žánry)
│
├── worker/
│   ├── tmdb-proxy.js       Cloudflare Worker: TMDB proxy + /sync + /src
│   └── wrangler.toml       Konfigurace Workeru
│
├── tests/                  Playwright testy (smoke, flows, discover, worker) + helpers.mjs
├── scripts/                Pomocné skripty (verze, lint, kontrola CSS proměnných, kontrola zdrojů)
├── docs/                   Dokumentace (MAPA, CHANGELOG, TASKS, AUDIT, …)
├── fonts/                  Netflix Sans (woff2) + COPYRIGHT.txt
├── icons/                  Favicon a PWA ikony
└── .github/                CI (lint + testy) a šablona pull requestu
```

### `js/app/` – jádro

Soubory byly kdysi jeden velký `app.js` rozdělený podle témat. **Načítají se v pořadí z `index.html`** a sdílejí globální funkce a proměnné.

| Soubor | Co dělá |
|---|---|
| `core.js` | Úložiště (`safeLS`, `safeSetItem`), TMDB klíč (`mfTmdbKey`), výchozí knihovna seriálů (`db`), postup sledování (`calcProgress`, `findNextEp`), časová osa sledování, hlášky |
| `profiles-util.js` | Klíče podle profilu (`uKey`), aktivní profil, oslovení (české 5. pád), barva profilu |
| `sections.js` | Sekce a adresy (`#serialy`, `#filmy` …), **Nastavení** (okno s TMDB klíčem a klíči pro starší Finder), `CinAI` (statistika spolehlivosti zdrojů starého přehrávače), pomocné funkce pro URL zdrojů |
| `series.js` | **Detail seriálu**: záložky Epizody/Podobné/Popis, sezóny, karty epizod, herec a filmografie, označení zhlédnutého |
| `watchlist.js` | **Oblíbené**: filtry, řazení, postup, hodnocení titulu |
| `notify.js` | Editor žánrů, nové epizody, zvonek novinek (`fetchRecommendedNews`), registrace service workeru, systémová oznámení, hodnocení epizod |
| `streak-mood.js` | Série dní (název zbyl z doby, kdy tu byl i výběr podle nálady – ten už neexistuje) |
| `dock-overlays.js` | Dock, zavírání oken, instalace PWA, odznaky v docku |
| `interaction.js` | Vytvoření `aiBrain`, klávesové zkratky, rozkoukané epizody |
| `tmdb-avatar.js` | Hledání avatarů postav v TMDB |
| `cinema-legacy.js` | Starší přehrávač (`CINEMA_SOURCES`, `openMovieInCinema`) – používají ho ještě jiné soubory, viz [technický dluh](#-známá-omezení-a-technický-dluh) |
| `fx.js` | Styly mřížky sezón a efektů |

### `js/pages/` – obrazovky

| Soubor | Co dělá |
|---|---|
| `home.js` | Úvodní stránka: hero, řady, **Pokračovat ve sledování**, „Protože jsi viděl“, věkový filtr řad, „Zobrazit vše“ |
| `discover.js` | Procházení: banner, řady podle žánrů, filtry, řazení, hledání s historií |
| `cinema.js` | Přehrávač (Cinema mód, `MFCinemaPlayer`): sestavení URL zdrojů, paměť zdrojů, ověření přes Worker, epizody, hodnocení, **kde to legálně sledovat** (`MFLegalProviders`) |

### `js/shell/`, `js/core/`, ostatní

| Soubor | Co dělá |
|---|---|
| `shell/dock.js` | Navigace (Domů · Seriály · Filmy · Oblíbené · Profil), čisté URL |
| `shell/nav.js` | Tlačítko Zpět zavírá přehrávač, detail, Oblíbené, Procházení |
| `shell/titleurl.js` | Čisté adresy titulů `/s/`, `/f/`, `/c/` (zápis do adresního řádku i otevření titulu z odkazu) |
| `shell/polish.js` | Šipky u řad, chybový stav, offline, schování filtrů v Procházení |
| `shell/update.js` | Hláška „Je dostupná nová verze“ |
| `core/tmdb-proxy-shim.js` | Přesměruje TMDB volání přes Worker a odstraní `api_key` |
| `core/age.js` | `MFAge` – věkové omezení podle certifikace z TMDB |
| `core/genres.js` | Převod ID žánrů mezi filmy a seriály |
| `core/sync.js`, `sync-ui.js` | Propojení zařízení (logika, obrazovka) |
| `core/qr.js` | Generátor QR kódů (knihovna třetí strany, MIT) |
| `core/adblock.js` | Odkaz na blokovač reklam podle prohlížeče |
| `core/version.js` | **Generováno** z `package.json` – needituj ručně |
| `ai/brain.js` | `AIBrain` – lokální doporučovací paměť (žánrové preference, rozklad v čase) |
| `finder/finder.js` | Starší Finder: okno „Hledám zdroj…“, kandidátní URL, volitelné AI služby s vlastním klíčem, cache výsledků |
| `profiles/gate.js` | Výběr/tvorba profilů, avatary, PIN |
| `profiles/prefs.js` | Zaměření (Všechno / Jen anime) a oblíbené žánry |

### `docs/`

| Soubor | Obsah |
|---|---|
| [`MAPA.md`](docs/MAPA.md) | Mapa obrazovek, oken a přechodů + pravidla pro novou obrazovku |
| [`CHANGELOG.md`](docs/CHANGELOG.md) | Historie verzí |
| [`TASKS.md`](docs/TASKS.md) | Úkoly a nápady |
| [`AUDIT.md`](docs/AUDIT.md) | Audit 3.15.0 z pohledu nového uživatele (část návrhů je už hotová) |
| [`SPOLUPRACE.md`](docs/SPOLUPRACE.md), [`CLAUDE.md`](docs/CLAUDE.md) | Pravidla spolupráce (pro lidi a pro AI agenty) |
| [`css-vars.md`](docs/css-vars.md) | Přehled CSS proměnných |
| [`config.example.js`](docs/config.example.js) | Vzor `config.js` |

---

## 🧩 Jak to funguje

### Načítání

`index.html` je jediná stránka (markup všech oken). Načte CSS v pořadí `styles → patches → discover → netflix` (pozdější přepisuje dřívější) a pak klasické `<script defer>` soubory – **žádné moduly, žádný build**. Pořadí skriptů je důležité, protože sdílejí globální proměnné:

```text
config.js → core/* (TMDB shim, verze, adblock, žánry, věk, sync) → ai/brain → profiles/* → finder
          → app/* (core, series, watchlist, …) → pages/discover → pages/cinema, pages/home → shell/*
```

Parametr `?v=` u souborů obchází cache prohlížeče po změně. Během načítání zakrývá stránku splash `#mfSplash`; výběr profilu se bez probliknutí skryje, když ho `gate.js` stejně přeskočí (po obnovení stránky nebo z odkazu na titul). Menší části kódu jsou přímo v `index.html` jako inline `<script>` (např. oprava obrázků), a proto CSP povoluje `'unsafe-inline'`.

TMDB požadavky se v kódu píšou na `https://api.themoviedb.org/3/…`; `core/tmdb-proxy-shim.js` je přepíše na adresu Workeru a odstraní `api_key`. Bez `TMDB_PROXY_URL` se volá TMDB napřímo s klíčem z `config.js` nebo z Nastavení (jen vývoj).

### Adresy a tlačítko Zpět

| Adresa | Co otevře |
|---|---|
| `/s/<nazev>` | detail seriálu |
| `/f/<nazev>` | film v přehrávači |
| `/c/<nazev>[-s01e02]` | přehrávač (seriál od dané epizody, jinak od 1. dílu) |
| `#serialy`, `#filmy` … | interní přepínání sekcí (z adresy se hned odstraní) |

`shell/titleurl.js` adresu odvozuje ze stavu aplikace (co je právě otevřené) a zapisuje ji přes `history.replaceState`, takže nevznikají zbytečné položky historie. Při otevření odkazu titul dohledá přes TMDB hledání (vyhraje shodný „slug“ názvu, jinak první výsledek). Hosting přepisuje tyto cesty na `index.html` (`_redirects`), případně je zachytí `404.html`. `shell/nav.js` hlídá otevřené vrstvy (Procházení, Oblíbené, detail, „Zobrazit vše“, přehrávač) a tlačítko Zpět je zavírá postupně místo opuštění aplikace.

### Úložiště

Vše v `localStorage`. Většina klíčů má příponu s ID profilu (`uKey("mf_ratings")` → `mf_ratings_<id profilu>`), takže každý profil má vlastní data.

| Klíč | Obsah |
|---|---|
| `mf_profiles_v2` | Profily (jméno, avatar, barva, PIN, zaměření, oblíbené žánry) |
| `mf_active_pid`, `mf_pin_lock` | Aktivní profil, stav PIN zámku (nesynchronizují se) |
| `mf_watched`, `mf_partial_watched` | Zhlédnuté epizody, rozkoukaný postup |
| `mf_watchlist` | Oblíbené (filmy i seriály) |
| `mf_db_custom` | Seriály přidané do knihovny |
| `mf_ratings`, `mf_ep_ratings` | Hodnocení titulů (`loved` / `liked` / `ok` / `meh`, s žánry) a epizod (1–5 ⭐) |
| `mf_cont_movies`, `mf_cont_done` | Rozkoukané filmy, tituly označené „Dokoukal jsem“ |
| `mf_watch_timeline` | Posledních 500 zhlédnutí (název, žánry, TMDB ID) |
| `mf_ai_brain_<id>` | Paměť doporučování (`AIBrain`) |
| `mf_streak_v1`, `mf_streak_today_v1` | Série dní |
| `mf_search_history_v2`, `mf_pt_chips` | Historie hledání, poslední hledané názvy ve Finderu |
| `mf_src_pref` | Paměť zdrojů: který zdroj u titulu fungoval / nefungoval (max. 300 titulů) |
| `mf_newep_<id>` | Cache „Nová epizoda“ (12 h) |
| `mfx_age_cache`, `mfx_src_*`, `mf_jw_*` | Cache: věkové značky (60 dní), sdílená paměť zdrojů, watch providers – jen na tomto zařízení |
| `mf_sync_*` | Stav propojení zařízení |
| `mf_tmdb_key`, `mf_tmdb_key_<id>`, `mf_*_key` | Vlastní API klíče (jen lokální vývoj a starší Finder) – **nikdy se nesynchronizují** |

Obsah klíčů se při čtení kontroluje (`safeLS`): poškozená nebo stará data špatného typu se nahradí výchozí hodnotou, aby nespadla aplikace. Při zaplnění úložiště se zobrazí upozornění.

### Doporučování

`AIBrain` (`js/ai/brain.js`) je **lokální paměť preferencí na profil**; nic se nikam neodesílá a žádná externí AI se nepoužívá. Uchovává dvě mapy `žánr → váha 0–1` (podle názvu a podle TMDB ID) a seznam zhlédnutých titulů. Váhy rostou při akcích:

| Akce | Posun váhy žánrů titulu |
|---|---|
| oblíbený žánr z úvodního průvodce / z nastavení | +0,12 |
| přidání do Oblíbených (i z Procházení) | +0,12 |
| hodnocení titulu | `loved` +0,25 · `liked` +0,15 · `ok` +0,05 · `meh` −0,10 |
| označení / puštění epizody | +0,06 až +0,07 |
| otevření titulu v Procházení | +0,05 |

Váhy se postupně **zapomínají**: při aktivaci profilu se (nejvýš jednou za půl dne) vynásobí faktorem `max(0,92; 1 − 0,01 × dny)` a hodnoty pod 0,01 se mažou.

Co se z toho skládá:

- **Vybráno pro tebe** (úvodní stránka) – tři nejsilnější žánry (váha > 0,05, jinak žánry z profilu) → TMDB `discover` seřazený podle popularity (min. 100 hlasů), filmy a seriály se střídají. Bez preferencí se místo toho zobrazí **Populární právě teď**. Anime se (podle nastavení profilu) přimíchává, nebo je jediným obsahem („Jen anime“).
- **Protože jsi viděl …** – semínka jsou nejvýš dva tituly; skóre = váha hodnocení (`loved` 4, `liked` 3, `ok` 1) + 1 za sledování + 1, pokud je to novější než 30 dní. Pro semínko se vezme TMDB `recommendations`, bez toho, co už znáš a bez titulů z předchozí řady.
- **Procházení, Top 10, novinky ve zvonku** – řady a doporučení se řídí stejnými žánrovými váhami; viděné a uložené tituly se vynechávají.
- Vše podléhá **věkovému omezení** a režimu „Jen anime“ profilu.

> Funkce `getMomentumCached()` a `getRatingSignalCached()` v `core.js` počítají „momentum“ posledních dní a normalizovaný signál z hodnocení, ale zatím je nic nevolá – viz [technický dluh](#-známá-omezení-a-technický-dluh).

### Zdroje

Přehrávač (`js/pages/cinema.js`) z názvu, roku, sezóny a epizody složí URL pro každý podporovaný web (tvary adres jsou na jednom místě v kódu, např. Uzi.la `/tv/<slug>/S04E08`). Postup:

1. Z TMDB se načtou alternativní názvy (český, slovenský, anglický, původní). U anime se doplní romaji z AniList; titul bez latinky (např. japonský) se v URL nahradí prvním latinským názvem. Zdroje jdou popořadě s hlavním názvem a další názvy se nabídnou až za nimi.
2. Worker (`/src/probe`) dá osm adres najednou ověřit: stáhne stránku a vyhodnotí `true` (titul tam je), `false` (404, „nenalezeno“, přesměrování na úvod, nebo **měkká 404** – 200 a obecná stránka, kde není nic z názvu titulu) nebo `null` (nevíme – např. web za ochranou, 403). Výsledek se cachuje 30 min.
3. Zdroj označený `false` přehrávač krátce po otevření přeskočí a přepne na první, který titul má.
4. Úvodní zdroj se vybírá takto: zdroj, který u titulu fungoval (vlastní zkušenost – zůstal jsi na něm aspoň minutu – má přednost před sdílenou pamětí z Workeru), pokud není označený jako špatný a ověření ho nezamítlo → poslední použitý zdroj pro film / seriál → první zdroj, který ověření potvrdilo → první neoznačený → výchozí pořadí.
5. Weby, které vložení do iframe zakazují, mají příznak `noEmbed` – místo přehrávání v okně se zobrazí tlačítko *Otevřít v novém okně*.

Přehrávač vkládá zdroje do `<iframe>` **bez atributu `sandbox`** (hostingy videa jako Filemoon uvnitř SvětSeriálů sandbox detekují a odmítnou přehrávat), takže vyskakovací okna a reklamy cizích webů se tím nezablokují – proto aplikace v úvodním průvodci doporučuje blokátor reklam podle prohlížeče (`core/adblock.js`). Skript `npm run check-sources` zkontroluje, že tvary adres a ověření pořád odpovídají skutečným webům (testovací dotazy mají vyjít `true`, vymyšlené `false`).

### Starší Finder a API klíče třetích stran

Z doby před novým přehrávačem zůstal `js/finder/finder.js` – okno „Hledám zdroj…“ s tlačítky *Otevřít* a *Další zdroje*. Spouští se z některých míst (např. když se z Oblíbených otevře položka, kterou nejde otevřít jinak) a:

- bez klíčů jen sestaví odkaz na hledání na Bombuj / SvětSeriálů / Prehraj.to,
- s vlastními klíči v Nastavení (`mf_gemini_key`, `mf_groq_key`, `mf_anthropic_key`, `mf_tavily_key`, `mf_jina_key`) zkusí najít přímý odkaz pomocí AI služby; výsledek cachuje.

Klíče si uživatel zadává sám, ukládají se jen do jeho prohlížeče a **nikdy se nesynchronizují**. Pro tyto služby (Anthropic, Groq, Gemini, Tavily, Jina) proto obsahuje CSP v `connect-src` výjimky. Doporučování ani běžné přehrávání na nich nezávisí.

### Propojení zařízení

`core/sync.js` (logika) a `core/sync-ui.js` (obrazovka, QR, záloha do souboru):

- Zařízení A vytvoří náhodné ID sady dat a nahraje ji do KV (`/sync/push`). Pro druhé zařízení si vyžádá **šestimístný kód** (`/sync/code`, platí 10 min, abeceda bez `0/O/1/I`) nebo QR s odkazem `?link=KÓD`. Zařízení B kód vymění za ID (`/sync/join`, kód se hned smaže) a stáhne data (`/sync/pull`).
- Synchronizuje se vše s předponou `mf_` kromě: aktivního profilu, stavu PIN zámku, `mf_sync_*`, cache `mf_jw_*` a všeho, co v názvu obsahuje `key` nebo `token` (API klíče). Jednotlivý klíč nad 1 MB se přeskočí, celá sada má limit 4 MB, v KV se drží 365 dní od poslední změny.
- **Sloučení:** u každého klíče vyhrává novější změna. Klíče, které jsou „mapa“ nebo „seznam podle slug“ (`mf_watched`, `mf_ratings`, `mf_watchlist`, `mf_db_custom`), se slučují **po položkách třícestně** podle poslední společné verze (`mf_sync_base`), takže souběžné změny na dvou zařízeních se neztratí. Profily se spojují podle ID a smazané profily se uchovávají jako „náhrobky“.
- **Frekvence** (kvůli limitu 1000 zápisů denně): důležité klíče se odešlou do ~6 s, „hlučné“ (`mf_watch_timeline`, `mf_partial_watched`, `mf_streak`, `mf_ai_brain`, `mf_cont_`, historie hledání …) až po 3 minutách, nikdy častěji než jednou za 10 s. Stahuje se každých 45 s a při návratu na kartu.

### Profily, PIN a věkové omezení

- **PIN** je čtyřmístný. Po 5 špatných pokusech se profil zamkne na 30 s a zámek se stupňuje (2 min → 10 min → 30 min → 1 h → 4 h → 24 h). Stav je v `localStorage` po profilech, takže ho nejde obejít obnovením stránky. Je to pojistka pro domácí použití, ne zabezpečení.
- **Věkové omezení** (`core/age.js`, `MFAge`): profil má `prefs.maxAge` = 0 / 7 / 12 / 15. Certifikace se dohledá z TMDB (americká škála – filmy G / PG / PG-13, seriály TV-Y / TV-G / TV-Y7 / TV-PG / TV-14), protože české hodnocení TMDB skoro nemá. Výsledky se 60 dní cachují (max. 2 000 záznamů). Filtruje doporučení, Procházení, hledání i novinky; **titul bez nalezeného hodnocení se u omezeného profilu skryje**. Věk jde změnit v Nastavení (u profilu s PINem jen s PINem). Není to rodičovský zámek.
- **Zaměření** (`profiles/prefs.js`): Všechno / Jen anime (animace japonského původu) + až 5 oblíbených žánrů.

### PWA, service worker a aktualizace

- `sw.js` (cache `mujflix-shell-v1`) je **„nejdřív síť, pak cache“**: soubory se vždy revalidují (`cache: "no-cache"`), takže po nasazení nehrozí starý kód. Výjimky: písma `/fonts/*.woff2` jdou nejdřív z cache a `config.js` se nikdy necachuje. Cizí domény (TMDB, CDN) se nezasahují. Bez sítě se místo aplikace zobrazí `offline.html`. Service worker registruje `js/app/notify.js` (jen na `https` nebo `localhost`) a zpracovává klepnutí na systémová oznámení.
- `shell/update.js` 8 s po startu, při návratu do aplikace a jednou za 30 min stáhne `js/core/version.js` a porovná ho s běžící verzí; při rozdílu zobrazí lištu „Je dostupná nová verze“ s tlačítkem *Obnovit*.
- Instalace na plochu: `manifest.webmanifest` + tlačítko v appce (událost `beforeinstallprompt`).

### Bezpečnost obsahu

`index.html` obsahuje CSP (`<meta>`). Když přidáš externí zdroj dat nebo vlastní doménu Workeru, doplň ji do `connect-src`, jinak ji prohlížeč zablokuje („Refused to connect“). Vlastní Worker na `*.workers.dev` a Pages na `*.pages.dev` už povolené jsou. `frame-ancestors` v meta tagu nejde, proto je `X-Frame-Options: DENY` v `_headers`. Texty z TMDB i jména profilů se před vložením do HTML escapují (`escapeHTML`); testy to ověřují (HTML v názvu se nesmí vykonat).

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
| `npm run bump -- <typ>` | Zvedne verzi v `package.json`, přegeneruje `js/core/version.js` a přidá nadpis do `docs/CHANGELOG.md` |
| `npm run check-sources` | Spustí kód ověření zdrojů z Workeru proti skutečným webům (potřebuje internet) |
| `npm run css-vars` | Najde duplicitní CSS proměnné (přehled v `docs/css-vars.md`) |

**Testy** (`tests/`, Playwright + Chromium):

| Sada | Co ověřuje |
|---|---|
| `smoke.mjs` | Aplikace se načte bez JS chyby a existují základní globální objekty |
| `flows.mjs` | Největší sada (stovky kontrol): navigace mezi záložkami, validace URL zdrojů, escapování, hodnocení a učení doporučování, onboarding, detail seriálu, přehrávač, ověření zdrojů, „Pokračovat ve sledování“, trailer v banneru … |
| `discover.mjs` | Procházení: vadné položky v odpovědi TMDB, XSS v názvech, režim „Jen anime“ |
| `worker.mjs` | Worker: propojení zařízení, kódy, limity, sdílená paměť zdrojů |

Testy běží **offline** – každý požadavek mimo `localhost` se zablokuje (externí `.js` se nahradí prázdným stubem) a TMDB se podvrhuje. Když Playwright nenajde prohlížeč, nastav `CHROMIUM_PATH` na binárku Chromia. Jako chyba se počítá i porušení CSP v konzoli.

**CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) spustí `npm run lint` a `npm test` při pull requestu a při pushi do `main` (jde spustit i ručně). Nový commit ve stejné větvi rozběhnutou kontrolu zruší, takže doběhne jen poslední. Prohlížeč Playwrightu se cachuje podle verze.

### Verze

Zdrojem pravdy je `version` v `package.json`; `scripts/version.mjs` z něj generuje `js/core/version.js` (`window.MF_VERSION`, na Cloudflare Pages při buildu i `MF_BUILD` a datum). Číslo se zobrazuje v Nastavení a podle něj `shell/update.js` pozná novou verzi. Po každé změně zapiš odrážku do `docs/CHANGELOG.md`.

### Zásady pro kód a vzhled

- Kód v angličtině, komentáře a UI česky.
- **Jedna akcentová barva** (modrá `#0a84ff`, `--nf-accent`; profil si může nastavit vlastní), bez záře, rozmazání a stínů; zaoblení karet 6–12 px, vedlejší text `rgba(255,255,255,.6)`.
- Tlačítka obdélníková (MůjFlix styl), min. 44 px na dotyk.
- Žádné vodorovné posuvníky (použij šipky z `shell/polish.js`).
- Nové obrazovky řiď pravidly v [`docs/MAPA.md`](docs/MAPA.md).
- Nové CSS patří na konec `css/netflix.css`; když je potřeba přebít starší pravidla, použij silnější selektor (`html body #id …`).
- Do repozitáře **nikdy** nepatří API klíč; `config.js` smí obsahovat jen `TMDB_PROXY_URL`.
- Pravidla pro spolupráci (větve `Jablkooo` / `Jirulaso`, zápis do `docs/TASKS.md`) jsou v [`docs/CLAUDE.md`](docs/CLAUDE.md) a [`docs/SPOLUPRACE.md`](docs/SPOLUPRACE.md).

### Cache

`sw.js` je „nejdřív síť, pak cache“. Po úpravě souboru zvedni jeho `?v=` v `index.html`.

---

## 🧱 Známá omezení a technický dluh

Co se při studiu kódu ukázalo; část je i v [`docs/TASKS.md`](docs/TASKS.md).

- **Starý přehrávač a Finder.** `js/app/cinema-legacy.js` (`CINEMA_SOURCES`, `openMovieInCinema`), `CinAI` v `sections.js` a `js/finder/finder.js` jsou zbytky staršího řešení. Nejde je prostě smazat – používají je `sections.js`, `watchlist.js`, `home.js` i testy; nejdřív je třeba funkce přesunout do nového přehrávače.
- **Nepoužitý kód v doporučování.** `getMomentumCached()` a `getRatingSignalCached()` v `core.js` se nikde nevolají. Doporučování reálně stojí na žánrových vahách `AIBrain`, hodnocení titulů a semínkách „Protože jsi viděl“.
- **Úsporný režim se nikde neprojeví.** `index.html` přidá `html.mf-low-power` na zařízeních s ≤ 4 jádry nebo s „šetřením dat“, ale žádné CSS tuto třídu nepoužívá.
- **Bezpečnost API klíčů.** Podle `TASKS.md` byl starý TMDB klíč v historii GitHubu – je třeba ho vyměnit a nový dát jen do secretu Workeru. `ALLOWED_ORIGINS` nechaná prázdná povolí Worker komukoli.
- **CSS.** `css/styles.css` má ~5 500 řádků a hodně pravidel je přepsaných v `netflix.css`; po změření (Lighthouse) by se mrtvá pravidla měla odstranit. `docs/css-vars.md` ukazuje duplicitní proměnné.
- **Zdroje se mění.** Zdrojové weby mění tvar adres a ochranu bez varování; proto existují `npm run check-sources` a ověřování přes Worker. Uzi.la vložení do iframe zakazuje.
- **Neověřeno.** Plynulost na Firefoxu a skutečných slabých zařízeních (výkon se měřil jen v Chromiu se zpomaleným CPU).

---

---

## 🛡 Soukromí

- **Žádný vlastní backend ani účty.** Jediný server je tvůj Cloudflare Worker (TMDB proxy + volitelně KV). Aplikace nepoužívá cookies, reklamu ani analytiku.
- **Data žijí v `localStorage`.** Při propojení zařízení se kopie uloží do tvého KV pod náhodným ID (ne API klíče, ne aktivní profil, ne stav PIN zámku); zmizí nejpozději 365 dní po poslední synchronizaci.
- **TMDB klíč** zůstává na Workeru, v prohlížeči není (kromě lokálního vývoje).
- **Sdílená paměť zdrojů** (volitelná) ukládá do KV jen počty „titul + název zdroje“ na 90 dní, nic o uživateli. Vypíná se proměnnou `SRC_SHARE=off`.
- **Ověření zdrojů:** Worker stahuje stránky zdrojových webů a posílá jim jen název titulu v adrese; z IP adresy uživatele se nic dál nepředává.
- **Vlastní klíče AI služeb** (starší Finder) jsou jen v tvém prohlížeči a nesynchronizují se; požadavky s nimi jdou přímo z prohlížeče dané službě.
- **PIN** a věkové omezení jsou dětská pojistka, ne zabezpečení.
- **Avatary** se stahují z veřejných služeb (Wikipedie, AniList, TVmaze, Fandom, Wikidata …); posílá se jen hledaný název postavy.
- **Přehrávání** probíhá na cizích webech přímo z prohlížeče; platí jejich podmínky a jejich reklamy.
- Plné znění: [`soukromi.html`](soukromi.html).

---

## ❓ Časté problémy (FAQ)

**Nenačítají se plakáty / řady jsou prázdné.** Zkontroluj `TMDB_PROXY_URL` v `config.js`, `ALLOWED_ORIGINS` na Workeru (musí obsahovat tvou doménu) a konzoli prohlížeče (CSP).

**Po nasazení vidím starou verzi.** Zvedni `?v=` v `index.html`; na telefonu zavři a znovu otevři aplikaci (nebo klepni na hlášku o nové verzi).

**Nezobrazuje se „Propojit zařízení“.** Worker nemá KV s názvem `SYNC`.

**Kód pro propojení nefunguje.** Platí jen 10 minut a jde použít jednou. Po 10 neúspěšných pokusech z jedné IP se zadávání na 10 minut zablokuje.

**Zdroj se neotevře v přehrávači.** Některé weby odmítají vložení do iframe (Uzi.la) – zobrazí se tlačítko *Otevřít v novém okně*. Když zdroj titul nemá nebo nefunguje, zkus lupu (hledání titulu na aktuálním webu). Značka ✗ v liště zdrojů znamená, že ověření (Worker) titul na webu nenašlo.

**V přehrávači vyskakují reklamy.** Iframe nemá `sandbox` (jinak by hostingy videa odmítly přehrávat). Nainstaluj blokátor reklam – appka v průvodci nabídne správný pro tvůj prohlížeč.

**Ověření zdrojů nic neukazuje.** Worker nemá povolený tvůj `Origin` (`ALLOWED_ORIGINS`) nebo je překročený limit 200 kontrol na IP za 10 min. Ověření je jen nápověda, přehrávání funguje i bez něj.

**Čisté adresy `/s/…`, `/f/…`, `/c/…` vrací 404.** Hosting musí přepisovat tyto cesty na `index.html` (`_redirects`), a aplikace musí běžet v kořeni domény. Záložní řešení je `404.html`.

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
