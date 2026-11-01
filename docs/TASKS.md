# Úkoly a rozdělená práce

Zapiš sem, co děláš, ať se nepotkáte na stejných souborech. Po dokončení přesuň do „Hotovo“ a dopiš do `CHANGELOG.md`.

## Rozděláno
| Kdo | Větev | Co | Soubory |
|---|---|---|---|
| | | | |

## Další nápady / otevřené
- Rychlost: změřit v Chrome Lighthouse; velké soubory `js/app.js` (237 kB) a `css/styles.css` (187 kB, hodně přepsáno v `netflix.css`) – po změření rozdělit / odstranit mrtvé CSS.
- Service worker: celý „stale-while-revalidate“ zatím ne (hrozil by starý kód po opravě); písma už jdou z cache.
- Průhledný obdélník vlevo nahoře (nereprodukovatelný v headless Chromiu): zjistit prvek přes pravý klik → Prozkoumat.
- Ověřit, jestli NajSerialy.io nebrání vložení do iframe; pokud ano, označit zdroj jako `noEmbed`.
- Úklid dál: zbylé zmínky `.ps-tile-wrapper` v JS a inline stylech v `index.html`; starý přehrávač `cinema-legacy.js` (nejde jen smazat: `CINEMA_SOURCES`, `_cinState`, `openMovieInCinema` používají sections.js, finder.js, home.js a testy – nejdřív přesunout do nového přehrávače).
- Vyměnit TMDB klíč (starý byl v historii GitHubu) a nový dát jen do secretu ve Workeru.
- Nepoužitý kód: `getRatingSignalCached()` v `js/app/core.js` – buď zapojit do doporučování, nebo smazat. Dál `window.MFProfilesDB` v `js/app/profiles-util.js` (nikde není definované, vždy se použije `localStorage`) a pole `trakt: null` v profilu (`js/profiles/gate.js`) – buď dodělat, nebo smazat.
- Bezpečnost (dluh): CSP `script-src 'unsafe-inline'` kvůli inline `onclick` v generovaném HTML – postupně nahradit `addEventListener` a pak přepnout na `script-src 'self'`. Iframe přehrávače běží bez `sandbox` (hostingy ho detekují); zkusit užší `sandbox` zdroj od zdroje a ručně ověřit všechny 4 zdroje. Limity ve Workeru (`probeHits`, `srcHits`) jsou v paměti jedné instance; do KV až při skutečném zneužití (KV zápis na free tarifu max. 1000/den, každý požadavek jako zápis by kvótu vyčerpal). Opatření mimo kód: branch protection na `main`, ověřit hlavičky na securityheaders.com a observatory.mozilla.org.
- Případně přejmenovat workers.dev subdoménu (pak změnit `TMDB_PROXY_URL` v `config.js` a `ALLOWED_ORIGINS` ve Workeru).

## Hotovo
- 3.21.7: bezpečnostní audit: HSTS a COOP v `_headers`, zúžené `frame-src` v CSP (jen weby zdrojů a YouTube), bezpečnostní hlavičky odpovědí Workeru, smazaný nepoužitý režim `MF_PROXY`, `SECURITY.md`, Dependabot, upřesněné Soukromí.
- 3.21.6: cache service workeru podle verze aplikace (audit F).
- 3.21.5: Worker: CORS bez otevřeného výchozího stavu, limit těla a obnova platnosti dat (audit C1, C4, C5).
- 3.21.4: úklid po Finderu, AI klíčích a mrtvých funkcích (audit B2–B5, D2–D3).
- 3.21.3: srdíčko na kartě a [object Object] v Oblíbených (duplicitní mfhToggleFav), zahazování poškozených záznamů Oblíbených.
- 3.21.2: doporučení zvlášť pro každý profil, banner se neopakuje, víc a lepších podobných seriálů, verze schovaná na telefonu ve výběru profilu.
- 3.21.1: Oblíbené bez [object Object] a bez starého vyhledávacího dialogu, prolnutí banneru s pozadím, srdíčko podle TMDB ID, čeština vždy první.
- 3.21.0: README – poznámka, že nic není třeba spouštět lokálně, a provizorní screenshoty v `docs/screenshots/` (později nahradit skutečnými z mujflix.pages.dev).
- 3.21.0: přehrávač má skupiny zdrojů česky / zahraničí (dvě ikony), malé „Zdroj nejde“, nové zdroje Movy a Cinejoy (adresa z TMDB ID).
- 3.20.14: Podivana pryč, jednodušší lišta přehrávače, poslední zdroj zvlášť pro filmy a seriály, banner zešedne do černa.
- 3.20.13: README přepsáno podle skutečného kódu (jen dokumentace).
- 3.20.5: oprava schované horní lišty po reloadu.
- 3.20.4: řady úvodní stránky bez blikání, smazané mrtvé CSS, jednotná barva v Nastavení.
- 3.20.3: zavření přehrávače z odkazu /c/ vede na detail seriálu.
- 3.20.2: výběr profilu se po obnovení / odkazu přeskočí.
- 3.20.1: epizody v adrese, záloha v 404.html, banner bez probliknutí.
- 3.20: adresy `/s/`, `/f/`, `/c/<název>`, šipky u řady sezón.
- 3.17–3.18: obrazovka „Jsi offline“, banner pokaždé jiný, plynulé schování lišty v Procházení a zmenšení hlavičky seriálu, verze na výběru profilu až po najetí myší.
- 3.16: smazány skryté funkce (Premiéry, Kolekce, Nálada, Vzhled), úklid úvodní stránky a Oblíbených, hledání v liště Procházení, šipky u herců; audit v `docs/AUDIT.md`.
- 3.16.1: opravené názvy a obrázky epizod (doplnění z angličtiny, všechny sezóny), pryč ▶ na kartě Pokračovat.
- Sdílená paměť zdrojů mezi uživateli (Worker `/src/*`).
- Zaměření a žánry v menu profilu, přepínač „Jen anime“ (i při zakládání profilu).
- Věkové omezení profilu (Do 7/12/15) přes hodnocení z TMDB; ověřit na ostrém TMDB, jak přesná jsou US hodnocení u českých/anime titulů.
- Úklid 1–3: odstraněno staré dlaždicové menu (HTML, JS i CSS); vzhled beze změny.
- Paměť zdrojů a „Nefunguje to“ v kině, záloha dat do souboru, rychlejší start (defer CDN skriptů, lazy QR).
- Propojení zařízení (kód/QR, Worker + KV), třetí krok onboardingu, menu profilu, PIN zámek s eskalací, výběr avatarů z postav.
- Kontrola chyb: escapování adresy avataru (`js/profiles/gate.js`) a pojistka proti nekonečnému obnovování po synchronizaci (`js/core/sync.js`).
