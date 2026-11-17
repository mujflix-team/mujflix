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

## Tlačítka
- **Primární** (jedno na obrazovku): bílé, černý text, `--r-ctl`, výška 48 px (v menších oknech 44–46 px).
- **Sekundární**: plná šedá `rgba(109,109,110,.7)`, bílý text, `--r-ctl`.
- Play ikona na náhledu: šedý trojúhelník bez kolečka, při najetí zbělá.

## Rozbalovací seznamy
Vždy vlastní `mfEnhanceDropdown` (`js/app/core.js`), nikdy holý systémový `<select>` na viditelném místě.

## Postup při změně vzhledu
Změna tokenu mění všude naráz. Nové kategorie (barvy, mezery, písmo) se doplní do této tabulky, ať se nevymýšlí znovu.
