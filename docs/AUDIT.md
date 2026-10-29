# Audit MůjFlix 3.15.0 (pohled nového uživatele)

Prošlo se: výběr profilu, úvodní stránka, Procházení (Seriály/Filmy/hledání), Oblíbené, Nastavení, detail seriálu, přehrávač – telefon (390 px) i PC (1440 px). Screenshoty z demo prostředí.

## Jak to vypadá a funguje teď

| Místo | Jak vypadá | Jak funguje | Hodnocení |
|---|---|---|---|
| Kdo se dívá? | Čistá, jedno „+ Přidat profil“, pod tím Upravit a Propojit zařízení | Dobře, jasné | ✅ dobré |
| Úvodní stránka | Velký banner (Přehrát / Do oblíbených), pod ním čipy Seriály · Filmy · žánry, řady | Banner je doporučený titul | ✅ vzhled, ⚠ viz níže |
| Spodní lišta / horní menu | Domů · Seriály · Filmy · Oblíbené · Profil | Seriály/Filmy otevřou Procházení | ✅ jasné |
| Procházení | Hledání + Filtry + křížek, pod tím další banner a řady „Trendy“ | Hledání, filtry, řazení, rok | ⚠ opakuje úvodní stránku |
| Oblíbené | Prázdný stav s „Objevovat“; jinak karty, 4 záložky, řazení | Funguje | ⚠ název × obsah |
| Nastavení | Okno „Nastavení / Profil“ se třemi položkami | Upravit profil, Zaměření a žánry, Propojení zařízení | ⚠ podnadpis „Profil“ je zbytečný |
| Detail seriálu | Tlačítka Přehrát / Náhodná / srdce, záložky Epizody · Podobné · Popis | Funguje | ✅ po nedávné úpravě dobré |
| Přehrávač | Lišta: název, epizody, akce | Po úpravě 1 řádek PC, 2 telefon | ✅ |

## Co je matoucí (od nejvážnějšího)

1. **Skryté nebo mrtvé funkce (~1 000 řádků kódu).**
   - *Kalendář premiér* (`premiere.js`, 128 řádků) a *Kolekce* (`collections.js`, 468) mají okno a zavírání, ale **žádné tlačítko, které je otevře**. Uživatel je nenajde.
   - *Nálada* se otevře jen klávesou `M` (na telefonu vůbec).
   - *Vzhled* (`customize.js`) má plovoucí tlačítko, které je skryté.
   - *Starý přehrávač* (`cinema-legacy.js`, 491 řádků) se pořád načítá jako záloha.
   - Důsledek: appka vypadá menší, než je, a kód je těžší na údržbu.
2. **Stejná věc na dvou místech.**
   - Čipy **Seriály / Filmy** na úvodní stránce dělají totéž co položky v menu.
   - **Rozkoukané** je na úvodní stránce („Pokračovat“) i v Oblíbených.
   - Řada **Oblíbené** je na úvodní stránce i jako samostatná sekce.
   - Procházení má druhý banner a řady, které se podobají úvodní stránce.
3. **Názvy.** „Oblíbené“ obsahuje všechno uložené (ne jen to, co se líbí); tlačítko v bannerech „Do oblíbených“. Netflix tomu říká „Můj seznam“.
4. **Hledání dvakrát.** V horní liště je lupa/pole a po otevření Procházení je hledání ještě jednou (na PC dokonce dvě pole pod sebou).
5. **Zvýraznění menu.** V Procházení zůstává svítit „Domů“, i když už člověk není doma.
6. **Nastavení je rozdělené** do několika oken (menu profilu, Nastavení, Zaměření a žánry, Propojení, Vzhled), každé s jiným vzhledem a jiným křížkem.
7. **První kroky.** Po vytvoření profilu není jasné, co dál; chybí krátké vysvětlení „klepni na srdíčko, aby si appka zapamatovala vkus“.
8. **Příliš mnoho voleb najednou** v Oblíbených (4 záložky + řazení) a v Procházení (typ, žánry, řazení, rok).

## Co funguje dobře (nechat)

- Jednotný tmavý styl, jedna akcentová barva, ploché tlačítka.
- Detail seriálu se záložkami a Popis (děj, trailer, herci).
- „Pokračovat ve sledování“ s ▶ a výběrem epizod.
- Přehrávač, zdroje, propojení zařízení, offline stránka.

## Návrh

**Zásada: jedna věc = jedno místo = jeden název.**

1. **Skryté funkce rozhodnout:** buď je vystavit (kalendář premiér a nálada jako malé čipy/„Co dnes?“), nebo smazat. Doporučuji vystavit jen nálada („Na co mám náladu?“) a premiéry jako řadu „Brzy“, kolekce a Vzhled smazat.
2. **Smazat starý přehrávač** (`cinema-legacy.js`), pokud žádný test nezávisí na záloze.
3. **Sloučit stejné věci:**
   - čipy Seriály/Filmy z úvodní stránky pryč (nechat jen žánry),
   - záložku Rozkoukané z Oblíbených pryč (je na úvodní stránce),
   - řadu „Oblíbené“ na úvodní stránce nechat, ale pojmenovat stejně jako sekci.
4. **Přejmenovat Oblíbené → Můj seznam** (i tlačítko „Do mého seznamu“); záložky jen Vše / Filmy / Seriály.
5. **Procházení zjednodušit:** jedno hledání, bez druhého banneru; správně zvýrazňovat menu (Seriály/Filmy/Hledat).
6. **Nastavení do jednoho okna** se sekcemi (Profil · Zaměření · Zařízení), bez podnadpisu „Profil“.
7. **První spuštění:** jedna krátká hláška/tooltip („Klepni na srdíčko…“), po prvním použití zmizí.

Pořadí práce (od nejlevnějšího s největším efektem): 3 → 4 → 5 → 1/2 → 6 → 7.
