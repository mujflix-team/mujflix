# Úkoly a rozdělená práce

Zapiš sem, co děláš, ať se nepotkáte na stejných souborech. Po dokončení přesuň do „Hotovo“ a dopiš do `CHANGELOG.md`.

## Rozděláno
| Kdo | Větev | Co | Soubory |
|---|---|---|---|
| | | | |

## Další nápady / otevřené
- Průhledný obdélník vlevo nahoře (nereprodukovatelný v headless Chromiu): zjistit prvek přes pravý klik → Prozkoumat.
- Ověřit, jestli NajSerialy.io nebrání vložení do iframe; pokud ano, označit zdroj jako `noEmbed`.
- Odstranit starý přehled dlaždic a natvrdo zapsaná data seriálů (`db`, `epsBySeason`) migrací dat – jen po domluvě.
- Vyměnit TMDB klíč (starý byl v historii GitHubu) a nový dát jen do secretu ve Workeru.
- Případně přejmenovat workers.dev subdoménu (pak změnit `TMDB_PROXY_URL` v `config.js` a `ALLOWED_ORIGINS` ve Workeru).

## Hotovo
- Propojení zařízení (kód/QR, Worker + KV), třetí krok onboardingu, menu profilu, PIN zámek s eskalací, výběr avatarů z postav.
- Kontrola chyb: escapování adresy avataru (`js/profiles/gate.js`) a pojistka proti nekonečnému obnovování po synchronizaci (`js/core/sync.js`).
