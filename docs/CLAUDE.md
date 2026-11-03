# MůjFlix – pravidla pro Clauda (platí pro všechny, kdo na projektu pracují)

Statická PWA (vanilla JS, bez buildu) pro sledování filmů a seriálů. Data z TMDB přes Cloudflare Worker, přehrávání přes cizí weby.

**Web už není čistě statický:** složka `functions/` je Cloudflare Pages Function (cesty `/f/`, `/s/`, `/c/`). Běžný prohlížeč se jen pustí dál přes `context.next()` (beze změny, jako by funkce nebyla); jen boti chatů (Discord, WhatsApp, Telegram, Facebook, Slack, LinkedIn, X) dostanou kopii s `og:` tagy titulu z TMDB (přes Worker, s `Origin: https://mujflix.pages.dev`, jen cesty `/3/movie/<id>`, `/3/tv/<id>`, `/3/search/...`, bez klíče). Sdílená logika je v `functions/_shared/og.js`, test v `tests/functions.mjs` (součást `npm test`). Odpovědi, které funkce sama vytváří (pro boty), nemají hlavičky z `_headers`, proto je `SECURITY_HEADERS` v `og.js` kopie bloku `/*` z `_headers` (test hlídá shodu: změníš-li jedno, změň i druhé). Co se do HTML vkládá, se escapuje; obrázek smí být jen z `image.tmdb.org`.
Podrobnosti o struktuře a funkcích jsou v `README.md`, historie změn v `docs/CHANGELOG.md`, rozdělená práce v `docs/TASKS.md`.

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
- Pořadí skriptů a CSS v `index.html` je důležité (klasické `<script defer>`, globální proměnné, Netflix vzhled přepisuje ostatní CSS přes `html body … !important`).
- Parametry `?v=` u skriptů v `index.html` zvedni u souboru, který jsi změnil (v repozitáři a testech zůstávají ruční; na Cloudflare Pages je při sestavení přepíše hash obsahu, viz `scripts/hash-assets.mjs`).

## Zakázáno
- **Nikdy** neukládej do repozitáře API klíče (TMDB ani jiné). `config.js` smí obsahovat jen `window.TMDB_PROXY_URL`. Klíče patří do Cloudflare Workeru jako secret.
- Nevkládej `node_modules`.
- Neimplementuj ovládání pro TV / dálkový ovladač.
- Neměň hlavní větev `main` přímo; změny jdou přes Pull Request.

## Předání změn
- Dodávej jen změněné soubory a vždy vypiš jejich seznam (aby uživatel nemusel nahrávat všechno).
- Pokud posíláš zip: bez `config.js` a bez `node_modules`.

## Dohoda mezi dvěma vývojáři
- `Jablkooo` = Jakub, `Jirulaso` = bratr. Každý má svou větev stejného jména.
- Do `main` se spojuje přes Pull Request. Ostrý web (`mujflix.pages.dev`) se sestavuje z `main`.
- Než začneš větší úpravu, zapiš ji do `docs/TASKS.md`, ať se nepotkáte na stejném místě.
