# Inventura CSS proměnných

Generováno: `npm run css-vars`. **wins** = efektivní hodnota v `:root` (poslední; `!important` má přednost). **dead** = žádné použití v CSS/JS/HTML, **conflict** = různé hodnoty v několika `:root`.

| var | status | wins (efektivní) | values (:root) | css | js | html | defined_in |
|---|---|---|---|---|---|---|---|
| --border | conflict | rgba(84, 84, 88, 0.4) !important | rgba(84, 84, 88, 0.4) !important ; rgba(255,255,255,0.04) | 2 | 2 | 0 | styles.css:4672, styles.css:7056 |
| --glass | conflict | rgba(28, 28, 30, 0.95) !important | rgba(28, 28, 30, 0.95) !important ; rgba(12,12,22,0.86) | 9 | 0 | 0 | styles.css:4673, styles.css:7052 |
| --tv-card-r | conflict | 20px | 12px ; 20px | 1 | 0 | 0 | styles.css:7390, styles.css:7618 |
| --tv-header-h | conflict | 110px | 76px ; 110px | 2 | 0 | 0 | styles.css:7392, styles.css:7620 |
| --tv-px | conflict | 100px | 64px ; 100px | 3 | 0 | 0 | styles.css:7391, styles.css:7619 |
| --nf-bar-h | single | 68px | 68px | 5 | 0 | 0 | netflix.css:8, netflix.css:105[ctx] |
