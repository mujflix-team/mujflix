# Jak přispět do MůjFlixu

Díky, že chceš pomoct. Projekt je záměrně **jednoduchý**: radši méně funkcí a menší kód než další tlačítko.

## Než začneš
1. Projdi `docs/CLAUDE.md` (pravidla projektu) a `docs/TASKS.md` (co je hotové a co se chystá).
2. U nápadu na novou funkci nejdřív otevři **Issue**, ať se domluvíme, jestli do appky patří.
3. Pracuj ve **vlastní větvi** (v `main` se nepracuje), viz `docs/SPOLUPRACE.md`.

## Pravidla pro změny
- Appka je statická, vanilla JS bez frameworku a bez build kroku.
- **Žádné API klíče a tajné údaje** v repozitáři. `config.js` smí obsahovat jen adresu Workeru (`window.TMDB_PROXY_URL`).
- Žádné nové zdroje videa a žádné ovládání pro TV/dálkový ovladač.
- Vzhled: jedna akcentní barva `#0a84ff`, plochý styl, zaoblení 12 px, bez záře a stínů.
- Komentáře v kódu česky, názvy proměnných a funkcí anglicky.
- Nový externí web, ze kterého se něco načítá, musí být v CSP (`_headers`).

## Před odesláním
```bash
node --check <změněný soubor>.js
npx eslint -c scripts/eslint.config.js .
npm test
```
A dále:
- zápis do `docs/CHANGELOG.md` (`node scripts/version.mjs patch` přidá šablonu) a řádek v `docs/TASKS.md` v části „Hotovo“,
- u změněného skriptu nebo CSS zvyš číslo `?v=` v `index.html`.

## Pull request
Vyplň šablonu (co se změnilo, jak to vyzkoušet) a počkej na kontrolu druhého člověka z týmu.
Chyby a nápady jde hlásit přes [Issues](https://github.com/mujflix-team/mujflix/issues), zranitelnosti podle `SECURITY.md`.

## Licence a písma
Repozitář zatím nemá volnou licenci: kód zůstává autorům a písmo Inter ve složce `fonts/` je pod licencí SIL OFL 1.1 (text v `fonts/Inter-OFL.txt`) a licence projektu se netýká.
