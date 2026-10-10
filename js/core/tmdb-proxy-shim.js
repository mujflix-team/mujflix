/* MůjFlix — TMDB proxy shim.
 * Pokud je v config.js nastaveno window.TMDB_PROXY_URL, všechna volání
 * https://api.themoviedb.org/3/... se přesměrují na Cloudflare Worker,
 * který doplní API klíč na serveru. Klíč se tak nikdy nedostane do prohlížeče.
 * Musí se načíst PŘED js/app.js. */
(function () {
  "use strict";
  var proxy = (window.TMDB_PROXY_URL || "").replace(/\/+$/, "");
  if (!proxy) return;

  // Zástupná hodnota, aby kontroly "je klíč?" v kódu fungovaly. Není to platný klíč.
  if (!window.TMDB_KEY_DEFAULT) window.TMDB_KEY_DEFAULT = "via-proxy";
  window.MF_USING_TMDB_PROXY = true;

  var TMDB_PREFIX = "https://api.themoviedb.org/3";
  var nativeFetch = window.fetch.bind(window);

  function rewrite(url) {
    if (typeof url !== "string" || url.indexOf(TMDB_PREFIX) !== 0) return url;
    try {
      var u = new URL(url);
      u.searchParams.delete("api_key");
      return proxy + u.pathname + u.search;
    } catch (e) {
      return url;
    }
  }

  window.fetch = function (input, init) {
    if (typeof input === "string") return nativeFetch(rewrite(input), init);
    if (input && typeof input.url === "string" && input.url.indexOf(TMDB_PREFIX) === 0) {
      return nativeFetch(new Request(rewrite(input.url), input), init);
    }
    return nativeFetch(input, init);
  };
})();
