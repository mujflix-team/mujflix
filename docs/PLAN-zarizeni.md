# Plán na věci, které chtějí zařízení / rozhodnutí

Připraveno předem, aby šlo na PC rychle projít. Čísla jsou z kódu k 3.21.182.

## 1. Odstranit `cinema-bridge.js`
Mostem teď prochází jen: `series.js:81` (`openMovieInCinema`), `home.js:1397` (`openMovieInCinema`), `home.js:1764/1793` (`closeCinema`), `index.html:1426` (`mfhCloseCinema||closeCinema`) a obal v `cinema.js:1594`.
Kroky:
1. Nahradit volání `openMovieInCinema(id, title, type)` za `MFCinemaPlayer.open(id, title, type)` (včetně `cinType`/sezóna/díl, jak to dělá most dnes – zkopírovat logiku z mostu).
2. `closeCinema()` → `MFCinemaPlayer.close()`.
3. Smazat obal v `cinema.js:1594`, soubor `cinema-bridge.js` a jeho `<script>` v `index.html`.
4. `npm test` + ručně: spustit film z Domů, z Objevování, z Oblíbených a seriál z Pokračovat; zavřít křížkem i Esc.
Zkouška na zařízení: otevření a zavření ze všech tří míst, tlačítko Zpět na telefonu.

## 2. CSP bez `unsafe-inline` (po částech)
Inline handlery: 82× `onclick=` v `index.html`, 11× v `js`, dalších ~13 jiných (`onchange`, `oninput`, `onerror`, …). Nejčastější: `ProfileGate.pinInput` (11), `mfDiscoverOpen` (6), `submitRating` (4), `wlSetFilter` (3), `_sdTab` (3).
Postup po balíčcích (každý = vlastní PR, vždy `npm test`):
1. Zavést jednu delegaci: `document.addEventListener("click", …)` čtoucí `data-act="název"` + `data-arg`; mapa `ACTIONS` v nové `js/shell/actions.js`.
2. Přepsat balíček po balíčku (PIN, Objevování, hodnocení, filtr Oblíbených, záložky detailu, zbytek).
3. Až zbyde 0 inline handlerů (kontrola: `grep -c "on[a-z]*=\"" index.html` a v `js`), přepnout `script-src` bez `'unsafe-inline'` v `_headers` i `functions/_shared/og.js` (test je porovnává).
4. Na zařízení: projít PIN, Objevování, hodnocení, Oblíbené, detail, cinema.
Pozor: `onerror` na obrázcích je v generovaném HTML (např. hero) – nahradit capture listenerem na `error`.

## 3. Mrtvé CSS a velké soubory
`css/styles.css` ≈ 122 kB, všechny css ≈ 377 kB, hodně pravidel je přepsaných v `theme.css`/`patches.css`.
1. Změřit pokrytí: Chrome DevTools → Coverage na Domů, Objevování, detail, cinema, Nastavení (nebo Playwright `page.coverage`).
2. Mazat jen pravidla s nulovým pokrytím a ne-dynamická (třídy přidávané JS zkontrolovat grepem).
3. Po každém balíku `npm test` + vizuální kontrola dolního docku, hero a karet na telefonu.

## 4. Lighthouse
Spustit na nasazené verzi (mobil, simulovaná 4G), uložit skóre do `docs/`. Cíl: LCP hero obrázku, TBT. Teprve potom rozdělovat `app.js`.

## 5. NajSerialy a iframe
V DevTools Network u přehrávače zkontrolovat hlavičky `X-Frame-Options` / `Content-Security-Policy: frame-ancestors` odpovědi z najserialy.io. Pokud blokuje, nastavit `noEmbed: true` ve `TV_SOURCES` (`cinema.js`).

## 6. Průhledný obdélník vlevo nahoře
Na telefonu ho vyvolat, pravý klik / Inspect → zapsat třídu/id prvku; pak jde opravit cíleně.

## 7. Přihlášení ke zdrojům se neudrží
Iframe + cizí cookies. Možnosti: (a) u zdrojů v popup okně (Uzi.la, Movy, Cinejoy) přihlásit přímo tam, (b) v panelu Přihlášení ke zdrojům jen napsat, že přihlášení platí jen v okně zdroje. Doporučuji (b) hned, (a) zkusit na PC.

## 8. Uzi.la odscrollovat
Jde jen když Uzi.la nabízí kotvu (`#id`) na přehrávač. Zjistit na PC: otevřít titul, pravý klik na přehrávač → Inspect → id prvku; pak přidat `#id` do `uziMovieUrl`/`uziTvUrl`.
