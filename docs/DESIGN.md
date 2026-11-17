# MůjFlix – designová pravidla

Cíl: aby UI nebylo „náhodné“. Hodnoty se **nepíšou čísly**, ale berou z tokenů. Nový prvek = vybrat, do které kategorie patří.

## Rohy (`border-radius`) – tokeny jsou na začátku `css/styles.css`

| Token | Hodnota | Kam patří |
|---|---|---|
| `--r-xs` | 2 px | drobnosti: lišty postupu, posuvníky, tenké proužky |
| `--r-ctl` | 4 px | **ovládací prvky**: tlačítka, vstupy, selecty, vyhledávání, přepínače |
| `--r-media` | 6 px | **postery, náhledy epizod, karty** |
| `--r-panel` | 8 px | malé panely: rozbalovací seznamy, trailer, popis v banneru, toasty |
| `--r-modal` | 12 px | okna a velké panely |
| `--r-sheet` | 16 px | spodní listy (mobil) a největší plochy |
| `--r-pill` | 999 px | chipy, štítky, odznaky (kolečka jsou `50%`) |

Pravidla:
1. Nikdy nepsat `border-radius: 10px` apod. – použít token (JS inline styly také `var(--r-…)`).
2. Vnořené prvky mají menší nebo stejný roh než rodič (karta 6 → tlačítko v ní 4).
3. `0` jen tam, kde je plocha schválně přilepená k okraji; kolečko je `50%`.
4. Prvky na stejné úrovni (např. tlačítko a select vedle sebe) mají vždy stejný token.

## Barvy – tokeny na začátku `css/styles.css`

| Token | Hodnota | Kam patří |
|---|---|---|
| `--c-bg` | #141414 | pozadí stránky |
| `--c-surface` | #1f1f1f | karty, panely, okna |
| `--c-surface-2` | #2a2a2a | zvýšené plochy, hover |
| `--c-line` / `--c-line-hi` | #333 / #3a3a3a | okraje a dělítka |
| `--c-text-2/3/4` | #d2d2d2 / #b3b3b3 / #808080 | hlavní popisy / vedlejší / nejslabší (čisté bílé je `#fff`) |
| `--c-accent` | #0a84ff | jediná hlavní modrá (aktivní stavy, odkazy, zvýraznění) |
| `--c-accent-hi` | #72b8ff | světlejší modrá pro text na tmavém |
| `--c-accent-a1/a2/a3` | modrá 15 / 30 / 55 % | výplně, záře, okraje |
| `--c-danger` | #ff453a | chyba, smazání |
| `--w-1…6` | bílá 6 / 10 / 18 / 35 / 60 / 85 % | jemné výplně (1), okraje (2), hover (3), text slabý/sekundární/téměř plný (4–6) |

Pravidla: nepsat barvy hexem ani `rgba(255,255,255,…)`; značková červená Netflixu `#e50914` a barva TMDB `#01b4e4` zůstávají jako výjimky. V JS (canvas ve Wrapped, inline styly) zatím zůstávají původní hodnoty.

## Animace – tokeny na začátku `css/styles.css`

| Token | Hodnota | Kam patří |
|---|---|---|
| `--t-fast` | 0,15 s | hover, změna barvy, drobné prvky |
| `--t-base` | 0,22 s | běžné prvky, prolnutí |
| `--t-slow` | 0,32 s | panely, obsah oken |
| `--t-xslow` | 0,45 s | velké plochy (banner, stránka) |
| `--ease-out` | cubic-bezier(.2,.7,.2,1) | vstup a pohyb (na konci zpomalí) |
| `--ease-spring` | cubic-bezier(.34,1.3,.64,1) | „odskok“ (tlačítka, karty, okna) |
| `--ease-std` | cubic-bezier(.4,0,.2,1) | pohyb tam i zpět |

Pravidla: nepsat `0.3s` ani vlastní `cubic-bezier`; nekonečné smyčky (spinner, pozadí) a zpoždění zůstávají v sekundách. JS časovače, které čekají na konec přechodu (`setTimeout(... 280)`), musí být ≥ délce přechodu. Ambientní animace (>0,6 s) a `prefers-reduced-motion` se nemění. Inline styly v JS zatím zůstávají v původních hodnotách.

## Tlačítka
- **Primární** (jedno na obrazovku): bílé, černý text, `--r-ctl`, výška 48 px (v menších oknech 44–46 px).
- **Sekundární**: plná šedá `rgba(109,109,110,.7)`, bílý text, `--r-ctl`.
- Play ikona na náhledu: šedý trojúhelník bez kolečka, při najetí zbělá.

## Rozbalovací seznamy
Vždy vlastní `mfEnhanceDropdown` (`js/app/core.js`), nikdy holý systémový `<select>` na viditelném místě.

## Postup při změně vzhledu
Změna tokenu mění všude naráz. Nové kategorie (barvy, mezery, písmo) se doplní do této tabulky, ať se nevymýšlí znovu.
