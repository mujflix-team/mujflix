# MůjFlix – pravidla pro Clauda (platí pro všechny, kdo na projektu pracují)

Statická PWA (vanilla JS; zdrojové soubory se neskládají, jen se při nasazení na Cloudflare Pages minifikují a dostanou hash v `?v=`) pro sledování filmů a seriálů. Data z TMDB přes Cloudflare Worker, přehrávání přes cizí weby.

**Web už není čistě statický:** složka `functions/` je Cloudflare Pages Function (cesty `/f/`, `/s/`, `/c/`). Běžný prohlížeč se jen pustí dál přes `context.next()` (beze změny, jako by funkce nebyla); jen boti chatů (Discord, WhatsApp, Telegram, Facebook, Slack, LinkedIn, X) dostanou kopii s `og:` tagy titulu z TMDB (přes Worker, s `Origin: https://mujflix.pages.dev`, jen cesty `/3/movie/<id>`, `/3/tv/<id>`, `/3/search/...`, bez klíče). Sdílená logika je v `functions/_shared/og.js`, test v `tests/functions.mjs` (součást `npm test`). Odpovědi, které funkce sama vytváří (pro boty), nemají hlavičky z `_headers`, proto je `SECURITY_HEADERS` v `og.js` kopie bloku `/*` z `_headers` (test hlídá shodu: změníš-li jedno, změň i druhé). Co se do HTML vkládá, se escapuje; obrázek smí být jen z `image.tmdb.org`.
Podrobnosti o struktuře a funkcích jsou v `README.md`, historie změn v `docs/CHANGELOG.md`, rozdělená práce v `docs/TASKS.md`.

## Kdo je Jakub a jak s ním mluvit
- Jakub (Jablkooo) je majitel, mluví česky, neformálně, s překlepy. Chce **krátké odpovědi** a minimální cílené úpravy, ne přepisy. Neplýtvej tokeny: žádné recapy kroků, žádné dlouhé návrhy.
- Pull requesty merguje **on sám**. Ty je jen otevřeš (vždy proti `main`) a pošleš krátce shrnutí. Nikdy nemerguj ani nepushuj do `main`.
- Když něco nejde ověřit bez jeho zařízení (telefon, PC, ostrý web), řekni to a napiš, co má zkusit.
- Dělej rovnou, když je zadání jasné. Ptej se jen u věcí drahých na vrácení nebo nejednoznačných.
- UI **bez emoji** (profesionální vzhled). Povolené jsou typografické symboly ★ ✓ ✕ ♡. Výjimka: výběr avatarů profilu v `js/profiles/gate.js`.

## Před začátkem práce
1. Přečti `docs/TASKS.md` a posledních pár záznamů v `docs/CHANGELOG.md` – ať neděláš to, co už někdo dělá nebo udělal.
2. Pracuj jen ve vlastní větvi (ne v `main`). Před prací si stáhni nejnovější `main` do své větve. Cizí rozdělanou práci nepřepisuj.
3. Pokud se úkol kryje s položkou v `docs/TASKS.md`, kterou dělá někdo jiný, zastav se a řekni to.

## Jak se pracuje
- Odpovídej **česky a stručně**. UI texty jsou česky, názvy funkcí a proměnných anglicky, komentáře česky.
- Po každé úpravě spusť: `node --check` na změněné soubory, `npm test`, `npx eslint .` (testy potřebují `CHROMIUM_PATH`, viz README). Nic nenahrávej, dokud to neprojde.
- Každou změnu zapiš do `docs/CHANGELOG.md` (aktuální verze nahoře, jedna stručná odrážka).
- Po dokončení aktualizuj `docs/TASKS.md` (přesuň položku do „Hotovo“).
- Nový externí web nebo API musí být v CSP (`<meta http-equiv="Content-Security-Policy">` v `index.html`, `connect-src`).
- Pořadí skriptů a CSS v `index.html` je důležité (klasické `<script defer>`, globální proměnné, tmavý vzhled v `css/theme.css` přepisuje ostatní CSS přes `html body … !important`).
- Parametry `?v=` u skriptů v `index.html` zvedni u souboru, který jsi změnil (v repozitáři a testech zůstávají ruční; na Cloudflare Pages je při sestavení přepíše hash obsahu, viz `scripts/hash-assets.mjs`).

