[README.md](https://github.com/user-attachments/files/32998882/README.md)
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
  - **Uzi.la** — alternativa
- **Legální streamingové služby** — přes TMDB Watch Providers aplikace zobrazí, kde je film/seriál legálně dostupný v ČR/SK:
  - Netflix, Disney+, Max (HBO), Apple TV+, Prime Video, SkyShowtime, Voyo, Canal+, O2 TV, Mall.TV, Crunchyroll a další
- **Více zdrojů na jedno kliknutí** — pokud jeden zdroj nefunguje, aplikace ti nabídne další
- **Cinema mód** — vestavěný přehrávač s výběrem sezóny a epizody, auto-next na další epizodu, přepínání zdrojů během přehrávání
- **Sandbox iframe** — blokuje popup reklamy ze zdrojů, tip na uBlock Origin
  
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

`tmdb-proxy.js` pak automaticky přesměruje všechna volání TMDB přes Worker a odstraní `api_key`. Worker povoluje jen GET, jen známé TMDB cesty, kontroluje Origin a cachuje odpovědi 1 hodinu.

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

7. V `app.js` zapni proxy:

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

- **Žádný backend**. Celá aplikace je statická.
- **Vše se ukládá do localStorage** tvého prohlížeče.
- **API klíče nikdy neopouští tvůj prohlížeč** — volání jdou přímo z klienta (nebo přes tvou Cloudflare proxy).
- **Profily jsou lokální** — PIN není skutečné zabezpečení, jen dětská pojistka.

---

## 🛠 Vývoj

**Bez buildu** — vše je vanilla JS, žádný bundler, žádný transpiler. Stačí upravit soubor a refreshnout prohlížeč.

### Verze
Číslo verze je na jediném místě v `core/version.js` (`window.MF_VERSION`) a ukazuje se dole v **Nastavení** („MůjFlix v…“) – uživatel i ty tak hned vidíš, jakou verzi má spuštěnou. Při vydání zvedni verzi **v `core/version.js` i v `package.json`** (test `npm test` hlídá, že se shodují) a doplň `CHANGELOG.md`.

### Cache
Service worker (`sw.js`) funguje „nejdřív síť, pak cache“, takže po nasazení dostane uživatel čerstvý kód. Parametry `?v=` v `index.html` zvedni u souboru, který jsi změnil (`app.js`, `cinema.js`, `home.js`, `discover.js`, CSS), ať se nepoužije stará verze z cache prohlížeče:

```html
<script src="app.js?v=9" defer></script>
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

`index.html` obsahuje CSP (meta tag). Pokud nasadíš TMDB proxy na vlastní doméně (mimo `*.workers.dev` / `*.pages.dev`) nebo přidáš nový externí zdroj dat, doplň jeho doménu do `connect-src`, jinak ji prohlížeč zablokuje (v konzoli uvidíš „Refused to connect"). Hlavička `frame-ancestors` se v meta tagu nedá nastavit – případně ji přidej na hostingu.
