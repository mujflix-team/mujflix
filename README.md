[README.md](https://github.com/user-attachments/files/33405612/README.md)
# 🎬 MůjFlix

**MůjFlix je osobní filmový a seriálový tracker, který ti pomůže najít, kde sledovat filmy a seriály z různých zdrojů** — ať už jde o legální streamingové služby (Netflix, Disney+, Max, Apple TV+…) nebo o české a slovenské weby s online filmy (Bombuj, SvetSerialu, Prehrajto). Sleduj, co jsi viděl, dostávej chytrá doporučení a měj vše na jednom místě.

Aplikace je postavená jako **statická PWA** — vše běží v tvém prohlížeči, žádný backend, žádné účty, žádné odesílání dat na cizí servery. Data zůstávají u tebe.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Language](https://img.shields.io/badge/lang-česky-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8)

---

## ✨ Co to umí

### 🎯 Najde ti, kde filmy a seriály sledovat

Hlavní funkce MůjFlixu — **propojení s více zdroji** a jejich chytré vyhledávání:

- **České a slovenské weby s online filmy a seriály** — automaticky sestaví správnou URL na základě názvu, roku a epizody:
  - **Bombuj.si** — filmy i seriály (český dabing / titulky)
  - **SvetSerialu.to** — seriály s českými titulky
  - **Prehrajto.cz** — filmy i seriály (sdílený obsah)
  - **NajSerialy.io** — seriály (URL se skládá z anglického názvu, roku a epizody; u japonských titulů se použije romaji z AniList)
  - **Uzi.la** — alternativa; web odmítá vložení do iframe, proto se v Cinema módu zobrazí tlačítko „Otevřít“ místo přehrávače
- **Legální streamingové služby** — přes TMDB Watch Providers aplikace zobrazí, kde je film/seriál legálně dostupný v ČR/SK:
  - Netflix, Disney+, Max (HBO), Apple TV+, Prime Video, SkyShowtime, Voyo, Canal+, O2 TV, Mall.TV, Crunchyroll a další
- **Více zdrojů na jedno kliknutí** — pokud jeden zdroj nefunguje, aplikace ti nabídne další
- **Cinema mód** — vestavěný přehrávač s výběrem sezóny a epizody, auto-next na další epizodu, přepínání zdrojů během přehrávání
- **Sandbox iframe** — blokuje popup reklamy ze zdrojů, tip na uBlock Origin
- **Zaměření a žánry** — v menu profilu (avatar vpravo nahoře) přepneš profil na „Jen anime“ (doporučení, Objevovat i hledání ukážou jen anime) nebo zpět na „Všechno“ a nastavíš si až 5 oblíbených žánrů
- **Paměť zdrojů** — appka si pamatuje, který zdroj pro titul fungoval, a tlačítko „Nefunguje to“ zdroj označí a zkusí další
  - **Sdílená paměť zdrojů** (volitelná, potřebuje KV z propojení zařízení): zdroj, který fungoval ostatním, se zkusí jako první. Posílá se jen „titul + název zdroje“, nic o uživateli. Jde vypnout ve Workeru (`SRC_SHARE=off`) nebo na zařízení (`localStorage.mfx_src_share_off = "1"`).
- **Alternativní názvy** — při hledání se zkouší anglický, původní i český/slovenský název (z TMDB)

### 🎨 Vzhled a ovládání

- **Netflix styl** — hero banner, řádky „Pokračovat ve sledování“ (s textem „zbývá N epizod“), Pro tebe, Top 10 a další
- **Hodnocení epizod / filmů** — nenápadná hvězdička v Cinema módu (hned vedle srdce), hodnocení se ukládá do doporučení
- **Žánr anime** — pokud máš vybrané jen anime, doporučení i oznámení o novinkách jsou jen anime
- **Legální služby** — ikona TV v Cinema módu ukáže, kde je titul legálně dostupný

### 👤 Profily

- **Výběr profilu „Kdo se dívá?“**, přepínání profilů z menu v pravém horním rohu (avatar → Přepnout / Upravit profil / Spravovat profily)
- **Úprava a mazání profilu** na jedné obrazovce „Uprav si svůj profil“
- **Avatary — oblíbená postava ze seriálu či filmu**: nabídka je předvyplněná (Breaking Bad, Game of Thrones, Marvel, DC, Star Wars, anime…) a ve vyhledávání najdeš další postavy. Zdroje obrázků: Wikipedie, AniList, TVmaze, Fandom, Wikidata, superhero-api, Disney API
- **Propojení zařízení** — stejné profily, seznamy a hodnocení na telefonu, tabletu i počítači. Bez hesla a e-mailu: na prvním zařízení zvolíš *Propojit zařízení → Zobrazit kód*, na druhém *Mám kód* a opíšeš 6 znaků (nebo naskenuješ QR). Najdeš to v menu profilu vpravo nahoře a na obrazovce „Kdo se dívá?“; při vytváření nového profilu na to průvodce upozorní třetím krokem. Vyžaduje nastavený Worker s úložištěm KV (viz níže)
- **Záloha dat** — export a import do souboru .json (menu profilu → Záloha dat), bez API klíčů
- **PIN zámek** — 5 pokusů, po špatném zadání se ukáže počet zbývajících pokusů, pak následuje zablokování (30 s → 2 min → 10 min → 30 min → 1 h → 4 h → 24 h), které se stupňuje. Jde o dětskou pojistku, ne o skutečné zabezpečení
  
---

## 🚀 Instalace

### Rychlý start (bez buildu)

**1. Klonuj repozitář**

```bash
git clone https://github.com/tvuj-username/mujflix.git
cd mujflix
```

**2. Nastav TMDB API klíč**

Vytvoř `config.js` podle vzoru `config.example.js`:

```javascript
window.TMDB_KEY_DEFAULT = "tvuj_tmdb_api_klic";
```

Klíč zdarma získáš na [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

**3. Otevři v prohlížeči**

⚠️ **Nesmíš otevírat přes `file://`** — Chrome blokuje iframy. Použij lokální server:

```bash
# Python
python -m http.server 8080

# Nebo Node
npx serve .
```

Pak otevři `http://localhost:8080`.

### 🔐 TMDB klíč přes Cloudflare Worker (doporučeno pro veřejný provoz)

Klíč nesmí být v prohlížeči. Složka `worker/` obsahuje malý proxy Worker, který klíč přidává na serveru:

```bash
cd worker
npx wrangler secret put TMDB_API_KEY      # vlož svůj TMDB v3 klíč
# uprav ALLOWED_ORIGINS ve wrangler.toml na svou doménu
npx wrangler deploy
```

Pak v `config.js` (vzor `config.example.js`) nastav:

```javascript
window.TMDB_PROXY_URL = "https://mujflix-tmdb-proxy.<ucet>.workers.dev";
```

`js/core/tmdb-proxy-shim.js` (prohlížečová část; Worker je v `worker/tmdb-proxy.js`) pak automaticky přesměruje všechna volání TMDB přes Worker a odstraní `api_key`. Worker povoluje jen GET, jen známé TMDB cesty, kontroluje Origin a cachuje odpovědi 1 hodinu.

### 🔗 Propojení zařízení (volitelné)

Využívá stejný Worker jako TMDB proxy, jen přidá úložiště KV (zdarma, limit 1000 zápisů denně – appka proto odesílá důležité změny (profily, hodnocení, seznamy) do ~10 s, drobnosti jako průběh sledování až po pár minutách a vždy nejvýš jednou za 10 s; stahuje změny každých 45 s a při návratu na kartu):

```bash
cd worker
npx wrangler kv namespace create SYNC     # vypíše id úložiště
```

V `worker/wrangler.toml` odkomentuj blok `[[kv_namespaces]]`, vlož `id` a znovu nasaď (`npx wrangler deploy`). Adresa Workeru musí být v `config.js` jako `TMDB_PROXY_URL` (stejná jako pro TMDB). Bez toho se nabídka propojení v appce nezobrazí.

Počet propojených zařízení není omezený (notebook, PC, telefon, tablet… všechna sdílejí stejné ID). Nový profil z jiného zařízení se objeví sám; ostatní změny nabídnou tlačítko „Načíst změny“.

Jak to funguje: první zařízení si vytvoří náhodné dlouhé ID a nahraje data (profily a osobní údaje z localStorage; **ne** API klíče, aktivní profil ani stav PIN zámku). Jednorázový kód (platí 10 minut) slouží jen k výměně za toto ID. Při sloučení vyhrává u každého záznamu novější změna a profily se spojují podle ID, takže se nic nepřepisuje celé. PIN profilu se přenáší spolu s profilem – je to jen dětská pojistka.

### Nasazení na Cloudflare Pages (doporučeno)

1. Push na GitHub
2. Cloudflare Pages → **Create project** → propoj s repozitářem
3. Build command: *(nech prázdné)*
4. Output directory: `/`
5. **Environment variables** → přidej `TMDB_API_KEY` (volitelně, pokud používáš proxy)
6. Pro proxy přidej Cloudflare Function do `functions/api/tmdb/[[catchall]].js`:

```javascript
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) return new Response("Missing path", { status: 400 });

  const apiUrl = `https://api.themoviedb.org/3/${path}${
    path.includes("?") ? "&" : "?"
  }api_key=${env.TMDB_API_KEY}`;

  const resp = await fetch(apiUrl);
  return new Response(resp.body, {
    headers: { "content-type": "application/json" },
  });
}
```

7. V `js/app.js` zapni proxy:

```javascript
window.MF_PROXY = { enabled: true, baseUrl: '/api', tmdbEndpoint: '/tmdb' };
```

---

## 🧠 Jak funguje AI algoritmus

MůjFlix používá **lokální algoritmus** (`AIBrain`) pro doporučení — ne jen slepě AI chat. Bere v potaz:

- **Genre preferences** — co nejčastěji sleduješ (s časovým rozkladem)
- **Genre ID prefs** — TMDB IDs žánrů, které sleduješ
- **Liked genres** — co jsi označil v onboardingu
- **Watch momentum** — co jsi sledoval za posledních 7 dní (exponenciální decay)
- **Personal ratings signal** — tvá hodnocení epizod
- **Session genres** — co jsi sledoval v této session
- **Ratings** — co jsi hodnotil "loved" vs "meh"
- **Popularity** — TMDB rating s Bayesovskou korekcí
- **Freshness** — novější tituly mají boost
- **Recent views** — co jsi prohlížel v posledních 30 minutách

Vše se **učí per profil** a má **decay** — preference postupně vyprchávají, když profil nepoužíváš.

---

## 🛡 Soukromí

- **Žádný vlastní backend ani účty**. Aplikace je statická; jediný server je tvůj Cloudflare Worker (TMDB proxy a volitelně propojení zařízení).
- **Vše se ukládá do localStorage** tvého prohlížeče; při propojení zařízení se kopie dat uloží do tvého vlastního Cloudflare KV.
- **API klíče nikdy neopouští tvůj prohlížeč** — volání jdou přímo z klienta (nebo přes tvou Cloudflare proxy).
- **Profily jsou lokální** — PIN není skutečné zabezpečení, jen dětská pojistka.
- **Obrázky avatarů** se stahují z veřejných služeb (viz výše); posílá se jen hledaný název postavy.

---

## Struktura projektu

```
index.html, sw.js, manifest.webmanifest   vstup aplikace
config.js, config.example.js               konfigurace (v config.js jen veřejná adresa Workeru, žádné klíče)
CLAUDE.md                                  pravidla pro Clauda (spolupráce ve dvou)
css/        styles.css, patches.css, discover.css, netflix.css (Netflix vzhled, přepisuje ostatní)
js/         app.js, home.js, discover.js, cinema.js, dock.js
js/ai       brain.js (doporučovací algoritmus)
js/core     tmdb-proxy-shim.js, version.js, adblock.js, genres.js, sync.js + sync-ui.js (propojení zařízení), qr.js (generátor QR)
js/finder   finder.js (sestavení URL zdrojů)
js/profiles gate.js (profily, avatary, PIN zámek)
worker/     proxy Worker pro TMDB klíč + propojení zařízení (KV)
docs/       CHANGELOG.md, TASKS.md, SPOLUPRACE.md, css-vars.md
fonts/      Netflix Sans (woff2)
tests/ scripts/ icons/
```

## 🛠 Vývoj

**Bez buildu** — vše je vanilla JS, žádný bundler, žádný transpiler. Stačí upravit soubor a refreshnout prohlížeč.

### Verze
Zdroj pravdy je `package.json`. Soubor `js/core/version.js` se z něj **generuje automaticky** (před každým `npm test` a při bumpu) a číslo se ukazuje dole v **Nastavení** („MůjFlix v…“). Nové vydání:

```bash
npm run bump -- patch     # nebo minor / major / 2.4.0
```
Skript zvedne verzi, přegeneruje `js/core/version.js` a přidá prázdný nadpis do `docs/CHANGELOG.md`, který jen vyplníš.

### Cache
Service worker (`sw.js`) funguje „nejdřív síť, pak cache“, takže po nasazení dostane uživatel čerstvý kód. Parametry `?v=` v `index.html` zvedni u souboru, který jsi změnil (`app.js`, `cinema.js`, `home.js`, `discover.js`, CSS), ať se nepoužije stará verze z cache prohlížeče:

```html
<script src="js/app.js?v=9" defer></script>
```

### Testy a lint
```bash
npm install
npm test          # smoke + flows + discover (Playwright, Chromium)
npx eslint .
```
Testy běží offline – externí požadavky se blokují, TMDB data se podvrhují. Pokud Playwright nenajde prohlížeč, nastav `CHROMIUM_PATH` na binárku Chromia.

---

## 🤝 Přispívání

1. Forkni repo
2. Vytvoř branch (`git checkout -b feature/super-vec`)
3. Commitni změny (`git commit -m 'Přidána super věc'`)
4. Pushni (`git push origin feature/super-vec`)
5. Otevři Pull Request

**Konvence:**
- Kód v **angličtině** (názvy funkcí, proměnných)
- Komentáře v **češtině** (vysvětlení logiky)
- UI texty v **češtině**
- Před PR zkontroluj, že appka funguje na mobilu i desktopu

---

## 🙏 Poděkování

- **[TMDB](https://www.themoviedb.org/)** — metadata filmů a seriálů
- **AniList, Wikipedie, TVmaze, Fandom, Wikidata** — obrázky postav pro avatary
- **[qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)** (MIT) — QR kódy
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — hosting a API proxy
- **AI Agents** — programing

---

## ⚠️ Disclaimer

**MůjFlix je osobní tracker** — neposkytuje obsah, jen tě naviguje na **externí weby**. Některé odkazy (Bombuj, SvetSerialu, Prehrajto) mohou odkazovat na obsah, který nemusí být v souladu s autorským právem ve tvé jurisdikci. **Za používání je zodpovědný uživatel.** Aplikace **nehostuje žádný obsah** a **nestahuje videa**.

Pro legální sledování jsou v aplikaci integrované odkazy na **Netflix, Disney+, Max, Apple TV+, Prime Video, Voyo, Canal+** a další (přes TMDB Watch Providers).

---

<p align="center">
  <strong>🎬 MůjFlix</strong><br />
  <em>Protože sledovat jen tak bez plánu je barbarství.</em>
</p>

## Content-Security-Policy

`index.html` obsahuje CSP (meta tag). Kromě TMDB proxy obsahuje `connect-src` i služby pro avatary (AniList, Wikipedie, TVmaze, akabab.github.io, disneyapi.dev, Fandom, Wikidata) a uzi.la. Pokud nasadíš TMDB proxy na vlastní doméně (mimo `*.workers.dev` / `*.pages.dev`) nebo přidáš nový externí zdroj dat, doplň jeho doménu do `connect-src`, jinak ji prohlížeč zablokuje (v konzoli uvidíš „Refused to connect"). Hlavička `frame-ancestors` se v meta tagu nedá nastavit – případně ji přidej na hostingu.
