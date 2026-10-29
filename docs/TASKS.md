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
- Úklid dál: zbylé zmínky `.ps-tile-wrapper` v JS a inline stylech v `index.html`; mrtvé CSS po smazaných oknech (premiéry, kolekce, nálada, vzhled) a starý přehrávač `cinema-legacy.js`.
- Vyměnit TMDB klíč (starý byl v historii GitHubu) a nový dát jen do secretu ve Workeru.
- Případně přejmenovat workers.dev subdoménu (pak změnit `TMDB_PROXY_URL` v `config.js` a `ALLOWED_ORIGINS` ve Workeru).

## Hotovo
- 3.16: smazány skryté funkce (Premiéry, Kolekce, Nálada, Vzhled), úklid úvodní stránky a Oblíbených, hledání v liště Procházení, šipky u herců; audit v `docs/AUDIT.md`.
- 3.16.1: opravené názvy a obrázky epizod (doplnění z angličtiny, všechny sezóny), pryč ▶ na kartě Pokračovat.
- Sdílená paměť zdrojů mezi uživateli (Worker `/src/*`).
- Zaměření a žánry v menu profilu, přepínač „Jen anime“ (i při zakládání profilu).
- Věkové omezení profilu (Do 7/12/15) přes hodnocení z TMDB; ověřit na ostrém TMDB, jak přesná jsou US hodnocení u českých/anime titulů.
- Úklid 1–3: odstraněno staré dlaždicové menu (HTML, JS i CSS); vzhled beze změny.
- Paměť zdrojů a „Nefunguje to“ v kině, záloha dat do souboru, rychlejší start (defer CDN skriptů, lazy QR).
- Propojení zařízení (kód/QR, Worker + KV), třetí krok onboardingu, menu profilu, PIN zámek s eskalací, výběr avatarů z postav.
- Kontrola chyb: escapování adresy avataru (`js/profiles/gate.js`) a pojistka proti nekonečnému obnovování po synchronizaci (`js/core/sync.js`).
