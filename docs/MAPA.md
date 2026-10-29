# Mapa aplikace (sekce, okna, přechody)

Jedna kostra pro celou aplikaci. Když přidáváš novou obrazovku, řiď se pravidly dole.

## Kostra

| Vrstva | Prvek | Poznámka |
|---|---|---|
| Navigace (vždy vidět) | `#nfTop` (logo, hledání, profil) + `#mfDock` (Domů · Seriály · Filmy · Oblíbené · Profil) | PC: dock je vedle loga v horní liště, telefon: spodní lišta. Zůstává vidět v Procházení i v Oblíbených. |
| Sekce (obsah pod navigací) | `#mfSectionHome` (úvodní stránka), `#mfSectionProtebe` (starý kontejner Oblíbených) | Přepíná `mfShowSection`, `mfGoHome`, `mfShowHomeSection` |
| Obrazovky přes celou stránku | Procházení `#universeOverlay`, Oblíbené `#watchlistOverlay` | Smí být otevřená jen jedna. Otevření jedné zavře druhou. |
| Obrazovky bez navigace | Detail `#seriesModal`, přehrávač `#mfStandaloneCinema`, kalendář `#premiereOverlay`, kolekce `#collectionsOverlay`, nálada `#moodOverlay`, žánry `#genreEditorOverlay`, vzhled `#customizeOverlay`, „Zobrazit vše“ `#mfhSeeAllModal` | Zavírají se křížkem (vpravo nahoře, 44/40 px) a Esc |
| Okna | Propojení `#mfSyncModal`, Nastavení `#mfSettingsModal`, `#mfPrefsModal`, PIN `#mfPinModal`, menu profilu `#nfProfileMenu` | Křížek vpravo nahoře, tmavé pozadí, 8 px zaoblení |
| Úvod | Kdo se dívá `#mfProfileGate`, Nový profil `#mfProfileCreate`, Vítej `#mfProfileWelcome` | Před nimi je splash `#mfSplash` |
| Oznámení | `#mfUpdateBar` (nová verze), toasty `showToast` | |

## Přechody (kdo co otevírá a zavírá)

| Akce | Otevře | Zavře | Zvýrazněná záložka |
|---|---|---|---|
| Dock **Domů** / logo | úvodní stránka (`mfGoHome`) | Procházení, Oblíbené | Domů |
| Dock **Seriály** | Procházení typ `tv` (`mfDiscoverOpen('tv')`) | Oblíbené | Seriály |
| Dock **Filmy** | Procházení typ `movie` | Oblíbené | Filmy |
| Dock **Oblíbené** | Oblíbené (`openWatchlist`) | Procházení | Oblíbené |
| Lupa / klávesa `/` | Procházení typ `all` s kurzorem v hledání (`openSearch`) | Oblíbené | Domů |
| Chip v rychlém procházení | Procházení s typem / žánrem (`mfDiscoverOpen(typ, žánr)`) | – | podle typu |
| Karta (plakát) | Detail (`openDiscoverTv`) nebo přehrávač (`mfhOpenCard`) | – | beze změny |
| Přehrát | Přehrávač `MFCinemaPlayer.open` | – | beze změny |

Testy: `tests/flows.mjs` (blok „navigace“) projde každou dvojici záložek.

## Pravidla pro novou obrazovku

1. Přes celou stránku s navigací → stejná hlavička jako Procházení (okraje `--nf-pad`), křížek vpravo nahoře, zavře ostatní obrazovky.
2. Okno → křížek ze společného stylu (`.sy-x` / `.pf-x` vzor), zaoblení 8 px, `z-index` nad navigací.
3. Tlačítka 44 px (banner 48 px), zaoblení 4 px, karty a plakáty 6 px, vybraná položka bílá.
4. Žádné vodorovné posuvníky: použij šipky (`js/shell/polish.js` → `attachArrows`).
5. Žádné samy se hýbající prvky (dock nemizí, nic se samo nesbaluje).