## Postup vydání změny (každý PR)
1. Nová větev z čerstvého `origin/main`.
2. `node scripts/version.mjs` po zvednutí `version` v `package.json` (synchronizuje `js/core/version.js`). Verze `3.21.x`, každý PR +1.
3. U změněných souborů zvedni `?v=` v `index.html`.
4. Odrážka do `docs/CHANGELOG.md` (`## 3.21.x`) a řádek do `docs/TASKS.md`.
5. `npm run lint` (zkontroluj návratový kód!), `export CHROMIUM_PATH=/usr/bin/google-chrome` a `npm test`. Testy trvají několik minut; `tests/flows.mjs` má časově závislé testy, při jednom pádu pusť znovu. Hláška „Minifikace selhala“ v výstupu je očekávaná.
6. Push, PR proti `main`, před odevzdáním ověř `git ls-remote --heads origin <větev>` (stop-hook občas hlásí nepushnuté commity falešně).
7. Při konfliktu verzí: `git checkout origin/main -- package.json js/core/version.js docs/CHANGELOG.md docs/TASKS.md`, znovu přidej vlastní záznam s novým číslem, `grep -rn '<<<<<<<'`.

## Důležité části kódu
- Spodní lišta `#mfDock` (`index.html`, `js/shell/dock.js`, `js/app/dock-overlays.js`): Domů, Objevovat, Pro tebe, Profil. Tlačítka `dockSeriale`/`dockFilmy` jsou skrytá a mapují se na Objevovat. Pořadí záložek swipe je v `js/shell/swipe-tabs.js`.
- Objevování: `js/pages/discover.js`, `css/discover.css` (hero, horní lišta se přepíná třídami `dv-over`/`dv-solid`).
- Zdroje přehrávání: `js/pages/cinema.js`. Worker `worker/tmdb-proxy.js` ověřuje dostupnost zdrojů (výsledek 30 min v cache; `SOFT_UNSURE` pro NajSerialy). **Worker nasazuje Jakub sám** (wrangler), PR ho nenasadí.
- Domů: `js/pages/home.js`, Oblíbené: `js/app/watchlist.js`, nastavení a Další: `js/profiles/prefs.js`.

## CSP
- Aktuálně `script-src 'self' 'unsafe-inline'` a v `index.html` jsou inline `onclick` a 2 inline skripty. Odebrání `'unsafe-inline'` bez převodu všech handlerů aplikaci rozbije. Takovou změnu dělej po částech a vždy ověř v prohlížeči (dock, PIN, profily).
- `_headers` a `SECURITY_HEADERS` v `functions/_shared/og.js` musí zůstat shodné.

## Zakázáno
- **Nikdy** neukládej do repozitáře API klíče (TMDB ani jiné). `config.js` smí obsahovat jen `window.TMDB_PROXY_URL`. Klíče patří do Cloudflare Workeru jako secret.
- Nevkládej `node_modules`.
- Neimplementuj ovládání pro TV / dálkový ovladač.
- Neměň hlavní větev `main` přímo; změny jdou přes Pull Request.
- Neměň a nenasazuj Worker, neměň secrety ani nastavení Cloudflare; navrhni Jakubovi postup.
- Neměň `node_modules`, `package-lock.json` bez důvodu a nemaž cizí větve.
- Nepřidávej emoji do UI textů.

## Předání změn
- Dodávej jen změněné soubory a vždy vypiš jejich seznam (aby uživatel nemusel nahrávat všechno).
- Pokud posíláš zip: bez `config.js` a bez `node_modules`.

## Dohoda mezi dvěma vývojáři
- `Jablkooo` = Jakub, `Jirulaso` = bratr. Každý má svou větev stejného jména.
- Do `main` se spojuje přes Pull Request. Ostrý web (`mujflix.pages.dev`) se sestavuje z `main`.
- Než začneš větší úpravu, zapiš ji do `docs/TASKS.md`, ať se nepotkáte na stejném místě.
