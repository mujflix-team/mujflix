# Changelog

## 2.1.0
### Opraveno
- Hodnocení ukládá žánry → AI se z hodnocení skutečně učí
- Otevření seriálu už nezkresluje žánrové preference
- Platnost „session“ žánrů vyprší po 6 h neaktivity
- Validace zdrojů: `evilbombuj.si` už neprojde jako `bombuj.si`
- Cinema „Přehrát“: správné escapování URL a názvu (XSS)
- Oblíbené: `__tmdbfav_*` položky se otevírají správně
- „Nedávno sledováno“ zobrazuje i seriály z Discoveru
- Avatar jako URL se v horní liště zobrazí jako obrázek
- Scroll-hide docku (chybějící CSS třída)
- `_getEnglishTitle` skutečně hledá anglický název přes TMDB
- Únik MutationObserveru v `openDiscoverTv`, neomezená `_nfCache`
- `AIBrain.save` hlásí plné úložiště

### Nově
- TMDB proxy (`tmdb-proxy.js` + `worker/`), API klíč mimo prohlížeč
- ESLint, smoke + funkční testy (Playwright), GitHub Actions CI
- Moduly: `ai/brain.js`, `profiles/gate.js`, `finder/finder.js` (app.js: 6019 → ~4900 řádků)

### Odstraněno
- Mrtvý kód, duplicitní načítání fontů

## 2.1.1
- XSS: jméno profilu, avatar a barva se escapují (výběr profilu, badge, tooltip, TMDB avatar picker)
- Odstraněn wrapper `setTimeout/setInterval`, který držel každé ID timeru v paměti navždy
- `dock.js`: polling jen když je záložka viditelná (1 s místo 0,5 s)
