// Náhled odkazu /c/<název>?id=<TMDB ID> pro boty chatů; ostatní dostanou index.html (viz functions/_shared/og.js)
import { handle } from "../_shared/og.js";

export const onRequest = context => handle(context, "tv");
