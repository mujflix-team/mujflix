# Spolupráce ve dvou (jednoduchý návod)

**Větve:** `Jablkooo` (Jakub) a `Jirulaso` (bratr). V `main` se nepracuje, z něj se staví ostrý web.

## Každodenní postup
1. Přepni se na svou větev (GitHub: tlačítko s názvem větve vlevo nahoře).
2. Řekni Claudovi: „Pracuju ve větvi X, přečti `docs/CLAUDE.md` a `docs/TASKS.md`.“
3. Nahraj změněné soubory: **Add file → Upload files**, dole zvol **Commit directly to the X branch**.
4. Vyzkoušej zkušební web větve (Cloudflare → Deployments, adresa `https://nazev-vetve.mujflix.pages.dev`).
5. Pull Request: **Pull requests → New pull request**, base `main` ← compare tvoje větev → **Create pull request**.
6. Druhý z vás si změny projde (Files changed) a dá **Merge pull request**.

## Než začneš novou práci
Aby ve větvi nebyly staré soubory, zasynchronizuj ji s `main`: na stránce své větve klikni na **Sync fork / Update branch**
(pokud je nabídnuto), nebo vytvoř Pull Request opačným směrem (base tvoje větev ← compare `main`) a slouč ho.

## Když GitHub hlásí konflikt
Znamená to, že jste oba upravili stejné místo. Neklikej na nic naslepo – pošli Claudovi text konfliktu a nech ho vyřešit.
