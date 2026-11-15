# Bezpečnost

## Jak nahlásit zranitelnost

Bezpečnostní nález prosím **nehlaš přes veřejný Issue**. Použij na GitHubu záložku **Security → Report a vulnerability** (soukromé hlášení, GitHub Security Advisories). Nález se opraví dřív, než se zveřejní.

Obyčejné chyby, nápady a dotazy patří dál do [Issues](https://github.com/mujflix-team/mujflix/issues).

## Co appka drží v bezpečí

- **Tajný TMDB klíč** není v repozitáři ani v prohlížeči. Je jen jako secret Cloudflare Workeru (`worker/tmdb-proxy.js`); `config.js` smí obsahovat jen adresu Workeru.
- Zdroje videa se **jen odkazují nebo vkládají**, appka je nijak neproxuje ani nestahuje. Vkládání do rámečku povoluje CSP (`frame-src`) jen pro pevný seznam webů.
- Texty z TMDB a dalších zdrojů se do stránky vkládají přes `escapeHTML()`.
- Propojení zařízení používá dlouhé náhodné ID a Worker kontroluje `Origin`, velikost těla a počet pokusů.

## Co není bezpečnostní hranice

- **PIN profilu a věkové omezení** jsou pojistka pro domácí použití (děti, sourozenci), ne ochrana před technicky zdatným uživatelem stejného zařízení. Data jsou čitelná v `localStorage`.
- Cizí weby ve zdrojích videa jsou mimo kontrolu appky (reklamy, vyskakovací okna). Doporučujeme blokátor reklam.

## Známé záměrné kompromisy

- CSP má `script-src 'unsafe-inline'`, protože appka používá inline `onclick` v generovaném HTML. Odstranění je dlouhodobý refaktoring (viz `docs/TASKS.md`).
- Iframe přehrávače běží bez `sandbox`, protože hostingy videa sandbox detekují a odmítají přehrávat.
