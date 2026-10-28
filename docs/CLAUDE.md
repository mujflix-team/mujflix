# MůjFlix – pravidla pro Clauda (platí pro všechny, kdo na projektu pracují)

Statická PWA (vanilla JS, bez buildu) pro sledování filmů a seriálů. Data z TMDB přes Cloudflare Worker, přehrávání přes cizí weby.
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
- Parametry `?v=` u skriptů v `index.html` zvedni u souboru, který jsi změnil.

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
